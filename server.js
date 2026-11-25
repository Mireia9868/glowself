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
const DATABASE_URL = process.env.DATABASE_URL || '';
const DB_ENABLED = !!DATABASE_URL;

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
  '/article/diamond-face.html',
  '/article/body-shape-guide.html',
  '/article/pear-body.html',
  '/article/apple-body.html',
  '/article/hourglass-body.html',
  '/article/rectangle-body.html',
  '/article/inverted-triangle-body.html'
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.ics': 'text/calendar; charset=utf-8',
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

function cleanCampaign(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const out = {};
  ['source', 'medium', 'campaign', 'content', 'term'].forEach(key => {
    const v = cleanString(value[key], 80);
    if (v) out[key] = v;
  });
  return Object.keys(out).length ? out : null;
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


// ===== optional Postgres persistence (Neon HTTP, no extra dependency) =====
let dbReady = false;

async function dbQuery(query, params = [], timeoutMs = 5000) {
  if (!DB_ENABLED) throw new Error('db_disabled');
  const url = new URL(DATABASE_URL);
  const res = await fetch(`https://${url.host}/sql`, {
    method: 'POST',
    headers: {
      'Neon-Connection-String': DATABASE_URL,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, params }),
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!res.ok) throw new Error('db_http_' + res.status);
  const data = await res.json();
  return Array.isArray(data.rows) ? data.rows : [];
}

async function dbInit() {
  if (!DB_ENABLED) return;
  const statements = [
    `CREATE TABLE IF NOT EXISTS glow_events (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      name TEXT NOT NULL,
      session_id TEXT,
      props JSONB,
      path TEXT,
      referrer TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS glow_events_created_idx ON glow_events (created_at)`,
    `CREATE TABLE IF NOT EXISTS glow_leads (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      intent TEXT,
      email TEXT,
      source TEXT,
      message TEXT,
      uid TEXT,
      ref TEXT,
      campaign JSONB,
      result JSONB
    )`,
    `CREATE INDEX IF NOT EXISTS glow_leads_created_idx ON glow_leads (created_at)`
  ];
  for (const sql of statements) await dbQuery(sql, [], 10000);
  dbReady = true;
  console.log('db: postgres ready');
}

async function dbInsertEvent(record) {
  if (!DB_ENABLED) return;
  await dbQuery(
    `INSERT INTO glow_events (name, session_id, props, path, referrer)
     VALUES ($1, $2, $3::jsonb, $4, $5)`,
    [record.name, record.sessionId || null, JSON.stringify(record.props || {}), record.path || null, record.referrer || null]
  );
}

async function dbInsertLead(record) {
  if (!DB_ENABLED) return;
  await dbQuery(
    `INSERT INTO glow_leads (intent, email, source, message, uid, ref, campaign, result)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb)`,
    [record.intent, record.email || '', record.source || '', record.message || '', record.uid || '', record.ref || '', JSON.stringify(record.campaign || null), JSON.stringify(record.result || null)]
  );
}

function dbDaysAgo(days) {
  return `now() - ($1::int * interval '1 day')`;
}

async function dbStats(days) {
  const range = [days];
  const [byNameRows, sessionRows, dayRows, seasonRows, styleRows, refRows, referrerRows, campaignRows, intentRows, leadRows] = await Promise.all([
    dbQuery(`SELECT name, count(*)::int AS c FROM glow_events WHERE created_at >= ${dbDaysAgo()} GROUP BY name`, range),
    dbQuery(`SELECT count(distinct session_id)::int AS c FROM glow_events WHERE created_at >= ${dbDaysAgo()}`, range),
    dbQuery(`SELECT to_char(created_at AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD') AS d, count(*)::int AS c, count(distinct session_id)::int AS s FROM glow_events WHERE created_at >= ${dbDaysAgo()} GROUP BY 1`, range),
    dbQuery(`SELECT props->>'seasonId' AS k, count(*)::int AS c FROM glow_events WHERE created_at >= ${dbDaysAgo()} AND props ? 'seasonId' GROUP BY 1`, range),
    dbQuery(`SELECT props->>'styleId' AS k, count(*)::int AS c FROM glow_events WHERE created_at >= ${dbDaysAgo()} AND props ? 'styleId' GROUP BY 1`, range),
    dbQuery(`SELECT props->>'ref' AS k, count(*)::int AS c FROM glow_events WHERE created_at >= ${dbDaysAgo()} AND props ? 'ref' GROUP BY 1`, range),
    dbQuery(`SELECT referrer, count(*)::int AS c FROM glow_events WHERE created_at >= ${dbDaysAgo()} AND referrer <> '' GROUP BY referrer`, range),
    dbQuery(`SELECT coalesce(nullif(props->'campaign'->>'source',''),'未知来源') || CASE WHEN props->'campaign'->>'campaign' IS NOT NULL THEN ' / ' || (props->'campaign'->>'campaign') ELSE '' END AS label, count(*)::int AS c FROM glow_events WHERE created_at >= ${dbDaysAgo()} AND props ? 'campaign' GROUP BY 1`, range),
    dbQuery(`SELECT intent, count(*)::int AS c FROM glow_leads WHERE created_at >= ${dbDaysAgo()} GROUP BY intent`, range),
    dbQuery(`SELECT created_at, email, intent, source, message, result->>'seasonId' AS season_id FROM glow_leads WHERE created_at >= ${dbDaysAgo()} ORDER BY created_at DESC LIMIT 30`, range)
  ]);

  const byName = Object.fromEntries(byNameRows.map(r => [r.name, r.c]));
  const byIntent = Object.fromEntries(intentRows.map(r => [r.intent || '—', r.c]));
  const seasonCounts = seasonRows.filter(r => r.k).map(r => [r.k, r.c]);
  const styleCounts = styleRows.filter(r => r.k).map(r => [r.k, r.c]);
  const campaigns = Object.fromEntries(campaignRows.filter(r => r.label).map(r => [r.label, r.c]));
  const referrers = {};
  refRows.filter(r => r.k).forEach(r => { referrers['ref:' + r.k] = r.c; });
  referrerRows.forEach(r => {
    try {
      const host = new URL(r.referrer).hostname.replace(/^www\./, '');
      if (host && host !== 'glowself.cn' && host !== 'localhost') referrers[host] = (referrers[host] || 0) + r.c;
    } catch (_) {}
  });

  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const dayMap = Object.fromEntries(dayRows.map(r => [r.d, r]));
  const byDay = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86400_000).toISOString().slice(0, 10);
    byDay.push({ date: d, events: dayMap[d]?.c || 0, sessions: dayMap[d]?.s || 0 });
  }

  const maskEmail = (value) => {
    const email = String(value || '');
    const at = email.indexOf('@');
    if (at < 1) return '—';
    return email.slice(0, 1) + '***' + email.slice(at);
  };
  const recentLeads = leadRows.map(l => ({
    ts: new Date(l.created_at).toISOString(),
    email: maskEmail(l.email),
    intent: l.intent || '—',
    source: l.source || '—',
    message: l.message || '',
    seasonId: l.season_id || '—'
  }));

  return {
    ok: true,
    days,
    storage: 'postgres',
    events: Object.values(byName).reduce((a, b) => a + b, 0),
    sessions: sessionRows[0]?.c || 0,
    byName,
    leads: Object.values(byIntent).reduce((a, b) => a + b, 0),
    byIntent,
    byDay,
    topSeasons: seasonCounts.sort((a, b) => b[1] - a[1]).slice(0, 8),
    topStyles: styleCounts.sort((a, b) => b[1] - a[1]).slice(0, 8),
    topReferrers: Object.entries(referrers).sort((a, b) => b[1] - a[1]).slice(0, 8),
    topCampaigns: Object.entries(campaigns).sort((a, b) => b[1] - a[1]).slice(0, 8),
    recentLeads
  };
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
  if (DB_ENABLED) {
    try { await dbInsertEvent(record); } catch (err) { console.error('[db] event', err.message); }
  }
  sendJson(res, 200, { ok: true });
}

async function handleLead(req, res) {
  if (!rateLimit(clientIp(req), 20, 60_000)) return sendJson(res, 429, { ok: false, error: 'rate_limited' });
  const body = await readBody(req, 16384);
  const intent = cleanString(body.intent, 48);
  const email = cleanString(body.email, 200).toLowerCase();
  const allowed = new Set(['plus_trial', 'paid_plus', 'free_report', 'result_feedback', 'account_email', 'consult', 'notify']);
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
    campaign: cleanCampaign(body.campaign),
    result: body.result && typeof body.result === 'object' ? {
      seasonId: cleanString(body.result.seasonId, 32),
      styleId: cleanString(body.result.styleId, 32),
      goal: cleanString(body.result.answers && body.result.answers.goal, 32)
    } : null,
    ip: clientIp(req).slice(0, 64),
    ua: cleanString(req.headers['user-agent'], 200)
  };
  await appendJsonl(LEADS_FILE, record);
  if (DB_ENABLED) {
    try { await dbInsertLead(record); } catch (err) { console.error('[db] lead', err.message); }
  }

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
  const key = req.headers['x-admin-key'] || url.searchParams.get('key') || '';
  if (!ADMIN_KEY || key !== ADMIN_KEY) return sendJson(res, 404, { ok: false });
  const days = Math.min(90, Math.max(1, Number(url.searchParams.get('days') || 7)));
  if (DB_ENABLED) {
    try { return sendJson(res, 200, await dbStats(days)); }
    catch (err) { console.error('[db] stats', err.message); }
  }
  const since = Date.now() - days * 86400_000;
  const events = (await readJsonl(EVENTS_FILE)).filter(e => Date.parse(e.ts) >= since);
  const leads = (await readJsonl(LEADS_FILE)).filter(e => Date.parse(e.ts) >= since);
  const byName = {};
  const sessions = new Set();
  const byDay = {};
  const seasonCounts = {};
  const styleCounts = {};
  const referrers = {};
  const campaigns = {};

  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86400_000).toISOString().slice(0, 10);
    byDay[d] = { date: d, events: 0, sessions: new Set() };
  }

  for (const e of events) {
    byName[e.name] = (byName[e.name] || 0) + 1;
    if (e.sessionId) sessions.add(e.sessionId);
    const day = String(e.ts || '').slice(0, 10);
    if (byDay[day]) {
      byDay[day].events += 1;
      if (e.sessionId) byDay[day].sessions.add(e.sessionId);
    }
    const props = e.props || {};
    if (props.seasonId) seasonCounts[props.seasonId] = (seasonCounts[props.seasonId] || 0) + 1;
    if (props.styleId) styleCounts[props.styleId] = (styleCounts[props.styleId] || 0) + 1;
    if (props.ref) referrers['ref:' + props.ref] = (referrers['ref:' + props.ref] || 0) + 1;
    const c = props.campaign;
    if (c && typeof c === 'object' && (c.source || c.campaign)) {
      const label = (cleanString(c.source, 40) || '未知来源') + (c.campaign ? ' / ' + cleanString(c.campaign, 40) : '');
      campaigns[label] = (campaigns[label] || 0) + 1;
    }
    try {
      if (e.referrer) {
        const host = new URL(e.referrer).hostname.replace(/^www\./, '');
        if (host && host !== 'glowself.cn' && host !== 'localhost') referrers[host] = (referrers[host] || 0) + 1;
      }
    } catch (_) {}
  }

  const byIntent = {};
  for (const l of leads) byIntent[l.intent] = (byIntent[l.intent] || 0) + 1;
  const maskEmail = (value) => {
    const email = String(value || '');
    const at = email.indexOf('@');
    if (at < 1) return '—';
    return email.slice(0, 1) + '***' + email.slice(at);
  };
  const recentLeads = leads
    .slice()
    .sort((a, b) => String(b.ts).localeCompare(String(a.ts)))
    .slice(0, 30)
    .map(l => ({
      ts: l.ts,
      email: maskEmail(l.email),
      intent: l.intent || '—',
      source: l.source || '—',
      message: l.message || '',
      seasonId: (l.result && l.result.seasonId) || '—'
    }));

  sendJson(res, 200, {
    ok: true,
    days,
    events: events.length,
    sessions: sessions.size,
    byName,
    leads: leads.length,
    byIntent,
    byDay: Object.values(byDay).map(d => ({ date: d.date, events: d.events, sessions: d.sessions.size })),
    topSeasons: Object.entries(seasonCounts).sort((a, b) => b[1] - a[1]).slice(0, 8),
    topStyles: Object.entries(styleCounts).sort((a, b) => b[1] - a[1]).slice(0, 8),
    topReferrers: Object.entries(referrers).sort((a, b) => b[1] - a[1]).slice(0, 8),
    topCampaigns: Object.entries(campaigns).sort((a, b) => b[1] - a[1]).slice(0, 8),
    recentLeads
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
      return res.end('User-agent: *\nAllow: /\nDisallow: /app.html\nDisallow: /admin.html\nDisallow: /result.html\nDisallow: /api/\nSitemap: https://glowself.cn/sitemap.xml\n');
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

dbInit().catch(err => console.error('[db] init', err.message));

server.listen(PORT, () => {
  console.log(`GlowSelf server on http://127.0.0.1:${PORT}`);
  console.log(`storage: ${DB_ENABLED ? 'postgres' : 'ndjson'}`);
});

module.exports = server;
