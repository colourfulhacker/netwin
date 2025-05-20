import { useState } from "react";
import { useLocation } from "wouter";
import { Tournament } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useTournaments } from "@/hooks/useTournaments";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Info, Wallet, AlertTriangle, Users } from "lucide-react";
import SquadManagement from "@/components/squad/SquadManagement";

interface JoinTournamentModalProps {
  tournament: Tournament;
  open: boolean;
  onClose: () => void;
}

const JoinTournamentModal = ({ 
  tournament, 
  open, 
  onClose 
}: JoinTournamentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { joinTournament } = useTournaments();
  const { toast } = useToast();
  const [selectedTeammates, setSelectedTeammates] = useState<number[]>([]);

  // Determine max squad size based on tournament mode
  const maxSquadSize = 
    tournament.mode === "SOLO" ? 1 :
    tournament.mode === "DUO" ? 2 :
    tournament.mode === "SQUAD" ? 4 : 1;

  const handleJoin = async () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    
    // Check if user has enough balance
    if (user.walletBalance < tournament.entryFee) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to join this tournament.",
        variant: "destructive"
      });
      onClose();
      setLocation("/wallet");
      return;
    }
    
    // For squad/duo matches, check if a team is selected
    if ((tournament.mode === "SQUAD" || tournament.mode === "DUO") && 
        selectedTeammates.length < maxSquadSize - 1) {
      toast({
        title: "Team Required",
        description: `You need to select ${maxSquadSize - 1} teammates for this ${tournament.mode.toLowerCase()} tournament.`,
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    const success = await joinTournament(tournament.id, user, selectedTeammates);
    setLoading(false);
    
    if (success) {
      toast({
        title: "Tournament Joined",
        description: "You have successfully joined the tournament!",
      });
      onClose();
      setLocation("/matches");
    }
  };

  const handleAddFunds = () => {
    onClose();
    setLocation("/wallet");
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-dark-card text-white border-gray-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Tournament</DialogTitle>
          <DialogDescription className="text-gray-400">
            Confirm your entry into {tournament.title}
          </DialogDescription>
        </DialogHeader>
        
        {/* Tournament Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-dark-lighter p-3 rounded-md">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <span className="text-sm">Entry Fee</span>
            </div>
            <span className="font-medium">
              {formatCurrency(tournament.entryFee, user.currency)}
            </span>
          </div>
          
          <div className="flex items-center justify-between bg-dark-lighter p-3 rounded-md">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-sm">Your Balance</span>
            </div>
            <span className="font-medium">
              {formatCurrency(user.walletBalance, user.currency)}
            </span>
          </div>
          
          {/* Alert for insufficient balance */}
          {user.walletBalance < tournament.entryFee && (
            <div className="flex items-start gap-2 bg-red-900 bg-opacity-20 text-red-400 p-3 rounded-md">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Insufficient Balance</p>
                <p className="text-sm">
                  Add {formatCurrency(tournament.entryFee - user.walletBalance, user.currency)} more to your wallet to join this tournament.
                </p>
              </div>
            </div>
          )}
          
          {/* Squad Selection for team tournaments */}
          {(tournament.mode === "DUO" || tournament.mode === "SQUAD") && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Select Your Team</h3>
              </div>
              
              <SquadManagement 
                maxMembers={maxSquadSize - 1} 
                onSelectionChange={setSelectedTeammates}
                compact
              />
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {user.walletBalance < tournament.entryFee ? (
            <Button 
              className="w-full bg-gradient-to-r from-primary to-secondary"
              onClick={handleAddFunds}
            >
              Add Funds
            </Button>
          ) : (
            <Button 
              className="w-full bg-gradient-to-r from-primary to-secondary"
              disabled={loading || (
                (tournament.mode === "SQUAD" || tournament.mode === "DUO") && 
                selectedTeammates.length < maxSquadSize - 1
              )}
              onClick={handleJoin}
            >
              {loading ? "Joining..." : `Join for ${formatCurrency(tournament.entryFee, user.currency)}`}
            </Button>
          )}
          <Button 
            variant="outline" 
            className="w-full border-gray-800 hover:bg-dark-lighter"
            onClick={onClose}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinTournamentModal;
