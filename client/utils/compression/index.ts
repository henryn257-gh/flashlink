import type { Deck } from "../../../shared/deck";

import type {
  CompressionResult,
  CompressionStrategy,
} from "./types";

import { chainCompression } from "./chain";
import { singleCompression } from "./single";

export const MAX_RECOMMENDED_URL_LENGTH = 8_000;

const strategies: Record<
  string,
  CompressionStrategy
> = {
  single: singleCompression,
  chain: chainCompression,
};

function getUrlLength(
  result: CompressionResult
): number {
  return `/study/${result.strategy}/${result.data}`
    .length;
}

function getUrl(
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
  /*
   * Every strategy gets the same Deck.
   *
   * This keeps the strategies independent and lets the
   * manager decide which representation is best.
   */
  const candidates = await Promise.all([
    singleCompression.encode(deck),
    chainCompression.encode(deck),
  ]);

  const best = candidates.reduce(
    (smallest, candidate) => {
      return getUrlLength(candidate) <
        getUrlLength(smallest)
        ? candidate
        : smallest;
    }
  );

  return best;
}

export async function decodeDeck(
  strategy: string,
  data: string
): Promise<Deck> {
  const compressionStrategy =
    strategies[strategy];

  if (!compressionStrategy) {
    throw new Error(
      `Unsupported compression strategy: ${strategy}`
    );
  }

  return compressionStrategy.decode(data);
}

export function getCompressionInfo(
  result: CompressionResult
) {
  const url = getUrl(result);

  return {
    strategy: result.strategy,
    url,
    length: url.length,
    exceedsRecommendedLength:
      url.length >
      MAX_RECOMMENDED_URL_LENGTH,
  };
}
