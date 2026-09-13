#!/usr/bin/env python3
"""Build compressed Open Graph + favicon assets for Liora."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ICONS = ROOT / 'icons'
ORIGIN_BLUE = (37, 99, 235)
DEEP = (29, 78, 216)
INK_WHITE = (255, 255, 255)
SOFT = (226, 232, 240)

BOLD = '/usr/share/fonts/truetype/macos/Inter-Bold.ttf'
SEMI = '/usr/share/fonts/truetype/macos/Inter-SemiBold.ttf'


def rounded_rect(draw: ImageDraw.ImageDraw, box, radius: int, fill) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def main() -> None:
    ICONS.mkdir(exist_ok=True)
    img = Image.new('RGB', (1200, 630), ORIGIN_BLUE)
    draw = ImageDraw.Draw(img)
    draw.ellipse((-180, -220, 420, 380), fill=DEEP)
    draw.ellipse((820, 280, 1380, 860), fill=DEEP)
    rounded_rect(draw, (72, 72, 168, 168), 28, INK_WHITE)
    mark = ImageFont.truetype(BOLD, 64)
    title = ImageFont.truetype(BOLD, 96)
    sub = ImageFont.truetype(SEMI, 36)
    draw.text((104, 86), 'L', font=mark, fill=ORIGIN_BLUE)
    draw.text((72, 250), 'Liora', font=title, fill=INK_WHITE)
    draw.text((72, 370), 'What you still have left to spend.', font=sub, fill=SOFT)
    draw.text((72, 424), 'Local ledger · Hindi + English', font=sub, fill=SOFT)
    out = ICONS / 'og.png'
    img.save(out, format='PNG', optimize=True)
    icon = Image.open(ICONS / 'icon-512.png').convert('RGBA')
    icon.resize((32, 32), Image.Resampling.LANCZOS).save(ICONS / 'favicon-32.png', format='PNG', optimize=True)
    ico = icon.resize((48, 48), Image.Resampling.LANCZOS)
    ico.save(ICONS / 'favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print('wrote', out, 'bytes', out.stat().st_size)


if __name__ == '__main__':
    main()
