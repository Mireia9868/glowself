#!/usr/bin/env python3
"""Generate static trust pages for GlowSelf v2."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

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
      <div><div class="footer-title">风格笔记</div><a href="/article/color-season-test.html">12 季色彩入门</a><a href="/article/fangyuan-face-hairstyle.html">方圆脸发型指南</a><a href="/article/capsule-wardrobe.html">胶囊衣橱清单</a><a href="/article/color-analysis-worth-it.html">色彩测试值不值</a></div>
      <div><div class="footer-title">关于</div><a href="/about.html">我们为什么做 GlowSelf</a><a href="/privacy.html">隐私政策</a><a href="/terms.html">服务条款</a><a href="mailto:hello@glowself.cn">hello@glowself.cn</a></div>
    </div>
    <div class="footer-bottom"><span>© 2026 GlowSelf 光绽</span><span>中国 · 杭州</span><span>不评分 · 不排名 · 不制造焦虑</span></div>
  </div>
</footer>
<script src="/assets/js/site.js" defer></script>
</body>
</html>"""


def doc(slug, title, desc, heading, dek, body, kicker="GLOWSELF"):
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="https://glowself.cn/{slug}.html">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="https://glowself.cn/{slug}.html">
  <meta property="og:image" content="https://glowself.cn/assets/img/og-cover.png">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/site.css">
</head>
<body>
{NAV}
<main>
  <section class="article-hero">
    <div class="shell">
      <div class="breadcrumbs"><a href="/">首页</a><span>/</span><span>{heading.replace('<br>', '')}</span></div>
      <h1>{heading}</h1>
      <p class="dek">{dek}</p>
      <div class="article-meta"><span>{kicker}</span><span>最后更新 2026.11.24</span></div>
    </div>
  </section>
  <div class="shell">
    <div class="article-layout">
      <article class="article-body">{body}</article>
      <aside class="article-side">
        <div class="article-cta"><h3>3 分钟，<br>先认识自己。</h3><p>11 个问题，不用注册，不用上传照片。</p><a class="btn" href="/test.html">免费测色彩 DNA →</a></div>
        <div class="toc"><div class="k">联系我们</div><a href="mailto:hello@glowself.cn">hello@glowself.cn</a><a href="/pricing.html">查看定价</a><a href="/article/index.html">风格笔记</a></div>
      </aside>
    </div>
  </div>
</main>
{FOOTER}"""


about = doc(
    "about",
    "我们为什么做 GlowSelf｜不评分，只翻译｜光绽",
    "GlowSelf 光绽是一个不做颜值打分的形象工具。我们相信你不需要变成另一个人，只需要知道什么适合你。",
    "你不需要变成<br>另一个人。",
    "我们做 GlowSelf，是因为受够了两种东西：一种是让你焦虑的颜值打分，一种是给了色卡却不知道怎么穿的「形象课」。",
    """
<p>光绽的意思是「让原本的光绽开」，不是「给你换一张脸」。</p>
<p>2024 年，我们在一间很小的出租屋里做用户访谈。一个女生说，她衣柜里有 47 件衣服，但每天早上还是觉得「没衣服穿」。另一个女生说，她花了 2000 块做色彩测试，拿到一张色卡，回家还是穿回了黑色。</p>
<p>这两句话解释了为什么市面上不缺测试，却很少有人真的穿对了：<b>大多数人缺的不是一个结果，是把结果翻译成明天穿什么的能力。</b></p>

<h2>我们不做的事</h2>
<ul>
  <li><b>不做颜值打分。</b>把脸拆成 13 个维度打一个总分，除了制造焦虑，没有实际用途。</li>
  <li><b>不排名。</b>美不是竞技体育。你不需要比谁高一分。</li>
  <li><b>不要求上传人脸。</b>免费测试只用选择题。后续可选的 AI 照片分析必须单独授权，24 小时内删除。</li>
  <li><b>不卖「变美」的承诺。</b>我们只承诺：让你少买错，少犹豫，更快出门。</li>
</ul>

<h2>我们相信的三件事</h2>
<blockquote>风格不是加法，是减法。<br>颜色不是越白越好，是越「像你」越好。<br>好的建议应该具体到明天能穿，而不是听完觉得有道理。</blockquote>
<p>所以 GlowSelf 的报告里没有「你气质独特」这种话。它会告诉你：你的本命色是陶土和燕麦，避雷色是荧光绿和冷紫；你的版型是收腰但不紧身；你的发型重心在头顶，不在两侧。</p>

<h2>现在走到哪一步</h2>
<p>GlowSelf 目前是内测版。免费测试已经开放，Plus 订阅在登记阶段，暂不扣费。我们没有融资，也没有投放预算，靠内容和口碑一点点长。</p>
<p>如果你愿意，花 2 分 30 秒测一次，然后把「哪里不准」告诉我们。你的反馈会直接进入下一版规则。</p>

<div class="callout"><b>联系</b><p>邮箱：hello@glowself.cn<br>合作与媒体：同上，标题注明「合作」。<br>我们会在 2 个工作日内回复。</p></div>
""",
)

privacy = doc(
    "privacy",
    "隐私政策｜GlowSelf 光绽",
    "GlowSelf 隐私政策：免费测试不需要上传人脸；测试结果默认只存在你的浏览器；我们收集匿名事件和自愿留下的邮箱。",
    "你的脸，<br>不需要交给任何人。",
    "这份政策用大白话写清楚：我们收集什么、不收集什么、为什么收集、存多久、怎么删。",
    """
<p><b>生效日期：2026 年 11 月 24 日</b></p>

<h2>1. 免费测试收集什么</h2>
<p>免费色彩 DNA 测试只收集你的 11 个选择题答案，以及生成结果所需的风格偏好。答案和结果默认保存在你浏览器的 localStorage 里，<b>不会自动上传到服务器</b>。</p>
<p>我们<b>不收集人脸照片、不调用摄像头、不做人脸识别</b>。免费测试不需要注册，不需要手机号。</p>

<h2>2. 匿名事件</h2>
<p>为了知道产品哪里卡住，我们会记录匿名事件，例如「测试开始」「第 3 题 answered」「结果页查看」「分享卡下载」。事件包含：</p>
<ul>
  <li>随机生成的会话 ID（存在浏览器，不含你的身份）</li>
  <li>页面路径、来源网站、时间</li>
  <li>你主动选择的季节/风格结果（用于统计，不含答案原文）</li>
  <li>IP 地址和浏览器 User-Agent（用于防滥用和粗略地区统计）</li>
</ul>
<p>这些数据用于产品分析和反垃圾，不用于广告画像，也不出售给第三方。</p>

<h2>3. 邮箱</h2>
<p>只有你主动提交时，我们才收集邮箱。用途仅限：发送你请求的报告、内测名额通知、产品更新。每封邮件都有退订入口。你可以随时发邮件到 hello@glowself.cn 要求删除。</p>

<h2>4. 我们不收集什么</h2>
<ul>
  <li>不收集人脸照片（除非你未来明确授权可选的 AI 照片分析，届时会单独弹窗说明）</li>
  <li>不收集身份证、银行卡、精确位置</li>
  <li>不使用广告追踪 Cookie，不接入第三方广告平台</li>
  <li>不向第三方出售或出租你的数据</li>
</ul>

<h2>5. 数据存在哪、存多久</h2>
<p>静态页面和匿名事件存储在我们的云服务商（Render）上，域名与 CDN 由 Cloudflare 提供。邮箱和事件日志保留 24 个月，或直到你要求删除。浏览器里的测试结果由你控制，清除浏览器数据即可删除。</p>

<h2>6. 你的权利</h2>
<p>你可以要求访问、更正、删除你的邮箱和事件记录，也可以要求我们停止处理。发邮件到 hello@glowself.cn，我们会在 15 个工作日内处理。你不需要说明理由。</p>

<h2>7. 未成年人</h2>
<p>GlowSelf 不面向 14 岁以下未成年人。如果你未满 14 岁，请在监护人同意下使用，或不要提交邮箱。</p>

<h2>8. 政策变更</h2>
<p>如果收集范围发生实质变化，我们会在网站顶部提示，并给已留邮箱的用户发一封说明邮件。继续使用即表示接受更新后的政策；不接受可以随时停止使用并要求删除数据。</p>

<div class="callout"><b>一句话总结</b><p>测试不上传脸，结果只在你手机里；邮箱只在你主动给的时候才收集；随时可以让我们删。</p></div>
""",
)

terms = doc(
    "terms",
    "服务条款｜GlowSelf 光绽",
    "GlowSelf 服务条款：免费测试与 Plus 内测的使用规则、订阅与退款、内容版权、责任限制。",
    "先说清楚，<br>再开始用。",
    "这份条款尽量不绕弯子。你使用 GlowSelf，即表示同意以下规则。",
    """
<p><b>生效日期：2026 年 11 月 24 日</b></p>

<h2>1. 服务是什么</h2>
<p>GlowSelf 提供基于色彩与风格规则的自我认知工具，包括免费色彩 DNA 测试、形象报告、每日穿搭建议和衣橱管理。我们是形象建议工具，<b>不是医疗、心理、医美或职业咨询服务</b>。</p>

<h2>2. 免费与内测</h2>
<p>免费测试永久免费，不需要注册。Plus 与 Pro 目前处于内测登记阶段，<b>不产生扣费</b>。正式收费前，我们会通过邮件确认价格、权益和支付方式；只有你明确确认后才会进入支付流程。</p>

<h2>3. 订阅与退款</h2>
<ul>
  <li>正式上线后提供月付与年付，价格以购买页为准。</li>
  <li>首次订阅 7 天内可无理由退款；年付按未使用月份比例退款。</li>
  <li>取消入口不超过两次点击，取消后权益持续到当前周期结束。</li>
  <li>内测期未产生费用，不存在退款。</li>
</ul>

<h2>4. 你的内容与数据</h2>
<p>测试答案和结果默认保存在你的浏览器。你保留对自己提交内容的所有权。你授予我们仅用于提供服务所必需的、非独占的处理权限（例如你主动提交邮箱时发送报告）。我们不会把你的照片或结果用于公开案例，除非你单独书面同意。</p>

<h2>5. 使用规则</h2>
<p>你可以把 GlowSelf 用于个人形象参考。未经许可，不得：</p>
<ul>
  <li>复制、转售、批量抓取本站内容或报告模板</li>
  <li>用自动化脚本攻击、扫描或绕过访问限制</li>
  <li>将本站内容用于训练商业模型或制作竞品</li>
  <li>冒充 GlowSelf 官方或误导他人</li>
</ul>

<h2>6. 建议的局限</h2>
<p>色彩与风格建议依赖你的自我描述和我们的规则库，存在误差。光线、相机、妆容、染发、年龄和健康状况都会影响结果。我们不保证某个颜色一定让你「变美」，也不对因参考建议产生的购买、医美或社交后果承担责任。</p>

<h2>7. 知识产权</h2>
<p>GlowSelf 的名称、标识、报告版式、文案、12 季规则库和代码归我们所有。你可以下载并分享自己的报告卡片用于个人社交场景；商业使用需获得书面许可。</p>

<h2>8. 责任限制</h2>
<p>在法律允许的范围内，我们对间接损失、利润损失或数据丢失不承担责任。因不可抗力、云服务故障或第三方支付故障导致的服务中断，我们会尽力恢复，但不承担超出已付费用的赔偿。</p>

<h2>9. 条款变更与适用法律</h2>
<p>我们可能更新条款，重大变更会提前 7 天在网站公告。本条款适用中华人民共和国法律。争议优先协商；协商不成的，提交杭州市有管辖权的人民法院。</p>

<div class="callout"><b>有问题？</b><p>发邮件到 hello@glowself.cn，标题写「条款问题」。我们会在 2 个工作日内回复。</p></div>
""",
)

notfound = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>页面走丢了｜GlowSelf 光绽</title>
  <meta name="description" content="这个链接可能过期了，或者地址打错了一个字母。回到 GlowSelf 首页，重新测一次色彩 DNA。">
  <meta name="robots" content="noindex">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/site.css">
</head>
<body>
{NAV}
<main>
  <section class="section" style="min-height:60vh;display:grid;place-items:center;text-align:center">
    <div class="shell">
      <div class="eyebrow">404 · LOST IN COLOUR</div>
      <h1 class="display" style="margin:18px 0">这一页，<br>不在色板里。</h1>
      <p class="lede" style="margin:0 auto 28px">链接可能过期了，或者地址打错了一个字母。要不要回到起点，重新测一次？</p>
      <div class="hero-cta" style="justify-content:center"><a class="btn btn-accent btn-lg" href="/test.html">免费测色彩 DNA →</a><a class="btn btn-ghost btn-lg" href="/">回首页</a></div>
    </div>
  </section>
</main>
{FOOTER}"""

for slug, html in [("about", about), ("privacy", privacy), ("terms", terms), ("404", notfound)]:
    (ROOT / f"{slug}.html").write_text(html, encoding="utf-8")
    print("wrote", slug)
