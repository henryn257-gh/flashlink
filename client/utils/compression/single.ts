import type { Deck } from "../../../shared/deck";

import type {
  CompressionResult,
  CompressionStrategy,
} from "./types";

import { assertCompressionSupport } from "./setup";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function uint8ArrayToArrayBuffer(
  bytes: Uint8Array
): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);

  new Uint8Array(buffer).set(bytes);

  return buffer;
}

function bytesToBase64Url(
  bytes: Uint8Array
): string {
  let binary = "";

  const chunkSize = 0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {
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

function base64UrlToBytes(
  value: string
): Uint8Array {
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
  data: Uint8Array
): Promise<Uint8Array> {
  const input = uint8ArrayToArrayBuffer(data);

  const stream = new Blob([input])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));

  const buffer =
    await new Response(stream).arrayBuffer();

  return new Uint8Array(buffer);
}

async function decompress(
  data: Uint8Array
): Promise<Uint8Array> {
  const input = uint8ArrayToArrayBuffer(data);

  const stream = new Blob([input])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));

  const buffer =
    await new Response(stream).arrayBuffer();

  return new Uint8Array(buffer);
}

function serializeDeck(
  deck: Deck
): Uint8Array {
  return textEncoder.encode(
    JSON.stringify(deck)
  );
}

function deserializeDeck(
  data: Uint8Array
): Deck {
  return JSON.parse(
    textDecoder.decode(data)
  ) as Deck;
}

export const singleCompression: CompressionStrategy =
  {
    name: "single",

    async encode(
      deck
    ): Promise<CompressionResult> {
      assertCompressionSupport();

      const jsonBytes =
        serializeDeck(deck);

      const compressed =
        await compress(jsonBytes);

      return {
        strategy: "single",
        data: bytesToBase64Url(
          compressed
        ),
      };
    },

    async decode(
      data
    ): Promise<Deck> {
      assertCompressionSupport();

      const compressed =
        base64UrlToBytes(data);

      const jsonBytes =
        await decompress(compressed);

      return deserializeDeck(jsonBytes);
    },
  };
