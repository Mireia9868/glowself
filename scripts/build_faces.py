#!/usr/bin/env python3
"""Generate six face-shape hairstyle guides under /article/."""
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
      <div><div class="footer-title">风格笔记</div><a href="/article/color-season-test.html">12 季色彩入门</a><a href="/article/fangyuan-face-hairstyle.html">方圆脸发型指南</a><a href="/article/face-shape-guide.html">7 种脸型发型索引</a><a href="/article/body-shape-guide.html">5 种身材穿搭索引</a><a href="/article/capsule-wardrobe.html">胶囊衣橱清单</a><a href="/article/color-analysis-worth-it.html">色彩测试值不值</a></div>
      <div><div class="footer-title">关于</div><a href="/about.html">我们为什么做 GlowSelf</a><a href="/privacy.html">隐私政策</a><a href="/terms.html">服务条款</a><a href="mailto:hello@glowself.cn">hello@glowself.cn</a></div>
    </div>
    <div class="footer-bottom"><span>© 2026 GlowSelf 光绽</span><span>中国 · 杭州</span><span>不评分 · 不排名 · 不制造焦虑</span></div>
  </div>
</footer>
<script src="/assets/js/site.js" defer></script>
</body>
</html>"""

FACES = {
    "round-face": {
        "name": "圆脸",
        "title": "圆脸适合什么发型？4 个拉长比例的思路与避雷｜GlowSelf",
        "desc": "圆脸不是只能遮。用头顶高度、侧分线和锁骨长度重新分配比例，附 4 款可复制发型、理发店话术和 3 个常见误区。",
        "h1": "圆脸，<br>不是只能遮。",
        "dek": "圆脸的优势是亲和、显年轻，难点是宽度集中在中段。发型要做的不是把脸藏起来，而是把视线往上、往下引。",
        "facts": [("最宽处", "脸颊中段"), ("长宽比", "接近 1:1"), ("下颌", "圆润过渡")],
        "check": ["从正面看，脸的宽度和长度接近。", "脸颊中段是最宽的位置，额头和下颌略窄。", "下颌角圆润，没有明显折角。"],
        "principles": [
            ("头顶要有高度，两侧不要加宽", "圆脸最怕上扁下宽。吹头发先把发根吹起来，两侧的蓬松放在耳朵以上，耳下尽量收干净。"),
            ("侧分或八字刘海，比厚齐刘海更轻", "厚齐刘海会把脸切成两段，让中段更宽。露出一点额头和眉峰，脸会立刻有纵向感。"),
            ("长度过下巴，停在锁骨附近", "齐耳或齐下巴会正好框住最宽处。锁骨上下的长度既能拉长，也不会把整个人往下拖。"),
        ],
        "styles": [
            ("锁骨层次发 + 侧分", "长度在锁骨上下 2 厘米，层次从颧骨下方开始。侧分线放在瞳孔正上方，发根吹蓬松。通勤最稳。"),
            ("八字刘海 + 耳后留一束", "八字刘海从眉峰向外走，耳前留一小束修饰脸颊，其余头发别到耳后。适合发量多的人。"),
            ("高马尾 + 耳前碎发", "马尾扎在枕骨上方，头顶拉出一点高度，耳前留两缕碎发。没时间吹头发时最快。"),
            ("耳下微卷中长发", "卷度从耳朵下方开始，不要从颧骨就开始卷。外翻或内扣都可以，关键是不要横向炸开。"),
        ],
        "avoid": ["齐耳蘑菇头：把最宽处框得死死的。", "厚齐刘海：脸被切成两段，重心全在中段。", "两侧耳下蓬松：横向加宽，脸看起来更圆。"],
        "salon": "「我脸的宽度集中在脸颊，想要头顶有高度、耳下收干净。长度到锁骨，层次从颧骨下面开始，不要厚齐刘海，刘海要有缝隙。」",
        "color": "圆脸适合把视线引到发色上。偏暖的人选栗棕、焦糖、蜂蜜茶；偏冷的人选冷棕、黑茶、莓果棕。发色离脸最近，比衣服更影响气色。",
        "faqs": [("圆脸能剪短发吗？", "可以，但不要选齐下巴的一刀切。耳下 3 厘米的 Bob、后脑勺有圆弧、侧分露额，会比长发更轻。"), ("圆脸适合中分吗？", "中分可以，但发根必须蓬松。贴头皮的中分会把脸从中间切开，显得更宽。"), ("圆脸扎头发一定显大吗？", "不一定。头顶拉高、耳前留碎发、不要扎太紧，扎发反而比披发更利落。")],
    },
    "square-face": {
        "name": "方脸",
        "title": "方脸适合什么发型？柔化下颌角的 4 个思路｜GlowSelf",
        "desc": "方脸不需要把下颌角磨平。用重心上移、耳下 S 卷和侧分线柔化轮廓，附 4 款发型、理发店话术与 3 个避雷。",
        "h1": "方脸，<br>不需要磨平下颌角。",
        "dek": "方脸的力量感来自清晰的骨骼。发型不是遮住下颌角，而是让视线在额头、眼睛和发尾之间流动。",
        "facts": [("最宽处", "下颌角 / 颧骨"), ("轮廓", "折角清晰"), ("气质", "利落、有存在感")],
        "check": ["额头、颧骨、下颌的宽度接近。", "侧面能看到明显的下颌折角。", "脸型偏直线，五官量感通常不小。"],
        "principles": [
            ("重心上移，别把视觉压在下颌", "头顶和眉眼区域要有存在感。发尾停在锁骨附近，不要齐刷刷地落在下颌角。"),
            ("用 S 形线条，不用一刀切", "耳下开始的 S 卷、侧分大波浪，都比贴头皮的直发更能柔化折角。卷度不要太小。"),
            ("露额头，但不要全露", "侧分、八字刘海、法式刘海都可以。关键是刘海有缝隙，让额头和眉眼有呼吸感。"),
        ],
        "styles": [
            ("侧分大波浪", "分线在瞳孔上方，波浪从耳朵上方开始。卷度大一点，避免横向加宽。适合约会和上镜。"),
            ("锁骨发 + 法式刘海", "长度在锁骨附近，发尾自然外翻。法式刘海薄而有缝隙，遮住发际线但不压眉。"),
            ("耳下 S 卷中长发", "从耳下开始做 S 形，发尾不要打太薄。适合发量中等、发质偏硬的人。"),
            ("低盘发 + 耳前碎发", "盘发落在枕骨下方，不要梳得太光。耳前留两缕到下颌角的碎发，正式场合也柔和。"),
        ],
        "avoid": ["齐下巴一刀切：正好把视线锁在下颌角。", "厚重齐刘海：上半张脸被压住，下半张脸更重。", "贴头皮直发：把折角完全暴露，没有过渡。"],
        "salon": "「我下颌角比较明显，想要头顶有高度、耳下做 S 形过渡。长度到锁骨，不要一刀切，刘海要薄、有缝隙，不要贴头皮。」",
        "color": "方脸适合有质感、低饱和的发色，避免太黄太亮的漂色。偏暖人选深栗、摩卡；偏冷人选冷棕、黑茶、深莓果。",
        "faqs": [("方脸适合短发吗？", "适合，但不要齐下巴。耳下 Bob、后脑勺有圆弧、侧分露额，能把重心往上提。"), ("方脸能留直发吗？", "可以，但要有层次和蓬松度。完全贴头皮的直发会把下颌角显得更硬。"), ("方脸适合厚刘海吗？", "不建议。厚齐刘海会压住上半张脸，让下半张脸更重。选薄刘海或八字刘海。")],
    },
    "oval-face": {
        "name": "鹅蛋脸",
        "title": "鹅蛋脸适合什么发型？别把优势剪没了｜GlowSelf",
        "desc": "鹅蛋脸比例均衡，最容易驾驭多种发型。4 个保留轮廓的思路、3 个过度修饰的误区，以及发色和理发店话术。",
        "h1": "鹅蛋脸，<br>别把优势剪没了。",
        "dek": "鹅蛋脸不是「什么都能剪」，而是「不需要靠发型修正」。最可惜的做法，是用厚刘海和过度打薄把流畅轮廓藏起来。",
        "facts": [("最宽处", "颧骨略宽于下颌"), ("比例", "三庭较均衡"), ("轮廓", "线条流畅")],
        "check": ["脸的长度略大于宽度，比例接近 1.5:1。", "颧骨是最宽处，但和下颌差距不大。", "额头、脸颊、下颌的线条过渡平滑。"],
        "principles": [
            ("保留轮廓，不要用头发把脸框死", "鹅蛋脸的優勢是线条。厚刘海、贴脸直发、过度打薄都会破坏这种流畅感。"),
            ("重心可以自由调整", "想显利落就把头发别到耳后；想显柔和就做耳下微卷。鹅蛋脸的空间在于风格，不在于修正。"),
            ("发质比长度更重要", "同一款发型，发根蓬松、发尾有重量，会比长度本身更影响效果。"),
        ],
        "styles": [
            ("中长直发 + 侧分", "长度到胸口上方，发尾保留一点重量。侧分露出额头，干净但不贴头皮。"),
            ("法式刘海 + 锁骨发", "薄刘海有缝隙，锁骨发尾自然外翻。适合想增加一点氛围感的人。"),
            ("高盘发 + 耳饰", "把头发全部盘起，露出完整轮廓。鹅蛋脸最适合用耳饰和领口做重点。"),
            ("短 Bob + 微卷", "长度在下巴附近，后脑勺有圆弧。想换风格时最安全的一步。"),
        ],
        "avoid": ["厚齐刘海：把最流畅的额头线条藏起来。", "过度打薄：发尾碎成一片，失去质感。", "盲目追高颅顶：头脸比例失衡，反而显头大。"],
        "salon": "「我的脸型比较均衡，不想用厚刘海或过度打薄去修饰。想保留轮廓，发根蓬松、发尾有重量，长度按我的日常打理时间来决定。」",
        "color": "鹅蛋脸几乎不挑色，但要看肤色冷暖。偏暖人选蜜茶、焦糖、暖棕；偏冷人选冷棕、黑茶、灰紫。先确认冷暖，再选深浅。",
        "faqs": [("鹅蛋脸适合所有发型吗？", "大多数都适合，但要注意发质和头脸比例。厚刘海、过度打薄、贴头皮直发是三个常见减分项。"), ("鹅蛋脸需要修饰吗？", "不需要靠发型修正轮廓，可以用发型表达风格。想温柔就做微卷，想利落就露额头。"), ("鹅蛋脸适合什么发色？", "先看肤色冷暖，再看想要的风格。暖皮选暖棕，冷皮选冷棕；不确定就先做低饱和的深色。")],
    },
    "long-face": {
        "name": "长脸",
        "title": "长脸适合什么发型？4 个增加横向宽度的思路｜GlowSelf",
        "desc": "长脸不需要再拉长。用刘海截断、耳下卷度和低重心扎发增加横向比例，附 4 款发型、理发店话术与避雷。",
        "h1": "长脸，<br>把纵向分一点给横向。",
        "dek": "长脸的优势是显瘦、显气质，难点是容易显得成熟或清苦。发型要做的，是在纵向里加一点横向的停顿。",
        "facts": [("长宽比", "明显大于 1.5:1"), ("最宽处", "颧骨"), ("视觉", "纵向感强")],
        "check": ["脸的长度明显大于宽度。", "额头、中庭或下庭有一段偏长。", "脸颊偏窄，侧面看脸型偏长。"],
        "principles": [
            ("用刘海截断纵向", "法式刘海、空气刘海、八字刘海都可以。不要选完全贴头皮的露额造型，也不要把刘海剪得太短。"),
            ("降低头顶高度，增加耳下宽度", "高颅顶加高马尾会把脸拉得更长。把蓬松放在耳朵两侧和发尾，比例会更均衡。"),
            ("长度停在下颌到锁骨之间", "太长的直发会把整个人往下拉。锁骨附近的卷发，既有横向体积，也不会压个子。"),
        ],
        "styles": [
            ("法式刘海 + 锁骨卷", "刘海薄而有缝隙，长度过眉。锁骨卷从耳下开始，发尾外翻，增加横向体积。"),
            ("侧分大波浪", "分线不要太靠中间，波浪从颧骨下方开始。卷度大，避免小卷把脸拉得更长。"),
            ("耳下 Bob + 微卷", "长度在下颌到下巴之间，耳侧做一点蓬松。适合想剪短又不想显脸长的人。"),
            ("低马尾 + 宽鬓角", "马尾扎低，耳前留宽一点的鬓角，头顶不要拉太高。适合正式场合。"),
        ],
        "avoid": ["中分贴头皮长直发：把纵向拉到极限。", "高颅顶 + 高马尾：脸被继续拉长。", "过短的眉上刘海：截断位置太高，比例更怪。"],
        "salon": "「我的脸偏长，不想要再拉长。想用刘海截断、耳下增加一点宽度，长度到锁骨，头顶不要太高，发尾要有体积。」",
        "color": "长脸适合把视觉停在脸部中段。可以在耳侧做一点挑染或层次，但不要只在头顶做高光。发色选低饱和的暖棕或冷棕，避免太浅的漂色。",
        "faqs": [("长脸适合中分吗？", "可以，但不要贴头皮。中分时要把两侧吹蓬松，或者把一侧别到耳后，打破纵向线条。"), ("长脸能留长发吗？", "可以，但要有层次和卷度。完全贴脸的长直发会把脸拉得更长。"), ("长脸适合什么刘海？", "法式、空气、八字刘海都适合。长度过眉、有缝隙，不要剪成厚齐刘海或超短眉上刘海。")],
    },
    "heart-face": {
        "name": "心形脸",
        "title": "心形脸适合什么发型？让下半张脸有分量的 4 个思路｜GlowSelf",
        "desc": "心形脸上宽下窄，发型重点不是继续遮额头，而是给下颌和发尾增加分量。4 款发型、3 个避雷和理发店话术。",
        "h1": "心形脸，<br>下半张脸需要一点分量。",
        "dek": "心形脸的额头和颧骨有存在感，下颌收窄、下巴偏尖。发型要做的，是把一点体积还给下半张脸。",
        "facts": [("最宽处", "额头 / 颧骨"), ("下颌", "收窄"), ("下巴", "偏尖")],
        "check": ["额头或颧骨明显宽于下颌。", "下颌线收窄，下巴偏尖。", "侧面看，上半张脸比下半张脸更有分量。"],
        "principles": [
            ("下半部增加体积，上半部保持干净", "发尾的卷度、层次和重量放在耳下到锁骨之间，头顶不要过度蓬松。"),
            ("刘海要有缝隙，不要压住额头", "厚齐刘海会让上半张脸更宽。八字刘海、侧分、法式刘海都可以。"),
            ("长度避开下巴最尖的位置", "齐下巴会把视线集中在下巴尖。锁骨附近或耳下 Bob 更平衡。"),
        ],
        "styles": [
            ("锁骨外翻 + 八字刘海", "长度到锁骨，发尾外翻增加下半部体积。八字刘海从眉峰向外走，露出额头中间。"),
            ("低层次中长发", "层次不要打太高，发尾保留重量。适合发量少、发质软的人。"),
            ("侧分波浪 + 耳前碎发", "侧分增加横向线条，耳前碎发修饰颧骨。波浪从耳下开始。"),
            ("低马尾 + 耳下蓬松", "马尾扎低，耳下留一点蓬松的头发。不要把头顶梳得太高太紧。"),
        ],
        "avoid": ["高颅顶 + 两侧贴：上半张脸更宽，下半张脸更窄。", "超短精灵头：把收窄的下颌完全暴露。", "厚齐刘海：压住额头，脸看起来更短更宽。"],
        "salon": "「我额头和颧骨比较宽、下颌偏窄，想要下半张脸多一点分量。长度到锁骨，发尾有体积，头顶不要太高，刘海要有缝隙。」",
        "color": "心形脸适合把发色重点放在耳下和发尾。偏暖人选蜜茶、栗棕；偏冷人选冷棕、深莓果。避免只在头顶做浅色挑染。",
        "faqs": [("心形脸适合短发吗？", "适合耳下 Bob，但不要超短精灵头。发尾要有重量，后脑勺有圆弧，能平衡下颌。"), ("心形脸适合厚刘海吗？", "不建议。厚齐刘海会让上半张脸更宽，选八字或法式刘海更轻。"), ("心形脸适合什么卷度？", "耳下开始的中大卷最稳。小卷会把上半张脸撑宽，贴头皮直发又会显得下半张脸更窄。")],
    },
    "diamond-face": {
        "name": "菱形脸",
        "title": "菱形脸适合什么发型？把颧骨变成优势的 4 个思路｜GlowSelf",
        "desc": "菱形脸颧骨最宽、太阳穴偏凹。用太阳穴蓬松、颧骨侧线条和耳下体积平衡轮廓，附 4 款发型与避雷。",
        "h1": "菱形脸，<br>把颧骨变成优势。",
        "dek": "菱形脸的骨骼感很强，颧骨是最有辨识度的位置。发型不需要把颧骨藏起来，而是让太阳穴和下颌也有存在感。",
        "facts": [("最宽处", "颧骨"), ("太阳穴", "偏凹"), ("下颌", "偏窄")],
        "check": ["颧骨明显宽于额头和下颌。", "太阳穴看起来有一点凹。", "下颌收窄，下巴偏尖或偏窄。"],
        "principles": [
            ("太阳穴要蓬松，不要贴", "把两侧发根吹起来，或者用八字刘海遮住太阳穴的凹陷。贴头皮会把颧骨衬得更宽。"),
            ("颧骨处留线条，不要一刀切", "耳前留一束到颧骨下方的碎发，或者用 S 形侧分。不要用齐刘海把脸横向截断。"),
            ("下半部增加一点宽度", "发尾放在锁骨附近，做一点外翻或微卷，让下颌看起来不那么窄。"),
        ],
        "styles": [
            ("八字刘海 + 锁骨发", "八字刘海从太阳穴开始向外走，正好补上凹陷。锁骨发尾外翻，增加下半部体积。"),
            ("侧分大波浪", "分线放在瞳孔上方，波浪从颧骨下方开始。侧分能打破颧骨的横向宽度。"),
            ("低层次中长发", "层次从下巴附近开始，不要从颧骨就打薄。发尾保留重量。"),
            ("耳下 Bob + 耳侧蓬松", "长度在下颌附近，耳侧做一点圆弧。适合想剪短、又想保留柔和感的人。"),
        ],
        "avoid": ["全贴头皮：太阳穴更凹，颧骨更突出。", "齐刘海压眉：把脸横向截断，颧骨更宽。", "耳上超短：把颧骨和太阳穴完全暴露。"],
        "salon": "「我颧骨比较宽、太阳穴有点凹，想要两侧发根蓬松、耳前留一点碎发。长度到锁骨，不要齐刘海，不要贴头皮。」",
        "color": "菱形脸适合把发色重点放在太阳穴到颧骨的过渡区。偏暖人选暖棕、蜜茶；偏冷人选冷棕、黑茶。避免在颧骨位置做太亮的挑染。",
        "faqs": [("菱形脸适合中分吗？", "中分可以，但两侧必须蓬松。贴头皮的中分会把颧骨显得更宽。"), ("菱形脸适合短发吗？", "适合耳下 Bob，但要保留耳侧蓬松和耳前碎发。耳上超短会把颧骨完全暴露。"), ("菱形脸适合什么刘海？", "八字刘海最稳，能补太阳穴、又不压眉。法式刘海也可以，避免厚齐刘海。")],
    },
}


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def page(slug, f):
    facts = "".join(f'<div class="meta-cell"><div class="k">{k}</div><div class="v">{v}</div></div>' for k, v in f["facts"])
    check = "".join(f"<li>{x}</li>" for x in f["check"])
    principles = "".join(f"<h3>{h}</h3><p>{p}</p>" for h, p in f["principles"])
    styles = "".join(f"<h3>{i+1}. {h}</h3><p>{p}</p>" for i, (h, p) in enumerate(f["styles"]))
    avoid = "".join(f"<li>{x}</li>" for x in f["avoid"])
    faqs_html = "".join(f'<h3>{q}</h3><p>{a}</p>' for q, a in f["faqs"])
    related = "".join(
        f'<a href="/article/{s}.html">{d["name"]}发型指南</a><br>'
        for s, d in FACES.items() if s != slug
    )
    toc = [("check", "先确认脸型"), ("logic", "三条原则"), ("styles", "4 款发型"), ("avoid", "避雷"), ("salon", "理发店话术"), ("color", "发色"), ("faq", "常见问题")]
    toc_html = "".join(f'<a href="#{i}">{label}</a>' for i, label in toc)
    faq_schema = ", ".join(
        '{"@type":"Question","name":"%s","acceptedAnswer":{"@type":"Answer","text":"%s"}}' % (esc(q), esc(a))
        for q, a in f["faqs"]
    )
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{f['title']}</title>
  <meta name="description" content="{f['desc']}">
  <link rel="canonical" href="https://glowself.cn/article/{slug}.html">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{f['title']}">
  <meta property="og:description" content="{f['desc']}">
  <meta property="og:url" content="https://glowself.cn/article/{slug}.html">
  <meta property="og:image" content="https://glowself.cn/assets/img/og-cover.png">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/site.css">
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "{f['name']}适合什么发型",
    "description": "{f['desc']}",
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
      <div class="breadcrumbs"><a href="/">首页</a><span>/</span><a href="/article/index.html">风格笔记</a><span>/</span><span>{f['name']}发型</span></div>
      <h1>{f['h1']}</h1>
      <p class="dek">{f['dek']}</p>
      <div class="article-meta"><span>GlowSelf 编辑部</span><span>2026.11.25</span><span>约 6 分钟</span><span>不评分 · 不排名</span></div>
    </div>
  </section>
  <div class="shell">
    <div class="article-layout">
      <article class="article-body">
        <div class="meta-grid face-facts">{facts}</div>
        <div class="callout"><b>一句话结论</b><p>先看骨骼和比例，再选发型。不要用一个「显脸小」的目标，盖过你本来的轮廓优势。</p></div>

        <h2 id="check">01 先确认：你是不是{f['name']}</h2>
        <p>对着镜子，把头发全部拨到耳后，看这三个点：</p>
        <ul>{check}</ul>
        <p>如果大部分符合，下面的思路就适用。不需要把自己塞进一个标准答案，发型是比例问题，不是美丑问题。</p>

        <h2 id="logic">02 三条底层原则</h2>
        {principles}

        <h2 id="styles">03 4 款可复制发型</h2>
        {styles}

        <h2 id="avoid">04 最容易翻车的 3 件事</h2>
        <ul>{avoid}</ul>

        <h2 id="salon">05 和理发师怎么说</h2>
        <p>不要只说「显脸小」。这句话会让发型师用刘海和贴脸头发去遮，结果往往更重。可以直接这样说：</p>
        <blockquote>{f['salon']}</blockquote>
        <p>再补一句你的日常：「我每天只有 5 分钟吹头发，需要洗完自然干也好看。」这句话会改变层次和打薄方式。</p>

        <h2 id="color">06 发色怎么选</h2>
        <p>{f['color']}</p>
        <div class="callout"><b>先知道自己的冷暖</b><p>发色是离脸最近的大色块。做一次 11 题色彩测试，拿到你的季节和 6 个本命色，再决定染什么。测试不采集人脸，2 分 30 秒出结果。</p></div>

        <h2 id="faq">07 常见问题</h2>
        {faqs_html}

        <div class="article-cta">
          <div><div class="kicker">FREE · 3 MIN</div><h3>测出你的色彩与风格</h3><p>11 个问题，不评分，不排名。结果包含 12 季色彩、风格坐标和 3 套穿搭公式。</p></div>
          <a class="btn btn-accent" href="/test.html">免费测色彩 DNA →</a>
        </div>
      </article>
      <aside class="article-side">
        <div class="toc"><b>本文目录</b>{toc_html}</div>
        <div class="side-card dark"><div class="kicker">FREE TEST</div><h3>3 分钟，找到你的本命色。</h3><p>不评分、不排名、不用上传照片。</p><a class="btn btn-paper" href="/test.html">免费测色彩 DNA →</a></div>
        <div class="side-card light"><b>相关脸型</b><p>{related}</p></div>
        <div class="side-card light"><b>继续读</b><p><a href="/article/fangyuan-face-hairstyle.html">方圆脸发型指南</a><br><a href="/article/face-shape-guide.html">7 种脸型发型索引</a><a href="/article/body-shape-guide.html">5 种身材穿搭索引</a><br><a href="/season/index.html">12 季色彩图鉴</a></p></div>
      </aside>
    </div>
  </div>
</main>
{FOOTER}"""


for slug, face in FACES.items():
    (ART / f"{slug}.html").write_text(page(slug, face), encoding="utf-8")
    print("wrote", slug)

HUB_CARDS = [
    ("round-face", "圆脸", "把宽度收住，把比例拉长。"),
    ("square-face", "方脸", "不磨平下颌角，把重心往上移。"),
    ("oval-face", "鹅蛋脸", "别用厚刘海藏掉流畅轮廓。"),
    ("long-face", "长脸", "用刘海和耳下体积增加横向比例。"),
    ("heart-face", "心形脸", "给下半张脸一点分量。"),
    ("diamond-face", "菱形脸", "补太阳穴，留颧骨侧线条。"),
]

cards = "".join(
    f'<a class="article-card" href="/article/{slug}.html"><div class="article-card-kicker">FACE SHAPE · 约 6 分钟</div><h2>{name}适合什么发型？</h2><p>{desc}</p><span class="article-card-more">阅读全文 →</span></a>'
    for slug, name, desc in HUB_CARDS
)
cards += '<a class="article-card" href="/article/fangyuan-face-hairstyle.html"><div class="article-card-kicker">FACE SHAPE · 约 6 分钟</div><h2>方圆脸适合什么发型？</h2><p>下颌角和颧骨同时有存在感，怎么重新分配重心。</p><span class="article-card-more">阅读全文 →</span></a>'

hub = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>7 种脸型发型索引：圆脸、方脸、长脸、心形脸怎么剪｜GlowSelf</title>
  <meta name="description" content="不靠「显脸小」一个目标。按圆脸、方脸、鹅蛋脸、长脸、心形脸、菱形脸拆解发型重心、长度和刘海，附理发店沟通话术。">
  <link rel="canonical" href="https://glowself.cn/article/face-shape-guide.html">
  <meta property="og:type" content="website">
  <meta property="og:title" content="7 种脸型发型索引｜GlowSelf">
  <meta property="og:description" content="按脸型拆解发型重心、长度和刘海，附理发店沟通话术。">
  <meta property="og:url" content="https://glowself.cn/article/face-shape-guide.html">
  <meta property="og:image" content="https://glowself.cn/assets/img/og-cover.png">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/site.css">
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "7 种脸型发型索引",
    "description": "按脸型拆解发型重心、长度和刘海。",
    "url": "https://glowself.cn/article/face-shape-guide.html"
  }}
  </script>
</head>
<body>
{NAV}
<main>
  <section class="article-hero">
    <div class="shell">
      <div class="breadcrumbs"><a href="/">首页</a><span>/</span><a href="/article/index.html">风格笔记</a><span>/</span><span>脸型发型索引</span></div>
      <h1>7 种脸型，<br>7 种发型逻辑。</h1>
      <p class="dek">不是把脸剪小，是把视觉重心放到对的位置。先看骨骼，再决定长度、层次和刘海。</p>
      <div class="article-meta"><span>GlowSelf 编辑部</span><span>2026.11.25</span><span>索引</span><span>不评分 · 不排名</span></div>
    </div>
  </section>
  <section class="section">
    <div class="shell">
      <div class="article-grid face-hub">{cards}</div>
      <div class="callout" style="margin-top:32px"><b>不确定自己是什么脸型？</b><p>先不要急着贴标签。用 11 题测试拿到色彩与风格坐标，再带着你的轮廓特征去和理发师沟通，比背一个脸型名字更有用。</p><a class="btn btn-accent" href="/test.html">免费测色彩 DNA →</a></div>
    </div>
  </section>
</main>
{FOOTER}"""
(ART / "face-shape-guide.html").write_text(hub, encoding="utf-8")
print("wrote face-shape-guide")
