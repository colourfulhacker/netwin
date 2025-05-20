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
import { Separator } from "@/components/ui/separator";
import { getDefaultCountryCode } from "@/lib/utils";
import { Eye, EyeOff, Smartphone, AtSign, Loader2 } from "lucide-react";

// Define form schema for login validation
const loginWithPhoneSchema = z.object({
  phoneNumber: z.string().min(6, {
    message: "Phone number must be at least 6 digits.",
  }),
  countryCode: z.string(),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const loginWithEmailSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

type LoginWithPhoneValues = z.infer<typeof loginWithPhoneSchema>;
type LoginWithEmailValues = z.infer<typeof loginWithEmailSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Phone number form
  const phoneForm = useForm<LoginWithPhoneValues>({
    resolver: zodResolver(loginWithPhoneSchema),
    defaultValues: {
      phoneNumber: "",
      countryCode: getDefaultCountryCode(),
      password: "",
    },
  });

  // Email form
  const emailForm = useForm<LoginWithEmailValues>({
    resolver: zodResolver(loginWithEmailSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle phone form submission
  async function onPhoneSubmit(values: LoginWithPhoneValues) {
    setIsLoading(true);
    try {
      const success = await login({
        phoneNumber: values.phoneNumber,
        countryCode: values.countryCode,
        password: values.password,
      });

      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid phone number or password.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle email form submission
  async function onEmailSubmit(values: LoginWithEmailValues) {
    setIsLoading(true);
    try {
      const success = await login({
        email: values.email,
        password: values.password,
      });

      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Toggle password visibility
  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className="container h-screen flex items-center justify-center">
      <div className="flex flex-col w-full max-w-md space-y-8 p-8 bg-dark-card rounded-xl border border-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-poppins bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Netwin v1.0
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Login to your tournament account
          </p>
        </div>

        <Tabs
          defaultValue="phone"
          value={loginMethod}
          onValueChange={(v) => setLoginMethod(v as "phone" | "email")}
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

          <TabsContent value="phone">
            <Form {...phoneForm}>
              <form
                onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                className="space-y-6"
              >
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
                            placeholder="Enter your password"
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

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="email">
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="space-y-6"
              >
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
                            placeholder="Enter your password"
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

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-gray-500">
          <span>Don't have an account? </span>
          <Link href="/signup">
            <a className="font-medium text-primary hover:underline">Sign up</a>
          </Link>
        </div>

        <Separator className="bg-gray-800" />

        <div className="text-center text-xs text-gray-500">
          <p>
            By logging in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}