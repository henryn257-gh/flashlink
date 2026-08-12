interface StudyCompleteProps {
  title?: string;
  totalCards: number;
  onRestart: () => void;
  onEdit?: () => void;
}

function StudyComplete({
  title = "Study Complete!",
  totalCards,
  onRestart,
  onEdit,
}: StudyCompleteProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
        ✓
      </div>

      <h2 className="mt-5 text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-2 text-muted-foreground">
        You reached the end of this set.
      </p>

      <p className="mt-1 text-sm text-muted-foreground">
        {totalCards}{" "}
        {totalCards === 1
          ? "card"
          : "cards"}{" "}
        studied
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Study Again
        </button>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
          >
            Edit Set
          </button>
        )}
      </div>
    </div>
  );
}

export default StudyComplete;
