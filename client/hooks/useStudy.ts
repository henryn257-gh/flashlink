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

interface StudyCard {
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
  isComplete: boolean;

  difficultCards: Set<number>;
  isCurrentCardDifficult: boolean;
  difficultOnly: boolean;

  next: () => void;
  previous: () => void;
  restart: () => void;
  finish: () => void;
  shuffle: () => void;

  toggleDifficult: () => void;
  setDifficultOnly: (enabled: boolean) => void;
}

function shuffleCards<T>(
  items: T[]
): T[] {
  const result = [...items];

  for (
    let index = result.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1)
    );

    [
      result[index],
      result[randomIndex],
    ] = [
      result[randomIndex],
      result[index],
    ];
  }

  return result;
}

function createStudyCards(
  sourceCards: Card[]
): StudyCard[] {
  return sourceCards.map(
    (card, originalIndex) => ({
      card,
      originalIndex,
    })
  );
}

export function useStudy(
  sourceCards: Card[],
  options: UseStudyOptions = {}
): UseStudyReturn {
  const {
    shuffle: shuffleInitially = false,
    difficultOnly:
      difficultOnlyInitially = false,
  } = options;

  const [studyCards, setStudyCards] =
    useState<StudyCard[]>(() => {
      const cards =
        createStudyCards(sourceCards);

      return shuffleInitially
        ? shuffleCards(cards)
        : cards;
    });

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [isComplete, setIsComplete] =
    useState(false);

  const [
    difficultCards,
    setDifficultCards,
  ] = useState<Set<number>>(
    () => new Set<number>()
  );

  const [
    difficultOnly,
    setDifficultOnlyState,
  ] = useState(
    difficultOnlyInitially
  );

  const visibleCards = useMemo(() => {
    if (!difficultOnly) {
      return studyCards;
    }

    return studyCards.filter(
      (studyCard) =>
        difficultCards.has(
          studyCard.originalIndex
        )
    );
  }, [
    studyCards,
    difficultOnly,
    difficultCards,
  ]);

  const safeIndex = Math.min(
    currentIndex,
    Math.max(
      visibleCards.length - 1,
      0
    )
  );

  const currentStudyCard =
    visibleCards[safeIndex] ?? null;

  const currentCard =
    currentStudyCard?.card ?? null;

  const totalCards =
    visibleCards.length;

  const progress =
    totalCards === 0
      ? 0
      : isComplete
        ? 100
        : ((safeIndex + 1) /
            totalCards) *
          100;

  const isFirstCard =
    totalCards === 0 ||
    safeIndex === 0;

  const isLastCard =
    totalCards === 0 ||
    safeIndex === totalCards - 1;

  const isCurrentCardDifficult =
    currentStudyCard !== null
      ? difficultCards.has(
          currentStudyCard.originalIndex
        )
      : false;

  const next = useCallback(() => {
    if (isComplete) {
      return;
    }

    setCurrentIndex((index) => {
      const lastIndex =
        visibleCards.length - 1;

      if (lastIndex < 0) {
        return 0;
      }

      if (index < lastIndex) {
        return index + 1;
      }

      /*
       * We only enter the completion state
       * after the user has actually viewed
       * the final card.
       */
      setIsComplete(true);

      return index;
    });
  }, [
    isComplete,
    visibleCards.length,
  ]);

  const previous = useCallback(() => {
    if (isComplete) {
      setIsComplete(false);
    }

    setCurrentIndex((index) =>
      Math.max(index - 1, 0)
    );
  }, [isComplete]);

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setIsComplete(false);
  }, []);

  const finish = useCallback(() => {
    if (totalCards === 0) {
      return;
    }

    setCurrentIndex(
      totalCards - 1
    );
    setIsComplete(true);
  }, [totalCards]);

  const shuffle = useCallback(() => {
    setStudyCards((cards) =>
      shuffleCards(cards)
    );

    setCurrentIndex(0);
    setIsComplete(false);
  }, []);

  const toggleDifficult = useCallback(() => {
    if (!currentStudyCard) {
      return;
    }

    const originalIndex =
      currentStudyCard.originalIndex;

    setDifficultCards((previous) => {
      const next = new Set(previous);

      if (next.has(originalIndex)) {
        next.delete(originalIndex);
      } else {
        next.add(originalIndex);
      }

      return next;
    });
  }, [currentStudyCard]);

  const setDifficultOnly = useCallback(
    (enabled: boolean) => {
      setDifficultOnlyState(enabled);
      setCurrentIndex(0);
      setIsComplete(false);
    },
    []
  );

  return {
    cards: visibleCards.map(
      (studyCard) => studyCard.card
    ),

    currentCard,

    currentIndex: safeIndex,
    totalCards,
    progress,

    isFirstCard,
    isLastCard,
    isComplete,

    difficultCards,
    isCurrentCardDifficult,
    difficultOnly,

    next,
    previous,
    restart,
    finish,
    shuffle,

    toggleDifficult,
    setDifficultOnly,
  };
}
