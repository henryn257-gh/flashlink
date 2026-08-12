import type { Deck } from "../../../shared/deck.js";

export type CompressionStrategyName =
  | "single"
  | "chain";

export interface CompressionResult {
  strategy: CompressionStrategyName;
  data: string;
}

export interface CompressionStrategy {
  name: CompressionStrategyName;

  encode(
    deck: Deck
  ): Promise<CompressionResult>;

  decode(
    data: string
  ): Promise<Deck>;
}
