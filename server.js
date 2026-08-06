const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./db');
const ai = require('./ai');
const payment = require('./payment');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'glowself-dev-secret';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// ===== Auto-create beta (unlimited) account on startup =====
const BETA_EMAIL = 'mireia1998@163.com';
const BETA_PASSWORD = 'qwevhynbvgg666';
const BETA_NAME = 'mireia1998';
try {
  const betaHash = bcrypt.hashSync(BETA_PASSWORD, 10);
  db.ensureBetaUser(BETA_EMAIL, betaHash, BETA_NAME);
  console.log(`  → Beta account ready: ${BETA_EMAIL}`);
} catch (err) {
  console.error('  → Beta account setup failed:', err.message);
}

// Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// CORS for callback (WeChat Pay server will POST)
app.use('/api/payment/callback', express.raw({ type: 'application/json' }));

// Auth middleware
function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: '请先登录' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

// ===== Health =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), paymentConfigured: payment.isConfigured() });
});

// ===== Vision API Status =====
app.get('/api/vision-status', async (req, res) => {
  try {
    const available = await ai.checkVisionAPI();
    res.json({ available });
  } catch {
    res.json({ available: false });
  }
});

// ===== Auth: Register =====
app.post('/api/register', (req, res) => {
  const { email, phone, password, name } = req.body;
  if (!password || (!email && !phone)) {
    return res.status(400).json({ error: '请提供邮箱或手机号及密码' });
  }
  try {
    const existing = db.getUserByLogin(email || phone);
    if (existing) return res.status(409).json({ error: '该邮箱或手机号已注册' });
    const hash = bcrypt.hashSync(password, 10);
    const user = db.createUser(email, phone, hash, name);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: '注册失败: ' + err.message });
  }
});

// ===== Auth: Login =====
app.post('/api/login', (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) return res.status(400).json({ error: '请输入登录凭证' });
  try {
    const user = db.getUserByLogin(login);
    if (!user) return res.status(401).json({ error: '用户不存在，请先注册' });
    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: '密码错误' });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: '登录失败: ' + err.message });
  }
});

// ===== Auth: Profile =====
app.get('/api/profile', auth, (req, res) => {
  const user = db.getUserById(req.userId);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json({ user });
});

// ===== Credits =====
app.get('/api/credits', auth, (req, res) => {
  const credits = db.getCredits(req.userId);
  const isBeta = db.isBetaUser(req.userId);
  res.json({ credits, isBeta, packages: payment.PACKAGES, paymentReady: payment.isConfigured() });
});

// ===== Create Payment Order (static Alipay QR mode, 2026-08-06) =====
// 不再调用微信支付 API，直接返回静态二维码图。
// 用户扫码支付后通过 /api/payment/notify 提交支付凭证（备注 / 支付宝交易号），管理员人工对账。
app.post('/api/payment/create', auth, async (req, res) => {
  try {
    const pkgKey = req.body.package || 'basic';
    const pkg = payment.PACKAGES[pkgKey];
    if (!pkg) return res.status(400).json({ error: '无效的套餐类型' });

    const orderNo = payment.generateOrderNo();
    const order = db.createOrder(req.userId, orderNo, pkg.amount);

    res.json({
      orderId: order.id,
      orderNo: order.order_no,
      amount: pkg.label,
      credits: pkg.credits,
      packageName: pkg.name,
      qrImage: pkg.qrImage,        // 静态二维码图
      staticQr: true,              // 标记为静态模式，前端不再轮询
      message: '请使用支付宝扫码支付，付款后请填写支付凭证以便开通积分',
    });
  } catch (err) {
    console.error('[Payment] Create order error:', err.message);
    res.status(500).json({ error: '创建支付订单失败: ' + err.message });
  }
});

// ===== Submit payment proof (manual reconciliation) =====
// 用户在支付完成后提交此接口：orderNo + alipayNote（可选，备注/交易号）
// 数据存入 orders 表的 alipay_note 字段，状态保持 pending_payment，管理员定期处理
app.post('/api/payment/notify', auth, (req, res) => {
  try {
    const { orderNo, alipayNote } = req.body;
    if (!orderNo) return res.status(400).json({ error: '缺少订单号' });

    const order = db.getOrderByOrderNo(orderNo);
    if (!order) return res.status(404).json({ error: '订单不存在' });
    if (order.user_id !== req.userId) return res.status(403).json({ error: '无权操作此订单' });

    db.updateOrderNote(order.id, alipayNote || '');
    res.json({ success: true, message: '已收到您的支付凭证，我们会在 5-10 分钟内核对并开通积分' });
  } catch (err) {
    console.error('[Payment] Notify error:', err.message);
    res.status(500).json({ error: '提交失败: ' + err.message });
  }
});

// ===== Payment Callback (WeChat Pay) =====
app.post('/api/payment/callback', async (req, res) => {
  try {
    const body = req.body.toString('utf8');
    const data = JSON.parse(body);
    const resource = data.resource;

    // Decrypt callback data
    const decrypted = payment.decryptCallback(resource);
    const { out_trade_no, transaction_id, trade_state } = decrypted;

    if (trade_state === 'SUCCESS') {
      db.updateOrderStatus(out_trade_no, 'paid', transaction_id);
      const order = db.getOrderByOrderNo(out_trade_no);
      if (order) {
        // Determine credits from amount: 199→1, 990→5, 2990→15
        const creditsMap = { 199: 1, 990: 5, 2990: 15 };
        const creditsToAdd = creditsMap[order.amount] || 1;
        db.addCredits(order.user_id, creditsToAdd);
      }
      console.log(`[Payment] Order ${out_trade_no} paid successfully`);
    }

    // Must respond 200 to WeChat Pay
    res.status(200).json({ code: 'SUCCESS', message: 'success' });
  } catch (err) {
    console.error('[Payment] Callback error:', err.message);
    res.status(500).json({ code: 'FAIL', message: 'error' });
  }
});

// ===== Check Order Status =====
app.get('/api/payment/status/:orderNo', auth, (req, res) => {
  const order = db.getOrderByOrderNo(req.params.orderNo);
  if (!order) return res.status(404).json({ error: '订单不存在' });
  if (order.user_id !== req.userId) return res.status(403).json({ error: '无权查看此订单' });

  const credits = db.getCredits(req.userId);
  res.json({
    status: order.status,
    paid: order.status === 'paid',
    credits,
  });
});

// ===== Analyze (with credit check) =====
app.post('/api/analyze', auth, async (req, res) => {
  const { photo, idealPhoto, height, weight, skinType, stylePreference, reportType } = req.body;
  if (!photo) return res.status(400).json({ error: '请上传照片' });
  if (!height || !weight) return res.status(400).json({ error: '请填写身高和体重' });

  const rType = ['basic', 'deep', 'vip'].includes(reportType) ? reportType : 'basic';
  const cost = payment.REPORT_COSTS[rType];
  const isBeta = db.isBetaUser(req.userId);

  // Check credits (beta users bypass)
  if (!isBeta) {
    const credits = db.getCredits(req.userId);
    if (credits < cost) {
      const pkgKey = rType; // matching package name
      const pkg = payment.PACKAGES[pkgKey];
      return res.status(402).json({
        error: '积分不足',
        needPayment: true,
        package: pkgKey,
        amount: pkg ? pkg.label : '1.99',
        creditsNeeded: cost,
        creditsHave: credits,
        message: `此报告需要 ${cost} 次积分，您当前剩余 ${credits} 次。充值 ${pkg ? pkg.label : '1.99'} 元即可获得 ${cost} 次分析权限`,
      });
    }
  }

  try {
    // Deduct credits (skip for beta)
    if (!isBeta) {
      db.deductCredit(req.userId, cost);
    }

    // Step 1: Vision analysis (Qwen-VL)
    const imageDescription = await ai.analyzeImage(photo, 'user');
    const idealDescription = idealPhoto ? await ai.analyzeImage(idealPhoto, 'ideal') : null;

    // Step 2: Report generation (DeepSeek)
    const reportCount = db.getReportCount(req.userId);
    const report = await ai.generateReport({
      imageDescription,
      idealDescription,
      height: parseFloat(height),
      weight: parseFloat(weight),
      skinType,
      stylePreference,
      reportCount,
      reportType: rType,
    });

    // Step 3: Save to database
    const photoMeta = parseDataUrl(photo);
    const idealMeta = idealPhoto ? parseDataUrl(idealPhoto) : null;
    const saved = db.saveReport(req.userId, {
      height: parseFloat(height),
      weight: parseFloat(weight),
      skinType,
      stylePreference,
      score: report.overallScore,
      keywords: report.scoreTitle ? report.scoreTitle.split('|').map(s=>s.trim()).filter(Boolean) : [],
      reportData: report,
      imageDescription,
      idealDescription,
      photoPath: photo,
      photoMime: photoMeta?.mime,
      photoWidth: photoMeta?.width,
      photoHeight: photoMeta?.height,
      idealPhotoPath: idealPhoto,
      reportType: rType,
    });

    res.json({
      report: {
        ...report,
        id: saved.id,
        created_at: saved.created_at,
        reportType: rType,
        photo: photo,
        photoWidth: photoMeta?.width,
        photoHeight: photoMeta?.height,
        photoMime: photoMeta?.mime,
      },
      remainingCredits: db.getCredits(req.userId),
      isBeta,
    });
  } catch (err) {
    console.error('[Analyze] Error:', err.message);
    // Refund credits on failure (skip for beta)
    if (!isBeta) {
      db.addCredits(req.userId, cost);
    }
    res.status(500).json({ error: '分析失败: ' + err.message + '，积分已退回' });
  }
});

// Helper: extract mime from a base64 data URL
function parseDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const m = dataUrl.match(/^data:([^;]+);base64,/);
  if (!m) return null;
  return { mime: m[1] };
}

// ===== History =====
app.get('/api/history', auth, (req, res) => {
  const reports = db.getReportsByUserId(req.userId);
  // Strip bulky photo data from list view to keep initial payload small;
  // the single-report endpoint (/api/report/:id) still returns photo_path for viewing.
  const summary = reports.map(r => {
    const { photo_path, ideal_photo_path, report_data, ...rest } = r;
    return {
      ...rest,
      // Cheap thumbnail (e.g. ~40 chars) lets the history row hint at the photo without
      // inflating the payload; full image loads on click.
      has_photo: Boolean(photo_path),
    };
  });
  res.json({ reports: summary });
});

app.get('/api/report/:id', auth, (req, res) => {
  const report = db.getReportById(req.params.id);
  if (!report || report.user_id !== req.userId) {
    return res.status(404).json({ error: '报告不存在' });
  }
  res.json({ report });
});

// ===== Feedback =====
app.post('/api/feedback', auth, (req, res) => {
  const { rating, content } = req.body;
  if (!content) return res.status(400).json({ error: '请输入反馈内容' });
  const feedback = db.saveFeedback(req.userId, rating || 5, content);
  res.json({ feedback });
});

app.get('/api/feedback', auth, (req, res) => {
  const feedback = db.getFeedbackByUserId(req.userId);
  res.json({ feedback });
});

// ===== SPA Fallback =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  ✨ 光绽 GlowSelf\n  → http://localhost:${PORT}\n  → Payment: ${payment.isConfigured() ? 'Ready' : 'Not configured'}\n`);
});
