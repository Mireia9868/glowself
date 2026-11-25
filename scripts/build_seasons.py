#!/usr/bin/env python3
"""Generate the 12 season landing pages and the season index."""
from pathlib import Path
import json
import html

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "season"
OUT.mkdir(exist_ok=True)
SEASONS = json.loads((ROOT / "data" / "seasons.json").read_text(encoding="utf-8"))
ORDER = [
    "soft-autumn", "warm-autumn", "deep-autumn",
    "light-spring", "warm-spring", "clear-spring",
    "soft-summer", "cool-summer", "light-summer",
    "clear-winter", "cool-winter", "deep-winter",
]

NAV = """<div class="nav-wrap">
  <div class="shell nav">
    <a class="brand" href="/" aria-label="GlowSelf 首页">
      <img class="brand-mark" src="/assets/img/mark.svg" alt="">
      <span><span class="brand-name">光绽 GlowSelf</span><span class="brand-en">YOUR QUIET ADVANTAGE</span></span>
    </a>
    <nav class="nav-links" aria-label="主导航">
      <a href="/#why">为什么</a>
      <a href="/#report">报告内容</a>
      <a href="/pricing.html">定价</a>
      <a href="/season/index.html" class="active">12 季色彩</a>
      <a href="/article/index.html">风格笔记</a>
    </nav>
    <div class="nav-actions">
      <a class="nav-login" href="/app.html">我的空间</a>
      <a class="btn btn-primary btn-sm" href="/test.html">免费测一测</a>
      <button class="nav-toggle" type="button" data-nav-toggle aria-label="打开菜单"><span></span></button>
    </div>
  </div>
</div>"""

FOOTER = """<footer class="footer">
  <div class="shell">
    <div class="footer-grid">
      <div>
        <a class="brand" href="/"><img class="brand-mark" src="/assets/img/mark.svg" alt=""><span><span class="brand-name">光绽 GlowSelf</span><span class="brand-en">YOUR QUIET ADVANTAGE</span></span></a>
        <p class="footer-note">把「我适合什么」变成一份可执行的说明书。不评分，不排名，不制造焦虑。</p>
      </div>
      <div><div class="footer-title">产品</div><a href="/test.html">色彩 DNA 测试</a><a href="/#report">报告内容</a><a href="/pricing.html">定价</a><a href="/season/index.html">12 季色彩图鉴</a><a href="/app.html">我的空间</a></div>
      <div><div class="footer-title">风格笔记</div><a href="/article/color-season-test.html">12 季色彩入门</a><a href="/article/face-shape-guide.html">7 种脸型发型索引</a><a href="/article/body-shape-guide.html">5 种身材穿搭索引</a><a href="/article/fangyuan-face-hairstyle.html">方圆脸发型指南</a><a href="/article/capsule-wardrobe.html">胶囊衣橱清单</a><a href="/article/color-analysis-worth-it.html">色彩测试值不值</a></div>
      <div><div class="footer-title">关于</div><a href="/about.html">我们为什么做 GlowSelf</a><a href="/privacy.html">隐私政策</a><a href="/terms.html">服务条款</a><a href="mailto:mireia1998@163.com">mireia1998@163.com</a></div>
    </div>
    <div class="footer-bottom"><span>© 2026 GlowSelf 光绽</span><span>中国 · 杭州</span><span>不评分 · 不排名 · 不制造焦虑</span></div>
  </div>
</footer>
<script src="/assets/js/site.js" defer></script>
</body>
</html>"""

COMPARE = {
    "soft-autumn": ("warm-autumn", "暖秋的南瓜、焦糖更饱和、更暖；柔暖秋要在这类颜色里加一层灰，选燕麦、灰褐、雾橄榄。"),
    "warm-autumn": ("deep-autumn", "暖秋更亮、更轻；深暖秋的明度更低，能承住酒红、墨绿和深棕。"),
    "deep-autumn": ("warm-autumn", "深暖秋更深、更浓；暖秋更明快，焦糖和琥珀会更衬它。"),
    "light-spring": ("warm-spring", "浅春更轻、更淡；暖春更鲜活，珊瑚和蜜桃的饱和度更高。"),
    "warm-spring": ("light-spring", "暖春更亮、更暖；浅春更淡，适合奶油、浅杏和蜜桃。"),
    "clear-spring": ("warm-spring", "亮春更净、更高对比；暖春更柔、更偏黄，颜色里有一点奶油感。"),
    "soft-summer": ("cool-summer", "柔夏更灰、更雾；冷夏更冷、更清晰，蓝和莓果更干净。"),
    "cool-summer": ("soft-summer", "冷夏更冷、更净；柔夏更灰、更柔，像蒙了一层雾。"),
    "light-summer": ("soft-summer", "浅夏更轻；柔夏更灰，颜色的明度低一点、更沉一点。"),
    "clear-winter": ("cool-winter", "净冬更净、更高对比；冷冬更冷、更深，宝石色更重。"),
    "cool-winter": ("deep-winter", "冷冬明度中深；深冬更深、更浓，黑、酒红和深紫更重。"),
    "deep-winter": ("cool-winter", "深冬更深、更浓；冷冬更冷、更亮一点，灰蓝和冰蓝更轻。"),
}
NEIGHBORS = {
    "soft-autumn": ["warm-autumn", "soft-summer"],
    "warm-autumn": ["deep-autumn", "soft-autumn"],
    "deep-autumn": ["warm-autumn", "deep-winter"],
    "light-spring": ["warm-spring", "light-summer"],
    "warm-spring": ["light-spring", "clear-spring"],
    "clear-spring": ["warm-spring", "clear-winter"],
    "soft-summer": ["cool-summer", "light-summer"],
    "cool-summer": ["soft-summer", "cool-winter"],
    "light-summer": ["soft-summer", "light-spring"],
    "clear-winter": ["cool-winter", "clear-spring"],
    "cool-winter": ["clear-winter", "deep-winter"],
    "deep-winter": ["cool-winter", "deep-autumn"],
}
BLACK = {
    "春": "纯黑对春型通常偏重。把黑放到下半身，靠近脸的位置换成深棕、藏蓝或炭灰，气色会更干净。",
    "夏": "纯黑对夏型偏硬。优先雾黑、深灰蓝、莓果深色；如果穿黑，用银饰和冷白领口隔开。",
    "秋": "不必硬穿纯黑。深棕、墨绿、炭灰更衬秋型；要穿黑，选有纹理的材质，别让黑色贴着素颜脸。",
    "冬": "适合。冬型能穿黑，优先炭黑、墨黑和冷调黑，避开偏红、偏棕的暖黑。",
}
EARTH = {
    "春": "可以，但要选浅而暖的大地色：燕麦、浅卡其、蜜桃棕。避开灰重的土褐和深咖啡。",
    "夏": "选冷调大地色：灰褐、冷棕、灰粉。南瓜橙、土黄和暖卡其容易让肤色发黄。",
    "秋": "大地色是你的主场：焦糖、陶土、橄榄、深棕都能用。只要控制明度，别全身一个深度。",
    "冬": "可以选冷调大地色：灰褐、冷棕、石墨。避开南瓜橙、土黄和暖棕，它们会破坏清冷感。",
}


def e(value):
    return html.escape(str(value), quote=True)


def palette_items(colors, with_hex=True):
    rows = []
    for hexv, name in colors:
        rows.append(
            f'<div class="season-color"><span class="dot" style="background:{e(hexv)}"></span>'
            f'<b>{e(name)}</b>{"<small>" + e(hexv) + "</small>" if with_hex else ""}</div>'
        )
    return "".join(rows)


def page(sid, s):
    family = s["family"]
    neighbor_id, neighbor_text = COMPARE[sid]
    neighbor = SEASONS[neighbor_id]
    q1 = f"{s['name']}适合黑色吗？"
    a1 = BLACK[family]
    q2 = f"{s['name']}和{neighbor['name']}怎么区分？"
    a2 = neighbor_text
    q3 = f"{s['name']}可以穿大地色吗？"
    a3 = EARTH[family]
    q4 = "一定要买新衣服吗？"
    a4 = "不用。先用手上最接近本命色的 3 件衣服做搭配，确认颜色在自然光下是否让肤色更均匀，再补缺的那一件。"
    faqs = [(q1, a1), (q2, a2), (q3, a3), (q4, a4)]

    top6 = s["palette"][:6]
    related = "".join(
        f'<a href="/season/{rid}.html">{e(SEASONS[rid]["name"])} · {e(SEASONS[rid]["en"])}</a>'
        for rid in NEIGHBORS[sid]
    )
    avoid = "".join(f'<span class="season-avoid">{e(x)}</span>' for x in s["avoid"])
    formulas = "".join(f"<li>{e(x)}</li>" for x in s["formulas"])
    keywords = "".join(f'<span>{e(x)}</span>' for x in s["keywords"])
    faq_html = "".join(f"<h3>{e(q)}</h3><p>{e(a)}</p>" for q, a in faqs)
    faq_schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in faqs
        ],
    }
    article_schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": f"{s['name']}适合什么颜色？12 色板、穿搭公式与避雷",
        "description": f"{s['tagline']} {s['name']}的 12 个本命色、3 套穿搭公式、妆容与发色方向。",
        "image": f"https://glowself.cn/assets/img/og/{sid}.png",
        "datePublished": "2026-11-24",
        "dateModified": "2026-11-24",
        "author": {"@type": "Organization", "name": "GlowSelf 光绽"},
        "publisher": {"@type": "Organization", "name": "GlowSelf 光绽", "logo": {"@type": "ImageObject", "url": "https://glowself.cn/assets/img/mark.svg"}},
        "mainEntityOfPage": f"https://glowself.cn/season/{sid}.html",
    }
    title = f"{s['name']}适合什么颜色？12 色板、穿搭公式与避雷｜GlowSelf"
    desc = f"{s['tagline']} {s['name']}的 12 个本命色、3 套穿搭公式、妆容与发色方向。不用上传照片，11 个问题测出你的色彩 DNA。"

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(title)}</title>
  <meta name="description" content="{e(desc)}">
  <link rel="canonical" href="https://glowself.cn/season/{sid}.html">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(desc)}">
  <meta property="og:url" content="https://glowself.cn/season/{sid}.html">
  <meta property="og:image" content="https://glowself.cn/assets/img/og/{sid}.png">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/site.css">
  <script type="application/ld+json">{json.dumps(article_schema, ensure_ascii=False)}</script>
  <script type="application/ld+json">{json.dumps(faq_schema, ensure_ascii=False)}</script>
</head>
<body>
{NAV}
<main>
  <section class="season-hero">
    <div class="shell season-hero-grid">
      <div>
        <div class="breadcrumbs"><a href="/">首页</a><span>/</span><a href="/season/index.html">12 季色彩</a><span>/</span><span>{e(s['name'])}</span></div>
        <div class="kicker">12 SEASONS · {e(s['en'])}</div>
        <h1>{e(s['name'])}<br>适合什么颜色？</h1>
        <p class="lede">{e(s['tagline'])}</p>
        <div class="season-tags">{keywords}</div>
        <div class="hero-actions"><a class="btn btn-primary btn-lg" href="/test.html">免费测色彩 DNA →</a><a class="btn btn-ghost btn-lg" href="/season/index.html">看全部 12 季</a></div>
      </div>
      <div class="season-palette-card">
        <div class="season-card-head"><div><div class="k">YOUR PALETTE · 12 COLOURS</div><h2>{e(s['name'])}</h2></div><span class="season-en">{e(s['en'])}</span></div>
        <div class="season-palette">{palette_items(s['palette'])}</div>
        <div class="season-card-foot"><span>靠近脸的颜色，比衣服款式更重要。</span><span>金属：{e(s['metal'])}</span></div>
      </div>
    </div>
  </section>

  <div class="shell season-layout">
    <article class="article-body season-body">
      <div class="season-answer"><div class="k">一句话答案</div><p>{e(s['description'])}</p></div>

      <h2>为什么是{e(s['name'])}？</h2>
      <p>{e(s['description'])} 这不是靠一个「冷皮/暖皮」标签推出来的，而是三个坐标一起看：底色的冷暖、整体的明度、颜色的净柔。{e(s['name'])}落在 <b>{e(' / '.join(s['keywords']))}</b> 这一组。</p>
      <p>你不需要把自己塞进一个季节名字。名字只是帮你缩小选择范围：看到一件新衣服时，先问它是不是在这 12 个颜色附近，再决定要不要试。</p>

      <h2>12 个本命色</h2>
      <div class="season-palette season-palette-body">{palette_items(s['palette'])}</div>
      <p>这 12 个颜色不要求全部穿上身。最实用的是前 6 个——它们更适合放在靠近脸的位置：上衣、围巾、耳饰、口红。后 6 个可以放在下装、包、鞋，或者做小面积点缀。</p>

      <h2>靠近脸的 6 个颜色</h2>
      <div class="season-face-colors">{''.join(f'<div><span class="dot" style="background:{e(h)}"></span><b>{e(n)}</b><small>{e(h)}</small></div>' for h, n in top6)}</div>
      <p>如果只能先买一件，选这 6 个里你穿上后「黑眼圈变淡、嘴角不自觉地放松」的那个。不要一次买齐，先用一件验证。</p>

      <h2>最好避开</h2>
      <div class="season-avoids">{avoid}</div>
      <p>「避开」不是绝对不能穿，而是不要让它大面积贴着素颜脸。把它放到下半身、包或鞋上，或者用一条靠近本命色的围巾隔开，难度会低很多。</p>

      <h2>妆容、发色和金属</h2>
      <table class="season-table">
        <tr><th>项目</th><th>方向</th></tr>
        <tr><td>口红</td><td>{e(s['lip'])}</td></tr>
        <tr><td>腮红</td><td>{e(s['blush'])}</td></tr>
        <tr><td>眼影</td><td>{e(s['eye'])}</td></tr>
        <tr><td>发色</td><td>{e(s['hair'])}</td></tr>
        <tr><td>金属</td><td>{e(s['metal'])}</td></tr>
      </table>

      <h2>3 套明天就能穿的公式</h2>
      <ol class="season-formulas">{formulas}</ol>
      <p>公式的价值是减少决策，不是限制你。先把这三套穿顺，再按自己的场合替换单品；颜色关系不变，就不会出错。</p>

      <h2>怎么确认你是{e(s['name'])}</h2>
      <ul>
        <li>把 {e(s['palette'][0][1])}、{e(s['palette'][1][1])} 和一件{s['avoid'][0]}分别放在脸下方，看哪一块让肤色更均匀。</li>
        <li>在自然光下拍一张黑白照，看头发、眼睛和皮肤的灰度差，判断你能承住多深的颜色。</li>
        <li>回想你被夸「今天气色好」时穿的那件衣服，它大概率在这 12 个颜色里。</li>
      </ul>

      <h2>和相邻季节的区别</h2>
      <h3>{e(s['name'])} vs {e(neighbor['name'])}</h3>
      <p>{e(neighbor_text)}</p>
      <p>如果还是分不清，不要继续看文字。拿 {e(s['palette'][0][1])} 和 {e(neighbor['palette'][0][1])} 两块布，素颜、自然光、同一位置对比，看哪一块让下颌线更干净。身体比命名更诚实。</p>

      <h2>常见问题</h2>
      {faq_html}

      <div class="season-cta">
        <div><div class="k">FREE · 3 MIN</div><h2>测出你的那一季。</h2><p>11 个问题，不用注册，不用上传照片。结果包含 12 色板、风格坐标和 3 套公式。</p></div>
        <a class="btn btn-accent btn-lg" href="/test.html">免费测色彩 DNA →</a>
      </div>
    </article>

    <aside class="article-side">
      <div class="season-side-card">
        <div class="k">免费测试</div>
        <h3>3 分钟，找到你的那一季。</h3>
        <p>11 个问题，不上传照片。测完再回来看这一页，会更准。</p>
        <a class="btn btn-primary" href="/test.html">开始测试 →</a>
      </div>
      <div class="toc"><div class="k">相邻季节</div>{related}<a href="/season/index.html">全部 12 季 →</a></div>
      <div class="toc"><div class="k">继续读</div><a href="/article/color-season-test.html">12 季色彩入门</a><a href="/article/capsule-wardrobe.html">胶囊衣橱清单</a><a href="/article/color-analysis-worth-it.html">色彩测试值不值</a></div>
    </aside>
  </div>
</main>
{FOOTER}"""


for sid in ORDER:
    (OUT / f"{sid}.html").write_text(page(sid, SEASONS[sid]), encoding="utf-8")
    print("wrote", sid)

cards = "".join(
    f"""<a class="season-card" href="/season/{sid}.html">
      <div class="season-card-top"><span class="season-card-name">{e(SEASONS[sid]['name'])}</span><span class="season-card-en">{e(SEASONS[sid]['en'])}</span></div>
      <div class="season-card-palette">{''.join(f'<span style="background:{e(h)}"></span>' for h, _ in SEASONS[sid]['palette'][:6])}</div>
      <p>{e(SEASONS[sid]['tagline'])}</p>
      <span class="season-card-more">看色板与公式 →</span>
    </a>"""
    for sid in ORDER
)

hub = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>12 季色彩图鉴｜每一季适合什么颜色｜GlowSelf</title>
  <meta name="description" content="12 季色彩图鉴：柔暖秋、暖秋、深暖秋、浅春、暖春、亮春、柔夏、冷夏、浅夏、净冬、冷冬、深冬。每季的 12 色板、穿搭公式和避雷。">
  <link rel="canonical" href="https://glowself.cn/season/index.html">
  <meta property="og:type" content="website">
  <meta property="og:title" content="12 季色彩图鉴｜GlowSelf">
  <meta property="og:description" content="每一季适合什么颜色、怎么穿、避开什么。">
  <meta property="og:url" content="https://glowself.cn/season/index.html">
  <meta property="og:image" content="https://glowself.cn/assets/img/og-cover.png">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/site.css">
</head>
<body>
{NAV}
<main>
  <section class="article-hero">
    <div class="shell">
      <div class="breadcrumbs"><a href="/">首页</a><span>/</span><span>12 季色彩</span></div>
      <h1>12 季色彩，<br>找到你的那一季。</h1>
      <p class="dek">同一个「暖皮」，可能是暖秋，也可能是浅春。别急着记名字，先看色板——身体会比标签更早认出自己。</p>
    </div>
  </section>
  <section class="section">
    <div class="shell"><div class="season-grid">{cards}</div></div>
  </section>
  <section class="section">
    <div class="shell"><div class="cta-band"><div><div class="eyebrow" style="color:rgba(246,241,232,.55)">START FREE</div><h2 class="display-sm" style="color:var(--paper)">看完 12 季，不如测一次。</h2><p style="color:rgba(246,241,232,.62)">11 个问题，2 分 30 秒，不用注册。</p></div><div class="cta-actions"><a class="btn btn-accent btn-lg" href="/test.html">免费测色彩 DNA →</a></div></div></div>
  </section>
</main>
{FOOTER}"""
(OUT / "index.html").write_text(hub, encoding="utf-8")
print("wrote season hub")
