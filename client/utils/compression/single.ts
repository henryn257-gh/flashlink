import type { Deck } from "../../../shared/deck";
import type {
  CompressionResult,
  CompressionStrategy,
} from "./types";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

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

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function compress(
  data: Uint8Array
): Promise<Uint8Array> {
  if (!("CompressionStream" in window)) {
    throw new Error(
      "This browser does not support compression."
    );
  }

  const stream = new Blob([data]).stream().pipeThrough(
    new CompressionStream("gzip")
  );

  const buffer = await new Response(stream).arrayBuffer();

  return new Uint8Array(buffer);
}

async function decompress(
  data: Uint8Array
): Promise<Uint8Array> {
  if (!("DecompressionStream" in window)) {
    throw new Error(
      "This browser does not support decompression."
    );
  }

  const stream = new Blob([data]).stream().pipeThrough(
    new DecompressionStream("gzip")
  );

  const buffer = await new Response(stream).arrayBuffer();

  return new Uint8Array(buffer);
}

function serializeDeck(deck: Deck): Uint8Array {
  const json = JSON.stringify(deck);

  return textEncoder.encode(json);
}

function deserializeDeck(data: Uint8Array): Deck {
  const json = textDecoder.decode(data);

  return JSON.parse(json) as Deck;
}

export const singleCompression: CompressionStrategy = {
  name: "single",

  async encode(deck): Promise<CompressionResult> {
    const jsonBytes = serializeDeck(deck);
    const compressed = await compress(jsonBytes);

    return {
      strategy: "single",
      data: bytesToBase64Url(compressed),
    };
  },

  async decode(data): Promise<Deck> {
    const compressed = base64UrlToBytes(data);
    const jsonBytes = await decompress(compressed);

    return deserializeDeck(jsonBytes);
  },
};import type { Deck } from "../../../shared/deck";
import type {
  CompressionResult,
  CompressionStrategy,
} from "./types";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

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

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function compress(
  data: Uint8Array
): Promise<Uint8Array> {
  if (!("CompressionStream" in window)) {
    throw new Error(
      "This browser does not support compression."
    );
  }

  const stream = new Blob([data]).stream().pipeThrough(
    new CompressionStream("gzip")
  );

  const buffer = await new Response(stream).arrayBuffer();

  return new Uint8Array(buffer);
}

async function decompress(
  data: Uint8Array
): Promise<Uint8Array> {
  if (!("DecompressionStream" in window)) {
    throw new Error(
      "This browser does not support decompression."
    );
  }

  const stream = new Blob([data]).stream().pipeThrough(
    new DecompressionStream("gzip")
  );

  const buffer = await new Response(stream).arrayBuffer();

  return new Uint8Array(buffer);
}

function serializeDeck(deck: Deck): Uint8Array {
  const json = JSON.stringify(deck);

  return textEncoder.encode(json);
}

function deserializeDeck(data: Uint8Array): Deck {
  const json = textDecoder.decode(data);

  return JSON.parse(json) as Deck;
}

export const singleCompression: CompressionStrategy = {
  name: "single",

  async encode(deck): Promise<CompressionResult> {
    const jsonBytes = serializeDeck(deck);
    const compressed = await compress(jsonBytes);

    return {
      strategy: "single",
      data: bytesToBase64Url(compressed),
    };
  },

  async decode(data): Promise<Deck> {
    const compressed = base64UrlToBytes(data);
    const jsonBytes = await decompress(compressed);

    return deserializeDeck(jsonBytes);
  },
};
