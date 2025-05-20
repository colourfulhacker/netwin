import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTournaments } from "@/hooks/useTournaments";
import { useMatches } from "@/hooks/useMatches";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatTimeRemaining, getTimeRemainingInSeconds } from "@/lib/utils";
import { Trophy, Calendar, Users, ArrowRight, MapPin, Sword, Gamepad2 } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { tournaments } = useTournaments();
  const { getUserMatches } = useMatches();
  const [remainingSeconds, setRemainingSeconds] = useState<number[]>([]);
  
  // Get upcoming tournaments (max 3)
  const upcomingTournaments = tournaments
    ?.filter(tournament => tournament.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3) || [];
    
  // Get user's upcoming matches
  const userMatches = user ? getUserMatches(user.id) : [];
  const upcomingMatches = userMatches
    .filter(match => match.status === "upcoming" || match.status === "live")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);
  
  // Update countdown timers every second
  useEffect(() => {
    if (!upcomingTournaments.length) return;
    
    const updateTimers = () => {
      const seconds = upcomingTournaments.map(tournament => 
        getTimeRemainingInSeconds(new Date(tournament.date))
      );
      setRemainingSeconds(seconds);
    };
    
    // Initial update
    updateTimers();
    
    // Set interval for updates
    const intervalId = setInterval(updateTimers, 1000);
    
    return () => clearInterval(intervalId);
  }, [upcomingTournaments]);

  if (!user) return null;
  
  return (
    <div className="container py-6 md:py-10">
      {/* Welcome Section */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-poppins">
              Welcome back, <span className="text-primary">{user.username}</span>
            </h1>
            <p className="text-gray-400 mt-1">
              Get ready for your next tournament match
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button asChild className="bg-gradient-to-r from-primary to-secondary">
              <Link href="/tournaments">
                <div className="flex items-center">
                  <Trophy className="mr-2 h-4 w-4" />
                  Find Tournaments
                </div>
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Wallet Balance Card */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-6 border border-primary/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Wallet Balance</p>
              <h3 className="text-2xl font-bold font-rajdhani">
                {formatCurrency(user.walletBalance, user.currency)}
              </h3>
              <Button variant="link" asChild className="text-primary p-0 h-auto mt-1">
                <Link href="/wallet">
                  <div className="flex items-center text-sm">
                    Add Money <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </Link>
              </Button>
            </div>
            
            <div className="border-t md:border-t-0 md:border-l border-gray-700 md:pl-6 pt-4 md:pt-0">
              <p className="text-gray-400 text-sm mb-1">Tournaments Played</p>
              <h3 className="text-2xl font-bold font-rajdhani">
                {userMatches.filter(match => match.status === "completed").length}
              </h3>
            </div>
            
            <div className="border-t md:border-t-0 md:border-l border-gray-700 md:pl-6 pt-4 md:pt-0">
              <p className="text-gray-400 text-sm mb-1">Winnings</p>
              <h3 className="text-2xl font-bold font-rajdhani text-green-400">
                {formatCurrency(
                  userMatches
                    .filter(match => match.status === "completed" && match.prize)
                    .reduce((total, match) => total + (match.prize || 0), 0),
                  user.currency
                )}
              </h3>
            </div>
          </div>
        </div>
      </section>
      
      {/* Your Matches Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-poppins">Your Upcoming Matches</h2>
          <Button variant="link" asChild className="text-primary">
            <Link href="/matches">
              <div className="flex items-center">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </Link>
          </Button>
        </div>
        
        {upcomingMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingMatches.map(match => (
              <Card key={match.id} className="bg-dark-card border-gray-800 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {match.status === "live" ? (
                        <Badge className="bg-red-500">LIVE</Badge>
                      ) : (
                        <Badge variant="outline" className="border-warning text-warning">
                          UPCOMING
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-gray-700">
                        {match.mode}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{match.tournamentTitle}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(match.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {match.map}
                      </div>
                    </div>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/match/${match.id}`}>
                      Details
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-dark-card border-gray-800 p-8 text-center">
            <div className="flex flex-col items-center">
              <Gamepad2 className="h-12 w-12 text-gray-600 mb-3" />
              <h3 className="text-lg font-medium mb-2">No Upcoming Matches</h3>
              <p className="text-gray-400 mb-4">
                Join a tournament to get started
              </p>
              <Button asChild>
                <Link href="/tournaments">Browse Tournaments</Link>
              </Button>
            </div>
          </Card>
        )}
      </section>
      
      {/* Upcoming Tournaments Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-poppins">Upcoming Tournaments</h2>
          <Button variant="link" asChild className="text-primary">
            <Link href="/tournaments">
              <div className="flex items-center">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </Link>
          </Button>
        </div>
        
        {upcomingTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingTournaments.map((tournament, index) => (
              <Card key={tournament.id} className="bg-dark-card border-gray-800 overflow-hidden flex flex-col">
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
                    <p className="text-xs text-gray-400 mb-1">Players</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1 text-gray-500" />
                        <p className="font-medium">
                          {/* This would be dynamic in a real app */}
                          {Math.floor(Math.random() * tournament.maxPlayers)}/{tournament.maxPlayers}
                        </p>
                      </div>
                      <div className="text-xs text-yellow-400">
                        {remainingSeconds[index] > 0 
                          ? formatTimeRemaining(remainingSeconds[index]) 
                          : "Starting soon"}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 pt-0">
                  <Button asChild className="w-full bg-gradient-to-r from-primary to-secondary">
                    <Link href={`/tournament/${tournament.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-dark-card border-gray-800 p-8 text-center">
            <div className="flex flex-col items-center">
              <Trophy className="h-12 w-12 text-gray-600 mb-3" />
              <h3 className="text-lg font-medium mb-2">No Upcoming Tournaments</h3>
              <p className="text-gray-400 mb-4">
                Check back later for new tournaments
              </p>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}