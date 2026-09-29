# Sade sürüm: 3 model aynı iskelet, yalnızca tema (renk, köşe, yazı karakteri) farklı.
# İlke: ekranda tek ana bilgi, büyük; süs yok; tek vurgu rengi; blok renkleri yalnızca ince çizgide.
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import SETS, DIST, BLOK, ic, title

THEMES = {
  's1': dict(ad='Model 1 · Gece Havuzu (sade)', bg='#061317', card='#0E1F24', card2='#132B30', line='#1B3338', text='#EAF4F3',
             muted='#86A5A8', acc='#2DD4BF', ink='#032024', r=22, head="'Archivo'", hw=800, up=False, skew=False),
  's2': dict(ad='Model 2 · Kinetik (sade)', bg='#0C0C0E', card='#161618', card2='#1E1E21', line='#26262A', text='#F4F4F0',
             muted='#8E8E88', acc='#D4FF3A', ink='#0C0C0E', r=4, head="'Barlow Condensed'", hw=800, up=True, skew=True),
  's3': dict(ad='Model 3 · Halka (sade)', bg='#05060B', card='#11131D', card2='#191C29', line='#23273A', text='#EEF0FF',
             muted='#8A90B0', acc='#818CF8', ink='#0A0B18', r=30, head="'Archivo'", hw=800, up=False, skew=False),
}


def css(T):
    up = 'text-transform:uppercase;' if T['up'] else ''
    sk = 'transform:skewX(-8deg);' if T['skew'] else ''
    return f"""
*{{box-sizing:border-box}}html,body{{margin:0}}
body{{width:440px;height:956px;overflow:hidden;font-family:'Archivo',sans-serif;color:{T['text']};-webkit-font-smoothing:antialiased}}
.phone{{position:relative;width:440px;height:956px;overflow:hidden;padding:60px 20px 30px;display:flex;flex-direction:column;gap:16px;background:{T['bg']}}}
.n{{font-family:'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums}}
.H{{font-family:{T['head']};font-weight:{T['hw']};{up}}}
.K{{display:inline-block;{sk}}}
.mu{{color:{T['muted']}}}.A{{color:{T['acc']}}}
.top{{display:flex;align-items:center;gap:12px;min-height:56px}}
.ib{{width:56px;height:56px;border-radius:{min(T['r'],18)}px;background:{T['card']};display:grid;place-items:center;color:{T['text']};flex:none}}
.h1{{flex:1;font-size:{32 if T['up'] else 26}px}}
.card{{background:{T['card']};border-radius:{T['r']}px;padding:18px 20px}}
.btn{{height:80px;border-radius:{T['r']}px;background:{T['acc']};color:{T['ink']};display:flex;align-items:center;justify-content:center;gap:12px;font-size:{30 if T['up'] else 23}px;flex:none}}
.btn2{{height:64px;border-radius:{T['r']}px;background:{T['card']};color:{T['text']};display:flex;align-items:center;justify-content:center;font-size:{24 if T['up'] else 19}px;flex:none}}
.row{{display:flex;align-items:center;gap:16px;padding:16px 0;border-bottom:1px solid {T['line']}}}
.row:last-child{{border-bottom:0}}
.big{{font-size:44px;font-weight:700;line-height:1}}
.lab{{font-size:15px;font-weight:700;color:{T['muted']}}}
.bar{{display:flex;gap:3px;height:6px}}.bar i{{border-radius:3px}}
.sp{{flex:1}}
"""


def bar(done_upto=None, h=6):
    return f'<div class="bar" style="height:{h}px">' + ''.join(
        f'<i style="flex:{d};background:{BLOK[s[0]][0]};opacity:{1 if done_upto is None or i <= done_upto else .25}"></i>'
        for i, (s, d) in enumerate(zip(SETS, DIST))) + '</div>'


def ring(size, r, sw, frac, col, bg):
    c = 2 * math.pi * r
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}"><circle cx="{size/2}" cy="{size/2}" r="{r}" fill="none" stroke="{bg}" stroke-width="{sw}"/>'
            f'<circle cx="{size/2}" cy="{size/2}" r="{r}" fill="none" stroke="{col}" stroke-width="{sw}" stroke-linecap="round" stroke-dasharray="{c:.1f}" '
            f'stroke-dashoffset="{c*(1-frac):.1f}" transform="rotate(-90 {size/2} {size/2})"/></svg>')


def page(T, extra, body):
    return (f'<!doctype html><html lang="tr"><head><meta charset="utf-8"><link rel="stylesheet" href="fonts.css">'
            f'<style>{css(T)}{extra}</style></head><body><div class="phone">{body}</div></body></html>')


def top(T, t, right=''):
    return f'<div class="top"><span class="ib">{ic("back", 26, 2.4)}</span><div class="h1 H"><span class="K">{t}</span></div>{right}</div>'


def U(T, s):  # büyük harf teması
    return s.replace('i', 'İ').upper() if T['up'] else s


# --- Ana sayfa -------------------------------------------------------------------------------
def ana(T):
    k = T['key']
    if k == 's3':
        hero = f"""<div class="card" style="display:flex;align-items:center;gap:20px">
<div style="position:relative;width:120px;height:120px;flex:none">{ring(120, 50, 12, .17, T['acc'], T['line'])}<b class="n" style="position:absolute;inset:0;display:grid;place-items:center;font-size:30px">%17</b></div>
<div><div class="lab">Bu hafta</div><div class="n big">1.200 m</div><div class="lab" style="margin-top:4px">6.900 m planlı · 1/3 idman</div></div></div>"""
    else:
        hero = ''
    body = f"""<div class="top"><div class="h1 H" style="font-size:{30 if T['up'] else 28}px"><span class="K">YüzmeSK</span></div><span class="ib">{ic('gear', 24)}</span></div>
<div class="lab" style="font-size:18px">{U(T, 'Salı, 29 Eylül')}</div>
{hero}
<div class="card" style="padding:22px">
<div class="lab">{U(T, 'Bugün')}</div>
<div class="H" style="font-size:{64 if T['up'] else 52}px;line-height:1;margin-top:4px"><span class="K">{U(T, 'Yüzme')}</span></div>
<div class="n" style="font-size:30px;font-weight:700;margin:10px 0 16px">6 set · 1.800 m · 41:30</div>
{bar()}
</div>
<div class="btn H"><span class="K">{U(T, 'İdmana başla')}</span>{ic('arrow', 30, 2.8)}</div>
<div class="sp"></div>
<div class="card" style="padding:0 20px">
<div class="row" style="font-size:21px;font-weight:700">{U(T, 'Yapılmış idmanlar')}<span class="mu" style="margin-left:auto">3 ›</span></div>
<div class="row" style="font-size:21px;font-weight:700;color:{T['muted']}">{U(T, 'Salon')}<span style="margin-left:auto;font-size:15px">{U(T, 'Yakında')}</span></div></div>"""
    return page(T, '', body)


# --- Hafta takvimi ---------------------------------------------------------------------------
def takvim(T):
    days = [('Pzt', 28, 'dn'), ('Sal', 29, 'on'), ('Çar', 30, ''), ('Per', 1, ''), ('Cum', 2, 'has'), ('Cmt', 3, ''), ('Paz', 4, '')]
    extra = f"""
.wk{{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center}}
.wk div{{padding:10px 0 12px;border-radius:{min(T['r'],16)}px}}
.wk small{{display:block;font-size:14px;font-weight:700;color:{T['muted']}}}.wk b{{font-size:30px;font-weight:700}}
.wk i{{display:block;width:7px;height:7px;border-radius:50%;margin:4px auto 0}}
.wk .on{{background:{T['acc']};color:{T['ink']}}}.wk .on small{{color:{T['ink']}}}
.wk .has i,.wk .dn i{{background:{T['muted']}}}.wk .on i{{background:{T['ink']}}}
"""
    wk = ''.join(f'<div class="{c}"><small>{U(T, d)}</small><b class="n">{n}</b><i></i></div>' for d, n, c in days)
    body = f"""{top(T, U(T, 'Yüzme'), f'<span class="ib">{ic("refresh", 24)}</span>')}
<div style="display:flex;justify-content:space-between;align-items:baseline"><span class="H" style="font-size:20px">{U(T, 'Bu hafta')}</span><span class="n mu" style="font-size:21px;font-weight:700">3 idman · 6.900 m</span></div>
<div class="wk">{wk}</div>
<div class="card" style="padding:22px">
<div class="lab A">{U(T, '● Bugün')}</div>
<div class="H" style="font-size:{50 if T['up'] else 40}px;line-height:1.05;margin-top:6px"><span class="K">{U(T, '29 Eylül Salı')}</span></div>
<div class="n" style="font-size:30px;font-weight:700;margin:10px 0 16px">6 set · 1.800 m · 41:30</div>
{bar()}</div>
<div class="card" style="padding:0 20px">
<div class="row"><b class="n" style="font-size:40px;width:52px">2</b><div><div style="font-size:20px;font-weight:700">{U(T, 'Cuma')}</div><div class="n mu" style="font-size:20px;font-weight:600">11 set · 3.900 m · 1:12:00</div></div></div>
<div class="row" style="opacity:.5"><b class="n" style="font-size:40px;width:52px">28</b><div><div style="font-size:20px;font-weight:700">{U(T, 'Pazartesi · yapıldı')}</div><div class="n mu" style="font-size:20px;font-weight:600">5 set · 1.200 m · 28:40</div></div></div></div>
<div class="sp"></div>
<div class="btn H"><span class="K">{U(T, 'Bugünün idmanını aç')}</span></div>"""
    return page(T, extra, body)


# --- Set ekranı ------------------------------------------------------------------------------
def set_ekrani(T):
    s = SETS[2]
    rr = min(T['r'], 26)
    extra = f"""
.phone{{gap:12px}}
.line{{position:relative;flex:1}}
.rail{{position:absolute;left:79px;width:4px;border-radius:2px}}
.stop{{position:absolute;left:0;right:0;display:grid;grid-template-columns:62px 20px 1fr;gap:10px;align-items:center;height:40px}}
.stop .t{{text-align:right;font-size:22px;font-weight:700;color:{T['muted']}}}
.stop .q{{width:16px;height:16px;border-radius:{'2px' if T['skew'] else '50%'};justify-self:center}}
.stop .nm{{font-size:21px;font-weight:700;color:{T['muted']};white-space:nowrap}}
.stop.done .nm{{text-decoration:line-through;opacity:.6}}
.act{{position:absolute;left:0;right:0;top:48px;bottom:92px;display:grid;grid-template-columns:62px 1fr;gap:10px}}
.act .t{{text-align:right;font-size:26px;font-weight:700;padding-top:18px;color:{T['acc']}}}
.box{{background:{T['card']};border-radius:{rr}px;border-left:6px solid #FF8A3D;padding:18px 18px 16px;display:flex;flex-direction:column}}
.tiles{{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:auto}}
.tiles div{{background:{T['bg']};border-radius:{min(T['r'],16)}px;padding:8px 12px 10px}}
.tiles b{{display:block;font-size:62px;font-weight:700;line-height:1}}
.dock{{display:grid;grid-template-columns:72px 1fr 72px;gap:10px}}
.side{{height:76px;border-radius:{min(T['r'],22)}px;background:{T['card']};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:12px;font-weight:700;color:{T['muted']}}}
"""
    body = f"""<div class="top"><span class="ib">{ic('back', 26, 2.4)}</span><div style="flex:1"><div class="lab">{U(T, 'Süre / hedef')}</div><div class="n" style="font-size:38px;font-weight:700;line-height:1">12:35 <span class="mu">/ 41:30</span></div></div><span class="ib">{ic('lock', 22)}</span></div>
{bar(2, 8)}
<div class="line">
<div class="rail" style="top:0;height:48px;background:#8B5CF6;opacity:.5"></div><div class="rail" style="top:48px;bottom:92px;background:#FF8A3D"></div><div class="rail" style="bottom:0;height:92px;background:#FF8A3D;opacity:.4"></div>
<div class="stop done" style="top:4px"><span class="t n">9:40</span><i class="q" style="background:#8B5CF6"></i><span class="nm">{U(T, '4 × 50 FR Drill')}</span></div>
<div class="act"><div class="t n">18:40</div><div class="box">
<div class="lab" style="color:#FF8A3D">{U(T, 'Ana set · 3/6')}</div>
<div class="n" style="font-size:88px;font-weight:700;line-height:.95;margin-top:6px"><span class="K">4 × 100</span></div>
<div class="H" style="font-size:{34 if T['up'] else 28}px;margin-top:2px"><span class="K">{U(T, 'FR Swim')}</span></div>
<div style="font-size:24px;line-height:1.3;margin-top:12px">{s[5]}</div>
<div class="tiles"><div><span class="lab">{U(T, 'Hedef')}</span><b class="n">1:55</b></div><div><span class="lab">{U(T, 'Dinlen')}</span><b class="n">0:20</b></div></div>
<div class="n mu" style="font-size:20px;font-weight:700;margin-top:10px;display:flex;justify-content:space-between"><span>Tempo 1:55/100 · Z4</span><span>400 / 800 m</span></div>
</div></div>
<div class="stop" style="bottom:48px"><span class="t n">31:40</span><i class="q" style="background:#FF8A3D"></i><span class="nm">{U(T, '2 × 300 FR Pull')}</span></div>
<div class="stop" style="bottom:4px"><span class="t n">37:00</span><i class="q" style="background:#FACC15"></i><span class="nm">{U(T, '4 × 50 BK Swim')}</span></div>
</div>
<div class="dock"><div class="side">{ic('watch', 26)}{U(T, 'Kronometre')}</div><div class="btn H" style="height:76px"><span class="K">{U(T, 'Seti tamamla')}</span></div><div class="side">{ic('flag', 26)}{U(T, 'Bitir')}</div></div>"""
    return page(T, extra, body)


# --- Kronometre (+ Kaydet paneli) --------------------------------------------------------------
def kronometre(T, sheet=False):
    k = T['key']
    extra = f"""
.phone{{gap:14px;padding-top:56px}}
.disp{{flex:0 0 600px;border-radius:{min(T['r'],32)}px;background:{T['card']};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18px;position:relative}}
.dig{{font-size:{ {'s1':150,'s2':176,'s3':112}[k] }px;font-weight:700;line-height:.9;letter-spacing:-2px;transform:scaleY({1.35 if k != 's3' else 1.15}) {'skewX(-8deg)' if T['skew'] else ''}}}
.dig small{{font-size:.42em;color:{T['acc']}}}
.inf{{display:grid;grid-template-columns:repeat(3,1fr);width:100%;text-align:center;position:absolute;bottom:22px;left:0;padding:0 12px}}
.inf b{{display:block;font-size:40px;font-weight:700;line-height:1.05}}
.ctl{{flex:1;display:grid;grid-template-columns:1fr 150px 1fr;align-items:center;justify-items:center}}
.rb{{width:72px;height:72px;border-radius:{'50%' if k == 's3' else str(min(T['r'],20)) + 'px'};background:{T['card']};display:grid;place-items:center;color:{T['text']}}}
.tur{{width:150px;height:{150 if k == 's3' else 110}px;border-radius:{'50%' if k == 's3' else str(min(T['r'],28)) + 'px'};background:{T['acc']};color:{T['ink']};display:grid;place-items:center;font-size:{48 if T['up'] else 38}px}}
.dim{{position:absolute;inset:0;background:rgba(0,0,0,.7)}}
.sheet{{position:absolute;left:0;right:0;bottom:0;border-radius:{min(T['r'],30)}px {min(T['r'],30)}px 0 0;background:{T['card']};padding:22px 20px 30px;display:flex;flex-direction:column;gap:14px}}
.laps{{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center}}.laps div{{background:{T['bg']};border-radius:{min(T['r'],14)}px;padding:8px 0}}.laps b{{font-size:26px;font-weight:700}}
"""
    top_ = f'<div class="top"><span class="ib">{ic("x", 24, 2.4)}</span><div style="flex:1;text-align:center;font-size:20px;font-weight:700">4 × 100 FR · <span class="mu">2. tekrar / 4</span></div><span class="ib">{ic("lock", 22)}</span></div>'
    if k == 's3':
        disp = f'''<div class="disp" style="justify-content:flex-start;padding-top:40px"><div style="position:relative;width:360px;height:360px">{ring(360, 168, 14, 48.6/115, T['acc'], T['line'])}
<div style="position:absolute;inset:0;display:grid;place-items:center"><div class="n dig">0:48<small>.6</small></div></div></div>'''
    else:
        disp = '<div class="disp" style="justify-content:flex-start;padding-top:120px"><div class="n dig">0:48<small>.6</small></div>'
    body = f"""{top_}
{disp}
<div class="inf n"><div><span class="lab">{U(T, 'Hedefe')}</span><b class="A">66.4</b></div><div><span class="lab">{U(T, 'Çıkışa')}</span><b>1:26</b></div><div><span class="lab">{U(T, 'Son tur')}</span><b>1:52.8</b></div></div></div>
<div class="ctl"><span class="rb">{ic('stop', 28)}</span><div class="tur H"><span class="K">{U(T, 'Tur')}</span></div><span class="rb">{ic('save', 26)}</span></div>"""
    if sheet:
        laps = ''.join(f'<div><span class="lab">{i+1}</span><b class="n" style="display:block">{t}</b></div>' for i, t in enumerate(['1:52.8', '1:54.1', '1:53.4', '1:55.0']))
        body += f"""<div class="dim"></div><div class="sheet">
<div class="H" style="font-size:{32 if T['up'] else 26}px"><span class="K">{U(T, 'Kaydet · 4 × 100 FR')}</span></div>
<div class="laps">{laps}</div>
<div style="display:flex;justify-content:space-between;align-items:baseline"><span class="lab">{U(T, 'Ortalama')}</span><b class="n A" style="font-size:64px">1:53.8</b></div>
<div class="btn H"><span class="K">{U(T, 'Gerçek sütununa yaz')}</span></div>
<div class="btn2 H"><span class="K">{U(T, 'Turlarla birlikte nota yaz')}</span></div>
<div style="text-align:center;font-weight:700;color:{T['muted']};font-size:18px">{U(T, 'Vazgeç')}</div></div>"""
    return page(T, extra, body)


# --- Seans sonu --------------------------------------------------------------------------------
def form(T):
    rr = min(T['r'], 16)
    extra = f"""
.phone{{gap:14px}}
.two{{display:grid;grid-template-columns:1fr 1fr;gap:10px}}
.fld{{background:{T['card']};border-radius:{rr}px;padding:12px 16px}}
.seg{{display:grid;grid-template-columns:1fr 1fr;gap:8px}}.seg div{{height:58px;border-radius:{rr}px;background:{T['card']};display:grid;place-items:center;font-size:22px;font-weight:700}}
.seg .on,.rpe .on{{background:{T['acc']};color:{T['ink']}}}
.rpe{{display:grid;grid-template-columns:repeat(11,1fr);gap:4px}}.rpe div{{height:56px;border-radius:{min(T['r'],12)}px;background:{T['card']};display:grid;place-items:center;font-size:24px;font-weight:700}}
.msi .row{{padding:12px 0;font-size:21px;font-weight:700}}.msi .v{{margin-left:auto;font-size:26px}}
"""
    rpe = ''.join(f'<div class="n{" on" if n == 7 else ""}">{n}</div>' for n in range(11))
    msi = ''.join(f'<div class="row">{U(T, a)}<span class="v n {c}">{v}</span></div>' for a, v, c in
                  [('Sağ omuz', '1', 'A'), ('Bel', '0,5', 'A'), ('Sol omuz', '—', 'mu'), ('Diğer bölgeler', '—', 'mu')])
    body = f"""{top(T, U(T, 'Seans sonu'), f'<span class="lab" style="font-size:16px">{U(T, "29 Eylül")}</span>')}
<div class="two"><div class="fld"><span class="lab">{U(T, 'Süre')}</span><div class="n big">44:12</div></div><div class="fld"><span class="lab">{U(T, 'Mesafe')}</span><div class="n big">1.800</div></div></div>
<span class="lab">{U(T, 'Havuz')}</span><div class="seg n"><div class="on">25 m</div><div>50 m</div></div>
<span class="lab">{U(T, 'Zorluk (RPE)')}</span><div class="rpe">{rpe}</div>
<span class="lab">{U(T, 'MSI — dokunulmayan bölge kaydedilmez')}</span>
<div class="card msi" style="padding:0 18px">{msi}</div>
<div class="fld" style="font-size:18px;color:{T['muted']};height:60px">{'Not…'}</div>
<div class="sp"></div><div class="btn H"><span class="K">{U(T, 'Kaydet')}</span></div>"""
    return page(T, extra, body)


# --- Kaydedildi ----------------------------------------------------------------------------------
def kaydedildi(T):
    k = T['key']
    if k == 's3':
        mark = f'<div style="position:relative;width:180px;height:180px;align-self:center">{ring(180, 80, 14, 1, T["acc"], T["line"])}<span style="position:absolute;inset:0;display:grid;place-items:center;color:{T["acc"]}">{ic("check", 72, 3)}</span></div>'
    else:
        mark = f'<div style="width:150px;height:150px;border-radius:{"8px" if T["skew"] else "50%"};background:{T["acc"]};color:{T["ink"]};display:grid;place-items:center;align-self:center">{ic("check", 76, 3)}</div>'
    body = f"""<div style="height:90px"></div>{mark}
<div class="H" style="text-align:center;font-size:{56 if T['up'] else 42}px"><span class="K">{U(T, 'Kaydedildi')}</span></div>
<div class="n" style="text-align:center;font-size:28px;font-weight:700">6 set · 1.800 m · 44:12</div>
<div class="lab" style="text-align:center;font-size:18px;line-height:1.5">{U(T, 'Tabloya yazıldı, plan arşive taşındı.')}<br>{U(T, 'Bu telefonda da saklandı.')}</div>
<div class="sp"></div><div class="btn H"><span class="K">{U(T, 'Ana sayfa')}</span></div><div class="btn2 H"><span class="K">{U(T, 'Yapılmış idmanlar')}</span></div>"""
    return page(T, '', body)


# --- Yapılmış idmanlar + detay -------------------------------------------------------------------
def gecmis(T, detay=False):
    extra = f"""
.dim{{position:absolute;inset:0;background:rgba(0,0,0,.7)}}
.sheet{{position:absolute;left:0;right:0;bottom:0;border-radius:{min(T['r'],30)}px {min(T['r'],30)}px 0 0;background:{T['card']};padding:22px 20px 30px;display:flex;flex-direction:column;gap:6px}}
.sheet .row{{padding:10px 0;font-size:20px;font-weight:700}}
.del{{height:64px;border-radius:{T['r']}px;background:rgba(239,68,68,.15);color:#F87171;display:grid;place-items:center;font-size:20px;font-weight:800;margin-top:10px}}
"""
    rows = [('29', 'Salı', 'Tabloda', '6/6 set · 1.800 m · 44:12', False), ('26', 'Cumartesi', 'Bekliyor', '3/3 set · 2.400 m · 1:10:00', True),
            ('25', 'Cuma', 'Tabloda', '3/4 set · 1.800 m · 55:00', False), ('23', 'Çarşamba', 'Tabloda', '8/8 set · 2.400 m · 58:20', False)]
    lst = ''.join(f'<div class="row"><b class="n" style="font-size:40px;width:52px">{d}</b><div style="flex:1"><div style="font-size:20px;font-weight:700">{U(T, g)}</div>'
                  f'<div class="n mu" style="font-size:20px;font-weight:600">{m}</div></div><span style="font-size:15px;font-weight:800;color:{"#FFB020" if w else T["muted"]}">{U(T, st)}</span></div>'
                  for d, g, st, m, w in rows)
    body = f"""{top(T, U(T, 'Yapılmış idmanlar'))}
<div class="lab" style="font-size:16px;line-height:1.4">{U(T, 'Bu telefonda saklanan seanslar. Silmek tabloyu etkilemez.')}</div>
<div class="card" style="padding:0 20px">{lst}</div>
<div class="sp"></div><div class="btn2 H" style="color:#F87171"><span class="K">{U(T, 'Sil…')}</span></div>"""
    if detay:
        sets = ''.join(f'<div class="row"><i style="width:10px;height:10px;border-radius:50%;background:{BLOK[s[0]][0]}"></i>{title(s)} {s[3]} {s[4]}<span class="n A" style="margin-left:auto;font-size:22px">{s[10]}</span></div>' for s in SETS)
        body += f"""<div class="dim"></div><div class="sheet">
<div class="H" style="font-size:{34 if T['up'] else 26}px"><span class="K">{U(T, '29 Eylül Salı')}</span></div>
<div class="n mu" style="font-size:21px;font-weight:700;margin-bottom:6px">44:12 · 1.800 m · RPE 7</div>{sets}
<div class="del">{U(T, 'Bu kaydı sil')}</div><div style="text-align:center;font-weight:700;color:{T['muted']};font-size:18px;margin-top:8px">{U(T, 'Kapat')}</div></div>"""
    return page(T, extra, body)


# --- Ayarlar -----------------------------------------------------------------------------------
def ayarlar(T):
    tog = f'<span style="margin-left:auto;width:60px;height:36px;border-radius:{"4px" if T["skew"] else "18px"};background:{T["acc"]};position:relative"><i style="position:absolute;right:4px;top:4px;width:28px;height:28px;border-radius:{"3px" if T["skew"] else "50%"};background:{T["ink"]}"></i></span>'
    pm = lambda s: f'<span class="ib" style="font-size:30px;font-weight:700">{s}</span>'
    body = f"""{top(T, U(T, 'Ayarlar'))}
<span class="lab">{U(T, 'Bağlantı')}</span>
<div class="card" style="padding:0 20px">
<div class="row" style="font-size:20px;font-weight:700">{U(T, 'Tablo')}<span style="margin-left:auto;color:#34D399">{U(T, '● Bağlı')}</span></div>
<div class="row" style="font-size:20px;font-weight:700">{U(T, 'Adres ve anahtar')}<span class="mu" style="margin-left:auto">{U(T, 'Değiştir ›')}</span></div>
<div class="row" style="font-size:20px;font-weight:700;color:#F87171">{U(T, 'Anahtarı unut')}</div></div>
<span class="lab">{U(T, 'Ses')}</span>
<div class="card" style="padding:0 20px"><div class="row" style="font-size:20px;font-weight:700">{U(T, 'Çıkış bipi')}{tog}</div>
<div class="row" style="font-size:20px;font-weight:700">{U(T, 'Sesi dene')}<span class="mu" style="margin-left:auto">▶</span></div></div>
<span class="lab">{U(T, 'Tempo (CSS, 100 m)')}</span>
<div class="card" style="display:flex;align-items:center;gap:12px">{pm('−')}<b class="n A" style="flex:1;text-align:center;font-size:64px;line-height:1">1:57</b>{pm('+')}</div>
<div class="lab" style="font-size:15px;line-height:1.5">{U(T, 'Z1 2:12+ · Z2 2:05 · Z3 2:00 · Z4 1:55 · Z5 daha hızlı')}</div>
<div class="sp"></div><div class="lab" style="text-align:center;font-size:13px">{U(T, 'Sürüm 9')}</div>"""
    return page(T, '', body)


PAGES = [('ana', ana, 'Ana sayfa'), ('takvim', takvim, 'Hafta takvimi'), ('set', set_ekrani, 'Set ekranı'),
         ('kronometre', kronometre, 'Kronometre'), ('kaydet', lambda T: kronometre(T, True), 'Kaydet paneli'),
         ('form', form, 'Seans sonu'), ('kaydedildi', kaydedildi, 'Kaydedildi'), ('gecmis', gecmis, 'Yapılmış idmanlar'),
         ('gecmis-detay', lambda T: gecmis(T, True), 'Kayıt detayı'), ('ayarlar', ayarlar, 'Ayarlar')]

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), '..', 'mock', 'v10')
    for k, T in THEMES.items():
        T['key'] = k
        for name, fn, _ in PAGES:
            open(os.path.join(out, f'{k}-{name}.html'), 'w').write(fn(T))
    print('ok')
