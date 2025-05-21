// Storage keys for local storage
export const STORAGE_KEYS = {
  USER: 'user',
  THEME: 'theme',
  AUTH_TOKEN: 'auth_token',
  COUNTRY: 'country',
  CURRENCY: 'currency'
};

// Currency conversion rates
export const CURRENCY_CONVERSION = {
  USD_TO_INR: 83.5,
  USD_TO_NGN: 1500,
  INR_TO_USD: 0.012,
  INR_TO_NGN: 18,
  NGN_TO_USD: 0.00067,
  NGN_TO_INR: 0.056
};

// Game modes
export const GAME_MODES_OBJECT = {
  PUBG: 'PUBG',
  BGMI: 'BGMI'
};

// Game modes as array for mapping
export const GAME_MODES = [
  { value: 'PUBG', label: 'PUBG' },
  { value: 'BGMI', label: 'BGMI' }
];

// Tournament modes
export const TOURNAMENT_MODES = [
  { value: 'Solo', label: 'Solo' },
  { value: 'Duo', label: 'Duo' },
  { value: 'Squad', label: 'Squad' }
];

// Tournament maps
export const TOURNAMENT_MAPS = [
  { value: 'Erangel', label: 'Erangel' },
  { value: 'Miramar', label: 'Miramar' },
  { value: 'Sanhok', label: 'Sanhok' },
  { value: 'Vikendi', label: 'Vikendi' },
  { value: 'Livik', label: 'Livik' }
];

// Game maps (alias for TOURNAMENT_MAPS for backward compatibility)
export const GAME_MAPS = TOURNAMENT_MAPS;

// Tournament status
export const TOURNAMENT_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed'
};

// Match status
export const MATCH_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed'
};

// Transaction types
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  PRIZE: 'prize',
  ENTRY_FEE: 'entry_fee',
  REFUND: 'refund'
};

// Transaction status
export const TRANSACTION_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  FAILED: 'failed'
};

// KYC status
export const KYC_STATUS = {
  NOT_SUBMITTED: 'not_submitted',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

// Notification types
export const NOTIFICATION_TYPES = {
  TOURNAMENT: 'tournament',
  MATCH: 'match',
  WALLET: 'wallet',
  KYC: 'kyc',
  WELCOME: 'welcome'
};

// Countries and currencies
export const COUNTRIES = [
  { 
    code: 'IN', 
    country: 'India', 
    flag: '🇮🇳', 
    currency: 'INR',
    symbol: '₹',
    countryCode: '+91'
  },
  { 
    code: 'NG', 
    country: 'Nigeria', 
    flag: '🇳🇬', 
    currency: 'NGN',
    symbol: '₦',
    countryCode: '+234'
  },
  { 
    code: 'US', 
    country: 'United States', 
    flag: '🇺🇸', 
    currency: 'USD',
    symbol: '$',
    countryCode: '+1'
  },
  { 
    code: 'GB', 
    country: 'United Kingdom', 
    flag: '🇬🇧', 
    currency: 'USD',
    symbol: '$',
    countryCode: '+44'
  },
  { 
    code: 'CA', 
    country: 'Canada', 
    flag: '🇨🇦', 
    currency: 'USD',
    symbol: '$',
    countryCode: '+1'
  }
];

// Country codes extracted for easier access
export const COUNTRY_CODES = COUNTRIES.map(country => ({
  code: country.countryCode,
  country: country.country,
  flag: country.flag
}));