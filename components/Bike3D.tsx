'use client';
import { useEffect, useRef, useState } from 'react';

// 3D bike configurator view. The motorcycle is an original model built procedurally from primitives
// (no external model files). Every option rebuilds the affected geometry/materials live.

export type Bike3DConfig = {
  style: 'cruiser' | 'touring' | 'sport' | 'adventure';
  paint: string;                 // hex
  wheels: 'spoke' | 'cast' | 'disc' | string;
  finish: 'chrome' | 'black' | string;
  exhaust: 'stock' | 'slip' | 'high' | string;
  seat: 'solo' | 'two' | 'stitch' | string;
  bars: 'pull' | 'ape' | 'drag' | string;
  access: string[];              // shield, bags, trunk, lights, guard
};

type View = 'three-quarter' | 'side' | 'front' | 'rear' | 'top';
const VIEWS: Record<View, [number, number, number]> = {
  'three-quarter': [2.6, 1.25, 2.6], side: [0.05, 0.85, 3.9], front: [3.9, 0.95, 0.05], rear: [-3.9, 1.0, 0.05], top: [0.4, 4.2, 0.6],
};

type Three = typeof import('three');

// Proportions per model style (metres-ish). Rear wheel at -wb/2, front at +wb/2.
const STYLES = {
  cruiser:   { wb: 1.62, rf: 0.34, rr: 0.34, seatY: 0.66, tankY: 0.88, headY: 0.98, rake: 0.55 },
  touring:   { wb: 1.64, rf: 0.34, rr: 0.34, seatY: 0.72, tankY: 0.92, headY: 1.02, rake: 0.50 },
  sport:     { wb: 1.46, rf: 0.31, rr: 0.31, seatY: 0.80, tankY: 0.98, headY: 1.00, rake: 0.40 },
  adventure: { wb: 1.56, rf: 0.38, rr: 0.35, seatY: 0.86, tankY: 1.04, headY: 1.12, rake: 0.45 },
} as const;

function buildBike(THREE: Three, c: Bike3DConfig) {
  const g = new THREE.Group();
  const S = STYLES[c.style] ?? STYLES.cruiser;
  const V = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z);

  // ---- materials ----
  const paint = new THREE.MeshPhysicalMaterial({ color: c.paint, metalness: 0.35, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.06 });
  const metal = c.finish === 'black'
    ? new THREE.MeshStandardMaterial({ color: '#1e2024', metalness: 0.7, roughness: 0.32 })
    : new THREE.MeshStandardMaterial({ color: '#e9ecef', metalness: 1, roughness: 0.12 });
  const frameMat = new THREE.MeshStandardMaterial({ color: '#17191c', metalness: 0.55, roughness: 0.4 });
  const rubber = new THREE.MeshStandardMaterial({ color: '#141414', metalness: 0, roughness: 0.92 });
  const leather = new THREE.MeshStandardMaterial({ color: c.seat === 'stitch' ? '#3a2a20' : '#231c18', roughness: 0.75, metalness: 0.05 });
  const stitchMat = new THREE.MeshStandardMaterial({ color: '#d9c7a6', roughness: 0.6 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#cfe3ea', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.32, side: THREE.DoubleSide });
  const lamp = new THREE.MeshStandardMaterial({ color: '#fff8e1', emissive: '#fff1c4', emissiveIntensity: 1.6 });
  const tail = new THREE.MeshStandardMaterial({ color: '#7a0d0d', emissive: '#ff2a1a', emissiveIntensity: 0.9 });

  const add = (geo: ConstructorParameters<Three['Mesh']>[0], mat: ConstructorParameters<Three['Mesh']>[1], pos?: InstanceType<Three['Vector3']>) => {
    const m = new THREE.Mesh(geo, mat); if (pos) m.position.copy(pos); m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
  };
  const tube = (a: InstanceType<Three['Vector3']>, b: InstanceType<Three['Vector3']>, r: number, mat: InstanceType<Three['Material']>) => {
    const d = new THREE.Vector3().subVectors(b, a); const len = d.length();
    const m = add(new THREE.CylinderGeometry(r, r, len, 16), mat, new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
  };
  const curve = (pts: InstanceType<Three['Vector3']>[], r: number, mat: InstanceType<Three['Material']>, seg = 64) =>
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, 12, false), mat);
  const ellipsoid = (pos: InstanceType<Three['Vector3']>, sx: number, sy: number, sz: number, mat: InstanceType<Three['Material']>) => {
    const m = add(new THREE.SphereGeometry(1, 40, 24), mat, pos); m.scale.set(sx, sy, sz); return m;
  };
  const arc = (cx: number, cy: number, R: number, width: number, from: number, len: number, mat: InstanceType<Three['Material']>) => {
    const geo = new THREE.CylinderGeometry(R, R, width, 48, 1, true, from, len); geo.rotateX(Math.PI / 2);
    const m = add(geo, mat, V(cx, cy)); (m.material as InstanceType<Three['MeshStandardMaterial']>).side = THREE.DoubleSide; return m;
  };

  const rx = -S.wb / 2, fx = S.wb / 2;
  const hx = fx - (S.headY - S.rf) * S.rake; // steering head x
  const head = V(hx, S.headY);

  // ---- wheels ----
  const wheel = (x: number, r: number) => {
    const w = new THREE.Group(); w.position.set(x, r, 0);
    const tire = new THREE.Mesh(new THREE.TorusGeometry(r - 0.045, 0.055, 18, 64), rubber); tire.castShadow = true; w.add(tire);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(r - 0.1, 0.014, 10, 64), metal); w.add(rim);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 20), metal); hub.rotation.x = Math.PI / 2; w.add(hub);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.5, r * 0.5, 0.01, 40), new THREE.MeshStandardMaterial({ color: '#9aa1a8', metalness: 0.9, roughness: 0.35 }));
    disc.rotation.x = Math.PI / 2; disc.position.z = 0.075; w.add(disc);
    const inner = r - 0.11;
    if (c.wheels === 'disc') {
      const d = new THREE.Mesh(new THREE.CylinderGeometry(inner, inner, 0.05, 48), metal); d.rotation.x = Math.PI / 2; w.add(d);
    } else if (c.wheels === 'cast') {
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const s = new THREE.Mesh(new THREE.BoxGeometry(inner - 0.04, 0.03, 0.025), metal);
        s.position.set(Math.cos(a) * (inner / 2 + 0.02), Math.sin(a) * (inner / 2 + 0.02), 0); s.rotation.z = a; w.add(s);
      }
    } else {
      for (let i = 0; i < 32; i++) {
        const a = (i / 32) * Math.PI * 2, side = i % 2 ? 0.03 : -0.03;
        const a0 = new THREE.Vector3(Math.cos(a + 0.3) * 0.05, Math.sin(a + 0.3) * 0.05, side), b0 = new THREE.Vector3(Math.cos(a) * inner, Math.sin(a) * inner, 0);
        const d = new THREE.Vector3().subVectors(b0, a0);
        const s = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, d.length(), 6), metal);
        s.position.copy(a0).add(b0).multiplyScalar(0.5); s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); w.add(s);
      }
    }
    w.traverse(o => { if ((o as InstanceType<Three['Mesh']>).isMesh) (o as InstanceType<Three['Mesh']>).castShadow = true; });
    g.add(w);
  };
  wheel(rx, S.rr); wheel(fx, S.rf);

  // ---- fenders ----
  arc(rx, S.rr, S.rr + 0.05, 0.19, Math.PI * (c.style === 'sport' ? 0.95 : 0.78), Math.PI * (c.style === 'sport' ? 0.35 : 0.72), paint);
  if (c.style === 'adventure') { // high "beak" style front fender
    ellipsoid(V(fx - 0.02, S.headY - 0.17), 0.24, 0.035, 0.1, paint).rotation.z = -0.25;
  } else {
    arc(fx, S.rf, S.rf + 0.04, 0.15, Math.PI * 0.82, Math.PI * (c.style === 'touring' ? 0.42 : 0.32), paint);
  }

  // ---- fork, frame, swingarm, shock ----
  for (const z of [-0.085, 0.085]) {
    tube(V(fx, S.rf, z), V(hx + 0.02, S.headY - 0.04, z * 0.8), c.style === 'adventure' || c.style === 'sport' ? 0.024 : 0.021, metal);
    tube(V(fx, S.rf, z), V((fx + hx) / 2, (S.rf + S.headY) / 2, z * 0.9), 0.03, frameMat);
  }
  tube(V(hx + 0.03, S.headY - 0.07), V(hx - 0.03, S.headY + 0.09), 0.035, frameMat); // steering head
  const pivot = V(-0.14, 0.42);
  const seatRear = V(rx + 0.33, S.seatY - 0.04);
  tube(head, V(-0.05, S.tankY - 0.06), 0.03, frameMat);                  // backbone
  tube(V(-0.05, S.tankY - 0.06), seatRear, 0.028, frameMat);
  tube(head, V(0.3, 0.2), 0.03, frameMat);                               // down tube
  tube(V(0.3, 0.2), V(-0.1, 0.17), 0.028, frameMat);
  tube(V(-0.1, 0.17), pivot, 0.028, frameMat);
  tube(pivot, V(-0.05, S.tankY - 0.06), 0.026, frameMat);
  for (const z of [-0.12, 0.12]) {
    tube(V(pivot.x, pivot.y, z * 0.7), V(rx, S.rr, z), 0.026, frameMat);   // swingarm
    tube(V(rx + 0.2, S.rr + 0.06, z), V(rx + 0.33, S.seatY - 0.06, z * 0.8), 0.022, metal); // shock
    const spring = add(new THREE.TorusGeometry(0.03, 0.006, 6, 20, Math.PI * 2), metal, V(rx + 0.265, (S.rr + S.seatY) / 2, z * 0.9));
    spring.rotation.x = Math.PI / 2;
  }

  // ---- engine: V-twin with fins ----
  const crank = V(0.06, 0.33);
  add(new THREE.BoxGeometry(0.44, 0.19, 0.24), frameMat, V(crank.x - 0.02, crank.y - 0.04)).geometry.translate(0, 0, 0);
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.27, 28), metal, V(crank.x - 0.02, crank.y - 0.04)).rotation.x = Math.PI / 2; // case cover
  for (const [ang, side] of [[0.42, 1], [-0.42, -1]] as const) {
    const cyl = new THREE.Group();
    cyl.position.copy(V(crank.x + side * 0.05, crank.y + 0.06)); cyl.rotation.z = -ang;
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.26, 24), metal); barrel.position.y = 0.13; cyl.add(barrel);
    for (let i = 0; i < 8; i++) {
      const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.098, 0.009, 28), c.finish === 'black' ? metal : frameMat);
      fin.position.y = 0.04 + i * 0.03; cyl.add(fin);
    }
    const headCap = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.06, 0.16), metal); headCap.position.y = 0.28; cyl.add(headCap);
    cyl.traverse(o => { if ((o as InstanceType<Three['Mesh']>).isMesh) (o as InstanceType<Three['Mesh']>).castShadow = true; });
    g.add(cyl);
  }
  const airbox = add(new THREE.CylinderGeometry(0.075, 0.075, 0.045, 32), metal, V(crank.x + 0.02, crank.y + 0.2, 0.14));
  airbox.rotation.x = Math.PI / 2;

  // ---- tank ----
  const tankLen = (hx - (-0.06)) / 2 + 0.06;
  ellipsoid(V((hx - 0.06) / 2, S.tankY), tankLen, c.style === 'sport' ? 0.11 : 0.12, 0.16, paint).rotation.z = c.style === 'cruiser' ? -0.06 : 0.04;
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.015, 20), metal, V((hx - 0.06) / 2 + 0.05, S.tankY + 0.12)); // filler cap

  // ---- seat ----
  if (c.seat === 'two') {
    ellipsoid(V(-0.18, S.seatY + 0.02), 0.2, 0.05, 0.16, leather);
    ellipsoid(V(-0.48, S.seatY + 0.07), 0.15, 0.05, 0.13, leather);
    tube(V(-0.6, S.seatY + 0.08), V(-0.6, S.seatY + 0.3), 0.012, metal); // backrest bar
  } else {
    ellipsoid(V(-0.22, S.seatY + 0.02), c.seat === 'stitch' ? 0.24 : 0.22, 0.05, 0.155, leather);
  }
  if (c.seat === 'stitch') {
    for (let i = 0; i < 5; i++) for (const z of [-0.05, 0.05]) {
      const st = add(new THREE.BoxGeometry(0.05, 0.004, 0.004), stitchMat, V(-0.33 + i * 0.055, S.seatY + 0.07, z));
      st.rotation.y = (i % 2 ? 1 : -1) * 0.8;
    }
  }

  // ---- headlight + tail light ----
  const hl = V(hx + 0.11, S.headY - 0.05);
  add(new THREE.SphereGeometry(0.085, 32, 20), metal, hl);
  const lens = add(new THREE.CircleGeometry(0.07, 32), lamp, V(hl.x + 0.083, hl.y)); lens.rotation.y = Math.PI / 2;
  add(new THREE.BoxGeometry(0.03, 0.035, 0.12), tail, V(rx - 0.02, S.rr + S.rr + 0.1));

  // ---- handlebars ----
  const by = S.headY + 0.08;
  const bars: Record<string, InstanceType<Three['Vector3']>[]> = {
    pull: [V(hx - 0.24, by + 0.06, -0.36), V(hx + 0.02, by + 0.08, -0.2), V(hx, by, 0), V(hx + 0.02, by + 0.08, 0.2), V(hx - 0.24, by + 0.06, 0.36)],
    ape:  [V(hx - 0.16, by + 0.36, -0.35), V(hx + 0.02, by + 0.34, -0.2), V(hx + 0.02, by + 0.06, -0.08), V(hx, by, 0), V(hx + 0.02, by + 0.06, 0.08), V(hx + 0.02, by + 0.34, 0.2), V(hx - 0.16, by + 0.36, 0.35)],
    drag: [V(hx - 0.02, by + 0.02, -0.36), V(hx, by + 0.01, -0.18), V(hx, by, 0), V(hx, by + 0.01, 0.18), V(hx - 0.02, by + 0.02, 0.36)],
  };
  const bp = bars[c.bars] ?? bars.pull;
  curve(bp, 0.0135, metal);
  for (const end of [bp[0], bp[bp.length - 1]]) {
    const grip = add(new THREE.CylinderGeometry(0.019, 0.019, 0.12, 14), rubber, end); grip.rotation.x = Math.PI / 2;
  }

  // ---- exhaust (right side, +z) ----
  const zE = 0.17;
  if (c.exhaust === 'high') {
    curve([V(0.22, 0.6, 0.1), V(0.12, 0.42, zE), V(-0.1, 0.5, zE + 0.03), V(rx + 0.25, 0.62, zE + 0.05), V(rx - 0.1, 0.72, zE + 0.05)], 0.042, metal);
    const tip = add(new THREE.CylinderGeometry(0.055, 0.05, 0.36, 24), metal, V(rx + 0.02, 0.69, zE + 0.05)); tip.rotation.z = Math.PI / 2 - 0.25;
  } else {
    const end = c.exhaust === 'slip' ? rx - 0.08 : rx + 0.05;
    for (const [dy, dz] of [[0, 0], [0.09, 0.03]] as const) {
      curve([V(0.22 - dz, 0.6 - dy * 0.3, 0.1), V(0.18, 0.28, zE - 0.03), V(0.0, 0.18 + dy, zE + dz), V(rx + 0.4, 0.21 + dy, zE + dz)], 0.033, metal);
      const muff = add(new THREE.CylinderGeometry(c.exhaust === 'slip' ? 0.058 : 0.046, c.exhaust === 'slip' ? 0.052 : 0.046, c.exhaust === 'slip' ? 0.5 : 0.4, 24), metal,
        V((rx + 0.4 + end) / 2, 0.22 + dy + (c.exhaust === 'slip' ? 0.02 : 0), zE + dz));
      muff.rotation.z = Math.PI / 2 - (c.exhaust === 'slip' ? 0.08 : 0.02);
    }
  }

  // ---- style-specific bodywork ----
  if (c.style === 'touring') {
    ellipsoid(V(hx + 0.08, S.headY + 0.02), 0.18, 0.2, 0.34, paint);             // batwing-style fairing
    add(new THREE.BoxGeometry(0.02, 0.06, 0.2), lamp, V(hx + 0.26, S.headY - 0.02));
  }
  if (c.style === 'sport') {
    ellipsoid(V(rx + 0.36, S.seatY + 0.04), 0.2, 0.06, 0.1, paint).rotation.z = 0.25; // tail cowl
    ellipsoid(V(0.08, 0.17), 0.26, 0.05, 0.13, paint);                             // belly pan
  }
  if (c.style === 'adventure') {
    add(new THREE.BoxGeometry(0.34, 0.03, 0.26), metal, V(rx + 0.1, S.seatY + 0.08)); // rear rack
    ellipsoid(V(0.22, 0.16), 0.22, 0.03, 0.14, metal);                                // skid plate
  }

  // ---- accessories ----
  const has = (k: string) => c.access.includes(k);
  if (has('shield') || c.style === 'touring' || c.style === 'adventure') {
    const R = 0.42, h = c.style === 'touring' ? 0.3 : 0.4;
    const geo = new THREE.CylinderGeometry(R, R, h, 32, 1, true, Math.PI / 2 - 0.62, 1.24);
    const ws = add(geo, glass, V(hx + 0.12 - R, S.headY + (c.style === 'touring' ? 0.32 : 0.28)));
    ws.rotation.z = 0.28; ws.castShadow = false;
  }
  if (has('bags') || c.style === 'touring') {
    for (const z of [-0.27, 0.27]) {
      const bag = add(new THREE.BoxGeometry(0.52, 0.3, 0.17, 4, 4, 4), paint, V(rx + 0.16, S.rr + 0.15, z));
      bag.scale.set(1, 1, 1);
      add(new THREE.BoxGeometry(0.5, 0.012, 0.172), metal, V(rx + 0.16, S.rr + 0.25, z));
    }
  }
  if (has('trunk')) {
    add(new THREE.BoxGeometry(0.36, 0.28, 0.42), paint, V(rx - 0.02, S.seatY + 0.2));
    add(new THREE.BoxGeometry(0.37, 0.012, 0.43), metal, V(rx - 0.02, S.seatY + 0.22));
  }
  if (has('lights')) for (const z of [-0.14, 0.14]) {
    add(new THREE.SphereGeometry(0.04, 20, 14), metal, V(hx + 0.1, S.headY - 0.2, z));
    const l = add(new THREE.CircleGeometry(0.032, 20), lamp, V(hx + 0.141, S.headY - 0.2, z)); l.rotation.y = Math.PI / 2;
  }
  if (has('guard')) for (const z of [-1, 1]) {
    curve([V(0.36, 0.62, 0.08 * z), V(0.46, 0.45, 0.26 * z), V(0.42, 0.24, 0.24 * z), V(0.3, 0.2, 0.09 * z)], 0.016, metal);
  }

  return g;
}

function disposeGroup(group: { traverse: (cb: (o: unknown) => void) => void }) {
  const mats = new Set<{ dispose: () => void }>();
  group.traverse(o => {
    const m = o as { isMesh?: boolean; geometry?: { dispose: () => void }; material?: { dispose: () => void } | { dispose: () => void }[] };
    if (!m.isMesh) return;
    m.geometry?.dispose();
    for (const mat of Array.isArray(m.material) ? m.material : m.material ? [m.material] : []) mats.add(mat);
  });
  mats.forEach(m => m.dispose());
}

export default function Bike3D({ config, fallback }: { config: Bike3DConfig; fallback?: React.ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ setConfig: (c: Bike3DConfig) => void; setView: (v: View) => void; setSpin: (on: boolean) => void } | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [spin, setSpin] = useState(true);
  const latest = useRef(config);
  latest.current = config;

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      try {
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
        if (disposed || !host.current) return;
        const el = host.current;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;

        const camera = new THREE.PerspectiveCamera(32, el.clientWidth / el.clientHeight, 0.1, 50);
        camera.position.set(...VIEWS['three-quarter']);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0.55, 0);
        controls.enableDamping = true;
        controls.minDistance = 1.8;
        controls.maxDistance = 6.5;
        controls.maxPolarAngle = Math.PI / 2 - 0.04;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.9;
        controls.addEventListener('start', () => { controls.autoRotate = false; setSpin(false); });

        scene.add(new THREE.HemisphereLight('#ffffff', '#5b5348', 0.55));
        const sun = new THREE.DirectionalLight('#ffffff', 2.2);
        sun.position.set(2.5, 4.5, 2.2);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.camera.left = -2; sun.shadow.camera.right = 2; sun.shadow.camera.top = 2; sun.shadow.camera.bottom = -2;
        sun.shadow.bias = -0.0004;
        scene.add(sun);

        const ground = new THREE.Mesh(new THREE.CircleGeometry(3.2, 64), new THREE.ShadowMaterial({ opacity: 0.28 }));
        ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
        const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.4, 0.04, 64), new THREE.MeshStandardMaterial({ color: '#d6cfc1', roughness: 0.85 }));
        plinth.position.y = -0.021; plinth.receiveShadow = true; scene.add(plinth);

        let bike = buildBike(THREE, latest.current);
        scene.add(bike);

        let target: [number, number, number] | null = null;
        let raf = 0;
        const tick = () => {
          raf = requestAnimationFrame(tick);
          if (target) {
            camera.position.lerp(new THREE.Vector3(...target), 0.12);
            if (camera.position.distanceTo(new THREE.Vector3(...target)) < 0.01) target = null;
          }
          controls.update();
          renderer.render(scene, camera);
        };
        tick();

        const ro = new ResizeObserver(() => {
          const w = el.clientWidth, h = el.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
        });
        ro.observe(el);

        api.current = {
          setConfig: (c) => { scene.remove(bike); disposeGroup(bike); bike = buildBike(THREE, c); scene.add(bike); },
          setView: (v) => { controls.autoRotate = false; setSpin(false); target = VIEWS[v]; },
          setSpin: (on) => { controls.autoRotate = on; },
        };
        setState('ready');

        cleanup = () => {
          cancelAnimationFrame(raf); ro.disconnect(); controls.dispose();
          disposeGroup(bike); envTex.dispose(); pmrem.dispose(); renderer.dispose();
          renderer.domElement.remove(); api.current = null;
        };
      } catch {
        if (!disposed) setState('failed');
      }
    })();
    return () => { disposed = true; cleanup(); };
  }, []);

  // Rebuild the model whenever an option changes.
  const key = JSON.stringify(config);
  useEffect(() => { api.current?.setConfig(config); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state === 'failed') return <>{fallback}</>;
  return (
    <div className="bike3d">
      <div className="bike3d-canvas" ref={host} aria-label="3D bike preview: drag to rotate, scroll to zoom" role="img" />
      {state === 'loading' && <div className="bike3d-loading">Loading 3D view…</div>}
      <div className="bike3d-tools">
        {(['three-quarter', 'side', 'front', 'rear', 'top'] as View[]).map(v => (
          <button key={v} type="button" onClick={() => api.current?.setView(v)}>{v === 'three-quarter' ? '3/4' : v[0].toUpperCase() + v.slice(1)}</button>
        ))}
        <button type="button" className={spin ? 'on' : ''} onClick={() => { const n = !spin; setSpin(n); api.current?.setSpin(n); }}>
          {spin ? 'Stop spin' : 'Spin'}
        </button>
      </div>
      <p className="bike3d-hint">Drag to rotate · scroll or pinch to zoom</p>
    </div>
  );
}
