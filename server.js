const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const db = require('./db');
const ai = require('./ai');
const payment = require('./payment');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'glowself-dev-secret';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// ===== Auto-create beta (unlimited) account on startup =====
const BETA_EMAIL = 'mireia1998@163.com';
const BETA_PASSWORD = 'qwevhynbvgg666';
const BETA_NAME = 'mireia1998';

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
app.post('/api/register', async (req, res) => {
  const { email, phone, password, name } = req.body;
  if (!password || (!email && !phone)) {
    return res.status(400).json({ error: '请提供邮箱或手机号及密码' });
  }
  try {
    const existing = await db.getUserByLogin(email || phone);
    if (existing) return res.status(409).json({ error: '该邮箱或手机号已注册' });
    const hash = bcrypt.hashSync(password, 10);
    const user = await db.createUser(email, phone, hash, name);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: '注册失败: ' + err.message });
  }
});

// ===== Auth: Login =====
app.post('/api/login', async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) return res.status(400).json({ error: '请输入登录凭证' });
  try {
    const user = await db.getUserByLogin(login);
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
app.get('/api/profile', auth, async (req, res) => {
  const user = await db.getUserById(req.userId);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json({ user });
});

// ===== Credits =====
app.get('/api/credits', auth, async (req, res) => {
  const credits = await db.getCredits(req.userId);
  const isBeta = await db.isBetaUser(req.userId);
  res.json({ credits, isBeta, packages: payment.PACKAGES, paymentReady: payment.isConfigured() });
});

// ===== Create Payment Order (static Alipay QR mode, 2026-08-06) =====
app.post('/api/payment/create', auth, async (req, res) => {
  try {
    const pkgKey = req.body.package || 'basic';
    const pkg = payment.PACKAGES[pkgKey];
    if (!pkg) return res.status(400).json({ error: '无效的套餐类型' });

    const orderNo = payment.generateOrderNo();
    const order = await db.createOrder(req.userId, orderNo, pkg.amount);

    res.json({
      orderId: order.id,
      orderNo: order.order_no,
      amount: pkg.label,
      credits: pkg.credits,
      packageName: pkg.name,
      qrImage: pkg.qrImage,
      staticQr: true,
      message: '请使用支付宝扫码支付，付款后请填写支付凭证以便开通积分',
    });
  } catch (err) {
    console.error('[Payment] Create order error:', err.message);
    res.status(500).json({ error: '创建支付订单失败: ' + err.message });
  }
});

// ===== Submit payment proof (manual reconciliation) =====
app.post('/api/payment/notify', auth, async (req, res) => {
  try {
    const { orderNo, alipayNote } = req.body;
    if (!orderNo) return res.status(400).json({ error: '缺少订单号' });

    const order = await db.getOrderByOrderNo(orderNo);
    if (!order) return res.status(404).json({ error: '订单不存在' });
    if (order.user_id !== req.userId) return res.status(403).json({ error: '无权操作此订单' });

    await db.updateOrderNote(order.id, alipayNote || '');
    res.json({ success: true, message: '已收到您的支付凭证，我们会在 5-10 分钟内核对并开通积分' });
  } catch (err) {
    console.error('[Payment] Notify error:', err.message);
    res.status(500).json({ error: '提交失败: ' + err.message });
  }
});

// ===== Payment Callback (WeChat Pay — kept for future switch) =====
app.post('/api/payment/callback', async (req, res) => {
  try {
    const body = req.body.toString('utf8');
    const data = JSON.parse(body);
    const resource = data.resource;

    const decrypted = payment.decryptCallback(resource);
    const { out_trade_no, transaction_id, trade_state } = decrypted;

    if (trade_state === 'SUCCESS') {
      await db.updateOrderStatus(out_trade_no, 'paid', transaction_id);
      const order = await db.getOrderByOrderNo(out_trade_no);
      if (order) {
        const creditsMap = { 199: 1, 999: 5, 2990: 15 };
        const creditsToAdd = creditsMap[order.amount] || 1;
        await db.addCredits(order.user_id, creditsToAdd);
      }
      console.log(`[Payment] Order ${out_trade_no} paid successfully`);
    }

    res.status(200).json({ code: 'SUCCESS', message: 'success' });
  } catch (err) {
    console.error('[Payment] Callback error:', err.message);
    res.status(500).json({ code: 'FAIL', message: 'error' });
  }
});

// ===== Check Order Status =====
app.get('/api/payment/status/:orderNo', auth, async (req, res) => {
  const order = await db.getOrderByOrderNo(req.params.orderNo);
  if (!order) return res.status(404).json({ error: '订单不存在' });
  if (order.user_id !== req.userId) return res.status(403).json({ error: '无权查看此订单' });

  const credits = await db.getCredits(req.userId);
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
  const isBeta = await db.isBetaUser(req.userId);

  // Check credits (beta users bypass)
  if (!isBeta) {
    const credits = await db.getCredits(req.userId);
    if (credits < cost) {
      const pkgKey = rType;
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
      await db.deductCredit(req.userId, cost);
    }

    // Step 1: Vision analysis (Qwen-VL)
    const imageDescription = await ai.analyzeImage(photo, 'user');
    const idealDescription = idealPhoto ? await ai.analyzeImage(idealPhoto, 'ideal') : null;

    // Step 2: Report generation (DeepSeek)
    const reportCount = await db.getReportCount(req.userId);
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
    const saved = await db.saveReport(req.userId, {
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

    const remainingCredits = await db.getCredits(req.userId);
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
      remainingCredits,
      isBeta,
    });
  } catch (err) {
    console.error('[Analyze] Error:', err.message);
    // Refund credits on failure (skip for beta)
    if (!isBeta) {
      await db.addCredits(req.userId, cost);
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
app.get('/api/history', auth, async (req, res) => {
  const reports = await db.getReportsByUserId(req.userId);
  const summary = reports.map(r => {
    const { photo_path, ideal_photo_path, report_data, ...rest } = r;
    return {
      ...rest,
      has_photo: Boolean(photo_path),
    };
  });
  res.json({ reports: summary });
});

app.get('/api/report/:id', auth, async (req, res) => {
  const report = await db.getReportById(req.params.id);
  if (!report || report.user_id !== req.userId) {
    return res.status(404).json({ error: '报告不存在' });
  }
  res.json({ report });
});

// ===== Share: generate share link (auth required) =====
app.post('/api/report/:id/share', auth, async (req, res) => {
  try {
    const report = await db.getReportById(req.params.id);
    if (!report || report.user_id !== req.userId) {
      return res.status(404).json({ error: '报告不存在' });
    }
    // If already has a token, return it
    if (report.share_token) {
      return res.json({ token: report.share_token, url: `${BASE_URL}/s/${report.share_token}` });
    }
    // Generate a new random token
    const token = crypto.randomBytes(12).toString('base64url');
    await db.setShareToken(report.id, token);
    res.json({ token, url: `${BASE_URL}/s/${token}` });
  } catch (err) {
    console.error('[Share] Create error:', err.message);
    res.status(500).json({ error: '生成分享链接失败: ' + err.message });
  }
});

// ===== Share: revoke share link (auth required) =====
app.delete('/api/report/:id/share', auth, async (req, res) => {
  try {
    const report = await db.getReportById(req.params.id);
    if (!report || report.user_id !== req.userId) {
      return res.status(404).json({ error: '报告不存在' });
    }
    await db.revokeShareToken(report.id);
    res.json({ success: true, message: '已取消分享' });
  } catch (err) {
    res.status(500).json({ error: '取消分享失败: ' + err.message });
  }
});

// ===== Share: view shared report (public, no auth) =====
app.get('/api/shared/:token', async (req, res) => {
  try {
    const report = await db.getReportByShareToken(req.params.token);
    if (!report) {
      return res.status(404).json({ error: '分享链接无效或已失效' });
    }
    // Return report data + photo for rendering (read-only)
    const reportData = report.report_data || {};
    res.json({
      report: {
        ...reportData,
        id: report.id,
        created_at: report.created_at,
        reportType: report.report_type,
        photo: report.photo_path,
        photoWidth: report.photo_width,
        photoHeight: report.photo_height,
        photoMime: report.photo_mime,
      },
    });
  } catch (err) {
    console.error('[Share] View error:', err.message);
    res.status(500).json({ error: '加载分享报告失败' });
  }
});

// ===== Feedback =====
app.post('/api/feedback', auth, async (req, res) => {
  const { rating, content } = req.body;
  if (!content) return res.status(400).json({ error: '请输入反馈内容' });
  const feedback = await db.saveFeedback(req.userId, rating || 5, content);
  res.json({ feedback });
});

app.get('/api/feedback', auth, async (req, res) => {
  const feedback = await db.getFeedbackByUserId(req.userId);
  res.json({ feedback });
});

// ===== SPA Fallback =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== Async startup: init DB → create beta account → listen =====
async function startServer() {
  try {
    await db.init();
    console.log('  -> Database initialized');
  } catch (err) {
    console.error('  -> Database init failed:', err.message);
    console.error('  -> Make sure DATABASE_URL is set in .env or Render Environment');
    process.exit(1);
  }

  try {
    const betaHash = bcrypt.hashSync(BETA_PASSWORD, 10);
    await db.ensureBetaUser(BETA_EMAIL, betaHash, BETA_NAME);
    console.log(`  -> Beta account ready: ${BETA_EMAIL}`);
  } catch (err) {
    console.error('  -> Beta account setup failed:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`\n  GlowSelf\n  -> http://localhost:${PORT}\n  -> Payment: ${payment.isConfigured() ? 'Ready' : 'Not configured'}\n  -> DB: PostgreSQL\n`);
  });
}

startServer();
