// Sürüm 12 çekirdeği: grup.js (10 kas grubu), kisit.js (sağlık kısıtları), yuk.js (yük, form, toparlanma).
//   node tests/test-cekirdek.mjs
import assert from 'node:assert/strict';
import * as G from '../grup.js';
import * as K from '../kisit.js';
import * as Y from '../yuk.js';
import * as BI from '../bilgi.js';

let n = 0;
const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('BAŞARISIZ:', name); throw e; } };

t('grup: tablo adları → 10 grup, eski adlar, bilinmeyen gri', () => {
  assert.equal(G.grupAd('Back'), 'Sırt');
  assert.equal(G.grupAd('Biceps'), 'Biseps');
  assert.equal(G.grupAd('Forearms'), 'Ön kol');
  assert.equal(G.grupAd('Hip'), 'Kalça yanı');
  assert.equal(G.grupAd('Core'), 'Karın');
  assert.equal(G.grupAd('Abs'), 'Karın');
  assert.equal(G.grupAd('Legs'), 'Bacak');
  assert.equal(G.grupAd(' glutes '), 'Kalça');
  assert.equal(G.grupAd('Arms'), 'Kol');
  assert.equal(G.grupAd('Neck'), 'Neck');
  assert.equal(G.grupRenk('Neck'), '#94A3B8');
  assert.equal(G.grupRenk('Triceps'), '#33B5F0');
  assert.deepEqual(G.haritaGruplari('Arms'), ['Biseps', 'Triseps', 'Ön kol']);
  assert.deepEqual(G.haritaGruplari('Neck'), []);
  const p = G.haritaPay({ Back: 0.7, Arms: 0.3 });
  assert.equal(p['Sırt'], 0.7); assert.ok(Math.abs(p.Biseps - 0.1) < 1e-9);
  assert.deepEqual(G.sirala(['Legs', 'Neck', 'Shoulders', 'Arms']), ['Shoulders', 'Legs', 'Arms', 'Neck']);
});

t('kısıt: varsayılanlar; sporRef satırları geçersizleri atlayarak yerine geçer', () => {
  const v = K.kurallar(null);
  assert.equal(v.brAyMax, 10); assert.equal(v.kaynak, 'varsayılan'); assert.equal(v.tanilar.length, 3);
  const c = K.kurallar({ kisit: [
    { kural: 'tani', deger: 'Sağ kalça', aciklama: 'koşu yok' }, { kural: 'br_ay_max', deger: 8 }, { kural: 'squat_derinlik', deger: 'abc' },
    { kural: 'MSI_dur', deger: '1,5' }, { kural: 'sure_ogle', deger: 60 }, { kural: 'kulac_yuzus', deger: '12–14' }, { kural: 'omuz_rahatlatma', deger: 'hayır' },
    { kural: 'yasak', deger: 'Koşu; Jump' },
  ] });
  assert.deepEqual(c.tanilar, [{ ad: 'Sağ kalça', kural: 'koşu yok' }]);
  assert.equal(c.brAyMax, 8); assert.equal(c.squatDerinlik, 90, 'geçersiz değer: varsayılan');
  assert.equal(c.msi.dur, 1.5); assert.equal(c.sure.ogle, 60); assert.deepEqual(c.kulac.yuzus, [12, 14]);
  assert.equal(c.omuzRahatlatma, false); assert.deepEqual(c.yasak, ['koşu', 'jump']); assert.equal(c.kaynak, 'sporRef');
});

t('kısıt: hareket durumları (Perthes, omuz, elle kısıt, sözcük başı eşleşme)', () => {
  const h = (ad, ekipman = 'Dumbbell', extra = {}) => K.hareketKisit({ ad, ekipman, ...extra });
  assert.equal(h('Crunch').durum, 'uygun', '"run" Crunch\'ı yakalamaz');
  assert.equal(h('Treadmill Running').durum, 'yasak');
  assert.match(h('Box Jump').neden[0], /zıplama/);
  const g = h('Goblet Squat');
  assert.equal(g.durum, 'yasak'); assert.equal(g.alternatif, 'Box Squat ≤ 90°');
  assert.equal(h('Goblet Squat', 'Dumbbell', { alternatif: 'Glute Bridge' }).alternatif, 'Glute Bridge');
  assert.equal(h('Bodyweight Squat', 'Bodyweight').durum, 'dikkat');
  assert.equal(h('Box Squat', 'Barbell').durum, 'dikkat');
  assert.match(h('Dumbbell Shoulder Press').notlar[0], /omuz/i);
  assert.equal(h('Hip Thrust', 'Barbell', { kisit: 'yasak: diz' }).durum, 'yasak');
  assert.equal(h('Hip Thrust', 'Barbell', { kisit: 'yavaş' }).durum, 'dikkat');
});

t('kısıt: MSI kararı, hafifletme, süre bütçesi, kulaç normu', () => {
  assert.deepEqual([0, 0.5, 1, 1.5, 2, 3].map((v) => K.msiKarar(v).seviye), ['devam', 'gozlem', 'hafiflet', 'hafiflet', 'dur', 'tibbi']);
  assert.deepEqual(K.hafiflet({ tekrar: 10, agirlik: 15, sure: 0 }), { tekrar: 8, agirlik: 12.5, sure: 0 });
  assert.deepEqual(K.hafiflet({ tekrar: 1, agirlik: 'Vücut', sure: 45 }), { tekrar: 1, agirlik: 'Vücut', sure: 35 });
  assert.equal(K.hafiflet({ tekrar: 8, agirlik: 40, sure: 0 }).agirlik, 35, '%10 ile 2,5 adımın büyüğü');
  assert.deepEqual(K.sureButcesi(new Date(2026, 9, 6, 7, 30)), { dk: 80, dilim: 'sabah', gun: 'Sal' });
  assert.deepEqual(K.sureButcesi(new Date(2026, 9, 8, 12, 30)), { dk: 65, dilim: 'ogle', gun: 'Per' });
  assert.deepEqual(K.sureButcesi(new Date(2026, 9, 9, 19, 0)), { dk: null, dilim: 'aksam', gun: 'Cum' });
  assert.equal(K.kulacNormu({ tur: 'Drill' }).tur, 'drill');
  assert.equal(K.kulacNormu({ tur: 'Swim', alet: 'Şamandıra' }).tur, 'pull');
  assert.equal(K.kulacDurum(16, { tur: 'Swim' }).durum, 'yuksek');
  assert.equal(K.kulacDurum(14, { tur: 'Swim' }).durum, 'norm');
  assert.equal(K.kulacDurum(0, { tur: 'Swim' }), null);
});

const swim = (tarih, sure, rpe, setler, endedAt) => ({ tarih, seans: { sure, rpe }, setler, endedAt });
t('yük: yüzme + salon seansları, telefon/tablo birleşimi, kas yükü', () => {
  const hist = [
    swim('2026-10-06', '01:20:00', 6, [{ mesafe: 200, yapilan: 4, stil: 'FR', tur: 'Swim' }, { mesafe: 50, yapilan: 4, stil: 'BR', tur: 'Swim' }, { mesafe: 50, yapilan: 4, stil: 'FR', tur: 'Kick' }], Date.UTC(2026, 9, 6, 8)),
    { tur: 'salon', tarih: '2026-10-08', endedAt: 1, hareketler: [{ hareket: 'Row', set: 3, tekrar: 10, rpe: 8, sure: '05:00', msi: '' }] },
    { tur: 'salon', tarih: '2026-10-01', hareketler: [{ hareket: 'Eski', set: 3, tekrar: 10, rpe: 9, sure: '05:00' }] },
  ];
  const salonGecmis = [{ tarih: '2026-10-01', hareket: 'Row', set: 4, tekrar: 12, rpe: 7, sure: '10:00', msi: 1 }];
  const etkiPay = (ad) => (ad === 'Row' ? { Back: 0.8, Arms: 0.2 } : {});
  const L = Y.seanslar({ hist, salonGecmis, etkiPay });
  assert.deepEqual(L.map((s) => [s.tarih, s.tur]), [['2026-10-01', 'salon'], ['2026-10-06', 'yuzme'], ['2026-10-08', 'salon']]);
  const y = L[1];
  assert.equal(y.dk, 80); assert.equal(y.yuk, 480); assert.equal(y.metre, 1200);
  assert.deepEqual(y.stil, { FR: 1000, BR: 200 });
  const kas = Object.values(y.kas).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(kas - 480) < 1e-6, 'kas yükleri seans yükünü paylaştırır');
  assert.ok(y.kas.Bacak > y.kas.Triseps, 'kick ve BR bacağa yazılır');
  assert.equal(L[0].yuk, 70, 'tablodaki gün (10 dk × RPE 7) telefondakinin yerine geçer');
  assert.equal(L[0].msiMax, 1);
  assert.ok(Math.abs(L[2].kas['Sırt'] - 40 * 0.8) < 1e-9 && Math.abs(L[2].kas.Biseps - 40 * 0.2 / 3) < 1e-9, 'Arms üç gruba bölünür');
});

t('yük: form eğrisi, oran, toparlanma, BR payı, haftalık gün', () => {
  const g = {};
  for (let i = 0; i < 28; i++) g[Y.gunEkle('2026-09-10', i)] = i % 2 ? 0 : 400;
  const f = Y.formEgrisi(g, '2026-10-07', 20);
  assert.equal(f.length, 21); assert.equal(f[f.length - 1].tarih, '2026-10-07');
  assert.ok(f[f.length - 1].kondisyon > 0 && f[f.length - 1].yorgunluk > 0);
  assert.equal(Y.yukOrani({ '2026-10-01': 100 }, '2026-10-07'), null, '2 haftadan az veri');
  const r = Y.yukOrani(g, '2026-10-07');
  assert.ok(r > 0.8 && r < 1.3, String(r));
  assert.equal(Y.oranDurum(1.6).durum, 'yuksek'); assert.equal(Y.oranDurum(1.35).durum, 'sinirda'); assert.equal(Y.oranDurum(null).durum, 'bilinmiyor');
  const now = Date.UTC(2026, 9, 7, 8);
  const tp = Y.toparlanma([{ tarih: '2026-10-06', ts: Date.UTC(2026, 9, 6, 8), tur: 'yuzme', kas: { Omuz: 300 } }, { tarih: '2026-10-06', ts: Date.UTC(2026, 9, 6, 20), tur: 'salon', kas: { Omuz: 100 } }, { tarih: '2026-09-01', ts: 1, tur: 'salon', kas: { Bacak: 900 } }], now);
  assert.ok(tp.Omuz.toparlanma > 30 && tp.Omuz.toparlanma < 70, JSON.stringify(tp.Omuz));
  assert.ok(tp.Omuz.yuzmePay > 60);
  assert.equal(tp.Bacak, undefined, '4 günden eski yok sayılır');
  assert.deepEqual(Y.stilAy([{ tur: 'yuzme', tarih: '2026-10-06', stil: { FR: 900, BR: 100 } }, { tur: 'yuzme', tarih: '2026-09-30', stil: { BR: 500 } }], '2026-10'), { stil: { FR: 900, BR: 100 }, toplam: 1000, brOran: 10 });
  assert.equal(Y.haftaGunleri([{ tarih: '2026-10-05' }, { tarih: '2026-10-06' }, { tarih: '2026-10-06' }, { tarih: '2026-10-12' }], '2026-10-08'), 2);
  assert.equal(Y.sureSn('01:18:20'), 4700); assert.equal(Y.sureSn('4:10'), 250); assert.equal(Y.sureSn(''), 0);
  assert.equal(Y.yuzmeKatsayi({ yuzmeKas: [{ stil: 'fr', grup: 'Shoulders', katsayi: 0.5 }] }).FR.Omuz, 0.5);
});

t('bilgi: hareket adı eşleştirme (ekipman sözcüğü içerik sayılmaz, eşik), Görsel sütunu, kas yoğunluğu', () => {
  const db = [['External_Rotation_with_Band', 'External Rotation with Band'], ['Back_Flyes_-_With_Bands', 'Back Flyes - With Bands'], ['Dumbbell_Flyes', 'Dumbbell Flyes'],
    ['Pullups', 'Pullups'], ['Plank', 'Plank'], ['Push_Up_to_Side_Plank', 'Push Up to Side Plank'], ['Wide-Grip_Lat_Pulldown', 'Wide-Grip Lat Pulldown'], ['Crunches', 'Crunches']];
  assert.equal(BI.eslestir('Band External Rotation', db), 'External_Rotation_with_Band');
  assert.equal(BI.eslestir('Standard Pull-up', db), 'Pullups');
  assert.equal(BI.eslestir('Front Plank', db), 'Plank');
  assert.equal(BI.eslestir('Band Lat Pulldown', db), 'Wide-Grip_Lat_Pulldown');
  assert.equal(BI.eslestir('Band Chest Fly', db), null, 'göğüs fly sırt fly\'ına eşleşmez; ekipman da farklı → emin değil');
  assert.equal(BI.eslestir('Dumbbell Chest Fly', db), 'Dumbbell_Flyes');
  assert.equal(BI.eslestir('Side Plank Abduction', db), null, 'emin değilse eşleştirmez');
  assert.equal(BI.eslestir('Band Bent Over Row', db, 'Crunches'), 'Crunches', 'Görsel sütunu önce');
  assert.equal(BI.eslestir('', db), null);
  assert.deepEqual([...BI.sozcukler('Chin-Ups with Bands')], ['chinup', 'band']);
  assert.deepEqual(BI.kasYogunluk(['shoulders'], ['triceps', 'shoulders', 'lats']), { Triseps: 0.45, Omuz: 1, 'Sırt': 0.45 });
});
console.log(`çekirdek testleri: TAMAM (${n})`);
