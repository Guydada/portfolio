/**
 * Sea mark. Pretext measures a glyph palette; density follows rolling waves.
 */
import { prepareWithSegments } from "https://cdn.jsdelivr.net/npm/@chenglou/pretext@0.0.8/+esm";

const SIZE = 13;
const LEAD = 15;
const FACE = '"Instrument Serif", Georgia, serif';
const INK = "~-_=.,:;+*=#";
const LAYERS = [
  { mid: 0.24, amp: 0.09, k: 1.1, w: 0.82, thick: 0.042 },
  { mid: 0.5, amp: 0.11, k: 1.75, w: -1.05, thick: 0.05 },
  { mid: 0.76, amp: 0.08, k: 0.82, w: 0.46, thick: 0.04 },
];
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

let canvas;
let ctx;
let glyphs = [];
let cols = 0;
let rows = 0;
let cellW = 8;
let pointer = null;
let raf = 0;

function color() {
  return (
    getComputedStyle(document.documentElement).getPropertyValue("--fg").trim() ||
    "#111"
  );
}

function sizeCanvas() {
  const w = canvas.parentElement.clientWidth;
  const h = 188;
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
  rows = Math.max(8, Math.min(18, Math.floor(h / LEAD)));
  cellW = w / cols;
}

function swell(x, t, layer) {
  return (
    Math.sin(x * Math.PI * 2 * layer.k + t * layer.w) * layer.amp +
    Math.sin(x * Math.PI * 2 * layer.k * 2.2 + t * layer.w * 0.35) * layer.amp * 0.28
  );
}

function ink(x, y, t) {
  let v = 0;
  for (const layer of LAYERS) {
    let wy = layer.mid + swell(x, t, layer);
    if (pointer) {
      const d = Math.hypot(x - pointer.x, (y - pointer.y) * 0.55);
      wy += Math.sin(d * 24 - t * 5.5) * Math.exp(-d * 6.5) * 0.09;
    }
    const dist = y - wy;
    const crest = Math.exp((-dist * dist) / (2 * layer.thick * layer.thick));
    const body =
      dist > 0
        ? Math.exp((-dist * dist) / (2 * (layer.thick * 2.6) ** 2)) * 0.38
        : 0;
    v = Math.max(v, crest + body);
  }
  return Math.min(1, v);
}

function draw(t) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = color();
  ctx.textBaseline = "top";
  const top = (h - rows * LEAD) / 2;
  for (let r = 0; r < rows; r += 1) {
    let x = 0;
    const y = top + r * LEAD;
    const ny = (r + 0.5) / rows;
    for (let c = 0; c < cols; c += 1) {
      const nx = (c + 0.5) / cols;
      const b = ink(nx, ny, t);
      if (b < 0.05) {
        x += cellW;
        continue;
      }
      const g = pick(glyphs, b);
      ctx.globalAlpha = Math.min(1, 0.22 + b * 0.82);
      ctx.font = g.font;
      ctx.fillText(g.ch, x, y);
      x += g.width;
    }
  }
  ctx.globalAlpha = 1;
}

function loop(now) {
  draw(reduced() ? 0 : now / 1000);
  if (!reduced()) raf = requestAnimationFrame(loop);
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
  new MutationObserver(() => draw(performance.now() / 1000)).observe(
    document.documentElement,
    { attributes: true, attributeFilter: ["data-theme"] }
  );
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
  raf = requestAnimationFrame(loop);
}

async function boot() {
  try {
    await document.fonts.ready;
  } catch {
    /* fallback metrics */
  }
  const el = document.querySelector("canvas.mark");
  if (el) mount(el);
}

addEventListener("TrunkApplicationStarted", boot);
new MutationObserver(boot).observe(document.body, { childList: true, subtree: true });
boot();
