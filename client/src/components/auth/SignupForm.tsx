import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { COUNTRY_CODES, REGEX_PATTERNS } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuth";
import { validatePhoneNumber, validateGameId } from "@/utils/utils";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters"),
  countryCode: z.string().min(2, "Country code is required"),
  phoneNumber: z.string().min(6, "Phone number is required"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  gameId: z.string().min(6, "Game ID is required"),
  gameMode: z.enum(["PUBG", "BGMI"], { required_error: "Please select a game mode" })
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { signup } = useAuth();
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      countryCode: "+91", // Default to India
      phoneNumber: "",
      email: "",
      gameId: "",
      gameMode: "BGMI" // Default to BGMI for Indian users
    },
  });
  
  // Watch the country code to set default game mode
  const countryCode = form.watch("countryCode");
  const gameMode = form.watch("gameMode");
  
  // Update game mode when country changes
  const onCountryChange = (value: string) => {
    form.setValue("countryCode", value);
    
    // Default to BGMI for India, PUBG for others
    if (value === "+91" && gameMode !== "BGMI") {
      form.setValue("gameMode", "BGMI");
    } else if (value !== "+91" && gameMode !== "PUBG") {
      form.setValue("gameMode", "PUBG");
    }
  };
  
  const onSubmit = async (data: SignupFormValues) => {
    // Validate phone number based on country code
    if (!validatePhoneNumber(data.phoneNumber, data.countryCode)) {
      form.setError("phoneNumber", {
        type: "manual",
        message: "Please enter a valid phone number for the selected country",
      });
      return;
    }
    
    // Validate game ID based on game mode
    if (!validateGameId(data.gameId, data.gameMode)) {
      form.setError("gameId", {
        type: "manual",
        message: `Please enter a valid ${data.gameMode} ID`,
      });
      return;
    }
    
    setLoading(true);
    const success = await signup(data);
    
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
        <h1 className="text-2xl font-bold font-poppins mb-6 text-center">Create Account</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Choose a unique username"
                      className="bg-dark-lighter text-white border-0 focus-visible:ring-2 focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                          onValueChange={onCountryChange}
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
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Email (Optional) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      className="bg-dark-lighter text-white border-0 focus-visible:ring-2 focus-visible:ring-primary"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Game Mode Selection */}
            <FormField
              control={form.control}
              name="gameMode"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Game Mode</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="BGMI" id="bgmi" />
                        <label htmlFor="bgmi" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          BGMI (India)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="PUBG" id="pubg" />
                        <label htmlFor="pubg" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          PUBG (Global)
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Game ID */}
            <FormField
              control={form.control}
              name="gameId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch("gameMode") === "BGMI" ? "BGMI ID" : "PUBG ID"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`Enter your ${form.watch("gameMode")} ID`}
                      className="bg-dark-lighter text-white border-0 focus-visible:ring-2 focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Sign Up Button */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-6 rounded-lg font-medium transition hover:opacity-90 mt-6"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
            
            {/* Terms & Conditions */}
            <div className="text-xs text-gray-400 text-center mt-4">
              By signing up, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </div>
          </form>
        </Form>
      </div>
      
      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-gray-300">
          Already have an account? <a href="/login" className="text-accent hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}
