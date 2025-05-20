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
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
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