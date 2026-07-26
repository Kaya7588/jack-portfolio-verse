import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, type MotionValue } from "framer-motion";

import p1 from "@/assets/arya/file_0000000013e8820ea802a31d37cc1fdd.png.asset.json";
import p2 from "@/assets/arya/file_0000000048cc820e8a94aedec056054e.png.asset.json";
import p3 from "@/assets/arya/file_0000000058b0820ea51cc5676deeb054.png.asset.json";
import p4 from "@/assets/arya/file_0000000068f8820ea8d1533bc9efcc8c.png.asset.json";
import p5 from "@/assets/arya/file_00000000668081fa889e387e93654005.png.asset.json";

const IMAGES = [p1.url, p2.url, p3.url, p4.url, p5.url];

const CFG = {
  xMultiplier: 46,
  yMultiplier: 12,
  rotationMultiplier: 6,
  scaleReduction: 0.09,
};

/**
 * Stacked poster carousel — auto-rotates and advances on tap.
 * Intentionally NOT draggable: the parent onboarding slider owns horizontal
 * swipe, and nested drag handlers made it hang.
 */
export function StackedCardCarousel() {
  const progress = useMotionValue(0);
  const target = useRef(0);
  const total = IMAGES.length;

  const go = (delta: number) => {
    target.current += delta;
    animate(progress, target.current, { type: "spring", stiffness: 200, damping: 26, mass: 0.9 });
  };

  useEffect(() => {
    const id = window.setInterval(() => go(1), 2600);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-[260px] flex items-center justify-center">
      <button
        type="button"
        aria-label="Next story"
        onClick={() => go(1)}
        className="absolute inset-0 z-50 cursor-pointer bg-transparent"
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
  const rotate = useTransform(offset, (o) => (Math.abs(o) < 0.05 ? 0 : o * CFG.rotationMultiplier));
  const y = useTransform(offset, (o) => (Math.abs(o) < 0.05 ? 0 : Math.abs(o) * CFG.yMultiplier));
  const scale = useTransform(offset, (o) => 1 - Math.abs(o) * CFG.scaleReduction);
  const opacity = useTransform(
    offset,
    [-total / 2, -total / 2 + 0.6, 0, total / 2 - 0.6, total / 2],
    [0, 1, 1, 1, 0],
  );
  const zIndex = useTransform(offset, (o) => Math.round(100 - Math.abs(o) * 10));

  return (
    <motion.div
      style={{ x, y, rotate, scale, opacity, zIndex }}
      className="absolute h-[74%] w-[50%] rounded-2xl overflow-hidden"
    >
      <div
        className="h-full w-full rounded-2xl overflow-hidden relative"
        style={{
          border: "1px solid rgba(215,226,234,0.18)",
          boxShadow:
            "0 24px 48px -18px rgba(182,0,168,0.45), 0 10px 20px -10px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.10)",
          background: "#0C0C0C",
        }}
      >
        <img
          src={src}
          alt=""
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.4) 100%)" }}
        />
      </div>
    </motion.div>
  );
}
