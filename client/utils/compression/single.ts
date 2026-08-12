import type { Deck } from "../../../shared/deck";
import { validateDeck } from "../../../shared/validation";
import type { CompressionStrategy } from "./types";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";

  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function compress(data: Uint8Array): Promise<Uint8Array> {
  if (!("CompressionStream" in globalThis)) {
    throw new Error(
      "This browser does not support compressed FlashLink URLs."
    );
  }

  const stream = new CompressionStream("gzip");

  const writer = stream.writable.getWriter();

  await writer.write(data);
  await writer.close();

  const buffer = await new Response(stream.readable).arrayBuffer();

  return new Uint8Array(buffer);
}

async function decompress(data: Uint8Array): Promise<Uint8Array> {
  if (!("DecompressionStream" in globalThis)) {
    throw new Error(
      "This browser does not support compressed FlashLink URLs."
    );
  }

  const stream = new DecompressionStream("gzip");

  const writer = stream.writable.getWriter();

  await writer.write(data);
  await writer.close();

  const buffer = await new Response(stream.readable).arrayBuffer();

  return new Uint8Array(buffer);
}

export const singleCompression: CompressionStrategy = {
  id: "single",

  canEncode(): boolean {
    return true;
  },

  async encode(deck: Deck): Promise<string> {
    const json = JSON.stringify(deck);
    const input = textEncoder.encode(json);

    const compressed = await compress(input);

    return bytesToBase64Url(compressed);
  },

  async decode(data: string): Promise<Deck> {
    const compressed = base64UrlToBytes(data);
    const decompressed = await decompress(compressed);

    const json = textDecoder.decode(decompressed);
    const parsed: unknown = JSON.parse(json);

    return validateDeck(parsed);
  },
};
