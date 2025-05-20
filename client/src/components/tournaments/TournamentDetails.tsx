import { useState } from "react";
import { Tournament } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { formatMatchTime, formatCurrency } from "@/lib/utils";
import { 
  Calendar, MapPin, DollarSign, Users, Clock, 
  Award, Crosshair, Info
} from "lucide-react";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import JoinTournamentModal from "./JoinTournamentModal";

interface TournamentDetailsProps {
  tournament: Tournament;
}

const TournamentDetails = ({ tournament }: TournamentDetailsProps) => {
  const { user } = useAuth();
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const handleJoinClick = () => {
    setJoinModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Tournament Banner */}
      <div className="relative overflow-hidden rounded-xl h-60 sm:h-80">
        <img 
          src={tournament.image} 
          alt={tournament.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            {tournament.status === "live" && (
              <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded">LIVE</span>
            )}
            {tournament.status === "upcoming" && (
              <span className="bg-yellow-500 text-black text-xs font-medium px-2 py-0.5 rounded">UPCOMING</span>
            )}
            {tournament.status === "completed" && (
              <span className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded">COMPLETED</span>
            )}
            <span className="bg-dark bg-opacity-70 text-white text-xs font-medium px-2 py-0.5 rounded">
              {tournament.mode}
            </span>
            <span className="bg-dark bg-opacity-70 text-white text-xs font-medium px-2 py-0.5 rounded">
              {tournament.gameMode}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-poppins text-white">{tournament.title}</h1>
        </div>
      </div>
      
      {/* Tournament Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-dark-card p-4 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm text-gray-400">Date & Time</span>
          </div>
          <div className="font-medium">{formatMatchTime(new Date(tournament.date))}</div>
        </div>
        
        <div className="bg-dark-card p-4 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm text-gray-400">Map</span>
          </div>
          <div className="font-medium">{tournament.map}</div>
        </div>
        
        <div className="bg-dark-card p-4 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-sm text-gray-400">Entry Fee</span>
          </div>
          <div className="font-medium">{formatCurrency(tournament.entryFee, user?.currency || "USD")}</div>
        </div>
        
        <div className="bg-dark-card p-4 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm text-gray-400">Slots</span>
          </div>
          <div className="font-medium">{tournament.registeredPlayers}/{tournament.maxPlayers}</div>
        </div>
      </div>
      
      {/* Tournament Details Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid grid-cols-3 bg-dark-card">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="prizes">Prizes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="mt-4">
          <div className="bg-dark-card rounded-xl p-4 border border-gray-800 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Tournament Details</h3>
              <p className="text-gray-300">{tournament.description || "Join this exciting tournament and showcase your gaming skills. Compete against the best players and win amazing prizes!"}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Format</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Match starts at: {new Date(tournament.date).toLocaleTimeString()}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Mode: {tournament.mode}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Map: {tournament.map}</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Rewards</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-400" />
                    <span>Prize Pool: {formatCurrency(tournament.prizePool, user?.currency || "USD")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Crosshair className="h-4 w-4 text-red-400" />
                    <span>Per Kill: {formatCurrency(tournament.perKill, user?.currency || "USD")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="rules" className="mt-4">
          <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">Tournament Rules</h3>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-white hover:text-primary">General Rules</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>All participants must join the match lobby 15 minutes before the match starts.</li>
                    <li>Players must use their registered game IDs only.</li>
                    <li>Any form of cheating or hacking will result in immediate disqualification.</li>
                    <li>The tournament organizer's decision will be final in case of disputes.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-white hover:text-primary">Scoring System</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Position Points: 1st (15), 2nd (12), 3rd (10), 4th (8), 5th (6), 6th-10th (4), 11th-15th (2)</li>
                    <li>Each kill: {formatCurrency(tournament.perKill, user?.currency || "USD")}</li>
                    <li>The team with the highest total points will be declared the winner.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-white hover:text-primary">Match Settings</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Map: {tournament.map}</li>
                    <li>Mode: {tournament.mode}</li>
                    <li>TPP/FPP: TPP</li>
                    <li>Red Zone: Enabled</li>
                    <li>Flare Guns: Enabled</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-white hover:text-primary">Result Submission</AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Team owners must submit a screenshot of their match results within 30 minutes after the match ends.</li>
                    <li>The screenshot must clearly show the team name, position, and kill count.</li>
                    <li>Failure to submit results on time may result in disqualification.</li>
                    <li>Prize distribution will be done within 24 hours after the tournament ends.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>
        
        <TabsContent value="prizes" className="mt-4">
          <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">Prize Distribution</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-dark-lighter p-3 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">1st Place</h4>
                  <p className="text-gray-400 text-sm">Winner Winner Chicken Dinner</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-yellow-400">
                    {formatCurrency(Math.round(tournament.prizePool * 0.5), user?.currency || "USD")}
                  </div>
                  <p className="text-xs text-gray-400">50% of prize pool</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-dark-lighter p-3 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center">
                  <span className="font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">2nd Place</h4>
                  <p className="text-gray-400 text-sm">Runner Up</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-300">
                    {formatCurrency(Math.round(tournament.prizePool * 0.3), user?.currency || "USD")}
                  </div>
                  <p className="text-xs text-gray-400">30% of prize pool</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-dark-lighter p-3 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center">
                  <span className="font-bold">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">3rd Place</h4>
                  <p className="text-gray-400 text-sm">Second Runner Up</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-600">
                    {formatCurrency(Math.round(tournament.prizePool * 0.2), user?.currency || "USD")}
                  </div>
                  <p className="text-xs text-gray-400">20% of prize pool</p>
                </div>
              </div>
              
              <div className="bg-dark-lighter p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Crosshair className="h-5 w-5 text-red-400" />
                    <h4 className="font-medium">Per Kill Reward</h4>
                  </div>
                  <div className="font-bold text-red-400">
                    {formatCurrency(tournament.perKill, user?.currency || "USD")}
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Each kill earns the player additional {formatCurrency(tournament.perKill, user?.currency || "USD")} on top of the position rewards.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Call to Action */}
      <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Info className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Ready to join?</h3>
        </div>
        
        <p className="text-gray-300 mb-4">
          Secure your spot in this exciting tournament and compete for a prize pool of {formatCurrency(tournament.prizePool, user?.currency || "USD")}!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            className="bg-gradient-to-r from-primary to-secondary text-white font-medium py-2 px-6 rounded-lg transition"
            onClick={handleJoinClick}
            disabled={tournament.status === "completed" || tournament.status === "cancelled"}
          >
            {tournament.status === "completed" ? "Tournament Ended" : 
             tournament.status === "cancelled" ? "Tournament Cancelled" : 
             tournament.status === "live" ? "Join Live Tournament" : "Join Tournament"}
          </Button>
          
          <Button 
            variant="outline"
            className="border-gray-600 text-white hover:bg-dark-lighter"
          >
            Share Tournament
          </Button>
        </div>
      </div>
      
      {/* Join Tournament Modal */}
      <JoinTournamentModal 
        tournament={tournament}
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />
    </div>
  );
};

export default TournamentDetails;
