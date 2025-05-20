import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export default function OtpVerification() {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("");
  const [, setLocation] = useLocation();
  const { verifyOtp, login } = useAuth();
  const otpInputs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    // Get temp phone number from localStorage
    const tempPhone = localStorage.getItem('temp_phone');
    const tempSignup = localStorage.getItem('temp_signup');
    
    if (tempPhone) {
      // For login flow
      // Extract country code and phone number
      const match = tempPhone.match(/^(\+\d+)(.+)$/);
      if (match) {
        setCountryCode(match[1]);
        setPhoneNumber(match[2]);
      } else {
        setPhoneNumber(tempPhone);
      }
    } else if (tempSignup) {
      // For signup flow
      try {
        const signupData = JSON.parse(tempSignup);
        setCountryCode(signupData.countryCode);
        setPhoneNumber(signupData.phoneNumber);
      } catch (error) {
        console.error("Failed to parse signup data", error);
      }
    } else {
      // No phone number found, redirect to login
      setLocation("/login");
    }
    
    // Start countdown
    let timer: NodeJS.Timeout;
    
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, setLocation]);
  
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });
  
  const onSubmit = async (data: OtpFormValues) => {
    setLoading(true);
    
    const success = await verifyOtp({
      phoneNumber,
      countryCode,
      otp: data.otp,
    });
    
    setLoading(false);
    
    if (success) {
      // Navigate to home page on successful verification
      setLocation("/");
    }
  };
  
  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setLoading(true);
    
    const success = await login({
      countryCode,
      phoneNumber,
    });
    
    setLoading(false);
    
    if (success) {
      setCountdown(30);
      setCanResend(false);
    }
  };
  
  const handleOtpInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const input = e.target;
    const value = input.value;
    
    // Allow only numbers
    if (/^\d*$/.test(value)) {
      // Update form value
      const currentOtp = form.getValues().otp || "";
      const newOtp = currentOtp.split("");
      newOtp[index] = value;
      form.setValue("otp", newOtp.join(""));
      
      // Move to next input if value is entered
      if (value && index < 5) {
        otpInputs.current[index + 1]?.focus();
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move to previous input on backspace
    if (e.key === "Backspace" && index > 0 && !e.currentTarget.value) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="w-full max-w-md bg-dark-card p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold font-poppins mb-2 text-center">Verify OTP</h2>
      <p className="text-center text-gray-400 mb-6">
        Enter the code sent to {countryCode} {phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/, "$1****$3")}
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* OTP Input */}
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between mb-6">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <FormControl key={index}>
                      <Input
                        ref={(el) => {
                          if (el) otpInputs.current[index] = el;
                        }}
                        className="w-12 h-12 text-center bg-dark-lighter text-white rounded-lg text-xl border-0 focus-visible:ring-2 focus-visible:ring-primary"
                        type="text"
                        maxLength={1}
                        inputMode="numeric"
                        value={field.value?.[index] || ""}
                        onChange={(e) => handleOtpInput(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />
                    </FormControl>
                  ))}
                </div>
              </FormItem>
            )}
          />
          
          {/* Verify Button */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-6 rounded-lg font-medium transition hover:opacity-90"
            disabled={loading || form.getValues().otp?.length !== 6}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>
          
          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">Didn't receive the code?</p>
            <Button
              type="button"
              variant="link"
              className={`text-primary ${!canResend && 'opacity-50 cursor-not-allowed'}`}
              onClick={handleResendOtp}
              disabled={!canResend || loading}
            >
              {canResend ? "Resend OTP" : `Resend OTP in ${countdown}s`}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
