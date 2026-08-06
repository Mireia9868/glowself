const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Use configurable data directory for cloud deployment (e.g. Render persistent disk)
const DATA_DIR = process.env.DB_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'glowself.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT DEFAULT '',
    credits INTEGER DEFAULT 0,
    is_beta INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    rating INTEGER,
    content TEXT,
    status TEXT DEFAULT 'pending',
    reply TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_no TEXT UNIQUE NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    pay_url TEXT,
    transaction_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Lightweight schema migrations for already-existing databases.
// Each statement is idempotent — wrapping in try/catch keeps init atomic.
const MIGRATIONS = [
  "ALTER TABLE reports ADD COLUMN photo_mime TEXT",
  "ALTER TABLE reports ADD COLUMN photo_width INTEGER",
  "ALTER TABLE reports ADD COLUMN photo_height INTEGER",
  "ALTER TABLE users ADD COLUMN is_beta INTEGER DEFAULT 0",
  "ALTER TABLE reports ADD COLUMN report_type TEXT DEFAULT 'basic'",
  "ALTER TABLE orders ADD COLUMN alipay_note TEXT",
];
for (const sql of MIGRATIONS) {
  try { db.exec(sql); } catch (_) { /* column already exists */ }
}

// ============ User Operations ============
function createUser(email, phone, passwordHash, name) {
  const stmt = db.prepare('INSERT INTO users (email, phone, password_hash, name, credits) VALUES (?, ?, ?, ?, 0)');
  const info = stmt.run(email || null, phone || null, passwordHash, name || '');
  return getUserById(info.lastInsertRowid);
}

function getUserById(id) {
  return db.prepare('SELECT id, email, phone, name, credits, is_beta, created_at FROM users WHERE id = ?').get(id);
}

function getUserByLogin(login) {
  return db.prepare('SELECT * FROM users WHERE email = ? OR phone = ?').get(login, login);
}

function isBetaUser(userId) {
  const row = db.prepare('SELECT is_beta FROM users WHERE id = ?').get(userId);
  return row && row.is_beta === 1;
}

// Ensure the beta/test account exists with unlimited access
function ensureBetaUser(email, passwordHash, name) {
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existing) {
    // Update password and ensure beta flag is set
    db.prepare('UPDATE users SET password_hash = ?, is_beta = 1, name = ? WHERE email = ?')
      .run(passwordHash, name, email);
    return getUserById(existing.id);
  }
  const stmt = db.prepare('INSERT INTO users (email, phone, password_hash, name, credits, is_beta) VALUES (?, NULL, ?, ?, 0, 1)');
  const info = stmt.run(email, passwordHash, name);
  return getUserById(info.lastInsertRowid);
}

// ============ Credits Operations ============
function getCredits(userId) {
  const row = db.prepare('SELECT credits FROM users WHERE id = ?').get(userId);
  return row ? row.credits : 0;
}

function deductCredit(userId, amount = 1) {
  const result = db.prepare('UPDATE users SET credits = credits - ? WHERE id = ? AND credits >= ?').run(amount, userId, amount);
  return result.changes > 0;
}

function addCredits(userId, amount) {
  db.prepare('UPDATE users SET credits = credits + ? WHERE id = ?').run(amount, userId);
  return getCredits(userId);
}

// ============ Report Operations ============
function saveReport(userId, data) {
  const stmt = db.prepare(`
    INSERT INTO reports (user_id, photo_path, photo_mime, photo_width, photo_height, ideal_photo_path, height, weight, skin_type, style_preference, score, keywords, report_data, image_description, ideal_description, report_type)
    VALUES (@user_id, @photo_path, @photo_mime, @photo_width, @photo_height, @ideal_photo_path, @height, @weight, @skin_type, @style_preference, @score, @keywords, @report_data, @image_description, @ideal_description, @report_type)
  `);
  const info = stmt.run({
    user_id: userId,
    photo_path: data.photoPath || null,
    photo_mime: data.photoMime || null,
    photo_width: data.photoWidth || null,
    photo_height: data.photoHeight || null,
    ideal_photo_path: data.idealPhotoPath || null,
    height: data.height || null,
    weight: data.weight || null,
    skin_type: data.skinType || null,
    style_preference: data.stylePreference || null,
    score: data.score || null,
    keywords: JSON.stringify(data.keywords || []),
    report_data: JSON.stringify(data.reportData || {}),
    image_description: data.imageDescription || null,
    ideal_description: data.idealDescription || null,
    report_type: data.reportType || 'basic',
  });
  return getReportById(info.lastInsertRowid);
}

function getReportById(id) {
  const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
  if (row) {
    row.keywords = JSON.parse(row.keywords || '[]');
    row.report_data = JSON.parse(row.report_data || '{}');
  }
  return row;
}

function getReportsByUserId(userId) {
  const rows = db.prepare('SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  return rows.map(row => {
    row.keywords = JSON.parse(row.keywords || '[]');
    row.report_data = JSON.parse(row.report_data || '{}');
    return row;
  });
}

function getReportCount(userId) {
  return db.prepare('SELECT COUNT(*) as count FROM reports WHERE user_id = ?').get(userId).count;
}

// ============ Feedback Operations ============
function saveFeedback(userId, rating, content) {
  const stmt = db.prepare('INSERT INTO feedback (user_id, rating, content) VALUES (?, ?, ?)');
  const info = stmt.run(userId, rating, content);
  return getFeedbackById(info.lastInsertRowid);
}

function getFeedbackById(id) {
  return db.prepare('SELECT * FROM feedback WHERE id = ?').get(id);
}

function getFeedbackByUserId(userId) {
  return db.prepare('SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC').all(userId);
}

// ============ Order Operations ============
function createOrder(userId, orderNo, amount) {
  const stmt = db.prepare('INSERT INTO orders (user_id, order_no, amount) VALUES (?, ?, ?)');
  const info = stmt.run(userId, orderNo, amount);
  return getOrderById(info.lastInsertRowid);
}

function getOrderById(id) {
  return db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
}

function getOrderByOrderNo(orderNo) {
  return db.prepare('SELECT * FROM orders WHERE order_no = ?').get(orderNo);
}

function updateOrderStatus(orderNo, status, transactionId) {
  if (transactionId) {
    db.prepare('UPDATE orders SET status = ?, transaction_id = ?, paid_at = CURRENT_TIMESTAMP WHERE order_no = ?').run(status, transactionId, orderNo);
  } else {
    db.prepare('UPDATE orders SET status = ?, paid_at = CURRENT_TIMESTAMP WHERE order_no = ?').run(status, orderNo);
  }
  return getOrderByOrderNo(orderNo);
}

// Update the buyer's payment note (Alipay transaction ID / memo)
function updateOrderNote(orderId, note) {
  db.prepare('UPDATE orders SET alipay_note = ? WHERE id = ?').run(note || '', orderId);
  return getOrderById(orderId);
}

module.exports = {
  db,
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
  saveFeedback,
  getFeedbackById,
  getFeedbackByUserId,
  createOrder,
  getOrderById,
  getOrderByOrderNo,
  updateOrderStatus,
  updateOrderNote,
};
