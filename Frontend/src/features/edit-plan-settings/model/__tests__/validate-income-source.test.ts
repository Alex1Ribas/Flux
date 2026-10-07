import { validateIncomeSource } from '../validate-income-source';

describe('When validating a new income source', () => {
  it('should require a name and a pay day between 1 and 31', () => {
    expect(validateIncomeSource({ name: ' Salário ', payDay: '5', amount: 'R$ 2.000,00', isOneTime: true })).toEqual({
      ok: true,
      input: { name: 'Salário', payDay: 5, amount: 2000, isOneTime: true },
    });
    expect(validateIncomeSource({ name: 'Salário', payDay: '0', amount: '', isOneTime: false })).toEqual({
      ok: false,
      error: 'O dia do pagamento deve ser entre 1 e 31.',
    });
  });
});
