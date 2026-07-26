"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "taxiing" | "takeoff" | "resetting";

function Airplane({ isDark }: { isDark: boolean }) {
  const bodyTop = isDark ? "#ececec" : "#c8c8c8";
  const bodyMid = isDark ? "#ffffff" : "#dedede";
  const bodyBot = isDark ? "#d0d0d0" : "#b4b4b4";
  const wingLight = isDark ? "#f8f8f8" : "#d8d8d8";
  const wingDark = isDark ? "#bababa" : "#909090";
  const tail = isDark ? "#c8c8c8" : "#a8a8a8";
  const nose = isDark ? "#f4f4f4" : "#d8d8d8";
  return (
    <svg width="56" height="56" viewBox="0 0 100 100" style={{ transform: "rotate(90deg)" }}>
      <defs>
        <linearGradient id="rl-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bodyTop} />
          <stop offset="40%" stopColor={bodyMid} />
          <stop offset="100%" stopColor={bodyBot} />
        </linearGradient>
        <linearGradient id="rl-wing-t" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={wingLight} />
          <stop offset="100%" stopColor={wingDark} />
        </linearGradient>
        <linearGradient id="rl-wing-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={wingLight} />
          <stop offset="100%" stopColor={wingDark} />
        </linearGradient>
      </defs>
      {/* Top wing */}
      <path d="M50 42 L20 58 L46 58 Z" fill="url(#rl-wing-t)" />
      {/* Bottom wing */}
      <path d="M50 58 L80 58 L54 42 Z" fill="url(#rl-wing-b)" opacity="0.9" />
      {/* Tail stabiliser */}
      <path d="M50 82 L40 92 L60 92 Z" fill={tail} />
      {/* Fuselage */}
      <path d="M50 12 C56 12 60 22 60 44 L60 82 L40 82 L40 44 C40 22 44 12 50 12 Z" fill="url(#rl-body)" />
      {/* Nose */}
      <path d="M50 12 C54 12 58 18 58 26 L42 26 C42 18 46 12 50 12 Z" fill={nose} />
      {/* Cockpit */}
      <ellipse cx="50" cy="28" rx="5" ry="7" fill="#4a90e2" opacity="0.75" />
    </svg>
  );
}

export default function RunwayLoader() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("taxiing");
  const [, setCycle] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | undefined>(undefined);
  const aliveRef = useRef(true);
  const disappearedRef = useRef(false);
  const WALL_PCT = 91;

  useEffect(() => {
    const detect = () => {
      const el = containerRef.current?.closest("[data-card-theme]") as HTMLElement | null;
      if (el) setIsDark(el.getAttribute("data-card-theme") === "dark");
      else setIsDark(document.documentElement.classList.contains("dark") || true);
    };
    detect();
    const obs = new MutationObserver(detect);
    if (containerRef.current) {
      const t = containerRef.current.closest("[data-card-theme]");
      if (t) obs.observe(t, { attributes: true });
    }
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    disappearedRef.current = false;
    const TAXI_MS = 5500;
    const tick = (ts: number) => {
      if (!aliveRef.current) return;
      if (!startRef.current) startRef.current = ts;
      const t = Math.min((ts - startRef.current) / TAXI_MS, 1);
      const eased =
        t <= 0.75 ? (t / 0.75) * 82 : 82 + (1 - Math.pow(1 - (t - 0.75) / 0.25, 2)) * 18;
      const p = Math.min(eased, 100);
      setProgress(p);
      if (p >= WALL_PCT && !disappearedRef.current) {
        disappearedRef.current = true;
        setPhase("takeoff");
      }
      if (p < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setPhase("resetting");
          setTimeout(() => {
            disappearedRef.current = false;
            startRef.current = undefined;
            setProgress(0);
            setPhase("taxiing");
            setCycle((c) => c + 1);
            rafRef.current = requestAnimationFrame(tick);
          }, 400);
        }, 600);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      aliveRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const planePct = Math.min(progress, WALL_PCT);

  const trackBg = isDark
    ? "linear-gradient(to bottom, #404040, #252525)"
    : "linear-gradient(to bottom, #bab7b2, #a09d98)";
  const trackShadow = isDark
    ? "inset 0 4px 12px rgba(0,0,0,0.85), inset 0 -1px 3px rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.5)"
    : "inset 0 3px 8px rgba(0,0,0,0.22), inset 0 -1px 3px rgba(255,255,255,0.28), 0 2px 5px rgba(0,0,0,0.12)";
  const dashColor = isDark ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.42)";

  return (
    <div
      ref={containerRef}
      data-card-theme={isDark ? "dark" : "light"}
      className="w-full max-w-[340px] flex flex-col items-center justify-center gap-6 py-6"
    >
      <div
        className="relative w-full rounded-full"
        style={{ height: 64, background: trackBg, boxShadow: trackShadow, overflow: "hidden" }}
      >
        {/* Centreline dashes */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-6"
          style={{ pointerEvents: "none" }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              style={{
                width: 14,
                height: 3,
                borderRadius: 2,
                background: dashColor,
              }}
            />
          ))}
        </div>

        {/* Red fill */}
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #b00020, #ff1f3d)",
            boxShadow: "inset 0 -6px 12px rgba(0,0,0,0.35), inset 0 4px 10px rgba(255,255,255,0.18)",
          }}
        />

        {/* Exhaust shimmer */}
        {phase === "taxiing" && progress > 30 && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              left: `calc(${planePct}% - 60px)`,
              width: 40,
              height: 18,
              borderRadius: 999,
              background: "radial-gradient(ellipse, rgba(255,220,180,0.55), rgba(255,220,180,0))",
              filter: "blur(2px)",
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}

        {/* Plane */}
        <AnimatePresence>
          {phase !== "resetting" && (
            <motion.div
              key="plane"
              className="absolute top-1/2"
              style={{ left: `${planePct}%` }}
              initial={false}
              animate={
                phase === "taxiing"
                  ? { x: "-50%", y: "-50%", scale: 1, opacity: 1 }
                  : { x: "40%", y: "-160%", scale: 1.5, opacity: 0 }
              }
              transition={
                phase === "taxiing"
                  ? { type: "tween", duration: 0.1 }
                  : { duration: 0.55, ease: [0.4, 0, 0.2, 1] }
              }
              exit={{ opacity: 0 }}
            >
              <Airplane isDark={isDark} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-baseline gap-0.5">
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: isDark ? "#fff" : "#111",
              lineHeight: 1,
            }}
          >
            {Math.round(progress)}
          </span>
          <span style={{ fontSize: 16, fontWeight: 600, color: isDark ? "#bbb" : "#555" }}>%</span>
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: isDark ? "rgba(215,226,234,0.7)" : "rgba(0,0,0,0.6)",
          }}
        >
          {phase === "takeoff" ? "Taking off!" : phase === "resetting" ? "—" : "Preparing for takeoff"}
        </div>
      </div>
    </div>
  );
}
