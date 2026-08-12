export interface CompressionCapabilities {
  compressionStream: boolean;
  decompressionStream: boolean;
  supported: boolean;
}

export function getCompressionCapabilities(): CompressionCapabilities {
  const compressionStream =
    typeof window !== "undefined" &&
    "CompressionStream" in window;

  const decompressionStream =
    typeof window !== "undefined" &&
    "DecompressionStream" in window;

  return {
    compressionStream,
    decompressionStream,
    supported:
      compressionStream &&
      decompressionStream,
  };
}

export function assertCompressionSupport(): void {
  const capabilities =
    getCompressionCapabilities();

  if (!capabilities.supported) {
    throw new Error(
      "FlashLink compression is not supported by this browser."
    );
  }
}
