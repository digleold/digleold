// Cella robotica 3D (Three.js r128): braccio bianco e grafite che prende casse da un nastro e le impila su un pallet.
// Cinematica inversa a due bracci con polso sempre verticale. Parte solo quando il riquadro e' vicino allo schermo.
(() => {
  const host = document.getElementById('robot');
  if (!host) return;
  const canvas = host.querySelector('canvas');
  const conn = navigator.connection || {};
  const lowEnd = conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '') ||
    (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
  if (lowEnd) return; // resta la foto
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isCalm = () => motionQuery.matches || document.documentElement.dataset.motion === 'calm';

  const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  const idle = (fn) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 400));
  const boot = () => {
    if (window.THREE) { init(window.THREE); return; }
    const s = document.createElement('script'); s.src = THREE_URL; s.async = true;
    s.onload = () => init(window.THREE); document.head.appendChild(s);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); idle(boot); } }, { rootMargin: '700px 0px' });
    io.observe(host);
  } else idle(boot);

  function init(T) {
    if (!T) return;
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return; }
    const narrowScreen = window.innerWidth < 760;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrowScreen ? 1.6 : 2));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.setClearColor(0xf4f4f4, 0);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 100);
    scene.add(new T.HemisphereLight(0xffffff, 0xc9c9d0, 0.95));
    const sun = new T.DirectionalLight(0xffffff, 0.95); sun.position.set(5, 10, 6); sun.castShadow = true;
    const sc = sun.shadow.camera; sc.left = -8; sc.right = 8; sc.top = 8; sc.bottom = -8; sc.near = 1; sc.far = 30;
    sun.shadow.mapSize.set(narrowScreen ? 1024 : 2048, narrowScreen ? 1024 : 2048); sun.shadow.bias = -0.0004; sun.shadow.radius = 5;
    scene.add(sun);
    const floor = new T.Mesh(new T.PlaneGeometry(60, 60), new T.ShadowMaterial({ opacity: 0.16 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

    const white = new T.MeshStandardMaterial({ color: 0xffffff, metalness: 0.04, roughness: 0.4 });
    const graphite = new T.MeshStandardMaterial({ color: 0x16161a, metalness: 0.3, roughness: 0.5 });
    const mint = new T.MeshStandardMaterial({ color: 0x34e1a2, emissive: 0x1ea876, emissiveIntensity: 0.3, roughness: 0.4 });
    const pallet = new T.MeshStandardMaterial({ color: 0xd3d3d9, roughness: 0.8 });
    const crateMat = new T.MeshStandardMaterial({ color: 0x1b1b20, roughness: 0.55, metalness: 0.1 });

    const root = new T.Group(); scene.add(root);
    const arm = new T.Group(); root.add(arm);
    const mesh = (geo, mat, parent, x = 0, y = 0, z = 0) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
    mesh(new T.CylinderGeometry(1.25, 1.4, 0.32, 56), graphite, arm, 0, 0.16, 0);
    mesh(new T.TorusGeometry(1.1, 0.025, 8, 80), mint, arm, 0, 0.34, 0).rotation.x = Math.PI / 2;
    const turret = new T.Group(); turret.position.y = 0.32; arm.add(turret);
    mesh(new T.CylinderGeometry(0.62, 0.7, 0.55, 48), white, turret, 0, 0.28, 0);
    const shoulder = new T.Group(); shoulder.position.y = 0.7; turret.add(shoulder);
    mesh(new T.CylinderGeometry(0.42, 0.42, 1.0, 36), graphite, shoulder).rotation.x = Math.PI / 2;
    mesh(new T.CylinderGeometry(0.17, 0.17, 1.06, 24), mint, shoulder).rotation.x = Math.PI / 2;
    mesh(new T.CylinderGeometry(0.27, 0.34, 2.3, 36), white, shoulder, 0, 1.15, 0);
    const elbow = new T.Group(); elbow.position.y = 2.3; shoulder.add(elbow);
    mesh(new T.CylinderGeometry(0.36, 0.36, 0.86, 36), graphite, elbow).rotation.x = Math.PI / 2;
    mesh(new T.CylinderGeometry(0.15, 0.15, 0.92, 24), mint, elbow).rotation.x = Math.PI / 2;
    mesh(new T.CylinderGeometry(0.2, 0.26, 2.0, 36), white, elbow, 0, 1.0, 0);
    const wrist = new T.Group(); wrist.position.y = 2.0; elbow.add(wrist);
    mesh(new T.SphereGeometry(0.27, 28, 18), graphite, wrist);
    mesh(new T.CylinderGeometry(0.17, 0.17, 0.34, 28), white, wrist, 0, 0.26, 0);
    mesh(new T.CylinderGeometry(0.24, 0.24, 0.12, 28), graphite, wrist, 0, 0.48, 0);
    const fingerGeo = new T.BoxGeometry(0.09, 0.5, 0.14);
    const fL = mesh(fingerGeo, graphite, wrist, -0.3, 0.8, 0), fR = mesh(fingerGeo, graphite, wrist, 0.3, 0.8, 0);

    // ---- cella: nastro, pallet, casse ----
    const cell = new T.Group(); root.add(cell);
    const PICK = { x: 2.9, z: 1.2 }, PLACE = { x: 0.6, z: -2.6 }, BELT_Y = 0.3;
    mesh(new T.BoxGeometry(1.0, BELT_Y, 6.6), graphite, cell, PICK.x, BELT_Y / 2, -0.2);
    [-0.55, 0.55].forEach((s) => mesh(new T.BoxGeometry(0.06, 0.12, 6.6), white, cell, PICK.x + s, BELT_Y + 0.02, -0.2));
    const stripeMat = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 });
    const stripes = [];
    for (let i = 0; i < 12; i++) { const s = new T.Mesh(new T.BoxGeometry(0.84, 0.012, 0.07), stripeMat); s.position.set(PICK.x, BELT_Y + 0.008, 0); cell.add(s); stripes.push(s); }
    mesh(new T.BoxGeometry(1.7, 0.1, 1.7), pallet, cell, PLACE.x, 0.09, PLACE.z);
    [-0.65, 0, 0.65].forEach((o) => mesh(new T.BoxGeometry(1.7, 0.08, 0.28), pallet, cell, PLACE.x, 0.04, PLACE.z + o));
    const crateGeo = new T.BoxGeometry(0.5, 0.5, 0.5);
    const makeCrate = () => { const m = new T.Mesh(crateGeo, crateMat); m.castShadow = true; m.receiveShadow = true; const g = new T.Group(); g.add(m); return g; };
    const slots = [];
    for (const layer of [0, 1]) for (const sx of [-0.4, 0.4]) for (const sz of [-0.4, 0.4]) slots.push({ x: PLACE.x + sx, y: 0.14 + 0.25 + layer * 0.5, z: PLACE.z + sz });

    // ---- cinematica inversa piana a due bracci (gomito in alto) + rotazione della torretta; polso verticale ----
    const L1 = 2.3, L2 = 2.0, HS = 1.02, TCP = 0.85;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const nearest = (a, ref) => a + Math.round((ref - a) / (Math.PI * 2)) * Math.PI * 2;
    function solveIK(tx, ty, tz) {
      const pu = Math.hypot(tx, tz), py = ty + TCP - HS;
      const d = clamp(Math.hypot(pu, py), Math.abs(L1 - L2) + 0.001, L1 + L2 - 0.001);
      const alpha = Math.atan2(pu, py), beta = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
      const th1 = alpha - beta, ang2 = Math.atan2(pu - L1 * Math.sin(th1), py - L1 * Math.cos(th1));
      return { yaw: Math.atan2(tz, -tx), th1, th2: ang2 - th1, th3: Math.PI - ang2 };
    }
    const CYC = 9;
    const keyframes = (S) => {
      const H = [1.0, 3.2, 0.5], PH = [PICK.x, 2.1, PICK.z], PD = [PICK.x, BELT_Y + 0.28, PICK.z], LH = [S.x, S.y + 1.8, S.z], LD = [S.x, S.y + 0.03, S.z];
      return [[0, H, 0.46], [1.6, PH, 0.46], [2.5, PD, 0.46], [3.0, PD, 0.3], [3.9, PH, 0.3], [5.5, LH, 0.3], [6.4, LD, 0.3], [6.9, LD, 0.46], [7.6, LH, 0.46], [9.0, H, 0.46]];
    };
    const sstep = (a, b, x) => { const f = clamp((x - a) / (b - a), 0, 1); return f * f * (3 - 2 * f); };
    let wt = 0, lastCycle = -1, crate = null, grabbed = false, released = false, slot = slots[0], yawIK = 0, beltV = 0, beltPhase = 0;
    const placed = [], idQ = new T.Quaternion();
    function workStep(dt, still) {
      wt = still ? 4.2 : wt + dt;
      const cyc = Math.floor(wt / CYC), c = wt % CYC;
      if (cyc !== lastCycle) {
        lastCycle = cyc;
        if (placed.length >= slots.length) { placed.forEach((p) => p.parent && p.parent.remove(p)); placed.length = 0; }
        if (crate && !released) crate.parent.remove(crate);
        slot = slots[placed.length]; crate = makeCrate(); crate.position.set(PICK.x, BELT_Y + 0.25, -3.2); cell.add(crate); grabbed = released = false;
      }
      const kf = keyframes(slot);
      let i = 0; while (i < kf.length - 2 && c > kf[i + 1][0]) i++;
      const a = kf[i], b = kf[i + 1], f = sstep(a[0], b[0], c);
      const tip = [0, 1, 2].map((k) => a[1][k] + (b[1][k] - a[1][k]) * f), open = a[2] + (b[2] - a[2]) * f;
      const damp = still ? 1 : 1 - Math.exp(-dt * 12);
      if (!grabbed) crate.position.z = -3.2 + (PICK.z + 3.2) * sstep(0, 1.2, c);
      if (!grabbed && c >= 3.0) { grabbed = true; wrist.attach(crate); }
      if (grabbed && !released) { crate.position.lerp(new T.Vector3(0, 0.85, 0), damp); crate.quaternion.slerp(idQ, damp); }
      if (grabbed && !released && c >= 6.9) { released = true; cell.attach(crate); crate.userData.target = new T.Vector3(slot.x, slot.y, slot.z); placed.push(crate); }
      placed.forEach((p) => { p.position.lerp(p.userData.target, damp); p.quaternion.slerp(idQ, damp); });
      beltV += ((c < 1.3 ? 1 : 0) - beltV) * (still ? 1 : 1 - Math.exp(-dt * 6));
      beltPhase += beltV * dt * 2.2;
      stripes.forEach((s, k) => { s.position.z = (((k / stripes.length) * 6.6 + beltPhase) % 6.6) - 3.5; });
      return { ik: solveIK(tip[0], tip[1], tip[2]), open };
    }

    // ---- camera, ridimensionamento, ciclo di disegno ----
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    host.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1; mouse.y = ((e.clientY - r.top) / r.height) * 2 - 1; }, { passive: true });
    host.addEventListener('pointerleave', () => { mouse.x = 0; mouse.y = 0; });
    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    new ResizeObserver(() => { resize(); if (isCalm()) frame(); }).observe(host);
    resize();

    let last = performance.now() / 1000, raf = 0, running = false, shown = false, yawOut = 0;
    const intro = { v: 0 };
    function frame() {
      const now = performance.now() / 1000, dt = Math.min(0.1, now - last); last = now;
      const calm = isCalm();
      const k = 1 - Math.exp(-dt * 5);
      mouse.sx += (mouse.x - mouse.sx) * k; mouse.sy += (mouse.y - mouse.sy) * k;
      intro.v = calm ? 1 : Math.min(1, intro.v + dt / 1.4);
      const e = 1 - Math.pow(1 - intro.v, 3);

      const r = workStep(dt, calm);
      yawIK = nearest(r.ik.yaw, yawIK);
      turret.rotation.y = yawIK; shoulder.rotation.z = r.ik.th1; elbow.rotation.z = r.ik.th2; wrist.rotation.z = r.ik.th3;
      fL.position.x = -(r.open + 0.13); fR.position.x = r.open + 0.13;

      const aspect = camera.aspect, dist = 12.6 * clamp(1.75 / aspect, 0.92, 1.7);
      const ang = 0.5 + mouse.sx * 0.28, elev = 4.6 - mouse.sy * 1.2;
      const target = new T.Vector3(1.2, 1.35 + (aspect < 1 ? 0.5 : 0), -0.5);
      camera.position.set(target.x + Math.sin(ang) * dist, target.y + elev, target.z + Math.cos(ang) * dist);
      camera.lookAt(target);
      root.scale.setScalar(0.9 + 0.1 * e); root.position.y = -0.4 * (1 - e);
      renderer.render(scene, camera);
      if (!shown) { shown = true; host.classList.add('live'); }
      if (running && !calm && !document.hidden) raf = requestAnimationFrame(frame);
    }
    const startLoop = () => { if (running) return; running = true; cancelAnimationFrame(raf); last = performance.now() / 1000; raf = requestAnimationFrame(frame); };
    const stopLoop = () => { running = false; cancelAnimationFrame(raf); };
    new IntersectionObserver((en) => { if (en[0].isIntersecting) { if (isCalm()) frame(); else startLoop(); } else stopLoop(); }, { rootMargin: '100px 0px' }).observe(host);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && running) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); } });
    window.addEventListener('ldmotion', () => { if (isCalm()) { stopLoop(); frame(); } else { startLoop(); } });
    frame();
  }
})();
