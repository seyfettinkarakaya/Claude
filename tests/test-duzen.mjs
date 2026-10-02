// duzen.js: idman anında plan düzenleme (ekle/sil/değiştir, olay kaydırma, plan farkı notu).
import assert from 'node:assert/strict';
import * as d from '../duzen.js';

const plan = [
  { sira: 1, blok: 'WU', tekrar: 1, mesafe: 200, stil: 'FR', tur: 'Swim', aciklama: 'a', hedef: '04:00', dinlen: '00:20', alet: '' },
  { sira: 2, blok: 'MS', tekrar: 4, mesafe: 100, stil: 'FR', tur: 'Swim', aciklama: 'b', hedef: '01:30', dinlen: '00:20', alet: '' },
  { sira: 3, blok: 'CD', tekrar: 1, mesafe: 200, stil: 'FR', tur: 'Swim', aciklama: 'c', hedef: '04:30', dinlen: '', alet: '' },
];
let n = 0;
const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('BAŞARISIZ:', name); throw e; } };

t('keyed: anahtar ve özgün hal bir kez eklenir', () => {
  const k = d.keyed(plan, (s, i) => String(s.sira || `i${i}`));
  assert.deepEqual(k.map((s) => s._k), ['1', '2', '3']);
  assert.equal(k[1]._o.tekrar, 4);
  k[1].tekrar = 6;
  const k2 = d.keyed(k, () => 'x');
  assert.equal(k2[1]._o.tekrar, 4, 'ikinci çağrı özgün hali ezmez');
  assert.equal(k2[1]._k, '2');
});

t('insertAfter: olaylar ve konum kayar', () => {
  const ev = [{ t: 'basla', ts: 1 }, { t: 'cik', ts: 2, set: 0 }, { t: 'geldim', ts: 3 }, { t: 'cik', ts: 4, set: 2 }];
  const ns = d.newSet({ ...plan[1], tekrar: 2 });
  const r = d.insertAfter({ setler: plan, events: ev, pos: 2 }, 0, ns);
  assert.equal(r.setler.length, 4);
  assert.equal(r.setler[1], ns);
  assert.deepEqual(r.events.map((e) => e.set), [undefined, 0, undefined, 3]);
  assert.equal(r.pos, 3);
  assert.equal(d.insertAfter({ setler: plan, events: [], pos: 0 }, 0, ns).pos, 0);
  assert.equal(ns._yeni, true);
  assert.equal(ns.sira, null);
});

t('removeAt: başlanmamış set silinir, sonrakiler kayar; başlanmış/tek set silinmez', () => {
  const ev = [{ t: 'cik', ts: 2, set: 0 }, { t: 'cik', ts: 4, set: 2 }];
  const r = d.removeAt({ setler: plan, events: ev, pos: 2 }, 1);
  assert.equal(r.setler.length, 2);
  assert.deepEqual(r.events.map((e) => e.set), [0, 1]);
  assert.equal(r.pos, 1);
  assert.throws(() => d.removeAt({ setler: plan, events: ev, pos: 0 }, 2), /Başlanmış/);
  assert.throws(() => d.removeAt({ setler: [plan[0]], events: [], pos: 0 }, 0), /Tek set/);
  assert.equal(d.removeAt({ setler: plan, events: [], pos: 2 }, 2).pos, 1, 'son set silinince konum geri gelir');
});

t('changes / planNote / payloadFields', () => {
  const k = d.keyed(plan, (s) => String(s.sira));
  assert.equal(d.changes(k[0]), null);
  assert.equal(d.planNote(k[0]), '');
  assert.deepEqual(d.payloadFields(k[0]), {});
  const e = { ...k[1], tekrar: 6, hedef: '01:25', alet: 'PB', aciklama: 'yeni' };
  assert.deepEqual(d.changes(e), { tekrar: 6, hedef: '01:25', alet: 'PB', aciklama: 'yeni' });
  assert.equal(d.planNote(e), 'Plan: 4×100 → 6×100, Hedef 1:30 → 1:25, Alet — → PB, açıklama değişti');
  assert.deepEqual(d.payloadFields(e), { plan: { tekrar: 6, hedef: '01:25', alet: 'PB', aciklama: 'yeni' } });
  const ns = d.newSet(plan[2]);
  assert.equal(d.planNote(ns), 'idmanda eklendi');
  assert.equal(d.payloadFields(ns).eklendi, true);
  assert.equal(d.payloadFields(ns).plan.mesafe, 200);
  assert.equal(d.changes({ ...k[1], tekrar: '4' }), null, '"4" ile 4 aynı');
});

t('rules: yüzerken kapalı, biten düzenlenmez, başlanan silinmez, tekrar ≥ yapılan', () => {
  assert.deepEqual(d.rules({ done: 0, started: false, finished: false, swimming: true }).canEdit, false);
  const r = d.rules({ done: 3, started: true, finished: false, swimming: false });
  assert.equal(r.canEdit, true); assert.equal(r.canDelete, false); assert.equal(r.minTekrar, 3);
  assert.deepEqual(r.splitFields, ['mesafe', 'stil']);
  assert.equal(d.rules({ done: 4, started: true, finished: true, swimming: false }).canEdit, false);
  assert.equal(d.rules({ done: 0, started: false, finished: false, swimming: false }).canDelete, true);
});

console.log(`duzen.js testleri: TAMAM (${n})`);
