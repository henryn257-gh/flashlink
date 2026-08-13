export const DEFAULT_TIMER_SECONDS = 10 * 60;

export function clampSeconds(
  seconds: number
): number {
  return Math.max(
    0,
    Math.floor(seconds)
  );
}

export function formatTimer(
  totalSeconds: number
): string {
  const seconds = clampSeconds(totalSeconds);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}
