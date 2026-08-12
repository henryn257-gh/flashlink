import {
  useCallback,
  useMemo,
  useState,
} from "react";

import type { Card } from "../../shared/deck";

interface UseStudyOptions {
  shuffle?: boolean;
  difficultOnly?: boolean;
}

interface StudyEntry {
  card: Card;
  originalIndex: number;
}

interface UseStudyReturn {
  cards: Card[];
  currentCard: Card | null;
  currentIndex: number;
  totalCards: number;
  progress: number;

  isFirstCard: boolean;
  isLastCard: boolean;
  isCurrentCardDifficult: boolean;

  difficultCards: Set<number>;
  difficultOnly: boolean;

  next: () => void;
  previous: () => void;
  restart: () => void;
  shuffle: () => void;
  toggleDifficult: () => void;

  setDifficultOnly: (enabled: boolean) => void;
}

function shuffleCards<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [result[i], result[j]] = [
      result[j],
      result[i],
    ];
  }

  return result;
}

export function useStudy(
  sourceCards: Card[],
  options: UseStudyOptions = {}
): UseStudyReturn {
  const {
    shuffle: shuffleInitially = false,
    difficultOnly: difficultOnlyInitially = false,
  } = options;

  /*
   * Each card keeps its original deck index.
   *
   * This is important because difficult-card state
   * should survive shuffling.
   */
  const initialEntries = useMemo<StudyEntry[]>(
    () =>
      sourceCards.map((card, originalIndex) => ({
        card,
        originalIndex,
      })),
    [sourceCards]
  );

  const [studyEntries, setStudyEntries] =
    useState<StudyEntry[]>(() =>
      shuffleInitially
        ? shuffleCards(initialEntries)
        : [...initialEntries]
    );

  const [currentIndex, setCurrentIndex] =
    useState(0);

  /*
   * Stores original deck indexes, not visible indexes.
   *
   * Example:
   *
   * Deck:
   * 0 = Biology
   * 1 = Chemistry
   * 2 = Physics
   *
   * If shuffled to:
   * Physics, Biology, Chemistry
   *
   * Physics is still identified as originalIndex 2.
   */
  const [difficultCards, setDifficultCards] =
    useState<Set<number>>(
      () => new Set<number>()
    );

  const [difficultOnly, setDifficultOnlyState] =
    useState(difficultOnlyInitially);

  /*
   * Filter the current study order while preserving
   * each card's original identity.
   */
  const visibleEntries = useMemo(() => {
    if (!difficultOnly) {
      return studyEntries;
    }

    return studyEntries.filter((entry) =>
      difficultCards.has(entry.originalIndex)
    );
  }, [
    studyEntries,
    difficultOnly,
    difficultCards,
  ]);

  /*
   * Keep the index safe if the visible card list
   * becomes smaller after filtering.
   */
  const safeIndex = Math.min(
    currentIndex,
    Math.max(visibleEntries.length - 1, 0)
  );

  const currentEntry =
    visibleEntries[safeIndex] ?? null;

  const currentCard =
    currentEntry?.card ?? null;

  const totalCards = visibleEntries.length;

  const progress =
    totalCards === 0
      ? 0
      : ((safeIndex + 1) / totalCards) * 100;

  const isFirstCard =
    totalCards === 0 || safeIndex === 0;

  const isLastCard =
    totalCards === 0 ||
    safeIndex === totalCards - 1;

  const isCurrentCardDifficult =
    currentEntry !== null
      ? difficultCards.has(
          currentEntry.originalIndex
        )
      : false;

  const next = useCallback(() => {
    setCurrentIndex((index) => {
      const lastIndex =
        visibleEntries.length - 1;

      if (lastIndex <= 0) {
        return 0;
      }

      return Math.min(index + 1, lastIndex);
    });
  }, [visibleEntries.length]);

  const previous = useCallback(() => {
    setCurrentIndex((index) =>
      Math.max(index - 1, 0)
    );
  }, []);

  const restart = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  const shuffle = useCallback(() => {
    setStudyEntries((entries) =>
      shuffleCards(entries)
    );

    setCurrentIndex(0);
  }, []);

  const toggleDifficult = useCallback(() => {
    if (!currentEntry) {
      return;
    }

    const originalIndex =
      currentEntry.originalIndex;

    setDifficultCards((previous) => {
      const next = new Set(previous);

      if (next.has(originalIndex)) {
        next.delete(originalIndex);
      } else {
        next.add(originalIndex);
      }

      return next;
    });
  }, [currentEntry]);

  const setDifficultOnly = useCallback(
    (enabled: boolean) => {
      setDifficultOnlyState(enabled);

      /*
       * Always restart when changing the filter.
       * Otherwise the current index could point past
       * the new filtered list.
       */
      setCurrentIndex(0);
    },
    []
  );

  return {
    cards: visibleEntries.map(
      (entry) => entry.card
    ),

    currentCard,

    currentIndex: safeIndex,

    totalCards,

    progress,

    isFirstCard,

    isLastCard,

    isCurrentCardDifficult,

    difficultCards,

    difficultOnly,

    next,

    previous,

    restart,

    shuffle,

    toggleDifficult,

    setDifficultOnly,
  };
}
