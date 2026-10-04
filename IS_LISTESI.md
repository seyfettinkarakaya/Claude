# YüzmeSK — İş listesi

Talepler ve hatalar burada toplanır; kod ancak "uygula" denince, listedeki
bekleyen işlerin tamamı birlikte güncellenir.

## 1. Aşama — Acil

Tamamlandı (sürüm 8), bkz. Tamamlanan. Kalan: Code.gs'in yeniden dağıtılması (aşağıda).

## Sıradaki

### Sürüm 12 — tek seferde uygulanacak plan (04.10.2026)
"uygula" denince aşağıdakilerin **hepsi tek sürümde** yapılır; sıra, bağımlılığa göre. Ayrıntılar alttaki
maddelerde (A1–F5, salon senaryosu, hareket bilgi kartları). Garmin (F4) sonraya; antrenör raporu (F3) çıkarıldı.
- [ ] **0. Hazırlık:** tüm testler yeşil (03.10.2026: hepsi geçti, uçtan uca 52/52); dalda çalışılır.
- [ ] **1. Veri ve betikler (yalnızca ekleme):** sporRef'e `kisit`, `yuzmeKas` (stil → kas katsayıları), `drill`
  (video) sayfaları; SporRef.gs bunları okur + CSS testi için yalnızca satır ekleyen işlem. SalonTakip `H`'ye
  isteğe bağlı Kısıt / Alternatif / Görsel sütunları (yoksa da çalışır). Eski sütunlar, sayfalar, işlemler aynen.
- [ ] **2. Ortak çekirdek:** 10 kas grubu (Türkçe ad, v27 renkleri; eski 7 ad çalışır) · kısıt motoru (A1, A2,
  A3, A5, A6) · yük ve toparlanma (B1–B5, yüzme kas yükü dahil).
- [ ] **3. Salon:** kas haritalı planlama (v27; eski çubuk listesi "Liste" görünümü) · öneri kartlarında mini
  vücut + plan tepsisi · plan Kaydet + ana sayfadan doğrudan giriş · otomatik ilerleme ("geri al"; ⚠'de yok) ·
  toparlanma · önleyici borç (E1) · kart üstü kısıt (E2) · ısınma şablonu (E3) · periyotlama (E4) · rekor ·
  özet (hacim, kas ısı haritası, kıyas) · hareket grafiği · dinlenme bitti bildirimi · süperset · ısınma seti ·
  **hareket bilgi kartları (G)**.
- [ ] **4. Yüzme:** omuz rahatlatma (A4) · kulaç + nabız girişi, SWOLF (C1–C3) · drill videosu (C4) · ağrı
  haritası (C5) · özet (D1) · set grafiği (D2) · denge (D3) · rehberli CSS testi (D4) · derece tahmini (D5).
- [ ] **5. Ortak ekranlar:** ana ekran (F1) · takvim (F2) · haftanın iskeleti (F5) · form ekranı (B2–B3).
- [ ] **6. Düzeltmeler:** hareket sonu "SETLER 10-10-/10" kırılması · İngilizce grup adları ("Legs 0,7") ·
  Ayarlar'da kaynak/lisans notu (kas görseli: kullanıcı; hareket fotoğrafları: free-exercise-db, Unlicense).
- [ ] **7. Test ve yayın:** her adımda tüm testler; her yeni özelliğe uçtan uca senaryo; senaryo ve öneri
  panoları yeniden çekilir; kurulum rehberi (yeni sayfalar) güncellenir; sürüm 12.0.0 → main.

- [ ] **G. Hareket bilgi kartları (infografik)** (talep 04.10.2026). Kaynak: free-exercise-db (yuhonas, Unlicense =
  kamu malı; 876 hareket, her biri başlangıç/bitiş fotoğrafı, adım adım anlatım, birincil/ikincil kas, ekipman).
  - Eşleme: H'deki hareket adları → veritabanı kimliği (otomatik + elle düzeltme; H'de isteğe bağlı "Görsel").
  - Yalnızca senin hareketlerinin fotoğrafları uygulamaya gömülür (webp, çevrimdışı çalışır; dış istek yok).
  - Kart: başlangıç ↔ bitiş geçişi (animasyon), Türkçe adımlar, çalışan kaslar v27 mini vücutta, kısıt notu
    (A2/E2), sık hata, ▶ video. Eşleşmeyen harekette: mini vücut + adımlar + video.
  - Açılış: idmanda karta dokun → ayrıntı paneli; planlamada öneri kartında ⓘ.
  - Örnek 3 kart (04.10.2026): `tasarim/kartlar/kartlar.html` (dış rotasyon, kutuya squat, dead bug).


**Sürüm 11 yayında (03.10.2026):** 3'lü dosya yapısı (YuzmeProgram · SalonTakip · sporRef, her birine
kendi `@OnlyCurrentDoc` betiği), sporRef'ten CSS ve 7 bölge, idman anında düzenleme, metin boyu,
salon idmanı + planlama + video. Kurulum için yapılacaklar (senin tarafında):
- [ ] YuzmeProgram: `Code.gs`'i güncelle → Dağıtımları yönet → Yeni sürüm (eski'de Sıra/Set Mesafe/Set Süre artık boş yazılır).
- [ ] SalonTakip: `Salon.gs`'i kur, `tokenUret`, web uygulaması olarak dağıt; telefonda Ayarlar → Salon.
- [ ] sporRef: `SporRef.gs`'i kur, `tokenUret`, dağıt; telefonda Ayarlar → sporRef.
- [ ] İsteğe bağlı: `H` sayfasına Video sütunu (E'den sonra); YouTube adresleri.

Varsayım (kontrol et): süreli hareket adına göre tanınır (Plank, Hold, Hang, Wall Sit, Carry, L-sit,
Hollow, Side Bridge) ya da açıklamasında "Setler: … sn" varsa; planda/idmanda Düzenle → Tür:
Süreli/Tekrar ile değiştirilebilir. Süreli harekette Tekrar sütununa ortalama saniye yazılır.

Talep (03.10.2026, karar bekliyor):
- [ ] **Ana sayfadan salon idmanına doğrudan giriş** (yüzmedeki "İdmanı aç" gibi). Öneri: salon kartında
  hazır idman (önceden kaydedilmiş plan ya da son idman) tarih · hareket sayısı · ~süre ve kas grubu renk
  çubuğuyla görünür; **İdmana başla** doğrudan idmana girer, **Planla** planlama ekranını açar; süren idman
  varsa **Devam et**. Planlama sonunda "Kaydet, sonra başla" ile plan ana sayfada bekler.
  Açık soru: son idman tekrarlanırken ilerleme önerisi (+2,5 kg / +1 tekrar) uygulansın mı?

- [ ] **Salon planlama ekranı yeniden tasarım** (talep 03.10.2026: "çok basit, alanlar okunaksız").
  Seçenekler `tasarim/v19/` (a: büyük kartlar, b: gövde haritası, c: tek ekran + plan tepsisi).
  Karar: üçü birlikte, vücut daha gerçekçi → birleşik taslak `tasarim/v20/` (Hedef: Vücut/Denge/Liste
  sekmeleri + büyük kas kartları; Hareket seç: mini vücut + puan + plan tepsisi; Plan: sürükle, planın
  kas kapsamı, Kaydet / İdmana başla).
  Vücut çizimi beğenilmedi → `tasarim/v21/`: react-native-body-highlighter (MIT, © 2022 ELABBASSI Hicham)
  anatomik çizimleri; lisans metni uygulamaya eklenecek.
  `tasarim/v22/`: aynı çizim SVG ışıklandırmasıyla hacimli (3B), kaslar arası ten dolgusu, öncelik ★ rozeti.
  (wger çizimi denendi: gerçekçi ama kas katmanları kaba ve lisansı AGPL → kullanılmadı.)
  `tasarim/v23/`: Z-Anatomy 3B kas modeli (CC BY-SA 4.0, BodyParts3D tabanlı) Blender Cycles ile ön/arka
  render + 7 kas grubu maskesi (~1 MB); uygulamada maskeler grup renginde "color" karışımıyla boyanır,
  yük → renk doygunluğu. Kaynak betikler `tasarim/v23/kaynak/`.
  Karar (03.10.2026): anatomi görselleri istenmedi ("korkunç"); sade ikon dili isteniyor (örnek: yuvarlak
  ikonlar, gri siluet, çalışan bölge tek renk). → `tasarim/v24/`: MIT çizimi düz stilde; harita gri→turuncu,
  kas grubu seçimi 8 yuvarlak ikon (★/★★ öncelik).
  Karar (03.10.2026): kullanıcının Gemini görseli (siyah zemin, ön/arka, renkli kas grupları) kullanılacak,
  dokunmatik olacak. → `tasarim/v25/prototip.html`: renk bölütleme (OpenCV, `kaynak/ayikla.py`) ile 7 grup
  SVG yol olarak görselin üstünde; kasa dokun → ★ öncelik → ★★ çift → kapalı; seçilen grup amber çerçeve
  + ★ rozet; üst kutuda 4 hafta / tüm zaman yüzdesi. Görsel kullanıcıya ait.
  Karar (03.10.2026): yeni görsel (gri zemin, etiketli, ön/arka) kullanılacak → `tasarim/v26/prototip.html`:
  vücut grabCut ile zeminden ayrıldı (`kaynak/govde.py`), gruplar renk ∩ bölge (`kaynak/ayikla.py`); bacak
  renksiz olduğundan konumla, arka Bel bölgesi Gövde'ye.
  Karar (03.10.2026): v26 beğenilmedi (kas sınırları, dokunma yapısı). Yeni görsel (siyah zemin, gri vücut,
  renkli kaslar) → `tasarim/v27/prototip.html`:
  - Sınırlar çizimin kendi kas renklerinden, piksel maskesi (2× yumuşak kenar); sırttaki aynı yeşil
    (sırt / triseps) watershed ile koltuk altı çizgisinden ayrılır. Kaynak: `kaynak/ayikla.py`.
  - Katmanlar: gri figür + grup başına maskeli renkli figür (CSS mask). Seçim varken seçilmeyenler gri,
    seçilen renkli + amber parıltı, odaktaki beyaz parıltı; ★/★★ rozet.
  - Dokunma: piksel haritası (`_hit.png`), kasın 9 px çevresi de sayılır.
  - Tek büyük figür, Ön/Arka düğmesi (seçim sayısıyla), yatay kaydırma, köşede diğer yüzün küçüğü.
  - Kasa dokun → ★ seçilir + alt panel: 4 hafta / tüm zaman çubukları, denge notu, öncelik
    (Yok / ★ / ★★), örnek hareketler. Öncelik çipleri; "Hareketleri getir".
  - Kas grupları 10 (kullanıcı listesi): Karın (core), Sırt, Göğüs, Omuz, Biseps, Triseps, Ön kol, Kalça
    (glutes), Kalça yanı (hip), Bacak. Çizimde aynı renkli olanlar ayrıldı (biseps/ön kol, sırt/triseps,
    kalça/kalça yanı); her grup kendi rengine boyandı (dokusu korunarak). Uygulamada salon kas grubu
    listesi (şu an 7) bu 10'a göre güncellenecek; sporRef/salon hareket eşlemesi de.
  Onay ("uygula") bekliyor.

- [ ] **Salon baştan sona senaryo ve sürüm 12 önerisi** (talep 03.10.2026) → `tasarim/senaryo/senaryo.html`
  (14 adım: Salı planla → Çarşamba ana ekrandan başla → idman → özet; mevcut ekranlar gerçek uygulamadan,
  yeniler taslak). Kaynak: `tasarim/senaryo/kaynak/` (cek.cjs: uygulamadan ekran görüntüleri, sahte veriyle).
  Eksikler (senaryoda görülen):
  - [ ] Kas grubu renk/ad tablosu 10 grubu tanımıyor: Biceps, Triceps, Forearms, Hip gri ve İngilizce
    (planlama, kart ayrıntısı "Legs 0,7 · Glutes 0,3"). v27 renkleriyle Türkçe; eski 7 ad çalışmaya devam.
  - [ ] Hareket sonu "SETLER 10-10-/10" satır kırılıyor → metin boyu uyumu.
  - [ ] Kayıtlı plan + ana sayfadan doğrudan giriş (yukarıdaki talep).
  - [ ] Planlama 1. adımı kas haritası (v27); eski çubuk listesi haritanın altında "Liste" görünümü.
  - [ ] Öneri kartlarında mini vücut + plan tepsisi; planda kapsam haritası, Kaydet / İdmana başla.
  - [ ] Özet: toplam hacim, çalışan kaslar haritası, rekorlar, geçen benzer idmanla kıyas.
  - [ ] Ayarlar'da kas görseli kaynak notu.
  Popüler uygulamalardan öneriler (Hevy, Strong, Fitbod):
  - [ ] YÜKSEK: kas toparlanma (son çalışmadan geçen süre + yük) haritada ve öneri sıralamasında; ana
    ekranda "sıradaki öneri". Kayıtlı rutin, tek dokunuşla başlat. Otomatik ilerleme (son idman tekrarında
    da öneri uygulanır, "geri al"; ⚠ varsa uygulanmaz).
  - [ ] ORTA: rekor (PR) rozeti ve listesi; özet kas ısı haritası; kart ayrıntısında son 8 idman grafiği.
  - [ ] SONRA: dinlenme bitti bildirimi (kilitliyken), süperset, ısınma seti.
  Bozmama kuralı: idman sayfası sütunları, Salon.gs/Code.gs/SporRef.gs, puanlama değişmez; mevcut akışlar
  (son idmanı tekrarla, idman, giriş, kayıt, kuyruk) aynen kalır; her adımda tüm testler (03.10.2026: hepsi
  geçti, uçtan uca 52/52) + yeni özelliğe yeni senaryo.
  Karar (03.10.2026): **tüm öneriler kabul** → (1) son idman tekrarında öneri uygulanır ("geri al"; ⚠ varsa
  uygulanmaz), (2) YÜKSEK + ORTA + SONRA ve eksiklerin hepsi, (3) eski 1. adım haritanın altında "Liste".
  Ana sayfadan doğrudan giriş de bu kapsamda. Uygulamadan önce yüzmeye taşınacak fikirler soruldu (aşağıda).

- [ ] **Salondan yüzmeye taşınabilecek fikirler** (soru 03.10.2026, seçim bekliyor):
  1. MSI (ağrı) girişi kas haritasıyla: aynı görsel, sağ/sol omuz-diz vb. bölgeye dokun → 0,5/1/2; tabloya
     yazılan anahtarlar aynı (sag omuz, …). Son 4 haftanın ağrı haritası; salonda ⚠ ve rehab önerisini besler.
  2. Ortak yük ve toparlanma: yüzme de kas yüküne sayılır (stil × mesafe × RPE → omuz, sırt, triseps, karın,
     bacak; katsayılar tahmini, sporRef'te düzenlenebilir). Salon önerisi "dün 3 km yüzdün, omuz dinleniyor".
  3. Yüzme özeti salon özeti diliyle: bölge dağılımı (7 bölgede süre), geçen aynı setle kıyas
     (4×100 ort. 1:31, geçen 1:33 ↑), rekor rozetleri (en hızlı 100 tekrar, CSS altı set).
  4. Ana ekran kartları ortak dil: "✓ Bugün yapıldı" durumu, sıradaki, haftalık özet; takvimde salon günleri
     ve günlük yük çubuğu.
  5. Set ilerleme grafiği: aynı set türünün (ör. 4×100 FR) son 8 seferi; ayrıntı panelinde.
  6. Haftalık bölge dengesi (salondaki kas dağılımı gibi): 4 hafta / tüm zaman, kolay–eşik–sprint oranı.
  7. CSS güncelleme önerisi: eşik setleri sürekli hedefin altında ve RPE düşükse "CSS testi zamanı".

- [ ] **Kapsamlı öneriler: yüzme + salon** (talep 03.10.2026: "hepsini iş listesine ekle"). Dayanak: yuzme-idman-modeli
  kısıtları (Perthes sağ kalça, sağ omuz impingement, sağ diz kondromalazi, MSI skalası, seans süreleri,
  kulaç normları, stil hiyerarşisi FR→BK→BF→BR), Hevy/Strong/Fitbod, MySwimPro/FORM/Garmin, TrainingPeaks.
  Not: senaryo panosundaki Goblet Squat kısıtla çelişiyor (ağırlıklı squat >90° yasak) → kısıt koruması gelince
  taslakta güvenli alternatifle (≤90° box squat / glute bridge) değiştirilecek.
  **A. Sağlık kısıtı koruması (önce bu)**
  - [ ] A1 Kısıt profili: sporRef'te `kisit` sayfası (tanı → kural); uygulama okur, Ayarlar'da gösterir.
  - [ ] A2 Salonda yasaklı/riskli hareket: H'ye "Kısıt" ve "Alternatif" sütunları; planlamada gizlenir ya da
    ⚠ "Perthes: ağırlıklı squat >90°" + güvenli alternatif önerilir; idmanda Değiştir de bunlara uyar.
  - [ ] A3 Kurbağalama (BR) aylık sayaç: bu ayın BR metresi / toplam (sınır %10); BR set kartında "bu ay %7/10",
    sınıra yaklaşınca uyarı (diz kısıtı da ayrıca not edilir).
  - [ ] A4 Omuz rahatlatma: her aerobik blok sonunda dinlenme ekranında kısa omuz rahatlatma kartı; yapıldı
    işareti seans notuna.
  - [ ] A5 MSI kural motoru (yüzme + salon, idman içinde): 0,5 gözlem notu · 1–1,5 hafiflet (kalan tekrar/ağırlık
    önerisi) · ≥2 seti durdur (set biter, not düşer) · 3+ tıbbi uyarı, seansı bitir önerisi.
  - [ ] A6 Seans süresi bütçesi: Sal/Çar/Per sabah 75–80 dk, öğle 65 dk, Cuma akşam sınırsız; yüzme programı ve
    salon planı ~süresi bütçeyle karşılaştırılır, aşarsa kırpma önerisi; haftada 3 gün sayacı.
  **B. Yük ve toparlanma (ortak)**
  - [ ] B1 Seans yükü (sRPE = RPE × dakika) yüzme ve salon için; günlük ve haftalık yük.
  - [ ] B2 Form grafiği (TrainingPeaks PMC mantığı): 42 gün "kondisyon", 7 gün "yorgunluk", fark "form".
  - [ ] B3 Yük artış uyarısı (akut/kronik oran > 1,5): omuz geçmişi için erken uyarı; deload haftası önerisi.
  - [ ] B4 Kas yükü haritası: salon (hkEtki) + yüzme (stil × mesafe × RPE katsayıları, sporRef'te düzenlenebilir)
    → toparlanma; salonda "dün 3 km FR: omuz dinleniyor".
  - [ ] B5 Aynı gün çakışma uyarısı: ağır omuz salonu + uzun FR/kürek aynı gün ya da art arda.
  **C. Yüzme: idman içi**
  - [ ] C1 Kulaç sayısı girişi (dinlenirken ±, varsayılan türe göre: drill 10–11, yüzüş 13–15, race 14–15,
    pull 11–12 /25 m); eski sayfasındaki Kulaç sütunu dolar (şu an boş yazılıyor). SWOLF ve kulaç başı mesafe.
  - [ ] C2 Kulaç normu sapması: yüzüşte sürekli >15 ise "teknik bozuluyor / yorgunluk" notu.
  - [ ] C3 Set sonu nabız (hızlı giriş; Nabız sütunu şu an boş yazılıyor).
  - [ ] C4 Drill videosu: açıklamadaki drill adına göre bağlantı (sporRef `drill` sayfası; salondaki ▶ gibi).
  - [ ] C5 MSI girişi kas haritasıyla (sağ/sol ayrımlı; tabloya yazılan anahtarlar aynı) + 4 haftalık ağrı haritası.
  **D. Yüzme: analiz**
  - [ ] D1 Özet: bölge dağılımı, geçen aynı setle kıyas, rekor rozetleri, SWOLF.
  - [ ] D2 Set ilerleme grafiği (aynı set türünün son 8 seferi).
  - [ ] D3 Haftalık denge: bölge oranları (kolay/eşik/sprint) ve stil dağılımı (hiyerarşi, BR %).
  - [ ] D4 Rehberli CSS testi (400 + 200): uygulamada test seti, CSS hesaplanır, onayla sporRef `css`'e yeni satır
    (SporRef.gs'e yalnızca ekleme işlemi). Eşik setleri sürekli hedef altında + RPE düşükse "CSS testi zamanı".
  - [ ] D5 Derece tahmini: CSS ve set ortalamalarından 100/200/400 tahmini, zaman içinde.
  **E. Salon: ek**
  - [ ] E1 Yüzücü önleyici dozu: haftalık omuz prehab (rotator manşet), core, kalça stabilite minimumu; "borç"
    ana ekranda ve planlamada öncelik önerisi olarak.
  - [ ] E2 Kart üstü kısıt hatırlatması (ör. "derinlik ≤90°", "omuz ağrısızsa").
  - [ ] E3 Isınma şablonu (bant omuz ısınması) idman başında, kayda sayılmaz.
  - [ ] E4 Periyotlama: 4 haftalık blok (hacim → kuvvet → bakım) ve deload, yüzme yüküyle (B2–B3) eşgüdümlü.
  - [ ] E5 (Önceki kabul edilenler: toparlanma, kayıtlı rutin, otomatik ilerleme, PR, ısı haritası, grafik,
    bildirim, süperset, ısınma seti.)
  **F. Ortak deneyim**
  - [ ] F1 Ana ekran: haftalık 3 gün halkası, form durumu (taze/yorgun), bugünün önerisi (yüzme mi salon mu,
    süre bütçesiyle), BR ve omuz prehab göstergeleri.
  - [ ] F2 Takvim: salon günleri, günlük yük çubuğu, kısıt uyarıları.
  - ~~F3 Haftalık rapor (antrenöre paylaşılabilir)~~ — çıkarıldı (04.10.2026: antrenör yok).
  - [ ] F4 Saat verisi içe aktarma (Garmin FIT) — **sonra** (04.10.2026), sürüm 12'de yok.
  - [ ] F5 Haftalık program iskeleti önerisi: kısıtlar + form + denge → 3 günün odağı (öneri, program sayfasına
    yazmaz).
  Örnek ekranlar (19 taslak, her madde en az birinde): `tasarim/oneriler/oneriler.html` (kaynak: `kaynak/yap.py`).
  Bozmama kuralı aynı: tablo sütunları ve betikler yalnızca ekleme ile değişir (yeni sayfa/işlem), mevcut akışlar
  aynen; her adımda tüm testler + yeni senaryolar.

Sürüm 10 tamamlandı (bkz. Tamamlanan).

Sürüm 10.5 (sürüm 11 ile yayında):
- [x] Değişken uzunluktaki metinlerde yazı boyu alana uyar; alan boyutu değişmez.
  - Alan sabit kalır (kartta başlık ile kutular arasındaki boş yer gibi). Yazı, alanı dolduracak en
    büyük boyda gösterilir: kısa metin büyür (üst sınır), uzun metin küçülür (alt sınır, okunurluk için).
  - Alt sınırda da sığmazsa son satır "…" ile biter; tamamı karta dokununca ayrıntı panelinde.
  - Uygulanacak alanlar: set kartı açıklaması (hazır ve sıradaki set kartı), yüzerken/dinlenirken
    bilgi ve açıklama satırı (kesmek yerine küçülür), ayrıntı paneli açıklaması, mola ekranındaki
    "Sıradaki", ana sayfa Yüzme kartı bilgi satırı, takvim gün kartı başlığı.
  - Ekran döndüğünde/yazı tipi yüklendiğinde yeniden hesaplanır. Test: kısa (2 kelime) ve uzun
    (40+ kelime) açıklamayla 320–430 px'te alan boyutu sabit, yazı sınırlar içinde, taşma yok.

## 2. Aşama — Orta vade

### İşlev

> **Sürüm 11 (büyük sürüm) — "uygula" verildi (02.10.2026).** Sıra: 1) altyapı (3 dosya/betik, kurulum,
> sporRef) 2) yüzme (anında düzenleme, metin boyu, CSS/bölge) 3) salon idman + tabloya yazma
> 4) salon planlama + video 5) uçtan uca test → tek seferde yayın. Ara adımlar yalnızca geliştirme dalında.

> **Karar (02.10.2026):** Tek ve büyük bir sürüm çıkılacak. Dosya yapısı 3'lü: YuzmeProgram, SalonTakip ve
> sporRef'in her birine kendi `@OnlyCurrentDoc` Apps Script'i (3 adres + anahtar); betikler yalnızca kendi
> dosyasını görür.

- [x] **Yüzme idmanını idman anında değiştir / ekle / sil** (kararlar verildi; eski F.8 bu maddeye katıldı): karta dokun →
  ayrıntı panelinde Düzenle / Sonrasına set ekle / Sil; dinlenirken "+1 tekrar"; yüzerken kapalı;
  eklenen ve değişen setler tabloya planla farkı notuyla yazılır (Code.gs değişir).
  - Karar: planla fark Not sütununa yazılır ("Plan: 4×100 → 6×100", "idmanda eklendi").
  - Karar: `eski` sayfasında **Sıra**, **Set Mesafe**, **Set Süre** sütunları boş bırakılır (tablo kendisi
    dolduruyor). Eklenen sete sıra numarası verilmez; uygulama içindeki sırası yeterli.
  - Karar: **A** — karta dokununca açılan ayrıntı panelinin altında Düzenle · Sonrasına ekle · Sil
    (yüzerken sönük). Ortak düzenleme ekranı: ± düğmeler, stil/tür/alet seçenekleri, kısıt uyarıları.
    Dinlenirken kartta **"+1 tekrar"** kısayolu (bildirim + Geri al). Görsel: `tasarim/v17/duzenle.png`.
- [x] **Salon idman planlama** (taslak `tasarim/v16/salon-planlama.png`): hedef kaslara göre katsayı hesaplayıp
  hareket listesinden (H, hkEtki) hareket önermek.
  - Puan = Σ (kas öncelik ağırlığı × hareketin o kasa etkisi `hkEtki`) × yüzme aktarım katsayısı.
    Öncelik ağırlıklarına sen karar verirsin (otomatik öncelik yok).
  - Yüzme katsayısı: `H` sayfasındaki **Swim Transfer Coefficient** sütunu.
  - Seçim **kas grubu** düzeyinde; alt kas ve kinetik zincir hareket satırında bilgi olarak.
  - Karar: hedef tablodan **alınmaz**. Her planlamada `idman` sayfasından hesaplanan kas grubu dağılımı
    (son 4 hafta ve tüm zaman ortalaması) gösterilir; neye ağırlık vereceğine sen karar verirsin.
  - Varsayılan set/tekrar/ağırlık = son yapılan. İlerleme: son seferde RPE ≤ 8 ve MSI ≤ 0,5 → "+1 tekrar"
    veya "+2,5 kg" önerisi; RPE ≥ 9,5 veya MSI ≥ 1,5 → aynı değer + ⚠.
  - Son iki idmanda MSI ≥ 1,5 olan hareket ⚠ ile işaretlenir, puanı düşer, gizlenmez.
  - Süre tahmini: set × (tekrar × 3 sn + 60 sn); süreli harekette süre + 30 sn.
  - Plan yalnızca telefonda tutulur, tabloya yazılmaz; idman yapılınca satırlar `idman` sayfasına eklenir.
- [x] **Hareket videosu (YouTube)**: hareket kataloğuna (`H` sayfası) "Video" sütunu; uygulamada hareket
  kartında, planlama listesinde ve ayrıntı panelinde ▶ düğmesi, dokununca YouTube'da açılır.
  Yalnızca youtube.com / youtu.be adresleri kabul edilir.
  - Karar: video **YouTube'da açılır** (uygulama içinde gömülü oynatma yok; idman saati etkilenmez).
  - Karar: yalnızca **salon** hareketlerinde (yüzmede video yok). Video sütunu `H` sayfasında E'den sonra
    (formül `H!A:E` okuduğu için ilk 5 sütun değişmez).
- [x] **sporRef'ten referans verileri** (onaylandı): CSS (tarih aralığı + alet + havuz), 7 bölge
  (SP3–REC, CSS'e göre sn/100 m) ve HR bölgeleri, max nabız, faz bilgisi, RPE/MSI açıklamaları, kısaltmalar.
  Şu an CSS Ayarlar'dan elle (varsayılan 1:57), bölgeler uygulamada sabit Z1–Z5 — sporRef ile uyumsuz.
  3'lü yapı kararıyla sporRef kendi betiğinden okunur (salt okuma).

- [x] **Salon modülü**: SalonTakip tablosu (`idman` sayfası) ile çalışan salon idmanı.
  - Karar: başlangıçta iki seçenek — **son idmanı göster ve tekrarlamayı sor** ya da **yeni idman planla**
    (planlama ekranı). Kendi `@OnlyCurrentDoc` betiği (3'lü yapı).
  - Karar: **Tekrar** sütununa setlerin ortalaması (ör. 9,67), set ayrıntısı **Açıklama**'ya ("Setler: 11-9-9").
  - `v2` formülle üretiliyor (LET/REDUCE, `idman!A:J` sütun sırasıyla okur). Yazma kuralları:
    - `idman` sütun sırası A–J değişmez (Tarih, No, Hareket, Set, Tekrar, Ağırlık, Nabız, RPE, MSI, Açıklama).
    - Tarih gerçek tarih; Set/Tekrar/RPE/MSI/Nabız sayı (metin "7,5" değil); nabız yoksa boş.
    - Vücut ağırlığı tam olarak **"Vücut"** yazılır (formül BW katsayısını buna göre uygular); esnemede 0.
    - Hareket adı `H` ve `hkEtki` sayfalarındaki adla birebir aynı (yoksa v2'de "##veri yok##").
    - Uygulama yalnızca katalogdaki hareketleri önerir; katalogda olmayan hareket uyarıyla eklenir.
  - Karar: **Nabız, RPE, MSI her hareket için elle** girilir (hareket sonunda giriş adımı).
  - Karar: **hareket süresi** (ilk set başı → son set sonu, mm:ss) `idman` sayfasının **K sütununa** yazılır
    (v2 formülü A–J okuduğu için K güvenli).
  - Salon idman ekranı (taslak `tasarim/v18/salon-idman.png`): düğme **BAŞLA / BİTTİ**; set tekrarı ± ile
    düzeltilir; dinlenme sayacı; hareket sonunda Nabız (±, geçen değerle hazır) · RPE · MSI · Not girişi.
    Hareket süresi ilk set başından son set sonuna. Süreli hareketlerde BAŞLA → geri sayım, kendiliğinden biter.
  - Karar (onaylandı): yüzmedeki A düzeni salonda da — karta dokun → panel: Düzenle (set, tekrar,
    ağırlık, dinlen) · **Değiştir** (aynı kas grubundan puanlı liste; makine doluysa) · Sonrasına ekle
    (puanlı hareket listesi) · Sil (başlanmamış); dinlenirken **"+1 set"** kısayolu.
    Başlamış harekette set sayısı yapılanın altına inemez. Plan telefonda olduğu için "planla fark" notu yok;
    `idman` sayfasına gerçekte yapılan (değiştirilen hareket kendi adıyla) yazılır.

- [ ] **F.2** Seans özeti ve analiz: bitişte planlanan/gerçekleşen mesafe-süre,
  blok bazında dağılım; haftalık toplamlar.
- [ ] **F.3** Set başına kulaç sayısı / nabız girişi (isteğe bağlı alanlar).
- [x] İdman sırasında ağrı (MSI) kaydı — karar: yüzmede seans sonu yeterli (salonda hareket başına).
- [ ] **F.7** Service worker: uygulama dosyaları önbellekte, internet yokken de açılır.

### Görsel

Sürüm 8 görünümü korunuyor; v10/v11 önerileri beğenilmedi, görsel yenileme sonra konuşulacak.

- [ ] Form, kurulum ve "Kaydedildi" ekranlarını yeni tasarıma uyarlamak; renk
  paletlerini (sarı set ekranı / turkuaz takvim / gri ana sayfa) tek sistemde toplamak.
- [ ] Tutarlı simge seti (şu an elle çizilmiş karışık SVG ve karakterler).
- [ ] Yeni uygulama simgesi.
- [ ] Hareket ve kutlama: seans bitişinde kısa animasyon, geçişlerde yumuşaklık.
- [ ] Açık tema (güneşli dış havuz için).
- [ ] Ayarlar'da yazı boyutu seçimi.

## İzlenecek

- [ ] Telefondaki tarih önbelleğinin neden bozulduğu kesin bulunamadı. Sürüm 3+
  bozuk kaydı atlıyor ve hatayı ekranda gösteriyor. "Tarih listesi beklenmeyen
  biçimde geldi" veya "Beklenmeyen hata" mesajı görülürse ekran görüntüsü alınacak.

## Senin tarafında (tabloda / Apps Script'te)

- [x] `eski` sayfasında B1 = **Sıra** düzeltildi.
- [x] Code.gs yeni sürüm olarak dağıtıldı (arsiv, en yeni üstte, @OnlyCurrentDoc).
- [ ] Sürüm 9 için Code.gs'i yeniden yapıştırıp **yeni sürüm** olarak dağıt (program
  hızlı açılış için tarih listesi setleri de gönderir).
- [x] Anahtar yenilendi (`tokenUret`), telefon yeni anahtarla çalışıyor.

## Tamamlanan

- [x] Sürüm 10.4:
  - Düğme **YÜZ / DUR**; ilk YÜZ idmanı ve 1. tekrarı birlikte başlatır (ayrı "İDMANA BAŞLA" yok).
  - 5+ tekrarlı setlerde şerit, "Tekrar 7/12", ortalama ve son 3 süre (12–20 tekrar sığar).
  - Yüzerken/dinlenirken set bilgisi (Hedef · Dinlen · Alet, açıklama); set sonu dinlenmesinde
    sıradaki setin içeriği öne, sayaç kartın altında ince şerit.
  - Karta dokununca ayrıntı paneli.
  - Mola: sol alt düğme (dinlenirken) veya ‹ → Mola ver; saat, sayaç, bipler durur; DEVAM ET;
    mola süresi idman ve dinlenme ölçümünden düşülür; özette "Mola" hazır ifadesi.
  - Kısa ekranlarda sıradaki set kartı kademeli sıkılaşır; yüzerken başlık–stil boşluğu giderildi.
  - Görseller: `tasarim/v14/oneriler-1.png`, `tasarim/v14/oneriler-2.png`.
- [x] Sürüm 10.3 (hata düzeltme):
  - Hazır set kartında stil · tür ("FR · Kick") yine başlığın hemen altında, boşluksuz (Sürüm 10'da
    başlığın yanına sığmayınca boşluklu alt satıra düşüyor, kart uzuyordu).
  - Kısa ekranlarda kart sığmazsa kademeli küçülür; en alttaki tempo · mesafe satırı kesilmez.
  - Test: 320, 375, 390, 430 px'te başlık–stil boşluğu ve kart taşması.
- [x] Sürüm 10.2 (görsel):
  - Takvim (B): nötr koyu zemin ve kartlar; turkuaz yalnızca seçili gün, BUGÜN ve "… idmanını aç"ta.
  - Ana sayfa (C): bölüm renkli kartlar (Yüzme turkuaz, Salon amber); Yüzme kartında ilk planlı
    idman, **İdmanı aç** (doğrudan giriş) ve **Takvim**; devam eden seansta "Seansa devam et".
- [x] Sürüm 10.1:
  - Büyük düğmenin yazısı düğmeye sığar; gerekirse iki satıra bölünür (İDMANA / BAŞLA).
  - Seti sıfırla: SET TAMAM'a dokununca onay; setin tekrarları silinir, set yeniden yapılır.
  - Kayıttan sonra takvimde bugüne dönülür (sıradaki idman seçilmez).
  - Testler: sahte saatin ara sıra ilerlememesinden kaynaklanan kararsızlık giderildi.
- [x] Sürüm 10 — zamanlama modeli (`ZAMANLAMA.md`):
  - `zaman.js`: olay listesinden tekrar/dinlenme/set sonu süreleri; birim testleri.
  - Tek büyük düğme İDMANA BAŞLA → ÇIK → GELDİM; tekrar kutucukları, büyük saat (eksiye kırmızı),
    üstte 54 px süre/mesafe; son GELDİM seti, son setin son GELDİM'i idmanı bitirir.
  - 3-2-1 + uzun bip, Ses düğmesi, GELDİM onay sesi; Geri al (5 sn), çift dokunma koruması (2 sn),
    yüzerken kaydırma ve ‹ kapalı; seti ve idmanı erken bitirme.
  - Seans sonu: RPE → MSI → Özet; onaylı not satırları, şüpheli tekrar düzeltme, havuz hatırlanır.
  - Gerçek = ortalama tekrar; seans mesafesi = yapılan tekrarlar.
  - Kaldırıldı: kronometre ekranı, su kilidi, Seti Tamamla, Başla/Bitir, eski form.
  - Eski biçim seans yeni modele taşınır.
  - Düzeltilen hatalar: set geçişinde aktif kartın vurgusu kayboluyordu; "İdmana dön"
    tamamlanmış sette kalıyordu; 320 px'te set mesafesi taşıyordu.
  - Testler: 17 zaman.js, 33 uçtan uca senaryo ve baştan sona tam akış yeni akışa göre yazıldı.
- [x] Sürüm 9 (hata düzeltme):
  - Su kilidi artık tüm ekranı örter: kronometrede kilitliyken ekrana veya TUR'a
    dokunmak tur ekliyordu — düzeltildi.
  - Program beklemeden açılır: tarih listesi setleri de getirir (Code.gs güncellemesi),
    güncel hali arka planda kontrol edilir; eski Code.gs'te yaklaşan günler önceden indirilir.
  - Kronometre, ölçüm sürerken başka sete geçilse de ölçülen sete bağlı kalır (başlık,
    çıkış sesi, Kaydet paneli).
  - Testler: 20 data.js + 21 Code.gs uç durum + 33 uçtan uca senaryo + ana akış testleri.

- [x] Sürüm 8 (1. aşama):
  - Ana sayfa: Yüzme (sıradaki idman) / Salon (Yakında) / Yapılmış idmanlar / Ayarlar;
    takvimde ‹ ana sayfaya döner; devam eden seans doğrudan açılır.
  - Takvimde seçili olmayan günlerin çubukları gri (ana set en açık).
  - Plan satırları silinmeden önce **arsiv** sayfasına taşınır; biten seans telefonda
    saklanır, "Yapılmış idmanlar"dan tek tek / toplu, onayla silinir.
  - G.1 `@OnlyCurrentDoc` · G.3 anahtar yenileme (README) + Anahtarı unut ·
    G.4 CSP + yalnızca `/exec` adresi kabul · G.5 yazı tipleri depoda ·
    G.6 sunucu hata ayrıntısı gizli (başvuru numarası).
  - F.1 çıkış sesi (3-2-1 kısa, çıkışta uzun; Ayarlar'dan kapatılır) · F.5 100 m tempo +
    CSS bölgeleri (kartta ve kronometrede; ekipmanlı setlerde bölge yok) · F.6 su kilidi.

- [x] Sürüm 7: setler daha yavaş kayar (~170 px/durak, fırlatma en fazla 1 durak);
  presbiyopi için büyük/kontrastlı değişken veriler (durak süreleri 22 px, Hedef/Dinlen 60 px,
  Alet 24 px, uzun açıklama otomatik küçülür); üst başlık Süre (geçen/hedef) · Mesafe;
  ilk sayfa hafta takvimi (G2, kaydırılabilir hafta, dokunmak seçer, idmana düğmeyle girilir);
  Code.gs getDates gün kartı önizlemesi için set blok/mesafe/süre döndürür (dağıtım bekliyor).

- [x] Metro tasarımı (sürüm 6): tekerlek gibi dönen metro hattı, peron ve önceki/sonraki
  ikişer durak; blok renkli, mesafeye oranlı ilerleme çubuğu; yığımlı hedef süreler;
  Kronometre · Seti Tamamla · Başla/Bitir barı; %70 kronometre (Hedefe / Çıkışa / Son tur);
  alttan açılan Kaydet paneli; tüm ekranlarda koyu zemin + sarı vurgu.

- [x] Gece Havuzu görünümü: lacivert zemin, blok renkli şerit ve ilerleme çubuğu (sürüm 5)
- [x] Kart düzeni: 1) Tekrar × Mesafe Stil Tür 2) açıklama (büyük) 3) Hedef · Dinlen · Alet
  4) Mesafe set/yığımlı · Süre set/yığımlı (küçük) (sürüm 5)
- [x] Üstte toplam hedef süre (yapılan / toplam) (sürüm 5)
- [x] seans: en yeni üstte (Code.gs, dağıtım bekliyor)

- [x] eski: yeni seans satırları 2. satırdan itibaren en üste (Code.gs, dağıtım bekliyor)
- [x] Gün listesi açılışta hemen tazelenir, kuyruk arka planda gönderilir (sürüm 4)
- [x] "Zaten kayıtlı" ekranında takılma; bozuk yerel kayıtlarda çökme (sürüm 3)
- [x] Kayıt tabloya yazıldığı halde "kaydedilemedi" denmesi (sürüm 3)
