# THE FLAVOR RACE V11: the sound design, cue by cue, against the V11 cut. Read it like a score.
# Every time is T(segment, offset) on the V11 timeline; picture events are measured off the source clips (constants below).
# One element leads at a time: SFX, MUSIC, DIALOGUE or SILENCE. The music's share is MUSIC_AUTO in events11.py.
# Identities: TheraBreath = clean air, a smooth rising turbine, deep clean thrust, a crystal edge.
#             Competitor = a rough uneven idle, grinding turbine, a cough.
#             The Flavor Factory = relays, soft machines, glass. Discovery = drops, glass, fizz, sparkle.
#             Space = near silence, heard only through the hull.
# usage (from video/sound): python3 cues11.py ../out/race11_sfx.wav
import sys
import numpy as np
import soundfile as sf
from sdx import Mix, SR, bp, sub_boom, rumble, mains_hum, air, space_drone, whoosh, crystal, flutter
from timeline import Cut

V11 = Cut('FlavorRaceV11')
T = V11.t
M = Mix(V11.TOTAL)
P = M.put

# picture events (seconds on the V11 timeline)
SNAP = T('umbi', 0.40)                                   # the umbilical lets go
BANK1, BANK2, BANK3 = T('reveal', 0.30), T('reveal', 2.10), T('reveal', 3.20)   # the light banks: left, right, all
IGN = T('ignite')                                        # cut on the ignition
PUNCH = T('climb', 2.46)                                 # through the cloud deck
DROP = T('drop', 0.651)                                  # the drop meets the dish
SEAL = T('cell', 0.645)                                  # the fuel cell locks; frost blooms
GLOW, RL = T('relight', 0.30), T('relight', 1.50)        # the nozzles glow; the engines catch
TING = T('bolt', 1.65)                                   # the bolt floats free
COUGH = T('cough', 1.02)                                 # the rival coughs
TRAY1, TRAY2, TRAY3 = T('tray', 0.55), T('tray', 1.65), T('tray', 3.70)   # the arm: out, a hesitation, settle
ENDTONE = T('end', 0.45)                                 # TASTE THE FUTURE comes into focus
TINK = T('screw', 2.40)                                  # the screw meets the lens


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
# The pad, wide: vapor, floodlight hum, wind; the turbines spool under the count. Then the held breath. Then impact.
P('02_PAD_VAPOR_HISS_V1', T('padwide', -0.1), -20, norm='rms', fi=0.3, loop=True, lpf=8000, until=T('hush'), fo=0.02, width=1.4, env='pad:c', send=-8)
P(mains_hum(4, seed=6), T('padwide'), -30, norm='rms', fi=0.3, until=T('hush'), fo=0.02, width=1.3, tag='flood hum')
P('05_PRE_TURBINE_THERA_V1', T('padwide', -0.2), -23, fi=0.4, until=T('hush'), fo=0.02, pan=-0.4, env='pad:c', send=-9,
  auto=[(T('padwide'), -6), (T('hush'), 0)], rateauto=[(T('padwide'), 1.0), (T('hush'), 1.12)])
P('05_PRE_TURBINE_RIVAL_V1', T('padwide', 0.1), -25, lpf=2500, fi=0.4, until=T('hush'), fo=0.02, pan=0.45, env='pad:c', send=-9,
  auto=[(T('padwide'), -6), (T('hush'), 0)])
P(rumble(4, 40, 130, seed=7), T('padwide'), -25, norm='rms', fi=0.6, until=T('hush'), fo=0.02, width=1.2,
  auto=[(T('padwide'), -8), (T('hush'), 0)], tag='rumble')
P('05_PRE_TOWER_CREAK_V1', T('padwide', 0.9), -26, lpf=3500, fo=0.5, pan=0.55, env='pad:c', send=-3)
for k in range(2):                                                                        # a heartbeat under "three", "two"
    P('x4_heart', T('padwide', 0.29 + k * 0.95), -28, lpf=300)
M.kill('pad:c', T('hush'), 0.03)
# CUT TO SILENCE. One small relay click survives in the dark.
P('05_HUSH_RELAY_CLICK_V1', T('hush', 0.45), -27, align='onset', env='pad:d', send=-6)
# the nozzle: igniter sparks snapping, pressure at its peak
P('05_PRE_IGNITER_SPARKS_V1', T('spark', 0.1), -18, hpf=900, fi=0.06, until=IGN, fo=0.02, env='pad:d', send=-10)
P('05_PRE_IGNITER_SPARKS_V2', T('spark', 0.85), -20, hpf=1200, until=IGN, fo=0.02)
# IGNITION: a violent crack, combustion blooming into a roar, the sub slamming a fraction later
P('06_LAUNCH_IGNITION_CRACK_V3', IGN, -8, align='onset', width=1.3, env='pad:d', send=-3)
P('06_LAUNCH_IGNITION_CRACK_V1', IGN + 0.008, -12, align='onset', width=1.5)
P(sub_boom(3.2, 58, 26, 0.35, 1.2), IGN + 0.08, -6, tag='ignition sub')
P('06_LAUNCH_ROAR_BODY_V2', IGN + 0.02, 0, norm='rms', fi=0.12, loop=True, until=T('climb', 0.05), fo=0.05, width=1.4, env='pad:d', send=-6)
P('06_LAUNCH_ROAR_BODY_V1', IGN + 0.6, -3, norm='rms', fi=0.5, loop=True, until=T('climb', 0.05), fo=0.05, width=1.6)
P(rumble(8, 24, 60, seed=9), IGN + 0.05, -6, norm='rms', fi=0.2, until=T('climb', 1.6), fo=1.2, tag='liftoff sub rumble')
P('06_LAUNCH_CRACKLE_V1', IGN + 0.3, -12, until=T('climb', 0.2), fo=0.4, width=1.5, env='pad:d', send=-6)
P('06_LAUNCH_DEBRIS_RATTLE_V1', IGN + 0.2, -19, fo=0.8, pan=-0.35, width=1.2)
P('06_LAUNCH_GANTRY_SHAKE_V1', IGN + 0.5, -16, fo=0.6, pan=0.3, env='pad:d', send=-5)
P('06_LAUNCH_STEAM_WALL_V1', IGN + 1.8, -13, align=2.15, fo=0.6, width=1.8, until=T('climb', 0.15))
M.kill('pad:d', T('climb'), 0.12)
# from above: farther, more air; the cloud deck tears; the air thins, the pitch falls and the roar narrows to nothing
P('06_LAUNCH_ROAR_DISTANT_V1', T('climb', -0.05), -13, fi=0.15, until=PUNCH + 0.3, fo=0.6, lpf=1800, width=1.4)
P('07_ASCENT_CLOUD_PUNCH_V1', PUNCH - 0.15, -16, lpf=5000, fo=0.4, width=1.6)
P('06_LAUNCH_ROAR_BODY_V2', PUNCH - 0.3, -6, norm='rms', fi=0.3, loop=True, until=T('side'), fo=0.012, width=1.2,
  lpauto=[(PUNCH, 2600), (PUNCH + 2.0, 1100), (T('side', -0.1), 260)], rateauto=[(PUNCH, 1.0), (T('side'), 0.84)],
  auto=[(PUNCH, -2), (T('side', -0.6), 0), (T('side', -0.05), -3)])
P('07_ASCENT_WIND_SHEAR_V1', PUNCH - 0.5, -18, fi=0.8, loop=True, until=T('side'), fo=0.012, width=1.4,
  auto=[(PUNCH - 0.5, -8), (PUNCH + 1.5, -3), (T('side', -0.05), 4)], rateauto=[(PUNCH - 0.5, 1.0), (T('side'), 1.38)])

# ---------------------------------------------------------------- III. THE RACE AND THE CHOICE
# The roar CUTS. Two engines heard only through the hull: TheraBreath's clean and deep, the rival's rougher.
P(space_drone(14.0, seed=15), T('side'), -40, norm='rms', fi=0.4, until=T('sees', 0.6), fo=1.0, tag='space drone')
P('09_RACE_THERA_THRUST_V1', T('side'), -19, norm='rms', fi=0.03, loop=True, until=T('choice', 1.0), fo=0.6, space=True, pan=-0.2,
  auto=[(T('side'), 0), (T('choice'), -2), (T('choice', 0.9), -18)])
P('05_PRE_TURBINE_RIVAL_V1', T('side', 0.2), -27, lpf=1800, fi=0.6, until=T('pullaway', 2.6), fo=1.2, pan=0.35,
  auto=[(T('side'), -4), (T('side', 4.0), 0), (T('pullaway', 0.4), 0), (T('pullaway', 2.6), -14)])
# the rival slides in close, smug: its grinding engine shoulders past, with its own little fanfare
P('09_RACE_RIVAL_PASS_V2', T('side', 3.6), -22, align='peak', lpf=2500, pan=0.1)
P('mn_sfx_fanfare', T('side', 4.4), -24, pan=0.45)
# and it just goes faster: a long pass away from us, shrinking toward the Moon
P('09_RACE_RIVAL_PASS_V1', T('pullaway', 0.5), -16, align='peak', width=1.2, panauto=[(T('pullaway'), 0.1), (T('pullaway', 1.0), 0.25), (T('pullaway', 3.0), 0.05)])
P(whoosh(2.6, 900, 180, q=0.9, seed=21), T('pullaway', 0.2), -26, width=1.3, tag='rival recedes')
# THE CHOICE: TheraBreath's burners throttle down and go dark; a last hiss; hot metal ticks; near silence
P('08_SPACE_ENGINE_CUTOFF_V2', T('choice', -0.05), -19, trim=(0.2, 2.0), rate=1.15, fo=0.35, space=True)
P('08_SPACE_ENGINE_CUTOFF_V2', T('choice', -0.05), -29, trim=(0.2, 2.0), rate=1.15, fo=0.35, lpf=1600)
P('x_cutoff', T('choice', 1.3), -33, trim=(0.33, 2.6), lpf=2500, fo=0.8)
P('08_SPACE_METAL_TICKS_V1', T('choice', 1.6), -30, hpf=1200, fo=0.3, env='hull', send=-10)

# ---------------------------------------------------------------- IV. DISCOVERY
# What it stopped for. Small, bright, glass-lined sounds; the score light underneath.
P('11_RING_SPARKLE_PASS_V1', T('sees', -0.2), -27, hpf=3000, fo=0.8, width=1.6)               # a soft glitter passes
P(fizz(2.6, rate=40, seed=40), T('sees', 0.2), -31, width=1.6, tag='fizz far')
P('10_LAB_CITRUS_SPLIT_V1', T('yuzu', 0.02), -10, until=T('citrus'), fo=0.15, env='lab', send=-12)
P(air(16, 250, 9000, hum=0.15, seed=10), T('citrus', -0.1), -27, norm='rms', fi=0.25, until=T('lean', 0.2), fo=0.4, tag='lab air')
P('10_LAB_MIST_SPRAY_V1', T('citrus', 0.6), -16, hpf=1500, fo=0.4, env='lab', send=-6)             # citrus mist, a sparkling hiss
P('10_LAB_LEAVES_V1', T('tea'), -13, trim=(0.0, 0.6), fo=0.12, width=1.3)
P('10_LAB_SLICE_V1', T('cuke', 0.02), -11, trim=(0.0, 0.7), fo=0.1)
P(flutter(0.5, seed=9), T('cardamom'), -17, width=1.4, tag='petals')
P('10_LAB_AROMA_AIR_V1', T('cardamom', -0.05), -22, trim=(0.3, 0.9), hpf=1200, fo=0.2)
# the drop: a single plink, in near silence; its glass ring blooms into a sustained tone (in the score's key)
P('01_OPEN_DROPLET_PLINK_V1', DROP, -13, trim=(0.0, 0.9), align='onset', fo=0.2, env='lab', send=-3)
P('10_LAB_DROP_GLASS_V2', DROP + 0.005, -18, rate=0.929, align='onset', env='lab', send=-6)
P('10_LAB_CRYSTAL_SING_V1', DROP + 0.12, -22, rate=1.0663, fi=0.5, until=T('aroma', 1.2), fo=0.8, width=1.3, env='lab', send=-6)
P(fizz(1.6, rate=60, seed=42), DROP + 0.25, -30, width=1.3, env='lab', send=-8, tag='fizz')
# the aroma takes shape: swirling air and sparkles
P('10_LAB_AROMA_AIR_V1', T('aroma', 0.08), -20, width=1.5, env='lab', send=-6)
P('11_RING_SPARKLE_PASS_V1', T('aroma', 0.5), -28, hpf=4000, fo=0.6, width=1.6)
P(fizz(2.6, rate=90, seed=41), T('aroma', 0.1), -26, width=1.5, env='lab', send=-8, tag='fizz')
# light through the vial: refraction becomes a small shimmer
P('02_REVEAL_SHIMMER_BLOOM_V1', T('prism', 0.1), -20, trim=(0.85, 3.2), align=0.12, fo=0.4, env='lab', send=-6)
P(crystal(1567.98, 1.8, seed=43), T('prism', 0.9), -33, width=1.5, env='lab', send=-8, tag='prism glass G6')
# sealed: a precise twist-lock and a bloom of frost
P('10_LAB_TWIST_LOCK_V2', SEAL - 0.315, -15, rate=1.3, align=0.158, env='lab', send=-8)
P('10_LAB_FROST_BLOOM_V1', SEAL - 0.02, -21, until=T('lean', 0.3), fo=0.4, env='lab', send=-6)

# ---------------------------------------------------------------- V. THE SOLVE
# The Flavor Factory leans in; relays; one finger on the button; the signal goes up.
P('04_CONTROL_ROOMTONE_V1', T('lean', -0.2), -24, norm='rms', fi=0.2, loop=True, hpf=60, until=T('signal', 0.3), fo=0.4)
P('beeps', T('lean'), -31, norm='rms', lpf=6000, hpf=900, loop=True, fi=0.3, until=T('signal', 0.2), fo=0.4, width=1.4, env='room', send=-14)
P('02_REVEAL_RELAY_CHAIN_V1', T('lean', 0.6), -27, align='onset', lpf=4000, pan=0.4, env='room', send=-6)
P('05_PRE_BUTTON_PRESS_V1', T('press', 1.25), -16, align='onset', env='room', send=-10)
P('x4_switch', T('press', 1.255), -21, align='onset')
P('04_CONTROL_READY_CHIME_V1', T('press', 1.32), -31, rate=0.885, align='onset', env='room', send=-8)
# the signal arrives: a thread of glass rising, the fins take it up, two thruster puffs, a slow turn
P(whoosh(1.4, 600, 4200, q=1.6, seed=44, shape='rise'), T('signal', -0.2), -27, width=1.2, tag='signal rise')
P('11_RING_SPARKLE_PASS_V1', T('signal', 0.7), -26, hpf=3000, fo=0.6, width=1.4)
for k, (fq, g) in enumerate([(880.0, -31), (1318.5, -33), (1760.0, -34)]):                      # the find, heard as glass
    P(crystal(fq, 2.2, seed=70 + k), T('signal', 0.95 + 0.12 * k), g, width=1.4, env='hull', send=-12, tag='signal glass')
P('13_MOON_THRUSTER_PUFFS_V1', T('signal', 2.0), -22, trim=(1.9, 2.6), fo=0.15, pan=-0.3, space=True)
P('13_MOON_THRUSTER_PUFFS_V1', T('signal', 2.35), -24, trim=(1.95, 2.5), fo=0.15, pan=0.3, space=True)
P('08_SPACE_SERVO_V2', T('signal', 2.2), -28, fo=0.2, env='hull', send=-12)
# the relight: igniter clicks, the glow, a muffled whump through the hull, then deep clean thrust. The score lands.
P('08_SPACE_RELIGHT_V1', GLOW - 0.2, -24, trim=(0.08, 0.45), align='onset', fo=0.1, pan=-0.1)
P('08_SPACE_RELIGHT_V1', GLOW + 0.05, -26, trim=(0.08, 0.45), align='onset', fo=0.1, pan=0.1)
P('08_SPACE_RELIGHT_V2', GLOW + 0.1, -18, trim=(1.0, 3.0), fi=0.3, fo=0.6, lpf=2400, width=1.3)
P(sub_boom(2.4, 62, 30, 0.3, 0.8), RL + 0.05, -10, tag='relight sub')
P('x4_refuel', RL + 0.03, -17, align='onset', space=True)
P('09_RACE_THERA_THRUST_V1', RL, -16, norm='rms', fi=0.2, loop=True, hpf=120, until=T('bolt', 0.2), fo=0.3, width=1.4)
P('02_REVEAL_SHIMMER_BLOOM_V2', RL + 0.03, -24, hpf=3000, until=T('relight', 3.2), fo=0.6, width=1.6)
# the rival, ahead, starts to vibrate: its bolt backs out over the rough idle. Ting. One beat of nothing.
P('03_RIVAL_ROUGH_IDLE_V1', T('bolt', -0.1), -22, norm='rms', fi=0.2, lpf=700, until=TING - 0.03, fo=0.06, space=True)
P('12_FAIL_BOLT_UNSCREW_V1', T('bolt', 0.05), -14, until=TING - 0.07, fo=0.08, env='hull', send=-12)
P('x_tink', TING, -11, align='onset', env='hull', send=-10)
# the cough; a low polite warning tone; TheraBreath draws level, clean and steady
P('12_FAIL_SPUTTER_V2', COUGH, -10, trim=(0.08, 0.62), fo=0.12, pan=0.25, env='hull', send=-12)
P('x4_alarm', COUGH + 0.55, -26, rate=0.71, lpf=1800, fi=0.04, loop=True, until=T('approach', 0.6), fo=0.8, pan=0.3)
P('12_FAIL_SPUTTER_V2', COUGH + 0.9, -22, trim=(0.7, None), lpf=3000, fi=0.25, loop=True, until=T('approach', 0.5), fo=0.6, pan=0.35)
P('09_RACE_THERA_THRUST_V1', T('cough'), -21, norm='rms', fi=0.3, loop=True, hpf=120, until=T('approach', 0.4), fo=0.5, pan=-0.3, width=1.3)
P('x4_quindar', T('cough', 1.12), -27, rate=1.0465, until=T('cough', 1.33), fo=0.03)                  # the radio opens for "not ideal"

# ---------------------------------------------------------------- THE MOON
# Music leads (the song). The effects turn small and intimate.
P('13_MOON_THRUSTER_PUFFS_V1', T('approach', 1.4), -26, trim=(1.9, 2.6), fo=0.15, pan=0.1)
P('13_MOON_THRUSTER_PUFFS_V1', T('approach', 2.6), -28, trim=(1.95, 2.5), fo=0.15, pan=-0.05)
P('14_HOME_LANDING_THRUST_V1', T('approach', 2.4), -22, lpf=2000, until=T('dust', 0.1), fo=0.6)
P('x4_quindar', T('dust', -0.85), -27, rate=1.0465, until=T('dust', -0.64), fo=0.03)                 # "the Flavor has landed"
P('13_MOON_TOUCHDOWN_V1', T('dust', 0.05), -15, align='onset', fo=0.3, hpf=50)
P('13_MOON_DUST_CRUNCH_V1', T('dust', 0.08), -18, trim=(0.45, 0.95), align='onset', fo=0.15)
P('13_MOON_DUST_CRUNCH_V1', T('dust', 1.24), -21, trim=(0.95, 1.48), align='onset', fo=0.15)
P('05_PRE_VALVE_ACTUATE_V1', T('dust', 0.4), -28, trim=(0.2, 1.4), lpf=2500, fo=0.4)                 # a hydraulic sigh
P('08_SPACE_SERVO_V1', T('hero', 0.4), -21, fo=0.2)                                                   # the flag arm, precise
P('01_OPEN_STRUCTURE_GROAN_V2', T('hero', 1.6), -31, rate=1.4, lpf=2500, fo=0.5)                      # a little settling creak
P('09_RACE_THERA_THRUST_V1', T('homeward'), -28, norm='rms', fi=0.3, loop=True, lpf=3000, until=T('homeward', 2.8), fo=0.8, width=1.4)

# ---------------------------------------------------------------- HOME TO THE FLAVOR FACTORY
P('14_HOME_REENTRY_PLASMA_V1', T('reentry', -0.1), -19, until=T('descent', 0.2), fo=0.8, width=1.5)
P('06_LAUNCH_DEBRIS_RATTLE_V2', T('reentry', 0.5), -29, lpf=2500, until=T('descent'), fo=0.6)
P(whoosh(1.6, 2400, 400, q=0.8, seed=23), T('descent', -0.2), -24, width=1.6, tag='through the cloud')
# evening: a soft breeze, distant birds; the world is gentle now
P('14_HOME_EVENING_AMB_V1', T('descent', 0.6), -24, norm='rms', fi=1.2, loop=True, hpf=150, until=T('hush2'), fo=0.06, width=1.3)
P('06_LAUNCH_ROAR_DISTANT_V1', T('descent', 1.0), -25, lpf=900, fi=1.0, until=T('touch', 0.3), fo=0.8)
P('14_HOME_LANDING_THRUST_V1', T('touch', -0.1), -18, fo=0.6, env='lawn', send=-8)
P('14_HOME_ENGINE_SPINDOWN_V1', T('touch', 2.4), -22, fo=0.6, env='lawn', send=-10)
P('08_SPACE_METAL_TICKS_V1', T('touch', 3.3), -31, trim=(0.5, 1.4), fo=0.3, env='lawn', send=-12)
# the tray: the arm performs, with one tiny hesitation and a correction
P('14_HOME_ROBOT_ARM_V1', TRAY1 - 0.03, -25, trim=(0.0, 0.42), fo=0.08, pan=-0.15, env='lawn', send=-14)
P('14_HOME_GLASS_CLINK_V1', TRAY1 + 0.33, -26, rate=0.944, align='onset', env='lawn', send=-12)
P('14_HOME_SERVO_HESITATE_V2', TRAY2 - 0.05, -31, hpf=2500, fo=0.1, pan=-0.1, env='lawn', send=-14)
P('14_HOME_ROBOT_ARM_V2', TRAY3 - 0.03, -30, trim=(2.3, 2.75), fo=0.08, pan=-0.1)
# the arm settles: a small musical smile (F major, the song's key); six glasses come forward with a soft clink
for k, (fq, g) in enumerate([(1396.9, -31), (1760.0, -32), (2093.0, -31)]):
    P(crystal(fq, 1.4, seed=51 + k), T('tray', 2.62 + 0.09 * k), g, width=1.4, env='lawn', send=-10, tag='smile')
P('14_HOME_GLASS_CLINK_V1', T('cups', 0.08), -23, rate=0.944, align='onset', env='lawn', send=-12)
P('14_HOME_GLASS_CLINK_V2', T('cups', 2.05), -32, rate=0.944, env='lawn', send=-12)
# the end card: one sung crystal tone, on the song's own F, rings out into silence
P('15_END_CRYSTAL_TONE_V1', ENDTONE, -20, align='onset', width=1.4, env='vast:d', send=-4)
P(crystal(698.46, 6.0, seed=13), ENDTONE + 0.01, -29, width=1.5, env='vast:d', send=-6, tag='end glass F5')
P(crystal(1046.5, 4.0, seed=14), ENDTONE + 0.04, -36, width=1.5, env='vast:d', send=-6, tag='end glass C6')

# ---------------------------------------------------------------- THE BUTTON
P(space_drone(3.6, seed=16), T('screw', -0.1), -38, norm='rms', fi=0.6, until=T('screw', 2.6), fo=0.05, tag='space drone')
P('16_POST_SCREW_TINK_V1', TINK, -14, trim=(0.38, 0.75), align='onset')
P('15_END_CRYSTAL_TONE_V1', T('endB', 0.03), -22, align='onset', width=1.4, env='vast:e', send=-5)
for k, (fq, g) in enumerate([(698.46, -28), (880.0, -31), (1046.5, -32)]):
    P(crystal(fq, 4.0, seed=60 + k), T('endB', 0.03 + 0.06 * k), g, width=1.5, env='vast:e', send=-6, tag='resolve')


def render(dst):
    y = M.render()
    pk = np.abs(y).max()
    sf.write(dst, y.astype(np.float32), SR, subtype='FLOAT')      # float: the mix sets the level
    with open(dst.rsplit('.', 1)[0] + '_cues.tsv', 'w') as f:
        for a, b, src, g, env in sorted(M.log):
            f.write(f"{a:8.3f}\t{b:8.3f}\t{src}\t{g}\t{env}\n")
    print(f"{dst}: {len(y) / SR:.2f}s, peak {20 * np.log10(pk):.1f} dBFS, {len(M.log)} cues")


if __name__ == '__main__':
    render(sys.argv[1] if len(sys.argv) > 1 else '../out/race11_sfx.wav')
