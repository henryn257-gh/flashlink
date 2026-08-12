interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

function ProgressBar({
  current,
  total,
  showLabel = true,
}: ProgressBarProps) {
  const safeTotal = Math.max(total, 0);
  const safeCurrent = Math.min(
    Math.max(current, 0),
    safeTotal
  );

  const percentage =
    safeTotal === 0
      ? 0
      : (safeCurrent / safeTotal) * 100;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Progress
          </span>

          <span className="font-medium">
            {safeCurrent}/{safeTotal}
          </span>
        </div>
      )}

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={safeCurrent}
        aria-label="Progress"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
