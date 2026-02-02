import React, { useState, useEffect } from 'react';

interface ResendTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
}

const ResendTimer: React.FC<ResendTimerProps> = ({ initialSeconds, onComplete }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) {
      if (onComplete) onComplete();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onComplete]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (seconds <= 0) {
    return null;
  }

  return <span>({formatTime(seconds)})</span>;
};

export default ResendTimer;
