// Öneri panosu görüntüleri: masaüstü ve telefon (tam sayfa)
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch();
  for (const [w, h, out] of [[1200, 900, 'pano-masaustu.png'], [390, 844, 'pano-telefon.png']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('file://' + path.join(__dirname, '../oneriler.html')); await p.waitForTimeout(800);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    await p.screenshot({ path: path.join(__dirname, '..', out), fullPage: true }); console.log(out, 'yatay taşma', ov, errs); await p.close(); }
  await b.close(); })();
