# YüzmeSK — İş listesi

Talepler ve hatalar burada toplanır; kod ancak "uygula" denince, listedeki
bekleyen işlerin tamamı birlikte güncellenir.

## Bekleyen (kod)

- [ ] **seans: en yeni üstte.** `seans` sayfasına yeni seans satırı 2. satırdan
  itibaren en üste eklensin (eski'deki gibi; biçim ilk veri satırından alınır).
  → Code.gs değişikliği; Apps Script'e yeniden yapıştırıp yeni sürüm dağıtmak gerekir.
- [ ] **Görsel yenileme.** Program ekranı için yön seçimi bekleniyor
  (A Gece Havuzu / B Renkli Kart / C Gün Işığı veya karışım) ve blok renkleri
  (WU mavi, PS mor, MS turuncu, AS sarı, CD turkuaz).
  Seçenekler: https://claude.ai/artifact/1Wm8Vv2E4rYADL3fgvtTJi
  → Seçim yapılmadan uygulanmaz.

## İzlenecek

- [ ] Telefondaki tarih önbelleğinin neden bozulduğu kesin bulunamadı. Sürüm 3+
  bozuk kaydı atlıyor ve hatayı ekranda gösteriyor. "Tarih listesi beklenmeyen
  biçimde geldi" veya "Beklenmeyen hata" mesajı görülürse ekran görüntüsü alınacak.

## Senin tarafında (tabloda / Apps Script'te)

- [ ] `eski` sayfasında B1 hücresine **Sıra** yaz (şu an `#REF!`).
- [ ] Code.gs'i Apps Script'e yapıştırıp **yeni sürüm** olarak dağıt.
  (eski'ye en üste ekleme main'de hazır ama henüz dağıtılmadı. "uygula"dan sonra
  seans değişikliğiyle birlikte tek seferde dağıtmak yeterli.)

## Tamamlanan

- [x] eski: yeni seans satırları 2. satırdan itibaren en üste (Code.gs, dağıtım bekliyor)
- [x] Gün listesi açılışta hemen tazelenir, kuyruk arka planda gönderilir (sürüm 4)
- [x] "Zaten kayıtlı" ekranında takılma; bozuk yerel kayıtlarda çökme (sürüm 3)
- [x] Kayıt tabloya yazıldığı halde "kaydedilemedi" denmesi (sürüm 3)
