const { Pool } = require('pg');

// ===== PostgreSQL connection (Neon / any external PG) =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon requires SSL; allow self-signed for serverless PG providers
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  // Keep pool small — Neon free tier allows ~20 concurrent connections
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// ===== Schema initialization (called on startup) =====
async function init() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT DEFAULT '',
        credits INTEGER DEFAULT 0,
        is_beta INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        photo_path TEXT,
        photo_mime TEXT,
        photo_width INTEGER,
        photo_height INTEGER,
        ideal_photo_path TEXT,
        height REAL,
        weight REAL,
        skin_type TEXT,
        style_preference TEXT,
        score INTEGER,
        keywords TEXT,
        report_data TEXT,
        image_description TEXT,
        ideal_description TEXT,
        report_type TEXT DEFAULT 'basic',
        share_token TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        rating INTEGER,
        content TEXT,
        status TEXT DEFAULT 'pending',
        reply TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        order_no TEXT UNIQUE NOT NULL,
        amount INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        pay_url TEXT,
        transaction_id TEXT,
        alipay_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP
      );
    `);
    // Migration: add share_token column if missing (for existing tables)
    await client.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE`);
    console.log('  -> Database tables ready (PostgreSQL)');
  } finally {
    client.release();
  }
}

// ============ User Operations ============
async function createUser(email, phone, passwordHash, name) {
  const result = await pool.query(
    'INSERT INTO users (email, phone, password_hash, name, credits) VALUES ($1, $2, $3, $4, 0) RETURNING id',
    [email || null, phone || null, passwordHash, name || '']
  );
  return getUserById(result.rows[0].id);
}

async function getUserById(id) {
  const result = await pool.query(
    'SELECT id, email, phone, name, credits, is_beta, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function getUserByLogin(login) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 OR phone = $1',
    [login]
  );
  return result.rows[0] || null;
}

async function isBetaUser(userId) {
  const result = await pool.query(
    'SELECT is_beta FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] && result.rows[0].is_beta === 1;
}

async function ensureBetaUser(email, passwordHash, name) {
  const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    await pool.query(
      'UPDATE users SET password_hash = $1, is_beta = 1, name = $2 WHERE email = $3',
      [passwordHash, name, email]
    );
    return getUserById(existing.rows[0].id);
  }
  const result = await pool.query(
    'INSERT INTO users (email, phone, password_hash, name, credits, is_beta) VALUES ($1, NULL, $2, $3, 0, 1) RETURNING id',
    [email, passwordHash, name]
  );
  return getUserById(result.rows[0].id);
}

// ============ Credits Operations ============
async function getCredits(userId) {
  const result = await pool.query(
    'SELECT credits FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] ? result.rows[0].credits : 0;
}

async function deductCredit(userId, amount = 1) {
  const result = await pool.query(
    'UPDATE users SET credits = credits - $1 WHERE id = $2 AND credits >= $1',
    [amount, userId]
  );
  return result.rowCount > 0;
}

async function addCredits(userId, amount) {
  await pool.query(
    'UPDATE users SET credits = credits + $1 WHERE id = $2',
    [amount, userId]
  );
  return getCredits(userId);
}

// ============ Report Operations ============
async function saveReport(userId, data) {
  const result = await pool.query(`
    INSERT INTO reports (user_id, photo_path, photo_mime, photo_width, photo_height, ideal_photo_path, height, weight, skin_type, style_preference, score, keywords, report_data, image_description, ideal_description, report_type)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING id
  `, [
    userId,
    data.photoPath || null,
    data.photoMime || null,
    data.photoWidth || null,
    data.photoHeight || null,
    data.idealPhotoPath || null,
    data.height || null,
    data.weight || null,
    data.skinType || null,
    data.stylePreference || null,
    data.score || null,
    JSON.stringify(data.keywords || []),
    JSON.stringify(data.reportData || {}),
    data.imageDescription || null,
    data.idealDescription || null,
    data.reportType || 'basic',
  ]);
  return getReportById(result.rows[0].id);
}

async function getReportById(id) {
  const result = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
  if (result.rows[0]) {
    const row = result.rows[0];
    row.keywords = JSON.parse(row.keywords || '[]');
    row.report_data = JSON.parse(row.report_data || '{}');
    return row;
  }
  return null;
}

async function getReportsByUserId(userId) {
  const result = await pool.query(
    'SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows.map(row => {
    row.keywords = JSON.parse(row.keywords || '[]');
    row.report_data = JSON.parse(row.report_data || '{}');
    return row;
  });
}

async function getReportCount(userId) {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM reports WHERE user_id = $1',
    [userId]
  );
  return parseInt(result.rows[0].count);
}

// ============ Share Operations ============
async function setShareToken(reportId, token) {
  await pool.query(
    'UPDATE reports SET share_token = $1 WHERE id = $2',
    [token, reportId]
  );
  return getReportById(reportId);
}

async function revokeShareToken(reportId) {
  await pool.query(
    'UPDATE reports SET share_token = NULL WHERE id = $1',
    [reportId]
  );
  return getReportById(reportId);
}

async function getReportByShareToken(token) {
  const result = await pool.query('SELECT * FROM reports WHERE share_token = $1', [token]);
  if (result.rows[0]) {
    const row = result.rows[0];
    row.keywords = JSON.parse(row.keywords || '[]');
    row.report_data = JSON.parse(row.report_data || '{}');
    return row;
  }
  return null;
}

// ============ Feedback Operations ============
async function saveFeedback(userId, rating, content) {
  const result = await pool.query(
    'INSERT INTO feedback (user_id, rating, content) VALUES ($1, $2, $3) RETURNING id',
    [userId, rating, content]
  );
  return getFeedbackById(result.rows[0].id);
}

async function getFeedbackById(id) {
  const result = await pool.query('SELECT * FROM feedback WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function getFeedbackByUserId(userId) {
  const result = await pool.query(
    'SELECT * FROM feedback WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

// ============ Order Operations ============
async function createOrder(userId, orderNo, amount) {
  const result = await pool.query(
    'INSERT INTO orders (user_id, order_no, amount) VALUES ($1, $2, $3) RETURNING id',
    [userId, orderNo, amount]
  );
  return getOrderById(result.rows[0].id);
}

async function getOrderById(id) {
  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function getOrderByOrderNo(orderNo) {
  const result = await pool.query('SELECT * FROM orders WHERE order_no = $1', [orderNo]);
  return result.rows[0] || null;
}

async function updateOrderStatus(orderNo, status, transactionId) {
  if (transactionId) {
    await pool.query(
      'UPDATE orders SET status = $1, transaction_id = $2, paid_at = CURRENT_TIMESTAMP WHERE order_no = $3',
      [status, transactionId, orderNo]
    );
  } else {
    await pool.query(
      'UPDATE orders SET status = $1, paid_at = CURRENT_TIMESTAMP WHERE order_no = $2',
      [status, orderNo]
    );
  }
  return getOrderByOrderNo(orderNo);
}

async function updateOrderNote(orderId, note) {
  await pool.query(
    'UPDATE orders SET alipay_note = $1 WHERE id = $2',
    [note || '', orderId]
  );
  return getOrderById(orderId);
}

module.exports = {
  pool,
  init,
  createUser,
  getUserById,
  getUserByLogin,
  isBetaUser,
  ensureBetaUser,
  getCredits,
  deductCredit,
  addCredits,
  saveReport,
  getReportById,
  getReportsByUserId,
  getReportCount,
  setShareToken,
  revokeShareToken,
  getReportByShareToken,
  saveFeedback,
  getFeedbackById,
  getFeedbackByUserId,
  createOrder,
  getOrderById,
  getOrderByOrderNo,
  updateOrderStatus,
  updateOrderNote,
};
