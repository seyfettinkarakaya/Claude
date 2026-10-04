/**
 * @OnlyCurrentDoc
 *
 * YüzmeSK — SalonTakip arka ucu
 *
 * SalonTakip tablosuna bağlı (container-bound) betik olarak kurulur ve web
 * uygulaması olarak yayınlanır (erişim: herkes, çalıştıran: ben). Yalnızca
 * bağlı olduğu tabloya erişir.
 *
 * Uç noktalar (POST, gövde JSON):
 *   getSalon  : hareket kataloğu (H), kas etkileri (hkEtki), vücut ağırlığı (ref BW)
 *               ve idman geçmişi
 *   saveSalon : bir günün hareketlerini idman sayfasının en üstüne yazar
 *
 * idman sayfası v2 sayfasındaki formül tarafından sütun SIRASIYLA (A–J) okunur:
 * Tarih, No, Hareket, Set, Tekrar, Ağırlık, Nabız, RPE, MSI, Açıklama. Betik
 * sütunları başlık adıyla bulur ama sırayı değiştirmez; hareket süresi K
 * sütununa ("Süre") yazılır. Vücut ağırlığı tam olarak "Vücut" yazılır.
 */

var SHEET_IDMAN = 'idman';
var SHEET_H = 'H';
var SHEET_ETKI = 'hkEtki';
var SHEET_REF = 'ref';
var LOCK_WAIT_MS = 30000;
var TOKEN_PROPERTY = 'TOKEN';
var VUCUT = 'Vücut';

var IDMAN_COL = {
  tarih: 'Tarih', no: 'No', hareket: 'Hareket', set: 'Set', tekrar: 'Tekrar', agirlik: 'Ağırlık',
  nabiz: 'Nabız', rpe: 'RPE', msi: 'MSI', aciklama: 'Açıklama', sure: 'Süre'
};

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
  return reply_({ ok: true, data: { uygulama: 'YüzmeSK Salon', surum: 1 } });
}

function handle_(req) {
  if (!checkToken_(req.token)) return fail_('AUTH', 'Geçersiz anahtar (token).');
  try {
    switch (req.action) {
      case 'getSalon':
        return ok_(getSalon_());
      case 'saveSalon':
        return withLock_(function () { return ok_(saveSalon_(req)); });
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
// getSalon
// ---------------------------------------------------------------------------

function getSalon_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tz = ss.getSpreadsheetTimeZone();
  return { katalog: readKatalog_(ss), etki: readEtki_(ss), bw: readBw_(ss, tz), gecmis: readGecmis_(ss, tz) };
}

function readKatalog_(ss) {
  if (!ss.getSheetByName(SHEET_H)) return [];
  var t = readSheet_(ss, SHEET_H);
  var cE = col_(t, 'Exercise', true), cG = col_(t, 'Goal Tag', false), cQ = col_(t, 'Equipment', false);
  var cB = col_(t, 'BW Coefficient', false), cV = col_(t, 'Video', false);
  // İsteğe bağlı (sürüm 12): Kısıt (ör. "squat>90", "zıplama"), Alternatif (güvenli hareket adı), Görsel (free-exercise-db kimliği)
  var cK = col_(t, 'Kısıt', false), cA = col_(t, 'Alternatif', false), cGo = col_(t, 'Görsel', false);
  // "Swim Transfer Coefficient" (başlık kısaltılmış olabilir) — ilk eşleşen sütun.
  var cS = -1;
  t.headers.forEach(function (h, i) { if (cS < 0 && normalize_(h).indexOf('swim transfer') === 0) cS = i; });
  return t.values.filter(function (r) { return text_(r, cE); }).map(function (r) {
    var k = katalogRow_(r);
    if (text_(r, cK)) k.kisit = text_(r, cK);
    if (text_(r, cA)) k.alternatif = text_(r, cA);
    if (text_(r, cGo)) k.gorsel = text_(r, cGo);
    return k;
  });
  function katalogRow_(r) {
    var video = text_(r, cV);
    return {
      ad: text_(r, cE), amac: text_(r, cG), ekipman: text_(r, cQ),
      bw: toNumber_(cell_(r, cB)), stc: toNumber_(cell_(r, cS)),
      video: /^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//.test(video) ? video : ''
    };
  }
}

function readEtki_(ss) {
  if (!ss.getSheetByName(SHEET_ETKI)) return [];
  var t = readSheet_(ss, SHEET_ETKI);
  var cE = col_(t, 'Exercise', true), cG = col_(t, 'Muscle Group', true), cM = col_(t, 'Muscle', false);
  var cK = col_(t, 'Kinetic Chain', false), cO = col_(t, 'Yük Etki Oranı', true);
  return t.values.filter(function (r) { return text_(r, cE) && toNumber_(r[cO]) !== null; }).map(function (r) {
    return { ad: text_(r, cE), grup: text_(r, cG), kas: text_(r, cM), zincir: text_(r, cK), oran: toNumber_(r[cO]) };
  });
}

/** ref sayfasındaki "BW" satırları: tarih aralığına göre vücut ağırlığı. */
function readBw_(ss, tz) {
  if (!ss.getSheetByName(SHEET_REF)) return [];
  var t = readSheet_(ss, SHEET_REF);
  return t.values.filter(function (r) { return text_(r, 0).toUpperCase() === 'BW'; }).map(function (r) {
    return { ilk: dateKey_(r[1], tz), son: dateKey_(r[2], tz), kg: toNumber_(r[3]) };
  }).filter(function (b) { return b.kg !== null; });
}

function readGecmis_(ss, tz) {
  var t = readSheet_(ss, SHEET_IDMAN, { display: true });
  var c = idmanCols_(t, false);
  var out = [];
  t.values.forEach(function (r, i) {
    var tarih = dateKey_(r[c.tarih], tz);
    if (!tarih || !text_(r, c.hareket)) return;
    var ag = r[c.agirlik];
    out.push({
      tarih: tarih, no: text_(r, c.no), hareket: text_(r, c.hareket),
      set: toNumber_(r[c.set]), tekrar: toNumber_(r[c.tekrar]),
      agirlik: normalize_(ag) === normalize_(VUCUT) ? VUCUT : toNumber_(ag),
      nabiz: toNumber_(cell_(r, c.nabiz)), rpe: toNumber_(cell_(r, c.rpe)), msi: toNumber_(cell_(r, c.msi)),
      aciklama: text_(r, c.aciklama), sure: c.sure >= 0 ? durationText_(t.display[i][c.sure]) : ''
    });
  });
  return out;
}

function idmanCols_(t, forWrite) {
  var c = {};
  Object.keys(IDMAN_COL).forEach(function (k) {
    c[k] = col_(t, IDMAN_COL[k], k !== 'sure' && (forWrite || ['tarih', 'hareket'].indexOf(k) >= 0));
  });
  return c;
}

// ---------------------------------------------------------------------------
// saveSalon
// ---------------------------------------------------------------------------

/**
 * İstek: { tarih: 'YYYY-MM-DD', hareketler: [{ hareket, set, tekrar, agirlik, nabiz, rpe, msi, aciklama, sure }] }
 * 1) o tarih idman'da varsa DUPLICATE  2) en üste yaz  3) satır sayısını doğrula (tutmazsa geri al)
 */
function saveSalon_(req) {
  var tarih = requireDate_(req.tarih);
  var list = Array.isArray(req.hareketler) ? req.hareketler : [];
  list = list.filter(function (h) { return h && String(h.hareket || '').trim(); });
  if (!list.length) throw appError_('BAD_REQUEST', 'Kaydedilecek hareket yok.');

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tz = ss.getSpreadsheetTimeZone();
  var t = readSheet_(ss, SHEET_IDMAN);
  ensureSureHeader_(t);
  var c = idmanCols_(t, true);

  if (countDateInColumn_(t.sheet, c.tarih, tarih, tz) > 0) {
    throw appError_('DUPLICATE', tarih + ' tarihli salon idmanı zaten kayıtlı.');
  }

  var day = Utilities.parseDate(tarih, tz, 'yyyy-MM-dd');
  var rows = list.map(function (h, i) {
    var f = {};
    f[c.tarih] = { value: day, format: null };
    f[c.no] = { value: i + 1, format: null };
    f[c.hareket] = { value: String(h.hareket).trim(), format: '@' };
    f[c.set] = convertValue_(h.set, 'number');
    f[c.tekrar] = convertValue_(h.tekrar == null ? '' : Math.round(Number(h.tekrar) * 100) / 100, 'number');
    f[c.agirlik] = normalize_(h.agirlik) === normalize_(VUCUT) ? { value: VUCUT, format: '@' } : convertValue_(h.agirlik, 'number');
    f[c.nabiz] = convertValue_(h.nabiz, 'number');
    f[c.rpe] = convertValue_(h.rpe, 'number');
    f[c.msi] = convertValue_(h.msi, 'number');
    f[c.aciklama] = convertValue_(h.aciklama, 'text');
    if (c.sure >= 0) f[c.sure] = convertValue_(h.sure, 'duration');
    var values = [];
    var formats = [];
    t.headers.forEach(function (_, j) {
      values.push(f[j] ? f[j].value : '');
      formats.push(f[j] ? f[j].format : null);
    });
    return { values: values, formats: formats };
  });

  var written = writeRows_(t, rows, true);
  SpreadsheetApp.flush();
  if (countDateInColumn_(t.sheet, c.tarih, tarih, tz) !== rows.length) {
    rollback_(written, c.tarih, tarih, tz);
    SpreadsheetApp.flush();
    throw appError_('WRITE_MISMATCH', 'idman sayfasına ' + rows.length + ' satır beklenirken farklı sayı bulundu.');
  }
  return { yazilan: rows.length };
}

/** "Süre" başlığı yoksa K sütununa (Açıklama'dan sonraki ilk sütun) yazılır. */
function ensureSureHeader_(t) {
  if (col_(t, IDMAN_COL.sure, false) >= 0) return;
  var k = 10; // K
  if (t.headers.length > k && String(t.headers[k] || '').trim()) {
    throw appError_('MISSING_COLUMN', 'idman sayfasında "Süre" sütunu yok ve K sütunu başka bir başlıkla dolu.');
  }
  t.sheet.getRange(1, k + 1, 1, 1).setValues([[IDMAN_COL.sure]]);
  while (t.headers.length <= k) t.headers.push('');
  t.headers[k] = IDMAN_COL.sure;
  t.map = headerMap_(t.headers);
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
