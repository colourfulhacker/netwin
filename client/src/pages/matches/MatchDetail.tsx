import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMatches } from "@/hooks/useMatches";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMatchTime } from "@/lib/utils";
import { getTimeRemainingInSeconds, formatTimeRemaining } from "@/lib/utils";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  Copy,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MatchResults from "@/components/match/MatchResults";

export default function MatchDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { getMatch, uploadResult } = useMatches();
  const { toast } = useToast();
  const [roomIdCopied, setRoomIdCopied] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  
  // Get match data
  const match = getMatch(Number(id));
  
  if (!match || !user) {
    return (
      <div className="container py-10 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin mb-4">
            <Loader2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-medium">Loading match details...</h2>
        </div>
      </div>
    );
  }
  
  const handleBackClick = () => {
    setLocation("/matches");
  };
  
  const handleCopyRoomId = () => {
    if (!match.roomDetails?.roomId) return;
    
    navigator.clipboard.writeText(match.roomDetails.roomId);
    setRoomIdCopied(true);
    toast({
      title: "Room ID copied",
      description: "Room ID has been copied to clipboard",
    });
    
    setTimeout(() => {
      setRoomIdCopied(false);
    }, 2000);
  };
  
  const handleCopyPassword = () => {
    if (!match.roomDetails?.password) return;
    
    navigator.clipboard.writeText(match.roomDetails.password);
    setPasswordCopied(true);
    toast({
      title: "Password copied",
      description: "Room password has been copied to clipboard",
    });
    
    setTimeout(() => {
      setPasswordCopied(false);
    }, 2000);
  };
  
  const handleUploadResult = async (screenshot: string) => {
    try {
      return await uploadResult(match.id, screenshot);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload result. Please try again.",
      });
      return false;
    }
  };
  
  // Check if room details are visible based on match time
  const roomDetailsVisible = match.status === "upcoming" && match.roomDetails && 
    (match.roomDetails.visibleAt ? 
      new Date() >= new Date(match.roomDetails.visibleAt) : 
      getTimeRemainingInSeconds(new Date(match.date)) <= 15 * 60); // 15 minutes before match
  
  // Check if user is team owner
  const isTeamOwner = match.teamMembers.some(
    (member: any) => member.id === user.id && member.isOwner
  );
  
  // Format match time
  const matchDate = new Date(match.date);
  const now = new Date();
  const isLive = match.status === "live";
  const isCompleted = match.status === "completed";
  const isUpcoming = match.status === "upcoming";
  const secondsRemaining = getTimeRemainingInSeconds(matchDate);
  
  return (
    <div className="container py-6">
      <Button
        variant="ghost"
        className="mb-6 text-gray-400"
        onClick={handleBackClick}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Matches
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2">
          <Card className="bg-dark-card border-gray-800 p-5 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {isLive && (
                    <Badge className="bg-red-500">LIVE</Badge>
                  )}
                  {isUpcoming && (
                    <Badge variant="outline" className="border-warning text-warning">
                      UPCOMING
                    </Badge>
                  )}
                  {isCompleted && (
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      COMPLETED
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-gray-700">
                    {match.mode}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold mb-2">{match.tournamentTitle}</h1>
                <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatMatchTime(matchDate)}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {match.map}
                  </div>
                </div>
              </div>
              
              {isUpcoming && (
                <div className="gradient-border hidden sm:block">
                  <div className="bg-dark-card px-4 py-3 rounded-lg">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-1">
                        Match starts in
                      </div>
                      <div className="font-rajdhani font-bold text-xl text-white">
                        {secondsRemaining > 0 ? formatTimeRemaining(secondsRemaining) : "Starting soon"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <Separator className="bg-gray-800 my-4" />
            
            {isUpcoming && (
              <div className="sm:hidden mb-4 p-3 bg-dark-lighter rounded-lg">
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">
                    Match starts in
                  </div>
                  <div className="font-rajdhani font-bold text-xl text-white">
                    {secondsRemaining > 0 ? formatTimeRemaining(secondsRemaining) : "Starting soon"}
                  </div>
                </div>
              </div>
            )}
            
            {isLive && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
                  <div>
                    <p className="font-medium text-red-400">Match is Live!</p>
                    <p className="text-sm text-gray-400">Join the room immediately if you haven't already</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Team Members */}
            <h2 className="text-lg font-semibold mb-3">Your Squad</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {match.teamMembers.map((member: any) => (
                <div 
                  key={member.id} 
                  className={`bg-dark-lighter rounded-lg p-3 flex items-center gap-3 ${
                    member.isOwner ? 'border-2 border-primary' : ''
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.profilePicture} alt={member.username} />
                    <AvatarFallback className="bg-primary/20">
                      {member.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.username}</div>
                    <div className="text-xs text-gray-400">
                      {member.isOwner ? "Team Owner" : "Team Member"}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Fill empty slots based on match mode */}
              {match.mode === "SQUAD" && match.teamMembers.length < 4 && (
                Array(4 - match.teamMembers.length).fill(0).map((_, index) => (
                  <div key={`empty-${index}`} className="bg-dark-lighter rounded-lg p-3 border border-dashed border-gray-700 flex items-center justify-center">
                    <div className="text-center">
                      <Users className="h-5 w-5 text-gray-600 mx-auto" />
                      <div className="text-xs text-gray-600 mt-1">Empty Slot</div>
                    </div>
                  </div>
                ))
              )}
              
              {match.mode === "DUO" && match.teamMembers.length < 2 && (
                <div className="bg-dark-lighter rounded-lg p-3 border border-dashed border-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-5 w-5 text-gray-600 mx-auto" />
                    <div className="text-xs text-gray-600 mt-1">Empty Slot</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Room Details Section */}
            {(isUpcoming || isLive) && (
              <div className="p-4 bg-dark-lighter rounded-lg border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-semibold">Room Details</h3>
                  {!roomDetailsVisible && isUpcoming && (
                    <div className="flex items-center text-xs text-warning">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Available 15 min before match</span>
                    </div>
                  )}
                </div>
                
                {roomDetailsVisible && match.roomDetails ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-dark-card p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Room ID</div>
                          <div className="font-mono font-medium">{match.roomDetails.roomId}</div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleCopyRoomId}
                          className="h-8 text-primary"
                        >
                          {roomIdCopied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-dark-card p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Room Password</div>
                          <div className="font-mono font-medium">{match.roomDetails.password}</div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleCopyPassword}
                          className="h-8 text-primary"
                        >
                          {passwordCopied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-dashed border-gray-700 p-3 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Room ID</div>
                      <div className="text-gray-500">••••••••</div>
                    </div>
                    
                    <div className="border border-dashed border-gray-700 p-3 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">Room Password</div>
                      <div className="text-gray-500">••••••</div>
                    </div>
                  </div>
                )}
                
                {roomDetailsVisible && match.roomDetails && (
                  <div className="mt-4 p-3 bg-dark-card border-l-4 border-warning">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-warning mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-warning">Important</p>
                        <p className="text-sm text-gray-300 mt-1">
                          Join the room at least 5 minutes before match start time. Players who fail to join on time may be disqualified.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
          
          {isCompleted && (
            <MatchResults 
              match={match} 
              onUploadResult={handleUploadResult} 
            />
          )}
        </div>
        
        {/* Sidebar Column */}
        <div>
          <Card className="bg-dark-card border-gray-800 p-5 mb-6">
            <h3 className="text-lg font-semibold mb-3">Match Information</h3>
            
            <div className="space-y-4">
              <div className="bg-dark-lighter p-3 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Status</div>
                <div className="flex items-center">
                  {isLive && (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                      <span className="font-medium">Live Now</span>
                    </>
                  )}
                  {isUpcoming && (
                    <>
                      <Clock className="h-4 w-4 mr-2 text-warning" />
                      <span className="font-medium">Upcoming</span>
                    </>
                  )}
                  {isCompleted && (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      <span className="font-medium">Completed</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-lighter p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Match Type</div>
                  <div className="font-medium">{match.mode}</div>
                </div>
                
                <div className="bg-dark-lighter p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Map</div>
                  <div className="font-medium">{match.map}</div>
                </div>
              </div>
              
              <div className="bg-dark-lighter p-3 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Date & Time</div>
                <div className="font-medium">{formatMatchTime(matchDate)}</div>
              </div>
              
              {isTeamOwner && !isCompleted && (
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <span className="font-medium">Team Owner</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">
                    As the team owner, you're responsible for coordinating your team and submitting match results.
                  </p>
                </div>
              )}
            </div>
          </Card>
          
          <Card className="bg-dark-card border-gray-800 p-5">
            <h3 className="text-lg font-semibold mb-3">Match Rules</h3>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <div className="w-1 h-1 bg-primary rounded-full mt-1.5 mr-2"></div>
                <span>Join the room at least 5 minutes before match start</span>
              </li>
              <li className="flex items-start">
                <div className="w-1 h-1 bg-primary rounded-full mt-1.5 mr-2"></div>
                <span>Use of hacks or cheats will result in permanent ban</span>
              </li>
              <li className="flex items-start">
                <div className="w-1 h-1 bg-primary rounded-full mt-1.5 mr-2"></div>
                <span>Team killing is strictly prohibited</span>
              </li>
              <li className="flex items-start">
                <div className="w-1 h-1 bg-primary rounded-full mt-1.5 mr-2"></div>
                <span>Teaming with other squads is not allowed</span>
              </li>
              <li className="flex items-start">
                <div className="w-1 h-1 bg-primary rounded-full mt-1.5 mr-2"></div>
                <span>Screenshot of results must be submitted after match</span>
              </li>
              <li className="flex items-start">
                <div className="w-1 h-1 bg-primary rounded-full mt-1.5 mr-2"></div>
                <span>Admins' decision is final in case of disputes</span>
              </li>
            </ul>
            
            <Separator className="bg-gray-800 my-4" />
            
            <div className="text-sm text-gray-400">
              Need help? Contact us at{" "}
              <a href="mailto:support@netwin.com" className="text-primary">
                support@netwin.com
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}