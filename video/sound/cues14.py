# THE FLAVOR RACE V14: the sound design, cue by cue, against the V14 cut (the clips generated on 6 October 2026).
# Read it like a score. Every time is T(segment, offset) on the V14 timeline; picture events are measured off the
# source clips (constants below). One element leads at a time: SFX, MUSIC, DIALOGUE or SILENCE. The music's share is
# MUSIC_AUTO and MUSIC_CUTS in events14.py.
# Identities (from V12): TheraBreath = clean air, a smooth rising turbine, deep clean thrust, a crystal edge.
#             Competitor = a rough uneven idle, a grinding turbine, a cough.
#             The Flavor Factory = soft machines, glass. Discovery = drops, glass, fizz, sparkle.
#             Space = near silence, heard only through the hull.
# V14's shapes: the opening is a beauty shoot lit from behind (cold, close, nothing that roars) until the stadium
# lights; the count drives the ignition (the spark, the stutter in the nozzle, the held breath, WHUMP); the roar is
# shaped by where we stand (in the structure, on the pad, miles away, in the cloud, above it, inside looking back) and
# is gone at the edge of space; the race is punctuation under the score; the discovery is glass and light, and the
# relight lands on the score's return; the Moon is near silence; home is warm and small.
# usage (from video/sound): python3 cues14.py ../out/race14_sfx.wav
import sys
import numpy as np
import soundfile as sf
from sdx import Mix, SR, bp, lp, load, secs, sub_boom, rumble, mains_hum, air, space_drone, whoosh, crystal, flutter
from timeline import Cut

V = Cut('FlavorRaceV14')
T = V.t
M = Mix(V.TOTAL)
P = M.put

# picture events (seconds on the V14 timeline), measured off the source clips
LIGHTS = T('lights', 4.59)                               # every lamp at once (39cc720b src 14.79)
THREE, TWO, ONE = T('padcold', 0.61), T('padcold', 1.55), T('padcold', 2.52)    # the count's words (VO at padcold + 0.5)
SPARK = T('ignite', 0.25)                                # the igniter sparks (3c07fc0f src 1.25)
STUT = [T('nozzle', 0.33), T('nozzle', 0.58), T('nozzle', 0.75)]               # the nozzle stutters (ca51b3b2 src 2.83, 3.08, 3.25)
BLOOM = T('nozzle', 1.4)                                 # it blooms white: WHUMP (src 3.9)
BREATH = BLOOM - 0.36                                    # everything is sucked away: a held breath before the WHUMP
ERUPT = T('erupt', 0.02)                                 # fire through the launch structure
CLOUD = T('climb', 3.0)                                  # the cloud swallows them (63efe8cb src 13.3)
SENSE = T('prisms', 2.4)                                 # the sensors glow (98d9a7c7 src 4.0)
DRIP = T('lab', 1.0)                                     # the pipette drips (67c7fe12 src 12.3)
ANSWER = T('analysis', 1.0)                              # the field appears on the monitor (7d6339bf src 14.0)
SEAT = T('seal', 1.7)                                    # the vial seats in the transmitter (67c7fe12 src 19.9)
PULSE = T('transmit', 0.5)                               # the pulse runs along the transmitter (7d6339bf src 23.8)
ARRIVE = T('receive', 0.5)                               # the signal reaches the cap (67c7fe12 src 23.9)
BELLS = T('intake', 2.4)                                 # the engine bells light (98d9a7c7 src 10.4)
RL = T('reignite', 0.75)                                 # the engines reignite (67c7fe12 src 26.8): the score's return
TOUCH = T('foot', 0.6)                                   # Moon touchdown: the footpad meets the regolith (82a87d95 src 12.8)
ARM = T('hatch', 0.95)                                   # the arm locks the pole up (98d9a7c7 src 23.2)
FLAG = T('moonwide')                                     # the flag snaps open on the cut to the wide (the hatch ends as the cloth appears)
LIFT = T('moonlift', 0.02)                               # the engines flare (g13 src 0.96)
LAND = T('gag', 1.7)                                     # the rival finally lands (g9 src 2.4)
HOME = T('touch', 1.3)                                   # touchdown on the roof (8fed7431 src 13.6)
PLACE = T('samples', 4.05)                               # the sixth sample is set down (src 21.25)
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


def ratchet(n=5, rate=15.0, seed=0):
    # a small mechanical ratchet: a few dry pawl clicks
    r = np.random.default_rng(seed); k = int(0.005 * SR); y = np.zeros((int((n / rate + 0.05) * SR), 2))
    for m in range(n):
        i = int(m / rate * SR); b = r.standard_normal((k, 2)) * np.exp(-np.arange(k) / (0.0009 * SR))[:, None]
        y[i:i + k] += b * (0.7 + 0.3 * r.random())
    y = bp(y, 1800, 7500)
    return y / np.abs(y).max()


def snap(seed=0):
    # cloth catching the air: a short, soft, papery flutter that stops on a snap
    y = flutter(0.32, rate=26, lo=900, hi=5200, seed=seed)
    t = (np.arange(len(y)) / SR)[:, None]
    return y * np.clip(t / 0.25, 0, 1) ** 2


# ---------------------------------------------------------------- I. THE SURPRISE
# A beauty shoot for a bottle, lit from behind, in a very large, very cold, very quiet place. Nothing roars.
P(machine_hum(17.0, seed=1), 0.4, -19, norm='rms', fi=2.6, until=LIGHTS + 0.2, fo=0.3, width=0.5,
  auto=[(0.4, -2), (T('rivalbody'), 0), (T('lights', 2.0), 2)], tag='distant machine hum')
# the hull against the light: cold vapor rolling past, the plastic catching the light as it turns
P('01_OPEN_CRYO_VENT_FAR_V1', T('hull', -0.3), -5, norm='rms', hpf=400, lpf=6000, fi=1.0, until=T('lights', 1.0), fo=0.8, pan=0.35,
  env='vast:a', send=-4, tag='cold venting, far')
P(whoosh(2.6, 220, 900, q=0.6, seed=67), T('hull', 0.1), -22, width=1.6, panauto=[(T('hull'), -0.5), (T('hull', 2.6), 0.4)], tag='vapor drifting past the hull')
P('01_OPEN_PLASTIC_TICK_V1', T('hull', 1.9), -27, trim=(0.18, 0.5), align='onset', pan=0.15, fo=0.05, env='vast:a', send=-6)   # the plastic, as the cap rises into frame
# the cap: cold condensation beading on the ribs, tiny ice cracks, one drop somewhere far below
P(fizz(2.4, rate=22, seed=61), T('cap', 0.05), -30, width=0.8, env='vast:a', send=-10, tag='condensation beads')
P('01_OPEN_FROST_CRACKLE_V1', T('cap', 0.1), -25, trim=(0.4, 3.0), fi=0.3, fo=0.5, hpf=2600, pan=-0.15, width=0.8, tag='tiny ice cracks')
P('01_OPEN_DROPLET_PLINK_V1', T('cap', 1.5), -24, trim=(0.0, 0.9), align='onset', fo=0.2, pan=0.15, env='vast:a', send=1)   # one drop: how big this place is
# the label: the light slides over the wordmark
P(whoosh(1.4, 2400, 5200, q=0.9, seed=60), T('label', 0.0), -32, width=1.4, tag='light sliding over the label')
P('01_OPEN_PLASTIC_TICK_V2', T('label', 0.7), -29, align='onset', pan=-0.2, fo=0.05, env='vast:a', send=-6)
# the second bottle: an amber body and a dark cap. A rough, uneven idle, felt more than noticed.
P('03_RIVAL_ROUGH_IDLE_V2', T('rivalbody', -0.1), -16, norm='rms', fi=0.8, lpf=1800, until=T('lights', 0.6), fo=0.6, pan=0.3, tag='rival idle, far')
P('03_RIVAL_HYDRAULIC_GROAN_V1', T('rivalbody', 1.0), -25, lpf=2200, fo=0.5, pan=0.35, env='vast:a', send=-4)
M.kill('vast:a', T('lights', 0.3), 0.4)
# the silhouettes: night wind, a structure groaning in the cold, one massive relay, a transformer waking
P('01_OPEN_NIGHT_WIND_V1', T('lights', -0.1), -10, norm='rms', trim=(6.705, None), fi=0.5, loop=True, until=T('standoff', 3.4), fo=0.4, width=1.5,
  auto=[(T('lights'), 0), (LIGHTS, 0), (LIGHTS + 1.0, -3)])
P('01_OPEN_STRUCTURE_GROAN_V1', T('lights', 0.3), -24, lpf=900, fi=0.4, until=LIGHTS - 0.2, fo=0.8, pan=-0.4, env='pad:a', send=2)
P('01_OPEN_BIG_RELAY_V2', T('lights', 1.4), -22, align='onset', lpf=2800, pan=-0.3, env='pad:a', send=-4)
P('05_PRE_TOWER_CREAK_V1', T('lights', 2.4), -25, lpf=2000, fo=0.6, pan=0.4, env='pad:a', send=-2)
P('02_REVEAL_TRANSFORMER_RISE_V2', LIGHTS - 1.99, -22, trim=(1.15, 3.14), fi=0.9, fo=0.008, env='pad:a', send=-8)
# every bank at once: the light becomes sound, the sub a beat late
P('02_REVEAL_FLOOD_HIT_V1', LIGHTS, -9, align='onset', pan=-0.35, env='pad:a', send=0)
P('02_REVEAL_FLOOD_HIT_V3', LIGHTS + 0.012, -9, align='onset', pan=0.4, env='pad:a', send=0)
P('02_REVEAL_FLOOD_HIT_V2', LIGHTS + 0.02, -11, align='onset', width=1.3)
P('02_REVEAL_SHIMMER_BLOOM_V1', LIGHTS, -16, trim=(0.85, None), align=0.12, fo=0.8, width=1.6, env='pad:a', send=-6)
P(sub_boom(3.0, 52, 26, 0.4, 1.0), LIGHTS + 0.11, -8, tag='delayed sub')
P(mains_hum(6, seed=1), LIGHTS + 0.05, -27, norm='rms', fi=0.35, until=T('standoff', 3.4), fo=0.4, pan=-0.6, tag='flood hum L')
P(mains_hum(6, seed=2), LIGHTS + 0.05, -27, norm='rms', fi=0.35, until=T('standoff', 3.4), fo=0.4, pan=0.65, tag='flood hum R')
P('02_PAD_VAPOR_HISS_V1', LIGHTS + 0.4, -22, norm='rms', fi=1.5, loop=True, until=T('standoff', 3.4), fo=0.5, lpf=7000, width=1.3, env='pad:a', send=-10)
# the base of both rockets glows: the turbines are already breathing
P('05_PRE_TURBINE_THERA_V2', LIGHTS + 0.6, -30, fi=1.2, until=T('standoff', 3.2), fo=0.5, pan=-0.3, lpf=4000)
P('05_PRE_TURBINE_RIVAL_V1', LIGHTS + 0.9, -31, fi=1.2, lpf=2400, until=T('standoff', 3.2), fo=0.5, pan=0.35)
# the face-off and the title: a restrained push of air and a soft crystalline resolve. No slam.
P(whoosh(1.1, 90, 420, q=0.8, seed=3), T('standoff', -0.3), -19, width=1.4, tag='air push')
P('02_REVEAL_SHIMMER_BLOOM_V2', T('standoff', 0.1), -25, hpf=2500, fo=1.0, width=1.5, env='pad:b', send=-6)
M.kill('pad:a', T('partners'), 0.3)
P(whoosh(1.4, 80, 300, q=0.7, seed=5), T('partners', -0.4), -21, width=1.3, tag='card air')

# ---------------------------------------------------------------- II. LAUNCH
# The count drives the cuts. Three on the pad (vapor, floodlight hum, wind, the turbines spooling), two on the igniter
# spark, one in the nozzle as it stutters; the held breath; WHUMP.
P('02_PAD_VAPOR_HISS_V1', T('padcold', -0.1), -20, norm='rms', fi=0.3, loop=True, lpf=8000, until=T('nozzle'), fo=0.05, width=1.4, env='pad:c', send=-8)
P(mains_hum(3, seed=6), T('padcold'), -30, norm='rms', fi=0.3, until=T('ignite'), fo=0.05, width=1.3, tag='flood hum')
P('01_OPEN_NIGHT_WIND_V1', T('padcold'), -27, norm='rms', trim=(1.0, None), fi=0.4, until=T('ignite'), fo=0.05, width=1.5)
P('05_PRE_TURBINE_THERA_V1', T('padcold', -0.2), -25, fi=0.4, until=T('nozzle', 0.05), fo=0.05, pan=-0.4, env='pad:c', send=-9,
  auto=[(T('padcold'), -8), (T('nozzle'), 0)], rateauto=[(T('padcold'), 1.0), (T('nozzle'), 1.15)])
P('05_PRE_TURBINE_RIVAL_V1', T('padcold', 0.1), -27, lpf=2500, fi=0.4, until=T('ignite', 0.05), fo=0.05, pan=0.45, env='pad:c', send=-9)
for w in (THREE, TWO, ONE):                                                              # a heartbeat under each number
    P('x4_heart', w + 0.12, -28, lpf=300)
# two: under the hull, metal ticks, gas hissing, and the igniters spark
P('08_SPACE_METAL_TICKS_V1', T('ignite', 0.02), -25, hpf=1200, fo=0.3, env='pad:c', send=-10)
P('02_PAD_VAPOR_HISS_V1', T('ignite'), -24, norm='rms', hpf=2500, fi=0.05, until=T('nozzle', 0.1), fo=0.06, tag='gas hiss')
P('05_PRE_IGNITER_SPARKS_V1', SPARK - 0.03, -15, hpf=900, fi=0.02, until=T('nozzle', 0.05), fo=0.05, env='pad:c', send=-8)
P('05_PRE_IGNITER_SPARKS_V2', SPARK + 0.35, -21, hpf=1200, until=T('nozzle', 0.05), fo=0.05, pan=0.2)
M.kill('pad:c', T('nozzle', 0.3), 0.3)
# one: we look straight into the nozzle. Fuel pressure, a low spool, it stutters three times, the held breath. WHUMP.
P('05_PRE_PIPE_FLOW_V1', T('nozzle', 0.0), -22, norm='rms', lpf=3200, fi=0.3, until=BREATH, fo=0.06, tag='fuel pressure',
  auto=[(T('nozzle'), -6), (BREATH, 0)])
P('02_PAD_VAPOR_HISS_V1', T('nozzle', 0.05), -27, norm='rms', hpf=2500, fi=0.2, until=BREATH, fo=0.06, tag='gas hiss, inside')
P(rumble(1.6, 20, 60, seed=33), T('nozzle', 0.0), -21, norm='rms', fi=0.8, until=BREATH, fo=0.05, tag='low spool')
for k, s in enumerate(STUT):                                                             # the stutter: three small catches
    P('08_SPACE_RELIGHT_V1', s - 0.02, -23 + 2 * k, trim=(0.08, 0.32), align='onset', fo=0.06, tag='a catch')
    P('05_PRE_IGNITER_SPARKS_V2', s, -26, trim=(0.0, 0.25), hpf=1500, fo=0.05, pan=0.15 * (k - 1))
P(whoosh(1.0, 220, 3600, q=1.2, seed=31, shape='rise'), BREATH - 1.0, -22, width=1.3, fo=0.02, until=BREATH, tag='spool whine')
P('06_LAUNCH_ROAR_BODY_V2', BREATH - 0.75, -20, trim=(0.0, 0.8), rev=True, fi=0.45, fo=0.02, until=BREATH, width=1.6, tag='reverse suck')
P('05_HUSH_RELAY_CLICK_V1', BLOOM - 0.14, -27, align='onset', env='pad:d', send=-4)                        # one relay, in the held breath
P('x_whoomph', BLOOM, -9, align='onset', width=1.4, env='pad:d', send=-6, fo=0.4, until=T('erupt', 0.5))
P('10_LAB_LAUNCH_THOOMP_V1', BLOOM + 0.01, -11, align='onset', lpf=1800)
P(sub_boom(2.0, 60, 26, 0.3, 0.7), BLOOM + 0.03, -7, tag='WHUMP sub')
# the pad erupts: fire through the structure. A violent crack, the sub, steam, metal rattling, and the roar in layers.
P('06_LAUNCH_IGNITION_CRACK_V3', ERUPT, -8, align='onset', width=1.3, env='pad:d', send=-3)
P('06_LAUNCH_IGNITION_CRACK_V1', ERUPT + 0.008, -13, align='onset', width=1.5)
P(sub_boom(2.4, 58, 24, 0.35, 0.8), ERUPT + 0.07, -10, tag='ignition sub')
P('06_LAUNCH_STEAM_WALL_V1', ERUPT + 0.1, -13, align=0.4, fo=0.6, width=1.8, until=T('liftoff', 1.0))
P('06_LAUNCH_DEBRIS_RATTLE_V1', ERUPT + 0.15, -16, fo=0.8, pan=-0.45, width=1.2, tag='the structure rattles')
P('06_LAUNCH_GANTRY_SHAKE_V1', ERUPT + 0.3, -15, until=T('liftoff', 0.1), fo=0.1, pan=-0.3, env='pad:d', send=-5)
# The roar is one continuous body from the eruption to the cloud. It is shaped by where we stand: in the structure,
# on the pad as both leave, miles away and late through the long lens, closer again as they climb, swallowed by the
# cloud, then thin and airy above it.
FULL, FAR, CLOUDF = 16000, 1500, 2600
roar_lp = [(T('erupt'), FULL), (T('longlens', -0.01), FULL), (T('longlens'), FAR), (T('climb', -0.01), FAR), (T('climb'), 7000),
           (CLOUD, 7000), (CLOUD + 0.6, CLOUDF), (T('dawn', -0.01), CLOUDF), (T('dawn'), 1800)]
roar_gain = [(T('erupt'), -5), (T('liftoff', -0.1), -2), (T('liftoff', 0.3), 5), (T('longlens', -0.01), 5), (T('longlens'), -9),
             (T('climb', -0.01), -9), (T('climb'), 0), (CLOUD, 0), (CLOUD + 0.6, -6), (T('dawn', -0.01), -6), (T('dawn'), -14),
             (T('lookback', -0.01), -14), (T('lookback'), -10), (T('porthole', -0.1), -12), (T('porthole', 0.1), -40)]
P('06_LAUNCH_ROAR_BODY_V2', T('erupt', 0.02), 0, norm='rms', fi=0.12, loop=True, until=T('porthole', 0.15), fo=0.05, width=1.4, env='pad:d', send=-6,
  lpauto=roar_lp + [(T('lookback', -0.01), 1800), (T('lookback'), 650)], auto=roar_gain, tag='roar body')
P('06_LAUNCH_ROAR_BODY_V1', T('erupt', 0.4), -3, norm='rms', fi=0.4, loop=True, until=T('lookback', 0.05), fo=0.05, width=1.6,
  lpauto=roar_lp, auto=roar_gain, tag='roar body 2')
P(rumble(16.0, 22, 60, seed=9), T('erupt', 0.05), -6, norm='rms', fi=0.2, until=T('porthole', 0.15), fo=0.1, tag='liftoff sub rumble',
  auto=[(T('erupt'), -4), (T('liftoff'), 0), (T('longlens', -0.01), 0), (T('longlens'), -10), (T('climb'), -2), (CLOUD + 0.6, -8),
        (T('dawn'), -14), (T('lookback'), -6), (T('porthole', -0.1), -8)])
P('06_LAUNCH_CRACKLE_V1', T('liftoff', 0.1), -8, until=T('longlens', 0.02), fo=0.05, width=1.5, env='pad:d', send=-6)
P('06_LAUNCH_DEBRIS_RATTLE_V2', T('liftoff', 0.4), -19, until=T('longlens', 0.02), fo=0.05, pan=0.4, width=1.2)
M.kill('pad:d', T('longlens'), 0.05)
# the long lens: miles away, the sound arrives late and thin; the crackle tears
P('06_LAUNCH_ROAR_DISTANT_V1', T('longlens', 0.25), -15, fi=0.3, until=T('climb', 0.05), fo=0.1, lpf=1400, width=1.2, env='pad:e', send=-4)
P('06_LAUNCH_CRACKLE_V1', T('longlens', 0.5), -20, lpf=2600, until=T('climb', 0.05), fo=0.1, width=1.4, env='pad:e', send=-6)
M.kill('pad:e', T('climb'), 0.2)
# both climb: the crackle up close again, then the cloud swallows them
P('06_LAUNCH_CRACKLE_V1', T('climb', 0.02), -11, until=CLOUD + 0.4, fo=0.4, width=1.5)
P('07_ASCENT_CLOUD_PUNCH_V1', CLOUD - 0.15, -16, lpf=4000, fo=0.5, width=1.6)
# above the cloud at sunrise: wind roaring over the hull, thinning as the sky goes black
P('07_ASCENT_WIND_SHEAR_V1', T('dawn', -0.05), -15, fi=0.1, loop=True, until=T('porthole', 0.15), fo=0.2, width=1.4,
  auto=[(T('dawn'), 0), (T('lookback'), -4), (T('porthole'), -14)], rateauto=[(T('dawn'), 1.0), (T('porthole'), 1.3)], lpauto=[(T('dawn'), 9000), (T('lookback'), 3000), (T('porthole'), 1200)])
# looking back down from inside: the cabin shakes, a soft rattle, the instruments
P('08_SPACE_HULL_HUM_V1', T('lookback', -0.05), -26, norm='rms', fi=0.2, loop=True, until=T('side', 0.3), fo=0.4,
  auto=[(T('lookback'), 0), (T('porthole', 0.3), -4), (T('pitch', 1.0), -8)])
P('03_PLANT_BOLT_RATTLE_V1', T('lookback', 0.2), -30, lpf=4000, fo=0.5, until=T('porthole', 0.1), env='hull', send=-12, tag='cabin rattle')
P('beeps', T('lookback', 0.3), -36, norm='rms', lpf=6000, hpf=900, fi=0.3, until=T('porthole', 0.1), fo=0.1, width=1.2, tag='instruments')
# the edge of space: it is simply gone. A tick in the structure, then the gimbal for the pitch-over.
P('08_SPACE_METAL_TICKS_V1', T('porthole', 0.6), -30, hpf=1200, fo=0.3, env='hull', send=-10)
P('08_SPACE_SERVO_V2', T('pitch', 0.5), -29, fo=0.2, env='hull', send=-12)
P('01_OPEN_STRUCTURE_GROAN_V2', T('pitch', 1.2), -32, rate=1.3, lpf=1500, fo=0.5, space=True)

# ---------------------------------------------------------------- III. THE RACE
# The score drives, cut on its half-bars; the effects are punctuation. TheraBreath's clean thrust and the rival's
# rough idle run underneath, panned apart; each shot gets one accent; when TheraBreath gains its lead, its thrust
# climbs and the rival falls away.
P(space_drone(24.0, seed=15), T('side', -0.3), -40, norm='rms', fi=0.8, until=T('field', 0.6), fo=1.0, tag='space drone')
P('09_RACE_THERA_THRUST_V1', T('side'), -20, norm='rms', fi=0.3, loop=True, until=T('field', 1.0), fo=1.0, space=True, pan=-0.2,
  auto=[(T('side'), 0), (T('ahead'), 0), (T('ahead', 4.0), 2), (T('field'), -10)],
  rateauto=[(T('side'), 1.0), (T('ahead'), 1.0), (T('ahead', 5.0), 1.12)])
P('05_PRE_TURBINE_RIVAL_V1', T('side', 0.2), -27, lpf=1800, fi=0.6, until=T('ahead', 5.0), fo=0.8, pan=0.35,
  auto=[(T('side'), -4), (T('neck'), 0), (T('ahead'), -2), (T('ahead', 4.0), -14)])
P(whoosh(1.8, 300, 1400, q=0.9, seed=90), T('side', 0.1), -24, width=1.4, panauto=[(T('side'), -0.4), (T('side', 1.8), 0.4)], tag='both, side by side')
# the caps in the heat: the orange cap sizzles; the rival's dark cap grinds
P('06_LAUNCH_CRACKLE_V1', T('capheat', -0.02), -22, hpf=2500, until=T('rivalcap'), fo=0.08, width=1.2, tag='heat on the cap')
P(whoosh(1.4, 1800, 4800, q=1.4, seed=91), T('capheat'), -30, width=1.2, tag='heat shimmer')
P('05_PRE_TURBINE_RIVAL_V1', T('rivalcap', -0.02), -21, lpf=2600, until=T('neck'), fo=0.08, pan=0.25, rateauto=[(T('rivalcap'), 0.95), (T('neck'), 1.05)], tag='rival grinding')
# side by side: the rival slides alongside
P('09_RACE_RIVAL_PASS_V2', T('neck', 0.9), -21, align='peak', lpf=3000, pan=0.2)
# the engines up close: TheraBreath's clean fire, then the rival's rough fire
P('08_SPACE_RELIGHT_V2', T('engines', -0.02), -17, trim=(1.0, 2.6), fi=0.05, until=T('amberfire'), fo=0.06, lpf=5000, width=1.3, tag='clean fire')
P('03_RIVAL_ROUGH_IDLE_V1', T('amberfire', -0.02), -17, norm='rms', fi=0.05, lpf=3000, until=T('tblabel'), fo=0.06, pan=0.2, tag='rough fire')
# the labels fly past: clean air for TheraBreath, a rough tear for the rival
P(whoosh(1.4, 600, 3200, q=1.2, seed=92), T('tblabel', 0.0), -22, width=1.3, panauto=[(T('tblabel'), 0.5), (T('tblabel', 1.4), -0.5)], tag='TheraBreath past')
P(crystal(1567.98, 1.2, seed=93), T('tblabel', 0.15), -36, width=1.4, tag='a crystal edge')
P(whoosh(1.4, 900, 260, q=0.9, seed=94), T('rivallabel', 0.0), -21, width=1.3, panauto=[(T('rivallabel'), -0.4), (T('rivallabel', 1.4), 0.5)], tag='COMPETITOR past')
P('08_SPACE_RIVAL_COUGH_V1', T('rivallabel', 0.9), -27, lpf=3000, fo=0.2, pan=0.3)                                 # it coughs, once
# both in front of the Moon, then TheraBreath edges ahead: a long clean push and a glint
P(whoosh(2.2, 200, 1100, q=0.8, seed=95), T('moonpair', 0.0), -26, width=1.5, tag='the Moon ahead')
P(whoosh(2.4, 250, 2400, q=0.8, seed=83, shape='rise'), T('ahead', 2.6), -21, width=1.5, panauto=[(T('ahead', 2.6), 0.2), (T('ahead', 5.0), -0.5)], tag='TheraBreath edges ahead')
P(sub_boom(1.8, 60, 30, 0.25, 0.7), T('ahead', 3.0), -16, tag='the lead')
P('11_RING_SPARKLE_PASS_V1', T('ahead', 5.2), -28, hpf=3500, fo=0.6, width=1.6)

# ---------------------------------------------------------------- IV. DISCOVERY
# Glass and light, under the score's quiet glass section. The field glitters, the sensors wake, it beads on the hull.
# At The Flavor Factory: a warm small room, a drip, the analyzer answering, the vial seated, the pulse; the signal
# reaches the hull, the flavor runs through the intake, and the engines relight on the score's return.
P(space_drone(30.0, seed=18), T('field', -0.2), -42, norm='rms', fi=1.2, until=T('lab', 0.2), fo=0.6, tag='field quiet',
  auto=[(T('field'), 0), (T('droplets'), -2)])
P('11_RING_SPARKLE_PASS_V1', T('field', 0.4), -25, hpf=3000, fo=0.8, width=1.6)
P(fizz(5.0, rate=40, seed=40), T('field', 0.6), -31, width=1.6, tag='the field glitters')
for k, (fq, g) in enumerate([(1318.5, -35), (1760.0, -36), (2637.0, -38)]):
    P(crystal(fq, 2.6, seed=100 + k), T('field', 2.2 + 0.9 * k), g, width=1.5, env='hull', send=-14, tag='field glass')
P('11_RING_SPARKLE_PASS_V1', T('field', 4.6), -28, hpf=4000, fo=0.6, width=1.6)
# the prisms drift past; the sensors wake with a soft chime
P(fizz(4.0, rate=60, seed=41), T('prisms', 0.1), -32, width=1.5, tag='prisms')
P('10_LAB_CRYSTAL_SING_V1', T('prisms', 0.3), -30, rate=1.0663, fi=0.6, until=T('droplets', 0.3), fo=0.6, width=1.3, env='hull', send=-10)
P('04_CONTROL_READY_CHIME_V2', SENSE, -31, rate=0.885, align='onset', env='hull', send=-12)
P(crystal(1174.66, 1.8, seed=4), SENSE + 0.02, -32, width=1.3, env='hull', send=-12, tag='sensor glass D6')
# the field beads on the hull: drops of light, close
P('01_OPEN_DROPLET_PLINK_V1', T('droplets', 0.5), -27, trim=(0.0, 0.9), align='onset', fo=0.2, pan=-0.2, env='hull', send=-8)
P('01_OPEN_DROPLET_PLINK_V2', T('droplets', 1.6), -29, align='onset', fo=0.15, pan=0.25, env='hull', send=-8)
P(fizz(3.4, rate=90, seed=42), T('droplets', 0.1), -29, width=1.4, tag='beading on the hull')
P(crystal(2093.0, 1.6, seed=43), T('droplets', 2.4), -36, width=1.4, tag='a glint')
# The Flavor Factory: a warm, small, bright room. The pipette drips; the analyzer hums.
P('10_LAB_ROOMTONE_V1', T('lab', -0.2), -26, norm='rms', fi=0.3, loop=True, until=T('transmit', 2.2), fo=0.3)
P(air(13, 250, 9000, hum=0.15, seed=10), T('lab', -0.1), -29, norm='rms', fi=0.25, until=T('transmit', 2.2), fo=0.3, tag='lab air')
P('01_OPEN_DROPLET_PLINK_V1', DRIP, -21, trim=(0.0, 0.9), align='onset', fo=0.2, env='lab', send=-3)
P('10_LAB_DROP_GLASS_V2', DRIP + 0.005, -25, rate=0.929, align='onset', env='lab', send=-6)
P(mains_hum(6.5, base=60, seed=44), T('lab', 2.0), -36, norm='rms', fi=0.6, until=T('seal', 0.2), fo=0.3, pan=0.3, tag='analyzer hum')
# the sample answers: the field appears on the monitor
P('02_REVEAL_SHIMMER_BLOOM_V1', ANSWER - 0.3, -25, trim=(0.85, 3.4), align=0.12, fo=0.5, env='lab', send=-6)
P(crystal(1567.98, 2.0, seed=45), ANSWER + 0.1, -31, width=1.5, env='lab', send=-8, tag='the answer, G6')
P(fizz(2.4, rate=70, seed=46), ANSWER, -30, width=1.3, env='lab', send=-8, tag='fizz')
# the vial goes into the transmitter: glass on steel, a twist, it seats
P('05_PRE_VALVE_ACTUATE_V1', T('seal', 0.3), -28, trim=(0.0, 0.9), hpf=800, fo=0.2, env='lab', send=-8)
P('10_LAB_TWIST_LOCK_V2', SEAT - 0.315, -16, rate=1.3, align=0.158, env='lab', send=-8)
P('x4_clamp', SEAT + 0.02, -24, trim=(0.5, None), align='onset', env='lab', send=-8)
# the pulse: a relay, a charge, and a thread of light runs along the transmitter
P('05_HUSH_RELAY_CLICK_V2', PULSE - 0.25, -26, align='onset', env='lab', send=-6)
P(whoosh(0.8, 500, 5200, q=1.6, seed=47, shape='rise'), PULSE - 0.55, -26, until=PULSE + 0.05, fo=0.05, tag='charge')
P('x4_switch', PULSE, -21, align='onset')
P(whoosh(1.4, 4200, 900, q=1.4, seed=48), PULSE, -24, width=1.3, panauto=[(PULSE, -0.3), (PULSE + 1.2, 0.4)], tag='the pulse runs out')
P(crystal(880.0, 2.2, seed=49), PULSE + 0.05, -30, width=1.4, env='lab', send=-8, tag='pulse glass A5')
# the signal reaches the cap: a thread of glass out of the dark, taken up by the hull
P(whoosh(1.4, 600, 4200, q=1.6, seed=44, shape='rise'), ARRIVE - 1.0, -26, width=1.2, tag='signal arriving')
P('11_RING_SPARKLE_PASS_V1', ARRIVE, -24, hpf=3000, fo=0.6, width=1.4)
for k, (fq, g) in enumerate([(880.0, -29), (1318.5, -31), (1760.0, -32)]):
    P(crystal(fq, 2.2, seed=70 + k), ARRIVE + 0.1 + 0.12 * k, g, width=1.4, env='hull', send=-12, tag='signal glass')
# the intake: the flavor runs through the line into the engines, the bells catch the light
P('05_PRE_VALVE_ACTUATE_V1', T('intake', 0.05), -25, trim=(0.0, 0.9), hpf=700, fo=0.2, space=True)
P('05_PRE_PIPE_FLOW_V1', T('intake', 0.2), -22, norm='rms', lpf=3000, fi=0.4, until=RL - 0.2, fo=0.2, tag='flavor in the line')
P(fizz(2.4, rate=110, seed=48), T('intake', 0.3), -27, width=1.2, tag='flavor fizz')
P(whoosh(1.0, 800, 5200, q=1.5, seed=49, shape='rise'), BELLS - 0.6, -23, tag='glow into the bells')
P('02_REVEAL_SHIMMER_BLOOM_V1', BELLS - 0.2, -20, trim=(0.85, None), align=0.12, fo=0.8, width=1.6)
# the relight: the engines catch and bloom on the score's return
P('08_SPACE_RELIGHT_V1', RL - 0.35, -21, trim=(0.08, 0.45), align='onset', fo=0.1)
P(sub_boom(2.4, 62, 30, 0.3, 0.8), RL + 0.05, -9, tag='relight sub')
P('x4_refuel', RL + 0.03, -17, align='onset', space=True)
P('08_SPACE_RELIGHT_V2', RL + 0.05, -16, trim=(1.0, 3.0), fi=0.2, fo=0.6, lpf=2600, width=1.3)

# ---------------------------------------------------------------- V. THE RACE IS WON
# The drive carries it. TheraBreath's thrust returns and climbs; the rival's warning light comes on, a little alarm,
# it smokes and coughs; TheraBreath streaks away alone.
P('09_RACE_THERA_THRUST_V1', T('tothemoon', -0.05), -17, norm='rms', fi=0.1, loop=True, hpf=120, until=T('approach', 1.6), fo=0.5, width=1.4,
  auto=[(T('tothemoon'), 0), (T('rivalred'), -4), (T('streak'), 1), (T('moonbound'), -6), (T('approach'), -12)],
  rateauto=[(T('tothemoon'), 1.0), (T('streak'), 1.15), (T('moonbound'), 1.18)])
P(whoosh(1.5, 300, 2600, q=0.9, seed=32), T('tothemoon', 0.05), -18, panauto=[(T('tothemoon'), 0.6), (T('tothemoon', 1.5), -0.6)], tag='TheraBreath turns for the Moon')
P(sub_boom(1.6, 58, 30, 0.25, 0.6), T('tothemoon', 0.03), -14, tag='full throttle')
# the rival: a warning light, a small alarm, its rough idle stumbling, smoke, a cough
P('03_RIVAL_ROUGH_IDLE_V2', T('rivalred', -0.05), -21, norm='rms', lpf=2600, fi=0.2, until=T('streak', 0.4), fo=0.4, pan=0.3,
  rateauto=[(T('rivalred'), 1.0), (T('rivalsmoke'), 0.9)])
P('x4_alarm', T('rivalred', 0.1), -27, rate=0.71, lpf=1800, fi=0.04, loop=True, until=T('streak', 0.3), fo=0.3, pan=0.3)
P('12_FAIL_LEAK_HISS_V1', T('rivalred', 0.3), -27, hpf=1200, fi=0.2, until=T('rivalsmoke', 1.5), fo=0.3, pan=0.35, tag='smoke')
P('08_SPACE_RIVAL_COUGH_V2', T('rivalred', 1.4), -22, lpf=3200, fo=0.2, pan=0.3)
P('12_FAIL_SPUTTER_V2', T('rivalsmoke', 0.1), -15, trim=(0.08, 0.62), fo=0.12, pan=0.2, env='hull', send=-12)
P('12_FAIL_SPUTTER_V2', T('rivalsmoke', 0.85), -19, trim=(0.08, 0.5), fo=0.12, pan=0.25)
# TheraBreath streaks away, a glint of flavor in its wake
P(sub_boom(2.2, 60, 28, 0.3, 0.8), T('streak', 0.05), -11, tag='streak sub')
P(whoosh(2.0, 250, 2400, q=0.8, seed=84), T('streak', 0.0), -17, width=1.5, panauto=[(T('streak'), -0.2), (T('streak', 2.0), -0.6)], tag='TheraBreath streaks away')
P('11_RING_SPARKLE_PASS_V1', T('streak', 0.4), -27, hpf=3500, fo=0.6, width=1.6)
P(whoosh(2.2, 1800, 600, q=1.0, seed=85), T('moonbound', 0.0), -30, width=1.3, tag='TheraBreath, far ahead')

# ---------------------------------------------------------------- VI. THE MOON
# The music is cut on the descent (its throw rings out over the Moon). The quiet of space, a few thruster puffs, the
# landing thrust building, the footpad, the engines shut down, and the line.
P(space_drone(6.5, seed=19), T('approach', -0.1), -42, norm='rms', fi=0.8, until=TOUCH, fo=0.6, tag='moon descent quiet')
P('13_MOON_THRUSTER_PUFFS_V1', T('approach', 1.0), -26, trim=(1.9, 2.6), fo=0.15, pan=0.1)
P('13_MOON_THRUSTER_PUFFS_V1', T('approach', 2.2), -28, trim=(1.95, 2.5), fo=0.15, pan=-0.05)
P('14_HOME_LANDING_THRUST_V1', T('descent', -0.2), -22, lpf=2000, fi=0.6, loop=True, until=TOUCH + 0.1, fo=0.25,
  auto=[(T('descent'), -8), (TOUCH - 0.4, 0)])
P('13_MOON_DUST_CRUNCH_V1', T('descent', 1.6), -30, trim=(0.95, 1.48), fo=0.4, width=1.4, tag='dust stirring')
P('x4_quindar', TOUCH - 0.05, -27, rate=1.0465, until=TOUCH + 0.16, fo=0.03)                                   # "the Flavor has landed"
P('13_MOON_TOUCHDOWN_V1', TOUCH, -14, align='onset', fo=0.3, hpf=50)
P('13_MOON_DUST_CRUNCH_V1', TOUCH + 0.03, -19, trim=(0.45, 0.95), align='onset', fo=0.15)                    # the pad presses in
P('05_PRE_VALVE_ACTUATE_V1', TOUCH + 0.08, -32, trim=(0.2, 1.2), lpf=1500, fo=0.4, tag='hydraulic sigh')
P('08_SPACE_ENGINE_CUTOFF_V2', TOUCH + 0.15, -25, trim=(0.2, 1.6), rate=0.9, lpf=2500, fo=0.5)                   # the engines shut down
P('13_MOON_DUST_CRUNCH_V1', TOUCH + 0.9, -28, trim=(0.95, 1.48), fo=0.3, width=1.3, tag='dust settling')
# the flag: a latch, a servo, the arm comes out, a little ratchet, the cloth catches and snaps open
P('05_HUSH_RELAY_CLICK_V1', T('hatch', 0.2), -27, align='onset')
P('08_SPACE_SERVO_V1', T('hatch', 0.35), -25, fo=0.2)
P(ratchet(5, 16.0, seed=65), ARM - 0.3, -30, pan=0.15, tag='ratchet')
P('x4_clamp', ARM + 0.05, -24, trim=(0.5, None), align='onset', pan=0.1, tag='CHK')
P(snap(seed=66), FLAG - 0.25, -27, width=1.2, tag='the flag opens')
P(space_drone(6.0, seed=17), T('moonwide', -0.3), -44, norm='rms', fi=1.2, until=LIFT, fo=0.3, tag='moon quiet')
P('08_SPACE_METAL_TICKS_V1', T('moonwide', 0.8), -31, hpf=1500, fo=0.3, pan=-0.1)
P('08_SPACE_METAL_TICKS_V1', T('moonwide', 2.1), -33, hpf=1800, fo=0.3, pan=0.15, rate=1.1)
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
P('08_SPACE_ENGINE_CUTOFF_V2', LAND + 0.8, -26, trim=(0.2, 1.4), rate=0.8, fo=0.4, lpf=2500, until=T('sunlight', 0.1))

# ---------------------------------------------------------------- VII. HOME
# Out of the Moon's shadow into the sun, down through the clouds, the rooftop, the engines winding down; then a small,
# bright room and one more sample set down beside five. The score is gone by the end, so the quiet holds it.
P('09_RACE_THERA_THRUST_V1', T('sunlight'), -28, norm='rms', fi=0.3, loop=True, lpf=3000, until=T('clouds', 0.3), fo=0.6, width=1.4)
P('11_RING_SPARKLE_PASS_V1', T('sunlight', 0.5), -29, hpf=3500, fo=0.8, width=1.6)                          # the sun flares across the label
P('14_HOME_REENTRY_PLASMA_V1', T('sunlight', 1.8), -25, until=T('clouds', 0.8), fo=0.8, width=1.5)
P(whoosh(2.0, 2400, 400, q=0.8, seed=23), T('clouds', -0.2), -24, width=1.6, tag='down through the cloud')
P('14_HOME_EVENING_AMB_V1', T('hq', -0.3), -24, norm='rms', fi=1.0, loop=True, hpf=150, until=T('samples', 0.05), fo=0.1, width=1.3)
P('06_LAUNCH_ROAR_DISTANT_V1', T('clouds', 1.2), -26, lpf=900, fi=1.0, until=T('touch', 0.2), fo=0.6)
P('14_HOME_LANDING_THRUST_V1', T('hq', 1.2), -20, fi=0.6, until=HOME + 0.25, fo=0.3, env='lawn', send=-8,
  auto=[(T('hq', 1.2), -6), (T('touch'), 0)])
P(sub_boom(1.2, 70, 40, 0.15, 0.4), HOME, -16, tag='rooftop touchdown')
P('13_MOON_DUST_CRUNCH_V1', HOME + 0.02, -27, trim=(0.45, 0.95), align='onset', rate=1.2, fo=0.2, tag='grit on the pad')
P('14_HOME_ENGINE_SPINDOWN_V1', HOME + 0.1, -21, fo=0.5, until=T('samples', 0.3), env='lawn', send=-10)
M.kill('lawn', T('samples', 0.1), 0.1)
# the lab: a quiet bright room; the gloved hand sets the sixth sample down beside five; a small musical smile
P('10_LAB_ROOMTONE_V1', T('samples', -0.1), -28, norm='rms', fi=0.3, loop=True, until=T('hush', 0.02), fo=0.05)
P('14_HOME_GLASS_CLINK_V1', T('samples', 1.6), -31, rate=0.944, align='onset', pan=-0.1, env='lab', send=-12)   # glass touching glass as the hand passes
P('14_HOME_GLASS_CLINK_V2', PLACE, -24, rate=0.944, until=T('rack', 0.9), fo=0.3, env='lab', send=-10)            # the sixth, set down
for k, (fq, g) in enumerate([(1396.9, -31), (1760.0, -32), (2093.0, -31)]):            # a small musical smile, gone before the black
    P(crystal(fq, 0.9, seed=51 + k), PLACE + 0.12 + 0.09 * k, g, until=T('rack', 1.25), fo=0.3, width=1.4, env='lab', send=-10, tag='smile')
M.kill('lab', T('hush'), 0.05)
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
    render(sys.argv[1] if len(sys.argv) > 1 else '../out/race14_sfx.wav')
