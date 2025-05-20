import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { formatCurrency } from "@/lib/utils";
import { WalletTransaction } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Trophy,
  TicketX,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface WalletViewProps {
  onAddMoney: () => void;
  onWithdraw: () => void;
}

const WalletView = ({ onAddMoney, onWithdraw }: WalletViewProps) => {
  const { user } = useAuth();
  const { getTransactionHistory } = useWallet();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  
  useEffect(() => {
    if (user) {
      const userTransactions = getTransactionHistory(user.id);
      setTransactions(userTransactions);
    }
  }, [user, getTransactionHistory]);
  
  if (!user) return null;
  
  const getTransactionIcon = (type: string, status: string) => {
    if (status === "pending") return <Clock className="h-4 w-4 text-yellow-400" />;
    if (status === "failed") return <AlertCircle className="h-4 w-4 text-red-400" />;
    
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-400" />;
      case "prize":
        return <Trophy className="h-4 w-4 text-yellow-400" />;
      case "entry_fee":
        return <TicketX className="h-4 w-4 text-purple-400" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Added Money";
      case "withdrawal":
        return "Withdrawal";
      case "prize":
        return "Tournament Prize";
      case "entry_fee":
        return "Tournament Entry";
      default:
        return type;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const filteredTransactions = (type: string) => {
    if (type === "all") return transactions;
    return transactions.filter(t => t.type === type);
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="gradient-border">
        <div className="bg-dark-card rounded-lg p-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-300">Your Balance</h3>
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-bold font-rajdhani mb-6">
            {formatCurrency(user.walletBalance, user.currency)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={onAddMoney}
              className="w-full bg-gradient-to-r from-primary to-secondary"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Add Money
            </Button>
            <Button 
              onClick={onWithdraw}
              variant="outline" 
              className="w-full border-gray-700 hover:bg-dark-lighter"
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </div>
      </div>
      
      {/* Transaction History */}
      <div className="bg-dark-card rounded-xl border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold">Transaction History</h3>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <div className="px-4 pt-3">
            <TabsList className="grid grid-cols-4 bg-dark-lighter">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposit">Added</TabsTrigger>
              <TabsTrigger value="withdrawal">Withdrawn</TabsTrigger>
              <TabsTrigger value="prize">Prizes</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="px-0 py-0">
            {renderTransactionList(filteredTransactions("all"))}
          </TabsContent>
          
          <TabsContent value="deposit" className="px-0 py-0">
            {renderTransactionList(filteredTransactions("deposit"))}
          </TabsContent>
          
          <TabsContent value="withdrawal" className="px-0 py-0">
            {renderTransactionList(filteredTransactions("withdrawal"))}
          </TabsContent>
          
          <TabsContent value="prize" className="px-0 py-0">
            {renderTransactionList(filteredTransactions("prize"))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
  
  function renderTransactionList(transactionList: WalletTransaction[]) {
    if (transactionList.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          <p>No transactions found</p>
        </div>
      );
    }
    
    return (
      <div className="divide-y divide-gray-800">
        {transactionList.map((transaction) => (
          <div key={transaction.id} className="p-4 hover:bg-dark-lighter transition-colors">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-dark-lighter flex items-center justify-center">
                  {getTransactionIcon(transaction.type, transaction.status)}
                </div>
                <div>
                  <p className="font-medium">{getTransactionLabel(transaction.type)}</p>
                  <p className="text-xs text-gray-400">{formatDate(transaction.createdAt)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'deposit' || transaction.type === 'prize'
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {transaction.type === 'deposit' || transaction.type === 'prize' ? '+ ' : '- '}
                  {formatCurrency(transaction.amount, user.currency)}
                </p>
                <p className={`text-xs ${
                  transaction.status === 'completed'
                    ? 'text-green-500'
                    : transaction.status === 'pending'
                    ? 'text-yellow-500'
                    : 'text-red-500'
                }`}>
                  {transaction.status.toUpperCase()}
                </p>
              </div>
            </div>
            {transaction.details && (
              <p className="text-sm text-gray-400 mt-2">{transaction.details}</p>
            )}
          </div>
        ))}
      </div>
    );
  }
};

export default WalletView;
