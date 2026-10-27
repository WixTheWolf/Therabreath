// All workshop content, taken from the brief. Every number carries a source key into SOURCES.
// [CONFIRM] marks copy that Matt or Alex must approve before it ships.

export const EVENT = {
  door: 'The Future of Freshness',
  title: 'The Flavor Playbook',
  sub: 'A working session with Church & Dwight Oral Care R&D',
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

// Ross's four key areas of focus, word for word from his invitation (September 18, 2026).
export const OBJECTIVES = [
  { n: '01', ask: 'Identifying emerging flavor, sensory, and consumer trends that could influence the future of oral care.', act: 'Part 1', chapter: 'What\u2019s changing', short: 'Signals' },
  { n: '02', ask: 'Exploring new flavor territories and sensory experiences that can differentiate TheraBreath from competitors and create memorable consumer experiences.', act: 'Part 2', chapter: 'Where flavor could go', short: 'Territories' },
  { n: '03', ask: 'Developing innovative flavor concepts that unlock new usage occasions, address new consumer segments, and create opportunities for portfolio expansion.', act: 'Part 3', chapter: 'What we could make', short: 'Concepts' },
  { n: '04', ask: 'Generating a pipeline of innovation platforms, flavor directions, and white-space opportunities that have the potential to drive incremental growth across the portfolio.', act: 'Part 4', chapter: 'What to do first', short: 'Pipeline' },
];

export const CHAPTERS = ['Signals', 'Territories', 'Concepts', 'Pipeline', 'Flavor Code'];

export const SURVEY = {
  consumer: { q: 'Which consumer do you most want TheraBreath to win next?', options: ['The 86% who don\u2019t buy it yet', 'People who want it milder', 'Gen Z', 'Families with kids and tweens', 'People 55 and over', 'People on GLP-1s or with dry mouth', 'Hispanic households', 'Shoppers outside the US'] },
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
  { id: 'mild', n: 1, hue: 190, title: 'People want milder mouthwash.', proofs: [{ t: '54% of Americans want a milder-tasting mouthwash.', src: 'kenvue' }, { t: 'Gentleness is now a category-wide claim, a space TheraBreath\'s "no burn" promise opened.', src: 'kenvue' }], so: 'Offer intensity as a choice people make.' },
  { id: 'warm', n: 2, hue: 28, title: 'Warm spices are showing up in fresh flavors.', proofs: [{ t: 'Frosted Star Anise is the 2026 Flavor of the Year. Two-thirds of consumers recognize star anise, only 34% have tasted it.', src: 'dsm' }, { t: 'Sweet heat ("swicy") keeps growing.', src: 'kerry' }], so: 'Room for a warm, spiced flavor for adults that still finishes cool.' },
  { id: 'fruit', n: 3, hue: 330, title: 'Fruit flavors are growing up.', proofs: [{ t: 'Black Currant is McCormick\'s 2026 Flavor of the Year.', src: 'mccormick' }, { t: 'Dragon fruit is a breakout global flavor; hibiscus and orange blossom are future flavors.', src: 'kerry' }], so: 'Fruit-forward mints made for adults.' },
  { id: 'botanical', n: 4, hue: 140, title: 'Botanicals and daily routines.', proofs: [{ t: 'TheraBreath Eucalyptus Mint and Overnight Chamomile Mint are already on shelf: botanical names, and one of them names a moment.', src: 'drbicuspid' }, { t: '"Swishy Time" reframed rinsing as a self-care ritual, and the share line followed.', src: 'warc' }], so: 'Flavors tied to a time of day, like morning or bedtime.' },
  { id: 'allure', n: 5, hue: 36, title: 'Dessert flavors are moving into oral care.', proofs: [{ t: 'Dessert-inspired oral care flavors are a rising trend.', src: 'vml' }, { t: 'Gen Z treats flavor as identity.', src: 'vml' }], so: 'A sweeter start can work if the finish is clean.' },
  { id: 'sensation', n: 6, hue: 210, title: 'People judge whether it works by how it feels.', proofs: [{ t: 'Tingling, warming, salivating and fizzing are used to signal that a product is working.', src: 'pf' }, { t: 'Next-generation coolers promise fast onset and long linger (for example Optacool Fuji).', src: 'symrise' }], so: 'Cooling, tingle and warmth are part of the product, so we design them on purpose.' },
  { id: 'mouths', n: 7, hue: 260, title: 'More people live with dry mouth or changed taste.', proofs: [{ t: '1 in 8 US adults currently take a GLP-1; users commonly report dry mouth, bad breath and taste changes, though studies have not established that the drugs cause them.', src: 'carequest' }, { t: 'More than 25 million Americans live with dry mouth.', src: 'pf' }], so: 'Flavors made for dry mouth and changed taste could be a line of their own.' },
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
  { id: 'ladder', n: 7, name: 'The Mint Ladder', hero: 'Sour Apple Chill', promise: 'Flavors that grow up with a family, from a child’s first rinse to their first job.', why: 'TheraBreath already wins kids with organic-flavored, dye-free rinses; the gap is the tween and teen years.', flavors: ['Kids: Strawberry Splash, Wacky Watermelon, Bubblegum Blast', 'Tween Bridge: Sour Apple Chill, Blue Raspberry Frost', 'Teen: Watermelon Mint, Black Currant Frost', 'Adult: Icy Mint'], signature: 'Sweetness steps down and cooling steps up with every rung.', who: 'Parents, kids 6 to 12, tweens and teens with braces.', fit: 'Proven today', fitNote: 'Kids flavors proven; tween flavors need engineering', palette: ['#F2677B', '#F4B860', '#BFE9F2'], warmth: 0.5, arc: ['Sour green apple', 'Gentle sweetness', 'A first real chill'], curve: [0.9, 0.5, 0.6], moment: 'The braces years', q: 'At what age should mint take over?', opts: ['9', '12', '15'], prof: [[2, 3.5, 2, 3.5, 3.5, 0, 1.5, 2.5, 2], [2.5, 3, 2, 3, 3, 0, 1, 3, 2.5], [3.5, 2, 1, 2, 2, 0, 1, 3, 3]], risk: 2, riskWhy: 'Fruit and sour notes need balancing; dye-free is already the rule.' },
];

// Four primary platforms for the November 9 live workshop. Legacy worlds remain available in the exploration tools.
const platform = (id: string, changes: Partial<Territory>): Territory => ({ ...TERRITORIES.find(t => t.id === id)!, ...changes });
export const PRIMARY_TERRITORIES: Territory[] = [
  platform('warmcool', { n: 1, name: 'Plant-Powered Freshness', hero: 'Blossom Mint + Grove Mint', promise: 'Citrus, herbs and florals, finished with mint.', why: 'We made two botanical samples for today in your Fresh Breath base.', flavors: ['Grapefruit, Lavender, Rose, Spearmint, Wintergreen', 'Spearmint, Peppermint, Wintergreen, Rosemary, Ylang Ylang, Eucalyptus'], signature: 'Bright citrus and herbs, with a mint finish.', who: 'Adults who want something other than straight mint.', fit: 'Screen first', fitNote: 'These are development samples. We are still checking how they hold up in the base.', image: '/img/botanicals.webp', arc: ['Citrus', 'Herbs and florals', 'Mint finish'], moment: 'Every day', q: 'Which of the two feels more like TheraBreath?', opts: ['Blossom Mint', 'Grove Mint', 'Both'] }),
  platform('bright', { n: 2, name: 'Global Brightness', promise: 'Citrus people already know, taken somewhere new.', why: 'Not in today’s tasting. We would like your read on it.', signature: 'A burst of citrus, then a cold, clean finish.', who: 'Morning rinsers, people heading out, and international markets.', fit: 'Screen first', fitNote: 'For discussion only today.', arc: ['Citrus', 'Yuzu', 'Cold, clean finish'], moment: 'Mornings and going out', q: 'Is there a citrus flavor that could sit next to your mints?' }),
  platform('botanical', { n: 3, name: 'Modern Clean', promise: 'Green, gentle freshness for people who find mouthwash too strong.', why: 'Not in today’s tasting. It would need consumer testing in your base.', signature: 'Soft cooling, green notes and a calm finish.', who: 'People who skip mouthwash because it is too harsh.', fit: 'Screen first', fitNote: 'For discussion only today.', arc: ['Cucumber', 'Green tea', 'Soft cooling'], moment: 'Midday', q: 'Can a gentle flavor still feel fresh enough?' }),
  platform('ladder', { n: 4, name: 'Next-Generation Kids', hero: 'Berry Blast + Mystery Flavor', promise: 'Flavors that make kids want to rinse.', why: 'We made two kids samples for today in your Kids base.', flavors: ['Blueberry, Blackberry, Raspberry', 'A mystery fruit blend'], signature: 'Fruity and fun. We want your read on the sweetness and the finish.', who: 'Kids and their parents. We have not tested this with consumers yet.', fit: 'Screen first', fitNote: 'Both are starting points, not final picks.', image: '/img/kids-splash.webp', arc: ['Fruit', 'Sweet', 'Clean finish'], moment: 'Brushing and rinsing time', q: 'Would a mystery flavor get kids more interested in rinsing?', opts: ['Advance', 'Explore further', 'Not yet'] }),
];

// The freshness vocabulary: "Mint" is where it starts, not where it ends.
export const VOCAB = [
  { w: 'Brightness', d: 'The lift of citrus and aromatic top notes.' }, { w: 'Cooling', d: 'Not a taste: a sensation on the mouth\'s cold receptors.' },
  { w: 'Green', d: 'Leafy, watery notes that read as natural clean.' }, { w: 'Citrus lift', d: 'The sparkle of peel oils.' },
  { w: 'Botanical', d: 'Herbs and teas that signal care, not medicine.' }, { w: 'Soft', d: 'Freshness without the burn.' },
  { w: 'Warmth', d: 'A touch of spice makes the cool that follows feel colder.' }, { w: 'Floral', d: 'Restrained florals that still read as clean.' },
  { w: 'Juicy', d: 'Fruit notes that make the mouth water.' }, { w: 'Clean bitter', d: 'The dry, tonic edge of grapefruit peel or tea.' },
  { w: 'Tingle', d: 'A buzz people read as "it\'s working".' }, { w: 'Duration', d: 'How long the fresh feeling lasts.' },
  { w: 'Mouthfeel', d: 'Body, smoothness, dryness: how clean feels.' }, { w: 'Ritual', d: 'A moment people repeat and look forward to.' },
  { w: 'Mood', d: 'Flavor sets a state: awake, calm, confident.' }, { w: 'Occasion', d: 'A different freshness at 7 AM and at 10 PM.' },
];

export const SHIFTS = [
  { a: 'Generic mint', b: 'Composed flavor', d: 'Mint can carry citrus, herbs and botanicals. We think that is worth testing.' },
  { a: 'Maximum intensity', b: 'Chosen intensity', d: 'Gentler, greener profiles might bring in people who avoid mouthwash today.' },
  { a: 'Daily chore', b: 'Enjoyable routine', d: 'A bit of fun in the flavor might get kids to rinse without being asked.' },
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
  // The lineup as Matt confirmed it on October 27, in tasting order. The Mystery Flavor is tasted last and the room
  // guesses its fruits before the reveal; `mystery` marks it everywhere (scorecard, deck, run sheet), not its letter.
  { code: 'A', name: 'Blossom Mint', territory: 'warmcool', note: 'Grapefruit, Lavender, Rose, Spearmint, Wintergreen', base: 'Fresh Breath base', status: 'Botanical direction one' },
  { code: 'B', name: 'Grove Mint', territory: 'warmcool', note: 'Spearmint, Peppermint, Wintergreen, Rosemary, Ylang Ylang, Eucalyptus', base: 'Fresh Breath base', status: 'Botanical direction two' },
  { code: 'C', name: 'Berry Blast', territory: 'ladder', note: 'Blueberry, Blackberry, Raspberry', base: 'Kids base', status: 'Kids direction one' },
  { code: 'D', name: 'Mystery Flavor', territory: 'ladder', note: 'Apple, Grape, Cherry, Strawberry, Lemon', base: 'Kids base', status: 'Kids direction two: guess the fruits', mystery: true },
];
export const MYSTERY = SAMPLES.find((x) => x.mystery)!.code;
// What can get a next round: the four samples, then the two directions that are not in the tasting.
export const DIRECTIONS = [
  ...SAMPLES.map((x) => ({ id: x.code, label: x.name, sub: `Sample ${x.code}`, territory: x.territory })),
  ...PRIMARY_TERRITORIES.filter((t) => !SAMPLES.some((x) => x.territory === t.id)).map((t) => ({ id: t.id, label: t.name, sub: 'Not in the tasting', territory: t.id })),
];
export const WHO_CHIPS = ['Gen Z', 'Want it milder', 'Families', '55+', 'Dry mouth', 'International', 'Me'];

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
export const SEGMENTS = SURVEY.consumer.options;
const DRY_MOUTH = SEGMENTS[5];
// No launch years: the room sets the sequence, C&D sets the calendar.
// White space: the moments of the day by the consumers in the pre-work. TheraBreath's presence today is our read, to challenge in the room:
// the morning and bedtime rinse for every consumer (the sink), and the dry mouth lozenge on the go. Everything else is open.
export const WHITESPACE = {
  moments: SURVEY.moment.options,
  segments: SURVEY.consumer.options,
  sink: ['Wake-up', 'Wind-down'],
  extra: [[DRY_MOUTH, 'On the go']] as [string, string][],
  today: (segment: string, moment: string) => ['Wake-up', 'Wind-down'].includes(moment) || (segment === DRY_MOUTH && moment === 'On the go'),
  read: 'Our read of where TheraBreath is present today, to challenge: the morning and bedtime rinse, and the dry mouth lozenge on the go.',
};

export const HORIZONS = [{ id: 'Now', label: 'Now', when: 'The next sample round' }, { id: 'Next', label: 'Next', when: 'After the first results' }, { id: 'Future', label: 'Later', when: 'Platforms to keep exploring' }];
export const ROLES = [
  { id: 'Core', job: 'The always-on mints. Retain and carry the clinical claims.', short: 'Always-on mints' },
  { id: 'Expanders', job: 'Permanent flavors beyond pure mint. Recruit mild-seekers and adventurous adults.', short: 'Permanent, beyond mint' },
  { id: 'Explorers', job: 'Limited editions, seasonal drops, exclusives, collaborations. News, shelf space, trial.', short: 'Limited editions and drops' },
  { id: 'Specialists', job: 'Need-states where flavor is part of the benefit: dry mouth, night, kids, sensitive.', short: 'Need-states: dry mouth, night, kids' },
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
  { t: 'An owner for each direction', d: 'Before we leave today, each direction gets a TFF owner, a C&D reviewer, a base and a next sample step.' },
  { t: 'The write-up within 8 business days', d: 'Today\'s scores, choices, owners and dates in one document, sent to everyone here.' },
  { t: 'The next round of samples', d: 'We make the next round in your bases and review it with you in January 2027.' },
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

// The run of show: one source for the agenda (site and pre-brief), the presentation's chapter times, and the hosts'
// run sheet. `obj` is the objective from Ross's invitation the block answers. The notes stay off the
// site and the pre-brief: they are for the presentation and the run sheet. Phones vote four times (trends, tasting,
// next round, ideas); the paper scorecard and hand votes on the laptop cover anyone without a phone.
export type Block = { id: string; t: string; end: string; title: string; obj?: string; slides: string; does: string };
export const RUN: Block[] = [
  { id: 'welcome', t: '10:00', end: '10:10', title: 'Welcome, who we are, and your four objectives',
    slides: 'Arrival, Title, Who we are, From July to today, Your four objectives, Your pre-brief answers (only if answers came in), Why we are here',
    does: 'While people sit down, the arrival screen shows the QR code and how many phones have joined. Thank Ross for the invitation. Introduce the four of us and recap July. Read Ross\'s four objectives and his goal. Show the pre-brief answers if any came in. Then why we are here: TheraBreath took the burn out of mouthwash, and the next job is giving more people a reason to want it.' },
  { id: 'market', t: '10:10', end: '10:25', title: 'What’s changing: your portfolio, the market and seven trends', obj: '01',
    slides: 'Part 1, 86 out of 100 households, The portfolio today, What competitors are launching, Seven trends, Vote: the three that matter most',
    does: 'Start with the household gap. Walk the portfolio and what competitors are launching. Seven trends, one per click. Then everyone votes for three on their phone; click a bar to add a hand vote for anyone without one. The top three go into the Playbook. Ask what we missed.' },
  { id: 'school', t: '10:25', end: '10:40', title: 'Flavor School and four directions', obj: '02',
    slides: 'Part 2, What flavor is, How cooling works, Flavor and OXYD-8, How a TheraBreath flavor is built, Four directions, then one scene per direction',
    does: 'Taste, smell and feel. How cooling works. Why OXYD-8 is a hard place for flavor to live, and how a TheraBreath flavor has to finish. Then the four directions on one map, and one at a time. Two of them have samples in the tasting. The other two are for discussion.' },
  { id: 'tasting', t: '10:40', end: '11:00', title: 'A blind tasting in your bases', obj: '02',
    slides: 'The blind tasting, Where each sample landed, Vote: what gets a next round',
    does: 'Pour A and B in the Fresh Breath base, C and D in the Kids base. Everyone scores each sample on their phone or the paper scorecard, and the scores fill the screen as they come in. D is the Mystery Flavor, so ask for fruit guesses before the names go up. Then the chart of where each sample landed, and everyone places five chips on what should get a next round.' },
  { id: 'concepts', t: '11:00', end: '11:20', title: 'From samples to concepts', obj: '03',
    slides: 'Part 3, Concepts, Vote: which ideas to develop',
    does: 'Take the directions with the most chips and write up to three concepts together. For each one: where it starts, who it is for, the moment, its role in the range, the format, and whether it grows loyal users, new users or both. Type them straight into the cards on screen. Then everyone gets three dots on their phone to vote for the ones to develop.' },
  { id: 'pipeline', t: '11:20', end: '11:40', title: 'White space, then Now, Next, Later', obj: '04',
    slides: 'Part 4, Where TheraBreath fits in a day, Now, Next, Later',
    does: 'Walk the grid of moments in a day. Click a cell to mark where TheraBreath is today and where each concept would go. Then put each concept and direction under Now, Next or Later, with a TFF owner, a C&D reviewer, the base and the next sample. The top votes sit in a tray beside the board.' },
  { id: 'close', t: '11:40', end: '12:00', title: 'What we decided, next steps, and a short film before lunch',
    slides: 'What we decided, What happens next, THE FLAVOR RACE, Lunch',
    does: 'The Playbook pages fill in from the votes and the board. Read the plan back with owners. Go through the three next steps and say thank you. At 11:48, THE FLAVOR RACE (2:26), lights down and sound up. Then lunch, hosted by Church & Dwight.' },
];
export const AGENDA: [string, string, string?][] = RUN.map((b) => [b.t, b.title, b.obj]);

// The presentation opens each of Ross's four objectives in his words; these are the talking points in its notes and the
// questions its discussion scenes ask the room. It is a discussion, so nothing here is a script. Facts only from
// elsewhere in this file.
const MINT = PORTFOLIO.filter((v) => /mint/i.test(v.flavor)).length;
export const TOPICS = [
  { title: 'What\u2019s changing',
    points: [`${MINT} of TheraBreath\u2019s ${PORTFOLIO.length} flavors are mint.`, '86 out of 100 US households don\u2019t buy TheraBreath yet.', 'Competitors are adding flavors, mostly as limited editions.', 'Seven trends we think matter for oral care.'],
    questions: ['Which three trends matter most for TheraBreath?', 'What are you seeing that we missed?'] },
  { title: 'Where flavor could go',
    points: ['Most of what people call flavor is smell. The rest is how it feels.', 'OXYD-8 is hard on flavor, so everything we make has to hold up in it.', 'Four directions. Two of them are in the tasting.', 'Four samples, made in your Fresh Breath and Kids bases.'],
    questions: ['Which direction feels most like TheraBreath, and which one stretches it the most?', 'What would make TheraBreath\u2019s flavors different from what competitors are launching?'] },
  { title: 'What we could make',
    points: ['Start from the samples and directions that did well.', 'For each concept: who it is for, when they would use it, its role in the range, the format, and what it grows.', 'Up to three concepts.'],
    questions: ['Which moment of the day is TheraBreath missing?', 'Who could a new flavor bring in?'] },
  { title: 'What to do first',
    points: ['Where TheraBreath shows up in a day now, and where the concepts could fit.', 'Now, Next and Later: the next sample round, after the first results, and ideas to keep exploring.', 'Every direction leaves with a TFF owner, a C&D reviewer, a base and a next step.'],
    questions: ['What should go first, and what has to be true for it to work?', 'What would you need to see in the next round of samples?'] },
];

// The four of us, as the pre-brief letter introduces us (names and titles confirmed by Matt on October 27). Who presents
// which part is not shown anywhere.
export const TEAM = [
  { name: 'Dan Wixted', title: 'President' },
  { name: 'Alex Wixted', title: 'Business Operations' },
  { name: 'Ryan Wixted', title: 'QC/QA Manager' },
  { name: 'Matt Wixted', title: 'Production Manager' },
];

// Ross, in his own words (invitation, September 18, 2026).
export const ROSS_WORDS = {
  capabilities: 'creativity, technical expertise, and innovation capabilities',
  roadmap: 'explore new possibilities and define a compelling innovation roadmap together',
};
