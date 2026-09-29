// YüzmeSK — veri erişim katmanı.
//
// Arayüz kodu Apps Script'e, localStorage'a veya kuyruğa doğrudan dokunmaz;
// hepsi bu modülden geçer. Faz 2'de yeni veri kaynakları (Garmin vb.) buraya
// yeni fonksiyonlar olarak eklenir.

const KEYS = {
  config: 'ysk.config',
  dates: 'ysk.dates',
  plans: 'ysk.plans',
  session: 'ysk.session',
  queue: 'ysk.queue',
  history: 'ysk.history', // telefonda saklanan biten seanslar (elle silinir)
  prefs: 'ysk.prefs',
};

const REQUEST_TIMEOUT_MS = 30000;

// Bu hatalar geçicidir: kayıt kuyruğa alınır ve sonra yeniden denenir.
const TRANSIENT_CODES = new Set(['NETWORK', 'HTTP', 'BAD_RESPONSE', 'LOCKED', 'SERVER', 'TIMEOUT']);

export class ApiError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }

  get transient() {
    return TRANSIENT_CODES.has(this.code);
  }
}

// ---------------------------------------------------------------------------
// localStorage
// ---------------------------------------------------------------------------

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function store(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Ayarlar (Apps Script adresi + token)
// ---------------------------------------------------------------------------

export function getConfig() {
  const c = load(KEYS.config, null);
  return {
    apiUrl: c && typeof c.apiUrl === 'string' ? c.apiUrl : '',
    token: c && typeof c.token === 'string' ? c.token : '',
  };
}

export function setConfig({ apiUrl, token }) {
  store(KEYS.config, { apiUrl: String(apiUrl || '').trim(), token: String(token || '').trim() });
}

/** Adres ve anahtarı bu cihazdan siler (Anahtarı unut). Kayıtlar ve kuyruk kalır. */
export function clearConfig() {
  store(KEYS.config, null);
}

export function isConfigured() {
  const c = getConfig();
  return Boolean(c.apiUrl && c.token);
}

// ---------------------------------------------------------------------------
// Tercihler (ses, CSS temposu)
// ---------------------------------------------------------------------------

const DEFAULT_PREFS = { ses: true, css: 117 }; // css: 100 m kritik yüzme hızı (sn)

export function getPrefs() {
  const p = load(KEYS.prefs, null);
  const out = { ...DEFAULT_PREFS };
  if (p && typeof p === 'object') {
    if (typeof p.ses === 'boolean') out.ses = p.ses;
    if (p.css === null || (typeof p.css === 'number' && p.css > 0)) out.css = p.css;
  }
  return out;
}

export function setPrefs(patch) {
  store(KEYS.prefs, { ...getPrefs(), ...patch });
}

// ---------------------------------------------------------------------------
// Apps Script çağrısı
// ---------------------------------------------------------------------------

async function call(action, body = {}) {
  const { apiUrl, token } = getConfig();
  if (!apiUrl || !token) throw new ApiError('NO_CONFIG', 'Sunucu adresi veya anahtar tanımlı değil.');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  let res;
  try {
    // text/plain: CORS ön kontrolü (preflight) tetiklenmesin diye.
    res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...body, action, token }),
      redirect: 'follow',
      signal: ctrl.signal,
    });
  } catch (err) {
    if (err && err.name === 'AbortError') throw new ApiError('TIMEOUT', 'Sunucu zamanında cevap vermedi.');
    throw new ApiError('NETWORK', 'Bağlantı kurulamadı.');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw new ApiError('HTTP', `Sunucu hatası (${res.status}).`);
  let json;
  try {
    json = await res.json();
  } catch {
    throw new ApiError('BAD_RESPONSE', 'Sunucudan geçersiz cevap geldi. Adres doğru mu?');
  }
  if (!json || !json.ok) throw new ApiError((json && json.error) || 'UNKNOWN', json && json.message);
  return json.data;
}

// ---------------------------------------------------------------------------
// Tarihler ve program
// ---------------------------------------------------------------------------

/** Tarih listesini dizi olarak döndürür; tanınmayan biçimde null. */
function asDateList(v) {
  if (Array.isArray(v)) return v;
  if (v && Array.isArray(v.dates)) return v.dates;
  return null;
}

/** { dates, fromCache, error } döner. Ağ yoksa son yüklenen liste kullanılır. */
export async function getDates() {
  try {
    const raw = await call('getDates');
    const list = asDateList(raw);
    if (!list) {
      throw new ApiError('BAD_RESPONSE', `Tarih listesi beklenmeyen biçimde geldi: ${JSON.stringify(raw).slice(0, 120)}`);
    }
    // Yeni Code.gs her günün tüm setlerini (detay) de gönderir: programlar
    // önbelleğe alınır, gün açılırken ayrı istek beklenmez. Detay tarih
    // listesinde tutulmaz (önbellek küçük kalsın).
    const dates = list.filter((d) => d && typeof d.tarih === 'string').map(({ detay, ...rest }) => rest);
    store(KEYS.dates, { dates, savedAt: Date.now() });
    prunePlans(dates.map((d) => d.tarih));
    cachePlansFrom(list);
    return { dates, fromCache: false, error: null };
  } catch (err) {
    const cached = getCachedDates();
    if (cached && err.transient) return { dates: cached, fromCache: true, error: err };
    throw err;
  }
}

export function getCachedDates() {
  const cached = load(KEYS.dates, null);
  return cached ? asDateList(cached.dates) : null;
}

/** getDates'in detay alanındaki programları önbelleğe yazar (devam eden seansın günü hariç). */
function cachePlansFrom(list) {
  const session = loadSession();
  const plans = loadPlans();
  let changed = false;
  for (const d of list) {
    if (!d || typeof d.tarih !== 'string' || !Array.isArray(d.detay) || !d.detay.length) continue;
    if (session && session.tarih === d.tarih) continue; // seansın programı seans boyunca sabit
    plans[d.tarih] = { tarih: d.tarih, setler: d.detay, savedAt: Date.now() };
    changed = true;
  }
  if (changed) store(KEYS.plans, plans);
}

/** Programı sunucudan alır; önbelleğe yazmaz. */
export async function fetchPlan(tarih) {
  const plan = await call('getPlan', { tarih });
  if (!plan || !Array.isArray(plan.setler)) {
    throw new ApiError('BAD_RESPONSE', `Program beklenmeyen biçimde geldi: ${JSON.stringify(plan).slice(0, 120)}`);
  }
  return plan;
}

export function storePlan(plan) {
  const plans = loadPlans();
  plans[plan.tarih] = { ...plan, savedAt: Date.now() };
  store(KEYS.plans, plans);
}

/** { plan, fromCache, error } döner. Ağ yoksa o günün son yüklenen kopyası kullanılır. */
export async function getPlan(tarih) {
  try {
    const plan = await fetchPlan(tarih);
    storePlan({ ...plan, tarih });
    return { plan, fromCache: false, error: null };
  } catch (err) {
    const cached = getCachedPlan(tarih);
    if (cached && err.transient) return { plan: cached, fromCache: true, error: err };
    throw err;
  }
}

export function getCachedPlan(tarih) {
  const p = loadPlans()[tarih];
  return p && Array.isArray(p.setler) ? p : null;
}

function loadPlans() {
  const plans = load(KEYS.plans, {});
  return plans && typeof plans === 'object' && !Array.isArray(plans) ? plans : {};
}

function prunePlans(keepDates) {
  const keep = new Set(keepDates);
  const session = loadSession();
  if (session) keep.add(session.tarih);
  const plans = loadPlans();
  for (const k of Object.keys(plans)) if (!keep.has(k)) delete plans[k];
  store(KEYS.plans, plans);
}

/** Kaydedilen (veya kuyruğa alınan) bir günü yerel listelerden çıkarır. */
export function forgetDate(tarih) {
  const dates = getCachedDates();
  if (dates) store(KEYS.dates, { dates: dates.filter((d) => d && d.tarih !== tarih), savedAt: Date.now() });
  else store(KEYS.dates, null); // bozuk önbellek: at, sunucudan yeniden yüklenir
  const plans = loadPlans();
  delete plans[tarih];
  store(KEYS.plans, plans);
}

// ---------------------------------------------------------------------------
// Devam eden seans
// ---------------------------------------------------------------------------

export function loadSession() {
  const s = load(KEYS.session, null);
  const ok = s && typeof s === 'object' && typeof s.tarih === 'string' &&
    s.done && typeof s.done === 'object' && s.results && typeof s.results === 'object' &&
    s.sw && Array.isArray(s.sw.laps);
  return ok ? s : null;
}

export function saveSession(session) {
  store(KEYS.session, session);
}

export function clearSession() {
  store(KEYS.session, null);
}

// ---------------------------------------------------------------------------
// Telefonda yapılmış idmanlar
//
// Biten her seans (gönderilen, kuyruğa alınan veya zaten kayıtlı çıkan) burada
// saklanır ve yalnızca kullanıcı "Yapılmış idmanlar" sayfasından silince gider.
// status: 'sent' | 'queued' | 'duplicate'
// ---------------------------------------------------------------------------

export function getHistory() {
  const h = load(KEYS.history, []);
  if (!Array.isArray(h)) return [];
  return h.filter((x) => x && typeof x.id === 'string' && typeof x.tarih === 'string' && Array.isArray(x.setler));
}

/** Kaydı ekler; aynı günün eski kaydı varsa yerine geçer. Yazılamazsa false. */
export function addHistory(record) {
  const list = getHistory().filter((x) => x.tarih !== record.tarih);
  list.push(record);
  list.sort((a, b) => (a.tarih < b.tarih ? 1 : a.tarih > b.tarih ? -1 : 0));
  return store(KEYS.history, list);
}

export function removeHistory(ids) {
  const drop = new Set(ids);
  store(KEYS.history, getHistory().filter((x) => !drop.has(x.id)));
}

function markHistory(tarih, status) {
  const list = getHistory();
  const x = list.find((r) => r.tarih === tarih);
  if (!x || x.status === 'sent') return;
  x.status = status;
  x.sentAt = Date.now();
  store(KEYS.history, list);
}

// ---------------------------------------------------------------------------
// Seans kaydı ve kuyruk
// ---------------------------------------------------------------------------

export function finishSession(payload) {
  return call('finishSession', payload);
}

export function getQueue() {
  const q = load(KEYS.queue, []);
  if (!Array.isArray(q)) return [];
  return q.filter((x) => x && typeof x.id === 'string' && x.payload && typeof x.payload.tarih === 'string');
}

export function enqueue(payload, error) {
  const queue = getQueue();
  queue.push({
    id: `${payload.tarih}-${Date.now()}`,
    payload,
    createdAt: Date.now(),
    tries: 0,
    lastError: error ? { code: error.code, message: error.message } : null,
  });
  store(KEYS.queue, queue);
}

export function removeFromQueue(id) {
  store(KEYS.queue, getQueue().filter((q) => q.id !== id));
}

let flushing = null;

/**
 * Kuyruktaki kayıtları sırayla göndermeyi dener.
 * Başarılı ve DUPLICATE (zaten kaydedilmiş) olanlar kuyruktan çıkar.
 * Ağ hatasında durur. { sent, duplicates, remaining } döner.
 */
export function flushQueue() {
  if (flushing) return flushing;
  flushing = (async () => {
    const result = { sent: [], duplicates: [], remaining: 0 };
    if (!isConfigured()) {
      result.remaining = getQueue().length;
      return result;
    }
    for (const item of getQueue()) {
      try {
        const data = await finishSession(item.payload);
        removeFromQueue(item.id);
        forgetDate(item.payload.tarih);
        markHistory(item.payload.tarih, 'sent');
        result.sent.push({ tarih: item.payload.tarih, data });
      } catch (err) {
        if (err.code === 'DUPLICATE') {
          removeFromQueue(item.id);
          forgetDate(item.payload.tarih);
          markHistory(item.payload.tarih, 'duplicate');
          result.duplicates.push({ tarih: item.payload.tarih });
          continue;
        }
        const queue = getQueue();
        const q = queue.find((x) => x.id === item.id);
        if (q) {
          q.tries += 1;
          q.lastError = { code: err.code, message: err.message };
          store(KEYS.queue, queue);
        }
        if (err.code === 'NETWORK' || err.code === 'TIMEOUT') break;
      }
    }
    result.remaining = getQueue().length;
    return result;
  })().finally(() => {
    flushing = null;
  });
  return flushing;
}
