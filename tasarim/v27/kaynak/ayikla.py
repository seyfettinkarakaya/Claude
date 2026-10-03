# Kas görseli (siyah zemin, gri vücut, renkli kaslar) → uygulama varlıkları, her görünüm (ön/arka) için:
#   r/{v}.webp       renkli figür (saydam zemin)
#   r/{v}_gri.webp   aynı figür, kaslar gri (seçili olmayan kaslar bu katmanda kalır)
#   r/{v}_{grup}.png yumuşak kenarlı grup maskesi, 2× çözünürlük (CSS mask-image)
#   r/{v}_hit.png    dokunma haritası: piksel değeri = grup no (0 = boş); kasın R px çevresi de o gruba
#   bolgeler.json    boyutlar, grup sırası, ★ rozet noktaları
# Gruplar renkten gelir (çizimin kendi kas sınırları); aynı renkli kaslar (biseps / ön kol, sırt / triseps)
# çizimdeki kas çizgilerine göre watershed ile ayrılır, sonra her grup kendi rengine boyanır (RENK).
import cv2, numpy as np, json
src = cv2.imread('kaslar.jpg')
hsv = cv2.cvtColor(src, cv2.COLOR_BGR2HSV_FULL).astype(np.float32)
H, S, V = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255
def hue(a, b): return ((H >= a) & (H <= b)) if a <= b else ((H >= a) | (H <= b))
GRUP = ['Omuz', 'Göğüs', 'Biseps', 'Triseps', 'Ön kol', 'Sırt', 'Karın', 'Kalça', 'Kalça yanı', 'Bacak']
ID = {g: i + 1 for i, g in enumerate(GRUP)}
# her grup kendi rengi (çizimdeki renkler grupları ayırmıyor: biseps = ön kol, kalça = kalça yanı …)
RENK = {'Omuz': '#F4C430', 'Göğüs': '#3D6FE8', 'Biseps': '#E5423A', 'Triseps': '#33B5F0', 'Ön kol': '#F06BAE',
        'Sırt': '#3DB24B', 'Karın': '#1EC6B8', 'Kalça': '#9A4FE6', 'Kalça yanı': '#A8D838', 'Bacak': '#F5862A'}
VIEW = {'front': (138, 45, 368, 548), 'back': (676, 45, 894, 548)}
yy, xx = np.mgrid[0:src.shape[0], 0:src.shape[1]]
sat = (S > .26) & (V > .18)
body = (V > .1).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(body, 8)
body = np.isin(lab, [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > 5000]).astype(np.uint8)
warm, yellow = hue(330, 44), hue(44, 72)
L = np.zeros(src.shape[:2], np.int32)
front, back = xx < 512, xx >= 512
# mor: arkada en büyük parça kalça (glutes), kalanı kalça yanı (önde kalça fleksörü, arkada abdüktör)
purple = (sat & hue(250, 330)).astype(np.uint8)
purple = cv2.morphologyEx(purple, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
L[purple > 0] = ID['Kalça yanı']
n, lab, st, _ = cv2.connectedComponentsWithStats(purple * back.astype(np.uint8), 8)
if n > 1: L[lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))] = ID['Kalça']
L[sat & front & hue(150, 200)] = ID['Karın']
L[sat & front & hue(200, 250)] = ID['Göğüs']
thigh = front & (yy > 240) & (xx > 188) & (xx < 324)  # ön uyluk üstü kol hizasına çıkar
L[sat & (warm | yellow) & ((yy > 288) | thigh)] = ID['Bacak']
L[sat & yellow & (yy < 210)] = ID['Omuz']
L[sat & warm & (yy <= 288) & back & ((xx < 742) | (xx > 830))] = ID['Ön kol']
def split(region, seeds):
    # watershed: tohumlar elle, sınır çizimdeki kas çizgilerinden
    mk = np.zeros(src.shape[:2], np.int32); mk[~region] = 99
    for (x0, y0, x1, y1), g in seeds:
        r = region[y0:y1, x0:x1]; mk[y0:y1, x0:x1][r] = ID[g]
    ws = cv2.watershed(src, mk)
    for _, g in seeds: L[region & (ws == ID[g])] = ID[g]
# ön kol (önden): kırmızı = biseps + ön kol, dirsek çizgisinden ayrılır
arm = sat & warm & (yy <= 288) & front & ~thigh
split(arm, [((172, 182, 196, 204), 'Biseps'), ((306, 182, 330, 204), 'Biseps'),
            ((158, 238, 184, 266), 'Ön kol'), ((320, 238, 346, 266), 'Ön kol')])
# sırttaki yeşil: sırt + triseps, koltuk altı çizgisinden ayrılır
green = (S > .16) & (V > .07) & back & hue(70, 170) & (yy < 306)
green = cv2.morphologyEx(green.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)).astype(bool)
split(green, [((765, 125, 805, 250), 'Sırt'), ((750, 200, 820, 250), 'Sırt'), ((740, 150, 760, 200), 'Sırt'), ((812, 150, 832, 200), 'Sırt'),
              ((700, 185, 718, 235), 'Triseps'), ((852, 185, 872, 235), 'Triseps')])
k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
masks = {}
for g in GRUP:
    m = (L == ID[g]).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, k, iterations=2)       # kas içi lif çizgileri
    cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    m = np.zeros_like(m)
    for c in cs:
        if cv2.contourArea(c) >= 40: cv2.drawContours(m, [c], -1, 255, -1)
    masks[g] = m & (body * 255)
# çakışma: önce gelen grup kalsın
taken = np.zeros(src.shape[:2], bool)
for g in GRUP:
    masks[g][taken] = 0; taken |= masks[g] > 0
out = {'grup': GRUP, 'renk': RENK}
# yeniden boyama (Lab): grubun dokusu (L) korunur, ortalama aydınlık ve renk (a, b) grubun rengine çekilir
lab = cv2.cvtColor(src, cv2.COLOR_BGR2LAB).astype(np.float32)
rec = lab.copy()
for g in GRUP:
    m = cv2.dilate(masks[g], np.ones((5, 5), np.uint8)) > 0
    m &= body > 0
    if not m.any(): continue
    r, gg, b = (int(RENK[g][i:i + 2], 16) for i in (1, 3, 5))
    t = cv2.cvtColor(np.uint8([[[b, gg, r]]]), cv2.COLOR_BGR2LAB)[0, 0].astype(np.float32)
    Lg = lab[..., 0][masks[g] > 0]
    rec[..., 0][m] = np.clip((lab[..., 0][m] - Lg.mean()) * .85 + t[0] * .92, t[0] * .55, 255)  # gölge lekeleri kararmasın
    rec[..., 1][m] = t[1] + (lab[..., 1][m] - lab[..., 1][masks[g] > 0].mean()) * .15
    rec[..., 2][m] = t[2] + (lab[..., 2][m] - lab[..., 2][masks[g] > 0].mean()) * .15
rec = cv2.cvtColor(np.clip(rec, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
gray = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY)
for v, (x0, y0, x1, y1) in VIEW.items():
    w, h = x1 - x0, y1 - y0
    a = cv2.GaussianBlur(body[y0:y1, x0:x1] * 255, (3, 3), 0)
    rgba = cv2.cvtColor(rec[y0:y1, x0:x1], cv2.COLOR_BGR2BGRA); rgba[..., 3] = a
    cv2.imwrite(f'r/{v}.png', rgba)
    # gri katman: kaslar, vücudun gri tonuna yakın, hafif koyu
    gc = gray[y0:y1, x0:x1].astype(np.float32)
    # her grup kendi ortalamasından vücudun orta grisine kaydırılır: doku kalır, grup sınırı görünmez
    ref = float(np.median(gc[(body[y0:y1, x0:x1] > 0) & ~taken[y0:y1, x0:x1]]))
    for g in GRUP:
        mg = masks[g][y0:y1, x0:x1] > 0
        if mg.any(): gc[mg] = (gc[mg] - gc[mg].mean()) * .8 + ref * .92
    gc = np.where(taken[y0:y1, x0:x1], cv2.GaussianBlur(gc, (3, 3), 0), gc)
    g3 = cv2.cvtColor(np.clip(gc, 0, 255).astype(np.uint8), cv2.COLOR_GRAY2BGRA); g3[..., 3] = a
    cv2.imwrite(f'r/{v}_gri.png', g3)
    o = {'w': w, 'h': h, 'merkez': {}}
    hit = np.zeros((h, w), np.uint8)
    for g in GRUP:
        mc = masks[g][y0:y1, x0:x1]
        if mc.sum() == 0: continue
        hit[mc > 0] = ID[g]
        # 2× yumuşak kenar
        big = cv2.resize(cv2.GaussianBlur(mc.astype(np.float32) / 255, (0, 0), .8), (w * 2, h * 2), interpolation=cv2.INTER_CUBIC)
        al = np.clip((big - .5) * 3 + .5, 0, 1)
        mm = np.zeros((h * 2, w * 2, 4), np.uint8); mm[..., 3] = (al * 255).astype(np.uint8)
        cv2.imwrite(f'r/{v}_{g}.png', mm)
        n, lb, stt, _ = cv2.connectedComponentsWithStats(mc, 8)
        bigc = (lb == 1 + int(np.argmax(stt[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
        _, _, _, (mx, my) = cv2.minMaxLoc(cv2.distanceTransform(bigc, cv2.DIST_L2, 5))
        # simetrik grup (göğüs, kalça): ağırlık merkezi kasa çok yakınsa ortaya koy
        cy_, cx_ = [int(round(t)) for t in np.argwhere(mc > 0).mean(axis=0)]
        if cv2.dilate(mc, np.ones((15, 15), np.uint8))[cy_, cx_]: mx, my = cx_, cy_
        o['merkez'][g] = [int(mx), int(my)]
        col = src[y0:y1, x0:x1][mc > 0].reshape(-1, 3).astype(np.float32)
        hh = cv2.cvtColor(col.reshape(-1, 1, 3).astype(np.uint8), cv2.COLOR_BGR2HSV)
        b, gg, r = np.median(col, axis=0)
    # dokunma toleransı: boş piksele en yakın kas (R px içinde)
    R = 9
    _, near = cv2.distanceTransformWithLabels((hit == 0).astype(np.uint8), cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
    dist = cv2.distanceTransform((hit == 0).astype(np.uint8), cv2.DIST_L2, 5)
    ys, xs = np.where(hit > 0)
    lut = np.zeros(near.max() + 1, np.uint8)
    lut[near[ys, xs]] = hit[ys, xs]
    ext = lut[near]; ext[dist > R] = 0; ext[hit > 0] = hit[hit > 0]
    cv2.imwrite(f'r/{v}_hit.png', ext * 20)  # 20, 40, … (renk dönüşümüne dayanıklı)
    out[v] = o
json.dump(out, open('bolgeler.json', 'w'), ensure_ascii=False, indent=1)
# kontrol görseli: grup sınırları beyaz, gruplar kendi renginde, numara
sh = []
for v, (x0, y0, x1, y1) in VIEW.items():
    d = cv2.resize(src[y0:y1, x0:x1], None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    d = (d * .45).astype(np.uint8)
    for g in GRUP:
        mc = cv2.resize(masks[g][y0:y1, x0:x1], None, fx=2, fy=2, interpolation=cv2.INTER_NEAREST)
        if not mc.any(): continue
        cs, _ = cv2.findContours(mc, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        reg = mc > 0
        d[reg] = (cv2.resize(rec[y0:y1, x0:x1], None, fx=2, fy=2)[reg])
        cv2.drawContours(d, cs, -1, (255, 255, 255), 1)
        cx, cy = out[v]['merkez'][g]
        cv2.putText(d, g[:4], (cx * 2 - 14, cy * 2 + 5), cv2.FONT_HERSHEY_SIMPLEX, .45, (255, 255, 255), 1, cv2.LINE_AA)
    sh.append(d)
hmax = max(s.shape[0] for s in sh)
cv2.imwrite('kontrol.png', np.hstack([np.pad(s, ((0, hmax - s.shape[0]), (0, 0), (0, 0))) for s in sh]))
print(out['renk'], {v: out[v]['merkez'] for v in VIEW})
