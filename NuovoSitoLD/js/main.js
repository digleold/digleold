const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Menu mobile
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// Barra di avanzamento della lettura
const bar = document.querySelector('.progress');
if (bar) {
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Voce di menu attiva in base alla sezione visibile
const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]:not(.btn)')];
if (navAnchors.length && 'IntersectionObserver' in window) {
  const map = new Map(navAnchors.map((a) => [a.getAttribute('href').slice(1), a]));
  const so = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting && map.has(en.target.id)) {
        navAnchors.forEach((a) => a.classList.remove('active'));
        map.get(en.target.id).classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) so.observe(s); });
}

// Comparsa allo scroll
const items = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add('in'));
}

// Contatori animati
document.querySelectorAll('[data-count]').forEach((el) => {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const set = (v) => { el.textContent = Math.round(v) + suffix; };
  if (reduceMotion || !('IntersectionObserver' in window)) { set(target); return; }
  set(0);
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    const t0 = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      set(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { threshold: 0.6 });
  io.observe(el);
});

// Inclinazione 3D delle card + luce che segue il cursore
if (finePointer && !reduceMotion) {
  document.querySelectorAll('.tilt').forEach((el) => {
    const max = Number(el.dataset.tilt) || 9;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.classList.add('live');
      el.style.setProperty('--ry', `${(x - 0.5) * 2 * max}deg`);
      el.style.setProperty('--rx', `${-(y - 0.5) * 2 * max}deg`);
      el.style.setProperty('--mx', `${x * r.width}px`);
      el.style.setProperty('--my', `${y * r.height}px`);
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('live');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
} else {
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest && e.target.closest('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}

// Anno nel footer
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

// Modulo contatti: apre il programma di posta con il messaggio compilato
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const d = new FormData(form);
    const subject = encodeURIComponent('Richiesta informazioni dal sito');
    const body = encodeURIComponent(`Nome: ${d.get('nome')}\nEmail: ${d.get('email')}\n\n${d.get('messaggio')}`);
    window.location.href = `mailto:${d.get('argomento')}?subject=${subject}&body=${body}`;
  });
}

// ===== Portfolio: filtri e finestra di dettaglio =====
const filterBtns = document.querySelectorAll('.filters button');
const projCards = document.querySelectorAll('.proj');
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    projCards.forEach((c) => {
      const show = f === 'all' || c.dataset.cats.split(' ').includes(f);
      c.hidden = !show;
      c.classList.remove('in-filter');
      if (show) { c.classList.add('reveal', 'in'); void c.offsetWidth; if (!reduceMotion) c.classList.add('in-filter'); }
    });
  });
});

const dlg = document.getElementById('dlg');
if (dlg && typeof dlg.showModal === 'function') {
  const box = dlg.querySelector('.dlg-content');
  const count = dlg.querySelector('.dlg-count');
  let list = [], idx = 0;

  const render = () => {
    const card = list[idx];
    box.innerHTML = card.querySelector('.detail').innerHTML;
    count.textContent = `${idx + 1} / ${list.length}`;
    dlg.scrollTop = 0;
    const main = box.querySelector('.d-main img'), thumbs = box.querySelectorAll('.d-thumbs img');
    thumbs.forEach((t, i) => {
      if (i === 0) t.classList.add('on');
      t.addEventListener('click', () => { main.src = t.src; thumbs.forEach((x) => x.classList.toggle('on', x === t)); });
    });
    const a = card.classList.contains('y') ? 'var(--amber)' : 'var(--mint)';
    dlg.style.setProperty('--accent', a);
  };
  const open = (card) => {
    list = [...document.querySelectorAll(`[data-open][data-group="${card.dataset.group}"]`)].filter((c) => !c.hidden);
    idx = Math.max(0, list.indexOf(card));
    render();
    if (!dlg.open) { dlg.showModal(); document.documentElement.classList.add('dlg-open'); }
  };
  document.querySelectorAll('[data-open]').forEach((c) => c.addEventListener('click', (e) => { if (!e.target.closest('a')) open(c); }));
  dlg.querySelector('.dlg-prev').addEventListener('click', () => { idx = (idx - 1 + list.length) % list.length; render(); });
  dlg.querySelector('.dlg-next').addEventListener('click', () => { idx = (idx + 1) % list.length; render(); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
  dlg.addEventListener('close', () => document.documentElement.classList.remove('dlg-open'));
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') dlg.querySelector('.dlg-next').click();
    if (e.key === 'ArrowLeft') dlg.querySelector('.dlg-prev').click();
  });
}

// ===== Raggi di luce: porting in JavaScript puro dell'Animated Beam di Magic UI =====
// Percorso curvo tra due elementi misurati nel DOM, con un raggio di luce che scorre (ease out expo).
// I nodi a sinistra "entrano" nel centro, quelli a destra "escono" dal centro. Si ricalcola al ridimensionamento.
(function () {
  const stage = document.getElementById('beam-stage');
  if (!stage) return;
  const svg = stage.querySelector('.beams'), hub = stage.querySelector('.hub-mark');
  const nodes = [...stage.querySelectorAll('[data-beam]')];
  const NS = 'http://www.w3.org/2000/svg';
  const offs = (el) => { let x = 0, y = 0, n = el; while (n && n !== stage) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return { x, y, w: el.offsetWidth, h: el.offsetHeight }; };
  const edge = (r, tx, ty) => { // punto sul bordo del rettangolo, in direzione (tx, ty)
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2, dx = tx - cx, dy = ty - cy;
    const s = Math.min((r.w / 2) / (Math.abs(dx) || 1e-6), (r.h / 2) / (Math.abs(dy) || 1e-6));
    return [cx + dx * s, cy + dy * s];
  };
  const el = (name, attrs) => { const e = document.createElementNS(NS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

  const draw = () => {
    const W = stage.clientWidth, H = stage.clientHeight;
    if (!W || !H) return;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.textContent = '';
    const defs = el('defs', {}); const f = el('filter', { id: 'bglow', x: '-20%', y: '-20%', width: '140%', height: '140%' });
    f.appendChild(el('feGaussianBlur', { stdDeviation: '3' })); defs.appendChild(f); svg.appendChild(defs);
    const h = offs(hub), hx = h.x + h.w / 2, hy = h.y + h.h / 2, hr = h.w / 2 + 2;
    nodes.forEach((n, i) => {
      const r = offs(n), cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      const [sx, sy] = edge(r, hx, hy);
      const dx = hx - cx, dy = hy - cy, len = Math.hypot(dx, dy) || 1;
      const ex = hx - (dx / len) * hr, ey = hy - (dy / len) * hr;
      const curv = (i % 2 ? 1 : -1) * len * (0.1 + ((i * 3) % 4) * 0.035); // curvatura alternata, deterministica
      const mx = (sx + ex) / 2 - (dy / len) * curv, my = (sy + ey) / 2 + (dx / len) * curv;
      const out = n.dataset.beam === 'out';
      const d = out ? `M ${ex} ${ey} Q ${mx} ${my} ${sx} ${sy}` : `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`;
      const color = n.classList.contains('amber') ? '#f7c600' : '#34e1a2';
      const st = `stroke:${color};--dur:${(4 + ((i * 7) % 5) * 0.6).toFixed(1)}s;--delay:${(i * 0.45).toFixed(2)}s`;
      svg.appendChild(el('path', { class: 'beam-base', d, style: `stroke:${color}` }));
      svg.appendChild(el('path', { class: 'beam-glow', d, pathLength: 100, style: st }));
      svg.appendChild(el('path', { class: 'beam-run', d, pathLength: 100, style: st }));
    });
  };
  draw();
  if ('ResizeObserver' in window) new ResizeObserver(draw).observe(stage);
  window.addEventListener('load', draw);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  if ('IntersectionObserver' in window) new IntersectionObserver((e) => stage.classList.toggle('on', e[0].isIntersecting)).observe(stage);
  else stage.classList.add('on');
})();

// ===== Testo che accelera con lo scroll: porting dello Scroll Based Velocity di Magic UI =====
// Due righe in direzioni opposte; la velocita' dello scroll (lisciata) accelera il moto e ne inverte il verso.
(function () {
  const rows = [...document.querySelectorAll('.v-row')];
  if (!rows.length || reduceMotion) return;
  const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
  const wrap = (min, max, v) => { const r = max - min; return (((v - min) % r) + r) % r + min; };
  const st = rows.map((row) => { const track = row.querySelector('.v-track'); return { row, track, item: track.querySelector('.v-item'), base: Number(row.dataset.v) || 3, x: 0, dir: 1, reps: 1 }; });
  const calc = () => st.forEach((s) => {
    const reps = Math.ceil(s.row.offsetWidth / (s.item.offsetWidth || 1)) + 2; s.reps = reps;
    while (s.track.children.length < reps) s.track.appendChild(s.item.cloneNode(true));
    while (s.track.children.length > reps) s.track.lastChild.remove();
  });
  calc(); window.addEventListener('resize', calc);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(calc);

  let lastY = window.scrollY, vel = 0, lastT = performance.now(), raf = 0, visible = false;
  const tick = (now) => {
    const dt = clampN((now - lastT) / 1000, 0.001, 0.05); lastT = now;
    const y = window.scrollY, raw = (y - lastY) / dt; lastY = y;
    vel += (raw - vel) * Math.min(1, dt * 9);                 // molla smorzata sulla velocita' di scroll
    const vf = (vel / 1000) * 5;                                // [0, 1000] px/s  ->  [0, 5]
    st.forEach((s) => {
      let move = s.dir * s.base * dt;
      if (vf < 0) s.dir = -1; else if (vf > 0) s.dir = 1;
      move += s.dir * move * vf;
      s.x += move;
      s.track.style.transform = `translate3d(${wrap(-100 / s.reps, 0, s.x)}%,0,0) skewX(${clampN(-vf * 2, -8, 8)}deg)`;
    });
    raf = visible ? requestAnimationFrame(tick) : 0;
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible && !raf) { lastT = performance.now(); lastY = window.scrollY; raf = requestAnimationFrame(tick); } }, { rootMargin: '150px 0px' }).observe(rows[0].parentElement);
  }
})();

// ===== Luce che segue il cursore e pulsanti "magnetici" (solo con mouse) =====
if (finePointer && !reduceMotion) {
  const glow = document.createElement('div'); glow.className = 'cursor-glow'; glow.setAttribute('aria-hidden', 'true'); document.body.appendChild(glow);
  let gx = 0, gy = 0, tx = 0, ty = 0, gr = 0;
  const loop = () => { gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12; glow.style.transform = `translate3d(${gx}px,${gy}px,0)`; gr = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(loop) : 0; };
  const mags = [...document.querySelectorAll('.btn')];
  let pend = false, px = 0, py = 0;
  window.addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY; glow.classList.add('on'); if (!gr) gr = requestAnimationFrame(loop);
    px = e.clientX; py = e.clientY;
    if (pend) return; pend = true;
    requestAnimationFrame(() => {
      pend = false;
      mags.forEach((b) => {
        const r = b.getBoundingClientRect(); if (!r.width || r.bottom < -80 || r.top > window.innerHeight + 80) return;
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = px - cx, dy = py - cy, R = Math.max(r.width, r.height) / 2 + 56;
        if (Math.hypot(dx, dy) < R) b.style.translate = `${(dx * 0.22).toFixed(1)}px ${(dy * 0.3).toFixed(1)}px`; else if (b.style.translate) b.style.translate = '';
      });
    });
  }, { passive: true });
  document.addEventListener('pointerleave', () => glow.classList.remove('on'));
}
