import type { Deck } from "../../../shared/deck";
import type {
  CompressionResult,
  CompressionStrategy,
} from "./types";
import { singleCompression } from "./single";

export const MAX_RECOMMENDED_URL_LENGTH = 8_000;

const strategies: Record<
  string,
  CompressionStrategy
> = {
  single: singleCompression,
};

function getStudyUrl(
  result: CompressionResult
): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "";

  return `${origin}/study/${result.strategy}/${result.data}`;
}

export async function encodeDeck(
  deck: Deck
): Promise<CompressionResult> {
  const single = await singleCompression.encode(deck);

  const singleUrl = getStudyUrl(single);

  if (
    singleUrl.length <=
    MAX_RECOMMENDED_URL_LENGTH
  ) {
    return single;
  }

  /*
   * Chain compression will be added here.
   *
   * The important architectural decision is that callers
   * never need to know whether a deck is using single or
   * chained compression.
   *
   * When chainCompression is implemented:
   *
   * return chainCompression.encode(deck);
   */

  return single;
}

export async function decodeDeck(
  strategy: string,
  data: string
): Promise<Deck> {
  const compressionStrategy = strategies[strategy];

  if (!compressionStrategy) {
    throw new Error(
      `Unsupported compression strategy: ${strategy}`
    );
  }

  return compressionStrategy.decode(data);
}
