import type { CompressionResult } from "./compression/types";

export interface StudyRoute {
  strategy: string;
  data: string;
}

const STUDY_PREFIX = "/study";

export function createStudyPath(
  result: CompressionResult
): string {
  return `${STUDY_PREFIX}/${encodeURIComponent(
    result.strategy
  )}/${encodeURIComponent(result.data)}`;
}

export function createStudyUrl(
  result: CompressionResult
): string {
  if (typeof window === "undefined") {
    return createStudyPath(result);
  }

  return new URL(
    createStudyPath(result),
    window.location.origin
  ).toString();
}

export function parseStudyPath(
  pathname: string
): StudyRoute | null {
  const parts = pathname
    .split("/")
    .filter(Boolean);

  if (parts.length !== 3) {
    return null;
  }

  const [prefix, encodedStrategy, encodedData] =
    parts;

  if (prefix !== "study") {
    return null;
  }

  try {
    const strategy = decodeURIComponent(
      encodedStrategy
    );

    const data = decodeURIComponent(encodedData);

    if (!strategy || !data) {
      return null;
    }

    return {
      strategy,
      data,
    };
  } catch {
    return null;
  }
}

export function isStudyPath(
  pathname: string
): boolean {
  return parseStudyPath(pathname) !== null;
}
