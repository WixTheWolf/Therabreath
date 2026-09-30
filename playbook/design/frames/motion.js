/*
  Motion tests for the style frames. motion.html?m=<arrival|gap>&d=<a|b>
  window.renderFrame(i) draws frame i deterministically (30 fps) so a capture script can step through it.
*/
import { createLight } from './light.js';

const q = new URLSearchParams(location.search);
const M = q.get('m') || 'arrival';
const D = q.get('d') === 'b' ? 'b' : 'a';
const FPS = 24;
document.documentElement.dataset.dir = D;
const stage = document.getElementById('stage');
const add = (html, parent = stage) => { const t = document.createElement('template'); t.innerHTML = html.trim(); const el = t.content.firstElementChild; parent.appendChild(el); return el; };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

function canvas(w, h) {
  const c = document.createElement('canvas'); c.className = 'gl'; c.width = w; c.height = h; c.style.width = '1920px'; c.style.height = '1080px';
  stage.appendChild(c); return c;
}

async function setupArrival() {
  stage.classList.add('arrival');
  const cam = { pos: [0, 0.55, 8.6], target: [0, -0.45, 0], fov: 26, shift: [0.30, 0.02] };
  const L = createLight(canvas(1280, 720), { scene: 'drop', theme: D, camera: cam });
  const layer = add('<div class="layer"></div>');
  const copy = add(`<div class="copy">
      <div class="kicker">Welcome. We start at 10:00.</div>
      <h1 class="h-hero">The Flavor<br>Playbook</h1>
      <div class="sub">Where fresh goes next.</div>
      <div class="meta">TheraBreath × The Flavor Factory | November 9, 2026</div>
    </div>`);
  const qr = await fetch('qr.svg').then((r) => r.text());
  add(`<div class="join"><div class="qr">${qr}</div><div><h3>Join the session</h3><p>Point your camera here. First name only.</p><code>TB 1109</code></div></div>`);
  const pres = add(`<div class="presence"><div class="count">0</div><div class="lbl">In the room</div></div>`);
  const names = ['Ross', 'Dan', 'Alex', 'Ryan', 'Matt'];
  const bubbles = names.map((n, k) => ({
    n, spawn: 0.6 + k * 1.15, x0: [-0.18, 0.2, -0.08, 0.12, -0.02][k], z: 0.3, r: [0.07, 0.06, 0.055, 0.05, 0.06][k],
    el: add('<i class="bubble"></i>', layer), lab: add(`<span class="bname">${n}</span>`, layer), sp: add('<i class="spark" style="opacity:0"></i>', layer),
  }));
  const px = 1080 / 2 / Math.tan(13 * Math.PI / 180) / 8.6;
  return (i) => {
    const t = i / FPS;
    L.render(t, { rot: 0.6 + t * 0.22, strips: 6 });
    copy.style.opacity = smooth(0, 0.8, t);
    let joined = 0;
    for (const b of bubbles) {
      const a = t - b.spawn;
      if (a < 0) { b.el.style.opacity = 0; b.lab.style.opacity = 0; b.sp.style.opacity = 0; continue; }
      joined++;
      const life = 6.2;
      const u = clamp(a / life);
      const y = -0.88 + 1.55 * (u * (0.6 + 0.4 * u));
      const narrow = clamp((0.78 - y) / 1.1, 0.12, 1);
      const x = b.x0 * narrow + Math.sin(a * 1.7 + b.x0 * 9) * 0.035 * narrow;
      const [sx, sy] = L.project([x, y, b.z * narrow]);
      const r = b.r * px * (1 - 0.35 * u) * smooth(0, 0.35, a);
      const fadeTop = 1 - smooth(0.78, 0.98, u);
      b.el.style.cssText = `left:${sx}px;top:${sy}px;width:${r * 2}px;height:${r * 2}px;opacity:${fadeTop}`;
      b.lab.style.cssText = `left:${sx + r + 12}px;top:${sy}px;opacity:${smooth(0, 0.4, a) * (1 - smooth(0.7, 0.95, u))}`;
      const burst = smooth(0.8, 0.9, u) * (1 - smooth(0.92, 1.0, u));
      b.sp.style.cssText = `left:${sx}px;top:${sy}px;opacity:${burst};transform:translate(-50%,-50%) scale(${0.6 + burst})`;
    }
    pres.firstElementChild.textContent = String(joined);
  };
}

async function setupGap() {
  stage.classList.add('gap');
  const cam = { pos: [0, 1.3, 10.8], target: [0, 0.98, 0], fov: 24, shift: [0.36, 0.0] };
  const L = createLight(canvas(1280, 720), { scene: 'glasses', theme: D, camera: cam });
  const CH = ['Signals', 'Territories', 'Concepts', 'Pipeline', 'Flavor Code'];
  add(`<div class="chrome-top"><div class="brand"><i></i>The Flavor Playbook</div><div class="act">Act I <b>The Signals</b></div><div class="live">10:17</div></div>`);
  add(`<div class="progress">${CH.map((c, i) => `<div class="${i === 0 ? 'on' : ''}" style="--p:${i === 0 ? 55 : 0}%"><span>0${i + 1}</span>${c}</div>`).join('')}</div>`);
  const copy = add(`<div class="copy">
      <div class="kicker">The gap</div>
      <h1 class="h-1"><em>86</em> of every 100 US households have not met TheraBreath yet.</h1>
      <div class="second">Flavor is how we introduce ourselves.</div>
      <div class="src">Household penetration: TheraBreath 14%, mouthwash category 65%.<br>Source: Church &amp; Dwight Q2 2026 earnings call, July 31, 2026.</div>
    </div>`);
  const h1 = copy.querySelector('.h-1'), second = copy.querySelector('.second'), src = copy.querySelector('.src'), kick = copy.querySelector('.kicker');
  const [x0, y0] = L.project([-0.95, 0, 0.9]);
  const [x1, y1] = L.project([0.95, 0, 0.9]);
  const l0 = add(`<div class="glabel" style="left:${x0}px;top:${y0 + 20}px"><div class="num">0<sup>%</sup></div><div class="who">Mouthwash category</div></div>`);
  const l1 = add(`<div class="glabel" style="left:${x1}px;top:${y1 + 20}px"><div class="num">0<sup>%</sup></div><div class="who">TheraBreath</div></div>`);
  const [tx, ty] = L.project([0.95 + 0.66, 1.55, 0]);
  const tag = add(`<div class="tag86" style="left:${tx + 10}px;top:${ty}px">The 86%</div>`);
  return (i) => {
    const t = i / FPS;
    const f0 = 0.65 * ease((t - 0.3) / 2.6), f1 = 0.14 * ease((t - 0.3) / 2.6);
    const glow = smooth(3.0, 4.6, t);
    L.render(1.5 + t * 0.9, { fill: [Math.max(f0, 0.001), Math.max(f1, 0.001)], glow, strips: 6 });
    l0.firstElementChild.firstChild.nodeValue = String(Math.round(f0 * 100));
    l1.firstElementChild.firstChild.nodeValue = String(Math.round(f1 * 100));
    kick.style.opacity = smooth(0.2, 0.9, t);
    h1.style.opacity = smooth(3.4, 4.4, t); h1.style.transform = `translateY(${(1 - smooth(3.4, 4.4, t)) * 18}px)`;
    second.style.opacity = smooth(4.8, 5.6, t);
    src.style.opacity = smooth(5.2, 6.0, t);
    tag.style.opacity = smooth(4.0, 4.8, t);
  };
}

(async () => {
  try {
    await document.fonts.ready;
    const draw = await (M === 'gap' ? setupGap() : setupArrival());
    window.renderFrame = (i) => { draw(i); return new Promise((r) => requestAnimationFrame(() => r(true))); };
    window.__done = { ok: true };
  } catch (e) { window.__done = { err: String(e && e.stack || e) }; }
})();
