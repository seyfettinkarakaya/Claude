BASE=open('/tmp/claude-0/-home-user-Claude/c9865774-3f0a-5f97-98c7-9186fe2a5f9b/scratchpad/home5/common.py').read()
exec(BASE)
AMB='#F5A524'
KAS={'Sırt':'#60A5FA','Core':'#A78BFA','Göğüs':'#F87171','Omuz':'#34D399','Kalça':'#FB923C','Bacak':'#FACC15','Kol':'#94A3B8'}
CSS='''
:root{--amb:#F5A524}
.top{height:56px}.brand{font-size:24px}
.back{width:52px;height:52px;border-radius:16px;background:var(--card);border:1px solid var(--line);display:grid;place-items:center;font-size:26px;color:var(--soft)}
.hd{display:flex;align-items:center;gap:12px}
.hd h1{font-size:26px;font-weight:800;flex:1}
.steps{display:flex;gap:6px;margin:14px 0 16px}.steps i{flex:1;height:5px;border-radius:3px;background:#2A3440}.steps i.on{background:var(--amb)}
.lbl{font-size:12px;font-weight:800;letter-spacing:2px;color:var(--muted);margin:16px 0 8px}
.kas{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.k{border-radius:16px;background:var(--card);border:1.5px solid var(--line);padding:10px 12px}
.k.on{border-color:var(--amb);background:rgba(245,165,36,.08)}
.k b{display:flex;justify-content:space-between;font-size:18px}.k b em{font-style:normal;font-size:13px;font-weight:800;color:var(--amb)}
.k .bar{position:relative;height:8px;border-radius:4px;background:#1E2731;margin-top:8px}
.k .bar i{position:absolute;left:0;top:0;bottom:0;border-radius:4px}
.k .bar s{position:absolute;top:-3px;bottom:-3px;width:2px;background:#EDEFF2}
.k small{display:block;font-size:12px;color:var(--muted);margin-top:5px;font-weight:600}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.ch{padding:9px 14px;border-radius:999px;border:1.5px solid #2A3440;font-size:15px;font-weight:700;color:var(--soft)}
.ch.on{border-color:var(--amb);color:var(--amb);background:rgba(245,165,36,.08)}
.sl{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 14px}
.sl .t{display:flex;justify-content:space-between;font-size:16px;font-weight:700}.sl .t b{color:var(--amb)}
.sl .r{position:relative;height:8px;border-radius:4px;background:#1E2731;margin-top:12px}.sl .r i{position:absolute;left:0;top:0;bottom:0;width:65%;background:var(--amb);border-radius:4px}
.sl .r s{position:absolute;left:65%;top:-6px;width:20px;height:20px;border-radius:50%;background:#EDEFF2;margin-left:-10px}
.cta{position:absolute;left:20px;right:20px;bottom:30px;height:66px;border-radius:22px;background:var(--amb);color:#1A0E04;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;gap:10px}
.cta small{font-size:14px;opacity:.75}
.ex{display:flex;gap:12px;align-items:center;padding:12px;border-radius:18px;background:var(--card);border:1px solid var(--line);margin-bottom:8px}
.ex.on{border-color:rgba(245,165,36,.6)}
.ex .sc{width:46px;text-align:center}.ex .sc b{display:block;font-family:var(--num);font-size:28px;color:var(--amb);line-height:1}.ex .sc small{font-size:10px;font-weight:800;letter-spacing:1px;color:var(--muted)}
.ex .m{flex:1;min-width:0}.ex .m b{font-size:17px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ex .stk{display:flex;height:7px;border-radius:4px;overflow:hidden;margin:7px 0 5px;gap:2px}
.ex .m small{font-size:13px;color:var(--muted);font-weight:600}.ex .m small em{font-style:normal;color:#34D399}
.ex .add{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;font-size:26px;font-weight:700;border:1.5px solid #2A3440;color:var(--soft)}
.ex.on .add{background:var(--amb);border-color:var(--amb);color:#1A0E04;font-size:22px}
.tag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:1px;padding:2px 6px;border-radius:6px;background:#1E2731;color:var(--soft);margin-left:6px;vertical-align:2px}
.leg{display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--soft);font-weight:700;margin-bottom:10px}.leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:-1px}
.pl{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:16px;background:var(--card);border:1px solid var(--line);margin-bottom:7px}
.pl .n{font-family:var(--num);font-size:20px;color:var(--muted);width:22px}
.pl .m{flex:1;min-width:0}.pl .m b{font-size:16px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pl .m small{font-size:13px;color:var(--muted)}
.pl .v{font-family:var(--num);font-size:22px;font-weight:700;text-align:right}.pl .v small{display:block;font-size:12px;color:var(--muted);font-family:'Archivo';font-weight:600}
.pl .g{color:#3A4450;font-size:20px;letter-spacing:-2px}
.dist{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:12px 14px;margin-bottom:12px}
.dr{display:grid;grid-template-columns:62px 1fr 64px;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--soft);margin-top:6px}
.dr .bb{position:relative;height:10px;border-radius:5px;background:#1E2731}.dr .bb i{position:absolute;left:0;top:0;bottom:0;border-radius:5px}.dr .bb s{position:absolute;top:-3px;bottom:-3px;width:2px;background:#EDEFF2}
.dr em{font-style:normal;text-align:right;font-family:var(--num);font-size:16px}
.sum{display:flex;justify-content:space-between;font-size:14px;color:var(--soft);font-weight:700;margin-bottom:8px}.sum b{color:var(--text);font-family:var(--num);font-size:20px}
.cta2{position:absolute;left:20px;right:20px;bottom:30px;display:grid;grid-template-columns:1fr 1.4fr;gap:10px}
.cta2 span{height:62px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800}
.cta2 .a{border:1.5px solid rgba(245,165,36,.5);color:var(--amb)}.cta2 .b{background:var(--amb);color:#1A0E04}
'''
def hd(t,step): return f'<div class="hd"><span class="back">‹</span><h1>{t}</h1></div><div class="steps">'+''.join(f'<i class="{"on" if i<=step else ""}"></i>' for i in range(3))+'</div>'
P={}
# 1 hedef
kas=[('Sırt',23,27,True),('Core',18,19,False),('Göğüs',9,13,True),('Omuz',15,14,False),('Kalça',12,10,False),('Bacak',6,9,True),('Kol',7,8,False)]
kh=''.join(f'<div class="k {"on" if on else ""}"><b>{n}<em>{"HEDEF" if on else ""}</em></b><div class="bar"><i style="width:{g*2.6}%;background:{KAS[n]}"></i><s style="left:{h*2.6}%"></s></div><small>son 4 hafta %{g} · hedef %{h} {"· <span style=color:#F87171>−"+str(h-g)+"</span>" if h>g else ""}</small></div>' for n,g,h,on in kas)
P['1']=('',hd('Salon idmanı planla',0)+'<p class="date" style="margin-top:0">Cuma, 2 Ekim · Faz-0 · Doku adaptasyonu</p>'
 +'<p class="lbl">HEDEF KASLAR · dokun, seç</p><div class="kas">'+kh+'</div>'
 +'<p class="lbl">AMAÇ</p><div class="chips"><span class="ch on">Kuvvet</span><span class="ch">Hipertrofi</span><span class="ch on">Rehab</span><span class="ch">Mobilite</span></div>'
 +'<p class="lbl">YÜZMEYE ETKİ (en az)</p><div class="sl"><div class="t">Yüzme aktarım katsayısı <b>≥ 0,70</b></div><div class="r"><i></i><s></s></div></div>'
 +'<p class="lbl">EKİPMAN</p><div class="chips"><span class="ch on">Band</span><span class="ch on">Dambıl</span><span class="ch on">Vücut</span><span class="ch">Bar</span></div>'
 +'<div class="cta">Hareketleri getir <small>· 38 uygun</small></div>')
# 2 hareket listesi
def stk(parts): return '<div class="stk">'+''.join(f'<i style="flex:{p};background:{KAS[k]}"></i>' for k,p in parts)+'</div>'
exs=[('Band Bent Over Row','Rehab',0.75,92,[('Sırt',70),('Omuz',20),('Kol',10)],'Son: 02.06 · 4×20 @15 · RPE 7,5 · <em>MSI 0</em>',True),
 ('Standard Pull-up','Kuvvet',0.95,90,[('Sırt',65),('Kol',20),('Core',15)],'Son: 02.06 · 3×10 @vücut · RPE 9,5 · MSI 1',True),
 ('Band Lat Pulldown','Rehab',0.85,86,[('Sırt',75),('Kol',15),('Omuz',10)],'Son: 02.06 · 4×20 @15 · RPE 7,5 · MSI 0,5',True),
 ('Decline Push-up','Kuvvet',0.80,71,[('Göğüs',55),('Omuz',25),('Kol',20)],'Son: 01.03 · 3×20 @vücut · RPE 9 · MSI 1',False),
 ('Band Chest Fly','Rehab',0.70,68,[('Göğüs',70),('Omuz',30)],'Son: 02.06 · 4×20 @15 · RPE 7,5 · MSI 0,5',True),
 ('DB Goblet Squat','Kuvvet',0.60,55,[('Bacak',60),('Kalça',30),('Core',10)],'Son: 08.02 · 3×12 @18 · RPE 7,5 · MSI 0,5',False),
 ('Ab Wheel Rollout','Kuvvet',0.93,52,[('Core',75),('Sırt',15),('Omuz',10)],'Son: 21.12 · 3×12 @vücut · RPE 7',False)]
eh=''.join(f'<div class="ex {"on" if on else ""}"><div class="sc"><b>{sc}</b><small>PUAN</small></div><div class="m"><b>{n}<span class="tag">{g.upper()}</span></b>{stk(p)}<small>Yüzme {str(st).replace(".",",")} · {last}</small></div><span class="add">{"✓" if on else "+"}</span></div>' for n,g,st,sc,p,last,on in exs)
P['2']=('',hd('Hareket seç',1)+'<div class="leg">'+''.join(f'<span><i style="background:{c}"></i>{k}</span>' for k,c in KAS.items())+'</div>'
 +'<div class="sum"><span>Sıralama: <b style="font-size:15px;color:var(--amb)">hedef kas × yüzme etkisi</b></span><span>4 seçili</span></div>'+eh
 +'<div class="cta">Plana geç <small>· 4 hareket</small></div>')
# 3 plan ozeti
pl=[('Band Bent Over Row','Sırt · Rehab','4 × 20','15 kg'),('Standard Pull-up','Sırt · Kuvvet','3 × 10','vücut'),('Band Lat Pulldown','Sırt · Rehab','4 × 20','15 kg'),('Band Chest Fly','Göğüs · Rehab','4 × 20','15 kg'),('Deadbug','Core · Rehab','4 × 40','vücut'),('Doorway Pec Stretch','Mobilite','1 × 60 sn','—')]
ph=''.join(f'<div class="pl"><span class="g">⋮⋮</span><span class="n">{i+1}</span><div class="m"><b>{n}</b><small>{d}</small></div><div class="v">{v}<small>{w}</small></div></div>' for i,(n,d,v,w) in enumerate(pl))
dist=[('Sırt',38,27),('Göğüs',14,13),('Core',16,19),('Omuz',12,14),('Kol',10,8),('Kalça',5,10),('Bacak',5,9)]
dh=''.join(f'<div class="dr"><span>{k}</span><div class="bb"><i style="width:{a*2}%;background:{KAS[k]}"></i><s style="left:{h*2}%"></s></div><em>%{a} <span style="color:var(--muted);font-size:13px">/ {h}</span></em></div>' for k,a,h in dist)
P['3']=('',hd('Plan',2)+'<div class="sum"><span>6 hareket · 21 set</span><span>~<b>48</b> dk</span><span>Yüzme etkisi <b>0,82</b></span></div>'
 +'<div class="dist"><div style="font-size:12px;font-weight:800;letter-spacing:2px;color:var(--muted)">BU PLANIN KAS DAĞILIMI · çizgi = hedef</div>'+dh+'</div>'+ph
 +'<div class="cta2"><span class="a">Kaydet (Plan)</span><span class="b">İdmanı başlat</span></div>')
names={'1':'1 · Hedef: kas, amaç, yüzme etkisi','2':'2 · Hareket listesi (puanlı)','3':'3 · Plan: sıra, değerler, dağılım'}
for k,(c,b) in P.items(): open(f's{k}.html','w').write(BASE.replace('@@CSS@@',CSS+c).replace('@@BODY@@',b))
open('comp.html','w').write('<body style="margin:0;background:#1a1d22;display:flex;gap:16px;padding:16px;font:600 22px system-ui;color:#eee">'+''.join(f'<div><div style="height:40px">{names[k]}</div><img src="s{k}.png" width="430"></div>' for k in P)+'</body>')
