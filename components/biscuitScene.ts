// The 3D part: a biscuit drops in, cracks, splits in two in front of the name (like the reference picture),
// then both halves crumble away into crumbs that fall and pile up on the floor.
// Timeline (seconds): drop 0-1.1, first crack 1.6, split 2.2, name slides down 2.5, halves crumble 3.6-4.6
import * as THREE from "three";

type Callbacks = { onTitle: (on: boolean) => void };

export function startBiscuitScene(canvas: HTMLCanvasElement, cb: Callbacks) {
  const T = THREE;
  const hero = canvas.parentElement as HTMLElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;

  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(35, 1, 0.1, 60);
  scene.add(new T.HemisphereLight(0xfff4e0, 0x8a6a4a, 2.3));
  const sun = new T.DirectionalLight(0xffe9c8, 3.9);
  sun.position.set(2.5, 5, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
  sun.shadow.radius = 4;
  scene.add(sun);

  const FLOOR = -1.45;
  const floor = new T.Mesh(new T.PlaneGeometry(30, 30), new T.ShadowMaterial({ opacity: 0.16 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR;
  floor.receiveShadow = true;
  scene.add(floor);

  // seeded random, so the biscuit breaks the same way every time
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // biscuit top: golden bake, darker rim, little holes, sugar
  const tc = document.createElement("canvas");
  tc.width = tc.height = 512;
  const g = tc.getContext("2d")!;
  const rg = g.createRadialGradient(256, 256, 40, 256, 256, 256);
  rg.addColorStop(0, "#e9bd76");
  rg.addColorStop(0.75, "#dca55c");
  rg.addColorStop(1, "#a8642a");
  g.fillStyle = rg;
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1400; i++) {
    g.fillStyle = rnd() < 0.5 ? "rgba(120,60,20,.10)" : "rgba(255,240,210,.18)";
    g.beginPath();
    g.arc(rnd() * 512, rnd() * 512, rnd() * 3 + 0.5, 0, 7);
    g.fill();
  }
  const holes: [number, number][] = [[256, 256]];
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; holes.push([256 + Math.cos(a) * 90, 256 + Math.sin(a) * 90]); }
  for (let k = 0; k < 12; k++) { const a = ((k + 0.5) / 12) * Math.PI * 2; holes.push([256 + Math.cos(a) * 170, 256 + Math.sin(a) * 170]); }
  holes.forEach(([x, y]) => {
    g.fillStyle = "#8a4a1c"; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill();
    g.fillStyle = "rgba(255,230,190,.5)"; g.beginPath(); g.arc(x - 2, y - 2, 3, 0, 7); g.fill();
  });
  const tex = new T.CanvasTexture(tc);
  tex.colorSpace = T.SRGBColorSpace;
  const R = 1.1, D = 0.3;
  tex.repeat.set(1 / (2 * R), 1 / (2 * R));
  tex.offset.set(0.5, 0.5);
  const topMat = new T.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: 0.015, roughness: 0.85 });
  const sideMat = new T.MeshStandardMaterial({ color: 0xd6a15e, roughness: 1 });

  // cut the biscuit into two halves along one jagged crack, top to bottom
  const N = 2;
  const c = new T.Vector2(0.03, 0.05);
  const angles = [Math.PI / 2 - 0.08, (Math.PI * 3) / 2 + 0.1];
  const crack = (a: number) => {
    const e = new T.Vector2(Math.cos(a) * R, Math.sin(a) * R);
    const pts = [c.clone()];
    const dir = e.clone().sub(c);
    const perp = new T.Vector2(-dir.y, dir.x).normalize();
    for (let s = 1; s < 9; s++) pts.push(c.clone().lerp(e, s / 9).addScaledVector(perp, (rnd() - 0.5) * 0.24));
    pts.push(e);
    return pts;
  };
  const paths = angles.map(crack);
  const biscuit = new T.Group();
  biscuit.scale.setScalar(0.92);
  scene.add(biscuit);

  const pieces: { m: THREE.Mesh; dir: THREE.Vector3; a0: number; a1: number }[] = [];
  for (let i = 0; i < N; i++) {
    const a0 = angles[i], a1 = i < N - 1 ? angles[i + 1] : angles[0] + Math.PI * 2;
    const p0 = paths[i], p1 = paths[(i + 1) % N];
    const sh = new T.Shape();
    sh.moveTo(c.x, c.y);
    p0.slice(1).forEach((p) => sh.lineTo(p.x, p.y));
    for (let s = 1; s <= 18; s++) { const a = a0 + ((a1 - a0) * s) / 18; sh.lineTo(Math.cos(a) * R, Math.sin(a) * R); }
    for (let k = p1.length - 2; k >= 0; k--) sh.lineTo(p1[k].x, p1[k].y);
    const geo = new T.ExtrudeGeometry(sh, { depth: D, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelOffset: -0.03, bevelSegments: 2, curveSegments: 4 });
    geo.translate(0, 0, -D / 2);
    const m = new T.Mesh(geo, [topMat, sideMat]);
    m.castShadow = true;
    const mid = (a0 + a1) / 2;
    pieces.push({ m, dir: new T.Vector3(Math.cos(mid), Math.sin(mid), 0), a0, a1 });
    biscuit.add(m);
  }

  // crumbs: a few small ones fly out of the crack, then lots of big ones when the halves crumble
  const CRACK_N = reduce ? 60 : 140;
  const CRUMBLE_N = reduce ? 360 : 1000;
  const CN = CRACK_N + CRUMBLE_N;
  const crumbs = new T.InstancedMesh(new T.IcosahedronGeometry(1, 0), new T.MeshStandardMaterial({ roughness: 1, flatShading: true }), CN);
  crumbs.castShadow = true;
  crumbs.frustumCulled = false; // without this three.js can wrongly skip drawing the crumbs
  crumbs.instanceMatrix.setUsage(T.DynamicDrawUsage);
  scene.add(crumbs);
  const tones = [0xd9a35b, 0xe7bd7c, 0xc0803b, 0xf0d6a8, 0xa8642a, 0xdcae6a].map((h) => new T.Color(h));
  type Crumb = { p: THREE.Vector3; v: THREE.Vector3; q: THREE.Quaternion; w: THREE.Vector3; sc: THREE.Vector3; rest: boolean; on: boolean };
  const C: Crumb[] = [];
  for (let i = 0; i < CN; i++) {
    crumbs.setColorAt(i, tones[Math.floor(rnd() * tones.length)]);
    const s = i < CRACK_N ? 0.012 + rnd() ** 3 * 0.03 : 0.022 + rnd() ** 2 * 0.06;
    C.push({ p: new T.Vector3(), v: new T.Vector3(), q: new T.Quaternion(), w: new T.Vector3(),
      sc: new T.Vector3(s * (0.75 + rnd() * 0.5), s * (0.6 + rnd() * 0.4), s * (0.75 + rnd() * 0.5)), rest: false, on: false });
  }
  const dummy = new T.Object3D();

  // a rough height map of the floor, so crumbs land on top of each other and make little piles
  const CELL = 0.07;
  const heights = new Map<string, number>();
  const cellKey = (x: number, z: number) => `${Math.round(x / CELL)},${Math.round(z / CELL)}`;

  const hideCrumbs = () => {
    heights.clear();
    for (let i = 0; i < CN; i++) {
      dummy.position.set(0, -50, 0); dummy.scale.set(0, 0, 0); dummy.updateMatrix();
      crumbs.setMatrixAt(i, dummy.matrix); C[i].on = false;
    }
    crumbs.instanceMatrix.needsUpdate = true;
  };
  const launch = (k: Crumb) => {
    k.q.setFromEuler(new T.Euler(rnd() * 6, rnd() * 6, rnd() * 6));
    k.w.set(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(12);
    k.rest = false; k.on = true;
  };
  // small crumbs out of the crack line in the middle
  const crackBurst = () => {
    biscuit.updateMatrixWorld();
    const cen = new T.Vector3().setFromMatrixPosition(biscuit.matrixWorld);
    for (let i = 0; i < CRACK_N; i++) {
      const k = C[i];
      k.p.set(c.x + (rnd() - 0.5) * 0.3, (rnd() * 2 - 1) * R * 0.95, (rnd() - 0.5) * D).applyMatrix4(biscuit.matrixWorld);
      const side = k.p.x < cen.x ? -1 : 1;
      k.v.set(side * (0.2 + rnd() * 0.8), 0.2 + rnd() * 1.2, (rnd() - 0.3) * 0.8);
      launch(k);
    }
  };
  // big crumbs peeling off the outer edge of a half as it shrinks
  let nextCrumb = CRACK_N;
  const crumbleFrom = (count: number, size: number) => {
    for (let n = 0; n < count && nextCrumb < CN; n++) {
      const piece = pieces[nextCrumb % pieces.length];
      piece.m.updateMatrixWorld();
      const k = C[nextCrumb++];
      const a = piece.a0 + (piece.a1 - piece.a0) * rnd();
      const r = R * (0.25 + 0.75 * Math.sqrt(rnd())) * Math.max(0.35, size);
      k.p.set(Math.cos(a) * r, Math.sin(a) * r, (rnd() - 0.5) * D).applyMatrix4(piece.m.matrixWorld);
      k.v.set(Math.cos(a) * (0.2 + rnd() * 0.9), rnd() * 0.9, (rnd() - 0.2) * 0.7);
      launch(k);
    }
  };
  const tmpQ = new T.Quaternion(), tmpE = new T.Euler();
  const stepCrumbs = (dt: number) => {
    C.forEach((k, i) => {
      if (!k.on) return;
      if (!k.rest) {
        k.v.y -= 9.8 * dt;
        k.p.addScaledVector(k.v, dt);
        k.q.multiply(tmpQ.setFromEuler(tmpE.set(k.w.x * dt, k.w.y * dt, k.w.z * dt)));
        const key = cellKey(k.p.x, k.p.z);
        const ground = FLOOR + (heights.get(key) ?? 0);
        const bottom = ground + k.sc.y * 0.8;
        if (k.p.y < bottom) {
          k.p.y = bottom; k.v.y *= -0.25; k.v.x *= 0.5; k.v.z *= 0.5; k.w.multiplyScalar(0.5);
          if (Math.abs(k.v.y) < 0.4 && k.v.lengthSq() < 0.1) {
            k.rest = true;
            heights.set(key, Math.min(0.28, (heights.get(key) ?? 0) + k.sc.y * 0.7)); // the pile grows, up to a limit
          }
        }
      }
      dummy.position.copy(k.p); dummy.quaternion.copy(k.q); dummy.scale.copy(k.sc); dummy.updateMatrix();
      crumbs.setMatrixAt(i, dummy.matrix);
    });
    crumbs.instanceMatrix.needsUpdate = true;
  };

  // fit the scene to the screen size
  const fit = () => {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    const dist = Math.max(5.2, 1.75 / (Math.tan(T.MathUtils.degToRad(17.5)) * cam.aspect));
    cam.position.set(0, 0.55, dist);
    cam.lookAt(0, -0.25, 0);
    cam.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(fit);
  ro.observe(hero);
  fit();

  // timeline
  const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
  let t0 = performance.now(), last = t0, cracked = false, titled = false, raf = 0;
  const replay = () => {
    t0 = performance.now(); cracked = false; titled = false; nextCrumb = CRACK_N;
    cb.onTitle(false);
    hideCrumbs();
    pieces.forEach((p) => { p.m.position.set(0, 0, 0); p.m.rotation.set(0, 0, 0); p.m.scale.setScalar(1); p.m.visible = true; });
  };
  replay();

  const SPLIT = 0.62; // how far apart the two halves move
  const CRUMBLE_START = 3.6, CRUMBLE_TIME = 1.0;
  const tick = (now: number) => {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    const t = reduce ? 10 : (now - t0) / 1000;

    const drop = ease(t / 1.1);
    biscuit.position.set(0, 0.12 + 2.8 * (1 - drop) + Math.sin(t * 1.6) * 0.035, 0);
    biscuit.rotation.set(-0.12 + 0.1 * (1 - drop), Math.sin(t * 0.7) * 0.12 * (t < 2.2 ? 1 : 0.4), (1 - drop) * 0.6);

    // crack, then split in two
    let gap = 0, shake = 0;
    if (t > 1.6) { gap = 0.03 * ease((t - 1.6) / 0.12); shake = t < 2.0 ? 0.035 : 0; }
    if (t > 2.2) gap = 0.03 + (SPLIT - 0.03) * ease((t - 2.2) / 0.8);
    if (t > CRUMBLE_START - 0.4 && t < CRUMBLE_START + CRUMBLE_TIME) shake = 0.03; // trembles before crumbling
    const open = gap / SPLIT;

    // crumble: halves shrink from the outside in while big crumbs peel off them
    const k = Math.min(1, Math.max(0, (t - CRUMBLE_START) / CRUMBLE_TIME));
    const size = 1 - k;
    pieces.forEach((p) => {
      p.m.position.copy(p.dir).multiplyScalar(gap);
      p.m.rotation.y = p.dir.x * 0.35 * open; // halves turn outward a little
      p.m.rotation.z = -p.dir.x * 0.06 * open;
      p.m.scale.setScalar(Math.max(0.001, size));
      p.m.visible = size > 0.01;
    });
    biscuit.position.x += (rnd() - 0.5) * shake;
    biscuit.position.y += (rnd() - 0.5) * shake;

    if (!cracked && t > 2.2) { cracked = true; crackBurst(); }
    if (k > 0) {
      const target = CRACK_N + Math.round(k * CRUMBLE_N);
      crumbleFrom(target - nextCrumb, size);
    }
    if (reduce && nextCrumb >= CN && !titled) for (let s = 0; s < 300; s++) stepCrumbs(1 / 60);
    else if (!reduce) stepCrumbs(dt);
    if (!titled && t > 2.5) { titled = true; cb.onTitle(true); }
    renderer.render(scene, cam);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  // cleanup when the page is left
  const stop = () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    renderer.dispose();
  };
  return { replay, stop };
}