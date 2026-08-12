interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

function ProgressBar({
  value,
  label,
  showPercentage = true,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(
    100,
    Math.max(0, value)
  );

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="mb-2 flex items-center justify-between text-sm">
          {label ? (
            <span className="font-medium">
              {label}
            </span>
          ) : (
            <span />
          )}

          {showPercentage && (
            <span className="text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(
          percentage
        )}
        aria-label={
          label
            ? `${label} progress`
            : "Progress"
        }
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
