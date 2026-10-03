# Gerçek 3B render: Z-Anatomy (CC BY-SA 4.0, BodyParts3D tabanlı) kas modeli Blender Cycles ile
# ön/arka render edildi; her kas grubunun maskesi ayrı. Renk, maskeye "color" karışımıyla verilir:
# gölge ve ışık render'dan, renk tondan gelir. Yük → opaklık.
ORDER = ['Bacak', 'Kalça', 'Gövde', 'Kol', 'Sırt', 'Omuz', 'Göğüs']
ROZET = {'Gövde': ('front', 50, 38), 'Göğüs': ('front', 44, 26), 'Omuz': ('front', 30, 24), 'Kol': ('front', 24, 35),
         'Bacak': ('front', 42, 64), 'Sırt': ('back', 50, 30), 'Kalça': ('back', 50, 52)}
CSS = '''
.bm{position:relative;display:flex;justify-content:center;gap:0}
.bv{position:relative;aspect-ratio:1/2}
.bv>*{position:absolute;inset:0;width:100%;height:100%}
.bv .tint{mix-blend-mode:color;-webkit-mask-size:100% 100%;mask-size:100% 100%}
.bv .lum{mix-blend-mode:soft-light;-webkit-mask-size:100% 100%;mask-size:100% 100%}
.bv .rz{position:absolute;inset:auto;width:auto;height:auto;transform:translate(-50%,-50%);display:grid;place-items:center;border-radius:50%;background:#F5A524;color:#1A0E04;font-weight:900;border:2px solid #0B0F14;box-shadow:0 0 12px #F5A52499}
'''
def view(v, h, load, colors, prio=None, path='r'):
    w = h / 2
    parts = [f'<div class="bv" style="height:{h}px;width:{w}px"><img src="{path}/base_{v}.png">']
    for g in ORDER:
        a = load.get(g, 0)
        if a <= 0:
            continue
        m = f'url({path}/mask_{g}_{v}.png)'
        # az çalışılan: hafif renk izi; çok çalışılan: tam renk ve parlaklık
        parts.append(f'<div class="tint" style="background:{colors[g]};opacity:{.12 + .88 * a ** 1.3:.2f};-webkit-mask-image:{m};mask-image:{m}"></div>')
        parts.append(f'<div class="lum" style="background:{colors[g]};opacity:{.6 * a ** 1.5:.2f};-webkit-mask-image:{m};mask-image:{m}"></div>')
    for g, p in (prio or {}).items():
        if p and ROZET[g][0] == v:
            _, x, y = ROZET[g]
            s = max(18, h * 0.06)
            parts.append(f'<span class="rz" style="left:{x}%;top:{y}%;width:{s:.0f}px;height:{s:.0f}px;font-size:{s * (0.55 if p == 1 else 0.4):.0f}px">{"★" if p == 1 else "★★"}</span>')
    parts.append('</div>')
    return ''.join(parts)

def body_html(h, views, load, colors, prio=None, path='r'):
    vs = ['front', 'back'] if views == 'both' else [{'on': 'front', 'arka': 'back'}.get(views, views)]
    return '<div class="bm">' + ''.join(view(v, h, load, colors, prio, path) for v in vs) + '</div>'
