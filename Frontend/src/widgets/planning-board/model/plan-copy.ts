import type { IIncomeSource } from '@/entities/planning/model/planning';

export const chunk = <TItem>(items: TItem[], size: number): TItem[][] => {
  const rows: TItem[][] = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
};

export const gridColumns = (width: number): number => {
  if (width >= 1080) {
    return 3;
  }
  if (width >= 700) {
    return 2;
  }
  return 1;
};

export const sourceRuleNote = (sources: IIncomeSource[]): string => {
  const byPayDay = [...sources].sort((left, right) => left.payDay - right.payDay);
  const parts = byPayDay.map((source, index) => {
    const next = byPayDay[index + 1];
    if (!next) {
      return `do dia ${source.payDay} em diante (e as sem dia definido) saem da ${source.name}`;
    }
    return `contas antes do dia ${next.payDay} saem da ${source.name}`;
  });
  if (parts.length === 0) {
    return 'Cadastre uma fonte de renda para distribuir as contas.';
  }
  const sentence = parts.join('; ');
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}. Ajustes de valor ou de fonte valem só para o mês editado.`;
};
