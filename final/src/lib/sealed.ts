// The blind tasting's sealed details: each sample's name and what's in it, and the pair each tasted platform holds.
// Server only. The team's pages (the presentation, the old Stage, the Console) get these as props, and the room's phones
// and the Playbook get them from the `reveal` event the presentation sends when it flips the names. Never import this
// from a 'use client' file; tests/sealed.test.mjs checks, and checks that no browser bundle carries a name.
import type { Sealed } from './content';

// The last build of the thank-you card: "One last thing. The Mystery Flavor was ..." with this line. Ryan supplies it, or
// it stays empty and the build skips itself. Shown on the TV only: never on the phones, the results page or the write-up.
export const MYSTERY_REVEAL = '';
export const SEALED: Sealed = {
  samples: {
    A: { name: 'Berry Blast', note: 'Blueberry, Blackberry, Raspberry' },
    B: { name: 'Mystery Flavor', note: 'Apple, Grape, Cherry, Strawberry, Lemon' },
    C: { name: 'Blossom Mint', note: 'Grapefruit, Lavender, Rose, Spearmint, Wintergreen' },
    D: { name: 'Grove Mint', note: 'Spearmint, Peppermint, Wintergreen, Rosemary, Ylang Ylang, Eucalyptus' },
  },
  heroes: { warmcool: 'Blossom Mint + Grove Mint', ladder: 'Berry Blast + Mystery Flavor' },
  flavors: {
    warmcool: ['Grapefruit, Lavender, Rose, Spearmint, Wintergreen', 'Spearmint, Peppermint, Wintergreen, Rosemary, Ylang Ylang, Eucalyptus'],
    ladder: ['Blueberry, Blackberry, Raspberry', 'A mystery fruit blend'],
  },
};
