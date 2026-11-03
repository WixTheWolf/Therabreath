# Generation jobs for the V2 opening film

Higgsfield job IDs, so any clip can be re-downloaded or regenerated from the same still.
Stills: GPT Image 2.5, 2K, high. Motion: Cinema Studio Video (v2, pro, silent, 5 s) unless noted.
Clips and audio live in `public/fof2/` (not committed). `public_v2/` holds hardlinks to just what V2 renders with,
so bundling copies about 270 MB instead of the whole 3.4 GB public folder.

| Shot | Still | Motion | Speed ramp |
|---|---|---|---|
| drip | e17eb77e-df87-4168-8c4a-c12854ce7f27 | c70062e4-c5d4-417d-8aba-10af728e9a29 | slowmo |
| crown | 4292fe84-9e35-4cd8-a0dd-2b31b380e6db | f5f642ee-2899-4f01-8d60-f2a8acbc7f7a (Kling 4.0, used) / bf4dccfc-4e49-47c3-84c0-a665ca2f1a1e | slowmo |
| iceburst | cb7e7b5c-08b2-4426-9acc-39b19f9e1d11 | 5e5f08bb-490f-4e2a-a6fb-806eb13a62d2 | slowmo |
| swirl | 802adc06-6ff5-4926-b596-e9794569164e | e1c35b9a-efd2-4367-b2c1-7196501c71f2 | slowmo |
| dots | 02b6f759-52e1-4252-a399-dccc63d5e271 | 4622d7cc-d413-44c1-b0f5-730eeefbc43a (slowed 1.8x, minterpolate) | linear |
| dewdrop | 7e2406a2-b2a7-4e08-9c98-1afe85ed655f | 1af0f642-4412-40d9-9fab-b9f8eaccc05c | linear |
| lab | 8fc13b37-4ddd-496f-8076-be3d15904bcd | 233b8660-037a-4f87-a6e0-e24aa97e0373 | linear |
| caustic | 676e5f26-6d07-4ea5-9a93-cfc2b7fde8b1 | 7b04c622-3541-4f37-8e16-e7be5bab6b52 (slowed 1.7x) | linear |
| prism | 9a70c0bc-cf44-4323-a74f-07487a999671 | c943de6e-669c-4b93-b2c7-d7bba4c659aa | linear |
| frost | 86598dc1-fe2a-4cbd-ace0-8ab7cba64c35 | d56f6699-e92d-42b4-9d1c-559e20053649 | speedup |
| bubbles | cb382658-94ed-457e-9bbf-92c92b67705e | 7d358d79-e603-4527-8c98-8b6947adda30 | linear |
| herbs | 1c3daa88-423d-4eeb-9e3f-00cc8fb75acf | 9006ab89-6ed3-4be8-a2c4-8d9af41f5a90 | slowmo |
| citrus | ec2b2439-0019-4ab2-b6e4-f68f40889a70 | 8e0a4e45-d35a-47fc-b8cb-dbcc98ee1c96 | slowmo |
| cucumber | b4b26d99-0830-48c7-8ed0-3bbc73c12cad | 29a85da6-dbb4-42d9-89ef-293f7e31af3e | slowmo |
| spheres | c6abae0b-e0a4-4df6-a6ea-cb153523967f | f55db5ed-d1a5-4779-b35f-d67b747a8a23 | slowmo |
| cups | 239d5123-d475-4098-8c6d-455ccc413161 | 800a313a-52ee-425e-8958-708f872af3ea | linear |
| bloom | 5d1bbbae-db31-4eca-a8d5-56f3849e6e75 | c9cdf697-81e3-4f73-ac90-39dd19e5274a | slowmo |
| vessels | 0b7362db-7069-4bd9-8fc7-180f36690702 | 4f736cc7-d68a-4ff9-8ea4-67eca8d01539 | linear |
| book | e2d3d7db-7425-4848-8d27-19b18a3025a7 | still only (cover type set in Remotion) | |
| sphere | 0ab63de5-e8c5-47d4-8eff-6d44c4567e0c | 0a4f63bd-a435-4866-aad9-cc7e725950d8 (slowed 2.3x) | slowmo |

ElevenLabs flow kG2RAwP61iASrx2mi3jU: voice take A (generation TnON8CIQN1Lkla4Xcqbk, "Elizabeth Anne", v4),
score take 1 (wH8ktexW10SaK0EfBKW6, Music v2.5, 80 s), effects: impact (fCzf2M2hm8jfKxdd70Fo, 5CsLbaBFLDiZBsruOhrT),
whoosh (e9F2LkjCuAgIYG60z8Fb, TpAHi8Y3vgrVjTKtb3Tj), ice (YqT4NPM9Yp4teb2QUil2), riser (u8XazEV9zjToGxE1WEJ4).

```bash
npx remotion render src/index.ts FutureOfFreshnessV2 out/fof2/pic.mp4 --muted --public-dir=public_v2 --concurrency=4 --crf=16
python3 scripts/fof2_mix.py out/fof2/mix_raw.wav <ffmpeg>   # then volume=3.6dB + alimiter: about -16 LUFS, -1.5 dBTP
npx remotion render src/index.ts FutureOfFreshnessV2Loop out/fof2/loop.mp4 --muted --public-dir=public_v2 --crf=24
```
