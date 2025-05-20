import { useContext } from "react";
import { TournamentContext } from "@/context/TournamentContext";

export function useTournaments() {
  const context = useContext(TournamentContext);
  
  if (context === undefined) {
    throw new Error("useTournaments must be used within a TournamentProvider");
  }
  
  return context;
}
