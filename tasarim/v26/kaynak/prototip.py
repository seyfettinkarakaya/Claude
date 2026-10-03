# Dokunmatik kas haritası prototipi (tek dosya): kasa dokun → öncelik ★ → ★★ → kapalı
import json, base64
B = json.load(open('bolgeler.json'))
img = {v: base64.b64encode(open(f'r/{v}.webp', 'rb').read()).decode() for v in ('front', 'back')}
fonts = open('/home/user/Claude/fonts/fonts.css').read()
for f in ('archivo-var-latin.woff2', 'archivo-var-latin-ext.woff2', 'barlow-condensed-700-latin.woff2', 'barlow-condensed-700-latin-ext.woff2'):
    try:
        fonts = fonts.replace(f'url({f})', 'url(data:font/woff2;base64,' + base64.b64encode(open('/home/user/Claude/fonts/' + f, 'rb').read()).decode() + ')')
    except FileNotFoundError:
        pass
KAS = {'Sırt': (38, 27), 'Gövde': (9, 19), 'Göğüs': (12, 13), 'Omuz': (16, 14), 'Kol': (14, 9), 'Kalça': (6, 10), 'Bacak': (5, 8)}
def figure(v):
    d = B[v]
    paths = ''.join(f'<path class="m" data-g="{g}" d="{p}"/>' for g, p in d['grup'].items() if p)
    stars = ''.join(f'<g class="st" data-g="{g}" transform="translate({x},{y})"><circle r="11"/><text y="4">★</text></g>' for g, (x, y) in d['merkez'].items())
    return f'''<div class="fig" style="flex:{d["w"]}"><svg viewBox="0 0 {d["w"]} {d["h"]}"><image href="data:image/webp;base64,{img[v]}" width="{d["w"]}" height="{d["h"]}"/>{paths}{stars}</svg>
      <span class="vw">{"ÖN" if v == "front" else "ARKA"}</span></div>'''
html = f'''<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kas haritası</title><style>{fonts}
:root{{--amb:#F5A524}}
*{{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}}
body{{background:#0B0F14;color:#EDEFF2;font-family:Archivo,system-ui,sans-serif;min-height:100vh;display:flex;justify-content:center}}
.ph{{width:100%;max-width:430px;padding:20px 16px 120px}}
h1{{font-size:26px;font-weight:800}} .sub{{font-size:14px;color:#8B97A5;font-weight:700;margin-top:4px}}
.info{{margin-top:14px;height:78px;padding:10px 14px;border-radius:18px;background:#141B23;border:1px solid #1E2731;display:flex;align-items:center;justify-content:space-between;gap:10px}}
.info b{{font-size:21px}} .info small{{display:block;font-size:14px;color:#8B97A5;font-weight:700;margin-top:2px}}
.info .p{{font-size:15px;font-weight:900;padding:8px 12px;border-radius:12px;border:2px solid #2A3440;color:#8B97A5;white-space:nowrap}}
.info .p.on{{background:var(--amb);border-color:var(--amb);color:#1A0E04}}
.map{{display:flex;gap:6px;margin-top:12px}}
.fig{{position:relative;flex:1}} .fig svg{{display:block;width:100%;height:auto;overflow:visible}}
.vw{{display:block;text-align:center;font-size:12px;font-weight:800;letter-spacing:1.6px;color:#5F6B78;margin-top:2px}}
.m{{fill:transparent;stroke:transparent;stroke-width:1.5;cursor:pointer;transition:fill .15s,stroke .15s}}
.m.sel{{fill:rgba(245,165,36,.42);stroke:var(--amb)}}
.m.p2{{fill:rgba(245,165,36,.55);stroke-width:2.4;filter:drop-shadow(0 0 3px var(--amb))}}
.m.now{{stroke:#fff;stroke-dasharray:3 2}}
.st{{display:none;pointer-events:none}} .st.on{{display:inline}}
.st circle{{fill:var(--amb);stroke:#0B0F14;stroke-width:2.5}} .st text{{text-anchor:middle;font-size:12px;font-weight:900;fill:#1A0E04}}
.lb{{font-size:13px;font-weight:800;letter-spacing:1.8px;color:#8B97A5;margin:16px 0 8px}}
.chips{{display:flex;flex-wrap:wrap;gap:8px}} .chip{{padding:9px 14px;border-radius:999px;background:#1A1710;border:2px solid var(--amb);font-size:16px;font-weight:800}}
.chip em{{font-style:normal;color:var(--amb);margin-left:6px}} .none{{font-size:15px;color:#5F6B78;font-weight:700}}
.cta{{position:fixed;left:50%;transform:translateX(-50%);bottom:20px;width:calc(100% - 32px);max-width:398px;height:66px;border-radius:22px;background:var(--amb);color:#1A0E04;display:flex;align-items:center;justify-content:space-between;padding:0 22px;font-size:20px;font-weight:800}}
.cta small{{font-size:14px;opacity:.7}}
</style></head><body><div class="ph">
<h1>Neyi çalışalım?</h1><p class="sub">Kasa dokun: ★ öncelik → ★★ çift → kapalı</p>
<div class="info" id="info"><div><b>Bir kasa dokun</b><small>son 4 hafta ve tüm zaman dağılımı burada</small></div></div>
<div class="map">{figure("front")}{figure("back")}</div>
<p class="lb">ÖNCELİKLER</p><div class="chips" id="chips"><span class="none">Henüz seçilmedi</span></div>
</div><div class="cta"><span>Hareketleri getir</span><small id="cnt">tüm gruplar ›</small></div>
<script>
const KAS = {json.dumps(KAS, ensure_ascii=False)};
const P = {{}};
let now = null;
function draw() {{
  document.querySelectorAll('.m').forEach((e) => {{ const p = P[e.dataset.g] || 0; e.classList.toggle('sel', p > 0); e.classList.toggle('p2', p === 2); e.classList.toggle('now', e.dataset.g === now && !p); }});
  document.querySelectorAll('.st').forEach((e) => {{ const p = P[e.dataset.g] || 0; e.classList.toggle('on', p > 0); e.querySelector('text').textContent = p === 2 ? '★★' : '★'; e.querySelector('text').style.fontSize = p === 2 ? '9px' : '12px'; }});
  const sel = Object.entries(P).filter(([, p]) => p > 0);
  document.getElementById('chips').innerHTML = sel.length ? sel.map(([g, p]) => `<span class="chip">${{g}}<em>${{p === 2 ? '★★' : '★'}}</em></span>`).join('') : '<span class="none">Henüz seçilmedi</span>';
  document.getElementById('cnt').textContent = sel.length ? `${{sel.length}} öncelik ›` : 'tüm gruplar ›';
  if (now) {{
    const [s, t] = KAS[now]; const p = P[now] || 0; const d = s - t;
    document.getElementById('info').innerHTML = `<div><b>${{now}}</b><small>4 hafta %${{s}} · tümü %${{t}} · <span style="color:${{d >= 0 ? '#3DDC84' : '#F87171'}}">${{d >= 0 ? '+' : ''}}${{d}}</span></small></div><span class="p ${{p ? 'on' : ''}}">${{p === 2 ? '★★ çift' : p ? '★ öncelik' : 'öncelik yok'}}</span>`;
  }}
}}
document.querySelectorAll('.m').forEach((e) => e.addEventListener('click', () => {{
  const g = e.dataset.g; now = g; P[g] = ((P[g] || 0) + 1) % 3; draw();
}}));
</script></body></html>'''
open('../prototip.html', 'w').write(html)
import os; print(os.path.getsize('../prototip.html') // 1024, 'KB')
