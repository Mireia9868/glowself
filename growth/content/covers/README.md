# GlowSelf 小红书封面（1080×1440）

6 张封面直接对应 `notes.md` 的 note01–note06，已按 3:4 竖版生成，适合小红书/抖音图文直接上传。

| 文件 | 对应笔记 | 标题钩子 |
|---|---|---|
| `note01.png` | note01 | 你不是穿黑色显瘦，是穿错了黑 |
| `note02.png` | note02 | 12 季色彩不是智商税，4 季才是 |
| `note03.png` | note03 | 方圆脸别剪齐刘海，先把重心提上去 |
| `note04.png` | note04 | 梨形不是遮胯，是把视线提到肩 |
| `note05.png` | note05 | 24 件衣服够穿一季，不是极简 |
| `note06.png` | note06 | 不给你打分的测试，长什么样 |

## 发布时怎么用

1. 首图用对应封面，第二张放同主题的网页截图/实拍，第三张放色卡或公式。
2. 正文最后一句引导「测一次」，不要放在第一行，先让内容有用。
3. 链接放首评或主页，链接统一带 UTM：

```
https://glowself.cn/test.html?utm_source=xiaohongshu&utm_medium=social&utm_campaign=note01&utm_content=cover_a
```

4. 发布后 24 小时只看两个数：封面点击率和测试开始率。点击率 <8% 换封面；开始率 <25% 改首句，不要先加预算。

## 重新生成

```bash
python3 scripts/build_covers.py
```

脚本使用系统宋体/冬青黑体，不依赖外部图片服务；修改 `scripts/build_covers.py` 末尾的 `COVERS` 即可批量改文案和色板。
