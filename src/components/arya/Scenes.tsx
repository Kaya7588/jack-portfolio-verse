import { motion, useMotionValue, useSpring, useTransform, type Transition } from "framer-motion";
import { useRef, type ReactNode } from "react";

/**
 * Inline "3D" scenes — no bitmap images (except Welcome demo avatar cards).
 * Payments / Delivery / Support include subtle mouse-following 3D tilt.
 */

const EASE_IN_OUT: Transition["ease"] = "easeInOut";
const float = (delay = 0, y = 8) => ({
  animate: { y: [0, -y, 0] },
  transition: { duration: 4 + delay, repeat: Infinity, ease: EASE_IN_OUT, delay } as Transition,
});

function Panel({ children, tilt = false }: { children: ReactNode; tilt?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 140, damping: 14, mass: 0.4 });
  const sry = useSpring(ry, { stiffness: 140, damping: 14, mass: 0.4 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!tilt || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 14);
    rx.set(-py * 14);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative w-full aspect-square max-w-[320px] rounded-[40px] overflow-hidden"
      style={{
        border: "1px solid rgba(215, 226, 234, 0.15)",
        background:
          "radial-gradient(120% 100% at 50% 0%, rgba(118,33,176,0.35) 0%, rgba(12,12,12,0) 55%), radial-gradient(80% 60% at 50% 100%, rgba(190,76,0,0.18) 0%, rgba(12,12,12,0) 60%), #0C0C0C",
        boxShadow: "0 40px 120px -40px rgba(182,0,168,0.35)",
        perspective: 900,
        rotateX: tilt ? srx : 0,
        rotateY: tilt ? sry : 0,
        transformStyle: "preserve-3d",
      }}
    >
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="glow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#B600A8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0C0C0C" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="185" r="150" fill="url(#glow)" />
      </svg>
      {children}
    </motion.div>
  );
}

/* ---------- Scene 1: Welcome — stacked card carousel (no text) ---------- */
import { StackedCardCarousel } from "./StackedCardCarousel";

export function WelcomeScene() {
  return (
    <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
      <StackedCardCarousel />
    </div>
  );
}


/* ---------- Scene 2: Payment integrations ---------- */
export { IntegrationsScene } from "./IntegrationsScene";
import { IntegrationsScene } from "./IntegrationsScene";
import SupportWall from "./SupportWall";
import RunwayLoader from "./RunwayLoader";

export function LegacyPaymentsScene() {

  return (
    <Panel tilt>
      <div className="absolute inset-0 grid place-items-center">
        <motion.div {...float(0.2, 6)} className="absolute" style={{ translateY: -20 }}>
          <div
            className="h-[110px] w-[176px] rounded-2xl relative"
            style={{
              transform: "rotate(-10deg)",
              background: "linear-gradient(135deg, #7621B0 0%, #B600A8 60%, #BE4C00 100%)",
              boxShadow: "0 24px 40px -14px rgba(182,0,168,0.55), inset 0 -8px 16px rgba(0,0,0,0.35), inset 0 8px 16px rgba(255,255,255,0.15)",
            }}
          >
            <div className="absolute top-3 left-3 h-6 w-8 rounded-md" style={{ background: "linear-gradient(135deg,#F6D97A,#B8862F)" }} />
            <div className="absolute bottom-3 left-3 right-3 text-white text-[10px] tracking-[0.3em] font-medium opacity-80">•••• 4242</div>
          </div>
          <div
            className="h-[110px] w-[176px] rounded-2xl absolute -top-4 left-6"
            style={{
              transform: "rotate(8deg)",
              background: "linear-gradient(135deg, #1A1A1A 0%, #3A3A3A 60%, #7621B0 100%)",
              boxShadow: "0 24px 40px -14px rgba(0,0,0,0.6), inset 0 -8px 16px rgba(0,0,0,0.35), inset 0 8px 16px rgba(255,255,255,0.08)",
            }}
          >
            <div className="absolute top-3 left-3 h-6 w-8 rounded-md" style={{ background: "linear-gradient(135deg,#F6D97A,#B8862F)" }} />
            <div className="absolute bottom-3 left-3 right-3 text-white text-[10px] tracking-[0.3em] font-medium opacity-80">•••• 8891</div>
          </div>
        </motion.div>

        <motion.div
          {...float(0.6, 8)}
          className="absolute grid place-items-center"
          style={{ top: "16%", right: "8%", height: 56, width: 56, borderRadius: 18, background: "linear-gradient(140deg,#FFFFFF,#D7E2EA)", boxShadow: "0 18px 36px -12px rgba(255,255,255,0.35), inset 0 -6px 10px rgba(0,0,0,0.15)" }}
        >
          <span className="font-black text-[#5A2FBA]" style={{ fontSize: 16, letterSpacing: 1 }}>UPI</span>
        </motion.div>

        <motion.div
          {...float(1, 8)}
          className="absolute grid place-items-center text-[28px]"
          style={{ top: "12%", left: "6%", height: 56, width: 56, borderRadius: 18, background: "linear-gradient(140deg,#22C55E,#0F5E2E)", boxShadow: "0 18px 36px -12px rgba(34,197,94,0.5), inset 0 -6px 10px rgba(0,0,0,0.3), inset 0 6px 10px rgba(255,255,255,0.25)" }}
        >
          <span style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>👛</span>
        </motion.div>

        <motion.div
          {...float(0.4, 6)}
          className="absolute grid place-items-center text-[28px]"
          style={{ bottom: "10%", left: "8%", height: 56, width: 56, borderRadius: 18, background: "linear-gradient(140deg,#3A82F6,#0B3D91)", boxShadow: "0 18px 36px -12px rgba(58,130,246,0.5), inset 0 -6px 10px rgba(0,0,0,0.3), inset 0 6px 10px rgba(255,255,255,0.2)" }}
        >
          <span style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>🏦</span>
        </motion.div>

        <motion.div
          {...float(0.8, 6)}
          className="absolute p-2 rounded-2xl"
          style={{ bottom: "8%", right: "6%", background: "#FFFFFF", boxShadow: "0 18px 36px -12px rgba(255,255,255,0.25)" }}
        >
          <svg width="48" height="48" viewBox="0 0 56 56">
            <rect width="56" height="56" fill="#fff" />
            {Array.from({ length: 8 }).map((_, r) =>
              Array.from({ length: 8 }).map((__, c) => {
                const on = (r * 13 + c * 7 + (r * c)) % 3 !== 0;
                return <rect key={`${r}-${c}`} x={c * 7} y={r * 7} width="6" height="6" fill={on ? "#0C0C0C" : "#fff"} />;
              })
            )}
            <rect x="0" y="0" width="20" height="20" fill="#fff" />
            <rect x="2" y="2" width="16" height="16" fill="#0C0C0C" />
            <rect x="5" y="5" width="10" height="10" fill="#fff" />
            <rect x="7" y="7" width="6" height="6" fill="#0C0C0C" />
            <rect x="36" y="0" width="20" height="20" fill="#fff" />
            <rect x="38" y="2" width="16" height="16" fill="#0C0C0C" />
            <rect x="41" y="5" width="10" height="10" fill="#fff" />
            <rect x="43" y="7" width="6" height="6" fill="#0C0C0C" />
          </svg>
        </motion.div>
      </div>
    </Panel>
  );
}

/* ---------- Scene 3: Delivery ---------- */
export function DeliveryScene() {
  return (
    <Panel tilt>
      <div className="absolute inset-0 grid place-items-center">
        <motion.div {...float(0.1, 6)} className="relative">
          <div
            className="rounded-[32px]"
            style={{
              width: 148,
              height: 212,
              background: "linear-gradient(160deg,#1A1A1A,#0C0C0C)",
              border: "6px solid #2A2A2A",
              boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7), inset 0 -8px 16px rgba(0,0,0,0.5), inset 0 8px 16px rgba(255,255,255,0.06)",
              padding: 8,
            }}
          >
            <div className="h-full w-full rounded-[22px] flex flex-col gap-2 p-3" style={{ background: "linear-gradient(180deg,#17212B,#0E1621)" }}>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full grid place-items-center text-[10px] text-white" style={{ background: "linear-gradient(135deg,#2AABEE,#229ED9)" }}>A</div>
                <div className="text-[10px] text-white/80 font-medium">Arya Premium</div>
              </div>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="rounded-lg px-2 py-1.5 self-end max-w-[80%]"
                  style={{ background: "linear-gradient(135deg,#7621B0,#B600A8)" }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.4, duration: 0.5 }}
                >
                  <div className="text-[8px] text-white/90 font-medium">🎧 Episode {i + 1}.mp3</div>
                  <div className="text-[7px] text-white/60">2:34 · delivered</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute text-[46px]"
          style={{ top: "10%", right: "6%", filter: "drop-shadow(0 8px 20px rgba(42,171,238,0.5))" }}
          animate={{ x: [0, -8, 0], y: [0, -6, 0], rotate: [-8, -2, -8] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" as const }}
        >
          ✈️
        </motion.div>

        <motion.div
          {...float(0.6, 6)}
          className="absolute grid place-items-center text-[22px]"
          style={{
            bottom: "8%", left: "6%", height: 48, width: 48, borderRadius: 16,
            background: "linear-gradient(140deg,#22C55E,#0F5E2E)",
            boxShadow: "0 14px 28px -10px rgba(34,197,94,0.55), inset 0 -4px 8px rgba(0,0,0,0.3), inset 0 4px 8px rgba(255,255,255,0.2)",
          }}
        >
          ⬇️
        </motion.div>

        <motion.div
          {...float(0.9, 5)}
          className="absolute px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase text-white"
          style={{
            top: "8%", left: "4%",
            background: "linear-gradient(135deg,#BE4C00,#B600A8)",
            boxShadow: "0 12px 24px -10px rgba(190,76,0,0.6)",
          }}
        >
          ∞ Lifetime
        </motion.div>
      </div>
    </Panel>
  );
}

/* ---------- Scene 4: Support ---------- */
export function LegacySupportScene() {
  return (
    <Panel tilt>
      <div className="absolute inset-0 grid place-items-center">
        <motion.div {...float(0, 6)} className="relative">
          <div
            className="h-[120px] w-[120px] rounded-full grid place-items-center text-[56px] relative"
            style={{
              background: "radial-gradient(circle at 35% 25%, #FFE0B2 0%, #E58A3A 45%, #6B2C0E 100%)",
              boxShadow: "0 30px 60px -20px rgba(229,138,58,0.55), inset 0 -12px 24px rgba(0,0,0,0.4), inset 0 12px 24px rgba(255,255,255,0.2)",
            }}
          >
            <span style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))" }}>🎧</span>
            <div className="absolute top-2 right-2 h-4 w-4 rounded-full" style={{ background: "#22C55E", boxShadow: "0 0 0 4px rgba(34,197,94,0.25), 0 0 12px #22C55E" }} />
          </div>
        </motion.div>

        <motion.div
          className="absolute rounded-2xl px-3 py-2 text-[11px] text-white font-medium"
          style={{
            top: "14%", right: "6%",
            background: "linear-gradient(135deg,#7621B0,#B600A8)",
            boxShadow: "0 14px 28px -10px rgba(182,0,168,0.55)",
          }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
        >
          Hi! 👋
        </motion.div>

        <motion.div
          className="absolute rounded-2xl px-3 py-2 text-[11px] font-medium"
          style={{
            top: "32%", left: "4%",
            background: "rgba(255,255,255,0.9)", color: "#0C0C0C",
            boxShadow: "0 14px 28px -10px rgba(255,255,255,0.35)",
          }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.5 }}
        >
          Ep 3 missing 🙁
        </motion.div>

        <motion.div
          className="absolute rounded-2xl px-3 py-2 text-[11px] text-white font-medium"
          style={{
            bottom: "14%", right: "8%",
            background: "linear-gradient(135deg,#22C55E,#0F5E2E)",
            boxShadow: "0 14px 28px -10px rgba(34,197,94,0.55)",
          }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.5 }}
        >
          Sending ✓
        </motion.div>

        <motion.div
          {...float(0.4, 5)}
          className="absolute px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest text-white"
          style={{
            bottom: "8%", left: "8%",
            background: "linear-gradient(135deg,#B600A8,#7621B0)",
            boxShadow: "0 12px 24px -10px rgba(182,0,168,0.6)",
          }}
        >
          24/7 LIVE
        </motion.div>
      </div>
    </Panel>
  );
}

export const SCENES = [WelcomeScene, IntegrationsScene, DeliveryScene, SupportWall];
