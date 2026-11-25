#!/usr/bin/env python3
"""Generate five body-shape styling guides under /article/."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "article"

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
      <a href="/season/index.html">12 季色彩</a>
      <a href="/article/index.html" class="active">风格笔记</a>
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
      <div><div class="footer-title">风格笔记</div><a href="/article/color-season-test.html">12 季色彩入门</a><a href="/article/face-shape-guide.html">7 种脸型发型索引</a><a href="/article/body-shape-guide.html">5 种身材穿搭索引</a><a href="/article/capsule-wardrobe.html">胶囊衣橱清单</a><a href="/article/color-analysis-worth-it.html">色彩测试值不值</a></div>
      <div><div class="footer-title">关于</div><a href="/about.html">我们为什么做 GlowSelf</a><a href="/privacy.html">隐私政策</a><a href="/terms.html">服务条款</a><a href="mailto:hello@glowself.cn">hello@glowself.cn</a></div>
    </div>
    <div class="footer-bottom"><span>© 2026 GlowSelf 光绽</span><span>中国 · 杭州</span><span>不评分 · 不排名 · 不制造焦虑</span></div>
  </div>
</footer>
<script src="/assets/js/site.js" defer></script>
</body>
</html>"""

BODIES = {
    "pear-body": {
        "name": "梨形",
        "h1": "梨形，<br>把视线提到肩颈。",
        "dek": "胯宽不是缺点，是下半身更有分量。穿搭要做的不是把胯藏起来，而是让肩颈、腰线和脚踝重新参与比例。",
        "desc": "梨形身材怎么穿？从肩线、腰线和下装长度三个位置重新分配视觉重心，附 3 套可复制公式和避雷清单。",
        "facts": [("最宽处", "胯 / 大腿"), ("优势", "腰线清晰"), ("要调整", "肩胯比例")],
        "core": "上装有结构、下装留直线。把亮色、细节和体积放在上半身，下半身用同色系和垂坠面料拉长，不需要一直穿黑色。",
        "check": ["肩宽明显小于胯宽。", "腰围比胯围小一个码以上。", "大腿或臀部是最有肉感的位置。"],
        "principles": [
            ("肩线先立起来", "选有肩线、微垫肩、方领或一字领的上装。肩部一旦有结构，胯的宽度就不会独自抢眼。避免落肩软塌针织把上半身吃掉。"),
            ("下装走直线，不走横线", "直筒裤、A 字中长裙、微阔腿都比紧身包臀更稳。面料要有垂坠感，拒绝在胯部加口袋、横条纹和硬挺褶皱。"),
            ("长度避开最宽处", "裙摆和外套下摆不要正好停在胯最宽的位置。要么在胯以上，要么过膝；卡在中间会把视线钉在那里。"),
        ],
        "formulas": [
            ("方领短外套 + 直筒牛仔 + 尖头鞋", "外套长度到腰下 5 厘米，肩线清楚；直筒裤从胯部垂直落下，尖头鞋把线条继续往前延。"),
            ("有肩线的针织 + A 字中长裙 + 细带凉鞋", "上衣选微修身但不紧身，裙子从腰下自然展开；露出脚踝，整体就不会往下坠。"),
            ("短款衬衫 + 高腰阔腿裤 + 窄腰带", "衬衫下摆停在腰线附近，腰带只做分割不勒紧；裤管宽度不超过肩宽的两倍。"),
        ],
        "avoid": ["紧身包臀裙配长上衣：把最宽处完整框出来。", "低腰裤 + 盖胯长 T：腰线消失，重心全在胯。", "胯部大口袋、横条纹、硬挺百褶：横向体积叠加。"],
        "color": "上半身可以用你本命色里更亮、更暖的颜色，下半身用同色系深一度。不是「深色显瘦」，而是让视线先落在脸和肩颈。",
        "faqs": [("梨形能穿短裙吗？", "可以。选 A 字或伞摆，长度在胯最宽处以上 5 厘米，配露脚背的鞋。不要选包臀和正好卡在胯部的直筒短裙。"), ("梨形一定要穿黑色下装吗？", "不需要。深色只是降低对比，不是唯一解。选和你上装同色系、垂坠感好的下装，比一条紧绷的黑裤子更有效。"), ("梨形能穿阔腿裤吗？", "能，但要看胯部是否服帖。选腰胯顺滑、裤管从大腿开始变宽的款式；避免胯部有褶皱、口袋和硬挺横省道的设计。")],
    },
    "apple-body": {
        "name": "苹果形",
        "h1": "苹果形，<br>把腰线松开一点。",
        "dek": "腰腹有肉、四肢细，是苹果形最常见的组合。与其勒紧腰，不如用纵向线条和露肤把比例拉开。",
        "desc": "苹果形身材怎么穿？用 V 领、纵向线条和露出手腕脚踝，避开紧身腰封，附 3 套公式和常见问题。",
        "facts": [("最宽处", "腰 / 腹部"), ("优势", "四肢纤细"), ("要调整", "腰线位置")],
        "core": "不要用紧身腰封对抗腰腹。把领口打开、把线条拉直、把最细的手腕和脚踝露出来，视线自然会离开中段。",
        "check": ["腰围接近或大于胸围、臀围。", "腰腹是最先长肉的位置。", "手腕、脚踝和小腿相对纤细。"],
        "principles": [
            ("领口打开，线条往下走", "V 领、大 U 领、开襟衬衫都比高领和圆领更轻。胸前留出纵向空白，腰腹就不会成为第一视觉块。"),
            ("腰线要有，但不能勒", "高腰可以，前提是腰头平整、不卷边。用直筒裙、微 A 裙和长马甲制造纵向分割，比宽腰封更舒服。"),
            ("露最细的地方", "手腕、脚踝、小腿和锁骨是苹果形的优势。九分裤、七分袖、开衩裙都比全包住更利落。"),
        ],
        "formulas": [
            ("V 领针织 + 直筒九分裤 + 乐福鞋", "上衣不贴腹，下装从腰头垂直落下；九分长度露出脚踝，整体轻一格。"),
            ("长开衫 + 同色内搭 + 烟管裤", "开衫形成两条纵向线，内搭上下同色；不要把扣子全系上。"),
            ("裹身连衣裙 + 松系腰带 + 尖头平底鞋", "腰带只轻轻收一下，不要勒出褶皱；裙长过膝，开衩在前侧。"),
        ],
        "avoid": ["紧身腰封 / 束腰：把中段切成两截。", "腹部横条纹、大图案、贴袋：增加横向体积。", "低腰紧身裤 + 短上衣：腰腹完全暴露且没有纵向线条。"],
        "color": "上下同色或邻近色最稳。想用亮色，把它放在领口、丝巾、耳饰和鞋上，而不是腰腹正中间。",
        "faqs": [("苹果形能穿收腰吗？", "能，但要选「有腰线不勒腰」的剪裁，比如微收腰的直筒裙、裹身裙。避免宽腰封和没有弹性的硬腰头。"), ("苹果形能穿短上衣吗？", "可以，配高腰直筒下装，让上衣停在腰线附近但不紧贴腹部。不要配低腰裤。"), ("肚子有肉怎么穿不显？", "先选纵向线条：开襟、长马甲、同色内搭。再露出手腕和脚踝。不要靠一件超大 T 恤全部盖住。")],
    },
    "hourglass-body": {
        "name": "沙漏形",
        "h1": "沙漏形，<br>别把腰藏起来。",
        "dek": "肩胯平衡、腰线明显，是最容易被 oversize 吃掉优势的身形。你要做的不是遮，而是让曲线有呼吸感。",
        "desc": "沙漏形身材怎么穿？收腰但不紧身，选垂坠面料和裹身剪裁，避免箱型大廓形，附 3 套公式。",
        "facts": [("最宽处", "肩 / 胯"), ("优势", "腰线明显"), ("要调整", "松紧平衡")],
        "core": "让衣服跟着曲线走，而不是把曲线装进一个箱子。收腰、裹身、细腰带都可以，但面料要能流动，不能绷。",
        "check": ["肩围和臀围接近。", "腰围明显小于肩围和臀围。", "穿直筒裙时腰处容易空出一块。"],
        "principles": [
            ("收腰，但不紧身", "选自带省道、裹身或微收腰的剪裁。腰处留出一指到两指的空间，曲线才自然。"),
            ("面料要垂，不要硬", "真丝、醋酸、针织、羊毛混纺比硬挺箱型面料更友好。硬面料会在腰胯之间形成多余体积。"),
            ("上下保持一个重点", "腰线已经是重点，领口和裙摆就不要再同时堆细节。V 领 + 简洁裙摆最稳。"),
        ],
        "formulas": [
            ("裹身连衣裙 + 细腰带 + 中跟鞋", "裙长过膝，腰带和裙子同色；领口留 V，不再加项链。"),
            ("短款针织 + 高腰直筒西裤 + 尖头鞋", "上衣停在腰线，裤腰平整；直筒裤管平衡胯部，不包紧。"),
            ("直筒大衣 + 同色内搭 + 宽腰带", "大衣敞开穿时用腰带轻收；不要选箱型落肩大衣把腰线完全盖住。"),
        ],
        "avoid": ["箱型大廓形 + 落肩：肩胯变成一条直线，腰线消失。", "低腰裤 + 长上衣：把优势腰线藏掉。", "硬挺厚面料 + 紧身剪裁：曲线被绷成横向褶皱。"],
        "color": "可以大胆用对比色分割上下身，但腰线处尽量保持同色或深色，避免在腰上加一条抢眼的横带。",
        "faqs": [("沙漏形能穿 oversize 吗？", "能，但要留一个收点：塞一角衣摆、加细腰带、或选短款。全身箱型会把腰线一起吃掉。"), ("沙漏形一定要系腰带吗？", "不一定。裹身剪裁、省道和短上衣都能收腰；腰带只是最直接的工具。"), ("沙漏形裤子难买怎么办？", "优先高腰、腰臀差有省道的版型；裤管选直筒或微阔，避免低腰和弹力紧身。")],
    },
    "rectangle-body": {
        "name": "H 型",
        "h1": "H 型，<br>用层次造一点曲线。",
        "dek": "肩、腰、胯接近，身形利落。H 型不需要假装有沙漏腰，只要用腰线、叠穿和面料对比制造节奏。",
        "desc": "H 型 / 直筒身材怎么穿？用短上衣、腰带和叠穿制造腰线，避免全身紧身，附 3 套公式和避雷。",
        "facts": [("最宽处", "肩 / 胯接近"), ("优势", "线条利落"), ("要调整", "腰线节奏")],
        "core": "不要全身紧身，也不要全身宽松。用「一松一紧」和一条清楚的腰线，让直筒身形有停顿。",
        "check": ["肩围、腰围、臀围差距不大。", "腰线不明显，穿直筒裙很顺。", "身形偏薄或偏直，曲线感弱。"],
        "principles": [
            ("先制造腰线", "短上衣 + 高腰下装、塞衣角、细腰带都行。腰线不需要很细，只需要清楚。"),
            ("一松一紧", "上紧下松或上松下紧，不要两件都松。针织 + 阔腿裤、衬衫 + 直筒裙都比全套宽松有效。"),
            ("用层次加节奏", "马甲、开衫、短外套能在直线上加横向分割；但层次不要超过三层。"),
        ],
        "formulas": [
            ("短款针织 + 高腰阔腿裤 + 腰带", "上衣长度到腰线，裤腰平整；腰带和裤子同色，不切断比例。"),
            ("西装外套 + 同色内搭 + 半裙", "外套敞开，内搭塞进裙腰；裙摆比外套长 5 厘米，形成层次。"),
            ("马甲 + 衬衫 + 直筒牛仔", "马甲长度过腰，衬衫袖口露出；用马甲的两条纵线代替腰线。"),
        ],
        "avoid": ["全身紧身：把直筒线条完整暴露。", "无腰线长 T + 紧身裤：上下一样宽。", "全身超宽松：没有支点，显得拖。"],
        "color": "上下不同色时，把腰线放在颜色交界处。想显高，用同色系内搭 + 对比外套，而不是上下强烈撞色。",
        "faqs": [("H 型能穿直筒裙吗？", "能。选有腰省或配腰带的直筒裙；完全无腰线的直筒款会像一条简笔画。"), ("H 型需要丰臀吗？", "不需要。目标是比例有节奏，不是制造一个不属于你的曲线。A 字裙和阔腿裤只是工具。"), ("腰带系在哪里？", "自然腰最细处，通常在肚脐上方 2–3 厘米。不要系在胯上，也不要把腰带勒得过紧。")],
    },
    "inverted-triangle-body": {
        "name": "倒三角",
        "h1": "倒三角，<br>把分量还给下半身。",
        "dek": "肩宽、胯窄、腿细，是倒三角的典型组合。穿搭不是把肩藏起来，而是让下半身也有存在感。",
        "desc": "倒三角 / Y 型身材怎么穿？弱化肩线、增加下半身体积，避免泡泡袖和垫肩，附 3 套公式。",
        "facts": [("最宽处", "肩"), ("优势", "腿细"), ("要调整", "上下体积")],
        "core": "上半身做减法，下半身做加法。V 领、落肩和深色上装让肩线后退；A 字裙、阔腿裤和浅色下装把体积还给下半身。",
        "check": ["肩宽明显大于胯宽。", "上半身比下半身更有量感。", "腿相对细，穿紧身裤很利落。"],
        "principles": [
            ("肩线做减法", "避开泡泡袖、垫肩、横条纹和肩部大装饰。选落肩、插肩、V 领和深色上装，让肩线往后退。"),
            ("下半身做加法", "A 字裙、伞裙、阔腿裤、百褶裙都能增加下半身体积。长度到小腿中部最稳。"),
            ("把视线往下引", "浅色下装、图案下装、脚踝处的细节都可以。上半身保持干净，不要和肩宽抢。"),
        ],
        "formulas": [
            ("V 领针织 + A 字中长裙 + 平底鞋", "上装深色、下装浅色；裙摆从腰下展开，肩胯比例立刻平衡。"),
            ("落肩衬衫 + 阔腿裤 + 帆布鞋", "衬衫不塞满，只塞前半；阔腿裤从胯部自然落下，增加下半身量感。"),
            ("直筒大衣 + 伞裙 + 短靴", "大衣肩线要软，不要选大垫肩；裙摆比大衣长 3–5 厘米。"),
        ],
        "avoid": ["泡泡袖、垫肩、肩章：把最宽处继续放大。", "紧身铅笔裙 + 紧身上衣：上下都窄，肩更突出。", "上半身横条纹、大图案：横向体积全在肩胸。"],
        "color": "上深下浅是最直接的平衡法。也可以上下同色，用下装的图案和材质增加分量。",
        "faqs": [("倒三角能穿露肩吗？", "可以，但选纵向露肤（V 领、单肩斜线），不要选一字肩和横向船领，它们会把肩宽拉成一条横线。"), ("倒三角能穿阔腿裤吗？", "非常适合。选从胯部开始变宽的版型，避免腰部过紧；长度盖住脚背或到脚踝都行。"), ("肩宽怎么弱化？", "先减肩部结构，再用 V 领和深色上装。不要用长发或围巾把肩全部盖住，那会增加上半身体积。")],
    },
}

def page(slug, b):
    facts = "".join(f'<div class="meta-cell"><div class="k">{k}</div><div class="v">{v}</div></div>' for k, v in b["facts"])
    check = "".join(f"<li>{x}</li>" for x in b["check"])
    principles = "".join(f"<h3>{t}</h3><p>{p}</p>" for t, p in b["principles"])
    formulas = "".join(f'<div class="formula"><span class="num">0{i+1}</span><div><b>{t}</b><p>{p}</p></div></div>' for i, (t, p) in enumerate(b["formulas"]))
    avoid = "".join(f"<li>{x}</li>" for x in b["avoid"])
    faqs_html = "".join(f"<h3>{q}</h3><p>{a}</p>" for q, a in b["faqs"])
    faq_schema = ",".join('{{"@type":"Question","name":"{}","acceptedAnswer":{{"@type":"Answer","text":"{}"}}}}'.format(q, a) for q, a in b["faqs"])
    related = "".join(f'<a href="/article/{s}.html">{o["name"]}穿搭指南</a><br>' for s, o in BODIES.items() if s != slug)
    toc = "".join(f'<a href="#{x}">{t}</a>' for x, t in [("check","先确认"),("logic","三条原则"),("formulas","3 套公式"),("avoid","避雷"),("color","颜色"),("faq","常见问题")])
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{b['name']}身材怎么穿？3 套公式与避雷清单｜GlowSelf</title>
  <meta name="description" content="{b['desc']}">
  <link rel="canonical" href="https://glowself.cn/article/{slug}.html">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{b['name']}身材怎么穿？｜GlowSelf">
  <meta property="og:description" content="{b['desc']}">
  <meta property="og:url" content="https://glowself.cn/article/{slug}.html">
  <meta property="og:image" content="https://glowself.cn/assets/img/og-cover.png">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/site.css">
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "{b['name']}身材怎么穿",
    "description": "{b['desc']}",
    "datePublished": "2026-11-25",
    "dateModified": "2026-11-25",
    "author": {{ "@type": "Organization", "name": "GlowSelf 光绽" }},
    "publisher": {{ "@type": "Organization", "name": "GlowSelf 光绽", "logo": {{ "@type": "ImageObject", "url": "https://glowself.cn/assets/img/mark.svg" }} }},
    "mainEntityOfPage": "https://glowself.cn/article/{slug}.html"
  }}
  </script>
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{faq_schema}]
  }}
  </script>
</head>
<body>
{NAV}
<main>
  <section class="article-hero">
    <div class="shell">
      <div class="breadcrumbs"><a href="/">首页</a><span>/</span><a href="/article/index.html">风格笔记</a><span>/</span><span>{b['name']}穿搭</span></div>
      <h1>{b['h1']}</h1>
      <p class="dek">{b['dek']}</p>
      <div class="article-meta"><span>GlowSelf 编辑部</span><span>2026.11.25</span><span>约 6 分钟</span><span>不评分 · 不排名</span></div>
    </div>
  </section>
  <div class="shell">
    <div class="article-layout">
      <article class="article-body">
        <div class="meta-grid face-facts">{facts}</div>
        <div class="callout"><b>一句话结论</b><p>{b['core']}</p></div>

        <h2 id="check">01 先确认：你是不是{b['name']}</h2>
        <ul>{check}</ul>
        <p>如果大部分符合，下面的思路就适用。身材不是要修正的错误，是穿衣时可以先利用的条件。</p>

        <h2 id="logic">02 三条底层原则</h2>
        {principles}

        <h2 id="formulas">03 3 套可复制公式</h2>
        {formulas}

        <h2 id="avoid">04 最容易翻车的 3 件事</h2>
        <ul>{avoid}</ul>

        <h2 id="color">05 颜色怎么配</h2>
        <p>{b['color']}</p>
        <div class="callout"><b>先知道自己的色彩</b><p>版型解决比例，颜色解决气色。做一次 11 题色彩测试，拿到你的季节、6 个本命色和 3 套穿搭公式。</p></div>

        <h2 id="faq">06 常见问题</h2>
        {faqs_html}

        <div class="article-cta">
          <div><div class="kicker">FREE · 3 MIN</div><h3>测出你的色彩与风格</h3><p>11 个问题，不评分，不排名。结果包含 12 季色彩、风格坐标和 3 套穿搭公式。</p></div>
          <a class="btn btn-accent" href="/test.html">免费测色彩 DNA →</a>
        </div>
      </article>
      <aside class="article-side">
        <div class="toc"><b>本文目录</b>{toc}</div>
        <div class="side-card dark"><div class="kicker">FREE TEST</div><h3>3 分钟，找到你的本命色。</h3><p>不评分、不排名、不用上传照片。</p><a class="btn btn-paper" href="/test.html">免费测色彩 DNA →</a></div>
        <div class="side-card light"><b>相关身形</b><p>{related}</p></div>
        <div class="side-card light"><b>继续读</b><p><a href="/article/body-shape-guide.html">5 种身材穿搭索引</a><br><a href="/article/face-shape-guide.html">7 种脸型发型索引</a><br><a href="/season/index.html">12 季色彩图鉴</a></p></div>
      </aside>
    </div>
  </div>
</main>
{FOOTER}"""

for slug, b in BODIES.items():
    (ART / f"{slug}.html").write_text(page(slug, b), encoding="utf-8")
    print("wrote", slug)

cards = "".join(
    f'<a class="article-card" href="/article/{s}.html"><div class="article-card-kicker">BODY SHAPE · 约 6 分钟</div><h2>{o["name"]}身材怎么穿？</h2><p>{o["dek"].split("。")[0]}。</p><span class="article-card-more">阅读全文 →</span></a>'
    for s, o in BODIES.items()
)

hub = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>5 种身材穿搭索引：梨形、苹果形、沙漏、H 型、倒三角｜GlowSelf</title>
  <meta name="description" content="不靠「显瘦」一个目标。按梨形、苹果形、沙漏、H 型、倒三角拆解肩线、腰线和下装体积，附 3 套公式和避雷清单。">
  <link rel="canonical" href="https://glowself.cn/article/body-shape-guide.html">
  <meta property="og:type" content="website">
  <meta property="og:title" content="5 种身材穿搭索引｜GlowSelf">
  <meta property="og:description" content="按身形拆解肩线、腰线和下装体积，附 3 套公式和避雷清单。">
  <meta property="og:url" content="https://glowself.cn/article/body-shape-guide.html">
  <meta property="og:image" content="https://glowself.cn/assets/img/og-cover.png">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/site.css">
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "5 种身材穿搭索引",
    "description": "按身形拆解肩线、腰线和下装体积。",
    "url": "https://glowself.cn/article/body-shape-guide.html"
  }}
  </script>
</head>
<body>
{NAV}
<main>
  <section class="article-hero">
    <div class="shell">
      <div class="breadcrumbs"><a href="/">首页</a><span>/</span><a href="/article/index.html">风格笔记</a><span>/</span><span>身材穿搭索引</span></div>
      <h1>5 种身材，<br>5 种比例逻辑。</h1>
      <p class="dek">不是把身体塞进一个标准答案，而是找到你本来就有的优势，再用肩线、腰线和下装体积把比例调顺。</p>
      <div class="article-meta"><span>GlowSelf 编辑部</span><span>2026.11.25</span><span>索引</span><span>不评分 · 不排名</span></div>
    </div>
  </section>
  <section class="section">
    <div class="shell">
      <div class="article-grid face-hub">{cards}</div>
      <div class="callout"><b>不确定自己是什么身形？</b><p>先量肩围、腰围、胯围，再看最宽处在哪里。也可以先做色彩测试，拿到你的季节和风格坐标，再带着身形特征去选版型。</p><a class="btn btn-accent" href="/test.html">免费测色彩 DNA →</a></div>
    </div>
  </section>
</main>
{FOOTER}"""
(ART / "body-shape-guide.html").write_text(hub, encoding="utf-8")
print("wrote body-shape-guide")
