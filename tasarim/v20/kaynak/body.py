# Anatomik vücut haritası (SVG): ön ve arka; kaslar kas grubuna göre renkli.
# Sol yarı tanımlanır, sağ yarı aynalanır (x' = 200 − x). Eğriler Catmull-Rom → Bezier.

def smooth(pts, t=1.0):
    n = len(pts)
    d = f'M{pts[0][0]:.1f},{pts[0][1]:.1f}'
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6 * t, p1[1] + (p2[1] - p0[1]) / 6 * t)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6 * t, p2[1] - (p3[1] - p1[1]) / 6 * t)
        d += f' C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}'
    return d + 'Z'

mir = lambda pts: [(200 - x, y) for x, y in pts]

# Gövde dış hattı (sol yarı, baş tepesinden kasığa)
OUT_L = [(100, 6), (92, 8), (87, 16), (86, 30), (88, 42), (92, 50), (93, 56), (91, 61), (82, 64), (70, 67), (58, 71),
         (50, 79), (47, 92), (47, 106), (46, 122), (44, 138), (42, 152), (40, 168), (37, 184), (35, 198), (32, 208),
         (30, 220), (32, 230), (36, 232), (39, 224), (40, 212), (42, 202), (45, 188), (48, 174), (51, 160), (54, 142),
         (56, 124), (59, 108), (61, 116), (64, 130), (68, 144), (72, 156), (72, 166), (70, 178), (67, 192), (66, 212),
         (67, 236), (69, 258), (71, 272), (70, 288), (67, 306), (68, 326), (72, 352), (75, 376), (74, 392), (73, 400),
         (77, 405), (89, 405), (90, 396), (88, 384), (88, 360), (90, 332), (91, 306), (92, 286), (93, 264), (95, 238),
         (97, 220), (100, 214)]
OUTLINE = OUT_L + mir(OUT_L[1:-1])[::-1]

FRONT = {  # kas: (grup, sol yarı noktaları)
    'deltoid': ('Omuz', [(70, 66), (58, 71), (50, 80), (47, 94), (49, 106), (54, 100), (59, 90), (66, 80), (76, 72)]),
    'pec': ('Göğüs', [(98, 74), (86, 72), (74, 75), (65, 84), (64, 96), (72, 104), (86, 106), (98, 102)]),
    'biceps': ('Kol', [(50, 110), (47, 122), (46, 138), (48, 148), (53, 142), (55, 128), (56, 114)]),
    'forearm': ('Kol', [(44, 156), (41, 170), (38, 186), (37, 198), (40, 200), (44, 186), (48, 172), (50, 158)]),
    'abs1': ('Gövde', [(90, 110), (98, 110), (98, 122), (90, 123)]),
    'abs2': ('Gövde', [(90, 126), (98, 126), (98, 138), (90, 139)]),
    'abs3': ('Gövde', [(90, 142), (98, 142), (98, 155), (91, 156)]),
    'abs4': ('Gövde', [(91, 159), (98, 159), (98, 184), (94, 176)]),
    'oblique': ('Gövde', [(66, 108), (66, 124), (69, 140), (73, 156), (82, 170), (86, 150), (85, 126), (80, 110)]),
    'quad': ('Bacak', [(68, 194), (66, 214), (67, 238), (71, 258), (80, 264), (89, 258), (92, 238), (91, 214), (87, 198), (77, 190)]),
    'adductor': ('Bacak', [(94, 204), (92, 224), (94, 242), (97, 228), (99, 208)]),
    'shin': ('Bacak', [(70, 290), (68, 310), (70, 336), (74, 358), (79, 358), (83, 334), (84, 308), (80, 290)]),
}
BACK = {
    'trap': ('Sırt', None),  # ortada tek parça (aşağıda)
    'reardelt': ('Omuz', [(70, 66), (58, 71), (50, 80), (47, 94), (49, 106), (54, 100), (59, 90), (66, 80), (76, 72)]),
    'lat': ('Sırt', [(62, 100), (61, 114), (65, 130), (71, 146), (80, 158), (90, 162), (90, 128), (83, 112), (73, 100)]),
    'triceps': ('Kol', [(50, 106), (46, 120), (45, 138), (48, 150), (53, 142), (56, 126), (57, 110)]),
    'forearm': ('Kol', [(44, 156), (41, 170), (38, 186), (37, 198), (40, 200), (44, 186), (48, 172), (50, 158)]),
    'erector': ('Gövde', [(94, 122), (92, 146), (93, 170), (98, 178), (98, 122)]),
    'glute': ('Kalça', [(70, 176), (67, 192), (70, 208), (81, 214), (95, 212), (99, 198), (97, 182), (86, 176)]),
    'ham': ('Bacak', [(68, 216), (67, 236), (70, 256), (79, 264), (90, 258), (94, 240), (93, 220), (82, 218)]),
    'calf': ('Bacak', [(69, 290), (66, 306), (67, 326), (72, 342), (80, 340), (85, 320), (84, 300), (78, 288)]),
}
TRAP = [(100, 50), (93, 56), (80, 62), (68, 68), (80, 76), (89, 92), (100, 118), (111, 92), (120, 76), (132, 68), (120, 62), (107, 56)]

def figure(view, load, prio, x0=0, y0=0, scale=1.0, labels=True, colors=None, show_prio=True):
    """load: {grup: 0..1 yoğunluk}; prio: {grup: 0/1/2}."""
    C = colors
    parts = [f'<g transform="translate({x0},{y0}) scale({scale})">',
             f'<path d="{smooth(OUTLINE, 0.9)}" fill="url(#skin)" stroke="#2A3542" stroke-width="1.2"/>']
    muscles = FRONT if view == 'on' else BACK
    def shape(g, d):
        a = 0.18 + 0.8 * load.get(g, 0)
        p = prio.get(g, 0) if show_prio else 0
        st = f'stroke="#F5A524" stroke-width="{1.3 if p == 1 else 2}" filter="url(#glow)"' if p else 'stroke="#0B0F14" stroke-width="1"'
        return f'<path d="{d}" fill="{C[g]}" fill-opacity="{a:.2f}" {st}/>'
    if view == 'arka':
        parts.append(shape('Sırt', smooth(TRAP, 0.8)))
    for k, (g, pts) in muscles.items():
        if pts is None:
            continue
        parts.append(shape(g, smooth(pts, 0.85)))
        parts.append(shape(g, smooth(mir(pts), 0.85)))
    # baş/boyun gölgesi ve orta çizgi
    # kas başlarını ayıran ince çizgiler (uyluk, baldır, göğüs alt kenarı)
    lines = (['M79,196 C78,220 80,244 84,262', 'M70,94 C78,102 88,105 98,104'] if view == 'on'
             else ['M80,220 C80,236 80,250 80,262', 'M76,292 C76,306 76,322 76,340'])
    for d in lines:
        for dd in (d, ' '.join(f'{200 - float(t.split(",")[0]):.0f},{t.split(",")[1]}' if ',' in t else t for t in d.replace('M', 'M ').replace('C', 'C ').split())):
            parts.append(f'<path d="{dd}" fill="none" stroke="#0B0F14" stroke-width="1.4" opacity=".75"/>')
    parts.append('<path d="M100,108 L100,184" stroke="#0B0F14" stroke-width="1.2" opacity=".6"/>' if view == 'on' else '')
    parts.append('</g>')
    return ''.join(parts)

DEFS = '''<defs>
<linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#202B38"/><stop offset="1" stop-color="#151C25"/></linearGradient>
<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>'''
