// data.js birim testleri: localStorage ve fetch sahte, Node'da çalışır.
//   node tests/test-data.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ysk-'));
const modPath = path.join(tmp, 'data.mjs');
fs.copyFileSync(path.join(here, '..', 'data.js'), modPath);

// --- sahte ortam -------------------------------------------------------------
class Store {
  constructor() { this.m = new Map(); this.full = false; }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { if (this.full) throw new Error('QuotaExceededError'); this.m.set(k, String(v)); }
  removeItem(k) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
globalThis.localStorage = new Store();
let handler = null; // (body) => { status, json } | throws
const calls = [];
globalThis.fetch = async (url, opts) => {
  const body = JSON.parse(opts.body);
  calls.push(body.action);
  if (opts.signal && opts.signal.aborted) throw Object.assign(new Error('aborted'), { name: 'AbortError' });
  const r = await handler(body, opts);
  return { ok: r.status === undefined || r.status < 400, status: r.status || 200, json: async () => { if (r.raw) throw new Error('bad json'); return r.json; } };
};

const data = await import(pathToFileURL(modPath).href);
const LS = globalThis.localStorage;
const reset = () => { LS.clear(); LS.full = false; calls.length = 0; handler = null; };
const cfg = () => data.setConfig({ apiUrl: 'https://script.google.com/macros/s/X/exec', token: 'tok' });
let n = 0;
const test = async (name, fn) => { reset(); await fn(); n++; };

// --- Ayarlar ------------------------------------------------------------------
await test('config boş/bozuk/geçerli', () => {
  assert.deepEqual(data.getConfig(), { apiUrl: '', token: '' });
  assert.equal(data.isConfigured(), false);
  LS.setItem('ysk.config', '{bozuk');
  assert.deepEqual(data.getConfig(), { apiUrl: '', token: '' });
  LS.setItem('ysk.config', JSON.stringify({ apiUrl: 5, token: ['x'] }));
  assert.deepEqual(data.getConfig(), { apiUrl: '', token: '' });
  data.setConfig({ apiUrl: '  https://a/exec ', token: ' t ' });
  assert.deepEqual(data.getConfig(), { apiUrl: 'https://a/exec', token: 't' });
  assert.equal(data.isConfigured(), true);
  data.clearConfig();
  assert.equal(data.isConfigured(), false);
});

await test('tercihler: varsayılan, doğrulama, kısmi güncelleme', () => {
  assert.deepEqual(data.getPrefs(), { ses: true, css: 117 });
  LS.setItem('ysk.prefs', JSON.stringify({ ses: 'evet', css: -3 }));
  assert.deepEqual(data.getPrefs(), { ses: true, css: 117 }, 'geçersiz değerler yok sayılır');
  data.setPrefs({ ses: false });
  assert.deepEqual(data.getPrefs(), { ses: false, css: 117 });
  data.setPrefs({ css: null });
  assert.deepEqual(data.getPrefs(), { ses: false, css: null });
  LS.setItem('ysk.prefs', '[]');
  assert.deepEqual(data.getPrefs(), { ses: true, css: 117 });
});

// --- Sunucu çağrıları ----------------------------------------------------------
await test('yapılandırma yoksa NO_CONFIG', async () => {
  await assert.rejects(data.getDates(), (e) => e.code === 'NO_CONFIG' && !e.transient);
});

await test('HTTP, geçersiz JSON, sunucu hatası, ağ hatası kodları', async () => {
  cfg();
  handler = () => ({ status: 500 });
  await assert.rejects(data.fetchPlan('2026-09-29'), (e) => e.code === 'HTTP' && e.transient);
  handler = () => ({ raw: true });
  await assert.rejects(data.fetchPlan('2026-09-29'), (e) => e.code === 'BAD_RESPONSE' && e.transient);
  handler = () => ({ json: { ok: false, error: 'AUTH', message: 'Geçersiz' } });
  await assert.rejects(data.fetchPlan('2026-09-29'), (e) => e.code === 'AUTH' && !e.transient && e.message === 'Geçersiz');
  handler = () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(data.fetchPlan('2026-09-29'), (e) => e.code === 'NETWORK' && e.transient);
  handler = () => ({ json: { ok: true, data: { setler: 'x' } } });
  await assert.rejects(data.fetchPlan('2026-09-29'), (e) => e.code === 'BAD_RESPONSE');
  handler = () => ({ json: { ok: false } });
  await assert.rejects(data.fetchPlan('2026-09-29'), (e) => e.code === 'UNKNOWN');
});

await test('istek gövdesi: action + token, text/plain', async () => {
  cfg();
  let seen;
  handler = (b, o) => { seen = { b, o }; return { json: { ok: true, data: { tarih: 'x', setler: [] } } }; };
  await data.fetchPlan('2026-09-29');
  assert.equal(seen.b.action, 'getPlan'); assert.equal(seen.b.token, 'tok'); assert.equal(seen.b.tarih, '2026-09-29');
  assert.match(seen.o.headers['Content-Type'], /^text\/plain/);
});

const DATES = [
  { tarih: '2026-09-29', setSayisi: 2, toplamMesafe: 600, hedefSure: 600, setler: [{ blok: 'WU', mesafe: 200, sure: 240 }],
    detay: [{ sira: 1, blok: 'WU', tekrar: 1, mesafe: 200 }, { sira: 2, blok: 'MS', tekrar: 4, mesafe: 100 }] },
  { tarih: '2026-10-02', setSayisi: 1, toplamMesafe: 400, hedefSure: 0, setler: [], detay: [{ sira: 1, blok: 'WU', tekrar: 1, mesafe: 400 }] },
];

await test('getDates: detay programları önbelleğe alır, listede tutmaz', async () => {
  cfg();
  handler = () => ({ json: { ok: true, data: DATES } });
  const r = await data.getDates();
  assert.equal(r.fromCache, false);
  assert.ok(r.dates.every((d) => !('detay' in d)), 'detay listeden çıkarılır');
  assert.ok(!LS.getItem('ysk.dates').includes('detay'));
  assert.deepEqual(data.getCachedPlan('2026-09-29').setler.map((s) => s.sira), [1, 2]);
  assert.equal(data.getCachedPlan('2026-10-02').setler.length, 1);
});

await test('getDates: devam eden seansın programına dokunmaz', async () => {
  cfg();
  data.storePlan({ tarih: '2026-09-29', setler: [{ sira: 9, blok: 'CD' }] });
  data.saveSession({ tarih: '2026-09-29', done: {}, results: {}, sw: { laps: [] } });
  handler = () => ({ json: { ok: true, data: DATES } });
  await data.getDates();
  assert.deepEqual(data.getCachedPlan('2026-09-29').setler.map((s) => s.sira), [9], 'seans programı sabit kalır');
  assert.equal(data.getCachedPlan('2026-10-02').setler.length, 1);
});

await test('getDates: eski sunucu (detay yok), liste dışı günler budanır', async () => {
  cfg();
  data.storePlan({ tarih: '2026-01-01', setler: [{ sira: 1 }] });
  handler = () => ({ json: { ok: true, data: DATES.map(({ detay, ...d }) => d) } });
  await data.getDates();
  assert.equal(data.getCachedPlan('2026-09-29'), null);
  assert.equal(data.getCachedPlan('2026-01-01'), null, 'listede olmayan gün silinir');
});

await test('getDates: {dates:[…]} biçimi, bozuk liste, çevrimdışı önbellek', async () => {
  cfg();
  handler = () => ({ json: { ok: true, data: { dates: DATES } } });
  assert.equal((await data.getDates()).dates.length, 2);
  handler = () => ({ json: { ok: true, data: { bozuk: 1 } } });
  const r = await data.getDates(); // BAD_RESPONSE geçici → önbellek
  assert.equal(r.fromCache, true); assert.equal(r.error.code, 'BAD_RESPONSE');
  handler = () => { throw new Error('ağ yok'); };
  const r2 = await data.getDates();
  assert.equal(r2.fromCache, true); assert.equal(r2.dates.length, 2);
  handler = () => ({ json: { ok: false, error: 'AUTH' } });
  await assert.rejects(data.getDates(), (e) => e.code === 'AUTH', 'kalıcı hata önbelleğe düşmez');
  LS.setItem('ysk.dates', JSON.stringify({ dates: 'bozuk' }));
  assert.equal(data.getCachedDates(), null);
  handler = () => { throw new Error('ağ yok'); };
  await assert.rejects(data.getDates(), (e) => e.code === 'NETWORK', 'bozuk önbellek + ağ yok');
});

await test('getPlan: kaydeder; ağ yoksa önbellek; yoksa hata', async () => {
  cfg();
  handler = () => ({ json: { ok: true, data: { tarih: '2026-09-29', setler: [{ sira: 1 }] } } });
  const r = await data.getPlan('2026-09-29');
  assert.equal(r.fromCache, false); assert.equal(data.getCachedPlan('2026-09-29').setler.length, 1);
  handler = () => { throw new Error('x'); };
  assert.equal((await data.getPlan('2026-09-29')).fromCache, true);
  await assert.rejects(data.getPlan('2026-12-31'), (e) => e.code === 'NETWORK');
});

await test('fetchPlan önbelleğe yazmaz', async () => {
  cfg();
  handler = () => ({ json: { ok: true, data: { tarih: '2026-09-29', setler: [{ sira: 1 }] } } });
  await data.fetchPlan('2026-09-29');
  assert.equal(data.getCachedPlan('2026-09-29'), null);
});

await test('forgetDate: listeden ve programlardan çıkarır; bozuk önbellekte çökmez', async () => {
  cfg();
  handler = () => ({ json: { ok: true, data: DATES } });
  await data.getDates();
  data.forgetDate('2026-09-29');
  assert.deepEqual(data.getCachedDates().map((d) => d.tarih), ['2026-10-02']);
  assert.equal(data.getCachedPlan('2026-09-29'), null);
  LS.setItem('ysk.dates', '"bozuk"'); LS.setItem('ysk.plans', '[1,2]');
  data.forgetDate('2026-10-02');
  assert.equal(LS.getItem('ysk.dates'), null);
});

await test('seans doğrulaması', () => {
  assert.equal(data.loadSession(), null);
  LS.setItem('ysk.session', JSON.stringify({ tarih: 'x' }));
  assert.equal(data.loadSession(), null, 'eksik alanlı seans yok sayılır');
  const s = { tarih: '2026-09-29', done: {}, results: {}, sw: { laps: [] } };
  data.saveSession(s);
  assert.deepEqual(data.loadSession(), s);
  data.clearSession();
  assert.equal(data.loadSession(), null);
});

// --- Yapılmış idmanlar -------------------------------------------------------------
const rec = (tarih, status = 'sent') => ({ id: `${tarih}-1`, tarih, savedAt: 1, status, seans: {}, setler: [] });

await test('geçmiş: ekle, aynı günü değiştir, sırala, sil, bozuk kayıtları ele', () => {
  assert.deepEqual(data.getHistory(), []);
  assert.equal(data.addHistory(rec('2026-09-25')), true);
  data.addHistory(rec('2026-09-29'));
  data.addHistory({ ...rec('2026-09-25', 'queued'), id: 'yeni' });
  assert.deepEqual(data.getHistory().map((r) => [r.tarih, r.status]), [['2026-09-29', 'sent'], ['2026-09-25', 'queued']]);
  data.removeHistory(['yeni']);
  assert.deepEqual(data.getHistory().map((r) => r.tarih), ['2026-09-29']);
  LS.setItem('ysk.history', JSON.stringify([null, { id: 1 }, rec('2026-01-01'), { id: 'x', tarih: 'y' }]));
  assert.deepEqual(data.getHistory().map((r) => r.tarih), ['2026-01-01']);
  LS.setItem('ysk.history', '{}');
  assert.deepEqual(data.getHistory(), []);
});

await test('geçmiş: depolama doluysa false döner', () => {
  LS.full = true;
  assert.equal(data.addHistory(rec('2026-09-29')), false);
});

// --- Kuyruk ---------------------------------------------------------------------------
const payload = (tarih) => ({ tarih, seans: {}, setler: [] });

await test('kuyruk: bozuk öğeleri eler, sırayı korur', () => {
  data.enqueue(payload('2026-09-26'), { code: 'NETWORK', message: 'x' });
  data.enqueue(payload('2026-09-27'));
  assert.deepEqual(data.getQueue().map((q) => q.payload.tarih), ['2026-09-26', '2026-09-27']);
  assert.equal(data.getQueue()[0].lastError.code, 'NETWORK');
  LS.setItem('ysk.queue', JSON.stringify([{ id: 'a' }, null, { id: 'b', payload: { tarih: 'x' } }]));
  assert.deepEqual(data.getQueue().map((q) => q.id), ['b']);
  LS.setItem('ysk.queue', '"x"');
  assert.deepEqual(data.getQueue(), []);
});

await test('flush: gönderilen/DUPLICATE çıkar, geçmiş işaretlenir, ağ hatasında durur', async () => {
  cfg();
  data.addHistory(rec('2026-09-26', 'queued'));
  data.addHistory(rec('2026-09-27', 'queued'));
  data.enqueue(payload('2026-09-26'));
  data.enqueue(payload('2026-09-27'));
  data.enqueue(payload('2026-09-28'));
  let i = 0;
  handler = () => {
    i++;
    if (i === 1) return { json: { ok: true, data: { yazilanSet: 1 } } };
    if (i === 2) return { json: { ok: false, error: 'DUPLICATE' } };
    throw new Error('ağ');
  };
  const r = await data.flushQueue();
  assert.deepEqual(r.sent.map((x) => x.tarih), ['2026-09-26']);
  assert.deepEqual(r.duplicates.map((x) => x.tarih), ['2026-09-27']);
  assert.equal(r.remaining, 1);
  const q = data.getQueue();
  assert.equal(q[0].tries, 1); assert.equal(q[0].lastError.code, 'NETWORK');
  const h = Object.fromEntries(data.getHistory().map((x) => [x.tarih, x.status]));
  assert.deepEqual(h, { '2026-09-26': 'sent', '2026-09-27': 'duplicate' });
});

await test('flush: kalıcı hata (PLAN_MISMATCH) atlanır, sonraki denenir; çift çağrı tek iş', async () => {
  cfg();
  data.enqueue(payload('2026-09-26'));
  data.enqueue(payload('2026-09-27'));
  handler = (b) => (b.tarih === '2026-09-26' ? { json: { ok: false, error: 'PLAN_MISMATCH', message: 'm' } } : { json: { ok: true, data: {} } });
  const [a, b] = [data.flushQueue(), data.flushQueue()];
  assert.equal(a, b, 'aynı anda ikinci flush aynı işi döndürür');
  const r = await a;
  assert.deepEqual(r.sent.map((x) => x.tarih), ['2026-09-27']);
  assert.equal(data.getQueue()[0].lastError.code, 'PLAN_MISMATCH');
  assert.equal(calls.filter((c) => c === 'finishSession').length, 2);
});

await test('flush: yapılandırma yoksa göndermez', async () => {
  data.enqueue(payload('2026-09-26'));
  const r = await data.flushQueue();
  assert.equal(r.remaining, 1); assert.equal(calls.length, 0);
});

await test('zaman aşımı TIMEOUT olarak döner', async () => {
  cfg();
  const realSet = globalThis.setTimeout;
  globalThis.setTimeout = (fn) => realSet(fn, 0); // 30 sn'yi bekleme
  handler = (b, o) => new Promise((_, rej) => o.signal.addEventListener('abort', () => rej(Object.assign(new Error('a'), { name: 'AbortError' }))));
  await assert.rejects(data.fetchPlan('x'), (e) => e.code === 'TIMEOUT' && e.transient);
  globalThis.setTimeout = realSet;
});

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`data.js testleri: TAMAM (${n} senaryo)`);
