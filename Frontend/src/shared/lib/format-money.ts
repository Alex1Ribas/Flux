export const formatMoney = (value: number): string =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export const padDay = (day: number): string =>
  String(day).padStart(2, '0');
