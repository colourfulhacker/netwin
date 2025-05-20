import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency, parseCurrency } from "@/lib/utils";
import {
  Wallet as WalletIcon,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  IndianRupee,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  AlertTriangle,
} from "lucide-react";

// Add money form schema
const addMoneySchema = z.object({
  amount: z.string().refine(
    (val) => {
      const amount = parseCurrency(val);
      return amount >= 100 && amount <= 10000;
    },
    {
      message: "Amount must be between 100 and 10,000",
    }
  ),
  paymentMethod: z.enum(["UPI", "PayTM", "Card", "NetBanking"]),
});

// Withdrawal form schema
const withdrawalSchema = z.object({
  amount: z.string().refine(
    (val) => {
      const amount = parseCurrency(val);
      return amount >= 100 && amount <= 10000;
    },
    {
      message: "Amount must be between 100 and 10,000",
    }
  ),
  accountNumber: z.string().min(8, {
    message: "Account number must be at least 8 characters",
  }),
  accountName: z.string().min(3, {
    message: "Account name must be at least 3 characters",
  }),
  bankName: z.string().min(3, {
    message: "Bank name is required",
  }),
  ifscCode: z.string().optional(),
  paymentMethod: z.enum(["Bank", "UPI", "PayTM", "PayPal"]),
});

type AddMoneyFormValues = z.infer<typeof addMoneySchema>;
type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

export default function Wallet() {
  const { user } = useAuth();
  const { transactions, addMoney, withdrawMoney } = useWallet();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<string>("overview");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Add money form
  const addMoneyForm = useForm<AddMoneyFormValues>({
    resolver: zodResolver(addMoneySchema),
    defaultValues: {
      amount: "",
      paymentMethod: "UPI",
    },
  });

  // Withdrawal form
  const withdrawalForm = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: "",
      accountNumber: "",
      accountName: "",
      bankName: "",
      ifscCode: "",
      paymentMethod: "Bank",
    },
  });

  if (!user) return null;

  // Get user's transaction history
  const userTransactions = transactions.filter(
    (transaction) => transaction.userId === user.id
  );

  // Get pending transactions
  const pendingTransactions = userTransactions.filter(
    (transaction) => transaction.status === "pending"
  );

  // Handle add money form submission
  const onAddMoneySubmit = async (values: AddMoneyFormValues) => {
    setIsProcessing(true);
    try {
      const amount = parseCurrency(values.amount);
      
      if (amount <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid amount",
          description: "Please enter a valid amount to add.",
        });
        setIsProcessing(false);
        return;
      }

      const success = await addMoney(amount, user, values.paymentMethod);

      if (success) {
        toast({
          title: "Money added successfully",
          description: `${formatCurrency(amount, user.currency)} has been added to your wallet.`,
        });
        setAddDialogOpen(false);
        addMoneyForm.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to add money",
          description: "Transaction failed. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle withdrawal form submission
  const onWithdrawalSubmit = async (values: WithdrawalFormValues) => {
    setIsProcessing(true);
    try {
      const amount = parseCurrency(values.amount);
      
      if (amount <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid amount",
          description: "Please enter a valid amount to withdraw.",
        });
        setIsProcessing(false);
        return;
      }

      if (amount > user.walletBalance) {
        toast({
          variant: "destructive",
          title: "Insufficient balance",
          description: "You don't have enough balance to withdraw this amount.",
        });
        setIsProcessing(false);
        return;
      }

      const withdrawalRequest = {
        amount,
        accountNumber: values.accountNumber,
        accountName: values.accountName,
        bankName: values.bankName,
        ifscCode: values.ifscCode || null,
        paymentMethod: values.paymentMethod,
      };

      const success = await withdrawMoney(withdrawalRequest, user);

      if (success) {
        toast({
          title: "Withdrawal requested",
          description: `Your withdrawal request for ${formatCurrency(amount, user.currency)} has been submitted.`,
        });
        setWithdrawDialogOpen(false);
        withdrawalForm.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to withdraw",
          description: "Withdrawal request failed. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Get currency symbol based on user's currency
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "INR":
        return <IndianRupee className="h-4 w-4" />;
      case "NGN":
        return "₦";
      case "USD":
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-poppins">
          My Wallet
        </h1>
        <p className="text-gray-400 mt-1">
          Manage your funds and transactions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance and Actions Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-dark-card border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/20 flex items-center justify-center rounded-full">
                <WalletIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Wallet Balance</h2>
                <p className="text-gray-400 text-sm">Available funds</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-3xl font-bold font-rajdhani">
                {formatCurrency(user.walletBalance, user.currency)}
              </h3>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
                onClick={() => setAddDialogOpen(true)}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Add Money
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => setWithdrawDialogOpen(true)}
                disabled={user.walletBalance <= 0}
              >
                <ArrowDownLeft className="mr-2 h-4 w-4" />
                Withdraw
              </Button>
            </div>
          </Card>

          {pendingTransactions.length > 0 && (
            <Card className="bg-dark-card border-gray-800 p-6">
              <h3 className="text-lg font-semibold mb-4">
                Pending Transactions
              </h3>
              <div className="space-y-3">
                {pendingTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-3 bg-dark-lighter rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-500/20 flex items-center justify-center rounded-full">
                        <Clock className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {transaction.type === "deposit"
                            ? "Add Money"
                            : "Withdrawal"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(
                            transaction.createdAt
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="font-medium font-rajdhani">
                      {transaction.type === "deposit" ? "+" : "-"}
                      {formatCurrency(transaction.amount, user.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="bg-dark-card border-gray-800 p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
            {user.currency === "INR" && (
              <div className="space-y-3">
                <div className="p-3 bg-dark-lighter rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 19H1.933A.97.97 0 0 1 1 18V6c0-.5.433-1 .933-1H17" />
                        <path d="M5 6V5c0-.5.433-1 .933-1H19c.5 0 1 .5 1 1v13c0 .5-.5 1-1 1H6c-.5 0-1-.5-1-1v-1" />
                        <path d="M18 16l-6-5.2V12l-4.5-3.6L10 10l-2.5 2" />
                        <path d="M18 8.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">UPI</div>
                      <div className="text-xs text-gray-400">
                        Instant transfer
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500">
                    Available
                  </Badge>
                </div>

                <div className="p-3 bg-dark-lighter rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-full">
                      <CreditCard className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">Card</div>
                      <div className="text-xs text-gray-400">
                        Credit/Debit cards
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500">
                    Available
                  </Badge>
                </div>

                <div className="p-3 bg-dark-lighter rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Net Banking</div>
                      <div className="text-xs text-gray-400">
                        All major banks
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500">
                    Available
                  </Badge>
                </div>
              </div>
            )}

            {user.currency === "NGN" && (
              <div className="space-y-3">
                <div className="p-3 bg-dark-lighter rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-full">
                      <CreditCard className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">Card</div>
                      <div className="text-xs text-gray-400">
                        Credit/Debit cards
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500">
                    Available
                  </Badge>
                </div>

                <div className="p-3 bg-dark-lighter rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Bank Transfer</div>
                      <div className="text-xs text-gray-400">
                        All major banks
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500">
                    Available
                  </Badge>
                </div>
              </div>
            )}

            {user.currency === "USD" && (
              <div className="space-y-3">
                <div className="p-3 bg-dark-lighter rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-full">
                      <CreditCard className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">Card</div>
                      <div className="text-xs text-gray-400">
                        Credit/Debit cards
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500">
                    Available
                  </Badge>
                </div>

                <div className="p-3 bg-dark-lighter rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">PayPal</div>
                      <div className="text-xs text-gray-400">
                        Fast and secure
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500">
                    Available
                  </Badge>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Transactions Column */}
        <div className="lg:col-span-2">
          <Card className="bg-dark-card border-gray-800 p-6">
            <Tabs
              defaultValue="overview"
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Transactions</h2>
                <TabsList>
                  <TabsTrigger value="overview">All</TabsTrigger>
                  <TabsTrigger value="deposits">Deposits</TabsTrigger>
                  <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="overview">
                {userTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {userTransactions
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((transaction) => (
                        <TransactionItem
                          key={transaction.id}
                          transaction={transaction}
                          currencySymbol={getCurrencySymbol(user.currency)}
                          currency={user.currency}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <WalletIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">No Transactions</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      You haven't made any transactions yet. Add money to your wallet to get started.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="deposits">
                {userTransactions.filter(t => t.type === "deposit").length > 0 ? (
                  <div className="space-y-3">
                    {userTransactions
                      .filter(t => t.type === "deposit")
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((transaction) => (
                        <TransactionItem
                          key={transaction.id}
                          transaction={transaction}
                          currencySymbol={getCurrencySymbol(user.currency)}
                          currency={user.currency}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ArrowUpRight className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">No Deposits</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      You haven't made any deposits yet. Add money to your wallet to get started.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="withdrawals">
                {userTransactions.filter(t => t.type === "withdrawal").length > 0 ? (
                  <div className="space-y-3">
                    {userTransactions
                      .filter(t => t.type === "withdrawal")
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((transaction) => (
                        <TransactionItem
                          key={transaction.id}
                          transaction={transaction}
                          currencySymbol={getCurrencySymbol(user.currency)}
                          currency={user.currency}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ArrowDownLeft className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">No Withdrawals</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      You haven't made any withdrawals yet.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Add Money Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-dark-card border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Add Money to Wallet</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add funds to your wallet to join tournaments and matches.
            </DialogDescription>
          </DialogHeader>

          <Form {...addMoneyForm}>
            <form
              onSubmit={addMoneyForm.handleSubmit(onAddMoneySubmit)}
              className="space-y-6"
            >
              <FormField
                control={addMoneyForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ({user.currency})</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">
                          {getCurrencySymbol(user.currency)}
                        </div>
                        <Input
                          type="text"
                          placeholder="Enter amount"
                          className="pl-10 bg-dark-lighter border-gray-700"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <div className="flex justify-between">
                      <FormMessage />
                      <p className="text-xs text-gray-400">
                        Min: {formatCurrency(100, user.currency)}, Max:{" "}
                        {formatCurrency(10000, user.currency)}
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={addMoneyForm.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-dark-lighter border-gray-700">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-dark-card border-gray-700">
                        {user.currency === "INR" && (
                          <>
                            <SelectItem value="UPI">UPI</SelectItem>
                            <SelectItem value="PayTM">PayTM</SelectItem>
                            <SelectItem value="Card">Credit/Debit Card</SelectItem>
                            <SelectItem value="NetBanking">Net Banking</SelectItem>
                          </>
                        )}
                        {user.currency === "NGN" && (
                          <>
                            <SelectItem value="Card">Credit/Debit Card</SelectItem>
                            <SelectItem value="Bank">Bank Transfer</SelectItem>
                          </>
                        )}
                        {user.currency === "USD" && (
                          <>
                            <SelectItem value="Card">Credit/Debit Card</SelectItem>
                            <SelectItem value="PayPal">PayPal</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddDialogOpen(false)}
                  className="border-gray-700 mt-3 sm:mt-0"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-secondary"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Add Money"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="bg-dark-card border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription className="text-gray-400">
              Withdraw funds from your wallet to your bank account.
            </DialogDescription>
          </DialogHeader>

          <Form {...withdrawalForm}>
            <form
              onSubmit={withdrawalForm.handleSubmit(onWithdrawalSubmit)}
              className="space-y-5"
            >
              <FormField
                control={withdrawalForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ({user.currency})</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">
                          {getCurrencySymbol(user.currency)}
                        </div>
                        <Input
                          type="text"
                          placeholder="Enter amount"
                          className="pl-10 bg-dark-lighter border-gray-700"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <div className="flex justify-between">
                      <FormMessage />
                      <p className="text-xs text-gray-400">
                        Available:{" "}
                        {formatCurrency(user.walletBalance, user.currency)}
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={withdrawalForm.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Withdrawal Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-dark-lighter border-gray-700">
                          <SelectValue placeholder="Select withdrawal method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-dark-card border-gray-700">
                        <SelectItem value="Bank">Bank Transfer</SelectItem>
                        {user.currency === "INR" && (
                          <>
                            <SelectItem value="UPI">UPI</SelectItem>
                            <SelectItem value="PayTM">PayTM</SelectItem>
                          </>
                        )}
                        {user.currency === "USD" && (
                          <SelectItem value="PayPal">PayPal</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {withdrawalForm.watch("paymentMethod") === "Bank" && (
                <>
                  <FormField
                    control={withdrawalForm.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Holder Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter account holder name"
                            className="bg-dark-lighter border-gray-700"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={withdrawalForm.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter account number"
                            className="bg-dark-lighter border-gray-700"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={withdrawalForm.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter bank name"
                            className="bg-dark-lighter border-gray-700"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {user.currency === "INR" && (
                    <FormField
                      control={withdrawalForm.control}
                      name="ifscCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter IFSC code"
                              className="bg-dark-lighter border-gray-700"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}

              {(withdrawalForm.watch("paymentMethod") === "UPI" ||
                withdrawalForm.watch("paymentMethod") === "PayTM") && (
                <FormField
                  control={withdrawalForm.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {withdrawalForm.watch("paymentMethod") === "UPI"
                          ? "UPI ID"
                          : "PayTM Number"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            withdrawalForm.watch("paymentMethod") === "UPI"
                              ? "Enter UPI ID"
                              : "Enter PayTM Number"
                          }
                          className="bg-dark-lighter border-gray-700"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {withdrawalForm.watch("paymentMethod") === "PayPal" && (
                <FormField
                  control={withdrawalForm.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PayPal Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter PayPal email"
                          className="bg-dark-lighter border-gray-700"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-500">
                      Withdrawal Processing Time
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Withdrawals are typically processed within 24-48 hours.
                      Bank transfers may take 2-3 business days to reflect in
                      your account.
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setWithdrawDialogOpen(false)}
                  className="border-gray-700 mt-3 sm:mt-0"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-secondary"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Withdraw Funds"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TransactionItemProps {
  transaction: any;
  currencySymbol: React.ReactNode;
  currency: string;
}

function TransactionItem({
  transaction,
  currencySymbol,
  currency,
}: TransactionItemProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-500">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return (
          <div className="w-10 h-10 bg-green-500/20 flex items-center justify-center rounded-full">
            <ArrowUpRight className="h-5 w-5 text-green-500" />
          </div>
        );
      case "withdrawal":
        return (
          <div className="w-10 h-10 bg-blue-500/20 flex items-center justify-center rounded-full">
            <ArrowDownLeft className="h-5 w-5 text-blue-500" />
          </div>
        );
      case "tournament_entry":
        return (
          <div className="w-10 h-10 bg-purple-500/20 flex items-center justify-center rounded-full">
            <Trophy className="h-5 w-5 text-purple-500" />
          </div>
        );
      case "tournament_prize":
        return (
          <div className="w-10 h-10 bg-yellow-500/20 flex items-center justify-center rounded-full">
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-500/20 flex items-center justify-center rounded-full">
            <WalletIcon className="h-5 w-5 text-gray-500" />
          </div>
        );
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "deposit":
        return "Added to Wallet";
      case "withdrawal":
        return "Withdrawal";
      case "tournament_entry":
        return "Tournament Entry Fee";
      case "tournament_prize":
        return "Tournament Prize";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-dark-lighter p-4 rounded-lg">
      <div className="flex items-center gap-4">
        {getTypeIcon(transaction.type)}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">{getTypeName(transaction.type)}</div>
              <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3" />
                {formatDate(transaction.createdAt)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium font-rajdhani">
                {transaction.type === "deposit" || transaction.type === "tournament_prize" ? "+" : "-"}
                {formatCurrency(transaction.amount, currency)}
              </div>
              <div className="mt-1">{getStatusBadge(transaction.status)}</div>
            </div>
          </div>
          {transaction.details && (
            <div className="mt-2 p-2 bg-dark-card rounded text-sm">
              {transaction.details}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}