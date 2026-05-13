/**
 * Local-time background luminance for marketing shell (0 = night, 1 = day).
 * Evening hours darken toward the baseline night palette.
 */

/** Sparkki matte charcoal — aligned with `app/globals.css` :root */
const NIGHT = {
  bg: [16, 18, 20] as const,
  bg2: [23, 26, 31] as const,
  bg3: [32, 36, 43] as const,
  bg4: [42, 48, 57] as const,
};

const DAY = {
  bg: [28, 32, 38] as const,
  bg2: [36, 40, 48] as const,
  bg3: [44, 50, 58] as const,
  bg4: [52, 58, 68] as const,
};

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function lerpChannel(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function toHex(rgb: readonly [number, number, number]): string {
  const [r, g, b] = rgb;
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function lerpRgb(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number,
): string {
  const u = clamp01(t);
  return toHex([
    lerpChannel(a[0], b[0], u),
    lerpChannel(a[1], b[1], u),
    lerpChannel(a[2], b[2], u),
  ]);
}

/** Fractional hour in local timezone, [0, 24). */
export function localHourFraction(now: Date = new Date()): number {
  return (
    now.getHours() +
    now.getMinutes() / 60 +
    now.getSeconds() / 3600
  );
}

/**
 * Brightness blend factor: 0 → night palette, 1 → day palette.
 * Evening (roughly 17:00–20:30) transitions down; deep night stays dark.
 */
export function getDaytimeBrightness(now: Date = new Date()): number {
  const h = localHourFraction(now);
  if (h >= 22 || h < 5) return 0.08;
  if (h < 7.5) return 0.08 + (0.92 * (h - 5)) / 2.5;
  if (h < 17) return 1;
  if (h < 20.5) return 1 - (0.9 * (h - 17)) / 3.5;
  if (h < 22) return 0.1 - (0.02 * (h - 20.5)) / 1.5;
  return 0.08;
}

export type DaytimeCssSnapshot = {
  "--bg": string;
  "--bg2": string;
  "--bg3": string;
  "--bg4": string;
  "--background": string;
};

export function getDaytimeCssVars(now: Date = new Date()): DaytimeCssSnapshot {
  const t = getDaytimeBrightness(now);
  const bg = lerpRgb(NIGHT.bg, DAY.bg, t);
  const bg2 = lerpRgb(NIGHT.bg2, DAY.bg2, t);
  const bg3 = lerpRgb(NIGHT.bg3, DAY.bg3, t);
  const bg4 = lerpRgb(NIGHT.bg4, DAY.bg4, t);
  return {
    "--bg": bg,
    "--bg2": bg2,
    "--bg3": bg3,
    "--bg4": bg4,
    "--background": bg,
  };
}

export function applyDaytimeCssVars(
  root: HTMLElement,
  now: Date = new Date(),
): void {
  const vars = getDaytimeCssVars(now);
  for (const [k, v] of Object.entries(vars)) {
    root.style.setProperty(k, v);
  }
}
