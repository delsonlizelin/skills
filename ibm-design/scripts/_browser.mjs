// Shared helper: launch the local Chrome/Chromium through puppeteer-core.
// puppeteer-core is installed on first use into ~/.cache/ibm-design (no browser download).
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const CACHE = path.join(os.homedir(), '.cache', 'ibm-design');

function puppeteer() {
  const pkg = path.join(CACHE, 'node_modules', 'puppeteer-core');
  if (!fs.existsSync(pkg)) {
    fs.mkdirSync(CACHE, { recursive: true });
    if (!fs.existsSync(path.join(CACHE, 'package.json'))) fs.writeFileSync(path.join(CACHE, 'package.json'), '{"name":"ibm-design-cache","private":true}');
    console.error('installing puppeteer-core into ~/.cache/ibm-design (one time)…');
    execFileSync('npm', ['i', '--silent', '--no-audit', '--no-fund', 'puppeteer-core@24'], { cwd: CACHE, stdio: 'inherit' });
  }
  return createRequire(path.join(CACHE, 'package.json'))('puppeteer-core');
}

export function chromePath() {
  const c = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const hit = c.find((p) => fs.existsSync(p));
  if (!hit) throw new Error('No Chrome/Chromium found. Set CHROME_PATH.');
  return hit;
}

export const toUrl = (p) => (/^https?:|^file:/.test(p) ? p : pathToFileURL(path.resolve(p)).href);

export async function withPage({ width = 1440, height = 900, scale = 1, colorScheme = 'light' } = {}, fn) {
  const browser = await puppeteer().launch({ executablePath: chromePath(), headless: true, args: ['--hide-scrollbars', '--font-render-hinting=none'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: scale });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: colorScheme }]);
    return await fn(page);
  } finally {
    await browser.close();
  }
}

export async function load(page, target) {
  await page.goto(toUrl(target), { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
}
