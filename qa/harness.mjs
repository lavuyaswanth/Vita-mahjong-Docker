// Headless QA harness for Vita Mahjong (age-14plus / Midnight edition).
// Drives the running dev server with puppeteer-core + the local chrome-headless-shell.
// Executes the automatable P0/P1 cases from qa/TEST_CASES.md and writes results.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:5173';
const CHROME = '/Users/y/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.167/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const SHOTS = '/tmp/qa_shots';
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
const rec = (id, status, note) => { results.push({ id, status, note }); console.log(`${status.padEnd(7)} ${id}  ${note}`); };

// Attach console-error + failed-request capture to a page.
function instrument(page) {
  const errors = [], failed = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('requestfailed', r => {
    const u = r.url();
    if (!u.startsWith('data:') && !u.includes('favicon')) failed.push(`${r.failure()?.errorText} ${u}`);
  });
  return { errors, failed };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Wait until selector appears (returns true) or timeout (false). No throw.
async function waitFor(page, sel, timeout) {
  try { await page.waitForSelector(sel, { timeout, visible: true }); return true; }
  catch { return false; }
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
  });

  // ---------- §1 Load & smoke + §18 branding ----------
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    const cap = instrument(page);
    await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
    const menu = await waitFor(page, '.main-menu-container', 8000);
    rec('TC-001', menu ? 'PASS' : 'FAIL', menu ? 'menu rendered' : 'no .main-menu-container');
    await page.screenshot({ path: `${SHOTS}/TC-001_menu.png` });

    const badge = await page.$eval('.version-badge', e => e.textContent).catch(() => null);
    rec('TC-003', badge === 'v0.1.0-legends' ? 'PASS' : 'FAIL', `version badge = ${JSON.stringify(badge)}`);

    const subtitle = await page.$eval('.menu-subtitle', e => e.textContent).catch(() => null);
    const branded = !!subtitle && /Ages 14\+|Legend/i.test(subtitle);
    rec('TC-249', branded ? 'PASS' : 'FAIL', `subtitle = ${JSON.stringify(subtitle)}`);
    rec('TC-254', badge === 'v0.1.0-legends' ? 'PASS' : 'FAIL', 'edition version string');

    const realm = await page.$eval('.menu-realm-badge', e => e.textContent).catch(() => null);
    rec('TC-018', realm ? 'PASS' : 'FAIL', `realm badge = ${JSON.stringify(realm)}`);

    rec('TC-002', cap.errors.length === 0 ? 'PASS' : 'FAIL', cap.errors.length ? `console errors: ${cap.errors.slice(0,3).join(' | ')}` : 'clean console on load');
    rec('TC-004', cap.failed.filter(f => /\.(png|jpg|svg|webp)/i.test(f)).length === 0 ? 'PASS' : 'FAIL',
      cap.failed.length ? `failed assets: ${cap.failed.slice(0,3).join(' | ')}` : 'menu assets loaded');
    rec('TC-011', cap.failed.filter(f => /manifest|icon|\.webmanifest/i.test(f)).length === 0 ? 'PASS' : 'FAIL', 'manifest/icons');
    await page.close();
  }

  // ---------- §3/§13 High-contrast persistence ----------
  {
    const page = await browser.newPage();
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.setItem('vita_high_contrast', 'true'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    const val = await page.evaluate(() => localStorage.getItem('vita_high_contrast'));
    rec('TC-030', val === 'true' ? 'PASS' : 'FAIL', `persisted vita_high_contrast=${val}`);
    rec('TC-200', val === 'true' ? 'PASS' : 'FAIL', 'settings survive reload');
    await page.evaluate(() => localStorage.removeItem('vita_high_contrast'));
    await page.close();
  }

  // ---------- §4/§7/§17 Bot solves a spread of levels ----------
  const levels = [1, 30, 90, 150, 240];
  const idMap = { 1: 'TC-061', 30: 'TC-113a', 90: 'TC-062', 150: 'TC-113b', 240: 'TC-063' };
  for (const lvl of levels) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    const cap = instrument(page);
    await page.goto(`${BASE}/?bot=1&level=${lvl}`, { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
    const started = await waitFor(page, '[data-tile-id]', 8000);
    const tileCount = await page.$$eval('[data-tile-id]', els => els.length).catch(() => 0);
    if (lvl === 1) {
      rec('TC-009', started ? 'PASS' : 'FAIL', `?bot=1 auto-started, ${tileCount} tiles`);
      rec('TC-065', tileCount % 2 === 0 ? 'PASS' : 'FAIL', `tile count ${tileCount} (even)`);
    }
    // Poll for victory or game-over, up to 180s.
    const deadline = Date.now() + 180000;
    let outcome = 'timeout';
    while (Date.now() < deadline) {
      const won = await page.$('.victory-modal');
      if (won) { outcome = 'win'; break; }
      const over = await page.evaluate(() => !!document.querySelector('.victory-stats') && !document.querySelector('.victory-modal') && /Game Over|No more|stuck/i.test(document.body.innerText));
      if (over) { outcome = 'gameover'; break; }
      await sleep(1000);
    }
    const id = idMap[lvl];
    rec(id, outcome === 'win' ? 'PASS' : 'FAIL', `level ${lvl}: ${outcome} (${tileCount} tiles)`);
    await page.screenshot({ path: `${SHOTS}/level_${lvl}_${outcome}.png` });
    if (lvl === 1) rec('TC-010', outcome === 'win' ? 'PASS' : 'FAIL', 'bot progresses to victory');
    if (lvl === 240) rec('TC-104', started ? 'PASS' : 'FAIL', 'level 240 loads');
    // console cleanliness during the run
    rec(`${id}-console`, cap.errors.length === 0 ? 'PASS' : 'FAIL', cap.errors.length ? `errors: ${cap.errors.slice(0,2).join(' | ')}` : 'clean');
    await page.close();
  }

  // ---------- §10 Daily challenge ----------
  {
    const page = await browser.newPage();
    const cap = instrument(page);
    await page.goto(`${BASE}/?bot=1&daily=1`, { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
    const started = await waitFor(page, '[data-tile-id]', 8000);
    rec('TC-163', started ? 'PASS' : 'FAIL', 'daily board loaded via ?daily=1');
    const deadline = Date.now() + 180000;
    let won = false;
    while (Date.now() < deadline) { if (await page.$('.victory-modal')) { won = true; break; } await sleep(1000); }
    rec('TC-175', won ? 'PASS' : 'FAIL', 'daily board solvable by bot');
    if (won) {
      const streak = await page.$eval('.victory-best', e => e.textContent).catch(() => null);
      rec('TC-166', streak && /streak|Best/i.test(streak) ? 'PASS' : 'WARN', `victory-best = ${JSON.stringify(streak)}`);
    }
    await page.screenshot({ path: `${SHOTS}/daily.png` });
    await page.close();
  }

  // ---------- §7 Determinism (same level twice) ----------
  {
    const ids1 = await collectTileIds(browser, `${BASE}/?level=50`);
    const ids2 = await collectTileIds(browser, `${BASE}/?level=50`);
    const same = ids1.length > 0 && ids1.length === ids2.length && ids1.join(',') === ids2.join(',');
    rec('TC-064', same ? 'PASS' : 'FAIL', `level 50 deterministic: ${ids1.length} vs ${ids2.length} tiles`);
  }

  // ---------- §7 Level param clamping ----------
  for (const [q, id] of [['level=0','TC-105'], ['level=241','TC-106'], ['level=abc','TC-107'], ['level=999999','TC-121']]) {
    const page = await browser.newPage();
    const cap = instrument(page);
    await page.goto(`${BASE}/?${q}`, { waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});
    // Either it loaded a valid board (autostart for numeric) or fell back to menu — both must be crash-free.
    const ok = (await waitFor(page, '[data-tile-id]', 6000)) || (await page.$('.main-menu-container'));
    const noCrash = cap.errors.length === 0;
    rec(id, ok && noCrash ? 'PASS' : 'FAIL', `?${q} → ${ok ? 'rendered' : 'nothing'}${noCrash ? '' : ' + console errors'}`);
    await page.close();
  }

  // ---------- §12 Tray capacity = 4 ----------
  {
    const page = await browser.newPage();
    await page.goto(`${BASE}/?bot=1&level=1`, { waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});
    await waitFor(page, '.tray-slot', 8000);
    const slots = await page.$$eval('.tray-slot', els => els.length).catch(() => 0);
    rec('TC-190', slots === 4 ? 'PASS' : 'FAIL', `tray renders ${slots} slots (expected 4)`);
    await page.screenshot({ path: `${SHOTS}/tray.png` });
    await page.close();
  }

  // ---------- §2 Settings modal opens ----------
  {
    const page = await browser.newPage();
    await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});
    await waitFor(page, '.main-menu-container', 8000);
    const btn = await page.$('button[aria-label="Settings"]');
    if (btn) {
      await btn.click();
      const opened = await waitFor(page, '.modal-close-btn, .settings-section', 4000);
      rec('TC-014', opened ? 'PASS' : 'FAIL', 'settings modal opened');
      await page.screenshot({ path: `${SHOTS}/settings.png` });
    } else rec('TC-014', 'FAIL', 'settings button not found');
    await page.close();
  }

  await browser.close();

  // ---------- write report ----------
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const warn = results.filter(r => r.status === 'WARN').length;
  let md = `# QA Harness Results\n\nRun: ${new Date().toISOString()}\nServer: ${BASE}\nBrowser: chrome-headless-shell (mac_arm-148)\n\n**${pass} PASS · ${fail} FAIL · ${warn} WARN** of ${results.length} automated checks. Screenshots in \`${SHOTS}\`.\n\n| ID | Status | Note |\n|----|--------|------|\n`;
  for (const r of results) md += `| ${r.id} | ${r.status} | ${r.note.replace(/\|/g, '/')} |\n`;
  fs.writeFileSync('/tmp/qa_results.md', md);
  console.log(`\n=== ${pass} PASS / ${fail} FAIL / ${warn} WARN of ${results.length} ===`);
  console.log('Report: /tmp/qa_results.md  Shots: ' + SHOTS);
}

async function collectTileIds(browser, url) {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});
  await waitFor(page, '[data-tile-id]', 8000);
  const ids = await page.$$eval('[data-tile-id]', els => els.map(e => e.getAttribute('data-tile-id')).sort()).catch(() => []);
  await page.close();
  return ids;
}

main().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
