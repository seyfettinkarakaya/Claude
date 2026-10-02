// ref.js: sporRef CSS seçimi, tempo bölgeleri, RPE/MSI açıklamaları.
import assert from 'node:assert';
import { paceZones, zoneFor, cssFor, aletKeys, scaleText, DEFAULT_ZONES } from '../ref.js';

const alet = [
  { kod: 'Finn', ad: 'Finn' }, { kod: 'Paddle', ad: 'Paddle' }, { kod: 'PB', ad: 'Pullbuoy' },
];
const css = [
  { ilk: '2026-05-05', son: '2026-07-05', css: 124, alet: '', havuz: 25 },
  { ilk: '2026-07-06', son: '2026-08-31', css: 122, alet: '', havuz: 25 },
  { ilk: '2026-07-06', son: '2026-08-31', css: 117, alet: 'Paddle, PB', havuz: 25 },
  { ilk: '2026-07-06', son: '2026-08-31', css: 115, alet: 'Pullbuoy', havuz: 25 },
  { ilk: '2026-07-06', son: '2026-08-31', css: 123, alet: '', havuz: 50 },
];
const zones = [
  ...DEFAULT_ZONES.map((z) => ({ ...z, tur: 'PACE' })),
  { zone: 'REC', alt: 0, ust: 150, tur: 'HR' },
];
const ref = { css, zones, alet, rpe: ['1–2 — Çok kolay.', '7–8 — Zor.', '9 — Çok zor.', '10 — Maksimal.'], msi: ['0 — Ağrı yok.', '0,5 — Hafif his.', '1,5 — Artıyor.'] };

let n = 0;
const t = (name, fn) => { fn(); n++; };

t('aletKeys: kod ve ad eşleşir, sıra önemsiz', () => {
  assert.deepStrictEqual(aletKeys('PB, Paddle', alet), ['paddle', 'pullbuoy']);
  assert.deepStrictEqual(aletKeys('Pullbuoy', alet), ['pullbuoy']);
  assert.deepStrictEqual(aletKeys('', alet), []);
});

t('cssFor: tarih + havuz + alet', () => {
  assert.strictEqual(cssFor(ref, { tarih: '2026-07-10', havuz: 25, alet: '' }).css, 122);
  assert.strictEqual(cssFor(ref, { tarih: '2026-06-10', havuz: 25, alet: '' }).css, 124);
  assert.strictEqual(cssFor(ref, { tarih: '2026-07-10', havuz: 50, alet: '' }).css, 123);
  assert.strictEqual(cssFor(ref, { tarih: '2026-07-10', havuz: 25, alet: 'Paddle, PB' }).css, 117);
  assert.strictEqual(cssFor(ref, { tarih: '2026-07-10', havuz: 25, alet: 'PB' }).css, 115);
  assert.strictEqual(cssFor(ref, { tarih: '2026-07-10', havuz: 25, alet: 'Snorkel' }), null);
});

t('cssFor: aralık dışı → en son satır, stale', () => {
  const r = cssFor(ref, { tarih: '2026-10-02', havuz: 25, alet: '' });
  assert.strictEqual(r.css, 122);
  assert.strictEqual(r.stale, true);
  assert.strictEqual(cssFor(ref, { tarih: '2026-07-10', havuz: 25, alet: '' }).stale, false);
  // 50 m havuzda Pullbuoy yok → 25 m satırı
  assert.strictEqual(cssFor(ref, { tarih: '2026-07-10', havuz: 50, alet: 'PB' }).css, 115);
  assert.strictEqual(cssFor(null, { tarih: '2026-07-10' }), null);
});

t('paceZones: yalnız PACE, yavaştan hızlıya', () => {
  const z = paceZones(ref);
  assert.deepStrictEqual(z.map((x) => x.zone), ['REC', 'EN1', 'EN2', 'EN3', 'SP1', 'SP2', 'SP3']);
  assert.deepStrictEqual(z.map((x) => x.n), [1, 2, 3, 4, 5, 6, 7]);
  assert.strictEqual(z[0].ust, Infinity);
  assert.strictEqual(z[6].alt, -Infinity);
  assert.strictEqual(paceZones(null).length, 7);
});

t('zoneFor: alt ≤ fark < üst', () => {
  const z = paceZones(ref);
  assert.strictEqual(zoneFor(122, 122, z).zone, 'EN3');
  assert.strictEqual(zoneFor(125, 122, z).zone, 'EN2');
  assert.strictEqual(zoneFor(124.9, 122, z).zone, 'EN3');
  assert.strictEqual(zoneFor(143, 122, z).zone, 'REC');
  assert.strictEqual(zoneFor(100, 122, z).zone, 'SP3');
  assert.strictEqual(zoneFor(103, 122, z).zone, 'SP2');
  assert.strictEqual(zoneFor(null, 122, z), null);
  assert.strictEqual(zoneFor(120, null, z), null);
});

t('scaleText: aralık, tek değer, virgüllü', () => {
  assert.strictEqual(scaleText(ref.rpe, 7.5), 'Zor.');
  assert.strictEqual(scaleText(ref.rpe, 8.5), 'Zor.');
  assert.strictEqual(scaleText(ref.rpe, 9), 'Çok zor.');
  assert.strictEqual(scaleText(ref.msi, 0.5), 'Hafif his.');
  assert.strictEqual(scaleText(ref.msi, 1), 'Hafif his.');
  assert.strictEqual(scaleText(ref.msi, null), '');
  assert.strictEqual(scaleText(undefined, 3), '');
});

console.log(`ref.js testleri: TAMAM (${n})`);
