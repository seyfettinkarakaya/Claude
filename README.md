# YüzmeSK — Faz 1

Havuz kenarında kullanılan, tek kullanıcılı idman programı uygulaması.
Program Google E-Tablolar'daki **YuzmeProgram** dosyasında hazırlanır; uygulama onu
büyük puntoyla gösterir, seans bitince yapılan setleri `eski` sayfasına taşır ve
seans özetini `seans` sayfasına yazar.

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
| `Code.gs` | Apps Script arka ucu (`getDates`, `getPlan`, `finishSession`) |
| `tests/` | Arka uç ve uçtan uca testler (bkz. en alt) |

---

## 1. Tabloyu hazırlama

`YuzmeProgram` dosyasında üç sayfa bulunmalı; başlıklar **1. satırda**:

- **Plan**: `Tarih, Sıra, Blok, Tekrar, Mesafe, Stil, Tür, Açıklama, Hedef, Dinlen, Alet, Gerçek, Kulaç, Nabız, RPE, MSI, Not`
  (yanında Yığımlı Mesafe, Hedef Zone gibi türetilmiş sütunlar da olabilir; uygulama onları okumaz, yazmaz.)
- **eski**: Plan'daki 17 sütunla aynı başlıklar.
- **seans**: `Tarih, Süre, Mesafe, Havuz, RPE, MSI, Açıklama`

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
   İlk seferde Google yetki ister; onaylayın. **Yürütme günlüğü**'nde
   `Yeni token: …` satırı çıkar; bu değeri kopyalayın. Token, *Proje Ayarları →
   Script Properties* altında `TOKEN` adıyla saklanır. (Daha sonra görmek için
   `tokenGoster`'i çalıştırın; değiştirmek için `tokenUret`'i tekrar çalıştırın ve
   telefondaki ayarı güncelleyin.)
4. **Dağıt → Yeni dağıtım** → tür: **Web uygulaması**.
   - *Şu kullanıcı olarak yürüt:* **Ben**
   - *Erişimi olan:* **Herkes**
5. **Dağıt**'a basın ve verilen `https://script.google.com/macros/s/…/exec` adresini kopyalayın.

`Code.gs`'i güncellediğinizde **Dağıt → Dağıtımları yönet → (kalem) → Sürüm: Yeni sürüm**
ile yayınlayın; böylece adres değişmez.

Hızlı kontrol: `/exec` adresini tarayıcıda açınca `{"ok":true,…}` görmelisiniz.

## 3. GitHub Pages'e koyma

1. Bu depoyu GitHub'a gönderin (ücretsiz planda Pages için depo **herkese açık** olmalı).
2. Depo → **Settings → Pages** → *Source:* **Deploy from a branch** →
   dal: `main`, klasör: `/ (root)` → **Save**.
3. Birkaç dakika sonra adres `https://<kullanıcı>.github.io/<depo>/` olarak yayına girer
   (HTTPS; Wake Lock ve PWA için gerekli).

Token ve Apps Script adresi koda **gömülmez**: ilk açılışta uygulama bunları sorar ve
yalnızca o cihazın `localStorage`'ında saklar. Bu yüzden depo herkese açık olabilir.
Ayarlar gün seçimi ekranındaki ⚙︎ düğmesinden sonradan değiştirilebilir.

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

**Gün seçimi.** Plan'daki tarihler kart olarak listelenir. Bugün varsa vurgulanır ve
alttaki **Bugünün idmanını aç** düğmesiyle tek dokunuşta açılır. Tek tarih varsa doğrudan
programa geçilir. Geçmiş tarihler "Geçmiş planlar" başlığı altında soluk görünür.

**Program.** Setler tekerlek gibi kayar; ortadaki set aktiftir. Başka bir sete kaydırın ya
da soluk görünen komşu sete dokunun. **Seti Tamamla** aktif seti işaretler ve sıradaki
işaretsiz sete geçer; işaretli sette düğme **İşareti Kaldır** olur. Sıra serbesttir.
**İdmana Başla** süreyi başlatır, ardından düğme **İdmanı Bitir** olur. Program ekranı
açıkken ekran sönmez (Screen Wake Lock; desteklenmiyorsa sessizce devam eder).

**Kronometre.**
- Büyük alt alan (ve çalışırken süre göstergesinin kendisi): durmuşken **BAŞLAT**, çalışırken **TUR**.
- **Durdur** o ana kadarki süreyi de tur olarak kaydeder. Böylece:
  - aralıklı tekrarlar için *Başlat → Durdur, Başlat → Durdur…*
  - kesintisiz ara dereceler için *Başlat → Tur → Tur → Durdur*
  aynı tur listesini üretir.
- **Kaydet**: önce set sorulur (aktif set en üstte), sonra
  *Ortalama → Gerçek* veya *Ortalama → Gerçek, turlar → Not*. Tek turda ikinci seçenek çıkmaz.
  Süreli kaydedilen set tamamlandı olarak işaretlenir (programda kaldırılabilir).
- Gerçek değeri `dd:ss.d` (ör. `01:23.4`) olarak gider ve süre biçiminde yazılır.

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

## Arka uç davranışı (`finishSession`)

1. `eski` (veya `seans`) sayfasında o tarih varsa **DUPLICATE** döner, hiçbir şey yazılmaz.
2. Tamamlanan setler, Plan'daki satırları kaynak alınarak **orijinal Sıra değerine göre**
   `eski`'ye eklenir; Gerçek/Kulaç/Nabız/RPE/MSI/Not uygulamadan gelen değerlerle dolar.
3. Yazılan satır sayısı doğrulanır; tutmazsa **WRITE_MISMATCH**.
4. `seans` sayfasına tek satır eklenir.
5. Ancak 2–4 başarılıysa o tarihin **tüm** Plan satırları silinir.

2–4 arasında bir hata olursa bu çağrının eklediği satırlar geri alınır ve Plan'a
dokunulmaz. Tüm yazma işlemleri `LockService` kilidi altında yapılır (30 sn bekler,
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
node tests/test-gas.cjs     # Code.gs, sahte SpreadsheetApp ile (bağımlılık yok)
node tests/test-e2e.cjs     # Ön yüz uçtan uca; Playwright + Chromium gerekir
```
