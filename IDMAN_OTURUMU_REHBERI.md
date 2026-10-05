# YüzmeSK (idmanSK) — idman içeriği oturumu için uygulama rehberi

Sürüm 13.0.0 · 05.10.2026 (idman oturumunun yorumlarıyla güncellendi). Bu metin, idman içeriğini konuştuğum Claude oturumu için yazıldı.
Amaç: yazdığın programlar uygulamanın bütün yeteneklerini kullansın, uygulamanın topladığı
veriyi de doğru okuyup yorumlayabilesin.

---

## 1. Uygulama ne yapıyor (kısa)

Telefonda çalışan bir web uygulaması (PWA). Üç Google tablosuyla konuşur:

| Tablo | İçerik | Uygulama ne yapar |
|---|---|---|
| **YuzmeProgram** | `Plan` (yazılan yüzme programı), `eski` (yapılan setler), `seans` (seans özeti), `arsiv` | Plan'ı okur; havuzda set set yönetir; bitince `eski`/`seans`'a yazar, Plan satırlarını `arsiv`'e taşır |
| **SalonTakip** | `idman` (yapılan salon setleri), `H` (hareket kataloğu), `hkEtki` (hareket → kas etkisi), `plan` (salon programı, sürüm 13) | Salon idmanını yönetir, `idman`'a yazar; `plan`'daki programı okur/yazar |
| **sporRef** | `css`, `zone`, `alet`, `RPE`, `MSI`, isteğe bağlı `kisit`, `yuzmeKas`, `drill` | Tempo bölgeleri, CSS, kurallar, drill videoları |

Yüzme ve salon **tek yük modelinde** birleşir:
- Yük = süre (dk) × RPE.
- Normal hafta = 3 seans × 65 dk × RPE 6 = 1170. (Bugün salon da bu 3 güne sayılıyor; bkz. bölüm 8.)
- "Bu hafta" ekranı haftalık planı, yük hedefini ve eklem bütçelerini gösterir.

---

## 2. Sağlık kısıtları (uygulamaya gömülü; sporRef `kisit` sayfasından değiştirilebilir)

- **Sağ kalça, Perthes:** Koşu ve zıplama yok. Ağırlıklı squat 90°'den derin değil. Kurbağalama (BR) ayda toplam metrenin **%10**'unu geçmez (uygulama sayar ve uyarır).
- **Sağ omuz (rotator manşet + impingement):** Her aerobik bloğun (MS, AS) sonunda 60 sn **omuz rahatlatma** önerilir. Ağrıda itiş hareketleri geri plana alınır.
- **Sağ diz, kondromalazi:** Kurbağalamada ek kısıt var, derin diz bükümü yok.
- **MSI ağrı ölçeği:**
  - 0: yok.
  - 0,5: gözlem.
  - 1–1,5: hafiflet.
  - 2: dur.
  - 3+: tıbbi değerlendirme.
- **Gün ve süre:** Haftada 3 **yüzme** günü (salon ayrı; bkz. bölüm 8). Cuma akşamı süre sınırsız. Salı/Çarşamba/Perşembe'den ikisi: sabah 75–80 dk ya da öğle 65 dk.
- **Stil sırası:** FR → BK → BF → BR.
- **CSS:**
  - Ekipmansız yaklaşık **2:06 /100 m (126 sn)**.
  - 1:57 (117 sn) **Paddle + PB** ile ölçülen değerdir; ekipmansız sette kullanılmaz.
  - Uygulama CSS'i sporRef `css` sayfasından aletine göre seçer: alet sütunu boş satır ekipmansız setler için, `Paddle+PB` satırı o aletle yüzülen setler için.
  - 09.10 testine kadar ekipmansız değer 126'dır.

---

## 3. Yüzme programı nasıl yazılır (Plan sayfası) — EN ÖNEMLİ BÖLÜM

Sütunlar (başlık adına göre bulunur, sıra önemli değil):
`Tarih, Sıra, Blok, Tekrar, Mesafe, Stil, Tür, Açıklama, Hedef, Dinlen, Alet, Gerçek, Kulaç, Nabız, RPE, MSI, Not`

**Bir satır = bir set** (aynı mesafe ve aynı hedefle tekrarlanan iş).

| Sütun | Ne yazılır | Uygulama ne yapar |
|---|---|---|
| Tarih | Gerçek tarih (`gg.aa.yyyy`) | Takvim; o günün programı |
| Sıra | 1, 2, 3 … (sayı) | Setlerin sırası; kayıt bu sırayla `eski`'ye gider |
| Blok | `WU` ısınma · `PS` hazırlık · `MS` ana set · `AS` ek set · `CD` soğuma | Renk, metro hattı. **MS ve AS "aerobik blok"**: blok bitince omuz rahatlatma çıkar. Ana set özeti MS'ten |
| Tekrar | Sayı (ör. 8) | Her tekrar tek dokunuşla ölçülür (YÜZ/DUR) |
| Mesafe | **Yalnızca sayı** (25, 50, 75, 100, 200 …) | Toplam metre, tempo /100, bölge, kulaç normu, yük ve stil payları |
| Stil | `FR`, `BK`, `BF`, `BR`, `IM` (Türkçe/İngilizce adlar da tanınır) | Kas yükü, kurbağalama payı. IM yük hesabında FR sayılır, içindeki BR kurbağalama payına girmez |
| Tür | `Swim`, `Drill`, `Kick`, `Pull` (ve "race/sprint" geçen açıklama) | Drill ve Kick setlerinde tempo bölgesi verilmez. Pull: pull kulaç normu ve pull kas yükü. Kick: bacak yükü |
| Açıklama | Serbest metin; **ilk satır** kartta görünür | Drill adı sporRef `drill` sayfasındaki adla geçerse ▶ video. "race/sprint/SP1" kelimeleri yarış kulaç normunu seçer |
| Hedef | **Bir tekrarın** yüzme süresi, **`00:01:30` biçiminde** (ss:dd:sn) | Tempo /100 ve bölge (REC, EN1–3, SP1–3), toplam hedef süre |
| Dinlen | Tekrar arası dinlenme, **`00:00:20` biçiminde** | Geri sayım, bip, toplam süre = tekrar × (hedef + dinlen) |
| Alet | sporRef `alet` sayfasındaki kod/ad (ör. `PB`/`Pullbuoy`, palet, paddle) | Alete özel CSS; şamandıra pull sayılır |
| Gerçek, Kulaç, Nabız, RPE, MSI, Not | **Boş bırak** | Uygulama yazar |

**Süre biçimi:**
- Hedef ve Dinlen'e `00:01:30` yaz.
- Sheets, `1:30`'u 1 saat 30 dakika diye okur ve uygulama da tabloda görünen metni okur. Bu yüzden `1:30` yanlış sonuç verir.
- `00:01:30` hem Sheets'te hem uygulamada 90 sn'dir.

### Telefon tek uçta: tekrarlar yakın duvarda bitmeli

Telefon havuzun bir ucunda durur. Her tekrar bitince o uçta düğmeye basılır.
- **25 m havuzda:** 25, 75, 125 … m'lik tekrar karşı duvarda biter ve ölçülemez.
- **50 m havuzda:** 50, 150 … m'lik tekrar karşı duvarda biter.

Program yazarken:
- Tekrar mesafesi havuz boyunun **çift katı** olsun: 25 m havuzda 50, 100, 150 …
- **25'ler:** çift yaz. `8×25 hızlı` yerine `4×50 · Açıklama: 25 hızlı + 25 kolay` ya da `4×50 · 2×25, karşıda 0:15 dinlen`.
- **75'ler:** `100 · 75 + 25 kolay dönüş` olarak yaz.
- Uzak duvarda dinlenmeli set gerekiyorsa tekrar karşı duvarda bitecektir. Bunu ölçecek "çift ölçüm" özelliği iş listesinde; o gelene kadar böyle setleri çift tekrar olarak yaz.

### Yapılmaması gerekenler (bugünkü sürümde bozuk sonuç verir)

- **Mesafeye metin yazma:** `25/75`, `25+75`, `4×25`, `100 (25 hızlı)` gibi değerler sıfır sayılır. Set "8 × 0" görünür; metre, tempo, bölge ve yük kaybolur.
  - **Doğrusu:** Mesafe `100`, Açıklama `25 hızlı / 75 kolay`.
  - Tempo bölgesi tekrarın ortalamasından hesaplanır, yani karışık tekrarda bölge "ortalama" olur. Bunu Açıklama'da belirt.
- **Hedef veya Dinlen'e aralık ya da çıkış saati yazma:** `1:30–1:35`, `@1:50`, `send-off 2:00` gibi değerler okunmaz (0 sayılır).
  - **Doğrusu:** Hedef'e tek değer (ör. `00:01:32`), aralığı Açıklama'ya yaz.
  - Çıkış saatli (send-off) setlerde Hedef + Dinlen = çıkış süresi olacak şekilde böl. Örnek: @1:50, hedef 1:35 → Hedef `00:01:35`, Dinlen `00:00:15`.
- **İç içe yapı tek satıra yazılmaz:** `3 × (4×50 + 100)` → her parçayı **ayrı satır** olarak, sırayla yaz (turları tekrarla). Örnek: Sıra 5: 4×50, Sıra 6: 1×100, Sıra 7: 4×50, …
- **Piramit, merdiven, kırık setler:** Her basamak ayrı satır (ör. 50, 100, 150, 100, 50).
- **Aynı tekrar içinde stil değişimi** (ör. 25 BF + 75 FR): Mesafe tekrarın toplamı, Stil baskın stil, ayrıntı Açıklama'da.

### Uygulamanın havuzda yaptıkları (program yazarken bil)

- Her tekrarı tek düğmeyle ölçer. Dinlenmeyi geri sayar, son 3 saniyede bip verir.
- Set sonunda kulaç (/25 m) ve nabız sorar. Kulaç normları:
  - drill 10–11;
  - yüzüş 13–15;
  - yarış 14–15;
  - pull 11–12.
- MS/AS bloğu bitince 60 sn omuz rahatlatma önerir (sarkaç, kol salınımı, kapı esnetme). Program yazarken bloğu doğru işaretle.
- İdman anında set düzenlenebilir (tekrar, mesafe, hedef, dinlen, stil, tür, alet), set eklenip silinebilir. Değişiklik `Not`'a "Plan: 4×100 → 6×100" diye düşer.
- Mola, seti erken bitirme, seti sıfırlama, **+1 tekrar** var.
- Seans sonunda RPE (0–10), MSI (vücut şemasında bölge bölge) ve havuz (25/50) girilir.

---

## 4. Uygulamanın geri yazdığı veri (yorumlarken)

**`eski` sayfası** (her yapılan set bir satır; en yeni üstte):
- **Gerçek:** O setin **ortalama tekrar süresi**. Tek tek tekrar süreleri işaretlenirse Not'a yazılır.
- **Kulaç:** /25 m.
- **Nabız:** Set sonu.
- **Not:**
  - plan farkı;
  - "idmanda eklendi";
  - plandan sapan dinlenmeler;
  - eksik tekrar.
- Eksik bitirilen set n/N olarak kaydedilir.

**`seans` sayfası:**
- **Tarih, Süre:** Süre ilk YÜZ'den bitişe kadar, molalar hariç.
- **Mesafe:** Yapılan tekrar × mesafe.
- **Havuz.**
- **RPE:** 0–10.
- **MSI:** `sag omuz 1; bel 0.5` biçiminde.
- **Açıklama:** Hazır ifadeler, mola süresi.

**SalonTakip `idman`:**
- Sütunlar: `Tarih, No, Hareket, Set, Tekrar, Ağırlık, Nabız, RPE, MSI, Açıklama, Süre`.
- Tekrar, setlerin ortalamasıdır; her setin tekrarı Açıklama'dadır (`Setler: 11-9-9`).
- Açıklama'da ayrıca son set türü ve RIR yazar (`son set: … · RIR 2`).
- Ağırlık sayı ya da `Vücut`.

Uygulamanın kendi hesapladıkları (sorarsam bunlara göre konuş):
- **Yük ve form:**
  - Seans yükü = dk × RPE.
  - Form eğrisi: 42/7 günlük ortalamalar.
  - Yük artış oranı: 7 gün ÷ 28 gün; güvenli aralık 0,8–1,3.
  - "Aradan dönüş": son 4 haftanın ortalaması normal haftanın yarısından azsa.
- **Kas toparlanması:** Yüzme yükü kas gruplarına stil katsayılarıyla dağıtılır (sporRef `yuzmeKas`).
- **Yüzme analizi:**
  - Yoğunluk dengesi: kolay ~%75, eşik ~%15, hız ~%10 hedefi.
  - Stil payları, SWOLF.
  - Aynı setle kıyas ve rekor.
  - CSS testi önerisi (eşik setleri hedefin altındaysa ya da 28 gün geçtiyse).
  - Derece tahmini.
- **Salon analizi:**
  - Haftalık set sayısı / kas grubu: hedef 10–20, omuz itişte ≤ 12.
  - Önleyici borç (omuz dış rotasyon, skapula vb.).
  - Otomatik ilerleme önerisi: RPE ≤ 8 ve MSI ≤ 0,5 → +2,5 kg ya da +1 tekrar.
- **Hazır olma kontrolü:**
  - Girdiler: uyku, kas ağrısı, enerji, eklem MSI.
  - Karar: tam / hafif / dinlen / tıbbi.
- **Dinlenme haftası önerisi:** Yük hızlı arttıysa, hazır olma kontrolleri kötüleştiyse ya da MSI artıyorsa.
- **Girişim uyarısı:** Ağır omuz salonu ile uzun/eşik yüzme aynı gün ya da art arda geliyorsa.

---

## 5. Haftalık model (sürüm 13 "Bu hafta" ekranı)

- **4 haftalık ortak döngü** (Form ve denge ekranında elle başlatılır), yüzme ve salonda aynı faz. **Faz takviminden haberi yok; şimdilik başlatılmayacak** (bkz. bölüm 8):
  1. **Hacim:**
     - Yüzme: EN1–EN2 aerobik hacim + teknik.
     - Salon: stabilite + core + omuz önleyici, 3 × 12–15.
  2. **Hacim+:**
     - Yüzme: eşik setleri (EN3) artar.
     - Salon: çekiş kuvveti (lat, kürek), 3–4 × 10–12.
  3. **Kuvvet:**
     - Yüzme: hız ve kalite (SP1), hacim −%10.
     - Salon: 3 × 6–8, dinlenme 2 dk; itişte omuz sınırı.
  4. **Dinlenme:**
     - Yüzme: hacim −%40, yoğunluk aynı.
     - Salon: yalnız önleyici + mobilite.
- **Haftalık yük hedefi:**
  - Normal durumda geçen haftanın en çok %10 üstü, aradan dönüşte %20.
  - Yük hızlı arttıysa %20 düşük.
  - Taban: normal haftanın %70'i.
- **Eklem bütçeleri:**
  - Omuz yükü (son 7 gün): sınır normal haftanın %35'i.
  - Kurbağalama: ayda ≤ %10.
  - Diz bükümlü salon setleri: haftada ≤ 9.
  - Son 14 günde o bölgede MSI ≥ 1 varsa sınır daralır.
- **Gün yerleşimi:**
  - Önce yapılanlar, sonra tablodaki programlar, kalan günlere öneri gelir.
  - Cuma akşamı yüzme.
  - Salon, Salı–Perşembe arasında yüzmeye bitişik olmayan bir güne konur.
  - Hazır olma "dinlen" derse bugüne öneri gelmez.
- **Tabloya yazım:**
  - Önerilen salon günü, onayla SalonTakip `plan` sayfasına yazılır.
  - Yüzme önerisi tabloya **yazılmaz**; yüzme programını sen yazarsın, ben Plan'a koyarım.

---

## 6. Salon programı nasıl yazılır (SalonTakip `plan` sayfası)

Sütunlar: `Tarih, Sıra, Hareket, Set, Tekrar, Ağırlık, Süre, Dinlen, Süperset, Not, Durum`

| Sütun | Ne yazılır |
|---|---|
| Hareket | `H` sayfasındaki **Exercise adıyla birebir** (ör. `Band Bent Over Row`). Katalogda olmayan ad kas haritasında ve formülde sayılmaz |
| Set, Tekrar | Sayı. Süreli hareketlerde (plank vb.) Tekrar `1` |
| Ağırlık | kg (sayı) ya da `Vücut` |
| Süre | Süreli hareketlerde saniye (ör. `45`); diğerlerinde boş |
| Dinlen | Saniye (ör. `90`) |
| Süperset | Aynı harf → süperset (ör. iki satıra `A`) |
| Durum | **Boş bırak**. Uygulama idman bitince "yapıldı" yazar |

Kurallar:
- Kısıta takılan hareketleri (squat > 90°, zıplama, koşu) uygulama gizler ve varsa güvenli alternatifi önerir. Ben de önermeyeyim.
- Her salon gününün başında 15–20 dk omuz önleyici + core olsun (dış rotasyon, Y kaldırış, ters fly, Pallof press, dead bug).
- Ana sayfada "bugünün programı" bu sayfadan gelir. "İdmana başla" programdaki değerlerle açılır.

---

## 7. Bu oturumdan beklediğim çıktı biçimi

Program önerirken:
1. **Yüzme:** Plan sayfasına yapıştırılabilir tablo. Sütunlar: Tarih, Sıra, Blok, Tekrar, Mesafe, Stil, Tür, Açıklama, Hedef, Dinlen, Alet.
   - Mesafe yalnız sayı; Hedef ve Dinlen tek `m:ss` değeri.
   - Karışık tekrarlar Açıklama'da.
   - Bloklar doğru (MS/AS aerobik).
   - Toplam süreyi tekrar × (hedef + dinlen) ile hesapla ve günün süre bütçesine (80 / 65 dk / Cuma sınırsız) sığdır. Geçişler için +5–8 dk pay bırak.
2. **Salon:** `plan` sayfasına yapıştırılabilir tablo. H'deki hareket adları kullanılsın; Ağırlık sayı ya da `Vücut`.
3. **Kısıt kontrolleri:**
   - BR ≤ %10 / ay.
   - MS/AS sonrası omuz rahatlatma.
   - Kuvvet salonu ile uzun/eşik yüzme art arda olmasın.
   - Haftada 3 gün.
4. **Faz:** Hangi döngü haftasındaysam (Hacim, Hacim+, Kuvvet, Dinlenme) programı ona göre kur.
5. **Yorum:** Verdiğim `eski`/`seans`/`idman` satırlarını yukarıdaki anlamlarıyla oku.
   - Gerçek = ortalama tekrar süresi.
   - Kulaç /25 m.
   - Tekrar ortalama, ayrıntı Açıklama'da.

---

## 8. Bilinen sınırlar (sürüm 13.0.0)

- **Gün sayımı:** "Haftada 3 gün" uygulamada bugün yüzme + salon **toplam** günü sayıyor.
  - Normal hafta salonu ayrı tanımlamıyor; bu yüzden Faz 1 (3 yüzme + 2 salon) "normalin üstünde" ve "3 gün tamam" görünür.
  - Yük uyarısını bu hafta için yorumlarken bunu hesaba kat.
  - Düzeltme iş listesinde: 3 gün yüzme için, salon ayrı (2 gün, ~50 dk, RPE ~5).
- **Faz takvimi ile döngü:**
  - Döngü bugün sabit 4 hafta: Hacim, Hacim+, Kuvvet, Dinlenme. Faz takvimini (Faz 0–4) tanımıyor.
  - Plan: faz takvimi üstte (sporRef `fazBilgi`), döngü onun içinde ve faza göre. Örnek: Faz 1 = Hacim, Hacim+, Hacim+, Dinlenme. Faz 0–1'de SP ve salon kuvveti yok.
  - O gelene kadar uygulamadaki döngüyü başlatma; fazı programda sen yönet.
- **MSI:** Uygulamada 1 ve 1,5 tek eylem: "hafiflet". "1,5 → ana set yarıya" kuralı uygulamada yok.
- **Seans süresi:** Seans süresi molalar hariç ölçülür (ilk YÜZ'den bitişe).
- **Mesafe:** Mesafe sütununa metin yazılamaz.
- **Ölçüm:**
  - Karşı duvarda biten tekrar ölçülemez (yukarıda).
  - Tekrar içinde ara süre yok: tekrar tek süre olarak ölçülür.
- Biten set havuzda yalnız sıfırlanabilir, süresi elle düzeltilemez (iş listesinde).
- Plan süreleri sabit formülle tahmin ediliyor, gerçekleşen sürelerden henüz öğrenmiyor (iş listesinde).
- Garmin/saat verisi yok.
