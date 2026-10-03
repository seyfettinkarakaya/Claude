# Sade, stilize kas haritası (ikon dili): gri siluet, koyu çizgiyle ayrılmış kaslar, çalışan
# bölge tek vurgu renginde. Çizim: react-native-body-highlighter (MIT, © 2022 ELABBASSI Hicham).
import json, os
B = json.load(open(os.path.join(os.path.dirname(__file__), 'body-paths.json')))
GRUP = {'chest': 'Göğüs', 'obliques': 'Gövde', 'abs': 'Gövde', 'lower-back': 'Gövde', 'biceps': 'Kol', 'triceps': 'Kol',
        'forearm': 'Kol', 'deltoids': 'Omuz', 'trapezius': 'Sırt', 'upper-back': 'Sırt', 'gluteal': 'Kalça', 'adductors': 'Bacak',
        'quadriceps': 'Bacak', 'hamstring': 'Bacak', 'calves': 'Bacak', 'tibialis': 'Bacak'}
SIL = '#5C626B'     # siluet (baş, el, ayak, diz)
KAS = '#474D56'     # vurgusuz kas
CIZ = '#15191E'     # kas araları
VURGU = '#F5A524'   # salon vurgu rengi

def mix(a, b, t):
    pa = [int(a[i:i + 2], 16) for i in (1, 3, 5)]; pb = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return '#%02x%02x%02x' % tuple(round(x + (y - x) * t) for x, y in zip(pa, pb))

def layer(view, load, color=VURGU):
    out = []
    for m in B['bodyFront' if view == 'on' else 'bodyBack']:
        if m['slug'] == 'hair':
            continue
        g = GRUP.get(m['slug'])
        t = max(0.0, (load.get(g, 0) - 0.2) / 0.8) if g else 0  # %20'nin altı gri kalır
        fill = SIL if not g else (mix(KAS, color, 0.35 + 0.65 * t) if t > 0 else KAS)
        for d in m['paths']:
            out.append(f'<path d="{d}" fill="{fill}"/>')
    return f'<g stroke="{CIZ}" stroke-width="6" stroke-linejoin="round">{"".join(out)}</g>'

def body_svg(w, h, views, load, color=VURGU, crop=None):
    if crop:
        v, x, y, s = crop
        return f'<svg width="{w}" height="{h}" viewBox="{x} {y} {s} {s}">{layer(v, load, color)}</svg>'
    if views == 'both':
        return f'<svg width="{w}" height="{h}" viewBox="20 40 1408 1390">{layer("on", load, color)}<g>{layer("arka", load, color)}</g></svg>'
    vb = '40 40 644 1390' if views == 'on' else '764 40 644 1390'
    return f'<svg width="{w}" height="{h}" viewBox="{vb}">{layer(views, load, color)}</svg>'

# Kas grubu ikonları: (görünüm, x, y, kenar) — çizim koordinatında kare kesit
IKON = {'Bacak': ('on', 112, 580, 520), 'Sırt': ('arka', 846, 170, 480), 'Gövde': ('on', 112, 230, 500),
        'Göğüs': ('on', 112, 140, 500), 'Kol': ('on', 52, 130, 620), 'Omuz': ('arka', 836, 120, 500),
        'Kalça': ('arka', 846, 450, 480), 'Tüm vücut': ('on', 42, 50, 640)}
