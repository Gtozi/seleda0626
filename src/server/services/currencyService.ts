/**
 * Multi-currency support service
 * Handles currency conversion, exchange rates, and formatting
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isEnabled: boolean;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: string;
}

// Supported currencies
const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', decimalPlaces: 2, isEnabled: true },
  { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2, isEnabled: true },
  { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2, isEnabled: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2, isEnabled: false },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimalPlaces: 2, isEnabled: false },
];

// Default exchange rates (base: ETB)
const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  'ETB': 1.0,
  'USD': 0.0175, // 1 ETB = 0.0175 USD
  'EUR': 0.0162, // 1 ETB = 0.0162 EUR
  'GBP': 0.0139, // 1 ETB = 0.0139 GBP
  'AED': 0.0643, // 1 ETB = 0.0643 AED
};

class CurrencyService {
  private exchangeRates: Map<string, number> = new Map(Object.entries(DEFAULT_EXCHANGE_RATES));
  private effectiveDate = new Date().toISOString().split('T')[0];

  /**
   * Get all supported currencies
   */
  getCurrencies(): Currency[] {
    return SUPPORTED_CURRENCIES.filter(c => c.isEnabled);
  }

  /**
   * Get currency by code
   */
  getCurrency(code: string): Currency | undefined {
    return SUPPORTED_CURRENCIES.find(c => c.code === code);
  }

  /**
   * Get exchange rate between two currencies
   */
  getExchangeRate(fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return 1.0;
    
    const fromRate = this.exchangeRates.get(fromCurrency) || 1.0;
    const toRate = this.exchangeRates.get(toCurrency) || 1.0;
    
    // Convert through base currency (ETB)
    return toRate / fromRate;
  }

  /**
   * Convert amount from one currency to another
   */
  convert(amount: number, fromCurrency: string, toCurrency: string): number {
    const rate = this.getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }

  /**
   * Format amount with currency symbol
   */
  format(amount: number, currencyCode: string): string {
    const currency = this.getCurrency(currencyCode);
    if (!currency) return amount.toFixed(2);

    const formatted = amount.toFixed(currency.decimalPlaces);
    return `${currency.symbol}${formatted}`;
  }

  /**
   * Update exchange rates
   */
  updateExchangeRates(rates: Record<string, number>, effectiveDate?: string): void {
    Object.entries(rates).forEach(([code, rate]) => {
      this.exchangeRates.set(code, rate);
    });
    if (effectiveDate) {
      this.effectiveDate = effectiveDate;
    }
  }

  /**
   * Get all exchange rates
   */
  getExchangeRates(): ExchangeRate[] {
    const baseCurrency = 'ETB';
    return Array.from(this.exchangeRates.entries())
      .filter(([code]) => code !== baseCurrency)
      .map(([toCurrency, rate]) => ({
        fromCurrency: baseCurrency,
        toCurrency,
        rate,
        effectiveDate: this.effectiveDate,
      }));
  }

  /**
   * Validate if currency is supported
   */
  isCurrencySupported(code: string): boolean {
    return SUPPORTED_CURRENCIES.some(c => c.code === code && c.isEnabled);
  }
}

// Singleton instance
export const currencyService = new CurrencyService();
