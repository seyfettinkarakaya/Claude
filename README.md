# YüzmeSK — Faz 1

Havuz kenarında kullanılan, tek kullanıcılı idman programı uygulaması.
Program Google E-Tablolar'daki **YuzmeProgram** dosyasında hazırlanır; uygulama onu
büyük puntoyla gösterir, seans bitince yapılan setleri `eski` sayfasına yazar, seans
özetini `seans` sayfasına yazar ve günün Plan satırlarını `arsiv` sayfasına taşır.
Biten seansın bir kopyası telefonda da kalır (**Yapılmış idmanlar**).

- Ön yüz: tek sayfalık PWA (vanilla HTML/CSS/JS, derleme adımı yok), GitHub Pages'te barındırılır.
- Arka uç: `Code.gs`, tabloya bağlı Google Apps Script web uygulaması.

## Dosyalar

| Dosya | Görev |
|---|---|
| `index.html` | Ekranların iskeleti |
| `style.css` | Koyu, yüksek kontrastlı havuz kenarı tasarımı |
| `app.js` | Arayüz: ekranlar, program, kronometre, form |
| `wheel.js` | Tekerlek (wheel) gezinme bileşeni: sürükleme, atalet, oturma |
| `data.js` | **Tek veri erişim modülü**: Apps Script çağrıları, yerel önbellek, gönderim kuyruğu |
| `manifest.json`, `icons/` | PWA tanımı ve simgeler (192, 512, apple-touch-icon) |
| `fonts/` | Archivo ve Barlow Condensed (SIL Open Font License); dışarıdan yazı tipi yüklenmez |
| `Code.gs` | Apps Script arka ucu (`getDates`, `getPlan`, `finishSession`) |
| `tests/` | Arka uç ve uçtan uca testler (bkz. en alt) |

---

## 1. Tabloyu hazırlama

`YuzmeProgram` dosyasında üç sayfa bulunmalı; başlıklar **1. satırda**:

- **Plan**: `Tarih, Sıra, Blok, Tekrar, Mesafe, Stil, Tür, Açıklama, Hedef, Dinlen, Alet, Gerçek, Kulaç, Nabız, RPE, MSI, Not`
  (yanında Yığımlı Mesafe, Hedef Zone gibi türetilmiş sütunlar da olabilir; uygulama onları okumaz, yazmaz.)
- **eski**: Plan'daki 17 sütunla aynı başlıklar.
- **seans**: `Tarih, Süre, Mesafe, Havuz, RPE, MSI, Açıklama`
- **arsiv** (isteğe bağlı): yoksa ilk seansta Plan'ın başlıklarıyla otomatik oluşturulur.

Script sütunları **başlık adına göre** bulur; sütun sırası önemli değildir ve yeni sütun
eklemek bir şeyi bozmaz. Karşılaştırma büyük/küçük harf, baştaki/sondaki boşluk ve
Türkçe karakter farklarını yok sayar (`Sıra` = `sira`).

Notlar:
- `Tarih` hücreleri tarih biçiminde olmalı (`gg.aa.yyyy` metni de kabul edilir).
- `Hedef` / `Dinlen` süre biçiminde (ör. `[mm]:ss`) veya `04:45` gibi metin olabilir.
- Aynı tarihte her set benzersiz bir `Sıra` değerine sahip olmalı.

## 2. Apps Script'i kurma ve yayınlama

1. Tabloyu açın → **Uzantılar → Apps Script**.
2. Varsayılan `Code.gs` içeriğini silin, bu depodaki `Code.gs`'i yapıştırıp kaydedin.
3. **Token üretme:** Üstteki fonksiyon listesinden `tokenUret`'i seçip **Çalıştır**'a basın.
   İlk seferde Google yetki ister; onaylayın. Betik `@OnlyCurrentDoc` ile işaretlidir:
   yalnızca bu tabloya erişim ister, Drive'daki diğer dosyalara erişemez. **Yürütme günlüğü**'nde
   `Yeni token: …` satırı çıkar; bu değeri kopyalayın. Token, *Proje Ayarları →
   Script Properties* altında `TOKEN` adıyla saklanır. (Daha sonra görmek için
   `tokenGoster`'i çalıştırın; değiştirmek için `tokenUret`'i tekrar çalıştırın ve
   telefondaki ayarı güncelleyin.)
4. **Dağıt → Yeni dağıtım** → tür: **Web uygulaması**.
   - *Şu kullanıcı olarak yürüt:* **Ben**
   - *Erişimi olan:* **Herkes**
5. **Dağıt**'a basın ve verilen `https://script.google.com/macros/s/…/exec` adresini kopyalayın.

`Code.gs`'i güncellediğinizde **Dağıt → Dağıtımları yönet → (kalem) → Sürüm: Yeni sürüm**
ile yayınlayın; böylece adres değişmez. İzin kapsamı değiştiyse (ör. `@OnlyCurrentDoc`
eklendiğinde) düzenleyicide bir fonksiyonu (`tokenGoster`) bir kez çalıştırıp yeni izni onaylayın.

### Anahtarı (token) yenileme

Anahtar başkasının eline geçtiyse (ekran görüntüsü, mesaj, kaybolan telefon) ya da
yalnızca önlem olarak:

1. Apps Script düzenleyicisinde `tokenUret`'i çalıştırın. Yeni anahtar üretilir ve
   **eski anahtar o anda geçersiz olur**; eski anahtarla gelen istekler `AUTH` hatası alır.
2. Yürütme günlüğündeki `Yeni token: …` değerini kopyalayın (sonradan `tokenGoster`).
3. Telefonda **Ana sayfa → ⚙︎ Ayarlar**'da anahtar alanına yapıştırıp **Kaydet ve bağlan**.

Yeniden dağıtım gerekmez; adres aynı kalır. Telefonu değiştirirken veya birine verirken
**Ayarlar → Anahtarı unut** adres ve anahtarı telefondan siler (yapılmış idmanlar ve
gönderilmeyi bekleyen kayıtlar kalır).

Hızlı kontrol: `/exec` adresini tarayıcıda açınca `{"ok":true,…}` görmelisiniz.

## 3. GitHub Pages'e koyma

1. Bu depoyu GitHub'a gönderin (ücretsiz planda Pages için depo **herkese açık** olmalı).
2. Depo → **Settings → Pages** → *Source:* **Deploy from a branch** →
   dal: `main`, klasör: `/ (root)` → **Save**.
3. Birkaç dakika sonra adres `https://<kullanıcı>.github.io/<depo>/` olarak yayına girer
   (HTTPS; Wake Lock ve PWA için gerekli).

Token ve Apps Script adresi koda **gömülmez**: ilk açılışta uygulama bunları sorar ve
yalnızca o cihazın `localStorage`'ında saklar. Bu yüzden depo herkese açık olabilir.
Ayarlar ana sayfadaki ⚙︎ düğmesinden sonradan değiştirilebilir.

Güvenlik: sayfa bir Content-Security-Policy taşır; yalnızca kendi dosyalarını yükler ve
yalnızca `script.google.com` / `script.googleusercontent.com` adreslerine bağlanır.
Bu yüzden Ayarlar'a yalnızca `https://script.google.com/macros/s/…/exec` biçimindeki adres
kabul edilir. Sunucudaki beklenmeyen hataların ayrıntısı telefona gönderilmez; telefonda
kısa bir başvuru numarası görünür, ayrıntı Apps Script **Yürütmeler** günlüğündedir.

## 4. iPhone'da ana ekrana ekleme

1. iPhone'da **Safari** ile Pages adresini açın (başka tarayıcıdan eklenen kısayol adres çubuğuyla açılabilir).
2. Alttaki **Paylaş** düğmesine (yukarı ok olan kare) dokunun.
3. Listeyi kaydırıp **Ana Ekrana Ekle**'yi seçin; ad **YüzmeSK** olarak gelir → **Ekle**.
4. Ana ekrandaki YüzmeSK simgesiyle açın: adres çubuğu olmadan tam ekran açılır.
5. İlk açılışta Apps Script adresini ve token'ı yapıştırıp **Kaydet ve bağlan**'a basın.

> Ana ekrandaki uygulamanın `localStorage`'ı Safari sekmesinden ayrıdır; ayarları
> ana ekran simgesinden açtıktan sonra girin.

---

## Kullanım

**Ana sayfa.** İki büyük düğme: **Yüzme** (sıradaki idmanın kısa bilgisiyle; hafta
takvimini açar, devam eden seans varsa seansa döner) ve **Salon** (şimdilik pasif,
"Yakında"). Altta **Yapılmış idmanlar**, üstte ⚙︎ Ayarlar. Devam eden bir seans varsa
uygulama doğrudan seansa açılır.

**Gün seçimi (hafta takvimi).** Üstte haftanın 7 günü; idman olan günlerde nokta var,
bugün çerçeveli. Şeridi sağa/sola kaydırınca önceki/sonraki haftaya geçilir; başka
haftadayken **Bugün** düğmesi geri getirir. Bir güne ya da alttaki gün satırlarına dokunmak
yalnızca **seçer**: seçili günün kartında tarih, günün blok renkli hat önizlemesi, set,
mesafe, ana set ve hedef süre görünür. İdmana yalnızca alttaki **"… idmanını aç"**
düğmesiyle girilir. Açılışta bugün (plan yoksa en yakın planlı gün) seçilidir. Seçili
olmayan günlerin çubukları gri tonlardadır (ana set en açık, ısınma/soğuma en koyu).
Sol üstteki ‹ ana sayfaya döner.

**Program açılışı.** Tarih listesi her günün tüm setlerini de getirir ve telefonda saklanır;
"… idmanını aç" programı beklemeden açar. Tablodaki güncel hali arka planda kontrol edilir:
program değişmişse ve seansa henüz başlanmadıysa yenisiyle değiştirilir ("Program tablodan
güncellendi"), başlandıysa seans boyunca eldeki program korunur. (Eski Code.gs ile yaklaşan
ilk üç günün programı arka planda indirilir.)

**Program (metro hattı).** Setler bir metro hattının durakları gibi dizilir; hat her
bloğun renginde. Aktif durak "peron"da büyük bir kart olarak açılır (Tekrar × Mesafe,
Stil · Tür, açıklama, Hedef, Dinlen, Alet ve set / yığımlı mesafe); üstünde ve altında
ikişer durak görünür. Yukarı/aşağı kaydırdıkça hat akar ve bir sonraki durak perona gelir;
kaydırma bilerek "ağır"dır (bir durak için ~170 px, fırlatma en fazla bir durak); bırakınca en yakın durağa oturur. Hattın solundaki süreler yığımlı hedef süredir:
o sete kadar tekrar × (hedef + dinlen) toplamı. Üstte solda **Süre** (geçen / toplam hedef), sağda **Mesafe** (yapılan / toplam); altında her set için blok renginde,
mesafesine oranlı bir ilerleme çubuğu. Alttaki bar: **Kronometre** · **Seti Tamamla**
(işaretli sette **İşareti Kaldır**) · **Başla** / **Bitir**. Program ekranı açıkken ekran
sönmez (Screen Wake Lock; desteklenmiyorsa sessizce devam eder). Kartın altında hedefin
**100 m temposu** (ör. `Tempo 1:35/100 · Z3`) bölge renginde görünür.

**Su kilidi.** Program ekranında sağ üstteki, kronometrede üstteki 🔒 düğmesi ekranı
kilitler: ekranın tamamı saydam bir katmanla örtülür, hiçbir dokunma (TUR, göstergeye
dokunma, kaydırma dahil) işlenmez; kronometre çalışmaya devam eder. Açmak için şeridi
1 saniye basılı tutun.

**Kronometre.**
- Süre göstergesi ekranın %70'ini kaplar; yüzerken bir bakışta okunur.
- Altında hedef çubuğu ve üç değer: **Hedefe** kalan (dururken son turun hedefe **Fark**ı),
  **Çıkışa** kalan (hedef + dinlen aralığıyla bir sonraki tekrarın başlamasına kalan süre)
  ve **Son tur**. Hedefin altı yeşil, üstü kırmızı.
- Büyük sarı düğme (ve çalışırken göstergenin kendisi): durmuşken **BAŞLAT**, çalışırken **TUR**.
- **Durdur** o ana kadarki süreyi de tur olarak kaydeder. Böylece:
  - aralıklı tekrarlar için *Başlat → Durdur, Başlat → Durdur…*
  - kesintisiz ara dereceler için *Başlat → Tur → Tur → Durdur*
  aynı tur listesini üretir.
- **Kaydet** alttan bir panel açar: set (aktif set seçili, *Değiştir* ile başka set),
  turlar (hedeften hızlı olanlar yeşil), ortalama ve iki seçenek:
  *Ortalama → Gerçek* veya *Ortalama + turlar → Not*. Tek turda ikinci seçenek çıkmaz.
  Süreli kaydedilen set tamamlandı olarak işaretlenir (programda kaldırılabilir).
- Gerçek değeri `dd:ss.d` (ör. `01:23.4`) olarak gider ve süre biçiminde yazılır.
- **Son tur**un altında o turun 100 m temposu ve bölgesi görünür.
- **Çıkış sesi:** çıkışa son 3 saniyede kısa bip, çıkış anında uzun bip (her tekrar için
  bir kez). Ayarlar'dan kapatılabilir, **Sesi dene** ile denenebilir. iPhone sessiz
  moddaysa veya uygulama arka plandaysa ses çıkmaz.

**Tempo ve CSS bölgeleri.** Ayarlar'da CSS (kritik yüzme hızı, 100 m için `dd:ss`,
varsayılan 1:57) girilir. Bölgeler 100 m temposunun CSS'ten farkına göredir:
Z1 Toparlanma ≥ CSS+15 sn · Z2 Aerobik +8…+15 · Z3 Tempo +3…+8 · Z4 Eşik (CSS) −2…+3 ·
Z5 Hız < CSS−2. Ekipmanlı setlerde (Alet dolu ya da Tür Pull/Drill/Kick) tempo gösterilir
ama bölge rengi verilmez: ekipmanlı tempo ekipmansız bölgelerle karşılaştırılmaz.

**Seans sonu.** Süre (Başla→Bitir) ve mesafe (tamamlanan setlerin toplamı) otomatik gelir,
elle düzeltilebilir. Havuz 25/50, RPE 0–10. MSI isteğe bağlıdır: dokunulmayan bölge
kaydedilmez (boş ≠ 0); seçili değere tekrar dokunmak seçimi kaldırır. MSI, seans sayfasına
`sag omuz 1; bel 0.5` biçiminde yazılır.

**Çevrimdışı ve kurtarma.**
- Seçilen günün programı ve devam eden seansın tüm durumu (başlangıç, işaretler,
  kronometre, form) her değişiklikte cihazda saklanır; uygulama kapanırsa kaldığı yerden açılır.
- Kayıt gönderilemezse (internet yok, sunucu meşgul) kuyruğa alınır; uygulama her
  açılışta, bağlantı geldiğinde ve öne getirildiğinde yeniden dener. Kuyruk gün seçimi
  ekranında görünür.

**Yapılmış idmanlar.** Biten her seans (tabloya gönderilen, kuyrukta bekleyen veya zaten
kayıtlı çıkan) telefonda saklanır ve **otomatik silinmez**. Ana sayfadaki *Yapılmış
idmanlar* listesinde tarih, set, mesafe, süre ve durum (*Tabloda*, *Kuyrukta*, *Zaten
kayıtlıydı*) görünür; bir kayda dokununca setler, Gerçek süreler ve notlar açılır. Kayıtlar
tek tek veya **Sil…** ile toplu (tabloya gidenler / tümü) silinir; silmeden önce onay
sorulur, gönderilmemiş kayıt için ayrıca uyarılır. Buradan silmek ne tabloyu ne de
gönderim kuyruğunu etkiler.

## Arka uç davranışı (`finishSession`)

1. `eski` (veya `seans`) sayfasında o tarih varsa **DUPLICATE** döner, hiçbir şey yazılmaz.
2. Tamamlanan setler, Plan'daki satırları kaynak alınarak **orijinal Sıra değerine göre**
   `eski`'ye eklenir; Gerçek/Kulaç/Nabız/RPE/MSI/Not uygulamadan gelen değerlerle dolar.
   Satırlar başlığın hemen altına (2. satırdan itibaren) eklenir, böylece en yeni seans
   en üstte durur; yeni satırlar mevcut ilk veri satırının biçimini alır.
3. Yazılan satır sayısı doğrulanır; tutmazsa **WRITE_MISMATCH**.
4. `seans` sayfasına tek satır eklenir (o da 2. satıra, en yeni en üstte).
5. Ancak 2–4 başarılıysa o tarihin **tüm** Plan satırları Sıra sırasıyla `arsiv`
   sayfasının en üstüne kopyalanır (sayfa yoksa oluşturulur) ve sayısı doğrulanır.
6. Arşiv doğrulanınca Plan satırları silinir.

2–4 arasında bir hata olursa bu çağrının eklediği satırlar geri alınır ve Plan'a
dokunulmaz. Arşivleme başarısız olursa seans yine kaydedilmiş sayılır ama Plan satırları
silinmez (cevapta `uyari`). Tüm yazma işlemleri `LockService` kilidi altında yapılır (30 sn bekler,
alamazsa **LOCKED**).

Hata kodları: `AUTH`, `LOCKED`, `DUPLICATE`, `NOT_FOUND`, `PLAN_MISMATCH`,
`WRITE_MISMATCH`, `MISSING_COLUMN`, `NO_SHEET`, `BAD_REQUEST`, `SERVER`.

## Mimari ve Faz 2

Arayüz (`app.js`) tabloya, `localStorage`'a veya kuyruğa doğrudan erişmez; hepsi `data.js`
üzerinden geçer. Faz 2'de Garmin/FIT gibi yeni kaynaklar `data.js`'e yeni fonksiyon,
`Code.gs`'e yeni `action` olarak eklenir. Set sonuçları seans durumunda
`results[sira] = { gercek, kulac, nabiz, rpe, msi, not }` olarak tutulur; Garmin verisi aynı
alanları doldurabilir.

## Testler

```sh
sh tests/run-all.sh           # hepsi
node tests/test-gas.cjs       # Code.gs ana akış (sahte SpreadsheetApp, bağımlılık yok)
node tests/test-gas-edge.cjs  # Code.gs uç durumlar: kimlik, başlıklar, tarih/süre biçimleri, geri alma, kilit, arsiv
node tests/test-data.mjs      # data.js: ayarlar, önbellek, kuyruk, geçmiş, hata kodları
node tests/e2e-senaryolar.cjs [filtre]  # 30+ uçtan uca senaryo (Playwright + Chromium)
node tests/test-e2e.cjs       # baştan sona tam akış
```

Uçtan uca testler için Playwright gerekir (global kuruluysa `NODE_PATH=$(npm root -g)`).
Senaryolar: su kilidi, hızlı açılış ve arka plan yenileme, eski Code.gs uyumu, çevrimdışı,
geçersiz anahtar, kalıcı/geçici sunucu hataları, DUPLICATE, gizli hata ayrıntısı, form
doğrulama ve çift gönderim, yeniden açılışta devam, tüm setleri tamamlama, gün değiştirme,
40 setlik program, kronometrenin ölçülen sete bağlı kalması, çıkış sesleri, kuyruk ve geçmiş
yönetimi, ayarlar, kurulum, 320–430 px ekranlarda taşma.
