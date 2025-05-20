import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LeaderboardEntry } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { getLeaderboardEntries } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LeaderboardTableProps {
  initialFilter?: 'daily' | 'weekly' | 'monthly';
  initialCountry?: string;
}

const LeaderboardTable = ({ 
  initialFilter = 'weekly',
  initialCountry = 'all'
}: LeaderboardTableProps) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>(initialFilter);
  const [countryFilter, setCountryFilter] = useState<string>(initialCountry);
  const [sortBy, setSortBy] = useState<'earnings' | 'kills' | 'wins'>('earnings');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // Get leaderboard entries from helper function
    let country = countryFilter === 'all' ? undefined : countryFilter;
    let leaderboardEntries = getLeaderboardEntries(timeFilter, country);
    
    // Sort entries based on selected sorting criteria
    if (sortBy === 'kills') {
      leaderboardEntries = leaderboardEntries.sort((a, b) => b.kills - a.kills);
    } else if (sortBy === 'wins') {
      leaderboardEntries = leaderboardEntries.sort((a, b) => b.wins - a.wins);
    }
    // Default is already sorted by earnings from the helper function
    
    // Filter by search query if any
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      leaderboardEntries = leaderboardEntries.filter(entry => 
        entry.username.toLowerCase().includes(query)
      );
    }
    
    setEntries(leaderboardEntries);
  }, [timeFilter, countryFilter, sortBy, searchQuery]);
  
  // If no entries found
  if (entries.length === 0 && !searchQuery) {
    return (
      <div className="bg-dark-card rounded-lg p-8 text-center border border-gray-800">
        <p className="text-gray-400">No leaderboard data available for the selected filters.</p>
        <Button 
          variant="outline"
          className="mt-4 border-gray-700"
          onClick={() => {
            setTimeFilter('weekly');
            setCountryFilter('all');
            setSortBy('earnings');
          }}
        >
          Reset Filters
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-dark-card rounded-xl overflow-hidden border border-gray-800">
      <div className="p-4 bg-dark-lighter">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Tabs 
            defaultValue={timeFilter} 
            onValueChange={(value) => setTimeFilter(value as 'daily' | 'weekly' | 'monthly')}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-3 w-full sm:w-auto">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2">
            <Select 
              defaultValue={countryFilter}
              onValueChange={setCountryFilter}
            >
              <SelectTrigger className="w-[140px] bg-dark-card border-0">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gray-700">
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="India">India</SelectItem>
                <SelectItem value="Nigeria">Nigeria</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              defaultValue={sortBy}
              onValueChange={setSortBy as (value: string) => void}
            >
              <SelectTrigger className="w-[140px] bg-dark-card border-0">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-gray-700">
                <SelectItem value="earnings">Earnings</SelectItem>
                <SelectItem value="kills">Kills</SelectItem>
                <SelectItem value="wins">Wins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search player"
            className="pl-10 bg-dark-card border-0 focus-visible:ring-2 focus-visible:ring-primary w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-dark-lighter">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rank</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Player</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Matches</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kills</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Wins</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {entries.map((entry, index) => {
              // Determine rank styling
              const rankClass = 
                index === 0 ? "text-lg font-rajdhani font-bold text-yellow-400" :
                index === 1 ? "text-lg font-rajdhani font-bold text-gray-300" :
                index === 2 ? "text-lg font-rajdhani font-bold text-amber-600" :
                "text-lg font-rajdhani font-bold text-gray-400";
              
              // Determine border color for avatar
              const borderColor = 
                index === 0 ? "border-yellow-400" :
                index === 1 ? "border-gray-500" :
                index === 2 ? "border-amber-600" :
                "border-gray-700";
              
              return (
                <tr key={entry.userId} className="hover:bg-dark-lighter">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className={rankClass}>{index + 1}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full overflow-hidden mr-3 border ${borderColor}`}>
                        <img 
                          src={entry.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.username)}&background=6C3AFF&color=fff&size=200`} 
                          alt={`${entry.username} avatar`} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <div className="font-medium">{entry.username}</div>
                        <div className="text-xs text-gray-400">
                          {entry.country === 'India' ? '🇮🇳 ' : 
                           entry.country === 'Nigeria' ? '🇳🇬 ' : 
                           entry.country === 'USA' ? '🇺🇸 ' : '🌐 '}
                          {entry.country}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-rajdhani">{entry.matches}</td>
                  <td className="py-3 px-4 font-rajdhani">{entry.kills}</td>
                  <td className="py-3 px-4 font-rajdhani">{entry.wins}</td>
                  <td className="py-3 px-4 font-rajdhani font-semibold text-green-400">
                    {formatCurrency(entry.earnings, user?.currency || entry.currency)}
                  </td>
                </tr>
              );
            })}
            
            {/* If no results found */}
            {entries.length === 0 && searchQuery && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No players found matching "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
