# GlowSelf 内容增长包 · 30 天首发版

这不是“品牌宣传物料”，而是一套可以在 30 天内直接发、直接量、直接停的内容实验。

## 文件

- [calendar.md](calendar.md) — 30 天发布排期，按周主题、平台、形式、钩子、CTA 排好
- [notes.md](notes.md) — 6 篇完整小红书笔记（标题、封面字、正文、标签、首评、配图）
- [covers/](covers/) — 6 张 1080×1440 封面 PNG，直接对应 note01–note06
- [video-scripts.md](video-scripts.md) — 5 条 30–45 秒短视频脚本（分镜、口播、字幕）
- [comment-playbook.md](comment-playbook.md) — 12 个高频质疑的回复口径
- [budget.md](budget.md) — ¥25k/月渠道预算、CAC 上限和停止条件

## 统一落地页

所有内容只导向一个免费入口：

```
https://glowself.cn/test.html?utm_source=<平台>&utm_medium=social&utm_campaign=<campaign>&utm_content=<内容编号>
```

| 内容 | 链接 |
|---|---|
| 封面 | `covers/note01.png` – `covers/note06.png` |
| 小红书 note01 | `https://glowself.cn/test.html?utm_source=xiaohongshu&utm_medium=social&utm_campaign=note01&utm_content=cover_a` |
| 小红书 note02 | `https://glowself.cn/test.html?utm_source=xiaohongshu&utm_medium=social&utm_campaign=note02&utm_content=cover_a` |
| 小红书 note03 | `https://glowself.cn/test.html?utm_source=xiaohongshu&utm_medium=social&utm_campaign=note03&utm_content=cover_a` |
| 小红书 note04 | `https://glowself.cn/test.html?utm_source=xiaohongshu&utm_medium=social&utm_campaign=note04&utm_content=cover_a` |
| 小红书 note05 | `https://glowself.cn/test.html?utm_source=xiaohongshu&utm_medium=social&utm_campaign=note05&utm_content=cover_a` |
| 小红书 note06 | `https://glowself.cn/test.html?utm_source=xiaohongshu&utm_medium=social&utm_campaign=note06&utm_content=cover_a` |
| 抖音 video01 | `https://glowself.cn/test.html?utm_source=douyin&utm_medium=short_video&utm_campaign=video01&utm_content=hook_a` |
| 知乎 answer01 | `https://glowself.cn/test.html?utm_source=zhihu&utm_medium=answer&utm_campaign=answer01&utm_content=text_a` |

UTM 在首次落地时写入本机，保留 30 天；之后完成测试、留资都会带上同一组 campaign。后台 `/admin.html` 的「活动归因」按 UTM 首次触点计数。

## 发布节奏

- 第 1 周：认知反转，建立“不是颜值评分”的差异
- 第 2 周：脸型/发型，用高搜索需求拿精准流量
- 第 3 周：身材/衣橱，用“明天能穿”证明有用
- 第 4 周：报告实拍、价格解释、直播/问答，推动留资

每天只做三件事：发 1 条、回 20 条评论、记 1 次数据。不要日更堆量，先让 6 篇笔记跑出可复用的钩子。

## 每周只看 5 个数

1. 内容曝光 → 主页/链接点击率
2. 落地页 → 测试开始率
3. 测试开始 → 完成率
4. 完成 → 分享/下载率
5. 完成 → 邮箱留资率

前两周不投流；自然流量下测试开始率 <25% 先改封面和首句，不急着加预算。
