import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
  countryCode: text("country_code").notNull(),
  email: text("email"),
  password: text("password").notNull(),
  gameId: text("game_id"),
  gameMode: text("game_mode").notNull().default("PUBG"),
  role: text("role").notNull().default("player"),
  profilePicture: text("profile_picture"),
  kycStatus: text("kyc_status").notNull().default("not_submitted"),
  currency: text("currency").notNull().default("USD"),
  walletBalance: integer("wallet_balance").notNull().default(0),
  country: text("country").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tournament table
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  image: text("image").notNull(),
  mode: text("mode").notNull(),
  entryFee: integer("entry_fee").notNull(),
  prizePool: integer("prize_pool").notNull(),
  perKill: integer("per_kill").notNull(),
  date: timestamp("date").notNull(),
  map: text("map").notNull(),
  maxPlayers: integer("max_players").notNull(),
  registeredPlayers: integer("registered_players").notNull().default(0),
  status: text("status").notNull().default("upcoming"),
  roomDetails: jsonb("room_details"),
  results: jsonb("results"),
  gameMode: text("game_mode").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Match table
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull(),
  tournamentTitle: text("tournament_title").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull(),
  mode: text("mode").notNull(),
  map: text("map").notNull(),
  position: integer("position"),
  kills: integer("kills"),
  teamMembers: jsonb("team_members").notNull(),
  roomDetails: jsonb("room_details"),
  resultSubmitted: boolean("result_submitted").notNull().default(false),
  resultApproved: boolean("result_approved").notNull().default(false),
  resultScreenshot: text("result_screenshot"),
  prize: integer("prize"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Wallet transactions table
export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// KYC documents table
export const kycDocuments = pgTable("kyc_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  documentNumber: text("document_number").notNull(),
  frontImage: text("front_image").notNull(),
  backImage: text("back_image"),
  selfie: text("selfie"),
  status: text("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Squad members table
export const squadMembers = pgTable("squad_members", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  username: text("username").notNull(),
  gameId: text("game_id").notNull(),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Create Zod schemas for insert operations
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertTournamentSchema = createInsertSchema(tournaments).omit({ id: true });
export const insertMatchSchema = createInsertSchema(matches).omit({ id: true });
export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({ id: true });
export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({ id: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true });
export const insertSquadMemberSchema = createInsertSchema(squadMembers).omit({ id: true });

// Type definitions for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;

export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;

export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type SquadMember = typeof squadMembers.$inferSelect;
export type InsertSquadMember = z.infer<typeof insertSquadMemberSchema>;
