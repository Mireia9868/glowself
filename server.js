'use strict';

const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4173);
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.ndjson');
const LEADS_FILE = path.join(DATA_DIR, 'leads.ndjson');
const LEADS_WEBHOOK = process.env.LEADS_WEBHOOK_URL || '';

const SEASONS = require('./data/seasons.json');

const STYLES = {
  elegant: '温婉优雅', cool: '清冷知性', sweet: '甜酷灵动',
  natural: '自然松弛', retro: '复古文艺', minimal: '极简现代'
};

const SITEMAP = [
  '/',
  '/test.html',
  '/pricing.html',
  '/about.html',
  '/privacy.html',
  '/terms.html',
  '/article/index.html',
  '/article/color-season-test.html',
  '/article/fangyuan-face-hairstyle.html',
  '/article/capsule-wardrobe.html',
  '/article/color-analysis-worth-it.html',
  '/season/index.html',
  '/season/soft-autumn.html',
  '/season/warm-autumn.html',
  '/season/deep-autumn.html',
  '/season/light-spring.html',
  '/season/warm-spring.html',
  '/season/clear-spring.html',
  '/season/soft-summer.html',
  '/season/cool-summer.html',
  '/season/light-summer.html',
  '/season/clear-winter.html',
  '/season/cool-winter.html',
  '/season/deep-winter.html',
  '/article/face-shape-guide.html',
  '/article/round-face.html',
  '/article/square-face.html',
  '/article/oval-face.html',
  '/article/long-face.html',
  '/article/heart-face.html',
  '/article/diamond-face.html'
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2'
};

const rateBuckets = new Map();
function rateLimit(ip, limit, windowMs) {
  const now = Date.now();
  const key = ip + ':' + Math.floor(now / windowMs);
  const count = (rateBuckets.get(key) || 0) + 1;
  rateBuckets.set(key, count);
  if (rateBuckets.size > 5000) {
    for (const [k] of rateBuckets) {
      if (!k.endsWith(':' + Math.floor(now / windowMs))) rateBuckets.delete(k);
    }
  }
  return count <= limit;
}

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket.remoteAddress || 'unknown';
}

function sendJson(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
    'Cache-Control': 'no-store'
  });
  res.end(data);
}

function readBody(req, limit = 16384) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error('payload too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch (e) { reject(Object.assign(new Error('invalid json'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

function cleanString(value, max) {
  return String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

function isEmail(value) {
  return /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(String(value || ''));
}

async function appendJsonl(file, record) {
  await fsp.mkdir(path.dirname(file), { recursive: true });
  await fsp.appendFile(file, JSON.stringify(record) + '\n', 'utf8');
}

async function readJsonl(file) {
  try {
    const raw = await fsp.readFile(file, 'utf8');
    return raw.split('\n').filter(Boolean).map(line => {
      try { return JSON.parse(line); } catch (e) { return null; }
    }).filter(Boolean);
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

async function handleEvent(req, res) {
  if (!rateLimit(clientIp(req), 180, 60_000)) return sendJson(res, 429, { ok: false, error: 'rate_limited' });
  const body = await readBody(req, 8192);
  const name = cleanString(body.name, 64);
  if (!name) return sendJson(res, 400, { ok: false, error: 'name_required' });
  const props = body.props && typeof body.props === 'object' && !Array.isArray(body.props) ? body.props : {};
  const record = {
    ts: new Date().toISOString(),
    name,
    props,
    sessionId: cleanString(body.sessionId, 64),
    path: cleanString(body.path, 200),
    referrer: cleanString(body.referrer, 300).slice(0, 300),
    ip: clientIp(req).slice(0, 64),
    ua: cleanString(req.headers['user-agent'], 200)
  };
  await appendJsonl(EVENTS_FILE, record);
  sendJson(res, 200, { ok: true });
}

async function handleLead(req, res) {
  if (!rateLimit(clientIp(req), 20, 60_000)) return sendJson(res, 429, { ok: false, error: 'rate_limited' });
  const body = await readBody(req, 16384);
  const intent = cleanString(body.intent, 48);
  const email = cleanString(body.email, 200).toLowerCase();
  const allowed = new Set(['plus_trial', 'free_report', 'result_feedback', 'account_email', 'consult', 'notify']);
  if (!allowed.has(intent)) return sendJson(res, 400, { ok: false, error: 'invalid_intent' });
  if (!email && intent !== 'result_feedback') return sendJson(res, 400, { ok: false, error: 'email_required' });
  if (email && !isEmail(email)) return sendJson(res, 400, { ok: false, error: 'invalid_email' });

  const record = {
    ts: new Date().toISOString(),
    id: crypto.randomBytes(8).toString('hex'),
    intent,
    email,
    source: cleanString(body.source, 80),
    message: cleanString(body.message, 1000),
    uid: cleanString(body.uid, 64),
    ref: cleanString(body.ref, 64),
    result: body.result && typeof body.result === 'object' ? {
      seasonId: cleanString(body.result.seasonId, 32),
      styleId: cleanString(body.result.styleId, 32),
      goal: cleanString(body.result.answers && body.result.answers.goal, 32)
    } : null,
    ip: clientIp(req).slice(0, 64),
    ua: cleanString(req.headers['user-agent'], 200)
  };
  await appendJsonl(LEADS_FILE, record);

  if (LEADS_WEBHOOK) {
    fetch(LEADS_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    }).catch(() => {});
  }
  sendJson(res, 200, { ok: true, id: record.id });
}

async function handleStats(req, res, url) {
  const key = url.searchParams.get('key') || '';
  if (!ADMIN_KEY || key !== ADMIN_KEY) return sendJson(res, 404, { ok: false });
  const days = Math.min(90, Math.max(1, Number(url.searchParams.get('days') || 7)));
  const since = Date.now() - days * 86400_000;
  const events = (await readJsonl(EVENTS_FILE)).filter(e => Date.parse(e.ts) >= since);
  const leads = (await readJsonl(LEADS_FILE)).filter(e => Date.parse(e.ts) >= since);
  const byName = {};
  const sessions = new Set();
  for (const e of events) {
    byName[e.name] = (byName[e.name] || 0) + 1;
    if (e.sessionId) sessions.add(e.sessionId);
  }
  const byIntent = {};
  for (const l of leads) byIntent[l.intent] = (byIntent[l.intent] || 0) + 1;
  sendJson(res, 200, {
    ok: true,
    days,
    events: events.length,
    sessions: sessions.size,
    byName,
    leads: leads.length,
    byIntent
  });
}

function injectShareMeta(html, season, style, url) {
  const title = `我是「${season.name} · ${style}」，这是我的色彩 DNA｜GlowSelf`;
  const desc = season.tagline + ' 不用上传照片，11 个问题找到你的色彩与风格。';
  const image = `https://glowself.cn/assets/img/og/${encodeURIComponent(season.id)}.png`;
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${desc}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${desc}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
    .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${image}">`);
}

function sitemapXml() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = SITEMAP.map(p => `  <url><loc>https://glowself.cn${p}</loc><lastmod>${today}</lastmod><changefreq>${p === '/' ? 'daily' : 'monthly'}</changefreq><priority>${p === '/' ? '1.0' : p.startsWith('/article/') ? '0.7' : '0.8'}</priority></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/') rel = '/index.html';
  const abs = path.resolve(ROOT, '.' + rel);
  if (!abs.startsWith(ROOT + path.sep)) return sendJson(res, 403, { ok: false, error: 'forbidden' });
  let stat;
  try { stat = await fsp.stat(abs); } catch (e) { stat = null; }
  if (!stat && !path.extname(abs)) {
    try {
      const htmlAbs = abs + '.html';
      const htmlStat = await fsp.stat(htmlAbs);
      if (htmlStat.isFile()) return serveFile(req, res, htmlAbs, htmlStat);
    } catch (e) {}
  }
  if (!stat || !stat.isFile()) {
    const notFound = path.join(ROOT, '404.html');
    try {
      const html = await fsp.readFile(notFound, 'utf8');
      res.writeHead(404, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
      return res.end(html);
    } catch (e) {
      return sendJson(res, 404, { ok: false, error: 'not_found' });
    }
  }
  return serveFile(req, res, abs, stat);
}

async function serveFile(req, res, abs, stat) {
  const ext = path.extname(abs).toLowerCase();
  const isHtml = ext === '.html';
  const etag = `"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`;
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, { ETag: etag });
    return res.end();
  }
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': stat.size,
    'ETag': etag,
    'Cache-Control': isHtml || ext === '.css' || ext === '.js' ? 'no-cache' : 'public, max-age=86400',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
  res.writeHead(200, headers);
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(abs).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const started = Date.now();
  const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const p = url.pathname;
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, { 'Allow': 'GET, HEAD, POST, OPTIONS' });
      return res.end();
    }
    if (p === '/api/health') return sendJson(res, 200, { status: 'ok', time: new Date().toISOString(), version: 'v2' });
    if (p === '/api/events' && req.method === 'POST') return await handleEvent(req, res);
    if (p === '/api/leads' && req.method === 'POST') return await handleLead(req, res);
    if (p === '/api/stats' && req.method === 'GET') return await handleStats(req, res, url);
    if (p === '/season' || p === '/season/') {
      res.writeHead(301, { Location: '/season/index.html', 'Cache-Control': 'public, max-age=3600' });
      return res.end();
    }
    if (p === '/article' || p === '/article/') {
      res.writeHead(301, { Location: '/article/index.html', 'Cache-Control': 'public, max-age=3600' });
      return res.end();
    }
    if (p === '/robots.txt') {
      res.writeHead(200, { 'Content-Type': MIME['.txt'], 'Cache-Control': 'public, max-age=3600' });
      return res.end('User-agent: *\nAllow: /\nDisallow: /app.html\nDisallow: /result.html\nDisallow: /api/\nSitemap: https://glowself.cn/sitemap.xml\n');
    }
    if (p === '/sitemap.xml') {
      res.writeHead(200, { 'Content-Type': MIME['.xml'], 'Cache-Control': 'public, max-age=3600' });
      return res.end(sitemapXml());
    }
    const share = p.match(/^\/r\/([a-z-]+)\/([a-z-]+)\/?$/);
    if (share) {
      const season = SEASONS[share[1]];
      const style = STYLES[share[2]];
      if (!season || !style) {
        res.writeHead(302, { Location: '/' });
        return res.end();
      }
      const html = await fsp.readFile(path.join(ROOT, 'result.html'), 'utf8');
      const body = injectShareMeta(html, { ...season, id: share[1] }, style, 'https://glowself.cn' + p);
      res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'public, max-age=300' });
      return res.end(body);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    return await serveStatic(req, res, p);
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error('[error]', req.method, p, err);
    if (!res.headersSent) sendJson(res, status, { ok: false, error: status === 500 ? 'internal_error' : err.message });
    else res.end();
  } finally {
    if (process.env.LOG_REQUESTS === '1') {
      console.log(`${req.method} ${p} ${res.statusCode} ${Date.now() - started}ms`);
    }
  }
});

server.listen(PORT, () => {
  console.log(`GlowSelf server on http://127.0.0.1:${PORT}`);
});

module.exports = server;
