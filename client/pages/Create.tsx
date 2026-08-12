import { useMemo, useState } from "react";

import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Navbar from "../components/common/Navbar";

import type {
  Card as DeckCard,
  Deck,
} from "../../shared/deck";

import {
  encodeDeck,
  getCompressionInfo,
  MAX_RECOMMENDED_URL_LENGTH,
} from "../utils/compression";

import { createStudyUrl } from "../utils/url";

function createCard(): DeckCard {
  return {
    term: "",
    definition: "",
  };
}

function Create() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [cards, setCards] = useState<DeckCard[]>([
    createCard(),
  ]);

  const [shareUrl, setShareUrl] = useState<string | null>(
    null
  );

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [generationError, setGenerationError] =
    useState<string | null>(null);

  const [urlLength, setUrlLength] = useState<
    number | null
  >(null);

  const [copied, setCopied] = useState(false);

  const deck = useMemo<Deck>(
    () => ({
      version: 1,
      title,
      description,
      cards,
    }),
    [title, description, cards]
  );

  const updateCard = (
    index: number,
    field: keyof DeckCard,
    value: string
  ) => {
    setCards((currentCards) =>
      currentCards.map((card, cardIndex) =>
        cardIndex === index
          ? {
              ...card,
              [field]: value,
            }
          : card
      )
    );

    setShareUrl(null);
    setCopied(false);
  };

  const addCard = () => {
    setCards((currentCards) => [
      ...currentCards,
      createCard(),
    ]);

    setShareUrl(null);
    setCopied(false);
  };

  const deleteCard = (index: number) => {
    setCards((currentCards) => {
      if (currentCards.length === 1) {
        return currentCards;
      }

      return currentCards.filter(
        (_, cardIndex) => cardIndex !== index
      );
    });

    setShareUrl(null);
    setCopied(false);
  };

  const duplicateCard = (index: number) => {
    setCards((currentCards) => {
      const card = currentCards[index];

      if (!card) {
        return currentCards;
      }

      return [
        ...currentCards.slice(0, index + 1),
        { ...card },
        ...currentCards.slice(index + 1),
      ];
    });

    setShareUrl(null);
    setCopied(false);
  };

  const moveCard = (
    index: number,
    direction: -1 | 1
  ) => {
    const targetIndex = index + direction;

    setCards((currentCards) => {
      if (
        targetIndex < 0 ||
        targetIndex >= currentCards.length
      ) {
        return currentCards;
      }

      const nextCards = [...currentCards];

      [
        nextCards[index],
        nextCards[targetIndex],
      ] = [
        nextCards[targetIndex],
        nextCards[index],
      ];

      return nextCards;
    });

    setShareUrl(null);
    setCopied(false);
  };

  const generateLink = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setCopied(false);

    try {
      const result = await encodeDeck(deck);

      const url = createStudyUrl(result);
      const info = getCompressionInfo(result);

      setShareUrl(url);
      setUrlLength(info.length);
    } catch (error) {
      console.error(error);

      setGenerationError(
        error instanceof Error
          ? error.message
          : "Unable to generate the share link."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = async () => {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
      setGenerationError(
        "Unable to copy the link."
      );
    }
  };

  const studyNow = () => {
    if (!shareUrl) {
      return;
    }

    window.location.href = shareUrl;
  };

  const hasLongUrl =
    urlLength !== null &&
    urlLength > MAX_RECOMMENDED_URL_LENGTH;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Create Set
          </h1>

          <p className="mt-2 text-muted-foreground">
            Build your flashcards and share them with
            one link.
          </p>
        </div>

        {generationError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400"
          >
            {generationError}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="deck-title"
                    className="mb-2 block text-sm font-medium"
                  >
                    Title
                  </label>

                  <input
                    id="deck-title"
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      setShareUrl(null);
                      setCopied(false);
                    }}
                    placeholder="Biology Chapter 1"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="deck-description"
                    className="mb-2 block text-sm font-medium"
                  >
                    Description
                  </label>

                  <textarea
                    id="deck-description"
                    value={description}
                    onChange={(event) => {
                      setDescription(
                        event.target.value
                      );
                      setShareUrl(null);
                      setCopied(false);
                    }}
                    placeholder="A quick review set for..."
                    rows={3}
                    className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold">
                      Card {index + 1}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        onClick={() =>
                          moveCard(index, -1)
                        }
                        disabled={index === 0}
                      >
                        ↑
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() =>
                          moveCard(index, 1)
                        }
                        disabled={
                          index === cards.length - 1
                        }
                      >
                        ↓
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() =>
                          duplicateCard(index)
                        }
                      >
                        Duplicate
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() =>
                          deleteCard(index)
                        }
                        disabled={cards.length === 1}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`term-${index}`}
                        className="mb-2 block text-sm font-medium"
                      >
                        Term
                      </label>

                      <textarea
                        id={`term-${index}`}
                        value={card.term}
                        onChange={(event) =>
                          updateCard(
                            index,
                            "term",
                            event.target.value
                          )
                        }
                        placeholder="Term"
                        rows={4}
                        className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`definition-${index}`}
                        className="mb-2 block text-sm font-medium"
                      >
                        Definition
                      </label>

                      <textarea
                        id={`definition-${index}`}
                        value={card.definition}
                        onChange={(event) =>
                          updateCard(
                            index,
                            "definition",
                            event.target.value
                          )
                        }
                        placeholder="Definition"
                        rows={4}
                        className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="secondary"
              onClick={addCard}
              className="w-full"
            >
              + Add Card
            </Button>

            <div className="border-t border-border pt-6">
              <Button
                onClick={generateLink}
                disabled={isGenerating}
                className="w-full sm:w-auto"
              >
                {isGenerating
                  ? "Generating Link..."
                  : "Generate Link"}
              </Button>
            </div>
          </section>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div>
              <div className="mb-3">
                <h2 className="text-lg font-semibold">
                  Preview
                </h2>

                <p className="text-sm text-muted-foreground">
                  Preview updates as you edit.
                </p>
              </div>

              <Card
                term={cards[0]?.term ?? ""}
                definition={
                  cards[0]?.definition ?? ""
                }
              />
            </div>

            {shareUrl && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h2 className="text-lg font-semibold">
                  Your Share Link
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Anyone with this link can open the
                  deck without an account.
                </p>

                <div className="mt-4">
                  <input
                    readOnly
                    value={shareUrl}
                    onFocus={(event) =>
                      event.currentTarget.select()
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none"
                  />
                </div>

                {hasLongUrl && (
                  <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                    <p className="text-sm font-medium">
                      This set creates a long URL.
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      FlashLink automatically used its
                      best available compression, but
                      some apps and services may have
                      trouble with very long links.
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      URL length: {urlLength} characters
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={copyLink}>
                    {copied
                      ? "Copied!"
                      : "Copy Link"}
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={studyNow}
                  >
                    Study Now
                  </Button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Create;
