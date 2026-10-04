// Hazır olma, dinlenme haftası önerisi, haftalık set sayısı, plan uyumu. Saf işlevler (DOM yok).

/**
 * Günlük hazır olma kontrolü (10 sn): uyku 1–5 (5 iyi), kas ağrısı 1–5 (1 yok), enerji 1–5 (5 iyi),
 * eklem: omuz/kalça/diz ağrısının en yükseği (MSI 0–3). c: kisit.kurallar (MSI eşikleri).
 * → { skor 0–100, karar: 'tam' | 'hafif' | 'dinlen' | 'tibbi', metin }
 */
export function hazirSkor(k, c = { msi: { hafiflet: 1, dur: 2, tibbi: 3 } }) {
  const n = (v, d = 3) => Math.max(1, Math.min(5, Number(v) || d));
  const skor = Math.round(((n(k.uyku) + (6 - n(k.agri, 1)) + n(k.enerji)) / 15) * 100);
  const eklem = Number(k.eklem) || 0;
  if (eklem >= c.msi.tibbi) return { skor, karar: 'tibbi', metin: 'Eklem ağrısı yüksek: idman yok, tıbbi değerlendirme' };
  if (eklem >= c.msi.dur) return { skor, karar: 'dinlen', metin: 'Eklem ağrısı: bugün dinlen ya da yalnız esneme + nefes' };
  if (skor < 45) return { skor, karar: 'dinlen', metin: 'Toparlanma düşük: dinlen ya da hafif yüzme (REC/EN1)' };
  if (eklem >= c.msi.hafiflet || skor < 65) return { skor, karar: 'hafif', metin: eklem >= c.msi.hafiflet ? 'Eklem hassas: planı hafiflet (ağrılı bölgeye yük yok)' : 'Biraz yorgunsun: planı %20 hafiflet' };
  return { skor, karar: 'tam', metin: 'Hazırsın: plan aynen' };
}

/**
 * Dinlenme haftası önerisi. oran: yuk.oranDurum çıktısı, hazirlar: son günlerin hazirSkor sonuçları (yeniden eskiye),
 * msiler: son 14 günün seans MSI en yükseği listesi (eskiden yeniye).
 * → { oner: bool, nedenler: [] }
 */
export function dinlenmeOnerisi({ oran = null, hazirlar = [], msiler = [] } = {}) {
  const nedenler = [];
  if (oran && oran.durum === 'yuksek') nedenler.push('yük hızlı arttı');
  const son5 = hazirlar.slice(0, 5);
  if (son5.filter((h) => h.karar !== 'tam').length >= 3) nedenler.push('son kontrollerin çoğunda yorgunluk');
  const agrili = msiler.filter((v) => v >= 1).length;
  const artan = msiler.length >= 3 && msiler[msiler.length - 1] > msiler[0] && msiler[msiler.length - 1] >= 1;
  if (agrili >= 2 && artan) nedenler.push('ağrı (MSI) artıyor');
  return { oner: nedenler.length > 0, nedenler };
}

/**
 * Haftalık set sayısı (kas grubu başına): satırlar [{ tarih, hareket, set }], hPay(ad) → { grup: pay }.
 * Bir hareketin seti, payı ≥ %30 olan her gruba sayılır.
 * → { grup: set }
 */
export function haftalikSet(satirlar, bas, son, hPay) {
  const out = {};
  for (const r of satirlar || []) {
    if (!r || r.tarih < bas || r.tarih > son) continue;
    for (const [g, p] of Object.entries(hPay(r.hareket) || {})) if (p >= 0.3) out[g] = (out[g] || 0) + (Number(r.set) || 0);
  }
  return out;
}

/** Set hedef bandı: 10–20 set/hafta (Omuz itiş için kısıt nedeniyle üst sınır 12). → { alt, ust, durum: 'az'|'iyi'|'fazla' } */
export function setDurum(grup, set) {
  const alt = 10, ust = grup === 'Omuz' ? 12 : 20;
  return { alt, ust, durum: set < alt ? 'az' : set > ust ? 'fazla' : 'iyi' };
}

/** Plan uyumu: planlanan günlerden kaçında idman yapıldı. → { planli, yapilan, pay } */
export function planUyumu(planliGunler, yapilanGunler) {
  const p = [...new Set(planliGunler)];
  const y = new Set(yapilanGunler);
  const yap = p.filter((t) => y.has(t)).length;
  return { planli: p.length, yapilan: yap, pay: p.length ? Math.round((yap / p.length) * 100) : null };
}

/** Ağırlığı adıma yuvarlar (ör. 2 kg'lık dambıllar): 13 → 14 (adım 2). */
export const adimaYuvarla = (kg, adim = 2.5) => (adim > 0 ? Math.round(Math.round(kg / adim) * adim * 100) / 100 : kg);
