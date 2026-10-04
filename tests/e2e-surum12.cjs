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
  const s = await launch({ salonSheets: salonV12(), ref: true, viewport: { width: 390, height: 844 } }); const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => !document.getElementById('home-gym-go').hidden);
  assert.match(await txt(s, '#home-gym-go'), /SON İDMAN · 20 EYLÜL.*Dumbbell Shoulder Press, Band Bent Over Row.*2 hareket · ~.*2 harekette öneri uygulandı/);
  // Planla → Omuz → hareket → Kaydet
  await p.click('#home-gym-planla'); await s.waitScreen('salon-plan');
  await p.click('[data-sp-grup="Shoulders"]'); await p.click('#sp-next');
  await p.click('[data-sp-ex="Band External Rotation"]'); await p.click('[data-sp-ex="Dumbbell Shoulder Press"]');
  if (process.env.SHOT) await p.screenshot({ path: `${process.env.SHOT}/p2.png` });
  await p.click('#sp-next');
  if (process.env.SHOT) await p.screenshot({ path: `${process.env.SHOT}/p3.png` });
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
  if (process.env.SHOT) await p.screenshot({ path: `${process.env.SHOT}/geri.png` });
  assert.match(await txt(s, '#sl-wheel .w-item.is-active .w-card'), /15 kg.*öneri uygulandı: \+2,5 kg/);
  await p.click('#sl-wheel .w-item.is-active [data-sl-geri]');
  assert.match(await txt(s, '#sl-wheel .w-item.is-active .w-card'), /Hedef 3 × 10 · 12,5 kg/);
  assert.equal((await s.ls('ysk.salonSession')).hareketler[1].agirlik, 12.5);
});

/** Haritadaki grubun merkezine dokunur (harita.js META). */
async function hmTap(s, view, g) {
  const p = s.page;
  const [m, w, h] = await p.evaluate(([v, gg]) => import('./harita.js?v=11.0.1').then((H) => [H.META[v].merkez[gg], H.META[v].w, H.META[v].h]), [view, g]);
  await p.$eval('#hm-wrap', (e) => e.scrollIntoView({ block: 'center' }));
  const r = await p.locator('#hm-wrap .kf').boundingBox();
  await p.mouse.click(r.x + (r.width * m[0]) / w, r.y + (r.height * m[1]) / h);
}

sc('Kas haritası: dokun → ★ + panel; öncelik ★★; çipler ve ön/arka sayaçları; tabloda olmayan grup uyarısı; liste aynı önceliği gösterir', async ({ launch }) => {
  const s = await launch({ salonSheets: salonV12(), ref: true, viewport: { width: 390, height: 844 } }); const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => localStorage.getItem('ysk.salon'));
  await p.click('#home-gym'); await s.waitScreen('salon-start');
  await p.click('[data-ss="plan"]'); await s.waitScreen('salon-plan');
  await p.waitForSelector('#hm-wrap .kf');
  await p.waitForTimeout(300); // dokunma haritası yüklenir
  if (process.env.SHOT) await p.screenshot({ path: `${process.env.SHOT}/hm1.png` });
  await hmTap(s, 'front', 'Omuz');
  await p.waitForSelector('.hm-info');
  assert.match(await txt(s, '.hm-info'), /Omuz.*Son 4 hafta.*Tüm zaman.*★ Öncelik/);
  assert.match(await txt(s, '[data-sp-grup="Shoulders"]'), /ÖNCELİK/, 'liste aynı önceliği gösterir');
  await p.click('[data-hm-p="2"]');
  assert.match(await txt(s, '[data-sp-grup="Shoulders"]'), /ÖNCELİK ×2/);
  if (process.env.SHOT) await p.screenshot({ path: `${process.env.SHOT}/hm2.png` });
  await hmTap(s, 'front', 'Karın');
  assert.match(await txt(s, '[data-sp-grup="Core"]'), /ÖNCELİK/);
  assert.match(await txt(s, '.hm-chips'), /Omuz★★Karın★/);
  assert.match(await txt(s, '[data-hm-v="front"]'), /Ön2/);
  assert.match(await txt(s, '[data-hm-v="back"]'), /Arka1/, 'omuz arkada da görünür');
  // Kalça yanı tabloda yok → uyarı, öncelik verilmez
  await hmTap(s, 'front', 'Kalça yanı');
  await p.waitForFunction(() => /tabloda \(hkEtki\)/.test(document.getElementById('toast').textContent));
  // Arka yüz: Sırt
  await p.click('[data-hm-v="back"]');
  await p.waitForSelector('#hm-wrap .kf.back');
  await hmTap(s, 'back', 'Sırt');
  assert.match(await txt(s, '[data-sp-grup="Back"]'), /ÖNCELİK/);
  if (process.env.SHOT) await p.screenshot({ path: `${process.env.SHOT}/hm3.png`, fullPage: false });
  // Panelde Yok → öncelik kalkar
  await p.click('[data-hm-p="0"]');
  assert.doesNotMatch(await txt(s, '[data-sp-grup="Back"]'), /ÖNCELİK/);
  await p.click('#sp-next');
  const names = await p.$$eval('.sp-ex:not(.is-yasak)', (e) => e.map((x) => x.querySelector('.sp-m b').firstChild.textContent.trim()));
  assert.ok(names.includes('Dumbbell Shoulder Press') && names.includes('Front Plank') && !names.includes('Band Bent Over Row'), JSON.stringify(names));
});

const slPress = (s) => s.page.$eval('#sl-main', (b) => b.click());
/** Aktif hareketin n setini yapar (set 20 sn, dinlenme 70 sn). */
async function setler(s, n) {
  for (let k = 0; k < n; k++) { await slPress(s); await s.adv(20); await slPress(s); if (k < n - 1) await s.adv(70); }
}

sc('İdman: ısınma (kayda sayılmaz), set sırasında ağrı 1,5 → hafiflet; hareket sonu MSI ve not hazır; rekor; özet hacim + kaslar + rekor + kıyas', async ({ launch }) => {
  const s = await launch({ salonSheets: salonV12(), ref: true }); const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => !document.getElementById('home-gym-go').hidden);
  await p.click('#home-gym-start'); await s.waitScreen('salon');
  await p.waitForSelector('#sl-wheel .w-item.is-active');
  // Isınma
  assert.match(await txt(s, '#sl-warm'), /Isınma 0\/4 kayda sayılmaz/);
  await p.click('#sl-warm'); await s.waitModal('Isınma · 6 dk');
  await p.click('[data-isn="0"]'); await p.click('[data-isn="1"]');
  await s.modalClick('Bitti');
  assert.equal(await p.isHidden('#sl-warm'), true);
  assert.deepEqual((await s.ls('ysk.salonSession')).isinma, { tamam: [0, 1], bitti: true });
  // Shoulder Press (öneri: 15 kg) 1. set sırasında ağrı 1,5 → hafiflet
  assert.match(await txt(s, '#sl-wheel .w-item.is-active .w-card'), /Dumbbell Shoulder Press.*15 kg/);
  await slPress(s); await s.adv(10);
  await p.click('#sl-wheel .w-item.is-active [data-sl-agri]'); await s.waitModal('Ağrı · Dumbbell Shoulder Press');
  await p.click('#modal-body [data-value="1.5"]'); await s.waitModal('MSI 1,5 · hafiflet');
  assert.match(await txt(s, '#modal-body'), /Kalan setler: 12,5 kg \(önce 15 kg\) · 8 tekrar/);
  await s.modalClick('Hafifleterek devam');
  let x = (await s.ls('ysk.salonSession')).hareketler[0];
  assert.deepEqual([x.agirlik, x.tekrar], [12.5, 8]);
  await s.adv(10); await slPress(s); await s.adv(70);
  await setler(s, 2);
  await p.waitForSelector('#sl-giris:not([hidden])');
  assert.equal(await p.getAttribute('#sg-body [data-sg="msi"][data-v="1.5"]', 'class'), 'is-on', 'set sırasındaki ağrı hazır gelir');
  assert.match(await p.inputValue('#sg-not'), /MSI 1,5 \(1\. set\) · hafifletildi: 12,5 kg \(önce 15 kg\) · 8 tekrar/);
  await p.click('#sg-save');
  // Row: 17,5 kg (öneri) → en ağır rekor
  await p.waitForFunction(() => document.querySelector('#sl-wheel .w-item.is-active .sl-ad').textContent.trim() === 'Band Bent Over Row');
  await p.waitForFunction(() => /^1\. set/.test(document.getElementById('sl-main-sub').textContent));
  await s.adv(3);
  await setler(s, 3);
  await p.waitForSelector('#sl-giris:not([hidden])');
  await p.click('#sg-save');
  await p.waitForFunction(() => /🏆 Rekor · Band Bent Over Row: En ağır: 17,5 kg × 15/.test(document.getElementById('toast').textContent));
  await s.waitScreen('salon-ozet');
  const oz = await txt(s, '#so-body');
  assert.match(oz, /HACİM\s*1\.\d{3}\s*kg/);
  assert.match(oz, /ÇALIŞAN KASLAR.*Omuz.*Sırt/);
  assert.match(oz, /🏆 Rekor\s*Band Bent Over Row · En ağır: 17,5 kg × 15\s*önceki 15 kg/);
  assert.match(oz, /GEÇEN BENZER İDMANA GÖRE · 20 Eylül.*Hacim .* kg · geçen 1\.050 kg/);
  await p.click('#so-save'); await s.waitScreen('home');
  const I = s.envs.SALON.sheets.idman;
  assert.deepEqual(I.data.slice(1, 3).map((r) => [r[2], r[5], r[8]]), [['Dumbbell Shoulder Press', 12.5, 1.5], ['Band Bent Over Row', 17.5, '']]);
  assert.match(I.data[1][9], /hafifletildi/);
});

sc('İdman: set sırasında ağrı 2 → hareket durur (yapılan setle), hareket sonu MSI 2 ve "durduruldu" notu', async ({ launch }) => {
  const s = await launch({ salonSheets: salonV12(), ref: true }); const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => !document.getElementById('home-gym-go').hidden);
  await p.click('#home-gym-start'); await s.waitScreen('salon');
  await p.waitForSelector('#sl-wheel .w-item.is-active');
  await setler(s, 1); await s.adv(70);
  await slPress(s); await s.adv(10);
  await p.click('#sl-wheel .w-item.is-active [data-sl-agri]'); await s.waitModal('Ağrı');
  await p.click('#modal-body [data-value="2"]');
  await p.waitForSelector('#sl-giris:not([hidden])');
  assert.match(await txt(s, '#sg-body'), /SETLER\s*10-10/);
  assert.equal(await p.getAttribute('#sg-body [data-sg="msi"][data-v="2"]', 'class'), 'is-on');
  assert.match(await p.inputValue('#sg-not'), /MSI 2 \(2\. set\) · durduruldu/);
  assert.equal((await s.ls('ysk.salonSession')).hareketler[0].set, 2);
});

sc('Hareket bilgi kartı: planlamada ⓘ → Türkçe adımlar, yerel fotoğraf, kısıt; idman ayrıntısında mini vücut + son idmanlar grafiği + kart', async ({ launch }) => {
  const extra = [[D('2026-09-06'), 1, 'Dumbbell Shoulder Press', 3, 10, 10, 125, 7, 0, ''], [D('2026-08-30'), 1, 'Dumbbell Shoulder Press', 3, 8, 10, 125, 8, 0.5, '']];
  const s = await launch({ salonSheets: salonV12(extra), ref: true, viewport: { width: 390, height: 844 } }); const p = s.page;
  await toPlanList(s, ['Shoulders']);
  await p.click('[data-sp-info="Band External Rotation"]');
  await p.waitForSelector('#bilgi:not([hidden])');
  assert.equal(await txt(s, '#bi-title'), 'Bantla dış rotasyon');
  assert.match(await txt(s, '#bi-body'), /Band External Rotation.*ÇALIŞAN KAS\s*omuz.*✓ Kısıtlarına uygun.*NASIL YAPILIR.*Dirseği 90° bük.*SIK HATA.*Yüzmeye katkısı/);
  assert.equal(await p.getAttribute('#bi-media img', 'src'), 'img/hareket/External_Rotation_with_Band_0.webp');
  await p.waitForFunction(() => document.querySelector('#bi-media img').complete && document.querySelector('#bi-media img').naturalWidth > 0);
  if (process.env.SHOT) await p.screenshot({ path: `${process.env.SHOT}/bi1.png` });
  await p.click('#bi-close');
  assert.equal(await p.isHidden('#bilgi'), true);
  assert.deepEqual(await p.$$eval('.sp-ex.is-on', (e) => e.length), [0][0], 'ⓘ hareketi seçmez');
  // Goblet Squat: kısıtlı kart (⊘ + alternatif) — listeye yasaklıları göster, kartı plan dışında aç
  await p.click('[data-sp-ex="Dumbbell Shoulder Press"]'); await p.click('#sp-next'); await p.click('#sp-next');
  await s.waitScreen('salon'); await p.waitForSelector('#sl-wheel .w-item.is-active');
  await p.click('#sl-wheel .w-item.is-active .w-tag'); await p.waitForSelector('#sl-detail:not([hidden])');
  assert.match(await txt(s, '#sl-detail-body'), /SON 3 İDMAN · AĞIRLIK \(KG\)/);
  assert.equal(await p.$$eval('#sl-detail-body svg.hg circle.hit', (e) => e.length), 3);
  const titles = await p.$$eval('#sl-detail-body svg.hg circle.hit title', (e) => e.map((x) => x.textContent));
  assert.match(titles[0], /30\.08 · 10 kg · RPE 8 · MSI 0,5/);
  assert.match(titles[2], /20\.09 · 12,5 kg · RPE 7,5/);
  assert.equal(await p.$$eval('#sl-detail-body .dt-kas .kf.mini', (e) => e.length), 1);
  if (process.env.SHOT) await p.screenshot({ path: `${process.env.SHOT}/bi2.png` });
  await p.click('#sl-detail [data-bilgi]');
  await p.waitForSelector('#bilgi:not([hidden])');
  assert.equal(await txt(s, '#bi-title'), 'Dambıl omuz press');
  assert.match(await txt(s, '#bi-body'), /⚠ Sağ omuz: ağrısız aralıkta/);
});

sc('Süperset: planda bağla; set sonrası dinlenmeden sıradakine geçer, turun sonunda dinlenme; ısınma seti nota yazılır', async ({ launch }) => {
  const s = await launch({ salonSheets: salonV12(), ref: true }); const p = s.page;
  await toPlanList(s, ['Shoulders', 'Back']);
  await p.click('[data-sp-ex="Dumbbell Shoulder Press"]'); await p.click('[data-sp-ex="Band Bent Over Row"]');
  await p.click('#sp-next');
  await p.click('[data-sp-ss="0"]');
  assert.match(await txt(s, '[data-sp-ss="0"]'), /süperset · ayır/);
  await p.click('#sp-next'); await s.waitScreen('salon');
  await p.waitForSelector('#sl-wheel .w-item.is-active');
  const ses0 = await s.ls('ysk.salonSession');
  assert.ok(ses0.hareketler[0].ss && ses0.hareketler[0].ss === ses0.hareketler[1].ss);
  const title = () => p.$eval('#sl-wheel .w-item.is-active .sl-ad', (e) => e.textContent.trim());
  // Isınma seti (kayda sayılmaz)
  await p.click('#sl-wheel .w-item.is-active .w-tag'); await p.waitForSelector('#sl-detail:not([hidden])');
  await p.click('#sl-detail [data-sl-isn]');
  assert.match(await txt(s, '#sl-detail [data-sl-isn]'), /Isınma seti · 1/);
  await p.click('#sl-detail .dt-hint');
  assert.match(await txt(s, '#sl-wheel .w-item.is-active .w-tag'), /ISINMA 1/);
  // A seti → B'ye geçer, dinlenme yok
  await slPress(s); await s.adv(20); await slPress(s); await s.adv(1);
  await p.waitForFunction(() => document.querySelector('#sl-wheel .w-item.is-active .sl-ad').textContent.trim() === 'Band Bent Over Row');
  const timerOf = (ad) => p.$$eval('#sl-wheel .w-item', (els, a) => { const e = els.find((x) => x.querySelector('.sl-ad') && x.querySelector('.sl-ad').textContent.trim() === a); const tm = e && e.querySelector('.w-timer'); return tm ? tm.textContent.replace(/\s+/g, ' ').trim() : ''; }, ad);
  assert.match(await timerOf('Dumbbell Shoulder Press'), /SÜPERSET · DİNLENME YOK.*sıradaki: Band Bent Over Row/);
  // B seti → A'ya döner, normal dinlenme
  await s.adv(2); await slPress(s); await s.adv(20); await slPress(s); await s.adv(3);
  await p.waitForFunction(() => document.querySelector('#sl-wheel .w-item.is-active .sl-ad').textContent.trim() === 'Dumbbell Shoulder Press');
  assert.match(await timerOf('Band Bent Over Row'), /DİNLENME · 2\. SETE/);
  assert.equal(await title(), 'Dumbbell Shoulder Press');
  // bitir ve kaydet: ısınma notu
  await s.adv(60);
  await p.click('#sl-back'); await s.waitModal('Salon idmanı'); await s.modalClick('İdmanı bitir ve kaydet');
  await s.waitScreen('salon-ozet'); await p.click('#so-save'); await s.waitScreen('home');
  const I = s.envs.SALON.sheets.idman;
  assert.match(I.data[1][9], /^Setler: 10\. Isınma 1 set/);
  assert.equal(I.data[2][9], 'Setler: 15');
});

const only = process.argv[2];
if (require.main === module) runScenarios('Sürüm 12 senaryoları', only ? S.filter(([n]) => n.toLowerCase().includes(only.toLowerCase())) : S, 8150);
