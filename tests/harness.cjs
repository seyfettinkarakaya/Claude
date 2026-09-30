// Uçtan uca testler için ortak düzenek: statik sunucu, sahte Apps Script,
// ağ denetimi (çevrimdışı, gecikme, cevap değiştirme), sahte ses.
const { chromium } = require('playwright');
const http = require('http'); const fs = require('fs'); const path = require('path');
const { Sheet, makeEnv, D, ESKI_H, SEANS_H } = require('./fakegas.cjs');

const ROOT = path.join(__dirname, '..');
const API = 'https://script.google.com/macros/s/TEST/exec';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' };

function startServer(port) {
  const server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'text/plain' }); res.end(fs.readFileSync(p));
  });
  return new Promise((r) => server.listen(port, () => r(server)));
}

const PLAN_H = ['Tarih', 'Sıra', 'Blok', 'Tekrar', 'Mesafe', 'Stil', 'Tür', 'Açıklama', 'Hedef', 'Dinlen', 'Alet', 'Gerçek', 'Kulaç', 'Nabız', 'RPE', 'MSI', 'Not'];
/** Plan satırı: [tarih, sıra, blok, tekrar, mesafe, tür, hedef, dinlen, alet] */
const prow = (t, s, b, tk, m, tur = 'Swim', h = '01:30', d = '00:20', alet = '') => [D(t), s, b, tk, m, 'FR', tur, 'Açıklama ' + s, h, d, alet, '', '', '', '', '', ''];

/** Standart örnek: bugün (23 Eyl) 5 set, yarın 1 set, geçmiş 1 set. */
function samplePlan() {
  return [
    prow('2026-09-23', 1, 'WU', 1, 200, 'Swim', '04:00', '00:20'),
    prow('2026-09-23', 2, 'PS', 4, 50, 'Drill', '01:05', '00:15'),
    prow('2026-09-23', 3, 'MS', 4, 100, 'Swim', '01:30', '00:20'),
    prow('2026-09-23', 4, 'AS', 2, 100, 'Pull', '01:40', '00:20', 'Şamandıra'),
    prow('2026-09-23', 5, 'CD', 1, 200, 'Swim', '04:30', ''),
    prow('2026-09-24', 1, 'WU', 1, 400, 'Swim', '08:00', ''),
    prow('2026-09-20', 1, 'WU', 1, 300, 'Swim', '06:00', ''),
  ];
}

async function launch(opts = {}) {
  const env = makeEnv({ Plan: new Sheet('Plan', PLAN_H, opts.rows || samplePlan()), eski: new Sheet('eski', ESKI_H), seans: new Sheet('seans', SEANS_H) });
  const net = { offline: Boolean(opts.offline), delay: {}, override: null, calls: [], external: [] };
  const browser = opts.browser;
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 440, height: 956 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  ctx.on('request', (r) => { const u = new URL(r.url()); if (u.hostname !== 'localhost' && u.hostname !== 'script.google.com') net.external.push(r.url()); });
  await ctx.addInitScript(() => {
    window.__beeps = [];
    window.AudioContext = class {
      constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
      resume() { return Promise.resolve(); }
      createOscillator() { return { type: '', frequency: { value: 0 }, connect: (g) => g, start() { window.__beeps.push(this.frequency.value); }, stop() {} }; }
      createGain() { const f = () => {}; return { gain: { setValueAtTime: f, exponentialRampToValueAtTime: f }, connect: f }; }
    };
  });
  await ctx.route('https://script.google.com/**', async (route) => {
    const body = JSON.parse(route.request().postData());
    net.calls.push(body.action);
    if (net.offline) return route.abort('internetdisconnected');
    const ms = net.delay[body.action] || 0;
    if (ms) await new Promise((r) => setTimeout(r, ms));
    let out = net.override && net.override(body);
    if (out === 'abort') return route.abort('internetdisconnected');
    if (!out) out = env.call(body);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/INTERNET_DISCONNECTED|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.clock.install({ time: new Date(opts.time || '2026-09-23T07:00:00') });
  await page.goto(`http://localhost:${opts.port}/`);
  if (opts.configured !== false) {
    await page.evaluate((api) => localStorage.setItem('ysk.config', JSON.stringify({ apiUrl: api, token: 'secret' })), API);
    if (opts.storage) await page.evaluate((s) => { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, JSON.stringify(v)); }, opts.storage);
    await page.reload();
  }
  const h = helpers(page);
  return { env, net, ctx, page, errors, ...h, close: () => ctx.close() };
}

function helpers(page) {
  const h = {
    screen: () => page.evaluate(() => { const s = [...document.querySelectorAll('.screen')].find((e) => !e.hidden); return s && s.id.replace('screen-', ''); }),
    waitScreen: (name, timeout = 8000) => page.waitForSelector(`#screen-${name}:not([hidden])`, { timeout }),
    text: (sel) => page.$eval(sel, (e) => e.textContent.replace(/\s+/g, ' ').trim()),
    ls: (k) => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), k),
    session: () => page.evaluate(() => JSON.parse(localStorage.getItem('ysk.session'))),
    /** Aktif kartın başlığı (stil·tür eki olmadan): "4 × 100" */
    title: () => page.$eval('.w-item.is-active .w-title', (e) => e.firstChild.textContent.trim()),
    /** Büyük düğmeye dokunur, sonra saati sec saniye ilerletir (2 sn korumasını aşmak için). */
    async tap(sec = 0) { await page.click('#btn-main'); if (sec) { await page.clock.fastForward(sec * 1000); await page.clock.runFor(250); } },
    async adv(sec) { await page.clock.fastForward(sec * 1000); await page.clock.runFor(250); },
    label: () => page.textContent('#btn-main-label'),
    sub: () => page.textContent('#btn-main-sub'),
    events: () => page.evaluate(() => JSON.parse(localStorage.getItem('ysk.session')).events.map((e) => e.t + (e.set != null ? e.set : ''))),
    /** Seans sonuna (RPE → Ağrı yok → Özet) ‹ ile erken bitirerek gider. */
    async finishToOzet(rpe = 7) {
      await page.click('#prog-back');
      await h.waitModal('İdmanı bitir?');
      await h.modalClick('İdmanı bitir ve kaydet');
      await h.waitScreen('rpe');
      await page.click(`#rpe-grid button[data-v="${rpe}"]`);
      await h.waitScreen('msi');
      await page.click('#msi-none');
      await h.waitScreen('ozet');
    },
    activeIdx: () => page.evaluate(() => [...document.querySelectorAll('.w-item')].findIndex((e) => e.classList.contains('is-active'))),
    center: (sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }),
    async tapAt(p) { await page.mouse.click(p.x, p.y); },
    async modalClick(label) { await page.click(`#modal-actions button:has-text("${label}")`); },
    async waitModal(title) { await page.waitForSelector(`#modal:not([hidden]) >> text=${title}`, { timeout: 8000 }); },
    async openToday() {
      await h.waitScreen('home');
      await page.click('#home-swim');
      await h.waitScreen('days');
      await page.waitForFunction(() => !document.getElementById('days-today-bar').hidden);
      await page.click('#days-today-btn');
      await h.waitScreen('program');
      await page.waitForSelector('.w-item.is-active');
    },
    async goTo(target) {
      const r = await h.center('#wheel');
      await page.mouse.move(r.x, r.y);
      for (let k = 0; k < 20 && (await h.activeIdx()) !== target; k++) {
        await page.mouse.wheel(0, (await h.activeIdx()) > target ? -60 : 60);
        await page.waitForTimeout(420);
      }
      await page.waitForTimeout(350);
      if ((await h.activeIdx()) !== target) throw new Error(`tekerlek ${target}. sete gelmedi`);
    },
    async hold(sel, ms) {
      const p = await h.center(sel);
      await page.mouse.move(p.x, p.y); await page.mouse.down();
      await page.clock.runFor(ms); await page.mouse.up();
    },
  };
  return h;
}

/** Senaryoları sırayla çalıştırır; her biri temiz bir tarayıcı bağlamında. */
async function runScenarios(title, scenarios, port) {
  const server = await startServer(port);
  const browser = await chromium.launch();
  const t0 = Date.now();
  let failed = 0;
  for (const [name, fn] of scenarios) {
    const t = Date.now();
    let s;
    try {
      await fn({ launch: (o = {}) => launch({ ...o, browser, port }).then((x) => (s = x)) });
      if (s && s.errors.length) throw new Error('Sayfa hataları: ' + s.errors.join(' | '));
      if (s && s.net.external.length) throw new Error('Dış istek: ' + s.net.external.join(', '));
      console.log(`  ✓ ${name} (${((Date.now() - t) / 1000).toFixed(1)} sn)`);
    } catch (e) {
      failed++;
      console.log(`  ✗ ${name}\n    ${(e && e.stack || e).toString().split('\n').slice(0, 4).join('\n    ')}`);
    } finally {
      if (s) await s.close().catch(() => {});
    }
  }
  await browser.close(); server.close();
  console.log(`${title}: ${scenarios.length - failed}/${scenarios.length} senaryo geçti (${((Date.now() - t0) / 1000).toFixed(0)} sn)`);
  if (failed) process.exit(1);
}

module.exports = { launch, runScenarios, prow, samplePlan, API, D };
