import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function AnimatedText({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });

  const chars = Array.from(text);

  return (
    <p ref={ref} className={className} style={style}>
      {chars.map((c, i) => {
        const start = i / chars.length;
        const end = start + 1 / chars.length;
        return <Char key={i} char={c} progress={scrollYProgress} range={[start, end]} />;
      })}
    </p>
  );
}

function Char({ char, progress, range }: { char: string; progress: any; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <span style={{ position: "relative", display: "inline" }}>
      <span style={{ opacity: 0 }}>{char}</span>
      <motion.span style={{ position: "absolute", left: 0, top: 0, opacity }}>{char}</motion.span>
    </span>
  );
}
