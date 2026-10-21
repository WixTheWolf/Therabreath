# THE FLAVOR RACE V15: the sound design, cue by cue, against the final cut (the director's edit of 12 October 2026).
# Read it like a score. Every time is T(segment, offset) on the V15 timeline; picture events are measured off the
# source clips (constants below). One element leads at a time: SFX, MUSIC, DIALOGUE or SILENCE. The music's share is
# MUSIC_AUTO and MUSIC_CUTS in events15.py; its sections are placed in music15.py.
# Identities (from V12): TheraBreath = clean air, a smooth rising turbine, deep clean thrust, a crystal edge.
#             Competitor = a rough uneven idle, a grinding turbine, a cough.
#             The Flavor Factory = soft machines, glass, a warm room. Discovery = drops, glass, fizz, sparkle.
#             Space = near silence, heard only through the hull.
# V15's shapes (the director's V12.1 brief): the opening conceals the reveal (a distant hum, condensation, tiny ice
# cracks, venting, radio far away, nothing roars) until the pad floods with light; EVERY CATEGORY HAS A RACE gets a
# restrained low push, not a slam; the count drives the cuts and the burner plays in near silence until WHUMP; the
# wide liftoff is one of the loudest moments, the crowd is outdoors (the roar far off, people yelling, the cheer
# carrying across the cut) and the rockets come back at full range; silence at the edge of space; the race is
# punctuation under the score; the warning light is small and worried; the search and the montage are glass, leaves,
# juice and frost under the quiet glass section, one sound per cut; the relight lands on the score's return; the Moon is
# near silence (the pole goes in with a servo, a ratchet and a CHK, then almost nothing as the flag is revealed); home is
# air, birds and a soft landing; the robot is small and precise; the hush before the card is silent; the stinger is
# the rival's sputtering arrival in the quiet.
# usage (from video/sound): python3 cues15.py ../out/race15_sfx.wav
import sys
import numpy as np
import soundfile as sf
from sdx import Mix, SR, bp, lp, load, secs, sub_boom, rumble, mains_hum, air, space_drone, whoosh, crystal, flutter
from timeline import Cut

V = Cut('FlavorRaceV15')
T = V.t
M = Mix(V.TOTAL)
P = M.put

# picture events (seconds on the V15 timeline), measured off the source clips
TITLE = T('every', 0.33)                                 # the title letters form (b92b53de src 10.5)
LAMP = T('lights', 0.71)                                 # the pad floods with light (cc51b641 src 1.375)
BEAMS = [T('lights', 4.62), T('lights', 5.15)]           # the searchlight beams come on (src 5.29, 5.82)
THREE, TWO, ONE = 24.85, 25.79, 26.76                    # the count's words (VO at 24.74)
SPARK = T('nozzle', 0.17)                                # the igniter sparks in the bell (n18_nozzle src 1.05)
CATCH = [T('nozzle', 0.42), T('nozzle', 0.62), T('nozzle', 0.86)]   # it catches, grows (src 1.3, 1.5, 1.73)
BLOOM = T('nozzle', 1.32)                                # it blooms white: WHUMP (src 2.2)
BREATH = BLOOM - 0.36                                    # everything is sucked away: a held breath before the WHUMP
ERUPT = T('ignite', 0.02)                                # both pads erupt
TOUCH = T('foot', 0.5)                                   # Moon touchdown: the footpad meets the regolith
POLEIN = T('pole', 0.55)                                 # the pole enters the regolith (n28_flag src 9.4)
MOONLIFT = T('moonlaunch', 0.2)                          # TheraBreath lifts off the Moon for home
HQTOUCH = T('hqland', 3.1)                               # touchdown on the lawn (s11_hq src 6.5)
HATCH = T('robot', 0.85)                                 # the hatch unlatches (g7_robot, as V12.2)
ARM = T('robot', 1.6)                                    # the arm comes out
SETTLE = T('robot', 4.1)                                 # the tray settles
GLASS = T('tasting', 2.1)                                # the gloved hand sets the glass down (t1_tasting src 2.1)
ENDTONE = T('end', 0.35)                                 # THE FUTURE OF FRESHNESS resolves on the score's final gesture
RIVALLAND = T('stglate', 1.25)                           # the rival finally lands beside the flag (g9_late src 3.85)
RL = T('relight', 0.06)                                  # the engines relight: the score's return
RADIO = ['radio_count', 'radio2_count', 'radio_home', 'radio2_home', 'radio2_tminus', 'radio2_notideal']


def fizz(dur, rate=110, seed=0):
    # carbonation: a sparse rain of tiny bright bubbles bursting, each a few milliseconds of ringing noise
    r = np.random.default_rng(seed); n = int(dur * SR); y = np.zeros((n, 2))
    k = int(0.006 * SR); e = np.exp(-np.arange(k) / (0.0012 * SR))
    for at in np.cumsum(r.exponential(1 / rate, int(dur * rate * 1.5))):
        i = int(at * SR)
        if i + k >= n: break
        g = r.uniform(0.2, 1.0) ** 2; p = r.uniform(-1, 1)
        b = r.standard_normal(k) * e * g
        y[i:i + k, 0] += b * (1 - p) / 2; y[i:i + k, 1] += b * (1 + p) / 2
    y = bp(y, 2500, 12000) * (np.sin(np.pi * np.linspace(0, 1, n)) ** 0.6)[:, None]
    return y / np.abs(y).max()


def machine_hum(dur, seed=0):
    # something enormous and far away, running: a low mains-and-motor hum that breathes, never a note you can name
    t = secs(dur); r = np.random.default_rng(seed); y = np.zeros((len(t), 2))
    for f0, a in [(49.0, 1.0), (98.1, 0.55), (147.2, 0.22), (196.0, 0.1)]:
        for c in range(2):
            y[:, c] += a * np.sin(2 * np.pi * f0 * (1 + 0.002 * c) * t + r.uniform(0, 6))
    y = y / np.abs(y).max() + 0.6 * rumble(dur, 30, 140, seed=seed + 1)
    return y * (0.82 + 0.18 * np.sin(2 * np.pi * 0.13 * t + 1.0))[:, None] / 1.6


def ratchet(n=5, rate=15.0, seed=0):
    # a small mechanical ratchet: a few dry pawl clicks
    r = np.random.default_rng(seed); k = int(0.005 * SR); y = np.zeros((int((n / rate + 0.05) * SR), 2))
    for m in range(n):
        i = int(m / rate * SR); b = r.standard_normal((k, 2)) * np.exp(-np.arange(k) / (0.0009 * SR))[:, None]
        y[i:i + k] += b * (0.7 + 0.3 * r.random())
    y = bp(y, 1800, 7500)
    return y / np.abs(y).max()


def chatter(dur, seed=0, gap=(0.12, 0.7), frag=(0.14, 0.42)):
    # radio voices heard from very far away: short fragments of the radio takes, shuffled, some reversed, band-limited
    # and a little crushed, so it reads as people talking on a channel and never as words
    r = np.random.default_rng(seed); n = int(dur * SR); y = np.zeros((n, 2)); i = int(r.uniform(0.0, 0.3) * SR)
    while i < n:
        x = load(RADIO[r.integers(len(RADIO))])
        L = int(r.uniform(*frag) * SR); a = r.integers(0, max(1, len(x) - L))
        s = x[a:a + L].mean(1)
        if np.abs(s).max() < 0.05 * np.abs(x).max(): continue
        if r.random() < 0.4: s = s[::-1]
        s = s * np.sin(np.pi * np.linspace(0, 1, len(s))) ** 0.3
        j = min(n, i + len(s)); y[i:j] += np.repeat(s[:j - i, None], 2, 1)
        i = j + int(r.uniform(*gap) * SR)
    y = np.tanh(3.0 * bp(y, 380, 2600) / (np.abs(y).max() + 1e-9))
    return y / np.abs(y).max()


def chain(n=4, seed=0):
    # a flagpole halyard knocking against the pole in the breeze: a few soft metallic taps
    r = np.random.default_rng(seed); y = np.zeros((int(3.0 * SR), 2)); at = 0.05
    for m in range(n):
        x = crystal(r.uniform(1900, 2600), 0.35, seed=seed + m)
        i = int(at * SR); y[i:i + len(x)] += x[:len(y) - i] * r.uniform(0.4, 1.0)
        at += r.uniform(0.3, 0.55)
    return y[:int((at + 0.4) * SR)] / np.abs(y).max()


# ---------------------------------------------------------------- I. THE SURPRISE
# Macro photography of a giant white bottle in a very large, very cold, very quiet place. Nothing roars.
P(machine_hum(11.5, seed=1), 0.0, -20, norm='rms', fi=2.4, until=LAMP + 0.2, fo=0.3, width=0.5,
  auto=[(0.0, -3), (T('macro2'), -1), (T('every'), 0), (T('lights'), 1)], tag='distant machine hum')
P('01_OPEN_CRYO_VENT_FAR_V1', 0.6, -6, norm='rms', hpf=400, lpf=6000, fi=1.2, until=T('every', 0.4), fo=0.8, pan=0.35, env='vast:a', send=-4, tag='cold venting, far')
P(chatter(6.0, seed=62), 0.8, -42, norm='rms', fi=1.2, until=T('every', 0.2), fo=0.5, pan=-0.35, width=0.4, env='vast:a', send=2, tag='radio chatter, very far')
P(fizz(4.4, rate=22, seed=61), 0.3, -31, width=0.8, env='vast:a', send=-10, tag='condensation beads')
P('01_OPEN_FROST_CRACKLE_V1', 1.1, -26, trim=(0.4, 3.0), fi=0.3, fo=0.5, hpf=2600, pan=-0.15, width=0.8, tag='tiny ice cracks')
P(whoosh(2.6, 220, 900, q=0.6, seed=67), 1.6, -24, width=1.6, panauto=[(1.6, -0.5), (4.2, 0.4)], tag='vapor drifting past')
P('01_OPEN_PLASTIC_TICK_V1', 3.4, -28, trim=(0.18, 0.5), align='onset', pan=0.15, fo=0.05, env='vast:a', send=-6)
# the stripe: one cold droplet slides and falls somewhere far below
P('01_OPEN_DROPLET_PLINK_V1', T('macro2', 0.55), -24, trim=(0.0, 0.9), align='onset', fo=0.2, pan=0.15, env='vast:a', send=1)
P('01_OPEN_PLASTIC_TICK_V2', T('macro2', 1.0), -30, align='onset', pan=-0.2, fo=0.05, env='vast:a', send=-6)
# EVERY CATEGORY HAS A RACE: a restrained low push of air as the letters form, a deep soft hit, a crystalline resolve
P(whoosh(1.2, 80, 360, q=0.8, seed=3), TITLE - 0.9, -20, width=1.4, tag='title air push')
P(sub_boom(3.0, 50, 26, 0.4, 1.0), TITLE + 0.02, -12, tag='title sub')
P('06_LAUNCH_TAIL_V1', TITLE + 0.05, -23, lpf=900, fo=1.2, until=T('lights', 0.3), width=1.5, env='vast:b', send=-4, tag='title body')
P('02_REVEAL_SHIMMER_BLOOM_V2', TITLE + 0.1, -26, hpf=2500, fo=1.2, width=1.5, env='vast:b', send=-6)
M.kill('vast:a', T('lights', 0.3), 0.4)
# the silhouettes: night wind, a structure groaning in the cold, a relay chain, a transformer waking
P('01_OPEN_NIGHT_WIND_V1', T('lights', -0.1), -10, norm='rms', trim=(6.705, None), fi=0.5, loop=True, until=T('rival', 0.2), fo=0.4, width=1.5,
  auto=[(T('lights'), 0), (LAMP, 0), (LAMP + 1.0, -3)])
P('01_OPEN_STRUCTURE_GROAN_V1', T('lights', 0.0), -25, lpf=900, fi=0.3, until=LAMP - 0.1, fo=0.4, pan=-0.4, env='pad:a', send=2)
P('02_REVEAL_RELAY_CHAIN_V1', LAMP - 0.42, -22, align='onset', lpf=3200, pan=-0.2, env='pad:a', send=-6)
P('02_REVEAL_TRANSFORMER_RISE_V2', LAMP - 0.6, -24, trim=(2.5, 3.14), fi=0.3, fo=0.008, env='pad:a', send=-8)
# the pad floods with light: the light becomes sound, the sub a beat late
P('02_REVEAL_FLOOD_HIT_V1', LAMP, -9, align='onset', pan=-0.3, env='pad:a', send=0)
P('02_REVEAL_FLOOD_HIT_V3', LAMP + 0.012, -10, align='onset', pan=0.35, env='pad:a', send=0)
P('02_REVEAL_FLOOD_HIT_V2', LAMP + 0.02, -12, align='onset', width=1.3)
P('02_REVEAL_SHIMMER_BLOOM_V1', LAMP, -17, trim=(0.85, None), align=0.12, fo=0.8, width=1.6, env='pad:a', send=-6)
P(sub_boom(3.0, 52, 26, 0.4, 1.0), LAMP + 0.11, -8, tag='delayed sub')
P(mains_hum(7, seed=1), LAMP + 0.05, -27, norm='rms', fi=0.35, until=T('mc1'), fo=0.3, pan=-0.6, tag='flood hum L')
P(mains_hum(7, seed=2), LAMP + 0.05, -27, norm='rms', fi=0.35, until=T('mc1'), fo=0.3, pan=0.65, tag='flood hum R')
P('02_PAD_VAPOR_HISS_V1', LAMP + 0.4, -22, norm='rms', fi=1.5, loop=True, until=T('mc1'), fo=0.3, lpf=7000, width=1.3, env='pad:a', send=-10)
# the searchlights: two more banks, smaller and farther
P('02_REVEAL_FLOOD_HIT_V2', BEAMS[0], -18, align='onset', pan=-0.55, env='pad:a', send=-2)
P('02_REVEAL_FLOOD_HIT_V3', BEAMS[1], -19, align='onset', pan=0.6, env='pad:a', send=-2)
P('02_REVEAL_LAMP_HUM_V1', BEAMS[0] + 0.1, -30, fi=0.4, until=T('mc1'), fo=0.3, width=1.4)
# the base of both rockets glows: the turbines are already breathing
P('05_PRE_TURBINE_THERA_V2', LAMP + 0.6, -31, fi=1.2, until=T('mc1'), fo=0.3, pan=-0.3, lpf=4000)
P('05_PRE_TURBINE_RIVAL_V1', LAMP + 0.9, -32, fi=1.2, lpf=2400, until=T('mc1'), fo=0.3, pan=0.35)
# the rival up close: a rough, uneven idle with a rattle; then TheraBreath's clean turbine
P('03_RIVAL_ROUGH_IDLE_V2', T('rival', -0.05), -18, norm='rms', fi=0.1, lpf=2600, until=T('herocap', 0.05), fo=0.08, pan=0.25, tag='rival idle, close')
P('03_RIVAL_HYDRAULIC_GROAN_V1', T('rival', 0.3), -26, lpf=2200, fo=0.4, pan=0.3, env='pad:a', send=-4)
P('05_PRE_TURBINE_THERA_V1', T('herocap', -0.03), -22, fi=0.05, until=T('mc1', 0.1), fo=0.1, lpf=7000, tag='TheraBreath turbine, clean')
M.kill('pad:a', T('mc1'), 0.2)
# Mission Control at The Flavor Factory: a warm room, consoles, the channel
P('04_CONTROL_ROOMTONE_V1', T('mc1', -0.03), -21, norm='rms', fi=0.05, loop=True, hpf=60, until=T('cap', 0.05), fo=0.08)
P('beeps', T('mc1', 0.3), -28, norm='rms', lpf=6000, hpf=900, fi=0.1, until=T('cap', 0.02), fo=0.05, width=1.4, env='room', send=-12)
P(chatter(2.4, seed=64, gap=(0.08, 0.3), frag=(0.2, 0.5)), T('mc1', 0.2), -27, norm='rms', fi=0.05, until=T('cap', 0.02), fo=0.05, pan=-0.2, env='room', send=-8, tag='the channel')
P('04_CONTROL_READY_CHIME_V2', T('mc1', 1.7), -27, align='onset', env='room', send=-8)
# the cap in the cold: vapor, the floodlight hum, wind, the turbines spooling. The count drives the cuts.
P('02_PAD_VAPOR_HISS_V1', T('cap', -0.05), -20, norm='rms', fi=0.2, loop=True, lpf=8000, until=T('nozzle'), fo=0.05, width=1.4, env='pad:c', send=-8)
P(mains_hum(6, seed=6), T('cap'), -30, norm='rms', fi=0.3, until=T('nozzle'), fo=0.05, width=1.3, tag='flood hum')
P('01_OPEN_NIGHT_WIND_V1', T('cap'), -26, norm='rms', trim=(1.0, None), fi=0.4, until=T('nozzle'), fo=0.05, width=1.5)
P('05_PRE_TURBINE_THERA_V1', T('cap', -0.1), -25, fi=0.4, until=T('nozzle', 0.05), fo=0.05, pan=-0.4, env='pad:c', send=-9,
  auto=[(T('cap'), -9), (T('nozzle'), 0)], rateauto=[(T('cap'), 1.0), (T('nozzle'), 1.15)])
P('05_PRE_TURBINE_RIVAL_V1', T('cap', 0.2), -27, lpf=2500, fi=0.4, until=T('nozzle', 0.05), fo=0.05, pan=0.45, env='pad:c', send=-9)
P('05_PRE_TANK_PINGS_V1', T('cap', 1.2), -27, hpf=600, fo=0.3, pan=0.3, env='pad:c', send=-6)
for w in (THREE, TWO, ONE):                                                              # a heartbeat under each number
    P('x4_heart', w + 0.12, -28, lpf=300)
# two: the umbilical lets go in a blast of cold
P('05_PRE_UMBILICAL_RELEASE_V1', T('umbilical', 0.02), -15, align='onset', width=1.4, env='pad:c', send=-6)
P('x_vent', T('umbilical', 0.08), -20, hpf=500, fo=0.4, until=T('button', 0.2), width=1.5)
# one: the button. A heavy, solid click.
P('05_PRE_BUTTON_PRESS_V1', ONE - 0.04, -15, align='onset', env='room', send=-10)
M.kill('pad:c', T('nozzle', 0.3), 0.3)
# the burner: we look straight into the engine. Metal ticks, fuel pressure, a low spool, the spark, it catches. WHUMP.
P('08_SPACE_METAL_TICKS_V1', T('nozzle', -0.02), -26, hpf=1200, fo=0.3)
P('05_PRE_PIPE_FLOW_V1', T('nozzle', 0.0), -22, norm='rms', lpf=3200, fi=0.2, until=BREATH, fo=0.06, tag='fuel pressure', auto=[(T('nozzle'), -6), (BREATH, 0)])
P(rumble(1.5, 20, 60, seed=33), T('nozzle', 0.0), -21, norm='rms', fi=0.6, until=BREATH, fo=0.05, tag='low spool')
P('05_PRE_IGNITER_SPARKS_V1', SPARK - 0.03, -16, hpf=900, fi=0.02, until=BREATH, fo=0.05)
for k, s in enumerate(CATCH):                                                            # it catches and grows
    P('08_SPACE_RELIGHT_V1', s - 0.02, -24 + 2 * k, trim=(0.08, 0.32), align='onset', fo=0.06, tag='a catch')
P(whoosh(0.9, 220, 3600, q=1.2, seed=31, shape='rise'), BREATH - 0.9, -22, width=1.3, fo=0.02, until=BREATH, tag='spool whine')
P('06_LAUNCH_ROAR_BODY_V2', BREATH - 0.7, -20, trim=(0.0, 0.75), rev=True, fi=0.4, fo=0.02, until=BREATH, width=1.6, tag='reverse suck')
P('05_HUSH_RELAY_CLICK_V1', BLOOM - 0.14, -27, align='onset', env='pad:d', send=-4)                        # one relay, in the held breath
P('x_whoomph', BLOOM, -9, align='onset', width=1.4, env='pad:d', send=-6, fo=0.4, until=T('ignite', 0.4))
P('10_LAB_LAUNCH_THOOMP_V1', BLOOM + 0.01, -11, align='onset', lpf=1800)
P(sub_boom(2.0, 60, 26, 0.3, 0.7), BLOOM + 0.03, -7, tag='WHUMP sub')

# ---------------------------------------------------------------- II. LAUNCH
# Both pads erupt: a violent crack, the sub, steam, metal rattling, and the roar in layers. The crowd outdoors (the
# roar far off over the field, wind, people yelling, the cheer carrying across the cut), then the rockets again at
# full range as they clear the pad: one of the loudest moments of the film. Then the long lens, the look back from
# the hull, the air thinning over Earth, and silence at the edge of space.
P('06_LAUNCH_IGNITION_CRACK_V3', ERUPT, -8, align='onset', width=1.3, env='pad:d', send=-3)
P('06_LAUNCH_IGNITION_CRACK_V1', ERUPT + 0.008, -13, align='onset', width=1.5)
P(sub_boom(2.4, 58, 24, 0.35, 0.8), ERUPT + 0.07, -10, tag='ignition sub')
P('06_LAUNCH_STEAM_WALL_V1', ERUPT + 0.1, -13, align=0.4, fo=0.4, width=1.8, until=T('crowd', 0.05))
P('06_LAUNCH_DEBRIS_RATTLE_V1', ERUPT + 0.15, -16, fo=0.6, pan=-0.45, width=1.2, until=T('crowd', 0.05), tag='the structure rattles')
FULL, FIELD, FAR = 16000, 1700, 1500
roar_lp = [(T('ignite'), FULL), (T('crowd', -0.01), FULL), (T('crowd'), FIELD), (T('erupt', -0.01), FIELD), (T('erupt'), FULL),
           (T('track', -0.01), FULL), (T('track'), FAR), (T('onboard', -0.01), FAR), (T('onboard'), 2400), (T('hull'), 1600), (T('pitch', -0.1), 900)]
roar_gain = [(T('ignite'), -4), (T('crowd', -0.01), -2), (T('crowd'), -10), (T('erupt', -0.01), -10), (T('erupt'), 2), (T('liftoff', 0.3), 5),
             (T('track', -0.01), 5), (T('track'), -9), (T('onboard', -0.01), -9), (T('onboard'), -10), (T('hull'), -16), (T('pitch', -0.1), -24), (T('pitch', 0.1), -45)]
P('06_LAUNCH_ROAR_BODY_V2', T('ignite', 0.02), 0, norm='rms', fi=0.12, loop=True, until=T('pitch', 0.15), fo=0.05, width=1.4, env='pad:d', send=-6,
  lpauto=roar_lp, auto=roar_gain, tag='roar body')
P('06_LAUNCH_ROAR_BODY_V1', T('ignite', 0.4), -3, norm='rms', fi=0.4, loop=True, until=T('onboard', 0.05), fo=0.05, width=1.6,
  lpauto=roar_lp, auto=roar_gain, tag='roar body 2')
P(rumble(17.0, 22, 60, seed=9), T('ignite', 0.05), -6, norm='rms', fi=0.2, until=T('pitch', 0.15), fo=0.1, tag='liftoff sub rumble',
  auto=[(T('ignite'), -4), (T('crowd'), -10), (T('erupt'), 0), (T('track', -0.01), 0), (T('track'), -10), (T('onboard'), -8), (T('hull'), -14), (T('pitch'), -20)])
# the crowd: outdoors, people shielding their eyes, then the cheer; it carries across the cut
P('01_OPEN_NIGHT_WIND_V1', T('crowd', -0.02), -25, norm='rms', trim=(2.0, None), fi=0.05, until=T('erupt', 0.5), fo=0.3, width=1.6)
P('x_crowd', T('crowd', -0.05), -11, trim=(1.0, None), fi=0.08, until=T('erupt', 0.55), fo=0.45, width=1.6, tag='crowd yelling')
P('x_applause', T('crowd', 0.55), -15, fi=0.15, until=T('erupt', 0.55), fo=0.45, width=1.7, tag='the cheer')
# back to the rockets at the peak of the cheer: the full spectrum, all at once
P('06_LAUNCH_STEAM_WALL_V1', T('erupt'), -11, align=0.3, fo=0.5, width=1.8, until=T('track', 0.3))
P('06_LAUNCH_CRACKLE_V1', T('erupt', 0.02), -9, until=T('track', 0.05), fo=0.05, width=1.5, env='pad:d', send=-6)
P('06_LAUNCH_DEBRIS_RATTLE_V2', T('erupt', 0.3), -19, fo=0.5, pan=0.4, width=1.2)
P('06_LAUNCH_GANTRY_SHAKE_V1', T('erupt', 0.1), -15, until=T('track'), fo=0.1, pan=-0.3, env='pad:d', send=-5)
P(sub_boom(2.0, 55, 28, 0.3, 0.8), T('erupt', 0.02), -10, tag='back to the rockets')
M.kill('pad:d', T('track'), 0.05)
# the long lens: miles away, the sound arrives late and thin; the crackle tears
P('06_LAUNCH_ROAR_DISTANT_V1', T('track', 0.25), -14, fi=0.3, until=T('onboard', 0.05), fo=0.1, lpf=1400, width=1.2, env='pad:e', send=-4)
P('06_LAUNCH_CRACKLE_V1', T('track', 0.5), -20, lpf=2600, until=T('onboard', 0.05), fo=0.1, width=1.4, env='pad:e', send=-6)
M.kill('pad:e', T('onboard'), 0.2)
# the onboard look back: wind roaring over the hull, the cabin rattling, thinning as the sky goes black
P('07_ASCENT_WIND_SHEAR_V1', T('onboard', -0.05), -15, fi=0.1, loop=True, until=T('pitch', 0.15), fo=0.2, width=1.4,
  auto=[(T('onboard'), 0), (T('hull'), -5), (T('pitch'), -16)], rateauto=[(T('onboard'), 1.0), (T('pitch'), 1.3)], lpauto=[(T('onboard'), 9000), (T('hull'), 3000), (T('pitch'), 1200)])
P('03_PLANT_BOLT_RATTLE_V1', T('onboard', 0.1), -28, lpf=4000, fo=0.4, until=T('hull', 0.3), env='hull', send=-12, tag='cabin rattle')
P('08_SPACE_HULL_HUM_V1', T('hull', -0.05), -26, norm='rms', fi=0.3, loop=True, until=T('side', 0.3), fo=0.4, auto=[(T('hull'), 0), (T('pitch'), -6)])
P(whoosh(3.2, 900, 300, q=0.7, seed=12), T('hull', 0.2), -27, width=1.5, tag='the air thinning')
# the edge of space: it is simply gone. A tick in the structure, then the gimbal for the pitch-over.
P('08_SPACE_METAL_TICKS_V1', T('pitch', 0.4), -30, hpf=1200, fo=0.3, env='hull', send=-10)
P('08_SPACE_SERVO_V2', T('pitch', 0.9), -29, fo=0.2, env='hull', send=-12)

# ---------------------------------------------------------------- III. THE RACE
# The score drives; the effects are punctuation. TheraBreath's clean thrust and the rival's rough idle run underneath,
# panned apart; each shot gets one accent. The rival commits and pulls away; TheraBreath's warning light comes on.
P(space_drone(26.0, seed=15), T('side', -0.3), -40, norm='rms', fi=0.8, until=T('search', 0.4), fo=0.8, tag='space drone')
P('09_RACE_THERA_THRUST_V1', T('side'), -20, norm='rms', fi=0.3, loop=True, until=T('cutoff', 0.3), fo=0.3, space=True, pan=-0.2,
  auto=[(T('side'), 0), (T('apollo', -0.01), 0), (T('apollo'), -12), (T('px26', -0.01), -12), (T('px26'), 0), (T('warn'), -3), (T('warn', 3.0), -7), (T('cutoff'), -9)],
  rateauto=[(T('side'), 1.0), (T('warn'), 1.0), (T('warn', 3.5), 0.9)])
P('05_PRE_TURBINE_RIVAL_V1', T('side', 0.2), -27, lpf=1800, fi=0.6, until=T('rivalaway', 2.9), fo=0.8, pan=0.35,
  auto=[(T('side'), -4), (T('chase'), 0), (T('apollo', -0.01), 0), (T('apollo'), -14), (T('px26'), -2), (T('rivaleng'), 2), (T('rivalaway', 1.0), -2), (T('rivalaway', 2.9), -16)])
P(whoosh(1.2, 300, 1400, q=0.9, seed=90), T('side', 0.05), -24, width=1.4, panauto=[(T('side'), -0.4), (T('side', 1.2), 0.4)], tag='both, side by side')
P(whoosh(2.0, 600, 3200, q=1.1, seed=92), T('chase', 0.1), -21, width=1.3, panauto=[(T('chase'), 0.5), (T('chase', 2.0), -0.5)], tag='the chase')
P('09_RACE_RIVAL_PASS_V2', T('neck', 1.0), -21, align='peak', lpf=3000, pan=0.2)
P(crystal(1567.98, 1.2, seed=93), T('neck', 0.3), -36, width=1.4, tag='a crystal edge')
# the 1960s room watching: a small warm room, a teletype, the channel
P('04_CONTROL_ROOMTONE_V1', T('apollo', -0.03), -20, norm='rms', fi=0.04, loop=True, hpf=60, until=T('px26', 0.04), fo=0.06)
P(chatter(2.8, seed=65, gap=(0.08, 0.32), frag=(0.2, 0.5)), T('apollo', 0.15), -26, norm='rms', fi=0.05, until=T('px26', 0.03), fo=0.05, pan=0.15, env='room', send=-8, tag='the channel')
P('beeps', T('apollo', 0.3), -29, norm='rms', lpf=6000, hpf=900, fi=0.1, until=T('px26', 0.02), fo=0.05, width=1.4, env='room', send=-12)
P('05_PRE_GAUGE_NEEDLE_V1', T('apollo', 1.4), -29, fo=0.2, env='room', send=-10)
# both again, from below, the camera rolling with them; the labels fly past
P(whoosh(2.4, 250, 1800, q=0.8, seed=94), T('px26', 0.1), -20, width=1.5, panauto=[(T('px26'), -0.5), (T('px26', 2.4), 0.5)], tag='both from below')
P('08_SPACE_RELIGHT_V2', T('px26', 1.6), -21, trim=(1.0, 2.4), fi=0.1, fo=0.4, lpf=5000, width=1.3, tag='clean fire')
P(whoosh(1.6, 900, 260, q=0.9, seed=95), T('px26', 2.6), -23, width=1.3, panauto=[(T('px26', 2.6), 0.4), (T('px26', 4.0), -0.4)], tag='COMPETITOR rolls past')
P(whoosh(1.8, 500, 2800, q=1.0, seed=96), T('px27', 0.0), -21, width=1.4, panauto=[(T('px27'), -0.5), (T('px27', 1.8), 0.5)], tag='TheraBreath past')
P(crystal(1318.5, 1.4, seed=97), T('px27', 0.4), -35, width=1.4, tag='glint')
# the rival commits: its engines up close, rough fire and a grinding turbine climbing; then it pulls away
P('03_RIVAL_ROUGH_IDLE_V1', T('rivaleng', -0.02), -16, norm='rms', fi=0.05, lpf=3200, until=T('rivalaway', 0.1), fo=0.08, pan=0.2, tag='rough fire')
P('05_PRE_TURBINE_RIVAL_V1', T('rivaleng', 0.0), -20, lpf=2800, until=T('rivalaway', 0.3), fo=0.2, pan=0.2, rateauto=[(T('rivaleng'), 1.0), (T('rivalaway'), 1.12)], tag='rival grinding up')
P(sub_boom(1.6, 56, 30, 0.25, 0.6), T('rivaleng', 0.3), -17, tag='rival full thrust')
P('09_RACE_RIVAL_PASS_V1', T('rivalaway', 0.6), -19, align='peak', lpf=3000, pan=0.4, tag='the rival pulls away')
P(whoosh(2.2, 1400, 300, q=0.8, seed=98), T('rivalaway', 0.9), -24, width=1.3, panauto=[(T('rivalaway', 0.9), 0.2), (T('rivalaway', 2.9), 0.7)], tag='into the distance')
# the alarm: first the 1960s room's red beacon (its room tone back under it), then TheraBreath's own warning light: a
# small worried alarm, the thrust sagging, a hull creak. The alarm leads over the beacon and settles on the hull light.
P('04_CONTROL_ROOMTONE_V1', T('warn', -0.02), -22, norm='rms', fi=0.04, loop=True, hpf=60, until=T('warnlight', 0.02), fo=0.05, tag='the room again')
P('x4_alarm', T('warn', 0.15), -25, rate=0.84, lpf=2400, fi=0.03, loop=True, until=T('warn', 3.6), fo=0.4, space=True, tag='warning',
  auto=[(T('warn'), 14), (T('warnlight', -0.05), 14), (T('warnlight', 0.35), 2)])
P('12_FAIL_HULL_STRAIN_V1', T('warnlight', 0.08), -30, lpf=2000, fo=0.6, env='hull', send=-10)
P('08_SPACE_METAL_TICKS_V1', T('warn', 2.5), -31, hpf=1500, fo=0.3, env='hull', send=-12)

# ---------------------------------------------------------------- IV. DISCOVERY
# The Flavor Factory searches. TheraBreath's engines go quiet. Under the score's quiet glass section, one sound per
# cut: leaves, water, a coconut, juice, mist, a drop, frost, mist on chamomile, the citrus split that is the one; then
# the lab (a pipette drop, a glove, glass), FLAVOR TRANSFER READY, the world's flavors in orbit; the transfer, the
# glow, and the relight on the score's return.
P('04_CONTROL_ROOMTONE_V1', T('search', -0.03), -20, norm='rms', fi=0.05, loop=True, hpf=60, until=T('cutoff', 0.04), fo=0.06)
P(whoosh(1.6, 700, 2600, q=1.6, seed=110), T('search', 0.15), -28, width=1.6, panauto=[(T('search'), -0.6), (T('search', 1.6), 0.6)], tag='the scan sweeps')
P('beeps', T('search', 0.2), -29, norm='rms', lpf=6000, hpf=900, fi=0.05, until=T('cutoff', 0.02), fo=0.05, width=1.5, env='room', send=-12)
# the engines go quiet: a wind-down through the hull, a last hiss, hot metal ticking, crystals drifting
P('08_SPACE_ENGINE_CUTOFF_V2', T('cutoff', 0.05), -18, fo=0.5, env='hull', send=-8)
P('08_SPACE_METAL_TICKS_V1', T('cutoff', 1.0), -29, hpf=1200, fo=0.3, env='hull', send=-10)
P(fizz(2.2, rate=30, seed=111), T('cutoff', 0.1), -33, width=1.6, tag='crystals drifting')
P(space_drone(6.0, seed=16), T('cutoff', 0.0), -41, norm='rms', fi=0.5, until=T('mc2', 0.2), fo=0.4)
P('04_CONTROL_ROOMTONE_V1', T('mc2', -0.03), -21, norm='rms', fi=0.04, loop=True, hpf=60, until=T('tea', 0.05), fo=0.06)
P(chatter(1.8, seed=66, gap=(0.08, 0.3), frag=(0.2, 0.45)), T('mc2', 0.2), -29, norm='rms', fi=0.05, until=T('tea', 0.02), fo=0.05, pan=-0.15, env='room', send=-8)
P('04_CONTROL_READY_CHIME_V1', T('mc2', 1.5), -29, align='onset', env='room', send=-8)
# the montage
P('10_LAB_LEAVES_V1', T('tea', 0.0), -21, fo=0.3, until=T('cuketea', 0.2), width=1.5, env='lab', send=-10)
P(fizz(1.6, rate=50, seed=112), T('cuketea', 0.0), -27, width=1.3, until=T('coconut', 0.1), fo=0.1, tag='bubbles in the water')
P('10_LAB_SLICE_V1', T('cuketea', 0.25), -25, align='onset', pan=0.15)
P('10_LAB_CITRUS_SPLIT_V1', T('coconut', 0.15), -18, align='onset', rate=0.72, lpf=5000, tag='the coconut opens')
P('01_OPEN_DROPLET_PLINK_V2', T('coconut', 0.35), -26, align='onset', pan=-0.2, env='lab', send=-6)
P('10_LAB_CITRUS_SPLIT_V1', T('melon', 0.05), -18, align='onset', rate=0.9, tag='the melon bursts')
P(fizz(1.0, rate=80, seed=113), T('melon', 0.1), -28, width=1.4, tag='juice spray')
P('10_LAB_MIST_SPRAY_V1', T('lime', 0.0), -22, until=T('cukedrop', 0.05), fo=0.05, width=1.3)
P('01_OPEN_DROPLET_PLINK_V1', T('cukedrop', 0.15), -22, trim=(0.0, 0.9), align='onset', fo=0.2, env='lab', send=-3)
P('10_LAB_FROST_BLOOM_V1', T('mint', 0.0), -21, until=T('chamomile', 0.1), fo=0.1, width=1.4, env='lab', send=-8)
P('10_LAB_AROMA_AIR_V1', T('chamomile', 0.0), -24, until=T('yuzu', 0.05), fo=0.1, width=1.5)
P('10_LAB_PETALS_V1', T('chamomile', 0.2), -27, fo=0.3, pan=0.2)
# the one: the citrus splits, and the room rings
P('10_LAB_CITRUS_SPLIT_V1', T('yuzu', 0.08), -14, align='onset', env='lab', send=-6, tag='the one')
P('02_REVEAL_SHIMMER_BLOOM_V1', T('yuzu', 0.1), -22, trim=(0.85, 3.6), align=0.12, fo=0.6, width=1.6, env='lab', send=-6)
for k, (fq, g) in enumerate([(1046.5, -30), (1318.5, -31), (1567.98, -32)]):
    P(crystal(fq, 2.2, seed=120 + k), T('yuzu', 0.2 + 0.12 * k), g, width=1.5, env='lab', send=-8, tag='the one, in glass')
# the lab: a small bright room; the pipette drops, the glass rings; a glove, glass on steel
P('10_LAB_ROOMTONE_V1', T('pipette', -0.1), -25, norm='rms', fi=0.2, loop=True, until=T('orbit', 0.1), fo=0.2)
P('01_OPEN_DROPLET_PLINK_V1', T('pipette', 0.9), -20, trim=(0.0, 0.9), align='onset', fo=0.2, env='lab', send=-3)
P('10_LAB_DROP_GLASS_V2', T('pipette', 0.905), -24, rate=0.929, align='onset', env='lab', send=-6)
P('10_LAB_TWIST_LOCK_V2', T('glove', 0.7), -21, rate=1.2, align=0.158, env='lab', send=-8)
P(crystal(1760.0, 1.6, seed=124), T('glove', 0.75), -33, width=1.3, env='lab', send=-8)
# FLAVOR TRANSFER READY: the press, and the room answers
P('05_PRE_BUTTON_PRESS_V1', T('transferbtn', 0.55), -18, align='onset', env='room', send=-10)
P('04_CONTROL_READY_CHIME_V2', T('transferbtn', 0.62), -22, align='onset', env='room', send=-6)
# the world's flavors in orbit: air and sparkle
P(whoosh(1.6, 1200, 400, q=0.9, seed=125), T('orbit', -0.1), -24, width=1.6, tag='into orbit')
P('11_RING_SPARKLE_PASS_V1', T('orbit', 0.2), -24, hpf=3000, fo=0.6, width=1.6)
# the transfer: the coupling, the line, the flavor flowing in
P('05_PRE_VALVE_ACTUATE_V1', T('transfer', 0.1), -22, trim=(0.0, 0.9), hpf=700, fo=0.2, space=True)
P('05_PRE_PIPE_FLOW_V1', T('transfer', 0.3), -21, norm='rms', lpf=3000, fi=0.4, until=RL - 0.2, fo=0.2, tag='flavor in the line')
P(fizz(2.6, rate=110, seed=126), T('transfer', 0.4), -26, width=1.2, tag='flavor fizz')
# TheraBreath comes alive: the glow rises through the bottle, the turbine spins up
P(whoosh(1.6, 600, 5200, q=1.4, seed=127, shape='rise'), T('life', -0.2), -22, width=1.3, tag='the glow rises')
P('02_REVEAL_SHIMMER_BLOOM_V1', T('life', 0.3), -21, trim=(0.85, None), align=0.12, fo=0.6, width=1.6)
P('05_PRE_TURBINE_THERA_V2', T('life', 0.0), -24, fi=0.4, until=RL, fo=0.05, rateauto=[(T('life'), 1.0), (RL, 1.2)])
# the relight: the engines catch and bloom on the score's return
P('08_SPACE_RELIGHT_V1', RL - 0.3, -21, trim=(0.08, 0.45), align='onset', fo=0.1)
P(sub_boom(2.4, 62, 30, 0.3, 0.8), RL + 0.05, -9, tag='relight sub')
P('x4_refuel', RL + 0.03, -17, align='onset', space=True)
P('08_SPACE_RELIGHT_V2', RL + 0.05, -16, trim=(1.0, 3.0), fi=0.2, fo=0.6, lpf=2600, width=1.3)
# FOLLOW? OR LEAD?: both at full thrust over Earth; then TheraBreath overtakes for the Moon
P('09_RACE_THERA_THRUST_V1', T('follow', -0.05), -17, norm='rms', fi=0.1, loop=True, hpf=120, until=T('descent', 1.4), fo=0.6, width=1.4,
  auto=[(T('follow'), 0), (T('overtake'), 1), (T('descent'), -10)], rateauto=[(T('follow'), 1.0), (T('overtake'), 1.15)])
P('05_PRE_TURBINE_RIVAL_V1', T('follow', 0.1), -25, lpf=2000, fi=0.3, until=T('overtake', 1.0), fo=0.6, pan=0.4)
P(whoosh(1.8, 300, 2600, q=0.9, seed=128), T('follow', 0.1), -18, panauto=[(T('follow'), -0.5), (T('follow', 1.8), 0.5)], tag='both, flat out')
P(whoosh(2.0, 250, 2400, q=0.8, seed=129, shape='rise'), T('overtake', -0.3), -18, width=1.5, panauto=[(T('overtake'), 0.2), (T('overtake', 1.9), -0.5)], tag='TheraBreath overtakes')
P(sub_boom(2.0, 60, 28, 0.3, 0.8), T('overtake', 0.1), -12, tag='the lead')
P('11_RING_SPARKLE_PASS_V1', T('overtake', 0.8), -26, hpf=3500, fo=0.6, width=1.6)

# ---------------------------------------------------------------- V. THE MOON
# The music is cut on the descent (its throw rings out). The quiet of space, a few thruster puffs, the landing thrust
# building, the footpad, the engines shut down, the line; the pole goes in; the flag in near silence as the score rises.
P(space_drone(8.5, seed=19), T('descent', -0.1), -42, norm='rms', fi=0.8, until=TOUCH, fo=0.6, tag='moon descent quiet')
P('13_MOON_THRUSTER_PUFFS_V1', T('descent', 1.2), -26, trim=(1.9, 2.6), fo=0.15, pan=0.1)
P('13_MOON_THRUSTER_PUFFS_V1', T('descent', 2.6), -28, trim=(1.95, 2.5), fo=0.15, pan=-0.05)
P('14_HOME_LANDING_THRUST_V1', T('descent', 3.0), -22, lpf=2000, fi=0.8, loop=True, until=TOUCH + 0.1, fo=0.25, auto=[(T('descent', 3.0), -10), (TOUCH - 0.4, 0)])
P('13_MOON_DUST_CRUNCH_V1', T('dust', 0.1), -27, trim=(0.95, 1.48), fo=0.4, width=1.4, tag='dust stirring')
P('x4_quindar', TOUCH - 0.05, -27, rate=1.0465, until=TOUCH + 0.16, fo=0.03)                                   # "the Flavor has landed"
P('13_MOON_TOUCHDOWN_V1', TOUCH, -14, align='onset', fo=0.3, hpf=50)
P('13_MOON_DUST_CRUNCH_V1', TOUCH + 0.03, -19, trim=(0.45, 0.95), align='onset', fo=0.15)                    # the pad presses in
P('05_PRE_VALVE_ACTUATE_V1', TOUCH + 0.08, -32, trim=(0.2, 1.2), lpf=1500, fo=0.4, tag='hydraulic sigh')
P('08_SPACE_ENGINE_CUTOFF_V2', TOUCH + 0.15, -25, trim=(0.2, 1.6), rate=0.9, lpf=2500, fo=0.5)                   # the engines shut down
P(space_drone(6.0, seed=21), T('stand', -0.2), -43, norm='rms', fi=0.8, until=T('flagwide', 0.2), fo=0.4, tag='moon quiet')
P('08_SPACE_METAL_TICKS_V1', T('stand', 0.8), -31, hpf=1500, fo=0.3, pan=-0.1)
# the pole: a servo, a little ratchet, the pole pierces the regolith, CHK, soft granular dust; then almost silence
P('08_SPACE_SERVO_V1', T('pole', -0.1), -25, fo=0.2)
P(ratchet(5, 16.0, seed=65), POLEIN - 0.35, -30, pan=0.15, tag='ratchet')
P('13_MOON_DUST_CRUNCH_V1', POLEIN - 0.02, -24, trim=(0.45, 0.95), align='onset', rate=1.15, fo=0.15, tag='the pole pierces the regolith')
P('x4_clamp', POLEIN + 0.03, -23, trim=(0.5, None), align='onset', pan=0.1, tag='CHK')
P(space_drone(9.0, seed=17), T('flagwide', -0.3), -44, norm='rms', fi=1.2, until=T('orbit2', 0.2), fo=0.6, tag='moon quiet, the flag')
P('08_SPACE_METAL_TICKS_V1', T('flagwide', 2.2), -33, hpf=1800, fo=0.3, pan=0.15, rate=1.1)

# ---------------------------------------------------------------- VI. HOME
# The world's flavors seen from space, The Flavor Factory watching, the lift-off for home, re-entry, down through the
# clouds, birds and air over New Jersey, the campus, Church & Dwight, a soft landing on the lawn, the robot and the six
# samples, the tasting; the score fades under it, so the quiet holds it, and the hush before the card is silent.
P('11_RING_SPARKLE_PASS_V1', T('orbit2', 0.2), -28, hpf=3500, fo=0.8, width=1.6)
P(fizz(1.8, rate=35, seed=130), T('orbit2', 0.1), -33, width=1.6, tag='flavors in orbit')
P('04_CONTROL_ROOMTONE_V1', T('monitors', -0.03), -22, norm='rms', fi=0.04, loop=True, hpf=60, until=T('moonlaunch', 0.04), fo=0.06)
P('beeps', T('monitors', 0.1), -28, norm='rms', lpf=6000, hpf=900, fi=0.05, until=T('moonlaunch', 0.02), fo=0.05, width=1.4, env='room', send=-12)
# off the Moon: a warm ignition, a glint of flavor in the exhaust
P('06_LAUNCH_IGNITION_CRACK_V2', MOONLIFT, -21, align='onset', lpf=3500)
P(sub_boom(2.0, 60, 32, 0.3, 0.6), MOONLIFT + 0.07, -17, tag='moon liftoff sub')
P('06_LAUNCH_ROAR_DISTANT_V1', MOONLIFT + 0.1, -18, lpf=2200, fo=1.0, until=T('homeward', 0.6), width=1.4)
P('13_MOON_DUST_CRUNCH_V1', MOONLIFT + 0.2, -26, trim=(0.45, 1.48), fo=0.5, width=1.5)
P('09_RACE_THERA_THRUST_V1', T('homeward'), -24, norm='rms', fi=0.3, loop=True, lpf=3500, until=T('reentry', 0.2), fo=0.3, width=1.4)
P('11_RING_SPARKLE_PASS_V1', T('homeward', 0.5), -28, hpf=3500, fo=0.8, width=1.6)                          # the sun flares across the hull
# re-entry: plasma and buffeting, then down through the cloud
P('14_HOME_REENTRY_PLASMA_V1', T('reentry', -0.05), -16, until=T('clouds', 0.6), fo=0.6, width=1.6, auto=[(T('reentry'), 0), (T('plasma'), 3), (T('clouds'), -6)])
P(rumble(2.8, 25, 90, seed=31), T('reentry', 0.0), -14, norm='rms', fi=0.1, until=T('clouds', 0.3), fo=0.3, tag='buffeting')
P(whoosh(2.4, 2400, 400, q=0.8, seed=23), T('clouds', -0.2), -22, width=1.6, tag='down through the cloud')
P('07_ASCENT_WIND_SHEAR_V1', T('clouds', 0.1), -24, fi=0.5, loop=True, until=T('nj', 0.5), fo=0.6, width=1.5, lpf=5000)
# New Jersey: evening air, birds, a breeze in the trees; TheraBreath far off, coming in
P('14_HOME_EVENING_AMB_V1', T('nj', -0.3), -22, norm='rms', fi=1.0, loop=True, hpf=150, until=T('hqland', 1.0), fo=0.8, width=1.3)
P('06_LAUNCH_ROAR_DISTANT_V1', T('nj', 0.4), -30, lpf=900, fi=1.0, until=T('forest', 0.4), fo=0.6, tag='TheraBreath, far off')
P(air(4.0, 250, 6000, seed=31), T('forest', -0.1), -30, norm='rms', fi=0.5, until=T('sage', 1.5), fo=0.5, width=1.6, tag='breeze in the trees')
P(chain(4, seed=40), T('flagpole', 0.1), -27, pan=0.2, env='lawn', send=-10, tag='the halyard on the pole')
P('06_LAUNCH_ROAR_DISTANT_V1', T('cdsign', 0.5), -26, lpf=1100, fi=1.0, until=T('hqland', 0.5), fo=0.4, tag='TheraBreath coming in')
P(whoosh(2.2, 300, 1600, q=0.8, seed=131), T('cdsky', 0.2), -24, width=1.5, panauto=[(T('cdsky', 0.2), -0.6), (T('cdsky', 2.2), 0.6)], tag='across the sky')
# the landing on the lawn: the thrust building, touchdown, the engines winding down, cooling ticks
P('14_HOME_LANDING_THRUST_V1', T('hqland', 0.0), -19, fi=0.6, until=HQTOUCH + 0.25, fo=0.3, env='lawn', send=-8, auto=[(T('hqland'), -6), (HQTOUCH - 0.5, 0)])
P(sub_boom(1.2, 70, 40, 0.15, 0.4), HQTOUCH, -16, tag='touchdown on the lawn')
P('13_MOON_DUST_CRUNCH_V1', HQTOUCH + 0.02, -27, trim=(0.45, 0.95), align='onset', rate=1.2, fo=0.2, tag='grit')
P('14_HOME_ENGINE_SPINDOWN_V1', HQTOUCH + 0.1, -21, fo=0.5, until=T('robot', 0.6), env='lawn', send=-10)
P('08_SPACE_METAL_TICKS_V1', HQTOUCH + 1.4, -30, hpf=1500, fo=0.3, env='lawn', send=-10)
# the robot: latch, the hatch swings up, servos, the arm unfolds out of the bottle with six samples, one hesitation,
# glass on the tray, a small musical smile
P('05_HUSH_RELAY_CLICK_V1', HATCH - 0.03, -24, align='onset', env='lawn', send=-12)
P('05_PRE_VALVE_ACTUATE_V2', HATCH, -23, trim=(0.05, 1.5), hpf=900, lpf=9000, fo=0.6, env='lawn', send=-10)
P('14_HOME_ROBOT_ARM_V1', ARM, -24, until=T('robot', 5.0), fo=0.4, pan=-0.15, env='lawn', send=-14)
P('14_HOME_SERVO_HESITATE_V1', ARM + 1.6, -28, fo=0.3, pan=-0.1, env='lawn', send=-12)
P('14_HOME_GLASS_CLINK_V1', ARM + 0.9, -27, rate=0.944, align='onset', env='lawn', send=-12)
P('14_HOME_GLASS_CLINK_V2', SETTLE, -25, rate=0.944, until=T('robot', 5.2), fo=0.3, env='lawn', send=-12)
for k, (fq, g) in enumerate([(1396.9, -31), (1760.0, -32), (2093.0, -31)]):            # a small musical smile
    P(crystal(fq, 0.9, seed=51 + k), SETTLE + 0.1 + 0.09 * k, g, until=T('robot', 5.25), fo=0.3, width=1.4, env='lawn', send=-10, tag='smile')
M.kill('lawn', T('tasting', 0.1), 0.1)
# the tasting: a quiet bright room; a gloved hand sets a glass down beside the others; then silence
P('10_LAB_ROOMTONE_V1', T('tasting', -0.1), -28, norm='rms', fi=0.3, loop=True, until=T('hush', 0.02), fo=0.4)
P('14_HOME_GLASS_CLINK_V2', GLASS, -24, rate=0.944, until=T('tasting', 3.8), fo=0.4, env='lab', send=-10)
M.kill('lab', T('hush'), 0.05)
# the end card: one sung crystal tone with the score's final gesture
P('15_END_CRYSTAL_TONE_V1', ENDTONE, -21, align='onset', width=1.4, env='vast:d', send=-4)
P(crystal(523.25, 5.0, seed=13), ENDTONE + 0.01, -31, width=1.5, env='vast:d', send=-6, tag='end glass C5')

# ---------------------------------------------------------------- VII. THE STINGER
# Back on the Moon, in the quiet: the rival's rough engine sputtering down out of the sky, a clunk, a little wobble,
# one last cough, and it winds down beside the flag.
P(space_drone(5.0, seed=23), T('stgflag', -0.1), -44, norm='rms', fi=0.5, until=T('black2', 0.3), fo=0.5, tag='moon quiet, later')
P('12_FAIL_SPUTTER_V2', T('stgflag', 0.9), -24, trim=(0.7, None), lpf=2600, fi=0.3, until=RIVALLAND + 0.1, fo=0.1, pan=-0.1)
P('14_HOME_LANDING_THRUST_V1', T('stgflag', 1.2), -26, lpf=1500, until=RIVALLAND, fo=0.2, auto=[(T('stgflag', 1.2), -6), (RIVALLAND - 0.3, 0)])
P('13_MOON_TOUCHDOWN_V2', RIVALLAND, -14, align='onset', rate=0.85, fo=0.3, hpf=50)
P('01_OPEN_STRUCTURE_GROAN_V2', RIVALLAND + 0.25, -27, rate=1.6, lpf=3000, fo=0.3)
P('12_FAIL_SPUTTER_V2', RIVALLAND + 0.75, -18, trim=(0.08, 0.62), fo=0.12, pan=0.05)
P('08_SPACE_ENGINE_CUTOFF_V2', RIVALLAND + 0.95, -26, trim=(0.2, 1.4), rate=0.8, fo=0.4, lpf=2500, until=T('black2', 0.4))


def render(dst):
    y = M.render()
    pk = np.abs(y).max()
    sf.write(dst, y.astype(np.float32), SR, subtype='FLOAT')      # float: the mix sets the level
    with open(dst.rsplit('.', 1)[0] + '_cues.tsv', 'w') as f:
        for a, b, src, g, env in sorted(M.log):
            f.write(f"{a:8.3f}\t{b:8.3f}\t{src}\t{g}\t{env}\n")
    print(f"{dst}: {len(y) / SR:.2f}s, peak {20 * np.log10(pk):.1f} dBFS, {len(M.log)} cues")


if __name__ == '__main__':
    render(sys.argv[1] if len(sys.argv) > 1 else '../out/race15_sfx.wav')
