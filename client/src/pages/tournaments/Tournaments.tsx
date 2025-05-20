import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTournaments } from "@/hooks/useTournaments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatTimeRemaining, getTimeRemainingInSeconds } from "@/lib/utils";
import { 
  Trophy, 
  Calendar, 
  Users, 
  MapPin, 
  Sword, 
  Search,
  FilterX,
  Clock,
  CheckCircle2
} from "lucide-react";

interface TournamentFilters {
  status?: "upcoming" | "live" | "completed";
  mode?: "SOLO" | "DUO" | "SQUAD" | "TDM";
  gameMode?: "PUBG" | "BGMI";
  map?: string;
  search?: string;
}

export default function Tournaments() {
  const { user } = useAuth();
  const { tournaments, filterTournaments } = useTournaments();
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "live" | "completed">("upcoming");
  const [filters, setFilters] = useState<TournamentFilters>({
    status: "upcoming",
    mode: undefined,
    gameMode: undefined,
    map: undefined,
    search: "",
  });
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };
  
  const handleFilterChange = (key: keyof TournamentFilters, value: string | undefined) => {
    setFilters({ ...filters, [key]: value });
  };
  
  const clearFilters = () => {
    setFilters({
      status: selectedTab,
      mode: undefined,
      gameMode: undefined,
      map: undefined,
      search: "",
    });
  };
  
  const handleTabChange = (value: string) => {
    const status = value as "upcoming" | "live" | "completed";
    setSelectedTab(status);
    setFilters({ ...filters, status });
  };
  
  const filteredTournaments = filterTournaments({
    ...filters,
    status: selectedTab,
  });
  
  const maps = ["Erangel", "Miramar", "Sanhok", "Vikendi", "Livik", "Karakin"];
  
  if (!user) return null;
  
  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-poppins">
            Tournaments
          </h1>
          <p className="text-gray-400 mt-1">
            Find and join your next battle
          </p>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tournaments"
              className="pl-10 bg-dark-lighter border-gray-700"
              value={filters.search}
              onChange={handleSearch}
            />
          </div>
          
          <div className="flex gap-2">
            <Select
              value={filters.gameMode}
              onValueChange={(value) => handleFilterChange("gameMode", value)}
            >
              <SelectTrigger className="w-[120px] bg-dark-lighter border-gray-700">
                <SelectValue placeholder="Game" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gray-700">
                <SelectItem value="PUBG">PUBG</SelectItem>
                <SelectItem value="BGMI">BGMI</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.mode}
              onValueChange={(value) => handleFilterChange("mode", value)}
            >
              <SelectTrigger className="w-[120px] bg-dark-lighter border-gray-700">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gray-700">
                <SelectItem value="SOLO">Solo</SelectItem>
                <SelectItem value="DUO">Duo</SelectItem>
                <SelectItem value="SQUAD">Squad</SelectItem>
                <SelectItem value="TDM">TDM</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.map}
              onValueChange={(value) => handleFilterChange("map", value)}
            >
              <SelectTrigger className="w-[130px] bg-dark-lighter border-gray-700">
                <SelectValue placeholder="Map" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gray-700">
                {maps.map((map) => (
                  <SelectItem key={map} value={map}>
                    {map}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="border-gray-700" 
              onClick={clearFilters}
            >
              <FilterX className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs 
        defaultValue="upcoming" 
        value={selectedTab} 
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament) => (
                <TournamentCard 
                  key={tournament.id}
                  tournament={tournament}
                  user={user}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No tournaments found"
              description="Try adjusting your filters or check back later for new tournaments"
              icon={<Trophy className="h-12 w-12 text-gray-600" />}
            />
          )}
        </TabsContent>
        
        <TabsContent value="live">
          {filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament) => (
                <TournamentCard 
                  key={tournament.id}
                  tournament={tournament}
                  user={user}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No live tournaments"
              description="There are no tournaments currently in progress"
              icon={<Clock className="h-12 w-12 text-gray-600" />}
            />
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament) => (
                <TournamentCard 
                  key={tournament.id}
                  tournament={tournament}
                  user={user}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No completed tournaments"
              description="Check back after tournaments have ended"
              icon={<CheckCircle2 className="h-12 w-12 text-gray-600" />}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface TournamentCardProps {
  tournament: any;
  user: any;
}

function TournamentCard({ tournament, user }: TournamentCardProps) {
  const tournamentDate = new Date(tournament.date);
  const now = new Date();
  const timeRemaining = getTimeRemainingInSeconds(tournamentDate);

  return (
    <Card className="bg-dark-card border-gray-800 overflow-hidden flex flex-col">
      <div 
        className="h-40 bg-cover bg-center" 
        style={{ backgroundImage: `url(${tournament.image})` }}
      >
        <div className="w-full h-full bg-gradient-to-b from-transparent to-dark/90 flex items-end p-4">
          <div>
            <div className="flex gap-2 mb-2">
              <Badge className="bg-primary">{tournament.gameMode}</Badge>
              <Badge variant="outline" className="border-gray-700">
                {tournament.mode}
              </Badge>
              
              {tournament.status === "live" && (
                <Badge className="bg-red-500">LIVE</Badge>
              )}
              
              {tournament.status === "upcoming" && (
                <Badge variant="outline" className="border-warning text-warning">
                  UPCOMING
                </Badge>
              )}
              
              {tournament.status === "completed" && (
                <Badge variant="outline" className="border-green-500 text-green-500">
                  COMPLETED
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg">{tournament.title}</h3>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex-grow">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Entry Fee</p>
            <p className="font-medium font-rajdhani">
              {formatCurrency(tournament.entryFee, user.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Prize Pool</p>
            <p className="font-medium text-green-400 font-rajdhani">
              {formatCurrency(tournament.prizePool, user.currency)}
            </p>
          </div>
        </div>
        
        <Separator className="my-4 bg-gray-800" />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Map</p>
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1 text-gray-500" />
              <p className="font-medium">{tournament.map}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Per Kill</p>
            <div className="flex items-center">
              <Sword className="h-3 w-3 mr-1 text-gray-500" />
              <p className="font-medium">
                {formatCurrency(tournament.perKill, user.currency)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-xs text-gray-400 mb-1">
            {tournament.status === "upcoming" ? "Starts" : tournament.status === "live" ? "Started" : "Ended"}
          </p>
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-gray-500" />
            <p className="font-medium">
              {tournamentDate.toLocaleDateString()} at {tournamentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-xs text-gray-400 mb-1">Players</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1 text-gray-500" />
              <p className="font-medium">
                {/* This would be dynamic in a real app */}
                {Math.floor(Math.random() * tournament.maxPlayers)}/{tournament.maxPlayers}
              </p>
            </div>
            
            {tournament.status === "upcoming" && (
              <div className="text-xs text-yellow-400">
                {timeRemaining > 0 
                  ? formatTimeRemaining(timeRemaining) 
                  : "Starting soon"}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 pt-0">
        <Button asChild className="w-full bg-gradient-to-r from-primary to-secondary">
          <Link href={`/tournament/${tournament.id}`}>
            {tournament.status === "upcoming" ? "Join Tournament" : "View Details"}
          </Link>
        </Button>
      </div>
    </Card>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <Card className="bg-dark-card border-gray-800 p-8 text-center">
      <div className="flex flex-col items-center">
        <div className="mb-3">
          {icon}
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-gray-400">
          {description}
        </p>
      </div>
    </Card>
  );
}