import { createContext, useState, useCallback, ReactNode } from "react";
import { WalletTransaction, User, WithdrawalRequest, Currency } from "@/types";

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
  loading: false,
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
  const [loading, setLoading] = useState<boolean>(false);
  
  const addMoney = useCallback(async (
    amount: number, 
    user: User,
    paymentMethod: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Mock api call to payment gateway
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create transaction record
      const transaction: WalletTransaction = {
        id: transactions.length + 1,
        userId: user.id,
        type: "deposit",
        amount,
        status: "completed",
        details: `Added via ${paymentMethod}`,
        createdAt: new Date()
      };
      
      // Add to transactions list
      setTransactions(prev => [...prev, transaction]);
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error adding money:", error);
      setLoading(false);
      return false;
    }
  }, [transactions]);
  
  const withdrawMoney = useCallback(async (
    request: WithdrawalRequest,
    user: User
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Mock api call to payment gateway
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create transaction record
      const transaction: WalletTransaction = {
        id: transactions.length + 1,
        userId: user.id,
        type: "withdrawal",
        amount: request.amount,
        status: "pending",
        details: `Withdrawn to ${request.accountType} account: ${request.accountNumber}`,
        createdAt: new Date()
      };
      
      // Add to transactions list
      setTransactions(prev => [...prev, transaction]);
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error withdrawing money:", error);
      setLoading(false);
      return false;
    }
  }, [transactions]);
  
  const getTransactionHistory = useCallback((userId: number): WalletTransaction[] => {
    return transactions.filter(transaction => transaction.userId === userId);
  }, [transactions]);
  
  // Exchange rates (simplified for demo)
  const exchangeRates = {
    USD: 1,
    INR: 75,
    NGN: 380
  };
  
  const convertAmount = useCallback((
    amount: number, 
    fromCurrency: Currency, 
    toCurrency: Currency
  ): number => {
    // Convert to USD first
    const amountInUSD = fromCurrency === "USD" ? amount : amount / exchangeRates[fromCurrency];
    
    // Convert from USD to target currency
    return toCurrency === "USD" ? amountInUSD : amountInUSD * exchangeRates[toCurrency];
  }, []);
  
  return (
    <WalletContext.Provider
      value={{
        transactions,
        loading,
        addMoney,
        withdrawMoney,
        getTransactionHistory,
        convertAmount
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};