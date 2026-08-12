import { useEffect } from "react";

interface KeyboardHandlers {
  onSpace?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onEscape?: () => void;
  onF?: () => void;
}

interface UseKeyboardOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

function useKeyboard(
  handlers: KeyboardHandlers,
  options: UseKeyboardOptions = {}
): void {
  const {
    enabled = true,
    preventDefault = true,
  } = options;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement &&
          target.isContentEditable)
      ) {
        return;
      }

      switch (event.key) {
        case " ":
          if (handlers.onSpace) {
            if (preventDefault) {
              event.preventDefault();
            }

            handlers.onSpace();
          }
          break;

        case "ArrowLeft":
          if (handlers.onLeft) {
            if (preventDefault) {
              event.preventDefault();
            }

            handlers.onLeft();
          }
          break;

        case "ArrowRight":
          if (handlers.onRight) {
            if (preventDefault) {
              event.preventDefault();
            }

            handlers.onRight();
          }
          break;

        case "Escape":
          if (handlers.onEscape) {
            if (preventDefault) {
              event.preventDefault();
            }

            handlers.onEscape();
          }
          break;

        case "f":
        case "F":
          if (handlers.onF) {
            if (preventDefault) {
              event.preventDefault();
            }

            handlers.onF();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    enabled,
    handlers,
    preventDefault,
  ]);
}

export default useKeyboard;
