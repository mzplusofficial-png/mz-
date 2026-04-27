/**
 * Converts an amount from XAF to a target currency.
 * @param amount Amount in XAF (CFA Franc).
 * @param currency Target currency code (e.g., 'EUR', 'USD').
 * @param rates Currency rates relative to XAF.
 * @returns Converted amount.
 */
export function convertFromXAF(amount: number, currency: string, rates: Record<string, number>): number {
  if (currency === 'XAF' || !rates[currency]) return amount;
  return amount / rates[currency];
}

/**
 * Converts an amount from a target currency to XAF.
 * @param amount Amount in target currency.
 * @param currency Source currency code.
 * @param rates Currency rates relative to XAF.
 * @returns Amount in XAF.
 */
export function convertToXAF(amount: number, currency: string, rates: Record<string, number>): number {
  if (currency === 'XAF' || !rates[currency]) return amount;
  return amount * rates[currency];
}
