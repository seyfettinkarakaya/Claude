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
