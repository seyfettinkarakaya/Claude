// YüzmeSK — arayüz. Veriye yalnızca data.js üzerinden erişir.

import * as data from './data.js';
import { Wheel } from './wheel.js';

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

function setTitle(s) {
  const tekrar = Number(s.tekrar) || 1;
  const stil = s.stil ? ` ${s.stil}` : '';
  return tekrar > 1 ? `${tekrar} × ${s.mesafe}${stil}` : `${s.mesafe}${stil}`;
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
    sw: { running: false, segStart: null, segAcc: 0, laps: [] },
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

function endSessionLocally() {
  const tarih = state.session && state.session.tarih;
  data.clearSession();
  if (tarih) data.forgetDate(tarih);
  state.session = null;
  state.plan = null;
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
    showDays({ auto: true });
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
// Gün seçimi
// ---------------------------------------------------------------------------

async function showDays({ auto = false } = {}) {
  show('days');
  state.dates = data.getCachedDates();
  state.datesInfo = { loading: true };
  renderDays();
  // Önce bekleyen kayıtları gönder: yoksa liste, az önce kaydedilen günü hâlâ içerebilir.
  await flushQueue().catch(() => {});
  try {
    const r = await data.getDates();
    state.dates = r.dates;
    state.datesInfo = { offline: r.fromCache };
    renderDays();
    const list = visibleDates();
    if (auto && !state.session && list.length === 1 && state.screen === 'days') {
      openDate(list[0].tarih);
    }
  } catch (err) {
    state.datesInfo = { error: err };
    renderDays();
  }
}

/** Kuyrukta bekleyen (kaydedilmiş ama gönderilmemiş) günler listede görünmez. */
function visibleDates() {
  const queued = new Set(data.getQueue().map((q) => q.payload.tarih));
  return (state.dates || []).filter((d) => !queued.has(d.tarih));
}

function renderDays() {
  const today = todayKey();
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

  const list = $('days-list');
  const dates = visibleDates();
  if (!state.dates && info.loading) {
    list.innerHTML = '<p class="empty">Yükleniyor…</p>';
    $('days-today-bar').hidden = true;
    return;
  }
  if (!dates.length) {
    list.innerHTML = `
      <div class="empty">
        <p>Planlanmış idman yok</p>
        <button class="btn btn-primary" data-act="refresh">Yenile</button>
      </div>`;
    $('days-today-bar').hidden = true;
    return;
  }

  const upcoming = dates.filter((d) => d.tarih >= today);
  const past = dates.filter((d) => d.tarih < today).reverse();
  const card = (d, extraCls = '') => `
    <button class="day-card ${extraCls}" data-tarih="${esc(d.tarih)}">
      <span class="day-date">${esc(fmtDateTR(d.tarih))}</span>
      <span class="day-meta">${d.setSayisi} set · ${fmtNum(d.toplamMesafe)} m</span>
      ${d.tarih === today ? '<span class="pill">BUGÜN</span>' : ''}
      ${s && s.tarih === d.tarih ? '<span class="pill pill-live">DEVAM EDİYOR</span>' : ''}
    </button>`;

  let html = upcoming.map((d) => card(d, d.tarih === today ? 'is-today' : '')).join('');
  if (past.length) {
    html += '<h2 class="section-title">Geçmiş planlar</h2>';
    html += past.map((d) => card(d, 'is-past')).join('');
  }
  list.innerHTML = html;
  $('days-today-bar').hidden = !upcoming.some((d) => d.tarih === today);
}

async function onDaysClick(e) {
  const cardEl = e.target.closest('[data-tarih]');
  if (cardEl) return openDate(cardEl.dataset.tarih);
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
  const r = await data.flushQueue();
  const sent = [...r.sent, ...r.duplicates];
  if (sent.length && state.dates) {
    const gone = new Set(sent.map((x) => x.tarih));
    state.dates = state.dates.filter((d) => !gone.has(d.tarih));
  }
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

function renderItem(node, s, i) {
  const k = setKey(s, i);
  const isDone = Boolean(state.session.done[k]);
  const r = state.session.results[k] || {};
  const blok = String(s.blok || '').toUpperCase();
  const line2 = [s.tur, s.alet].filter(Boolean).join(' · ');

  node.className = `w-item${isDone ? ' is-done' : ''}`;
  node.innerHTML = `
    <div class="w-top">
      ${blok ? `<span class="badge badge-${esc(blok)}">${esc(blok)}</span>` : ''}
      <span class="w-no">Set ${i + 1}</span>
      ${isDone ? '<span class="w-status">✓ Tamamlandı</span>' : ''}
    </div>
    <div class="w-main"><span class="w-check">✓</span><span class="w-title">${esc(setTitle(s))}</span></div>
    <div class="w-detail">
      ${line2 ? `<div class="w-line2">${esc(line2)}</div>` : ''}
      ${s.hedef || s.dinlen ? `<div class="w-line3">
        ${s.hedef ? `<span><small>Hedef</small> ${esc(s.hedef)}</span>` : ''}
        ${s.dinlen ? `<span><small>Dinlen</small> ${esc(s.dinlen)}</span>` : ''}
      </div>` : ''}
      ${s.aciklama ? `<div class="w-desc">${esc(s.aciklama)}</div>` : ''}
      ${r.gercek ? `<div class="w-result">⏱ Gerçek ${esc(r.gercek)}</div>` : ''}
    </div>`;
}

function openProgram() {
  state.session.screen = 'program';
  state.session.endedAt = null;
  persist();
  show('program');

  if (!state.wheel) {
    state.wheel = new Wheel($('wheel'), {
      onChange: (i) => {
        if (!state.session) return;
        state.session.pos = i;
        persist();
        updateControls();
      },
    });
  }
  const nodes = state.plan.setler.map((s, i) => {
    const node = document.createElement('div');
    renderItem(node, s, i);
    return node;
  });
  state.wheel.setItems(nodes, state.session.pos || 0);
  updateProgram();
  startTicker();
}

function refreshItem(i) {
  const node = state.wheel.items[i];
  if (node) renderItem(node, state.plan.setler[i], i);
  state.wheel.layout();
}

function updateProgram() {
  if (!state.session || !state.plan) return;
  const total = state.plan.setler.length;
  const totalDist = state.plan.setler.reduce((a, s) => a + setDist(s), 0);
  const dist = doneDistance();
  const pct = totalDist ? Math.round((dist / totalDist) * 100) : 0;

  $('prog-count').textContent = `${doneCount()} / ${total}`;
  $('prog-dist').textContent = `${fmtNum(dist)} / ${fmtNum(totalDist)} m · %${pct}`;
  $('prog-bar').style.width = `${pct}%`;
  updateClock();
  updateControls();
}

function updateClock() {
  const s = state.session;
  const el = $('prog-clock');
  if (!s) return;
  el.textContent = s.startedAt ? fmtClock(Date.now() - s.startedAt) : '00:00';
  el.classList.toggle('is-idle', !s.startedAt);
}

function updateControls() {
  const s = state.session;
  if (!s || !state.plan || !state.wheel) return;
  const i = state.wheel.index;
  const set = state.plan.setler[i];
  const isDone = set && s.done[setKey(set, i)];
  const btn = $('btn-complete');
  btn.textContent = isDone ? 'İşareti Kaldır' : 'Seti Tamamla';
  btn.classList.toggle('btn-primary', !isDone);
  btn.classList.toggle('btn-secondary', Boolean(isDone));

  const sb = $('btn-session');
  sb.textContent = s.startedAt ? 'İdmanı Bitir' : 'İdmana Başla';
  sb.classList.toggle('btn-go', !s.startedAt);
  sb.classList.toggle('btn-danger', Boolean(s.startedAt));
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
// ---------------------------------------------------------------------------

const sw = () => state.session.sw;

function swSegment(now = Date.now()) {
  const w = sw();
  return w.segAcc + (w.running && w.segStart ? now - w.segStart : 0);
}

function openStopwatch() {
  state.session.screen = 'stopwatch';
  persist();
  show('stopwatch');
  const i = state.wheel ? state.wheel.index : state.session.pos || 0;
  const set = state.plan.setler[i];
  $('sw-set').textContent = set
    ? `${setTitle(set)}${set.hedef ? ` · Hedef ${set.hedef}` : ''}`
    : '';
  state.swShown = '';
  renderSw();
  fitStopwatch();
  startSwLoop();
}

function closeStopwatch() {
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

function renderSwTime() {
  const w = sw();
  const ms = w.running ? swSegment() : (w.laps.length ? w.laps[w.laps.length - 1] : 0);
  const f = fmtSw(ms);
  const shown = f.main + f.tenth;
  if (shown === state.swShown) return;
  const lengthChanged = shown.length !== state.swShown.length;
  state.swShown = shown;
  $('sw-main').textContent = f.main;
  $('sw-tenth').textContent = f.tenth;
  if (lengthChanged) fitStopwatch();
}

function renderSw() {
  const w = sw();
  const btn = $('sw-startstop');
  btn.textContent = w.running ? 'Durdur' : 'Başlat';
  btn.classList.toggle('btn-go', !w.running);
  btn.classList.toggle('btn-danger', w.running);
  $('sw-lap').textContent = w.running ? 'TUR' : 'BAŞLAT';
  $('screen-stopwatch').classList.toggle('is-running', w.running);

  const laps = w.laps;
  if (laps.length) {
    const sum = laps.reduce((a, b) => a + b, 0);
    $('sw-avg').textContent = `Ort. ${fmtLap(sum / laps.length)} · ${laps.length} tur · Toplam ${fmtLap(sum)}`;
  } else {
    $('sw-avg').textContent = 'Tur yok';
  }
  $('sw-state').textContent = w.running
    ? (laps.length ? `Son tur ${fmtLap(laps[laps.length - 1])}` : '')
    : (laps.length ? 'Durdu — son tur' : 'Hazır');
  $('sw-laps').innerHTML = laps.map((l, i) => `<li><span>${i + 1}</span>${fmtLap(l)}</li>`).join('');
  $('sw-laps').scrollTop = $('sw-laps').scrollHeight;
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
  state.session.sw = { running: false, segStart: null, segAcc: 0, laps: [] };
  persist();
  renderSw();
}

async function swSave() {
  const w = sw();
  if (w.running) swStartStop();
  if (!w.laps.length) {
    toast('Kaydedilecek tur yok.');
    return;
  }

  // 1) Hangi set? Aktif set en üstte ve vurgulu.
  const active = state.wheel ? state.wheel.index : state.session.pos || 0;
  const order = [active, ...state.plan.setler.map((_, i) => i).filter((i) => i !== active)];
  const list = document.createElement('div');
  list.className = 'pick-list';
  list.innerHTML = order.map((i) => {
    const s = state.plan.setler[i];
    const isDone = state.session.done[setKey(s, i)];
    return `
      <button class="pick${i === active ? ' is-active' : ''}" data-value="${i}">
        <strong>${esc(setTitle(s))}</strong>
        <small>Set ${i + 1}${s.blok ? ` · ${esc(s.blok)}` : ''}${i === active ? ' · aktif set' : ''}${isDone ? ' · ✓' : ''}</small>
      </button>`;
  }).join('');
  const picked = await modal({ title: 'Hangi sete ait?', body: list, actions: [{ label: 'Vazgeç', value: '' }] });
  if (picked === '' || picked == null) return;
  const i = Number(picked);
  const set = state.plan.setler[i];

  // 2) Nasıl kaydedilsin?
  const laps = w.laps.slice();
  const avg = laps.reduce((a, b) => a + b, 0) / laps.length;
  const actions = [{ label: 'Ortalama → Gerçek', value: 'avg', cls: 'btn-primary' }];
  if (laps.length > 1) actions.push({ label: 'Ortalama → Gerçek, turlar → Not', value: 'avg+laps', cls: 'btn-primary' });
  actions.push({ label: 'Vazgeç', value: '' });
  const how = await modal({
    title: setTitle(set),
    body: `<p>${laps.length > 1 ? `Ortalama <strong>${fmtLap(avg)}</strong> (${laps.length} tur)` : `Süre <strong>${fmtLap(avg)}</strong>`}</p>`,
    actions,
  });
  if (!how) return;

  const k = setKey(set, i);
  const r = state.session.results[k] || (state.session.results[k] = {});
  r.gercek = fmtLap(avg);
  if (how === 'avg+laps') {
    const text = `Turlar: ${laps.map(fmtLap).join(', ')}`;
    r.not = r.not ? `${r.not} | ${text}` : text;
  }
  // Ölçülen set yapılmış demektir; işareti kullanıcı programda kaldırabilir.
  state.session.done[k] = true;
  state.session.sw = { running: false, segStart: null, segAcc: 0, laps: [] };
  state.session.pos = i;
  persist();
  closeStopwatch();
  toast(`Set ${i + 1}: Gerçek ${r.gercek} kaydedildi`);
}

/** Süre rakamlarını gösterge alanına sığan en büyük boyuta getirir. */
function fitStopwatch() {
  const box = $('sw-display');
  const time = $('sw-time');
  if (!box.clientWidth) return;
  time.style.fontSize = '100px';
  time.style.transform = 'none';
  const w = time.scrollWidth || 1;
  const size = Math.floor((100 * box.clientWidth * 0.94) / w);
  time.style.fontSize = `${size}px`;
  // Rakamları dikeyde de uzatarak alanı doldur (uzaktan okunabilirlik).
  const glyph = size * 0.74;
  const stretch = Math.max(1, Math.min(2.1, (box.clientHeight * 0.78) / glyph));
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
  // Kayıt tabloya yazıldı; buradan sonraki yerel temizlik hatası kaydı etkilemez.
  try {
    endSessionLocally();
  } catch {
    data.clearSession();
    state.session = null;
    state.plan = null;
  }
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
  data.enqueue(payload, err);
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
  $('days-today-btn').addEventListener('click', () => openDate(todayKey()));

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

  $('screen-form').addEventListener('input', onFormInput);
  $('screen-form').addEventListener('click', onFormClick);
  $('form-back').addEventListener('click', onFormBack);
  $('form-save').addEventListener('click', saveForm);

  $('done-back').addEventListener('click', () => showDays());

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
  showDays({ auto: true });
}

boot();
