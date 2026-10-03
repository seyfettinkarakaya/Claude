# v20 — Salon planlama: A (büyük kartlar) + B (gövde haritası) + C (denge, plan tepsisi) birleşimi.
import math
from body import body_html, CSS as BODY_CSS

FONTS = open('/home/user/Claude/fonts/fonts.css').read().replace('url(', 'url(/fonts/')
AMB = '#F5A524'
G = {'Sırt': '#60A5FA', 'Göğüs': '#F87171', 'Omuz': '#F5A524', 'Kol': '#FB923C', 'Gövde': '#A78BFA', 'Kalça': '#2DD4BF', 'Bacak': '#A3E635'}
KAS = [('Sırt', 38, 27, 1), ('Gövde', 9, 19, 2), ('Göğüs', 12, 13, 0), ('Omuz', 16, 14, 0), ('Kol', 14, 9, 0), ('Kalça', 6, 10, 0), ('Bacak', 5, 8, 1)]
LOAD = {n: g / 40 for n, g, t, o in KAS}
PRIO = {n: o for n, g, t, o in KAS}
EX = [
    ('Ab Wheel Rollout', 'Kuvvet', 100, [('Gövde', 75), ('Sırt', 15), ('Omuz', 10)], '3 × 12 · vücut', '+1 tekrar', False, True, '0,93'),
    ('Band Lat Pulldown', 'Rehab', 86, [('Sırt', 75), ('Kol', 15), ('Omuz', 10)], '4 × 20 · 15 kg', '+2,5 kg', False, True, '0,85'),
    ('Deadbug', 'Rehab', 81, [('Gövde', 85), ('Kalça', 15)], '4 × 40 sn · vücut', '+5 sn', False, False, '0,80'),
    ('Standard Pull-up', 'Kuvvet', 74, [('Sırt', 60), ('Kol', 40)], '3 × 11-9-9 · vücut', 'aynı', True, False, '0,95'),
]
PLAN = [('Ab Wheel Rollout', 'Gövde', 3, '13', 'vücut', '+1 tekrar'), ('Band Lat Pulldown', 'Sırt', 4, '20', '17,5 kg', '+2,5 kg'),
        ('DB Goblet Squat', 'Bacak', 3, '12', '20,5 kg', '+2,5 kg'), ('Deadbug', 'Gövde', 4, '45 sn', 'vücut', '+5 sn')]

CSS = FONTS + '''
*{box-sizing:border-box;margin:0;padding:0}
body{background:#05070A;font-family:Archivo,system-ui,sans-serif;color:#EDEFF2;display:flex;gap:28px;padding:48px 28px 28px;align-items:flex-start}
.cap{position:absolute;left:0;right:0;top:-10px;transform:translateY(-100%);font:800 19px Archivo;color:#C3CCD6}
.ph{position:relative;width:390px;height:844px;border-radius:44px;background:#0B0F14;border:1px solid #1E2731;overflow:hidden;padding:54px 16px 0}
.n{font-family:'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums}
.top{display:flex;align-items:center;gap:12px}
.back{width:50px;height:50px;border-radius:16px;background:#141B23;border:1px solid #1E2731;display:grid;place-items:center;font-size:28px;color:#C3CCD6;flex:none}
.top h1{font-size:26px;font-weight:800;line-height:1.1}.top small{display:block;font-size:14px;font-weight:700;color:#8B97A5;margin-top:3px}
.steps{display:flex;gap:6px;margin:14px 0 0}.steps i{flex:1;height:6px;border-radius:3px;background:#222B36}.steps i.on{background:#F5A524}
.seg{display:flex;gap:4px;margin-top:14px;padding:4px;border-radius:16px;background:#141B23;border:1px solid #1E2731}
.seg span{flex:1;height:42px;border-radius:12px;display:grid;place-items:center;font-size:17px;font-weight:800;color:#8B97A5}
.seg span.on{background:#222B36;color:#EDEFF2}
.map{position:relative;height:388px;margin-top:8px;border-radius:24px;background:radial-gradient(240px 220px at 50% 48%,#131A23,#0B0F14 75%)}
.map .tag{position:absolute;padding:6px 10px;border-radius:12px;background:#0B0F14EE;border:1.5px solid;font-size:15px;font-weight:800;white-space:nowrap}
.map .tag b{font-family:'Barlow Condensed';font-size:20px;margin-left:4px}
.map .vw{position:absolute;bottom:4px;font-size:12px;font-weight:800;letter-spacing:1.6px;color:#5F6B78}
.leg{display:flex;justify-content:center;gap:16px;font-size:14px;font-weight:700;color:#8B97A5;margin-top:4px}
.leg i{display:inline-block;width:22px;height:10px;border-radius:5px;margin-right:6px;vertical-align:0;background:linear-gradient(90deg,#60A5FA33,#60A5FA)}
.lb{font-size:13px;font-weight:800;letter-spacing:1.8px;color:#8B97A5;margin:18px 0 9px}
.kg{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.k{border-radius:20px;background:#12181F;border:2px solid #1E2731;padding:11px 13px}
.k.p1{border-color:#F5A52499;background:#1A1710}.k.p2{border-color:#F5A524;background:#221A0C}
.k .h{display:flex;justify-content:space-between;align-items:center;font-size:19px;font-weight:800}
.k .h i{width:12px;height:12px;border-radius:4px;display:inline-block;margin-right:7px}
.k .st{font-size:14px;font-weight:800;color:#F5A524}
.k .v{display:flex;align-items:baseline;gap:6px;margin-top:2px}.k .v b{font-size:40px;font-weight:700;line-height:1}.k .v small{font-size:14px;color:#8B97A5;font-weight:700}
.k .bar{position:relative;height:9px;border-radius:5px;background:#222B36;margin-top:7px}.k .bar i{position:absolute;left:0;top:0;bottom:0;border-radius:5px}.k .bar s{position:absolute;top:-4px;bottom:-4px;width:3px;border-radius:2px;background:#EDEFF2}
.k .t{font-size:14px;color:#8B97A5;font-weight:700;margin-top:6px}
.fade{position:absolute;left:0;right:0;bottom:0;height:150px;background:linear-gradient(transparent,#0B0F14 50%)}
.cta{position:absolute;left:16px;right:16px;bottom:30px;height:68px;border-radius:22px;background:#F5A524;color:#1A0E04;display:flex;align-items:center;justify-content:space-between;padding:0 22px;font-size:21px;font-weight:800}
.cta small{font-size:15px;font-weight:800;opacity:.7}
.radar{display:flex;justify-content:center;margin-top:6px;height:300px}
.row{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:18px;background:#12181F;border:2px solid #1E2731;margin-bottom:8px}
.row.p1{border-color:#F5A52499}.row.p2{border-color:#F5A524;background:#1A1710}
.row .nm{font-size:19px;font-weight:800;width:78px;display:flex;align-items:center;gap:7px}.row .nm i{width:11px;height:11px;border-radius:4px}
.row .bb{flex:1;position:relative;height:12px;border-radius:6px;background:#222B36}.row .bb i{position:absolute;left:0;top:0;bottom:0;border-radius:6px}.row .bb s{position:absolute;top:-5px;bottom:-5px;width:3px;background:#EDEFF2;border-radius:2px}
.row .v{width:50px;text-align:right;font-size:26px;font-weight:700}.row .d{width:40px;text-align:right;font-size:15px;font-weight:800}
.row .st{width:26px;font-size:15px;color:#F5A524;font-weight:800}
.chips{display:flex;flex-wrap:wrap;gap:8px}.ch{min-height:44px;padding:9px 15px;border-radius:999px;border:1.5px solid #2A3440;font-size:16px;font-weight:700;color:#C3CCD6;display:inline-flex;align-items:center}
.ch.on{border-color:#F5A524;color:#1A0E04;background:#F5A524}
.ex{display:flex;gap:12px;align-items:center;border-radius:22px;background:#12181F;border:2px solid #1E2731;padding:12px 12px 12px 10px;margin-bottom:10px}
.ex.on{border-color:#F5A524;background:#16140F}
.mini{flex:none;width:64px;height:118px;border-radius:16px;background:radial-gradient(60px 80px at 50% 45%,#141B23,#0B0F14);display:grid;place-items:center}
.mini small{position:absolute}
.m{flex:1;min-width:0}.m .hd{display:flex;align-items:center;justify-content:space-between;gap:8px}
.m .nm{font-size:19px;font-weight:800;line-height:1.15}
.m .sc{flex:none;font-size:26px;font-weight:700;color:#F5A524;line-height:1}.m .sc small{font-family:Archivo;font-size:11px;font-weight:800;color:#8B97A5;margin-left:2px}
.m .pay{font-size:15px;font-weight:700;margin:6px 0 6px}
.m .ls{display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:16px;color:#C3CCD6;font-weight:600}.m .ls em{font-style:normal;color:#3DDC84;font-weight:800}.m .ls em.w{color:#FFB020}
.add{flex:none;min-width:46px;height:40px;padding:0 10px;border-radius:12px;border:2px solid #2A3440;display:grid;place-items:center;font-size:16px;font-weight:800;color:#C3CCD6}
.ex.on .add{background:#F5A524;border-color:#F5A524;color:#1A0E04}
.tg{display:inline-block;margin-left:6px;padding:2px 6px;border-radius:7px;background:#222B36;font-size:11px;font-weight:800;letter-spacing:.8px;color:#C3CCD6;vertical-align:3px}
.tray{position:absolute;left:0;right:0;bottom:0;background:#141B23;border-top:1px solid #2A3440;border-radius:28px 28px 0 0;padding:10px 16px 28px;box-shadow:0 -24px 40px rgba(0,0,0,.6)}
.tray .gr{width:44px;height:5px;border-radius:3px;background:#2A3440;margin:0 auto 10px}
.tray .h{display:flex;justify-content:space-between;align-items:center;gap:10px}
.tray .h .t{font-size:18px;font-weight:800}.tray .h .t small{display:block;font-size:14px;color:#8B97A5;font-weight:700;margin-top:2px}
.tray .go{height:56px;padding:0 20px;border-radius:18px;background:#F5A524;color:#1A0E04;display:flex;align-items:center;font-size:19px;font-weight:800}
.tray .chs{display:flex;gap:5px;margin-top:10px}.tray .chs span{height:8px;border-radius:4px}
.pl{display:flex;align-items:center;gap:10px;padding:12px 12px 12px 8px;border-radius:20px;background:#12181F;border:1px solid #1E2731;margin-bottom:9px}
.pl .g{color:#3A4450;font-size:22px;letter-spacing:-3px;width:16px}
.pl .no{font-size:22px;color:#5F6B78;width:16px;text-align:center}
.pl .nm{font-size:18px;font-weight:800;line-height:1.15}.pl .sub{font-size:14px;font-weight:700;margin-top:3px}
.pl .sub em{font-style:normal;color:#3DDC84}
.pl .v{margin-left:auto;text-align:right;flex:none}.pl .v b{display:block;font-size:30px;font-weight:700;line-height:1}.pl .v small{font-size:15px;color:#9AA5B1;font-weight:700}
.sum{display:flex;gap:8px;margin-top:4px}.sum div{flex:1;border-radius:16px;background:#12181F;border:1px solid #1E2731;padding:9px 12px}
.sum small{font-size:12px;font-weight:800;letter-spacing:1.4px;color:#8B97A5}.sum b{display:block;font-size:30px;font-weight:700;line-height:1.1}
.cov{display:flex;align-items:center;gap:12px;border-radius:20px;background:#12181F;border:1px solid #1E2731;padding:10px 12px;margin-top:10px}
.cov .t{font-size:15px;font-weight:700;color:#C3CCD6;line-height:1.5}.cov .t b{color:#EDEFF2}
.two{position:absolute;left:16px;right:16px;bottom:30px;display:grid;grid-template-columns:1fr 1.5fr;gap:10px}
.two span{height:66px;border-radius:22px;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:800}
.two .a{border:2px solid #F5A52480;color:#F5A524}.two .b{background:#F5A524;color:#1A0E04}
'''

def steps(k):
    return '<div class="steps">' + ''.join(f'<i class="{"on" if i <= k else ""}"></i>' for i in range(3)) + '</div>'

def stk(pay, h=8):
    return f'<div style="display:flex;gap:2px;height:{h}px;border-radius:{h//2}px;overflow:hidden">' + ''.join(f'<i style="flex:{p};background:{G[g]}"></i>' for g, p in pay) + '</div>'

def svg(w, h, vb, inner):
    return f'<svg width="{w}" height="{h}" viewBox="{vb}">{DEFS}{inner}</svg>'

def bodymap():
    th = f'<span class="tag" style="left:50%;top:6px;transform:translateX(-50%);border-color:{G["Gövde"]};color:{G["Gövde"]}">Gövde<b class="n">%9</b> · tüm %19 · ★★</span>'
    return f'<div class="map"><div style="padding-top:34px">{body_html(340, "both", LOAD, G, PRIO)}</div>{th}<span class="vw" style="left:86px">ÖN</span><span class="vw" style="right:76px">ARKA</span></div>'

def cards(n=4):
    return '<div class="kg">' + ''.join(f'''<div class="k p{o}"><div class="h"><span><i style="background:{G[nm]}"></i>{nm}</span><span class="st">{"★★" if o == 2 else "★" if o else ""}</span></div>
      <div class="v"><b class="n">%{g}</b><small>4 hafta</small></div><div class="bar"><i style="width:{g*2.2}%;background:{G[nm]}"></i><s style="left:{t*2.2}%"></s></div>
      <div class="t">tüm zaman %{t}{f' · <span style=color:{"#3DDC84" if g > t else "#F87171"}>{g-t:+d}</span>' if abs(g-t) >= 3 else ''}</div></div>''' for nm, g, t, o in KAS[:n]) + '</div>'

def p1():
    return f'''<div class="ph"><div class="top"><span class="back">‹</span><div><h1>Neyi çalışalım?</h1><small>Cuma 3 Ekim · Faz-0 · son 4 hafta</small></div></div>{steps(0)}
      <div class="seg"><span class="on">Vücut</span><span>Denge</span><span>Liste</span></div>
      {bodymap()}<div class="leg"><span><i></i>soluk az · dolu çok çalışıldı</span><span style="color:#F5A524">★ öncelik</span></div>
      {cards(2)}<div class="fade"></div><div class="cta"><span>Hareketleri getir</span><small>24 uygun ›</small></div></div>'''

def radar(size=300):
    cx = cy = size / 2; R = size / 2 - 46; n = len(KAS)
    pt = lambda i, v: (cx + R * v * math.sin(2 * math.pi * i / n), cy - R * v * math.cos(2 * math.pi * i / n))
    poly = lambda f: ' '.join(f'{pt(i, f(i))[0]:.1f},{pt(i, f(i))[1]:.1f}' for i in range(n))
    grid = ''.join(f'<polygon points="{poly(lambda i: q)}" fill="none" stroke="#222B36" stroke-width="1.5"/>' for q in (0.25, 0.5, 0.75, 1))
    axes = ''.join(f'<line x1="{cx}" y1="{cy}" x2="{pt(i, 1)[0]:.1f}" y2="{pt(i, 1)[1]:.1f}" stroke="#1B232D"/>' for i in range(n))
    tum = poly(lambda i: KAS[i][2] / 40); son = poly(lambda i: KAS[i][1] / 40)
    lab = ''
    for i, (nm, g, t, o) in enumerate(KAS):
        x, y = pt(i, 1.22)
        lab += f'<circle cx="{pt(i,1)[0]:.1f}" cy="{pt(i,1)[1]:.1f}" r="{6 if o else 4}" fill="{G[nm]}" stroke="{"#F5A524" if o else "none"}" stroke-width="3"/>'
        lab += f'<text x="{x:.1f}" y="{y+5:.1f}" text-anchor="middle" font-family="Archivo" font-size="15" font-weight="800" fill="{G[nm]}">{nm}{" ★★" if o == 2 else " ★" if o else ""}</text>'
    return f'<svg width="{size}" height="{size}">{grid}{axes}<polygon points="{tum}" fill="none" stroke="#EDEFF2" stroke-dasharray="5 5" stroke-width="2"/><polygon points="{son}" fill="#F5A52438" stroke="#F5A524" stroke-width="3"/>{lab}</svg>'

def p2():
    rows = ''.join(f'''<div class="row p{o}"><span class="nm"><i style="background:{G[nm]}"></i>{nm}</span><span class="bb"><i style="width:{g*2.3}%;background:{G[nm]}"></i><s style="left:{t*2.3}%"></s></span><span class="v n">%{g}</span>
      <span class="d" style="color:{"#3DDC84" if g >= t else "#F87171"}">{g-t:+d}</span><span class="st">{"★★" if o == 2 else "★" if o else ""}</span></div>''' for nm, g, t, o in KAS[:4])
    return f'''<div class="ph"><div class="top"><span class="back">‹</span><div><h1>Neyi çalışalım?</h1><small>Denge: son 4 hafta ━ · tüm zaman ┅</small></div></div>{steps(0)}
      <div class="seg"><span>Vücut</span><span class="on">Denge</span><span>Liste</span></div>
      <div class="radar">{radar(300)}</div>
      <p class="lb">AZ ÇALIŞILAN ÖNCE</p>{rows}
      <div class="fade"></div><div class="cta"><span>Hareketleri getir</span><small>24 uygun ›</small></div></div>'''

def mini(pay):
    load = {g: p / max(x for _, x in pay) for g, p in pay}
    view = 'arka' if pay[0][0] in ('Sırt', 'Kalça') else 'on'
    return f'<span class="mini">{body_html(108, view, load, G)}</span>'

def p3():
    eh = ''.join(f'''<div class="ex {"on" if on else ""}">{mini(p)}<div class="m"><div class="hd"><span class="nm">{n}{" ⚠" if w else ""}</span><span class="sc n">{s}<small>PUAN</small></span></div>
      <div class="pay">{" · ".join(f'<span style="color:{G[g]}">{g} %{v}</span>' for g, v in p[:3])}</div>{stk(p)}
      <div class="ls"><span>{l} → <em class="{"w" if w else ""}">{o}</em></span><span class="add">{"✓" if on else "+"}</span></div></div></div>''' for n, am, s, p, l, o, w, on, stc in EX)
    return f'''<div class="ph"><div class="top"><span class="back">‹</span><div><h1>Hareket seç</h1><small>★★ Gövde · ★ Sırt · ★ Bacak</small></div></div>{steps(1)}
      <div class="chips" style="margin:12px 0 10px"><span class="ch on">Kuvvet</span><span class="ch on">Rehab</span><span class="ch">Yüzme ≥0,7</span></div>
      {eh}
      <div class="tray"><div class="gr"></div><div class="h"><div class="t">Plan · 3 hareket<small>11 set · ~42 dk</small></div><span class="go">Plana geç ›</span></div>
      <div class="chs"><span style="flex:3;background:{G["Gövde"]}"></span><span style="flex:4;background:{G["Sırt"]}"></span><span style="flex:3;background:{G["Bacak"]}"></span></div></div></div>'''

def p4():
    pl = ''.join(f'''<div class="pl"><span class="g">⋮⋮</span><div style="min-width:0"><div class="nm">{n}</div><div class="sub"><span style="color:{G[g]}">{g}</span> · <em>{o}</em></div></div>
      <div class="v"><b class="n">{st} × {r}</b><small>{w}</small></div></div>''' for n, g, st, r, w, o in PLAN)
    cov = {'Gövde': 1, 'Sırt': .6, 'Bacak': .5, 'Kalça': .3, 'Kol': .2, 'Omuz': .2}
    return f'''<div class="ph"><div class="top"><span class="back">‹</span><div><h1>Plan</h1><small>Sürükle: sıra · dokun: set, tekrar, ağırlık</small></div></div>{steps(2)}
      <div style="height:12px"></div>{pl}
      <div class="cov">{body_html(104, "both", cov, G)}<div class="t"><b>Bu plan:</b> Gövde ağırlıklı,<br>Sırt ve Bacak destek.<br><span style="color:#3DDC84">Gövde açığı kapanıyor (+9)</span></div></div>
      <div class="sum" style="margin-top:10px"><div><small>HAREKET</small><b class="n">4</b></div><div><small>SET</small><b class="n">14</b></div><div><small>SÜRE</small><b class="n">~48 dk</b></div></div>
      <div class="two"><span class="a">Kaydet</span><span class="b">İdmana başla ›</span></div></div>'''

pages = {'1-hedef': ((p1, '1 · Hedef: Vücut haritası'), (p2, '1 · Hedef: Denge (aynı ekranın sekmesi)')),
         '2-hareket-plan': ((p3, '2 · Hareket seç + plan tepsisi'), (p4, '3 · Plan'))}
for key, phs in pages.items():
    body = ''.join(f'<div style="position:relative"><div class="cap">{c}</div>{f()}</div>' for f, c in phs)
    open(f'{key}.html', 'w').write(f'<!doctype html><meta charset="utf-8"><style>{CSS}{BODY_CSS}</style><body>{body}</body>')
print('ok')
