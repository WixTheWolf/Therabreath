# THE FLAVOR RACE V12: the sound design, cue by cue, against the V12 cut. Read it like a score.
# Every time is T(segment, offset) on the V11 timeline; picture events are measured off the source clips (constants below).
# One element leads at a time: SFX, MUSIC, DIALOGUE or SILENCE. The music's share is MUSIC_AUTO in events11.py.
# Identities: TheraBreath = clean air, a smooth rising turbine, deep clean thrust, a crystal edge.
#             Competitor = a rough uneven idle, grinding turbine, a cough.
#             The Flavor Factory = relays, soft machines, glass. Discovery = drops, glass, fizz, sparkle.
#             Space = near silence, heard only through the hull.
# usage (from video/sound): python3 cues12.py ../out/race12_sfx.wav
import sys
import numpy as np
import soundfile as sf
from sdx import Mix, SR, bp, sub_boom, rumble, mains_hum, air, space_drone, whoosh, crystal, flutter
from timeline import Cut

V12 = Cut('FlavorRaceV12')
T = V12.t
M = Mix(V12.TOTAL)
P = M.put

# picture events (seconds on the V12 timeline)
SNAP = T('umbi', 0.40)                                   # the umbilical lets go
BANK1, BANK2, BANK3 = T('reveal', 0.30), T('reveal', 2.10), T('reveal', 3.20)   # the light banks: left, right, all
PRESS = T('button', 0.18)                                # the launch button goes down
BLOOM = T('nozzle', 2.375)                               # the nozzle blooms white (source 1.9 at 0.8x)
IGN = T('ignite')                                        # cut to fire, on the score's hit
PUNCH = T('track', 2.5)                                  # the long lens loses them in the cloud
DROP = T('drop', 0.651)                                  # the drop meets the dish
SEAL = T('cell', 2.645)                                  # the fuel cell locks; frost blooms
GO = T('press', 1.05)                                    # the button glows under the finger
LIFE = T('life', 1.0)                                    # the flavor floods the bottle
RL = T('life', 2.2)                                      # the engines bloom
COUGH = T('cough', 0.6)                                  # the rival's puff
TOUCH = T('dust', 0.05)                                  # Moon touchdown
UNFURL = T('flagout', 1.6)                               # the flag opens out of the bottle
POLE = T('pole', 0.35)                                   # the pole bites into the dust
LIFT = T('moonlift', 1.1)                                # off the Moon
HATCH = T('robot', 0.85)                                 # the hatch unlatches
ARM = T('robot', 1.6)                                    # the arm comes out
SETTLE = T('robot', 4.1)                                 # the tray settles
LAND = T('gag', 2.3)                                     # the rival finally lands
ENDTONE = T('end', 0.45)                                 # TASTE THE FUTURE comes into focus


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
# True silence, then the smallest sounds of something enormous and cold. No music until the light.
P('01_OPEN_PLASTIC_TICK_V1', 0.35, -22, trim=(0.18, 0.5), align='onset', pan=0.2, fo=0.05)
P(rumble(6, 38, 75, seed=1), 0.3, -26, norm='rms', fi=2.0, until=T('dark'), fo=0.3, width=0.6,
  auto=[(0.3, -30), (5.0, 0)], tag='pressure swell')
P('01_OPEN_FROST_CRACKLE_V1', 0.6, -28, trim=(0.4, 2.4), fi=0.3, fo=0.4, hpf=2500, pan=-0.15, width=0.8)
# the umbilical lets go: a hard mechanical snap and a burst of cryo vapor
P('05_PRE_UMBILICAL_RELEASE_V2', SNAP, -15, align='onset', pan=0.1, env='vast:a', send=-4)
P('x_vent', SNAP + 0.03, -19, width=1.5, env='vast:a', send=-5, eq=((2500, -5, 0.8),))
# the cap: droplets run down the ribs; one plink tells us how big this place is
P('01_OPEN_DROPLET_PLINK_V1', T('cap', 0.55), -23, trim=(0.0, 0.9), align='onset', fo=0.2, pan=0.15, env='vast:a', send=1)
P('01_OPEN_PLASTIC_TICK_V2', T('cap', 1.0), -27, trim=(0.53, 0.8), align='onset', pan=-0.3, fo=0.05)
# the engine bells: cold metal, vapor rolling off, something huge groaning in the cold
P('02_PAD_VAPOR_HISS_V1', T('bells', -0.1), -24, norm='rms', fi=0.4, until=T('dark', 0.4), fo=0.4, lpf=6500, width=1.3)
P('01_OPEN_STRUCTURE_GROAN_V1', T('bells', 0.2), -27, lpf=900, fi=0.4, until=T('dark', 1.2), fo=0.8, pan=-0.4, env='vast:a', send=2)
P('01_OPEN_CRYO_VENT_FAR_V1', T('bells', 0.6), -27, norm='rms', hpf=400, lpf=4500, fi=0.6, until=T('dark', 1.4), fo=0.5, pan=0.45, env='vast:a', send=-4)
M.kill('vast:a', T('reveal', 0.1), 0.3)
# the dark pad: night wind; one massive relay wakes something up
P('01_OPEN_NIGHT_WIND_V1', T('dark', -0.1), -22, norm='rms', trim=(6.705, None), fi=0.5, loop=True, until=T('standoff', 2.6), fo=0.4, width=1.5,
  auto=[(T('dark'), 0), (BANK3, 0), (BANK3 + 1.0, -5)])
P('01_OPEN_BIG_RELAY_V2', T('dark', 0.5), -18, align='onset', lpf=2800, pan=-0.3, env='pad:a', send=-4)
P('02_REVEAL_RELAY_CHAIN_V1', T('dark', 1.1), -23, align='onset', lpf=4000, pan=0.55, env='pad:a', send=-2)
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
P('04_CONTROL_ROOMTONE_V1', T('mcwide', -0.2), -24, norm='rms', fi=0.2, loop=True, hpf=60, until=T('partners', 0.3), fo=0.4)
P('beeps', T('mcwide'), -30, norm='rms', lpf=6000, hpf=900, loop=True, fi=0.4, until=T('partners', 0.2), fo=0.4, width=1.4, env='room', send=-14)
P('05_HUSH_RELAY_CLICK_V2', T('mcwide', 0.9), -27, align='onset', pan=-0.3, env='room', send=-8)
P('04_CONTROL_READY_CHIME_V2', T('mcwide', 2.2), -32, rate=0.885, align='onset', env='room', send=-8)
P(crystal(1174.66, 1.6, seed=4), T('mcwide', 2.205), -35, env='room', send=-10, tag='ready glass D6')
# the partner card: one low push of air
P(whoosh(1.4, 80, 300, q=0.7, seed=5), T('partners', -0.4), -21, width=1.3, tag='card air')

# ---------------------------------------------------------------- II. LAUNCH
# The pad holds perfectly still: vapor, floodlight hum, wind, the turbines spooling under the count.
P('02_PAD_VAPOR_HISS_V1', T('padcold', -0.1), -20, norm='rms', fi=0.3, loop=True, lpf=8000, until=T('nozzle'), fo=0.05, width=1.4, env='pad:c', send=-8,
  lpauto=[(T('button', -0.01), 8000), (T('button'), 900), (T('nozzle', -0.01), 900)])          # muffled while we are inside at the button
P(mains_hum(4, seed=6), T('padcold'), -30, norm='rms', fi=0.3, until=T('nozzle'), fo=0.05, width=1.3, tag='flood hum')
P('01_OPEN_NIGHT_WIND_V1', T('padcold'), -27, norm='rms', trim=(1.0, None), fi=0.4, until=T('nozzle'), fo=0.05, width=1.5)
P('05_PRE_TURBINE_THERA_V1', T('padcold', -0.2), -24, fi=0.4, until=BLOOM - 0.55, fo=0.05, pan=-0.4, env='pad:c', send=-9,
  auto=[(T('padcold'), -8), (BLOOM - 0.6, 0)], rateauto=[(T('padcold'), 1.0), (BLOOM - 0.55, 1.22)])
P('05_PRE_TURBINE_RIVAL_V1', T('padcold', 0.1), -26, lpf=2500, fi=0.4, until=T('nozzle', 0.2), fo=0.1, pan=0.45, env='pad:c', send=-9)
P(rumble(5, 40, 130, seed=7), T('padcold'), -25, norm='rms', fi=0.6, until=BLOOM - 0.55, fo=0.05, width=1.2,
  auto=[(T('padcold'), -8), (BLOOM - 0.6, 0)], tag='rumble')
for k in range(2):                                                                        # a heartbeat under "three", "two"
    P('x4_heart', T('padcold', 0.34 + k * 0.95), -28, lpf=300)
# the button: a heavy, solid click, inside
P('05_PRE_BUTTON_PRESS_V1', PRESS, -12, align='onset', env='room', send=-10)
P('x4_switch', PRESS + 0.005, -18, align='onset')
P('05_PRE_UMBILICAL_RELEASE_V2', T('nozzle', 0.05), -16, align='onset', pan=0.1, env='pad:c', send=-5)     # the last line lets go
M.kill('pad:c', T('nozzle', 0.3), 0.3)
# the nozzle wakes: igniters snap, a whine climbs, a reversed rush is sucked in, and for one breath there is nothing
P('05_PRE_IGNITER_SPARKS_V1', T('nozzle', 0.3), -17, hpf=900, fi=0.05, until=BLOOM - 0.5, fo=0.04, env='pad:d', send=-10)
P('05_PRE_IGNITER_SPARKS_V2', T('nozzle', 1.1), -19, hpf=1200, until=BLOOM - 0.5, fo=0.04, pan=0.2)
P(whoosh(1.6, 300, 5200, q=1.2, seed=31, shape='rise'), BLOOM - 2.1, -20, width=1.3, fo=0.02, until=BLOOM - 0.5, tag='rising whine')
P('02_PAD_VAPOR_HISS_V1', T('nozzle', 0.1), -24, norm='rms', hpf=2500, fi=0.3, until=BLOOM - 0.5, fo=0.05, tag='gas hiss')
P(rumble(3, 20, 55, seed=33), T('nozzle', 0.6), -24, norm='rms', fi=1.4, until=BLOOM - 0.5, fo=0.05, tag='combustion, below hearing')
P('08_SPACE_RELIGHT_V1', T('nozzle', 1.35), -24, trim=(0.08, 0.45), align='onset', fo=0.1, tag='first flame lick')
P('06_LAUNCH_ROAR_BODY_V2', BLOOM - 1.1, -19, trim=(0.0, 0.8), rev=True, fi=0.5, fo=0.02, until=BLOOM - 0.48, width=1.6, tag='reverse suck')
P('05_HUSH_RELAY_CLICK_V1', BLOOM - 0.05, -26, align='onset', env='pad:d', send=-4)                       # one relay, in the silence
# IGNITION: a violent crack, the sub a fraction late, then the roar in layers
P('06_LAUNCH_IGNITION_CRACK_V3', IGN, -7, align='onset', width=1.3, env='pad:d', send=-3)
P('06_LAUNCH_IGNITION_CRACK_V1', IGN + 0.008, -11, align='onset', width=1.5)
P(sub_boom(3.4, 58, 24, 0.35, 1.3), IGN + 0.07, -5, tag='ignition sub')
P('06_LAUNCH_ROAR_BODY_V2', IGN + 0.02, 0, norm='rms', fi=0.1, loop=True, until=T('topdown', 0.05), fo=0.05, width=1.4, env='pad:d', send=-6)
P('06_LAUNCH_ROAR_BODY_V1', IGN + 0.4, -3, norm='rms', fi=0.4, loop=True, until=T('topdown', 0.05), fo=0.05, width=1.6)
P(rumble(8, 22, 60, seed=9), IGN + 0.05, -6, norm='rms', fi=0.2, until=T('track', 0.5), fo=0.8, tag='liftoff sub rumble')
P('06_LAUNCH_CRACKLE_V1', IGN + 0.25, -11, until=T('topdown', 0.2), fo=0.4, width=1.5, env='pad:d', send=-6)
P('06_LAUNCH_DEBRIS_RATTLE_V1', IGN + 0.2, -18, fo=0.8, pan=-0.35, width=1.2)
P('06_LAUNCH_GANTRY_SHAKE_V1', IGN + 0.45, -15, fo=0.6, pan=0.3, env='pad:d', send=-5)
P('06_LAUNCH_STEAM_WALL_V1', T('tbfire', 0.2), -12, align=2.15, fo=0.6, width=1.8, until=T('topdown', 0.15))
P('06_LAUNCH_DEBRIS_RATTLE_V2', T('tbfire', 0.3), -20, fo=0.5, pan=0.4, width=1.2)
M.kill('pad:d', T('topdown'), 0.12)
# from above: farther, more air
P('06_LAUNCH_ROAR_DISTANT_V1', T('topdown', -0.05), -12, fi=0.1, until=T('track', 0.3), fo=0.4, lpf=1800, width=1.4)
P(whoosh(1.4, 2400, 800, q=0.7, seed=12), T('topdown'), -24, width=1.6, tag='air')
# the long lens: miles away, the sound arrives late and thin; the crackle tears; then the cloud swallows them
P('06_LAUNCH_ROAR_DISTANT_V1', T('track', 0.25), -14, fi=0.3, until=PUNCH + 0.5, fo=0.8, lpf=1400, width=1.2, env='pad:e', send=-4)
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
P(space_drone(14.0, seed=15), T('side'), -40, norm='rms', fi=0.4, until=T('sees', 0.6), fo=1.0, tag='space drone')
P('09_RACE_THERA_THRUST_V1', T('side'), -19, norm='rms', fi=0.05, loop=True, until=T('choice', 1.0), fo=0.6, space=True, pan=-0.2,
  auto=[(T('side'), 0), (T('choice'), -2), (T('choice', 0.9), -18)])
P('05_PRE_TURBINE_RIVAL_V1', T('side', 0.2), -27, lpf=1800, fi=0.6, until=T('pullaway', 2.6), fo=1.0, pan=0.35,
  auto=[(T('side'), -4), (T('neck'), 0), (T('pullaway', 0.4), 0), (T('pullaway', 2.6), -14)])
P('09_RACE_RIVAL_PASS_V2', T('neck', 0.8), -24, align='peak', lpf=2500, pan=0.15)
P('05_PRE_TURBINE_RIVAL_V1', T('rivalcu', -0.1), -20, lpf=2600, fi=0.1, until=T('pullaway', 0.4), fo=0.3, pan=0.3, rateauto=[(T('rivalcu'), 1.0), (T('pullaway', 0.4), 1.25)], tag='rival winds up')
P('09_RACE_RIVAL_PASS_V1', T('pullaway', 0.4), -15, align='peak', width=1.2, panauto=[(T('pullaway'), 0.1), (T('pullaway', 1.0), 0.25), (T('pullaway', 3.0), 0.05)])
P(whoosh(2.6, 900, 180, q=0.9, seed=21), T('pullaway', 0.2), -25, width=1.3, tag='rival recedes')
P('08_SPACE_ENGINE_CUTOFF_V2', T('choice', -0.05), -18, trim=(0.2, 2.0), rate=1.15, fo=0.35, space=True)
P('08_SPACE_ENGINE_CUTOFF_V2', T('choice', -0.05), -28, trim=(0.2, 2.0), rate=1.15, fo=0.35, lpf=1600)
P('x_cutoff', T('choice', 1.3), -33, trim=(0.33, 2.6), lpf=2500, fo=0.8)
P('08_SPACE_METAL_TICKS_V1', T('choice', 1.6), -30, hpf=1200, fo=0.3, env='hull', send=-10)

# ---------------------------------------------------------------- IV. DISCOVERY
P('11_RING_SPARKLE_PASS_V1', T('sees', -0.2), -27, hpf=3000, fo=0.8, width=1.6)
P(fizz(2.6, rate=40, seed=40), T('sees', 0.2), -31, width=1.6, tag='fizz far')
P('10_LAB_CITRUS_SPLIT_V1', T('yuzu', 0.02), -10, until=T('citrus'), fo=0.15, env='lab', send=-12)
P(air(17, 250, 9000, hum=0.15, seed=10), T('citrus', -0.1), -27, norm='rms', fi=0.25, until=T('lean', 0.2), fo=0.4, tag='lab air')
P('10_LAB_MIST_SPRAY_V1', T('citrus', 0.6), -16, hpf=1500, fo=0.4, env='lab', send=-6)
P('10_LAB_LEAVES_V1', T('tea'), -13, trim=(0.0, 0.6), fo=0.12, width=1.3)
P('10_LAB_SLICE_V1', T('cuke', 0.02), -11, trim=(0.0, 0.7), fo=0.1)
P(flutter(0.5, seed=9), T('cardamom'), -17, width=1.4, tag='petals')
P('10_LAB_AROMA_AIR_V1', T('cardamom', -0.05), -22, trim=(0.3, 0.9), hpf=1200, fo=0.2)
P('01_OPEN_DROPLET_PLINK_V1', DROP, -13, trim=(0.0, 0.9), align='onset', fo=0.2, env='lab', send=-3)
P('10_LAB_DROP_GLASS_V2', DROP + 0.005, -18, rate=0.929, align='onset', env='lab', send=-6)
P('10_LAB_CRYSTAL_SING_V1', DROP + 0.12, -23, rate=1.0663, fi=0.5, until=T('aroma', 1.2), fo=0.8, width=1.3, env='lab', send=-6)
P(fizz(1.6, rate=60, seed=42), DROP + 0.25, -30, width=1.3, env='lab', send=-8, tag='fizz')
P('10_LAB_AROMA_AIR_V1', T('aroma', 0.08), -20, width=1.5, env='lab', send=-6)
P('11_RING_SPARKLE_PASS_V1', T('aroma', 0.5), -28, hpf=4000, fo=0.6, width=1.6)
P(fizz(2.6, rate=90, seed=41), T('aroma', 0.1), -26, width=1.5, env='lab', send=-8, tag='fizz')
P('02_REVEAL_SHIMMER_BLOOM_V1', T('prism', 0.1), -20, trim=(0.85, 3.2), align=0.12, fo=0.4, env='lab', send=-6)
P(crystal(1567.98, 1.8, seed=43), T('prism', 0.9), -33, width=1.5, env='lab', send=-8, tag='prism glass G6')
# refueling: the vial slides home into the fuel cell, twists, locks; frost blooms over the steel
P('05_PRE_VALVE_ACTUATE_V1', T('cell', 0.25), -27, trim=(0.0, 0.9), hpf=800, fo=0.2, env='lab', send=-8)
P('10_LAB_TWIST_LOCK_V1', T('cell', 1.2), -20, fo=0.2, env='lab', send=-8)
P('10_LAB_TWIST_LOCK_V2', SEAL - 0.315, -15, rate=1.3, align=0.158, env='lab', send=-8)
P('10_LAB_FROST_BLOOM_V1', SEAL - 0.02, -20, until=T('lean', 0.3), fo=0.4, env='lab', send=-6)

# ---------------------------------------------------------------- V. THE SOLVE (no dialogue)
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
# the pass: clean, deep thrust sweeping past; the rival's red light; ting; the cough
P('09_RACE_THERA_THRUST_V1', T('pass'), -16, norm='rms', fi=0.1, loop=True, hpf=120, until=T('approach', 0.2), fo=0.5, width=1.4)
P(whoosh(1.8, 300, 2600, q=0.9, seed=32), T('pass', 0.3), -19, panauto=[(T('pass', 0.3), -0.6), (T('pass', 2.0), 0.4)], tag='TheraBreath passes')
P('x4_alarm', T('cough', 0.1), -27, rate=0.71, lpf=1800, fi=0.04, loop=True, until=T('sputter', 1.1), fo=0.4, pan=0.3)
P('12_FAIL_SPUTTER_V2', COUGH, -11, trim=(0.08, 0.62), fo=0.12, pan=0.25, env='hull', send=-12)
P('12_FAIL_SPUTTER_V2', T('sputter', 0.0), -15, trim=(0.7, None), lpf=3500, fi=0.05, until=T('approach', 0.3), fo=0.4, pan=0.2)

# ---------------------------------------------------------------- THE MOON
P('13_MOON_THRUSTER_PUFFS_V1', T('approach', 1.2), -26, trim=(1.9, 2.6), fo=0.15, pan=0.1)
P('13_MOON_THRUSTER_PUFFS_V1', T('approach', 2.4), -28, trim=(1.95, 2.5), fo=0.15, pan=-0.05)
P('14_HOME_LANDING_THRUST_V1', T('approach', 2.0), -22, lpf=2000, until=T('dust', 0.1), fo=0.5)
P('13_MOON_TOUCHDOWN_V1', TOUCH, -14, align='onset', fo=0.3, hpf=50)
P('13_MOON_DUST_CRUNCH_V1', TOUCH + 0.03, -18, trim=(0.45, 0.95), align='onset', fo=0.15)
P('05_PRE_VALVE_ACTUATE_V1', TOUCH + 0.6, -28, trim=(0.2, 1.4), lpf=2500, fo=0.4)
P('13_MOON_DUST_CRUNCH_V1', T('dust', 1.6), -22, trim=(0.95, 1.48), align='onset', fo=0.15)
P('x4_quindar', T('dust', 0.25), -27, rate=1.0465, until=T('dust', 0.46), fo=0.03)                  # "the Flavor has landed"
# the flag: the hatch, the arm, the cloth snapping open, the pole biting into the dust
P('05_HUSH_RELAY_CLICK_V1', T('flagout', 0.2), -27, align='onset')
P('08_SPACE_SERVO_V1', T('flagout', 0.4), -21, fo=0.2)
P(flutter(0.9, rate=13, lo=900, hi=5000, seed=46), UNFURL, -22, width=1.4, tag='flag unfurls')
P('08_SPACE_SERVO_V2', T('flagout', 2.4), -27, fo=0.2)
P('13_MOON_DUST_CRUNCH_V1', POLE, -15, trim=(0.45, 0.95), align='onset', rate=0.8, fo=0.15)
P(sub_boom(0.8, 90, 50, 0.1, 0.25), POLE + 0.01, -24, tag='pole thunk')
# off the Moon through a ring of flavor: a warm ignition, then sparkle
P('06_LAUNCH_IGNITION_CRACK_V2', LIFT, -22, align='onset', lpf=3500)
P(sub_boom(2.0, 60, 32, 0.3, 0.6), LIFT + 0.07, -19, tag='moon liftoff sub')
P('06_LAUNCH_ROAR_DISTANT_V1', LIFT + 0.1, -18, lpf=2200, fo=1.2, until=T('gag', 0.2), width=1.4)
P('11_RING_SPARKLE_PASS_V1', LIFT + 0.5, -29, hpf=4000, fo=0.8, width=1.7)                   # a faint glint of flavor in the exhaust
P('13_MOON_DUST_CRUNCH_V1', LIFT + 0.2, -26, trim=(0.45, 1.48), fo=0.5, width=1.5)
P('09_RACE_THERA_THRUST_V1', T('homeward'), -28, norm='rms', fi=0.3, loop=True, lpf=3000, until=T('homeward', 2.3), fo=0.8, width=1.4)

# ---------------------------------------------------------------- HOME TO THE FLAVOR FACTORY
P('14_HOME_REENTRY_PLASMA_V1', T('homeward', 1.2), -24, until=T('descent', 0.3), fo=0.8, width=1.5)
P(whoosh(1.6, 2400, 400, q=0.8, seed=23), T('descent', -0.2), -24, width=1.6, tag='through the cloud')
P('14_HOME_EVENING_AMB_V1', T('descent', 0.6), -24, norm='rms', fi=1.2, loop=True, hpf=150, until=T('end'), fo=0.4, width=1.3)
P('06_LAUNCH_ROAR_DISTANT_V1', T('descent', 1.0), -25, lpf=900, fi=1.0, until=T('touch', 0.3), fo=0.8)
P('14_HOME_LANDING_THRUST_V1', T('touch', -0.1), -18, fo=0.6, env='lawn', send=-8)
P('14_HOME_ENGINE_SPINDOWN_V1', T('touch', 2.4), -22, fo=0.6, env='lawn', send=-10)
# the robot: latch, the hatch swings up, servos, the arm unfolds out of the bottle, one hesitation, glass on the tray
P('05_HUSH_RELAY_CLICK_V1', HATCH - 0.03, -24, align='onset', env='lawn', send=-12)
P('05_PRE_VALVE_ACTUATE_V2', HATCH, -23, trim=(0.05, 1.5), hpf=900, lpf=9000, fo=0.6, env='lawn', send=-10)
P('14_HOME_ROBOT_ARM_V1', ARM, -24, fo=0.15, pan=-0.15, env='lawn', send=-14)
P('14_HOME_GLASS_CLINK_V1', ARM + 0.9, -27, rate=0.944, align='onset', env='lawn', send=-12)
P('14_HOME_SERVO_HESITATE_V2', SETTLE - 0.7, -30, hpf=2500, fo=0.1, pan=-0.1, env='lawn', send=-14)
P('14_HOME_GLASS_CLINK_V2', SETTLE, -25, rate=0.944, env='lawn', send=-12)
for k, (fq, g) in enumerate([(1396.9, -31), (1760.0, -32), (2093.0, -31)]):            # a small musical smile
    P(crystal(fq, 1.4, seed=51 + k), SETTLE + 0.1 + 0.09 * k, g, width=1.4, env='lawn', send=-10, tag='smile')

# ---------------------------------------------------------------- THE BUTTON: meanwhile, on the Moon
P(space_drone(5.2, seed=16), T('gag'), -38, norm='rms', fi=0.3, until=T('homeward'), fo=0.3, tag='moon quiet')
P('12_FAIL_SPUTTER_V2', T('gag', 0.3), -20, trim=(0.7, None), lpf=3200, fi=0.2, until=LAND + 0.1, fo=0.1, pan=-0.1)
P('14_HOME_LANDING_THRUST_V1', T('gag', 0.6), -24, lpf=1600, until=LAND, fo=0.2)
P('13_MOON_TOUCHDOWN_V2', LAND, -14, align='onset', rate=0.85, fo=0.3, hpf=50)                       # clunk
P('01_OPEN_STRUCTURE_GROAN_V2', LAND + 0.25, -26, rate=1.6, lpf=3000, fo=0.3)                        # a little wobble
P('12_FAIL_SPUTTER_V2', LAND + 0.7, -16, trim=(0.08, 0.62), fo=0.12, pan=0.05)                       # one last cough
P('08_SPACE_ENGINE_CUTOFF_V2', LAND + 0.9, -24, trim=(0.2, 1.6), rate=0.8, fo=0.5, lpf=2500)        # and it winds down
P('01_OPEN_PLASTIC_TICK_V2', LAND + 2.0, -24, trim=(0.53, 0.8), align='onset')                        # a tiny embarrassed tick
# the end card: one sung crystal tone rings out with the finale's last chord
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
    render(sys.argv[1] if len(sys.argv) > 1 else '../out/race12_sfx.wav')
