// Assistente virtuale del sito: avatar con saluto video e chat.
// Modalita' base (senza server): risponde con le informazioni gia' presenti nella pagina (FAQ, servizi, progetti, partner, contatti),
// quindi in italiano e in inglese resta sempre allineato ai contenuti. Modalita' IA: se nel <meta name="ld-assistant-endpoint"> c'e' l'indirizzo
// del servizio (vedi assistant-api/), le domande vanno al modello; in caso di errore si torna alla modalita' base.
(() => {
  const html = document.documentElement;
  const root = document.getElementById('asst');
  if (!root) return;
  const EN = html.lang === 'en';
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const isCalm = () => matchMedia('(prefers-reduced-motion: reduce)').matches || html.dataset.motion === 'calm';

  const L = EN ? {
    hi: 'Hello! Ask me about our services.', fallback: 'I could not find a precise answer on the website. You can call +39 080 849 3561 or write to info@ldtechnologies.it.',
    thanks: 'You are welcome! Anything else I can help with?', hello: 'Hello! What would you like to know about LD Technologies?',
    contact: 'You can reach us here:\nPhone: +39 080 849 3561\nIT services and software: info@ldtechnologies.it\nRobotics and automation: info@ldrobotics.it\nOffice: Via Enrico Fermi snc, 70024 Gravina in Puglia (BA)\nVAT: 08921740729',
    price: 'We do not publish prices: every project is analysed with the client first. You can book a free consultation to get a tailored estimate.',
    book: 'Book a consultation', call: 'Call', open: 'Open the page', section: 'Go to the section', send: 'Send', err: 'Something went wrong. Please try again or call +39 080 849 3561.',
    base: 'Preview mode: answers come from the information on this website.', soundOn: 'Turn sound on', soundOff: 'Mute', replay: 'Replay greeting', thinking: 'Typing',
    greetText: 'Hello, I\'m the virtual assistant of LD Technologies. I can help you discover our IT services, custom software and collaborative robotics. Ask me about our projects, our partners, or how to book a free consultation.',
    suggest: ['What services do you offer?', 'Do you have robotics projects?', 'Which partners do you work with?', 'How do I book a consultation?'],
  } : {
    hi: 'Ciao! Chiedimi dei nostri servizi.', fallback: 'Non ho trovato una risposta precisa nel sito. Puoi chiamare lo 080 849 3561 o scrivere a info@ldtechnologies.it.',
    thanks: 'Di nulla! Posso aiutarti con altro?', hello: 'Ciao! Cosa vuoi sapere su LD Technologies?',
    contact: 'Puoi contattarci così:\nTelefono: 080 849 3561\nServizi IT e software: info@ldtechnologies.it\nRobotica e automazione: info@ldrobotics.it\nSede: Via Enrico Fermi snc, 70024 Gravina in Puglia (BA)\nP.IVA: 08921740729',
    price: 'Non pubblichiamo prezzi: ogni progetto viene prima analizzato con il cliente. Puoi prenotare una consulenza gratuita per ricevere una proposta su misura.',
    book: 'Prenota una consulenza', call: 'Chiama', open: 'Apri la scheda', section: 'Vai alla sezione', send: 'Invia', err: 'Qualcosa non ha funzionato. Riprova o chiama lo 080 849 3561.',
    base: 'Anteprima: le risposte vengono dalle informazioni presenti in questo sito.', soundOn: 'Attiva l\'audio', soundOff: 'Disattiva l\'audio', replay: 'Riascolta il saluto', thinking: 'Sta scrivendo',
    greetText: 'Ciao, sono l\'assistente virtuale di LD Technologies. Posso aiutarti a scoprire i nostri servizi informatici, il software su misura e la robotica collaborativa. Chiedimi pure dei progetti, dei partner o di come prenotare una consulenza gratuita.',
    suggest: ['Che servizi offrite?', 'Avete progetti di robotica?', 'Con quali partner lavorate?', 'Come prenoto una consulenza?'],
  };

  // ---------- elementi ----------
  const fab = $('.asst-fab'), panel = $('.asst-panel'), log = $('.asst-log'), form = $('.asst-form'), input = $('input', form), sendBtn = $('button', form);
  const hello = $('.asst-hello'), sugg = $('.asst-sugg'), media = $('.asst-media'), snd = $('.snd'), rep = $('.rep'), closeBtn = $('.cls');
  const endpoint = (document.querySelector('meta[name="ld-assistant-endpoint"]') || {}).content || '';
  let video = null, started = false;

  // ---------- video di saluto (si carica solo alla prima apertura) ----------
  const setupVideo = () => {
    const src = media.dataset.video;
    if (!src || video) return;
    video = document.createElement('video');
    video.playsInline = true; video.preload = 'metadata'; video.setAttribute('aria-hidden', 'true'); video.muted = false;
    if (media.dataset.poster) video.poster = media.dataset.poster;
    video.src = src;
    video.addEventListener('error', () => { video.remove(); video = null; snd.hidden = true; rep.hidden = true; });
    video.addEventListener('ended', () => { snd.hidden = true; });
    media.prepend(video);
    const fbk = $('.fallback', media); if (fbk) fbk.hidden = true;
    const ph = $('.poster', media); if (ph) ph.hidden = true;
  };
  const playGreeting = () => {
    if (!video || isCalm()) return;
    video.currentTime = 0; video.muted = false;
    const pr = video.play();
    if (pr && pr.catch) pr.catch(() => { video.muted = true; video.play().catch(() => {}); });
    snd.hidden = false; updateSnd();
  };
  const updateSnd = () => {
    if (!video) return;
    const muted = video.muted;
    snd.setAttribute('aria-label', muted ? L.soundOn : L.soundOff); snd.title = snd.getAttribute('aria-label');
    snd.querySelector('.on').hidden = muted; snd.querySelector('.off').hidden = !muted;
  };
  snd.addEventListener('click', () => { if (video) { video.muted = !video.muted; if (!video.muted && video.paused) video.play().catch(() => {}); updateSnd(); } });
  rep.addEventListener('click', () => playGreeting());

  // ---------- messaggi ----------
  const add = (text, who, acts, cls) => {
    const m = document.createElement('div'); m.className = 'asst-msg ' + who + (cls ? ' ' + cls : ''); m.textContent = text;
    if (acts && acts.length) {
      const w = document.createElement('div'); w.className = 'asst-acts';
      acts.forEach((a) => {
        const el = document.createElement(a.href ? 'a' : 'button'); el.textContent = a.label; if (a.pri) el.className = 'pri';
        if (a.href) { el.href = a.href; if (a.href.startsWith('#')) el.addEventListener('click', () => close()); }
        else { el.type = 'button'; el.addEventListener('click', () => { a.fn(); }); }
        w.appendChild(el);
      });
      m.appendChild(w);
    }
    log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
  };
  const typing = () => { const m = document.createElement('div'); m.className = 'asst-msg bot asst-typing'; m.setAttribute('aria-label', L.thinking); m.innerHTML = '<i></i><i></i><i></i>'; log.appendChild(m); log.scrollTop = log.scrollHeight; return m; };

  // ---------- conoscenza: costruita dalla pagina ----------
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const norm = (s) => clean(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9+#.\s]/g, ' ');
  const STOP = new Set((EN ? 'the a an and or of to for in on at with is are do does you your we our what which how can i me it this that have has about from by be as' : 'il lo la i gli le un una uno e o di del della dei delle da in con su per tra fra a al alla ai che chi cosa come quali quale sono siete avete fate puoi posso mi ti vi ci voi noi vostro vostra nostri nostre vostri vostre ho ha hanno essere questo questa').split(' '));
  const SYN = EN ? { cobot: 'robot', cobots: 'robot', robots: 'robot', robotics: 'robot', partners: 'partner', prices: 'price', cost: 'price', quote: 'price' }
    : { cobot: 'robot', robotica: 'robot', robotico: 'robot', robotici: 'robot', partners: 'partner', costo: 'prezzo', costi: 'prezzo', prezzi: 'prezzo', preventivo: 'prezzo', siti: 'sito', web: 'sito', gestionale: 'software', programmi: 'software' };
  const toks = (s) => norm(s).split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)).map((w) => { w = SYN[w] || w; return w.length > 5 ? w.replace(/(mente|zione|zioni|amento|amenti|ing|ers|ies|es|i|e|a|o|s)$/, '') : w.replace(/(i|e|a|o|s)$/, ''); });

  let KB = null;
  const build = () => {
    const k = [];
    const push = (kind, title, body, link, id, cats, lead) => { const t = clean(title), b = clean(body); if (t || b) k.push({ kind, title: t, body: b, link, id, cats: cats || '', lead: clean(lead), tt: new Set(toks(t)), bt: new Set(toks(t + ' ' + b)) }); };
    $$('.faq details').forEach((d) => push('faq', $('summary span', d) ? $('summary span', d).textContent : '', $('p', d) ? $('p', d).textContent : '', '#faq'));
    $$('.svc details').forEach((d) => push('svc', $('.t', d).textContent, $('.more', d) ? $('.more', d).textContent : '', '#servizi'));
    $$('#details [data-g]').forEach((d) => {
      const txt = $('.d-text', d).cloneNode(true);
      txt.querySelectorAll('strong, .d-title, .tagline').forEach((x) => x.parentNode.removeChild(x));
      const paras = [...txt.querySelectorAll(':scope > p')].map((p) => clean(p.textContent)).filter(Boolean);
      const bul = [...txt.querySelectorAll('li')].map((x) => clean(x.textContent)).join('; ');
      push(d.dataset.g === 'partner' ? 'partner' : 'proj', $('.d-title', d).textContent, paras.join(' ') + (bul ? ' ' + bul : ''), d.dataset.g === 'partner' ? '#partner' : '#archivio', d.id, d.dataset.cats || '', paras[0] || '');
    });
    const co = document.querySelector('#azienda .lead'); if (co) push('about', EN ? 'About LD Technologies company who we are' : 'Chi siamo azienda LD Technologies', co.textContent + ' ' + ($('#azienda .body') ? $('#azienda .body').textContent : ''), '#azienda');
    $$('#azienda .cols3 > div').forEach((d) => push('method', (d.querySelector('h3') || {}).textContent + (EN ? ' method phase' : ' metodo fase'), (d.querySelector('p') || {}).textContent, '#azienda'));
    const ind = $$('.ind li').map((x) => x.textContent).join(', '); if (ind) push('ind', EN ? 'Industries sectors we work with' : 'Settori con chi lavoriamo clienti', ind, '#cosa-facciamo');
    KB = k;
  };
  const search = (q) => {
    if (!KB) build();
    const qt = toks(q); if (!qt.length) return [];
    const out = [];
    KB.forEach((e) => {
      let sc = 0;
      qt.forEach((w) => { if (e.tt.has(w)) sc += 3; else if (e.bt.has(w)) sc += 1; else { for (const x of e.tt) if (x.startsWith(w) || w.startsWith(x)) { sc += 1.5; break; } } });
      if (sc > 0) out.push({ e, sc: sc / Math.sqrt(qt.length + 1) });
    });
    return out.sort((a, b) => b.sc - a.sc);
  };
  const shorten = (s, n) => { s = clean(s); if (s.length <= n) return s; const cut = s.slice(0, n); const p = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; ')); return (p > n * 0.5 ? cut.slice(0, p + 1) : cut.replace(/\s+\S*$/, '') + '…'); };
  const openCard = (id) => { const t = document.querySelector(`[data-open][data-d="${id}"]`); if (t) { close(); setTimeout(() => t.click(), 120); } };

  const kb = () => { if (!KB) build(); return KB; };
  const names = (kind, f) => kb().filter((e) => e.kind === kind && (!f || f(e))).map((e) => e.title);
  const mentions = (q, kind) => kb().some((e) => e.kind === kind && toks(e.title).some((w) => w.length > 3 && toks(q).includes(w)));

  // ---------- risposta in modalita' base ----------
  const answerLocal = (q) => {
    const n = norm(q);
    const has = (...w) => w.some((x) => n.includes(x));
    const cta = [{ label: L.book, href: '#contatti', pri: true }, { label: L.call, href: 'tel:+390808493561' }];
    if (!n.trim()) return { text: L.fallback, acts: cta };
    if (/\b(ciao|salve|buongiorno|buonasera|hello|hi|hey|good morning|good evening)\b/.test(n) && n.split(/\s+/).length <= 3) return { text: L.hello };
    if (/\b(grazie|thanks|thank you|thx)\b/.test(n)) return { text: L.thanks };
    if (has('prezzo', 'prezzi', 'costo', 'costi', 'quanto costa', 'preventiv', 'tariff', 'price', 'prices', 'how much', 'quote', 'estimate', 'cost')) return { text: L.price, acts: cta };
    if (has('contatt', 'telefon', 'chiamar', 'email', 'mail', 'indirizzo', 'dove siete', 'dove si trova', 'sede', 'partita iva', 'p.iva', 'orari', 'contact', 'phone', 'call you', 'address', 'where are', 'location', 'office', 'vat', 'reach you', 'consulenz', 'consultation', 'appuntamento', 'incontro', 'meeting', 'book')) return { text: L.contact, acts: cta };
    // domande generali: elenchi ricavati dalla pagina
    if (has('partner', 'produttor', 'collaborate', 'collabor', 'manufacturer', 'brand', 'who do you work with') && !mentions(q, 'partner')) {
      const p = names('partner');
      return { text: (EN ? 'We work with these manufacturers: ' : 'Collaboriamo con questi produttori: ') + p.join(', ') + (EN ? '. Ask me about any of them.' : '. Chiedimi pure di uno di loro.'), acts: [{ label: EN ? 'See partners' : 'Vedi i partner', href: '#partner', pri: true }] };
    }
    if (has('che servizi', 'quali servizi', 'servizi offrite', 'cosa fate', 'cosa offrite', 'di cosa vi occupate', 'what services', 'services do you', 'what do you do', 'what do you offer', 'what you offer')) {
      const grp = $$('.svc-group'), titles = (g) => (g ? $$('.svc .t', g).map((x) => x.textContent) : []);
      return { text: (EN ? 'Software and infrastructure: ' : 'Software e infrastrutture: ') + titles(grp[0]).join(', ') + '.\n' + (EN ? 'Robotics and automation: ' : 'Robotica e automazione: ') + titles(grp[1]).join(', ') + '.', acts: [{ label: EN ? 'See all services' : 'Vedi i servizi', href: '#servizi', pri: true }, { label: L.book, href: '#contatti' }] };
    }
    if (has('progett', 'project', 'portfolio', 'lavori', 'referenz', 'case stud', 'clienti', 'clients', 'customers') && !mentions(q, 'proj')) {
      const rob = has('robot', 'cobot', 'automaz', 'automation');
      const list = names('proj', (e) => (rob ? e.cats.includes('robotica') : !e.cats.includes('robotica')));
      const head = rob ? (EN ? 'Our robotics projects: ' : 'I nostri progetti di robotica: ') : (EN ? 'Some of our IT and software projects: ' : 'Alcuni dei nostri progetti informatici e software: ');
      return { text: head + (rob ? list : list.slice(0, 6)).join(', ') + '.', acts: [{ label: EN ? 'See all projects' : 'Vedi tutti i progetti', href: '#archivio', pri: true }] };
    }
    const r = search(q);
    if (!r.length || r[0].sc < 1.1) return { text: L.fallback, acts: cta };
    const top = r[0].e, second = r[1] && r[1].sc > r[0].sc * 0.8 ? r[1].e : null;
    const acts = [];
    if (top.id) acts.push({ label: L.open, fn: () => openCard(top.id), pri: true });
    else if (top.link) acts.push({ label: L.section, href: top.link, pri: true });
    if (top.kind === 'faq' || top.kind === 'svc') acts.push({ label: L.book, href: '#contatti' });
    let text = top.kind === 'faq' ? top.body : (top.title ? top.title + (top.body ? ': ' : '') : '') + shorten(top.kind === 'proj' || top.kind === 'partner' ? (top.lead || top.body) : top.body, 300);
    if (second && second.kind === top.kind && second.id && second.id !== top.id) { acts.push({ label: second.title.length > 26 ? second.title.slice(0, 24) + '…' : second.title, fn: () => openCard(second.id) }); }
    return { text: shorten(text, 520), acts };
  };

  // ---------- invio ----------
  const history = [];
  let busy = false;
  const ask = async (q) => {
    q = clean(q).slice(0, 400); if (!q || busy) return;
    busy = true; sendBtn.disabled = true; input.value = ''; sugg.hidden = true;
    add(q, 'me'); history.push({ role: 'user', content: q });
    const t = typing();
    const wait = (ms) => new Promise((r) => setTimeout(r, isCalm() ? 0 : ms));
    let res = null;
    if (endpoint) {
      try {
        const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 20000);
        const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lang: EN ? 'en' : 'it', messages: history.slice(-6) }), signal: ctrl.signal, credentials: 'omit' });
        clearTimeout(to);
        if (r.ok) { const j = await r.json(); if (j && typeof j.reply === 'string' && j.reply.trim()) res = { text: j.reply.trim().slice(0, 1500), acts: [{ label: L.book, href: '#contatti', pri: true }] }; }
      } catch (e) { /* si torna alla modalita' base */ }
    }
    if (!res) { await wait(550); res = answerLocal(q); }
    t.remove(); add(res.text, 'bot', res.acts); history.push({ role: 'assistant', content: res.text });
    busy = false; sendBtn.disabled = false; if (panel.contains(document.activeElement) || !panel.hidden) input.focus({ preventScroll: true });
  };
  form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });

  // ---------- apertura e chiusura ----------
  const openPanel = () => {
    panel.hidden = false; root.classList.add('open'); fab.setAttribute('aria-expanded', 'true');
    if (!started) {
      started = true; setupVideo();
      add(L.greetText, 'bot');
      if (!endpoint) { const n = document.createElement('div'); n.className = 'asst-msg bot'; n.style.fontSize = '.78rem'; n.style.color = 'var(--muted)'; n.textContent = L.base; log.appendChild(n); }
      L.suggest.forEach((s) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = s; b.addEventListener('click', () => ask(s)); sugg.appendChild(b); });
    }
    playGreeting();
    setTimeout(() => input.focus({ preventScroll: true }), 60);
  };
  function close() {
    if (panel.hidden) return;
    panel.hidden = true; root.classList.remove('open'); fab.setAttribute('aria-expanded', 'false');
    if (video) video.pause();
    fab.focus({ preventScroll: true });
  }
  fab.addEventListener('click', openPanel);
  hello.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { e.stopPropagation(); close(); } });
  // il menu e la finestra dei dettagli hanno la precedenza
  document.addEventListener('click', (e) => { if (!panel.hidden && !root.contains(e.target) && e.target.closest('.menu-btn, [data-open]')) close(); });

  // piccolo invito, una sola volta per visita, dopo qualche secondo
  const seen = (() => { try { return sessionStorage.getItem('ld-asst-hello'); } catch (e) { return '1'; } })();
  if (!seen && !isCalm()) {
    setTimeout(() => {
      if (root.classList.contains('open')) return;
      hello.textContent = L.hi; hello.classList.add('on'); try { sessionStorage.setItem('ld-asst-hello', '1'); } catch (e) { /* niente */ }
      setTimeout(() => hello.classList.remove('on'), 7000);
    }, 9000);
  }
})();
