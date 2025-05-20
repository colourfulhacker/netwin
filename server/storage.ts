import { 
  users, 
  tournaments, 
  matches, 
  walletTransactions, 
  kycDocuments, 
  notifications, 
  squadMembers,
  type User,
  type InsertUser,
  type Tournament,
  type InsertTournament,
  type Match, 
  type InsertMatch,
  type WalletTransaction,
  type InsertWalletTransaction,
  type KycDocument,
  type InsertKycDocument,
  type Notification,
  type InsertNotification,
  type SquadMember,
  type InsertSquadMember
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string, countryCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Tournament operations
  getTournaments(): Promise<Tournament[]>;
  getTournament(id: number): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: number, data: Partial<Tournament>): Promise<Tournament | undefined>;
  deleteTournament(id: number): Promise<boolean>;
  
  // Match operations
  getMatches(): Promise<Match[]>;
  getMatch(id: number): Promise<Match | undefined>;
  getUserMatches(userId: number): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: number, data: Partial<Match>): Promise<Match | undefined>;
  
  // Wallet operations
  getUserTransactions(userId: number): Promise<WalletTransaction[]>;
  createTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  
  // KYC operations
  getUserKycDocuments(userId: number): Promise<KycDocument[]>;
  createKycDocument(document: InsertKycDocument): Promise<KycDocument>;
  updateKycDocument(id: number, data: Partial<KycDocument>): Promise<KycDocument | undefined>;
  getPendingKycDocuments(): Promise<KycDocument[]>;
  
  // Notification operations
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: number, data: Partial<Notification>): Promise<Notification | undefined>;
  markUserNotificationsAsRead(userId: number): Promise<boolean>;
  
  // Squad operations
  getUserSquadMembers(userId: number): Promise<SquadMember[]>;
  createSquadMember(member: InsertSquadMember): Promise<SquadMember>;
  deleteSquadMember(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private tournamentsMap: Map<number, Tournament>;
  private matchesMap: Map<number, Match>;
  private transactionsMap: Map<number, WalletTransaction>;
  private kycDocumentsMap: Map<number, KycDocument>;
  private notificationsMap: Map<number, Notification>;
  private squadMembersMap: Map<number, SquadMember>;
  
  private currentUserId: number;
  private currentTournamentId: number;
  private currentMatchId: number;
  private currentTransactionId: number;
  private currentKycDocumentId: number;
  private currentNotificationId: number;
  private currentSquadMemberId: number;
  
  constructor() {
    this.usersMap = new Map();
    this.tournamentsMap = new Map();
    this.matchesMap = new Map();
    this.transactionsMap = new Map();
    this.kycDocumentsMap = new Map();
    this.notificationsMap = new Map();
    this.squadMembersMap = new Map();
    
    this.currentUserId = 1;
    this.currentTournamentId = 1;
    this.currentMatchId = 1;
    this.currentTransactionId = 1;
    this.currentKycDocumentId = 1;
    this.currentNotificationId = 1;
    this.currentSquadMemberId = 1;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByPhoneNumber(phoneNumber: string, countryCode: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.phoneNumber === phoneNumber && user.countryCode === countryCode
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { ...user, id, createdAt: new Date(), walletBalance: 0 };
    this.usersMap.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.usersMap.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }
  
  // Tournament operations
  async getTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournamentsMap.values());
  }
  
  async getTournament(id: number): Promise<Tournament | undefined> {
    return this.tournamentsMap.get(id);
  }
  
  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const id = this.currentTournamentId++;
    const newTournament: Tournament = { ...tournament, id, createdAt: new Date() };
    this.tournamentsMap.set(id, newTournament);
    return newTournament;
  }
  
  async updateTournament(id: number, data: Partial<Tournament>): Promise<Tournament | undefined> {
    const tournament = this.tournamentsMap.get(id);
    if (!tournament) return undefined;
    
    const updatedTournament = { ...tournament, ...data };
    this.tournamentsMap.set(id, updatedTournament);
    return updatedTournament;
  }
  
  async deleteTournament(id: number): Promise<boolean> {
    return this.tournamentsMap.delete(id);
  }
  
  // Match operations
  async getMatches(): Promise<Match[]> {
    return Array.from(this.matchesMap.values());
  }
  
  async getMatch(id: number): Promise<Match | undefined> {
    return this.matchesMap.get(id);
  }
  
  async getUserMatches(userId: number): Promise<Match[]> {
    return Array.from(this.matchesMap.values()).filter(match => {
      const teamMembers = match.teamMembers as any[];
      return teamMembers.some(member => member.id === userId);
    });
  }
  
  async createMatch(match: InsertMatch): Promise<Match> {
    const id = this.currentMatchId++;
    const newMatch: Match = { ...match, id, createdAt: new Date() };
    this.matchesMap.set(id, newMatch);
    return newMatch;
  }
  
  async updateMatch(id: number, data: Partial<Match>): Promise<Match | undefined> {
    const match = this.matchesMap.get(id);
    if (!match) return undefined;
    
    const updatedMatch = { ...match, ...data };
    this.matchesMap.set(id, updatedMatch);
    return updatedMatch;
  }
  
  // Wallet operations
  async getUserTransactions(userId: number): Promise<WalletTransaction[]> {
    return Array.from(this.transactionsMap.values())
      .filter(transaction => transaction.userId === userId);
  }
  
  async createTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const id = this.currentTransactionId++;
    const newTransaction: WalletTransaction = { ...transaction, id, createdAt: new Date() };
    this.transactionsMap.set(id, newTransaction);
    
    // Update user's wallet balance
    const user = this.usersMap.get(transaction.userId);
    if (user) {
      let newBalance = user.walletBalance;
      
      if (transaction.type === 'deposit' || transaction.type === 'prize') {
        newBalance += transaction.amount;
      } else if (transaction.type === 'withdrawal' || transaction.type === 'entry_fee') {
        newBalance -= transaction.amount;
      }
      
      this.usersMap.set(user.id, { ...user, walletBalance: newBalance });
    }
    
    return newTransaction;
  }
  
  // KYC operations
  async getUserKycDocuments(userId: number): Promise<KycDocument[]> {
    return Array.from(this.kycDocumentsMap.values())
      .filter(document => document.userId === userId);
  }
  
  async createKycDocument(document: InsertKycDocument): Promise<KycDocument> {
    const id = this.currentKycDocumentId++;
    const newDocument: KycDocument = { ...document, id, createdAt: new Date() };
    this.kycDocumentsMap.set(id, newDocument);
    return newDocument;
  }
  
  async updateKycDocument(id: number, data: Partial<KycDocument>): Promise<KycDocument | undefined> {
    const document = this.kycDocumentsMap.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { ...document, ...data };
    this.kycDocumentsMap.set(id, updatedDocument);
    
    // Update user's KYC status if the document is approved or rejected
    if (data.status === 'approved' || data.status === 'rejected') {
      const user = this.usersMap.get(document.userId);
      if (user) {
        this.usersMap.set(user.id, { ...user, kycStatus: data.status });
      }
    }
    
    return updatedDocument;
  }
  
  async getPendingKycDocuments(): Promise<KycDocument[]> {
    return Array.from(this.kycDocumentsMap.values())
      .filter(document => document.status === 'pending');
  }
  
  // Notification operations
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notificationsMap.values())
      .filter(notification => notification.userId === userId);
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const newNotification: Notification = { ...notification, id, createdAt: new Date() };
    this.notificationsMap.set(id, newNotification);
    return newNotification;
  }
  
  async updateNotification(id: number, data: Partial<Notification>): Promise<Notification | undefined> {
    const notification = this.notificationsMap.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, ...data };
    this.notificationsMap.set(id, updatedNotification);
    return updatedNotification;
  }
  
  async markUserNotificationsAsRead(userId: number): Promise<boolean> {
    const userNotifications = await this.getUserNotifications(userId);
    
    for (const notification of userNotifications) {
      if (!notification.read) {
        this.notificationsMap.set(notification.id, { ...notification, read: true });
      }
    }
    
    return true;
  }
  
  // Squad operations
  async getUserSquadMembers(userId: number): Promise<SquadMember[]> {
    return Array.from(this.squadMembersMap.values())
      .filter(member => member.ownerId === userId);
  }
  
  async createSquadMember(member: InsertSquadMember): Promise<SquadMember> {
    const id = this.currentSquadMemberId++;
    const newMember: SquadMember = { ...member, id, createdAt: new Date() };
    this.squadMembersMap.set(id, newMember);
    return newMember;
  }
  
  async deleteSquadMember(id: number): Promise<boolean> {
    return this.squadMembersMap.delete(id);
  }
}

export const storage = new MemStorage();
