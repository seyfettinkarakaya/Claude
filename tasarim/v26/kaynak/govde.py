# Gri zeminden vücut maskesi: doygunluk tohumu + grabCut, en büyük bağlı bölge
import cv2, numpy as np
src = cv2.imread('kaslar.jpg')
hsv = cv2.cvtColor(src, cv2.COLOR_BGR2HSV_FULL)
VIEW = {'front': (130, 48, 375, 552), 'back': (668, 48, 905, 552)}
out = {}
for v, (x0, y0, x1, y1) in VIEW.items():
    c = src[y0:y1, x0:x1]; s = hsv[y0:y1, x0:x1, 1]
    m = np.full(c.shape[:2], cv2.GC_PR_BGD, np.uint8)
    m[s > 90] = cv2.GC_PR_FGD
    m[cv2.erode((s > 110).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0] = cv2.GC_FGD
    m[:, :3] = m[:, -3:] = cv2.GC_BGD; m[:3, :] = cv2.GC_BGD
    bg, fg = np.zeros((1, 65)), np.zeros((1, 65))
    cv2.grabCut(c, m, None, bg, fg, 6, cv2.GC_INIT_WITH_MASK)
    b = ((m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD)).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(b, 8)
    b = (lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
    # içteki delikleri doldur
    cs, _ = cv2.findContours(b, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    b = np.zeros_like(b); cv2.drawContours(b, cs, -1, 1, -1)
    cv2.imwrite(f'body_{v}.png', b * 255)
    dbg = c.copy(); dbg[b == 0] = (dbg[b == 0] * .25).astype(np.uint8)
    out[v] = dbg
cv2.imwrite('govde_kontrol.png', np.hstack([out['front'], cv2.resize(out['back'], (out['back'].shape[1], out['front'].shape[0]))]))
