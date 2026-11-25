# 光绽 GlowSelf v2

> 不评分的色彩与风格说明书。11 个问题，3 分钟，找到你的色彩 DNA 与风格坐标；再用每日 look、衣橱和 30 天计划把它穿出来。

这是 `glowself.cn` 的 v2 重构版：从「登录 + 上传人脸 + 颜值评分 + 手动支付宝」转向「免注册免费测试 + 可分享结果 + 订阅制个人造型工具」。

## 当前状态

| 模块 | 状态 |
|---|---|
| 品牌落地页 | ✅ 完成 |
| 11 题免费测试 | ✅ 完成 |
| 动态结果页 / 分享卡 | ✅ 完成 |
| 分享页 `/r/:season/:style` + 动态 OG | ✅ 完成 |
| 个人空间（今日 look / DNA / 衣橱 / 30 天计划 / 设置） | ✅ 完成（本地存储） |
| PWA 安装 / 离线打开 / 日历导出 | ✅ 完成（`manifest.webmanifest` + `sw.js`） |
| 定价页 / 内测申请 | ✅ 完成 |
| 4 篇 SEO 文章 + 7 种脸型指南 + 5 种身材指南 + 文章中心 | ✅ 完成 |
| 12 季色彩 SEO 落地页 + 图鉴 | ✅ 完成 |
| 关于 / 隐私 / 条款 / 404 | ✅ 完成 |
| 事件 / 线索 API | ✅ 完成（JSONL 落盘） |
| 运营仪表盘 `/admin.html` | ✅ 完成（密钥门 + 漏斗 / 来源 / 活动归因 / 留资） |
| 30 天内容增长包 | ✅ `growth/content/`（排期 / 6 篇成稿 / 5 条视频 / 评论 / 预算） |
| 财务模型 | ✅ `model/GlowSelf-Financial-Model.xlsx` |
| 增长 / 上线手册 | ✅ `growth/strategy.md`、`growth/launch.md` |
| 账号体系 / 支付 / 跨设备同步 | ⏳ 内测后接入 |
| 部署到 glowself.cn | ⏳ 需要域名 / Render / Cloudflare 权限 |

## 快速开始

```bash
ADMIN_KEY=glow-local-admin node server.js
# http://127.0.0.1:4173
# 运营仪表盘：http://127.0.0.1:4173/admin.html
```

零依赖，Node >= 20。不要用 `python -m http.server`，否则 `/api/events`、分享 OG、sitemap 都不可用。

```bash
npm start        # 生产启动
npm run dev      # PORT=4173
npm run check    # 静态检查：链接、meta、数据、资源
npm run data     # 从 data.js 导出 data/seasons.json
npm run seasons  # 重新生成 12 季落地页
npm run faces    # 重新生成 7 种脸型指南
npm run bodies   # 重新生成 5 种身材指南
```

## 目录

```
glowself/
├── index.html                 品牌首页
├── test.html                  11 题测试
├── result.html                结果页（动态渲染）
├── app.html                   个人空间（今日 / DNA / 衣橱 / 计划 / 设置）
├── admin.html                 运营仪表盘（noindex，需要 ADMIN_KEY）
├── manifest.webmanifest       PWA 安装信息
├── sw.js                      离线缓存（应用壳）
├── offline.html               离线兜底页
├── pricing.html               Free / Plus / Pro
├── about.html privacy.html terms.html 404.html
├── article/                   4 篇文章 + 7 种脸型指南 + 5 种身材指南 + 文章中心
├── season/                    12 季色彩落地页 + 图鉴（长尾 SEO）
├── assets/
│   ├── css/site.css           编辑风设计系统
│   ├── js/data.js             12 季 / 6 风格 / 5 身型 / 11 题 / analyze()
│   ├── js/site.js             UI、埋点、线索、分享、计费切换
│   ├── js/test.js             测试交互
│   ├── js/result.js           结果渲染 + 1080×1350 分享卡
│   ├── js/app.js              每日 look / 衣橱 / 30 天计划
│   ├── js/admin.js            仪表盘请求与渲染
│   └── img/                   logo、favicon、PWA 图标、og-cover、12 季 OG
├── data/                      events.ndjson / leads.ndjson / seasons.json
├── model/                     财务模型 + 生成脚本
├── growth/                    增长策略 + 上线手册
├── scripts/                   build_articles.py / build_pages.py / build_seasons.py / build_faces.py / build_bodies.py / build_og.py / export_seasons.js / check.js
├── docs/                      部署、分析、决策记录
├── server.js                  Node HTTP 服务
├── package.json
└── render.yaml
```

## SEO 内容结构

- 首页：品牌词与核心品类词；
- 文章中心：`/article/index.html`；
- 4 篇风格笔记：`/article/color-season-test.html`、`/article/fangyuan-face-hairstyle.html`、`/article/capsule-wardrobe.html`、`/article/color-analysis-worth-it.html`；
- 7 种脸型发型指南：`/article/face-shape-guide.html` + `round-face` / `square-face` / `oval-face` / `long-face` / `heart-face` / `diamond-face`；
- 5 种身材穿搭指南：`/article/body-shape-guide.html` + `pear-body` / `apple-body` / `hourglass-body` / `rectangle-body` / `inverted-triangle-body`；
- 12 季落地页：`/season/<season-id>.html`，每页有独立色板、3 套公式、妆容发色、避雷与 FAQ；
- 12 季图鉴：`/season/index.html`，站内链接入口；
- 所有页面共用 canonical / OG / JSON-LD，分享页 `/r/...` 动态注入 OG。

## 产品逻辑

### 测试
- 11 题：肤色深浅、冷暖、金属、发色、眼睛、色板偏好、对比度、面部特征、身型、目标、风格；
- `GLOW.analyze(answers)` 返回 `{seasonId, styleId, scores, season, archetype, body, goal, secondary}`；
- 12 季：柔暖秋 / 暖秋 / 深暖秋 / 浅春 / 暖春 / 亮春 / 柔夏 / 冷夏 / 浅夏 / 净冬 / 冷冬 / 深冬；
- 6 风格：温婉优雅 / 清冷知性 / 甜酷灵动 / 自然松弛 / 复古文艺 / 极简现代；
- 5 身型：X / H / A / O / Y；
- 结果不做分数、不做排名、不做「变美承诺」。

### 分享
- 结果页生成 1080×1350 PNG；
- 分享链接：`/r/<seasonId>/<styleId>?g=<goal>&b=<body>&ref=<uid>`；
- 服务端为每个分享页注入 `title` / `description` / `canonical` / `og:*`；
- 分享页打开后隐藏付费/邮箱卡片，只保留「测测我的」CTA；
- `ref` 是匿名邀请码，落在事件 `props.ref` 里，用于计算邀请转化。

### 数据
- 默认全部在浏览器 localStorage：`glow_result_v2`、`glow_wardrobe_v1`、`glow_plan_v1`、`glow_uid`、`glow_ref`、`glow_campaign_v1`（UTM 首次触点，30 天）；
- 不上传人脸照片；v2 不需要登录；
- 事件匿名（sessionId / uid / path / referrer / campaign / IP / UA），用于漏斗和渠道归因；
- 线索只收集邮箱 + 意图，用于内测通知。

## API

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 健康检查 + 版本 |
| POST | `/api/events` | `{name, props, sessionId, path, referrer}`，`props.campaign` 可选 |
| POST | `/api/leads` | `{email, intent, source, result, message, campaign}` |
| GET | `/api/stats?days=7` | 事件/线索聚合，需 `x-admin-key` 请求头 |
| GET | `/r/:season/:style` | 分享页 + 动态 OG |
| GET | `/robots.txt` `/sitemap.xml` | SEO |

环境变量：

```bash
PORT=4173
ADMIN_KEY=<32 位随机串>
DATA_DIR=./data
LEADS_WEBHOOK_URL=<飞书/企微 webhook>
LOG_REQUESTS=1
```

## PWA 与日历

- 手机浏览器打开 `/app.html`，设置页会出现「安装到主屏幕」；iOS Safari 用「分享 → 添加到主屏幕」。
- `sw.js` 只缓存应用壳（页面、样式、脚本），不缓存报告、邮箱和衣橱数据；离线仍可打开 `/app.html`。
- 30 天计划可导出 `.ics`，日历每天 08:00（北京时间）提醒，含 15 分钟提前通知。
- 发布新版本时把 `sw.js` 的 `CACHE` 版本号加一，避免用户拿到旧脚本。

## 内容增长包

首发 30 天的选题、6 篇成稿、5 条短视频脚本、评论回复和 ¥25k 预算在 `growth/content/`：

- `README.md`：UTM 链接和每周 5 个指标
- `calendar.md`：30 天排期
- `notes.md`：6 篇小红书成稿
- `video-scripts.md`：5 条 30–45 秒脚本
- `comment-playbook.md`：12 个质疑回复
- `budget.md`：渠道分配、CAC 上限、停止条件

所有链接统一带 `utm_source/medium/campaign/content`；后台「活动归因」按首次触点统计。

## 运营仪表盘

设置 `ADMIN_KEY` 后打开 `/admin.html`，输入同一密钥。页面为 `noindex`，`robots.txt` 已禁止抓取；密钥放在 `x-admin-key` 请求头，不进入 URL。仪表盘展示漏斗、每日事件、季节/风格分布、来源、UTM 活动归因和最近 30 条脱敏留资。

## 部署

见 `docs/deployment.md`。最短路径：

1. GitHub 推仓库；
2. Render Web Service，Start Command `node server.js`；
3. 挂 Disk `/var/data`，设 `DATA_DIR=/var/data`、`ADMIN_KEY`；
4. 绑定 `glowself.cn`，Cloudflare 代理；
5. 验证 `/api/health`、`/robots.txt`、`/sitemap.xml`、分享页 OG。

## 测试

```bash
npm run check
```

检查项：
- 所有内部链接 / 资源存在；
- 每页有 title / description / canonical；
- 结果页 noindex、分享页可索引；
- 12 季数据完整（12 色、3 公式、lip/blush/eye/hair）；
- 11 题、6 风格、5 身型；
- OG 图存在；
- 没有遗留 `localhost` / `example.com`。

浏览器手测清单见 `docs/qa.md`。

## 已知边界

- 个人空间是本地存储，换设备不同步；账号体系在 v3；
- 支付未接入，所有升级 CTA 是「内测申请」，不收款；
- AI 视觉分析未接入；v2 用规则引擎，可解释、可审计；
- 衣橱图片识别未做，先手动录入；
- 事件用 JSONL，适合 0–10k DAU；超过 10k 后换 Postgres/ClickHouse；
- 当前无短信/微信登录。

## 下一步（按优先级）

1. 部署 + 真机验收 + 分享 OG 实测；
2. 20 位种子用户访谈，校准 12 季结果准确性；
3. 接入邮箱服务（Resend / 阿里云邮件）真正发报告；
4. 接入 Stripe / 支付宝（内测预售 → 正式订阅）；
5. 账号体系 + 跨设备同步；
6. 邀请奖励自动化；
7. 按 `growth/content/calendar.md` 发 30 天内容，用 UTM 和留资率决定加投；
8. 造型师 Pro 服务履约 SOP。

## 文档

- [增长策略](growth/strategy.md)
- [上线手册](growth/launch.md)
- [部署](docs/deployment.md)
- [数据分析](docs/analytics.md)
- [决策记录](docs/decisions.md)
- [验收记录](docs/qa.md)
- [界面截图](docs/screenshots/)
- [财务模型](model/GlowSelf-Financial-Model.xlsx)
