import type { Deck } from "../../../shared/deck";

export interface CompressionStrategy {
  /**
   * Unique strategy identifier.
   * Example:
   * "single"
   * "chain"
   */
  readonly id: string;

  /**
   * Returns true if this strategy can encode the deck.
   */
  canEncode(deck: Deck): boolean;

  /**
   * Encodes the deck into a URL-safe string.
   */
  encode(deck: Deck): Promise<string>;

  /**
   * Decodes a URL-safe string back into a deck.
   */
  decode(data: string): Promise<Deck>;
}
