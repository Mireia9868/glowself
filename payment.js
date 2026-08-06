// 光绽 GlowSelf - 支付模块（静态支付宝收款码模式）
// 早期版本使用 WeChat Pay Native API，改为静态二维码后改用人工对账

const crypto = require('crypto');

// WeChat Pay credentials from env（保留以便日后切换）
const WXPAY_MCHID = process.env.WXPAY_MCHID || '';
const WXPAY_APPID = process.env.WXPAY_APPID || '';
const WXPAY_SERIAL_NO = process.env.WXPAY_SERIAL_NO || '';
const WXPAY_PRIVATE_KEY = process.env.WXPAY_PRIVATE_KEY || '';
const WXPAY_API_V3_KEY = process.env.WXPAY_API_V3_KEY || '';
const WXPAY_NOTIFY_URL = process.env.WXPAY_NOTIFY_URL || '';

const isConfigured = () => !!(WXPAY_MCHID && WXPAY_APPID && WXPAY_PRIVATE_KEY && WXPAY_API_V3_KEY);

// Amount in cents: 1.99 RMB = 199 fen
const PRICE_PER_USE = 199;
const PRICE_LABEL = '1.99';

// Tiered packages: { credits, amountInFen, label, qrImage }
// 2026-08-06 改为支付宝静态收款码，金额对应三张二维码图
const PACKAGES = {
  basic: { credits: 1,  amount: 199,  label: '1.99',  name: '基础报告·1次', qrImage: '/img/payment/basic.jpg' },
  deep:  { credits: 5,  amount: 999,  label: '9.99',  name: '深度报告·5次', qrImage: '/img/payment/deep.jpg' },
  vip:   { credits: 15, amount: 2990, label: '29.90', name: 'VIP报告·15次', qrImage: '/img/payment/vip.jpg' },
};

// Report types: credits required per analysis
const REPORT_COSTS = {
  basic: 1,
  deep: 5,
  vip: 15,
};

// Static QR codes: { pkgId: imageUrl }
// 前端直接展示静态收款码，无需后端生成订单
const STATIC_QR_CODES = {
  basic: '/img/payment/basic.jpg',
  deep:  '/img/payment/deep.jpg',
  vip:   '/img/payment/vip.jpg',
};

function generateOrderNo() {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GS${ts}${rand}`;
}

// Sign request for WeChat Pay v3 API（保留以备切换）
function buildSignature(method, url, timestamp, nonce, body) {
  const message = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(message);
  return sign.sign(WXPAY_PRIVATE_KEY, 'base64');
}

function getAuthHeader(method, requestPath, body) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const bodyStr = body ? JSON.stringify(body) : '';
  const signature = buildSignature(method, requestPath, timestamp, bodyStr);
  return `WECHATPAY2-SHA256-RSA2048 mchid="${WXPAY_MCHID}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="${WXPAY_SERIAL_NO}",signature="${signature}"`;
}

// Create a Native payment order（保留以备切换）
async function createNativeOrder(orderNo, description, notifyUrl, amountInFen) {
  if (!isConfigured()) {
    throw new Error('PAYMENT_NOT_CONFIGURED');
  }

  const totalAmount = amountInFen || PRICE_PER_USE;
  const requestPath = '/v3/pay/transactions/native';
  const body = {
    appid: WXPAY_APPID,
    mchid: WXPAY_MCHID,
    description,
    out_trade_no: orderNo,
    amount: { total: totalAmount, currency: 'CNY' },
    notify_url: notifyUrl || WXPAY_NOTIFY_URL,
  };

  const response = await fetch('https://api.mch.weixin.qq.com' + requestPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: getAuthHeader('POST', requestPath, body),
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(`WeChat Pay API error: ${JSON.stringify(result)}`);
  }
  return result;
}

// Verify and decrypt callback（保留以备切换）
function decryptCallback(resource) {
  const { ciphertext, nonce, associated_data } = resource;
  const key = Buffer.from(WXPAY_API_V3_KEY, 'utf8');
  const cipherText = Buffer.from(ciphertext, 'base64');
  const authTag = cipherText.slice(cipherText.length - 16);
  const data = cipherText.slice(0, cipherText.length - 16);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce, { authTagLength: 16 });
  decipher.setAuthTag(authTag);
  if (associated_data) decipher.setAAD(Buffer.from(associated_data));
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  return JSON.parse(decrypted);
}

function verifyCallbackSignature(headers, body) {
  const timestamp = headers['wechatpay-timestamp'];
  const nonce = headers['wechatpay-nonce'];
  const signature = headers['wechatpay-signature'];
  const serial = headers['wechatpay-serial'];

  if (!timestamp || !nonce || !signature) return false;
  const message = `${timestamp}\n${nonce}\n${body}\n`;
  return true;
}

module.exports = {
  isConfigured,
  PRICE_PER_USE,
  PRICE_LABEL,
  PACKAGES,
  REPORT_COSTS,
  STATIC_QR_CODES,
  generateOrderNo,
  createNativeOrder,
  decryptCallback,
  verifyCallbackSignature,
};