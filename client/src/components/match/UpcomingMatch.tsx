import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Match } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { formatMatchTime, getTimeRemainingInSeconds, formatTimeRemaining } from "@/lib/utils";
import CountdownTimer from "@/components/common/CountdownTimer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  MapPin, 
  Users,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UpcomingMatchProps {
  match: Match;
}

const UpcomingMatch = ({ match }: UpcomingMatchProps) => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [roomVisible, setRoomVisible] = useState(false);
  
  useEffect(() => {
    // Check if room details should be visible (15 min before match)
    if (match.roomDetails && match.roomDetails.visibleAt) {
      const visibleAt = new Date(match.roomDetails.visibleAt);
      const now = new Date();
      
      if (now >= visibleAt) {
        setRoomVisible(true);
      } else {
        // Set a timeout to make room details visible when time comes
        const timeoutId = setTimeout(() => {
          setRoomVisible(true);
        }, visibleAt.getTime() - now.getTime());
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [match.roomDetails]);
  
  const handleViewDetails = () => {
    setLocation(`/match/${match.id}`);
  };
  
  // Calculate time remaining until match starts
  const matchDate = new Date(match.date);
  const now = new Date();
  const isMatchStarted = now >= matchDate;
  const secondsRemaining = getTimeRemainingInSeconds(matchDate);
  
  // Check if room details are available but not yet visible
  const isRoomAvailableSoon = match.roomDetails && !roomVisible;
  
  return (
    <div className="bg-dark-card rounded-xl overflow-hidden border border-gray-800 p-4 sm:p-6">
      <div className="sm:flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {match.status === "live" && (
              <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded">LIVE</span>
            )}
            {match.status === "upcoming" && (
              <span className="bg-warning text-dark text-xs font-medium px-2 py-0.5 rounded">UPCOMING</span>
            )}
            <span className="bg-dark bg-opacity-70 text-xs font-medium px-2 py-0.5 rounded text-white">
              {match.mode}
            </span>
          </div>
          <h3 className="text-lg font-bold font-poppins">{match.tournamentTitle}</h3>
          
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center text-sm text-gray-300">
              <Calendar className="h-4 w-4 mr-1" /> 
              {formatMatchTime(new Date(match.date))}
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <MapPin className="h-4 w-4 mr-1" /> 
              {match.map}
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <div className="gradient-border inline-block">
            <div className="bg-dark-card px-4 py-3 rounded-lg">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">
                  {isMatchStarted ? "Match started" : "Match starts in"}
                </div>
                <div className="font-rajdhani font-bold text-xl text-white">
                  {isMatchStarted ? (
                    <span className="text-red-400">LIVE NOW</span>
                  ) : (
                    <CountdownTimer initialSeconds={secondsRemaining} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Squad Members */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Your Squad</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Get user information */}
          <div className="bg-dark-lighter rounded-lg p-3 flex items-center gap-3 border-2 border-primary">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profilePicture || undefined} alt={user?.username || "User"} />
              <AvatarFallback className="bg-primary/20">
                {user?.username ? user.username.substring(0, 2).toUpperCase() : "US"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user?.username || "You"}</div>
              <div className="text-xs text-gray-400">You</div>
            </div>
          </div>
          
          {/* Show teammates (excluding the current user) */}
          {match.teamMembers
            .filter(id => id !== user?.id)
            .map((memberId, index) => (
              <div 
                key={`member-${memberId}-${index}`} 
                className="bg-dark-lighter rounded-lg p-3 flex items-center gap-3"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/20">
                    TM
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Teammate {index + 1}</div>
                  <div className="text-xs text-gray-400">Friend</div>
                </div>
              </div>
            ))
          }
          
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
      </div>
      
      {/* Match Room Details */}
      <div className="mt-6 p-4 bg-dark-lighter rounded-lg border border-gray-800">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Room Details</h4>
          {isRoomAvailableSoon && (
            <div className="flex items-center text-xs text-warning">
              <Clock className="h-3 w-3 mr-1" />
              <span>Available 15 min before match</span>
            </div>
          )}
        </div>
        
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-3 ${roomVisible ? 'bg-dark-card' : 'border border-dashed border-gray-700'} rounded-lg`}>
            <div className="text-xs text-gray-400 mb-1">Room ID</div>
            {roomVisible && match.roomDetails ? (
              <div className="font-mono font-medium">{match.roomDetails.roomId}</div>
            ) : (
              <div className="text-gray-500">••••••••</div>
            )}
          </div>
          
          <div className={`p-3 ${roomVisible ? 'bg-dark-card' : 'border border-dashed border-gray-700'} rounded-lg`}>
            <div className="text-xs text-gray-400 mb-1">Room Password</div>
            {roomVisible && match.roomDetails ? (
              <div className="font-mono font-medium">{match.roomDetails.roomPassword}</div>
            ) : (
              <div className="text-gray-500">••••••</div>
            )}
          </div>
        </div>
        
        {roomVisible && match.roomDetails && (
          <Alert className="mt-4 bg-dark-card border-warning">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertTitle className="text-warning">Important</AlertTitle>
            <AlertDescription className="text-gray-300">
              Join the room at least 5 minutes before match start time. Players who fail to join on time may be disqualified.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={handleViewDetails}
        >
          View Match Details
        </Button>
      </div>
    </div>
  );
};

export default UpcomingMatch;
