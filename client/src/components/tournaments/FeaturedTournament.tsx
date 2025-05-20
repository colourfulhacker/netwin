import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTournaments } from "@/hooks/useTournaments";
import { Tournament } from "@/types";
import { Button } from "@/components/ui/button";
import { formatMatchTime, formatCurrency } from "@/lib/utils";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import { useState } from "react";
import JoinTournamentModal from "./JoinTournamentModal";

interface FeaturedTournamentProps {
  tournament: Tournament;
}

const FeaturedTournament = ({ tournament }: FeaturedTournamentProps) => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { joinTournament } = useTournaments();
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const handleJoinClick = () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    
    setJoinModalOpen(true);
  };

  const handleViewDetails = () => {
    setLocation(`/tournament/${tournament.id}`);
  };

  return (
    <section className="mb-8">
      <div className="relative overflow-hidden rounded-xl h-60 sm:h-80">
        <img 
          src={tournament.image} 
          alt={tournament.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            {tournament.status === "live" && (
              <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded">LIVE</span>
            )}
            <span className="bg-dark bg-opacity-70 text-white text-xs font-medium px-2 py-0.5 rounded">
              {tournament.mode}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-poppins text-white">{tournament.title}</h2>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center text-sm text-white">
              <Calendar className="h-4 w-4 mr-1" />
              {formatMatchTime(new Date(tournament.date))}
            </div>
            <div className="flex items-center text-sm text-white">
              <MapPin className="h-4 w-4 mr-1" />
              {tournament.map}
            </div>
            <div className="flex items-center text-sm text-white">
              <DollarSign className="h-4 w-4 mr-1 text-yellow-400" />
              Prize: {formatCurrency(tournament.prizePool, user?.currency || "USD")}
            </div>
          </div>
          <div className="mt-3 flex gap-3">
            <Button 
              className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-lg transition"
              onClick={handleJoinClick}
              disabled={tournament.status === "completed" || tournament.status === "cancelled"}
            >
              {tournament.status === "completed" ? "Ended" : tournament.status === "cancelled" ? "Cancelled" : "Join Now"}
            </Button>
            <Button 
              variant="outline"
              className="border-gray-600 text-white hover:bg-dark-lighter"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
      
      {/* Join Tournament Modal */}
      <JoinTournamentModal 
        tournament={tournament}
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />
    </section>
  );
};

export default FeaturedTournament;
