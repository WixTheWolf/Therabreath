/* The Future of Freshness: every word, number and colour in the experience lives here,
   so the story can be edited without touching the engine. */
window.FF = (() => {
  const SESSION = {
    title: "The Future of Freshness",
    sub: "A TheraBreath Flavor Playbook",
    date: "November 9, 2026",
    place: "Church & Dwight · Darwin room",
    time: "10:00 AM to 12:00 PM ET"
  };

  const CHAPTERS = {
    1: { n: "01", title: "The Signals", q: "What's changing?" },
    2: { n: "02", title: "The Territories", q: "What could freshness become?" },
    3: { n: "03", title: "The Moments", q: "Where can flavor create growth?" },
    4: { n: "04", title: "The Playbook", q: "What do we do with all of this?" }
  };

  const AGENDA = [
    { t: "10:00", l: "Freshness is evolving", s: "The idea" },
    { t: "10:10", l: "01 · The Signals", s: "What's changing?" },
    { t: "10:30", l: "02 · The Territories", s: "Explore and taste six directions" },
    { t: "11:00", l: "Your turn", s: "The room decides" },
    { t: "11:15", l: "03 · The Moments", s: "Where flavor creates growth" },
    { t: "11:35", l: "04 · The Playbook", s: "What we do next" },
    { t: "11:55", l: "Built together", s: "" }
  ];

  const RHYTHM = ["Teach", "Show", "Taste", "Discuss", "Decide"];

  /* The widening vocabulary of freshness (prologue). x/y are positions on the stage. */
  const VOCAB = [
    { w: "Brightness", d: "The lift of citrus and aromatic top notes: the first wake-up signal.", x: 560, y: 330, s: 50 },
    { w: "Cooling", d: "Not a taste but a trigeminal sensation: menthol and cooling agents act on the mouth's cold receptors.", x: 1010, y: 300, s: 66 },
    { w: "Green freshness", d: "Leafy, watery notes (cucumber, tea, crushed herbs) that read as natural clean.", x: 1420, y: 350, s: 42 },
    { w: "Citrus lift", d: "The sparkle of peel oils: familiarity with more character.", x: 330, y: 470, s: 38 },
    { w: "Botanical aromatics", d: "Herbs, teas and spices that signal care and craft rather than medicine.", x: 1540, y: 500, s: 36 },
    { w: "Soft freshness", d: "Freshness without the burn: rounded, calming, lower intensity.", x: 420, y: 640, s: 46 },
    { w: "Warming contrast", d: "A touch of ginger or spice warmth makes the cool that follows feel colder.", x: 1500, y: 660, s: 44 },
    { w: "Floral freshness", d: "Restrained florals that bring beauty and polish, as long as they still read as clean.", x: 640, y: 800, s: 36 },
    { w: "Juiciness", d: "Fruit notes that make the mouth water, so it feels refreshed.", x: 1210, y: 810, s: 40 },
    { w: "Clean bitterness", d: "The dry, tonic edge of grapefruit peel or green tea. Bitter can mean clean.", x: 930, y: 890, s: 32 },
    { w: "Tingle", d: "A buzzing trigeminal sensation that people read as 'it's working'.", x: 250, y: 780, s: 54 },
    { w: "Duration", d: "How long freshness lasts. The finish is part of the product.", x: 1700, y: 810, s: 38 },
    { w: "Mouthfeel", d: "Body, smoothness, dryness: how clean actually feels.", x: 1640, y: 250, s: 32 },
    { w: "Ritual", d: "Freshness as a moment people repeat and look forward to.", x: 290, y: 280, s: 40 },
    { w: "Mood", d: "Flavor sets a state: awake, calm, confident.", x: 760, y: 220, s: 34 },
    { w: "Occasion", d: "The same person wants a different freshness at 7 AM and at 10 PM.", x: 1250, y: 190, s: 42 }
  ];

  const SCIENCE = ["Volatile aromatics", "Sensory perception", "Cooling", "Trigeminal sensations", "Taste masking", "Solubility", "Stability", "Oral-care systems"];
  const IMAGINATION = ["Culture", "Emotion", "Consumer expectation", "Food & beverage trends", "Hospitality", "Beauty", "Wellness", "Travel", "Ritual"];

  /* Chapter one */
  const SHIFTS = [
    { a: "Hygiene", b: "Wellness", d: "Oral care moves from a chore that prevents problems to a routine that makes people feel good." },
    { a: "Generic mint", b: "Composed flavor experiences", d: "Mint becomes one ingredient in a designed flavor, not the whole idea." },
    { a: "Maximum burn", b: "Personalized intensity", d: "Stronger stops being the only proof that it's working." },
    { a: "Functional rinse", b: "Enjoyable ritual", d: "When people enjoy a routine, they keep it: more often, and for longer." },
    { a: "Domestic flavor vocabulary", b: "Globally influenced flavor culture", d: "Consumers know yuzu, matcha and cardamom from menus, not textbooks." },
    { a: "Single sensory cue", b: "Multidimensional sensory experience", d: "Cooling, brightness, tingle and finish can be designed together, and over time." }
  ];

  const SIGNALS = [
    {
      id: "citrus", name: "Global citrus exploration",
      signal: "Yuzu, calamansi and bergamot are moving from specialist menus into mainstream drinks, desserts and fragrance.",
      need: "People want adventure they can recognize.",
      impl: "Citrus reads as fresh straight away, but with more character than lemon.",
      opp: "Yuzu, Calamansi, Bergamot and other premium citrus directions.",
      seen: "Sparkling waters, cocktail menus, pastry, fine fragrance.", terr: "yuzu"
    },
    {
      id: "botanical", name: "Botanical wellness",
      signal: "Tea, cucumber, eucalyptus and herbs have become the language of wellness, from skincare to functional drinks.",
      need: "People link botanicals with rituals that feel good for them.",
      impl: "Oral care can feel less medicinal without losing credibility.",
      opp: "Tea, cucumber, eucalyptus, herbs and gentle florals.",
      seen: "Skincare, spa culture, functional beverages, wellness teas.", terr: "cucumber"
    },
    {
      id: "intensity", name: "Sensory personalization",
      signal: "Gentle and zero-burn claims sit on the same shelf as extreme-cooling formats.",
      need: "People differ enormously in how intense they want freshness to be.",
      impl: "Freshness could become adjustable, at least as a concept.",
      opp: "Soft, bright, cold and intense sensory architectures.",
      seen: "Mild variants, sensitive ranges, max-cooling gum and mints.", terr: "ginger"
    },
    {
      id: "ritual", name: "Ritualization",
      signal: "Personal care is being organized into morning, recovery, beauty and night-time rituals.",
      need: "People want each routine to match the moment they're in.",
      impl: "Flavor can signal the moment.",
      opp: "AM activation, midday reset, social confidence, post-meal cleanse, evening wind-down.",
      seen: "AM/PM skincare systems, sleep and recovery products, TheraBreath's own Overnight Chamomile Mint.", terr: "night"
    },
    {
      id: "discovery", name: "Global discovery",
      signal: "Restaurants, travel and social media are making sophisticated flavors familiar faster than ever.",
      need: "People are ready for flavors they would once have called unusual.",
      impl: "Oral care has permission to expand, carefully.",
      opp: "Japanese citrus, tea culture, Mediterranean botanicals, spice aromatics and other credible territories.",
      seen: "Food and beverage go first; personal care follows.", terr: "pear"
    }
  ];

  /* The atlas. Adoption stages are The Flavor Factory's read, not measured data. */
  const STAGES = ["Origin cuisine", "Specialist menus", "Café & cocktail culture", "Mainstream food & drink", "Personal care"];
  const REGIONS = [
    {
      id: "japan", name: "Japan", at: "japan", col: "#C9A400",
      ing: [["Yuzu", 4], ["Sudachi", 2], ["Matcha", 5], ["Shiso", 2]],
      sensory: "Aromatic, high-lift citrus. Grassy, gently savory tea. Cool, herbal shiso.",
      why: "Japanese food is one of the most familiar 'foreign' cuisines in the US. Yuzu reads as citrus first and new second: adventure with a safety net.",
      where: "Sparkling waters, craft cocktails, pastry, specialty coffee, J-beauty skincare and fine fragrance.",
      oral: "Arctic Yuzu · Sudachi Fresh · Green Tea Yuzu", terr: "yuzu"
    },
    {
      id: "asia", name: "East & Southeast Asia", at: "asia", col: "#4F8A5B",
      ing: [["Jasmine tea", 4], ["Calamansi", 2], ["Pandan", 2]],
      sensory: "Floral tea, sharp sweet-tart citrus and a soft, green warmth.",
      why: "Bubble tea and Southeast Asian restaurants have made tea-led, floral-green flavors everyday for younger consumers.",
      where: "Bubble and fruit teas, bakeries and desserts, cocktail menus, ready-to-drink teas.",
      oral: "Calamansi Mint · Jasmine Cucumber Mint · soft green freshness", terr: "cucumber"
    },
    {
      id: "med", name: "Mediterranean", at: "med", col: "#C0715F",
      ing: [["Bergamot", 5], ["Blood orange", 4], ["Basil", 4], ["Orange blossom", 3]],
      sensory: "Sunlit, aromatic citrus, green herbs and restrained florals.",
      why: "Earl Grey, spritz culture and the Mediterranean diet made these notes feel natural and good for you. Bergamot is the backbone of classic cologne.",
      where: "Aperitivo and spritz menus, botanical gin, fine fragrance, herb-led cooking.",
      oral: "Bergamot Mint · Grapefruit Rose Mint · herbal freshness", terr: "grapefruit"
    },
    {
      id: "mideast", name: "Middle East", at: "mideast", col: "#8A6FB0",
      ing: [["Rose", 5], ["Cardamom", 3], ["Mint tea", 4], ["Saffron", 2]],
      sensory: "Aromatic warmth, soft florals and cooling mint tea.",
      why: "Cardamom has moved from the spice rack to the coffee bar, and rose has long been a beauty ingredient. Mint tea gives both a familiar, fresh bridge.",
      where: "Café menus (cardamom buns, rose lattes), pastry, fragrance, wellness teas.",
      oral: "Pear Cardamom Mint · Grapefruit Rose Mint", terr: "pear"
    },
    {
      id: "latam", name: "Latin America", at: "latam", col: "#6E9B2E",
      ing: [["Lime", 5], ["Passion fruit", 4], ["Hibiscus", 3], ["Chili-lime", 4]],
      sensory: "Bright, juicy and tart, with botanical notes and hot-meets-fresh contrast.",
      why: "Aguas frescas and chili-lime snacks taught US consumers to love bright acidity and the contrast of heat with freshness.",
      where: "Aguas frescas, sparkling waters, cocktails, snacks and candy.",
      oral: "Ginger Lime · Lime Mint · hibiscus freshness", terr: "ginger"
    },
    {
      id: "cafe", name: "Western café culture", at: "nyc", also: "london", col: "#1B75BB", hub: true,
      ing: [["Matcha latte", 5], ["Cardamom bun", 3], ["Lavender latte", 3], ["Yuzu tonic", 3]],
      sensory: "Layered, composed and seasonal.",
      why: "Cafés are where global ingredients get translated for mainstream palates, one layered drink at a time.",
      where: "Specialty coffee, ready-to-drink beverages, bakery menus, social feeds.",
      oral: "The lesson for oral care: people now expect composed flavors, not single notes.", terr: null
    }
  ];

  /* Chapter two: the territories. dims = position in the Freshness Universe (-1..1 per axis).
     prof = conceptual compass profile at first impression, mid-palate and finish (0-5). */
  const AXES = [
    ["bright", "Bright", "Deep"], ["temp", "Cool", "Warm"], ["novel", "Familiar", "Discovery"],
    ["tex", "Crisp", "Soft"], ["exp", "Clinical", "Experiential"], ["time", "Immediate", "Lingering"]
  ];
  const COMPASS = ["Cooling", "Brightness", "Greenness", "Aromatic intensity", "Sweetness", "Warmth", "Tingling", "Softness", "Finish length"];

  const TERR = {
    yuzu: {
      n: 1, terr: "Bright Global Freshness", name: "Arctic Yuzu", img: "yuzu",
      paper: "#EEF4F7", ink: "#0E2A3D", acc: "#E2BD00", accInk: "#7C6300", soft: "#F6EDA6", dark: false,
      emotion: ["Awake", "Sharp", "Modern", "Energetic"],
      character: ["Japanese citrus brightness", "Lemon, mandarin and grapefruit associations", "High aromatic lift", "A clean impression of acidity", "A cold, crystalline finish"],
      moments: ["Morning activation", "Pre-social confidence", "Midday reset"],
      members: ["Calamansi Mint", "Bergamot Mint", "Sudachi Fresh", "Mandarin Green Mint"],
      bench: "Yuzu's lift comes from trace aroma compounds that oxidize quickly. In a sodium chlorite system we hold the brightness with oxidation-tolerant citrus materials and let the cooling carry the finish.",
      identity: ["Bright", "Crystalline", "Electric"],
      arc: ["Citrus flash", "Aromatic yuzu", "Cold clean freshness"], curve: [.95, .62, .84],
      q: "Does this feel like a flavor, or a new kind of freshness?", opts: ["A flavor", "A new kind of freshness"],
      liq: ["#F2F8FA", "#EEDD78"], band: "#F2D335", bandInk: "#1D2A33",
      dims: [-.9, -.72, -.02, -.8, 0, -.55], horizon: "now", innov: .16,
      prof: [[3, 5, 1, 4.5, 1.5, 0, 1, 1, 3], [3.8, 4.5, 1.5, 4.5, 1.5, .2, 1, 1, 3.5], [4.6, 3.2, 1, 3, 1, 0, 1, 1, 4.5]]
    },
    cucumber: {
      n: 2, terr: "Garden Clean", name: "Green Tea Cucumber", img: "cucumber",
      paper: "#EDF3EA", ink: "#1F3B2C", acc: "#6FA374", accInk: "#3E7148", soft: "#D3E6CD", dark: false,
      emotion: ["Clean", "Calm", "Balanced", "Modern"],
      character: ["Watery cucumber", "Clean green tea", "Subtle herbal freshness", "Low sweetness", "A smooth, cooling finish"],
      moments: ["Midday reset", "After coffee", "Everyday calm"],
      evokes: ["Spa", "Wellness", "Hydration", "Garden freshness", "Modern skincare"],
      members: ["White Tea Cucumber", "Jasmine Cucumber Mint", "Green Tea Yuzu", "Aloe Cucumber Fresh"],
      bench: "Cucumber's signature watery note is a delicate aldehyde, and an oxygen system attacks it first. We rebuild the watery-green impression from sturdier materials so it tastes the same in month twelve as on day one.",
      identity: ["Watery", "Green", "Calm"],
      arc: ["Cool cucumber water", "Clean green tea", "Smooth, soft cooling"], curve: [.42, .66, .54],
      q: "Does calm read as clean, or as weak?", opts: ["Clean", "Weak", "Depends on the moment"],
      liq: ["#EEF6EA", "#A7CEA1"], band: "#4F8A5B", bandInk: "#fff",
      dims: [-.25, -.32, -.5, .45, .1, .05], horizon: "now", innov: .26,
      prof: [[2.5, 2.5, 4.5, 2.5, 1, 0, .5, 4, 2.5], [3, 2, 4.5, 2.5, 1, 0, .5, 4.5, 3], [3.3, 1.5, 3.5, 2, .8, 0, .5, 4.5, 3.6]]
    },
    ginger: {
      n: 3, terr: "Thermal Freshness", name: "Ginger Lime", img: "gingerlime",
      paper: "#121417", ink: "#F3F0E8", acc: "#A6CE39", accInk: "#B9DB5C", soft: "#2A2F24", dark: true,
      warm: "#E9A23B", cool: "#62CCE0",
      emotion: ["Alive", "Energized", "Dynamic"],
      character: ["Fresh ginger warmth", "A bright lime flash", "A cool, clean finish", "A gentle tingle", "A long, evolving finish"],
      moments: ["Afternoon energy", "Post-meal cleanse", "Before walking into a room"],
      members: ["Warming/cooling contrast", "Tingling freshness", "Staged sensory release", "Long-lasting finish"],
      bench: "Ginger's warmth works on the same receptors as heat; menthol and cooling agents work on the cold ones. Staging them is formulation, not just flavor: we tune the release so the warmth arrives first and the cold finish lasts.",
      identity: ["Warm", "Bright", "Cold"],
      arc: ["Ginger warmth", "Lime flash", "Cool clean finish"], curve: [.5, .96, .74],
      q: "When did it feel freshest: the warmth, the flash or the finish?", opts: ["The warmth", "The flash", "The finish"],
      liq: ["#F6EFCB", "#B5D267"], band: "#5E8F1E", bandInk: "#fff",
      dims: [-.45, .35, .2, -.3, .55, .65], horizon: "now", innov: .4,
      prof: [[1, 3.5, 1.5, 3.5, 1.5, 4.6, 3, 1, 2], [2.5, 5, 2, 4, 1.5, 2.5, 3.5, 1, 3], [4.6, 2.5, 1.5, 2.5, 1, .8, 2, 1.5, 4.6]]
    },
    grapefruit: {
      n: 4, terr: "Botanical Luxury", name: "Grapefruit Rose Mint", img: "grapefruit",
      paper: "#F4EFEA", ink: "#3D2A27", acc: "#D98B7E", accInk: "#A0544A", soft: "#F1D8D0", dark: false,
      emotion: ["Polished", "Composed", "Elevated", "Clean"],
      character: ["Dry pink grapefruit", "Restrained rose", "A clean mint backbone", "Low sweetness", "A polished, dry finish"],
      moments: ["Morning beauty routine", "Before dinner", "Self-care evenings"],
      evokes: ["High-end botanical skincare", "Boutique hotel", "Modern apothecary", "Premium wellness"],
      members: ["Orange Blossom Mint", "Jasmine Tea Mint", "Rose Cucumber"],
      bench: "Grapefruit's dry, bittersweet character leans on nootkatone, which holds up far better to oxidation than citrus aldehydes. Rose is dosed as an accent, not a theme: enough to lift, never enough to perfume.",
      identity: ["Dry", "Botanical", "Polished"],
      arc: ["Dry pink grapefruit", "A whisper of rose", "Clean mint backbone"], curve: [.78, .48, .66],
      q: "Did the rose read as beauty, or as perfume?", opts: ["Beauty", "Perfume", "I couldn't find it"],
      liq: ["#FBEAE6", "#EDB0A4"], band: "#B3645A", bandInk: "#fff",
      dims: [-.35, -.15, .45, .25, .8, .35], horizon: "next", innov: .62,
      prof: [[2, 4, 1.5, 4, 1.5, .5, 1, 3, 3], [2.5, 3, 1.5, 4.5, 1.5, .5, 1, 3.5, 3.5], [3.6, 2, 1.5, 3, 1, .3, .8, 3, 4]]
    },
    pear: {
      n: 5, terr: "Aromatic Discovery", name: "Pear Cardamom Mint", img: "pear",
      paper: "#ECEFE4", ink: "#2F3A27", acc: "#9DB06A", accInk: "#5A6D3C", soft: "#DAE2C4", dark: false,
      emotion: ["Curious", "Sophisticated", "Warm", "Unexpected"],
      character: ["Crisp pear", "Green cardamom", "Light aromatic warmth", "A clean mint finish", "Quietly exploratory"],
      moments: ["Post-meal cleanse", "Seasonal edition", "Discovery drop"],
      members: ["Fig Cardamom", "Quince Mint", "Pear Ginger Fresh"],
      bench: "Cardamom's backbone is 1,8-cineole, the same molecule as eucalyptol, so it is naturally at home in oral care. Pear esters are chosen and balanced for the rinse base so the fruit doesn't fade on the shelf.",
      identity: ["Crisp", "Aromatic", "Curious"],
      arc: ["Crisp pear", "Green cardamom warmth", "Clean mint"], curve: [.52, .84, .6],
      q: "Is this next year, or five years out?", opts: ["Next year", "Five years out", "A limited edition now"],
      liq: ["#F1F3DE", "#C3CF88"], band: "#6E8446", bandInk: "#fff",
      dims: [.25, .4, .85, .2, .6, .45], horizon: "future", innov: .9,
      prof: [[2, 3, 3, 3, 2.5, 1.5, .5, 3, 3], [2, 2.5, 2.5, 4.5, 2, 2.5, .5, 3, 3.5], [3.6, 1.5, 2, 3, 1.5, 1.5, .5, 3, 4]]
    },
    night: {
      n: 6, terr: "Soft Freshness · Night Ritual", name: "Chamomile Vanilla Mint", img: "night",
      paper: "#ECEAF4", ink: "#26264A", acc: "#8C86C9", accInk: "#57518F", soft: "#DAD6EE", dark: false, warm: "#E6CFA0",
      emotion: ["Calm", "Soft", "Restorative", "Comforting"],
      character: ["Soft mint", "Honeyed chamomile", "Gentle vanilla warmth", "Low burn", "A comfortable, lingering finish"],
      moments: ["Evening wind-down", "Night restore", "After a long day"],
      members: ["Lavender Oat Mint", "Honey Chamomile", "Vanilla Rooibos Mint"],
      bench: "Soft freshness is harder than strong freshness: with less cooling to hide behind, every note has to be clean. Vanilla character is screened for color and clarity through accelerated stability, because an oxygen system can darken the obvious choices.",
      identity: ["Soft", "Calm", "Restorative"],
      arc: ["Soft mint", "Honeyed chamomile", "Gentle vanilla warmth"], curve: [.34, .52, .62],
      q: "Could a rinse become part of how you wind down?", opts: ["Yes", "Maybe", "No"],
      liq: ["#F3EFE8", "#CDC4E7"], band: "#57518F", bandInk: "#fff",
      dims: [.7, .55, -.2, .9, .45, .8], horizon: "next", innov: .5,
      prof: [[1.5, 1.5, 1.5, 2.5, 3, 2, 0, 4.5, 3], [1.5, 1, 1.5, 3, 3, 2.5, 0, 5, 3.5], [2.6, 1, 1, 2, 2.5, 1.5, 0, 4.5, 4]]
    }
  };
  const ORDER = ["yuzu", "cucumber", "ginger", "grapefruit", "pear", "night"];

  /* Reference points in the universe and on the compass. */
  const CORE = {
    name: "Today's core mint", dims: [-.15, -.95, -.95, -.7, -.85, -.35],
    prof: [[4, 2, 1, 3, 2, 0, 2, 1, 3.5], [4.5, 1.5, 1, 3, 2, 0, 2, 1, 3.5], [4.5, 1, 1, 2, 1.5, 0, 1.5, 1, 4]]
  };
  const TODAY = [
    { name: "Green tea", note: "already in TheraBreath's vocabulary", dims: [-.1, -.52, -.84, .05, -.35, 0] },
    { name: "Overnight Chamomile Mint", note: "TheraBreath today", dims: [.5, .15, -.62, .7, -.15, .5] }
  ];

  /* The flavor clock (night ritual insight) */
  const DAYPARTS = [
    { h: 6, l: "Wake", need: "Bright, cold, energizing", c: "Arctic Yuzu", terr: "yuzu" },
    { h: 10, l: "Confidence", need: "Crisp, clean, assured", c: "Grapefruit Rose Mint", terr: "grapefruit" },
    { h: 14, l: "Reset", need: "Fast, cleansing, restoring", c: "Green Tea Cucumber", terr: "cucumber" },
    { h: 18, l: "Post Meal", need: "Cleansing, aromatic, bright", c: "Ginger Lime", terr: "ginger" },
    { h: 22, l: "Restore", need: "Soft, calming, low-burn", c: "Chamomile Vanilla Mint", terr: "night" }
  ];

  /* Your turn: the five tensions the room votes on */
  const SPECTRA = [
    { id: "adv", l: "More familiar", r: "More adventurous", wl: "familiar", wr: "adventurous" },
    { id: "cool", l: "Cooling", r: "Soft", wl: "cooling", wr: "soft" },
    { id: "bot", l: "Classic freshness", r: "Botanical freshness", wl: "classically fresh", wr: "botanical" },
    { id: "exp", l: "Functional", r: "Experiential", wl: "functional", wr: "experiential" },
    { id: "occ", l: "Everyday", r: "Occasion-based", wl: "everyday", wr: "built for occasions" }
  ];

  /* Chapter three */
  const MOMENTS = [
    {
      id: "wake", l: "Wake", at: 6.5, when: ["The first minute of the day", "Before coffee", "Getting ready"],
      lang: ["Bright", "Cold", "Energizing", "Clean"], terr: ["yuzu"],
      why: "Freshness as activation: a flavor that switches the day on.", flag: ""
    },
    {
      id: "reset", l: "Reset", at: 13, span: [10, 16], when: ["Between meetings", "After coffee", "After lunch", "Before walking back into a room"],
      lang: ["Crisp", "Cleansing", "Fast", "Confidence-restoring"], terr: ["cucumber", "ginger"],
      why: "A moment oral care barely owns today, and it happens several times a day.", flag: "Potentially a very important new oral-care occasion"
    },
    {
      id: "connect", l: "Connect", at: 19, when: ["Dating", "Socializing", "Work presentations", "Travel", "Dinner"],
      lang: ["Confident", "Close-up fresh", "Premium", "Reassuring"], terr: ["grapefruit", "yuzu"],
      why: "The outcome is fresh-breath confidence. Flavor can make it feel more premium and more emotionally relevant.", flag: "Extremely consistent with TheraBreath's core equity"
    },
    {
      id: "restore", l: "Restore", at: 22.5, when: ["Night", "Winding down", "After a long day"],
      lang: ["Soft", "Calming", "Low-burn", "Botanical", "Comfortable"], terr: ["night"],
      why: "Connects with TheraBreath's existing AM/PM work and shows how the platform could grow.", flag: ""
    },
    {
      id: "escape", l: "Escape", at: null, when: ["Limited editions", "Seasonal drops", "Flavor discovery", "Global flavor drops"],
      lang: ["Adventurous", "Collectible", "Seasonal", "Surprising"], terr: ["pear"],
      why: "Where more adventurous concepts can live without forcing the core franchise to become experimental.", flag: "The experiential occasion"
    }
  ];

  const STAMPS = [
    { n: "Sudachi", o: "Tokushima, Japan", s: "Winter", c: "#9A7B00", r: -8, x: 34, y: 46, shape: "round" },
    { n: "Calamansi", o: "Philippines", s: "Summer", c: "#3E7148", r: 6, x: 226, y: 96, shape: "rect" },
    { n: "Bergamot", o: "Calabria, Italy", s: "Spring", c: "#A0544A", r: -4, x: 40, y: 290, shape: "rect" },
    { n: "Cardamom", o: "Kerala, India", s: "Fall", c: "#5A6D3C", r: 9, x: 238, y: 318, shape: "round" },
    { n: "Hibiscus", o: "Oaxaca, Mexico", s: "Summer", c: "#8E3B5B", r: -10, x: 44, y: 500, shape: "round" },
    { n: "Pandan", o: "Malaysia", s: "Spring", c: "#2F6B4F", r: 5, x: 232, y: 540, shape: "rect" }
  ];
  const DROPS = [
    { s: "Winter", f: "Sudachi Fresh" }, { s: "Spring", f: "Jasmine Cucumber Mint" },
    { s: "Summer", f: "Calamansi Mint" }, { s: "Fall", f: "Pear Cardamom Mint" }
  ];

  /* Chapter four */
  const FORMULA = [
    ["Cultural signal", "What people are starting to love, and why."],
    ["Flavor territory", "A space with room for a platform, not a one-off."],
    ["Sensory target", "How it should feel: first impression, mid-palate, finish."],
    ["Flavor development", "Building the flavor at the bench, note by note."],
    ["Base compatibility", "Surviving the rinse: sodium chlorite, solubility, clarity, pH."],
    ["Bench evaluation", "Tasting in the real product base, never just in water."],
    ["Stability", "Oxidation, flavor degradation and color over shelf life."],
    ["Consumer experience", "Does it deliver the freshness people were promised?"],
    ["Scale", "The same flavor in batch one and batch one thousand."]
  ];
  const TECH = ["Sodium chlorite systems", "Solubility", "Oxidation", "Flavor degradation", "Clarity", "pH interaction", "Cooling systems", "Long-term organoleptic stability"];

  const HORIZONS = [
    { id: "now", l: "Now", s: "Accessible innovation", d: "Recognizable freshness with meaningful differentiation." },
    { id: "next", l: "Next", s: "More differentiated experiences", d: "Botanical luxury, floral freshness, sensory contrast, more sophisticated global combinations." },
    { id: "future", l: "Future", s: "Platform innovation", d: "Systems of freshness rather than single flavors." }
  ];
  const ITEMS = [
    { id: "yuzu", l: "Arctic Yuzu", k: "concept", h: "now", terr: "yuzu" },
    { id: "cucumber", l: "Green Tea Cucumber", k: "concept", h: "now", terr: "cucumber" },
    { id: "ginger", l: "Ginger Lime", k: "concept", h: "now", terr: "ginger" },
    { id: "grapefruit", l: "Grapefruit Rose Mint", k: "concept", h: "next", terr: "grapefruit" },
    { id: "night", l: "Chamomile Vanilla Mint", k: "concept", h: "next", terr: "night" },
    { id: "floral", l: "Floral freshness", k: "platform", h: "next" },
    { id: "contrast", l: "Sensory contrast", k: "platform", h: "next" },
    { id: "global", l: "Global combinations: Green Tea Yuzu, Calamansi Mint", s: "Global flavor combinations", k: "platform", h: "next" },
    { id: "pear", l: "Pear Cardamom Mint", k: "concept", h: "future", terr: "pear" },
    { id: "intensity", l: "Freshness intensity architecture", s: "Intensity architecture", k: "platform", h: "future" },
    { id: "thermal", l: "Sensory-engineered cooling and warming", s: "Engineered cooling & warming", k: "platform", h: "future" },
    { id: "daypart", l: "Daypart flavor systems", k: "platform", h: "future" },
    { id: "occasion", l: "Occasion-specific freshness", k: "platform", h: "future" },
    { id: "discovery", l: "Global discovery program", s: "Global discovery program", k: "platform", h: "future" },
    { id: "drops", l: "Limited-edition flavor drops", s: "Limited-edition drops", k: "platform", h: "future" },
    { id: "format", l: "Cross-format flavor systems: rinse, toothpaste, portable", s: "Cross-format flavor systems", k: "platform", h: "future" }
  ];

  const ACTIONS = [
    { id: "bench", l: "Bench the priority concepts in the current rinse base", o: "The Flavor Factory" },
    { id: "stab", l: "Accelerated stability, clarity and color screen in the oxygen system", o: "The Flavor Factory" },
    { id: "panel", l: "Descriptive sensory profiles and an intensity ladder, soft to intense", o: "Joint" },
    { id: "screen", l: "Consumer concept screen for the priority occasions", o: "TheraBreath" },
    { id: "daypart", l: "Explore a daypart system: Wake, Reset, Restore", o: "Joint" },
    { id: "format", l: "Feasibility across formats: rinse, toothpaste, portable", o: "Joint" },
    { id: "cadence", l: "A joint innovation cadence, so flavor joins at the brief rather than the end", o: "Joint" }
  ];

  return { SESSION, CHAPTERS, AGENDA, RHYTHM, VOCAB, SCIENCE, IMAGINATION, SHIFTS, SIGNALS, STAGES, REGIONS, AXES, COMPASS, TERR, ORDER, CORE, TODAY, DAYPARTS, SPECTRA, MOMENTS, STAMPS, DROPS, FORMULA, TECH, HORIZONS, ITEMS, ACTIONS };
})();
