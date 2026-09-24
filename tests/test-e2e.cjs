const assert = require('assert');
const { chromium } = require('playwright');
const http = require('http'); const fs = require('fs'); const path = require('path');
const { Sheet, makeEnv, D, ESKI_H, SEANS_H } = require('./fakegas.cjs');

const ROOT = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  const type = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png' }[path.extname(p)] || 'text/plain';
  res.writeHead(200, { 'Content-Type': type }); res.end(fs.readFileSync(p));
});

(async () => {
  await new Promise(r => server.listen(8123, r));
  const H = ['Tarih','Sıra','Blok','Tekrar','Mesafe','Stil','Tür','Açıklama','Hedef','Dinlen','Alet','Gerçek','Kulaç','Nabız','RPE','MSI','Not'];
  const row = (t,s,b,tk,m,st,tur,a,h,d,al) => [D(t),s,b,tk,m,st,tur,a,h,d,al,'','','','','',''];
  const long = 'Her 25 metrede nefes düzeni 3-5-7, son 25 metre hızlı; dönüşlerde su altı dolfin vuruşu en az 5 adet olacak.';
  const rows = [];
  for (let i = 1; i <= 8; i++) rows.push(row('2026-09-23', i, ['WU','PS','MS','MS','MS','AS','CD','CD'][i-1], i%2?1:4, i%2?200:100, 'FR', ['Swim','Pull','Drill'][i%3], i===3? long : 'Rahat', '01:30', '00:20', i===2?'Şamandıra':''));
  rows.push(row('2026-09-24',1,'WU',1,400,'FR','Swim','','','',''));
  rows.push(row('2026-09-20',1,'WU',1,300,'FR','Swim','','','',''));
  const env = makeEnv({ Plan: new Sheet('Plan', H, rows), eski: new Sheet('eski', ESKI_H), seans: new Sheet('seans', SEANS_H) });

  let offline = false; let calls = [];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  await ctx.route('https://script.test/**', async route => {
    if (offline) return route.abort('internetdisconnected');
    const body = JSON.parse(route.request().postData()); calls.push(body.action);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(env.call(body)) });
  });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type()==='error' && !/INTERNET_DISCONNECTED/.test(m.text())) errors.push(m.text()); });
  await page.clock.install({ time: new Date('2026-09-23T07:00:00') });
  await page.goto('http://localhost:8123/');

  // Kurulum
  await page.waitForSelector('#screen-setup:not([hidden])');
  await page.fill('#setup-url', 'https://script.test/exec');
  await page.fill('#setup-token', 'wrong');
  await page.click('#setup-save');
  await page.waitForSelector('#setup-msg:not([hidden])');
  assert.match(await page.textContent('#setup-msg'), /Anahtar hatalı/);
  await page.fill('#setup-token', 'secret');
  await page.click('#setup-save');

  // Gün seçimi
  await page.waitForSelector('.day-card');
  const cards = await page.$$eval('.day-card', els => els.map(e => ({ t: e.querySelector('.day-date').textContent, cls: e.className, meta: e.querySelector('.day-meta').textContent })));
  console.log('Kartlar:', JSON.stringify(cards));
  assert.strictEqual(cards[0].t, '23 Eylül Çarşamba'); assert.match(cards[0].cls, /is-today/);
  assert.strictEqual(cards[1].t, '24 Eylül Perşembe');
  assert.match(cards[2].cls, /is-past/);
  assert.strictEqual(await page.textContent('.section-title'), 'Geçmiş planlar');
  assert.ok(await page.isVisible('#days-today-btn'));
  await page.click('#days-today-btn');

  // Program ekranı
  await page.waitForSelector('#screen-program:not([hidden]) .w-item.is-active');
  await page.waitForTimeout(100);
  const info = await page.evaluate(() => {
    const a = document.querySelector('.w-item.is-active');
    const r = a.getBoundingClientRect(); const w = document.getElementById('wheel').getBoundingClientRect();
    const btns = [...document.querySelectorAll('#screen-program button')].map(b => { const q = b.getBoundingClientRect(); return [b.id || b.textContent, Math.round(q.width), Math.round(q.height)]; });
    return { title: a.querySelector('.w-title').textContent, font: parseFloat(getComputedStyle(a.querySelector('.w-main')).fontSize), top: r.top, bottom: r.bottom, wTop: w.top, wBottom: w.bottom, btns, count: document.getElementById('prog-count').textContent, dist: document.getElementById('prog-dist').textContent, docW: document.documentElement.scrollWidth };
  });
  console.log('Program:', JSON.stringify(info));
  assert.strictEqual(info.title, '200 FR'); assert.ok(info.font >= 40);
  assert.ok(info.top >= info.wTop && info.bottom <= info.wBottom, 'aktif kart tekerleğe sığmalı');
  for (const [n, w, h] of info.btns) assert.ok(w >= 60 && h >= 60, `dokunma hedefi küçük: ${n} ${w}x${h}`);
  assert.strictEqual(info.count, '0 / 8'); assert.ok(info.docW <= 440);

  // Başla, tamamla → sonraki sete geç
  await page.click('#btn-session');
  assert.strictEqual(await page.textContent('#btn-session'), 'İdmanı Bitir');
  await page.click('#btn-complete');
  await page.waitForTimeout(800);
  assert.strictEqual(await page.textContent('.w-item.is-active .w-title'), '4 × 100 FR');
  assert.strictEqual(await page.textContent('#prog-count'), '1 / 8');
  // Sürükleyerek 3 set aşağı kaydır (atalet dahil)
  const wb = await page.$eval('#wheel', e => { const r = e.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; });
  await page.mouse.move(wb.x, wb.y); await page.mouse.down();
  for (let i = 1; i <= 10; i++) { await page.mouse.move(wb.x, wb.y - i * 22); await page.waitForTimeout(16); }
  await page.mouse.up(); await page.waitForTimeout(900);
  const idxAfterDrag = await page.evaluate(() => [...document.querySelectorAll('.w-item')].findIndex(e => e.classList.contains('is-active')));
  console.log('Sürükleme sonrası aktif indeks:', idxAfterDrag);
  assert.ok(idxAfterDrag >= 3, 'sürükleme en az 2 set ilerletmeli');
  // Uzun açıklama kırpılmadan sarılıyor mu (3. set)?
  await page.click('.w-item:nth-child(3) .w-main'); await page.waitForTimeout(900);
  const desc = await page.$eval('.w-item.is-active .w-desc', e => ({ sh: e.scrollHeight, ch: e.clientHeight, lines: Math.round(e.clientHeight / parseFloat(getComputedStyle(e).lineHeight || 25)) }));
  assert.ok(desc.sh <= desc.ch + 1, 'açıklama kırpılmamalı');
  // İşaret kaldır
  await page.click('.w-item:nth-child(1) .w-main'); await page.waitForTimeout(900);
  assert.strictEqual(await page.textContent('#btn-complete'), 'İşareti Kaldır');
  await page.click('#btn-complete');
  assert.strictEqual(await page.textContent('#prog-count'), '0 / 8');
  await page.click('#btn-complete'); // tekrar işaretle
  await page.waitForTimeout(900);

  // Kronometre
  await page.click('.w-item:nth-child(4) .w-main'); await page.waitForTimeout(900);
  await page.click('#btn-stopwatch');
  await page.waitForSelector('#screen-stopwatch:not([hidden])');
  const sw = await page.evaluate(() => { const d = document.getElementById('sw-display').getBoundingClientRect(); const t = document.getElementById('sw-time').getBoundingClientRect(); return { ratio: d.height / innerHeight, tw: t.width, th: t.height, dw: d.width, laps: document.getElementById('sw-lap').getBoundingClientRect().height }; });
  console.log('Kronometre:', JSON.stringify(sw));
  assert.ok(sw.ratio >= 0.6, 'gösterge ekranın %60ından büyük olmalı'); assert.ok(sw.tw <= sw.dw);
  await page.click('#sw-lap');                 // BAŞLAT
  await page.clock.runFor(83400); await page.click('#sw-lap');   // tur 1: 1:23.4
  await page.clock.runFor(84600); await page.click('#sw-startstop'); // durdur → tur 2: 1:24.6
  assert.match(await page.textContent('#sw-avg'), /Ort\. 01:24\.[01] · 2 tur/);
  await page.click('#sw-save');
  await page.waitForSelector('#modal:not([hidden]) .pick.is-active');
  await page.click('#modal .pick.is-active');
  await page.click('#modal-actions button:has-text("turlar → Not")');
  await page.waitForSelector('#screen-program:not([hidden])');
  await page.waitForTimeout(900);
  assert.match(await page.textContent('.w-item.is-active .w-result'), /01:24\.[01]/);
  assert.strictEqual(await page.textContent('#prog-count'), '2 / 8');

  // Yeniden yükleme → kaldığı yerden devam
  await page.reload();
  await page.waitForSelector('#screen-program:not([hidden])');
  assert.strictEqual(await page.textContent('#prog-count'), '2 / 8');
  assert.strictEqual(await page.textContent('#btn-session'), 'İdmanı Bitir');

  // Bitir → form
  await page.clock.runFor(60 * 60 * 1000);
  await page.click('#btn-session');
  await page.waitForSelector('#screen-form:not([hidden])');
  const sure = await page.inputValue('#f-sure'); console.log('Süre:', sure, 'Mesafe:', await page.inputValue('#f-mesafe'));
  assert.match(sure, /^01:0[2-3]:\d\d$/);
  assert.strictEqual(await page.inputValue('#f-mesafe'), '600');
  await page.click('#f-rpe button[data-v="8"]');
  await page.click('#f-msi button[data-bolge="sag omuz"][data-v="1"]');
  await page.click('#f-msi button[data-bolge="bel"][data-v="0.5"]');
  await page.click('#f-msi button[data-bolge="boyun"][data-v="2"]');
  await page.click('#f-msi button[data-bolge="boyun"][data-v="2"]'); // kaldır
  await page.fill('#f-aciklama', 'Ana set iyi geçti');
  await page.click('#f-havuz button[data-v="50"]');
  await page.click('#form-save');
  await page.waitForSelector('#screen-done:not([hidden])');
  console.log('Onay:', await page.textContent('#done-text'));
  const eski = env.sheets.eski.data.slice(1);
  assert.deepStrictEqual(eski.map(r => r[1]), [1, 4]);
  assert.match(eski[1][16], /^Turlar: 01:23\.[45], 01:24\.[56]$/);
  const seans = env.sheets.seans.data[1];
  assert.deepStrictEqual([seans[2], seans[3], seans[4], seans[5], seans[6]], [600, 50, 8, 'sag omuz 1; bel 0.5', 'Ana set iyi geçti']);
  assert.strictEqual(env.sheets.Plan.data.length, 3);

  // Çevrimdışı: kuyruk
  await page.click('#done-back');
  await page.waitForSelector('.day-card');
  await page.click('.day-card:not(.is-past)');
  await page.waitForSelector('#screen-program:not([hidden])');
  await page.click('#btn-session'); await page.click('#btn-complete');
  offline = true;
  await page.reload(); // uçak modunda yeniden açılış
  await page.waitForSelector('#screen-program:not([hidden])');
  assert.strictEqual(await page.textContent('.w-item .w-title'), '400 FR');
  await page.click('#btn-session');
  await page.waitForSelector('#screen-form:not([hidden])');
  await page.click('#form-save');
  await page.waitForSelector('#screen-done:not([hidden])');
  assert.strictEqual(await page.textContent('#done-title'), 'Kaydedilemedi');
  await page.click('#done-back');
  await page.waitForSelector('.banner-warn');
  offline = false;
  await page.reload();
  await page.waitForFunction(() => !document.querySelector('.banner-warn'));
  assert.strictEqual(env.sheets.seans.data.length, 3);
  await page.waitForTimeout(300);
  const left = await page.$$eval('.day-card .day-date', els => els.map(e => e.textContent));
  assert.deepStrictEqual(left, ['20 Eylül Pazar'], 'gönderilen gün listeden kalkmalı');
  assert.deepStrictEqual(env.sheets.eski.data.slice(1).map(r => r[4]), [200, 100, 400]);
  // Aynı seansı tekrar göndermek → DUPLICATE (sunucu tarafı)
  assert.strictEqual(env.call({ action: 'finishSession', tarih: '2026-09-24', seans: {}, setler: [] }).error, 'DUPLICATE');

  // Bozuk tarih önbelleği + kuyrukta bekleyen kayıt: gönderim takılmamalı, liste çizilmeli
  await page.evaluate(() => {
    localStorage.removeItem('ysk.session');
    localStorage.setItem('ysk.dates', JSON.stringify({ dates: { bozuk: true }, savedAt: 1 }));
    localStorage.setItem('ysk.queue', JSON.stringify([{ id: 'q1', createdAt: 1, tries: 0, lastError: null,
      payload: { tarih: '2026-09-20', seans: { sure: '00:30:00', mesafe: 300, havuz: 25, rpe: '', msi: '', aciklama: '' },
        setler: [{ sira: 1, tamamlandi: true, gercek: '', kulac: '', nabiz: '', rpe: '', msi: '', not: '' }] } }]));
  });
  await page.reload();
  await page.waitForFunction(() => !document.querySelector('.banner-warn') && document.querySelector('#days-list').textContent.trim() !== '');
  assert.strictEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('ysk.queue')).length), 0);
  assert.ok(env.sheets.seans.data.some((r, i) => i > 0 && r[2] === 300), 'kuyruktaki kayıt gönderilmeli');
  assert.match(await page.textContent('#days-list'), /Planlanmış idman yok/);

  // Zaten kayıtlı seans + bozuk önbellek: "Seansı kapat" ana sayfaya dönmeli
  const addRow = (sh, row) => { const i = sh.getLastRow(); sh._row(i); sh.data[i] = row; };
  addRow(env.sheets.Plan, ['2026-09-27', 1, 'WU', 1, 500, 'FR', 'Swim', '', '', '', '', '', '', '', '', '', '']);
  addRow(env.sheets.seans, ['2026-09-27', '', 0, 25, '', '', '']);
  await page.click('#days-refresh');
  await page.click('.day-card[data-tarih="2026-09-27"]');
  await page.waitForSelector('#screen-program:not([hidden])');
  await page.evaluate(() => localStorage.setItem('ysk.dates', JSON.stringify({ dates: 'bozuk' })));
  await page.click('#btn-session'); await page.click('#btn-complete'); await page.click('#btn-session');
  await page.waitForSelector('#screen-form:not([hidden])');
  await page.click('#form-save');
  await page.waitForSelector('#modal:not([hidden]) >> text=Bu seans zaten kayıtlı');
  await page.click('#modal-actions button:has-text("Seansı kapat")');
  await page.waitForSelector('#screen-days:not([hidden])');
  assert.strictEqual(await page.evaluate(() => localStorage.getItem('ysk.session')), null);
  assert.strictEqual(await page.textContent('#app-version'), 'Sürüm 4');

  // Dar ekran: yatay taşma olmamalı
  await page.setViewportSize({ width: 320, height: 568 });
  await page.click('.day-card:not(.is-past)').catch(()=>{});
  const narrow = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth }));
  console.log('Dar ekran:', JSON.stringify(narrow));
  assert.ok(narrow.sw <= 320 && narrow.bw <= 320);
  assert.deepStrictEqual(errors, []);
  console.log('E2E testleri: TAMAM', calls.join(','));
  await browser.close(); server.close();
})().catch(e => { console.error(e); process.exit(1); });
