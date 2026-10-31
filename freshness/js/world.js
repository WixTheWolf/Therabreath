/* Shared by the site and the pre-brief: the living freshness form (Orb) and the compass. */
window.FW = (() => {
  "use strict";
  const lerp = (a, b, t) => a + (b - a) * t;
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
      raf = (still && settled) || cv.dataset.live === "0" ? 0 : requestAnimationFrame(frame);
    }
    this.set = p => { Object.assign(P, p); if (!raf) raf = requestAnimationFrame(frame); };
    this.start = () => { if (!raf) raf = requestAnimationFrame(frame); };
    this.stop = () => { cancelAnimationFrame(raf); raf = 0; };
  }


  /* Nine-axis compass drawn into an <svg>; set(values) morphs smoothly. */
  function Radar(svg, o = {}) {
    const NS = "http://www.w3.org/2000/svg", axes = o.axes, n = axes.length, S = o.size || 520, c = S / 2, R = S * .34;
    svg.setAttribute("viewBox", `0 0 ${S} ${S}`);
    const ang = i => i / n * Math.PI * 2 - Math.PI / 2;
    const pt = (i, v) => [c + Math.cos(ang(i)) * R * v / 5, c + Math.sin(ang(i)) * R * v / 5];
    let h = "";
    for (let r = 1; r <= 5; r++) h += `<polygon class="r-ring" points="${axes.map((_, i) => pt(i, r).join(",")).join(" ")}"/>`;
    axes.forEach((a, i) => { const [x, y] = pt(i, 5), [lx, ly] = pt(i, 6.35), cs = Math.cos(ang(i)); h += `<line class="r-spoke" x1="${c}" y1="${c}" x2="${x}" y2="${y}"/>` + (o.labels === false ? "" : `<text class="r-lbl" x="${lx}" y="${ly + 5}" text-anchor="${Math.abs(cs) < .2 ? "middle" : cs > 0 ? "start" : "end"}">${a}</text>`); });
    h += `<polygon class="r-ref"/><polygon class="r-shape"/>`;
    svg.innerHTML = h;
    const shape = svg.querySelector(".r-shape"), ref = svg.querySelector(".r-ref");
    let cur = new Array(n).fill(1), tgt = cur.slice(), raf = 0;
    const draw = () => { let mv = false; cur = cur.map((v, i) => { const nv = lerp(v, tgt[i], .12); if (Math.abs(nv - tgt[i]) > .01) mv = true; return nv; }); shape.setAttribute("points", cur.map((v, i) => pt(i, v).join(",")).join(" ")); raf = mv ? requestAnimationFrame(draw) : 0; };
    this.set = (v, color) => { tgt = v.slice(); if (color) svg.style.setProperty("--c", color); if (!raf) raf = requestAnimationFrame(draw); };
    this.ref = v => ref.setAttribute("points", v ? v.map((x, i) => pt(i, x).join(",")).join(" ") : "");
  }
  return { Orb, Radar };
})();
