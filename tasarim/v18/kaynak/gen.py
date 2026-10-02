exec(open('/tmp/claude-0/-home-user-Claude/c9865774-3f0a-5f97-98c7-9186fe2a5f9b/scratchpad/v14/gen.py').read().split("P={}")[0])
AMB='#F5A524'; BL='#60A5FA'; PU='#A78BFA'; RD='#F87171'; GR='#34D399'
X='''<style>
.main{background:radial-gradient(circle at 30% 20%,#FFD28A,#F5A524 55%,#D98A0F)}
.sets{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}
.sets div{border-radius:12px;background:#0B0F14;border:1px solid #1E2731;text-align:center;padding:4px 0 6px}
.sets small{display:block;font-size:11px;font-weight:800;color:#7A8694}.sets b{font-family:var(--num);font-size:26px}
.sets .ok b{color:#3DDC84}.sets .now{border-color:#F5A524}.sets .now b{color:#F5A524}.sets .rs{border-color:#38BDF8}
.wt{display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding:8px 10px;border-radius:16px;background:#0B0F14;border:1px solid #1E2731}
.wt .l{font-size:11px;font-weight:800;letter-spacing:1.5px;color:#7A8694}.wt b{font-family:var(--num);font-size:34px}
.wt .pm{display:flex;gap:6px}.wt .pm span{width:46px;height:46px;border-radius:14px;background:#1C242E;border:1px solid #2A3440;display:grid;place-items:center;font-size:24px;font-weight:700}
.vid{position:absolute;right:12px;top:10px;padding:8px 12px;border-radius:12px;background:#FF0033;color:#fff;font-size:14px;font-weight:800}
.prev{font-size:15px;color:#9AA5B1;margin-top:6px}.prev em{font-style:normal;color:#3DDC84}
.ent{position:absolute;inset:0;background:#0B0F14;padding:50px 18px 20px}
.ent h2{font-size:28px;font-weight:800}.ent .s{font-size:15px;color:#9AA5B1;margin-top:4px}
.ent .lb{font-size:12px;font-weight:800;letter-spacing:2px;color:#7A8694;margin:18px 0 8px}
.grid{display:grid;gap:7px}.grid span{height:54px;border-radius:14px;display:grid;place-items:center;font-family:var(--num);font-size:24px;font-weight:700;background:#141B23;border:1.5px solid #1E2731}
.grid span.on{background:#F5A524;color:#1A0E04;border-color:#F5A524}
.hr{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:18px;background:#141B23;border:1px solid #1E2731}
.hr b{font-family:var(--num);font-size:52px}.hr small{font-size:14px;color:#7A8694;font-weight:700}
.hr .pm{display:flex;gap:8px}.hr .pm span{width:58px;height:58px;border-radius:16px;background:#1C242E;border:1px solid #2A3440;display:grid;place-items:center;font-size:28px;font-weight:700}
.msid{font-size:13px;color:#9AA5B1;margin-top:6px}
.go{position:absolute;left:18px;right:18px;bottom:40px;height:72px;border-radius:24px;background:#F5A524;color:#1A0E04;display:flex;flex-direction:column;align-items:center;justify-content:center}
.go b{font-size:22px;font-weight:800}.go small{font-size:13px;font-weight:800;opacity:.75}
.sum2{display:flex;gap:8px;margin-top:10px}.sum2 div{flex:1;border-radius:14px;background:#141B23;border:1px solid #1E2731;padding:8px 10px}
.sum2 small{display:block;font-size:11px;font-weight:800;letter-spacing:1.4px;color:#7A8694}.sum2 b{font-family:var(--num);font-size:26px}
</style>'''
SEG=[(BL,3),(BL,3),(BL,3),(RD,3),(PU,3),(GR,2),(PU,2),(GR,2)]
def bar2(on): return '<div class="bar">'+''.join(f'<span class="{"on" if i<=on else ""}" style="background:{c};flex:{f}"></span>' for i,(c,f) in enumerate(SEG))+'</div>'
def head2(t,n,on): return f'<div class="hd"><span class="back">‹</span><div class="st"><small>SÜRE</small><b>{t}</b><i>/~48:00</i></div><div class="st r"><small>HAREKET</small><b>{n}</b><i>/8</i></div></div>'+bar2(on)
def rws(items,top): return ''.join(f'<div class="row {x}" style="top:{top+k*44}px"><span class="t">{t}</span><span class="d" style="border-color:{c}"></span>{txt}</div>' for k,(t,c,txt,x) in enumerate(items))
def sets(vals):
    return '<div class="sets">'+''.join(f'<div class="{c}"><small>{i+1}.</small><b>{v}</b></div>' for i,(c,v) in enumerate(vals))+'</div>'
CARDTOP=lambda tag,title,sub: f'<span class="tag" style="color:{BL}">{tag}</span><div class="ttl" style="font-size:44px">{title}</div><div class="info">{sub}</div>'
P={}
# 1 hazır
P['1']=head2('12:40','3',2)+rws([('4:10',BL,'Band Bent Over Row','x'),('8:30',BL,'Band Lat Pulldown','x')],170)+\
 f'<div class="line" style="top:260px;height:470px;background:{BL}"></div><div class="dot" style="top:262px;border-color:{BL};background:{BL}"></div><div class="tm" style="top:264px">3</div>'+\
 f'''<div class="card" style="top:258px;height:470px;border-color:{BL}66"><span class="vid">▶ Video</span>{CARDTOP('SIRT · KUVVET · 3/8','Standard<br>Pull-up','Hedef <b>3 × 10</b> · Vücut · Dinlen <b>1:30</b>')}
<div class="prev">Geçen: 3 × 10 · RPE 9,5 · MSI 1 · <em>öneri: aynı ⚠</em></div>
{sets([('', '10'),('', '10'),('', '10')]).replace('repeat(4','repeat(3')}
<div class="wt"><div><div class="l">AĞIRLIK</div><b>Vücut</b></div><div class="pm"><span>−</span><span>+</span></div></div>
<div class="desc" style="font-size:16px;color:#DCE2E8;margin-top:10px">Tam ROM, aşağıda 1 sn dur. Omuz hissedilirse tekrar düşür.</div></div>'''+\
 rws([('',RD,'Band Chest Fly',''),('',PU,'Deadbug','')],738)+dock('BAŞLA','1. set · hareket süresi başlar')
# 2 dinlenme
P['2']=head2('15:05','3',2)+rws([('4:10',BL,'Band Bent Over Row','x'),('8:30',BL,'Band Lat Pulldown','x')],170)+\
 f'<div class="line" style="top:260px;height:470px;background:{BL}"></div><div class="dot" style="top:262px;border-color:{BL};background:{BL}"></div><div class="tm" style="top:264px">3</div>'+\
 f'''<div class="card" style="top:258px;height:470px;border-color:{BL}66"><span class="vid">▶</span>{CARDTOP('SIRT · KUVVET · 3/8','Standard Pull-up','Hedef <b>3 × 10</b> · Vücut · Dinlen <b>1:30</b>')}
{sets([('ok','11'),('rs','—'),('','—')]).replace('repeat(4','repeat(3')}
<div class="prev" style="margin-top:8px">1. set: <b style="color:#EDEFF2">11</b> tekrar · <span style="color:#F5A524">kutuya dokun: düzelt</span></div>
<div class="timer"><small>DİNLENME · 2. SETE</small><b class="n" style="color:#38BDF8">0:42</b><span>plan 1:30 · hareket 2:20</span></div></div>'''+\
 rws([('',RD,'Band Chest Fly',''),('',PU,'Deadbug','')],738)+dock('BAŞLA','2. set')
# 3 set bitti: tekrar girişi (son set)
P['3']=head2('17:48','3',2)+rws([('4:10',BL,'Band Bent Over Row','x'),('8:30',BL,'Band Lat Pulldown','x')],170)+\
 f'<div class="line" style="top:260px;height:470px;background:{BL}"></div><div class="dot" style="top:262px;border-color:{BL};background:{BL}"></div><div class="tm" style="top:264px">3</div>'+\
 f'''<div class="card" style="top:258px;height:470px;border-color:{BL}66"><span class="vid">▶</span>{CARDTOP('SIRT · KUVVET · 3/8','Standard Pull-up','Hedef <b>3 × 10</b> · Vücut · Dinlen <b>1:30</b>')}
{sets([('ok','11'),('ok','9'),('now','9')]).replace('repeat(4','repeat(3')}
<div class="wt"><div><div class="l">3. SET TEKRAR</div><b>9</b></div><div class="pm"><span>−</span><span>+</span></div></div>
<div class="timer"><small>3. SET · YAPILIYOR</small><b class="n" style="color:#F5A524">0:38</b><span>son set · bitince hareket biter</span></div></div>'''+\
 rws([('',RD,'Band Chest Fly',''),('',PU,'Deadbug','')],738)+dock('BİTTİ','3. set · son set',True)
# 4 hareket sonu girişi
rpe=['6','6,5','7','7,5','8','8,5','9','9,5','10']
msi=['0','0,5','1','1,5','2','3']
P['4']=f'''<div class="ent"><div class="tag" style="color:{BL}">SIRT · KUVVET · 3/8 · HAREKET BİTTİ</div><h2>Standard Pull-up</h2>
<div class="sum2"><div><small>SETLER</small><b>11-9-9</b></div><div><small>ORT.</small><b>9,67</b></div><div><small>SÜRE</small><b>5:08</b></div></div>
<div class="lb">NABIZ</div><div class="hr"><div><b>142</b><small> atım/dk · geçen 142</small></div><div class="pm"><span>−</span><span>+</span></div></div>
<div class="lb">RPE</div><div class="grid" style="grid-template-columns:repeat(5,1fr)">'''+''.join(f'<span class="{"on" if v=="9,5" else ""}">{v}</span>' for v in rpe)+f'''<span style="font-size:14px;font-family:Archivo">—</span></div>
<div class="lb">MSI</div><div class="grid" style="grid-template-columns:repeat(6,1fr)">'''+''.join(f'<span class="{"on" if v=="1" else ""}">{v}</span>' for v in msi)+'''</div>
<div class="msid">1 — Belirgin ağrı, set tamamlanıyor, teknik korunuyor. (sporRef)</div>
<div class="lb">NOT</div><div class="hr" style="padding:14px"><span style="font-size:16px;color:#C3CCD6">Omuz hassas, son sette form bozuldu ✎</span></div>
<div class="go"><b>Kaydet · sıradaki: Band Chest Fly</b><small>açıklamaya: "Setler: 11-9-9" eklenir</small></div></div>'''
names={'1':'1 · Hareket hazır','2':'2 · Set arası dinlenme','3':'3 · Son set: tekrar ± düzelt','4':'4 · Hareket sonu: nabız · RPE · MSI'}
for k,b in P.items(): open(f'p{k}.html','w').write(BASE.replace('@@',X+b))
open('comp.html','w').write('<body style="margin:0;background:#1a1d22;display:flex;gap:16px;padding:16px;font:600 22px system-ui;color:#eee">'+''.join(f'<div><div style="height:40px">{names[k]}</div><img src="p{k}.png" width="430"></div>' for k in P)+'</body>')
