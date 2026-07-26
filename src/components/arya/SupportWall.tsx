"use client";

import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import type { Body, Engine, Render, Runner, World } from "matter-js";

/**
 * SupportWall — a compact physics "support wall". Support messages and emoji
 * stickers pile up, collide and can be dragged/tossed. Visitors can add their
 * own support note, which falls in from above.
 */

const GRAVITY_SCALE = 0.0012;
const RESTITUTION = 0.05;
const FRICTION = 0.6;
const FRICTION_AIR = 0.02;
const DENSITY = 0.0015;
const STICKER_CAP = 40;
const WALL_THICKNESS = 60;
const TEXT_FONT_PX = 12;
const TEXT_MAX_WIDTH = 118;
const TEXT_PAD_X = 10;
const TEXT_PAD_Y = 7;
const TEXT_LINE_H = 15;
const EMOJI_SIZE = 44;
const EMOJI_FONT_PX = 26;
const CARD_RADIUS = 18;
const BORDER_WIDTH = 2;

const PALETTE = ["#FDE68A", "#BBF7D0", "#FBCFE8", "#C7D2FE", "#BAE6FD", "#FED7AA"];
const STICKER_TEXT_COLOR = "#111827";

const SEED_TEXTS = [
  "agent replied in 20s",
  "episode 3 recovered ✅",
  "UTR verified instantly",
  "24/7 real humans",
  "refund sorted fast",
  "story request approved",
];
const SEED_EMOJIS = ["🎧", "💬", "✅", "🙌", "🔥", "❤️", "⭐", "🤝"];

type StickerKind = "text" | "emoji";
interface Sticker {
  body: Body;
  kind: StickerKind;
  content: string;
  w: number;
  h: number;
  color: string;
  lines: string[];
}
type BodyWithPlugin = Body & { plugin: { sticker?: Sticker } };

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(-w / 2 + rr, -h / 2);
  ctx.lineTo(w / 2 - rr, -h / 2);
  ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + rr);
  ctx.lineTo(w / 2, h / 2 - rr);
  ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - rr, h / 2);
  ctx.lineTo(-w / 2 + rr, h / 2);
  ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - rr);
  ctx.lineTo(-w / 2, -h / 2 + rr);
  ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + rr, -h / 2);
  ctx.closePath();
}

export default function SupportWall() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stickersRef = useRef<Sticker[]>([]);
  const addRef = useRef<((kind: StickerKind, content: string) => void) | null>(null);
  const [value, setValue] = useState("");

  useIsoLayoutEffect(() => {
    let engine: Engine | null = null;
    let render: Render | null = null;
    let runner: Runner | null = null;
    let raf = 0;
    let disposed = false;
    let onResize: (() => void) | null = null;

    (async () => {
      const M = await import("matter-js");
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (disposed || !container || !canvas) return;

      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;

      engine = M.Engine.create();
      engine.gravity.scale = GRAVITY_SCALE;
      const world: World = engine.world;

      render = M.Render.create({
        canvas,
        engine,
        options: {
          width: w,
          height: h,
          background: "transparent",
          wireframes: false,
          pixelRatio: window.devicePixelRatio || 1,
        },
      });

      const wallOpts = { isStatic: true, render: { visible: false } };
      const walls = [
        M.Bodies.rectangle(w / 2, h + WALL_THICKNESS / 2, w * 3, WALL_THICKNESS, wallOpts),
        M.Bodies.rectangle(-WALL_THICKNESS / 2, h / 2, WALL_THICKNESS, h * 3, wallOpts),
        M.Bodies.rectangle(w + WALL_THICKNESS / 2, h / 2, WALL_THICKNESS, h * 3, wallOpts),
      ];
      M.Composite.add(world, walls);

      const ctx = canvas.getContext("2d");

      const makeSticker = (kind: StickerKind, content: string, x: number, y: number) => {
        let sw = EMOJI_SIZE;
        let sh = EMOJI_SIZE;
        let lines: string[] = [];
        if (kind === "text" && ctx) {
          ctx.save();
          ctx.font = `600 ${TEXT_FONT_PX}px Kanit, sans-serif`;
          lines = wrapText(ctx, content, TEXT_MAX_WIDTH);
          const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
          ctx.restore();
          sw = Math.ceil(widest) + TEXT_PAD_X * 2;
          sh = lines.length * TEXT_LINE_H + TEXT_PAD_Y * 2;
        }
        const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        const body = M.Bodies.rectangle(x, y, sw, sh, {
          restitution: RESTITUTION,
          friction: FRICTION,
          frictionAir: FRICTION_AIR,
          density: DENSITY,
          chamfer: { radius: Math.min(CARD_RADIUS, sh / 2) },
          angle: (Math.random() - 0.5) * 0.5,
          render: { visible: false },
        }) as BodyWithPlugin;
        const sticker: Sticker = { body, kind, content, w: sw, h: sh, color, lines };
        body.plugin = { ...(body.plugin ?? {}), sticker };
        M.Composite.add(world, body);
        stickersRef.current.push(sticker);
        if (stickersRef.current.length > STICKER_CAP) {
          const old = stickersRef.current.shift();
          if (old) M.Composite.remove(world, old.body);
        }
        return sticker;
      };

      addRef.current = (kind, content) => {
        makeSticker(kind, content, w * (0.25 + Math.random() * 0.5), -60);
      };

      SEED_TEXTS.forEach((t, i) =>
        makeSticker("text", t, w * (0.25 + Math.random() * 0.5), -40 - i * 70),
      );
      SEED_EMOJIS.forEach((e, i) =>
        makeSticker("emoji", e, w * (0.15 + Math.random() * 0.7), -30 - i * 55),
      );

      const mouse = M.Mouse.create(canvas);
      const mc = M.MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } },
      });
      M.Composite.add(world, mc);
      render.mouse = mouse;

      runner = M.Runner.create();
      M.Runner.run(runner, engine);
      M.Render.run(render);

      const draw = () => {
        raf = requestAnimationFrame(draw);
        if (!ctx) return;
        for (const s of stickersRef.current) {
          const { position, angle } = s.body;
          ctx.save();
          ctx.translate(position.x, position.y);
          ctx.rotate(angle);
          ctx.fillStyle = s.kind === "emoji" ? "rgba(255,255,255,0.06)" : s.color;
          roundRect(ctx, s.w, s.h, CARD_RADIUS);
          ctx.fill();
          ctx.lineWidth = BORDER_WIDTH;
          ctx.strokeStyle = "rgba(255,255,255,0.22)";
          ctx.stroke();
          if (s.kind === "emoji") {
            ctx.font = `${EMOJI_FONT_PX}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(s.content, 0, 2);
          } else {
            ctx.font = `600 ${TEXT_FONT_PX}px Kanit, sans-serif`;
            ctx.fillStyle = STICKER_TEXT_COLOR;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const startY = -((s.lines.length - 1) * TEXT_LINE_H) / 2;
            s.lines.forEach((l, i) => ctx.fillText(l, 0, startY + i * TEXT_LINE_H));
          }
          ctx.restore();
        }
      };
      raf = requestAnimationFrame(draw);

      onResize = () => {
        if (!render || !container) return;
        const nw = container.clientWidth;
        const nh = container.clientHeight;
        render.canvas.width = nw * (window.devicePixelRatio || 1);
        render.canvas.height = nh * (window.devicePixelRatio || 1);
        render.options.width = nw;
        render.options.height = nh;
        M.Body.setPosition(walls[0], { x: nw / 2, y: nh + WALL_THICKNESS / 2 });
        M.Body.setPosition(walls[2], { x: nw + WALL_THICKNESS / 2, y: nh / 2 });
      };
      window.addEventListener("resize", onResize);
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (onResize) window.removeEventListener("resize", onResize);
      if (render) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (render as any).canvas && null;
        import("matter-js").then((M) => {
          if (render) M.Render.stop(render);
          if (runner) M.Runner.stop(runner);
          if (engine) {
            M.World.clear(engine.world, false);
            M.Engine.clear(engine);
          }
        });
      }
      stickersRef.current = [];
      addRef.current = null;
    };
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    addRef.current?.("text", v.slice(0, 60));
    setValue("");
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full aspect-square max-w-[290px] rounded-[32px] overflow-hidden"
      style={{
        touchAction: "none",
        border: "1px solid rgba(215,226,234,0.15)",
        background:
          "radial-gradient(120% 100% at 50% 0%, rgba(118,33,176,0.35) 0%, rgba(12,12,12,0) 55%), #0C0C0C",
        boxShadow: "0 40px 120px -40px rgba(182,0,168,0.35)",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-3">
        <form
          onSubmit={submit}
          className="pointer-events-auto flex w-full items-center gap-2 rounded-full p-1"
          style={{
            background: "rgba(0,0,0,0.85)",
            border: "1.5px solid rgba(255,255,255,0.35)",
            boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
          }}
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask support…"
            className="min-w-0 flex-1 bg-transparent px-3 text-[12px] font-medium outline-none"
            style={{ color: "#fff" }}
          />
          <button
            type="submit"
            className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider"
            style={{ background: "linear-gradient(135deg,#7621B0,#B600A8)", color: "#fff" }}
          >
            Send
          </button>
        </form>
      </div>
    </motion.div>
  );
}
