import type { Deck } from "../../shared/deck";
import { Compression } from "./compression";

const STUDY_ROUTE = "/study";

export interface EncodedDeck {
  strategy: string;
  data: string;
}

export function createStudyPath(encoded: EncodedDeck): string {
  return `${STUDY_ROUTE}/${encoded.strategy}/${encoded.data}`;
}

export function createStudyUrl(
  deck: Deck,
  origin = window.location.origin
): Promise<string> {
  return Compression.encode(deck).then((encoded) => {
    const path = createStudyPath(encoded);

    return new URL(path, origin).toString();
  });
}

export function parseStudyPath(pathname: string): EncodedDeck {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length !== 3 || parts[0] !== "study") {
    throw new Error("Invalid FlashLink study URL.");
  }

  const [, strategy, data] = parts;

  if (!strategy || !data) {
    throw new Error("Invalid FlashLink study URL.");
  }

  return {
    strategy,
    data,
  };
}

export async function decodeStudyPath(
  pathname: string
): Promise<Deck> {
  const encoded = parseStudyPath(pathname);

  return Compression.decode(
    encoded.strategy,
    encoded.data
  );
}
