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
    'renk': B['renk'],
    'kas': {'Omuz': 'Deltoid: ön, yan, arka', 'Göğüs': 'Büyük ve küçük göğüs', 'Biseps': 'Kolun ön yüzü', 'Triseps': 'Kolun arka yüzü',
            'Ön kol': 'Bilek ve kavrama kasları', 'Sırt': 'Kanat, trapez, romboid', 'Karın': 'Core: düz ve yan karın',
            'Kalça': 'Gluteus (kalça kasları)', 'Kalça yanı': 'Kalça fleksörü ve abdüktör', 'Bacak': 'Ön/arka bacak, baldır'},
    # örnek oranlar: son 4 hafta %, tüm zaman %
    'oran': {'Sırt': [30, 22], 'Karın': [8, 15], 'Göğüs': [12, 13], 'Omuz': [12, 11], 'Biseps': [9, 6], 'Triseps': [8, 6],
             'Ön kol': [4, 3], 'Kalça': [6, 9], 'Kalça yanı': [3, 5], 'Bacak': [8, 10]},
    'hareket': {'Omuz': ['Overhead press', 'Yana açış', 'Face pull'], 'Göğüs': ['Bench press', 'Şınav', 'Dumbbell fly'],
                'Biseps': ['Biceps curl', 'Çekiç curl', 'Chin-up'], 'Triseps': ['Triceps pushdown', 'Dips', 'Overhead extension'],
                'Ön kol': ['Bilek curl', "Farmer's walk", 'Asılı durma'], 'Sırt': ['Barfiks', 'Lat pulldown', 'Kürek çekiş'],
                'Karın': ['Plank', 'Dead bug', 'Pallof press'], 'Kalça': ['Hip thrust', 'Romanian deadlift', 'Glute bridge'],
                'Kalça yanı': ['Band yürüyüş', 'Yan plank abdüksiyon', 'Hip flexör march'], 'Bacak': ['Squat', 'Lunge', 'Leg press']},
    'a': A,
}
html = open('sablon.html').read().replace('/*FONTS*/', fonts).replace('/*DATA*/', json.dumps(DATA, ensure_ascii=False))
open('../prototip.html', 'w').write(html)
import os; print(os.path.getsize('../prototip.html') // 1024, 'KB')
