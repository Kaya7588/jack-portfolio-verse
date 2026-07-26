"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Body, Engine, Runner, World } from "matter-js";

/**
 * SupportWall — physical support wall. Quote cards and emoji stickers drop in,
 * collide, and can be dragged / tossed around. Visitors can add their own note.
 */

const GRAVITY_SCALE = 0.0011;
const RESTITUTION = 0.15;
const FRICTION = 0.4;
const FRICTION_AIR = 0.015;
const DENSITY = 0.001;
const STICKER_CAP = 26;
const WALL_THICKNESS = 80;
const TEXT_FONT_PX = 11;
const TEXT_MAX_WIDTH = 104;
const TEXT_PAD_X = 9;
const TEXT_PAD_Y = 7;
const TEXT_LINE_H = 14;
const EMOJI_SIZE = 38;
const EMOJI_FONT_PX = 22;
const CARD_RADIUS = 12;

const PALETTE = ["#FDE68A", "#BBF7D0", "#FBCFE8", "#C7D2FE", "#BAE6FD", "#FED7AA"];

const SEED_TEXTS = [
  "Agent replied in 20s",
  "Episode recovered",
  "UTR verified fast",
  "24/7 real humans",
  "Refund sorted",
];
const SEED_EMOJIS = ["🎧", "💬", "✅", "🙌", "❤️", "⭐"];

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
    let runner: Runner | null = null;
    let raf = 0;
    let disposed = false;
    let onResize: (() => void) | null = null;

    (async () => {
      const M = await import("matter-js");
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (disposed || !container || !canvas) return;

      let w = container.clientWidth;
      let h = container.clientHeight;
      if (!w || !h) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const sizeCanvas = () => {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      };
      sizeCanvas();

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      engine = M.Engine.create();
      engine.gravity.scale = GRAVITY_SCALE;
      const world: World = engine.world;

      const wallOpts = { isStatic: true, render: { visible: false } };
      const floor = M.Bodies.rectangle(w / 2, h + WALL_THICKNESS / 2 - 6, w * 3, WALL_THICKNESS, wallOpts);
      const left = M.Bodies.rectangle(-WALL_THICKNESS / 2, h / 2, WALL_THICKNESS, h * 4, wallOpts);
      const right = M.Bodies.rectangle(w + WALL_THICKNESS / 2, h / 2, WALL_THICKNESS, h * 4, wallOpts);
      M.Composite.add(world, [floor, left, right]);

      const makeSticker = (kind: StickerKind, content: string, x: number, y: number) => {
        let sw = EMOJI_SIZE;
        let sh = EMOJI_SIZE;
        let lines: string[] = [];
        if (kind === "text") {
          ctx.save();
          ctx.font = `600 ${TEXT_FONT_PX}px Kanit, system-ui, sans-serif`;
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
          chamfer: { radius: Math.min(CARD_RADIUS, sh / 2 - 1) },
          angle: (Math.random() - 0.5) * 0.4,
          render: { visible: false },
        });
        const sticker: Sticker = { body, kind, content, w: sw, h: sh, color, lines };
        (body as Body & { plugin: Record<string, unknown> }).plugin = { sticker };
        M.Composite.add(world, body);
        stickersRef.current.push(sticker);
        if (stickersRef.current.length > STICKER_CAP) {
          const old = stickersRef.current.shift();
          if (old) M.Composite.remove(world, old.body);
        }
      };

      addRef.current = (kind, content) => {
        makeSticker(kind, content, w * (0.25 + Math.random() * 0.5), -50);
      };

      SEED_TEXTS.forEach((t, i) => makeSticker("text", t, w * (0.25 + Math.random() * 0.5), -30 - i * 60));
      SEED_EMOJIS.forEach((e, i) => makeSticker("emoji", e, w * (0.18 + Math.random() * 0.64), -20 - i * 48));

      const mouse = M.Mouse.create(canvas);
      const mc = M.MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.18, render: { visible: false } },
      });
      M.Composite.add(world, mc);

      runner = M.Runner.create();
      M.Runner.run(runner, engine);

      const draw = () => {
        raf = requestAnimationFrame(draw);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        for (const s of stickersRef.current) {
          const { position, angle } = s.body;
          ctx.save();
          ctx.translate(position.x, position.y);
          ctx.rotate(angle);
          if (s.kind === "emoji") {
            ctx.fillStyle = "rgba(255,255,255,0.10)";
            roundRect(ctx, s.w, s.h, CARD_RADIUS);
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "rgba(255,255,255,0.28)";
            ctx.stroke();
            ctx.font = `${EMOJI_FONT_PX}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#fff";
            ctx.fillText(s.content, 0, 1);
          } else {
            ctx.fillStyle = s.color;
            roundRect(ctx, s.w, s.h, CARD_RADIUS);
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "rgba(0,0,0,0.35)";
            ctx.stroke();
            ctx.font = `600 ${TEXT_FONT_PX}px Kanit, system-ui, sans-serif`;
            ctx.fillStyle = "#111827";
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
        if (!container) return;
        w = container.clientWidth;
        h = container.clientHeight;
        sizeCanvas();
        M.Body.setPosition(floor, { x: w / 2, y: h + WALL_THICKNESS / 2 - 6 });
        M.Body.setPosition(right, { x: w + WALL_THICKNESS / 2, y: h / 2 });
        M.Body.setPosition(left, { x: -WALL_THICKNESS / 2, y: h / 2 });
      };
      window.addEventListener("resize", onResize);
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (onResize) window.removeEventListener("resize", onResize);
      import("matter-js").then((M) => {
        if (runner) M.Runner.stop(runner);
        if (engine) {
          M.World.clear(engine.world, false);
          M.Engine.clear(engine);
        }
      });
      stickersRef.current = [];
      addRef.current = null;
    };
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    addRef.current?.("text", v.slice(0, 48));
    setValue("");
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[300px] overflow-hidden rounded-[28px]"
      style={{
        aspectRatio: "1 / 1",
        touchAction: "none",
        border: "1px solid rgba(215,226,234,0.14)",
        background:
          "radial-gradient(120% 100% at 50% 0%, rgba(118,33,176,0.28) 0%, rgba(12,12,12,0) 60%), #0C0C0C",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block" />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-3">
        <form
          onSubmit={submit}
          className="pointer-events-auto flex w-full items-center gap-2 rounded-full p-1"
          style={{
            background: "rgba(0,0,0,0.8)",
            border: "1px solid rgba(255,255,255,0.28)",
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
    </div>
  );
}
