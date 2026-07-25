import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
  type MotionValue,
} from "framer-motion";

const IMAGES = [
  "https://images.unsplash.com/photo-1517971071642-34a2d3ecc9cd?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?auto=format&fit=crop&w=800&q=80",
];

type Cfg = {
  distanceDivisor: number;
  velocityDivisor: number;
  sensitivity: number;
  xMultiplier: number;
  yMultiplier: number;
  rotationMultiplier: number;
  scaleReduction: number;
};

const CFG: Cfg = {
  distanceDivisor: 120,
  velocityDivisor: 500,
  sensitivity: 180,
  xMultiplier: 90,
  yMultiplier: 20,
  rotationMultiplier: 8,
  scaleReduction: 0.06,
};

export function StackedCardCarousel() {
  const progress = useMotionValue(0);
  const start = useRef(0);
  const total = IMAGES.length;

  const onStart = () => { start.current = progress.get(); };
  const onDrag = (_: unknown, info: PanInfo) => {
    progress.set(progress.get() + -info.delta.x / CFG.sensitivity);
  };
  const onEnd = (_: unknown, info: PanInfo) => {
    const ds = -info.offset.x / CFG.distanceDivisor;
    const vs = -info.velocity.x / CFG.velocityDivisor;
    let shift = Math.round(ds + vs);
    shift = Math.max(-3, Math.min(3, shift));
    animate(progress, Math.round(start.current) + shift, {
      type: "spring", stiffness: 200, damping: 30, mass: 1,
    });
  };

  return (
    <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        onDragStart={onStart}
        onDrag={onDrag}
        onDragEnd={onEnd}
        className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
      />
      {IMAGES.map((src, i) => (
        <Card key={i} src={src} index={i} total={total} progress={progress} />
      ))}
    </div>
  );
}

function Card({
  src, index, total, progress,
}: { src: string; index: number; total: number; progress: MotionValue<number> }) {
  const offset = useTransform(progress, (p) => {
    let d = (index - p) % total;
    if (d > total / 2) d -= total;
    if (d < -total / 2) d += total;
    return d;
  });
  const x = useTransform(offset, (o) => o * CFG.xMultiplier);
  const rotate = useTransform(offset, (o) => Math.abs(o) < 0.05 ? 0 : o * CFG.rotationMultiplier);
  const y = useTransform(offset, (o) => Math.abs(o) < 0.05 ? 0 : Math.abs(o) * CFG.yMultiplier);
  const scale = useTransform(offset, (o) => 1 - Math.abs(o) * CFG.scaleReduction);
  const opacity = useTransform(
    offset,
    [-total / 2, -total / 2 + 0.5, 0, total / 2 - 0.5, total / 2],
    [0, 1, 1, 1, 0],
  );
  const zIndex = useTransform(offset, (o) => Math.round(100 - Math.abs(o) * 10));

  return (
    <motion.div
      style={{ x, y, rotate, scale, opacity, zIndex }}
      className="absolute h-[78%] w-[62%] rounded-3xl overflow-hidden"
    >
      <div
        className="h-full w-full rounded-3xl overflow-hidden relative"
        style={{
          border: "1px solid rgba(215,226,234,0.18)",
          boxShadow: "0 30px 60px -20px rgba(182,0,168,0.45), 0 12px 24px -10px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.10)",
          background: "#0C0C0C",
        }}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }}
        />
      </div>
    </motion.div>
  );
}
