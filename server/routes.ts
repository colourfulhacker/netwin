import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertTournamentSchema,
  insertMatchSchema,
  insertWalletTransactionSchema,
  insertKycDocumentSchema,
  insertNotificationSchema,
  insertSquadMemberSchema
} from "@shared/schema";
import { z } from "zod";

// Helper function to validate request body against a schema
const validateBody = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: () => void) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phoneNumber, countryCode } = req.body;
      
      // Simulate OTP sending
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`OTP sent to ${countryCode} ${phoneNumber}: ${otp}`);
      
      res.status(200).json({ 
        message: "OTP sent successfully",
        otpSent: true
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phoneNumber, countryCode, otp } = req.body;
      
      // In a real app, we would verify OTP here
      // For demo, we'll assume OTP is valid if it's a 6-digit number
      if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({ message: "Invalid OTP format" });
      }
      
      // Check if user exists
      let user = await storage.getUserByPhoneNumber(phoneNumber, countryCode);
      
      // If not, create a new user (in real app, would redirect to signup)
      if (!user) {
        const mockCurrency = countryCode === "+91" 
          ? "INR" 
          : countryCode === "+234" 
          ? "NGN" 
          : "USD";
          
        const mockCountry = countryCode === "+91" 
          ? "India" 
          : countryCode === "+234" 
          ? "Nigeria" 
          : "Other";
          
        user = await storage.createUser({
          username: `Player${Math.floor(Math.random() * 10000)}`,
          phoneNumber,
          countryCode,
          password: "tempPassword", // In real app, would get from user
          gameMode: countryCode === "+91" ? "BGMI" : "PUBG",
          role: "player",
          kycStatus: "not_submitted",
          currency: mockCurrency,
          country: mockCountry,
          walletBalance: 0
        });
      }
      
      // Generate token (mock)
      const token = Math.random().toString(36).substring(2);
      
      res.status(200).json({
        message: "Login successful",
        user,
        token
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  app.post("/api/auth/signup", validateBody(insertUserSchema), async (req, res) => {
    try {
      const userData = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByPhoneNumber(
        userData.phoneNumber, 
        userData.countryCode
      );
      
      if (existingUser) {
        return res.status(400).json({ 
          message: "User with this phone number already exists" 
        });
      }
      
      // Check if username is taken
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ 
          message: "Username already taken" 
        });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Generate token (mock)
      const token = Math.random().toString(36).substring(2);
      
      res.status(201).json({
        message: "User created successfully",
        user,
        token
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = req.body;
      
      // Check if user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user
      const updatedUser = await storage.updateUser(id, userData);
      
      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Tournament routes
  app.get("/api/tournaments", async (req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      res.status(200).json(tournaments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tournaments" });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tournament = await storage.getTournament(id);
      
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      res.status(200).json(tournament);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tournament" });
    }
  });

  app.post("/api/tournaments", validateBody(insertTournamentSchema), async (req, res) => {
    try {
      const tournamentData = req.body;
      
      // Create tournament
      const tournament = await storage.createTournament(tournamentData);
      
      res.status(201).json({
        message: "Tournament created successfully",
        tournament
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create tournament" });
    }
  });

  app.patch("/api/tournaments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tournamentData = req.body;
      
      // Check if tournament exists
      const existingTournament = await storage.getTournament(id);
      if (!existingTournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      // Update tournament
      const updatedTournament = await storage.updateTournament(id, tournamentData);
      
      res.status(200).json({
        message: "Tournament updated successfully",
        tournament: updatedTournament
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update tournament" });
    }
  });

  app.delete("/api/tournaments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if tournament exists
      const existingTournament = await storage.getTournament(id);
      if (!existingTournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      // Delete tournament
      await storage.deleteTournament(id);
      
      res.status(200).json({ message: "Tournament deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tournament" });
    }
  });

  // Match routes
  app.get("/api/matches", async (req, res) => {
    try {
      const matches = await storage.getMatches();
      res.status(200).json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to get matches" });
    }
  });

  app.get("/api/matches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const match = await storage.getMatch(id);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      res.status(200).json(match);
    } catch (error) {
      res.status(500).json({ message: "Failed to get match" });
    }
  });

  app.get("/api/users/:userId/matches", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const matches = await storage.getUserMatches(userId);
      res.status(200).json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user matches" });
    }
  });

  app.post("/api/matches", validateBody(insertMatchSchema), async (req, res) => {
    try {
      const matchData = req.body;
      
      // Create match
      const match = await storage.createMatch(matchData);
      
      res.status(201).json({
        message: "Match created successfully",
        match
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create match" });
    }
  });

  app.patch("/api/matches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const matchData = req.body;
      
      // Check if match exists
      const existingMatch = await storage.getMatch(id);
      if (!existingMatch) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Update match
      const updatedMatch = await storage.updateMatch(id, matchData);
      
      res.status(200).json({
        message: "Match updated successfully",
        match: updatedMatch
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update match" });
    }
  });

  // Wallet routes
  app.get("/api/users/:userId/transactions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const transactions = await storage.getUserTransactions(userId);
      res.status(200).json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user transactions" });
    }
  });

  app.post("/api/transactions", validateBody(insertWalletTransactionSchema), async (req, res) => {
    try {
      const transactionData = req.body;
      
      // Check if user exists
      const user = await storage.getUser(transactionData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has enough balance for withdrawal or entry fee
      if (
        (transactionData.type === 'withdrawal' || transactionData.type === 'entry_fee') && 
        user.walletBalance < transactionData.amount
      ) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Create transaction
      const transaction = await storage.createTransaction(transactionData);
      
      // Get updated user with new balance
      const updatedUser = await storage.getUser(transactionData.userId);
      
      res.status(201).json({
        message: "Transaction created successfully",
        transaction,
        userBalance: updatedUser?.walletBalance
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // KYC routes
  app.get("/api/users/:userId/kyc", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const documents = await storage.getUserKycDocuments(userId);
      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user KYC documents" });
    }
  });

  app.post("/api/kyc", validateBody(insertKycDocumentSchema), async (req, res) => {
    try {
      const documentData = req.body;
      
      // Check if user exists
      const user = await storage.getUser(documentData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create KYC document
      const document = await storage.createKycDocument(documentData);
      
      // Update user KYC status to pending if it's not already
      if (user.kycStatus === 'not_submitted') {
        await storage.updateUser(user.id, { kycStatus: 'pending' });
      }
      
      res.status(201).json({
        message: "KYC document submitted successfully",
        document
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit KYC document" });
    }
  });

  app.get("/api/kyc/pending", async (req, res) => {
    try {
      const documents = await storage.getPendingKycDocuments();
      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to get pending KYC documents" });
    }
  });

  app.patch("/api/kyc/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const documentData = req.body;
      
      // Update KYC document
      const updatedDocument = await storage.updateKycDocument(id, documentData);
      
      if (!updatedDocument) {
        return res.status(404).json({ message: "KYC document not found" });
      }
      
      res.status(200).json({
        message: "KYC document updated successfully",
        document: updatedDocument
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update KYC document" });
    }
  });

  // Notification routes
  app.get("/api/users/:userId/notifications", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notifications = await storage.getUserNotifications(userId);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user notifications" });
    }
  });

  app.post("/api/notifications", validateBody(insertNotificationSchema), async (req, res) => {
    try {
      const notificationData = req.body;
      
      // Check if user exists
      const user = await storage.getUser(notificationData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create notification
      const notification = await storage.createNotification(notificationData);
      
      res.status(201).json({
        message: "Notification created successfully",
        notification
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notificationData = req.body;
      
      // Update notification
      const updatedNotification = await storage.updateNotification(id, notificationData);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.status(200).json({
        message: "Notification updated successfully",
        notification: updatedNotification
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  app.post("/api/users/:userId/notifications/read", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Mark user notifications as read
      await storage.markUserNotificationsAsRead(userId);
      
      res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notifications as read" });
    }
  });

  // Squad routes
  app.get("/api/users/:userId/squad", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const members = await storage.getUserSquadMembers(userId);
      res.status(200).json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user squad members" });
    }
  });

  app.post("/api/squad", validateBody(insertSquadMemberSchema), async (req, res) => {
    try {
      const memberData = req.body;
      
      // Check if owner exists
      const owner = await storage.getUser(memberData.ownerId);
      if (!owner) {
        return res.status(404).json({ message: "Owner user not found" });
      }
      
      // Create squad member
      const member = await storage.createSquadMember(memberData);
      
      res.status(201).json({
        message: "Squad member added successfully",
        member
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to add squad member" });
    }
  });

  app.delete("/api/squad/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Delete squad member
      await storage.deleteSquadMember(id);
      
      res.status(200).json({ message: "Squad member removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove squad member" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
