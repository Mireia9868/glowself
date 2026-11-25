#!/usr/bin/env python3
"""Generate 1200x630 Open Graph covers with Pillow."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "img" / "og"
OUT.mkdir(parents=True, exist_ok=True)
SEASONS = json.loads(Path("/tmp/seasons.json").read_text())

SONGTI = "/System/Library/Fonts/Supplemental/Songti.ttc"
SANS = "/System/Library/Fonts/Hiragino Sans GB.ttc"
W, H = 1200, 630
PAPER = (246, 241, 232)
INK = (31, 27, 22)
MUTED = (120, 109, 95)
ACCENT = (191, 75, 50)
LINE = (222, 211, 195)
CARD = (255, 253, 248)


def font(path, size, index=0):
    return ImageFont.truetype(path, size, index=index)


def text(d, xy, s, f, fill=INK, anchor="la"):
    d.text(xy, s, font=f, fill=fill, anchor=anchor)


def mark(d, x, y, scale=1.0):
    # four-petal bloom built from ellipses, matching the SVG mark
    petals = [(0, -1), (1, 0), (0, 1), (-1, 0)]
    colors = [(191, 75, 50), (173, 135, 73), (118, 131, 106), (191, 75, 50)]
    for i, (px, py) in enumerate(petals):
        cx = x + px * 8 * scale
        cy = y + py * 8 * scale
        r = 9 * scale
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=colors[i])
    d.ellipse([x - 4 * scale, y - 4 * scale, x + 4 * scale, y + 4 * scale], fill=PAPER)


def base(bg=PAPER):
    img = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(img)
    # subtle warm glow
    glow = Image.new("RGB", (W, H), bg)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([760, -180, 1320, 380], fill=(243, 216, 196))
    gd.ellipse([980, 360, 1360, 740], fill=(236, 222, 202))
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    img = Image.blend(img, glow, 0.55)
    d = ImageDraw.Draw(img)
    d.rectangle([36, 36, W - 36, H - 36], outline=LINE, width=1)
    return img, d


def brand(d, x=74, y=74, color=INK):
    mark(d, x + 12, y + 12, 0.85)
    text(d, (x + 42, y), "光绽 GlowSelf", font(SONGTI, 30), color)
    text(d, (x + 44, y + 38), "YOUR QUIET ADVANTAGE", font(SANS, 11), MUTED)


def footer(d, label):
    d.line([74, H - 92, W - 74, H - 92], fill=LINE, width=1)
    text(d, (74, H - 70), label, font(SANS, 16), MUTED)
    text(d, (W - 74, H - 70), "glowself.cn", font(SANS, 16), MUTED, anchor="ra")


# generic cover
img, d = base()
brand(d)
text(d, (74, 180), "别猜了，", font(SONGTI, 92))
f92 = font(SONGTI, 92)
w1 = d.textlength("你适合", font=f92)
text(d, (74, 292), "你适合", f92)
text(d, (74 + w1 + 2, 292), "什么", f92, ACCENT)
w2 = d.textlength("什么", font=f92)
text(d, (74 + w1 + w2 + 8, 292), "。", f92, ACCENT)
text(d, (78, 420), "3 分钟测出你的色彩 DNA 与风格坐标。", font(SANS, 23), (58, 51, 43))
text(d, (78, 458), "不评分，不排名，不用上传照片。", font(SANS, 23), MUTED)

# palette stack on right
palette = ["#C98B6B", "#E8D5C4", "#6B705C", "#8C6A5D", "#B7B7A4", "#DDBEA9"]
for i, hexv in enumerate(palette):
    cx = 820 + (i % 3) * 106
    cy = 250 + (i // 3) * 106
    d.ellipse([cx, cy, cx + 86, cy + 86], fill=hexv, outline=(255, 253, 248), width=4)
text(d, (820, 480), "12 季色彩 · 6 个本命色", font(SANS, 18), MUTED)
footer(d, "PERSONAL COLOUR & STYLE · 免费测试")
img.save(ROOT / "assets" / "img" / "og-cover.png", "PNG", optimize=True)

# season covers
for s in SEASONS:
    img, d = base()
    brand(d)
    text(d, (74, 168), "MY COLOUR DNA", font(SANS, 15), ACCENT)
    text(d, (70, 198), s["name"], font(SONGTI, 104))
    text(d, (76, 320), s["en"].upper(), font(SANS, 20), MUTED)
    # wrap tagline
    tag = s["tagline"]
    line1, line2 = tag[:19], tag[19:]
    text(d, (76, 378), line1, font(SANS, 19), (58, 51, 43))
    if line2:
        text(d, (76, 406), line2, font(SANS, 19), (58, 51, 43))
    d.ellipse([74, 462, 94, 482], fill=ACCENT)
    text(d, (104, 458), "不评分 · 不排名 · 找到你的本命色", font(SANS, 15), MUTED)

    for i, hexv in enumerate(s["palette"]):
        cx = 716 + (i % 4) * 102
        cy = 168 + (i // 4) * 102
        d.ellipse([cx, cy, cx + 84, cy + 84], fill=hexv, outline=CARD, width=3)
    footer(d, s["en"].upper() + " · 12 SEASONS")
    img.save(OUT / f"{s['id']}.png", "PNG", optimize=True)

print("generated", 1 + len(SEASONS), "covers")
