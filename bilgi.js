// Hareket adı → hareket bilgi kartı (free-exercise-db) eşleştirmesi. Saf işlevler (DOM yok).
// Tabloda (H) "Görsel" sütunu doluysa o kimlik kullanılır; yoksa ada göre en iyi eşleşme (sözcük örtüşmesi).

const DUR = new Set(['with', 'the', 'a', 'an', 'on', 'to', 'of', 'and', 'standard', 'regular']);
const ES = { pullup: 'pullup', pullups: 'pullup', chinup: 'chinup', chinups: 'chinup', pushup: 'pushup', pushups: 'pushup', bands: 'band', banded: 'band', db: 'dumbbell', dumbbells: 'dumbbell', kb: 'kettlebell', kettlebells: 'kettlebell', bb: 'barbell', flyes: 'fly', flys: 'fly', raises: 'raise', rows: 'row', curls: 'curl', extensions: 'extension', presses: 'press', squats: 'squat', lunges: 'lunge', bridges: 'bridge', planks: 'plank', crunches: 'crunch' };

/** Ad → sözcük kümesi ("Pull-up" → pullup, "Bands" → band). */
export function sozcukler(ad) {
  const s = String(ad || '').toLowerCase().replace(/\b(pull|chin|push)[\s-]+ups?\b/g, '$1up').replace(/[^a-z0-9]+/g, ' ').trim();
  return new Set(s.split(' ').filter((w) => w && !DUR.has(w)).map((w) => ES[w] || w));
}

const EKIPMAN = new Set(['band', 'dumbbell', 'barbell', 'cable', 'machine', 'kettlebell', 'bodyweight', 'smith', 'ez', 'bar', 'ball', 'medicine', 'exercise']);

/**
 * En iyi eşleşen kimlik ya da null. db: [[kimlik, ad, …], …]; tercih(kimlik): eşitlikte öne alınır (Türkçe/yerel).
 * Puan = 0,6 × (adımın içerik sözcüklerinden eşleşen payı) + 0,4 × (adayınkinden) ± 0,05 ekipman uyumu; eşik 0,7.
 * Ekipman sözcükleri (band, dumbbell …) içerik sayılmaz: "Band Chest Fly" sırt fly'ına eşleşmez.
 */
export function eslestir(ad, db, gorsel = '', tercih = () => false) {
  if (gorsel) { const g = db.find((r) => r[0] === gorsel || r[1].toLowerCase() === String(gorsel).toLowerCase()); if (g) return g[0]; }
  const all = sozcukler(ad);
  const A = [...all].filter((w) => !EKIPMAN.has(w));
  const eqA = [...all].filter((w) => EKIPMAN.has(w));
  if (!A.length) return null;
  let best = null, bs = 0;
  for (const r of db) {
    const allB = sozcukler(r[1]);
    const B = [...allB].filter((w) => !EKIPMAN.has(w));
    let n = 0;
    for (const w of A) if (B.includes(w)) n++;
    if (!n || !B.length) continue;
    const eqB = [...allB].filter((w) => EKIPMAN.has(w));
    let sc = 0.6 * (n / A.length) + 0.4 * (n / B.length);
    if (eqA.length && eqB.length) sc += eqA.some((w) => eqB.includes(w)) ? 0.05 : -0.05;
    if (tercih(r[0])) sc += 0.01;
    if (sc > bs) { bs = sc; best = r[0]; }
  }
  return bs >= 0.699 ? best : null;
}

// free-exercise-db kas adları → uygulamanın 10 grubu
const KAS = { shoulders: 'Omuz', chest: 'Göğüs', biceps: 'Biseps', triceps: 'Triseps', forearms: 'Ön kol', lats: 'Sırt', 'middle back': 'Sırt', 'lower back': 'Sırt', traps: 'Sırt', neck: 'Sırt', abdominals: 'Karın', glutes: 'Kalça', abductors: 'Kalça yanı', adductors: 'Kalça yanı', quadriceps: 'Bacak', hamstrings: 'Bacak', calves: 'Bacak' };
const KAS_TR = { shoulders: 'omuz', chest: 'göğüs', biceps: 'biseps', triceps: 'triseps', forearms: 'ön kol', lats: 'kanat (latissimus)', 'middle back': 'orta sırt', 'lower back': 'bel', traps: 'trapez', neck: 'boyun', abdominals: 'karın', glutes: 'kalça', abductors: 'kalça yanı (abdüktör)', adductors: 'iç uyluk (addüktör)', quadriceps: 'ön uyluk', hamstrings: 'arka uyluk', calves: 'baldır' };

/** Birincil (1) ve ikincil (0,45) kaslar → { haritaGrubu: yoğunluk } */
export function kasYogunluk(birincil = [], ikincil = []) {
  const out = {};
  for (const k of ikincil) { const g = KAS[k]; if (g) out[g] = Math.max(out[g] || 0, 0.45); }
  for (const k of birincil) { const g = KAS[k]; if (g) out[g] = 1; }
  return out;
}
export const kasAdi = (k) => KAS_TR[k] || k;
