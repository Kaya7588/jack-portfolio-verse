import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

const CENTER = "https://files.catbox.moe/ug9azb.jpg";
const ICONS = [
  "https://files.catbox.moe/56va86.png",
  "https://files.catbox.moe/p8mdri.png",
  "https://files.catbox.moe/9mwiae.png",
  "https://files.catbox.moe/yebuyr.png",
  "https://files.catbox.moe/vxmb00.png",
  "https://files.catbox.moe/j6e3an.png",
];

/** Payment integrations orbit — center brand mark with 6 orbiting provider icons. */
export function IntegrationsScene() {
  const ref = useRef<HTMLDivElement | null>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 140, damping: 14, mass: 0.4 });
  const sry = useSpring(ry, { stiffness: 140, damping: 14, mass: 0.4 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 16);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 16);
  };

  const R = 39; // orbit radius in %

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => { rx.set(0); ry.set(0); }}
      className="relative w-full aspect-square max-w-[290px]"
      style={{ perspective: 900, rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
    >
      {/* orbit rings */}
      <div
        className="absolute rounded-full"
        style={{ inset: "11%", border: "1px dashed rgba(215,226,234,0.16)" }}
      />
      <div
        className="absolute rounded-full"
        style={{
          inset: "26%",
          border: "1px solid rgba(215,226,234,0.10)",
          background: "radial-gradient(circle at 50% 40%, rgba(182,0,168,0.22), rgba(12,12,12,0) 70%)",
        }}
      />

      {/* center */}
      <motion.div
        className="absolute left-1/2 top-1/2 grid place-items-center rounded-3xl overflow-hidden"
        style={{
          height: "34%", width: "34%", x: "-50%", y: "-50%",
          border: "1px solid rgba(215,226,234,0.2)",
          boxShadow: "0 30px 60px -20px rgba(182,0,168,0.55), inset 0 2px 0 rgba(255,255,255,0.14)",
          background: "#0C0C0C",
          translateZ: 40,
        }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <img src={CENTER} alt="Arya Premium" className="h-full w-full object-cover" />
      </motion.div>

      {/* orbiting icons */}
      {ICONS.map((src, i) => {
        const a = (i / ICONS.length) * Math.PI * 2 - Math.PI / 2;
        const left = 50 + Math.cos(a) * R;
        const top = 50 + Math.sin(a) * R;
        return (
          <motion.div
            key={src}
            className="absolute grid place-items-center rounded-2xl overflow-hidden"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              height: 54,
              width: 54,
              x: "-50%",
              y: "-50%",
              translateZ: 20,
              background: "linear-gradient(140deg, rgba(255,255,255,0.96), rgba(215,226,234,0.9))",
              border: "1px solid rgba(255,255,255,0.5)",
              boxShadow: "0 18px 34px -14px rgba(0,0,0,0.7), inset 0 -5px 10px rgba(0,0,0,0.12)",
            }}
            animate={{ y: ["-50%", "calc(-50% - 7px)", "-50%"] }}
            transition={{ duration: 3.6 + i * 0.25, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
          >
            <img src={src} alt="" className="h-[68%] w-[68%] object-contain" />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
