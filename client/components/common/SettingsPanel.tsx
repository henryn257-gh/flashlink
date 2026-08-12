import type { ReactNode } from "react";

interface SettingsPanelProps {
  shuffle: boolean;
  termsFirst: boolean;
  animation: boolean;
  timer: boolean;
  difficultOnly: boolean;
  darkMode: boolean;

  onShuffleChange: (enabled: boolean) => void;
  onTermsFirstChange: (enabled: boolean) => void;
  onAnimationChange: (enabled: boolean) => void;
  onTimerChange: (enabled: boolean) => void;
  onDifficultOnlyChange: (enabled: boolean) => void;
  onDarkModeChange: (enabled: boolean) => void;

  footer?: ReactNode;
}

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (enabled: boolean) => void;
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: SettingToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-background p-4 transition hover:bg-muted/50">
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {label}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-primary"
            : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </label>
  );
}

function SettingsPanel({
  shuffle,
  termsFirst,
  animation,
  timer,
  difficultOnly,
  darkMode,

  onShuffleChange,
  onTermsFirstChange,
  onAnimationChange,
  onTimerChange,
  onDifficultOnlyChange,
  onDarkModeChange,

  footer,
}: SettingsPanelProps) {
  return (
    <section
      aria-label="Study settings"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          Settings
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Customize how you study this deck.
        </p>
      </div>

      <div className="space-y-3">
        <SettingToggle
          label="Shuffle"
          description="Randomize the order of cards."
          checked={shuffle}
          onChange={onShuffleChange}
        />

        <SettingToggle
          label="Terms First"
          description="Start cards with the term side visible."
          checked={termsFirst}
          onChange={onTermsFirstChange}
        />

        <SettingToggle
          label="Animation"
          description="Use card transitions and motion effects."
          checked={animation}
          onChange={onAnimationChange}
        />

        <SettingToggle
          label="Timer"
          description="Show a study countdown timer."
          checked={timer}
          onChange={onTimerChange}
        />

        <SettingToggle
          label="Difficult Only"
          description="Study only cards you marked difficult."
          checked={difficultOnly}
          onChange={onDifficultOnlyChange}
        />

        <SettingToggle
          label="Dark Mode"
          description="Use the dark appearance."
          checked={darkMode}
          onChange={onDarkModeChange}
        />
      </div>

      {footer && (
        <div className="mt-5 border-t border-border pt-5">
          {footer}
        </div>
      )}
    </section>
  );
}

export default SettingsPanel;
