/**
 * @OnlyCurrentDoc
 *
 * YüzmeSK — sporRef arka ucu
 *
 * sporRef tablosuna bağlı (container-bound) betik olarak kurulur ve web
 * uygulaması olarak yayınlanır (erişim: herkes, çalıştıran: ben). Yalnızca
 * bağlı olduğu tabloya erişir. Tek yazma işlemi addCss: css sayfasının sonuna
 * yeni satır ekler (var olan satırlara dokunmaz).
 *
 * Uç noktalar (POST, gövde JSON): getRef, addCss
 *   zones  : tempo / nabız bölgeleri (zone sayfası)
 *   css    : tarih aralığı + alet + havuza göre CSS (css sayfası)
 *   bilgi  : kısaltmalar ve parametreler (bilgi sayfası; Max Nabız, Havuz Mesafe …)
 *   alet   : alet kodları (alet sayfası)
 *   rpe/msi: ölçek açıklamaları (RPE / MSI sayfaları, başlıksız tek sütun)
 *   faz    : faz tarihleri (fazBilgi sayfası)
 *   kisit  : sağlık kısıtı kuralları (kisit sayfası; Kural · Değer · Açıklama) — isteğe bağlı
 *   yuzmeKas: yüzmede stil → kas grubu yük katsayısı (yuzmeKas sayfası; Stil · Grup · Katsayı) — isteğe bağlı
 *   drill  : drill adı → video (drill sayfası; Ad · Video · Açıklama) — isteğe bağlı
 * addCss { tarih, css, alet?, havuz? } : css sayfasına Tarih_ilk = tarih, Tarih_son boş satır ekler
 */

var TOKEN_PROPERTY = 'TOKEN';
var LOCK_WAIT_MS = 30000;

function doPost(e) {
  var req;
  try {
    req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return reply_(fail_('BAD_REQUEST', 'İstek gövdesi geçerli JSON değil.'));
  }
  return reply_(handle_(req || {}));
}

function doGet() {
  return reply_({ ok: true, data: { uygulama: 'YüzmeSK sporRef', surum: 1 } });
}

function handle_(req) {
  if (!checkToken_(req.token)) return fail_('AUTH', 'Geçersiz anahtar (token).');
  try {
    switch (req.action) {
      case 'getRef':
        return ok_(getRef_());
      case 'addCss':
        return withLock_(function () { return ok_(addCss_(req)); });
      default:
        return fail_('UNKNOWN_ACTION', 'Bilinmeyen işlem.');
    }
  } catch (err) {
    return errorReply_(err);
  }
}

/**
 * Bilinen hatalar (appCode) kodu ve mesajıyla döner. Beklenmeyen hataların
 * ayrıntısı istemciye gönderilmez; yalnızca Apps Script günlüğüne (Yürütmeler)
 * kısa bir başvuru numarasıyla yazılır.
 */
function errorReply_(err) {
  if (err && err.appCode) return fail_(err.appCode, err.message);
  var ref = Utilities.getUuid().slice(0, 8);
  console.error('SERVER ' + ref + ': ' + ((err && err.stack) || err));
  return fail_('SERVER', 'Sunucuda beklenmeyen bir hata oldu (başvuru: ' + ref + ').');
}

// ---------------------------------------------------------------------------
// Kurulum yardımcıları (Apps Script düzenleyicisinden elle çalıştırılır)
// ---------------------------------------------------------------------------

/**
 * Rastgele bir token üretir, Script Properties'e yazar ve günlüğe basar.
 * Anahtarı yenilemek için de kullanılır: eski anahtar o anda geçersiz olur.
 */
function tokenUret() {
  var token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  PropertiesService.getScriptProperties().setProperty(TOKEN_PROPERTY, token);
  Logger.log('Yeni token: ' + token);
  return token;
}

/** Kayıtlı token'ı günlüğe basar. */
function tokenGoster() {
  Logger.log('Token: ' + PropertiesService.getScriptProperties().getProperty(TOKEN_PROPERTY));
}

// ---------------------------------------------------------------------------
// getRef
// ---------------------------------------------------------------------------

function getRef_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tz = ss.getSpreadsheetTimeZone();
  var out = {
    zones: readZones_(ss),
    css: readCss_(ss, tz),
    bilgi: readBilgi_(ss),
    alet: readAlet_(ss),
    rpe: readColumn_(ss, 'RPE'),
    msi: readColumn_(ss, 'MSI'),
    faz: readFaz_(ss, tz)
  };
  // Sürüm 12 sayfaları: yalnızca tabloda varsa cevaba eklenir (eski tablolarda cevap aynı kalır).
  if (ss.getSheetByName('kisit')) out.kisit = readKisit_(ss);
  if (ss.getSheetByName('yuzmeKas')) out.yuzmeKas = readYuzmeKas_(ss);
  if (ss.getSheetByName('drill')) out.drill = readDrill_(ss);
  return out;
}

function readKisit_(ss) {
  var t = optSheet_(ss, 'kisit');
  if (!t) return [];
  var cK = col_(t, 'Kural', true), cD = col_(t, 'Değer', false), cA = col_(t, 'Açıklama', false);
  return t.values.filter(function (r) { return text_(r, cK); }).map(function (r) {
    var v = cell_(r, cD);
    return { kural: text_(r, cK), deger: typeof v === 'number' ? v : text_(r, cD), aciklama: text_(r, cA) };
  });
}

function readYuzmeKas_(ss) {
  var t = optSheet_(ss, 'yuzmeKas');
  if (!t) return [];
  var cS = col_(t, 'Stil', true), cG = col_(t, 'Grup', true), cK = col_(t, 'Katsayı', true);
  var out = [];
  t.values.forEach(function (r) {
    var k = toNumber_(cell_(r, cK));
    if (!text_(r, cS) || !text_(r, cG) || k === null) return;
    out.push({ stil: text_(r, cS).toUpperCase(), grup: text_(r, cG), katsayi: k });
  });
  return out;
}

function readDrill_(ss) {
  var t = optSheet_(ss, 'drill');
  if (!t) return [];
  var cA = col_(t, 'Ad', true), cV = col_(t, 'Video', false), cD = col_(t, 'Açıklama', false);
  return t.values.filter(function (r) { return text_(r, cA); }).map(function (r) {
    var video = text_(r, cV);
    return { ad: text_(r, cA), video: /^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//.test(video) ? video : '', aciklama: text_(r, cD) };
  });
}

// ---------------------------------------------------------------------------
// addCss — CSS testi sonucu: css sayfasının sonuna yeni satır (eski satırlar kalır)
// ---------------------------------------------------------------------------

function addCss_(req) {
  var tarih = requireDate_(req.tarih);
  var css = toNumber_(req.css);
  if (css === null || css < 50 || css > 400) throw appError_('BAD_REQUEST', 'CSS 50–400 sn/100 m olmalı.');
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var t = readSheet_(ss, 'css');
  var cI = col_(t, 'Tarih_ilk', true), cS = col_(t, 'Tarih_son', true), cC = col_(t, 'CSS (sn)', true);
  var cAl = col_(t, 'Alet', false), cH = col_(t, 'Havuz', false), cKa = col_(t, 'Kaynak', false);
  var w = t.headers.length;
  var row = [];
  for (var i = 0; i < w; i++) row.push('');
  row[cI] = Utilities.parseDate(tarih, ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
  row[cC] = Math.round(css * 10) / 10;
  if (cAl >= 0) row[cAl] = String(req.alet || '').slice(0, 40);
  if (cH >= 0) row[cH] = Number(req.havuz) === 50 ? 50 : 25;
  if (cKa >= 0) row[cKa] = 'YüzmeSK CSS testi';
  var at = t.sheet.getLastRow() + 1;
  t.sheet.getRange(at, 1, 1, w).setValues([row]);
  return { satir: at, tarih: tarih, css: row[cC] };
}

function optSheet_(ss, name, opts) {
  return ss.getSheetByName(name) ? readSheet_(ss, name, opts) : null;
}

function readZones_(ss) {
  var t = optSheet_(ss, 'zone');
  if (!t) return [];
  var cZ = col_(t, 'Zone', true), cA = col_(t, 'Alt Sınır', true), cU = col_(t, 'Üst Sınır', true), cT = col_(t, 'Tür', true);
  var cAd = col_(t, 'Türkçe Adı', false);
  var out = [];
  t.values.forEach(function (r) {
    var z = text_(r, cZ);
    if (!z) return;
    out.push({ zone: z, alt: signedNumber_(r[cA]), ust: signedNumber_(r[cU]), tur: text_(r, cT).toUpperCase(), ad: text_(r, cAd) });
  });
  return out;
}

function readCss_(ss, tz) {
  var t = optSheet_(ss, 'css');
  if (!t) return [];
  var cI = col_(t, 'Tarih_ilk', true), cS = col_(t, 'Tarih_son', true), cC = col_(t, 'CSS (sn)', true);
  var cAl = col_(t, 'Alet', false), cH = col_(t, 'Havuz', false);
  var out = [];
  t.values.forEach(function (r) {
    var css = toNumber_(r[cC]);
    var ilk = dateKey_(r[cI], tz);
    if (css === null || !ilk) return;
    out.push({ ilk: ilk, son: dateKey_(r[cS], tz) || '', css: css, alet: text_(r, cAl), havuz: toNumber_(cell_(r, cH)) || 25 });
  });
  return out;
}

function readBilgi_(ss) {
  var t = optSheet_(ss, 'bilgi');
  var out = {};
  if (!t) return out;
  var cK = col_(t, 'Kısaltma', true), cA = col_(t, 'Tam Adı', true), cD = col_(t, 'Açıklama', false), cD2 = col_(t, 'Açıklama.2', false);
  t.values.forEach(function (r) {
    var k = text_(r, cK);
    if (!k) return;
    out[k] = { ad: text_(r, cA), aciklama: text_(r, cD), aciklama2: text_(r, cD2) };
  });
  return out;
}

function readAlet_(ss) {
  var t = optSheet_(ss, 'alet');
  if (!t) return [];
  var cK = col_(t, 'Kod', true), cA = col_(t, 'Ad', true), cD = col_(t, 'Açıklama', false);
  return t.values.filter(function (r) { return text_(r, cK); }).map(function (r) {
    return { kod: text_(r, cK), ad: text_(r, cA), aciklama: text_(r, cD) };
  });
}

function readFaz_(ss, tz) {
  var t = optSheet_(ss, 'fazBilgi');
  if (!t) return [];
  var cS = col_(t, 'Sezon', false), cF = col_(t, 'Faz', true), cI = col_(t, 'Tarih_ilk', true), cE = col_(t, 'Tarih_son', true);
  var cA = col_(t, 'Ad', false), cO = col_(t, 'Odak', false);
  return t.values.filter(function (r) { return text_(r, cF) && dateKey_(r[cI], tz); }).map(function (r) {
    return { sezon: text_(r, cS), faz: text_(r, cF), ilk: dateKey_(r[cI], tz), son: dateKey_(r[cE], tz), ad: text_(r, cA), odak: text_(r, cO) };
  });
}

/** Başlıksız tek sütunlu sayfa (RPE, MSI): 1. satır dahil tüm dolu hücreler. */
function readColumn_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 1) return [];
  return sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues()
    .map(function (r) { return String(r[0] == null ? '' : r[0]).trim(); })
    .filter(function (s) { return s; });
}

/** "−19" (Unicode eksi), "-19", -19 → -19; boş → null. */
function signedNumber_(v) {
  if (typeof v === 'number') return v;
  return toNumber_(String(v == null ? '' : v).replace(/[\u2212\u2013]/g, '-'));
}

// ---------------------------------------------------------------------------
// Ortak yardımcılar — Code.gs ile aynıdır (her betik kendi projesinde tek dosya
// olarak çalıştığı için kopyalanmıştır; değiştirirken üç dosyada da güncelleyin).
// ---------------------------------------------------------------------------

function readSheet_(ss, name, opts) {
  opts = opts || {};
  var sheet = ss.getSheetByName(name);
  if (!sheet) throw appError_('NO_SHEET', '"' + name + '" sayfası bulunamadı.');
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var headers = lastCol ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var t = { sheet: sheet, name: name, headers: headers, map: headerMap_(headers), values: [], display: [], formats: [] };
  if (lastRow > 1 && lastCol) {
    var range = sheet.getRange(2, 1, lastRow - 1, lastCol);
    t.values = range.getValues();
    if (opts.display) t.display = range.getDisplayValues();
    if (opts.formats) t.formats = range.getNumberFormats();
  }
  return t;
}

function headerMap_(headers) {
  var map = {};
  headers.forEach(function (h, i) {
    var k = normalize_(h);
    if (k && !(k in map)) map[k] = i;
  });
  return map;
}

function col_(t, header, required) {
  var k = normalize_(header);
  if (k in t.map) return t.map[k];
  if (required) throw appError_('MISSING_COLUMN', '"' + t.name + '" sayfasında "' + header + '" sütunu yok.');
  return -1;
}

function cell_(row, c) {
  return c < 0 ? '' : row[c];
}

function text_(row, c) {
  return String(cell_(row, c) == null ? '' : cell_(row, c)).trim();
}

function rowsForDate_(t, c, tarih, tz) {
  var out = [];
  t.values.forEach(function (row, i) {
    if (dateKey_(row[c], tz) === tarih) out.push(i);
  });
  return out;
}

function countDateInColumn_(sheet, c, tarih, tz) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  var vals = sheet.getRange(2, c + 1, lastRow - 1, 1).getValues();
  var n = 0;
  vals.forEach(function (r) { if (dateKey_(r[0], tz) === tarih) n++; });
  return n;
}

/**
 * Satırları yazar. atTop: başlığın hemen altına (2. satırdan itibaren) eklenir,
 * mevcut satırlar aşağı kayar; değilse sayfanın sonuna eklenir.
 * Biçimler: kaynak biçimi > değerin kendi biçimi > komşu veri satırının biçimi.
 * Yazılan aralığı döndürür.
 */
function writeRows_(t, rows, atTop) {
  var sheet = t.sheet;
  var width = t.headers.length;
  var n = rows.length;
  var start;
  var neighborRow = null; // biçimi örnek alınacak mevcut veri satırı

  if (atTop) {
    var hadData = sheet.getLastRow() >= 2;
    start = 2;
    sheet.insertRowsBefore(2, n);
    if (hadData) {
      neighborRow = 2 + n;
      // Yeni satırlar başlığın değil, ilk veri satırının görünümünü alsın.
      sheet.getRange(neighborRow, 1, 1, width).copyFormatToRange(sheet, 1, width, start, start + n - 1);
    }
  } else {
    start = sheet.getLastRow() + 1;
    var end = start + n - 1;
    if (sheet.getMaxRows() < end) sheet.insertRowsAfter(sheet.getMaxRows(), end - sheet.getMaxRows());
    if (start > 2) neighborRow = start - 1;
  }

  try {
    writeValues_(sheet, rows, start, width, neighborRow);
  } catch (err) {
    // Üste eklenen satırlar bu çağrınındır: yazma yarıda kaldıysa boş kalmasınlar.
    if (atTop) sheet.deleteRows(start, n);
    throw err;
  }
  return { sheet: sheet, start: start, count: n, inserted: Boolean(atTop) };
}

function writeValues_(sheet, rows, start, width, neighborRow) {
  var n = rows.length;
  var range = sheet.getRange(start, 1, n, width);
  var neighborFormats = neighborRow ? sheet.getRange(neighborRow, 1, 1, width).getNumberFormats()[0] : null;
  var ownFormats = range.getNumberFormats();

  var formats = rows.map(function (r, ri) {
    return r.formats.map(function (f, i) {
      var base = neighborFormats ? neighborFormats[i] : ownFormats[ri][i];
      if (!f) return base;
      // Sütun zaten bir süre biçimi kullanıyorsa (ör. "mm:ss") onu koru.
      if (r.values[i] !== '' && isDurationFormat_(f) && isDurationFormat_(base)) return base;
      return f;
    });
  });

  range.setNumberFormats(formats);
  range.setValues(rows.map(function (r) { return r.values; }));
}

function isDurationFormat_(f) {
  return /s/.test(f || '') && /[hm]/.test(f) && !/[dy]/i.test(f);
}

/** Bu çağrının eklediği satırları geri alır (yalnızca tarih hâlâ eşleşiyorsa). */
function rollback_(written, tarihCol, tarih, tz) {
  if (!written) return;
  try {
    if (written.inserted) {
      // Üste eklenen blok tamamen bu çağrınındır; olduğu gibi kaldırılır.
      written.sheet.deleteRows(written.start, written.count);
      return;
    }
    var vals = written.sheet.getRange(written.start, tarihCol + 1, written.count, 1).getValues();
    for (var i = written.count - 1; i >= 0; i--) {
      if (dateKey_(vals[i][0], tz) === tarih) written.sheet.deleteRow(written.start + i);
    }
  } catch (e) {
    // Geri alma başarısızsa asıl hata yine de istemciye iletilir.
  }
}

/** Plan'da bu tarihe ait tüm satırları taze okumayla bulup alttan yukarı siler. */
function deleteDateRows_(sheet, tarihCol, tarih, tz) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  var vals = sheet.getRange(2, tarihCol + 1, lastRow - 1, 1).getValues();
  var rows = [];
  vals.forEach(function (r, i) { if (dateKey_(r[0], tz) === tarih) rows.push(i + 2); });

  // Ardışık satırları tek deleteRows çağrısında sil, en alttan başla.
  var deleted = 0;
  var i = rows.length - 1;
  while (i >= 0) {
    var end = rows[i];
    var start = end;
    while (i > 0 && rows[i - 1] === start - 1) { i--; start--; }
    sheet.deleteRows(start, end - start + 1);
    deleted += end - start + 1;
    i--;
  }
  return deleted;
}

// ---------------------------------------------------------------------------
// Değer yardımcıları
// ---------------------------------------------------------------------------

/** Başlık/anahtar normalleştirme: küçük harf, Türkçe karakterler sadeleşir. */
function normalize_(s) {
  return String(s == null ? '' : s)
    .trim()
    .replace(/İ/g, 'i').replace(/I/g, 'i').replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u')
    .replace(/\s+/g, ' ');
}

/** Hücre değerini YYYY-MM-DD anahtarına çevirir; tarih değilse ''. */
function dateKey_(v, tz) {
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return '';
    return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
  }
  if (typeof v === 'string') {
    var s = v.trim();
    var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) return m[1] + '-' + pad2_(m[2]) + '-' + pad2_(m[3]);
    m = s.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
    if (m) return m[3] + '-' + pad2_(m[2]) + '-' + pad2_(m[1]);
  }
  return '';
}

function requireDate_(v) {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    throw appError_('BAD_REQUEST', 'Tarih YYYY-MM-DD biçiminde olmalı.');
  }
  return v;
}

function toNumber_(v) {
  if (typeof v === 'number') return v;
  if (v === null || v === undefined) return null;
  var s = String(v).trim().replace(',', '.');
  if (s === '' || !/^-?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
}

function siraKey_(v) {
  var n = toNumber_(v);
  return n === null ? 'x:' + String(v) : String(n);
}

function setDistance_(row, cTekrar, cMesafe) {
  var tekrar = toNumber_(cell_(row, cTekrar)) || 1;
  var mesafe = toNumber_(cell_(row, cMesafe)) || 0;
  return tekrar * mesafe;
}

function bySira_(a, b) {
  var an = a.sira === null || a.sira === undefined;
  var bn = b.sira === null || b.sira === undefined;
  if (an !== bn) return an ? 1 : -1;
  if (!an && a.sira !== b.sira) return a.sira - b.sira;
  return a._satir - b._satir;
}

/** "ss:dd:ss", "dd:ss" veya "dd:ss.d" → saniye; geçersizse null. */
function parseDuration_(s) {
  var m = String(s).trim().match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?([.,]\d+)?$/);
  if (!m) return null;
  var frac = m[4] ? Number('0.' + m[4].slice(1)) : 0;
  if (m[3] !== undefined) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + frac;
  return Number(m[1]) * 60 + Number(m[2]) + frac;
}

/** Görünen süre metnini dd:ss (veya ss:dd:ss) biçimine sadeleştirir. */
function durationText_(v) {
  var s = String(v == null ? '' : v).trim();
  if (!s) return '';
  var m = s.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?([.,]\d+)?$/);
  if (!m) return s;
  var frac = m[4] ? '.' + m[4].slice(1) : '';
  if (m[3] !== undefined) {
    if (Number(m[1]) === 0) return pad2_(m[2]) + ':' + pad2_(m[3]) + frac;
    return pad2_(m[1]) + ':' + pad2_(m[2]) + ':' + pad2_(m[3]) + frac;
  }
  return pad2_(m[1]) + ':' + pad2_(m[2]) + frac;
}

function pad2_(n) {
  n = String(n);
  return n.length < 2 ? '0' + n : n;
}

// ---------------------------------------------------------------------------
// Kimlik, kilit, cevap
// ---------------------------------------------------------------------------

function checkToken_(token) {
  var expected = PropertiesService.getScriptProperties().getProperty(TOKEN_PROPERTY);
  if (!expected || typeof token !== 'string' || token.length !== expected.length) return false;
  var diff = 0;
  for (var i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}

function withLock_(fn) {
  var lock = LockService.getDocumentLock() || LockService.getScriptLock();
  if (!lock.tryLock(LOCK_WAIT_MS)) {
    return fail_('LOCKED', 'Tablo şu anda meşgul. Birazdan tekrar deneyin.');
  }
  try {
    return fn();
  } catch (err) {
    return errorReply_(err);
  } finally {
    lock.releaseLock();
  }
}

function appError_(code, message) {
  var e = new Error(message);
  e.appCode = code;
  return e;
}

function ok_(data) {
  return { ok: true, data: data };
}

function fail_(code, message) {
  return { ok: false, error: code, message: message || '' };
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
