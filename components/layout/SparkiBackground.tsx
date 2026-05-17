"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import {
  BG_DRIFT_VEL_SCALE,
  BG_NAV_ENERGY_BUMP,
  BG_NAV_ENERGY_DECAY,
  BG_NAV_ENERGY_MAX,
} from "@/lib/site/background-animation";
import { SPARKKI_BG_NAV_EVENT } from "@/lib/site/background-nav";

type Category = "distro" | "os" | "penguin" | "app" | "flag";

const CAT_COLORS: Record<Category, { fill: string; stroke: string }> = {
  distro: {
    fill: "rgba(29,245,160,0.085)",
    stroke: "rgba(29,245,160,0.32)",
  },
  os: { fill: "rgba(96,165,250,0.085)", stroke: "rgba(96,165,250,0.34)" },
  penguin: {
    fill: "rgba(250,204,21,0.085)",
    stroke: "rgba(250,204,21,0.36)",
  },
  app: { fill: "rgba(106,90,154,0.1)", stroke: "rgba(106,90,154,0.34)" },
  flag: { fill: "rgba(0,53,128,0.095)", stroke: "rgba(0,53,128,0.38)" },
};

type SymbolDef = {
  name: string;
  cat: Category;
  draw: (ctx: CanvasRenderingContext2D, s: number) => void;
};

function strokeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawCircleBadge(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawThreeBlobs(ctx: CanvasRenderingContext2D, s: number) {
  const r = s * 0.14;
  for (const [dx, dy] of [
    [0, -r * 0.6],
    [-r * 0.9, r * 0.55],
    [r * 0.9, r * 0.55],
  ] as const) {
    ctx.beginPath();
    ctx.arc(dx, dy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawInfinity(ctx: CanvasRenderingContext2D, s: number) {
  const r = s * 0.22;
  ctx.beginPath();
  ctx.arc(-r * 0.55, 0, r * 0.72, -Math.PI * 0.35, Math.PI * 0.35);
  ctx.arc(r * 0.55, 0, r * 0.72, Math.PI * 0.65, Math.PI * 1.35);
  ctx.stroke();
}

function drawHex(ctx: CanvasRenderingContext2D, s: number) {
  const r = s * 0.4;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 - Math.PI / 6;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawGear(ctx: CanvasRenderingContext2D, s: number) {
  const teeth = 8;
  const r0 = s * 0.22;
  const r1 = s * 0.32;
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const outer = i % 2 === 0;
    const r = outer ? r1 : r0;
    const a = (i * Math.PI) / teeth;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r0 * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawTerminal(ctx: CanvasRenderingContext2D, s: number) {
  const w = s * 0.72;
  const h = s * 0.5;
  strokeRoundRect(ctx, -w / 2, -h / 2, w, h, s * 0.06);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-w * 0.32, -h * 0.08);
  ctx.lineTo(-w * 0.08, h * 0.12);
  ctx.lineTo(w * 0.32, -h * 0.12);
  ctx.stroke();
}

function drawBox(ctx: CanvasRenderingContext2D, s: number) {
  const w = s * 0.62;
  ctx.strokeRect(-w / 2, -w / 2, w, w);
  ctx.fillRect(-w / 2 + w * 0.12, -w / 2 + w * 0.12, w * 0.35, w * 0.35);
}

function drawWave(ctx: CanvasRenderingContext2D, s: number) {
  const w = s * 0.8;
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  for (let i = 0; i <= 12; i++) {
    const x = -w / 2 + (w * i) / 12;
    const y = Math.sin((i / 12) * Math.PI * 2) * s * 0.12;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawPenguin(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.ellipse(0, s * 0.04, s * 0.22, s * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -s * 0.18, s * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.12);
  ctx.lineTo(s * 0.07, -s * 0.06);
  ctx.lineTo(-s * 0.07, -s * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/** Nordic cross on white — colours are literal (flag), not theme `CAT_COLORS.fill`. */
function drawFinnishFlag(ctx: CanvasRenderingContext2D, s: number) {
  const w = s * 0.88;
  const h = s * 0.54;
  const x = -w / 2;
  const y = -h / 2;
  const blue = "rgba(0,53,128,0.95)";
  const white = "rgba(255,255,255,0.92)";

  ctx.fillStyle = white;
  ctx.strokeStyle = blue;
  ctx.lineWidth = Math.max(1, s * 0.035);
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();

  const bt = h * 0.22;
  const hBarY = y + h * 0.36 - bt / 2;
  ctx.fillStyle = blue;
  ctx.fillRect(x, hBarY, w, bt);

  const vBarX = x + w * 0.28 - bt / 2;
  ctx.fillRect(vBarX, y, bt, h);
}

/** EU blue field + twelve gold stars. */
function drawEUFlag(ctx: CanvasRenderingContext2D, s: number) {
  const w = s * 0.88;
  const h = s * 0.58;
  const x = -w / 2;
  const y = -h / 2;
  const euBlue = "rgba(0,51,153,0.92)";
  const gold = "rgba(255,204,0,0.85)";

  ctx.fillStyle = euBlue;
  ctx.strokeStyle = "rgba(0,51,153,0.55)";
  ctx.lineWidth = Math.max(1, s * 0.03);
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();

  const ringR = Math.min(w, h) * 0.3;
  const starR = s * 0.055;
  const starInner = starR * 0.45;
  const starPoints = 5;

  ctx.fillStyle = gold;
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
    const sx = Math.cos(angle) * ringR;
    const sy = Math.sin(angle) * ringR;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle + Math.PI / 2);

    ctx.beginPath();
    for (let p = 0; p < starPoints * 2; p++) {
      const r = p % 2 === 0 ? starR : starInner;
      const a = (p * Math.PI) / starPoints - Math.PI / 2;
      if (p === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

const SYMBOLS: SymbolDef[] = [
  { name: "Ubuntu", cat: "distro", draw: drawThreeBlobs },
  { name: "Debian", cat: "distro", draw: drawInfinity },
  { name: "Fedora", cat: "distro", draw: drawCircleBadge },
  { name: "Tux", cat: "penguin", draw: drawPenguin },
  { name: "Mint", cat: "distro", draw: drawHex },
  { name: "elementary", cat: "distro", draw: drawCircleBadge },
  { name: "Tux", cat: "penguin", draw: drawPenguin },
  { name: "openSUSE", cat: "distro", draw: drawWave },
  { name: "Manjaro", cat: "distro", draw: drawThreeBlobs },
  { name: "Pop!_OS", cat: "distro", draw: drawHex },
  { name: "Tux", cat: "penguin", draw: drawPenguin },
  { name: "Tux", cat: "penguin", draw: drawPenguin },
  { name: "Kernel", cat: "os", draw: drawGear },
  { name: "systemd", cat: "os", draw: drawWave },
  { name: "bash", cat: "os", draw: drawTerminal },
  { name: "Docker", cat: "app", draw: drawBox },
  { name: "Firefox", cat: "app", draw: drawCircleBadge },
  { name: "Tux", cat: "penguin", draw: drawPenguin },
  { name: "Neovim", cat: "app", draw: drawWave },
  { name: "Node", cat: "app", draw: drawHex },
  { name: "Tux", cat: "penguin", draw: drawPenguin },
  { name: "Finnish flag", cat: "flag", draw: drawFinnishFlag },
  { name: "EU flag", cat: "flag", draw: drawEUFlag },
];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  sym: number;
  size: number;
};

/**
 * Drifting 2D canvas symbols (distros, tools, Finnish & EU flags) for ambient marketing backgrounds.
 */
export function SparkiBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  const navEnergyRef = useRef(0);
  const skipPathnameBumpRef = useRef(true);
  const pathname = usePathname();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (skipPathnameBumpRef.current) {
      skipPathnameBumpRef.current = false;
      return;
    }
    if (reducedMotion) return;
    navEnergyRef.current = Math.min(
      BG_NAV_ENERGY_MAX,
      navEnergyRef.current + BG_NAV_ENERGY_BUMP,
    );
  }, [pathname, reducedMotion]);

  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const reduced = reducedMotion;

    const c2d = cvs.getContext("2d");
    if (!c2d) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const particles: Particle[] = [];
    const n = Math.min(
      48,
      Math.floor(
        (typeof window !== "undefined" ? window.innerWidth : 1200) / 28,
      ),
    );

    const bumpNavEnergy = () => {
      if (reduced) return;
      navEnergyRef.current = Math.min(
        BG_NAV_ENERGY_MAX,
        navEnergyRef.current + BG_NAV_ENERGY_BUMP,
      );
    };
    window.addEventListener(SPARKKI_BG_NAV_EVENT, bumpNavEnergy);

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cvs!.width = Math.floor(w * dpr);
      cvs!.height = Math.floor(h * dpr);
      cvs!.style.width = `${w}px`;
      cvs!.style.height = `${h}px`;
      c2d!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const penguinSymIndices = SYMBOLS.map((s, i) =>
      s.cat === "penguin" ? i : -1,
    ).filter((i) => i >= 0);

    function pickSymbolIndex(): number {
      if (Math.random() < 0.38 && penguinSymIndices.length > 0) {
        return penguinSymIndices[
          Math.floor(Math.random() * penguinSymIndices.length)
        ]!;
      }
      return Math.floor(Math.random() * SYMBOLS.length);
    }

    function spawn() {
      particles.length = 0;
      const drift = BG_DRIFT_VEL_SCALE;
      for (let i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.065 * drift,
          vy: (Math.random() - 0.5) * 0.055 * drift,
          rot: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.00075 * drift,
          sym: pickSymbolIndex(),
          size: 22 + Math.random() * 26,
        });
      }
    }

    function tick() {
      c2d!.clearRect(0, 0, w, h);

      let navBoost = navEnergyRef.current;
      if (navBoost > 0.02) {
        navEnergyRef.current *= BG_NAV_ENERGY_DECAY;
      } else {
        navBoost = 0;
        navEnergyRef.current = 0;
      }
      const navNorm = Math.min(1, navBoost / BG_NAV_ENERGY_MAX);
      const motionScale = 1 + navNorm * 1.25;

      if (!reduced) {
        for (const p of particles) {
          if (navNorm > 0) {
            p.vx += (Math.random() - 0.5) * 0.045 * navNorm;
            p.vy += (Math.random() - 0.5) * 0.04 * navNorm;
          }
          const maxV = (0.085 + navNorm * 0.14) * BG_DRIFT_VEL_SCALE;
          p.vx = Math.max(-maxV, Math.min(maxV, p.vx));
          p.vy = Math.max(-maxV, Math.min(maxV, p.vy));
          p.x += p.vx * motionScale;
          p.y += p.vy * motionScale;
          p.rot += p.spin * motionScale;
          if (p.x < -80) p.x = w + 40;
          if (p.x > w + 80) p.x = -40;
          if (p.y < -80) p.y = h + 40;
          if (p.y > h + 80) p.y = -40;
        }
      }

      for (const p of particles) {
        const def = SYMBOLS[p.sym]!;
        const col = CAT_COLORS[def.cat];
        c2d!.save();
        c2d!.translate(p.x, p.y);
        c2d!.rotate(p.rot);
        const s = p.size;
        c2d!.globalAlpha = 0.36;
        if (def.cat === "flag") {
          c2d!.strokeStyle = col.stroke;
          c2d!.fillStyle = col.fill;
        } else {
          c2d!.fillStyle = col.fill;
          c2d!.strokeStyle = col.stroke;
        }
        c2d!.lineWidth = Math.max(1, s * 0.06);
        c2d!.lineJoin = "round";
        c2d!.lineCap = "round";
        def.draw(c2d!, s);
        c2d!.restore();
      }

      if (!reduced) raf = requestAnimationFrame(tick);
    }

    resize();
    spawn();
    const onResize = () => {
      resize();
      spawn();
    };
    window.addEventListener("resize", onResize);

    if (reduced) {
      tick();
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener(SPARKKI_BG_NAV_EVENT, bumpNavEnergy);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 -z-20 h-full min-h-dvh w-full motion-reduce:opacity-40"
      aria-hidden
      data-reduced-motion={reducedMotion ? "" : undefined}
    />
  );
}
