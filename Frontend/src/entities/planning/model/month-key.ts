export const shiftMonthKey = (monthKey: string, offset: number): string => {
  const [year, month] = monthKey.split('-').map(Number);
  const absolute = year * 12 + (month - 1) + offset;
  return `${Math.floor(absolute / 12)}-${String((absolute % 12) + 1).padStart(2, '0')}`;
};
