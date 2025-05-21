import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  UploadCloud,
  User,
  ShieldCheck,
  Gamepad2,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Pencil,
  Wallet,
  LogOut,
  Loader2,
  Clock
} from "lucide-react";

// Profile edit form schema
const profileSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  gameId: z.string().min(4, {
    message: "Game ID must be at least 4 characters.",
  }),
  email: z.string().email().optional().nullable(),
  profilePicture: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, logout, updateUser } = useAuth();
  const { updateGameId, uploadProfileImage } = useUser();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<string>("account");
  const [uploading, setUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Profile form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      gameId: user?.gameId || "",
      email: user?.email || "",
      profilePicture: user?.profilePicture || "",
    },
  });
  
  if (!user) return null;
  
  // Handle profile form submission
  const onSubmit = async (values: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      // Check if game ID was changed
      if (values.gameId !== user.gameId) {
        await updateGameId(values.gameId);
      }
      
      // Update user profile
      await updateUser({
        username: values.username,
        email: values.email,
        gameId: values.gameId,
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle profile picture upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please upload an image file.",
      });
      return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Image size should be less than 2MB.",
      });
      return;
    }
    
    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          // Upload profile image
          const success = await uploadProfileImage(reader.result);
          
          if (success) {
            form.setValue("profilePicture", reader.result);
            toast({
              title: "Image uploaded",
              description: "Your profile picture has been updated.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Upload failed",
              description: "Failed to upload image. Please try again.",
            });
          }
        }
        setUploading(false);
      };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "An error occurred. Please try again.",
      });
      setUploading(false);
    }
  };
  
  // Navigate to KYC verification page
  const goToKycVerification = () => {
    setLocation("/kyc");
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    setLocation("/login");
  };
  
  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-poppins">
          My Profile
        </h1>
        <p className="text-gray-400 mt-1">
          Manage your account information and settings
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-dark-card border-gray-800 p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage 
                    src={user.profilePicture || undefined} 
                    alt={user.username} 
                  />
                  <AvatarFallback className="bg-primary/20 text-xl">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0">
                  <label 
                    htmlFor="profile-picture-upload" 
                    className="cursor-pointer bg-primary text-white p-1.5 rounded-full hover:bg-primary/90 transition"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                  </label>
                  <input 
                    id="profile-picture-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </div>
              </div>
              <h2 className="text-xl font-semibold">{user.username}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-primary">
                  {user.gameMode}
                </Badge>
                <Badge variant="outline" className="border-gray-700">
                  {user.currency}
                </Badge>
              </div>
              
              <div className="mt-4 flex items-center">
                {user.kycStatus === "verified" ? (
                  <Badge className="bg-green-600 gap-1 px-2 py-1">
                    <ShieldCheck className="h-3 w-3" />
                    KYC Verified
                  </Badge>
                ) : user.kycStatus === "pending" ? (
                  <Badge variant="outline" className="border-yellow-600 text-yellow-500 gap-1 px-2 py-1">
                    <Clock className="h-3 w-3" />
                    KYC Pending
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-red-600 text-red-500 gap-1 px-2 py-1">
                    <AlertTriangle className="h-3 w-3" />
                    KYC Not Verified
                  </Badge>
                )}
              </div>
            </div>
            
            <Separator className="bg-gray-800 my-6" />
            
            <nav className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 hover:bg-primary/10"
                onClick={() => setSelectedTab("account")}
              >
                <User className="h-5 w-5 text-gray-400" />
                <span>Account Information</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 hover:bg-primary/10"
                onClick={() => setSelectedTab("gaming")}
              >
                <GameController className="h-5 w-5 text-gray-400" />
                <span>Gaming Profile</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 hover:bg-primary/10"
                onClick={() => setLocation("/wallet")}
              >
                <Wallet className="h-5 w-5 text-gray-400" />
                <span>Wallet & Payments</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 hover:bg-primary/10"
                onClick={goToKycVerification}
              >
                <ShieldCheck className="h-5 w-5 text-gray-400" />
                <span>KYC Verification</span>
                {user.kycStatus !== "verified" && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                )}
              </Button>
              
              <Separator className="bg-gray-800 my-3" />
              
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 hover:bg-primary/10 text-red-500 hover:text-red-400"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </nav>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs 
            defaultValue="account" 
            value={selectedTab} 
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsContent value="account">
              <Card className="bg-dark-card border-gray-800 p-6">
                <h2 className="text-xl font-semibold mb-6">Account Information</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your username"
                              className="bg-dark-lighter border-gray-700"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            This is your public display name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              className="bg-dark-lighter border-gray-700"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            Used for account recovery and notifications.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center gap-2 py-2 px-3 bg-dark-lighter rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium">Phone Number</div>
                        <div className="text-sm text-gray-400">{user.countryCode} {user.phoneNumber}</div>
                      </div>
                      <Badge variant="outline" className="border-gray-700">
                        Verified
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 py-2 px-3 bg-dark-lighter rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium">Country</div>
                        <div className="text-sm text-gray-400">{user.country}</div>
                      </div>
                      <Badge variant="outline" className="border-gray-700">
                        {user.currency}
                      </Badge>
                    </div>
                    
                    {user.kycStatus !== "verified" && (
                      <Alert className="bg-yellow-900/20 border-yellow-700/30 text-yellow-500">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>KYC Verification Required</AlertTitle>
                        <AlertDescription className="text-gray-300">
                          Complete your KYC verification to enable withdrawals and participate in high-stakes tournaments.
                          <Button 
                            variant="link" 
                            onClick={goToKycVerification} 
                            className="text-primary p-0 h-auto mt-1"
                          >
                            Verify Now <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary/90"
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </Card>
            </TabsContent>
            
            <TabsContent value="gaming">
              <Card className="bg-dark-card border-gray-800 p-6">
                <h2 className="text-xl font-semibold mb-6">Gaming Profile</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="gameId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Game ID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your game ID"
                              className="bg-dark-lighter border-gray-700"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            Your {user.gameMode} player ID (required for tournaments).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center gap-2 py-2 px-3 bg-dark-lighter rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium">Game Mode</div>
                        <div className="text-sm text-gray-400">{user.gameMode}</div>
                      </div>
                      <Badge className="bg-primary">
                        Active
                      </Badge>
                    </div>
                    
                    <Alert className="bg-dark-lighter border-gray-700 text-gray-300">
                      <Gamepad2 className="h-4 w-4" />
                      <AlertTitle>Game Preference</AlertTitle>
                      <AlertDescription>
                        Your preferred game is {user.gameMode}. This affects the tournaments and matches displayed to you.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary/90"
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}