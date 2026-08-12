import type { Deck } from "../../../shared/deck";
import type {
  CompressionResult,
  CompressionStrategy,
} from "./types";
import { assertCompressionSupport } from "./setup";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";

  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(
      i,
      Math.min(i + chunkSize, bytes.length)
    );

    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padding =
    normalized.length % 4 === 0
      ? ""
      : "=".repeat(4 - (normalized.length % 4));

  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function compress(
  data: Uint8Array,
  format: CompressionFormat
): Promise<Uint8Array> {
  const stream = new Blob([data])
    .stream()
    .pipeThrough(new CompressionStream(format));

  const buffer = await new Response(stream).arrayBuffer();

  return new Uint8Array(buffer);
}

async function decompress(
  data: Uint8Array,
  format: CompressionFormat
): Promise<Uint8Array> {
  const stream = new Blob([data])
    .stream()
    .pipeThrough(new DecompressionStream(format));

  const buffer = await new Response(stream).arrayBuffer();

  return new Uint8Array(buffer);
}

interface ChainEnvelope {
  version: 1;
  format: CompressionFormat;
  payload: string;
}

function serializeEnvelope(
  envelope: ChainEnvelope
): Uint8Array {
  return encoder.encode(JSON.stringify(envelope));
}

function deserializeEnvelope(
  bytes: Uint8Array
): ChainEnvelope {
  const value: unknown = JSON.parse(
    decoder.decode(bytes)
  );

  if (
    typeof value !== "object" ||
    value === null
  ) {
    throw new Error(
      "Invalid chained compression data."
    );
  }

  const envelope = value as Record<string, unknown>;

  if (
    envelope.version !== 1 ||
    (envelope.format !== "gzip" &&
      envelope.format !== "deflate") ||
    typeof envelope.payload !== "string"
  ) {
    throw new Error(
      "Invalid chained compression data."
    );
  }

  return {
    version: 1,
    format: envelope.format,
    payload: envelope.payload,
  };
}

function serializeDeck(deck: Deck): Uint8Array {
  return encoder.encode(JSON.stringify(deck));
}

function deserializeDeck(
  bytes: Uint8Array
): Deck {
  return JSON.parse(
    decoder.decode(bytes)
  ) as Deck;
}

/**
 * Chained compression is self-contained.
 *
 * It does not depend on a database, server storage,
 * or another URL being available.
 *
 * The strategy can later be extended with additional
 * stateless compression stages without changing the
 * application-facing CompressionStrategy interface.
 */
export const chainCompression: CompressionStrategy = {
  name: "chain",

  async encode(deck): Promise<CompressionResult> {
    assertCompressionSupport();

    const original = serializeDeck(deck);

    const candidates = await Promise.all([
      createCandidate(original, "gzip"),
      createCandidate(original, "deflate"),
    ]);

    const best = candidates.reduce(
      (smallest, candidate) =>
        candidate.data.length < smallest.data.length
          ? candidate
          : smallest
    );

    return {
      strategy: "chain",
      data: best.data,
    };
  },

  async decode(data): Promise<Deck> {
    assertCompressionSupport();

    const bytes = base64UrlToBytes(data);
    const envelope = deserializeEnvelope(bytes);

    const compressed = base64UrlToBytes(
      envelope.payload
    );

    const decompressed = await decompress(
      compressed,
      envelope.format
    );

    return deserializeDeck(decompressed);
  },
};

async function createCandidate(
  original: Uint8Array,
  format: CompressionFormat
): Promise<{
  data: string;
  format: CompressionFormat;
}> {
  const compressed = await compress(
    original,
    format
  );

  const envelope: ChainEnvelope = {
    version: 1,
    format,
    payload: bytesToBase64Url(compressed),
  };

  const encodedEnvelope = bytesToBase64Url(
    serializeEnvelope(envelope)
  );

  return {
    data: encodedEnvelope,
    format,
  };
}
