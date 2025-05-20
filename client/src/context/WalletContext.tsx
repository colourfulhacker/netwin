import { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { WalletTransaction, User, WithdrawalRequest, Currency } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  getUserTransactions,
  addWalletTransaction,
  getStoredUser,
  storeUser,
  addNotification
} from "@/utils/helpers";
import { MIN_WITHDRAWAL } from "@/utils/constants";

interface WalletContextType {
  transactions: WalletTransaction[];
  loading: boolean;
  addMoney: (amount: number, user: User, paymentMethod: string) => Promise<boolean>;
  withdrawMoney: (request: WithdrawalRequest, user: User) => Promise<boolean>;
  getTransactionHistory: (userId: number) => WalletTransaction[];
  convertAmount: (amount: number, fromCurrency: Currency, toCurrency: Currency) => number;
}

export const WalletContext = createContext<WalletContextType>({
  transactions: [],
  loading: true,
  addMoney: async () => false,
  withdrawMoney: async () => false,
  getTransactionHistory: () => [],
  convertAmount: () => 0
});

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Load transactions on mount
  useEffect(() => {
    setLoading(false);
  }, []);
  
  // Add money to wallet
  const addMoney = async (
    amount: number, 
    user: User,
    paymentMethod: string
  ): Promise<boolean> => {
    try {
      if (amount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount to add.",
          variant: "destructive"
        });
        return false;
      }
      
      // Create transaction record
      const transaction: WalletTransaction = {
        id: Date.now(),
        userId: user.id,
        amount: amount,
        type: "deposit",
        status: "completed",
        details: `Deposit via ${paymentMethod}`,
        createdAt: new Date().toISOString()
      };
      
      // Add transaction to storage
      addWalletTransaction(transaction);
      
      // Update user's wallet balance
      const updatedUser = { ...user, walletBalance: user.walletBalance + amount };
      storeUser(updatedUser);
      
      // Add notification
      addNotification({
        id: Date.now(),
        userId: user.id,
        title: "Money Added",
        message: `${amount} ${user.currency} has been added to your wallet.`,
        type: "wallet",
        read: false,
        createdAt: new Date().toISOString()
      });
      
      // Get updated transactions
      const updatedTransactions = getUserTransactions(user.id);
      setTransactions(updatedTransactions);
      
      toast({
        title: "Money Added",
        description: `${amount} ${user.currency} has been added to your wallet.`,
      });
      
      return true;
    } catch (error) {
      console.error("Add money error:", error);
      toast({
        title: "Transaction Failed",
        description: "Failed to add money to your wallet. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Withdraw money from wallet
  const withdrawMoney = async (
    request: WithdrawalRequest,
    user: User
  ): Promise<boolean> => {
    try {
      // Check if amount is valid
      if (request.amount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount to withdraw.",
          variant: "destructive"
        });
        return false;
      }
      
      // Check if amount is greater than minimum withdrawal
      if (request.amount < MIN_WITHDRAWAL[user.currency]) {
        toast({
          title: "Minimum Withdrawal",
          description: `Minimum withdrawal amount is ${MIN_WITHDRAWAL[user.currency]} ${user.currency}.`,
          variant: "destructive"
        });
        return false;
      }
      
      // Check if user has enough balance
      if (user.walletBalance < request.amount) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough balance to withdraw this amount.",
          variant: "destructive"
        });
        return false;
      }
      
      // Check if KYC is approved
      if (user.kycStatus !== "approved") {
        toast({
          title: "KYC Required",
          description: "Please complete KYC verification before withdrawing money.",
          variant: "destructive"
        });
        return false;
      }
      
      // Create transaction record
      const transaction: WalletTransaction = {
        id: Date.now(),
        userId: user.id,
        amount: request.amount,
        type: "withdrawal",
        status: "pending", // Set to pending until processed
        details: `Withdrawal to account ending with ${request.bankDetails.accountNumber.slice(-4)}`,
        createdAt: new Date().toISOString()
      };
      
      // Add transaction to storage
      addWalletTransaction(transaction);
      
      // Update user's wallet balance
      const updatedUser = { ...user, walletBalance: user.walletBalance - request.amount };
      storeUser(updatedUser);
      
      // Add notification
      addNotification({
        id: Date.now(),
        userId: user.id,
        title: "Withdrawal Requested",
        message: `Your withdrawal request for ${request.amount} ${user.currency} is being processed.`,
        type: "wallet",
        read: false,
        createdAt: new Date().toISOString()
      });
      
      // Get updated transactions
      const updatedTransactions = getUserTransactions(user.id);
      setTransactions(updatedTransactions);
      
      toast({
        title: "Withdrawal Requested",
        description: `Your withdrawal request for ${request.amount} ${user.currency} is being processed.`,
      });
      
      return true;
    } catch (error) {
      console.error("Withdraw money error:", error);
      toast({
        title: "Withdrawal Failed",
        description: "Failed to process your withdrawal request. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Get transaction history for a user
  const getTransactionHistory = useCallback((userId: number): WalletTransaction[] => {
    const userTransactions = getUserTransactions(userId);
    
    // Sort by date descending
    return userTransactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, []);
  
  // Convert amount between currencies
  const convertAmount = useCallback((
    amount: number, 
    fromCurrency: Currency, 
    toCurrency: Currency
  ): number => {
    // Simple conversion rates for demonstration
    const rates: Record<Currency, number> = {
      USD: 1,
      INR: 83, // 1 USD = 83 INR
      NGN: 1300 // 1 USD = 1300 NGN
    };
    
    // Convert to USD first
    const amountInUsd = amount / rates[fromCurrency];
    
    // Then convert to target currency
    return Math.round(amountInUsd * rates[toCurrency] * 100) / 100;
  }, []);
  
  return (
    <WalletContext.Provider value={{
      transactions,
      loading,
      addMoney,
      withdrawMoney,
      getTransactionHistory,
      convertAmount
    }}>
      {children}
    </WalletContext.Provider>
  );
};
