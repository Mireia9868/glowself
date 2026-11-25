# 今天就能开始：15 分钟清单

## 0. 先确认一件事（2 分钟）

打开 `https://glowself.cn/checkout.html`，用手机支付宝扫页面上的收款码：

- 收款人是否显示 `ren(**都)`？
- 金额是否固定 `¥29.90`？

如果不对，先不要发笔记。把新的支付宝收款码图片放进 `assets/img/alipay-plus-2990.jpg`，重新部署。
注意：这是**旧站留下的固定金额码**。只用于首月 ¥29.90 创始会员，不是 ¥39/¥299 的续费码。

## 1. 发第一篇小红书（10 分钟）

上传这 5 张图（按顺序）：

`growth/content/note01/1-cover.png` → `2-three-blacks.png` → `3-face-test.png` → `4-cool-vs-warm.png` → `5-what-you-get.png`

标题和正文直接用：

`growth/content/note01/publish.md`

正文里的链接必须是带 UTM 的：

`https://glowself.cn/?utm_source=xiaohongshu&utm_medium=social&utm_campaign=note01&utm_content=cover_b`

发完自己点一次链接，确认后台「活动归因」出现 `xiaohongshu / note01`。

## 2. 评论区只做一件事（前 2 小时）

置顶评论：

> 不用先买新衣服。先测你的季节，再从现有衣柜里挑 3 件靠近脸的颜色试一周。链接在主页。

前 10 条评论按 `growth/content/comment-playbook.md` 回。不要争论“显白”，只问“你平时穿什么颜色最常被夸”。

## 3. 有人付款后（24 小时内）

按 `docs/fulfillment.md`：

1. 打开 `https://glowself.cn/admin.html`，看「最近留资」的 **首月付款**。
2. 核对支付宝账单：¥29.90、订单尾号、时间。
3. 生成 PDF：
   ```bash
   python3 scripts/make_report.py --season <季节> --style <风格> --email <用户邮箱> --out growth/orders/<邮箱>.pdf
   ```
   本机没有系统 Python 的 PIL，用：
   `/Users/mireia/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/python/bin/python3`
4. 用 `mireia1998@163.com` 发邮件，主题「你的 GlowSelf 色彩复核报告」，附 PDF。
5. 24 小时发不出就全额退。

## 4. 这周只看 3 个数

后台 `/admin.html`：

- 点击 → 测试开始率（目标 ≥ 40%）
- 测试完成 → 留邮箱率（目标 ≥ 8%）
- 首月付款数（目标 3 单）

3 个数都低，先改封面和第一页，不要加功能。
只有“点击高、测试低”才改测试首题。
只有“测试高、付款低”才改 checkout 文案。

## 5. 不要做

- 不买信息流广告。
- 不做小程序、不做 App Store 包。
- 不加 AI 聊天、社区、复杂账号体系。
- 不在没有 10 个真实用户前改定价。
- 不把 `glowself.cn` 邮箱写回页面（这个域名没有 MX，收不到信）。

## 链接

- 线上：https://glowself.cn/
- 测试：https://glowself.cn/test.html
- 我的空间：https://glowself.cn/app.html
- 首月开通：https://glowself.cn/checkout.html
- 后台：https://glowself.cn/admin.html
- 内容包：`growth/content/note01/`
- 履约：`docs/fulfillment.md`
