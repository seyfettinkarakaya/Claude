BASE='''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="file:///home/user/Claude/fonts/fonts.css"><style>
*{box-sizing:border-box;margin:0}
:root{--bg:#0B0F14;--panel:#12181F;--line:#1E2731;--text:#EDEFF2;--muted:#7A8694;--accent:#FFD23F;--done:#3DDC84;--num:'Barlow Condensed',sans-serif}
body{width:430px;height:932px;overflow:hidden;background:var(--bg);color:var(--text);font-family:'Archivo',sans-serif;position:relative}
.n{font-family:var(--num);font-weight:700}
.hd{position:absolute;top:44px;left:14px;right:14px;display:flex;align-items:flex-end;gap:10px}
.back{width:60px;height:64px;border-radius:16px;background:#141B23;display:grid;place-items:center;font-size:30px;color:#bbb;align-self:center}
.st{flex:1}.st small{display:block;font-size:13px;font-weight:800;letter-spacing:2.5px;color:#9AA5B1}
.st b{font-family:var(--num);font-size:54px;font-weight:800;line-height:.95}.st i{font-style:normal;font-family:var(--num);font-size:22px;color:var(--accent);font-weight:700}
.st.r{text-align:right}.st.r i{color:#9AA5B1}
.bar{position:absolute;top:142px;left:14px;right:14px;display:flex;gap:5px}.bar span{height:9px;border-radius:5px;opacity:.35}.bar span.on{opacity:1}
.row{position:absolute;left:14px;right:14px;height:34px;display:flex;align-items:center;gap:12px;font-size:22px;font-weight:700;color:#C3CCD6}
.row .t{width:66px;text-align:right;font-family:var(--num);font-size:24px}
.row .d{width:18px;height:18px;border-radius:50%;border:4px solid}
.row.x{color:#5C6875;text-decoration:line-through}
.line{position:absolute;left:87px;width:6px;border-radius:3px}
.dot{position:absolute;left:72px;width:36px;height:36px;border-radius:50%;border:5px solid}
.tm{position:absolute;left:8px;width:62px;text-align:right;font-family:var(--num);font-weight:700;font-size:26px;color:var(--accent)}
.card{position:absolute;left:112px;right:14px;border-radius:26px;padding:14px 14px;background:#141B23;border:1px solid;display:flex;flex-direction:column;overflow:hidden}
.tag{font-size:12px;font-weight:800;letter-spacing:1.6px}
.ttl{font-family:var(--num);font-weight:800;font-size:56px;line-height:.95;margin-top:6px}.ttl small{font-size:24px;margin-left:8px}
.info{font-size:15px;font-weight:700;color:#C3CCD6;margin-top:6px}.info b{color:var(--text)}
.desc{font-size:15px;color:#9AA5B1;margin-top:3px;line-height:1.3}
.strip{display:flex;gap:3px;margin-top:12px}.strip i{flex:1;height:14px;border-radius:4px;background:#2A3440}
.strip i.ok{background:var(--done)}.strip i.now{background:var(--accent)}.strip i.rs{background:#38BDF8}
.rep{display:flex;justify-content:space-between;align-items:baseline;margin-top:8px}
.rep b{font-family:var(--num);font-size:30px}.rep span{font-family:var(--num);font-size:19px;color:#9AA5B1;font-weight:700}
.last{font-family:var(--num);font-size:19px;font-weight:700;color:#C3CCD6;margin-top:2px}.last em{font-style:normal;color:var(--done)}
.timer{flex:1;margin-top:10px;border-radius:20px;background:rgba(0,0,0,.28);display:flex;flex-direction:column;align-items:center;justify-content:center}
.timer small{font-size:13px;font-weight:800;letter-spacing:2.5px;color:#9AA5B1}
.timer b{font-family:var(--num);font-size:128px;font-weight:800;line-height:.85;letter-spacing:-3px}
.timer span{font-family:var(--num);font-size:18px;color:#9AA5B1;font-weight:700;margin-top:4px}
.dock{position:absolute;left:14px;right:14px;bottom:52px;height:140px;border-radius:30px;background:#10151B;border:1px solid var(--line);padding:8px;display:grid;grid-template-columns:76px 1fr 76px;gap:8px}
.side{border-radius:22px;background:#0B0F14;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#5C6875;gap:4px}
.side.on{color:#EDEFF2}
.main{border-radius:28px;background:radial-gradient(circle at 30% 20%,#FFE58A,#FFD23F 55%,#F2B90F);color:#14110A;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center;padding:0 10px}
.main b{font-size:40px;font-weight:800;line-height:1}.main small{font-size:14px;font-weight:800;opacity:.75}
.main.w{background:#EDEFF2}
.banner{margin-top:8px;padding:8px 10px;border-radius:12px;background:rgba(61,220,132,.10);color:var(--done);font-family:var(--num);font-size:18px;font-weight:700}
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.tiles div{background:rgba(0,0,0,.28);border-radius:14px;padding:5px 10px 7px}.tiles small{display:block;font-size:11px;font-weight:800;letter-spacing:1.4px;color:var(--muted)}
.tiles b{font-family:var(--num);font-size:44px;line-height:1}
.foot{margin-top:8px;font-size:17px;font-weight:700;color:#B4BDC7}.foot b{color:var(--text);font-size:21px}
.mini{margin-top:auto;display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:16px;background:rgba(56,189,248,.10);border:1px solid rgba(56,189,248,.4)}
.mini small{font-size:11px;font-weight:800;letter-spacing:1.8px;color:#38BDF8}.mini b{font-family:var(--num);font-size:40px;color:#38BDF8;line-height:1;margin-left:auto}
.mini span{font-family:var(--num);font-size:18px;color:#9AA5B1;font-weight:700}
.dim{position:absolute;inset:0;background:rgba(4,6,9,.72)}
.sheet{position:absolute;left:10px;right:10px;bottom:10px;border-radius:30px;background:#141B23;border:1px solid #2A3440;padding:22px}
.btn{height:62px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:800;margin-top:10px;border:1.5px solid #2A3440}
.btn.y{background:#F6D35E;color:#14110A;border:0}
.btn.b{border-color:rgba(56,189,248,.6);color:#7DD3FC}
.lab{position:absolute;top:0;left:0;right:0;height:0}
</style></head><body>@@</body></html>'''
SEGS=[('#3B82F6',2),('#8B5CF6',2),('#8B5CF6',2),('#F97316',6),('#FACC15',2),('#2DD4BF',2)]
def bar(on): return '<div class="bar">'+''.join(f'<span class="{"on" if i==on else ""}" style="background:{c};flex:{f}"></span>' for i,(c,f) in enumerate(SEGS))+'</div>'
def head(sure,end,mes,tot,on,dim=False):
    c='color:#9AA5B1' if dim else ''
    return f'<div class="hd"><span class="back">‹</span><div class="st"><small>SÜRE</small><b style="{c}">{sure}</b><i>/{end}</i></div><div class="st r"><small>MESAFE</small><b>{mes}</b><i>/{tot}</i></div></div>'+bar(on)
def rows(items,top):
    return ''.join(f'<div class="row {x}" style="top:{top+k*44}px"><span class="t">{t}</span><span class="d" style="border-color:{c}"></span>{txt}</div>' for k,(t,c,txt,x) in enumerate(items))
def dock(main, sub, white=False, undo=False, ses=True):
    return f'<div class="dock"><div class="side {"on" if undo else ""}">↶<span>Geri al</span></div><div class="main {"w" if white else ""}"><b>{main}</b><small>{sub}</small></div><div class="side on">🔊<span>{"Ses açık" if ses else "Ses kapalı"}</span></div></div>'
OR='#F97316'; PU='#8B5CF6'
def strip(n, ok, cur, cls):
    return '<div class="strip">'+''.join(f'<i class="{"ok" if i<ok else (cls if i==cur else "")}"></i>' for i in range(n))+'</div>'
P={}
# 1 yüzerken 12 tekrar
P['1']=head('24:10','1:00:30','1.050','2.200',3)+rows([('14:30',PU,'4 × 50 FR Drill','x'),('21:30',PU,'4 × 50 FR Kick','x')],170)+\
 f'<div class="line" style="top:260px;height:470px;background:{OR}"></div><div class="dot" style="top:262px;border-color:{OR};background:{OR}"></div><div class="tm" style="top:264px">47:30</div>'+\
 f'''<div class="card" style="top:258px;height:470px;border-color:{OR}66"><span class="tag" style="color:{OR}">MS · ANA SET · 4/7</span>
 <div class="ttl">12 × 100<small style="color:{OR}">FR · Swim</small></div>
 <div class="info">Hedef <b>1:30</b> · Dinlen <b>0:20</b> · Alet <b>—</b></div><div class="desc">Son 25 hızlı, dönüşte 5 dolfin.</div>
 {strip(12,6,6,'now')}<div class="rep"><b>Tekrar 7/12</b><span>ort. 1:29.6</span></div><div class="last">Son: <em>1:28</em> · <em>1:31</em> · <em>1:29</em></div>
 <div class="timer"><small>7. TEKRAR · YÜZÜYOR</small><b class="n" style="color:#FFD23F">1:04</b><span>hedef 1:30</span></div></div>'''+\
 rows([('57:00','#FACC15','6 × 50 FR Kick',''),('1:00:30','#2DD4BF','1 × 200 FR Swim','')],738)+dock('GELDİM','7. tekrar biter, dinlenme başlar',True,True)
# 2 dinlenme 12 tekrar
P['2']=P['1'].replace(strip(12,6,6,'now'),strip(12,7,7,'rs')).replace('<b>Tekrar 7/12</b>','<b>7/12 bitti</b>').replace('Son: <em>1:28</em> · <em>1:31</em> · <em>1:29</em>','Son: <em>1:31</em> · <em>1:29</em> · <em>1:27</em>')\
 .replace('<small>7. TEKRAR · YÜZÜYOR</small><b class="n" style="color:#FFD23F">1:04</b><span>hedef 1:30</span>','<small>DİNLENME</small><b class="n" style="color:#38BDF8">0:12</b><span>8. tekrar çıkışı · plan 0:20</span>')\
 .replace(dock('GELDİM','7. tekrar biter, dinlenme başlar',True,True),dock('ÇIK','8. tekrar başlar',False,True))
# 3 set sonu dinlenmesi: sıradaki set öne
P['3']=head('39:05','1:00:30','1.750','2.200',4)+rows([('31:55',OR,'12 × 100 FR Swim','x')],170)+\
 f'<div class="line" style="top:214px;height:516px;background:#FACC15"></div><div class="dot" style="top:216px;border-color:#FACC15;background:#FACC15"></div><div class="tm" style="top:218px">57:00</div>'+\
 f'''<div class="card" style="top:212px;height:516px;border-color:#FACC1566"><span class="tag" style="color:#FACC15">AS · AEROBİK · 5/7 · SIRADAKİ</span>
 <div class="banner">✓ 12 × 100 bitti · ort. 1:29.4 · 12/12</div>
 <div class="ttl" style="font-size:62px">6 × 50</div><div style="font-family:var(--num);font-size:30px;font-weight:700;color:#FACC15">FR · Kick</div>
 <div class="desc" style="font-size:20px;color:#DCE2E8;margin-top:6px">Sağ/Sol rotasyon, omuz-çene hattı. Son 2 tekrar hızlı.</div>
 <div class="tiles"><div><small>HEDEF</small><b>1:20</b></div><div><small>DİNLEN</small><b>0:15</b></div></div>
 <div class="foot">Alet <b>Finn</b> · Tempo <b style="color:#60A5FA">2:40</b>/100</div>
 <div class="mini"><small>SET SONU<br>DİNLENMESİ</small><span>plan 1:00</span><b>0:48</b></div></div>'''+\
 rows([('1:00:30','#2DD4BF','1 × 200 FR Swim','')],738)+dock('ÇIK','6 × 50 Kick · 1. tekrar',False,False)
# 4 ayrıntı paneli
P['4']=P['1']+'''<div class="dim"></div><div class="sheet" style="top:150px"><div class="tag" style="color:#F97316">MS · ANA SET · 4/7</div>
<div class="ttl" style="font-size:80px">12 × 100</div><div style="font-family:var(--num);font-size:38px;font-weight:700;color:#F97316">FR · Swim</div>
<div style="font-size:26px;line-height:1.3;margin-top:12px;color:#DCE2E8">Son 25 hızlı, dönüşte 5 dolfin. Nefes 3-5-3.</div>
<div class="tiles" style="margin-top:18px"><div><small>HEDEF</small><b style="font-size:60px">1:30</b></div><div><small>DİNLEN</small><b style="font-size:60px">0:20</b></div></div>
<div class="foot" style="font-size:22px;margin-top:14px">Tempo <b style="color:#FB923C;font-size:26px">1:30</b>/100 · Z4 &nbsp;·&nbsp; Alet <b style="font-size:26px">—</b></div>
<div class="foot" style="font-size:22px">1.200 m · yığımlı hedef 47:30</div>
<div style="margin-top:22px;text-align:center;font-size:16px;font-weight:700;color:#7A8694">Kapatmak için dokun · süre işlemeye devam eder</div></div>'''
# 5 ‹ paneli + mola ver
P['5']=P['2']+'''<div class="dim"></div><div class="sheet"><div style="font-size:30px;font-weight:800">İdman</div>
<p style="font-size:19px;color:#C3CCD6;margin-top:8px">Yapılan: 3 set tam, 12 × 100 7/12 · 1.050 m · 24:10</p>
<div class="btn b">⏸&nbsp; Mola ver</div><div class="btn y">İdmanı bitir ve kaydet</div><div class="btn">Devam et</div><div class="btn" style="border-color:transparent;color:#9AA5B1">Takvime dön (idman sürer)</div></div>'''
# 6 mola ekranı
P['6']='''<div style="position:absolute;inset:0;background:radial-gradient(500px 400px at 50% 30%,rgba(56,189,248,.12),transparent 70%),#0A0E13"></div>
<div style="position:absolute;top:120px;left:0;right:0;text-align:center"><div style="font-size:18px;font-weight:800;letter-spacing:6px;color:#38BDF8">⏸ MOLA</div>
<div class="n" style="font-size:150px;line-height:1;margin-top:20px;color:#7DD3FC">3:42</div>
<div style="font-size:20px;color:#9AA5B1;margin-top:10px">İdman saati durdu · <b style="color:#EDEFF2">24:10</b></div>
<div style="font-size:20px;color:#9AA5B1;margin-top:6px">Dinlenme sayacı ve bipler duruyor</div>
<div style="margin:40px 30px 0;padding:14px;border-radius:18px;background:#12181F;border:1px solid #1E2731;font-size:18px;color:#C3CCD6">Sıradaki: <b style="color:#EDEFF2">12 × 100 · 8. tekrar</b><br>Hedef 1:30 · Dinlen 0:20</div></div>
<div style="position:absolute;left:24px;right:24px;bottom:70px;height:120px;border-radius:30px;background:#38BDF8;color:#04121A;display:flex;flex-direction:column;align-items:center;justify-content:center"><b style="font-size:42px;font-weight:800">DEVAM ET</b><small style="font-size:15px;font-weight:800;opacity:.75">İdman saati yeniden işler</small></div>'''
# 7 tek basışla başlangıç
P['7']=head('0:00','1:00:30','0','2.200',0,True)+\
 f'<div class="line" style="top:174px;height:556px;background:#3B82F6"></div><div class="dot" style="top:176px;border-color:#3B82F6;background:#3B82F6"></div><div class="tm" style="top:178px">5:15</div>'+\
 '''<div class="card" style="top:172px;height:556px;border-color:#3B82F666"><span class="tag" style="color:#3B82F6">WU · ISINMA · 1/7</span>
 <div class="ttl" style="font-size:76px">1 × 200</div><div style="font-family:var(--num);font-size:36px;font-weight:700;color:#3B82F6">FR · Swim</div>
 <div class="desc" style="font-size:24px;color:#DCE2E8;margin-top:10px">Çok rahat</div>
 <div class="tiles" style="margin-top:auto"><div><small>HEDEF</small><b style="font-size:58px">4:45</b></div><div><small>DİNLEN</small><b style="font-size:58px">0:30</b></div></div>
 <div class="foot" style="text-align:right">200 / 200 m</div></div>'''+\
 rows([('12:15',PU,'4 × 50 FR Drill',''),('31:55',OR,'1 × 800 FR Swim','')],738)+dock('ÇIK','İdman ve 1. tekrar başlar',False,False)
names={'1':'1 · Yüzerken (12 tekrar)','2':'2 · Dinlenirken (12 tekrar)','3':'3 · Set sonu: sıradaki set öne','4':'4 · Karta dokun: ayrıntı paneli','5':'5 · ‹ paneli: Mola ver','6':'6 · Mola ekranı','7':'7 · Tek basışla başlangıç'}
for k,b in P.items(): open(f'p{k}.html','w').write(BASE.replace('@@',b))
def comp(keys,fn):
    open(fn+'.html','w').write('<body style="margin:0;background:#1a1d22;display:flex;gap:16px;padding:16px;font:600 22px system-ui;color:#eee">'+''.join(f'<div><div style="height:40px">{names[k]}</div><img src="p{k}.png" width="430"></div>' for k in keys)+'</body>')
comp(['1','2','3','4'],'gorsel-1'); comp(['5','6','7'],'gorsel-2')
