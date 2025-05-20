import { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Tournament, Match, User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { 
  getStoredTournaments, 
  storeTournaments,
  getStoredMatches,
  storeMatches,
  getMatchById,
  getTournamentById,
  addWalletTransaction,
  addNotification
} from "@/utils/helpers";

interface TournamentContextType {
  tournaments: Tournament[];
  loading: boolean;
  joinTournament: (tournamentId: number, user: User, teammates: number[]) => Promise<boolean>;
  getTournament: (id: number) => Tournament | undefined;
  getUserMatches: (userId: number) => Match[];
  getMatch: (id: number) => Match | undefined;
  uploadResult: (matchId: number, screenshot: string) => Promise<boolean>;
  filterTournaments: (filters: TournamentFilters) => Tournament[];
}

interface TournamentFilters {
  status?: Tournament['status'];
  mode?: Tournament['mode'];
  gameMode?: "PUBG" | "BGMI";
  map?: string;
  search?: string;
}

export const TournamentContext = createContext<TournamentContextType>({
  tournaments: [],
  loading: true,
  joinTournament: async () => false,
  getTournament: () => undefined,
  getUserMatches: () => [],
  getMatch: () => undefined,
  uploadResult: async () => false,
  filterTournaments: () => []
});

interface TournamentProviderProps {
  children: ReactNode;
}

export const TournamentProvider = ({ children }: TournamentProviderProps) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Load tournaments on mount
  useEffect(() => {
    const loadTournaments = () => {
      // First try to get from localStorage
      const storedTournaments = getStoredTournaments();
      
      if (storedTournaments.length > 0) {
        setTournaments(storedTournaments);
        setLoading(false);
        return;
      }
      
      // If no tournaments in localStorage, generate mock data
      const mockTournaments: Tournament[] = [
        {
          id: 1,
          title: "Erangel Night Havoc #45",
          description: "Join our premier Erangel tournament for a chance to win big prizes!",
          image: "https://pixabay.com/get/g39ec8bc5c8f9f295ef9a3faf08e2f6a5bbbce98582c7ad567e6af0d8936f16e9b0f6fcf273ad9b5bf7925c35515f5175e690c88378b0f75b849ea19c38b8a79d_1280.jpg",
          mode: "SQUAD",
          entryFee: 100,
          prizePool: 1000,
          perKill: 20,
          date: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // 4 hours from now
          map: "Erangel",
          maxPlayers: 100,
          registeredPlayers: 36,
          status: "upcoming",
          gameMode: "BGMI"
        },
        {
          id: 2,
          title: "Miramar Mayhem Duo #12",
          description: "Battle it out with your duo partner in the harsh desert of Miramar!",
          image: "https://pixabay.com/get/g7d07aacf5dec5ae46c0f7a702c88f8e4bcc8a034dc42b31530d49d10f3a9631caa4978401cdfa02842a4931c13209cd98e58f636c6b317cf8b6c605a4264e5c0_1280.jpg",
          mode: "DUO",
          entryFee: 75,
          prizePool: 800,
          perKill: 15,
          date: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // 24 hours from now
          map: "Miramar",
          maxPlayers: 50,
          registeredPlayers: 24,
          status: "upcoming",
          gameMode: "PUBG"
        },
        {
          id: 3,
          title: "Sanhok Solo Sniper #8",
          description: "Show your solo skills in this sniper-focused tournament on Sanhok!",
          image: "https://images.unsplash.com/photo-1599409636295-e3cf3538f212?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
          mode: "SOLO",
          entryFee: 50,
          prizePool: 500,
          perKill: 10,
          date: new Date(Date.now() + 2 * 3600 * 1000).toISOString(), // 2 hours from now
          map: "Sanhok",
          maxPlayers: 100,
          registeredPlayers: 65,
          status: "upcoming",
          gameMode: "PUBG"
        },
        {
          id: 4,
          title: "Pro Championship Series #128",
          description: "Our flagship tournament series with the biggest prize pool!",
          image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
          mode: "SQUAD",
          entryFee: 200,
          prizePool: 5000,
          perKill: 50,
          date: new Date(Date.now() + 1 * 3600 * 1000).toISOString(), // 1 hour from now
          map: "Erangel",
          maxPlayers: 100,
          registeredPlayers: 78,
          status: "upcoming",
          gameMode: "BGMI",
          roomDetails: {
            roomId: "",
            password: "",
            visibleAt: new Date(Date.now() + 45 * 60 * 1000).toISOString() // 45 minutes from now
          }
        },
        {
          id: 5,
          title: "Pro Championship Series #127",
          description: "Our flagship tournament series with the biggest prize pool!",
          image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
          mode: "SQUAD",
          entryFee: 200,
          prizePool: 5000,
          perKill: 50,
          date: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // Started 15 min ago
          map: "Erangel",
          maxPlayers: 100,
          registeredPlayers: 92,
          status: "live",
          gameMode: "BGMI",
          roomDetails: {
            roomId: "ABCD1234",
            password: "123456",
            visibleAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 min ago
          }
        }
      ];
      
      // Store mock tournaments in localStorage
      storeTournaments(mockTournaments);
      setTournaments(mockTournaments);
      setLoading(false);
    };
    
    loadTournaments();
  }, []);
  
  // Join a tournament
  const joinTournament = async (
    tournamentId: number, 
    user: User, 
    teammates: number[] = []
  ): Promise<boolean> => {
    try {
      // Get the tournament
      const tournament = tournaments.find(t => t.id === tournamentId);
      
      if (!tournament) {
        toast({
          title: "Tournament Not Found",
          description: "The tournament you're trying to join doesn't exist.",
          variant: "destructive"
        });
        return false;
      }
      
      // Check if user has enough balance
      if (user.walletBalance < tournament.entryFee) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough balance to join this tournament.",
          variant: "destructive"
        });
        return false;
      }
      
      // Create new match object
      const newMatch: Match = {
        id: Date.now(),
        tournamentId,
        tournamentTitle: tournament.title,
        date: tournament.date,
        status: tournament.status,
        mode: tournament.mode,
        map: tournament.map,
        teamMembers: [
          {
            id: user.id,
            username: user.username,
            gameId: user.gameId || "Unknown",
            profilePicture: user.profilePicture,
            isOwner: true
          },
          // Add teammates (would come from the database in a real app)
          ...teammates.map(id => ({
            id,
            username: `Teammate${id}`,
            gameId: `GAME${id}`,
            profilePicture: undefined,
            isOwner: false
          }))
        ],
        roomDetails: tournament.roomDetails,
        resultSubmitted: false,
        resultApproved: false
      };
      
      // Add match to localStorage
      const matches = getStoredMatches(user.id);
      matches.push(newMatch);
      storeMatches(matches);
      
      // Deduct entry fee from wallet
      addWalletTransaction({
        id: Date.now(),
        userId: user.id,
        amount: tournament.entryFee,
        type: "entry_fee",
        status: "completed",
        details: `Entry fee for ${tournament.title}`,
        createdAt: new Date().toISOString()
      });
      
      // Update registered players count
      const updatedTournaments = tournaments.map(t => 
        t.id === tournamentId 
          ? { ...t, registeredPlayers: t.registeredPlayers + 1 } 
          : t
      );
      
      setTournaments(updatedTournaments);
      storeTournaments(updatedTournaments);
      
      // Add notification
      addNotification({
        id: Date.now(),
        userId: user.id,
        title: "Tournament Joined",
        message: `You've successfully joined ${tournament.title}. Good luck!`,
        type: "match",
        read: false,
        createdAt: new Date().toISOString()
      });
      
      toast({
        title: "Tournament Joined",
        description: `You've successfully joined ${tournament.title}. Good luck!`,
      });
      
      return true;
    } catch (error) {
      console.error("Join tournament error:", error);
      toast({
        title: "Failed to Join",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Get a single tournament by ID
  const getTournament = useCallback((id: number): Tournament | undefined => {
    return getTournamentById(id);
  }, []);
  
  // Get all matches for a user
  const getUserMatches = useCallback((userId: number): Match[] => {
    return getStoredMatches(userId);
  }, []);
  
  // Get a single match by ID
  const getMatch = useCallback((id: number): Match | undefined => {
    return getMatchById(id);
  }, []);
  
  // Upload match result (screenshot)
  const uploadResult = async (matchId: number, screenshot: string): Promise<boolean> => {
    try {
      const matches = getStoredMatches(0); // Get all matches
      const matchIndex = matches.findIndex(m => m.id === matchId);
      
      if (matchIndex === -1) {
        toast({
          title: "Match Not Found",
          description: "The match you're trying to upload results for doesn't exist.",
          variant: "destructive"
        });
        return false;
      }
      
      // Update match with screenshot
      matches[matchIndex] = {
        ...matches[matchIndex],
        resultSubmitted: true,
        resultScreenshot: screenshot
      };
      
      // Update matches in localStorage
      storeMatches(matches);
      
      toast({
        title: "Results Uploaded",
        description: "Your results have been submitted for review.",
      });
      
      return true;
    } catch (error) {
      console.error("Upload result error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload results. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Filter tournaments based on criteria
  const filterTournaments = useCallback((filters: TournamentFilters): Tournament[] => {
    let filtered = [...tournaments];
    
    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    
    if (filters.mode) {
      filtered = filtered.filter(t => t.mode === filters.mode);
    }
    
    if (filters.gameMode) {
      filtered = filtered.filter(t => t.gameMode === filters.gameMode);
    }
    
    if (filters.map) {
      filtered = filtered.filter(t => t.map === filters.map);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchLower) || 
        (t.description && t.description.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [tournaments]);
  
  return (
    <TournamentContext.Provider value={{
      tournaments,
      loading,
      joinTournament,
      getTournament,
      getUserMatches,
      getMatch,
      uploadResult,
      filterTournaments
    }}>
      {children}
    </TournamentContext.Provider>
  );
};
