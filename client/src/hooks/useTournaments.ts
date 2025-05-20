import { useContext } from "react";
import { TournamentContext } from "@/context/TournamentContext";

export const useTournaments = () => {
  const context = useContext(TournamentContext);
  
  if (!context) {
    throw new Error("useTournaments must be used within a TournamentProvider");
  }
  
  return context;
};