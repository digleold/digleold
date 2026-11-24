/* Avatar realistico dal vivo (HeyGen LiveAvatar). Si attiva solo se la pagina ha <meta name="ld-avatar-endpoint">.
   La chiave API sta sul server: qui arriva solo un token di sessione temporaneo. */
(function () {
  const meta = document.querySelector('meta[name="ld-avatar-endpoint"]');
  const endpoint = (meta && meta.content) || '';
  const A = window.LDAssist;
  if (!endpoint || !A) return;
  const EN = A.EN, media = A.media;
  const T = EN ? { start: 'Talk to the avatar', stop: 'End live conversation', connecting: 'Connecting…', mute: 'Mute microphone', unmute: 'Turn microphone on',
    ended: 'The live conversation has ended. You can keep writing here.', err: 'The live avatar is not available right now. You can keep writing here.', mic: 'Allow the microphone to talk, or just type your question.' }
    : { start: 'Parla con l\'avatar', stop: 'Termina la conversazione dal vivo', connecting: 'Connessione…', mute: 'Disattiva il microfono', unmute: 'Attiva il microfono',
    ended: 'La conversazione dal vivo è terminata. Puoi continuare a scrivere qui.', err: 'L\'avatar dal vivo non è disponibile ora. Puoi continuare a scrivere qui.', mic: 'Consenti il microfono per parlare, oppure scrivi la domanda.' };
  const src = (document.currentScript && document.currentScript.src) || '';
  const libUrl = src ? new URL('vendor/liveavatar.min.js', src).href : 'js/vendor/liveavatar.min.js';

  const ctl = document.querySelector('.asst-ctl');
  const stage = document.createElement('div'); stage.className = 'asst-live'; stage.hidden = true;
  stage.innerHTML = '<video playsinline autoplay aria-hidden="true"></video><div class="asst-live-st" role="status"></div>';
  media.appendChild(stage);
  const vid = stage.querySelector('video'), st = stage.querySelector('.asst-live-st');
  const mk = (cls, label, svg) => { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.setAttribute('aria-label', label); b.title = label; b.innerHTML = svg; return b; };
  const liveBtn = mk('live', T.start, '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>');
  const micBtn = mk('mic', T.mute, '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>'); micBtn.hidden = true;
  ctl.prepend(micBtn); ctl.prepend(liveBtn);
  liveBtn.classList.add('cta'); liveBtn.insertAdjacentHTML('beforeend', '<span>' + T.start + '</span>');

  let session = null, loading = null, muted = false, timer = 0;
  const load = () => loading || (loading = new Promise((ok, ko) => {
    if (window.LiveAvatar) return ok(window.LiveAvatar);
    const s = document.createElement('script'); s.src = libUrl; s.onload = () => ok(window.LiveAvatar); s.onerror = ko; document.head.appendChild(s);
  }));
  const setSt = (t) => { st.textContent = t || ''; st.hidden = !t; };
  const ui = (on) => {
    api.active = on; stage.hidden = !on; media.classList.toggle('is-live', on);
    liveBtn.classList.toggle('on', on); liveBtn.setAttribute('aria-label', on ? T.stop : T.start); liveBtn.title = liveBtn.getAttribute('aria-label');
    liveBtn.querySelector('span').textContent = on ? T.stop : T.start; micBtn.hidden = !on; A.snd.hidden = on || A.snd.hidden; A.rep.hidden = on;
    const v = A.getVideo(); if (v && on) v.pause();
  };
  const end = (msg) => {
    clearTimeout(timer);
    const s = session; session = null;
    if (s) { try { s.stop(); } catch (e) {} }
    try { vid.srcObject = null; } catch (e) {}
    if (api.active || msg) { ui(false); if (msg) A.add(msg, 'bot'); }
    setSt('');
  };
  const start = async () => {
    if (api.active || session) return;
    liveBtn.disabled = true; ui(true); setSt(T.connecting);
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lang: EN ? 'en' : 'it' }) });
      const d = await r.json();
      if (!r.ok || !d.sessionToken) throw new Error('token');
      const LA = await load();
      const s = new LA.LiveAvatarSession(d.sessionToken, { voiceChat: true, autoKeepAlive: true });
      session = s;
      s.on(LA.SessionEvent.SESSION_STREAM_READY, () => { s.attach(vid); setSt(''); vid.play().catch(() => {}); A.add(T.mic, 'bot', null, 'note'); });
      s.on(LA.SessionEvent.SESSION_DISCONNECTED, () => { if (session === s) end(T.ended); });
      s.on(LA.AgentEventsEnum.USER_TRANSCRIPTION, (e) => { if (e && e.text) A.add(e.text, 'me'); });
      s.on(LA.AgentEventsEnum.AVATAR_TRANSCRIPTION, (e) => { if (e && e.text) A.add(e.text, 'bot'); });
      await s.start();
      muted = false; micBtn.setAttribute('aria-label', T.mute); micBtn.classList.remove('off');
      if (d.maxSeconds) timer = setTimeout(() => end(T.ended), (d.maxSeconds + 2) * 1000);
    } catch (e) { end(T.err); }
    liveBtn.disabled = false;
  };
  liveBtn.addEventListener('click', () => (api.active ? end(T.ended) : start()));
  micBtn.addEventListener('click', async () => {
    if (!session) return;
    try { if (muted) await session.voiceChat.unmute(); else await session.voiceChat.mute(); muted = !muted; } catch (e) {}
    micBtn.classList.toggle('off', muted); const l = muted ? T.unmute : T.mute; micBtn.setAttribute('aria-label', l); micBtn.title = l;
  });
  const api = window.LDLive = { active: false, say: (t) => { if (session) { try { session.message(t); } catch (e) {} } }, stop: () => end('') };
  addEventListener('pagehide', () => end(''));
})();
