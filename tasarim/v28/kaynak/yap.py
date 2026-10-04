# Hareket kütüphanesi örnek ekranları (exercises-dataset tabanlı). Çıktı: tasarim/v28/ornek.html
# Veri: exercises-dataset (MIT) — data/exercises.json yolu argüman. Animasyonlar © Gym visual: lisanssız kullanılamaz.
# Bu yüzden ornek.html depoya konmaz (.gitignore); yalnızca yerelde, değerlendirme için üretilir.
#   python3 yap.py /yol/exercises-dataset/data/exercises.json
import html
import json
import sys

d = json.load(open(sys.argv[1]))
by = {e['name']: e for e in d}
RAW = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/'
EQ = {'band': 'Bant', 'resistance band': 'Bant', 'body weight': 'Vücut', 'dumbbell': 'Dambıl', 'cable': 'Kablo'}
MU = {'abs': 'karın', 'obliques': 'yan karın', 'glutes': 'kalça', 'lats': 'kanat (lat)', 'delts': 'omuz', 'upper back': 'üst sırt'}
TR = {
    'band horizontal pallof press': 'Bantla Pallof press', 'dead bug': 'Dead bug', 'russian twist': 'Rus dönüşü',
    'band underhand pulldown': 'Bantla ters tutuş çekiş', 'resistance band seated straight back row': 'Bantla oturarak kürek',
    'band standing rear delt row': 'Bantla arka omuz kürek', 'low glute bridge on floor': 'Yerde kalça köprüsü',
    'kneeling lat stretch': 'Diz çökerek lat esneme', 'pull up (neutral grip)': 'Barfiks (nötr tutuş)', 'push-up': 'Şınav',
    'band y-raise': 'Bantla Y kaldırış', 'band reverse fly': 'Bantla ters fly',
    'cable standing shoulder external rotation': 'Kabloyla omuz dış rotasyon',
}
E = html.escape


def gif(n):
    return RAW + by[n]['gif_url']


def chip(t, on=False):
    return f'<span class="ch{" on" if on else ""}">{E(t)}</span>'


# 1. Kütüphane
lib = ['band y-raise', 'band reverse fly', 'band standing rear delt row', 'cable standing shoulder external rotation']
cards = ''.join(
    f'<div class="lc"><img src="{gif(n)}" alt=""><b>{TR[n]}</b><small>{EQ.get(by[n]["equipment"], by[n]["equipment"])} · {MU.get(by[n]["target"], by[n]["target"])}</small></div>'
    for n in lib)
s1 = f'''<div class="ph"><div class="hd"><span class="bk">‹</span><h1>Hareket kütüphanesi</h1></div>
<div class="srch">⌕ Hareket ara…</div>
<p class="lb">VÜCUT BÖLGESİ</p><div class="chs">{chip("Omuz", True)}{chip("Sırt")}{chip("Karın")}{chip("Göğüs")}{chip("Kol")}{chip("Üst bacak")}{chip("Alt bacak")}</div>
<p class="lb">EKİPMAN</p><div class="chs">{chip("Bant", True)}{chip("Vücut")}{chip("Dambıl")}{chip("Kablo")}{chip("Top")}</div>
<p class="lb">OMUZ · BANT <span class="r">⊘ kısıtlılar gizli</span></p>
<div class="grid">{cards}</div><p class="att">Animasyonlar © Gym visual — gymvisual.com</p></div>'''

# 2. Hareket kartı
n2 = 'band horizontal pallof press'
steps = ''.join(f'<li>{E(t)}</li>' for t in by[n2]['instruction_steps']['tr'])
s2 = f'''<div class="ph"><div class="hd"><span class="bk">‹</span><h1>{TR[n2]}</h1></div>
<div class="big"><img src="{gif(n2)}" alt=""><span class="loop">⟳ animasyon</span></div>
<div class="tags">{chip("Karın")}{chip("Bant")}{chip("Rehab · core")}</div>
<div class="kas"><div><small>HEDEF</small><b>karın</b></div><div><small>YARDIMCI</small><b>yan karın · kalça</b></div><div><small>YÜZMEYE</small><b>0,9</b></div></div>
<p class="ok">✓ Kısıtına uygun</p>
<p class="lb">NASIL YAPILIR</p><ol class="st">{steps}</ol>
<p class="lb">SON İDMANLAR</p><p class="son">20 Eyl · 3 × 12 · RPE 6</p>
<div class="btn">＋ Plana ekle</div><p class="att">Animasyon © Gym visual — gymvisual.com · metin: exercises-dataset (MIT)</p></div>'''

# 3. Hareket seçimi
sel = [('band standing rear delt row', 94, True, 'Omuz %60 · Sırt %40'), ('band y-raise', 88, False, 'Omuz %70 · Sırt %30'),
       ('cable standing shoulder external rotation', 85, False, 'Omuz %100 · önleyici borcu'),
       ('band horizontal pallof press', 71, True, 'Karın %80 · Kalça %20')]
rows = ''.join(
    f'<div class="sx{" on" if on else ""}"><img src="{gif(n)}" alt=""><span class="sm"><b>{TR[n]}</b><small>{t}</small><small class="pu">PUAN {p}</small></span><span class="add">{"✓" if on else "+"}</span></div>'
    for n, p, on, t in sel)
s3 = f'''<div class="ph"><div class="hd"><span class="bk">‹</span><h1>Hareket seç</h1></div>
<p class="note">Omuz ve Karın seçili · yüzmeye etkiye göre sıralı. Animasyona dokun → kart.</p>{rows}
<div class="tray">2 hareket · ~18 dk · Omuz %55 · Karın %35</div></div>'''

# 4. Eşleme (senin 16 hareketin)
M = [('Band Bent Over Row', 'band standing rear delt row', 'a'), ('Band Lat Pulldown', 'band underhand pulldown', 'a'),
     ('Band Pallof Press', 'band horizontal pallof press', 'y'), ('Band Seated Row', 'resistance band seated straight back row', 'y'),
     ('Deadbug', 'dead bug', 'y'), ('Russian Twist', 'russian twist', 'y'), ('Standard Pull-up', 'pull up (neutral grip)', 'a'),
     ('Push-up (Standard)', 'push-up', 'y'), ('Band Glute Bridge', 'low glute bridge on floor', 'a'),
     ('Lat Stretch (Wall/Overhead)', 'kneeling lat stretch', 'a'), ('Breathing Reset (Supine, Nazal)', None, 'v'),
     ('Doorway Pec Stretch', None, 'v'), ('Thread the Needle', None, 'v'), ('Figure Four Stretch', None, 'v'),
     ('Dead Hang (Passive → Active)', None, 'v'), ('Band Chest Fly', None, 'v')]
ISARET = {'y': '✓', 'a': '≈', 'v': '▶'}


def esle(ad, n, k):
    res = f'<img src="{gif(n)}" alt="">' if n else '<span class="nv">▶</span>'
    alt = E(n) if n else 'veri setinde yok → H · Video (YouTube)'
    return f'<div class="mr"><span class="mk {k}">{ISARET[k]}</span>{res}<span class="sm"><b>{E(ad)}</b><small>{alt}</small></span></div>'


say = {k: sum(1 for x in M if x[2] == k) for k in 'yav'}
s4 = f'''<div class="ph"><div class="hd"><span class="bk">‹</span><h1>Eşleme · 16 hareketin</h1></div>
<p class="note"><b>{say["y"]}</b> birebir ✓ · <b>{say["a"]}</b> yakın ≈ (onayla ya da değiştir) · <b>{say["v"]}</b> video ▶</p>{''.join(esle(*x) for x in M)}</div>'''

css = open(__file__.replace('yap.py', 'stil.css')).read()
caps = [('1 · KÜTÜPHANE', 'Vücut bölgesi + ekipman süzgeci (veri setinin kendi gruplaması, Türkçeleştirildi); kısıtlı hareketler gizli.'),
        ('2 · HAREKET KARTI', 'Animasyon, Türkçe adımlar (veri setinde hazır), hedef/yardımcı kas, kısıt notu, son idman, Plana ekle.'),
        ('3 · HAREKET SEÇİMİ', 'Planlamada her öneri kartında animasyonlu küçük resim; dokununca kart açılır.'),
        ('4 · EŞLEME', 'Senin hareket adların ↔ veri setindeki karşılığı: ✓ birebir, ≈ yakın (onaylanır), ▶ yok → video.')]
body = ''.join(f'<div><div class="cap"><h2>{h}</h2><p>{p}</p></div>{s}</div>' for (h, p), s in zip(caps, [s1, s2, s3, s4]))
out = f'<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Hareket kütüphanesi örnekleri</title><style>{css}</style></head><body><div class="wrap">{body}</div></body></html>'
open(__file__.replace('kaynak/yap.py', 'ornek.html'), 'w').write(out)
print('tamam', say)
