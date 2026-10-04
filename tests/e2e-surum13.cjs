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

const only = process.argv[2];
if (require.main === module) runScenarios('Sürüm 13 senaryoları', only ? S.filter(([n]) => n.toLowerCase().includes(only.toLowerCase())) : S, 8160);
