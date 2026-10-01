SWIM='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="16.5" cy="6" r="1.8"/><path d="M5 11l4-3 3 2.5 3-3"/><path d="M3 15c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1"/><path d="M3 19c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1"/></svg>'
GYM='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/></svg>'
GEAR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>'
ARR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
CH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>'
def metro(w=300,h=20,sw=6):
    segs=[('#3B82F6',.13),('#8B5CF6',.13),('#F97316',.4),('#FACC15',.2),('#2DD4BF',.14)]
    x=0;out=''
    for c,f in segs:
        L=w*f; out+=f'<line x1="{x+2:.0f}" y1="{h/2}" x2="{x+L-2:.0f}" y2="{h/2}" stroke="{c}" stroke-width="{sw}" stroke-linecap="round"/>'; x+=L
    return f'<svg class="metro" viewBox="0 0 {w} {h}" preserveAspectRatio="none">{out}</svg>'
BASE='''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="file:///home/user/Claude/fonts/fonts.css"><style>
*{box-sizing:border-box;margin:0}
:root{--bg:#0B0F14;--card:#141B23;--card2:#12181F;--line:#1E2731;--text:#EDEFF2;--muted:#7A8694;--soft:#9AA5B1;--teal:#2DD4BF;--amber:#F5A524;--num:'Barlow Condensed',sans-serif}
body{width:430px;height:932px;overflow:hidden;background:var(--bg);color:var(--text);font-family:'Archivo',sans-serif;padding:54px 20px 24px;position:relative}
svg{display:block}
.top{display:flex;align-items:center;justify-content:space-between;height:60px}
.brand{font-size:22px;font-weight:800;letter-spacing:.3px}
.gear{width:52px;height:52px;border-radius:16px;background:var(--card);border:1px solid var(--line);display:grid;place-items:center;color:var(--soft)}
.gear svg{width:24px;height:24px}
.date{font-size:16px;font-weight:700;color:var(--muted);margin-top:14px}
.num{font-family:var(--num);font-weight:700}
.metro{width:100%;height:20px}
.hist{display:flex;align-items:center;gap:12px;padding:16px 20px;border-radius:22px;background:var(--card2);border:1px solid var(--line)}
.hist span{flex:1;display:flex;flex-direction:column}.hist b{font-size:19px}.hist small{font-size:15px;color:var(--muted);font-weight:600;margin-top:2px}
.hist svg{width:22px;height:22px;color:var(--muted)}
.ver{position:absolute;bottom:22px;left:0;right:0;text-align:center;font-size:13px;color:#4C5663}
@@CSS@@</style></head><body>@@BODY@@</body></html>'''
HEAD=f'<div class="top"><span class="brand">YüzmeSK</span><span class="gear">{GEAR}</span></div>'
HIST=f'<div class="hist"><span><b>Yapılmış idmanlar</b><small>12 kayıt · son: 21 Eylül</small></span>{CH}</div>'
V='<div class="ver">Sürüm 10.1</div>'
D={}
# 1 — Yan yana iki dikey kapı
D['1']=('''
.ttl{font-size:38px;font-weight:800;line-height:1.05;margin:6px 0 22px}
.doors{display:grid;grid-template-columns:1fr 1fr;gap:12px;height:430px}
.door{border-radius:30px;padding:20px 18px;display:flex;flex-direction:column;position:relative;overflow:hidden;border:1px solid var(--line);background:var(--card)}
.door .ic{width:58px;height:58px;border-radius:18px;display:grid;place-items:center}
.door .ic svg{width:34px;height:34px}
.door.sw{border-color:rgba(45,212,191,.45)}
.door.sw .ic{background:rgba(45,212,191,.14);color:var(--teal)}
.door.gy .ic{background:#1A212A;color:var(--muted)}
.door h3{font-size:34px;font-weight:800;margin-top:auto}
.door .k{font-size:12px;font-weight:800;letter-spacing:1.8px;margin-top:6px}
.door.sw .k{color:var(--teal)}.door.gy .k{color:var(--muted)}
.door .m{font-size:22px;color:var(--soft);margin-top:10px;line-height:1.15}
.door.gy h3{color:#8B95A2}
.door .bar{position:absolute;left:0;right:0;bottom:0;height:5px}
.door.sw .bar{background:var(--teal)}
.door.gy .bar{background:repeating-linear-gradient(90deg,#2A3440 0 10px,transparent 10px 18px)}
.go{margin-top:16px;height:52px;border-radius:16px;background:var(--teal);color:#032024;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:800;font-size:17px}
.go svg{width:20px;height:20px}
.soon{margin-top:16px;height:52px;border-radius:16px;border:1.5px dashed #2A3440;color:var(--muted);display:grid;place-items:center;font-weight:800;font-size:14px;letter-spacing:2px}
.gap{height:18px}
''',HEAD+'<p class="date">Çarşamba, 23 Eylül</p><h1 class="ttl">Bugün ne<br>çalışıyoruz?</h1>'
 +f'<div class="doors"><div class="door sw"><span class="ic">{SWIM}</span><h3>Yüzme</h3><span class="k">SIRADAKİ · BUGÜN</span><span class="m num">5 set<br>1.200 m<br>25:30</span><span class="go">Aç {ARR}</span><span class="bar"></span></div>'
 +f'<div class="door gy"><span class="ic">{GYM}</span><h3>Salon</h3><span class="k">KUVVET · MOBİLİTE</span><span class="m num">Program<br>yakında</span><span class="soon">YAKINDA</span><span class="bar"></span></div></div>'
 +'<div class="gap"></div>'+HIST+V)
# 2 — Üstte sekme (segment), altında disipline özel içerik
D['2']=('''
.seg{display:grid;grid-template-columns:1fr 1fr;margin-top:18px;padding:6px;border-radius:22px;background:var(--card2);border:1px solid var(--line)}
.seg span{height:64px;border-radius:17px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:20px;font-weight:800;color:var(--muted)}
.seg svg{width:26px;height:26px}
.seg .on{background:var(--card);color:var(--text);box-shadow:0 6px 18px rgba(0,0,0,.35);border:1px solid #2A3440}
.seg .on svg{color:var(--teal)}
.seg i{font-style:normal;font-size:10px;letter-spacing:1.5px;padding:3px 7px;border:1px solid #2A3440;border-radius:999px}
.big{margin-top:18px;border-radius:30px;padding:22px;background:var(--card);border:1px solid var(--line)}
.pill{display:inline-block;padding:5px 11px;border-radius:999px;background:var(--teal);color:#032024;font-size:12px;font-weight:800;letter-spacing:1.4px}
.row{display:flex;justify-content:space-between;align-items:center}
.row .t{font-size:22px;color:var(--soft)}
.big h2{font-size:34px;font-weight:800;margin:14px 0 16px}
.big h2 span{color:var(--soft);font-weight:700}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px}
.stats div{background:var(--bg);border-radius:16px;padding:8px 12px}
.stats small{font-size:11px;font-weight:800;letter-spacing:1.5px;color:var(--muted)}
.stats b{display:block;font-size:34px}
.cta{margin-top:18px;height:68px;border-radius:22px;background:var(--teal);color:#032024;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:800;font-size:20px}
.cta svg{width:22px;height:22px}
.wk{display:flex;justify-content:space-between;margin:18px 2px 18px}
.wk span{width:46px;text-align:center;font-size:13px;font-weight:700;color:var(--muted)}
.wk b{display:block;font-family:var(--num);font-size:24px;color:var(--text)}
.wk i{display:block;width:6px;height:6px;border-radius:50%;margin:3px auto 0}
.wk .on b{color:var(--teal)}
''',HEAD+'<p class="date">Çarşamba, 23 Eylül</p>'
 +f'<div class="seg"><span class="on">{SWIM}Yüzme</span><span>{GYM}Salon <i>YAKINDA</i></span></div>'
 +'<div class="big"><div class="row"><span class="pill">BUGÜN</span><span class="t num">25:30 hedef</span></div><h2>Ana set <span>· 400 m</span></h2>'+metro()
 +'<div class="stats"><div><small>SET</small><b class="num">5</b></div><div><small>MESAFE</small><b class="num">1.200</b></div><div><small>SÜRE</small><b class="num">25:30</b></div></div>'
 +f'<div class="cta">{ARR}Bugünün idmanını aç</div></div>'
 +'<div class="wk">'+''.join(f'<span class="{"on" if d=="23" else ""}">{g}<b>{d}</b><i style="background:{c}"></i></span>' for g,d,c in [('Pzt','21','#2A3440'),('Sal','22','#2A3440'),('Çar','23','#2DD4BF'),('Per','24','#7A8694'),('Cum','25','transparent'),('Cmt','26','#F5A524'),('Paz','27','transparent')])+'</div>'
 +HIST+V)
# 3 — Ekranı ikiye bölen tam genişlik alanlar
D['3']=('''
body{padding:0}
.top{position:absolute;top:54px;left:20px;right:20px;z-index:3}
.half{position:absolute;left:0;right:0;padding:0 24px;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden}
.h1{top:0;height:520px;padding-bottom:28px;background:radial-gradient(420px 300px at 80% 20%,rgba(45,212,191,.10),transparent 70%),#0E141B;border-bottom:1px solid var(--line)}
.h2{top:520px;height:260px;padding-bottom:24px;background:#0A0D11}
.lines{position:absolute;right:-20px;top:120px;width:300px;opacity:.5}
.lines path{fill:none;stroke:#1F2B36;stroke-width:2}
.k{font-size:12px;font-weight:800;letter-spacing:2.4px}
.h1 .k{color:var(--teal)}.h2 .k{color:var(--muted)}
.name{font-size:84px;font-weight:800;line-height:.95;letter-spacing:-1.5px;margin-top:8px}
.h2 .name{color:#4C5663;font-size:64px}
.meta{font-size:26px;color:var(--soft);margin-top:10px}
.act{display:flex;align-items:center;justify-content:space-between;margin-top:18px}
.circ{width:64px;height:64px;border-radius:50%;background:var(--teal);color:#032024;display:grid;place-items:center}
.circ svg{width:28px;height:28px}
.dt{font-size:16px;font-weight:700;color:var(--muted)}
.foot{position:absolute;left:20px;right:20px;top:796px}
.ver{bottom:14px}
.tag{position:absolute;right:24px;bottom:30px;padding:6px 12px;border:1.5px solid #2A3440;border-radius:999px;font-size:12px;font-weight:800;letter-spacing:2px;color:var(--muted)}
''',HEAD+'<div class="half h1"><svg class="lines" viewBox="0 0 300 200">'+''.join(f'<path d="M0 {y} q37 -22 75 0 t75 0 t75 0 t75 0"/>' for y in range(30,200,26))+'</svg>'
 +f'<span class="k">01 · YÜZME · SIRADAKİ BUGÜN</span><span class="name">Yüzme</span>{metro(300,20,5)}<span class="meta num">5 set · 1.200 m · 25:30</span><div class="act"><span class="dt">Çarşamba, 23 Eylül</span><span class="circ">{ARR}</span></div></div>'
 +'<div class="half h2"><span class="k">02 · SALON</span><span class="name">Salon</span><span class="tag">YAKINDA</span></div>'
 +'<div class="foot">'+HIST+'</div>'+V)
# 4 — Editoryal liste: büyük tipografi, ince çizgiler
D['4']=('''
.ttl{font-size:15px;font-weight:800;letter-spacing:2.4px;color:var(--muted);margin:34px 0 8px}
.it{display:grid;grid-template-columns:54px 1fr auto;align-items:start;gap:6px;padding:26px 0;border-top:1px solid var(--line)}
.it:last-of-type{border-bottom:1px solid var(--line)}
.no{font-family:var(--num);font-size:26px;font-weight:700;color:var(--muted);padding-top:12px}
.it h3{font-size:64px;font-weight:800;line-height:1;letter-spacing:-1px}
.it .sub{display:block;margin-top:10px;font-size:22px;color:var(--soft)}
.it .k{display:block;margin-top:12px;font-size:12px;font-weight:800;letter-spacing:2px}
.sw .k{color:var(--teal)}
.sw .ic{color:var(--teal)}
.ic{width:44px;height:44px;margin-top:10px}
.gy h3{color:#4C5663}.gy .ic{color:#3A4450}.gy .k{color:var(--muted)}
.it .metro{margin-top:14px;width:250px}
.go{display:inline-flex;align-items:center;gap:8px;margin-top:16px;height:50px;padding:0 20px;border-radius:999px;background:var(--teal);color:#032024;font-weight:800;font-size:17px}
.go svg{width:20px;height:20px}
.sp{height:28px}
''',HEAD+'<p class="date">Çarşamba, 23 Eylül</p><p class="ttl">ANTRENMAN</p>'
 +f'<div class="it sw"><span class="no">01</span><div><h3>Yüzme</h3><span class="k">SIRADAKİ · BUGÜN</span>{metro(250,20,5)}<span class="sub num">5 set · 1.200 m · 25:30</span><span class="go">İdmanı aç {ARR}</span></div><span class="ic">{SWIM}</span></div>'
 +f'<div class="it gy"><span class="no">02</span><div><h3>Salon</h3><span class="k">YAKINDA</span></div><span class="ic">{GYM}</span></div>'
 +'<div class="sp"></div>'+HIST+V)
# 5 — Her disiplinin kendi rengi: Yüzme turkuaz, Salon amber; büyük renk şeritli kartlar
D['5']=('''
.ttl{font-size:38px;font-weight:800;line-height:1.05;margin:6px 0 20px}
.card{position:relative;border-radius:28px;background:var(--card);border:1px solid var(--line);padding:20px 20px 20px 30px;overflow:hidden;margin-bottom:14px}
.card:before{content:"";position:absolute;left:0;top:0;bottom:0;width:8px}
.sw:before{background:var(--teal)}.gy:before{background:var(--amber);opacity:.55}
.hd{display:flex;align-items:center;gap:14px}
.ic{width:54px;height:54px;border-radius:16px;display:grid;place-items:center}
.ic svg{width:32px;height:32px}
.sw .ic{background:rgba(45,212,191,.14);color:var(--teal)}
.gy .ic{background:rgba(245,165,36,.10);color:#B98232}
.hd h3{font-size:36px;font-weight:800;flex:1}
.gy h3{color:#8B95A2}
.chev{width:48px;height:48px;border-radius:50%;display:grid;place-items:center}
.sw .chev{background:var(--teal);color:#032024}.chev svg{width:22px;height:22px}
.soon{padding:5px 11px;border-radius:999px;border:1.5px solid rgba(245,165,36,.35);color:#B98232;font-size:12px;font-weight:800;letter-spacing:1.8px}
.body{margin-top:16px;padding-top:16px;border-top:1px solid var(--line)}
.k{font-size:12px;font-weight:800;letter-spacing:1.8px;color:var(--teal)}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}
.stats small{font-size:11px;font-weight:800;letter-spacing:1.4px;color:var(--muted)}
.stats b{display:block;font-size:32px}
.metro{margin-top:14px}
.gy .body p{font-size:17px;color:var(--muted);line-height:1.35}
''',HEAD+'<p class="date">Çarşamba, 23 Eylül</p><h1 class="ttl">Bugün ne<br>çalışıyoruz?</h1>'
 +f'<div class="card sw"><div class="hd"><span class="ic">{SWIM}</span><h3>Yüzme</h3><span class="chev">{ARR}</span></div><div class="body"><span class="k">SIRADAKİ · BUGÜN</span><div class="stats"><div><small>SET</small><b class="num">5</b></div><div><small>MESAFE</small><b class="num">1.200</b></div><div><small>SÜRE</small><b class="num">25:30</b></div></div>{metro(330,20,6)}</div></div>'
 +f'<div class="card gy"><div class="hd"><span class="ic">{GYM}</span><h3>Salon</h3><span class="soon">YAKINDA</span></div><div class="body"><p>Kuvvet ve mobilite programları burada olacak.</p></div></div>'
 +HIST+V)
for k,(css,body) in D.items():
    open(f'm{k}.html','w').write(BASE.replace('@@CSS@@',css).replace('@@BODY@@',body))
names={'1':'1 · İki kapı (yan yana)','2':'2 · Sekmeli (Yüzme | Salon)','3':'3 · Bölünmüş ekran','4':'4 · Editoryal liste','5':'5 · Renk kodlu kartlar'}
open('comp.html','w').write('<body style="margin:0;background:#1a1d22;display:flex;gap:16px;padding:16px;font:600 22px system-ui;color:#eee">'+''.join(f'<div><div style="height:40px">{names[k]}</div><img src="m{k}.png" width="430"></div>' for k in D)+'</body>')
