import { EPlanMonthStatus } from './planning';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const STATUS_LABELS: Record<EPlanMonthStatus, string> = {
  [EPlanMonthStatus.PAST]: 'Encerrado',
  [EPlanMonthStatus.CURRENT]: 'Em curso',
  [EPlanMonthStatus.PROJECTION]: 'Projeção',
};

export interface IMonthLabel {
  name: string;
  short: string;
  year: string;
}

export const monthLabel = (monthKey: string): IMonthLabel => {
  const [year, month] = monthKey.split('-');
  const name = MONTH_NAMES[Number(month) - 1] ?? monthKey;
  return { name, short: name.slice(0, 3).toUpperCase(), year: year ?? '' };
};

export const periodLabel = (from: string, to: string): string => {
  const start = monthLabel(from);
  const end = monthLabel(to);
  return `${start.name} de ${start.year} — ${end.name} de ${end.year}`;
};

export const monthStatusLabel = (status: EPlanMonthStatus): string => STATUS_LABELS[status];

export const dueLabel = (dueDay: number | null, dueNote: string): string => {
  if (dueNote) {
    return dueNote;
  }
  if (dueDay === null) {
    return 'Sem dia definido';
  }
  return `Dia ${dueDay}`;
};

export const formatPercent = (value: number): string =>
  `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

export type TCommitmentLevel = 'default' | 'warning' | 'danger';

export const commitmentLevel = (value: number): TCommitmentLevel => {
  if (value > 100) {
    return 'danger';
  }
  if (value >= 80) {
    return 'warning';
  }
  return 'default';
};
