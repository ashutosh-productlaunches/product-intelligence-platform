"use client";
// The moving picture behind the demo: words from YOUR pasted text drift into a
// glowing ring (the model) and leave as small blocks of data (the checked answer).
//
// This is the one piece of JavaScript the site sends to the browser. It is pure
// decoration: the tool works the same without it, and nothing here talks to the model.
//
// It finds its three anchors inside the parent element:
//   [data-stage="in"]   where words come from (your text)
//   [data-stage="core"] where the ring sits (the model)
//   [data-stage="out"]  where the data goes (the result)
import { useEffect, useRef } from "react";

type Word = { kind: "word"; text: string; x: number; y: number; x0: number; y0: number; born: number; speed: number };
type Bit = { kind: "bit"; x: number; y: number; vx: number; vy: number; lane: number };
type Rect = { x: number; y: number; w: number; h: number };

export function TransmutationStage({ words }: { words: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pool = words.length ? words : ["your", "text", "goes", "here"];
    let W = 0, H = 0, vertical = false;
    let inR: Rect | null = null, coreR: Rect | null = null, outR: Rect | null = null;
    let parts: (Word | Bit)[] = [];
    let raf = 0, last = 0, lastSpawn = 0, visible = true;

    const rectOf = (sel: string): Rect | null => {
      const el = host.querySelector(sel);
      if (!el) return null;
      const a = el.getBoundingClientRect(), b = host.getBoundingClientRect();
      return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
    };

    const measure = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.max(1, W * dpr); canvas.height = Math.max(1, H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      inR = rectOf('[data-stage="in"]'); coreR = rectOf('[data-stage="core"]'); outR = rectOf('[data-stage="out"]');
      vertical = !!(inR && coreR && coreR.y > inR.y + inR.h - 2);
    };

    const spawn = (t: number) => {
      if (!inR || !coreR) return;
      const text = pool[Math.floor(Math.random() * pool.length)];
      const x = vertical ? inR.x + inR.w * (0.2 + Math.random() * 0.6) : inR.x + inR.w + 6;
      const y = vertical ? inR.y + inR.h + 8 : inR.y + inR.h * (0.2 + Math.random() * 0.6);
      parts.push({ kind: "word", text, x, y, x0: x, y0: y, born: t, speed: 0.8 + Math.random() * 0.5 });
    };

    const draw = (t: number) => {
      const dt = Math.min(50, last ? t - last : 16) / 1000;
      last = t;
      ctx.clearRect(0, 0, W, H);
      if (!coreR) return;
      const cx = coreR.x + coreR.w / 2, cy = coreR.y + coreR.h / 2;
      const R = Math.min(coreR.w, coreR.h) * 0.36;

      // the ring
      const pulse = 1 + 0.04 * Math.sin(t * 0.003);
      const glow = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 2.3);
      glow.addColorStop(0, "rgba(155,123,255,.38)");
      glow.addColorStop(0.45, "rgba(98,227,255,.10)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, R * 2.3, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = "lighter";
      const strokes = ["rgba(98,227,255,.85)", "rgba(155,123,255,.55)", "rgba(224,123,255,.35)"];
      strokes.forEach((s, k) => {
        ctx.strokeStyle = s; ctx.lineWidth = [1.6, 1, 0.8][k];
        const rr = R * pulse * (1 + k * 0.14), rot = t * 0.0004 * (k % 2 ? -1 : 1);
        ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr, rot, 0.2 + k, Math.PI * 1.7 + k); ctx.stroke();
      });
      for (let k = 0; k < 18; k++) {
        const an = t * 0.0012 + k * 0.35;
        ctx.fillStyle = `rgba(180,220,255,${0.3 + 0.25 * (k % 3)})`;
        ctx.beginPath(); ctx.arc(cx + Math.cos(an) * R * 1.06, cy + Math.sin(an) * R * 1.06, 1.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      if (reduce) return;

      // words in, data out
      ctx.font = "500 11px ui-monospace, Menlo, Consolas, monospace";
      ctx.textAlign = vertical ? "center" : "left";
      const exit = outR
        ? vertical ? { x: outR.x + outR.w / 2, y: outR.y + 12 } : { x: outR.x + 12, y: outR.y + outR.h / 2 }
        : { x: W, y: cy };
      parts = parts.filter((p) => {
        if (p.kind === "word") {
          if (vertical) {
            p.y += 70 * p.speed * dt;
            const f = Math.min(1, Math.max(0, (p.y - p.y0) / (cy - p.y0)));
            p.x = p.x0 + (cx - p.x0) * f * f;
          } else {
            p.x += 90 * p.speed * dt;
            const f = Math.min(1, Math.max(0, (p.x - p.x0) / (cx - p.x0)));
            p.y = p.y0 + (cy - p.y0) * f * f;
          }
          const d = Math.hypot(p.x - cx, p.y - cy);
          if (d < R * 0.9) {
            for (let q = 0; q < 3; q++) {
              const lane = Math.floor(Math.random() * 4);
              parts.push(
                vertical
                  ? { kind: "bit", x: cx, y: cy, vx: (Math.random() - 0.5) * 0.6, vy: 1.4 + Math.random(), lane }
                  : { kind: "bit", x: cx, y: cy, vx: 1.6 + Math.random() * 1.2, vy: (Math.random() - 0.5) * 1.4, lane },
              );
            }
            return false;
          }
          const alpha = Math.min(1, (t - p.born) / 400) * Math.max(0, Math.min(1, (d - R * 0.9) / (R * 1.2)));
          ctx.globalAlpha = alpha; ctx.fillStyle = "#ece9ff"; ctx.fillText(p.text, p.x, p.y); ctx.globalAlpha = 1;
          return true;
        }
        if (!vertical) {
          const laneY = exit.y - 36 + p.lane * 24;
          p.vy += (laneY - p.y) * 0.004; p.vy *= 0.92;
        }
        p.x += p.vx * 60 * dt; p.y += p.vy * 60 * dt;
        const alive = vertical ? p.y < exit.y : p.x < exit.x;
        if (!alive) return false;
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = "rgba(98,227,255,.85)"; ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        ctx.globalCompositeOperation = "source-over";
        return true;
      });
      if (t - lastSpawn > (vertical ? 480 : 240) && parts.length < 90) { spawn(t); lastSpawn = t; }
    };

    const loop = (t: number) => {
      if (visible) draw(t);
      raf = requestAnimationFrame(loop);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = 0; });
    io.observe(host);
    if (reduce) draw(0); else raf = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [words]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
