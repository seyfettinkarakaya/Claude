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
OUT_L = [(100, 6), (90, 9), (84, 18), (83, 32), (86, 44), (90, 52), (90, 58), (80, 63), (66, 67), (54, 72), (46, 82),
         (43, 98), (41, 118), (38, 140), (35, 160), (32, 180), (29, 198), (26, 210), (23, 222), (25, 236), (31, 240),
         (35, 232), (37, 218), (40, 206), (45, 186), (50, 166), (54, 148), (57, 128), (60, 108), (61, 124), (62, 140),
         (65, 158), (63, 174), (59, 190), (57, 210), (58, 236), (61, 260), (64, 280), (62, 300), (61, 322), (64, 348),
         (68, 378), (66, 394), (70, 404), (88, 405), (89, 394), (86, 378), (87, 350), (89, 322), (90, 298), (92, 276),
         (94, 250), (96, 226), (100, 214)]
OUTLINE = OUT_L + mir(OUT_L[1:-1])[::-1]

FRONT = {  # kas: (grup, sol yarı noktaları)
    'deltoid': ('Omuz', [(68, 67), (56, 72), (48, 84), (45, 100), (50, 108), (57, 96), (64, 84), (74, 74)]),
    'pec': ('Göğüs', [(98, 76), (86, 73), (73, 78), (66, 89), (68, 102), (78, 109), (91, 109), (98, 104)]),
    'biceps': ('Kol', [(50, 112), (45, 126), (44, 142), (47, 152), (53, 146), (56, 130), (57, 116), (54, 110)]),
    'forearm': ('Kol', [(42, 158), (37, 174), (33, 192), (32, 202), (37, 204), (43, 188), (48, 170), (51, 158), (47, 154)]),
    'abs1': ('Gövde', [(89, 113), (98, 113), (98, 125), (89, 126)]),
    'abs2': ('Gövde', [(89, 129), (98, 129), (98, 141), (89, 142)]),
    'abs3': ('Gövde', [(89, 145), (98, 145), (98, 158), (90, 159)]),
    'abs4': ('Gövde', [(91, 162), (98, 162), (98, 188), (94, 180)]),
    'oblique': ('Gövde', [(64, 114), (63, 134), (66, 154), (73, 170), (85, 182), (86, 158), (85, 130), (80, 114)]),
    'quad': ('Bacak', [(62, 200), (59, 222), (61, 248), (67, 268), (79, 274), (89, 266), (92, 242), (90, 214), (86, 198), (74, 192)]),
    'adductor': ('Bacak', [(94, 206), (91, 228), (93, 248), (97, 232), (99, 210)]),
    'shin': ('Bacak', [(65, 290), (62, 312), (64, 340), (70, 364), (78, 364), (82, 338), (83, 310), (78, 290)]),
}
BACK = {
    'trap': ('Sırt', None),  # ortada tek parça (aşağıda)
    'reardelt': ('Omuz', [(68, 67), (56, 72), (48, 84), (45, 100), (50, 108), (57, 96), (64, 84), (74, 74)]),
    'lat': ('Sırt', [(64, 100), (61, 116), (64, 136), (72, 154), (83, 166), (90, 168), (90, 132), (84, 116), (74, 104)]),
    'triceps': ('Kol', [(50, 108), (44, 124), (43, 142), (47, 154), (54, 146), (57, 128), (58, 112)]),
    'forearm': ('Kol', [(42, 158), (37, 174), (33, 192), (32, 202), (37, 204), (43, 188), (48, 170), (51, 158), (47, 154)]),
    'erector': ('Gövde', [(94, 126), (92, 150), (93, 176), (98, 184), (98, 126)]),
    'glute': ('Kalça', [(62, 184), (58, 202), (61, 220), (77, 230), (95, 226), (99, 208), (97, 190), (84, 182)]),
    'ham': ('Bacak', [(61, 232), (59, 252), (63, 272), (75, 280), (89, 274), (94, 254), (92, 236), (80, 235)]),
    'calf': ('Bacak', [(64, 292), (60, 310), (62, 332), (69, 348), (79, 346), (84, 324), (82, 302), (76, 290)]),
}
TRAP = [(100, 50), (90, 58), (76, 64), (66, 70), (78, 80), (88, 96), (100, 124), (112, 96), (122, 80), (134, 70), (124, 64), (110, 58)]

def figure(view, load, prio, x0=0, y0=0, scale=1.0, labels=True, colors=None, show_prio=True):
    """load: {grup: 0..1 yoğunluk}; prio: {grup: 0/1/2}."""
    C = colors
    parts = [f'<g transform="translate({x0},{y0}) scale({scale})">',
             f'<path d="{smooth(OUTLINE, 0.9)}" fill="url(#skin)" stroke="#2A3542" stroke-width="1.2"/>']
    muscles = FRONT if view == 'on' else BACK
    def shape(g, d):
        a = 0.18 + 0.8 * load.get(g, 0)
        p = prio.get(g, 0) if show_prio else 0
        st = f'stroke="#F5A524" stroke-width="{1.6 if p == 1 else 2.6}" filter="url(#glow)"' if p else 'stroke="#0B0F14" stroke-width="1"'
        return f'<path d="{d}" fill="{C[g]}" fill-opacity="{a:.2f}" {st}/>'
    if view == 'arka':
        parts.append(shape('Sırt', smooth(TRAP, 0.8)))
    for k, (g, pts) in muscles.items():
        if pts is None:
            continue
        parts.append(shape(g, smooth(pts, 0.85)))
        parts.append(shape(g, smooth(mir(pts), 0.85)))
    # baş/boyun gölgesi ve orta çizgi
    parts.append('<path d="M100,60 L100,196" stroke="#0B0F14" stroke-width="1" opacity=".5"/>' if view == 'on' else '')
    parts.append('</g>')
    return ''.join(parts)

DEFS = '''<defs>
<linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#202B38"/><stop offset="1" stop-color="#151C25"/></linearGradient>
<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>'''
