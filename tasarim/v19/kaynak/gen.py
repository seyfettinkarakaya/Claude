# Salon planlama ekranı — 3 tasarım seçeneği (v19). Çıktı: a.html, b.html, c.html (her biri 2 telefon).
FONTS = open('/home/user/Claude/fonts/fonts.css').read().replace('url(', 'url(/home/user/Claude/fonts/')
AMB = '#F5A524'
G = {'Sırt': '#60A5FA', 'Göğüs': '#F87171', 'Omuz': '#F5A524', 'Kol': '#FB923C', 'Gövde': '#A78BFA', 'Kalça': '#2DD4BF', 'Bacak': '#34D399'}
# kas grubu: (son 4 hafta %, tüm zaman %, öncelik 0/1/2)
KAS = [('Sırt', 38, 27, 1), ('Gövde', 9, 19, 2), ('Göğüs', 12, 13, 0), ('Omuz', 16, 14, 0), ('Kol', 14, 9, 0), ('Kalça', 6, 10, 0), ('Bacak', 5, 8, 1)]
EX = [  # ad, amaç, puan, pay[(grup, %)], son, öneri, uyarı, seçili, video
    ('Ab Wheel Rollout', 'Kuvvet', 100, [('Gövde', 75), ('Sırt', 15), ('Omuz', 10)], '3 × 12 · vücut', '+1 tekrar', False, True, True),
    ('Band Lat Pulldown', 'Rehab', 86, [('Sırt', 75), ('Kol', 15), ('Omuz', 10)], '4 × 20 · 15 kg', '+2,5 kg', False, True, False),
    ('Deadbug', 'Rehab', 81, [('Gövde', 85), ('Kalça', 15)], '4 × 40 sn · vücut', '+5 sn', False, False, True),
    ('Standard Pull-up', 'Kuvvet', 74, [('Sırt', 60), ('Kol', 40)], '3 × 11-9-9 · vücut', 'aynı', True, False, False),
    ('DB Goblet Squat', 'Kuvvet', 58, [('Bacak', 60), ('Kalça', 30), ('Gövde', 10)], '3 × 12 · 18 kg', '+2,5 kg', False, True, False),
]
PLAN = [('Ab Wheel Rollout', 'Gövde', '3 × 13', 'vücut', '+1 tekrar'), ('Band Lat Pulldown', 'Sırt', '4 × 20', '17,5 kg', '+2,5 kg'),
        ('DB Goblet Squat', 'Bacak', '3 × 12', '20,5 kg', '+2,5 kg'), ('Deadbug', 'Gövde', '4 × 45 sn', 'vücut', '+5 sn')]

CSS = FONTS + '''
*{box-sizing:border-box;margin:0;padding:0}
body{background:#05070A;font-family:Archivo,system-ui,sans-serif;color:#EDEFF2;display:flex;gap:28px;padding:44px 28px 28px;align-items:flex-start}
.cap{position:absolute;left:0;right:0;top:-2px;transform:translateY(-100%);font:800 20px Archivo;color:#C3CCD6;padding-bottom:10px}
.ph{position:relative;width:390px;height:844px;border-radius:44px;background:#0B0F14;border:1px solid #1E2731;overflow:hidden;padding:54px 16px 0;margin-top:34px}
.n{font-family:'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums}
.top{display:flex;align-items:center;gap:12px}
.back{width:50px;height:50px;border-radius:16px;background:#141B23;border:1px solid #1E2731;display:grid;place-items:center;font-size:28px;color:#C3CCD6;flex:none}
.top h1{font-size:26px;font-weight:800;line-height:1.1}
.top small{display:block;font-size:14px;font-weight:700;color:#7A8694;margin-top:2px}
.steps{display:flex;gap:6px;margin:14px 0 4px}.steps i{flex:1;height:6px;border-radius:3px;background:#222B36}.steps i.on{background:'''+AMB+'''}
.lb{font-size:13px;font-weight:800;letter-spacing:1.8px;color:#8B97A5;margin:18px 0 9px}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.ch{min-height:46px;padding:10px 16px;border-radius:999px;border:1.5px solid #2A3440;font-size:17px;font-weight:700;color:#C3CCD6;display:inline-flex;align-items:center}
.ch.on{border-color:'''+AMB+''';color:#1A0E04;background:'''+AMB+'''}
.cta{position:absolute;left:16px;right:16px;bottom:30px;height:68px;border-radius:22px;background:'''+AMB+''';color:#1A0E04;display:flex;align-items:center;justify-content:space-between;padding:0 22px;font-size:21px;font-weight:800}
.cta small{font-size:15px;font-weight:800;opacity:.7}
.fade{position:absolute;left:0;right:0;bottom:0;height:130px;background:linear-gradient(transparent,#0B0F14 45%)}
'''

def stk(pay, h=10):
    return f'<div style="display:flex;gap:2px;height:{h}px;border-radius:{h//2}px;overflow:hidden">' + ''.join(f'<i style="flex:{p};background:{G[g]}"></i>' for g, p in pay) + '</div>'

def paylbl(pay):
    return ' · '.join(f'<span style="color:{G[g]}">{g} %{p}</span>' for g, p in pay[:3])

def steps(k):
    return '<div class="steps">' + ''.join(f'<i class="{"on" if i <= k else ""}"></i>' for i in range(3)) + '</div>'

# ---------------------------------------------------------------- A: büyük kartlar
A_CSS = '''
.kg{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.k{border-radius:20px;background:#12181F;border:2px solid #1E2731;padding:12px 14px 12px}
.k.p1{border-color:#F5A52499;background:#1A1710}.k.p2{border-color:#F5A524;background:#221A0C}
.k .h{display:flex;justify-content:space-between;align-items:center;font-size:20px;font-weight:800}
.k .h i{width:12px;height:12px;border-radius:4px;display:inline-block;margin-right:7px}
.k .st{font-size:14px;font-weight:800;color:#F5A524}
.k .v{display:flex;align-items:baseline;gap:6px;margin-top:4px}.k .v b{font-size:44px;font-weight:700;line-height:1}.k .v small{font-size:15px;color:#8B97A5;font-weight:700}
.k .bar{position:relative;height:9px;border-radius:5px;background:#222B36;margin-top:8px}.k .bar i{position:absolute;left:0;top:0;bottom:0;border-radius:5px}.k .bar s{position:absolute;top:-4px;bottom:-4px;width:3px;border-radius:2px;background:#EDEFF2}
.k .t{font-size:14px;color:#8B97A5;font-weight:700;margin-top:6px}
.ex{display:flex;gap:12px;align-items:center;border-radius:22px;background:#12181F;border:2px solid #1E2731;padding:14px;margin-bottom:10px}
.ex.on{border-color:#F5A524}
.sc{flex:none;width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#F5A524 var(--p),#222B36 0)}
.sc b{width:46px;height:46px;border-radius:50%;background:#12181F;display:grid;place-items:center;font-size:24px;font-weight:700}
.m{flex:1;min-width:0}.m .nm{font-size:20px;font-weight:800;line-height:1.15}
.m .tg{display:inline-block;margin-left:6px;padding:3px 7px;border-radius:7px;background:#222B36;font-size:12px;font-weight:800;letter-spacing:.8px;color:#C3CCD6;vertical-align:3px}
.m .pl{font-size:14px;font-weight:700;margin:7px 0 6px}
.m .ls{font-size:16px;color:#C3CCD6;font-weight:600;margin-top:7px}.m .ls em{font-style:normal;color:#3DDC84;font-weight:800}.m .ls em.w{color:#FFB020}
.add{flex:none;width:50px;height:50px;border-radius:16px;border:2px solid #2A3440;display:grid;place-items:center;font-size:28px;font-weight:700;color:#C3CCD6}
.ex.on .add{background:#F5A524;border-color:#F5A524;color:#1A0E04}
'''
def a1():
    kh = ''.join(f'''<div class="k p{o}"><div class="h"><span><i style="background:{G[n]}"></i>{n}</span><span class="st">{"★★" if o == 2 else "★" if o else ""}</span></div>
      <div class="v"><b class="n">%{g}</b><small>son 4 hf</small></div>
      <div class="bar"><i style="width:{g*2.2}%;background:{G[n]}"></i><s style="left:{t*2.2}%"></s></div>
      <div class="t">tüm zaman %{t}{f' · <span style=color:#F87171>{g-t:+d}</span>' if abs(g-t) >= 5 else ''}</div></div>''' for n, g, t, o in KAS)
    return f'''<div class="ph"><div class="top"><span class="back">‹</span><div><h1>Salon idmanı planla</h1><small>Cuma 3 Ekim · Faz-0</small></div></div>{steps(0)}
      <p class="lb">KAS GRUBU · dokun: ★ öncelik, ★★ çift</p><div class="kg">{kh}</div>
      <p class="lb">AMAÇ</p><div class="chips"><span class="ch on">Kuvvet</span><span class="ch on">Rehab</span><span class="ch">Hipertrofi</span><span class="ch">Mobilite</span></div>
      <div class="fade"></div><div class="cta"><span>Hareketleri getir</span><small>24 uygun ›</small></div></div>'''
def a2():
    eh = ''.join(f'''<div class="ex {"on" if on else ""}"><span class="sc" style="--p:{s}%"><b class="n">{s}</b></span><div class="m">
      <div class="nm">{n}{" ⚠" if w else ""}<span class="tg">{am.upper()}</span></div><div class="pl">{paylbl(p)}</div>{stk(p)}
      <div class="ls">Son: {l} · öneri <em class="{"w" if w else ""}">{o}</em>{" · ▶" if v else ""}</div></div><span class="add">{"✓" if on else "+"}</span></div>''' for n, am, s, p, l, o, w, on, v in EX)
    return f'''<div class="ph"><div class="top"><span class="back">‹</span><div><h1>Hareket seç</h1><small>★ Sırt · ★★ Gövde · ★ Bacak</small></div></div>{steps(1)}
      <div style="height:10px"></div>{eh}<div class="fade"></div><div class="cta"><span>Plana geç</span><small>3 hareket · ~42 dk ›</small></div></div>'''

# ---------------------------------------------------------------- B: gövde haritası
B_CSS = '''
.body{position:relative;height:330px;margin-top:6px;border-radius:24px;background:radial-gradient(260px 200px at 50% 45%,#141B23,#0B0F14)}
.leg{display:flex;justify-content:space-between;font-size:14px;font-weight:700;color:#8B97A5;margin-top:8px}
.row{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:18px;background:#12181F;border:2px solid #1E2731;margin-bottom:8px}
.row.on{border-color:#F5A524}
.row .nm{font-size:20px;font-weight:800;width:86px}
.row .bb{flex:1;position:relative;height:12px;border-radius:6px;background:#222B36}.row .bb i{position:absolute;left:0;top:0;bottom:0;border-radius:6px}.row .bb s{position:absolute;top:-5px;bottom:-5px;width:3px;background:#EDEFF2;border-radius:2px}
.row .v{width:56px;text-align:right;font-size:26px;font-weight:700}
.row .st{width:30px;font-size:16px;color:#F5A524;font-weight:800}
.ex2{border-radius:22px;background:#12181F;border:2px solid #1E2731;padding:14px 16px;margin-bottom:10px}
.ex2.on{border-color:#F5A524;background:#17150F}
.ex2 .h{display:flex;justify-content:space-between;align-items:center}
.ex2 .nm{font-size:21px;font-weight:800}.ex2 .s{font-size:30px;font-weight:700;color:#F5A524;line-height:1}
.ex2 .s small{font-size:13px;color:#8B97A5;font-family:Archivo;font-weight:800;margin-left:3px}
.ex2 .pl{font-size:15px;font-weight:700;margin:8px 0 7px}
.ex2 .f{display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:17px;font-weight:700;color:#C3CCD6}
.ex2 .f em{font-style:normal;color:#3DDC84}.ex2 .f em.w{color:#FFB020}
.pill{padding:8px 14px;border-radius:12px;border:1.5px solid #2A3440;font-size:16px;font-weight:800}
.ex2.on .pill{background:#F5A524;border-color:#F5A524;color:#1A0E04}
'''
def figure():
    # sade gövde silüeti: bölgeler son 4 haftanın yüküne göre renk yoğunluğu, öncelikliler çerçeveli
    def a(g):  # opaklık
        d = {n: v for n, v, t, o in KAS}[g]; return 0.25 + d / 40 * 0.75
    def st(g):
        o = {n: o for n, v, t, o in KAS}[g]; return f'stroke="#F5A524" stroke-width="{3 if o == 1 else 5}"' if o else 'stroke="#0B0F14" stroke-width="2"'
    def fig(x, back):
        parts = []
        parts.append(f'<circle cx="{x}" cy="40" r="20" fill="#2A3440"/>')
        parts.append(f'<rect x="{x-46}" y="66" width="92" height="22" rx="11" fill="{G["Omuz"]}" fill-opacity="{a("Omuz")}" {st("Omuz")}/>')
        if back:
            parts.append(f'<path d="M{x-40} 92 h80 l-8 80 h-64 z" fill="{G["Sırt"]}" fill-opacity="{a("Sırt")}" {st("Sırt")}/>')
            parts.append(f'<rect x="{x-34}" y="176" width="68" height="40" rx="14" fill="{G["Kalça"]}" fill-opacity="{a("Kalça")}" {st("Kalça")}/>')
        else:
            parts.append(f'<rect x="{x-38}" y="92" width="76" height="40" rx="10" fill="{G["Göğüs"]}" fill-opacity="{a("Göğüs")}" {st("Göğüs")}/>')
            parts.append(f'<rect x="{x-30}" y="136" width="60" height="76" rx="12" fill="{G["Gövde"]}" fill-opacity="{a("Gövde")}" {st("Gövde")}/>')
        for s in (-1, 1):
            parts.append(f'<rect x="{x+s*58-11}" y="92" width="22" height="104" rx="11" fill="{G["Kol"]}" fill-opacity="{a("Kol")}" {st("Kol")}/>')
            parts.append(f'<rect x="{x+s*18-15}" y="220" width="30" height="96" rx="14" fill="{G["Bacak"]}" fill-opacity="{a("Bacak")}" {st("Bacak")}/>')
        parts.append(f'<text x="{x}" y="326" text-anchor="middle" font-size="13" font-weight="800" fill="#8B97A5" font-family="Archivo" letter-spacing="1.5">{"ARKA" if back else "ÖN"}</text>')
        return ''.join(parts)
    return f'<svg width="358" height="330" viewBox="0 0 358 330">{fig(95, False)}{fig(263, True)}</svg>'
def b1():
    rows = ''.join(f'''<div class="row {"on" if o else ""}"><span class="nm">{n}</span><span class="bb"><i style="width:{g*2.3}%;background:{G[n]}"></i><s style="left:{t*2.3}%"></s></span><span class="v n">%{g}</span><span class="st">{"★★" if o == 2 else "★" if o else ""}</span></div>''' for n, g, t, o in KAS[:4])
    return f'''<div class="ph"><div class="top"><span class="back">‹</span><div><h1>Neyi çalışalım?</h1><small>Son 4 haftanın yükü · dokun: öncelik</small></div></div>{steps(0)}
      <div class="body">{figure()}</div>
      <div class="leg"><span>soluk: az çalışıldı</span><span>dolu: çok · <span style="color:#F5A524">çerçeve: öncelik</span></span></div>
      <div style="height:10px"></div>{rows}<div class="fade"></div><div class="cta"><span>Hareketleri getir</span><small>24 uygun ›</small></div></div>'''
def b2():
    eh = ''.join(f'''<div class="ex2 {"on" if on else ""}"><div class="h"><span class="nm">{n}{" ⚠" if w else ""}</span><span class="s n">{s}<small>PUAN</small></span></div>
      <div class="pl">{paylbl(p)}</div>{stk(p, 9)}
      <div class="f"><span>{l} → <em class="{"w" if w else ""}">{o}</em></span><span class="pill">{"✓ Planda" if on else "+ Ekle"}</span></div></div>''' for n, am, s, p, l, o, w, on, v in EX[:4])
    return f'''<div class="ph"><div class="top"><span class="back">‹</span><div><h1>Hareket seç</h1><small>Sırala: puan · Süz: Kuvvet, Rehab</small></div></div>{steps(1)}
      <div style="height:10px"></div>{eh}<div class="fade"></div><div class="cta"><span>Plana geç</span><small>3 hareket · ~42 dk ›</small></div></div>'''

# ---------------------------------------------------------------- C: tek ekran (denge + plan tepsisi)
C_CSS = '''
.radar{display:flex;gap:12px;align-items:center;border-radius:24px;background:#12181F;border:1px solid #1E2731;padding:12px}
.rl{flex:1;font-size:15px;font-weight:700;color:#C3CCD6;line-height:1.5}.rl b{color:#EDEFF2}
.tabs{display:flex;gap:8px;overflow:hidden;margin-top:12px}
.tab{flex:none;padding:10px 14px;border-radius:16px;border:2px solid #2A3440;font-size:17px;font-weight:800;color:#C3CCD6;display:flex;align-items:center;gap:7px}
.tab i{width:11px;height:11px;border-radius:4px}.tab.on{border-color:#F5A524;color:#F5A524}
.it{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #1E2731}
.it .s{flex:none;width:52px;font-size:30px;font-weight:700;color:#F5A524;text-align:center;line-height:1}.it .s small{display:block;font-family:Archivo;font-size:11px;font-weight:800;color:#8B97A5;letter-spacing:1px}
.it .m{flex:1;min-width:0}.it .nm{font-size:19px;font-weight:800}.it .ls{font-size:15px;color:#9AA5B1;font-weight:600;margin-top:5px}.it .ls em{font-style:normal;color:#3DDC84;font-weight:800}.it .ls em.w{color:#FFB020}
.it .add{flex:none;width:48px;height:48px;border-radius:15px;border:2px solid #2A3440;display:grid;place-items:center;font-size:26px;font-weight:700;color:#C3CCD6}
.it.on .add{background:#F5A524;border-color:#F5A524;color:#1A0E04}
.tray{position:absolute;left:0;right:0;bottom:0;background:#141B23;border-top:1px solid #2A3440;border-radius:28px 28px 0 0;padding:12px 16px 28px;box-shadow:0 -20px 40px rgba(0,0,0,.5)}
.tray .gr{width:44px;height:5px;border-radius:3px;background:#2A3440;margin:0 auto 10px}
.tray .h{display:flex;justify-content:space-between;align-items:baseline;font-size:18px;font-weight:800}.tray .h b{font-size:30px;color:#F5A524}
.tray .chs{display:flex;gap:6px;margin:10px 0 12px}.tray .chs span{flex:1;height:10px;border-radius:5px}
.go{height:64px;border-radius:20px;background:#F5A524;color:#1A0E04;display:flex;align-items:center;justify-content:center;font-size:21px;font-weight:800}
.pl{display:flex;align-items:center;gap:12px;padding:14px;border-radius:20px;background:#12181F;border:1px solid #1E2731;margin-bottom:9px}
.pl .g{color:#3A4450;font-size:22px;letter-spacing:-3px}.pl .nm{font-size:19px;font-weight:800}.pl .sub{font-size:14px;font-weight:700;margin-top:3px}
.pl .v{text-align:right;margin-left:auto}.pl .v b{display:block;font-size:30px;font-weight:700;line-height:1}.pl .v small{font-size:15px;color:#9AA5B1;font-weight:700}
.pl .v em{display:block;font-style:normal;font-size:13px;font-weight:800;color:#3DDC84;margin-top:3px}
'''
def radar():
    import math
    cx, cy, R = 80, 80, 66
    n = len(KAS)
    pt = lambda i, v: (cx + R * v * math.sin(2 * math.pi * i / n), cy - R * v * math.cos(2 * math.pi * i / n))
    grid = ''.join(f'<polygon points="{" ".join(f"{pt(i, f)[0]:.1f},{pt(i, f)[1]:.1f}" for i in range(n))}" fill="none" stroke="#222B36"/>' for f in (0.33, 0.66, 1))
    tum = ' '.join(f'{pt(i, t / 40)[0]:.1f},{pt(i, t / 40)[1]:.1f}' for i, (nm, g, t, o) in enumerate(KAS))
    son = ' '.join(f'{pt(i, g / 40)[0]:.1f},{pt(i, g / 40)[1]:.1f}' for i, (nm, g, t, o) in enumerate(KAS))
    dots = ''.join(f'<circle cx="{pt(i, 1.12)[0]:.1f}" cy="{pt(i, 1.12)[1]:.1f}" r="{7 if o else 5}" fill="{G[nm]}" stroke="{"#F5A524" if o else "none"}" stroke-width="3"/>' for i, (nm, g, t, o) in enumerate(KAS))
    return f'<svg width="164" height="164" viewBox="-4 -4 168 168">{grid}<polygon points="{tum}" fill="none" stroke="#EDEFF2" stroke-dasharray="4 4" stroke-width="2"/><polygon points="{son}" fill="#F5A52433" stroke="#F5A524" stroke-width="2.5"/>{dots}</svg>'
def c1():
    tabs = ''.join(f'<span class="tab {"on" if o else ""}"><i style="background:{G[n]}"></i>{n}{" ★★" if o == 2 else " ★" if o else ""}</span>' for n, g, t, o in KAS[:4])
    items = ''.join(f'''<div class="it {"on" if on else ""}"><span class="s n">{s}<small>PUAN</small></span><div class="m"><div class="nm">{n}{" ⚠" if w else ""}</div>
      <div style="margin:6px 0 0">{stk(p, 7)}</div><div class="ls">{l} · <em class="{"w" if w else ""}">{o}</em></div></div><span class="add">{"✓" if on else "+"}</span></div>''' for n, am, s, p, l, o, w, on, v in EX[:4])
    return f'''<div class="ph"><div class="top"><span class="back">‹</span><div><h1>Salon idmanı</h1><small>Cuma 3 Ekim · tek ekranda planla</small></div></div>
      <div style="height:12px"></div><div class="radar">{radar()}<div class="rl"><b style="color:#F5A524">━</b> son 4 hafta<br><b>┅</b> tüm zaman<br><br><b>Az:</b> Gövde −10<br><b>Çok:</b> Sırt +11</div></div>
      <div class="tabs">{tabs}</div>{items}
      <div class="tray"><div class="gr"></div><div class="h"><span>Plan · 3 hareket</span><b class="n">~42 dk</b></div>
      <div class="chs"><span style="background:{G["Gövde"]}"></span><span style="background:{G["Sırt"]}"></span><span style="background:{G["Bacak"]}"></span></div><div class="go">İdmana başla ›</div></div></div>'''
def c2():
    pl = ''.join(f'''<div class="pl"><span class="g">⋮⋮</span><div><div class="nm">{n}</div><div class="sub" style="color:{G[g]}">{g}</div></div>
      <div class="v"><b class="n">{v}</b><small>{w}</small><em>{o}</em></div></div>''' for n, g, v, w, o in PLAN)
    return f'''<div class="ph"><div class="top"><span class="back">‹</span><div><h1>Plan</h1><small>Tepsiyi yukarı çek · sürükle: sıra</small></div></div>
      <div style="height:14px"></div>{pl}
      <p class="lb">TOPLAM</p><div style="display:flex;gap:8px">{"".join(f'<div style="flex:1;border-radius:16px;background:#12181F;border:1px solid #1E2731;padding:10px 12px"><small style="font-size:12px;font-weight:800;letter-spacing:1.4px;color:#8B97A5">{k}</small><b class="n" style="display:block;font-size:32px">{v}</b></div>' for k, v in (("HAREKET", "4"), ("SET", "14"), ("SÜRE", "~48")))}</div>
      <div class="cta"><span>İdmana başla</span><small>kaydet, sonra ›</small></div></div>'''

for key, extra, ph, cap in (('a', A_CSS, (a1, a2), 'A · Büyük kartlar (3 adım)'), ('b', B_CSS, (b1, b2), 'B · Gövde haritası (3 adım)'), ('c', C_CSS, (c1, c2), 'C · Tek ekran: denge + plan tepsisi')):
    phones = ''.join(f'<div style="position:relative">{"<div class=cap>" + cap + "</div>" if i == 0 else ""}{f()}</div>' for i, f in enumerate(ph))
    open(f'/home/user/Claude/tasarim/v19/kaynak/{key}.html', 'w').write(f'<!doctype html><meta charset="utf-8"><style>{CSS}{extra}</style><body>{phones}</body>')
print('ok')
