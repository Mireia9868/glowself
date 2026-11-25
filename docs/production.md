# 生产环境状态 · 2026-11-25

## 已上线

- 域名：https://glowself.cn
- 仓库：https://github.com/Mireia9868/glowself
- 线上版本：v2（commit `95d5e6b`，Render 自动部署）
- 运行时：Render Node Web Service，零依赖 `server.js`
- 部署方式：推送到 `main` 后自动部署；健康检查 `/api/health` 返回 `{"status":"ok","version":"v2"}`

已在线验证：

| 检查 | 结果 |
|---|---|
| 首页 / 测试 / 结果 / 空间 / 定价 | 200，v2 页面 |
| 11 题流程 | 完成并跳转 `/result.html`，写入本机结果 |
| 分享页 `/r/cool-winter/elegant` | 注入专属标题与 OG |
| `/api/health` | 200，`version:"v2"` |
| `/sitemap.xml` / `robots.txt` | 200，季节与文章已收录 |
| PWA | manifest 无错误、installability 无错误、SW 已激活、离线壳可用 |
| 移动端 390px | 测试页已去掉首屏营销侧栏，第一题直接可见 |
| 静态检查 | `node scripts/check.js` 通过（42 HTML 页面） |

## 还需要在 Render 设置

| 变量 | 作用 | 不设置的后果 |
|---|---|---|
| `ADMIN_KEY` | 保护 `/admin.html` 与 `/api/stats` | 后台返回 404，无法看漏斗/留资；**已于 2026-11-25 配置** |
| `DATABASE_URL` | Postgres（Neon）持久化事件与留资 | 回退到临时盘 `data/*.ndjson`，重启/重部署会丢数据；**已配置并验证跨部署保留** |
| `DATA_DIR` | 可选，事件与留资落盘目录（建议 `/var/data`） | 仅在无 `DATABASE_URL` 时使用 |
| `LEADS_WEBHOOK_URL` | 可选，把留资推到飞书/Slack | 只能后台查看 |
| `LOG_REQUESTS` | 可选，设为 `1` 打请求日志 | 默认关闭 |

生产优先写 Postgres（`glow_events` / `glow_leads`），通过 Neon SQL-over-HTTP，不增加运行时依赖；`DATABASE_URL` 不可用时回退 `data/*.ndjson`。`data/` 已被 `.gitignore` 排除。Render 免费实例没有持久磁盘，所以 **不要依赖本地文件做生产归因**。

## 已验证的持久化

事件与留资写入 Neon 的 `glow_events` / `glow_leads`。生产测试写入 1 条事件 + 1 条留资后，触发一次完整重部署，数据仍在；随后已删除 QA 测试行，当前生产计数为 0。

## 支付状态

当前是 **内测留资**：`/pricing.html` 和结果页的 Plus 按钮收集邮箱，不扣费。正式收费前需要：

1. 支付宝/微信商户号或 Stripe/Lemon Squeezy 账号；
2. 订阅价格与自动续费条款；
3. 退款与取消入口；
4. 支付回调与订单表（或托管 checkout）。

在拿到支付凭据前，不要打开真实扣费按钮。

## 快速回滚

Render Dashboard → 选择服务 → Deploys → 找到上一个成功部署 → Rollback。仓库侧可回退到 `36f3a40`（旧版），但不建议：旧版依赖 Postgres 和旧前端。

## 上线后第一小时

1. 打开 https://glowself.cn/admin.html，确认 `ADMIN_KEY` 可用；
2. 手机打开 `/test.html`，完整做一遍 11 题；
3. 分享结果给一个朋友，确认分享页与 OG；
4. 发第 1 篇小红书（`growth/content/notes.md` note01 + `growth/content/covers/note01.png`）；
5. 24 小时后只看两个数：测试开始率、完成率。


## Keepalive

`.github/workflows/keepalive.yml` pings `/api/health` every 10 minutes so the Render free instance does not cold-start for the first visitor. GitHub may delay scheduled runs; check Actions after the first hour. If the budget allows, upgrading Render to Starter is more reliable.
