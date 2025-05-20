export type Currency = "USD" | "INR" | "NGN";

export interface User {
  id: number;
  username: string;
  phoneNumber: string;
  countryCode: string;
  email: string | null;
  password: string;
  gameId: string | null;
  gameMode: string;
  profilePicture: string | null;
  walletBalance: number;
  kycStatus: string;
  role: string;
  createdAt: Date;
  country: string;
  currency: Currency;
}

export interface Tournament {
  id: number;
  title: string;
  map: string;
  mode: string;
  image: string;
  date: Date;
  gameMode: string;
  status: string;
  description: string | null;
  entryFee: number;
  prizePool: number;
  perKill: number;
  maxPlayers: number;
  registeredPlayers: number;
  createdAt: Date;
  results: any; // Tournament results
  roomDetails: any; // Room details
  currency: Currency;
}

export interface Match {
  id: number;
  tournamentId: number;
  tournamentTitle: string;
  userId: number;
  map: string;
  mode: string;
  date: Date;
  status: string;
  teamMembers: number[];
  position: number | null;
  kills: number | null;
  result: string | null;
  screenshot: string | null;
  prize: number | null;
  createdAt: Date;
  roomDetails: {
    roomId: string | null;
    roomPassword: string | null;
    startTime: Date;
  };
}

export interface WalletTransaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  status: string;
  details: string | null;
  createdAt: Date;
}

export interface KycDocument {
  id: number;
  userId: number;
  type: string;
  documentNumber: string;
  frontImage: string;
  backImage: string | null;
  selfie: string | null;
  status: string;
  rejectionReason: string | null;
  createdAt: Date;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

export interface SquadMember {
  id: number;
  ownerId: number;
  username: string;
  gameId: string;
  profilePicture: string | null;
  createdAt: Date;
}

export interface WithdrawalRequest {
  amount: number;
  accountNumber: string;
  accountType: string;
  accountName: string;
  ifscCode?: string;
  bankName?: string;
}

export interface LoginCredentials {
  phoneNumber: string;
  countryCode: string;
  password: string;
}

export interface SignupData {
  username: string;
  phoneNumber: string;
  countryCode: string;
  password: string;
  gameMode: "PUBG" | "BGMI";
  gameId?: string;
  currency: Currency;
  country: string;
}

export interface OtpVerification {
  phoneNumber: string;
  countryCode: string;
  otp: string;
}

export interface TournamentFilters {
  gameMode?: string;
  entryFee?: {
    min?: number;
    max?: number;
  };
  map?: string;
  date?: {
    from?: Date;
    to?: Date;
  };
  status?: string;
  currency?: Currency;
}