import puppeteer from 'puppeteer-core';
const CHROME = '/Users/y/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.167/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });

// 1) Idle test: static board (no bot) should not spin requestAnimationFrame from the particle loop.
const p1 = await browser.newPage();
await p1.evaluateOnNewDocument(() => {
  window.__raf = 0;
  const orig = window.requestAnimationFrame;
  window.requestAnimationFrame = (cb) => { window.__raf++; return orig(cb); };
});
await p1.goto('http://localhost:5173/?level=1', { waitUntil: 'networkidle2' });
await p1.waitForSelector('.mahjong-tile', { timeout: 10000 });
await sleep(800);
await p1.evaluate(() => { window.__raf = 0; });   // reset after initial layout settles
await sleep(2000);
const idleRaf = await p1.evaluate(() => window.__raf);
console.log(`IDLE (static board, 2s): requestAnimationFrame calls = ${idleRaf}  -> ${idleRaf < 30 ? 'PASS (loop idles)' : 'FAIL (still spinning ~60fps)'}`);

// Now fire a match burst and confirm the loop wakes (rAF count climbs).
await p1.evaluate(() => {
  window.__raf = 0;
  const ids = [...document.querySelectorAll('[data-tile-id]')].slice(0, 2).map(e => e.getAttribute('data-tile-id'));
  window.dispatchEvent(new CustomEvent('tile-match', { detail: { id1: ids[0], id2: ids[1], mult: 3 } }));
});
await sleep(700);
const burstRaf = await p1.evaluate(() => window.__raf);
console.log(`BURST (after tile-match, 0.7s): requestAnimationFrame calls = ${burstRaf}  -> ${burstRaf > 10 ? 'PASS (loop woke)' : 'FAIL (burst did not animate)'}`);
await sleep(1500);
const afterRaf = await p1.evaluate(() => { const v = window.__raf; window.__raf = 0; return v; });
await sleep(1500);
const settledRaf = await p1.evaluate(() => window.__raf);
console.log(`SETTLE (1.5s after sparks die): requestAnimationFrame calls = ${settledRaf}  -> ${settledRaf < 30 ? 'PASS (idled again)' : 'FAIL (kept spinning)'}`);
await p1.close();

// 2) Regression: bot still wins level 1 (match events + particles intact).
const p2 = await browser.newPage();
let consoleErr = 0;
p2.on('console', m => { if (m.type() === 'error') { consoleErr++; console.log('CONSOLE-ERR:', m.text()); } });
await p2.goto('http://localhost:5173/?bot=1&level=1', { waitUntil: 'networkidle2' });
await p2.waitForSelector('.mahjong-tile', { timeout: 10000 });
let won = false;
const deadline = Date.now() + 120000;
while (Date.now() < deadline) { if (await p2.$('.victory-modal')) { won = true; break; } await sleep(1000); }
console.log(`REGRESSION (bot solves level 1): ${won ? 'PASS (win)' : 'FAIL (no win)'}, console errors = ${consoleErr}`);
await p2.close();

await browser.close();
