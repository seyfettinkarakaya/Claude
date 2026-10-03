# Gemini kas görseli → ön/arka figür (saydam arka plan, etiket çizgileri silinmiş) + kas grubu sınırları (SVG yolları)
import cv2, numpy as np, json
src = cv2.imread('kaslar.jpg')
hsv = cv2.cvtColor(src, cv2.COLOR_BGR2HSV_FULL).astype(np.float32)
H, S, V = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255
def hue(a, b): return ((H >= a) & (H <= b)) if a <= b else ((H >= a) | (H <= b))
C = {  # renk kuralları
    'turuncu': hue(5, 28) & (S > .45) & (V > .35),
    'mavi': hue(195, 235) & (S > .22) & (V > .2),
    'kirmizi': hue(340, 8) & (S > .5) & (V > .3),
    'gri_mavi': hue(180, 240) & (S > .05) & (S < .45) & (V > .18),
    'turkuaz': hue(160, 200) & (S > .2) & (V > .3),
    'mor': hue(265, 325) & (S > .15) & (V > .25),
    'sari': hue(25, 50) & (S > .45) & (V > .3),
    'yesil': hue(75, 150) & (S > .2) & (V > .12),
    'acik_mavi': hue(180, 215) & (S > .2) & (V > .35),
    'acik_gri': (S < .18) & (V > .38),
}
VIEW = {'front': (135, 45, 370, 545), 'back': (675, 45, 905, 545)}
# grup → [(görünüm, bölge dikdörtgeni (x0,y0,x1,y1), renk kuralı)]
ROI = {
 'Omuz': [('front', (172, 128, 207, 178), 'turuncu'), ('front', (298, 128, 334, 178), 'turuncu'),
          ('back', (705, 128, 748, 172), 'turuncu'), ('back', (820, 128, 862, 172), 'turuncu')],
 'Göğüs': [('front', (200, 138, 306, 198), 'mavi')],
 'Kol': [('front', (168, 168, 202, 228), 'kirmizi'), ('front', (303, 168, 338, 228), 'kirmizi'),
         ('front', (148, 212, 188, 298), 'gri_mavi'), ('front', (316, 212, 358, 298), 'gri_mavi'),
         ('back', (692, 160, 738, 232), 'acik_mavi'), ('back', (832, 160, 878, 232), 'acik_mavi'),
         ('back', (686, 214, 728, 292), 'gri_mavi'), ('back', (842, 214, 884, 292), 'gri_mavi')],
 'Gövde': [('front', (222, 190, 288, 306), 'turkuaz'), ('back', (748, 228, 822, 268), 'acik_gri')],
 'Kalça': [('front', (198, 262, 228, 312), 'mor'), ('front', (280, 262, 312, 312), 'mor'), ('back', (742, 252, 832, 322), 'mor')],
 'Bacak': [('front', (192, 292, 312, 398), 'sari'), ('back', (722, 312, 848, 470), 'sari')],
 'Sırt': [('back', (732, 106, 834, 250), 'yesil')],
}
k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
masks = {v: {} for v in VIEW}
for g, parts in ROI.items():
    for v, (x0, y0, x1, y1), rule in parts:
        m = np.zeros(src.shape[:2], np.uint8)
        sub = C[rule][y0:y1, x0:x1].astype(np.uint8) * 255
        m[y0:y1, x0:x1] = sub
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, k, iterations=2)
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, k)
        # yalnızca büyük parçalar
        n, lab, st, _ = cv2.connectedComponentsWithStats(m)
        keep = np.zeros_like(m)
        for i in range(1, n):
            if st[i, cv2.CC_STAT_AREA] >= 60: keep[lab == i] = 255
        masks[v][g] = cv2.bitwise_or(masks[v].get(g, np.zeros_like(m)), keep)
out = {}
for v, (x0, y0, x1, y1) in VIEW.items():
    crop = src[y0:y1, x0:x1].copy()
    hc = hsv[y0:y1, x0:x1]
    # etiket çizgileri: ince, açık, renksiz pikseller → komşu renklerle doldur
    lines = ((hc[..., 1] < 40) & (hc[..., 2] > 150)).astype(np.uint8) * 255
    lines = cv2.dilate(lines, np.ones((3, 3), np.uint8))
    crop = cv2.inpaint(crop, lines, 3, cv2.INPAINT_TELEA)
    # arka plan: koyu pikseller saydam
    g2 = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    a = np.clip((g2.astype(np.float32) - 14) * 12, 0, 255).astype(np.uint8)
    # kenardaki çizgi/yazı kırıntıları: yalnız en büyük bağlı bölge (vücut) kalsın
    n, lab, st, _ = cv2.connectedComponentsWithStats((a > 20).astype(np.uint8), 8)
    if n > 1:
        body = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
        keep = cv2.dilate((lab == body).astype(np.uint8), np.ones((5, 5), np.uint8))
        a = a * keep
    a = cv2.GaussianBlur(a, (3, 3), 0)
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
        # ★ rozeti: en büyük parçanın kenara en uzak (iç) noktası
        n, lab, st, _ = cv2.connectedComponentsWithStats(mc, 8)
        if n > 1:
            big = (lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
            _, _, _, (mx, my) = cv2.minMaxLoc(cv2.distanceTransform(big, cv2.DIST_L2, 5))
            out[v]['merkez'][g] = [int(mx), int(my)]
json.dump(out, open('bolgeler.json', 'w'), ensure_ascii=False)
print({v: {g: len(d) for g, d in out[v]['grup'].items()} for v in out})
