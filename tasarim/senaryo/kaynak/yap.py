# Salon senaryosu (hikâye panosu) → ../senaryo.html
# Mevcut ekranlar: gerçek uygulamanın görüntüleri (cek.cjs, harita.cjs). Yeni ekranlar: bu dosyadaki taslaklar.
# Mini vücutlar v27 kas haritası varlıklarıyla (gri figür + grup maskesi + yeniden boyanmış figür).
import base64, io, json, os
from PIL import Image

K = os.path.dirname(os.path.abspath(__file__))
V27 = os.path.join(K, '../../v27/kaynak')
B = json.load(open(os.path.join(V27, 'bolgeler.json')))
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()

def shot(name, q=78):
    im = Image.open(os.path.join(K, '../ekran', name)).convert('RGB')
    if im.width > 390: im = im.resize((390, round(im.height * 390 / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

SLUG = {'Omuz': 'omuz', 'Göğüs': 'gogus', 'Biseps': 'biseps', 'Triseps': 'triseps', 'Ön kol': 'onkol', 'Sırt': 'sirt',
        'Karın': 'karin', 'Kalça': 'kalca', 'Kalça yanı': 'kalcayani', 'Bacak': 'bacak'}
RENK = B['renk']

# mini vücut CSS'i: her görünüm için gri zemin ve renkli katman bir kez; maskeler sınıf olarak
css = []
for v in ('front', 'back'):
    css.append(f".mb.{v}{{aspect-ratio:{B[v]['w']}/{B[v]['h']};background-image:url(data:image/webp;base64,{b64(os.path.join(V27, f'r/{v}_gri.webp'))})}}")
    css.append(f".mb.{v} i{{background-image:url(data:image/webp;base64,{b64(os.path.join(V27, f'r/{v}.webp'))})}}")
    for g in B[v]['merkez']:
        u = 'data:image/png;base64,' + b64(os.path.join(V27, f'r/{v}_{g}.png'))
        css.append(f".mb.{v} i.{SLUG[g]}{{-webkit-mask-image:url({u});mask-image:url({u})}}")
MBCSS = '\n'.join(css)

def mini(v, gs, cls=''):
    """gs: {grup: yoğunluk 0..1}; görünümde olmayan grup atlanır."""
    lay = ''.join(f'<i class="{SLUG[g]}" style="opacity:{a:.2f}"></i>' for g, a in gs.items() if g in B[v]['merkez'])
    return f'<div class="mb {v} {cls}">{lay}</div>'

def body2(gs, cls=''):
    return f'<div class="b2 {cls}">{mini("front", gs)}{mini("back", gs)}</div>'

dot = lambda g: f'<span class="gd" style="background:{RENK[g]}"></span>'

# --- yeni ekran taslakları --------------------------------------------------------------
PLAN = [  # senaryonun planı (gerçek çalıştırmayla aynı)
    ('Dumbbell Shoulder Press', {'Omuz': 1, 'Triseps': .35}, '3 × 10', '15 kg', 'öneri uygulandı: +2,5 kg', 'Omuz'),
    ('Goblet Squat', {'Bacak': 1, 'Kalça': .45}, '3 × 12', '22,5 kg', 'öneri uygulandı: +2,5 kg', 'Bacak'),
    ('Front Plank', {'Karın': 1}, '3 × 50 sn', 'vücut', 'öneri uygulandı: +5 sn', 'Karın'),
    ('Band External Rotation', {'Omuz': 1}, '3 × 10', 'bant', 'ilk kez · başlangıç değeri', 'Omuz'),
]

def phone(inner, cls=''):
    return f'<div class="ph {cls}">{inner}</div>'

ana = phone(f'''
<div class="top"><b class="logo">YüzmeSK</b><span class="gear">⚙</span></div>
<p class="date">Çarşamba, 23 Eylül</p><h2 class="hero">Bugün ne<br>çalışıyoruz?</h2>
<div class="hc swim mini-swim"><div class="hc-hd"><span class="ic t">≈</span><b>Yüzme</b><span class="meta">5 set · 1.200 m · 25:30</span></div></div>
<div class="hc gym">
  <div class="hc-hd"><span class="ic a">⊢⊣</span><b>Salon</b><span class="badge">HAZIR PLAN</span></div>
  <div class="gym-row">{body2({'Omuz': 1, 'Karın': .8, 'Bacak': .8, 'Triseps': .4, 'Kalça': .4}, 'sm')}
    <div class="gym-tx"><p class="pri">{dot('Omuz')}Omuz ★★ {dot('Karın')}Karın ★ {dot('Bacak')}Bacak ★</p>
    <p class="big n">4 hareket · ~42 dk</p>
    <p class="mu">Shoulder Press, Goblet Squat, Plank, External Rot.</p>
    <p class="mu sm">Dün 21:10'da planlandı · öneriler uygulandı</p></div></div>
  <div class="segbar"><i style="flex:6;background:{RENK['Omuz']}"></i><i style="flex:3;background:{RENK['Bacak']}"></i><i style="flex:3;background:{RENK['Karın']}"></i></div>
  <div class="hc-btns"><button class="go">▶ İdmana başla</button><button class="ghost">Planla</button></div>
  <p class="alt">Plan yoksa: <b>Son idmanı tekrarla</b> (20 Eylül, öneriler uygulanmış) · İdman sürüyorsa: <b>Devam et</b></p>
</div>
<div class="hist">Yapılmış idmanlar <span>›</span></div>''')

def ex_card(ad, gs, puan, tag, son, oneri, on, warn=False, view='front'):
    return f'''<div class="ex{' on' if on else ''}">{mini(view, gs, 'xs')}
  <div class="ex-m"><b>{ad}</b><span class="tag">{tag}</span>
    <div class="pay">{''.join(f'<i style="flex:{a};background:{RENK[g]}"></i>' for g, a in gs.items())}</div>
    <small>{son}</small><small class="{'warn' if warn else 'ok'}">{oneri}</small></div>
  <div class="ex-r"><b class="n sc">{puan}</b><small>PUAN</small><span class="add">{'✓' if on else '+'}</span></div></div>'''

oneriler = phone(f'''
<div class="hd"><span class="bk">‹</span><b>Hareket seç</b><span class="vid">▶ video</span></div>
<div class="steps"><i class="on"></i><i class="on"></i><i></i></div>
<div class="chips"><span class="ch on">{dot('Omuz')}Omuz ★★</span><span class="ch on">{dot('Karın')}Karın ★</span><span class="ch on">{dot('Bacak')}Bacak ★</span><span class="ch">Süzgeç ▾</span></div>
<p class="note">Sıra: öncelik × kas etkisi × yüzme aktarımı · toparlanmamış kas geride</p>
{ex_card('Band External Rotation', {'Omuz': 1}, 100, 'REHAB', 'İlk kez · yüzme 0,80', 'Rotator manşet: omuz sağlığı', True, view='back')}
{ex_card('Dumbbell Shoulder Press', {'Omuz': .8, 'Triseps': .2}, 70, 'STRENGTH', 'Son 16.09 · 3×10 @12,5 · RPE 8', 'öneri: +2,5 kg → 15 kg', True)}
{ex_card('Front Plank', {'Karın': 1}, 56, 'STRENGTH', 'Son 20.09 · 3×45 sn · RPE 6', 'öneri: +5 sn → 50 sn', True)}
{ex_card('Goblet Squat', {'Bacak': .7, 'Kalça': .3}, 28, 'STRENGTH', 'Son 12.09 · 3×12 @20 · RPE 7', 'öneri: +2,5 kg → 22,5 kg', True)}
{ex_card('Standard Pull-up', {'Sırt': .6, 'Biseps': .3, 'Ön kol': .1}, 12, 'STRENGTH', 'Son 20.09 · 11-9-9 · RPE 9,5 · MSI 1', '⚠ ağrı: aynı kal, puan yarıya', False, True, 'back')}
<div class="tray">{body2({'Omuz': 1, 'Karın': .8, 'Bacak': .8, 'Triseps': .3, 'Kalça': .3}, 'tiny')}<div><b>4 hareket · ~42 dk</b><small>Omuz %45 · Bacak %25 · Karın %20</small></div><button class="go">Plana geç ›</button></div>''')

rows = ''.join(f'''<div class="pl"><span class="grip">≡</span><span class="pn n">{i + 1}</span>{mini('back' if ad.startswith('Band External') else 'front', gs, 'xxs')}
  <div class="pl-m"><b>{ad}</b><small>{dot(g)}{g} · <em>{note}</em></small></div><div class="pl-v n">{sxr}<small>{kg}</small></div></div>'''
    for i, (ad, gs, sxr, kg, note, g) in enumerate(PLAN))
plan = phone(f'''
<div class="hd"><span class="bk">‹</span><b>Plan</b><span class="vid">Düzenle</span></div>
<div class="steps"><i class="on"></i><i class="on"></i><i class="on"></i></div>
<div class="cover">{body2({'Omuz': 1, 'Bacak': .75, 'Karın': .6, 'Triseps': .3, 'Kalça': .35})}
  <div class="cv-tx"><p class="lb">PLANIN KAPSAMI</p><p>{dot('Omuz')}Omuz <b>%45</b></p><p>{dot('Bacak')}Bacak <b>%25</b></p><p>{dot('Karın')}Karın <b>%20</b></p><p>{dot('Triseps')}Triseps <b>%10</b></p>
  <p class="big n">4 hareket · ~42 dk</p></div></div>
<p class="note">Sürükle: sıra · dokun: set, tekrar, ağırlık · sola kaydır: çıkar</p>
{rows}
<div class="foot2"><button class="ghost">Kaydet</button><button class="go">▶ İdmana başla</button></div>
<p class="alt c">Kaydet → plan ana sayfada "Hazır plan" olarak bekler</p>''')

ozet = phone(f'''
<div class="hd"><span class="bk">‹</span><b>Salon özeti</b></div>
<div class="stats"><div><small>SÜRE</small><b class="n">41:20</b></div><div><small>HAREKET</small><b class="n">4</b></div><div><small>SET</small><b class="n">12</b></div><div><small>HACİM</small><b class="n">2.430<span>kg</span></b></div></div>
<div class="heat">{body2({'Omuz': 1, 'Bacak': .7, 'Karın': .55, 'Triseps': .3, 'Kalça': .3})}<div class="cv-tx"><p class="lb">ÇALIŞAN KASLAR</p><p class="mu sm">renk koyuluğu = yük</p>
  <p>{dot('Omuz')}Omuz 6 set</p><p>{dot('Bacak')}Bacak 3 set</p><p>{dot('Karın')}Karın 3 set</p></div></div>
<div class="pr"><b>🏆 Yeni rekor</b><p>Dumbbell Shoulder Press · <b>15 kg × 10</b><span>önceki 12,5 kg</span></p><p>Front Plank · <b>50 sn</b><span>önceki 45 sn</span></p></div>
<div class="cmp"><p class="lb">GEÇEN BENZER İDMANA GÖRE</p><p>Omuz hacmi <b class="up">+20%</b> · ort. RPE <b>7,5</b> (8) · MSI <b>0</b></p></div>
<div class="list"><p>{dot('Omuz')}<b>Dumbbell Shoulder Press</b> 3×10 · 15 kg · RPE 8</p><p>{dot('Bacak')}<b>Goblet Squat</b> 3×12 · 22,5 kg · RPE 7</p><p>{dot('Karın')}<b>Front Plank</b> 3×50 sn · RPE 6</p><p>{dot('Omuz')}<b>Band External Rotation</b> 3×10 · RPE 5</p></div>
<div class="foot1"><button class="go t">Kaydet</button></div>''')

sonra = phone(f'''
<div class="top"><b class="logo">YüzmeSK</b><span class="gear">⚙</span></div>
<p class="date">Çarşamba, 23 Eylül</p><h2 class="hero">Bugün ne<br>çalışıyoruz?</h2>
<div class="hc swim mini-swim"><div class="hc-hd"><span class="ic t">≈</span><b>Yüzme</b><span class="meta">5 set · 1.200 m · 25:30</span></div></div>
<div class="hc gym">
  <div class="hc-hd"><span class="ic a">⊢⊣</span><b>Salon</b><span class="badge ok">✓ BUGÜN YAPILDI</span></div>
  <p class="big n">41 dk · 4 hareket · 12 set · 🏆 2 rekor</p>
  <div class="gym-row">{body2({'Sırt': 1, 'Biseps': .9, 'Göğüs': .7, 'Kalça yanı': .7, 'Ön kol': .5}, 'sm')}
    <div class="gym-tx"><p class="lb">SIRADAKİ ÖNERİ · TOPARLANMIŞ</p><p class="pri">{dot('Sırt')}Sırt {dot('Biseps')}Biseps {dot('Göğüs')}Göğüs</p>
    <p class="mu sm">Omuz, Bacak, Karın dinleniyor (48 saat)<br>Kalça yanı 44 gündür çalışılmadı</p></div></div>
  <div class="hc-btns"><button class="ghost w">Yarın için planla</button></div>
</div>
<div class="hist">Yapılmış idmanlar <span class="n">· 1 kayıt ›</span></div>''')

# --- akış --------------------------------------------------------------------------------
YENI, MEVCUT, GUNCEL = 'yeni', 'mevcut', 'guncel'
ADIM = [
    ('Salı 21:10 · Planlama', None),
    (YENI, 'Ana ekran → Salon kartı → Planla', '<img src="{}">'.format(shot('h1-harita.png')),
     'Planlama kas haritasıyla açılır (v27). Seçim yokken bütün kaslar renkli; renkler 10 grubu ayırır. Ön/Arka düğmesi, yana kaydırma, köşede diğer yüz.'),
    (YENI, 'Kasa dokun → panel', '<img src="{}">'.format(shot('h2-panel.png')),
     'Omuz\'a dokundu: ★ seçildi, panel açıldı. Son 4 hafta / tüm zaman, denge notu, öncelik <b>Yok · ★ · ★★</b>, örnek hareketler. ★★ seçti.'),
    (YENI, 'Öncelikler hazır', '<img src="{}">'.format(shot('h3-secim.png')),
     'Karın ★ ve Bacak ★ da seçildi. Seçilmeyenler gri, seçilenler parlıyor; Ön düğmesinde 3. Alta öncelik çipleri. <b>Hareketleri getir</b>.'),
    (YENI, 'Hareket önerileri', oneriler,
     'Her kartta mini vücut (hareket hangi kası çalıştırıyor), puan, son yapılan, ilerleme önerisi; ağrı (MSI) ⚠ ile geride. Alttaki tepsi planı canlı gösterir (Hevy/Strong rutin mantığı).'),
    (YENI, 'Plan → Kaydet', plan,
     'Planın kapsamı haritada; sıra sürükle-bırak; öneriler uygulanmış değerler. <b>Kaydet</b>: plan ana sayfada bekler. (Bugünkü 3 adımlı planlama verisi, puanlama ve sıralama aynen kullanılır.)'),
    ('Çarşamba 07:30 · Salonda', None),
    (YENI, 'Ana ekrandan doğrudan giriş', ana,
     'Salon kartı hazır planı gösterir: öncelikler, kas haritası, ~süre. <b>İdmana başla</b> tek dokunuş. Plan yoksa son idman (öneriler uygulanmış); idman sürüyorsa Devam et.'),
    (MEVCUT, 'İdman: hazır', '<img src="{}">'.format(shot('08-idman-hazir.png')),
     'Bugünkü idman ekranı aynen kalır: çark, hedef, geçen değer ve öneri, ağırlık ±, büyük BAŞLA.'),
    (MEVCUT, 'Set sürüyor', '<img src="{}">'.format(shot('09-idman-set-suruyor.png')),
     'Set süresi, tekrar ±, BİTTİ. Geri al 5 sn.'),
    (MEVCUT, 'Dinlenme', '<img src="{}">'.format(shot('10-idman-dinlenme.png')),
     'Geri sayım, ses/titreşim, +1 set, Mola. <span class="nw">Öneri:</span> dinlenme bitince bildirim (telefon kilitliyken).'),
    (GUNCEL, 'Hareket sonu', '<img src="{}">'.format(shot('11-hareket-sonu-giris.png')),
     'Nabız, RPE, MSI (sporRef açıklamalı), not. <span class="nw">Eklenecek:</span> rekor kırıldıysa 🏆 rozeti. <span class="fx">Düzeltilecek:</span> SETLER "10-10-/10" diye kırılıyor.'),
    (GUNCEL, 'Kart ayrıntısı', '<img src="{}">'.format(shot('12-kart-ayrinti.png')),
     'Düzenle, Değiştir (aynı kas grubundan), Sonrasına ekle, Sil. <span class="fx">Düzeltilecek:</span> "Legs 0,7 · Glutes 0,3" İngilizce. <span class="nw">Eklenecek:</span> mini vücut + son 8 idman grafiği.'),
    (YENI, 'Özet', ozet,
     'Bugünkü özetin üstüne: toplam hacim, çalışan kaslar haritası (Fitbod), rekorlar, geçen benzer idmanla kıyas. Kaydet aynı: idman sayfasına aynı sütunlarla yazar.'),
    (YENI, 'Kayıt sonrası ana ekran', sonra,
     'Salon kartı bugünü özetler ve sıradakini önerir: toparlanmış kaslar (son çalışmadan geçen süre + yük). Fitbod toparlanma mantığı, senin öncelik kararınla.'),
    (MEVCUT, 'Yapılmış idmanlar', '<img src="{}">'.format(shot('16-gecmis.png')),
     'Telefondaki geçmiş; "Tabloda" etiketi. Aynen kalır.'),
]

def card(a, n):
    tur, baslik, ekran, tx = a
    lab = {'yeni': 'YENİ', 'mevcut': 'MEVCUT', 'guncel': 'MEVCUT + EK'}[tur]
    return f'<figure class="st {tur}"><div class="frame">{ekran}</div><figcaption><span class="lab">{lab}</span><b><span class="num">{n}</span>{baslik}</b><p>{tx}</p></figcaption></figure>'

akış = []
n = 0
for a in ADIM:
    if a[1] is None:
        akış.append(f'<h3 class="when">{a[0]}</h3>')
    else:
        n += 1
        akış.append(card(a, n))
AKIS = '\n'.join(akış)

FONTS = open('/home/user/Claude/fonts/fonts.css').read()
for f in ('archivo-var-latin.woff2', 'archivo-var-latin-ext.woff2', 'barlow-condensed-700-latin.woff2', 'barlow-condensed-700-latin-ext.woff2'):
    p = '/home/user/Claude/fonts/' + f
    if os.path.exists(p): FONTS = FONTS.replace(f'url({f})', 'url(data:font/woff2;base64,' + b64(p) + ')')

html = open(os.path.join(K, 'sablon.html')).read()
html = html.replace('/*FONTS*/', FONTS).replace('/*MB*/', MBCSS).replace('<!--AKIS-->', AKIS)
html = html.replace('<!--KANIT-->', f'<img src="{shot("03-plan-1-hedef.png")}">')
open(os.path.join(K, '../senaryo.html'), 'w').write(html)
print(os.path.getsize(os.path.join(K, '../senaryo.html')) // 1024, 'KB')
