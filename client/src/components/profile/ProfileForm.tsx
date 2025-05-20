import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GameModeSelector from "@/components/common/GameModeSelector";
import { validateGameId } from "@/utils/utils";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username cannot exceed 20 characters"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  gameId: z.string().min(6, "Game ID is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileForm = () => {
  const { profile, updateProfile } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || "",
      email: profile?.email || "",
      gameId: profile?.gameId || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!profile) return;
    
    // Validate game ID based on game mode
    if (!validateGameId(data.gameId, profile.gameMode)) {
      form.setError("gameId", {
        type: "manual",
        message: `Please enter a valid ${profile.gameMode} ID`,
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Update profile
      updateProfile({
        username: data.username,
        email: data.email,
        gameId: data.gameId,
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Profile Avatar */}
      <div className="flex flex-col sm:flex-row gap-6 items-center p-6 bg-dark-card rounded-xl border border-gray-800">
        <Avatar className="h-24 w-24 border-2 border-primary">
          <AvatarImage src={profile.profilePicture} alt={profile.username} />
          <AvatarFallback className="bg-primary/20 text-primary-foreground text-2xl">
            {profile.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold font-poppins">{profile.username}</h2>
          <p className="text-gray-400">{profile.countryCode} {profile.phoneNumber}</p>
          <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="bg-dark-lighter px-2 py-1 text-xs rounded-full text-gray-300">
              {profile.gameMode}
            </span>
            <span className="bg-dark-lighter px-2 py-1 text-xs rounded-full text-gray-300">
              {profile.country}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full text-white ${
              profile.kycStatus === "approved" ? "bg-green-600" :
              profile.kycStatus === "pending" ? "bg-yellow-600" :
              profile.kycStatus === "rejected" ? "bg-red-600" :
              "bg-gray-600"
            }`}>
              KYC: {profile.kycStatus.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Profile Form */}
      <div className="p-6 bg-dark-card rounded-xl border border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-dark-lighter border-0 focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email"
                        className="bg-dark-lighter border-0 focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormDescription>
                      For notifications and recovery.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel>Phone Number</FormLabel>
                <Input 
                  value={`${profile.countryCode} ${profile.phoneNumber}`}
                  disabled
                  className="bg-dark-lighter border-0 opacity-70"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Phone number cannot be changed.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormLabel>Game Mode</FormLabel>
                <GameModeSelector />
              </div>
              
              <FormField
                control={form.control}
                name="gameId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game ID</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={`Your ${profile.gameMode} ID`}
                        className="bg-dark-lighter border-0 focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormDescription>
                      Your in-game ID for {profile.gameMode}.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary to-secondary"
                disabled={loading}
              >
                {loading ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ProfileForm;
