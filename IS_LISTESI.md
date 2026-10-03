# YüzmeSK — İş listesi

Talepler ve hatalar burada toplanır; kod ancak "uygula" denince, listedeki
bekleyen işlerin tamamı birlikte güncellenir.

## 1. Aşama — Acil

Tamamlandı (sürüm 8), bkz. Tamamlanan. Kalan: Code.gs'in yeniden dağıtılması (aşağıda).

## Sıradaki

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
  + ★ rozet; üst kutuda 4 hafta / tüm zaman yüzdesi. Görsel kullanıcıya ait. Onay ("uygula") bekliyor.

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
