/**
 * Calculate the time remaining in seconds from now until the target date
 * @param targetDate The target date to calculate time remaining to
 * @returns Number of seconds remaining
 */
export function getTimeRemainingInSeconds(targetDate: Date): number {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / 1000));
}

/**
 * Format time remaining in a human-readable format
 * @param timeInSeconds Time remaining in seconds
 * @returns Formatted time string (e.g., "2d 5h 30m")
 */
export function formatTimeRemaining(timeInSeconds: number): string {
  if (timeInSeconds <= 0) {
    return "0m";
  }
  
  const days = Math.floor(timeInSeconds / 86400);
  const hours = Math.floor((timeInSeconds % 86400) / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  
  let result = "";
  
  if (days > 0) {
    result += `${days}d `;
  }
  
  if (hours > 0 || days > 0) {
    result += `${hours}h `;
  }
  
  result += `${minutes}m`;
  
  return result;
}

/**
 * Format currency based on the currency code
 * @param amount The amount to format
 * @param currency The currency code (USD, INR, NGN)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbols = {
    USD: "$",
    INR: "₹",
    NGN: "₦"
  };
  
  const symbol = symbols[currency as keyof typeof symbols] || "$";
  
  return `${symbol}${amount.toLocaleString()}`;
}

/**
 * Get user-friendly match status text
 * @param status The original status string
 * @returns User-friendly status text
 */
export function getMatchStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    "upcoming": "Upcoming",
    "live": "Live Now",
    "completed": "Completed",
    "cancelled": "Cancelled",
    "postponed": "Postponed",
    "verifying": "Results Verifying"
  };
  
  return statusMap[status.toLowerCase()] || status;
}

/**
 * Check if a match is joinable based on its status and date
 * @param match The match object
 * @returns Boolean indicating if the match is joinable
 */
export function isMatchJoinable(match: { status: string, date: Date }): boolean {
  if (match.status !== "upcoming") {
    return false;
  }
  
  const matchDate = new Date(match.date);
  const now = new Date();
  
  // Match is joinable if it's in the future and within 24 hours
  const diffMs = matchDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return diffHours > 0 && diffHours <= 24;
}