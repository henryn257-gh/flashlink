import type {
  Card,
  Deck,
} from "./deck.js";

export function isValidCard(
  value: unknown
): value is Card {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const card =
    value as Record<string, unknown>;

  return (
    typeof card.term === "string" &&
    typeof card.definition === "string"
  );
}

export function isValidDeck(
  value: unknown
): value is Deck {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const deck =
    value as Record<string, unknown>;

  if (
    typeof deck.version !== "number" ||
    typeof deck.title !== "string" ||
    typeof deck.description !== "string" ||
    !Array.isArray(deck.cards)
  ) {
    return false;
  }

  return deck.cards.every(isValidCard);
}
