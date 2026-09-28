# YüzmeSK — İş listesi

Talepler ve hatalar burada toplanır; kod ancak "uygula" denince, listedeki
bekleyen işlerin tamamı birlikte güncellenir.

## Bekleyen (kod)

- [ ] **Tarife / metro tasarımı** (onay bekliyor) — görseller: `tasarim/v7/` (set ekranı),
  `tasarim/v6/K3-kronometre-70.png` ve `tasarim/v5/K2-kaydet.png` (kronometre)
  - Set ekranı: tekerlek gibi yukarı/aşağı kaydırma; hat sabit, duraklar "peron" halkasından
    geçer (önceki/sonraki istasyona gelme etkisi); aktif set kartı ekranın ~%62'si.
  - Solda yığımlı hedef süre (küçük font), aktif durakta "+set süresi".
  - Üstte Şu an / Mesafe / Son durak; altında blok renkli, mesafeye oranlı ilerleme çubuğu.
  - Aktif bloğun rengi kart çerçevesine ve arka plandaki hafif ışımaya yansır.
  - Alt düğmeler: bar içinde solda Kronometre, ortada geniş sarı "Seti Tamamla", sağda Bitir.
  - Kronometre (çalışırken): rakamlar ekranın %70'i; tekrar göstergesi, hedef çubuğu,
    Hedefe / Çıkışa / Son tur; Durdur · TUR · Kaydet.
  - Kaydet ekranı: set seçimi, turlar (hedeften hızlı yeşil), ortalama, iki kayıt seçeneği.

## İzlenecek

- [ ] Telefondaki tarih önbelleğinin neden bozulduğu kesin bulunamadı. Sürüm 3+
  bozuk kaydı atlıyor ve hatayı ekranda gösteriyor. "Tarih listesi beklenmeyen
  biçimde geldi" veya "Beklenmeyen hata" mesajı görülürse ekran görüntüsü alınacak.

## Senin tarafında (tabloda / Apps Script'te)

- [ ] `eski` sayfasında B1 hücresine **Sıra** yaz (şu an `#REF!`).
- [ ] Code.gs'i Apps Script'e yapıştırıp **yeni sürüm** olarak dağıt (bilgisayardan).
  eski ve seans için "en yeni üstte" ancak bundan sonra devreye girer.

## Tamamlanan

- [x] Gece Havuzu görünümü: lacivert zemin, blok renkli şerit ve ilerleme çubuğu (sürüm 5)
- [x] Kart düzeni: 1) Tekrar × Mesafe Stil Tür 2) açıklama (büyük) 3) Hedef · Dinlen · Alet
  4) Mesafe set/yığımlı · Süre set/yığımlı (küçük) (sürüm 5)
- [x] Üstte toplam hedef süre (yapılan / toplam) (sürüm 5)
- [x] seans: en yeni üstte (Code.gs, dağıtım bekliyor)

- [x] eski: yeni seans satırları 2. satırdan itibaren en üste (Code.gs, dağıtım bekliyor)
- [x] Gün listesi açılışta hemen tazelenir, kuyruk arka planda gönderilir (sürüm 4)
- [x] "Zaten kayıtlı" ekranında takılma; bozuk yerel kayıtlarda çökme (sürüm 3)
- [x] Kayıt tabloya yazıldığı halde "kaydedilemedi" denmesi (sürüm 3)
