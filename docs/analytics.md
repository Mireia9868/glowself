# 数据分析 / Analytics

## 事件模型

所有事件由 `assets/js/site.js` 的 `track()` 发送到 `POST /api/events`：

```json
{
  "name": "quiz_complete",
  "props": {"seasonId": "cool-winter", "styleId": "elegant", "uid": "u_xxx", "ref": "", "campaign": {"source": "xiaohongshu", "campaign": "note01"}},
  "sessionId": "uuid",
  "path": "/test.html",
  "referrer": "https://www.xiaohongshu.com/...",
  "ts": "2026-11-24T19:00:00.000Z"
}
```

服务端补充 `ip`、`ua`，写入 `data/events.ndjson`。`POST /api/leads` 也会带 `uid`、`ref` 和同一组 `campaign`，方便把线索归因到邀请人和渠道。

UTM 采用**首次触点**：用户第一次带 `utm_source/medium/campaign/content/term` 落地时写入 `localStorage.glow_campaign_v1`，保留 30 天；后续完成测试、分享、留资都会携带同一组 `campaign`。这样内容发出后，能看到「哪一篇笔记带来了完成和留资」，而不只是页面浏览。

## 关键事件

| 事件 | 触发 | 用途 |
|---|---|---|
| `page_view` | 所有页面 | 流量 |
| `quiz_start` | 进入测试 | 启动率 |
| `quiz_question_view` | 每题展示 | 流失题号 |
| `quiz_answer` | 选择答案 | 选项分布 |
| `quiz_complete` | 生成结果 | 完成率 |
| `result_view` | 结果页 | 结果消费 |
| `share_link_copy` / `share_card_download` | 分享 | 分享率 |
| `report_email_submitted` | 邮箱 | 线索 |
| `unlock_modal_open` | 打开升级 | 付费意向 |
| `lead_submitted` | 提交内测 | 线索 |
| `app_view` | 个人空间 | 留存 |
| `wardrobe_add` / `plan_toggle` / `app_look_save` | 衣橱 / 计划 / 收藏 | 深度使用 |
| `plan_ics_export` | 导出 30 天日历 | 留存意图 |
| `pwa_install` | 从浏览器安装到主屏幕 | 留存质量 |

## 运营仪表盘

启动时设置 `ADMIN_KEY`：

```bash
ADMIN_KEY=glow-local-admin npm start
```

打开 `http://127.0.0.1:4173/admin.html`，输入同一个密钥。仪表盘展示：

- 独立会话、事件、测试开始/完成、结果页、留资；
- 漏斗：页面浏览 → 测试开始 → 测试完成 → 结果页 → 分享/下载 → 邮箱留资；
- 每日事件柱状图、季节/风格分布、来源域名、UTM 活动归因；
- 最近 30 条脱敏留资（`u***@example.com`）。

密钥放在 `x-admin-key` 请求头，不进入 URL；页面 `noindex`，`robots.txt` 已 Disallow。仪表盘只读，不提供删除或导出，避免误操作。

## 漏斗查询（本机）

```bash
# 最近 7 天聚合（推荐走请求头）
curl -s -H "x-admin-key: $ADMIN_KEY" "http://127.0.0.1:4173/api/stats?days=7" | jq

# 兼容 query key（仅本机调试）
curl -s "http://127.0.0.1:4173/api/stats?key=$ADMIN_KEY&days=7" | jq

# 测试完成数
jq -r 'select(.name=="quiz_complete") | .ts' data/events.ndjson | wc -l

# 按 referrer 看来源
jq -r 'select(.name=="quiz_start") | .referrer' data/events.ndjson \
  | sed 's#https\?://##; s#/.*##' | sort | uniq -c | sort -rn | head

# 分享率 = share / quiz_complete
jq -r 'select(.name=="share_link_copy" or .name=="share_card_download") | .sessionId' data/events.ndjson | sort -u | wc -l
```

`/api/stats` 返回 `byName`、`byDay`、`topSeasons`、`topStyles`、`topReferrers`、`topCampaigns`、`recentLeads`。生产环境建议接 PostHog（自托管）或 Umami；JSONL 与仪表盘只作为过渡。

## 每周看板

1. **WCT**：Weekly Completed Tests；
2. 启动率 = `quiz_start / 访问`；
3. 完成率 = `quiz_complete / quiz_start`；
4. 分享率 = 去重分享 session / 完成 session；
5. 邮箱率 = `report_email_submitted / quiz_complete`；
6. D7 / D30 回访：按 `uid` 去重；
7. 付费意向 = `unlock_modal_open` / `result_view`；
8. CAC = 渠道花费 / 新增付费；
9. 退款率、客诉率。

## 归因

- `ref`：分享邀请码，落在每个事件 `props.ref`；
- UTM：`?utm_source=xhs&utm_medium=note&utm_campaign=season12`，服务端会记录完整 `path`；
- 分享页：`/r/...?...&ref=<uid>`，新用户打开后 `ref` 写入 localStorage 30 天。

## 隐私

- 不采集人脸、不采集通讯录；
- IP 仅用于反作弊与地域统计，24 个月后删除；
- 用户可发邮件到 `hello@glowself.cn` 要求删除数据；
- 事件不含姓名、手机号；邮箱只在主动提交时收集。


## 生产存储与后台

- `ADMIN_KEY` 保护 `/admin.html` 与 `/api/stats`。
- 配置 `DATABASE_URL` 时，事件写入 `glow_events`、留资写入 `glow_leads`，后台聚合读 Postgres；否则回退 `data/*.ndjson`。
- 生产归因以 `topCampaigns`（首次触点 UTM）为准；链接规范见 `growth/content/README.md`。
