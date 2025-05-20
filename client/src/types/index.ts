// User Types
export interface User {
  id: number;
  username: string;
  phoneNumber: string;
  countryCode: string;
  email?: string;
  gameId?: string;
  gameMode: "PUBG" | "BGMI";
  role: "player" | "admin";
  profilePicture?: string;
  kycStatus: "pending" | "approved" | "rejected" | "not_submitted";
  currency: Currency;
  walletBalance: number;
  country: string;
  createdAt: string;
}

export type Currency = "INR" | "NGN" | "USD";

// Tournament Types
export interface Tournament {
  id: number;
  title: string;
  description?: string;
  image: string;
  mode: "SOLO" | "DUO" | "SQUAD" | "TDM";
  entryFee: number;
  prizePool: number;
  perKill: number;
  date: string;
  map: "Erangel" | "Miramar" | "Sanhok" | "Vikendi" | "Livik";
  maxPlayers: number;
  registeredPlayers: number;
  status: "upcoming" | "live" | "completed" | "cancelled";
  roomDetails?: RoomDetails;
  results?: TournamentResult;
  gameMode: "PUBG" | "BGMI";
}

export interface RoomDetails {
  roomId: string;
  password: string;
  visibleAt: string;
}

export interface TournamentResult {
  winners: TeamResult[];
  topKillers: KillerResult[];
}

export interface TeamResult {
  teamId: number;
  teamName: string;
  position: number;
  kills: number;
  prize: number;
}

export interface KillerResult {
  userId: number;
  username: string;
  kills: number;
  prize: number;
}

// Match Types
export interface Match {
  id: number;
  tournamentId: number;
  tournamentTitle: string;
  date: string;
  status: "upcoming" | "live" | "completed";
  mode: "SOLO" | "DUO" | "SQUAD" | "TDM";
  map: string;
  position?: number;
  kills?: number;
  teamMembers: TeamMember[];
  roomDetails?: RoomDetails;
  resultSubmitted: boolean;
  resultApproved: boolean;
  resultScreenshot?: string;
  prize?: number;
}

export interface TeamMember {
  id: number;
  username: string;
  gameId: string;
  profilePicture?: string;
  kills?: number;
  isOwner: boolean;
}

// Wallet Types
export interface WalletTransaction {
  id: number;
  userId: number;
  amount: number;
  type: "deposit" | "withdrawal" | "prize" | "entry_fee";
  status: "pending" | "completed" | "failed";
  details: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  amount: number;
  bankDetails: {
    accountNumber: string;
    ifsc?: string; // For India
    accountName: string;
    bankName: string;
    swiftCode?: string; // For international
  };
}

// KYC Types
export interface KycDocument {
  id: number;
  userId: number;
  type: string;
  documentNumber: string;
  frontImage: string;
  backImage?: string;
  selfie?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: "match" | "wallet" | "admin" | "promo";
  read: boolean;
  createdAt: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  userId: number;
  username: string;
  country: string;
  profilePicture?: string;
  matches: number;
  kills: number;
  wins: number;
  earnings: number;
  currency: Currency;
}

// Authentication Types
export interface LoginCredentials {
  phoneNumber: string;
  countryCode: string;
}

export interface OtpVerification {
  phoneNumber: string;
  countryCode: string;
  otp: string;
}

export interface SignupData {
  username: string;
  phoneNumber: string;
  countryCode: string;
  email?: string;
  gameId?: string;
  gameMode: "PUBG" | "BGMI";
}

// Admin Types
export interface AdminDashboardStats {
  totalUsers: number;
  activeTournaments: number;
  completedTournaments: number;
  totalRevenue: number;
  pendingKyc: number;
  recentTransactions: WalletTransaction[];
}
