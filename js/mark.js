/**
 * Sea mark: three traveling swells. Pretext measures the bead spacing.
 */
import { prepareWithSegments } from "https://cdn.jsdelivr.net/npm/@chenglou/pretext@0.0.8/+esm";

const FONT = '400 13px "Instrument Serif", Georgia, serif';
const LAYERS = [
  { mid: 0.3, amp: 0.1, k: 1.05, w: 0.65, alpha: 0.28, line: 1 },
  { mid: 0.5, amp: 0.13, k: 1.55, w: -0.9, alpha: 0.55, line: 1.2 },
  { mid: 0.7, amp: 0.1, k: 0.88, w: 0.48, alpha: 1, line: 1.45 },
];
const reduced = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

let canvas;
let ctx;
let bead = { ch: "·", font: FONT, width: 8 };
let pointer = null;
let raf = 0;
let cssW = 0;
let cssH = 0;

function color() {
  return (
    getComputedStyle(document.documentElement).getPropertyValue("--fg").trim() ||
    "#111"
  );
}

function sizeCanvas() {
  const w = canvas.parentElement.clientWidth;
  const h = 148;
  if (w === cssW && h === cssH && canvas.width) return { w, h };
  cssW = w;
  cssH = h;
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

function yAt(x, w, h, t, layer) {
  const nx = x / w;
  let y =
    layer.mid * h +
    Math.sin(nx * Math.PI * 2 * layer.k + t * layer.w) * layer.amp * h +
    Math.sin(nx * Math.PI * 2 * layer.k * 2.05 + t * layer.w * 0.38) *
      layer.amp *
      h *
      0.22;
  if (pointer) {
    const d = Math.hypot(nx - pointer.x, y / h - pointer.y);
    y += Math.sin(d * 16 - t * 6) * Math.exp(-d * 7) * 20;
  }
  return y;
}

function draw(t) {
  const { w, h } = sizeCanvas();
  ctx.clearRect(0, 0, w, h);
  const fg = color();
  ctx.strokeStyle = fg;
  ctx.fillStyle = fg;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.font = bead.font;

  for (const layer of LAYERS) {
    ctx.globalAlpha = layer.alpha;
    ctx.lineWidth = layer.line;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const y = yAt(x, w, h, t, layer);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const gap = bead.width + 7;
    ctx.globalAlpha = Math.min(1, layer.alpha + 0.15);
    for (let x = gap / 2; x < w; x += gap) {
      ctx.fillText(bead.ch, x, yAt(x, w, h, t, layer));
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
  const prepared = prepareWithSegments("·", FONT);
  bead = { ch: "·", font: FONT, width: prepared.widths[0] || 8 };
  new ResizeObserver(() => draw(performance.now() / 1000)).observe(el.parentElement);
  new MutationObserver(() => {
    draw(performance.now() / 1000);
    window.paintChrome?.();
  }).observe(document.documentElement, {
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
