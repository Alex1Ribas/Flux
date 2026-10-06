import { DomainError } from '../../common/errors/DomainError.js';
import { EErrorCode } from '../../common/errors/enums/EErrorCode.js';
import { formatMoney } from '../../common/helpers/money.helper.js';
import type { IPlanningService } from '../../planning/entity/interfaces/planning.service.interface.js';
import {
  EDecisionMode,
  EVerdictKind,
  type IDecisionContext,
  type IDecisionService,
  type IParamsSimulateDecision,
  type IParamsSimulateDecisionInput,
  type IVerdict,
  type IVerdictDetail,
} from '../entity/interfaces/decision.service.interface.js';
import {
  buildDecisionContext,
  buildVerdict,
  CARE_THRESHOLD,
  classifyAgainstFree,
  daysUntil,
  padDay,
  PROJECTION_MONTHS,
  resolveAvailable,
  toNonNegative,
} from './decision.helper.js';

export interface IParamsDecisionService {
  planningService: IPlanningService;
  now?: () => Date;
}

interface IInstallmentProjection {
  details: IVerdictDetail[];
  anyNegative: boolean;
  anyCare: boolean;
}

function parseSimulateDecisionInput(
  params: IParamsSimulateDecisionInput,
): IParamsSimulateDecision {
  const modes = Object.values(EDecisionMode) as string[];
  if (!params.mode || !modes.includes(params.mode)) {
    throw new DomainError(EErrorCode.VALIDATION_ERROR, 422);
  }
  return { ...params, mode: params.mode as EDecisionMode };
}

function projectInstallment(
  plannedFree: number,
  installment: number,
): IInstallmentProjection {
  const details: IVerdictDetail[] = [];
  let anyNegative = false;
  let anyCare = false;

  for (let month = 1; month <= PROJECTION_MONTHS; month += 1) {
    const freeAfter = plannedFree - installment;
    details.push({ label: `Mês ${month}`, value: formatMoney(freeAfter) });
    if (freeAfter < 0) {
      anyNegative = true;
    } else if (installment >= plannedFree * CARE_THRESHOLD) {
      anyCare = true;
    }
  }

  return { details, anyNegative, anyCare };
}

export class DecisionService implements IDecisionService {
  private readonly planningService: IPlanningService;
  private readonly now: () => Date;

  constructor({ planningService, now }: IParamsDecisionService) {
    this.planningService = planningService;
    this.now = now ?? (() => new Date());
  }

  async simulateDecision(
    userId: string,
    params: IParamsSimulateDecisionInput,
  ): Promise<IVerdict> {
    const input = parseSimulateDecisionInput(params);
    const plan = await this.planningService.getPlan(userId, { months: 1 });
    const context = buildDecisionContext(plan, this.now().getDate());

    if (input.mode === EDecisionMode.HOJE) {
      return this.decideToday(input, context);
    }
    if (input.mode === EDecisionMode.ALUGUEL) {
      return this.decideRent(input, context, context.reserveBalance);
    }
    if (input.mode === EDecisionMode.PARCELA) {
      return this.decideInstallment(input, context);
    }
    return this.decideCash(input, context);
  }

  private decideToday(input: IParamsSimulateDecision, context: IDecisionContext): IVerdict {
    const requestedDay = Number(input.day) || this.now().getDate();
    const day = Math.min(31, Math.max(1, requestedDay));

    const available = resolveAvailable(input.available, context.plannedFree);
    const expense = toNonNegative(input.expense);
    const remaining = available - expense;
    const untilIncome = daysUntil(day, context.nextIncomeDay);
    const untilBills = daysUntil(day, context.nextBillDay);
    const dailyAverage = untilIncome > 0 ? remaining / untilIncome : remaining;

    const details: IVerdictDetail[] = [
      { label: 'Livre antes', value: formatMoney(available) },
      { label: 'Livre depois', value: formatMoney(remaining) },
      {
        label: 'Próx. entrada',
        value: `Dia ${padDay(context.nextIncomeDay)} (${untilIncome}d)`,
      },
      {
        label: 'Próx. contas',
        value: `Dia ${padDay(context.nextBillDay)} (${untilBills}d)`,
      },
      { label: 'Média diária depois', value: formatMoney(dailyAverage) },
    ];

    if (expense <= 0) {
      return buildVerdict(
        EVerdictKind.INFO,
        'Informe o valor do gasto',
        'Aguardando',
        `Hoje é dia ${padDay(day)}. Digite quanto pretende gastar.`,
        details,
      );
    }

    const kind = classifyAgainstFree(expense, available);

    if (kind === EVerdictKind.BAD) {
      return buildVerdict(
        EVerdictKind.BAD,
        'Não recomendado',
        `Faltam ${formatMoney(Math.abs(remaining))}`,
        `O gasto de ${formatMoney(expense)} ultrapassa o livre de ${formatMoney(available)}. A reserva não é usada automaticamente.`,
        details,
      );
    }

    if (kind === EVerdictKind.WARN) {
      return buildVerdict(
        EVerdictKind.WARN,
        'Pode gastar, mas com cuidado',
        `Sobram ${formatMoney(remaining)}`,
        'O gasto consome 50% ou mais do dinheiro livre. Evite novos gastos até a próxima entrada.',
        details,
      );
    }

    return buildVerdict(
      EVerdictKind.OK,
      'Pode gastar',
      `Sobram ${formatMoney(remaining)} até a próxima entrada`,
      `Gastar ${formatMoney(expense)} deixa ${formatMoney(remaining)} até a entrada do Dia ${padDay(context.nextIncomeDay)}. Reserva intacta.`,
      details,
    );
  }

  private decideRent(
    input: IParamsSimulateDecision,
    context: IDecisionContext,
    reserveBalance: number,
  ): IVerdict {
    const rent = toNonNegative(input.rent);
    const otherExpenses = toNonNegative(input.otherExpenses);
    const ceiling =
      context.income - context.monthlyReserve - otherExpenses - context.minCushion;
    const monthlyRemaining =
      context.income - context.monthlyReserve - otherExpenses - rent;

    const details: IVerdictDetail[] = [
      { label: 'Teto recomendado', value: formatMoney(Math.max(0, ceiling)) },
      { label: 'Sobra após aluguel', value: formatMoney(monthlyRemaining) },
      { label: 'Reserva mensal', value: formatMoney(context.monthlyReserve) },
    ];

    if (ceiling <= 0) {
      return buildVerdict(
        EVerdictKind.BAD,
        'Sem margem para aluguel',
        'Ajuste outras contas',
        `Com renda ${formatMoney(context.income)}, reserva ${formatMoney(context.monthlyReserve)} e outras contas ${formatMoney(otherExpenses)}, não sobra colchão de ${formatMoney(context.minCushion)}.`,
        details,
      );
    }

    if (rent <= ceiling * 0.85) {
      return buildVerdict(
        EVerdictKind.OK,
        `Aluguel de ${formatMoney(rent)} é viável`,
        `Teto seguro: ${formatMoney(ceiling)}/mês`,
        `Cabe nas condições de hoje. Após aluguel + outras contas + reserva, sobram ${formatMoney(monthlyRemaining)}/mês.`,
        details,
      );
    }

    if (rent <= ceiling) {
      return buildVerdict(
        EVerdictKind.WARN,
        'Viável no limite',
        `Só ${formatMoney(monthlyRemaining)} de folga`,
        `O aluguel cabe no teto de ${formatMoney(ceiling)}, mas quase sem colchão.`,
        details,
      );
    }

    const deficit = rent - ceiling;
    const monthsCovered = Math.floor(reserveBalance / deficit);

    return buildVerdict(
      EVerdictKind.BAD,
      'Aluguel acima do sustentável',
      `Estoura ${formatMoney(deficit)}/mês`,
      `Máximo seguro é ${formatMoney(ceiling)}/mês. A reserva de ${formatMoney(reserveBalance)} cobriria o rombo por cerca de ${monthsCovered} meses — não é plano automático.`,
      details,
    );
  }

  private decideInstallment(input: IParamsSimulateDecision, context: IDecisionContext): IVerdict {
    const total = toNonNegative(input.total);
    const installmentCount = Math.max(1, Number(input.installments) || 1);
    const installment = total / installmentCount;
    const plannedFree = Math.max(0, context.plannedFree);
    const projection = projectInstallment(plannedFree, installment);
    const impact = `${installmentCount}x de ${formatMoney(installment)}`;

    const details: IVerdictDetail[] = [
      { label: 'Parcela estimada', value: formatMoney(installment) },
      { label: 'Livre planejado', value: formatMoney(plannedFree) },
      ...projection.details,
    ];

    if (total <= 0) {
      return buildVerdict(
        EVerdictKind.INFO,
        'Informe o valor',
        'Aguardando',
        'Digite o valor total para calcular a parcela.',
        details,
      );
    }

    if (projection.anyNegative) {
      return buildVerdict(
        EVerdictKind.BAD,
        'Não recomendado',
        impact,
        'A compra compromete um ou mais dos próximos 6 meses. A reserva não é usada automaticamente.',
        details,
      );
    }

    if (projection.anyCare) {
      return buildVerdict(
        EVerdictKind.WARN,
        'Pode gastar, mas com cuidado',
        impact,
        'A parcela cabe, mas consome 50% ou mais do livre mensal em algum mês.',
        details,
      );
    }

    return buildVerdict(
      EVerdictKind.OK,
      'Pode gastar',
      impact,
      `Todas as parcelas cabem nos próximos ${PROJECTION_MONTHS} meses sem estourar o livre.`,
      details,
    );
  }

  private decideCash(input: IParamsSimulateDecision, context: IDecisionContext): IVerdict {
    const value = toNonNegative(input.value);
    const installmentCount = Math.max(1, Number(input.installments) || 1);
    const available = resolveAvailable(input.available, context.plannedFree);
    const installment = value / installmentCount;
    const remainingCash = available - value;
    const plannedFree = Math.max(0, context.plannedFree);

    const details: IVerdictDetail[] = [
      { label: 'Livre antes', value: formatMoney(available) },
      { label: 'À vista → sobra', value: formatMoney(remainingCash) },
      {
        label: `Parcela ${installmentCount}x`,
        value: `${formatMoney(installment)}/mês`,
      },
    ];

    if (value <= 0) {
      return buildVerdict(
        EVerdictKind.INFO,
        'Informe o valor',
        'Aguardando',
        'Digite o valor da compra.',
        details,
      );
    }

    if (installmentCount <= 1) {
      return this.decideSinglePayment(value, available, remainingCash, details);
    }

    const projection = projectInstallment(plannedFree, installment);
    details.push(...projection.details);
    const impact = `${installmentCount}x de ${formatMoney(installment)}`;

    if (remainingCash < 0 || projection.anyNegative) {
      return buildVerdict(
        EVerdictKind.BAD,
        'Não recomendado',
        impact,
        'À vista ou as parcelas comprometem o livre presente ou futuro. Reserva intacta.',
        details,
      );
    }

    if (value >= available * CARE_THRESHOLD || projection.anyCare) {
      return buildVerdict(
        EVerdictKind.WARN,
        'Pode gastar, mas com cuidado',
        impact,
        'A compra cabe, mas consome grande parte do livre imediato ou mensal.',
        details,
      );
    }

    return buildVerdict(
      EVerdictKind.OK,
      'Pode gastar',
      `Sobram ${formatMoney(remainingCash)} à vista`,
      `À vista e as parcelas cabem sem estourar o livre nos próximos ${PROJECTION_MONTHS} meses.`,
      details,
    );
  }

  private decideSinglePayment(
    value: number,
    available: number,
    remainingCash: number,
    details: IVerdictDetail[],
  ): IVerdict {
    const kind = classifyAgainstFree(value, available);

    if (kind === EVerdictKind.BAD) {
      return buildVerdict(
        EVerdictKind.BAD,
        'Não recomendado',
        `Faltam ${formatMoney(Math.abs(remainingCash))}`,
        'À vista ultrapassa o livre. A reserva não é usada automaticamente.',
        details,
      );
    }

    if (kind === EVerdictKind.WARN) {
      return buildVerdict(
        EVerdictKind.WARN,
        'Pode gastar, mas com cuidado',
        `Sobram ${formatMoney(remainingCash)}`,
        'À vista consome 50% ou mais do dinheiro livre.',
        details,
      );
    }

    return buildVerdict(
      EVerdictKind.OK,
      'Pode gastar',
      `Sobram ${formatMoney(remainingCash)}`,
      'À vista cabe no dinheiro livre sem comprometer a reserva.',
      details,
    );
  }
}
