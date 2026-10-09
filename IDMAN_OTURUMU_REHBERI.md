# idmanSK — idman içeriği oturumu için uygulama rehberi

Sürüm 13.2.0 · 09.10.2026 (iki dosya: idman + idmanRef) (idman oturumunun yorumları ve 06.10 hata listesiyle güncellendi). Uygulamanın adı artık **idmanSK** (eski adı YüzmeSK). Bu metin, idman içeriğini konuştuğum Claude oturumu için yazıldı.
Amaç: yazdığın programlar uygulamanın bütün yeteneklerini kullansın, uygulamanın topladığı
veriyi de doğru okuyup yorumlayabilesin.

---

## 1. Uygulama ne yapıyor (kısa)

Telefonda çalışan bir web uygulaması (PWA). Üç Google tablosuyla konuşur:

| Tablo | Sayfalar | Uygulama ne yapar |
|---|---|---|
| **idman** (giriş verileri) | `havuzPlan` (yazılan yüzme programı), `havuzVeri` (yapılan yüzme setleri), `havuzSeans` (yüzme seans özeti), `salonVeri` (yapılan salon hareketleri), `salonPlan` (salon programı) | havuzPlan'ı okur; havuzda set set yönetir; bitince havuzVeri/havuzSeans'a yazar ve günün havuzPlan satırlarını siler (arşiv yok). Salonda salonVeri'ye yazar, salonPlan'ı okur/yazar |
| **idmanRef** (referanslar) | `css`, `zone`, `alet`, `bilgi` (vücut ağırlığı BW satırı dahil), `RPE`, `MSI`, `faz`, `salonHar` (hareket kataloğu), `salonHKEtki` (hareket → kas etkisi); isteğe bağlı `kisit`, `yuzmeKas`, `drill` | Tempo bölgeleri, CSS, faz takvimi, kurallar, hareket kataloğu, drill videoları |

Yüzme ve salon **tek yük modelinde** birleşir:
- Yük = süre (dk) × RPE.
- Normal hafta = 3 seans × 65 dk × RPE 6 = 1170.
  - idmanRef `kisit`'te `gun_hafta_salon` varsa yüzme ve salon **ayrı** sayılır ve normal haftaya salon payı eklenir: 3 × 65 × 6 + 2 × 50 × 5 = 1670 (bkz. bölüm 5).
- "Bu hafta" ekranı haftalık planı, yük hedefini ve eklem bütçelerini gösterir.

---

## 2. Sağlık kısıtları (uygulamaya gömülü; idmanRef `kisit` sayfasından değiştirilebilir)

- **Sağ kalça, Perthes:** Koşu ve zıplama yok. Ağırlıklı squat 90°'den derin değil. Kurbağalama (BR) ayda toplam metrenin **%10**'unu geçmez (uygulama sayar ve uyarır).
- **Sağ omuz (rotator manşet + impingement):** Her aerobik bloğun (MS, AS) sonunda 60 sn **omuz rahatlatma** önerilir. Ağrıda itiş hareketleri geri plana alınır.
- **Sağ diz, kondromalazi:** Kurbağalamada ek kısıt var, derin diz bükümü yok.
- **MSI ağrı ölçeği:**
  - 0: yok.
  - 0,5: gözlem.
  - 1–1,5: hafiflet.
  - 2: dur.
  - 3+: tıbbi değerlendirme.
- **Gün ve süre:** Haftada 3 **yüzme** günü; salon ayrı (kisit `gun_hafta_salon`, bkz. bölüm 5). Cuma akşamı süre sınırsız. Salı/Çarşamba/Perşembe'den ikisi: sabah 75–80 dk ya da öğle 65 dk.
- **Stil sırası:** FR → BK → BF → BR.
- **CSS:**
  - Ekipmansız yaklaşık **2:06 /100 m (126 sn)**.
  - 1:57 (117 sn) **Paddle + PB** ile ölçülen değerdir; ekipmansız sette kullanılmaz.
  - Uygulama CSS'i idmanRef `css` sayfasından aletine göre seçer: alet sütunu boş satır ekipmansız setler için, `Paddle+PB` satırı o aletle yüzülen setler için.
  - 09.10 testine kadar ekipmansız değer 126'dır.
  - Uygulamada **varsayılan CSS yok** (13.1.0). Bugünü kapsayan geçerli satır yoksa tempo bölgesi gösterilmez ve program açılınca uyarı çıkar. Eski satırın değeri kullanılmaz.
  - Aletli sette o aletin kendi satırı yoksa bölge verilmez; ekipmansız CSS'e düşülmez, çünkü paddle/PB setleri olduğundan zor görünür.

---

## 3. Yüzme programı nasıl yazılır (idman!havuzPlan) — EN ÖNEMLİ BÖLÜM

Sütunlar (başlık adına göre bulunur, sıra önemli değil):
`Tarih, Sıra, Blok, Tekrar, Mesafe, Stil, Tür, Açıklama, Hedef, Dinlen, Alet, Gerçek, Kulaç, Nabız, RPE, MSI, Not`

**Bir satır = bir set** (aynı mesafe ve aynı hedefle tekrarlanan iş).

| Sütun | Ne yazılır | Uygulama ne yapar |
|---|---|---|
| Tarih | Gerçek tarih (`gg.aa.yyyy`) | Takvim; o günün programı |
| Sıra | 1, 2, 3 … (sayı) | Setlerin sırası; kayıt bu sırayla `havuzVeri`'ye gider |
| Blok | `WU` ısınma · `PS` hazırlık · `MS` ana set · `AS` ek set · `CD` soğuma | Renk, metro hattı. **MS ve AS "aerobik blok"**: blok bitince omuz rahatlatma çıkar. Ana set özeti MS'ten |
| Tekrar | Sayı (ör. 8) | Her tekrar tek dokunuşla ölçülür (YÜZ/DUR) |
| Mesafe | **Yalnızca sayı** (25, 50, 75, 100, 200 …) | Toplam metre, tempo /100, bölge, kulaç normu, yük ve stil payları |
| Stil | `FR`, `BK`, `BF`, `BR`, `IM` (Türkçe/İngilizce adlar da tanınır) | Kas yükü, kurbağalama payı. IM yük hesabında FR sayılır, içindeki BR kurbağalama payına girmez |
| Tür | `Swim`, `Drill`, `Kick`, `Scull`, `Pull`, `Test` (ve "race/sprint" geçen açıklama) | Drill, Kick ve Scull: bölge yerine **TEC**, yoğunluk dağılımına girmez. `Test` (CSS testi vb. maksimal set): bölge yok, **TEST** yazar, hız payına girmez. Pull: pull kulaç normu ve pull kas yükü. Kick: bacak yükü |
| Açıklama | Serbest metin; **ilk satır** kartta görünür | Drill adı idmanRef `drill` sayfasındaki adla geçerse ▶ video. "race/sprint/SP1" kelimeleri yarış kulaç normunu seçer |
| Hedef | **Bir tekrarın** yüzme süresi, **`00:01:30` biçiminde** (ss:dd:sn) | Tempo /100 ve bölge (REC, EN1–3, SP1–3), toplam hedef süre |
| Dinlen | Tekrar arası dinlenme, **`00:00:20` biçiminde** | Geri sayım, bip, toplam süre = tekrar × (hedef + dinlen) |
| Alet | idmanRef `alet` sayfasındaki kod/ad (ör. `PB`/`Pullbuoy`, palet, paddle) | Alete özel CSS; şamandıra pull sayılır |
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
- Biten sete dokununca **tekrar sürelerini düzelt** (± sn ya da ortalamadan çıkar) ya da sıfırla.
- Hedefin %20'sinden kısa tekrar (yanlış ya da çift dokunuş) atılmaz. Uygulama sorar: o an Geri al, sonra özette düzelt ya da çıkar.
- Süresi olmayan tamamlanmış set varsa kaydetmeden önce uyarı çıkar.
- Seans sonunda RPE (0–10), MSI (vücut şemasında bölge bölge) ve havuz (25/50) girilir.

---

## 4. Uygulamanın geri yazdığı veri (yorumlarken)

**`havuzVeri` sayfası** (her yapılan set bir satır; en yeni üstte):
- **Gerçek:** O setin **ortalama tekrar süresi**. Tek tek tekrar süreleri işaretlenirse Not'a yazılır.
- **Kulaç:** /25 m.
- **Nabız:** Set sonu.
- **Not:**
  - plan farkı;
  - "idmanda eklendi";
  - plandan sapan dinlenmeler;
  - eksik tekrar.
- Eksik bitirilen set n/N olarak kaydedilir.

**`havuzSeans` sayfası:**
- **Tarih, Süre:** Süre ilk YÜZ'den bitişe kadar, molalar hariç.
- **Mesafe:** Yapılan tekrar × mesafe.
- **Havuz.**
- **RPE:** 0–10.
- **MSI:** `sag omuz 1; bel 0.5` biçiminde.
- **Açıklama:** Hazır ifadeler, mola süresi.

**idman `salonVeri`:**
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
- **Kas toparlanması:** Yüzme yükü kas gruplarına stil katsayılarıyla dağıtılır (idmanRef `yuzmeKas`).
- **Yüzme analizi:**
  - Yoğunluk dengesi: kolay ~%75, eşik ~%15, hız ~%10 hedefi.
  - Stil payları, SWOLF.
  - Aynı setle kıyas ve rekor.
  - CSS testi önerisi (eşik setleri hedefin altındaysa ya da 28 gün geçtiyse).
  - Derece tahmini.
- **Salon analizi:**
  - Haftalık set sayısı / kas grubu: hedef 10–20, omuz itişte ≤ 12.
  - Önleyici borç (omuz dış rotasyon, skapula vb.).
  - İlerleme önerisi: RPE ≤ 8 ve MSI ≤ 0,5 → +2,5 kg ya da +1 tekrar.
    - **13.1.0:** Öneri sormadan uygulanmaz; idman başında kabul ya da red edilir.
    - Bant ve vücut ağırlığında kilo önerilmez, +1 tekrar önerilir.
  - Nabız boş başlar; ölçülmediyse yazılmaz. Önceki hareketin değeri kopyalanmaz.
  - Biten setlerin tekrarı ve hareketin ağırlığı idmanda sonradan düzeltilebilir.
  - Süre tahmini son idmanlardaki gerçek sürelerden (idman Süre sütunu) öğrenilir; kayıt yoksa formül kullanılır.
- **Hazır olma kontrolü:**
  - Girdiler: uyku, kas ağrısı, enerji, eklem MSI.
  - Karar: tam / hafif / dinlen / tıbbi.
- **Dinlenme haftası önerisi:** Yük hızlı arttıysa, hazır olma kontrolleri kötüleştiyse ya da MSI artıyorsa.
- **Girişim uyarısı:** Ağır omuz salonu ile uzun/eşik yüzme aynı gün ya da art arda geliyorsa.

---

## 5. Haftalık model (sürüm 13 "Bu hafta" ekranı)

- **Faz takvimi üstte, 4 haftalık döngü içinde (13.1.0):**
  - Faz tarihleri idmanRef `faz` sayfasından gelir (`Sezon, Faz, Tarih_ilk, Tarih_son, Ad, Odak`).
  - Döngü ve yasaklar idmanRef `kisit` sayfasına satır olarak yazılır (dağıtım gerekmez):
    - `dongu_F1` = `Hacim, Hacim+, Hacim+, Dinlenme`;
    - `yasak_F1` = `SP, Kuvvet`.
  - Döngü fazın başladığı haftadan kendiliğinden işler. Yasaklı Kuvvet haftası Hacim+ olur; SP yasaksa hız önerilmez.
  - Takvimde aktif faz yoksa Form ve denge'de elle başlatılan döngü, o da yoksa Hacim geçerlidir.
  - Ekranda "Aerobik taban (F1) · 3. hafta · Hacim+" gibi görünür.
- Döngü haftaları:
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
  - **Ayrı sayım yoksa** (eski davranış): toplam 3 gün; salon, Salı–Perşembe arasında yüzmeye bitişik olmayan bir güne konur.
  - **Ayrı sayım varsa** (kisit `gun_hafta_yuzme` 3, `gun_hafta_salon` 2, `salon_dk` 50, `salon_rpe` 5):
    - Yüzme Cuma, Salı ve Perşembe'dir (gerekirse Çarşamba).
    - Salon yüzme olmayan günlere konur; yüzmeye bitişik olmayan gün tercih edilir.
    - Ana sayfada iki halka görünür: yüzme gün ve salon gün.
  - Programdaki yüzme süresi son idmanlardaki gerçek/plan oranıyla tahmin edilir. Sabah bütçesini (80 dk) aşarsa uyarı çıkar.
  - Hazır olma "dinlen" derse bugüne öneri gelmez.
- **Tabloya yazım:**
  - Önerilen salon günü, onayla idman `salonPlan` sayfasına yazılır.
  - Yüzme önerisi tabloya **yazılmaz**; yüzme programını sen yazarsın, ben havuzPlan'a koyarım.

---

## 6. Salon programı nasıl yazılır (idman!salonPlan)

Sütunlar: `Tarih, Sıra, Hareket, Set, Tekrar, Ağırlık, Süre, Dinlen, Süperset, Not, Durum`

| Sütun | Ne yazılır |
|---|---|
| Hareket | idmanRef `salonHar` sayfasındaki **Exercise adıyla birebir** (ör. `Band Bent Over Row`). Katalogda olmayan ad kas haritasında ve formülde sayılmaz |
| Set, Tekrar | Sayı. Süreli hareketlerde (plank vb.) Tekrar `1` |
| Ağırlık | kg (sayı) ya da `Vücut` |
| Süre | Süreli hareketlerde saniye (ör. `45`); diğerlerinde boş |
| Dinlen | Saniye (ör. `90`) |
| Süperset | Aynı harf → süperset (ör. iki satıra `A`) |
| Durum | **Boş bırak**. Kullanılmıyor: idman bitince günün satırları silinir (13.2.1) |

Kurallar:
- Kısıta takılan hareketleri (squat > 90°, zıplama, koşu) uygulama gizler ve varsa güvenli alternatifi önerir. Ben de önermeyeyim.
- Her salon gününün başında 15–20 dk omuz önleyici + core olsun (dış rotasyon, Y kaldırış, ters fly, Pallof press, dead bug).
- Ana sayfada "bugünün programı" bu sayfadan gelir. "İdmana başla" programdaki değerlerle açılır.

---

## 7. Bu oturumdan beklediğim çıktı biçimi

Program önerirken:
1. **Yüzme:** havuzPlan sayfasına yapıştırılabilir tablo. Sütunlar: Tarih, Sıra, Blok, Tekrar, Mesafe, Stil, Tür, Açıklama, Hedef, Dinlen, Alet.
   - Mesafe yalnız sayı; Hedef ve Dinlen tek değer, `00:01:30` biçiminde.
   - Karışık tekrarlar Açıklama'da.
   - Bloklar doğru (MS/AS aerobik).
   - Toplam süreyi tekrar × (hedef + dinlen) ile hesapla ve günün süre bütçesine (80 / 65 dk / Cuma sınırsız) sığdır. Geçişler için +5–8 dk pay bırak.
2. **Salon:** `salonPlan` sayfasına yapıştırılabilir tablo. H'deki hareket adları kullanılsın; Ağırlık sayı ya da `Vücut`.
3. **Kısıt kontrolleri:**
   - BR ≤ %10 / ay.
   - MS/AS sonrası omuz rahatlatma.
   - Kuvvet salonu ile uzun/eşik yüzme art arda olmasın.
   - Haftada 3 yüzme günü; salon ayrı.
4. **Faz:** Bu hafta ekranındaki faz ve döngü haftasına göre kur (ör. F1 · Hacim+). Fazın yasakladığı işi (SP, salon kuvveti) koyma.
5. **Yorum:** Verdiğim `havuzVeri`/`havuzSeans`/`salonVeri` satırlarını yukarıdaki anlamlarıyla oku.
   - Gerçek = ortalama tekrar süresi.
   - Kulaç /25 m.
   - Tekrar ortalama, ayrıntı Açıklama'da.

---

## 8. Bilinen sınırlar (sürüm 13.2.0)

- **MSI:** Uygulamada 1 ve 1,5 tek eylem: "hafiflet". "1,5 → ana set yarıya" kuralı uygulamada yok.
- **Seans süresi:** Seans süresi molalar hariç ölçülür (ilk YÜZ'den bitişe).
- **Mesafe:** Mesafe sütununa metin yazılamaz.
- **Ölçüm:**
  - Karşı duvarda biten tekrar ölçülemez (yukarıda; "çift ölçüm" iş listesinde).
  - Tekrar içinde ara süre yok: tekrar tek süre olarak ölçülür.
- **13.2 ile gelen (betikler dağıtılınca):** süreler saat haneli yazılır (planlanan `[h]:mm:ss`, ölçülen `[h]:mm:ss.0`);
  havuzVeri/salonVeri'de tablonun hesapladığı sütunlara (Sıra, Set Mesafe, Set Süre, Hafta …) değer yazılmaz, üst
  satırdaki formül yeni satırlara kopyalanır.
- **Tablo formülleri** (senin tarafında): Hafta → "Sezon Hafta"; Hedef Zone formülü Kick/Drill/Test setlerine bölge yazmamalı.
- Garmin/saat verisi yok.
