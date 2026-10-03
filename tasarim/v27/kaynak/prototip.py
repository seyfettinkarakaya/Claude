# Dokunmatik kas haritası prototipi (tek dosya) → ../prototip.html
# Katmanlar: gri figür + her grup için maskeli renkli figür. Dokunma: piksel haritası (_hit.png).
import json, base64
B = json.load(open('bolgeler.json'))
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
A = {}
for v in ('front', 'back'):
    A[v] = {'col': 'data:image/webp;base64,' + b64(f'r/{v}.webp'), 'gri': 'data:image/webp;base64,' + b64(f'r/{v}_gri.webp'),
            'hit': 'data:image/png;base64,' + b64(f'r/{v}_hit.png'), 'w': B[v]['w'], 'h': B[v]['h'], 'merkez': B[v]['merkez'],
            'mask': {g: 'data:image/png;base64,' + b64(f'r/{v}_{g}.png') for g in B[v]['merkez']}}
fonts = open('/home/user/Claude/fonts/fonts.css').read()
for f in ('archivo-var-latin.woff2', 'archivo-var-latin-ext.woff2'):
    fonts = fonts.replace(f'url({f})', 'url(data:font/woff2;base64,' + b64('/home/user/Claude/fonts/' + f) + ')')
DATA = {
    'grup': B['grup'],
    'renk': {'Omuz': '#E6C229', 'Göğüs': '#4169E1', 'Kol': '#D2453F', 'Sırt': '#3FA34A', 'Gövde': '#20BDBD', 'Kalça': '#A346D9', 'Bacak': '#F28A1C'},
    'kas': {'Omuz': 'Ön, yan ve arka omuz', 'Göğüs': 'Büyük ve küçük göğüs', 'Kol': 'Biseps, triseps, ön kol', 'Sırt': 'Kanat, trapez, romboid',
            'Gövde': 'Karın, yan karın, bel', 'Kalça': 'Kalça kasları', 'Bacak': 'Ön/arka bacak, baldır'},
    # örnek oranlar: son 4 hafta %, tüm zaman %
    'oran': {'Sırt': [38, 27], 'Gövde': [9, 19], 'Göğüs': [12, 13], 'Omuz': [16, 14], 'Kol': [14, 9], 'Kalça': [6, 10], 'Bacak': [5, 8]},
    'hareket': {'Omuz': ['Overhead press', 'Yana açış', 'Face pull'], 'Göğüs': ['Bench press', 'Şınav', 'Dumbbell fly'],
                'Kol': ['Biceps curl', 'Triceps pushdown', 'Çekiç curl'], 'Sırt': ['Barfiks', 'Lat pulldown', 'Kürek çekiş'],
                'Gövde': ['Plank', 'Dead bug', 'Pallof press'], 'Kalça': ['Hip thrust', 'Romanian deadlift', 'Glute bridge'],
                'Bacak': ['Squat', 'Lunge', 'Leg press']},
    'a': A,
}
html = open('sablon.html').read().replace('/*FONTS*/', fonts).replace('/*DATA*/', json.dumps(DATA, ensure_ascii=False))
open('../prototip.html', 'w').write(html)
import os; print(os.path.getsize('../prototip.html') // 1024, 'KB')
