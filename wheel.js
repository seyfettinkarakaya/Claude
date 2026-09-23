// YüzmeSK — dikey tekerlek (wheel) bileşeni.
//
// Öğeleri kendisi oluşturmaz; verilen elemanları konumlandırır. Aktif öğe
// ortada tam boyutta; komşular küçülerek ve soluklaşarak üstte/altta durur.
// Sürükleme, atalet (momentum) ve en yakın öğeye oturma (snap) içerir.
//
// Her öğe elemanında `.w-main` (tek satırlık ana bilgi) bulunmalıdır; aktif
// olmayan öğelerde `.w-detail` ve `.w-top` soluklaşarak gizlenir.

const DRAG_PX_PER_ITEM = 96;   // sürüklemede bir öğe atlamak için gereken yol
const NEIGHBOR_GAP = 18;       // aktif kart ile ilk komşu arası boşluk
const NEIGHBOR_SCALE = [1, 0.6, 0.5, 0.44, 0.4];
const NEIGHBOR_ALPHA = [1, 0.55, 0.32, 0.16, 0];
const MOMENTUM_MS = 260;       // hız × bu süre = atalet ile gidilecek öğe sayısı

function lerpTable(table, d) {
  if (d >= table.length - 1) return table[table.length - 1];
  const i = Math.floor(d);
  return table[i] + (table[i + 1] - table[i]) * (d - i);
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export class Wheel {
  constructor(el, { onChange, onTapActive } = {}) {
    this.el = el;
    this.onChange = onChange || (() => {});
    this.onTapActive = onTapActive || (() => {});
    this.items = [];
    this.metrics = [];
    this.pos = 0;
    this.lastIndex = -1;
    this.anim = null;
    this.drag = null;
    this.wheelAcc = 0;

    el.addEventListener('pointerdown', (e) => this._down(e));
    el.addEventListener('pointermove', (e) => this._move(e));
    el.addEventListener('pointerup', (e) => this._up(e));
    el.addEventListener('pointercancel', (e) => this._up(e, true));
    el.addEventListener('wheel', (e) => this._wheel(e), { passive: false });
    // iOS'ta sayfanın kendisinin kaymasını engelle.
    el.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    this._ro = new ResizeObserver(() => this.layout());
    this._ro.observe(el);
  }

  get index() {
    return Math.max(0, Math.min(this.items.length - 1, Math.round(this.pos)));
  }

  setItems(nodes, index = 0) {
    this.el.replaceChildren(...nodes);
    this.items = nodes;
    this.pos = Math.max(0, Math.min(nodes.length - 1, index));
    this.lastIndex = -1;
    this.layout();
  }

  /** Öğe içerikleri değiştiğinde (ör. tamamlandı işareti) ölçüleri yenile. */
  layout() {
    this.metrics = this.items.map((node) => {
      const main = node.querySelector('.w-main');
      const mainCenter = main ? main.offsetTop + main.offsetHeight / 2 : node.offsetHeight / 2;
      const mainH = main ? main.offsetHeight : 48;
      return { above: mainCenter, below: node.offsetHeight - mainCenter, mainH };
    });
    this.render();
  }

  scrollTo(index, animate = true) {
    const target = Math.max(0, Math.min(this.items.length - 1, index));
    if (!animate) {
      this._stopAnim();
      this.pos = target;
      this.render();
      return;
    }
    this._animateTo(target);
  }

  render() {
    const n = this.items.length;
    if (!n) return;
    const h = this.el.clientHeight;
    const p = Math.max(0, Math.min(n - 1, this.pos));

    // Aktif kartın boyu, iki komşu öğe arasında harmanlanır.
    const i0 = Math.floor(p);
    const i1 = Math.min(n - 1, i0 + 1);
    const f = p - i0;
    const m0 = this.metrics[i0];
    const m1 = this.metrics[i1];
    if (!m0 || !m1) return;
    const above = m0.above + (m1.above - m0.above) * f;
    const below = m0.below + (m1.below - m0.below) * f;
    const mainH = m0.mainH;

    // Aktif kart dikeyde ortalanır; referans noktası ana satırın ortası.
    const anchor = h / 2 + (above - below) / 2;
    const step = mainH * NEIGHBOR_SCALE[1] + 20;
    const upFirst = above + NEIGHBOR_GAP + (mainH * NEIGHBOR_SCALE[1]) / 2;
    const downFirst = below + NEIGHBOR_GAP + (mainH * NEIGHBOR_SCALE[1]) / 2;

    for (let i = 0; i < n; i++) {
      const node = this.items[i];
      const o = i - this.pos;
      const d = Math.abs(o);
      if (d > 4.5) {
        node.style.visibility = 'hidden';
        continue;
      }
      const first = o < 0 ? upFirst : downFirst;
      const dist = d <= 1 ? d * first : first + (d - 1) * step;
      const y = anchor + (o < 0 ? -dist : dist);
      const scale = lerpTable(NEIGHBOR_SCALE, d);
      const alpha = lerpTable(NEIGHBOR_ALPHA, d);
      const m = this.metrics[i];

      node.style.visibility = 'visible';
      node.style.transformOrigin = `50% ${m.above}px`;
      node.style.transform = `translate3d(0, ${(y - m.above).toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
      node.style.opacity = alpha.toFixed(3);
      node.style.zIndex = String(100 - Math.round(d * 10));
      node.style.setProperty('--detail', Math.max(0, 1 - d * 2).toFixed(3));
      node.classList.toggle('is-active', d < 0.5);
    }

    const idx = this.index;
    if (idx !== this.lastIndex) {
      this.lastIndex = idx;
      this.onChange(idx);
    }
  }

  // --- etkileşim ---------------------------------------------------------

  _down(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    this._stopAnim();
    this.drag = {
      id: e.pointerId,
      startY: e.clientY,
      startPos: this.pos,
      moved: false,
      samples: [{ t: e.timeStamp, pos: this.pos }],
      target: e.target,
    };
  }

  _move(e) {
    const g = this.drag;
    if (!g || e.pointerId !== g.id) return;
    const dy = e.clientY - g.startY;
    if (!g.moved && Math.abs(dy) > 8) {
      g.moved = true;
      try { this.el.setPointerCapture(e.pointerId); } catch { /* yok say */ }
    }
    if (!g.moved) return;

    let pos = g.startPos - dy / DRAG_PX_PER_ITEM;
    const max = this.items.length - 1;
    if (pos < 0) pos = pos * 0.35;               // uçlarda lastik etkisi
    else if (pos > max) pos = max + (pos - max) * 0.35;
    this.pos = pos;
    g.samples.push({ t: e.timeStamp, pos });
    if (g.samples.length > 8) g.samples.shift();
    this.render();
  }

  _up(e, cancelled = false) {
    const g = this.drag;
    if (!g || e.pointerId !== g.id) return;
    this.drag = null;

    if (!g.moved) {
      if (cancelled) return;
      const item = g.target && g.target.closest ? g.target.closest('.w-item') : null;
      const i = item ? this.items.indexOf(item) : -1;
      if (i < 0) return;
      if (i === this.index) this.onTapActive(i);
      else this._animateTo(i);
      return;
    }

    // Son ~100 ms'deki hızdan atalet hesapla.
    const now = e.timeStamp;
    const recent = g.samples.filter((s) => now - s.t < 100);
    let v = 0;
    if (recent.length >= 2) {
      const a = recent[0];
      const b = recent[recent.length - 1];
      if (b.t > a.t) v = (b.pos - a.pos) / (b.t - a.t);
    }
    const projected = this.pos + v * MOMENTUM_MS;
    this._animateTo(Math.round(projected));
  }

  _wheel(e) {
    e.preventDefault();
    this.wheelAcc += e.deltaY;
    if (Math.abs(this.wheelAcc) < 40) return;
    const dir = Math.sign(this.wheelAcc);
    this.wheelAcc = 0;
    this._animateTo(this.index + dir);
  }

  _animateTo(target) {
    this._stopAnim();
    const t = Math.max(0, Math.min(this.items.length - 1, target));
    const from = this.pos;
    const dist = Math.abs(t - from);
    if (dist < 0.001) {
      this.pos = t;
      this.render();
      return;
    }
    const duration = Math.min(700, 220 + dist * 110);
    const start = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - start) / duration);
      this.pos = from + (t - from) * easeOutCubic(k);
      this.render();
      if (k < 1) this.anim = requestAnimationFrame(tick);
      else this.anim = null;
    };
    this.anim = requestAnimationFrame(tick);
  }

  _stopAnim() {
    if (this.anim) cancelAnimationFrame(this.anim);
    this.anim = null;
  }
}
