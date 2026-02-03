/**
 * Format a number as Euro currency
 */
export function formatEuro(value) {
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number with thousands separator
 */
export function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat('fr-BE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a percentage
 */
export function formatPercent(value, decimals = 2) {
  return new Intl.NumberFormat('fr-BE', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a percentage change with sign
 */
export function formatPercentChange(value, decimals = 2) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format indicator value based on type
 */
export function formatIndicatorValue(value, unit) {
  switch (unit) {
    case 'number':
      return formatNumber(value);
    case 'percent':
      return formatPercent(value);
    case 'euro':
      return formatEuro(value);
    case 'euro_per_capita':
      return `€${formatNumber(value, 2)}/hab`;
    default:
      return String(value);
  }
}
