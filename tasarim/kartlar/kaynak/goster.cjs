// Kart örnekleri: masaüstü (yan yana) ekran görüntüsü; animasyon durdurulup başlangıç karesi
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1260, height: 900 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + path.join(__dirname, '../kartlar.html')); await p.waitForTimeout(500);
  for (const m of await p.$$('[data-anim] [data-p="0"]')) await m.click();
  await p.waitForTimeout(600);
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await p.screenshot({ path: path.join(__dirname, '../kartlar.png'), fullPage: true });
  const q = await b.newPage({ viewport: { width: 390, height: 844 } }); await q.goto('file://' + path.join(__dirname, '../kartlar.html'));
  const ov2 = await q.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log('taşma', ov, ov2, errs); await b.close(); })();
