// Sürüm 12 uçtan uca senaryoları (salon ve yüzme yenilikleri). Eski senaryolar e2e-senaryolar.cjs'te, değişmeden.
//   NODE_PATH=$(npm root -g) node tests/e2e-surum12.cjs [filtre]
const assert = require('assert');
const { runScenarios, D } = require('./harness.cjs');
const { Sheet } = require('./fakegas.cjs');

const S = [];
const sc = (name, fn) => S.push([name, fn]);
const txt = (s, sel) => s.page.$eval(sel, (e) => e.textContent.replace(/\s+/g, ' ').trim());

/** 10 kas grubu adlarıyla örnek SalonTakip (kısıtlı hareketler dahil). */
function salonV12(extraIdman = []) {
  const IDMAN_H = ['Tarih', 'No', 'Hareket', 'Set', 'Tekrar', 'Ağırlık', 'Nabız', 'RPE', 'MSI', 'Açıklama'];
  const H = [
    ['Dumbbell Shoulder Press', 'Strength', 'Dumbbell', '—', 0.7, ''],
    ['Band External Rotation', 'Rehab', 'Band', '—', 0.8, ''],
    ['Goblet Squat', 'Strength', 'Dumbbell', '—', 0.65, ''],
    ['Box Jump', 'Power', 'Other', '—', 0.5, ''],
    ['Bodyweight Squat', 'Strength', 'Bodyweight', 0.7, 0.6, ''],
    ['Front Plank', 'Strength', 'Bodyweight', 0.6, 0.9, ''],
    ['Band Bent Over Row', 'Rehab', 'Band', '—', 0.75, ''],
  ];
  const E = [
    ['Dumbbell Shoulder Press', 'Shoulders', 0.8], ['Dumbbell Shoulder Press', 'Triceps', 0.2],
    ['Band External Rotation', 'Shoulders', 1], ['Goblet Squat', 'Legs', 0.7], ['Goblet Squat', 'Glutes', 0.3],
    ['Box Jump', 'Legs', 1], ['Bodyweight Squat', 'Legs', 0.7], ['Bodyweight Squat', 'Glutes', 0.3],
    ['Front Plank', 'Core', 1], ['Band Bent Over Row', 'Back', 0.7], ['Band Bent Over Row', 'Biceps', 0.2], ['Band Bent Over Row', 'Forearms', 0.1],
  ].map(([a, g, o]) => [a, g, g, '', o]);
  return {
    idman: new Sheet('idman', IDMAN_H, [
      ...extraIdman,
      [D('2026-09-20'), 1, 'Dumbbell Shoulder Press', 3, 10, 12.5, 128, 7.5, 0, ''],
      [D('2026-09-20'), 2, 'Band Bent Over Row', 3, 15, 15, 120, 7, 0, ''],
      [D('2026-09-16'), 1, 'Front Plank', 3, 45, 'Vücut', 110, 6, 0, 'Setler: 45-45-45 sn'],
    ]),
    H: new Sheet('H', ['Exercise', 'Goal Tag', 'Equipment', 'BW Coefficient', 'Swim Transfer Coefficient', 'Video'], H),
    hkEtki: new Sheet('hkEtki', ['Exercise', 'Muscle Group', 'Muscle', 'Kinetic Chain', 'Yük Etki Oranı'], E),
    ref: new Sheet('ref', ['Parametre', 'Değer -1', 'Değer - 2', 'Değer - 3'], [['BW', D('2025-01-01'), D('2026-12-31'), 82]]),
  };
}
exports.salonV12 = salonV12;

async function toPlanList(s, gruplar) {
  const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => localStorage.getItem('ysk.salon'));
  await p.click('#home-gym'); await s.waitScreen('salon-start');
  await p.click('[data-ss="plan"]'); await s.waitScreen('salon-plan');
  for (const g of gruplar) await p.click(`[data-sp-grup="${g}"]`);
  await p.click('#sp-next');
}

sc('Kısıt: ağırlıklı squat ve zıplama listede gizli, gösterilince ⊘ + güvenli alternatif; dikkat notu; önleyici borç', async ({ launch }) => {
  const s = await launch({ salonSheets: salonV12(), ref: true }); const p = s.page;
  await toPlanList(s, ['Legs', 'Shoulders', 'Core']);
  const names = await p.$$eval('.sp-ex:not(.is-yasak)', (e) => e.map((x) => x.querySelector('.sp-m b').firstChild.textContent.trim()));
  assert.ok(!names.includes('Goblet Squat') && !names.includes('Box Jump'), JSON.stringify(names));
  assert.ok(names.includes('Bodyweight Squat'));
  assert.match(await txt(s, '[data-sp-ex="Bodyweight Squat"]'), /⚠ Derinlik en fazla 90°/);
  assert.match(await txt(s, '[data-sp-ex="Dumbbell Shoulder Press"]'), /Sağ omuz: ağrısız aralıkta/);
  assert.match(await txt(s, '.sp-borc'), /Omuz önleyici 0\/2.*Kalça stabilite 0\/1.*Core 0\/1/);
  assert.match(await txt(s, '[data-sp-ex="Band External Rotation"]'), /Önleyici: omuz önleyici borcu/);
  assert.match(await txt(s, '[data-sp-kg]'), /⊘ 2 hareket sağlık kısıtı nedeniyle gizlendi/);
  await p.click('[data-sp-kg]');
  const y = await p.$$eval('.sp-ex.is-yasak', (e) => e.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  assert.equal(y.length, 2);
  assert.ok(y.some((t) => /Goblet Squat.*ağırlıklı squat > 90°.*Yerine: Box Squat ≤ 90°/.test(t)), JSON.stringify(y));
  assert.ok(y.some((t) => /Box Jump.*zıplama yok/.test(t)));
  assert.equal(await p.$$eval('.sp-ex.is-yasak [data-sp-ex]', (e) => e.length), 0, 'yasaklı hareket seçilemez');
});

sc('Ana sayfadan doğrudan giriş: son idman (öneri uygulanmış) → Planla → Kaydet → "Hazır plan" → İdmana başla; plan tüketilir', async ({ launch }) => {
  const s = await launch({ salonSheets: salonV12(), ref: true }); const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => !document.getElementById('home-gym-go').hidden);
  assert.match(await txt(s, '#home-gym-go'), /SON İDMAN · 20 EYLÜL.*Dumbbell Shoulder Press, Band Bent Over Row.*2 hareket · ~.*2 harekette öneri uygulandı/);
  // Planla → Omuz → hareket → Kaydet
  await p.click('#home-gym-planla'); await s.waitScreen('salon-plan');
  await p.click('[data-sp-grup="Shoulders"]'); await p.click('#sp-next');
  await p.click('[data-sp-ex="Band External Rotation"]'); await p.click('[data-sp-ex="Dumbbell Shoulder Press"]');
  await p.click('#sp-next');
  assert.equal(await p.isHidden('#sp-save'), false);
  await p.click('#sp-save'); await s.waitScreen('home');
  assert.equal((await s.ls('ysk.salonPlan')).hareketler.length, 2);
  assert.match(await txt(s, '#home-gym-desc'), /Hazır plan · 2 hareket/);
  assert.match(await txt(s, '#home-gym-go'), /HAZIR PLAN.*Band External Rotation, Dumbbell Shoulder Press/);
  await p.click('#home-gym-start'); await s.waitScreen('salon');
  await p.waitForSelector('#sl-wheel .w-item.is-active');
  const ses = await s.ls('ysk.salonSession');
  assert.deepEqual(ses.hareketler.map((x) => x.ad), ['Band External Rotation', 'Dumbbell Shoulder Press']);
  assert.deepEqual(ses.oncelik, { Shoulders: 1 });
  assert.equal(await s.ls('ysk.salonPlan'), null, 'başlayınca plan tüketilir');
  // Shoulder Press kartında öneri uygulandı, geri al çalışır
  await s.goTo(1, '#sl-wheel');
  assert.match(await txt(s, '#sl-wheel .w-item.is-active .w-card'), /15 kg.*öneri uygulandı: \+2,5 kg/);
  await p.click('#sl-wheel .w-item.is-active [data-sl-geri]');
  assert.match(await txt(s, '#sl-wheel .w-item.is-active .w-card'), /Hedef 3 × 10 · 12,5 kg/);
  assert.equal((await s.ls('ysk.salonSession')).hareketler[1].agirlik, 12.5);
});

const only = process.argv[2];
if (require.main === module) runScenarios('Sürüm 12 senaryoları', only ? S.filter(([n]) => n.toLowerCase().includes(only.toLowerCase())) : S, 8150);
