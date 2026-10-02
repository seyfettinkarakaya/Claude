// YüzmeSK — zamanlama modeli (ZAMANLAMA.md).
//
// Saf modül: DOM'a ve localStorage'a dokunmaz. Seans bir olay listesidir;
// her olay yalnızca türünü ve zaman damgasını (ms) taşır:
//   { t: 'basla', ts }            idmana başla
//   { t: 'cik', ts, set }         set indeksindeki bir sonraki tekrar başlar
//   { t: 'geldim', ts }           yüzülen tekrar biter, dinlenme başlar
//   { t: 'bitir', ts, auto }      idman biter (auto: son setin son GELDİM'i)
//   { t: 'mola', ts }             mola başlar (yalnızca dinlenirken)
//   { t: 'devam', ts }            mola biter
// Mola süresi idman süresinden ve dinlenme ölçümünden düşülür.
// Ekranda düğme YÜZ (cik) / DUR (geldim) yazar; ilk YÜZ basla + cik olaylarını birlikte ekler.
// Durum ve tüm süreler bu listeden yeniden hesaplanır; "Geri al" son olayı
// siler. Süre hiçbir yerde biriktirilmez.

/** Olay listesi → durum. sets: plan setleri ({ tekrar }). */
export function replay(events, sets) {
  const n = sets.length;
  const per = sets.map(() => ({ reps: [], rests: [], sonu: null }));
  const st = { phase: 'idle', basla: null, bitir: null, cur: null, per, last: null, lastGeldim: null, mola: null, molaMs: 0, molaN: 0, restMola: 0 };
  const closeMola = (ts) => {
    if (st.mola == null) return;
    const dur = Math.max(0, ts - st.mola);
    st.molaMs += dur;
    if (st.lastGeldim) st.restMola += dur;
    st.mola = null;
  };
  for (const e of events) {
    st.last = e;
    if (e.t === 'mola') {
      if (st.phase === 'rest' && st.mola == null) { st.mola = e.ts; st.molaN += 1; }
      continue;
    }
    if (e.t === 'devam') {
      closeMola(e.ts);
      continue;
    }
    closeMola(e.ts); // kapanmamış mola (bozuk liste) bir sonraki olayla kapanır
    if (e.t === 'basla') {
      st.basla = e.ts;
      st.phase = 'ready';
    } else if (e.t === 'cik') {
      const i = e.set;
      if (!(i >= 0 && i < n)) continue;
      if (st.lastGeldim) {
        const gap = e.ts - st.lastGeldim.ts - st.restMola;
        if (st.lastGeldim.set === i) per[i].rests.push(gap);
        else per[st.lastGeldim.set].sonu = gap;
      }
      per[i].reps.push({ cik: e.ts, geldim: null });
      st.cur = i;
      st.phase = 'swim';
      st.lastGeldim = null;
      st.restMola = 0;
    } else if (e.t === 'geldim') {
      if (st.cur == null) continue;
      const reps = per[st.cur].reps;
      const r = reps[reps.length - 1];
      if (!r || r.geldim != null) continue;
      r.geldim = e.ts;
      st.lastGeldim = { set: st.cur, ts: e.ts };
      st.restMola = 0;
      st.phase = 'rest';
    } else if (e.t === 'bitir') {
      st.bitir = e.ts;
      st.phase = 'done';
    }
  }
  return st;
}

/** Bir setin tamamlanan tekrar süreleri (ms). */
export function repTimes(st, i) {
  return st.per[i].reps.filter((r) => r.geldim != null).map((r) => r.geldim - r.cik);
}

export const doneReps = (st, i) => st.per[i].reps.filter((r) => r.geldim != null).length;

/** 'bekliyor' | 'suruyor' | 'tamam' | 'eksik' */
export function setStatus(st, i, tekrar) {
  const d = doneReps(st, i);
  const started = st.per[i].reps.length;
  if (!started) return 'bekliyor';
  if (d >= tekrar) return 'tamam';
  if (st.cur === i && st.phase !== 'done') return 'suruyor';
  return 'eksik';
}

/** from'dan sonraki ilk hiç başlanmamış set; yoksa baştan aranır; hiç yoksa -1. */
export function nextUnstarted(st, from) {
  const n = st.per.length;
  for (let k = 1; k <= n; k++) {
    const j = (from + k) % n;
    if (!st.per[j].reps.length) return j;
  }
  return -1;
}

/**
 * GELDİM sonrası: set tamamlandı mı, idman bitmeli mi, kart hangi sete geçmeli?
 * Son setin (ya da başlanmamış set kalmadıysa herhangi bir setin) son tekrarı idmanı bitirir.
 */
export function afterGeldim(st, sets) {
  const i = st.cur;
  const complete = doneReps(st, i) >= (Number(sets[i].tekrar) || 1);
  if (!complete) return { complete: false, finish: false, next: i };
  const next = nextUnstarted(st, i);
  const finish = i === sets.length - 1 || next < 0;
  return { complete: true, finish, next: finish ? i : next };
}

/**
 * Büyük düğmenin anlamı. pos: tekerlekte görünen set.
 * { kind: 'basla'|'cik'|'geldim'|'yok', set, rep, closes } — closes: ÇIK'a basınca
 * n/N kapanacak (erken bitirilecek) set bilgisi { set, done, tekrar }.
 */
export function mainAction(st, sets, pos) {
  if (st.phase === 'done') return { kind: 'yok' };
  if (st.mola != null) return { kind: 'mola' };
  // Tek basışla başlangıç: ilk YÜZ idman saatini ve 1. tekrarı birlikte başlatır.
  if (st.phase === 'idle') return { kind: 'cik', set: pos, rep: 1, closes: null, start: true };
  if (st.phase === 'swim') return { kind: 'geldim', set: st.cur, rep: st.per[st.cur].reps.length };
  const tekrar = Number(sets[pos].tekrar) || 1;
  const d = doneReps(st, pos);
  if (d >= tekrar) return { kind: 'yok', set: pos };
  let closes = null;
  if (st.cur != null && st.cur !== pos) {
    const ct = Number(sets[st.cur].tekrar) || 1;
    const cd = doneReps(st, st.cur);
    if (cd < ct) closes = { set: st.cur, done: cd, tekrar: ct };
  }
  return { kind: 'cik', set: pos, rep: d + 1, closes };
}

/** Yüzülen mesafe: tamamlanan tekrar sayısı × tekrar mesafesi. */
export function doneDistance(st, sets) {
  return sets.reduce((a, s, i) => a + doneReps(st, i) * (Number(s.mesafe) || 0), 0);
}

/** Toplam mola (ms); süren mola şimdiye kadar sayılır. */
export function molaMs(st, now) {
  return st.molaMs + (st.mola != null ? Math.max(0, now - st.mola) : 0);
}

/** İdman süresi (ms): bitmişse bitir − basla, sürüyorsa now − basla; molalar düşülür. */
export function idmanMs(st, now) {
  if (st.basla == null) return 0;
  const end = st.bitir != null ? st.bitir : now;
  return end - st.basla - molaMs(st, end);
}

/** Süren dinlenmenin geçen süresi (ms), molalar hariç; molada donar. */
export function restElapsed(st, now) {
  if (!st.lastGeldim) return 0;
  const end = st.mola != null ? st.mola : now;
  return end - st.lastGeldim.ts - st.restMola;
}

export function median(xs) {
  if (!xs.length) return 0;
  const a = [...xs].sort((x, y) => x - y);
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

/** Ortancadan %50'den fazla sapan tekrarların indeksleri (en az 3 tekrarda). */
export function suspects(times) {
  if (times.length < 3) return [];
  const med = median(times);
  return times.map((t, i) => (Math.abs(t - med) > 0.5 * med ? i : -1)).filter((i) => i >= 0);
}

/**
 * Düzeltmeler uygulanmış tekrar süreleri. edits: { [indeks]: ms | 'drop' }.
 * { all: [{ ms, dropped, edited }], avgMs } — ortalama, çıkarılanlar hariç.
 */
export function effectiveTimes(times, edits = {}) {
  const all = times.map((t, i) => {
    const e = edits[i];
    if (e === 'drop') return { ms: t, dropped: true, edited: false };
    if (typeof e === 'number' && e > 0) return { ms: e, dropped: false, edited: true };
    return { ms: t, dropped: false, edited: false };
  });
  const used = all.filter((x) => !x.dropped).map((x) => x.ms);
  return { all, avgMs: used.length ? used.reduce((a, b) => a + b, 0) / used.length : 0 };
}

/**
 * Dinlenme notu önerilsin mi? Set içi dinlenmelerin plandan ortalama sapması
 * ±5 sn'yi ya da tek bir dinlenmenin sapması ±10 sn'yi aşarsa.
 */
export function restDeviation(rests, dinlenSec) {
  if (!rests.length) return { show: false, avgDev: 0 };
  const devs = rests.map((r) => r / 1000 - dinlenSec);
  const avgDev = devs.reduce((a, b) => a + b, 0) / devs.length;
  const show = Math.abs(avgDev) >= 5 || devs.some((d) => Math.abs(d) >= 10);
  return { show, avgDev };
}

/** 3-2-1 / 0 bip işareti: dinlenme kalanına göre çalınacak işaret, yoksa null. */
export function beepMark(remSec) {
  if (remSec > 3 || remSec <= -1.5) return null;
  return remSec > 0 ? Math.ceil(remSec) : 0;
}

/**
 * Bir setin tüm tekrarlarını siler (seti sıfırla): o setin ÇIK olayları ve her birini
 * izleyen GELDİM kaldırılır. Diğer setlerin olayları ve zaman damgaları değişmez.
 */
export function withoutSet(events, i) {
  const out = [];
  let skip = false;
  for (const e of events) {
    if (e.t === 'cik') {
      skip = e.set === i;
      if (skip) continue;
    } else if (e.t === 'geldim' && skip) {
      skip = false;
      continue;
    }
    out.push(e);
  }
  return out;
}
