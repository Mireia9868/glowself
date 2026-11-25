#!/usr/bin/env python3
"""Generate the 5-image note01 carousel (1080x1440)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "growth" / "content" / "covers"
W, H = 1080, 1440
PAPER, INK, MUTED, LINE, ACCENT, SAGE = "#F6F1E8", "#1F1B16", "#786D5F", "#DED3C3", "#BF4B32", "#76836A"
SONGTI = "/System/Library/Fonts/Supplemental/Songti.ttc"
PINGFANG = "/System/Library/Fonts/Hiragino Sans GB.ttc"

def serif(s): return ImageFont.truetype(SONGTI, s, index=1)
def sans(s): return ImageFont.truetype(PINGFANG, s, index=0)

def new():
    im = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(im)
    d.rectangle((48, 42, 54, 54), fill=ACCENT)
    d.text((72, 40), "光绽 GlowSelf", font=serif(34), fill=INK)
    d.text((72, 82), "YOUR QUIET ADVANTAGE", font=sans(12), fill=MUTED)
    d.line((72, 116, 1008, 116), fill=LINE, width=2)
    return im, d

def footer(d, label):
    d.line((72, 1284, 1008, 1284), fill=LINE, width=2)
    d.text((72, 1312), "glowself.cn", font=sans(20), fill=MUTED)
    d.text((1008, 1312), label, font=sans(18), fill=MUTED, anchor="ra")
    d.text((72, 1364), "11 题 · 2 分 30 秒 · 不用注册 · 不评分", font=sans(18), fill=MUTED)

def wrap(d, s, f, width):
    lines, cur = [], ""
    for ch in s:
        if d.textlength(cur + ch, font=f) > width:
            lines.append(cur); cur = ch
        else:
            cur += ch
    if cur: lines.append(cur)
    return lines

def card2():
    im, d = new()
    d.text((72, 160), "黑色，其实分三种", font=serif(68), fill=INK)
    d.text((72, 260), "先分冷暖，再看它离脸有多近。", font=sans(24), fill=MUTED)
    cols = [
        ("纯黑", "#111111", "对比最强。冷冬、深冬靠近脸时，配亮银或冷白。"),
        ("炭黑", "#2C2C2C", "柔和一点。冷夏、柔夏整套穿也不闷。"),
        ("深棕黑", "#3A2A22", "带一点暖。深秋、暖秋比纯黑更贴肤色。"),
    ]
    xs = [72, 396, 720]
    for (name, hexv, body), x in zip(cols, xs):
        d.rounded_rectangle((x, 380, x+260, 640), radius=10, fill=hexv)
        d.text((x, 684), name, font=serif(40), fill=INK)
        y = 746
        for ln in wrap(d, body, sans(22), 250):
            d.text((x, y), ln, font=sans(22), fill=MUTED); y += 36
    d.text((72, 1010), "一个动作：把黑色放在脸下 30cm。", font=serif(35), fill=ACCENT)
    footer(d, "COLOUR · 01 / 02")
    im.save(OUT / "note01-2.png", quality=92)

def card3():
    im, d = new()
    d.text((72, 160), "把黑色放在脸下 30cm", font=serif(62), fill=INK)
    d.text((72, 248), "在自然光下，看嘴角和眼下的阴影。", font=sans(24), fill=MUTED)
    rows = [
        ("01", "阴影变重、脸发灰", "换炭灰或深棕，不要硬穿纯黑。"),
        ("02", "脸更干净、轮廓清楚", "纯黑可以留，配一点冷白或亮银。"),
        ("03", "看不出差别", "这件黑对你的影响不大，按场合选。"),
    ]
    y = 390
    for num, head, body in rows:
        d.text((72, y), num, font=sans(20), fill=ACCENT)
        d.text((130, y-12), head, font=serif(38), fill=INK)
        d.text((130, y+48), body, font=sans(22), fill=MUTED)
        d.line((72, y+112, 1008, y+112), fill=LINE, width=2)
        y += 170
    d.text((72, 1010), "黑色没问题，\n问题是它离你的脸太近、又太冷。", font=serif(36), fill=ACCENT, spacing=16)
    footer(d, "COLOUR · 01 / 03")
    im.save(OUT / "note01-3.png", quality=92)

def card4():
    im, d = new()
    d.text((72, 160), "冷冬的黑 vs 暖秋的黑", font=serif(58), fill=INK)
    d.text((72, 250), "同一个「黑」，对脸的影响完全不同。", font=sans(24), fill=MUTED)
    panels = [
        ("冷冬", ["#1B2638", "#415A77", "#0D1B2A", "#782CBF"], "黑里带蓝紫，配银、冷白。"),
        ("暖秋", ["#3B2A20", "#6B4A2F", "#A8794F", "#C9A46A"], "黑里带棕金，配金、焦糖。"),
    ]
    for i, (name, colors, note) in enumerate(panels):
        x = 72 + i*488
        d.text((x, 360), name, font=serif(52), fill=INK)
        for j, c in enumerate(colors):
            cx = x + (j % 4) * 108
            d.rounded_rectangle((cx, 450, cx+92, 590), radius=8, fill=c)
        y = 640
        for ln in wrap(d, note, sans(24), 420):
            d.text((x, y), ln, font=sans(24), fill=MUTED); y += 38
    d.text((72, 900), "先测你的季节，再决定买哪种黑。", font=serif(34), fill=ACCENT)
    footer(d, "COLOUR · 01 / 04")
    im.save(OUT / "note01-4.png", quality=92)

def card5():
    im, d = new()
    d.text((72, 160), "测完，你会拿到", font=serif(68), fill=INK)
    d.text((72, 260), "不是一句「你适合暖色」，是能直接用的四件事。", font=sans(24), fill=MUTED)
    rows = [
        ("01", "你的季节坐标", "12 季里的那一季，冷暖和明度一次说清。"),
        ("02", "6 个靠近脸的本命色", "上衣、围巾、耳饰、口红优先用这 6 个。"),
        ("03", "3 套明天能穿的公式", "不用先买新衣服，从现有衣橱里挑。"),
        ("04", "30 天筛选计划", "每天一个小动作，建立自己的规则。"),
    ]
    y = 380
    for num, head, body in rows:
        d.text((72, y), num, font=sans(20), fill=ACCENT)
        d.text((134, y-12), head, font=serif(36), fill=INK)
        d.text((134, y+46), body, font=sans(22), fill=MUTED)
        d.line((72, y+106, 1008, y+106), fill=LINE, width=2)
        y += 158
    d.text((72, 1070), "11 个问题，2 分 30 秒。\n测完再决定要不要更深。", font=serif(33), fill=ACCENT, spacing=14)
    footer(d, "COLOUR · 01 / 05")
    im.save(OUT / "note01-5.png", quality=92)

if __name__ == "__main__":
    card2(); card3(); card4(); card5()
    print("note01 carousel: 4 cards")
