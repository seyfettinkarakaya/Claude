# Yeni zamanlama modeli: idman ekranı (Sürüm 8 görünümü — koyu zemin, sarı vurgu, metro hattı)
import os

FONTS = '/home/user/Claude/fonts/fonts.css'
OUT = os.path.join(os.path.dirname(__file__), 'html')
os.makedirs(OUT, exist_ok=True)

C = {'WU': '#2563EB', 'PS': '#7C3AED', 'MS': '#F97316', 'AS': '#FACC15', 'CD': '#14B8A6'}
SEG = [('WU', 200), ('PS', 200), ('MS', 400), ('AS', 200), ('CD', 200)]

CSS = """
*{box-sizing:border-box}html,body{margin:0}
body{width:440px;height:956px;overflow:hidden;background:#0B0F14;color:#EDEFF2;font-family:'Archivo',sans-serif;-webkit-font-smoothing:antialiased}
.ph{position:relative;width:440px;height:956px;padding:54px 14px 26px;display:flex;flex-direction:column;gap:8px;
 background:radial-gradient(440px 380px at 62% 48%,var(--amb,rgba(249,115,22,.12)),transparent 70%),#0B0F14}
.n{font-family:'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums}
.lbl{font-size:10px;font-weight:800;letter-spacing:1.5px;color:#7A8694}
.hd{display:grid;grid-template-columns:48px 1fr auto;gap:10px;align-items:center}
.ib{width:48px;height:64px;border-radius:14px;background:#141B23;display:grid;place-items:center;font-size:30px}
.hd .lbl{font-size:14px;letter-spacing:1.5px}
.st b{display:block;font-size:54px;font-weight:700;line-height:.95;white-space:nowrap}.st b small{font-size:20px;font-weight:700}.dim{color:#56616D}.y{color:#FFD23F}
.seg{display:flex;gap:3px;height:10px;margin-top:2px}.seg i{border-radius:5px;opacity:.25}.seg i.on{opacity:1}.seg i.cur{opacity:1;box-shadow:0 0 10px var(--g)}
.line{position:relative;flex:1;display:flex;flex-direction:column;gap:6px;margin-top:6px}
.rail{position:absolute;left:67px;width:6px;top:0;bottom:0;background:linear-gradient(#7C3AED 0 44px,#F97316 44px calc(100% - 76px),rgba(250,204,21,.4) calc(100% - 76px))}
.row{position:relative;display:grid;grid-template-columns:54px 30px 1fr;gap:6px;align-items:center;height:36px}
.row .t{text-align:right;font-size:22px;font-weight:700;color:#B4BDC7}
.row .d{width:18px;height:18px;border-radius:50%;background:#0B0F14;border:4px solid var(--c);justify-self:center}
.row.done .d{background:var(--c)}.row .nm{font-size:20px;font-weight:700;color:#C9D1D9}.row.done .nm{text-decoration:line-through;color:#6B7682}
.act{position:relative;flex:1;display:grid;grid-template-columns:54px minmax(0,1fr);gap:30px}
.act .t{text-align:right;font-size:24px;font-weight:700;color:#FFD23F;padding-top:12px;line-height:1.1}
.dot{position:absolute;left:54px;top:8px;width:32px;height:32px;border-radius:50%;background:var(--c);box-shadow:0 0 0 3px var(--c),0 0 22px rgba(249,115,22,.55);border:4px solid #0B0F14}
.card{border-radius:26px;border:1px solid rgba(249,115,22,.35);background:radial-gradient(260px 200px at 85% 0%,rgba(249,115,22,.12),transparent 70%),#141B23;padding:14px;display:flex;flex-direction:column}
.tag{font-size:12px;font-weight:800;letter-spacing:1.6px;color:#F97316}
.ti{font-size:58px;font-weight:800;line-height:.95;margin-top:4px}.ti small{font-size:28px;color:#F97316;margin-left:8px;font-weight:700}
.reps{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}
.reps div{border-radius:12px;background:#0B0F14;padding:4px 0 6px;text-align:center;border:1px solid #1E2731}
.reps small{display:block;font-size:10px;font-weight:800;color:#7A8694;letter-spacing:1px}.reps b{font-size:24px;font-weight:700}
.reps .ok b{color:#3DDC84}.reps .now{border-color:#FFD23F}.reps .now b{color:#FFD23F}.reps .rest{border-color:#38BDF8}.reps .rest b{color:#38BDF8}
.timer{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:8px;border-radius:20px;background:rgba(0,0,0,.28);padding:6px 8px 10px;position:relative}
.timer .mode{font-size:15px;font-weight:800;letter-spacing:2px}
.timer .big{font-size:150px;font-weight:800;line-height:.85;letter-spacing:-3px;transform:scaleY(1.12)}
.timer .sub{font-size:24px;font-weight:700;color:#B4BDC7;margin-top:10px}
.g{color:#3DDC84}.r{color:#FF6B6B}.b{color:#38BDF8}
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:auto}
.tiles div{background:rgba(0,0,0,.28);border-radius:16px;padding:6px 10px 8px}.tiles b{display:block;font-size:60px;font-weight:700;line-height:1}
.ready{flex:1;display:flex;flex-direction:column;justify-content:flex-end}
.desc{font-size:23px;line-height:1.3;color:#DCE2E8;margin-top:10px}
.dock{display:grid;grid-template-columns:76px 1fr 76px;gap:10px;align-items:stretch}
.side{border-radius:22px;background:#12181F;border:1px solid #1E2731;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:12px;font-weight:700;color:#C9D1D9}
.side.undo{color:#FFD23F;border-color:rgba(255,210,63,.5)}
.main{height:124px;border-radius:28px;background:radial-gradient(circle at 30% 20%,#FFE58A,#FFD23F 55%,#F2B90F);color:#14110A;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 10px 28px rgba(255,210,63,.18)}
.main b{font-size:40px;font-weight:800;line-height:1;letter-spacing:.5px}.main small{font-size:15px;font-weight:800;opacity:.75;margin-top:4px}
.main.geldim{background:#EDEFF2}
.beep{position:absolute;right:12px;top:10px;display:flex;gap:6px}.beep i{width:12px;height:12px;border-radius:50%;background:#2A3440}.beep i.on{background:#FFD23F;box-shadow:0 0 10px #FFD23F}
.warn{margin-top:10px;padding:10px 12px;border-radius:14px;background:rgba(255,176,32,.14);border:1px solid rgba(255,176,32,.6);color:#FFB020;font-size:18px;font-weight:700}
.dim2{position:absolute;inset:0;background:rgba(3,6,9,.74)}
.sheet{position:absolute;left:0;right:0;bottom:0;border-radius:30px 30px 0 0;background:#141B23;border-top:1px solid #243040;padding:22px 16px 30px;display:flex;flex-direction:column;gap:12px}
.sheet h3{margin:0;font-size:28px}.sheet p{margin:0;font-size:20px;color:#B4BDC7}
.sbtn{height:96px;border-radius:26px;display:grid;place-items:center;font-size:28px;font-weight:800}
.flash{position:absolute;inset:0;border-radius:20px;box-shadow:inset 0 0 0 4px #FFD23F}
"""


def ic(p, s=26, w=2.2):
    return f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round">{p}</svg>'


UNDO = ic('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>')
MORE = ic('<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>')


def seg(cur, done):
    return '<div class="seg">' + ''.join(
        f'<i class="{"on" if i < done else "cur" if i == cur else ""}" style="flex:{m};background:{C[b]};--g:{C[b]}"></i>'
        for i, (b, m) in enumerate(SEG)) + '</div>'


def header(clock, dist):
    return (f'<div class="hd"><span class="ib">‹</span><div class="st"><span class="lbl">SÜRE</span><b class="n">{clock}<small class="y"> /24:55</small></b></div>'
            f'<div class="st" style="text-align:right"><span class="lbl">MESAFE</span><b class="n">{dist}<small class="dim"> /1.200</small></b></div></div>')


def row(t, c, nm, done=False):
    return f'<div class="row{" done" if done else ""}" style="--c:{c}"><span class="t n">{t}</span><i class="d"></i><span class="nm">{nm}</span></div>'


def reps(items):
    return '<div class="reps">' + ''.join(f'<div class="{cls}"><small>{i+1}. TEKRAR</small><b class="n">{v}</b></div>' for i, (cls, v) in enumerate(items)) + '</div>'


def page(active_t, card, dock, above, below, clock, dist, cur=2, done=2, amb='rgba(249,115,22,.12)', overlay=''):
    body = f"""<div class="ph" style="--amb:{amb}">{header(clock, dist)}{seg(cur, done)}
<div class="line"><div class="rail"></div>{above}
<div class="act"><div class="t n">{active_t}</div><i class="dot" style="--c:{C['MS'] if cur == 2 else C['AS']}"></i>{card}</div>
{below}</div>{dock}{overlay}</div>"""
    return f'<!doctype html><html lang="tr"><head><meta charset="utf-8"><link rel="stylesheet" href="file://{FONTS}"><style>{CSS}</style></head><body>{body}</body></html>'


SES_ON = ic('<path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>', 28)
SES_OFF = ic('<path d="M4 10v4h4l5 4V6L8 10z"/><path d="M17 9l5 6M22 9l-5 6"/>', 28)


def dock(label, sub, undo=False, geldim=False, muted=False):
    left = f'<div class="side undo">{UNDO}<span>Geri al</span></div>' if undo else f'<div class="side" style="opacity:.3">{UNDO}<span>Geri al</span></div>'
    snd = f'<div class="side" style="color:#FF8A8A">{SES_OFF}<span>Ses kapalı</span></div>' if muted else f'<div class="side">{SES_ON}<span>Ses açık</span></div>'
    return (f'<div class="dock">{left}<div class="main{" geldim" if geldim else ""}"><b>{label}</b><small>{sub}</small></div>{snd}</div>')


ABOVE = row('9:40', C['PS'], '4 × 50 FR Drill', True)
BELOW = row('24:00', C['AS'], '2 × 100 FR Pull') + row('28:30', C['CD'], '1 × 200 FR Swim')
TITLE = '<span class="tag">MS · ANA SET · 3/5</span><div class="ti n">4 × 100<small>FR Swim</small></div>'

# 1) Set hazır
s1 = page('9:40', f"""<div class="card">{TITLE}
<div class="desc">Eşik temposu, dönüşlerde 3 dolfin vuruşu</div>
<div class="ready"><div class="tiles"><div><span class="lbl">HEDEF</span><b class="n">1:30</b></div><div><span class="lbl">DİNLEN</span><b class="n">0:20</b></div></div>
<div class="n" style="font-size:20px;font-weight:700;color:#B4BDC7;margin-top:10px;display:flex;justify-content:space-between"><span>4 tekrar · set 7:20</span><span>400 m</span></div></div></div>""",
          dock('ÇIK', '1. tekrar başlar'), ABOVE, BELOW, '10:12', '400')

# 2) Yüzüyor (2. tekrar)
s2 = page('9:40', f"""<div class="card">{TITLE}
{reps([('ok', '1:28'), ('now', '0:48'), ('', '—'), ('', '—')])}
<div class="timer"><span class="mode y">YÜZÜYOR · 2/4</span><div class="big n">0:48</div>
<div class="sub n">Hedef 1:30 · <span class="g">42 sn kaldı</span></div></div></div>""",
          dock('GELDİM', '2. tekrar biter, dinlenme başlar', undo=False, geldim=True), ABOVE, BELOW, '12:31', '500')

# 3) Dinleniyor, çıkışa 3 sn (3-2-1)
s3 = page('9:40', f"""<div class="card">{TITLE}
{reps([('ok', '1:28'), ('ok', '1:29'), ('rest', '0:03'), ('', '—')])}
<div class="timer"><div class="flash"></div><div class="beep"><i class="on"></i><i></i><i></i></div><span class="mode b">DİNLENME · ÇIKIŞA</span><div class="big n y">0:03</div>
<div class="sub n">Son tekrar 1:29 · <span class="g">−1 sn</span></div></div></div>""",
          dock('ÇIK', '3. tekrar başlar', undo=True), ABOVE, BELOW, '14:17', '600')

# 4) Dinlenme uzadı (eksiye geçti)
s4 = page('9:40', f"""<div class="card">{TITLE}
{reps([('ok', '1:28'), ('ok', '1:29'), ('ok', '1:31'), ('rest', '−0:07')])}
<div class="timer"><span class="mode r">DİNLENME UZADI</span><div class="big n r" style="font-size:124px">−0:07</div>
<div class="sub n">Son tekrar 1:31 · <span class="r">+1 sn</span></div></div></div>""",
          dock('ÇIK', '4. tekrar başlar', muted=True), ABOVE, BELOW, '16:15', '700', amb='rgba(255,107,107,.10)')

# 5) Set bitti → sonraki set hazır, dinlenme sürüyor
TITLE2 = '<span class="tag" style="color:#FACC15">AS · EK SET · 4/5</span><div class="ti n">2 × 100<small style="color:#FACC15">FR Pull</small></div>'
s5 = page('18:40', f"""<div class="card" style="border-color:rgba(250,204,21,.35)">{TITLE2}
<div class="n" style="margin-top:10px;padding:10px 12px;border-radius:14px;background:rgba(61,220,132,.10);color:#3DDC84;font-size:20px;font-weight:700">✓ 4×100 bitti · ort. 1:29.8 · 4/4</div>
<div class="timer"><span class="mode b">SET SONU DİNLENMESİ</span><div class="big n">0:12</div>
<div class="sub n">Hedef 1:40 · Şamandıra</div></div></div>""",
          dock('ÇIK', '2×100 Pull · 1. tekrar', undo=True),
          row('18:40', C['MS'], '4 × 100 FR Swim', True), row('28:30', C['CD'], '1 × 200 FR Swim'), '18:22', '800', cur=3, done=3, amb='rgba(250,204,21,.10)')

# 6) Dinlenirken sonraki sete kaydırıldı: set ÇIK'a basınca 3/4 kapanır
s6 = page('18:40', f"""<div class="card" style="border-color:rgba(250,204,21,.35)">{TITLE2}
<div class="warn">⚠ 4×100 3/4'te kapanacak · 4. tekrar yapılmadı</div>
<div class="timer"><span class="mode b">DİNLENME</span><div class="big n">0:09</div>
<div class="sub n">Vazgeçmek için geri kaydır</div></div></div>""",
          dock('ÇIK', '2×100 Pull · 1. tekrar', undo=True),
          row('9:40', C['MS'], '4 × 100 FR Swim · 3/4'), row('28:30', C['CD'], '1 × 200 FR Swim'), '16:40', '700', cur=3, done=2, amb='rgba(250,204,21,.10)')

# 7) Sol üstteki ‹ : idmanı erken bitir
s7 = page('9:40', f"""<div class="card">{TITLE}
{reps([('ok', '1:28'), ('ok', '1:29'), ('rest', '0:11'), ('', '—')])}
<div class="timer"><span class="mode b">DİNLENME · ÇIKIŞA</span><div class="big n">0:11</div>
<div class="sub n">Son tekrar 1:29 · <span class="g">−1 sn</span></div></div></div>""",
          dock('ÇIK', '3. tekrar başlar', undo=False), ABOVE, BELOW, '14:09', '600',
          overlay='<div class="dim2"></div><div class="sheet"><h3>İdmanı bitir?</h3><p>Yapılan: 2 set tam, 4×100 2/4 · 600 m · 14:09</p>'
                  '<div class="sbtn" style="background:#FFD23F;color:#14110A">İdmanı bitir ve kaydet</div><div class="sbtn" style="background:#0B0F14;border:1px solid #243040">Devam et</div></div>')

for i, s in enumerate([s1, s2, s3, s4, s5, s6, s7], 1):
    open(os.path.join(OUT, f'd{i}.html'), 'w').write(s)
print('ok')
