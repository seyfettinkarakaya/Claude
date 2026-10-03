// v27 kas haritası prototipi: senaryonun seçimleri (Omuz ★★, Karın ★, Bacak ★) ile ekran görüntüleri
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  await p.goto('file://' + path.join(__dirname, '../../v27/prototip.html')); await p.waitForTimeout(600);
  const tapG = async (v, g) => { const m = await p.evaluate(([v, g]) => D.a[v].merkez[g], [v, g]); const a = await p.evaluate((v) => [D.a[v].w, D.a[v].h], v);
    const r = await p.locator('#stage').boundingBox(); await p.touchscreen.tap(r.x + r.width * m[0] / a[0], r.y + r.height * m[1] / a[1]); await p.waitForTimeout(450); };
  const out = (n) => p.screenshot({ path: path.join(__dirname, '..', 'ekran', n) });
  await out('h1-harita.png');
  await tapG('front', 'Omuz'); await p.click('#prio button[data-p="2"]'); await p.waitForTimeout(350); await out('h2-panel.png');
  await p.click('#ok'); await p.waitForTimeout(350);
  await tapG('front', 'Karın'); await p.click('#ok'); await p.waitForTimeout(350);
  await tapG('front', 'Bacak'); await p.click('#ok'); await p.waitForTimeout(450); await out('h3-secim.png');
  await b.close(); })();
