/* ==========================================================================
   TheraBreath Flavor Playbook · shared core
   One source of truth for the web experience (index.html), the pre-read
   (brief/), the slide deck (deck/) and the reel (video/): session details,
   the six future flavors, the sodium chlorite chemistry, the bottle drawing
   and the animated flavor worlds. Edit here and every piece updates.
   ========================================================================== */
(function (root) {
  "use strict";
  const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
  const rgba = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r * 255 | 0},${g * 255 | 0},${b * 255 | 0},${a})`; };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  /* ---------------------------------------------------------------- session */
  /* From Ross Conroy's invite (Sep 24, 2026). Keep every page in step with these. */
  const SESSION = { day: "Monday, November 9, 2026", short: "Mon, Nov 9", time: "10:00 AM – 12:00 PM ET", room: "Darwin", place: "Church & Dwight HQ · Ewing, NJ", lunch: "Lunch provided", start: "2026-11-09T15:00:00Z" };
  const OBJECTIVES = [
    { k: "trends", n: "01", h: "Trends", line: "Identify the flavor, sensory and consumer trends shaping the future of oral care.", out: "The trends worth acting on" },
    { k: "territories", n: "02", h: "Territories", line: "Explore new flavor territories and sensory experiences that strengthen TheraBreath’s edge.", out: "The territories to prioritize" },
    { k: "concepts", n: "03", h: "Concepts", line: "Generate concepts that create new usage occasions, reach new consumers and expand the portfolio.", out: "Concepts with a clear who and when" },
    { k: "pipeline", n: "04", h: "Pipeline", line: "Build a pipeline of platforms, flavor directions and white space for growth across the franchise.", out: "A pipeline from near-term to long-term" }
  ];
  const AGENDA = [
    { t: "10:00", e: "10:10", h: "Welcome", w: "Introductions and the goal", p: "Who’s in the room, and what the playbook needs to do.", out: "One goal for the morning" },
    { t: "10:10", e: "10:30", h: "Trends", w: "What’s shaping oral care", p: "Flavor, sensory and consumer trends we see from the bench and the market.", out: "The trends worth acting on", o: 1 },
    { t: "10:30", e: "10:50", h: "Territories", w: "Where fresh could go", p: "Territories beyond mint, what survives sodium chlorite, and four platforms.", out: "Territories to prioritize", o: 2 },
    { t: "10:50", e: "11:20", h: "Taste", w: "Six new flavors, blind", p: "Six future flavors beside today’s TheraBreath, scored across the whole rinse.", out: "A room score for each", o: 2 },
    { t: "11:20", e: "11:40", h: "Create", w: "New occasions, new consumers", p: "In small groups: pick a flavor world, a moment and a person, and build a concept.", out: "New concepts from the room", o: 3 },
    { t: "11:40", e: "12:00", h: "Playbook", w: "Prioritize and assign", p: "Three checks, then a pipeline from near-term launches to long-term bets, with owners.", out: "The draft playbook", o: 4 }
  ];
  const HORIZONS = [
    { k: "near", h: "Near-term", w: "New flavors for today’s rinse", p: "Directions that sit closest to today’s base and shelf. The fastest path from bench to launch.", c: "#006649" },
    { k: "next", h: "Next", w: "Platforms and new occasions", p: "Grow a flavor into a family: a morning and night pair, a sensory line, a premium tier.", c: "#00A3E0" },
    { k: "long", h: "Long-term", w: "Across the franchise", p: "Carry the winners into other formats, such as toothpaste and lozenges, and toward new consumers.", c: "#F58025" }
  ];
  const CREATE = {
    occasions: ["Wake-up", "After coffee", "After a meal", "Before a meeting", "Before going out", "After the gym", "Travel", "Wind-down"],
    consumers: ["Strong-but-gentle seekers", "Mint-fatigued adults", "Self-care and beauty routines", "Flavor-curious younger adults", "Families", "Commuters and travelers"]
  };
  const PLATS = { newfresh: "New Fresh", sensory: "Sensory Proof", ritual: "Ritual by Time", elevated: "Elevated Escape" };
  const PLAT_LINES = {
    newfresh: "Fresh that tastes like more than peppermint.",
    sensory: "Freshness you can feel happening, without the burn.",
    ritual: "A different kind of fresh for each moment of the day.",
    elevated: "A small daily luxury, borrowed from spa, tea and fragrance."
  };

  /* ---------------------------------------------------------------- trends */
  const TRENDS = { flavor: "Flavor trend", sensory: "Sensory trend", consumer: "Consumer trend" };
  const TREND_LIST = [
    { k: "consumer", word: "Beauty", h: "Oral care is joining the self-care shelf.", seen: "Layered routines, bathroom “shelfies”, rinse sold beside serums.", c: "#F4A3BA", art: "rosewater" },
    { k: "flavor", word: "Flavor", h: "People taste a much bigger world now.", seen: "Cardamom, rosewater and coconut water in everyday drinks.", c: "#E9B949", art: "spectrum" },
    { k: "sensory", word: "Sensation", h: "People want to feel it working.", seen: "Cooling skincare, tingling lip care, “you can feel it” claims.", c: "#5CC8F2", art: "frost" },
    { k: "consumer", word: "Rituals", h: "A different fresh for each moment.", seen: "Morning and night versions of everything.", c: "#7ED3A1", art: "orchard" }
  ];

  /* ---------------------------------------------------------------- the six */
  // Names follow TheraBreath's own pattern (Invigorating Mint, Rainforest Mint,
  // Chamomile Mint...). Chemistry notes are our bench read: every one still
  // goes into accelerated stability in the real base before anyone commits.
  const CONCEPTS = [
    { id: "frost", n: "01", name: "Frost Mint", flavor: "Staged cooling", label: "STAGED COOLING", code: "318",
      tag: "Cold that builds, then stays.", feels: "The first breath outside on a clear winter morning.",
      arc: ["A quick, bright chill.", "A deeper cool rolls in, with no burn.", "Clean cold that lingers."],
      chem: { keys: ["Menthol", "WS-3", "WS-23", "Menthyl lactate"], why: "Every cooling molecule in it is saturated: no aldehydes and no fragile double bonds for the oxidizer to find.", watch: "Balance the three coolants so it reads intense, never harsh." },
      who: "People who want intensity without the burn", when: "Wake-up", horizon: "near", plat: ["sensory", "ritual"],
      alt: ["Glacial Mint", "Polar Mint"], avoid: "Menthol burn. Cough drops.",
      tone: "dark", bg: "#E3F5FD", glow: "#FFFFFF", acc: "#2EA8E6", liquid: ["#D4F5FF", "#3AA0E0"], ink: "#F2FBFF", hi: "#9BE8FF", map: { x: .2, y: .06 } },
    { id: "coastal", n: "02", name: "Coastal Mint", flavor: "Sea salt & marine air", label: "SEA SALT & MARINE AIR", code: "742",
      tag: "Clean, like the air off the water.", feels: "A deep breath on the shoreline.",
      arc: ["Crisp, cool mint.", "A mineral, sea-air lift.", "Clean, with the faintest salt."],
      chem: { keys: ["Calone", "Sea salt", "Menthol"], why: "The marine note is a ketone with no aldehyde to oxidize, and salt is already at home in a sodium base.", watch: "Keep the salt to a mineral hint, never savory." },
      who: "Mint-fatigued adults who still want clean", when: "Midday reset", horizon: "next", plat: ["newfresh", "sensory"],
      alt: ["Ocean Mint", "Sea Salt Mint"], avoid: "Seafood. Sunscreen.",
      tone: "light", bg: "#E0F6F3", glow: "#FFFFFF", acc: "#12A0A6", liquid: ["#B4F0EA", "#169AA6"], ink: "#06343F", hi: "#0B8A94", map: { x: .46, y: .22 } },
    { id: "cardamom", n: "03", name: "Cardamom Mint", flavor: "Green cardamom", label: "GREEN CARDAMOM", code: "506",
      tag: "The after-dinner freshener, reimagined.", feels: "Spice-market warmth, finished cool.",
      arc: ["An airy, eucalyptus-like lift.", "Soft green spice.", "Cool, clean mint."],
      chem: { keys: ["1,8-Cineole", "Terpinyl acetate", "Menthol"], why: "Cardamom is rich in 1,8-cineole, one of the most oxidation-stable flavor molecules there is, and it bridges straight to mint.", watch: "Use a cineole-forward, low-terpene cardamom so nothing fragile goes in." },
      who: "Flavor-curious adults with global palates", when: "After a meal", horizon: "next", plat: ["elevated", "newfresh"],
      alt: ["Spiced Mint", "Chai Mint"], avoid: "Holiday baking. Curry.",
      tone: "dark", bg: "#EEF3E2", glow: "#FFFBEA", acc: "#C99A2E", liquid: ["#E3EFBE", "#6E9F55"], ink: "#FFF8E6", hi: "#F0C75E", map: { x: .64, y: .58 } },
    { id: "coconut", n: "04", name: "Coconut Mint", flavor: "Coconut water", label: "COCONUT WATER", code: "261",
      tag: "Soft, smooth and a little tropical.", feels: "Shade under the palms.",
      arc: ["Gentle, cool mint.", "Creamy, clean coconut water.", "Smooth, with nothing sweet left behind."],
      chem: { keys: ["γ-Nonalactone", "δ-Decalactone", "Menthol"], why: "Coconut’s character comes from saturated lactones, which give the oxidizer nothing to grab.", watch: "Lactones like a base near neutral, so confirm at the rinse’s pH." },
      who: "Clean-label fans of coconut oil pulling", when: "Evening routine", horizon: "long", plat: ["newfresh", "ritual"],
      alt: ["Tropical Mint", "Island Mint"], avoid: "Suntan lotion. Piña colada.",
      tone: "light", bg: "#FBF3E4", glow: "#FFFFFF", acc: "#A8773F", liquid: ["#FFF7E8", "#B7D9C6"], ink: "#3B2A1A", hi: "#2F8A63", map: { x: .5, y: .78 } },
    { id: "rosewater", n: "05", name: "Rosewater Mint", flavor: "Rosewater", label: "ROSEWATER", code: "893",
      tag: "A little luxury in the morning routine.", feels: "Morning light through a rose garden.",
      arc: ["Cool mint.", "Soft, dewy rosewater.", "Clean mint comes back."],
      chem: { keys: ["Phenylethyl alcohol", "Menthone", "Menthol"], why: "Rosewater’s softness comes from phenylethyl alcohol, a stable alcohol, rather than fragile rose terpenes.", watch: "Keep geraniol-type terpenes low: dewy and green, never soapy." },
      who: "Beauty shoppers who treat oral care as self-care", when: "Before going out", horizon: "next", plat: ["elevated", "ritual"],
      alt: ["Petal Mint", "Blossom Mint"], avoid: "Perfume counter. Bath soap.",
      tone: "light", bg: "#FDEAEE", glow: "#FFFFFF", acc: "#D9577A", liquid: ["#FFE3EA", "#E88BA3"], ink: "#4A1426", hi: "#C23E64", map: { x: .76, y: .44 } },
    { id: "orchard", n: "06", name: "Orchard Mint", flavor: "Crisp green apple", label: "CRISP GREEN APPLE", code: "437",
      tag: "Crisp, bright and easy to love.", feels: "Biting into a cold green apple.",
      arc: ["Crisp, juicy apple.", "Cool mint rises.", "A clean, bright finish."],
      chem: { keys: ["Hexyl acetate", "Ethyl 2-methylbutyrate", "Menthol"], why: "The crisp apple comes from saturated esters. We leave out the green-apple aldehydes that oxidize.", watch: "Watch the esters over shelf life and top up with stable green notes." },
      who: "Families and first-time rinse users", when: "After lunch", horizon: "near", plat: ["newfresh"],
      alt: ["Apple Mint", "Crisp Mint"], avoid: "Candy apple. Juice box.",
      tone: "light", bg: "#EFF8DF", glow: "#FFFFFF", acc: "#D8453B", liquid: ["#E8F7B0", "#86C548"], ink: "#16361D", hi: "#2F8A3A", map: { x: .34, y: .42 } }
  ];
  const CONTROL = { id: "control", name: "TheraBreath Fresh Breath", code: "150", acc: "#00A3E0" };
  const WILD = [
    { id: "sage", name: "Sage Mint", flavor: "Garden sage", plat: "elevated", line: "Soft garden herbs and cool mint.", chem: "Camphor, borneol and cineole are all saturated. We’d build it thujone-free.", sw: ["#E3EDDC", "#8FAE8A"], acc: "#7E9C7A", map: { x: .56, y: .32 } },
    { id: "watermelon", name: "Watermelon Mint", flavor: "Juicy watermelon", plat: "newfresh", line: "Juicy and bright, made for younger users.", chem: "Built on the marine ketone and saturated esters, without the melon aldehydes.", sw: ["#FFD0D8", "#F26F86"], acc: "#EE4F6A", map: { x: .4, y: .64 } },
    { id: "cedar", name: "Cedar Mint", flavor: "Cedarwood & spearmint", plat: "elevated", line: "A walk in the woods. Forest bathing, in a rinse.", chem: "Cedrol is a saturated alcohol and one of the most stable woody notes.", sw: ["#DCE8D6", "#4E7A5E"], acc: "#4E7A5E", map: { x: .86, y: .3 } }
  ];
  // Today's shelf, for the territory map (positions are our read).
  const TODAY = [
    { name: "Invigorating Icy Mint", x: .08, y: .08 }, { name: "Rainforest Mint", x: .16, y: .26 },
    { name: "Mild Mint", x: .06, y: .4 }, { name: "Chamomile Mint", x: .2, y: .68 }
  ];

  /* ---------------------------------------------------------------- chemistry */
  const CHEM = {
    base: "An alcohol-free, oxygenating sodium chlorite rinse",
    fact: "In the lab, sodium chlorite is the classic reagent for turning aldehydes into acids. In a rinse it works slowly, but it works the same way.",
    rule: "So we build every flavor from molecules with nothing for the oxidizer to find.",
    caveat: "Our bench read. Every flavor goes into accelerated stability in the real base before anyone commits to it.",
    stable: [
      { m: "Menthol", g: "Saturated alcohol", f: "Every mint" },
      { m: "1,8-Cineole", g: "Ether", f: "Cardamom" },
      { m: "WS-3 · WS-23", g: "Amide coolants", f: "Frost" },
      { m: "γ-Nonalactone", g: "Saturated lactone", f: "Coconut" },
      { m: "Hexyl acetate", g: "Saturated ester", f: "Apple" },
      { m: "Phenylethyl alcohol", g: "Stable alcohol", f: "Rosewater" },
      { m: "Calone", g: "Ketone", f: "Sea air" }
    ],
    fragile: [
      { m: "Citral", g: "Aldehyde", f: "Lemon, lime", fate: "Fades, then turns" },
      { m: "Cinnamaldehyde", g: "Aldehyde", f: "Cinnamon", fate: "Loses its bite" },
      { m: "Vanillin", g: "Aldehyde + phenol", f: "Vanilla", fate: "Goes flat" },
      { m: "Eugenol", g: "Phenol", f: "Clove", fate: "Reacts fast" },
      { m: "Nonadienal", g: "Aldehyde", f: "Cucumber, melon", fate: "Disappears" }
    ]
  };

  const DIMS = [
    ["fr", "Freshness", "How fresh does my mouth feel?"], ["li", "Liking", "Do I enjoy it?"],
    ["un", "Uniqueness", "Have I tasted this in a rinse before?"], ["re", "Would use again", "Would I reach for it tomorrow?"]
  ];
  const ACTIONS = ["Bench samples in base", "Accelerated stability test", "Sensory panel", "Consumer concept screen", "Naming & pack sketch"];

  /* ---------------------------------------------------------------- bottle */
  let bottleN = 0;
  // Drawn to match the current TheraBreath rinse: coloured bottle, ribbed two-tier orange cap,
  // white wrap label with the orange "Powered by Oxygen" band, orange FRESH BREATH box and a flavor band.
  function bottle(o) {
    const id = "tb" + (bottleN++);
    const body = "M66,122 L134,122 L134,134 C172,140 190,168 190,206 L190,462 Q190,494 158,494 L42,494 Q10,494 10,462 L10,206 C10,168 28,140 66,134 Z";
    const ribs = (x0, x1, y0, y1) => { let r = ""; for (let x = x0; x <= x1; x += 4.2) r += `<line x1="${x.toFixed(1)}" y1="${y0}" x2="${x.toFixed(1)}" y2="${y1}" stroke="rgba(120,45,0,.22)" stroke-width="1.3"/>`; return r; };
    const cond = 'style="font-stretch:72%"';
    const bubs = [[40, 470, 3, 0, 5.5], [70, 455, 2, 1.8, 6.5], [150, 480, 3.5, 3.1, 5], [165, 450, 2.5, .7, 7], [28, 440, 2, 4.2, 6]]
      .map(([x, y, r, d, du]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="0"><animate attributeName="cy" values="${y};${y - 320}" dur="${du}s" begin="${d}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.8;0" dur="${du}s" begin="${d}s" repeatCount="indefinite"/></circle>`).join("");
    const concept = !!o.sub;
    const sub = concept
      ? `<text class="subt" x="100" y="374" text-anchor="middle" font-size="9.5" fill="#006649" letter-spacing=".4" ${cond}>${o.sub.toUpperCase()}</text><text x="100" y="392" text-anchor="middle" font-size="7" fill="#C85F0E" letter-spacing="1.2" ${cond}>FLAVOR CONCEPT · NOT A PRODUCT</text>`
      : `<text x="100" y="368" text-anchor="middle" font-size="8" fill="#111" ${cond}>FIGHTS BAD BREATH FOR <tspan fill="#F58025" font-size="10">24</tspan> HOURS*</text><text class="subt" x="100" y="381" text-anchor="middle" font-size="5.6" font-weight="600" fill="#444">Works instantly to target bad breath germs</text><text x="100" y="390" text-anchor="middle" font-size="5.6" font-weight="600" fill="#444">No alcohol · Non burning</text>`;
    return `<svg class="bottle" viewBox="0 0 200 500" aria-hidden="true" font-family="Archivo, Arial Narrow, Arial, sans-serif" font-weight="900"><defs>
    <linearGradient id="${id}c" x1="0" x2="1"><stop offset="0" stop-color="#C75A0C"/><stop offset=".2" stop-color="#F7852A"/><stop offset=".45" stop-color="#FFA65A"/><stop offset=".65" stop-color="#F58025"/><stop offset="1" stop-color="#B8520A"/></linearGradient>
    <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop class="s0" offset="0" stop-color="${o.liq[0]}"/><stop class="s1" offset="1" stop-color="${o.liq[1]}"/></linearGradient>
    <linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".14" stop-color="#fff" stop-opacity=".05"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
    <clipPath id="${id}k"><path d="${body}"/></clipPath></defs>
    <path d="${body}" fill="rgba(255,255,255,.55)"/>
    <g clip-path="url(#${id}k)">
      <g class="liq" style="transform-origin:100px 330px"><g class="lvl">
        <rect x="-120" y="132" width="440" height="440" fill="url(#${id}l)"/>
        <path class="wv" d="M-200,134 q50,-8 100,0 t100,0 t100,0 t100,0 t100,0 t100,0 V156 H-200 Z" fill="${o.liq[0]}"><animateTransform attributeName="transform" type="translate" from="0 0" to="-200 0" dur="4.5s" repeatCount="indefinite"/></path>
        ${bubs}
      </g></g>
      <path d="M40,150 C70,132 130,132 160,150 L160,160 C130,146 70,146 40,160 Z" fill="#fff" opacity=".22"/>
      <rect x="10" y="206" width="180" height="246" fill="#fff"/>
      <rect x="10" y="206" width="180" height="17" fill="#F58025"/>
      <rect class="bandr" x="10" y="418" width="180" height="30" fill="${o.band}"/>
      <rect x="10" y="206" width="180" height="246" fill="url(#${id}g)" opacity=".6"/>
    </g>
    <path d="${body}" fill="url(#${id}g)" opacity=".7"/>
    <rect x="18" y="150" width="9" height="46" rx="4.5" fill="#fff" opacity=".45"/>
    <rect x="18" y="458" width="9" height="26" rx="4.5" fill="#fff" opacity=".35"/>
    <text x="100" y="218.5" text-anchor="middle" font-size="8.5" fill="#fff" letter-spacing="1" ${cond}>${concept ? "CONCEPT MOCKUP" : "POWERED BY OXYGEN™"}</text>
    ${concept ? "" : `<text x="100" y="233" text-anchor="middle" font-size="6.5" fill="#006649" letter-spacing=".8" ${cond}>PROFESSIONAL FORMULA</text>`}
    <use href="#tbLogo" x="28" y="236" width="144" height="37"/>
    ${concept ? "" : `<text x="100" y="289" text-anchor="middle" font-size="13.5" fill="#111" ${cond}>DENTIST FORMULATED</text>`}
    <rect x="30" y="295" width="140" height="28" fill="#F58025"/>
    <text x="100" y="316" text-anchor="middle" font-size="19" fill="#fff" ${cond}>FRESH BREATH</text>
    <text x="100" y="352" text-anchor="middle" font-size="27" fill="#111" letter-spacing="1" ${cond}>ORAL RINSE</text>
    ${sub}
    <text class="bandt" x="100" y="438" text-anchor="middle" font-size="13" fill="#fff" letter-spacing=".6" ${cond}${bandFit(o.flavor)}>${o.flavor.toUpperCase()}</text>
    <path d="${body}" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1"/>
    <rect class="neck" x="62" y="118" width="76" height="10" fill="${o.liq[0]}"/>
    <rect x="46" y="50" width="108" height="74" rx="9" fill="url(#${id}c)"/>${ribs(50, 150, 56, 120)}
    <rect x="46" y="112" width="108" height="12" rx="6" fill="rgba(0,0,0,.12)"/>
    <g class="cap"><path d="M58,52 L62,14 Q63,6 72,6 L128,6 Q137,6 138,14 L142,52 Z" fill="url(#${id}c)"/>${ribs(64, 136, 12, 50)}
    <rect x="60" y="48" width="80" height="4" fill="rgba(0,0,0,.16)"/>
    <rect x="70" y="6" width="60" height="5" rx="2.5" fill="#fff" opacity=".35"/></g>
    </svg>`;
  }
  const bandFit = t => t.length > 14 ? ` textLength="${Math.min(150, t.length * 9)}" lengthAdjust="spacingAndGlyphs"` : "";
  /* Recolour and relabel an existing bottle in place (used for the drain-and-refill morph). */
  function setBottle(svg, o) {
    const q = s => svg.querySelector(s);
    q(".s0").setAttribute("stop-color", o.liq[0]); q(".s1").setAttribute("stop-color", o.liq[1]);
    q(".wv").setAttribute("fill", o.liq[0]); q(".neck").setAttribute("fill", o.liq[0]);
    q(".bandr").setAttribute("fill", o.band);
    const bt = q(".bandt"); bt.textContent = o.flavor.toUpperCase();
    if (o.flavor.length > 14) { bt.setAttribute("textLength", Math.min(150, o.flavor.length * 9)); bt.setAttribute("lengthAdjust", "spacingAndGlyphs"); } else { bt.removeAttribute("textLength"); bt.removeAttribute("lengthAdjust"); }
    const st = q(".subt"); if (st && o.sub) st.textContent = o.sub.toUpperCase();
  }
  /* Concept bottle: product name on the band, flavor on the label. */
  const conceptBottleOpts = c => ({ liq: c.liquid, band: c.acc, flavor: c.name, sub: c.flavor });


  /* The bottle label draws the logo through <use href="#tbLogo">; each page
     inserts this symbol once, pointing at its own path to the logo file. */
  const logoSymbol = href => `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="tbLogo" viewBox="0 0 800 207"><image width="800" height="207" href="${href}"/></symbol></svg>`;

  /* ---------------------------------------------------------------- flavor worlds */
  // Every world is a pure function of time (t, seconds) and an optional scroll
  // progress (p, 0-1): the site scrubs it, the deck loops it and the reel renders
  // it frame-exact. No stored state, no Math.random.
  const TAU = Math.PI * 2;
  const H = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const lin = (c, x0, y0, x1, y1, st) => { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(s => g.addColorStop(s[0], s[1])); return g; };
  const rad = (c, x, y, r0, r1, st) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); st.forEach(s => g.addColorStop(s[0], s[1])); return g; };
  const fill = (c, w, h, st) => { c.fillStyle = st; c.fillRect(0, 0, w, h); };
  const sc = (w, h) => Math.max(.3, Math.min(w, h) / 900);
  const loopY = (t, sp, seed, span) => ((t * sp + H(seed) * span) % span + span) % span;

  function bubbleField(c, w, h, t, n, tints, S) {
    for (let i = 0; i < n; i++) {
      const r = (3 + Math.pow(H(i + .5), 3) * 30) * S, span = h + 90 * S;
      const y = h + 45 * S - loopY(t, (22 + H(i + .3) * 55) * S, i + .7, span);
      const x = H(i + .1) * w + Math.sin(t * 1.1 + i) * 9 * S;
      const col = tints ? tints[i % tints.length] : null;
      c.beginPath(); c.arc(x, y, r, 0, TAU);
      c.fillStyle = col ? rgba(col, .22) : "rgba(255,255,255,.14)"; c.fill();
      c.lineWidth = Math.max(1, 1.4 * S); c.strokeStyle = col ? rgba(col, .8) : "rgba(255,255,255,.72)"; c.stroke();
      c.beginPath(); c.arc(x - r * .35, y - r * .35, r * .26, 0, TAU); c.fillStyle = "rgba(255,255,255,.78)"; c.fill();
    }
  }
  function shafts(c, w, h, t, a) {
    c.save(); c.globalAlpha = a;
    for (let i = 0; i < 4; i++) {
      const x = w * (.06 + i * .27) + Math.sin(t * .2 + i) * w * .03;
      c.fillStyle = lin(c, x, 0, x + w * .1, h, [[0, "rgba(255,255,255,.6)"], [1, "rgba(255,255,255,0)"]]);
      c.beginPath(); c.moveTo(x, 0); c.lineTo(x + w * .07, 0); c.lineTo(x + w * .24, h); c.lineTo(x + w * .1, h); c.closePath(); c.fill();
    }
    c.restore();
  }
  function wave(c, w, y0, A, f, ph, step) {
    c.beginPath(); c.moveTo(0, y0);
    for (let x = 0; x <= w + step; x += step) c.lineTo(x, y0 + A * Math.sin(x * f + ph) + A * .42 * Math.sin(x * f * 2.3 - ph * 1.3));
  }
  function twinkles(c, w, h, t, n, seed, S, col, top) {
    c.strokeStyle = col; c.lineCap = "round";
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, Math.sin(t * 1.8 + i * 1.7 + seed)); if (a < .08) continue;
      const x = H(i + seed) * w, y = H(i + seed + 9) * h * (top || 1), r = (5 + H(i + seed + 3) * 9) * S * a;
      c.globalAlpha = a; c.lineWidth = Math.max(1, 1.3 * S);
      c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r, y); c.moveTo(x, y - r); c.lineTo(x, y + r); c.stroke();
    }
    c.globalAlpha = 1;
  }
  function leaf(c, x, y, L, a, col, rib) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(L * .5, -L * .32, L, 0); c.quadraticCurveTo(L * .5, L * .32, 0, 0);
    c.fillStyle = col; c.fill();
    if (rib) { c.strokeStyle = rib; c.lineWidth = Math.max(1, L * .03); c.beginPath(); c.moveTo(L * .05, 0); c.lineTo(L * .92, 0); c.stroke(); }
    c.restore();
  }

  const WORLDS = {
    oxygen: { tone: "light", draw(c, w, h, t) {
      const S = sc(w, h);
      fill(c, w, h, lin(c, 0, 0, 0, h, [[0, "#EAF9FF"], [.5, "#A9E1F8"], [1, "#1C8FD6"]]));
      shafts(c, w, h, t, .5);
      bubbleField(c, w, h, t, 70, null, S);
    } },
    finale: { tone: "dark", draw(c, w, h, t) {
      const S = sc(w, h);
      fill(c, w, h, lin(c, 0, 0, 0, h, [[0, "#1A9BE0"], [.55, "#0072BC"], [1, "#006649"]]));
      shafts(c, w, h, t, .25);
      bubbleField(c, w, h, t, 80, CONCEPTS.map(k => k.liquid[0]), S);
    } },
    frost: { tone: "dark", draw(c, w, h, t) {
      const S = sc(w, h);
      fill(c, w, h, lin(c, 0, 0, 0, h, [[0, "#030E2B"], [.55, "#0A3576"], [1, "#2C8FD0"]]));
      fill(c, w, h, rad(c, w * .62, h * .56, 0, Math.max(w, h) * .6, [[0, "rgba(160,230,255,.42)"], [1, "rgba(160,230,255,0)"]]));
      for (let k = 0; k < 2; k++) {
        const base = h * (.14 + k * .08);
        c.beginPath();
        for (let x = 0; x <= w + 16; x += 16) { const y = base + Math.sin(x * .0035 / S + t * .25 + k * 2) * h * .05 + Math.sin(x * .009 / S - t * .18) * h * .018; x ? c.lineTo(x, y) : c.moveTo(x, y); }
        for (let x = w + 16; x >= -16; x -= 16) c.lineTo(x, base + h * .13 + Math.sin(x * .0035 / S + t * .25 + k * 2 + .6) * h * .05);
        c.closePath();
        c.fillStyle = lin(c, 0, base - h * .06, 0, base + h * .2, [[0, "rgba(90,255,200,0)"], [.4, k ? "rgba(130,200,255,.22)" : "rgba(90,255,200,.24)"], [1, "rgba(90,255,200,0)"]]);
        c.fill();
      }
      const flake = (x, y, R, rot, a) => {
        c.save(); c.translate(x, y); c.rotate(rot); c.strokeStyle = `rgba(225,246,255,${a})`; c.lineWidth = Math.max(1, R * .03); c.lineCap = "round"; c.beginPath();
        for (let i = 0; i < 6; i++) {
          c.rotate(TAU / 6); c.moveTo(0, -R * .16); c.lineTo(0, -R);
          [.38, .6, .8].forEach(f => { const l = R * (.36 - f * .2); c.moveTo(0, -R * f); c.lineTo(l * .8, -R * f - l * .62); c.moveTo(0, -R * f); c.lineTo(-l * .8, -R * f - l * .62); });
        }
        for (let i = 0; i <= 6; i++) { const a2 = i / 6 * TAU; i ? c.lineTo(Math.cos(a2) * R * .16, Math.sin(a2) * R * .16) : c.moveTo(R * .16, 0); }
        c.stroke(); c.restore();
      };
      for (let i = 0; i < 6; i++) flake(w * (.06 + H(i + 50) * .88), h * (.12 + H(i + 60) * .72), (70 + H(i + 70) * 150) * S, t * .04 * (i % 2 ? 1 : -1) + i, .14 + H(i + 80) * .2);
      c.beginPath(); c.moveTo(0, h);
      for (let i = 0; i <= 26; i++) { const x = i / 26 * w; c.lineTo(x, h - (.04 + H(i + 90) * .12) * h); c.lineTo(x + w / 52, h - (.015 + H(i + 95) * .04) * h); }
      c.lineTo(w, h); c.closePath(); c.fillStyle = lin(c, 0, h * .8, 0, h, [[0, "rgba(220,248,255,.35)"], [1, "rgba(255,255,255,.7)"]]); c.fill();
      c.fillStyle = "rgba(255,255,255,.85)";
      for (let i = 0; i < 110; i++) {
        const y = loopY(t, (12 + H(i + 200) * 40) * S, i + 210, h + 20) - 10, x = ((H(i + 220) * w + Math.sin(t * .7 + i) * 14 * S) % w + w) % w;
        c.beginPath(); c.arc(x, y, (.8 + H(i + 230) * 2.2) * S, 0, TAU); c.fill();
      }
      twinkles(c, w, h, t, 14, 300, S, "#FFFFFF", .8);
    } },
    coastal: { tone: "light", draw(c, w, h, t) {
      const S = sc(w, h);
      fill(c, w, h, lin(c, 0, 0, 0, h * .6, [[0, "#F3FBF8"], [1, "#C4ECE6"]]));
      const sx = w * .8, sy = h * .22;
      fill(c, w, h, rad(c, sx, sy, 0, Math.min(w, h) * .5, [[0, "rgba(255,244,205,.9)"], [.15, "rgba(255,244,205,.5)"], [1, "rgba(255,244,205,0)"]]));
      c.beginPath(); c.arc(sx, sy, Math.min(w, h) * .06, 0, TAU); c.fillStyle = "#FFF6D8"; c.fill();
      const cols = ["#A9E4DD", "#6FCFCB", "#34B1B8", "#138E9E", "#0A6A80"];
      for (let k = 0; k < 5; k++) {
        const y0 = h * (.47 + k * .105), A = (8 + k * 6) * S, f = (.0045 - k * .0004) / S, ph = t * (.45 + k * .16) + k * 1.7;
        wave(c, w, y0, A, f, ph, 10); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fillStyle = cols[k]; c.fill();
        wave(c, w, y0, A, f, ph, 10); c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = Math.max(1, 2 * S); c.stroke();
      }
      c.lineCap = "round";
      for (let i = 0; i < 34; i++) {
        const a = Math.max(0, Math.sin(t * 2.6 + i * 2.1)); if (a < .1) continue;
        const k = 1 + i % 3, x = H(i + 400) * w, y = h * (.49 + k * .105) + H(i + 410) * h * .05;
        c.strokeStyle = `rgba(255,255,255,${a * .9})`; c.lineWidth = Math.max(1, 2 * S); c.beginPath(); c.moveTo(x - 10 * S * a, y); c.lineTo(x + 10 * S * a, y); c.stroke();
      }
      for (let i = 0; i < 26; i++) {
        const y = h - loopY(t, (8 + H(i + 500) * 14) * S, i + 510, h * .55), x = H(i + 520) * w, s = (2 + H(i + 530) * 3) * S;
        c.save(); c.translate(x, y); c.rotate(t * .6 + i); c.fillStyle = "rgba(255,255,255,.75)"; c.fillRect(-s, -s, s * 2, s * 2); c.restore();
      }
    } },
    cardamom: { tone: "dark", draw(c, w, h, t) {
      const S = sc(w, h), cx = w * .62, cy = h * .5, R = Math.min(w, h) * .46;
      fill(c, w, h, rad(c, cx, cy, 0, Math.max(w, h) * .75, [[0, "#237E61"], [.6, "#12513F"], [1, "#082F26"]]));
      const gold = a => `rgba(236,196,94,${a})`;
      [[10, .22], [16, .42], [24, .64], [32, .88]].forEach(([n, f], j) => {
        const rr = R * f, rot = t * .03 * (j % 2 ? -1 : 1) + j;
        c.save(); c.translate(cx, cy); c.rotate(rot);
        for (let i = 0; i < n; i++) {
          c.rotate(TAU / n);
          c.beginPath(); c.moveTo(0, -rr * .8); c.quadraticCurveTo(rr * .14, -rr * .98, 0, -rr * 1.14); c.quadraticCurveTo(-rr * .14, -rr * .98, 0, -rr * .8);
          c.fillStyle = gold(.07); c.fill(); c.strokeStyle = gold(.38); c.lineWidth = Math.max(1, 1.5 * S); c.stroke();
        }
        for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU; c.beginPath(); c.arc(Math.cos(a) * rr * 1.2, Math.sin(a) * rr * 1.2, 1.6 * S, 0, TAU); c.fillStyle = gold(.45); c.fill(); }
        c.restore();
      });
      for (let i = 0; i < 16; i++) {
        const L = (22 + H(i + 604) * 28) * S, span = h + 120 * S;
        const y = span - loopY(t, (7 + H(i + 602) * 12) * S, i + 601, span) - 60 * S, x = H(i + 600) * w + Math.sin(t * .4 + i) * 20 * S;
        c.save(); c.translate(x, y); c.rotate(t * .25 * (H(i + 603) - .5) * 2 + i);
        c.beginPath(); c.ellipse(0, 0, L, L * .5, 0, 0, TAU); c.fillStyle = lin(c, 0, -L * .5, 0, L * .5, [[0, "#D6EBA8"], [1, "#6E9F4C"]]); c.fill();
        c.strokeStyle = "rgba(30,70,40,.5)"; c.lineWidth = Math.max(1, 1.2 * S); c.stroke();
        c.beginPath(); c.moveTo(-L * .9, 0); c.lineTo(L * .9, 0); c.moveTo(-L * .7, -L * .22); c.quadraticCurveTo(0, -L * .3, L * .7, -L * .22); c.moveTo(-L * .7, L * .22); c.quadraticCurveTo(0, L * .3, L * .7, L * .22);
        c.strokeStyle = "rgba(40,80,40,.3)"; c.stroke(); c.restore();
      }
      for (let i = 0; i < 70; i++) {
        const a = .3 + .7 * Math.max(0, Math.sin(t * 1.5 + i * 2.3)), y = h - loopY(t, (4 + H(i + 700) * 10) * S, i + 701, h), x = H(i + 702) * w;
        c.beginPath(); c.arc(x, y, (1 + H(i + 703) * 1.8) * S, 0, TAU); c.fillStyle = gold(a * .8); c.fill();
      }
    } },
    coconut: { tone: "light", draw(c, w, h, t) {
      const S = sc(w, h);
      fill(c, w, h, lin(c, 0, 0, 0, h, [[0, "#FFF7E6"], [1, "#EFD6AA"]]));
      fill(c, w, h, rad(c, w * .78, h * .16, 0, Math.min(w, h) * .6, [[0, "rgba(255,255,255,.95)"], [.2, "rgba(255,238,196,.6)"], [1, "rgba(255,238,196,0)"]]));
      for (let i = 0; i < 7; i++) {
        const x = ((H(i + 800) * w + t * 6 * S * (i % 2 ? 1 : -1)) % (w * 1.2) + w * 1.2) % (w * 1.2) - w * .1;
        c.beginPath(); c.ellipse(x, H(i + 801) * h, (60 + H(i + 802) * 90) * S, (30 + H(i + 803) * 40) * S, H(i) * 3, 0, TAU); c.fillStyle = "rgba(255,255,255,.14)"; c.fill();
      }
      const frond = (ox, oy, ang, len, k) => {
        const sway = Math.sin(t * .7 + k) * .05, a = ang + sway;
        const tip = [ox + Math.cos(a) * len, oy + Math.sin(a) * len + len * .35], ctrl = [ox + Math.cos(a) * len * .55, oy + Math.sin(a) * len * .55 - len * .08];
        const P = u => [(1 - u) * (1 - u) * ox + 2 * (1 - u) * u * ctrl[0] + u * u * tip[0], (1 - u) * (1 - u) * oy + 2 * (1 - u) * u * ctrl[1] + u * u * tip[1]];
        c.lineCap = "round";
        for (let u = .06; u < 1; u += .04) {
          const [x, y] = P(u), [x2, y2] = P(u + .01), ta = Math.atan2(y2 - y, x2 - x), L = len * .3 * (Math.sin(u * Math.PI) * .9 + .1);
          [-1, 1].forEach(sd => {
            const la = ta + sd * 1.05 + .35 + Math.sin(t * 1.2 + u * 9 + k) * .04;
            c.strokeStyle = sd > 0 ? "#2E7A55" : "#3C9166"; c.lineWidth = Math.max(1.5, 7 * S * (1 - u * .6));
            c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(la) * L * .6, y + Math.sin(la) * L * .6 - L * .05, x + Math.cos(la + .35) * L, y + Math.sin(la + .35) * L); c.stroke();
          });
        }
        c.strokeStyle = "#5B7F3A"; c.lineWidth = Math.max(2, 6 * S); c.beginPath(); c.moveTo(ox, oy); c.quadraticCurveTo(ctrl[0], ctrl[1], tip[0], tip[1]); c.stroke();
      };
      const L = Math.min(w, h) * .62;
      frond(-w * .03, -h * .05, 1.2, L * .75, 0); frond(-w * .03, -h * .05, .75, L * .55, 1);
      frond(w * 1.02, -h * .04, Math.PI - .35, L, 3); frond(w * 1.02, -h * .04, Math.PI - .95, L * .85, 4);
      const nut = (x, y, R) => {
        c.beginPath(); c.arc(x, y, R, 0, TAU); c.fillStyle = "#6E4B2E"; c.fill();
        c.strokeStyle = "rgba(40,20,5,.35)"; c.lineWidth = Math.max(1, 1.2 * S);
        for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; c.beginPath(); c.moveTo(x + Math.cos(a) * R * .9, y + Math.sin(a) * R * .9); c.lineTo(x + Math.cos(a + .08) * R * .99, y + Math.sin(a + .08) * R * .99); c.stroke(); }
        c.beginPath(); c.arc(x, y, R * .84, 0, TAU); c.fillStyle = "#FFF9EE"; c.fill();
        c.beginPath(); c.arc(x, y, R * .7, 0, TAU); c.fillStyle = rad(c, x - R * .2, y - R * .2, 0, R * .7, [[0, "#FFFFFF"], [1, "#E6EEDC"]]); c.fill();
        c.beginPath(); c.ellipse(x - R * .25, y - R * .3, R * .22, R * .08, -.6, 0, TAU); c.fillStyle = "rgba(255,255,255,.9)"; c.fill();
      };
      nut(w * .1, h * .98, Math.min(w, h) * .16); nut(w * .92, h * 1.02, Math.min(w, h) * .12);
      for (let i = 0; i < 24; i++) {
        const y = h - loopY(t, (10 + H(i + 900) * 16) * S, i + 901, h * 1.1), x = H(i + 902) * w + Math.sin(t * .8 + i) * 10 * S;
        c.beginPath(); c.arc(x, y, (2 + H(i + 903) * 5) * S, 0, TAU); c.fillStyle = "rgba(255,255,255,.6)"; c.fill();
      }
    } },
    rosewater: { tone: "light", draw(c, w, h, t) {
      const S = sc(w, h), cx = w * .7, cy = h * .5, R = Math.min(w, h) * .42;
      fill(c, w, h, lin(c, 0, 0, 0, h, [[0, "#FFF4F6"], [.6, "#FAD2DB"], [1, "#EFA2B5"]]));
      fill(c, w, h, rad(c, cx, cy, 0, R * 1.6, [[0, "rgba(255,255,255,.7)"], [1, "rgba(255,255,255,0)"]]));
      c.save(); c.translate(cx, cy); c.rotate(t * .02);
      for (let i = 34; i >= 0; i--) {
        const a = i * 2.39996, rr = R * .62 * Math.sqrt((i + 1) / 35), sz = R * (.1 + .26 * (i / 34));
        c.save(); c.rotate(a); c.translate(rr, 0);
        c.beginPath(); c.ellipse(0, 0, sz, sz * .64, 0, 0, TAU);
        c.fillStyle = `rgba(226,110,145,${.09 + .16 * (1 - i / 34)})`; c.fill(); c.strokeStyle = "rgba(255,255,255,.45)"; c.lineWidth = Math.max(1, 1.2 * S); c.stroke(); c.restore();
      }
      c.restore();
      for (let i = 0; i < 28; i++) {
        const span = h + 60 * S, y = loopY(t, (18 + H(i + 1000) * 30) * S, i + 1001, span) - 30 * S, x = H(i + 1002) * w + Math.sin(t * .8 + i) * 40 * S;
        const flip = Math.cos(t * 1.7 + i), s2 = (.7 + H(i + 1003) * .7) * S;
        c.save(); c.translate(x, y); c.rotate(t * (.5 + H(i + 1004)) * (i % 2 ? 1 : -1) + i);
        c.beginPath(); c.ellipse(0, 0, 13 * s2, 9 * s2 * Math.abs(flip) + 1, 0, 0, TAU);
        c.fillStyle = lin(c, -13 * s2, 0, 13 * s2, 0, [[0, "#FFC9D6"], [1, "#E27D98"]]); c.fill(); c.restore();
      }
      twinkles(c, w, h, t, 16, 1100, S, "#FFFFFF");
    } },
    orchard: { tone: "light", draw(c, w, h, t, s, p) {
      const S = sc(w, h), pp = p || 0;
      fill(c, w, h, lin(c, 0, 0, 0, h, [[0, "#E1F4FF"], [.55, "#F5FBE7"], [1, "#E4F2C4"]]));
      c.save(); c.translate(w * .1, h * .06); c.rotate(t * .02);
      for (let i = 0; i < 10; i++) { c.rotate(TAU / 10); c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.max(w, h) * 1.2, -40 * S); c.lineTo(Math.max(w, h) * 1.2, 40 * S); c.closePath(); c.fillStyle = "rgba(255,255,255,.16)"; c.fill(); }
      c.restore();
      ["#CBE9A0", "#98CF64", "#5FAE3F"].forEach((col, k) => {
        const y0 = h * (.74 + k * .09), off = pp * (k + 1) * 40 * S;
        c.beginPath(); c.moveTo(0, h);
        for (let x = 0; x <= w + 20; x += 20) c.lineTo(x, y0 + Math.sin((x + off) * .004 / S + k * 2) * 26 * S + Math.sin((x + off) * .011 / S) * 8 * S);
        c.lineTo(w, h); c.closePath(); c.fillStyle = col; c.fill();
      });
      const B0 = [w * 1.03, h * .1], BC = [w * .82, h * .0], B1 = [w * .5, h * .2];
      const BP = u => [(1 - u) * (1 - u) * B0[0] + 2 * (1 - u) * u * BC[0] + u * u * B1[0], (1 - u) * (1 - u) * B0[1] + 2 * (1 - u) * u * BC[1] + u * u * B1[1]];
      c.lineCap = "round"; c.strokeStyle = "#6B4A2E"; c.lineWidth = 16 * S; c.beginPath(); c.moveTo(B0[0], B0[1]); c.quadraticCurveTo(BC[0], BC[1], B1[0], B1[1]); c.stroke();
      c.lineWidth = 7 * S; c.beginPath(); const tw = BP(.45); c.moveTo(tw[0], tw[1]); c.quadraticCurveTo(tw[0] - 30 * S, tw[1] - 60 * S, tw[0] - 90 * S, tw[1] - 70 * S); c.stroke();
      for (let i = 0; i < 16; i++) { const [x, y] = BP(.05 + i / 16 * .92); leaf(c, x, y, (36 + H(i + 1200) * 22) * S, (i % 2 ? .9 : 2.4) + Math.sin(t * 1.1 + i) * .12, i % 3 ? "#4E9A3A" : "#6DB84A", "rgba(30,70,20,.35)"); }
      [[.28, 1.0, 0], [.55, 1.15, 1], [.8, .92, 2]].forEach(([u, k, j]) => {
        const [x, y] = BP(u), ang = Math.sin(t * .9 + j * 1.7) * .08, L = 40 * S, R = 34 * S * k;
        c.save(); c.translate(x, y); c.rotate(ang);
        c.strokeStyle = "#5A3E26"; c.lineWidth = 4 * S; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, L); c.stroke();
        c.beginPath(); c.arc(0, L + R * .9, R, 0, TAU);
        c.fillStyle = j === 1 ? rad(c, -R * .3, L + R * .5, 0, R * 1.2, [[0, "#D8F27A"], [1, "#6FAE2C"]]) : rad(c, -R * .3, L + R * .5, 0, R * 1.2, [[0, "#FF8A70"], [1, "#C92E24"]]);
        c.fill(); c.beginPath(); c.ellipse(-R * .35, L + R * .55, R * .22, R * .12, -.6, 0, TAU); c.fillStyle = "rgba(255,255,255,.65)"; c.fill();
        leaf(c, 0, L - 2 * S, 26 * S, -.5, "#5FAE3F"); c.restore();
      });
      for (let i = 0; i < 10; i++) {
        const y = loopY(t, (20 + H(i + 1300) * 20) * S, i + 1301, h + 40) - 20, x = H(i + 1302) * w + Math.sin(t * .9 + i) * 50 * S;
        leaf(c, x, y, 22 * S, t * (i % 2 ? 1 : -1) + i, i % 2 ? "#86C548" : "#B7DB6A");
      }
    } },
    sage: { tone: "light", draw(c, w, h, t) {
      const S = sc(w, h);
      fill(c, w, h, lin(c, 0, 0, w * .3, h, [[0, "#EEF3EA"], [1, "#A9BFA2"]]));
      for (let i = 0; i < 20; i++) leaf(c, H(i + 1400) * w, H(i + 1401) * h, (70 + H(i + 1402) * 70) * S, H(i + 1403) * 6 + Math.sin(t * .5 + i) * .1, `rgba(${110 + H(i) * 40 | 0},${145 + H(i + 1) * 30 | 0},${120},.55)`, "rgba(255,255,255,.4)");
      fill(c, w, h, lin(c, 0, h * .6, 0, h, [[0, "rgba(255,255,255,0)"], [1, "rgba(255,255,255,.35)"]]));
    } },
    watermelon: { tone: "dark", draw(c, w, h, t) {
      const S = sc(w, h);
      fill(c, w, h, lin(c, 0, 0, 0, h, [[0, "#FF9DAE"], [1, "#E8455F"]]));
      const R = w * 1.4, cx = w * .5, cy = h + R - h * .16;
      [["#2F8A3F", 0], ["#4CAF5A", 18 * S], ["#F4FFE9", 34 * S]].forEach(([col, d]) => { c.beginPath(); c.arc(cx, cy, R - d, 0, TAU); c.fillStyle = col; c.fill(); });
      c.beginPath(); c.arc(cx, cy, R - 44 * S, 0, TAU); c.fillStyle = "#F25A70"; c.fill();
      for (let i = 0; i < 34; i++) {
        const x = H(i + 1500) * w, y = H(i + 1501) * h * .8 + Math.sin(t * .6 + i) * 6 * S;
        c.save(); c.translate(x, y); c.rotate(H(i + 1502) * 6 + t * .1); c.beginPath(); c.ellipse(0, 0, 5 * S, 9 * S, 0, 0, TAU); c.fillStyle = "#2B1A14"; c.fill();
        c.beginPath(); c.ellipse(-1.5 * S, -3 * S, 1.2 * S, 2.5 * S, 0, 0, TAU); c.fillStyle = "rgba(255,255,255,.4)"; c.fill(); c.restore();
      }
      bubbleField(c, w, h, t, 18, ["#FFFFFF"], S * .8);
    } },
    cedar: { tone: "dark", draw(c, w, h, t, s, p) {
      const S = sc(w, h), pp = p || 0;
      fill(c, w, h, lin(c, 0, 0, 0, h, [[0, "#0F3A36"], [1, "#2B6453"]]));
      [["#1D4F45", .62, .9], ["#173F38", .72, 1.1], ["#0E2E29", .82, 1.3]].forEach(([col, base, sz], k) => {
        c.fillStyle = col;
        for (let i = -1; i < 14; i++) {
          const x = (i / 12) * w + ((pp * 60 * (k + 1) * S) % (w / 12)) + H(i + k * 20) * 30 * S, th = (120 + H(i + k * 30) * 160) * S * sz, bw = th * .42, y = h * base + H(i + k) * 30 * S;
          for (let j = 0; j < 3; j++) { const ty = y - th * j * .3; c.beginPath(); c.moveTo(x, ty - th * .45); c.lineTo(x + bw * (1 - j * .22), ty + th * .08); c.lineTo(x - bw * (1 - j * .22), ty + th * .08); c.closePath(); c.fill(); }
          c.fillRect(x - 4 * S, y, 8 * S, th * .14);
        }
      });
      for (let k = 0; k < 2; k++) {
        const y = h * (.55 + k * .15), x = ((t * 12 * S + k * w * .5) % (w * 1.5)) - w * .5;
        c.fillStyle = lin(c, 0, y - 60 * S, 0, y + 60 * S, [[0, "rgba(255,255,255,0)"], [.5, "rgba(230,245,235,.12)"], [1, "rgba(255,255,255,0)"]]); c.fillRect(x, y - 60 * S, w, 120 * S);
      }
      for (let i = 0; i < 40; i++) { const y = loopY(t, (6 + H(i + 1600) * 10) * S, i + 1601, h), x = H(i + 1602) * w + Math.sin(t * .5 + i) * 12 * S; c.beginPath(); c.arc(x, y, 1.4 * S, 0, TAU); c.fillStyle = "rgba(230,245,220,.5)"; c.fill(); }
    } },
    lab: { tone: "dark", draw(c, w, h, t) {
      const S = sc(w, h), a = 40 * S, dx = a * Math.sqrt(3);
      fill(c, w, h, rad(c, w * .5, h * .45, 0, Math.max(w, h) * .8, [[0, "#10306E"], [1, "#040D24"]]));
      c.strokeStyle = "rgba(110,170,255,.11)"; c.lineWidth = 1; const off = (t * 5 * S) % (a * 3); c.beginPath();
      for (let row = -1; row * a * 1.5 < h + a * 3; row++) for (let col = -1; col * dx < w + dx; col++) {
        const x = col * dx + (row % 2 ? dx / 2 : 0), y = row * a * 1.5 - off;
        for (let k = 0; k <= 6; k++) { const an = k / 6 * TAU + Math.PI / 6; k ? c.lineTo(x + Math.cos(an) * a, y + Math.sin(an) * a) : c.moveTo(x + Math.cos(an) * a, y + Math.sin(an) * a); }
      }
      c.stroke();
      for (let i = 0; i < 46; i++) {
        const x = (H(i + 1700) * w + t * (6 + H(i + 1701) * 10) * S) % w, y = H(i + 1702) * h + Math.sin(t * .8 + i) * 12 * S, al = .35 + .65 * Math.max(0, Math.sin(t * 1.6 + i * 2));
        c.beginPath(); c.arc(x, y, (1.4 + H(i + 1703) * 2.4) * S, 0, TAU); c.fillStyle = i % 3 ? `rgba(120,220,255,${al * .7})` : `rgba(255,140,80,${al * .8})`; c.fill();
      }
    } },
    spectrum: { tone: "light", draw(c, w, h, t) {
      const S = sc(w, h), cx = w * .5, cy = h * .5, R = Math.hypot(w, h) * .55;
      const pal = ["#E9C46A", "#F4A261", "#E76F51", "#2A9D8F", "#8AB17D", "#F2A7BC", "#8EC5FF", "#FFD166", "#06D6A0", "#EF476F", "#9FD8CB", "#D4A373"];
      fill(c, w, h, rad(c, cx, cy, 0, R, [[0, "#FFFDF8"], [1, "#FBEFDC"]]));
      for (let i = 0; i < 260; i++) {
        const f = .03 + Math.pow(H(i + 1800), .8) * .97, arm = i % 4, a = arm / 4 * TAU + f * 3.4 + t * .05 + (H(i + 1801) - .5) * .7;
        const x = cx + Math.cos(a) * f * R, y = cy + Math.sin(a) * f * R * .78;
        c.beginPath(); c.arc(x, y, (3 + H(i + 1802) * 12) * S * (.6 + f * .8), 0, TAU); c.fillStyle = rgba(pal[i % pal.length], .42 + H(i + 1803) * .25); c.fill();
      }
    } },
    ripple: { tone: "light", draw(c, w, h, t) {
      const S = sc(w, h), cx = w * .5, cy = h * .56;
      fill(c, w, h, lin(c, 0, 0, 0, h, [[0, "#F8FCFE"], [1, "#D7ECF6"]]));
      for (let k = 0; k < 8; k++) {
        const ph = (t * .12 + k / 8) % 1, r = ph * Math.max(w, h) * .75;
        c.beginPath(); c.ellipse(cx, cy, r, r * .34, 0, 0, TAU); c.strokeStyle = `rgba(40,140,200,${(1 - ph) * .32})`; c.lineWidth = Math.max(1, 2.2 * S * (1 - ph * .5)); c.stroke();
      }
      c.beginPath(); c.ellipse(cx, cy, 10 * S, 3.4 * S, 0, 0, TAU); c.fillStyle = "rgba(40,140,200,.35)"; c.fill();
    } },
    studio: { tone: "light", draw(c, w, h, t) {
      const S = sc(w, h), g = 30 * S;
      fill(c, w, h, "#FBF6EF");
      c.fillStyle = "#E6DCCD"; for (let y = g / 2; y < h; y += g) for (let x = g / 2; x < w; x += g) c.fillRect(x - S, y - S, 2 * S, 2 * S);
      CONCEPTS.concat(CONCEPTS).forEach((k, i) => {
        const a = t * .06 * (i % 2 ? 1 : -1) + i * 1.3, rr = Math.min(w, h) * (.25 + H(i + 1900) * .3);
        const x = w * .5 + Math.cos(a) * rr * 1.5, y = h * .5 + Math.sin(a) * rr * .8, s2 = (22 + H(i + 1901) * 30) * S;
        c.fillStyle = rgba(k.acc, .2);
        if (i % 3) { c.beginPath(); c.arc(x, y, s2, 0, TAU); c.fill(); } else { c.save(); c.translate(x, y); c.rotate(a); c.fillRect(-s2, -s2, s2 * 2, s2 * 2); c.restore(); }
      });
    } },
    aura: { tone: "light", draw(c, w, h, t) {
      const R = Math.max(w, h) * .55;
      fill(c, w, h, "#FFF8F1");
      [["#FFD6B3", .18, .28], ["#C9F2E1", .78, .22], ["#D3E9FF", .62, .82], ["#FFDDE8", .12, .82], ["#FFF0BD", .46, .52]].forEach(([col, x, y], i) => {
        const X = w * (x + Math.sin(t * .07 + i * 2) * .08), Y = h * (y + Math.cos(t * .06 + i) * .08);
        fill(c, w, h, rad(c, X, Y, 0, R, [[0, rgba(col, .95)], [1, rgba(col, 0)]]));
      });
    } },
    river: { tone: "light", draw(c, w, h, t) {
      const S = sc(w, h);
      fill(c, w, h, lin(c, 0, 0, 0, h, [[0, "#F4FAF7"], [1, "#E6F3EE"]]));
      [["#006649", .3], ["#00A3E0", .52], ["#F58025", .74]].forEach(([col, f], k) => {
        const y0 = h * f;
        c.beginPath(); for (let x = 0; x <= w + 16; x += 16) c.lineTo(x, y0 - 34 * S + Math.sin(x * .004 / S + t * .6 + k) * 12 * S);
        for (let x = w + 16; x >= -16; x -= 16) c.lineTo(x, y0 + 34 * S + Math.sin(x * .004 / S + t * .6 + k + .8) * 12 * S);
        c.closePath(); c.fillStyle = rgba(col, .12); c.fill();
        for (let i = 0; i < 40; i++) { const x = (H(i + 2000 + k * 50) * w + t * (40 + H(i + 2001) * 60) * S) % w, y = y0 + (H(i + 2002 + k) - .5) * 50 * S + Math.sin(x * .004 / S + t * .6 + k) * 12 * S; c.beginPath(); c.arc(x, y, (1.5 + H(i + 2003) * 2.5) * S, 0, TAU); c.fillStyle = rgba(col, .55); c.fill(); }
      });
    } }
  };
  // Back-compat: ART[id].init/draw, as the reel and deck use it.
  const ART = {};
  Object.keys(WORLDS).forEach(k => { ART[k] = { init: () => ({}), draw: WORLDS[k].draw, tone: WORLDS[k].tone }; });

  const TB = { SESSION, OBJECTIVES, AGENDA, HORIZONS, CREATE, PLATS, PLAT_LINES, TRENDS, TREND_LIST, CONCEPTS, CONTROL, WILD, TODAY, CHEM, DIMS, ACTIONS,
    hex, rgba, rng, bottle, setBottle, conceptBottleOpts, logoSymbol, ART, WORLDS };
  if (typeof module === "object" && module.exports) module.exports = TB;
  else root.TBCore = TB;
})(typeof self !== "undefined" ? self : this);
