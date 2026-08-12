import type { Deck } from "../../../shared/deck";
import type {
  CompressionResult,
  CompressionStrategy,
} from "./types";

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
  if (!("CompressionStream" in window)) {
    throw new Error(
      "This browser does not support compression."
    );
  }

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
  if (!("DecompressionStream" in window)) {
    throw new Error(
      "This browser does not support decompression."
    );
  }

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
  const value = JSON.parse(
    decoder.decode(bytes)
  ) as unknown;

  if (
    typeof value !== "object" ||
    value === null ||
    !("version" in value) ||
    !("format" in value) ||
    !("payload" in value)
  ) {
    throw new Error(
      "Invalid chained compression data."
    );
  }

  const envelope = value as ChainEnvelope;

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

  return envelope;
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
 * Chained compression deliberately tries multiple
 * stateless representations and keeps the smaller one.
 *
 * It does NOT reference another user's URL or server
 * storage, so every generated link remains self-contained.
 */
export const chainCompression: CompressionStrategy = {
  name: "chain",

  async encode(deck): Promise<CompressionResult> {
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
