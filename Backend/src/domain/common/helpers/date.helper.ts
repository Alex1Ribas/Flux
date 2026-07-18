import {
  endOfDay,
  isAfter,
  isValid,
  isWithinInterval,
  parse,
  startOfDay,
} from 'date-fns';

const DATE_FORMAT = 'dd/MM/yyyy';

export function parseBrazilianDate(dateString: string): Date {
  return parse(dateString, DATE_FORMAT, new Date());
}

export function isValidBrazilianDate(dateString: string): boolean {
  return isValid(parseBrazilianDate(dateString));
}

export function brazilianDateRange(
  startDate: string,
  endDate: string,
): { start: Date; end: Date } {
  return {
    start: startOfDay(parseBrazilianDate(startDate)),
    end: endOfDay(parseBrazilianDate(endDate)),
  };
}

export function isDateInBrazilianRange(
  dateString: string,
  range: { start: Date; end: Date },
): boolean {
  if (!dateString) return false;
  const date = parseBrazilianDate(dateString);
  if (!isValid(date)) return false;
  return isWithinInterval(date, range);
}

export function isStartAfterEnd(startDate: string, endDate: string): boolean {
  const { start, end } = brazilianDateRange(startDate, endDate);
  return isAfter(start, end);
}
