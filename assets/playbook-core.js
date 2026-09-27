/* ==========================================================================
   TheraBreath Flavor Playbook · shared core
   One source of truth for the web experience (index.html) and the slide deck
   (deck/index.html): concept data, regions, frameworks, the bottle drawing and
   the generative concept artwork. Edit copy here and both update.
   ========================================================================== */
(function (root) {
  "use strict";
  const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
  const rgba = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r * 255 | 0},${g * 255 | 0},${b * 255 | 0},${a})`; };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  /* ---------------------------------------------------------------- data */
  const PLATS = { newfresh: "New Fresh", sensory: "Sensory Proof", ritual: "Ritual by Time", elevated: "Elevated Escape" };
  const CONCEPTS = [
    { id: "yuzu", n: "01", name: "Polar Spark", flavor: "Arctic Yuzu", tag: "Citrus, electrified by cold.", status: "lead", code: "318", tone: "light", bg: "#E1F4FC", glow: "#F6FBC8", acc: "#C3D21E", band: "Electric Citrus Chill",
      liquid: ["#D9EA5C", "#58BCE6"], kw: ["electric", "icy", "citrus", "clean", "modern", "energetic"],
      feels: "The first breath outside on a clear winter morning, lit by citrus.",
      arc: ["Sharp yuzu peel, almost electric.", "A clean cold wave builds, with no burn.", "Bright, awake, completely clean."],
      plat: ["newfresh", "sensory"],
      note: "Build the yuzu from oxidation-tolerant top notes, since citral-heavy lemon profiles fade in oxidizing rinse systems. Non-menthol cooling agents carry the cold without the burn.",
      avoid: "Lemon mouthwash. Snowflakes." },
    { id: "gtc", n: "02", name: "Glasshouse", flavor: "Green Tea Cucumber", tag: "Botanical calm, poured cold.", status: "lead", code: "742", tone: "light", bg: "#E6F3E8", glow: "#FFFFFF", acc: "#4E9A6E", band: "Clean Botanical Calm",
      liquid: ["#9FD6A6", "#3C9A68"], kw: ["clean", "botanical", "spa-like", "calm", "hydrating", "effortless"],
      feels: "A glass of cold water in a quiet, sunlit room.",
      arc: ["Soft green sencha, cool and light.", "Watery cucumber freshness settles in.", "Hydrated and calm, nothing left over."],
      plat: ["newfresh", "ritual"],
      note: "Cucumber’s green notes are volatile and fragile. A quiet spearmint backbone protects the profile and keeps it reading as oral care.",
      avoid: "Health-food store. Cucumber slices on eyes." },
    { id: "ginger", n: "03", name: "Live Wire", flavor: "Ginger Lime", tag: "Cool lime. Hot spark.", status: "lead", code: "506", tone: "dark", bg: "#1B2710", glow: "#4F3410", acc: "#F58220", band: "Zesty Warming Spark",
      liquid: ["#C4E04A", "#E88E36"], kw: ["bright", "kinetic", "warming", "crisp", "energetic", "unexpected"],
      feels: "Cold lime on the tongue, then a spark of warmth underneath.",
      arc: ["A zesty lime snap.", "Ginger warmth rises under the cool.", "Crisp, energized, clean."],
      plat: ["sensory", "ritual"],
      note: "Warmth has to read as lively, never as burn, because no-burn is the TheraBreath promise. Keep ginger’s pungency well below irritation and let cooling lead.",
      avoid: "Margaritas. Anything that looks like a cocktail." },
    { id: "grapefruit", n: "04", name: "Pink Hour", flavor: "Grapefruit Rose Mint", tag: "Golden hour, in pink.", status: "contender", code: "261", tone: "light", bg: "#FCE8E2", glow: "#FFF8F5", acc: "#E2553F", band: "Bright Citrus Floral",
      liquid: ["#F6A898", "#DD5E4A"], kw: ["elevated", "aromatic", "modern botanical", "citrus floral"],
      feels: "Morning light through pink glass.",
      arc: ["Juicy pink grapefruit.", "A dry, green rose heart: more stem than petal.", "Cool mint comes back to close."],
      plat: ["elevated", "newfresh"],
      note: "Use a green, geranium-leaning rose accord rather than a sweet floral. That keeps it far from soap and perfume cues.",
      avoid: "Perfume counter. Bath soap." },
    { id: "pear", n: "05", name: "Orchard Reserve", flavor: "Pear Cardamom Mint", tag: "Pear and cardamom, finished cool.", status: "contender", code: "893", tone: "light", bg: "#F3EFD8", glow: "#FFFCEB", acc: "#8E7B3A", band: "Layered Culinary Cool",
      liquid: ["#E0D78A", "#A5964C"], kw: ["elegant", "layered", "culinary", "premium", "sophisticated"],
      feels: "A chef’s pairing, translated into freshness.",
      arc: ["Crisp green pear, cool.", "Cardamom’s airy, eucalyptus-like lift.", "Soft, clean spice held by mint."],
      plat: ["elevated"],
      note: "Cardamom naturally carries 1,8-cineole, the same cool note as eucalyptus. It is a built-in bridge between spice and mint.",
      avoid: "Holiday baking. Dessert." },
    { id: "chamomile", n: "06", name: "Lights Out", flavor: "Chamomile Vanilla Mint", tag: "The last rinse of the day.", status: "open", code: "437", tone: "dark", bg: "#121936", glow: "#2C3468", acc: "#E9C77A", band: "Soft Evening Calm",
      liquid: ["#E6D59C", "#958BD2"], kw: ["calm", "evening", "gentle", "soft", "comforting"],
      feels: "Lights low. The day is done.",
      arc: ["Gentle, soft mint.", "Honeyed chamomile calm.", "A dry vanilla softness, still clean."],
      plat: ["ritual"],
      note: "Keep the vanilla dry and airy, low in sweetness, so the finish reads clean rather than dessert.",
      avoid: "Tea packaging. Candles." }
  ];
  const CONTROL = { id: "control", name: "TheraBreath Fresh Breath", code: "150", acc: "#00A3E0" };
  const STATUS = { lead: "Current lead", contender: "Contender", open: "Open exploration" };
  const REGIONS = [
    { id: "japan", name: "Kōchi & Kyoto", country: "Japan", lon: 135.5, lat: 33.6, cue: "Yuzu · Sencha · Shiso · Hinoki", line: "Citrus that reads clean rather than sweet, and green tea as a daily reset.", teach: "Fresh can be bright and quiet at the same time.", plat: ["newfresh", "elevated"], links: ["yuzu", "gtc"], sw: ["#E6F04A", "#9CC5A1"] },
    { id: "seoul", name: "Seoul", country: "South Korea", lon: 127, lat: 37.5, cue: "Rice water · Green tea · Cica · Layered routines", line: "Personal care built as layered, repeated rituals.", teach: "Oral care can be a step people look forward to.", plat: ["ritual", "newfresh"], links: ["gtc"], sw: ["#F3EEE6", "#B9D6C0"] },
    { id: "kerala", name: "Kerala", country: "India", lon: 76.3, lat: 10, cue: "Green cardamom · Fresh ginger · Black pepper", line: "Cardamom pods are chewed after meals as a breath freshener.", teach: "Warm spice already means a fresh mouth for millions of people.", plat: ["sensory", "elevated"], links: ["pear", "ginger"], sw: ["#9BB36A", "#E0A550"] },
    { id: "bangkok", name: "Bangkok", country: "Thailand", lon: 100.5, lat: 13.7, cue: "Lemongrass · Makrut lime leaf · Pandan", line: "Aromatic herbs do the work of cooling in a hot climate.", teach: "Herbal brightness can feel as refreshing as menthol.", plat: ["newfresh", "sensory"], links: ["ginger"], sw: ["#D9EC7A", "#5E9E6A"] },
    { id: "mexico", name: "Mexico City & Oaxaca", country: "Mexico", lon: -97, lat: 18, cue: "Lime · Chile · Tamarind · Hoja santa", line: "Heat and sour served together as refreshment.", teach: "Contrast is a sensation people seek out.", plat: ["sensory"], links: ["ginger"], sw: ["#C8E84A", "#E0703C"] },
    { id: "la", name: "Los Angeles", country: "United States", lon: -118.2, lat: 34, cue: "Cucumber water · Matcha · Electrolytes", line: "Wellness culture turned hydration into an aesthetic.", teach: "Clean and hydrated have become flavors.", plat: ["newfresh", "ritual"], links: ["gtc"], sw: ["#CFE9D6", "#8FD0E0"] },
    { id: "marrakech", name: "Marrakech", country: "Morocco", lon: -8, lat: 31.6, cue: "Fresh mint tea · Rose · Orange blossom", line: "Mint is poured as hospitality, often alongside rose or orange blossom.", teach: "Mint can be the host, not the whole meal.", plat: ["ritual", "elevated"], links: ["grapefruit"], sw: ["#7FC8A6", "#E9A6A0"] },
    { id: "grasse", name: "Grasse", country: "France", lon: 6.9, lat: 43.6, cue: "Rose centifolia · Grapefruit · Fig leaf", line: "Perfumers build scent in layers: top, heart, base.", teach: "A rinse can be structured like a fragrance.", plat: ["elevated"], links: ["grapefruit", "pear"], sw: ["#F2B5B0", "#F4C98A"] },
    { id: "london", name: "London", country: "United Kingdom", lon: -0.1, lat: 51.5, cue: "Afternoon tea · Zero-proof botanicals · Tonic", line: "Low- and no-alcohol bars made adult flavor about craft, not proof.", teach: "Sophisticated and alcohol-free go together. TheraBreath already is both.", plat: ["elevated", "ritual"], links: ["pear", "grapefruit"], sw: ["#C9B28A", "#8FB9A6"] },
    { id: "nordics", name: "Copenhagen", country: "Denmark", lon: 12.6, lat: 55.7, cue: "Sea buckthorn · Birch · Spruce tip · Cold plunge", line: "Cold is treated as a wellness practice, not only a temperature.", teach: "Cooling can signal vitality, and proof.", plat: ["sensory"], links: ["yuzu"], sw: ["#9FE0FF", "#F2A33C"] },
    { id: "nile", name: "Nile Delta", country: "Egypt", lon: 31, lat: 30.6, cue: "Chamomile · Hibiscus", line: "One of the world’s largest chamomile-growing regions.", teach: "Calm has a flavor, and people already drink it at night.", plat: ["ritual"], links: ["chamomile"], sw: ["#F2DE8A", "#B9B7E0"] },
    { id: "madagascar", name: "Sava coast", country: "Madagascar", lon: 50, lat: -14.3, cue: "Bourbon vanilla", line: "The source of most of the world’s vanilla.", teach: "Softness can round off sharp edges without adding sweetness.", plat: ["ritual", "elevated"], links: ["chamomile"], sw: ["#F1E3B8", "#8C6A4A"] }
  ];
  const HOME = { lon: -74.66, lat: 40.35 };

  // Land mask, 144 × 54 equirectangular cells (lat 78° to −56°), one hex digit per 4 cells
  const GRID = { W: 144, H: 54, top: 78, bot: -56, rows: ["000000e86f8ffffe000200003000e0000000", "0000030000007fff00000002003ff0000000", "000003fc8fc03ffe000000041ffffff0f000", "01ffbf3e32382ffc0001f810dbffffffffef", "e1fffffffe1e1fc00003ff3fffffffffffff", "00fffffffe5c1f01c00fbdfffffffffffffe", "03ffffffe0640e00003e7fffffffffffffbc", "01d0ffffc0700000003e3fffffffffffe480", "00203ffff07e00000216fffffffffffe0180", "00000ffffeff80000508fffffffffffe0300", "000007ffffffc0000b3fffffffffffff8000", "000007fffff8400001ffffffffffffff4000", "000003fffffc000001fffef7fffffffe0000", "000003fffffa000001fbf5effffffffc0000", "000003fffff000000f94e063fffffff00000", "000003ffffc000000f12bff7ffffff208000", "000001ffff80000006001ff3ffffff910000", "000000ffff80000007f003ffffffff060000", "0000007fff0000000ffcc3ffffffff880000", "0000001fd10000000fffffefffffff800000", "0000002f810000001ffffff5ffffff000000", "00000017800000003ffffdfa1ffffe800000", "00000003818000007ffffeff0ff7f8000000", "00000003881000007ffffefe07c7c0000000", "00000000f80000003fffff7c0783e0800000", "000000001e0000007fffff700301f0800000", "00000000061000007fffff80030170c00000", "00000000022e00001ffffff0010121000000", "00000000007f80001ffffff0008000200000", "00000000007fe000003fffe0000282000000", "00000000007ff000000fffc000014e000000", "0000000010ffe000000fff8000008e080000", "0000000000fffe00000fff000000ee870000", "0000000000ffffc00007ff0000000001c800", "0000000000ffffc00007ff0000001809e000", "00000000007fffc00007ff00000000401800", "00000000007fff800007ff000000000e0000", "00000000003fff000007ff100000003c4000", "00000000001fff000007fe300000007fc000", "00000000000fff000007fc30000000ffe000", "00000000000ffe000003fc60000007fff000", "00000000000ff8000003fc20000007fff800", "00000000000ff8000003f800000003fff800", "00000000001ff0000001f000000003fff800", "00000000001fe0000001e000000003c3f800", "00000000001f80000000000000000001f000", "00000000001f80000000000000000000f000", "00000000001e000000000000000000000002", "00000000003e000000000000000000002000", "00000000001c000000000000000000000010", "00000000003c000000000000000000000000", "000000000038000000000000000000000000", "000000000038000000000000000000000000", "00000000000c004000000000000000000000"] };

  const SPECTRUM = [
    { v: 3, name: "Classic peppermint", c: false, line: "Trusted, and easy to forget." },
    { v: 12, name: "Cool mint", c: false, line: "The category default." },
    { v: 21, name: "Spearmint", c: false, line: "A small step. Still expected." },
    { v: 33, name: "Lights Out", c: true },
    { v: 40, name: "Glasshouse", c: true },
    { v: 48, name: "Polar Spark", c: true },
    { v: 55, name: "Orchard Reserve", c: true },
    { v: 61, name: "Pink Hour", c: true },
    { v: 67, name: "Live Wire", c: true },
    { v: 81, name: "Smoked chili cola", c: false, line: "Memorable once. Hard to buy twice." },
    { v: 94, name: "Pickle-brine mint", c: false, line: "Novelty for its own sake." }
  ];

  const AXES = [
    ["Adventurous", "from familiar"], ["Warming", "from cooling"], ["Calming", "from bright"], ["Layered", "from simple"],
    ["Elevated", "from everyday"], ["Ritual", "from routine"], ["Experiential", "from functional"]
  ];
  const BASE = [.12, .05, .14, .12, .14, .12, .16];
  const SHAPES = {
    yuzu: [.52, .05, .1, .22, .3, .2, .88], gtc: [.34, .05, .82, .24, .44, .56, .3], ginger: [.6, .78, .1, .34, .28, .26, .7],
    grapefruit: [.48, .1, .28, .72, .76, .32, .3], pear: [.5, .34, .34, .86, .8, .34, .24], chamomile: [.38, .24, .86, .38, .44, .86, .2],
    all: [.95, .9, .82, .94, .92, .9, .95]
  };

  const MOMENTS = [
    { h: 6.5, t: "6:30 AM", name: "Wake", flavor: "Polar Spark", line: "A bright, cold start." },
    { h: 12.5, t: "12:30 PM", name: "Midday reset", flavor: "Glasshouse", line: "Clean and calm, back to the afternoon." },
    { h: 15.25, t: "3:15 PM", name: "After coffee", flavor: "Live Wire", line: "Cut through coffee, lift the energy." },
    { h: 19, t: "7:00 PM", name: "Before going out", flavor: "Pink Hour", line: "Confident, elevated, social." },
    { h: 22.5, t: "10:30 PM", name: "Wind-down", flavor: "Lights Out", line: "Soft, clean, ready for sleep." }
  ];

  const WILD = [
    { name: "Forest Bath", flavor: "Hinoki Spearmint", plat: "elevated", line: "Japanese cypress and cool spearmint. Forest-bathing, in a rinse.", sw: ["#D8E4CF", "#7C9A7E"] },
    { name: "Sun Shower", flavor: "Watermelon Shiso", plat: "newfresh", line: "Watery summer fruit with a green, herbal snap.", sw: ["#F7C6C0", "#7FB08A"] },
    { name: "Salt Air", flavor: "Makrut Lime & Sea Salt", plat: "sensory", line: "Mineral, coastal and bright. Salinity as a sensation.", sw: ["#E6F1F0", "#B9D86A"] }
  ];

  const DIMS = [
    ["fr", "Freshness", "How fresh does it make my mouth feel?"], ["un", "Uniqueness", "Have I tasted this in oral care before?"],
    ["li", "Flavor liking", "Do I enjoy it?"], ["fit", "TheraBreath fit", "Could this sit on the TheraBreath shelf?"],
    ["me", "Memorability", "Will I remember it tonight?"], ["re", "Repeat-use potential", "Would I use it every day?"],
    ["se", "Sensory experience", "Did I feel it working?"]
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
    const sub = o.sub
      ? `<text class="subt" x="100" y="384" text-anchor="middle" font-size="8.6" fill="#006649" letter-spacing=".4" ${cond}>${o.sub.toUpperCase()} FLAVOR</text><text x="100" y="396" text-anchor="middle" font-size="5.6" font-weight="600" fill="#444">No alcohol · Non burning</text>`
      : `<text class="subt" x="100" y="381" text-anchor="middle" font-size="5.6" font-weight="600" fill="#444">Works instantly to target bad breath germs</text><text x="100" y="390" text-anchor="middle" font-size="5.6" font-weight="600" fill="#444">No alcohol · Non burning</text>`;
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
    <text x="100" y="218.5" text-anchor="middle" font-size="8.5" fill="#fff" letter-spacing="1" ${cond}>POWERED BY OXYGEN™</text>
    <text x="100" y="233" text-anchor="middle" font-size="6.5" fill="#006649" letter-spacing=".8" ${cond}>PROFESSIONAL FORMULA</text>
    <use href="#tbLogo" x="28" y="236" width="144" height="37"/>
    <text x="100" y="289" text-anchor="middle" font-size="13.5" fill="#111" ${cond}>DENTIST FORMULATED</text>
    <rect x="30" y="295" width="140" height="28" fill="#F58025"/>
    <text x="100" y="316" text-anchor="middle" font-size="19" fill="#fff" ${cond}>FRESH BREATH</text>
    <text x="100" y="352" text-anchor="middle" font-size="27" fill="#111" letter-spacing="1" ${cond}>ORAL RINSE</text>
    <text x="100" y="368" text-anchor="middle" font-size="8" fill="#111" ${cond}>FIGHTS BAD BREATH FOR <tspan fill="#F58025" font-size="10">24</tspan> HOURS*</text>
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
    const st = q(".subt"); if (st && o.sub) st.textContent = o.sub.toUpperCase() + " FLAVOR";
  }
  /* Concept bottle: product name on the band, flavor on the label. */
  const conceptBottleOpts = c => ({ liq: c.liquid, band: c.acc, flavor: c.name, sub: c.flavor });

  const splitName = n => { const w = n.split(" "); if (w.length === 1) return [n, ""]; if (w[0] === "GREEN") return [w.slice(0, 2).join(" "), w.slice(2).join(" ")]; return [w[0], w.slice(1).join(" ")]; };

  /* The bottle label draws the logo through <use href="#tbLogo">; each page
     inserts this symbol once, pointing at its own path to the logo file. */
  const logoSymbol = href => `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="tbLogo" viewBox="0 0 800 207"><image width="800" height="207" href="${href}"/></symbol></svg>`;

  /* ---------------------------------------------------------------- concept artwork */
  const ART = {
    yuzu: {
      init(r) {
        const cx = .4, cy = .44, shards = [], rays = 26, rings = [0, .09, .2, .34, .52, .8];
        const angs = Array.from({ length: rays }, (_, i) => (i + r() * .7) / rays * Math.PI * 2);
        const jit = rings.map(() => angs.map(() => .85 + r() * .3));
        for (let k = 0; k < rings.length - 1; k++) for (let i = 0; i < rays; i++) {
          const j = (i + 1) % rays, P = (a, rr) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
          shards.push({ p: [P(angs[i], rings[k] * jit[k][i]), P(angs[j], rings[k] * jit[k][j]), P(angs[j], rings[k + 1] * jit[k + 1][j]), P(angs[i], rings[k + 1] * jit[k + 1][i])], d: (rings[k] + rings[k + 1]) / 2, y: r() < .14, ph: r() * 6 });
        }
        return { shards, cx, cy, bolt: [], bt: 0, r };
      },
      draw(c, w, h, t, s) {
        let g = c.createRadialGradient(s.cx * w, s.cy * h, 0, s.cx * w, s.cy * h, w * .8);
        g.addColorStop(0, "#FFFFFF"); g.addColorStop(.35, "#D8F0FA"); g.addColorStop(1, "#5DA6CC");
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        s.shards.forEach(sh => {
          const wave = Math.max(0, Math.sin(t * 1.3 - sh.d * 9 + sh.ph * .2));
          c.beginPath(); sh.p.forEach(([x, y], i) => i ? c.lineTo(x * w, y * h) : c.moveTo(x * w, y * h)); c.closePath();
          c.fillStyle = sh.y ? `rgba(236,248,90,${.18 + wave * .4})` : `rgba(255,255,255,${.05 + wave * .28})`; c.fill();
          c.strokeStyle = `rgba(255,255,255,${.35 + wave * .5})`; c.lineWidth = 1; c.stroke();
        });
        if (t - s.bt > .12) {
          s.bt = t; s.bolt = []; let a = s.r() * Math.PI * 2, x = s.cx, y = s.cy;
          for (let i = 0; i < 14; i++) { a += (s.r() - .5) * 1.1; x += Math.cos(a) * .04; y += Math.sin(a) * .04; s.bolt.push([x, y]); }
        }
        c.save(); c.shadowColor = "#F4FF5A"; c.shadowBlur = 18; c.strokeStyle = "rgba(244,255,90,.9)"; c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(s.cx * w, s.cy * h); s.bolt.forEach(([x, y]) => c.lineTo(x * w, y * h)); c.stroke(); c.restore();
        const pr = .12 + .03 * Math.sin(t * 2.2);
        g = c.createRadialGradient(s.cx * w, s.cy * h, 0, s.cx * w, s.cy * h, w * pr * 2);
        g.addColorStop(0, "rgba(246,255,140,.85)"); g.addColorStop(1, "rgba(246,255,140,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h);
      }
    },
    gtc: {
      init(r) { return { src: [[.34, .38], [.66, .62], [.5, .8]], r }; },
      draw(c, w, h, t, s) {
        let g = c.createLinearGradient(0, 0, w * .3, h); g.addColorStop(0, "#F6FBF6"); g.addColorStop(1, "#B5D6BE"); c.fillStyle = g; c.fillRect(0, 0, w, h);
        for (let i = 0; i < 4; i++) {
          const x = ((t * .015 + i * .27) % 1.4 - .2) * w;
          g = c.createLinearGradient(x - w * .12, 0, x + w * .12, 0); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(.5, "rgba(255,255,255,.35)"); g.addColorStop(1, "rgba(255,255,255,0)");
          c.save(); c.translate(w / 2, h / 2); c.rotate(-.5); c.translate(-w / 2, -h / 2); c.fillStyle = g; c.fillRect(x - w * .12, -h, w * .24, h * 3); c.restore();
        }
        const cx = w * .56, cy = h * .5, R = w * .3, rot = t * .04;
        c.save(); c.translate(cx, cy); c.rotate(rot);
        c.fillStyle = "rgba(255,255,255,.38)"; c.beginPath(); c.arc(0, 0, R, 0, 6.283); c.fill();
        c.strokeStyle = "rgba(94,143,116,.45)"; c.lineWidth = 2.5; c.stroke();
        c.strokeStyle = "rgba(94,143,116,.22)"; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, R * .86, 0, 6.283); c.stroke();
        c.fillStyle = "rgba(210,232,200,.55)"; c.beginPath(); c.arc(0, 0, R * .5, 0, 6.283); c.fill();
        for (let k = 0; k < 3; k++) { const a = k / 3 * 6.283; for (let j = 0; j < 5; j++) { const rr = R * (.18 + j * .065), aa = a + (j - 2) * .1; c.save(); c.translate(Math.cos(aa) * rr, Math.sin(aa) * rr); c.rotate(aa); c.fillStyle = "rgba(255,255,255,.75)"; c.beginPath(); c.ellipse(0, 0, R * .045, R * .022, 0, 0, 6.283); c.fill(); c.restore(); } }
        c.restore();
        s.src.forEach(([sx, sy], i) => {
          for (let k = 0; k < 4; k++) {
            const p = ((t * .22 + k / 4 + i * .31) % 1), rr = p * w * .45;
            c.strokeStyle = `rgba(70,120,90,${(1 - p) * .28})`; c.lineWidth = 1.2; c.beginPath(); c.ellipse(sx * w, sy * h, rr, rr * .92, 0, 0, 6.283); c.stroke();
          }
        });
      }
    },
    ginger: {
      init(r) { return { parts: Array.from({ length: 70 }, () => ({ x: r(), y: r(), v: .02 + r() * .05, s: 1 + r() * 2.5 })) }; },
      draw(c, w, h, t, s) {
        const seam = x => .5 + .08 * Math.sin(t * .8) + (x - .5) * -.6;
        let g = c.createRadialGradient(w * .8, h * .75, 0, w * .8, h * .75, w * .9); g.addColorStop(0, "#F6B35A"); g.addColorStop(.6, "#D86E2A"); g.addColorStop(1, "#7A3514"); c.fillStyle = g; c.fillRect(0, 0, w, h);
        c.save(); c.beginPath(); c.moveTo(0, 0); c.lineTo(w, 0); c.lineTo(w, seam(1) * h - (1 - 0) * 0); for (let i = 20; i >= 0; i--) { const x = i / 20; c.lineTo(x * w, (seam(x) + .02 * Math.sin(x * 12 + t * 3)) * h); } c.closePath(); c.clip();
        g = c.createLinearGradient(0, 0, w, h * .6); g.addColorStop(0, "#EAFB7A"); g.addColorStop(1, "#8DBB1E"); c.fillStyle = g; c.fillRect(0, 0, w, h);
        c.strokeStyle = "rgba(255,255,255,.28)"; c.lineWidth = 1;
        for (let x = 0; x < 1; x += .022) { const o = Math.sin(t * 6 + x * 40) * 2; c.beginPath(); c.moveTo(x * w + o, 0); c.lineTo(x * w - o, h); c.stroke(); }
        c.restore();
        c.save(); c.shadowColor = "#fff"; c.shadowBlur = 16; c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = 2; c.beginPath();
        for (let i = 0; i <= 20; i++) { const x = i / 20, y = (seam(x) + .02 * Math.sin(x * 12 + t * 3)) * h; i ? c.lineTo(x * w, y) : c.moveTo(0, y); } c.stroke(); c.restore();
        s.parts.forEach(p => {
          p.x += p.v * .016; p.y -= p.v * .01; if (p.x > 1.05 || p.y < -.05) { p.x = -.05; p.y = Math.random() * 1.1; }
          const above = p.y < seam(p.x);
          c.fillStyle = above ? "rgba(250,255,210,.85)" : "rgba(255,214,150,.9)"; c.beginPath(); c.arc(p.x * w, p.y * h, p.s * (w / 600), 0, 6.283); c.fill();
        });
      }
    },
    grapefruit: {
      init() { return {}; },
      draw(c, w, h, t) {
        let g = c.createRadialGradient(w * .5, h * .45, 0, w * .5, h * .5, w * .75); g.addColorStop(0, "#FFF4F0"); g.addColorStop(1, "#F2B7A8"); c.fillStyle = g; c.fillRect(0, 0, w, h);
        const cx = w * .5, cy = h * .5, R = w * .36;
        c.save(); c.translate(cx, cy); c.rotate(t * .05);
        for (let i = 0; i < 11; i++) {
          const a0 = i / 11 * 6.283, a1 = (i + 1) / 11 * 6.283;
          c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R, a0 + .03, a1 - .03); c.closePath();
          g = c.createRadialGradient(0, 0, R * .1, 0, 0, R); g.addColorStop(0, "rgba(255,200,185,.3)"); g.addColorStop(1, "rgba(232,100,80,.42)"); c.fillStyle = g; c.fill();
          c.strokeStyle = "rgba(255,255,255,.85)"; c.lineWidth = 3; c.stroke();
        }
        c.restore();
        c.save(); c.translate(cx, cy); c.rotate(-t * .08);
        for (let i = 0; i < 5; i++) { c.save(); c.rotate(i / 5 * 6.283); c.beginPath(); c.ellipse(R * .42, 0, R * .5, R * .22, 0, 0, 6.283); c.fillStyle = "rgba(255,255,255,.16)"; c.fill(); c.strokeStyle = "rgba(190,80,95,.22)"; c.lineWidth = 1; c.stroke(); c.restore(); }
        c.restore();
        c.save(); c.translate(cx, cy); c.rotate(t * .2); c.shadowColor = "#8FD1BE"; c.shadowBlur = 24; c.strokeStyle = "rgba(143,209,190,.85)"; c.lineWidth = w * .016; c.lineCap = "round";
        c.beginPath(); c.arc(0, 0, R * 1.14, 0, 1.9); c.stroke(); c.beginPath(); c.arc(0, 0, R * 1.14, 3.2, 4.1); c.stroke(); c.restore();
      }
    },
    pear: {
      init(r) { return { pods: Array.from({ length: 16 }, () => ({ x: .15 + r() * .7, y: r(), v: .01 + r() * .02, a: r() * 6, s: .6 + r() * .6 })) }; },
      draw(c, w, h, t, s) {
        let g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#F7F4E6"); g.addColorStop(1, "#D2C99A"); c.fillStyle = g; c.fillRect(0, 0, w, h);
        g = c.createRadialGradient(w * .3, h * .25, 0, w * .3, h * .25, w * .6); g.addColorStop(0, "rgba(255,244,200,.8)"); g.addColorStop(1, "rgba(255,244,200,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h);
        const cx = w * .5, cy = h * .56, br = 1 + .012 * Math.sin(t * .9);
        for (let k = 14; k >= 1; k--) {
          const sc = k / 14 * br, R = w * .26 * sc;
          c.beginPath();
          for (let a = 0; a <= 6.3; a += .08) {
            const bulge = 1 - .42 * Math.max(0, -Math.sin(a)) * (1 - Math.abs(Math.cos(a)) * .2);
            const x = Math.cos(a) * R * bulge, y = Math.sin(a) * R * (Math.sin(a) < 0 ? 1.45 : 1);
            a ? c.lineTo(cx + x, cy + y) : c.moveTo(cx + x, cy + y);
          }
          c.closePath(); c.strokeStyle = `rgba(107,90,62,${.12 + (14 - k) * .012})`; c.lineWidth = 1; c.stroke();
          if (k === 14) { c.fillStyle = "rgba(214,222,160,.28)"; c.fill(); }
        }
        c.strokeStyle = "rgba(107,90,62,.5)"; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy - w * .26 * 1.45); c.quadraticCurveTo(cx + w * .02, cy - w * .44, cx + w * .06, cy - w * .47); c.stroke();
        s.pods.forEach(p => {
          p.y -= p.v * .016; if (p.y < -.05) p.y = 1.05;
          const x = (p.x + Math.sin(t * .6 + p.a) * .015) * w, y = p.y * h;
          c.save(); c.translate(x, y); c.rotate(p.a + t * .2);
          c.fillStyle = "rgba(128,146,84,.55)"; c.beginPath(); c.ellipse(0, 0, w * .018 * p.s, w * .009 * p.s, 0, 0, 6.283); c.fill();
          c.strokeStyle = "rgba(90,100,60,.4)"; c.beginPath(); c.moveTo(-w * .016 * p.s, 0); c.lineTo(w * .016 * p.s, 0); c.stroke(); c.restore();
        });
      }
    },
    chamomile: {
      init(r) { return { dust: Array.from({ length: 90 }, () => ({ x: r(), y: r(), v: .003 + r() * .01, s: .5 + r() * 1.6, p: r() * 6 })) }; },
      draw(c, w, h, t, s) {
        let g = c.createRadialGradient(w * .5, h * .4, 0, w * .5, h * .45, w * .8); g.addColorStop(0, "#3E4476"); g.addColorStop(.5, "#1A2044"); g.addColorStop(1, "#0B0F25"); c.fillStyle = g; c.fillRect(0, 0, w, h);
        const br = .5 + .5 * Math.sin(t * .6);
        const mr = w * (.11 + br * .012);
        g = c.createRadialGradient(w * .5, h * .4, 0, w * .5, h * .4, mr * 4.5); g.addColorStop(0, "rgba(241,227,184,.55)"); g.addColorStop(.3, "rgba(241,227,184,.14)"); g.addColorStop(1, "rgba(241,227,184,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h);
        g = c.createRadialGradient(w * .47, h * .37, 0, w * .5, h * .4, mr); g.addColorStop(0, "#FFF8E6"); g.addColorStop(1, "#EAD7A4"); c.fillStyle = g; c.beginPath(); c.arc(w * .5, h * .4, mr, 0, 6.283); c.fill();
        for (let k = 1; k <= 3; k++) { c.strokeStyle = `rgba(241,227,184,${.1 / k})`; c.lineWidth = 1; c.beginPath(); c.arc(w * .5, h * .4, mr * (1.6 + k * .7 + br * .1), 0, 6.283); c.stroke(); }
        g = c.createLinearGradient(0, h * .68, 0, h); g.addColorStop(0, "rgba(185,183,224,0)"); g.addColorStop(1, "rgba(185,183,224,.22)"); c.fillStyle = g; c.fillRect(0, h * .6, w, h * .4);
        s.dust.forEach(d => { d.y -= d.v * .016; if (d.y < 0) d.y = 1; const a = .25 + .35 * Math.sin(t + d.p); c.fillStyle = `rgba(245,232,196,${a})`; c.beginPath(); c.arc((d.x + Math.sin(t * .2 + d.p) * .01) * w, d.y * h, d.s * (w / 700), 0, 6.283); c.fill(); });
      }
    }
  };



  const TB = { hex, rgba, rng, PLATS, CONCEPTS, CONTROL, STATUS, REGIONS, HOME, GRID, SPECTRUM, AXES, BASE, SHAPES, MOMENTS, WILD, DIMS, ACTIONS, bottle, setBottle, conceptBottleOpts, splitName, logoSymbol, ART };
  if (typeof module === "object" && module.exports) module.exports = TB;
  else root.TBCore = TB;
})(typeof self !== "undefined" ? self : this);
