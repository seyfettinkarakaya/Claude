// sporRef hesapları: güne, havuza ve alete göre CSS; CSS'e göre 100 m tempo bölgesi.
// Saf işlevler (DOM yok); ref = sporRef getRef cevabı ya da null.

/** sporRef `zone` sayfasındaki PACE bölgeleri; sporRef bağlı değilken kullanılır. */
export const DEFAULT_ZONES = [
  { zone: 'SP3', alt: -999, ust: -19, ad: 'Yüksek Sprint' },
  { zone: 'SP2', alt: -19, ust: -9, ad: 'Maksimal Sprint' },
  { zone: 'SP1', alt: -9, ust: -3, ad: 'Eşik Sprint' },
  { zone: 'EN3', alt: -3, ust: 3, ad: 'Eşik (CSS)' },
  { zone: 'EN2', alt: 3, ust: 11, ad: 'Aerobik' },
  { zone: 'EN1', alt: 11, ust: 21, ad: 'Düşük Aerobik' },
  { zone: 'REC', alt: 21, ust: 999, ad: 'Toparlanma' },
];

const lower = (s) => String(s == null ? '' : s).trim().toLocaleLowerCase('tr');

/**
 * Tempo bölgeleri, yavaştan hızlıya; n = 1 (en yavaş) … renk sırası.
 * alt ≤ CSS farkı < üst (sn/100 m); boş sınır sınırsız sayılır.
 */
export function paceZones(ref) {
  const src = ref && Array.isArray(ref.zones) ? ref.zones.filter((z) => z && z.tur === 'PACE' && z.zone) : [];
  const list = (src.length ? src : DEFAULT_ZONES).map((z) => ({
    zone: String(z.zone),
    ad: z.ad || '',
    alt: typeof z.alt === 'number' && z.alt > -999 ? z.alt : -Infinity,
    ust: typeof z.ust === 'number' && z.ust < 999 ? z.ust : Infinity,
  }));
  list.sort((a, b) => b.alt - a.alt);
  return list.map((z, i) => ({ ...z, n: i + 1 }));
}

/** Tempo (sn/100 m) ve CSS'e göre bölge; bulunamazsa null. */
export function zoneFor(pace, css, zones) {
  if (!(pace > 0) || !(css > 0)) return null;
  const d = pace - css;
  return zones.find((z) => d >= z.alt && d < z.ust) || null;
}

/** "Paddle, PB" → ['paddle', 'pullbuoy'] (alet sayfasındaki kod/ad eşleşmesiyle, sıralı). */
export function aletKeys(text, aletler) {
  const map = new Map();
  for (const a of Array.isArray(aletler) ? aletler : []) {
    const ad = lower(a.ad || a.kod);
    if (a.kod) map.set(lower(a.kod), ad);
    if (a.ad) map.set(lower(a.ad), ad);
  }
  const parts = String(text == null ? '' : text).split(/[,+/;]|\s+ve\s+/).map(lower).filter(Boolean);
  return [...new Set(parts.map((p) => map.get(p) || p))].sort();
}

const sameKeys = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Drill / kick setleri: tempo bölgesi anlamsız. */
export const isDrill = (set) => /drill|kick|tekme|ayak|scull/i.test(String((set && set.tur) || ''));
/** Maksimal test seti (CSS testi vb.): bölge verilmez, yoğunluk dağılımına girmez. */
export const isTest = (set) => /\btest\b/i.test(String((set && set.tur) || ''));

/**
 * Setin CSS'i. { css, alet, havuz, ilk, son, stale } ya da null.
 * Önce tarih aralığına, havuza ve alete tam uyan satır; yoksa aynı alet/havuzun en son
 * satırı (stale: true → "CSS güncel değil"). Havuz uyan satır yoksa havuz gözetilmez.
 */
export function cssFor(ref, { tarih, havuz, alet } = {}) {
  const rows = ref && Array.isArray(ref.css) ? ref.css : [];
  if (!rows.length) return null;
  const want = aletKeys(alet, ref.alet);
  const byAlet = rows.filter((r) => sameKeys(aletKeys(r.alet, ref.alet), want));
  if (!byAlet.length) return null;
  const byHavuz = byAlet.filter((r) => Number(r.havuz || 25) === Number(havuz || 25));
  const pool = byHavuz.length ? byHavuz : byAlet;
  const t = tarih || '';
  const inRange = pool.filter((r) => r.ilk <= t && (!r.son || t <= r.son));
  const latest = (list) => list.reduce((a, b) => (b.ilk >= a.ilk ? b : a));
  const row = inRange.length ? latest(inRange) : latest(pool);
  return { css: row.css, alet: row.alet || '', havuz: Number(row.havuz || 25), ilk: row.ilk, son: row.son || '', stale: !inRange.length };
}

/**
 * RPE / MSI açıklaması. Satırlar "7–8 — Zor, …", "0,5 — Hafif …" biçiminde; değeri içeren
 * aralık, yoksa alt sınırı değerden küçük en büyük satır. Bulunamazsa ''.
 */
export function scaleText(lines, value) {
  if (value == null || value === '' || !Array.isArray(lines)) return '';
  const v = Number(value);
  const num = (x) => Number(String(x).replace(',', '.'));
  let best = null;
  for (const line of lines) {
    const m = /^\s*(\d+(?:[.,]\d+)?)(?:\s*[–-]\s*(\d+(?:[.,]\d+)?))?\s*[—–:=-]\s*(.*)$/.exec(String(line));
    if (!m) continue;
    const lo = num(m[1]);
    const hi = m[2] ? num(m[2]) : lo;
    if (v >= lo && v <= hi) return m[3].trim();
    if (lo <= v && (!best || lo > best.lo)) best = { lo, text: m[3].trim() };
  }
  return best ? best.text : '';
}
