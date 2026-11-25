#!/usr/bin/env python3
"""Build the GlowSelf 24-month operating model (editable formulas)."""
from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.chart import LineChart, Reference
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "GlowSelf-Financial-Model.xlsx"

PAPER = "F6F1E8"
CARD = "FFFDF8"
INK = "1F1B16"
MUTED = "786D5F"
ACCENT = "BF4B32"
SAGE = "76836A"
LINE = "DED3C3"
SOFT = "F1D5C8"

SERIF = "Songti SC"
SANS = "PingFang SC"

thin = Side(style="thin", color=LINE)
border = Border(bottom=thin)


def title(ws, text, sub=None, width=8):
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=width)
    c = ws.cell(row=1, column=1, value=text)
    c.font = Font(name=SERIF, size=24, bold=True, color=INK)
    c.alignment = Alignment(vertical="center")
    ws.row_dimensions[1].height = 44
    if sub:
        ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=width)
        c = ws.cell(row=2, column=1, value=sub)
        c.font = Font(name=SANS, size=10, color=MUTED)
        c.alignment = Alignment(vertical="center")
        ws.row_dimensions[2].height = 22


def section(ws, row, text, width=8):
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=width)
    c = ws.cell(row=row, column=1, value=text)
    c.font = Font(name=SANS, size=10, bold=True, color=ACCENT)
    c.fill = PatternFill("solid", fgColor=SOFT)
    c.alignment = Alignment(vertical="center")
    ws.row_dimensions[row].height = 22


def label(ws, cell, text, note=None):
    c = ws[cell]
    c.value = text
    c.font = Font(name=SANS, size=10, color=INK)
    c.alignment = Alignment(vertical="center")
    if note:
        c.comment = None


def value(ws, cell, v, fmt=None, bold=False, color=INK):
    c = ws[cell]
    c.value = v
    c.font = Font(name=SANS, size=10, bold=bold, color=color)
    c.alignment = Alignment(vertical="center")
    if fmt:
        c.number_format = fmt
    c.border = border


wb = Workbook()
ws = wb.active
ws.title = "Dashboard"

# ---------- Dashboard ----------
title(ws, "GlowSelf · 经营模型", "目标：5,000 DAU · US$80k ARR ｜ 所有蓝字可在 Assumptions 调整，公式自动联动", 7)
ws.sheet_view.showGridLines = False

section(ws, 4, "THE TARGET", 7)
rows = [
    ("DAU", "=Assumptions!B6", "#,##0"),
    ("MAU", "=Assumptions!B8", "#,##0"),
    ("付费用户", "=Assumptions!B12", "#,##0"),
    ("混合年 ARPPU（元）", "=Assumptions!B20", "¥#,##0"),
    ("订阅 ARR（元）", "=B7*B8", "¥#,##0"),
    ("一次性报告 run-rate（元）", "=Assumptions!B8*Assumptions!B22*Assumptions!B21*12", "¥#,##0"),
    ("合计 run-rate（USD）", "=(B9+B10)/Assumptions!B5", "$#,##0"),
]
r = 5
for name, formula, fmt in rows:
    label(ws, f"A{r}", name)
    value(ws, f"B{r}", formula, fmt, bold=(name.startswith("合计")), color=ACCENT if name.startswith("合计") else INK)
    r += 1
ws["B5"].font = Font(name=SANS, size=20, bold=True, color=INK)
ws["B6"].font = Font(name=SANS, size=20, bold=True, color=INK)
ws["B7"].font = Font(name=SANS, size=20, bold=True, color=INK)
ws["B11"].font = Font(name=SANS, size=22, bold=True, color=ACCENT)
ws["A11"].font = Font(name=SANS, size=10, bold=True, color=ACCENT)

section(ws, 13, "THE MATH (BASE CASE)", 7)
math_rows = [
    ("DAU / MAU", "=B5/B6", "0%"),
    ("测试参与率（占 MAU / 月）", "=Assumptions!B9", "0%"),
    ("测试完成率", "=Assumptions!B10", "0%"),
    ("MAU → 付费转化率", "=Assumptions!B11", "0.0%"),
    ("Plus / Pro 收入占比", "=1-Assumptions!B19&\" / \"&Assumptions!B19", None),
    ("年度续费率", "=Assumptions!B31", "0%"),
]
r = 14
for name, formula, fmt in math_rows:
    label(ws, f"A{r}", name)
    value(ws, f"B{r}", formula, fmt)
    r += 1

section(ws, 21, "UNIT ECONOMICS", 7)
ue_rows = [
    ("LTV（元）", "='Unit Economics'!B8", "¥#,##0"),
    ("CAC（元）", "=Assumptions!B30", "¥#,##0"),
    ("LTV / CAC", "=B22/B23", "0.0x"),
    ("CAC 回收期（月）", "=B23/('Unit Economics'!B11/12)", "0.0"),
]
r = 22
for name, formula, fmt in ue_rows:
    label(ws, f"A{r}", name)
    value(ws, f"B{r}", formula, fmt, bold=(name == "LTV / CAC"))
    r += 1

section(ws, 28, "READ THIS FIRST", 7)
notes = [
    "1. 5,000 DAU 本身不等于 80k ARR：按 25% DAU/MAU、6% 付费转化、¥500 混合 ARPPU，订阅 ARR 约 ¥600k（≈US$83k）。",
    "2. 混合 ARPPU 由「Plus 年付 ¥299 × 88% + Pro 年付 ¥1,990 × 12%」构成；Pro 占比是最大的收入杠杆。",
    "3. 模型不把融资、广告投放和一次性大促计入收入；营销费用只按新增付费 × CAC 计提。",
    "4. 24 个月后仍未盈亏平衡是正常的：先验证留存与付费，再放大投放。",
    "5. 所有假设均为可编辑单元格；改 DAU、转化率或 ARPPU，Dashboard 与 Model 会同步更新。",
]
r = 29
for n in notes:
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=7)
    c = ws.cell(row=r, column=1, value=n)
    c.font = Font(name=SANS, size=10, color=INK)
    c.alignment = Alignment(wrap_text=True, vertical="top")
    ws.row_dimensions[r].height = 34
    r += 1

ws.column_dimensions["A"].width = 36
for col in "BCDEFG":
    ws.column_dimensions[col].width = 16

# ---------- Assumptions ----------
wa = wb.create_sheet("Assumptions")
wa.sheet_view.showGridLines = False
title(wa, "关键假设", "只改这张表的蓝字；其余页面全部为公式。基准日：2027-01-01。", 5)

section(wa, 4, "TARGETS & FUNNEL", 5)
assumptions = [
    ("汇率（CNY / USD）", 7.2, "0.00"),
    ("DAU 目标", 5000, "#,##0"),
    ("DAU / MAU", 0.25, "0%"),
    ("MAU（推导）", "=B6/B7", "#,##0"),
    ("月访问 → 测试参与率", 0.35, "0%"),
    ("测试完成率", 0.78, "0%"),
    ("MAU → 付费转化率", 0.06, "0.0%"),
    ("付费用户（推导）", "=B8*B11", "#,##0"),
]
r = 5
for name, v, fmt in assumptions:
    label(wa, f"A{r}", name)
    value(wa, f"B{r}", v, fmt, color="1F5FAF")
    if name in ("MAU（推导）", "付费用户（推导）"):
        wa[f"B{r}"].font = Font(name=SANS, size=10, bold=True, color=ACCENT)
    r += 1

section(wa, 14, "PRICING", 5)
pricing = [
    ("Plus 月付（元）", 39, "¥#,##0"),
    ("Plus 年付（元）", 299, "¥#,##0"),
    ("Pro 月付（元）", 199, "¥#,##0"),
    ("Pro 年付（元）", 1990, "¥#,##0"),
    ("Pro 付费用户占比", 0.12, "0%"),
    ("混合年 ARPPU（元）", "=(1-B19)*B16+B19*B18", "¥#,##0"),
    ("单份报告价格（元）", 19.9, "¥#,##0.0"),
    ("报告购买率（占 MAU / 月）", 0.012, "0.0%"),
]
r = 15
for name, v, fmt in pricing:
    label(wa, f"A{r}", name)
    value(wa, f"B{r}", v, fmt, color="1F5FAF")
    if name.startswith("混合"):
        wa[f"B{r}"].font = Font(name=SANS, size=10, bold=True, color=ACCENT)
    r += 1

section(wa, 24, "COST & GROWTH", 5)
costs = [
    ("支付通道费率", 0.006, "0.00%"),
    ("AI / 视觉 API 成本（元 / 次测试）", 0.35, "¥#,##0.00"),
    ("客服与履约（元 / 付费用户 / 月）", 2.0, "¥#,##0.00"),
    ("固定基础设施（元 / 月）", 800, "¥#,##0"),
    ("团队与运营（元 / 月）", 35000, "¥#,##0"),
    ("CAC（元 / 新增付费）", 120, "¥#,##0"),
    ("年度续费率", 0.55, "0%"),
    ("起始 MAU", 1000, "#,##0"),
    ("MAU 月增速", 0.14, "0.0%"),
]
r = 25
for name, v, fmt in costs:
    label(wa, f"A{r}", name)
    value(wa, f"B{r}", v, fmt, color="1F5FAF")
    r += 1

wa.column_dimensions["A"].width = 38
wa.column_dimensions["B"].width = 18

# ---------- Model ----------
wm = wb.create_sheet("Model")
wm.sheet_view.showGridLines = False
title(wm, "24 个月经营模型", "保守增长：MAU 从 1,000 出发，月增 14%，24 个月触达 20k MAU / 5k DAU。", 16)

headers = [
    "Month", "Date", "MAU", "DAU", "Test starts", "Paid subs", "New paid",
    "Subscription rev", "One-off rev", "Total rev", "COGS", "Gross profit",
    "Marketing", "Team & ops", "EBITDA", "Cumulative EBITDA",
]
for i, h in enumerate(headers, 1):
    c = wm.cell(row=4, column=i, value=h)
    c.font = Font(name=SANS, size=9, bold=True, color="FFFFFF")
    c.fill = PatternFill("solid", fgColor=INK)
    c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    c.border = Border(bottom=thin)
wm.row_dimensions[4].height = 32

for i in range(24):
    r = 5 + i
    month = i + 1
    wm.cell(row=r, column=1, value=month)
    d = wm.cell(row=r, column=2, value=date(2027 + (i // 12), (i % 12) + 1, 1))
    d.number_format = "mmm yy"
    wm.cell(row=r, column=3, value="=Assumptions!$B$32" if i == 0 else f"=MIN(Assumptions!$B$8,C{r-1}*(1+Assumptions!$B$33))")
    wm.cell(row=r, column=4, value=f"=C{r}*Assumptions!$B$7")
    wm.cell(row=r, column=5, value=f"=C{r}*Assumptions!$B$9")
    wm.cell(row=r, column=6, value=f"=C{r}*Assumptions!$B$11")
    wm.cell(row=r, column=7, value=f"=MAX(0,F{r}-F{r-1})" if i else f"=F{r}")
    wm.cell(row=r, column=8, value=f"=F{r}*Assumptions!$B$20/12")
    wm.cell(row=r, column=9, value=f"=E{r}*Assumptions!$B$22*Assumptions!$B$21")
    wm.cell(row=r, column=10, value=f"=H{r}+I{r}")
    wm.cell(row=r, column=11, value=f"=J{r}*Assumptions!$B$25+E{r}*Assumptions!$B$26+F{r}*Assumptions!$B$27+Assumptions!$B$28")
    wm.cell(row=r, column=12, value=f"=J{r}-K{r}")
    wm.cell(row=r, column=13, value=f"=G{r}*Assumptions!$B$30")
    wm.cell(row=r, column=14, value="=Assumptions!$B$29")
    wm.cell(row=r, column=15, value=f"=L{r}-M{r}-N{r}")
    wm.cell(row=r, column=16, value=f"=O{r}" if i == 0 else f"=P{r-1}+O{r}")

    for col in range(1, 17):
        c = wm.cell(row=r, column=col)
        c.font = Font(name=SANS, size=9, color=INK)
        c.border = Border(bottom=Side(style="hair", color=LINE))
        if col == 1:
            c.alignment = Alignment(horizontal="center")
        elif col == 2:
            c.alignment = Alignment(horizontal="center")
        elif col in (3, 4, 5, 6, 7):
            c.number_format = "#,##0"
        else:
            c.number_format = "¥#,##0"
    if month % 12 == 0:
        for col in range(1, 17):
            wm.cell(row=r, column=col).fill = PatternFill("solid", fgColor="FBF5EC")

wm.column_dimensions["A"].width = 8
wm.column_dimensions["B"].width = 10
for col in range(3, 17):
    wm.column_dimensions[get_column_letter(col)].width = 14
wm.freeze_panes = "C5"

# chart
chart = LineChart()
chart.title = "DAU & paid subscribers"
chart.y_axis.title = "Users"
chart.x_axis.title = "Month"
chart.height = 8
chart.width = 18
data = Reference(wm, min_col=4, max_col=4, min_row=4, max_row=28)
data2 = Reference(wm, min_col=6, max_col=6, min_row=4, max_row=28)
cats = Reference(wm, min_col=1, min_row=5, max_row=28)
chart.add_data(data, titles_from_data=True)
chart.add_data(data2, titles_from_data=True)
chart.set_categories(cats)
wm.add_chart(chart, "R5")

# ---------- Scenarios ----------
wsc = wb.create_sheet("Scenarios")
wsc.sheet_view.showGridLines = False
title(wsc, "三种情景", "用于董事会 / 融资沟通：只有基准情景同时满足 5k DAU 与 80k ARR。", 8)

sc_headers = ["", "Conservative", "Base", "Aggressive"]
for i, h in enumerate(sc_headers, 1):
    c = wsc.cell(row=4, column=i, value=h)
    c.font = Font(name=SANS, size=10, bold=True, color="FFFFFF")
    c.fill = PatternFill("solid", fgColor=INK)
    c.alignment = Alignment(horizontal="center")

sc_rows = [
    ("DAU", 3000, 5000, 7000, "#,##0"),
    ("DAU / MAU", 0.22, 0.25, 0.28, "0%"),
    ("MAU", "=B5/B6", "=C5/C6", "=D5/D6", "#,##0"),
    ("付费转化率", 0.04, 0.06, 0.08, "0.0%"),
    ("付费用户", "=B7*B8", "=C7*C8", "=D7*D8", "#,##0"),
    ("混合 ARPPU（元）", 420, 500, 560, "¥#,##0"),
    ("订阅 ARR（元）", "=B9*B10", "=C9*C10", "=D9*D10", "¥#,##0"),
    ("报告收入 run-rate（元）", "=B7*0.008*19.9*12", "=C7*0.012*19.9*12", "=D7*0.018*19.9*12", "¥#,##0"),
    ("合计 ARR（USD）", "=(B11+B12)/Assumptions!$B$5", "=(C11+C12)/Assumptions!$B$5", "=(D11+D12)/Assumptions!$B$5", "$#,##0"),
]
r = 5
for name, b, c, d, fmt in sc_rows:
    label(wsc, f"A{r}", name)
    for col, v in (("B", b), ("C", c), ("D", d)):
        cell = wsc[f"{col}{r}"]
        cell.value = v
        cell.number_format = fmt
        cell.font = Font(name=SANS, size=10, color=INK, bold=(name.startswith("合计")))
        cell.alignment = Alignment(horizontal="center")
        cell.border = border
    r += 1

# highlight base
for rr in range(5, 14):
    wsc[f"C{rr}"].fill = PatternFill("solid", fgColor="FBF5EC")

wsc.merge_cells("A15:H15")
c = wsc["A15"]
c.value = "结论：DAU 5,000 在 25% DAU/MAU 下只有 20k MAU；若付费转化 6%、ARPPU ¥500，订阅 ARR 约 ¥600k（US$83k）。因此「5k DAU + 80k ARR」不是流量问题，而是 Pro 渗透与年付转化问题。"
c.font = Font(name=SANS, size=10, color=INK)
c.alignment = Alignment(wrap_text=True, vertical="top")
wsc.row_dimensions[15].height = 52

wsc.column_dimensions["A"].width = 30
for col in "BCD":
    wsc.column_dimensions[col].width = 22

# ---------- Unit economics ----------
wu = wb.create_sheet("Unit Economics")
wu.sheet_view.showGridLines = False
title(wu, "单位经济", "按年付 cohort 计算；续费率是 LTV 的最大变量。", 4)

ue = [
    ("混合年 ARPPU（元）", "=Assumptions!B20", "¥#,##0"),
    ("毛利率", 0.85, "0%"),
    ("年度续费率", "=Assumptions!B31", "0%"),
    ("平均生命周期（年）", "=1/(1-B6)", "0.00"),
    ("LTV（元）", "=B4*B5*B7", "¥#,##0"),
    ("CAC（元）", "=Assumptions!B30", "¥#,##0"),
    ("LTV / CAC", "=B8/B9", "0.0x"),
    ("年毛利（元 / 付费）", "=B4*B5", "¥#,##0"),
    ("CAC 回收期（月）", "=B9/(B11/12)", "0.0"),
    ("首年贡献毛利（元）", "=B11-B9", "¥#,##0"),
]
r = 4
for name, v, fmt in ue:
    label(wu, f"A{r}", name)
    value(wu, f"B{r}", v, fmt, bold=(name in ("LTV（元）", "LTV / CAC")), color=ACCENT if name == "LTV / CAC" else INK)
    r += 1

wu.merge_cells("A15:D15")
c = wu["A15"]
c.value = "健康阈值：LTV/CAC ≥ 3、回收期 ≤ 6 个月。当前模型 LTV/CAC 约 7–8x，说明可以适度加大投放；但前提是 6 个月留存和退款率经过验证。"
c.font = Font(name=SANS, size=10, color=MUTED)
c.alignment = Alignment(wrap_text=True, vertical="top")
wu.row_dimensions[15].height = 36
wu.column_dimensions["A"].width = 30
wu.column_dimensions["B"].width = 18

for sheet in wb.worksheets:
    sheet.sheet_properties.tabColor = ACCENT if sheet.title == "Dashboard" else SAGE

wb.save(OUT)
print("saved", OUT)
