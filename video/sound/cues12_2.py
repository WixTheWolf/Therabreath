# THE FLAVOR RACE V12.2: the sound design, cue by cue, against the V12.2 cut. Read it like a score.
# Every time is T(segment, offset) on the V12.2 timeline; picture events are measured off the source clips (constants
# below). One element leads at a time: SFX, MUSIC, DIALOGUE or SILENCE. The music's share is MUSIC_AUTO and
# MUSIC_CUTS in events12_2.py.
# Identities (from V12): TheraBreath = clean air, a smooth rising turbine, deep clean thrust, a crystal edge.
#             Competitor = a rough uneven idle, a grinding turbine, a cough.
#             The Flavor Factory = relays, soft machines, glass. Discovery = drops, glass, fizz, sparkle.
#             Space = near silence, heard only through the hull.
# V12.1 shapes: the opening conceals the reveal (a distant hum, condensation, ice, venting, radio far away, nothing
# that roars); the lights are three events (bank, bank, blast); the launch has a sonic shape (burner detail, WHUMP,
# full roar, the roar through thick glass, the crowd outdoors, the full roar again), then silence at the edge of space;
# the flag is small and mechanical.
# V12.2 adds: a droplet sliding through cold vapor in the opening; the botanicals and the prism back in the lab; the
# comeback (Mission Control erupts, TheraBreath reels the rival in, dead level, the rival's red light and one puff,
# the surge, the black-smoke sputter, TheraBreath a star at the Moon); the descent to the Moon in silence; the robot
# arm's six samples at home in the quiet.
# usage (from video/sound): python3 cues12_2.py ../out/race122_sfx.wav
import sys
import numpy as np
import soundfile as sf
from sdx import Mix, SR, bp, lp, load, secs, sub_boom, rumble, mains_hum, air, space_drone, whoosh, crystal, flutter
from timeline import Cut

V = Cut('FlavorRaceV12_2')
T = V.t
M = Mix(V.TOTAL)
P = M.put

# picture events (seconds on the V12.2 timeline), measured off the source clips
BANK1, BANK2, BLAST = T('lights', 0.26), T('lights', 2.06), T('lights', 3.24)   # left bank, right bank, every bank (src 1.06, 2.86, 4.04)
SNAP = T('umbi', 0.55)                                   # the umbilical lets go (src 1.55)
THREE, TWO, ONE = T('padcold', 0.61), T('padcold', 1.55), T('padcold', 2.52)    # the count's words (VO at padcold + 0.5)
PRESS = T('button', 0.18)                                # the launch button bottoms out (src 4.2 at 0.75x)
SPARK = T('nozzle', 0.6)                                 # the first igniter sparks (src 0.78 at 0.8x)
CATCH = T('nozzle', 1.25)                                # the flame catches (src 1.3)
BLOOM = T('nozzle', 2.0)                                 # the burner blooms white: WHUMP (src 1.9)
BREATH = BLOOM - 0.36                                     # everything is sucked away: a held breath before the WHUMP
ERUPT = T('padign', 0.02)                                # from above: fire and vapor erupt
PUNCH = T('track', 2.5)                                  # the long lens loses them in the cloud
OUT = T('choice', 0.72)                                  # TheraBreath's flames go out (src 0.6 to 0.95)
DROP = T('drop', 0.651)                                  # the drop meets the dish (src 1.986 at 0.9x)
SEAL = T('cell', 2.645)                                  # the fuel cell locks; frost blooms
GO = T('press', 1.05)                                    # the button glows under the finger
LIFE = T('life', 1.0)                                    # the flavor floods the bottle
RL = T('life', 2.2)                                      # the engines bloom
RED = T('level', 0.4)                                    # the rival's red light comes on (src 0.6)
PUFF = T('level', 0.6)                                   # one puff (src 0.8)
SURGE = T('surge', 0.25)                                 # TheraBreath's exhaust flares and it surges (src 1.45)
SPUT = T('sputter', 0.1)                                 # the rival's engines sputter black smoke
TOUCH = T('foot', 0.4)                                   # Moon touchdown: the pad presses into the regolith (src 3.35)
FOOT = TOUCH
POLE = T('pole', 0.7)                                    # the pole enters the soil (src 9.22)
LIFT = T('moonlift', 0.02)                               # the engines flare (src 0.96)
LAND = T('gag', 1.7)                                     # the rival finally lands (src 2.4)
HOME = T('touch', 3.1)                                   # touchdown at home (src 6.5)
HATCH = T('robot', 0.85)                                 # the hatch unlatches
ARM = T('robot', 1.6)                                    # the arm comes out
SETTLE = T('robot', 4.1)                                 # the tray settles
ENDTONE = T('end', 0.35)                                 # TASTE THE FUTURE resolves on the score's final gesture


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


RADIO = ['radio_count', 'radio2_count', 'radio_home', 'radio2_home', 'radio2_tminus', 'radio2_notideal']


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


def rattle(dur, rate=31.0, seed=0):
    # a big window pane buzzing in its frame under the launch: low thump through the glass and a loose-pane chatter
    t = secs(dur); r = np.random.default_rng(seed)
    am = (0.5 + 0.5 * np.sin(2 * np.pi * rate * t * (1 + 0.03 * np.sin(2 * np.pi * 0.7 * t)))) ** 3
    buzz = bp(r.standard_normal((len(t), 2)), 140, 420) * am[:, None]
    thump = lp(r.standard_normal((len(t), 2)), 70)
    y = buzz / np.abs(buzz).max() + 0.8 * thump / np.abs(thump).max()
    return y / np.abs(y).max()


def ratchet(n=5, rate=15.0, seed=0):
    # a small mechanical ratchet: a few dry pawl clicks
    r = np.random.default_rng(seed); k = int(0.005 * SR); y = np.zeros((int((n / rate + 0.05) * SR), 2))
    for m in range(n):
        i = int(m / rate * SR); b = r.standard_normal((k, 2)) * np.exp(-np.arange(k) / (0.0009 * SR))[:, None]
        y[i:i + k] += b * (0.7 + 0.3 * r.random())
    y = bp(y, 1800, 7500)
    return y / np.abs(y).max()


# ---------------------------------------------------------------- I. THE SURPRISE
# A beauty shoot for a bottle of mouthwash, in a very large, very cold, very quiet place. Nothing roars.
P(machine_hum(8.6, seed=1), 0.4, -31, norm='rms', fi=2.6, until=T('dark', 1.6), fo=0.5, width=0.5,
  auto=[(0.4, -6), (T('label'), 0), (T('dark', 1.0), 2)], tag='distant machine hum')
P('01_OPEN_PLASTIC_TICK_V1', T('sheen', 0.25), -26, trim=(0.18, 0.5), align='onset', pan=0.2, fo=0.05)          # the plastic, catching the light
P(whoosh(1.2, 2400, 5200, q=0.9, seed=60), T('sheen', 0.2), -40, width=1.4, tag='light sliding over plastic')
P('01_OPEN_DROPLET_PLINK_V1', T('drops', 0.55), -23, trim=(0.0, 0.9), align='onset', fo=0.2, pan=0.15, env='vast:a', send=1)   # one drop: how big this place is
P('01_OPEN_FROST_CRACKLE_V1', T('drops', 0.1), -29, trim=(0.4, 3.6), fi=0.4, fo=0.6, hpf=2600, pan=-0.15, width=0.8, tag='tiny ice cracks')
# the droplet: it slides down across the stripe, a wet glide over beaded plastic, and cold vapor breathes past
P(fizz(2.2, rate=22, seed=61), T('droplet', 0.05), -37, width=0.8, env='vast:a', send=-10, tag='condensation beads')
P(whoosh(2.1, 2600, 1400, q=2.4, seed=66), T('droplet', 0.05), -43, fi=0.3, fo=0.4, pan=0.05, tag='droplet glide')
P(whoosh(2.2, 260, 1100, q=0.6, seed=67), T('droplet', 0.1), -38, width=1.6, panauto=[(T('droplet'), -0.6), (T('droplet', 2.2), 0.5)], tag='cold vapor drifting')
P('01_OPEN_DROPLET_PLINK_V2', T('droplet', 2.05), -29, align='onset', fo=0.15, pan=-0.25, env='vast:a', send=0)   # somewhere far below, it lands
P('01_OPEN_CRYO_VENT_FAR_V1', T('droplet', 0.4), -30, norm='rms', hpf=400, lpf=4500, fi=1.0, until=T('lights', 0.3), fo=0.5, pan=0.45,
  env='vast:a', send=-4, tag='subtle venting')
P(chatter(6.6, seed=62), T('sheen', 0.6), -41, norm='rms', fi=1.2, until=T('lights', 0.2), fo=0.4, pan=-0.35, width=0.4,
  env='vast:a', send=2, auto=[(T('sheen'), -4), (T('label'), 0)], tag='radio chatter, very far')
M.kill('vast:a', T('lights', 0.3), 0.4)
# the silhouette: night wind, a structure groaning in the cold, one massive relay somewhere, a transformer waking
P('01_OPEN_NIGHT_WIND_V1', T('dark', -0.1), -26, norm='rms', trim=(6.705, None), fi=0.5, loop=True, until=T('standoff', 2.6), fo=0.4, width=1.5,
  auto=[(T('dark'), 0), (BLAST, 0), (BLAST + 1.0, -3)])
P('01_OPEN_STRUCTURE_GROAN_V1', T('dark', 0.2), -30, lpf=900, fi=0.4, until=T('lights', 1.4), fo=0.8, pan=-0.4, env='pad:a', send=2)
P('01_OPEN_BIG_RELAY_V2', T('dark', 0.9), -21, align='onset', lpf=2800, pan=-0.3, env='pad:a', send=-4)
P('02_REVEAL_TRANSFORMER_RISE_V2', BANK1 - 1.99, -23, trim=(1.15, 3.14), fi=0.9, fo=0.008, env='pad:a', send=-8)
# bank one, left: THUNK. Bank two, right: THUNK. Then every bank at once, the sub a beat late, and the score wakes.
P('02_REVEAL_FLOOD_HIT_V1', BANK1, -12, align='onset', pan=-0.6, env='pad:a', send=-4)
P(sub_boom(1.2, 70, 40, 0.15, 0.3), BANK1 + 0.03, -17, tag='lamp thunk')
P(mains_hum(12, seed=1), BANK1 + 0.05, -27, norm='rms', fi=0.35, until=T('standoff', 2.6), fo=0.4, pan=-0.6, tag='flood hum L')
P('02_REVEAL_RELAY_CHAIN_V2', BANK1 + 0.9, -25, align='onset', lpf=3500, pan=-0.5, env='pad:a', send=-2)
P('02_REVEAL_FLOOD_HIT_V3', BANK2, -11, align='onset', pan=0.65, env='pad:a', send=-1)
P(sub_boom(1.4, 66, 36, 0.18, 0.4), BANK2 + 0.04, -16, tag='lamp thunk')
P(mains_hum(10, seed=2), BANK2 + 0.05, -27, norm='rms', fi=0.35, until=T('standoff', 2.6), fo=0.4, pan=0.65, tag='flood hum R')
P('02_REVEAL_FLOOD_HIT_V1', BLAST, -9, align='onset', pan=-0.3, env='pad:a', send=0)
P('02_REVEAL_FLOOD_HIT_V3', BLAST + 0.012, -9, align='onset', pan=0.35, env='pad:a', send=0)
P('02_REVEAL_FLOOD_HIT_V2', BLAST + 0.02, -11, align='onset', width=1.3)
P('02_REVEAL_SHIMMER_BLOOM_V1', BLAST, -16, trim=(0.85, None), align=0.12, fo=0.8, width=1.6, env='pad:a', send=-6)
P(sub_boom(3.0, 52, 26, 0.4, 1.0), BLAST + 0.11, -8, tag='delayed sub')
P('02_PAD_VAPOR_HISS_V1', BLAST + 0.4, -22, norm='rms', fi=1.5, loop=True, until=T('standoff', 2.6), fo=0.5, lpf=7000, width=1.3, env='pad:a', send=-10)

# ---------------------------------------------------------------- II. SHOW OFF
P('05_PRE_TURBINE_THERA_V2', T('tbpush', 0.1), -29, fi=0.6, until=T('umbi', 0.3), fo=0.4, pan=-0.2, lpf=5000)          # TheraBreath breathing, close
P('05_PRE_UMBILICAL_RELEASE_V2', SNAP, -14, align='onset', pan=0.1, env='pad:a', send=-4)                            # the umbilical lets go
P('x_vent', SNAP + 0.03, -18, width=1.5, env='pad:a', send=-5, eq=((2500, -5, 0.8),))
P('01_OPEN_FROST_CRACKLE_V1', T('frost', -0.05), -24, trim=(1.0, 2.6), hpf=1800, fo=0.3, width=1.2)                  # frost on the valve
P('02_PAD_VAPOR_HISS_V1', T('frost'), -21, norm='rms', hpf=900, fi=0.1, until=T('rival', 0.2), fo=0.25, width=1.4, tag='cold vapor')
# the COMPETITOR: a rough, uneven idle, felt more than noticed
P('03_RIVAL_ROUGH_IDLE_V2', T('rival', -0.15), -18, norm='rms', fi=0.3, lpf=3200, until=T('bells', 0.3), fo=0.4, pan=0.25)
P('03_RIVAL_HYDRAULIC_GROAN_V1', T('rival', 0.6), -27, lpf=2500, until=T('bells', 0.2), fo=0.3, pan=0.35, env='pad:a', send=-6)
# the engine cluster: cold metal, vapor rolling off the bells
P('01_OPEN_CRYO_VENT_FAR_V1', T('bells', -0.05), -24, norm='rms', hpf=300, lpf=6000, fi=0.15, until=T('standoff', 0.3), fo=0.4, width=1.3)
P('08_SPACE_METAL_TICKS_V1', T('bells', 0.3), -28, hpf=1500, fo=0.3, env='pad:a', send=-8)
# the title: a restrained push of air and a soft crystalline resolve. No slam.
P(whoosh(1.1, 90, 420, q=0.8, seed=3), T('standoff', -0.3), -19, width=1.4, tag='air push')
P('02_REVEAL_SHIMMER_BLOOM_V2', T('standoff', 0.1), -25, hpf=2500, fo=1.0, width=1.5, env='pad:b', send=-6)
M.kill('pad:a', T('mcwide'), 0.2)
# THE FLAVOR FACTORY: relays, soft computers, a small warm room
P('04_CONTROL_ROOMTONE_V1', T('mcwide', -0.2), -24, norm='rms', fi=0.2, loop=True, hpf=60, until=T('partners', 0.3), fo=0.4)
P('beeps', T('mcwide'), -30, norm='rms', lpf=6000, hpf=900, loop=True, fi=0.4, until=T('partners', 0.2), fo=0.4, width=1.4, env='room', send=-14)
P('05_HUSH_RELAY_CLICK_V2', T('mcwide', 0.9), -27, align='onset', pan=-0.3, env='room', send=-8)
P('04_CONTROL_READY_CHIME_V2', T('mcwide', 2.2), -32, rate=0.885, align='onset', env='room', send=-8)
P(crystal(1174.66, 1.6, seed=4), T('mcwide', 2.205), -35, env='room', send=-10, tag='ready glass D6')
P(whoosh(1.4, 80, 300, q=0.7, seed=5), T('partners', -0.4), -21, width=1.3, tag='card air')

# ---------------------------------------------------------------- III. LAUNCH
# The count drives the cuts. The pad holds still: vapor, floodlight hum, wind, the turbines spooling.
P('02_PAD_VAPOR_HISS_V1', T('padcold', -0.1), -20, norm='rms', fi=0.3, loop=True, lpf=8000, until=T('nozzle'), fo=0.05, width=1.4, env='pad:c', send=-8,
  lpauto=[(T('button', -0.01), 8000), (T('button'), 900), (T('nozzle', -0.01), 900)])          # muffled while we are inside at the button
P(mains_hum(4, seed=6), T('padcold'), -30, norm='rms', fi=0.3, until=T('nozzle'), fo=0.05, width=1.3, tag='flood hum')
P('01_OPEN_NIGHT_WIND_V1', T('padcold'), -27, norm='rms', trim=(1.0, None), fi=0.4, until=T('nozzle'), fo=0.05, width=1.5)
P('05_PRE_TURBINE_THERA_V1', T('padcold', -0.2), -25, fi=0.4, until=T('nozzle', 0.05), fo=0.05, pan=-0.4, env='pad:c', send=-9,
  auto=[(T('padcold'), -8), (T('nozzle'), 0)], rateauto=[(T('padcold'), 1.0), (T('nozzle'), 1.15)])
P('05_PRE_TURBINE_RIVAL_V1', T('padcold', 0.1), -27, lpf=2500, fi=0.4, until=T('nozzle', 0.05), fo=0.05, pan=0.45, env='pad:c', send=-9)
for w in (THREE, TWO, ONE):                                                              # a heartbeat under each number
    P('x4_heart', w + 0.12, -28, lpf=300)
P('05_PRE_GAUGE_NEEDLE_V1', T('gauge', -0.05), -22, trim=(0.4, 1.5), fo=0.1, env='pad:c', send=-10)                 # the needle climbs
P('05_PRE_TANK_PINGS_V1', T('gauge', 0.35), -27, trim=(0.0, 1.2), fo=0.3, pan=0.3, env='pad:c', send=-6)
P('05_PRE_BUTTON_PRESS_V1', PRESS, -12, align='onset', env='room', send=-10)                                         # the button: heavy, solid, inside
P('x4_switch', PRESS + 0.005, -18, align='onset')
P('05_PRE_UMBILICAL_RELEASE_V2', T('nozzle', 0.05), -18, align='onset', pan=0.1, env='pad:c', send=-5)               # the last line lets go
M.kill('pad:c', T('nozzle', 0.3), 0.3)
# the burner: we look straight into the engine. Metal ticks, fuel pressure, tiny ignition chatter, a low spool. WHUMP.
P('08_SPACE_METAL_TICKS_V1', T('nozzle', 0.05), -25, hpf=1200, fo=0.3, env='pad:d', send=-10)
P('05_PRE_PIPE_FLOW_V1', T('nozzle', 0.1), -22, norm='rms', lpf=3200, fi=0.5, until=BREATH, fo=0.06, tag='fuel pressure',
  auto=[(T('nozzle', 0.1), -8), (BREATH, 0)])
P('02_PAD_VAPOR_HISS_V1', T('nozzle', 0.3), -26, norm='rms', hpf=2500, fi=0.5, until=BREATH, fo=0.06, tag='gas hiss',
  auto=[(T('nozzle', 0.3), -6), (BREATH, 0)])
P('05_PRE_IGNITER_SPARKS_V1', SPARK, -18, hpf=900, fi=0.03, until=BREATH, fo=0.04, env='pad:d', send=-10)
P('05_PRE_IGNITER_SPARKS_V2', SPARK + 0.45, -21, hpf=1200, until=BREATH, fo=0.04, pan=0.2)
P(rumble(2.2, 20, 60, seed=33), T('nozzle', 0.2), -21, norm='rms', fi=1.3, until=BREATH, fo=0.05, tag='low spool')
P(whoosh(1.2, 220, 3600, q=1.2, seed=31, shape='rise'), BREATH - 1.2, -22, width=1.3, fo=0.02, until=BREATH, tag='spool whine')
P('06_LAUNCH_ROAR_BODY_V2', BREATH - 0.75, -20, trim=(0.0, 0.8), rev=True, fi=0.45, fo=0.02, until=BREATH, width=1.6, tag='reverse suck')
P('05_HUSH_RELAY_CLICK_V1', BLOOM - 0.14, -27, align='onset', env='pad:d', send=-4)                        # one relay, in the held breath
P('08_SPACE_RELIGHT_V1', CATCH, -22, trim=(0.08, 0.45), align='onset', fo=0.1, tag='the flame catches')
P('x_whoomph', BLOOM, -9, align='onset', width=1.4, env='pad:d', send=-6, fo=0.6, until=T('padign', 0.7))
P('10_LAB_LAUNCH_THOOMP_V1', BLOOM + 0.01, -11, align='onset', lpf=1800)
P(sub_boom(2.0, 60, 26, 0.3, 0.7), BLOOM + 0.03, -7, tag='WHUMP sub')
# the pad erupts: a violent crack, the sub, steam, and the roar in layers
P('06_LAUNCH_IGNITION_CRACK_V3', ERUPT, -8, align='onset', width=1.3, env='pad:d', send=-3)
P('06_LAUNCH_IGNITION_CRACK_V1', ERUPT + 0.008, -13, align='onset', width=1.5)
P(sub_boom(2.4, 58, 24, 0.35, 0.8), ERUPT + 0.07, -10, tag='ignition sub')
P('06_LAUNCH_STEAM_WALL_V1', ERUPT + 0.1, -13, align=0.4, fo=0.6, width=1.8, until=T('liftoff', 1.0))
P('06_LAUNCH_DEBRIS_RATTLE_V1', ERUPT + 0.2, -18, fo=0.8, pan=-0.35, width=1.2)
# The roar is one continuous body from the eruption to the long lens. It is shaped by where we stand:
# full on the pad, through thick glass in the firing room (no highs, the low end shaking the pane), distant and
# airy behind the crowd, then all of it at once when we cut back to the rockets.
FULL, GLASSF, CROWDF = 16000, 420, 1700
roar_lp = [(T('padign'), FULL), (T('window', -0.01), FULL), (T('window'), GLASSF), (T('crowd', -0.01), GLASSF), (T('crowd'), CROWDF),
           (T('tbfire', -0.01), CROWDF), (T('tbfire'), FULL)]
roar_gain = [(T('padign'), -5), (T('liftoff', -0.1), -2), (T('liftoff', 0.3), 5), (T('window', -0.01), 5), (T('window'), -3), (T('crowd', -0.01), -3), (T('crowd'), -9),
             (T('tbfire', -0.01), -9), (T('tbfire'), 2), (T('track', 0.1), 1), (T('track', 0.4), -30)]
P('06_LAUNCH_ROAR_BODY_V2', T('padign', 0.02), 0, norm='rms', fi=0.12, loop=True, until=T('track', 0.45), fo=0.05, width=1.4, env='pad:d', send=-6,
  lpauto=roar_lp, auto=roar_gain, tag='roar body')
P('06_LAUNCH_ROAR_BODY_V1', T('padign', 0.4), -3, norm='rms', fi=0.4, loop=True, until=T('track', 0.45), fo=0.05, width=1.6,
  lpauto=roar_lp, auto=roar_gain, tag='roar body 2')
P(rumble(8.0, 22, 60, seed=9), T('padign', 0.05), -6, norm='rms', fi=0.2, until=T('track', 0.5), fo=0.6, tag='liftoff sub rumble',
  auto=[(T('padign'), -4), (T('liftoff'), 0), (T('window', -0.01), 0), (T('window'), 2), (T('crowd'), -6), (T('tbfire'), 0)])
P('06_LAUNCH_CRACKLE_V1', T('liftoff', 0.1), -8, until=T('window', 0.02), fo=0.05, width=1.5, env='pad:d', send=-6)
P('06_LAUNCH_GANTRY_SHAKE_V1', T('liftoff', 0.4), -12, until=T('window', 0.02), fo=0.05, pan=0.3, env='pad:d', send=-5)
P('06_LAUNCH_DEBRIS_RATTLE_V2', T('liftoff', 1.4), -19, until=T('window', 0.02), fo=0.05, pan=0.4, width=1.2)
M.kill('pad:d', T('window'), 0.05)
# the firing room: we went indoors. The pane buzzes in its frame, the room answers, consoles, the radio channel.
P(rattle(2.4, seed=63), T('window'), -15, norm='rms', fi=0.02, until=T('crowd', 0.02), fo=0.05, width=1.1, env='room', send=-6, tag='window pane')
P('04_CONTROL_ROOMTONE_V1', T('window', -0.02), -22, norm='rms', fi=0.02, loop=True, hpf=60, until=T('crowd', 0.02), fo=0.05)
P('beeps', T('window', 0.2), -27, norm='rms', lpf=6000, hpf=900, fi=0.05, until=T('crowd', 0.02), fo=0.05, width=1.4, env='room', send=-12)
P('x4_quindar', T('window', 0.35), -27, rate=1.0465, until=T('window', 0.56), fo=0.03, env='room', send=-12)
P(chatter(1.8, seed=64, gap=(0.06, 0.25), frag=(0.2, 0.5)), T('window', 0.5), -26, norm='rms', fi=0.05, until=T('crowd', 0.02), fo=0.05,
  pan=0.25, env='room', send=-8, tag='radio chatter, firing room')
P('05_HUSH_RELAY_CLICK_V2', T('window', 1.3), -27, align='onset', pan=-0.4, env='room', send=-8)
# the fans: outdoors, the roar far off over the field, wind, people yelling, then the cheer; it carries across the cut
P('01_OPEN_NIGHT_WIND_V1', T('crowd', -0.02), -25, norm='rms', trim=(2.0, None), fi=0.05, until=T('tbfire', 0.5), fo=0.3, width=1.6)
P('x_crowd', T('crowd', -0.05), -11, trim=(1.0, None), fi=0.08, until=T('tbfire', 0.55), fo=0.45, width=1.6, tag='crowd yelling')
P('x_applause', T('crowd', 0.55), -15, fi=0.15, until=T('tbfire', 0.55), fo=0.45, width=1.7, tag='the cheer')
# back to the rockets at the peak: the full spectrum, all at once
P('06_LAUNCH_STEAM_WALL_V1', T('tbfire'), -11, align=0.3, fo=0.5, width=1.8, until=T('track', 0.3))
P('06_LAUNCH_CRACKLE_V1', T('tbfire', 0.02), -10, until=T('track', 0.3), fo=0.3, width=1.5)
P('06_LAUNCH_DEBRIS_RATTLE_V2', T('tbfire', 0.3), -19, fo=0.5, pan=0.4, width=1.2)
P(sub_boom(2.0, 55, 28, 0.3, 0.8), T('tbfire', 0.02), -10, tag='back to the rockets')
# the long lens: miles away, the sound arrives late and thin; the crackle tears; then the cloud swallows them
P('06_LAUNCH_ROAR_DISTANT_V1', T('track', 0.25), -14, fi=0.3, until=PUNCH + 0.5, fo=0.8, lpf=1400, width=1.2, env='pad:e', send=-4)
P('06_LAUNCH_CRACKLE_V1', T('track', 0.5), -19, lpf=2600, until=PUNCH + 0.3, fo=0.6, width=1.4, env='pad:e', send=-6)
P('07_ASCENT_CLOUD_PUNCH_V1', PUNCH - 0.15, -18, lpf=4000, fo=0.5, width=1.6)
M.kill('pad:e', T('onboard'), 0.2)
# onboard: wind roaring over the hull, thinning as the sky goes black; at the edge of space it is simply gone
P('07_ASCENT_WIND_SHEAR_V1', T('onboard', -0.05), -15, fi=0.1, loop=True, until=T('pitch', 0.35), fo=0.3, width=1.4,
  auto=[(T('onboard'), 0), (T('pitch'), -12)], rateauto=[(T('onboard'), 1.0), (T('pitch'), 1.3)], lpauto=[(T('onboard'), 9000), (T('pitch'), 1800)])
P('06_LAUNCH_ROAR_BODY_V2', T('onboard', -0.05), -11, norm='rms', loop=True, until=T('pitch', 0.35), fo=0.3, width=1.2,
  lpauto=[(T('onboard'), 2000), (T('pitch'), 300)], auto=[(T('onboard'), 0), (T('pitch'), -10)])
P('08_SPACE_HULL_HUM_V1', T('onboard', 0.4), -30, norm='rms', fi=1.0, loop=True, until=T('side', 0.3), fo=0.4,
  auto=[(T('pitch', 0.3), 0), (T('pitch', 1.0), -6)])
P('08_SPACE_SERVO_V2', T('pitch', 0.9), -29, fo=0.2, env='hull', send=-12)                                # the gimbal: the pitch-over
P('01_OPEN_STRUCTURE_GROAN_V2', T('pitch', 1.5), -32, rate=1.3, lpf=1500, fo=0.5, space=True)

# ---------------------------------------------------------------- IV. THE RACE AND THE CHOICE
P(space_drone(12.0, seed=15), T('side', -0.3), -40, norm='rms', fi=0.8, until=T('sees', 0.6), fo=1.0, tag='space drone')
P('09_RACE_THERA_THRUST_V1', T('side'), -19, norm='rms', fi=0.3, loop=True, until=T('choice', 1.0), fo=0.6, space=True, pan=-0.2,
  auto=[(T('side'), 0), (T('choice'), -2), (T('choice', 0.9), -18)])
P('05_PRE_TURBINE_RIVAL_V1', T('side', 0.2), -27, lpf=1800, fi=0.6, until=T('choice', 1.0), fo=0.8, pan=0.35,
  auto=[(T('side'), -4), (T('neck'), 0), (T('edge'), 0), (T('choice', 0.9), -10)])
P('09_RACE_RIVAL_PASS_V2', T('neck', 0.8), -24, align='peak', lpf=2500, pan=0.15)
P('05_PRE_TURBINE_RIVAL_V1', T('rivalcu', -0.1), -20, lpf=2600, fi=0.1, until=T('edge', 0.3), fo=0.3, pan=0.3,
  rateauto=[(T('rivalcu'), 1.0), (T('edge', 0.3), 1.2)], tag='rival winds up')
P('09_RACE_RIVAL_PASS_V1', T('edge', 0.35), -18, align='peak', width=1.2, panauto=[(T('edge'), 0.1), (T('edge', 1.0), 0.25)], tag='the rival edges ahead')
P(whoosh(1.6, 900, 300, q=0.9, seed=21), T('edge', 0.1), -27, width=1.3, tag='a length ahead')
P('08_SPACE_ENGINE_CUTOFF_V2', OUT - 0.1, -18, trim=(0.2, 2.0), rate=1.15, fo=0.35, space=True)
P('08_SPACE_ENGINE_CUTOFF_V2', OUT - 0.1, -28, trim=(0.2, 2.0), rate=1.15, fo=0.35, lpf=1600)
P('x_cutoff', OUT + 0.6, -33, trim=(0.33, 2.6), lpf=2500, fo=0.8)
P('08_SPACE_METAL_TICKS_V1', OUT + 0.9, -30, hpf=1200, fo=0.3, env='hull', send=-10)

# ---------------------------------------------------------------- V. DISCOVERY
P('11_RING_SPARKLE_PASS_V1', T('sees', -0.2), -27, hpf=3000, fo=0.8, width=1.6)
P(fizz(2.6, rate=40, seed=40), T('sees', 0.2), -31, width=1.6, tag='fizz far')
P('10_LAB_CITRUS_SPLIT_V1', T('yuzu', 0.02), -10, until=T('citrus'), fo=0.15, env='lab', send=-12)
P(air(17, 250, 9000, hum=0.15, seed=10), T('citrus', -0.1), -27, norm='rms', fi=0.25, until=T('lean', 0.2), fo=0.4, tag='lab air')
P('10_LAB_MIST_SPRAY_V1', T('citrus', 0.6), -16, hpf=1500, fo=0.4, env='lab', send=-6)
# the botanicals, one beat each: tea leaves, a cucumber slice, rose petals
P('10_LAB_LEAVES_V1', T('tea'), -13, trim=(0.0, 0.6), fo=0.12, width=1.3)
P('10_LAB_SLICE_V1', T('cuke', 0.02), -11, trim=(0.0, 0.7), fo=0.1)
P(flutter(0.5, seed=9), T('rose'), -17, width=1.4, tag='petals')
P('10_LAB_AROMA_AIR_V1', T('rose', -0.05), -22, trim=(0.3, 0.9), hpf=1200, fo=0.2)
P('01_OPEN_DROPLET_PLINK_V1', DROP, -13, trim=(0.0, 0.9), align='onset', fo=0.2, env='lab', send=-3)
P('10_LAB_DROP_GLASS_V2', DROP + 0.005, -18, rate=0.929, align='onset', env='lab', send=-6)
P('10_LAB_CRYSTAL_SING_V1', DROP + 0.12, -23, rate=1.0663, fi=0.5, until=T('prism', 0.5), fo=0.6, width=1.3, env='lab', send=-6)
# the prism: white light splits into a spectrum, a glassy shimmer and one high note
P('02_REVEAL_SHIMMER_BLOOM_V1', T('prism', 0.1), -20, trim=(0.85, 3.2), align=0.12, fo=0.4, env='lab', send=-6)
P(crystal(1567.98, 1.8, seed=43), T('prism', 0.9), -33, width=1.5, env='lab', send=-8, tag='prism glass G6')
P(fizz(1.6, rate=60, seed=42), DROP + 0.25, -30, width=1.3, env='lab', send=-8, tag='fizz')
P('10_LAB_AROMA_AIR_V1', T('aroma', 0.08), -20, width=1.5, env='lab', send=-6)
P('11_RING_SPARKLE_PASS_V1', T('aroma', 0.5), -28, hpf=4000, fo=0.6, width=1.6)
P(fizz(1.6, rate=90, seed=41), T('aroma', 0.1), -27, width=1.5, env='lab', send=-8, tag='fizz')
# the formulation: the vial slides home into the fuel cell, twists, locks; frost blooms over the steel
P('05_PRE_VALVE_ACTUATE_V1', T('cell', 0.25), -27, trim=(0.0, 0.9), hpf=800, fo=0.2, env='lab', send=-8)
P('10_LAB_TWIST_LOCK_V1', T('cell', 1.2), -20, fo=0.2, env='lab', send=-8)
P('10_LAB_TWIST_LOCK_V2', SEAL - 0.315, -15, rate=1.3, align=0.158, env='lab', send=-8)
P('10_LAB_FROST_BLOOM_V1', SEAL - 0.02, -20, until=T('lean', 0.3), fo=0.4, env='lab', send=-6)
# Mission Control leans in, and sends it
P('04_CONTROL_ROOMTONE_V1', T('lean', -0.2), -24, norm='rms', fi=0.2, loop=True, hpf=60, until=T('signal', 0.3), fo=0.4)
P('beeps', T('lean'), -31, norm='rms', lpf=6000, hpf=900, loop=True, fi=0.3, until=T('signal', 0.2), fo=0.4, width=1.4, env='room', send=-14)
P('02_REVEAL_RELAY_CHAIN_V1', T('lean', 0.6), -27, align='onset', lpf=4000, pan=0.4, env='room', send=-6)
P('x4_switch', GO, -20, align='onset')
P('04_CONTROL_READY_CHIME_V2', GO + 0.04, -28, rate=0.885, align='onset', env='room', send=-8)
P(crystal(1174.66, 1.6, seed=4), GO + 0.05, -32, env='room', send=-10, tag='ready glass D6')
# the signal: a thread of glass rising from Earth, taken up by the fins
P(whoosh(1.4, 600, 4200, q=1.6, seed=44, shape='rise'), T('signal', -0.2), -26, width=1.2, tag='signal rise')
P('11_RING_SPARKLE_PASS_V1', T('signal', 0.5), -25, hpf=3000, fo=0.6, width=1.4)
for k, (fq, g) in enumerate([(880.0, -30), (1318.5, -32), (1760.0, -33)]):
    P(crystal(fq, 2.2, seed=70 + k), T('signal', 0.8 + 0.12 * k), g, width=1.4, env='hull', send=-12, tag='signal glass')
P('13_MOON_THRUSTER_PUFFS_V1', T('signal', 1.9), -22, trim=(1.9, 2.6), fo=0.15, pan=-0.3, space=True)
# the transfer: the port opens, the line docks with a click, the flavor flows in, the glow races along the seams
P('05_PRE_VALVE_ACTUATE_V1', T('transfer', 0.1), -24, trim=(0.0, 0.9), hpf=700, fo=0.2, space=True)
P('x4_clamp', T('transfer', 0.75), -19, trim=(0.55, None), align='onset', space=True)
P('05_PRE_PIPE_FLOW_V1', T('transfer', 1.0), -22, norm='rms', lpf=3000, fi=0.4, until=T('life', 0.3), fo=0.3)
P(fizz(2.4, rate=80, seed=48), T('transfer', 1.0), -27, width=1.2, tag='flavor in the line')
P(whoosh(0.9, 800, 5200, q=1.5, seed=49, shape='rise'), T('transfer', 2.6), -24, tag='glow along the seams')
# new life: the flavor floods the bottle, frost sublimates, and the engines bloom
P('02_REVEAL_SHIMMER_BLOOM_V1', LIFE - 0.4, -18, trim=(0.85, None), align=0.12, fo=0.8, width=1.6)
P(fizz(2.6, rate=150, seed=45), LIFE - 0.2, -22, width=1.6, tag='flavor fizz')
P('10_LAB_FROST_BLOOM_V1', LIFE, -22, fo=0.5, width=1.4)
P('08_SPACE_RELIGHT_V1', RL - 0.35, -22, trim=(0.08, 0.45), align='onset', fo=0.1)
P(sub_boom(2.4, 62, 30, 0.3, 0.8), RL + 0.05, -10, tag='relight sub')
P('x4_refuel', RL + 0.03, -17, align='onset', space=True)
P('08_SPACE_RELIGHT_V2', RL + 0.05, -17, trim=(1.0, 3.0), fi=0.2, fo=0.6, lpf=2400, width=1.3)
# THE COMEBACK. The music drives; the effects are the punctuation. Mission Control erupts, TheraBreath's clean thrust
# returns and keeps building, the rival's rough idle is reeled in until they are dead level, a red light, one puff,
# TheraBreath surges past, the rival sputters black smoke, and TheraBreath is a star at the Moon. Fun, not a breakdown.
# Mission Control: the room erupts, people on their feet, the wall screen flares
P('04_CONTROL_ROOMTONE_V1', T('mcerupt', -0.05), -24, norm='rms', fi=0.05, loop=True, hpf=60, until=T('throttle', 0.05), fo=0.1)
P('x_crowd', T('mcerupt', 0.2), -19, trim=(3.0, None), lpf=5000, hpf=180, fi=0.15, until=T('throttle', 0.35), fo=0.3, width=1.3, env='room', send=-6, tag='the room erupts')
P('x_applause', T('mcerupt', 0.3), -22, lpf=6500, fi=0.1, until=T('throttle', 0.35), fo=0.3, width=1.4, env='room', send=-8, tag='hands')
P('02_REVEAL_RELAY_CHAIN_V1', T('mcerupt', 0.05), -29, align='onset', lpf=4000, pan=-0.3, env='room', send=-6)
P(whoosh(1.0, 700, 3600, q=1.2, seed=80, shape='rise'), T('mcerupt', -0.1), -30, width=1.4, tag='the wall screen flares')
# TheraBreath at full throttle: deep clean thrust, the turbine climbing; it carries the whole chase
# (the loop is cut before the pitch climb shortens it, so `until` reaches past the cut to end it at the descent)
P('09_RACE_THERA_THRUST_V1', T('throttle', -0.05), -16, norm='rms', fi=0.1, loop=True, hpf=120, until=T('approach', 1.6), fo=0.5, width=1.4,
  auto=[(T('throttle'), 0), (T('reel'), -2), (T('level'), -1), (SURGE, 2), (T('sputter'), -4), (T('winner'), -6), (T('approach'), -12)],
  rateauto=[(T('throttle'), 1.0), (T('level'), 1.06), (T('inch'), 1.1), (SURGE, 1.18), (T('winner'), 1.2)])
P(whoosh(1.5, 300, 2600, q=0.9, seed=32), T('throttle', 0.05), -18, panauto=[(T('throttle'), 0.6), (T('throttle', 1.5), -0.6)], tag='TheraBreath streaks past')
P(sub_boom(1.6, 58, 30, 0.25, 0.6), T('throttle', 0.03), -14, tag='full throttle')
# reeling it in: the rival's rough idle grows closer and louder, panned right; the gap closes
P('03_RIVAL_ROUGH_IDLE_V2', T('reel', -0.05), -22, norm='rms', lpf=2600, fi=0.6, until=T('surge', 1.6), fo=0.8, pan=0.35,
  auto=[(T('reel'), -5), (T('level'), 0), (T('inch'), 0), (SURGE, -2), (T('surge', 1.6), -12)])
P(whoosh(1.5, 180, 1400, q=1.0, seed=81, shape='rise'), T('reel'), -22, width=1.3, tag='closing')
# dead level: the rival's red light, a little alarm, and one puff
P('x4_alarm', RED, -29, rate=0.71, lpf=1800, fi=0.04, loop=True, until=T('inch', 0.5), fo=0.3, pan=0.3)
P('12_FAIL_SPUTTER_V2', PUFF, -12, trim=(0.08, 0.62), fo=0.12, pan=0.3, env='hull', send=-12)
# the inch: everything tightens for a breath
P(whoosh(0.8, 400, 3200, q=1.6, seed=82, shape='rise'), T('inch', -0.05), -24, width=1.2, fo=0.02, until=SURGE, tag='the inch')
# the surge: the exhaust flares, a deep push of air, a glint of flavor, and it is away
P(sub_boom(2.2, 60, 28, 0.3, 0.8), SURGE, -9, tag='surge sub')
P('08_SPACE_RELIGHT_V2', SURGE - 0.05, -16, trim=(1.0, 2.8), fi=0.1, fo=0.6, lpf=3000, width=1.4, tag='the exhaust flares')
P(whoosh(2.0, 250, 2400, q=0.8, seed=83), SURGE, -17, width=1.5, panauto=[(SURGE, -0.2), (SURGE + 2.0, -0.6)], tag='TheraBreath surges past')
P('11_RING_SPARKLE_PASS_V1', SURGE + 0.3, -27, hpf=3500, fo=0.6, width=1.6)
# the rival: its engines sputter black smoke, cough on into the next shot, and flicker as TheraBreath reaches the Moon
P('12_FAIL_SPUTTER_V2', SPUT, -13, trim=(0.7, None), lpf=3500, fi=0.05, until=T('winner', 0.9), fo=0.5, pan=0.2, tag='black smoke')
P('12_FAIL_SPUTTER_V2', T('winner', 1.0), -19, trim=(0.08, 0.62), fo=0.12, pan=0.1, tag='flicker')
P('12_FAIL_SPUTTER_V2', T('winner', 1.55), -22, trim=(0.08, 0.5), fo=0.12, pan=0.1, tag='flicker')
P(whoosh(2.2, 1800, 600, q=1.0, seed=84), T('winner', 0.0), -30, width=1.3, tag='TheraBreath, far ahead')

# ---------------------------------------------------------------- VI. THE MOON
# The music is cut on the descent (its throw rings out over the Moon). The quiet of space, a few thruster puffs, the
# landing thrust building, touchdown on the foot, the engines shut down, and the line.
P(space_drone(5.0, seed=18), T('approach', -0.1), -42, norm='rms', fi=0.8, until=TOUCH, fo=0.6, tag='moon descent quiet')
P('13_MOON_THRUSTER_PUFFS_V1', T('approach', 1.0), -26, trim=(1.9, 2.6), fo=0.15, pan=0.1)
P('13_MOON_THRUSTER_PUFFS_V1', T('approach', 2.1), -28, trim=(1.95, 2.5), fo=0.15, pan=-0.05)
P('14_HOME_LANDING_THRUST_V1', T('approach', 1.4), -22, lpf=2000, fi=0.6, loop=True, until=TOUCH + 0.1, fo=0.25,
  auto=[(T('approach', 1.4), -8), (TOUCH - 0.4, 0)])
P('x4_quindar', TOUCH - 0.05, -27, rate=1.0465, until=TOUCH + 0.16, fo=0.03)                                   # "the Flavor has landed"
P('13_MOON_TOUCHDOWN_V1', TOUCH, -14, align='onset', fo=0.3, hpf=50)
P('13_MOON_DUST_CRUNCH_V1', TOUCH + 0.03, -19, trim=(0.45, 0.95), align='onset', fo=0.15)                    # the pad presses in
P('05_PRE_VALVE_ACTUATE_V1', TOUCH + 0.08, -32, trim=(0.2, 1.2), lpf=1500, fo=0.4, tag='hydraulic sigh')
P('08_SPACE_ENGINE_CUTOFF_V2', TOUCH + 0.15, -25, trim=(0.2, 1.6), rate=0.9, lpf=2500, fo=0.5)                   # the engines shut down
P('13_MOON_DUST_CRUNCH_V1', TOUCH + 0.9, -28, trim=(0.95, 1.48), fo=0.3, width=1.3, tag='dust settling')
# landed: TheraBreath stands on the Moon, Earth behind it. Cooling metal, a breath of quiet.
P(space_drone(5.0, seed=19), T('stand', -0.2), -44, norm='rms', fi=0.6, until=T('pole', 0.2), fo=0.4, tag='moon quiet')
P('08_SPACE_METAL_TICKS_V1', T('stand', 0.6), -31, hpf=1500, fo=0.3, pan=-0.1)
P('08_SPACE_METAL_TICKS_V1', T('stand', 1.9), -33, hpf=1800, fo=0.3, pan=0.15, rate=1.1)
# the pole: a servo, a tiny ratchet, the pole pierces the regolith, a soft spill of dust. Then almost silence.
P('08_SPACE_SERVO_V1', T('pole', 0.0), -25, fo=0.2)
P(ratchet(5, 16.0, seed=65), POLE - 0.42, -30, pan=0.15, tag='ratchet')
P('x4_clamp', POLE - 0.01, -23, trim=(0.5, None), align='onset', pan=0.1, tag='CHK')
P('13_MOON_DUST_CRUNCH_V1', POLE, -17, trim=(0.45, 0.95), align='onset', rate=0.8, fo=0.15)
P(sub_boom(0.8, 90, 50, 0.1, 0.25), POLE + 0.01, -26, tag='pole thunk')
P('13_MOON_DUST_CRUNCH_V1', POLE + 0.2, -29, trim=(0.95, 1.48), fo=0.3, tag='granular dust')
P('14_HOME_SERVO_HESITATE_V1', T('pole', 1.25), -33, hpf=1500, fo=0.2, pan=0.2)
P(space_drone(6.0, seed=17), T('moonwide', -0.3), -44, norm='rms', fi=1.2, until=LIFT, fo=0.3, tag='moon quiet')
# off the Moon: a warm ignition, then a glint of flavor in the exhaust
P('06_LAUNCH_IGNITION_CRACK_V2', LIFT, -22, align='onset', lpf=3500)
P(sub_boom(2.0, 60, 32, 0.3, 0.6), LIFT + 0.07, -19, tag='moon liftoff sub')
P('06_LAUNCH_ROAR_DISTANT_V1', LIFT + 0.1, -18, lpf=2200, fo=1.2, until=T('gag', 0.2), width=1.4)
P('11_RING_SPARKLE_PASS_V1', LIFT + 0.6, -29, hpf=4000, fo=0.8, width=1.7)
P('13_MOON_DUST_CRUNCH_V1', LIFT + 0.2, -26, trim=(0.45, 1.48), fo=0.5, width=1.5)
# meanwhile: the rival finally lands beside the flag. A clunk, a little wobble, one last cough, and it winds down.
P('12_FAIL_SPUTTER_V2', T('gag', 0.1), -21, trim=(0.7, None), lpf=3200, fi=0.2, until=LAND + 0.1, fo=0.1, pan=-0.1)
P('14_HOME_LANDING_THRUST_V1', T('gag', 0.2), -24, lpf=1600, until=LAND, fo=0.2)
P('13_MOON_TOUCHDOWN_V2', LAND, -14, align='onset', rate=0.85, fo=0.3, hpf=50)
P('01_OPEN_STRUCTURE_GROAN_V2', LAND + 0.25, -27, rate=1.6, lpf=3000, fo=0.3)
P('12_FAIL_SPUTTER_V2', LAND + 0.65, -18, trim=(0.08, 0.62), fo=0.12, pan=0.05)
P('08_SPACE_ENGINE_CUTOFF_V2', LAND + 0.8, -26, trim=(0.2, 1.4), rate=0.8, fo=0.4, lpf=2500, until=T('homeward', 0.1))

# ---------------------------------------------------------------- VII. HOME
P('09_RACE_THERA_THRUST_V1', T('homeward'), -28, norm='rms', fi=0.3, loop=True, lpf=3000, until=T('homeward', 2.3), fo=0.8, width=1.4)
P('14_HOME_REENTRY_PLASMA_V1', T('homeward', 1.2), -24, until=T('descent', 0.3), fo=0.8, width=1.5)
P(whoosh(1.6, 2400, 400, q=0.8, seed=23), T('descent', -0.2), -24, width=1.6, tag='through the cloud')
P('14_HOME_EVENING_AMB_V1', T('descent', 0.6), -24, norm='rms', fi=1.2, loop=True, hpf=150, until=T('hush', 0.02), fo=0.05, width=1.3)
P('06_LAUNCH_ROAR_DISTANT_V1', T('descent', 1.0), -25, lpf=900, fi=1.0, until=T('touch', 0.3), fo=0.8)
P('14_HOME_LANDING_THRUST_V1', T('touch', -0.1), -18, fi=0.3, until=HOME + 0.25, fo=0.3, env='lawn', send=-8)
P(sub_boom(1.2, 70, 40, 0.15, 0.4), HOME, -17, tag='home touchdown')
P('14_HOME_ENGINE_SPINDOWN_V1', HOME + 0.1, -21, fo=0.5, until=T('robot', 0.6), env='lawn', send=-10)
# the robot: latch, the hatch swings up, servos, the arm unfolds out of the bottle with six samples, one hesitation,
# glass on the tray, a small musical smile. The score is gone by then, so the quiet holds it.
P('05_HUSH_RELAY_CLICK_V1', HATCH - 0.03, -24, align='onset', env='lawn', send=-12)
P('05_PRE_VALVE_ACTUATE_V2', HATCH, -23, trim=(0.05, 1.5), hpf=900, lpf=9000, fo=0.6, env='lawn', send=-10)
P('14_HOME_ROBOT_ARM_V1', ARM, -24, until=T('robot', 5.0), fo=0.4, pan=-0.15, env='lawn', send=-14)
P('14_HOME_GLASS_CLINK_V1', ARM + 0.9, -27, rate=0.944, align='onset', env='lawn', send=-12)
P('14_HOME_SERVO_HESITATE_V2', SETTLE - 0.7, -30, hpf=2500, fo=0.1, pan=-0.1, env='lawn', send=-14)
P('14_HOME_GLASS_CLINK_V2', SETTLE, -25, rate=0.944, until=T('robot', 5.2), fo=0.3, env='lawn', send=-12)
for k, (fq, g) in enumerate([(1396.9, -31), (1760.0, -32), (2093.0, -31)]):            # a small musical smile, gone before the black
    P(crystal(fq, 0.9, seed=51 + k), SETTLE + 0.1 + 0.09 * k, g, until=T('robot', 5.25), fo=0.3, width=1.4, env='lawn', send=-10, tag='smile')
M.kill('lawn', T('hush'), 0.05)
# the end card: one sung crystal tone with the score's final gesture
P('15_END_CRYSTAL_TONE_V1', ENDTONE, -21, align='onset', width=1.4, env='vast:d', send=-4)
P(crystal(587.33, 5.0, seed=13), ENDTONE + 0.01, -30, width=1.5, env='vast:d', send=-6, tag='end glass D5')


def render(dst):
    y = M.render()
    pk = np.abs(y).max()
    sf.write(dst, y.astype(np.float32), SR, subtype='FLOAT')      # float: the mix sets the level
    with open(dst.rsplit('.', 1)[0] + '_cues.tsv', 'w') as f:
        for a, b, src, g, env in sorted(M.log):
            f.write(f"{a:8.3f}\t{b:8.3f}\t{src}\t{g}\t{env}\n")
    print(f"{dst}: {len(y) / SR:.2f}s, peak {20 * np.log10(pk):.1f} dBFS, {len(M.log)} cues")


if __name__ == '__main__':
    render(sys.argv[1] if len(sys.argv) > 1 else '../out/race122_sfx.wav')
