import { describe, it, expect } from '@jest/globals';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(amount, currency = 'USD') {
  if (amount == null || isNaN(amount)) return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

describe('formatDate', () => {
  it('returns empty for falsy input', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate(null)).toBe('');
  });

  it('formats valid ISO date', () => {
    const result = formatDate('2026-06-15');
    expect(result).toContain('2026');
    expect(result).toContain('Jun');
  });

  it('returns empty for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
});

describe('formatCurrency', () => {
  it('returns empty for null/undefined', () => {
    expect(formatCurrency(null)).toBe('');
    expect(formatCurrency(undefined)).toBe('');
  });

  it('formats USD by default', () => {
    expect(formatCurrency(100)).toContain('$');
  });

  it('formats EUR correctly', () => {
    const result = formatCurrency(50, 'EUR');
    expect(result).toContain('50');
  });
});