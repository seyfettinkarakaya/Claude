# Seans sonu akışı: RPE → MSI → Özet ve kaydet (Sürüm 8 görünümü)
import os

FONTS = '/home/user/Claude/fonts/fonts.css'
OUT = os.path.join(os.path.dirname(__file__), 'html')

CSS = """
*{box-sizing:border-box}html,body{margin:0}
body{width:440px;height:956px;overflow:hidden;background:#0B0F14;color:#EDEFF2;font-family:'Archivo',sans-serif;-webkit-font-smoothing:antialiased}
.ph{position:relative;width:440px;height:956px;padding:56px 16px 28px;display:flex;flex-direction:column;gap:14px;background:#0B0F14}
.n{font-family:'Barlow Condensed',sans-serif;font-variant-numeric:tabular-nums}
.lbl{font-size:13px;font-weight:800;letter-spacing:1.5px;color:#7A8694}
.top{display:flex;align-items:center;gap:12px}
.ib{width:52px;height:52px;border-radius:16px;background:#141B23;display:grid;place-items:center;font-size:28px;flex:none}
.steps{margin-left:auto;display:flex;gap:6px}.steps i{width:30px;height:8px;border-radius:4px;background:#243040}.steps i.on{background:#FFD23F}
h1{margin:0;font-size:34px;font-weight:800;line-height:1.1}
.sub{font-size:19px;color:#9AA4AF;margin-top:-6px}
.undo{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:16px;border:1px solid rgba(255,210,63,.5);color:#FFD23F;font-weight:700;font-size:17px}
.undo em{margin-left:auto;font-style:normal;color:#7A8694;font-size:15px}
.rpe{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.rpe div{height:104px;border-radius:20px;background:#141B23;border:2px solid #1E2731;display:flex;flex-direction:column;align-items:center;justify-content:center}
.rpe b{font-size:52px;font-weight:700;line-height:1}.rpe small{font-size:13px;font-weight:700;color:#9AA4AF;margin-top:2px}
.rpe .on{background:#FFD23F;border-color:#FFD23F;color:#14110A}.rpe .on small{color:#14110A}
.big{height:150px;border-radius:30px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:38px;font-weight:800}
.big small{font-size:16px;font-weight:700;opacity:.75;margin-top:6px}
.ok{background:#3DDC84;color:#04160C}
.btn{height:92px;border-radius:26px;background:radial-gradient(circle at 30% 20%,#FFE58A,#FFD23F 55%,#F2B90F);color:#14110A;display:grid;place-items:center;font-size:32px;font-weight:800;flex:none}
.btn2{height:72px;border-radius:22px;background:#141B23;border:1px solid #1E2731;display:grid;place-items:center;font-size:22px;font-weight:800;flex:none}
.body{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.body div{height:78px;border-radius:18px;background:#141B23;border:2px solid #1E2731;display:flex;align-items:center;justify-content:space-between;padding:0 16px;font-size:21px;font-weight:700}
.body em{font-style:normal;font-family:'Barlow Condensed';font-size:34px;font-weight:700;color:#56616D}
.body .w1{border-color:#FB923C;background:rgba(251,146,60,.12)}.body .w1 em{color:#FB923C}
.body .w05{border-color:#FACC15;background:rgba(250,204,21,.10)}.body .w05 em{color:#FACC15}
.scale{font-size:14px;font-weight:700;color:#7A8694;line-height:1.5}
.sp{flex:1}
.sum{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.sum div{background:#141B23;border-radius:16px;padding:8px 12px}.sum b{display:block;font-size:34px;font-weight:700;line-height:1.05}
.seg{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:5px;border-radius:18px;background:#141B23}
.seg span{height:46px;border-radius:14px;display:grid;place-items:center;font-size:20px;font-weight:800;color:#9AA4AF}.seg .on{background:#FFD23F;color:#14110A}
.chip{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:#141B23;border:1px solid #243040;font-size:16px;font-weight:700;color:#C9D1D9}
.chip.on{border-color:#FFD23F;color:#FFD23F}
.notes{background:#12181F;border:1px solid #1E2731;border-radius:20px;padding:4px 14px}
.nt{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #1E2731}.nt:last-child{border:0}
.cb{width:28px;height:28px;border-radius:8px;border:2px solid #3A4654;flex:none;display:grid;place-items:center;font-size:18px;font-weight:900;margin-top:2px}
.cb.on{background:#FFD23F;border-color:#FFD23F;color:#14110A}
.nt b{display:block;font-size:17px}.nt span{font-size:15px;color:#9AA4AF;line-height:1.35}
.nt .warn{color:#FFB020}
.row2{display:flex;gap:8px;flex-wrap:wrap}
.mic{display:flex;align-items:center;gap:10px;height:56px;border-radius:16px;background:#141B23;border:1px solid #1E2731;padding:0 14px;color:#7A8694;font-size:17px}
.dim{position:absolute;inset:0;background:rgba(3,6,9,.74)}
.sheet{position:absolute;left:0;right:0;bottom:0;border-radius:30px 30px 0 0;background:#141B23;border-top:1px solid #243040;padding:18px 16px 30px;display:flex;flex-direction:column;gap:14px}
.grab{width:44px;height:5px;border-radius:3px;background:#2F3B48;align-self:center}
.reps{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.reps div{border-radius:14px;background:#0B0F14;border:2px solid #1E2731;padding:6px 0 8px;text-align:center}
.reps small{display:block;font-size:11px;font-weight:800;color:#7A8694}.reps b{font-size:28px;font-weight:700;color:#3DDC84}
.reps .bad{border-color:#FFB020}.reps .bad b{color:#FFB020}
.stepper{display:flex;align-items:center;gap:12px}
.stepper span{width:84px;height:84px;border-radius:22px;background:#0B0F14;border:1px solid #243040;display:grid;place-items:center;font-size:40px;font-weight:700}
.stepper b{flex:1;text-align:center;font-size:84px;font-weight:700;line-height:1;color:#FFD23F}
"""

BACK = '<span class="ib">‹</span>'


def steps(k):
    return '<div class="steps">' + ''.join(f'<i class="{"on" if i <= k else ""}"></i>' for i in range(1, 4)) + '</div>'


def page(body):
    return f'<!doctype html><html lang="tr"><head><meta charset="utf-8"><link rel="stylesheet" href="file://{FONTS}"><style>{CSS}</style></head><body><div class="ph">{body}</div></body></html>'


LBL = {0: 'dinlenme', 1: 'çok kolay', 2: 'kolay', 3: 'rahat', 4: 'orta', 5: 'orta+', 6: 'zorlu', 7: 'zor', 8: 'çok zor', 9: 'aşırı', 10: 'maks.'}

# 1) RPE
rpe = ''.join(f'<div class="{"on" if n == 7 else ""}"><b class="n">{n}</b><small>{LBL[n]}</small></div>' for n in range(11))
p1 = page(f"""<div class="top">{BACK}{steps(1)}</div>
<div class="undo">↶ Yanlışlıkla mı bitti? İdmana dön <em>5 sn</em></div>
<h1>İdman nasıldı?</h1><div class="sub">Zorluk (RPE) — dokun, kendisi geçer</div>
<div class="rpe">{rpe}</div>
<div class="sp"></div>
<div class="scale">1 dokunuş · İdman: 24:31 · 1.100 m · 5 set</div>""")

# 2) MSI — ağrı yok
regions = [('Sağ omuz', '—', ''), ('Sol omuz', '—', ''), ('Sağ diz', '—', ''), ('Sol diz', '—', ''), ('Kalça', '—', ''), ('Bel', '—', ''), ('Boyun', '—', '')]
body = lambda rs: '<div class="body">' + ''.join(f'<div class="{c}">{a}<em class="n">{v}</em></div>' for a, v, c in rs) + '</div>'
p2 = page(f"""<div class="top">{BACK}{steps(2)}</div>
<h1>Ağrı / rahatsızlık</h1><div class="sub">MSI — çoğu seansta tek dokunuş</div>
<div class="big ok">✓ Ağrı yok<small>MSI boş kalır, özet ekranına geçer</small></div>
<div class="lbl" style="margin-top:6px">AĞRI VARSA BÖLGEYE DOKUN</div>
{body(regions)}
<div class="sp"></div>""")

# 3) MSI — bölge seçili
regions2 = [('Sağ omuz', '1', 'w1'), ('Sol omuz', '—', ''), ('Sağ diz', '—', ''), ('Sol diz', '—', ''), ('Kalça', '—', ''), ('Bel', '0,5', 'w05'), ('Boyun', '—', '')]
p3 = page(f"""<div class="top">{BACK}{steps(2)}</div>
<h1>Ağrı / rahatsızlık</h1><div class="sub">Her dokunuş değeri artırır: 0,5 → 1 → 1,5 → 2 → 3 → —</div>
{body(regions2)}
<div class="scale">0,5 gözlem · 1–1,5 hafiflet · 2 durdur · 3+ tıbbi</div>
<div class="chip" style="align-self:flex-start;border-color:#FB923C;color:#FB923C">⏱ Sağ omuz 1 · idman sırasında 4×100'de kaydedildi</div>
<div class="sp"></div>
<div class="btn">Devam</div>""")

# 4) Özet ve kaydet
p4 = page(f"""<div class="top">{BACK}{steps(3)}</div>
<h1>Özet ve kaydet</h1>
<div class="sum"><div><span class="lbl">SÜRE</span><b class="n">24:31</b></div><div><span class="lbl">MESAFE</span><b class="n">1.100</b></div><div><span class="lbl">RPE · MSI</span><b class="n" style="font-size:26px">7 · omuz 1</b></div></div>
<div class="seg"><span class="on">25 m</span><span>50 m</span></div>
<div class="lbl">TABLODAKİ NOTA YAZILACAKLAR</div>
<div class="notes">
<div class="nt"><i class="cb on">✓</i><div><b>4×100 FR · tekrarlar</b><span class="n" style="font-size:18px">1:28 · 1:29 · 1:31 · 1:30</span></div></div>
<div class="nt"><i class="cb">&nbsp;</i><div><b>4×100 FR · dinlenme</b><span class="n" style="font-size:18px">0:21 · 0:19 · 0:25 (ort. +2 sn) · set sonu 0:48</span></div></div>
<div class="nt"><i class="cb on">✓</i><div><b>2×100 Pull · 1/2 yapıldı</b><span>2. tekrar yapılmadı</span></div></div>
<div class="nt"><i class="cb on">✓</i><div><b>4×50 Drill · tekrarlar</b><span class="n warn" style="font-size:18px">0:58 · 1:01 · ⚠ 2:41 · 0:59 — düzelt</span></div></div>
</div>
<div class="row2"><span class="chip on">İyi hissettim</span><span class="chip">Yorgun</span><span class="chip">Omuz hassas</span><span class="chip">+ Not yaz 🎤</span></div>
<div class="sp"></div>
<div class="btn">Kaydet</div>""")

# 5) Şüpheli tekrarı düzeltme
p5 = page(f"""<div class="top">{BACK}{steps(3)}</div>
<h1>Özet ve kaydet</h1>
<div class="dim"></div>
<div class="sheet"><div class="grab"></div>
<div style="font-size:26px;font-weight:800">4×50 Drill · 3. tekrar</div>
<div class="sub" style="margin:0">Diğerlerinden çok uzun — "Geldim" geç basılmış olabilir.</div>
<div class="reps"><div><small>1</small><b class="n">0:58</b></div><div><small>2</small><b class="n">1:01</b></div><div class="bad"><small>3</small><b class="n">2:41</b></div><div><small>4</small><b class="n">0:59</b></div></div>
<div class="stepper"><span>−</span><b class="n">1:00</b><span>+</span></div>
<div class="btn">1:00 olarak düzelt</div>
<div class="btn2">Bu tekrarı ortalamadan çıkar</div>
<div class="btn2" style="background:transparent;border:0;color:#7A8694">Olduğu gibi bırak</div></div>""")

for i, s in enumerate([p1, p2, p3, p4, p5], 1):
    open(os.path.join(OUT, f'e{i}.html'), 'w').write(s)
print('ok')
