import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GameModeSelectorProps {
  className?: string;
  onSelectMode?: (mode: "PUBG" | "BGMI") => void;
}

const GameModeSelector = ({ className, onSelectMode }: GameModeSelectorProps) => {
  const { user, updateUser } = useAuth();
  const [selectedMode, setSelectedMode] = useState<"PUBG" | "BGMI">(
    user?.gameMode || "PUBG"
  );

  const handleModeChange = (mode: "PUBG" | "BGMI") => {
    setSelectedMode(mode);
    
    // Update user preference if logged in
    if (user) {
      updateUser({ gameMode: mode });
    }
    
    // Call external handler if provided
    if (onSelectMode) {
      onSelectMode(mode);
    }
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="text-sm text-gray-400 mb-2">Select Game</div>
      <div className="flex items-center gap-3">
        <Button
          variant={selectedMode === "PUBG" ? "default" : "outline"}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            selectedMode === "PUBG"
              ? "bg-primary text-white"
              : "bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800"
          )}
          onClick={() => handleModeChange("PUBG")}
        >
          PUBG
        </Button>
        
        <Button
          variant={selectedMode === "BGMI" ? "default" : "outline"}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            selectedMode === "BGMI"
              ? "bg-primary text-white"
              : "bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800"
          )}
          onClick={() => handleModeChange("BGMI")}
        >
          BGMI
        </Button>
      </div>
    </div>
  );
};

export default GameModeSelector;