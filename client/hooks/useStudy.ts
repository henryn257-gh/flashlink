import { useCallback, useMemo, useState } from "react";

import type { Card } from "../../shared/deck";

interface UseStudyOptions {
  shuffle?: boolean;
  difficultOnly?: boolean;
}

interface UseStudyReturn {
  cards: Card[];
  currentCard: Card | null;
  currentIndex: number;
  totalCards: number;
  progress: number;
  isFirstCard: boolean;
  isLastCard: boolean;
  difficultCards: Set<number>;

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

  const [studyCards, setStudyCards] = useState<Card[]>(
    () =>
      shuffleInitially
        ? shuffleCards(sourceCards)
        : [...sourceCards]
  );

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [difficultCards, setDifficultCards] =
    useState<Set<number>>(
      () => new Set<number>()
    );

  const [difficultOnly, setDifficultOnlyState] =
    useState(difficultOnlyInitially);

  const visibleCards = useMemo(() => {
    if (!difficultOnly) {
      return studyCards;
    }

    return studyCards.filter((_, index) =>
      difficultCards.has(index)
    );
  }, [
    studyCards,
    difficultOnly,
    difficultCards,
  ]);

  const safeIndex = Math.min(
    currentIndex,
    Math.max(visibleCards.length - 1, 0)
  );

  const currentCard =
    visibleCards[safeIndex] ?? null;

  const totalCards = visibleCards.length;

  const progress =
    totalCards === 0
      ? 0
      : ((safeIndex + 1) / totalCards) * 100;

  const isFirstCard =
    totalCards === 0 || safeIndex === 0;

  const isLastCard =
    totalCards === 0 ||
    safeIndex === totalCards - 1;

  const next = useCallback(() => {
    setCurrentIndex((index) => {
      const lastIndex =
        visibleCards.length - 1;

      if (lastIndex <= 0) {
        return 0;
      }

      return Math.min(index + 1, lastIndex);
    });
  }, [visibleCards.length]);

  const previous = useCallback(() => {
    setCurrentIndex((index) =>
      Math.max(index - 1, 0)
    );
  }, []);

  const restart = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  const shuffle = useCallback(() => {
    setStudyCards((cards) =>
      shuffleCards(cards)
    );

    setCurrentIndex(0);
  }, []);

  const toggleDifficult = useCallback(() => {
    if (currentCard === null) {
      return;
    }

    /*
     * The difficult state is intentionally kept
     * outside the Card model.
     *
     * Decks remain:
     *
     * {
     *   term,
     *   definition
     * }
     *
     * Difficult status is a study-session preference,
     * not permanent deck content.
     */
    const currentCardIndex =
      studyCards.indexOf(currentCard);

    if (currentCardIndex === -1) {
      return;
    }

    setDifficultCards((previous) => {
      const next = new Set(previous);

      if (next.has(currentCardIndex)) {
        next.delete(currentCardIndex);
      } else {
        next.add(currentCardIndex);
      }

      return next;
    });
  }, [currentCard, studyCards]);

  const setDifficultOnly = useCallback(
    (enabled: boolean) => {
      setDifficultOnlyState(enabled);
      setCurrentIndex(0);
    },
    []
  );

  return {
    cards: visibleCards,
    currentCard,
    currentIndex: safeIndex,
    totalCards,
    progress,
    isFirstCard,
    isLastCard,
    difficultCards,

    next,
    previous,
    restart,
    shuffle,
    toggleDifficult,

    setDifficultOnly,
  };
}
