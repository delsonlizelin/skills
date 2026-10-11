#!/usr/bin/env node
// Generate the ibm-design token layer from Carbon's open-source npm packages.
//
//   node build_tokens.mjs                 # installs @carbon/* into a temp dir, writes ../tokens
//   node build_tokens.mjs --pkgs <dir>    # reuse a dir that already has node_modules/@carbon/*
//   node build_tokens.mjs --out <dir>     # write somewhere else
//
// Tiers (see references/color.md):
//   primitive  @carbon/colors                     --ibm-<family>-<grade>
//   semantic   @carbon/themes dtcg/themes.json    --cds-<token>   (per theme)
//   component  @carbon/themes dtcg/components/*   --cds-<token>   (per theme)
//   data       @carbon/charts styles.css          --cds-charts-*  (light / dark)
// plus type (@carbon/type), spacing/layout (@carbon/layout) and motion (@carbon/motion).
//
// Values come from the packages' JS exports (fully resolved); the DTCG files add
// each token's description and the primitive it references.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const OUT = path.resolve(opt('--out') ?? path.join(HERE, '..', 'tokens'));
const PKGS = ['@carbon/themes', '@carbon/colors', '@carbon/type', '@carbon/layout', '@carbon/motion', '@carbon/charts'];

let pkgDir = opt('--pkgs');
if (!pkgDir) {
  pkgDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ibm-design-tokens-'));
  console.log(`installing ${PKGS.join(' ')} → ${pkgDir}`);
  execFileSync('npm', ['init', '-y'], { cwd: pkgDir, stdio: 'ignore' });
  execFileSync('npm', ['i', '--silent', '--ignore-scripts', '--no-audit', '--no-fund', ...PKGS], { cwd: pkgDir, stdio: 'inherit' });
}
const req = createRequire(path.join(path.resolve(pkgDir), 'package.json'));
const modDir = (p) => path.join(path.resolve(pkgDir), 'node_modules', p);
const version = (p) => JSON.parse(fs.readFileSync(path.join(modDir(p), 'package.json'), 'utf8')).version;
const versions = Object.fromEntries(PKGS.map((p) => [p, version(p)]));

const themesPkg = req('@carbon/themes');
const { colors } = req('@carbon/colors');
const type = req('@carbon/type');
const layout = req('@carbon/layout');
const motion = req('@carbon/motion');

const THEMES = ['white', 'g10', 'g90', 'g100'];
const COMPONENT_THEME_KEY = { white: 'whiteTheme', g10: 'g10', g90: 'g90', g100: 'g100' };
const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const kebab = (s) => s.replace(/([a-z])([A-Z0-9])/g, '$1-$2').replace(/([0-9])([A-Z])/g, '$1-$2').toLowerCase();

// ── primitive ────────────────────────────────────────────────────────────────
const FAMILIES = ['red', 'magenta', 'purple', 'blue', 'cyan', 'teal', 'green', 'gray', 'coolGray', 'warmGray', 'yellow', 'orange'];
const primitive = { black: colors.black[100] ?? '#000000', white: colors.white[0] ?? '#ffffff' };
for (const f of FAMILIES) primitive[kebab(f)] = { ...colors[f] };
const hexToPrimitive = new Map();
for (const [f, ramp] of Object.entries(primitive)) {
  if (typeof ramp === 'string') { hexToPrimitive.set(ramp.toLowerCase(), f); continue; }
  for (const [g, hex] of Object.entries(ramp)) if (!hexToPrimitive.has(hex.toLowerCase())) hexToPrimitive.set(hex.toLowerCase(), `${f}-${g}`);
}
const refName = (ref) => {
  // "{blue.60}" → "blue-60"; "{white.default}" → "white"; "{coolGray.10}" → "cool-gray-10"
  const m = /^\{([^}]+)\}$/.exec(ref ?? ''); if (!m) return null;
  const [fam, grade] = m[1].split('.');
  return grade === 'default' || grade === undefined ? kebab(fam) : `${kebab(fam)}-${grade}`;
};

// ── semantic + component (DTCG) ──────────────────────────────────────────────
function* walk(o, p = []) {
  if (o && typeof o === 'object' && o.$extensions) { yield [p, o]; return; }
  if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) if (!k.startsWith('$')) yield* walk(v, [...p, k]);
}
function readDtcg(file, tier, valueOf) {
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const out = {};
  for (const [p, leaf] of walk(doc)) {
    const name = p.join('-');
    const per = leaf.$extensions['carbon.themes'];
    if (!per) continue;
    const entry = { tier, description: leaf.$description ?? '', values: {} };
    for (const th of THEMES) {
      const raw = per[th];
      const ref = typeof raw === 'string' ? raw : raw?.value;
      const alpha = typeof raw === 'object' ? raw.alpha : undefined;
      let value = valueOf(name, th);
      if (value === undefined) value = ref?.startsWith('#') ? ref : undefined;
      if (value === undefined) continue;
      const primitiveRef = refName(ref) ?? hexToPrimitive.get(String(value).toLowerCase()) ?? null;
      entry.values[th] = { value, ref: primitiveRef, ...(alpha !== undefined ? { alpha } : {}) };
    }
    if (Object.keys(entry.values).length) out[name] = entry;
  }
  return out;
}
const dtcgDir = path.join(modDir('@carbon/themes'), 'src', 'dtcg');
const semantic = readDtcg(path.join(dtcgDir, 'themes.json'), 'semantic', (name, th) => themesPkg[th][camel(name)]);

const component = {};
for (const f of fs.readdirSync(path.join(dtcgDir, 'components')).filter((f) => f.endsWith('.json'))) {
  const group = camel(f.replace('.json', '')) + 'Tokens'; // button.json → buttonTokens
  Object.assign(component, readDtcg(path.join(dtcgDir, 'components', f), 'component', (name, th) => themesPkg[group]?.[camel(name)]?.[COMPONENT_THEME_KEY[th]]));
}

// Sanity check: every semantic token in the JS theme exports should be present.
const missing = Object.keys(themesPkg.white).filter((k) => typeof themesPkg.white[k] === 'string' && /^(#|rgba?\()/.test(themesPkg.white[k]) && !semantic[kebab(k)]);
if (missing.length) {
  // Present in JS but not DTCG (rare) — include without description.
  for (const k of missing) {
    semantic[kebab(k)] = { tier: 'semantic', description: '', values: Object.fromEntries(THEMES.map((th) => [th, { value: themesPkg[th][k], ref: hexToPrimitive.get(String(themesPkg[th][k]).toLowerCase()) ?? null }])) };
  }
}

// ── data (Carbon Charts) ─────────────────────────────────────────────────────
const chartsCss = fs.readFileSync(path.join(modDir('@carbon/charts'), 'styles.css'), 'utf8');
function chartBlock(selectorTest) {
  const vals = {};
  const re = /([^{}]+)\{([^{}]*--cds-charts-14-1-1:[^{}]*)\}/g; let m;
  while ((m = re.exec(chartsCss))) {
    if (!selectorTest(m[1].trim())) continue;
    for (const [, k, v] of m[2].matchAll(/--cds-charts-([a-z0-9-]+):\s*([^;]+);/g)) if (!k.endsWith('hovered') && !k.startsWith('font')) vals[k] = v.trim();
  }
  return vals;
}
const light = chartBlock((s) => s === '.cds--chart-holder');
const dark = chartBlock((s) => /data-carbon-theme=g100/.test(s));
const data = { light: {}, dark: {} };
for (const [mode, src] of [['light', light], ['dark', dark]]) {
  const groups = {};
  for (const [k, v] of Object.entries(src)) {
    // "14-1-3" categorical, "mono-2-7" sequential, "diverge-1-12" diverging
    const parts = k.split('-'); const idx = Number(parts.pop()); const g = parts.join('-');
    (groups[g] ??= [])[idx - 1] = { value: v, ref: hexToPrimitive.get(v.toLowerCase()) ?? null };
  }
  data[mode] = groups;
}
if (!data.light['14-1']?.length || !data.dark['14-1']?.length) throw new Error('could not extract chart palettes from @carbon/charts/styles.css');

// ── type, layout, motion ─────────────────────────────────────────────────────
const typeStyles = {};
for (const [k, s] of Object.entries(type.styles)) typeStyles[kebab(k)] = s;
const spacing = Object.fromEntries(Array.from({ length: 13 }, (_, i) => [`spacing-${String(i + 1).padStart(2, '0')}`, layout[`spacing${String(i + 1).padStart(2, '0')}`]]));
const fluidSpacing = Object.fromEntries([1, 2, 3, 4].map((i) => [`fluid-spacing-0${i}`, layout[`fluidSpacing0${i}`]]));
const containers = Object.fromEntries([1, 2, 3, 4, 5].map((i) => [`container-0${i}`, layout[`container0${i}`]]));
const iconSizes = { 'icon-size-01': layout.iconSize01, 'icon-size-02': layout.iconSize02 };
const sizes = { 'size-xs': layout.sizeXSmall, 'size-sm': layout.sizeSmall, 'size-md': layout.sizeMedium, 'size-lg': layout.sizeLarge, 'size-xl': layout.sizeXLarge, 'size-2xl': layout.size2XLarge };
const durations = Object.fromEntries(['fast01', 'fast02', 'moderate01', 'moderate02', 'slow01', 'slow02'].map((k) => [`duration-${kebab(k)}`, motion[k] ?? motion[`duration${k[0].toUpperCase()}${k.slice(1)}`]]));
const easings = {};
for (const [k, v] of Object.entries(motion.easings)) for (const [mode, curve] of Object.entries(v)) easings[`easing-${k}-${mode}`] = curve;

// ── write tokens.json ────────────────────────────────────────────────────────
fs.mkdirSync(OUT, { recursive: true });
const json = {
  $meta: { generator: 'ibm-design/scripts/build_tokens.mjs', generated: new Date().toISOString().slice(0, 10), versions, themes: THEMES, defaultPair: { light: 'white', dark: 'g100' } },
  primitive, semantic, component, data,
  type: { families: type.fontFamilies, weights: type.fontWeights, scale: type.scale, styles: typeStyles },
  layout: { breakpoints: layout.breakpoints, spacing, fluidSpacing, containers, iconSizes, sizes, miniUnit: '8px' },
  motion: { durations, easings },
};
fs.writeFileSync(path.join(OUT, 'tokens.json'), JSON.stringify(json, null, 2) + '\n');

// ── write tokens.css ─────────────────────────────────────────────────────────
const header = (title) => `/* ${title}\n * Generated by ibm-design/scripts/build_tokens.mjs on ${json.$meta.generated} from ${Object.entries(versions).map(([p, v]) => `${p}@${v}`).join(', ')}.\n * Do not edit by hand — re-run the script. */\n`;
const block = (sel, lines) => `${sel} {\n${lines.map((l) => `  ${l}`).join('\n')}\n}\n`;
const themeVars = (th) => [...Object.entries(semantic), ...Object.entries(component)].filter(([, e]) => e.values[th]).map(([n, e]) => `--cds-${n}: ${e.values[th].value};`);
const dataVars = (mode) => Object.entries(data[mode]).flatMap(([g, arr]) => arr.map((c, i) => `--cds-charts-${g}-${i + 1}: ${c.value};`));

let css = header('ibm-design tokens — primitive · semantic · component · data · type · layout · motion');
css += `\n/* Tier 1 · PRIMITIVE — the IBM palette. Never reference these from UI code directly;\n   use them only to define semantic tokens or expressive accents (see color.md). */\n`;
css += block(':root', Object.entries(primitive).flatMap(([f, r]) => typeof r === 'string' ? [`--ibm-${f}: ${r};`] : Object.entries(r).map(([g, h]) => `--ibm-${f}-${g}: ${h};`)));

css += `\n/* Tier 2+3 · SEMANTIC + COMPONENT — one block per theme.\n   Default: White, switching to G100 with the OS dark setting.\n   Force a theme for the page with <html data-theme="light|dark">, or create a\n   contrast zone on any element with data-carbon-theme="white|g10|g90|g100". */\n`;
css += block(':root,\n[data-carbon-theme="white"]', [...themeVars('white'), 'color-scheme: light;']);
css += `@media (prefers-color-scheme: dark) {\n${block(':root:not([data-theme="light"])', [...themeVars('g100'), 'color-scheme: dark;']).replace(/^/gm, '  ')}}\n`;
css += block(':root[data-theme="dark"]', [...themeVars('g100'), 'color-scheme: dark;']);
for (const th of THEMES) css += block(`[data-carbon-theme="${th}"]`, [...themeVars(th), `color-scheme: ${th.startsWith('g9') || th === 'g100' ? 'dark' : 'light'};`]);
css += block('[data-carbon-theme]', ['background-color: var(--cds-background);', 'color: var(--cds-text-primary);']);

css += `\n/* Tier 4 · DATA — Carbon Charts palettes. Categorical groups "<n>-<option>" (n colors,\n   use in order), "14-1" for 6+ series, "mono-<1..4>" sequential, "diverge-<1|2>" diverging. */\n`;
css += block(':root,\n[data-carbon-theme="white"],\n[data-carbon-theme="g10"]', dataVars('light'));
css += `@media (prefers-color-scheme: dark) {\n${block(':root:not([data-theme="light"])', dataVars('dark')).replace(/^/gm, '  ')}}\n`;
css += block(':root[data-theme="dark"],\n[data-carbon-theme="g90"],\n[data-carbon-theme="g100"]', dataVars('dark'));

css += `\n/* TYPE · LAYOUT · MOTION */\n`;
const fam = type.fontFamilies;
const cjk = `'IBM Plex Sans SC', 'IBM Plex Sans TC', 'IBM Plex Sans JP', 'IBM Plex Sans KR', 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans CJK SC', 'Microsoft YaHei'`;
css += block(':root', [
  `--cds-font-sans: ${fam.sans.replace(/, system-ui/, `, ${cjk}, system-ui`)};`,
  `--cds-font-sans-condensed: ${fam.sansCondensed};`,
  `--cds-font-serif: ${fam.serif.replace(/, 'Georgia'/, `, 'IBM Plex Sans SC', 'Songti SC', 'Georgia'`)};`,
  `--cds-font-mono: ${fam.mono.replace(/, 'Menlo'/, `, 'IBM Plex Sans SC', 'Menlo'`)};`,
  `--cds-font-math: 'IBM Plex Math', 'Cambria Math', 'STIX Two Math', serif;`,
  `--cds-font-sans-arabic: 'IBM Plex Sans Arabic', ${fam.sans};`,
  `--cds-font-sans-hebrew: ${fam.sansHebrew};`,
  `--cds-font-sans-devanagari: 'IBM Plex Sans Devanagari', ${fam.sans};`,
  `--cds-font-sans-thai: 'IBM Plex Sans Thai', ${fam.sans};`,
  ...Object.entries({ ...spacing, ...fluidSpacing, ...containers, ...iconSizes, ...sizes }).map(([k, v]) => `--cds-${k}: ${v};`),
  ...Object.entries(layout.breakpoints).map(([k, v]) => `--cds-breakpoint-${k}: ${v.width};`),
  ...Object.entries(durations).map(([k, v]) => `--cds-${k}: ${v};`),
  ...Object.entries(easings).map(([k, v]) => `--cds-${k}: ${v};`),
]);
fs.writeFileSync(path.join(OUT, 'tokens.css'), css);

// ── write tokens.lite.css — for single-file deliverables that must inline CSS ─
// White ↔ G100 only (plus white/g100 contrast zones), no ai/chat/syntax/tag tokens,
// the most-used data groups. Same names as tokens.css, so code works with either.
const LITE_DROP = /^(ai|chat|syntax|skeleton|toggle|shadow|content|status|tag)-/;
const liteVars = (th) => [...Object.entries(semantic), ...Object.entries(component).filter(([n]) => /^(button|notification)-/.test(n))]
  .filter(([n, e]) => !LITE_DROP.test(n + '-') && e.values[th]).map(([n, e]) => `--cds-${n}: ${e.values[th].value};`);
// all categorical groups (templates pick options like 1-4, 2-4) + main sequential/diverging
const liteData = (mode) => Object.entries(data[mode]).filter(([g]) => /^\d+-\d+$/.test(g) || ['mono-1', 'mono-2', 'mono-3', 'mono-4', 'diverge-1', 'diverge-2'].includes(g)).flatMap(([g, arr]) => arr.map((c, i) => `--cds-charts-${g}-${i + 1}: ${c.value};`));
let lite = header('ibm-design tokens LITE — White ↔ G100 (+ G10/G90 zones), core semantic + button/notification + data palettes; no ai/chat/syntax/tag tokens');
lite += block(':root', Object.entries(primitive).flatMap(([f, r]) => typeof r === 'string' ? [`--ibm-${f}: ${r};`] : Object.entries(r).map(([g, h]) => `--ibm-${f}-${g}: ${h};`)));
lite += block(':root,\n[data-carbon-theme="white"]', [...liteVars('white'), ...liteData('light'), 'color-scheme: light;']);
lite += `@media (prefers-color-scheme: dark) {\n${block(':root:not([data-theme="light"])', [...liteVars('g100'), ...liteData('dark'), 'color-scheme: dark;']).replace(/^/gm, '  ')}}\n`;
lite += block(':root[data-theme="dark"],\n[data-carbon-theme="g100"]', [...liteVars('g100'), ...liteData('dark'), 'color-scheme: dark;']);
lite += block('[data-carbon-theme="g10"]', [...liteVars('g10'), ...liteData('light'), 'color-scheme: light;']);
lite += block('[data-carbon-theme="g90"]', [...liteVars('g90'), ...liteData('dark'), 'color-scheme: dark;']);
lite += block('[data-carbon-theme]', ['background-color: var(--cds-background);', 'color: var(--cds-text-primary);']);
lite += css.slice(css.indexOf('/* TYPE · LAYOUT · MOTION */'));
fs.writeFileSync(path.join(OUT, 'tokens.lite.css'), lite);

// ── write type.css (Carbon's own class names: .cds--type-<token>) ────────────
const bpMin = Object.fromEntries(Object.entries(layout.breakpoints).map(([k, v]) => [k, v.width]));
const decl = (s) => Object.entries(s).filter(([k]) => k !== 'breakpoints').map(([k, v]) => {
  const prop = kebab(k);
  if (k === 'fontFamily') return `font-family: ${String(v).includes('Mono') ? 'var(--cds-font-mono)' : String(v).includes('Serif') ? 'var(--cds-font-serif)' : 'var(--cds-font-sans)'};`;
  return `${prop}: ${typeof v === 'number' && k === 'letterSpacing' ? `${v}px` : v};`;
});
let tcss = header('ibm-design type sets — productive, expressive and fluid styles from @carbon/type');
tcss += `/* Fluid styles interpolate between the Carbon breakpoints sm ${bpMin.sm} · md ${bpMin.md} · lg ${bpMin.lg} · xlg ${bpMin.xlg} · max ${bpMin.max}. */\n`;
// Fluid styles reproduce Carbon's `fluid-type-size` mixin (@carbon/type scss/_styles.scss): from each
// breakpoint that defines a size, font-size interpolates linearly to the NEXT breakpoint that defines one:
//   calc(min + Δsize * ((100vw - minVW) / ΔVW)), with sizes/widths in rem; after the last one it's fixed.
const BP_ORDER = ['sm', 'md', 'lg', 'xlg', 'max'];
const num = (v) => parseFloat(v);
function fluidSize(s, name) {
  const at = name === 'sm' ? s : s.breakpoints[name] ?? {};
  const min = at.fontSize ?? s.fontSize, minVW = layout.breakpoints[name].width;
  const next = BP_ORDER.slice(BP_ORDER.indexOf(name) + 1).find((b) => s.breakpoints[b]);
  if (!next) return `font-size: ${min};`;
  const max = s.breakpoints[next].fontSize ?? s.fontSize, maxVW = layout.breakpoints[next].width;
  return `font-size: calc(${min} + ${+(num(max) - num(min)).toFixed(4)} * ((100vw - ${minVW}) / ${+(num(maxVW) - num(minVW)).toFixed(4)}));`;
}
for (const [n, s] of Object.entries(typeStyles)) {
  if (!s.breakpoints) { tcss += block(`.cds--type-${n}`, decl(s)); continue; }
  tcss += block(`.cds--type-${n}`, [...decl(s), fluidSize(s, 'sm')]);
  for (const bp of BP_ORDER.filter((b) => s.breakpoints[b])) {
    const props = decl(s.breakpoints[bp]).filter((d) => !d.startsWith('font-size'));
    tcss += `@media (min-width: ${bpMin[bp]}) {\n${block(`.cds--type-${n}`, [...props, fluidSize(s, bp)]).replace(/^/gm, '  ')}}\n`;
  }
}
for (const [w, v] of Object.entries(type.fontWeights)) tcss += block(`.cds--type-${w}`, [`font-weight: ${v};`]);
tcss += block('.cds--type-italic', ['font-style: italic;']);
tcss += block('.cds--type-sans', ['font-family: var(--cds-font-sans);']);
tcss += block('.cds--type-sans-condensed', ['font-family: var(--cds-font-sans-condensed);']);
tcss += block('.cds--type-serif', ['font-family: var(--cds-font-serif);']);
tcss += block('.cds--type-mono', ['font-family: var(--cds-font-mono);']);
fs.writeFileSync(path.join(OUT, 'type.css'), tcss);

// ── write TOKENS.md (the agent-readable reference) ───────────────────────────
const cell = (e, th) => { const v = e.values[th]; if (!v) return '—'; const a = v.alpha !== undefined ? ` α${v.alpha}` : ''; return v.ref ? `\`${v.ref}\`${a}` : `\`${v.value}\``; };
let md = `# Token reference (generated)\n\nGenerated ${json.$meta.generated} from ${Object.entries(versions).map(([p, v]) => `\`${p}@${v}\``).join(', ')} by \`scripts/build_tokens.mjs\`. Do not edit — re-run the script.\n\n`;
md += `CSS: \`var(--cds-<token>)\`. Cells show the **primitive** each theme maps the token to (\`α\` = opacity). Hex values are in \`tokens.json\` / \`tokens.css\`.\n\n`;
const groupBy = (obj) => Object.entries(obj).reduce((acc, [n, e]) => { (acc[n.split('-')[0]] ??= []).push([n, e]); return acc; }, {});
for (const [title, obj] of [['Semantic tokens', semantic], ['Component tokens', component]]) {
  md += `## ${title}\n\n`;
  for (const [g, rows] of Object.entries(groupBy(obj))) {
    md += `### ${g}\n\n| token | white | g10 | g90 | g100 | use |\n|---|---|---|---|---|---|\n`;
    for (const [n, e] of rows) md += `| \`${n}\` | ${THEMES.map((th) => cell(e, th)).join(' | ')} | ${e.description.replace(/\|/g, '\\|').replace(/\s+/g, ' ')} |\n`;
    md += '\n';
  }
}
md += `## Data palettes\n\n| group | light | dark |\n|---|---|---|\n`;
for (const g of Object.keys(data.light)) md += `| \`${g}\` | ${data.light[g].map((c) => c.ref ?? c.value).join(' → ')} | ${(data.dark[g] ?? []).map((c) => c.ref ?? c.value).join(' → ')} |\n`;
md += `\n## Primitive palette\n\n| family | ${['10', '20', '30', '40', '50', '60', '70', '80', '90', '100'].join(' | ')} |\n|---|${'---|'.repeat(10)}\n`;
for (const [f, r] of Object.entries(primitive)) if (typeof r !== 'string') md += `| ${f} | ${Object.values(r).map((h) => `\`${h}\``).join(' | ')} |\n`;
md += `\nblack \`${primitive.black}\` · white \`${primitive.white}\`\n`;
md += `\n## Type styles\n\n| class | family | size | line-height | weight | letter-spacing | fluid |\n|---|---|---|---|---|---|---|\n`;
for (const [n, s] of Object.entries(typeStyles)) md += `| \`.cds--type-${n}\` | ${String(s.fontFamily ?? 'sans').match(/Plex (\w+)/)?.[1] ?? 'Sans'} | ${s.fontSize} | ${s.lineHeight} | ${s.fontWeight ?? "—"} | ${s.letterSpacing ?? 0} | ${s.breakpoints ? Object.entries(s.breakpoints).map(([b, o]) => `${b}:${o.fontSize ?? ''}`).join(' ') : ''} |\n`;
md += `\n## Layout & motion\n\n`;
md += `Spacing: ${Object.entries(spacing).map(([k, v]) => `\`${k}\` ${v}`).join(' · ')}\n\n`;
md += `Breakpoints: ${Object.entries(layout.breakpoints).map(([k, v]) => `\`${k}\` ≥${v.width} (${v.columns} cols, margin ${v.margin})`).join(' · ')}\n\n`;
md += `Durations: ${Object.entries(durations).map(([k, v]) => `\`${k}\` ${v}`).join(' · ')}\n\n`;
md += `Easings: ${Object.entries(easings).map(([k, v]) => `\`${k}\` ${v}`).join(' · ')}\n`;
fs.writeFileSync(path.join(OUT, 'TOKENS.md'), md);

console.log(`wrote ${OUT}: tokens.json, tokens.css, tokens.lite.css, type.css, TOKENS.md — ${Object.keys(semantic).length} semantic, ${Object.keys(component).length} component, ${Object.keys(data.light).length} data groups, ${Object.keys(typeStyles).length} type styles`);
