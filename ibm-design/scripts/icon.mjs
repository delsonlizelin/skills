#!/usr/bin/env node
// Find and inline Carbon icons / IBM pictograms (both Apache-2.0) from jsDelivr, cached in ~/.cache/ibm-design.
//
//   node icon.mjs --search key                 # icons by name, friendly name, aliases, category
//   node icon.mjs --search network --pictogram # pictograms the same way
//   node icon.mjs arrow--right                 # inline SVG, fill=currentColor, 32px
//   node icon.mjs add --size 16                # 16/20/24/32; icons drawn only once (most) are the 32 drawing scaled — that's Carbon's own behaviour
//   node icon.mjs warning--filled --size 20 --inner 'var(--ibm-glyph-on-warning)'   # fill the inner "!" / "✓" of filled status icons (hex or var())
//   node icon.mjs tree --pictogram --px 160 --color '#33b1ff'    # pictogram at 160px, recoloured (for <img>, canvas, PNG)
//   node icon.mjs a b c [--pictogram] --sprite > sprite.svg      # <symbol id="icon-a">…; use with <svg><use href="#icon-a"/></svg>
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ICONS = '@carbon/icons@11.90.0', PICTOS = '@carbon/pictograms@12.86.0';
const CACHE = path.join(os.homedir(), '.cache', 'ibm-design', 'svg');
const a = process.argv.slice(2);
const VALUED = ['--size', '--search', '--px', '--color', '--inner'];
const has = (k) => a.includes(k);
const opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const picto = has('--pictogram');
const size = Number(opt('--size', 32));
const names = a.filter((x, i) => !x.startsWith('--') && !VALUED.includes(a[i - 1]));
const pkg = picto ? PICTOS : ICONS;

function curl(url) {
  // curl, not fetch: it honours HTTPS_PROXY and fails loudly on 4xx/5xx
  return execFileSync('curl', ['-fsSL', '--retry', '2', '--max-time', '120', url], { encoding: 'utf8', maxBuffer: 256 << 20, stdio: ['ignore', 'pipe', 'ignore'] });
}
function cached(file, make) {
  const f = path.join(CACHE, file);
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
  const t = make(); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, t); return t;
}
// compact searchable index built once from the package's metadata.json (the full file is ~25 MB for icons)
function index() {
  return JSON.parse(cached(`${pkg}.meta-index.json`, () => {
    const meta = JSON.parse(curl(`https://cdn.jsdelivr.net/npm/${pkg}/metadata.json`));
    return JSON.stringify(meta.icons.map((i) => ({ n: i.name, f: i.friendlyName ?? '', a: i.aliases ?? [], c: [i.category, i.subcategory].filter(Boolean).join(' / '), s: i.sizes ?? (i.assets ?? []).map((x) => x.size).filter((x) => typeof x === 'number') })));
  }));
}

if (has('--search')) {
  const term = String(opt('--search')).toLowerCase();
  const rank = (i) => i.n === term ? 0 : i.n.includes(term) ? 1 : i.f.toLowerCase().includes(term) ? 2 : i.a.some((x) => x.toLowerCase().includes(term)) ? 3 : i.c.toLowerCase().includes(term) ? 4 : 9;
  const hits = index().map((i) => [rank(i), i]).filter(([r]) => r < 9).sort((x, y) => x[0] - y[0] || x[1].n.localeCompare(y[1].n)).slice(0, 40);
  if (!hits.length) console.log(`no ${picto ? 'pictogram' : 'icon'} matching "${term}" (names, aliases and categories searched) — try a broader concept`);
  for (const [, i] of hits) console.log(`${i.n}${picto ? '' : `  [${i.s.join('/') || 32}]`}  — ${i.f}${i.a.length ? ` · ${i.a.slice(0, 6).join(', ')}` : ''}`);
  process.exit(0);
}
if (!names.length) { console.error('usage: icon.mjs <name…> [--size 16|20|24|32] [--pictogram] [--px N] [--color C] [--inner C] [--sprite] | --search <term> [--pictogram]'); process.exit(2); }

const idx = new Map(index().map((i) => [i.n, i]));
const svgs = [];
for (const n of names) {
  const meta = idx.get(n);
  if (!meta) {
    const near = [...idx.keys()].filter((k) => k.includes(n.split('--')[0])).slice(0, 6);
    console.error(`not found: ${picto ? 'pictogram' : 'icon'} "${n}"${near.length ? ` — similar: ${near.join(', ')}` : ''} — or: node icon.mjs --search <concept>${picto ? ' --pictogram' : ''}`);
    process.exit(1);
  }
  // icons: use the native artboard when Carbon drew one at this size, else the 32 drawing (Carbon scales it too)
  const art = picto ? null : (meta.s.includes(size) ? size : 32);
  const url = picto ? `https://cdn.jsdelivr.net/npm/${PICTOS}/svg/${n}.svg` : `https://cdn.jsdelivr.net/npm/${ICONS}/svg/${art}/${n}.svg`;
  let s = cached(`${picto ? 'picto' : 'icon' + art}/${n}.svg`, () => curl(url));
  s = s.replace(/<\?xml[^>]*>\s*/, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<title>[\s\S]*?<\/title>/, '').replace(/\s(id|version|x|y|style|xml:space|enable-background)="[^"]*"/g, '').replace(/xmlns:xlink="[^"]*"/, '').trim();
  const inner = opt('--inner');
  s = s.replace(/<path([^>]*?)data-icon-path="inner-path"([^>]*)\/>/g, (m, p1, p2) => {
    if (!inner) return '';                                   // drop the invisible helper path by default
    return `<path${(p1 + p2).replace(/\s(fill|opacity)="[^"]*"/g, '')} style="fill:${inner}"/>`;   // style, so var(--…) works
  });
  svgs.push([n, s]);
}

const px = opt('--px'), color = opt('--color');
if (has('--sprite')) {
  console.log('<svg xmlns="http://www.w3.org/2000/svg" style="display:none">');
  for (const [n, s] of svgs) {
    const vb = /viewBox="([^"]+)"/.exec(s)?.[1] ?? '0 0 32 32';
    console.log(`  <symbol id="${picto ? 'picto' : 'icon'}-${n}" viewBox="${vb}">${s.replace(/^<svg[^>]*>|<\/svg>$/g, '')}</symbol>`);
  }
  console.log('</svg>');
} else {
  const dim = px ?? (picto ? 64 : size);
  for (const [, s] of svgs) {
    let out = s.replace(/^<svg[^>]*?(viewBox="[^"]+")[^>]*>/, (m, vb) => `<svg xmlns="http://www.w3.org/2000/svg" ${vb} aria-hidden="true" focusable="false" fill="${color ?? 'currentColor'}" width="${dim}" height="${dim}">`);
    if (color) out = out.replace(/fill="currentColor"/g, `fill="${color}"`);
    console.log(out);
  }
}
