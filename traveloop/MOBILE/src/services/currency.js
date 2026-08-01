// Currency symbol map and formatting helpers.
// No conversion rates are bundled — currency conversion is not supported.

const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  AED: 'د.إ',
  SGD: 'S$',
  JPY: '¥',
};

export const formatCurrency = (amount, currency = 'USD') => {
  const value = Number(amount);
  if (Number.isNaN(value)) return '';
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
