/* The Future of Freshness · site behaviour: scroll-scrubbed sections, territories,
   atlas, the living freshness form and the film overlay. */
(() => {
  "use strict";
  const D = window.FF, MAP = window.FF_MAP, T = D.TERR, ORDER = D.ORDER;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const IMG = n => `freshness/img/${n}.webp`;

  /* ---------- evolve: the vocabulary appears as you scroll */
  const ev = $(".evolve");
  $(".ev-words").innerHTML = D.VOCAB.map(v => `<span style="left:${(v.x / 1920 * 100).toFixed(1)}%;top:${(26 + v.y / 1080 * 66).toFixed(1)}%;font-size:clamp(${Math.round(v.s * .45)}px,${(v.s / 19.2).toFixed(2)}vw,${v.s}px)">${esc(v.w)}</span>`).join("");
  const words = $$(".ev-words span");

  /* ---------- shifts */
  $(".sh-track").innerHTML = D.SHIFTS.map((s, i) => `<div class="shc"><span class="n">0${i + 1}</span><span class="a">${esc(s.a)}</span><span class="ar"></span><span class="b">${esc(s.b)}</span><p class="d">${esc(s.d)}</p></div>`).join("");
  const track = $(".sh-track");

  /* ---------- territories */
  $(".t-bgs").innerHTML = ORDER.map(id => `<div class="t-bg" style="background-image:url(${IMG(T[id].img)})"></div>`).join("");
  $(".t-copy").innerHTML = ORDER.map(id => {
    const t = T[id];
    return `<div class="tc" style="--ta:${t.dark ? t.acc : t.accInk}"><span class="kick">Territory 0${t.n} · ${esc(t.terr)}</span><h3>${esc(t.name)}</h3><p class="emo">${t.identity.map(w => esc(w) + ".").join(" ")}</p>
      <div class="arc">${["First impression", "Mid-palate", "Finish"].map((l, i) => `<div><span>${l}</span><b>${esc(t.arc[i])}</b></div>`).join("")}</div><p class="bench">${esc(t.bench)}</p></div>`;
  }).join("");
  $(".t-dots").innerHTML = ORDER.map(() => "<i></i>").join("");
  const radar = new FW.Radar($(".t-radar svg"), { axes: D.COMPASS, size: 460 });
  radar.ref(D.CORE.prof[1]);
  let curT = -1;
  function setTerr(k) {
    if (k === curT) return; curT = k;
    const t = T[ORDER[k]], pin = $(".terr .pin");
    $$(".t-bg").forEach((e, i) => e.classList.toggle("on", i === k));
    $$(".tc").forEach((e, i) => e.classList.toggle("on", i === k));
    $$(".t-dots i").forEach((e, i) => e.classList.toggle("on", i === k));
    pin.style.setProperty("--tp", t.paper); pin.style.setProperty("--ti", t.ink);
    radar.set(t.prof[1], t.acc);
  }

  /* ---------- moments */
  $(".m-list").innerHTML = D.MOMENTS.map(m => `<div class="mo"><span class="t">${m.at == null ? "Any day" : m.when[0]}</span><h3>${esc(m.l)}</h3><p>${esc(m.why)}</p><div class="lang">${m.lang.slice(0, 3).map(esc).join(" · ")}</div></div>`).join("");

  /* ---------- formula */
  $(".f-steps").innerHTML = D.FORMULA.map(s => `<li><b>${esc(s[0])}</b><span>${esc(s[1])}</span></li>`).join("");

  /* ---------- scroll engine */
  const scrubs = $$("[data-scrub]");
  const nav = $(".nav");
  function frame() {
    const vh = innerHeight;
    nav.classList.toggle("solid", scrollY > vh * .8);
    scrubs.forEach(s => {
      const r = s.getBoundingClientRect(), total = s.offsetHeight - vh;
      if (r.bottom < -vh || r.top > vh * 2) return;
      const p = clamp(-r.top / total, 0, 1);
      s.style.setProperty("--p", p.toFixed(4));
      const k = s.dataset.scrub;
      if (k === "evolve") {
        words.forEach((w, i) => w.classList.toggle("on", p > .16 + i * .033));
        ev.classList.toggle("late", p > .8);
      } else if (k === "shifts") {
        const max = track.scrollWidth - innerWidth + 40;
        track.style.transform = `translateX(${(-p * Math.max(0, max)).toFixed(1)}px)`;
      } else if (k === "terr") {
        setTerr(clamp(Math.floor(p * ORDER.length * .999), 0, ORDER.length - 1));
      } else if (k === "moments") {
        const on = clamp(Math.floor(p * 5.2), 0, 4);
        $$(".mo").forEach((e, i) => e.classList.toggle("on", i <= on));
      }
    });
    $$(".f-steps li").forEach(li => { const r = li.getBoundingClientRect(); li.classList.toggle("on", r.top < vh * .8); });
  }
  let ticking = false;
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { frame(); ticking = false; }); } }, { passive: true });
  addEventListener("resize", frame);
  frame(); setTerr(0);

  /* ---------- atlas */
  const svg = $(".map");
  svg.setAttribute("viewBox", `0 0 ${MAP.w} ${MAP.h}`);
  const pts = MAP.dots.split("M").slice(1).map(s => s.replace("h0", "").split(" ").map(Number));
  svg.innerHTML = `<path class="dots" d="${MAP.dots}"/><g class="hl">${D.REGIONS.map((r, i) => {
      const c = [MAP.pts[r.at]].concat(r.also ? [MAP.pts[r.also]] : []);
      const near = pts.filter(p => c.some(q => Math.hypot(p[0] - q[0], p[1] - q[1]) < (r.hub ? 60 : 88)));
      return `<path data-i="${i}" style="--c:${r.col}" d="${near.map(p => `M${p[0]} ${p[1]}h0`).join("")}"/>`;
    }).join("")}</g>` + D.REGIONS.map((r, i) => {
      const p = MAP.pts[r.at], q = r.also ? MAP.pts[r.also] : null;
      return `<g class="rg" data-i="${i}" style="--c:${r.col}">${q ? `<circle class="halo" cx="${q[0]}" cy="${q[1]}" r="34"/><circle class="pin" cx="${q[0]}" cy="${q[1]}" r="7"/>` : ""}<circle class="halo" cx="${p[0]}" cy="${p[1]}" r="46"/><circle class="pin" cx="${p[0]}" cy="${p[1]}" r="9"/><text x="${p[0]}" y="${p[1] - 26}" text-anchor="middle">${esc(r.name)}</text></g>`;
    }).join("");
  function region(i) {
    const r = D.REGIONS[i], P = $(".at-panel");
    $$(".map .rg").forEach((g, j) => g.classList.toggle("sel", j === i));
    $$(".map .hl path").forEach((g, j) => g.classList.toggle("sel", j === i));
    P.style.setProperty("--c", r.col);
    P.innerHTML = `<span class="kick">${r.hub ? "Where it comes together" : "Region"}</span><h3>${esc(r.name)}</h3>
      <div class="ing">${r.ing.map(([n, st]) => `<div><span>${esc(n)}</span><span class="bar">${[1, 2, 3, 4, 5].map(k => `<i class="${k <= st ? "f" : ""}"></i>`).join("")}</span></div>`).join("")}</div>
      <div class="at-legend">Origin → specialist menus → cafés → mainstream → personal care · The Flavor Factory's read</div>
      <dl><dt>Sensory character</dt><dd>${esc(r.sensory)}</dd><dt>Why consumers understand it</dt><dd>${esc(r.why)}</dd><dt>Where it's appearing</dt><dd>${esc(r.where)}</dd></dl>
      <div class="oral"><span class="kick">Oral-care translation</span><br>${esc(r.oral)}</div>`;
  }
  svg.addEventListener("click", e => { const g = e.target.closest(".rg"); if (g) region(+g.dataset.i); });
  region(0);

  /* ---------- your turn: five sliders drive the living form */
  const orbCv = $(".turn-orb canvas"); const orb = new FW.Orb(orbCv);
  const L = { adv: 0, cool: 0, bot: 0, exp: 0, occ: 0 };
  $(".sliders").innerHTML = D.SPECTRA.map(x => `<label><div class="sl-l"><span>${x.l}</span><span>${x.r}</span></div><input type="range" min="-100" max="100" value="0" data-x="${x.id}" aria-label="${x.l} to ${x.r}"></label>`).join("");
  const say = () => {
    const w = D.SPECTRA.filter(x => Math.abs(L[x.id]) >= .2).map(x => (Math.abs(L[x.id]) > .7 ? "clearly " : "") + (L[x.id] < 0 ? x.wl : x.wr));
    $(".say").textContent = !w.length ? "Move the sliders to describe the freshness you want." : `Your freshness feels ${w.length > 1 ? w.slice(0, -1).join(", ") + " and " + w[w.length - 1] : w[0]}.`;
  };
  $(".sliders").addEventListener("input", e => { const i = e.target.closest("input"); if (!i) return; L[i.dataset.x] = +i.value / 100; orb.set(L); say(); });
  say();
  new IntersectionObserver(es => es.forEach(en => { orbCv.dataset.live = en.isIntersecting ? "1" : "0"; if (en.isIntersecting) orb.start(); }), { threshold: .05 }).observe(orbCv);
  orb.set(L);

  /* ---------- film overlay */
  const film = $("#film"), fv = $("video", film);
  const openFilm = e => { if (e) e.preventDefault(); film.hidden = false; fv.currentTime = 0; fv.play().catch(() => { }); };
  const closeFilm = () => { fv.pause(); film.hidden = true; };
  $$("[data-film]").forEach(b => b.addEventListener("click", openFilm));
  $(".film-x").addEventListener("click", closeFilm);
  film.addEventListener("click", e => { if (e.target === film) closeFilm(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && !film.hidden) closeFilm(); });
  if (location.hash === "#film") openFilm();
})();
