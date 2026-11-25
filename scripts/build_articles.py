#!/usr/bin/env python3
"""Generate the static editorial pages for GlowSelf v2."""
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
      <div><div class="footer-title">风格笔记</div><a href="/article/color-season-test.html">12 季色彩入门</a><a href="/article/fangyuan-face-hairstyle.html">方圆脸发型指南</a><a href="/article/capsule-wardrobe.html">胶囊衣橱清单</a><a href="/article/color-analysis-worth-it.html">色彩测试值不值</a></div>
      <div><div class="footer-title">关于</div><a href="/about.html">我们为什么做 GlowSelf</a><a href="/privacy.html">隐私政策</a><a href="/terms.html">服务条款</a><a href="mailto:hello@glowself.cn">hello@glowself.cn</a></div>
    </div>
    <div class="footer-bottom"><span>© 2026 GlowSelf 光绽</span><span>中国 · 杭州</span><span>不评分 · 不排名 · 不制造焦虑</span></div>
  </div>
</footer>
<script src="/assets/js/site.js" defer></script>
</body>
</html>"""


def page(slug, title, desc, h1, dek, date, minutes, body, toc, related, schema_type="Article"):
    toc_html = "".join(f'<a href="#{i}">{label}</a>' for i, label in toc)
    related_html = "".join(f'<a href="{href}">{label}</a><br>' for href, label in related)
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="https://glowself.cn/article/{slug}.html">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="https://glowself.cn/article/{slug}.html">
  <meta property="og:image" content="https://glowself.cn/assets/img/og-cover.png">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/site.css">
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "{schema_type}",
    "headline": "{h1}",
    "description": "{desc}",
    "datePublished": "{date}",
    "dateModified": "{date}",
    "author": {{ "@type": "Organization", "name": "GlowSelf 光绽" }},
    "publisher": {{ "@type": "Organization", "name": "GlowSelf 光绽", "logo": {{ "@type": "ImageObject", "url": "https://glowself.cn/assets/img/mark.svg" }} }},
    "mainEntityOfPage": "https://glowself.cn/article/{slug}.html"
  }}
  </script>
</head>
<body>
{NAV}
<main>
  <section class="article-hero">
    <div class="shell">
      <div class="breadcrumbs"><a href="/">首页</a><span>/</span><a href="/article/index.html">风格笔记</a><span>/</span><span>{h1}</span></div>
      <h1>{h1}</h1>
      <p class="dek">{dek}</p>
      <div class="article-meta"><span>GlowSelf 编辑部</span><span>{date.replace('-', '.')}</span><span>约 {minutes} 分钟</span><span>不评分 · 不排名</span></div>
    </div>
  </section>
  <div class="shell">
    <div class="article-layout">
      <article class="article-body">
{body}
      </article>
      <aside class="article-side">
        <div class="toc"><div class="k">本文目录</div>{toc_html}</div>
        <div class="article-cta"><h3>3 分钟，<br>找到你的本命色。</h3><p>11 个问题，不用注册，不用上传照片。</p><a class="btn" href="/test.html">免费测色彩 DNA →</a></div>
        <div class="toc"><div class="k">继续读</div>{related_html}</div>
      </aside>
    </div>
  </div>
</main>
{FOOTER}"""


articles = {}

articles["color-season-test"] = {
    "title": "12 季色彩测试是什么？一篇看懂冷暖、深浅、净柔｜GlowSelf",
    "desc": "不用背 12 个名字：先用冷暖、深浅、净柔三个坐标定位，再看 12 季色彩类型。附自测方法、常见误区和配色清单。",
    "h1": "12 季色彩，<br>到底在分什么？",
    "dek": "你不需要先背会 12 个名字。先判断三个坐标——冷暖、深浅、净柔——季节会自己浮出来。",
    "date": "2026-11-18",
    "minutes": 7,
    "toc": [("cold-warm", "01 先看冷暖"), ("light-deep", "02 再看深浅"), ("clear-soft", "03 最后看净柔"), ("matrix", "04 12 季矩阵"), ("test", "05 三种自测方法"), ("mistakes", "06 最常见的 4 个误区"), ("use", "07 知道之后怎么用")],
    "related": [("/article/fangyuan-face-hairstyle.html", "方圆脸发型指南"), ("/article/capsule-wardrobe.html", "胶囊衣橱清单"), ("/article/color-analysis-worth-it.html", "色彩测试值不值")],
    "body": """
<p>「你是冷皮还是暖皮？」这句话几乎成了中文互联网的接头暗号。但真正做形象咨询时，只分冷暖远远不够。同样偏暖，有人适合焦糖和陶土，有人适合珊瑚和蜜桃；同样偏冷，有人能穿正红，有人一穿就显土。</p>
<p>12 季色彩体系把这件事拆成三个坐标。你不需要记 12 个名字，只需要回答三个问题。</p>

<h2 id="cold-warm">01 先看冷暖：颜色和皮肤是「同频」还是「打架」</h2>
<p>冷暖看的是底色，不是表面白不白。一个很白的人也可能偏暖，一个晒得很深的人也可能偏冷。</p>
<ul>
  <li><b>偏暖：</b>皮肤底色带黄、金、桃；穿焦糖、橄榄、砖红时，脸色更均匀。</li>
  <li><b>偏冷：</b>皮肤底色带粉、青、灰；穿藏蓝、莓果、冷灰时，黑眼圈和泛红会退下去。</li>
  <li><b>中性：</b>两边都能穿，但会被明度和饱和度限制。</li>
</ul>
<p>最快的判断不是看手腕血管，而是<b>把两块布放在脸下方 10 厘米</b>：一块暖金、一块冷银。哪一块让你的下颌线更干净、嘴角更放松，就是哪一边。血管法受光线和肤色深浅影响太大，只能当参考。</p>

<h2 id="light-deep">02 再看深浅：你能承住多重的颜色</h2>
<p>深浅不是「肤色深浅」，而是<b>你整个人的明度对比</b>：头发、眼睛、皮肤之间的落差有多大。</p>
<ul>
  <li><b>偏浅：</b>发色眼珠都不算浓，适合燕麦、雾粉、浅灰蓝。颜色一重，人就被衣服吃掉。</li>
  <li><b>偏深：</b>发色眼珠浓，能承住墨绿、酒红、深棕。颜色太浅会显得没精神。</li>
</ul>
<p>一个实用测试：把手机调到黑白，拍一张自然光下的素颜照。如果五官和皮肤的灰度差很小，你偏浅；如果头发、眼睛明显比皮肤深，你偏深。</p>

<h2 id="clear-soft">03 最后看净柔：颜色要不要「加一层灰」</h2>
<p>净柔说的是饱和度与对比度。有人穿正红像开了灯，有人穿正红像被颜色压住；有人穿雾霾蓝很高级，有人穿就像没洗脸。</p>
<ul>
  <li><b>偏净：</b>五官边界清楚、瞳色黑白分明，适合高饱和、高对比。</li>
  <li><b>偏柔：</b>五官线条柔和、整体灰度接近，适合低饱和、雾面、带灰调的颜色。</li>
</ul>
<p>如果你在「正红」和「豆沙红」之间犹豫，把两件都放到脸边，退后两步看整体：哪一件让你先被看见，而不是颜色先被看见。</p>

<h2 id="matrix">04 12 季矩阵：三个坐标怎么组合</h2>
<table>
  <thead><tr><th>家族</th><th>偏浅</th><th>中间</th><th>偏深</th></tr></thead>
  <tbody>
    <tr><td>暖 · 净</td><td>浅春</td><td>暖春</td><td>净春</td></tr>
    <tr><td>暖 · 柔</td><td>柔暖秋</td><td>暖秋</td><td>深秋</td></tr>
    <tr><td>冷 · 柔</td><td>浅夏</td><td>柔夏</td><td>冷夏</td></tr>
    <tr><td>冷 · 净</td><td>净冬</td><td>冷冬</td><td>深冬</td></tr>
  </tbody>
</table>
<p>这张表是简化版，实际判断还要看你的风格原型和五官量感。比如同样是冷冬，温婉优雅和清冷知性适合的版型完全不同。色彩解决「颜色对不对」，风格解决「形状对不对」，两件事要一起看。</p>

<h2 id="test">05 三种自测方法，哪种最靠谱</h2>
<h3>方法一：白纸对比（免费，适合初步筛冷暖）</h3>
<p>素颜、自然光、白墙前，拿一张纯白 A4 纸放脸边。纸比脸更冷白，说明你偏暖；纸比脸更黄，说明你偏冷。阴天和暖光灯下不要做。</p>
<h3>方法二：衣柜抽样（免费，适合找规律）</h3>
<p>把常穿、被夸最多的 10 件衣服摊开，拍一张合照。看它们共同的颜色特征：是都偏灰，还是都偏亮？是都深，还是都浅？你的直觉已经替你做过选择。</p>
<h3>方法三：结构化测试（最快，适合要答案的人）</h3>
<p>用固定问题把三个坐标问出来，再映射到季节和风格。GlowSelf 的免费测试就是这种方式：11 个问题，2 分 30 秒，不采集人脸，结果直接给到色板和穿搭公式。</p>

<h2 id="mistakes">06 最常见的 4 个误区</h2>
<ul>
  <li><b>把「显白」当唯一标准。</b>颜色不是越白越好，是让肤色均匀、五官清楚。过度追求显白会把你锁死在浅色里。</li>
  <li><b>用粉底色号判断冷暖。</b>粉底会被氧化和妆效影响，试色位置也不对。看脖子和胸口，比看脸准。</li>
  <li><b>只看季节名，不看使用场景。</b>你是深秋，不代表所有深秋色都适合通勤。会议室需要低对比，约会可以高对比。</li>
  <li><b>把测试结果当身份证。</b>人是会变的：染发、晒黑、年龄、甚至睡眠都会影响当下的最佳颜色。把它当起点，不是终点。</li>
</ul>

<h2 id="use">07 知道之后，怎么真正用起来</h2>
<p>最有效的用法不是背 12 个色号，而是给自己定三条规则：</p>
<blockquote>靠近脸的颜色，只用本命色；大面积下装，可以放宽；让你犹豫的颜色，放到包和鞋上。</blockquote>
<p>然后把衣柜按「靠近脸 / 不靠近脸」重新分一次。你会发现，很多「没衣服穿」不是衣服少，是靠近脸的那一层颜色不对。</p>
<div class="callout"><b>下一步</b><p>做完免费测试，你会拿到 6 个本命色、3 个避雷色和 1 套公式。想每天直接照穿，再看 Plus 的 30 天计划。</p></div>
""",
}

articles["fangyuan-face-hairstyle"] = {
    "title": "方圆脸适合什么发型？5 个思路和理发店沟通话术｜GlowSelf",
    "desc": "方圆脸不是缺点，是骨骼感。拆解方圆脸的发型逻辑：重心、露肤、层次和长度，附 5 款可复制发型与 salon 沟通话术。",
    "h1": "方圆脸，<br>不是把脸遮小。",
    "dek": "方圆脸的难点不在「脸大」，而在下颌角和颧骨同时有存在感。发型要做的不是遮挡，是重新分配视觉重心。",
    "date": "2026-11-20",
    "minutes": 6,
    "toc": [("geometry", "01 先看骨骼，不看脸型标签"), ("logic", "02 三条底层逻辑"), ("styles", "03 5 款可复制发型"), ("salon", "04 理发店沟通话术"), ("avoid", "05 最容易翻车的 3 件事"), ("color", "06 发色怎么选")],
    "related": [("/article/color-season-test.html", "12 季色彩入门"), ("/article/capsule-wardrobe.html", "胶囊衣橱清单"), ("/article/color-analysis-worth-it.html", "色彩测试值不值")],
    "body": """
<p>「方圆脸」在中文语境里常被当成缺点，其实它描述的是两种骨骼同时存在：颧骨有支撑，下颌角有转折。这类脸型抗老、上镜有力量，但也容易在发型上吃亏——剪短了显方，留长了显拖，扎起来又显脸大。</p>
<p>问题通常不在脸，而在发型的<b>重心</b>。</p>

<h2 id="geometry">01 先看骨骼，不看脸型标签</h2>
<p>对着镜子，把头发全部拨到耳后，看三个点：</p>
<ul>
  <li><b>颧骨最宽处</b>和<b>下颌角最宽处</b>是不是差不多宽？如果是，属于方圆。</li>
  <li>下颌角是锐利转折，还是圆润过渡？锐利偏方，圆润偏圆。</li>
  <li>额头宽度和下颌宽度差多少？差得少，整张脸更「稳」。</li>
</ul>
<p>这三个点决定了你需要的不是「遮」，而是「引」：把视线引到眼睛、引到纵向、引到你希望被看见的地方。</p>

<h2 id="logic">02 三条底层逻辑</h2>
<h3>逻辑一：头顶要有高度，两侧不要有宽度</h3>
<p>方圆脸最怕「上扁下宽」。头顶一扁，下颌角就被放大。吹头发时把发根吹起来，比剪一个刘海更有效。两侧的蓬松要放在耳朵以上，耳下保持干净。</p>
<h3>逻辑二：露出一点额头，比全遮更轻</h3>
<p>厚齐刘海会把脸切成两段，让下半张脸更重。侧分、八字刘海、空气刘海都可以，关键是<b>露出眉峰和一点额头</b>。如果你不想露额头，至少让刘海有缝隙。</p>
<h3>逻辑三：长度落在锁骨附近，最安全</h3>
<p>下巴长度的短发会把视觉重心压在下颌角；胸以下的长发会把整个人往下拉。锁骨到胸口之间的长度，既有纵向延伸，又不会拖。</p>

<h2 id="styles">03 5 款可复制发型</h2>
<h3>1. 锁骨发 + 八字刘海</h3>
<p>长度在锁骨上下 2 厘米，发尾做一点内扣或自然外翻。八字刘海从眉峰开始向外走，露出额头中间。适合大多数方圆脸，通勤好打理。</p>
<h3>2. 高层次中长发</h3>
<p>层次从颧骨下方开始，不要从头顶就打薄。外层短、内层长，形成纵向线条。适合发量多、发质硬的人。</p>
<h3>3. 侧分大波浪</h3>
<p>分线在瞳孔正上方，波浪从耳朵上方开始。卷度不要太小，否则会横向加宽。适合约会、上镜。</p>
<h3>4. 低马尾 + 耳前碎发</h3>
<p>马尾扎在枕骨下方，不要扎太紧。耳前留两缕碎发，长度到下颌角。适合没时间吹头发的工作日。</p>
<h3>5. 短 Bob + 法式刘海</h3>
<p>长度在下巴以上、耳下 3 厘米，后脑勺要有圆弧。刘海薄、有缝隙。适合小个子、五官量感偏小的人。</p>

<h2 id="salon">04 理发店沟通话术</h2>
<p>不要只说「显脸小」。发型师听到这四个字，通常会给你加厚刘海、把两侧头发往前放，结果更方。可以这样说：</p>
<blockquote>「我颧骨和下颌角比较明显，想要头顶有高度、两侧耳下收干净。长度到锁骨，层次从颧骨下面开始，不要厚齐刘海，刘海要有缝隙。」</blockquote>
<p>再补一句你的日常：「我每天只有 5 分钟吹头发，需要洗完自然干也好看。」这句话会改变发型师的层次和打薄方式。</p>

<h2 id="avoid">05 最容易翻车的 3 件事</h2>
<ul>
  <li><b>厚齐刘海 + 下巴短发：</b>把脸框成一个正方形，重心全在下半张脸。</li>
  <li><b>两侧从头顶开始蓬：</b>横向加宽，脸看起来更方。</li>
  <li><b>过度打薄：</b>发尾碎成一片，失去纵向线条，反而显脸大。</li>
</ul>

<h2 id="color">06 发色怎么选</h2>
<p>发色是离脸最近的大色块，比衣服更影响气色。偏暖的人适合栗棕、焦糖、蜂蜜茶；偏冷的人适合冷棕、黑茶、莓果棕。不要只看网图，先确认自己的冷暖坐标。</p>
<div class="callout"><b>一个更快的办法</b><p>先做 11 题色彩测试，拿到你的季节和风格，再决定发色和发型。测试不采集人脸，2 分 30 秒出结果。</p></div>
""",
}

articles["capsule-wardrobe"] = {
    "title": "胶囊衣橱清单：24 件衣服，30 套搭配｜GlowSelf",
    "desc": "一份可以直接照买的胶囊衣橱清单：24 件基础款、配色比例、30 套组合公式和预算分配。适合不想每天想穿什么的人。",
    "h1": "24 件衣服，<br>够穿一整季。",
    "dek": "胶囊衣橱不是极简苦行，是把「选择」提前做完。你需要的不是更多衣服，是一套能互相组合的系统。",
    "date": "2026-11-22",
    "minutes": 7,
    "toc": [("principle", "01 先定比例，再买单品"), ("list", "02 24 件清单"), ("formula", "03 30 套怎么来"), ("budget", "04 预算怎么分"), ("shopping", "05 买之前问 3 个问题"), ("maintain", "06 每季 30 分钟维护")],
    "related": [("/article/color-season-test.html", "12 季色彩入门"), ("/article/fangyuan-face-hairstyle.html", "方圆脸发型指南"), ("/article/color-analysis-worth-it.html", "色彩测试值不值")],
    "body": """
<p>很多人以为胶囊衣橱就是「只留 30 件衣服」。真正的胶囊衣橱是<b>一套组合系统</b>：每件衣服至少能和 3 件其他衣服搭，颜色在一个可控的范围内，场合覆盖你 80% 的生活。</p>
<p>下面这份清单以中国城市女性的秋冬为样本。你可以按气候和职业调整，但比例不要大改。</p>

<h2 id="principle">01 先定比例，再买单品</h2>
<p>把衣柜颜色分成三层：</p>
<ul>
  <li><b>70% 基础色：</b>黑、白、灰、燕麦、藏蓝、棕。负责打底和连接。</li>
  <li><b>20% 本命色：</b>你的季节色板里最衬脸的那几个。负责靠近脸的上装、围巾、口红。</li>
  <li><b>10% 点缀色：</b>包、鞋、耳饰。负责让整套 look 有记忆点。</li>
</ul>
<p>大多数人的衣柜是反过来的：80% 是冲动买的花色，20% 是能穿的基础款。于是每天早上都在「没衣服穿」和「衣服太多」之间循环。</p>

<h2 id="list">02 24 件清单</h2>
<h3>上装（7 件）</h3>
<ul>
  <li>白色 / 燕麦色衬衫 1 件（可通勤可休闲）</li>
  <li>本命色针织开衫 1 件（靠近脸，提气色）</li>
  <li>黑色 / 藏蓝薄高领 1 件（打底）</li>
  <li>灰色 / 棕色圆领针织 1 件</li>
  <li>条纹或纯色长袖 T 1 件</li>
  <li>西装外套 1 件（肩线合适最重要）</li>
  <li>风衣或短夹克 1 件（看气候）</li>
</ul>
<h3>下装（4 件）</h3>
<ul>
  <li>高腰直筒牛仔裤 1 条</li>
  <li>黑色 / 藏蓝直筒西裤 1 条</li>
  <li>A 字半裙或裹身裙 1 条</li>
  <li>阔腿裤 1 条（垂感要好）</li>
</ul>
<h3>连衣裙 / 连体（2 件）</h3>
<ul>
  <li>本命色针织连衣裙 1 条（秋冬内搭）</li>
  <li>小黑裙 1 条（场合保底）</li>
</ul>
<h3>鞋（4 双）</h3>
<ul>
  <li>黑色乐福鞋 / 短靴 1 双</li>
  <li>白色 / 米色运动鞋 1 双</li>
  <li>尖头低跟鞋 1 双（重要场合）</li>
  <li>平底凉鞋或玛丽珍 1 双（看季节）</li>
</ul>
<h3>包与配饰（7 件）</h3>
<ul>
  <li>通勤托特包 1 个（能装电脑）</li>
  <li>小号斜挎包 1 个</li>
  <li>皮带 1 条（和鞋同色系）</li>
  <li>金属耳饰 1 对（按你的金属色选）</li>
  <li>围巾 1 条（本命色）</li>
  <li>墨镜 1 副</li>
  <li>手表或手链 1 件</li>
</ul>

<h2 id="formula">03 30 套怎么来</h2>
<p>不需要背 30 套。用「上装 × 下装 × 鞋」三列，每列选 1 件，就能生成 7×4×4 种组合。真正需要控制的只有三件事：</p>
<ul>
  <li><b>颜色不超过 3 个</b>（不含黑白灰）。</li>
  <li><b>松紧有对比</b>：上紧下松，或上松下紧。</li>
  <li><b>有一个视觉焦点</b>：颜色、材质或配饰，只选一个。</li>
</ul>
<p>周一到周五先排好：周一通勤（衬衫 + 西裤）、周二会议（西装 + 高领）、周三轻松（针织 + 牛仔）、周四见朋友（连衣裙 + 短靴）、周五机动（风衣 + 阔腿裤）。周末留给运动和约会。</p>

<h2 id="budget">04 预算怎么分</h2>
<p>如果一季预算 3000 元，建议这样分：</p>
<table>
  <thead><tr><th>类别</th><th>占比</th><th>金额</th><th>建议</th></tr></thead>
  <tbody>
    <tr><td>外套</td><td>35%</td><td>1050</td><td>值得投资，穿 3 年以上</td></tr>
    <tr><td>鞋包</td><td>25%</td><td>750</td><td>舒适度优先，别买磨脚的</td></tr>
    <tr><td>上装</td><td>20%</td><td>600</td><td>靠近脸，颜色要对</td></tr>
    <tr><td>下装</td><td>15%</td><td>450</td><td>版型比品牌重要</td></tr>
    <tr><td>配饰</td><td>5%</td><td>150</td><td>用来换风格，不必贵</td></tr>
  </tbody>
</table>

<h2 id="shopping">05 买之前问 3 个问题</h2>
<blockquote>它能和我衣柜里至少 3 件现有衣服搭吗？<br>它适合我 80% 的日常场合吗？<br>如果今天不打折，我还会买吗？</blockquote>
<p>三个都是「是」，再买。有一个「否」，放回购物车，等 48 小时。大多数冲动会在这 48 小时里消失。</p>

<h2 id="maintain">06 每季 30 分钟维护</h2>
<ul>
  <li>把本季没穿过的衣服单独放一边，季末处理掉。</li>
  <li>检查靠近脸的上装颜色，是否还在你的本命色范围内。</li>
  <li>补 1 件真正缺的单品，而不是「看起来不错」的第 5 件白衬衫。</li>
</ul>
<div class="callout"><b>先知道自己适合什么颜色</b><p>胶囊衣橱的第一步不是买，是确定色板。做一次免费色彩 DNA 测试，拿到 6 个本命色和 3 个避雷色，再开始整理衣柜。</p></div>
""",
}

articles["color-analysis-worth-it"] = {
    "title": "色彩测试值不值得做？一次讲清价格、套路和替代方案｜GlowSelf",
    "desc": "色彩测试从免费到上千元，差别在哪？拆解线下色彩分析的流程、常见套路、适合人群，以及不花钱的自测替代方案。",
    "h1": "色彩测试，<br>值不值得花钱？",
    "dek": "从免费问卷到 3000 元线下色彩分析，你买的到底是什么？这篇文章不卖焦虑，只帮你判断需不需要。",
    "date": "2026-11-24",
    "minutes": 6,
    "toc": [("what", "01 你买的到底是什么"), ("price", "02 价格差在哪"), ("trap", "03 4 个常见套路"), ("who", "04 谁适合做"), ("free", "05 不花钱的替代方案"), ("choose", "06 怎么选一家靠谱的")],
    "related": [("/article/color-season-test.html", "12 季色彩入门"), ("/article/fangyuan-face-hairstyle.html", "方圆脸发型指南"), ("/article/capsule-wardrobe.html", "胶囊衣橱清单")],
    "body": """
<p>色彩测试的价格可以从 0 元到 3000 元。贵的不一定更准，免费的不一定没用。差别主要在<b>判断方式</b>、<b>交付深度</b>和<b>后续服务</b>。</p>

<h2 id="what">01 你买的到底是什么</h2>
<p>一次完整的色彩分析通常包含四件事：</p>
<ul>
  <li><b>判断：</b>用色布、灯光和顾问经验，判断你的冷暖、深浅、净柔。</li>
  <li><b>色板：</b>给你一组适合和不适合的颜色。</li>
  <li><b>翻译：</b>把色板翻译成衣服、妆容、发色、配饰的具体选择。</li>
  <li><b>落地：</b>陪你整理衣柜、试穿、买对单品。</li>
</ul>
<p>大多数线上测试只做到前两步。真正让人「穿对了」的，是后两步。所以你会看到有人做完测试，拿到一张色卡，回家还是不知道怎么穿。</p>

<h2 id="price">02 价格差在哪</h2>
<table>
  <thead><tr><th>形式</th><th>价格区间</th><th>优点</th><th>局限</th></tr></thead>
  <tbody>
    <tr><td>免费问卷 / App</td><td>0 元</td><td>快、隐私、可反复</td><td>无法看真实肤色，精度有限</td></tr>
    <tr><td>线上顾问</td><td>199–699 元</td><td>有真人判断，能问答</td><td>照片受光线影响</td></tr>
    <tr><td>线下一对一</td><td>800–3000 元</td><td>色布实测，最直观</td><td>贵、耗时、城市受限</td></tr>
    <tr><td>线下 + 陪购</td><td>3000 元以上</td><td>直接落地到衣柜</td><td>价格高，依赖顾问水平</td></tr>
  </tbody>
</table>
<p>如果你只是想知道自己大概是什么季，免费工具足够。如果你要参加婚礼、上镜、转型职业形象，线下一对一更值。</p>

<h2 id="trap">03 4 个常见套路</h2>
<ul>
  <li><b>用「你穿错了 20 年」制造焦虑。</b>好的顾问会告诉你哪些已经做对了，而不是否定你整个人。</li>
  <li><b>只给色卡，不给场景。</b>色卡不是答案。你要问：通勤怎么穿？见客户怎么穿？约会怎么穿？</li>
  <li><b>把季型说成身份证。</b>人是会变的。染发、晒黑、年龄都会影响结果，好的顾问会允许你「不完全符合」。</li>
  <li><b>强推购买。</b>测试就是测试，买衣服是另一件事。把两件事绑在一起卖，要警惕。</li>
</ul>

<h2 id="who">04 谁适合做</h2>
<p>适合：</p>
<ul>
  <li>衣柜很满但每天不知道穿什么的人。</li>
  <li>反复买错颜色、买了一堆「只能在家穿」的衣服的人。</li>
  <li>要参加婚礼、面试、上镜，需要一套确定方案的人。</li>
  <li>想建立个人风格，但不想试错三年的人。</li>
</ul>
<p>不太需要：</p>
<ul>
  <li>已经有稳定风格、清楚自己适合什么的人。</li>
  <li>只是好奇，没有实际穿搭需求的人。</li>
  <li>预算紧张，却想靠一次测试解决所有形象问题的人。</li>
</ul>

<h2 id="free">05 不花钱的替代方案</h2>
<p>如果你不想花钱，可以做这三件事：</p>
<ul>
  <li><b>衣柜抽样：</b>把最常穿、被夸最多的 10 件衣服拍在一起，找共同颜色。</li>
  <li><b>白纸测试：</b>素颜、自然光、白纸放脸边，判断冷暖。</li>
  <li><b>结构化问卷：</b>用固定问题把冷暖、深浅、净柔问出来，比凭感觉准。</li>
</ul>
<p>GlowSelf 的免费测试就是第三种。它不采集人脸，2 分 30 秒出结果，给你季节、风格、6 个本命色和 1 套公式。它不是线下色布测试的替代品，但足够让你少买错几件。</p>

<h2 id="choose">06 怎么选一家靠谱的</h2>
<blockquote>先问三个问题：判断依据是什么？交付包含哪些场景？如果不准，能不能复测或退款？</blockquote>
<p>回答含糊的，谨慎。愿意把方法、局限和后续服务讲清楚的，通常更靠谱。价格不是唯一标准，透明才是。</p>
<div class="callout"><b>我们的立场</b><p>GlowSelf 不做颜值打分，也不承诺「变美」。我们只做一件事：把你的特征翻译成可执行的选择。免费测试永久免费，Plus 是给需要每天答案的人。</p></div>
""",
}

for slug, a in articles.items():
    html = page(slug, a["title"], a["desc"], a["h1"], a["dek"], a["date"], a["minutes"], a["body"], a["toc"], a["related"])
    (ART / f"{slug}.html").write_text(html, encoding="utf-8")
    print("wrote", slug)

# Editorial hub
cards = "".join(
    f"""<a class="article-card reveal" href="/article/{slug}.html">
      <div class="article-card-kicker">{a['date'].replace('-', '.')} · {a['minutes']} 分钟</div>
      <h2>{a['h1'].replace('<br>', '')}</h2>
      <p>{a['dek']}</p>
      <span class="article-card-more">阅读全文 →</span>
    </a>"""
    for slug, a in articles.items()
)
hub = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>风格笔记｜色彩、发型与衣橱的实用指南｜GlowSelf</title>
  <meta name="description" content="GlowSelf 风格笔记：12 季色彩入门、方圆脸发型、胶囊衣橱清单、色彩测试避坑。不评分，不排名，只给可执行的选择。">
  <link rel="canonical" href="https://glowself.cn/article/index.html">
  <meta property="og:title" content="风格笔记｜GlowSelf">
  <meta property="og:description" content="色彩、发型与衣橱的实用指南。">
  <meta property="og:url" content="https://glowself.cn/article/index.html">
  <meta property="og:image" content="https://glowself.cn/assets/img/og-cover.png">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/site.css">
</head>
<body>
{NAV}
<main>
  <section class="article-hero">
    <div class="shell">
      <div class="breadcrumbs"><a href="/">首页</a><span>/</span><span>风格笔记</span></div>
      <h1>风格笔记。</h1>
      <p class="dek">不追趋势，只讲能用的：颜色怎么选、发型怎么剪、衣柜怎么减。每一篇都能在明天用上。</p>
    </div>
  </section>
  <section class="section">
    <div class="shell">
      <div class="article-grid">{cards}</div>
    </div>
  </section>
  <section class="section">
    <div class="shell"><div class="cta-band reveal"><div><div class="eyebrow" style="color:rgba(246,241,232,.55)">START FREE</div><h2 class="display-sm" style="color:var(--paper)">读完，不如测一次。</h2><p style="color:rgba(246,241,232,.62)">11 个问题，2 分 30 秒，不用注册。</p></div><div class="cta-actions"><a class="btn btn-accent btn-lg" href="/test.html">免费测色彩 DNA →</a></div></div></div>
  </section>
</main>
{FOOTER}"""
(ART / "index.html").write_text(hub, encoding="utf-8")
print("wrote article hub")
