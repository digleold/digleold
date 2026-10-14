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
