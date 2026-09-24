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

export function isConfigured() {
  const c = getConfig();
  return Boolean(c.apiUrl && c.token);
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
    const dates = asDateList(raw);
    if (!dates) {
      throw new ApiError('BAD_RESPONSE', `Tarih listesi beklenmeyen biçimde geldi: ${JSON.stringify(raw).slice(0, 120)}`);
    }
    store(KEYS.dates, { dates, savedAt: Date.now() });
    prunePlans(dates.map((d) => d.tarih));
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

/** { plan, fromCache, error } döner. Ağ yoksa o günün son yüklenen kopyası kullanılır. */
export async function getPlan(tarih) {
  try {
    const plan = await call('getPlan', { tarih });
    if (!plan || !Array.isArray(plan.setler)) {
      throw new ApiError('BAD_RESPONSE', `Program beklenmeyen biçimde geldi: ${JSON.stringify(plan).slice(0, 120)}`);
    }
    const plans = loadPlans();
    plans[tarih] = { ...plan, savedAt: Date.now() };
    store(KEYS.plans, plans);
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
        result.sent.push({ tarih: item.payload.tarih, data });
      } catch (err) {
        if (err.code === 'DUPLICATE') {
          removeFromQueue(item.id);
          forgetDate(item.payload.tarih);
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
