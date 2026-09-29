# YüzmeSK — İş listesi

Talepler ve hatalar burada toplanır; kod ancak "uygula" denince, listedeki
bekleyen işlerin tamamı birlikte güncellenir.

## 1. Aşama — Acil

### Senin taleplerin

- [ ] **İlk sayfa daha sade:** seçili gün dışındaki günlerin çubukları renkli değil gri
  tonlarda; blok başına farklı açıklık (ana set en açık, ısınma/soğuma en koyu) ki yapı
  renksiz de okunsun. Seçili günün kartı renkli kalır. (görsel: şimdiki / gri karşılaştırması)

- [ ] **Ana sayfa (yeni açılış ekranı)** — `tasarim/v9/H1-ana-sayfa.png`
  - Sadece 2 büyük düğme: **Yüzme** (mevcut hafta takvimine gider; içinde sıradaki idmanın
    kısa bilgisi) ve **Salon** (şimdilik pasif, "Yakında" etiketi).
  - Üstte tarih ve ayarlar; takvimdeki geri düğmesi ana sayfaya döner.
  - Devam eden seans varsa uygulama yine doğrudan seansa açılır.
  - Mimari: salon bölümü sonradan ayrı ekran/veri modülü olarak eklenebilecek şekilde.

- [ ] **Plan satırları silinmez, arşivlenir (G.2 yerine)**
  - Tabloda: seans bitince o günün Plan satırları silinmek yerine yeni **arsiv**
    sayfasına taşınır (yoksa Code.gs oluşturur; en yeni üstte).
    Sıra: eski yaz → doğrula → seans yaz → Plan satırlarını arsiv'e kopyala → Plan'dan sil.
  - Telefonda: biten seansın kaydı (plan + sonuçlar + form) **otomatik silinmez**,
    "Yapılmış idmanlar" listesinde saklanır.
  - Yeni sayfa **Telefonda yapılmış idmanlar**: tarih, mesafe, süre, gönderildi/kuyrukta
    durumu. Kayıt tek tek veya toplu silinir; silmeden önce onay sorulur.
    Kuyrukta (henüz gönderilmemiş) kayıt için ayrıca uyarı gösterilir.

### Güvenlik

- [ ] **G.1** Code.gs başına `@OnlyCurrentDoc`: betik yalnızca bağlı tabloya erişir
  (yetki izni daralır; dağıtımda yeniden izin istenir).
- [ ] **G.3** Anahtar yenileme: README'ye "token nasıl değiştirilir" adımları
  (`tokenUret()` → yeni anahtar telefona); Ayarlar'a **Anahtarı unut** düğmesi.
- [ ] **G.4** index.html'e Content-Security-Policy: betik yalnızca kendi dosyalarımız,
  bağlantı yalnızca `script.google.com` / `script.googleusercontent.com`.
- [ ] **G.5** Yazı tipleri depoya alınır (Google Fonts'a istek gitmez, CSP daha dar,
  çevrimdışı da aynı görünüm).
- [ ] **G.6** Sunucu hata ayrıntıları istemciye gönderilmez: kullanıcıya kısa kod +
  mesaj, ayrıntı yalnızca Apps Script günlüğüne.

### İşlev

- [ ] **F.1** Çıkışa geri sayımında sesli uyarı: son 3 saniyede kısa bip, çıkışta
  uzun bip (Ayarlar'dan kapatılabilir; iOS için ilk dokunuşta ses açılır).
- [ ] **F.5** 100 m tempo ve CSS bölgeleri: kronometre ve set kartında 100 m temposu;
  Ayarlar'a CSS (kritik yüzme hızı) girilir, tempo bölge rengiyle gösterilir.
- [ ] **F.6** Su kilidi: seans sırasında ıslak parmakla yanlış dokunmayı önleyen
  kilit; açmak için uzun basma / kaydırma.

## 2. Aşama — Orta vade

### İşlev

- [ ] **F.2** Seans özeti ve analiz: bitişte planlanan/gerçekleşen mesafe-süre,
  blok bazında dağılım; haftalık toplamlar.
- [ ] **F.3** Set başına kulaç sayısı / nabız girişi (isteğe bağlı alanlar).
- [ ] **F.4** Tekrar takibi ve otomatik aralık modu: çıkış saatine göre tekrarları
  kendiliğinden sayar, sonraki tekrara geçer.
- [ ] **F.7** Service worker: uygulama dosyaları önbellekte, internet yokken de açılır.
- [ ] **F.8** Uygulama içinde plan düzeltme (tekrar, mesafe, hedef) ve tabloya yazma.

### Görsel

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

- [ ] `eski` sayfasında B1 hücresine **Sıra** yaz (şu an `#REF!`).
- [ ] Code.gs'i Apps Script'e yapıştırıp **yeni sürüm** olarak dağıt (bilgisayardan).
  eski ve seans için "en yeni üstte" ancak bundan sonra devreye girer.

## Tamamlanan

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
