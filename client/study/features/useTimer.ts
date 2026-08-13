import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  clampSeconds,
  DEFAULT_TIMER_SECONDS,
} from "./timer";

interface UseTimerOptions {
  initialSeconds?: number;
  autoStart?: boolean;
}

interface UseTimerReturn {
  secondsRemaining: number;
  isRunning: boolean;
  isFinished: boolean;

  start: () => void;
  pause: () => void;
  reset: () => void;
}

export function useTimer(
  options: UseTimerOptions = {}
): UseTimerReturn {
  const {
    initialSeconds = DEFAULT_TIMER_SECONDS,
    autoStart = false,
  } = options;

  const initialValue =
    clampSeconds(initialSeconds);

  const [secondsRemaining, setSecondsRemaining] =
    useState(initialValue);

  const [isRunning, setIsRunning] =
    useState(autoStart);

  const isFinished =
    secondsRemaining <= 0;

  useEffect(() => {
    if (!isRunning || isFinished) {
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          setIsRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isRunning, isFinished]);

  const start = useCallback(() => {
    setSecondsRemaining((current) =>
      current > 0
        ? current
        : initialValue
    );

    setIsRunning(true);
  }, [initialValue]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSecondsRemaining(initialValue);
  }, [initialValue]);

  return {
    secondsRemaining,
    isRunning,
    isFinished,

    start,
    pause,
    reset,
  };
}
