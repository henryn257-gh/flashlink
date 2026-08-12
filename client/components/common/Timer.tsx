import { formatTime } from "../../utils/time";

interface TimerProps {
  remaining: number;
  isRunning?: boolean;
  isComplete?: boolean;
  className?: string;
}

function Timer({
  remaining,
  isRunning = false,
  isComplete = false,
  className = "",
}: TimerProps) {
  const stateClass = isComplete
    ? "text-red-500"
    : isRunning
      ? "text-primary"
      : "text-foreground";

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={`Time remaining ${formatTime(
        remaining
      )}`}
      className={`font-mono text-lg font-semibold tabular-nums ${stateClass} ${className}`}
    >
      {formatTime(remaining)}
    </div>
  );
}

export default Timer;
