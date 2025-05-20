import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTournaments } from "@/hooks/useTournaments";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Trophy,
  Users,
  Clock,
  Search,
  Filter,
  Target,
  ArrowRight,
} from "lucide-react";
import { GAME_MAPS, GAME_MODES } from "@/utils/constants";

export default function Tournaments() {
  const { user } = useAuth();
  const { tournaments, filterTournaments } = useTournaments();
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [selectedMap, setSelectedMap] = useState<string>("");
  
  if (!user) return null;
  
  // Get remaining time text
  const getRemainingTime = (date: Date): string => {
    const now = new Date();
    const tournamentDate = new Date(date);
    const diffTime = Math.abs(tournamentDate.getTime() - now.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    }
    return `${diffHours}h`;
  };
  
  // Filter tournaments based on status, search query, and filters
  const getFilteredTournaments = () => {
    // Filter by tab (status)
    let filtered = tournaments.filter(t => t.status === activeTab);
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.description?.toLowerCase().includes(query)
      );
    }
    
    // Filter by game mode
    if (selectedMode) {
      filtered = filtered.filter(t => t.mode === selectedMode);
    }
    
    // Filter by map
    if (selectedMap) {
      filtered = filtered.filter(t => t.map === selectedMap);
    }
    
    return filtered;
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedMode("");
    setSelectedMap("");
  };
  
  // Get filtered tournaments
  const filteredTournaments = getFilteredTournaments();
  
  return (
    <div className="container py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-poppins">
            Tournaments
          </h1>
          <p className="text-gray-400 mt-1">
            Join competitive tournaments and win prizes
          </p>
        </div>
      </div>
      
      <Card className="bg-dark-card border-gray-800 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tournaments..."
              className="pl-10 bg-dark-lighter border-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={selectedMode}
              onValueChange={setSelectedMode}
            >
              <SelectTrigger className="w-[140px] bg-dark-lighter border-gray-700">
                <SelectValue placeholder="Game mode" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gray-700">
                <SelectItem value="">All modes</SelectItem>
                {GAME_MODES.map(mode => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={selectedMap}
              onValueChange={setSelectedMap}
            >
              <SelectTrigger className="w-[140px] bg-dark-lighter border-gray-700">
                <SelectValue placeholder="Map" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gray-700">
                <SelectItem value="">All maps</SelectItem>
                {GAME_MAPS.map(map => (
                  <SelectItem key={map} value={map}>
                    {map}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="ghost"
              className="border border-gray-700"
              onClick={resetFilters}
            >
              <Filter className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </Card>
      
      <Tabs
        defaultValue="upcoming"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-0">
          {filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament) => (
                <Card
                  key={tournament.id}
                  className="bg-dark-card border-gray-800 overflow-hidden flex flex-col h-full"
                >
                  <div className="relative">
                    <img
                      src={tournament.image}
                      alt={tournament.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white">
                        Upcoming
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <Badge variant="outline" className="bg-dark-card/70 backdrop-blur-sm border-0">
                        <Clock className="mr-1 h-3.5 w-3.5" />
                        {getRemainingTime(tournament.date)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg mb-2">
                        {tournament.title}
                      </h3>
                      <Badge variant="outline" className="border-primary text-primary">
                        {tournament.gameMode}
                      </Badge>
                    </div>
                    
                    {tournament.description && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                        {tournament.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="mr-2 h-4 w-4" />
                        {new Date(tournament.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Users className="mr-2 h-4 w-4" />
                        {tournament.mode}
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Target className="mr-2 h-4 w-4" />
                        {tournament.map}
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Trophy className="mr-2 h-4 w-4" />
                        {tournament.maxPlayers} slots
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400">Entry Fee</div>
                        <div className="font-medium">
                          {formatCurrency(tournament.entryFee, user.currency)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-400">Prize Pool</div>
                        <div className="font-medium text-green-400">
                          {formatCurrency(tournament.prizePool, user.currency)}
                        </div>
                      </div>
                    </div>
                    
                    <Button asChild className="mt-4 bg-gradient-to-r from-primary to-secondary">
                      <Link href={`/tournaments/${tournament.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No Tournaments Found</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                {searchQuery || selectedMode || selectedMap
                  ? "No tournaments match your search criteria. Try adjusting your filters."
                  : "There are no upcoming tournaments available right now. Check back later for new tournaments."}
              </p>
              {(searchQuery || selectedMode || selectedMap) && (
                <Button onClick={resetFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="live" className="mt-0">
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No Live Tournaments</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              There are no tournaments currently live. Check the upcoming tournaments tab to join the next one.
            </p>
            <Button
              onClick={() => setActiveTab("upcoming")}
              className="bg-primary hover:bg-primary/90"
            >
              View Upcoming Tournaments
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No Completed Tournaments</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              There are no completed tournaments yet. Join an upcoming tournament to see results here.
            </p>
            <Button
              onClick={() => setActiveTab("upcoming")}
              className="bg-primary hover:bg-primary/90"
            >
              View Upcoming Tournaments
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}