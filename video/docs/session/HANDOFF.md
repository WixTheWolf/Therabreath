# THE FLAVOR RACE: session handoff (after V12)

## State
- Locked V12 cut: `src/FlavorRaceV12.tsx` (registered in `src/Root.tsx` as FlavorRaceV12). 2:12.5.
- V12 review copy: `docs/session/flavor-race-v12-review.mp4` (720p, -16.1 LUFS, LRA 7.2, -1.2 dBTP).
- Clips used by V12 plus V13 candidates are force-added under `public/race/clips/` (the folder is otherwise ignored). Everything else in that folder was not backed up.
- Sound engine: `sound/cues12.py` (SFX stem), `sound/events12.py` (music automation), `sound/mix2.py` (`CUT=12`). Libraries in `sound/lib`, `sound/raw`, `sound/wav` are force-added.
- Higgsfield SDK example: `higgsfield/index.ts` (`npx tsx higgsfield/index.ts`). Reads `HF_CREDENTIALS` (key-id:key-secret) from the environment or `video/.env.local` (ignored, never commit). In the cloud environment the key is configured as a proxy credential for `api.higgsfield.ai` (`Authorization: Key ...`), so the env var may be absent; the script needs a placeholder fallback for that case (not yet changed).

## Commands
- Picture: `npx remotion render src/index.ts FlavorRaceV12 out/x.mp4 --muted --concurrency=3 --props='{"stem":"none"}'`
- Stems: `--codec=wav --props='{"stem":"music"}'` and `"vo"`. Run renders one at a time (memory).
- SFX: `cd sound && python3 cues12.py ../out/race12_sfx.wav`
- Mix: `CUT=12 PRESENT=1 TARGET=-16 CEIL=-1.2 STEMS=1 python3 mix2.py pic music sfx vo out.mp4`

## V13 brief (from the V12 review)
- Target 1:58 to 2:03. Remove partnership card, cap macro, button and nozzle inserts, topdown, fruit and crystal discovery shots, touchscreen, green glow, glass-tube refuel.
- Discovery chain: particles past TheraBreath, lean, drop, prism, canister seal (`w/s1_fuel` 9.5 to 12.5), reignition, hero overtake, competitor thrust flicker (no smoke).
- Silhouette 2.5 to 3 s, competitor gag about 2 s, one shot home, tactile tasting reveal in The Flavor Factory with no robot (`v13/t1_tasting` has 5 glasses; want 6). No taste line.
- Real silences, LRA toward 9 to 10 LU. One clean end card about 4 s with larger logos.
- Generations still needed: six-glass tasting retake, aromatic particles in orbit, clean reignition, hero overtake, competitor flicker. About 290 Higgsfield credits approved.

## Standing rules
No em or en dashes (`node playbook/scripts/check-dashes.mjs`). No faces. Locked hero bottle (white, short ribbed orange cap). Rival labelled only COMPETITOR. Real logos unaltered. On-screen text as overlay only. No product claims. The Mr. Blue Sky file stays private and uncommitted. Ask before spending credits.
