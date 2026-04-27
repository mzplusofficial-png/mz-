import React, { useState, useEffect, useCallback } from 'react';
import { FALLBACK_RATES } from '../lib/currency/currencyRates.ts';
import { convertFromXAF, convertToXAF } from '../lib/currency/convertCurrency.ts';
import { formatCurrency } from '../lib/currency/formatCurrency.ts';
import { fetchExchangeRates } from '../lib/currency/exchangeService.ts';

const CURRENCY_STORAGE_KEY = 'mz_user_currency';
const RATES_STORAGE_KEY = 'mz_exchange_rates';
const RATES_TIMESTAMP_KEY = 'mz_exchange_rates_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useCurrency() {
  const [currency, setCurrency] = useState<string>('XAF');
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // 1. Detect currency from localStorage
    const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (savedCurrency) {
      setCurrency(savedCurrency);
    } else {
      // 2. Auto-detection (simple logic based on browser locale)
      const userLocale = navigator.language;
      const languages = navigator.languages || [userLocale];
      
      const findCurrency = () => {
        for (const lang of languages) {
          if (lang.includes('CD')) return 'CDF';
          if (lang.includes('MW')) return 'MWK';
          if (lang.includes('RW')) return 'RWF';
          if (lang.includes('TZ')) return 'TZS';
          if (lang.includes('UG')) return 'UGX';
          if (lang.includes('ZM')) return 'ZMW';
          if (lang.includes('NE') || lang.includes('SN') || lang.includes('CI') || lang.includes('BF') || lang.includes('ML') || lang.includes('TG') || lang.includes('BJ')) return 'XOF';
          if (lang.includes('GA') || lang.includes('CM') || lang.includes('TD') || lang.includes('CF') || lang.includes('GQ') || lang.includes('CG')) return 'XAF';
          if (lang.startsWith('en-US')) return 'USD';
          if (lang.startsWith('fr-FR') || lang.includes('EU')) return 'EUR';
        }
        return 'XAF';
      };

      setCurrency(findCurrency());
    }

    // 3. Load/Fetch rates
    const loadRates = async () => {
      const cachedRates = localStorage.getItem(RATES_STORAGE_KEY);
      const cachedTimestamp = localStorage.getItem(RATES_TIMESTAMP_KEY);
      const now = Date.now();

      if (cachedRates && cachedTimestamp && (now - parseInt(cachedTimestamp)) < CACHE_DURATION) {
        try {
          setRates(JSON.parse(cachedRates));
          return;
        } catch (e) {
          console.error('Error parsing cached rates:', e);
        }
      }

      setIsLoading(true);
      try {
        const freshRates = await fetchExchangeRates();
        if (freshRates) {
          setRates(freshRates);
          localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(freshRates));
          localStorage.setItem(RATES_TIMESTAMP_KEY, now.toString());
        }
      } catch (e) {
        console.warn('Failed to fetch fresh exchange rates, using fallback:', e);
        // We stay with FALLBACK_RATES or whatever was in state
      } finally {
        setIsLoading(false);
      }
    };

    loadRates();
  }, []);

  const updateCurrency = useCallback((newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
  }, []);

  const convertAndFormat = useCallback((amountXAF: number) => {
    const converted = convertFromXAF(amountXAF, currency, rates);
    const formatted = formatCurrency(converted, currency);
    const originalFormatted = formatCurrency(amountXAF, 'XAF');
    
    return {
      converted,
      formatted,
      originalFormatted,
      isXAF: currency === 'XAF',
      currency
    };
  }, [currency, rates]);

  const convertXAF = useCallback((amount: number, toCurrency: string) => {
    return convertFromXAF(amount, toCurrency, rates);
  }, [rates]);

  const fromCurrency = useCallback((amount: number, fromCurrency: string) => {
    return convertToXAF(amount, fromCurrency, rates);
  }, [rates]);

  return {
    currency,
    updateCurrency,
    convertAndFormat,
    convertXAF,
    fromCurrency,
    rates,
    isLoading
  };
}
