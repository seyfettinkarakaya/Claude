// Sürüm 13 uçtan uca senaryoları (videolar, salon programı, pratik öneriler, entegre model).
//   NODE_PATH=$(npm root -g) node tests/e2e-surum13.cjs [filtre]
const assert = require('assert');
const { runScenarios, D } = require('./harness.cjs');
const { Sheet } = require('./fakegas.cjs');
const { salonV12, toPlanList } = require('./e2e-surum12.cjs');

const S = [];
const sc = (name, fn) => S.push([name, fn]);
const txt = (s, sel) => s.page.$eval(sel, (e) => e.textContent.replace(/\s+/g, ' ').trim());
exports.S = S;

/** salonV12 + H'de bir harekete YouTube bağlantısı. */
function salonVideo(hVideo = {}) {
  const sh = salonV12();
  sh.H.data = sh.H.data.map((r, i) => (i && hVideo[r[0]] ? [...r.slice(0, 5), hVideo[r[0]]] : r));
  return sh;
}

sc('Video: hareket kartında uygulama listesinden gömülü video (sessiz, döngü, çerezsiz); YouTube bağlantısı; kapatınca durur; planlama kartında "▶ Video"', async ({ launch }) => {
  const s = await launch({ salonSheets: salonV12(), ref: true, viewport: { width: 390, height: 844 } }); const p = s.page;
  await toPlanList(s, ['Back']);
  assert.match(await txt(s, '[data-sp-ex="Band Bent Over Row"] .sp-nasil'), /▶ Video · nasıl yapılır/);
  await p.click('[data-sp-info="Band Bent Over Row"]'); await p.waitForSelector('#bilgi:not([hidden]) .bi-vid iframe');
  const src = await p.getAttribute('.bi-vid iframe', 'src');
  assert.match(src, /^https:\/\/www\.youtube-nocookie\.com\/embed\/t7AwNxr_1vg\?/);
  assert.match(src, /mute=1/); assert.match(src, /loop=1/); assert.match(src, /autoplay=1/);
  assert.match(await txt(s, '.bi-vk'), /OPEX · uygulama listesinden · sessiz · döngü/);
  assert.equal(await p.getAttribute('.bi-vk a', 'href'), 'https://www.youtube.com/watch?v=t7AwNxr_1vg');
  assert.equal(await p.$$eval('#bi-media', (e) => e.length), 0, 'video varken fotoğraf yok');
  if (process.env.SHOT) await p.screenshot({ path: `${process.env.SHOT}/v1.png` });
  await p.waitForFunction(() => true);
  assert.ok(s.net.video.some((u) => u.includes('t7AwNxr_1vg')));
  await p.click('#bi-close');
  assert.equal(await p.$$eval('#bi-body iframe', (e) => e.length), 0, 'kapatınca video durur');
  assert.equal(s.net.external.length, 0);
});

sc('Video: H sayfasındaki Video sütunu listeden önce gelir; listede olmayan harekette bilgi notu', async ({ launch }) => {
  const s = await launch({ salonSheets: salonVideo({ 'Band External Rotation': 'https://youtu.be/AbCdEfGhIjK?t=5' }), ref: true }); const p = s.page;
  await toPlanList(s, ['Shoulders']);
  await p.click('[data-sp-info="Band External Rotation"]'); await p.waitForSelector('#bilgi:not([hidden]) .bi-vid iframe');
  assert.match(await p.getAttribute('.bi-vid iframe', 'src'), /embed\/AbCdEfGhIjK\?.*start=5/);
  assert.match(await txt(s, '.bi-vk'), /H · Video sütunundan/);
  await p.click('#bi-close');
  await p.click('[data-sp-info="Dumbbell Shoulder Press"]'); await p.waitForSelector('#bilgi:not([hidden])');
  assert.match(await txt(s, '#bi-body'), /videosu yok: H sayfasının Video sütununa/);
  assert.equal(await p.$$eval('#bi-body iframe', (e) => e.length), 0);
});

sc('Video: çevrimdışıyken video yerine fotoğraf ve not; idman kartında "▶ Form" kartı açar; Ayarlar özeti', async ({ launch }) => {
  const s = await launch({ salonSheets: salonV12(), ref: true }); const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => !document.getElementById('home-gym-go').hidden);
  await p.click('#home-gym-start'); await s.waitScreen('salon');
  await p.waitForSelector('#sl-wheel .w-item.is-active');
  await s.goTo(1, '#sl-wheel');
  assert.match(await txt(s, '#sl-wheel .w-item.is-active .w-card'), /Band Bent Over Row/);
  await p.click('#sl-wheel .w-item.is-active .sl-vform'); await p.waitForSelector('#bilgi:not([hidden]) .bi-vid iframe');
  await p.click('#bi-close');
  await p.context().setOffline(true);
  await p.click('#sl-wheel .w-item.is-active .sl-vform'); await p.waitForSelector('#bilgi:not([hidden])');
  assert.match(await txt(s, '#bi-body'), /📶 Çevrimdışı: video internet gelince oynar/);
  assert.equal(await p.$$eval('#bi-body iframe', (e) => e.length), 0);
  await p.context().setOffline(false);
  await p.click('#bi-close');
  assert.equal((await s.ls('ysk.salonSession')).events.length, 0, 'form videosu idmanı başlatmaz');
});

sc('Video: Ayarlar\'da kaynak özeti (61 hareket, OPEX 33) ve lisans notu', async ({ launch }) => {
  const s = await launch({ ref: true }); const p = s.page;
  await s.waitScreen('home');
  await p.click('#home-settings'); await s.waitScreen('setup');
  assert.match(await txt(s, '#pref-video'), /uygulama listesinde 61 hareket \(OPEX 33, diğer 28\)/);
  assert.match(await txt(s, '#pref-lisans'), /YouTube'un kendi oynatıcısıyla/);
});

const PLAN_H = ['Tarih', 'Sıra', 'Hareket', 'Set', 'Tekrar', 'Ağırlık', 'Süre', 'Dinlen', 'Süperset', 'Not', 'Durum'];

sc('Salon programı: haftalık görünüm; boş güne planla → "Programa yaz" → SalonTakip plan sayfası açılır, gün kartında hareketler; Düzenle / Sil', async ({ launch }) => {
  const s = await launch({ salonSheets: salonV12(), ref: true }); const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => localStorage.getItem('ysk.salon'));
  await p.click('#home-gym'); await s.waitScreen('salon-start');
  await p.click('[data-ss="prog"]'); await s.waitScreen('salon-prog');
  assert.match(await txt(s, '#pg-title'), /21 Eylül Pazartesi – 27 Eylül Pazar/);
  assert.match(await txt(s, '#pg-body'), /"plan" sayfası gerekir/);
  assert.match(await txt(s, '[data-pg-gun="2026-09-23"]'), /Çarşamba.*🏊 yüzme/);
  await p.click('[data-pg="planla"][data-t="2026-09-24"]'); await s.waitScreen('salon-plan');
  await p.click('[data-sp-grup="Shoulders"]'); await p.click('#sp-next');
  await p.click('[data-sp-ex="Band External Rotation"]'); await p.click('[data-sp-ex="Dumbbell Shoulder Press"]');
  await p.click('#sp-next');
  assert.match(await txt(s, '[data-sp-prog]'), /Programa yaz · 24 Eylül/);
  await p.click('[data-sp-prog]'); await s.waitScreen('salon-prog');
  const plan = s.envs.SALON.sheets.plan;
  assert.ok(plan, 'plan sayfası açıldı');
  assert.deepEqual(plan.data.slice(1).map((r) => [r[1], r[2]]), [[1, 'Band External Rotation'], [2, 'Dumbbell Shoulder Press']]);
  await p.waitForFunction(() => /2 hareket/.test(document.querySelector('[data-pg-gun="2026-09-24"]').textContent));
  assert.match(await txt(s, '[data-pg-gun="2026-09-24"]'), /Band External Rotation.*Dumbbell Shoulder Press/);
  assert.equal(s.envs.SALON.sheets.idman.data.length, 4, 'idman sayfasına yazılmadı');
  // Düzenle → bir hareket çıkar → yeniden yaz
  await p.click('[data-pg="duzenle"][data-t="2026-09-24"]'); await s.waitScreen('salon-plan');
  assert.equal(await txt(s, '#sp-title'), 'Programı düzenle');
  await p.click('[data-sp-rm="0"]');
  await p.click('[data-sp-prog]'); await s.waitScreen('salon-prog');
  await p.waitForFunction(() => /1 hareket/.test(document.querySelector('[data-pg-gun="2026-09-24"]').textContent));
  assert.equal(plan.data.slice(1).filter((r) => r[2]).length, 1);
  // Sil
  await p.click('[data-pg="sil"][data-t="2026-09-24"]'); await s.waitModal('Programı sil'); await s.modalClick('Sil');
  await p.waitForFunction(() => /Bu güne salon planla/.test(document.querySelector('[data-pg-gun="2026-09-24"]').textContent));
});

sc('Salon programı: bugünün programı tabloda varsa ana sayfada "BUGÜNÜN PROGRAMI" → İdmana başla programdaki değerlerle; süperset korunur', async ({ launch }) => {
  const sh = salonV12();
  sh.plan = new Sheet('plan', PLAN_H, [
    [D('2026-09-23'), 1, 'Band Bent Over Row', 4, 12, 20, '', 75, 'A', '', ''],
    [D('2026-09-23'), 2, 'Front Plank', 3, 1, 'Vücut', 45, 60, 'A', '', ''],
    [D('2026-09-25'), 1, 'Dumbbell Shoulder Press', 3, 10, 12.5, '', 90, '', '', ''],
  ]);
  const s = await launch({ salonSheets: sh, ref: true }); const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => !document.getElementById('home-gym-go').hidden && /PROGRAM/.test(document.getElementById('home-gym-go').textContent));
  assert.match(await txt(s, '#home-gym-go'), /BUGÜNÜN PROGRAMI · TABLODAN.*Band Bent Over Row\s*4×12.*Front Plank\s*3×45sn/);
  await p.click('#home-gym-start'); await s.waitScreen('salon');
  const ses = await s.ls('ysk.salonSession');
  assert.equal(ses.programTarih, '2026-09-23');
  assert.deepEqual(ses.hareketler.map((x) => [x.ad, x.set, x.tekrar, x.agirlik, x.dinlen, x.sure]), [['Band Bent Over Row', 4, 12, 20, 75, 0], ['Front Plank', 3, 1, 'Vücut', 60, 45]]);
  assert.ok(ses.hareketler[0].ss && ses.hareketler[0].ss === ses.hareketler[1].ss, 'süperset');
});

const only = process.argv[2];
if (require.main === module) runScenarios('Sürüm 13 senaryoları', only ? S.filter(([n]) => n.toLowerCase().includes(only.toLowerCase())) : S, 8160);
