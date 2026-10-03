const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 760, height: 700 } });
  await p.goto(`file://${__dirname}/${process.argv[2]}.html`); await p.waitForTimeout(300);
  await p.screenshot({ path: `${__dirname}/${process.argv[3] || process.argv[2]}.png` }); await b.close(); })();
