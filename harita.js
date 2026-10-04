// Kas haritası (dokunmatik): ön/arka figür, grup katmanları, dokunma haritası. DOM bileşeni.
// Görseller img/kas/ (kullanıcının kas görselinden; kaynak betik tasarim/v27/kaynak/ayikla.py).
// Renkli katman = maskeli renkli figür (CSS sınıfları style.css'te); seçilmeyen gruplar gri figürde kalır.

export const META = {
  grup: ['Omuz', 'Göğüs', 'Biseps', 'Triseps', 'Ön kol', 'Sırt', 'Karın', 'Kalça', 'Kalça yanı', 'Bacak'],
  slug: { Omuz: 'omuz', 'Göğüs': 'gogus', Biseps: 'biseps', Triseps: 'triseps', 'Ön kol': 'onkol', 'Sırt': 'sirt', 'Karın': 'karin', 'Kalça': 'kalca', 'Kalça yanı': 'kalcayani', Bacak: 'bacak' },
  front: { w: 230, h: 503, merkez: { Omuz: [174, 110], 'Göğüs': [114, 124], Biseps: [181, 149], 'Ön kol': [33, 199], 'Karın': [114, 194], 'Kalça yanı': [153, 235], Bacak: [144, 282] } },
  back: { w: 218, h: 503, merkez: { Omuz: [169, 104], Triseps: [176, 150], 'Ön kol': [190, 204], 'Sırt': [108, 146], 'Kalça': [109, 245], 'Kalça yanı': [63, 283], Bacak: [135, 300] } },
};

/** Grup bu görünümde var mı (ön: Göğüs, Biseps, Karın …; arka: Sırt, Triseps, Kalça …). */
export const gorunumde = (view, g) => Boolean(META[view].merkez[g]);
/** Grubun görüneceği yüz (önce ön). */
export const yuzu = (g) => (gorunumde('front', g) ? 'front' : 'back');

/**
 * Figür öğesi. opts: { yogunluk: {grup: 0..1} (renkli katman opaklığı; verilmeyen gruplar gizli),
 *   tumu: true (yogunluk yoksa tüm gruplar renkli), secili: {grup: 1|2} (rozet + amber parıltı), odak: grup,
 *   rozet: true, yan: 'sag'|'sol' (yalnızca kişinin o yarısı; ağrı haritası), cls }
 */
export function figur(view, opts = {}) {
  const m = META[view];
  const el = document.createElement('div');
  el.className = `kf ${view}${opts.cls ? ` ${opts.cls}` : ''}`;
  el.style.aspectRatio = `${m.w} / ${m.h}`;
  for (const g of Object.keys(m.merkez)) {
    const l = document.createElement('i');
    l.className = `kl ${META.slug[g]}`;
    l.dataset.g = g;
    el.append(l);
  }
  if (opts.rozet !== false) {
    for (const [g, [x, y]] of Object.entries(m.merkez)) {
      const b = document.createElement('span');
      b.className = 'kb';
      b.dataset.g = g;
      b.style.left = `${(x / m.w) * 100}%`;
      b.style.top = `${(y / m.h) * 100}%`;
      el.append(b);
    }
  }
  guncelle(el, opts);
  return el;
}

/** Figürün durumunu günceller (yeniden çizmeden). */
export function guncelle(el, opts = {}) {
  const y = opts.yogunluk || null;
  const sec = opts.secili || {};
  const aktif = Boolean(y) || Object.values(sec).some(Boolean) || Boolean(opts.odak);
  el.classList.toggle('is-akt', aktif);
  el.classList.toggle('yan-sag', opts.yan === 'sag');
  el.classList.toggle('yan-sol', opts.yan === 'sol');
  for (const l of el.querySelectorAll('.kl')) {
    const g = l.dataset.g;
    const v = y ? y[g] || 0 : (sec[g] || g === opts.odak ? 1 : aktif ? 0 : 1);
    l.style.opacity = String(Math.max(0, Math.min(1, v)));
    l.classList.toggle('is-sel', Boolean(sec[g]));
    l.classList.toggle('is-odak', g === opts.odak);
  }
  for (const b of el.querySelectorAll('.kb')) {
    const p = sec[b.dataset.g] || 0;
    b.classList.toggle('is-on', p > 0);
    b.textContent = p === 2 ? '★★' : p ? '★' : '';
  }
}

// --- dokunma haritası: piksel değeri 20 × grup no (1…10), kasın 9 px çevresi de o gruba ---
const HIT = {};
let yukleniyor = null;
/** Dokunma haritalarını yükler (bir kez). */
export function hitYukle() {
  if (yukleniyor) return yukleniyor;
  yukleniyor = Promise.all(['front', 'back'].map((v) => new Promise((ok) => {
    const im = new Image();
    im.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = im.width; c.height = im.height;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(im, 0, 0);
        HIT[v] = { w: im.width, h: im.height, d: x.getImageData(0, 0, im.width, im.height).data };
      } catch { /* okunamazsa dokunma çalışmaz, harita yine görünür */ }
      ok();
    };
    im.onerror = () => ok();
    im.src = `img/kas/${v}_hit.png`;
  })));
  return yukleniyor;
}

/** Figür içi oransal konum (0..1) → grup ya da null. */
export function hitAt(view, fx, fy) {
  const h = HIT[view];
  if (!h) return null;
  const x = Math.floor(fx * h.w), y = Math.floor(fy * h.h);
  if (x < 0 || y < 0 || x >= h.w || y >= h.h) return null;
  const n = Math.round(h.d[(y * h.w + x) * 4] / 20);
  return n >= 1 && n <= META.grup.length ? META.grup[n - 1] : null;
}

/** Dokunma olayından grup (figür öğesine göre); yan: kişinin sağı/solu (önden bakışta görüntünün solu = sağ). */
export function hitEvent(el, view, e) {
  const r = el.getBoundingClientRect();
  const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
  const g = hitAt(view, fx, fy);
  const sagda = view === 'front' ? fx < 0.5 : fx >= 0.5;
  return g ? { g, yan: sagda ? 'sag' : 'sol' } : null;
}
