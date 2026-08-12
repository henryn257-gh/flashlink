import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface CardProps {
  term: string;
  definition: string;
  flipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  disabled?: boolean;
  footer?: ReactNode;
  className?: string;
}

function Card({
  term,
  definition,
  flipped: controlledFlipped,
  onFlip,
  disabled = false,
  footer,
  className = "",
}: CardProps) {
  const [internalFlipped, setInternalFlipped] =
    useState(false);

  const isControlled =
    controlledFlipped !== undefined;

  const flipped = isControlled
    ? controlledFlipped
    : internalFlipped;

  useEffect(() => {
    if (isControlled) {
      return;
    }

    setInternalFlipped(false);
  }, [term, definition, isControlled]);

  const handleFlip = () => {
    if (disabled) {
      return;
    }

    const nextFlipped = !flipped;

    if (!isControlled) {
      setInternalFlipped(nextFlipped);
    }

    onFlip?.(nextFlipped);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (
      event.key === " " ||
      event.key === "Enter"
    ) {
      event.preventDefault();
      handleFlip();
    }
  };

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={
          flipped
            ? "Flashcard definition. Press Space to show the term."
            : "Flashcard term. Press Space to show the definition."
        }
        aria-disabled={disabled}
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
        className={[
          "group relative min-h-[320px] w-full",
          "cursor-pointer select-none",
          "perspective-[1200px]",
          disabled
            ? "cursor-not-allowed opacity-60"
            : "",
        ].join(" ")}
      >
        <div
          className={[
            "relative min-h-[320px] w-full",
            "[transform-style:preserve-3d]",
            "transition-transform duration-500",
            "ease-out",
            flipped
              ? "[transform:rotateY(180deg)]"
              : "",
          ].join(" ")}
        >
          <div
            className={[
              "absolute inset-0",
              "[backface-visibility:hidden]",
              "rounded-2xl border border-border",
              "bg-card p-8 shadow-lg",
              "flex flex-col items-center justify-center",
              "text-center",
            ].join(" ")}
          >
            <span className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Term
            </span>

            <p className="max-w-2xl text-2xl font-semibold leading-relaxed sm:text-3xl">
              {term || "No term"}
            </p>

            <span className="mt-8 text-sm text-muted-foreground">
              Click or press Space to flip
            </span>
          </div>

          <div
            className={[
              "absolute inset-0",
              "[backface-visibility:hidden]",
              "[transform:rotateY(180deg)]",
              "rounded-2xl border border-border",
              "bg-card p-8 shadow-lg",
              "flex flex-col items-center justify-center",
              "text-center",
            ].join(" ")}
          >
            <span className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Definition
            </span>

            <p className="max-w-2xl text-xl leading-relaxed sm:text-2xl">
              {definition || "No definition"}
            </p>

            <span className="mt-8 text-sm text-muted-foreground">
              Click or press Space to flip back
            </span>
          </div>
        </div>
      </div>

      {footer && (
        <div className="mt-4">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;
