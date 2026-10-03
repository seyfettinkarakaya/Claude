# Anatomik vücut haritası: react-native-body-highlighter (MIT, © 2022 ELABBASSI Hicham) çizimleri.
# Ön: x 0–724, arka: x 724–1448 (aynı tuval), yükseklik 1448.
import json, os
B = json.load(open(os.path.join(os.path.dirname(__file__), 'body-paths.json')))
GRUP = {'chest': 'Göğüs', 'obliques': 'Gövde', 'abs': 'Gövde', 'lower-back': 'Gövde', 'biceps': 'Kol', 'triceps': 'Kol',
        'forearm': 'Kol', 'deltoids': 'Omuz', 'trapezius': 'Sırt', 'upper-back': 'Sırt', 'gluteal': 'Kalça', 'adductors': 'Bacak',
        'quadriceps': 'Bacak', 'hamstring': 'Bacak', 'calves': 'Bacak', 'tibialis': 'Bacak'}
DEFS = '''<defs><filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/>
<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'''

def layer(view, load, prio, colors, show_prio=True, base=0.14):
    out = []
    for m in B['bodyFront' if view == 'on' else 'bodyBack']:
        g = GRUP.get(m['slug'])
        for d in m['paths']:
            if not g:
                out.append(f'<path d="{d}" fill="#222C38" stroke="#0B0F14" stroke-width="2"/>')
                continue
            a = base + (1 - base) * load.get(g, 0)
            p = prio.get(g, 0) if show_prio else 0
            st = (f'stroke="#F5A524" stroke-width="{3 if p == 1 else 5}"' + (' filter="url(#glow)"' if p == 2 else '')) if p else 'stroke="#0B0F14" stroke-width="2"'
            out.append(f'<path d="{d}" fill="{colors[g]}" fill-opacity="{a:.2f}" {st}/>')
    return ''.join(out)

def body_svg(w, h, views, load, prio, colors, show_prio=True):
    if views == 'both':
        vb, inner = '20 40 1408 1390', layer('on', load, prio, colors, show_prio) + layer('arka', load, prio, colors, show_prio)
    else:
        vb = '40 40 644 1390' if views == 'on' else '764 40 644 1390'
        inner = layer(views, load, prio, colors, show_prio)
    return f'<svg width="{w}" height="{h}" viewBox="{vb}">{DEFS}{inner}</svg>'
