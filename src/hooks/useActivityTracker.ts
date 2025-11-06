import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseActivityTrackerOptions {
  onTimeout: () => void;
  timeoutMinutes?: number;
  warningMinutes?: number;
}

export const useActivityTracker = ({
  onTimeout,
  timeoutMinutes = 15,
  warningMinutes = 1,
}: UseActivityTrackerOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const warningShownRef = useRef(false);

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }
    warningShownRef.current = false;
  }, []);

  const resetTimer = useCallback(() => {
    clearTimers();

    // Set warning timer
    warningRef.current = setTimeout(() => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        toast.warning(
          `You will be logged out in ${warningMinutes} minute${warningMinutes > 1 ? 's' : ''} due to inactivity`,
          { duration: 5000 }
        );
      }
    }, warningMs);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      toast.error('Logged out due to inactivity');
      onTimeout();
    }, timeoutMs);
  }, [clearTimers, onTimeout, timeoutMs, warningMs, warningMinutes]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

    // Throttle activity detection to avoid excessive timer resets
    let throttleTimeout: NodeJS.Timeout;
    const throttledResetTimer = () => {
      if (!throttleTimeout) {
        resetTimer();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null as any;
        }, 30000); // Check activity every 30 seconds
      }
    };

    // Initialize timer
    resetTimer();

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, throttledResetTimer);
    });

    // Cleanup
    return () => {
      clearTimers();
      events.forEach((event) => {
        window.removeEventListener(event, throttledResetTimer);
      });
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [resetTimer, clearTimers]);

  return { resetTimer };
};
