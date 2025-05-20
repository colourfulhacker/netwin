import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { TeamMember } from "@/types";
import { getSquadMembers, addSquadMember, removeSquadMember } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { validateGameId } from "@/utils/utils";

interface SquadManagementProps {
  maxMembers?: number;
  onSelectionChange?: (selectedIds: number[]) => void;
  compact?: boolean;
}

const addMemberSchema = z.object({
  username: z.string().min(3, "Username is required"),
  gameId: z.string().min(6, "Game ID is required"),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

const SquadManagement = ({ 
  maxMembers = 4,
  onSelectionChange,
  compact = false
}: SquadManagementProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [squadMembers, setSquadMembers] = useState<TeamMember[]>([]);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  
  useEffect(() => {
    if (user) {
      const members = getSquadMembers(user.id);
      setSquadMembers(members);
    }
  }, [user]);
  
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedMembers);
    }
  }, [selectedMembers, onSelectionChange]);
  
  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      username: "",
      gameId: "",
    },
  });
  
  const onAddMember = async (data: AddMemberFormValues) => {
    if (!user) return;
    
    // Validate game ID based on game mode
    if (!validateGameId(data.gameId, user.gameMode)) {
      form.setError("gameId", {
        type: "manual",
        message: `Please enter a valid ${user.gameMode} ID`,
      });
      return;
    }
    
    try {
      // Create new squad member
      const newMember: TeamMember = {
        id: Date.now(),
        username: data.username,
        gameId: data.gameId,
        profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=6C3AFF&color=fff&size=200`,
        isOwner: false
      };
      
      // Add to storage
      addSquadMember(user.id, newMember);
      
      // Update local state
      setSquadMembers(prev => [...prev, newMember]);
      
      // Reset form and close dialog
      form.reset();
      setAddMemberOpen(false);
      
      toast({
        title: "Teammate Added",
        description: `${data.username} has been added to your squad.`,
      });
    } catch (error) {
      toast({
        title: "Failed to Add Teammate",
        description: "An error occurred while adding teammate.",
        variant: "destructive",
      });
    }
  };
  
  const handleRemoveMember = (memberId: number) => {
    if (!user) return;
    
    try {
      // Remove from storage
      removeSquadMember(user.id, memberId);
      
      // Update local state
      setSquadMembers(prev => prev.filter(member => member.id !== memberId));
      
      // If member was selected, remove from selection
      if (selectedMembers.includes(memberId)) {
        setSelectedMembers(prev => prev.filter(id => id !== memberId));
      }
      
      toast({
        title: "Teammate Removed",
        description: "Teammate has been removed from your squad.",
      });
    } catch (error) {
      toast({
        title: "Failed to Remove Teammate",
        description: "An error occurred while removing teammate.",
        variant: "destructive",
      });
    }
  };
  
  const handleToggleSelect = (memberId: number) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        // Check if max members reached
        if (prev.length >= maxMembers) {
          toast({
            title: "Maximum Members Reached",
            description: `You can only select ${maxMembers} teammates.`,
            variant: "destructive",
          });
          return prev;
        }
        return [...prev, memberId];
      }
    });
  };
  
  if (!user) return null;
  
  return (
    <div className={`space-y-4 ${compact ? '' : 'p-6 bg-dark-card rounded-xl border border-gray-800'}`}>
      {!compact && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>My Squad</span>
          </h3>
          <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-secondary">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Teammate
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dark-card text-white border-gray-800">
              <DialogHeader>
                <DialogTitle>Add Teammate</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Add a new teammate to your squad.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onAddMember)} className="space-y-4 pt-2">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teammate Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter their name"
                            className="bg-dark-lighter border-0 focus-visible:ring-2 focus-visible:ring-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gameId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{user.gameMode} ID</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={`Enter their ${user.gameMode} ID`}
                            className="bg-dark-lighter border-0 focus-visible:ring-2 focus-visible:ring-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setAddMemberOpen(false)}
                      className="border-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      Add Teammate
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      )}
      
      {squadMembers.length === 0 ? (
        <div className={`${compact ? 'p-4' : 'p-8'} text-center bg-dark-lighter rounded-lg`}>
          <p className="text-gray-400">
            {compact ? "No teammates added yet." : "You haven't added any teammates to your squad yet."}
          </p>
          {!compact && (
            <Button 
              className="mt-4 bg-gradient-to-r from-primary to-secondary"
              onClick={() => setAddMemberOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Teammate
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Show current user if not in compact mode */}
          {!compact && (
            <div className="bg-dark-lighter rounded-lg p-3 border border-primary">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={user.profilePicture} alt={user.username} />
                  <AvatarFallback className="bg-primary/20">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{user.username} (You)</div>
                  <div className="text-xs text-gray-400">{user.gameId || "No Game ID"}</div>
                </div>
                <div className="px-2 py-1 bg-primary bg-opacity-20 text-primary text-xs rounded">
                  Owner
                </div>
              </div>
            </div>
          )}
          
          {/* Show squad members */}
          {squadMembers.map((member) => (
            <div 
              key={member.id} 
              className={`bg-dark-lighter rounded-lg p-3 ${
                selectedMembers.includes(member.id) ? 'border border-primary' : 'border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                {onSelectionChange && (
                  <Checkbox
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={() => handleToggleSelect(member.id)}
                    className="border-gray-600"
                  />
                )}
                
                <Avatar className="h-10 w-10 border border-gray-700">
                  <AvatarImage src={member.profilePicture} alt={member.username} />
                  <AvatarFallback className="bg-primary/20">
                    {member.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="font-medium">{member.username}</div>
                  <div className="text-xs text-gray-400">{member.gameId}</div>
                </div>
                
                {!compact && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {/* Add more button in compact mode */}
          {compact && squadMembers.length < maxMembers && (
            <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
              <DialogTrigger asChild>
                <div className="bg-dark-lighter rounded-lg p-3 border border-dashed border-gray-700 flex items-center justify-center cursor-pointer hover:bg-opacity-80">
                  <div className="text-center">
                    <PlusCircle className="h-5 w-5 text-gray-400 mx-auto" />
                    <div className="text-xs text-gray-400 mt-1">Add Teammate</div>
                  </div>
                </div>
              </DialogTrigger>
              
              <DialogContent className="bg-dark-card text-white border-gray-800">
                <DialogHeader>
                  <DialogTitle>Add Teammate</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Add a new teammate to your squad.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onAddMember)} className="space-y-4 pt-2">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teammate Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter their name"
                              className="bg-dark-lighter border-0 focus-visible:ring-2 focus-visible:ring-primary"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="gameId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{user.gameMode} ID</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={`Enter their ${user.gameMode} ID`}
                              className="bg-dark-lighter border-0 focus-visible:ring-2 focus-visible:ring-primary"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter className="pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setAddMemberOpen(false)}
                        className="border-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-primary to-secondary"
                      >
                        Add Teammate
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
};

export default SquadManagement;
