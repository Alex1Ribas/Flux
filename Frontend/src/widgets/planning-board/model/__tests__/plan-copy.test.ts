import { chunk, gridColumns, sourceRuleNote } from '../plan-copy';

describe('When laying out the planning board', () => {
  it('should build rows, columns and the source rule note', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(gridColumns(375)).toEqual(1);
    expect(gridColumns(1280)).toEqual(3);
    expect(
      sourceRuleNote([
        { id: 's', name: 'Renda B', payDay: 20, amount: 2500 },
        { id: 'h', name: 'Renda A', payDay: 7, amount: 1000 },
      ]),
    ).toEqual(
      'Contas antes do dia 20 saem da Renda A; do dia 20 em diante (e as sem dia definido) saem da Renda B. Ajustes de valor ou de fonte valem só para o mês editado.',
    );
  });
});
