import type {
  CompressionStrategyName,
} from "../utils/compression/types";

function isCompressionStrategy(
  value: string
): value is CompressionStrategyName {
  return (
    value === "single" ||
    value === "chain"
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "../components/common/Card";
import Navbar from "../components/common/Navbar";

import type { Deck } from "../../shared/deck";

import { decodeDeck } from "../utils/compression";
import { createStudyPath } from "../utils/url";

type StudyStatus =
  | "loading"
  | "ready"
  | "error";

function Study() {
  const { strategy, data } = useParams<{
    strategy: string;
    data: string;
  }>();

  const navigate = useNavigate();

  const [deck, setDeck] = useState<Deck | null>(
    null
  );

  const [status, setStatus] =
    useState<StudyStatus>("loading");

  const [error, setError] = useState<string | null>(
    null
  );

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

      setStatus("loading");
      setError(null);
      setDeck(null);

      try {
        const decodedDeck = await decodeDeck(
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
    !deck ||
    !strategy ||
    !data ||
    !isCompressionStrategy(strategy)
  ) {
    return;
  }

  navigate(
    createStudyPath({
      strategy,
      data,
    })
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
                onClick={() => navigate("/create")}
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

  const firstCard = deck.cards[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {deck.title || "Untitled Set"}
              </h1>

              {deck.description && (
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  {deck.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleEdit}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Edit Set
            </button>
          </div>
        </header>

        {deck.cards.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              This set has no cards
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Edit the set to add some flashcards.
            </p>
          </div>
        ) : (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {deck.cards.length}{" "}
                {deck.cards.length === 1
                  ? "card"
                  : "cards"}
              </p>

              <p className="text-sm text-muted-foreground">
                Card 1 of {deck.cards.length}
              </p>
            </div>

            {firstCard && (
              <Card
                term={firstCard.term}
                definition={firstCard.definition}
              />
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default Study;
