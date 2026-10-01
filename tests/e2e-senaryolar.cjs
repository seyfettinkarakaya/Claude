// Uçtan uca senaryolar: her biri temiz tarayıcı bağlamında, sahte Apps Script ile.
//   NODE_PATH=$(npm root -g) node tests/e2e-senaryolar.cjs [filtre]
const assert = require('assert');
const { runScenarios, prow, D } = require('./harness.cjs');

const T23 = '2026-09-23';
const stripDetay = (r) => (r.ok ? { ...r, data: r.data.map(({ detay, ...d }) => d) } : r);

/** Bugünün programını açar, idmana başlar, ilk setten reps tekrar yüzer, seans sonu → özet. */
async function toOzet(s, reps = 1) {
  await s.openToday();
  await s.tap(3);
  for (let i = 0; i < reps; i++) { await s.tap(60); await s.tap(i < reps - 1 ? 20 : 3); }
  await s.finishToOzet();
}

const S = [];
const sc = (name, fn) => S.push([name, fn]);

// --- Su kilidi -----------------------------------------------------------------
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
  assert.strictEqual(await s.title(), '1 × 200');
  assert.strictEqual((await s.ls('ysk.dates')).dates.some((d) => d.detay), false, 'detay tarih önbelleğinde tutulmaz');
});

sc('Arka plan yenileme: plan değiştiyse ve başlanmadıysa güncellenir', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  s.net.delay.getPlan = 1500;
  await s.openToday();
  s.env.sheets.Plan.data.find((r) => r[1] === 1 && r[4] === 200)[4] = 300;
  await p.waitForFunction(() => /güncellendi/.test(document.getElementById('toast').textContent), null, { timeout: 5000 });
  assert.strictEqual(await s.title(), '1 × 300');
  assert.strictEqual((await s.ls('ysk.plans'))[T23].setler[0].mesafe, 300);
});

sc('Arka plan yenileme: seansa başlandıysa program korunur', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  s.net.delay.getPlan = 1500;
  await s.openToday();
  await s.tap(3);
  s.env.sheets.Plan.data.find((r) => r[1] === 1 && r[4] === 200)[4] = 300;
  await p.waitForTimeout(2500);
  assert.strictEqual(await s.title(), '1 × 200');
  assert.strictEqual((await s.ls('ysk.plans'))[T23].setler[0].mesafe, 200, 'önbellek de korunur');
  await p.reload(); await s.waitScreen('program');
  assert.strictEqual(await s.title(), '1 × 200');
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
  assert.strictEqual(await s.title(), '1 × 200');
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
  assert.strictEqual(await s.title(), '1 × 200');
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
  await toOzet(s, 1);
  await p.click('#oz-save');
  await s.waitModal('Kaydedilemedi');
  assert.match(await p.textContent('#modal-body'), /Sıra 9 bulunamadı.*PLAN_MISMATCH/s);
  await s.modalClick('Özete dön');
  assert.strictEqual(await s.screen(), 'ozet');
  assert.deepStrictEqual(await s.ls('ysk.queue'), null);
  await p.click('#oz-save');
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
  await toOzet(s, 2);
  await p.click('#oz-save');
  await s.waitScreen('done');
  assert.strictEqual((await s.ls('ysk.queue')).length, 1);
  s.net.override = null;
  await p.click('#done-back');
  await p.waitForFunction(() => JSON.parse(localStorage.getItem('ysk.queue')).length === 0, null, { timeout: 8000 });
  assert.strictEqual(s.env.sheets.eski.getLastRow(), 3);
  assert.strictEqual((await s.ls('ysk.history'))[0].status, 'sent');
  await s.waitScreen('days');
  await p.waitForFunction(() => /Bu gün için plan yok/.test(document.getElementById('days-hero').textContent));
  assert.match(await s.text('#days-hero'), /23 Eylül/, 'kayıttan sonra takvimde bugün seçili');
  assert.ok(!(await s.text('#days-list')).includes('23'), 'kaydedilen gün listeden kalkar');
});

sc('Zaten kayıtlı (DUPLICATE): seansı kapat → geçmişte "Zaten kayıtlıydı"', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await toOzet(s, 1);
  const sh = s.env.sheets.seans; sh._row(1); sh.data[1] = [new s.env.CDate(Date.UTC(2026, 8, 23)), '', 0, 25, '', '', ''];
  await p.click('#oz-save');
  await s.waitModal('Bu seans zaten kayıtlı');
  await s.modalClick('Seansı kapat');
  await s.waitScreen('days');
  assert.strictEqual((await s.ls('ysk.history'))[0].status, 'duplicate');
  assert.strictEqual(s.env.sheets.eski.getLastRow(), 1, 'ikinci kez yazılmaz');
});

sc('Sunucu hata ayrıntısı gizli, başvuru numarası görünür', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  s.env.sheets.seans.failOn = 'write';
  await toOzet(s, 1);
  await p.click('#oz-save'); // SERVER geçicidir → kuyruk
  await s.waitScreen('done');
  const q = await s.ls('ysk.queue');
  assert.strictEqual(q[0].lastError.code, 'SERVER');
  assert.match(q[0].lastError.message, /başvuru: [0-9a-f]{8}/);
  assert.ok(!/write failed/.test(q[0].lastError.message));
  assert.strictEqual(s.env.sheets.eski.getLastRow(), 1, 'geri alındı');
});

// --- Form ------------------------------------------------------------------------------------
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
  const rows = await p.$$eval('.hist-row', (e) => e.map((x) => x.innerText.replace(/\s+/g, ' ').trim()));
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

// --- Zamanlama modeli (ZAMANLAMA.md) ---------------------------------------------------------
// Örnek plan (harness): 0 WU 1×200 (4:00/0:20) · 1 PS 4×50 Drill (1:05/0:15) · 2 MS 4×100 (1:30/0:20)
//                       3 AS 2×100 Pull (1:40/0:20) · 4 CD 1×200 (4:30/—)
const col = (h) => ['Tarih', 'Sıra', 'Blok', 'Tekrar', 'Mesafe', 'Stil', 'Tür', 'Açıklama', 'Hedef', 'Dinlen', 'Alet', 'Gerçek', 'Kulaç', 'Nabız', 'RPE', 'MSI', 'Not'].indexOf(h);
const sec = (v) => Math.round(v * 86400 * 100) / 100;
const isOn = (p, sel) => p.$eval(sel, (e) => e.classList.contains('is-on'));

sc('Tam idman: 12 tekrar, otomatik set geçişi, son GELDİM idmanı bitirir, 3 dokunuşla kayıt', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.openToday();
  assert.strictEqual(await s.label(), 'İDMANA BAŞLA');
  let total = 0;
  const A = async (x) => { await s.adv(x); total += x + 0.25; };
  await s.press(); await A(3);
  const plan = [[1, 240, 20], [4, 65, 15], [4, 90, 20], [2, 100, 20], [1, 270, 0]];
  for (let si = 0; si < plan.length; si++) {
    const [n, rep, rest] = plan[si];
    for (let r = 0; r < n; r++) {
      assert.strictEqual(await s.label(), 'ÇIK', `set ${si} tekrar ${r + 1} ${JSON.stringify(await s.events())} modal:${await p.isVisible('#modal')}`);
      await s.press(); await A(rep);
      assert.strictEqual(await s.label(), 'GELDİM');
      await s.press();
      if (si === plan.length - 1 && r === n - 1) break;
      await A(rest);
      if (r === n - 1) { await p.waitForTimeout(700); assert.strictEqual(await s.activeIdx(), si + 1, 'kart sonraki sete geçer'); }
    }
  }
  await s.waitScreen('rpe');
  assert.match(await p.textContent('#rpe-info'), /1\.200 m · 5 set/);
  await p.click('#rpe-grid button[data-v="7"]'); await s.waitScreen('msi');
  await p.click('#msi-none'); await s.waitScreen('ozet');
  assert.strictEqual(await p.textContent('#oz-mesafe'), '1.200');
  const notes = await p.$$eval('.oz-set', (e) => e.map((x) => x.innerText.replace(/\s+/g, ' ').trim()));
  assert.strictEqual(notes.length, 5);
  assert.match(notes[1], /4 × 50 FR Drill ort\. 1:05\.\d ✓ Tekrarlar: 1:05, 1:05, 1:05, 1:05$/);
  assert.ok(!/Dinlenme/.test(notes.join()), 'plana uygun dinlenmede not önerilmez');
  await p.click('#oz-save'); await s.waitScreen('done');
  const eski = s.env.sheets.eski.data.slice(1);
  assert.deepStrictEqual(eski.map((r) => r[col('Sıra')]), [1, 2, 3, 4, 5]);
  const g = eski.map((r) => sec(r[col('Gerçek')]));
  [240, 65, 90, 100, 270].forEach((x, i) => assert.ok(Math.abs(g[i] - x) < 0.6, `Gerçek ${i}: ${g[i]}`));
  assert.strictEqual(eski[0][col('Not')], '', 'tek tekrarlı sette tekrar notu yok');
  assert.match(eski[1][col('Not')], /^Tekrarlar: 1:05, 1:05, 1:05, 1:05$/);
  const se = s.env.sheets.seans.data[1];
  assert.ok(Math.abs(sec(se[1]) - total) < 5,  `süre ${sec(se[1])} ≈ ${total}`);
  assert.deepStrictEqual([se[2], se[3], se[4], se[5]], [1200, 25, 7, '']);
  const h = (await s.ls('ysk.history'))[0];
  assert.deepStrictEqual(h.setler.map((x) => x.yapilan), [1, 4, 4, 2, 1]);
});

sc('Dinlenme sayacı: 3-2-1 kısa + 0 uzun, eksiye kırmızı; ses düğmesi kapatınca çalmaz', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.openToday();
  await s.tap(3); await s.tap(60); // başla, 1×200 ÇIK
  await s.press();       // GELDİM → set sonu dinlenmesi (Dinlen 0:20)
  await s.adv(16);
  assert.deepStrictEqual(await p.evaluate(() => window.__beeps), [660], 'GELDİM onay sesi');
  for (let i = 0; i < 12; i++) await p.clock.runFor(500);
  assert.deepStrictEqual(await p.evaluate(() => window.__beeps), [660, 880, 880, 880, 1320]);
  await p.waitForTimeout(700);
  const big = await p.$eval('.w-item.is-active .w-tbig', (e) => ({ t: e.textContent, c: e.className }));
  assert.match(big.t, /^−0:0\d$/); assert.match(big.c, /\br\b/);
  assert.strictEqual(await s.text('.w-item.is-active .w-tmode'), 'DİNLENME UZADI');
  await p.click('#btn-sound');
  assert.strictEqual(await s.text('#btn-sound'), 'Ses kapalı');
  assert.strictEqual((await s.ls('ysk.prefs')).ses, false);
  await s.tap(65); await s.press(); await s.adv(10);
  for (let i = 0; i < 12; i++) await p.clock.runFor(500);
  assert.deepStrictEqual(await p.evaluate(() => window.__beeps), [660, 880, 880, 880, 1320], 'ses kapalıyken bip yok');
});

sc('Çift dokunma koruması (2 sn) ve Geri al (5 sn)', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.openToday();
  await s.press(); await p.clock.runFor(800); await s.press();
  assert.deepStrictEqual(await s.events(), ['basla'], '2 sn içindeki ikinci dokunuş yok sayılır');
  await s.adv(2); await s.press();
  await s.adv(30); await s.press(); // GELDİM → set tamam, sonraki sete geçer
  await p.clock.runFor(300);
  assert.ok(await isOn(p, '#btn-undo'));
  await p.click('#btn-undo');
  assert.deepStrictEqual(await s.events(), ['basla', 'cik0']);
  assert.strictEqual(await s.label(), 'GELDİM');
  await p.waitForTimeout(800);
  assert.strictEqual(await s.activeIdx(), 0, 'yüzülen sete döner');
  await s.press(); await p.clock.runFor(300);
  assert.ok(await isOn(p, '#btn-undo'));
  await s.adv(6);
  assert.ok(!(await isOn(p, '#btn-undo')), '5 sn sonra söner');
});

sc('Yüzerken setler kaydırılamaz ve ‹ çalışmaz', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.openToday();
  await s.tap(3); await s.press(); await p.clock.runFor(1000);
  const w = await s.center('#wheel');
  await p.mouse.move(w.x, w.y);
  for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, 80); await p.waitForTimeout(300); }
  await p.mouse.move(w.x, w.y); await p.mouse.down(); await p.mouse.move(w.x, w.y - 200, { steps: 8 }); await p.mouse.up();
  await p.waitForTimeout(500);
  assert.strictEqual(await s.activeIdx(), 0);
  await p.click('#prog-back');
  assert.match(await p.textContent('#toast'), /Yüzerken/);
  assert.ok(await p.isHidden('#modal'));
  assert.strictEqual(await s.screen(), 'program');
});

sc('Seti erken bitirme: dinlenirken kaydır → uyarı → ÇIK n/N; geri kaydırmak vazgeçer', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.openToday();
  await s.tap(3); await s.tap(240); await s.tap(20);
  await p.waitForTimeout(700);
  await s.tap(65); await s.tap(15); await s.tap(65); await s.tap(10); // 4×50: 2 tekrar
  await s.goTo(2);
  assert.match(await s.text('.w-item.is-active .w-banner'), /4 × 50 FR 2\/4'te kapanacak · 2 tekrar yapılmadı/);
  assert.strictEqual(await s.sub(), '4 × 100 FR Swim · 1. tekrar');
  await s.goTo(1);
  assert.strictEqual(await s.sub(), '3. tekrar başlar');
  assert.strictEqual(await p.$$eval('.w-item.is-active .w-banner', (e) => e.length), 0);
  await s.goTo(2);
  await s.tap(90);
  assert.deepStrictEqual((await s.events()).slice(-1), ['cik2']);
  assert.match(await p.$eval('.w-item >> nth=1', (e) => e.querySelector('.w-nm').textContent), /· 2\/4$/);
  await s.tap(3); // GELDİM
  await s.finishToOzet();
  const ps = await p.$eval('.oz-set >> nth=1', (e) => e.innerText.replace(/\s+/g, ' '));
  assert.match(ps, /✓ 2\/4 tekrar yapıldı/);
  await p.click('#oz-save'); await s.waitScreen('done');
  const eski = s.env.sheets.eski.data.slice(1);
  assert.strictEqual(eski.length, 3);
  assert.match(eski[1][col('Not')], /^Tekrarlar: 1:05, 1:05 \| 2\/4 tekrar yapıldı$/);
  assert.strictEqual(s.env.sheets.seans.data[1][2], 400, 'mesafe = yapılan tekrarlar');
});

sc('‹ paneli: devam et, takvime dön, idmanı bitir; RPE\'de İdmana dön', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.openToday();
  await s.tap(3); await s.tap(60); await s.tap(5);
  await p.click('#prog-back'); await s.waitModal('İdmanı bitir?');
  assert.match(await p.textContent('#modal-body'), /1 set tam · 200 m/);
  await s.modalClick('Devam et');
  assert.strictEqual(await s.screen(), 'program');
  await p.click('#prog-back'); await s.waitModal('İdmanı bitir?');
  await s.modalClick('Takvime dön');
  await s.waitScreen('days'); await p.waitForSelector('.banner-live');
  await p.click('[data-act="resume"]'); await s.waitScreen('program');
  await p.click('#prog-back'); await s.waitModal('İdmanı bitir?');
  await s.modalClick('İdmanı bitir ve kaydet');
  await s.waitScreen('rpe');
  await p.click('#rpe-back'); await s.waitScreen('program');
  assert.deepStrictEqual(await s.events(), ['basla', 'cik0', 'geldim'], 'yalnızca bitiş geri alınır');
  assert.strictEqual(await s.label(), 'ÇIK');
});

sc('Son setin son GELDİM\'i idmanı bitirir; "İdmana dön" son tekrarı geri getirir', async ({ launch }) => {
  const s = await launch({ rows: [prow(T23, 1, 'MS', 2, 100, 'Swim', '01:30', '00:20')] }); const p = s.page;
  await s.openToday();
  await s.tap(3); await s.tap(90); await s.tap(20); await s.tap(90);
  await s.press();
  await s.waitScreen('rpe');
  assert.ok(await p.isVisible('#rpe-undo'));
  await p.click('#rpe-undo'); await s.waitScreen('program');
  assert.strictEqual(await s.label(), 'GELDİM');
  assert.deepStrictEqual((await s.events()).slice(-1), ['cik0']);
  await s.adv(3); await s.press(); await s.waitScreen('rpe');
  await s.adv(6);
  assert.ok(await p.isHidden('#rpe-undo'), '5 sn sonra gizlenir');
});

sc('Şüpheli tekrar: işaretlenir, düzeltilir, ortalamaya yansır', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.openToday();
  await s.tap(3); await s.tap(240); await s.tap(20);
  await p.waitForTimeout(700);
  for (const [r, last] of [[65, 0], [64, 0], [150, 0], [66, 1]]) { await s.tap(r); await s.tap(last ? 3 : 15); }
  await s.finishToOzet();
  assert.match(await s.text('.oz-sus'), /3\. tekrar 2:30 — düzelt/);
  await p.click('.oz-sus');
  await p.waitForSelector('#ed-sheet:not([hidden])');
  assert.strictEqual(await p.textContent('#ed-val'), '1:05');
  await p.click('[data-step="1"]');
  assert.strictEqual(await p.textContent('#ed-apply'), '1:06 olarak düzelt');
  await p.click('#ed-apply');
  assert.ok(await p.isHidden('#ed-sheet'));
  assert.match(await s.text('.oz-sus'), /\(düzeltildi\)/);
  assert.match(await s.text('.oz-set >> nth=1'), /Tekrarlar: 1:05, 1:04, 1:06, 1:06/);
  await p.click('#oz-save'); await s.waitScreen('done');
  const g = sec(s.env.sheets.eski.data[2][col('Gerçek')]);
  assert.ok(Math.abs(g - 65.44) < 0.3, `ortalama ${g}`);
});

sc('Dinlenme notu: sapma varsa önerilir (işaretsiz), işaretlenince nota yazılır', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.openToday();
  await s.tap(3); await s.tap(240); await s.tap(20);
  await p.waitForTimeout(700);
  for (let i = 0; i < 4; i++) { await s.tap(65); await s.tap(i < 3 ? 30 : 40); }
  await p.waitForTimeout(700);
  await s.tap(90); await s.tap(3);
  await s.finishToOzet();
  const line = await p.$('.oz-set >> nth=1 >> button[data-line="rest"]');
  assert.match(await line.textContent(), /Dinlenme: 0:30, 0:30, 0:30 \(ort\. \+15 sn\) · Set sonu 0:4\d/);
  assert.ok(!(await line.$eval('.cb', (e) => e.classList.contains('on'))), 'varsayılan işaretsiz');
  await line.click();
  assert.ok(await p.$eval('.oz-set >> nth=1 >> button[data-line="rest"] .cb', (e) => e.classList.contains('on')));
  await p.click('#oz-save'); await s.waitScreen('done');
  assert.match(s.env.sheets.eski.data[2][col('Not')], /Tekrarlar: .* \| Dinlenme: 0:30, 0:30, 0:30 \(ort\. \+15 sn\) · Set sonu 0:4\d$/);
});

sc('Seans sonu: MSI bölge döngüsü, RPE, havuz, hazır ifade; havuz hatırlanır', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.openToday();
  await s.tap(3); await s.tap(60); await s.tap(3);
  await p.click('#prog-back'); await s.modalClick('İdmanı bitir ve kaydet');
  await s.waitScreen('rpe'); await p.click('#rpe-grid button[data-v="4"]');
  await s.waitScreen('msi');
  assert.ok(await p.isHidden('#msi-next'));
  for (let i = 0; i < 3; i++) await p.click('#msi-body button[data-bolge="sag omuz"]');
  for (let i = 0; i < 6; i++) await p.click('#msi-body button[data-bolge="bel"]');
  assert.strictEqual(await s.text('#msi-body button[data-bolge="sag omuz"] em'), '1,5');
  assert.strictEqual(await s.text('#msi-body button[data-bolge="bel"] em'), '—', 'döngü boşa döner');
  await p.click('#msi-next'); await s.waitScreen('ozet');
  assert.strictEqual(await p.textContent('#oz-msi'), 'sağ omuz 1,5');
  assert.strictEqual(await p.textContent('#oz-rpe'), '4');
  await p.click('#oz-havuz button[data-v="50"]');
  await p.click('#oz-chips button[data-chip="Yorgun"]');
  await p.fill('#oz-aciklama', 'kısa not');
  await p.click('#oz-rpe-box'); await s.waitScreen('rpe');
  await p.click('#rpe-grid button[data-v="6"]'); await s.waitScreen('msi');
  await p.click('#msi-next'); await s.waitScreen('ozet');
  assert.strictEqual(await p.inputValue('#oz-aciklama'), 'kısa not');
  await p.click('#oz-save'); await s.waitScreen('done');
  const r = s.env.sheets.seans.data[1];
  assert.deepStrictEqual([r[3], r[4], r[5], r[6]], [50, 6, 'sag omuz 1.5', 'Yorgun. kısa not']);
  assert.strictEqual((await s.ls('ysk.prefs')).havuz, 50);
});

sc('Yeniden açılış: yüzerken, dinlenirken ve özet ekranında kaldığı yerden', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.openToday();
  await s.tap(3); await s.tap(40);
  await p.reload(); await s.waitScreen('program'); await p.waitForTimeout(300);
  assert.strictEqual(await s.label(), 'GELDİM');
  assert.match(await p.textContent('.w-item.is-active .w-tbig'), /^0:4\d$/);
  await s.press(); await s.adv(5);
  await p.waitForTimeout(700);
  await p.reload(); await s.waitScreen('program'); await p.waitForTimeout(300);
  assert.strictEqual(await s.label(), 'ÇIK');
  assert.strictEqual(await s.activeIdx(), 1);
  assert.match(await p.textContent('.w-item.is-active .w-tbig'), /^0:1\d$/);
  await s.finishToOzet();
  await p.fill('#oz-aciklama', 'kalsın');
  await p.reload(); await s.waitScreen('ozet');
  assert.strictEqual(await p.inputValue('#oz-aciklama'), 'kalsın');
  assert.strictEqual(await p.textContent('#oz-rpe'), '7');
});

sc('Sürüm 9 seansı yeni modele taşınır (işaretler ve turlar korunur)', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => /set/.test(document.getElementById('home-swim-meta').textContent));
  await p.evaluate(() => localStorage.setItem('ysk.session', JSON.stringify({
    tarih: '2026-09-23', startedAt: Date.now() - 600000, endedAt: null, done: { 1: true }, results: { 1: { gercek: '03:58.0' } },
    pos: 1, screen: 'stopwatch', form: null, sw: { running: false, segStart: null, segAcc: 0, laps: [61000], repStart: null, set: 0 },
  })));
  await p.reload(); await s.waitScreen('program');
  const ses = await s.session();
  assert.strictEqual(ses.v, 2);
  assert.deepStrictEqual(ses.events.map((e) => e.t), ['basla']);
  assert.strictEqual(await p.$$eval('.w-item.is-done', (e) => e.length), 1);
  assert.match(await p.textContent('#prog-clock'), /^10:0\d$/);
  await s.finishToOzet();
  await p.click('#oz-save'); await s.waitScreen('done');
  const e = s.env.sheets.eski.data.slice(1);
  assert.strictEqual(e.length, 1);
  assert.ok(Math.abs(sec(e[0][col('Gerçek')]) - 238) < 0.1);
  assert.strictEqual(e[0][col('Not')], 'Turlar: 01:01.0');
});

sc('Seans sürerken başka güne geçmek onay ister', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.openToday();
  await s.tap(3);
  await p.click('#prog-back'); await s.modalClick('Takvime dön');
  await s.waitScreen('days');
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
  assert.strictEqual(await s.title(), '1 × 400');
});

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
  await s.tap(3);
  await p.click('#prog-back'); await s.modalClick('Takvime dön'); await s.waitScreen('days');
  await p.click('#days-back'); await s.waitScreen('home');
  assert.strictEqual(await p.textContent('#home-swim-tag'), 'DEVAM EDEN SEANS');
  await p.click('#home-swim'); await s.waitScreen('program');
  assert.deepStrictEqual(await s.events(), ['basla']);
});

sc('Seti sıfırla: SET TAMAM\'a dokununca onay; set silinir, yeniden yapılır; diğer setler korunur', async ({ launch }) => {
  const s = await launch(); const p = s.page;
  await s.openToday();
  await s.tap(3); await s.tap(240); await s.tap(20);          // 1×200 tamam → 4×50'ye geçer
  await p.waitForTimeout(700);
  await s.tap(65); await s.tap(15);                            // 4×50: 1 tekrar
  await s.goTo(0);
  assert.strictEqual(await s.label(), 'SET TAMAM');
  await s.press(); await s.waitModal('Bu seti sıfırla?');
  await s.modalClick('Vazgeç');
  assert.strictEqual(await s.label(), 'SET TAMAM');
  assert.strictEqual((await s.events()).length, 5);
  await s.press(); await s.waitModal('Bu seti sıfırla?');
  assert.match(await p.textContent('#modal-body'), /1\/1 tekrar/);
  await s.modalClick('Seti sıfırla');
  assert.deepStrictEqual(await s.events(), ['basla', 'cik1', 'geldim'], '1. setin olayları silinir, 2. set kalır');
  assert.strictEqual(await s.activeIdx(), 0);
  assert.strictEqual(await s.label(), 'ÇIK');
  assert.ok(!(await p.$eval('.w-item >> nth=0', (e) => e.classList.contains('is-done'))));
  assert.strictEqual((await p.textContent('#prog-dist')).replace(/\s/g, '').split('/')[0], '50');
  await s.tap(230); await s.tap(5);                            // seti yeniden yap
  const ses = await s.session();
  assert.strictEqual(ses.events.filter((e) => e.t === 'cik' && e.set === 0).length, 1);
  await s.finishToOzet();
  const notes = await p.$$eval('.oz-set', (e) => e.map((x) => x.innerText.replace(/\s+/g, ' ')));
  assert.match(notes[0], /ort\. 3:50/);
  assert.match(notes[1], /1\/4 tekrar yapıldı/);
});

sc('Düzen: 320, 375 ve 430 px genişlikte tüm ekranlarda yatay taşma yok, düğmeler büyük', async ({ launch }) => {
  for (const vp of [{ width: 320, height: 568 }, { width: 375, height: 667 }, { width: 430, height: 932 }]) {
    const s = await launch({ viewport: vp }); const p = s.page;
    const check = async (name) => {
      await p.waitForTimeout(250);
      const r = await p.evaluate(() => {
        const W = document.documentElement.clientWidth; const bad = [];
        for (const el of document.querySelectorAll('.screen:not([hidden]) *')) {
          const b = el.getBoundingClientRect(); if (!b.width || getComputedStyle(el).visibility === 'hidden') continue;
          if (el.closest('.w-item:not(.is-active)') || el.closest('.wk-track')) continue;
          if (b.right > W + 1 || b.left < -1) bad.push(`${el.tagName}#${el.id}.${String(el.className).slice(0, 30)} ${Math.round(b.left)}-${Math.round(b.right)}`);
        }
        return { sw: document.documentElement.scrollWidth, W, bad: bad.slice(0, 3) };
      });
      assert.ok(r.sw <= vp.width && !r.bad.length, `${vp.width}px ${name}: ${JSON.stringify(r)}`);
    };
    await s.waitScreen('home'); await check('ana sayfa');
    await p.click('#home-history'); await s.waitScreen('history'); await check('geçmiş');
    await p.click('#hist-back'); await p.click('#home-settings'); await s.waitScreen('setup'); await check('ayarlar');
    await p.click('#setup-back'); await p.click('#home-swim'); await s.waitScreen('days'); await check('takvim');
    await p.click('#days-today-btn'); await s.waitScreen('program'); await check('program hazır');
    const btn = await p.$eval('#btn-main', (e) => e.getBoundingClientRect().height);
    assert.ok(btn >= 100, `büyük düğme ${btn}px`);
    const fit = await p.$eval('#btn-main-label', (e) => {
      const b = e.getBoundingClientRect(); const o = e.parentElement.getBoundingClientRect();
      return { t: e.textContent, sw: e.scrollWidth, cw: e.clientWidth, in: b.left >= o.left && b.right <= o.right, fs: parseFloat(getComputedStyle(e).fontSize) };
    });
    assert.ok(fit.t === 'İDMANA BAŞLA' && fit.sw <= fit.cw + 1 && fit.in && fit.fs >= 18, `${vp.width}px düğme yazısı sığmalı: ${JSON.stringify(fit)}`);
    await s.tap(3); await s.press(); await s.adv(70); await check('program yüzerken');
    await s.press(); await s.adv(30); await check('program dinlenme (eksi)');
    await p.click('#prog-back'); await s.modalClick('İdmanı bitir ve kaydet'); await s.waitScreen('rpe'); await check('RPE');
    await p.click('#rpe-grid button[data-v="7"]'); await s.waitScreen('msi'); await check('MSI');
    await p.click('#msi-body button[data-bolge="sag omuz"]'); await p.click('#msi-next'); await s.waitScreen('ozet'); await check('özet');
    await s.close();
  }
});

// ---------------------------------------------------------------------------------------------------------
const only = process.argv[2];
runScenarios('E2E senaryoları', only ? S.filter(([n]) => n.toLowerCase().includes(only.toLowerCase())) : S, 8130);
