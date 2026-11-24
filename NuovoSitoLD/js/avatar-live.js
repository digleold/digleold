/* Avatar realistico dal vivo (HeyGen LiveAvatar) in sovraimpressione, senza riquadro: la persona e' ritagliata dallo sfondo
   direttamente nel browser (MediaPipe, ospitato nel sito). Attivo solo con <meta name="ld-avatar-endpoint">.
   La chiave API sta sul server: qui arriva solo un token di sessione temporaneo. */
(function () {
  const meta = document.querySelector('meta[name="ld-avatar-endpoint"]');
  const endpoint = (meta && meta.content) || '';
  const A = window.LDAssist;
  if (!endpoint || !A) return;
  const html = document.documentElement, EN = A.EN;
  const T = EN ? {
    name: 'Virtual assistant', hello: 'Hello! I\'m the virtual assistant of LD Technologies. Shall we talk?', talk: 'Talk to me', write: 'Write instead', close: 'Close',
    connecting: 'Connecting…', listen: 'I\'m listening. Ask me anything about our services.', mute: 'Mute microphone', unmute: 'Turn microphone on', stop: 'End conversation',
    ended: 'Conversation ended. Tap the microphone to talk again.', err: 'The live avatar is not available right now. You can write to me in the chat.', ai: 'AI virtual assistant, not a real person',
  } : {
    name: 'Assistente virtuale', hello: 'Ciao! Sono l\'assistente virtuale di LD Technologies. Vuoi parlare con me?', talk: 'Parla con me', write: 'Scrivi', close: 'Chiudi',
    connecting: 'Connessione…', listen: 'Ti ascolto. Chiedimi pure dei nostri servizi.', mute: 'Disattiva il microfono', unmute: 'Attiva il microfono', stop: 'Termina la conversazione',
    ended: 'Conversazione terminata. Tocca il microfono per parlare di nuovo.', err: 'L\'avatar dal vivo non è disponibile ora. Puoi scrivermi nella chat.', ai: 'Assistente virtuale basato su IA, non una persona reale',
  };
  const src = (document.currentScript && document.currentScript.src) || '';
  const base = (p) => (src ? new URL(p, src).href : 'js/' + p);
  const poster = (document.querySelector('meta[name="ld-avatar-poster"]') || {}).content || base('../img/avatar-claire.webp');

  const ic = {
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
    kbd: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  };
  const root = document.createElement('aside');
  root.className = 'ldav'; root.hidden = true; root.setAttribute('aria-label', T.name);
  root.innerHTML =
    '<div class="ldav-bub" role="status" aria-live="polite"><span class="t"></span><small>' + T.ai + '</small></div>' +
    '<button type="button" class="ldav-x" aria-label="' + T.close + '" title="' + T.close + '">' + ic.x + '</button>' +
    '<div class="ldav-fig"><img src="' + poster + '" alt="" width="540" height="960"><canvas hidden></canvas></div>' +
    '<div class="ldav-bar">' +
      '<button type="button" class="kbd" aria-label="' + T.write + '" title="' + T.write + '">' + ic.kbd + '</button>' +
      '<button type="button" class="talk" aria-label="' + T.talk + '" title="' + T.talk + '">' + ic.mic + '</button>' +
      '<button type="button" class="end" aria-label="' + T.stop + '" title="' + T.stop + '" hidden>' + ic.stop + '</button>' +
    '</div>';
  const vid = document.createElement('video'); vid.className = 'ldav-src'; vid.playsInline = true; vid.autoplay = true; vid.setAttribute('aria-hidden', 'true');
  document.body.append(root, vid);
  const $ = (s) => root.querySelector(s);
  const bub = $('.ldav-bub .t'), bubBox = $('.ldav-bub'), img = $('.ldav-fig img'), cv = $('canvas'), talk = $('.talk'), end = $('.end'), kbd = $('.kbd');
  const say = (t) => { bub.textContent = t; bubBox.hidden = !t; bubBox.classList.remove('flash'); void bubBox.offsetWidth; bubBox.classList.add('flash'); };

  let session = null, loading = null, muted = false, timer = 0, ss = null, ssTried = false, cutting = false, busy = false, hideT = 0;

  // ---------- ritaglio della persona (sfondo trasparente) ----------
  const loadScript = (u) => new Promise((ok, ko) => { const s = document.createElement('script'); s.src = u; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
  const initCut = async () => {
    if (ss || ssTried) return ss; ssTried = true;
    try {
      await loadScript(base('vendor/mediapipe/selfie_segmentation.js'));
      const seg = new window.SelfieSegmentation({ locateFile: (f) => base('vendor/mediapipe/' + f) });
      seg.setOptions({ modelSelection: 0 });
      const x = cv.getContext('2d');
      seg.onResults((r) => {
        const w = r.image.videoWidth || r.image.width, h = r.image.videoHeight || r.image.height;
        if (!w) return;
        const k = Math.min(1, 960 / h), cw = Math.round(w * k), ch = Math.round(h * k);
        if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
        x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, cw, ch);
        x.filter = 'blur(1px)'; x.drawImage(r.segmentationMask, 0, 0, cw, ch); x.filter = 'none';
        x.globalCompositeOperation = 'source-in'; x.drawImage(r.image, 0, 0, cw, ch);
        x.globalCompositeOperation = 'source-over';
        if (cv.hidden) { cv.hidden = false; img.hidden = true; }
      });
      await seg.initialize();
      ss = seg;
    } catch (e) { ss = null; }
    return ss;
  };
  const loop = async () => {
    if (!cutting) return;
    if (ss && !busy && vid.readyState >= 2 && vid.videoWidth) { busy = true; try { await ss.send({ image: vid }); } catch (e) {} busy = false; }
    if (vid.requestVideoFrameCallback) vid.requestVideoFrameCallback(loop); else requestAnimationFrame(loop);
  };
  const showVideo = async () => {
    const seg = await initCut();
    if (seg) { cutting = true; loop(); }
    else { root.classList.add('raw'); vid.className = 'ldav-raw'; $('.ldav-fig').appendChild(vid); img.hidden = true; }
  };

  // ---------- sessione dal vivo ----------
  const loadSdk = () => loading || (loading = window.LiveAvatar ? Promise.resolve(window.LiveAvatar)
    : loadScript(base('vendor/liveavatar.min.js')).then(() => window.LiveAvatar));
  const ui = (live) => {
    api.active = live; root.classList.toggle('live', live);
    talk.hidden = live; end.hidden = !live; talk.disabled = false;
  };
  const finish = (msg) => {
    clearTimeout(timer); cutting = false;
    const s = session; session = null;
    if (s) { try { s.stop(); } catch (e) {} }
    try { vid.srcObject = null; } catch (e) {}
    if (vid.parentNode !== document.body) { vid.className = 'ldav-src'; document.body.appendChild(vid); root.classList.remove('raw'); }
    cv.hidden = true; img.hidden = false; ui(false);
    if (msg) say(msg);
  };
  const start = async () => {
    if (api.active || session) return;
    talk.disabled = true; ui(true); say(T.connecting); root.classList.add('wait');
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lang: EN ? 'en' : 'it' }) });
      const d = await r.json();
      if (!r.ok || !d.sessionToken) throw new Error('token');
      const [LA] = await Promise.all([loadSdk(), initCut()]);
      const s = new LA.LiveAvatarSession(d.sessionToken, { voiceChat: true, autoKeepAlive: true });
      session = s;
      s.on(LA.SessionEvent.SESSION_STREAM_READY, async () => {
        s.attach(vid); vid.play().catch(() => {}); root.classList.remove('wait'); say(T.listen); await showVideo();
      });
      s.on(LA.SessionEvent.SESSION_DISCONNECTED, () => { if (session === s) finish(T.ended); });
      s.on(LA.AgentEventsEnum.USER_TRANSCRIPTION, (e) => { if (e && e.text) A.add(e.text, 'me'); });
      s.on(LA.AgentEventsEnum.AVATAR_TRANSCRIPTION, (e) => { if (e && e.text) { say(e.text); A.add(e.text, 'bot'); clearTimeout(hideT); hideT = setTimeout(() => { if (api.active) say(''); }, 9000); } });
      await s.start();
      muted = false; talk.classList.remove('off');
      if (d.maxSeconds) timer = setTimeout(() => finish(T.ended), (d.maxSeconds + 2) * 1000);
    } catch (e) { root.classList.remove('wait'); finish(T.err); }
  };
  const mute = async () => {
    if (!session) return;
    try { if (muted) await session.voiceChat.unmute(); else await session.voiceChat.mute(); muted = !muted; } catch (e) {}
    end.classList.toggle('muted', muted);
  };
  const show = () => { root.hidden = false; requestAnimationFrame(() => root.classList.add('in')); html.classList.add('ld-av-on'); say(T.hello); };
  const hide = () => { root.classList.remove('in'); finish(''); root.hidden = true; html.classList.remove('ld-av-on'); };

  talk.addEventListener('click', start);
  end.addEventListener('click', () => finish(T.ended));
  $('.ldav-x').addEventListener('click', () => { try { sessionStorage.setItem('ld-av-closed', '1'); } catch (e) {} hide(); });
  kbd.addEventListener('click', () => { hide(); const f = document.querySelector('.asst-fab'); if (f) f.click(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !root.hidden) { try { sessionStorage.setItem('ld-av-closed', '1'); } catch (x) {} hide(); } });
  const api = window.LDLive = { active: false, say: (t) => { if (session) { try { session.message(t); } catch (e) {} } }, stop: () => finish(''), mute };
  addEventListener('pagehide', () => finish(''));

  // compare da sola poco dopo l'apertura del sito (una volta per sessione di navigazione)
  let closed = false; try { closed = sessionStorage.getItem('ld-av-closed') === '1'; } catch (e) {}
  if (!closed) {
    const go = () => setTimeout(() => { const p = document.querySelector('.asst-panel'); if (root.hidden && (!p || p.hidden)) show(); }, 3500);
    if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
  }
})();
