import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

const CURRENCIES = [
  { id: "inr", label: "INR", sub: "Indian Rupee", symbol: "₹" },
  { id: "usd", label: "USD", sub: "US Dollar", symbol: "$" },
  { id: "eur", label: "EUR", sub: "Euro", symbol: "€" },
  { id: "gbp", label: "GBP", sub: "British Pound", symbol: "£" },
];

function OnboardingPage() {
  const [phase, setPhase] = useState<Phase>("features");
  const [slide, setSlide] = useState(0);
  const [lang, setLang] = useState<string>("en");
  const [theme, setTheme] = useState<string>("dark");
  const [currency, setCurrency] = useState<string>("inr");

  const goBack = () => {
    if (phase === "features") {
      if (slide > 0) setSlide(slide - 1);
      return;
    }
    if (phase === "language") { setPhase("features"); setSlide(FEATURES.length - 1); return; }
    if (phase === "theme") { setPhase("language"); return; }
    if (phase === "currency") { setPhase("theme"); return; }
    if (phase === "done") { setPhase("currency"); return; }
  };

  const advance = () => {
    if (phase === "features") {
      if (slide < FEATURES.length - 1) setSlide(slide + 1);
      else setPhase("language");
      return;
    }
    if (phase === "language") return setPhase("theme");
    if (phase === "theme") return setPhase("currency");
    if (phase === "currency") return setPhase("done");
  };

  const canBack = !(phase === "features" && slide === 0);
  const showSkip = phase !== "done";

  return (
    <div
      className="relative w-full min-h-screen flex justify-center"
      style={{ background: "#0C0C0C", fontFamily: "'Kanit', sans-serif", color: "#D7E2EA" }}
    >
      {/* Telegram Mini App viewport frame */}
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col px-6 pt-6 pb-8" style={{ overflowX: "clip" }}>
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
            onClick={() => setPhase("done")}
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
              <FeaturePane key={`f-${slide}`} slide={slide} setSlide={setSlide} />
            )}
            {phase === "language" && (
              <SelectPane
                key="lang"
                title="Choose your Language"
                subtitle="Pick the language you're most comfortable with. You can change this later in Settings."
                options={LANGUAGES.map((l) => ({ id: l.id, label: l.label, sub: l.sub }))}
                value={lang}
                onChange={setLang}
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
                onChange={setTheme}
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
                  sub: c.sub,
                  accessory: <CurrencyGlyph symbol={c.symbol} />,
                }))}
                value={currency}
                onChange={setCurrency}
              />
            )}
            {phase === "done" && <DonePane key="done" lang={lang} theme={theme} currency={currency} />}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="shrink-0 pt-6 flex flex-col items-center gap-5">
          {phase === "features" && (
            <div className="flex items-center gap-2" aria-hidden>
              {FEATURES.map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === slide ? 28 : 8,
                    background: i === slide ? "#D7E2EA" : "rgba(215,226,234,0.25)",
                  }}
                />
              ))}
            </div>
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
              onClick={() => { setPhase("features"); setSlide(0); }}
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

function FeaturePane({ slide, setSlide }: { slide: number; setSlide: (n: number) => void }) {
  const f = FEATURES[slide];
  return (
    <motion.div
      key={slide}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-1 flex flex-col min-h-0"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragEnd={(_, info) => {
        if (info.offset.x < -60 && slide < FEATURES.length - 1) setSlide(slide + 1);
        else if (info.offset.x > 60 && slide > 0) setSlide(slide - 1);
      }}
    >
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
            key={f.img}
            src={f.img}
            alt=""
            width={768}
            height={768}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ scale: 1.06, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="hero-heading font-black uppercase leading-[0.95] tracking-tight"
          style={{ fontSize: "clamp(2rem, 8vw, 2.6rem)" }}
        >
          {f.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          className="font-light leading-relaxed"
          style={{ color: "#D7E2EA", opacity: 0.7, fontSize: "0.98rem" }}
        >
          {f.body}
        </motion.p>
      </div>
    </motion.div>
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-1 flex flex-col items-center justify-center text-center gap-8 py-8"
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
          style={{ fontSize: "clamp(2rem, 9vw, 2.8rem)" }}
        >
          You&apos;re all set
        </h1>
        <p className="font-light leading-relaxed" style={{ color: "#D7E2EA", opacity: 0.7, fontSize: "0.98rem" }}>
          Welcome to Arya Premium. Your personal audio &amp; video story store is ready inside Telegram.
        </p>
      </div>
      <div
        className="w-full max-w-[320px] rounded-3xl p-5 flex flex-col gap-3"
        style={{ border: "1px solid rgba(215,226,234,0.15)", background: "rgba(215,226,234,0.03)" }}
      >
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between text-sm">
            <span className="uppercase tracking-widest font-light" style={{ opacity: 0.55 }}>{r.k}</span>
            <span className="font-medium">{r.v}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
