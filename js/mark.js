/**
 * Fluid mark. Pretext measures a glyph palette; density is a smoke field.
 * Characters are ink, not language.
 */
import { prepareWithSegments } from "https://cdn.jsdelivr.net/npm/@chenglou/pretext@0.0.8/+esm";

const SIZE = 13;
const LEAD = 15;
const FACE = '"Instrument Serif", Georgia, serif';
const INK = ".,:;+-=*#@%&";
const reduced = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

const probe = document.createElement("canvas");
probe.width = probe.height = 24;
const pctx = probe.getContext("2d", { willReadFrequently: true });

function brightness(ch, font) {
  pctx.clearRect(0, 0, 24, 24);
  pctx.font = font;
  pctx.fillStyle = "#fff";
  pctx.textBaseline = "middle";
  pctx.fillText(ch, 1, 12);
  const data = pctx.getImageData(0, 0, 24, 24).data;
  let sum = 0;
  for (let i = 3; i < data.length; i += 4) sum += data[i];
  return sum / (255 * 576);
}

function palette() {
  const out = [];
  for (const italic of [false, true]) {
    for (const weight of [400, 700]) {
      const font = `${italic ? "italic " : ""}${weight} ${SIZE}px ${FACE}`;
      for (const ch of INK) {
        const prepared = prepareWithSegments(ch, font);
        const width = prepared.widths[0] ?? 0;
        if (width <= 0) continue;
        out.push({ ch, font, width, b: brightness(ch, font) });
      }
    }
  }
  const max = Math.max(...out.map((g) => g.b), 1e-6);
  for (const g of out) g.b /= max;
  out.sort((a, b) => a.b - b.b);
  return out;
}

function pick(glyphs, target) {
  let lo = 0;
  let hi = glyphs.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (glyphs[mid].b < target) lo = mid + 1;
    else hi = mid;
  }
  return glyphs[lo];
}

const emitters = [
  { x: 0.22, y: 0.45, r: 0.16, f: 0.28, p: 0.2, s: 0.22 },
  { x: 0.68, y: 0.4, r: 0.12, f: 0.22, p: 2.0, s: 0.18 },
  { x: 0.48, y: 0.62, r: 0.18, f: 0.34, p: 4.1, s: 0.2 },
];

let canvas;
let ctx;
let glyphs = [];
let cols = 0;
let rows = 0;
let cellW = 8;
let dens;
let scratch;
let pointer = null;
let raf = 0;
let aspect = 1;

function color() {
  return (
    getComputedStyle(document.documentElement).getPropertyValue("--fg").trim() ||
    "#111"
  );
}

function sizeCanvas() {
  const w = canvas.parentElement.clientWidth;
  const h = 176;
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

function reset() {
  const { w, h } = sizeCanvas();
  const avg = glyphs.reduce((s, g) => s + g.width, 0) / glyphs.length;
  cols = Math.max(24, Math.min(110, Math.floor(w / avg)));
  rows = Math.max(8, Math.min(16, Math.floor(h / LEAD)));
  cellW = w / cols;
  aspect = avg / LEAD;
  dens = new Float32Array(cols * rows);
  scratch = new Float32Array(cols * rows);
}

function vel(c, r, t) {
  const nx = c / cols;
  const ny = r / rows;
  const vx =
    Math.sin(ny * 6.28 + t * 0.32) * 1.6 +
    Math.cos((nx + ny) * 11 + t * 0.5) * 0.55;
  let vy =
    Math.cos(nx * 5 + t * 0.38) * 1.1 + Math.sin((nx - ny) * 9 + t * 0.42) * 0.6;
  vy *= aspect;
  return [vx, vy];
}

function sample(arr, x, y) {
  const x0 = x | 0;
  const y0 = y | 0;
  const x1 = Math.min(x0 + 1, cols - 1);
  const y1 = Math.min(y0 + 1, rows - 1);
  const fx = x - x0;
  const fy = y - y0;
  return (
    arr[y0 * cols + x0] * (1 - fx) * (1 - fy) +
    arr[y0 * cols + x1] * fx * (1 - fy) +
    arr[y1 * cols + x0] * (1 - fx) * fy +
    arr[y1 * cols + x1] * fx * fy
  );
}

function puff(ex, ey, strength) {
  const spread = 3.2;
  const ec = ex | 0;
  const er = ey | 0;
  for (let dr = -4; dr <= 4; dr += 1) {
    for (let dc = -4; dc <= 4; dc += 1) {
      const rr = er + dr;
      const cc = ec + dc;
      if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) continue;
      const dist = Math.hypot(dc, dr / aspect);
      const s = Math.max(0, 1 - dist / (spread + 1));
      dens[rr * cols + cc] = Math.min(1, dens[rr * cols + cc] + s * strength);
    }
  }
}

function step(t) {
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const [vx, vy] = vel(c, r, t);
      const sx = Math.max(0, Math.min(cols - 1.001, c - vx));
      const sy = Math.max(0, Math.min(rows - 1.001, r - vy));
      scratch[r * cols + c] = sample(dens, sx, sy);
    }
  }
  [dens, scratch] = [scratch, dens];

  const a2 = aspect * aspect;
  for (let r = 1; r < rows - 1; r += 1) {
    for (let c = 1; c < cols - 1; c += 1) {
      const i = r * cols + c;
      const avg =
        (dens[i - 1] + dens[i + 1] + (dens[i - cols] + dens[i + cols]) * a2) /
        (2 + 2 * a2);
      scratch[i] = dens[i] * 0.9 + avg * 0.1;
    }
  }
  [dens, scratch] = [scratch, dens];

  for (const e of emitters) {
    puff(
      (e.x + Math.cos(t * e.f + e.p) * e.r) * cols,
      (e.y + Math.sin(t * e.f * 0.7 + e.p) * e.r * 0.75) * rows,
      e.s
    );
  }
  if (pointer) puff(pointer.x * cols, pointer.y * rows, 0.28);
  for (let i = 0; i < dens.length; i += 1) dens[i] *= 0.982;
}

function draw() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = color();
  ctx.textBaseline = "top";
  for (let r = 0; r < rows; r += 1) {
    let x = 0;
    const y = r * LEAD + (h - rows * LEAD) / 2;
    for (let c = 0; c < cols; c += 1) {
      const b = dens[r * cols + c];
      if (b < 0.04) {
        x += cellW;
        continue;
      }
      const g = pick(glyphs, b);
      ctx.globalAlpha = Math.min(1, 0.2 + b * 0.85);
      ctx.font = g.font;
      ctx.fillText(g.ch, x, y);
      x += g.width;
    }
  }
  ctx.globalAlpha = 1;
}

function loop(now) {
  if (!reduced()) step(now / 1000);
  draw();
  raf = requestAnimationFrame(loop);
}

function mount(el) {
  if (el.dataset.on) return;
  el.dataset.on = "1";
  canvas = el;
  ctx = el.getContext("2d");
  if (!ctx) return;
  glyphs = palette();
  reset();
  new ResizeObserver(() => reset()).observe(el.parentElement);
  new MutationObserver(() => draw()).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  el.addEventListener("pointermove", (ev) => {
    const box = el.getBoundingClientRect();
    pointer = {
      x: (ev.clientX - box.left) / box.width,
      y: (ev.clientY - box.top) / box.height,
    };
  });
  el.addEventListener("pointerleave", () => {
    pointer = null;
  });
  if (reduced()) {
    step(0);
    draw();
    return;
  }
  raf = requestAnimationFrame(loop);
}

async function boot() {
  try {
    await document.fonts.ready;
  } catch {
    /* use fallback metrics */
  }
  const el = document.querySelector("canvas.mark");
  if (el) mount(el);
}

addEventListener("TrunkApplicationStarted", boot);
new MutationObserver(boot).observe(document.body, { childList: true, subtree: true });
boot();
