// Beta-test sweep for Vita Mahjong (age-14plus / Legends edition).
// Plays the game like an end user across menus, modals, gameplay, boosters,
// timer-pause, reduced motion, the daily challenge, and every filter realm.
// Screenshots land in /tmp/qa_shots. Run: node qa/beta_sweep.mjs
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4175';
const CHROME = '/Users/y/.cache/puppeteer/chrome-headless-shell/mac_arm-148.0.7778.167/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const SHOTS = '/tmp/qa_shots';
fs.mkdirSync(SHOTS, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let failures = 0;
const check = (name, ok, note = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${note ? '  ' + note : ''}`);
  if (!ok) failures++;
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const newPage = async (w = 1280, h = 900) => {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  return { page, errors };
};

// ---------- 1. Menu + modals ----------
{
  const { page, errors } = await newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 30000 });
  check('menu renders', !!(await page.$('.main-menu-container')));
  check('no Continue button on fresh profile', !(await page.$('.continue-game-btn')));
  await page.screenshot({ path: `${SHOTS}/sweep_menu.png` });

  // How To Play modal
  await page.click('[aria-label="How to play help"]');
  await sleep(300);
  check('How To Play opens', !!(await page.$('.how-to-play-modal')));
  await page.click('.how-to-play-modal .confirm-btn');
  await sleep(300);

  // Achievements modal
  await page.click('[aria-label="View achievements"]');
  await sleep(300);
  check('Achievements opens', !!(await page.$('.achievements-modal')));
  const badgeCount = await page.evaluate(() => document.querySelectorAll('.achievement-badge-card').length);
  check('achievement badges listed', badgeCount >= 5, `${badgeCount} badges`);
  await page.click('.achievements-modal .confirm-btn');
  await sleep(300);

  // Settings modal + level dropdown
  await page.click('[aria-label="Settings"]');
  await sleep(300);
  check('Settings opens', !!(await page.$('#level-select-dropdown')));
  check('no console errors (menu+modals)', errors.length === 0, errors.slice(0, 2).join(' | '));
  await page.close();
}

// ---------- 2. Timer pauses while hidden ----------
{
  const { page, errors } = await newPage();
  await page.goto(BASE + '/?level=1', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('.mahjong-tile.free', { timeout: 10000 });
  await sleep(2500);
  const t1 = await page.$eval('.header-timer', e => e.textContent.trim());
  // Simulate the tab being hidden (handler reads document.hidden)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await sleep(3000);
  const t2 = await page.$eval('.header-timer', e => e.textContent.trim());
  check('timer freezes while hidden', t1 === t2, `${t1} -> ${t2} after 3s hidden`);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await sleep(2500);
  const t3 = await page.$eval('.header-timer', e => e.textContent.trim());
  check('timer resumes when visible', t3 !== t2, `${t2} -> ${t3}`);
  check('no console errors (timer pause)', errors.length === 0, errors.slice(0, 2).join(' | '));
  await page.close();
}

// ---------- 3. Filter realms render (bloodmoon 75, abyss 85, aurora 95) ----------
for (const [level, realmName] of [[75, 'Blood Moon'], [85, 'Sunken Abyss'], [95, 'Aurora Veil']]) {
  const { page, errors } = await newPage(420, 900);
  await page.goto(`${BASE}/?level=${level}`, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('.mahjong-tile', { timeout: 10000 });
  await sleep(1200);
  const progress = await page.$eval('.progress-bar-text', e => e.textContent).catch(() => '');
  check(`level ${level} realm is ${realmName}`, progress.includes(realmName), progress.trim());
  const artCount = await page.evaluate(() => document.querySelectorAll('.tile-art').length);
  check(`level ${level} tile art loaded`, artCount > 50, `${artCount} art imgs`);
  await page.screenshot({ path: `${SHOTS}/sweep_realm_${level}.png` });
  check(`no console errors (level ${level})`, errors.length === 0, errors.slice(0, 2).join(' | '));
  await page.close();
}

// ---------- 4. Reduced motion: matches still work, no shake ----------
{
  const { page, errors } = await newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(BASE + '/?bot=1&level=1', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('.mahjong-tile', { timeout: 10000 });
  await sleep(6000);
  const cleared = await page.evaluate(() =>
    document.querySelectorAll('.mahjong-tile.matched').length);
  check('reduced-motion: matches work', cleared > 0, `${cleared} tiles cleared`);
  const shaking = await page.evaluate(() => !!document.querySelector('.combo-shake'));
  check('reduced-motion: no board shake class', !shaking);
  check('no console errors (reduced motion)', errors.length === 0, errors.slice(0, 2).join(' | '));
  await page.close();
}

// ---------- 5. Full victory flow on a filter realm (bot, level 75) ----------
{
  const { page, errors } = await newPage();
  await page.goto(BASE + '/?bot=1&level=75', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('.mahjong-tile', { timeout: 10000 });
  const won = await page.waitForSelector('.victory-modal', { timeout: 300000, visible: true })
    .then(() => true).catch(() => false);
  check('bot clears bloodmoon level 75', won);
  if (won) {
    await page.screenshot({ path: `${SHOTS}/sweep_victory_75.png` });
    const stars = await page.evaluate(() => document.querySelectorAll('.victory-stars .star-earned').length);
    check('stars awarded', stars >= 1, `${stars} stars`);
    const reward = await page.$('.reward-claim-btn');
    check('level reward offered', !!reward);
    if (reward) {
      await reward.click();
      await sleep(400);
      check('reward claim confirms', !!(await page.$('.reward-done')));
    }
    const teaser = await page.$eval('.realm-teaser', e => e.textContent).catch(() => '');
    check('next realm teased', teaser.includes('Sunken Abyss'), teaser.trim());
  }
  check('no console errors (victory 75)', errors.length === 0, errors.slice(0, 2).join(' | '));
  await page.close();
}

// ---------- 6. Daily challenge still records the streak (post-refactor) ----------
{
  const { page, errors } = await newPage();
  await page.goto(BASE + '/?bot=1&daily=1', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('.mahjong-tile', { timeout: 10000 });
  const won = await page.waitForSelector('.victory-modal', { timeout: 300000, visible: true })
    .then(() => true).catch(() => false);
  check('bot clears the daily', won);
  if (won) {
    const daily = JSON.parse(await page.evaluate(() => localStorage.getItem('vita_daily')) || '{}');
    const localDate = await page.evaluate(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    check('daily streak recorded for local date', daily.lastCompleted === localDate && daily.streak >= 1,
      `lastCompleted=${daily.lastCompleted} streak=${daily.streak}`);
  }
  check('no console errors (daily)', errors.length === 0, errors.slice(0, 2).join(' | '));
  await page.close();
}

// ---------- 7. Mobile viewport sanity ----------
{
  const { page, errors } = await newPage(390, 844);
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(800);
  await page.screenshot({ path: `${SHOTS}/sweep_mobile_menu.png` });
  const overflowX = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  check('mobile menu: no horizontal overflow', !overflowX);
  check('no console errors (mobile)', errors.length === 0, errors.slice(0, 2).join(' | '));
  await page.close();
}

await browser.close();
console.log(failures === 0 ? '\nALL SWEEP CHECKS PASSED' : `\n${failures} SWEEP CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
