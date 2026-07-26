"use client";

import { forwardRef, useRef } from "react";
import { CreditCard, Landmark, Wallet, QrCode, Smartphone, IndianRupee } from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";

const Circle = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
  ({ className, children }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-9 items-center justify-center rounded-full p-1.5",
        className,
      )}
      style={{
        border: "1px solid rgba(215,226,234,0.18)",
        background: "#141414",
        boxShadow: "0 8px 18px -8px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {children}
    </div>
  ),
);
Circle.displayName = "Circle";

const ICON_CLASS = "h-4 w-4";

/** Payment integrations — hardcoded vector icons connected to the Arya hub by animated beams. */
export function IntegrationsScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative flex w-full max-w-[340px] items-center justify-center p-5"
      style={{ aspectRatio: "1 / 1", background: "transparent" }}
    >
      <div className="flex size-full max-h-[260px] flex-row items-stretch justify-between gap-8">
        <div className="flex flex-col justify-center gap-6">
          <Circle ref={div1Ref}>
            <CreditCard className={ICON_CLASS} style={{ color: "#E6C6FF" }} />
          </Circle>
          <Circle ref={div2Ref}>
            <Landmark className={ICON_CLASS} style={{ color: "#BBCCD7" }} />
          </Circle>
          <Circle ref={div3Ref}>
            <Wallet className={ICON_CLASS} style={{ color: "#FFB3F0" }} />
          </Circle>
        </div>

        <div className="flex flex-col justify-center">
          <div
            ref={hubRef}
            className="z-10 grid place-items-center overflow-hidden rounded-3xl"
            style={{
              width: 88,
              height: 88,
              border: "1px solid rgba(215,226,234,0.22)",
              background: "#141414",
              boxShadow: "0 20px 40px -18px rgba(182,0,168,0.65), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <img
              src="https://files.catbox.moe/ug9azb.jpg"
              alt="Arya"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6">
          <Circle ref={div4Ref}>
            <QrCode className={ICON_CLASS} style={{ color: "#BBCCD7" }} />
          </Circle>
          <Circle ref={div5Ref}>
            <Smartphone className={ICON_CLASS} style={{ color: "#E6C6FF" }} />
          </Circle>
          <Circle ref={div6Ref}>
            <IndianRupee className={ICON_CLASS} style={{ color: "#FFB3F0" }} />
          </Circle>
        </div>
      </div>

      {[
        { from: div1Ref, curvature: -60 },
        { from: div2Ref, curvature: 0 },
        { from: div3Ref, curvature: 60 },
      ].map(({ from, curvature }, i) => (
        <AnimatedBeam
          key={`l${i}`}
          containerRef={containerRef}
          fromRef={from}
          toRef={hubRef}
          curvature={curvature}
          pathColor="#D7E2EA"
          pathOpacity={0.12}
          pathWidth={1.5}
          gradientStartColor="#7621B0"
          gradientStopColor="#B600A8"
          delay={i * 0.4}
        />
      ))}
      {[
        { from: div4Ref, curvature: -60 },
        { from: div5Ref, curvature: 0 },
        { from: div6Ref, curvature: 60 },
      ].map(({ from, curvature }, i) => (
        <AnimatedBeam
          key={`r${i}`}
          containerRef={containerRef}
          fromRef={from}
          toRef={hubRef}
          curvature={curvature}
          reverse
          pathColor="#D7E2EA"
          pathOpacity={0.12}
          pathWidth={1.5}
          gradientStartColor="#B600A8"
          gradientStopColor="#7621B0"
          delay={i * 0.4 + 0.2}
        />
      ))}
    </div>
  );
}

export default IntegrationsScene;
