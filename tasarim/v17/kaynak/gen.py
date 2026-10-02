exec(open('/tmp/claude-0/-home-user-Claude/c9865774-3f0a-5f97-98c7-9186fe2a5f9b/scratchpad/v14/gen.py').read().split("P={}")[0])
OR='#F97316'; PU='#8B5CF6'; YE='#FACC15'
EXTRA='''<style>
.acts{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:16px}
.acts span{height:64px;border-radius:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:15px;font-weight:800;border:1.5px solid #2A3440;color:#EDEFF2}
.acts span i{font-style:normal;font-size:22px}
.acts .del{color:#FF8A8A;border-color:rgba(255,138,138,.4)}
.pen{position:absolute;right:12px;top:10px;width:46px;height:46px;border-radius:14px;background:#1C242E;border:1px solid #2A3440;display:grid;place-items:center;font-size:20px;color:#EDEFF2}
.menu{position:absolute;right:26px;top:300px;width:260px;border-radius:20px;background:#1A222C;border:1px solid #2A3440;box-shadow:0 20px 50px rgba(0,0,0,.6);overflow:hidden}
.menu div{height:60px;display:flex;align-items:center;gap:12px;padding:0 18px;font-size:18px;font-weight:700;border-bottom:1px solid #222B36}
.menu div:last-child{border:0;color:#FF8A8A}
.ed{position:absolute;inset:0;background:#0B0F14;padding:50px 18px 20px}
.ed h2{font-size:26px;font-weight:800;margin-top:6px}.ed .sub{font-size:15px;color:#9AA5B1;margin-top:4px}
.row2{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:18px;background:#141B23;border:1px solid #1E2731;margin-top:10px}
.row2 .l{font-size:12px;font-weight:800;letter-spacing:1.6px;color:#7A8694}.row2 .l small{display:block;font-size:12px;letter-spacing:0;color:#FFB020;font-weight:700;margin-top:2px}
.stp{display:flex;align-items:center;gap:10px}.stp b{font-family:var(--num);font-size:40px;min-width:84px;text-align:center}
.stp span{width:56px;height:56px;border-radius:16px;background:#1C242E;border:1px solid #2A3440;display:grid;place-items:center;font-size:30px;font-weight:700}
.chs{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}.chs span{padding:9px 13px;border-radius:999px;border:1.5px solid #2A3440;font-size:15px;font-weight:800;color:#9AA5B1}
.chs span.on{border-color:#F97316;color:#F97316;background:rgba(249,115,22,.1)}
.blk{margin-top:12px}.blk .l{font-size:12px;font-weight:800;letter-spacing:1.6px;color:#7A8694}
.save{position:absolute;left:18px;right:18px;bottom:40px;display:grid;grid-template-columns:1fr 1.6fr;gap:10px}
.save span{height:66px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:800;border:1.5px solid #2A3440}
.save .y{background:#F6D35E;color:#14110A;border:0}
.plus{display:inline-flex;align-items:center;gap:6px;margin-left:auto;padding:8px 12px;border-radius:14px;border:1.5px solid rgba(56,189,248,.6);color:#7DD3FC;font-size:16px;font-weight:800}
.toast2{position:absolute;left:20px;right:20px;top:120px;padding:14px 16px;border-radius:16px;background:#1A222C;border:1px solid #2A3440;font-size:16px;font-weight:700;display:flex;justify-content:space-between}
.toast2 b{color:#F6D35E}
</style>'''
def strip(n, ok, cur, cls): return '<div class="strip">'+''.join(f'<i class="{"ok" if i<ok else (cls if i==cur else "")}"></i>' for i in range(n))+'</div>'
REST=head('24:10','1:00:30','1.050','2.200',3)+rows([('14:30',PU,'4 × 50 FR Drill','x'),('21:30',PU,'4 × 50 FR Kick','x')],170)+\
 f'<div class="line" style="top:260px;height:470px;background:{OR}"></div><div class="dot" style="top:262px;border-color:{OR};background:{OR}"></div><div class="tm" style="top:264px">47:30</div>'
CARD=lambda extra='',plus='': f'''<div class="card" style="top:258px;height:470px;border-color:{OR}66"><span class="tag" style="color:{OR}">MS · ANA SET · 4/7</span>
 <div class="ttl">8 × 100<small style="color:{OR}">FR · Swim</small></div>
 <div class="info">Hedef <b>1:30</b> · Dinlen <b>0:20</b> · Alet <b>—</b></div><div class="desc">Son 25 hızlı, dönüşte 5 dolfin.</div>
 {strip(8,3,3,'rs')}<div class="rep" style="align-items:center"><b>3/8 bitti</b>{plus or '<span>ort. 1:29.6</span>'}</div><div class="last">Son: <em>1:28</em> · <em>1:31</em> · <em>1:29</em></div>
 <div class="timer"><small>DİNLENME</small><b class="n" style="color:#38BDF8">0:12</b><span>4. tekrar çıkışı · plan 0:20</span></div>{extra}</div>'''
DOCK=dock('YÜZ','4. tekrar başlar',False,False)
P={}
# A: ayrıntı paneli + 3 düğme
P['a']=REST+CARD()+rows([('57:00',YE,'6 × 50 FR Kick',''),('1:00:30','#2DD4BF','1 × 200 FR Swim','')],738)+DOCK+'''<div class="dim"></div><div class="sheet">
<div class="tag" style="color:#F97316">MS · ANA SET · 4/7</div><div class="ttl" style="font-size:72px">8 × 100</div>
<div style="font-family:var(--num);font-size:34px;font-weight:700;color:#F97316">FR · Swim</div>
<div style="font-size:22px;line-height:1.3;margin-top:10px;color:#DCE2E8">Son 25 hızlı, dönüşte 5 dolfin.</div>
<div class="tiles" style="margin-top:14px"><div><small>HEDEF</small><b style="font-size:52px">1:30</b></div><div><small>DİNLEN</small><b style="font-size:52px">0:20</b></div></div>
<div class="acts"><span><i>✎</i>Düzenle</span><span><i>＋</i>Sonrasına ekle</span><span class="del"><i>🗑</i>Sil</span></div>
<div style="margin-top:14px;text-align:center;font-size:14px;font-weight:700;color:#7A8694">Boşluğa dokun: kapat</div></div>'''
# B: kartta ✎ düğmesi + menü
P['b']=REST+CARD('<span class="pen">✎</span>')+rows([('57:00',YE,'6 × 50 FR Kick',''),('1:00:30','#2DD4BF','1 × 200 FR Swim','')],738)+DOCK+\
 '<div class="dim" style="background:rgba(4,6,9,.45)"></div><div class="menu"><div>✎&nbsp; Düzenle</div><div>＋&nbsp; Sonrasına set ekle</div><div>⤓&nbsp; Bu sete tekrar ekle</div><div>🗑&nbsp; Sil</div></div>'
# C: düzenleme ekranı
P['c']='''<div class="ed"><div style="display:flex;align-items:center;gap:12px"><span class="back" style="width:56px;height:56px;border-radius:16px;background:#141B23;display:grid;place-items:center;font-size:28px">‹</span><div><div class="tag" style="color:#F97316">MS · ANA SET · 4/7 · DÜZENLE</div><h2>8 × 100 FR Swim</h2></div></div>
<div class="row2"><div class="l">TEKRAR<small>en az 3 (yapıldı)</small></div><div class="stp"><span>−</span><b>8</b><span>+</span></div></div>
<div class="row2"><div class="l">MESAFE<small>başladı · değişirse yeni set</small></div><div class="stp"><span>−</span><b>100</b><span>+</span></div></div>
<div class="row2"><div class="l">HEDEF</div><div class="stp"><span>−</span><b>1:30</b><span>+</span></div></div>
<div class="row2"><div class="l">DİNLEN</div><div class="stp"><span>−</span><b>0:20</b><span>+</span></div></div>
<div class="blk"><div class="l">STİL</div><div class="chs"><span class="on">FR</span><span>BK</span><span>BR</span><span>BF</span><span>IM</span></div></div>
<div class="blk"><div class="l">TÜR</div><div class="chs"><span class="on">Swim</span><span>Drill</span><span>Kick</span><span>Pull</span></div></div>
<div class="blk"><div class="l">ALET</div><div class="chs"><span>Finn</span><span>Paddle</span><span>PB</span><span>Snorkel</span><span>Board</span></div></div>
<div class="row2" style="margin-top:12px"><div class="l">AÇIKLAMA</div><div style="font-size:16px;color:#C3CCD6">Son 25 hızlı, dönüşte 5 dolfin ✎</div></div>
<div class="save"><span>Vazgeç</span><span class="y">Kaydet</span></div></div>'''
# D: dinlenirken +1 tekrar kısayolu + bildirim
P['d']=REST+CARD(plus='<span class="plus">＋1 tekrar</span>')+rows([('57:00',YE,'6 × 50 FR Kick',''),('1:00:30','#2DD4BF','1 × 200 FR Swim','')],738)+DOCK+\
 '<div class="toast2">8 × 100 → 9 × 100 <b>Geri al</b></div>'
names={'a':'A · Karta dokun → panel','b':'B · Kartta ✎ düğmesi → menü','c':'Düzenle ekranı (A ve B ortak)','d':'Kısayol: dinlenirken "+1 tekrar"'}
for k,b in P.items(): open(f'e{k}.html','w').write(BASE.replace('@@',EXTRA+b))
open('comp.html','w').write('<body style="margin:0;background:#1a1d22;display:flex;gap:16px;padding:16px;font:600 22px system-ui;color:#eee">'+''.join(f'<div><div style="height:40px">{names[k]}</div><img src="e{k}.png" width="430"></div>' for k in P)+'</body>')
