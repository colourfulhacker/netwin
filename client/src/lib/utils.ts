import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Types for currency
export type Currency = "USD" | "INR" | "NGN";

// Utility for merging Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency based on currency code
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  };
  
  return new Intl.NumberFormat('en-US', formatOptions).format(amount);
}

// Parse currency string to number
export function parseCurrency(value: string): number {
  // Remove currency symbols, commas and other non-numeric characters except decimal point
  const numericValue = value.replace(/[^0-9.]/g, '');
  return parseFloat(numericValue) || 0;
}

// Generate initials from username
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ');
  if (parts.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Format date to readable string
export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format time to readable string
export function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format match time (date and time together)
export function formatMatchTime(date: Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

// Get time remaining in seconds
export function getTimeRemainingInSeconds(targetDate: Date): number {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();
  return Math.max(0, Math.floor(difference / 1000));
}

// Format time remaining in human-readable format
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) {
    return "Started";
  }
  
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * 24 * 60 * 60;
  
  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * 60 * 60;
  
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

// Generate a random avatar URL based on username
export function generateAvatarUrl(username: string): string {
  const seed = encodeURIComponent(username);
  return `https://avatars.dicebear.com/api/bottts/${seed}.svg`;
}

// Convert file to base64 string
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Validate phone number format
export function validatePhoneNumber(phoneNumber: string): boolean {
  // Basic validation - can be expanded for country-specific rules
  return /^\d{10,15}$/.test(phoneNumber.replace(/[\s-]/g, ''));
}

// Validate game ID format
export function validateGameId(gameId: string, gameMode: string): boolean {
  if (!gameId) return false;
  
  // Different validation based on game mode
  if (gameMode === "PUBG") {
    // PUBG IDs are typically 8-10 digits
    return /^\d{8,10}$/.test(gameId);
  } else if (gameMode === "BGMI") {
    // BGMI IDs are typically 8-10 digits with possible letters
    return /^[A-Za-z0-9]{8,12}$/.test(gameId);
  }
  
  return false;
}

// Get default country code based on currency
export function getDefaultCountryCode(currency: Currency): string {
  switch (currency) {
    case "INR": return "+91"; // India
    case "NGN": return "+234"; // Nigeria
    case "USD": return "+1"; // US
    default: return "+1";
  }
}

// Get required KYC documents based on country
export function getRequiredKycDocuments(country: string): string[] {
  switch (country.toLowerCase()) {
    case "india":
      return ["Aadhaar Card", "PAN Card", "Driving License"];
    case "nigeria":
      return ["National ID Card", "BVN", "Driver's License"];
    default:
      return ["Passport", "National ID", "Driver's License"];
  }
}