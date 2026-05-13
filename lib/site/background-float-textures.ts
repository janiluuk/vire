import * as THREE from "three";

const TEX = 256;

export type FloatIconKind =
  | "fi"
  | "eu"
  | "windows"
  | "apple"
  | "linux"
  | "firefox"
  | "libreoffice"
  | "vlc"
  | "gimp"
  | "blender"
  | "thunderbird"
  | "spotify";

function baseTexture(
  draw: (ctx: CanvasRenderingContext2D, s: number) => void,
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = TEX;
  c.height = TEX;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  draw(ctx, TEX);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Finnish flag — Nordic cross (simplified proportions). */
function drawFi(ctx: CanvasRenderingContext2D, s: number) {
  const blue = "#002F6C";
  const white = "#FFFFFF";
  ctx.fillStyle = white;
  ctx.fillRect(0, 0, s, s);
  const ch = s * 0.28;
  const ox = s * 0.32;
  const oy = s * 0.36;
  ctx.fillStyle = blue;
  ctx.fillRect(0, 0, ox, s);
  ctx.fillRect(0, oy, s, ch);
}

/** EU flag — blue field, circle of stars (simplified dots). */
function drawEu(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#003399";
  ctx.fillRect(0, 0, s, s);
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.34;
  ctx.fillStyle = "#FFCC00";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, s * 0.038, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Windows-style four panes (original-style palette). */
function drawWindows(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, s, s);
  const p = s * 0.08;
  const w = (s - p * 3) / 2;
  const cols = ["#F25022", "#7FBA00", "#00A4EF", "#FFB900"];
  let i = 0;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.fillStyle = cols[i++];
      ctx.fillRect(p + col * (w + p), p + row * (w + p), w, w);
    }
  }
}

/** Apple silhouette (generic, not trademark artwork). */
function drawApple(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#2d2d2d";
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = "#e8e8e8";
  ctx.beginPath();
  const cx = s * 0.5;
  const cy = s * 0.52;
  ctx.arc(cx, cy, s * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2d2d2d";
  ctx.beginPath();
  ctx.arc(cx + s * 0.02, cy - s * 0.38, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx + s * 0.22, cy - s * 0.05, s * 0.08, s * 0.12);
}

/** Tux-inspired penguin (simplified shapes). */
function drawLinux(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, s, s);
  const cx = s * 0.5;
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.ellipse(cx, s * 0.52, s * 0.22, s * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#eee";
  ctx.beginPath();
  ctx.ellipse(cx, s * 0.55, s * 0.12, s * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f5a623";
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.12, s * 0.48);
  ctx.lineTo(cx + s * 0.22, s * 0.5);
  ctx.lineTo(cx + s * 0.12, s * 0.55);
  ctx.fill();
  ctx.fillStyle = "#f5a623";
  ctx.fillRect(cx - s * 0.08, s * 0.78, s * 0.06, s * 0.1);
  ctx.fillRect(cx + s * 0.02, s * 0.78, s * 0.06, s * 0.1);
}

/** Firefox-inspired globe + flame palette (simplified). */
function drawFirefox(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#1a0a06";
  ctx.fillRect(0, 0, s, s);
  const g = ctx.createRadialGradient(s * 0.35, s * 0.4, 0, s * 0.5, s * 0.5, s * 0.45);
  g.addColorStop(0, "#36c5f0");
  g.addColorStop(0.45, "#9059ff");
  g.addColorStop(1, "#ff7139");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(s * 0.48, s * 0.5, s * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff7139";
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(s * 0.58, s * 0.38, s * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** LibreOffice-style document bars. */
function drawLibreOffice(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#2b2b2b";
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = "#fafafa";
  const m = s * 0.18;
  ctx.fillRect(m, m, s - m * 2, s - m * 2);
  const colors = ["#18a303", "#0e85d8", "#831311"];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(m, m + i * (s * 0.14), s * 0.35, s * 0.08);
  }
}

/** VLC cone (orange / white stripes). */
function drawVlc(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, s, s);
  ctx.save();
  ctx.translate(s / 2, s * 0.36);
  const strips = 6;
  for (let i = 0; i < strips; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#e85c0a" : "#f2f2f2";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const x1 = -s * 0.2 + i * (s * 0.067);
    const x2 = -s * 0.2 + (i + 1) * (s * 0.067);
    ctx.lineTo(x1, s * 0.55);
    ctx.lineTo(x2, s * 0.55);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** GIMP-inspired brush / mascot colors. */
function drawGimp(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#3d3d3d";
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = "#5db356";
  ctx.beginPath();
  ctx.arc(s * 0.42, s * 0.45, s * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c9692d";
  ctx.fillRect(s * 0.52, s * 0.38, s * 0.28, s * 0.08);
  ctx.fillStyle = "#fefefe";
  ctx.beginPath();
  ctx.arc(s * 0.38, s * 0.42, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
}

/** Blender-style orange mark. */
function drawBlender(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#242424";
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = "#e87d0d";
  ctx.beginPath();
  ctx.arc(s * 0.5, s * 0.5, s * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#7a7a7a";
  ctx.lineWidth = s * 0.045;
  ctx.beginPath();
  ctx.moveTo(s * 0.5, s * 0.28);
  ctx.lineTo(s * 0.5, s * 0.72);
  ctx.stroke();
}

/** Mail bird (Thunderbird-inspired blues). */
function drawThunderbird(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#0c1e35";
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = "#348eda";
  ctx.beginPath();
  ctx.moveTo(s * 0.15, s * 0.4);
  ctx.quadraticCurveTo(s * 0.5, s * 0.72, s * 0.85, s * 0.4);
  ctx.lineTo(s * 0.5, s * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#205680";
  ctx.beginPath();
  ctx.moveTo(s * 0.15, s * 0.42);
  ctx.lineTo(s * 0.5, s * 0.62);
  ctx.lineTo(s * 0.85, s * 0.42);
  ctx.lineTo(s * 0.5, s * 0.5);
  ctx.closePath();
  ctx.fill();
}

/** Spotify-style green disc. */
function drawSpotify(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#121212";
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = "#1db954";
  ctx.beginPath();
  ctx.arc(s * 0.5, s * 0.5, s * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#121212";
  ctx.lineWidth = s * 0.05;
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(s * 0.5, s * 0.52, s * (0.18 + i * 0.06), -0.35, 0.35);
    ctx.stroke();
  }
}

const BUILDERS: Record<FloatIconKind, (ctx: CanvasRenderingContext2D, s: number) => void> =
  {
    fi: drawFi,
    eu: drawEu,
    windows: drawWindows,
    apple: drawApple,
    linux: drawLinux,
    firefox: drawFirefox,
    libreoffice: drawLibreOffice,
    vlc: drawVlc,
    gimp: drawGimp,
    blender: drawBlender,
    thunderbird: drawThunderbird,
    spotify: drawSpotify,
  };

/** Weighted pool: flags and OS get slightly higher weight so they appear often. */
const WEIGHTED_KINDS: FloatIconKind[] = [
  "fi",
  "fi",
  "eu",
  "eu",
  "windows",
  "apple",
  "linux",
  "firefox",
  "libreoffice",
  "vlc",
  "gimp",
  "blender",
  "thunderbird",
  "spotify",
];

const textureCache = new Map<FloatIconKind, THREE.CanvasTexture>();

export function getFloatIconTexture(kind: FloatIconKind): THREE.CanvasTexture {
  let t = textureCache.get(kind);
  if (!t) {
    t = baseTexture(BUILDERS[kind]);
    textureCache.set(kind, t);
  }
  return t;
}

export function pickFloatIconKind(): FloatIconKind {
  return WEIGHTED_KINDS[Math.floor(Math.random() * WEIGHTED_KINDS.length)]!;
}

export function disposeFloatIconTextures() {
  textureCache.forEach((tex) => tex.dispose());
  textureCache.clear();
}
