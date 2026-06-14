// Currency conversion service mock

const exchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.15,
  AED: 3.67,
  SGD: 1.34,
  JPY: 150.25,
};

const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  AED: 'د.إ',
  SGD: 'S$',
  JPY: '¥',
};

export const convertCurrency = (amount, from, to) => {
  if (from === to) return amount;
  
  // Convert to USD first (base), then to target
  const amountInUSD = amount / exchangeRates[from];
  return amountInUSD * exchangeRates[to];
};

export const formatCurrency = (amount, currency = 'USD') => {
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const getSupportedCurrencies = () => Object.keys(exchangeRates);
