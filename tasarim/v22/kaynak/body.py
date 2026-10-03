# Anatomik vücut haritası, 3B görünüm: react-native-body-highlighter (MIT, © 2022 ELABBASSI Hicham)
# kas çizimleri + SVG ışıklandırma (yaygın ışık + parlama) ile hacim; renk kas grubundan.
import json, os
B = json.load(open(os.path.join(os.path.dirname(__file__), 'body-paths.json')))
GRUP = {'chest': 'Göğüs', 'obliques': 'Gövde', 'abs': 'Gövde', 'lower-back': 'Gövde', 'biceps': 'Kol', 'triceps': 'Kol',
        'forearm': 'Kol', 'deltoids': 'Omuz', 'trapezius': 'Sırt', 'upper-back': 'Sırt', 'gluteal': 'Kalça', 'adductors': 'Bacak',
        'quadriceps': 'Bacak', 'hamstring': 'Bacak', 'calves': 'Bacak', 'tibialis': 'Bacak'}

def defs(uid='b'):
    return f'''<defs>
<filter id="{uid}vol" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="bl"/>
  <feDiffuseLighting in="bl" surfaceScale="9" diffuseConstant="1.15" lighting-color="#ffffff" result="df"><feDistantLight azimuth="235" elevation="38"/></feDiffuseLighting>
  <feComposite in="df" in2="SourceAlpha" operator="in" result="dfi"/>
  <feBlend in="SourceGraphic" in2="dfi" mode="multiply" result="sh"/>
  <feSpecularLighting in="bl" surfaceScale="9" specularConstant=".55" specularExponent="22" lighting-color="#ffffff" result="sp"><feDistantLight azimuth="235" elevation="42"/></feSpecularLighting>
  <feComposite in="sp" in2="SourceAlpha" operator="in" result="spi"/>
  <feComposite in="sh" in2="spi" operator="arithmetic" k1="0" k2="1" k3=".55" k4="0"/>
</filter>
<filter id="{uid}glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<radialGradient id="{uid}floor" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#F5A524" stop-opacity=".10"/><stop offset="1" stop-color="#F5A524" stop-opacity="0"/></radialGradient>
</defs>'''

# Öncelik rozetlerinin yeri (çizim koordinatında): grup → (görünüm, x, y)
ROZET = {'Gövde': ('on', 362, 470), 'Göğüs': ('on', 362, 330), 'Omuz': ('on', 250, 300), 'Kol': ('on', 205, 430),
         'Bacak': ('on', 300, 760), 'Sırt': ('arka', 1086, 380), 'Kalça': ('arka', 1086, 640)}

def layer(view, load, prio, colors, uid, show_prio=True, base=0.10):
    under, skin, mus = [], [], []
    for m in B['bodyFront' if view == 'on' else 'bodyBack']:
        g = GRUP.get(m['slug'])
        for d in m['paths']:
            if m['slug'] != 'hair':
                under.append(f'<path d="{d}"/>')
            if not g:
                skin.append(f'<path d="{d}" fill="{"#1C232D" if m["slug"] == "hair" else "#3A4656"}"/>')
                continue
            a = base + (1 - base) * load.get(g, 0)
            mus.append(f'<path d="{d}" fill="{mix(colors[g], a)}"/>')
    # alttaki ten: kaslar arası boşlukları doldurur (tek parça vücut)
    out = (f'<g fill="#232C38" stroke="#232C38" stroke-width="18" stroke-linejoin="round" filter="url(#{uid}vol)">{"".join(under)}</g>'
           f'<g filter="url(#{uid}vol)">{"".join(skin)}{"".join(mus)}</g>')
    if show_prio:
        for g, p in prio.items():
            if not p or ROZET[g][0] != view:
                continue
            _, x, y = ROZET[g]
            out += (f'<g transform="translate({x},{y})"><circle r="50" fill="#F5A524" stroke="#0B0F14" stroke-width="8"/>'
                    f'<text y="{18 if p == 1 else 14}" text-anchor="middle" font-family="Archivo" font-weight="900" font-size="{54 if p == 1 else 40}" fill="#1A0E04">{"★" if p == 1 else "★★"}</text></g>')
    return out

def mix(hexc, a, bg=(0x3A, 0x46, 0x56)):
    """Kas rengi ile koyu ten arasında karışım (a=1 tam renk)."""
    r, g, b = int(hexc[1:3], 16), int(hexc[3:5], 16), int(hexc[5:7], 16)
    return '#%02x%02x%02x' % tuple(round(bg[i] + (c - bg[i]) * a) for i, c in enumerate((r, g, b)))

_n = [0]
def body_svg(w, h, views, load, prio, colors, show_prio=True):
    _n[0] += 1
    uid = f'b{_n[0]}'
    if views == 'both':
        vb = '20 40 1408 1390'
        inner = layer('on', load, prio, colors, uid, show_prio) + layer('arka', load, prio, colors, uid, show_prio)
    else:
        vb = '40 40 644 1390' if views == 'on' else '764 40 644 1390'
        inner = layer(views, load, prio, colors, uid, show_prio)
    return f'<svg width="{w}" height="{h}" viewBox="{vb}">{defs(uid)}{inner}</svg>'
