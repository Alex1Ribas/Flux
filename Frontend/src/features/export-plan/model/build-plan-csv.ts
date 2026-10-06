import type { IPlan } from '@/entities/planning/model/planning';
import { monthLabel } from '@/entities/planning/model/month-label';

const escapeCell = (value: string | number): string =>
  `"${String(value).replaceAll('"', '""')}"`;

const decimal = (value: number): string =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false });

export const buildPlanCsv = (plan: IPlan): string => {
  const sourceHeaders = plan.incomeSources.flatMap((source) => [source.name, `% ${source.name}`]);
  const headers = [
    'Mês',
    'Renda',
    'Gastos',
    '% renda',
    ...sourceHeaders,
    'Sobra',
    'Reserva',
    'Livre',
    'Reserva acumulada',
  ];

  const rows = plan.months.map((month) => {
    const label = monthLabel(month.month);
    const sourceCells = plan.incomeSources.flatMap((source) => {
      const breakdown = month.sources.find((item) => item.sourceId === source.id);
      return [decimal(breakdown?.spend ?? 0), decimal(breakdown?.commitment ?? 0)];
    });
    return [
      `${label.name}/${label.year}`,
      decimal(month.income),
      decimal(month.spend),
      decimal(month.commitment),
      ...sourceCells,
      decimal(month.surplus),
      decimal(month.reserve),
      decimal(month.free),
      decimal(month.accumulatedReserve),
    ];
  });

  return [headers, ...rows].map((row) => row.map(escapeCell).join(';')).join('\n');
};
