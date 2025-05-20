import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names with Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency based on country code
 */
export function formatCurrency(amount: number, currency: 'INR' | 'NGN' | 'USD'): string {
  const currencySymbols = {
    INR: '₹',
    NGN: '₦',
    USD: '$'
  };

  return `${currencySymbols[currency]}${amount.toLocaleString()}`;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and commas
  return Number(value.replace(/[₹₦$,]/g, ''));
}

/**
 * Format date as "Day, HH:MM AM/PM"
 */
export function formatMatchTime(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dateToCheck = new Date(date);
  dateToCheck.setHours(0, 0, 0, 0);
  
  let prefix = '';
  
  if (dateToCheck.getTime() === today.getTime()) {
    prefix = 'Today';
  } else if (dateToCheck.getTime() === tomorrow.getTime()) {
    prefix = 'Tomorrow';
  } else {
    prefix = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  return `${prefix}, ${timeStr}`;
}

/**
 * Validates a phone number for the given country code
 */
export function validatePhoneNumber(phoneNumber: string, countryCode: string): boolean {
  // Remove any non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Basic validation based on country code (can be enhanced)
  switch(countryCode) {
    case '+91': // India
      return cleanNumber.length === 10;
    case '+234': // Nigeria
      return cleanNumber.length === 10 || cleanNumber.length === 11;
    case '+1': // US
      return cleanNumber.length === 10;
    default:
      return cleanNumber.length >= 7 && cleanNumber.length <= 15;
  }
}

/**
 * Convert local time to UTC or vice versa
 */
export function convertToUTC(date: Date): Date {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

export function convertFromUTC(date: Date): Date {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
}

/**
 * Get remaining time (in seconds) until a future date
 */
export function getTimeRemainingInSeconds(futureDate: Date): number {
  const now = new Date();
  const diff = futureDate.getTime() - now.getTime();
  return Math.max(0, Math.floor(diff / 1000));
}

/**
 * Format remaining seconds to HH:MM:SS
 */
export function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
}

/**
 * Determine appropriate country codes based on browser language
 */
export function getDefaultCountryCode(): string {
  const language = navigator.language || 'en-US';
  
  // Simplified mapping based on common languages
  if (language.includes('en-IN') || language.includes('hi')) {
    return '+91'; // India
  } else if (language.includes('en-NG')) {
    return '+234'; // Nigeria
  } else {
    return '+1'; // Default to US
  }
}

/**
 * Validate PUBG/BGMI player ID format
 */
export function validateGameId(id: string, game: 'PUBG' | 'BGMI'): boolean {
  // Different validation rules for different games
  if (game === 'PUBG') {
    return /^\d{9,12}$/.test(id); // PUBG IDs are typically 9-12 digits
  } else {
    return /^\d{8,10}$/.test(id); // BGMI IDs are typically 8-10 digits
  }
}

/**
 * Get country based on country code
 */
export function getCountryFromCode(countryCode: string): string {
  switch(countryCode) {
    case '+91':
      return 'India';
    case '+234':
      return 'Nigeria';
    case '+1':
      return 'USA';
    default:
      return 'Other';
  }
}

/**
 * Get required KYC documents based on country
 */
export function getRequiredKycDocuments(country: string): string[] {
  switch(country) {
    case 'India':
      return ['Aadhaar Card', 'PAN Card', 'Voter ID (Optional)'];
    case 'Nigeria':
      return ['NIN', 'Voter ID', 'Passport (Optional)'];
    default:
      return ['Passport', 'Government ID'];
  }
}
