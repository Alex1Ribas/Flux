export enum EDecisionMode {
  HOJE = 'hoje',
  ALUGUEL = 'aluguel',
  PARCELA = 'parcela',
  AVISTA = 'avista',
}

export enum EVerdictKind {
  OK = 'ok',
  WARN = 'warn',
  BAD = 'bad',
  INFO = 'info',
}

export interface IVerdictDetail {
  label: string;
  value: string;
}

export interface IVerdict {
  kind: EVerdictKind;
  title: string;
  impact: string;
  message: string;
  details: IVerdictDetail[];
}

export interface IParamsSimulateDecisionInput {
  mode?: string;
  day?: number;
  available?: number;
  expense?: number;
  description?: string;
  rent?: number;
  otherExpenses?: number;
  total?: number;
  installments?: number;
  value?: number;
}

export interface IParamsSimulateDecision
  extends Omit<IParamsSimulateDecisionInput, 'mode'> {
  mode: EDecisionMode;
}

export interface IDecisionContext {
  income: number;
  monthlyReserve: number;
  plannedFree: number;
  nextIncomeDay: number;
  nextBillDay: number;
  minCushion: number;
  reserveBalance: number;
}

export interface IDecisionService {
  simulateDecision(userId: string, params: IParamsSimulateDecisionInput): Promise<IVerdict>;
}
