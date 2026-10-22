// All workshop content, taken from the brief. Every number carries a source key into SOURCES.
// [CONFIRM] marks copy that Matt or Alex must approve before it ships.

export const EVENT = {
  door: 'The Future of Freshness',
  title: 'The Flavor Playbook',
  sub: 'Where fresh goes next.',
  lockup: 'TheraBreath × The Flavor Factory | Princeton, New Jersey | November 9, 2026',
  date: 'Monday, November 9, 2026',
  time: '10:00 to 12:00',
  dateLine: 'Monday, November 9, 2026 | 10:00 AM to 12:00 PM ET',
  place: 'Church & Dwight, 469 N Harrison St, Princeton, NJ 08540',
  city: 'Princeton, New Jersey',
  room: 'Darwin',
  code: 'FOF1109', // the live session on November 9; any other code is a clean rehearsal
};

// Ross's goal for the workshop, in his words (invitation, September 18, 2026). The two halves are the growth matrix.
export const ROSS_GOAL = {
  lead: 'Our goal, as R&D, is to drive incremental growth through flavor innovation by identifying and developing new flavor experiences that both',
  loyal: 'strengthen our appeal with existing loyal users',
  joiner: 'and',
  fresh: 'create opportunities to attract new consumers to the franchise.',
  src: 'ross',
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
  patent: 'US Patent 6,582,682 (public)',
  listings: 'TheraBreath public product listings [CONFIRM access date]',
  ross: 'Ross Conroy, Church & Dwight Oral Care R&D, workshop invitation, September 18, 2026',
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
  { id: 'botanical', n: 4, hue: 140, title: 'Botanicals and rituals.', proofs: [{ t: 'TheraBreath Eucalyptus Mint and Overnight Chamomile Mint are already on shelf: botanical names, and one of them names a moment.', src: 'drbicuspid' }, { t: '"Swishy Time" reframed rinsing as a self-care ritual, and the share line followed.', src: 'warc' }], so: 'Flavor that marks a moment in the day.' },
  { id: 'allure', n: 5, hue: 36, title: 'Edible allure.', proofs: [{ t: 'Dessert-inspired oral care flavors are a rising trend.', src: 'vml' }, { t: 'Gen Z treats flavor as identity.', src: 'vml' }], so: 'Indulgent openings are welcome only if the finish is unmistakably clean.' },
  { id: 'sensation', n: 6, hue: 210, title: 'Sensation is the new proof of efficacy.', proofs: [{ t: 'Tingling, warming, salivating and fizzing are used to signal that a product is working.', src: 'pf' }, { t: 'Next-generation coolers promise fast onset and long linger (for example Optacool Fuji).', src: 'symrise' }], so: 'Design how TheraBreath feels, not just how it tastes.' },
  { id: 'mouths', n: 7, hue: 260, title: 'New mouths, new needs.', proofs: [{ t: '1 in 8 US adults currently take a GLP-1; users commonly report dry mouth, bad breath and taste changes, though studies have not established that the drugs cause them.', src: 'carequest' }, { t: 'More than 25 million Americans live with dry mouth.', src: 'pf' }], so: 'Flavor built for altered taste and comfort is a platform, not a niche.' },
];

export type Territory = {
  id: string; n: number; name: string; hero: string; promise: string; why: string; flavors: string[]; signature: string; who: string;
  fit: 'Proven today' | 'Needs engineering' | 'Screen first' | 'Varies'; fitNote?: string; palette: string[]; warmth: number; dark?: boolean; image?: string;
  arc: [string, string, string]; curve: [number, number, number]; moment: string; q: string; opts: string[];
  prof: number[][]; // Compass: 9 dims x (first, heart, finish), 0 to 5. Conceptual, not panel data.
  risk: 1 | 2 | 3; // oxidation sensitivity rule of thumb for The Bench: 1 low, 2 medium, 3 high
  riskWhy: string;
};
// Compass dimensions, in order
export const COMPASS = ['Cooling', 'Brightness', 'Greenness', 'Aromatic lift', 'Sweetness', 'Warmth', 'Tingle', 'Softness', 'Finish length'];
export const CORE_MINT = [4.5, 1.5, 1, 3, 2, 0, 2, 1, 3.8]; // today's core mint, conceptual
export const TERRITORIES: Territory[] = [
  { id: 'mint', n: 1, name: 'Mint, Mastered', hero: 'Glacier Spearmint', promise: 'The icon, re-engineered. Mint with a clear identity, a chosen intensity and a signature feel.', why: 'Mild is mainstream; competitors now sell intensity ranges; TheraBreath\'s mints are named for benefits, not tastes.', flavors: ['Glacier Spearmint, Extra Mild to Arctic', 'Wintergreen Frost', 'Double Peppermint Arctic', 'Pacific Northwest peppermint, single origin'], signature: 'Fast clean onset, long smooth linger, zero burn.', who: 'Everyone, every day; recruits burn-averse lapsed mouthwash users.', fit: 'Proven today', palette: ['#BFE9F2', '#6CC7DD', '#C9D3DA'], warmth: 0, image: '/img/mint.webp', arc: ['Crisp spearmint', 'Clean, sweet mint heart', 'Long glacier cool'], curve: [0.8, 0.6, 0.9], moment: 'Every day', q: 'Should intensity be a visible choice on the pack?', opts: ['Yes, a dial', 'Keep it simple', 'Only for rinse'], prof: [[4, 2, 1.5, 3, 2, 0, 1.5, 2, 3], [4.2, 1.5, 1.5, 3, 2, 0, 1, 2.5, 3.8], [4.6, 1, 1, 2, 1.5, 0, 1, 2.5, 4.6]], risk: 1, riskWhy: 'Mint terpenes and cooling agents are robust in oxidizing systems.' },
  { id: 'bright', n: 2, name: 'Bright Global Freshness', hero: 'Arctic Yuzu', promise: 'Citrus with character: freshness people recognize, with more adventure than lemon.', why: 'Premium citrus is moving from specialist menus into mainstream drinks and fragrance; TheraBreath already travels to 50+ countries. [CONFIRM source]', flavors: ['Calamansi Mint', 'Bergamot Mint', 'Hierbabuena Lima (Mexico)', 'Yuzu Green Tea Mint (Japan, Korea)', 'Passport: regional editions'], signature: 'A citrus flash, aromatic yuzu, a cold crystalline finish.', who: 'Morning people, pre-social moments, international consumers.', fit: 'Needs engineering', fitNote: 'Citrus terpenes proven; citrus aldehydes need protection', palette: ['#F6EDA6', '#E2BD00', '#EEF4F7'], warmth: 0.2, image: '/img/yuzu.webp', arc: ['Citrus flash', 'Aromatic yuzu', 'Cold clean freshness'], curve: [0.95, 0.62, 0.84], moment: 'Wake · pre-social', q: 'Does this feel like a flavor, or a new kind of freshness?', opts: ['A flavor', 'A new kind of freshness'], prof: [[3, 5, 1, 4.5, 1.5, 0, 1, 1, 3], [3.8, 4.5, 1.5, 4.5, 1.5, 0.2, 1, 1, 3.5], [4.6, 3.2, 1, 3, 1, 0, 1, 1, 4.5]], risk: 3, riskWhy: 'The lift in citrus comes from aldehydes that oxidize quickly.' },
  { id: 'botanical', n: 3, name: 'Garden Clean', hero: 'Green Tea Cucumber', promise: 'Freshness that feels like wellness.', why: 'Botanicals and rituals: Eucalyptus Mint and Overnight Chamomile Mint prove permission; tea and cucumber are the language of wellness.', flavors: ['Spring Garden (cucumber, spearmint, green tea)', 'Eucalyptus Mint extensions', 'Basil Lime Mint', 'Grapefruit Rose Mint'], signature: 'Soft green cooling, gentle aromatic lift, calm finish.', who: 'Wellness-minded adults; the "mouthwash is too harsh" non-user.', fit: 'Proven today', fitNote: 'Eucalyptus and chamomile proven; green and cucumber notes need engineering', palette: ['#CFE8C6', '#6FA374', '#EDF3EA'], warmth: 0.3, image: '/img/cucumber.webp', arc: ['Cool cucumber water', 'Clean green tea', 'Smooth, soft cooling'], curve: [0.42, 0.66, 0.54], moment: 'Midday reset', q: 'Does calm read as clean, or as weak?', opts: ['Clean', 'Weak', 'Depends on the moment'], prof: [[2.5, 2.5, 4.5, 2.5, 1, 0, 0.5, 4, 2.5], [3, 2, 4.5, 2.5, 1, 0, 0.5, 4.5, 3], [3.3, 1.5, 3.5, 2, 0.8, 0, 0.5, 4.5, 3.6]], risk: 2, riskWhy: 'Watery-green notes are delicate aldehydes; eucalyptus-type notes are sturdy.' },
  { id: 'warmcool', n: 4, name: 'Warm Meets Cool', hero: 'Frosted Star Anise Mint', promise: 'The contrast of spice and frost, a seasonal signature TheraBreath can own.', why: 'Frosted Star Anise is the 2026 Flavor of the Year (dsm-firmenich); swicy keeps growing (Kerry 2026).', flavors: ['Ginger Lime', 'Cinnamon Frost', 'Clove Wintergreen', 'Chai Spice Mint'], signature: 'A gentle warm glow that resolves into cooling; a long, cozy linger.', who: 'Adventurous adults; fall and winter limited editions.', fit: 'Needs engineering', fitNote: 'Anise, clove, wintergreen and protected cinnamon supported in patent literature', palette: ['#6B3A2A', '#D98E3A', '#F4F8FA'], warmth: 0.8, dark: true, image: '/img/anise-dark.jpg', arc: ['Sweet anise warmth', 'A spice glow', 'Frost that lasts'], curve: [0.55, 0.8, 0.9], moment: 'Post-meal · holiday season', q: 'Where does warmth stop feeling fresh?', opts: ['Never, if it ends cold', 'At cinnamon', 'At the first sip'], prof: [[1.5, 2, 0.5, 4, 2.5, 4.2, 2, 2, 2.5], [2.5, 2, 0.5, 4.5, 2.5, 3.5, 2.5, 2, 3.5], [4.6, 1.5, 0.5, 3, 1.5, 1, 1.5, 2, 4.6]], risk: 2, riskWhy: 'Anethole, eugenol and wintergreen hold up; cinnamic aldehydes need protection.' },
  { id: 'fruit', n: 5, name: 'Fruit, Grown Up', hero: 'Black Currant Frost', promise: 'Fruit-forward freshness for adults. Not candy.', why: 'Black Currant is McCormick\'s 2026 Flavor of the Year; dragon fruit is a breakout flavor (Kerry 2026).', flavors: ['Dragon Fruit Mint', 'White Peach Mint', 'Pear Cardamom Mint', 'Hibiscus Berry Mint'], signature: 'Bright fruit opening, crisp cool finish, low sweetness.', who: 'Mild-seekers, Gen Z, anyone who "does not like mouthwash".', fit: 'Needs engineering', fitNote: 'Some fruit esters need protection; low sweetness is the design rule', palette: ['#4B1D3F', '#E0407B', '#F4B860'], warmth: 0.55, image: '/img/currant.jpg', arc: ['Tart cassis', 'A green leaf note', 'An icy finish'], curve: [0.85, 0.55, 0.8], moment: 'Every day · discovery drops', q: 'Is fruit a gateway, or a distraction?', opts: ['A gateway', 'A distraction', 'Only as limited editions'], prof: [[2.5, 3.5, 1.5, 4, 3, 0.5, 1, 2, 2.5], [3, 3, 2, 4, 2.5, 0.5, 1, 2.5, 3], [4.2, 2, 1, 2.5, 1.5, 0, 1, 2, 4]], risk: 2, riskWhy: 'Fruit esters and some berry notes fade on the shelf unless balanced for the base.' },
  { id: 'night', n: 6, name: 'Soft Freshness · Night Ritual', hero: 'Chamomile Vanilla Mint', promise: 'A softer, comforting freshness that marks the end of the day. Indulgent, then unmistakably clean.', why: 'Overnight Chamomile Mint exists; dessert-inspired oral care is rising (VML Future 100, 2026).', flavors: ['Lavender Chamomile Mint', 'Honey Chamomile', 'Toasted Coconut Mint', 'Cacao Mint'], signature: 'Soft mint, honeyed chamomile, gentle vanilla warmth, low burn.', who: 'Ritual builders, Gen Z treat moments, the evening routine.', fit: 'Screen first', fitNote: 'Vanilla-type and some sweet notes are reactive; format choice matters', palette: ['#DAD6EE', '#8C86C9', '#E6CFA0'], warmth: 0.6, image: '/img/night.webp', arc: ['Soft mint', 'Honeyed chamomile', 'Gentle vanilla warmth'], curve: [0.34, 0.52, 0.62], moment: 'Wind-down · treat moments', q: 'Could a rinse become part of how you wind down?', opts: ['Yes', 'Maybe', 'No'], prof: [[1.5, 1.5, 1.5, 2.5, 3, 2, 0, 4.5, 3], [1.5, 1, 1.5, 3, 3, 2.5, 0, 5, 3.5], [2.6, 1, 1, 2, 2.5, 1.5, 0, 4.5, 4]], risk: 3, riskWhy: 'Vanilla-type notes can discolor and shift in an oxygen system.' },
  { id: 'ladder', n: 7, name: 'The Mint Ladder', hero: 'Sour Apple Chill', promise: 'A flavor journey that keeps families in TheraBreath for life, from first rinse to first job.', why: 'TheraBreath already wins kids with organic-flavored, dye-free rinses; the gap is the tween and teen years.', flavors: ['Kids: Strawberry Splash, Wacky Watermelon, Bubblegum Blast', 'Tween Bridge: Sour Apple Chill, Blue Raspberry Frost', 'Teen: Watermelon Mint, Black Currant Frost', 'Adult: Icy Mint'], signature: 'Sweetness steps down and cooling steps up with every rung.', who: 'Parents, kids 6 to 12, tweens and teens with braces.', fit: 'Proven today', fitNote: 'Kids flavors proven; tween flavors need engineering', palette: ['#F2677B', '#F4B860', '#BFE9F2'], warmth: 0.5, arc: ['Sour green apple', 'Gentle sweetness', 'A first real chill'], curve: [0.9, 0.5, 0.6], moment: 'The braces years', q: 'At what age should mint take over?', opts: ['9', '12', '15'], prof: [[2, 3.5, 2, 3.5, 3.5, 0, 1.5, 2.5, 2], [2.5, 3, 2, 3, 3, 0, 1, 3, 2.5], [3.5, 2, 1, 2, 2, 0, 1, 3, 3]], risk: 2, riskWhy: 'Fruit and sour notes need balancing; dye-free is already the rule.' },
];

// Four primary platforms for the November 9 live workshop. Legacy worlds remain available in the exploration tools.
const platform = (id: string, changes: Partial<Territory>): Territory => ({ ...TERRITORIES.find(t => t.id === id)!, ...changes });
export const PRIMARY_TERRITORIES: Territory[] = [
  platform('warmcool', { n: 1, name: 'Plant-Powered Freshness', hero: 'Ginger Lemon Mint + Blossom Mint', promise: 'Explore botanical freshness through citrus, herbs and the contrast of warmth and cool.', why: 'Two complementary botanical directions, built for this workshop in the Fresh Breath base and tasted blind today.', flavors: ['Ginger, Lemon, Peppermint', 'Grapefruit, Lavender, Spearmint, Wintergreen'], signature: 'Bright citrus, aromatic herbs, a fresh mint finish. Sensory targets to evaluate.', who: 'Adults looking for a new botanical freshness experience.', fit: 'Screen first', fitNote: 'Development concepts: base compatibility and sample readiness are part of what we evaluate together.', image: '/img/gingerlime.webp', arc: ['Bright citrus', 'Botanical character', 'Mint finish'], moment: 'Everyday discovery', q: 'Which botanical direction feels right for TheraBreath?', opts: ['Ginger citrus', 'Floral citrus', 'Both'] }),
  platform('bright', { n: 2, name: 'Global Brightness', promise: 'Familiar citrus opens a door to new flavor experiences.', why: 'A proposed direction to discuss alongside the current lab work.', fit: 'Screen first', fitNote: 'A direction to discuss on screen; not in today’s tasting flight.', q: 'Where can citrus take freshness beyond another mint?' }),
  platform('botanical', { n: 3, name: 'Modern Clean', promise: 'Explore green, gentle freshness for people who find mouthwash too intense.', why: 'A proposed sensory direction, to be tested with consumers and in the intended base.', fit: 'Screen first', fitNote: 'A direction to discuss on screen; not in today’s tasting flight.', q: 'Can gentle feel unmistakably fresh?' }),
  platform('ladder', { n: 4, name: 'Next-Generation Kids', hero: 'Mystery Flavor', promise: 'Flavor makes the routine: playful discovery that invites curiosity.', why: 'Two new kids rinse directions, built for this workshop in the Kids base and tasted blind today.', flavors: ['A mystery fruit blend', 'A frozen-pop profile'], signature: 'A playful fruit blend; evaluate sweetness, finish and age-appropriate appeal.', who: 'Kids and families; consumer appeal remains a hypothesis.', fit: 'Screen first', fitNote: 'Development concepts: both kids samples are starting points, not selections.', arc: ['Guess', 'Discover', 'Discuss'], moment: 'The daily routine', q: 'Could a recurring mystery flavor make the routine more engaging?', opts: ['Advance', 'Explore further', 'Not yet'] }),
];

// The freshness vocabulary: "Mint" is where it starts, not where it ends.
export const VOCAB = [
  { w: 'Brightness', d: 'The lift of citrus and aromatic top notes.' }, { w: 'Cooling', d: 'Not a taste: a sensation on the mouth\'s cold receptors.' },
  { w: 'Green', d: 'Leafy, watery notes that read as natural clean.' }, { w: 'Citrus lift', d: 'The sparkle of peel oils.' },
  { w: 'Botanical', d: 'Herbs and teas that signal care, not medicine.' }, { w: 'Soft', d: 'Freshness without the burn.' },
  { w: 'Warmth', d: 'A touch of spice makes the cool that follows feel colder.' }, { w: 'Floral', d: 'Restrained florals that still read as clean.' },
  { w: 'Juicy', d: 'Fruit notes that make the mouth water.' }, { w: 'Clean bitter', d: 'The dry, tonic edge of grapefruit peel or tea.' },
  { w: 'Tingle', d: 'A buzz people read as "it\'s working".' }, { w: 'Duration', d: 'How long freshness lasts. The finish is the product.' },
  { w: 'Mouthfeel', d: 'Body, smoothness, dryness: how clean feels.' }, { w: 'Ritual', d: 'A moment people repeat and look forward to.' },
  { w: 'Mood', d: 'Flavor sets a state: awake, calm, confident.' }, { w: 'Occasion', d: 'A different freshness at 7 AM and at 10 PM.' },
];

export const SHIFTS = [
  { a: 'Generic mint', b: 'Composed flavor', d: 'A hypothesis to explore: mint can anchor citrus, herbs and botanical character.' },
  { a: 'Maximum intensity', b: 'Chosen intensity', d: 'Explore whether gentler green profiles broaden the invitation to freshness.' },
  { a: 'Daily chore', b: 'Enjoyable routine', d: 'Could playful flavor discovery make kids more interested in their routine? Test the idea.' },
];

// The flavor clock: the same person wants a different freshness at 7 AM and at 10 PM.
export const DAYPARTS = [
  { h: 6.5, l: 'Wake', need: 'Bright, cold, energizing', terr: 'bright' },
  { h: 10, l: 'Confidence', need: 'Crisp, clean, assured', terr: 'mint' },
  { h: 14, l: 'Reset', need: 'Fast, cleansing, restoring', terr: 'botanical' },
  { h: 19, l: 'Post meal', need: 'Cleansing, aromatic, warm then cold', terr: 'warmcool' },
  { h: 22.5, l: 'Restore', need: 'Soft, calming, low burn', terr: 'night' },
];

// The Bench: six sensory dials, 1 to 5
export const DIALS = [
  { id: 'onset', l: 'Cooling onset', lo: 'Gentle', hi: 'Instant' },
  { id: 'linger', l: 'Cooling linger', lo: 'Short', hi: 'All day' },
  { id: 'sweet', l: 'Sweetness', lo: 'Dry', hi: 'Sweet' },
  { id: 'warm', l: 'Warmth', lo: 'None', hi: 'Glowing' },
  { id: 'lift', l: 'Aromatic lift', lo: 'Quiet', hi: 'Bold' },
  { id: 'tingle', l: 'Tingle', lo: 'None', hi: 'Electric' },
];

export const SAMPLES = [
  // status is client language: every sample is a development concept, nothing is a selection yet.
  { code: 'A', name: 'Ginger Lemon Mint', territory: 'warmcool', note: 'Ginger, Lemon, Peppermint', base: 'Fresh Breath base', status: 'Botanical direction one' },
  { code: 'B', name: 'Blossom Mint', territory: 'warmcool', note: 'Grapefruit, Lavender, Spearmint, Wintergreen', base: 'Fresh Breath base', status: 'Botanical direction two' },
  { code: 'C', name: 'Mystery Flavor', territory: 'ladder', note: 'Apple, Grape, Cherry, Strawberry, Lemon', base: 'Kids base', status: 'Kids direction one: guess the fruits' },
  { code: 'D', name: 'Frozen-Pop Exploration', territory: 'ladder', note: 'A frozen-pop fruit profile', base: 'Kids base', status: 'Kids direction two' },
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
  { id: 'm1', title: 'Adults: advance a winning freshness direction', segment: 'Adults seeking new freshness experiences', occasion: 'A daily moment chosen by the team' },
  { id: 'm2', title: 'Kids and families: make flavor part of the experience', segment: 'Kids and families', occasion: 'The daily oral-care routine' },
];

export type Seed = { id: string; n: number; name: string; idea: string; territory: string; segment: string; occasion: string; format: string; horizon: 'Now' | 'Next' | 'Future'; incremental: string };
export const SEEDS: Seed[] = SAMPLES.map((sample, i) => ({
  id: 'workshop-' + sample.code, n: i + 1, name: sample.name, idea: sample.note,
  territory: sample.territory, segment: sample.territory === 'ladder' ? 'Kids and families' : 'Adults',
  occasion: 'To define together', format: sample.territory === 'ladder' ? 'Kids rinse' : 'Rinse',
  horizon: 'Next', incremental: 'Workshop hypothesis: define the consumer, portfolio role and reason to believe.',
}));

export const SENSORY = ['Cooling onset', 'Cooling linger', 'Tingle', 'Gentle warmth', 'Salivating', 'Sparkle and fizz', 'Smooth mouthfeel', 'Aroma burst', 'Bitterness masking', 'Sugar-free sweetness', 'Long finish'];
export const FORMATS = ['Rinse', 'Toothpaste', 'Sachet', 'Strip', 'Spray', 'Lozenge', 'Gum', 'Kids rinse'];
export const SEGMENTS = ['The unconverted 86%', 'Mild-seekers', 'Gen Z self-care ritualists', 'Families and kids to tweens', '55+ longevity seekers', 'GLP-1 and dry mouth', 'Hispanic households', 'International consumers'];
// No launch years: the room sets the sequence, C&D sets the calendar.
export const HORIZONS = [{ id: 'Now', label: 'Now', when: 'The next sample round' }, { id: 'Next', label: 'Next', when: 'After the first results' }, { id: 'Future', label: 'Later', when: 'Platforms to keep exploring' }];
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
  { t: 'Three directions, three owners', d: 'Each with a TFF owner, a C&D reviewer, an intended base and a next sample action, agreed before we leave Princeton.' },
  { t: 'Playbook v1.0 in 8 business days', d: 'Polished from today\'s session data, with every vote, score and edit in it.' },
  { t: 'New samples in your bases', d: 'The next round built in the TheraBreath bases you sent, reviewed together in January 2027.' },
];

// Freshness, designed: where the two worlds meet (site).
export const SCIENCE = ['Volatile aromatics', 'Sensory perception', 'Cooling', 'Trigeminal sensations', 'Taste masking', 'Solubility', 'Stability', 'Oral-care systems'];
export const IMAGINATION = ['Culture', 'Emotion', 'Consumer expectation', 'Food and beverage trends', 'Hospitality', 'Beauty', 'Wellness', 'Travel', 'Ritual'];

// The atlas. Adoption stages are The Flavor Factory's read, not measured data.
export const ATLAS_STAGES = ['Origin cuisine', 'Specialist menus', 'Cafe and cocktail culture', 'Mainstream food and drink', 'Personal care'];
export type Region = { id: string; name: string; at: string; col: string; ing: [string, number][]; sensory: string; why: string; where: string; oral: string; terr: string | null };
export const REGIONS: Region[] = [
  { id: 'japan', name: 'Japan', at: 'japan', col: '#C9A400', ing: [['Yuzu', 4], ['Sudachi', 2], ['Matcha', 5], ['Shiso', 2]], sensory: 'Aromatic, high-lift citrus. Grassy, gently savory tea. Cool, herbal shiso.', why: 'Japanese food is one of the most familiar "foreign" cuisines in the US. Yuzu reads as citrus first and new second: adventure with a safety net.', where: 'Sparkling waters, craft cocktails, pastry, specialty coffee, J-beauty skincare and fine fragrance.', oral: 'Arctic Yuzu · Sudachi Fresh · Green Tea Yuzu', terr: 'bright' },
  { id: 'asia', name: 'East and Southeast Asia', at: 'asia', col: '#4F8A5B', ing: [['Jasmine tea', 4], ['Calamansi', 2], ['Pandan', 2]], sensory: 'Floral tea, sharp sweet-tart citrus and a soft, green warmth.', why: 'Bubble tea and Southeast Asian restaurants have made tea-led, floral-green flavors everyday for younger consumers.', where: 'Bubble and fruit teas, bakeries and desserts, cocktail menus, ready-to-drink teas.', oral: 'Calamansi Mint · Jasmine Cucumber Mint · soft green freshness', terr: 'botanical' },
  { id: 'med', name: 'Mediterranean', at: 'med', col: '#C0715F', ing: [['Bergamot', 5], ['Blood orange', 4], ['Basil', 4], ['Orange blossom', 3]], sensory: 'Sunlit, aromatic citrus, green herbs and restrained florals.', why: 'Earl Grey, spritz culture and the Mediterranean diet made these notes feel natural and good for you. Bergamot is the backbone of classic cologne.', where: 'Aperitivo and spritz menus, botanical gin, fine fragrance, herb-led cooking.', oral: 'Bergamot Mint · Grapefruit Rose Mint · herbal freshness', terr: 'botanical' },
  { id: 'mideast', name: 'Middle East', at: 'mideast', col: '#8A6FB0', ing: [['Rose', 5], ['Cardamom', 3], ['Mint tea', 4], ['Saffron', 2]], sensory: 'Aromatic warmth, soft florals and cooling mint tea.', why: 'Cardamom has moved from the spice rack to the coffee bar, and rose has long been a beauty ingredient. Mint tea gives both a familiar, fresh bridge.', where: 'Cafe menus (cardamom buns, rose lattes), pastry, fragrance, wellness teas.', oral: 'Pear Cardamom Mint · Grapefruit Rose Mint', terr: 'fruit' },
  { id: 'latam', name: 'Latin America', at: 'latam', col: '#6E9B2E', ing: [['Lime', 5], ['Passion fruit', 4], ['Hibiscus', 3], ['Chili-lime', 4]], sensory: 'Bright, juicy and tart, with botanical notes and hot-meets-fresh contrast.', why: 'Aguas frescas and chili-lime snacks taught US consumers to love bright acidity and the contrast of heat with freshness.', where: 'Aguas frescas, sparkling waters, cocktails, snacks and candy.', oral: 'Ginger Lime · Lime Mint · hibiscus freshness', terr: 'warmcool' },
  { id: 'cafe', name: 'Western cafe culture', at: 'nyc', col: '#1B75BB', ing: [['Matcha latte', 5], ['Cardamom bun', 3], ['Lavender latte', 3], ['Yuzu tonic', 3]], sensory: 'Layered, composed and seasonal.', why: 'Cafes are where global ingredients get translated for mainstream palates, one layered drink at a time.', where: 'Specialty coffee, ready-to-drink beverages, bakery menus, social feeds.', oral: 'The lesson for oral care: people now expect composed flavors, not single notes.', terr: null },
];

// Pre-brief: three things to think about before November 9. [CONFIRM copy with Matt]
export const THINK = [
  'One flavor experience a loyal TheraBreath user would welcome, and one that would bring in someone who has never bought it.',
  'The flavor note you expect to be hardest to hold in an oxidizing base, and why.',
  'The moment in the day when TheraBreath is not there yet, and what it would have to taste like to earn it.',
];

// The morning, one line per act (pre-brief and site).
export const AGENDA: [string, string][] = [
  ['10:00', 'A short film, then your brief, your homework and one thesis'],
  ['10:10', 'Chapter 1 · The Signals: the growth math, the shelf, seven sourced signals, and you pick three'],
  ['10:23', 'Flavor School: how cooling works and how flavor survives OXYD-8'],
  ['10:31', 'Chapter 2 · The Territories: four platforms, then a blind tasting made in your bases'],
  ['10:51', 'Loyal users and new consumers: where each sample lands'],
  ['10:57', 'Chapter 3 · The Concepts: two teams build, tune on The Bench, pitch and vote'],
  ['11:27', 'Chapter 4 · The Pipeline: Now, Next, Later, with owners and dates'],
  ['11:37', 'The Flavor Playbook assembles, with your names on the cover'],
  ['12:00', 'Lunch'],
];
