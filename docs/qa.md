# v2 验收记录

日期：2026-11-24  
环境：macOS + Chrome 158 headless（CDP），Node 20，390px / 1440px 两档  
目标：验证「免注册测试 → 结果分享 → 个人空间 → 内测线索」主链路可用。

## 自动检查

```bash
node scripts/check.js
# checked 42 html files, 124 total files
# warn /404.html: no og:image
# warn /app.html: no og:image
# ok — links, meta, data and assets are consistent
```

两条 warning 是有意的：`404.html` 与 `app.html` 都是 `noindex`，不需要社交分享图。

`curl` 路由检查：

| 路由 | 结果 |
|---|---|
| `/api/health` | 200 `{"status":"ok","version":"v2"}` |
| `/robots.txt` | 200，禁止抓取 `/app.html`、`/result.html`、`/api/` |
| `/sitemap.xml` | 200，含首页、测试、定价、关于、隐私、条款、4 篇文章、7 种脸型指南、5 种身材指南、12 季落地页与图鉴，共 37 个 URL |
| `/r/deep-winter/elegant?g=outfit&b=X` | 200，动态 title「我是『深冬 · 温婉优雅』…」 |
| `/no-such-page` | 404，品牌化 404 页 |
| `/season/` `/article/` | 301 到各自 `index.html` |

## 浏览器主链路

| 用例 | 结果 |
|---|---|
| 首页 → 免费测一测 | 进入 11 题测试，进度 01/11，选项/键盘 1–9 可用 |
| 连续选择第一项 → 完成 | 生成 `soft-summer / elegant`，写入 `glow_result_v2`，550ms 后跳转结果页 |
| 结果页渲染 | 季节、12 色板、风格坐标、3 套公式、身型建议、锁定 Plus 区块均正确 |
| 分享卡 | canvas 1080×1350，6 个本命色、风格、URL；PNG 可下载 |
| 复制分享链接 | 生成 `/r/<season>/<style>?g=&b=&ref=<uid>` |
| 分享页打开 | 显示「你正在看一份分享报告」横幅，隐藏解锁 CTA，保留「测测我的」 |
| 结果页邮箱 | POST `/api/leads` 成功，写入 `leads.ndjson`，事件 `report_email_submitted` |
| 线索归因 | `POST /api/leads` 带 `uid`/`ref`，记录中保留邀请人；测试后已清空测试数据 |
| UTM 首次触点 | 打开 `?utm_source=xiaohongshu&utm_campaign=note01` 后，`glow_campaign_v1` 写入并保留 30 天；事件和留资均带同一组 `campaign` |
| 活动归因 | `/api/stats` 返回 `topCampaigns`，仪表盘「活动归因」显示 `xiaohongshu / note01` 等来源；测试后已清空测试数据 |
| 个人空间 | 今日 look、本周、DNA、衣橱、30 天计划、设置均可切换 |
| 衣橱添加 | 添加后计数「1 件」，刷新后仍在 localStorage |
| 30 天计划 | 30 个 `.plan-day`，点击第 1 天写入 `glow_plan_v1`，进度 3% → 第 2 天 |
| 定价切换 | 月付 ¥0/¥39/¥199，年付 ¥0/¥299/¥1990 |
| 内测弹窗 | 打开/关闭、邮箱提交、成功态正常 |
| 移动端导航 | 390px 下汉堡菜单展开，5 个导航项可点，关闭按钮正常 |
| 12 季落地页 | 12 个 `/season/<id>.html` 均可打开，色板/公式/FAQ 正确，390px 无横向滚动 |
| 12 季图鉴 | `/season/index.html` 12 张季节卡，链接到对应落地页 |
| 7 种脸型指南 | 圆脸/方脸/鹅蛋脸/长脸/心形脸/菱形脸/方圆脸 7 页可打开，390px 无横向滚动 |
| 脸型索引 | `/article/face-shape-guide.html` 7 张卡片，链接均有效 |
| 5 种身材指南 | 梨形/苹果形/沙漏/H 型/倒三角 5 页可打开，390px 无横向滚动 |
| 身材索引 | `/article/body-shape-guide.html` 5 张卡片，链接均有效 |
| 运营仪表盘 | 未登录显示密钥门；正确 `ADMIN_KEY` 后显示 6 个指标、漏斗、每日柱状图、分布与脱敏留资；错误密钥回显错误 |
| 仪表盘移动端 | 390px 两列指标，表格可横向滚动 |
| PWA 可安装性 | `Page.getAppManifest` 无错误；`Page.getInstallabilityErrors` 为空；manifest icons / start_url 可解析 |
| 离线打开 | 断网后 `/app.html` 仍加载，标题正确，`#app-ready` 可见；Service Worker scope 为 `/` |
| 日历导出 | 点击「导出到日历 .ics」下载 30 个 `VEVENT`，含每日 look、颜色、URL 和 15 分钟提醒 |
| 横向溢出 | 结果页 390px 下 `scrollWidth=390`，无横向滚动 |

## 截图

| 文件 | 说明 |
|---|---|
| `docs/screenshots/home-desktop.png` | 首页全页 1440 |
| `docs/screenshots/home-mobile.png` | 首页全页 390 |
| `docs/screenshots/quiz-desktop.png` | 测试首题 1440 |
| `docs/screenshots/result-desktop.png` | 结果页 1440 |
| `docs/screenshots/result-mobile.png` | 结果页 390 |
| `docs/screenshots/app-desktop.png` | 个人空间 1440 |
| `docs/screenshots/app-mobile.png` | 个人空间 390 |
| `docs/screenshots/pricing-desktop.png` | 定价页 1440 |
| `docs/screenshots/article-desktop.png` | 文章页 1440 |
| `docs/screenshots/season-desktop.png` | 冷冬落地页 1440 |
| `docs/screenshots/season-mobile.png` | 冷冬落地页 390 |
| `docs/screenshots/season-index-desktop.png` | 12 季图鉴 1440 |
| `docs/screenshots/face-guide-desktop.png` | 圆脸发型指南 1440 |
| `docs/screenshots/face-guide-mobile.png` | 圆脸发型指南 390 |
| `docs/screenshots/face-hub-desktop.png` | 7 种脸型索引 1440 |
| `docs/screenshots/body-guide-desktop.png` | 梨形穿搭指南 1440 |
| `docs/screenshots/body-guide-mobile.png` | 梨形穿搭指南 390 |
| `docs/screenshots/body-hub-desktop.png` | 5 种身材索引 1440 |
| `docs/screenshots/admin-gate.png` | 运营仪表盘密钥门 1440 |
| `docs/screenshots/admin-desktop.png` | 运营仪表盘 1440（演示数据） |
| `docs/screenshots/admin-mobile.png` | 运营仪表盘 390（演示数据） |
| `docs/screenshots/app-install-desktop.png` | 设置页 PWA 安装入口 1440 |
| `docs/screenshots/app-install-mobile.png` | 设置页 PWA 安装入口 390 |
| `docs/screenshots/app-plan-ics-desktop.png` | 30 天计划 + 日历导出 1440 |

## 已知边界（不阻塞内测）

1. 个人空间是 localStorage，不是账号；换设备不同步。这是有意的 v2 范围。
2. 所有升级 CTA 只收集内测邮箱，不收款；支付接口未接。
3. 结果由规则引擎生成，不是 AI 视觉分析；文案已去掉「AI 分析」承诺。
4. 邮箱报告目前只落线索，没有真正发信；需接 Resend/阿里云邮件。
5. JSONL 埋点适合 0–10k DAU；超过后换 Postgres/ClickHouse。
6. PWA 的 iOS 安装依赖 Safari「分享 → 添加到主屏幕」，没有自动安装横幅；Android/桌面 Chrome 才会出现原生安装事件。
7. 日历提醒使用 UTC 时间写入，按北京时间 08:00 触发；非中国时区用户看到的是当地对应时间。
8. 移动端整页截图里固定底栏会压在内容上，这是截图工具对 `position:fixed` 的呈现；真机滚动时底栏固定，内容已留 90px 底部安全区。
9. 404/app 不设 OG，因为 noindex。

## 上线前必须由 owner 提供

- GitHub 仓库写权限（当前 `Mireia9868/glowself` 私有/404，无法 clone）。
- Render 服务与自定义域名 `glowself.cn` 的管理权限。
- Cloudflare DNS/缓存权限。
- 支付商户号（支付宝/微信/Stripe）与主体资质。
- 小红书/抖音企业号或投放账户。
- 真实客服邮箱/退订地址（当前 `hello@glowself.cn` 为占位）。
