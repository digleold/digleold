const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

// Effetto luce che segue il cursore sulle card
document.addEventListener('pointermove', (e) => {
  const card = e.target.closest && e.target.closest('.card');
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - r.left}px`);
  card.style.setProperty('--my', `${e.clientY - r.top}px`);
});

// Rete di nodi animata (canvas.net)
document.querySelectorAll('canvas.net').forEach((canvas) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let w = 0, h = 0, nodes = [], raf = 0, visible = true;
  const mouse = { x: -999, y: -999 };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.max(24, Math.min(70, Math.round((w * h) / 16000)));
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const a of nodes) {
      if (!reduceMotion) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.strokeStyle = `rgba(52, 225, 162, ${0.35 * (1 - d / 130)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm < 160) {
        ctx.strokeStyle = `rgba(247, 198, 0, ${0.6 * (1 - dm / 160)})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = dm < 160 ? '#f7c600' : '#34e1a2';
      ctx.beginPath(); ctx.arc(a.x, a.y, 2, 0, Math.PI * 2); ctx.fill();
    }
    if (!reduceMotion && visible) raf = requestAnimationFrame(draw);
  };

  const host = canvas.parentElement;
  host.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  host.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
  new ResizeObserver(() => { resize(); if (reduceMotion) draw(); }).observe(canvas);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((en) => {
      visible = en[0].isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) draw();
    }).observe(canvas);
  }
  resize(); draw();
});

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
    window.location.href = `mailto:${d.get('divisione')}?subject=${subject}&body=${body}`;
  });
}
