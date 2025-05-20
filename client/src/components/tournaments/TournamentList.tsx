import { useState } from "react";
import { Tournament } from "@/types";
import TournamentCard from "./TournamentCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TournamentListProps {
  tournaments: Tournament[];
  title?: string;
  showViewMore?: boolean;
  onViewMore?: () => void;
  limit?: number;
}

const TournamentList = ({
  tournaments,
  title = "Upcoming Tournaments",
  showViewMore = true,
  onViewMore,
  limit = 6
}: TournamentListProps) => {
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "tomorrow">("all");
  const [displayLimit, setDisplayLimit] = useState(limit);

  // Filter tournaments based on selected date
  const filteredTournaments = tournaments.filter(tournament => {
    if (dateFilter === "all") return true;
    
    const tournamentDate = new Date(tournament.date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Remove time part for comparison
    tournamentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    
    if (dateFilter === "today") {
      return tournamentDate.getTime() === today.getTime();
    } else if (dateFilter === "tomorrow") {
      return tournamentDate.getTime() === tomorrow.getTime();
    }
    
    return true;
  });

  const visibleTournaments = filteredTournaments.slice(0, displayLimit);
  const hasMore = filteredTournaments.length > displayLimit;

  const handleViewMore = () => {
    if (onViewMore) {
      onViewMore();
    } else {
      setDisplayLimit(prev => prev + limit);
    }
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold font-poppins">{title}</h2>
        <Tabs defaultValue="all" onValueChange={(value) => setDateFilter(value as "all" | "today" | "tomorrow")}>
          <TabsList className="bg-dark-lighter">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">All</TabsTrigger>
            <TabsTrigger value="today" className="data-[state=active]:bg-primary data-[state=active]:text-white">Today</TabsTrigger>
            <TabsTrigger value="tomorrow" className="data-[state=active]:bg-primary data-[state=active]:text-white">Tomorrow</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Tournament Cards Grid */}
      {visibleTournaments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleTournaments.map(tournament => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      ) : (
        <div className="bg-dark-card p-6 rounded-xl text-center text-gray-400">
          <p>No tournaments found for the selected filter.</p>
        </div>
      )}
      
      {/* View More Button */}
      {showViewMore && hasMore && (
        <div className="mt-6 text-center">
          <Button 
            variant="outline"
            className="px-6 py-2 bg-dark-lighter text-white rounded-lg hover:bg-dark-lighter border-0 flex items-center gap-2 mx-auto"
            onClick={handleViewMore}
          >
            View More Tournaments 
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
};

export default TournamentList;
