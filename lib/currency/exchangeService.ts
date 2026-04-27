/**
 * Service to fetch real-time exchange rates.
 */

const API_URL = 'https://open.er-api.com/v6/latest/XAF';

export interface ExchangeRatesResponse {
  result: string;
  provider: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  rates: Record<string, number>;
}

/**
 * Fetches the latest exchange rates relative to XAF.
 * Note: The API returns rates as 1 XAF = X TargetCurrency.
 * Our system uses 1 TargetCurrency = X XAF.
 * So we need to invert the rates: 1 / rate.
 */
export async function fetchExchangeRates(): Promise<Record<string, number> | null> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    const data: ExchangeRatesResponse = await response.json();
    
    if (data.result === 'success' && data.rates) {
      const invertedRates: Record<string, number> = {};
      
      // We want rates relative to XAF (1 Target = X XAF)
      // API gives 1 XAF = X Target
      // So 1 Target = 1/X XAF
      Object.entries(data.rates).forEach(([code, rate]) => {
        if (rate > 0) {
          invertedRates[code] = 1 / rate;
        }
      });
      
      return invertedRates;
    }
    return null;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return null;
  }
}
