// Fondale 3D (Three.js r128): braccio robotico + rete di nodi, guidati dallo scroll e dal mouse.
(() => {
  const canvas = document.getElementById('scene');
  if (!canvas) return;

  // Niente 3D su connessioni lente, risparmio dati o dispositivi poco potenti: il sito resta completo.
  const conn = navigator.connection || {};
  const lowEnd = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '') ||
    (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
  if (lowEnd) { document.body.classList.add('no-3d'); return; }

  // Three.js (circa 600 KB) si scarica solo dopo il caricamento della pagina, nei tempi morti del browser.
  const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  const boot = () => {
    if (window.THREE) { init(window.THREE); return; }
    const s = document.createElement('script');
    s.src = THREE_URL; s.async = true;
    s.onload = () => init(window.THREE);
    s.onerror = () => document.body.classList.add('no-3d');
    document.head.appendChild(s);
  };
  const later = () => (window.requestIdleCallback ? window.requestIdleCallback(boot, { timeout: 2500 }) : setTimeout(boot, 800));
  if (document.readyState === 'complete') later(); else window.addEventListener('load', later, { once: true });

  function init(T) {
  if (!T) { document.body.classList.add('no-3d'); return; }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { document.body.classList.add('no-3d'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.5 : 1.75));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new T.Scene();
  scene.fog = new T.FogExp2(0x05070d, 0.035);
  const camera = new T.PerspectiveCamera(40, 1, 0.1, 120);

  // Luci
  scene.add(new T.AmbientLight(0x7080b0, 0.6));
  const sun = new T.DirectionalLight(0xffffff, 1.2); sun.position.set(4, 9, 6); scene.add(sun);
  const mintLight = new T.PointLight(0x34e1a2, 2.6, 26); mintLight.position.set(-5, 3, 4); scene.add(mintLight);
  const yellowLight = new T.PointLight(0xf7c600, 2.4, 26); yellowLight.position.set(6, 4, -2); scene.add(yellowLight);

  // Materiali
  const white = new T.MeshStandardMaterial({ color: 0xe9edf7, metalness: 0.55, roughness: 0.26 });
  const dark = new T.MeshStandardMaterial({ color: 0x1a2135, metalness: 0.75, roughness: 0.32 });
  const glowY = new T.MeshStandardMaterial({ color: 0xf7c600, emissive: 0xf7c600, emissiveIntensity: 0.85, metalness: 0.2, roughness: 0.3 });
  const glowM = new T.MeshStandardMaterial({ color: 0x34e1a2, emissive: 0x34e1a2, emissiveIntensity: 1.1, metalness: 0.1, roughness: 0.3 });

  // ---------- Braccio robotico ----------
  const arm = new T.Group(); scene.add(arm);
  const mesh = (geo, mat, parent, x = 0, y = 0, z = 0) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };

  mesh(new T.CylinderGeometry(1.25, 1.4, 0.32, 48), dark, arm, 0, 0.16, 0);
  mesh(new T.TorusGeometry(1.18, 0.03, 8, 64), glowY, arm, 0, 0.34, 0).rotation.x = Math.PI / 2;
  const turret = new T.Group(); turret.position.y = 0.32; arm.add(turret);
  mesh(new T.CylinderGeometry(0.62, 0.7, 0.55, 40), white, turret, 0, 0.28, 0);
  const shoulder = new T.Group(); shoulder.position.y = 0.7; turret.add(shoulder);
  const shJoint = mesh(new T.CylinderGeometry(0.42, 0.42, 1.0, 32), dark, shoulder); shJoint.rotation.x = Math.PI / 2;
  mesh(new T.CylinderGeometry(0.2, 0.2, 1.06, 24), glowY, shoulder).rotation.x = Math.PI / 2;
  mesh(new T.CylinderGeometry(0.27, 0.34, 2.3, 32), white, shoulder, 0, 1.15, 0);
  const elbow = new T.Group(); elbow.position.y = 2.3; shoulder.add(elbow);
  mesh(new T.CylinderGeometry(0.36, 0.36, 0.86, 32), dark, elbow).rotation.x = Math.PI / 2;
  mesh(new T.CylinderGeometry(0.17, 0.17, 0.92, 24), glowY, elbow).rotation.x = Math.PI / 2;
  mesh(new T.CylinderGeometry(0.2, 0.26, 2.0, 32), white, elbow, 0, 1.0, 0);
  const wrist = new T.Group(); wrist.position.y = 2.0; elbow.add(wrist);
  mesh(new T.SphereGeometry(0.27, 24, 16), dark, wrist);
  mesh(new T.CylinderGeometry(0.17, 0.17, 0.34, 24), white, wrist, 0, 0.26, 0);
  mesh(new T.CylinderGeometry(0.24, 0.24, 0.12, 24), dark, wrist, 0, 0.48, 0);
  const fingerGeo = new T.BoxGeometry(0.09, 0.5, 0.14);
  const fL = mesh(fingerGeo, glowY, wrist, -0.17, 0.8, 0), fR = mesh(fingerGeo, glowY, wrist, 0.17, 0.8, 0);
  // "Dato" trasportato: cubo luminoso con bordi
  const payload = new T.Group(); payload.position.y = 0.86; wrist.add(payload);
  mesh(new T.BoxGeometry(0.2, 0.2, 0.2), glowM, payload);
  payload.add(new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(0.3, 0.3, 0.3)), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })));

  // Anelli e cubi orbitanti attorno al braccio
  const ringA = mesh(new T.TorusGeometry(2.3, 0.012, 8, 160), new T.MeshBasicMaterial({ color: 0x34e1a2, transparent: true, opacity: 0.65 }), arm, 0, 0.06, 0);
  ringA.rotation.x = Math.PI / 2;
  const ringB = mesh(new T.TorusGeometry(3.1, 0.01, 8, 160), new T.MeshBasicMaterial({ color: 0xf7c600, transparent: true, opacity: 0.4 }), arm, 0, 0.06, 0);
  ringB.rotation.x = Math.PI / 2;
  const orbit = new T.Group(); arm.add(orbit);
  const edge = new T.EdgesGeometry(new T.BoxGeometry(0.34, 0.34, 0.34));
  const orbiters = [];
  for (let i = 0; i < 7; i++) {
    const o = new T.LineSegments(edge, new T.LineBasicMaterial({ color: i % 3 === 0 ? 0xf7c600 : 0x34e1a2, transparent: true, opacity: 0.85 }));
    o.userData = { a: (i / 7) * Math.PI * 2, r: 2.7 + (i % 2) * 0.45, h: 0.9 + (i % 4) * 0.7, s: 0.25 + (i % 3) * 0.08 };
    orbit.add(o); orbiters.push(o);
  }

  const armMats = [white, dark, glowY, glowM, ringA.material, ringB.material, ...orbiters.map((o) => o.material)];
  armMats.forEach((m) => { m.userData.base = m.opacity; m.transparent = true; });

  // Pavimento a griglia
  const grid = new T.GridHelper(60, 60, 0x34e1a2, 0x34e1a2);
  grid.material.transparent = true; grid.material.opacity = 0.1; grid.position.y = -0.01; scene.add(grid);

  // ---------- Rete di nodi ----------
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.65)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new T.CanvasTexture(c);
  })();
  const net = new T.Group(); scene.add(net);
  const N = window.innerWidth < 760 ? 70 : 130;
  const base = new Float32Array(N * 3), pos = new Float32Array(N * 3), col = new Float32Array(N * 3), ph = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = 1.2 + Math.random() * 2.2, th = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
    base[i * 3] = r * Math.sin(p) * Math.cos(th); base[i * 3 + 1] = r * Math.cos(p); base[i * 3 + 2] = r * Math.sin(p) * Math.sin(th);
    const y = Math.random() < 0.16;
    col[i * 3] = y ? 0.97 : 0.2; col[i * 3 + 1] = y ? 0.78 : 0.88; col[i * 3 + 2] = y ? 0 : 0.64;
    ph[i] = Math.random() * 6.28;
  }
  const ptsGeo = new T.BufferGeometry();
  ptsGeo.setAttribute('position', new T.BufferAttribute(pos, 3));
  ptsGeo.setAttribute('color', new T.BufferAttribute(col, 3));
  const ptsMat = new T.PointsMaterial({ size: 0.2, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
  net.add(new T.Points(ptsGeo, ptsMat));
  const MAXL = 420, linePos = new Float32Array(MAXL * 6);
  const lineGeo = new T.BufferGeometry(); lineGeo.setAttribute('position', new T.BufferAttribute(linePos, 3));
  const lineMat = new T.LineBasicMaterial({ color: 0x34e1a2, transparent: true, opacity: 0.45, blending: T.AdditiveBlending, depthWrite: false });
  net.add(new T.LineSegments(lineGeo, lineMat));

  // ---------- Coreografia legata allo scroll ----------
  // ang/y/dist: orbita della camera; tx/ty: punto osservato; arm*: posizione e scala del braccio; net*: rete di nodi
  const K = [
    { ang: 0.22, y: 3.2, dist: 11.5, tx: 1.0, ty: 2.1, armO: 1, armX: 3.4, armS: 0.72, armRY: -0.5, netX: -3.8, netY: 2.4, netS: 0.9, netO: 0.35 },   // 0 hero
    { ang: -0.35, y: 3.4, dist: 12, tx: 0.6, ty: 1.9, armO: 0.38, armX: 4.2, armS: 0.62, armRY: 0.4, netX: -3.6, netY: 2.0, netS: 1.0, netO: 0.5 },       // 1 chi siamo
    { ang: -0.75, y: 2.8, dist: 10.5, tx: 0.2, ty: 1.9, armO: 0.5, armX: 8.8, armS: 0.6, armRY: 1.2, netX: 2.8, netY: 2.0, netS: 1.45, netO: 1.0 },     // 2 servizi IT
    { ang: 0.4, y: 2.8, dist: 10, tx: 0.2, ty: 2.1, armO: 1, armX: 2.9, armS: 0.95, armRY: -0.9, netX: -9, netY: 2.0, netS: 0.8, netO: 0.1 },         // 3 robotica
    { ang: 0.0, y: 4.2, dist: 13, tx: 0, ty: 1.6, armO: 0.4, armX: 5.4, armS: 0.6, armRY: 0.2, netX: -5.0, netY: 2.0, netS: 0.9, netO: 0.45 },          // 4 metodo
    { ang: 0.55, y: 3.6, dist: 13, tx: 0, ty: 1.6, armO: 0.4, armX: -5.2, armS: 0.6, armRY: 0.8, netX: 5.2, netY: 2.2, netS: 0.9, netO: 0.35 },         // 5 partner e progetti
    { ang: 0.0, y: 3.4, dist: 12, tx: 0.4, ty: 1.9, armO: 0.55, armX: 4.0, armS: 0.8, armRY: -0.3, netX: -4.0, netY: 2.2, netS: 1.0, netO: 0.6 },        // 6 contatti
    { ang: -0.25, y: 3.0, dist: 11.5, tx: 0.4, ty: 2.0, armO: 0.5, armX: 5.6, armS: 0.7, armRY: 0.6, netX: -9, netY: 2.0, netS: 0.8, netO: 0.1 },       // 7 vantaggi cobot
    { ang: 0.3, y: 3.4, dist: 12.5, tx: 0, ty: 1.8, armO: 0.45, armX: 7.0, armS: 0.55, armRY: -0.6, netX: -9, netY: 2.0, netS: 0.8, netO: 0.1 },         // 8 tecnologie
  ];
  const keyed = [...document.querySelectorAll('[data-key]')].map((el) => ({ el, k: Number(el.dataset.key) }));
  const cur = { ...K[0] };
  const smooth = (f) => f * f * (3 - 2 * f);

  const targetKey = () => {
    if (!keyed.length) return K[0];
    const mid = window.innerHeight * 0.5;
    const cs = keyed.map(({ el, k }) => { const r = el.getBoundingClientRect(); return { c: r.top + r.height / 2, k }; });
    if (mid <= cs[0].c) return K[cs[0].k];
    for (let i = 0; i < cs.length - 1; i++) {
      if (mid < cs[i + 1].c) {
        const f = smooth((mid - cs[i].c) / (cs[i + 1].c - cs[i].c)), a = K[cs[i].k], b = K[cs[i + 1].k], o = {};
        for (const key in a) o[key] = a[key] + (b[key] - a[key]) * f;
        return o;
      }
    }
    return K[cs[cs.length - 1].k];
  };

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  window.addEventListener('pointermove', (e) => { mouse.x = (e.clientX / window.innerWidth) * 2 - 1; mouse.y = (e.clientY / window.innerHeight) * 2 - 1; }, { passive: true });

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', () => { resize(); if (reduce) requestAnimationFrame(frame); });
  resize();

  const t0 = performance.now() / 1000; let last = t0;
  const ease = (x) => 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2); // easeOutBack
  let raf = 0;

  function frame() {
    // Con la finestra di dettaglio aperta la scena e' coperta: non serve ridisegnarla.
    if (!reduce && document.documentElement.classList.contains('dlg-open')) { raf = requestAnimationFrame(frame); return; }
    const nowS = performance.now() / 1000, dt = Math.min(0.25, nowS - last); last = nowS;
    const t = reduce ? 3 : nowS - t0;
    const k = reduce ? 1 : 1 - Math.exp(-dt * 4.5);
    const intro = reduce ? 1 : ease(Math.min(1, t / 2.0));
    const narrow = camera.aspect < 0.85;
    const tk = targetKey();
    for (const key in cur) cur[key] += (tk[key] - cur[key]) * k;
    mouse.sx += (mouse.x - mouse.sx) * k; mouse.sy += (mouse.y - mouse.sy) * k;

    const d = cur.dist * (narrow ? 1.15 : 1);
    camera.position.set(cur.tx + Math.sin(cur.ang) * d + mouse.sx * 0.5, cur.y * (narrow ? 1.1 : 1) - mouse.sy * 0.3, Math.cos(cur.ang) * d);
    camera.lookAt(cur.tx * (narrow ? 0.3 : 1), cur.ty + (narrow ? 2.1 : 0), 0);

    for (const m of armMats) m.opacity = m.userData.base * cur.armO;
    arm.position.set(cur.armX * (narrow ? 0.15 : 1), 0, 0);
    arm.scale.setScalar(Math.max(0.001, cur.armS * intro * (narrow ? 0.8 : 1)));
    arm.rotation.y = cur.armRY + t * 0.05;
    turret.rotation.y = Math.sin(t * 0.45) * 0.7 + mouse.sx * 0.6;
    shoulder.rotation.z = 0.28 + Math.sin(t * 0.7) * 0.22 + mouse.sy * 0.25;
    elbow.rotation.z = -0.95 + Math.sin(t * 0.9 + 1.0) * 0.32 - mouse.sy * 0.2;
    wrist.rotation.z = 0.55 + Math.sin(t * 1.3) * 0.3;
    const open = 0.17 + (Math.sin(t * 1.8) * 0.5 + 0.5) * 0.1;
    fL.position.x = -open; fR.position.x = open;
    payload.rotation.y = t * 1.2; payload.rotation.x = t * 0.7;
    ringA.rotation.z = t * 0.2; ringB.rotation.z = -t * 0.14;
    orbit.rotation.y = t * 0.18;
    for (const o of orbiters) {
      const u = o.userData, a = u.a + t * u.s;
      o.position.set(Math.cos(a) * u.r, u.h + Math.sin(t * 0.8 + u.a) * 0.18, Math.sin(a) * u.r);
      o.rotation.set(t * 0.6 + u.a, t * 0.5, 0);
    }

    net.position.set(cur.netX * (narrow ? 0.3 : 1), cur.netY + (narrow ? 1 : 0), -1);
    net.scale.setScalar(Math.max(0.001, cur.netS * (narrow ? 0.8 : 1)));
    net.rotation.y = t * 0.09; net.rotation.x = Math.sin(t * 0.15) * 0.15;
    ptsMat.opacity = Math.min(1, cur.netO * 1.2); lineMat.opacity = cur.netO * 0.55;
    for (let i = 0; i < N; i++) {
      const j = i * 3, w = Math.sin(t * 0.6 + ph[i]) * 0.22;
      pos[j] = base[j] * (1 + w * 0.15); pos[j + 1] = base[j + 1] + w; pos[j + 2] = base[j + 2] * (1 + w * 0.15);
    }
    ptsGeo.attributes.position.needsUpdate = true;
    let n = 0; const th2 = 1.5 * 1.5;
    for (let i = 0; i < N && n < MAXL; i++) {
      for (let k = i + 1; k < N && n < MAXL; k++) {
        const dx = pos[i * 3] - pos[k * 3], dy = pos[i * 3 + 1] - pos[k * 3 + 1], dz = pos[i * 3 + 2] - pos[k * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < th2) {
          linePos.set([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2]], n * 6); n++;
        }
      }
    }
    lineGeo.setDrawRange(0, n * 2); lineGeo.attributes.position.needsUpdate = true;

    mintLight.position.x = -5 + Math.sin(t * 0.4) * 2; yellowLight.position.z = -2 + Math.cos(t * 0.3) * 3;
    renderer.render(scene, camera);
    if (!reduce && !document.hidden) raf = requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => { if (!document.hidden && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); } });
  if (reduce) { window.addEventListener('scroll', () => requestAnimationFrame(frame), { passive: true }); }
  document.body.classList.add('has-3d');
  frame();
  }
})();
