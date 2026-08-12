import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface UseTimerOptions {
  duration: number;
  autoStart?: boolean;
  onComplete?: () => void;
}

interface UseTimerReturn {
  remaining: number;
  isRunning: boolean;
  isComplete: boolean;

  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useTimer({
  duration,
  autoStart = false,
  onComplete,
}: UseTimerOptions): UseTimerReturn {
  const [remaining, setRemaining] =
    useState(Math.max(0, duration));

  const [isRunning, setIsRunning] =
    useState(autoStart);

  const intervalRef =
    useRef<number | null>(null);

  const onCompleteRef =
    useRef(onComplete);

  /*
   * Keep the latest callback without forcing
   * the timer interval to restart.
   */
  useEffect(() => {
    onCompleteRef.current =
      onComplete;
  }, [onComplete]);

  /*
   * If the configured duration changes,
   * reset the timer to the new duration.
   */
  useEffect(() => {
    setRemaining(
      Math.max(0, duration)
    );
  }, [duration]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(
        intervalRef.current
      );

      intervalRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const start = useCallback(() => {
    if (remaining <= 0) {
      return;
    }

    if (intervalRef.current !== null) {
      return;
    }

    setIsRunning(true);

    intervalRef.current =
      window.setInterval(() => {
        setRemaining((current) => {
          if (current <= 1) {
            clearTimer();
            setIsRunning(false);

            onCompleteRef.current?.();

            return 0;
          }

          return current - 1;
        });
      }, 1000);
  }, [clearTimer, remaining]);

  const reset = useCallback(() => {
    clearTimer();

    setRemaining(
      Math.max(0, duration)
    );

    setIsRunning(false);
  }, [clearTimer, duration]);

  /*
   * Auto-start only when requested.
   */
  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      clearTimer();
    };
  }, [autoStart, clearTimer, start]);

  const isComplete =
    remaining === 0;

  return {
    remaining,
    isRunning,
    isComplete,

    start,
    stop,
    reset,
  };
}
