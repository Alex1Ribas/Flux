import {
  isValidBrazilianDate,
  parseBrazilianDate,
} from '../../../../../domain/common/helpers/date.helper.js';

describe('date.helper', () => {
  it('should parse valid brazilian date', () => {
    const date = parseBrazilianDate('15/03/2024');
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(2);
    expect(date.getDate()).toBe(15);
  });

  it('should reject invalid brazilian date', () => {
    expect(isValidBrazilianDate('32/13/2024')).toBe(false);
    expect(isValidBrazilianDate('')).toBe(false);
  });
});
