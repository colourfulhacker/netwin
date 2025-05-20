import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { COUNTRY_CODES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuth";
import { validatePhoneNumber } from "@/utils/utils";

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const loginSchema = z.object({
  countryCode: z.string().min(2, "Country code is required"),
  phoneNumber: z.string().min(6, "Phone number is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      countryCode: "+91", // Default to India
      phoneNumber: "",
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    // Validate phone number based on country code
    if (!validatePhoneNumber(data.phoneNumber, data.countryCode)) {
      form.setError("phoneNumber", {
        type: "manual",
        message: "Please enter a valid phone number for the selected country",
      });
      return;
    }
    
    setLoading(true);
    const success = await login({
      countryCode: data.countryCode,
      phoneNumber: data.phoneNumber,
    });
    
    setLoading(false);
    
    if (success) {
      // Navigate to OTP verification page
      setLocation("/verify-otp");
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div className="text-4xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">NETWIN</div>
      </div>
      
      <div className="bg-dark-card p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold font-poppins mb-6 text-center">Welcome Back</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Country Code & Phone */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <div className="flex">
                    <FormField
                      control={form.control}
                      name="countryCode"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[130px] bg-dark-lighter text-white rounded-l-lg rounded-r-none border-0 focus-visible:ring-2 focus-visible:ring-primary">
                              <SelectValue placeholder="Country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-dark-lighter text-white border-gray-700">
                            {COUNTRY_CODES.map((country) => (
                              <SelectItem key={country.code} value={country.code} className="hover:bg-gray-700">
                                {country.code} {country.flag}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FormControl>
                      <Input
                        placeholder="Enter your phone number"
                        className="flex-1 bg-dark-lighter text-white rounded-l-none rounded-r-lg border-0 focus-visible:ring-2 focus-visible:ring-primary"
                        type="tel"
                        {...field}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
            
            {/* Request OTP Button */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-6 rounded-lg font-medium transition hover:opacity-90"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Request OTP"}
            </Button>
            
            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-700"></div>
              <div className="px-3 text-sm text-gray-400">or continue with</div>
              <div className="flex-1 border-t border-gray-700"></div>
            </div>
            
            {/* Google Login */}
            <Button 
              type="button"
              variant="outline" 
              className="w-full bg-dark-lighter flex items-center justify-center gap-2 text-white py-6 rounded-lg font-medium transition hover:bg-opacity-80 border border-gray-700"
            >
              <i className="ri-google-fill text-xl"></i>
              Google
            </Button>
            
            {/* Forgot Password */}
            <div className="mt-6 text-center">
              <a href="#" className="text-primary hover:underline text-sm">Forgot Password?</a>
            </div>
          </form>
        </Form>
      </div>
      
      {/* Sign Up Link */}
      <div className="mt-6 text-center">
        <p className="text-gray-300">
          Don't have an account? <a href="/signup" className="text-accent hover:underline">Sign Up</a>
        </p>
      </div>
    </div>
  );
}
