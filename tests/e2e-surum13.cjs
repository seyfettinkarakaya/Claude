// Sürüm 13 uçtan uca senaryoları (videolar, salon programı, pratik öneriler, entegre model).
//   NODE_PATH=$(npm root -g) node tests/e2e-surum13.cjs [filtre]
const assert = require('assert');
const { runScenarios, D } = require('./harness.cjs');
const { Sheet } = require('./fakegas.cjs');
const { salonV12, toPlanList, gymBasla } = require('./e2e-surum12.cjs');

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
  await gymBasla(s);
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
  await gymBasla(s);
  const ses = await s.ls('ysk.salonSession');
  assert.equal(ses.programTarih, '2026-09-23');
  assert.deepEqual(ses.hareketler.map((x) => [x.ad, x.set, x.tekrar, x.agirlik, x.dinlen, x.sure]), [['Band Bent Over Row', 4, 12, 20, 75, 0], ['Front Plank', 3, 1, 'Vücut', 60, 45]]);
  assert.ok(ses.hareketler[0].ss && ses.hareketler[0].ss === ses.hareketler[1].ss, 'süperset');
});

// --- 13.3 pratik öneriler ---
const slPress = (s) => s.page.$eval('#sl-main', (b) => b.click());
async function setler(s, n) { for (let k = 0; k < n; k++) { await slPress(s); await s.adv(20); await slPress(s); if (k < n - 1) await s.adv(70); } }

sc('Hazır olma (P1): ana sayfada 10 sn kontrol → eklem MSI 2 → "dinlen" kararı; bugünün önerisi değişir; kayıt telefonda', async ({ launch }) => {
  const s = await launch({ ref: true }); const p = s.page;
  await s.waitScreen('home');
  await p.waitForSelector('[data-hw="hazir"]');
  assert.match(await txt(s, '[data-hw="hazir"]'), /Bugün nasılsın\? · 10 sn/);
  await p.click('[data-hw="hazir"]'); await s.waitModal('Bugün nasılsın?');
  await p.click('[data-hz="uyku"][data-v="4"]'); await p.click('[data-hz="eklem"][data-v="2"]');
  assert.match(await txt(s, '.hz-sonuc'), /Eklem ağrısı: bugün dinlen/);
  await s.modalClick('Kaydet');
  await p.waitForFunction(() => /Hazır olma %/.test(document.getElementById('home-week').textContent));
  assert.match(await txt(s, '#home-week'), /BUGÜN ÖNERİ\s*Eklem ağrısı: bugün dinlen.*Hazır olma %\d+ · Eklem ağrısı/);
  assert.deepEqual((await s.ls('ysk.hazir'))['2026-09-23'], { uyku: 4, agri: 1, enerji: 3, eklem: 2 });
});

sc('Dinlenme haftası (P10) ve haftalık set (P8): son kontrollerin çoğu yorgun → Form ve denge ile ana sayfada öneri; salonda kas grubu başına set', async ({ launch }) => {
  const hz = { '2026-09-16': { uyku: 2, agri: 4, enerji: 2, eklem: 0 }, '2026-09-18': { uyku: 3, agri: 3, enerji: 3, eklem: 0 }, '2026-09-19': { uyku: 2, agri: 3, enerji: 2, eklem: 0 } };
  const s = await launch({ salonSheets: salonV12(), ref: true, time: '2026-09-20T19:00:00', storage: { 'ysk.hazir': hz } }); const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => localStorage.getItem('ysk.salon'));
  await p.waitForFunction(() => /Dinlenme haftası öner/.test(document.getElementById('home-week').textContent));
  await p.click('[data-hw="form"]'); await s.waitScreen('form');
  const fm = await txt(s, '#fm-body');
  assert.match(fm, /Dinlenme haftası öner: son kontrollerin çoğunda yorgunluk/);
  assert.match(fm, /HAFTALIK SET · KAS GRUBU.*Omuz\s*3\s*az.*Sırt\s*3\s*az.*Karın\s*3\s*az/);
});

sc('Harekete sabit not (P6) ve ağırlık adımı (P7): kartta not + 2 kg adım → idman kartında 📌 not, ± 2 kg', async ({ launch }) => {
  const s = await launch({ salonSheets: salonV12(), ref: true }); const p = s.page;
  await toPlanList(s, ['Back']);
  await p.click('[data-sp-info="Band Bent Over Row"]'); await p.waitForSelector('#bilgi:not([hidden]) .bi-not');
  assert.match(await txt(s, '.bi-not'), /Sabit not yok/);
  await p.click('[data-bi-act="not"]'); await s.waitModal('📌 Band Bent Over Row');
  await p.fill('#bi-not-ta', 'yeşil bant, ayaklar omuz genişliğinde');
  await s.modalClick('Kaydet');
  await p.waitForFunction(() => /yeşil bant/.test(document.querySelector('.bi-not').textContent));
  await p.click('[data-bi-adim="2"]');
  assert.deepEqual(await s.ls('ysk.hareketNot'), { 'Band Bent Over Row': { not: 'yeşil bant, ayaklar omuz genişliğinde', adim: 2 } });
  // Türkçe adımlar (exercises-dataset, MIT): benzer hareketten
  assert.match(await txt(s, '#bi-body'), /NASIL YAPILIR \(benzer hareketten: band standing rear delt row\)/);
  assert.match(await txt(s, '#bi-body'), /Türkçe adımlar: exercises-dataset \(MIT/);
  await p.click('#bi-close');
  await p.click('[data-sp-ex="Band Bent Over Row"]'); await p.click('#sp-next'); await p.click('#sp-next');
  await s.waitScreen('salon'); await p.waitForSelector('#sl-wheel .w-item.is-active');
  assert.match(await txt(s, '#sl-wheel .w-item.is-active .w-card'), /📌 yeşil bant/);
  const kg0 = (await s.ls('ysk.salonSession')).hareketler[0].agirlik;
  await p.click('#sl-wheel .w-item.is-active [data-sl-w="1"]');
  assert.equal((await s.ls('ysk.salonSession')).hareketler[0].agirlik, kg0 + 2);
});

sc('RIR (P2) ve son set türü (P5): hareket sonu girişinde RIR 2 → RPE 8; "düşürme" nota yazılır', async ({ launch }) => {
  const s = await launch({ salonSheets: salonV12(), ref: true }); const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => !document.getElementById('home-gym-go').hidden);
  await gymBasla(s);
  await p.waitForSelector('#sl-wheel .w-item.is-active');
  await setler(s, 3);
  await p.waitForSelector('#sl-giris:not([hidden])');
  await p.click('[data-sg-rir="2"]');
  assert.equal(await p.getAttribute('#sg-body [data-sg="rpe"][data-v="8"]', 'class'), 'is-on');
  await p.click('[data-sg-tur="düşürme seti"]');
  await p.click('#sg-save');
  const g = Object.values((await s.ls('ysk.salonSession')).giris)[0];
  assert.equal(g.rpe, 8);
  assert.match(g.not, /son set: düşürme seti · RIR 2/);
});

sc('Yer (P4): planlamada "Otel" → yalnızca bant / vücut ağırlığı hareketleri; seçim hatırlanır', async ({ launch }) => {
  const s = await launch({ salonSheets: salonV12(), ref: true }); const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => localStorage.getItem('ysk.salon'));
  await p.click('#home-gym'); await s.waitScreen('salon-start');
  await p.click('[data-ss="plan"]'); await s.waitScreen('salon-plan');
  await p.click('[data-sp-yer="Otel"]');
  await p.click('[data-sp-grup="Shoulders"]'); await p.click('[data-sp-grup="Back"]'); await p.click('#sp-next');
  const names = await p.$$eval('.sp-ex:not(.is-yasak)', (e) => e.map((x) => x.querySelector('.sp-m b').firstChild.textContent.trim()));
  assert.ok(names.includes('Band External Rotation') && names.includes('Band Bent Over Row') && !names.includes('Dumbbell Shoulder Press'), JSON.stringify(names));
  assert.equal((await s.ls('ysk.prefs')).yer, 'Otel');
});

sc('Yedek (P12) ve bildirim ayarı (P11): Ayarlar\'dan JSON yedeği iner (anahtarlar hariç)', async ({ launch }) => {
  const s = await launch({ ref: true, storage: { 'ysk.hazir': { '2026-09-22': { uyku: 4, agri: 1, enerji: 4, eklem: 0 } } } }); const p = s.page;
  await s.waitScreen('home');
  await p.click('#home-settings'); await s.waitScreen('setup');
  assert.match(await txt(s, '#pref-bildirim'), /bildirim: kapalı/);
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#pref-yedek')]);
  assert.equal(dl.suggestedFilename(), 'yuzmesk-yedek-2026-09-23.json');
  const j = JSON.parse(require('fs').readFileSync(await dl.path(), 'utf8'));
  assert.equal(j.uygulama, 'YüzmeSK');
  assert.ok(j.veriler['ysk.hazir'] && !j.veriler['ysk.config'], 'anahtarlar yedekte yok');
});

sc('Bu hafta (M1–M10): faz, yük hedefi, sağlık bütçesi, 7 gün planı; önerilen salon günü düzenlenip plan sayfasına yazılır', async ({ launch }) => {
  const s = await launch({ salonSheets: salonV12(), ref: true, rows: [] }); const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => localStorage.getItem('ysk.salon'));
  assert.match(await txt(s, '[data-hw="buhafta"]'), /Bu hafta · yüzme \+ salon planı/);
  await p.click('[data-hw="buhafta"]'); await s.waitScreen('bu-hafta');
  const t = await txt(s, '#bh-body');
  assert.match(t, /DÖNGÜ KAPALI · varsayılan\s*Hacim/);
  assert.match(t, /HAFTALIK YÜK HEDEFİ.*kalan \d+/);
  assert.match(t, /SAĞLIK BÜTÇESİ · EKLEM\s*Omuz.*Kalça\s*0 \/ 10\s*% BR.*Diz\s*0 \/ 9\s*set/);
  // Çarşamba (bugün) salon, Perşembe aerobik yüzme, Cuma akşam yüzme; geçmiş günler boş
  assert.match(await txt(s, '[data-bh-gun="2026-09-23"]'), /Çarşamba.*öneri.*🏋 Salon · stabilite \+ core.*sabah 80 \/ öğle 65 dk/);
  assert.match(await txt(s, '[data-bh-gun="2026-09-24"]'), /Perşembe.*öneri.*🏊 Yüzme · aerobik hacim/);
  assert.match(await txt(s, '[data-bh-gun="2026-09-25"]'), /Cuma.*🏊 Yüzme · eşik \+ uzun aerobik.*akşam · sınırsız/);
  assert.doesNotMatch(await txt(s, '[data-bh-gun="2026-09-22"]'), /öneri/);
  assert.match(t, /ÖLÇÜM\s*📏 CSS testi/);
  if (process.env.SHOT) await p.screenshot({ path: `${process.env.SHOT}/buhafta.png`, fullPage: true });
  // Önerilen salon günü → plan (düzenlenebilir) → Programa yaz
  await p.click('[data-bh="salon"][data-t="2026-09-23"]'); await s.waitScreen('salon-plan');
  assert.equal(await txt(s, '#sp-title'), 'Önerilen salon günü');
  const n = await p.$$eval('.sp-pl', (e) => e.length);
  assert.ok(n >= 3 && n <= 7, `hareket sayısı ${n}`);
  assert.match(await txt(s, '[data-sp-prog]'), /Programa yaz · 23 Eylül/);
  await p.click('[data-sp-rm="0"]');
  await p.click('[data-sp-prog]'); await s.waitScreen('salon-prog');
  const plan = s.envs.SALON.sheets.plan;
  assert.equal(plan.data.slice(1).filter((r) => r[2]).length, n - 1);
  assert.equal(s.envs.SALON.sheets.idman.data.length, 4, 'idman sayfasına yazılmadı');
  // Bu hafta yeniden: Çarşamba artık "programda"
  await p.click('#pg-back'); await s.waitScreen('salon-start'); await p.click('#ss-back'); await s.waitScreen('home');
  await p.click('[data-hw="buhafta"]'); await s.waitScreen('bu-hafta');
  assert.match(await txt(s, '[data-bh-gun="2026-09-23"]'), /programda.*Salon programı/);
  assert.equal(await p.$$eval('[data-bh="salon"]', (e) => e.length), 0);
  assert.equal(s.net.external.length, 0);
});

sc('Bu hafta: hazır olma "dinlen" bugünü kapatır; yüzme programı 3 günü doldurunca salon uyarısı; döngü fazı salon planlamada görünür (M6, M7)', async ({ launch }) => {
  const s = await launch({ salonSheets: salonV12(), ref: true, storage: { 'ysk.hazir': { '2026-09-23': { uyku: 5, agri: 1, enerji: 5, eklem: 2 } }, 'ysk.prefs': { blokBas: '2026-09-14' } } }); const p = s.page;
  await s.waitScreen('home');
  await p.waitForFunction(() => localStorage.getItem('ysk.salon'));
  await p.click('[data-hw="buhafta"]'); await s.waitScreen('bu-hafta');
  const t = await txt(s, '#bh-body');
  assert.match(t, /DÖNGÜ · 2\. HAFTA\s*Hacim\+/);
  assert.match(await txt(s, '[data-bh-gun="2026-09-23"]'), /Bugün dinlen \(hazır olma\)/);
  assert.match(t, /Bu hafta salon günü yok/);
  await p.click('#bh-back'); await s.waitScreen('home');
  await p.click('#home-gym'); await s.waitScreen('salon-start');
  await p.click('[data-ss="plan"]'); await s.waitScreen('salon-plan');
  assert.match(await txt(s, '.sp-faz'), /Döngü · 2\. hafta Hacim\+ — salon: çekiş kuvveti/);
});

const only = process.argv[2];
if (require.main === module) runScenarios('Sürüm 13 senaryoları', only ? S.filter(([n]) => n.toLowerCase().includes(only.toLowerCase())) : S, 8160);
