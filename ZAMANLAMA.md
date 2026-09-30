# YüzmeSK — Zamanlama modeli (Sürüm 10 şartnamesi)

30.09.2026 · Görseller: `tasarim/v12/idman-zamanlama-2.png`, `tasarim/v12/seans-sonu.png`

## 0. İlkeler

1. **Tek zamanlayıcı.** Ayrı kronometre yok. İdman ekranı zamanlayıcının kendisidir.
2. **Düğmeye basıldığı an ölçülür.** Her dokunuşta yalnızca zaman damgası (`Date.now()`)
   kaydedilir. Tekrar, dinlenme ve idman süreleri damgalardan hesaplanır; süre biriktirilmez.
   Telefon kilitlense, arka plana düşse ya da uygulama kapanıp açılsa da süre kaybolmaz.
3. **Hiçbir geçiş kendiliğinden olmaz.** Dinlenme sıfırlansa da tekrar ancak dokununca başlar.
4. **Hassas ölçüm Garmin'dedir.** Uygulamanın süreleri tempo tutturmak, anlık geri bildirim ve
   yedek içindir.
5. **Tek büyük düğme.** Hep aynı yerde, aynı boyutta durur; yalnızca yazısı değişir.

## 1. Terimler

- **İdman:** O günün Plan satırlarının tamamı.
- **Set:** Plan'daki bir satır (Sıra).
- **Tekrar:** Setin `Tekrar` sütunu kadar yüzüş (4×100'de 4 tekrar).
- **Dinlenme:** Bir tekrarın GELDİM'i ile sonraki tekrarın ÇIK'ı arası. Plan'daki `Dinlen`
  sabit dinlenme süresidir (çıkış aralığı değildir).
- **Set sonu dinlenmesi:** Setin son GELDİM'i ile sonraki setin ilk ÇIK'ı arası. Biten sete aittir.
- "Tur" kavramı, düğmesi ve olayı **yoktur**.

## 2. Akış ve büyük düğme

| Durum | Büyük düğme | Dokununca |
|---|---|---|
| İdman başlamadı | **İDMANA BAŞLA** | İdman saati başlar, 1. set hazır |
| Set hazır | **ÇIK** · 1. tekrar | 1. tekrar başlar |
| Yüzüyor | **GELDİM** (beyaz) | Tekrar biter, dinlenme başlar |
| Dinleniyor, tekrar kaldı | **ÇIK** · n. tekrar | Sonraki tekrar başlar |
| Setin son tekrarı bitti | **ÇIK** · sonraki set | Sonraki setin 1. tekrarı başlar |
| Son setin son tekrarı bitti | — | İdman biter → seans sonu |

- Setin son GELDİM'i seti bitirir: kart kendiliğinden sonraki sete geçer, üstte biten setin
  özeti görünür (ör. "✓ 4×100 bitti · ort. 1:29.8 · 4/4"), set sonu dinlenmesi sayılır.
- Son setin son GELDİM'i idmanı bitirir; idman saati o anda durur.
- Normal akışta tekrar başına 2 dokunuş (ÇIK + GELDİM); set geçişi ve idman bitişi için ek
  dokunuş yoktur. Menü yoktur.

## 3. Ekran

- **Üst alan:** ‹ (küçük) · SÜRE `geçen /hedef` · MESAFE `yapılan /toplam`. Rakamlar 54 px,
  etiketler 14 px. Altında blok renkli ilerleme çubuğu.
- **Metro hattı:** Sürüm 8'deki gibi; aktif set kartı ortada, önceki 1 ve sonraki 2 durak.
- **Aktif set kartı:** blok · ad · n/N, `Tekrar × Mesafe Stil Tür`; set hazırken açıklama,
  Hedef ve Dinlen kutuları; set başladıktan sonra:
  - **Tekrar kutucukları:** biten yeşil (süre), yüzülen sarı, dinlenilen mavi, bekleyen "—".
  - **Büyük saat:** yüzerken yukarı sayar ("Hedef 1:30 · 42 sn kaldı"); dinlenirken çıkışa geri
    sayar ("Son tekrar 1:29 · −1 sn"); son 3 saniyede sarı ve çerçeve yanıp söner; sıfırı
    geçince durmaz, kırmızı eksi sayar ("DİNLENME UZADI −0:07").
- **Alt bar:** `Geri al` (sol) · **büyük düğme** (en az 120 pt yükseklik) · `Ses` (sağ).
- Rakamlar sabit genişlikli (tabular-nums).

## 4. Zaman hesabı

Her olay damgası saklanır: `idmanBasla`, set başına tekrar listesi `[{cik, geldim}]`,
`idmanBitir`.

- Tekrar süresi `= geldim − cik`
- Dinlenme `= sonraki cik − geldim` (set içi)
- Set sonu dinlenmesi `= sonraki setin ilk cik − setin son geldim`
- Dinlenme sayacı `= Dinlen − (şimdi − geldim)`; sıfırın altında eksi, kırmızı
- İdman süresi `= idmanBitir − idmanBasla` (duvar saati; duraklatma yok)
- Hedef toplam `= Σ Tekrar × (Hedef + Dinlen)` (değişmez; `Dinlen` boşsa 0)
- Ekrandaki her değer her karede `şimdi − damga` olarak yeniden hesaplanır; `visibilitychange`'te
  telafi yapılmaz, yalnızca yeniden çizilir.

## 5. Ses ve geri bildirim

- Dinlenmede çıkışa **3, 2, 1** saniye kala kısa bip, **0**'da uzun bip (her dinlenmede birer kez;
  set sonu dinlenmesi dahil, sonraki setin değil biten setin `Dinlen`'i esas alınır).
- GELDİM'de kısa onay sesi; 3-2-1 sırasında ekran çerçevesi yanıp söner.
- Alt bardaki **Ses** düğmesi tek dokunuşla açar/kapatır (🔊/🔇), Ayarlar'daki seçenekle aynı ayar.
- iPhone titreşimi desteklemez; sessiz modda ses çıkmaz — görsel uyarı her zaman vardır.
- Ekran kilidi (Wake Lock) idman boyunca tutulur, arka plandan dönüşte yeniden alınır.

## 6. Hatalara karşı

- **Çift dokunma:** Her geçişten sonraki 2 saniye içindeki dokunuş yok sayılır.
- **Geri al:** Her dokunuştan sonra 5 saniye yanar; son olayı iptal eder (damgası silinir,
  önceki duruma döner). İdmanı bitiren son GELDİM de geri alınabilir (RPE ekranında
  "Yanlışlıkla mı bitti? İdmana dön").
- **Yüzerken:** setler kaydırılamaz, ‹ çalışmaz; büyük düğme ve Geri al dışındaki dokunuşlar
  yok sayılır.
- **Su kilidi kaldırılır** (yüzerken ekran zaten kapalı).
- Durum her olayda telefona yazılır; uygulama kapanırsa kaldığı yerden açılır.

## 7. Erken bitirme

- **Seti erken bitirmek:** Dinlenirken kart sonraki sete kaydırılır. Kaydırmak tek başına bir
  şey değiştirmez: turuncu uyarı çıkar ("4×100 3/4'te kapanacak · 4. tekrar yapılmadı"),
  büyük düğme "ÇIK · 2×100 Pull" olur. Set ancak ÇIK'a basınca n/N olarak kapanır; geri
  kaydırmak vazgeçer. Birden fazla set atlanabilir; hiç tekrarı olmayan set yapılmadı sayılır.
- **İdmanı erken bitirmek:** ‹ (dinlenirken veya set başında) alttan panel açar:
  "Yapılan: 2 set tam, 4×100 2/4 · 600 m · 14:09" · **İdmanı bitir ve kaydet** · **Devam et**.
  Bitir: idman saati o anda durur, seans sonuna geçilir.

## 8. Seans sonu (3 adım)

1. **RPE:** 0–10 arası dev düğmeler (3 satır), altlarında kısa açıklama. Tek dokunuş seçer ve
   geçer. Önceki seansın değeri hazır gelmez. İlk 5 sn "İdmana dön" görünür.
2. **MSI:** Büyük **"Ağrı yok"** düğmesi (MSI boş kalır, özete geçer). Ağrı varsa bölge kutuları:
   Sağ/Sol omuz, Sağ/Sol diz, Kalça, Bel, Boyun. Her dokunuş değeri döndürür:
   0,5 → 1 → 1,5 → 2 → 3 → boş. Altta ölçek: 0,5 gözlem · 1–1,5 hafiflet · 2 durdur · 3+ tıbbi.
   "Devam" ile özete geçer.
3. **Özet ve kaydet:**
   - Süre ve mesafe hesaplanmış gelir; havuz (25/50) son seanstan hatırlanır; RPE ve MSI özeti.
   - **Nota yazılacaklar** (onay kutulu, set başına):
     - `Tekrarlar: 1:28, 1:29, 1:31, 1:30` — 2+ tekrarlı sette varsayılan işaretli.
     - `Dinlenme: 0:21, 0:19, 0:25 (ort. +2 sn) · Set sonu 0:48` — yalnızca set içi dinlenme
       ortalaması planı ±5 sn aşarsa veya tek bir dinlenme ±10 sn saparsa önerilir; varsayılan
       işaretsiz. Set sonu dinlenmesi sapma hesabına katılmaz.
     - `3/4 tekrar yapıldı` — eksik sette her zaman işaretli.
   - **Şüpheli tekrar:** setteki diğer tekrarların ortancasından %50'den fazla sapan tekrar turuncu
     "⚠ 2:41 — düzelt" olarak gösterilir. Dokununca panel: −/+ ile düzelt · ortalamadan çıkar ·
     olduğu gibi bırak.
   - **Açıklama:** hazır ifadeler ("İyi hissettim", "Yorgun", "Omuz hassas") ve serbest metin
     (iPhone klavyesinin mikrofonuyla yazılabilir).
   - **Kaydet** (tek dokunuş). Tipik seans: RPE + "Ağrı yok" + Kaydet = 3 dokunuş.

## 9. Tabloya yazım (Code.gs değişmez)

- **eski:** en az bir tekrarı yapılan her set bir satır (Plan satırından, Sıra sırasıyla).
  - `Gerçek` = tekrar sürelerinin ortalaması (çıkarılan tekrarlar hariç), mevcut süre biçimiyle
    (`[mm]:ss.0` sayı; metin yazılmaz, "23:00 = 23 saat" sorunu olmaz).
  - `Not` = işaretlenen not satırları (varsa mevcut notla birlikte, " | " ile).
- **seans:** Süre = idman süresi; Mesafe = yapılan tekrarların toplamı (Tekrar sayısı × mesafe);
  Havuz; RPE; MSI; Açıklama. Sütun adları değişmez.
- Hiç tekrarı yapılmayan set yazılmaz (bugünkü "tamamlanmadı" gibi).

## 10. Kaldırılanlar

Ayrı kronometre ekranı · TUR ve tur listesi · Kaydet paneli · "Çıkışa" (çıkış aralığı) sayacı ·
Seti Tamamla düğmesi · Başla/Bitir düğmesi · su kilidi · tek sayfalık seans formu.

## 11. Geçiş

Sürüm 10'a geçerken devam eden bir seans varsa: işaretli setler "tamamlandı, süre yok" olarak
korunur, işaretsizler yeni modelde kaldığı yerden devam eder. Kaydedilmemiş eski kronometre
turları, ilgili setin Not önerisine "Turlar: …" olarak eklenir.

## 12. Mimari

- Zaman mantığı ayrı, saf bir modülde (`zaman.js`): olay listesi → durum ve süreler. DOM'a ve
  `localStorage`'a dokunmaz; Node'da birim testiyle doğrulanır.
- Arayüz yalnızca olay üretir (`idmanBasla`, `cik`, `geldim`, `geriAl`, `setAtla`, `idmanBitir`)
  ve durumdan çizer.

## 13. Kabul kriterleri

1. 4×50 seti sekiz dokunuşla biter; dört tekrar ve üç set içi dinlenme + set sonu dinlenmesi kaydedilir.
2. Setin son GELDİM'i kartı sonraki sete geçirir; son setin son GELDİM'i idmanı bitirir.
3. Dinlenme sıfırı geçince sayaç durmaz, eksi ve kırmızı sayar; tekrar dokunmadan başlamaz.
4. 3-2-1 kısa ve 0'da uzun bip her dinlenmede bir kez çalar; ses düğmesi kapatınca çalmaz.
5. Büyük düğme her durumda aynı konum ve boyuttadır (≥120 pt); yazısı sırayla değişir.
6. Geçişten sonraki 2 sn içindeki ikinci dokunuş yok sayılır.
7. Geri al son olayı iptal eder; idmanı bitiren son GELDİM de geri alınabilir.
8. Yüzerken kaydırma ve ‹ çalışmaz.
9. Dinlenirken sonraki sete kaydırıp ÇIK'a basmak seti n/N kapatır; geri kaydırmak vazgeçer.
10. Telefon 10 dakika kilitli kalıp açıldığında tüm saatler gerçek geçen süreyi gösterir.
11. Hedef toplam `Σ Tekrar × (Hedef + Dinlen)` ile hesaplanır.
12. Gerçek = ortalama tekrar süresi; Not'a yalnızca işaretlenen satırlar yazılır.
13. Tipik seans sonu 3 dokunuşta kaydedilir.
14. Uygulamada "Tur" adlı düğme, eylem veya olay yoktur.

## 14. Açık konu

- **İdman sırasında ağrı kaydı:** Menü kaldırıldığı için bu sürümde yok; MSI seans sonunda
  girilir. (Seans sonu görselinde gösterilen "idman sırasında kaydedildi" etiketi bu yüzden
  şimdilik kapsam dışı.)
