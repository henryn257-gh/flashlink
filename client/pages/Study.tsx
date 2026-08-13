import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Card from "../components/common/Card";
import Navbar from "../components/common/Navbar";
import ProgressBar from "../components/common/ProgressBar";
import SettingsPanel from "../components/common/SettingsPanel";

import type { Deck } from "../../shared/deck.js";
import type { CompressionStrategyName } from "../utils/compression/types";

import { useStudy } from "../hooks/useStudy";
import { useSettings } from "../hooks/useSettings";

import { decodeDeck } from "../utils/compression";

type StudyStatus =
  | "loading"
  | "ready"
  | "error";

function isCompressionStrategy(
  value: string
): value is CompressionStrategyName {
  return (
    value === "single" ||
    value === "chain"
  );
}

function Study() {
  const { strategy, data } = useParams<{
    strategy: string;
    data: string;
  }>();

  const navigate = useNavigate();

  const [deck, setDeck] =
    useState<Deck | null>(null);

  const [status, setStatus] =
    useState<StudyStatus>("loading");

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDeck() {
      if (!strategy || !data) {
        if (!cancelled) {
          setStatus("error");
          setError(
            "This study link is missing deck data."
          );
        }

        return;
      }

      if (!isCompressionStrategy(strategy)) {
        if (!cancelled) {
          setStatus("error");
          setError(
            "This study link uses an unsupported compression strategy."
          );
        }

        return;
      }

      setStatus("loading");
      setError(null);
      setDeck(null);

      try {
        const decodedDeck =
          await decodeDeck(
            strategy,
            data
          );

        if (cancelled) {
          return;
        }

        setDeck(decodedDeck);
        setStatus("ready");
      } catch (loadError) {
        console.error(loadError);

        if (cancelled) {
          return;
        }

        setStatus("error");
        setError(
          "This study link is invalid, corrupted, or no longer supported."
        );
      }
    }

    void loadDeck();

    return () => {
      cancelled = true;
    };
  }, [strategy, data]);

  const handleEdit = () => {
    if (
      !strategy ||
      !data ||
      !isCompressionStrategy(strategy)
    ) {
      return;
    }

    // Preserve the exact encoded study data.
    const editPath =
      `/study/${strategy}/${data}`;

    navigate(
      `/create?edit=${encodeURIComponent(
        editPath
      )}`
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />

            <h1 className="text-xl font-semibold">
              Loading deck...
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Decoding your FlashLink locally.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (status === "error" || !deck) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold">
              Unable to open deck
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              {error ??
                "Something went wrong while loading this FlashLink."}
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Go Home
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/create")
                }
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Create Set
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <StudyReady
      deck={deck}
      onEdit={handleEdit}
    />
  );
}

interface StudyReadyProps {
  deck: Deck;
  onEdit: () => void;
}

function StudyReady({
  deck,
  onEdit,
}: StudyReadyProps) {
  const {
    currentCard,
    currentIndex,
    totalCards,
    progress,

    isFirstCard,
    isLastCard,
    isCurrentCardDifficult,

    next,
    previous,
    restart,
    shuffle,
    toggleDifficult,

    difficultOnly,
    setDifficultOnly,
  } = useStudy(deck.cards);

  const {
    settings,
    setShuffle,
    setTermsFirst,
    setAnimation,
    setTimer,
    setDifficultOnly:
      setDifficultOnlySetting,
    setDarkMode,
  } = useSettings();

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  /*
   * Keep the study-session Difficult Only state
   * synchronized with the persistent setting.
   */
  useEffect(() => {
    if (
      difficultOnly !==
      settings.difficultOnly
    ) {
      setDifficultOnly(
        settings.difficultOnly
      );
    }
  }, [
    difficultOnly,
    settings.difficultOnly,
    setDifficultOnly,
  ]);

  /*
   * Escape closes the settings dialog.
   */
  useEffect(() => {
    if (!settingsOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setSettingsOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [settingsOpen]);

  /*
   * Shuffle setting:
   *
   * Enabling it immediately shuffles the current
   * study session. Disabling it leaves the current
   * order intact; it simply disables the preference
   * for future study initialization.
   */
  const handleShuffleChange = (
    enabled: boolean
  ) => {
    setShuffle(enabled);

    if (enabled) {
      shuffle();
    }
  };

  /*
   * Difficult Only is both a persistent preference
   * and active study-session state.
   */
  const handleDifficultOnlyChange = (
    enabled: boolean
  ) => {
    setDifficultOnlySetting(enabled);
    setDifficultOnly(enabled);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  if (totalCards === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {deck.title ||
                  "Untitled Set"}
              </h1>

              {deck.description && (
                <p className="mt-2 text-muted-foreground">
                  {deck.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setSettingsOpen(true)
                }
                aria-label="Open study settings"
                aria-expanded={settingsOpen}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                ⚙ Settings
              </button>

              <button
                type="button"
                onClick={onEdit}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Edit Set
              </button>
            </div>
          </header>

          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              This set has no cards
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Edit the set to add some flashcards.
            </p>
          </div>
        </main>

        {settingsOpen && (
          <SettingsDialog
            settings={settings}
            onShuffleChange={
              handleShuffleChange
            }
            onTermsFirstChange={
              setTermsFirst
            }
            onAnimationChange={
              setAnimation
            }
            onTimerChange={setTimer}
            onDifficultOnlyChange={
              handleDifficultOnlyChange
            }
            onDarkModeChange={
              setDarkMode
            }
            onClose={
              handleCloseSettings
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {deck.title ||
                  "Untitled Set"}
              </h1>

              {deck.description && (
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  {deck.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setSettingsOpen(true)
                }
                aria-label="Open study settings"
                aria-expanded={settingsOpen}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                ⚙ Settings
              </button>

              <button
                type="button"
                onClick={onEdit}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Edit Set
              </button>
            </div>
          </div>
        </header>

        <section>
          <ProgressBar
            value={progress}
            label={`Card ${
              currentIndex + 1
            } of ${totalCards}`}
            className="mb-6"
          />

          {currentCard && (
            <Card
              term={currentCard.term}
              definition={
                currentCard.definition
              }
            />
          )}

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={previous}
              disabled={isFirstCard}
              className="rounded-lg border border-border px-5 py-3 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={next}
              disabled={isLastCard}
              className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={shuffle}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Shuffle
            </button>

            <button
              type="button"
              onClick={restart}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Restart
            </button>

            <button
              type="button"
              onClick={toggleDifficult}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                isCurrentCardDifficult
                  ? "border-yellow-500 bg-yellow-500/10 text-yellow-700"
                  : "border-border hover:bg-muted"
              }`}
            >
              {isCurrentCardDifficult
                ? "★ Difficult"
                : "☆ Mark Difficult"}
            </button>

            <button
              type="button"
              onClick={() =>
                handleDifficultOnlyChange(
                  !difficultOnly
                )
              }
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                difficultOnly
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              {difficultOnly
                ? "Showing Difficult"
                : "Difficult Only"}
            </button>
          </div>
        </section>
      </main>

      {settingsOpen && (
        <SettingsDialog
          settings={settings}
          onShuffleChange={
            handleShuffleChange
          }
          onTermsFirstChange={
            setTermsFirst
          }
          onAnimationChange={
            setAnimation
          }
          onTimerChange={setTimer}
          onDifficultOnlyChange={
            handleDifficultOnlyChange
          }
          onDarkModeChange={
            setDarkMode
          }
          onClose={handleCloseSettings}
        />
      )}
    </div>
  );
}

interface SettingsDialogProps {
  settings: {
    shuffle: boolean;
    termsFirst: boolean;
    animation: boolean;
    timer: boolean;
    difficultOnly: boolean;
    darkMode: boolean;
  };

  onShuffleChange: (
    enabled: boolean
  ) => void;

  onTermsFirstChange: (
    enabled: boolean
  ) => void;

  onAnimationChange: (
    enabled: boolean
  ) => void;

  onTimerChange: (
    enabled: boolean
  ) => void;

  onDifficultOnlyChange: (
    enabled: boolean
  ) => void;

  onDarkModeChange: (
    enabled: boolean
  ) => void;

  onClose: () => void;
}

function SettingsDialog({
  settings,
  onShuffleChange,
  onTermsFirstChange,
  onAnimationChange,
  onTimerChange,
  onDifficultOnlyChange,
  onDarkModeChange,
  onClose,
}: SettingsDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="study-settings-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2
              id="study-settings-title"
              className="text-lg font-semibold"
            >
              Advanced Settings
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Customize how you study this deck.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close study settings"
            className="rounded-lg px-3 py-2 text-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          <SettingsPanel
            shuffle={settings.shuffle}
            termsFirst={settings.termsFirst}
            animation={settings.animation}
            timer={settings.timer}
            difficultOnly={
              settings.difficultOnly
            }
            darkMode={settings.darkMode}
            onShuffleChange={
              onShuffleChange
            }
            onTermsFirstChange={
              onTermsFirstChange
            }
            onAnimationChange={
              onAnimationChange
            }
            onTimerChange={
              onTimerChange
            }
            onDifficultOnlyChange={
              onDifficultOnlyChange
            }
            onDarkModeChange={
              onDarkModeChange
            }
          />

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Study;
