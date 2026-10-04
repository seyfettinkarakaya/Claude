// Hareket videosu: YouTube adresinden kimlik, gömme adresi, hareketin videosunu bulma. Saf işlevler (DOM yok).
// Öncelik: tablodaki H sayfasının Video sütunu → uygulamadaki liste (videolar.js).

/** YouTube adresi → { id, bicim ('s' Shorts / 'w' yatay), bas (sn) } ya da null. */
export function ytAyir(url) {
  const s = String(url || '').trim();
  const m = /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(s);
  if (!m) return null;
  const t = /[?&#](?:t|start)=(?:(\d+)m)?(\d+)s?/.exec(s);
  return { id: m[1], bicim: /\/shorts\//.test(s) ? 's' : 'w', bas: t ? (Number(t[1]) || 0) * 60 + Number(t[2]) : 0 };
}

/**
 * Gömme adresi (youtube-nocookie: çerez yok). Sessiz, döngü, kontrolsüz; bas/bit saniye aralığı (10–15 sn kesit).
 * Not: YouTube döngüde videonun başına döner; kesit döngüsü uygulamada bitişte yeniden başlatılarak yapılır.
 */
export function gommeAdresi(v, { otomatik = true } = {}) {
  const p = new URLSearchParams({ mute: '1', playsinline: '1', rel: '0', modestbranding: '1', controls: '1', loop: '1', playlist: v.id });
  if (otomatik) p.set('autoplay', '1');
  if (v.bas > 0) p.set('start', String(v.bas));
  if (v.bit > v.bas) p.set('end', String(v.bit));
  return `https://www.youtube-nocookie.com/embed/${v.id}?${p.toString()}`;
}

/** YouTube'da açma adresi. */
export const izleAdresi = (v) => (v.bicim === 's' ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}${v.bas ? `&t=${v.bas}s` : ''}`);

const anahtar = (s) => String(s || '').trim().toLocaleLowerCase('tr').replace(/\s+/g, ' ');

/**
 * Hareketin videosu: { id, bicim, bas, bit, kaynak, nereden ('tablo' | 'liste') } ya da null.
 * hVideo: H sayfasındaki Video hücresi (doluysa önce). liste: videolar.js (ad → [id, biçim, kaynak, bas, bit]); ad büyük/küçük harf duyarsız.
 */
export function videoBul(ad, hVideo, liste = {}) {
  const t = ytAyir(hVideo);
  if (t) return { ...t, bit: 0, kaynak: '', nereden: 'tablo' };
  const k = anahtar(ad);
  const ks = Object.keys(liste).find((x) => anahtar(x) === k);
  if (!ks) return null;
  const [id, bicim, kaynak, bas, bit] = liste[ks];
  return { id, bicim, kaynak, bas: bas || 0, bit: bit || 0, nereden: 'liste' };
}

/** Listenin özeti: { toplam, kaynaklar: { OPEX: n, diğer: m } } */
export function ozet(liste = {}) {
  const v = Object.values(liste);
  const opex = v.filter((x) => x[2] === 'OPEX').length;
  return { toplam: v.length, opex, diger: v.length - opex };
}
