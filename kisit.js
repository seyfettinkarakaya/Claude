// Sağlık kısıtı kuralları: varsayılanlar (yüzme-idman modeli) + sporRef "kisit" sayfası.
// Saf işlevler (DOM yok). kisit sayfası satırları: { kural, deger, aciklama }.
//   tani            Değer: tanı adı · Açıklama: kural metni (bir ya da daha çok satır; varsa varsayılanların yerine geçer)
//   br_ay_max       kurbağalama ayda en çok % (10)
//   squat_derinlik  derece (90)
//   yasak           virgülle anahtar sözcükler (koşu, zıplama …): adında geçen hareket yasak
//   msi_gozlem / msi_hafiflet / msi_dur / msi_tibbi   eşikler (0,5 / 1 / 2 / 3)
//   sure_sabah / sure_ogle / sure_aksam               dk; boş ya da 0 = sınırsız (80 / 65 / sınırsız)
//   gun_hafta       haftada gün (3)
//   kulac_drill / kulac_yuzus / kulac_race / kulac_pull   "10-11" biçiminde, 25 m başına
//   omuz_rahatlatma evet / hayır

export const VARSAYILAN = {
  tanilar: [
    { ad: 'Sağ kalça · Perthes', kural: 'Koşu, zıplama yok · ağırlıklı squat > 90° yok · kurbağalama ayda ≤ %10' },
    { ad: 'Sağ omuz · rotator manşet + impingement', kural: 'Her aerobik blok sonunda omuz rahatlatma · ağrıda itiş hareketleri geri planda' },
    { ad: 'Sağ diz · kondromalazi', kural: 'Kurbağalamada ek kısıt · derin diz bükümü yok' },
  ],
  brAyMax: 10,
  squatDerinlik: 90,
  yasak: ['koşu', 'run', 'jog', 'sprint', 'jump', 'zıpla', 'hop', 'plyo', 'burpee', 'skip', 'bound'],
  msi: { gozlem: 0.5, hafiflet: 1, dur: 2, tibbi: 3 },
  sure: { sabah: 80, ogle: 65, aksam: 0 },
  gunHafta: 3,
  kulac: { drill: [10, 11], yuzus: [13, 15], race: [14, 15], pull: [11, 12] },
  stilSira: ['FR', 'BK', 'BF', 'BR'],
  omuzRahatlatma: true,
};

const num = (v) => { const n = Number(String(v == null ? '' : v).replace(',', '.')); return Number.isFinite(n) ? n : null; };
const range = (v) => { const m = /(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)/.exec(String(v || '')); return m ? [num(m[1]), num(m[2])] : null; };
const low = (s) => String(s == null ? '' : s).toLocaleLowerCase('tr');

/** sporRef cevabından kurallar (sayfa yoksa ya da satır geçersizse varsayılan). */
export function kurallar(ref) {
  const c = JSON.parse(JSON.stringify(VARSAYILAN));
  const rows = ref && Array.isArray(ref.kisit) ? ref.kisit : [];
  const tanilar = [];
  for (const r of rows) {
    // Kural anahtarı Türkçe yerel olmadan küçültülür: "MSI_dur" → "msi_dur" (tr'de "msı_dur" olurdu).
    const k = String((r && r.kural) || '').trim().toLowerCase().replace(/ı/g, 'i').replace(/İ/g, 'i');
    const v = r ? r.deger : '';
    if (k === 'tani') { if (String(v || '').trim()) tanilar.push({ ad: String(v).trim(), kural: String(r.aciklama || '').trim() }); }
    else if (k === 'br_ay_max' && num(v) != null) c.brAyMax = num(v);
    else if (k === 'squat_derinlik' && num(v) != null) c.squatDerinlik = num(v);
    else if (k === 'yasak' && String(v || '').trim()) c.yasak = String(v).split(/[,;]/).map((x) => low(x).trim()).filter(Boolean);
    else if (/^msi_(gozlem|hafiflet|dur|tibbi)$/.test(k) && num(v) != null) c.msi[k.slice(4)] = num(v);
    else if (/^sure_(sabah|ogle|aksam)$/.test(k)) c.sure[k.slice(5)] = num(v) || 0;
    else if (k === 'gun_hafta' && num(v)) c.gunHafta = num(v);
    else if (/^kulac_(drill|yuzus|race|pull)$/.test(k) && range(v)) c.kulac[k.slice(6)] = range(v);
    else if (k === 'omuz_rahatlatma') c.omuzRahatlatma = !/^(hayır|hayir|no|0|false)$/i.test(String(v).trim());
  }
  if (tanilar.length) c.tanilar = tanilar;
  c.kaynak = rows.length ? 'sporRef' : 'varsayılan';
  return c;
}

const YUKSUZ = /^(bodyweight|body only|band|bands|vücut|vucut)$/i;
const OMUZ_ITIS = /overhead|shoulder press|military|push press|snatch|upright row|arnold|handstand|dips?\b/i;

/**
 * Hareketin kısıt durumu. k: katalog satırı ({ ad, ekipman, kisit?, alternatif? }).
 * { durum: 'yasak' | 'dikkat' | 'uygun', neden: [], notlar: [], alternatif }
 */
export function hareketKisit(k, c = VARSAYILAN) {
  const ad = low(k && k.ad);
  const out = { durum: 'uygun', neden: [], notlar: [], alternatif: (k && k.alternatif) || '' };
  const yasak = (t) => { out.durum = 'yasak'; out.neden.push(t); };
  const dikkat = (t) => { if (out.durum === 'uygun') out.durum = 'dikkat'; out.notlar.push(t); };
  // Sözcük başında eşleşir: "run" Running'i yakalar, Crunch'ı yakalamaz.
  const sozcuk = c.yasak.find((w) => new RegExp(`(^|[^a-zçğıöşü])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(ad));
  if (sozcuk) yasak(`Perthes: ${/jump|zıpla|hop|plyo|burpee|skip|bound/.test(sozcuk) ? 'zıplama' : 'koşu'} yok`);
  if (/squat/.test(ad)) {
    const yuksuz = YUKSUZ.test(String((k && k.ekipman) || '').trim());
    if (!yuksuz && !/box|kutu/.test(ad)) {
      yasak(`Perthes: ağırlıklı squat > ${c.squatDerinlik}° yok`);
      if (!out.alternatif) out.alternatif = `Box Squat ≤ ${c.squatDerinlik}°`;
    } else dikkat(`Derinlik en fazla ${c.squatDerinlik}°`);
  }
  if (OMUZ_ITIS.test(ad)) dikkat('Sağ omuz: ağrısız aralıkta, ağrıda bırak');
  const elle = String((k && k.kisit) || '').trim();
  if (elle) { if (/yasak|⊘/i.test(elle)) yasak(elle.replace(/^yasak\s*:?\s*/i, '') || 'Kısıtlı'); else dikkat(elle); }
  return out;
}

/** MSI değeri → karar. { seviye: 'devam'|'gozlem'|'hafiflet'|'dur'|'tibbi', metin } */
export function msiKarar(v, c = VARSAYILAN) {
  const m = Number(v) || 0;
  if (m >= c.msi.tibbi) return { seviye: 'tibbi', metin: 'Tıbbi değerlendirme: seansı bitir' };
  if (m >= c.msi.dur) return { seviye: 'dur', metin: 'Seti durdur' };
  if (m >= c.msi.hafiflet) return { seviye: 'hafiflet', metin: 'Hafiflet: ağırlık ya da tekrar azalt, ağrısız aralık' };
  if (m >= c.msi.gozlem) return { seviye: 'gozlem', metin: 'Gözlem: not düşülür, devam' };
  return { seviye: 'devam', metin: 'Devam' };
}

/** Hafifletme önerisi: ağırlık bir adım (2,5 kg) ya da %10 aşağı, tekrar −2 (en az 1); süreli harekette −10 sn. */
export function hafiflet(x) {
  const out = { tekrar: x.tekrar, agirlik: x.agirlik, sure: x.sure };
  if (x.sure) out.sure = Math.max(10, x.sure - 10);
  else out.tekrar = Math.max(1, x.tekrar - 2);
  if (typeof x.agirlik === 'number' && x.agirlik > 0) out.agirlik = Math.max(0, Math.round(Math.min(x.agirlik - 2.5, x.agirlik * 0.9) / 2.5) * 2.5);
  return out;
}

/** Saate göre seans dilimi. */
export const dilim = (saat) => (saat < 11 ? 'sabah' : saat < 15 ? 'ogle' : 'aksam');
const GUN = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

/** Süre bütçesi (dk) ya da null (sınırsız). Cuma akşam sınırsız; diğer günlerde dilime göre. */
export function sureButcesi(date, c = VARSAYILAN) {
  const d = date instanceof Date ? date : new Date(date);
  const dl = dilim(d.getHours());
  const gun = GUN[d.getDay()];
  if (dl === 'aksam') return { dk: c.sure.aksam || null, dilim: dl, gun };
  return { dk: c.sure[dl] || null, dilim: dl, gun };
}

/** Kulaç normu: set türüne/aletine göre. [alt, üst] /25 m */
export function kulacNormu(set, c = VARSAYILAN) {
  const t = low(`${(set && set.tur) || ''} ${(set && set.aciklama) || ''}`);
  const alet = low(set && set.alet);
  if (/drill|teknik/.test(t)) return { tur: 'drill', aralik: c.kulac.drill };
  if (/pull|çekiş/.test(t) || /pull|şamandıra|samandira|pb\b|palet|paddle/.test(alet)) return { tur: 'pull', aralik: c.kulac.pull };
  if (/race|yarış|yaris|sp\d|sprint/.test(t)) return { tur: 'race', aralik: c.kulac.race };
  return { tur: 'yuzus', aralik: c.kulac.yuzus };
}

/** Kulaç değerlendirmesi: { durum: 'norm'|'yuksek'|'dusuk', metin } */
export function kulacDurum(kulac, set, c = VARSAYILAN) {
  const n = kulacNormu(set, c);
  const [a, b] = n.aralik;
  if (!(kulac > 0)) return null;
  if (kulac > b) return { durum: 'yuksek', metin: `Kulaç ${kulac}/25 m (norm ${a}–${b}): teknik bozuluyor ya da yorgunluk`, norm: n };
  if (kulac < a) return { durum: 'dusuk', metin: `Kulaç ${kulac}/25 m (norm ${a}–${b}): sayımı kontrol et`, norm: n };
  return { durum: 'norm', metin: `norm ${a}–${b} ✓`, norm: n };
}
