const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 864, height: 956 }, deviceScaleFactor: 1 });
  for (const k of ['a', 'b', 'c']) {
    await p.goto(`file://${__dirname}/${k}.html`);
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${__dirname}/../${k}.png` });
  }
  await b.close();
})();
