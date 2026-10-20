# THE FLAVOR RACE V13: the sound design, cue by cue, against the V13 cut. Read it like a score.
# Every time is T(segment, offset) on the V13 timeline; picture events are measured off the source clips (constants below).
# One element leads at a time: SFX, MUSIC, DIALOGUE or SILENCE. The music's share is MUSIC_AUTO and MUSIC_CUTS in events13.py.
# V13 keeps V12's identities and makes room for real silences: the top, the count, the engines dying, the touchdown and
# the tasting. Identities: TheraBreath = clean air, a smooth rising turbine, deep clean thrust, a crystal edge.
#             Competitor = a rough uneven idle, a grinding turbine, a cough.
#             The Flavor Factory = relays, soft machines, glass. Discovery = drops, glass, fizz, sparkle.
#             Space = near silence, heard only through the hull.
# usage (from video/sound): python3 cues13.py ../out/race13_sfx.wav
import sys
import numpy as np
import soundfile as sf
from sdx import Mix, SR, bp, sub_boom, rumble, mains_hum, air, space_drone, whoosh, crystal, flutter
from timeline import Cut

V13 = Cut('FlavorRaceV13')
T = V13.t
M = Mix(V13.TOTAL)
P = M.put

# picture events (seconds on the V13 timeline), measured off the source clips
SNAP = T('umbi', 0.50)                                   # the umbilical lets go (source 1.55)
BANK1, BANK2, BANK3 = T('reveal', 0.20), T('reveal', 2.00), T('reveal', 3.10)   # the light banks: left, right, all
ONE = T('padcold', 0.35 + 2.52)                          # the count's "one" ends; a held breath
IGN = T('ignite')                                        # cut to fire
PUNCH = T('track', 2.5)                                  # the long lens loses them in the cloud
OUT = T('choice', 0.72)                                  # TheraBreath's flames go out (cutoff source 0.6 to 0.95)
DARK = T('choice', 3.0)                                  # the last glow leaves the bells
MOTES = T('particles', 0.8)                              # the aroma drifts in from the right
DROP = T('drop', 0.818)                                  # the drop meets the dish (source 1.986 at 0.9x)
PRISM = T('prism', 1.1)                                  # the beam splits into a spectrum
SEAT = T('seal', 0.85)                                   # the vial seats in the canister (source 10.35)
LATCH = T('seal', 2.85)                                  # the latch snaps shut over the frost (source 12.35)
RL = T('reignite', 0.91)                                 # the engines flash (source 0.96)
SURGE = T('overtake', 0.28)                              # TheraBreath throttles up (source 0.38)
F_OFF1, F_ON, F_OFF2 = T('flicker', 1.18), T('flicker', 1.74), T('flicker', 2.01)   # the rival's thrust: out, back, out
TOUCH = T('dust', 0.15)                                  # Moon touchdown (source 2.95)
UNFURL = T('flagout', 1.8)                               # the flag opens out of the bottle (source 7.6)
POLE = T('pole', 0.45)                                   # the pole bites into the dust (source 9.95)
LIFT = T('moonlift', 1.1)                                # off the Moon
LAND = T('gag', 1.3)                                     # the rival finally lands (source 2.4)
HAND = T('tasting', 0.45)                                # the glove enters (source 0.33 at 0.74x)
GLASS = T('tasting', 1.65)                               # the sixth glass meets the stone (source 1.22)
AWAY = T('tasting', 3.3)                                 # the glove withdraws (source 2.45)
ENDTONE = T('end', 0.4)                                  # TASTE THE FUTURE resolves on the score's final gesture


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


# ---------------------------------------------------------------- I. ANTICIPATION
# True silence, then the smallest sounds of something enormous and cold. No music until all the lights are on.
P('01_OPEN_PLASTIC_TICK_V1', 0.62, -22, trim=(0.18, 0.5), align='onset', pan=0.2, fo=0.05)
P(rumble(8, 38, 75, seed=1), 0.5, -26, norm='rms', fi=2.5, until=T('dark'), fo=0.3, width=0.6,
  auto=[(0.5, -30), (T('dark', -0.2), 0)], tag='pressure swell')
P('01_OPEN_FROST_CRACKLE_V1', 0.9, -28, trim=(0.4, 2.4), fi=0.3, fo=0.4, hpf=2500, pan=-0.15, width=0.8)
# the umbilical lets go: a hard mechanical snap and a burst of cryo vapor
P('05_PRE_UMBILICAL_RELEASE_V2', SNAP, -15, align='onset', pan=0.1, env='vast:a', send=-4)
P('x_vent', SNAP + 0.03, -19, width=1.5, env='vast:a', send=-5, eq=((2500, -5, 0.8),))
# the engine bells: cold metal, vapor rolling off; one drop falls and tells us how big this place is
P('02_PAD_VAPOR_HISS_V1', T('bells', -0.1), -24, norm='rms', fi=0.4, until=T('dark', 0.5), fo=0.5, lpf=6500, width=1.3)
P('01_OPEN_DROPLET_PLINK_V1', T('bells', 0.55), -23, trim=(0.0, 0.9), align='onset', fo=0.2, pan=0.15, env='vast:a', send=1)
P('01_OPEN_STRUCTURE_GROAN_V1', T('bells', 0.9), -27, lpf=900, fi=0.4, until=T('dark', 1.6), fo=0.8, pan=-0.4, env='vast:a', send=2)
P('01_OPEN_CRYO_VENT_FAR_V1', T('bells', 1.2), -27, norm='rms', hpf=400, lpf=4500, fi=0.6, until=T('dark', 1.8), fo=0.5, pan=0.45, env='vast:a', send=-4)
M.kill('vast:a', T('reveal', 0.1), 0.3)
# the long silhouette: night wind, a cable pinging far off; one massive relay wakes something up
P('01_OPEN_NIGHT_WIND_V1', T('dark', -0.1), -22, norm='rms', trim=(6.705, None), fi=0.6, loop=True, until=T('standoff', 2.6), fo=0.4, width=1.5,
  auto=[(T('dark'), 0), (BANK3, 0), (BANK3 + 1.0, -5)])
P('01_OPEN_PLASTIC_TICK_V2', T('dark', 0.9), -31, trim=(0.53, 0.8), align='onset', pan=-0.6, env='pad:a', send=-2, tag='far cable tick')
P('01_OPEN_BIG_RELAY_V2', T('dark', 1.6), -18, align='onset', lpf=2800, pan=-0.3, env='pad:a', send=-4)
P('02_REVEAL_RELAY_CHAIN_V1', T('dark', 2.2), -23, align='onset', lpf=4000, pan=0.55, env='pad:a', send=-2)
P('02_REVEAL_TRANSFORMER_RISE_V2', BANK1 - 1.99, -23, trim=(1.15, 3.14), fi=0.9, fo=0.008, env='pad:a', send=-8)
# bank one, left; bank two, right; then every bank at once, and the sub arrives a beat late. The score enters.
P('02_REVEAL_FLOOD_HIT_V1', BANK1, -14, align='onset', pan=-0.6, env='pad:a', send=-4)
P(sub_boom(1.2, 70, 40, 0.15, 0.3), BANK1 + 0.03, -20, tag='lamp thump')
P(mains_hum(12, seed=1), BANK1 + 0.05, -27, norm='rms', fi=0.35, until=T('standoff', 2.6), fo=0.4, pan=-0.6, tag='flood hum L')
P('02_REVEAL_RELAY_CHAIN_V2', BANK1 + 0.9, -25, align='onset', lpf=3500, pan=-0.5, env='pad:a', send=-2)
P('02_REVEAL_FLOOD_HIT_V3', BANK2, -12, align='onset', pan=0.65, env='pad:a', send=-1)
P(sub_boom(1.4, 66, 36, 0.18, 0.4), BANK2 + 0.04, -18, tag='lamp thump')
P(mains_hum(10, seed=2), BANK2 + 0.05, -27, norm='rms', fi=0.35, until=T('standoff', 2.6), fo=0.4, pan=0.65, tag='flood hum R')
P('02_REVEAL_FLOOD_HIT_V1', BANK3, -10, align='onset', pan=-0.3, env='pad:a', send=0)
P('02_REVEAL_FLOOD_HIT_V3', BANK3 + 0.012, -10, align='onset', pan=0.35, env='pad:a', send=0)
P('02_REVEAL_FLOOD_HIT_V2', BANK3 + 0.02, -12, align='onset', width=1.3)
P('02_REVEAL_SHIMMER_BLOOM_V1', BANK3, -16, trim=(0.85, None), align=0.12, fo=0.8, width=1.6, env='pad:a', send=-6)
P(sub_boom(3.0, 52, 26, 0.4, 1.0), BANK3 + 0.11, -9, tag='delayed sub')
P('02_PAD_VAPOR_HISS_V1', BANK3 + 0.4, -22, norm='rms', fi=1.5, loop=True, until=T('standoff', 2.6), fo=0.5, lpf=7000, width=1.3, env='pad:a', send=-10)
# TheraBreath: a clean turbine breathing, close
P('05_PRE_TURBINE_THERA_V2', T('tbpush', 0.2), -30, fi=0.8, until=T('rival', 0.3), fo=0.6, pan=-0.2, lpf=5000)
# the COMPETITOR: a rough, uneven idle under the floodlight sweep, felt more than noticed
P('03_RIVAL_ROUGH_IDLE_V2', T('rival', -0.15), -18, norm='rms', fi=0.3, lpf=3200, until=T('standoff', 0.6), fo=0.6, pan=0.25)
P('03_RIVAL_HYDRAULIC_GROAN_V1', T('rival', 0.7), -27, lpf=2500, until=T('standoff', 0.4), fo=0.3, pan=0.35, env='pad:a', send=-6)
# the title: a restrained push of air and a soft crystalline resolve. No slam.
P(whoosh(1.1, 90, 420, q=0.8, seed=3), T('standoff', -0.3), -19, width=1.4, tag='air push')
P('02_REVEAL_SHIMMER_BLOOM_V2', T('standoff', 0.1), -25, hpf=2500, fo=1.0, width=1.5, env='pad:b', send=-6)
M.kill('pad:a', T('mcwide'), 0.2)
# THE FLAVOR FACTORY: relays, soft computers, a small warm room
P('04_CONTROL_ROOMTONE_V1', T('mcwide', -0.2), -24, norm='rms', fi=0.2, loop=True, hpf=60, until=T('padcold', 0.05), fo=0.05)
P('beeps', T('mcwide'), -30, norm='rms', lpf=6000, hpf=900, loop=True, fi=0.4, until=T('padcold', 0.05), fo=0.05, width=1.4, env='room', send=-14)
P('05_HUSH_RELAY_CLICK_V2', T('mcwide', 0.9), -27, align='onset', pan=-0.3, env='room', send=-8)
P('04_CONTROL_READY_CHIME_V2', T('mcwide', 2.2), -32, rate=0.885, align='onset', env='room', send=-8)
P(crystal(1174.66, 1.6, seed=4), T('mcwide', 2.205), -35, env='room', send=-10, tag='ready glass D6')
M.kill('room', T('padcold'), 0.15)

# ---------------------------------------------------------------- II. LAUNCH
# Hard cut to the cold pad: the music is gone. Vapor, wind and the floodlight hum under the count, the turbines
# spooling up word by word; after "one" everything stops but one relay. Then fire.
P('02_PAD_VAPOR_HISS_V1', T('padcold'), -21, norm='rms', fi=0.05, loop=True, lpf=8000, until=ONE + 0.06, fo=0.05, width=1.4, env='pad:c', send=-8)
P(mains_hum(5, seed=6), T('padcold'), -30, norm='rms', fi=0.05, until=ONE + 0.06, fo=0.05, width=1.3, tag='flood hum')
P('01_OPEN_NIGHT_WIND_V1', T('padcold'), -27, norm='rms', trim=(1.0, None), fi=0.1, until=ONE + 0.06, fo=0.05, width=1.5)
P('05_PRE_TURBINE_THERA_V1', T('padcold', 0.1), -25, fi=0.6, until=ONE + 0.04, fo=0.04, pan=-0.4, env='pad:c', send=-9,
  auto=[(T('padcold'), -9), (ONE, 0)], rateauto=[(T('padcold'), 1.0), (ONE, 1.22)])
P('05_PRE_TURBINE_RIVAL_V1', T('padcold', 0.2), -27, lpf=2500, fi=0.6, until=ONE + 0.04, fo=0.04, pan=0.45, env='pad:c', send=-9,
  rateauto=[(T('padcold'), 0.95), (ONE, 1.12)])
P(rumble(5, 40, 130, seed=7), T('padcold'), -26, norm='rms', fi=0.6, until=ONE + 0.04, fo=0.04, width=1.2,
  auto=[(T('padcold'), -9), (ONE, 0)], tag='rumble')
for k in range(2):                                                                        # a heartbeat under "three", "two"
    P('x4_heart', T('padcold', 0.35 + 0.30 + k * 0.94), -28, lpf=300)
M.kill('pad:c', ONE + 0.08, 0.25)
P('05_HUSH_RELAY_CLICK_V1', IGN - 0.55, -26, align='onset', env='pad:d', send=-4)               # one relay, in the silence
# IGNITION: a violent crack, the sub a fraction late, then the roar in layers
P('06_LAUNCH_IGNITION_CRACK_V3', IGN, -7, align='onset', width=1.3, env='pad:d', send=-3)
P('06_LAUNCH_IGNITION_CRACK_V1', IGN + 0.008, -11, align='onset', width=1.5)
P(sub_boom(3.4, 58, 24, 0.35, 1.3), IGN + 0.07, -5, tag='ignition sub')
P('06_LAUNCH_ROAR_BODY_V2', IGN + 0.02, 0, norm='rms', fi=0.1, loop=True, until=T('track', 0.05), fo=0.05, width=1.4, env='pad:d', send=-6)
P('06_LAUNCH_ROAR_BODY_V1', IGN + 0.4, -3, norm='rms', fi=0.4, loop=True, until=T('track', 0.05), fo=0.05, width=1.6)
P(rumble(8, 22, 60, seed=9), IGN + 0.05, -6, norm='rms', fi=0.2, until=T('track', 0.5), fo=0.8, tag='liftoff sub rumble')
P('06_LAUNCH_CRACKLE_V1', IGN + 0.25, -11, until=T('track', 0.2), fo=0.4, width=1.5, env='pad:d', send=-6)
P('06_LAUNCH_DEBRIS_RATTLE_V1', IGN + 0.2, -18, fo=0.8, pan=-0.35, width=1.2)
P('06_LAUNCH_GANTRY_SHAKE_V1', IGN + 0.45, -15, fo=0.6, pan=0.3, env='pad:d', send=-5)
P('06_LAUNCH_STEAM_WALL_V1', T('tbfire', 0.2), -12, align=2.15, fo=0.6, width=1.8, until=T('track', 0.15))
P('06_LAUNCH_DEBRIS_RATTLE_V2', T('tbfire', 0.3), -20, fo=0.5, pan=0.4, width=1.2)
M.kill('pad:d', T('track'), 0.12)
# the long lens: miles away, the sound arrives late and thin; the crackle tears; then the cloud swallows them
P(whoosh(1.4, 2400, 800, q=0.7, seed=12), T('track', -0.1), -24, width=1.6, tag='air')
P('06_LAUNCH_ROAR_DISTANT_V1', T('track', 0.05), -13, fi=0.2, until=PUNCH + 0.5, fo=0.8, lpf=1400, width=1.2, env='pad:e', send=-4)
P('06_LAUNCH_CRACKLE_V1', T('track', 0.5), -19, lpf=2600, until=PUNCH + 0.3, fo=0.6, width=1.4, env='pad:e', send=-6)
P('07_ASCENT_CLOUD_PUNCH_V1', PUNCH - 0.15, -18, lpf=4000, fo=0.5, width=1.6)
M.kill('pad:e', T('onboard'), 0.2)
# onboard: wind roaring over the hull, thinning as the sky goes black, until only the structure hums
P('07_ASCENT_WIND_SHEAR_V1', T('onboard', -0.05), -15, fi=0.1, loop=True, until=T('side'), fo=0.04, width=1.4,
  auto=[(T('onboard'), 0), (T('side', -0.1), -12)], rateauto=[(T('onboard'), 1.0), (T('side'), 1.35)], lpauto=[(T('onboard'), 9000), (T('side'), 1500)])
P('06_LAUNCH_ROAR_BODY_V2', T('onboard', -0.05), -10, norm='rms', loop=True, until=T('side'), fo=0.04, width=1.2,
  lpauto=[(T('onboard'), 2000), (T('side', -0.1), 260)], auto=[(T('onboard'), 0), (T('side', -0.1), -10)])
P('08_SPACE_HULL_HUM_V1', T('onboard', 0.4), -28, norm='rms', fi=1.0, loop=True, until=T('side', 0.3), fo=0.4)
P('08_SPACE_SERVO_V2', T('pitch', 0.5), -26, fo=0.2, env='hull', send=-10)                                 # gimbal: the pitch-over
P('01_OPEN_STRUCTURE_GROAN_V2', T('pitch', 1.0), -28, rate=1.3, lpf=1500, fo=0.5, space=True)

# ---------------------------------------------------------------- III. THE RACE AND THE CHOICE
P(space_drone(16.0, seed=15), T('side'), -40, norm='rms', fi=0.4, until=T('particles', 1.0), fo=1.5, tag='space drone')
P('09_RACE_THERA_THRUST_V1', T('side'), -19, norm='rms', fi=0.05, loop=True, until=OUT + 0.15, fo=0.3, space=True, pan=-0.2,
  auto=[(T('side'), 0), (T('choice'), -1), (OUT, -8)])
P('05_PRE_TURBINE_RIVAL_V1', T('side', 0.2), -27, lpf=1800, fi=0.6, until=T('pullaway', 2.6), fo=1.0, pan=0.35,
  auto=[(T('side'), -4), (T('neck'), 0), (T('pullaway', 0.4), 0), (T('pullaway', 2.6), -14)])
P('09_RACE_RIVAL_PASS_V2', T('neck', 0.8), -24, align='peak', lpf=2500, pan=0.15)
P('05_PRE_TURBINE_RIVAL_V1', T('rivalcu', -0.1), -20, lpf=2600, fi=0.1, until=T('pullaway', 0.4), fo=0.3, pan=0.3, rateauto=[(T('rivalcu'), 1.0), (T('pullaway', 0.4), 1.25)], tag='rival winds up')
P('09_RACE_RIVAL_PASS_V1', T('pullaway', 0.4), -15, align='peak', width=1.2, panauto=[(T('pullaway'), 0.1), (T('pullaway', 1.0), 0.25), (T('pullaway', 3.0), 0.05)])
P(whoosh(2.6, 900, 180, q=0.9, seed=21), T('pullaway', 0.2), -25, width=1.3, tag='rival recedes')
# the choice: the engines throttle down and die; the music goes with them; hot metal ticks as the bells cool
P('08_SPACE_ENGINE_CUTOFF_V2', OUT - 0.55, -18, trim=(0.2, 2.0), rate=1.1, fo=0.4, space=True)
P('08_SPACE_ENGINE_CUTOFF_V2', OUT - 0.55, -29, trim=(0.2, 2.0), rate=1.1, fo=0.4, lpf=1600)
P('x_cutoff', OUT + 0.25, -32, trim=(0.33, 2.6), lpf=2500, fo=0.8)
P('08_SPACE_METAL_TICKS_V1', OUT + 1.1, -31, hpf=1200, fo=0.3, env='hull', send=-10)
P('08_SPACE_METAL_TICKS_V1', DARK, -34, trim=(0.4, None), hpf=1500, fo=0.4, pan=0.3, env='hull', send=-10)

# ---------------------------------------------------------------- IV. DISCOVERY, one chain
# The aroma drifts past the dark hull: almost nothing, a breath of sparkle travelling right to left, a few glass tones
P('11_RING_SPARKLE_PASS_V1', MOTES - 0.3, -29, hpf=3500, fo=1.2, width=1.6, panauto=[(MOTES - 0.3, 0.6), (MOTES + 3.5, -0.6)])
P(fizz(4.0, rate=26, seed=40), MOTES, -33, width=1.6, panauto=[(MOTES, 0.5), (MOTES + 4.0, -0.5)], tag='aroma, far')
for k, (fq, g) in enumerate([(1318.5, -36), (1760.0, -37), (1174.66, -38)]):
    P(crystal(fq, 2.4, seed=60 + k), MOTES + 0.7 + 0.85 * k, g, width=1.5, pan=0.4 - 0.4 * k, env='hull', send=-14, tag='aroma glass')
# The Flavor Factory leans in
P('04_CONTROL_ROOMTONE_V1', T('lean', -0.15), -25, norm='rms', fi=0.15, loop=True, hpf=60, until=T('drop', 0.15), fo=0.3)
P('beeps', T('lean'), -32, norm='rms', lpf=6000, hpf=900, loop=True, fi=0.3, until=T('drop', 0.1), fo=0.3, width=1.4, env='room', send=-14)
P('02_REVEAL_RELAY_CHAIN_V1', T('lean', 0.7), -28, align='onset', lpf=4000, pan=0.4, env='room', send=-6)
# the lab: one drop, in near silence; its glass ring blooms into a sung tone that carries the prism
P(air(13, 250, 9000, hum=0.15, seed=10), T('drop', -0.1), -29, norm='rms', fi=0.25, until=T('reignite', 0.05), fo=0.05, tag='lab air')
P('01_OPEN_DROPLET_PLINK_V1', DROP, -13, trim=(0.0, 0.9), align='onset', fo=0.2, env='lab', send=-3)
P('10_LAB_DROP_GLASS_V2', DROP + 0.005, -18, rate=0.929, align='onset', env='lab', send=-6)
P('10_LAB_CRYSTAL_SING_V1', DROP + 0.12, -23, rate=1.0663, fi=0.5, until=T('prism', 1.4), fo=0.8, width=1.3, env='lab', send=-6)
P(fizz(1.6, rate=60, seed=42), DROP + 0.25, -31, width=1.3, env='lab', send=-8, tag='fizz')
P('02_REVEAL_SHIMMER_BLOOM_V1', T('prism', 0.3), -20, trim=(0.85, 3.2), align=0.12, fo=0.4, env='lab', send=-6)
P(crystal(1567.98, 1.8, seed=43), PRISM, -33, width=1.5, env='lab', send=-8, tag='prism glass G6')
# the canister: the vial slides home, glass on steel; the lid swings over; the latch snaps shut and frost blooms
P('10_LAB_TWIST_LOCK_V1', SEAT - 0.25, -24, rate=0.9, fo=0.2, env='lab', send=-8, tag='vial slides in')
P('x4_clamp', SEAT, -20, trim=(0.55, None), align='onset', env='lab', send=-8)
P('05_PRE_VALVE_ACTUATE_V1', T('seal', 1.75), -30, trim=(0.0, 0.9), hpf=800, fo=0.2, env='lab', send=-8, tag='lid swings')
P('10_LAB_TWIST_LOCK_V2', LATCH - 0.315, -15, rate=1.3, align=0.158, env='lab', send=-8)
P('x4_switch', LATCH + 0.005, -22, align='onset', env='lab', send=-10)
P('10_LAB_FROST_BLOOM_V1', LATCH - 0.02, -21, until=T('reignite', 0.3), fo=0.3, env='lab', send=-6)
M.kill('lab', T('reignite'), 0.12)
# back in orbit: the dark bells, a held breath, then the relight. Clean, deep, with a crystal edge.
P('08_SPACE_RELIGHT_V1', RL - 0.3, -22, trim=(0.08, 0.45), align='onset', fo=0.1, space=True)
P(sub_boom(2.4, 62, 30, 0.3, 0.8), RL + 0.05, -9, tag='relight sub')
P('x4_refuel', RL + 0.03, -17, align='onset', space=True)
P('08_SPACE_RELIGHT_V2', RL + 0.05, -16, trim=(1.0, 3.0), fi=0.2, fo=0.6, lpf=2400, width=1.3)
P('02_REVEAL_SHIMMER_BLOOM_V1', RL - 0.05, -23, trim=(0.85, 2.6), align=0.12, fo=0.6, width=1.6, tag='crystal edge')
# the overtake: clean deep thrust swells and sweeps past; the rival's grind stays behind
P('09_RACE_THERA_THRUST_V1', RL + 0.1, -17, norm='rms', fi=0.4, loop=True, hpf=120, until=T('flicker', 0.6), fo=0.6, width=1.4, space=True,
  auto=[(RL, -6), (SURGE, -2), (SURGE + 0.5, 0), (T('overtake', 3.5), -4), (T('flicker', 0.6), -12)])
P(sub_boom(1.6, 55, 30, 0.25, 0.5), SURGE + 0.05, -14, tag='throttle up')
P(whoosh(2.2, 300, 2600, q=0.9, seed=32), SURGE + 0.3, -19, panauto=[(SURGE + 0.3, -0.6), (SURGE + 2.5, 0.4)], tag='TheraBreath passes')
P('05_PRE_TURBINE_RIVAL_V1', T('overtake', 0.1), -26, lpf=2000, fi=0.3, loop=True, until=T('flicker', 0.1), fo=0.2, pan=0.4, space=True)
# the rival's thrust stutters: out, back, out. No smoke, no fire: a cough, a catch, a cough.
P('05_PRE_TURBINE_RIVAL_V1', T('flicker'), -22, lpf=2400, fi=0.05, until=F_OFF1 + 0.1, fo=0.08, pan=0.15, space=True, tag='rival thrust')
P('08_SPACE_RIVAL_COUGH_V1', F_OFF1 - 0.04, -13, align='onset', fo=0.15, pan=0.1, env='hull', send=-12)
P('12_FAIL_SPUTTER_V2', F_ON - 0.02, -16, trim=(0.08, 0.62), fo=0.1, pan=0.1, space=True)
P('08_SPACE_RIVAL_COUGH_V2', F_OFF2 - 0.03, -14, align='onset', fo=0.2, pan=0.05, env='hull', send=-12)
P('08_SPACE_ENGINE_CUTOFF_V2', F_OFF2 + 0.15, -27, trim=(0.2, 1.6), rate=0.8, fo=0.5, lpf=2200, tag='and it winds down')

# ---------------------------------------------------------------- THE MOON
P('13_MOON_THRUSTER_PUFFS_V1', T('approach', 1.2), -26, trim=(1.9, 2.6), fo=0.15, pan=0.1)
P('13_MOON_THRUSTER_PUFFS_V1', T('approach', 2.6), -28, trim=(1.95, 2.5), fo=0.15, pan=-0.05)
P('14_HOME_LANDING_THRUST_V1', T('approach', 2.2), -22, lpf=2000, until=TOUCH, fo=0.4)
# touchdown in silence: the music has stopped; a foot, a little dust, a valve sighs; the radio line
P('13_MOON_TOUCHDOWN_V1', TOUCH, -15, align='onset', fo=0.3, hpf=50)
P('13_MOON_DUST_CRUNCH_V1', TOUCH + 0.03, -19, trim=(0.45, 0.95), align='onset', fo=0.15)
P('05_PRE_VALVE_ACTUATE_V1', TOUCH + 0.6, -29, trim=(0.2, 1.4), lpf=2500, fo=0.4)
P('x4_quindar', T('dust', 0.25), -27, rate=1.0465, until=T('dust', 0.46), fo=0.03)                  # "the Flavor has landed"
P('13_MOON_DUST_CRUNCH_V1', T('dust', 2.2), -24, trim=(0.95, 1.48), align='onset', fo=0.15)
# the flag: the hatch, the arm, the cloth snapping open with the music, the pole biting into the dust
P('05_HUSH_RELAY_CLICK_V1', T('flagout', 0.3), -27, align='onset')
P('08_SPACE_SERVO_V1', T('flagout', 0.5), -21, fo=0.2)
P(flutter(0.9, rate=13, lo=900, hi=5000, seed=46), UNFURL, -22, width=1.4, tag='flag unfurls')
P('08_SPACE_SERVO_V2', T('flagout', 2.6), -27, fo=0.2)
P('13_MOON_DUST_CRUNCH_V1', POLE, -15, trim=(0.45, 0.95), align='onset', rate=0.8, fo=0.15)
P(sub_boom(0.8, 90, 50, 0.1, 0.25), POLE + 0.01, -24, tag='pole thunk')
# off the Moon: a warm ignition, a faint glint of flavor in the exhaust
P('06_LAUNCH_IGNITION_CRACK_V2', LIFT, -22, align='onset', lpf=3500)
P(sub_boom(2.0, 60, 32, 0.3, 0.6), LIFT + 0.07, -19, tag='moon liftoff sub')
P('06_LAUNCH_ROAR_DISTANT_V1', LIFT + 0.1, -18, lpf=2200, fo=1.2, until=T('gag', 0.2), width=1.4)
P('11_RING_SPARKLE_PASS_V1', LIFT + 0.5, -29, hpf=4000, fo=0.8, width=1.7)
P('13_MOON_DUST_CRUNCH_V1', LIFT + 0.2, -26, trim=(0.45, 1.48), fo=0.5, width=1.5)

# ---------------------------------------------------------------- THE JOKE: the rival lands late, two seconds
P(space_drone(2.2, seed=16), T('gag'), -38, norm='rms', fi=0.2, until=T('homeward'), fo=0.2, tag='moon quiet')
P('12_FAIL_SPUTTER_V2', T('gag', 0.05), -20, trim=(0.7, None), lpf=3200, fi=0.1, until=LAND + 0.05, fo=0.08, pan=-0.1)
P('14_HOME_LANDING_THRUST_V1', T('gag', 0.1), -24, lpf=1600, until=LAND, fo=0.15)
P('13_MOON_TOUCHDOWN_V2', LAND, -14, align='onset', rate=0.85, fo=0.3, hpf=50)                       # clunk
P('01_OPEN_STRUCTURE_GROAN_V2', LAND + 0.22, -26, rate=1.6, lpf=3000, fo=0.25)                       # a little wobble
P('12_FAIL_SPUTTER_V2', LAND + 0.55, -17, trim=(0.08, 0.62), fo=0.12, pan=0.05)                      # one last cough, over the cut

# ---------------------------------------------------------------- HOME: one shot, then six glasses
P('09_RACE_THERA_THRUST_V1', T('homeward'), -26, norm='rms', fi=0.3, loop=True, lpf=3000, until=T('tasting'), fo=0.05, width=1.4, space=True)
P('14_HOME_REENTRY_PLASMA_V1', T('homeward', 1.8), -27, fi=0.6, until=T('tasting'), fo=0.04, width=1.5, lpf=5000)
# the tasting: a hard cut to a quiet room. Air, the glove, glass meeting stone, a tiny ring. No line, no music.
P(air(7.2, 200, 7000, hum=0.08, seed=17), T('tasting', -0.02), -33, norm='rms', fi=0.05, until=T('end', 0.1), fo=0.4, tag='tasting room air')
P(flutter(0.7, rate=7, lo=1200, hi=6000, seed=47), HAND, -36, width=1.2, pan=0.5, tag='glove')
P('14_HOME_GLASS_CLINK_V1', GLASS, -24, rate=0.79, align='onset', pan=0.35, env='lab:t', send=-12, tag='glass on stone')
P(sub_boom(0.25, 160, 120, 0.05, 0.06, harm=0.3), GLASS + 0.004, -30, tag='stone tock')
P('x4_drip', GLASS + 0.12, -38, hpf=1500, pan=0.35, tag='the liquid settles')
P(crystal(1396.9, 3.2, seed=52), GLASS + 0.03, -33, width=1.4, pan=0.3, env='lab:t', send=-8, tag='sixth glass rings')
P(flutter(0.6, rate=6, lo=1200, hi=6000, seed=48), AWAY, -38, width=1.2, pan=0.55, tag='glove away')
# the end card: one sung crystal tone rings out with the score's final gesture
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
    render(sys.argv[1] if len(sys.argv) > 1 else '../out/race13_sfx.wav')
