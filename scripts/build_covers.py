#!/usr/bin/env python3
"""Generate 1080x1440 Xiaohongshu covers for the 30-day content pack."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "growth" / "content" / "covers"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1440
PAPER = "#F6F1E8"
INK = "#1F1B16"
MUTED = "#786D5F"
LINE = "#DED3C3"
ACCENT = "#BF4B32"
SAGE = "#76836A"
GOLD = "#AD8749"
CARD = "#FFFDF8"
SONGTI = "/System/Library/Fonts/Supplemental/Songti.ttc"
PINGFANG = "/System/Library/Fonts/Hiragino Sans GB.ttc"

def serif(size, index=0):
    return ImageFont.truetype(SONGTI, size, index=index)

def sans(size, index=0):
    return ImageFont.truetype(PINGFANG, size, index=index)

def text(d, xy, s, font, fill=INK, anchor=None):
    d.text(xy, s, font=font, fill=fill, anchor=anchor)

def fit(d, lines, max_w=920, start=100, min_size=58):
    size = start
    while size > min_size:
        f = serif(size)
        if max(d.textlength(line, font=f) for line in lines) <= max_w:
            return f, size
        size -= 2
    return serif(min_size), min_size

COVERS = [
    {
        "id": "note01", "label": "COLOUR · 01", "lines": ["你不是穿黑色显瘦，", "是穿错了黑"],
        "accent": 1, "palette": ["#1F1B16", "#2B2F38", "#3A332B", "#6B5B4A", "#B9A48A"],
        "tags": ["冷黑", "暖黑", "柔黑"], "note": "先看底色，再看明度。",
    },
    {
        "id": "note02", "label": "COLOUR · 02", "lines": ["12季色彩不是智商税，", "4季才是"],
        "accent": 1, "palette": ["#7C8FA6", "#B9A48A", "#8C9A72", "#D9B7A4", "#5B4A63", "#C46B52"],
        "tags": ["12季", "不是4季"], "note": "多出来的不是名字，是选择。",
    },
    {
        "id": "note03", "label": "FACE · 03", "lines": ["方圆脸别剪齐刘海，", "先把重心提上去"],
        "accent": 1, "palette": ["#1F1B16", "#BF4B32", "#AD8749", "#76836A", "#E8DDD0"],
        "tags": ["圆脸", "方脸", "方圆脸"], "note": "不是遮脸，是重新分配重心。",
    },
    {
        "id": "note04", "label": "BODY · 04", "lines": ["梨形不是遮胯，", "是把视线提到肩"],
        "accent": 1, "palette": ["#2F3438", "#7B6A58", "#C2A58C", "#E3D5C4", "#F1E8DC"],
        "tags": ["梨形", "肩线", "比例"], "note": "先立肩，再谈显瘦。",
    },
    {
        "id": "note05", "label": "WARDROBE · 05", "lines": ["24件衣服", "够穿一季，", "不是极简"],
        "accent": 2, "palette": ["#1F1B16", "#F6F1E8", "#B9A48A", "#76836A", "#BF4B32", "#7C8FA6"],
        "tags": ["24件", "70/20/10"], "note": "提前做完选择，早上少纠结。",
    },
    {
        "id": "note06", "label": "TEST · 06", "lines": ["不给你打分的测试，", "长什么样"],
        "accent": 0, "palette": ["#BF4B32", "#AD8749", "#76836A", "#CECBF6", "#7BAEB0", "#1F1B16"],
        "tags": ["11题", "不评分", "不排名"], "note": "只把特征翻译成选择。",
    },
]

for c in COVERS:
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    # faint vertical rule
    d.line([(W - 118, 0), (W - 118, H)], fill="#E9DFD0", width=1)
    d.line([(96, H - 300), (W - 96, H - 300)], fill=LINE, width=1)

    # brand
    d.ellipse((96, 92, 128, 124), fill=ACCENT)
    text(d, (142, 88), "光绽 GlowSelf", sans(33), INK)
    text(d, (143, 128), "YOUR QUIET ADVANTAGE", sans(15), MUTED)
    text(d, (W - 96, 98), c["label"], sans(16), MUTED, anchor="ra")

    # category
    text(d, (96, 190), "个人色彩与风格 · 免费测试", sans(22), ACCENT)

    # headline
    lines = c["lines"]
    f, size = fit(d, lines, max_w=900, start=104)
    y = 265
    lh = int(size * 1.22)
    for i, line in enumerate(lines):
        color = ACCENT if i == c["accent"] else INK
        text(d, (96, y), line, f, color)
        y += lh

    # short rule + note
    y += 18
    d.line([(96, y), (96 + 92, y)], fill=ACCENT, width=3)
    y += 34
    text(d, (96, y), c["note"], sans(24), MUTED)

    # palette blocks on lower area
    top = 900
    n = len(c["palette"])
    gap = 18
    bw = (W - 192 - gap * (n - 1)) // n
    for i, col in enumerate(c["palette"]):
        x = 96 + i * (bw + gap)
        d.rounded_rectangle((x, top, x + bw, top + bw), radius=10, fill=col, outline="#E2D6C6", width=1)

    # tags
    tx = 96
    ty = 900 + bw + 34
    for tag in c["tags"]:
        f_tag = sans(20)
        tw = int(d.textlength(tag, font=f_tag)) + 34
        d.rounded_rectangle((tx, ty, tx + tw, ty + 46), radius=23, outline="#D8CABA", width=1, fill=CARD)
        text(d, (tx + 17, ty + 10), tag, f_tag, INK)
        tx += tw + 12

    # footer CTA
    text(d, (96, H - 218), "免费测你的色彩 DNA", serif(40), INK)
    text(d, (96, H - 154), "11 题 · 2 分 30 秒 · 不用注册", sans(22), MUTED)
    bx0, by0, bx1, by1 = (W - 410, H - 232, W - 96, H - 154)
    d.rounded_rectangle((bx0, by0, bx1, by1), radius=39, fill=INK)
    text(d, ((bx0 + bx1) / 2, (by0 + by1) / 2 - 2), "glowself.cn →", sans(24), PAPER, anchor="mm")

    img.save(OUT / f"{c['id']}.png", optimize=True)
    print("wrote", OUT / f"{c['id']}.png")
