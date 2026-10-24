/* The Future of Freshness · pre-brief behaviour. */
(() => {
  "use strict";
  const D = window.FF, T = D.TERR, ORDER = D.ORDER;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* vocabulary, questions, agenda */
  $(".vocab").innerHTML = D.VOCAB.map((v, i) => `<span style="transition-delay:${i * 50}ms">${esc(v.w)}</span>`).join("");
  const QC = ["#1B75BB", "#6FA374", "#F58025", "#57518F"];
  $(".q4").innerHTML = [1, 2, 3, 4].map((n, i) => { const c = D.CHAPTERS[n]; return `<div class="q rv" style="--qc:${QC[i]};transition-delay:${i * 90}ms"><div class="n">${c.n}</div><h3>${c.title}</h3><p>${c.q}</p></div>`; }).join("");
  $(".tl").innerHTML = D.AGENDA.map(a => `<li class="${/Your turn/.test(a.l) ? "yt" : ""}"><b>${a.t}</b><h4>${esc(a.l)}</h4><p>${esc(a.s)}</p></li>`).join("");

  /* sealed flavor cards: territory on the front, a hint on the back */
  $(".cards").innerHTML = ORDER.map(id => {
    const t = T[id];
    return `<button type="button" class="card rv" style="--cpaper:${t.paper};--cink:${t.ink};--cacc:${t.dark ? t.acc : t.accInk}" aria-label="${esc(t.terr)}: tap for a hint">
      <div class="cf" style="background-image:url(../freshness/img/${t.img}-sm.webp)"><span class="seal">Sealed<br>until<br>Nov 9</span><span class="kick">Territory 0${t.n}</span><h3>${esc(t.terr)}</h3></div>
      <div class="cb"><span class="kick">Territory 0${t.n} · a hint</span><h3>${t.identity.map(w => esc(w) + ".").join(" ")}</h3><p class="emo">${esc(t.character.slice(0, 3).join(" · "))}</p><span class="moms">Made for: ${esc(t.moments.join(", ").toLowerCase())}</span><span class="hint">The name is revealed when you taste it</span></div>
    </button>`;
  }).join("");
  $(".cards").addEventListener("click", e => { const c = e.target.closest(".card"); if (c) c.classList.toggle("flip"); });

  /* homework: the freshness profile */
  const KEY = "tb-freshness-profile";
  let L = { adv: 0, cool: 0, bot: 0, exp: 0, occ: 0 };
  try { L = Object.assign(L, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { }
  const cv = $(".orb"), orb = new FW.Orb(cv);
  $(".sliders").innerHTML = D.SPECTRA.map(x => `<label><div class="sl-l"><span>${x.l}</span><span>${x.r}</span></div><input type="range" min="-100" max="100" value="${Math.round(L[x.id] * 100)}" data-x="${x.id}" aria-label="${x.l} to ${x.r}"></label>`).join("");
  const sentence = () => {
    const w = D.SPECTRA.filter(x => Math.abs(L[x.id]) >= .2).map(x => (Math.abs(L[x.id]) > .7 ? "clearly " : "") + (L[x.id] < 0 ? x.wl : x.wr));
    return !w.length ? "My freshness is perfectly balanced. Move the sliders to make it yours." : `My freshness feels ${w.length > 1 ? w.slice(0, -1).join(", ") + " and " + w[w.length - 1] : w[0]}.`;
  };
  const update = () => { orb.set(L); const s = sentence(); $(".say").textContent = s; $(".oc-s").textContent = s; try { localStorage.setItem(KEY, JSON.stringify(L)); } catch (e) { } };
  $(".sliders").addEventListener("input", e => { const i = e.target.closest("input"); if (!i) return; L[i.dataset.x] = +i.value / 100; update(); });
  $("#reset").addEventListener("click", () => { Object.keys(L).forEach(k => { L[k] = 0; }); $$(".sliders input").forEach(i => { i.value = 0; }); update(); });
  new IntersectionObserver(es => es.forEach(en => { cv.dataset.live = en.isIntersecting ? "1" : "0"; if (en.isIntersecting) orb.start(); }), { threshold: .05 }).observe(cv);
  update();

  /* save the profile as an image card */
  $("#save").addEventListener("click", () => {
    const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#FBFDFD"); g.addColorStop(1, "#E8F1F4"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.drawImage(cv, 90, 150, 900, 900);
    x.fillStyle = "rgba(11,34,54,.5)"; x.font = "600 26px 'JetBrains Mono', monospace"; x.textAlign = "center";
    x.fillText("MY FRESHNESS PROFILE", W / 2, 110);
    x.fillStyle = "#0B2236"; x.font = "400 40px 'Inter Tight', sans-serif";
    const words = sentence().split(" "); let line = "", y = 1110;
    words.forEach(w => { const t = line ? line + " " + w : w; if (x.measureText(t).width > 900) { x.fillText(line, W / 2, y); line = w; y += 52; } else line = t; });
    x.fillText(line, W / 2, y);
    x.fillStyle = "rgba(11,34,54,.5)"; x.font = "500 26px Figtree, sans-serif"; x.fillText("The Future of Freshness · TheraBreath × The Flavor Factory · November 9, 2026", W / 2, H - 60);
    const a = document.createElement("a"); a.download = "my-freshness-profile.png"; a.href = c.toDataURL("image/png"); a.click();
  });

  /* reveals, film, print */
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: .15 });
  $$(".rv, .vocab").forEach(e => io.observe(e));
  const film = $("#film"), fv = $("video", film);
  $$("[data-film]").forEach(b => b.addEventListener("click", () => { film.hidden = false; fv.currentTime = 0; fv.play().catch(() => { }); }));
  const close = () => { fv.pause(); film.hidden = true; };
  $(".film-x").addEventListener("click", close);
  film.addEventListener("click", e => { if (e.target === film) close(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && !film.hidden) close(); });
})();
