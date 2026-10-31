# THE FLAVOR RACE V16: the sound design, cue by cue, against the V16 cut. Read it like a score. Every time is
# T(segment, offset) on the V16 timeline; picture events are measured per frame off the source clips (constants below)
# so every effect sits on its frame. One element leads at a time: SFX, MUSIC, DIALOGUE or SILENCE. The music's share
# is MUSIC_AUTO and MUSIC_CUTS in events16.py; its sections are placed in music16.py; the radio lines in vo16.py.
# Identities (from V12): TheraBreath = clean air, a smooth rising turbine, deep clean thrust, a crystal edge.
#             Competitor = a rough uneven idle, a grinding turbine, a cough.
#             The Flavor Factory = soft machines, glass, a warm room. Discovery = drops, glass, fizz, sparkle.
#             Space = near silence, heard only through the hull.
# Shapes: the opening conceals the reveal (a distant hum, condensation, tiny ice cracks, venting, radio far away,
# nothing roars) until the pad floods with light; the title gets a restrained low push, not a slam; the Moon behind
# the pad is wind and a far tower; the count drives the cuts and the burner plays in near silence until WHUMP; the wide
# lift-off is one of the loudest moments, the crowd is outdoors and the rockets come back at full range; silence at
# the edge of space; the race is punctuation under the score; the rival pulls away and thins into the distance; the
# warning light is small and worried; the search and the montage are glass, leaves, juice and frost, one sound per
# cut, each on its picture frame; the relight lands on the score's return; the pass is one clean sweep; Mission
# Control's cheer is a room, not a stadium; the Moon is near silence; home is air, birds and a soft landing; the robot
# is small and precise; the hush before the card is silent; the stinger is the rival's sputtering arrival in the quiet.
# usage (from video/sound): python3 cues16.py ../out/race16_sfx.wav
import sys
import numpy as np
import soundfile as sf
from sdx import Mix, SR, bp, lp, load, secs, sub_boom, rumble, mains_hum, air, space_drone, whoosh, crystal, flutter
from timeline import Cut

V = Cut('FlavorRaceV16')
T = V.t
M = Mix(V.TOTAL)
P = M.put

# picture events (seconds on the V16 timeline), measured off the source clips
TITLE = T('every', 0.81)                                 # HAS A RACE. lands (the big word arrives 5 frames after the small one at +0.6)
LAMP = T('lights', 0.71)                                 # the pad floods with light (cc51b641 src 1.375)
BEAMS = [T('lights', 4.62), T('lights', 5.15)]           # the searchlight beams come on (src 5.29, 5.82)
MOONCLEAR = T('padmoon', 1.0)                            # the clouds clear the Moon (n01_padmoon src 2.0)
THREE, TWO, ONE = T('cap', 3.89), T('cap', 4.83), T('cap', 5.80)   # the count's words (the take starts at cap + 3.78)
SPARK = T('nozzle', 0.17)                                # the igniter sparks in the bell (n18_nozzle src 1.05)
CATCH = [T('nozzle', 0.42), T('nozzle', 0.62), T('nozzle', 0.86)]   # it catches, grows (src 1.3, 1.5, 1.73)
BLOOM = T('nozzle', 1.32)                                # it blooms white: WHUMP (src 2.2)
BREATH = BLOOM - 0.36                                    # everything is sucked away: a held breath before the WHUMP
ERUPT = T('ignite', 0.02)                                # both pads erupt
POP = T('coconut', 0.03)                                 # the coconut's top lifts (a2c83349 src 2.58)
SPLASH = T('coconut', 0.40)                              # its water crowns (src 2.95)
BURST = T('melon', 0.15)                                 # the melon's frost bursts (15190f35 src 1.70)
ODROP = T('drop', 0.38)                                  # one drop lands on the orange (7e9b6135 src 0.48)
SPLIT = T('yuzu', 0.05)                                  # the yuzu is open; its mist lifts (n08_yuzu src 2.45)
DRIP = T('pipette', 1.20)                                # the pipette drop meets the dish (c06_lab_drop src 1.80)
BEAM = T('prism', 0.25)                                  # the beam finds the vial (c07_lab_prism src 2.15)
LOCK = T('glove', 0.95)                                  # the vial locks into the cell (c09_lab_cell src 1.35)
PRESS = T('transferbtn', 0.60)                           # FLAVOR TRANSFER READY (7e9b6135 src 12.89)
RL = T('relight', 0.27)                                  # the engines relight: the score's return (src 16.17)
PASSED = T('pass', 1.0)                                  # TheraBreath's nose draws level and past (g6_pass src 1.4)
CHEER = T('mcerupts', 0.3)                               # the arms go up (v122_mc_erupts src 1.2)
TOUCH = T('foot', 0.55)                                  # Moon touchdown: the footpad meets the regolith (n14_dust src 2.55)
POLEIN = T('pole', 0.55)                                 # the pole enters the regolith (n28_flag src 9.4)
MOONLIFT = T('moonlaunch', 0.2)                          # TheraBreath lifts off the Moon for home
HQTOUCH = T('hqland', 3.1)                               # touchdown on the lawn (s11_hq src 6.5)
HATCH = T('robot', 0.85)                                 # the hatch unlatches (g7_robot)
ARM = T('robot', 1.6)                                    # the arm comes out
SETTLE = T('robot', 4.1)                                 # the tray settles
GLASS = T('tasting', 2.1)                                # the gloved hand sets the glass down (t1_tasting src 2.1)
ENDTONE = T('end', 0.35)                                 # THE FUTURE OF FRESHNESS resolves on the score's final cadence
RIVALLAND = T('stglate', 1.25)                           # the rival finally lands beside the flag (g9_late src 3.85)
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
        a = int(r.uniform(0.2, max(0.3, len(x) / SR - 0.6)) * SR); b = a + int(r.uniform(*frag) * SR)
        s = x[a:b].copy()
        if r.random() < 0.4: s = s[::-1]
        s = np.tanh(3.0 * s / (np.abs(s).max() + 1e-9)) * (np.sin(np.pi * np.linspace(0, 1, len(s))) ** 0.5)[:, None]
        j = min(n, i + len(s)); y[i:j] += s[:j - i] * r.uniform(0.5, 1.0)
        i = j + int(r.uniform(*gap) * SR)
    y = bp(y, 400, 2800)
    return y / (np.abs(y).max() + 1e-9)


def chain(n=4, seed=0):
    # a halyard clip tapping a pole in the wind: a few soft metal taps, uneven
    r = np.random.default_rng(seed); y = np.zeros((int(2.6 * SR), 2)); at = 0.1
    for _ in range(n):
        i = int(at * SR); k = int(0.05 * SR); t = np.arange(k) / SR
        tone = np.sin(2 * np.pi * r.uniform(1900, 2400) * t) * np.exp(-t / 0.012) + 0.4 * np.sin(2 * np.pi * r.uniform(3800, 4600) * t) * np.exp(-t / 0.006)
        if i + k < len(y): y[i:i + k, :] += (tone * r.uniform(0.4, 1.0))[:, None]
        at += r.uniform(0.25, 0.7)
    return y / (np.abs(y).max() + 1e-9)


def room_cheer(dur=2.2, seed=0):
    # a control room letting go: applause and voices through a warm room, a chair, never a stadium
    x = load('x_applause'); r = np.random.default_rng(seed)
    a = int(1.0 * SR); y = x[a:a + int(dur * SR)].copy()
    y = lp(y, 5200) * (np.minimum(1, np.arange(len(y)) / (0.12 * SR)) * np.sin(np.pi * np.linspace(0, 1, len(y))) ** 0.4)[:, None]
    v = chatter(dur, seed=seed + 1, gap=(0.03, 0.2), frag=(0.2, 0.5)) * 0.5
    y = y / (np.abs(y).max() + 1e-9) + v[:len(y)]
    return y / (np.abs(y).max() + 1e-9)


# ---------------------------------------------------------------- I. THE SURPRISE
# Macro photography of a giant white bottle in a very large, very cold, very quiet place. Nothing roars.
P(machine_hum(11.0, seed=1), 0.0, -20, norm='rms', fi=2.0, until=LAMP + 0.2, fo=0.3, width=0.5,
  auto=[(0.0, -3), (T('macro2'), -1), (T('every'), 0), (T('lights'), 1)], tag='distant machine hum')
P('01_OPEN_CRYO_VENT_FAR_V1', 0.9, -6, norm='rms', hpf=400, lpf=6000, fi=1.2, until=T('every', 0.4), fo=0.8, pan=0.35, env='vast:a', send=-4, tag='cold venting, far')
P(chatter(5.5, seed=62), 1.2, -42, norm='rms', fi=1.2, until=T('every', 0.2), fo=0.5, pan=-0.35, width=0.4, env='vast:a', send=2, tag='radio chatter, very far')
P(fizz(4.0, rate=22, seed=61), 0.7, -31, width=0.8, env='vast:a', send=-10, tag='condensation beads')
P('01_OPEN_FROST_CRACKLE_V1', 1.4, -26, trim=(0.4, 3.0), fi=0.3, fo=0.5, hpf=2600, pan=-0.15, width=0.8, tag='tiny ice cracks')
P(whoosh(2.6, 220, 900, q=0.6, seed=67), 1.9, -24, width=1.6, panauto=[(1.9, -0.5), (4.5, 0.4)], tag='vapor drifting past')
P('01_OPEN_PLASTIC_TICK_V1', 3.6, -28, trim=(0.18, 0.5), align='onset', pan=0.15, fo=0.05, env='vast:a', send=-6)
# the stripe: one cold droplet slides and falls somewhere far below
P('01_OPEN_DROPLET_PLINK_V1', T('macro2', 0.55), -24, trim=(0.0, 0.9), align='onset', fo=0.2, pan=0.15, env='vast:a', send=1)
P('01_OPEN_PLASTIC_TICK_V2', T('macro2', 1.0), -30, align='onset', pan=-0.2, fo=0.05, env='vast:a', send=-6)
# the cap in steam: vapor, a hiss; EVERY CATEGORY HAS A RACE: a restrained low push of air as the letters land, a deep
# soft hit, a crystalline resolve, then the quiet holds on black
P('02_PAD_VAPOR_HISS_V1', T('every', -0.05), -24, norm='rms', fi=0.3, loop=True, until=T('titlehold', 0.2), fo=0.5, lpf=6000, width=1.3, env='vast:a', send=-8)
P(whoosh(1.2, 80, 360, q=0.8, seed=3), TITLE - 0.9, -20, width=1.4, tag='title air push')
P(sub_boom(3.0, 50, 26, 0.4, 1.0), TITLE + 0.02, -12, tag='title sub')
P('06_LAUNCH_TAIL_V1', TITLE + 0.05, -23, lpf=900, fo=1.2, until=T('lights', 0.3), width=1.5, env='vast:b', send=-4, tag='title body')
P('02_REVEAL_SHIMMER_BLOOM_V2', TITLE + 0.1, -26, hpf=2500, fo=1.2, width=1.5, env='vast:b', send=-6)
M.kill('vast:a', T('lights', 0.3), 0.4)
# the silhouettes: night wind, a structure groaning in the cold, a relay chain, a transformer waking
P('01_OPEN_NIGHT_WIND_V1', T('lights', -0.1), -10, norm='rms', trim=(6.705, None), fi=0.5, loop=True, until=T('padmoon', 0.3), fo=0.4, width=1.5,
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
P(mains_hum(7, seed=1), LAMP + 0.05, -27, norm='rms', fi=0.35, until=T('padmoon'), fo=0.3, pan=-0.6, tag='flood hum L')
P(mains_hum(7, seed=2), LAMP + 0.05, -27, norm='rms', fi=0.35, until=T('padmoon'), fo=0.3, pan=0.65, tag='flood hum R')
P('02_PAD_VAPOR_HISS_V1', LAMP + 0.4, -22, norm='rms', fi=1.5, loop=True, until=T('padmoon'), fo=0.3, lpf=7000, width=1.3, env='pad:a', send=-10)
# the searchlights: two more banks, smaller and farther
P('02_REVEAL_FLOOD_HIT_V2', BEAMS[0], -18, align='onset', pan=-0.55, env='pad:a', send=-2)
P('02_REVEAL_FLOOD_HIT_V3', BEAMS[1], -19, align='onset', pan=0.6, env='pad:a', send=-2)
P('02_REVEAL_LAMP_HUM_V1', BEAMS[0] + 0.1, -30, fi=0.4, until=T('padmoon'), fo=0.3, width=1.4)
# the base of both rockets glows: the turbines are already breathing
P('05_PRE_TURBINE_THERA_V2', LAMP + 0.6, -31, fi=1.2, until=T('padmoon'), fo=0.3, pan=-0.3, lpf=4000)
P('05_PRE_TURBINE_RIVAL_V1', LAMP + 0.9, -32, fi=1.2, lpf=2400, until=T('padmoon'), fo=0.3, pan=0.35)
# both against the full Moon: a wider night, wind over the field, a cable pinging a far tower, the clouds clearing
P('01_OPEN_NIGHT_WIND_V1', T('padmoon', -0.05), -14, norm='rms', trim=(2.0, None), fi=0.4, loop=True, until=T('rival', 0.1), fo=0.15, width=1.7,
  auto=[(T('padmoon'), -4), (MOONCLEAR, 0), (T('rival'), -2)])
P('01_OPEN_STRUCTURE_GROAN_V2', T('padmoon', 0.4), -30, lpf=1200, fo=0.5, pan=0.4, env='pad:a', send=-2, tag='a far tower')
P(crystal(1174.66, 2.4, seed=140), MOONCLEAR + 0.1, -36, width=1.5, env='vast:b', send=-8, tag='the Moon clears: a glass note')
P(mains_hum(3, seed=3), T('padmoon'), -34, norm='rms', fi=0.3, until=T('rival'), fo=0.1, width=1.3, tag='flood hum, far')
# the rival up close: a rough, uneven idle with a rattle; then TheraBreath's clean turbine
P('03_RIVAL_ROUGH_IDLE_V2', T('rival', -0.05), -18, norm='rms', fi=0.1, lpf=2600, until=T('herocap', 0.05), fo=0.08, pan=0.25, tag='rival idle, close')
P('03_RIVAL_HYDRAULIC_GROAN_V1', T('rival', 0.3), -26, lpf=2200, fo=0.4, pan=0.3, env='pad:a', send=-4)
P('05_PRE_TURBINE_THERA_V1', T('herocap', -0.03), -22, fi=0.05, until=T('mc1', 0.1), fo=0.1, lpf=7000, tag='TheraBreath turbine, clean')
M.kill('pad:a', T('mc1'), 0.2)
# Mission Control at The Flavor Factory: a warm room, consoles, the channel; FLIGHT gives the go
P('04_CONTROL_ROOMTONE_V1', T('mc1', -0.03), -21, norm='rms', fi=0.05, loop=True, hpf=60, until=T('cap', 0.05), fo=0.08)
P('beeps', T('mc1', 0.3), -28, norm='rms', lpf=6000, hpf=900, fi=0.1, until=T('cap', 0.02), fo=0.05, width=1.4, env='room', send=-12)
P(chatter(2.4, seed=64, gap=(0.08, 0.3), frag=(0.2, 0.5)), T('mc1', 0.2), -30, norm='rms', fi=0.05, until=T('cap', 0.02), fo=0.05, pan=-0.2, env='room', send=-8, tag='the channel')
P('04_CONTROL_READY_CHIME_V2', T('mc1', 2.2), -27, align='onset', env='room', send=-8)
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
P(rumble(16.0, 22, 60, seed=9), T('ignite', 0.05), -6, norm='rms', fi=0.2, until=T('pitch', 0.15), fo=0.1, tag='liftoff sub rumble',
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
P(whoosh(3.0, 900, 300, q=0.7, seed=12), T('hull', 0.2), -27, width=1.5, tag='the air thinning')
# the edge of space: it is simply gone. A tick in the structure, then the gimbal for the pitch-over.
P('08_SPACE_METAL_TICKS_V1', T('pitch', 0.4), -30, hpf=1200, fo=0.3, env='hull', send=-10)
P('08_SPACE_SERVO_V2', T('pitch', 0.9), -29, fo=0.2, env='hull', send=-12)

# ---------------------------------------------------------------- III. THE RACE
# The score drives; the effects are punctuation. TheraBreath's clean thrust and the rival's rough idle run underneath,
# panned apart; each shot gets one accent. The rival commits, pulls away and thins into the distance; TheraBreath's
# warning light comes on; the engines go quiet.
P(space_drone(20.0, seed=15), T('side', -0.3), -40, norm='rms', fi=0.8, until=T('search', 0.4), fo=0.8, tag='space drone')
P('09_RACE_THERA_THRUST_V1', T('side'), -20, norm='rms', fi=0.3, loop=True, until=T('cutoff', 0.3), fo=0.3, space=True, pan=-0.2,
  auto=[(T('side'), 0), (T('rivalaway'), 0), (T('pullaway'), -3), (T('warnlight'), -4), (T('warnlight', 2.0), -8), (T('cutoff'), -9)],
  rateauto=[(T('side'), 1.0), (T('warnlight'), 1.0), (T('cutoff'), 0.9)])
P('05_PRE_TURBINE_RIVAL_V1', T('side', 0.2), -27, lpf=1800, fi=0.6, until=T('pullaway', 1.6), fo=0.8, pan=0.35,
  auto=[(T('side'), -4), (T('chase'), 0), (T('px26'), -2), (T('rivaleng'), 2), (T('rivalaway', 1.0), -2), (T('pullaway'), -10), (T('pullaway', 1.6), -20)])
P(whoosh(1.2, 300, 1400, q=0.9, seed=90), T('side', 0.05), -24, width=1.4, panauto=[(T('side'), -0.4), (T('side', 1.2), 0.4)], tag='both, side by side')
P(whoosh(2.0, 600, 3200, q=1.1, seed=92), T('chase', 0.1), -21, width=1.3, panauto=[(T('chase'), 0.5), (T('chase', 2.0), -0.5)], tag='the chase')
P('03_RIVAL_ROUGH_IDLE_V1', T('chase', 1.0), -24, norm='rms', fi=0.3, lpf=2200, until=T('neck', 0.1), fo=0.2, pan=0.4, tag='the rival nudges in')
P('09_RACE_RIVAL_PASS_V2', T('neck', 1.0), -21, align='peak', lpf=3000, pan=0.2)
P(crystal(1567.98, 1.2, seed=93), T('neck', 0.3), -36, width=1.4, tag='a crystal edge')
# both again, from below, the camera rolling with them; the labels fly past
P(whoosh(2.2, 250, 1800, q=0.8, seed=94), T('px26', 0.05), -20, width=1.5, panauto=[(T('px26'), -0.5), (T('px26', 2.2), 0.5)], tag='both from below')
P('08_SPACE_RELIGHT_V2', T('px26', 1.2), -22, trim=(1.0, 2.0), fi=0.1, fo=0.3, lpf=5000, width=1.3, tag='clean fire')
# the rival commits: its engines up close, rough fire and a grinding turbine climbing; then it pulls away
P('03_RIVAL_ROUGH_IDLE_V1', T('rivaleng', -0.02), -16, norm='rms', fi=0.05, lpf=3200, until=T('rivalaway', 0.1), fo=0.08, pan=0.2, tag='rough fire')
P('05_PRE_TURBINE_RIVAL_V1', T('rivaleng', 0.0), -20, lpf=2800, until=T('rivalaway', 0.3), fo=0.2, pan=0.2, rateauto=[(T('rivaleng'), 1.0), (T('rivalaway'), 1.12)], tag='rival grinding up')
P(sub_boom(1.6, 56, 30, 0.25, 0.6), T('rivaleng', 0.3), -17, tag='rival full thrust')
P('09_RACE_RIVAL_PASS_V1', T('rivalaway', 0.5), -19, align='peak', lpf=3000, pan=0.4, tag='the rival pulls away')
P(whoosh(2.0, 1400, 300, q=0.8, seed=98), T('rivalaway', 0.8), -24, width=1.3, panauto=[(T('rivalaway', 0.8), 0.2), (T('rivalaway', 2.2), 0.6)], tag='into the distance')
# from TheraBreath's shoulder: the rival is a dot by the Moon; its engine thins to nothing
P(whoosh(2.0, 900, 180, q=0.7, seed=99), T('pullaway', 0.0), -27, width=1.5, panauto=[(T('pullaway'), 0.4), (T('pullaway', 2.0), 0.1)], tag='gone')
P('08_SPACE_METAL_TICKS_V1', T('pullaway', 1.2), -32, hpf=1500, fo=0.3, env='hull', send=-12)
# TheraBreath's warning light: a small worried alarm, the thrust sagging, a hull creak
P('x4_alarm', T('warnlight', 0.1), -24, rate=0.84, lpf=2400, fi=0.03, loop=True, until=T('cutoff', 0.6), fo=0.4, space=True, tag='warning',
  auto=[(T('warnlight'), 2), (T('cutoff'), 0), (T('cutoff', 0.6), -6)])
P('12_FAIL_HULL_STRAIN_V1', T('warnlight', 0.5), -30, lpf=2000, fo=0.6, env='hull', send=-10)
P('08_SPACE_METAL_TICKS_V1', T('warnlight', 1.6), -31, hpf=1500, fo=0.3, env='hull', send=-12)
# the engines go quiet: a wind-down through the hull, a last hiss, hot metal ticking, crystals drifting
P('08_SPACE_ENGINE_CUTOFF_V2', T('cutoff', 0.05), -18, fo=0.5, env='hull', send=-8)
P('08_SPACE_METAL_TICKS_V1', T('cutoff', 1.0), -29, hpf=1200, fo=0.3, env='hull', send=-10)
P(fizz(2.2, rate=30, seed=111), T('cutoff', 0.1), -33, width=1.6, tag='crystals drifting')
P(space_drone(5.0, seed=16), T('cutoff', 0.0), -41, norm='rms', fi=0.5, until=T('search', 0.2), fo=0.4)

# ---------------------------------------------------------------- IV. DISCOVERY
# The Flavor Factory searches. Under the score's caper, one sound per cut, on its frame: leaves, water, the coconut
# pops and splashes, the melon bursts, one drop on the orange, frost on the mint, the citrus split that is the one;
# then the lab (the pipette drop lands, light through the vial, the vial locks), FLAVOR TRANSFER READY, the signal
# over the night side; the transfer, the glow, and the relight on the score's return.
P('04_CONTROL_ROOMTONE_V1', T('search', -0.03), -20, norm='rms', fi=0.05, loop=True, hpf=60, until=T('tea', 0.04), fo=0.06)
P(whoosh(1.6, 700, 2600, q=1.6, seed=110), T('search', 0.15), -28, width=1.6, panauto=[(T('search'), -0.6), (T('search', 1.6), 0.6)], tag='the scan sweeps')
P('beeps', T('search', 0.2), -29, norm='rms', lpf=6000, hpf=900, fi=0.05, until=T('tea', 0.02), fo=0.05, width=1.5, env='room', send=-12)
P(chatter(1.4, seed=66, gap=(0.08, 0.3), frag=(0.2, 0.45)), T('mc2', 0.15), -30, norm='rms', fi=0.05, until=T('tea', 0.02), fo=0.05, pan=-0.15, env='room', send=-8)
P('04_CONTROL_READY_CHIME_V1', T('mc2', 0.9), -29, align='onset', env='room', send=-8)
# the montage
P('10_LAB_LEAVES_V1', T('tea', 0.0), -21, fo=0.3, until=T('cuketea', 0.2), width=1.5, env='lab', send=-10)
P(fizz(1.5, rate=50, seed=112), T('cuketea', 0.0), -27, width=1.3, until=T('coconut', 0.1), fo=0.1, tag='bubbles in the water')
P('10_LAB_SLICE_V1', T('cuketea', 0.25), -25, align='onset', pan=0.15)
P('10_LAB_CITRUS_SPLIT_V1', POP, -19, align='onset', rate=0.72, lpf=5000, tag='the coconut pops')
P('01_OPEN_DROPLET_PLINK_V2', SPLASH, -24, align='onset', pan=-0.2, env='lab', send=-6, tag='and splashes')
P(fizz(0.6, rate=90, seed=114), SPLASH + 0.02, -30, width=1.4, tag='the spray')
P('10_LAB_CITRUS_SPLIT_V1', BURST, -18, align='onset', rate=0.9, tag='the melon bursts')
P(fizz(1.0, rate=80, seed=113), BURST + 0.03, -28, width=1.4, tag='juice spray')
P('10_LAB_FROST_BLOOM_V1', BURST + 0.05, -27, trim=(0.0, 0.8), fo=0.2, width=1.4, tag='the frost on it')
P('01_OPEN_DROPLET_PLINK_V1', ODROP - 0.08, -21, trim=(0.0, 0.9), align='onset', fo=0.2, env='lab', send=-3, tag='one drop on the orange')
P(fizz(0.5, rate=120, seed=115), ODROP + 0.03, -31, width=1.5, tag='its splash')
P('10_LAB_FROST_BLOOM_V1', T('mint', 0.0), -21, until=T('yuzu', 0.1), fo=0.1, width=1.4, env='lab', send=-8)
# the one: the citrus splits, and the room rings
P('10_LAB_CITRUS_SPLIT_V1', SPLIT, -14, align='onset', env='lab', send=-6, tag='the one')
P('10_LAB_MIST_SPRAY_V1', SPLIT + 0.2, -26, until=T('yuzu', 1.6), fo=0.3, width=1.3, tag='its mist')
P('02_REVEAL_SHIMMER_BLOOM_V1', SPLIT + 0.05, -22, trim=(0.85, 3.6), align=0.12, fo=0.6, width=1.6, env='lab', send=-6)
for k, (fq, g) in enumerate([(1046.5, -30), (1318.5, -31), (1567.98, -32)]):
    P(crystal(fq, 2.2, seed=120 + k), SPLIT + 0.15 + 0.12 * k, g, width=1.5, env='lab', send=-8, tag='the one, in glass')
# the lab: a small bright room; the pipette drops and the glass rings; light through the vial; the vial locks into the cell
P('10_LAB_ROOMTONE_V1', T('pipette', -0.1), -25, norm='rms', fi=0.2, loop=True, until=T('orbit', 0.1), fo=0.2)
P('01_OPEN_DROPLET_PLINK_V1', DRIP, -20, trim=(0.0, 0.9), align='onset', fo=0.2, env='lab', send=-3, tag='the pipette drop lands')
P('10_LAB_DROP_GLASS_V2', DRIP + 0.005, -24, rate=0.929, align='onset', env='lab', send=-6)
P('10_LAB_CRYSTAL_SING_V1', BEAM, -27, fi=0.15, fo=0.4, until=T('glove', 0.1), width=1.5, env='lab', send=-6, tag='light through the vial')
P(crystal(2093.0, 1.4, seed=131), BEAM + 0.3, -34, width=1.4, env='lab', send=-8)
P('10_LAB_TWIST_LOCK_V2', LOCK, -21, rate=1.2, align=0.158, env='lab', send=-8, tag='the vial locks')
P(crystal(1760.0, 1.6, seed=124), LOCK + 0.05, -33, width=1.3, env='lab', send=-8)
# FLAVOR TRANSFER READY: the press, and the room answers
P('05_PRE_BUTTON_PRESS_V1', PRESS, -18, align='onset', env='room', send=-10)
P('04_CONTROL_READY_CHIME_V2', PRESS + 0.07, -22, align='onset', env='room', send=-6)
# the signal over the night side: air and sparkle
P(whoosh(1.6, 1200, 400, q=0.9, seed=125), T('orbit', -0.1), -24, width=1.6, tag='into orbit')
P('11_RING_SPARKLE_PASS_V1', T('orbit', 0.2), -24, hpf=3000, fo=0.6, width=1.6)
# the transfer: the coupling, the line, the flavor flowing in
P('05_PRE_VALVE_ACTUATE_V1', T('transfer', 0.1), -22, trim=(0.0, 0.9), hpf=700, fo=0.2, space=True)
P('05_PRE_PIPE_FLOW_V1', T('transfer', 0.3), -26, norm='rms', lpf=3000, fi=0.4, until=RL - 0.2, fo=0.2, tag='flavor in the line')
P(fizz(2.6, rate=110, seed=126), T('transfer', 0.4), -31, width=1.2, tag='flavor fizz')
# TheraBreath comes alive: the glow rises through the bottle, the turbine spins up
P(whoosh(1.6, 600, 5200, q=1.4, seed=127, shape='rise'), T('life', -0.2), -22, width=1.3, tag='the glow rises')
P('02_REVEAL_SHIMMER_BLOOM_V1', T('life', 0.3), -21, trim=(0.85, None), align=0.12, fo=0.6, width=1.6)
P('05_PRE_TURBINE_THERA_V2', T('life', 0.0), -24, fi=0.4, until=RL, fo=0.05, rateauto=[(T('life'), 1.0), (RL, 1.2)])
# the relight: the engines catch and bloom on the score's return
P('08_SPACE_RELIGHT_V1', RL - 0.3, -21, trim=(0.08, 0.45), align='onset', fo=0.1)
P(sub_boom(2.4, 62, 30, 0.3, 0.8), RL + 0.05, -9, tag='relight sub')
P('x4_refuel', RL + 0.03, -17, align='onset', space=True)
P('08_SPACE_RELIGHT_V2', RL + 0.05, -16, trim=(1.0, 3.0), fi=0.2, fo=0.6, lpf=2600, width=1.3)
# both at full thrust over Earth (no lettering); then TheraBreath passes the rival
P('09_RACE_THERA_THRUST_V1', T('follow', -0.05), -17, norm='rms', fi=0.1, loop=True, hpf=120, until=T('descent', 1.4), fo=0.6, width=1.4,
  auto=[(T('follow'), 0), (T('pass'), 1), (T('mcerupts'), -6), (T('overtake'), 1), (T('descent'), -10)], rateauto=[(T('follow'), 1.0), (T('overtake'), 1.15)])
P('05_PRE_TURBINE_RIVAL_V1', T('follow', 0.1), -25, lpf=2000, fi=0.3, until=T('pass', 2.2), fo=0.5, pan=0.4)
P(whoosh(1.8, 300, 2600, q=0.9, seed=128), T('follow', 0.1), -18, panauto=[(T('follow'), -0.5), (T('follow', 1.8), 0.5)], tag='both, flat out')
# the pass: one clean sweep left to right as TheraBreath draws level and past; the rival's grind falls behind
P(whoosh(2.2, 250, 2400, q=0.8, seed=129, shape='rise'), PASSED - 1.0, -18, width=1.5, panauto=[(PASSED - 1.0, 0.3), (PASSED + 1.0, -0.5)], tag='TheraBreath passes')
P(sub_boom(2.0, 60, 28, 0.3, 0.8), PASSED, -12, tag='the lead')
P('11_RING_SPARKLE_PASS_V1', PASSED + 0.1, -26, hpf=3500, fo=0.6, width=1.6)
P('03_RIVAL_ROUGH_IDLE_V2', PASSED + 0.3, -28, norm='rms', fi=0.1, lpf=1800, until=T('pass', 2.3), fo=0.3, pan=0.5, auto=[(PASSED + 0.3, 0), (T('pass', 2.3), -12)], tag='the rival falls behind')
# Mission Control erupts: the room, a cheer, a chair
P('04_CONTROL_ROOMTONE_V1', T('mcerupts', -0.03), -22, norm='rms', fi=0.04, loop=True, hpf=60, until=T('overtake', 0.04), fo=0.06)
P(room_cheer(2.0, seed=70), CHEER - 0.15, -16, env='room', send=-6, fo=0.3, until=T('overtake', 0.25), tag='the room lets go')
P('05_HUSH_RELAY_CLICK_V2', CHEER + 0.4, -30, align='onset', env='room', send=-10, tag='a chair')
# it streaks for the Moon
P(whoosh(1.4, 300, 2600, q=0.9, seed=134, shape='rise'), T('overtake', -0.2), -18, width=1.5, panauto=[(T('overtake'), 0.2), (T('overtake', 1.4), -0.5)], tag='for the Moon')
P(sub_boom(1.6, 58, 28, 0.3, 0.7), T('overtake', 0.05), -14, tag='away')
P('11_RING_SPARKLE_PASS_V1', T('overtake', 0.5), -26, hpf=3500, fo=0.6, width=1.6)

# ---------------------------------------------------------------- V. THE MOON
# The music is cut on the descent (its throw rings out). The quiet of space, a few thruster puffs, the landing thrust
# building, the footpad, the engines shut down, the line; the pole goes in; the flag in near silence as the horn plays.
P(space_drone(8.5, seed=19), T('descent', -0.1), -42, norm='rms', fi=0.8, until=TOUCH, fo=0.6, tag='moon descent quiet')
P('13_MOON_THRUSTER_PUFFS_V1', T('descent', 1.2), -26, trim=(1.9, 2.6), fo=0.15, pan=0.1)
P('13_MOON_THRUSTER_PUFFS_V1', T('descent', 2.6), -28, trim=(1.95, 2.5), fo=0.15, pan=-0.05)
P('14_HOME_LANDING_THRUST_V1', T('descent', 3.0), -22, lpf=2000, fi=0.8, loop=True, until=TOUCH + 0.1, fo=0.25, auto=[(T('descent', 3.0), -10), (TOUCH - 0.4, 0)])
P('13_MOON_DUST_CRUNCH_V1', T('dust', 0.1), -27, trim=(0.95, 1.48), fo=0.4, width=1.4, tag='dust stirring')
P('x4_quindar', TOUCH - 0.05, -27, rate=1.0465, until=TOUCH + 0.16, fo=0.03)                                   # the channel opens
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
P(space_drone(8.0, seed=17), T('flagwide', -0.3), -44, norm='rms', fi=1.2, until=T('monitors', 0.2), fo=0.6, tag='moon quiet, the flag')
P('08_SPACE_METAL_TICKS_V1', T('flagwide', 2.2), -33, hpf=1800, fo=0.3, pan=0.15, rate=1.1)

# ---------------------------------------------------------------- VI. HOME
# The Flavor Factory watching, the lift-off for home, re-entry, down through the clouds, birds and air over New
# Jersey, Church & Dwight, a soft landing on the lawn, the robot and the six samples, the tasting; the score fades out
# under the robot, so the quiet holds the tasting, and the hush before the card is silent.
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
# New Jersey: evening air, birds; TheraBreath far off, coming in over Church & Dwight
P('14_HOME_EVENING_AMB_V1', T('nj', -0.3), -22, norm='rms', fi=1.0, loop=True, hpf=150, until=T('hqland', 1.0), fo=0.8, width=1.3)
P('06_LAUNCH_ROAR_DISTANT_V1', T('nj', 0.4), -30, lpf=900, fi=1.0, until=T('cdsign', 0.4), fo=0.6, tag='TheraBreath, far off')
P(chain(3, seed=40), T('cdsign', 0.3), -30, pan=0.3, env='lawn', send=-10, tag='a halyard on the flagpole by the sign')
P('06_LAUNCH_ROAR_DISTANT_V1', T('cdsign', 0.5), -26, lpf=1100, fi=1.0, until=T('hqland', 0.5), fo=0.4, tag='TheraBreath coming in')
P(whoosh(2.0, 300, 1600, q=0.8, seed=131), T('cdsky', 0.1), -24, width=1.5, panauto=[(T('cdsky', 0.1), -0.6), (T('cdsky', 2.0), 0.6)], tag='across the sky')
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
# the end card: one sung crystal tone with the score's final cadence
P('15_END_CRYSTAL_TONE_V1', ENDTONE, -21, align='onset', width=1.4, env='vast:d', send=-4)
P(crystal(523.25, 5.0, seed=13), ENDTONE + 0.01, -31, width=1.5, env='vast:d', send=-6, tag='end glass C5')

# ---------------------------------------------------------------- VII. THE STINGER
# Back on the Moon, in the quiet: the rival's rough engine sputtering down out of the sky, a clunk, a little wobble,
# one last cough, and it winds down beside the flag. Then the line.
P(space_drone(6.0, seed=23), T('stgflag', -0.1), -44, norm='rms', fi=0.5, until=T('black2', 0.8), fo=0.6, tag='moon quiet, later')
P('12_FAIL_SPUTTER_V2', T('stgflag', 0.9), -24, trim=(0.7, None), lpf=2600, fi=0.3, until=RIVALLAND + 0.1, fo=0.1, pan=-0.1)
P('14_HOME_LANDING_THRUST_V1', T('stgflag', 1.2), -26, lpf=1500, until=RIVALLAND, fo=0.2, auto=[(T('stgflag', 1.2), -6), (RIVALLAND - 0.3, 0)])
P('13_MOON_TOUCHDOWN_V2', RIVALLAND, -14, align='onset', rate=0.85, fo=0.3, hpf=50)
P('01_OPEN_STRUCTURE_GROAN_V2', RIVALLAND + 0.25, -27, rate=1.6, lpf=3000, fo=0.3)
P('12_FAIL_SPUTTER_V2', RIVALLAND + 0.75, -20, trim=(0.08, 0.62), fo=0.12, pan=0.05)
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
    render(sys.argv[1] if len(sys.argv) > 1 else '../out/race16_sfx.wav')
