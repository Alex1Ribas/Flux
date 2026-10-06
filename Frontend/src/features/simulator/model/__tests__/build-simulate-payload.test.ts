import { buildSimulatePayload } from '../build-simulate-payload';
import {
  createDefaultSimulatorForm,
  type ISimulatorFormState,
} from '../simulator-form';
import { EDecisionMode } from '@/entities/decision/model/verdict';
import {
  formatMoneyInput,
  parseMoneyInput,
} from '@/shared/lib/money-input';

describe('When building hoje payload', () => {
  it('should map day available and expense without description', () => {
    const form: ISimulatorFormState = {
      ...createDefaultSimulatorForm(),
      day: '10',
      available: formatMoneyInput('80000'),
      expense: formatMoneyInput('20000'),
    };

    const payload = buildSimulatePayload(EDecisionMode.HOJE, form);

    expect(payload).toEqual({
      mode: EDecisionMode.HOJE,
      day: 10,
      available: 800,
      expense: 200,
    });
  });
});

describe('When parsing money input', () => {
  it('should convert masked BRL digits to reais', () => {
    const parsed = parseMoneyInput('R$ 1.500,00');

    expect(parsed).toEqual(1500);
  });
});

describe('When the available field is left empty', () => {
  it('should omit it so the API uses the free money of the month', () => {
    const payload = buildSimulatePayload(EDecisionMode.HOJE, {
      ...createDefaultSimulatorForm(),
      day: '10',
      expense: formatMoneyInput('3500'),
    });

    expect(payload).toEqual({ mode: EDecisionMode.HOJE, day: 10, available: undefined, expense: 35 });
  });
});
