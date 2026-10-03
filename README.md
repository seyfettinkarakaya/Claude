# YüzmeSK — Sürüm 11

Havuz kenarında ve salonda kullanılan, tek kullanıcılı idman uygulaması.
Program Google E-Tablolar'daki **YuzmeProgram** dosyasında hazırlanır; uygulama onu
büyük puntoyla gösterir, seans bitince yapılan setleri `eski` sayfasına yazar, seans
özetini `seans` sayfasına yazar ve günün Plan satırlarını `arsiv` sayfasına taşır.
Biten seansın bir kopyası telefonda da kalır (**Yapılmış idmanlar**).
Salon idmanı **SalonTakip** dosyasıyla çalışır (plan telefonda yapılır, yapılan hareketler
`idman` sayfasına yazılır); CSS, tempo bölgeleri ve RPE/MSI açıklamaları **sporRef**
dosyasından okunur.

- Ön yüz: tek sayfalık PWA (vanilla HTML/CSS/JS, derleme adımı yok), GitHub Pages'te barındırılır.
- Arka uç: üç dosyanın her birine bağlı ayrı Google Apps Script web uygulaması
  (`Code.gs`, `Salon.gs`, `SporRef.gs`). Hepsi `@OnlyCurrentDoc`: her betik **yalnızca kendi
  dosyasını** görür; Drive'daki diğer dosyalara erişim izni istenmez. Üç ayrı adres ve anahtar.

## Dosyalar

| Dosya | Görev |
|---|---|
| `index.html` | Ekranların iskeleti |
| `style.css` | Koyu, yüksek kontrastlı havuz kenarı tasarımı |
| `app.js` | Arayüz: ekranlar, program ve zamanlama, seans sonu |
| `zaman.js` | Saf zamanlama modülü: dokunuş olaylarından tekrar/dinlenme süreleri (bkz. `ZAMANLAMA.md`) |
| `duzen.js` | İdman anında yüzme planı düzenleme (değiştir/ekle/sil, plan farkı notu) |
| `salon.js` | Salon: olaylardan set/dinlenme durumu, tabloya giden satırlar, planlama puanı, ilerleme önerisi |
| `ref.js` | sporRef hesapları: güne/havuza/alete göre CSS, tempo bölgeleri, RPE/MSI açıklamaları |
| `wheel.js` | Tekerlek (wheel) gezinme bileşeni: sürükleme, atalet, oturma |
| `data.js` | **Tek veri erişim modülü**: Apps Script çağrıları, yerel önbellek, gönderim kuyruğu |
| `manifest.json`, `icons/` | PWA tanımı ve simgeler (192, 512, apple-touch-icon) |
| `fonts/` | Archivo ve Barlow Condensed (SIL Open Font License); dışarıdan yazı tipi yüklenmez |
| `Code.gs` | YuzmeProgram betiği (`getDates`, `getPlan`, `finishSession`) |
| `Salon.gs` | SalonTakip betiği (`getSalon`, `saveSalon`) |
| `SporRef.gs` | sporRef betiği, salt okuma (`getRef`) |
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

## 2b. Salon ve sporRef betikleri (isteğe bağlı)

Her dosyaya **kendi** betiği kurulur; adımlar yukarıdakiyle aynıdır (Uzantılar → Apps Script →
dosyayı yapıştır → `tokenUret` → Dağıt → Web uygulaması, *Ben* / *Herkes*). Her betiğin
anahtarı ayrıdır. Adresler ve anahtarlar telefonda **Ayarlar → Bağlantılar**'a girilir;
salon ve sporRef boş bırakılırsa o bölüm kapalı kalır.

| Dosya | Betik | Okur | Yazar |
|---|---|---|---|
| YuzmeProgram | `Code.gs` | Plan | eski, seans, arsiv |
| SalonTakip | `Salon.gs` | H, hkEtki, ref, idman | idman (en üste) |
| sporRef | `SporRef.gs` | zone, css, alet, bilgi, RPE, MSI, fazBilgi | — |

**SalonTakip** (`Salon.gs`):
- `idman`: A–J sırası değişmez — `Tarih, No, Hareket, Set, Tekrar, Ağırlık, Nabız, RPE, MSI, Açıklama`
  (`v2` formülü bu sütunları sırasıyla okur). Hareket süresi **K** sütununa (`Süre`) yazılır;
  başlık yoksa ilk kayıtta açılır (K başka başlıkla doluysa hata verir, hiçbir şey yazılmaz).
- Yazma kuralları: Tarih gerçek tarih, sayılar sayı, vücut ağırlığı tam olarak `Vücut`;
  **Tekrar** setlerin ortalaması (ör. 9,67), set ayrıntısı **Açıklama**'da (`Setler: 11-9-9`).
  Aynı gün ikinci kez yazılmaz (`DUPLICATE`).
- `H`: `Exercise, Goal Tag, Equipment, BW Coefficient, Swim Transfer Coefficient, …`;
  isteğe bağlı **Video** sütunu `H!A:E`'den sonra (yalnızca youtube.com / youtu.be adresleri gösterilir).
- `hkEtki`: `Exercise, Muscle Group, Muscle, Kinetic Chain, Yük Etki Oranı`.

**sporRef** (`SporRef.gs`, salt okuma):
- `zone` (`Zone, Alt Sınır, Üst Sınır, Tür, Türkçe Adı`): PACE satırları CSS'e eklenen sn/100 m
  sınırları (alt ≤ fark < üst; `−19` gibi Unicode eksi kabul edilir).
- `css` (`Tarih_ilk, Tarih_son, CSS (sn), Alet, Havuz`): idman gününe, havuza ve alete göre seçilir;
  alet adları `alet` sayfasındaki kod/ad ile eşlenir (`PB` = `Pullbuoy`). Günü kapsayan satır yoksa
  en son değer kullanılır ve Ayarlar'da "CSS güncel değil" yazar. sporRef bağlı değilse CSS Ayarlar'dan elle girilir.
- `RPE`, `MSI`: başlıksız tek sütun (`7–8 — Zor, …`); salon girişinde ve Ayarlar'da açıklama olarak gösterilir.

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

**Ana sayfa.** Her bölüm kendi renginde bir kart: **Yüzme** turkuaz, **Salon** amber
(SalonTakip bağlı değilse "Kurulmadı" → Ayarlar). Yüzme kartında takvimdeki ilk planlı idmanın tarihi (*Bugün · Çarşamba
23 Eylül*), günün blok renkli hattı ve set · mesafe · süre · ana set; altında iki düğme:
**İdmanı aç** o idmana doğrudan girer, **Takvim** hafta takvimini açar. Devam eden seans varsa
düğme **Seansa devam et** olur; planlı idman yoksa yalnız Takvim görünür. Altta **Yapılmış
idmanlar**, üstte ⚙︎ Ayarlar. Devam eden bir seans varsa uygulama doğrudan seansa açılır.
Takvim ve ana sayfa idman ekranıyla aynı nötr koyu tonlardadır; turkuaz yalnızca vurgudur.

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
o sete kadar tekrar × (hedef + dinlen) toplamı. Üstte büyük yazıyla solda **Süre** (geçen / toplam hedef), sağda **Mesafe** (yüzülen / toplam); altında her set için blok renginde,
mesafesine oranlı bir ilerleme çubuğu. Program ekranı açıkken ekran sönmez (Screen Wake
Lock; desteklenmiyorsa sessizce devam eder). Kartın altında hedefin **100 m temposu**
(ör. `Tempo 1:35/100 · Z3`) bölge renginde görünür.

**Zamanlama (tek düğme).** Ayrı kronometre yoktur; ayrıntılı kurallar `ZAMANLAMA.md`'de.
- Alttaki büyük düğme **YÜZ → DUR → YÜZ → …** olur. İlk YÜZ idman saatini ve 1. tekrarı
  birlikte başlatır; son setin son DUR'u idmanı bitirir. Altındaki küçük yazı ne olacağını söyler
  ("7. tekrar başlar", "Son tekrar · set biter", "Son tekrar · idman biter"). Tekrar ve dinlenme
  süreleri yalnızca dokunuş zamanlarından hesaplanır; uygulama kapanıp açılsa da kaymaz.
- Yüzerken ve dinlenirken kartta set bilgisi (*Hedef · Dinlen · Alet* ve açıklamanın ilk satırı),
  tekrar durumu ve büyük saat: yüzerken yukarı sayar, dinlenirken plandaki dinlenmeden geri sayar,
  süre aşılınca eksiye kırmızı geçer. 4 ve altı tekrarda tekrar kutucukları; 5+ tekrarda tek satır
  şerit (yapılan yeşil, yüzülen sarı, dinlenilen mavi), **Tekrar 7/12**, ortalama ve son 3 süre.
- Setin son DUR'u seti bitirir ve kart sıradaki sete geçer. Bu **set sonu dinlenmesinde** sıradaki
  setin içeriği öne çıkar (stil · tür, açıklama, hedef, dinlen, alet, tempo); dinlenme sayacı kartın
  altında ince bir şerittir. Set sonu dinlenmesi biten sete yazılır.
- **Karta dokununca** (yüzerken de) setin tüm bilgisi büyük yazıyla açılır; dokununca kapanır.
- Dinlenmenin son 3 saniyesinde kısa bip, çıkış anında uzun bip; DUR'da onay sesi.
  Alt bardaki **Ses** düğmesi sesi açar/kapatır. iPhone sessiz moddaysa ses çıkmaz.
- Sol alt düğme: her basıştan sonra 5 saniye **Geri al**, sonra dinlenirken **⏸ Mola**.
  2 saniye içindeki ikinci dokunuş yok sayılır. Yüzerken setler kaydırılamaz ve ‹ çalışmaz.
- **Mola** (tuvalet arası vb.): yalnızca dinlenirken, sol alt düğmeden ya da ‹ → *Mola ver*.
  Mola ekranında idman saati, dinlenme sayacı ve bipler durur; yalnızca **DEVAM ET** molayı
  bitirir. Mola süresi idman süresinden ve dinlenme ölçümünden düşülür; özette "Mola 4:30"
  hazır ifadesi çıkar (işaretlenirse açıklamaya yazılır).
- **Seti erken bitirmek:** dinlenirken başka sete kaydırın; kart hangi setin kaç tekrarla
  kapanacağını yazar, YÜZ'e basınca önceki set n/N olarak kapanır. Geri kaydırmak vazgeçer.
- **İdmanı erken bitirmek:** ‹ → *İdmanı bitir ve kaydet* / *Devam et* / *Takvime dön (idman sürer)*.
- **Seti sıfırla:** tamamlanan sette düğme *SET TAMAM* olur; dokununca onay sorulur, onaylanırsa
  o setin tekrarları silinir ve set yeniden yapılabilir (diğer setler etkilenmez).
- Kayıttan sonra *Kaydedildi* ekranından geri dönünce takvim bugün seçili açılır.

**Tempo ve CSS bölgeleri.** sporRef bağlıysa CSS idman gününe, havuza (son seansın havuzu)
ve alete göre `css` sayfasından, bölgeler `zone` sayfasından gelir: REC · EN1 · EN2 · EN3 ·
SP1 · SP2 · SP3 (yavaştan hızlıya, her biri kendi renginde). Bağlı değilse Ayarlar'daki elle
girilen CSS (varsayılan 1:57) ve aynı 7 bölgenin varsayılan sınırları kullanılır. Drill/Kick
setlerinde ve CSS'i tanımlı olmayan aletle yüzülen setlerde tempo gösterilir, bölge verilmez.

**İdman anında düzenleme.** Karta dokununca açılan panelde **Düzenle · Sonrasına ekle · Sil**
(yüzerken sönük). Düzenle: ± tekrar/mesafe/hedef/dinlen, stil/tür/alet/blok seçenekleri, açıklama.
Biten set düzenlenmez, başlanan set silinmez, tekrar yapılandan aşağı inmez; başlanmış sette mesafe
ya da stil değişirse yapılan tekrarlar eski haliyle kalır, kalanlar yeni set olur. Dinlenirken
kartta **＋1 tekrar**. Silme ve +1 tekrarda 5 sn **Geri al**. Tabloya özgün setlerde değişen alanlar,
eklenen setlerde tüm alanlar yazılır; **Not**'a plan farkı düşülür (`Plan: 4×100 → 6×100, Hedef
1:30 → 1:25`, `idmanda eklendi`). `eski` sayfasında **Sıra, Set Mesafe, Set Süre** boş bırakılır
(tablo kendisi doldurur); `arsiv`'e planın özgün hali gider.

**Metin boyu.** Kart açıklaması başlık ile kutular arasındaki sabit alanı doldurur: kısa metin
büyür, uzun metin küçülür; alt sınırda da sığmazsa son satır "…" ile biter (tamamı ayrıntı
panelinde). Tek satırlık bilgiler kesilmek yerine küçülür.

**Salon.** Ana sayfadaki salon kartı → **Son idmanı tekrarla** (son günün hareketleri, son yapılan
değerlerle) ya da **Yeni idman planla**:
1. *Hedef*: kas grubu dağılımı (çubuk son 4 hafta, çizgi tüm zaman); öncelik için dokun
   (öncelik → ×2 → kapalı). Amaç, yüzmeye etki (aktarım katsayısı) ve ekipman süzgeçleri.
2. *Hareket seç*: puan = Σ(öncelik × `hkEtki` oranı) × yüzme aktarım katsayısı, 0–100.
   Son iki idmanda MSI ≥ 1,5 olan hareketin puanı yarıya iner ve ⚠ alır (gizlenmez). ▶ video YouTube'da açılır.
3. *Plan*: sıra (↑ ↓), son yapılan değerler + öneri (son seferde RPE ≤ 8 ve MSI ≤ 0,5 → +2,5 kg ya da
   +1 tekrar; RPE ≥ 9,5 ya da MSI ≥ 1,5 → aynı ⚠), süre tahmini set × (tekrar × 3 sn + 60 sn). Plan yalnızca telefonda.

İdmanda büyük düğme **BAŞLA / BİTTİ**; set tekrarı kartta ± ile düzeltilir; dinlenme sayacı, bipler,
mola, Geri al, dinlenirken **＋1 set**. Süreli hareketler (Plank vb.) geri sayar ve kendiliğinden biter.
Hareketin son setinden sonra **nabız** (± geçen değerle hazır), **RPE** 6–10, **MSI** (sporRef açıklamasıyla)
ve **not** girilir. Kart paneli: Düzenle · **Değiştir** (aynı kas grubundan puanlı liste) · Sonrasına ekle · Sil.
Bitince özet → **Kaydet**; bağlantı yoksa kuyruğa alınır ve bağlantı gelince gönderilir.

**Seans sonu.** Üç kısa adım:
1. **RPE** — 0–10 arası tek dokunuş (5 sn içinde *İdmana dön* ile son adım geri alınır).
2. **MSI** — *Ağrı yok* ya da vücut şemasında bölgeye dokundukça 0,5 → 1 → 1,5 → 2 → 3 → boş.
   Dokunulmayan bölge kaydedilmez; MSI seans sayfasına `sag omuz 1; bel 0.5` biçiminde yazılır.
3. **Özet ve kaydet** — süre (ilk YÜZ → bitiş, molalar hariç) ve mesafe (yapılan tekrarlar × mesafe)
   otomatik; havuz 25/50 (son seçim hatırlanır); hazır ifadeler ve açıklama. Her set için
   ortalama tekrar süresi **Gerçek**'e gider. Nota yazılabilecek satırlar (tekrar süreleri,
   plandan belirgin sapan dinlenmeler, eksik tekrar) işaret kutusuyla gösterilir; yalnızca
   işaretlenenler **Not**'a yazılır. Ortancadan çok sapan (unutulmuş dokunuş) tekrar
   işaretlenir; düzeltilebilir veya ortalamadan çıkarılabilir.

**Çevrimdışı ve kurtarma.**
- Seçilen günün programı ve devam eden seansın tüm durumu (dokunuş olayları, seans sonu
  girişleri) her değişiklikte cihazda saklanır; uygulama kapanırsa kaldığı yerden açılır.
  Sürüm 9 ve öncesinden kalan seans yeni modele taşınır (işaretli setler ve turlar korunur).
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
`Code.gs`'e yeni `action` olarak eklenir. Seans durumu bir olay listesidir
(`basla`, `cik`, `geldim`, `bitir` + zaman damgası); tüm süreler `zaman.js` ile bu listeden
hesaplanır. Garmin verisi aynı set alanlarını (Gerçek, Kulaç, Nabız, Not) doldurabilir.

## Testler

```sh
sh tests/run-all.sh           # hepsi
node tests/test-gas.cjs       # Code.gs ana akış (sahte SpreadsheetApp, bağımlılık yok)
node tests/test-gas-edge.cjs  # Code.gs uç durumlar: kimlik, başlıklar, tarih/süre biçimleri, geri alma, kilit, arsiv
node tests/test-gas-salon.cjs # Salon.gs ve SporRef.gs: okuma, idman'a yazma (A–J + K Süre), DUPLICATE, geri alma
node tests/test-data.mjs      # data.js: 3 bağlantı, önbellek, kuyruk (yüzme + salon), geçmiş, hata kodları
node tests/test-ref.mjs       # ref.js: CSS seçimi (gün/havuz/alet), 7 bölge, RPE/MSI açıklaması
node tests/test-duzen.mjs     # duzen.js: ekle/sil, olay kaydırma, plan farkı notu, kısıtlar
node tests/test-salon.mjs     # salon.js: set/dinlenme durumu, tabloya giden satırlar, puan, öneri
node tests/test-zaman.mjs     # zaman.js: olaylardan süreler, düğme sırası, bip, şüpheli tekrar
node tests/e2e-senaryolar.cjs [filtre]  # 50+ uçtan uca senaryo (Playwright + Chromium)
node tests/test-e2e.cjs       # baştan sona tam akış
```

Uçtan uca testler için Playwright gerekir (global kuruluysa `NODE_PATH=$(npm root -g)`).
Senaryolar: tam idman (otomatik set geçişi, son DUR'la bitiş), tek basışla başlangıç, 12 tekrarlı
set şeridi, set sonu kartı, ayrıntı paneli, mola, dinlenme sayacı ve bipler,
ses düğmesi, çift dokunma ve geri al, yüzerken kaydırma/‹ kilidi, seti ve idmanı erken bitirme,
şüpheli tekrar düzeltme, dinlenme notu onayı, RPE/MSI/havuz, yeniden açılışta devam, Sürüm 9
seansının taşınması, hızlı açılış ve arka plan yenileme, eski Code.gs uyumu, çevrimdışı,
geçersiz anahtar, kalıcı/geçici sunucu hataları, DUPLICATE, gizli hata ayrıntısı, gün değiştirme,
40 setlik program, kuyruk ve geçmiş yönetimi, ayarlar, kurulum (3 bağlantı), sporRef CSS/bölge,
idman anında düzenleme ve kısıtları, metin boyu, salon (tekrarla, planla, BAŞLA/BİTTİ, giriş, özet,
kuyruk, Değiştir/Sil, süreli hareket), 320–430 px ekranlarda taşma.
