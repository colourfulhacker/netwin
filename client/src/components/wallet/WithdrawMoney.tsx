import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { MIN_WITHDRAWAL } from "@/utils/constants";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";

// Create schema based on country
const createWithdrawalSchema = (currency: string) => {
  // Get minimum withdrawal amount for this currency
  const minAmount = MIN_WITHDRAWAL[currency as 'INR' | 'NGN' | 'USD'] || 10;
  
  return z.object({
    amount: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().min(minAmount, `Minimum withdrawal is ${minAmount}`).max(100000, "Maximum withdrawal is 100,000")
    ),
    accountNumber: z.string().min(5, "Account number is required"),
    accountName: z.string().min(3, "Account holder name is required"),
    bankName: z.string().min(2, "Bank name is required"),
    ifsc: currency === 'INR' ? z.string().min(11, "IFSC code is required") : z.string().optional(),
    swiftCode: currency === 'USD' ? z.string().min(8, "SWIFT code is required") : z.string().optional(),
  });
};

type WithdrawalFormValues = z.infer<ReturnType<typeof createWithdrawalSchema>>;

interface WithdrawMoneyProps {
  onClose: () => void;
}

const WithdrawMoney = ({ onClose }: WithdrawMoneyProps) => {
  const { user } = useAuth();
  const { withdrawMoney } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  
  if (!user) return null;
  
  // Create schema based on user's currency
  const withdrawalSchema = createWithdrawalSchema(user.currency);
  
  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: undefined,
      accountNumber: "",
      accountName: "",
      bankName: "",
      ifsc: "",
      swiftCode: "",
    },
  });
  
  const onSubmit = async (data: WithdrawalFormValues) => {
    if (!user) return;
    
    // Check if amount is greater than wallet balance
    if (data.amount > user.walletBalance) {
      form.setError("amount", {
        type: "manual",
        message: "Withdrawal amount cannot exceed your wallet balance",
      });
      return;
    }
    
    // Check if KYC is approved
    if (user.kycStatus !== "approved") {
      toast({
        title: "KYC Required",
        description: "You need to complete KYC verification before withdrawing funds.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await withdrawMoney({
        amount: data.amount,
        bankDetails: {
          accountNumber: data.accountNumber,
          accountName: data.accountName,
          bankName: data.bankName,
          ifsc: data.ifsc,
          swiftCode: data.swiftCode,
        }
      }, user);
      
      if (success) {
        setWithdrawAmount(data.amount);
        setSuccess(true);
      } else {
        throw new Error("Failed to process withdrawal");
      }
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: "Failed to process your withdrawal request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const minWithdrawal = MIN_WITHDRAWAL[user.currency as 'INR' | 'NGN' | 'USD'] || 10;
  
  // Show KYC verification alert if KYC is not approved
  if (user.kycStatus !== "approved") {
    return (
      <Card className="bg-dark-card border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-primary" />
            <span>Withdraw Funds</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-yellow-900 bg-opacity-20 border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertTitle className="text-yellow-500">KYC Verification Required</AlertTitle>
            <AlertDescription className="text-yellow-400">
              You need to complete KYC verification before withdrawing funds.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 text-center">
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-secondary"
            >
              <Link href="/kyc">Complete KYC Verification</Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-gray-800 pt-4">
          <Button 
            variant="outline" 
            className="border-gray-700 hover:bg-dark-lighter"
            onClick={onClose}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (success) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="bg-dark-card text-white border-gray-800">
          <DialogHeader className="text-center">
            <div className="mx-auto bg-green-900 bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <DialogTitle className="text-xl">Withdrawal Requested</DialogTitle>
            <DialogDescription className="text-gray-400">
              Your withdrawal request for {formatCurrency(withdrawAmount, user.currency)} has been submitted successfully.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-dark-lighter p-4 rounded-lg mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Amount Requested</span>
              <span className="font-semibold">{formatCurrency(withdrawAmount, user.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className="font-semibold text-yellow-400">PENDING</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-gray-400 mt-0.5" />
                <p className="text-sm text-gray-400">
                  Withdrawals are typically processed within 24-48 hours. You will receive a notification once your withdrawal is processed.
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full mt-4 bg-gradient-to-r from-primary to-secondary"
            onClick={onClose}
          >
            Continue
          </Button>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Card className="bg-dark-card border-gray-800 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpRight className="h-5 w-5 text-primary" />
          <span>Withdraw Funds</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-400">Available Balance</p>
            <p className="text-lg font-semibold">{formatCurrency(user.walletBalance, user.currency)}</p>
          </div>
          <div className="bg-dark-lighter p-2 rounded-lg text-sm">
            Min: {formatCurrency(minWithdrawal, user.currency)}
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Withdrawal Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      className="bg-dark-lighter border-0 focus-visible:ring-2 focus-visible:ring-primary"
                      {...field}
                      onChange={e => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum: {formatCurrency(minWithdrawal, user.currency)}, Maximum: {formatCurrency(user.walletBalance, user.currency)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter bank name"
                        className="bg-dark-lighter border-0 focus-visible:ring-2 focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter account number"
                        className="bg-dark-lighter border-0 focus-visible:ring-2 focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Holder Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter account holder name"
                      className="bg-dark-lighter border-0 focus-visible:ring-2 focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {user.currency === 'INR' && (
              <FormField
                control={form.control}
                name="ifsc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter IFSC code"
                        className="bg-dark-lighter border-0 focus-visible:ring-2 focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {user.currency === 'USD' && (
              <FormField
                control={form.control}
                name="swiftCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SWIFT Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter SWIFT code"
                        className="bg-dark-lighter border-0 focus-visible:ring-2 focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <Alert className="bg-dark-lighter border-gray-700 mt-4">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription className="text-gray-400">
                Withdrawals are processed within 24-48 hours. Ensure your bank details are correct to avoid delays.
              </AlertDescription>
            </Alert>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
        <Button 
          variant="outline" 
          className="border-gray-700 hover:bg-dark-lighter"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          className="bg-gradient-to-r from-primary to-secondary"
          onClick={form.handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit Withdrawal"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WithdrawMoney;
