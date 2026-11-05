'use client';
// The slides of the 22-slide morning that are new or merge what used to be two or more: Who we are with July, the
// TheraBreath products our flavors are in today, the shelf, the trends as a vote first, Flavor School (flavor and sodium
// chlorite), the four directions with their profile cards, and where each sample landed next to the chips vote. Built
// for talking with the room: one question on screen where there is one, and nothing to type.
import React, { useEffect, useState } from 'react';
import { R, Enter, Src, SceneProps, clean } from '../scenes/ui';
import { CoolingPlot, OxydField } from '../scenes/School';
import { POS } from '../scenes/Territories';
import { LiveCtx, OBJ_HUE, directionName } from './ShowScenes';
import {
  TEAM, SCIENCE, IMAGINATION, JULY, PORTFOLIO, MARKET, SOURCES, SIGNALS, PRIMARY_TERRITORIES as TERRITORIES, SAMPLES, DIRECTIONS,
} from '@/lib/content';
import { tallyPick, ranked, voteCounts, tasteSummary, tasters, SessionState } from '@/lib/state';
import { OUR_RINSES, OUR_KIDS, OUR_COUNT, type OurProduct } from '@/lib/ourFlavors';

const useLive = () => React.useContext(LiveCtx)!;
const tally = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const byHandNote = (n: number, one: string, many: string) => (n ? ` · ${n} ${n === 1 ? one : many} by hand` : '');
const Ask = ({ q, b, step, className = '' }: { q: string; b?: number; step: number; className?: string }) => (
  <R b={b ?? 0} step={step} className={'room-ask ' + className}><span className="k">For the room</span><p>{q}</p></R>
);

// 2. Who we are, since July. The four of us and one line each on the lab and what we bring in from outside oral care.
// Build 1 (optional, S skips it) brings in July's four themes with Growth, November, lighting up.
export function TeamSince({ step }: SceneProps) {
  const still = !!useLive()?.still;
  const [lit, setLit] = useState(false);
  useEffect(() => { if (step < 1) return setLit(false); if (still) return setLit(true); const t = setTimeout(() => setLit(true), 900); return () => clearTimeout(t); }, [step, still]);
  return (
    <div className="st ts">
      <img className="st-img" src="/img/lab-bench.webp" alt="" />
      <div className="pad">
        <Enter i={0}><div className="k">The Flavor Factory · Norco, California</div></Enter>
        <Enter i={1}><h2 className="h1">Who we are</h2></Enter>
        <div className="ts-people">
          {TEAM.map((t, i) => <Enter key={t.name} i={2 + i} className="st-person"><b>{t.name}</b><span className="k">{t.title}</span></Enter>)}
        </div>
        <Enter i={6} className="ts-lines">
          <div className="ts-line sci"><span className="k">What we test in the lab</span><div className="st-chips">{SCIENCE.map((x) => <span key={x}>{x}</span>)}</div></div>
          <div className="ts-line ima"><span className="k">What we bring in from outside oral care</span><div className="st-chips">{IMAGINATION.map((x) => <span key={x}>{x}</span>)}</div></div>
        </Enter>
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
const Bottles = ({ label, items, from }: { label: string; items: OurProduct[]; from: number }) => (
  <div className="of-g" style={{ flexGrow: items.length }}>
    <Enter i={2} className="of-gl"><span className="k">{label}</span></Enter>
    <div className="of-row">
      {items.map((p, j) => (
        <figure key={p.img} className="of-b" style={{ ['--i' as any]: from + j }}>
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
        <Enter i={1}><h2 className="h2 of-title">Our flavors are in {OUR_COUNT} TheraBreath rinses on shelf today.</h2></Enter>
      </div>
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
        <Enter i={1}><h2 className="h2 sh-title">Mint is the center of the range: {mint} of {PORTFOLIO.length} products.</h2></Enter>
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
        <R b={1} step={step}><p className="h2 it sh-room">Where could flavor add something useful?</p></R>
        <Src k="listings" style={{ position: 'static', marginTop: 14 }} />
      </div>
      <div className="sh-right">
        <Enter i={1}><div className="k">What competitors are launching · all public</div></Enter>
        <ol className="sh-launch">
          {rivals.map((m, i) => (
            <Enter key={i} i={2 + i} className="sh-mk">
              <span className="sh-when">{m.when}</span>
              <div><b>{m.who}</b><p>{m.what}</p></div>
            </Enter>
          ))}
        </ol>
        <Enter i={2 + rivals.length}><p className="src sh-srcs">Sources: {RIVAL_SOURCES}</p></Enter>
      </div>
      <R b={2} step={step} className="mk-turn sh-turn">
        <span className="k">Where TheraBreath stands</span>
        <p>TheraBreath has been alcohol-free and dye-free from the start, its original rinse is made with sodium chlorite, and it already has a kids line. <span className="it">Where can flavor add another reason to choose TheraBreath?</span></p>
      </R>
    </div>
  );
}

// 9. Seven trends: vote, then discuss. All seven show at once as one line each with where the evidence comes from, and
// the phones vote for three straight away while the bars fill. Builds 1 to 3 open the top three one at a time (the
// vote closes on build 1 and reopens if we go back); the other four stay as one line.
export function topTrends(s: SessionState) {
  const t = tallyPick(s, 'signals');
  const voted = ranked(t).filter(([, n]) => n > 0).map(([id]) => id);
  // Fewer than three with votes: the rest come in list order, so every build has a trend to open.
  return [...voted, ...SIGNALS.map((x) => x.id).filter((id) => !voted.includes(id))].slice(0, 3).map((id) => ({ sig: SIGNALS.find((x) => x.id === id)!, n: t[id] || 0 }));
}
export function TrendVote({ s, step }: SceneProps) {
  const t = tallyPick(s, 'signals');
  const c = voteCounts(s, 'signals');
  const max = Math.max(1, ...Object.values(t));
  const top = topTrends(s);
  const k = Math.min(3, Math.max(0, step));
  const focus = k > 0 ? top[k - 1] : null;
  const isTop = (id: string) => step >= 1 && top.some((x) => x.sig.id === id);
  return (
    <div className="signal sigs tv" style={{ ['--h' as any]: focus ? focus.sig.hue : OBJ_HUE[0] }}>
      <div className="sig-light" style={{ opacity: focus ? 1 : 0.35 }} />
      <div className="pad" style={{ position: 'relative' }}>
        <Enter i={0}><div className="k">{step === 0 ? `Vote on your phone · pick three · ${tally(c.phones, 'vote', 'votes')} so far${byHandNote(c.hand, 'vote', 'votes')}` : `The vote is in · ${tally(c.phones + c.hand, 'vote', 'votes')}`}</div></Enter>
        <Enter i={1}><h2 className="h2">Seven trends. <span className="it">Which three matter most for TheraBreath?</span></h2></Enter>
        <div className="tv-list">
          {SIGNALS.map((x, i) => {
            const n = t[x.id] || 0; const rank = top.findIndex((y) => y.sig.id === x.id);
            const on = focus?.sig.id === x.id;
            return (
              <div key={x.id} className={'tv-row' + (on ? ' on' : '') + (isTop(x.id) && !on ? ' top' : '') + (step >= 1 && !isTop(x.id) ? ' dim' : '')} style={{ ['--h' as any]: x.hue, ['--i' as any]: i }}>
                <span className="num">0{x.n}</span>
                <div className="tv-t"><b>{x.title.replace(/\.$/, '')}</b><small className="tv-tag">{x.from}</small></div>
                <div className="tv-bar"><i style={{ width: `${(n / max) * 100}%` }} /></div>
                <b className="num tv-n">{n}</b>
                {step >= 1 && rank > -1 && <em className="k tv-rank">Number {rank + 1}</em>}
              </div>
            );
          })}
        </div>
        {focus ? (
          <div className="sigs-focus tv-focus" key={focus.sig.id}>
            <div className="k">{focus.n ? `Number ${k} of 3 · ${tally(focus.n, 'vote', 'votes')}` : `Trend ${focus.sig.n} of 7`} · Seen in {focus.sig.from === 'Oral care' ? 'oral care' : 'food and flavor'}</div>
            <h3 className="sf-title">{focus.sig.title}</h3>
            <div className="sf-proofs">{focus.sig.proofs.map((p, i) => <div key={i} className="proof" style={{ ['--d' as any]: `${i * 180}ms` }}><p>{p.t}</p><div className="src">{clean(SOURCES[p.src])}</div></div>)}</div>
            <div className="sig-so"><span className="k">What it could mean for TheraBreath</span><div className="h3 it">{focus.sig.so}</div></div>
            <div className="tv-ask"><span className="k">For the room</span><p>{focus.sig.ask}</p></div>
          </div>
        ) : (
          <div className="sigs-hint tv-hint">Vote first. Then we’ll open the top three one at a time: the evidence, what it could mean for TheraBreath and a question for the room.</div>
        )}
      </div>
    </div>
  );
}

// 11. Flavor School, as three things to know about flavor in a TheraBreath rinse: flavor combines taste, aroma and
// mouthfeel (NIDCD), cooling has an onset and a linger (drawn, with no times on the axis), and the flavor has to work in
// the actual base through shelf life. One slide, three states, ending on the clean finish and a question. Ryan's Flavor
// School words, made more careful after the November 4 review; Ryan signs off the science and the notes together.
const FS = ['Taste, aroma and feel', 'Cooling', 'Sodium chlorite'];
export function FlavorSchool({ step }: SceneProps) {
  const parts = [
    { t: 'Taste', w: 'The tongue', d: 'Sweet, sour, salty, bitter, umami.' },
    { t: 'Aroma', w: 'The nose, both ways', d: 'Aroma reaches the nose from the mouth as well as from sniffing.' },
    { t: 'Feel', w: 'The trigeminal nerve', d: 'Cooling, tingling and warming, like the coolness of mint.' },
  ];
  const levers = ['Choose compatible materials', 'Work on incorporation and protection', 'Check stability in the agreed base'];
  const at = Math.min(2, step);
  return (
    <div className="fs">
      {at === 2 && <OxydField />}
      <div className="pad fs-head">
        <Enter i={0}><div className="k">Flavor School · Three things to know</div></Enter>
        <ol className="fs-steps">{FS.map((x, i) => <li key={x} className={i === at ? 'on' : i < at ? 'done' : ''}><span className="num">0{i + 1}</span>{x}</li>)}</ol>
      </div>
      <div className={'fs-state school' + (at === 0 ? ' on' : '')}>
        <div className="pad">
          <h2 className="h1 fs-h">Flavor combines taste, aroma <span className="it">and mouthfeel.</span></h2>
          <div className="venn">{parts.map((p, i) => <div key={p.t} className={'vc vc' + i}><div className="vc-in"><b className="h3">{p.t}</b><span className="k">{p.w}</span><p>{p.d}</p></div></div>)}</div>
          <Src k="nidcd" style={{ position: 'absolute', left: 120, bottom: 118 }} />
        </div>
      </div>
      <div className={'fs-state cooling' + (at === 1 ? ' on' : '')}>
        {step >= 1 && (
          <div className="pad">
            <div className="cool-copy">
              <h2 className="h1">Cooling does<br />two jobs.</h2>
              <p className="h3 it accent">Cooling has an onset and a linger. We can work on both.</p>
              <div className="src fs-drawn">Drawn to explain the idea. Not measured, and not these samples.</div>
            </div>
            <CoolingPlot shown={3} frost />
          </div>
        )}
      </div>
      <div className={'fs-state oxyd' + (at === 2 ? ' on' : '')}>
        {step >= 2 && (
          <div className="pad">
            <h2 className="h2 fs-ox">The flavor has to work in the actual base, <span className="it">from the first rinse through shelf life.</span></h2>
            <div className="k fs-ctl">What we do</div>
            <div className="levers">{levers.map((l, i) => <div key={l} className="lever" style={{ animationDelay: `${300 + i * 160}ms` }}><span className="num">0{i + 1}</span>{l}</div>)}</div>
            <p className="h2 fs-pay">Whatever direction we take, <span className="it">the finish needs to feel clean.</span></p>
            <Ask step={step} q="Where has flavor been hardest to get right with sodium chlorite for you?" className="fs-ask" />
            <Src k="patent" extra="Public chemistry only. No TheraBreath or TFF formula details" style={{ position: 'absolute', left: 120, bottom: 118 }} />
          </div>
        )}
      </div>
    </div>
  );
}

// 12. Four directions. The map (familiar to adventurous, gentle to bold, our view) with all four; builds 1 to 4 open
// each direction's profile card. Clicking a direction on the TV opens its card; clicking it again goes back to the map.
// Global Brightness and Modern Clean (builds 2 and 3) are the optional ones the short version skips.
export function DirectionsMap({ step }: SceneProps) {
  const live = useLive();
  const W = 1160, H = 700;
  const t = step >= 1 ? TERRITORIES[step - 1] : null;
  const tasted = (id: string) => SAMPLES.some((x) => x.territory === id);
  const open = (n: number) => { if (!live.still) live.goStep(step === n ? 0 : n); };
  return (
    <div className={'pad dm' + (t ? ' open' : '')}>
      <div className="map-copy dm-copy">
        <Enter i={0}><div className="k">Four directions</div></Enter>
        <Enter i={1}><h2 className="h1">Where we think <span className="it">flavor could go.</span></h2></Enter>
        <Enter i={2}><p className="lede dm-lede">Two of these are in today’s tasting. For the other two, we just want your opinion.</p></Enter>
        <div className="src dm-view">Our view, not data.</div>
        <Ask step={step} q="Which direction feels most like TheraBreath, and which stretches it most?" className="dm-ask" />
      </div>
      <div className="map-plot dm-plot" style={{ width: W, height: H }}>
        <div className="map-glow on" />
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
          </div>
        </section>
      )}
    </div>
  );
}

// 15. What deserves the next round? The bubble chart from the scores (fit and uniqueness 1 to 5, liking as size) stays up while the phones
// place five chips each on which flavors or directions to develop next: the four tasted today, then the two directions
// not tasted today (grouped the same way as on the phones). Build 1 ranks the top three.
export function topDirections(s: SessionState) {
  return ranked(tallyPick(s, 'directions')).filter(([, n]) => n > 0).slice(0, 3).map(([id, n]) => ({ id, n, name: directionName(id, s) }));
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
  const top = ranked(t).filter(([, n]) => n > 0).slice(0, 3).map(([id]) => id);
  const fresh = SAMPLES.filter((x) => x.base.startsWith('Fresh')).map((x) => x.code).join(' and ');
  return (
    <div className="vt landed" style={{ ['--h' as any]: OBJ_HUE[1] }}>
      <div className="vt-glow" />
      <div className="pad">
        <Enter i={0}><div className="k">From your scores · {tally(scorers, 'person', 'people')} · then five chips each on your phone</div></Enter>
        <Enter i={1}><h2 className="h2 lm-title">What deserves <span className="it">the next round?</span></h2></Enter>
        <div className="matrix lm-m">
          <div className="mx-plot">
            <i className="mx-mid v" /><i className="mx-mid h" />
            <span className="mx-ax x">Fit with TheraBreath <em>1 to 5</em> →</span>
            <span className="mx-ax y">Uniqueness <em>1 to 5</em> →</span>
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
          <div className="room-ask"><span className="k">For the room</span><p>Of {fresh || 'C and D'}, which feels more like TheraBreath?</p></div>
          <div className="room-ask"><p>Which of these deserves another round, and what would you change?</p></div>
          <p className="src">Bubble size is liking. Scores: {pts.map((p) => `${p.code} ${p.sum.n}`).join(', ')}.{moved ? ' Close scores are nudged apart.' : ''} {paperLeft ? `Phone scores only so far: ${paperLeft} paper ${paperLeft === 1 ? 'card' : 'cards'} to add.` : 'First reactions, not consumer research.'}</p>
        </div>
        <div className="lm-chips">
          <div className="k">Five chips each · {tally(c.phones, 'person has', 'people have')} voted{byHandNote(c.hand, 'chip', 'chips')}</div>
          <p className="lm-ask">Which flavors or directions should we develop next?</p>
          <div className="dotlist lm-list">
            {DIRECTIONS.flatMap((d, i) => {
              const n = t[d.id] || 0; const rank = top.indexOf(d.id);
              // The same two groups as the phones: the four flavors tasted today, then the two directions nobody has tasted.
              const head = i === 0 || DIRECTIONS[i - 1].tasted !== d.tasted ? [<div key={'h' + d.id} className="k lm-group">{d.tasted ? 'Tasted today' : 'New directions, not tasted today'}</div>] : [];
              return [...head, (
                <div key={d.id} className={'dl' + (step >= 1 && rank > -1 ? ' top' : '') + (step >= 1 && top.length && rank < 0 ? ' dim' : '')} style={{ ['--c' as any]: d.colors[1], ['--i' as any]: i }} data-nonav>
                  <span className="dl-name"><b>{directionName(d.id, s)}</b>{d.tasted && <small>{d.label !== directionName(d.id, s) ? `${d.label} · ${d.sub}` : d.sub}</small>}</span>
                  <span className="dl-dots">{Array.from({ length: Math.min(n, 24) }, (_, j) => <i key={j} style={{ ['--j' as any]: j }} />)}</span>
                  <b className="num dl-n">{n}</b>
                  {step >= 1 && rank > -1 ? <em className="k">Number {rank + 1}</em> : <em />}
                </div>
              )];
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
