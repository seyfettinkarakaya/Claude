// Salon uygulaması senaryosu: gerçek uygulama + sahte Apps Script ile baştan sona ekran görüntüleri.
//   NODE_PATH=$(npm root -g) node tasarim/senaryo/kaynak/cek.cjs
// Veri: kullanıcının 10 kas grubu adıyla (Core, Back, Chest, Shoulders, Biceps, Triceps, Forearms, Glutes, Hip, Legs).
const path = require('path');
const { runScenarios, D } = require('../../../tests/harness.cjs');
const { Sheet } = require('../../../tests/fakegas.cjs');
const OUT = path.join(__dirname, '..', 'ekran');
require('fs').mkdirSync(OUT, { recursive: true });

function veri() {
  const IDMAN_H = ['Tarih', 'No', 'Hareket', 'Set', 'Tekrar', 'Ağırlık', 'Nabız', 'RPE', 'MSI', 'Açıklama'];
  const H = [
    ['Band Bent Over Row', 'Rehab', 'Band', '—', 0.75, 'https://youtu.be/row1'],
    ['Standard Pull-up', 'Strength', 'Bodyweight', 0.95, 0.95, ''],
    ['Dumbbell Bench Press', 'Strength', 'Dumbbell', '—', 0.6, ''],
    ['Front Plank', 'Strength', 'Bodyweight', 0.6, 0.9, ''],
    ['Band Lat Pulldown', 'Rehab', 'Band', '—', 0.85, ''],
    ['Dumbbell Shoulder Press', 'Strength', 'Dumbbell', '—', 0.7, ''],
    ['Band External Rotation', 'Rehab', 'Band', '—', 0.8, ''],
    ['Goblet Squat', 'Strength', 'Dumbbell', '—', 0.65, ''],
    ['Hip Thrust', 'Strength', 'Barbell', '—', 0.7, ''],
    ['Dumbbell Curl', 'Hypertrophy', 'Dumbbell', '—', 0.4, ''],
    ['Triceps Pushdown', 'Hypertrophy', 'Cable', '—', 0.6, ''],
    ['Side Plank Abduction', 'Rehab', 'Bodyweight', 0.5, 0.6, ''],
  ];
  const E = [
    ['Band Bent Over Row', 'Back', 0.7], ['Band Bent Over Row', 'Biceps', 0.2], ['Band Bent Over Row', 'Forearms', 0.1],
    ['Standard Pull-up', 'Back', 0.6], ['Standard Pull-up', 'Biceps', 0.3], ['Standard Pull-up', 'Forearms', 0.1],
    ['Dumbbell Bench Press', 'Chest', 0.7], ['Dumbbell Bench Press', 'Triceps', 0.2], ['Dumbbell Bench Press', 'Shoulders', 0.1],
    ['Front Plank', 'Core', 1], ['Band Lat Pulldown', 'Back', 0.9], ['Band Lat Pulldown', 'Biceps', 0.1],
    ['Dumbbell Shoulder Press', 'Shoulders', 0.8], ['Dumbbell Shoulder Press', 'Triceps', 0.2],
    ['Band External Rotation', 'Shoulders', 1], ['Goblet Squat', 'Legs', 0.7], ['Goblet Squat', 'Glutes', 0.3],
    ['Hip Thrust', 'Glutes', 0.8], ['Hip Thrust', 'Hip', 0.2], ['Dumbbell Curl', 'Biceps', 0.85], ['Dumbbell Curl', 'Forearms', 0.15],
    ['Triceps Pushdown', 'Triceps', 1], ['Side Plank Abduction', 'Hip', 0.6], ['Side Plank Abduction', 'Core', 0.4],
  ].map(([a, g, o]) => [a, g, g, '', o]);
  return {
    idman: new Sheet('idman', IDMAN_H, [
      [D('2026-09-20'), 1, 'Band Bent Over Row', 4, 15, 15, 123, 7.5, 0, 'Setler: 15-15-15-15'],
      [D('2026-09-20'), 2, 'Standard Pull-up', 3, 9.666666667, 'Vücut', 142, 9.5, 1, 'Setler: 11-9-9'],
      [D('2026-09-20'), 3, 'Dumbbell Bench Press', 3, 10, 20, 131, 7, 0, ''],
      [D('2026-09-20'), 4, 'Front Plank', 3, 45, 'Vücut', 110, 6, 0, ''],
      [D('2026-09-16'), 1, 'Band Lat Pulldown', 3, 15, 20, 120, 7, 0, ''],
      [D('2026-09-16'), 2, 'Dumbbell Shoulder Press', 3, 10, 12.5, 128, 8, 0.5, ''],
      [D('2026-09-16'), 3, 'Dumbbell Curl', 3, 12, 10, 118, 7, 0, ''],
      [D('2026-09-12'), 1, 'Goblet Squat', 3, 12, 20, 135, 7, 0, ''],
      [D('2026-08-10'), 1, 'Hip Thrust', 3, 10, 60, 140, 8, 0, ''],
      [D('2026-08-10'), 2, 'Side Plank Abduction', 3, 30, 'Vücut', 115, 6, 0, ''],
    ]),
    H: new Sheet('H', ['Exercise', 'Goal Tag', 'Equipment', 'BW Coefficient', 'Swim Transfer Coefficient', 'Video'], H),
    hkEtki: new Sheet('hkEtki', ['Exercise', 'Muscle Group', 'Muscle', 'Kinetic Chain', 'Yük Etki Oranı'], E),
    ref: new Sheet('ref', ['Parametre', 'Değer -1', 'Değer - 2', 'Değer - 3'], [['BW', D('2025-01-01'), D('2026-12-31'), 82]]),
  };
}

let n = 0;
const shot = async (p, ad) => { n += 1; await p.waitForTimeout(250); await p.screenshot({ path: path.join(OUT, `${String(n).padStart(2, '0')}-${ad}.png`) }); };

runScenarios('Senaryo', [['salon baştan sona', async ({ launch }) => {
  const s = await launch({ salonSheets: veri(), ref: true, viewport: { width: 390, height: 844 }, time: '2026-09-23T07:30:00' });
  const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => /Son idman/.test(document.getElementById('home-gym-desc').textContent));
  await shot(p, 'ana-ekran');
  await p.click('#home-gym'); await s.waitScreen('salon-start'); await shot(p, 'salon-baslangic');
  await p.click('[data-ss="plan"]'); await s.waitScreen('salon-plan'); await shot(p, 'plan-1-hedef');
  await p.click('[data-sp-grup="Core"]'); await p.click('[data-sp-grup="Shoulders"]'); await p.click('[data-sp-grup="Shoulders"]');
  await p.click('[data-sp-grup="Legs"]');
  await shot(p, 'plan-1-oncelik');
  await p.click('#sp-next'); await shot(p, 'plan-2-hareketler');
  for (const a of ['Dumbbell Shoulder Press', 'Goblet Squat', 'Front Plank', 'Band External Rotation']) await p.click(`[data-sp-ex="${a}"]`);
  await shot(p, 'plan-2-secim');
  await p.click('#sp-next'); await shot(p, 'plan-3-plan');
  await p.click('#sp-next'); await s.waitScreen('salon'); await p.waitForSelector('#sl-wheel .w-item.is-active');
  await shot(p, 'idman-hazir');
  const press = () => p.$eval('#sl-main', (b) => b.click());
  await press(); await s.adv(25); await shot(p, 'idman-set-suruyor');
  await press(); await s.adv(40); await shot(p, 'idman-dinlenme');
  await s.adv(30); await press(); await s.adv(25); await press(); await s.adv(70); await press(); await s.adv(25); await press();
  await p.waitForSelector('#sl-giris:not([hidden])');
  await p.click('[data-sg="rpe"][data-v="8"]'); await p.click('[data-sg="msi"][data-v="0"]');
  await shot(p, 'hareket-sonu-giris');
  await p.click('#sg-save'); await p.waitForTimeout(600);
  await p.click('#sl-wheel .w-item.is-active .w-card'); await p.waitForSelector('#sl-detail:not([hidden])');
  await shot(p, 'kart-ayrinti');
  await p.click('#sl-detail'); // kapat
  await p.click('#sl-back'); await s.waitModal('Salon idmanı'); await shot(p, 'geri-menu');
  await s.modalClick('İdmanı bitir ve kaydet'); await s.waitScreen('salon-ozet'); await shot(p, 'ozet');
  await p.click('#so-save'); await s.waitScreen('home'); await shot(p, 'kayit-sonrasi-ana');
  await p.click('#home-history'); await s.waitScreen('history'); await shot(p, 'gecmis');
}]], 8790);
