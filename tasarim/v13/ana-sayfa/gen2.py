exec(open('common.py').read())
CAL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>'
PLAY='<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>'
COMMON='''
.btns{display:grid;grid-template-columns:1.5fr 1fr;gap:10px;margin-top:16px}
.b1,.b2{height:60px;border-radius:18px;display:flex;align-items:center;justify-content:center;gap:9px;font-weight:800;font-size:17px}
.b1 svg,.b2 svg{width:20px;height:20px}
.sw .b1{background:var(--teal);color:#032024}
.sw .b2{border:1.5px solid rgba(45,212,191,.45);color:var(--teal)}
.gy .b1{background:rgba(245,165,36,.12);color:#C98A2E;border:1.5px dashed rgba(245,165,36,.35)}
.gy .b2{border:1.5px solid rgba(245,165,36,.25);color:#9C7436}
.nx{font-size:12px;font-weight:800;letter-spacing:2px}
.sw .nx{color:var(--teal)}.gy .nx{color:#C98A2E}
.nd{font-size:24px;font-weight:800;margin-top:6px}
.nd span{color:var(--soft);font-weight:700}
.nm{font-size:22px;color:var(--soft);margin-top:4px}
'''
SWNEXT='<span class="nx">SIRADAKİ İDMAN</span><div class="nd">Bugün <span>· Çarşamba 23 Eylül</span></div>'+metro(330,20,5)+'<div class="nm num">5 set · 1.200 m · 25:30 · ana set 400 m</div>'
SWBT=f'<div class="btns"><span class="b1">{PLAY}İdmanı aç</span><span class="b2">{CAL}Takvim</span></div>'
GYBT=f'<div class="btns"><span class="b1">Yakında</span><span class="b2">{CAL}Takvim</span></div>'
D={}
# A — bölünmüş ekran
D['A']=(COMMON+'''
body{padding:0}
.top{position:absolute;top:54px;left:20px;right:20px;z-index:3}
.half{position:absolute;left:0;right:0;padding:0 22px;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden}
.h1{top:0;height:560px;padding-bottom:24px;background:radial-gradient(460px 320px at 85% 15%,rgba(45,212,191,.13),transparent 70%),#0D151B;border-bottom:1px solid #1B2A30}
.h2{top:560px;height:250px;padding-bottom:22px;background:radial-gradient(420px 220px at 90% 10%,rgba(245,165,36,.08),transparent 70%),#0E0D0B}
.lines{position:absolute;right:-30px;top:120px;width:320px;height:130px;opacity:.55}
.lines path{fill:none;stroke:#173238;stroke-width:2}
.k{font-size:12px;font-weight:800;letter-spacing:2.4px}
.h1 .k{color:var(--teal)}.h2 .k{color:#C98A2E}
.name{font-size:84px;font-weight:800;line-height:.95;letter-spacing:-1.5px;margin:6px 0 16px}
.h2 .name{font-size:60px;color:#6B5B44;margin-bottom:0}
.nd{font-size:22px}
.foot{position:absolute;left:20px;right:20px;top:822px}
.hist{padding:12px 18px}
.ver{display:none}
''',HEAD+'<div class="half h1 sw"><svg class="lines" viewBox="0 0 300 200">'+''.join(f'<path d="M0 {y} q37 -22 75 0 t75 0 t75 0 t75 0"/>' for y in range(30,200,26))+'</svg>'
 +'<span class="k">01 · YÜZME</span><span class="name">Yüzme</span>'+SWNEXT+SWBT+'</div>'
 +'<div class="half h2 gy"><span class="k">02 · SALON · YAKINDA</span><span class="name">Salon</span>'+GYBT+'</div>'
 +'<div class="foot">'+HIST+'</div>')
# B — editoryal liste
D['B']=(COMMON+'''
.ttl{font-size:15px;font-weight:800;letter-spacing:2.4px;color:var(--muted);margin:26px 0 6px}
.it{display:grid;grid-template-columns:44px 1fr;gap:4px;padding:22px 0;border-top:1px solid var(--line)}
.it:last-of-type{border-bottom:1px solid var(--line)}
.no{font-family:var(--num);font-size:26px;font-weight:700;padding-top:10px}
.sw .no{color:var(--teal)}.gy .no{color:#C98A2E}
.hh{display:flex;align-items:center;justify-content:space-between}
.it h3{font-size:60px;font-weight:800;line-height:1;letter-spacing:-1px}
.gy h3{color:#6B5B44}
.ic{width:42px;height:42px}
.sw .ic{color:var(--teal)}.gy .ic{color:#8A6A3A}
.inner{margin-top:14px}
.metro{margin-top:12px}
.sp{height:22px}
''',HEAD+'<p class="date">Çarşamba, 23 Eylül</p><p class="ttl">ANTRENMAN</p>'
 +f'<div class="it sw"><span class="no">01</span><div><div class="hh"><h3>Yüzme</h3><span class="ic">{SWIM}</span></div><div class="inner">{SWNEXT}</div>{SWBT}</div></div>'
 +f'<div class="it gy"><span class="no">02</span><div><div class="hh"><h3>Salon</h3><span class="ic">{GYM}</span></div><div class="inner"><span class="nx">YAKINDA · KUVVET VE MOBİLİTE</span></div></div></div>'
 +'<div class="sp"></div>'+HIST+V)
# C — renk kodlu kartlar
D['C']=(COMMON+'''
.ttl{font-size:36px;font-weight:800;line-height:1.05;margin:6px 0 18px}
.card{position:relative;border-radius:28px;background:var(--card);border:1px solid var(--line);padding:18px 18px 18px 28px;overflow:hidden;margin-bottom:14px}
.card:before{content:"";position:absolute;left:0;top:0;bottom:0;width:8px}
.sw:before{background:var(--teal)}.gy:before{background:var(--amber);opacity:.6}
.hd{display:flex;align-items:center;gap:14px}
.ic{width:52px;height:52px;border-radius:16px;display:grid;place-items:center}
.ic svg{width:30px;height:30px}
.sw .ic{background:rgba(45,212,191,.14);color:var(--teal)}
.gy .ic{background:rgba(245,165,36,.10);color:#C98A2E}
.hd h3{font-size:34px;font-weight:800;flex:1}
.gy h3{color:#9C8A70}
.soon{padding:5px 11px;border-radius:999px;border:1.5px solid rgba(245,165,36,.4);color:#C98A2E;font-size:12px;font-weight:800;letter-spacing:1.8px}
.next{margin-top:16px;padding:14px 16px;border-radius:20px;background:var(--bg);border:1px solid var(--line)}
.next .nd{font-size:22px}
.gy p{margin-top:12px;font-size:16px;color:var(--muted)}
''',HEAD+'<p class="date">Çarşamba, 23 Eylül</p><h1 class="ttl">Bugün ne<br>çalışıyoruz?</h1>'
 +f'<div class="card sw"><div class="hd"><span class="ic">{SWIM}</span><h3>Yüzme</h3></div><div class="next">{SWNEXT}</div>{SWBT}</div>'
 +f'<div class="card gy"><div class="hd"><span class="ic">{GYM}</span><h3>Salon</h3><span class="soon">YAKINDA</span></div><p>Kuvvet ve mobilite programları burada olacak.</p></div>'
 +HIST+V)
for k,(css,body) in D.items():
    open(f'n{k}.html','w').write(BASE.replace('@@CSS@@',css).replace('@@BODY@@',body))
names={'A':'A · Bölünmüş ekran','B':'B · Editoryal liste','C':'C · Renk kodlu kartlar'}
open('comp2.html','w').write('<body style="margin:0;background:#1a1d22;display:flex;gap:16px;padding:16px;font:600 22px system-ui;color:#eee">'+''.join(f'<div><div style="height:40px">{names[k]}</div><img src="n{k}.png" width="430"></div>' for k in D)+'</body>')
