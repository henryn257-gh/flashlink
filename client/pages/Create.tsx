import { useMemo, useState } from "react";

import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Navbar from "../components/common/Navbar";
import type { Card as DeckCard, Deck } from "../../shared/deck";

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
  };

  const addCard = () => {
    setCards((currentCards) => [
      ...currentCards,
      createCard(),
    ]);
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
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Create Set
          </h1>

          <p className="mt-2 text-muted-foreground">
            Build your flashcards and share them with one
            link.
          </p>
        </div>

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
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
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
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
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
                  <div className="mb-4 flex items-center justify-between">
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

            <div className="flex flex-wrap gap-3 border-t border-border pt-6">
              <Button
                onClick={() => {
                  console.log("Deck ready:", deck);
                }}
              >
                Generate Link
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  console.log("Study deck:", deck);
                }}
              >
                Study Now
              </Button>
            </div>
          </section>

          <aside className="lg:sticky lg:top-6 lg:self-start">
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
              definition={cards[0]?.definition ?? ""}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Create;
