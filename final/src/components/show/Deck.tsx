'use client';
// The slides of the 22-slide morning that are new or merge what used to be two or more: Who we are with July, the
// TheraBreath products our flavors are in today, the shelf, the trends as a vote first, Flavor School (flavor and sodium
// chlorite), the four directions with their profile cards, and where each sample landed next to the chips vote. Built
// for talking with the room: one question on screen where there is one, and nothing to type.
import React, { useEffect, useState } from 'react';
import { R, Enter, Src, SceneProps, clean } from '../scenes/ui';
import { CoolingPlot } from '../scenes/School';
import { POS } from '../scenes/Territories';
import { LiveCtx, OBJ_HUE, directionName } from './ShowScenes';
import {
  TEAM, SCIENCE, IMAGINATION, JULY, PORTFOLIO, MARKET, SOURCES, SIGNALS, PRIMARY_TERRITORIES as TERRITORIES, SAMPLES, DIRECTIONS, RUN, MOLECULES, type Signal,
} from '@/lib/content';
import { prebrief, said } from '@/lib/prebrief';
import { tallyPick, ranked, voteCounts, tasteSummary, tasters, places, topIds, placeLabel, SessionState } from '@/lib/state';
import { OUR_RINSES, OUR_KIDS, OUR_COUNT, type OurProduct } from '@/lib/ourFlavors';

const useLive = () => React.useContext(LiveCtx)!;
const tally = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const byHandNote = (n: number, one: string, many: string) => (n ? ` · ${n} ${n === 1 ? one : many} by hand` : '');
const Ask = ({ q, b, step, className = '' }: { q: string; b?: number; step: number; className?: string }) => (
  <R b={b ?? 0} step={step} className={'room-ask ' + className}><span className="k">For the room</span><p>{q}</p></R>
);

// 2. Who we are, since July. The four of us, then the three things Ross asked to see, in his words: technical expertise
// (the lab, and our flavors already in their rinses), creativity (the four samples made in their bases) and innovation
// (what we bring in from outside oral care). Build 1 (optional, S skips it) brings in July's four themes with Growth,
// November, lighting up.
const TASTE_AT = RUN.find((b) => b.id === 'tasting')?.t || '10:40';
export function TeamSince({ step }: SceneProps) {
  const still = !!useLive()?.still;
  const [lit, setLit] = useState(false);
  useEffect(() => { if (step < 1) return setLit(false); if (still) return setLit(true); const t = setTimeout(() => setLit(true), 900); return () => clearTimeout(t); }, [step, still]);
  return (
    <div className="st ts">
      <img className="st-img" src="/img/lab-bench.webp" alt="" />
      <div className="pad">
        <Enter i={0}><div className="k">The Flavor Factory · Norco, California</div></Enter>
        <Enter i={1}><h2 className="h1">Hi. <span className="it">We’re The Flavor Factory.</span></h2></Enter>
        <div className="ts-people">
          {TEAM.map((t, i) => <Enter key={t.name} i={2 + i} className="st-person"><b>{t.name}</b><span className="k">{t.title}</span></Enter>)}
        </div>
        <Enter i={6} className="ts-lines ts-three">
          <div className="ts-line sci"><span className="k">Technical expertise</span><div className="st-chips">{SCIENCE.map((x) => <span key={x}>{x}</span>)}</div><p className="ts-note">Our flavors in {OUR_COUNT} of your rinses</p></div>
          <div className="ts-line cre"><span className="k">Creativity</span><p className="ts-note big">Four new samples made in your bases. You’ll taste them at {TASTE_AT}.</p></div>
          <div className="ts-line ima"><span className="k">Innovation</span><div className="st-chips">{IMAGINATION.map((x) => <span key={x}>{x}</span>)}</div></div>
        </Enter>
        <Enter i={7} className="ts-judge"><p className="h3 it">Today you get to judge all three.</p></Enter>
        {step >= 1 && (
          <div className="july ts-july">
            {JULY.map((w, i) => (
              <div key={w} className={'jf' + (i === 4 ? ' grow' : '') + (i === 4 && lit ? ' lit' : '')} style={{ ['--i' as any]: i }}>
                <span className="num">0{i + 1}</span><b>{w}</b><em>{i === 4 ? 'November' : 'July'}</em>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 3. Our flavors in your range: every TheraBreath product on shelf today with a Flavor Factory flavor in it, as its
// own bottle on one shelf, the rinses and then the kids rinses. Flavor names only: usage levels and flavor codes never
// go on this slide.
// Two get a quiet highlight: Peppermint Vanilla, the seasonal one the question is about, and Tingling Mint, the dry mouth
// rinse trend 7 comes back to.
const HIGHLIGHT = ['Peppermint Vanilla', 'Tingling Mint'];
const Bottles = ({ label, items, from }: { label: string; items: OurProduct[]; from: number }) => (
  <div className="of-g" style={{ flexGrow: items.length }}>
    <Enter i={2} className="of-gl"><span className="k">{label}</span></Enter>
    <div className="of-row">
      {items.map((p, j) => (
        <figure key={p.img} className={'of-b' + (HIGHLIGHT.includes(p.flavor) ? ' hl' : '')} style={{ ['--i' as any]: from + j }}>
          <div className="of-img"><img src={`/img/bottles/${p.img}.webp`} alt={`TheraBreath ${p.line} rinse, ${p.flavor}`} /></div>
          <figcaption><b>{p.flavor}</b>{p.line !== p.flavor && <span>{p.line}</span>}</figcaption>
        </figure>
      ))}
    </div>
  </div>
);
export function OurFlavors() {
  return (
    <div className="pad of">
      <div className="of-head">
        <Enter i={0}><div className="k">The Flavor Factory in TheraBreath</div></Enter>
        <Enter i={1}><h2 className="h2 of-title">You already know our work. <span className="it">It’s in {OUR_COUNT} TheraBreath rinses on shelf today.</span></h2></Enter>
      </div>
      <Enter i={3} className="room-ask of-ask"><span className="k">For the room</span><p>Peppermint Vanilla is the festive one here. What did it teach you about seasonal flavors?</p></Enter>
      <div className="of-shelf">
        <Bottles label="Oral rinses" items={OUR_RINSES} from={0} />
        <Bottles label="Kids rinses" items={OUR_KIDS} from={OUR_RINSES.length} />
      </div>
      <Src k={['tffport', 'bottles']} />
    </div>
  );
}

// 8. The shelf. Left: TheraBreath's range as dots, one per product (mint in blue, everything else in amber), a row per
// format, with only the flavors that aren't mint named, so the point reads from the back of the room. It counts products,
// not flavors, since one flavor can be sold in several formats. Right: what competitors have launched (TheraBreath's own
// Target exclusive is in the talking points, not among the competitors), with their sources on one line. Build 1: where
// could flavor add something useful? Build 2: where TheraBreath stands, as a question rather than a verdict.
const SHELF_FORMATS = ['Rinse', 'Toothpaste', 'Kids', 'Lozenge', 'Gum', 'Sachet'];
const isMint = (flavor: string) => /mint/i.test(flavor);
const RIVAL_SOURCES = 'Dentistry Today (July 2025 and March 2026), Kenvue (June 2026), CTV News, License Global and DesignRush (Hismile)';
export function Shelf({ step }: SceneProps) {
  const mint = PORTFOLIO.filter((v) => isMint(v.flavor)).length;
  const formats = SHELF_FORMATS.filter((f) => PORTFOLIO.some((v) => v.format === f));
  const rivals = MARKET.filter((m) => m.who !== 'TheraBreath');
  return (
    <div className="pad shelf">
      <div className="sh-left">
        <Enter i={0}><div className="k">Your portfolio today</div></Enter>
        <Enter i={1}><h2 className="h2 sh-title">Mint is home base: {mint} of {PORTFOLIO.length} products.</h2></Enter>
        <div className={'sh-rows' + (step >= 1 ? ' sh-lit' : '')}>
          {formats.map((f, r) => {
            const vs = PORTFOLIO.filter((v) => v.format === f).sort((a, b) => Number(isMint(b.flavor)) - Number(isMint(a.flavor)));
            const others = vs.filter((v) => !isMint(v.flavor));
            const nMint = vs.length - others.length;
            return (
              <Enter key={f} i={2 + r} className="sh-row">
                <span className="k">{f}</span>
                <div>
                  <div className="sh-dots" aria-hidden="true">{vs.map((v, j) => <i key={j} className={isMint(v.flavor) ? 'mint' : 'other'} />)}</div>
                  <span className="sh-note">{others.length ? <><b>{others.map((v) => v.flavor).join(', ')}</b>{nMint ? `, and ${nMint} mint` : ''}</> : `${vs.length}, all mint`}</span>
                </div>
              </Enter>
            );
          })}
        </div>
        <Enter i={2 + formats.length} className="sh-key"><span><i className="mint" />Mint</span><span><i className="other" />Everything else</span></Enter>
        <R b={1} step={step} className="room-ask sh-ask"><span className="k">For the room</span><p>Gentle is TheraBreath’s ground, and Listerine is moving onto it. What’s the next thing only TheraBreath can own?</p></R>
      </div>
      <div className="sh-right">
        <Enter i={1}><h3 className="h3 sh-rt">Competitors are moving onto your ground.</h3></Enter>
        <ol className="sh-launch">
          {rivals.map((m, i) => (
            <Enter key={i} i={2 + i} className="sh-mk">
              <span className="sh-when">{m.when}</span>
              <div><b>{m.who}</b><p>{m.what}</p></div>
            </Enter>
          ))}
        </ol>
        <Enter i={2 + rivals.length}><p className="src sh-srcs">Sources: {RIVAL_SOURCES}</p><Src k="listings" style={{ position: 'static', marginTop: 8 }} /></Enter>
      </div>
      <R b={2} step={step} className="mk-turn sh-turn">
        <span className="k">What’s already yours</span>
        <p>TheraBreath has been alcohol-free and dye-free from the start, its original rinse is made with sodium chlorite, and it already has a kids line. <span className="it">Finish the sentence: “I’d choose TheraBreath for its flavor if it&hellip;”</span></p>
      </R>
    </div>
  );
}

// 9. Seven trends: vote, then discuss. All seven show at once as one line each with where the evidence comes from, and
// the phones vote for three straight away while the bars fill. Builds 1 to 3 open the top three one at a time (the
// vote closes on build 1 and reopens if we go back); the other four stay as one line. The keys 1 to 7 open any trend
// in the same panel for more discussion (`pick`, from ShowApp), and the same key again goes back to the build.
export function topTrends(s: SessionState) {
  const t = tallyPick(s, 'signals');
  const voted = ranked(t).filter(([, n]) => n > 0).map(([id]) => id);
  // Fewer than three with votes: the rest come in list order, so every build has a trend to open.
  return [...voted, ...SIGNALS.map((x) => x.id).filter((id) => !voted.includes(id))].slice(0, 3).map((id) => ({ sig: SIGNALS.find((x) => x.id === id)!, n: t[id] || 0 }));
}
// The question for a trend. Three quote the room's own pre-brief when the answer is there (the top occasion for trend 4,
// two off-brand answers for trends 5 and 6), and otherwise fall back to the trend's own question.
export function trendAsk(sig: Signal, s: SessionState) {
  const pb = prebrief(s);
  if (sig.id === 'botanical' && pb.topOccasion) return `Chamomile already has bedtime. You told us “${pb.topOccasion.label}.” What should that taste like?`;
  if (sig.id === 'allure' && said(pb.answers, 'too fun for that')) return 'One of you wrote: clinical solutions, we are too fun for that. Where does fun stop for TheraBreath?';
  if (sig.id === 'sensation' && said(pb.answers, 'tangible signal of freshness')) return 'One of you asked for a tangible signal of freshness for the modern era. What is it: cold, tingle or something nobody has done yet?';
  return sig.ask;
}
export function TrendVote({ s, step, pick = 0 }: SceneProps) {
  const t = tallyPick(s, 'signals');
  const c = voteCounts(s, 'signals');
  const max = Math.max(1, ...Object.values(t));
  const top = topTrends(s);
  const pl = places(t), cut = topIds(t);
  const k = Math.min(3, Math.max(0, step));
  const picked = pick ? SIGNALS.find((x) => x.n === pick) || null : null;
  const focus = picked ? { sig: picked, n: t[picked.id] || 0 } : k > 0 ? top[k - 1] : null;
  // Anything tied with the third is lit too, and the kicker says so: the room picks which one to open.
  const isTop = (id: string) => step >= 1 && (top.some((x) => x.sig.id === id) || cut.includes(id));
  const votes = c.phones + c.hand;
  const label = (id: string) => (t[id] ? placeLabel(pl[id]) : 'To discuss');
  return (
    <div className="signal sigs tv" style={{ ['--h' as any]: focus ? focus.sig.hue : OBJ_HUE[0] }}>
      <div className="sig-light" style={{ opacity: focus ? 1 : 0.35 }} />
      <div className="pad" style={{ position: 'relative' }}>
        <Enter i={0}><div className="k">{step === 0 ? `Vote on your phone · pick three · ${tally(c.phones, 'vote', 'votes')} so far${byHandNote(c.hand, 'vote', 'votes')}` : votes ? `The vote is in · ${tally(votes, 'vote', 'votes')}${cut.length > 3 ? ' · a tie: pick which three to open' : ''}` : 'No votes came in · three trends to discuss'}</div></Enter>
        <Enter i={1}><h2 className="h2">Seven trends. <span className="it">You pick three.</span></h2></Enter>
        <div className="tv-list">
          {SIGNALS.map((x, i) => {
            const n = t[x.id] || 0;
            const on = focus?.sig.id === x.id;
            return (
              <div key={x.id} className={'tv-row' + (on ? ' on' : '') + (isTop(x.id) && !on ? ' top' : '') + (step >= 1 && !isTop(x.id) && !on ? ' dim' : '')} style={{ ['--h' as any]: x.hue, ['--i' as any]: i }}>
                <span className="num">0{x.n}</span>
                <div className="tv-t"><b>{x.title.replace(/\.$/, '')}</b><small className="tv-tag">{x.from}</small></div>
                <div className="tv-bar"><i style={{ width: `${(n / max) * 100}%` }} /></div>
                <b className="num tv-n">{n}</b>
                {isTop(x.id) && <em className="k tv-rank">{label(x.id)}</em>}
              </div>
            );
          })}
        </div>
        {focus ? (
          <div className="sigs-focus tv-focus" key={focus.sig.id}>
            <div className="k">{focus.n ? `${isTop(focus.sig.id) ? label(focus.sig.id) : `Trend ${focus.sig.n} of 7`} · ${tally(focus.n, 'vote', 'votes')}` : `To discuss · trend ${focus.sig.n} of 7`} · Seen in {focus.sig.from === 'Oral care' ? 'oral care' : 'food and flavor'}</div>
            <h3 className="sf-title">{focus.sig.title}</h3>
            <div className="sf-proofs">{focus.sig.proofs.map((p, i) => <div key={i} className="proof" style={{ ['--d' as any]: `${i * 180}ms` }}><p>{p.t}</p><div className="src">{clean(SOURCES[p.src])}</div></div>)}</div>
            <div className="sig-so"><span className="k">What it could mean for TheraBreath</span><div className="h3 it">{focus.sig.so}</div></div>
            <div className="tv-ask"><span className="k">For the room</span><p>{trendAsk(focus.sig, s)}</p></div>
          </div>
        ) : (
          <div className="sigs-hint tv-hint">Vote first. Then we’ll open your top three, one at a time.</div>
        )}
      </div>
    </div>
  );
}

// 11. Flavor School, as three things we design for, from our bench: seven molecules of freshness, numbered 1 to 7 to match
// a tray of smelling strips (optional, S skips it; added November 6 in place of taste, aroma and feel, which moved to the
// talking points), cooling has an onset and a linger (drawn, with no times on the axis), and the flavor has to work in
// the actual base through shelf life. One slide, three states, each ending on a question for the room. Ryan's Flavor
// School words, made more careful after the November 4 review and made plainer on November 5 (the same three points:
// no causal story about sodium chlorite, no claim that we control the base, no percentages); Ryan signs off the science
// and the notes together. Nothing moves behind the words: the molecule field that used to drift under the third state
// made the copy hard to read, so it's gone.
const FS = ['On the strip', 'The chill', 'Your base'];
export function FlavorSchool({ step }: SceneProps) {
  const levers = ['Choose materials that suit the base', 'Blend the flavor in and protect what’s fragile', 'Check it holds up in the base we agree on'];
  const at = Math.min(2, step);
  return (
    <div className="fs">
      <div className="pad fs-head">
        <Enter i={0}><div className="k">From our bench: three things we design for</div></Enter>
        <ol className="fs-steps">{FS.map((x, i) => <li key={x} className={i === at ? 'on' : i < at ? 'done' : ''}><span className="num">0{i + 1}</span>{x}</li>)}</ol>
      </div>
      <div className={'fs-state mols' + (at === 0 ? ' on' : '')}>
        <div className="pad">
          <h2 className="h1 fs-h">Seven molecules <span className="it">of freshness.</span></h2>
          {/* Numbered 1 to 7 to match the labeled smelling strips on the tray: strips only, not for tasting. */}
          <ol className="fs-mols">
            {MOLECULES.map((m, i) => <li key={m.id} style={{ ['--i' as any]: i }}><span className="num">{i + 1}</span><div><b>{m.name}</b><span className="k">{m.source}</span><p>{m.note}</p></div></li>)}
            <li className="fs-molq"><div className="room-ask"><span className="k">For the room</span><p>Which one says clean to you? Which one says medicine?</p></div></li>
          </ol>
        </div>
      </div>
      <div className={'fs-state cooling' + (at === 1 ? ' on' : '')}>
        {step >= 1 && (
          <div className="pad">
            <div className="cool-copy">
              <h2 className="h1">Cool has<br />a shape.</h2>
              <p className="h3 it accent">How fast the chill arrives, and how long it stays. We can work on both.</p>
              <div className="src fs-drawn">An illustration, not data from these samples.</div>
              <div className="room-ask fs-q"><span className="k">For the room</span><p>Quick blast or slow build: which feels more like TheraBreath?</p></div>
            </div>
            <CoolingPlot shown={3} frost />
          </div>
        )}
      </div>
      <div className={'fs-state oxyd' + (at === 2 ? ' on' : '')}>
        {step >= 2 && (
          <div className="pad">
            <div className="fs-col">
              <h2 className="h2 fs-ox">A flavor isn’t done until <span className="it">it works in your base.</span></h2>
              <p className="h3 it accent fs-sub">From the first rinse to the last day of shelf life.</p>
              <div className="k fs-ctl">How we get there</div>
              <ol className="levers fs-list">{levers.map((l, i) => <li key={l} className="lever" style={{ animationDelay: `${300 + i * 160}ms` }}><span className="num">0{i + 1}</span>{l}</li>)}</ol>
              <p className="fs-pay">And whatever we make has to finish clean.</p>
              <Ask step={step} q="What’s the toughest flavor you’ve tried to keep alive in a sodium chlorite base?" className="fs-ask" />
            </div>
            <Src k="patent" style={{ position: 'absolute', left: 120, bottom: 118 }} />
          </div>
        )}
      </div>
    </div>
  );
}

// 12. Four directions. The map (familiar to adventurous, gentle to bold, our view) with all four; builds 1 to 4 open
// each direction's profile card. Clicking a direction on the TV opens its card; clicking it again goes back to the map.
// Global Brightness and Modern Clean (builds 2 and 3) are the optional ones the short version skips. The empty gentle,
// adventurous corner, where the glow sits, is labeled as a question, and the question for the room follows the
// pre-brief's lean when the room leans adventurous.
export function DirectionsMap({ s, step }: SceneProps) {
  const live = useLive();
  const adventurous = !!prebrief(s).lean?.adventurous;
  const W = 1160, H = 700;
  const t = step >= 1 ? TERRITORIES[step - 1] : null;
  const tasted = (id: string) => SAMPLES.some((x) => x.territory === id);
  const open = (n: number) => { if (!live.still) live.goStep(step === n ? 0 : n); };
  return (
    <div className={'pad dm' + (t ? ' open' : '')}>
      <div className="map-copy dm-copy">
        <Enter i={0}><div className="k">Four directions · our view, not data</div></Enter>
        <Enter i={1}><h2 className="h1">Four ways <span className="it">freshness could go.</span></h2></Enter>
        <Enter i={2}><p className="lede dm-lede">You’ll taste two of them in a few minutes. The other two are up for debate.</p></Enter>
        <Ask step={step} q={adventurous ? 'You told us you lean adventurous. Nothing on our map is. Where should we push?' : 'Nothing on our map sits here yet. What would?'} className="dm-ask" />
      </div>
      <div className="map-plot dm-plot" style={{ width: W, height: H }}>
        <div className="map-glow on" />
        <div className="dm-empty"><span>Nothing here yet.</span><b className="it">What goes here?</b></div>
        <div className="ax ax-x"><span>Familiar</span><span>Character</span><span>Adventurous</span></div>
        <div className="ax ax-y dm-ay"><span>Gentle</span><span>Intensity</span><span>Bold</span></div>
        {TERRITORIES.map((x, i) => {
          const [px, py] = POS[x.id];
          return (
            <button key={x.id} type="button" data-nonav className={'mp dm-pt' + (t?.id === x.id ? ' on' : '')} style={{ left: px * W, top: (1 - py) * H, ['--c1' as any]: x.palette[0], ['--c2' as any]: x.palette[1], ['--i' as any]: 2 + i }}
              onClick={() => open(x.n)} aria-label={`${x.name}: ${t?.id === x.id ? 'back to the map' : 'open its profile'}`}>
              <i /><span className="num">0{x.n}</span><span className="dm-lab"><b>{x.name}</b><small className="k">{tasted(x.id) ? 'In today’s tasting' : 'For discussion'}</small></span>
            </button>
          );
        })}
      </div>
      {t && (
        <section className="dm-card" key={t.id} style={{ ['--c1' as any]: t.palette[0], ['--c2' as any]: t.palette[1], ['--c3' as any]: t.palette[2] }}>
          <div className="dm-hero">{t.image ? <img src={t.image} alt="" style={t.focus ? { objectPosition: t.focus } : undefined} /> : <i />}</div>
          <div className="dm-body">
            <div className="k">Direction {t.n} of 4 · {tasted(t.id) ? 'In today’s tasting' : 'For discussion'}</div>
            <h2 className="dm-name">{t.name}</h2>
            <p className="dm-promise">{t.promise}</p>
            <div className="dm-arc"><span className="k">The flavor arc</span><ol>{t.arc.map((a, i) => <li key={a}><span className="k">{['First', 'Then', 'Finish'][i]}</span><b>{a}</b></li>)}</ol></div>
            <div className="dm-two">
              <div><span className="k">What it tastes like</span><p>{t.signature}</p>{tasted(t.id) && <p className="dm-note">We’ll tell you which samples these are after the tasting.</p>}</div>
              <div><span className="k">Who it’s for</span><p>{t.who}</p></div>
            </div>
            {t.id === 'bright' && <div className="dm-q"><p className="dm-also">Listerine Citrus Mint (March 2026) already pairs grapefruit and yuzu. <span className="src">{clean(SOURCES.dtoday26)}</span></p><div className="room-ask"><span className="k">For the room</span><p>What would a TheraBreath version do that Listerine’s can’t?</p></div></div>}
            {t.id === 'botanical' && <div className="dm-q"><div className="room-ask"><span className="k">For the room</span><p>Mild Mint is already on your shelf. What would make Modern Clean more than milder?</p></div></div>}
          </div>
        </section>
      )}
    </div>
  );
}

// 15. What deserves the next round? The bubble chart from the scores (fit and perceived difference 1 to 5, liking as
// size), with one prompt at a time under it. Build 0 is the talk about the chart: two questions for the room, and the
// chips still closed. Build 1 swaps them for the chip question and opens the chips on the phones: five each on which
// flavors or directions to develop next, the four tasted today, then the two directions not tasted today (grouped the
// same way as on the phones). Build 2 ranks the top three and closes the chips.
export function topDirections(s: SessionState) {
  const t = tallyPick(s, 'directions');
  return topIds(t).map((id) => ({ id, n: t[id], name: directionName(id, s) }));
}
// Letters that would sit on top of each other (close scores, or none yet) are nudged apart around their middle, and the
// key says so. Positions are percents of the plot, which is wider than it is tall, hence the two radii.
const spread = (ps: number[][], rx = 6, ry = 11.5) => {
  const out = ps.map((p) => [...p]); const done = new Set<number>();
  const near = (a: number[], b: number[]) => Math.hypot((a[0] - b[0]) / rx, (a[1] - b[1]) / ry) < 1;
  const edge = (v: number) => Math.max(6, Math.min(94, v));
  ps.forEach((p, i) => {
    if (done.has(i)) return;
    const g = ps.map((_, j) => j).filter((j) => !done.has(j) && near(ps[j], p));
    if (g.length < 2) return;
    const cx = g.reduce((a, j) => a + ps[j][0], 0) / g.length, cy = g.reduce((a, j) => a + ps[j][1], 0) / g.length;
    const r = g.length === 2 ? 0.55 : 0.85, turn = g.length === 2 ? 0 : -Math.PI / 2;
    g.forEach((j, k) => { done.add(j); const a = (k / g.length) * Math.PI * 2 + turn; out[j] = [edge(cx + Math.cos(a) * rx * r), edge(cy + Math.sin(a) * ry * r)]; });
  });
  return { spot: out, moved: done.size > 0 };
};
export function Landed({ s, step }: SceneProps) {
  const pts = SAMPLES.map((x) => ({ ...x, sum: tasteSummary(s, x.code), c: x.color[1], c0: x.color[0] }));
  const scored = pts.filter((p) => p.sum.n > 0);
  // The scores that were collected, mapped straight onto the plot: each average from 1 to 5, with 1 at 8% and 5 at 92%
  // so a bubble never sits on the frame. No leader and no "develop first" corner: the room makes that call.
  const at = (v: number) => 8 + ((Math.max(1, Math.min(5, v)) - 1) / 4) * 84;
  const paperLeft = Math.max(0, (s.paperCards || 0) - tasters(s).cards); // paper cards counted on the day, not yet typed in
  const { spot, moved } = spread(pts.map((p) => (p.sum.n ? [at(p.sum.feels), at(p.sum.newness)] : [50, 50])));
  const scorers = Math.max(0, ...pts.map((p) => p.sum.n));
  const t = tallyPick(s, 'directions');
  const c = voteCounts(s, 'directions');
  const max = Math.max(1, ...Object.values(t));
  const top = topIds(t), pl = places(t); // the top three, plus anything tied with the third
  const fresh = SAMPLES.filter((x) => x.base.startsWith('Fresh')).map((x) => x.code).join(' or ');
  return (
    <div className="vt landed" style={{ ['--h' as any]: OBJ_HUE[1] }}>
      <div className="vt-glow" />
      <div className="pad">
        <Enter i={0}><div className="k">From your scores · {tally(scorers, 'person', 'people')} · then five chips each on your phone</div></Enter>
        <Enter i={1}><h2 className="h2 lm-title">What gets <span className="it">a second round?</span></h2></Enter>
        <div className="matrix lm-m">
          <div className="mx-plot">
            <i className="mx-mid v" /><i className="mx-mid h" />
            <span className="mx-ax x">Fits TheraBreath (what loyal users expect) <em>1 to 5</em> →</span>
            <span className="mx-ax y">Different (a reason for someone new to try) <em>1 to 5</em> →</span>
            <span className="mx-quad">Both: what Ross asked for.</span>
            {[1, 3, 5].map((v) => <span key={'x' + v} className="mx-tk x num" style={{ left: `${at(v)}%` }}>{v}</span>)}
            {[1, 3, 5].map((v) => <span key={'y' + v} className="mx-tk y num" style={{ bottom: `${at(v)}%` }}>{v}</span>)}
            {pts.map((p, i) => {
              const [x, y] = spot[i];
              // Bubble size is liking, from 1 (smallest) to 5.
              const size = p.sum.n ? 46 + ((Math.max(1, Math.min(5, p.sum.appeal)) - 1) / 4) * 44 : 46;
              return <div key={p.code} className={'mx-b' + (p.sum.n ? '' : ' none')} style={{ left: `${x}%`, top: `${100 - y}%`, ['--s' as any]: `${size}px`, ['--c' as any]: p.c, ['--i' as any]: i }} />;
            })}
            {/* The letters sit in a layer of their own, on a solid light disk, so no bubble ever covers one. */}
            {pts.map((p, i) => <b key={'l' + p.code} className={'mx-lt num' + (p.sum.n ? '' : ' none')} style={{ left: `${spot[i][0]}%`, top: `${100 - spot[i][1]}%`, ['--c0' as any]: p.c0, ['--i' as any]: i }}>{p.code}</b>)}
            {!scored.length && <span className="mx-empty">Your tasting scores show up here.</span>}
          </div>
        </div>
        <div className="lm-asks">
          <div className="lm-swap">
            <div className={'lm-layer' + (step === 0 ? ' on' : '')}>
              <div className="room-ask"><span className="k">For the room</span><p>{fresh || 'C or D'}: which one tastes more like TheraBreath?</p></div>
              <div className="room-ask"><p>Top right is both at once. What would it take to move the others there?</p></div>
            </div>
            <div className={'lm-layer' + (step >= 1 ? ' on' : '')}>
              <div className="room-ask"><span className="k">Now on your phone</span><p>Five chips each. Spend them on what we should develop next. Stack them on one if you love it.</p></div>
            </div>
          </div>
          <p className="src">Bubble size is liking. Scores: {pts.map((p) => `${p.code} ${p.sum.n}`).join(', ')}.{moved ? ' Close scores are nudged apart.' : ''} A lens on Ross’s goal, not a measure of it. First reactions, not consumer research.{paperLeft ? ` Phone scores only so far: ${paperLeft} paper ${paperLeft === 1 ? 'card' : 'cards'} to add.` : ''}</p>
        </div>
        <div className="lm-chips">
          <div className="k">{step === 0 ? 'Next: five chips each, once we’ve talked' : <>Five chips each · {tally(c.phones, 'person has', 'people have')} voted{byHandNote(c.hand, 'chip', 'chips')}</>}</div>
          <div className={'dotlist lm-list' + (step === 0 ? ' wait' : '')}>
            {DIRECTIONS.flatMap((d, i) => {
              const n = t[d.id] || 0; const rank = top.indexOf(d.id);
              // The same two groups as the phones: the four flavors tasted today, then the two directions nobody has tasted.
              const head = i === 0 || DIRECTIONS[i - 1].tasted !== d.tasted ? [<div key={'h' + d.id} className="k lm-group">{d.tasted ? 'Tasted today' : 'New directions, not tasted today'}</div>] : [];
              return [...head, (
                <div key={d.id} className={'dl' + (step >= 2 && rank > -1 ? ' top' : '') + (step >= 2 && top.length && rank < 0 ? ' dim' : '')} style={{ ['--c' as any]: d.colors[1], ['--i' as any]: i }} data-nonav>
                  <span className="dl-name"><b>{directionName(d.id, s)}</b>{d.tasted && <small>{d.label !== directionName(d.id, s) ? `${d.label} · ${d.sub}` : d.sub}</small>}</span>
                  <span className="dl-dots">{Array.from({ length: Math.min(n, 24) }, (_, j) => <i key={j} style={{ ['--j' as any]: j }} />)}</span>
                  <b className="num dl-n">{n}</b>
                  {step >= 2 && rank > -1 ? <em className="k">{placeLabel(pl[d.id])}</em> : <em />}
                </div>
              )];
            })}
          </div>
          {step >= 2 && top.length > 3 && <p className="src lm-tie">A tie for third: the room decides which goes on.</p>}
        </div>
      </div>
    </div>
  );
}
