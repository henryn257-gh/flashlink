import { DECK_VERSION, Deck, Card } from "./deck";

function isCard(value: unknown): value is Card {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const card = value as Card;

  return (
    typeof card.term === "string" &&
    typeof card.definition === "string"
  );
}

export function isDeck(value: unknown): value is Deck {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const deck = value as Deck;

  return (
    deck.version === DECK_VERSION &&
    typeof deck.title === "string" &&
    typeof deck.description === "string" &&
    Array.isArray(deck.cards) &&
    deck.cards.every(isCard)
  );
}

export function validateDeck(value: unknown): Deck {
  if (!isDeck(value)) {
    throw new Error("Invalid FlashLink deck.");
  }

  return value;
}
