import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTournaments } from "@/hooks/useTournaments";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  formatCurrency,
  formatTimeRemaining,
  getTimeRemainingInSeconds,
} from "@/lib/utils";
import {
  Trophy,
  Calendar,
  Users,
  MapPin,
  Sword,
  ArrowLeft,
  Clock,
  Info,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TournamentDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { getTournament, joinTournament } = useTournaments();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  const [selectedTeammates, setSelectedTeammates] = useState<number[]>([]);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Get tournament data
  const tournament = getTournament(Number(id));

  // Update countdown timer every second
  useEffect(() => {
    if (!tournament) return;

    const updateTimer = () => {
      const seconds = getTimeRemainingInSeconds(new Date(tournament.date));
      setTimeRemaining(seconds);
    };

    // Initial update
    updateTimer();

    // Set interval for updates
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [tournament]);

  if (!tournament || !user) {
    return (
      <div className="container py-10 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin mb-4">
            <Loader2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-medium">Loading tournament details...</h2>
        </div>
      </div>
    );
  }

  const handleBackClick = () => {
    setLocation("/tournaments");
  };

  const openJoinDialog = () => {
    setJoinDialogOpen(true);
  };

  const handleJoinTournament = async () => {
    if (!user) return;

    setIsJoining(true);
    try {
      const teammates = tournament.mode === "SOLO" ? [] : selectedTeammates;
      const success = await joinTournament(tournament.id, user, teammates);

      if (success) {
        toast({
          title: "Success",
          description: "You have successfully joined the tournament!",
        });
        setJoinDialogOpen(false);
        // In a real app, we'd refresh the tournament data here
      } else {
        toast({
          variant: "destructive",
          title: "Failed to join",
          description:
            "Could not join the tournament. Please try again later.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Check if tournament is already joined by the user
  const isJoined = false; // In a real app, this would be determined from the backend

  // Format date
  const tournamentDate = new Date(tournament.date);
  const formattedDate = tournamentDate.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = tournamentDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Generate tournament rules based on mode
  const tournamentRules = [
    "Players must be registered on the platform to participate",
    "Tournament starts exactly at the scheduled time",
    "No teaming with other squads or players is allowed",
    "Using game exploits or hacks will result in disqualification",
    "Match results must be submitted within 15 minutes after completion",
    tournament.mode === "SOLO"
      ? "Solo players only - no teaming allowed"
      : tournament.mode === "DUO"
      ? "Teams must consist of exactly 2 players"
      : "Teams must consist of exactly 4 players",
    "All players must join the custom room at least 5 minutes before match start",
    "Room details will be shared 15 minutes before the match",
  ];

  // Player limit based on mode
  const playerLimit = tournament.mode === "SOLO" ? 1 : 
                      tournament.mode === "DUO" ? 2 : 4;

  // Mock squad members (in a real app, this would come from the API)
  const squadMembers = [
    {
      id: 1,
      username: "FriendPlayer1",
      profilePicture: null,
      gameId: "PUBG123456",
    },
    {
      id: 2,
      username: "FriendPlayer2",
      profilePicture: null,
      gameId: "PUBG789012",
    },
    {
      id: 3,
      username: "FriendPlayer3",
      profilePicture: null,
      gameId: "PUBG345678",
    },
  ];

  // Toggle teammate selection
  const toggleTeammateSelection = (id: number) => {
    if (selectedTeammates.includes(id)) {
      setSelectedTeammates(selectedTeammates.filter((memberId) => memberId !== id));
    } else {
      // Check if we've reached the player limit for the mode
      if (selectedTeammates.length < playerLimit - 1) {
        setSelectedTeammates([...selectedTeammates, id]);
      } else {
        toast({
          variant: "destructive",
          title: `Team Size Limit Reached`,
          description: `You can only select ${playerLimit - 1} teammates for ${tournament.mode} mode.`,
        });
      }
    }
  };

  return (
    <div className="container py-6">
      <Button
        variant="ghost"
        className="mb-6 text-gray-400"
        onClick={handleBackClick}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tournaments
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tournament Info Column */}
        <div className="lg:col-span-2">
          <div className="relative h-64 rounded-xl overflow-hidden mb-6">
            <img
              src={tournament.image}
              alt={tournament.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent flex flex-col justify-end p-6">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className="bg-primary">{tournament.gameMode}</Badge>
                <Badge variant="outline" className="border-gray-700">
                  {tournament.mode}
                </Badge>

                {tournament.status === "live" && (
                  <Badge className="bg-red-500">LIVE</Badge>
                )}

                {tournament.status === "upcoming" && (
                  <Badge
                    variant="outline"
                    className="border-warning text-warning"
                  >
                    UPCOMING
                  </Badge>
                )}

                {tournament.status === "completed" && (
                  <Badge
                    variant="outline"
                    className="border-green-500 text-green-500"
                  >
                    COMPLETED
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                {tournament.title}
              </h1>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center text-sm text-gray-300">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formattedDate} at {formattedTime}
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <MapPin className="h-4 w-4 mr-1" />
                  {tournament.map}
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="prizes">Prize Distribution</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card className="bg-dark-card border-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Tournament Details
                </h3>
                <p className="text-gray-300 mb-6">
                  {tournament.description ||
                    `Join this exciting ${tournament.gameMode} tournament on ${tournament.map} map. Compete in ${tournament.mode} mode and win from a prize pool of ${formatCurrency(tournament.prizePool, user.currency)}. Each kill earns you ${formatCurrency(tournament.perKill, user.currency)}.`}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Entry Fee</p>
                    <p className="font-medium font-rajdhani">
                      {formatCurrency(tournament.entryFee, user.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Prize Pool</p>
                    <p className="font-medium font-rajdhani text-green-400">
                      {formatCurrency(tournament.prizePool, user.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Per Kill</p>
                    <p className="font-medium font-rajdhani">
                      {formatCurrency(tournament.perKill, user.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Max Players</p>
                    <p className="font-medium font-rajdhani">
                      {tournament.maxPlayers}
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="rules" className="mt-6">
              <Card className="bg-dark-card border-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-4">Tournament Rules</h3>
                <ul className="space-y-3">
                  {tournamentRules.map((rule, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-2 mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary bg-opacity-10">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      <span className="text-gray-300">{rule}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="prizes" className="mt-6">
              <Card className="bg-dark-card border-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Prize Distribution
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-900/20 to-yellow-900/10 rounded-lg border border-yellow-700/30">
                    <div className="flex items-center">
                      <div className="bg-yellow-500 p-1.5 rounded-full mr-3">
                        <Trophy className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <div className="font-medium">1st Place</div>
                        <div className="text-sm text-gray-400">
                          Winner Winner Chicken Dinner
                        </div>
                      </div>
                    </div>
                    <div className="text-yellow-400 font-rajdhani font-semibold text-lg">
                      {formatCurrency(tournament.prizePool * 0.5, user.currency)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-700/20 to-gray-700/10 rounded-lg border border-gray-600/30">
                    <div className="flex items-center">
                      <div className="bg-gray-400 p-1.5 rounded-full mr-3">
                        <Trophy className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <div className="font-medium">2nd Place</div>
                        <div className="text-sm text-gray-400">Runner Up</div>
                      </div>
                    </div>
                    <div className="text-gray-300 font-rajdhani font-semibold text-lg">
                      {formatCurrency(tournament.prizePool * 0.3, user.currency)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-900/20 to-amber-900/10 rounded-lg border border-amber-700/30">
                    <div className="flex items-center">
                      <div className="bg-amber-600 p-1.5 rounded-full mr-3">
                        <Trophy className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <div className="font-medium">3rd Place</div>
                        <div className="text-sm text-gray-400">
                          Bronze Finisher
                        </div>
                      </div>
                    </div>
                    <div className="text-amber-400 font-rajdhani font-semibold text-lg">
                      {formatCurrency(tournament.prizePool * 0.2, user.currency)}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Kill Rewards</h4>
                    <p className="text-gray-300">
                      Each kill earns{" "}
                      <span className="text-green-400 font-medium">
                        {formatCurrency(tournament.perKill, user.currency)}
                      </span>{" "}
                      regardless of your final position.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Join Tournament Column */}
        <div>
          <Card className="bg-dark-card border-gray-800 p-6 mb-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Tournament Status</h3>

              {tournament.status === "upcoming" && (
                <>
                  <div className="bg-dark-lighter rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-400 mb-1">Starts in</p>
                    <div className="font-rajdhani font-bold text-2xl text-warning">
                      {timeRemaining > 0 ? (
                        formatTimeRemaining(timeRemaining)
                      ) : (
                        <span className="text-primary">Starting soon</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-left">
                      <p className="text-sm text-gray-400 mb-1">Entry Fee</p>
                      <p className="font-medium">
                        {formatCurrency(tournament.entryFee, user.currency)}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-400 mb-1">Your Balance</p>
                      <p className="font-medium">
                        {formatCurrency(user.walletBalance, user.currency)}
                      </p>
                    </div>
                  </div>

                  {user.walletBalance < tournament.entryFee ? (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-700/30 rounded-lg text-center">
                      <AlertTriangle className="h-5 w-5 text-red-400 mx-auto mb-2" />
                      <p className="text-red-400 mb-1">Insufficient Balance</p>
                      <p className="text-sm text-gray-400">
                        Add funds to your wallet to join this tournament
                      </p>
                    </div>
                  ) : null}

                  {isJoined ? (
                    <div className="mb-4 p-3 bg-green-900/20 border border-green-700/30 rounded-lg text-center">
                      <CheckCircle2 className="h-5 w-5 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 mb-1">You're Registered!</p>
                      <p className="text-sm text-gray-400">
                        You have successfully joined this tournament
                      </p>
                    </div>
                  ) : null}

                  <Button
                    onClick={openJoinDialog}
                    disabled={
                      isJoined ||
                      user.walletBalance < tournament.entryFee ||
                      tournament.status !== "upcoming"
                    }
                    className="w-full bg-gradient-to-r from-primary to-secondary mt-2"
                  >
                    {isJoined ? "Already Joined" : "Join Tournament"}
                  </Button>
                </>
              )}

              {tournament.status === "live" && (
                <>
                  <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg text-center mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mx-auto mb-2"></div>
                    <p className="text-red-400 font-medium">
                      Tournament is Live!
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Match is currently in progress
                    </p>
                  </div>

                  {isJoined ? (
                    <Button asChild className="w-full bg-red-500 hover:bg-red-600">
                      <a href="/matches">View Your Match</a>
                    </Button>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Registration is closed for this tournament
                    </p>
                  )}
                </>
              )}

              {tournament.status === "completed" && (
                <>
                  <div className="p-4 bg-green-900/20 border border-green-700/30 rounded-lg text-center mb-4">
                    <CheckCircle2 className="h-5 w-5 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-medium">
                      Tournament Completed
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      This tournament has ended
                    </p>
                  </div>

                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <a href={`/tournament/${tournament.id}/results`}>
                      View Results
                    </a>
                  </Button>
                </>
              )}
            </div>

            <Separator className="bg-gray-800 my-6" />

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                Tournament Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mode</span>
                  <span>{tournament.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Game</span>
                  <span>{tournament.gameMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Map</span>
                  <span>{tournament.map}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Players</span>
                  <span>{tournament.maxPlayers}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-dark-card border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Important Notice</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Room ID and password will be shared 15 minutes before the
              tournament starts. Make sure to join the room at least 5 minutes
              before the match.
            </p>
            <div className="p-3 bg-dark-lighter rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Support</p>
              <p className="text-sm">
                Need help? Contact us at{" "}
                <a href="mailto:support@netwin.com" className="text-primary">
                  support@netwin.com
                </a>
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Join Tournament Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="bg-dark-card border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Join Tournament</DialogTitle>
            <DialogDescription className="text-gray-400">
              {tournament.mode === "SOLO"
                ? "Confirm your registration for this solo tournament."
                : `Select your teammates for this ${tournament.mode.toLowerCase()} tournament.`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {tournament.mode !== "SOLO" && (
              <>
                <h4 className="font-medium mb-3">
                  Select your teammates ({selectedTeammates.length}/
                  {playerLimit - 1})
                </h4>
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
                  {squadMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`p-3 flex items-center justify-between rounded-lg cursor-pointer ${
                        selectedTeammates.includes(member.id)
                          ? "bg-primary/20 border border-primary/40"
                          : "bg-dark-lighter border border-gray-800"
                      }`}
                      onClick={() => toggleTeammateSelection(member.id)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-9 w-9 mr-3">
                          <AvatarImage
                            src={member.profilePicture || undefined}
                            alt={member.username}
                          />
                          <AvatarFallback className="bg-primary/20">
                            {member.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.username}</div>
                          <div className="text-xs text-gray-400">
                            ID: {member.gameId}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          selectedTeammates.includes(member.id)
                            ? "bg-primary border-primary"
                            : "border-gray-600"
                        } flex items-center justify-center`}
                      >
                        {selectedTeammates.includes(member.id) && (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                  ))}

                  {squadMembers.length === 0 && (
                    <div className="text-center py-4 text-gray-400">
                      You haven't added any friends to your squad yet.
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-gray-800/40 rounded-lg">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9 mr-3">
                      <AvatarImage
                        src={user.profilePicture || undefined}
                        alt={user.username}
                      />
                      <AvatarFallback className="bg-primary/20">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.username} (You)</div>
                      <div className="text-xs text-gray-400">
                        ID: {user.gameId || "Not set"}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="mt-6">
              <div className="bg-dark-lighter rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Entry Fee</span>
                  <span>{formatCurrency(tournament.entryFee, user.currency)}</span>
                </div>
                <Separator className="bg-gray-700 my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatCurrency(tournament.entryFee, user.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setJoinDialogOpen(false)}
              className="border-gray-700 mt-3 sm:mt-0"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinTournament}
              disabled={
                isJoining ||
                (tournament.mode !== "SOLO" &&
                  selectedTeammates.length !== playerLimit - 1)
              }
              className="bg-gradient-to-r from-primary to-secondary"
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay & Join Tournament`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}