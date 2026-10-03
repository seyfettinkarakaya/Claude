# id_{view}.png (gruplar saf renkte) → mask_{grup}_{view}.png (beyaz, alfa = grup)
import numpy as np, sys
from PIL import Image, ImageFilter
GR = ['Göğüs', 'Omuz', 'Sırt', 'Gövde', 'Kalça', 'Bacak', 'Kol']
COL = [(1,0,0),(0,1,0),(0,0,1),(1,1,0),(1,0,1),(0,1,1),(1,1,1)]
d = sys.argv[1]
for v in ('front', 'back'):
    im = np.asarray(Image.open(f'{d}/id_{v}.png').convert('RGBA')).astype(float) / 255
    rgb, a = im[..., :3], im[..., 3]
    for g, c in zip(GR, COL):
        dist = np.linalg.norm(rgb - np.array(c), axis=-1)
        m = ((dist < 0.35) & (a > 0.5)).astype(np.uint8) * 255
        mi = Image.fromarray(m, 'L').filter(ImageFilter.GaussianBlur(0.7))
        out = Image.new('RGBA', mi.size, (255, 255, 255, 0)); out.putalpha(mi)
        out.save(f'{d}/mask_{g}_{v}.png', optimize=True)
        print(v, g, int(m.sum() / 255))
