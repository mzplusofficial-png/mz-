/**
 * Formats a numeric amount into a currency string based on the locale and currency code.
 * @param amount Amount to format.
 * @param currency Currency code (e.g., 'XAF', 'EUR', 'USD').
 * @returns Formatted currency string.
 */
export function formatCurrency(amount: number, currency: string): string {
  const locale = currency === 'XAF' ? 'fr-FR' : 
                 currency === 'EUR' ? 'fr-FR' : 
                 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'XAF' ? 0 : 2,
    maximumFractionDigits: currency === 'XAF' ? 0 : 2,
  }).format(amount);
}
