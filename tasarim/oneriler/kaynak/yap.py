# Kapsamlı öneriler (IS_LISTESI A1–F5) örnek ekranlarla → ../oneriler.html
# Telefon taslakları senaryo panosunun görsel diliyle (CSS oradan alınır); mini vücutlar v27 varlıklarıyla.
import base64, json, os, re

K = os.path.dirname(os.path.abspath(__file__))
V27 = os.path.join(K, '../../v27/kaynak')
SEN = os.path.join(K, '../../senaryo/kaynak/sablon.html')
B = json.load(open(os.path.join(V27, 'bolgeler.json')))
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
SLUG = {'Omuz': 'omuz', 'Göğüs': 'gogus', 'Biseps': 'biseps', 'Triseps': 'triseps', 'Ön kol': 'onkol', 'Sırt': 'sirt',
        'Karın': 'karin', 'Kalça': 'kalca', 'Kalça yanı': 'kalcayani', 'Bacak': 'bacak'}
RENK = B['renk']
ZC = ['#94A3B8', '#60A5FA', '#34D399', '#FACC15', '#FB923C', '#F87171', '#E879F9']  # uygulamanın bölge renkleri z1…z7
ZN = ['REC', 'EN1', 'EN2', 'EN3', 'SP1', 'SP2', 'SP3']

css = []
for v in ('front', 'back'):
    css.append(f".mb.{v}{{aspect-ratio:{B[v]['w']}/{B[v]['h']};background-image:url(data:image/webp;base64,{b64(os.path.join(V27, f'r/{v}_gri.webp'))})}}")
    css.append(f".mb.{v} i{{background-image:url(data:image/webp;base64,{b64(os.path.join(V27, f'r/{v}.webp'))})}}")
    for g in B[v]['merkez']:
        u = 'data:image/png;base64,' + b64(os.path.join(V27, f'r/{v}_{g}.png'))
        css.append(f".mb.{v} i.{SLUG[g]}{{-webkit-mask-image:url({u});mask-image:url({u})}}")
MBCSS = '\n'.join(css)

def mini(v, gs, cls='', clip=''):
    lay = ''.join(f'<i class="{SLUG[g]}" style="opacity:{a:.2f}{";clip-path:" + clip if clip else ""}"></i>' for g, a in gs.items() if g in B[v]['merkez'])
    return f'<div class="mb {v} {cls}">{lay}</div>'
body2 = lambda gs, cls='': f'<div class="b2 {cls}">{mini("front", gs)}{mini("back", gs)}</div>'
dot = lambda c: f'<span class="gd" style="background:{c}"></span>'
G = lambda g: dot(RENK[g])
phone = lambda inner: f'<div class="ph">{inner}</div>'
hd = lambda t, right='': f'<div class="hd"><span class="bk">‹</span><b>{t}</b>{f"<span class=vid>{right}</span>" if right else ""}</div>'

def ring(val, tot, label, color='#F5A524'):
    import math
    r, c = 22, 2 * math.pi * 22
    return (f'<div class="ring"><svg viewBox="0 0 56 56" width="56" height="56"><circle cx="28" cy="28" r="{r}" stroke="#232C37" stroke-width="6" fill="none"/>'
            f'<circle cx="28" cy="28" r="{r}" stroke="{color}" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="{c * val / tot:.1f} {c:.1f}" transform="rotate(-90 28 28)"/>'
            f'<text x="28" y="33" text-anchor="middle" class="n" fill="#EDEFF2" font-size="16">{val}/{tot}</text></svg><small>{label}</small></div>')

def meter(label, v, mx, warn, unit='%', note=''):
    pct = min(100, v / mx * 100)
    col = '#ffb020' if v >= warn else '#3DDC84'
    return (f'<div class="mtr"><div class="mtr-h"><span>{label}</span><b class="n">{v}{unit}<small> / {mx}{unit}</small></b></div>'
            f'<div class="mtr-t"><i style="width:{pct:.0f}%;background:{col}"></i><s style="left:{warn / mx * 100:.0f}%"></s></div>{f"<small>{note}</small>" if note else ""}</div>')

# --- grafikler (tek eksen, 2 px çizgi, doğrudan etiket, <title> ile üzerine gelince değer) -------------
def line_chart(series, w=340, h=150, ymin=0, ymax=1, xlabels=(), yfmt=str, band=None, ref=None, inv=False):
    """series: [(ad, renk, [değer…])]; inv: küçük değer yukarıda (tempo)."""
    pl, pr, pt, pb = 34, 74, 10, 20
    n = len(series[0][2])
    X = lambda i: pl + (w - pl - pr) * i / (n - 1)
    Y = lambda v: pt + (h - pt - pb) * ((v - ymin) / (ymax - ymin) if inv else (1 - (v - ymin) / (ymax - ymin)))
    o = [f'<svg viewBox="0 0 {w} {h}" class="ch" role="img">']
    for t in [ymin + (ymax - ymin) * k / 3 for k in range(4)]:
        o.append(f'<line x1="{pl}" x2="{w - pr}" y1="{Y(t):.1f}" y2="{Y(t):.1f}" stroke="#1E2731"/><text x="{pl - 6}" y="{Y(t) + 4:.1f}" text-anchor="end" class="ax">{yfmt(t)}</text>')
    if band:
        a, b_, lab = band
        o.append(f'<rect x="{pl}" width="{w - pl - pr}" y="{min(Y(a), Y(b_)):.1f}" height="{abs(Y(a) - Y(b_)):.1f}" fill="#FACC15" opacity=".08"/><text x="{w - pr + 4}" y="{(Y(a) + Y(b_)) / 2 + 4:.1f}" class="ax">{lab}</text>')
    if ref:
        v, lab = ref
        o.append(f'<line x1="{pl}" x2="{w - pr}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" stroke="#7A8694" stroke-dasharray="3 3"/><text x="{w - pr + 4}" y="{Y(v) + 4:.1f}" class="ax">{lab}</text>')
    for i, l in enumerate(xlabels):
        if l: o.append(f'<text x="{X(i):.1f}" y="{h - 4}" text-anchor="middle" class="ax">{l}</text>')
    for ad, col, vals in series:
        pts = ' '.join(f'{X(i):.1f},{Y(v):.1f}' for i, v in enumerate(vals))
        o.append(f'<polyline points="{pts}" fill="none" stroke="{col}" stroke-width="2" stroke-linejoin="round"/>')
        o.append(''.join(f'<circle cx="{X(i):.1f}" cy="{Y(v):.1f}" r="7" fill="transparent"><title>{ad}: {yfmt(v)}</title></circle>' for i, v in enumerate(vals)))
        o.append(f'<circle cx="{X(n - 1):.1f}" cy="{Y(vals[-1]):.1f}" r="4" fill="{col}" stroke="#12181F" stroke-width="2"/>')
        o.append(f'<text x="{X(n - 1) + 7:.1f}" y="{Y(vals[-1]) + 4:.1f}" class="dl">{ad}</text>')
    o.append('</svg>')
    return ''.join(o)

def bars(vals, w=340, h=70, xlabels=(), col='#9085e9', title='Form'):
    pl, pr, pt, pb = 34, 74, 6, 18
    m = max(abs(v) for v in vals)
    n = len(vals); bw = (w - pl - pr) / n
    Y0 = pt + (h - pt - pb) / 2
    sc = (h - pt - pb) / 2 / m
    o = [f'<svg viewBox="0 0 {w} {h}" class="ch"><line x1="{pl}" x2="{w - pr}" y1="{Y0}" y2="{Y0}" stroke="#2A3440"/><text x="{pl - 6}" y="{Y0 + 4}" text-anchor="end" class="ax">0</text>']
    for i, v in enumerate(vals):
        x = pl + i * bw + 2; hh = abs(v) * sc
        y = Y0 - hh if v >= 0 else Y0
        o.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{bw - 4:.1f}" height="{max(hh, 1):.1f}" rx="2" fill="{col}"><title>{title} {v:+d}</title></rect>')
        if xlabels and xlabels[i]: o.append(f'<text x="{x + (bw - 4) / 2:.1f}" y="{h - 3}" text-anchor="middle" class="ax">{xlabels[i]}</text>')
    o.append(f'<text x="{w - pr + 4}" y="{Y0 - vals[-1] * sc + 4:.1f}" class="dl">{title} {vals[-1]:+d}</text></svg>')
    return ''.join(o)

def stack(parts, h=14):
    return '<div class="stk2">' + ''.join(f'<i style="flex:{p};background:{c}" title="{n} %{p}"></i>' for n, p, c in parts if p) + '</div>'

# --- ekranlar -------------------------------------------------------------------------------------
E = {}
E['ana'] = phone(f'''
<div class="top"><b class="logo">YüzmeSK</b><span class="gear">⚙</span></div>
<p class="date">Perşembe, 8 Ekim</p>
<div class="week">{ring(2, 3, 'bu hafta gün')}{ring(4, 6, 'omuz rahatlatma', '#2DD4BF')}
  <div class="form"><small>FORM</small><b class="n">+4</b><span class="ok">taze</span><small>kondisyon 46 · yorgunluk 42</small></div></div>
<div class="today"><small>BUGÜN ÖNERİ · ÖĞLE 65 DK BÜTÇE</small><b>Salon: omuz önleyici + core + kalça stabilite</b>
  <span class="mu sm">Omuz dinleniyor (Salı 3,1 km FR) → ağır itiş yok · ~58 dk ✓</span></div>
<div class="hc gym"><div class="hc-hd"><span class="ic a">⊢⊣</span><b>Salon</b><span class="badge">HAZIR PLAN · ~58 DK</span></div>
  <div class="hc-btns"><button class="go">▶ İdmana başla</button><button class="ghost">Planla</button></div></div>
<div class="hc swim"><div class="hc-hd"><span class="ic t">≈</span><b>Yüzme</b><span class="meta">Cuma akşam · 3.200 m · ~95 dk</span></div></div>
<div class="gauges">{meter('Kurbağalama bu ay', 6, 10, 8, note='sağ diz + kalça: sınır %10')}{meter('Omuz önleyici', 1, 2, 2, ' kez', 'haftalık en az 2')}{meter('Kalça stabilite', 0, 1, 1, ' kez')}</div>''')

slot = lambda gun, saat, butce, tur, odak, renk, alt='': f'''<div class="slot" style="border-left-color:{renk}"><div class="sl-h"><b>{gun}</b><span>{saat}</span><span class="bud n">{butce}</span></div>
  <p class="sl-t">{tur}</p><p class="mu sm">{odak}</p>{alt}</div>'''
E['iskelet'] = phone(f'''{hd('Haftanın iskeleti', '6–11 Ekim')}
<p class="note">Öneri: kısıtlar + form + denge. Program sayfasına yazmaz; yalnızca öneri.</p>
{slot('Salı', 'sabah', '75–80 dk', 'Yüzme · aerobik + teknik', 'EN2 ana set 2.000 m, drill 400 m (catch-up), FR → BK', '#2DD4BF', stack([('EN1', 25, ZC[1]), ('EN2', 55, ZC[2]), ('EN3', 10, ZC[3]), ('REC', 10, ZC[0])]))}
{slot('Perşembe', 'öğle', '65 dk', 'Salon · önleyici + core', 'Omuz prehab (rotator manşet), core, kalça stabilite · ağır itiş yok', '#F5A524', '<p class="warn sm">⚠ Cuma eşik seti var: Perşembe omuzu hafif tut (B5)</p>')}
{slot('Cuma', 'akşam', 'sınırsız', 'Yüzme · eşik + hız', 'EN3 4×200 + SP1 8×50, BR ≤ 200 m (bu ay %6)', '#2DD4BF', stack([('EN2', 35, ZC[2]), ('EN3', 40, ZC[3]), ('SP1', 15, ZC[4]), ('REC', 10, ZC[0])]))}
<div class="sumrow"><span>3/3 gün</span><span>~4 sa 20 dk</span><span>yük 1.380 (geçen 1.290 · <b class="ok">+7%</b>)</span></div>''')

def cal_day(d, items, load, cls=''):
    ic = ''.join(f'<i class="ci {k}">{"≈" if k == "y" else "⊢⊣" if k == "s" else "⚠"}</i>' for k in items)
    return f'<div class="cd {cls}"><small>{d}</small><div class="cic">{ic}</div><div class="ld"><i style="height:{load}%"></i></div></div>'
E['takvim'] = phone(f'''{hd('Takvim', 'Ekim')}
<div class="cal-h"><span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span></div>
<div class="cal">{cal_day(28, [], 0)}{cal_day(29, ['y'], 55)}{cal_day(30, [], 0)}{cal_day(1, ['s'], 40)}{cal_day(2, ['y', 'w'], 90)}{cal_day(3, [], 0)}{cal_day(4, [], 0)}
{cal_day(5, [], 0)}{cal_day(6, ['y'], 60)}{cal_day(7, [], 0)}{cal_day(8, ['s'], 0, 'today')}{cal_day(9, ['y'], 0, 'plan')}{cal_day(10, [], 0)}{cal_day(11, [], 0)}</div>
<div class="legend"><span><i class="ci y">≈</i> yüzme</span><span><i class="ci s">⊢⊣</i> salon</span><span><i class="ci w">⚠</i> ağrı (MSI ≥ 1)</span><span><i class="lg"></i> günlük yük</span></div>
<div class="dayd"><b>Cuma 2 Ekim · yüzme</b><p class="mu sm">3.400 m · 102 dk · RPE 8 → yük 816 · sağ omuz MSI 1 ⚠</p>
<p class="sm">Ertesi seans önerisi uygulandı: Salı EN2'de kürek yerine kick ağırlıklı.</p></div>''')

wk = ['', '', 'Eyl', '', '', '', 'Eki', '']
E['form'] = phone(f'''{hd('Form', 'son 8 hafta')}
<p class="lb">KONDİSYON (42 GÜN) VE YORGUNLUK (7 GÜN) · GÜNLÜK YÜK = RPE × DAKİKA</p>
{line_chart([('Kondisyon', '#3987e5', [31, 33, 36, 38, 40, 41, 44, 46]), ('Yorgunluk', '#d95926', [35, 40, 33, 45, 48, 38, 47, 42])], ymin=20, ymax=56, xlabels=wk, yfmt=lambda v: f'{v:.0f}')}
<p class="lb">FORM = KONDİSYON − YORGUNLUK</p>
{bars([-4, -7, 3, -7, -8, 3, -3, 4], xlabels=wk)}
<div class="kv"><div><small>YÜK ARTIŞ ORANI</small><b class="n">1,32</b><span class="warn sm">sınırda (güvenli 0,8–1,3)</span></div>
<div><small>BU HAFTA</small><b class="n">1.380</b><span class="mu sm">2 seans</span></div></div>
<div class="tip">💡 <b>4. hafta dinlenme önerisi:</b> hacim %40 az, yoğunluk aynı. Omuz geçmişin için oran 1,5'i geçmeden uyarır.</div>''')

E['kasyuk'] = phone(f'''{hd('Kas yükü', 'son 72 saat')}
<div class="heat">{body2({'Omuz': 1, 'Sırt': .8, 'Triseps': .55, 'Karın': .45, 'Bacak': .3, 'Göğüs': .25})}
<div class="cv-tx"><p class="lb">TOPARLANMA</p><p>{G('Omuz')}Omuz <b class="warn">%55</b></p><p>{G('Sırt')}Sırt <b class="warn">%62</b></p><p>{G('Triseps')}Triseps <b>%78</b></p><p>{G('Karın')}Karın <b class="ok">%88</b></p><p>{G('Bacak')}Bacak <b class="ok">%95</b></p></div></div>
<div class="src2"><p class="lb">OMUZ YÜKÜ NEREDEN?</p>{stack([('Yüzme FR', 72, '#2DD4BF'), ('Salon', 28, '#F5A524')])}
<p class="sm"><span class="t">■</span> Yüzme %72 · Salı 3,1 km FR, RPE 6 · <span class="a">■</span> Salon %28 · Pazartesi shoulder press</p></div>
<p class="note">Yüzme katsayıları (stil → kas) sporRef'te düzenlenebilir: FR omuz 0,30 · sırt 0,25 · triseps 0,10 · karın 0,15 · bacak 0,10 …</p>
<div class="tip">Salon önerisi: <b>bugün ağır itiş ve kürek yok</b>; core, kalça, omuz önleyici (hafif bant) uygun.</div>''')

kural = lambda t, r, c='': f'<div class="kr {c}"><b>{t}</b><span>{r}</span></div>'
E['kisit'] = phone(f'''{hd('Kısıt profili', 'sporRef · kisit')}
<p class="note">Uygulama bu kurallara göre önerir, uyarır ve durdurur. Kaynak: sporRef "kisit" sayfası (sen düzenlersin).</p>
{kural('Sağ kalça · Perthes', 'Koşu, zıplama yok · ağırlıklı squat > 90° yok · kurbağalama ayda ≤ %10', 'r')}
{kural('Sağ omuz · rotator manşet + impingement', 'Her aerobik blok sonunda omuz rahatlatma · ağrıda itiş hareketi geri planda', 'r')}
{kural('Sağ diz · kondromalazi', 'Kurbağalamada ek kısıt · derin diz bükümü yok', 'r')}
{kural('MSI', '0 devam · 0,5 gözlem · 1–1,5 hafiflet · 2 durdur · 3+ tıbbi')}
{kural('Seans süreleri', 'Sal/Çar/Per: sabah 75–80, öğle 65 dk · Cuma akşam sınırsız · haftada 3 gün')}
{kural('Kulaç /25 m', 'drill 10–11 · yüzüş 13–15 · race 14–15 · pull 11–12')}
{kural('Stil sırası', 'FR → BK → BF → BR')}
{kural('İzlem', 'HbA1c 5,68 · ürik asit 7,0 (uygulama yalnızca not olarak gösterir)', 'm')}''')

def sx(ad, gs, puan, tag, note, cls='', alt='', view='front'):
    return f'''<div class="ex {cls}">{mini(view, gs, 'xs')}<div class="ex-m"><b>{ad}</b><span class="tag">{tag}</span><small class="{'warn' if 'yasak' in cls else 'ok'}">{note}</small>{alt}</div>
  <div class="ex-r"><b class="n sc">{puan}</b><small>PUAN</small><span class="add">{'⊘' if 'yasak' in cls else '+'}</span></div></div>'''
E['salonkisit'] = phone(f'''{hd('Hareket seç', '▶ video')}
<div class="steps"><i class="on"></i><i class="on"></i><i></i></div>
<div class="debt"><b>Önleyici borç</b><span>{G('Omuz')}omuz 1/2</span><span>{G('Kalça yanı')}kalça stabilite 0/1</span><span>{G('Karın')}core 1/1 ✓</span></div>
{sx('Band External Rotation', {'Omuz': 1}, 100, 'ÖNLEYİCİ · OMUZ', 'Rotator manşet · haftalık borç 1/2', 'on', view='back')}
{sx('Side Plank Abduction', {'Kalça yanı': .6, 'Karın': .4}, 84, 'ÖNLEYİCİ · KALÇA', 'Kalça stabilite · borç 0/1', 'on')}
{sx('Goblet Squat', {'Bacak': .7, 'Kalça': .3}, '—', 'YASAK', 'Perthes: ağırlıklı squat > 90°', 'yasak', '<p class="alt2">Yerine → <b>Box Squat ≤ 90° (bant)</b> · Glute Bridge</p>')}
{sx('Box Squat ≤ 90°', {'Bacak': .6, 'Kalça': .4}, 52, 'GÜVENLİ ALTERNATİF', 'Kutu yüksekliği diz 90°’de durdurur', '')}
{sx('Box Jump', {'Bacak': 1}, '—', 'YASAK', 'Perthes: zıplama yok · listede gizli', 'yasak gizli')}
<p class="note">Kısıtlı hareketler ⊘ ile en altta; "kısıtlıları gizle" açıkken hiç görünmez.</p>''')

E['isinma'] = phone(f'''<div class="slh"><div><small>SÜRE</small><b class="n">0:00</b></div><div><small>HAREKET</small><b class="n">0<small>/5</small></b></div></div>
<div class="warm"><div class="wm-h"><b>Isınma</b><span>kayda sayılmaz · 6 dk</span></div>
<p class="wi on">✓ Bant pull-apart · 15</p><p class="wi on">✓ Bant dış rotasyon · 12 + 12</p><p class="wi">○ Kol çevirme · 30 sn</p>
<button class="ghost w">Isınmayı atla</button></div>
<div class="card2"><small class="ctag">BACAK · 3/5</small><b class="ctit">Box Squat</b>
<div class="chips2"><span class="kc">⚠ derinlik ≤ 90°</span><span class="kc">sağ kalça ağrısızsa</span><span class="kc">yavaş iniş 3 sn</span></div>
<p class="mu sm">Hedef 3 × 10 · bant · Dinlen 1:30</p></div>
<div class="bigbtn">BAŞLA<small>önce ısınma</small></div>''')

E['msi'] = phone(f'''<div class="slh dim"><div><small>SÜRE</small><b class="n">24:10</b></div><div><small>HAREKET</small><b class="n">2<small>/5</small></b></div></div>
<div class="sheet2"><div class="grab"></div><p class="lb">AĞRI · SET SIRASINDA</p><h3>Sağ omuz</h3>
<div class="msi-s">{''.join(f'<span class="{c}">{v}</span>' for v, c in [('0', ''), ('0,5', ''), ('1', ''), ('1,5', 'on'), ('2', 'r'), ('3', 'r')])}</div>
<div class="rule"><b>1,5 → hafiflet</b><p>Kalan 2 set: <b>12,5 kg</b> (−2,5) · tekrar <b>8</b> · ağrısız aralıkta</p></div>
<div class="ladder"><span class="g">0 devam</span><span class="g">0,5 gözlem</span><span class="y on">1–1,5 hafiflet</span><span class="r">2 durdur</span><span class="r">3+ tıbbi</span></div>
<div class="foot2 st2"><button class="ghost">Aynen devam</button><button class="go">Hafifleterek devam</button></div>
<p class="note c">2 seçilseydi: set biter, "MSI 2 · durduruldu" notu düşer; 3+: seansı bitir önerisi.</p></div>''')

E['dinlen'] = phone(f'''<div class="slh"><div><small>SÜRE</small><b class="n">38:40</b></div><div><small>MESAFE</small><b class="n">1.650<small>/3.100</small></b></div></div>
<div class="card2 swim"><small class="ctag">MS · ANA SET BİTTİ · 3/5</small><b class="ctit">4 × 200 FR</b>
<div class="cnt"><div><small>KULAÇ /25 M</small><b class="n">14</b><span class="mu sm">norm 13–15 ✓</span></div><div class="pm"><span>−</span><span>+</span></div></div>
<div class="cnt"><div><small>NABIZ</small><b class="n">148</b><span class="mu sm">geçen 152</span></div><div class="pm"><span>−</span><span>+</span></div></div>
<p class="sw">SWOLF <b class="n">38</b> · kulaç başı <b class="n">1,79 m</b></p></div>
<div class="relief"><b>Omuz rahatlatma · 60 sn</b><p>Aerobik blok bitti: sarkaç 20 sn · kol salınımı 20 sn · kapı esnetme 20 sn</p><div class="rl-b"><span class="on">Yaptım</span><span>Atla</span></div></div>
<div class="bigbtn t">DİNLENME 1:12<small>sıradaki: 8 × 50 kick</small></div>''')

E['setkart'] = phone(f'''{hd('Program', 'Cuma 9 Ekim')}
<div class="card3"><div class="c3h"><b>200 FR</b><span class="zb" style="background:{ZC[2]}">EN2</span></div>
<p class="warn sm">⚠ Kulaç 16/25 m (norm 13–15) · son 3 tekrarda artıyor: teknik bozuluyor ya da yorgunluk</p>
<p class="mu sm">Öneri: sonraki tekrarı hedefin 2 sn üstünde, uzun kayma</p></div>
<div class="card3"><div class="c3h"><b>4 × 50 drill</b><span class="zb" style="background:{ZC[0]}">REC</span></div>
<p class="sm">Catch-up · snorkel + kayma · kulaç 10–11</p><span class="vbtn">▶ Catch-up drill videosu</span></div>
<div class="card3 br"><div class="c3h"><b>4 × 50 BR</b><span class="zb" style="background:{ZC[1]}">EN1</span></div>
{meter('Kurbağalama bu ay', 7, 10, 8, note='bu set +200 m → %8 · sağ diz: ağrıda FR ile değiştir')}
<span class="vbtn alt">⇄ FR ile değiştir</span></div>''')

clipR = 'inset(0 50% 0 0)'  # önden bakışta görüntünün solu = kişinin sağı
E['agri'] = phone(f'''{hd('Ağrı (MSI)', 'seans sonu')}
<p class="note">Ağrıyan yere dokun · tabloya yazılan anahtarlar aynı (sag omuz, sol diz …)</p>
<div class="pmap">{mini('front', {'Omuz': 1}, 'pm', clipR)}<div class="pins"><span class="pin" style="left:27%;top:23%">1</span></div></div>
<div class="msi-s small"><span>0,5</span><span class="on">1</span><span>1,5</span><span class="r">2</span><span class="r">3</span></div>
<p class="lb">SON 4 HAFTA</p>
<div class="pain"><div class="pmap sm">{mini('front', {'Omuz': .9}, 'pm', clipR)}{mini('front', {'Bacak': .35}, 'pm2', 'inset(0 50% 0 0)')}</div>
<div class="cv-tx"><p>Sağ omuz <b>4 seans · ort. 0,9</b></p><p>Sağ diz <b>1 seans · 0,5</b></p><p class="warn sm">Omuz artıyor → salonda omuz önleyici öne, ağır itiş geride (A2, E1)</p></div></div>''')

zbar = lambda d: stack([(ZN[i], d[i], ZC[i]) for i in range(7)])
E['ozet'] = phone(f'''{hd('Yüzme özeti', 'Salı 6 Ekim')}
<div class="stats"><div><small>SÜRE</small><b class="n">78:20</b></div><div><small>MESAFE</small><b class="n">3.100</b></div><div><small>RPE</small><b class="n">6</b></div><div><small>SWOLF</small><b class="n">39<span>−2</span></b></div></div>
<p class="lb">BÖLGELERDE SÜRE</p>{zbar([12, 22, 48, 12, 6, 0, 0])}
<p class="zl">{''.join(f'<span>{dot(ZC[i])}{ZN[i]} {p}%</span>' for i, p in enumerate([12, 22, 48, 12, 6]) )}</p>
<div class="cmp"><p class="lb">GEÇEN AYNI SETLE</p><p>4 × 200 FR ort. <b>3:52</b> · geçen 3:56 <b class="ok">↑ 4 sn</b> · RPE aynı</p><p>8 × 50 kick ort. <b>0:58</b> · geçen 0:58 =</p></div>
<div class="pr"><b>🏆 Rekor</b><p>En hızlı 200 FR tekrarı · <b>3:47</b><span>önceki 3:50</span></p><p>CSS altında 4 × 200 (ort. 1:56/100)</p></div>''')

pace = lambda s: f'{int(s // 60)}:{int(round(s % 60)):02d}'
E['grafik'] = phone(f'''{hd('4 × 100 FR', 'son 8 sefer')}
<p class="lb">ORTALAMA TEMPO /100 M · YUKARI = HIZLI</p>
{line_chart([('Ort.', '#3987e5', [121, 120, 119.5, 118, 118.5, 117, 116, 115])], ymin=112, ymax=124, inv=True, yfmt=pace, xlabels=['Ağu', '', '', 'Eyl', '', '', 'Eki', ''], band=(114, 120, 'EN3'), ref=(117, 'CSS'))}
<div class="kv"><div><small>8 HAFTADA</small><b class="n ok">−6 sn</b><span class="mu sm">/100 m</span></div><div><small>RPE</small><b class="n">7 → 6</b><span class="mu sm">daha kolay</span></div></div>
<p class="lb">DERECE TAHMİNİ · CSS 1:57 VE SETLERDEN</p>
<div class="pred"><div><small>100 FR</small><b class="n">1:41</b></div><div><small>200 FR</small><b class="n">3:39</b></div><div><small>400 FR</small><b class="n">7:42</b></div></div>
<p class="note">Tahmin; yarış/test dereceleri girildikçe düzelir.</p>''')

hbar = lambda lab, a, b_, c: f'<div class="hb"><span>{lab}</span><div class="hbt"><i style="width:{a * 1.6}%;background:{c}"></i><s style="left:{b_ * 1.6}%"></s></div><b class="n">%{a}</b></div>'
E['denge'] = phone(f'''{hd('Denge', '4 hafta / tüm zaman')}
<p class="lb">BÖLGE · ÇUBUK SON 4 HAFTA, ÇİZGİ TÜM ZAMAN</p>
{hbar('Kolay (REC–EN2)', 58, 66, ZC[2])}{hbar('Eşik (EN3)', 27, 22, ZC[3])}{hbar('Hız (SP1–3)', 15, 12, ZC[5])}
<p class="mu sm">Kolay payı düşüyor (%66 → %58): Salı aerobik setini koru.</p>
<p class="lb">STİL · SIRA FR → BK → BF → BR</p>
{stack([('FR', 78, '#3987e5'), ('BK', 12, '#1baf7a'), ('BF', 4, '#9085e9'), ('BR', 6, '#d95926')])}
<p class="zl"><span>{dot('#3987e5')}FR %78</span><span>{dot('#1baf7a')}BK %12</span><span>{dot('#9085e9')}BF %4</span><span>{dot('#d95926')}BR %6</span></p>
{meter('Kurbağalama bu ay', 6, 10, 8)}''')

E['css'] = phone(f'''{hd('CSS testi', 'rehberli')}
<div class="tip">💡 <b>Test zamanı:</b> son 3 haftada EN3 setleri hedefin 2–3 sn altında, RPE 5–6.</div>
<div class="tst"><div><small>1 · 400 FR</small><b class="n">7:36</b><span class="ok sm">✓</span></div><div><small>dinlen</small><b class="n">5:00</b></div><div><small>2 · 200 FR</small><b class="n">3:44</b><span class="ok sm">✓</span></div></div>
<p class="frm">CSS = (400 − 200) / (7:36 − 3:44) = 200 m / 232 sn</p>
<div class="res"><small>YENİ CSS</small><b class="n">1:56</b><span>/100 m · önceki 1:57</span></div>
<p class="lb">BÖLGELER 1 SN HIZLANIR</p>
<div class="zt">{''.join(f'<span style="border-color:{ZC[i]}">{ZN[i]}</span>' for i in range(7))}</div>
<div class="foot2 st2"><button class="ghost">Vazgeç</button><button class="go t">sporRef'e yaz</button></div>
<p class="note c">Onaylarsan sporRef "css" sayfasına yeni satır eklenir (eski satırlar kalır).</p>''')

wkb = lambda lab, h, c, cur=False: f'<div class="wb{" cur" if cur else ""}"><i style="height:{h}%;background:{c}"></i><small>{lab}</small></div>'
E['periyot'] = phone(f'''{hd('Blok', '4 hafta')}
<p class="lb">HACİM → KUVVET → BAKIM · YÜZME YÜKÜYLE BİRLİKTE</p>
<div class="wbs">{wkb('1 · hacim', 60, '#3987e5')}{wkb('2 · hacim+', 75, '#3987e5')}{wkb('3 · kuvvet', 85, '#9085e9', True)}{wkb('4 · dinlenme', 45, '#7A8694')}</div>
<div class="ph3"><b>3. hafta · kuvvet</b><p class="sm">Salon: 3 × 6–8, dinlenme 2 dk · önleyici aynen</p><p class="sm">Yüzme: eşik setleri korunur, toplam hacim −10%</p></div>
<div class="ph3"><b>4. hafta · dinlenme</b><p class="sm">Hacim %40 az · yoğunluk aynı · form +10'a çıkar</p><p class="mu sm">Yük oranı 1,3'ü aşarsa dinlenme haftası öne alınır (B3)</p></div>''')

E['rapor'] = phone(f'''<div class="rp-h"><small>HAFTALIK RAPOR · 28 EYL – 4 EKİ</small><b>Seyfettin</b></div>
<div class="stats"><div><small>YÜZME</small><b class="n">8,4<span>km</span></b></div><div><small>SALON</small><b class="n">24<span>set</span></b></div><div><small>SEANS</small><b class="n">3/3</b></div><div><small>FORM</small><b class="n ok">+4</b></div></div>
<p class="lb">BÖLGE DENGESİ</p>{zbar([10, 20, 30, 27, 10, 3, 0])}
<p class="lb">STİL · BR %6 (sınır 10)</p>{stack([('FR', 78, '#3987e5'), ('BK', 12, '#1baf7a'), ('BF', 4, '#9085e9'), ('BR', 6, '#d95926')])}
<div class="pain"><div class="pmap sm">{mini('front', {'Omuz': .9}, 'pm', clipR)}</div><div class="cv-tx"><p>Ağrı: sağ omuz MSI 1 (Cuma)</p><p class="mu sm">Salı'dan itibaren 0</p></div></div>
<p class="sm"><b>Not:</b> EN3 setleri hedefin altında → CSS testi önerildi.</p>
<div class="foot1"><button class="go t">Paylaş (antrenöre)</button></div>''')

row = lambda a, b_, c, d, e: f'<tr><td>{a}</td><td class="n">{b_}</td><td class="n">{c}</td><td class="n">{d}</td><td class="n">{e}</td></tr>'
E['fit'] = phone(f'''{hd('Saat verisi', 'içe aktar')}
<div class="file">⌚ <b>2026-10-06-sabah.fit</b><span class="mu sm">Garmin · 78 dk · 3.100 m · 25 m havuz</span></div>
<div class="tip">✓ 18 setten 17'si programla eşleşti · 1 set (ısınma) eşleşmedi</div>
<table class="ft"><tr><th>Set</th><th>Süre</th><th>Kulaç</th><th>Nabız</th><th>SWOLF</th></tr>
{row('200 FR WU', '4:02', '14', '128', '40')}{row('4×50 drill', '1:05', '11', '121', '37')}{row('4×200 FR', '3:52', '14', '148', '38')}{row('8×50 kick', '0:58', '—', '139', '—')}{row('200 FR CD', '4:20', '15', '118', '42')}</table>
<p class="note">Kulaç ve nabız eski sayfasına yazılır (bugün boş giden sütunlar). Uygulamadaki süreler değişmez.</p>
<div class="foot2 st2"><button class="ghost">Vazgeç</button><button class="go t">Uygula</button></div>''')

# --- bölümler ---------------------------------------------------------------------------------------
SEC = [
    ('A', 'Sağlık kısıtı koruması', 'Önce bu: uygulama senin kısıtlarını bilir, öneriyi buna göre yapar, gerekirse durdurur.', [
        ('kisit', ['A1'], 'Kısıt profili', 'Tanı → kural listesi sporRef\'teki yeni "kisit" sayfasından okunur; Ayarlar\'da görünür. Sen düzenlersin, uygulama uyar.'),
        ('salonkisit', ['A2', 'E1'], 'Salonda yasaklı hareket + önleyici borç', 'Goblet Squat ve Box Jump ⊘ (Perthes); yerine Box Squat ≤ 90° önerilir. Üstte haftalık önleyici borç (omuz 1/2, kalça stabilite 0/1) puanı yükseltir.'),
        ('msi', ['A5'], 'MSI kural motoru (idman içinde)', 'Set sırasında ağrı girilir; 1,5 → hafifletme önerisi (ağırlık/tekrar), 2 → set durur, 3+ → seansı bitir. Yüzmede aynı kurallar.'),
        ('dinlen', ['A4', 'C1', 'C3'], 'Omuz rahatlatma + kulaç + nabız', 'Aerobik blok bitince 60 sn omuz rahatlatma kartı. Dinlenirken kulaç (norma göre hazır) ve nabız ±: eski sayfasındaki boş sütunlar dolar; SWOLF ve kulaç başı mesafe hesaplanır.'),
        ('setkart', ['A3', 'C2', 'C4'], 'Kurbağalama sayacı, kulaç sapması, drill videosu', 'BR set kartında "bu ay %7/10"; FR\'de kulaç normun üstüne çıkınca teknik uyarısı; drill setinde ▶ video.'),
        ('iskelet', ['A6', 'F5', 'B5'], 'Seans süresi bütçesi + haftanın iskeleti', 'Sal/Per/Cum yuvaları süre bütçesiyle; odak ve bölge dağılımı; aynı günlere çakışan omuz yükü uyarısı. Program sayfasına yazmaz.'),
    ]),
    ('B', 'Yük ve toparlanma', 'Yüzme ve salon tek yük hesabında: RPE × dakika.', [
        ('form', ['B1', 'B2', 'B3'], 'Form grafiği ve yük artış uyarısı', 'Kondisyon (42 gün) ve yorgunluk (7 gün) çizgileri, form çubukları ayrı grafikte. Yük artış oranı 1,3\'ü geçince uyarı, dinlenme haftası önerisi.'),
        ('kasyuk', ['B4'], 'Kas yükü haritası (yüzme dahil)', 'Omuz yükünün %72\'si yüzmeden. Toparlanma yüzdesi salon önerisini yönlendirir.'),
        ('takvim', ['F2'], 'Takvim: salon günleri, günlük yük, ağrı', 'Yüzme ve salon günleri, yük çubuğu, ⚠ ağrı günü; güne dokununca ayrıntı.'),
    ]),
    ('C–D', 'Yüzme: idman içi ve analiz', 'Tablodaki mevcut veri (süre, bölge, RPE, MSI) + yeni kulaç ve nabız.', [
        ('agri', ['C5'], 'Ağrı girişi kas haritasıyla', 'Kişinin sağı / solu ayrı; yazılan anahtarlar aynı. Son 4 haftanın ağrı haritası salon önerisini besler.'),
        ('ozet', ['D1'], 'Yüzme özeti', 'Bölgelerde süre, geçen aynı setle kıyas, rekor rozetleri, SWOLF.'),
        ('grafik', ['D2', 'D5'], 'Set ilerleme grafiği + derece tahmini', 'Aynı set türünün son 8 seferi (CSS çizgisi, EN3 bandı); 100/200/400 tahmini.'),
        ('denge', ['D3'], 'Haftalık denge', 'Kolay / eşik / hız ve stil dağılımı; 4 hafta ile tüm zaman; kurbağalama sayacı.'),
        ('css', ['D4'], 'Rehberli CSS testi', 'Uygulama testi önerir ve yürütür; sonuç onayınla sporRef\'e yeni satır olarak yazılır (eski satırlar kalır).'),
    ]),
    ('E–F', 'Salon ekleri ve ortak deneyim', '', [
        ('isinma', ['E2', 'E3'], 'Isınma şablonu + kart üstü kısıt', 'Bant omuz ısınması kayda sayılmaz; kartta "derinlik ≤ 90°", "ağrısızsa", "yavaş iniş".'),
        ('periyot', ['E4'], 'Periyotlama', '4 haftalık blok (hacim → kuvvet → dinlenme), yüzme yüküyle birlikte; yük oranı yükselirse dinlenme haftası öne gelir.'),
        ('ana', ['F1'], 'Ana ekran', 'Haftalık gün halkası, omuz rahatlatma, form, bugünün önerisi (süre bütçesiyle), kurbağalama ve önleyici göstergeler.'),
        ('fit', ['F4'], 'Saat verisi içe aktarma · SONRA', 'Sürüm 12\'de yok; sonraya bırakıldı. Garmin FIT dosyası seçilir; setlerle eşleşir, kulaç/nabız/SWOLF dolar.'),
    ]),
]

out = []
n = 0
for kod, ad, alt, items in SEC:
    out.append(f'<h2 class="sec"><span class="sk">{kod}</span>{ad}</h2>' + (f'<p class="sec-sub">{alt}</p>' if alt else ''))
    out.append('<div class="flow">')
    for key, codes, t, tx in items:
        n += 1
        chips = ''.join(f'<span class="cd2">{c}</span>' for c in codes)
        out.append(f'<figure class="st yeni"><div class="frame">{E[key]}</div><figcaption><div class="codes">{chips}</div><b><span class="num">{n}</span>{t}</b><p>{tx}</p></figcaption></figure>')
    out.append('</div>')

senc = open(SEN).read()
base_css = re.search(r'/\*MB\*/(.*?)</style>', senc, re.S).group(1)
FONTS = open('/home/user/Claude/fonts/fonts.css').read()
for f in sorted(x for x in os.listdir('/home/user/Claude/fonts') if x.endswith('.woff2')):
    p = '/home/user/Claude/fonts/' + f
    if os.path.exists(p): FONTS = FONTS.replace(f'url({f})', 'url(data:font/woff2;base64,' + b64(p) + ')')
html = open(os.path.join(K, 'sablon.html')).read()
html = html.replace('/*FONTS*/', FONTS).replace('/*MB*/', MBCSS).replace('/*BASE*/', base_css).replace('<!--BOLUMLER-->', '\n'.join(out))
open(os.path.join(K, '../oneriler.html'), 'w').write(html)
print(n, 'ekran ·', os.path.getsize(os.path.join(K, '../oneriler.html')) // 1024, 'KB')
