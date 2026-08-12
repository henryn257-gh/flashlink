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
  id: number;
  card: Card;
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
  isCurrentCardDifficult: boolean;
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
   * Cards get an internal study-session ID.
   *
   * This ID is NOT part of the Deck/Card model.
   * It never gets encoded into the URL.
   *
   * It exists only so study preferences stay attached
   * to the correct card when cards are shuffled.
   */
  const [studyCards, setStudyCards] =
    useState<StudyCard[]>(() => {
      const cards = sourceCards.map(
        (card, index) => ({
          id: index,
          card,
        })
      );

      return shuffleInitially
        ? shuffleCards(cards)
        : cards;
    });

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [difficultCardIds, setDifficultCardIds] =
    useState<Set<number>>(
      () => new Set<number>()
    );

  const [
    difficultOnly,
    setDifficultOnlyState,
  ] = useState(
    difficultOnlyInitially
  );

  /*
   * Filter the study-session cards.
   *
   * Because the difficult state is attached to the
   * internal card ID, shuffling cannot break it.
   */
  const visibleCards = useMemo(() => {
    if (!difficultOnly) {
      return studyCards;
    }

    return studyCards.filter(
      ({ id }) =>
        difficultCardIds.has(id)
    );
  }, [
    studyCards,
    difficultOnly,
    difficultCardIds,
  ]);

  /*
   * If filtering reduces the number of cards,
   * make sure the current position remains valid.
   */
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
    currentStudyCard !== null &&
    difficultCardIds.has(
      currentStudyCard.id
    );

  /*
   * Expose difficult IDs as a Set<number>.
   *
   * This is still session-only state.
   * Nothing is added to the actual Card model.
   */
  const difficultCards = useMemo(
    () =>
      new Set(difficultCardIds),
    [difficultCardIds]
  );

  const next = useCallback(() => {
    setCurrentIndex((index) => {
      const lastIndex =
        visibleCards.length - 1;

      if (lastIndex <= 0) {
        return 0;
      }

      return Math.min(
        index + 1,
        lastIndex
      );
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
    if (!currentStudyCard) {
      return;
    }

    setDifficultCardIds((previous) => {
      const next = new Set(previous);

      if (
        next.has(currentStudyCard.id)
      ) {
        next.delete(
          currentStudyCard.id
        );
      } else {
        next.add(
          currentStudyCard.id
        );
      }

      return next;
    });
  }, [currentStudyCard]);

  const setDifficultOnly = useCallback(
    (enabled: boolean) => {
      setDifficultOnlyState(enabled);

      /*
       * Always begin the filtered session
       * at its first card.
       */
      setCurrentIndex(0);
    },
    []
  );

  return {
    cards: visibleCards.map(
      ({ card }) => card
    ),

    currentCard,

    currentIndex: safeIndex,

    totalCards,

    progress,

    isFirstCard,

    isLastCard,

    difficultCards,

    isCurrentCardDifficult,

    difficultOnly,

    next,
    previous,
    restart,
    shuffle,
    toggleDifficult,

    setDifficultOnly,
  };
}
