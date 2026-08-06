export type RegionCode = 'us' | 'in' | 'uk' | 'eu' | 'ca' | 'ae';

export interface CurrencyConfig {
  id: RegionCode;
  name: string;
  currencySymbol: string;
  currencyCode: string;
  exchangeRate: number; // relative to USD ($1 USD)
  flag: string;
}

export const CURRENCIES: Record<RegionCode, CurrencyConfig> = {
  us: { id: 'us', name: 'United States', currencySymbol: '$', currencyCode: 'USD', exchangeRate: 1, flag: '🇺🇸' },
  in: { id: 'in', name: 'India', currencySymbol: '₹', currencyCode: 'INR', exchangeRate: 85, flag: '🇮🇳' },
  uk: { id: 'uk', name: 'United Kingdom', currencySymbol: '£', currencyCode: 'GBP', exchangeRate: 0.78, flag: '🇬🇧' },
  eu: { id: 'eu', name: 'European Union', currencySymbol: '€', currencyCode: 'EUR', exchangeRate: 0.92, flag: '🇪🇺' },
  ca: { id: 'ca', name: 'Canada', currencySymbol: 'CA$', currencyCode: 'CAD', exchangeRate: 1.36, flag: '🇨🇦' },
  ae: { id: 'ae', name: 'United Arab Emirates', currencySymbol: 'AED ', currencyCode: 'AED', exchangeRate: 3.67, flag: '🇦🇪' },
};

export function formatPrice(amountInUSD: number, regionCode: RegionCode = 'us', decimals: number = 0): string {
  const config = CURRENCIES[regionCode] || CURRENCIES.us;
  const converted = amountInUSD * config.exchangeRate;

  if (regionCode === 'in') {
    const formattedNum = decimals > 0 
      ? converted.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : Math.round(converted).toLocaleString('en-IN');
    return `${config.currencySymbol}${formattedNum}`;
  }

  const formattedNum = decimals > 0
    ? converted.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(converted).toLocaleString('en-US');
  return `${config.currencySymbol}${formattedNum}`;
}
