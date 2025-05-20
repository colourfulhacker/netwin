import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot 
} from "@/components/ui/input-otp";
import { Loader2, ArrowLeft } from "lucide-react";

export default function OtpVerify() {
  const [, setLocation] = useLocation();
  const { verifyOtp } = useAuth();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  useEffect(() => {
    // Get phone number from URL or localStorage
    const queryParams = new URLSearchParams(window.location.search);
    const phone = queryParams.get("phone");
    if (phone) {
      setPhoneNumber(phone);
    } else {
      // Redirect to login if no phone number
      setLocation("/login");
    }

    // Set up countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, setLocation]);

  const handleVerify = async () => {
    if (!phoneNumber) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Phone number not found. Please try logging in again.",
      });
      return;
    }

    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit OTP.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await verifyOtp({
        phoneNumber,
        otp,
      });

      if (success) {
        toast({
          title: "Verification Successful",
          description: "Your account has been verified successfully!",
        });
        // User will be redirected automatically by AuthContext
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: "Invalid OTP. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    // In a real app, this would call an API to resend OTP
    toast({
      title: "OTP Resent",
      description: "A new OTP has been sent to your phone.",
    });
    setCountdown(60);
  };

  const goBack = () => {
    setLocation("/login");
  };

  return (
    <div className="container h-screen flex items-center justify-center">
      <div className="flex flex-col w-full max-w-md space-y-8 p-8 bg-dark-card rounded-xl border border-gray-800">
        <Button 
          variant="ghost" 
          className="self-start text-gray-400"
          onClick={goBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>

        <div className="text-center">
          <h1 className="text-2xl font-bold font-poppins">Verify Your Account</h1>
          <p className="mt-2 text-sm text-gray-400">
            Enter the 6-digit code sent to {phoneNumber}
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex justify-center">
            <InputOTP 
              maxLength={6} 
              value={otp}
              onChange={setOtp}
              render={({ slots }) => (
                <InputOTPGroup>
                  {slots.map((slot, index) => (
                    <InputOTPSlot 
                      key={index} 
                      {...slot} 
                      className="w-12 h-14 text-xl bg-dark-lighter border-gray-700 focus:border-primary"
                    />
                  ))}
                </InputOTPGroup>
              )}
            />
          </div>

          <Button
            onClick={handleVerify}
            className="w-full bg-gradient-to-r from-primary to-secondary"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">
              Didn't receive the code?
            </p>
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                Resend OTP in <span className="font-medium">{countdown}s</span>
              </p>
            ) : (
              <Button
                variant="link"
                className="text-primary p-0 h-auto"
                onClick={handleResendOtp}
              >
                Resend OTP
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}