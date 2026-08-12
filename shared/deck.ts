/**
 * FlashLink
 * Shared deck model.
 * Imported by both the client and server.
 */

export const DECK_VERSION = 1 as const;

export interface Card {
  term: string;
  definition: string;
}

export interface Deck {
  version: typeof DECK_VERSION;
  title: string;
  description: string;
  cards: Card[];
}

/**
 * Creates an empty deck.
 */
export function createEmptyDeck(): Deck {
  return {
    version: DECK_VERSION,
    title: "",
    description: "",
    cards: [],
  };
}

/**
 * Creates a blank card.
 */
export function createEmptyCard(): Card {
  return {
    term: "",
    definition: "",
  };
}
