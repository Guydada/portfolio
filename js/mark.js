/**
 * Abstract mark. Pretext measures a field of dots; we draw them on a path.
 * No words.
 */
import {
  prepareWithSegments,
  layoutWithLines,
} from "https://cdn.jsdelivr.net/npm/@chenglou/pretext@0.0.8/+esm";

const FONT = '11px "IBM Plex Mono"';
const DOTS = "·".repeat(240);
const reduced = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

let canvas = null;
let ctx = null;
let prepared = null;
let dots = [];
let raf = 0;
let t0 = 0;

function color() {
  return getComputedStyle(document.documentElement).getPropertyValue("--fg").trim() || "#111";
}

function path(i, n, w, h) {
  const u = n <= 1 ? 0 : i / (n - 1);
  return {
    x: u * w,
    y: h * 0.62 + Math.sin(u * Math.PI) * h * -0.32 + Math.sin(u * Math.PI * 5) * h * 0.05,
  };
}

function size() {
  const w = canvas.parentElement.clientWidth;
  const h = 96;
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

function layout() {
  if (!canvas || !ctx) return;
  const { w, h } = size();
  prepared ??= prepareWithSegments(DOTS, FONT);
  const { lines } = layoutWithLines(prepared, w, 14);
  const n = lines.reduce((sum, line) => sum + [...line.text].filter((ch) => ch === "·").length, 0);
  const count = Math.max(n, 80);
  const next = Array.from({ length: count }, (_, i) => path(i, count, w, h));
  const enter = dots.length === 0 && !reduced();
  dots = next.map((home, i) => ({
    home,
    x: home.x,
    y: enter ? h + 8 : dots[i]?.y ?? home.y,
    o: enter ? 0 : 1,
    delay: enter ? i * 6 : 0,
  }));
  t0 = performance.now();
  tick();
}

function tick() {
  cancelAnimationFrame(raf);
  const now = performance.now();
  let busy = false;
  for (const d of dots) {
    const p = Math.min(1, Math.max(0, (now - t0 - d.delay) / 480));
    const e = p === 1 ? 1 : 1 - 2 ** (-10 * p);
    d.x += (d.home.x - d.x) * 0.28;
    d.y += (d.home.y - d.y) * 0.28;
    d.o = e;
    if (e < 1 || Math.abs(d.y - d.home.y) > 0.2) busy = true;
  }
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.fillStyle = color();
  for (const d of dots) {
    ctx.globalAlpha = (d.o ?? 1) * 0.9;
    ctx.beginPath();
    ctx.arc(d.x, d.y, 1.15, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (busy) raf = requestAnimationFrame(tick);
}

function mount(el) {
  if (el.dataset.on) return;
  el.dataset.on = "1";
  canvas = el;
  ctx = el.getContext("2d");
  if (!ctx) return;
  new MutationObserver(() => tick()).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  layout();
  new ResizeObserver(() => layout()).observe(el.parentElement);
}

function boot() {
  const el = document.querySelector("canvas.mark");
  if (el) mount(el);
}

addEventListener("TrunkApplicationStarted", boot);
new MutationObserver(boot).observe(document.body, { childList: true, subtree: true });
boot();
