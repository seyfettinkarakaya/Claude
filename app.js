// YüzmeSK — arayüz. Veriye yalnızca data.js üzerinden erişir.

import * as data from './data.js?v=10.4';
import { Wheel } from './wheel.js?v=10.4';
import * as zaman from './zaman.js?v=10.4';

// Telefonun güncel kodu çalıştırıp çalıştırmadığını görmek için ekranda gösterilir.
export const APP_VERSION = '10.4';

const $ = (id) => document.getElementById(id);

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

// key: seans sayfasına yazılan metin; label: ekranda görünen.
const MSI_BOLGELER = [
  { key: 'sag omuz', label: 'Sağ omuz' },
  { key: 'sol omuz', label: 'Sol omuz' },
  { key: 'sag diz', label: 'Sağ diz' },
  { key: 'sol diz', label: 'Sol diz' },
  { key: 'kalca', label: 'Kalça' },
  { key: 'bel', label: 'Bel' },
  { key: 'boyun', label: 'Boyun' },
];

const SCREENS = ['setup', 'home', 'days', 'history', 'program', 'rpe', 'msi', 'ozet', 'done'];
const WAKE_SCREENS = new Set(['program', 'rpe', 'msi', 'ozet']);

const state = {
  screen: null,
  plan: null,     // { tarih, setler }
  session: null,  // data.saveSession ile saklanan devam eden seans
  wheel: null,
  dates: null,
  datesInfo: {},
  datesAt: 0,       // tarih listesinin sunucudan son alındığı an
  datesLoading: null,
  zst: null,       // zaman.replay önbelleği (her olayda sıfırlanır)
  beep: null,       // { key, marks } — çıkış sesleri bir kez çalsın
  prefs: null,      // data.getPrefs() önbelleği (her karede localStorage okunmasın)
  ticker: null,
  doneTimer: null,
  edit: null,       // şüpheli tekrar düzeltme paneli
  saving: false,
  rpeTimer: null,
  sentDates: new Set(), // bu açılışta kuyruktan gönderilen günler
  selDate: null,    // gün seçiminde seçili gün (YYYY-MM-DD)
  selKeep: false,   // kullanıcı bir gün seçtiyse yenilemede korunur
  weekStart: null,  // gösterilen haftanın pazartesisi
  suppressDayClick: false,
  opening: false,   // program sunucudan yükleniyor (çift dokunmaya karşı)
  homeNext: null,   // ana sayfadaki "İdmanı aç" düğmesinin açacağı gün
};

// ---------------------------------------------------------------------------
// Biçimlendirme
// ---------------------------------------------------------------------------

const pad2 = (n) => String(n).padStart(2, '0');

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function fmtDateTR(key) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${d} ${AYLAR[m - 1]} ${GUNLER[date.getDay()]}`;
}

const fmtNum = (n) => Number(n || 0).toLocaleString('tr-TR');

function fmtHMS(ms) {
  const t = Math.max(0, Math.floor(ms / 1000));
  return `${pad2(Math.floor(t / 3600))}:${pad2(Math.floor(t / 60) % 60)}:${pad2(t % 60)}`;
}

function fmtClock(ms) {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600);
  const mm = pad2(Math.floor(t / 60) % 60);
  return h ? `${h}:${mm}:${pad2(t % 60)}` : `${mm}:${pad2(t % 60)}`;
}

/** Gerçek alanına yazılan süre: "01:23.4" (bir saati aşarsa "1:02:03.4"). */
function fmtLap(ms) {
  const tenths = Math.round(Math.max(0, ms) / 100);
  const s = Math.floor(tenths / 10);
  const h = Math.floor(s / 3600);
  const body = `${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}.${tenths % 10}`;
  return h ? `${h}:${body}` : body;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

/**
 * CSP satır içi style özniteliğine izin vermez: renk ve oranlar HTML'e
 * data-bg / data-grow / data-glow olarak yazılır, burada CSSOM ile uygulanır.
 */
function paint(root) {
  for (const el of root.querySelectorAll('[data-bg],[data-grow]')) {
    if (el.dataset.bg) el.style.background = el.dataset.bg;
    if (el.dataset.grow) el.style.flexGrow = el.dataset.grow;
    if (el.dataset.glow) el.style.setProperty('--g', el.dataset.glow);
  }
  return root;
}

const setDist = (s) => (Number(s.tekrar) || 1) * (Number(s.mesafe) || 0);

// Blok renkleri (Gece Havuzu). ink: rozet/şerit üzerindeki yazı rengi.
const BLOKLAR = {
  WU: { ad: 'Isınma', renk: '#2563EB', ink: '#ffffff' },
  PS: { ad: 'Hazırlık', renk: '#7C3AED', ink: '#ffffff' },
  MS: { ad: 'Ana set', renk: '#F97316', ink: '#1c0a00' },
  AS: { ad: 'Ek set', renk: '#FACC15', ink: '#1f1800' },
  CD: { ad: 'Soğuma', renk: '#14B8A6', ink: '#03201c' },
};
const BLOK_DIGER = { ad: '', renk: '#475569', ink: '#ffffff' };
const blokOf = (s) => BLOKLAR[String(s.blok || '').trim().toUpperCase()] || BLOK_DIGER;

/** "01:30", "1:02:03", "00:22.7" → saniye; boş/geçersiz → 0. */
function parseSec(v) {
  const m = String(v || '').trim().match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?(?:[.,](\d+))?$/);
  if (!m) return 0;
  const frac = m[4] ? Number(`0.${m[4]}`) : 0;
  return m[3] !== undefined
    ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + frac
    : Number(m[1]) * 60 + Number(m[2]) + frac;
}

/** Saniye → "2:30" veya "1:05:00". */
function fmtDur(sec) {
  const t = Math.round(sec);
  const h = Math.floor(t / 3600);
  const mm = Math.floor(t / 60) % 60;
  return h ? `${h}:${pad2(mm)}:${pad2(t % 60)}` : `${mm}:${pad2(t % 60)}`;
}

/** Plan'daki "Set Süre" ile aynı hesap: tekrar × (hedef + dinlen). */
const setTime = (s) => (Number(s.tekrar) || 1) * (parseSec(s.hedef) + parseSec(s.dinlen));

/** Her set için yığımlı mesafe ve süre (program sırasıyla). */
function cumulative(sets) {
  let d = 0;
  let t = 0;
  return sets.map((s) => {
    d += setDist(s);
    t += setTime(s);
    return { dist: d, time: t };
  });
}

function setTitle(s) {
  const tekrar = Number(s.tekrar) || 1;
  const stil = s.stil ? ` ${s.stil}` : '';
  return `${tekrar} × ${s.mesafe}${stil}`;
}

const setKey = (s, i) => (s.sira == null || s.sira === '' ? `i${i}` : String(s.sira));

// ---------------------------------------------------------------------------
// 100 m tempo ve CSS bölgeleri
//
// min: bölgenin alt sınırı, 100 m temposunun CSS'ten farkı (sn). Yavaştan
// hızlıya: Z1 ≥ CSS+15, Z2 CSS+8…+15, Z3 CSS+3…+8, Z4 CSS−2…+3, Z5 < CSS−2.
// Ekipmanlı setlerin temposu ekipmansız bölgelerle karşılaştırılmaz.
// ---------------------------------------------------------------------------

const ZONES = [
  { ad: 'Toparlanma', min: 15 },
  { ad: 'Aerobik', min: 8 },
  { ad: 'Tempo', min: 3 },
  { ad: 'Eşik (CSS)', min: -2 },
  { ad: 'Hız', min: -Infinity },
];

/** Saniye/100 m; mesafe yoksa null. */
const pacePer100 = (sec, mesafe) => (sec > 0 && Number(mesafe) > 0 ? (sec / Number(mesafe)) * 100 : null);

const isEquipped = (set) => Boolean(String(set.alet || '').trim()) || /pull|drill|kick|tekme|ayak/i.test(String(set.tur || ''));

/** { n: 1..5, ad } ya da null (CSS yok / ekipmanlı set). */
/** Tercihler; değişince refreshPrefs() ile tazelenir. */
const prefs = () => state.prefs || (state.prefs = data.getPrefs());
const refreshPrefs = () => { state.prefs = data.getPrefs(); };

function zoneOf(pace, set) {
  const css = prefs().css;
  if (!pace || !css || isEquipped(set)) return null;
  const d = pace - css;
  const i = ZONES.findIndex((z) => d >= z.min);
  return { n: i + 1, ad: ZONES[i].ad };
}

/** "1:35 Z3" gibi: tempo + bölge, bölge renginde. */
function paceHtml(sec, set) {
  const pace = pacePer100(sec, set.mesafe);
  if (!pace) return '';
  const z = zoneOf(pace, set);
  return `<b class="${z ? `zc z${z.n}` : ''}">${fmtDur(pace)}</b><small>/100${z ? ` · Z${z.n}` : ''}</small>`;
}

// ---------------------------------------------------------------------------
// Ekran geçişleri, ekran kilidi, bildirimler
// ---------------------------------------------------------------------------

function show(name) {
  state.screen = name;
  for (const s of SCREENS) $(`screen-${s}`).hidden = s !== name;
  if (WAKE_SCREENS.has(name)) wake.acquire();
  else wake.release();
  if (name !== 'program') stopTicker();
}

const wake = {
  lock: null,
  wanted: false,
  async acquire() {
    this.wanted = true;
    if (!('wakeLock' in navigator) || (this.lock && !this.lock.released)) return;
    try {
      this.lock = await navigator.wakeLock.request('screen');
      this.lock.addEventListener('release', () => { this.lock = null; });
    } catch {
      // Desteklenmiyor veya reddedildi: sessizce devam et.
    }
  },
  release() {
    this.wanted = false;
    if (this.lock) this.lock.release().catch(() => {});
    this.lock = null;
  },
};

let toastTimer = null;
function toast(text, ms = 2600) {
  const el = $('toast');
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, ms);
}

/**
 * Büyük düğmeli diyalog. actions: [{ label, value, cls }].
 * Gövdede data-value taşıyan bir elemana dokunmak da diyaloğu o değerle kapatır.
 */
function modal({ title, body = '', actions = [] }) {
  return new Promise((resolve) => {
    const root = $('modal');
    $('modal-title').textContent = title || '';
    const bodyEl = $('modal-body');
    if (typeof body === 'string') bodyEl.innerHTML = body;
    else bodyEl.replaceChildren(body);
    const actionsEl = $('modal-actions');
    actionsEl.replaceChildren(...actions.map((a) => {
      const b = document.createElement('button');
      b.className = `btn btn-block ${a.cls || ''}`;
      b.textContent = a.label;
      b.dataset.value = String(a.value);
      return b;
    }));
    const values = new Map(actions.map((a) => [String(a.value), a.value]));
    const onClick = (e) => {
      const t = e.target.closest('[data-value]');
      if (!t || !root.contains(t)) return;
      root.removeEventListener('click', onClick);
      root.hidden = true;
      const v = t.dataset.value;
      resolve(values.has(v) ? values.get(v) : v);
    };
    root.addEventListener('click', onClick);
    root.hidden = false;
  });
}

// ---------------------------------------------------------------------------
// Seans durumu
// ---------------------------------------------------------------------------

function newSession(tarih) {
  return { v: 2, tarih, events: [], pos: 0, screen: 'program', form: null, legacy: null };
}

/**
 * Sürüm 9 ve öncesinin seansı (işaretler + kronometre) yeni modele taşınır:
 * işaretli setler "tamamlandı, süre yok" olarak korunur, kaydedilmemiş turlar nota eklenir.
 */
function migrateSession(s) {
  if (s.v === 2) return s;
  const results = JSON.parse(JSON.stringify(s.results || {}));
  const w = s.sw;
  const plan = data.getCachedPlan(s.tarih);
  if (w && Array.isArray(w.laps) && w.laps.length && w.set != null && plan && plan.setler[w.set]) {
    const k = setKey(plan.setler[w.set], w.set);
    const r = results[k] || (results[k] = {});
    const t = `Turlar: ${w.laps.map(fmtLap).join(', ')}`;
    r.not = r.not ? `${r.not} | ${t}` : t;
  }
  return {
    v: 2,
    tarih: s.tarih,
    events: s.startedAt ? [{ t: 'basla', ts: s.startedAt }] : [],
    pos: s.pos || 0,
    screen: 'program',
    form: null,
    legacy: { done: { ...(s.done || {}) }, results },
  };
}

function persist() {
  if (state.session) data.saveSession(state.session);
}

function hasProgress(s) {
  return Boolean(s && ((s.events && s.events.length) || (s.legacy && Object.keys(s.legacy.done || {}).length)));
}

const sessionStarted = (s) => Boolean(s && s.events && s.events.some((e) => e.t === 'basla'));

/** Seansı cihazdan kaldırır. Hata fırlatmaz: kullanıcıyı hiçbir ekranda kilitlememeli. */
function endSessionLocally() {
  const tarih = state.session && state.session.tarih;
  state.session = null;
  state.plan = null;
  state.zst = null;
  // Biten gün listeden kalkar; gün seçimi yeniden en uygun güne otursun.
  state.selDate = null;
  state.selKeep = false;
  data.clearSession();
  try {
    if (tarih) data.forgetDate(tarih);
  } catch (err) {
    console.error(err);
  }
  state.dates = data.getCachedDates();
  state.datesAt = 0; // bir sonraki açılışta sunucudan yeniden alınır
}

// ---------------------------------------------------------------------------
// Kurulum
// ---------------------------------------------------------------------------

function showSetup(canGoBack) {
  const c = data.getConfig();
  const configured = data.isConfigured();
  $('setup-url').value = c.apiUrl;
  $('setup-token').value = c.token;
  $('setup-back').hidden = !canGoBack;
  $('setup-msg').hidden = true;
  $('setup-title').textContent = configured ? 'Ayarlar' : 'Kurulum';
  $('setup-forget').hidden = !configured;
  $('setup-prefs').hidden = !configured;
  renderPrefs();
  show('setup');
}

/** Web uygulaması adresi: script.google.com/…/exec (Workspace hesapları: /a/macros/alan/s/…). */
const EXEC_URL = /^https:\/\/script\.google\.com\/(?:a\/macros\/[^/]+\/|macros\/)s\/[\w-]+\/exec\/?$/;

async function saveSetup() {
  const apiUrl = $('setup-url').value.trim();
  const token = $('setup-token').value.trim();
  const msg = $('setup-msg');
  const fail = (text) => {
    msg.textContent = text;
    msg.hidden = false;
  };
  if (/\/dev\/?$/.test(apiUrl)) return fail('Bu bir test (/dev) adresi. "Dağıtımları yönet"ten /exec ile biten adresi kopyalayın.');
  if (!EXEC_URL.test(apiUrl)) return fail('Adres https://script.google.com/macros/s/…/exec biçiminde olmalı.');
  if (!token) return fail('Anahtar boş olmamalı.');
  data.setConfig({ apiUrl, token });
  const btn = $('setup-save');
  btn.disabled = true;
  btn.textContent = 'Bağlanıyor…';
  try {
    const r = await data.getDates();
    state.dates = r.dates;
    state.datesAt = Date.now();
    state.datesInfo = { offline: r.fromCache };
    showHome();
  } catch (err) {
    fail(err.code === 'AUTH'
      ? 'Anahtar hatalı. Script Properties\'teki TOKEN ile aynı olmalı.'
      : `Bağlanılamadı: ${err.message} Ayarlar kaydedildi; sol üstten ana sayfaya geçebilirsiniz.`);
    $('setup-back').hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Kaydet ve bağlan';
  }
}

async function forgetKey() {
  const ok = await modal({
    title: 'Anahtar unutulsun mu?',
    body: '<p>Apps Script adresi ve anahtar bu telefondan silinir; yeniden girmeden tabloya bağlanılamaz.</p><p class="muted">Yapılmış idmanlar ve gönderilmeyi bekleyen kayıtlar silinmez.</p>',
    actions: [{ label: 'Evet, unut', value: true, cls: 'btn-danger' }, { label: 'Vazgeç', value: false }],
  });
  if (!ok) return;
  data.clearConfig();
  state.dates = null;
  state.datesAt = 0;
  showSetup(false);
  toast('Adres ve anahtar silindi.');
}

// --- Tercihler: çıkış sesi ve CSS temposu -----------------------------------

function renderPrefs() {
  refreshPrefs();
  const p = prefs();
  for (const b of $('pref-ses').children) b.classList.toggle('is-on', (b.dataset.v === '1') === p.ses);
  if (document.activeElement !== $('pref-css')) $('pref-css').value = p.css ? fmtDur(p.css) : '';
  $('pref-zones').innerHTML = p.css
    ? ZONES.map((z, i) => {
      const hi = i === 0 ? '' : fmtDur(p.css + ZONES[i - 1].min);
      const lo = z.min === -Infinity ? '' : fmtDur(p.css + z.min);
      const range = !hi ? `${lo} ve üstü` : !lo ? `${hi} altı` : `${lo} – ${hi}`;
      return `<div class="zone z${i + 1}"><b>Z${i + 1}</b><span>${z.ad}</span><em>${range}</em></div>`;
    }).join('')
    : '';
}

function onPrefsClick(e) {
  const b = e.target.closest('#pref-ses button[data-v]');
  if (b) {
    data.setPrefs({ ses: b.dataset.v === '1' });
    renderPrefs();
    if (b.dataset.v === '1') audio.unlock();
  }
}

function onCssChange() {
  const v = $('pref-css').value.trim();
  if (!v) {
    data.setPrefs({ css: null });
  } else {
    const sec = parseSec(v);
    if (!sec || sec < 40 || sec > 300) {
      toast('CSS dd:ss biçiminde olmalı (ör. 1:57).');
      return;
    }
    data.setPrefs({ css: sec });
    $('pref-css').value = fmtDur(sec);
  }
  renderPrefs();
}

// ---------------------------------------------------------------------------
// Gün seçimi: hafta takvimi
//
// Üstte haftanın 7 günü; sağa/sola kaydırınca hafta değişir. Bir güne (ya da
// alttaki gün satırlarına) dokunmak yalnızca seçer; idmana yalnızca alttaki
// "… idmanını aç" düğmesiyle girilir.
// ---------------------------------------------------------------------------

const AY_KISA = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const GUN_KISA = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

const parseKey = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const keyOf = (dt) => `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
const addDays = (k, n) => {
  const dt = parseKey(k);
  dt.setDate(dt.getDate() + n);
  return keyOf(dt);
};
/** Haftanın pazartesisi. */
const mondayOf = (k) => addDays(k, -((parseKey(k).getDay() + 6) % 7));

/**
 * Tarih listesini sunucudan tazeler (son 30 sn içinde alındıysa force olmadan
 * tekrar istemez). Liste gönderimi beklemez; kuyrukta olan veya az önce
 * gönderilen günler visibleDates() ile gizlenir.
 */
function loadDates(force = false) {
  if (!state.dates) state.dates = data.getCachedDates();
  if (state.datesLoading) return state.datesLoading;
  if (!force && state.datesAt && Date.now() - state.datesAt < 30000) return Promise.resolve();
  state.datesInfo = { loading: true };
  rerenderDates();
  flushQueue();
  state.datesLoading = (async () => {
    try {
      const r = await data.getDates();
      state.dates = r.dates;
      state.datesInfo = { offline: r.fromCache };
      state.datesAt = Date.now();
      if (!r.fromCache) prefetchPlans();
    } catch (err) {
      state.datesInfo = { error: err };
    } finally {
      state.datesLoading = null;
    }
    rerenderDates();
  })();
  return state.datesLoading;
}

function rerenderDates() {
  if (state.screen === 'days') renderDays();
  else if (state.screen === 'home') renderHome();
}

function showDays(force = false) {
  show('days');
  if (!state.dates) state.dates = data.getCachedDates();
  renderDays();
  return loadDates(force);
}

/** Kuyrukta bekleyen (kaydedilmiş ama gönderilmemiş) günler listede görünmez. */
function visibleDates() {
  const hidden = new Set([...data.getQueue().map((q) => q.payload.tarih), ...state.sentDates]);
  return (state.dates || []).filter((d) => !hidden.has(d.tarih));
}

/** Seçim yoksa bugün; bugün plan yoksa en yakın planlı gün (önce ileri). */
function ensureSelection(byDate) {
  const today = todayKey();
  if (state.selDate && (byDate.has(state.selDate) || state.selKeep)) return;
  const keys = [...byDate.keys()].sort();
  let pick = today;
  if (!byDate.has(today) && keys.length) {
    pick = keys.find((k) => k >= today) || keys[keys.length - 1];
  }
  state.selDate = pick;
  state.weekStart = mondayOf(pick);
}

/** Gün kartı önizlemesi için setler: sunucudan (yeni Code.gs) ya da cihazdaki programdan. */
function previewSets(d) {
  if (d && Array.isArray(d.setler) && d.setler.length) return d.setler;
  const plan = d && data.getCachedPlan(d.tarih);
  if (!plan) return null;
  return plan.setler.map((s) => ({ blok: s.blok, mesafe: setDist(s), sure: setTime(s) }));
}

function hedefSureOf(d) {
  if (d && d.hedefSure) return d.hedefSure;
  const sets = previewSets(d);
  return sets ? sets.reduce((a, s) => a + (s.sure || 0), 0) : 0;
}

const blokRenk = (b) => blokOf({ blok: b }).renk;

/** Günün programı küçük bir metro hattı olarak (blok renginde, mesafeye oranlı). */
function metroSvg(sets) {
  const W = 360;
  const tot = sets.reduce((a, s) => a + Math.max(1, s.mesafe || 0), 0) || 1;
  let x = 0;
  const segs = [];
  const dots = [];
  for (const s of sets) {
    const w = (W * Math.max(1, s.mesafe || 0)) / tot;
    const c = blokRenk(s.blok);
    segs.push(`<line x1="${(x + 2).toFixed(1)}" y1="14" x2="${(x + w - 2).toFixed(1)}" y2="14" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`);
    dots.push(`<circle cx="${(x + w / 2).toFixed(1)}" cy="14" r="6.5" fill="#141B23" stroke="${c}" stroke-width="3.5"/>`);
    x += w;
  }
  return `<svg class="metro" viewBox="0 0 ${W} 28" preserveAspectRatio="none" aria-hidden="true">${segs.join('')}${dots.join('')}</svg>`;
}

// Seçili olmayan günler renksiz: blok başına gri tonu (ana set en açık,
// ısınma/soğuma en koyu) ki yapı renk olmadan da okunsun.
const BLOK_GRI = { MS: '#C9D2DB', AS: '#9BA7B3', PS: '#76828F', WU: '#4F5B67', CD: '#4F5B67' };
const blokGri = (b) => BLOK_GRI[String(b || '').trim().toUpperCase()] || '#65717D';

function miniBar(sets, gray = false) {
  const color = gray ? blokGri : blokRenk;
  return `<div class="mini-bar">${sets.map((s) => `<i data-grow="${Math.max(1, s.mesafe || 0)}" data-bg="${color(s.blok)}"></i>`).join('')}</div>`;
}

function renderBanners() {
  const info = state.datesInfo;
  const banners = [];
  const s = state.session;
  if (s) {
    banners.push(`
      <div class="banner banner-live">
        <div><strong>Devam eden seans</strong><br>${esc(fmtDateTR(s.tarih))}${sessionStarted(s) ? ' · başladı' : ''}</div>
        <div class="banner-actions">
          <button class="btn btn-primary" data-act="resume">Devam et</button>
          <button class="btn btn-ghost" data-act="discard">Sil</button>
        </div>
      </div>`);
  }
  const queue = data.getQueue();
  if (queue.length) {
    const err = queue.find((q) => q.lastError);
    banners.push(`
      <div class="banner banner-warn">
        <div><strong>Gönderilmeyi bekleyen ${queue.length} kayıt</strong><br>
          ${esc(queue.map((q) => fmtDateTR(q.payload.tarih)).join(', '))}
          ${err ? `<br><small>Son hata: ${esc(err.lastError.message || err.lastError.code)}</small>` : ''}
        </div>
        <div class="banner-actions">
          <button class="btn btn-primary" data-act="flush">Şimdi dene</button>
          <button class="btn btn-ghost" data-act="queue-manage">Yönet</button>
        </div>
      </div>`);
  }
  if (info.offline) {
    banners.push('<div class="banner">Çevrimdışı — son yüklenen liste gösteriliyor.</div>');
  } else if (info.error) {
    banners.push(`<div class="banner banner-err">${esc(info.error.message)}${info.error.code === 'AUTH' ? ' Ayarlardan anahtarı kontrol edin.' : ''}</div>`);
  }
  $('days-banners').innerHTML = banners.join('');
}

function renderDays() {
  const today = todayKey();
  const info = state.datesInfo;
  const dates = visibleDates();
  const byDate = new Map(dates.map((d) => [d.tarih, d]));
  renderBanners();

  if (!state.dates && info.loading) {
    $('wk').hidden = true;
    $('days-hero').innerHTML = '';
    $('days-list').innerHTML = '<p class="empty">Yükleniyor…</p>';
    $('days-today-bar').hidden = true;
    return;
  }
  $('wk').hidden = false;
  ensureSelection(byDate);
  const ws = state.weekStart;

  // Hafta başlığı ve özeti
  const weekKeys = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  const we = weekKeys[6];
  const isThisWeek = ws === mondayOf(today);
  const a = parseKey(ws);
  const b = parseKey(we);
  $('wk-title').textContent = isThisWeek ? 'Bu hafta'
    : `${a.getDate()} ${AY_KISA[a.getMonth()]} – ${b.getDate()} ${AY_KISA[b.getMonth()]}`;
  $('wk-today').hidden = isThisWeek && state.selDate === today;
  const planned = weekKeys.filter((k) => byDate.has(k));
  const weekM = planned.reduce((acc, k) => acc + (byDate.get(k).toplamMesafe || 0), 0);
  $('wk-sum').textContent = planned.length ? `${planned.length} idman · ${fmtNum(weekM)} m` : 'Plan yok';

  // Günler
  $('wk-track').innerHTML = weekKeys.map((k) => {
    const dt = parseKey(k);
    const cls = ['wd'];
    if (k === state.selDate) cls.push('on');
    if (k === today) cls.push('today');
    if (byDate.has(k)) cls.push('has');
    if (k < today) cls.push('past');
    return `<button class="${cls.join(' ')}" data-day="${k}" aria-label="${esc(fmtDateTR(k))}">
      <small>${GUN_KISA[dt.getDay()]}</small><b>${dt.getDate()}</b><i></i></button>`;
  }).join('');

  // Seçili günün kartı
  const sel = state.selDate;
  const d = byDate.get(sel);
  const selDt = parseKey(sel);
  const s = state.session;
  if (d) {
    const sets = previewSets(d);
    const hs = hedefSureOf(d);
    const ms = sets ? sets.filter((x) => String(x.blok).trim().toUpperCase() === 'MS').reduce((acc, x) => acc + (x.mesafe || 0), 0) : 0;
    const pill = sel === today ? '● BUGÜN' : (sel < today ? 'GEÇMİŞ PLAN' : GUNLER[selDt.getDay()].toLocaleUpperCase('tr'));
    $('days-hero').innerHTML = `
      <div class="hero${sel < today ? ' is-past' : ''}">
        <div class="hero-top"><span class="hero-pill">${pill}</span>${s && s.tarih === sel ? '<span class="hero-live">DEVAM EDİYOR</span>' : ''}${hs ? `<span class="hero-time">${fmtDur(hs)} hedef</span>` : ''}</div>
        <div class="hero-date">${selDt.getDate()} ${AYLAR[selDt.getMonth()]} <span>${GUNLER[selDt.getDay()]}</span></div>
        ${sets ? metroSvg(sets) : ''}
        <div class="hero-stats">
          <div><span class="lbl">SET</span><b>${d.setSayisi}</b></div>
          <div><span class="lbl">MESAFE</span><b>${fmtNum(d.toplamMesafe)}</b></div>
          <div><span class="lbl">ANA SET</span><b class="ms">${ms ? fmtNum(ms) : '—'}</b></div>
        </div>
      </div>`;
  } else {
    $('days-hero').innerHTML = `
      <div class="hero is-empty">
        <div class="hero-date">${selDt.getDate()} ${AYLAR[selDt.getMonth()]} <span>${GUNLER[selDt.getDay()]}</span></div>
        <p>Bu gün için plan yok.</p>
      </div>`;
  }

  // Haftanın diğer planlı günleri (dokunmak seçer)
  const others = planned.filter((k) => k !== sel);
  let list = others.map((k) => {
    const x = byDate.get(k);
    const dt = parseKey(k);
    const sets = previewSets(x);
    const hs = hedefSureOf(x);
    return `
      <button class="day-row${k < today ? ' is-past' : ''}" data-tarih="${k}">
        <span class="dr-date"><b>${dt.getDate()}</b><small>${AY_KISA[dt.getMonth()].toLocaleUpperCase('tr')}</small></span>
        <span class="dr-info">
          <span class="dr-name">${GUNLER[dt.getDay()]}${k === today ? ' · Bugün' : ''}</span>
          <span class="dr-meta">${x.setSayisi} set · ${fmtNum(x.toplamMesafe)} m${hs ? ` · ${fmtDur(hs)}` : ''}</span>
          ${sets ? miniBar(sets, true) : ''}
        </span>
      </button>`;
  }).join('');
  if (!dates.length) {
    list = `
      <div class="empty">
        <p>Planlanmış idman yok</p>
        <button class="btn btn-primary" data-act="refresh">Yenile</button>
      </div>`;
  }
  $('days-list').innerHTML = list;
  paint($('days-list'));

  // Alt düğme: yalnızca seçili günün planı varsa
  $('days-today-bar').hidden = !d;
  if (d) {
    $('days-cta-text').textContent = s && s.tarih === sel ? 'Seansa devam et'
      : (sel === today ? 'Bugünün idmanını aç' : `${selDt.getDate()} ${AYLAR[selDt.getMonth()]} idmanını aç`);
  }
}

function selectDay(k, keepWeek = true) {
  state.selDate = k;
  state.selKeep = true;
  if (!keepWeek || mondayOf(k) !== state.weekStart) state.weekStart = mondayOf(k);
  renderDays();
}

function shiftWeek(dir) {
  const track = $('wk-track');
  state.weekStart = addDays(state.weekStart, dir * 7);
  // Yeni haftada planlı bir gün varsa onu, yoksa aynı hafta gününü seç.
  const byDate = new Set(visibleDates().map((d) => d.tarih));
  const weekKeys = Array.from({ length: 7 }, (_, i) => addDays(state.weekStart, i));
  const today = todayKey();
  state.selDate = weekKeys.includes(today) ? today
    : (weekKeys.find((k) => byDate.has(k)) || addDays(state.selDate, dir * 7));
  state.selKeep = true;
  renderDays();
  // Kayma animasyonu
  track.style.transition = 'none';
  track.style.transform = `translateX(${dir * 40}%)`;
  track.style.opacity = '0.3';
  requestAnimationFrame(() => {
    track.style.transition = 'transform 0.28s ease-out, opacity 0.28s';
    track.style.transform = 'translateX(0)';
    track.style.opacity = '1';
  });
}

/** Hafta şeridi: yatay kaydırma haftayı değiştirir, dokunma günü seçer. */
function wireWeekSwipe() {
  const el = $('wk');
  let g = null;
  el.addEventListener('pointerdown', (e) => {
    g = { x: e.clientX, y: e.clientY, id: e.pointerId, dx: 0, swiping: false };
  });
  el.addEventListener('pointermove', (e) => {
    if (!g || e.pointerId !== g.id) return;
    g.dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.swiping && Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(dy)) g.swiping = true;
    if (g.swiping) {
      const t = $('wk-track');
      t.style.transition = 'none';
      t.style.transform = `translateX(${g.dx * 0.6}px)`;
    }
  });
  const end = (e) => {
    if (!g || e.pointerId !== g.id) return;
    const { dx, swiping } = g;
    g = null;
    const t = $('wk-track');
    if (swiping && Math.abs(dx) > 50) {
      state.suppressDayClick = true;
      shiftWeek(dx < 0 ? 1 : -1);
    } else {
      if (swiping) state.suppressDayClick = true;
      t.style.transition = 'transform 0.2s';
      t.style.transform = 'translateX(0)';
    }
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener('click', (e) => {
    if (state.suppressDayClick) {
      state.suppressDayClick = false;
      return;
    }
    const b = e.target.closest('[data-day]');
    if (b) selectDay(b.dataset.day);
  });
}

async function onDaysClick(e) {
  const row = e.target.closest('[data-tarih]');
  if (row) return selectDay(row.dataset.tarih);
  const act = e.target.closest('[data-act]');
  if (!act) return;
  switch (act.dataset.act) {
    case 'refresh':
      return showDays(true);
    case 'resume':
      return resumeSession();
    case 'discard': {
      const ok = await modal({
        title: 'Seans silinsin mi?',
        body: '<p>Bu seansın işaretleri ve süresi silinecek, hiçbir yere kaydedilmeyecek.</p>',
        actions: [{ label: 'Evet, sil', value: true, cls: 'btn-danger' }, { label: 'Vazgeç', value: false }],
      });
      if (ok) {
        data.clearSession();
        state.session = null;
        state.plan = null;
        renderDays();
      }
      return;
    }
    case 'flush':
      return flushQueue(true);
    case 'queue-manage':
      return manageQueue();
  }
}

async function manageQueue() {
  const queue = data.getQueue();
  const body = document.createElement('div');
  body.className = 'pick-list';
  body.innerHTML = queue.map((q) => `
    <button class="pick" data-value="${esc(q.id)}">
      <strong>${esc(fmtDateTR(q.payload.tarih))}</strong>
      <small>${q.lastError ? esc(q.lastError.message || q.lastError.code) : 'Henüz denenmedi'} · Silmek için dokun</small>
    </button>`).join('');
  const id = await modal({ title: 'Bekleyen kayıtlar', body, actions: [{ label: 'Kapat', value: '' }] });
  if (!id) return;
  const ok = await modal({
    title: 'Kayıt silinsin mi?',
    body: '<p>Bu seans hiçbir zaman tabloya gönderilmeyecek.</p>',
    actions: [{ label: 'Evet, sil', value: true, cls: 'btn-danger' }, { label: 'Vazgeç', value: false }],
  });
  if (ok) data.removeFromQueue(id);
  renderDays();
}

async function flushQueue(verbose = false) {
  if (!data.getQueue().length) return;
  let r;
  try {
    r = await data.flushQueue();
  } catch (err) {
    if (verbose) toast(`Gönderilemedi: ${err.message}`, 4000);
    rerenderDates();
    return;
  }
  const sent = [...r.sent, ...r.duplicates];
  for (const x of sent) state.sentDates.add(x.tarih);
  if (sent.length) toast(`Bekleyen kayıt gönderildi: ${sent.map((x) => fmtDateTR(x.tarih)).join(', ')}`, 4000);
  else if (verbose && r.remaining) toast('Hâlâ gönderilemedi. Bağlantı gelince tekrar denenecek.');
  if (state.screen === 'history') renderHistory();
  else rerenderDates();
}

// ---------------------------------------------------------------------------
// Ana sayfa: Yüzme / Salon
// ---------------------------------------------------------------------------

function showHome() {
  show('home');
  renderHome();
  loadDates();
}

function renderHome() {
  const now = new Date();
  const today = todayKey();
  $('home-date').textContent = `${GUNLER[now.getDay()]}, ${now.getDate()} ${AYLAR[now.getMonth()]}`;

  // Yüzme kartı: ilk planlı idman (ya da devam eden seans) ve iki düğme: İdmanı aç · Takvim.
  let when = '';
  let meta = '';
  let sets = null;
  let open = '';
  state.homeNext = null;
  const s = state.session;
  const whenOf = (k) => {
    const dt = parseKey(k);
    const date = `${GUNLER[dt.getDay()]} ${dt.getDate()} ${AYLAR[dt.getMonth()]}`;
    if (k === today) return `Bugün <span>· ${date}</span>`;
    if (k === addDays(today, 1)) return `Yarın <span>· ${date}</span>`;
    return `${GUNLER[dt.getDay()]} <span>· ${dt.getDate()} ${AYLAR[dt.getMonth()]}</span>`;
  };
  const metaOf = (d, list) => {
    const hs = hedefSureOf(d);
    const ms = list ? list.filter((x) => String(x.blok).trim().toUpperCase() === 'MS').reduce((acc, x) => acc + (x.mesafe || 0), 0) : 0;
    return `${d.setSayisi} set · ${fmtNum(d.toplamMesafe)} m${hs ? ` · ${fmtDur(hs)}` : ''}${ms ? ` · ana set ${fmtNum(ms)} m` : ''}`;
  };
  if (s) {
    const plan = state.plan || data.getCachedPlan(s.tarih);
    when = `${whenOf(s.tarih)} <em>DEVAM EDİYOR</em>`;
    if (plan) {
      sets = plan.setler.map((x) => ({ blok: x.blok, mesafe: setDist(x) }));
      meta = `${plan.setler.length} set · ${fmtNum(sets.reduce((a, x) => a + x.mesafe, 0))} m${sessionStarted(s) ? ' · başladı' : ''}`;
    }
    open = 'Seansa devam et';
  } else if (!state.dates && state.datesInfo.loading) {
    meta = 'Yükleniyor…';
  } else if (!state.dates && state.datesInfo.error) {
    when = 'Bağlantı yok';
    meta = state.datesInfo.error.message;
  } else {
    const next = visibleDates().filter((d) => d.tarih >= today).sort((a, b) => (a.tarih < b.tarih ? -1 : 1))[0];
    if (next) {
      sets = previewSets(next);
      when = whenOf(next.tarih);
      meta = metaOf(next, sets);
      open = 'İdmanı aç';
      state.homeNext = next.tarih;
    } else {
      when = 'Planlanmış idman yok';
    }
  }
  $('home-swim-tag').innerHTML = when;
  $('home-swim-metro').innerHTML = sets ? metroSvg(sets) : '';
  $('home-swim-meta').textContent = meta;
  $('home-open').hidden = !open;
  $('home-open-text').textContent = open || 'İdmanı aç';

  const n = data.getHistory().length;
  const q = data.getQueue().length;
  $('home-history-meta').textContent = (n ? `${n} kayıt` : 'Henüz kayıt yok') + (q ? ` · ${q} gönderilmeyi bekliyor` : '');
}

// ---------------------------------------------------------------------------
// Telefonda yapılmış idmanlar
//
// Biten seanslar telefonda otomatik silinmez; yalnızca buradan elle silinir.
// Buradan silmek ne tabloyu ne de gönderim kuyruğunu etkiler.
// ---------------------------------------------------------------------------

const DURUM = {
  sent: { ad: 'Tabloda', cls: 'ok' },
  duplicate: { ad: 'Zaten kayıtlıydı', cls: 'dim' },
  queued: { ad: 'Kuyrukta', cls: 'warn' },
  lost: { ad: 'Gönderilmedi', cls: 'err' },
};

/** Kaydın güncel durumu: kuyrukta mı, gönderildi mi? */
function historyStatus(rec, queued) {
  if (queued.has(rec.tarih)) return 'queued';
  if (rec.status === 'queued') return 'lost'; // kuyruktan elle silinmiş
  return DURUM[rec.status] ? rec.status : 'sent';
}

const queuedDates = () => new Set(data.getQueue().map((q) => q.payload.tarih));

function showHistory() {
  show('history');
  renderHistory();
}

function renderHistory() {
  const list = data.getHistory();
  const queued = queuedDates();
  $('hist-bar').hidden = !list.length;
  if (!list.length) {
    $('hist-list').innerHTML = '<p class="empty">Henüz kayıt yok</p>';
    return;
  }
  $('hist-list').innerHTML = list.map((r) => {
    const dt = parseKey(r.tarih);
    const st = DURUM[historyStatus(r, queued)];
    const done = r.setler.filter((x) => x.tamamlandi);
    const mesafe = r.seans && r.seans.mesafe !== '' && r.seans.mesafe != null ? Number(r.seans.mesafe) : done.reduce((a, x) => a + setDist(x), 0);
    const sure = r.seans && parseSec(r.seans.sure) ? fmtDur(parseSec(r.seans.sure)) : '';
    return `
      <button class="day-row hist-row" data-hist="${esc(r.id)}">
        <span class="dr-date"><b>${dt.getDate()}</b><small>${AY_KISA[dt.getMonth()].toLocaleUpperCase('tr')}</small></span>
        <span class="dr-info">
          <span class="dr-name">${GUNLER[dt.getDay()]} <em class="chip ${st.cls}">${st.ad}</em></span>
          <span class="dr-meta">${done.length}/${r.setler.length} set · ${fmtNum(mesafe)} m${sure ? ` · ${esc(sure)}` : ''}</span>
          ${miniBar(done.map((x) => ({ blok: x.blok, mesafe: setDist(x) })))}
        </span>
      </button>`;
  }).join('');
  paint($('hist-list'));
}

function historyDetail(r) {
  const s = r.seans || {};
  const facts = [
    s.sure ? `Süre ${esc(s.sure)}` : '',
    s.mesafe !== '' && s.mesafe != null ? `${fmtNum(s.mesafe)} m` : '',
    s.havuz ? `Havuz ${esc(s.havuz)} m` : '',
    s.rpe !== '' && s.rpe != null ? `RPE ${esc(s.rpe)}` : '',
  ].filter(Boolean).join(' · ');
  const sets = r.setler.map((x) => `
    <div class="hd-set${x.tamamlandi ? '' : ' is-skip'}">
      <i data-bg="${blokRenk(x.blok)}"></i>
      <span><b>${x.tamamlandi ? '✓ ' : ''}${esc([setTitle(x), x.tur].filter(Boolean).join(' '))}</b>
      ${x.gercek ? `<small>Gerçek ${esc(x.gercek)}${x.hedef ? ` · Hedef ${esc(x.hedef)}` : ''}</small>` : ''}
      ${x.not ? `<small>${esc(x.not)}</small>` : ''}</span>
    </div>`).join('');
  const body = document.createElement('div');
  body.className = 'hd';
  body.innerHTML = `
    ${facts ? `<p>${facts}</p>` : ''}
    ${s.msi ? `<p class="muted">MSI: ${esc(s.msi)}</p>` : ''}
    ${s.aciklama ? `<p>${esc(s.aciklama)}</p>` : ''}
    <div class="hd-sets">${sets}</div>`;
  return paint(body);
}

async function onHistoryClick(e) {
  const row = e.target.closest('[data-hist]');
  if (!row) return;
  const rec = data.getHistory().find((x) => x.id === row.dataset.hist);
  if (!rec) return renderHistory();
  const act = await modal({
    title: fmtDateTR(rec.tarih),
    body: historyDetail(rec),
    actions: [{ label: 'Bu kaydı sil', value: 'del', cls: 'btn-danger' }, { label: 'Kapat', value: '' }],
  });
  if (act !== 'del') return;
  const pending = queuedDates().has(rec.tarih);
  const ok = await modal({
    title: pending ? 'Henüz gönderilmedi' : 'Kayıt silinsin mi?',
    body: pending
      ? '<p>Bu seans tabloya henüz gönderilmedi. Telefondaki kopyası silinir; gönderim kuyruğu etkilenmez, bağlantı gelince yine gönderilir.</p>'
      : '<p>Telefondaki kopya silinir. Tablodaki kayıt etkilenmez.</p>',
    actions: [{ label: 'Evet, sil', value: true, cls: 'btn-danger' }, { label: 'Vazgeç', value: false }],
  });
  if (ok) data.removeHistory([rec.id]);
  renderHistory();
}

async function clearHistory() {
  const list = data.getHistory();
  const queued = queuedDates();
  const sent = list.filter((r) => ['sent', 'duplicate'].includes(historyStatus(r, queued)));
  const pending = list.filter((r) => queued.has(r.tarih));
  const actions = [];
  if (sent.length && sent.length < list.length) actions.push({ label: `Tabloya gidenleri sil (${sent.length})`, value: 'sent', cls: 'btn-danger' });
  actions.push({ label: `Tümünü sil (${list.length})`, value: 'all', cls: 'btn-danger' }, { label: 'Vazgeç', value: '' });
  const pick = await modal({
    title: 'Kayıtları sil',
    body: '<p>Yalnızca bu telefondaki kopyalar silinir; tablodaki kayıtlar etkilenmez.</p>',
    actions,
  });
  if (!pick) return;
  if (pick === 'all' && pending.length) {
    const ok = await modal({
      title: 'Gönderilmemiş kayıt var',
      body: `<p>${pending.length} seans henüz tabloya gönderilmedi (${esc(pending.map((r) => fmtDateTR(r.tarih)).join(', '))}). Telefondaki kopyaları silinir; gönderim kuyruğu etkilenmez.</p>`,
      actions: [{ label: 'Yine de sil', value: true, cls: 'btn-danger' }, { label: 'Vazgeç', value: false }],
    });
    if (!ok) return;
  }
  data.removeHistory((pick === 'all' ? list : sent).map((r) => r.id));
  renderHistory();
}

async function openDate(tarih) {
  if (state.session && state.session.tarih === tarih && state.plan) return resumeSession();
  if (state.session && hasProgress(state.session)) {
    const ok = await modal({
      title: 'Devam eden seans var',
      body: `<p>${esc(fmtDateTR(state.session.tarih))} seansı kaydedilmedi. Yeni güne geçersen silinecek.</p>`,
      actions: [{ label: 'Sil ve geç', value: true, cls: 'btn-danger' }, { label: 'Vazgeç', value: false }],
    });
    if (!ok) return;
  }

  // Program önbellekteyse (tarih listesiyle gelir) beklemeden açılır;
  // sunucudaki güncel hali arka planda kontrol edilir.
  const cached = data.getCachedPlan(tarih);
  if (cached && cached.setler.length) {
    startSession(tarih, cached);
    refreshPlan(tarih);
    return;
  }

  if (state.opening) return; // çift dokunma
  state.opening = true;
  toast('Program yükleniyor…', 30000);
  let r;
  try {
    r = await data.getPlan(tarih);
  } catch (err) {
    toast(`Program yüklenemedi: ${err.message}`, 4000);
    return;
  } finally {
    state.opening = false;
  }
  $('toast').hidden = true;

  if (!r.plan.setler || !r.plan.setler.length) {
    await modal({
      title: 'Set bulunamadı',
      body: `<p>${esc(fmtDateTR(tarih))} için Plan sayfasında satır yok.</p>`,
      actions: [{ label: 'Tamam', value: true }],
    });
    return showDays();
  }

  startSession(tarih, r.plan);
  if (r.fromCache) toast('Çevrimdışı: son yüklenen program gösteriliyor.');
}

function startSession(tarih, plan) {
  state.plan = { ...plan, tarih };
  state.session = newSession(tarih);
  persist();
  openProgram();
}

/**
 * Önbellekten açılan programın sunucudaki halini kontrol eder. Program
 * değişmişse ve seansa henüz başlanmadıysa (işaret, süre yok) yenisiyle
 * değiştirilir; başlanmışsa seans boyunca eldeki program korunur.
 */
async function refreshPlan(tarih) {
  let fresh;
  try {
    fresh = await data.fetchPlan(tarih);
  } catch {
    return; // çevrimdışı: önbellekteki program yeterli
  }
  const s = state.session;
  if (!s || s.tarih !== tarih || !state.plan) return;
  if (!fresh.setler.length || JSON.stringify(fresh.setler) === JSON.stringify(state.plan.setler)) return;
  if (hasProgress(s)) return;
  data.storePlan({ ...fresh, tarih });
  state.plan = { ...fresh, tarih };
  s.pos = 0;
  persist();
  if (state.screen === 'program') openProgram();
  toast('Program tablodan güncellendi.');
}

/**
 * Eski Code.gs tarih listesiyle programları göndermez: yaklaşan ilk birkaç
 * günün programı arka planda indirilir ki açılışta beklenmesin.
 */
async function prefetchPlans() {
  const today = todayKey();
  const upcoming = visibleDates().filter((d) => d.tarih >= today && !data.getCachedPlan(d.tarih)).slice(0, 3);
  for (const d of upcoming) {
    try {
      await data.getPlan(d.tarih);
    } catch {
      return;
    }
  }
}

function resumeSession() {
  const s = state.session || data.loadSession();
  const plan = s && data.getCachedPlan(s.tarih);
  if (!s || !plan) {
    data.clearSession();
    state.session = null;
    return showDays();
  }
  state.session = migrateSession(s);
  state.plan = plan;
  state.zst = null;
  persist();
  if (state.session.screen === 'rpe' && zst().phase === 'done') return openRpe();
  if (state.session.screen === 'msi' && zst().phase === 'done') { ensureForm(); return openMsi(); }
  if (state.session.screen === 'ozet' && zst().phase === 'done') { ensureForm(); return openOzet(); }
  if (zst().phase === 'done') return openRpe();
  return openProgram();
}

// ---------------------------------------------------------------------------
// İdman ekranı (ZAMANLAMA.md)
//
// Tek büyük düğme: YÜZ → DUR → YÜZ … (ilk YÜZ idmanı da başlatır). Her dokunuş yalnızca
// bir olay (zaman damgası) ekler; durum ve süreler zaman.js ile olay
// listesinden hesaplanır. Setin son DUR'u seti, son setin son DUR'u
// idmanı bitirir. Geri al son olayı siler.
// ---------------------------------------------------------------------------

const hexA = (hex, a) => {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
};

const GUARD_MS = 2000;  // geçişten sonra ikinci dokunuş yok sayılır
const UNDO_MS = 5000;   // Geri al bu süre görünür

const ev = () => state.session.events;
const zst = () => state.zst || (state.zst = zaman.replay(ev(), state.plan.setler));
const tekrarOf = (s) => Number(s.tekrar) || 1;
const legacyDone = (i) => {
  const L = state.session.legacy;
  return Boolean(L && L.done && L.done[setKey(state.plan.setler[i], i)]);
};

/** 'bekliyor' | 'suruyor' | 'tamam' | 'eksik' (eski sürümden gelen işaretli setler 'tamam'). */
function statusOf(i) {
  const st = zst();
  if (!st.per[i].reps.length && legacyDone(i)) return 'tamam';
  return zaman.setStatus(st, i, tekrarOf(state.plan.setler[i]));
}

/** from'dan sonraki ilk başlanmamış set (baştan sarar); yoksa -1. */
function nextOpenSet(from) {
  const n = state.plan.setler.length;
  for (let k = 1; k <= n; k++) {
    const j = (from + k) % n;
    if (statusOf(j) === 'bekliyor') return j;
  }
  return -1;
}

function sessionDistance() {
  const st = zst();
  let d = zaman.doneDistance(st, state.plan.setler);
  state.plan.setler.forEach((s, i) => { if (!st.per[i].reps.length && legacyDone(i)) d += setDist(s); });
  return d;
}

const fmtShort = (ms) => fmtDur(Math.round(ms / 1000));
/** Ekrandaki ortalama: "1:29.8" (tabloya fmtLap ile "01:29.8" yazılır). */
const fmtAvg = (ms) => fmtLap(ms).replace(/^0(\d:)/, '$1');
const signed = (sec) => `${sec < 0 ? '−' : '+'}${Math.abs(Math.round(sec))} sn`;

/** Kartın içeriği hangi kipte: 'live' (yüzülen/dinlenilen set), 'next' (dinlenirken odaktaki başka set), 'sum' (biten), 'ready'. */
function cardMode(i) {
  const st = zst();
  const pos = state.wheel ? state.wheel.index : state.session.pos || 0;
  const status = statusOf(i);
  if (st.phase === 'swim' && i === st.cur) return 'live';
  if (st.phase === 'rest') {
    if (i === st.cur && status !== 'tamam') return 'live';
    if (i === pos && i !== st.cur) return 'next';
  }
  if (status === 'tamam' || status === 'eksik') return 'sum';
  return 'ready';
}

function repBoxes(i, withLive) {
  const s = state.plan.setler[i];
  const st = zst();
  const reps = st.per[i].reps;
  const n = tekrarOf(s);
  const boxes = [];
  for (let r = 0; r < Math.max(n, reps.length); r++) {
    const rep = reps[r];
    let cls = '';
    let v = '—';
    if (rep && rep.geldim != null) { cls = 'ok'; v = fmtShort(rep.geldim - rep.cik); }
    else if (rep && withLive) { cls = 'now'; v = ''; }
    if (withLive && st.phase === 'rest' && st.cur === i && r === reps.length && r < n) { cls = 'rest'; v = ''; }
    boxes.push(`<div class="${cls}"><small>${r + 1}.</small><b class="n">${v}</b></div>`);
  }
  return `<div class="w-reps${boxes.length > 6 ? ' is-many' : ''}">${boxes.join('')}</div>`;
}

/** 5+ tekrarlı setler için tek satır şerit: her tekrar bir çentik; altında sayaç, ortalama ve son 3 süre. */
function repStrip(i) {
  const s = state.plan.setler[i];
  const st = zst();
  const reps = st.per[i].reps;
  const n = tekrarOf(s);
  const notches = [];
  for (let r = 0; r < Math.max(n, reps.length); r++) {
    const rep = reps[r];
    let cls = '';
    if (rep && rep.geldim != null) cls = 'ok';
    else if (rep) cls = 'now';
    else if (st.phase === 'rest' && st.cur === i && r === reps.length) cls = 'rs';
    notches.push(`<i class="${cls}"></i>`);
  }
  const times = zaman.repTimes(st, i);
  const swimming = st.phase === 'swim' && st.cur === i;
  const label = swimming ? `Tekrar ${reps.length}/${n}` : `${times.length}/${n} bitti`;
  const avg = times.length ? `ort. ${fmtAvg(zaman.effectiveTimes(times).avgMs)}` : '';
  const last3 = times.slice(-3).map((t) => `<em>${fmtShort(t)}</em>`).join(' · ');
  return `<div class="w-strip">${notches.join('')}</div>
    <div class="w-rep"><b>${label}</b><span>${avg}</span></div>
    <div class="w-last3">${last3 ? `Son: ${last3}` : ''}</div>`;
}

/** Yüzerken/dinlenirken başlığın altındaki kısa bilgi: Hedef · Dinlen · Alet ve açıklamanın ilk satırı. */
function setInfo(s) {
  const short = (v) => String(v).replace(/^0(\d:)/, '$1');
  const parts = [];
  if (s.hedef) parts.push(`Hedef <b>${esc(short(s.hedef))}</b>`);
  if (s.dinlen) parts.push(`Dinlen <b>${esc(short(s.dinlen))}</b>`);
  if (s.alet) parts.push(`Alet <b>${esc(s.alet)}</b>`);
  return `${parts.length ? `<div class="w-info">${parts.join(' · ')}</div>` : ''}${s.aciklama ? `<div class="w-idesc">${esc(s.aciklama)}</div>` : ''}`;
}

function renderItem(node, s, i, cum) {
  const st = zst();
  const status = statusOf(i);
  const mode = cardMode(i);
  const blok = String(s.blok || '').trim().toUpperCase();
  const b = blokOf(s);
  const n = state.plan.setler.length;
  const c = cum[i];
  const styleTur = [s.stil, s.tur].filter(Boolean).join(' · ');
  const rowName = [setTitle(s), s.tur].filter(Boolean).join(' ');
  const short = (v) => String(v).replace(/^0(\d:)/, '$1');
  const tile = (label, value) => `<div class="w-tile"><small>${label}</small><b>${esc(short(value))}</b></div>`;
  const tiles = [s.hedef ? tile('HEDEF', s.hedef) : '', s.dinlen ? tile('DİNLEN', s.dinlen) : ''].join('');
  const d = zaman.doneReps(st, i);
  const T = tekrarOf(s);
  const isDone = status === 'tamam' || status === 'eksik';

  let tag = `${esc(blok)}${b.ad ? ` · ${esc(b.ad.toLocaleUpperCase('tr'))}` : ''} · ${i + 1}/${n}`;
  if (status === 'tamam') tag = `✓ TAMAMLANDI · ${tag}`;
  else if (status === 'eksik') tag = `${d}/${T} · ERKEN BİTTİ · ${tag}`;

  // Hazır kartta başlık büyük: stil · tür Sürüm 9'daki gibi kendi satırında. Küçük başlıklı
  // kartlarda (yüzerken, dinlenirken, özet) başlığın yanında durur.
  const title = mode === 'ready' || mode === 'next'
    ? `<div class="w-title">${esc(`${T} × ${s.mesafe}`)}</div>${styleTur ? `<div class="w-sub">${esc(styleTur)}</div>` : ''}`
    : `<div class="w-title">${esc(`${T} × ${s.mesafe}`)}${styleTur ? `<small>${esc(styleTur)}</small>` : ''}</div>`;
  const timer = '<div class="w-timer"><span class="w-tmode"></span><b class="w-tbig n"></b><span class="w-tsub n"></span></div>';
  let body;
  const foot = `<div class="w-foot">
        ${s.alet ? `<span><span class="w-alet">Alet</span> <b>${esc(s.alet)}</b></span>` : ''}
        <span class="w-last">${s.hedef && pacePer100(parseSec(s.hedef), s.mesafe) ? `<span class="w-pace"><span class="w-alet">Tempo</span> ${paceHtml(parseSec(s.hedef), s)}</span>` : '<span></span>'}<span class="w-dist">${fmtNum(setDist(s))} / ${fmtNum(c.dist)} m</span></span>
      </div>`;
  if (mode === 'live') {
    body = `${title}${setInfo(s)}${T > 4 ? repStrip(i) : repBoxes(i, true)}${timer}`;
  } else if (mode === 'next') {
    const cs = state.plan.setler[st.cur];
    const cd = zaman.doneReps(st, st.cur);
    const ct = tekrarOf(cs);
    const banner = cd >= ct || legacyDone(st.cur)
      ? `<div class="w-banner ok">✓ ${esc(setTitle(cs))} bitti · ort. ${fmtAvg(zaman.effectiveTimes(zaman.repTimes(st, st.cur)).avgMs)} · ${cd}/${ct}</div>`
      : `<div class="w-banner warn">⚠ ${esc(setTitle(cs))} ${cd}/${ct}'te kapanacak · ${ct - cd} tekrar yapılmadı</div>`;
    // Set sonu dinlenmesi: sıradaki setin içeriği öne alınır, sayaç küçülüp alta iner.
    body = `${title}${banner}
      ${s.aciklama ? `<div class="w-desc">${esc(s.aciklama)}</div>` : ''}
      ${tiles ? `<div class="w-tiles">${tiles}</div>` : ''}
      ${foot}
      <div class="w-ninfo">${setInfo({ ...s, aciklama: '' }).replace(/<\/?div[^>]*>/g, '')}${s.hedef && pacePer100(parseSec(s.hedef), s.mesafe) ? ` · Tempo ${paceHtml(parseSec(s.hedef), s)}` : ''}</div>
      ${timer.replace('class="w-timer"', 'class="w-timer is-mini"')}`;
  } else if (mode === 'sum') {
    const times = zaman.repTimes(st, i);
    const avg = times.length ? fmtAvg(zaman.effectiveTimes(times).avgMs) : '';
    body = `${title}${times.length ? repBoxes(i, false) : ''}
      <div class="w-summary n">${avg ? `Ortalama <b>${avg}</b> · ` : ''}${times.length ? `${d}/${T} tekrar` : 'Önceki sürümde işaretlendi'}</div>
      ${tiles ? `<div class="w-tiles">${tiles}</div>` : ''}`;
  } else {
    body = `${title}
      ${s.aciklama ? `<div class="w-desc">${esc(s.aciklama)}</div>` : '<div class="w-desc"></div>'}
      ${tiles ? `<div class="w-tiles">${tiles}</div>` : ''}
      ${foot}`;
  }

  node.classList.toggle('is-done', isDone);
  for (const m of ['live', 'next', 'sum', 'ready']) node.classList.toggle(`m-${m}`, m === mode);
  node.classList.add('w-item');
  node.dataset.mode = mode;
  node.style.setProperty('--c', b.renk);
  node.style.setProperty('--c-soft', hexA(b.renk, 0.35));
  node.style.setProperty('--c-glow', hexA(b.renk, 0.55));
  node.style.setProperty('--c-wash', hexA(b.renk, 0.12));
  node.innerHTML = `
    <div class="w-line"></div>
    <div class="w-dot"></div>
    <div class="w-row">
      <span class="w-tm">${c.time ? fmtDur(c.time) : ''}</span>
      <span class="w-nm">${esc(rowName)}${status === 'eksik' ? ` · ${d}/${T}` : ''}</span>
    </div>
    <div class="w-ctm">${c.time ? fmtDur(c.time) : ''}${setTime(s) ? `<small>+${fmtDur(setTime(s))}</small>` : ''}</div>
    <div class="w-card"><div class="w-tag">${tag}</div>${body}</div>`;
}

function openProgram() {
  state.session.screen = 'program';
  state.zst = null;
  persist();
  show('program');

  if (!state.wheel) {
    state.wheel = new Wheel($('wheel'), {
      onLayout: () => fitAllCards(),
      onChange: (i) => {
        if (!state.session || !state.plan) return;
        const prev = state.session.pos;
        state.session.pos = i;
        persist();
        updateAmbient(i);
        // Odak değişince dinlenme kartı (sonraki set / uyarı) yeniden çizilir.
        if (zst().phase === 'rest') { refreshItem(prev, false); refreshItem(i, false); }
        updateControls();
        updateBar();
        tick();
      },
    });
  }
  const cum = cumulative(state.plan.setler);
  const nodes = state.plan.setler.map((s, i) => {
    const node = document.createElement('div');
    renderItem(node, s, i, cum);
    return node;
  });
  state.wheel.setItems(nodes, state.session.pos || 0);
  updateAmbient(state.wheel.index);
  updateProgram();
  startTicker();
}

/** Uzun açıklama kartı taşırırsa açıklama yazısı kademeli küçülür; kesilmez. */
/**
 * Kart içeriği kartın yüksekliğine sığmazsa (kısa ekranlar): önce açıklama küçülür, sonra
 * kart kademeli sıkılaşır (fit-1…fit-3: başlık, stil · tür ve kutular küçülür). Böylece en
 * alttaki tempo · mesafe satırı kesilmez.
 */
function fitCardText(node) {
  const card = node.querySelector('.w-card');
  if (!card || !card.clientHeight) return;
  const desc = node.querySelector('.w-desc');
  const over = () => card.scrollHeight > card.clientHeight + 1;
  const shrinkDesc = (min) => {
    if (!desc) return;
    desc.style.fontSize = '';
    let size = parseFloat(getComputedStyle(desc).fontSize);
    while (over() && size > min) {
      size -= 1;
      desc.style.fontSize = `${size}px`;
    }
  };
  node.classList.remove('fit-1', 'fit-2', 'fit-3');
  shrinkDesc(19);
  for (const [cls, min] of [['fit-1', 17], ['fit-2', 15], ['fit-3', 14]]) {
    if (!over()) break;
    node.classList.add(cls);
    shrinkDesc(min);
  }
}

function fitAllCards() {
  if (state.wheel) state.wheel.items.forEach(fitCardText);
}

/** Başlıktaki değer kutuya sığmazsa yazıyı küçültür. */
function fitText(el, max = 54, min = 30) {
  el.style.fontSize = `${max}px`;
  let size = max;
  while (el.scrollWidth > el.clientWidth + 1 && size > min) {
    size -= 1;
    el.style.fontSize = `${size}px`;
  }
}

/** Büyük düğmenin yazısı düğmeye sığacak kadar küçülür (uzun yazılar dar ekranda taşıyordu). */
function fitMainLabel() {
  const el = $('btn-main-label');
  if (!el) return;
  delete el.dataset.fit;
  if (!el.clientWidth) return; // ekran gizli: görününce yeniden denenir
  const max = innerWidth <= 380 ? 34 : 40;
  el.classList.remove('is-wrap');
  fitText(el, max, 30);
  // Tek satırda büyük kalamıyorsa iki satıra bölünür (İDMANA / BAŞLA).
  if (el.scrollWidth > el.clientWidth + 1 && el.textContent.includes(' ')) {
    el.classList.add('is-wrap');
    fitText(el, max, 16);
  } else if (el.scrollWidth > el.clientWidth + 1) {
    fitText(el, 30, 16);
  }
  el.dataset.fit = '1';
}

function fitHeader() {
  document.querySelectorAll('#screen-program .prog-stat b.fit').forEach((el) => fitText(el));
}

/** Arka plan ve peron, aktif bloğun rengine bürünür. */
function updateAmbient(i) {
  const set = state.plan && state.plan.setler[i];
  if (!set) return;
  $('screen-program').style.setProperty('--amb', hexA(blokOf(set).renk, 0.12));
}

function refreshItem(i, redraw = true) {
  if (!state.wheel || i == null) return;
  const node = state.wheel.items[i];
  if (node) {
    renderItem(node, state.plan.setler[i], i, cumulative(state.plan.setler));
    fitCardText(node);
  }
  if (redraw) state.wheel.render();
}

function refreshAllItems() {
  if (!state.wheel) return;
  const cum = cumulative(state.plan.setler);
  state.wheel.items.forEach((node, i) => { renderItem(node, state.plan.setler[i], i, cum); fitCardText(node); });
  state.wheel.render();
}

function updateBar() {
  if (!state.session || !state.plan) return;
  const active = state.wheel ? state.wheel.index : -1;
  $('prog-bar').innerHTML = state.plan.setler.map((s, i) => {
    const status = statusOf(i);
    const cls = status === 'tamam' || status === 'eksik' ? ' is-on' : (i === active || status === 'suruyor' ? ' is-cur' : '');
    const c = blokOf(s).renk;
    return `<span class="seg${cls}" data-grow="${Math.max(1, setDist(s))}" data-bg="${c}" data-glow="${c}"></span>`;
  }).join('');
  paint($('prog-bar'));
}

function updateProgram() {
  if (!state.session || !state.plan) return;
  const sets = state.plan.setler;
  const totalDist = sets.reduce((a, s) => a + setDist(s), 0);
  const totalTime = sets.reduce((a, s) => a + setTime(s), 0);
  $('prog-dist').innerHTML = `${fmtNum(sessionDistance())}<small class="dim"> /${fmtNum(totalDist)}</small>`;
  $('prog-end').textContent = totalTime ? ` /${fmtDur(totalTime)}` : '';
  if (state.wheel) state.wheel.locked = zst().phase === 'swim';
  $('prog-back').classList.toggle('is-off', zst().phase === 'swim');
  updateBar();
  updateControls();
  tick();
  fitHeader();
}

const ICON_SES_ON = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
const ICON_SES_OFF = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';

function updateSoundButton() {
  const on = prefs().ses;
  const b = $('btn-sound');
  b.innerHTML = `${on ? ICON_SES_ON : ICON_SES_OFF}<span>${on ? 'Ses açık' : 'Ses kapalı'}</span>`;
  b.classList.toggle('is-off', !on);
  b.setAttribute('aria-pressed', String(on));
}

/** Büyük düğmenin yazısı ve alt satırı. */
function updateControls() {
  const s = state.session;
  if (!s || !state.plan || !state.wheel) return;
  const st = zst();
  const pos = state.wheel.index;
  const a = zaman.mainAction(st, state.plan.setler, pos);
  const btn = $('btn-main');
  let label = '';
  let sub = '';
  if (a.kind === 'geldim') {
    label = 'DUR';
    const T = tekrarOf(state.plan.setler[a.set]);
    if (a.rep < T) sub = `${a.rep}. tekrar biter`;
    else sub = a.set === state.plan.setler.length - 1 || nextOpenSet(a.set) < 0 ? 'Son tekrar · idman biter' : 'Son tekrar · set biter';
  } else if (a.kind === 'cik') {
    label = 'YÜZ';
    const set = state.plan.setler[a.set];
    if (a.start) sub = 'İdman ve 1. tekrar başlar';
    else sub = st.cur === a.set || st.phase === 'ready' ? `${a.rep}. tekrar başlar` : `${setTitle(set)} ${set.tur || ''} · ${a.rep}. tekrar`.replace(/\s+·/, ' ·');
  } else if (a.kind === 'mola') { label = 'MOLA'; sub = 'Devam etmek için DEVAM ET'; }
  else { label = 'SET TAMAM'; sub = 'Kaydırıp başka sete geç'; }
  const lab = $('btn-main-label');
  if (lab.textContent !== label || !lab.dataset.fit) {
    lab.textContent = label;
    fitMainLabel();
  }
  $('btn-main-sub').textContent = sub;
  btn.classList.toggle('is-geldim', a.kind === 'geldim');
  btn.classList.toggle('is-idle', a.kind === 'yok');
  updateSoundButton();
}

function startTicker() {
  stopTicker();
  state.ticker = setInterval(tick, 200);
  tick();
}

function stopTicker() {
  clearInterval(state.ticker);
  state.ticker = null;
}

/** Saatleri, büyük saati ve bipleri günceller (her 200 ms ve her olayda). */
function tick() {
  const s = state.session;
  if (!s || !state.plan || state.screen !== 'program') return;
  if (!$('btn-main-label').dataset.fit) fitMainLabel();
  const now = Date.now();
  const st = zst();
  const clock = $('prog-clock');
  const t = st.basla == null ? '0:00' : fmtClock(zaman.idmanMs(st, now));
  if (clock.textContent !== t) {
    const grew = t.length !== clock.textContent.length;
    clock.textContent = t;
    if (grew) fitHeader();
  }
  clock.classList.toggle('is-idle', st.basla == null);

  // Sol düğme: son basıştan sonra 5 sn "Geri al"; sonra dinlenirken "Mola".
  const last = st.last;
  const undoable = Boolean(last && ACTIONS.includes(last.t) && st.phase !== 'done' && st.mola == null && now - last.ts < UNDO_MS);
  setLeftSlot(undoable ? 'undo' : (st.phase === 'rest' && st.mola == null ? 'mola' : ''));
  updateMola(st, now);

  if (!state.wheel) return;
  const pos = state.wheel.index;
  const node = state.wheel.items[st.phase === 'swim' ? st.cur : pos];
  const box = node && node.querySelector('.w-timer');
  if (st.phase === 'swim') {
    const s0 = state.plan.setler[st.cur];
    const reps = st.per[st.cur].reps;
    const el = (now - reps[reps.length - 1].cik) / 1000;
    const hedef = parseSec(s0.hedef);
    if (box) {
      setTimer(box, `YÜZÜYOR · ${reps.length}/${tekrarOf(s0)}`, 'y', fmtDur(Math.floor(el)), '',
        hedef ? (el <= hedef ? `Hedef ${fmtDur(hedef)} · <span class="g">${Math.ceil(hedef - el)} sn kaldı</span>` : `Hedef ${fmtDur(hedef)} · <span class="r">${signed(el - hedef)}</span>`) : '');
      const now1 = node.querySelector('.w-reps .now b');
      if (now1) now1.textContent = fmtDur(Math.floor(el));
    }
  } else if (st.phase === 'rest') {
    const i = st.cur;
    const s0 = state.plan.setler[i];
    const reps = st.per[i].reps;
    const lastRep = reps[reps.length - 1];
    const dinlen = parseSec(s0.dinlen);
    const el = zaman.restElapsed(st, now) / 1000;
    const rem = dinlen - el;
    const lastT = (lastRep.geldim - lastRep.cik) / 1000;
    const hedef = parseSec(s0.hedef);
    const sub = `Son tekrar ${fmtDur(Math.round(lastT))}${hedef ? ` · <span class="${lastT <= hedef ? 'g' : 'r'}">${signed(lastT - hedef)}</span>` : ''}`;
    const setOver = zaman.doneReps(st, i) >= tekrarOf(s0);
    if (box) {
      if (!dinlen) {
        setTimer(box, setOver ? 'SET SONU DİNLENMESİ' : 'DİNLENME', 'b', fmtDur(Math.floor(el)), '', sub);
      } else {
        const big = rem >= 0 ? fmtDur(Math.ceil(rem)) : `−${fmtDur(Math.floor(-rem) || 0)}`;
        const mode = rem < 0 ? 'DİNLENME UZADI' : (setOver ? 'SET SONU DİNLENMESİ' : 'DİNLENME');
        setTimer(box, mode, rem < 0 ? 'r' : 'b', big, rem < 0 ? 'r' : (rem <= 3 ? 'y' : ''), sub);
      }
      box.classList.toggle('is-flash', Boolean(dinlen) && rem > 0 && rem <= 3);
      const rb = node.querySelector('.w-reps .rest b');
      if (rb) rb.textContent = dinlen ? (rem >= 0 ? fmtDur(Math.ceil(rem)) : `−${fmtDur(Math.floor(-rem))}`) : fmtDur(Math.floor(el));
    }
    if (dinlen && st.mola == null) checkBeep(lastRep.geldim, rem);
  } else if (box) {
    box.hidden = true;
  }
}

function setTimer(box, mode, modeCls, big, bigCls, subHtml) {
  box.hidden = false;
  const m = box.querySelector('.w-tmode');
  const b = box.querySelector('.w-tbig');
  const su = box.querySelector('.w-tsub');
  if (m.textContent !== mode) m.textContent = mode;
  m.className = `w-tmode ${modeCls}`;
  if (b.textContent !== big) b.textContent = big;
  // Uzun değer (−0:07, 1:05:00) kutuya sığsın diye küçülür.
  const len = big.length;
  b.className = `w-tbig n ${bigCls}${len >= 7 ? ' l7' : len === 6 ? ' l6' : len === 5 ? ' l5' : ''}`;
  if (su.innerHTML !== subHtml) su.innerHTML = subHtml;
}

/** Olay ekler, durumu yeniden hesaplar, kaydeder. */
function pushEvent(e) {
  ev().push({ ...e, ts: e.ts || Date.now() });
  state.zst = null;
  persist();
}

function onMainButton() {
  const s = state.session;
  if (!s || !state.plan || !state.wheel) return;
  const now = Date.now();
  const st = zst();
  if (st.last && now - st.last.ts < GUARD_MS) return; // çift dokunma
  audio.unlock();
  const a = zaman.mainAction(st, state.plan.setler, state.wheel.index);
  if (a.kind === 'mola') return;
  if (a.kind === 'yok') {
    if (a.set != null) askResetSet(a.set);
    return;
  }
  if (a.kind === 'cik') {
    if (a.start) pushEvent({ t: 'basla', ts: now }); // ilk YÜZ idmanı da başlatır
    pushEvent({ t: 'cik', ts: now, set: a.set });
  }
  else if (a.kind === 'geldim') {
    pushEvent({ t: 'geldim', ts: now });
    if (prefs().ses) audio.ok();
    const st2 = zst();
    const i = st2.cur;
    if (zaman.doneReps(st2, i) >= tekrarOf(state.plan.setler[i])) {
      const next = nextOpenSet(i);
      if (i === state.plan.setler.length - 1 || next < 0) {
        pushEvent({ t: 'bitir', ts: now, auto: true });
        openRpe();
        return;
      }
      afterEvent();
      state.wheel.scrollTo(next);
      return;
    }
  }
  afterEvent();
}

/** Tamamlanan seti sıfırlar: o setin YÜZ/DUR olayları silinir, set yeniden yapılabilir. */
async function askResetSet(i) {
  const set = state.plan.setler[i];
  const st = zst();
  const choice = await modal({
    title: 'Bu seti sıfırla?',
    body: `<p>${esc(setTitle(set))} · ${zaman.doneReps(st, i)}/${tekrarOf(set)} tekrar. Tekrar süreleri silinir, set yeniden yapılabilir.</p>`,
    actions: [
      { label: 'Seti sıfırla', value: 'sifirla', cls: 'btn-primary' },
      { label: 'Vazgeç', value: '' },
    ],
  });
  if (choice !== 'sifirla' || !state.session || zst().phase === 'swim') return;
  state.session.events = zaman.withoutSet(ev(), i);
  state.zst = null;
  persist();
  afterEvent();
  state.wheel.scrollTo(i, false);
  updateProgram();
  toast('Set sıfırlandı');
}

function afterEvent() {
  refreshAllItems();
  updateProgram();
}

function onUndo() {
  const st = zst();
  if (!st.last || st.phase === 'done' || st.mola != null || !ACTIONS.includes(st.last.t)) return;
  const e = ev();
  const popped = e.pop();
  // İlk YÜZ basla + cik birlikte eklenir; geri alınca ikisi de silinir.
  const prev = e[e.length - 1];
  if (popped.t === 'cik' && prev && prev.t === 'basla' && prev.ts === popped.ts) e.pop();
  state.zst = null;
  persist();
  const st2 = zst();
  afterEvent();
  if (st2.phase === 'swim' && state.wheel.index !== st2.cur) state.wheel.scrollTo(st2.cur);
  toast('Son dokunuş geri alındı', 1500);
}

const ACTIONS = ['basla', 'cik', 'geldim'];
const ICON_UNDO = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>';
const ICON_MOLA = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>';

/** Sol alt düğme: 'undo' (Geri al, 5 sn), 'mola' (dinlenirken) ya da '' (sönük). */
function setLeftSlot(act) {
  const b = $('btn-undo');
  if (b.dataset.act === act) return;
  b.dataset.act = act;
  b.innerHTML = act === 'mola' ? `${ICON_MOLA}<span>Mola</span>` : `${ICON_UNDO}<span>Geri al</span>`;
  b.setAttribute('aria-label', act === 'mola' ? 'Mola ver' : 'Son dokunuşu geri al');
  b.classList.toggle('is-on', act === 'undo');
  b.classList.toggle('is-mola', act === 'mola');
}

function onLeftSlot() {
  const act = $('btn-undo').dataset.act;
  if (act === 'undo') onUndo();
  else if (act === 'mola') startMola();
}

/** Mola: yalnızca dinlenirken. İdman saati, dinlenme sayacı ve bipler durur. */
function startMola() {
  const st = zst();
  if (st.phase !== 'rest' || st.mola != null) {
    if (st.phase === 'swim') toast('Yüzerken mola verilemez. Önce DUR.');
    return;
  }
  pushEvent({ t: 'mola' });
  afterEvent();
}

function endMola() {
  if (zst().mola == null) return;
  pushEvent({ t: 'devam' });
  afterEvent();
}

function updateMola(st, now) {
  const box = $('mola');
  const on = st.mola != null;
  if (box.hidden === on) box.hidden = !on;
  if (!on) return;
  $('mola-time').textContent = fmtDur(Math.floor((now - st.mola) / 1000));
  $('mola-idman').textContent = fmtClock(zaman.idmanMs(st, now));
  const i = state.wheel ? state.wheel.index : st.cur;
  const set = state.plan.setler[i];
  const done = zaman.doneReps(st, i);
  const short = (v) => String(v).replace(/^0(\d:)/, '$1');
  const html = done < tekrarOf(set)
    ? `Sıradaki: <b>${esc(setTitle(set))} · ${done + 1}. tekrar</b>${set.hedef || set.dinlen ? `<br>${[set.hedef ? `Hedef ${esc(short(set.hedef))}` : '', set.dinlen ? `Dinlen ${esc(short(set.dinlen))}` : ''].filter(Boolean).join(' · ')}` : ''}`
    : '';
  const nx = $('mola-next');
  if (nx.innerHTML !== html) nx.innerHTML = html;
  nx.hidden = !html;
}

/** Karta dokununca setin tüm bilgisi büyük yazıyla; dokununca kapanır, zamanlamayı etkilemez. */
function openDetail(i) {
  const s = state.plan.setler[i];
  const b = blokOf(s);
  const c = cumulative(state.plan.setler)[i];
  const blok = String(s.blok || '').trim().toUpperCase();
  const short = (v) => String(v).replace(/^0(\d:)/, '$1');
  const styleTur = [s.stil, s.tur].filter(Boolean).join(' · ');
  const pace = s.hedef && pacePer100(parseSec(s.hedef), s.mesafe) ? `<p class="dt-row">Tempo ${paceHtml(parseSec(s.hedef), s)}</p>` : '';
  const box = $('detail');
  box.style.setProperty('--c', b.renk);
  $('detail-body').innerHTML = `
    <div class="dt-tag">${esc(blok)}${b.ad ? ` · ${esc(b.ad.toLocaleUpperCase('tr'))}` : ''} · ${i + 1}/${state.plan.setler.length}</div>
    <div class="dt-title">${esc(`${tekrarOf(s)} × ${s.mesafe}`)}</div>
    ${styleTur ? `<div class="dt-sub">${esc(styleTur)}</div>` : ''}
    ${s.aciklama ? `<p class="dt-desc">${esc(s.aciklama)}</p>` : ''}
    <div class="dt-tiles">${s.hedef ? `<div><small>HEDEF</small><b>${esc(short(s.hedef))}</b></div>` : ''}${s.dinlen ? `<div><small>DİNLEN</small><b>${esc(short(s.dinlen))}</b></div>` : ''}</div>
    ${pace}
    ${s.alet ? `<p class="dt-row">Alet <b>${esc(s.alet)}</b></p>` : ''}
    <p class="dt-row">${fmtNum(setDist(s))} m${c.time ? ` · yığımlı hedef ${fmtDur(c.time)}` : ''}</p>
    <p class="dt-hint">Kapatmak için dokun · süre işlemeye devam eder</p>`;
  box.hidden = false;
}

function closeDetail() {
  $('detail').hidden = true;
}

// Sürükleme (yüzerken kilitli tekerlekte de) paneli açmasın: yalnızca yerinde dokunuş.
let wheelDown = null;
function onWheelDown(e) { wheelDown = { x: e.clientX, y: e.clientY }; }

function onWheelClick(e) {
  const d = wheelDown;
  wheelDown = null;
  if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 12) return;
  const card = e.target.closest && e.target.closest('.w-item.is-active .w-card');
  if (!card || !state.wheel || zst().mola != null) return;
  const i = state.wheel.items.indexOf(card.closest('.w-item'));
  if (i >= 0) openDetail(i);
}

function onSoundButton() {
  data.setPrefs({ ses: !prefs().ses });
  refreshPrefs();
  if (prefs().ses) audio.unlock();
  updateSoundButton();
}

async function onProgramBack() {
  const s = state.session;
  const st = zst();
  if (st.phase === 'swim') {
    toast('Yüzerken kullanılamaz. Önce DUR.');
    return;
  }
  if (!hasProgress(s)) {
    data.clearSession();
    state.session = null;
    state.plan = null;
    return showDays();
  }
  const sets = state.plan.setler;
  const full = sets.filter((x, i) => statusOf(i) === 'tamam').length;
  const partial = sets.map((x, i) => [x, i]).filter(([, i]) => ['eksik', 'suruyor'].includes(statusOf(i)))
    .map(([x, i]) => `${setTitle(x)} ${zaman.doneReps(st, i)}/${tekrarOf(x)}`);
  const choice = await modal({
    title: 'İdmanı bitir?',
    body: `<p>Yapılan: ${full} set tam${partial.length ? `, ${esc(partial.join(', '))}` : ''} · ${fmtNum(sessionDistance())} m · ${fmtClock(zaman.idmanMs(st, Date.now()))}</p>`,
    actions: [
      ...(st.phase === 'rest' && st.mola == null ? [{ label: '⏸ Mola ver', value: 'mola', cls: 'btn-mola' }] : []),
      { label: 'İdmanı bitir ve kaydet', value: 'bitir', cls: 'btn-primary' },
      { label: 'Devam et', value: '' },
      { label: 'Takvime dön (idman sürer)', value: 'cik', cls: 'btn-ghost' },
    ],
  });
  if (choice === 'mola') {
    startMola();
  } else if (choice === 'bitir') {
    if (st.phase === 'idle') pushEvent({ t: 'basla' });
    if (zst().mola != null) pushEvent({ t: 'devam' });
    pushEvent({ t: 'bitir', auto: false });
    openRpe();
  } else if (choice === 'cik') {
    showDays();
  }
}

// --- Ses ---------------------------------------------------------------------
//
// Dinlenmede çıkışa 3-2-1 kısa, 0'da uzun bip; DUR'da kısa onay. iOS sesi
// yalnızca bir dokunuştan sonra açar (audio.unlock).

const audio = {
  ctx: null,
  unlock() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!this.ctx) this.ctx = new AC();
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    } catch {
      this.ctx = null;
    }
  },
  beep(freq, ms, vol = 0.5) {
    const c = this.ctx;
    if (!c || c.state !== 'running') return;
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    gain.gain.setValueAtTime(vol, t + ms / 1000 - 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + ms / 1000 + 0.02);
  },
  short() { this.beep(880, 140); },
  long() { this.beep(1320, 650); },
  ok() { this.beep(660, 90, 0.35); },
};

/** 3-2-1 kısa, 0'da uzun bip — her dinlenmede her işaret bir kez. */
function checkBeep(key, rem) {
  if (!prefs().ses) return;
  const mark = zaman.beepMark(rem);
  if (mark == null) return;
  if (!state.beep || state.beep.key !== key) state.beep = { key, marks: new Set() };
  if (state.beep.marks.has(mark)) return;
  // Geç açılan ekranda eski işaretler çalmasın: yalnızca şu anki saniye.
  for (let m = mark; m <= 3; m++) state.beep.marks.add(m);
  if (mark === 0) audio.long();
  else audio.short();
}

// ---------------------------------------------------------------------------
// Seans sonu: RPE → MSI → Özet ve kaydet
// ---------------------------------------------------------------------------

const RPE_ETIKET = ['dinlenme', 'çok kolay', 'kolay', 'rahat', 'orta', 'orta+', 'zorlu', 'zor', 'çok zor', 'aşırı', 'maks.'];
const MSI_DONGU = [0.5, 1, 1.5, 2, 3];
const HAZIR_IFADE = ['İyi hissettim', 'Yorgun', 'Omuz hassas', 'Teknik iyi', 'Tempo zorladı'];

function ensureForm() {
  const s = state.session;
  if (!s.form || s.form.v !== 2) {
    s.form = { v: 2, rpe: null, msi: {}, havuz: prefs().havuz || 25, notes: {}, edits: {}, chips: [], aciklama: '' };
  }
  return s.form;
}

function openRpe() {
  ensureForm();
  state.session.screen = 'rpe';
  state.zst = null;
  persist();
  show('rpe');
  const f = state.session.form;
  const st = zst();
  $('rpe-grid').innerHTML = RPE_ETIKET.map((l, n) => `<button data-v="${n}" class="${f.rpe === n ? 'is-on' : ''}"><b class="n">${n}</b><small>${l}</small></button>`).join('');
  const done = state.plan.setler.filter((x, i) => ['tamam', 'eksik'].includes(statusOf(i))).length;
  $('rpe-info').textContent = `İdman: ${fmtClock(zaman.idmanMs(st, Date.now()))} · ${fmtNum(sessionDistance())} m · ${done} set`;
  // "İdmana dön" yalnızca bitişten sonraki ilk 5 sn belirgin; ‹ her zaman döner.
  const b = st.bitir;
  $('rpe-undo').hidden = !(b && Date.now() - b < UNDO_MS);
  clearTimeout(state.rpeTimer);
  if (!$('rpe-undo').hidden) state.rpeTimer = setTimeout(() => { $('rpe-undo').hidden = true; }, UNDO_MS - (Date.now() - b));
}

/** Bitişi geri alır: otomatik bitişte son DUR da geri alınır (tekrar sürüyor olur). */
function backToWorkout() {
  const e = ev();
  const last = e[e.length - 1];
  if (!last || last.t !== 'bitir') return openProgram();
  e.pop();
  if (last.auto && e.length && e[e.length - 1].t === 'geldim') e.pop();
  state.zst = null;
  persist();
  openProgram();
  const st = zst();
  if (st.cur == null) return;
  // Son tekrar geri alınmadıysa tamamlanan set yerine sıradaki açık sete dur.
  const next = statusOf(st.cur) === 'tamam' ? nextOpenSet(st.cur) : -1;
  state.wheel.scrollTo(next >= 0 ? next : st.cur, false);
  updateProgram();
}

function onRpeClick(e) {
  const b = e.target.closest('button[data-v]');
  if (!b) return;
  state.session.form.rpe = Number(b.dataset.v);
  persist();
  openMsi();
}

function openMsi() {
  state.session.screen = 'msi';
  persist();
  show('msi');
  renderMsi();
}

function renderMsi() {
  const f = state.session.form;
  $('msi-body').innerHTML = MSI_BOLGELER.map((b) => {
    const v = f.msi[b.key];
    const cls = v == null ? '' : v >= 2 ? 'w2' : v >= 1 ? 'w1' : 'w05';
    return `<button data-bolge="${b.key}" class="${cls}">${b.label}<em class="n">${v == null ? '—' : String(v).replace('.', ',')}</em></button>`;
  }).join('');
  const any = Object.keys(f.msi).length > 0;
  $('msi-next').hidden = !any;
  $('msi-none').classList.toggle('is-dim', any);
}

function onMsiClick(e) {
  const f = state.session.form;
  if (e.target.closest('#msi-none')) {
    f.msi = {};
    persist();
    return openOzet();
  }
  if (e.target.closest('#msi-next')) return openOzet();
  const b = e.target.closest('button[data-bolge]');
  if (!b) return;
  const k = b.dataset.bolge;
  const cur = f.msi[k];
  const idx = cur == null ? -1 : MSI_DONGU.indexOf(cur);
  if (idx === MSI_DONGU.length - 1) delete f.msi[k];
  else f.msi[k] = MSI_DONGU[idx + 1];
  persist();
  renderMsi();
}

/** Setin not satırları: { key, lines: [{ id, text, on, warn }], suspects } */
function setNotes(i) {
  const s = state.plan.setler[i];
  const k = setKey(s, i);
  const st = zst();
  const f = state.session.form;
  const times = zaman.repTimes(st, i);
  const edits = f.edits[k] || {};
  const eff = zaman.effectiveTimes(times, edits);
  const chosen = f.notes[k] || {};
  const lines = [];
  const T = tekrarOf(s);
  const d = times.length;
  const sus = zaman.suspects(times);
  if (d >= 1) {
    const txt = eff.all.map((x, r) => `${fmtShort(x.ms)}${x.dropped ? ' (çıkarıldı)' : ''}`).join(', ');
    lines.push({ id: 'reps', text: `Tekrarlar: ${txt}`, on: chosen.reps ?? d >= 2, sus });
  }
  const rests = st.per[i].rests;
  const dev = zaman.restDeviation(rests, parseSec(s.dinlen));
  const sonu = st.per[i].sonu;
  if (dev.show) {
    const txt = `Dinlenme: ${rests.map(fmtShort).join(', ')} (ort. ${signed(dev.avgDev)})${sonu != null ? ` · Set sonu ${fmtShort(sonu)}` : ''}`;
    lines.push({ id: 'rest', text: txt, on: chosen.rest ?? false });
  }
  if (d > 0 && d < T) lines.push({ id: 'eksik', text: `${d}/${T} tekrar yapıldı`, on: chosen.eksik ?? true });
  return { k, lines, eff, times, sus };
}

function openOzet() {
  state.session.screen = 'ozet';
  persist();
  show('ozet');
  renderOzet();
}

function msiSummary(msi) {
  const parts = MSI_BOLGELER.filter((b) => msi[b.key] != null).map((b) => `${b.label.toLocaleLowerCase('tr')} ${String(msi[b.key]).replace('.', ',')}`);
  return parts.length ? parts.join(', ') : 'ağrı yok';
}

function renderOzet() {
  const f = state.session.form;
  const st = zst();
  $('oz-sure').textContent = fmtClock(zaman.idmanMs(st, Date.now()));
  $('oz-mesafe').textContent = fmtNum(sessionDistance());
  $('oz-rpe').textContent = f.rpe == null ? '—' : String(f.rpe);
  $('oz-msi').textContent = msiSummary(f.msi);
  for (const b of $('oz-havuz').children) b.classList.toggle('is-on', Number(b.dataset.v) === f.havuz);

  const blocks = [];
  state.plan.setler.forEach((s, i) => {
    if (!st.per[i].reps.length) return;
    const { k, lines, eff, sus } = setNotes(i);
    const title = `${setTitle(s)} ${s.tur || ''}`.trim();
    const susHtml = sus.map((r) => {
      const x = eff.all[r];
      return `<button class="oz-sus" data-set="${i}" data-rep="${r}">⚠ ${r + 1}. tekrar ${fmtShort(x.ms)}${x.edited ? ' (düzeltildi)' : x.dropped ? ' (çıkarıldı)' : ''} — düzelt</button>`;
    }).join('');
    const ls = lines.map((l) => `<button class="oz-line" data-set="${k}" data-line="${l.id}"><i class="cb${l.on ? ' on' : ''}">${l.on ? '✓' : ''}</i><span>${esc(l.text)}</span></button>`).join('');
    blocks.push(`<div class="oz-set"><div class="oz-st"><b>${esc(title)}</b><span class="n">ort. ${eff.avgMs ? fmtAvg(eff.avgMs) : '—'}</span></div>${ls}${susHtml}</div>`);
  });
  $('oz-notes').innerHTML = blocks.length ? blocks.join('') : '<p class="muted">Süresi ölçülen set yok.</p>';
  const zs = zst();
  const mola = zs.molaN ? [`Mola ${zs.molaN > 1 ? `${zs.molaN}× · ` : ''}${fmtShort(zaman.molaMs(zs, zs.bitir || Date.now()))}`] : [];
  $('oz-chips').innerHTML = [...HAZIR_IFADE, ...mola].map((c) => `<button class="oz-chip${f.chips.includes(c) ? ' on' : ''}" data-chip="${esc(c)}">${esc(c)}</button>`).join('');
  if (document.activeElement !== $('oz-aciklama')) $('oz-aciklama').value = f.aciklama;
  $('oz-msg').hidden = true;
}

function onOzetClick(e) {
  const f = state.session.form;
  const hv = e.target.closest('#oz-havuz button[data-v]');
  if (hv) { f.havuz = Number(hv.dataset.v); persist(); return renderOzet(); }
  const chip = e.target.closest('button[data-chip]');
  if (chip) {
    const c = chip.dataset.chip;
    f.chips = f.chips.includes(c) ? f.chips.filter((x) => x !== c) : [...f.chips, c];
    persist();
    return renderOzet();
  }
  const line = e.target.closest('button[data-line]');
  if (line) {
    const k = line.dataset.set;
    const id = line.dataset.line;
    const i = state.plan.setler.findIndex((s, j) => setKey(s, j) === k);
    const cur = setNotes(i).lines.find((l) => l.id === id);
    f.notes[k] = { ...(f.notes[k] || {}), [id]: !cur.on };
    persist();
    return renderOzet();
  }
  const sus = e.target.closest('button.oz-sus');
  if (sus) return openEdit(Number(sus.dataset.set), Number(sus.dataset.rep));
  if (e.target.closest('#oz-rpe-box')) return openRpe();
  if (e.target.closest('#oz-msi-box')) return openMsi();
}

// --- Şüpheli tekrarı düzeltme ------------------------------------------------

function openEdit(i, r) {
  const st = zst();
  const times = zaman.repTimes(st, i);
  const s = state.plan.setler[i];
  const k = setKey(s, i);
  const e = (state.session.form.edits[k] || {})[r];
  const others = times.filter((_, j) => j !== r);
  const start = typeof e === 'number' ? e : Math.round(zaman.median(others) / 1000) * 1000;
  state.edit = { i, r, k, ms: start };
  $('ed-title').textContent = `${setTitle(s)} ${s.tur || ''} · ${r + 1}. tekrar`;
  $('ed-reps').innerHTML = times.map((t, j) => `<div class="${j === r ? 'bad' : ''}"><small>${j + 1}</small><b class="n">${fmtShort(t)}</b></div>`).join('');
  renderEdit();
  $('ed-sheet').hidden = false;
}

function renderEdit() {
  $('ed-val').textContent = fmtShort(state.edit.ms);
  $('ed-apply').textContent = `${fmtShort(state.edit.ms)} olarak düzelt`;
}

function onEditClick(e) {
  const E = state.edit;
  if (!E) return;
  const f = state.session.form;
  const step = e.target.closest('[data-step]');
  if (step) {
    E.ms = Math.max(1000, E.ms + Number(step.dataset.step) * 1000);
    return renderEdit();
  }
  const act = e.target.closest('[data-ed]');
  if (!act) return;
  const edits = f.edits[E.k] || (f.edits[E.k] = {});
  if (act.dataset.ed === 'apply') edits[E.r] = E.ms;
  else if (act.dataset.ed === 'drop') edits[E.r] = 'drop';
  else if (act.dataset.ed === 'keep') delete edits[E.r];
  persist();
  closeEdit();
  renderOzet();
}

function closeEdit() {
  $('ed-sheet').hidden = true;
  state.edit = null;
}

// --- Kaydet --------------------------------------------------------------------

function formMsiString(msi) {
  return MSI_BOLGELER
    .filter((b) => msi[b.key] !== undefined && msi[b.key] !== null)
    .map((b) => `${b.key} ${msi[b.key]}`)
    .join('; ');
}

function buildPayload() {
  const s = state.session;
  const f = s.form;
  const st = zst();
  const legacyRes = (s.legacy && s.legacy.results) || {};
  const aciklama = [...f.chips, String(f.aciklama || '').trim()].filter(Boolean).join('. ');
  return {
    tarih: s.tarih,
    seans: {
      sure: fmtHMS(zaman.idmanMs(st, Date.now())),
      mesafe: sessionDistance(),
      havuz: f.havuz,
      rpe: f.rpe === null ? '' : f.rpe,
      msi: formMsiString(f.msi),
      aciklama,
    },
    setler: state.plan.setler.map((set, i) => {
      const k = setKey(set, i);
      const old = legacyRes[k] || {};
      if (st.per[i].reps.length && zaman.doneReps(st, i) > 0) {
        const { lines, eff } = setNotes(i);
        const not = [old.not, ...lines.filter((l) => l.on).map((l) => l.text)].filter(Boolean).join(' | ');
        return { sira: set.sira, tamamlandi: true, gercek: eff.avgMs ? fmtLap(eff.avgMs) : '', kulac: '', nabiz: '', rpe: '', msi: '', not };
      }
      if (legacyDone(i)) {
        return { sira: set.sira, tamamlandi: true, gercek: old.gercek || '', kulac: '', nabiz: '', rpe: '', msi: '', not: old.not || '' };
      }
      return { sira: set.sira, tamamlandi: false };
    }),
  };
}

/** Biten seansın telefonda saklanan kopyası (Yapılmış idmanlar). */
function keepInHistory(payload, status) {
  const st = zst();
  const byS = new Map(payload.setler.map((x) => [String(x.sira), x]));
  const rec = {
    id: `${payload.tarih}-${Date.now()}`,
    tarih: payload.tarih,
    savedAt: Date.now(),
    status,
    startedAt: st.basla,
    endedAt: st.bitir,
    seans: payload.seans,
    setler: state.plan.setler.map((set, i) => {
      const p = byS.get(String(set.sira)) || {};
      return {
        sira: set.sira, blok: set.blok, tekrar: set.tekrar, mesafe: set.mesafe, stil: set.stil, tur: set.tur,
        aciklama: set.aciklama, hedef: set.hedef, dinlen: set.dinlen, alet: set.alet,
        tamamlandi: Boolean(p.tamamlandi), gercek: p.gercek || '', not: p.not || '',
        yapilan: zaman.doneReps(st, i),
      };
    }),
  };
  if (!data.addHistory(rec)) toast('Telefonda yer kalmadı: seansın kopyası saklanamadı.', 5000);
}

async function saveSessionForm() {
  const f = state.session.form;
  if (state.saving) return;
  f.aciklama = $('oz-aciklama').value;
  data.setPrefs({ havuz: f.havuz });
  refreshPrefs();
  persist();
  const payload = buildPayload();
  const btn = $('oz-save');
  state.saving = true;
  btn.disabled = true;
  btn.textContent = 'Kaydediliyor…';
  let result;
  try {
    result = await data.finishSession(payload);
  } catch (err) {
    await handleSaveError(err, payload);
    return;
  } finally {
    state.saving = false;
    btn.disabled = false;
    btn.textContent = 'Kaydet';
  }
  keepInHistory(payload, 'sent');
  endSessionLocally();
  showDone({ ok: true, result });
}

async function handleSaveError(err, payload) {
  if (err.code === 'DUPLICATE') {
    const close = await modal({
      title: 'Bu seans zaten kayıtlı',
      body: `<p>${esc(fmtDateTR(payload.tarih))} için tabloda kayıt var; ikinci kez yazılmadı ve hiçbir şey silinmedi.</p>`,
      actions: [{ label: 'Seansı kapat', value: true, cls: 'btn-primary' }, { label: 'Özete dön', value: false }],
    });
    if (close) {
      keepInHistory(payload, 'duplicate');
      endSessionLocally();
      showDays();
    }
    return;
  }

  if (err.transient || err.code === 'NO_CONFIG') {
    queueAndClose(payload, err);
    return;
  }

  const choice = await modal({
    title: 'Kaydedilemedi',
    body: `<p>${esc(err.message)}</p><p class="muted">Hata kodu: ${esc(err.code)}</p>`,
    actions: [
      { label: 'Tekrar dene', value: 'retry', cls: 'btn-primary' },
      { label: 'Kuyruğa al, sonra dene', value: 'queue' },
      { label: 'Özete dön', value: '' },
    ],
  });
  if (choice === 'retry') saveSessionForm();
  else if (choice === 'queue') queueAndClose(payload, err);
}

function queueAndClose(payload, err) {
  data.enqueue(payload, { code: err.code || 'CLIENT', message: err.message });
  keepInHistory(payload, 'queued');
  endSessionLocally();
  showDone({ ok: false });
}

// ---------------------------------------------------------------------------
// Onay ekranı
// ---------------------------------------------------------------------------

function showDone({ ok, result }) {
  $('done-icon').textContent = ok ? '✓' : '⏳';
  $('done-icon').classList.toggle('is-wait', !ok);
  $('done-title').textContent = ok ? 'Kaydedildi' : 'Kaydedilemedi';
  let text;
  if (ok) {
    text = result.arsivlenenSet === undefined
      // Eski Code.gs: arsiv yok, satırlar silinir (Code.gs yeniden dağıtılmalı).
      ? `${result.yazilanSet} set "eski" sayfasına yazıldı, ${result.silinenSet} satır Plan'dan silindi.`
      : `${result.yazilanSet} set "eski" sayfasına yazıldı, ${result.arsivlenenSet} plan satırı "arsiv" sayfasına taşındı.`;
    if (result.uyari) text += ` ${result.uyari}`;
    text += ' Seans bu telefonda da saklandı.';
  } else {
    text = 'Bağlantı gelince denenecek. Kayıt bu cihazda bekliyor; uygulama her açılışta yeniden dener.';
  }
  $('done-text').textContent = text;
  show('done');
  clearTimeout(state.doneTimer);
  state.doneTimer = setTimeout(() => { if (state.screen === 'done') showDays(); }, ok ? 4000 : 6000);
}

// ---------------------------------------------------------------------------
// Başlangıç
// ---------------------------------------------------------------------------

function wire() {
  $('setup-save').addEventListener('click', saveSetup);
  $('setup-back').addEventListener('click', () => showHome());
  $('setup-forget').addEventListener('click', forgetKey);
  $('setup-prefs').addEventListener('click', onPrefsClick);
  $('pref-css').addEventListener('change', onCssChange);
  $('pref-ses-test').addEventListener('click', () => {
    audio.unlock();
    audio.short();
    setTimeout(() => audio.long(), 500);
  });

  $('home-settings').addEventListener('click', () => showSetup(true));
  $('home-swim').addEventListener('click', () => showDays());
  $('home-open').addEventListener('click', () => {
    if (state.session) resumeSession();
    else if (state.homeNext) openDate(state.homeNext);
  });
  $('home-gym').addEventListener('click', () => toast('Salon bölümü yakında.'));
  $('home-history').addEventListener('click', showHistory);
  $('hist-back').addEventListener('click', () => showHome());
  $('hist-list').addEventListener('click', onHistoryClick);
  $('hist-clear').addEventListener('click', clearHistory);

  $('days-back').addEventListener('click', () => showHome());
  $('days-refresh').addEventListener('click', () => showDays(true));
  $('days-list').addEventListener('click', onDaysClick);
  $('days-banners').addEventListener('click', onDaysClick);
  $('days-today-btn').addEventListener('click', () => { if (state.selDate) openDate(state.selDate); });
  $('days-hero').addEventListener('click', onDaysClick);
  $('wk-today').addEventListener('click', () => selectDay(todayKey(), false));
  wireWeekSwipe();

  $('prog-back').addEventListener('click', onProgramBack);
  $('btn-main').addEventListener('click', onMainButton);
  $('btn-undo').addEventListener('click', onLeftSlot);
  $('mola-devam').addEventListener('click', endMola);
  $('wheel').addEventListener('pointerdown', onWheelDown, { capture: true, passive: true });
  $('wheel').addEventListener('click', onWheelClick);
  $('detail').addEventListener('click', closeDetail);
  $('btn-sound').addEventListener('click', onSoundButton);

  $('rpe-back').addEventListener('click', backToWorkout);
  $('rpe-undo').addEventListener('click', backToWorkout);
  $('rpe-grid').addEventListener('click', onRpeClick);
  $('msi-back').addEventListener('click', openRpe);
  $('screen-msi').addEventListener('click', onMsiClick);
  $('oz-back').addEventListener('click', openMsi);
  $('screen-ozet').addEventListener('click', onOzetClick);
  $('oz-aciklama').addEventListener('input', (e) => { state.session.form.aciklama = e.target.value; persist(); });
  $('oz-save').addEventListener('click', saveSessionForm);
  $('ed-sheet-body').addEventListener('click', onEditClick);
  $('ed-dim').addEventListener('click', closeEdit);

  $('done-back').addEventListener('click', () => {
    // Kayıttan sonra sıradaki idmana değil, takvimde bugüne dönülür.
    const today = todayKey();
    state.selDate = today;
    state.weekStart = mondayOf(today);
    state.selKeep = true;
    showDays();
  });
  // iOS: ses bağlamı yalnızca bir dokunuşla açılabilir.
  document.addEventListener('pointerdown', () => { if (prefs().ses) audio.unlock(); }, { capture: true, passive: true });
  $('app-version').textContent = `Sürüm ${APP_VERSION}`;
  // Yazı tipi yüklenince ölçüler değişir: tekerleği ve kronometreyi yeniden ölç.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (state.wheel) state.wheel.layout();
      if (state.screen === 'program') { fitHeader(); fitMainLabel(); }
    });
  }

  // Beklenmeyen bir hata sessiz kalmasın ve ekranı kilitlemesin.
  const report = (msg) => {
    toast(`Beklenmeyen hata: ${msg}`, 6000);
    $('modal').hidden = true;
  };
  window.addEventListener('error', (e) => report(e.message));
  window.addEventListener('unhandledrejection', (e) => report((e.reason && e.reason.message) || String(e.reason)));

  window.addEventListener('online', () => flushQueue());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    if (wake.wanted) wake.acquire();
    if (state.screen === 'program') updateProgram();
    flushQueue();
  });
  // iOS: iki parmakla yakınlaştırmayı engelle.
  document.addEventListener('gesturestart', (e) => e.preventDefault());
}

function boot() {
  wire();
  if (!data.isConfigured()) {
    showSetup(false);
    return;
  }
  const s = data.loadSession();
  if (s && data.getCachedPlan(s.tarih)) {
    state.session = s;
    resumeSession(); // eski biçim seans burada yeni modele taşınır
    flushQueue();
    return;
  }
  if (s) data.clearSession();
  showHome();
}

boot();
