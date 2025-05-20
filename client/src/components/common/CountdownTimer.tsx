import { useState, useEffect } from "react";
import { formatTimeRemaining } from "@/lib/utils";

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
}

const CountdownTimer = ({ initialSeconds, onComplete }: CountdownTimerProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  
  useEffect(() => {
    // Update countdown every second
    const intervalId = setInterval(() => {
      setSeconds(prevSeconds => {
        if (prevSeconds <= 1) {
          clearInterval(intervalId);
          onComplete?.();
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [onComplete]);
  
  return (
    <div className="font-mono font-medium">
      {formatTimeRemaining(seconds)}
    </div>
  );
};

export default CountdownTimer;