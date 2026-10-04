# Hareket bilgi kartı örnekleri (3 hareket) → ../kartlar.html
# Fotoğraflar: free-exercise-db (yuhonas, Unlicense / kamu malı). Kas haritası: v27 (kullanıcının görseli).
import base64, json, os

K = os.path.dirname(os.path.abspath(__file__))
V27 = os.path.join(K, '../../v27/kaynak')
B = json.load(open(os.path.join(V27, 'bolgeler.json')))
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
SLUG = {'Omuz': 'omuz', 'Göğüs': 'gogus', 'Biseps': 'biseps', 'Triseps': 'triseps', 'Ön kol': 'onkol', 'Sırt': 'sirt',
        'Karın': 'karin', 'Kalça': 'kalca', 'Kalça yanı': 'kalcayani', 'Bacak': 'bacak'}
RENK = B['renk']
css = []
for v in ('front', 'back'):
    css.append(f".mb.{v}{{aspect-ratio:{B[v]['w']}/{B[v]['h']};background-image:url(data:image/webp;base64,{b64(os.path.join(V27, f'r/{v}_gri.webp'))})}}")
    css.append(f".mb.{v} i{{background-image:url(data:image/webp;base64,{b64(os.path.join(V27, f'r/{v}.webp'))})}}")
    for g in B[v]['merkez']:
        u = 'data:image/png;base64,' + b64(os.path.join(V27, f'r/{v}_{g}.png'))
        css.append(f".mb.{v} i.{SLUG[g]}{{-webkit-mask-image:url({u});mask-image:url({u})}}")
mini = lambda v, gs: f'<div class="mb {v}">' + ''.join(f'<i class="{SLUG[g]}" style="opacity:{a}"></i>' for g, a in gs.items() if g in B[v]['merkez']) + '</div>'
img = lambda n, i: 'data:image/webp;base64,' + b64(os.path.join(K, f'r/{n}_{i}.webp'))

KART = [
    dict(id='External_Rotation_with_Band', ad='Bantla dış rotasyon', en='External Rotation with Band', tag='OMUZ · ÖNLEYİCİ',
         renk='Omuz', kas={'Omuz': 1}, birincil='Omuz (rotator manşet: infraspinatus, teres minör)', ikincil='—',
         hedef='3 × 12–15 · hafif bant · dinlen 0:45', son='Son: 30.09 · 3 × 15 · yeşil bant · MSI 0',
         kisit=[('warn', 'Sağ omuz (impingement): hafif bant, yalnızca ağrısız aralık.'), ('warn', 'MSI 1–1,5 → aralığı küçült · 2 → dur.')],
         adim=['Bandı dirsek yüksekliğinde bir direğe bağla; sağ kolu çalıştırırken bant sol yanında kalsın.',
               'Dirseğini 90° bük, gövdene yapışık tut; dirseğinle gövden arasına katlanmış havlu sıkıştır.',
               'Ön kolunu dışa doğru çevir; dirsek gövdeden ayrılmasın. Sonda 1 sn tut.',
               '2–3 sn\'de kontrollü geri dön. Seti bitirince diğer kola geç.'],
         hata=['Dirseği gövdeden açmak (havlu düşer)', 'Gövdeyi döndürerek yardım almak', 'Omzu kulağa doğru kaldırmak'],
         yuzme='Kulaç çekişinde omuz başını yuvada merkezde tutar; impingement riskini azaltır.', view=('front', 'back')),
    dict(id='Bodyweight_Squat', ad='Vücut ağırlığıyla squat (kutuya)', en='Bodyweight Squat', tag='BACAK · KALÇA',
         renk='Bacak', kas={'Bacak': 1, 'Kalça': .45}, birincil='Bacak (ön uyluk)', ikincil='Kalça, arka uyluk',
         hedef='3 × 12 · ağırlık yok · dinlen 1:00', son='Son: 23.09 · 3 × 12 · MSI 0',
         kisit=[('red', 'Perthes sağ kalça: ağırlık yok · derinlik en fazla 90°.'), ('warn', 'Bitiş fotoğrafındaki derinlik senin üst sınırın; arkana kutu koy, kutuya değince kalk.'),
                ('warn', 'Sağ kalça veya dizde MSI ≥ 1 → kutuyu yükselt.')],
         adim=['Ayaklar omuz genişliğinde, parmak uçları hafif dışa; arkana diz yüksekliğinde kutu ya da sandalye koy.',
               'Kalçanı geriye iterek otur; dizler parmak uçları yönünde, topuklar yerde.',
               'Uyluk yere paralel olunca ya da kutuya değince dur; daha aşağı inme, kutuya çökme.',
               'Topuklardan iterek kalk; tepede kalçanı sık.'],
         hata=['Dizlerin içe kapanması', 'Topukların kalkması', 'Kutuya ağırlıkla çökmek'],
         yuzme='Duvar dönüşü ve start itişinde bacak gücü.', view=('front', 'back')),
    dict(id='Dead_Bug', ad='Dead Bug', en='Dead Bug', tag='KARIN · CORE',
         renk='Karın', kas={'Karın': 1}, birincil='Karın (düz ve derin karın)', ikincil='Kalça fleksörü',
         hedef='3 × 8 her taraf · dinlen 0:45', son='İlk kez · başlangıç değeri',
         kisit=[('ok', 'Kısıtlarına uygun.'), ('warn', 'Sağ kalçada ağrı olursa bacağı uzatırken dizi bükülü tut (kısa kol).')],
         adim=['Sırtüstü yat; kollar tavana, kalça ve dizler 90° bükülü.',
               'Belini yere bastır; bel ile yer arasında boşluk kalmasın.',
               'Nefes vererek sağ kolu ve sol bacağı yavaşça uzat; bel yerden kalkmasın.',
               'Başlangıca dön, diğer çaprazla (sol kol + sağ bacak) tekrarla.'],
         hata=['Belin kavislenmesi', 'Hızlı yapmak', 'Nefesi tutmak'],
         yuzme='Gövde stabilitesi: kulaçta omuz–kalça hattını düz tutar, kalça batmasını azaltır.', view=('front',)),
]

def kart(k, n):
    r = RENK[k['renk']]
    kis = ''.join(f'<p class="k {c}">{"⊘" if c == "red" else "✓" if c == "ok" else "⚠"} {t}</p>' for c, t in k['kisit'])
    body = ''.join(mini(v, k['kas']) for v in k['view'])
    return f'''<figure class="cw"><div class="card" style="--c:{r}" data-n="{n}">
<div class="ttl"><small style="color:{r}">{k['tag']}</small><h2>{k['ad']}</h2><span class="en">{k['en']}</span></div>
<div class="media" data-anim>
  <img src="{img(k['id'], 0)}" alt="{k['ad']}: başlangıç"><img class="b" src="{img(k['id'], 1)}" alt="{k['ad']}: bitiş">
  <div class="phase"><button data-p="0" class="on">1 · Başlangıç</button><button data-p="1">2 · Bitiş</button><button data-p="a" class="play">⏵ oynat</button></div>
</div>
<div class="row">
  <div class="bodies">{body}</div>
  <div class="mus"><p class="lb">ÇALIŞAN KAS</p><p><span class="gd" style="background:{r}"></span><b>{k['birincil']}</b></p><p class="mu">İkincil: {k['ikincil']}</p>
  <p class="lb t">HEDEF</p><p>{k['hedef']}</p><p class="mu">{k['son']}</p></div>
</div>
<div class="kis">{kis}</div>
<p class="lb">NASIL YAPILIR</p><ol>{''.join(f'<li>{a}</li>' for a in k['adim'])}</ol>
<p class="lb">SIK HATA</p><ul class="err">{''.join(f'<li>{h}</li>' for h in k['hata'])}</ul>
<div class="swim"><b>Yüzmeye katkısı</b><p>{k['yuzme']}</p></div>
<div class="foot"><span class="vid">▶ Video</span><span class="src">Fotoğraf: free-exercise-db (kamu malı)</span></div>
</div></figure>'''

FONTS = open('/home/user/Claude/fonts/fonts.css').read()
for f in sorted(x for x in os.listdir('/home/user/Claude/fonts') if x.endswith('.woff2')):
    FONTS = FONTS.replace(f'url({f})', 'url(data:font/woff2;base64,' + b64('/home/user/Claude/fonts/' + f) + ')')
html = open(os.path.join(K, 'sablon.html')).read().replace('/*FONTS*/', FONTS).replace('/*MB*/', '\n'.join(css))
html = html.replace('<!--KARTLAR-->', '\n'.join(kart(k, i) for i, k in enumerate(KART)))
open(os.path.join(K, '../kartlar.html'), 'w').write(html)
print(os.path.getsize(os.path.join(K, '../kartlar.html')) // 1024, 'KB')
