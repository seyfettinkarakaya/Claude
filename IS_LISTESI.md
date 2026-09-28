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
