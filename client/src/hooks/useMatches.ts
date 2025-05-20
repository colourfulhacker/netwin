import { useState, useEffect } from "react";
import { Match } from "@/types";
import { useTournaments } from "./useTournaments";
import { useAuth } from "./useAuth";

export function useMatches() {
  const { getUserMatches, uploadResult } = useTournaments();
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      const userMatches = getUserMatches(user.id);
      setMatches(userMatches);
      setLoading(false);
    }
  }, [user, getUserMatches]);
  
  const getUpcomingMatches = () => {
    return matches.filter(match => 
      match.status === "upcoming" || match.status === "live"
    ).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };
  
  const getCompletedMatches = () => {
    return matches.filter(match => 
      match.status === "completed"
    ).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };
  
  const uploadMatchResult = async (matchId: number, screenshot: string) => {
    if (!user) return false;
    
    const success = await uploadResult(matchId, screenshot);
    
    if (success) {
      // Update local state
      setMatches(prev => 
        prev.map(match => 
          match.id === matchId 
            ? { ...match, resultSubmitted: true, resultScreenshot: screenshot }
            : match
        )
      );
    }
    
    return success;
  };
  
  return {
    matches,
    loading,
    getUpcomingMatches,
    getCompletedMatches,
    uploadMatchResult
  };
}
