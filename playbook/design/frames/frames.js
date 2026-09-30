/*
  The Flavor Playbook: style frames.
  index.html?f=<arrival|gap|map|terr|room|pb>&d=<a|b>&s=<render scale>
  Direction A "Laboratory Light", Direction B "After Hours". Same scenes, same structure, different light.
*/
import { createLight } from './light.js';

const q = new URLSearchParams(location.search);
const F = q.get('f') || 'arrival';
const D = q.get('d') === 'b' ? 'b' : 'a';
const S = Math.max(1, +(q.get('s') || 1));
document.documentElement.dataset.dir = D;
const stage = document.getElementById('stage');
const add = (html, parent = stage) => { const t = document.createElement('template'); t.innerHTML = html.trim(); const el = t.content.firstElementChild; parent.appendChild(el); return el; };

const CHAPTERS = ['Signals', 'Territories', 'Concepts', 'Pipeline', 'Flavor Code'];
function chrome(act, chapter, pct, clock) {
  add(`<div class="chrome-top"><div class="brand"><i></i>The Flavor Playbook</div><div class="act">${act}</div><div class="live">${clock}</div></div>`);
  add(`<div class="progress">${CHAPTERS.map((c, i) => `<div class="${i === chapter ? 'on' : ''}" style="--p:${i < chapter ? 100 : i === chapter ? pct : 0}%"><span>0${i + 1}</span>${c}</div>`).join('')}</div>`);
}

function glCanvas(cls, w, h, cfg, time, opts, parent = stage) {
  const c = document.createElement('canvas');
  c.className = cls; c.width = Math.round(w * S); c.height = Math.round(h * S);
  c.style.width = w + 'px'; c.style.height = h + 'px';
  parent.appendChild(c);
  const L = createLight(c, cfg);
  L.render(time, opts);
  return L;
}
const qrSvg = () => fetch('qr.svg').then((r) => r.text());
const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

/* 1. ARRIVAL: the clear drop, names rising inside it as people join */
async function arrival() {
  stage.classList.add('arrival');
  const cam = { pos: [0, 0.55, 8.6], target: [0, -0.45, 0], fov: 26, shift: [0.30, 0.02] };
  const L = glCanvas('gl', 1920, 1080, { scene: 'drop', theme: D, camera: cam }, 2.4, { rot: 0.9 });
  const layer = add('<div class="layer"></div>');
  const people = [
    { n: 'Ross', p: [-0.20, -0.62, 0.34], r: 0.070, note: 'just joined' },
    { n: 'Dan', p: [0.22, -0.30, 0.30], r: 0.060 },
    { n: 'Alex', p: [-0.14, 0.02, 0.30], r: 0.050 },
    { n: 'Ryan', p: [0.06, 0.28, 0.24], r: 0.040, left: true },
  ];
  const px = 1080 / 2 / Math.tan(13 * Math.PI / 180) / 8.6;
  for (const b of people) {
    const [x, y] = L.project(b.p);
    const r = b.r * px;
    add(`<i class="bubble" style="left:${x}px;top:${y}px;width:${r * 2}px;height:${r * 2}px"></i>`, layer);
    const lx = b.left ? x - r - 12 : x + r + 12;
    add(`<span class="bname" style="left:${lx}px;top:${y}px;${b.left ? 'transform:translate(-100%,-50%)' : ''}">${b.n}${b.note ? `<small>${b.note}</small>` : ''}</span>`, layer);
  }
  const [sx, sy] = L.project([0.0, 0.66, 0.12]);
  add(`<i class="spark" style="left:${sx}px;top:${sy}px"></i>`, layer);
  add(`<span class="bname" style="left:${sx - 24}px;top:${sy}px;opacity:.6;transform:translate(-100%,-50%)">Matt</span>`, layer);
  add(`<div class="copy">
      <div class="kicker">Welcome. We start at 10:00.</div>
      <h1 class="h-hero">The Flavor<br>Playbook</h1>
      <div class="sub">Where fresh goes next.</div>
      <div class="meta">TheraBreath × The Flavor Factory | November 9, 2026</div>
    </div>`);
  const qr = await qrSvg();
  add(`<div class="join"><div class="qr">${qr}</div><div><h3>Join the session</h3><p>Point your camera here. First name only.</p><code>TB 1109</code></div></div>`);
  add(`<div class="presence"><div class="count">5</div><div class="lbl">In the room</div></div>`);
}

/* 2. THE GAP: 65 vs 14, and the empty space holds the spectrum */
async function gap() {
  stage.classList.add('gap');
  const cam = { pos: [0, 1.3, 10.8], target: [0, 0.98, 0], fov: 24, shift: [0.36, 0.0] };
  const L = glCanvas('gl', 1920, 1080, { scene: 'glasses', theme: D, camera: cam }, 3.1, { fill: [0.65, 0.14] });
  chrome('Act I <b>The Signals</b>', 0, 55, '10:17');
  add(`<div class="copy">
      <div class="kicker">The gap</div>
      <h1 class="h-1"><em>86</em> of every 100 US households have not met TheraBreath yet.</h1>
      <div class="second">Flavor is how we introduce ourselves.</div>
      <div class="src">Household penetration: TheraBreath 14%, mouthwash category 65%.<br>Source: Church &amp; Dwight Q2 2026 earnings call, July 31, 2026.</div>
    </div>`);
  const [x0, y0] = L.project([-0.95, 0, 0.9]);
  const [x1, y1] = L.project([0.95, 0, 0.9]);
  add(`<div class="glabel" style="left:${x0}px;top:${y0 + 20}px"><div class="num">65<sup>%</sup></div><div class="who">Mouthwash category</div></div>`);
  add(`<div class="glabel" style="left:${x1}px;top:${y1 + 20}px"><div class="num">14<sup>%</sup></div><div class="who">TheraBreath</div></div>`);
  const [tx, ty] = L.project([0.95 + 0.66, 1.55, 0]);
  add(`<div class="tag86" style="left:${tx + 10}px;top:${ty}px">The 86%</div>`);
}

/* 3. THE MAP: intensity x character, the glowing quadrant */
async function map() {
  stage.classList.add('map');
  chrome('Act III <b>The Territory Flight</b>', 1, 12, '10:41');
  add(`<div class="copy">
      <div class="kicker">Where flavor can go</div>
      <h2 class="h-2">We have mastered mint.<br><span class="it">The rest of the map is open.</span></h2>
      <p class="body">Eleven adult rinse flavors, all of them mint. Plotted by intensity and by character.</p>
    </div>`);
  add(`<div class="legend">
      <div><i class="l-tb"></i>TheraBreath adult rinse flavors (public portfolio)</div>
      <div><i class="l-cp"></i>Competitor flavors (public)</div>
      <div><i class="l-ws"></i>White space</div>
    </div>`);
  add(`<div class="note src">TFF perspective, illustrative. Positions are The Flavor Factory's read, not panel data.</div>`);
  const W = 1040, H = 780, ml = 110, mb = 90, mt = 30, mr = 30;
  const X = (v) => ml + v * (W - ml - mr), Y = (v) => H - mb - v * (H - mb - mt);
  const tb = [[0.12, 0.74], [0.09, 0.30], [0.21, 0.53], [0.26, 0.61], [0.07, 0.50], [0.14, 0.57], [0.18, 0.47], [0.10, 0.63], [0.29, 0.37], [0.16, 0.43], [0.12, 0.58]];
  const cp = [[0.07, 0.91], [0.13, 0.86], [0.20, 0.81], [0.09, 0.12], [0.55, 0.56], [0.47, 0.61]];
  const dark = D === 'b';
  const fg = dark ? '240,238,233' : '11,27,43';
  const svg = `<svg class="plot" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <defs>
      <radialGradient id="ws" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="${dark ? '#FFFFFF' : '#FFFFFF'}" stop-opacity="${dark ? .30 : .95}"/>
        <stop offset=".55" stop-color="${dark ? '#8FE0F0' : '#FFFFFF'}" stop-opacity="${dark ? .10 : .5}"/>
        <stop offset="1" stop-color="${dark ? '#8FE0F0' : '#FFFFFF'}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="spec" x1="0" y1="0" x2="1" y2="1">
        ${(dark ? ['#FF7A7A', '#FFC861', '#6EE7A8', '#6FD3F5', '#9C8CFF', '#FF8AC8'] : ['#FFB8B8', '#FFE3A3', '#C6F2C9', '#BDEBF4', '#D5C9FF', '#FFC4E1']).map((c, i) => `<stop offset="${[0, .22, .45, .66, .86, 1][i]}" stop-color="${c}"/>`).join('')}
      </linearGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="42"/></filter>
      <filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
      <clipPath id="plotclip"><rect x="${X(0)}" y="${Y(1)}" width="${X(1) - X(0)}" height="${Y(0) - Y(1)}"/></clipPath>
    </defs>
    <g clip-path="url(#plotclip)">
      <ellipse cx="${X(0.76)}" cy="${Y(0.25)}" rx="300" ry="230" fill="url(#spec)" opacity="${dark ? .46 : .78}" filter="url(#blur)" style="mix-blend-mode:${dark ? 'screen' : 'normal'}"/>
      <ellipse cx="${X(0.74)}" cy="${Y(0.27)}" rx="250" ry="190" fill="url(#ws)"/>
    </g>
    <g stroke="rgba(${fg},.10)" stroke-width="1">
      ${[0.25, 0.5, 0.75].map((v) => `<line x1="${X(v)}" y1="${Y(0)}" x2="${X(v)}" y2="${Y(1)}"/><line x1="${X(0)}" y1="${Y(v)}" x2="${X(1)}" y2="${Y(v)}"/>`).join('')}
    </g>
    <g stroke="rgba(${fg},.55)" stroke-width="1.4">
      <line x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(0)}"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(1)}"/>
    </g>
    <g font-family="Geist Mono" font-size="16" letter-spacing="2.4" fill="rgba(${fg},.62)">
      <text x="${X(0)}" y="${Y(0) + 40}">CLASSIC MINT</text>
      <text x="${X(1)}" y="${Y(0) + 40}" text-anchor="end">ADVENTUROUS</text>
      <text x="${(X(0) + X(1)) / 2}" y="${Y(0) + 72}" text-anchor="middle" fill="rgba(${fg},.9)">CHARACTER</text>
      <text transform="translate(${X(0) - 26} ${Y(0)}) rotate(-90)">EXTRA MILD</text>
      <text transform="translate(${X(0) - 26} ${Y(1)}) rotate(-90)" text-anchor="end">INTENSE</text>
      <text transform="translate(${X(0) - 62} ${(Y(0) + Y(1)) / 2}) rotate(-90)" text-anchor="middle" fill="rgba(${fg},.9)">INTENSITY</text>
    </g>
    ${cp.map(([a, b]) => `<circle cx="${X(a)}" cy="${Y(b)}" r="11" fill="none" stroke="rgba(${fg},.45)" stroke-width="2"/>`).join('')}
    ${tb.map(([a, b]) => `<circle cx="${X(a)}" cy="${Y(b)}" r="16" fill="${dark ? 'rgba(143,224,240,.22)' : 'rgba(108,199,221,.28)'}" filter="url(#soft)"/><circle cx="${X(a)}" cy="${Y(b)}" r="9" fill="${dark ? '#9FE6F4' : '#4FB3CC'}"/>`).join('')}
    <g font-family="Geist" font-size="20" fill="rgba(${fg},.82)">
      <line x1="${X(0.30)}" y1="${Y(0.66)}" x2="${X(0.40)}" y2="${Y(0.76)}" stroke="rgba(${fg},.4)"/>
      <text x="${X(0.41)}" y="${Y(0.77) + 6}">11 adult rinse flavors. All mint.</text>
    </g>
    <text x="${X(0.74)}" y="${Y(0.27) - 6}" text-anchor="middle" font-family="Fraunces" font-style="italic" font-weight="300" font-size="44" style="font-variation-settings:'opsz' 144,'SOFT' 100,'WONK' 1" fill="rgba(${fg},.95)">This is where</text>
    <text x="${X(0.74)}" y="${Y(0.27) + 46}" text-anchor="middle" font-family="Fraunces" font-style="italic" font-weight="300" font-size="44" style="font-variation-settings:'opsz' 144,'SOFT' 100,'WONK' 1" fill="rgba(${fg},.95)">the next 86% live.</text>
  </svg>`;
  add(svg);
}

/* 4. TERRITORY WORLD: Warm Meets Cool */
async function terr() {
  stage.classList.add('terr');
  const img = D === 'b' ? '../img/anise-dark.jpg' : '../img/anise-light.jpg';
  await loadImg(img);
  add(`<div class="bgimg" style="background-image:url(${img})"></div>`);
  add('<div class="veil"></div>');
  chrome('Act III <b>The Territory Flight</b>', 1, 48, '10:52');
  add(`<div class="copy">
      <div class="kicker">Territory 04 <span class="badge">Chemistry fit: needs engineering</span></div>
      <h1 class="title"><span class="warm">Warm</span> meets <span class="cool">Cool</span></h1>
      <p class="promise">The contrast of spice and frost. A seasonal signature TheraBreath can own.</p>
      <dl class="facts">
        <dt>Flavors</dt><dd><div class="chips"><span>Frosted Star Anise Mint</span><span>Cinnamon Frost</span><span>Clove Wintergreen</span><span>Chai Spice Mint</span><span>Ginger Spearmint</span></div></dd>
        <dt>Sensation</dt><dd>A gentle warm glow that resolves into cooling. A long, cozy linger.</dd>
        <dt>For</dt><dd>Adventurous adults. Fall and winter limited editions, holiday social moments.</dd>
      </dl>
    </div>`);
  add('<div class="src">Why now: Frosted Star Anise, 2026 Flavor of the Year (dsm-firmenich, December 2025). Chemistry fit to be confirmed by Alex.</div>');
}

/* 5. ROOM: every phone in the room */
async function room() {
  stage.classList.add('room');
  chrome('Act III <b>The Territory Flight</b>', 1, 70, '10:58');
  add(`<div class="copy">
      <div class="kicker">Room, on every phone</div>
      <h2 class="h-2">Scan once.<br><span class="it">Then just follow the screen.</span></h2>
      <p class="body">No app, no login beyond a first name. The phone always mirrors the scene.</p>
      <ul><li>Droplet sliders that fill as you rate</li><li>Chips that pop like bubbles</li><li>A frost ripple when you submit</li><li>Large text and reduced motion respected</li></ul>
    </div>`);
  const phones = add('<div class="phones"></div>');
  const sb = '<div class="isl"></div><div class="sb"><span>10:58</span><span>5G</span></div>';
  add(`<div class="phone"><div class="scr">${sb}<div class="pc">
      <div class="state">Joining</div>
      <h4>Welcome.</h4><p>The Flavor Playbook, November 9. We start at 10:00.</p>
      <div class="field"><small>First name</small><b>Ross</b></div>
      <div class="lbl">Your role (optional)</div>
      <div class="chips"><span class="on">Brand</span><span>Innovation</span><span>R&amp;D</span><span>Insights</span><span>Sensory</span><span>Regulatory</span><span>Other</span></div>
      <div class="cta"><i></i>Join the session</div>
    </div></div><div class="pcap">01 Join</div></div>`, phones);
  const rate = (label, n, half) => `<div class="rate"><div class="rl"><span>${label}</span><b>${n}${half ? '.5' : ''} / 5</b></div><div class="drops">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : (half && i === n + 1 ? 'half' : '')}"></i>`).join('')}</div></div>`;
  add(`<div class="phone"><div class="scr">${sb}<div class="pc">
      <div class="state">Taste now</div>
      <div class="code">B</div>
      <h4>Taste Sample B</h4>
      ${rate('Appeal', 4)}${rate('Feels like TheraBreath', 3, true)}${rate('Newness', 5)}
      <div class="lbl">Who is this for?</div>
      <div class="chips"><span class="on">Gen Z</span><span class="on">Mild-seekers</span><span>Families</span><span>55+</span><span>Dry mouth</span><span>International</span><span>Me</span></div>
      <div class="cta"><i></i>Send rating</div>
    </div></div><div class="pcap">02 Taste</div></div>`, phones);
  const sigs = ['Mild is the new mainstream', 'Warmth meets freshness', 'Fruit grows up', 'Botanicals and rituals', 'Edible allure', 'Sensation is proof of efficacy', 'New mouths, new needs'];
  const on = [0, 2, 6];
  add(`<div class="phone"><div class="scr">${sb}<div class="pc">
      <div class="state">Vote now</div>
      <h4>Pick the three signals that matter most.</h4>
      <div class="meter"><span>3 of 3 chosen</span><span class="pips"><i class="on"></i><i class="on"></i><i class="on"></i></span></div>
      ${sigs.map((s, i) => `<div class="sig ${on.includes(i) ? 'on' : ''}"><span class="n">0${i + 1}</span><span class="t">${s}</span><span class="ck"></span></div>`).join('')}
      <div class="cta"><i></i>Lock in my three</div>
    </div></div><div class="pcap">03 Vote</div></div>`, phones);
}

/* 6. PLAYBOOK: the document the room just wrote */
async function pb() {
  stage.classList.add('pb');
  chrome('Close <b>The Playbook you just built</b>', 4, 100, '11:56');
  add(`<div class="copy">
      <div class="kicker">11:55, assembled live</div>
      <h2 class="h-2">The Playbook<br><span class="it">you just built.</span></h2>
      <p class="body">Every vote, rating, concept and placement from this morning, set as a designed book. Your names on the cover. A polished PDF by 12:05.</p>
    </div>`);
  const cur = await loadImg('../img/currant.jpg');
  const s1 = add(`<div class="book spread" style="left:606px;top:334px;transform:rotate(-4deg)">
      <div class="pg"><div class="pgk">Chapter 02 · Territories</div><div class="pgh">Where flavor can go</div>
        <div class="pgb">Ranked by the room's chip votes. Rehearsal data shown.</div>
        <div class="rank">
          ${[['Warm Meets Cool', 88, '#D98E3A'], ['Fruit, Grown Up', 74, '#E0407B'], ['The Botanical Garden', 61, '#5E8C7A'], ['Mint, Mastered', 52, '#6CC7DD'], ['Passport', 40, '#8C7BD9'], ['The Mint Ladder', 31, '#F2677B'], ['Dessert, Then Fresh', 22, '#B08A6A']].map(([n, v, c], i) => `<div><span>0${i + 1}</span><span>${n}</span><b></b><div class="bar"><i style="width:${v}%;background:${c}"></i></div></div>`).join('')}
        </div><div class="pgnum">14</div></div>
      <div class="pg"><div class="pgk">Blind tasting · heat map</div><div class="pgh">What the room tasted</div>
        <div class="pgb">Samples A to D on three scales. Rehearsal data shown.</div>
        <div class="heat"><span></span><span>Appeal</span><span>Feels TB</span><span>Newness</span>
          ${[['A', [0.9, 0.7, 0.8]], ['B', [0.8, 0.6, 0.9]], ['C', [0.7, 0.9, 0.5]], ['D', [0.6, 1.0, 0.3]]].map(([k, v]) => `<span>Sample ${k}</span>${v.map((x) => `<i style="background:rgba(46,143,168,${0.15 + x * 0.75})"></i>`).join('')}`).join('')}
        </div><div class="pgnum">15</div></div>
    </div>`);
  const s2 = add(`<div class="book spread" style="left:800px;top:244px;transform:rotate(3deg)">
      <div class="pg"><div class="ccard" style="background:#F1E3D2">
        <span class="concept-tag">Concept · Now, 2027</span><div class="cn">Frosted Star Anise Mint</div>
        <dl><dt>Territory</dt><dd>Warm Meets Cool</dd><dt>For</dt><dd>Adventurous adults, holiday social season</dd><dt>Format</dt><dd>Rinse and sachet</dd><dt>Incremental</dt><dd>Seasonal news that earns a display</dd></dl>
        <svg class="bottle" viewBox="0 0 64 120"><rect x="22" y="2" width="20" height="16" rx="3" fill="#F5821F"/><path d="M20 18h24v8c10 6 14 14 14 24v58c0 5-4 10-10 10H16c-6 0-10-5-10-10V50c0-10 4-18 14-24z" fill="rgba(255,255,255,.72)" stroke="rgba(11,27,43,.25)"/><text x="32" y="86" text-anchor="middle" font-family="Geist Mono" font-size="6" letter-spacing="1" fill="rgba(11,27,43,.5)">CONCEPT</text></svg>
      </div><div class="pgnum">22</div></div>
      <div class="pg"><div class="ccard" style="background:#EDE4EC">
        <span class="concept-tag">Concept · Now, 2027</span><div class="cn">Black Currant Frost</div>
        <dl><dt>Territory</dt><dd>Fruit, Grown Up</dd><dt>For</dt><dd>Mild-seekers and Gen Z</dd><dt>Format</dt><dd>Rinse</dd><dt>Incremental</dt><dd>A fruit mint made for adults</dd></dl>
        ${cur ? `<div style="margin-top:auto;height:210px;border-radius:10px;background:url(../img/currant.jpg) center/cover"></div>` : ''}
      </div><div class="pgnum">23</div></div>
    </div>`);
  const cover = add(`<div class="book cover"><div class="ct">
      <div class="k">TheraBreath × The Flavor Factory</div>
      <h2>The TheraBreath<br>Flavor Playbook</h2>
      <div class="v">v0.1. Co-authored November 9, 2026.</div>
      <div class="authors"><b>Co-authors</b>Ross, Dan, Matt, Alex, Ryan and everyone in the Darwin room</div>
    </div></div>`);
  const cam = { pos: [0, 0.35, 8.2], target: [0, -0.35, 0], fov: 26, shift: [0, 0.02] };
  const c = document.createElement('canvas');
  c.className = 'gl-cover'; c.width = 580 * S; c.height = 440 * S; c.style.width = '580px'; c.style.height = '440px';
  cover.prepend(c);
  createLight(c, { scene: 'drop', theme: 'a', camera: cam, dropScale: 0.92 }).render(2.4, { rot: 0.9 });
  if (D === 'b') { s1.style.filter = 'brightness(.94)'; s2.style.filter = 'brightness(.97)'; }
}


/* 7. FLAVOR SCHOOL: how cool works (illustrative curves) */
async function cool() {
  stage.classList.add('cool');
  chrome('Act II <b>Flavor School</b>', 1, 20, '10:33');
  add(`<div class="copy">
      <div class="kicker">Flavor School · How cool works</div>
      <h2 class="h-1">Cooling has<br>two jobs.</h2>
      <p class="second">The first impression and the last impression. We design both.</p>
    </div>`);
  add('<div class="src csrc">Illustrative curves for teaching, not measured data. Copy to be confirmed with Alex.</div>');
  const dark = D === 'b';
  const fg = dark ? '240,238,233' : '11,27,43';
  const W = 1080, H = 720, ml = 90, mb = 90, mt = 40, mr = 40;
  const X = (v) => ml + v * (W - ml - mr), Y = (v) => H - mb - v * (H - mb - mt);
  const curves = [
    { id: 'Classic menthol', col: dark ? '#9FE6F4' : '#2E8FA8', w: 3, pts: [[0, .02], [.12, .55], [.25, .95], [.38, .70], [.50, .30], [.62, .08], [.80, .02], [1, .01]], lab: [.27, .97], dash: '' },
    { id: 'Long-lasting cooler', col: dark ? '#C9B8FF' : '#6D5BD0', w: 3, pts: [[0, 0], [.20, .12], [.40, .45], [.55, .60], [.70, .50], [.85, .32], [1, .20]], lab: [.60, .44], dash: '10 8' },
    { id: 'A signature curve', col: dark ? '#FFFFFF' : '#0B1B2B', w: 5, pts: [[0, .02], [.12, .50], [.25, .86], [.40, .74], [.55, .62], [.70, .52], [.85, .42], [1, .32]], lab: [.80, .52], dash: '' },
  ];
  const path = (pts) => {
    const P = pts.map(([a, b]) => [X(a), Y(b)]);
    let d = `M${P[0][0]} ${P[0][1]}`;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
    }
    return d;
  };
  const crystal = (cx, cy, r, o) => {
    let d = '';
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3, ca = Math.cos(a), sa = Math.sin(a);
      d += `M${cx} ${cy}L${cx + ca * r} ${cy + sa * r}`;
      for (const f of [0.45, 0.72]) {
        const bx = cx + ca * r * f, by = cy + sa * r * f, bl = r * 0.28 * (1.1 - f);
        for (const s of [-1, 1]) { const b = a + s * Math.PI / 4; d += `M${bx} ${by}L${bx + Math.cos(b) * bl} ${by + Math.sin(b) * bl}`; }
      }
    }
    return `<path d="${d}" stroke="${dark ? 'rgba(220,246,252,' + o + ')' : 'rgba(46,143,168,' + o + ')'}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`;
  };
  const sig = curves[2].pts;
  let frost = '';
  for (let i = 0; i < 26; i++) {
    const x = 0.06 + i * 0.036;
    let y = 0; for (let k = 0; k < sig.length - 1; k++) if (x >= sig[k][0] && x <= sig[k + 1][0]) { const t = (x - sig[k][0]) / (sig[k + 1][0] - sig[k][0]); y = sig[k][1] + (sig[k + 1][1] - sig[k][1]) * t; }
    const off = ((i * 37) % 11) / 11 - 0.5;
    frost += crystal(X(x), Y(y) - 34 - off * 24, 6 + y * 14, (0.35 + y * 0.6).toFixed(2));
  }
  const ticks = [['1 sec', 0], ['10 sec', .24], ['1 min', .428], ['10 min', .668], ['1 hr', .855], ['4 hr', 1]];
  add(`<svg class="cplot" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <defs><filter id="cglow"><feGaussianBlur stdDeviation="7"/></filter></defs>
    <g stroke="rgba(${fg},.10)">${ticks.map(([, v]) => `<line x1="${X(v)}" y1="${Y(0)}" x2="${X(v)}" y2="${Y(1)}"/>`).join('')}</g>
    <g stroke="rgba(${fg},.55)" stroke-width="1.4"><line x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(0)}"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(1)}"/></g>
    <g font-family="Geist Mono" font-size="16" letter-spacing="2" fill="rgba(${fg},.62)">
      ${ticks.map(([t, v]) => `<text x="${X(v)}" y="${Y(0) + 36}" text-anchor="middle">${t.toUpperCase()}</text>`).join('')}
      <text x="${(X(0) + X(1)) / 2}" y="${Y(0) + 72}" text-anchor="middle" fill="rgba(${fg},.9)">TIME AFTER RINSING</text>
      <text transform="translate(${X(0) - 34} ${(Y(0) + Y(1)) / 2}) rotate(-90)" text-anchor="middle" fill="rgba(${fg},.9)">PERCEIVED COOLING</text>
    </g>
    ${frost}
    ${curves.map((c) => (dark ? `<path d="${path(c.pts)}" stroke="${c.col}" stroke-width="${c.w * 3}" fill="none" opacity=".35" filter="url(#cglow)"/>` : '') + `<path d="${path(c.pts)}" stroke="${c.col}" stroke-width="${c.w}" fill="none" stroke-dasharray="${c.dash}" stroke-linecap="round"/>`).join('')}
    <g font-family="Geist" font-size="22">
      ${curves.map((c) => `<text x="${X(c.lab[0]) + 14}" y="${Y(c.lab[1]) - 14}" fill="${c.col}" font-weight="${c.w > 3 ? 600 : 500}">${c.id}</text>`).join('')}
    </g>
    <g font-family="Geist Mono" font-size="15" letter-spacing="2" fill="rgba(${fg},.55)">
      <text x="${X(0.02)}" y="${Y(0.02) - 18}">FIRST IMPRESSION</text>
      <text x="${X(0.98)}" y="${Y(0.10)}" text-anchor="end">LAST IMPRESSION</text>
    </g>
  </svg>`);
}

const FRAMES = { arrival, gap, map, terr, room, pb, cool };
(async () => {
  try {
    await document.fonts.ready;
    await (FRAMES[F] || arrival)();
    await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    window.__done = { ok: true };
  } catch (e) { window.__done = { err: String(e && e.stack || e) }; }
})();
