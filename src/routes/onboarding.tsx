import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import welcomeImg from "@/assets/arya/welcome.jpg";
import paymentsImg from "@/assets/arya/payments.jpg";
import deliveryImg from "@/assets/arya/delivery.jpg";
import supportImg from "@/assets/arya/support.jpg";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Arya Premium — Onboarding" },
      { name: "description", content: "Welcome to Arya Premium. Buy and instantly receive premium audio and video story series inside Telegram." },
      { property: "og:title", content: "Arya Premium — Onboarding" },
      { property: "og:description", content: "Automated digital story store inside Telegram." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingPage,
});

type Phase = "features" | "language" | "theme" | "currency" | "done";

const STORAGE_KEY = "arya.onboarding.prefs.v1";

const FEATURES = [
  {
    img: welcomeImg,
    title: "Welcome to Arya Premium",
    body: "Your automated store inside Telegram for premium audio and video story series — delivered instantly to your chat.",
  },
  {
    img: paymentsImg,
    title: "Buy Stories in Minutes",
    body: "Pay with UPI QR, Crypto, Cards, NetBanking or Wallets. Multi-currency pricing with 10–15 second UTR auto-verification.",
  },
  {
    img: deliveryImg,
    title: "Instant Telegram Delivery",
    body: "Episodes land in your own Telegram with lifetime access. Forwarding and downloading stay on, always. (T&C apply)",
  },
  {
    img: supportImg,
    title: "24/7 Live Support",
    body: "Real-time chat with dedicated agents and a built-in Story Request portal for missing episodes and series.",
  },
];

const LANGUAGES = [
  { id: "en", label: "English", sub: "Continue in English" },
  { id: "hi", label: "हिन्दी", sub: "हिन्दी में जारी रखें" },
];

const THEMES = [
  { id: "mono", label: "Mono", sub: "Minimal monochrome", swatch: ["#F5F5F5", "#8A8A8A", "#1A1A1A"] },
  { id: "dark", label: "Dark", sub: "Deep contrast (default)", swatch: ["#0C0C0C", "#7621B0", "#B600A8"] },
  { id: "cream", label: "Cream", sub: "Soft warm paper", swatch: ["#F5EEDC", "#D9B382", "#6B4A2B"] },
];

type CurrencyId = "inr" | "usd" | "eur" | "gbp";

const CURRENCIES: {
  id: CurrencyId;
  label: string;
  sub: string;
  symbol: string;
  code: string;
  locale: string;
  // Approximate conversion from a base INR price. Purely illustrative for the preview.
  rateFromInr: number;
}[] = [
  { id: "inr", label: "INR", sub: "Indian Rupee", symbol: "₹", code: "INR", locale: "en-IN", rateFromInr: 1 },
  { id: "usd", label: "USD", sub: "US Dollar", symbol: "$", code: "USD", locale: "en-US", rateFromInr: 0.012 },
  { id: "eur", label: "EUR", sub: "Euro", symbol: "€", code: "EUR", locale: "en-IE", rateFromInr: 0.011 },
  { id: "gbp", label: "GBP", sub: "British Pound", symbol: "£", code: "GBP", locale: "en-GB", rateFromInr: 0.0095 },
];

// Sample story catalog prices (base INR) — shown in the summary preview.
const SAMPLE_STORIES = [
  { name: "Midnight Whisper", tag: "Audio series", inr: 199 },
  { name: "Neon Rain", tag: "Video series", inr: 499 },
  { name: "The Last Signal", tag: "Bundle", inr: 899 },
];

function formatPrice(inr: number, currencyId: string) {
  const c = CURRENCIES.find((x) => x.id === currencyId) ?? CURRENCIES[0];
  const value = inr * c.rateFromInr;
  try {
    return new Intl.NumberFormat(c.locale, {
      style: "currency",
      currency: c.code,
      maximumFractionDigits: c.id === "inr" ? 0 : 2,
      minimumFractionDigits: c.id === "inr" ? 0 : 2,
    }).format(value);
  } catch {
    return `${c.symbol}${value.toFixed(c.id === "inr" ? 0 : 2)}`;
  }
}

// ---- Telegram WebApp typings (minimal) ----
type TgWebApp = {
  ready: () => void;
  expand: () => void;
  enableClosingConfirmation?: () => void;
  BackButton: { show: () => void; hide: () => void; onClick: (cb: () => void) => void; offClick: (cb: () => void) => void };
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    selectionChanged: () => void;
    notificationOccurred: (type: "success" | "warning" | "error") => void;
  };
  viewportStableHeight?: number;
  viewportHeight?: number;
  onEvent?: (ev: string, cb: () => void) => void;
  offEvent?: (ev: string, cb: () => void) => void;
  setHeaderColor?: (c: string) => void;
  setBackgroundColor?: (c: string) => void;
  colorScheme?: "light" | "dark";
};

function getTg(): TgWebApp | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp ?? null;
}

function haptic(kind: "select" | "light" | "medium" | "success") {
  const tg = getTg();
  const h = tg?.HapticFeedback;
  if (h) {
    if (kind === "select") h.selectionChanged();
    else if (kind === "success") h.notificationOccurred("success");
    else h.impactOccurred(kind);
    return;
  }
  // Web fallback
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    const map = { select: 8, light: 10, medium: 18, success: [12, 40, 18] } as const;
    try { navigator.vibrate(map[kind] as number | number[]); } catch { /* noop */ }
  }
}

function loadPrefs(): { lang: string; theme: string; currency: string; completed: boolean } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function savePrefs(p: { lang: string; theme: string; currency: string; completed: boolean }) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* noop */ }
}

function OnboardingPage() {
  const [phase, setPhase] = useState<Phase>("features");
  const [slide, setSlide] = useState(0);
  const [lang, setLang] = useState<string>("en");
  const [theme, setTheme] = useState<string>("dark");
  const [currency, setCurrency] = useState<string>("inr");
  const [hydrated, setHydrated] = useState(false);
  const [insets, setInsets] = useState({ top: 0, bottom: 0 });
  const [vh, setVh] = useState<number | null>(null);

  // Hydrate saved prefs
  useEffect(() => {
    const saved = loadPrefs();
    if (saved) {
      setLang(saved.lang);
      setTheme(saved.theme);
      setCurrency(saved.currency);
      if (saved.completed) setPhase("done");
    }
    setHydrated(true);
  }, []);

  // Persist on change (only after hydrate to avoid clobbering)
  useEffect(() => {
    if (!hydrated) return;
    savePrefs({ lang, theme, currency, completed: phase === "done" });
  }, [lang, theme, currency, phase, hydrated]);

  // Telegram WebApp init
  useEffect(() => {
    const tg = getTg();
    if (!tg) {
      // Web safe-area fallback via env()
      return;
    }
    try {
      tg.ready();
      tg.expand();
      tg.setHeaderColor?.("#0C0C0C");
      tg.setBackgroundColor?.("#0C0C0C");
      if (tg.viewportStableHeight) setVh(tg.viewportStableHeight);
      const onVp = () => {
        if (tg.viewportStableHeight) setVh(tg.viewportStableHeight);
      };
      tg.onEvent?.("viewportChanged", onVp);
      return () => { tg.offEvent?.("viewportChanged", onVp); };
    } catch { /* noop */ }
  }, []);

  // CSS env() safe-area detection
  useEffect(() => {
    const read = () => {
      const probe = document.createElement("div");
      probe.style.cssText = "position:fixed;top:0;left:0;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom) 0;visibility:hidden;pointer-events:none;";
      document.body.appendChild(probe);
      const cs = getComputedStyle(probe);
      const top = parseFloat(cs.paddingTop) || 0;
      const bottom = parseFloat(cs.paddingBottom) || 0;
      document.body.removeChild(probe);
      setInsets({ top, bottom });
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  const goBack = useCallback(() => {
    haptic("light");
    if (phase === "features") {
      if (slide > 0) setSlide(slide - 1);
      return;
    }
    if (phase === "language") { setPhase("features"); setSlide(FEATURES.length - 1); return; }
    if (phase === "theme") { setPhase("language"); return; }
    if (phase === "currency") { setPhase("theme"); return; }
    if (phase === "done") { setPhase("currency"); return; }
  }, [phase, slide]);

  const advance = useCallback(() => {
    haptic("medium");
    if (phase === "features") {
      if (slide < FEATURES.length - 1) setSlide(slide + 1);
      else setPhase("language");
      return;
    }
    if (phase === "language") return setPhase("theme");
    if (phase === "theme") return setPhase("currency");
    if (phase === "currency") { haptic("success"); return setPhase("done"); }
  }, [phase, slide]);

  const canBack = !(phase === "features" && slide === 0);

  // Telegram BackButton wiring
  useEffect(() => {
    const tg = getTg();
    if (!tg?.BackButton) return;
    if (canBack) tg.BackButton.show(); else tg.BackButton.hide();
    tg.BackButton.onClick(goBack);
    return () => { tg.BackButton.offClick(goBack); };
  }, [canBack, goBack]);

  const showSkip = phase !== "done";

  const minH = vh ? `${vh}px` : "100dvh";

  return (
    <div
      className="relative w-full flex justify-center"
      style={{
        minHeight: minH,
        background: "#0C0C0C",
        fontFamily: "'Kanit', sans-serif",
        color: "#D7E2EA",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <div className="relative w-full max-w-[440px] flex flex-col px-6 pt-6 pb-8" style={{ overflowX: "clip", minHeight: `calc(${minH} - ${insets.top + insets.bottom}px)` }}>
        {/* Top bar */}
        <div className="flex items-center justify-between h-10 shrink-0 relative z-20">
          <button
            onClick={goBack}
            disabled={!canBack}
            aria-label="Back"
            className="h-10 w-10 -ml-2 grid place-items-center rounded-full transition-opacity disabled:opacity-0 disabled:pointer-events-none hover:bg-white/5"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <div className="text-[13px] uppercase tracking-[0.28em] font-light opacity-70">
            Arya Premium
          </div>
          <button
            onClick={() => { haptic("light"); setPhase("done"); }}
            className="text-sm font-light opacity-70 hover:opacity-100 transition-opacity px-2"
            style={{ visibility: showSkip && phase !== "features" ? "visible" : "hidden" }}
          >
            Skip
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col mt-2 min-h-0">
          <AnimatePresence mode="wait">
            {phase === "features" && (
              <FeatureCarousel key="feat" slide={slide} setSlide={setSlide} />
            )}
            {phase === "language" && (
              <SelectPane
                key="lang"
                title="Choose your Language"
                subtitle="Pick the language you're most comfortable with. You can change this later in Settings."
                options={LANGUAGES.map((l) => ({ id: l.id, label: l.label, sub: l.sub }))}
                value={lang}
                onChange={(v) => { haptic("select"); setLang(v); }}
              />
            )}
            {phase === "theme" && (
              <SelectPane
                key="theme"
                title="Pick your Theme"
                subtitle="How should Arya Premium look? Applied after onboarding."
                options={THEMES.map((t) => ({
                  id: t.id,
                  label: t.label,
                  sub: t.sub,
                  accessory: <ThemeSwatch colors={t.swatch} />,
                }))}
                value={theme}
                onChange={(v) => { haptic("select"); setTheme(v); }}
              />
            )}
            {phase === "currency" && (
              <SelectPane
                key="cur"
                title="Select your Currency"
                subtitle="Prices across the store will show in this currency."
                options={CURRENCIES.map((c) => ({
                  id: c.id,
                  label: c.label,
                  sub: `${c.sub} — sample ${formatPrice(499, c.id)}`,
                  accessory: <CurrencyGlyph symbol={c.symbol} />,
                }))}
                value={currency}
                onChange={(v) => { haptic("select"); setCurrency(v); }}
              />
            )}
            {phase === "done" && <DonePane key="done" lang={lang} theme={theme} currency={currency} />}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="shrink-0 pt-6 flex flex-col items-center gap-5">
          {phase === "features" && (
            <ProgressDots count={FEATURES.length} active={slide} onDot={(i) => { haptic("select"); setSlide(i); }} />
          )}

          {phase !== "done" ? (
            <button
              onClick={advance}
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
              {phase === "features"
                ? slide < FEATURES.length - 1
                  ? "Next"
                  : "Get Started"
                : phase === "currency"
                ? "Finish"
                : "Continue"}
            </button>
          ) : (
            <button
              onClick={() => {
                haptic("light");
                try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
                setPhase("features"); setSlide(0);
                setLang("en"); setTheme("dark"); setCurrency("inr");
              }}
              className="w-full rounded-full py-4 text-base font-medium uppercase tracking-widest border-2 border-[#D7E2EA] text-[#D7E2EA] hover:bg-white/5 transition-colors"
            >
              Restart Onboarding
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressDots({ count, active, onDot }: { count: number; active: number; onDot: (i: number) => void }) {
  return (
    <div className="flex items-center gap-2" role="tablist" aria-label="Feature slides">
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === active;
        return (
          <button
            key={i}
            role="tab"
            aria-selected={isActive}
            aria-label={`Slide ${i + 1}`}
            onClick={() => onDot(i)}
            className="h-1.5 rounded-full relative overflow-hidden"
            style={{
              width: isActive ? 28 : 8,
              transition: "width 320ms cubic-bezier(0.25, 0.1, 0.25, 1)",
              background: "rgba(215,226,234,0.22)",
            }}
          >
            <motion.span
              initial={false}
              animate={{ scaleX: isActive ? 1 : 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, #B600A8 0%, #7621B0 100%)",
                transformOrigin: "left center",
                borderRadius: 999,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

function FeatureCarousel({ slide, setSlide }: { slide: number; setSlide: (n: number) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      const w = el.getBoundingClientRect().width;
      setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Snap x to current slide when slide changes or width changes.
  useEffect(() => {
    if (!width) return;
    const target = -slide * width;
    const controls = animate(x, target, { type: "spring", stiffness: 340, damping: 34, mass: 0.9 });
    return () => controls.stop();
  }, [slide, width, x]);

  const onDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (!width) return;
    const threshold = width * 0.22;
    const v = info.velocity.x;
    let next = slide;
    if (info.offset.x < -threshold || v < -500) next = Math.min(slide + 1, FEATURES.length - 1);
    else if (info.offset.x > threshold || v > 500) next = Math.max(slide - 1, 0);
    if (next !== slide) {
      haptic("light");
      setSlide(next);
    } else {
      // Snap back
      animate(x, -slide * width, { type: "spring", stiffness: 340, damping: 34 });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col min-h-0"
    >
      <div ref={containerRef} className="flex-1 min-h-0 relative overflow-hidden touch-pan-y">
        <motion.div
          className="absolute inset-0 flex"
          style={{ x, width: `${FEATURES.length * 100}%` }}
          drag="x"
          dragConstraints={{ left: -(FEATURES.length - 1) * width, right: 0 }}
          dragElastic={0.12}
          dragMomentum={false}
          onDragEnd={onDragEnd}
        >
          {FEATURES.map((f, i) => (
            <FeatureSlide key={i} feature={f} index={i} x={x} width={width} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

function FeatureSlide({
  feature,
  index,
  x,
  width,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
  x: ReturnType<typeof useMotionValue<number>>;
  width: number;
}) {
  // Parallax + scale based on distance from center
  const range = width > 0 ? [-(index + 1) * width, -index * width, -(index - 1) * width] : [-1, 0, 1];
  const scale = useTransform(x, range, [0.9, 1, 0.9]);
  const opacity = useTransform(x, range, [0.5, 1, 0.5]);
  const imgY = useTransform(x, range, [12, 0, 12]);

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col px-1" style={{ width: width || undefined }}>
      <motion.div style={{ scale, opacity }} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex items-center justify-center min-h-0 py-4">
          <div
            className="relative w-full aspect-square max-w-[340px] rounded-[40px] overflow-hidden"
            style={{
              border: "1px solid rgba(215, 226, 234, 0.15)",
              background:
                "radial-gradient(120% 100% at 50% 0%, rgba(118,33,176,0.25) 0%, rgba(12,12,12,0) 55%), #0C0C0C",
              boxShadow: "0 40px 120px -40px rgba(182,0,168,0.35)",
            }}
          >
            <motion.img
              src={feature.img}
              alt=""
              width={768}
              height={768}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ y: imgY }}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <h1
            className="hero-heading font-black uppercase leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(2rem, 8vw, 2.6rem)" }}
          >
            {feature.title}
          </h1>
          <p
            className="font-light leading-relaxed"
            style={{ color: "#D7E2EA", opacity: 0.7, fontSize: "0.98rem" }}
          >
            {feature.body}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

type Option = { id: string; label: string; sub?: string; accessory?: React.ReactNode };

function SelectPane({
  title,
  subtitle,
  options,
  value,
  onChange,
}: {
  title: string;
  subtitle: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-1 flex flex-col min-h-0"
    >
      <div className="pt-6 pb-8 flex flex-col gap-3">
        <h1
          className="hero-heading font-black uppercase leading-[0.95] tracking-tight"
          style={{ fontSize: "clamp(2rem, 9vw, 2.8rem)" }}
        >
          {title}
        </h1>
        <p className="font-light leading-relaxed" style={{ color: "#D7E2EA", opacity: 0.65, fontSize: "0.98rem" }}>
          {subtitle}
        </p>
      </div>
      <div role="radiogroup" className="flex flex-col gap-3 flex-1">
        {options.map((o, i) => {
          const selected = value === o.id;
          return (
            <motion.button
              key={o.id}
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(o.id)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.06, duration: 0.45 }}
              className="group w-full text-left rounded-3xl p-4 sm:p-5 flex items-center gap-4 transition-all"
              style={{
                border: `1px solid ${selected ? "rgba(215,226,234,0.7)" : "rgba(215,226,234,0.14)"}`,
                background: selected
                  ? "linear-gradient(140deg, rgba(182,0,168,0.16) 0%, rgba(118,33,176,0.10) 60%, rgba(12,12,12,0) 100%)"
                  : "rgba(215,226,234,0.03)",
              }}
            >
              {o.accessory && <div className="shrink-0">{o.accessory}</div>}
              <div className="flex-1 min-w-0">
                <div className="font-medium leading-tight" style={{ color: "#D7E2EA", fontSize: "1.05rem" }}>
                  {o.label}
                </div>
                {o.sub && (
                  <div className="mt-1 font-light truncate" style={{ color: "#D7E2EA", opacity: 0.55, fontSize: "0.82rem" }}>
                    {o.sub}
                  </div>
                )}
              </div>
              <div
                className="shrink-0 h-7 w-7 rounded-full grid place-items-center transition-colors"
                style={{
                  border: `1.5px solid ${selected ? "#D7E2EA" : "rgba(215,226,234,0.3)"}`,
                  background: selected ? "#D7E2EA" : "transparent",
                }}
                aria-hidden
              >
                {selected && <Check size={14} strokeWidth={3} color="#0C0C0C" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function ThemeSwatch({ colors }: { colors: string[] }) {
  return (
    <div className="h-12 w-12 rounded-2xl overflow-hidden flex" style={{ border: "1px solid rgba(215,226,234,0.15)" }}>
      {colors.map((c, i) => (
        <div key={i} className="flex-1" style={{ background: c }} />
      ))}
    </div>
  );
}

function CurrencyGlyph({ symbol }: { symbol: string }) {
  return (
    <div
      className="h-12 w-12 rounded-2xl grid place-items-center font-medium"
      style={{
        border: "1px solid rgba(215,226,234,0.15)",
        background: "rgba(215,226,234,0.04)",
        color: "#D7E2EA",
        fontSize: "1.4rem",
      }}
    >
      {symbol}
    </div>
  );
}

function DonePane({ lang, theme, currency }: { lang: string; theme: string; currency: string }) {
  const langLabel = LANGUAGES.find((l) => l.id === lang)?.label;
  const themeLabel = THEMES.find((t) => t.id === theme)?.label;
  const currencyLabel = CURRENCIES.find((c) => c.id === currency)?.label;
  const rows = [
    { k: "Language", v: langLabel },
    { k: "Theme", v: themeLabel },
    { k: "Currency", v: currencyLabel },
  ];

  const priced = useMemo(
    () => SAMPLE_STORIES.map((s) => ({ ...s, price: formatPrice(s.inr, currency) })),
    [currency],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-1 flex flex-col items-center text-center gap-6 py-6"
    >
      <div
        className="h-20 w-20 rounded-3xl grid place-items-center"
        style={{
          background:
            "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
          boxShadow: "0 20px 60px -20px rgba(182,0,168,0.6)",
          outline: "2px solid rgba(255,255,255,0.9)",
          outlineOffset: "-3px",
        }}
      >
        <Check size={36} strokeWidth={2.5} color="#ffffff" />
      </div>
      <div className="flex flex-col gap-3 max-w-[320px]">
        <h1
          className="hero-heading font-black uppercase leading-[0.95] tracking-tight"
          style={{ fontSize: "clamp(1.9rem, 8vw, 2.6rem)" }}
        >
          You&apos;re all set
        </h1>
        <p className="font-light leading-relaxed" style={{ color: "#D7E2EA", opacity: 0.7, fontSize: "0.95rem" }}>
          Welcome to Arya Premium. Your personal audio &amp; video story store is ready inside Telegram.
        </p>
      </div>

      <div
        className="w-full max-w-[340px] rounded-3xl p-5 flex flex-col gap-3"
        style={{ border: "1px solid rgba(215,226,234,0.15)", background: "rgba(215,226,234,0.03)" }}
      >
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between text-sm">
            <span className="uppercase tracking-widest font-light" style={{ opacity: 0.55 }}>{r.k}</span>
            <span className="font-medium">{r.v}</span>
          </div>
        ))}
      </div>

      {/* Sample store prices formatted with the chosen currency */}
      <div
        className="w-full max-w-[340px] rounded-3xl p-4 flex flex-col gap-2 text-left"
        style={{
          border: "1px solid rgba(215,226,234,0.15)",
          background:
            "linear-gradient(140deg, rgba(182,0,168,0.10) 0%, rgba(118,33,176,0.06) 60%, rgba(12,12,12,0) 100%)",
        }}
      >
        <div className="flex items-center justify-between px-1 pb-1">
          <span className="uppercase tracking-widest font-light text-xs" style={{ opacity: 0.6 }}>
            Store preview
          </span>
          <span className="uppercase tracking-widest font-light text-xs" style={{ opacity: 0.6 }}>
            {currencyLabel}
          </span>
        </div>
        {priced.map((s) => (
          <div
            key={s.name}
            className="flex items-center justify-between rounded-2xl px-3 py-2.5"
            style={{ background: "rgba(215,226,234,0.04)" }}
          >
            <div className="min-w-0">
              <div className="font-medium truncate" style={{ fontSize: "0.95rem" }}>{s.name}</div>
              <div className="font-light truncate" style={{ opacity: 0.55, fontSize: "0.75rem" }}>{s.tag}</div>
            </div>
            <div className="font-semibold shrink-0" style={{ fontSize: "1rem" }}>{s.price}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
