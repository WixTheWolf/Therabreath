/* ==========================================================================
   Worlds of Fresh · scroll engine shared by the site and the pre-read
   - one fixed canvas paints the flavor world of the section on screen
   - the next section pours its world in over the last with a liquid edge
   - builders for the pieces both pages use: the six worlds with a pinned
     bottle, the sodium chlorite scene, the trend track, the agenda dial,
     the territory map, portals and kinetic type
   Everything reads from assets/playbook-core.js (window.TBCore).
   ========================================================================== */
(function () {
  "use strict";
  const T = window.TBCore;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = x => 1 - Math.pow(1 - clamp(x), 3);
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const UI = { REDUCED, esc, clamp, ease };
  const ICONIC = { liq: ["#4FB3E6", "#1A78C0"], band: "#6CC3EA", flavor: "Invigorating Icy Mint" };
  UI.ICONIC = ICONIC;
  const shield = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>`;

  /* ---------------------------------------------------------------- stage */
  let cv, ctx, W = 0, VH = 0, DPR = 1, S = 1, secs = [], tops = [], docH = 1, lastY = -1, lastKey = "", dirty = true;
  const scrollers = [], minis = [];
  UI.onScroll = fn => scrollers.push(fn);

  function measure() {
    W = innerWidth; VH = innerHeight;
    DPR = Math.min(devicePixelRatio || 1, 2, Math.sqrt(2.3e6 / (W * VH)));
    cv.width = Math.round(W * DPR); cv.height = Math.round(VH * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    S = Math.max(.3, Math.min(W, VH) / 900);
    scrollers.forEach(f => f.measure && f.measure());
    secs = $$("[data-world]"); tops = secs.map(s => s.getBoundingClientRect().top + scrollY);
    docH = document.documentElement.scrollHeight;
    minis.forEach(m => { const r = m.cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 1.5); m.w = r.width; m.h = r.height; m.cv.width = Math.max(1, r.width * d); m.cv.height = Math.max(1, r.height * d); m.c.setTransform(d, 0, 0, d, 0, 0); });
    dirty = true;
  }
  function edgePath(y, t, amp) {
    const A = 16 * S * amp; ctx.beginPath(); ctx.moveTo(0, VH + 2);
    for (let x = 0; x <= W + 24; x += 24) ctx.lineTo(x, y + A * Math.sin(x * .006 / S + t * 1.5) + A * .5 * Math.sin(x * .014 / S - t * 1.1));
    ctx.lineTo(W + 24, VH + 2); ctx.closePath();
  }
  function paint(key, t, p) { const wd = T.WORLDS[key] || T.WORLDS.oxygen; wd.draw(ctx, W, VH, t, {}, p); }
  function frame(now) {
    const t = REDUCED ? 6 : now / 1000, y = scrollY;
    const moved = y !== lastY; lastY = y;
    if (moved || !REDUCED || dirty) {
      let k = 0; for (let i = 0; i < tops.length; i++) if (tops[i] <= y + 1) k = i;
      const A = secs[k], B = secs[k + 1];
      if (A) {
        const pa = clamp((y - tops[k]) / Math.max(1, (tops[k + 1] || docH) - tops[k]));
        paint(A.dataset.world, t, pa);
        let tone = A.dataset.tone || T.WORLDS[A.dataset.world]?.tone || "light", title = A.dataset.title || "";
        if (B) {
          const edge = tops[k + 1] - y;
          if (edge < VH && B.dataset.world !== A.dataset.world) {
            const q = 1 - edge / VH, amp = Math.sin(q * Math.PI) * .9 + .1;
            ctx.save(); edgePath(edge, t, amp); ctx.clip(); paint(B.dataset.world, t, 0); ctx.restore();
            ctx.save(); edgePath(edge, t, amp); ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = Math.max(1.5, 3 * S); ctx.stroke(); ctx.restore();
          }
          if (edge < 64) { tone = B.dataset.tone || T.WORLDS[B.dataset.world]?.tone || "light"; title = B.dataset.title || title; }
        }
        if (document.body.dataset.tone !== tone) document.body.dataset.tone = tone;
        if (title !== lastKey) { lastKey = title; const wh = $("#where"); if (wh) wh.textContent = title; }
      }
      scrollers.forEach(f => f.update && f.update(y, t));
      const pr = $("#progress"); if (pr) pr.style.transform = `scaleX(${clamp(y / Math.max(1, docH - VH))})`;
      dirty = false;
    } else scrollers.forEach(f => f.tick && f.tick(t));
    if (!REDUCED || moved) minis.forEach(m => {
      const r = m.cv.getBoundingClientRect(); if (r.bottom < 0 || r.top > VH || !m.w) return;
      T.WORLDS[m.key].draw(m.c, m.w, m.h, t + m.off, {}, .4);
    });
    requestAnimationFrame(frame);
  }
  UI.mini = (canvas, key, off) => { const m = { cv: canvas, c: canvas.getContext("2d"), key, off: off || 0, w: 0, h: 0 }; minis.push(m); return m; };
  UI.start = () => {
    cv = $("#world"); if (!cv) { cv = document.createElement("canvas"); cv.id = "world"; cv.setAttribute("aria-hidden", "true"); document.body.prepend(cv); }
    ctx = cv.getContext("2d");
    measure();
    addEventListener("resize", () => { clearTimeout(UI._rz); UI._rz = setTimeout(measure, 120); });
    document.fonts && document.fonts.ready.then(measure);
    addEventListener("load", measure);
    setInterval(() => { const h = document.documentElement.scrollHeight; if (Math.abs(h - docH) > 2) measure(); }, 1200);
    requestAnimationFrame(frame);
    reveal();
  };

  /* ---------------------------------------------------------------- type + reveal */
  UI.kinetic = (el, mode) => {
    if (REDUCED || el.classList.contains("kin")) { el.classList.add("kin"); return; }
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { f.appendChild(document.createTextNode(" ")); return; }
          if (mode === "ch") {
            const w = document.createElement("span"); w.style.display = "inline-block"; w.style.whiteSpace = "nowrap";
            [...part].forEach(chr => { const s = document.createElement("span"); s.className = "ch"; s.style.setProperty("--i", i++); s.textContent = chr; w.appendChild(s); });
            f.appendChild(w);
          } else { const s = document.createElement("span"); s.className = "wd"; s.style.setProperty("--i", i++ * 2); s.textContent = part; f.appendChild(s); }
        });
        n.replaceWith(f);
      } else if (n.nodeType === 1 && n.tagName !== "BR" && n.tagName !== "SVG") walk(n);
    });
    walk(el); el.classList.add("kin");
  };
  let io;
  function reveal() {
    $$("[data-kin]").forEach(el => UI.kinetic(el, el.dataset.kin || "wd"));
    io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px", threshold: .12 });
    $$(".rv, .kin, .lineup, .dial, [data-reveal]").forEach(el => io.observe(el));
  }
  UI.observe = el => io ? io.observe(el) : 0;

  /* ---------------------------------------------------------------- bottles */
  UI.conceptBottle = c => T.bottle(T.conceptBottleOpts(c));
  UI.teaserBottle = c => T.bottle({ liq: c.liquid, band: c.acc, flavor: c.name, sub: c.flavor });
  UI.iconicBottle = () => T.bottle(ICONIC);
  UI.logo = href => document.body.insertAdjacentHTML("afterbegin", T.logoSymbol(href));

  /* ---------------------------------------------------------------- the six worlds */
  UI.sixWorlds = (host, o = {}) => {
    const C = o.concepts || T.CONCEPTS;
    const pops = Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return `<i class="pop" style="--bx:${Math.cos(a) * (140 + (i % 3) * 50)}px;--by:${Math.sin(a) * (180 + (i % 2) * 60)}px"></i>`; }).join("");
    host.classList.add("six");
    host.innerHTML = `<div class="six-track" aria-hidden="true"><div class="six-bottle"><div class="lab-host" data-lab="worlds" data-sx="0.25" data-mx="0.18" data-my="0.24" data-mparams='{"dist":26}'></div><div class="bt">${UI.conceptBottle(C[0])}${pops}</div></div></div>` + C.map((c, i) => {
      const [w1, ...rest] = c.name.split(" "), w2 = rest.join(" ");
      return `<section class="fw" data-world="${c.id}" data-tone="${c.tone}" data-title="${esc(c.name)}" id="w-${c.id}" style="--acc:${c.hi}">
        <div class="fw-pin">
          <div class="top"><span class="eyebrow"><b>${c.n}</b>${o.label || "Flavor world"} ${c.n} of 0${C.length}</span>${o.codes ? `<span class="chip"><i style="--c:${c.hi}"></i>Sample ${c.code}</span>` : ""}</div>
          <h2 class="mega${w1.length > 7 ? " long" : ""}" data-name style="${w1.length > 7 ? "font-size:clamp(52px,9.4vw,180px)" : ""}"><span class="ln">${esc(w1)}</span><span class="ln outline fg l2">${esc(w2)}</span></h2>
          <p class="tag rv">${esc(c.tag)}</p>
          <div class="low rv" style="--d:.15s">
            <div><div class="arc3"><div><b>Opening</b>${esc(c.arc[0])}</div><div><b>Heart</b>${esc(c.arc[1])}</div><div><b>Finish</b>${esc(c.arc[2])}</div></div>
              <div class="ww"><span class="chip"><i style="--c:${c.hi}"></i>For: ${esc(c.who)}</span><span class="chip"><i style="--c:${c.hi}"></i>When: ${esc(c.when)}</span></div></div>
            <div class="chem"><span class="mono">${shield}Built to survive sodium chlorite</span><div class="keys">${c.chem.keys.map(esc).join(" · ")}</div><p>${esc(c.chem.why)}</p></div>
          </div>
        </div></section>`;
    }).join("");
    const fws = $$(".fw", host), names = fws.map(f => $("[data-name]", f)), bw = $(".six-bottle", host);
    names.forEach(n => UI.kinetic(n, "ch"));
    const svg = () => $(".bottle", bw);
    let shown = 0, want = 0, busy = false;
    const swap = () => {
      if (busy || want === shown) return;
      busy = true; const target = want; bw.classList.add("drain");
      if (UI.lab3d) UI.lab3d.setWorld(target);
      setTimeout(() => {
        T.setBottle(svg(), T.conceptBottleOpts(C[target])); shown = target;
        bw.classList.remove("drain"); bw.classList.remove("slosh", "burst"); void bw.offsetWidth; bw.classList.add("slosh", "burst");
        setTimeout(() => { busy = false; swap(); }, 420);
      }, REDUCED ? 0 : 380);
    };
    let fTops = [];
    UI.onScroll({
      measure() { fTops = fws.map(f => f.getBoundingClientRect().top + scrollY); },
      update(y) {
        const mid = y + VH * .5; let k = 0;
        fTops.forEach((tp, i) => { if (tp <= mid) k = i; });
        if (k !== want) { want = k; UI.sixWant = k; swap(); }
        fws.forEach((f, i) => {
          const rel = (y - fTops[i]) / VH;
          if (rel > -1.2 && rel < 1.6) {
            const enter = clamp(1 + rel);
            names[i].style.setProperty("--wd", (76 + 20 * ease(enter)).toFixed(1) + "%");
            if (enter > .55) names[i].classList.add("in");
          }
        });
      }
    });
  };

  /* ---------------------------------------------------------------- sodium chlorite */
  UI.chemScene = (sec, o = {}) => {
    const X = T.CHEM;
    const order = ["s", "f", "s", "s", "f", "s", "f", "s", "s", "f", "s", "f"];
    let si = 0, fi = 0;
    const mobileKeep = { s: [0, 1, 2, 4], f: [0, 1, 2, 3] };
    const toks = order.map((kind, i) => {
      const d = kind === "s" ? X.stable[si++] : X.fragile[fi++], idx = kind === "s" ? si - 1 : fi - 1;
      const col = i % 4, row = Math.floor(i / 4);
      return { kind, d, x: 12 + col * 25.3, y: 12 + row * 38, m: mobileKeep[kind].includes(idx) };
    });
    sec.classList.add("chem-sec"); sec.dataset.world = "lab"; sec.dataset.tone = "dark";
    sec.innerHTML = `<div class="chem-pin">
      <div class="chem-head"><div><span class="eyebrow"><b>${o.num || "02"}</b>${esc(o.kicker || "Territories · the base")}</span><h2 class="display" data-kin style="margin-top:16px">Built to survive <span class="hl">oxygen.</span></h2></div>
        <p class="fact">${esc(X.fact)}</p></div>
      <div class="chem-stage"><div class="front"><span>Oxygen · sodium chlorite →</span></div>
        ${toks.map(k => `<div class="mol" data-kind="${k.kind}" data-m="${k.m ? 1 : 0}" style="--x:${k.x}%;--y:${k.y}%"><span class="badge">${k.kind === "s" ? "Survives" : esc(k.d.fate)}</span><b>${esc(k.d.m)}</b><span class="g">${esc(k.d.g)}</span><span class="f">${esc(k.d.f)}</span></div>`).join("")}
      </div>
      <div class="chem-foot"><div class="rule">${esc(X.rule)}</div><div><div class="legend"><span class="chip"><i style="--c:#7EE3AE"></i>Survives</span><span class="chip"><i style="--c:#FF8A5B"></i>Fades or turns</span></div><p class="cav" style="margin-top:10px">${esc(X.caveat)}</p></div></div>
    </div>`;
    const stage = $(".chem-stage", sec), front = $(".front", sec), foot = $(".chem-foot", sec), mols = $$(".mol", sec);
    let top = 0, hgt = 1, sw = 1, mobile = false;
    const place = () => {
      mobile = innerWidth < 760; let mi = 0;
      mols.forEach((m, i) => {
        const k = toks[i];
        if (mobile) { m.style.display = k.m ? "" : "none"; if (k.m) { const c2 = mi % 2, r2 = Math.floor(mi / 2); m.style.setProperty("--x", (26 + c2 * 48) + "%"); m.style.setProperty("--y", (6 + r2 * 29) + "%"); mi++; } }
        else { m.style.display = ""; m.style.setProperty("--x", k.x + "%"); m.style.setProperty("--y", k.y + "%"); }
      });
    };
    UI.onScroll({
      measure() { sec.style.height = (REDUCED ? 100 : 300) + "vh"; top = sec.getBoundingClientRect().top + scrollY; hgt = sec.offsetHeight; sw = stage.offsetWidth; place(); },
      update(y) {
        const q = REDUCED ? 1 : clamp((y - top) / Math.max(1, hgt - VH));
        const fq = clamp((q - .16) / .5), fx = -240 + fq * (sw + 480); front.style.setProperty("--fx", fx + "px"); front.style.setProperty("--fo", (fq > 0 && fq < 1 ? 1 : 0));
        const edgeX = fx + 220;
        mols.forEach((m, i) => {
          if (m.style.display === "none") return;
          const op = clamp((q - i * .008) / .08), mx = parseFloat(m.style.getPropertyValue("--x")) / 100 * sw, age = (edgeX - mx) / sw, hit = age > 0 && q > .16;
          const s = toks[i].kind === "s";
          m.classList.toggle("ok", hit && s); m.classList.toggle("hit", hit && !s);
          const drop = hit && !s ? ease(age / .35) : 0;
          m.style.setProperty("--op", (op * (1 - drop * .45)).toFixed(3));
          m.style.setProperty("--ty", (hit && s ? -6 * ease(age / .2) : drop * 10 + (1 - op) * 30).toFixed(1) + "px");
          m.style.setProperty("--rot", (drop * (i % 2 ? 5 : -5)).toFixed(2) + "deg");
          m.style.setProperty("--tx", (hit && !s && age < .06 ? Math.sin(age * 900) * 5 : 0).toFixed(1) + "px");
        });
        foot.style.setProperty("--ro", clamp((q - .68) / .14).toFixed(3));
      }
    });
  };

  /* ---------------------------------------------------------------- trend track */
  UI.trendTrack = (sec, o = {}) => {
    const L = T.TREND_LIST;
    sec.classList.add("track-sec"); sec.dataset.world = sec.dataset.world || "spectrum";
    sec.innerHTML = `<div class="track-pin">
      <div class="track-head"><div><span class="eyebrow"><b>${o.num || "01"}</b>Trends</span><h2 class="display" data-kin style="margin-top:14px">What’s shaping <span class="hl">oral care.</span></h2></div>
        <p class="small" style="max-width:30ch;margin:0">${esc(o.sub || "Flavor, sensory and consumer shifts we see from the bench and across the categories we work in.")}</p></div>
      <div class="track">${L.map((tr, i) => `<article class="tp"><canvas aria-hidden="true"></canvas><div class="txt"><span class="chip" style="align-self:flex-start;--chip:#fff;--line:rgba(7,28,60,.12);color:#071C3C"><i style="--c:${tr.c}"></i>${esc(T.TRENDS[tr.k])}</span><div class="word">${esc(tr.word)}</div><p class="h3">${esc(tr.h)}</p><div class="seen"><b>Where we see it</b>${esc(tr.seen)}</div></div><span class="num">0${i + 1} / 0${L.length}</span></article>`).join("")}</div>
      <div class="track-dots">${L.map(() => "<i></i>").join("")}</div></div>`;
    const track = $(".track", sec), dots = $$(".track-dots i", sec);
    $$(".tp canvas", sec).forEach((c, i) => UI.mini(c, L[i].art, i * 3));
    let top = 0, span = 1;
    UI.onScroll({
      measure() { span = Math.max(0, track.scrollWidth - innerWidth); sec.style.height = (innerHeight + span * (REDUCED ? 0 : 1.1)) + "px"; top = sec.getBoundingClientRect().top + scrollY; if (REDUCED) track.style.flexWrap = "wrap"; },
      update(y) {
        if (REDUCED) return;
        const q = clamp((y - top) / Math.max(1, sec.offsetHeight - innerHeight));
        track.style.transform = `translate3d(${(-q * span).toFixed(1)}px,0,0)`;
        dots.forEach((d, i) => d.style.setProperty("--f", clamp(q * L.length - i).toFixed(3)));
      }
    });
  };

  /* ---------------------------------------------------------------- agenda dial */
  UI.dial = (host, o = {}) => {
    const A = T.AGENDA, cols = ["#0A2A5C", "#E9B949", "#12A0A6", "#2EA8E6", "#D9577A", "#F58025"];
    const mins = a => { const [h, m] = a.split(":").map(Number); return h * 60 + m; };
    const R = 200, cx = 300, cy = 300, total = 120;
    let arcs = "", labels = "";
    A.forEach((a, i) => {
      const s0 = (mins(a.t) - 600) / total, s1 = (mins(a.e) - 600) / total, g = .006;
      const a0 = (s0 + g) * Math.PI * 2 - Math.PI / 2, a1 = (s1 - g) * Math.PI * 2 - Math.PI / 2, large = a1 - a0 > Math.PI ? 1 : 0;
      const p0 = [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R], p1 = [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R];
      const len = (a1 - a0) * R;
      arcs += `<path class="arc" d="M${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${R},${R} 0 ${large} 1 ${p1[0].toFixed(1)},${p1[1].toFixed(1)}" stroke="${cols[i]}" style="--len:${len.toFixed(1)};--i:${i}"/>`;
      const am = (a0 + a1) / 2, lx = cx + Math.cos(am) * (R + 50), ly = cy + Math.sin(am) * (R + 50), anc = Math.cos(am) > .2 ? "start" : Math.cos(am) < -.2 ? "end" : "middle";
      labels += `<text class="tm" x="${lx.toFixed(1)}" y="${(ly - 9).toFixed(1)}" text-anchor="${anc}">${a.t}</text><text class="lbl" x="${lx.toFixed(1)}" y="${(ly + 13).toFixed(1)}" text-anchor="${anc}">${esc(a.h)}</text>`;
    });
    host.classList.add("dial");
    host.innerHTML = `<svg viewBox="0 0 600 600" role="img" aria-label="Agenda from 10:00 to 12:00: ${A.map(a => a.t + " " + a.h).join(", ")}, then lunch"><circle cx="300" cy="300" r="${R}" fill="none" stroke="rgba(7,28,60,.08)" stroke-width="44"/>${arcs}${labels}
      <g class="hand"><circle cx="300" cy="100" r="15" fill="#fff" stroke="#F58025" stroke-width="6"/></g></svg>
      <div class="ctr"><div><b>10:00</b><span>to noon · ${esc(T.SESSION.room)}</span><span style="color:var(--orange-d)">then lunch</span></div></div>`;
    const hand = $(".hand", host);
    let top = 0;
    UI.onScroll({ measure() { top = host.getBoundingClientRect().top + scrollY; }, update(y) { const q = clamp((y + VH - top) / (VH + host.offsetHeight)); hand.style.transform = `rotate(${(q * 330).toFixed(1)}deg)`; } });
  };

  /* ---------------------------------------------------------------- territory map */
  UI.map = host => {
    const pos = m => `--x:${(7 + m.x * 86).toFixed(1)}%;--y:${(12 + m.y * 74).toFixed(1)}%`;
    host.classList.add("map");
    host.innerHTML = `<div class="sweet"><span>The sweet spot: familiar enough to trust</span></div>
      <span class="ax y0">Cool &amp; bright</span><span class="ax y1">Soft &amp; warm</span><div class="xline"></div><span class="ax x0">← Familiar</span><span class="ax x1">Adventurous →</span>
      ${T.TODAY.map(d => `<div class="orb today" style="${pos(d)}"><i></i><b>${esc(d.name)}</b></div>`).join("")}
      ${T.WILD.map((d, i) => `<div class="orb wild" style="${pos(d.map)};--c2:${d.acc};--s:62px;--dl:${-i * 1.7}s"><i></i><b>${esc(d.name)}</b></div>`).join("")}
      ${T.CONCEPTS.map((c, i) => `<div class="orb" style="${pos(c.map)};--c1:${c.liquid[0]};--c2:${c.acc};--dl:${-i * 1.1}s"><i></i><b>${esc(c.name)}</b></div>`).join("")}`;
  };

  /* ---------------------------------------------------------------- lineup + portals */
  UI.lineup = (host, withCodes) => {
    host.classList.add("lineup");
    host.innerHTML = T.CONCEPTS.map((c, i) => `<div class="bt" style="--i:${i}">${UI.conceptBottle(c)}<span>${withCodes ? "Sample " + c.code : esc(c.name)}</span></div>`).join("");
  };
  UI.portals = (host, items) => {
    host.classList.add("portals");
    host.innerHTML = items.map((d, i) => `<div class="portal rv" style="--d:${i * .12}s"><div class="disc"><canvas aria-hidden="true"></canvas></div><b>${esc(d.name)}</b><span>${esc(d.line)}</span>${d.chem ? `<small>${esc(d.chem)}</small>` : ""}</div>`).join("");
    $$("canvas", host).forEach((c, i) => UI.mini(c, items[i].id, i * 5));
  };


  /* ---------------------------------------------------------------- trend radar */
  // Qualitative radar: three lenses as sectors, maturity as rings (inner = mainstream).
  // Shape per lens + numbered labels, so identity never relies on colour alone.
  const shapeOf = { flavor: "circle", sensory: "square", consumer: "triangle" };
  const blipSvg = (lens, x, y, r, col, n) => {
    const sh = shapeOf[lens];
    const m = sh === "circle" ? `<circle cx="${x}" cy="${y}" r="${r}"/>` : sh === "square" ? `<rect x="${x - r * .9}" y="${y - r * .9}" width="${r * 1.8}" height="${r * 1.8}" rx="4"/>` : `<path d="M${x},${y - r * 1.1} L${x + r * 1.05},${y + r * .75} L${x - r * 1.05},${y + r * .75} Z"/>`;
    return `<g class="shape" fill="${col}" stroke="#fff" stroke-width="2">${m}</g><text x="${x}" y="${y + 4.5}" text-anchor="middle" class="bn">${n}</text>`;
  };
  UI.shapeIcon = (lens, col, size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 20 20" aria-hidden="true">${blipSvg(lens, 10, 10, 7, col, "").replace(/<text[^>]*><\/text>/, "")}</svg>`;
  UI.trendRadar = (host, o = {}) => {
    const L = T.LENSES, D = T.TREND_DEEP, keys = Object.keys(L);
    const C = 300, R = [0, 118, 205, 285];
    let rings = "", secs = "", blips = "";
    [3, 2, 1].forEach(k => rings += `<circle cx="${C}" cy="${C}" r="${R[k]}" class="ring r${k}"/>`);
    keys.forEach((k, i) => {
      const a0 = -Math.PI / 2 + i * Math.PI * 2 / 3, x = C + Math.cos(a0) * R[3], y = C + Math.sin(a0) * R[3];
      secs += `<line x1="${C}" y1="${C}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="spoke"/>`;
      const am = a0 + Math.PI / 3, lx = C + Math.cos(am) * (R[3] + 34), ly = C + Math.sin(am) * (R[3] + 34);
      secs += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" class="sec-l" fill="${L[k].c}">${L[k].h.toUpperCase()}</text>`;
    });
    T.STAGES.forEach((st, k) => secs += `<text x="${C + 6}" y="${C - (R[k] + R[k + 1]) / 2 + 4}" class="ring-l">${st.toUpperCase()}</text>`);
    D.forEach((d, n) => {
      const li = keys.indexOf(d.lens), same = D.filter(x => x.lens === d.lens && x.stage === d.stage), j = same.indexOf(d);
      const a = -Math.PI / 2 + li * Math.PI * 2 / 3 + Math.PI * 2 / 3 * ((j + 1) / (same.length + 1)) + (d.stage === 0 ? .05 : 0);
      const rr = (R[d.stage] + R[d.stage + 1]) / 2 + (same.length > 2 ? (j % 2 ? 14 : -14) : 0);
      const x = C + Math.cos(a) * rr, y = C + Math.sin(a) * rr;
      blips += `<g class="blip" data-i="${n}" data-lens="${d.lens}" tabindex="0" role="button" aria-label="${esc(d.h)}, ${esc(L[d.lens].h)} trend, ${T.STAGES[d.stage]}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="24" fill="transparent"/>${blipSvg(d.lens, +x.toFixed(1), +y.toFixed(1), 14, L[d.lens].c, n + 1)}</g>`;
    });
    host.classList.add("radar-wrap");
    host.innerHTML = `<div class="radar-top"><div class="chips" role="group" aria-label="Filter by lens"><button type="button" class="pick on" data-f="all">All 12</button>${keys.map(k => `<button type="button" class="pick" data-f="${k}">${UI.shapeIcon(k, L[k].c)}${L[k].h}</button>`).join("")}</div><span class="mono" style="color:var(--fg3)">Tap a trend · rings show maturity, our read</span></div>
      <div class="radar-grid"><svg class="radar" viewBox="-40 -30 680 660" role="img" aria-label="Trend radar: twelve trends across flavor, sensory and consumer lenses, placed by maturity">${rings}${secs}${blips}</svg>
      <div class="tdetail" aria-live="polite"></div></div>
      <details class="tlist"><summary class="mono">See all 12 as a list</summary><ol>${D.map(d => `<li><b>${esc(d.h)}</b> · ${esc(L[d.lens].h)} · ${T.STAGES[d.stage]}. ${esc(d.what)}</li>`).join("")}</ol></details>`;
    const det = $(".tdetail", host), svg = $("svg", host);
    const show = n => {
      const d = D[n], l = L[d.lens];
      $$(".blip", host).forEach(b => b.classList.toggle("on", +b.dataset.i === n));
      det.style.setProperty("--c", l.c);
      det.innerHTML = `<div class="tdh"><span class="chip">${UI.shapeIcon(d.lens, l.c)}${l.h} trend</span><span class="chip"><i style="--c:${["#006649", "#F58025", "#8E6BD8"][d.stage]}"></i>${T.STAGES[d.stage]}</span><span class="mono" style="color:var(--fg3)">${String(n + 1).padStart(2, "0")} / 12</span></div>
        <h3 class="h2" style="margin-top:14px">${esc(d.h)}</h3><p class="lede" style="font-size:clamp(17px,1.35vw,20px);margin-top:10px;max-width:none">${esc(d.what)}</p>
        <div class="tcols"><div><span class="mono">Where we see it</span><ul>${d.signals.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div><div><span class="mono">What it means for TheraBreath</span><p>${esc(d.tb)}</p></div></div>
        <div class="tq"><span class="mono">Let’s discuss</span><p>${esc(d.q)}</p></div>
        <div class="chips" style="margin-top:14px">${d.flavors.map(f => `<span class="chip"><i style="--c:${l.c}"></i>${esc(f)}</span>`).join("")}</div>`;
    };
    svg.addEventListener("click", e => { const b = e.target.closest(".blip"); if (b) show(+b.dataset.i); });
    svg.addEventListener("keydown", e => { const b = e.target.closest(".blip"); if (b && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); show(+b.dataset.i); } });
    $(".radar-top .chips", host).addEventListener("click", e => {
      const b = e.target.closest("[data-f]"); if (!b) return; const f = b.dataset.f;
      $$(".radar-top .pick", host).forEach(x => x.classList.toggle("on", x === b));
      $$(".blip", host).forEach(x => x.classList.toggle("dim", f !== "all" && x.dataset.lens !== f));
      if (f !== "all") show(D.findIndex(d => d.lens === f));
    });
    show(o.start || 0);
  };

  /* ---------------------------------------------------------------- future rail */
  UI.futureRail = host => {
    host.classList.add("future");
    host.innerHTML = `<div class="frail">${T.FUTURE.map((f, i) => `<article class="fcard rv" style="--d:${i * .07}s"><span class="yr">${f.when}</span><h3>${esc(f.h)}</h3><p>${esc(f.line)}</p><div class="ftb"><span class="mono">For TheraBreath</span>${esc(f.tb)}</div></article>`).join("")}</div>`;
  };

  /* ---------------------------------------------------------------- flavor passport */
  UI.passport = (host, o = {}) => {
    host.classList.add("passport");
    host.innerHTML = T.WILD.map((w, i) => `<button type="button" class="stamp rv" style="--d:${(i % 3) * .08}s;--c:${w.acc};--rot:${[-3, 2, -1.5, 2.5, -2, 1.5, -2.5, 3, -1][i]}deg" aria-pressed="false" aria-label="${esc(w.name)}: tap for details">
      <span class="face s-front"><span class="disc">${o.img ? `<img src="${o.img}wc-${w.id}.webp" alt="" loading="lazy" decoding="async">` : `<canvas aria-hidden="true"></canvas>`}</span><span class="org mono">${esc(w.origin)}</span><b>${esc(w.name)}</b><span class="ln">${esc(w.line)}</span><span class="diff d-${w.diff.toLowerCase()}">${w.diff}</span></span>
      <span class="face s-back"><span class="mono">The trend</span><span class="tr">${esc(w.trend)}</span><span class="mono">Built for sodium chlorite</span><span class="ch">${esc(w.chem)}</span><span class="mono">Bench difficulty · ${w.diff}</span><span class="stampmark">${esc(w.origin.split(" · ")[0])}</span></span></button>`).join("");
    if (!o.img) $$("canvas", host).forEach((c, i) => UI.mini(c, T.WILD[i].id, i * 2));
    host.addEventListener("click", e => { const b = e.target.closest(".stamp"); if (!b) return; const on = !b.classList.contains("flip"); b.classList.toggle("flip", on); b.setAttribute("aria-pressed", on); });
  };

  /* ---------------------------------------------------------------- what TheraBreath asked for */
  const OBJ_C = { trends: "#D9771E", territories: "#1B86C9", concepts: "#B23A76", pipeline: "#006649" };
  UI.askMap = (host, o = {}) => {
    const P = T.PLAYBOOK;
    host.classList.add("ask");
    host.innerHTML = `<blockquote class="askq rv"><span class="mono">The ask</span><p>“${esc(P.ask)}”</p><cite class="mono">${esc(P.from)}</cite></blockquote>
      <div class="askrows">${P.wants.map((w, i) => { const ob = T.OBJECTIVES.find(x => x.k === w.k); return `<div class="askrow rv" style="--d:${i * .08}s;--c:${OBJ_C[w.k]}">
        <span class="an">${ob.n}</span><b>${esc(ob.h)}</b><span class="aw"><span class="mono">You want to</span>${esc(w.want)}</span><span class="aa" aria-hidden="true"></span><span class="al"><span class="mono">You leave with</span>${esc(w.leave)}</span></div>`; }).join("")}</div>
      ${o.bring === false ? "" : `<div class="bring"><span class="mono">What we bring to the room</span><div class="bgrid">${P.bring.map((b, i) => `<div class="bcard rv" style="--d:${i * .07}s"><b>${esc(b.h)}</b><span>${esc(b.p)}</span></div>`).join("")}</div></div>`}`;
  };

  /* ---------------------------------------------------------------- the playbook, as a book */
  UI.book = host => {
    const P = T.PLAYBOOK;
    host.classList.add("book");
    host.innerHTML = `<div class="bk">
      <div class="bk-cover"><span class="mono">TheraBreath × The Flavor Factory</span><b>The Flavor<br><em>Playbook</em></b><i></i><p>Near-term innovation.<br>Long-term franchise growth.</p><span class="mono bk-foot">Drafted together · Nov 9, 2026</span></div>
      <div class="bk-tabs" role="tablist" aria-label="Playbook chapters">${P.chapters.map((c, i) => `<button type="button" role="tab" class="bk-tab" style="--c:${c.c}" aria-selected="${i === 0}" data-i="${i}"><span class="mono">${c.n}</span>${esc(c.h)}</button>`).join("")}</div>
      <div class="bk-page" role="tabpanel" aria-live="polite"></div>
    </div>
    <div class="plan">${P.plan.map((s, i) => `<div class="pstep rv" style="--d:${i * .1}s"><span class="pd">${s.d}<small>days</small></span><b>${esc(s.h)}</b><span>${esc(s.p)}</span></div>`).join("")}</div>
    <p class="small bk-note">Our proposal for the six chapters and the first 90 days. We’ll shape it with you on the day.</p>`;
    const page = $(".bk-page", host), tabs = $$(".bk-tab", host);
    const show = i => {
      const c = P.chapters[i], ob = T.OBJECTIVES.find(x => x.k === c.o);
      tabs.forEach((t, k) => t.setAttribute("aria-selected", k === i));
      page.style.setProperty("--c", c.c);
      page.classList.remove("turn"); void page.offsetWidth; page.classList.add("turn");
      page.innerHTML = `<span class="mono">Chapter ${c.n}</span><h3>${esc(c.h)}</h3><p>${esc(c.p)}</p><span class="bk-from mono">Answers objective ${ob.n} · ${esc(ob.h)}</span>`;
    };
    host.addEventListener("click", e => { const b = e.target.closest(".bk-tab"); if (b) show(+b.dataset.i); });
    show(0);
  };

  /* ---------------------------------------------------------------- spin the wheel */
  UI.wheel = (host, onLand) => {
    const all = [...T.CONCEPTS.map(c => ({ id: c.id, name: c.name, acc: c.acc, liq: c.liquid, sub: c.flavor, line: c.tag, kind: "One of the six" })), ...T.WILD.map(w => ({ id: w.id, name: w.name, acc: w.acc, liq: w.sw, sub: w.flavor, line: w.line, kind: "Wildcard · " + w.origin }))];
    const N = all.length, C = 250, R = 236;
    const seg = all.map((d, i) => {
      const a0 = i / N * Math.PI * 2 - Math.PI / 2, a1 = (i + 1) / N * Math.PI * 2 - Math.PI / 2, am = (a0 + a1) / 2;
      const p0 = [C + Math.cos(a0) * R, C + Math.sin(a0) * R], p1 = [C + Math.cos(a1) * R, C + Math.sin(a1) * R];
      const tx = C + Math.cos(am) * R * .6, ty = C + Math.sin(am) * R * .6, deg = am * 180 / Math.PI;
      return `<path d="M${C},${C} L${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${R},${R} 0 0 1 ${p1[0].toFixed(1)},${p1[1].toFixed(1)} Z" fill="${d.acc}" stroke="#fff" stroke-width="3"/><text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" transform="rotate(${deg.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)})" text-anchor="middle" dominant-baseline="middle" class="wl">${esc(d.name.replace(" Mint", ""))}</text>`;
    }).join("");
    host.classList.add("wheel");
    host.innerHTML = `<div class="wheel-stage"><div class="pointer" aria-hidden="true"></div><svg viewBox="0 0 500 500" class="wsvg" aria-hidden="true"><g class="rot">${seg}<circle cx="${C}" cy="${C}" r="54" fill="#fff"/><circle cx="${C}" cy="${C}" r="44" fill="#F58025"/></g></svg><button type="button" class="spin" aria-label="Spin the flavor wheel">SPIN</button></div>`;
    const g = $(".rot", host); let angle = 0, busy = false;
    $(".spin", host).addEventListener("click", () => {
      if (busy) return; busy = true;
      const k = Math.floor(Math.random() * N), target = 360 - (k + .5) / N * 360;
      const turns = REDUCED ? 0 : 5;
      angle = angle - (angle % 360) + turns * 360 + target;
      g.style.transition = REDUCED ? "none" : "transform 4.2s cubic-bezier(.12,.8,.12,1)";
      g.style.transform = `rotate(${angle}deg)`;
      setTimeout(() => { busy = false; onLand && onLand(all[k]); }, REDUCED ? 50 : 4300);
    });
    return all;
  };
  /* ---------------------------------------------------------------- 3D flavor world (assets/lab3d.js)
     One WebGL renderer for the page. Every [data-lab] element is a place it
     can live; the canvas moves to whichever one is most on screen. */
  UI.lab = (o = {}) => {
    const hosts = $$("[data-lab]");
    if (!hosts.length || !window.Lab3D || !Lab3D.supported() || /[?&](print|no3d)/.test(location.search)) return null;
    const low = /[?&]lowgl/.test(location.search);
    const lab = Lab3D.create(document.createElement("canvas"), { base: o.base || "assets/", logo: o.logo, worlds: T.CONCEPTS, maxPixels: low ? 2.5e5 : 0 });
    if (!lab) return null;
    UI.lab3d = lab;
    document.documentElement.classList.add("has-3d");
    const mob = () => innerWidth <= 980;
    const opts = el => {
      const d = el.dataset, m = mob();
      let params = {};
      try { params = JSON.parse((m && d.mparams) || d.params || "{}"); } catch (e) {}
      return { shiftX: +((m ? d.mx : d.sx) || 0), shiftY: +((m ? d.my : d.sy) || 0), params };
    };
    let active = null;
    const ratio = new Map();
    const use = el => {
      if (!el) return;
      const again = el === active, seen = active && (ratio.get(active) || 0) > 0;
      active = el;
      // glide between hosts that share the screen; jump straight to the layout otherwise
      lab.attach(el, el.dataset.lab, Object.assign(opts(el), { instant: !again && !seen }));
      if (!again) lab.cycle(el.dataset.cycle ? +el.dataset.cycle : 0);
      if (!again && el.dataset.lab === "worlds") lab.setWorld(UI.sixWant || 0, { instant: true });
    };
    const io = new IntersectionObserver(es => {
      es.forEach(e => ratio.set(e.target, e.isIntersecting ? e.intersectionRatio : 0));
      let best = null, br = 0; ratio.forEach((r, el) => { if (r > br) { br = r; best = el; } });
      if (best && best !== active) use(best);
    }, { threshold: [0, .05, .15, .3, .5, .7, .9] });
    hosts.forEach(h => io.observe(h));
    addEventListener("resize", () => { clearTimeout(UI._lz); UI._lz = setTimeout(() => active && lab.attach(active, active.dataset.lab, opts(active)), 160); });
    const hero = hosts.find(h => h.dataset.lab === "hero");
    if (hero) UI.onScroll({ measure() {}, update(y) { if (active === hero) lab.setProgress(clamp(y / (VH || 1))); } });
    use(hosts[0]);
    return lab;
  };

  /* ---------------------------------------------------------------- vistas: full-bleed key visuals with depth */
  UI.vistas = () => {
    const ps = $$(".vista");
    if (!ps.length) return;
    let tops = [];
    UI.onScroll({
      measure() { tops = ps.map(p => { const r = p.getBoundingClientRect(); return [r.top + scrollY, r.height]; }); },
      update(y) {
        ps.forEach((p, i) => {
          const [t, h] = tops[i] || [0, 1], rel = (y + VH - t) / (VH + h);
          if (rel < -.1 || rel > 1.1) return;
          const k = clamp(rel);
          p.style.setProperty("--pk", k.toFixed(3));
        });
      }
    });
  };

  window.WorldsUI = UI;
})();
