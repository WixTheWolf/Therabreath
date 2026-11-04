// The TheraBreath products on shelf today that carry a Flavor Factory flavor (from our portfolio record, November 4,
// 2026), for the slide after Who we are. Flavor names only: usage levels and flavor codes are formula details and
// never go on a slide, a talking point or a PDF. `line` is the product line as printed on the bottle's own label.
// The bottle photos (public/img/bottles) are TheraBreath's own product shots, cut down to the bottle alone: 13 from
// our portfolio page (therabreath.com, and Walmart for Grapes Galore) and Peppermint Vanilla from its Target listing,
// checked November 4, 2026.
export type OurProduct = { flavor: string; line: string; img: string };
export const OUR_RINSES: OurProduct[] = [
  { flavor: 'Clean Mint', line: 'Healthy Gums', img: 'clean-mint' },
  { flavor: 'Dazzling Mint', line: 'Whitening Fresh Breath', img: 'dazzling-mint' },
  { flavor: 'Invigorating Icy Mint', line: 'Fresh Breath', img: 'invigorating-icy-mint' },
  { flavor: 'Mild Mint', line: 'Fresh Breath', img: 'mild-mint' },
  { flavor: 'Overnight', line: 'Overnight', img: 'overnight-rinse' },
  { flavor: 'Peppermint Vanilla', line: 'Fresh & Festive', img: 'peppermint-vanilla' },
  { flavor: 'Rainforest Mint', line: 'Fresh Breath', img: 'rainforest-mint' },
  { flavor: 'Revitalizing Mint', line: 'Complete', img: 'revitalizing-mint' },
  { flavor: 'Sparkle Mint', line: 'Anticavity', img: 'sparkle-mint' },
  { flavor: 'Tingling Mint', line: 'Dry Mouth', img: 'tingling-mint' },
];
export const OUR_KIDS: OurProduct[] = [
  { flavor: 'Bubble Gum', line: 'Kids Anticavity', img: 'bubble-gum' },
  { flavor: 'Grapes Galore', line: 'Kids Anticavity', img: 'grapes-galore' },
  { flavor: 'Strawberry Splash', line: 'Kids Anticavity', img: 'strawberry-splash' },
  { flavor: 'Wacky Watermelon', line: 'Kids Anticavity', img: 'wacky-watermelon' },
];
export const OUR_COUNT = OUR_RINSES.length + OUR_KIDS.length;
