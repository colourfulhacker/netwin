import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMatches } from "@/hooks/useMatches";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2 } from "lucide-react";
import UpcomingMatch from "@/components/match/UpcomingMatch";
import MatchResults from "@/components/match/MatchResults";

export default function MyMatches() {
  const { user } = useAuth();
  const { matches, uploadMatchResult } = useMatches();
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "completed">("upcoming");
  
  if (!user) return null;
  
  // Filter matches by status
  const upcomingMatches = matches.filter(
    match => match.status === "upcoming" || match.status === "live"
  );
  const completedMatches = matches.filter(
    match => match.status === "completed"
  );
  
  // Handle result upload
  const handleUploadResult = async (matchId: number, screenshot: string) => {
    try {
      return await uploadMatchResult(matchId, screenshot);
    } catch (error) {
      console.error("Error uploading result:", error);
      return false;
    }
  };
  
  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-poppins">
          My Matches
        </h1>
        <p className="text-gray-400 mt-1">
          View your upcoming and completed matches
        </p>
      </div>
      
      <Tabs 
        defaultValue="upcoming" 
        value={selectedTab} 
        onValueChange={(value) => setSelectedTab(value as "upcoming" | "completed")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upcoming">
            Upcoming
            {upcomingMatches.length > 0 && (
              <Badge variant="outline" className="ml-2 border-primary text-primary">
                {upcomingMatches.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            {completedMatches.length > 0 && (
              <Badge variant="outline" className="ml-2 border-primary text-primary">
                {completedMatches.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {upcomingMatches.length > 0 ? (
            <div className="space-y-6">
              {upcomingMatches.map(match => (
                <UpcomingMatch key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <Card className="bg-dark-card border-gray-800 p-10 text-center">
              <div className="flex flex-col items-center">
                <Gamepad2 className="h-12 w-12 text-gray-600 mb-3" />
                <h3 className="text-lg font-medium mb-2">No Upcoming Matches</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  You haven't registered for any upcoming tournaments yet. Browse tournaments to join your first match!
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedMatches.length > 0 ? (
            <div className="space-y-6">
              {completedMatches.map(match => (
                <MatchResults 
                  key={match.id} 
                  match={match} 
                  onUploadResult={(screenshot) => handleUploadResult(match.id, screenshot)}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-dark-card border-gray-800 p-10 text-center">
              <div className="flex flex-col items-center">
                <Gamepad2 className="h-12 w-12 text-gray-600 mb-3" />
                <h3 className="text-lg font-medium mb-2">No Completed Matches</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  You haven't played any matches yet. Join a tournament to start your gaming journey!
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}