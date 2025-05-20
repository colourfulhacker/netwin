import { useState } from "react";
import { Match, TeamMember } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import ScreenshotUpload from "./ScreenshotUpload";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  ShieldAlert,
  Upload,
  CheckCircle2,
  Loader2,
  Clock,
  Skull
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MatchResultsProps {
  match: Match;
  onUploadResult?: (screenshot: string) => Promise<boolean>;
}

const MatchResults = ({ match, onUploadResult }: MatchResultsProps) => {
  const { user } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const handleUploadResult = async (screenshot: string) => {
    if (!onUploadResult) return;
    
    setUploading(true);
    try {
      const success = await onUploadResult(screenshot);
      if (success) {
        setUploadDialogOpen(false);
      }
    } finally {
      setUploading(false);
    }
  };
  
  const handleViewScreenshot = (screenshot: string) => {
    setPreviewImage(screenshot);
  };
  
  if (!user) return null;

  // Sort team members by kills (if available)
  const sortedTeamMembers = [...match.teamMembers].sort((a, b) => {
    return (b.kills || 0) - (a.kills || 0);
  });
  
  const isOwner = match.teamMembers.some(member => member.id === user.id && member.isOwner);
  const canUploadResult = isOwner && !match.resultSubmitted && match.status === "completed";
  const isPendingApproval = match.resultSubmitted && !match.resultApproved;
  const isApproved = match.resultApproved;
  
  return (
    <div className="bg-dark-card rounded-xl overflow-hidden border border-gray-800">
      {/* Match Result Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold font-poppins">{match.tournamentTitle}</h3>
          
          <div className="flex items-center gap-2">
            {match.status === "completed" && (
              <>
                {isApproved ? (
                  <Badge variant="outline" className="bg-green-900 bg-opacity-20 border-green-700 text-green-400">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : match.resultSubmitted ? (
                  <Badge variant="outline" className="bg-yellow-900 bg-opacity-20 border-yellow-700 text-yellow-400">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Approval
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-900 bg-opacity-20 border-red-700 text-red-400">
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    Result Required
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Match Performance Summary */}
      <div className="p-6">
        {match.status === "completed" ? (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-dark-lighter p-4 rounded-lg text-center">
              <div className="text-xs text-gray-400 mb-1">Position</div>
              {match.position ? (
                <div className="text-xl font-rajdhani font-bold">
                  {match.position === 1 ? (
                    <span className="text-yellow-400">#1</span>
                  ) : match.position <= 3 ? (
                    <span className="text-amber-500">#{match.position}</span>
                  ) : (
                    <span>#{match.position}</span>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">--</div>
              )}
            </div>
            
            <div className="bg-dark-lighter p-4 rounded-lg text-center">
              <div className="text-xs text-gray-400 mb-1">Team Kills</div>
              {sortedTeamMembers.some(member => typeof member.kills === 'number') ? (
                <div className="text-xl font-rajdhani font-bold">
                  {sortedTeamMembers.reduce((total, member) => total + (member.kills || 0), 0)}
                </div>
              ) : (
                <div className="text-gray-500">--</div>
              )}
            </div>
            
            <div className="bg-dark-lighter p-4 rounded-lg text-center">
              <div className="text-xs text-gray-400 mb-1">Prize</div>
              {match.prize ? (
                <div className="text-xl font-rajdhani font-bold text-green-400">
                  {formatCurrency(match.prize, user.currency)}
                </div>
              ) : (
                <div className="text-gray-500">--</div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-dark-lighter p-4 rounded-lg text-center mb-6">
            <div className="text-gray-400">
              Match results will be available once the match is completed.
            </div>
          </div>
        )}
        
        {/* Team Performance */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="team" className="border-gray-800">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-medium">Team Performance</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {sortedTeamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 bg-dark-lighter p-3 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.profilePicture} alt={member.username} />
                      <AvatarFallback className="bg-primary/20">
                        {member.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {member.username}
                        {member.isOwner && (
                          <span className="text-xs bg-primary bg-opacity-20 text-primary px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">ID: {member.gameId}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {typeof member.kills === 'number' ? (
                        <div className="flex items-center gap-1 text-red-400">
                          <Skull className="h-4 w-4" />
                          <span className="font-rajdhani font-bold">{member.kills}</span>
                        </div>
                      ) : (
                        <div className="text-gray-500">--</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* Result Screenshot */}
        {match.resultScreenshot && (
          <div className="mt-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Result Screenshot
            </h4>
            <div className="cursor-pointer" onClick={() => handleViewScreenshot(match.resultScreenshot!)}>
              <img 
                src={match.resultScreenshot} 
                alt="Match Result" 
                className="w-full rounded-lg border border-gray-800 hover:opacity-90 transition"
              />
            </div>
          </div>
        )}
        
        {/* Upload Result Button for team owner */}
        {canUploadResult && (
          <div className="mt-6 flex justify-center">
            <Button 
              className="bg-gradient-to-r from-primary to-secondary"
              onClick={() => setUploadDialogOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Match Result
            </Button>
          </div>
        )}
        
        {/* Status message for non-owners */}
        {match.status === "completed" && !isOwner && !match.resultSubmitted && (
          <div className="mt-6 text-center text-gray-400">
            Waiting for team owner to submit match result.
          </div>
        )}
        
        {/* Result pending message */}
        {isPendingApproval && (
          <div className="mt-6 p-4 bg-yellow-900 bg-opacity-10 border border-yellow-900 text-yellow-400 rounded-lg text-center">
            <Clock className="h-5 w-5 mx-auto mb-2" />
            <p>Your match result has been submitted and is awaiting admin approval.</p>
          </div>
        )}
      </div>
      
      {/* Upload Result Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="bg-dark-card text-white border-gray-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Match Result</DialogTitle>
            <DialogDescription className="text-gray-400">
              Upload a screenshot of your match result screen showing your position and kills.
            </DialogDescription>
          </DialogHeader>
          
          <ScreenshotUpload onUpload={handleUploadResult} />
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
              disabled={uploading}
              className="border-gray-700"
            >
              Cancel
            </Button>
            {uploading && (
              <Button disabled className="bg-primary">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Preview Image Dialog */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="bg-dark-card text-white border-gray-800 sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Match Result</DialogTitle>
            </DialogHeader>
            <div className="w-full">
              <img 
                src={previewImage} 
                alt="Match Result" 
                className="w-full rounded-lg border border-gray-800"
              />
            </div>
            <DialogFooter>
              <Button 
                onClick={() => setPreviewImage(null)}
                className="border-gray-700"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MatchResults;
