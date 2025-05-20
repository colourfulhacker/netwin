import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Trophy, Search, Medal, Calendar, ArrowUpRight } from "lucide-react";

export default function Leaderboard() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<string>("global");
  const [timeFrame, setTimeFrame] = useState<string>("all-time");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  if (!user) return null;
  
  // Mock data for leaderboards
  const globalLeaderboard = [
    {
      id: 1,
      username: "ProSniper",
      rank: 1,
      country: "India",
      totalKills: 328,
      totalWins: 42,
      totalEarnings: 25000,
      avatar: null,
    },
    {
      id: 2,
      username: "BattleQueen",
      rank: 2,
      country: "Nigeria",
      totalKills: 301,
      totalWins: 38,
      totalEarnings: 22500,
      avatar: null,
    },
    {
      id: 3,
      username: "HeadshotKing",
      rank: 3,
      country: "India",
      totalKills: 287,
      totalWins: 35,
      totalEarnings: 21000,
      avatar: null,
    },
    {
      id: 4,
      username: "StealthWolf",
      rank: 4,
      country: "USA",
      totalKills: 273,
      totalWins: 33,
      totalEarnings: 19500,
      avatar: null,
    },
    {
      id: 5,
      username: "FuriousFighter",
      rank: 5,
      country: "India",
      totalKills: 265,
      totalWins: 32,
      totalEarnings: 18000,
      avatar: null,
    },
    // Add the current user somewhere in the list
    {
      id: user.id,
      username: user.username,
      rank: 28,
      country: user.country,
      totalKills: 156,
      totalWins: 18,
      totalEarnings: 9500,
      avatar: user.profilePicture,
    },
  ];
  
  const regionalLeaderboard = [
    {
      id: 1,
      username: "ProSniper",
      rank: 1,
      country: user.country,
      totalKills: 328,
      totalWins: 42,
      totalEarnings: 25000,
      avatar: null,
    },
    {
      id: 2,
      username: "HeadshotKing",
      rank: 2,
      country: user.country,
      totalKills: 287,
      totalWins: 35,
      totalEarnings: 21000,
      avatar: null,
    },
    {
      id: 5,
      username: "FuriousFighter",
      rank: 3,
      country: user.country,
      totalKills: 265,
      totalWins: 32,
      totalEarnings: 18000,
      avatar: null,
    },
    // Current user in regional leaderboard
    {
      id: user.id,
      username: user.username,
      rank: 12,
      country: user.country,
      totalKills: 156,
      totalWins: 18,
      totalEarnings: 9500,
      avatar: user.profilePicture,
    },
  ];
  
  // Filter leaderboard based on search query
  const filterLeaderboard = (leaderboard: any[]) => {
    if (!searchQuery) return leaderboard;
    return leaderboard.filter(player => 
      player.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  // Get leaderboard data based on selected tab
  const getLeaderboardData = () => {
    if (selectedTab === "global") {
      return filterLeaderboard(globalLeaderboard);
    } else {
      return filterLeaderboard(regionalLeaderboard);
    }
  };
  
  // Get current user's rank
  const getUserRank = () => {
    if (selectedTab === "global") {
      return globalLeaderboard.find(player => player.id === user.id)?.rank || "-";
    } else {
      return regionalLeaderboard.find(player => player.id === user.id)?.rank || "-";
    }
  };
  
  // Render rank badge
  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="bg-yellow-400 text-dark w-8 h-8 rounded-full flex items-center justify-center">
          <Trophy className="h-4 w-4" />
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="bg-gray-300 text-dark w-8 h-8 rounded-full flex items-center justify-center">
          <Medal className="h-4 w-4" />
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="bg-amber-600 text-dark w-8 h-8 rounded-full flex items-center justify-center">
          <Medal className="h-4 w-4" />
        </div>
      );
    } else {
      return (
        <div className="bg-dark-lighter w-8 h-8 rounded-full flex items-center justify-center font-bold">
          {rank}
        </div>
      );
    }
  };
  
  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-poppins">
          Leaderboard
        </h1>
        <p className="text-gray-400 mt-1">
          Top players based on performance and earnings
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* User Stats Card */}
        <div className="lg:col-span-1">
          <Card className="bg-dark-card border-gray-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Your Stats</h2>
            
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                <AvatarImage src={user.profilePicture || undefined} alt={user.username} />
                <AvatarFallback className="bg-primary/20">
                  {user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{user.username}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <span>Current Rank:</span>
                  <span className="font-medium text-primary">{getUserRank()}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-dark-lighter p-3 rounded-lg flex justify-between">
                <span className="text-gray-400">Total Matches</span>
                <span className="font-medium">127</span>
              </div>
              <div className="bg-dark-lighter p-3 rounded-lg flex justify-between">
                <span className="text-gray-400">Total Kills</span>
                <span className="font-medium">156</span>
              </div>
              <div className="bg-dark-lighter p-3 rounded-lg flex justify-between">
                <span className="text-gray-400">Wins</span>
                <span className="font-medium">18</span>
              </div>
              <div className="bg-dark-lighter p-3 rounded-lg flex justify-between">
                <span className="text-gray-400">Total Earnings</span>
                <span className="font-medium text-green-400">
                  {formatCurrency(9500, user.currency)}
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button asChild className="w-full bg-gradient-to-r from-primary to-secondary">
                <a href="/matches">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Match History
                </a>
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Leaderboard Table */}
        <div className="lg:col-span-3">
          <Card className="bg-dark-card border-gray-800 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <Tabs
                value={selectedTab}
                onValueChange={setSelectedTab}
                className="w-full md:w-auto"
              >
                <TabsList>
                  <TabsTrigger value="global">Global</TabsTrigger>
                  <TabsTrigger value="regional">Regional</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search players"
                    className="pl-10 bg-dark-lighter border-gray-700 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select
                  value={timeFrame}
                  onValueChange={setTimeFrame}
                >
                  <SelectTrigger className="w-[140px] bg-dark-lighter border-gray-700">
                    <SelectValue placeholder="Time period" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-gray-700">
                    <SelectItem value="all-time">All Time</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="pb-3 pl-2">Rank</th>
                    <th className="pb-3">Player</th>
                    <th className="pb-3">Matches</th>
                    <th className="pb-3">Kills</th>
                    <th className="pb-3">Wins</th>
                    <th className="pb-3 text-right">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {getLeaderboardData().map((player) => (
                    <tr 
                      key={player.id} 
                      className={`border-t border-gray-800 ${player.id === user.id ? 'bg-primary/5' : ''}`}
                    >
                      <td className="py-4 pl-2">
                        {renderRankBadge(player.rank)}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={player.avatar || undefined} alt={player.username} />
                            <AvatarFallback className="bg-primary/20">
                              {player.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {player.username}
                              {player.id === user.id && (
                                <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {player.country}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        {player.totalKills + player.totalWins * 2}
                      </td>
                      <td className="py-4">
                        {player.totalKills}
                      </td>
                      <td className="py-4">
                        {player.totalWins}
                      </td>
                      <td className="py-4 text-right text-green-400 font-medium">
                        {formatCurrency(player.totalEarnings, user.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {getLeaderboardData().length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No players found matching your search.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}