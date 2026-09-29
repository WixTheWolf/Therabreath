/* The Future of Freshness: presentation engine, scenes and workshop tools.
   One page, three roles: the display (index.html), a mirrored embed (?embed) and the
   presenter console (?console). Every window on the machine stays in sync through
   BroadcastChannel; workshop answers persist in localStorage. */
(() => {
  "use strict";
  const D = window.FF, MAP = window.FF_MAP, T = D.TERR, ORDER = D.ORDER;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const Q = new URLSearchParams(location.search);
  const EMBED = Q.has("embed"), CONSOLE = Q.has("console");
  const img = (n, sm) => `img/${n}${sm ? "-sm" : ""}.webp`;
  const W = 1920, H = 1080;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ state */
  const KEY = "tb-freshness-v1";
  function blank() {
    const sp = {}; D.SPECTRA.forEach(x => { sp[x.id] = [0, 0, 0, 0, 0]; });
    return { v: 1, stars: {}, spectra: sp, tvotes: {}, mvotes: {}, taste: {}, where: {}, hz: {}, acts: {}, custom: [], notes: {}, t: 0 };
  }
  function normalize(s) { const b = blank(); if (!s || s.v !== 1) return b; const o = Object.assign(b, s); o.spectra = Object.assign(blank().spectra, s.spectra || {}); return o; }
  function load() { try { return normalize(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return blank(); } }
  let S = load();
  const undoStack = [];
  const ME = Math.random().toString(36).slice(2);
  const bc = "BroadcastChannel" in window ? new BroadcastChannel("tb-freshness") : null;
  function save() { S.t = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode: the session still works in memory */ } }
  function send(m) { if (bc) { m.from = ME; bc.postMessage(m); } }
  function mutate(fn, quiet) {
    undoStack.push(JSON.stringify(S)); if (undoStack.length > 120) undoStack.shift();
    fn(S); save(); send({ t: "state", s: S }); refresh();
    if (!quiet) pulse();
  }
  function undo() { const p = undoStack.pop(); if (!p) return toast("Nothing to undo"); S = normalize(JSON.parse(p)); save(); send({ t: "state", s: S }); refresh(); toast("Undone"); }
  if (bc) bc.onmessage = e => {
    const m = e.data || {}; if (m.from === ME) return;
    if (m.t === "state") { S = normalize(m.s); refresh(); }
    else if (m.t === "nav") go(m.i, m.b, { remote: true });
    else if (m.t === "mode") setMode(m.mode, { remote: true });
    else if (m.t === "tasting") setTasting(m.on, { remote: true });
    else if (m.t === "blank") setBlank(m.on, { remote: true });
    else if (m.t === "hello" && !CONSOLE && cur >= 0) send({ t: "nav", i: cur, b: step });
  };
  addEventListener("storage", e => { if (!bc && e.key === KEY && e.newValue) { S = normalize(JSON.parse(e.newValue)); refresh(); } });

  const tot = a => a.reduce((x, y) => x + y, 0);
  const lean = a => { const n = tot(a); return n ? a.reduce((s, c, i) => s + c * (i - 2) / 2, 0) / n : 0; };
  const leans = () => { const L = {}; D.SPECTRA.forEach(x => { L[x.id] = lean(S.spectra[x.id]); }); return L; };
  const votesTotal = () => D.SPECTRA.reduce((n, x) => n + tot(S.spectra[x.id]), 0);
  const ranked = (obj, keys) => keys.map(k => [k, obj[k] || 0]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
  const hzOf = it => S.hz[it.id] || it.h;

  function direction() {
    if (!votesTotal()) return "";
    const L = leans(), w = [];
    D.SPECTRA.forEach(x => {
      const v = L[x.id]; if (!tot(S.spectra[x.id])) return;
      w.push(Math.abs(v) < .18 ? `balanced between ${x.wl} and ${x.wr}` : (v < 0 ? (v < -.55 ? "clearly " : "") + x.wl : (v > .55 ? "clearly " : "") + x.wr));
    });
    if (!w.length) return "";
    const last = w.length > 1 ? w.slice(0, -1).join(", ") + " and " + w[w.length - 1] : w[0];
    return `The next generation of TheraBreath freshness should feel ${last}.`;
  }

  /* ------------------------------------------------------------------ scenes */
  const SC = [];
  const scene = o => { SC.push(o); return o; };
  const K = (t, d = 0, cls = "") => `<div class="k rv ${cls}" style="--d:${d}">${t}</div>`;
  const chipRow = (a, cls = "chips") => `<div class="${cls}">${a.map(x => `<span>${esc(x)}</span>`).join("")}</div>`;
  const tvars = t => `--paper:${t.paper};--ink:${t.ink};--acc:${t.acc};--accInk:${t.accInk};--soft:${t.soft}`;

  /* ---------- the film */
  scene({
    id: "film", ch: 0, tag: "Show", title: "The film", cls: "dark s-film", builds: 1,
    bg: `<video class="film-v" preload="auto" playsinline poster="media/opening-poster.jpg"><source src="media/opening.webm" type="video/webm"><source src="media/opening.mp4" type="video/mp4"></video><div class="film-shade"></div>`,
    html: () => `<div class="film-cue" data-bo="1"><span class="k">TheraBreath × The Flavor Factory</span><b>The Future of Freshness</b><em>Press → to play the film</em></div>`,
    init(el) { this.v = $(".film-v", el); this.v.addEventListener("click", () => { if (this.v.paused) go(cur, 1); else this.v.pause(); }); },
    step(el, b) { const v = this.v; if (!v) return; if (b >= 1 && el.classList.contains("on") && !EMBED) { v.currentTime = 0; v.play().catch(() => { v.muted = true; v.play(); }); } else { v.pause(); if (!b) v.currentTime = 0; } },
    leave() { this.v && this.v.pause(); },
    notes: ["The 30-second opening film. Lights down, press → to play.", "It ends on the title; press → again to continue."]
  });

  /* ---------- prologue */
  scene({
    id: "open", ch: 0, tag: "Teach", title: "The Future of Freshness", cls: "light s-open",
    bg: `<div class="ph" data-src="${img("mint")}" style="--pos:74% 50%"></div><div class="scrim sc-l" style="--sc:#F1F6F8"></div>`,
    html: () => `
      ${K("TheraBreath × The Flavor Factory · Flavor Playbook Workshop", 0, "open-k")}
      <h1 class="open-t rv" style="--d:140">The Future<br>of Freshness</h1>
      <p class="open-sub rv" style="--d:300">A TheraBreath Flavor Playbook</p>
      <div class="open-foot rv" style="--d:480">
        <img src="brand/therabreath-logo.png" alt="TheraBreath" class="lg-tb"><span class="x">×</span><img src="brand/tff-logo.webp" alt="The Flavor Factory" class="lg-tff">
        <span class="k">${esc(D.SESSION.place)} · ${esc(D.SESSION.date)}</span>
      </div>`,
    notes: ["Welcome everyone. This is a working session, not a presentation: by noon we'll have built a flavor playbook together.", "We'll start somewhere very familiar: a mint leaf."]
  });

  scene({
    id: "mint", ch: 0, tag: "Teach", title: "Freshness is evolving", cls: "light s-mint", builds: 2,
    bg: `<div class="mint-bg"></div>`,
    html: () => `
      <h2 class="mint-h h-l rv" data-bo="2">For decades, freshness has meant one thing.</h2>
      <h2 class="mint-h h-l" data-b="2">Freshness is evolving.</h2>
      <div class="mint-word"><span>Mint</span></div>
      <div class="vocab">${D.VOCAB.map((v, i) => `<button class="vw" data-b="1" data-i="${i}" style="left:${v.x}px;top:${v.y}px;font-size:${v.s}px;transition-delay:${i * 45}ms">${esc(v.w)}</button>`).join("")}</div>
      <div class="vdef" role="status"></div>
      <p class="mint-foot" data-b="2">People now understand freshness through a far broader sensory vocabulary. The next era of oral care won't come from another mint. It will come from designing different kinds of freshness for different people, moments and needs.</p>`,
    init(el) {
      el.addEventListener("click", e => {
        const b = e.target.closest(".vw"), def = $(".vdef", el);
        if (!b) { def.classList.remove("show"); $$(".vw", el).forEach(x => x.classList.remove("sel")); return; }
        const v = D.VOCAB[b.dataset.i];
        $$(".vw", el).forEach(x => x.classList.toggle("sel", x === b));
        def.innerHTML = `<b>${esc(v.w)}</b>${esc(v.d)}`;
        const up = v.y > 620; def.classList.toggle("up", up);
        def.style.left = clamp(v.x, 300, W - 300) + "px"; def.style.top = (up ? v.y - v.s * .7 - 14 : v.y + v.s * .7 + 14) + "px";
        def.classList.add("show");
      });
    },
    leave(el) { $(".vdef", el).classList.remove("show"); $$(".vw", el).forEach(x => x.classList.remove("sel")); },
    notes: ["Ask the room: what does 'fresh' mean to you? Most answers will be mint, cold, clean.", "Advance: the vocabulary opens up. Tap any word to define it; tingle, warming contrast and duration usually start a conversation.", "Advance: our central idea. Freshness is evolving, and it can be designed."]
  });

  scene({
    id: "us", ch: 0, tag: "Teach", title: "Science × imagination", cls: "s-us", builds: 1,
    bg: `<div class="us-half us-l"><div class="ph" data-src="${img("bench")}" style="--pos:40% 50%"></div></div><div class="us-half us-r"><div class="ph" data-src="${img("flatlay")}" style="--pos:50% 50%"></div></div>`,
    html: () => `
      <div class="us-col us-sci">${K("Science")}<ul>${D.SCIENCE.map((w, i) => `<li class="rv" style="--d:${180 + i * 60}">${esc(w)}</li>`).join("")}</ul></div>
      <div class="us-mid rv" style="--d:80"><img src="brand/tff-logo.webp" alt="The Flavor Factory"><span>Two sides of every flavor</span></div>
      <div class="us-col us-ima">${K("Imagination")}<ul>${D.IMAGINATION.map((w, i) => `<li class="rv" style="--d:${220 + i * 60}">${esc(w)}</li>`).join("")}</ul></div>
      <p class="us-foot" data-b="1">We read culture like strategists and build flavor like chemists.<br>Designing the next kind of freshness takes both.</p>`,
    notes: ["Who we are in this room: the flavor authority.", "Left: what we understand as formulators. Right: what we understand about people. Every idea today will pass through both."]
  });

  scene({
    id: "questions", ch: 0, tag: "Teach", title: "Four questions", cls: "light s-q",
    html: () => `
      ${K("The brief · four questions from Ross Conroy")}
      <h2 class="h-l rv" style="--d:80">Four questions. Two hours.<br>One playbook, built together.</h2>
      <div class="quads">${[1, 2, 3, 4].map((n, i) => { const c = D.CHAPTERS[n]; return `<div class="q q${n} rv" style="--d:${260 + i * 110}"><span class="qn">${c.n}</span><span class="qt">${c.title}</span><span class="qq">${c.q}</span></div>`; }).join("")}</div>
      <div class="rhythm rv" style="--d:760"><span class="k">How we'll work</span>${D.RHYTHM.map(r => `<b>${r}</b>`).join("<i></i>")}</div>
      <div class="agenda rv" style="--d:860">${D.AGENDA.map(a => `<div><b>${a.t}</b><span>${esc(a.l)}</span></div>`).join("")}</div>`,
    notes: ["These are the four questions Ross gave us. The whole session is built to answer them, in order.", "We'll keep switching between teaching, showing, tasting, discussing and deciding. Nobody lectures for 45 minutes."]
  });

  /* ---------- chapter openers */
  function chapter(n, cls, bg, notes) {
    const c = D.CHAPTERS[n];
    scene({
      id: "ch" + n, ch: n, tag: "Teach", title: `${c.n} · ${c.title}`, cls: "s-ch " + cls, bg, notes,
      html: () => `<div class="ch-n rv">${c.n}</div>${K("Chapter " + c.n, 100, "ch-k")}<h2 class="ch-t rv" style="--d:180">${c.title}</h2><p class="ch-q rv" style="--d:320">${c.q}</p>`
    });
  }
  const waves = () => `<svg class="waves" viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true">${[0, 1, 2, 3, 4, 5].map(i => {
    let d = ""; for (let x = -40; x <= 1960; x += 20) { const y = 560 + Math.sin(x / (170 + i * 36) + i) * (60 + i * 26) + (i - 2.5) * 70; d += (x === -40 ? "M" : "L") + x + " " + y.toFixed(1); }
    return `<path d="${d}" style="--i:${i}"/>`; }).join("")}</svg>`;

  chapter(1, "dark ch-1", `<div class="ch1-bg"></div>${waves()}`, ["Chapter one. Before we talk flavors, we look at what is changing in people's lives, and what that means for oral care."]);

  scene({
    id: "shifts", ch: 1, tag: "Teach", title: "Six shifts", cls: "light s-shifts", builds: 5,
    html: () => `
      ${K("01 · The Signals")}
      <h2 class="h-m rv" style="--d:80">Six shifts are redefining what freshness means.</h2>
      <div class="shifts">${D.SHIFTS.map((s, i) => `<div class="sh ${i ? "" : "rv"}" ${i ? `data-b="${i}"` : 'style="--d:240"'}><span class="sh-a">${esc(s.a)}</span><span class="sh-ar"><i></i></span><span class="sh-b">${esc(s.b)}</span><span class="sh-d">${esc(s.d)}</span></div>`).join("")}</div>`,
    notes: ["Six movements, each from something TheraBreath knows well to something it could own.", "Pause on 'maximum burn → personalized intensity': it challenges the idea that stronger means better."]
  });

  scene({
    id: "signals", ch: 1, tag: "Discuss", title: "Five signals", cls: "light s-sig", builds: 4,
    html: () => `
      ${K("01 · The Signals")}
      <h2 class="h-m rv" style="--d:80">Every signal has to earn its place, from what we see to what TheraBreath could do.</h2>
      <div class="sig-tabs rv" style="--d:200">${D.SIGNALS.map((s, i) => `<button class="st" data-i="${i}"><span class="n">0${i + 1}</span><span class="l">${esc(s.name)}</span><span class="dot" aria-hidden="true"></span></button>`).join("")}</div>
      <div class="chain rv" style="--d:300">
        ${["Signal", "Human need", "Oral-care implication", "TheraBreath opportunity"].map((l, i) => `<div class="cs cs${i}"><div class="cs-k"><i></i>${l}</div><div class="cs-t"></div></div>`).join("")}
      </div>
      <div class="sig-foot rv" style="--d:420"><span class="k">Where we see it</span><span class="sig-seen"></span><button class="sig-star" type="button"><span class="s">☆</span> <span class="t">This matters for TheraBreath</span></button></div>`,
    init(el) {
      $(".sig-tabs", el).addEventListener("click", e => { const b = e.target.closest(".st"); if (b) go(cur, +b.dataset.i); });
      $(".sig-star", el).addEventListener("click", () => { const id = D.SIGNALS[step].id; mutate(s => { s.stars[id] = !s.stars[id]; }); });
    },
    step(el, b) {
      const s = D.SIGNALS[b];
      $$(".st", el).forEach((x, i) => x.classList.toggle("sel", i === b));
      [s.signal, s.need, s.impl, s.opp].forEach((t, i) => { $(".cs" + i + " .cs-t", el).textContent = t; });
      $(".sig-seen", el).textContent = s.seen;
      const ch = $(".chain", el); ch.classList.remove("anim"); void ch.offsetWidth; ch.classList.add("anim");
      this.sync(el);
    },
    sync(el) {
      const s = D.SIGNALS[step] || D.SIGNALS[0];
      $$(".st", el).forEach((x, i) => x.classList.toggle("starred", !!S.stars[D.SIGNALS[i].id]));
      const on = !!S.stars[s.id], b = $(".sig-star", el);
      b.classList.toggle("on", on); $(".s", b).textContent = on ? "★" : "☆"; $(".t", b).textContent = on ? "Marked for the playbook" : "This matters for TheraBreath";
    },
    notes: ["Five signals, each followed all the way through: signal → human need → oral-care implication → TheraBreath opportunity.", "Ask after each one: does this matter for TheraBreath? Star the ones the room agrees on; they go straight into the playbook."]
  });

  scene({
    id: "atlas", ch: 1, tag: "Show", title: "A world of flavor", cls: "light s-atlas", builds: D.REGIONS.length - 1,
    html: () => {
      const s = 1160 / MAP.w;
      return `
      ${K("01 · The Signals · The Flavor Factory's flavor intelligence")}
      <h2 class="h-m rv" style="--d:80">A world of flavor, read for oral care.</h2>
      <div class="map rv" style="--d:200">
        <svg viewBox="0 0 ${MAP.w} ${MAP.h}" width="1160" height="${Math.round(MAP.h * s)}" aria-label="World flavor map">
          <path class="dots" d="${MAP.dots}"/>
          <g class="hl"></g>
          ${D.REGIONS.map((r, i) => { const p = MAP.pts[r.at]; const q = r.also ? MAP.pts[r.also] : null;
            return `<g class="rg" data-i="${i}" style="--c:${r.col}">
              ${q ? `<circle class="halo" cx="${q[0]}" cy="${q[1]}" r="34"/><circle class="pin" cx="${q[0]}" cy="${q[1]}" r="7"/>` : ""}
              <circle class="halo" cx="${p[0]}" cy="${p[1]}" r="46"/><circle class="pin" cx="${p[0]}" cy="${p[1]}" r="9"/>
              <text x="${p[0]}" y="${p[1] - 26}" text-anchor="middle">${esc(r.name)}</text></g>`; }).join("")}
        </svg>
      </div>
      <div class="path rv" style="--d:320">
        <div class="path-k"><span class="k">From origin to oral care: where each ingredient sits today</span><span class="k faint">The Flavor Factory's read</span></div>
        <div class="path-line">${D.STAGES.map((s, i) => `<div class="pst" style="left:${i * 25}%"><i></i><span>${esc(s)}</span></div>`).join("")}<div class="path-ing"></div></div>
      </div>
      <aside class="rpanel rv" style="--d:260"></aside>`;
    },
    init(el) {
      $(".map svg", el).addEventListener("click", e => { const g = e.target.closest(".rg"); if (g) go(cur, +g.dataset.i); });
      // Tint the dots that sit around each region, for the highlight.
      const pts = MAP.dots.split("M").slice(1).map(s => s.replace("h0", "").split(" ").map(Number));
      $(".hl", el).innerHTML = D.REGIONS.map((r, i) => {
        const c = [MAP.pts[r.at]]; if (r.also) c.push(MAP.pts[r.also]);
        const near = pts.filter(p => c.some(q => Math.hypot(p[0] - q[0], p[1] - q[1]) < (r.hub ? 60 : 88)));
        return `<path data-i="${i}" style="--c:${r.col}" d="${near.map(p => `M${p[0]} ${p[1]}h0`).join("")}"/>`;
      }).join("");
    },
    step(el, b) {
      const r = D.REGIONS[b];
      $$(".rg", el).forEach((g, i) => g.classList.toggle("sel", i === b));
      $$(".hl path", el).forEach((g, i) => g.classList.toggle("sel", i === b));
      const P = $(".rpanel", el);
      P.style.setProperty("--c", r.col);
      P.innerHTML = `
        <div class="k">${r.hub ? "Where it comes together" : "Region"}</div>
        <h3>${esc(r.name)}</h3>
        <div class="ings">${r.ing.map(x => `<span>${esc(x[0])}</span>`).join("")}</div>
        <dl>
          <dt>Sensory character</dt><dd>${esc(r.sensory)}</dd>
          <dt>Why consumers understand it</dt><dd>${esc(r.why)}</dd>
          <dt>Where it's appearing</dt><dd>${esc(r.where)}</dd>
        </dl>
        <div class="oral"><span class="k">Oral-care translation</span><p>${esc(r.oral)}</p>${r.terr ? `<button class="go-terr" data-t="${r.terr}" type="button">Open the territory →</button>` : ""}</div>`;
      const gt = $(".go-terr", P); if (gt) gt.onclick = () => go(SC.findIndex(s => s.id === "t-" + gt.dataset.t));
      P.classList.remove("anim"); void P.offsetWidth; P.classList.add("anim");
      // ingredients on the adoption path
      const counts = {};
      $(".path-ing", el).innerHTML = r.ing.map(([n, st]) => { const k = counts[st] = (counts[st] || 0) + 1; return `<span style="left:${(st - 1) * 25}%;--k:${k};--c:${r.col}"><i></i>${esc(n)}</span>`; }).join("");
    },
    notes: ["Not a list of trendy ingredients: this is how flavor culture travels. Click through the regions.", "Point at the path at the bottom: ingredients move from origin cuisine, to specialist menus, to cafés and cocktails, to mainstream food and drink, and only then into personal care. Food and beverage go first; oral care follows.", "Matcha, rose and bergamot are already in personal care. Yuzu is knocking on the door. Calamansi and sudachi are still early: future white space."]
  });

  /* ---------- chapter two */
  chapter(2, "light ch-2", `<div class="ch2-bg"></div>`, ["Chapter two, the heart of the session. We stop thinking in single flavors and start thinking in territories: places freshness could go."]);

  scene({
    id: "universe", ch: 2, tag: "Show", title: "The Freshness Universe", cls: "light s-uni", builds: 1,
    html: () => `
      ${K("02 · The Territories")}
      <h2 class="h-m rv" style="--d:80">The Freshness Universe</h2>
      <p class="uni-sub rv" style="--d:160">Every territory is a place. Every concept lives somewhere inside one.</p>
      <div class="axpick rv" style="--d:240">
        <div class="ap" data-ax="0"><span class="k">Across</span><button type="button"></button><div class="menu"></div></div>
        <div class="ap" data-ax="1"><span class="k">Up</span><button type="button"></button><div class="menu"></div></div>
      </div>
      <svg class="uni" viewBox="0 0 ${W} ${H}" aria-label="Freshness universe map">
        <defs><filter id="ublur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="46"/></filter></defs>
        <g class="u-axes"><line class="ax-x"/><line class="ax-y"/><text class="al al-l"/><text class="al al-r"/><text class="al al-b"/><text class="al al-t"/></g>
        <g class="u-core"><ellipse rx="130" ry="80"/><text y="-94" text-anchor="middle">TheraBreath today: core mint</text></g>
        <g class="u-blobs">${ORDER.map(id => `<ellipse class="u-blob" data-t="${id}" rx="190" ry="130" fill="${T[id].acc}"/>`).join("")}</g>
        <g class="u-today">${D.TODAY.map((x, i) => `<g class="u-td" data-i="${i}"><rect x="-8" y="-8" width="16" height="16" rx="3"/><text x="16" y="5">${esc(x.name)}</text><text class="sm" x="16" y="26">${esc(x.note)}</text></g>`).join("")}</g>
        <g class="u-terr" data-b="1">${ORDER.map(id => { const t = T[id]; return `<g class="u-t" data-t="${id}" style="--c:${t.acc};--ci:${t.dark ? t.acc : t.accInk}">
          ${t.members.map((m, j) => `<g class="u-m" data-j="${j}"><circle r="6"/><text x="12" y="5">${esc(m)}</text></g>`).join("")}
          <g class="u-h"><circle class="ring" r="22"/><circle r="11"/><text class="tn" y="-38" text-anchor="middle">${esc(t.terr)}</text><text class="cn" y="54" text-anchor="middle">${esc(t.name)}</text></g></g>`; }).join("")}</g>
      </svg>
      <div class="u-open" data-b="1"></div>
      <p class="u-note" data-b="1">Select a territory to see the concepts inside it. Change the axes to see the landscape from another angle.</p>`,
    init(el) {
      this.ax = [1, 2];
      const X0 = 250, X1 = 1720, Y0 = 310, Y1 = 930;
      const px = v => X0 + (v + 1) / 2 * (X1 - X0), py = v => Y1 - (v + 1) / 2 * (Y1 - Y0);
      const off = (j, k) => .19 * Math.sin(j * 2.1 + k * 1.37 + 1) + .07 * Math.cos(j * 3.3 + k);
      const place = () => {
        const [ax, ay] = this.ax, A = D.AXES;
        const mx = (X0 + X1) / 2, my = (Y0 + Y1) / 2;
        const set = (s, a) => { const e = $(s, el); Object.keys(a).forEach(k => e.setAttribute(k, a[k])); return e; };
        set(".ax-x", { x1: X0, x2: X1, y1: my, y2: my }); set(".ax-y", { x1: mx, x2: mx, y1: Y0, y2: Y1 });
        set(".al-l", { x: X0, y: my - 16 }).textContent = "← " + A[ax][1]; set(".al-r", { x: X1, y: my - 16 }).textContent = A[ax][2] + " →";
        set(".al-b", { x: mx + 16, y: Y1 - 6 }).textContent = "↓ " + A[ay][1]; set(".al-t", { x: mx + 16, y: Y0 + 18 }).textContent = "↑ " + A[ay][2];
        const tr = (e, d) => { e.style.transform = `translate(${px(d[ax]).toFixed(1)}px,${py(d[ay]).toFixed(1)}px)`; };
        tr($(".u-core", el), D.CORE.dims);
        $$(".u-td", el).forEach((g, i) => tr(g, D.TODAY[i].dims));
        ORDER.forEach(id => {
          const t = T[id], d = t.dims;
          tr($(`.u-blob[data-t="${id}"]`, el), d);
          const g = $(`.u-t[data-t="${id}"]`, el); tr(g, d);
          $$(".u-m", g).forEach((m, j) => { m.style.transform = `translate(${(off(j, ax) * (X1 - X0) / 2).toFixed(1)}px,${(-off(j + 5, ay) * (Y1 - Y0) / 2).toFixed(1)}px)`; });
        });
        $$(".ap", el).forEach(p => { const a = A[this.ax[+p.dataset.ax]]; $("button", p).textContent = `${a[1]} ↔ ${a[2]}`; });
      };
      this.place = place;
      $$(".ap", el).forEach(p => {
        const menu = $(".menu", p);
        menu.innerHTML = D.AXES.map((a, i) => `<button type="button" data-a="${i}">${a[1]} ↔ ${a[2]}</button>`).join("");
        $("button", p).addEventListener("click", e => { e.stopPropagation(); $$(".ap", el).forEach(q => q !== p && q.classList.remove("open")); p.classList.toggle("open"); });
        menu.addEventListener("click", e => {
          const b = e.target.closest("[data-a]"); if (!b) return;
          const k = +p.dataset.ax, a = +b.dataset.a, o = 1 - k;
          if (this.ax[o] === a) this.ax[o] = this.ax[k];
          this.ax[k] = a; p.classList.remove("open"); place();
        });
      });
      el.addEventListener("click", e => { if (!e.target.closest(".ap")) $$(".ap", el).forEach(q => q.classList.remove("open")); });
      const open = $(".u-open", el);
      const select = id => {
        this.sel = id;
        $$(".u-t", el).forEach(g => g.classList.toggle("sel", g.dataset.t === id));
        $$(".u-blob", el).forEach(g => g.classList.toggle("sel", g.dataset.t === id));
        el.classList.toggle("has-sel", !!id);
        if (id) { const t = T[id]; open.innerHTML = `<span class="k">${esc(t.terr)}</span><b>${esc(t.name)}</b><span class="mem">${t.members.map(esc).join(" · ")}</span><button type="button">Explore the territory →</button>`; open.style.setProperty("--c", t.acc); $("button", open).onclick = () => go(SC.findIndex(s => s.id === "t-" + id)); }
        open.classList.toggle("show", !!id);
      };
      $(".u-terr", el).addEventListener("click", e => { const g = e.target.closest(".u-t"); if (!g) return; e.stopPropagation(); select(this.sel === g.dataset.t ? null : g.dataset.t); });
      $(".uni", el).addEventListener("click", e => { if (!e.target.closest(".u-t")) select(null); });
      place();
    },
    leave() { },
    notes: ["This is the landscape. Bottom-left is where oral-care freshness mostly lives today: cool, familiar, crisp.", "Advance: six territories appear. Click one to see the concepts inside it; one hero concept, several possible platform members.", "Change the axes live (Across / Up): Crisp ↔ Soft, Immediate ↔ Lingering. The same territories tell a different story from each angle."]
  });

  /* ---------- territories: world, insight, tasting */
  function territoryScene(id) {
    const t = T[id];
    scene({
      id: "t-" + id, ch: 2, tag: "Show", title: t.name, terr: id, cls: `s-terr ${t.dark ? "dark" : "light"}`, builds: 2, vars: tvars(t),
      bg: `<div class="ph" data-src="${img(t.img)}" style="--pos:74% 50%"></div><div class="scrim sc-t"></div>`,
      html: () => `
        ${K(`Territory 0${t.n} · ${esc(t.terr)}`, 0, "t-k")}
        <h2 class="t-name rv" style="--d:120">${esc(t.name)}</h2>
        <p class="t-emo rv" style="--d:260">${t.emotion.map(w => esc(w) + ".").join(" ")}</p>
        <div class="t-char" data-b="1"><div class="k">Character</div><ul>${t.character.map(c => `<li>${esc(c)}</li>`).join("")}</ul></div>
        <div class="t-mom" data-b="1"><div class="k">Moments</div>${chipRow(t.moments)}</div>
        <div class="bench" data-b="2"><span class="k">Bench note</span><p>${esc(t.bench)}</p></div>`,
      notes: [`${t.name}: ${t.emotion.join(", ").toLowerCase()}.`, "Advance: character and the moments it's made for.", "Advance: the bench note. This is where we quietly show that the idea has to survive an oxygen system, not just sound good."]
    });
  }

  function tastingScene(id) {
    const t = T[id];
    const pts = t.curve.map((v, i) => [90 + i * 280, 196 - v * 176]);
    const d = `M0 196 C 40 196, 50 ${pts[0][1]}, ${pts[0][0]} ${pts[0][1]} C ${pts[0][0] + 110} ${pts[0][1]}, ${pts[1][0] - 110} ${pts[1][1]}, ${pts[1][0]} ${pts[1][1]} C ${pts[1][0] + 110} ${pts[1][1]}, ${pts[2][0] - 110} ${pts[2][1]}, ${pts[2][0]} ${pts[2][1]} C ${pts[2][0] + 20} ${pts[2][1]}, 700 ${pts[2][1] + 24}, 720 ${pts[2][1] + 44}`;
    scene({
      id: "taste-" + id, ch: 2, tag: "Taste", title: "Tasting · " + t.name, terr: id, cls: `s-taste ${t.dark ? "dark" : "light"}`, builds: 2, vars: tvars(t),
      bg: `<div class="tb-photo"><div class="ph" data-src="${img(t.img)}" style="--pos:70% 50%"></div></div><div class="tb-panel"></div>`,
      html: () => `
        ${K(`Tasting · 0${t.n} of 06`)}
        <h2 class="ta-name rv" style="--d:100">${esc(t.name)}</h2>
        <p class="ta-id rv" style="--d:220">${t.identity.map(w => esc(w) + ".").join(" ")}</p>
        <div class="arc rv" style="--d:360">
          <svg viewBox="0 0 720 220" width="720" height="220" aria-hidden="true"><defs><linearGradient id="ag-${id}" x1="0" x2="1"><stop offset="0" stop-color="${t.warm || t.acc}"/><stop offset=".5" stop-color="${t.acc}"/><stop offset="1" stop-color="${t.cool || t.acc}"/></linearGradient></defs>
            <path class="arc-p" d="${d}" stroke="url(#ag-${id})"/>${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="9"/>`).join("")}<circle class="arc-dot" r="11"/></svg>
          <div class="arc-l">${["First impression", "Mid-palate", "Finish"].map((l, i) => `<div style="left:${pts[i][0]}px"><span class="k">${l}</span><b>${esc(t.arc[i])}</b></div>`).join("")}</div>
        </div>
        <div class="ta-q" data-b="1"><p>${esc(t.q)}</p><div class="ans">${t.opts.map((o, i) => `<button type="button" data-a="${i}"><span>${esc(o)}</span><em></em></button>`).join("")}</div></div>
        <div class="ta-where" data-b="2"><span class="k">Where could this live in the TheraBreath world?</span><div class="wm">${D.MOMENTS.map(m => `<button type="button" data-m="${m.id}">${m.l}</button>`).join("")}</div></div>`,
      init(el) {
        const p = $(".arc-p", el), dot = $(".arc-dot", el);
        this.anim = () => {
          const L = p.getTotalLength(), me = this.tok = (this.tok || 0) + 1; let t0 = null;
          const tick = ts => { if (!el.classList.contains("on") || this.tok !== me) return; t0 = t0 || ts; const f = ((ts - t0) / 5200) % 1; const q = p.getPointAtLength(f * L); dot.setAttribute("cx", q.x); dot.setAttribute("cy", q.y); requestAnimationFrame(tick); };
          requestAnimationFrame(tick);
        };
        $(".ans", el).addEventListener("click", e => { const b = e.target.closest("[data-a]"); if (!b) return; mutate(s => { const a = s.taste[id] = s.taste[id] || {}; a[b.dataset.a] = (a[b.dataset.a] || 0) + 1; }); });
        $(".ans", el).addEventListener("contextmenu", e => { const b = e.target.closest("[data-a]"); if (!b) return; e.preventDefault(); mutate(s => { const a = s.taste[id] = s.taste[id] || {}; a[b.dataset.a] = Math.max(0, (a[b.dataset.a] || 0) - 1); }); });
        $(".wm", el).addEventListener("click", e => { const b = e.target.closest("[data-m]"); if (!b) return; mutate(s => { const w = s.where[id] = s.where[id] || {}; w[b.dataset.m] = !w[b.dataset.m]; }); });
      },
      enter(el) { if (!reduced) this.anim(); },
      sync(el) {
        const a = S.taste[id] || {}, n = tot(Object.values(a));
        $$(".ans button", el).forEach(b => { const v = a[b.dataset.a] || 0; $("em", b).textContent = v ? v : ""; b.style.setProperty("--f", n ? v / n : 0); b.classList.toggle("has", v > 0); });
        const w = S.where[id] || {};
        $$(".wm button", el).forEach(b => b.classList.toggle("on", !!w[b.dataset.m]));
      },
      notes: [`Pour ${t.name}. Let the room taste before anyone speaks.`, `Advance: the one question. "${t.q}" Tap an answer per hand raised (right-click removes one).`, "Advance: where could it live? Tag the moments the room suggests; they carry into the playbook."]
    });
  }

  /* Insight scenes: what each territory teaches */
  const insight = {
    yuzu() {
      const t = T.yuzu, cx = 1330, cy = 600, R = 330, ang = [-38, 42, 142, 222];
      scene({
        id: "x-yuzu", ch: 2, tag: "Teach", title: "One concept, a platform", terr: "yuzu", cls: "light s-x s-orbit", builds: 1, vars: tvars(t),
        html: () => `
          ${K("Territory 01 · Bright Global Freshness")}
          <h2 class="h-m x-h rv" style="--d:80">One concept can unlock an innovation platform.</h2>
          <p class="x-lede rv" style="--d:180">Arctic Yuzu is the way in. Bright Global Freshness is the territory: a family of citrus freshness with years of runway.</p>
          <div class="x-foot rv" style="--d:300">${chipRow(t.moments)}</div>
          <svg class="orb-lines" viewBox="0 0 ${W} ${H}" aria-hidden="true"><circle cx="${cx}" cy="${cy}" r="${R}" class="ring"/><circle cx="${cx}" cy="${cy}" r="${R - 120}" class="ring faint"/>
            ${ang.map(a => `<line data-b="1" x1="${cx + Math.cos(a * Math.PI / 180) * 160}" y1="${cy + Math.sin(a * Math.PI / 180) * 160}" x2="${cx + Math.cos(a * Math.PI / 180) * (R - 18)}" y2="${cy + Math.sin(a * Math.PI / 180) * (R - 18)}"/>`).join("")}</svg>
          <div class="o-core rv" style="--d:200;left:${cx}px;top:${cy}px"><div class="o-img" data-src="${img("yuzu", 1)}"></div><span>Arctic Yuzu</span></div>
          ${t.members.map((m, i) => { const a = ang[i] * Math.PI / 180; return `<div class="o-m" data-b="1" style="left:${cx + Math.cos(a) * R}px;top:${cy + Math.sin(a) * R}px;transition-delay:${i * 90}ms"><i></i><span>${esc(m)}</span></div>`; }).join("")}
          <p class="x-note" data-b="1">Illustrative platform members, not a recommendation list.</p>`,
        notes: ["The point isn't Arctic Yuzu on its own. It's what Arctic Yuzu opens up.", "Advance: one territory, several expressions. Citrus freshness TheraBreath could own for years, launched one step at a time."]
      });
    },
    cucumber() {
      const t = T.cucumber, cx = 1330, cy = 590, ang = [-52, 18, 162, 232];
      scene({
        id: "x-cucumber", ch: 2, tag: "Teach", title: "Permission, expanded", terr: "cucumber", cls: "light s-x s-rings", builds: 1, vars: tvars(t),
        html: () => `
          ${K("Territory 02 · Garden Clean")}
          <h2 class="h-m x-h rv" style="--d:80">TheraBreath already has permission to play here.</h2>
          <p class="x-lede rv" style="--d:180">Green tea already lives in TheraBreath's flavor vocabulary. This isn't "we discovered green tea." The question is what happens if we grow it into a full sensory territory.</p>
          <div class="x-foot rv" style="--d:300"><span class="k">It should evoke</span>${chipRow(t.evokes)}</div>
          <div class="ring3 r-out" data-b="1" style="left:${cx}px;top:${cy}px"></div>
          <div class="ring3 r-mid rv" style="--d:260;left:${cx}px;top:${cy}px"><span>Green Tea Cucumber<em>the territory hero</em></span></div>
          <div class="ring3 r-in rv" style="--d:160;left:${cx}px;top:${cy}px"><span>Green tea<em>in TheraBreath's vocabulary today</em></span></div>
          ${t.members.map((m, i) => { const a = ang[i] * Math.PI / 180; return `<div class="o-m" data-b="1" style="left:${cx + Math.cos(a) * 390}px;top:${cy + Math.sin(a) * 390}px;transition-delay:${i * 90}ms"><i></i><span>${esc(m)}</span></div>`; }).join("")}`,
        notes: ["Important nuance: we're not claiming green tea is new. TheraBreath already has the permission.", "Advance: what a full Garden Clean territory could hold. White tea, jasmine, aloe, yuzu: all built on a permission you already have."]
      });
    },
    ginger() {
      const t = T.ginger, X0 = 170, X1 = 1750, Y0 = 420, Y1 = 770, N = 160;
      const warm = x => .92 * Math.exp(-Math.pow((x - .13) / .13, 2));
      const lime = x => Math.exp(-Math.pow((x - .38) / .075, 2));
      const cool = x => (1 / (1 + Math.exp(-(x - .47) / .045))) * (.9 - .2 * Math.max(0, x - .62));
      const path = (f, close) => { let d = ""; for (let i = 0; i <= N; i++) { const x = i / N; d += (i ? "L" : "M") + (X0 + x * (X1 - X0)).toFixed(1) + " " + (Y1 - f(x) * (Y1 - Y0)).toFixed(1); } return close ? d + `L${X1} ${Y1}L${X0} ${Y1}Z` : d; };
      const C = [["warm", warm, t.warm, "Ginger warmth", .13], ["lime", lime, t.acc, "Lime flash", .38], ["cool", cool, t.cool, "Cool clean finish", .78]];
      scene({
        id: "x-ginger", ch: 2, tag: "Teach", title: "Contrast creates freshness", terr: "ginger", cls: "dark s-x s-thermal", builds: 1, vars: tvars(t),
        bg: `<div class="thermal-bg"></div>`,
        html: () => `
          ${K("Territory 03 · Thermal Freshness")}
          <h2 class="h-m x-h rv" style="--d:80">Freshness doesn't have to get colder and colder.<br><span class="acc">Contrast creates freshness.</span></h2>
          <svg class="curve rv" style="--d:220" viewBox="0 0 ${W} ${H}" aria-label="Sensory curve: ginger warmth, then lime flash, then a cool clean finish">
            <line class="base" x1="${X0}" y1="${Y1}" x2="${X1}" y2="${Y1}"/>
            ${C.map(c => `<path class="area" d="${path(c[1], 1)}" fill="${c[2]}"/><path class="line" d="${path(c[1])}" stroke="${c[2]}"/>`).join("")}
            ${C.map(c => `<g class="lbl" data-c="${c[0]}" transform="translate(${X0 + c[4] * (X1 - X0)},${Y1 - c[1](c[4]) * (Y1 - Y0) - 34})"><text text-anchor="middle" fill="${c[2]}">${c[3]}</text></g>`).join("")}
            <g class="ph-g"><line class="playhead" y1="${Y0 - 30}" y2="${Y1}"/>${C.map(c => `<circle class="pd" data-c="${c[0]}" r="9" fill="${c[2]}"/>`).join("")}</g>
            <text class="tx" x="${X0}" y="${Y1 + 44}">First sip</text><text class="tx" x="${X1}" y="${Y1 + 44}" text-anchor="end">Long after</text>
          </svg>
          <div class="se" data-b="1"><div class="se-k"><span class="k">The bigger platform</span><b>Sensory engineering</b><p>The opportunity isn't only Ginger Lime. It's designing how freshness behaves over time.</p></div>
            ${t.members.map(m => `<div class="se-i">${esc(m)}</div>`).join("")}</div>
          <p class="x-note">Conceptual sensory curve, illustrative.</p>`,
        init(el) {
          const ph = $(".playhead", el), dots = $$(".pd", el), lbls = $$(".lbl", el);
          this.run = () => {
            let t0 = null; const me = this.tok = (this.tok || 0) + 1;
            const tick = ts => {
              if (!el.classList.contains("on") || this.tok !== me) return; t0 = t0 || ts;
              const cyc = 7600, f = Math.min(1, ((ts - t0) % cyc) / (cyc - 1400));
              const x = X0 + f * (X1 - X0); ph.setAttribute("x1", x); ph.setAttribute("x2", x);
              C.forEach((c, i) => { const v = c[1](f); dots[i].setAttribute("cx", x); dots[i].setAttribute("cy", Y1 - v * (Y1 - Y0)); lbls[i].classList.toggle("hot", v > .45); });
              requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          };
        },
        enter() { if (!reduced) this.run(); },
        notes: ["This one teaches something: freshness can come from contrast, not only from more cold.", "Watch the curve: ginger warmth first, then the lime flash, then a cool, clean finish that feels colder because of the warmth before it.", "Advance: the real platform is sensory engineering. Designing how freshness behaves over time is a capability, not a flavor."]
      });
    },
    grapefruit() {
      const t = T.grapefruit;
      scene({
        id: "x-grapefruit", ch: 2, tag: "Teach", title: "The restraint principle", terr: "grapefruit", cls: "light s-x s-restraint", builds: 1, vars: tvars(t),
        bg: `<div class="restraint-bg"></div>`,
        html: () => `
          ${K("Territory 04 · Botanical Luxury")}
          <h2 class="h-m x-h rv" style="--d:80">Floral can mean beauty, as long as it still reads as clean.</h2>
          <p class="x-lede rv" style="--d:180">Floral notes can bring beauty, self-care and sophistication to oral care. For people who already see oral care as part of their beauty and wellness routine, that's the point. The skill is restraint.</p>
          <div class="x-foot rv" style="--d:300"><span class="k">Creative direction</span>${chipRow(t.evokes)}</div>
          <div class="dial rv" style="--d:240">
            <div class="k">How much floral?</div>
            <div class="dial-bar"><span class="z z1">Grapefruit mint</span><span class="z z2">Botanical luxury</span><span class="z z3">Perfume</span><i class="dial-mk"></i></div>
            <div class="dial-cap"><span>Not enough to notice</span><span>The target</span><span>No longer freshness</span></div>
          </div>
          <div class="comp" data-b="1">
            <div class="k">How it's built: rose as an accent, not a theme</div>
            <div class="comp-bar"><span class="c1">Dry pink grapefruit</span><span class="c2"></span><span class="c3">Clean mint backbone</span></div>
            <div class="comp-rose">A whisper of rose</div>
            <div class="guard"><span class="k">Guardrails</span><s>Sugary</s><s>Perfumey</s><s>Candy pink</s></div>
          </div>`,
        notes: ["The insight: florals can bring beauty and self-care into oral care, but only with restraint.", "Advance: how it's built. Grapefruit and mint carry the freshness; rose is the accent that makes it feel polished."]
      });
    },
    pear() {
      const t = T.pear, X0 = 230, X1 = 1690, Y = 610;
      const pts = [{ name: "Today's core mint", innov: 0, core: 1 }].concat(ORDER.map(id => ({ id, name: T[id].name, innov: T[id].innov, c: T[id].acc }))).sort((a, b) => a.innov - b.innov);
      scene({
        id: "x-pear", ch: 2, tag: "Teach", title: "Adjacency and white space", terr: "pear", cls: "light s-x s-horizon", builds: 1, vars: tvars(t),
        html: () => `
          ${K("Territory 05 · Aromatic Discovery")}
          <h2 class="h-m x-h rv" style="--d:80">Not every concept needs to launch next year.<br>A real pipeline needs both.</h2>
          <div class="hz-line rv" style="--d:220"><i></i><span class="hz-a k">Mainstream adjacency</span><span class="hz-b k">Future white space</span></div>
          ${pts.map((p, i) => `<div class="hz-pt rv ${p.id === "pear" ? "hero" : ""} ${p.core ? "core" : ""} ${i % 2 ? "dn" : "up"}" style="--d:${300 + i * 80};left:${X0 + p.innov * (X1 - X0)}px;top:${Y}px;--c:${p.c || "#9AA7B0"}"><i></i><span>${esc(p.name)}</span></div>`).join("")}
          <div class="hz-defs" data-b="1">
            <div><span class="k">Mainstream adjacency</span><p>Recognizable freshness with a twist. It scales quickly and needs little explanation.</p></div>
            <div><span class="k">Future white space</span><p>New to the category. It builds equity, learning and news, often starting as a limited edition or a later horizon.</p></div>
          </div>`,
        notes: ["Pear Cardamom Mint is deliberately further out. It's here to make a point about the pipeline.", "Advance: the difference between mainstream adjacency and future white space. TheraBreath needs both, on different clocks."]
      });
    },
    night() {
      const t = T.night, cx = 1330, cy = 590, R = 290;
      const aOf = h => h / 24 * 360 - 90;
      const arc = (h0, h1, r) => { const a0 = aOf(h0) * Math.PI / 180, a1 = aOf(h1) * Math.PI / 180, large = (h1 - h0 + 24) % 24 > 12 ? 1 : 0; return `M${cx + Math.cos(a0) * r} ${cy + Math.sin(a0) * r} A${r} ${r} 0 ${large} 1 ${cx + Math.cos(a1) * r} ${cy + Math.sin(a1) * r}`; };
      const segs = [[4, 8, "#F3D98E"], [8, 12, "#9FD2EA"], [12, 16, "#A9CFA3"], [16, 20, "#E8AE92"], [20, 28, "#8C86C9"]];
      scene({
        id: "x-night", ch: 2, tag: "Discuss", title: "The flavor clock", terr: "night", cls: "light s-x s-clock", builds: D.DAYPARTS.length - 1, vars: tvars(t),
        html: () => `
          ${K("Territory 06 · Soft Freshness · Night Ritual")}
          <h2 class="h-m x-h rv" style="--d:80">How large could daypart freshness become?</h2>
          <p class="x-lede rv" style="--d:180">TheraBreath's existing Overnight Chamomile Mint already proves the permission for daypart-specific flavor. Chamomile Vanilla Mint is an evolution of night, not a standalone novelty.</p>
          <svg class="clock rv" style="--d:220" viewBox="0 0 ${W} ${H}" aria-label="Flavor clock">
            ${segs.map(s => `<path d="${arc(s[0], s[1] > 24 ? s[1] - 24 : s[1], R)}" stroke="${s[2]}" class="cseg"/>`).join("")}
            ${[0, 3, 6, 9, 12, 15, 18, 21].map(h => { const a = aOf(h) * Math.PI / 180; return `<line class="tick" x1="${cx + Math.cos(a) * (R - 34)}" y1="${cy + Math.sin(a) * (R - 34)}" x2="${cx + Math.cos(a) * (R - 22)}" y2="${cy + Math.sin(a) * (R - 22)}"/>`; }).join("")}
            <g class="hand" style="transform-origin:${cx}px ${cy}px"><line x1="${cx + 150}" y1="${cy}" x2="${cx + R - 40}" y2="${cy}"/><circle cx="${cx + R - 40}" cy="${cy}" r="6"/></g>
            ${D.DAYPARTS.map((p, i) => { const a = aOf(p.h) * Math.PI / 180, lx = cx + Math.cos(a) * (R + 70), ly = cy + Math.sin(a) * (R + 70); return `<g class="dp" data-i="${i}"><circle cx="${cx + Math.cos(a) * R}" cy="${cy + Math.sin(a) * R}" r="17"/><text x="${lx}" y="${ly - 6}" text-anchor="middle" class="dpt">${p.h > 12 ? p.h - 12 : p.h} ${p.h >= 12 ? "PM" : "AM"}</text><text x="${lx}" y="${ly + 22}" text-anchor="middle" class="dpl">${esc(p.l)}</text></g>`; }).join("")}
          </svg>
          <div class="clock-c" style="left:${cx}px;top:${cy}px"><span class="k"></span><b></b><p></p><em></em></div>`,
        init(el) { $(".clock", el).addEventListener("click", e => { const g = e.target.closest(".dp"); if (g) go(cur, +g.dataset.i); }); },
        step(el, b) {
          const p = D.DAYPARTS[b], c = $(".clock-c", el);
          $(".hand", el).style.transform = `rotate(${aOf(p.h)}deg)`;
          $$(".dp", el).forEach((g, i) => g.classList.toggle("sel", i === b));
          c.classList.remove("anim"); void c.offsetWidth; c.classList.add("anim");
          $(".k", c).textContent = `${p.h > 12 ? p.h - 12 : p.h} ${p.h >= 12 ? "PM" : "AM"}`; $("b", c).textContent = p.l; $("p", c).textContent = p.need; $("em", c).textContent = p.c;
          c.style.setProperty("--c", T[p.terr].acc);
        },
        notes: ["Night already works for TheraBreath: Overnight Chamomile Mint proves it.", "Step through the clock: 6 AM Wake, 10 AM Confidence, 2 PM Reset, 6 PM Post Meal, 10 PM Restore.", "The question for the room: is daypart a flavor, or a system?"]
      });
    }
  };

  ORDER.forEach(id => { territoryScene(id); insight[id](); tastingScene(id); });

  /* ---------- compass */
  scene({
    id: "compass", ch: 2, tag: "Discuss", title: "The Freshness Compass", cls: "light s-compass", builds: ORDER.length - 1,
    html: () => {
      const cx = 1330, cy = 560, R = 320, n = D.COMPASS.length;
      const ax = i => (i / n) * Math.PI * 2 - Math.PI / 2;
      return `
      ${K("02 · The Territories")}
      <h2 class="h-m rv" style="--d:80">The Freshness Compass</h2>
      <p class="cp-sub rv" style="--d:160">Freshness can be composed. Select a concept and watch its shape change from the first sip to the finish.</p>
      <div class="cp-pick rv" style="--d:240">${ORDER.map((id, i) => `<button type="button" data-i="${i}" style="--c:${T[id].acc}"><i></i>${esc(T[id].name)}</button>`).join("")}</div>
      <div class="cp-tools rv" style="--d:320">
        <div class="seg" role="group" aria-label="Moment">${["First impression", "Mid-palate", "Finish"].map((l, i) => `<button type="button" data-s="${i}">${l}</button>`).join("")}</div>
        <button type="button" class="cp-play">▶ Play the sip</button>
        <label class="cp-ref"><input type="checkbox" checked> Show today's core mint</label>
        <label class="cp-cmp"><span>Compare with</span><select><option value="">nothing</option>${ORDER.map(id => `<option value="${id}">${esc(T[id].name)}</option>`).join("")}</select></label>
      </div>
      <svg class="radar rv" style="--d:200" viewBox="0 0 ${W} ${H}" aria-label="Freshness compass">
        ${[1, 2, 3, 4, 5].map(r => `<polygon class="rg" points="${D.COMPASS.map((_, i) => `${cx + Math.cos(ax(i)) * R * r / 5},${cy + Math.sin(ax(i)) * R * r / 5}`).join(" ")}"/>`).join("")}
        ${D.COMPASS.map((a, i) => { const c = Math.cos(ax(i)), s = Math.sin(ax(i)); return `<line class="sp" x1="${cx}" y1="${cy}" x2="${cx + c * R}" y2="${cy + s * R}"/><text class="al" x="${cx + c * (R + 46)}" y="${cy + s * (R + 46) + 8}" text-anchor="${Math.abs(c) < .2 ? "middle" : c > 0 ? "start" : "end"}">${esc(a)}</text>`; }).join("")}
        <polygon class="ref"/><polygon class="cmp"/><polygon class="shape"/>
      </svg>
      <div class="cp-read rv" style="--d:360"><span class="k"></span><b></b><p></p></div>
      <p class="cp-note">Conceptual sensory visualization. Illustrative, not panel data.</p>`;
    },
    init(el) {
      const cx = 1330, cy = 560, R = 320, n = D.COMPASS.length;
      const ax = i => (i / n) * Math.PI * 2 - Math.PI / 2;
      const pts = v => v.map((x, i) => `${(cx + Math.cos(ax(i)) * R * x / 5).toFixed(1)},${(cy + Math.sin(ax(i)) * R * x / 5).toFixed(1)}`).join(" ");
      const shape = $(".shape", el), ref = $(".ref", el), cmp = $(".cmp", el);
      this.cur = D.CORE.prof[1].slice(); this.stage = 1; this.cmpId = "";
      const target = () => T[ORDER[step]].prof[this.stage];
      let raf = 0;
      const draw = () => {
        const tg = target(); let moving = false;
        this.cur = this.cur.map((v, i) => { const nv = lerp(v, tg[i], .14); if (Math.abs(nv - tg[i]) > .01) moving = true; return nv; });
        shape.setAttribute("points", pts(this.cur));
        raf = moving && el.classList.contains("on") ? requestAnimationFrame(draw) : 0;
      };
      this.kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
      this.setStage = s => {
        this.stage = s;
        $$(".seg button", el).forEach((b, i) => b.classList.toggle("sel", i === s));
        ref.setAttribute("points", pts(D.CORE.prof[s]));
        if (this.cmpId) cmp.setAttribute("points", pts(T[this.cmpId].prof[s]));
        const t = T[ORDER[step]];
        $(".cp-read .k", el).textContent = ["First impression", "Mid-palate", "Finish"][s];
        $(".cp-read b", el).textContent = t.arc[s];
        this.kick();
      };
      this.play = () => {
        clearTimeout(this.pt); let s = 0; this.setStage(0);
        const nx = () => { s++; if (s > 2) return; this.pt = setTimeout(() => { this.setStage(s); nx(); }, 1300); }; nx();
      };
      $(".cp-pick", el).addEventListener("click", e => { const b = e.target.closest("[data-i]"); if (b) go(cur, +b.dataset.i); });
      $(".seg", el).addEventListener("click", e => { const b = e.target.closest("[data-s]"); if (b) { clearTimeout(this.pt); this.setStage(+b.dataset.s); } });
      $(".cp-play", el).addEventListener("click", () => this.play());
      $(".cp-ref input", el).addEventListener("change", e => ref.classList.toggle("hide", !e.target.checked));
      $(".cp-cmp select", el).addEventListener("change", e => { this.cmpId = e.target.value; cmp.classList.toggle("hide", !this.cmpId); if (this.cmpId) { cmp.style.setProperty("--c", T[this.cmpId].acc); cmp.setAttribute("points", pts(T[this.cmpId].prof[this.stage])); } });
      cmp.classList.add("hide");
    },
    step(el, b) {
      const t = T[ORDER[b]];
      $$(".cp-pick button", el).forEach((x, i) => x.classList.toggle("sel", i === b));
      el.style.setProperty("--c", t.acc);
      $(".cp-read p", el).textContent = t.identity.join(" · ");
      this.play && el.classList.contains("on") ? this.play() : this.setStage && this.setStage(1);
    },
    leave() { clearTimeout(this.pt); },
    notes: ["The signature view. Nine dimensions of freshness; each concept has a different shape.", "Use 'Play the sip': shapes change over time. Ginger Lime is the clearest: warmth first, cooling rises at the finish.", "Say it out loud: this is conceptual, drawn from our bench experience, not panel data. The panel comes later."]
  });

  /* ---------- ingredient to bottle */
  let bN = 0;
  function bottle(t) {
    const id = "bt" + (bN++);
    const body = "M66,122 L134,122 L134,134 C172,140 190,168 190,206 L190,462 Q190,494 158,494 L42,494 Q10,494 10,462 L10,206 C10,168 28,140 66,134 Z";
    const ribs = (x0, x1, y0, y1) => { let r = ""; for (let x = x0; x <= x1; x += 4.2) r += `<line x1="${x.toFixed(1)}" y1="${y0}" x2="${x.toFixed(1)}" y2="${y1}" stroke="rgba(120,45,0,.22)" stroke-width="1.3"/>`; return r; };
    const cond = 'style="font-stretch:72%"', name = t.name.toUpperCase();
    const fit = name.length > 13 ? ` textLength="${Math.min(164, name.length * 8.4)}" lengthAdjust="spacingAndGlyphs"` : "";
    return `<svg class="bottle" viewBox="0 0 200 500" role="img" aria-label="${esc(t.name)} concept bottle" font-family="Archivo, 'Arial Narrow', Arial, sans-serif" font-weight="900"><defs>
      <linearGradient id="${id}c" x1="0" x2="1"><stop offset="0" stop-color="#C75A0C"/><stop offset=".2" stop-color="#F7852A"/><stop offset=".45" stop-color="#FFA65A"/><stop offset=".65" stop-color="#F58025"/><stop offset="1" stop-color="#B8520A"/></linearGradient>
      <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.liq[0]}"/><stop offset="1" stop-color="${t.liq[1]}"/></linearGradient>
      <linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".14" stop-color="#fff" stop-opacity=".05"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
      <clipPath id="${id}k"><path d="${body}"/></clipPath></defs>
      <path d="${body}" fill="rgba(255,255,255,.55)"/>
      <g clip-path="url(#${id}k)">
        <rect x="-10" y="132" width="220" height="380" fill="url(#${id}l)"/>
        <path d="M-200,134 q50,-8 100,0 t100,0 t100,0 t100,0 t100,0 t100,0 V156 H-200 Z" fill="${t.liq[0]}"><animateTransform attributeName="transform" type="translate" from="0 0" to="-200 0" dur="4.5s" repeatCount="indefinite"/></path>
        <rect x="10" y="206" width="180" height="246" fill="#fff"/>
        <rect x="10" y="206" width="180" height="17" fill="#F58025"/>
        <rect x="10" y="418" width="180" height="30" fill="${t.band}"/>
        <rect x="10" y="206" width="180" height="246" fill="url(#${id}g)" opacity=".6"/>
      </g>
      <path d="${body}" fill="url(#${id}g)" opacity=".7"/>
      <rect x="18" y="150" width="9" height="46" rx="4.5" fill="#fff" opacity=".45"/>
      <text x="100" y="218.5" text-anchor="middle" font-size="8.2" fill="#fff" letter-spacing="1" ${cond}>CONCEPT EXPLORATION</text>
      <use href="#tbLogo" x="28" y="236" width="144" height="37"/>
      <rect x="30" y="292" width="140" height="28" fill="#F58025"/>
      <text x="100" y="313" text-anchor="middle" font-size="19" fill="#fff" ${cond}>FRESH BREATH</text>
      <text x="100" y="350" text-anchor="middle" font-size="27" fill="#111" letter-spacing="1" ${cond}>ORAL RINSE</text>
      <text x="100" y="372" text-anchor="middle" font-size="9.5" fill="#0B6B4F" letter-spacing=".5" ${cond}>${t.identity.join(" · ").toUpperCase()}</text>
      <text x="100" y="392" text-anchor="middle" font-size="7" fill="#C85F0E" letter-spacing="1.2" ${cond}>FLAVOR CONCEPT · NOT A PRODUCT</text>
      <text x="100" y="438" text-anchor="middle" font-size="13" fill="${t.bandInk}" letter-spacing=".6" ${cond}${fit}>${esc(name)}</text>
      <path d="${body}" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1"/>
      <rect x="62" y="118" width="76" height="10" fill="${t.liq[0]}"/>
      <rect x="46" y="50" width="108" height="74" rx="9" fill="url(#${id}c)"/>${ribs(50, 150, 56, 120)}
      <rect x="46" y="112" width="108" height="12" rx="6" fill="rgba(0,0,0,.12)"/>
      <path d="M58,52 L62,14 Q63,6 72,6 L128,6 Q137,6 138,14 L142,52 Z" fill="url(#${id}c)"/>${ribs(64, 136, 12, 50)}
      <rect x="60" y="48" width="80" height="4" fill="rgba(0,0,0,.16)"/><rect x="70" y="6" width="60" height="5" rx="2.5" fill="#fff" opacity=".35"/>
    </svg>`;
  }

  scene({
    id: "tangible", ch: 2, tag: "Show", title: "Ingredient to bottle", cls: "light s-tan", builds: ORDER.length - 1,
    html: () => `
      ${K("02 · The Territories · Concept exploration")}
      <h2 class="h-m rv" style="--d:80">Make the flavor tangible.</h2>
      <div class="tan-flow rv" style="--d:200">
        <div class="tf tf1"><span class="k">Ingredient</span><div class="tf-ing"></div><b class="tf-cap"></b></div><i class="tf-ar"></i>
        <div class="tf tf2"><span class="k">Liquid</span><div class="glass"><div class="liq"><span class="mn"></span></div></div><b class="tf-cap">Clear, stable, on color</b></div><i class="tf-ar"></i>
        <div class="tf tf3"><span class="k">Sensation</span><div class="tf-sen"></div></div><i class="tf-ar"></i>
        <div class="tf tf4"><span class="k">Concept bottle</span><div class="tf-bot"></div></div>
      </div>
      <div class="tan-pick rv" style="--d:320">${ORDER.map((id, i) => `<button type="button" data-i="${i}" style="--c:${T[id].acc}"><i></i>${esc(T[id].name)}</button>`).join("")}</div>
      <p class="tan-note rv" style="--d:400"><b>Concept exploration.</b> Illustrations to help imagine flavor differentiation inside the existing franchise, not proposed packaging.</p>`,
    init(el) {
      this.bottles = ORDER.map(id => bottle(T[id]));
      $(".tan-pick", el).addEventListener("click", e => { const b = e.target.closest("[data-i]"); if (b) go(cur, +b.dataset.i); });
    },
    step(el, b) {
      const id = ORDER[b], t = T[id];
      $$(".tan-pick button", el).forEach((x, i) => x.classList.toggle("sel", i === b));
      $(".tf-ing", el).style.backgroundImage = `url(${img(t.img, 1)})`;
      $(".tf1 .tf-cap", el).textContent = t.character[0];
      const lq = $(".liq", el); lq.style.setProperty("--l0", t.liq[0]); lq.style.setProperty("--l1", t.liq[1]);
      $(".tf-sen", el).innerHTML = t.identity.map((w, i) => `<b style="--i:${i}">${esc(w)}</b>`).join("") + `<span>${t.arc.map(esc).join(" → ")}</span>`;
      $(".tf-bot", el).innerHTML = this.bottles[b];
      const f = $(".tan-flow", el); f.classList.remove("anim"); void f.offsetWidth; f.classList.add("anim");
    },
    notes: ["Ingredient → liquid → sensation → bottle. This is how we help people imagine a flavor before it exists.", "Every bottle is labeled Concept exploration: we are not redesigning the brand, only showing how color can signal a territory."]
  });

  /* ---------- your turn */
  scene({
    id: "yt", ch: 5, tag: "Discuss", title: "Your turn", cls: "dark s-yt", builds: 1,
    bg: `<div class="yt-bg"></div>`,
    html: () => `<h2 class="yt-t rv">Your turn.</h2><p class="yt-q" data-b="1">What should the next generation of TheraBreath freshness feel like?</p>`,
    notes: ["Stop presenting. Close the laptop lid if you can. This is the halfway point.", "Advance: the question. Let it sit for a moment before moving to the voting screen."]
  });

  scene({
    id: "yt-vote", ch: 5, tag: "Decide", title: "The room decides", cls: "light s-vote",
    html: () => `
      ${K("Your turn · the room decides")}
      <h2 class="h-m rv" style="--d:80">What should the next generation of TheraBreath freshness feel like?</h2>
      <p class="vote-how rv" style="--d:160">One vote per person on each line. Tap a point to add a vote.<span class="ws-only"> Right-click a point to remove one.</span></p>
      <div class="spectra rv" style="--d:240">${D.SPECTRA.map(x => `<div class="spx" data-x="${x.id}"><div class="spx-l"><span>${x.l}</span><span>${x.r}</span></div>
        <div class="track"><i class="rail"></i><i class="mk"></i>${[0, 1, 2, 3, 4].map(i => `<button type="button" data-p="${i}" aria-label="${i < 2 ? x.l : i > 2 ? x.r : "Balanced"}"><span class="stk"></span></button>`).join("")}</div>
        <button type="button" class="spx-clr ws-only" title="Clear this line">Clear</button></div>`).join("")}</div>
      <div class="orb-wrap rv" style="--d:320"><canvas class="orb" width="760" height="760"></canvas><div class="orb-n"></div></div>
      <p class="orb-say rv" style="--d:420"></p>`,
    init(el) {
      $(".spectra", el).addEventListener("click", e => {
        const clr = e.target.closest(".spx-clr"); if (clr) { const id = clr.closest(".spx").dataset.x; return mutate(s => { s.spectra[id] = [0, 0, 0, 0, 0]; }); }
        const b = e.target.closest("[data-p]"); if (!b) return; const id = b.closest(".spx").dataset.x;
        mutate(s => { s.spectra[id][+b.dataset.p]++; });
      });
      $(".spectra", el).addEventListener("contextmenu", e => { const b = e.target.closest("[data-p]"); if (!b) return; e.preventDefault(); const id = b.closest(".spx").dataset.x; mutate(s => { s.spectra[id][+b.dataset.p] = Math.max(0, s.spectra[id][+b.dataset.p] - 1); }); });
      this.orb = new Orb($(".orb", el));
    },
    enter() { this.orb.start(); }, leave() { this.orb.stop(); },
    sync(el) {
      const L = leans();
      D.SPECTRA.forEach(x => {
        const row = $(`.spx[data-x="${x.id}"]`, el), a = S.spectra[x.id], n = tot(a);
        $$("[data-p]", row).forEach((b, i) => { $(".stk", b).innerHTML = a[i] ? `<em>${a[i]}</em>` + "<i></i>".repeat(Math.min(a[i], 12)) : ""; b.classList.toggle("has", a[i] > 0); });
        const mk = $(".mk", row); mk.style.left = (50 + L[x.id] * 40) + "%"; mk.classList.toggle("show", n > 0);
      });
      this.orb.set(L, votesTotal());
      const n = votesTotal();
      $(".orb-n", el).textContent = n ? `${n} vote${n > 1 ? "s" : ""}` : "Waiting for the room";
      $(".orb-say", el).textContent = direction() || "As the room votes, the shape takes on the character of the freshness you're describing.";
    },
    notes: ["Five tensions. Ask for hands on each line and tap one vote per hand; the shape on the right is the room's freshness, live.", "When the lines are done, read the sentence under the shape aloud and ask: is that right?", "Undo with Z if a tap goes wrong."]
  });

  scene({
    id: "yt-terr", ch: 5, tag: "Decide", title: "Where should we go first?", cls: "light s-tvote",
    html: () => `
      ${K("Your turn · the room decides")}
      <h2 class="h-m rv" style="--d:80">Which territories should TheraBreath develop first?</h2>
      <p class="vote-how rv" style="--d:160">Three dots each. Tap a territory once for every dot.<span class="ws-only"> Right-click to remove one.</span></p>
      <div class="tv-grid">${ORDER.map((id, i) => { const t = T[id]; return `<button type="button" class="tv rv" data-t="${id}" style="--d:${220 + i * 70};--c:${t.acc};--ci:${t.dark ? "#5E8F1E" : t.accInk}">
        <span class="tv-img" data-src="${img(t.img, 1)}"></span><span class="tv-b"><span class="k">${esc(t.terr)}</span><b>${esc(t.name)}</b><span class="tv-dots"></span></span><span class="tv-rank"></span></button>`; }).join("")}</div>`,
    init(el) {
      $(".tv-grid", el).addEventListener("click", e => { const b = e.target.closest(".tv"); if (b) mutate(s => { s.tvotes[b.dataset.t] = (s.tvotes[b.dataset.t] || 0) + 1; }); });
      $(".tv-grid", el).addEventListener("contextmenu", e => { const b = e.target.closest(".tv"); if (!b) return; e.preventDefault(); mutate(s => { s.tvotes[b.dataset.t] = Math.max(0, (s.tvotes[b.dataset.t] || 0) - 1); }); });
    },
    sync(el) {
      const r = ranked(S.tvotes, ORDER).map(x => x[0]);
      $$(".tv", el).forEach(b => {
        const v = S.tvotes[b.dataset.t] || 0, k = r.indexOf(b.dataset.t);
        $(".tv-dots", b).innerHTML = v ? "<i></i>".repeat(Math.min(v, 24)) + `<em>${v}</em>` : "";
        $(".tv-rank", b).textContent = k >= 0 && k < 3 ? ["1st", "2nd", "3rd"][k] : "";
        b.classList.toggle("top", k >= 0 && k < 3);
      });
    },
    notes: ["Three dots per person. Walk the room, or call out territories and count hands.", "The top three become the chosen territories in the playbook."]
  });

  /* ---------- chapter three */
  chapter(3, "light ch-3", `<div class="ch3-bg"></div>`, ["Chapter three. We stop organizing innovation around ingredients and organize it around people's days."]);

  scene({
    id: "day", ch: 3, tag: "Discuss", title: "A day of freshness", cls: "light s-day", builds: D.MOMENTS.length - 1,
    html: () => {
      const hx = h => 170 + (h - 5) / 20 * 1330;
      return `
      ${K("03 · The Moments")}
      <h2 class="h-m rv" style="--d:80">Organize innovation around human moments, not ingredients.</h2>
      <div class="sky rv" style="--d:200"></div>
      <div class="hours rv" style="--d:260">${[6, 9, 12, 15, 18, 21, 24].map(h => `<span style="left:${hx(h)}px">${h === 12 ? "Noon" : h === 24 ? "Midnight" : (h > 12 ? h - 12 : h) + (h >= 12 ? " PM" : " AM")}</span>`).join("")}</div>
      ${D.MOMENTS.map((m, i) => m.at == null
        ? `<button type="button" class="mo mo-esc rv" data-i="${i}" style="--d:${340 + i * 80}"><span class="k">Any day</span><b>${m.l}</b></button>`
        : `${m.span ? `<i class="mo-span rv" style="--d:${320 + i * 80};left:${hx(m.span[0])}px;width:${hx(m.span[1]) - hx(m.span[0])}px"></i>` : ""}<button type="button" class="mo rv" data-i="${i}" style="--d:${340 + i * 80};left:${hx(m.at)}px"><i></i><b>${m.l}</b></button>`).join("")}
      <div class="mdet"></div>`;
    },
    init(el) {
      el.addEventListener("click", e => {
        const m = e.target.closest(".mo"); if (m) return go(cur, +m.dataset.i);
        const v = e.target.closest(".m-vote"); if (v) mutate(s => { const id = D.MOMENTS[step].id; s.mvotes[id] = (s.mvotes[id] || 0) + 1; });
        const u = e.target.closest(".m-unvote"); if (u) mutate(s => { const id = D.MOMENTS[step].id; s.mvotes[id] = Math.max(0, (s.mvotes[id] || 0) - 1); });
        const g = e.target.closest("[data-go]"); if (g) go(SC.findIndex(s => s.id === g.dataset.go));
      });
    },
    step(el, b) {
      const m = D.MOMENTS[b];
      $$(".mo", el).forEach((x, i) => x.classList.toggle("sel", i === b));
      const d = $(".mdet", el);
      d.innerHTML = `
        <div class="md-a"><h3>${m.l}</h3><ul>${m.when.map(w => `<li>${esc(w)}</li>`).join("")}</ul></div>
        <div class="md-b">${m.flag ? `<div class="flag">${esc(m.flag)}</div>` : ""}<span class="k">Desired sensory language</span>${chipRow(m.lang, "chips big")}<p>${esc(m.why)}</p></div>
        <div class="md-c"><span class="k">Potential territory</span>${m.terr.map(id => `<button type="button" class="md-t" data-go="t-${id}"><span class="md-img" style="background-image:url(${img(T[id].img, 1)})"></span><span class="md-tx"><b>${esc(T[id].name)}</b><em>${esc(T[id].terr)}</em></span></button>`).join("")}
          <div class="m-v"><button type="button" class="m-vote">＋ Priority occasion</button><button type="button" class="m-unvote ws-only" title="Remove a vote">−</button><span class="m-n"></span></div></div>`;
      d.classList.remove("anim"); void d.offsetWidth; d.classList.add("anim");
      this.sync(el);
    },
    sync(el) {
      const m = D.MOMENTS[step] || D.MOMENTS[0], n = S.mvotes[m.id] || 0, e = $(".m-n", el);
      if (e) e.innerHTML = n ? "<i></i>".repeat(Math.min(n, 20)) + `<em>${n}</em>` : "";
      $$(".mo", el).forEach((x, i) => { const v = S.mvotes[D.MOMENTS[i].id] || 0; x.classList.toggle("voted", v > 0); x.style.setProperty("--v", Math.min(1, v / 8)); });
    },
    notes: ["A day in the life. Step through Wake, Reset, Connect, Restore and Escape.", "Linger on Reset: between meetings, after coffee, before walking back into a room. It could be a very important new occasion.", "Connect is TheraBreath's core equity: fresh-breath confidence. Tap '+ Priority occasion' for each vote from the room."]
  });

  scene({
    id: "escape", ch: 3, tag: "Show", title: "The Flavor Passport", cls: "light s-pass", builds: 1,
    html: () => `
      ${K("03 · The Moments · Escape")}
      <h2 class="pass-t rv" style="--d:80">TheraBreath<br>Flavor Passport</h2>
      <p class="pass-alt rv" style="--d:160">or: the TheraBreath Discovery Series</p>
      <p class="x-lede rv" style="--d:240">A home for adventurous flavor: limited editions, seasonal drops and global discovery, without asking the core franchise to become experimental.</p>
      <p class="x-note rv" style="--d:320">Conceptual platform, not an approved recommendation.</p>
      <div class="book rv" style="--d:200">
        <div class="pg pg-l"><img src="brand/therabreath-logo.png" alt="TheraBreath"><span class="pk">Flavor Passport</span><span class="pn">Discovery Series · Vol. 01</span><span class="pl">Collected flavors</span><ol>${D.STAMPS.map(s => `<li>${esc(s.n)}</li>`).join("")}</ol></div>
        <div class="pg pg-r">${D.STAMPS.map((s, i) => `<div class="stamp ${s.shape}" style="left:${s.x}px;top:${s.y}px;--r:${s.r}deg;--c:${s.c};--i:${i}"><b>${esc(s.n)}</b><span>${esc(s.o)}</span><em>${esc(s.s)} edition</em></div>`).join("")}</div>
      </div>
      <div class="drops" data-b="1">${D.DROPS.map(d => `<div><span class="k">${d.s} drop</span><b>${esc(d.f)}</b></div>`).join("")}</div>`,
    notes: ["This is where the adventurous ideas can live: a passport of limited flavor drops.", "Advance: a year of drops. Collectible, seasonal, newsworthy, and the core franchise stays focused."]
  });

  /* ---------- chapter four */
  chapter(4, "light ch-4", `<div class="ph" data-src="${img("bench")}" style="--pos:60% 50%"></div><div class="scrim sc-full"></div>`, ["Chapter four: the payoff. What do we do with everything we've just seen and decided?"]);

  scene({
    id: "formula", ch: 4, tag: "Teach", title: "Idea → experience → formula", cls: "light s-formula", builds: 1,
    bg: `<div class="ph" data-src="${img("bench")}" style="--pos:66% 50%"></div><div class="scrim sc-f"></div>`,
    html: () => `
      ${K("04 · The Playbook · How flavor becomes product")}
      <h2 class="h-m rv" style="--d:80">From idea → experience → formula</h2>
      <p class="f-line rv" style="--d:160">A flavor isn't innovation until it works in the product.</p>
      <ol class="steps">${D.FORMULA.map((s, i) => `<li class="rv" style="--d:${260 + i * 90}"><span class="n">${String(i + 1).padStart(2, "0")}</span><b>${esc(s[0])}</b><span class="d">${esc(s[1])}</span></li>`).join("")}</ol>
      <div class="tech" data-b="1"><span class="k">What the bench has to solve in an oxygen-based rinse</span><div class="tt">${D.TECH.map(x => `<span>${esc(x)}</span>`).join("")}</div>
        <p>Sodium chlorite is an oxidizing system. Many of the notes that make a flavor feel fresh (citrus aldehydes, green notes, some vanilla materials) are exactly the ones it attacks. Designing around that is where ideas become products.</p></div>`,
    notes: ["This is the difference between a trend deck and a flavor partner.", "Advance: the technical reality of an oxygen system. Keep it light: we don't lecture on chemistry, we just show we've done it before."]
  });

  scene({
    id: "horizons", ch: 4, tag: "Decide", title: "Three horizons", cls: "light s-hz",
    html: () => `
      ${K("04 · The Playbook")}
      <h2 class="h-m rv" style="--d:80">Three horizons of freshness innovation</h2>
      <div class="hz3">${D.HORIZONS.map((h, i) => `<section class="hz rv" data-h="${h.id}" style="--d:${200 + i * 120}"><header><span class="k">Horizon ${i + 1}</span><h3>${h.l}</h3><b>${esc(h.s)}</b><p>${esc(h.d)}</p></header><div class="hz-items"></div></section>`).join('<i class="hz-ar rv" style="--d:300"></i>')}</div>
      <p class="hz-note rv" style="--d:600">An innovation framework, not a list of committed launches.<span class="ws-only"> Drag an item, or use its arrows, to move it between horizons.</span></p>`,
    init(el) {
      const move = (id, dir) => { const it = D.ITEMS.find(x => x.id === id), H3 = ["now", "next", "future"], k = H3.indexOf(hzOf(it)) + dir; if (k < 0 || k > 2) return; mutate(s => { s.hz[id] = H3[k]; }); };
      el.addEventListener("click", e => { const b = e.target.closest("[data-mv]"); if (b) move(b.closest(".hi").dataset.id, +b.dataset.mv); });
      // pointer drag between columns (works under the stage scale)
      let drag = null;
      el.addEventListener("pointerdown", e => {
        const it = e.target.closest(".hi"); if (!it || e.target.closest("button") || document.body.dataset.mode !== "workshop") return;
        drag = { el: it, id: it.dataset.id, x: e.clientX, y: e.clientY, moved: false }; it.setPointerCapture(e.pointerId);
      });
      el.addEventListener("pointermove", e => {
        if (!drag) return; const s = +getComputedStyle(document.documentElement).getPropertyValue("--s") || 1;
        const dx = (e.clientX - drag.x) / s, dy = (e.clientY - drag.y) / s; if (Math.hypot(dx, dy) > 6) drag.moved = true;
        drag.el.style.transform = `translate(${dx}px,${dy}px) rotate(${clamp(dx / 40, -3, 3)}deg)`; drag.el.classList.add("dragging");
        $$(".hz", el).forEach(z => { const r = z.getBoundingClientRect(); z.classList.toggle("over", e.clientX > r.left && e.clientX < r.right); });
      });
      const end = e => {
        if (!drag) return; const d = drag; drag = null; d.el.style.transform = ""; d.el.classList.remove("dragging");
        const z = $$(".hz", el).find(z => z.classList.contains("over")); $$(".hz", el).forEach(z => z.classList.remove("over"));
        if (d.moved && z && z.dataset.h !== hzOf(D.ITEMS.find(x => x.id === d.id))) mutate(s => { s.hz[d.id] = z.dataset.h; });
      };
      el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
    },
    sync(el) {
      D.HORIZONS.forEach(h => {
        $(`.hz[data-h="${h.id}"] .hz-items`, el).innerHTML = D.ITEMS.filter(it => hzOf(it) === h.id).map(it => {
          const t = it.terr ? T[it.terr] : null;
          return `<div class="hi ${it.k}" data-id="${it.id}" style="--c:${t ? t.acc : "#9FB3C2"}"><i></i><span>${esc(it.l)}</span><span class="mv ws-only"><button type="button" data-mv="-1" aria-label="Move earlier">‹</button><button type="button" data-mv="1" aria-label="Move later">›</button></span></div>`;
        }).join("");
      });
    },
    notes: ["Now, Next, Future. The concepts we tasted sit alongside bigger platform ideas.", "In workshop mode, drag items between horizons as the room debates. Nothing here is a committed launch; it's the framework."]
  });

  scene({
    id: "actions", ch: 4, tag: "Decide", title: "Next development actions", cls: "light s-act",
    html: () => `
      ${K("04 · The Playbook")}
      <h2 class="h-m rv" style="--d:80">What happens on Tuesday?</h2>
      <p class="x-lede rv" style="--d:160">Choose the development actions we commit to leaving the room.</p>
      <div class="act-col rv" style="--d:240"><div class="acts"></div>
      <form class="act-add ws-only"><input type="text" placeholder="Add an action from the room…" aria-label="Add an action"><button type="submit">Add</button></form></div>
      <aside class="sofar rv" style="--d:300"></aside>`,
    init(el) {
      el.addEventListener("click", e => {
        const a = e.target.closest("[data-act]"); if (a) return mutate(s => { s.acts[a.dataset.act] = !s.acts[a.dataset.act]; });
        const x = e.target.closest("[data-del]"); if (x) return mutate(s => { s.custom.splice(+x.dataset.del, 1); });
        if (e.target.closest(".to-pb")) go(SC.findIndex(s => s.id === "playbook"));
      });
      $(".act-add", el).addEventListener("submit", e => { e.preventDefault(); const i = $("input", e.target), v = i.value.trim(); if (!v) return; i.value = ""; mutate(s => { s.custom.push(v); s.acts["c" + (s.custom.length - 1)] = true; }); });
    },
    sync(el) {
      const list = D.ACTIONS.map(a => ({ id: a.id, l: a.l, o: a.o })).concat(S.custom.map((l, i) => ({ id: "c" + i, l, o: "From the room", del: i })));
      $(".acts", el).innerHTML = list.map(a => `<button type="button" class="act ${S.acts[a.id] ? "on" : ""}" data-act="${a.id}"><i></i><span>${esc(a.l)}</span><em>${esc(a.o)}</em>${a.del != null ? `<span class="del ws-only" data-del="${a.del}" title="Remove">×</span>` : ""}</button>`).join("");
      const nS = D.SIGNALS.filter(s => S.stars[s.id]).length, tv = ranked(S.tvotes, ORDER).length, mv = ranked(S.mvotes, D.MOMENTS.map(m => m.id)).length;
      $(".sofar", el).innerHTML = `<span class="k">So far, the room has chosen</span>
        <div><b>${nS}</b><span>signal${nS === 1 ? "" : "s"} that matter</span></div><div><b>${tv}</b><span>territor${tv === 1 ? "y" : "ies"} with votes</span></div><div><b>${mv}</b><span>priority occasion${mv === 1 ? "" : "s"}</span></div><div><b>${votesTotal()}</b><span>votes on the sensory direction</span></div>
        <button type="button" class="to-pb">Assemble the playbook →</button>`;
    },
    notes: ["Make it concrete: which of these do we commit to leaving the room today?", "Add anything the room suggests in workshop mode. Then assemble the playbook."]
  });

  scene({
    id: "playbook", ch: 4, tag: "Decide", title: "The TheraBreath Flavor Playbook", cls: "light s-pb",
    html: () => `
      <header class="pb-h rv"><div><span class="k">Built in the room · ${esc(D.SESSION.place)} · ${esc(D.SESSION.date)}</span><h2>The TheraBreath Flavor Playbook</h2></div><div class="pb-lg"><img src="brand/therabreath-logo.png" alt="TheraBreath"><span>×</span><img src="brand/tff-logo.webp" alt="The Flavor Factory"></div></header>
      <section class="pb pb-sig rv" style="--d:120"><h4>The consumer signals</h4><div class="pb-c"></div></section>
      <section class="pb pb-dir rv" style="--d:220"><h4>The sensory direction</h4><canvas class="orb" width="520" height="520"></canvas><p class="pb-say"></p></section>
      <section class="pb pb-terr rv" style="--d:320"><h4>The chosen flavor territories</h4><div class="pb-c"></div></section>
      <section class="pb pb-occ rv" style="--d:420"><h4>The priority occasions</h4><div class="pb-c"></div></section>
      <section class="pb pb-now rv" style="--d:500"><h4>Near-term explorations</h4><div class="pb-c"></div></section>
      <section class="pb pb-fut rv" style="--d:580"><h4>Future white space</h4><div class="pb-c"></div></section>
      <section class="pb pb-act rv" style="--d:660"><h4>Next development actions</h4><div class="pb-c"></div></section>`,
    init(el) { this.orb = new Orb($(".orb", el), { still: true }); },
    enter() { this.orb.start(); }, leave() { this.orb.stop(); },
    sync(el) {
      const pend = t => `<p class="pend">${t}</p>`;
      const st = D.SIGNALS.filter(s => S.stars[s.id]);
      $(".pb-sig .pb-c", el).innerHTML = st.length ? `<ol>${st.map(s => `<li><b>${esc(s.name)}</b><span>${esc(s.need)}</span></li>`).join("")}</ol>` : pend("Star the signals that matter in chapter one.");
      const tr = ranked(S.tvotes, ORDER).slice(0, 3);
      $(".pb-terr .pb-c", el).innerHTML = tr.length ? tr.map(([id, v]) => { const t = T[id]; const w = S.where[id] ? D.MOMENTS.filter(m => S.where[id][m.id]).map(m => m.l) : []; return `<div class="pt" style="--c:${t.acc}"><i style="background-image:url(${img(t.img, 1)})"></i><div><span class="k">${esc(t.terr)}</span><b>${esc(t.name)}</b><em>${v} vote${v > 1 ? "s" : ""}${w.length ? " · lives at " + w.join(", ") : ""}</em></div></div>`; }).join("") : pend("Vote on the territories in 'Your turn'.");
      const mr = ranked(S.mvotes, D.MOMENTS.map(m => m.id));
      $(".pb-occ .pb-c", el).innerHTML = mr.length ? `<div class="occ">${mr.map(([id, v], i) => `<div style="--f:${v / mr[0][1]}"><b>${esc(D.MOMENTS.find(m => m.id === id).l)}</b><i></i><em>${v}</em></div>`).join("")}</div>` : pend("Prioritize occasions in chapter three.");
      const list = h => D.ITEMS.filter(it => hzOf(it) === h);
      const li = it => `<li style="--c:${it.terr ? T[it.terr].acc : "#9FB3C2"}">${esc(it.s || it.l)}</li>`;
      $(".pb-now .pb-c", el).innerHTML = `<ul>${list("now").map(li).join("")}</ul>`;
      $(".pb-fut .pb-c", el).innerHTML = `<ul>${list("future").map(li).join("")}</ul>`;
      const acts = D.ACTIONS.filter(a => S.acts[a.id]).map(a => a.l).concat(S.custom.filter((c, i) => S.acts["c" + i]));
      $(".pb-act .pb-c", el).innerHTML = acts.length ? `<ol>${acts.map(a => `<li>${esc(a)}</li>`).join("")}</ol>` : pend("Choose the next actions on the previous screen.");
      this.orb.set(leans(), votesTotal());
      $(".pb-say", el).textContent = direction() || "Set in 'Your turn'.";
    },
    notes: ["Everything the room chose, on one page. Give people a moment to photograph it.", "Print it from the console (Export) so it can go out the same afternoon."]
  });

  scene({
    id: "finale", ch: 6, tag: "Teach", title: "Built together", cls: "s-fin", builds: 1,
    bg: `<div class="fin-bg"></div><div class="fin-words">${D.VOCAB.map((v, i) => `<span style="left:${(v.x / W * 100).toFixed(1)}%;top:${(v.y / H * 100).toFixed(1)}%;--i:${i}">${esc(v.w)}</span>`).join("")}</div>`,
    html: () => `
      <p class="fin-k k rv">TheraBreath × The Flavor Factory</p>
      <h2 class="fin-t rv" style="--d:200">The Future of Freshness</h2>
      <p class="fin-b" data-b="1">Built together.</p>
      <div class="fin-foot" data-b="1"><img src="brand/therabreath-logo.png" alt="TheraBreath"><span>×</span><img src="brand/tff-logo.webp" alt="The Flavor Factory"><span class="k">${esc(D.SESSION.date)}</span></div>`,
    notes: ["Pause. Then advance for the last line: built together.", "Thank the room, and propose the next working session date before people stand up."]
  });

  /* ------------------------------------------------------------------ orb: the room's freshness, drawn */
  const hex2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mixRGB = (a, b, t) => a.map((v, i) => Math.round(lerp(v, b[i], t)));
  /* A living form whose colour, edge, motion and satellites follow the room's five leans. */
  function Orb(cv, o = {}) {
    const ctx = cv.getContext("2d"), still = !!o.still, size = +cv.getAttribute("width");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.style.width = size + "px"; cv.style.height = size + "px"; cv.width = size * dpr; cv.height = size * dpr;
    const P = { adv: 0, cool: 0, bot: 0, exp: 0, occ: 0 }, C = Object.assign({}, P);
    let raf = 0; const t0 = performance.now();
    const PAL = {
      cool: ["#1B75BB", "#62CCE0", "#3E9BD6", "#9ED8EE"].map(hex2rgb),
      bot: ["#6FA374", "#A6CE39", "#4F8A5B", "#B9D98F"].map(hex2rgb),
      adv: ["#F2C500", "#E8907F", "#F58025", "#9D93D6"].map(hex2rgb),
      soft: ["#EBCF9E", "#C9C1EC", "#F3C9C0", "#DCE7F2"].map(hex2rgb)
    };
    const ACC = PAL.adv;
    function frame(now) {
      const t = still ? 12 : (now - t0) / 1000;
      let settled = true;
      for (const k in P) { C[k] = lerp(C[k], P[k], .07); if (Math.abs(C[k] - P[k]) > .004) settled = false; }
      const u = k => (C[k] + 1) / 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, size, size);
      const c = size / 2, R = size * .28, soft = u("cool");
      const facets = soft < .45 ? Math.round(6 + (1 - soft) * 4) : 0;
      const w = { cool: .35 + (1 - u("bot")) * (1 - u("adv")) * (1 - soft) * 1.3, bot: u("bot") * 1.1, adv: u("adv") * .95, soft: soft * .8 };
      const tw = w.cool + w.bot + w.adv + w.soft, order = ["cool", "bot", "adv", "soft"];
      ctx.globalCompositeOperation = "source-over";
      for (let k = 0; k < 7; k++) {
        let q = (k * 3 % 7 + .5) / 7 * tw, fam = order[0];
        for (const f of order) { if (q <= w[f]) { fam = f; break; } q -= w[f]; }
        const col = PAL[fam][k % 4];
        const amp = .03 + .14 * u("exp"), sp = .12 + .8 * u("exp"), rr = R * (.56 + .07 * Math.sin(k * 1.9));
        const ang = k / 7 * Math.PI * 2 + t * .06 * sp + Math.sin(t * .2 * sp + k) * .15 * u("exp"), dist = R * (.26 + .12 * u("exp"));
        const ox = Math.cos(ang) * dist, oy = Math.sin(ang) * dist;
        const N = facets || 96;
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const a = i / N * Math.PI * 2 + k * .4;
          const nz = Math.sin(a * 3 + k + t * sp) * .5 + Math.sin(a * 5 - k * 1.3 + t * sp * 1.3) * .3 + Math.sin(a * 2 + k * 2 - t * sp * .7) * .4;
          const r = rr * (1 + amp * nz), x = c + ox + Math.cos(a) * r, y = c + oy + Math.sin(a) * r;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath();
        const g = ctx.createRadialGradient(c + ox, c + oy, 0, c + ox, c + oy, rr * 1.12), rgb = col.join(",");
        g.addColorStop(0, `rgba(${rgb},.42)`); g.addColorStop(.5 + .38 * (1 - soft), `rgba(${rgb},.26)`); g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g; ctx.fill();
        if (facets) { ctx.strokeStyle = `rgba(${rgb},${(.35 * (1 - soft)).toFixed(3)})`; ctx.lineWidth = 1.2; ctx.stroke(); }
      }
      const sats = Math.round(Math.max(0, C.occ) * 5);
      for (let s = 0; s < sats; s++) {
        const a = s / sats * Math.PI * 2 + t * .08, x = c + Math.cos(a) * R * 1.4, y = c + Math.sin(a) * R * 1.4, r2 = R * .18;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r2), rgb = ACC[s % 5].join(",");
        g.addColorStop(0, `rgba(${rgb},.5)`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = "screen";
      const h = ctx.createRadialGradient(c, c, 0, c, c, R * .7);
      h.addColorStop(0, "rgba(255,255,255,.55)"); h.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = h; ctx.beginPath(); ctx.arc(c, c, R * 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      raf = (still && settled) || !cv.closest(".scene.on") ? 0 : requestAnimationFrame(frame);
    }
    this.set = p => { Object.assign(P, p); if (!raf) raf = requestAnimationFrame(frame); };
    this.start = () => { if (!raf) raf = requestAnimationFrame(frame); };
    this.stop = () => { cancelAnimationFrame(raf); raf = 0; };
  }

  /* ------------------------------------------------------------------ engine */
  let cur = -1, step = 0, tasting = false, blankOn = false, tastingReturn = 0;
  const tasteIdx = () => SC.map((s, i) => s.tag === "Taste" ? i : -1).filter(i => i >= 0);

  function hydrate(i) {
    const sc = SC[i]; if (!sc || !sc.el || sc.hyd) return; sc.hyd = true;
    $$("[data-src]", sc.el).forEach(e => { if (e.tagName === "IMG") e.src = e.dataset.src; else e.style.backgroundImage = `url(${e.dataset.src})`; });
  }

  function go(i, b = 0, o = {}) {
    if (i == null || i < 0) return;
    i = clamp(i | 0, 0, SC.length - 1);
    const sc = SC[i], changed = i !== cur;
    b = clamp(b | 0, 0, sc.builds || 0);
    if (CONSOLE) { cur = i; step = b; consoleSync(); if (!o.remote) send({ t: "nav", i, b }); return; }
    if (changed) {
      const old = SC[cur];
      if (old) { old.el.classList.remove("on"); old.leave && old.leave(old.el); }
      cur = i; [i - 1, i, i + 1, i + 2].forEach(hydrate);
      sc.el.classList.add("on");
    }
    step = b; applyStep(sc);
    if (changed) { sc.sync && sc.sync(sc.el); sc.enter && sc.enter(sc.el); }
    chrome(); notesSync();
    if (!EMBED) history.replaceState(null, "", "#" + sc.id + (step ? "/" + step : ""));
    if (!o.remote) send({ t: "nav", i: cur, b: step });
  }
  function applyStep(sc) {
    sc.el.dataset.step = step;
    $$("[data-b]", sc.el).forEach(e => e.classList.toggle("in", step >= +e.dataset.b));
    $$("[data-bo]", sc.el).forEach(e => e.classList.toggle("out", step >= +e.dataset.bo));
    sc.step && sc.step(sc.el, step);
  }
  function next() {
    const sc = SC[cur];
    if (step < (sc.builds || 0)) return go(cur, step + 1);
    if (tasting) { const L = tasteIdx(), k = L.indexOf(cur); if (k >= 0 && k < L.length - 1) go(L[k + 1]); return; }
    if (cur < SC.length - 1) go(cur + 1, 0);
  }
  function prev() {
    if (step > 0) return go(cur, step - 1);
    if (tasting) { const L = tasteIdx(), k = L.indexOf(cur); if (k > 0) go(L[k - 1], SC[L[k - 1]].builds || 0); return; }
    if (cur > 0) go(cur - 1, SC[cur - 1].builds || 0);
  }
  function refresh() { const sc = SC[cur]; if (!CONSOLE && sc && sc.sync) sc.sync(sc.el); notesSync(); if (CONSOLE) consoleSync(); }

  function setMode(m, o = {}) { document.body.dataset.mode = m; try { localStorage.setItem(KEY + ":mode", m); } catch (e) { } chrome(); if (!o.remote) send({ t: "mode", mode: m }); }
  function setTasting(on, o = {}) {
    if (on === tasting) return; tasting = on; document.body.classList.toggle("tasting", on);
    if (!CONSOLE && !EMBED) {
      if (on) { tastingReturn = cur; const sc = SC[cur]; const L = tasteIdx(); const own = sc && sc.terr ? SC.findIndex(s => s.id === "taste-" + sc.terr) : -1; go(own >= 0 ? own : L[0]); }
      else go(tastingReturn);
    }
    if (!o.remote) send({ t: "tasting", on });
    chrome();
  }
  function setBlank(on, o = {}) { blankOn = on; document.body.classList.toggle("blanked", on); if (!o.remote) send({ t: "blank", on }); }

  /* ------------------------------------------------------------------ chrome */
  const chapterName = sc => sc.ch >= 1 && sc.ch <= 4 ? `${D.CHAPTERS[sc.ch].n} · ${D.CHAPTERS[sc.ch].title}` : sc.ch === 5 ? "Your turn" : sc.ch === 6 ? "Built together" : "The Future of Freshness";
  function chrome() {
    const sc = SC[cur]; if (!sc || CONSOLE) return;
    $("#hud-ch").textContent = chapterName(sc);
    $("#hud-t").textContent = sc.title;
    $("#hud-tag").textContent = sc.tag; $("#rtag").textContent = sc.tag;
    $("#hud-n").textContent = `${cur + 1} / ${SC.length}`;
    $("#prog i").style.width = ((cur + (sc.builds ? step / (sc.builds + 1) : 0)) / (SC.length - 1) * 100) + "%";
    $$("#hud .md button").forEach(b => b.classList.toggle("sel", b.dataset.m === document.body.dataset.mode));
    $("#b-taste").classList.toggle("sel", tasting);
    $$("#dock-ch button").forEach(b => b.classList.toggle("sel", +b.dataset.ch === sc.ch));
  }
  function notesSync() {
    const sc = SC[cur], ta = $("#notes textarea"); if (!sc || !ta) return;
    $("#notes .nt").textContent = sc.title;
    if (document.activeElement !== ta) ta.value = S.notes[sc.id] || "";
  }
  let toastT = 0;
  function toast(m) { const t = $("#toast"); if (!t) return; t.textContent = m; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 1600); }
  function pulse() { const s = SC[cur]; if (s && s.el) { s.el.classList.remove("pulse"); void s.el.offsetWidth; s.el.classList.add("pulse"); } }

  function rehearsal() {
    mutate(s => {
      s.stars = { citrus: true, ritual: true, intensity: true };
      s.spectra = { adv: [0, 2, 3, 5, 2], cool: [1, 3, 3, 4, 1], bot: [0, 1, 3, 6, 2], exp: [1, 2, 2, 5, 2], occ: [0, 2, 3, 4, 3] };
      s.tvotes = { yuzu: 9, cucumber: 7, ginger: 6, grapefruit: 4, pear: 2, night: 5 };
      s.mvotes = { reset: 8, connect: 7, wake: 4, restore: 3, escape: 2 };
      s.taste = { yuzu: { 0: 3, 1: 8 }, cucumber: { 0: 7, 1: 2, 2: 3 }, ginger: { 0: 1, 1: 4, 2: 7 } };
      s.where = { yuzu: { wake: true, connect: true }, cucumber: { reset: true }, ginger: { reset: true } };
      s.acts = { bench: true, stab: true, panel: true, daypart: true, cadence: true };
    }, true);
    toast("Rehearsal data loaded");
  }
  function resetAll() { if (!confirm("Clear every vote, note and choice from this workshop?")) return; mutate(s => { const b = blank(); Object.keys(b).forEach(k => { s[k] = b[k]; }); }, true); toast("Workshop cleared"); }
  function exportData() {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "therabreath-flavor-playbook.json"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function printPlaybook() { const i = SC.findIndex(s => s.id === "playbook"); if (CONSOLE) { send({ t: "nav", i, b: 0 }); return toast("Print from the display window (Ctrl/Cmd+P)"); } go(i); setTimeout(() => print(), 700); }

  /* ------------------------------------------------------------------ build the page */
  function buildDeck() {
    document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="tbLogo" viewBox="0 0 800 207"><image width="800" height="207" href="brand/therabreath-logo.png"/></symbol></svg>`);
    const deck = $("#deck");
    SC.forEach((sc, i) => {
      const el = document.createElement("section");
      el.className = "scene " + (sc.cls || ""); el.dataset.id = sc.id; el.setAttribute("aria-label", sc.title);
      if (sc.vars) el.setAttribute("style", sc.vars);
      el.innerHTML = `<div class="bg">${sc.bg || ""}</div><div class="stage">${sc.html()}</div>`;
      deck.appendChild(el); sc.el = el;
    });
    SC.forEach(sc => sc.init && sc.init.call(sc, sc.el));
    // bind scene methods so `this` is the scene definition everywhere
    SC.forEach(sc => ["step", "sync", "enter", "leave"].forEach(k => { if (sc[k]) sc[k] = sc[k].bind(sc); }));

    if (EMBED) { document.body.classList.add("embed"); return; }
    // overview
    $("#ov-grid").innerHTML = [0, 1, 2, 5, 3, 4, 6].map(ch => {
      const list = SC.map((s, i) => [s, i]).filter(([s]) => s.ch === ch); if (!list.length) return "";
      return `<section><h3>${chapterName(list[0][0])}</h3><div>${list.map(([s, i]) => `<button type="button" data-i="${i}"><span class="k">${String(i + 1).padStart(2, "0")} · ${s.tag}</span><b>${esc(s.title)}</b></button>`).join("")}</div></section>`;
    }).join("");
    $("#ov-grid").addEventListener("click", e => { const b = e.target.closest("[data-i]"); if (b) { go(+b.dataset.i); toggleOverview(false); } });
    $("#overview").addEventListener("click", e => { if (e.target.id === "overview" || e.target.closest(".ov-x")) toggleOverview(false); });
    $("#dock-ch").innerHTML = [0, 1, 2, 5, 3, 4, 6].map(ch => { const i = SC.findIndex(s => s.ch === ch); return `<button type="button" data-ch="${ch}" data-i="${i}" title="${esc(chapterName(SC[i]))}">${ch >= 1 && ch <= 4 ? D.CHAPTERS[ch].n : ch === 0 ? "Intro" : ch === 5 ? "You" : "End"}</button>`; }).join("");
    $("#dock-ch").addEventListener("click", e => { const b = e.target.closest("[data-i]"); if (b) go(+b.dataset.i); });
    // HUD and dock
    $("#hud").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.m) setMode(b.dataset.m);
      else if (b.id === "b-taste") setTasting(!tasting);
      else if (b.id === "b-ov") toggleOverview();
      else if (b.id === "b-full") toggleFull();
      else if (b.id === "b-more") $("#more").classList.toggle("open");
    });
    $("#more").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return; $("#more").classList.remove("open");
      ({ console: () => open("index.html?console", "tb-console", "width=1400,height=860"), rehearse: rehearsal, reset: resetAll, export: exportData, print: printPlaybook, help: () => $("#help").classList.add("open") })[b.dataset.a]();
    });
    $("#d-prev").onclick = prev; $("#d-next").onclick = next; $("#d-notes").onclick = () => toggleNotes(); $("#d-undo").onclick = undo;
    $("#notes textarea").addEventListener("input", e => { const id = SC[cur].id, v = e.target.value; S.notes[id] = v; save(); send({ t: "state", s: S }); });
    $("#notes .x").onclick = () => toggleNotes(false);
    $("#help").addEventListener("click", e => { if (e.target === e.currentTarget || e.target.closest(".x")) $("#help").classList.remove("open"); });
    $("#blank").addEventListener("click", () => setBlank(false));
    // auto-hide the HUD in presenter mode
    let idle = 0; const wake = () => { document.body.classList.add("awake"); clearTimeout(idle); idle = setTimeout(() => document.body.classList.remove("awake"), 2600); };
    addEventListener("mousemove", wake, { passive: true }); wake();
    // touch swipe
    let tx = null;
    $("#deck").addEventListener("touchstart", e => { if (e.target.closest("button, input, select, textarea, .hi")) return; tx = [e.touches[0].clientX, e.touches[0].clientY]; }, { passive: true });
    $("#deck").addEventListener("touchend", e => { if (!tx) return; const dx = e.changedTouches[0].clientX - tx[0], dy = e.changedTouches[0].clientY - tx[1]; tx = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)(); });
  }

  function toggleOverview(on) { const o = $("#overview"); const v = on == null ? !o.classList.contains("open") : on; o.classList.toggle("open", v); if (v) { $$("#ov-grid button").forEach(b => b.classList.toggle("sel", +b.dataset.i === cur)); } }
  function toggleNotes(on) { const n = $("#notes"); const v = on == null ? !n.classList.contains("open") : on; n.classList.toggle("open", v); if (v) $("textarea", n).focus({ preventScroll: true }); else if (document.activeElement === $("textarea", n)) document.activeElement.blur(); }
  function toggleFull() { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => { }); }

  addEventListener("keydown", e => {
    if (EMBED) return;
    if (e.target.closest && e.target.closest("input, textarea, select")) { if (e.key === "Escape") e.target.blur(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); return undo(); }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (blankOn && !["b", "B", "."].includes(k)) { setBlank(false); if (k === "Escape") return; }
    if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(k)) { e.preventDefault(); next(); }
    else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k)) { e.preventDefault(); prev(); }
    else if (k === "Home") go(0);
    else if (k === "End") go(SC.length - 1);
    else if (k === "g" || k === "G") { if (!CONSOLE) toggleOverview(); }
    else if (k === "Escape") { if (!CONSOLE) { toggleOverview(false); toggleNotes(false); $("#help").classList.remove("open"); $("#more").classList.remove("open"); } if (tasting) setTasting(false); }
    else if (k === "p" || k === "P") setMode("present");
    else if (k === "w" || k === "W") setMode("workshop");
    else if (k === "t" || k === "T") setTasting(!tasting);
    else if (k === "f" || k === "F") toggleFull();
    else if (k === "b" || k === "B" || k === ".") setBlank(!blankOn);
    else if (k === "n" || k === "N") { if (!CONSOLE) { e.preventDefault(); toggleNotes(); } }
    else if (k === "z" || k === "Z") undo();
    else if (k === "y" || k === "Y") go(SC.findIndex(s => s.id === "yt"));
    else if (k === "?" || k === "h" || k === "H") { if (!CONSOLE) $("#help").classList.toggle("open"); }
    else if (/^[1-4]$/.test(k)) go(SC.findIndex(s => s.id === "ch" + k));
  });

  function fit() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    document.documentElement.style.setProperty("--s", s.toFixed(5));
    document.body.classList.toggle("narrow", innerWidth < 760 && innerHeight > innerWidth);
  }

  /* ------------------------------------------------------------------ presenter console */
  let t0 = null, clockT = 0;
  function buildConsole() {
    document.body.classList.add("console");
    document.body.innerHTML = `
      <div id="con">
        <header><div class="c-brand"><img src="brand/therabreath-logo.png" alt=""><span>×</span><img src="brand/tff-logo.webp" alt=""><b>Presenter console</b></div>
          <div class="c-time"><span id="c-clock"></span><span id="c-el">00:00</span><button type="button" id="c-tm">Start timer</button></div></header>
        <main>
          <section class="c-now"><div class="c-frame"><iframe id="c-if" title="Live display" src="index.html?embed"></iframe></div>
            <div class="c-ctl"><button type="button" id="c-prev">‹ Back</button><div class="c-pos"><span id="c-ch"></span><b id="c-title"></b><span id="c-step"></span></div><button type="button" id="c-next" class="pri">Next ›</button></div>
            <div class="c-next"><span class="k">Up next</span><b id="c-nx"></b></div></section>
          <aside>
            <div class="c-notes"><span class="k">Speaker notes</span><ul id="c-notes"></ul></div>
            <div class="c-room"><span class="k">Room notes for this screen</span><textarea id="c-room" placeholder="Capture what the room says…"></textarea></div>
            <div class="c-modes"><button type="button" data-m="present">Present</button><button type="button" data-m="workshop">Workshop</button><button type="button" id="c-taste">Tasting mode</button><button type="button" id="c-blank">Blank screen</button></div>
            <div class="c-ag"><span class="k">Agenda</span>${D.AGENDA.map(a => `<div><b>${a.t}</b><span>${esc(a.l)}</span></div>`).join("")}</div>
            <div class="c-tools"><button type="button" id="c-disp">Open display window</button><button type="button" id="c-reh">Load rehearsal data</button><button type="button" id="c-exp">Export answers</button><button type="button" id="c-print">Show playbook to print</button><button type="button" id="c-reset" class="warn">Reset workshop</button></div>
          </aside>
        </main>
        <div id="toast" role="status"></div>
      </div>`;
    const fitFrame = () => { const f = $(".c-frame"), s = f.clientWidth / W; $("#c-if").style.transform = `scale(${s})`; f.style.height = (H * s) + "px"; };
    addEventListener("resize", fitFrame); fitFrame();
    $("#c-prev").onclick = prev; $("#c-next").onclick = next;
    $$(".c-modes [data-m]").forEach(b => { b.onclick = () => { setMode(b.dataset.m); consoleSync(); }; });
    $("#c-taste").onclick = () => { setTasting(!tasting); consoleSync(); };
    $("#c-blank").onclick = () => { setBlank(!blankOn); consoleSync(); };
    $("#c-disp").onclick = () => open("index.html#" + (SC[cur] ? SC[cur].id : ""), "tb-display");
    $("#c-reh").onclick = rehearsal; $("#c-exp").onclick = exportData; $("#c-print").onclick = printPlaybook; $("#c-reset").onclick = resetAll;
    $("#c-room").addEventListener("input", e => { S.notes[SC[cur].id] = e.target.value; save(); send({ t: "state", s: S }); });
    $("#c-tm").onclick = () => { t0 = t0 ? null : Date.now(); $("#c-tm").textContent = t0 ? "Reset timer" : "Start timer"; };
    clockT = setInterval(() => {
      const d = new Date(); $("#c-clock").textContent = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      if (t0) { const s = Math.floor((Date.now() - t0) / 1000); $("#c-el").textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); } else $("#c-el").textContent = "00:00";
    }, 500);
  }
  function consoleSync() {
    if (!CONSOLE || cur < 0) return;
    const sc = SC[cur], nx = step < (sc.builds || 0) ? `${sc.title} · build ${step + 2} of ${(sc.builds || 0) + 1}` : (SC[cur + 1] ? SC[cur + 1].title : "End");
    $("#c-ch").textContent = chapterName(sc) + " · " + sc.tag; $("#c-title").textContent = sc.title;
    $("#c-step").textContent = sc.builds ? `Build ${step + 1} of ${sc.builds + 1}` : ""; $("#c-nx").textContent = nx;
    $("#c-notes").innerHTML = (sc.notes || []).map((n, i) => `<li class="${i === Math.min(step, (sc.notes || []).length - 1) ? "now" : ""}">${esc(n)}</li>`).join("");
    const ta = $("#c-room"); if (document.activeElement !== ta) ta.value = S.notes[sc.id] || "";
    $$(".c-modes [data-m]").forEach(b => b.classList.toggle("sel", b.dataset.m === (document.body.dataset.mode || "present")));
    $("#c-taste").classList.toggle("sel", tasting); $("#c-blank").classList.toggle("sel", blankOn);
  }

  /* ------------------------------------------------------------------ start */
  let savedMode = "present"; try { savedMode = localStorage.getItem(KEY + ":mode") || (Q.has("workshop") ? "workshop" : "present"); } catch (e) { }
  document.body.dataset.mode = Q.has("workshop") ? "workshop" : savedMode;
  const fromHash = () => { const h = decodeURIComponent(location.hash.slice(1)).split("/"); const i = SC.findIndex(s => s.id === h[0]); return [i < 0 ? 0 : i, +h[1] || 0]; };
  if (CONSOLE) {
    buildConsole(); cur = 0; consoleSync(); send({ t: "hello" });
  } else {
    buildDeck(); fit(); addEventListener("resize", fit);
    const [i, b] = fromHash(); go(i, b, { remote: EMBED });
    if (EMBED) send({ t: "hello" });
    addEventListener("hashchange", () => { const [i2, b2] = fromHash(); if (i2 !== cur || b2 !== step) go(i2, b2); });
    document.fonts && document.fonts.ready.then(() => { const sc = SC[cur]; sc && sc.step && sc.step(sc.el, step); });
  }
  window.TBF = { go, next, prev, get state() { return S; }, get cur() { return cur; }, scenes: SC.map(s => s.id), rehearsal };
})();
