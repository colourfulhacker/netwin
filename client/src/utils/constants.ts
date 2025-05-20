// API URLs (simulated for now with localStorage)
export const API_BASE_URL = '/api';

// Game Maps
export const GAME_MAPS = [
  'Erangel',
  'Miramar',
  'Sanhok',
  'Vikendi',
  'Livik'
];

// Game Modes
export const GAME_MODES = [
  { value: 'SOLO', label: 'Solo' },
  { value: 'DUO', label: 'Duo' },
  { value: 'SQUAD', label: 'Squad' },
  { value: 'TDM', label: 'Team Deathmatch' }
];

// Country Codes
export const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳', currency: 'INR', symbol: '₹' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', currency: 'NGN', symbol: '₦' },
  { code: '+1', country: 'USA', flag: '🇺🇸', currency: 'USD', symbol: '$' },
  { code: '+44', country: 'UK', flag: '🇬🇧', currency: 'USD', symbol: '$' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', currency: 'USD', symbol: '$' },
  { code: '+86', country: 'China', flag: '🇨🇳', currency: 'USD', symbol: '$' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', currency: 'USD', symbol: '$' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', currency: 'USD', symbol: '$' },
  { code: '+971', country: 'UAE', flag: '🇦🇪', currency: 'USD', symbol: '$' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', currency: 'USD', symbol: '$' },
];

// Currency conversion rates (for simulation)
export const CURRENCY_CONVERSION = {
  'USD': 1,
  'INR': 0.012, // 1 INR = 0.012 USD
  'NGN': 0.00067 // 1 NGN = 0.00067 USD
};

// Min withdrawal amounts
export const MIN_WITHDRAWAL = {
  'INR': 100,
  'NGN': 500,
  'USD': 2
};

// Payment Methods by Country
export const PAYMENT_METHODS = {
  'India': ['UPI', 'Paytm', 'PhonePe', 'GooglePay', 'NetBanking', 'Card'],
  'Nigeria': ['Flutterwave', 'Paystack', 'Bank Transfer', 'Card'],
  'default': ['Stripe', 'PayPal', 'Card']
};

// KYC Document Types by Country
export const KYC_DOCUMENT_TYPES = {
  'India': [
    { value: 'aadhaar', label: 'Aadhaar Card' },
    { value: 'pan', label: 'PAN Card' },
    { value: 'voter', label: 'Voter ID' }
  ],
  'Nigeria': [
    { value: 'nin', label: 'NIN' },
    { value: 'voter', label: 'Voter ID' },
    { value: 'passport', label: 'Passport' }
  ],
  'default': [
    { value: 'passport', label: 'Passport' },
    { value: 'government_id', label: 'Government ID' }
  ]
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'netwin_auth_token',
  USER: 'netwin_user',
  THEME: 'netwin_theme',
  CURRENCY: 'netwin_currency',
  GAME_MODE: 'netwin_game_mode',
  TOURNAMENTS: 'netwin_tournaments',
  MATCHES: 'netwin_matches',
  NOTIFICATIONS: 'netwin_notifications',
  WALLET: 'netwin_wallet',
  TRANSACTIONS: 'netwin_transactions',
  LEADERBOARD: 'netwin_leaderboard',
  SQUAD: 'netwin_squad',
  KYC: 'netwin_kyc'
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_PHONE: 'Please enter a valid phone number for the selected country.',
  INVALID_OTP: 'Invalid OTP. Please try again.',
  INVALID_CREDENTIALS: 'Invalid login credentials.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  TOURNAMENT_JOIN_FAILED: 'Failed to join tournament. Please try again.',
  INSUFFICIENT_BALANCE: 'Insufficient wallet balance.',
  INVALID_AMOUNT: 'Please enter a valid amount.',
  MIN_WITHDRAWAL: 'Minimum withdrawal amount is required.',
  KYC_REQUIRED: 'KYC verification is required for withdrawal.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  MATCH_NOT_FOUND: 'Match not found.',
  TOURNAMENT_NOT_FOUND: 'Tournament not found.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  OTP_SENT: 'OTP sent successfully. Please check your phone.',
  LOGIN_SUCCESS: 'Login successful.',
  SIGNUP_SUCCESS: 'Signup successful.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  TOURNAMENT_JOINED: 'Tournament joined successfully.',
  MATCH_REGISTERED: 'Match registered successfully.',
  MONEY_ADDED: 'Money added to wallet successfully.',
  WITHDRAWAL_REQUESTED: 'Withdrawal requested successfully.',
  KYC_SUBMITTED: 'KYC documents submitted successfully.',
  RESULT_UPLOADED: 'Result uploaded successfully.'
};

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_INDIA: /^\d{10}$/,
  PHONE_NIGERIA: /^\d{10,11}$/,
  PHONE_US: /^\d{10}$/,
  GAME_ID_PUBG: /^\d{9,12}$/,
  GAME_ID_BGMI: /^\d{8,10}$/
};
