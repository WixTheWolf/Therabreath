/* ==========================================================================
   Lab3D · the 3D flavor world
   A glass TheraBreath-style bottle whose liquid drains and refills with each
   flavor, the five Flavor Factory spheres, six floating flavor islands (GLB
   models made with Higgsfield) and fresh mint, all lit by a studio
   environment. One renderer is shared by a page: attach() moves its canvas
   into whichever host is on screen and switches the layout preset.
   Build: npm run build  ->  ../assets/lab3d.js  (global Lab3D)
   ========================================================================== */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, LatheGeometry, CylinderGeometry, SphereGeometry,
  PlaneGeometry, BufferAttribute, MeshPhysicalMaterial, MeshBasicMaterial, CanvasTexture, Vector2, Color,
  PMREMGenerator, DirectionalLight, HemisphereLight, NeutralToneMapping, SRGBColorSpace, InstancedMesh,
  Object3D, Box3, Vector3, ShaderMaterial
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const TAU = Math.PI * 2;
const FONT = '"Archivo", "Arial Narrow", Arial, sans-serif';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// The five spheres from The Flavor Factory logo, with their place in it (px) for the "constellation".
const SPHERES = [
  { c: "#8152A1", s: .26, at: [1044, 62] },
  { c: "#F4823A", s: .39, at: [972, 128] },
  { c: "#F7ED40", s: .29, at: [1014, 221] },
  { c: "#57B953", s: .38, at: [993, 311] },
  { c: "#F0524D", s: .23, at: [901, 347] }
];
const DEFAULT_WORLDS = [
  { id: "frost", name: "Frost Mint", flavor: "Staged cooling", liquid: ["#9EDBF7", "#2F8FD8"], acc: "#1F6FB2" },
  { id: "coastal", name: "Coastal Mint", flavor: "Sea salt & marine air", liquid: ["#8FE3DD", "#1E9FA0"], acc: "#12837F" },
  { id: "cardamom", name: "Cardamom Mint", flavor: "Green cardamom", liquid: ["#CFE6A6", "#6E9B3A"], acc: "#B08A2E" },
  { id: "coconut", name: "Coconut Mint", flavor: "Coconut water", liquid: ["#F4F1E6", "#BFD9C4"], acc: "#3E8E6A" },
  { id: "rosewater", name: "Rosewater Mint", flavor: "Rosewater", liquid: ["#FFD3DD", "#E27E98"], acc: "#C24D6E" },
  { id: "orchard", name: "Orchard Mint", flavor: "Crisp green apple", liquid: ["#D6F0A0", "#6DBA3C"], acc: "#4E9A2B" }
];

/* ---------------------------------------------------------------- presets
   Every number is eased towards its target each frame, so switching preset
   (or host) glides instead of cutting. */
const PRESETS = {
  hero:   { lineGap: 2.25, dist: 16, camY: 1.5, lookY: .25, fov: 30, bottle: 1, lineup: 0, ringR: 4.1, ringTilt: .3, ringY: -.35, islandS: 1, focus: 0, solo: 0, spin: .07, sphR: 2.25, sphMix: 0, sphS: 1, mint: 1, drops: 1 },
  worlds: { lineGap: 2.25, dist: 14.5, camY: .9, lookY: .45, fov: 30, bottle: 1, lineup: 0, ringR: 3.9, ringTilt: .16, ringY: -.2, islandS: 1, focus: 0, solo: 1, spin: 0, sphR: 2.05, sphMix: 0, sphS: .9, mint: .8, drops: .8 },
  stage:  { lineGap: 2.25, dist: 17.5, camY: 2, lookY: .4, fov: 30, bottle: 1, lineup: 0, ringR: 4.8, ringTilt: .34, ringY: -.4, islandS: 1.05, focus: 0, solo: 0, spin: .05, sphR: 2.4, sphMix: 1, sphS: 1.05, mint: 1, drops: 1 },
  lineup: { dist: 19.5, camY: 1.6, lookY: .5, fov: 30, lineGap: 2.25, bottle: 0, lineup: 1, ringR: 0, ringTilt: 0, ringY: 0, islandS: 1, focus: 0, solo: 0, spin: 0, sphR: 8.2, sphMix: 0, sphS: 1.1, mint: .5, drops: .5 }
};

export function supported() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}

/* ---------------------------------------------------------------- bottle shape
   Traced from the pack drawing in playbook-core.js (x = radius, y = height). */
const qb = (a, b, c, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
const cb = (a, b, c, d, t) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d;
function bodyProfile() {
  const P = [[0, 0]];
  for (let i = 0; i <= 10; i++) { const t = i / 10; P.push([qb(.644, 1, 1, t), qb(0, 0, .356, t)]); }
  P.push([1, 3.2]);
  for (let i = 1; i <= 16; i++) { const t = i / 16; P.push([cb(1, 1, .8, .378, t), cb(3.2, 3.622, 3.933, 4, t)]); }
  P.push([.378, 4.16]);
  return P;
}
const BODY = bodyProfile();
function radiusAt(y) {
  for (let i = 1; i < BODY.length; i++) {
    const a = BODY[i - 1], b = BODY[i];
    if (y >= a[1] && y <= b[1] && b[1] > a[1]) return lerp(a[0], b[0], (y - a[1]) / (b[1] - a[1]));
  }
  return y < .01 ? .644 : .378;
}
const LIQ_MIN = .06, LIQ_FULL = 3.72;

function liquidGeometry(level, c0, c1) {
  const top = lerp(LIQ_MIN + .02, LIQ_FULL, level), inset = .045, pts = [new Vector2(0, LIQ_MIN)];
  const ys = [LIQ_MIN];
  BODY.forEach(p => { if (p[1] > LIQ_MIN && p[1] < top) ys.push(p[1]); });
  ys.push(top);
  ys.forEach(y => pts.push(new Vector2(Math.max(.02, radiusAt(y) - inset), y)));
  pts.push(new Vector2(0, top));
  const g = new LatheGeometry(pts, 72);
  const pos = g.attributes.position, col = new Float32Array(pos.count * 3), a = new Color(c0), b = new Color(c1), m = new Color();
  for (let i = 0; i < pos.count; i++) {
    const k = clamp(pos.getY(i) / Math.max(.5, top));
    m.copy(b).lerp(a, Math.pow(k, .8));
    col[i * 3] = m.r; col[i * 3 + 1] = m.g; col[i * 3 + 2] = m.b;
  }
  g.setAttribute("color", new BufferAttribute(col, 3));
  return g;
}

function capGeometry() {
  const pts = [[0, 4.08], [.6, 4.08], [.618, 4.13], [.618, 4.87], [.6, 4.93], [.475, 4.93], [.478, 4.96], [.46, 5.3], [.44, 5.39], [.4, 5.435], [0, 5.435]]
    .map(p => new Vector2(p[0], p[1]));
  const g = new LatheGeometry(pts, 180), pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), r = Math.hypot(x, z);
    const ribbed = (y > 4.15 && y < 4.85) ? 56 : (y > 4.98 && y < 5.28) ? 44 : 0;
    if (!ribbed || r < .3) continue;
    const th = Math.atan2(x, z), nr = r + .013 * Math.cos(th * ribbed);
    pos.setXYZ(i, Math.sin(th) * nr, y, Math.cos(th) * nr);
  }
  g.computeVertexNormals();
  return g;
}

/* ---------------------------------------------------------------- label
   Painted on a canvas (no image files needed) so it also works from file://.
   The TheraBreath logo is added when the page can supply it without tainting. */
let LOGO = null;
function makeText(x) {
  const hasStretch = "fontStretch" in x;
  return (s, cx, y, px, weight, color, maxW, stretch = "condensed", spacing = 0) => {
    x.save();
    x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "alphabetic";
    if ("letterSpacing" in x) x.letterSpacing = spacing + "px";
    let size = px, sx = 1;
    x.font = `${weight} ${size}px ${FONT}`;
    if (hasStretch) x.fontStretch = stretch; else sx = stretch === "condensed" ? .8 : stretch === "semi-condensed" ? .9 : 1;
    const w = x.measureText(s).width * sx;
    if (maxW && w > maxW) { size = size * maxW / w; x.font = `${weight} ${size}px ${FONT}`; }
    x.translate(cx, y); x.scale(sx, 1); x.fillText(s, 0, 0);
    x.restore();
  };
}
function paintLabel(cv, w, withLogo) {
  const x = cv.getContext("2d"), W = cv.width, H = cv.height, cx = W / 2, T = makeText(x);
  x.clearRect(0, 0, W, H);
  x.fillStyle = "#FFFFFF"; x.fillRect(0, 0, W, H);
  // top band
  const band = H * .075;
  x.fillStyle = "#F58025"; x.fillRect(0, 0, W, band);
  T("CONCEPT MOCKUP", cx, band * .74, band * .56, 800, "#FFFFFF", 0, "semi-condensed", 6);
  T("CONCEPT MOCKUP", 0, band * .74, band * .56, 800, "#FFFFFF", 0, "semi-condensed", 6);
  T("CONCEPT MOCKUP", W, band * .74, band * .56, 800, "#FFFFFF", 0, "semi-condensed", 6);
  // logo
  if (withLogo && LOGO) {
    const lw = 560, lh = lw * LOGO.height / LOGO.width;
    x.drawImage(LOGO, cx - lw / 2, band + 34, lw, lh);
  } else {
    T("TheraBreath", cx, band + 150, 128, 900, "#006649", 600, "normal", -2);
  }
  // FRESH BREATH box
  const bw = 520, by = H * .335, bh = H * .1;
  x.fillStyle = "#F58025"; x.fillRect(cx - bw / 2, by, bw, bh);
  T("FRESH BREATH", cx, by + bh * .79, bh * .74, 900, "#FFFFFF", bw - 30);
  T("ORAL RINSE", cx, H * .575, H * .135, 900, "#111111", 600, "condensed", 3);
  T(w.flavor.toUpperCase(), cx, H * .655, H * .05, 800, "#006649", 560, "condensed", 1);
  T("FLAVOR CONCEPT · NOT A PRODUCT", cx, H * .708, H * .03, 800, "#C85F0E", 560, "condensed", 3);
  // flavor band
  const fy = H * .8, fh = H * .115;
  x.fillStyle = w.acc; x.fillRect(0, fy, W, fh);
  T(w.name.toUpperCase(), cx, fy + fh * .74, fh * .62, 900, "#FFFFFF", 600, "condensed", 2);
  // back panel: small print lines
  x.fillStyle = "rgba(7,28,60,.28)";
  for (let r = 0; r < 9; r++) for (const side of [0, 1]) {
    const x0 = side ? W - 470 : 90, len = 300 + ((r * 53) % 80);
    x.fillRect(x0, H * .2 + r * 38, len, 12);
  }
  T("A FLAVOR CONCEPT BY THE FLAVOR FACTORY", 330, H * .66, 22, 800, "rgba(7,28,60,.55)", 460, "condensed", 2);
  T("NOT FOR SALE · WORKING NAME", W - 330, H * .66, 22, 800, "rgba(7,28,60,.55)", 460, "condensed", 2);
}

/* ---------------------------------------------------------------- bubbles
   A fresnel rim plus one hard highlight reads as water or an air bubble on
   any background, which transmission cannot do on a transparent canvas. */
function bubbleMaterial(op) {
  return new ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { opacity: { value: op }, tint: { value: new Color("#d8f3ff") } },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main() {
        mat4 m = modelMatrix;
        #ifdef USE_INSTANCING
          m = modelMatrix * instanceMatrix;
        #endif
        vec4 wp = m * vec4(position, 1.0);
        vN = normalize(mat3(viewMatrix) * mat3(m) * normal);
        vec4 mv = viewMatrix * wp; vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform float opacity; uniform vec3 tint; varying vec3 vN; varying vec3 vV;
      void main() {
        vec3 n = normalize(vN), v = normalize(vV);
        float f = 1.0 - max(dot(n, v), 0.0);
        float rim = pow(f, 2.4);
        vec3 h = normalize(normalize(vec3(-.45, .65, .75)) + v);
        float spec = pow(max(dot(n, h), 0.0), 80.0);
        float spec2 = pow(max(dot(n, normalize(normalize(vec3(.6, -.3, .6)) + v)), 0.0), 30.0) * .35;
        float a = clamp(rim * .8 + spec + spec2 + .035, 0.0, 1.0) * opacity;
        gl_FragColor = vec4(mix(tint, vec3(1.0), clamp(spec + spec2, 0.0, 1.0)), a);
      }`
  });
}

/* ---------------------------------------------------------------- one bottle */
function makeBottle(world, shared) {
  const g = new Group();
  const glass = new Mesh(shared.glassGeo, shared.glassMat);
  const liquidMat = new MeshPhysicalMaterial({ vertexColors: true, roughness: .16, metalness: 0, clearcoat: 1, clearcoatRoughness: .08, sheen: .5, sheenRoughness: .4, sheenColor: new Color("#ffffff") });
  const liquid = new Mesh(liquidGeometry(1, world.liquid[0], world.liquid[1]), liquidMat);
  const cv = document.createElement("canvas"); cv.width = 2048; cv.height = 886;
  const tex = new CanvasTexture(cv); tex.colorSpace = SRGBColorSpace; tex.anisotropy = shared.aniso;
  const labelMat = new MeshPhysicalMaterial({ map: tex, roughness: .42, clearcoat: .35, clearcoatRoughness: .3 });
  const label = new Mesh(shared.labelGeo, labelMat); label.position.y = 1.8335;
  const cap = new Mesh(shared.capGeo, shared.capMat);
  const shadow = new Mesh(shared.shadowGeo, shared.shadowMat); shadow.rotation.x = -Math.PI / 2; shadow.position.y = -.01;
  g.add(liquid, glass, label, cap, shadow);
  g.position.y = -2.72;
  const holder = new Group(); holder.add(g);
  const b = { holder, g, liquid, liquidMat, label, tex, cv, world, level: 1, drawn: "" };
  b.paint = () => {
    let withLogo = !!LOGO;
    paintLabel(cv, b.world, withLogo);
    if (withLogo) { try { cv.getContext("2d").getImageData(0, 0, 1, 1); } catch (e) { paintLabel(cv, b.world, false); } }
    tex.needsUpdate = true;
  };
  b.setLevel = l => {
    l = clamp(l, .02, 1);
    if (Math.abs(l - b.level) < .004 && b.drawn === b.world.id) return;
    b.level = l; b.drawn = b.world.id;
    const old = liquid.geometry; liquid.geometry = liquidGeometry(l, b.world.liquid[0], b.world.liquid[1]); old.dispose();
  };
  b.paint();
  return b;
}

/* ---------------------------------------------------------------- the lab */
export function create(canvas, opts = {}) {
  if (!supported()) return null;
  const worlds = (opts.worlds && opts.worlds.length ? opts.worlds : DEFAULT_WORLDS).slice(0, 6);
  const base = opts.base || "assets/";
  const reduced = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) || !!opts.still;
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: !!opts.preserve, powerPreference: "high-performance" });
  } catch (e) { return null; }
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = opts.exposure || 1;
  renderer.outputColorSpace = SRGBColorSpace;
  if ("transmissionResolutionScale" in renderer) renderer.transmissionResolutionScale = .7;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, .04).texture;
  room.traverse(o => { if (o.geometry) o.geometry.dispose(); });
  if ("environmentIntensity" in scene) scene.environmentIntensity = .95;
  const key = new DirectionalLight("#ffffff", 2.1); key.position.set(5, 7, 6);
  const rim = new DirectionalLight("#9fdcff", 1.8); rim.position.set(-6, 3, -5);
  const warm = new DirectionalLight("#ffd9b0", .7); warm.position.set(6, -2, 3);
  scene.add(key, rim, warm, new HemisphereLight("#eaf8ff", "#0a2a5c", .55));

  const camera = new PerspectiveCamera(30, 1, .1, 200);

  /* shared bottle parts */
  const shadowCv = document.createElement("canvas"); shadowCv.width = shadowCv.height = 256;
  { const x = shadowCv.getContext("2d"), gr = x.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(0,20,50,.42)"); gr.addColorStop(.55, "rgba(0,20,50,.14)"); gr.addColorStop(1, "rgba(0,20,50,0)"); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); }
  const shared = {
    aniso: renderer.capabilities.getMaxAnisotropy(),
    glassGeo: new LatheGeometry(BODY.map(p => new Vector2(p[0], p[1])), 96),
    glassMat: new MeshPhysicalMaterial({ color: "#ffffff", roughness: .045, metalness: 0, transmission: 1, thickness: .32, ior: 1.46, clearcoat: 1, clearcoatRoughness: .03, attenuationColor: new Color("#e2f6ff"), attenuationDistance: 3.2, specularIntensity: 1, envMapIntensity: 1.25, depthWrite: false }),
    labelGeo: new CylinderGeometry(1.013, 1.013, 2.733, 144, 1, true, Math.PI, TAU),
    capGeo: capGeometry(),
    capMat: new MeshPhysicalMaterial({ color: "#F58025", roughness: .36, metalness: 0, clearcoat: .75, clearcoatRoughness: .22, sheen: .3, sheenColor: new Color("#ffb070") }),
    shadowGeo: new PlaneGeometry(3.4, 3.4),
    shadowMat: new MeshBasicMaterial({ map: new CanvasTexture(shadowCv), transparent: true, depthWrite: false })
  };

  const root = new Group(); scene.add(root);

  // hero bottle
  let wi = 0;
  const hero = makeBottle(worlds[0], shared);
  root.add(hero.holder);

  // bubbles inside the hero bottle
  const BN = 30, bubbles = new InstancedMesh(new SphereGeometry(1, 14, 10), bubbleMaterial(1), BN);
  const bub = Array.from({ length: BN }, (_, i) => ({ a: (i * 2.39996) % TAU, r: .15 + ((i * 37) % 60) / 100, y: ((i * 53) % 100) / 100 * 3.4, s: .018 + ((i * 17) % 10) / 400, v: .35 + ((i * 29) % 10) / 20 }));
  hero.g.add(bubbles);
  let burst = 0;

  // lineup of six bottles (deck + finale), made on first use
  const line = [];
  const lineGroup = new Group(); root.add(lineGroup);
  const ensureLineup = () => {
    if (line.length) return;
    worlds.forEach((w, i) => { const b = makeBottle(w, shared); b.holder.scale.setScalar(.001); lineGroup.add(b.holder); line.push(b); });
  };

  // Flavor Factory spheres
  const spheres = SPHERES.map((s, k) => {
    const m = new Mesh(new SphereGeometry(1, 48, 32), new MeshPhysicalMaterial({ color: s.c, roughness: .3, metalness: 0, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: .8 }));
    m.scale.setScalar(.001); root.add(m);
    return { m, s: s.s * 1.55, at: s.at, k, p: new Vector3() };
  });

  // islands (GLB), mint sprigs (GLB) and droplets
  const islands = worlds.map((w, i) => { const h = new Group(); h.scale.setScalar(.001); root.add(h); return { h, i, loaded: false, p: new Vector3(), s: 0 }; });
  const mints = Array.from({ length: 6 }, (_, i) => { const h = new Group(); h.scale.setScalar(.001); root.add(h); return { h, i }; });
  const DN = 34, drops = new InstancedMesh(new SphereGeometry(1, 28, 18), bubbleMaterial(.95), DN);
  const drp = Array.from({ length: DN }, (_, i) => ({ a: (i * 2.39996) % TAU, r: 2.3 + ((i * 41) % 100) / 38, y: -2.6 + ((i * 67) % 100) / 100 * 5.6, s: .05 + ((i * 13) % 10) / 90, w: .05 + ((i * 7) % 10) / 70 }));
  root.add(drops);

  /* ---- loading */
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const fit = (obj, size) => {
    const g = new Group(), inner = new Group(); inner.add(obj); g.add(inner); inner.updateMatrixWorld(true);
    const box = new Box3().setFromObject(inner), s = new Vector3(), c = new Vector3(); box.getSize(s); box.getCenter(c);
    const k = size / Math.max(s.x, s.z, s.y * .9);
    inner.scale.setScalar(k); inner.position.set(-c.x * k, -c.y * k, -c.z * k);
    obj.traverse(o => { if (o.isMesh) { o.frustumCulled = false; if (o.material) o.material.envMapIntensity = 1.1; } });
    return g;
  };
  const load = url => new Promise(res => loader.load(url, gl => res(gl.scene), undefined, e => { console.warn("Lab3D: could not load", url, e && e.message); res(null); }));
  const ready = (async () => {
    if (opts.islands === false) return;
    const models = await Promise.all(worlds.map(w => load(`${base}models/isl-${w.id}.glb`)));
    models.forEach((m, i) => { if (m) { islands[i].h.add(fit(m, 2.35)); islands[i].loaded = true; } });
    const mint = await load(`${base}models/mint.glb`);
    if (mint) mints.forEach((mm, i) => mm.h.add(fit(i ? mint.clone(true) : mint, 1.1)));
    if (reduced) islands.forEach(is => { is.s = is.loaded ? 1 : 0; });
    dirty = 60; wake();
  })();

  // TheraBreath logo for the labels (optional)
  if (opts.logo) {
    const img = new Image();
    img.onload = () => { LOGO = img; hero.paint(); line.forEach(b => b.paint()); dirty = 30; wake(); };
    img.src = opts.logo;
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { hero.paint(); line.forEach(b => b.paint()); dirty = 30; wake(); });

  /* ---- state */
  const cur = Object.assign({}, PRESETS.hero), tgt = Object.assign({}, PRESETS.hero);
  let presetName = "hero", shift = [0, 0], shiftT = [0, 0], progress = 0, t = 0, last = 0, raf = 0, running = false, visible = true, dirty = 90, snap = false;
  let ringA = 0, ringAT = 0, focusIdx = -1;
  const pointer = [0, 0], look = [0, 0];
  let morph = null, cycleTimer = 0, host = null, ro = null;

  function setPreset(name, o = {}) {
    presetName = PRESETS[name] ? name : "hero";
    Object.assign(tgt, PRESETS[presetName], o.params || {});
    shiftT = [o.shiftX || 0, o.shiftY || 0];
    if (presetName === "lineup") ensureLineup();
    if (o.instant) { Object.assign(cur, tgt); shift = shiftT.slice(); snap = true; }
    dirty = 90; wake();
  }

  function setWorld(i, o = {}) {
    i = ((i % worlds.length) + worlds.length) % worlds.length;
    focusIdx = i;
    // bring island i to the front-right of the ring
    const want = .85 - i * TAU / worlds.length;
    let d = want - ringAT; d = Math.atan2(Math.sin(d), Math.cos(d)); ringAT += d;
    if (i === wi && hero.world === worlds[i]) { dirty = 60; wake(); return; }
    if (o.instant || reduced) {
      wi = i; hero.world = worlds[i]; hero.paint(); hero.setLevel(1); morph = null;
      if (o.instant) { ringA = ringAT; snap = true; }
    } else morph = { to: i, t0: -1 };
    dirty = 90; wake();
  }

  function setProgress(p) { progress = clamp(p); if (!reduced) { dirty = 20; wake(); } }

  function resize() {
    const el = host || canvas.parentElement; if (!el) return;
    const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
    // cap the pixel count so big hosts stay smooth on integrated GPUs
    const dpr = Math.min(window.devicePixelRatio || 1, opts.dpr || (w < 700 ? 1.5 : 1.75), Math.sqrt((opts.maxPixels || 2.6e6) / (w * h)));
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    dirty = 30; wake();
  }

  function attach(el, preset, o = {}) {
    if (!el) return;
    if (host !== el) {
      host = el; el.appendChild(canvas); visible = !document.hidden;
      if (io) { io.unobserve(canvas); io.observe(canvas); }
      if (ro) ro.disconnect();
      if (window.ResizeObserver) { ro = new ResizeObserver(resize); ro.observe(el); }
    }
    setPreset(preset || presetName, o);
    if (o.world != null) setWorld(o.world, { instant: !!o.instant });
    resize();
  }

  /* ---- per-frame layout */
  const tmp = new Object3D();
  function update(dt) {
    const k = snap ? 1 : 1 - Math.exp(-dt * 3.2);
    for (const key in tgt) cur[key] = lerp(cur[key], tgt[key], k);
    shift[0] = lerp(shift[0], shiftT[0], k); shift[1] = lerp(shift[1], shiftT[1], k);
    ringA = snap ? ringAT : lerp(ringA, ringAT, 1 - Math.exp(-dt * 2.4));
    if (!reduced && cur.spin) ringAT += cur.spin * dt;
    look[0] = lerp(look[0], pointer[0], 1 - Math.exp(-dt * 2.5)); look[1] = lerp(look[1], pointer[1], 1 - Math.exp(-dt * 2.5));
    const motion = reduced ? 0 : 1, T = t;

    // camera
    const p = presetName === "hero" ? progress : 0;
    const dist = cur.dist + p * 3, yaw = look[0] * .22, pitch = look[1] * .1;
    camera.fov = cur.fov;
    camera.position.set(Math.sin(yaw) * dist, cur.camY + p * 2.2 + pitch * dist, Math.cos(yaw) * dist);
    camera.lookAt(0, cur.lookY + p * .6, 0);
    const el = renderer.domElement, W = el.width, H = el.height;
    if (Math.abs(shift[0]) > .001 || Math.abs(shift[1]) > .001) camera.setViewOffset(W, H, -shift[0] * W, -shift[1] * H, W, H); else camera.clearViewOffset();
    camera.updateProjectionMatrix();

    // morph: drain, swap flavor, refill with a spin and a burst of bubbles
    let spin = 0;
    if (morph) {
      if (morph.t0 < 0) morph.t0 = T;
      const e = T - morph.t0;
      if (e < .32) hero.setLevel(1 - ease(e / .32) * .9);
      else {
        if (hero.world !== worlds[morph.to]) { wi = morph.to; hero.world = worlds[wi]; hero.paint(); hero.drawn = ""; burst = 1; }
        const f = clamp((e - .32) / .7); hero.setLevel(.1 + ease(f) * .9);
        if (f >= 1) morph = null;
      }
      spin = morph ? ease(clamp(e / 1.02)) * TAU : 0;
    }
    burst = Math.max(0, burst - dt * .8);

    // hero bottle
    const bs = cur.bottle;
    hero.holder.visible = bs > .01;
    hero.holder.scale.setScalar(Math.max(.001, bs));
    hero.holder.rotation.y = spin + Math.sin(T * .35) * .18 * motion + look[0] * .25;
    hero.holder.rotation.z = Math.sin(T * .5) * .02 * motion;
    hero.holder.position.y = Math.sin(T * .8) * .06 * motion;

    // bubbles
    const lvlTop = lerp(LIQ_MIN, LIQ_FULL, hero.level) - .1;
    bub.forEach((b, i) => {
      b.y += dt * b.v * (1 + burst * 3) * (motion || .0001);
      if (b.y > lvlTop) b.y = .1;
      const r = Math.min(b.r, radiusAt(b.y) - .12);
      tmp.position.set(Math.sin(b.a + T * .2) * r, b.y, Math.cos(b.a + T * .2) * r);
      tmp.scale.setScalar(b.s * (1 + burst * .6)); tmp.rotation.set(0, 0, 0); tmp.updateMatrix();
      bubbles.setMatrixAt(i, tmp.matrix);
    });
    bubbles.instanceMatrix.needsUpdate = true;

    // lineup
    const L = cur.lineup;
    lineGroup.visible = L > .01;
    if (line.length) line.forEach((b, i) => {
      const n = line.length, x = (i - (n - 1) / 2) * cur.lineGap, z = -Math.abs(i - (n - 1) / 2) * .55;
      b.holder.position.set(x, -.9 + Math.sin(T * .9 + i) * .05 * motion, z);
      b.holder.scale.setScalar(Math.max(.001, .62 * L));
      b.holder.rotation.y = -x * .07 + Math.sin(T * .4 + i * .8) * .15 * motion;
    });

    // islands
    const n = islands.length;
    islands.forEach((is, i) => {
      let x, y, z, s = cur.islandS;
      if (L > .5 && line.length) {
        const lx = (i - (n - 1) / 2) * cur.lineGap, lz = -Math.abs(i - (n - 1) / 2) * .55;
        x = lx; y = 2.45 + Math.sin(T * .7 + i * 1.3) * .12 * motion; z = lz - .5; s *= 1.2;
      } else if (cur.solo > .5) {
        // one world at a time: the current flavor's island floats behind the bottle
        const f = focusIdx === i;
        x = 1.8; y = 1.5 + Math.sin(T * .6) * .14 * motion; z = -3; s *= f ? 2.1 : 0;
      } else {
        const a = ringA + i * TAU / n;
        const rx = Math.sin(a) * cur.ringR, rz = Math.cos(a) * cur.ringR, ry = cur.ringY + Math.sin(T * .6 + i * 1.7) * .16 * motion;
        const ct = Math.cos(cur.ringTilt), st = Math.sin(cur.ringTilt);
        x = rx; y = ry * ct - rz * st; z = ry * st + rz * ct;
        const f = focusIdx === i ? 1 : 0;
        s *= 1 + cur.focus * (f ? .55 : -.3);
        if (f && cur.focus > .05) { z += cur.focus * 1.2; y += cur.focus * .3; }
      }
      is.h.position.set(x, y, z);
      is.s = lerp(is.s, is.loaded ? s : 0, snap ? 1 : 1 - Math.exp(-dt * 3));
      is.h.scale.setScalar(Math.max(.001, is.s));
      is.h.rotation.y = T * .12 * motion + i * 1.1;
      is.h.visible = is.s > .01;
    });

    // Flavor Factory spheres: orbit, or the logo "constellation"
    spheres.forEach((sp, k) => {
      const w = (.22 + k * .06) * (k % 2 ? -1 : 1), a = T * w * motion + k * 1.26;
      const R = cur.sphR * (.92 + k * .09);
      const ox = Math.sin(a) * R, oz = Math.cos(a) * R, oy = -1.5 + k * .78 + Math.sin(T * .9 + k) * .12 * motion;
      const cx = 1.75 + (sp.at[0] - 972) / 62, cy = 2.1 - (sp.at[1] - 128) / 62, cz = .9 + k * .05;
      const m = cur.sphMix;
      if (L > .5) {
        const side = k < 2 ? -1 : 1, j = k < 2 ? k : k - 2;
        sp.p.set(side * (cur.sphR - j * .7), 2.6 - j * 1.5 - (k < 2 ? .6 : 0) + Math.sin(T * .8 + k) * .15 * motion, -1.2 - j * .4);
      } else sp.p.set(lerp(ox, cx, m), lerp(oy, cy + Math.sin(T * .8 + k) * .06 * motion, m), lerp(oz, cz, m));
      sp.m.position.copy(sp.p);
      sp.m.scale.setScalar(Math.max(.001, sp.s * cur.sphS));
    });

    // mint sprigs
    mints.forEach((mm, i) => {
      const a = T * .13 * motion + i * TAU / mints.length, R = 3 + (i % 3) * .5;
      mm.h.position.set(Math.sin(a) * R, -1.8 + (i % 4) * 1.15 + Math.sin(T * .7 + i) * .2 * motion, Math.cos(a) * R * .7 - .5);
      mm.h.rotation.set(T * .3 * motion + i, T * .2 * motion + i * 2, Math.sin(T * .5 + i) * .6);
      mm.h.scale.setScalar(Math.max(.001, cur.mint * (.8 + (i % 3) * .15)));
      mm.h.visible = cur.mint > .02;
    });

    // droplets
    drp.forEach((d, i) => {
      const a = d.a + T * d.w * motion;
      tmp.position.set(Math.sin(a) * d.r, d.y + Math.sin(T * .6 + i) * .2 * motion, Math.cos(a) * d.r * .8 - .4);
      tmp.scale.setScalar(d.s * cur.drops); tmp.updateMatrix(); drops.setMatrixAt(i, tmp.matrix);
    });
    drops.instanceMatrix.needsUpdate = true;
    drops.visible = cur.drops > .02;
    snap = false;
  }

  /* ---- loop */
  let frames = 0;
  function frame(now) {
    raf = 0; frames++;
    const dt = last ? Math.min(.05, (now - last) / 1000) : .016; last = now;
    if (!reduced) t += dt;
    update(dt);
    renderer.render(scene, camera);
    if (dirty > 0) dirty--;
    if (running && visible && (!reduced || dirty > 0 || morph)) raf = requestAnimationFrame(frame);
  }
  function wake() { if (running && visible && !raf) { last = 0; raf = requestAnimationFrame(frame); } }
  function start() { running = true; wake(); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  const io = window.IntersectionObserver ? new IntersectionObserver(es => { visible = es[es.length - 1].isIntersecting && !document.hidden; if (visible) wake(); }, { rootMargin: "160px" }) : null;
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; if (visible) wake(); });
  if (!opts.static) window.addEventListener("pointermove", e => { pointer[0] = (e.clientX / innerWidth) * 2 - 1; pointer[1] = (e.clientY / innerHeight) * 2 - 1; if (!reduced) wake(); }, { passive: true });
  canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); stop(); });

  function cycle(ms) {
    clearInterval(cycleTimer);
    if (ms && !reduced) cycleTimer = setInterval(() => { if (visible) setWorld(wi + 1); }, ms);
  }

  function renderNow() { snap = true; update(.016); renderer.render(scene, camera); }
  function snapshot(type = "image/jpeg", q = .9) { renderNow(); return renderer.domElement.toDataURL(type, q); }

  canvas.classList.add("lab3d");
  setPreset(opts.preset || "hero", { instant: true });
  setWorld(opts.world || 0, { instant: true });
  if (opts.autostart !== false) start();

  return {
    canvas, ready, attach, setPreset, setWorld, setProgress, cycle, start, stop, renderNow, snapshot, resize,
    get world() { return wi; }, get preset() { return presetName; }, worlds, scene, camera, islands, get state() { return { frames, running, visible, raf: !!raf, dirty, reduced }; }
  };
}
