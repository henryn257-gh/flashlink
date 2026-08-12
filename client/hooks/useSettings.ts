import {
  useCallback,
  useEffect,
  useState,
} from "react";

export interface StudySettings {
  shuffle: boolean;
  termsFirst: boolean;
  animation: boolean;
  timer: boolean;
  difficultOnly: boolean;
  darkMode: boolean;
}

export const DEFAULT_SETTINGS: StudySettings = {
  shuffle: false,
  termsFirst: true,
  animation: true,
  timer: false,
  difficultOnly: false,
  darkMode: false,
};

const STORAGE_KEY =
  "flashlink-settings";

function loadSettings(): StudySettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed: unknown =
      JSON.parse(stored);

    if (
      typeof parsed !== "object" ||
      parsed === null
    ) {
      return DEFAULT_SETTINGS;
    }

    const value =
      parsed as Partial<StudySettings>;

    return {
      shuffle:
        typeof value.shuffle === "boolean"
          ? value.shuffle
          : DEFAULT_SETTINGS.shuffle,

      termsFirst:
        typeof value.termsFirst === "boolean"
          ? value.termsFirst
          : DEFAULT_SETTINGS.termsFirst,

      animation:
        typeof value.animation === "boolean"
          ? value.animation
          : DEFAULT_SETTINGS.animation,

      timer:
        typeof value.timer === "boolean"
          ? value.timer
          : DEFAULT_SETTINGS.timer,

      difficultOnly:
        typeof value.difficultOnly ===
        "boolean"
          ? value.difficultOnly
          : DEFAULT_SETTINGS.difficultOnly,

      darkMode:
        typeof value.darkMode === "boolean"
          ? value.darkMode
          : DEFAULT_SETTINGS.darkMode,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(
  settings: StudySettings
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settings)
    );
  } catch {
    // Settings still work for the current
    // session if localStorage is unavailable.
  }
}

export function useSettings() {
  const [settings, setSettings] =
    useState<StudySettings>(
      loadSettings
    );

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSetting = useCallback(
    <K extends keyof StudySettings>(
      key: K,
      value: StudySettings[K]
    ) => {
      setSettings((current) => ({
        ...current,
        [key]: value,
      }));
    },
    []
  );

  const setShuffle = useCallback(
    (enabled: boolean) => {
      updateSetting(
        "shuffle",
        enabled
      );
    },
    [updateSetting]
  );

  const setTermsFirst = useCallback(
    (enabled: boolean) => {
      updateSetting(
        "termsFirst",
        enabled
      );
    },
    [updateSetting]
  );

  const setAnimation = useCallback(
    (enabled: boolean) => {
      updateSetting(
        "animation",
        enabled
      );
    },
    [updateSetting]
  );

  const setTimer = useCallback(
    (enabled: boolean) => {
      updateSetting(
        "timer",
        enabled
      );
    },
    [updateSetting]
  );

  const setDifficultOnly =
    useCallback(
      (enabled: boolean) => {
        updateSetting(
          "difficultOnly",
          enabled
        );
      },
      [updateSetting]
    );

  const setDarkMode = useCallback(
    (enabled: boolean) => {
      updateSetting(
        "darkMode",
        enabled
      );
    },
    [updateSetting]
  );

  const resetSettings =
    useCallback(() => {
      setSettings(
        DEFAULT_SETTINGS
      );
    }, []);

  return {
    settings,

    shuffle: settings.shuffle,
    termsFirst: settings.termsFirst,
    animation: settings.animation,
    timer: settings.timer,
    difficultOnly:
      settings.difficultOnly,
    darkMode: settings.darkMode,

    setShuffle,
    setTermsFirst,
    setAnimation,
    setTimer,
    setDifficultOnly,
    setDarkMode,

    resetSettings,
  };
}
