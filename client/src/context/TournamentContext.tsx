import { createContext, useState, useCallback, ReactNode } from "react";
import { Tournament, Match, User, TournamentFilters } from "@/types";

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

export const TournamentContext = createContext<TournamentContextType>({
  tournaments: [],
  loading: false,
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
  // Initialize with dummy tournament data
  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: 1,
      title: "BGMI Pro League Season 1",
      description: "Official BGMI tournament with large prize pool",
      image: "https://placehold.co/600x400/2a2a2a/e6e6e6.png?text=BGMI+Pro+League",
      mode: "Squad",
      map: "Erangel",
      entryFee: 250,
      prizePool: 10000,
      perKill: 25,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      maxPlayers: 100,
      registeredPlayers: 76,
      status: "upcoming",
      rules: "Standard BGMI competitive rules apply. No emulators allowed.",
      createdAt: new Date()
    },
    {
      id: 2,
      title: "Solo Showdown",
      description: "Test your individual skills against the best",
      image: "https://placehold.co/600x400/2a2a2a/e6e6e6.png?text=Solo+Showdown",
      mode: "Solo",
      map: "Miramar",
      entryFee: 100,
      prizePool: 5000,
      perKill: 20,
      date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      maxPlayers: 100,
      registeredPlayers: 87,
      status: "upcoming",
      rules: "Solo mode only. Top 10 win prizes.",
      createdAt: new Date()
    },
    {
      id: 3,
      title: "Duo Destruction",
      description: "Team up with your best friend and dominate",
      image: "https://placehold.co/600x400/2a2a2a/e6e6e6.png?text=Duo+Destruction",
      mode: "Duo",
      map: "Sanhok",
      entryFee: 150,
      prizePool: 7500,
      perKill: 30,
      date: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      maxPlayers: 50,
      registeredPlayers: 42,
      status: "upcoming",
      rules: "Duos only. No teaming with other pairs.",
      createdAt: new Date()
    },
    {
      id: 4,
      title: "Nigerian PUBG Finals",
      description: "Biggest PUBG tournament in Nigeria",
      image: "https://placehold.co/600x400/2a2a2a/e6e6e6.png?text=Nigerian+PUBG+Finals",
      mode: "Squad",
      map: "Vikendi",
      entryFee: 1000,
      prizePool: 100000,
      perKill: 100,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
      maxPlayers: 100,
      registeredPlayers: 100,
      status: "active",
      rules: "Official NGN PUBG tournament rules.",
      createdAt: new Date()
    },
    {
      id: 5,
      title: "Global Gamers Cup",
      description: "International competition with players worldwide",
      image: "https://placehold.co/600x400/2a2a2a/e6e6e6.png?text=Global+Gamers+Cup",
      mode: "Squad",
      map: "Erangel",
      entryFee: 5,
      prizePool: 1000,
      perKill: 10,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxPlayers: 200,
      registeredPlayers: 178,
      status: "upcoming",
      rules: "International rules apply. English communication required.",
      createdAt: new Date()
    },
    {
      id: 6,
      title: "Livik Lightning",
      description: "Fast-paced matches on the smallest map",
      image: "https://placehold.co/600x400/2a2a2a/e6e6e6.png?text=Livik+Lightning",
      mode: "Solo",
      map: "Livik",
      entryFee: 50,
      prizePool: 2500,
      perKill: 15,
      date: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      maxPlayers: 80,
      registeredPlayers: 32,
      status: "upcoming",
      rules: "Quick matches, 15 minutes maximum per round.",
      createdAt: new Date()
    },
    {
      id: 7,
      title: "Weekly Warfare",
      description: "Regular weekly tournament for casual players",
      image: "https://placehold.co/600x400/2a2a2a/e6e6e6.png?text=Weekly+Warfare",
      mode: "Squad",
      map: "Miramar",
      entryFee: 0,
      prizePool: 1000,
      perKill: 10,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      maxPlayers: 100,
      registeredPlayers: 67,
      status: "completed",
      rules: "Free entry, sponsored prizes.",
      createdAt: new Date()
    },
    {
      id: 8,
      title: "Pro vs Streamers",
      description: "Watch top streamers compete against pro players",
      image: "https://placehold.co/600x400/2a2a2a/e6e6e6.png?text=Pro+vs+Streamers",
      mode: "Squad",
      map: "Erangel",
      entryFee: 0,
      prizePool: 20000,
      perKill: 50,
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      maxPlayers: 64,
      registeredPlayers: 64,
      status: "completed",
      rules: "Invite only. Streaming required.",
      createdAt: new Date()
    }
  ]);
  
  const [matches, setMatches] = useState<Match[]>([
    {
      id: 1,
      tournamentId: 4,
      matchNumber: 1,
      startTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      endTime: new Date(Date.now() - 11 * 60 * 60 * 1000), // 11 hours ago
      status: "completed",
      roomId: "ABCD1234",
      roomPassword: "nigeria123",
      results: null,
      playerIds: [1, 2, 3, 4],
      createdAt: new Date()
    },
    {
      id: 2,
      tournamentId: 4,
      matchNumber: 2,
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      status: "upcoming",
      roomId: "EFGH5678",
      roomPassword: "nigeria456",
      results: null,
      playerIds: [1, 2, 3, 4],
      createdAt: new Date()
    },
    {
      id: 3,
      tournamentId: 7,
      matchNumber: 1,
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 days ago + 2 hours
      endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 2 days ago + 3 hours
      status: "completed",
      roomId: "IJKL9012",
      roomPassword: "weekly123",
      results: "Team Destroyers won with 25 kills",
      playerIds: [5, 6, 7, 8],
      createdAt: new Date()
    }
  ]);
  
  const [loading, setLoading] = useState<boolean>(false);
  
  const joinTournament = useCallback(async (
    tournamentId: number, 
    user: User, 
    teammates: number[]
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Find tournament
      const tournament = tournaments.find(t => t.id === tournamentId);
      if (!tournament) {
        setLoading(false);
        return false;
      }
      
      // Generate team ID
      const teamId = `team_${user.id}_${new Date().getTime()}`;
      
      // Create match record
      const newMatch: Match = {
        id: matches.length + 1,
        tournamentId,
        tournamentTitle: tournament.title,
        userId: user.id,
        map: tournament.map,
        mode: tournament.mode,
        date: tournament.date,
        status: "upcoming",
        teamMembers: teammates,
        position: null,
        kills: null,
        result: null,
        screenshot: null,
        prize: null,
        createdAt: new Date(),
        roomDetails: {
          roomId: null,
          roomPassword: null,
          startTime: tournament.date
        }
      };
      
      // Add to matches list
      setMatches(prev => [...prev, newMatch]);
      
      // Update tournament slots
      const updatedTournament = { 
        ...tournament, 
        registeredPlayers: (tournament.registeredPlayers || 0) + 1 
      };
      
      // Update tournament
      setTournaments(prev => 
        prev.map(t => t.id === tournamentId ? updatedTournament : t)
      );
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error joining tournament:", error);
      setLoading(false);
      return false;
    }
  }, [tournaments, matches]);
  
  const getTournament = useCallback((id: number): Tournament | undefined => {
    return tournaments.find(tournament => tournament.id === id);
  }, [tournaments]);
  
  const getUserMatches = useCallback((userId: number): Match[] => {
    return matches.filter(match => match.userId === userId);
  }, [matches]);
  
  const getMatch = useCallback((id: number): Match | undefined => {
    return matches.find(match => match.id === id);
  }, [matches]);
  
  const uploadResult = useCallback(async (
    matchId: number, 
    screenshot: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Find the match
      const match = matches.find(m => m.id === matchId);
      if (!match) {
        setLoading(false);
        return false;
      }
      
      // Update match with screenshot
      const updatedMatch = { 
        ...match, 
        screenshot,
        status: "verifying"
      };
      
      // Update matches list
      setMatches(prev => 
        prev.map(m => m.id === matchId ? updatedMatch : m)
      );
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error uploading result:", error);
      setLoading(false);
      return false;
    }
  }, [matches]);
  
  const filterTournaments = useCallback((filters: TournamentFilters): Tournament[] => {
    return tournaments.filter(tournament => {
      // Filter by game mode if specified
      if (filters.gameMode && tournament.gameMode !== filters.gameMode) {
        return false;
      }
      
      // Filter by entry fee range if specified
      if (filters.entryFee) {
        const { min, max } = filters.entryFee;
        if (
          (min !== undefined && tournament.entryFee < min) || 
          (max !== undefined && tournament.entryFee > max)
        ) {
          return false;
        }
      }
      
      // Filter by map if specified
      if (filters.map && tournament.map !== filters.map) {
        return false;
      }
      
      // Filter by date range if specified
      if (filters.date) {
        const { from, to } = filters.date;
        const tournamentDate = new Date(tournament.date);
        
        if (
          (from && tournamentDate < from) || 
          (to && tournamentDate > to)
        ) {
          return false;
        }
      }
      
      // Filter by status if specified
      if (filters.status && tournament.status !== filters.status) {
        return false;
      }
      
      // Filter by currency if specified
      if (filters.currency && tournament.currency !== filters.currency) {
        return false;
      }
      
      return true;
    });
  }, [tournaments]);
  
  return (
    <TournamentContext.Provider
      value={{
        tournaments,
        loading,
        joinTournament,
        getTournament,
        getUserMatches,
        getMatch,
        uploadResult,
        filterTournaments
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};