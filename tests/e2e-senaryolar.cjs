// Uçtan uca senaryolar: her biri temiz tarayıcı bağlamında, sahte Apps Script ile.
//   NODE_PATH=$(npm root -g) node tests/e2e-senaryolar.cjs [filtre]
const assert = require('assert');
const { runScenarios, prow, D } = require('./harness.cjs');

const T23 = '2026-09-23';
const stripDetay = (r) => (r.ok ? { ...r, data: r.data.map(({ detay, ...d }) => d) } : r);
const lapsOf = async (s) => (await s.session()).sw.laps.length;

async function startStopwatchOn(s, idx) {
  await s.openToday();
  if (idx) await s.goTo(idx);
  await s.page.click('#btn-stopwatch');
  await s.waitScreen('stopwatch');
}

async function toForm(s, { complete = 1 } = {}) {
  await s.openToday();
  await s.page.click('#btn-session');
  for (let i = 0; i < complete; i++) { await s.page.click('#btn-complete'); await s.page.waitForTimeout(700); }
  await s.page.click('#btn-session');
  await s.waitScreen('form');
}

const S = [];
const sc = (name, fn) => S.push([name, fn]);

// --- Su kilidi -----------------------------------------------------------------
sc('Kilit (kronometre): dokunma, TUR, kaydırma ve düğmeler yok sayılır; kronometre çalışır', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await startStopwatchOn(s, 2);
  await p.click('#sw-lap'); // BAŞLAT
  await p.clock.runFor(5000);
  await p.click('#sw-lock');
  assert.ok(await p.isVisible('#lock-bar'));
  const pts = [];
  for (const sel of ['#sw-display', '#sw-lap', '#sw-startstop', '#sw-save', '#sw-reset', '#sw-close', '#sw-time']) pts.push(await s.center(sel));
  for (const pt of pts) { await p.mouse.click(pt.x, pt.y); await p.clock.runFor(400); }
  for (let i = 0; i < 3; i++) { await p.touchscreen.tap(pts[0].x, pts[0].y); await p.touchscreen.tap(pts[1].x, pts[1].y); await p.clock.runFor(400); }
  const w = (await s.session()).sw;
  assert.strictEqual(w.laps.length, 0, 'kilitliyken tur eklenmemeli');
  assert.strictEqual(w.running, true, 'kronometre durmamalı');
  assert.strictEqual(await p.$$eval('#sw-reps i.ok', (e) => e.length), 0, 'tekrar çubuğu eklenmemeli');
  assert.strictEqual(await s.screen(), 'stopwatch');
  assert.ok(await p.isHidden('#sw-sheet'));
  await s.hold('#lock-hold', 400);
  assert.ok(await p.isVisible('#lock-bar'), 'kısa basış açmamalı');
  await s.hold('#lock-hold', 1100);
  assert.ok(await p.isHidden('#lock-bar'), 'basılı tutunca açılmalı');
  await p.click('#sw-lap');
  assert.strictEqual(await lapsOf(s), 1, 'kilit açılınca TUR çalışmalı');
});

sc('Kilit (program): kaydırma ve düğmeler yok sayılır; yeniden açılışta kilit kalkar', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.openToday();
  await p.click('#prog-lock');
  const w = await s.center('#wheel');
  await p.mouse.move(w.x, w.y);
  for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, 80); await p.waitForTimeout(300); }
  await p.mouse.move(w.x, w.y); await p.mouse.down(); await p.mouse.move(w.x, w.y - 200, { steps: 8 }); await p.mouse.up();
  await p.waitForTimeout(500);
  assert.strictEqual(await s.activeIdx(), 0, 'kilitliyken setler kaymamalı');
  for (const sel of ['#btn-complete', '#btn-session', '#btn-stopwatch', '#prog-back']) { const c = await s.center(sel); await p.mouse.click(c.x, c.y); }
  await p.waitForTimeout(300);
  assert.strictEqual(await s.screen(), 'program');
  const ses = await s.session();
  assert.deepStrictEqual([ses.startedAt, Object.keys(ses.done).length], [null, 0]);
  await p.reload();
  await s.waitScreen('program');
  assert.ok(await p.isHidden('#lock-bar'));
  await p.click('#btn-complete');
  assert.strictEqual(Object.keys((await s.session()).done).length, 1);
});

// --- Program açılış hızı ----------------------------------------------------------------
sc('Hızlı açılış: program tarih listesiyle gelir, getPlan beklenmez', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  s.net.delay.getPlan = 4000;
  await s.waitScreen('home');
  await p.waitForFunction(() => /set/.test(document.getElementById('home-swim-meta').textContent));
  assert.ok((await s.ls('ysk.plans'))[T23], 'bugünün programı önbellekte');
  await p.click('#home-swim'); await s.waitScreen('days');
  await p.waitForFunction(() => !document.getElementById('days-today-bar').hidden);
  const t = Date.now();
  await p.click('#days-today-btn');
  await s.waitScreen('program', 1500);
  assert.ok(Date.now() - t < 1500, `program ${Date.now() - t} ms'de açıldı`);
  assert.strictEqual(await p.textContent('.w-item.is-active .w-title'), '1 × 200');
  assert.strictEqual((await s.ls('ysk.dates')).dates.some((d) => d.detay), false, 'detay tarih önbelleğinde tutulmaz');
});

sc('Arka plan yenileme: plan değiştiyse ve başlanmadıysa güncellenir', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  s.net.delay.getPlan = 1500;
  await s.openToday();
  s.env.sheets.Plan.data.find((r) => r[1] === 1 && r[4] === 200)[4] = 300;
  await p.waitForFunction(() => /güncellendi/.test(document.getElementById('toast').textContent), null, { timeout: 5000 });
  assert.strictEqual(await p.textContent('.w-item.is-active .w-title'), '1 × 300');
  assert.strictEqual((await s.ls('ysk.plans'))[T23].setler[0].mesafe, 300);
});

sc('Arka plan yenileme: seansa başlandıysa program korunur', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  s.net.delay.getPlan = 1500;
  await s.openToday();
  await p.click('#btn-session');
  s.env.sheets.Plan.data.find((r) => r[1] === 1 && r[4] === 200)[4] = 300;
  await p.waitForTimeout(2500);
  assert.strictEqual(await p.textContent('.w-item.is-active .w-title'), '1 × 200');
  assert.strictEqual((await s.ls('ysk.plans'))[T23].setler[0].mesafe, 200, 'önbellek de korunur');
  await p.reload(); await s.waitScreen('program');
  assert.strictEqual(await p.textContent('.w-item.is-active .w-title'), '1 × 200');
});

sc('Eski Code.gs (detay yok): yaklaşan günler arka planda indirilir, açılış hızlı', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  s.net.override = (b) => (b.action === 'getDates' ? stripDetay(s.env.call(b)) : null);
  await p.evaluate(() => localStorage.removeItem('ysk.plans'));
  await p.reload();
  await p.waitForFunction(() => { const pl = JSON.parse(localStorage.getItem('ysk.plans') || '{}'); return pl['2026-09-23'] && pl['2026-09-24']; }, null, { timeout: 8000 });
  assert.ok(!(await s.ls('ysk.plans'))['2026-09-20'], 'geçmiş gün indirilmez');
  s.net.delay.getPlan = 4000;
  const t = Date.now();
  await s.openToday();
  assert.ok(Date.now() - t < 3000);
});

sc('Eski Code.gs + önbellek yok: program istekle yüklenir, çift dokunma tek istek', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  s.net.override = (b) => (b.action === 'getDates' ? stripDetay(s.env.call(b)) : null);
  s.net.delay.getPlan = 1200;
  await p.reload(); await s.waitScreen('home');
  await p.evaluate(() => localStorage.removeItem('ysk.plans'));
  await p.click('#home-swim'); await s.waitScreen('days');
  await p.waitForFunction(() => !document.getElementById('days-today-bar').hidden);
  await p.evaluate(() => { localStorage.removeItem('ysk.plans'); const b = document.getElementById('days-today-btn'); b.click(); b.click(); b.click(); });
  await s.waitScreen('program', 6000);
  await p.waitForTimeout(1500);
  const n = s.net.calls.filter((c) => c === 'getPlan').length;
  assert.ok(n <= 3, `getPlan ${n} kez (önceden indirme dahil)`);
  assert.strictEqual(await p.textContent('.w-item.is-active .w-title'), '1 × 200');
});

// --- Bağlantı ve sunucu hataları ------------------------------------------------------------
sc('İlk açılış çevrimdışı ve önbellek yok: anlaşılır uyarı', async ({ launch }) => {
  const s = await launch({ }); const p = s.page;
  s.net.offline = true;
  await p.evaluate(() => { localStorage.removeItem('ysk.dates'); localStorage.removeItem('ysk.plans'); });
  await p.reload();
  await p.waitForFunction(() => document.getElementById('home-swim-tag').textContent === 'BAĞLANTI YOK');
  assert.match(await p.textContent('#home-swim-meta'), /Bağlantı kurulamadı/);
  await p.click('#home-swim'); await s.waitScreen('days');
  await p.waitForSelector('.banner-err');
  assert.ok(await p.isHidden('#days-today-bar'));
});

sc('Çevrimdışı ama önbellek var: liste ve program açılır', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => /set/.test(document.getElementById('home-swim-meta').textContent));
  s.net.offline = true;
  await p.reload();
  await s.openToday();
  assert.strictEqual(await p.textContent('.w-item.is-active .w-title'), '1 × 200');
});

sc('Geçersiz anahtar (AUTH): ana sayfa ve takvimde yönlendirme', async ({ launch }) => {
  const s = await launch({ storage: { 'ysk.config': { apiUrl: 'https://script.google.com/macros/s/TEST/exec', token: 'yanlis' } } }); const p = s.page;
  await p.waitForFunction(() => document.getElementById('home-swim-tag').textContent === 'BAĞLANTI YOK');
  assert.match(await p.textContent('#home-swim-meta'), /anahtar/i);
  await p.click('#home-swim'); await s.waitScreen('days');
  await p.waitForSelector('.banner-err');
  assert.match(await s.text('.banner-err'), /Ayarlardan anahtarı kontrol edin/);
});

sc('Kalıcı sunucu hatası: modal → forma dön → kuyruğa al', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  s.net.override = (b) => (b.action === 'finishSession' ? { ok: false, error: 'PLAN_MISMATCH', message: 'Sıra 9 bulunamadı.' } : null);
  await toForm(s);
  await p.click('#form-save');
  await s.waitModal('Kaydedilemedi');
  assert.match(await p.textContent('#modal-body'), /Sıra 9 bulunamadı.*PLAN_MISMATCH/s);
  await s.modalClick('Forma dön');
  assert.strictEqual(await s.screen(), 'form');
  assert.deepStrictEqual(await s.ls('ysk.queue'), null);
  await p.click('#form-save');
  await s.waitModal('Kaydedilemedi');
  await s.modalClick('Kuyruğa al');
  await s.waitScreen('done');
  assert.strictEqual(await p.textContent('#done-title'), 'Kaydedilemedi');
  assert.strictEqual((await s.ls('ysk.queue')).length, 1);
  assert.strictEqual((await s.ls('ysk.history'))[0].status, 'queued');
  assert.strictEqual(await s.session(), null);
});

sc('Geçici hata (LOCKED): otomatik kuyruk, bağlantıda gönderilir, geçmiş "Tabloda" olur', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  s.net.override = (b) => (b.action === 'finishSession' ? { ok: false, error: 'LOCKED', message: 'meşgul' } : null);
  await toForm(s, { complete: 2 });
  await p.click('#form-save');
  await s.waitScreen('done');
  assert.strictEqual((await s.ls('ysk.queue')).length, 1);
  s.net.override = null;
  await p.click('#done-back');
  await p.waitForFunction(() => JSON.parse(localStorage.getItem('ysk.queue')).length === 0, null, { timeout: 8000 });
  assert.strictEqual(s.env.sheets.eski.getLastRow(), 3);
  assert.strictEqual((await s.ls('ysk.history'))[0].status, 'sent');
  await p.waitForFunction(() => !/23 Eylül/.test(document.getElementById('days-hero').textContent));
});

sc('Zaten kayıtlı (DUPLICATE): seansı kapat → geçmişte "Zaten kayıtlıydı"', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await toForm(s);
  const sh = s.env.sheets.seans; sh._row(1); sh.data[1] = [new s.env.CDate(Date.UTC(2026, 8, 23)), '', 0, 25, '', '', ''];
  await p.click('#form-save');
  await s.waitModal('Bu seans zaten kayıtlı');
  await s.modalClick('Seansı kapat');
  await s.waitScreen('days');
  assert.strictEqual((await s.ls('ysk.history'))[0].status, 'duplicate');
  assert.strictEqual(s.env.sheets.eski.getLastRow(), 1, 'ikinci kez yazılmaz');
});

sc('Sunucu hata ayrıntısı gizli, başvuru numarası görünür', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  s.env.sheets.seans.failOn = 'write';
  await toForm(s);
  await p.click('#form-save'); // SERVER geçicidir → kuyruk
  await s.waitScreen('done');
  const q = await s.ls('ysk.queue');
  assert.strictEqual(q[0].lastError.code, 'SERVER');
  assert.match(q[0].lastError.message, /başvuru: [0-9a-f]{8}/);
  assert.ok(!/write failed/.test(q[0].lastError.message));
  assert.strictEqual(s.env.sheets.eski.getLastRow(), 1, 'geri alındı');
});

// --- Form ------------------------------------------------------------------------------------
sc('Form: süre doğrulama, RPE/MSI seç-kaldır, havuz, çift dokunmada tek gönderim', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await toForm(s);
  await p.fill('#f-sure', '1:2x');
  await p.click('#form-save');
  assert.match(await p.textContent('#form-msg'), /ss:dd:ss/);
  assert.ok(!s.net.calls.includes('finishSession'));
  await p.fill('#f-sure', '1:5');
  await p.click('#f-rpe button[data-v="8"]'); await p.click('#f-rpe button[data-v="8"]'); // kaldır
  await p.click('#f-msi button[data-bolge="bel"][data-v="0"]'); // 0 da kayıttır
  await p.click('#f-msi button[data-bolge="kalca"][data-v="2"]'); await p.click('#f-msi button[data-bolge="kalca"][data-v="2"]');
  await p.click('#f-havuz button[data-v="50"]');
  await p.fill('#f-mesafe', '750');
  s.net.delay.finishSession = 800;
  await p.evaluate(() => { const b = document.getElementById('form-save'); b.click(); b.click(); b.click(); });
  await s.waitScreen('done', 6000);
  assert.strictEqual(s.net.calls.filter((c) => c === 'finishSession').length, 1, 'tek gönderim');
  const r = s.env.sheets.seans.data[1];
  assert.ok(Math.abs(r[1] * 86400 - 65) < 1e-6, 'süre 00:01:05');
  assert.deepStrictEqual([r[2], r[3], r[4], r[5]], [750, 50, '', 'bel 0']);
});

sc('Form: yeniden açılışta girilenler korunur; geri dönüp set değiştirince mesafe güncellenir', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await toForm(s);
  await p.fill('#f-aciklama', 'kalsın');
  await p.click('#f-rpe button[data-v="6"]');
  await p.reload(); await s.waitScreen('form');
  assert.strictEqual(await p.inputValue('#f-aciklama'), 'kalsın');
  assert.strictEqual(await p.getAttribute('#f-rpe button[data-v="6"]', 'class'), 'is-on');
  assert.strictEqual(await p.inputValue('#f-mesafe'), '200');
  await p.click('#form-back'); await s.waitScreen('program');
  await p.click('#btn-complete'); await p.waitForTimeout(700);
  await p.click('#btn-session'); await s.waitScreen('form');
  assert.strictEqual(await p.inputValue('#f-mesafe'), '400', 'elle değiştirilmediyse yeniden hesaplanır');
  assert.strictEqual(await p.inputValue('#f-aciklama'), 'kalsın');
});

// --- Program akışı ----------------------------------------------------------------------------
sc('Tüm setleri tamamlama, işaret kaldırma, sona gelince başa sarma', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.openToday();
  await p.click('#btn-session');
  await s.goTo(3);
  await p.click('#btn-complete'); await p.waitForTimeout(700);
  assert.strictEqual(await s.activeIdx(), 4);
  await p.click('#btn-complete'); await p.waitForTimeout(700);
  assert.strictEqual(await s.activeIdx(), 0, 'sonra baştaki işaretsiz sete sarar');
  for (let i = 0; i < 3; i++) { await p.click('#btn-complete'); await p.waitForTimeout(700); }
  assert.strictEqual(await p.$$eval('.w-item.is-done', (e) => e.length), 5);
  assert.strictEqual(await p.textContent('#btn-complete-text'), 'İşareti Kaldır');
  assert.match(await p.textContent('#prog-dist'), /^1\.200\/1\.200/);
  await p.click('#btn-complete');
  assert.strictEqual(await p.$$eval('.w-item.is-done', (e) => e.length), 4);
  await p.click('#btn-complete'); await p.waitForTimeout(500);
  await p.click('#btn-session'); await s.waitScreen('form');
  assert.strictEqual(await p.inputValue('#f-mesafe'), '1200');
});

sc('Hiç set işaretlenmeden Bitir: onay sorulur', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.openToday();
  await p.click('#btn-session'); await p.click('#btn-session');
  await s.waitModal('Hiç set işaretlenmedi');
  await s.modalClick('Vazgeç');
  assert.strictEqual(await s.screen(), 'program');
  await p.click('#btn-session');
  await s.waitModal('Hiç set işaretlenmedi');
  await s.modalClick('Evet, kapat');
  await s.waitScreen('form');
  assert.strictEqual(await p.inputValue('#f-mesafe'), '0');
});

sc('Seans sürerken başka güne geçmek onay ister', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.openToday();
  await p.click('#btn-session');
  await p.click('#prog-back'); await s.waitScreen('days');
  await p.waitForSelector('.banner-live');
  await p.click('.day-row[data-tarih="2026-09-24"]');
  await p.click('#days-today-btn');
  await s.waitModal('Devam eden seans var');
  await s.modalClick('Vazgeç');
  assert.strictEqual((await s.session()).tarih, T23);
  await p.click('#days-today-btn');
  await s.waitModal('Devam eden seans var');
  await s.modalClick('Sil ve geç');
  await s.waitScreen('program');
  assert.strictEqual((await s.session()).tarih, '2026-09-24');
  assert.strictEqual(await p.textContent('.w-item.is-active .w-title'), '1 × 400');
});

sc('Uzun program (40 set) ve uzun açıklama: açılır, gezinilir, kırpılmaz', async ({ launch }) => {
  const rows = [];
  const long = 'Her 25 metrede nefes 3-5-7, son 25 hızlı; dönüşlerde su altı dolfin en az 5, kol çekişi tam, ayak vuruşu sürekli ve ritmik, baş nötr.';
  for (let i = 1; i <= 40; i++) rows.push(prow(T23, i, ['WU', 'PS', 'MS', 'AS', 'CD'][i % 5], 2, 50, 'Swim', '00:50', '00:10'));
  rows[3][7] = long;
  const s = await launch({ rows }); const p = s.page;
  await s.openToday();
  assert.strictEqual(await p.$$eval('#prog-bar .seg', (e) => e.length), 40);
  assert.match(await p.textContent('#prog-dist'), /\/4\.000$/);
  await s.goTo(3);
  const d = await p.$eval('.w-item.is-active .w-desc', (e) => ({ sh: e.scrollHeight, ch: e.clientHeight }));
  assert.ok(d.sh <= d.ch + 1, 'uzun açıklama kırpılmamalı');
  await s.goTo(12);
});

// --- Kronometre ---------------------------------------------------------------------------------
sc('Kronometre ölçülen sete bağlı kalır (kapatıp başka sete geçince)', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await startStopwatchOn(s, 2);
  await p.click('#sw-lap');
  await p.clock.runFor(3000);
  await p.click('#sw-close'); await s.waitScreen('program');
  await s.goTo(4);
  await p.click('#btn-stopwatch'); await s.waitScreen('stopwatch');
  assert.match(await p.textContent('#sw-set'), /4 × 100/, 'başlık ölçülen seti göstermeli');
  await p.click('#sw-lap'); // tur
  await p.click('#sw-save');
  await p.waitForSelector('#sw-sheet:not([hidden])');
  assert.match(await p.textContent('.sheet-pick'), /4 × 100/);
  await p.click('#sw-sheet .sheet-opt.o1');
  await s.waitScreen('program');
  const ses = await s.session();
  assert.ok(ses.results['3'] && ses.results['3'].gercek, 'sonuç 3. sete yazılmalı');
  assert.ok(!ses.results['5']);
  assert.strictEqual(await s.activeIdx(), 2);
});

sc('Kronometre: kaydet panelinde set değiştirme', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await startStopwatchOn(s, 1);
  await p.click('#sw-lap'); await p.clock.runFor(62000); await p.click('#sw-startstop');
  await p.click('#sw-save');
  await p.click('.sheet-pick');
  await p.click('.sheet-set[data-set="3"]');
  assert.match(await p.textContent('.sheet-pick'), /2 × 100/);
  await p.click('#sw-sheet .sheet-opt.o1');
  await s.waitScreen('program');
  assert.match((await s.session()).results['4'].gercek, /^01:02\.\d$/);
});

sc('Kronometre: çift dokunma koruması, sıfırla onayı, turlar olmadan kaydet', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await startStopwatchOn(s, 2);
  await p.click('#sw-save');
  assert.match(await p.textContent('#toast'), /Kaydedilecek tur yok/);
  await p.click('#sw-lap'); await p.clock.runFor(5000);
  await p.click('#sw-lap'); await p.clock.runFor(100); await p.click('#sw-lap');
  assert.strictEqual(await lapsOf(s), 1, '300 ms içinde ikinci tur sayılmaz');
  await p.click('#sw-reset'); await s.waitModal('Sıfırlansın mı?');
  await s.modalClick('Vazgeç');
  assert.strictEqual(await lapsOf(s), 1);
  await p.click('#sw-reset'); await s.waitModal('Sıfırlansın mı?');
  await s.modalClick('Sıfırla');
  const w = (await s.session()).sw;
  assert.deepStrictEqual([w.laps.length, w.running, w.set], [0, false, null]);
});

sc('Çıkış sesi: her tekrarda 3-2-1 kısa + uzun; ses kapalıyken çalmaz', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await startStopwatchOn(s, 2); // aralık 1:30 + 0:20 = 110 sn
  await p.click('#sw-lap');
  await p.clock.fastForward(106200);
  for (let i = 0; i < 12; i++) await p.clock.runFor(500);
  assert.deepStrictEqual(await p.evaluate(() => window.__beeps), [880, 880, 880, 1320]);
  await p.click('#sw-lap'); // yeni tekrar
  await p.clock.fastForward(106200);
  for (let i = 0; i < 12; i++) await p.clock.runFor(500);
  assert.deepStrictEqual(await p.evaluate(() => window.__beeps), [880, 880, 880, 1320, 880, 880, 880, 1320]);

  const s2 = await launch({ storage: { 'ysk.prefs': { ses: false, css: 117 } } }); const p2 = s2.page;
  await startStopwatchOn(s2, 2);
  await p2.click('#sw-lap');
  await p2.clock.fastForward(106200);
  for (let i = 0; i < 12; i++) await p2.clock.runFor(500);
  assert.deepStrictEqual(await p2.evaluate(() => window.__beeps), []);
  await s2.close();
});

sc('Çıkış sesi program ekranında da çalar (kronometre kapalıyken)', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await startStopwatchOn(s, 2);
  await p.click('#sw-lap');
  await p.click('#sw-close'); await s.waitScreen('program');
  await s.goTo(0); // başka sete bakarken de ölçülen setin aralığı kullanılır
  await p.clock.fastForward(106200);
  for (let i = 0; i < 12; i++) await p.clock.runFor(500);
  assert.deepStrictEqual(await p.evaluate(() => window.__beeps), [880, 880, 880, 1320]);
});

sc('Yeniden açılış: kronometre çalışmaya devam eder', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await startStopwatchOn(s, 2);
  await p.click('#sw-lap'); await p.clock.runFor(4000); await p.click('#sw-lap'); await p.clock.runFor(10000);
  await p.reload(); await s.waitScreen('stopwatch');
  assert.ok(await p.$eval('#screen-stopwatch', (e) => e.classList.contains('is-running')));
  const t = await p.textContent('#sw-main');
  assert.match(t, /^0:1\d$/, `süre sürmeli (${t})`);
  assert.strictEqual(await lapsOf(s), 1);
  assert.match(await p.textContent('#sw-set'), /4 × 100/);
});

// --- Gezinme ------------------------------------------------------------------------------------
sc('Gezinme: tüm geri tuşları, seanssız ve seanslı dönüş', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.waitScreen('home');
  await p.click('#home-swim'); await s.waitScreen('days');
  await p.click('#days-back'); await s.waitScreen('home');
  await p.click('#home-history'); await s.waitScreen('history');
  await p.click('#hist-back'); await s.waitScreen('home');
  await p.click('#home-settings'); await s.waitScreen('setup');
  assert.strictEqual(await p.textContent('#setup-title'), 'Ayarlar');
  await p.click('#setup-back'); await s.waitScreen('home');
  await p.click('#home-gym', { force: true });
  assert.strictEqual(await s.screen(), 'home');
  await s.openToday();
  await p.click('#prog-back'); await s.waitScreen('days');
  assert.strictEqual(await s.session(), null, 'başlanmamış seans silinir');
  await p.click('#days-today-btn'); await s.waitScreen('program');
  await p.click('#btn-complete');
  await p.click('#prog-back'); await s.waitScreen('days');
  await p.click('#days-back'); await s.waitScreen('home');
  assert.strictEqual(await p.textContent('#home-swim-tag'), 'DEVAM EDEN SEANS');
  await p.click('#home-swim'); await s.waitScreen('program');
  assert.strictEqual(await p.$$eval('.w-item.is-done', (e) => e.length), 1);
});

sc('Hafta takvimi: plansız gün, sonraki hafta, Bugün düğmesi', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.waitScreen('home'); await p.click('#home-swim'); await s.waitScreen('days');
  await p.waitForSelector('.wd[data-day="2026-09-25"]');
  await p.click('.wd[data-day="2026-09-25"]');
  assert.match(await s.text('#days-hero'), /Bu gün için plan yok/);
  assert.ok(await p.isHidden('#days-today-bar'));
  const wk = await s.center('#wk');
  await p.mouse.move(wk.x + 80, wk.y); await p.mouse.down();
  for (let i = 1; i <= 8; i++) await p.mouse.move(wk.x + 80 - i * 20, wk.y);
  await p.mouse.up(); await p.waitForTimeout(400);
  assert.strictEqual(await p.textContent('#wk-title'), '28 Eyl – 4 Eki');
  assert.strictEqual(await p.textContent('#wk-sum'), 'Plan yok');
  await p.click('#wk-today');
  assert.strictEqual(await p.textContent('#wk-title'), 'Bu hafta');
  assert.match(await s.text('#days-hero'), /23 Eylül/);
});

// --- Kuyruk ve geçmiş -------------------------------------------------------------------------------
const qItem = (tarih) => ({ id: `${tarih}-1`, createdAt: 1, tries: 1, lastError: { code: 'NETWORK', message: 'Bağlantı kurulamadı.' }, payload: { tarih, seans: {}, setler: [] } });
const hRec = (tarih, status) => ({ id: `h-${tarih}`, tarih, savedAt: 1, status, seans: { sure: '00:40:00', mesafe: 1500 }, setler: [{ blok: 'WU', tekrar: 1, mesafe: 300, tamamlandi: true }, { blok: 'MS', tekrar: 4, mesafe: 300, tamamlandi: true }] });

sc('Kuyruk yönetimi: bekleyen kaydı silmek, geçmişte "Gönderilmedi"', async ({ launch }) => {
  const s = await launch({ offline: true, storage: { 'ysk.queue': [qItem('2026-09-20')], 'ysk.history': [hRec('2026-09-20', 'queued')] } }); const p = s.page;
  await s.waitScreen('home');
  assert.match(await p.textContent('#home-history-meta'), /1 kayıt · 1 gönderilmeyi bekliyor/);
  await p.click('#home-swim'); await p.waitForSelector('.banner-warn');
  await p.click('[data-act="queue-manage"]');
  await p.click('#modal-body .pick');
  await s.waitModal('Kayıt silinsin mi?');
  await s.modalClick('Evet, sil');
  assert.deepStrictEqual(await s.ls('ysk.queue'), []);
  await p.click('#days-back'); await p.click('#home-history'); await s.waitScreen('history');
  assert.match(await s.text('.hist-row'), /Gönderilmedi/);
});

sc('Geçmiş: gönderilmemiş kayıt uyarısı, "tabloya gidenleri sil" kuyruktakini bırakır', async ({ launch }) => {
  const hist = [hRec('2026-09-22', 'sent'), hRec('2026-09-21', 'duplicate'), hRec('2026-09-20', 'queued')];
  const s = await launch({ offline: true, storage: { 'ysk.queue': [qItem('2026-09-20')], 'ysk.history': hist } }); const p = s.page;
  await s.waitScreen('home');
  await p.click('#home-history'); await s.waitScreen('history');
  const rows = await p.$$eval('.hist-row', (e) => e.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  assert.strictEqual(rows.length, 3);
  assert.match(rows[0], /Tabloda 2\/2 set · 1\.500 m · 40:00/);
  assert.match(rows[1], /Zaten kayıtlıydı/); assert.match(rows[2], /Kuyrukta/);
  await p.click('.hist-row >> nth=2');
  await s.modalClick('Bu kaydı sil');
  await s.waitModal('Henüz gönderilmedi');
  await s.modalClick('Vazgeç');
  assert.strictEqual(await p.$$eval('.hist-row', (e) => e.length), 3);
  await p.click('#hist-clear');
  await s.modalClick('Tabloya gidenleri sil (2)');
  assert.strictEqual(await p.$$eval('.hist-row', (e) => e.length), 1);
  assert.strictEqual((await s.ls('ysk.queue')).length, 1, 'kuyruk etkilenmez');
  await p.click('#hist-clear');
  await s.modalClick('Tümünü sil (1)');
  await s.waitModal('Gönderilmemiş kayıt var');
  await s.modalClick('Yine de sil');
  await p.waitForSelector('#hist-list .empty');
  assert.ok(await p.isHidden('#hist-bar'));
});

// --- Ayarlar ---------------------------------------------------------------------------------------
sc('Ayarlar: adres doğrulama, CSS doğrulama/kapatma, tempo bölgesi gösterimi', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.waitScreen('home'); await p.click('#home-settings'); await s.waitScreen('setup');
  for (const [url, re] of [['http://script.google.com/macros/s/X/exec', /script\.google\.com/], ['https://script.google.com/macros/s/X/dev', /\/dev/], ['https://script.google.com/macros/s/X/exec?a=1', /script\.google\.com/]]) {
    await p.fill('#setup-url', url); await p.click('#setup-save');
    assert.match(await p.textContent('#setup-msg'), re, url);
  }
  await p.fill('#setup-url', 'https://script.google.com/a/macros/alan.com/s/X-y_z/exec'); await p.fill('#setup-token', '');
  await p.click('#setup-save');
  assert.match(await p.textContent('#setup-msg'), /Anahtar boş/);
  await p.fill('#pref-css', 'abc'); await p.press('#pref-css', 'Tab');
  assert.match(await p.textContent('#toast'), /dd:ss/);
  assert.strictEqual((await s.ls('ysk.prefs') || { css: 117 }).css, 117);
  await p.fill('#pref-css', '0:10'); await p.press('#pref-css', 'Tab');
  assert.strictEqual((await s.ls('ysk.prefs') || { css: 117 }).css, 117, 'makul olmayan CSS reddedilir');
  await p.fill('#pref-css', ''); await p.press('#pref-css', 'Tab');
  assert.strictEqual((await s.ls('ysk.prefs')).css, null);
  assert.strictEqual(await p.$$eval('#pref-zones .zone', (e) => e.length), 0);
  await p.click('#pref-ses-test');
  assert.deepStrictEqual(await p.evaluate(() => window.__beeps), [880]);
  await p.click('#setup-back'); await s.openToday();
  await s.goTo(2);
  assert.strictEqual(await s.text('.w-item.is-active .w-pace'), 'Tempo 1:30/100', 'CSS yokken bölge yazılmaz');
});

sc('Kurulum: ilk açılış, hatalı anahtar, anahtarı unut, yeniden bağlan', async ({ launch }) => {
  const s = await launch({ configured: false }); const p = s.page;
  await s.waitScreen('setup');
  assert.ok(await p.isHidden('#setup-back')); assert.ok(await p.isHidden('#setup-prefs'));
  await p.fill('#setup-url', 'https://script.google.com/macros/s/TEST/exec');
  await p.fill('#setup-token', 'yanlis'); await p.click('#setup-save');
  await p.waitForFunction(() => /Anahtar hatalı/.test(document.getElementById('setup-msg').textContent));
  await p.fill('#setup-token', 'secret'); await p.click('#setup-save');
  await s.waitScreen('home');
  await p.click('#home-settings');
  await p.click('#setup-forget'); await s.waitModal('Anahtar unutulsun mu?');
  await s.modalClick('Evet, unut');
  await p.waitForFunction(() => document.getElementById('setup-title').textContent === 'Kurulum');
  await p.reload(); await s.waitScreen('setup');
  await p.fill('#setup-url', 'https://script.google.com/macros/s/TEST/exec'); await p.fill('#setup-token', 'secret');
  await p.click('#setup-save'); await s.waitScreen('home');
});

// --- Düzen ---------------------------------------------------------------------------------------------
sc('Düzen: 320, 375 ve 430 px genişlikte tüm ekranlarda yatay taşma yok', async ({ launch }) => {
  for (const vp of [{ width: 320, height: 568 }, { width: 375, height: 667 }, { width: 430, height: 932 }]) {
    const s = await launch({ viewport: vp }); const p = s.page;
    const check = async (name) => {
      const r = await p.evaluate(() => {
        const W = document.documentElement.clientWidth; const bad = [];
        for (const el of document.querySelectorAll('.screen:not([hidden]) *')) {
          const b = el.getBoundingClientRect(); if (!b.width || getComputedStyle(el).visibility === 'hidden') continue;
          if (b.right > W + 1 && !el.closest('.w-item:not(.is-active)') && !el.closest('.wheel') && !el.closest('.wk-track')) bad.push(`${el.tagName}#${el.id}.${String(el.className).slice(0, 30)} ${Math.round(b.right)}`);
        }
        return { sw: document.documentElement.scrollWidth, W, bad: bad.slice(0, 3) };
      });
      assert.ok(r.sw <= vp.width && !r.bad.length, `${vp.width}px ${name}: ${JSON.stringify(r)}`);
    };
    await s.waitScreen('home'); await p.waitForTimeout(200); await check('ana sayfa');
    await p.click('#home-swim'); await s.waitScreen('days'); await p.waitForTimeout(300); await check('takvim');
    await p.click('#days-today-btn'); await s.waitScreen('program'); await p.waitForTimeout(400); await check('program');
    await p.click('#btn-stopwatch'); await s.waitScreen('stopwatch'); await check('kronometre');
    await p.click('#sw-close'); await p.click('#btn-session'); await p.click('#btn-complete'); await p.waitForTimeout(500);
    await p.click('#btn-session'); await s.waitScreen('form'); await check('form');
    await p.click('#form-back'); await p.click('#prog-back'); await p.click('#days-back');
    await p.click('#home-history'); await s.waitScreen('history'); await check('geçmiş');
    await p.click('#hist-back'); await p.click('#home-settings'); await s.waitScreen('setup'); await check('ayarlar');
    await s.close();
  }
});

// ---------------------------------------------------------------------------------------------------------
const only = process.argv[2];
runScenarios('E2E senaryoları', only ? S.filter(([n]) => n.toLowerCase().includes(only.toLowerCase())) : S, 8130);
