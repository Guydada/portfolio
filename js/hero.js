/**
 * Hero type, laid out with Pretext and drawn to canvas.
 * prepare() once per font size; layout() on every resize — no DOM reflow.
 */
import {
  prepareWithSegments,
  layoutWithLines,
} from "https://cdn.jsdelivr.net/npm/@chenglou/pretext@0.0.8/+esm";

/** @typedef {{ ch: string, homeX: number, homeY: number, x: number, y: number, o: number, delay: number }} Glyph */

let canvas = null;
let ctx = null;
let color = "#111111";
let text = "";
let prepared = null;
let fontSpec = "";
let fontSize = 0;
let glyphs = /** @type {Glyph[]} */ ([]);
let raf = 0;
let startedAt = 0;
let observer = null;
let playing = false;
const DURATION_MS = 520;
const STAGGER_MS = 14;

/**
 * @param {HTMLCanvasElement} canvasEl
 * @param {string} heroText
 * @param {string} fillColor
 */
export function mountHero(canvasEl, heroText, fillColor) {
  unmountHero();
  canvas = canvasEl;
  text = heroText;
  color = fillColor;
  ctx = canvas.getContext("2d");
  if (ctx === null) {
    return;
  }

  const parent = canvas.parentElement;
  if (parent === null) {
    return;
  }

  let ready = false;
  observer = new ResizeObserver(() => {
    if (!ready) {
      return;
    }
    layoutHero(false);
  });
  observer.observe(parent);

  const start = () => {
    layoutHero(true);
    ready = true;
  };

  if (document.fonts && document.fonts.status !== "loaded") {
    document.fonts.ready.then(start).catch(start);
  } else {
    start();
  }
}

/**
 * @param {string} fillColor
 */
export function setHeroColor(fillColor) {
  color = fillColor;
  if (!playing) {
    draw(1);
  }
}

export function unmountHero() {
  playing = false;
  if (raf !== 0) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  if (observer !== null) {
    observer.disconnect();
    observer = null;
  }
  prepared = null;
  glyphs = [];
  canvas = null;
  ctx = null;
}

/**
 * @param {boolean} animate
 */
function layoutHero(animate) {
  if (canvas === null || ctx === null) {
    return;
  }
  const parent = canvas.parentElement;
  if (parent === null) {
    return;
  }

  const cssWidth = Math.max(1, parent.clientWidth);
  const nextSize = fontSizeFor(cssWidth);
  const nextFont = `400 ${nextSize}px "Instrument Serif"`;
  const lineHeight = Math.round(nextSize * 1.12);

  if (prepared === null || nextFont !== fontSpec) {
    fontSpec = nextFont;
    fontSize = nextSize;
    prepared = prepareWithSegments(text, fontSpec, { letterSpacing: -1 });
  }

  const { lines, height } = layoutWithLines(prepared, cssWidth, lineHeight);
  const nextGlyphs = glyphsFromLines(prepared, lines, lineHeight);
  const reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (animate && !reduced && glyphs.length === 0) {
    glyphs = nextGlyphs.map((glyph, index) => ({
      ...glyph,
      x: glyph.homeX,
      y: glyph.homeY + Math.min(18, fontSize * 0.16),
      o: 0,
      delay: index * STAGGER_MS,
    }));
    startedAt = performance.now();
    playing = true;
  } else if (glyphs.length === nextGlyphs.length) {
    glyphs = glyphs.map((glyph, index) => ({
      ...nextGlyphs[index],
      x: glyph.x,
      y: glyph.y,
      o: glyph.o,
      delay: 0,
    }));
    startedAt = performance.now();
    playing = true;
  } else {
    glyphs = nextGlyphs.map((glyph) => ({
      ...glyph,
      x: glyph.homeX,
      y: glyph.homeY,
      o: 1,
      delay: 0,
    }));
    playing = false;
  }

  sizeCanvas(cssWidth, Math.max(height, lineHeight) + 8);
  if (playing) {
    tick();
  } else {
    draw(1);
  }
}

/**
 * @param {number} width
 * @returns {number}
 */
function fontSizeFor(width) {
  if (width < 420) {
    return 52;
  }
  if (width < 640) {
    return 72;
  }
  return 96;
}

/**
 * @param {object} handle
 * @param {Array<{ text: string, width: number, start: { segmentIndex: number, graphemeIndex: number }, end: { segmentIndex: number, graphemeIndex: number } }>} lines
 * @param {number} lineHeight
 * @returns {Glyph[]}
 */
function glyphsFromLines(handle, lines, lineHeight) {
  const result = /** @type {Glyph[]} */ ([]);
  const segments = handle.segments;
  const widths = handle.widths;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    let x = 0;
    let segmentIndex = line.start.segmentIndex;
    let graphemeIndex = line.start.graphemeIndex;
    const endSegment = line.end.segmentIndex;
    const endGrapheme = line.end.graphemeIndex;

    while (
      segmentIndex < endSegment ||
      (segmentIndex === endSegment && graphemeIndex < endGrapheme)
    ) {
      const segment = segments[segmentIndex];
      const graphemes = [...segment];
      if (graphemeIndex >= graphemes.length) {
        segmentIndex += 1;
        graphemeIndex = 0;
        continue;
      }
      const ch = graphemes[graphemeIndex];
      const advance = glyphAdvance(widths[segmentIndex], graphemes.length);
      if (ch !== "\n") {
        result.push({
          ch,
          homeX: x,
          homeY: lineIndex * lineHeight,
          x,
          y: lineIndex * lineHeight,
          o: 1,
          delay: 0,
        });
        x += advance;
      }
      graphemeIndex += 1;
      if (graphemeIndex >= graphemes.length) {
        segmentIndex += 1;
        graphemeIndex = 0;
      }
    }
  }
  return result;
}

/**
 * @param {number} segmentWidth
 * @param {number} graphemeCount
 * @returns {number}
 */
function glyphAdvance(segmentWidth, graphemeCount) {
  if (graphemeCount <= 1) {
    return segmentWidth;
  }
  return segmentWidth / graphemeCount;
}

/**
 * @param {number} cssWidth
 * @param {number} cssHeight
 */
function sizeCanvas(cssWidth, cssHeight) {
  if (canvas === null) {
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.max(1, Math.round(cssWidth * dpr));
  canvas.height = Math.max(1, Math.round(cssHeight * dpr));
  if (ctx !== null) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

function tick() {
  if (!playing) {
    return;
  }
  const now = performance.now();
  let done = true;
  for (const glyph of glyphs) {
    const t = easeOutExpo(progress(now, glyph.delay));
    glyph.x = lerp(glyph.x, glyph.homeX, 0.35);
    glyph.y = lerp(glyph.y, glyph.homeY, 0.35);
    glyph.o = t;
    if (t < 1 || Math.abs(glyph.y - glyph.homeY) > 0.15) {
      done = false;
    }
  }
  draw(1);
  if (done) {
    playing = false;
    glyphs.forEach((glyph) => {
      glyph.x = glyph.homeX;
      glyph.y = glyph.homeY;
      glyph.o = 1;
    });
    draw(1);
    return;
  }
  raf = requestAnimationFrame(tick);
}

/**
 * @param {number} now
 * @param {number} delay
 * @returns {number}
 */
function progress(now, delay) {
  const t = (now - startedAt - delay) / DURATION_MS;
  if (t <= 0) {
    return 0;
  }
  if (t >= 1) {
    return 1;
  }
  return t;
}

/**
 * @param {number} t
 * @returns {number}
 */
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - 2 ** (-10 * t);
}

/**
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * @param {number} _t
 */
function draw(_t) {
  if (canvas === null || ctx === null) {
    return;
  }
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);
  ctx.font = fontSpec;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  for (const glyph of glyphs) {
    ctx.globalAlpha = glyph.o;
    ctx.fillText(glyph.ch, glyph.x, glyph.y);
  }
  ctx.globalAlpha = 1;
}
