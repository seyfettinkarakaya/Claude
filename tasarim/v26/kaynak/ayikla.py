# Kas görseli (gri zemin) → ön/arka figür (saydam zemin) + 7 kas grubu SVG yolu + ★ rozet noktası.
# Önce govde.py (vücut maskesi). Gruplar: renk kuralı ∩ vücut ∩ bölge dikdörtgeni; bacak = bölgedeki kalan vücut.
import cv2, numpy as np, json
src = cv2.imread('kaslar.jpg')
hsv = cv2.cvtColor(src, cv2.COLOR_BGR2HSV_FULL).astype(np.float32)
H, S, V = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255
def hue(a, b): return ((H >= a) & (H <= b)) if a <= b else ((H >= a) | (H <= b))
C = {
    'turuncu': hue(10, 42) & (S > .38) & (V > .4),
    'mavi': hue(190, 250) & (S > .2),
    'kirmizi': hue(335, 14) & (S > .35),
    'gri': (S < .35) & (V > .3),
    'turkuaz': hue(150, 200) & (S > .2),
    'mor': hue(255, 330) & (S > .12),
    'yesil': hue(70, 160) & (S > .2),
    'acik': (S < .4) & (V > .45),
    'hepsi': np.ones_like(S, bool),
}
VIEW = {'front': (130, 48, 375, 552), 'back': (668, 48, 905, 552)}
body = {v: np.zeros(src.shape[:2], np.uint8) for v in VIEW}
for v, (x0, y0, x1, y1) in VIEW.items():
    body[v][y0:y1, x0:x1] = cv2.imread(f'body_{v}.png', 0) > 0
ROI = {  # sıra önemli: 'hepsi' kuralı öncekilerden kalanı alır
 'Omuz': [('front', (168, 120, 218, 185), 'turuncu'), ('front', (290, 120, 345, 185), 'turuncu'),
          ('back', (700, 120, 760, 180), 'turuncu'), ('back', (812, 120, 872, 180), 'turuncu')],
 'Göğüs': [('front', (198, 128, 310, 200), 'mavi')],
 'Kol': [('front', (160, 160, 210, 240), 'kirmizi'), ('front', (298, 160, 350, 240), 'kirmizi'),
         ('front', (140, 215, 195, 300), 'gri'), ('front', (312, 215, 368, 300), 'gri'),
         ('back', (688, 155, 745, 245), 'kirmizi'), ('back', (825, 155, 885, 245), 'kirmizi'),
         ('back', (678, 220, 730, 300), 'gri'), ('back', (840, 220, 895, 300), 'gri')],
 'Gövde': [('front', (220, 180, 292, 315), 'turkuaz')],
 'Kalça': [('front', (190, 250, 232, 330), 'mor'), ('front', (278, 250, 320, 330), 'mor'),
           ('back', (735, 250, 840, 330), 'mor')],
 'Sırt': [('back', (712, 95, 860, 255), 'yesil')],
}
ROI2 = {  # renksiz bölgeler: vücut − diğer gruplar
 'Gövde': [('back', (748, 215, 826, 268), 'acik')],
 'Bacak': [('front', (186, 305, 326, 552), 'hepsi'), ('back', (722, 318, 852, 552), 'hepsi')],
}
k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
masks = {v: {} for v in VIEW}
def clean(m, close=2):
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, k, iterations=close)
    cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE); cv2.drawContours(m, cs, -1, 255, -1)  # delikleri doldur
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, k)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    keep = np.zeros_like(m)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] >= 80: keep[lab == i] = 255
    return keep
def add(spec, exclude):
    for g, parts in spec.items():
        for v, (x0, y0, x1, y1), rule in parts:
            m = np.zeros(src.shape[:2], np.uint8)
            m[y0:y1, x0:x1] = (C[rule] & (body[v] > 0))[y0:y1, x0:x1].astype(np.uint8) * 255
            if exclude:
                for gg, mm in masks[v].items(): m[mm > 0] = 0
            m = clean(m) & (body[v] * 255)
            masks[v][g] = cv2.bitwise_or(masks[v].get(g, np.zeros_like(m)), m)
add(ROI, False); add(ROI2, True)
out = {}
for v, (x0, y0, x1, y1) in VIEW.items():
    crop = src[y0:y1, x0:x1]
    a = cv2.GaussianBlur((body[v][y0:y1, x0:x1] * 255).astype(np.uint8), (3, 3), 0)
    rgba = cv2.cvtColor(crop, cv2.COLOR_BGR2BGRA); rgba[..., 3] = a
    cv2.imwrite(f'r/{v}.png', rgba)
    out[v] = {'w': x1 - x0, 'h': y1 - y0, 'grup': {}, 'merkez': {}}
    for g, m in masks[v].items():
        mc = m[y0:y1, x0:x1]
        cs, _ = cv2.findContours(mc, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        ds = []
        for c in cs:
            c = cv2.approxPolyDP(c, 1.0, True)
            if len(c) < 3: continue
            ds.append('M' + ' L'.join(f'{p[0][0]},{p[0][1]}' for p in c) + 'Z')
        out[v]['grup'][g] = ' '.join(ds)
        cv2.imwrite(f'r/mask_{g}_{v}.png', mc)
        n, lab, st, _ = cv2.connectedComponentsWithStats(mc, 8)
        if n > 1:
            big = (lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
            _, _, _, (mx, my) = cv2.minMaxLoc(cv2.distanceTransform(big, cv2.DIST_L2, 5))
            out[v]['merkez'][g] = [int(mx), int(my)]
json.dump(out, open('bolgeler.json', 'w'), ensure_ascii=False)
# kontrol: her grup kendi renginde dolgu + çerçeve
col = {'Omuz': (0, 140, 255), 'Göğüs': (255, 80, 0), 'Kol': (0, 0, 255), 'Gövde': (200, 200, 0), 'Kalça': (200, 0, 200), 'Bacak': (0, 220, 255), 'Sırt': (0, 200, 0)}
sh = []
for v, (x0, y0, x1, y1) in VIEW.items():
    d = src[y0:y1, x0:x1].copy() // 3
    for g, m in masks[v].items():
        mc = m[y0:y1, x0:x1] > 0
        d[mc] = (d[mc] * .3 + np.array(col[g]) * .7).astype(np.uint8)
    sh.append(d)
cv2.imwrite('kontrol.png', np.hstack(sh))
print({v: {g: int((m > 0).sum()) for g, m in masks[v].items()} for v in masks})
