# Model 3 · Halka — veri odaklı: derin siyah, halkalar, camsı kartlar, camgöbeği→mor geçiş.
from common import *
import math

GRAD = 'linear-gradient(95deg,#22D3EE,#818CF8 55%,#E879F9)'
BASE = f"""
*{{box-sizing:border-box}}html,body{{margin:0}}
body{{width:440px;height:956px;overflow:hidden;font-family:'Archivo',sans-serif;color:#EEF0FF;-webkit-font-smoothing:antialiased}}
.phone{{position:relative;width:440px;height:956px;overflow:hidden;padding:58px 20px 30px;display:flex;flex-direction:column;gap:14px;
 background:radial-gradient(420px 380px at 50% 18%,rgba(99,102,241,.20),transparent 70%),radial-gradient(300px 260px at 90% 92%,rgba(34,211,238,.10),transparent 70%),#05060B}}
.n{{font-family:'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums}}
.mu{{color:#8087A8}}
.lbl{{font-size:11px;font-weight:800;letter-spacing:1.6px;color:#8087A8;text-transform:uppercase}}
.top{{display:flex;align-items:center;gap:12px}}
.ib{{width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.06);display:grid;place-items:center;color:#C7CBE6;flex:none}}
.h{{flex:1;font-size:26px;font-weight:800}}
.glass{{border-radius:28px;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.08)}}
.go{{height:80px;border-radius:40px;background:{GRAD};color:#0A0B18;display:flex;align-items:center;gap:14px;padding:0 10px 0 30px;font-size:24px;font-weight:800;box-shadow:0 16px 40px rgba(129,140,248,.35);flex:none}}
.go span{{flex:1}}.go i{{width:60px;height:60px;border-radius:50%;background:#0A0B18;color:#EEF0FF;display:grid;place-items:center;font-style:normal}}
.pill{{height:60px;border-radius:30px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;gap:10px;font-size:18px;font-weight:800;color:#C7CBE6;flex:none}}
.chip{{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:800}}
.chip.ok{{background:rgba(52,211,153,.16);color:#34D399}}.chip.q{{background:rgba(255,176,32,.16);color:#FFB020}}
.sp{{flex:1}}
"""


def ring(size, r, sw, frac, stroke, bg='rgba(255,255,255,.07)', glow=''):
    c = 2 * math.pi * r
    return (f'<circle cx="{size/2}" cy="{size/2}" r="{r}" fill="none" stroke="{bg}" stroke-width="{sw}"/>'
            f'<circle cx="{size/2}" cy="{size/2}" r="{r}" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" '
            f'stroke-dasharray="{c:.1f}" stroke-dashoffset="{c*(1-frac):.1f}" transform="rotate(-90 {size/2} {size/2})" {glow}/>')


GRADDEF = ('<defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22D3EE"/><stop offset=".55" stop-color="#818CF8"/>'
           '<stop offset="1" stop-color="#E879F9"/></linearGradient><linearGradient id="g2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#34D399"/>'
           '<stop offset="1" stop-color="#A3E635"/></linearGradient></defs>')


def donut(size, r, sw, parts, gap=0.012):
    """Blok renkli halka: parts = [(pay, renk)]."""
    tot = sum(p for p, _ in parts)
    c = 2 * math.pi * r
    out, acc = [], 0
    for p, col in parts:
        f = p / tot
        out.append(f'<circle cx="{size/2}" cy="{size/2}" r="{r}" fill="none" stroke="{col}" stroke-width="{sw}" '
                   f'stroke-dasharray="{c*max(0,f-gap):.1f} {c:.1f}" stroke-dashoffset="{-c*acc:.1f}" transform="rotate(-90 {size/2} {size/2})"/>')
        acc += f
    return ''.join(out)


def top(t, right=''):
    return f'<div class="top"><span class="ib">{ic("back", 24, 2.4)}</span><div class="h">{t}</div>{right}</div>'


# --- Ana sayfa ------------------------------------------------------------------------
def ana():
    css = BASE + """
.hi small{display:block;font-size:14px;font-weight:700;color:#8087A8}.hi b{font-size:24px;font-weight:800}
.ringw{position:relative;align-self:center;width:300px;height:300px}.ringw svg{position:absolute;inset:0}
.mid{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.mid b{font-size:74px;font-weight:700;line-height:.95}.mid span{font-size:20px;font-weight:700;color:#A5ABCF}
.leg{display:flex;justify-content:center;gap:20px;font-size:14px;font-weight:700;color:#A5ABCF;margin-top:-4px}.leg i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px}
.today{padding:18px}.th{display:flex;align-items:baseline;justify-content:space-between}.th b{font-size:22px;font-weight:800}.th .n{font-size:26px;font-weight:700;color:#A5ABCF}
.zones{display:flex;height:14px;border-radius:7px;overflow:hidden;gap:2px;margin-top:14px}
.zl{display:flex;justify-content:space-between;font-size:12px;font-weight:800;color:#8087A8;margin-top:6px}
.kv{display:grid;grid-template-columns:repeat(3,1fr);margin-top:12px}.kv b{font-size:30px;font-weight:700}
.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.pl{justify-content:flex-start;padding:0 18px}.pl small{display:block;font-size:12px;font-weight:700;color:#8087A8}.pl.dim{color:#4E5372}
"""
    body = f"""<div class="top"><div class="hi" style="flex:1"><small>Salı · 29 Eylül</small><b>Bugün havuz günü</b></div><span class="ib">{ic('gear', 22)}</span></div>
<div class="ringw"><svg viewBox="0 0 300 300">{GRADDEF}{ring(300, 132, 22, .17, 'url(#g1)', glow='style="filter:drop-shadow(0 0 10px rgba(129,140,248,.6))"')}{ring(300, 102, 18, 1/3, 'url(#g2)')}</svg>
<div class="mid"><span class="lbl">BU HAFTA</span><b class="n">1.200</b><span class="n">/ 6.900 m</span></div></div>
<div class="leg"><span><i style="background:#818CF8"></i>Mesafe %17</span><span><i style="background:#34D399"></i>İdman 1/3</span></div>
<div class="glass today"><div class="th"><b>Bugün · 6 set</b><span class="n">1.800 m · 41:30</span></div>
<div class="zones"><i style="flex:9;background:#60A5FA"></i><i style="flex:10;background:#34D399"></i><i style="flex:5;background:#FACC15"></i><i style="flex:14;background:#FB923C"></i><i style="flex:3;background:#F87171"></i></div>
<div class="zl"><span>Z1 9′</span><span>Z2 10′</span><span>Z3 5′</span><span>Z4 14′</span><span>Z5 3′</span></div>
<div class="kv"><div><span class="lbl">ANA SET</span><b class="n" style="display:block">1.000 m</b></div><div><span class="lbl">HEDEF TEMPO</span><b class="n" style="display:block">1:55</b></div><div><span class="lbl">SONRAKİ</span><b class="n" style="display:block">Cuma</b></div></div></div>
<div class="go"><span>Yüzmeye başla</span><i>{ic('arrow', 28, 2.6)}</i></div>
<div class="row"><div class="pill pl">{ic('list', 22)}<span>Geçmiş<small>4 kayıt · 1 bekliyor</small></span></div><div class="pill pl dim">{ic('gym', 22)}<span>Salon<small>Yakında</small></span></div></div>"""
    return page(css, body)


# --- Hafta takvimi ----------------------------------------------------------------------
def takvim():
    css = BASE + """
.wkh{display:flex;justify-content:space-between;align-items:baseline}.wkh b{font-size:20px;font-weight:800}.wkh span{font-size:20px;font-weight:700;color:#A5ABCF}
.wk{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center}
.wk div{padding:8px 0;border-radius:22px}.wk small{display:block;font-size:12px;font-weight:700;color:#8087A8}
.wk svg{display:block;margin:4px auto 0}.wk .on{background:rgba(129,140,248,.18);box-shadow:inset 0 0 0 1px rgba(129,140,248,.5)}
.hero{padding:18px;display:grid;grid-template-columns:150px 1fr;gap:16px;align-items:center}
.dn{position:relative;width:150px;height:150px}.dn svg{position:absolute;inset:0}.dn .c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.dn .c b{font-size:46px;font-weight:700;line-height:.95}.dn .c span{font-size:14px;font-weight:700;color:#A5ABCF}
.hd small{display:inline-block;font-size:12px;font-weight:800;letter-spacing:1.4px;padding:4px 10px;border-radius:999px;background:linear-gradient(95deg,#22D3EE,#818CF8);color:#0A0B18}
.hd b{display:block;font-size:30px;font-weight:800;margin-top:8px;line-height:1.1}.hd .n{font-size:24px;font-weight:700;color:#A5ABCF;margin-top:6px}
.lg{display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;margin-top:10px;font-size:13px;font-weight:700;color:#A5ABCF}.lg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}
.zb{padding:14px 18px}.zones{display:flex;height:12px;border-radius:6px;overflow:hidden;gap:2px;margin-top:10px}
.r{display:flex;align-items:center;gap:14px;padding:12px 16px}.r .dt{width:52px;text-align:center}.r .dt b{display:block;font-size:34px;font-weight:700;line-height:1}.r .dt small{font-size:11px;font-weight:800;color:#8087A8}
.r .g{font-size:19px;font-weight:800}.r .m{font-size:19px;font-weight:700;color:#A5ABCF}
"""
    def mini(frac, col, on=False):
        return f'<svg width="38" height="38" viewBox="0 0 38 38">{GRADDEF if on else ""}{ring(38, 15, 5, frac, "url(#g1)" if on else col)}</svg>'
    days = [('Pzt', 28, .35, '#6B7194'), ('Sal', 29, .52, None), ('Çar', 30, 0, '#333'), ('Per', 1, 0, '#333'), ('Cum', 2, 1, '#C7CBE6'), ('Cmt', 3, 0, '#333'), ('Paz', 4, 0, '#333')]
    wk = ''.join(f'<div class="{"on" if c is None else ""}"><small>{d}</small><b class="n" style="font-size:22px">{n}</b>{mini(f, c or "", c is None)}</div>' for d, n, f, c in days)
    parts = [(dd, BLOK[s[0]][0]) for s, dd in zip(SETS, DIST)]
    body = f"""{top('Yüzme', f'<span class="ib">{ic("refresh", 22)}</span>')}
<div class="wkh"><b>Bu hafta</b><span class="n">3 idman · 6.900 m</span></div>
<div class="wk">{wk}</div>
<div class="glass hero"><div class="dn"><svg viewBox="0 0 150 150">{donut(150, 62, 16, parts)}</svg><div class="c"><b class="n">1.800</b><span>metre</span></div></div>
<div class="hd"><small>● BUGÜN</small><b>29 Eylül<br>Salı</b><div class="n">6 set · 41:30</div>
<div class="lg"><span><i style="background:#3B82F6"></i>Isınma</span><span><i style="background:#FF8A3D"></i>Ana 1.000</span><span><i style="background:#8B5CF6"></i>Hazırlık</span><span><i style="background:#2DD4BF"></i>Soğuma</span></div></div></div>
<div class="glass zb"><div style="display:flex;justify-content:space-between"><span class="lbl">SÜRENİN BÖLGELERE DAĞILIMI</span><span class="lbl" style="color:#FB923C">AĞIRLIK Z4</span></div>
<div class="zones"><i style="flex:9;background:#60A5FA"></i><i style="flex:10;background:#34D399"></i><i style="flex:5;background:#FACC15"></i><i style="flex:14;background:#FB923C"></i><i style="flex:3;background:#F87171"></i></div></div>
<div class="glass r"><div class="dt"><b class="n">2</b><small>EKİ</small></div><div style="flex:1"><div class="g">Cuma</div><div class="m n">11 set · 3.900 m · 1:12:00</div></div><svg width="44" height="44" viewBox="0 0 44 44">{ring(44, 17, 6, 1, '#6B7194')}</svg></div>
<div class="glass r" style="opacity:.5"><div class="dt"><b class="n">28</b><small>EYL</small></div><div style="flex:1"><div class="g">Pazartesi · yapıldı</div><div class="m n">5 set · 1.200 m · 28:40</div></div><span class="chip ok">✓</span></div>
<div class="sp"></div><div class="go"><span>Bugünün idmanını aç</span><i>{ic('arrow', 28, 2.6)}</i></div>"""
    return page(css, body)


# --- Set ekranı --------------------------------------------------------------------------
def set_ekrani():
    css = BASE + """
.phone{gap:10px}
.hdr{display:grid;grid-template-columns:52px 56px minmax(0,1fr) 52px;gap:8px;align-items:center}
.pr{position:relative;width:56px;height:56px}.pr svg{position:absolute;inset:0}.pr b{position:absolute;inset:0;display:grid;place-items:center;font-size:15px;font-weight:700}
.st b{display:block;font-size:34px;font-weight:700;line-height:1;white-space:nowrap}.st .d{color:#4E5372}
.seg{display:flex;gap:3px;height:6px}.seg i{border-radius:3px;opacity:.25}.seg .on{opacity:1}.seg .cur{opacity:1;box-shadow:0 0 10px #FF8A3D}
.line{position:relative;flex:1;margin-top:4px}
.rail{position:absolute;left:79px;width:3px;border-radius:2px}
.stop{position:absolute;left:0;right:0;display:grid;grid-template-columns:60px 20px 1fr;gap:10px;align-items:center;height:36px}
.stop .t{text-align:right;font-size:22px;font-weight:700;color:#8087A8}.stop .q{width:14px;height:14px;border-radius:50%;justify-self:center;border:3px solid}
.stop .nm{font-size:19px;font-weight:700;color:#A5ABCF;white-space:nowrap}.stop.done .nm{color:#4E5372;text-decoration:line-through}.stop.done .q{background:currentColor}
.act{position:absolute;left:0;right:0;top:84px;bottom:84px;display:grid;grid-template-columns:60px 1fr;gap:10px}
.act .t{text-align:right;font-size:26px;font-weight:700;padding-top:18px;background:linear-gradient(#22D3EE,#E879F9);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1.1}.act .t small{display:block;font-size:16px;color:#8087A8;-webkit-text-fill-color:#8087A8}
.card{position:relative;padding:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 0 0 1px rgba(255,138,61,.35),0 20px 60px rgba(255,138,61,.12)}
.card:before{content:'';position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:radial-gradient(rgba(255,138,61,.22),transparent 70%)}
.tg{font-size:12px;font-weight:800;letter-spacing:1.6px;color:#FF8A3D}
.ti{font-size:84px;font-weight:700;line-height:.95;margin-top:6px}.su{font-size:30px;font-weight:700;color:#FF8A3D}
.de{font-size:23px;font-weight:500;line-height:1.3;margin-top:10px;color:#D6D9F0}
.gs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:auto}
.gs div{position:relative;border-radius:20px;background:rgba(0,0,0,.3);padding:10px 10px;display:flex;align-items:center;gap:8px;min-width:0}
.gs b{display:block;font-size:42px;font-weight:700;line-height:1}
.ft{display:flex;justify-content:space-between;margin-top:10px;font-size:20px;font-weight:700;color:#A5ABCF}
.zc{padding:2px 9px;border-radius:999px;background:rgba(251,146,60,.18);color:#FB923C;font-size:14px}
.dock{display:grid;grid-template-columns:64px 1fr 64px;gap:10px;align-items:center}
.rb{width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);display:grid;place-items:center;color:#C7CBE6}
.dock .go{height:72px;justify-content:center;padding:0;font-size:22px}
"""
    stop = lambda pos, t, c, nm, cls='': f'<div class="stop {cls}" style="{pos};color:{c}"><span class="t n">{t}</span><i class="q"></i><span class="nm">{nm}</span></div>'
    seg = ''.join(f'<i class="{"on" if i < 2 else "cur" if i == 2 else ""}" style="flex:{d};background:{BLOK[x[0]][0]}"></i>' for i, (x, d) in enumerate(zip(SETS, DIST)))
    body = f"""<div class="hdr"><span class="ib">{ic('back', 24, 2.4)}</span><div class="pr"><svg viewBox="0 0 64 64" width="56" height="56">{GRADDEF}{ring(64, 26, 7, 12.6/41.5, 'url(#g1)')}</svg><b class="n">30%</b></div>
<div class="st"><span class="lbl">SÜRE / HEDEF</span><b class="n">12:35<span class="d"> / 41:30</span></b></div><span class="ib">{ic('lock', 20)}</span></div>
<div style="display:flex;align-items:center;gap:12px"><div class="seg" style="flex:1">{seg}</div><span class="n" style="font-size:20px;font-weight:700">400<span style="color:#4E5372">/1.800 m</span></span></div>
<div class="line">
<div class="rail" style="top:0;height:84px;background:linear-gradient(#3B82F6,#8B5CF6)"></div><div class="rail" style="top:84px;bottom:84px;background:#FF8A3D;box-shadow:0 0 10px #FF8A3D"></div><div class="rail" style="bottom:0;height:84px;background:linear-gradient(#FF8A3D,#FACC15);opacity:.4"></div>
{stop('top:4px', '4:20', '#3B82F6', '1 × 200 FR Swim', 'done')}{stop('top:42px', '9:40', '#8B5CF6', '4 × 50 FR Drill', 'done')}
<div class="act"><div class="t n">18:40<small>+9:00</small></div><div class="glass card"><span class="tg">MS · ANA SET · 3/6</span><div class="ti n">4 × 100</div><div class="su n">FR · Swim</div><div class="de">{SETS[2][5]}</div>
<div class="gs"><div><svg width="40" height="40" viewBox="0 0 40 40">{ring(40, 15, 5, .9, '#E879F9')}</svg><span><span class="lbl">HEDEF</span><b class="n">1:55</b></span></div><div><svg width="40" height="40" viewBox="0 0 40 40">{ring(40, 15, 5, .15, '#22D3EE')}</svg><span><span class="lbl">DİNLEN</span><b class="n">0:20</b></span></div></div>
<div class="ft n"><span>Tempo 1:55/100 <span class="zc">Z4</span></span><span>400 / 800 m</span></div></div></div>
{stop('bottom:42px', '31:40', '#FF8A3D', '2 × 300 FR Pull')}{stop('bottom:4px', '37:00', '#FACC15', '4 × 50 BK Swim')}
</div>
<div class="dock"><span class="rb">{ic('watch', 26)}</span><div class="go"><span style="flex:none">{ic('check', 26, 2.8)}</span><span style="flex:none">Seti tamamla</span></div><span class="rb" style="color:#F87171">{ic('flag', 24)}</span></div>"""
    return page(css, body)


# --- Kronometre (+ Kaydet paneli) -------------------------------------------------------------
def kronometre(sheet=False):
    css = BASE + """
.phone{gap:12px;padding-top:54px}
.strip{display:flex;align-items:center;gap:10px}.strip .ttl{flex:1;text-align:center;font-size:17px;font-weight:700;color:#A5ABCF;white-space:nowrap}
.strip .ttl b{color:#EEF0FF}
.rw{position:relative;align-self:center;width:400px;height:400px;margin-top:6px}.rw svg{position:absolute;inset:0}
.rw .c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.rw .tag{font-size:14px;font-weight:800;letter-spacing:1.6px;color:#A5ABCF}
.rw .dg{font-size:150px;font-weight:700;line-height:.9;letter-spacing:-2px;transform:scaleY(1.25)}.rw .dg small{font-size:62px;background:linear-gradient(#22D3EE,#E879F9);-webkit-background-clip:text;background-clip:text;color:transparent}
.rw .hd{font-size:22px;font-weight:700;color:#A5ABCF;margin-top:14px}.rw .hd b{color:#34D399}
.reps{display:flex;gap:6px;margin-top:10px}.reps i{width:26px;height:8px;border-radius:4px;background:rgba(255,255,255,.1)}.reps .ok{background:#34D399}.reps .now{background:#818CF8;box-shadow:0 0 10px #818CF8}
.inf{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.inf div{padding:12px;text-align:center}.inf b{display:block;font-size:40px;font-weight:700;line-height:1.05}.inf small{font-size:14px;font-weight:700;color:#FB923C}
.ctl{flex:1;display:flex;align-items:center;justify-content:space-around}
.sb{width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);display:grid;place-items:center;color:#C7CBE6}
.tur{width:150px;height:150px;border-radius:50%;background:conic-gradient(from 200deg,#22D3EE,#818CF8,#E879F9,#22D3EE);display:grid;place-items:center;box-shadow:0 0 50px rgba(129,140,248,.45)}
.tur span{width:132px;height:132px;border-radius:50%;background:#0A0B18;display:grid;place-items:center;font-size:40px;font-weight:800;letter-spacing:2px}
.dim{position:absolute;inset:0;background:rgba(3,4,10,.72);backdrop-filter:blur(3px)}
.sheet{position:absolute;left:0;right:0;bottom:0;border-radius:34px 34px 0 0;background:#10121E;border-top:1px solid rgba(255,255,255,.1);padding:14px 20px 30px;display:flex;flex-direction:column;gap:12px}
.grab{width:44px;height:5px;border-radius:3px;background:rgba(255,255,255,.2);align-self:center}
.sheet h3{margin:0;font-size:24px}
.pick{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:20px;background:rgba(255,255,255,.05);border:1px solid rgba(129,140,248,.5)}.pick b{flex:1;font-size:24px}.pick em{font-style:normal;font-size:14px;font-weight:800;color:#818CF8}
.laps{display:flex;gap:8px;flex-wrap:wrap}.laps span{padding:8px 14px;border-radius:999px;background:rgba(52,211,153,.14);color:#34D399;font-size:22px;font-weight:700}.laps span.r{background:rgba(248,113,113,.14);color:#F87171}
.avg{display:flex;align-items:center;gap:18px}.avg b{font-size:60px;font-weight:700;line-height:1}
.opt{height:74px;border-radius:24px;display:flex;align-items:center;gap:12px;padding:0 20px;font-size:19px;font-weight:800}.opt small{display:block;font-size:13px;font-weight:600;opacity:.7}
.o1{background:linear-gradient(95deg,#22D3EE,#818CF8 55%,#E879F9);color:#0A0B18}.o2{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08)}
.cn{text-align:center;font-weight:800;color:#8087A8}
"""
    body = f"""<div class="strip"><span class="ib">{ic('x', 22, 2.4)}</span><div class="ttl"><b>4 × 100 FR Swim</b> · @2:15</div><span class="ib">{ic('lock', 20)}</span><span class="ib">{ic('reset', 20)}</span></div>
<div class="rw"><svg viewBox="0 0 400 400">{GRADDEF}{ring(400, 184, 22, 48.6/115, 'url(#g1)', glow='style="filter:drop-shadow(0 0 12px rgba(129,140,248,.7))"')}
<line x1="{200+184*math.sin(2*math.pi):.1f}" y1="4" x2="200" y2="30" stroke="#EEF0FF" stroke-width="5" stroke-linecap="round" transform="rotate(0 200 200)"/></svg>
<div class="c"><span class="tag">2. TEKRAR / 4</span><div class="dg n">0:48<small>.6</small></div><div class="hd n">hedef 1:55 · kalan <b>66.4</b></div><div class="reps"><i class="ok"></i><i class="now"></i><i></i><i></i></div></div></div>
<div class="inf"><div class="glass"><span class="lbl">HEDEFE</span><b class="n" style="color:#34D399">66.4</b></div><div class="glass"><span class="lbl">ÇIKIŞA</span><b class="n">1:26</b></div><div class="glass"><span class="lbl">SON TUR</span><b class="n">1:52.8</b><small class="n">1:53/100 · Z4</small></div></div>
<div class="ctl"><span class="sb" style="color:#F87171">{ic('stop', 26)}</span><div class="tur"><span>TUR</span></div><span class="sb">{ic('save', 26)}</span></div>"""
    if sheet:
        laps = ''.join(f'<span class="n{" r" if t > "1:55" else ""}">{t}</span>' for t in ['1:52.8', '1:54.1', '1:53.4', '1:55.0'])
        body += f"""<div class="dim"></div><div class="sheet"><div class="grab"></div><h3>Kaydet</h3>
<div class="pick"><i style="width:14px;height:14px;border-radius:50%;background:#FF8A3D"></i><b class="n">4 × 100 FR Swim</b><em>Değiştir</em></div>
<div class="laps">{laps}</div>
<div class="avg"><svg width="64" height="64" viewBox="0 0 64 64">{GRADDEF}{ring(64, 26, 8, 113.8/115, 'url(#g1)')}</svg><div><span class="lbl">ORTALAMA · 4 TUR · HEDEFİN 1.2 SN ALTINDA</span><b class="n" style="display:block">1:53.8</b></div></div>
<div class="opt o1">{ic('check', 26, 2.8)}<span>Ortalama → Gerçek<small>Gerçek sütununa 01:53.8 yazılır</small></span></div>
<div class="opt o2">{ic('save', 24)}<span>Ortalama + turlar → Not<small>Not: 1:52.8, 1:54.1, 1:53.4, 1:55.0</small></span></div>
<div class="cn">Vazgeç</div></div>"""
    return page(css, body)


# --- Seans sonu -------------------------------------------------------------------------------
def form():
    css = BASE + """
.phone{gap:12px}
.sum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.sum div{position:relative;height:118px}.sum svg{position:absolute;left:50%;top:0;margin-left:-59px}
.sum .c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}.sum b{font-size:28px;font-weight:700;line-height:1}
.sec{font-size:12px;font-weight:800;letter-spacing:1.6px;color:#8087A8;margin-bottom:-4px}
.seg{display:grid;grid-template-columns:1fr 1fr;padding:5px;border-radius:30px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}
.seg span{height:50px;border-radius:25px;display:grid;place-items:center;font-size:20px;font-weight:800;color:#8087A8}.seg .on{background:#EEF0FF;color:#0A0B18}
.dial{position:relative;align-self:center;width:300px;height:160px}.dial svg{position:absolute;inset:0}
.dial .c{position:absolute;left:0;right:0;bottom:0;text-align:center}.dial b{font-size:60px;font-weight:700;line-height:.9}.dial span{display:block;font-size:16px;font-weight:800;color:#FB923C}
.msi{display:flex;flex-wrap:wrap;gap:8px}.msi span{padding:10px 14px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);font-size:16px;font-weight:700;color:#A5ABCF}
.msi .a{background:rgba(251,146,60,.16);border-color:#FB923C;color:#FDBA74}.msi .b{background:rgba(250,204,21,.14);border-color:#FACC15;color:#FDE047}
.msi b{margin-left:6px}
.nt{border-radius:20px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);padding:12px 16px;font-size:17px;color:#C7CBE6}
"""
    # RPE yarım halka: 0-10, seçili 7
    cx, cy, r = 150, 150, 120
    arcs = []
    cols = ['#34D399', '#34D399', '#6EE7B7', '#A3E635', '#D9F99D', '#FDE047', '#FACC15', '#FDBA74', '#FB923C', '#F87171', '#EF4444']
    for k in range(11):
        a0 = math.pi + k * math.pi / 11 + 0.02
        a1 = math.pi + (k + 1) * math.pi / 11 - 0.02
        x0, y0 = cx + r * math.cos(a0), cy + r * math.sin(a0)
        x1, y1 = cx + r * math.cos(a1), cy + r * math.sin(a1)
        op = '1' if k <= 7 else '.22'
        arcs.append(f'<path d="M{x0:.1f} {y0:.1f} A{r} {r} 0 0 1 {x1:.1f} {y1:.1f}" stroke="{cols[k]}" stroke-width="{26 if k == 7 else 20}" fill="none" opacity="{op}" stroke-linecap="butt"/>')
    ak = math.pi + 7.5 * math.pi / 11
    needle = f'<circle cx="{cx + r*math.cos(ak):.1f}" cy="{cy + r*math.sin(ak):.1f}" r="15" fill="#05060B" stroke="#EEF0FF" stroke-width="4"/>'
    sm = lambda frac, col, v, l: f'<div><svg width="118" height="118" viewBox="0 0 118 118">{GRADDEF}{ring(118, 50, 9, frac, col)}</svg><div class="c"><b class="n">{v}</b><span class="lbl">{l}</span></div></div>'
    body = f"""{top('Seans sonu', '<span class="mu" style="font-weight:700">29 Eylül</span>')}
<div class="sum">{sm(44.2/41.5 if False else 1, 'url(#g1)', '44:12', 'SÜRE ✎')}{sm(1, 'url(#g2)', '1.800', 'METRE')}{sm(1, '#FB923C', '6/6', 'SET')}</div>
<div class="sec">HAVUZ</div><div class="seg"><span class="on">25 m</span><span>50 m</span></div>
<div class="sec">ZORLUK · RPE</div>
<div class="dial"><svg viewBox="0 0 300 160">{''.join(arcs)}{needle}</svg><div class="c"><b class="n">7</b><span>ZOR</span></div></div>
<div class="sec">MSI · DOKUNULMAYAN KAYDEDİLMEZ</div>
<div class="msi"><span class="a">Sağ omuz<b>1</b></span><span class="b">Bel<b>0,5</b></span><span>Sol omuz</span><span>Sağ diz</span><span>Sol diz</span><span>Kalça</span><span>Boyun</span></div>
<div class="nt">Ana set iyi geçti, son 2 tekrarda omuz…</div>
<div class="sp"></div><div class="go"><span>Kaydet ve gönder</span><i>{ic('arrow', 28, 2.6)}</i></div>"""
    return page(css, body)


# --- Kaydedildi -------------------------------------------------------------------------------
def kaydedildi():
    css = BASE + """
.phone{padding-top:84px;gap:16px}
.rw{position:relative;align-self:center;width:260px;height:260px}.rw>svg{position:absolute;inset:0}
.rw .c{position:absolute;inset:0;display:grid;place-items:center;color:#EEF0FF}
h1{margin:0;text-align:center;font-size:40px;font-weight:800}.d{text-align:center;font-size:17px;font-weight:700;color:#8087A8;margin-top:-10px}
.leg{display:flex;justify-content:center;gap:16px;font-size:15px;font-weight:700;color:#A5ABCF}.leg i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px}
.ck{padding:6px 18px}.ck div{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:17px;font-weight:600}.ck div:last-child{border:0}
.ck i{width:28px;height:28px;border-radius:50%;background:rgba(52,211,153,.16);color:#34D399;display:grid;place-items:center}.ck small{margin-left:auto;font-size:18px;font-weight:700;color:#A5ABCF}
"""
    ck = ''.join(f'<div><i>{ic("check", 15, 3)}</i>{a}<small class="n">{b}</small></div>' for a, b in [('eski sayfası', '6 set yazıldı'), ('seans sayfası', 'özet yazıldı'), ('arsiv sayfası', '6 plan satırı'), ('Bu telefonda', 'saklandı')])
    body = f"""<div class="rw"><svg viewBox="0 0 260 260">{GRADDEF}{ring(260, 118, 18, 1, 'url(#g1)', glow='style="filter:drop-shadow(0 0 14px rgba(129,140,248,.7))"')}{ring(260, 92, 16, 1, 'url(#g2)')}{ring(260, 68, 14, 1, '#FB923C')}</svg><div class="c">{ic('check', 64, 3)}</div></div>
<h1>Kaydedildi</h1><div class="d">Salı · 29 Eylül · üç halka tamam</div>
<div class="leg"><span class="n"><i style="background:#818CF8"></i>44:12</span><span class="n"><i style="background:#34D399"></i>1.800 m</span><span class="n"><i style="background:#FB923C"></i>6/6 set</span></div>
<div class="glass ck">{ck}</div>
<div class="sp"></div><div class="go"><span>Ana sayfaya dön</span><i>{ic('arrow', 28, 2.6)}</i></div><div class="pill">Yapılmış idmanlar</div>"""
    return page(css, body)


# --- Yapılmış idmanlar (+ detay) ----------------------------------------------------------------
def gecmis(detay=False):
    css = BASE + """
.note{font-size:15px;color:#8087A8;margin-top:-4px}
.sumw{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.sumw div{padding:12px 14px}.sumw b{display:block;font-size:30px;font-weight:700}
.r{display:flex;align-items:center;gap:14px;padding:14px 16px}
.rg{position:relative;width:62px;height:62px;flex:none}.rg svg{position:absolute;inset:0}.rg b{position:absolute;inset:0;display:grid;place-items:center;font-size:24px;font-weight:700}
.r .g{display:flex;align-items:center;gap:8px;font-size:19px;font-weight:800}.r .m{font-size:18px;font-weight:700;color:#A5ABCF;margin-top:3px}
.dim{position:absolute;inset:0;background:rgba(3,4,10,.72);backdrop-filter:blur(3px)}
.sheet{position:absolute;left:0;right:0;bottom:0;border-radius:34px 34px 0 0;background:#10121E;border-top:1px solid rgba(255,255,255,.1);padding:14px 20px 30px;display:flex;flex-direction:column;gap:10px}
.grab{width:44px;height:5px;border-radius:3px;background:rgba(255,255,255,.2);align-self:center}
.sheet h3{margin:0;font-size:26px}.fx{font-size:18px;font-weight:700;color:#A5ABCF}
.s{display:flex;align-items:center;gap:12px;font-size:18px;font-weight:700;padding:5px 0}.s i{width:10px;height:10px;border-radius:50%;flex:none}.s span{flex:1}.s b{font-size:20px;color:#34D399}
.del{height:64px;border-radius:32px;background:rgba(248,113,113,.14);border:1px solid rgba(248,113,113,.4);color:#F87171;display:grid;place-items:center;font-size:19px;font-weight:800}
"""
    rows = [('29', 'Salı · 29 Eylül', 'ok', 'Tabloda', '6/6 set · 1.800 m · 44:12', 1, [('WU', 200), ('PS', 200), ('MS', 1000), ('AS', 200), ('CD', 200)]),
            ('26', 'Cumartesi · 26 Eylül', 'q', 'Kuyrukta', '3/3 set · 2.400 m · 1:10:00', 1, [('WU', 400), ('MS', 1600), ('CD', 400)]),
            ('25', 'Cuma · 25 Eylül', 'ok', 'Tabloda', '3/4 set · 1.800 m · 55:00', .75, [('WU', 300), ('PS', 200), ('MS', 1200), ('CD', 300)]),
            ('23', 'Çarşamba · 23 Eylül', 'ok', 'Tabloda', '8/8 set · 2.400 m · 58:20', 1, [('WU', 400), ('PS', 400), ('MS', 1200), ('CD', 400)])]
    lst = ''.join(f'<div class="glass r"><div class="rg"><svg viewBox="0 0 62 62">{donut(62, 25, 7, [(d, BLOK[b][0]) for b, d in ss])}</svg><b class="n">{d}</b></div>'
                  f'<div style="flex:1"><div class="g">{g}<span class="chip {t}">{tt}</span></div><div class="m n">{mm}</div></div></div>' for d, g, t, tt, mm, f, ss in rows)
    body = f"""{top('Yapılmış idmanlar', f'<span class="ib" style="color:#F87171">{ic("trash", 20)}</span>')}
<div class="note">Bu telefonda saklanan seanslar. Buradan silmek tablodaki kayıtları etkilemez.</div>
<div class="sumw"><div class="glass"><span class="lbl">SEANS</span><b class="n">4</b></div><div class="glass"><span class="lbl">MESAFE</span><b class="n">8.400</b></div><div class="glass"><span class="lbl">SÜRE</span><b class="n">3:47</b></div></div>
{lst}"""
    if detay:
        sets = ''.join(f'<div class="s"><i style="background:{BLOK[s[0]][0]}"></i><span>✓ {title(s)} {s[3]} {s[4]}</span><b class="n">{s[10]}</b></div>' for s in SETS)
        body += f"""<div class="dim"></div><div class="sheet"><div class="grab"></div><h3>Salı · 29 Eylül</h3>
<div class="fx n">44:12 · 1.800 m · Havuz 25 · RPE 7 · MSI sağ omuz 1</div>{sets}
<div class="del">Bu kaydı sil</div><div style="text-align:center;font-weight:800;color:#8087A8">Kapat</div></div>"""
    return page(css, body)


# --- Ayarlar -----------------------------------------------------------------------------------
def ayarlar():
    css = BASE + """
.grp{padding:4px 18px}.it{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:18px;font-weight:700}.it:last-child{border:0}
.it .ico{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;flex:none}.it small{margin-left:auto;font-size:16px;color:#8087A8;font-weight:700}
.sec{font-size:12px;font-weight:800;letter-spacing:1.6px;color:#8087A8;margin:4px 0 -6px 6px}
.tg{margin-left:auto;width:58px;height:34px;border-radius:17px;background:linear-gradient(95deg,#22D3EE,#818CF8);position:relative}.tg i{position:absolute;right:3px;top:3px;width:28px;height:28px;border-radius:50%;background:#fff}
.cssw{position:relative;align-self:center;width:300px;height:170px}.cssw svg{position:absolute;inset:0}
.cssw .c{position:absolute;left:0;right:0;bottom:6px;text-align:center}.cssw b{font-size:62px;font-weight:700;line-height:.9}.cssw span{display:block;font-size:14px;font-weight:800;color:#8087A8;letter-spacing:1.4px}
.pm{position:absolute;bottom:10px;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.07);display:grid;place-items:center;font-size:28px;font-weight:700}
.zl{display:flex;justify-content:space-between;font-size:14px;font-weight:800;padding:0 4px}
"""
    zc = ['#60A5FA', '#34D399', '#FACC15', '#FB923C', '#F87171']
    cx, cy, r = 150, 160, 130
    arcs = []
    for k in range(5):
        a0 = math.pi + k * math.pi / 5 + 0.03
        a1 = math.pi + (k + 1) * math.pi / 5 - 0.03
        arcs.append(f'<path d="M{cx + r*math.cos(a0):.1f} {cy + r*math.sin(a0):.1f} A{r} {r} 0 0 1 {cx + r*math.cos(a1):.1f} {cy + r*math.sin(a1):.1f}" stroke="{zc[k]}" stroke-width="16" fill="none" stroke-linecap="round"/>')
    body = f"""{top('Ayarlar')}
<div class="sec">BAĞLANTI</div>
<div class="glass grp"><div class="it"><span class="ico" style="background:rgba(52,211,153,.16);color:#34D399">{ic('link', 20)}</span>Tablo<small style="color:#34D399">● Bağlı</small></div>
<div class="it"><span class="ico" style="background:rgba(255,255,255,.06);color:#C7CBE6">{ic('list', 20)}</span>Adres<small class="n" style="font-size:18px">script.google.com/…/exec</small></div>
<div class="it"><span class="ico" style="background:rgba(255,255,255,.06);color:#C7CBE6">{ic('lock', 20)}</span>Anahtar<small class="n" style="font-size:18px">•••• 3f2a ›</small></div>
<div class="it" style="color:#F87171"><span class="ico" style="background:rgba(248,113,113,.14)">{ic('x', 18)}</span>Anahtarı unut</div></div>
<div class="sec">ÇIKIŞ SESİ</div>
<div class="glass grp"><div class="it"><span class="ico" style="background:rgba(129,140,248,.18);color:#A5B4FC">{ic('sound', 20)}</span>3-2-1 ve çıkış bip<span class="tg"><i></i></span></div>
<div class="it"><span class="ico" style="background:rgba(255,255,255,.06);color:#C7CBE6">{ic('play', 18)}</span>Sesi dene<small>sessiz modda çalmaz</small></div></div>
<div class="sec">TEMPO · CSS</div>
<div class="glass" style="padding:14px 18px 16px;display:flex;flex-direction:column;gap:6px"><div class="cssw"><svg viewBox="0 0 300 170">{''.join(arcs)}<circle cx="{cx + r*math.cos(math.pi*1.7):.1f}" cy="{cy + r*math.sin(math.pi*1.7):.1f}" r="12" fill="#05060B" stroke="#EEF0FF" stroke-width="4"/></svg>
<span class="pm" style="left:0">−</span><span class="pm" style="right:0">+</span><div class="c"><b class="n">1:57</b><span>/100 M · CSS</span></div></div>
<div class="zl n"><span style="color:#60A5FA">Z1 2:12+</span><span style="color:#34D399">Z2 2:05</span><span style="color:#FACC15">Z3 2:00</span><span style="color:#FB923C">Z4 1:55</span><span style="color:#F87171">Z5</span></div></div>
<div class="sp"></div><div style="text-align:center;font-size:13px;color:#4E5372">Sürüm 9</div>"""
    return page(css, body)


PAGES = {'ana': ana, 'takvim': takvim, 'set': set_ekrani, 'kronometre': kronometre,
         'kaydet': lambda: kronometre(True), 'form': form, 'kaydedildi': kaydedildi,
         'gecmis': gecmis, 'gecmis-detay': lambda: gecmis(True), 'ayarlar': ayarlar}
