"""Paint the 1200x630 JPEG link-preview card: geometric G over three swells."""

from __future__ import annotations

import math
from pathlib import Path
from typing import Final

from PIL import Image, ImageDraw

WIDTH: Final[int] = 1200
HEIGHT: Final[int] = 630
SCALE: Final[int] = 2
BG: Final[str] = "#f7f6f2"
FG: Final[tuple[int, int, int]] = (0x11, 0x11, 0x11)
OUT: Final[Path] = Path(__file__).with_name("og.jpg")

# Same swells as js/mark.js, frozen, inked heavy enough to read at thumbnail size.
LAYERS: Final[tuple[dict[str, float], ...]] = (
    {"mid": 0.30, "amp": 0.11, "k": 1.05, "w": 0.65, "alpha": 0.40, "line": 7.0},
    {"mid": 0.50, "amp": 0.14, "k": 1.55, "w": -0.9, "alpha": 0.70, "line": 9.0},
    {"mid": 0.70, "amp": 0.11, "k": 0.88, "w": 0.48, "alpha": 1.0, "line": 11.0},
)
T: Final[float] = 1.7


def wave_y(x: float, width: float, height: float, layer: dict[str, float]) -> float:
    """Height of one swell at x. Matches mark.js yAt without the pointer ripple."""
    nx: float = x / width
    y: float = layer["mid"] * height + math.sin(
        nx * math.pi * 2.0 * layer["k"] + T * layer["w"]
    ) * layer["amp"] * height
    y += (
        math.sin(nx * math.pi * 2.0 * layer["k"] * 2.05 + T * layer["w"] * 0.38)
        * layer["amp"]
        * height
        * 0.22
    )
    return y


def ink(alpha: float) -> tuple[int, int, int, int]:
    """Foreground at the given opacity."""
    return (FG[0], FG[1], FG[2], max(0, min(255, round(alpha * 255))))


def draw_waves(draw: ImageDraw.ImageDraw, width: int, height: int) -> None:
    """Stroke the three swells and tick them with beads."""
    pad_y: float = height * 0.12
    band_h: float = height - pad_y * 2.0
    px: float = float(SCALE)
    for layer in LAYERS:
        color: tuple[int, int, int, int] = ink(layer["alpha"])
        pts: list[tuple[float, float]] = []
        x: int = 0
        step: int = 2 * SCALE
        while x <= width:
            pts.append((float(x), pad_y + wave_y(float(x), float(width), band_h, layer)))
            x += step
        draw.line(pts, fill=color, width=max(1, round(layer["line"] * px)), joint="curve")
        bead_r: float = 3.1 * px
        gap: float = 20.0 * px
        bx: float = gap / 2.0
        bead: tuple[int, int, int, int] = ink(min(1.0, layer["alpha"] + 0.12))
        while bx < width:
            y: float = pad_y + wave_y(bx, float(width), band_h, layer)
            draw.ellipse(
                (bx - bead_r, y - bead_r, bx + bead_r, y + bead_r),
                fill=bead,
            )
            bx += gap


def draw_g(draw: ImageDraw.ImageDraw, height: int) -> None:
    """Open ring plus crossbar — same G as the tab icon, scaled up."""
    scale: float = 14.2 * SCALE
    ox: float = 108.0 * SCALE
    oy: float = (height - 32.0 * scale) / 2.0
    stroke: int = max(1, round(2.3 * scale))
    cx: float = ox + 16.0 * scale
    cy: float = oy + 16.0 * scale
    r: float = 8.4 * scale
    box: tuple[float, float, float, float] = (cx - r, cy - r, cx + r, cy + r)
    start: float = math.degrees(math.atan2(10.6 - 16.0, 22.4 - 16.0))
    end: float = math.degrees(math.atan2(21.4 - 16.0, 22.4 - 16.0))
    draw.arc(box, start=end, end=start, fill=FG, width=stroke)
    y: float = cy
    x0: float = ox + 15.5 * scale
    x1: float = ox + (15.5 + 8.6) * scale
    draw.line((x0, y, x1, y), fill=FG, width=stroke)
    half: float = stroke / 2.0
    draw.rectangle((x1 - half, y - half, x1 + half, y + half), fill=FG)
    for ang_deg in (end, start):
        ang: float = math.radians(ang_deg)
        px: float = cx + r * math.cos(ang)
        py: float = cy + r * math.sin(ang)
        draw.rectangle((px - half, py - half, px + half, py + half), fill=FG)


def main() -> None:
    """Write og.jpg next to this script."""
    w: int = WIDTH * SCALE
    h: int = HEIGHT * SCALE
    img: Image.Image = Image.new("RGB", (w, h), BG)
    overlay: Image.Image = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw: ImageDraw.ImageDraw = ImageDraw.Draw(overlay)
    draw_waves(draw, w, h)
    draw_g(draw, h)
    img.paste(overlay, mask=overlay)
    img = img.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    img.convert("RGB").save(OUT, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
