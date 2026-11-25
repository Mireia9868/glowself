#!/usr/bin/env python3
"""Generate a 4-page human-review PDF from a season/style result.

Usage:
  python3 scripts/make_report.py --season cool-winter --style elegant \
      --goal outfit --email user@example.com --out /tmp/report.pdf
"""
import argparse, json, os, re
from pathlib import Path
from datetime import date
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
W, H = 1240, 1754
PAPER, INK, MUTED, LINE, ACCENT, SAGE, GOLD = "#F6F1E8", "#1F1B16", "#786D5F", "#DED3C3", "#BF4B32", "#76836A", "#AD8749"
SONGTI = "/System/Library/Fonts/Supplemental/Songti.ttc"
PINGFANG = "/System/Library/Fonts/Hiragino Sans GB.ttc"

def serif(s): return ImageFont.truetype(SONGTI, s, index=1)
def sans(s): return ImageFont.truetype(PINGFANG, s, index=0)

def wrap(d, s, font, width):
    lines, cur = [], ""
    for ch in s:
        if ch == "\n":
            lines.append(cur); cur = ""; continue
        if d.textlength(cur + ch, font=font) > width:
            lines.append(cur); cur = ch
        else:
            cur += ch
    if cur: lines.append(cur)
    return lines

def para(d, x, y, s, font, width, fill=MUTED, leading=1.75):
    for ln in wrap(d, s, font, width):
        d.text((x, y), ln, font=font, fill=fill)
        y += int(font.size * leading)
    return y

def page_base(label):
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    d.rectangle((76, 66, 84, 78), fill=ACCENT)
    d.text((104, 62), "光绽 GlowSelf", font=serif(34), fill=INK)
    d.text((104, 104), "PERSONAL COLOUR DOSSIER", font=sans(12), fill=MUTED)
    d.text((W-92, 84), label, font=sans(12), fill=MUTED, anchor="ra")
    d.line((92, 146, W-92, 146), fill=LINE, width=2)
    return im, d

def footer(d, page):
    d.line((92, H-92, W-92, H-92), fill=LINE, width=2)
    d.text((92, H-70), "glowself.cn · 不评分，不排名，只翻译特征", font=sans(13), fill=MUTED)
    d.text((W-92, H-70), f"{page} / 4", font=sans(13), fill=MUTED, anchor="ra")

def swatch(d, x, y, w, h, color):
    d.rounded_rectangle((x, y, x+w, y+h), radius=8, fill=color)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--season", required=True)
    ap.add_argument("--style", required=True)
    ap.add_argument("--goal", default="outfit")
    ap.add_argument("--email", default="")
    ap.add_argument("--note", default="")
    ap.add_argument("--out", default=str(ROOT / "growth" / "report.pdf"))
    args = ap.parse_args()

    seasons = json.loads((ROOT / "data" / "seasons.json").read_text())
    meta = json.loads((ROOT / "data" / "report-meta.json").read_text())
    s = seasons[args.season]
    a = meta["archetypes"][args.style]
    g = meta["goals"].get(args.goal, meta["goals"]["outfit"])
    palette = s["palette"][:12]
    pages = []

    # Page 1 — cover
    im, d = page_base("COVER")
    d.text((92, 250), "你的色彩与风格", font=serif(76), fill=INK)
    d.text((92, 345), "说明书", font=serif(76), fill=INK)
    d.text((92, 490), s["name"], font=serif(150), fill=INK)
    d.text((96, 660), s["en"], font=serif(34), fill=ACCENT)
    para(d, 96, 735, s["tagline"], sans(26), 820, INK, 1.7)
    x = 92
    for hexv, name in palette[:6]:
        swatch(d, x, 900, 150, 150, hexv)
        d.text((x, 1070), name, font=sans(17), fill=INK)
        d.text((x, 1100), hexv, font=sans(12), fill=MUTED)
        x += 174
    d.text((92, 1210), "为你复核", font=sans(15), fill=MUTED)
    d.text((92, 1244), args.email or "GlowSelf 创始会员", font=sans(22), fill=INK)
    d.text((92, 1320), "这份报告把「你适合什么」翻译成颜色、版型和明天能穿的三套公式。", font=sans(18), fill=MUTED)
    d.text((92, 1360), "它不给你打分，也不把你塞进一个标准答案。", font=sans(18), fill=MUTED)
    footer(d, 1)
    pages.append(im)

    # Page 2 — season
    im, d = page_base("01 · SEASON")
    d.text((92, 200), "01 你的季节坐标", font=serif(48), fill=INK)
    y = para(d, 92, 285, s["description"], sans(23), 1010, INK, 1.9)
    y = max(y + 20, 430)
    d.text((92, y), "12 个本命色", font=serif(32), fill=INK)
    y += 54
    for i, (hexv, name) in enumerate(palette):
        col, row = i % 4, i // 4
        x = 92 + col * 270
        yy = y + row * 240
        swatch(d, x, yy, 210, 130, hexv)
        d.text((x, yy+145), name, font=sans(18), fill=INK)
        d.text((x, yy+174), hexv, font=sans(12), fill=MUTED)
    y = y + 3*240 + 10
    d.text((92, y), "暂时放一放", font=serif(24), fill=INK)
    x = 92
    for item in s["avoid"][:8]:
        tw = d.textlength(item, font=sans(16)) + 28
        d.rounded_rectangle((x, y+44, x+tw, y+80), radius=18, outline=LINE, width=1, fill="#FFFDF8")
        d.text((x+14, y+51), item, font=sans(16), fill=MUTED)
        x += tw + 10
    d.text((92, 1380), "怎么用这 12 个颜色", font=serif(26), fill=INK)
    para(d, 92, 1422, "靠近脸（上衣、围巾、耳饰、口红）优先前 6 个；下装、包、鞋可以用后 6 个做同色系延伸。第一次先买小面积配饰，不要一次换整柜。", sans(15), 1030, MUTED, 1.7)
    footer(d, 2)
    pages.append(im)

    # Page 3 — formulas
    im, d = page_base("02 · FORMULAS")
    d.text((92, 200), "02 三套明天能穿的公式", font=serif(48), fill=INK)
    y = 300
    for i, f in enumerate(s["formulas"][:3]):
        d.text((92, y), f"0{i+1}", font=sans(15), fill=ACCENT)
        d.text((140, y-8), f, font=serif(30), fill=INK)
        d.line((92, y+58, W-92, y+58), fill=LINE, width=1)
        y += 100
    d.text((92, 650), "03 妆容、发型和金属", font=serif(42), fill=INK)
    rows = [("口红", s["lip"]), ("腮红", s["blush"]), ("眼影", s["eye"]), ("发色", s["hair"]), ("金属", s["metal"])]
    y = 735
    for k, v in rows:
        d.text((92, y), k, font=sans(16), fill=MUTED)
        d.text((260, y-4), v, font=sans(21), fill=INK)
        d.line((92, y+42, W-92, y+42), fill=LINE, width=1)
        y += 72
    d.text((92, 1180), "04 风格关键词", font=serif(42), fill=INK)
    x = 92
    for kw in a["keywords"][:6]:
        tw = d.textlength(kw, font=sans(16)) + 30
        d.rounded_rectangle((x, 1250, x+tw, 1290), radius=20, fill=INK)
        d.text((x+15, 1258), kw, font=sans(16), fill=PAPER)
        x += tw + 10
    d.text((92, 1350), a["tagline"], font=serif(30), fill=ACCENT)
    para(d, 92, 1400, a["description"], sans(18), 1010, MUTED, 1.7)
    footer(d, 3)
    pages.append(im)

    # Page 4 — wardrobe & plan
    im, d = page_base("03 · WARDROBE")
    d.text((92, 190), "05 24 件衣橱清单", font=serif(44), fill=INK)
    d.text((92, 250), "先用现有衣服，缺哪件再补；颜色优先靠近脸的 6 个。", font=sans(16), fill=MUTED)
    groups = [
        ("上装 7", ["白衬衫", "本命色针织", "黑/白 T", "灰西装", "风衣", "条纹衫", "开衫"]),
        ("下装 4", ["直筒牛仔", "黑色西裤", "A 字半裙", "阔腿裤"]),
        ("连衣裙 2", ["本命色针织裙", "小黑裙"]),
        ("外套 3", ["长大衣", "短夹克", "轻羽绒"]),
        ("鞋 3", ["白运动鞋", "黑短靴", "乐福鞋"]),
        ("包 2", ["通勤托特", "小挎包"]),
        ("配饰 3", ["金属耳饰", "围巾", "腰带"]),
    ]
    left = [groups[0], groups[2], groups[4], groups[6]]
    right = [groups[1], groups[3], groups[5]]
    for col, group_list in enumerate((left, right)):
        x = 92 + col * 520
        y = 315
        for title, items in group_list:
            d.text((x, y), title, font=serif(24), fill=ACCENT)
            ty = y + 40
            for item in items:
                d.text((x, ty), "· " + item, font=sans(16), fill=INK)
                ty += 27
            y = ty + 18
    d.line((92, 1010, W-92, 1010), fill=LINE, width=2)
    d.text((92, 1045), "06 30 天节奏", font=serif(38), fill=INK)
    bullets = [
        "第 1 周：只穿靠近脸的 6 个颜色，拍 3 张照，找出最自在的一套。",
        "第 2 周：用 3 套公式各穿一次，记录哪套需要调整（长度/领口/腰线）。",
        "第 3 周：把衣橱里最常穿的 12 件挑出来，其余先收起来。",
        "第 4 周：只补 1 件真正缺的单品，不因为打折买。",
    ]
    y = 1105
    for b in bullets:
        y = para(d, 92, y, b, sans(17), 1040, MUTED, 1.65) + 6
    note = args.note or "优先从靠近脸的 6 个颜色开始，先不急着买新衣服。把黑色、白色和本命色穿顺，再考虑图案和流行色。"
    d.rounded_rectangle((92, 1430, W-92, 1600), radius=14, fill="#FFFDF8", outline=LINE, width=1)
    d.text((116, 1450), "复核备注", font=serif(22), fill=ACCENT)
    para(d, 116, 1490, note, sans(15), 1000, INK, 1.6)
    footer(d, 4)
    pages.append(im)

    out = Path(args.out); out.parent.mkdir(parents=True, exist_ok=True)
    if os.environ.get("REPORT_PREVIEW"):
        for i, page in enumerate(pages):
            page.resize((620, 877), Image.LANCZOS).save(f"/tmp/report-p{i+1}.png")
    pages[0].save(out, "PDF", resolution=150, save_all=True, append_images=pages[1:])
    print(out, out.stat().st_size)

if __name__ == "__main__":
    main()
