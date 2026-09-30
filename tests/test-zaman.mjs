// zaman.js birim testleri (ZAMANLAMA.md kabul kriterleri).
//   node tests/test-zaman.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ysk-z-'));
fs.copyFileSync(path.join(here, '..', 'zaman.js'), path.join(tmp, 'zaman.mjs'));
const Z = await import(pathToFileURL(path.join(tmp, 'zaman.mjs')).href);

const SETS = [
  { tekrar: 4, mesafe: 50, hedef: '01:00', dinlen: '00:15' },  // 0
  { tekrar: 2, mesafe: 100, hedef: '01:40', dinlen: '00:20' }, // 1
  { tekrar: 1, mesafe: 200, hedef: '04:00', dinlen: '' },      // 2
];
const S = 1000;
let n = 0;
const test = (name, fn) => { try { fn(); n++; } catch (e) { console.error('BAŞARISIZ:', name); throw e; } };

/** Olay üreteci: t0'dan itibaren saniye cinsinden. */
const E = (...list) => list.map(([t, sec, set]) => ({ t, ts: sec * S, ...(set != null ? { set } : {}) }));

test('boş liste: başlamadı; büyük düğme İDMANA BAŞLA', () => {
  const st = Z.replay([], SETS);
  assert.equal(st.phase, 'idle');
  assert.deepEqual(Z.mainAction(st, SETS, 0), { kind: 'basla' });
  assert.equal(Z.idmanMs(st, 99 * S), 0);
});

test('kabul 1: 4×50 sekiz dokunuşla; 4 tekrar, 3 set içi dinlenme, set sonu dinlenmesi', () => {
  const ev = E(['basla', 0], ['cik', 10, 0], ['geldim', 70], ['cik', 85, 0], ['geldim', 146], ['cik', 160, 0], ['geldim', 219],
    ['cik', 236, 0], ['geldim', 298], ['cik', 340, 1]);
  const st = Z.replay(ev, SETS);
  assert.deepEqual(Z.repTimes(st, 0), [60, 61, 59, 62].map((x) => x * S));
  assert.deepEqual(st.per[0].rests, [15, 14, 17].map((x) => x * S));
  assert.equal(st.per[0].sonu, 42 * S, 'set sonu = sonraki setin ilk ÇIK − son GELDİM');
  assert.equal(Z.setStatus(st, 0, 4), 'tamam');
  assert.equal(Z.setStatus(st, 1, 2), 'suruyor');
  assert.equal(st.phase, 'swim');
});

test('büyük düğme sırası: ÇIK → GELDİM → ÇIK (tekrar numarasıyla)', () => {
  let ev = E(['basla', 0]);
  assert.deepEqual(Z.mainAction(Z.replay(ev, SETS), SETS, 0), { kind: 'cik', set: 0, rep: 1, closes: null });
  ev = E(['basla', 0], ['cik', 5, 0]);
  assert.deepEqual(Z.mainAction(Z.replay(ev, SETS), SETS, 0), { kind: 'geldim', set: 0, rep: 1 });
  ev = E(['basla', 0], ['cik', 5, 0], ['geldim', 65]);
  assert.deepEqual(Z.mainAction(Z.replay(ev, SETS), SETS, 0), { kind: 'cik', set: 0, rep: 2, closes: null });
});

test('yüzerken tekerlek nerede olursa olsun düğme GELDİM', () => {
  const st = Z.replay(E(['basla', 0], ['cik', 5, 0]), SETS);
  assert.equal(Z.mainAction(st, SETS, 2).kind, 'geldim');
});

test('afterGeldim: set tamamlanınca sonraki başlanmamış set; son setin son tekrarı idmanı bitirir', () => {
  let st = Z.replay(E(['basla', 0], ['cik', 1, 0], ['geldim', 2], ['cik', 3, 0], ['geldim', 4]), SETS);
  assert.deepEqual(Z.afterGeldim(st, SETS), { complete: false, finish: false, next: 0 });
  const full = E(['basla', 0], ['cik', 1, 0], ['geldim', 2], ['cik', 3, 0], ['geldim', 4], ['cik', 5, 0], ['geldim', 6], ['cik', 7, 0], ['geldim', 8]);
  st = Z.replay(full, SETS);
  assert.deepEqual(Z.afterGeldim(st, SETS), { complete: true, finish: false, next: 1 });
  st = Z.replay([...full, ...E(['cik', 9, 2], ['geldim', 10])], SETS);
  assert.deepEqual(Z.afterGeldim(st, SETS), { complete: true, finish: true, next: 2 }, 'son set (1. set atlanmış olsa da)');
});

test('kabul 9: dinlenirken başka sete kaydırınca ÇIK n/N kapanacağını bildirir', () => {
  const st = Z.replay(E(['basla', 0], ['cik', 1, 0], ['geldim', 60], ['cik', 75, 0], ['geldim', 135]), SETS);
  assert.deepEqual(Z.mainAction(st, SETS, 1), { kind: 'cik', set: 1, rep: 1, closes: { set: 0, done: 2, tekrar: 4 } });
  const st2 = Z.replay(E(['basla', 0], ['cik', 1, 0], ['geldim', 60], ['cik', 75, 0], ['geldim', 135], ['cik', 160, 1]), SETS);
  assert.equal(Z.setStatus(st2, 0, 4), 'eksik');
  assert.equal(st2.per[0].sonu, 25 * S);
  assert.equal(Z.doneDistance(st2, SETS), 100, 'yapılan tekrarlar × mesafe');
});

test('tamamlanan sete dönülürse düğme "yok"', () => {
  const ev = E(['basla', 0], ['cik', 1, 2], ['geldim', 200]);
  const st = Z.replay(ev, SETS);
  assert.equal(Z.mainAction(st, SETS, 2).kind, 'yok');
  assert.equal(Z.mainAction(st, SETS, 0).kind, 'cik');
});

test('eksik bırakılan sete geri dönülüp devam edilebilir', () => {
  const ev = E(['basla', 0], ['cik', 1, 0], ['geldim', 60], ['cik', 80, 1], ['geldim', 180], ['cik', 200, 0]);
  const st = Z.replay(ev, SETS);
  assert.equal(Z.doneReps(st, 0), 1);
  assert.equal(st.per[0].reps.length, 2);
  assert.equal(st.per[1].sonu, 20 * S);
});

test('kabul 7: geri al = son olayı silmek (durum bir önceki hale döner)', () => {
  const ev = E(['basla', 0], ['cik', 1, 0], ['geldim', 60]);
  assert.equal(Z.replay(ev.slice(0, -1), SETS).phase, 'swim');
  assert.equal(Z.replay(ev.slice(0, -2), SETS).phase, 'ready');
  assert.equal(Z.replay([], SETS).phase, 'idle');
});

test('idman süresi duvar saati; bitir sonrası sabit', () => {
  const ev = E(['basla', 100], ['cik', 110, 2], ['geldim', 350], ['bitir', 350]);
  const st = Z.replay(ev, SETS);
  assert.equal(st.phase, 'done');
  assert.equal(Z.idmanMs(st, 9999 * S), 250 * S);
  assert.equal(Z.idmanMs(Z.replay(ev.slice(0, 3), SETS), 400 * S), 300 * S, 'sürerken şimdi − başla');
});

test('bozuk olaylar yok sayılır', () => {
  const ev = [{ t: 'geldim', ts: 1 }, { t: 'cik', ts: 2, set: 9 }, { t: 'basla', ts: 3 }, { t: 'cik', ts: 4, set: 0 }, { t: 'geldim', ts: 5 }, { t: 'geldim', ts: 6 }, { t: 'x', ts: 7 }];
  const st = Z.replay(ev, SETS);
  assert.equal(Z.doneReps(st, 0), 1);
  assert.equal(st.phase, 'rest');
});

test('kabul 2 ve 4: bip işaretleri 3-2-1 ve 0; sonrası ve öncesi yok', () => {
  assert.equal(Z.beepMark(5), null);
  assert.equal(Z.beepMark(3.0), 3);
  assert.equal(Z.beepMark(2.4), 3);
  assert.equal(Z.beepMark(1.9), 2);
  assert.equal(Z.beepMark(0.2), 1);
  assert.equal(Z.beepMark(0), 0);
  assert.equal(Z.beepMark(-1.4), 0);
  assert.equal(Z.beepMark(-2), null);
});

test('şüpheli tekrar: ortancadan %50 sapma, en az 3 tekrar', () => {
  assert.deepEqual(Z.suspects([58, 61, 161, 59].map((x) => x * S)), [2]);
  assert.deepEqual(Z.suspects([58, 61, 20, 59].map((x) => x * S)), [2], 'çok kısa da şüpheli');
  assert.deepEqual(Z.suspects([60, 150].map((x) => x * S)), [], 'iki tekrarda karar verilmez');
  assert.deepEqual(Z.suspects([60, 62, 64].map((x) => x * S)), []);
});

test('düzeltmeler: değer, çıkarma; ortalama çıkarılanlar hariç', () => {
  const t = [58, 61, 161, 59].map((x) => x * S);
  assert.equal(Z.effectiveTimes(t).avgMs, 84750);
  const e = Z.effectiveTimes(t, { 2: 60 * S });
  assert.equal(e.avgMs, 59500); assert.equal(e.all[2].edited, true);
  const d = Z.effectiveTimes(t, { 2: 'drop' });
  assert.equal(d.avgMs, (58 + 61 + 59) * S / 3); assert.equal(d.all[2].dropped, true);
  assert.equal(Z.effectiveTimes([], {}).avgMs, 0);
});

test('dinlenme notu önerisi: ort. ±5 sn veya tek ±10 sn', () => {
  assert.equal(Z.restDeviation([21, 19, 25].map((x) => x * S), 20).show, false, 'ort. +1.7');
  assert.equal(Z.restDeviation([26, 25, 27].map((x) => x * S), 20).show, true, 'ort. +6');
  assert.equal(Z.restDeviation([20, 20, 31].map((x) => x * S), 20).show, true, 'tek +11');
  assert.equal(Z.restDeviation([], 20).show, false);
  assert.equal(Math.round(Z.restDeviation([26, 25, 27].map((x) => x * S), 20).avgDev), 6);
});

test('nextUnstarted sarar; hepsi başlandıysa -1', () => {
  const st = Z.replay(E(['basla', 0], ['cik', 1, 1]), SETS);
  assert.equal(Z.nextUnstarted(st, 1), 2);
  assert.equal(Z.nextUnstarted(st, 2), 0);
  const st2 = Z.replay(E(['basla', 0], ['cik', 1, 0], ['cik', 2, 1], ['cik', 3, 2]), SETS);
  assert.equal(Z.nextUnstarted(st2, 0), -1);
});

test('ortanca', () => {
  assert.equal(Z.median([3, 1, 2]), 2);
  assert.equal(Z.median([4, 1, 2, 3]), 2.5);
  assert.equal(Z.median([]), 0);
});

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`zaman.js testleri: TAMAM (${n} senaryo)`);
