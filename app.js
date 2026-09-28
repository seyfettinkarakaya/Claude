// YüzmeSK — arayüz. Veriye yalnızca data.js üzerinden erişir.

import * as data from './data.js?v=7';
import { Wheel } from './wheel.js?v=7';

// Telefonun güncel kodu çalıştırıp çalıştırmadığını görmek için ekranda gösterilir.
export const APP_VERSION = '7';

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
const MSI_DEGERLER = [0, 0.5, 1, 1.5, 2, 3];

const SCREENS = ['setup', 'days', 'program', 'stopwatch', 'form', 'done'];
const WAKE_SCREENS = new Set(['program', 'stopwatch', 'form']);

const state = {
  screen: null,
  plan: null,     // { tarih, setler }
  session: null,  // data.saveSession ile saklanan devam eden seans
  wheel: null,
  dates: null,
  datesInfo: {},
  ticker: null,
  swFrame: null,
  swShown: '',
  doneTimer: null,
  sheet: null,      // kronometre Kaydet paneli durumu
  sentDates: new Set(), // bu açılışta kuyruktan gönderilen günler
  selDate: null,    // gün seçiminde seçili gün (YYYY-MM-DD)
  selKeep: false,   // kullanıcı bir gün seçtiyse yenilemede korunur
  weekStart: null,  // gösterilen haftanın pazartesisi
  suppressDayClick: false,
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

/** Kronometre göstergesi: { main: "1:23", tenth: ".4" } */
function fmtSw(ms) {
  const tenths = Math.floor(Math.max(0, ms) / 100);
  const s = Math.floor(tenths / 10);
  const h = Math.floor(s / 3600);
  if (h) return { main: `${h}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}`, tenth: '' };
  return { main: `${Math.floor(s / 60)}:${pad2(s % 60)}`, tenth: `.${tenths % 10}` };
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
// Ekran geçişleri, ekran kilidi, bildirimler
// ---------------------------------------------------------------------------

function show(name) {
  state.screen = name;
  for (const s of SCREENS) $(`screen-${s}`).hidden = s !== name;
  if (WAKE_SCREENS.has(name)) wake.acquire();
  else wake.release();
  if (name !== 'program') stopTicker();
  if (name !== 'stopwatch') stopSwLoop();
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
  return {
    tarih,
    startedAt: null,
    endedAt: null,
    done: {},
    results: {},
    pos: 0,
    screen: 'program',
    sw: newSw(),
    form: null,
  };
}

function persist() {
  if (state.session) data.saveSession(state.session);
}

function hasProgress(s) {
  return Boolean(s && (s.startedAt || Object.keys(s.done).length || Object.keys(s.results).length));
}

function doneCount() {
  return state.plan.setler.filter((s, i) => state.session.done[setKey(s, i)]).length;
}

function doneDistance() {
  return state.plan.setler.reduce((sum, s, i) => sum + (state.session.done[setKey(s, i)] ? setDist(s) : 0), 0);
}

/** Seansı cihazdan kaldırır. Hata fırlatmaz: kullanıcıyı hiçbir ekranda kilitlememeli. */
function endSessionLocally() {
  const tarih = state.session && state.session.tarih;
  state.session = null;
  state.plan = null;
  // Biten gün listeden kalkar; gün seçimi yeniden en uygun güne otursun.
  state.selDate = null;
  state.selKeep = false;
  data.clearSession();
  try {
    if (tarih) data.forgetDate(tarih);
  } catch (err) {
    console.error(err);
  }
}

// ---------------------------------------------------------------------------
// Kurulum
// ---------------------------------------------------------------------------

function showSetup(canGoBack) {
  const c = data.getConfig();
  $('setup-url').value = c.apiUrl;
  $('setup-token').value = c.token;
  $('setup-back').hidden = !canGoBack;
  $('setup-msg').hidden = true;
  show('setup');
}

async function saveSetup() {
  const apiUrl = $('setup-url').value.trim();
  const token = $('setup-token').value.trim();
  const msg = $('setup-msg');
  if (!/^https:\/\//.test(apiUrl) || !token) {
    msg.textContent = 'Adres https:// ile başlamalı ve anahtar boş olmamalı.';
    msg.hidden = false;
    return;
  }
  data.setConfig({ apiUrl, token });
  const btn = $('setup-save');
  btn.disabled = true;
  btn.textContent = 'Bağlanıyor…';
  try {
    await data.getDates();
    showDays();
  } catch (err) {
    msg.textContent = err.code === 'AUTH'
      ? 'Anahtar hatalı. Script Properties\'teki TOKEN ile aynı olmalı.'
      : `Bağlanılamadı: ${err.message} Ayarlar kaydedildi; sol üstten gün listesine geçebilirsiniz.`;
    msg.hidden = false;
    $('setup-back').hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Kaydet ve bağlan';
  }
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

async function showDays() {
  show('days');
  state.dates = data.getCachedDates();
  state.datesInfo = { loading: true };
  renderDays();
  // Liste gönderimi beklemez; kuyrukta olan veya az önce gönderilen günler
  // visibleDates() ile gizlenir.
  flushQueue();
  try {
    const r = await data.getDates();
    state.dates = r.dates;
    state.datesInfo = { offline: r.fromCache };
  } catch (err) {
    state.datesInfo = { error: err };
  }
  renderDays();
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
    dots.push(`<circle cx="${(x + w / 2).toFixed(1)}" cy="14" r="6.5" fill="#061317" stroke="${c}" stroke-width="3.5"/>`);
    x += w;
  }
  return `<svg class="metro" viewBox="0 0 ${W} 28" preserveAspectRatio="none" aria-hidden="true">${segs.join('')}${dots.join('')}</svg>`;
}

function miniBar(sets) {
  return `<div class="mini-bar">${sets.map((s) => `<i style="flex:${Math.max(1, s.mesafe || 0)};background:${blokRenk(s.blok)}"></i>`).join('')}</div>`;
}

function renderBanners() {
  const info = state.datesInfo;
  const banners = [];
  const s = state.session;
  if (s) {
    banners.push(`
      <div class="banner banner-live">
        <div><strong>Devam eden seans</strong><br>${esc(fmtDateTR(s.tarih))}${s.startedAt ? ' · başladı' : ''}</div>
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
          ${sets ? miniBar(sets) : ''}
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
      return showDays();
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
    if (state.screen === 'days') renderDays();
    return;
  }
  const sent = [...r.sent, ...r.duplicates];
  for (const x of sent) state.sentDates.add(x.tarih);
  if (sent.length) toast(`Bekleyen kayıt gönderildi: ${sent.map((x) => fmtDateTR(x.tarih)).join(', ')}`, 4000);
  else if (verbose && r.remaining) toast('Hâlâ gönderilemedi. Bağlantı gelince tekrar denenecek.');
  if (state.screen === 'days') renderDays();
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

  toast('Program yükleniyor…', 10000);
  let r;
  try {
    r = await data.getPlan(tarih);
  } catch (err) {
    toast(`Program yüklenemedi: ${err.message}`, 4000);
    return;
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

  state.plan = r.plan;
  state.session = newSession(tarih);
  persist();
  openProgram();
  if (r.fromCache) toast('Çevrimdışı: son yüklenen program gösteriliyor.');
}

function resumeSession() {
  const s = state.session || data.loadSession();
  const plan = s && data.getCachedPlan(s.tarih);
  if (!s || !plan) {
    data.clearSession();
    state.session = null;
    return showDays();
  }
  state.session = s;
  state.plan = plan;
  if (s.screen === 'form') return openForm();
  if (s.screen === 'stopwatch') {
    openProgram();
    return openStopwatch();
  }
  return openProgram();
}

// ---------------------------------------------------------------------------
// Program ekranı
// ---------------------------------------------------------------------------

// Durak düzeni (metro tekerleği):
//   satır : yığımlı hedef süre · durak noktası · "Tekrar × Mesafe Stil Tür"
//   kart  : blok · ad · n/N; Tekrar × Mesafe; Stil · Tür; açıklama;
//           Hedef / Dinlen; Alet · set mesafesi / yığımlı mesafe
// Yığımlı süre = o sete kadar tekrar × (hedef + dinlen) toplamı.
const hexA = (hex, a) => {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
};

function renderItem(node, s, i, cum) {
  const k = setKey(s, i);
  const isDone = Boolean(state.session.done[k]);
  const r = state.session.results[k] || {};
  const blok = String(s.blok || '').trim().toUpperCase();
  const b = blokOf(s);
  const n = state.plan.setler.length;
  const c = cum[i];
  const styleTur = [s.stil, s.tur].filter(Boolean).join(' · ');
  const rowName = [setTitle(s), s.tur].filter(Boolean).join(' ');
  // Ekranda dakikanın baştaki sıfırı atılır ("01:30" → "1:30"); tablodaki değer değişmez.
  const short = (v) => String(v).replace(/^0(\d:)/, '$1');
  const tile = (label, value) => `<div class="w-tile"><small>${label}</small><b>${esc(short(value))}</b></div>`;
  const tiles = [s.hedef ? tile('HEDEF', s.hedef) : '', s.dinlen ? tile('DİNLEN', s.dinlen) : ''].join('');

  node.className = `w-item${isDone ? ' is-done' : ''}`;
  node.style.setProperty('--c', b.renk);
  node.style.setProperty('--c-soft', hexA(b.renk, 0.35));
  node.style.setProperty('--c-glow', hexA(b.renk, 0.55));
  node.style.setProperty('--c-wash', hexA(b.renk, 0.12));
  node.innerHTML = `
    <div class="w-line"></div>
    <div class="w-dot"></div>
    <div class="w-row">
      <span class="w-tm">${c.time ? fmtDur(c.time) : ''}</span>
      <span class="w-nm">${esc(rowName)}</span>
    </div>
    <div class="w-ctm">${c.time ? fmtDur(c.time) : ''}${setTime(s) ? `<small>+${fmtDur(setTime(s))}</small>` : ''}</div>
    <div class="w-card">
      <div class="w-tag">${isDone ? '✓ TAMAMLANDI · ' : ''}${esc(blok)}${b.ad ? ` · ${esc(b.ad.toLocaleUpperCase('tr'))}` : ''} · ${i + 1}/${n}</div>
      <div class="w-title">${esc(`${Number(s.tekrar) || 1} × ${s.mesafe}`)}</div>
      ${styleTur ? `<div class="w-sub">${esc(styleTur)}</div>` : ''}
      ${s.aciklama ? `<div class="w-desc">${esc(s.aciklama)}</div>` : '<div class="w-desc"></div>'}
      ${tiles ? `<div class="w-tiles">${tiles}</div>` : ''}
      <div class="w-foot">
        ${s.alet ? `<span><span class="w-alet">Alet</span> <b>${esc(s.alet)}</b></span>` : ''}
        ${r.gercek ? `<span><span class="w-alet">Gerçek</span> <b class="w-gercek">${esc(r.gercek)}</b></span>` : ''}
        <span class="w-dist">${fmtNum(setDist(s))} / ${fmtNum(c.dist)} m</span>
      </div>
    </div>`;
}

function openProgram() {
  state.session.screen = 'program';
  state.session.endedAt = null;
  persist();
  show('program');

  if (!state.wheel) {
    state.wheel = new Wheel($('wheel'), {
      onLayout: () => fitAllCards(),
      onChange: (i) => {
        if (!state.session) return;
        state.session.pos = i;
        persist();
        updateAmbient(i);
        updateControls();
        updateBar();
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
function fitCardText(node) {
  const card = node.querySelector('.w-card');
  const desc = node.querySelector('.w-desc');
  if (!card || !desc || !card.clientHeight) return;
  desc.style.fontSize = '';
  let size = parseFloat(getComputedStyle(desc).fontSize);
  while (card.scrollHeight > card.clientHeight + 1 && size > 15) {
    size -= 1;
    desc.style.fontSize = `${size}px`;
  }
}

function fitAllCards() {
  if (state.wheel) state.wheel.items.forEach(fitCardText);
}

/** Başlıktaki değer kutuya sığmazsa yazıyı küçültür (ör. 1:05:12 / 1:30:00). */
function fitText(el, max = 36, min = 22) {
  el.style.fontSize = `${max}px`;
  let size = max;
  while (el.scrollWidth > el.clientWidth + 1 && size > min) {
    size -= 1;
    el.style.fontSize = `${size}px`;
  }
}

function fitHeader() {
  document.querySelectorAll('#screen-program .prog-stat b.fit').forEach((el) => fitText(el));
}

/** Arka plan ve peron, aktif bloğun rengine bürünür. */
function updateAmbient(i) {
  const set = state.plan && state.plan.setler[i];
  if (!set) return;
  const c = blokOf(set).renk;
  $('screen-program').style.setProperty('--amb', hexA(c, 0.12));
}

function refreshItem(i) {
  const node = state.wheel.items[i];
  if (node) {
    renderItem(node, state.plan.setler[i], i, cumulative(state.plan.setler));
    fitCardText(node);
  }
  state.wheel.render();
}

function updateBar() {
  if (!state.session || !state.plan) return;
  const active = state.wheel ? state.wheel.index : -1;
  // Her set bir parça: blok renginde, mesafesiyle orantılı; yapılanlar parlak.
  $('prog-bar').innerHTML = state.plan.setler.map((s, i) => {
    const cls = state.session.done[setKey(s, i)] ? ' is-on' : (i === active ? ' is-cur' : '');
    const c = blokOf(s).renk;
    return `<span class="seg${cls}" style="flex-grow:${Math.max(1, setDist(s))};background:${c};--g:${c}"></span>`;
  }).join('');
}

function updateProgram() {
  if (!state.session || !state.plan) return;
  const sets = state.plan.setler;
  const totalDist = sets.reduce((a, s) => a + setDist(s), 0);
  const totalTime = sets.reduce((a, s) => a + setTime(s), 0);
  $('prog-dist').innerHTML = `${fmtNum(doneDistance())}<span class="dim">/${fmtNum(totalDist)}</span>`;
  $('prog-end').textContent = totalTime ? fmtDur(totalTime) : '—';
  updateBar();
  updateClock();
  updateControls();
  fitHeader();
}

function updateClock() {
  const s = state.session;
  const el = $('prog-clock');
  if (!s) return;
  const text = s.startedAt ? fmtClock(Date.now() - s.startedAt) : '00:00';
  if (el.textContent !== text) {
    const grew = text.length !== el.textContent.length;
    el.textContent = text;
    if (grew) fitHeader();
  }
  el.classList.toggle('is-idle', !s.startedAt);
}

const ICON_PLAY = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
const ICON_FLAG = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></svg>';

function updateControls() {
  const s = state.session;
  if (!s || !state.plan || !state.wheel) return;
  const i = state.wheel.index;
  const set = state.plan.setler[i];
  const isDone = Boolean(set && s.done[setKey(set, i)]);
  $('btn-complete-text').textContent = isDone ? 'İşareti Kaldır' : 'Seti Tamamla';
  $('btn-complete').classList.toggle('is-undo', isDone);

  const sb = $('btn-session');
  sb.innerHTML = s.startedAt ? `${ICON_FLAG}<span>Bitir</span>` : `${ICON_PLAY}<span>Başla</span>`;
  sb.classList.toggle('is-go', !s.startedAt);
  sb.classList.toggle('is-end', Boolean(s.startedAt));
  sb.setAttribute('aria-label', s.startedAt ? 'İdmanı Bitir' : 'İdmana Başla');
}

function startTicker() {
  stopTicker();
  state.ticker = setInterval(updateClock, 500);
}

function stopTicker() {
  clearInterval(state.ticker);
  state.ticker = null;
}

function toggleComplete() {
  const s = state.session;
  const i = state.wheel.index;
  const set = state.plan.setler[i];
  if (!set) return;
  const k = setKey(set, i);

  if (s.done[k]) {
    delete s.done[k];
    persist();
    refreshItem(i);
    updateProgram();
    return;
  }

  s.done[k] = true;
  persist();
  refreshItem(i);
  updateProgram();
  const next = nextUndone(i);
  if (next >= 0) state.wheel.scrollTo(next);
}

/** Aktif setten sonraki ilk işaretsiz set (sona gelince başa sarar). */
function nextUndone(from) {
  const sets = state.plan.setler;
  for (let j = 1; j < sets.length; j++) {
    const idx = (from + j) % sets.length;
    if (!state.session.done[setKey(sets[idx], idx)]) return idx;
  }
  return -1;
}

async function onSessionButton() {
  const s = state.session;
  if (!s.startedAt) {
    s.startedAt = Date.now();
    persist();
    updateProgram();
    return;
  }
  if (!doneCount()) {
    const ok = await modal({
      title: 'Hiç set işaretlenmedi',
      body: '<p>Seans yine de kapatılsın mı?</p>',
      actions: [{ label: 'Evet, kapat', value: true, cls: 'btn-danger' }, { label: 'Vazgeç', value: false }],
    });
    if (!ok) return;
  }
  s.endedAt = Date.now();
  persist();
  openForm();
}

async function onProgramBack() {
  if (!hasProgress(state.session)) {
    data.clearSession();
    state.session = null;
    state.plan = null;
  }
  showDays();
}

// ---------------------------------------------------------------------------
// Kronometre
//
// Tur: o ana kadarki segmenti tur olarak kaydeder, yeni segment başlar.
// Durdur: çalışan segmenti de tur olarak kaydeder ve durur. Böylece hem
// "Başlat–Durdur" ile tekrar tekrar ölçüm hem de sürekli "Tur" ile ara
// dereceler aynı tur listesine düşer.
//
// Çıkışa: hedef + dinlen aralığıyla ("@1:50") bir sonraki tekrarın başlamasına
// kalan süre; son tekrarın başladığı andan sayılır.
// ---------------------------------------------------------------------------

const sw = () => state.session.sw;
const newSw = () => ({ running: false, segStart: null, segAcc: 0, laps: [], repStart: null });

function swSegment(now = Date.now()) {
  const w = sw();
  return w.segAcc + (w.running && w.segStart ? now - w.segStart : 0);
}

function swSet() {
  const i = state.session.swSet != null ? state.session.swSet : (state.wheel ? state.wheel.index : state.session.pos || 0);
  return { i, set: state.plan.setler[i] };
}

const fmtSigned = (sec) => `${sec < 0 ? '−' : '+'}${Math.abs(sec).toFixed(1)}`;

function openStopwatch() {
  state.session.screen = 'stopwatch';
  state.session.swSet = state.wheel ? state.wheel.index : state.session.pos || 0;
  persist();
  show('stopwatch');
  const { set } = swSet();
  $('sw-set').innerHTML = set
    ? `<b>${esc([setTitle(set), set.tur].filter(Boolean).join(' · '))}</b>${set.hedef ? ` · Hedef ${esc(set.hedef)}` : ''}`
    : '';
  $('sw-sheet').hidden = true;
  state.swShown = '';
  renderSw();
  fitStopwatch();
  startSwLoop();
}

function closeStopwatch() {
  state.session.swSet = null;
  openProgram();
}

function startSwLoop() {
  stopSwLoop();
  const loop = () => {
    renderSwTime();
    state.swFrame = requestAnimationFrame(loop);
  };
  state.swFrame = requestAnimationFrame(loop);
}

function stopSwLoop() {
  if (state.swFrame) cancelAnimationFrame(state.swFrame);
  state.swFrame = null;
}

const setText = (id, text) => {
  const el = $(id);
  if (el.textContent !== text) el.textContent = text;
};

function renderSwTime() {
  const w = sw();
  const now = Date.now();
  const { set } = swSet();
  const hedef = set ? parseSec(set.hedef) : 0;
  const aralik = set ? hedef + parseSec(set.dinlen) : 0;
  const laps = w.laps;
  const last = laps.length ? laps[laps.length - 1] : 0;
  const ms = w.running ? swSegment(now) : last;

  // Dev rakamlar
  const f = fmtSw(ms);
  const shown = f.main + f.tenth;
  if (shown !== state.swShown) {
    const lengthChanged = shown.length !== state.swShown.length;
    state.swShown = shown;
    $('sw-main').textContent = f.main;
    $('sw-tenth').textContent = f.tenth;
    if (lengthChanged) fitStopwatch();
  }

  // Hedef çubuğu: işaret hedefte; hedefi aşınca kırmızı.
  if (hedef) {
    const ratio = ms / 1000 / (hedef * 1.1);
    $('sw-pfill').style.width = `${Math.min(100, ratio * 100).toFixed(1)}%`;
    $('sw-pbar').classList.toggle('is-over', ms / 1000 > hedef);
  }

  // Hedefe kalan (çalışırken) / son turun hedefe farkı (dururken)
  const diff = $('sw-diff');
  if (!hedef) {
    setText('sw-diff', '—');
  } else if (w.running) {
    const rem = hedef - ms / 1000;
    setText('sw-diff-label', 'HEDEFE');
    setText('sw-diff', rem >= 0 ? rem.toFixed(1) : fmtSigned(-rem));
    diff.className = rem >= 0 ? 'g' : 'r';
  } else if (laps.length) {
    const d = last / 1000 - hedef;
    setText('sw-diff-label', 'FARK');
    setText('sw-diff', fmtSigned(d));
    diff.className = d <= 0 ? 'g' : 'r';
  } else {
    setText('sw-diff-label', 'HEDEF');
    setText('sw-diff', set.hedef);
    diff.className = '';
  }

  // Çıkışa kalan
  const cikis = $('sw-cikis');
  if (aralik && w.repStart) {
    const rem = aralik - (now - w.repStart) / 1000;
    setText('sw-cikis', rem >= 0 ? fmtDur(Math.ceil(rem)) : `+${fmtDur(Math.floor(-rem))}`);
    cikis.className = rem >= 0 ? 'y' : 'r';
  } else {
    setText('sw-cikis', aralik ? `@${fmtDur(aralik)}` : '—');
    cikis.className = '';
  }
  setText('sw-last', laps.length ? fmtLap(last) : '—');
}

function renderSw() {
  const w = sw();
  const { set } = swSet();
  const tekrar = set ? Number(set.tekrar) || 1 : 1;
  const cur = w.running ? w.laps.length + 1 : Math.max(1, w.laps.length);

  $('sw-startstop').innerHTML = w.running
    ? '<svg width="24" height="24" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/></svg>'
    : '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
  $('sw-startstop').classList.toggle('is-stop', w.running);
  $('sw-ss-label').textContent = w.running ? 'Durdur' : 'Başlat';
  $('sw-lap').textContent = w.running ? 'TUR' : 'BAŞLAT';
  $('screen-stopwatch').classList.toggle('is-running', w.running);

  $('sw-tag').textContent = `${Math.min(cur, Math.max(tekrar, cur))}. TEKRAR / ${tekrar}`;
  const bars = Math.min(12, Math.max(tekrar, w.laps.length + (w.running ? 1 : 0)));
  $('sw-reps').innerHTML = Array.from({ length: bars }, (_, i) => {
    const cls = i < w.laps.length ? 'ok' : (w.running && i === w.laps.length ? 'now' : '');
    return `<i class="${cls}"></i>`;
  }).join('');
  $('sw-pbar').hidden = !(set && parseSec(set.hedef));
  state.swShown = '';
  renderSwTime();
}

function swStartStop() {
  const w = sw();
  const now = Date.now();
  if (w.running) {
    const lap = swSegment(now);
    if (lap > 0) w.laps.push(lap);
    w.running = false;
    w.segStart = null;
    w.segAcc = 0;
  } else {
    w.running = true;
    w.segStart = now;
    w.segAcc = 0;
    w.repStart = now;
  }
  persist();
  renderSw();
}

function swLap() {
  const w = sw();
  if (!w.running) return swStartStop();
  const now = Date.now();
  const lap = swSegment(now);
  if (lap < 300) return; // yanlışlıkla çift dokunma
  w.laps.push(lap);
  w.segStart = now;
  w.segAcc = 0;
  w.repStart = now;
  persist();
  renderSw();
}

async function swReset() {
  const w = sw();
  if (w.laps.length || w.running) {
    const ok = await modal({
      title: 'Sıfırlansın mı?',
      body: '<p>Süre ve alınan turlar silinecek.</p>',
      actions: [{ label: 'Sıfırla', value: true, cls: 'btn-danger' }, { label: 'Vazgeç', value: false }],
    });
    if (!ok) return;
  }
  state.session.sw = newSw();
  persist();
  renderSw();
}

// --- Kaydet paneli -----------------------------------------------------------

function swSave() {
  const w = sw();
  if (w.running) swStartStop();
  if (!w.laps.length) {
    toast('Kaydedilecek tur yok.');
    return;
  }
  state.sheet = { i: swSet().i, picking: false };
  renderSheet();
  $('sw-sheet').hidden = false;
}

function closeSheet() {
  $('sw-sheet').hidden = true;
  state.sheet = null;
}

function renderSheet() {
  const { i, picking } = state.sheet;
  const sets = state.plan.setler;
  const set = sets[i];
  const hedef = parseSec(set.hedef);
  const laps = sw().laps;
  const avg = laps.reduce((a, b) => a + b, 0) / laps.length;
  const b = blokOf(set);
  const lapChip = (l, n) => {
    const cls = hedef ? (l / 1000 <= hedef ? ' g' : ' r') : '';
    return `<div><small>${n}</small><b class="${cls}">${fmtLap(l)}</b></div>`;
  };

  let pick;
  if (picking) {
    pick = `<div class="sheet-list">${sets.map((s, j) => `
      <button class="sheet-set${j === i ? ' is-on' : ''}" data-set="${j}">
        <i style="background:${blokOf(s).renk}"></i>
        <span><b>${esc([setTitle(s), s.tur].filter(Boolean).join(' · '))}</b><small>Set ${j + 1}${s.blok ? ` · ${esc(s.blok)}` : ''}${state.session.done[setKey(s, j)] ? ' · ✓' : ''}</small></span>
      </button>`).join('')}</div>`;
  } else {
    pick = `<button class="sheet-pick" data-act="pick">
      <i style="background:${b.renk}"></i>
      <span><small>SET${i === (state.wheel ? state.wheel.index : -1) ? ' · AKTİF' : ''}</small><b>${esc([setTitle(set), set.tur].filter(Boolean).join(' · '))}</b></span>
      <em>Değiştir</em>
    </button>`;
  }

  const lapsText = laps.map(fmtLap).join(', ');
  $('sw-sheet-body').innerHTML = `
    <div class="sheet-grab"></div>
    <h3>Kaydet</h3>
    ${pick}
    <div class="sheet-laps">${laps.slice(0, 12).map((l, n) => lapChip(l, n + 1)).join('')}</div>
    <div class="sheet-avg"><span>${laps.length > 1 ? `ORTALAMA · ${laps.length} TUR` : 'SÜRE'}</span><b>${fmtLap(avg)}</b></div>
    <button class="sheet-opt o1" data-act="avg">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
      <span><b>${laps.length > 1 ? 'Ortalama → Gerçek' : 'Süre → Gerçek'}</b><small>Gerçek sütununa ${fmtLap(avg)} yazılır</small></span>
    </button>
    ${laps.length > 1 ? `<button class="sheet-opt o2" data-act="avg+laps">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="M7.5 10.5L12 15l4.5-4.5"/><path d="M5 19h14"/></svg>
      <span><b>Ortalama + turlar → Not</b><small>Not: ${esc(lapsText)}</small></span>
    </button>` : ''}
    <button class="sheet-cancel" data-act="cancel">Vazgeç</button>`;
}

function onSheetClick(e) {
  const setBtn = e.target.closest('[data-set]');
  if (setBtn) {
    state.sheet = { i: Number(setBtn.dataset.set), picking: false };
    renderSheet();
    return;
  }
  const act = e.target.closest('[data-act]');
  if (!act) return;
  if (act.dataset.act === 'pick') {
    state.sheet.picking = true;
    renderSheet();
  } else if (act.dataset.act === 'cancel') {
    closeSheet();
  } else {
    applySwResult(state.sheet.i, act.dataset.act);
  }
}

function applySwResult(i, how) {
  const set = state.plan.setler[i];
  const laps = sw().laps.slice();
  const avg = laps.reduce((a, b) => a + b, 0) / laps.length;
  const k = setKey(set, i);
  const r = state.session.results[k] || (state.session.results[k] = {});
  r.gercek = fmtLap(avg);
  if (how === 'avg+laps') {
    const text = `Turlar: ${laps.map(fmtLap).join(', ')}`;
    r.not = r.not ? `${r.not} | ${text}` : text;
  }
  // Ölçülen set yapılmış demektir; işareti kullanıcı programda kaldırabilir.
  state.session.done[k] = true;
  state.session.sw = newSw();
  state.session.pos = i;
  persist();
  closeSheet();
  closeStopwatch();
  toast(`Set ${i + 1}: Gerçek ${r.gercek} kaydedildi`);
}

/** Süre rakamlarını panele sığan en büyük boyuta getirir, sonra dikeyde uzatır. */
function fitStopwatch() {
  const box = $('sw-dz');
  const time = $('sw-time');
  if (!box.clientWidth) return;
  time.style.fontSize = '100px';
  time.style.transform = 'none';
  const w = time.scrollWidth || 1;
  const size = Math.floor((100 * box.clientWidth * 0.96) / w);
  time.style.fontSize = `${size}px`;
  // Yüzerken uzaktan okunabilsin: rakamlar alanın yüksekliğini doldurur.
  const glyph = size * 0.74;
  const stretch = Math.max(1, Math.min(2.8, (box.clientHeight * 0.9) / glyph));
  time.style.transform = `scaleY(${stretch.toFixed(3)})`;
}

// ---------------------------------------------------------------------------
// Seans sonu formu
// ---------------------------------------------------------------------------

function openForm() {
  const s = state.session;
  s.screen = 'form';
  if (!s.endedAt) s.endedAt = Date.now();
  const autoSure = s.startedAt ? fmtHMS(s.endedAt - s.startedAt) : '';
  const autoMesafe = doneDistance();
  if (!s.form) {
    s.form = { sure: autoSure, mesafe: autoMesafe, havuz: 25, rpe: null, msi: {}, aciklama: '', sureEdited: false, mesafeEdited: false };
  } else {
    if (!s.form.sureEdited) s.form.sure = autoSure;
    if (!s.form.mesafeEdited) s.form.mesafe = autoMesafe;
  }
  persist();
  show('form');
  renderForm();
  $('form-msg').hidden = true;
  $('form-scroll').scrollTop = 0;
}

function renderForm() {
  const f = state.session.form;
  $('f-sure').value = f.sure;
  $('f-mesafe').value = f.mesafe;
  $('f-aciklama').value = f.aciklama;
  for (const b of $('f-havuz').children) b.classList.toggle('is-on', Number(b.dataset.v) === f.havuz);

  $('f-rpe').innerHTML = Array.from({ length: 11 }, (_, n) =>
    `<button data-v="${n}" class="${f.rpe === n ? 'is-on' : ''}">${n}</button>`).join('');

  $('f-msi').innerHTML = MSI_BOLGELER.map((b) => `
    <div class="msi-row">
      <span class="msi-label">${b.label}</span>
      <div class="msi-vals">
        ${MSI_DEGERLER.map((v) => `<button data-bolge="${b.key}" data-v="${v}" class="${f.msi[b.key] === v ? 'is-on' : ''}">${String(v).replace('.', ',')}</button>`).join('')}
      </div>
    </div>`).join('');
}

function formMsiString(msi) {
  return MSI_BOLGELER
    .filter((b) => msi[b.key] !== undefined && msi[b.key] !== null)
    .map((b) => `${b.key} ${msi[b.key]}`)
    .join('; ');
}

function normalizeSure(v) {
  const m = String(v).trim().match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
  if (!m) return null;
  return m[3] === undefined
    ? `00:${pad2(m[1])}:${pad2(m[2])}`
    : `${pad2(m[1])}:${pad2(m[2])}:${pad2(m[3])}`;
}

function buildPayload() {
  const s = state.session;
  const f = s.form;
  return {
    tarih: s.tarih,
    seans: {
      sure: f.sure,
      mesafe: Number(f.mesafe) || 0,
      havuz: f.havuz,
      rpe: f.rpe === null ? '' : f.rpe,
      msi: formMsiString(f.msi),
      aciklama: f.aciklama,
    },
    setler: state.plan.setler.map((set, i) => {
      const k = setKey(set, i);
      if (!s.done[k]) return { sira: set.sira, tamamlandi: false };
      const r = s.results[k] || {};
      return {
        sira: set.sira,
        tamamlandi: true,
        gercek: r.gercek || '',
        kulac: r.kulac ?? '',
        nabiz: r.nabiz ?? '',
        rpe: r.rpe ?? '',
        msi: r.msi || '',
        not: r.not || '',
      };
    }),
  };
}

async function saveForm() {
  const f = state.session.form;
  const msg = $('form-msg');
  msg.hidden = true;

  const sure = f.sure === '' ? '' : normalizeSure(f.sure);
  if (sure === null) {
    msg.textContent = 'Süre ss:dd:ss biçiminde olmalı (ör. 01:24:08).';
    msg.hidden = false;
    return;
  }
  f.sure = sure;
  persist();

  const payload = buildPayload();
  const btn = $('form-save');
  btn.disabled = true;
  btn.textContent = 'Kaydediliyor…';
  let result;
  try {
    result = await data.finishSession(payload);
  } catch (err) {
    await handleSaveError(err, payload);
    return;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Kaydet';
  }
  endSessionLocally();
  showDone({ ok: true, result });
}

async function handleSaveError(err, payload) {
  if (err.code === 'DUPLICATE') {
    const close = await modal({
      title: 'Bu seans zaten kayıtlı',
      body: `<p>${esc(fmtDateTR(payload.tarih))} için tabloda kayıt var; ikinci kez yazılmadı ve hiçbir şey silinmedi.</p>`,
      actions: [{ label: 'Seansı kapat', value: true, cls: 'btn-primary' }, { label: 'Forma dön', value: false }],
    });
    if (close) {
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
      { label: 'Forma dön', value: '' },
    ],
  });
  if (choice === 'retry') saveForm();
  else if (choice === 'queue') queueAndClose(payload, err);
}

function queueAndClose(payload, err) {
  data.enqueue(payload, { code: err.code || 'CLIENT', message: err.message });
  endSessionLocally();
  showDone({ ok: false });
}

function onFormInput(e) {
  const f = state.session.form;
  const t = e.target;
  if (t.id === 'f-sure') { f.sure = t.value; f.sureEdited = true; }
  else if (t.id === 'f-mesafe') { f.mesafe = t.value; f.mesafeEdited = true; }
  else if (t.id === 'f-aciklama') f.aciklama = t.value;
  else return;
  persist();
}

function onFormClick(e) {
  const f = state.session.form;
  const b = e.target.closest('button[data-v]');
  if (!b) return;
  const v = Number(b.dataset.v);
  if (b.parentElement.id === 'f-havuz') f.havuz = v;
  else if (b.parentElement.id === 'f-rpe') f.rpe = f.rpe === v ? null : v;
  else if (b.dataset.bolge) {
    // Tekrar dokunmak seçimi kaldırır: boş ile 0 aynı şey değildir.
    const k = b.dataset.bolge;
    if (f.msi[k] === v) delete f.msi[k];
    else f.msi[k] = v;
  } else return;
  persist();
  renderForm();
}

function onFormBack() {
  state.session.endedAt = null;
  openProgram();
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
    text = `${result.yazilanSet} set "eski" sayfasına yazıldı, ${result.silinenSet} satır Plan'dan silindi.`;
    if (result.uyari) text += ` ${result.uyari}`;
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
  $('setup-back').addEventListener('click', () => showDays());

  $('days-refresh').addEventListener('click', () => showDays());
  $('days-settings').addEventListener('click', () => showSetup(true));
  $('days-list').addEventListener('click', onDaysClick);
  $('days-banners').addEventListener('click', onDaysClick);
  $('days-today-btn').addEventListener('click', () => { if (state.selDate) openDate(state.selDate); });
  $('days-hero').addEventListener('click', onDaysClick);
  $('wk-today').addEventListener('click', () => selectDay(todayKey(), false));
  wireWeekSwipe();

  $('prog-back').addEventListener('click', onProgramBack);
  $('btn-complete').addEventListener('click', toggleComplete);
  $('btn-session').addEventListener('click', onSessionButton);
  $('btn-stopwatch').addEventListener('click', openStopwatch);

  $('sw-close').addEventListener('click', closeStopwatch);
  $('sw-startstop').addEventListener('click', swStartStop);
  $('sw-reset').addEventListener('click', swReset);
  $('sw-save').addEventListener('click', swSave);
  $('sw-lap').addEventListener('pointerdown', (e) => { e.preventDefault(); swLap(); });
  $('sw-display').addEventListener('pointerdown', () => { if (sw().running) swLap(); });
  $('sw-sheet-body').addEventListener('click', onSheetClick);
  $('sw-sheet-dim').addEventListener('click', closeSheet);

  $('screen-form').addEventListener('input', onFormInput);
  $('screen-form').addEventListener('click', onFormClick);
  $('form-back').addEventListener('click', onFormBack);
  $('form-save').addEventListener('click', saveForm);

  $('done-back').addEventListener('click', () => showDays());
  $('app-version').textContent = `Sürüm ${APP_VERSION}`;
  // Yazı tipi yüklenince ölçüler değişir: tekerleği ve kronometreyi yeniden ölç.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (state.wheel) state.wheel.layout();
      if (state.screen === 'stopwatch') fitStopwatch();
    });
  }

  // Beklenmeyen bir hata sessiz kalmasın ve ekranı kilitlemesin.
  const report = (msg) => {
    toast(`Beklenmeyen hata: ${msg}`, 6000);
    $('modal').hidden = true;
  };
  window.addEventListener('error', (e) => report(e.message));
  window.addEventListener('unhandledrejection', (e) => report((e.reason && e.reason.message) || String(e.reason)));

  window.addEventListener('resize', () => { if (state.screen === 'stopwatch') fitStopwatch(); });
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
    resumeSession();
    flushQueue();
    return;
  }
  if (s) data.clearSession();
  showDays();
}

boot();
