"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { SCENES } from "@/components/arya/Scenes";

/**
 * ReturningUserSplash
 * -------------------
 * Shown to returning users (or on any "app opening" moment) for a short
 * duration and then auto-exits via `onDone`. Renders only the first scene
 * from `SCENES` with a linear progress bar — no buttons, no interaction.
 *
 * Reusable across mini-apps: pass your own `title`, `durationMs`, and
 * `onDone` handler.
 */
export interface ReturningUserSplashProps {
  title: string;
  minH?: string;
  insets?: { top: number; bottom: number };
  durationMs?: number;
  onDone?: () => void;
}

const OPENING_CARDS = [
  { emoji: "🎧", title: "Audio", sub: "Ready" },
  { emoji: "⚡", title: "Instant", sub: "Delivery" },
  { emoji: "💬", title: "Support", sub: "Live" },
  { emoji: "✅", title: "Access", sub: "Synced" },
  { emoji: "⭐", title: "Premium", sub: "Unlocked" },
  { emoji: "🙌", title: "Welcome", sub: "Back" },
];

const FLOATING_EMOJIS = ["🎧", "💬", "✅", "🙌", "❤️", "⭐", "⚡", "🚀"];

const EMOJI_POSITIONS = [
  { left: 7, top: 22 },
  { left: 78, top: 22 },
  { left: 12, top: 43 },
  { left: 80, top: 45 },
  { left: 8, top: 64 },
  { left: 77, top: 66 },
  { left: 37, top: 18 },
  { left: 58, top: 72 },
];

export function ReturningUserSplash({
  title,
  minH = "100dvh",
  insets = { top: 0, bottom: 0 },
  durationMs = 3200,
  onDone,
}: ReturningUserSplashProps) {
  const FirstScene = SCENES[0];

  useEffect(() => {
    if (!onDone) return;
    const id = window.setTimeout(onDone, durationMs);
    return () => window.clearTimeout(id);
  }, [durationMs, onDone]);

  return (
    <div
      className="relative w-full flex flex-col items-center justify-center overflow-hidden"
      style={{
        height: minH,
        background: "#0C0C0C",
        color: "#D7E2EA",
        fontFamily: "'Kanit', 'Noto Sans Devanagari', sans-serif",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {FLOATING_EMOJIS.map((emoji, i) => (
          <motion.div
            key={`${emoji}-${i}`}
            className="absolute grid place-items-center rounded-3xl text-[30px]"
            initial={{ opacity: 0, scale: 0.72, y: 18, rotate: -8 }}
            animate={{
              opacity: [0, 1, 0.82, 1],
              scale: [0.72, 1, 0.94, 1],
              y: [18, -10, 8, -14],
              rotate: [-8, 8, -5, 6],
            }}
            transition={{ duration: 4.4 + i * 0.18, repeat: Infinity, ease: "easeInOut", delay: i * 0.16 }}
            style={{
              left: `${EMOJI_POSITIONS[i]?.left ?? 10}%`,
              top: `${EMOJI_POSITIONS[i]?.top ?? 20}%`,
              width: 58,
              height: 58,
              background: "linear-gradient(145deg, rgba(255,255,255,0.26), rgba(255,255,255,0.08))",
              border: "1px solid rgba(255,255,255,0.26)",
              boxShadow:
                "0 22px 40px -16px rgba(182,0,168,0.82), inset 0 10px 14px rgba(255,255,255,0.22), inset 0 -12px 18px rgba(0,0,0,0.30)",
              filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.52))",
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 flex w-full max-w-[440px] flex-col items-center gap-6 px-6"
      >
        <div className="w-full flex items-center justify-center">
          <FirstScene />
        </div>
        <h1
          className="hero-heading font-black uppercase leading-[0.95] tracking-tight text-center"
          style={{ fontSize: "clamp(1.8rem, 7vw, 2.4rem)" }}
        >
          {title}
        </h1>

        <div className="w-full overflow-hidden" aria-label="Opening status">
          <motion.div
            className="flex gap-3"
            animate={{ x: [0, -408] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: "linear" }}
          >
            {[...OPENING_CARDS, ...OPENING_CARDS].map((card, i) => (
              <div
                key={`${card.title}-${i}`}
                className="flex h-[82px] min-w-[124px] items-center gap-3 rounded-3xl px-3"
                style={{
                  background: "linear-gradient(145deg, rgba(215,226,234,0.13), rgba(215,226,234,0.035))",
                  border: "1px solid rgba(215,226,234,0.16)",
                  boxShadow: "inset 0 10px 16px rgba(255,255,255,0.06), inset 0 -12px 18px rgba(0,0,0,0.22)",
                }}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-[23px]" style={{ background: "rgba(255,255,255,0.10)" }}>
                  {card.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-bold uppercase leading-tight tracking-wider text-white">{card.title}</span>
                  <span className="block truncate text-[11px] font-medium uppercase tracking-wider" style={{ color: "rgba(215,226,234,0.58)" }}>{card.sub}</span>
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        <div
          className="h-1 w-40 rounded-full overflow-hidden"
          style={{ background: "rgba(215,226,234,0.14)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: durationMs / 1000, ease: "linear" }}
            style={{ height: "100%", background: "linear-gradient(90deg,#B600A8,#7621B0)" }}
          />
        </div>
      </motion.div>
    </div>
  );
}

export const AppOpeningScreen = ReturningUserSplash;

export default ReturningUserSplash;
