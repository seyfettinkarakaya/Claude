# Model 2 · Kinetik — spor dergisi: grafit zemin, elektrik yeşili, eğik dev yazı.
from common import *

L = '#D4FF3A'
BASE = f"""
*{{box-sizing:border-box}}html,body{{margin:0}}
body{{width:440px;height:956px;overflow:hidden;font-family:'Archivo',sans-serif;color:#F4F4F0;-webkit-font-smoothing:antialiased}}
.phone{{position:relative;width:440px;height:956px;overflow:hidden;padding:58px 20px 30px;display:flex;flex-direction:column;gap:14px;
 background:repeating-linear-gradient(90deg,transparent 0 109px,rgba(255,255,255,.035) 109px 110px),#0C0C0E}}
.c{{font-family:'Barlow Condensed',sans-serif;font-weight:800;text-transform:uppercase}}
.n{{font-family:'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums}}
.sk{{display:inline-block;transform:skewX(-9deg)}}
.L{{color:{L}}}.mu{{color:#8A8A85}}
.top{{display:flex;align-items:center;gap:12px}}
.sq{{width:56px;height:56px;border-radius:14px;border:1.5px solid #2A2A2E;display:grid;place-items:center;color:#D8D8D2;flex:none;background:#121214}}
.h{{flex:1;font-size:34px;letter-spacing:.5px}}
.lbl{{font-family:'Archivo';font-size:11px;font-weight:800;letter-spacing:2px;color:#8A8A85;text-transform:uppercase}}
.go{{height:92px;clip-path:polygon(4% 0,100% 0,96% 100%,0 100%);background:{L};color:#0C0C0E;display:flex;align-items:center;justify-content:center;gap:16px;font-size:40px;flex:none}}
.dk{{height:72px;clip-path:polygon(4% 0,100% 0,96% 100%,0 100%);background:#1A1A1D;color:#D8D8D2;display:flex;align-items:center;justify-content:center;gap:12px;font-size:28px;flex:none}}
.lanes{{display:flex;gap:4px;height:12px}}.lanes i{{transform:skewX(-20deg)}}
.tag{{font-family:'Archivo';font-size:12px;font-weight:800;letter-spacing:1.5px;padding:4px 10px;transform:skewX(-9deg);display:inline-block}}
.tag.ok{{background:{L};color:#0C0C0E}}.tag.q{{background:#FFB020;color:#0C0C0E}}
.card{{background:#141416;border:1.5px solid #232326;padding:16px 18px}}
.sp{{flex:1}}
"""


def lanes(h=12):
    return f'<div class="lanes" style="height:{h}px">' + ''.join(
        f'<i style="flex:{d};background:{BLOK[s[0]][0]}"></i>' for s, d in zip(SETS, DIST)) + '</div>'


def top(title_html, right=''):
    return f'<div class="top"><span class="sq">{ic("back", 26, 2.6)}</span><div class="h c"><span class="sk">{title_html}</span></div>{right}</div>'


# --- Ana sayfa ---------------------------------------------------------------
def ana():
    css = BASE + f"""
.logo{{flex:1;font-size:26px;letter-spacing:1px}}
.kick{{font-size:17px;letter-spacing:3px;color:#8A8A85;margin-top:14px}}
.hero{{line-height:.82}}.hero .a{{font-size:62px}}.hero .b{{font-size:150px;color:{L};letter-spacing:-3px}}.hero .b small{{font-size:60px;margin-left:6px;color:#F4F4F0;letter-spacing:0}}
.meta{{display:flex;gap:18px;font-size:26px}}.meta span{{display:flex;flex-direction:column}}.meta small{{font-family:'Archivo';font-size:11px;font-weight:800;letter-spacing:2px;color:#8A8A85}}
.week{{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;align-items:end;height:92px}}
.week div{{display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end}}
.week i{{width:100%;border-radius:3px;background:#26262A;transform:skewX(-9deg)}}.week .on i{{background:{L};box-shadow:0 0 22px rgba(212,255,58,.45)}}.week .pl i{{background:#F4F4F0}}.week .dn i{{background:#55554F}}
.week span{{font-size:14px;color:#6E6E6A;letter-spacing:1px}}.week .on span{{color:{L}}}
.big{{margin-top:auto;height:112px;font-size:58px;justify-content:space-between;padding:0 38px 0 40px}}.big small{{display:block;font-family:'Archivo';font-size:13px;font-weight:800;letter-spacing:2.5px;margin-bottom:-4px}}
.gym{{height:84px;clip-path:polygon(4% 0,100% 0,96% 100%,0 100%);background:#18181B;display:flex;align-items:center;justify-content:space-between;padding:0 38px 0 40px;font-size:40px;color:#4A4A48}}
.gym em{{font-style:normal;font-family:'Archivo';font-size:13px;font-weight:800;letter-spacing:3px;color:#6E6E6A;border:1.5px solid #3A3A3C;padding:6px 12px;transform:skewX(-9deg)}}
.log{{display:flex;align-items:center;justify-content:space-between;white-space:nowrap;font-size:20px;color:#BDBDB8;padding:6px 4px;border-top:1.5px solid #222226}}.log b{{color:#F4F4F0}}.log em{{font-style:normal;font-family:'Archivo';font-size:13px;font-weight:800;color:#FFB020;letter-spacing:1px}}
"""
    week = ''.join(f'<div class="{c}"><i style="height:{h}%"></i><span>{d}</span></div>' for d, h, c in
                   [('PZT', 38, 'dn'), ('SAL', 56, 'on'), ('ÇAR', 0, ''), ('PER', 0, ''), ('CUM', 100, 'pl'), ('CMT', 0, ''), ('PAZ', 0, '')])
    body = f"""<div class="top"><div class="logo c sk">YÜZME<span class="L">SK</span></div><span class="sq">{ic('gear', 22)}</span></div>
<div class="kick c">SALI · 29 EYLÜL · <span class="L">BUGÜN HAVUZ GÜNÜ</span></div>
<div class="hero c"><div class="a sk">BUGÜN</div><div class="b sk">1.800<small>M</small></div></div>
{lanes(14)}
<div class="meta c"><span class="sk"><small>SET</small>6</span><span class="sk"><small>HEDEF SÜRE</small>41:30</span><span class="sk" style="color:#FF8A3D"><small>ANA SET</small>1.000 M</span><span class="sk"><small>TEMPO</small>Z4</span></div>
<div class="week c">{week}</div>
<div class="go c big"><span class="sk"><small>İDMANA BAŞLA</small>YÜZME</span>{ic('arrow', 54, 3)}</div>
<div class="gym c"><span class="sk">SALON</span><em>YAKINDA</em></div>
<div class="log c"><span class="sk">YAPILMIŞ İDMANLAR <b>· 3</b></span><em>1 BEKLİYOR</em></div>"""
    return page(css, body)


# --- Hafta takvimi -------------------------------------------------------------
def takvim():
    css = BASE + f"""
.wk{{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}}
.wk div{{height:104px;background:#141416;transform:skewX(-9deg);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:10px;position:relative;overflow:hidden}}
.wk div>*{{transform:skewX(9deg)}}
.wk small{{font-size:13px;letter-spacing:1px;color:#6E6E6A}}.wk b{{font-size:34px;line-height:1}}
.wk em{{position:absolute;left:0;right:0;bottom:0;background:#26262A;transform:none!important}}
.wk .on{{background:{L};color:#0C0C0E}}.wk .on small{{color:#3A4A00}}.wk .on em{{display:none}}
.wk .has em{{background:#F4F4F0;height:5px}}.wk .dn em{{background:#55554F;height:5px}}
.hd{{display:flex;justify-content:space-between;align-items:baseline;font-size:22px;letter-spacing:1px}}
.hero{{line-height:.85;margin-top:6px}}.hero .d{{font-size:88px}}.hero .d span{{color:{L}}}
.stats{{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}}.stats b{{display:block;font-size:44px;line-height:1}}
.row{{display:flex;align-items:center;gap:16px;padding:14px 0;border-top:1.5px solid #222226}}
.row .dt{{width:70px;font-size:54px;line-height:.9}}.row .dt small{{display:block;font-size:14px;letter-spacing:2px;color:#8A8A85}}
.row .inf{{flex:1}}.row .g{{font-size:26px}}.row .m{{font-size:20px;color:#BDBDB8;margin:2px 0 8px}}
.gl{{display:flex;gap:3px;height:8px}}.gl i{{transform:skewX(-20deg)}}
"""
    wk = ''.join(f'<div class="{c}"><small>{d}</small><b class="n">{n}</b><em></em></div>' for d, n, c in
                 [('PZT', 28, 'dn'), ('SAL', 29, 'on'), ('ÇAR', 30, ''), ('PER', 1, ''), ('CUM', 2, 'has'), ('CMT', 3, ''), ('PAZ', 4, '')])
    gray = lambda parts: '<div class="gl">' + ''.join(f'<i style="flex:{f};background:{c}"></i>' for f, c in parts) + '</div>'
    body = f"""{top('YÜZME', f'<span class="sq">{ic("refresh", 24)}</span>')}
<div class="hd c"><span class="sk">BU HAFTA</span><span class="sk mu">3 İDMAN · <span style="color:#F4F4F0">6.900 M</span></span></div>
<div class="wk c">{wk}</div>
<div class="hero c"><div class="lbl" style="letter-spacing:3px"><span class="L">● BUGÜN</span> · 41:30 HEDEF</div><div class="d sk">29 <span>EYL</span></div></div>
{lanes(14)}
<div class="stats c"><div><span class="lbl">SET</span><b class="sk">6</b></div><div><span class="lbl">MESAFE</span><b class="sk">1.800</b></div><div><span class="lbl">ANA SET</span><b class="sk" style="color:#FF8A3D">1.000</b></div></div>
<div class="row c"><div class="dt sk">2<small>EKİM</small></div><div class="inf"><div class="g">CUMA</div><div class="m n">11 SET · 3.900 M · 1:12:00</div>{gray([(4,'#55554F'),(3,'#77776F'),(12,'#D8D8D2'),(4,'#A5A59E'),(3,'#55554F')])}</div></div>
<div class="row c" style="opacity:.45"><div class="dt sk">28<small>EYLÜL</small></div><div class="inf"><div class="g">PAZARTESİ · YAPILDI</div><div class="m n">5 SET · 1.200 M · 28:40</div>{gray([(4,'#55554F'),(6,'#D8D8D2'),(2,'#55554F')])}</div></div>
<div class="sp"></div>
<div class="go c"><span class="sk">BUGÜNÜN İDMANI</span>{ic('arrow', 40, 3)}</div>"""
    return page(css, body)


# --- Set ekranı (metro, Kinetik) ------------------------------------------------
def set_ekrani():
    css = BASE + f"""
.phone{{gap:10px}}
.hdr{{display:grid;grid-template-columns:56px minmax(0,1fr) 56px;gap:14px;align-items:center}}
.st b{{display:block;font-size:40px;line-height:1;white-space:nowrap}}.st .dim{{color:#55554F}}
.prog{{display:flex;gap:4px;height:12px}}.prog i{{transform:skewX(-20deg);opacity:.25}}.prog i.on{{opacity:1}}.prog i.cur{{opacity:1;box-shadow:0 0 12px #FF8A3D}}
.line{{position:relative;flex:1;margin-top:6px}}
.stop{{position:absolute;left:0;right:0;display:grid;grid-template-columns:62px 26px 1fr;gap:10px;align-items:center;height:40px}}
.stop .t{{text-align:right;font-size:24px;color:#9A9A94}}
.stop .q{{width:18px;height:18px;transform:skewX(-9deg);justify-self:center}}
.stop .nm{{font-size:24px;color:#BDBDB8;white-space:nowrap;overflow:hidden}}
.stop.done .nm{{text-decoration:line-through;color:#55554F}}
.rail{{position:absolute;left:80px;width:8px;transform:skewX(-9deg)}}
.act{{position:absolute;left:0;right:0;top:92px;bottom:92px;display:grid;grid-template-columns:62px 1fr;gap:10px}}
.act .t{{text-align:right;font-size:30px;color:{L};line-height:1.1;padding-top:14px}}.act .t small{{display:block;font-size:18px;color:#8A8A85}}
.box{{position:relative;background:#141416;border-left:8px solid #FF8A3D;padding:16px 16px 14px 18px;display:flex;flex-direction:column;box-shadow:0 0 50px rgba(255,138,61,.12)}}
.box .tg{{font-family:'Archivo';font-size:12px;font-weight:800;letter-spacing:2px;color:#FF8A3D}}
.box .ti{{font-size:92px;line-height:.9;margin-top:6px}}
.box .su{{font-size:34px;color:#FF8A3D;margin-top:2px}}
.box .de{{font-family:'Archivo';font-size:24px;font-weight:600;line-height:1.3;margin-top:10px;color:#E4E4DE;text-transform:none}}
.tiles{{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:auto}}
.tiles div{{background:#0C0C0E;padding:6px 12px 8px;transform:skewX(-6deg)}}.tiles b{{display:block;font-size:64px;line-height:1}}
.ft{{display:flex;justify-content:space-between;margin-top:10px;font-size:22px;color:#BDBDB8}}
.dock{{display:grid;grid-template-columns:72px 1fr 72px;gap:10px;align-items:center}}
.side{{height:72px;background:#161618;border:1.5px solid #2A2A2E;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-family:'Archivo';font-size:11px;font-weight:800;color:#D8D8D2;transform:skewX(-9deg)}}
.side>*{{transform:skewX(9deg)}}.side.end{{color:#FF6B6B}}
.main{{height:80px;font-size:32px}}
"""
    st = lambda y, t, c, nm, cls='': f'<div class="stop {cls}" style="top:{y}px"><span class="t n">{t}</span><i class="q" style="background:{c}"></i><span class="nm c">{nm}</span></div>'
    s = SETS[2]
    prog = ''.join(f'<i class="{"on" if i < 2 else "cur" if i == 2 else ""}" style="flex:{d};background:{BLOK[x[0]][0]}"></i>' for i, (x, d) in enumerate(zip(SETS, DIST)))
    body = f"""<div class="hdr"><span class="sq">{ic('back', 26, 2.6)}</span><div class="st c"><span class="lbl">SÜRE / HEDEF</span><b class="sk">12:35<span class="dim"> / </span><span class="L">41:30</span></b></div><span class="sq">{ic('lock', 22)}</span></div>
<div style="display:flex;align-items:center;gap:12px"><div class="prog" style="flex:1">{prog}</div><span class="c sk" style="font-size:22px">400<span style="color:#55554F">/1.800 M</span></span></div>
<div class="line">
<div class="rail" style="top:0;height:92px;background:linear-gradient(#3B82F6,#8B5CF6)"></div>
<div class="rail" style="top:92px;bottom:92px;background:#FF8A3D"></div>
<div class="rail" style="bottom:0;height:92px;background:linear-gradient(#FF8A3D,#FACC15);opacity:.5"></div>
{st(6, '4:20', '#3B82F6', '1 × 200 FR SWIM', 'done')}{st(46, '9:40', '#8B5CF6', '4 × 50 FR DRILL', 'done')}
<div class="act"><div class="t n">18:40<small>+9:00</small></div><div class="box c"><span class="tg">MS · ANA SET · 3/6</span><div class="ti sk">4 × 100</div><div class="su sk">FR · SWIM</div><div class="de">{s[5]}</div>
<div class="tiles"><div><span class="lbl">HEDEF</span><b class="n">1:55</b></div><div><span class="lbl">DİNLEN</span><b class="n">0:20</b></div></div>
<div class="ft n"><span>TEMPO <b style="color:#FB923C">1:55</b>/100 · Z4</span><span>400 / 800 M</span></div></div></div>
<div class="stop" style="top:auto;bottom:46px"><span class="t n">31:40</span><i class="q" style="background:#FF8A3D"></i><span class="nm c">2 × 300 FR PULL</span></div>
<div class="stop" style="top:auto;bottom:4px"><span class="t n">37:00</span><i class="q" style="background:#FACC15"></i><span class="nm c">4 × 50 BK SWIM</span></div>
</div>
<div class="dock"><div class="side">{ic('watch', 24)}<span>KRONO</span></div><div class="go c main"><span class="sk">SETİ TAMAMLA</span></div><div class="side end">{ic('flag', 24)}<span>BİTİR</span></div></div>"""
    return page(css, body)


# --- Kronometre ------------------------------------------------------------------
def kronometre(sheet=False):
    css = BASE + f"""
.phone{{gap:10px;padding-top:54px}}
.strip{{display:flex;align-items:center;gap:10px}}.strip .ttl{{flex:1;font-size:22px;letter-spacing:.5px;white-space:nowrap;overflow:hidden}}
.disp{{flex:0 0 640px;display:flex;flex-direction:column;background:#111113;border:1.5px solid #222226;padding:16px 16px 18px;position:relative;overflow:hidden}}
.disp:before{{content:'';position:absolute;inset:0;background:repeating-linear-gradient(-70deg,transparent 0 60px,rgba(212,255,58,.035) 60px 62px)}}
.rp{{display:flex;justify-content:space-between;align-items:center;position:relative}}.rp .tg{{font-size:22px;letter-spacing:1px;color:{L}}}
.bars{{display:flex;gap:6px}}.bars i{{width:30px;height:12px;background:#2A2A2E;transform:skewX(-20deg)}}.bars .ok{{background:#F4F4F0}}.bars .now{{background:{L};box-shadow:0 0 12px {L}}}
.dig{{flex:1;display:flex;align-items:center;justify-content:center;position:relative}}
.dig b{{font-size:172px;line-height:.8;letter-spacing:-4px;transform:skewX(-9deg) scaleY(1.9);display:inline-block}}
.dig b small{{font-size:74px;color:{L};letter-spacing:0}}
.pb{{height:14px;background:#26262A;position:relative;transform:skewX(-20deg)}}.pb i{{position:absolute;left:0;top:0;bottom:0;width:38%;background:{L}}}.pb em{{position:absolute;left:91%;top:-8px;bottom:-8px;width:5px;background:#F4F4F0}}
.inf{{display:grid;grid-template-columns:repeat(3,1fr);margin-top:12px;text-align:center;position:relative}}.inf b{{display:block;font-size:46px;line-height:1}}.inf small{{display:block;font-size:18px;color:#FB923C}}
.ctl{{flex:1;display:grid;grid-template-columns:1fr 1.7fr 1fr;align-items:center;gap:14px}}
.rb{{height:74px;background:#161618;border:1.5px solid #2A2A2E;transform:skewX(-9deg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-family:'Archivo';font-size:11px;font-weight:800;color:#D8D8D2}}.rb>*{{transform:skewX(9deg)}}
.tur{{height:110px;font-size:62px}}
.dim{{position:absolute;inset:0;background:rgba(0,0,0,.72)}}
.sheet{{position:absolute;left:0;right:0;bottom:0;background:#141416;border-top:4px solid {L};padding:18px 20px 30px;display:flex;flex-direction:column;gap:12px}}
.sheet h3{{margin:0;font-size:34px}}
.pick{{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1.5px solid #2A2A2E;background:#0C0C0E}}.pick b{{font-size:28px;flex:1}}.pick em{{font-style:normal;font-family:'Archivo';font-size:13px;font-weight:800;color:{L};letter-spacing:1px}}
.laps{{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}}.laps div{{background:#0C0C0E;padding:6px;text-align:center;transform:skewX(-9deg)}}.laps small{{display:block;font-family:'Archivo';font-size:11px;font-weight:800;color:#8A8A85}}.laps b{{font-size:26px;color:{L}}}
.avg{{display:flex;justify-content:space-between;align-items:baseline}}.avg b{{font-size:64px;color:{L};line-height:1}}
.op{{height:78px;font-size:28px;justify-content:flex-start;padding-left:40px}}.op small{{display:block;font-family:'Archivo';font-size:12px;font-weight:700;letter-spacing:0;text-transform:none}}
.cn{{text-align:center;font-family:'Archivo';font-weight:800;color:#8A8A85;font-size:16px;margin-top:4px}}
"""
    body = f"""<div class="strip"><span class="sq">{ic('x', 22, 2.6)}</span><div class="ttl c"><span class="sk">4 × 100 FR SWIM · <span class="L">@2:15</span></span></div><span class="sq">{ic('lock', 22)}</span><span class="sq">{ic('reset', 22)}</span></div>
<div class="disp c"><div class="rp"><span class="tg sk">2. TEKRAR / 4</span><div class="bars"><i class="ok"></i><i class="now"></i><i></i><i></i></div></div>
<div class="dig n"><b>0:48<small>.6</small></b></div>
<div class="pb"><i></i><em></em></div>
<div class="inf n"><div><span class="lbl">HEDEFE</span><b class="L">66.4</b></div><div><span class="lbl">ÇIKIŞA</span><b style="color:#F4F4F0">1:26</b></div><div><span class="lbl">SON TUR</span><b>1:52.8</b><small>1:53/100 · Z4</small></div></div></div>
<div class="ctl"><div class="rb" style="color:#FF6B6B">{ic('stop', 24)}<span>DURDUR</span></div><div class="go c tur"><span class="sk">TUR</span></div><div class="rb">{ic('save', 24)}<span>KAYDET</span></div></div>"""
    if sheet:
        laps = ''.join(f'<div><small>{i+1}</small><b class="n">{t}</b></div>' for i, t in enumerate(['1:52.8', '1:54.1', '1:53.4', '1:55.0']))
        body += f"""<div class="dim"></div><div class="sheet c"><h3 class="sk">KAYDET</h3>
<div class="pick"><i style="width:16px;height:16px;background:#FF8A3D;transform:skewX(-9deg)"></i><b class="sk">4 × 100 FR SWIM</b><em>DEĞİŞTİR</em></div>
<div class="laps">{laps}</div>
<div class="avg"><span class="lbl">ORTALAMA · 4 TUR</span><b class="n sk">1:53.8</b></div>
<div class="go c op"><span class="sk">ORTALAMA → GERÇEK<small>Gerçek sütununa 01:53.8 yazılır</small></span></div>
<div class="dk c op" style="padding-left:40px;justify-content:flex-start"><span class="sk">+ TURLAR → NOT<small>Not: 1:52.8, 1:54.1, 1:53.4, 1:55.0</small></span></div>
<div class="cn">VAZGEÇ</div></div>"""
    return page(css, body)


# --- Seans sonu -------------------------------------------------------------------
def form():
    css = BASE + f"""
.phone{{gap:12px}}
.sum{{display:grid;grid-template-columns:1.3fr 1fr .8fr;gap:8px}}.sum div{{background:#141416;padding:8px 12px;transform:skewX(-6deg)}}.sum b{{display:block;font-size:44px;line-height:1}}
.sec{{font-size:18px;letter-spacing:2px;color:#8A8A85;margin-bottom:-4px}}
.tg2{{display:grid;grid-template-columns:1fr 1fr;gap:10px}}.tg2 div{{height:64px;display:grid;place-items:center;font-size:30px;background:#161618;transform:skewX(-9deg)}}.tg2 .on{{background:{L};color:#0C0C0E}}
.eq{{display:grid;grid-template-columns:repeat(11,1fr);gap:5px;align-items:end;height:104px}}
.eq div{{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;height:100%}}
.eq i{{width:100%;transform:skewX(-9deg);opacity:.3}}.eq .on i{{opacity:1;box-shadow:0 0 16px currentColor}}.eq span{{font-size:20px;color:#6E6E6A}}.eq .on span{{color:#F4F4F0}}
.rl{{display:flex;justify-content:space-between;font-size:16px;color:#8A8A85;letter-spacing:1px}}
.msi div{{display:flex;align-items:center;justify-content:space-between;padding:10px 2px;border-bottom:1.5px solid #1E1E21;font-size:26px}}
.msi .v{{display:flex;gap:5px}}.msi .v span{{width:38px;height:34px;display:grid;place-items:center;font-size:20px;background:#161618;color:#6E6E6A;transform:skewX(-9deg)}}
.msi .v .o1{{background:#FF8A3D;color:#0C0C0E}}.msi .v .o05{{background:#FACC15;color:#0C0C0E}}
.nt{{background:#141416;padding:12px 14px;font-size:18px;color:#BDBDB8;text-transform:none;font-family:'Archivo';font-weight:600}}
"""
    rpe_c = ['#34D399', '#34D399', '#6EE7B7', '#A3E635', '#D4FF3A', '#FDE047', '#FACC15', '#FDBA74', '#FB923C', '#F87171', '#EF4444']
    eq = ''.join(f'<div class="{"on" if n == 7 else ""}" style="color:{c}"><i style="height:{18 + n * 7}px;background:{c}"></i><span class="n">{n}</span></div>' for n, c in enumerate(rpe_c))
    vals = ['0', '½', '1', '1½', '2', '3']
    row = lambda name, sel, cls: f'<div><span class="sk">{name}</span><span class="v n">' + ''.join(f'<span class="{cls if v == sel else ""}">{v}</span>' for v in vals) + '</span></div>'
    body = f"""{top('SEANS SONU', '<span class="lbl" style="text-align:right">29 EYLÜL<br>SALI</span>')}
<div class="sum c"><div><span class="lbl">SÜRE ✎</span><b class="n sk">44:12</b></div><div><span class="lbl">MESAFE</span><b class="n sk">1.800</b></div><div><span class="lbl">SET</span><b class="n sk L">6/6</b></div></div>
<div class="sec c">HAVUZ</div><div class="tg2 c"><div class="on">25 M</div><div>50 M</div></div>
<div class="sec c">ZORLUK · RPE <span class="L">· 7 ZOR</span></div><div class="eq c">{eq}</div>
<div class="sec c">MSI · DOKUNULMAYAN KAYDEDİLMEZ</div>
<div class="msi c">{row('SAĞ OMUZ', '1', 'o1')}{row('BEL', '½', 'o05')}{row('SOL OMUZ', '', '')}{row('SAĞ DİZ', '', '')}</div>
<div class="nt">Ana set iyi geçti, son 2 tekrarda omuz…</div>
<div class="sp"></div><div class="go c"><span class="sk">KAYDET VE GÖNDER</span>{ic('arrow', 40, 3)}</div>"""
    return page(css, body)


# --- Kaydedildi ---------------------------------------------------------------------
def kaydedildi():
    css = BASE + f"""
.phone{{padding-top:110px;gap:16px}}
.ck{{width:150px;height:130px;background:{L};color:#0C0C0E;clip-path:polygon(12% 0,100% 0,88% 100%,0 100%);display:grid;place-items:center;box-shadow:0 0 60px rgba(212,255,58,.4)}}
.big{{font-size:84px;line-height:.85;color:{L}}}
.sub{{font-size:22px;letter-spacing:2px;color:#8A8A85}}
.st{{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1.5px solid #2A2A2E;border-bottom:1.5px solid #2A2A2E}}.st div{{padding:12px 4px}}.st b{{display:block;font-size:52px;line-height:1}}
.li div{{display:flex;align-items:center;gap:14px;padding:11px 0;font-size:24px;border-bottom:1.5px solid #1E1E21}}
.li i{{width:30px;height:26px;background:{L};color:#0C0C0E;display:grid;place-items:center;transform:skewX(-9deg)}}.li small{{margin-left:auto;font-size:20px;color:#BDBDB8}}
"""
    li = ''.join(f'<div><i>{ic("check", 16, 3.4)}</i><span class="sk">{a}</span><small class="n">{b}</small></div>' for a, b in
                 [('ESKİ SAYFASI', '6 SET YAZILDI'), ('SEANS SAYFASI', 'ÖZET YAZILDI'), ('ARSİV SAYFASI', '6 PLAN SATIRI'), ('BU TELEFONDA', 'SAKLANDI')])
    body = f"""<div class="ck">{ic('check', 70, 3.4)}</div>
<div class="big c"><span class="sk">KAYDEDİLDİ</span></div><div class="sub c">SALI · 29 EYLÜL · <span class="L">İYİ İŞ</span></div>
<div class="st c"><div><span class="lbl">SET</span><b class="n sk">6/6</b></div><div><span class="lbl">MESAFE</span><b class="n sk">1.800</b></div><div><span class="lbl">SÜRE</span><b class="n sk">44:12</b></div></div>
<div class="li c">{li}</div>
<div class="sp"></div><div class="go c"><span class="sk">ANA SAYFA</span>{ic('arrow', 40, 3)}</div><div class="dk c"><span class="sk">YAPILMIŞ İDMANLAR</span></div>"""
    return page(css, body)


# --- Yapılmış idmanlar + detay ---------------------------------------------------------
def gecmis(detay=False):
    css = BASE + f"""
.note{{font-size:17px;color:#8A8A85}}
.r{{display:flex;gap:16px;padding:14px 0;border-bottom:1.5px solid #222226;align-items:center}}
.r .dt{{width:78px;font-size:62px;line-height:.85}}.r .dt small{{display:block;font-size:14px;letter-spacing:2px;color:#8A8A85}}
.r .inf{{flex:1;min-width:0}}.r .g{{display:flex;align-items:center;gap:10px;font-size:26px}}.r .m{{font-size:21px;color:#BDBDB8;margin:3px 0 8px}}
.gl{{display:flex;gap:3px;height:8px}}.gl i{{transform:skewX(-20deg)}}
.dim{{position:absolute;inset:0;background:rgba(0,0,0,.74)}}
.sheet{{position:absolute;left:0;right:0;bottom:0;background:#141416;border-top:4px solid {L};padding:20px 20px 30px;display:flex;flex-direction:column;gap:10px}}
.sheet h3{{margin:0;font-size:40px;line-height:1}}
.fx{{font-size:22px;color:#BDBDB8}}
.s{{display:flex;align-items:center;gap:12px;font-size:24px;padding:6px 0;border-bottom:1.5px solid #1E1E21}}.s i{{width:14px;height:14px;transform:skewX(-9deg);flex:none}}.s span{{flex:1}}.s b{{font-size:22px;color:{L}}}
.red{{height:74px;clip-path:polygon(4% 0,100% 0,96% 100%,0 100%);background:#FF4D4D;color:#0C0C0E;display:grid;place-items:center;font-size:30px}}
"""
    gl = lambda sets: '<div class="gl">' + ''.join(f'<i style="flex:{d};background:{BLOK[b][0]}"></i>' for b, d in sets) + '</div>'
    rows = [('29', 'EYLÜL', 'SALI', 'ok', 'TABLODA', '6/6 SET · 1.800 M · 44:12', [('WU', 200), ('PS', 200), ('MS', 1000), ('AS', 200), ('CD', 200)]),
            ('26', 'EYLÜL', 'CUMARTESİ', 'q', 'KUYRUKTA', '3/3 SET · 2.400 M · 1:10:00', [('WU', 400), ('MS', 1600), ('CD', 400)]),
            ('25', 'EYLÜL', 'CUMA', 'ok', 'TABLODA', '3/4 SET · 1.800 M · 55:00', [('WU', 300), ('PS', 200), ('MS', 1200)]),
            ('23', 'EYLÜL', 'ÇARŞAMBA', 'ok', 'TABLODA', '8/8 SET · 2.400 M · 58:20', [('WU', 400), ('PS', 400), ('MS', 1200), ('CD', 400)])]
    lst = ''.join(f'<div class="r c"><div class="dt sk n">{d}<small>{m}</small></div><div class="inf"><div class="g"><span class="sk">{g}</span><span class="tag {t}">{tt}</span></div><div class="m n">{mm}</div>{gl(ss)}</div></div>' for d, m, g, t, tt, mm, ss in rows)
    body = f"""{top('YAPILMIŞ İDMANLAR')}
<div class="note">Bu telefonda saklanan seanslar. Buradan silmek tablodaki kayıtları etkilemez.</div>
<div>{lst}</div><div class="sp"></div><div class="dk c" style="color:#FF6B6B"><span class="sk">SİL…</span></div>"""
    if detay:
        sets = ''.join(f'<div class="s c"><i style="background:{BLOK[s[0]][0]}"></i><span class="sk">✓ {title(s)} {s[3]} {s[4]}</span><b class="n">{s[10]}</b></div>' for s in SETS)
        body += f"""<div class="dim"></div><div class="sheet c"><h3 class="sk">29 EYLÜL <span class="L">SALI</span></h3>
<div class="fx n">44:12 · 1.800 M · HAVUZ 25 · RPE 7</div>{sets}
<div class="red c" style="margin-top:8px"><span class="sk">BU KAYDI SİL</span></div><div style="text-align:center;font-family:Archivo;font-weight:800;color:#8A8A85">KAPAT</div></div>"""
    return page(css, body)


# --- Ayarlar -----------------------------------------------------------------------------
def ayarlar():
    css = BASE + f"""
.sec{{font-size:26px;letter-spacing:1px;display:flex;align-items:center;gap:10px;margin-top:4px}}.sec .ico{{color:{L}}}
.kv{{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1.5px solid #1E1E21;font-size:17px;color:#8A8A85;font-weight:600}}.kv b{{color:#F4F4F0;font-size:21px}}
.ok{{margin-left:auto;font-family:'Archivo';font-size:13px;font-weight:800;letter-spacing:1px;color:{L}}}
.two{{display:grid;grid-template-columns:1fr 1fr;gap:10px}}.two div{{height:58px;display:grid;place-items:center;background:#161618;font-size:22px;transform:skewX(-9deg)}}.two .r{{color:#FF6B6B}}
.tg{{margin-left:auto;width:76px;height:40px;background:{L};transform:skewX(-9deg);position:relative}}.tg i{{position:absolute;right:5px;top:5px;width:30px;height:30px;background:#0C0C0E}}
.d{{font-size:16px;color:#8A8A85;line-height:1.35}}
.css{{display:flex;align-items:center;gap:12px}}.css span{{width:64px;height:64px;display:grid;place-items:center;background:#161618;font-size:36px;transform:skewX(-9deg)}}
.css b{{flex:1;text-align:center;font-size:88px;line-height:.9;color:{L}}}.css b small{{font-size:24px;color:#8A8A85}}
.zb{{display:flex;gap:4px}}.zb div{{flex:1;transform:skewX(-9deg);padding:6px 0;text-align:center;color:#0C0C0E}}.zb b{{display:block;font-size:22px;line-height:1}}.zb small{{font-size:15px;font-weight:700}}
"""
    zones = [('Z1', '2:12+', '#60A5FA'), ('Z2', '2:05', '#34D399'), ('Z3', '2:00', '#FACC15'), ('Z4', '1:55', '#FB923C'), ('Z5', '<1:55', '#F87171')]
    zb = ''.join(f'<div style="background:{c}"><b class="c">{z}</b><small class="n">{p}</small></div>' for z, p, c in zones)
    body = f"""{top('AYARLAR')}
<div class="sec c"><span class="ico">{ic('link', 24)}</span><span class="sk">BAĞLANTI</span><span class="ok">● BAĞLI</span></div>
<div><div class="kv"><span>Adres</span><b class="n">SCRIPT.GOOGLE.COM/…/EXEC</b></div><div class="kv"><span>Anahtar</span><b class="n">•••••••• 3F2A</b></div></div>
<div class="two c"><div>DEĞİŞTİR</div><div class="r">ANAHTARI UNUT</div></div>
<div class="sec c"><span class="ico">{ic('sound', 24)}</span><span class="sk">ÇIKIŞ SESİ</span><span class="tg"><i></i></span></div>
<div class="d">Çıkışa son 3 sn kısa, çıkışta uzun bip. iPhone sessiz moddaysa çalmaz.</div>
<div class="dk c" style="height:58px;font-size:22px"><span class="sk">▶ SESİ DENE</span></div>
<div class="sec c"><span class="ico">{ic('pace', 24)}</span><span class="sk">TEMPO · CSS</span></div>
<div class="css c"><span>−</span><b class="n sk">1:57<small>/100</small></b><span>+</span></div>
<div class="zb">{zb}</div>
<div class="d">Ekipmanlı setlerde (Alet, Pull, Drill, Kick) bölge rengi verilmez.</div>
<div class="sp"></div><div style="text-align:center;font-size:13px;color:#55554F">SÜRÜM 9</div>"""
    return page(css, body)


PAGES = {'ana': ana, 'takvim': takvim, 'set': set_ekrani, 'kronometre': kronometre,
         'kaydet': lambda: kronometre(True), 'form': form, 'kaydedildi': kaydedildi,
         'gecmis': gecmis, 'gecmis-detay': lambda: gecmis(True), 'ayarlar': ayarlar}
