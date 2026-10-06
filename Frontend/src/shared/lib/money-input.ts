/** Converte string digitada (com ou sem máscara) em número (reais). */
export const parseMoneyInput = (raw: string): number => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) {
    return 0;
  }
  return Number(digits) / 100;
};

/** Formata valor em reais no padrão BRL com prefixo R$ (ex.: R$ 1.234,56). */
export const formatMoneyInput = (raw: string): string => {
  const value = parseMoneyInput(raw);
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

/** Formata número já conhecido em BRL. */
export const formatMoneyFromNumber = (value: number): string =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
