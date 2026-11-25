#!/usr/bin/env node
/* Export the season data used by the server and the static generators. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/data.js'), 'utf8'), ctx);

const out = {};
for (const season of Object.values(ctx.window.GLOW.seasons)) out[season.id] = season;
if (Object.keys(out).length !== 12) throw new Error('expected 12 seasons');
fs.writeFileSync(path.join(ROOT, 'data/seasons.json'), JSON.stringify(out, null, 2) + '\n');
console.log('wrote data/seasons.json');
