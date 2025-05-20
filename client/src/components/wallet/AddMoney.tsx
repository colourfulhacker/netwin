import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { PAYMENT_METHODS } from "@/utils/constants";
import { formatCurrency } from "@/lib/utils";
import { 
  CreditCard, 
  IndianRupee,
  DollarSign,
  Wallet,
  CheckCircle2
} from "lucide-react";
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
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
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

const addMoneySchema = z.object({
  amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(10, "Minimum amount is 10").max(100000, "Maximum amount is 100,000")
  ),
  paymentMethod: z.string().min(1, "Please select a payment method"),
});

type AddMoneyFormValues = z.infer<typeof addMoneySchema>;

interface AddMoneyProps {
  onClose: () => void;
}

const AddMoney = ({ onClose }: AddMoneyProps) => {
  const { user } = useAuth();
  const { addMoney } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [addedAmount, setAddedAmount] = useState(0);
  
  const form = useForm<AddMoneyFormValues>({
    resolver: zodResolver(addMoneySchema),
    defaultValues: {
      amount: undefined,
      paymentMethod: "",
    },
  });
  
  const onSubmit = async (data: AddMoneyFormValues) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const success = await addMoney(data.amount, user, data.paymentMethod);
      
      if (success) {
        setAddedAmount(data.amount);
        setSuccess(true);
      } else {
        throw new Error("Failed to add money");
      }
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to add money to your wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) return null;
  
  // Get payment methods based on user's country
  const paymentMethodsForCountry = PAYMENT_METHODS[user.country] || PAYMENT_METHODS.default;
  
  // Quick amounts based on currency
  const quickAmounts = 
    user.currency === "INR" ? [100, 200, 500, 1000, 2000] : 
    user.currency === "NGN" ? [500, 1000, 2000, 5000, 10000] : 
    [5, 10, 25, 50, 100];
  
  // Currency icon based on user's currency
  const CurrencyIcon = 
    user.currency === "INR" ? IndianRupee : 
    DollarSign;
  
  if (success) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="bg-dark-card text-white border-gray-800">
          <DialogHeader className="text-center">
            <div className="mx-auto bg-green-900 bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <DialogTitle className="text-xl">Payment Successful!</DialogTitle>
            <DialogDescription className="text-gray-400">
              Your wallet has been credited with {formatCurrency(addedAmount, user.currency)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-dark-lighter p-4 rounded-lg mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Amount Added</span>
              <span className="font-semibold">{formatCurrency(addedAmount, user.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">New Balance</span>
              <span className="font-semibold">{formatCurrency(user.walletBalance + addedAmount, user.currency)}</span>
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
          <CreditCard className="h-5 w-5 text-primary" />
          <span>Add Money to Wallet</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-400">Current Balance</p>
            <p className="text-lg font-semibold">{formatCurrency(user.walletBalance, user.currency)}</p>
          </div>
          <div className="bg-dark-lighter p-2 rounded-full">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-2.5">
                        <CurrencyIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-10 bg-dark-lighter border-0 focus-visible:ring-2 focus-visible:ring-primary"
                        {...field}
                        onChange={e => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Minimum: {formatCurrency(10, user.currency)}, Maximum: {formatCurrency(100000, user.currency)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Quick Amount Buttons */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Quick Add</label>
              <div className="grid grid-cols-5 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className="bg-dark-lighter hover:bg-gray-700 rounded py-1 px-2 text-sm transition"
                    onClick={() => form.setValue("amount", amount)}
                  >
                    {formatCurrency(amount, user.currency)}
                  </button>
                ))}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-2"
                    >
                      {paymentMethodsForCountry.map((method) => (
                        <div key={method} className="flex items-center space-x-2 bg-dark-lighter p-3 rounded-lg">
                          <RadioGroupItem value={method} id={method} />
                          <label htmlFor={method} className="flex-1 cursor-pointer text-sm font-medium">
                            {method}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          {loading ? "Processing..." : "Add Money"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AddMoney;
