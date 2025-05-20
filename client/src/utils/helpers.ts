import {
  STORAGE_KEYS,
  CURRENCY_CONVERSION,
  COUNTRY_CODES
} from "./constants";
import { User, Currency, Tournament, Match, WalletTransaction, Notification, LeaderboardEntry } from "@/types";

/**
 * Local Storage Management (for simulating backend)
 */

// Get stored user
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    return null;
  }
};

// Store user
export const storeUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

// Store auth token
export const storeAuthToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

// Get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

// Remove auth token (logout)
export const removeAuthToken = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Store preferred currency
export const storePreferredCurrency = (currency: Currency): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
};

// Get preferred currency
export const getPreferredCurrency = (): Currency => {
  return (localStorage.getItem(STORAGE_KEYS.CURRENCY) as Currency) || "USD";
};

// Store preferred game mode
export const storePreferredGameMode = (gameMode: "PUBG" | "BGMI"): void => {
  localStorage.setItem(STORAGE_KEYS.GAME_MODE, gameMode);
};

// Get preferred game mode
export const getPreferredGameMode = (): "PUBG" | "BGMI" => {
  return (localStorage.getItem(STORAGE_KEYS.GAME_MODE) as "PUBG" | "BGMI") || "PUBG";
};

/**
 * Tournament Data Management
 */

// Get tournaments from localStorage
export const getStoredTournaments = (): Tournament[] => {
  const tournamentsStr = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
  if (!tournamentsStr) return [];
  
  try {
    return JSON.parse(tournamentsStr) as Tournament[];
  } catch (error) {
    console.error("Failed to parse tournaments from localStorage", error);
    return [];
  }
};

// Store tournaments to localStorage
export const storeTournaments = (tournaments: Tournament[]): void => {
  localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
};

// Get a single tournament by ID
export const getTournamentById = (id: number): Tournament | undefined => {
  const tournaments = getStoredTournaments();
  return tournaments.find(t => t.id === id);
};

/**
 * Match Data Management
 */

// Get user matches from localStorage
export const getStoredMatches = (userId: number): Match[] => {
  const matchesStr = localStorage.getItem(STORAGE_KEYS.MATCHES);
  if (!matchesStr) return [];
  
  try {
    const allMatches = JSON.parse(matchesStr) as Match[];
    // Filter matches where the user is a team member
    return allMatches.filter(match => 
      match.teamMembers.some(member => member.id === userId)
    );
  } catch (error) {
    console.error("Failed to parse matches from localStorage", error);
    return [];
  }
};

// Store matches to localStorage
export const storeMatches = (matches: Match[]): void => {
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
};

// Get a single match by ID
export const getMatchById = (id: number): Match | undefined => {
  const matchesStr = localStorage.getItem(STORAGE_KEYS.MATCHES);
  if (!matchesStr) return undefined;
  
  try {
    const allMatches = JSON.parse(matchesStr) as Match[];
    return allMatches.find(m => m.id === id);
  } catch (error) {
    console.error("Failed to parse matches from localStorage", error);
    return undefined;
  }
};

/**
 * Wallet and Transactions
 */

// Get wallet transactions for a user
export const getUserTransactions = (userId: number): WalletTransaction[] => {
  const transactionsStr = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (!transactionsStr) return [];
  
  try {
    const allTransactions = JSON.parse(transactionsStr) as WalletTransaction[];
    return allTransactions.filter(t => t.userId === userId);
  } catch (error) {
    console.error("Failed to parse transactions from localStorage", error);
    return [];
  }
};

// Add new wallet transaction
export const addWalletTransaction = (transaction: WalletTransaction): void => {
  const transactions = getUserTransactions(transaction.userId);
  transactions.push(transaction);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  
  // Update user wallet balance
  const user = getStoredUser();
  if (user && user.id === transaction.userId) {
    if (transaction.type === 'deposit' || transaction.type === 'prize') {
      user.walletBalance += transaction.amount;
    } else if (transaction.type === 'withdrawal' || transaction.type === 'entry_fee') {
      user.walletBalance -= transaction.amount;
    }
    storeUser(user);
  }
};

/**
 * Notifications
 */

// Get notifications for a user
export const getUserNotifications = (userId: number): Notification[] => {
  const notificationsStr = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  if (!notificationsStr) return [];
  
  try {
    const allNotifications = JSON.parse(notificationsStr) as Notification[];
    return allNotifications.filter(n => n.userId === userId);
  } catch (error) {
    console.error("Failed to parse notifications from localStorage", error);
    return [];
  }
};

// Add new notification
export const addNotification = (notification: Notification): void => {
  const notifications = getUserNotifications(notification.userId);
  notifications.push(notification);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
};

// Mark notification as read
export const markNotificationAsRead = (userId: number, notificationId: number): void => {
  const notifications = getUserNotifications(userId);
  const updatedNotifications = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
};

/**
 * Leaderboard
 */

// Get leaderboard entries
export const getLeaderboardEntries = (filter: 'daily' | 'weekly' | 'monthly' = 'weekly', country?: string): LeaderboardEntry[] => {
  const leaderboardStr = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
  if (!leaderboardStr) return [];
  
  try {
    let entries = JSON.parse(leaderboardStr) as LeaderboardEntry[];
    
    // Filter by country if specified
    if (country) {
      entries = entries.filter(e => e.country === country);
    }
    
    // Sort by earnings (descending)
    return entries.sort((a, b) => b.earnings - a.earnings);
  } catch (error) {
    console.error("Failed to parse leaderboard from localStorage", error);
    return [];
  }
};

/**
 * Currency utilities
 */

// Convert amount from one currency to another
export const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
  if (from === to) return amount;
  
  // First convert to USD
  const amountInUSD = from === 'USD' ? amount : amount * CURRENCY_CONVERSION[from];
  
  // Then convert from USD to target currency
  return to === 'USD' ? amountInUSD : amountInUSD / CURRENCY_CONVERSION[to];
};

// Get currency symbol for a given country
export const getCurrencySymbol = (countryCode: string): string => {
  const country = COUNTRY_CODES.find(c => c.code === countryCode);
  return country ? country.symbol : '$';
};

// Get currency for a given country
export const getCurrencyForCountry = (countryCode: string): Currency => {
  const country = COUNTRY_CODES.find(c => c.code === countryCode);
  return (country ? country.currency : 'USD') as Currency;
};

/**
 * Authentication Simulation
 */

// Simulate OTP generation
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Simulate OTP verification
export const verifyOTP = (inputOTP: string, generatedOTP: string): boolean => {
  // For demo purposes, any 6-digit code works
  return inputOTP.length === 6 && /^\d{6}$/.test(inputOTP);
};

/**
 * Avatar utilities
 */

// Generate avatar URL from username
export const getAvatarUrl = (username: string): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6C3AFF&color=fff&size=200`;
};

/**
 * Tournament Sorting and Filtering
 */

// Sort tournaments by date (ascending or descending)
export const sortTournamentsByDate = (tournaments: Tournament[], ascending = true): Tournament[] => {
  return [...tournaments].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

// Filter tournaments by game mode
export const filterTournamentsByGameMode = (tournaments: Tournament[], gameMode: "PUBG" | "BGMI"): Tournament[] => {
  return tournaments.filter(t => t.gameMode === gameMode);
};

// Filter tournaments by status
export const filterTournamentsByStatus = (tournaments: Tournament[], status: Tournament['status']): Tournament[] => {
  return tournaments.filter(t => t.status === status);
};

// Filter tournaments by mode (SOLO, DUO, SQUAD, TDM)
export const filterTournamentsByMode = (tournaments: Tournament[], mode: Tournament['mode']): Tournament[] => {
  return tournaments.filter(t => t.mode === mode);
};

/**
 * Team Management
 */

// Get user's squad members
export const getSquadMembers = (userId: number): TeamMember[] => {
  const squadStr = localStorage.getItem(STORAGE_KEYS.SQUAD);
  if (!squadStr) return [];
  
  try {
    const allSquads = JSON.parse(squadStr) as Record<number, TeamMember[]>;
    return allSquads[userId] || [];
  } catch (error) {
    console.error("Failed to parse squad from localStorage", error);
    return [];
  }
};

// Add member to user's squad
export const addSquadMember = (userId: number, member: TeamMember): void => {
  const squadStr = localStorage.getItem(STORAGE_KEYS.SQUAD);
  let allSquads: Record<number, TeamMember[]> = {};
  
  if (squadStr) {
    try {
      allSquads = JSON.parse(squadStr);
    } catch (error) {
      console.error("Failed to parse squad from localStorage", error);
    }
  }
  
  const userSquad = allSquads[userId] || [];
  userSquad.push(member);
  allSquads[userId] = userSquad;
  
  localStorage.setItem(STORAGE_KEYS.SQUAD, JSON.stringify(allSquads));
};

// Remove member from user's squad
export const removeSquadMember = (userId: number, memberId: number): void => {
  const squadStr = localStorage.getItem(STORAGE_KEYS.SQUAD);
  if (!squadStr) return;
  
  try {
    const allSquads = JSON.parse(squadStr) as Record<number, TeamMember[]>;
    const userSquad = allSquads[userId] || [];
    
    allSquads[userId] = userSquad.filter(m => m.id !== memberId);
    localStorage.setItem(STORAGE_KEYS.SQUAD, JSON.stringify(allSquads));
  } catch (error) {
    console.error("Failed to parse squad from localStorage", error);
  }
};
