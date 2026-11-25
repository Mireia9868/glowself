# 付款后人工开通 SOP

> 目标：24 小时内把「人工复核 PDF」发到用户邮箱。首月 ¥29.90，一次性支持，不自动续费。

## 1. 看订单

1. 打开 `https://glowself.cn/admin.html`，输入 `ADMIN_KEY`（本机 `.glowself-private/admin-key`）。
2. 看「最近留资」，找 `意图 = 首月付款`。
3. 重点看三列：**邮箱 / 备注（订单尾号）/ 季节 + 风格**。
4. 打开支付宝账单，核对：金额 `29.90`、时间接近、订单尾号一致。**不要只凭用户截图开通。**

如果信息对不上：

- 邮件回复：「我们没找到这笔 ¥29.90，能否发完整支付宝订单号或账单截图？核对后 24 小时内开通。」
- 24 小时仍对不上：原路退回，或让用户联系支付宝。

## 2. 生成 PDF

用订单里的季节和风格：

```bash
cd /Users/mireia/Documents/deepseek-harness/default-workspace/glowself
/Users/mireia/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/python/bin/python3 \
  scripts/make_report.py \
  --season cool-winter \
  --style elegant \
  --goal outfit \
  --email user@example.com \
  --note "你的答案里，明度和对比都偏中高；先穿冷调深色，别急着买亮色。" \
  --out growth/orders/user@example.com.pdf
```

- `--season` / `--style` 用后台显示的值（如 `cool-winter`、`elegant`）。
- `--goal` 可选 `outfit / makeup / hair / color / confidence`；不确定就 `outfit`。
- `--note` 写 1–2 句针对这个人的复核意见。不要复制同一句给所有人。
- 如果后台风格为空，用 `elegant`，并在邮件里说明「这次先按色彩为主」。

## 3. 发邮件

**主题**

你的 GlowSelf 色彩复核报告

**正文**

```
Hi，

你的 GlowSelf 色彩与风格复核报告在附件里。

这次我重点看了三件事：
1. 你的季节坐标：<季节>，核心是 <一句话>。
2. 靠近脸的 6 个颜色：<列 2–3 个>。
3. 最容易买错的一类：<一句>。

建议先做一件小事：明天从衣柜里挑一件 <本命色> 的上衣，配 <中性色> 下装，拍一张照。
不用先买新衣服。

报告里第 4 页有 24 件衣橱清单和 30 天节奏；如果只能做一件事，先做第 1 周。

有任何一页看不懂，直接回这封邮件。

—— GlowSelf
mireia1998@163.com
```

附件用生成的 PDF。发件邮箱建议 `mireia1998@163.com`。

## 4. 24 小时内没处理完

- 先回一封：「已收到，正在核对，最晚明天 <时间> 前发你。」不要让用户等。
- 如果当天不能发 PDF，先退全款，并说明「这单我们没处理好，钱先退你」。
- 不要在未核对付款的情况下先发 PDF。

## 5. 退款

- 未发 PDF：全额退。
- 已发 PDF 7 天内：按未使用比例退；首月一次性，通常全额退，避免争议。
- 退款备注：「GlowSelf 创始会员退款」。
- 退完在后台留一条备注（可发邮件给自己）。

## 6. 每周检查

- 本周付款数 / 发出 PDF 数 / 退款数。
- 平均发出时间（目标 < 24h）。
- 用户回信里重复出现的问题，写进 `growth/content/notes.md` 的下一批选题。
