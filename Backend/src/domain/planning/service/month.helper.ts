const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export const PLAN_TIME_ZONE = 'America/Sao_Paulo';

export function isMonthKey(value: unknown): value is string {
  return typeof value === 'string' && MONTH_KEY_PATTERN.test(value);
}

export function addMonths(monthKey: string, offset: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  const absolute = year * 12 + (month - 1) + offset;
  const nextYear = Math.floor(absolute / 12);
  const nextMonth = (absolute % 12) + 1;
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
}

export function currentMonthKey(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PLAN_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  return `${year}-${month}`;
}

export function isMonthWithin(
  monthKey: string,
  startMonth: string,
  endMonth: string | null,
): boolean {
  if (monthKey < startMonth) {
    return false;
  }
  if (endMonth !== null && monthKey > endMonth) {
    return false;
  }
  return true;
}
