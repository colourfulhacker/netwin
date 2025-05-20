import { useState } from "react";
import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { getDefaultCountryCode, validatePhoneNumber, validateGameId } from "@/lib/utils";
import { Eye, EyeOff, Smartphone, AtSign, Loader2, User, Map } from "lucide-react";

// Define form schema for signup validation
const signupWithPhoneSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  phoneNumber: z.string().min(6, {
    message: "Phone number must be at least 6 digits.",
  }),
  countryCode: z.string(),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  gameId: z.string().optional(),
  gameMode: z.enum(["PUBG", "BGMI"]),
  country: z.string(),
  currency: z.enum(["INR", "NGN", "USD"]),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions." }),
  }),
});

const signupWithEmailSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  gameId: z.string().optional(),
  gameMode: z.enum(["PUBG", "BGMI"]),
  country: z.string(),
  currency: z.enum(["INR", "NGN", "USD"]),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions." }),
  }),
});

type SignupWithPhoneValues = z.infer<typeof signupWithPhoneSchema>;
type SignupWithEmailValues = z.infer<typeof signupWithEmailSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [signupMethod, setSignupMethod] = useState<"phone" | "email">("phone");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Phone number form
  const phoneForm = useForm<SignupWithPhoneValues>({
    resolver: zodResolver(signupWithPhoneSchema),
    defaultValues: {
      username: "",
      phoneNumber: "",
      countryCode: getDefaultCountryCode(),
      password: "",
      gameMode: "PUBG",
      country: "India",
      currency: "INR",
      termsAccepted: false,
    },
  });

  // Email form
  const emailForm = useForm<SignupWithEmailValues>({
    resolver: zodResolver(signupWithEmailSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      gameMode: "PUBG",
      country: "India",
      currency: "INR",
      termsAccepted: false,
    },
  });

  // Set currency based on country
  const handleCountryChange = (value: string, formType: "phone" | "email") => {
    let currency = "USD";
    if (value === "India") currency = "INR";
    if (value === "Nigeria") currency = "NGN";
    
    if (formType === "phone") {
      phoneForm.setValue("currency", currency as "INR" | "NGN" | "USD");
    } else {
      emailForm.setValue("currency", currency as "INR" | "NGN" | "USD");
    }
  };

  // Handle phone form submission
  async function onPhoneSubmit(values: SignupWithPhoneValues) {
    setIsLoading(true);
    try {
      // Validate phone number format
      if (!validatePhoneNumber(values.phoneNumber, values.countryCode)) {
        toast({
          variant: "destructive",
          title: "Invalid phone number",
          description: "Please enter a valid phone number for your country.",
        });
        setIsLoading(false);
        return;
      }
      
      // Validate game ID if provided
      if (values.gameId && !validateGameId(values.gameId, values.gameMode)) {
        toast({
          variant: "destructive",
          title: "Invalid game ID",
          description: `Please enter a valid ${values.gameMode} player ID.`,
        });
        setIsLoading(false);
        return;
      }

      const success = await signup({
        username: values.username,
        phoneNumber: values.phoneNumber,
        countryCode: values.countryCode,
        password: values.password,
        gameId: values.gameId || null,
        gameMode: values.gameMode,
        country: values.country,
        currency: values.currency,
      });

      if (success) {
        toast({
          title: "Account created",
          description: "Please verify your phone number to continue.",
        });
        // Redirect to OTP verification
        setLocation(`/verify-otp?phone=${values.phoneNumber}`);
      } else {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: "Phone number may already be registered.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle email form submission
  async function onEmailSubmit(values: SignupWithEmailValues) {
    setIsLoading(true);
    try {
      // Validate game ID if provided
      if (values.gameId && !validateGameId(values.gameId, values.gameMode)) {
        toast({
          variant: "destructive",
          title: "Invalid game ID",
          description: `Please enter a valid ${values.gameMode} player ID.`,
        });
        setIsLoading(false);
        return;
      }

      const success = await signup({
        username: values.username,
        email: values.email,
        password: values.password,
        gameId: values.gameId || null,
        gameMode: values.gameMode,
        country: values.country,
        currency: values.currency,
      });

      if (success) {
        toast({
          title: "Account created",
          description: "Please check your email for verification.",
        });
        // Redirect to login
        setLocation("/login");
      } else {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: "Email may already be registered.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Toggle password visibility
  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className="container min-h-screen py-10 flex items-center justify-center">
      <div className="flex flex-col w-full max-w-lg space-y-8 p-6 sm:p-8 bg-dark-card rounded-xl border border-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-poppins bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Join Netwin v1.0
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Create your tournament account
          </p>
        </div>

        <Tabs
          defaultValue="phone"
          value={signupMethod}
          onValueChange={(v) => setSignupMethod(v as "phone" | "email")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="phone" className="text-sm">
              Phone Number
            </TabsTrigger>
            <TabsTrigger value="email" className="text-sm">
              Email
            </TabsTrigger>
          </TabsList>

          {/* Phone Number Signup Form */}
          <TabsContent value="phone">
            <Form {...phoneForm}>
              <form
                onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={phoneForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Choose a username"
                            className="pl-10 bg-dark-lighter border-gray-700"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={phoneForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <div className="flex">
                        <FormField
                          control={phoneForm.control}
                          name="countryCode"
                          render={({ field }) => (
                            <FormItem className="w-[80px] mr-2">
                              <FormControl>
                                <Input
                                  placeholder="+91"
                                  {...field}
                                  className="bg-dark-lighter border-gray-700"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormItem className="flex-1">
                          <FormControl>
                            <div className="relative">
                              <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Enter your phone number"
                                className="pl-10 bg-dark-lighter border-gray-700"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={phoneForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            className="bg-dark-lighter border-gray-700"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 text-gray-400"
                            onClick={toggleShowPassword}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={phoneForm.control}
                    name="gameMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Game Mode</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-dark-lighter border-gray-700">
                              <SelectValue placeholder="Select game mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-dark-card border-gray-700">
                            <SelectItem value="PUBG">PUBG</SelectItem>
                            <SelectItem value="BGMI">BGMI</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={phoneForm.control}
                    name="gameId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Game ID (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Map className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Enter your game ID"
                              className="pl-10 bg-dark-lighter border-gray-700"
                              {...field}
                              value={field.value || ""}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={phoneForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleCountryChange(value, "phone");
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-dark-lighter border-gray-700">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-dark-card border-gray-700">
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="Nigeria">Nigeria</SelectItem>
                            <SelectItem value="Global">Other Countries</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={phoneForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-dark-lighter border-gray-700">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-dark-card border-gray-700">
                            <SelectItem value="INR">INR</SelectItem>
                            <SelectItem value="NGN">NGN</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={phoneForm.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          I agree to the{" "}
                          <Link href="/terms">
                            <a className="text-primary hover:underline">
                              Terms of Service
                            </a>
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy">
                            <a className="text-primary hover:underline">
                              Privacy Policy
                            </a>
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Email Signup Form */}
          <TabsContent value="email">
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={emailForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Choose a username"
                            className="pl-10 bg-dark-lighter border-gray-700"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Enter your email"
                            className="pl-10 bg-dark-lighter border-gray-700"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={emailForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            className="bg-dark-lighter border-gray-700"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 text-gray-400"
                            onClick={toggleShowPassword}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={emailForm.control}
                    name="gameMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Game Mode</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-dark-lighter border-gray-700">
                              <SelectValue placeholder="Select game mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-dark-card border-gray-700">
                            <SelectItem value="PUBG">PUBG</SelectItem>
                            <SelectItem value="BGMI">BGMI</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={emailForm.control}
                    name="gameId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Game ID (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Map className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Enter your game ID"
                              className="pl-10 bg-dark-lighter border-gray-700"
                              {...field}
                              value={field.value || ""}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={emailForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleCountryChange(value, "email");
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-dark-lighter border-gray-700">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-dark-card border-gray-700">
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="Nigeria">Nigeria</SelectItem>
                            <SelectItem value="Global">Other Countries</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={emailForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-dark-lighter border-gray-700">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-dark-card border-gray-700">
                            <SelectItem value="INR">INR</SelectItem>
                            <SelectItem value="NGN">NGN</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={emailForm.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          I agree to the{" "}
                          <Link href="/terms">
                            <a className="text-primary hover:underline">
                              Terms of Service
                            </a>
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy">
                            <a className="text-primary hover:underline">
                              Privacy Policy
                            </a>
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-gray-500">
          <span>Already have an account? </span>
          <Link href="/login">
            <a className="font-medium text-primary hover:underline">Sign in</a>
          </Link>
        </div>

        <Separator className="bg-gray-800" />

        <div className="text-center text-xs text-gray-500">
          <p>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}