#!/usr/bin/env node
/* GlowSelf static integrity check — zero dependencies. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const errors = [];
const warnings = [];
let checked = 0;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git' || name.startsWith('.')) continue;
    const abs = path.join(dir, name);
    const st = fs.statSync(abs);
    if (st.isDirectory()) walk(abs, out);
    else out.push(abs);
  }
  return out;
}

const files = walk(ROOT);
const htmlFiles = files.filter(f => f.endsWith('.html') && !f.includes(`${path.sep}data${path.sep}`));

for (const file of htmlFiles) {
  const rel = '/' + path.relative(ROOT, file).split(path.sep).join('/');
  const html = fs.readFileSync(file, 'utf8');
  checked++;
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${rel}: missing <title>`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) errors.push(`${rel}: missing meta description`);
  if (!/noindex/.test(html) && !/<link rel="canonical" href="https:\/\/glowself\.cn[^"]*"/.test(html)) errors.push(`${rel}: missing canonical`);
  if (!/og:image/.test(html)) warnings.push(`${rel}: no og:image`);
  if (/localhost|127\.0\.0\.1|example\.com/.test(html)) errors.push(`${rel}: contains localhost/example.com`);

  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1]);
  for (const ref of refs) {
    if (!ref || ref.startsWith('#') || ref.startsWith('http') || ref.startsWith('mailto:') || ref.startsWith('tel:') || ref.startsWith('data:')) continue;
    const clean = ref.split('?')[0].split('#')[0];
    if (!clean.startsWith('/')) continue;
    const target = path.join(ROOT, clean);
    if (!fs.existsSync(target)) errors.push(`${rel}: broken asset/link ${ref}`);
  }
}

// data engine
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/data.js'), 'utf8'), ctx);
const G = ctx.window.GLOW;
if (!G) errors.push('data.js: window.GLOW missing');
else {
  const seasons = Object.values(G.seasons || {});
  if (seasons.length !== 12) errors.push(`data.js: expected 12 seasons, got ${seasons.length}`);
  for (const s of seasons) {
    if (!s.id || !s.name || !s.en) errors.push(`season ${s.id}: missing id/name/en`);
    if (!Array.isArray(s.palette) || s.palette.length !== 12) errors.push(`season ${s.id}: palette must have 12`);
    if (!Array.isArray(s.formulas) || s.formulas.length < 3) errors.push(`season ${s.id}: needs 3 formulas`);
    for (const k of ['tagline', 'description', 'avoid', 'metal', 'lip', 'blush', 'eye', 'hair']) {
      if (!s[k]) errors.push(`season ${s.id}: missing ${k}`);
    }
  }
  if (Object.keys(G.archetypes || {}).length !== 6) errors.push('data.js: expected 6 archetypes');
  if (Object.keys(G.bodyTypes || {}).length !== 5) errors.push('data.js: expected 5 body types');
  if (Object.keys(G.goals || {}).length !== 5) errors.push('data.js: expected 5 goals');
  if (!Array.isArray(G.questions) || G.questions.length !== 11) errors.push('data.js: expected 11 questions');
  const r = G.analyze({ depth: 0, undertone: 'warm', metal: 'gold', hair: 'brown', eyes: 'brown', palette: 'warm', contrast: 'soft', feature: 'soft', body: 'X', goal: 'outfit', style: 'elegant' });
  if (!r || !r.season || !r.archetype) errors.push('analyze(): did not return season/archetype');
}

// generated assets
for (const p of ['assets/img/og-cover.png', 'assets/img/favicon.svg', 'assets/img/mark.svg', 'assets/css/site.css', 'server.js']) {
  if (!fs.existsSync(path.join(ROOT, p))) errors.push(`missing ${p}`);
}
const og = path.join(ROOT, 'assets/img/og');
if (!fs.existsSync(og) || fs.readdirSync(og).filter(f => f.endsWith('.png')).length !== 12) {
  errors.push('assets/img/og: expected 12 season covers');
}

// season landing pages
if (G && G.seasons) {
  for (const id of Object.keys(G.seasons)) {
    if (!fs.existsSync(path.join(ROOT, 'season', id + '.html'))) errors.push(`missing season page /season/${id}.html`);
  }
}

// face-shape guides
for (const slug of ['face-shape-guide', 'round-face', 'square-face', 'oval-face', 'long-face', 'heart-face', 'diamond-face']) {
  if (!fs.existsSync(path.join(ROOT, 'article', slug + '.html'))) errors.push(`missing face guide /article/${slug}.html`);
}

// sitemap paths
const server = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const sitemapMatch = server.match(/const SITEMAP = \[([\s\S]*?)\];/);
if (!sitemapMatch) errors.push('server.js: SITEMAP missing');
else {
  for (const m of sitemapMatch[1].matchAll(/'([^']+)'/g)) {
    const p = m[1];
    if (p.startsWith('/api')) continue;
    const target = p === '/' ? path.join(ROOT, 'index.html') : path.join(ROOT, p);
    if (!fs.existsSync(target)) errors.push(`sitemap: missing ${p}`);
  }
}

console.log(`checked ${checked} html files, ${files.length} total files`);
for (const w of warnings) console.log(`  warn  ${w}`);
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log('ok — links, meta, data and assets are consistent');
