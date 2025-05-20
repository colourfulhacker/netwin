import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  Users,
  MoreVertical,
  Trash2,
  Edit,
  Search,
  Gamepad,
  PlusCircle,
  Loader2,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { validateGameId } from "@/lib/utils";

// Add squad member form schema
const addMemberSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  gameId: z.string().min(4, {
    message: "Game ID must be at least 4 characters.",
  }),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

export default function Squad() {
  const { user } = useAuth();
  const { getSquadMembers, addSquadMember, removeSquadMember } = useUser();
  const { toast } = useToast();
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<number | null>(null);
  
  // Form
  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      username: "",
      gameId: "",
    },
  });
  
  if (!user) return null;
  
  // Get squad members
  const squadMembers = getSquadMembers();
  
  // Handle add member form submission
  const onSubmit = async (values: AddMemberFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Check if gameId is valid for the user's game mode
      if (!validateGameId(values.gameId, user.gameMode)) {
        toast({
          variant: "destructive",
          title: "Invalid Game ID",
          description: `Please enter a valid ${user.gameMode} player ID.`,
        });
        setIsSubmitting(false);
        return;
      }
      
      // Check if username already exists in squad
      if (squadMembers.some(member => member.username.toLowerCase() === values.username.toLowerCase())) {
        toast({
          variant: "destructive",
          title: "Duplicate Username",
          description: "This username already exists in your squad.",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Add member to squad
      const success = await addSquadMember(values.username, values.gameId);
      
      if (success) {
        toast({
          title: "Squad Member Added",
          description: "The member has been added to your squad.",
        });
        setAddMemberDialogOpen(false);
        form.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Add Member",
          description: "An error occurred. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle remove squad member
  const handleRemoveMember = async (memberId: number) => {
    setDeletingMemberId(memberId);
    
    try {
      const success = await removeSquadMember(memberId);
      
      if (success) {
        toast({
          title: "Squad Member Removed",
          description: "The member has been removed from your squad.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Remove",
          description: "An error occurred. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setDeletingMemberId(null);
    }
  };
  
  // Filter squad members based on search query
  const filteredMembers = squadMembers.filter(
    member => member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
             member.gameId.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-poppins">
            My Squad
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your team members for tournaments
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button
            onClick={() => setAddMemberDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-secondary"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>
      
      <Card className="bg-dark-card border-gray-800 p-6 mb-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by username or game ID"
            className="pl-10 bg-dark-lighter border-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {filteredMembers.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 text-sm text-gray-400 px-3">
              <div>Player</div>
              <div>Game ID</div>
              <div>Status</div>
              <div></div>
            </div>
            
            <Separator className="bg-gray-800" />
            
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-4 items-center p-3 rounded-lg bg-dark-lighter"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={member.profilePicture || undefined}
                      alt={member.username}
                    />
                    <AvatarFallback className="bg-primary/20">
                      {member.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="truncate">
                    <div className="font-medium">{member.username}</div>
                    <div className="text-xs text-gray-400">Squad Member</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="font-mono text-sm truncate">{member.gameId}</div>
                </div>
                
                <div>
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    Active
                  </Badge>
                </div>
                
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {deletingMemberId === member.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-dark-card border-gray-700">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={deletingMemberId === member.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">No Results Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              No squad members match your search query. Try a different search term.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">No Squad Members Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Add your friends to your squad to play tournaments together.
            </p>
            <Button 
              onClick={() => setAddMemberDialogOpen(true)}
              className="mt-4 bg-primary hover:bg-primary/90"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Member
            </Button>
          </div>
        )}
      </Card>
      
      <Card className="bg-dark-card border-gray-800 p-6">
        <div className="flex items-start">
          <div className="p-3 bg-primary/20 rounded-lg mr-4">
            <Gamepad className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-1">Squad Benefits</h2>
            <p className="text-gray-400 mb-4">
              Building a strong squad gives you advantages in tournaments
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Participate in DUO and SQUAD tournaments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Coordinate better with regular teammates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Easily invite squad members to tournaments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Build team synergy and improve performance</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent className="bg-dark-card border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Add Squad Member</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a friend to your squad for tournaments.
            </DialogDescription>
          </DialogHeader>
          
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
                        placeholder="Enter friend's username"
                        className="bg-dark-lighter border-gray-700"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Enter your friend's username on the platform.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gameId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`Enter ${user.gameMode} ID`}
                        className="bg-dark-lighter border-gray-700"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Their in-game ID for {user.gameMode}.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddMemberDialogOpen(false)}
                  className="border-gray-700 mt-3 sm:mt-0"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-secondary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Member"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}