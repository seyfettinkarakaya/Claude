/**
 * YüzmeSK — Apps Script arka ucu (Faz 1)
 *
 * YuzmeProgram tablosuna bağlı (container-bound) script olarak kurulur ve
 * web uygulaması olarak yayınlanır (erişim: herkes, çalıştıran: ben).
 *
 * Sütunlar her zaman 1. satırdaki BAŞLIK ADINA göre bulunur; sütun harfi
 * veya sırası hiçbir yerde varsayılmaz. Başlık karşılaştırması büyük/küçük
 * harf, baştaki/sondaki boşluk ve Türkçe karakter farklarına duyarsızdır
 * ("Sıra" = "sira" = " SIRA ").
 *
 * Uç noktalar (hepsi POST, gövde JSON):
 *   getDates, getPlan, finishSession
 */

var SHEET_PLAN = 'Plan';
var SHEET_ESKI = 'eski';
var SHEET_SEANS = 'seans';
var LOCK_WAIT_MS = 30000;
var TOKEN_PROPERTY = 'TOKEN';

// Plan / eski sütun başlıkları.
var COL = {
  tarih: 'Tarih',
  sira: 'Sıra',
  blok: 'Blok',
  tekrar: 'Tekrar',
  mesafe: 'Mesafe',
  stil: 'Stil',
  tur: 'Tür',
  aciklama: 'Açıklama',
  hedef: 'Hedef',
  dinlen: 'Dinlen',
  alet: 'Alet',
  gercek: 'Gerçek',
  kulac: 'Kulaç',
  nabiz: 'Nabız',
  rpe: 'RPE',
  msi: 'MSI',
  not: 'Not'
};

// seans sütun başlıkları.
var SEANS_COL = {
  tarih: 'Tarih',
  sure: 'Süre',
  mesafe: 'Mesafe',
  havuz: 'Havuz',
  rpe: 'RPE',
  msi: 'MSI',
  aciklama: 'Açıklama'
};

// Uygulamadan gelen, set başına sonuç alanları ve türleri.
var SET_RESULT_FIELDS = {
  gercek: 'duration',
  kulac: 'number',
  nabiz: 'number',
  rpe: 'number',
  msi: 'text',
  not: 'text'
};

// ---------------------------------------------------------------------------
// Giriş noktaları
// ---------------------------------------------------------------------------

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
  return reply_({ ok: true, data: { uygulama: 'YüzmeSK', surum: 1 } });
}

function handle_(req) {
  if (!checkToken_(req.token)) return fail_('AUTH', 'Geçersiz anahtar (token).');
  try {
    switch (req.action) {
      case 'getDates':
        return ok_(getDates_());
      case 'getPlan':
        return ok_(getPlan_(req));
      case 'finishSession':
        return withLock_(function () { return ok_(finishSession_(req)); });
      default:
        return fail_('UNKNOWN_ACTION', 'Bilinmeyen işlem: ' + req.action);
    }
  } catch (err) {
    if (err && err.appCode) return fail_(err.appCode, err.message);
    return fail_('SERVER', String((err && err.message) || err));
  }
}

// ---------------------------------------------------------------------------
// Kurulum yardımcıları (Apps Script düzenleyicisinden elle çalıştırılır)
// ---------------------------------------------------------------------------

/** Rastgele bir token üretir, Script Properties'e yazar ve günlüğe basar. */
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
// getDates
// ---------------------------------------------------------------------------

function getDates_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tz = ss.getSpreadsheetTimeZone();
  var plan = readSheet_(ss, SHEET_PLAN);
  var cTarih = col_(plan, COL.tarih, true);
  var cTekrar = col_(plan, COL.tekrar, false);
  var cMesafe = col_(plan, COL.mesafe, false);

  var byDate = {};
  plan.values.forEach(function (row) {
    var key = dateKey_(row[cTarih], tz);
    if (!key) return;
    var g = byDate[key] || (byDate[key] = { tarih: key, setSayisi: 0, toplamMesafe: 0 });
    g.setSayisi++;
    g.toplamMesafe += setDistance_(row, cTekrar, cMesafe);
  });

  return Object.keys(byDate).sort().map(function (k) { return byDate[k]; });
}

// ---------------------------------------------------------------------------
// getPlan
// ---------------------------------------------------------------------------

function getPlan_(req) {
  var tarih = requireDate_(req.tarih);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tz = ss.getSpreadsheetTimeZone();
  var plan = readSheet_(ss, SHEET_PLAN, { display: true });
  var c = {
    tarih: col_(plan, COL.tarih, true),
    sira: col_(plan, COL.sira, true),
    blok: col_(plan, COL.blok, false),
    tekrar: col_(plan, COL.tekrar, false),
    mesafe: col_(plan, COL.mesafe, false),
    stil: col_(plan, COL.stil, false),
    tur: col_(plan, COL.tur, false),
    aciklama: col_(plan, COL.aciklama, false),
    hedef: col_(plan, COL.hedef, false),
    dinlen: col_(plan, COL.dinlen, false),
    alet: col_(plan, COL.alet, false)
  };

  var setler = [];
  plan.values.forEach(function (row, i) {
    if (dateKey_(row[c.tarih], tz) !== tarih) return;
    var disp = plan.display[i];
    setler.push({
      _satir: i,
      sira: toNumber_(row[c.sira]),
      blok: text_(disp, c.blok),
      tekrar: toNumber_(cell_(row, c.tekrar)) || 1,
      mesafe: toNumber_(cell_(row, c.mesafe)) || 0,
      stil: text_(disp, c.stil),
      tur: text_(disp, c.tur),
      aciklama: text_(disp, c.aciklama),
      hedef: durationText_(cell_(disp, c.hedef)),
      dinlen: durationText_(cell_(disp, c.dinlen)),
      alet: text_(disp, c.alet)
    });
  });

  setler.sort(bySira_);
  setler.forEach(function (s) { delete s._satir; });
  return { tarih: tarih, setler: setler };
}

// ---------------------------------------------------------------------------
// finishSession
//
// Sıra: 1) yinelenme kontrolü  2) eski'ye yaz  3) doğrula  4) seans'a yaz
//       5) ancak hepsi başarılıysa Plan'dan sil.
// 2–4 arasında bir hata olursa bu çağrının eklediği satırlar geri alınır,
// Plan'a dokunulmaz. Böylece ya hepsi kalıcı olur ya hiçbiri.
// ---------------------------------------------------------------------------

function finishSession_(req) {
  var tarih = requireDate_(req.tarih);
  var seansIn = req.seans;
  var setlerIn = req.setler;
  if (!seansIn || typeof seansIn !== 'object') throw appError_('BAD_REQUEST', '"seans" alanı eksik.');
  if (!Array.isArray(setlerIn)) throw appError_('BAD_REQUEST', '"setler" alanı eksik.');

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tz = ss.getSpreadsheetTimeZone();
  var plan = readSheet_(ss, SHEET_PLAN, { formats: true });
  var eski = readSheet_(ss, SHEET_ESKI);
  var seans = readSheet_(ss, SHEET_SEANS);
  var eskiTarihCol = col_(eski, COL.tarih, true);
  var seansTarihCol = col_(seans, SEANS_COL.tarih, true);

  // 1) Yinelenme kontrolü. seans sayfası da kontrol edilir: hiç set
  //    tamamlanmadan kapatılan bir seans eski'ye satır yazmaz, ikinci
  //    gönderimi yakalamanın tek yolu budur.
  if (rowsForDate_(eski, eskiTarihCol, tarih, tz).length ||
      rowsForDate_(seans, seansTarihCol, tarih, tz).length) {
    throw appError_('DUPLICATE', tarih + ' tarihli seans zaten kaydedilmiş.');
  }

  var planTarihCol = col_(plan, COL.tarih, true);
  var planSiraCol = col_(plan, COL.sira, true);
  var planRows = rowsForDate_(plan, planTarihCol, tarih, tz);
  if (!planRows.length) throw appError_('NOT_FOUND', tarih + ' için Plan sayfasında satır yok.');

  // Tamamlanan setleri Plan satırlarıyla eşleştir.
  var planBySira = {};
  planRows.forEach(function (i) {
    var key = siraKey_(plan.values[i][planSiraCol]);
    if (!(key in planBySira)) planBySira[key] = i;
  });

  var seen = {};
  var done = [];
  setlerIn.forEach(function (s) {
    if (!s || s.tamamlandi !== true) return;
    var key = siraKey_(s.sira);
    if (seen[key]) return;
    seen[key] = true;
    if (!(key in planBySira)) {
      throw appError_('PLAN_MISMATCH', 'Sıra ' + s.sira + ' bu tarihin planında bulunamadı.');
    }
    done.push({ row: planBySira[key], sonuc: s });
  });

  // Orijinal Sıra değerine göre yaz (kullanıcının uygulama sırası önemsiz).
  done.sort(function (a, b) {
    return bySira_(
      { sira: toNumber_(plan.values[a.row][planSiraCol]), _satir: a.row },
      { sira: toNumber_(plan.values[b.row][planSiraCol]), _satir: b.row });
  });

  var eskiWritten = null;
  var seansWritten = null;
  try {
    // 2) eski sayfasına yaz.
    if (done.length) {
      var eskiRows = done.map(function (d) { return buildEskiRow_(plan, eski, d.row, d.sonuc, tz); });
      eskiWritten = appendRows_(eski, eskiRows);
    }

    // 3) Doğrula.
    SpreadsheetApp.flush();
    var yazilan = countDateInColumn_(eski.sheet, eskiTarihCol, tarih, tz);
    if (yazilan !== done.length) {
      throw appError_('WRITE_MISMATCH',
        'eski sayfasına ' + done.length + ' satır beklenirken ' + yazilan + ' satır bulundu.');
    }

    // 4) seans sayfasına tek satır.
    seansWritten = appendRows_(seans, [buildSeansRow_(seans, tarih, seansIn, tz)]);
    SpreadsheetApp.flush();
    if (countDateInColumn_(seans.sheet, seansTarihCol, tarih, tz) !== 1) {
      throw appError_('WRITE_MISMATCH', 'seans satırı doğrulanamadı.');
    }
  } catch (err) {
    rollback_(seansWritten, seansTarihCol, tarih, tz);
    rollback_(eskiWritten, eskiTarihCol, tarih, tz);
    SpreadsheetApp.flush();
    throw err;
  }

  // 5) Plan'dan sil. Satır numaraları, arada tablo elle düzenlenmiş olabileceği
  //    için taze okumayla yeniden hesaplanır.
  var silinen = 0;
  var uyari = '';
  try {
    silinen = deleteDateRows_(plan.sheet, planTarihCol, tarih, tz);
  } catch (err) {
    uyari = 'Seans kaydedildi ancak Plan satırları silinemedi: ' + ((err && err.message) || err);
  }

  var data = { yazilanSet: done.length, silinenSet: silinen };
  if (uyari) data.uyari = uyari;
  return data;
}

function buildEskiRow_(plan, eski, planRow, sonuc, tz) {
  var src = plan.values[planRow];
  var srcFmt = plan.formats[planRow];
  var values = [];
  var formats = [];
  eski.headers.forEach(function (h) {
    var key = normalize_(h);
    if (key && Object.prototype.hasOwnProperty.call(SET_RESULT_FIELDS, key)) {
      var conv = convertValue_(sonuc[key], SET_RESULT_FIELDS[key]);
      values.push(conv.value);
      formats.push(conv.format);
    } else if (key && key in plan.map) {
      values.push(src[plan.map[key]]);
      formats.push(srcFmt[plan.map[key]]);
    } else {
      values.push('');
      formats.push(null);
    }
  });
  return { values: values, formats: formats };
}

function buildSeansRow_(seans, tarih, s, tz) {
  var fields = {};
  fields[normalize_(SEANS_COL.tarih)] = { value: Utilities.parseDate(tarih, tz, 'yyyy-MM-dd'), format: null };
  fields[normalize_(SEANS_COL.sure)] = convertValue_(s.sure, 'duration');
  fields[normalize_(SEANS_COL.mesafe)] = convertValue_(s.mesafe, 'number');
  fields[normalize_(SEANS_COL.havuz)] = convertValue_(s.havuz == null || s.havuz === '' ? 25 : s.havuz, 'number');
  fields[normalize_(SEANS_COL.rpe)] = convertValue_(s.rpe, 'number');
  fields[normalize_(SEANS_COL.msi)] = convertValue_(s.msi, 'text');
  fields[normalize_(SEANS_COL.aciklama)] = convertValue_(s.aciklama, 'text');

  var values = [];
  var formats = [];
  seans.headers.forEach(function (h) {
    var f = fields[normalize_(h)];
    values.push(f ? f.value : '');
    formats.push(f ? f.format : null);
  });
  return { values: values, formats: formats };
}

/**
 * Uygulamadan gelen değeri hücreye yazılacak değer + sayı biçimine çevirir.
 * format null ise sütunun mevcut biçimi (bir üst satırınki) korunur.
 */
function convertValue_(v, type) {
  if (v === null || v === undefined) return { value: '', format: null };
  var s = String(v).trim();
  if (s === '') return { value: '', format: null };

  if (type === 'number') {
    var n = toNumber_(s);
    return n !== null ? { value: n, format: null } : { value: s, format: '@' };
  }
  if (type === 'duration') {
    var sec = parseDuration_(s);
    if (sec === null) return { value: s, format: '@' };
    var fmt = sec >= 3600 ? '[h]:mm:ss' : '[mm]:ss';
    if (sec % 1 !== 0) fmt += '.0';
    return { value: sec / 86400, format: fmt };
  }
  return { value: s, format: '@' };
}

// ---------------------------------------------------------------------------
// Tablo yardımcıları
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
 * Satırları sayfanın sonuna ekler. Biçimler: kaynak biçimi > değerin kendi
 * biçimi > bir üstteki satırın biçimi. Yazılan aralığı döndürür.
 */
function appendRows_(t, rows) {
  var sheet = t.sheet;
  var width = t.headers.length;
  var start = sheet.getLastRow() + 1;
  var end = start + rows.length - 1;
  if (sheet.getMaxRows() < end) sheet.insertRowsAfter(sheet.getMaxRows(), end - sheet.getMaxRows());

  var range = sheet.getRange(start, 1, rows.length, width);
  var prevFormats = start > 2 ? sheet.getRange(start - 1, 1, 1, width).getNumberFormats()[0] : null;
  var ownFormats = range.getNumberFormats();

  var formats = rows.map(function (r, ri) {
    return r.formats.map(function (f, i) {
      var base = prevFormats ? prevFormats[i] : ownFormats[ri][i];
      if (!f) return base;
      // Sütun zaten bir süre biçimi kullanıyorsa (ör. "mm:ss") onu koru.
      if (r.values[i] !== '' && isDurationFormat_(f) && isDurationFormat_(base)) return base;
      return f;
    });
  });

  range.setNumberFormats(formats);
  range.setValues(rows.map(function (r) { return r.values; }));
  return { sheet: sheet, start: start, count: rows.length };
}

function isDurationFormat_(f) {
  return /s/.test(f || '') && /[hm]/.test(f) && !/[dy]/i.test(f);
}

/** Bu çağrının eklediği satırları geri alır (yalnızca tarih hâlâ eşleşiyorsa). */
function rollback_(written, tarihCol, tarih, tz) {
  if (!written) return;
  try {
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
    if (err && err.appCode) return fail_(err.appCode, err.message);
    return fail_('SERVER', String((err && err.message) || err));
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
