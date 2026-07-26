import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { DICTS, LANG_META, type LangId } from "@/lib/arya-i18n";
import { SCENES } from "@/components/arya/Scenes";
import { track } from "@/lib/arya-analytics";
import { ReturningUserSplash } from "@/components/arya/ReturningUserSplash";
import { DeepLinkOnboardingPrompt } from "@/components/arya/DeepLinkOnboardingPrompt";
import {
  getTelegramMiniApp,
  isSafeInternalRedirect,
  isTelegramVersionAtLeast,
  resolveTelegramDeepLink,
  safeTelegramHaptic,
} from "@/lib/telegram-miniapp-deeplink";

const PRELOAD_IMAGES = [
  "/__l5e/assets-v1/29f3c4fe-bf8b-493c-a3ac-f03a9cc93263/file_0000000013e8820ea802a31d37cc1fdd.png",
  "/__l5e/assets-v1/4821ebec-3f9a-4937-bcfe-dc0dfa28a525/file_0000000048cc820e8a94aedec056054e.png",
  "/__l5e/assets-v1/b70f5ad1-da5b-4066-b37e-342544986365/file_0000000058b0820ea51cc5676deeb054.png",
  "/__l5e/assets-v1/37b3db3d-8cbe-4c80-aa24-46d1454c52e6/file_00000000668081fa889e387e93654005.png",
  "/__l5e/assets-v1/5fb83197-eca1-4f25-b65b-8ab0ad9ff77d/file_0000000068f8820ea8d1533bc9efcc8c.png",
];

export const Route = createFileRoute("/onboarding")({
  validateSearch: (s: Record<string, unknown>) => {
    const r = typeof s.redirect === "string" && isSafeInternalRedirect(s.redirect) ? s.redirect : undefined;
    const force = s.force === "1" || s.force === "true";
    const preview =
      s.preview === "splash" || s.preview === "deeplink" ? (s.preview as "splash" | "deeplink") : undefined;
    return { redirect: r as string | undefined, force, preview };
  },
  head: () => ({
    meta: [
      { title: "Arya Premium — Onboarding" },
      { name: "description", content: "Welcome to Arya Premium. Buy and instantly receive premium audio and video story series inside Telegram." },
      { property: "og:title", content: "Arya Premium — Onboarding" },
      { property: "og:description", content: "Automated digital story store inside Telegram." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      ...PRELOAD_IMAGES.map((href) => ({ rel: "preload", as: "image", href, fetchpriority: "high" })),
      { rel: "preload", as: "image", href: "https://files.catbox.moe/ug9azb.jpg", fetchpriority: "high" },
      { rel: "preconnect", href: "https://files.catbox.moe" },
    ],
  }),
  component: OnboardingPage,
});


type Phase = "features" | "language" | "theme" | "currency" | "done";

const STORAGE_KEY = "arya.onboarding.prefs.v2";

const THEME_IDS = ["mono", "dark", "cream"] as const;
type ThemeId = (typeof THEME_IDS)[number];
const THEME_SWATCHES: Record<ThemeId, string[]> = {
  mono: ["#F5F5F5", "#8A8A8A", "#1A1A1A"],
  dark: ["#0C0C0C", "#7621B0", "#B600A8"],
  cream: ["#F5EEDC", "#D9B382", "#6B4A2B"],
};

type CurrencyId =
  | "inr" | "usd" | "eur" | "gbp" | "aed" | "sar" | "jpy" | "cny"
  | "sgd" | "aud" | "cad" | "chf" | "hkd" | "krw" | "myr" | "thb" | "rub" | "brl";
const CURRENCIES: {
  id: CurrencyId;
  label: string;
  sub: string;
  symbol: string;
  code: string;
  locale: string;
  rateFromInr: number;
}[] = [
  { id: "inr", label: "INR", sub: "Indian Rupee", symbol: "₹", code: "INR", locale: "en-IN", rateFromInr: 1 },
  { id: "usd", label: "USD", sub: "US Dollar", symbol: "$", code: "USD", locale: "en-US", rateFromInr: 0.012 },
  { id: "eur", label: "EUR", sub: "Euro", symbol: "€", code: "EUR", locale: "en-IE", rateFromInr: 0.011 },
  { id: "gbp", label: "GBP", sub: "British Pound", symbol: "£", code: "GBP", locale: "en-GB", rateFromInr: 0.0095 },
  { id: "aed", label: "AED", sub: "UAE Dirham", symbol: "د.إ", code: "AED", locale: "en-AE", rateFromInr: 0.044 },
  { id: "sar", label: "SAR", sub: "Saudi Riyal", symbol: "﷼", code: "SAR", locale: "en-SA", rateFromInr: 0.045 },
  { id: "jpy", label: "JPY", sub: "Japanese Yen", symbol: "¥", code: "JPY", locale: "ja-JP", rateFromInr: 1.85 },
  { id: "cny", label: "CNY", sub: "Chinese Yuan", symbol: "¥", code: "CNY", locale: "zh-CN", rateFromInr: 0.086 },
  { id: "sgd", label: "SGD", sub: "Singapore Dollar", symbol: "S$", code: "SGD", locale: "en-SG", rateFromInr: 0.016 },
  { id: "aud", label: "AUD", sub: "Australian Dollar", symbol: "A$", code: "AUD", locale: "en-AU", rateFromInr: 0.018 },
  { id: "cad", label: "CAD", sub: "Canadian Dollar", symbol: "C$", code: "CAD", locale: "en-CA", rateFromInr: 0.016 },
  { id: "chf", label: "CHF", sub: "Swiss Franc", symbol: "₣", code: "CHF", locale: "de-CH", rateFromInr: 0.010 },
  { id: "hkd", label: "HKD", sub: "Hong Kong Dollar", symbol: "HK$", code: "HKD", locale: "en-HK", rateFromInr: 0.094 },
  { id: "krw", label: "KRW", sub: "South Korean Won", symbol: "₩", code: "KRW", locale: "ko-KR", rateFromInr: 16.2 },
  { id: "myr", label: "MYR", sub: "Malaysian Ringgit", symbol: "RM", code: "MYR", locale: "ms-MY", rateFromInr: 0.056 },
  { id: "thb", label: "THB", sub: "Thai Baht", symbol: "฿", code: "THB", locale: "th-TH", rateFromInr: 0.43 },
  { id: "rub", label: "RUB", sub: "Russian Ruble", symbol: "₽", code: "RUB", locale: "ru-RU", rateFromInr: 1.08 },
  { id: "brl", label: "BRL", sub: "Brazilian Real", symbol: "R$", code: "BRL", locale: "pt-BR", rateFromInr: 0.065 },
];

const SAMPLE_PRICES_INR = [199, 499, 899];

function formatPrice(inr: number, currencyId: string, lang: LangId) {
  const c = CURRENCIES.find((x) => x.id === currencyId) ?? CURRENCIES[0];
  const value = inr * c.rateFromInr;
  const localeMap: Record<LangId, string> = { en: c.locale, hi: c.id === "inr" ? "hi-IN" : c.locale };
  try {
    return new Intl.NumberFormat(localeMap[lang], {
      style: "currency",
      currency: c.code,
      maximumFractionDigits: c.id === "inr" ? 0 : 2,
      minimumFractionDigits: c.id === "inr" ? 0 : 2,
    }).format(value);
  } catch {
    return `${c.symbol}${value.toFixed(c.id === "inr" ? 0 : 2)}`;
  }
}

function haptic(kind: "select" | "light" | "medium" | "success") {
  safeTelegramHaptic(kind);
}

type SavedPrefs = { lang: LangId; theme: ThemeId; currency: CurrencyId; completed: boolean };

function loadPrefs(): SavedPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedPrefs;
  } catch { return null; }
}
function savePrefs(p: SavedPrefs) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* noop */ }
}

// Smart currency default from browser locale / region
function guessCurrency(): CurrencyId {
  if (typeof navigator === "undefined") return "inr";
  const raw = (navigator.language || "en-IN").toLowerCase();
  const region = raw.split("-")[1] ?? "";
  const map: Record<string, CurrencyId> = {
    in: "inr", us: "usd", gb: "gbp", ie: "eur", de: "eur", fr: "eur", es: "eur", it: "eur", nl: "eur",
    ae: "aed", sa: "sar", jp: "jpy", cn: "cny", sg: "sgd", au: "aud", ca: "cad", ch: "chf",
    hk: "hkd", kr: "krw", my: "myr", th: "thb", ru: "rub", br: "brl",
  };
  return map[region] ?? "inr";
}

// A/B micro-copy variant. Sticky per session.
const AB_KEY = "arya.ab.variant.v1";
function abVariant(): "A" | "B" {
  if (typeof window === "undefined") return "A";
  try {
    const v = window.sessionStorage.getItem(AB_KEY);
    if (v === "A" || v === "B") return v;
    const pick: "A" | "B" = Math.random() < 0.5 ? "A" : "B";
    window.sessionStorage.setItem(AB_KEY, pick);
    return pick;
  } catch { return "A"; }
}

const MICROCOPY = {
  A: { getStarted: null as string | null, continue: null as string | null, finish: null as string | null },
  B: { getStarted: "Start Now", continue: "Looks Good", finish: "Enter Store" },
};

function OnboardingPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [redirectTo, setRedirectTo] = useState(search.redirect ?? "/");
  const forceOnboarding = search.force;

  const [phase, setPhase] = useState<Phase>("features");
  const [slide, setSlide] = useState(0);
  const [lang, setLang] = useState<LangId>("en");
  const [theme, setTheme] = useState<ThemeId>("dark");
  const [currency, setCurrency] = useState<CurrencyId>("inr");
  const [hydrated, setHydrated] = useState(false);
  const [insets, setInsets] = useState({ top: 0, bottom: 0 });
  const [vh, setVh] = useState<number | null>(null);
  const [exiting, setExiting] = useState(false);
  const [currencyQuery, setCurrencyQuery] = useState("");

  // Splash for returning users; deep-link customize/skip prompt for new users with a redirect.
  const [showSplash, setShowSplash] = useState(false);
  const [showDeepPrompt, setShowDeepPrompt] = useState(false);
  const variantRef = useRef<"A" | "B">("A");

  const t = DICTS[lang];

  useEffect(() => {
    variantRef.current = abVariant();
    track("onboarding_ab_assigned", { variant: variantRef.current });

    const resolved = resolveTelegramDeepLink(search.redirect ?? "/");
    const target = resolved.redirect;
    setRedirectTo(target);

    // Test/preview overrides — let anyone hit ?preview=splash or ?preview=deeplink
    // to see the returning-user splash or the deep-link prompt without state.
    if (search.preview === "splash") {
      setShowSplash(true);
      track("onboarding_splash_view", { redirect: target, preview: true, source: resolved.source });
      setHydrated(true);
      return;
    }
    if (search.preview === "deeplink") {
      setShowDeepPrompt(true);
      track("onboarding_deeplink_prompt_view", { redirect: target, preview: true, source: resolved.source });
      setHydrated(true);
      return;
    }

    const saved = loadPrefs();
    if (saved) {
      setLang(saved.lang); setTheme(saved.theme); setCurrency(saved.currency);
      if (saved.completed && !forceOnboarding) {
        // Returning user → brief splash, then straight into app / deep link.
        setShowSplash(true);
        track("onboarding_splash_view", { redirect: target, source: resolved.source });
        setHydrated(true);
        return;
      }
    } else {
      // First-time — apply smart currency default.
      setCurrency(guessCurrency());
    }

    // Deep link from product → give user choice to customize or skip onboarding.
    if (resolved.source !== "fallback" && !forceOnboarding) {
      setShowDeepPrompt(true);
      track("onboarding_deeplink_prompt_view", { redirect: target, source: resolved.source });
    }

    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (!hydrated) return;
    savePrefs({ lang, theme, currency, completed: false });
  }, [lang, theme, currency, hydrated]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
  }, [lang]);

  // ---- Analytics: session start + drop-off detection ----
  const completedRef = useRef(false);
  useEffect(() => {
    track("onboarding_start", { lang, theme, currency });
    const onLeave = () => {
      if (!completedRef.current) {
        track("onboarding_dropoff", { phase, slide, lang, theme, currency });
      }
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track each step view (phase + slide within features)
  useEffect(() => {
    track("onboarding_step_view", { phase, slide: phase === "features" ? slide : null });
  }, [phase, slide]);


  useEffect(() => {
    const tg = getTelegramMiniApp();
    if (!tg) return;
    try {
      tg.ready?.(); tg.expand?.();
      tg.setHeaderColor?.("#0C0C0C"); tg.setBackgroundColor?.("#0C0C0C");
      if (tg.viewportStableHeight) setVh(tg.viewportStableHeight);
      const onVp = () => { if (tg.viewportStableHeight) setVh(tg.viewportStableHeight); };
      tg.onEvent?.("viewportChanged", onVp);
      return () => { tg.offEvent?.("viewportChanged", onVp); };
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    const read = () => {
      const probe = document.createElement("div");
      probe.style.cssText = "position:fixed;top:0;left:0;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom) 0;visibility:hidden;pointer-events:none;";
      document.body.appendChild(probe);
      const cs = getComputedStyle(probe);
      const top = parseFloat(cs.paddingTop) || 0;
      const bottom = parseFloat(cs.paddingBottom) || 0;
      document.body.removeChild(probe);
      // Telegram already handles its own header — cap top inset so header text isn't pushed too far down.
      const inTg = !!getTelegramMiniApp();
      setInsets({ top: inTg ? Math.min(top, 4) : top, bottom });
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  const featCount = t.features.length;

  const goBack = useCallback(() => {
    haptic("light");
    track("onboarding_step_back", { phase, slide });
    if (phase === "features") { if (slide > 0) setSlide(slide - 1); return; }
    if (phase === "language") { setPhase("features"); setSlide(featCount - 1); return; }
    if (phase === "theme") { setPhase("language"); return; }
    if (phase === "currency") { setPhase("theme"); return; }
  }, [phase, slide, featCount]);

  const goNextFromFeatures = useCallback(() => {
    haptic("medium");
    track("onboarding_step_next", { from: "features", slide });
    setPhase("language");
  }, [slide]);

  const finishOnboarding = useCallback(() => {
    haptic("success");
    completedRef.current = true;
    track("onboarding_complete", { lang, theme, currency, redirect: redirectTo, variant: variantRef.current });
    savePrefs({ lang, theme, currency, completed: true });
    setExiting(true);
    window.setTimeout(() => navigate({ to: redirectTo }), 620);
  }, [lang, theme, currency, navigate, redirectTo]);



  const advance = useCallback(() => {
    haptic("medium");
    track("onboarding_step_next", { from: phase });
    if (phase === "language") return setPhase("theme");
    if (phase === "theme") return setPhase("currency");
    if (phase === "currency") return finishOnboarding();
  }, [phase, finishOnboarding]);

  const onPrimary = useCallback(() => {
    if (phase === "features") { goNextFromFeatures(); return; }
    advance();
  }, [phase, advance, goNextFromFeatures]);

  const canBack = !(phase === "features" && slide === 0);

  useEffect(() => {
    const tg = getTelegramMiniApp();
    if (!tg?.BackButton || !isTelegramVersionAtLeast(tg, "6.1")) return;
    if (canBack) tg.BackButton.show(); else tg.BackButton.hide();
    tg.BackButton.onClick(goBack);
    return () => { tg.BackButton.offClick(goBack); };
  }, [canBack, goBack]);

  const minH = vh ? `${vh}px` : "100dvh";
  const mc = MICROCOPY[variantRef.current];
  const primaryLabel = phase === "features"
    ? (mc.getStarted ?? t.getStarted)
    : phase === "currency" ? (mc.finish ?? t.finish) : (mc.continue ?? t.continue);

  const enterRedirect = useCallback(() => {
    track("onboarding_splash_autoenter", { redirect: redirectTo });
    navigate({ to: redirectTo });
  }, [navigate, redirectTo]);

  // Splash for returning users (only 1st scene, no buttons, auto-exits).
  if (showSplash) {
    return (
      <ReturningUserSplash
        minH={minH}
        insets={insets}
        title={t.features[0].title}
        onDone={enterRedirect}
      />
    );
  }

  // Deep-link prompt for new users arriving from a product deep link.
  if (showDeepPrompt) {
    return (
      <DeepLinkOnboardingPrompt
        minH={minH}
        insets={insets}
        redirectTo={redirectTo}
        onSkip={() => {
          haptic("light");
          track("onboarding_deeplink_skip", { redirect: redirectTo });
          savePrefs({ lang, theme, currency, completed: true });
          navigate({ to: redirectTo });
        }}
        onCustomize={() => {
          haptic("medium");
          track("onboarding_deeplink_customize", { redirect: redirectTo });
          setShowDeepPrompt(false);
        }}
      />
    );
  }


  return (
    <motion.div
      animate={exiting ? { opacity: 0, scale: 0.985, filter: "blur(6px)" } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      className="relative w-full flex justify-center overflow-hidden"
      style={{
        height: minH,
        background: "#0C0C0C",
        fontFamily: "'Kanit', 'Noto Sans Devanagari', sans-serif",
        color: "#D7E2EA",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <div className="relative w-full max-w-[440px] flex flex-col px-6 pt-3 pb-6" style={{ overflowX: "clip", height: `calc(${minH} - ${insets.top + insets.bottom}px)` }}>
        {/* Top bar — back only */}
        <div className="flex items-center justify-between h-9 shrink-0 relative z-20">
          <button
            onClick={goBack}
            disabled={!canBack}
            aria-label={t.back}
            className="h-9 w-9 -ms-2 grid place-items-center rounded-full transition-opacity disabled:opacity-0 disabled:pointer-events-none hover:bg-white/5"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <div />
          <div className="h-9 w-9" />
        </div>

        <StepBar phase={phase} />




        <div className="flex-1 flex flex-col mt-1 min-h-0">
          <AnimatePresence mode="wait">
            {phase === "features" && (
              <FeatureCarousel
                key="feat"
                slide={slide}
                setSlide={setSlide}
                onOverflowNext={goNextFromFeatures}
                features={t.features}
              />
            )}
            {phase === "language" && (
              <SelectPane
                key="lang"
                title={t.langTitle}
                subtitle={t.langSub}
                options={(Object.keys(LANG_META) as LangId[]).map((id) => ({
                  id, label: LANG_META[id].label, sub: LANG_META[id].sub,
                }))}
                value={lang}
                onChange={(v) => { haptic("select"); setLang(v as LangId); track("onboarding_select_language", { value: v }); }}
              />
            )}
            {phase === "theme" && (
              <SelectPane
                key="theme"
                title={t.themeTitle}
                subtitle={t.themeSub}
                options={THEME_IDS.map((id) => ({
                  id,
                  label: t.themes[id].label,
                  sub: t.themes[id].sub,
                  accessory: <ThemeSwatch colors={THEME_SWATCHES[id]} />,
                }))}
                value={theme}
                onChange={(v) => { haptic("select"); setTheme(v as ThemeId); track("onboarding_select_theme", { value: v }); }}
              />
            )}
            {phase === "currency" && (
              <SelectPane
                key="cur"
                title={t.currencyTitle}
                subtitle={t.currencySub}
                headerExtra={
                  <CurrencySearch
                    value={currencyQuery}
                    onChange={(v: string) => {
                      setCurrencyQuery(v);
                      if (v.trim().length >= 2) track("onboarding_currency_search", { q: v.slice(0, 24) });
                    }}
                  />

                }
                options={CURRENCIES.filter((c) => {
                  const q = currencyQuery.trim().toLowerCase();
                  if (!q) return true;
                  return c.label.toLowerCase().includes(q) || c.sub.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
                }).map((c) => ({
                  id: c.id,
                  label: c.label,
                  sub: `${c.sub} — ${t.sample} ${formatPrice(499, c.id, lang)}`,
                  accessory: <CurrencyGlyph symbol={c.symbol} />,
                }))}
                value={currency}
                onChange={(v) => { haptic("select"); setCurrency(v as CurrencyId); track("onboarding_select_currency", { value: v }); }}
              />
            )}
          </AnimatePresence>
        </div>


        <div className="shrink-0 pt-5 flex flex-col items-center gap-4">
          {phase === "features" && (
            <ProgressDots count={featCount} active={slide} onDot={(i) => { haptic("select"); setSlide(i); }} />
          )}

          <button
            onClick={onPrimary}
            className="w-full rounded-full py-4 text-base text-white font-medium uppercase tracking-widest"
            style={{
              background: "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
              boxShadow: "0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset",
              outline: "2px solid #ffffff",
              outlineOffset: "-3px",
            }}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </motion.div>
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

function FeatureCarousel({
  slide,
  setSlide,
  onOverflowNext,
  features,
}: {
  slide: number;
  setSlide: (n: number) => void;
  onOverflowNext: () => void;
  features: { title: string; body: string }[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);
  const count = features.length;

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => setWidth(el.getBoundingClientRect().width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!width) return;
    const controls = animate(x, -slide * width, { type: "spring", stiffness: 340, damping: 34, mass: 0.9 });
    return () => controls.stop();
  }, [slide, width, x]);

  const onDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (!width) return;
    const threshold = width * 0.22;
    const v = info.velocity.x;
    // Swipe past last slide → advance phase
    if (slide === count - 1 && (info.offset.x < -threshold || v < -500)) {
      haptic("light");
      animate(x, -slide * width, { type: "spring", stiffness: 340, damping: 34 });
      onOverflowNext();
      return;
    }
    let next = slide;
    if (info.offset.x < -threshold || v < -500) next = Math.min(slide + 1, count - 1);
    else if (info.offset.x > threshold || v > 500) next = Math.max(slide - 1, 0);
    if (next !== slide) { haptic("light"); setSlide(next); }
    else animate(x, -slide * width, { type: "spring", stiffness: 340, damping: 34 });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col min-h-0"
    >
      <div ref={containerRef} className="flex-1 min-h-0 relative overflow-hidden touch-pan-y" dir="ltr">
        <motion.div
          className="absolute inset-0 flex"
          style={{ x, width: `${count * 100}%` }}
          drag="x"
          dragConstraints={{ left: -(count - 1) * width - width * 0.2, right: width * 0.2 }}
          dragElastic={0.15}
          dragMomentum={false}
          onDragEnd={onDragEnd}
        >
          {features.map((f, i) => (
            <FeatureSlide key={i} feature={f} index={i} x={x} width={width} sceneIndex={i} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

function FeatureSlide({
  feature, index, x, width, sceneIndex,
}: {
  feature: { title: string; body: string };
  index: number;
  x: ReturnType<typeof useMotionValue<number>>;
  width: number;
  sceneIndex: number;
}) {
  const range = width > 0 ? [-(index + 1) * width, -index * width, -(index - 1) * width] : [-1, 0, 1];
  const scale = useTransform(x, range, [0.9, 1, 0.9]);
  const opacity = useTransform(x, range, [0.5, 1, 0.5]);
  const Scene = SCENES[sceneIndex % SCENES.length];

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col px-1" style={{ width: width || undefined }}>
      <motion.div style={{ scale, opacity }} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex items-center justify-center min-h-0 py-4">
          <Scene />
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <h1
            className="hero-heading font-black uppercase leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(2rem, 8vw, 2.6rem)" }}
          >
            {feature.title}
          </h1>
          <p className="font-light leading-relaxed" style={{ color: "#D7E2EA", opacity: 0.7, fontSize: "0.98rem" }}>
            {feature.body}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

type Option = { id: string; label: string; sub?: string; accessory?: React.ReactNode };

function SelectPane({
  title, subtitle, options, value, onChange, headerExtra,
}: {
  title: string; subtitle: string; options: Option[]; value: string; onChange: (v: string) => void;
  headerExtra?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-1 flex flex-col min-h-0"
    >
      <div className="pt-6 pb-5 flex flex-col gap-3 shrink-0">
        <h1 className="hero-heading font-black uppercase leading-[0.95] tracking-tight" style={{ fontSize: "clamp(2rem, 9vw, 2.8rem)" }}>
          {title}
        </h1>
        <p className="font-light leading-relaxed" style={{ color: "#D7E2EA", opacity: 0.65, fontSize: "0.98rem" }}>
          {subtitle}
        </p>
        {headerExtra}
      </div>

      <div role="radiogroup" className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto pb-3 -mx-1 px-1" style={{ scrollbarWidth: "thin" }}>
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
              className="group w-full text-start rounded-3xl p-4 sm:p-5 flex items-center gap-4 transition-all"
              style={{
                border: `1px solid ${selected ? "rgba(215,226,234,0.7)" : "rgba(215,226,234,0.14)"}`,
                background: selected
                  ? "linear-gradient(140deg, rgba(182,0,168,0.16) 0%, rgba(118,33,176,0.10) 60%, rgba(12,12,12,0) 100%)"
                  : "rgba(215,226,234,0.03)",
              }}
            >
              {o.accessory && <div className="shrink-0">{o.accessory}</div>}
              <div className="flex-1 min-w-0">
                <div className="font-medium leading-tight" style={{ color: "#D7E2EA", fontSize: "1.05rem" }}>{o.label}</div>
                {o.sub && (
                  <div className="mt-1 font-light truncate" style={{ color: "#D7E2EA", opacity: 0.55, fontSize: "0.82rem" }}>{o.sub}</div>
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

function DonePane({ lang, theme, currency }: { lang: LangId; theme: ThemeId; currency: CurrencyId }) {
  const t = DICTS[lang];
  const langLabel = LANG_META[lang].label;
  const themeLabel = t.themes[theme].label;
  const currencyLabel = CURRENCIES.find((c) => c.id === currency)?.label;
  const rows = [
    { k: t.language, v: langLabel },
    { k: t.theme, v: themeLabel },
    { k: t.currency, v: currencyLabel },
  ];

  const priced = useMemo(
    () => t.stories.map((s, i) => ({ ...s, price: formatPrice(SAMPLE_PRICES_INR[i] ?? 199, currency, lang) })),
    [currency, lang, t.stories],
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
          background: "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
          boxShadow: "0 20px 60px -20px rgba(182,0,168,0.6)",
          outline: "2px solid rgba(255,255,255,0.9)",
          outlineOffset: "-3px",
        }}
      >
        <Check size={36} strokeWidth={2.5} color="#ffffff" />
      </div>
      <div className="flex flex-col gap-3 max-w-[320px]">
        <h1 className="hero-heading font-black uppercase leading-[0.95] tracking-tight" style={{ fontSize: "clamp(1.9rem, 8vw, 2.6rem)" }}>
          {t.doneTitle}
        </h1>
        <p className="font-light leading-relaxed" style={{ color: "#D7E2EA", opacity: 0.7, fontSize: "0.95rem" }}>
          {t.doneBody}
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

      <div
        className="w-full max-w-[340px] rounded-3xl p-4 flex flex-col gap-2 text-start"
        style={{
          border: "1px solid rgba(215,226,234,0.15)",
          background: "linear-gradient(140deg, rgba(182,0,168,0.10) 0%, rgba(118,33,176,0.06) 60%, rgba(12,12,12,0) 100%)",
        }}
      >
        <div className="flex items-center justify-between px-1 pb-1">
          <span className="uppercase tracking-widest font-light text-xs" style={{ opacity: 0.6 }}>{t.storePreview}</span>
          <span className="uppercase tracking-widest font-light text-xs" style={{ opacity: 0.6 }}>{currencyLabel}</span>
        </div>
        {priced.map((s) => (
          <div key={s.name} className="flex items-center justify-between rounded-2xl px-3 py-2.5" style={{ background: "rgba(215,226,234,0.04)" }}>
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

// ---------- Onboarding progress bar ----------
const PHASE_ORDER: Phase[] = ["features", "language", "theme", "currency"];
function StepBar({ phase }: { phase: Phase }) {
  const idx = Math.max(0, PHASE_ORDER.indexOf(phase));
  const pct = ((idx + 1) / PHASE_ORDER.length) * 100;
  const labels: Record<Phase, string> = {
    features: "Intro",
    language: "Language",
    theme: "Theme",
    currency: "Currency",
    done: "Done",
  };
  return (
    <div className="mt-2 mb-1 shrink-0" aria-label="Onboarding progress">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ opacity: 0.7 }}>
          {labels[phase]}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ opacity: 0.55 }}>
          {Math.min(idx + 1, PHASE_ORDER.length)} / {PHASE_ORDER.length}
        </span>
      </div>
      <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(215,226,234,0.14)" }}>
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #B600A8 0%, #7621B0 100%)",
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}

// ---------- Currency search input ----------
function CurrencySearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div
      className="flex items-center gap-2 rounded-2xl px-3 py-2.5"
      style={{
        border: "1px solid rgba(215,226,234,0.14)",
        background: "rgba(215,226,234,0.04)",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.55 }}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search currency, code or country"
        className="flex-1 min-w-0 bg-transparent text-sm outline-none"
        style={{ color: "#D7E2EA" }}
        aria-label="Search currency"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "rgba(215,226,234,0.08)", color: "#D7E2EA" }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
