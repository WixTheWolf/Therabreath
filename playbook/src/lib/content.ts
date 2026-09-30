// All workshop content, taken from the brief. Every number carries a source key into SOURCES.
// [CONFIRM] marks copy that Matt or Alex must approve before it ships.

export const EVENT = {
  title: 'The Flavor Playbook',
  sub: 'Where fresh goes next.',
  lockup: 'TheraBreath × The Flavor Factory | November 9, 2026',
  date: 'Monday, November 9, 2026',
  time: '10:00 to 12:00',
  room: 'Darwin',
};

export const SOURCES: Record<string, string> = {
  q2call: 'Church & Dwight Q2 2026 earnings call, July 31, 2026',
  q2pr: 'Church & Dwight Q2 2026 results press release, July 31, 2026',
  q4call: 'Church & Dwight Q4 2025 earnings call, January 2026',
  warc: 'MMA Smarties / WARC case study, 2025',
  dtoday25: 'Dentistry Today, July 18, 2025',
  dtoday26: 'Dentistry Today, March 12, 2026',
  drbicuspid: 'DrBicuspid, March 3, 2026',
  kenvue: 'Kenvue press release, June 2, 2026',
  hismile: 'Public press coverage, 2024 to 2026 [CONFIRM per item]',
  dsm: 'dsm-firmenich press release, December 2025',
  mccormick: 'McCormick, December 2025',
  kerry: 'Kerry Taste Charts 2026',
  vml: 'VML, The Future 100: 2026',
  pf: 'Perfumer & Flavorist, "From Mint to Marshmallow," April 29, 2026',
  symrise: 'Symrise, February 13, 2025',
  carequest: 'CareQuest Institute, August 2026',
  pantone: 'Pantone, December 2025',
  patent: 'US Patent 6,582,682 (public)',
  listings: 'TheraBreath public product listings [CONFIRM access date]',
};

export const JULY = ['Resiliency', 'Innovation', 'Operations', 'Partnership', 'Growth'];

export const OBJECTIVES = [
  { n: '01', ask: 'Identify emerging flavor, sensory and consumer trends shaping the future of oral care.', act: 'Act I', chapter: 'What is changing', short: 'Signals' },
  { n: '02', ask: 'Explore new flavor territories and differentiated sensory experiences.', act: 'Acts II and III', chapter: 'Where flavor can go', short: 'Territories' },
  { n: '03', ask: 'Generate concepts that create new occasions, engage new consumers and expand the portfolio.', act: 'Act IV', chapter: 'What we could make', short: 'Concepts' },
  { n: '04', ask: 'Develop a pipeline of platforms, flavor directions and white space for incremental growth.', act: 'Act V', chapter: 'What we do first, next and later', short: 'Pipeline' },
];

export const CHAPTERS = ['Signals', 'Territories', 'Concepts', 'Pipeline', 'Flavor Code'];

export const SURVEY = {
  consumer: { q: 'Which consumer do you most want TheraBreath to win next?', options: ['The unconverted 86%', 'Mild-seekers', 'Gen Z self-care ritualists', 'Families and kids to tweens', '55+ longevity seekers', 'GLP-1 and dry mouth', 'Hispanic households', 'International consumers'] },
  moment: { q: 'Which moment of the day is TheraBreath missing?', options: ['Wake-up', 'After coffee', 'After lunch', 'Afternoon meeting', 'After the gym', 'Before going out', 'Wind-down', 'On the go'] },
  veto: { q: 'Name one flavor you would never approve for TheraBreath, and why.' },
};

export const CLIMB: { label: string; v: number; src: string; note?: string; approx?: boolean }[] = [
  { label: 'Before Swishy Time', v: 5.6, src: 'warc', note: '[CONFIRM label]' },
  { label: 'Swishy Time era', v: 15.6, src: 'warc' },
  { label: 'End of 2025', v: 22, src: 'q4call', note: 'just under 22%', approx: true },
  { label: 'Q2 2026', v: 25.3, src: 'q2call' },
];

export const GAP = { category: 65, tb: 14, src: 'q2call' };

export type Variant = { format: string; line: string; flavor: string; kids?: boolean };
export const PORTFOLIO: Variant[] = [
  { format: 'Rinse', line: 'Fresh Breath', flavor: 'Invigorating Icy Mint' },
  { format: 'Rinse', line: 'Fresh Breath', flavor: 'Mild Mint' },
  { format: 'Rinse', line: 'Fresh Breath', flavor: 'Rainforest Mint' },
  { format: 'Rinse', line: 'Fresh Breath (Target)', flavor: 'Eucalyptus Mint' },
  { format: 'Rinse', line: 'Healthy Gums', flavor: 'Clean Mint' },
  { format: 'Rinse', line: 'Whitening', flavor: 'Dazzling Mint' },
  { format: 'Rinse', line: 'Healthy Smile', flavor: 'Sparkle Mint' },
  { format: 'Rinse', line: 'Deep Clean', flavor: 'Fresh Mint' },
  { format: 'Rinse', line: 'Overnight', flavor: 'Chamomile Mint' },
  { format: 'Rinse', line: 'Dry Mouth', flavor: 'Tingling Mint' },
  { format: 'Rinse', line: 'Complete', flavor: 'Revitalizing Mint' },
  { format: 'Kids', line: 'For Kids!', flavor: 'Strawberry Splash', kids: true },
  { format: 'Kids', line: 'For Kids!', flavor: 'Wacky Watermelon', kids: true },
  { format: 'Kids', line: 'For Kids!', flavor: 'Bubblegum Blast', kids: true },
  { format: 'Toothpaste', line: 'Fresh Breath', flavor: 'Mild Mint' },
  { format: 'Toothpaste', line: 'Healthy Gums', flavor: 'Clean Mint' },
  { format: 'Toothpaste', line: 'Deep Clean', flavor: 'Fresh Mint' },
  { format: 'Toothpaste', line: 'Whitening', flavor: 'Dazzling Mint' },
  { format: 'Toothpaste', line: 'Sensitive', flavor: 'Mild Mint' },
  { format: 'Lozenge', line: 'Dry Mouth', flavor: 'Mandarin Mint' },
  { format: 'Lozenge', line: 'Dry Mouth', flavor: 'Tart Berry' },
  { format: 'Gum', line: 'Fresh Breath', flavor: 'Invigorating Icy Mint' },
  { format: 'Gum', line: 'Fresh Breath', flavor: 'Citrus Mint' },
  { format: 'Sachet', line: 'On the go', flavor: 'Invigorating Icy Mint' },
  { format: 'Sachet', line: 'On the go', flavor: 'Sparkle Mint' },
];

export const MARKET = [
  { when: 'July 2025', who: 'Listerine', what: 'Watermelon Mint, alcohol-free, limited time, Target exclusive.', src: 'dtoday25' },
  { when: 'March 2026', who: 'Listerine', what: 'Citrus Mint with grapefruit and yuzu, alcohol-free, Target.', src: 'dtoday26' },
  { when: 'March 2026', who: 'TheraBreath', what: 'Eucalyptus Mint, Target exclusive.', src: 'drbicuspid' },
  { when: 'June 2026', who: 'Listerine', what: 'An intensity range including Extra Mild, citing that 54% of Americans want a milder-tasting mouthwash.', src: 'kenvue' },
  { when: '2025 to 2026', who: 'Hismile', what: 'Toothpaste as entertainment: collaborations with Lucky Charms, Reese\'s, KFC and more.', src: 'hismile' },
];

export type Signal = { id: string; n: number; title: string; proofs: { t: string; src: string }[]; so: string; hue: number };
export const SIGNALS: Signal[] = [
  { id: 'mild', n: 1, hue: 190, title: 'Mild is the new mainstream.', proofs: [{ t: '54% of Americans want a milder-tasting mouthwash.', src: 'kenvue' }, { t: 'Gentleness is now a category-wide claim, a space TheraBreath\'s "no burn" promise opened.', src: 'kenvue' }], so: 'Own intensity as a choice, not a compromise.' },
  { id: 'warm', n: 2, hue: 28, title: 'Warmth meets freshness.', proofs: [{ t: 'Frosted Star Anise is the 2026 Flavor of the Year. Two-thirds of consumers recognize star anise, only 34% have tasted it.', src: 'dsm' }, { t: 'Sweet heat ("swicy") keeps growing.', src: 'kerry' }], so: 'A new adult flavor family that still finishes cool.' },
  { id: 'fruit', n: 3, hue: 330, title: 'Fruit grows up.', proofs: [{ t: 'Black Currant is McCormick\'s 2026 Flavor of the Year.', src: 'mccormick' }, { t: 'Dragon fruit is a breakout global flavor; hibiscus and orange blossom are future flavors.', src: 'kerry' }], so: 'Fruit-forward mints for adults, not candy.' },
  { id: 'botanical', n: 4, hue: 140, title: 'Botanicals and rituals.', proofs: [{ t: 'TheraBreath Eucalyptus Mint and Overnight Chamomile Mint already exist; "Swishy Time" reframed oral care as self-care.', src: 'drbicuspid' }, { t: 'Pantone\'s 2026 Color of the Year, Cloud Dancer, signals a hunger for calm.', src: 'pantone' }], so: 'Flavor that marks a moment in the day.' },
  { id: 'allure', n: 5, hue: 36, title: 'Edible allure.', proofs: [{ t: 'Dessert-inspired oral care flavors are a rising trend.', src: 'vml' }, { t: 'Gen Z treats flavor as identity.', src: 'vml' }], so: 'Indulgent openings are welcome only if the finish is unmistakably clean.' },
  { id: 'sensation', n: 6, hue: 210, title: 'Sensation is the new proof of efficacy.', proofs: [{ t: 'Tingling, warming, salivating and fizzing are used to signal that a product is working.', src: 'pf' }, { t: 'Next-generation coolers promise fast onset and long linger (for example Optacool Fuji).', src: 'symrise' }], so: 'Design how TheraBreath feels, not just how it tastes.' },
  { id: 'mouths', n: 7, hue: 260, title: 'New mouths, new needs.', proofs: [{ t: '1 in 8 US adults currently take a GLP-1; users commonly report dry mouth, bad breath and taste changes, though studies have not established that the drugs cause them.', src: 'carequest' }, { t: 'More than 25 million Americans live with dry mouth.', src: 'pf' }], so: 'Flavor built for altered taste and comfort is a platform, not a niche.' },
];

export type Territory = { id: string; n: number; name: string; promise: string; why: string; flavors: string[]; signature: string; who: string; fit: 'Proven today' | 'Needs engineering' | 'Screen first' | 'Varies'; fitNote?: string; palette: string[]; warmth: number; dark?: boolean; image?: string };
export const TERRITORIES: Territory[] = [
  { id: 'mint', n: 1, name: 'Mint, Mastered', promise: 'The icon, re-engineered. Mint with a clear identity, a chosen intensity and a signature feel.', why: 'Mild is mainstream; competitors now sell intensity ranges; TheraBreath\'s mints are named for benefits, not tastes.', flavors: ['Glacier Spearmint', 'Wintergreen Frost', 'Double Peppermint Arctic', 'Sweet Mint Extra Mild', 'Pacific Northwest peppermint, single origin'], signature: 'Fast clean onset, long smooth linger, zero burn.', who: 'Everyone, every day; recruits burn-averse lapsed mouthwash users.', fit: 'Proven today', palette: ['#BFE9F2', '#6CC7DD', '#C9D3DA'], warmth: 0 },
  { id: 'botanical', n: 2, name: 'The Botanical Garden', promise: 'Freshness that feels like wellness.', why: 'Botanicals and rituals; Eucalyptus Mint and Chamomile Mint prove permission; herbal mints and green tea are rising in Asia.', flavors: ['Cucumber Green Tea Mint (Spring Garden)', 'Eucalyptus Mint extensions', 'Basil Lime Mint', 'Rosemary Spearmint', 'Lavender Chamomile Mint (night)'], signature: 'Soft green cooling, gentle aromatic lift, calm finish.', who: 'Wellness-oriented adults, mornings and evenings, the self-care shelf.', fit: 'Proven today', fitNote: 'Eucalyptus and chamomile proven; green and cucumber notes need engineering', palette: ['#8FAF97', '#5E8C7A', '#CFE8C6'], warmth: 0.3 },
  { id: 'fruit', n: 3, name: 'Fruit, Grown Up', promise: 'Fruit-forward freshness for adults. Not candy.', why: 'Black Currant (McCormick 2026), dragon fruit breakout (Kerry 2026), hibiscus and orange blossom as future flavors.', flavors: ['Black Currant Frost', 'Dragon Fruit Mint', 'Pink Grapefruit Spearmint', 'White Peach Mint', 'Hibiscus Berry Mint', 'Mandarin Mint in rinse'], signature: 'Bright fruit opening, crisp cool finish, low sweetness.', who: 'Mild-seekers, Gen Z, anyone who "does not like mouthwash."', fit: 'Needs engineering', fitNote: 'Citrus terpenes proven; citrus aldehydes and some fruit notes need protection', palette: ['#4B1D3F', '#E0407B', '#F4B860'], warmth: 0.55, image: '/img/currant.jpg' },
  { id: 'warmcool', n: 4, name: 'Warm Meets Cool', promise: 'The contrast of spice and frost, a seasonal signature TheraBreath can own.', why: 'Frosted Star Anise (2026 Flavor of the Year), swicy, the return of cinnamon and wintergreen in breath care.', flavors: ['Frosted Star Anise Mint', 'Cinnamon Frost', 'Clove Wintergreen', 'Chai Spice Mint', 'Ginger Spearmint'], signature: 'A gentle warm glow that resolves into cooling; a long, cozy linger.', who: 'Adventurous adults; fall and winter limited editions; holiday social moments.', fit: 'Needs engineering', fitNote: 'Anise, clove, wintergreen and protected cinnamon supported in patent literature', palette: ['#6B3A2A', '#D98E3A', '#F4F8FA'], warmth: 0.8, dark: true, image: '/img/anise-dark.jpg' },
  { id: 'dessert', n: 5, name: 'Dessert, Then Fresh', promise: 'An indulgent opening with an unmistakably clean finish.', why: 'Edible allure (VML Future 100, 2026); flavor as identity for Gen Z; collaboration culture in oral care.', flavors: ['Toasted Coconut Mint', 'Cacao Mint', 'Sweet Cream Spearmint', 'Honey Chamomile (night)'], signature: 'A soft, rounded opening that snaps into brisk freshness.', who: 'Gen Z and young adults; limited editions and collaborations; toothpaste and gum before rinse.', fit: 'Screen first', fitNote: 'Vanilla-type and some sweet notes are reactive; format choice matters', palette: ['#F3E6CF', '#5A3A2E', '#FFFFFF'], warmth: 0.9 },
  { id: 'ladder', n: 6, name: 'The Mint Ladder', promise: 'A flavor journey that keeps families in TheraBreath for life, from first rinse to first job.', why: 'TheraBreath already wins kids with organic-flavored, dye-free rinses; the gap is the tween and teen years.', flavors: ['Kids: Strawberry Splash, Wacky Watermelon, Bubblegum Blast', 'Tween Bridge: Sour Apple Chill, Blue Raspberry Frost', 'Teen: Watermelon Mint, Black Currant Frost', 'Adult: Icy Mint'], signature: 'Sweetness steps down and cooling steps up with every rung.', who: 'Parents, kids 6 to 12, tweens and teens with braces.', fit: 'Proven today', fitNote: 'Kids flavors proven; tween flavors need engineering', palette: ['#F2677B', '#F4B860', '#BFE9F2'], warmth: 0.5 },
  { id: 'passport', n: 7, name: 'Passport', promise: 'Flavors that travel with TheraBreath into 50+ countries, and bring the world home as US limited editions.', why: 'TheraBreath is the fastest-growing mouthwash in Canada, Mexico, the UK and Australia.', flavors: ['Hierbabuena Lima (Mexico, Latin America)', 'Yuzu Green Tea Mint (Japan, Korea)', 'White Peach Mint (Korea)', 'Cardamom Mint (Middle East, India)', 'Spearmint Aniseed (UK)'], signature: 'Local character, universal freshness.', who: 'International consumers; US travel-inspired drops.', fit: 'Varies', fitNote: 'Each regional flavor gets its own screen [CONFIRM priorities]', palette: ['#57518F', '#6CC7DD', '#F4B860'], warmth: 0.4 },
];

export const SAMPLES = [
  { code: 'A', name: 'Frosted Star Anise Mint', territory: 'warmcool' },
  { code: 'B', name: 'Black Currant Frost', territory: 'fruit' },
  { code: 'C', name: 'Spring Garden', territory: 'botanical', note: 'cucumber, spearmint, green tea' },
  { code: 'D', name: 'Glacier Spearmint Extra Mild', territory: 'mint' },
];
export const WHO_CHIPS = ['Gen Z', 'Mild-seekers', 'Families', '55+', 'Dry mouth', 'International', 'Me'];

export const MOLECULES = [
  { id: 'menthol', sym: '◇', name: 'Menthol', source: 'Peppermint', note: 'The cool itself. It triggers the cold receptor, TRPM8.' },
  { id: 'anethole', sym: '✶', name: 'Anethole', source: 'Star anise', note: 'The heart of anise and fennel: sweet, warm, licorice.' },
  { id: 'eugenol', sym: '◎', name: 'Eugenol', source: 'Clove', note: 'Warm, spicy, the classic dental note.' },
  { id: 'msal', sym: '△', name: 'Methyl salicylate', source: 'Wintergreen', note: 'Bright, medicinal, instantly "clean".' },
  { id: 'limonene', sym: '○', name: 'Limonene', source: 'Orange peel', note: 'Fresh citrus sparkle.' },
  { id: 'hexenol', sym: '▽', name: 'cis-3-Hexenol', source: 'Cut grass', note: 'The green of a leaf snapped in half.' },
  { id: 'linalool', sym: '❋', name: 'Linalool', source: 'Lavender', note: 'Soft, floral, calming.' },
];

export const MISSIONS = [
  { id: 'm1', title: 'Gen Z self-care ritualists × the pre-social moment', segment: 'Gen Z self-care ritualists', occasion: 'Before going out' },
  { id: 'm2', title: 'Families × the kids-to-tween graduation (the braces years)', segment: 'Families and kids to tweens', occasion: 'The braces years' },
  { id: 'm3', title: 'GLP-1 and 55+ consumers × all-day comfort and dry mouth', segment: 'GLP-1 and dry mouth', occasion: 'All day' },
];

export type Seed = { id: string; n: number; name: string; idea: string; territory: string; segment: string; occasion: string; format: string; horizon: 'Now' | 'Next' | 'Future'; incremental: string };
export const SEEDS: Seed[] = [
  { id: 's1', n: 1, name: 'Frosted Star Anise Mint', idea: 'A winter limited edition: warm, sweet star anise wrapped in cool mint frost.', territory: 'warmcool', segment: 'Adventurous adults', occasion: 'Holiday social season', format: 'Rinse and sachet', horizon: 'Now', incremental: 'Seasonal news that earns a display.' },
  { id: 's2', n: 2, name: 'Spring Garden', idea: 'Cucumber, spearmint and green tea for a spring limited edition.', territory: 'botanical', segment: 'Wellness-minded adults', occasion: 'Spring', format: 'Rinse and toothpaste', horizon: 'Now', incremental: 'Recruits "mouthwash is too harsh" non-users.' },
  { id: 's3', n: 3, name: 'Black Currant Frost', idea: 'Tart cassis, a green leaf note, an icy finish.', territory: 'fruit', segment: 'Mild-seekers and Gen Z', occasion: 'Every day', format: 'Rinse', horizon: 'Now', incremental: 'A fruit mint made for adults.' },
  { id: 's4', n: 4, name: 'The Intensity Dial', idea: 'Make intensity a visible choice across the core mints, 1 to 4 frost marks from Extra Mild to Arctic.', territory: 'mint', segment: 'Everyone', occasion: 'Every day', format: 'Pack and naming system', horizon: 'Now', incremental: 'Turns "too strong" objections into trial.' },
  { id: 's5', n: 5, name: 'Pocket Flight', idea: 'A sachet variety pack of four flavors for sampling, events and retailer exclusives.', territory: 'mint', segment: 'The unconverted 86%', occasion: 'On the go', format: 'Sachet', horizon: 'Now', incremental: 'The cheapest possible trial for the 86%.' },
  { id: 's6', n: 6, name: 'Layer Your Fresh', idea: 'Named toothpaste and rinse pairings, borrowed from fragrance layering.', territory: 'mint', segment: 'Gen Z', occasion: 'Regimen', format: 'Paste plus rinse', horizon: 'Now', incremental: 'More items per household.' },
  { id: 's7', n: 7, name: 'Morning Reset and Night Reset', idea: 'A day and night duo: bright citrus spearmint with a light tingle, and a calmer night signature.', territory: 'botanical', segment: 'Ritual builders', occasion: 'Wake-up and wind-down', format: 'Rinse duo', horizon: 'Next', incremental: 'Two occasions, two bottles.' },
  { id: 's8', n: 8, name: 'Hydra Comfort', idea: 'Cucumber melon mint with a gently salivating tart edge, soft cooling and zero bitterness.', territory: 'botanical', segment: 'GLP-1 users, 55+, dry mouth', occasion: 'All day', format: 'Rinse, spray, lozenge', horizon: 'Next', incremental: 'A fast-growing group with a daily need. Benefit language set by C&D clinical and regulatory.' },
  { id: 's9', n: 9, name: 'The Tween Bridge', idea: 'Dye-free Sour Apple Chill and Blue Raspberry Frost for ages 9 to 13 and the braces years.', territory: 'ladder', segment: 'Families', occasion: 'The braces years', format: 'Kids rinse and toothpaste', horizon: 'Next', incremental: 'Stops the drop-off between kids flavors and adult mint.' },
  { id: 's10', n: 10, name: 'After-Coffee Reset', idea: 'A roasted cacao whisper, a sweet cream note and a brisk spearmint finish.', territory: 'dessert', segment: 'Commuters and office workers', occasion: 'After coffee', format: 'Sachet and strip', horizon: 'Next', incremental: 'A daily occasion no oral care brand owns.' },
  { id: 's11', n: 11, name: 'Signature Cool', idea: 'A proprietary TheraBreath sensory signature: fast onset, long linger, no burn, in every format.', territory: 'mint', segment: 'Everyone', occasion: 'Every use', format: 'Platform', horizon: 'Future', incremental: 'TheraBreath feels like TheraBreath, the way a sonic logo sounds like a brand.' },
  { id: 's12', n: 12, name: 'Passport Series', idea: 'Regional editions for priority international markets, and travel-inspired US drops.', territory: 'passport', segment: 'International consumers', occasion: 'Travel', format: 'Platform', horizon: 'Future', incremental: 'Growth in 50+ countries.' },
  { id: 's13', n: 13, name: 'Collaboration Drops', idea: 'Flavor collaborations with culture partners, including Church & Dwight family crossovers [CONFIRM appetite].', territory: 'dessert', segment: 'Gen Z', occasion: 'Limited editions', format: 'Platform', horizon: 'Future', incremental: 'News, reach and trial.' },
  { id: 's14', n: 14, name: 'Dessert, Then Fresh', idea: 'A limited collection, Toasted Coconut Mint and Cacao Mint, that starts indulgent and finishes clean.', territory: 'dessert', segment: 'Gen Z and young adults', occasion: 'Treat moments', format: 'Toothpaste and gum first', horizon: 'Future', incremental: 'A new reason to buy a second flavor.' },
];

export const SENSORY = ['Cooling onset', 'Cooling linger', 'Tingle', 'Gentle warmth', 'Salivating', 'Sparkle and fizz', 'Smooth mouthfeel', 'Aroma burst', 'Bitterness masking', 'Sugar-free sweetness', 'Long finish'];
export const FORMATS = ['Rinse', 'Toothpaste', 'Sachet', 'Strip', 'Spray', 'Lozenge', 'Gum', 'Kids rinse'];
export const SEGMENTS = ['The unconverted 86%', 'Mild-seekers', 'Gen Z self-care ritualists', 'Families and kids to tweens', '55+ longevity seekers', 'GLP-1 and dry mouth', 'Hispanic households', 'International consumers'];
export const HORIZONS = [{ id: 'Now', label: 'Now', when: '2027 launches' }, { id: 'Next', label: 'Next', when: '2028' }, { id: 'Future', label: 'Future', when: '2029 to 2030' }];
export const ROLES = [
  { id: 'Core', job: 'The always-on mints. Retain and carry the clinical claims.' },
  { id: 'Expanders', job: 'Permanent flavors beyond pure mint. Recruit mild-seekers and adventurous adults.' },
  { id: 'Explorers', job: 'Limited editions, seasonal drops, exclusives, collaborations. News, shelf space, trial.' },
  { id: 'Specialists', job: 'Need-states where flavor is part of the benefit: dry mouth, night, kids, sensitive.' },
];

export const CODE = [
  { n: 1, t: 'Fresh first.', d: 'Every flavor finishes clean and fresh, wherever it starts.' },
  { n: 2, t: 'Never the burn.', d: 'Gentle intensity, no alcohol bite.' },
  { n: 3, t: 'Clean by design.', d: 'Dye-free and alcohol-free, with natural flavors wherever possible.' },
  { n: 4, t: 'Built for OXYD-8.', d: 'Every flavor is screened for stability in TheraBreath\'s chemistry.' },
  { n: 5, t: 'Built to last.', d: 'A linger that supports all-day freshness claims.' },
  { n: 6, t: 'A name you can taste.', d: 'Each flavor is distinct and nameable, not "another mint."' },
  { n: 7, t: 'Dentist credible.', d: 'Fun is welcome. Frivolous is not.' },
];

export const OCCASIONS = [
  { t: '06:30', l: 'Wake-up', h: 6.5 }, { t: '08:00', l: 'After coffee', h: 8 }, { t: '12:30', l: 'After lunch', h: 12.5 },
  { t: '15:00', l: 'Afternoon meeting', h: 15 }, { t: '17:30', l: 'After the gym', h: 17.5 }, { t: '19:30', l: 'Before going out', h: 19.5 }, { t: '22:30', l: 'Wind-down', h: 22.5 },
];

export const NEXT_STEPS = [
  { t: 'Playbook v1.0', d: 'Delivered within 8 business days.' },
  { t: 'Prototypes', d: 'Development of the top 3 concepts in real TheraBreath bases.' },
  { t: 'Next session', d: 'A follow-up Playbook session in January 2027.' },
];
