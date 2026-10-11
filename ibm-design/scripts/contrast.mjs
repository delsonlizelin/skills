#!/usr/bin/env node
// WCAG contrast between two colors given as hex, IBM primitives or Carbon tokens.
//
//   node contrast.mjs purple-60 white
//   node contrast.mjs text-secondary background --theme g100
//   node contrast.mjs '#6929c4' layer-01 --theme g10
//   node contrast.mjs --accent purple            # which grades of a family pass on each theme
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const T = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'tokens', 'tokens.json'), 'utf8'));
const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const theme = opt('--theme', 'white');

function resolve(x, th = theme) {
  if (/^#[0-9a-f]{6}$/i.test(x)) return x;
  if (T.primitive[x] && typeof T.primitive[x] === 'string') return T.primitive[x];
  const m = /^([a-z-]+)-(\d{2,3})$/.exec(x);
  if (m && T.primitive[m[1]]?.[m[2]]) return T.primitive[m[1]][m[2]];
  const tok = T.semantic[x] ?? T.component[x];
  if (tok?.values[th]) { const v = tok.values[th].value; if (v.startsWith('#')) return v; throw new Error(`${x} is translucent in ${th} (${v}); pass a hex`); }
  throw new Error(`unknown color "${x}"`);
}
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (h) => { const [r, g, b] = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (x, y) => { const [L1, L2] = [lum(x), lum(y)].sort((p, q) => q - p); return (L1 + 0.05) / (L2 + 0.05); };
const verdict = (r) => (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA-large/UI' : 'fail');

if (a[0] === '--accent') {
  const fam = a[1]; const ramp = T.primitive[fam];
  if (!ramp || typeof ramp === 'string') { console.error(`unknown family ${fam}`); process.exit(2); }
  console.log(`${fam} on each theme background — text needs 4.5 (AA), large text / graphics 3`);
  console.log('grade  ' + T.$meta.themes.map((t) => t.padEnd(16)).join(''));
  for (const [g, h] of Object.entries(ramp)) {
    console.log(`${g.padEnd(6)} ` + T.$meta.themes.map((t) => { const r = ratio(h, resolve('background', t)); return `${r.toFixed(2).padStart(5)} ${verdict(r).padEnd(10)}`; }).join(''));
  }
} else {
  const [f, b] = a.filter((x, i) => !x.startsWith('--') && a[i - 1] !== '--theme');
  if (!f || !b) { console.error('usage: contrast.mjs <fg> <bg> [--theme white|g10|g90|g100] | --accent <family>'); process.exit(2); }
  const fh = resolve(f), bh = resolve(b); const r = ratio(fh, bh);
  console.log(`${f} ${fh} on ${b} ${bh} (${theme}): ${r.toFixed(2)}:1 ${verdict(r)}`);
}
