// Prototip kontrolü: her grup dokunuşla seçilir, panel açılır, ön/arka geçişi; ekran görüntüleri
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + path.join(__dirname, '../prototip.html')); await p.waitForTimeout(600);
  const shot = (n) => p.screenshot({ path: path.join(__dirname, n) });
  const tapG = async (v, g) => { const m = await p.evaluate(([v, g]) => D.a[v].merkez[g], [v, g]); const a = await p.evaluate((v) => [D.a[v].w, D.a[v].h], v);
    const r = await p.locator('#stage').boundingBox(); await p.touchscreen.tap(r.x + r.width * m[0] / a[0], r.y + r.height * m[1] / a[1]); await p.waitForTimeout(400); };
  await shot('s1.png');
  const res = {};
  for (const v of ['front', 'back']) {
    if (v === 'back') { await p.locator('#ok').click().catch(() => {}); await p.locator('#seg button[data-v=back]').click(); await p.waitForTimeout(500); }
    for (const g of await p.evaluate((v) => Object.keys(D.a[v].merkez), v)) { await tapG(v, g); res[v + ':' + g] = await p.locator('#sName').innerText(); }
  }
  console.log(res);
  // temiz senaryo
  await p.reload(); await p.waitForTimeout(600);
  await tapG('front', 'Göğüs'); await shot('s2.png');
  await p.locator('#ok').click(); await p.waitForTimeout(350);
  await p.locator('#seg button[data-v=back]').click(); await p.waitForTimeout(500);
  await tapG('back', 'Sırt'); await p.locator('#prio button[data-p="2"]').click(); await p.waitForTimeout(300); await shot('s3.png');
  await p.locator('#ok').click(); await p.waitForTimeout(400); await shot('s4.png');
  // boşluğa yakın dokunuş toleransı: kasın 6 px dışı
  console.log('errors', errs); await b.close(); })();
