import {
  useEffect,
  type ReactNode,
} from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  closeOnBackdrop?: boolean;
}

function Modal({
  open,
  onClose,
  title,
  children,
  closeOnBackdrop = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (
      closeOnBackdrop &&
      event.target === event.currentTarget
    ) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={[
          "w-full max-w-lg",
          "rounded-2xl border border-border",
          "bg-card text-foreground",
          "p-6 shadow-2xl",
        ].join(" ")}
      >
        {title && (
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2
              id="modal-title"
              className="text-xl font-semibold"
            >
              {title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className={[
                "rounded-lg p-2",
                "text-muted-foreground",
                "transition-colors",
                "hover:bg-slate-100 hover:text-foreground",
                "focus:outline-none focus-visible:ring-2",
                "focus-visible:ring-primary",
              ].join(" ")}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

export default Modal;
