// SporRef.gs ve Salon.gs testleri (sahte SpreadsheetApp).
//   node tests/test-gas-salon.cjs
const assert = require('assert');
const { Sheet, makeEnv, D } = require('./fakegas.cjs');

let n = 0;
const test = (name, fn) => { try { fn(); n++; } catch (e) { console.error('BAŞARISIZ:', name); throw e; } };

// --- sporRef -----------------------------------------------------------------------
const refEnv = (extra = {}) => makeEnv({
  zone: new Sheet('zone', ['Zone', 'Alt Sınır', 'Üst Sınır', 'Tür', 'Açıklama'], [
    ['SP3', -999, '−19', 'PACE', 'not'], ['SP2', '−19', '−9', 'PACE', ''], ['EN3', '−3', 3, 'PACE', ''], ['TEC', '', '', 'OZEL', ''], ['SP3', 198, 999, 'HR', ''],
  ]),
  css: new Sheet('css', ['Tarih_ilk', 'Tarih_son', 'CSS (sn)', 'Alet', 'Havuz', 'Kaynak'], [
    [D('2026-07-06'), D('2026-08-31'), 122, '', 25, ''], [D('2026-07-06'), D('2026-08-31'), 111, 'Finn', 25, ''], [D('2026-07-06'), D('2026-08-31'), 123, '', 50, ''], ['', '', '', '', '', ''],
  ]),
  bilgi: new Sheet('bilgi', ['Kısaltma', 'Tam Adı', 'Açıklama', 'Açıklama.2'], [['Max Nabız', 198, 'Saha Max Nabız', ''], ['EN3', 'Endurance 3', 'Yüksek Aerobik', 'CSS-centered']]),
  alet: new Sheet('alet', ['Kod', 'Ad', 'Açıklama'], [['PB', 'Pullbuoy', 'Pulboy'], ['Finn', 'Finn', 'Ayak paleti']]),
  RPE: new Sheet('RPE', ['1–2 — Çok kolay.'], [['3–4 — Kolay.'], ['10 — Maksimal.']]),
  MSI: new Sheet('MSI', ['0 — Ağrı yok.'], [['0,5 — Hafif his.']]),
  fazBilgi: new Sheet('fazBilgi', ['Sezon', 'Faz', 'Tarih_ilk', 'Tarih_son', 'Ad', 'Odak'], [['26-27', 'Faz-0', D('2026-09-29'), D('2026-10-09'), '', '']]),
  ...extra,
}, 'secret', 'SporRef.gs');

test('sporRef getRef: bölgeler (Unicode eksi), CSS, bilgi, alet, RPE/MSI (başlıksız), faz', () => {
  const r = refEnv().call({ action: 'getRef' });
  assert.ok(r.ok, JSON.stringify(r));
  const d = r.data;
  assert.deepStrictEqual(d.zones[0], { zone: 'SP3', alt: -999, ust: -19, tur: 'PACE', ad: '' });
  assert.deepStrictEqual(d.zones[1], { zone: 'SP2', alt: -19, ust: -9, tur: 'PACE', ad: '' });
  assert.strictEqual(d.zones[3].alt, null, 'TEC sınırsız');
  assert.strictEqual(d.zones[4].tur, 'HR');
  assert.deepStrictEqual(d.css, [
    { ilk: '2026-07-06', son: '2026-08-31', css: 122, alet: '', havuz: 25 },
    { ilk: '2026-07-06', son: '2026-08-31', css: 111, alet: 'Finn', havuz: 25 },
    { ilk: '2026-07-06', son: '2026-08-31', css: 123, alet: '', havuz: 50 },
  ]);
  assert.strictEqual(d.bilgi['Max Nabız'].ad, 198 + '');
  assert.deepStrictEqual(d.alet.map((a) => a.kod), ['PB', 'Finn']);
  assert.deepStrictEqual(d.rpe, ['1–2 — Çok kolay.', '3–4 — Kolay.', '10 — Maksimal.']);
  assert.deepStrictEqual(d.msi, ['0 — Ağrı yok.', '0,5 — Hafif his.']);
  assert.deepStrictEqual(d.faz[0], { sezon: '26-27', faz: 'Faz-0', ilk: '2026-09-29', son: '2026-10-09', ad: '', odak: '' });
});

test('sporRef: eksik sayfalar boş döner; yanlış anahtar AUTH; yazma işlemi yok', () => {
  const e = makeEnv({}, 'secret', 'SporRef.gs');
  const r = e.call({ action: 'getRef' });
  assert.deepStrictEqual(r.data, { zones: [], css: [], bilgi: {}, alet: [], rpe: [], msi: [], faz: [] });
  assert.strictEqual(JSON.parse(e.ctx.doPost({ postData: { contents: JSON.stringify({ action: 'getRef', token: 'x' }) } }).s).error, 'AUTH');
  assert.strictEqual(e.call({ action: 'finishSession' }).error, 'UNKNOWN_ACTION');
  assert.strictEqual(e.call({ action: 'saveSalon' }).error, 'UNKNOWN_ACTION');
});

test('sporRef (sürüm 12): kisit, yuzmeKas, drill sayfaları varsa okunur; güvenli video', () => {
  const r = refEnv({
    kisit: new Sheet('kisit', ['Kural', 'Değer', 'Açıklama'], [['br_ay_max', 10, 'Kurbağalama ayda en çok %'], ['tani', 'Sağ kalça · Perthes', 'Koşu yok'], ['', 5, '']]),
    yuzmeKas: new Sheet('yuzmeKas', ['Stil', 'Grup', 'Katsayı'], [['fr', 'Omuz', '0,3'], ['FR', 'Sırt', 0.25], ['BR', 'Bacak', ''], ['', 'Omuz', 1]]),
    drill: new Sheet('drill', ['Ad', 'Video', 'Açıklama'], [['Catch-up', 'https://youtu.be/cu', 'tek kol'], ['Fist', 'http://kotu.example', '']]),
  }).call({ action: 'getRef' });
  assert.ok(r.ok, JSON.stringify(r));
  assert.deepStrictEqual(r.data.kisit, [{ kural: 'br_ay_max', deger: 10, aciklama: 'Kurbağalama ayda en çok %' }, { kural: 'tani', deger: 'Sağ kalça · Perthes', aciklama: 'Koşu yok' }]);
  assert.deepStrictEqual(r.data.yuzmeKas, [{ stil: 'FR', grup: 'Omuz', katsayi: 0.3 }, { stil: 'FR', grup: 'Sırt', katsayi: 0.25 }]);
  assert.deepStrictEqual(r.data.drill.map((d) => d.video), ['https://youtu.be/cu', '']);
});

test('sporRef addCss: css sayfasının sonuna satır ekler, eski satırlar aynen; geçersiz CSS ve tarih reddedilir', () => {
  const e = refEnv();
  const before = e.sheets.css.data.map((r) => r.slice());
  const r = e.call({ action: 'addCss', tarih: '2026-10-06', css: 116, alet: '', havuz: 25 });
  assert.ok(r.ok, JSON.stringify(r));
  const sh = e.sheets.css;
  assert.deepStrictEqual(sh.data.slice(0, 4).map((x) => x.map(String)), before.slice(0, 4).map((x) => x.map(String)), 'eski satırlar değişmez');
  const row = sh.data[r.data.satir - 1];
  assert.ok(row[0] instanceof e.CDate && row[0].toISOString().startsWith('2026-10-06'));
  assert.deepStrictEqual(row.slice(1), ['', 116, '', 25, 'YüzmeSK CSS testi']);
  const g = e.call({ action: 'getRef' }).data.css;
  assert.deepStrictEqual(g[g.length - 1], { ilk: '2026-10-06', son: '', css: 116, alet: '', havuz: 25 });
  assert.strictEqual(e.call({ action: 'addCss', tarih: '2026-10-06', css: 20 }).error, 'BAD_REQUEST');
  assert.strictEqual(e.call({ action: 'addCss', tarih: '06.10.2026', css: 116 }).error, 'BAD_REQUEST');
});

test('getSalon (sürüm 12): H\'de isteğe bağlı Kısıt / Alternatif / Görsel yalnızca doluysa eklenir', () => {
  const e = makeEnv({
    idman: new Sheet('idman', ['Tarih', 'No', 'Hareket', 'Set', 'Tekrar', 'Ağırlık', 'Nabız', 'RPE', 'MSI', 'Açıklama'], []),
    H: new Sheet('H', ['Exercise', 'Goal Tag', 'Equipment', 'BW Coefficient', 'Swim Transfer Coefficient', 'Video', 'Kısıt', 'Alternatif', 'Görsel'], [
      ['Goblet Squat', 'Strength', 'Dumbbell', '—', 0.65, '', 'squat>90', 'Box Squat', 'Goblet_Squat'],
      ['Dead Bug', 'Strength', 'Bodyweight', 0.5, 0.8, '', '', '', ''],
    ]),
  }, 'secret', 'Salon.gs');
  const k = e.call({ action: 'getSalon' }).data.katalog;
  assert.deepStrictEqual(k[0], { ad: 'Goblet Squat', amac: 'Strength', ekipman: 'Dumbbell', bw: null, stc: 0.65, video: '', kisit: 'squat>90', alternatif: 'Box Squat', gorsel: 'Goblet_Squat' });
  assert.deepStrictEqual(Object.keys(k[1]), ['ad', 'amac', 'ekipman', 'bw', 'stc', 'video']);
});

// --- Salon -------------------------------------------------------------------------
const IDMAN_H = ['Tarih', 'No', 'Hareket', 'Set', 'Tekrar', 'Ağırlık', 'Nabız', 'RPE', 'MSI', 'Açıklama'];
const salonEnv = (opts = {}) => makeEnv({
  idman: new Sheet('idman', opts.idmanH || IDMAN_H, opts.idman || [
    [D('2026-06-02'), 1, 'Band Bent Over Row', 4, 20, 15, 123, 7.5, 0, ''],
    [D('2026-06-02'), 2, 'Standard Pull-up', 3, 9.666666667, 'Vücut', 142, 9.5, 1, 'Setler: 11-9-9'],
    [D('2026-05-24'), 1, 'Band Bent Over Row', 4, 15, 15, '-', 7.5, 0, ''],
  ]),
  H: new Sheet('H', ['Exercise', 'Goal Tag', 'Equipment', 'BW Coefficient', 'Swim Transfer Coefficient', 'Gemini STC', 'Chat GPT STC', 'Video'], [
    ['Band Bent Over Row', 'Rehab', 'Band', '—', 0.75, 0.65, 0.85, 'https://youtu.be/abc'],
    ['Standard Pull-up', 'Strength', 'Bodyweight', 0.95, 0.95, 0.9, 1, 'javascript:alert(1)'],
  ]),
  hkEtki: new Sheet('hkEtki', ['Exercise', 'Muscle Group', 'Muscle', 'Kinetic Chain', 'Yük Etki Oranı', 'Notlar'], [
    ['Band Bent Over Row', 'Back', 'Rhomboids', 'Upper Pull', 0.3, ''], ['Standard Pull-up', 'Back', 'Latissimus Dorsi', 'Upper Pull', '0,5', ''], ['Standard Pull-up', 'Biceps', 'Biceps', 'Upper Pull', 0.2, ''],
  ]),
  ref: new Sheet('ref', ['Parametre', 'Değer -1', 'Değer - 2', 'Değer - 3'], [['Faz-0', D('2025-11-25'), D('2026-01-04'), 'F0'], ['BW', D('2025-01-01'), D('2026-12-31'), 90]]),
}, 'secret', 'Salon.gs');

test('getSalon: katalog (yüzme katsayısı, güvenli video), etki, BW, geçmiş (Vücut, "-" nabız)', () => {
  const r = salonEnv().call({ action: 'getSalon' });
  assert.ok(r.ok, JSON.stringify(r));
  const d = r.data;
  assert.deepStrictEqual(d.katalog[0], { ad: 'Band Bent Over Row', amac: 'Rehab', ekipman: 'Band', bw: null, stc: 0.75, video: 'https://youtu.be/abc' });
  assert.strictEqual(d.katalog[1].video, '', 'youtube dışı adres kabul edilmez');
  assert.strictEqual(d.katalog[1].bw, 0.95);
  assert.deepStrictEqual(d.etki.map((x) => [x.ad, x.grup, x.oran]), [['Band Bent Over Row', 'Back', 0.3], ['Standard Pull-up', 'Back', 0.5], ['Standard Pull-up', 'Biceps', 0.2]]);
  assert.deepStrictEqual(d.bw, [{ ilk: '2025-01-01', son: '2026-12-31', kg: 90 }]);
  assert.strictEqual(d.gecmis.length, 3);
  assert.strictEqual(d.gecmis[1].agirlik, 'Vücut');
  assert.strictEqual(d.gecmis[1].tekrar, 9.666666667);
  assert.strictEqual(d.gecmis[2].nabiz, null, '"-" nabız boş sayılır');
  assert.strictEqual(d.gecmis[0].sure, '', 'Süre sütunu yoksa boş');
});

test('saveSalon: en üste A–J sırasıyla, K=Süre başlığı açılır, sayılar sayı, Vücut metin, tarih gerçek tarih', () => {
  const e = salonEnv();
  const r = e.call({ action: 'saveSalon', tarih: '2026-10-03', hareketler: [
    { hareket: 'Standard Pull-up', set: 3, tekrar: 29 / 3, agirlik: 'Vücut', nabiz: 142, rpe: 9.5, msi: 1, aciklama: 'Setler: 11-9-9. Omuz hassas', sure: '05:08' },
    { hareket: 'Band Bent Over Row', set: 4, tekrar: 20, agirlik: 15, nabiz: '', rpe: 7.5, msi: 0, aciklama: '', sure: '04:10' },
  ] });
  assert.ok(r.ok, JSON.stringify(r));
  assert.strictEqual(r.data.yazilan, 2);
  const sh = e.sheets.idman;
  assert.strictEqual(sh.data[0][10], 'Süre');
  const a = sh.data[1];
  assert.ok(a[0] instanceof e.CDate && a[0].toISOString().startsWith('2026-10-03'));
  assert.deepStrictEqual(a.slice(1, 10), [1, 'Standard Pull-up', 3, 9.67, 'Vücut', 142, 9.5, 1, 'Setler: 11-9-9. Omuz hassas']);
  assert.ok(Math.abs(a[10] * 86400 - 308) < 1e-6, 'süre gün kesri');
  assert.strictEqual(sh.fmt[1][10], '[mm]:ss');
  assert.deepStrictEqual(sh.data[2].slice(1, 9), [2, 'Band Bent Over Row', 4, 20, 15, '', 7.5, 0]);
  assert.strictEqual(sh.data[3][0].toISOString().slice(0, 10), '2026-06-02', 'eski satırlar aşağı kayar');
  // Geçmişte süre okunur
  const g = e.call({ action: 'getSalon' }).data.gecmis;
  assert.strictEqual(g[0].tarih, '2026-10-03');
});

test('saveSalon: aynı tarih DUPLICATE, boş liste BAD_REQUEST, bozuk tarih BAD_REQUEST, K doluysa MISSING_COLUMN', () => {
  const e = salonEnv();
  assert.strictEqual(e.call({ action: 'saveSalon', tarih: '2026-06-02', hareketler: [{ hareket: 'X', set: 1, tekrar: 1 }] }).error, 'DUPLICATE');
  assert.strictEqual(e.call({ action: 'saveSalon', tarih: '2026-10-03', hareketler: [] }).error, 'BAD_REQUEST');
  assert.strictEqual(e.call({ action: 'saveSalon', tarih: '03.10.2026', hareketler: [{ hareket: 'X' }] }).error, 'BAD_REQUEST');
  const e2 = salonEnv({ idmanH: [...IDMAN_H, 'Başka'], idman: [] });
  assert.strictEqual(e2.call({ action: 'saveSalon', tarih: '2026-10-03', hareketler: [{ hareket: 'X', set: 1, tekrar: 1 }] }).error, 'MISSING_COLUMN');
  const e3 = salonEnv({ idmanH: [...IDMAN_H, 'Süre'], idman: [] });
  assert.ok(e3.call({ action: 'saveSalon', tarih: '2026-10-03', hareketler: [{ hareket: 'X', set: 1, tekrar: 1, sure: '1:00' }] }).ok, 'var olan Süre başlığı kullanılır');
});

test('saveSalon: yazma hatasında satırlar geri alınır', () => {
  const e = salonEnv();
  e.sheets.idman.failOn = 'write';
  const r = e.call({ action: 'saveSalon', tarih: '2026-10-03', hareketler: [{ hareket: 'X', set: 1, tekrar: 1 }] });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(e.sheets.idman.data.length, 4, 'eklenen boş satır silindi');
});

test('savePlan / planYapildi (sürüm 13): plan sayfası yoksa açılır, gün satırları yenilenir, getSalon plan döner; idman dokunulmaz', () => {
  const e = salonEnv();
  const g0 = e.call({ action: 'getSalon' }).data;
  assert.ok(!('plan' in g0), 'plan sayfası yokken cevap eskisi gibi');
  const idman0 = JSON.stringify(e.sheets.idman.data);
  let r = e.call({ action: 'savePlan', tarih: '2026-10-07', hareketler: [{ hareket: 'Band Lat Pulldown', set: 4, tekrar: 20, agirlik: 15, dinlen: 60 }, { hareket: 'Deadbug', set: 3, tekrar: 40, agirlik: 'Vücut', ss: 'A', not: 'yavaş' }] });
  assert.ok(r.ok); assert.deepStrictEqual(r.data, { yazilan: 2, silinen: 0 });
  assert.deepStrictEqual(e.sheets.plan.data[0], ['Tarih', 'Sıra', 'Hareket', 'Set', 'Tekrar', 'Ağırlık', 'Süre', 'Dinlen', 'Süperset', 'Not', 'Durum']);
  e.call({ action: 'savePlan', tarih: '2026-10-09', hareketler: [{ hareket: 'Push-up (Standard)', set: 3, tekrar: 15, agirlik: 'Vücut' }] });
  r = e.call({ action: 'savePlan', tarih: '2026-10-07', hareketler: [{ hareket: 'Band Seated Row', set: 4, tekrar: 15, agirlik: 15 }] });
  assert.deepStrictEqual(r.data, { yazilan: 1, silinen: 2 }, 'aynı gün yenilenir');
  const plan = e.call({ action: 'getSalon' }).data.plan;
  assert.deepStrictEqual(plan.map((x) => [x.tarih, x.sira, x.hareket, x.agirlik, x.durum]), [['2026-10-07', 1, 'Band Seated Row', 15, ''], ['2026-10-09', 1, 'Push-up (Standard)', 'Vücut', '']]);
  assert.deepStrictEqual(e.call({ action: 'planYapildi', tarih: '2026-10-07' }).data, { isaretlenen: 1 });
  assert.strictEqual(e.call({ action: 'getSalon' }).data.plan[0].durum, 'yapıldı');
  assert.strictEqual(JSON.stringify(e.sheets.idman.data), idman0, 'idman sayfası değişmedi');
  assert.deepStrictEqual(e.call({ action: 'savePlan', tarih: '2026-10-09', hareketler: [] }).data, { yazilan: 0, silinen: 1 }, 'boş plan = günü sil');
  assert.strictEqual(e.call({ action: 'savePlan', tarih: '7.10.2026', hareketler: [] }).error, 'BAD_REQUEST');
  assert.strictEqual(salonEnv().call({ action: 'planYapildi', tarih: '2026-10-07' }).data.isaretlenen, 0, 'sayfa yoksa bir şey yapmaz');
});

console.log(`Salon/sporRef betik testleri: TAMAM (${n} senaryo)`);
