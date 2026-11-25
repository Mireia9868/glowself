# 部署 / Deployment

## 推荐架构

```
Cloudflare (DNS + WAF + CDN)
        ↓
Render Web Service (Node 20, node server.js)
        ↓
Render Disk /var/data  → events.ndjson / leads.ndjson
        ↓
LEADS_WEBHOOK_URL → 飞书 / 企业微信机器人
```

静态资源由 Node 直接服务，不需要单独的对象存储；日活 < 10k 时足够。超过 10k 后把 `/r/*` OG 注入移到边缘函数、事件写 Postgres。

## Render 步骤

1. 新建 GitHub 仓库（私有即可），推 `glowself/`；
2. Render → New → Web Service → 连接仓库；
3. 设置：
   - Runtime: **Node**
   - Build Command: 留空（零依赖）
   - Start Command: `node server.js`
   - Health Check Path: `/api/health`
4. 环境变量：
   ```
   ADMIN_KEY=<32位随机串>
   # 部署后打开 https://glowself.cn/admin.html 输入此密钥；页面 noindex，robots 已禁止抓取
   DATA_DIR=/var/data
   LEADS_WEBHOOK_URL=<webhook>
   ```
   `PORT` 由 Render 自动注入，不要硬编码。
5. 添加 Disk：Name `glowself-data`，Mount Path `/var/data`，Size 1 GB；
6. 绑定自定义域 `glowself.cn`，按 Render 提示在 Cloudflare 加 CNAME；
7. Cloudflare：SSL/TLS Full (strict)，Always Use HTTPS，Brotli 开；
8. 验证：
   ```bash
   curl -s https://glowself.cn/api/health
   curl -sI https://glowself.cn/ | head
   curl -s https://glowself.cn/robots.txt
   curl -s https://glowself.cn/sitemap.xml | head -20
   curl -s https://glowself.cn/r/cool-winter/elegant | grep -E 'og:title|og:image'
   ```

## 其他平台

- **Fly.io**：`fly launch`，volume 挂 `/data`，`DATA_DIR=/data`；
- **VPS**：`pm2 start server.js --name glowself`，Nginx 反代 443；
- **Vercel/Netlify**：只能托管静态页，API / 分享 OG / JSONL 不可用，不推荐。

## 数据与备份

- 事件：`$DATA_DIR/events.ndjson`，一行一个 JSON；
- 线索：`$DATA_DIR/leads.ndjson`；
- 每日 cron 备份到对象存储：
  ```bash
  tar czf backup-$(date +%F).tgz /var/data/*.ndjson
  ```
- 不要提交含邮箱的 ndjson 到公开仓库；`.gitignore` 已排除 `data/*.ndjson`。

## 回滚

Render 保留 deploy 历史，一键回滚到上一个版本。回滚前先导出当日 ndjson。

## 上线检查

见 `growth/launch.md` 的 T-3 天清单。
