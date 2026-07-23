import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, Globe, Moon, Sparkles, Sun } from "lucide-react";

type ThemeKey = "mono" | "dark" | "cream";
type LangKey = "en" | "hi";

type ThemeTokens = {
  bg: string;
  surface: string;
  border: string;
  borderStrong: string;
  text: string;
  subtext: string;
  muted: string;
  accent: string;
  accentText: string;
  ringGlow: string;
  gradient: string;
  buttonGradient: string;
  buttonText: string;
  blobA: string;
  blobB: string;
  blobC: string;
  particle: string;
  meshOverlay: string;
};

const THEMES: Record<ThemeKey, ThemeTokens> = {
  mono: {
    bg: "#000000",
    surface: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.28)",
    text: "#FFFFFF",
    subtext: "rgba(255,255,255,0.72)",
    muted: "rgba(255,255,255,0.5)",
    accent: "#FFFFFF",
    accentText: "#000000",
    ringGlow: "0 0 0 1px rgba(255,255,255,0.35), 0 20px 60px -20px rgba(255,255,255,0.35)",
    gradient: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))",
    buttonGradient: "linear-gradient(180deg, #FFFFFF 0%, #D9D9D9 100%)",
    buttonText: "#000000",
    blobA: "rgba(255,255,255,0.10)",
    blobB: "rgba(255,255,255,0.06)",
    blobC: "rgba(255,255,255,0.04)",
    particle: "rgba(255,255,255,0.55)",
    meshOverlay: "radial-gradient(60% 40% at 50% 0%, rgba(255,255,255,0.08), transparent 60%)",
  },
  dark: {
    bg: "#0C0C0C",
    surface: "#171717",
    border: "#2A2A2A",
    borderStrong: "#D7E2EA",
    text: "#F5F7FA",
    subtext: "rgba(215,226,234,0.78)",
    muted: "rgba(215,226,234,0.55)",
    accent: "#D7E2EA",
    accentText: "#0C0C0C",
    ringGlow: "0 0 0 1px #D7E2EA, 0 20px 60px -18px rgba(215,226,234,0.45)",
    gradient: "linear-gradient(180deg, rgba(215,226,234,0.10), rgba(215,226,234,0))",
    buttonGradient: "linear-gradient(180deg, #EAF2F7 0%, #B9C7D2 100%)",
    buttonText: "#0C0C0C",
    blobA: "rgba(120,80,220,0.30)",
    blobB: "rgba(0,180,220,0.22)",
    blobC: "rgba(215,226,234,0.15)",
    particle: "rgba(215,226,234,0.7)",
    meshOverlay: "radial-gradient(70% 45% at 50% 0%, rgba(120,80,220,0.18), transparent 60%)",
  },
  cream: {
    bg: "#F6EFE4",
    surface: "#FFFBF3",
    border: "rgba(90,60,30,0.12)",
    borderStrong: "#8A5A2B",
    text: "#2A1B0C",
    subtext: "rgba(42,27,12,0.72)",
    muted: "rgba(42,27,12,0.5)",
    accent: "#8A5A2B",
    accentText: "#FFFBF3",
    ringGlow: "0 0 0 1px rgba(138,90,43,0.55), 0 20px 60px -18px rgba(138,90,43,0.35)",
    gradient: "linear-gradient(180deg, rgba(138,90,43,0.10), rgba(138,90,43,0))",
    buttonGradient: "linear-gradient(180deg, #3A2410 0%, #8A5A2B 100%)",
    buttonText: "#FFFBF3",
    blobA: "rgba(214,168,110,0.45)",
    blobB: "rgba(240,220,190,0.7)",
    blobC: "rgba(138,90,43,0.18)",
    particle: "rgba(138,90,43,0.5)",
    meshOverlay: "radial-gradient(70% 45% at 50% 0%, rgba(214,168,110,0.35), transparent 60%)",
  },
};

const LANGS: { key: LangKey; label: string; native: string; sub: string }[] = [
  { key: "en", label: "English", native: "English", sub: "Global" },
  { key: "hi", label: "हिन्दी", native: "हिन्दी", sub: "भारत" },
];

const THEME_CARDS: { key: ThemeKey; name: string; desc: string; swatches: [string, string, string] }[] = [
  { key: "mono", name: "Mono", desc: "Pure black & white", swatches: ["#000000", "#7A7A7A", "#FFFFFF"] },
  { key: "dark", name: "Dark", desc: "Premium dark interface", swatches: ["#0C0C0C", "#2A2A2A", "#D7E2EA"] },
  { key: "cream", name: "Cream", desc: "Warm elegant light", swatches: ["#F6EFE4", "#D6A86E", "#8A5A2B"] },
];

const CURRENCIES = [
  { code: "INR", symbol: "₹", country: "India" },
  { code: "USD", symbol: "$", country: "United States" },
  { code: "EUR", symbol: "€", country: "Eurozone" },
  { code: "GBP", symbol: "£", country: "United Kingdom" },
  { code: "AED", symbol: "د.إ", country: "UAE" },
  { code: "JPY", symbol: "¥", country: "Japan" },
  { code: "SGD", symbol: "S$", country: "Singapore" },
  { code: "AUD", symbol: "A$", country: "Australia" },
  { code: "CAD", symbol: "C$", country: "Canada" },
  { code: "SAR", symbol: "﷼", country: "Saudi Arabia" },
];

const spring = { type: "spring" as const, stiffness: 260, damping: 28, mass: 0.9 };
const softSpring = { type: "spring" as const, stiffness: 180, damping: 24 };

export function AryaOnboarding() {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<LangKey>("en");
  const [theme, setTheme] = useState<ThemeKey>("dark");
  const [currency, setCurrency] = useState<string>("INR");
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();
  const t = THEMES[theme];

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 1 + Math.random() * 2.5,
        d: 8 + Math.random() * 14,
        delay: Math.random() * 6,
      })),
    []
  );

  return (
    <motion.div
      key={theme}
      initial={false}
      animate={{ backgroundColor: t.bg, color: t.text }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-dvh w-full overflow-hidden"
      style={{ fontFamily: "'Kanit', sans-serif" }}
    >
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <motion.div
          className="absolute -top-24 -left-24 h-[60vw] w-[60vw] rounded-full blur-3xl"
          style={{ background: t.blobA }}
          animate={reduced ? undefined : { x: [0, 30, -10, 0], y: [0, 20, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-24 h-[55vw] w-[55vw] rounded-full blur-3xl"
          style={{ background: t.blobB }}
          animate={reduced ? undefined : { x: [0, -20, 20, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 left-1/4 h-[70vw] w-[70vw] rounded-full blur-3xl"
          style={{ background: t.blobC }}
          animate={reduced ? undefined : { x: [0, 15, -15, 0], y: [0, -20, 10, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0" style={{ background: t.meshOverlay }} />
        {!reduced &&
          particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.s,
                height: p.s,
                background: t.particle,
                boxShadow: `0 0 ${p.s * 4}px ${t.particle}`,
              }}
              animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: p.d, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
            />
          ))}
      </div>

      {/* Content shell */}
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-[max(env(safe-area-inset-top),1rem)] pb-[calc(max(env(safe-area-inset-bottom),1rem)+7.5rem)]">
        <Header step={step} total={2} t={t} />

        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <motion.section
              key="p1"
              initial={{ opacity: 0, x: 40, filter: "blur(12px)", scale: 0.98 }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, x: -40, filter: "blur(12px)", scale: 0.98 }}
              transition={spring}
              className="flex flex-1 flex-col"
            >
              <HeroIllustration t={t} />
              <Titles
                t={t}
                eyebrow="Step 01"
                title="Welcome to Arya Premium"
                desc="Choose your preferred language and appearance to personalize your experience."
              />

              <SectionLabel t={t} icon={<Globe size={12} />}>Language</SectionLabel>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {LANGS.map((l, i) => (
                  <SelectCard
                    key={l.key}
                    t={t}
                    selected={lang === l.key}
                    onClick={() => setLang(l.key)}
                    index={i}
                    ariaLabel={`Select language ${l.label}`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-lg font-semibold tracking-tight" style={{ color: t.text }}>
                        {l.native}
                      </span>
                      <span className="mt-1 text-[10px] uppercase tracking-[0.18em]" style={{ color: t.muted }}>
                        {l.sub}
                      </span>
                    </div>
                  </SelectCard>
                ))}
              </div>

              <SectionLabel t={t} icon={<Sparkles size={12} />} className="mt-7">
                Appearance
              </SectionLabel>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {THEME_CARDS.map((c, i) => (
                  <SelectCard
                    key={c.key}
                    t={t}
                    selected={theme === c.key}
                    onClick={() => setTheme(c.key)}
                    index={i}
                    compact
                    ariaLabel={`Select theme ${c.name}`}
                  >
                    <div className="flex w-full flex-col items-start gap-2">
                      <div className="flex gap-1">
                        {c.swatches.map((s, si) => (
                          <span
                            key={si}
                            className="h-4 w-4 rounded-full"
                            style={{ background: s, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)" }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {c.key === "mono" && <Sun size={12} style={{ color: t.muted }} />}
                        {c.key === "dark" && <Moon size={12} style={{ color: t.muted }} />}
                        {c.key === "cream" && <Sun size={12} style={{ color: t.muted }} />}
                        <span className="text-sm font-semibold" style={{ color: t.text }}>
                          {c.name}
                        </span>
                      </div>
                      <span className="text-[10px] leading-tight" style={{ color: t.muted }}>
                        {c.desc}
                      </span>
                    </div>
                  </SelectCard>
                ))}
              </div>
            </motion.section>
          )}

          {step === 1 && (
            <motion.section
              key="p2"
              initial={{ opacity: 0, x: 40, filter: "blur(12px)", scale: 0.98 }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, x: -40, filter: "blur(12px)", scale: 0.98 }}
              transition={spring}
              className="flex flex-1 flex-col"
            >
              <CurrencyHero t={t} symbol={CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹"} />
              <Titles
                t={t}
                eyebrow="Step 02"
                title="Choose Your Currency"
                desc="Select your preferred currency for pricing across Arya Premium."
              />
              <div className="mt-4 grid grid-cols-2 gap-3">
                {CURRENCIES.map((c, i) => (
                  <CurrencyCard
                    key={c.code}
                    t={t}
                    index={i}
                    selected={currency === c.code}
                    onClick={() => setCurrency(c.code)}
                    code={c.code}
                    symbol={c.symbol}
                    country={c.country}
                  />
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky bottom bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md px-6"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.25rem)" }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 -top-10 h-16"
          style={{ background: `linear-gradient(180deg, transparent, ${t.bg})` }}
        />
        <PrimaryButton
          t={t}
          onClick={() => {
            if (step === 0) setStep(1);
            else setDone(true);
          }}
          label={step === 0 ? "Continue" : "Enter Arya Premium"}
        />
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            className="fixed inset-0 z-30 flex items-center justify-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: `${t.bg}CC`, backdropFilter: "blur(20px)" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={softSpring}
              className="w-full max-w-sm rounded-3xl p-8 text-center"
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                boxShadow: "0 30px 80px -20px rgba(0,0,0,0.5)",
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...softSpring, delay: 0.1 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: t.buttonGradient }}
              >
                <Check size={28} strokeWidth={2.5} style={{ color: t.buttonText }} />
              </motion.div>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight" style={{ color: t.text }}>
                You're all set
              </h3>
              <p className="mt-2 text-sm" style={{ color: t.subtext }}>
                Arya Premium is tuned for {LANGS.find((l) => l.key === lang)?.label}, {theme} theme, and{" "}
                {currency}.
              </p>
              <button
                onClick={() => {
                  setDone(false);
                  setStep(0);
                }}
                className="mt-6 text-xs uppercase tracking-[0.24em]"
                style={{ color: t.muted }}
              >
                Restart
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Header({ step, total, t }: { step: number; total: number; t: ThemeTokens }) {
  return (
    <div className="flex items-center justify-between pb-6">
      <div className="flex items-center gap-2">
        <motion.div
          layoutId="arya-badge"
          className="flex h-9 w-9 items-center justify-center rounded-2xl"
          style={{
            background: t.buttonGradient,
            boxShadow: "0 10px 30px -12px rgba(0,0,0,0.5)",
          }}
        >
          <Sparkles size={16} style={{ color: t.buttonText }} />
        </motion.div>
        <div className="flex flex-col leading-none">
          <span className="text-[10px] uppercase tracking-[0.24em]" style={{ color: t.muted }}>
            Arya
          </span>
          <span className="text-sm font-semibold tracking-tight" style={{ color: t.text }}>
            Premium
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <motion.span
            key={i}
            animate={{
              width: i === step ? 22 : 8,
              backgroundColor: i <= step ? t.accent : t.border,
            }}
            transition={softSpring}
            className="h-1.5 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

function Titles({
  t,
  eyebrow,
  title,
  desc,
}: {
  t: ThemeTokens;
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }}
      className="mt-2"
    >
      <motion.span
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        transition={softSpring}
        className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.24em]"
        style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.muted }}
      >
        {eyebrow}
      </motion.span>
      <motion.h1
        variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
        transition={softSpring}
        className="mt-3 text-[32px] font-semibold leading-[1.05] tracking-tight"
        style={{ color: t.text }}
      >
        {title}
      </motion.h1>
      <motion.p
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        transition={softSpring}
        className="mt-3 text-[15px] leading-relaxed"
        style={{ color: t.subtext }}
      >
        {desc}
      </motion.p>
    </motion.div>
  );
}

function SectionLabel({
  t,
  icon,
  children,
  className = "",
}: {
  t: ThemeTokens;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-6 flex items-center gap-2 ${className}`}>
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full"
        style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.muted }}
      >
        {icon}
      </span>
      <span className="text-[10px] uppercase tracking-[0.28em]" style={{ color: t.muted }}>
        {children}
      </span>
    </div>
  );
}

function SelectCard({
  t,
  selected,
  onClick,
  children,
  index,
  compact = false,
  ariaLabel,
}: {
  t: ThemeTokens;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  index: number;
  compact?: boolean;
  ariaLabel?: string;
}) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={selected}
      onClick={onClick}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...softSpring, delay: 0.06 * index }}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      className={`relative overflow-hidden rounded-2xl text-left ${compact ? "p-3" : "p-4"}`}
      style={{
        background: t.surface,
        border: `1px solid ${selected ? t.borderStrong : t.border}`,
        boxShadow: selected ? t.ringGlow : "0 2px 12px -6px rgba(0,0,0,0.25)",
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: selected ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ background: t.gradient }}
      />
      <div className="relative flex items-start justify-between gap-2">
        {children}
        <AnimatePresence>
          {selected && (
            <motion.span
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={softSpring}
              className="flex h-5 w-5 flex-none items-center justify-center rounded-full"
              style={{ background: t.accent }}
            >
              <Check size={12} strokeWidth={3} style={{ color: t.accentText }} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

function CurrencyCard({
  t,
  selected,
  onClick,
  code,
  symbol,
  country,
  index,
}: {
  t: ThemeTokens;
  selected: boolean;
  onClick: () => void;
  code: string;
  symbol: string;
  country: string;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      aria-label={`Select ${code}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...softSpring, delay: 0.04 * index }}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-2xl p-4 text-left"
      style={{
        background: t.surface,
        border: `1px solid ${selected ? t.borderStrong : t.border}`,
        boxShadow: selected ? t.ringGlow : "0 2px 12px -6px rgba(0,0,0,0.25)",
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: selected ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ background: t.gradient }}
      />
      <div className="relative flex items-start justify-between">
        <span className="text-3xl font-semibold leading-none" style={{ color: t.text }}>
          {symbol}
        </span>
        <AnimatePresence>
          {selected && (
            <motion.span
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={softSpring}
              className="flex h-5 w-5 items-center justify-center rounded-full"
              style={{ background: t.accent }}
            >
              <Check size={12} strokeWidth={3} style={{ color: t.accentText }} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="relative mt-6">
        <div className="text-sm font-semibold tracking-tight" style={{ color: t.text }}>
          {code}
        </div>
        <div className="text-[11px]" style={{ color: t.muted }}>
          {country}
        </div>
      </div>
    </motion.button>
  );
}

function PrimaryButton({ t, onClick, label }: { t: ThemeTokens; onClick: () => void; label: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      transition={softSpring}
      className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-4 text-[15px] font-semibold tracking-wide"
      style={{
        background: t.buttonGradient,
        color: t.buttonText,
        boxShadow: "0 20px 40px -18px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
      }}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ x: "-100%" }}
        animate={{ x: "120%" }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
        }}
      />
      <span className="relative">{label}</span>
      <ChevronRight size={18} className="relative" strokeWidth={2.5} />
    </motion.button>
  );
}

function HeroIllustration({ t }: { t: ThemeTokens }) {
  return (
    <div className="relative mx-auto mb-2 mt-2 h-40 w-full">
      <motion.div
        className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-[2rem]"
        animate={{ rotate: [0, 8, -6, 0], y: [0, -6, 4, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: t.buttonGradient,
          boxShadow: "0 40px 80px -30px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      />
      <motion.div
        className="absolute left-[18%] top-6 h-16 w-16 rounded-3xl"
        animate={{ rotate: [0, -12, 6, 0], y: [0, 10, -6, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          boxShadow: "0 20px 40px -20px rgba(0,0,0,0.5)",
        }}
      />
      <motion.div
        className="absolute right-[16%] top-14 h-12 w-12 rounded-2xl"
        animate={{ rotate: [0, 14, -8, 0], y: [0, -8, 6, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: t.accent,
          opacity: 0.85,
          boxShadow: "0 20px 40px -20px rgba(0,0,0,0.5)",
        }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: t.accent, filter: "blur(30px)" }}
      />
    </div>
  );
}

function CurrencyHero({ t, symbol }: { t: ThemeTokens; symbol: string }) {
  return (
    <div className="relative mx-auto mb-1 mt-1 flex h-28 w-full items-center justify-center">
      <motion.div
        className="absolute h-24 w-24 rounded-full"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: t.accent, filter: "blur(40px)", opacity: 0.5 }}
      />
      <motion.div
        key={symbol}
        initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={softSpring}
        className="relative flex h-24 w-24 items-center justify-center rounded-3xl"
        style={{
          background: t.buttonGradient,
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      >
        <span className="text-4xl font-semibold" style={{ color: t.buttonText }}>
          {symbol}
        </span>
      </motion.div>
    </div>
  );
}
