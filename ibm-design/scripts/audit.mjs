#!/usr/bin/env node
// Audit a rendered page against the ibm-design rules.
//
//   node audit.mjs page.html [--dark] [--width 1440] [--view-width N] [--json]
//
// Which runs to do, by medium: web UI → light, --dark, --width 390 · long image → the width you render at
// (phone long image: --width 390) · slides/frames → --width 1920, light only (themes are pinned).
// --view-width N: the page will be SEEN at N px wide (e.g. a 1440 image viewed on a 390 phone) — text
// sizes are scaled by N/width before deciding "large text" (3:1) vs normal (4.5:1).
//
// Checks (computed styles in local Chrome, so it works on any HTML, tokens or not):
//   contrast   WCAG 2.x text contrast vs the effective background (4.5:1, 3:1 for large text) — including chart text
//   non-text   icons (svg outside charts) ≥3:1 against their background; visible focus ring when tabbing
//   fonts      every text element's first font-family is an IBM Plex family, it is available, and Han/kana/hangul
//              text has a Plex CJK face in its stack that is actually available
//   palette    every color used is an IBM palette primitive or a Carbon token value (alpha variants allowed)
//   accent     expressive hue families used outside data viz (policy: at most one besides blue)
//   layout     no horizontal scroll
// Exit code 1 if any error.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withPage, load } from './_browser.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const a = process.argv.slice(2);
const src = a[0];
if (!src) { console.error('usage: audit.mjs <page.html|url> [--dark] [--width N] [--json]'); process.exit(2); }
const opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const tokens = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'tokens', 'tokens.json'), 'utf8'));

// palette: hex → family name
const palette = {};
for (const [fam, ramp] of Object.entries(tokens.primitive)) {
  if (typeof ramp === 'string') palette[ramp.toLowerCase()] = fam;
  else for (const hex of Object.values(ramp)) palette[hex.toLowerCase()] = fam;
}
const tokenValues = new Set();
for (const tier of [tokens.semantic, tokens.component]) for (const e of Object.values(tier)) for (const v of Object.values(e.values)) tokenValues.add(String(v.value).replace(/\s+/g, '').toLowerCase());
for (const mode of Object.values(tokens.data)) for (const g of Object.values(mode)) for (const c of g) tokenValues.add(c.value.toLowerCase());

const WIDTH = Number(opt('--width', 1440));
const VIEW = Number(opt('--view-width', WIDTH));
const result = await withPage({ width: WIDTH, colorScheme: a.includes('--dark') ? 'dark' : 'light' }, async (page) => {
  await load(page, src);
  // keyboard focus: Tab through up to 40 stops and check each gets a visible indicator
  const focusIssues = [];
  // baseline (unfocused) indicator styles for every focusable element, keyed by element identity
  await page.evaluate(() => {
    window.__base = new Map(); window.__seen = new Set();
    for (const el of document.querySelectorAll('a[href], button, input, select, textarea, [tabindex], summary, [contenteditable]')) {
      const cs = getComputedStyle(el); window.__base.set(el, { o: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, b: cs.boxShadow, bc: cs.borderColor, bg: cs.backgroundColor });
    }
  });
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    const r = await page.evaluate(() => {
      const el = document.activeElement; if (!el || el === document.body) return null;
      if (window.__seen.has(el)) return { repeat: true }; window.__seen.add(el);
      const alpha = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return c === 'transparent' ? 0 : 1; const p = m[1].split(/[ ,/]+/).filter(Boolean); return p.length > 3 ? Number(p[3]) : 1; };
      const cs = getComputedStyle(el), base = window.__base.get(el) ?? {};
      const outlineNow = `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`;
      const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 1 && alpha(cs.outlineColor) > 0 && outlineNow !== base.o;  // must change on focus
      const changed = cs.boxShadow !== (base.b ?? 'none') && cs.boxShadow !== 'none';   // a shadow that only appears on focus
      const ring = outline || changed;
      let s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id; else if (el.classList.length) s += '.' + [...el.classList].slice(0, 2).join('.');
      return { s, ring };
    });
    if (!r || r.repeat) break;
    focusIssues.push(r);
  }
  await page.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo(0, 0); });
  const res = await page.evaluate((palette, tokenValues, viewFactor) => {
    const tv = new Set(tokenValues);
    const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }; };
    const hex = (c) => '#' + [c.r, c.g, c.b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');
    const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
    const ratio = (x, y) => { const [L1, L2] = [lum(x), lum(y)].sort((p, q) => q - p); return (L1 + 0.05) / (L2 + 0.05); };
    const over = (top, bottom) => ({ r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1 });
    const inViz = (el) => !!el.closest('svg, canvas, [data-viz], .cds--chart-holder, .chart, figure.viz');
    const inChart = (el) => !!el.closest('[data-viz], .cds--chart-holder, .chart, figure.viz') || (el.closest('svg') && el.closest('svg').getBoundingClientRect().width > 96);
    const label = (el) => { let s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id; else if (el.classList.length) s += '.' + [...el.classList].slice(0, 2).join('.'); return s; };

    const unverified = [];
    // SVG: the background behind chart text is often an svg shape, not a CSS background
    function svgPaintedBg(el) {
      const r = el.getBoundingClientRect(); if (!r.width) return null;
      el.scrollIntoView({ block: 'center', inline: 'center' });
      const rr = el.getBoundingClientRect(), x = rr.left + rr.width / 2, y = rr.top + rr.height / 2;
      for (const n of document.elementsFromPoint(x, y)) {
        if (n === el || el.contains(n)) continue;
        if (!(n instanceof SVGGeometryElement) || n.tagName.toLowerCase() === 'line') { if (n instanceof SVGElement) continue; break; }
        const raw = getComputedStyle(n).fill;
        if (/url\(/.test(raw)) return { unknown: true };                  // gradient / pattern paint: can't verify
        const f = parse(raw); if (!f || f.a === 0) continue;
        if (f.a >= 1) return f;
        const under = effectiveBg(n); return under.unknown ? under : over(f, under);
      }
      return null;
    }
    // first painted shape of an svg, following <use href="#symbol">
    function svgShapes(svg) {
      const direct = [...svg.querySelectorAll('path, circle, rect, polygon, ellipse')];
      if (direct.length) return direct;
      const use = svg.querySelector('use'); const href = use?.getAttribute('href') || use?.getAttribute('xlink:href') || '';
      if (!href.startsWith('#')) { if (href) unverified.push(`${label(svg.parentElement)} (external <use href="${href.slice(0, 40)}">)`); return []; }
      const sym = document.getElementById(href.slice(1));
      return sym ? [...sym.querySelectorAll('path, circle, rect, polygon, ellipse')] : [];
    }
    function shapeFill(shape, svg) {
      const own = shape.style.fill || shape.getAttribute('fill');
      if (own && !/currentColor|inherit/i.test(own)) return parse(getComputedStyle(shape).fill);
      return parse(getComputedStyle(svg).fill) ?? parse(getComputedStyle(svg).color);
    }

    function effectiveBg(el) {
      const stack = [];
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.backgroundImage && cs.backgroundImage !== 'none') return { unknown: true };
        const c = parse(cs.backgroundColor);
        if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; }
      }
      let base = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
      return base;
    }

    // font availability via width comparison against generic fallbacks
    const cv = document.createElement('canvas').getContext('2d');
    const probe = 'Hamburgefonstiv 0123 汉字';
    const avail = {};
    const available = (fam) => {
      if (fam in avail) return avail[fam];
      if (document.fonts.check(`16px "${fam}"`) && [...document.fonts].some((f) => f.family.replace(/"/g, '') === fam && f.status === 'loaded')) return (avail[fam] = true);
      return (avail[fam] = ['monospace', 'serif', 'sans-serif'].some((g) => { cv.font = `32px ${g}`; const w0 = cv.measureText(probe).width; cv.font = `32px "${fam}", ${g}`; return cv.measureText(probe).width !== w0; }));
    };

    const errors = [], warnings = [], info = {};
    const familiesUsed = new Map(), offPalette = new Map(), expressive = new Map(), cjkMissing = new Map(), tinySvg = new Map();
    const CJK = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/;
    const seen = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (t) => t.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    for (let t; (t = walker.nextNode());) {
      const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
      const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) continue;
      const sample = t.textContent.trim().slice(0, 40);
      // fonts
      const fam = cs.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
      familiesUsed.set(fam, (familiesUsed.get(fam) ?? 0) + 1);
      // svg text is scaled with its viewBox — check the size it actually renders at
      if (el instanceof SVGElement && el.getScreenCTM?.()) {
        const svgEl = el.ownerSVGElement, m = el.getScreenCTM(), k = Math.hypot(m.a, m.b);
        const px = parseFloat(cs.fontSize) * k * viewFactor;
        if (px < 11) tinySvg.set(label(svgEl.parentElement), Math.min(px, tinySvg.get(label(svgEl.parentElement)) ?? 99));
      }
      if (CJK.test(t.textContent)) {
        const stack = cs.fontFamily.split(',').map((x) => x.trim().replace(/^["']|["']$/g, ''));
        const lang = (el.closest('[lang]')?.getAttribute('lang') || document.documentElement.lang || '').toLowerCase();
        const want = /^zh-(tw|hk|mo)|hant/.test(lang) ? 'TC' : /^ja/.test(lang) ? 'JP' : /^ko/.test(lang) ? 'KR' : /^zh/.test(lang) ? 'SC' : '(SC|TC|JP|KR)';
        const firstCjk = stack.find((f) => /^IBM Plex Sans (SC|TC|JP|KR)$/.test(f));
        const okFace = firstCjk && new RegExp(`^IBM Plex Sans ${want}$`).test(firstCjk) && available(firstCjk);
        if (!okFace) cjkMissing.set(label(el), `${sample}" (lang=${lang || 'none'} needs IBM Plex Sans ${want.replace(/[()]/g, '').replace(/\|/g, '/')} first; got ${firstCjk ?? 'none'}${firstCjk && !available(firstCjk) ? ', not available' : ''})`);
      }
      // contrast — all text, including chart labels (data colors are often NOT safe for text)
      {
        const isSvg = el instanceof SVGElement;
        const fg = parse(isSvg ? cs.fill : cs.color);  // svg text is painted with fill
        let bg = effectiveBg(el);
        if (isSvg) bg = svgPaintedBg(el) ?? bg;
        if (bg.unknown) unverified.push(label(el));
        if (fg && !bg.unknown) {
          const fgc = fg.a < 1 ? over(fg, bg) : fg;
          const ctm = isSvg && el.getScreenCTM ? el.getScreenCTM() : null;
          const svgK = ctm ? Math.hypot(ctm.a, ctm.b) : 1;   // full rendered transform: viewBox + every group transform
          const size = parseFloat(cs.fontSize) * svgK * viewFactor, weight = Number(cs.fontWeight) || 400;
          const large = size >= 24 || (size >= 18.66 && weight >= 700);
          const need = large ? 3 : 4.5, got = ratio(fgc, bg);
          const disabled = el.closest('[disabled], [aria-disabled="true"]');
          if (got < need && !disabled) errors.push(`contrast ${got.toFixed(2)}:1 < ${need}:1 — ${label(el)} "${sample}" (${hex(fgc)} on ${hex(bg)})${inViz(el) ? ' [chart text: use text-primary/secondary, keep data colors for marks]' : ''}`);
        }
      }
    }
    // colors anywhere (text, backgrounds, borders, svg)
    for (const el of document.querySelectorAll('body, body *')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none') continue;
      const props = ['color', 'backgroundColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'outlineColor', 'fill', 'stroke'];
      for (const p of props) {
        if (p.startsWith('border') && parseFloat(cs[p.replace('Color', 'Width')]) === 0) continue;
        if (p === 'outlineColor' && cs.outlineStyle === 'none') continue;
        const c = parse(cs[p] ?? ''); if (!c || c.a === 0) continue;
        const h = hex(c);
        const raw = (cs[p] ?? '').replace(/\s+/g, '').toLowerCase();
        const fam = palette[h];
        if (!fam && !tv.has(h) && !tv.has(raw)) offPalette.set(h, (offPalette.get(h) ?? []).concat(label(el)).slice(0, 3));
        const isStatusUi = !!el.closest('[role="status"], [role="alert"], .ibm-notification, .ibm-tag, [data-status], .cds--inline-notification, .cds--tag, [class*="danger"], .ibm-toggle, [role="switch"], .ibm-helper--error, [aria-invalid="true"]');
        if (fam && !inViz(el) && !(isStatusUi && ['red', 'green', 'yellow', 'orange'].includes(fam)) && !['gray', 'cool-gray', 'warm-gray', 'black', 'white', 'blue'].includes(fam) && p !== 'outlineColor') {
          (expressive.get(fam) ?? expressive.set(fam, new Set()).get(fam)).add(label(el));
        }
      }
    }
    for (const [fam, n] of familiesUsed) {
      const ok = /^IBM Plex/.test(fam);
      if (!ok) errors.push(`font: ${n} text element(s) use "${fam}" — use an IBM Plex family (var(--cds-font-sans|serif|mono|sans-condensed))`);
      else if (!available(fam)) errors.push(`font: "${fam}" is not available (not loaded from the web and not installed) — load it (references/typography.md) or run scripts/install_fonts.sh`);
    }
    // non-text contrast: standalone icons (small svgs outside charts) need 3:1 against their background
    for (const svg of document.querySelectorAll('svg')) {
      const r = svg.getBoundingClientRect(); if (!r.width || r.width > 96 || inChart(svg) || svg.closest('[aria-hidden="true"]') && svg.closest('button, a') === null && false) continue;
      const cs = getComputedStyle(svg); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const shapes = svgShapes(svg); if (!shapes.length) continue;
      const fc = shapeFill(shapes[0], svg); const bg = effectiveBg(svg);
      if (!fc || fc.a === 0 || bg.unknown) continue;
      const body = fc.a < 1 ? over(fc, bg) : fc;
      const got = ratio(body, bg);
      const disabled = svg.closest('[disabled], [aria-disabled="true"]');
      // inner glyph (e.g. the "!" of warning--filled) must read against the icon body
      let glyphOk = false;
      if (shapes[1] && (shapes[1].style.fill || shapes[1].getAttribute('fill'))) {
        const ic = shapeFill(shapes[1], svg);
        if (ic && ic.a > 0 && !/none/.test(shapes[1].getAttribute('fill') || '')) {
          const g2 = ratio(ic.a < 1 ? over(ic, body) : ic, body); glyphOk = g2 >= 3 && ratio(ic, bg) >= 3;
          if (g2 < 3) warnings.push(`icon glyph ${g2.toFixed(2)}:1 < 3:1 — inner glyph vs icon body in ${label(svg.parentElement)} (${hex(ic)} on ${hex(body)}) — use var(--ibm-glyph-on-warning) on yellow`);
        }
      }
      // Carbon's warning yellow is low-contrast on light grounds by design; its dark inner glyph carries the shape
      if (got < 3 && !disabled && !glyphOk) warnings.push(`non-text contrast ${got.toFixed(2)}:1 < 3:1 — icon in ${label(svg.parentElement)} (${hex(fc)} on ${hex(bg)})`);
    }
    for (const [el, px] of tinySvg) errors.push(`legibility: chart text in ${el} renders at ${px.toFixed(2)}px (< 11px) because the svg is scaled — draw the chart at its container's width (media.md → Charts); .ibm-scroll-x only for interactive pages`);
    for (const [el, smp] of cjkMissing) errors.push(`font: CJK text in ${el} "${smp} — set lang and use the matching Plex face (base.css :lang rules); install with install_fonts.sh [--all]`);
    if (unverified.length) warnings.push(`unverified: ${unverified.length} element(s) on an image/gradient background or with external references, not checked (${[...new Set(unverified)].slice(0, 3).join(', ')}) — check by eye in the render`);
    for (const [h, where] of offPalette) warnings.push(`off-palette color ${h} on ${where.join(', ')} — use a token or an IBM palette primitive`);
    const statusFams = ['red', 'green', 'yellow', 'orange'];
    const hues = [...expressive.keys()];
    const accentHues = hues.filter((f) => !statusFams.includes(f));
    if (accentHues.length > 1) warnings.push(`accent: ${accentHues.length} expressive hue families outside data viz (${accentHues.join(', ')}) — policy is one per piece besides blue`);
    for (const f of hues.filter((f) => statusFams.includes(f))) warnings.push(`accent: status hue "${f}" used outside data viz on ${[...expressive.get(f)].slice(0, 3).join(', ')} — fine for status messages, not for decoration`);
    // layout: horizontal overflow (the page must never scroll sideways)
    const sw = document.documentElement.scrollWidth, vw = window.innerWidth;
    if (sw > vw + 1) {
      const wide = [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > vw + 1 && !e.closest('.ibm-table-wrap, pre, [data-scroll-x]')).slice(0, 3).map(label);
      errors.push(`layout: page is ${sw}px wide in a ${vw}px viewport (horizontal scroll) — widest offenders: ${wide.join(', ') || 'unknown'}`);
    }
    info.fonts = Object.fromEntries(familiesUsed);
    info.expressiveHues = Object.fromEntries([...expressive].map(([k, v]) => [k, v.size]));
    info.textElements = seen.size;
    info.pinnedTheme = document.documentElement.getAttribute('data-theme');
    return { errors, warnings, info };
  }, palette, [...tokenValues], VIEW / WIDTH);
  const noRing = focusIssues.filter((f) => !f.ring);
  for (const f of noRing.slice(0, 5)) res.errors.push(`focus: no visible focus indicator on ${f.s} when tabbing — keep the 2px var(--cds-focus) outline`);
  res.info.focusStops = focusIssues.length;
  return res;
});

if (a.includes('--json')) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`audit ${src} (${a.includes('--dark') ? 'dark' : 'light'}, ${WIDTH}px${VIEW !== WIDTH ? `, viewed at ${VIEW}px` : ''})`);
  if (a.includes('--dark') && result.info.pinnedTheme) console.log(`  note: page pins data-theme="${result.info.pinnedTheme}", so this --dark run audited that theme, not dark`);
  console.log(`  text elements: ${result.info.textElements} · fonts: ${Object.entries(result.info.fonts).map(([f, n]) => `${f}×${n}`).join(', ')}`);
  console.log(`  expressive hues outside viz: ${Object.keys(result.info.expressiveHues).join(', ') || 'none'} · focus stops checked: ${result.info.focusStops}`);
  for (const e of result.errors) console.log(`  ✗ ${e}`);
  for (const w of result.warnings) console.log(`  ! ${w}`);
  console.log(result.errors.length ? `  ${result.errors.length} error(s), ${result.warnings.length} warning(s)` : `  ✓ no errors · ${result.warnings.length} warning(s)`);
}
process.exit(result.errors.length ? 1 : 0);
