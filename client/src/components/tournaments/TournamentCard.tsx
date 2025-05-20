import { useState } from "react";
import { useLocation } from "wouter";
import { Tournament } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { formatMatchTime, formatCurrency } from "@/lib/utils";
import { Calendar, MapPin } from "lucide-react";
import JoinTournamentModal from "./JoinTournamentModal";

interface TournamentCardProps {
  tournament: Tournament;
}

const TournamentCard = ({ tournament }: TournamentCardProps) => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      setLocation("/login");
      return;
    }
    
    setJoinModalOpen(true);
  };

  const handleCardClick = () => {
    setLocation(`/tournament/${tournament.id}`);
  };

  return (
    <>
      <div 
        className="tournament-card bg-dark-card rounded-xl overflow-hidden border border-gray-800 cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Tournament Image */}
        <div className="h-40 relative overflow-hidden">
          <img 
            src={tournament.image} 
            alt={tournament.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 right-0 p-3 flex justify-between">
            <span className="bg-dark bg-opacity-70 text-xs font-medium px-2 py-0.5 rounded text-white">
              {tournament.mode}
            </span>
            <span className="bg-success text-white text-xs font-medium px-2 py-0.5 rounded">
              ENTRY: {formatCurrency(tournament.entryFee, user?.currency || "USD")}
            </span>
          </div>
        </div>
        
        {/* Tournament Details */}
        <div className="p-4">
          <h3 className="font-bold font-poppins">{tournament.title}</h3>
          
          {/* Time and Map */}
          <div className="flex justify-between items-center mt-2 text-sm">
            <div className="flex items-center text-gray-300">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatMatchTime(new Date(tournament.date))}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{tournament.map}</span>
            </div>
          </div>
          
          {/* Prize and Registration Info */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="text-center bg-dark-lighter p-2 rounded">
              <p className="text-xs text-gray-400">Prize Pool</p>
              <p className="font-rajdhani font-semibold text-green-400">
                {formatCurrency(tournament.prizePool, user?.currency || "USD")}
              </p>
            </div>
            <div className="text-center bg-dark-lighter p-2 rounded">
              <p className="text-xs text-gray-400">Per Kill</p>
              <p className="font-rajdhani font-semibold text-yellow-400">
                {formatCurrency(tournament.perKill, user?.currency || "USD")}
              </p>
            </div>
            <div className="text-center bg-dark-lighter p-2 rounded">
              <p className="text-xs text-gray-400">Slots</p>
              <p className="font-rajdhani font-semibold text-accent">
                {tournament.registeredPlayers}/{tournament.maxPlayers}
              </p>
            </div>
          </div>
          
          {/* Join Button */}
          <Button 
            className="w-full mt-4 bg-gradient-to-r from-primary to-secondary text-white py-2 rounded-lg font-medium text-sm transition hover:opacity-90"
            onClick={handleJoinClick}
            disabled={tournament.status === "completed" || tournament.status === "cancelled"}
          >
            {tournament.status === "completed" ? "Tournament Ended" : 
             tournament.status === "cancelled" ? "Tournament Cancelled" : 
             tournament.status === "live" ? "Join Live Tournament" : "Join Tournament"}
          </Button>
        </div>
      </div>
      
      {/* Join Tournament Modal */}
      <JoinTournamentModal 
        tournament={tournament}
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />
    </>
  );
};

export default TournamentCard;
