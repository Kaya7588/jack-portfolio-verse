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
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col items-center gap-8 px-6 w-full max-w-[440px]"
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

export default ReturningUserSplash;
