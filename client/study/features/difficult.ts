export interface DifficultEntry {
  originalIndex: number;
}

export function toggleDifficult(
  difficultCards: ReadonlySet<number>,
  originalIndex: number
): Set<number> {
  const next = new Set(difficultCards);

  if (next.has(originalIndex)) {
    next.delete(originalIndex);
  } else {
    next.add(originalIndex);
  }

  return next;
}

export function isDifficult(
  difficultCards: ReadonlySet<number>,
  originalIndex: number
): boolean {
  return difficultCards.has(originalIndex);
}

export function filterDifficult<T extends DifficultEntry>(
  entries: readonly T[],
  difficultCards: ReadonlySet<number>
): T[] {
  return entries.filter((entry) =>
    difficultCards.has(entry.originalIndex)
  );
}
