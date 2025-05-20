import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTournaments } from "@/hooks/useTournaments";
import { useNotifications } from "@/hooks/useNotifications";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Trophy,
  Users,
  Clock,
  Target,
  ChevronRight,
  ArrowUpRight,
  Bell,
  Wallet,
  UserCheck,
  ShieldAlert,
  Medal,
  Gamepad,
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { tournaments } = useTournaments();
  const { notifications, markAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  
  if (!user) return null;
  
  // Get upcoming tournaments (limit to 3)
  const upcomingTournaments = tournaments
    .filter(t => t.status === "upcoming")
    .slice(0, 3);
  
  // Get recent notifications (limit to 3)
  const recentNotifications = notifications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  
  // Calculate remaining time for tournament
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
  
  // Handle notification click
  const handleNotificationClick = (id: number) => {
    markAsRead(user.id, id);
  };
  
  return (
    <div className="container py-6 md:py-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-poppins">
            Welcome back, {user.username}!
          </h1>
          <p className="text-gray-400 mt-1">
            Your esports tournament platform
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button asChild variant="outline" className="border-gray-700">
            <Link href="/wallet">
              <Wallet className="mr-2 h-4 w-4" />
              Balance: {formatCurrency(user.walletBalance, user.currency)}
            </Link>
          </Button>
          
          <Button asChild className="bg-gradient-to-r from-primary to-secondary">
            <Link href="/tournaments">
              <Trophy className="mr-2 h-4 w-4" />
              Join Tournaments
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* KYC Alert (if not verified) */}
          {user.kycStatus !== "verified" && (
            <Card className="bg-dark-card border-gray-800 p-6">
              <div className="flex items-start">
                <div className="bg-yellow-900/20 p-3 rounded-full mr-4">
                  <ShieldAlert className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold mb-1">Complete KYC Verification</h2>
                  <p className="text-gray-400 mb-4">
                    Verify your identity to unlock all platform features including withdrawals and high-stakes tournaments.
                  </p>
                  <Button asChild>
                    <Link href="/profile/kyc">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Verify Now
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          {/* Tournaments Section */}
          <Card className="bg-dark-card border-gray-800 overflow-hidden">
            <div className="p-6 pb-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Tournaments</h2>
                <Button asChild variant="ghost" size="sm" className="text-sm text-gray-400">
                  <Link href="/tournaments">
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <Tabs
                defaultValue="upcoming"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="ongoing">Live</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming" className="mt-0">
                  {upcomingTournaments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingTournaments.map((tournament) => (
                        <div
                          key={tournament.id}
                          className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-dark-lighter rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            <img
                              src={tournament.image}
                              alt={tournament.title}
                              className="w-full md:w-24 h-24 object-cover rounded-lg"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{tournament.title}</h3>
                              <Badge variant="outline" className="border-primary text-primary">
                                {tournament.gameMode}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap gap-3 mt-2 text-sm">
                              <div className="flex items-center text-gray-400">
                                <Calendar className="mr-1 h-3.5 w-3.5" />
                                {new Date(tournament.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-gray-400">
                                <Clock className="mr-1 h-3.5 w-3.5" />
                                {getRemainingTime(tournament.date)}
                              </div>
                              <div className="flex items-center text-gray-400">
                                <Users className="mr-1 h-3.5 w-3.5" />
                                {tournament.mode}
                              </div>
                              <div className="flex items-center text-gray-400">
                                <Target className="mr-1 h-3.5 w-3.5" />
                                {tournament.map}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div>
                                <div className="text-sm text-gray-400">Entry Fee</div>
                                <div className="font-medium">
                                  {formatCurrency(tournament.entryFee, user.currency)}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-sm text-gray-400">Prize Pool</div>
                                <div className="font-medium text-green-400">
                                  {formatCurrency(tournament.prizePool, user.currency)}
                                </div>
                              </div>
                              
                              <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                                <Link href={`/tournaments/${tournament.id}`}>
                                  Join Now
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                      <h3 className="text-lg font-medium">No Upcoming Tournaments</h3>
                      <p className="text-gray-400 mt-1">
                        Check back later for new tournaments
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="ongoing" className="mt-0">
                  <div className="text-center py-8">
                    <Trophy className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                    <h3 className="text-lg font-medium">No Live Tournaments</h3>
                    <p className="text-gray-400 mt-1">
                      Check back during scheduled tournament times
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
          
          {/* Recent Matches */}
          <Card className="bg-dark-card border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Matches</h2>
              <Button asChild variant="ghost" size="sm" className="text-sm text-gray-400">
                <Link href="/matches">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="text-center py-8">
              <Medal className="h-10 w-10 text-gray-500 mx-auto mb-2" />
              <h3 className="text-lg font-medium">No Recent Matches</h3>
              <p className="text-gray-400 mt-1">
                Join a tournament to see your matches here
              </p>
              <Button asChild className="mt-4 bg-primary hover:bg-primary/90">
                <Link href="/tournaments">
                  Browse Tournaments
                </Link>
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Profile Card */}
          <Card className="bg-dark-card border-gray-800 p-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                <AvatarImage src={user.profilePicture || undefined} alt={user.username} />
                <AvatarFallback className="bg-primary/20 text-lg">
                  {user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-semibold mt-4">{user.username}</h2>
              
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="border-primary text-primary">
                  {user.gameMode}
                </Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-400">
                  {user.country}
                </Badge>
              </div>
              
              {user.gameId && (
                <div className="mt-3 px-3 py-1 bg-dark-lighter rounded-full text-sm flex items-center">
                  <Gamepad className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                  <span className="font-mono">{user.gameId}</span>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 w-full mt-6">
                <Button asChild variant="outline" className="border-gray-700">
                  <Link href="/profile">
                    Edit Profile
                  </Link>
                </Button>
                
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/squad">
                    <Users className="mr-2 h-4 w-4" />
                    Squad
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Stats Card */}
          <Card className="bg-dark-card border-gray-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Stats</h2>
            
            <div className="space-y-3">
              <div className="p-3 bg-dark-lighter rounded-lg flex justify-between">
                <div className="text-gray-400">Tournaments Played</div>
                <div className="font-medium">0</div>
              </div>
              <div className="p-3 bg-dark-lighter rounded-lg flex justify-between">
                <div className="text-gray-400">Matches Won</div>
                <div className="font-medium">0</div>
              </div>
              <div className="p-3 bg-dark-lighter rounded-lg flex justify-between">
                <div className="text-gray-400">Total Earnings</div>
                <div className="font-medium text-green-400">
                  {formatCurrency(0, user.currency)}
                </div>
              </div>
            </div>
            
            <Button asChild variant="outline" className="w-full mt-4 border-gray-700">
              <Link href="/leaderboard">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                View Leaderboard
              </Link>
            </Button>
          </Card>
          
          {/* Notifications */}
          <Card className="bg-dark-card border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <Bell className="h-4 w-4 text-gray-400" />
            </div>
            
            {recentNotifications.length > 0 ? (
              <div className="space-y-3">
                {recentNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 ${!notification.read ? 'bg-primary/5 border border-primary/20' : 'bg-dark-lighter'} rounded-lg cursor-pointer`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{notification.title}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400">No notifications yet</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}