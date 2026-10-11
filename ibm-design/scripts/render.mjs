#!/usr/bin/env node
// Render an HTML page to PNG or PDF with local Chrome, after web fonts have loaded.
//
//   node render.mjs page.html out.png                          # 1440 wide, full page, @2x
//   node render.mjs page.html out.png --width 390 --scale 2.77  # PHONE long image: designed at 390, exported 1080 px wide
//   node render.mjs page.html out.png --width 1440 --parts 4000 # also write out.part1.png… ≤4000 device px each (phone delivery)
//   node render.mjs page.html frame.png --frame 1920x1080       # fixed canvas (one slide / video frame), @1x
//   node render.mjs deck.html deck.pdf --frame 1920x1080        # PDF, one page per .ibm-slide/.slide (page count is checked)
//   node render.mjs deck.html 'slides/slide-%d.png' --slides    # every .ibm-slide/.slide as its own PNG, one Chrome launch
//   node render.mjs page.html out.png --dark                    # prefers-color-scheme: dark (no effect if the page pins data-theme)
//   node render.mjs page.html out.png --selector '.chart'       # one element
//   node render.mjs page.html out.png --click '#revoke' --wait 300            # capture a state after a click
//   node render.mjs page.html out.png --eval "document.querySelector('dialog').showModal()" --frame 1440x900
//
// Tall pages are captured in chunks and stitched (Chrome can't capture >16384 device px in one shot).
import fs from 'node:fs';
import path from 'node:path';
import { withPage, load } from './_browser.mjs';

const a = process.argv.slice(2);
const [src, out] = a;
if (!src || !out) { console.error('usage: render.mjs <page.html|url> <out.png|out.pdf|pattern-%d.png> [--width N] [--scale N] [--frame WxH] [--dark] [--selector CSS] [--slides] [--parts H] [--click CSS] [--eval JS] [--wait MS]'); process.exit(2); }
const opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const has = (k) => a.includes(k);
const frame = opt('--frame');
const [fw, fh] = frame ? frame.split('x').map(Number) : [];
const slides = has('--slides');
const width = fw ?? (slides ? 1920 : Number(opt('--width', 1440)));
const height = fh ?? (slides ? 1080 : 900);
const scale = Number(opt('--scale', frame || slides ? 1 : 2));
const selector = opt('--selector');
const SLIDE_SEL = '.ibm-slide, .slide';
const MAX_DEVICE = 16000;   // stay under Chrome's 16384 capture limit
const MAX_CANVAS = 32000;   // stitched PNG height limit (canvas)

async function prepare(page) {
  await load(page, src);
  if (opt('--click')) { await page.click(opt('--click')); }
  if (opt('--eval')) { await page.evaluate(opt('--eval')); }
  if (opt('--wait')) { await new Promise((r) => setTimeout(r, Number(opt('--wait')))); }
  await page.evaluate(() => { window.scrollTo(0, 0); return document.fonts.ready; });
}

async function stitch(page, chunks, w, h) {
  // draw chunk PNGs onto one canvas inside Chrome, return PNG base64
  return page.evaluate(async (chunks, w, h) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d');
    for (const { y, b64 } of chunks) {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); ctx.drawImage(img, 0, y);
    }
    return c.toDataURL('image/png').split(',')[1];
  }, chunks, w, h);
}

async function fullPage(page, file) {
  const { W, H } = await page.evaluate(() => ({ W: document.documentElement.scrollWidth, H: Math.ceil(document.documentElement.scrollHeight) }));
  const devH = Math.round(H * scale), devW = Math.round(W * scale);
  if (devH <= MAX_DEVICE) { await page.screenshot({ path: file, fullPage: true, captureBeyondViewport: true }); return [file]; }
  // chunked capture; neutralise sticky/fixed so they don't repeat in every chunk
  await page.evaluate(() => { for (const el of document.querySelectorAll('body *')) { const p = getComputedStyle(el).position; if (p === 'sticky' || p === 'fixed') el.style.setProperty('position', p === 'sticky' ? 'relative' : 'absolute', 'important'); } });
  const step = Math.floor(MAX_DEVICE / scale / 2) ; const chunks = [];
  for (let y = 0; y < H; y += step) {
    const hh = Math.min(step, H - y);
    const b64 = await page.screenshot({ clip: { x: 0, y, width: W, height: hh }, captureBeyondViewport: true, encoding: 'base64' });
    chunks.push({ y: Math.round(y * scale), b64 });
  }
  const files = [];
  if (devH <= MAX_CANVAS) {
    const blank = await page.browser().newPage();
    fs.writeFileSync(file, Buffer.from(await stitch(blank, chunks, devW, devH), 'base64')); files.push(file);
    await blank.close();
  } else {
    console.error(`note: ${devH} device px is taller than one PNG can hold; writing parts instead (lower --scale for one file)`);
  }
  return { files, chunks, devW, devH };
}

function splitParts(page, chunks, devW, devH, file, partH) {
  return (async () => {
    const blank = await page.browser().newPage(); const out = []; let n = 1;
    for (let top = 0; top < devH; top += partH, n++) {
      const h = Math.min(partH, devH - top);
      const b64 = await blank.evaluate(async (chunks, w, top, h) => {
        const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d');
        for (const { y, b64 } of chunks) { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); ctx.drawImage(img, 0, y - top); }
        return c.toDataURL('image/png').split(',')[1];
      }, chunks, devW, top, h);
      const f = file.replace(/\.png$/i, `.part${n}.png`); fs.writeFileSync(f, Buffer.from(b64, 'base64')); out.push(f);
    }
    await blank.close(); return out;
  })();
}

await withPage({ width, height, scale, colorScheme: has('--dark') ? 'dark' : 'light' }, async (page) => {
  await prepare(page);
  const pinned = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  if (has('--dark') && pinned) console.error(`note: page pins data-theme="${pinned}", so --dark has no effect`);
  let written = [];
  if (out.endsWith('.pdf')) {
    const n = await page.evaluate((s) => document.querySelectorAll(s).length, SLIDE_SEL);
    await page.pdf(frame
      ? { path: out, width: `${fw}px`, height: `${fh}px`, printBackground: true, preferCSSPageSize: true }
      : { path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
    const pages = (fs.readFileSync(out, 'latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length;
    written = [out];
    console.log(`pdf pages: ${pages}${frame && n ? ` · slides in page: ${n}${pages !== n ? '  ✗ MISMATCH — check @page { size: ' + fw + 'px ' + fh + 'px; margin: 0 } and break-after: page on each slide' : '  ✓'}` : ''}`);
  } else if (slides) {
    const els = await page.$$(SLIDE_SEL);
    if (!els.length) throw new Error(`no ${SLIDE_SEL} elements`);
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
    for (let i = 0; i < els.length; i++) { const f = out.includes('%d') ? out.replace('%d', String(i + 1)) : out.replace(/\.png$/i, `-${i + 1}.png`); await els[i].screenshot({ path: f }); written.push(f); }
  } else if (selector) {
    await page.evaluate(() => { for (const el of document.querySelectorAll('body *')) { const p = getComputedStyle(el).position; if (p === 'sticky' || p === 'fixed') el.style.setProperty('position', 'relative', 'important'); } });
    const el = await page.$(selector);
    if (!el) throw new Error(`selector not found: ${selector}`);
    await el.screenshot({ path: out }); written = [out];
  } else if (frame) {
    await page.screenshot({ path: out }); written = [out];
  } else {
    const r = await fullPage(page, out);
    if (Array.isArray(r)) written = r;
    else {
      written = r.files;
      if (!r.files.length || opt('--parts')) written.push(...await splitParts(page, r.chunks, r.devW, r.devH, out, Number(opt('--parts', 8000))));
    }
    if (opt('--parts') && Array.isArray(r)) {
      // small page but parts requested: re-capture as chunks
      const { W, H } = await page.evaluate(() => ({ W: document.documentElement.scrollWidth, H: Math.ceil(document.documentElement.scrollHeight) }));
      const b64 = fs.readFileSync(out).toString('base64');
      written.push(...await splitParts(page, [{ y: 0, b64 }], Math.round(W * scale), Math.round(H * scale), out, Number(opt('--parts'))));
    }
  }
  const fonts = await page.evaluate(() => [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}${f.style === 'italic' ? 'i' : ''}`))]);
  console.log(`rendered ${written.join(', ')} (${width}${frame || slides ? `x${height}` : ''} @${scale}x) · web fonts: ${fonts.length ? fonts.slice(0, 10).join(', ') + (fonts.length > 10 ? ` +${fonts.length - 10}` : '') : 'none (local fonts)'}`);
});
