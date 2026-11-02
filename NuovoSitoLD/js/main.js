// LD Technologies SRL - comportamento della pagina (nessuna dipendenza oltre a Lenis per lo scroll morbido)
(() => {
  const html = document.documentElement;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isCalm = () => mq.matches || html.dataset.motion === 'calm';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Scorrimento morbido (Lenis) ----------
  let lenis = null, lenisRaf = 0;
  const startLenis = () => {
    if (lenis || isCalm() || !window.Lenis) return;
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    const loop = (t) => { if (!lenis) return; lenis.raf(t); lenisRaf = requestAnimationFrame(loop); };
    lenisRaf = requestAnimationFrame(loop);
  };
  const stopLenis = () => { if (!lenis) return; cancelAnimationFrame(lenisRaf); lenis.destroy(); lenis = null; };
  startLenis();
  window.addEventListener('load', startLenis);

  const scrollTo = (hash) => {
    const target = hash === '#top' ? document.body : document.querySelector(hash);
    if (!target) return;
    if (lenis) lenis.scrollTo(hash === '#top' ? 0 : target, { offset: -64, duration: 1.3 });
    else target.scrollIntoView({ behavior: isCalm() ? 'auto' : 'smooth', block: 'start' });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const hash = a.getAttribute('href');
    if (!document.querySelector(hash) && hash !== '#top') return;
    e.preventDefault();
    closeMenu();
    if (dlg && dlg.open) dlg.close();
    scrollTo(hash);
    history.replaceState(null, '', hash);
  });

  // ---------- Menu mobile ----------
  const menu = $('#menu'), menuBtn = $('.menu-btn');
  function closeMenu() {
    if (!menu || !menu.classList.contains('open')) return;
    menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = 'Menu';
    if (lenis) lenis.start(); else html.style.overflow = '';
  }
  if (menu && menuBtn) {
    menuBtn.addEventListener('click', () => {
      const open = !menu.classList.contains('open');
      if (!open) { closeMenu(); return; }
      menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.textContent = 'Chiudi';
      if (lenis) lenis.stop(); else html.style.overflow = 'hidden';
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  // ---------- Testo che si riempie con lo scroll (parola per parola) ----------
  const rv = $$('[data-rv]').map((el) => {
    const full = el.textContent.trim().replace(/\s+/g, ' ');
    el.textContent = '';
    const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = full;
    const vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
    const words = full.split(' ').map((w, i, a) => {
      const s = document.createElement('span'); s.className = 'w'; s.textContent = w; vis.appendChild(s);
      if (i < a.length - 1) vis.appendChild(document.createTextNode(' '));
      return s;
    });
    el.append(sr, vis); el.classList.add('rv', 'on');
    return { el, words, visible: false, load: el.hasAttribute('data-rv-load'), last: -1 };
  });
  const setWords = (r, p) => {
    const n = r.words.length;
    r.words.forEach((w, i) => { const v = clamp(p * n - i, 0, 1); w.style.setProperty('--p', v.toFixed(3)); });
  };
  const finishAll = () => rv.forEach((r) => setWords(r, 1));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((en) => en.forEach((x) => { const r = rv.find((q) => q.el === x.target); if (r) r.visible = x.isIntersecting; }), { rootMargin: '120px 0px' });
    rv.forEach((r) => io.observe(r.el));
  } else rv.forEach((r) => { r.visible = true; });
  // titolo d'apertura: si riempie da solo al caricamento
  const hero = rv.find((r) => r.load);
  if (hero) {
    if (isCalm()) setWords(hero, 1);
    else { setWords(hero, 0); const t0 = performance.now() + 150; const step = (t) => { const p = clamp((t - t0) / 1250, 0, 1); setWords(hero, 1 - Math.pow(1 - p, 3)); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
  }

  // ---------- Effetti legati allo scroll (un solo ciclo, solo se serve) ----------
  const par = $$('[data-parallax]');
  const parX = $$('[data-parallax-x]');
  const bar = $('.progress');
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight, y = window.scrollY, calm = isCalm();
    if (bar) { const h = document.documentElement.scrollHeight - vh; bar.style.transform = `scaleX(${h > 0 ? clamp(y / h, 0, 1) : 0})`; }
    if (calm) return;
    rv.forEach((r) => {
      if (r.load || !r.visible) return;
      const rect = r.el.getBoundingClientRect();
      const p = clamp((vh * 0.9 - rect.top) / (vh * 0.5 + rect.height * 0.55), 0, 1);
      const q = Math.round(p * 200);
      if (q !== r.last) { r.last = q; setWords(r, p); }
    });
    par.forEach((el) => {
      const rect = el.getBoundingClientRect(); if (rect.bottom < -80 || rect.top > vh + 80) return;
      const d = (rect.top + rect.height / 2 - vh / 2) / vh;
      const inner = el.querySelector('img'); if (inner) inner.style.transform = `translate3d(0,${(d * -9).toFixed(2)}%,0) scale(1.14)`;
    });
    parX.forEach((el) => { const rect = el.getBoundingClientRect(); if (rect.bottom < -80 || rect.top > vh + 80) return; el.style.transform = `translate3d(${(((rect.top + rect.height / 2) / vh - 0.6) * -10).toFixed(2)}vw,0,0)`; });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
  if (isCalm()) finishAll();

  // ---------- Comparsa dei blocchi ----------
  const rise = $$('.rise');
  if ('IntersectionObserver' in window && !isCalm()) {
    const io = new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rise.forEach((el) => io.observe(el));
  } else rise.forEach((el) => el.classList.add('in'));

  // ---------- Contatori ----------
  $$('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count), suffix = el.dataset.suffix || '';
    const set = (v) => { el.textContent = Math.round(v) + suffix; };
    if (isCalm() || !('IntersectionObserver' in window)) { set(target); return; }
    set(0);
    const io = new IntersectionObserver((en) => {
      if (!en[0].isIntersecting) return; io.disconnect();
      const t0 = performance.now(), dur = 1500;
      const tick = (t) => { const p = clamp((t - t0) / dur, 0, 1); set(target * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
  });

  // ---------- Filtri progetti ----------
  let activeFilter = 'all';
  const filterBtns = $$('.filters button'), cards = $$('.proj');
  filterBtns.forEach((btn) => btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    cards.forEach((c) => { const show = activeFilter === 'all' || c.dataset.cats.split(' ').includes(activeFilter); c.hidden = !show; if (show) c.classList.add('in'); });
  }));

  // ---------- Finestra di dettaglio ----------
  const dlg = $('#dlg'), details = $('#details');
  if (dlg && details && typeof dlg.showModal === 'function') {
    const box = $('.dlg-content', dlg), count = $('.dlg-count', dlg);
    let list = [], idx = 0;
    const listFor = (id) => {
      const g = id.startsWith('d-partner') ? 'partner' : 'proj';
      let all = $$(`[data-g="${g}"]`, details);
      if (g === 'proj' && activeFilter !== 'all') { const f = all.filter((d) => d.dataset.cats.split(' ').includes(activeFilter)); if (f.some((d) => d.id === id)) all = f; }
      return all;
    };
    const render = () => {
      const d = list[idx]; box.innerHTML = d.innerHTML; count.textContent = `${idx + 1} / ${list.length}`; dlg.scrollTop = 0; box.scrollTop = 0;
      const main = $('.d-main img', box), thumbs = $$('.d-thumbs img', box);
      thumbs.forEach((t, i) => { if (i === 0) t.classList.add('on'); t.addEventListener('click', () => { main.src = t.src; thumbs.forEach((x) => x.classList.toggle('on', x === t)); }); });
    };
    const open = (id) => {
      list = listFor(id); idx = Math.max(0, list.findIndex((d) => d.id === id)); render();
      if (!dlg.open) { dlg.showModal(); html.classList.add('dlg-open'); if (lenis) lenis.stop(); }
    };
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-open]'); if (!t || e.target.closest('a')) return;
      open(t.dataset.d);
    });
    $('.dlg-prev', dlg).addEventListener('click', () => { idx = (idx - 1 + list.length) % list.length; render(); });
    $('.dlg-next', dlg).addEventListener('click', () => { idx = (idx + 1) % list.length; render(); });
    dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
    dlg.addEventListener('close', () => { html.classList.remove('dlg-open'); if (lenis) lenis.start(); else if (!isCalm()) startLenis(); });
    dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') $('.dlg-next', dlg).click(); if (e.key === 'ArrowLeft') $('.dlg-prev', dlg).click(); });
  }

  // ---------- Modulo contatti ----------
  const form = $('#contact-form');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const d = new FormData(form);
    const subject = encodeURIComponent('Richiesta informazioni dal sito');
    const body = encodeURIComponent(`Nome: ${d.get('nome')}\nEmail: ${d.get('email')}\n\n${d.get('messaggio')}`);
    window.location.href = `mailto:${d.get('argomento')}?subject=${subject}&body=${body}`;
  });

  // ---------- Anno e controllo delle animazioni ----------
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  const mt = $('.motion-toggle');
  if (mt) {
    const apply = (calm, save) => {
      if (calm) html.dataset.motion = 'calm'; else delete html.dataset.motion;
      mt.setAttribute('aria-pressed', String(calm));
      if (save) { try { localStorage.setItem('ld-motion', calm ? 'calm' : 'full'); } catch (e) { /* preferenza non salvata */ } }
      if (calm) { stopLenis(); finishAll(); rise.forEach((el) => el.classList.add('in')); par.forEach((el) => { const i = el.querySelector('img'); if (i) i.style.transform = ''; }); parX.forEach((el) => { el.style.transform = ''; }); }
      else { startLenis(); update(); }
      window.dispatchEvent(new Event('ldmotion'));
    };
    mt.setAttribute('aria-pressed', String(html.dataset.motion === 'calm'));
    mt.addEventListener('click', () => apply(html.dataset.motion !== 'calm', true));
  }
})();
