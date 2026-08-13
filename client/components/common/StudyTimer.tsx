import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  formatTimer,
} from "../../study/features/timer";

interface StudyTimerProps {
  secondsRemaining: number;
  isRunning: boolean;
  isFinished: boolean;

  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

const MIN_WIDTH = 180;
const MIN_HEIGHT = 120;

const MAX_WIDTH = 500;
const MAX_HEIGHT = 400;

function StudyTimer({
  secondsRemaining,
  isRunning,
  isFinished,
  onStart,
  onPause,
  onReset,
}: StudyTimerProps) {
  const [position, setPosition] =
    useState<Position>({
      x: 24,
      y: 24,
    });

  const [size, setSize] =
    useState<Size>({
      width: 220,
      height: 150,
    });

  const [dragging, setDragging] =
    useState(false);

  const [resizing, setResizing] =
    useState(false);

  const dragStart =
    useRef<Position | null>(null);

  const resizeStart =
    useRef<{
      pointerX: number;
      pointerY: number;
      width: number;
      height: number;
    } | null>(null);

  useEffect(() => {
    if (!dragging && !resizing) {
      return;
    }

    const handlePointerMove = (
      event: PointerEvent
    ) => {
      if (dragging && dragStart.current) {
        const deltaX =
          event.clientX -
          dragStart.current.x;

        const deltaY =
          event.clientY -
          dragStart.current.y;

        setPosition((current) => ({
          x: Math.max(
            0,
            current.x + deltaX
          ),
          y: Math.max(
            0,
            current.y + deltaY
          ),
        }));

        dragStart.current = {
          x: event.clientX,
          y: event.clientY,
        };
      }

      if (resizing && resizeStart.current) {
        const {
          pointerX,
          pointerY,
          width,
          height,
        } = resizeStart.current;

        const nextWidth = Math.min(
          MAX_WIDTH,
          Math.max(
            MIN_WIDTH,
            width +
              (event.clientX - pointerX)
          )
        );

        const nextHeight = Math.min(
          MAX_HEIGHT,
          Math.max(
            MIN_HEIGHT,
            height +
              (event.clientY - pointerY)
          )
        );

        setSize({
          width: nextWidth,
          height: nextHeight,
        });
      }
    };

    const stopInteraction = () => {
      setDragging(false);
      setResizing(false);
      dragStart.current = null;
      resizeStart.current = null;
    };

    window.addEventListener(
      "pointermove",
      handlePointerMove
    );

    window.addEventListener(
      "pointerup",
      stopInteraction
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      window.removeEventListener(
        "pointerup",
        stopInteraction
      );
    };
  }, [dragging, resizing]);

  const handleDragStart = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (event.button !== 0) {
      return;
    }

    setDragging(true);

    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handleResizeStart = (
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    setResizing(true);

    resizeStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      width: size.width,
      height: size.height,
    };
  };

  return (
    <section
      aria-label="Study timer"
      className="fixed z-50 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
    >
      <div
        onPointerDown={handleDragStart}
        className="flex cursor-move select-none items-center justify-between border-b border-border bg-muted/50 px-3 py-2"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Timer
        </span>

        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isFinished
              ? "bg-red-500"
              : isRunning
                ? "bg-green-500"
                : "bg-muted-foreground/50"
          }`}
          aria-hidden="true"
        />
      </div>

      <div className="flex h-[calc(100%-41px)] flex-col items-center justify-center gap-3 p-4">
        <div
          className={`font-mono text-3xl font-bold tracking-tight ${
            isFinished
              ? "text-red-500"
              : "text-foreground"
          }`}
          aria-live="polite"
          aria-label={`Time remaining ${formatTimer(
            secondsRemaining
          )}`}
        >
          {formatTimer(secondsRemaining)}
        </div>

        {isFinished && (
          <p className="text-xs font-medium text-red-500">
            Time's up
          </p>
        )}

        <div className="flex gap-2">
          {isRunning ? (
            <button
              type="button"
              onClick={onPause}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
            >
              Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={onStart}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
            >
              Start
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
          >
            Reset
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-label="Resize timer"
        onPointerDown={handleResizeStart}
        className="absolute bottom-0 right-0 h-5 w-5 cursor-se-resize touch-none"
      >
        <span
          aria-hidden="true"
          className="absolute bottom-1 right-1 h-2.5 w-2.5 border-b-2 border-r-2 border-muted-foreground/60"
        />
      </button>
    </section>
  );
}

export default StudyTimer;
