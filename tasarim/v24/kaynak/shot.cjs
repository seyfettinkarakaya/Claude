// Önizleme: yerel HTTP sunucusu (CSS maskeleri aynı köken ister) + ekran görüntüsü
const { chromium } = require('playwright'); const http = require('http'); const fs = require('fs'); const path = require('path');
const T = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.css': 'text/css', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); const f = p.startsWith('/fonts/') ? path.join('/home/user/Claude', p) : path.join(__dirname, p);
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
(async () => { await new Promise((ok) => srv.listen(8765, ok)); const b = await chromium.launch();
  const jobs = process.argv.slice(2).map((a) => a.split(':'));
  for (const [name, w, h, out] of jobs) { const p = await b.newPage({ viewport: { width: +w, height: +h } });
    await p.goto(`http://localhost:8765/${name}.html`); await p.waitForTimeout(700); await p.screenshot({ path: path.join(__dirname, out) }); await p.close(); }
  await b.close(); srv.close(); })();
