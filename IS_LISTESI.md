# YüzmeSK — İş listesi

Talepler ve hatalar burada toplanır; kod ancak "uygula" denince, listedeki
bekleyen işlerin tamamı birlikte güncellenir.

## Bekleyen (kod)

- [ ] **Setler çok hızlı kayıyor, daha zor/yavaş kaymalı.** Plan:
  - Bir durak geçmek için gereken parmak yolu ~90 px'ten ~170 px'e çıkar
    (yaklaşık kartın üçte biri kadar sürüklemek gerekir).
  - Atalet (fırlatma) belirgin azalır: hızlı bir fırlatma en fazla 1 durak ileri götürür.
  - Kısa, kararsız sürüklemeler (durağın yarısından az) geri yerine oturur.
  - Oturma animasyonu biraz yavaşlar, "istasyona yanaşma" hissi verir.

- [ ] **Presbiyopi (+1,75) için okunabilirlik** (görsel: şimdiki / öneri karşılaştırması)
  - Durak süreleri 15 → 22 px, kalın, açık gri (yüksek kontrast).
  - Aktif durak süresi 14 → 24 px (sarı); altındaki set süresi 10 → 16 px.
  - Durak adları 17 → 20 px, daha açık renk.
  - Üstteki değerler (Şu an / Mesafe / Son durak) 30 → 32 px.
  - Kart altı: **Alet** kendi satırında, değeri 17 → **24 px**; set mesafesi altında sağda, 19 px.
  - **Hedef / Dinlen değerleri 46 → 60 px**; sığması için dakikanın baştaki sıfırı atılır
    ("01:30" → "1:30", "00:20" → "0:20"), kutu iç boşlukları daralır.
  - Görsel ve CSS taslağı: `tasarim/v8/`
  - Kartın ortası açıklamaya bırakılır; uzun açıklamada yazı gerekirse otomatik küçülür,
    kesilmez.
  - Etiketler (HEDEF, ŞU AN…) küçük kalır. Süre sütunu genişlediği için hat ve kart
    ~20 px sağa kayar.

- [ ] **Üst başlık iki bloğa:** geri düğmesi + solda **SÜRE** `geçen / toplam hedef`
  (ör. 24:19 / 25:45, toplam hedef sarı), sağda **MESAFE** `yapılan / toplam`
  (ör. 400 / 1.300). Üç parçalı "Şu an / Mesafe / Son durak" kalkar; rakamlar ~36 px.

- [ ] **İlk sayfa (gün seçimi) tasarımı** — seçim bekliyor: G1 Lagün / G2 Hafta şeridi /
  G3 Hat haritası (`tasarim/v9/`). Mavi–turkuaz–yeşil tonları; her gün kartında o günün
  blok renkli hat önizlemesi, set · mesafe · hedef süre; gradyan "Bugünün idmanını aç".

## İzlenecek

- [ ] Telefondaki tarih önbelleğinin neden bozulduğu kesin bulunamadı. Sürüm 3+
  bozuk kaydı atlıyor ve hatayı ekranda gösteriyor. "Tarih listesi beklenmeyen
  biçimde geldi" veya "Beklenmeyen hata" mesajı görülürse ekran görüntüsü alınacak.

## Senin tarafında (tabloda / Apps Script'te)

- [ ] `eski` sayfasında B1 hücresine **Sıra** yaz (şu an `#REF!`).
- [ ] Code.gs'i Apps Script'e yapıştırıp **yeni sürüm** olarak dağıt (bilgisayardan).
  eski ve seans için "en yeni üstte" ancak bundan sonra devreye girer.

## Tamamlanan

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
