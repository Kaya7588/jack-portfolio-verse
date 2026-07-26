"use client";

/**
 * DeepLinkOnboardingPrompt
 * ------------------------
 * Shown when a first-time user arrives via a deep link (e.g. product page).
 * Gives them two clear choices:
 *   - Skip & go straight to the deep-link destination
 *   - Customize (language / theme / currency) first
 *
 * Reusable across mini-apps: pass `redirectTo`, `onSkip`, `onCustomize`.
 * Copy is overridable via props.
 */
export interface DeepLinkOnboardingPromptProps {
  redirectTo: string;
  onSkip: () => void;
  onCustomize: () => void;
  minH?: string;
  insets?: { top: number; bottom: number };
  eyebrow?: string;
  title?: string;
  description?: string;
  skipLabel?: string;
  customizeLabel?: string;
}

export function DeepLinkOnboardingPrompt({
  redirectTo,
  onSkip,
  onCustomize,
  minH = "100dvh",
  insets = { top: 0, bottom: 0 },
  eyebrow = "Deep link detected",
  title = "Jump straight in, or customize first?",
  description,
  skipLabel = "Skip & open product",
  customizeLabel = "Customize first",
}: DeepLinkOnboardingPromptProps) {
  const desc =
    description ??
    `You're heading to ${redirectTo}. Skip onboarding to go directly, or take 30 seconds to pick language, theme and currency.`;

  return (
    <div
      className="relative w-full flex justify-center overflow-hidden"
      style={{
        height: minH,
        background: "#0C0C0C",
        color: "#D7E2EA",
        fontFamily: "'Kanit', 'Noto Sans Devanagari', sans-serif",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <div
        className="relative w-full max-w-[440px] flex flex-col px-6 pt-8 pb-6"
        style={{ height: `calc(${minH} - ${insets.top + insets.bottom}px)` }}
      >
        <div className="flex-1 flex flex-col justify-center gap-6">
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ opacity: 0.6 }}
          >
            {eyebrow}
          </span>
          <h1
            className="hero-heading font-black uppercase leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(2rem, 9vw, 2.8rem)" }}
          >
            {title}
          </h1>
          <p className="font-light leading-relaxed" style={{ opacity: 0.7, fontSize: "1rem" }}>
            {desc}
          </p>
        </div>
        <div className="shrink-0 flex flex-col gap-3">
          <button
            onClick={onSkip}
            className="w-full rounded-full py-4 text-base text-white font-medium uppercase tracking-widest"
            style={{
              background:
                "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
              boxShadow:
                "0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset",
              outline: "2px solid #ffffff",
              outlineOffset: "-3px",
            }}
          >
            {skipLabel}
          </button>
          <button
            onClick={onCustomize}
            className="w-full rounded-full py-4 text-sm font-medium uppercase tracking-widest"
            style={{
              background: "transparent",
              color: "#D7E2EA",
              border: "1px solid rgba(215,226,234,0.28)",
            }}
          >
            {customizeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeepLinkOnboardingPrompt;
