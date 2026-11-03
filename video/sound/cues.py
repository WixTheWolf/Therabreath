# THE FLAVOR RACE: the sound design, cue by cue, against the locked cut. Read it like a score.
# Times are segment starts (t) or picture events measured to the frame off race9x_pic (the constants below).
# One element leads at a time: SFX, MUSIC, DIALOGUE or SILENCE. The music's share of that baton is MUSIC_AUTO at the
# bottom, applied to the score stem in the mix.
# Motifs: TheraBreath = precise servos, clean air, a smooth rising turbine, a crystal edge in its fire.
#         Competitor = a rough uneven idle, grinding turbine, rattling metal (the vibration that shakes its bolt loose).
#         Flavor = drops, glass, air, one sung crystal tone. Space = near silence, heard only through the hull.
# usage (from video/sound): python3 cues.py ../out/race9y_sfx.wav
import sys
import numpy as np
import soundfile as sf
from sdx import Mix, SR, sub_boom, rumble, mains_hum, air, space_drone, whoosh, crystal, flutter
from timeline import t, G0, TOTAL

from events import *

M = Mix(TOTAL)
P = M.put

# ---------------------------------------------------------------- I. MYSTERY (0 to 8.5)
# We do not know what we are looking at. True silence, then the smallest sounds, then the world opens. No music.
P('01_OPEN_PLASTIC_TICK_V1', 0.42, -22, trim=(0.18, 0.5), align='onset', pan=0.2, fo=0.05)          # cold plastic contracting
P(rumble(8, 38, 75, seed=1), 0.5, -24, norm='rms', fi=2.5, until=8.0, fo=0.015, width=0.6,           # pressure, below hearing
  auto=[(0.5, -30), (7.95, 0)], tag='pressure swell')
P('01_OPEN_FROST_CRACKLE_V1', 1.0, -27, trim=(0.4, 2.4), fi=0.4, fo=0.4, hpf=2500, pan=-0.15, width=0.8)  # frost forming
P('01_OPEN_PLASTIC_TICK_V2', 2.05, -26, trim=(0.53, 0.8), align='onset', pan=-0.35, fo=0.05)
# a droplet falls: the reverb is the clue that this small thing lives in an enormous space
P('01_OPEN_DROPLET_PLINK_V1', 3.45, -22, trim=(0.0, 0.9), align='onset', fo=0.2, pan=0.1, env='vast:a', send=1)
# the unknown, heard before it is understood: far off, something huge groans in the cold; something vents
P('01_OPEN_STRUCTURE_GROAN_V1', 4.35, -27, lpf=900, fi=0.6, until=7.95, fo=1.2, pan=-0.4, env='vast:a', send=2)
P('01_OPEN_CRYO_VENT_FAR_V1', 5.1, -25, norm='rms', hpf=400, lpf=4500, fi=1.2, until=8.0, fo=0.015, pan=0.45, env='vast:a', send=-4)
# the cap against the night: the stereo field opens for the first time; a cable pings a distant tower
P('01_OPEN_NIGHT_WIND_V1', 6.32, -19, norm='rms', trim=(6.705, None), fi=0.25, until=8.0, fo=0.015, width=1.6)
M.kill('vast:a', 8.0, 0.03)                                                                           # the black takes everything
# in the dark, one massive relay clunks somewhere offscreen. Something is waking up.
P('01_OPEN_BIG_RELAY_V2', 8.12, -17, align='onset', lpf=2800, pan=-0.3, env='vast:b', send=-4)

# ---------------------------------------------------------------- II. THE REVEAL (8.5 to 23.1)
P('01_OPEN_NIGHT_WIND_V1', 8.5, -24, norm='rms', trim=(9.0, None), fi=0.8, loop=True, until=t('plant'), fo=0.1, width=1.4,
  auto=[(8.5, 0), (14.0, 0), (15.0, -5)])
P('02_REVEAL_RELAY_CHAIN_V1', 9.15, -22, align='onset', lpf=4000, pan=0.55, env='pad:a', send=-2)   # relays in sequence
P('02_REVEAL_RELAY_CHAIN_V2', 9.85, -24, align='onset', lpf=3500, pan=-0.5, env='pad:a', send=-2)
P('01_OPEN_BIG_RELAY_V1', 10.45, -23, align='onset', lpf=3000, pan=0.2, env='pad:a', send=-3)
# the transformer climbs and stops dead on the first bank (pre-lap for the light)
P('02_REVEAL_TRANSFORMER_RISE_V2', BANK1 - 2.49, -22, trim=(0.65, 3.14), fi=1.2, fo=0.008, env='pad:a', send=-8)
# bank one, left: contactor slam, lamp strike, then the hum settles in
P('02_REVEAL_FLOOD_HIT_V1', BANK1, -14, align='onset', pan=-0.6, env='pad:a', send=-4)
P(sub_boom(1.2, 70, 40, 0.15, 0.3), BANK1 + 0.03, -20, tag='lamp thump')
P(mains_hum(14, seed=1), BANK1 + 0.05, -26, norm='rms', fi=0.35, until=t('plant'), fo=0.1, pan=-0.6, tag='flood hum L')
# bank two, right: the same family, farther and bigger, a longer tail
P('02_REVEAL_FLOOD_HIT_V3', BANK2, -12, align='onset', pan=0.65, env='pad:a', send=-1)
P(sub_boom(1.4, 66, 36, 0.18, 0.4), BANK2 + 0.04, -18, tag='lamp thump')
P(mains_hum(12, seed=2), BANK2 + 0.05, -26, norm='rms', fi=0.35, until=t('plant'), fo=0.1, pan=0.65, tag='flood hum R')
# all banks: every contactor at once, the light becomes sound (TheraBreath's crystal, first heard here),
# and the sub arrives a beat late. No braam. The score enters and takes the baton.
P('02_REVEAL_FLOOD_HIT_V1', BANK3, -10, align='onset', pan=-0.3, env='pad:a', send=0)
P('02_REVEAL_FLOOD_HIT_V3', BANK3 + 0.012, -10, align='onset', pan=0.35, env='pad:a', send=0)
P('02_REVEAL_FLOOD_HIT_V2', BANK3 + 0.02, -12, align='onset', width=1.3)
P('01_OPEN_BIG_RELAY_V1', BANK3 - 0.01, -15, align='onset', env='pad:a', send=-3)
P('02_REVEAL_SHIMMER_BLOOM_V1', BANK3, -16, trim=(0.85, None), align=0.12, fo=0.8, width=1.6, env='pad:a', send=-6)
P(sub_boom(3.0, 52, 26, 0.4, 1.0), BANK3 + 0.11, -9, tag='delayed sub')
# the hero hold: music leads; underneath, the floodlights hum and cryo vapor hisses off both rockets
P('02_PAD_VAPOR_HISS_V1', 14.4, -21, norm='rms', fi=1.5, loop=True, until=t('plant'), fo=0.1, lpf=7000, width=1.3, env='pad:a', send=-10)
# the COMPETITOR: a rough, uneven idle, felt more than noticed
P('03_RIVAL_ROUGH_IDLE_V2', 19.45, -17, norm='rms', fi=0.4, lpf=3200, until=t('title', 0.8), fo=0.7, pan=0.25,
  lpauto=[(19.4, 3200), (21.55, 3200), (21.65, 650), (23.1, 650), (23.5, 1600)])
P('03_RIVAL_HYDRAULIC_GROAN_V1', 20.35, -27, lpf=2500, until=t('plant'), fo=0.3, pan=0.35, env='pad:a', send=-6)
M.kill('pad:a', t('plant'), 0.15)
# the loose bolt: everything drops away but the idle, muffled, and the bolt rattling in time with it. One tink.
P('03_PLANT_BOLT_RATTLE_V1', 21.62, -21, trim=(0.0, 1.6), fo=0.25, pan=0.05)
P('x_tink', 22.62, -24, align='onset', pan=0.1)
# the title: a restrained low push of air and a soft crystalline resolve. No slam.
P(whoosh(1.1, 90, 420, q=0.8, seed=3), 22.75, -18, width=1.4, tag='air push')
P('02_REVEAL_SHIMMER_BLOOM_V2', 23.12, -25, hpf=2500, fo=1.0, width=1.5, env='pad:b', send=-6)
P(mains_hum(4, seed=3), 23.1, -32, norm='rms', fi=0.6, until=t('mcwide'), fo=0.5, width=1.2, tag='flood hum')
P('02_PAD_VAPOR_HISS_V1', 23.1, -26, norm='rms', trim=(3.0, None), fi=0.6, until=t('mcwide'), fo=0.5, lpf=6000, width=1.3)

# ---------------------------------------------------------------- III. FLAVOR CONTROL (26.3 to 38.6)
# Dialogue leads. A small warm room; the roll call rides a relay-click metronome; the room thins as the machine takes over.
P('04_CONTROL_ROOMTONE_V1', 26.1, -24, norm='rms', fi=0.2, loop=True, hpf=60, until=t('padgo', 0.3), fo=0.3,
  auto=[(26.1, 0), (34.2, 0), (38.6, -7)])
for i in range(9):
    P('x_metro', G0 + i - 0.02, -27, pan=0.15, env='room', send=-8)
P('mn_sfx_paper', G0 + 6.3, -24, pan=-0.2, env='room', send=-10)        # "Finish": one empty beat and a shuffle of paper
# READY: a clean, glassy confirmation, in the score's D
P('04_CONTROL_READY_CHIME_V2', READY, -31, rate=0.885, align='onset', env='room', send=-8)
P(crystal(1174.66, 1.6, seed=4), READY + 0.005, -34, env='room', send=-10, tag='ready glass D6')
P(crystal(1760.0, 1.2, seed=5), READY + 0.07, -38, env='room', send=-10, tag='ready glass A6')
# pressure rising: the needle creaks, tanks ping as they chill, propellant rushes through the pipes
P('05_PRE_GAUGE_NEEDLE_V1', t('gauge1', 0.05), -27, hpf=600, until=t('gauge2'), fo=0.2, pan=-0.1)
P('05_PRE_TANK_PINGS_V2', t('gauge2', 0.1), -27, until=t('padgo', 0.4), fo=0.5, pan=0.3, env='room', send=-12)
P('05_PRE_PIPE_FLOW_V1', t('gauge2', -0.2), -20, norm='rms', lpf=1800, fi=1.2, until=t('padgo', 0.6), fo=0.6,
  auto=[(35.6, -8), (38.6, 0)])

# ---------------------------------------------------------------- IV. THE MACHINE WAKES (38.6 to 47.6)
# SFX leads, the score low underneath. CLICK. LOCK. VALVE. PRESSURE. WHINE. RUMBLE. DEEPER RUMBLE. STRUCTURE CREAKS.
# A beat. Then the hush, and ignition. Exterior pad: open air, a long tail off the towers.
P('02_PAD_VAPOR_HISS_V1', 38.45, -20, norm='rms', fi=0.3, loop=True, lpf=8000, until=HUSH, fo=0.02, width=1.4, env='pad:c', send=-8,
  lpauto=[(44.69, 8000), (44.71, 900), (45.29, 900), (45.31, 8000)])          # muffled while we are inside at the button
P(mains_hum(9, seed=6), 38.5, -30, norm='rms', fi=0.4, until=HUSH, fo=0.02, width=1.3, tag='flood hum')
P('01_OPEN_NIGHT_WIND_V1', 38.5, -26, norm='rms', trim=(1.0, None), fi=0.5, until=HUSH, fo=0.02, width=1.5)
P('05_HUSH_RELAY_CLICK_V2', 38.78, -23, align='onset', pan=-0.3, env='pad:c', send=-4)                       # CLICK
P('x4_clamp', 39.45, -20, trim=(0.55, None), align='onset', pan=0.25, env='pad:c', send=-4)                    # LOCK
P('05_PRE_VALVE_ACTUATE_V2', 40.05, -22, align='onset', fo=0.4, pan=-0.35, env='pad:c', send=-5)             # VALVE
P('05_PRE_PIPE_FLOW_V1', 40.3, -20, norm='rms', lpf=1500, fi=0.8, until=HUSH, fo=0.02, env='pad:c', send=-10,   # PRESSURE
  auto=[(40.3, -6), (46.5, 0)])
P('x_vent', 40.55, -24, pan=0.4, env='pad:c', send=-6)
# WHINE: TheraBreath's turbopump, clean and rising, left; the rival's, grinding and uneven, right
P('05_PRE_TURBINE_THERA_V1', 40.7, -23, fi=0.6, until=HUSH, fo=0.02, pan=-0.4, env='pad:c', send=-9,
  auto=[(40.7, -6), (45.6, 0)], rateauto=[(40.7, 1.0), (46.6, 1.12)])
P('05_PRE_TURBINE_RIVAL_V1', 41.1, -25, lpf=2500, fi=0.5, until=HUSH, fo=0.02, pan=0.45, env='pad:c', send=-9,
  auto=[(41.1, -6), (45.6, 0)])
P(rumble(6, 45, 140, seed=7), 41.5, -25, norm='rms', fi=1.0, until=HUSH, fo=0.02, width=1.2,                  # RUMBLE
  auto=[(41.5, -8), (46.5, 0)], tag='rumble')
P(rumble(4, 28, 70, seed=8), 43.4, -26, norm='rms', fi=1.2, until=HUSH, fo=0.02,                              # DEEPER RUMBLE
  auto=[(43.4, -8), (46.5, 0)], tag='deeper rumble')
P('05_PRE_TOWER_CREAK_V1', 42.38, -25, lpf=3500, fo=0.5, pan=0.55, env='pad:c', send=-3)                      # STRUCTURE CREAKS
P('01_OPEN_STRUCTURE_GROAN_V2', 45.55, -22, lpf=1800, until=HUSH, fo=0.02, pan=-0.5, env='pad:c', send=-4)
for k in range(2):                                                                                            # under "3" and "2"
    P('x4_heart', t('count', 0.29 + k * 0.95), -28, lpf=300)
# on "one" the umbilical snaps away in a burst of cryo vapor
P('05_PRE_UMBILICAL_RELEASE_V2', SNAP, -13, align='onset', pan=0.1, env='pad:c', send=-4)
P('05_PRE_UMBILICAL_RELEASE_V1', SNAP + 0.015, -16, align='onset', pan=0.2, width=1.4, eq=((2500, -5, 0.8),))
P('x_vent', SNAP + 0.03, -17, width=1.5, env='pad:c', send=-5, eq=((2500, -5, 0.8),))
# the button: a heavy, solid click, inside
P('05_PRE_BUTTON_PRESS_V1', PRESS, -12, align='onset', env='room', send=-10)
P('x4_switch', PRESS + 0.005, -18, align='onset')
# the igniters: rapid electric snapping, pressure at its peak
P('05_PRE_IGNITER_SPARKS_V1', 45.42, -18, hpf=900, fi=0.06, until=HUSH, fo=0.02, env='pad:c', send=-10)
M.kill('pad:c', HUSH, 0.03)
# CUT TO SILENCE. After a long beat, one small relay click survives.
P('05_HUSH_RELAY_CLICK_V1', 47.22, -26, align='onset', env='pad:d', send=-6)

# ---------------------------------------------------------------- V. LIFTOFF (47.6 to 66.7)
# Ignition: a violent crack, combustion blooming into a roar, the sub slamming a fraction later. The score is carved down.
P('06_LAUNCH_IGNITION_CRACK_V3', IGN, -8, align='onset', width=1.3, env='pad:d', send=-3)
P('06_LAUNCH_IGNITION_CRACK_V1', IGN + 0.008, -12, align='onset', width=1.5)
P(sub_boom(3.2, 58, 26, 0.35, 1.2), IGN + 0.08, -6, tag='ignition sub')
# the roar in layers: body, a second body, crackle, the gantry and debris rattling, the pad answering back
# as the smoke wall hits, the perspective goes inside the cloud: the roar muffles, then a rushing wall of air
MUFFLE = [(WALL, 9000), (INSIDE, 420), (t('topdown'), 420)]
P('06_LAUNCH_ROAR_BODY_V2', IGN + 0.02, 0, norm='rms', fi=0.12, loop=True, until=t('topdown', 0.05), fo=0.05, width=1.4,
  env='pad:d', send=-6, lpauto=MUFFLE, auto=[(IGN, 0), (49.7, 0), (WALL, 1), (INSIDE, -3)])
P('06_LAUNCH_ROAR_BODY_V1', t('thunder', -0.3), -2, norm='rms', fi=0.4, loop=True, until=t('topdown', 0.05), fo=0.05, width=1.6,
  lpauto=MUFFLE, auto=[(49.4, 0), (WALL, 1), (INSIDE, -4)])
P(rumble(9, 24, 60, seed=9), IGN + 0.05, -6, norm='rms', fi=0.2, until=t('topdown', 1.2), fo=1.0, tag='liftoff sub rumble')
P('06_LAUNCH_CRACKLE_V1', IGN + 0.3, -12, until=WALL + 0.3, fo=0.5, width=1.5, env='pad:d', send=-6)
P('06_LAUNCH_DEBRIS_RATTLE_V1', IGN + 0.2, -19, fo=0.8, pan=-0.35, width=1.2)
P('06_LAUNCH_GANTRY_SHAKE_V1', IGN + 0.5, -16, fo=0.6, pan=0.3, env='pad:d', send=-5)
P('06_LAUNCH_DEBRIS_RATTLE_V2', t('thunder', 0.4), -21, until=WALL + 0.2, fo=0.4, pan=0.4, width=1.2)
P('06_LAUNCH_STEAM_WALL_V1', INSIDE, -10, align=2.15, fo=0.4, width=1.8, until=t('topdown', 0.15))           # the wall of air
P('x_whoomph', INSIDE - 0.1, -14, align='onset', width=1.5)
M.kill('pad:d', t('topdown'), 0.12)
# from above: farther away, more air, less detail. The score rises and takes the baton.
P('06_LAUNCH_ROAR_DISTANT_V1', t('topdown', -0.05), -13, fi=0.15, fo=0.6, until=t('lift', 0.4), lpf=1600, width=1.4)
P(whoosh(1.8, 2400, 900, q=0.7, seed=12), t('topdown', 0.0), -24, width=1.6, tag='air')
# ground level, off the pad: the roar rolling across the land, with crackle
P('06_LAUNCH_ROAR_DISTANT_V1', t('lift', -0.05), -14, fi=0.08, until=t('breach', 0.3), fo=0.8, width=1.5, env='pad:e', send=-4)
P('06_LAUNCH_CRACKLE_V1', t('lift', 0.1), -19, lpf=2500, until=t('breach', 0.3), fo=0.8, width=1.4, env='pad:e', send=-6)
P('06_LAUNCH_TAIL_V1', t('lift', 1.4), -14, fo=1.5, until=t('breach', 0.6), env='pad:e', send=-6)
# from high above: the rockets clear the ring of cloud; the cloud tears; wind shear
P('06_LAUNCH_ROAR_BODY_V1', t('breach', -0.1), -10, norm='rms', fi=0.3, loop=True, lpf=1800, until=t('climb', 0.2), fo=0.6, width=1.3)
P('07_ASCENT_CLOUD_PUNCH_V1', 61.25, -17, lpf=5000, fo=0.4, width=1.6)
# the climb: the air thins, highs fall away, the pitch drops and the roar narrows; the wind shear whistles faster and higher
P('06_LAUNCH_ROAR_BODY_V2', t('climb', -0.6), -4, norm='rms', fi=0.6, loop=True, until=EDGE, fo=0.012, width=1.2,
  lpauto=[(62.7, 2600), (64.5, 1100), (66.6, 260)], rateauto=[(62.7, 1.0), (66.7, 0.84)], auto=[(62.7, -2), (66.0, 0), (66.65, -2)])
P('07_ASCENT_WIND_SHEAR_V1', 61.7, -18, fi=0.8, loop=True, until=EDGE, fo=0.012, width=1.4,
  auto=[(61.7, -8), (64.0, -3), (66.65, 5)], rateauto=[(61.7, 1.0), (66.7, 1.38)])
M.kill('pad:e', EDGE, 0.03)

# ---------------------------------------------------------------- VI. SPACE (66.7 to 84.6)
# The roar CUTS. The engines are heard only through the hull now: a low structural hum. The audience feels small.
P(space_drone(8.0, seed=15), EDGE, -40, norm='rms', fi=0.4, until=t('race', 0.4), fo=1.0, tag='space drone')
P('08_SPACE_HULL_HUM_V1', EDGE, -27, norm='rms', fi=0.03, loop=True, until=t('hull', 1.6), fo=1.0)
P('09_RACE_THERA_THRUST_V1', EDGE, -19, norm='rms', fi=0.03, loop=True, until=69.95, fo=0.5, space=True,
  auto=[(EDGE, 0), (67.6, -3), (t('hull'), -6), (69.9, -20)])
# the burners throttle down and go dark: the rumble winds down, a last hiss, then hot metal ticking as it cools
P('08_SPACE_ENGINE_CUTOFF_V2', t('hull', -0.05), -20, trim=(0.2, 2.0), rate=1.15, fo=0.35, space=True)
P('08_SPACE_ENGINE_CUTOFF_V2', t('hull', -0.05), -30, trim=(0.2, 2.0), rate=1.15, fo=0.35, lpf=1600)
P('x_cutoff', 69.92, -32, trim=(0.33, 2.6), lpf=2500, fo=0.8)
P('08_SPACE_METAL_TICKS_V1', 70.25, -30, hpf=1200, fo=0.3, env='hull', send=-10)
P('08_SPACE_SERVO_V1', 71.55, -29, fo=0.15, env='hull', send=-12)                       # a precise servo adjusts
# the float: near silence. The competitor coughs once, muffled: funny, and a warning.
P('12_FAIL_SPUTTER_V2', 72.38, -22, trim=(0.08, 0.62), fo=0.12, space=True, pan=0.3)
# the relight: igniter clicks, a muffled whump through the hull, clean thrust rising. The score returns.
P('08_SPACE_RELIGHT_V1', 73.42, -24, trim=(0.08, 0.45), align='onset', fo=0.1, pan=-0.1)
P('08_SPACE_RELIGHT_V1', 73.62, -26, trim=(0.08, 0.45), align='onset', fo=0.1, pan=0.1)
P(sub_boom(1.3, 72, 38, 0.2, 0.35), GLOW + 0.05, -14, tag='relight whump')
P('x4_refuel', GLOW + 0.03, -18, align='onset', space=True)
P('08_SPACE_RELIGHT_V2', GLOW + 0.1, -16, trim=(1.0, 3.0), fi=0.2, fo=0.6, lpf=2400, width=1.3)
# the race: music leads; TheraBreath's thrust stays clean and steady underneath
P('09_RACE_THERA_THRUST_V1', 74.2, -27, norm='rms', fi=0.5, loop=True, lpf=3000, until=t('yuzu', 0.1), fo=0.4, width=1.4)
# the competitor's grinding engine shoulders past, with its own little fanfare
P('05_PRE_TURBINE_RIVAL_V1', 79.3, -27, lpf=1800, fi=0.8, until=83.6, fo=1.2, pan=0.4)
P('09_RACE_RIVAL_PASS_V2', 80.3, -21, align='peak', lpf=2500, pan=-0.1)
P('09_RACE_RIVAL_PASS_V1', 81.0, -15, align='peak', width=1.2, panauto=[(79.8, -0.2), (81.0, 0.15), (82.6, 0.7)])
P('mn_sfx_fanfare', t('shoulder', 4.1), -22, pan=0.45)

# ---------------------------------------------------------------- VII. THE LAB (84.6 to 95)
# Wonder through tiny sounds. The score steps back. Small, bright, glass-lined.
P('10_LAB_CITRUS_SPLIT_V1', t('yuzu', 0.02), -10, until=t('rose'), fo=0.15, env='lab', send=-12)
P(flutter(0.55, seed=9), t('rose'), -17, width=1.4, tag='petals')
P('10_LAB_AROMA_AIR_V1', t('rose', -0.05), -21, trim=(0.3, 0.9), hpf=1200, fo=0.2)
P('10_LAB_LEAVES_V1', t('tea'), -13, trim=(0.0, 0.55), fo=0.12, width=1.3)
P('10_LAB_SLICE_V1', t('cuke', 0.02), -11, trim=(0.0, 0.6), fo=0.1)
P(air(9, 250, 9000, hum=0.15, seed=10), t('dropper', -0.1), -27, norm='rms', fi=0.25, until=t('launchI', 0.1), fo=0.3, tag='lab air')
P('10_LAB_MIST_SPRAY_V1', 86.95, -16, hpf=1500, fo=0.4, env='lab', send=-6)             # citrus mist, a sparkling hiss
# the drop: the opening's droplet, answered; its glass ring blooms into a sustained tone (in the score's key)
P('01_OPEN_DROPLET_PLINK_V1', DROP, -13, trim=(0.0, 0.9), align='onset', fo=0.2, env='lab', send=-3)
P('10_LAB_DROP_GLASS_V2', DROP + 0.005, -18, rate=0.929, align='onset', env='lab', send=-6)
P('10_LAB_CRYSTAL_SING_V1', DROP + 0.12, -22, rate=1.0663, fi=0.5, until=t('swirl', 0.9), fo=0.7, width=1.3, env='lab', send=-6)
# the aroma takes shape: soft swirling air and faint sparkles
P('10_LAB_AROMA_AIR_V1', t('swirl', 0.08), -20, width=1.5, env='lab', send=-6)
P('11_RING_SPARKLE_PASS_V1', t('swirl', 0.4), -28, hpf=4000, fo=0.6, width=1.6)
# light through the vial: the light becomes sound again, small and close this time
P('02_REVEAL_SHIMMER_BLOOM_V1', t('canister'), -20, trim=(0.85, 3.2), align=0.12, fo=0.4, env='lab', send=-6)
# sealed: a precise twist-lock and a bloom of frost
P('10_LAB_TWIST_LOCK_V2', SEAL - 0.315, -15, rate=1.3, align=0.158, env='lab', send=-8)
P('10_LAB_FROST_BLOOM_V1', SEAL - 0.02, -21, until=t('launchI', 0.2), fo=0.4, env='lab', send=-6)
# launched: a pneumatic thoomp rising into a whoosh; the music swells
P('10_LAB_LAUNCH_THOOMP_V1', t('launchI', 0.02), -15, align='onset', hpf=60)
P(whoosh(1.2, 300, 2400, q=1.0, seed=11, shape='rise'), t('launchI', 0.15), -22, width=1.5, tag='rise')

# ---------------------------------------------------------------- VIII. THE FAILURE (95 to 114.6)
P('11_RING_SPARKLE_PASS_V1', t('ring', 0.3), -27, hpf=3000, fo=0.8, width=1.6)           # a soft glitter passes
P('11_RING_SPARKLE_PASS_V1', t('through', 0.2), -30, rate=0.9, hpf=3500, fo=0.8, width=1.6)
# the relight: the new TheraBreath engine, powerful, with a crystalline edge
P('06_LAUNCH_IGNITION_CRACK_V2', RELIGHT, -10, align='onset', width=1.4)
P(sub_boom(2.4, 62, 30, 0.3, 0.8), RELIGHT + 0.07, -10, tag='relight sub')
P('09_RACE_THERA_THRUST_V1', RELIGHT + 0.02, -17, norm='rms', fi=0.1, loop=True, hpf=120, until=t('bolt'), fo=0.3, width=1.4)
P('02_REVEAL_SHIMMER_BLOOM_V2', RELIGHT + 0.03, -24, hpf=3000, fo=0.6, width=1.6)
# the bolt backs out, threads squeaking; under it the same rough vibration we met on the pad, shaking it loose
P('03_RIVAL_ROUGH_IDLE_V1', 101.9, -22, norm='rms', fi=0.3, lpf=700, until=t('sputter', 0.3), fo=0.3, space=True)
P('12_FAIL_BOLT_UNSCREW_V1', 102.05, -13, until=t('sputter'), fo=0.2, env='hull', send=-12)
P('03_PLANT_BOLT_RATTLE_V2', 103.15, -18, trim=(0.0, 0.75), fo=0.2)
# the sputter: misfires, unstable combustion, the hull straining, a low alarm
P('12_FAIL_SPUTTER_V2', 104.0, -12, lpf=4000, until=106.7, fo=0.3, pan=0.25, env='hull', send=-10)
P('12_FAIL_HULL_STRAIN_V1', 104.9, -18, pan=0.2, env='hull', send=-8)
P('x4_alarm', 104.3, -28, rate=0.71, lpf=1500, fi=0.4, loop=True, until=t('flare'), fo=0.5, pan=0.3)
# the smoke: a harsh leak hiss and crackle from the rival; TheraBreath steady and clean beside it
P('12_FAIL_LEAK_HISS_V1', 106.6, -16, lpf=7000, until=t('flare', 0.2), fo=0.6, pan=0.45)
P('12_FAIL_SPUTTER_V1', 106.55, -15, lpf=3500, until=t('flare', 0.1), fo=0.3, pan=0.5)
P('09_RACE_THERA_THRUST_V1', t('smoke'), -24, norm='rms', fi=0.3, loop=True, until=t('flare'), fo=0.3, pan=-0.5)
# the label glows: an unstable whine climbs; then, for a fraction of a second, almost silence
P('12_FAIL_OVERPRESSURE_WHINE_V1', 108.85, -7, loop=True, until=110.06, fo=0.025, auto=[(108.85, -8), (110.0, 0)],
  rateauto=[(108.85, 1.0), (110.06, 1.32)])
# the explosion: attack softened (no air), mass kept: a heavy body, a delayed sub, then debris
P('12_FAIL_EXPLOSION_BODY_V1', BOOM, -3, align='onset', fi=0.03, lpf=3000, width=1.5, env='vast:c', send=-8, until=t('adrift'), fo=0.12)
P('12_FAIL_EXPLOSION_BODY_V2', BOOM + 0.02, -7, align='onset', fi=0.04, lpf=2200, width=1.3, until=t('adrift'), fo=0.12)
P(sub_boom(3.5, 48, 22, 0.5, 1.3), BOOM + 0.09, -4, until=t('adrift'), fo=0.15, tag='explosion sub')
P('12_FAIL_DEBRIS_PINGS_V1', BOOM + 0.7, -26, until=t('adrift'), fo=0.12, width=1.6, env='hull:boom', send=-12)
M.kill('vast:c', t('adrift'), 0.08)
M.kill('hull:boom', t('adrift'), 0.08)
# adrift: cut to silence with the picture; one faint creak as the wreck turns. "Not ideal." Hold the beat.
P(space_drone(4.0, seed=12), t('adrift'), -40, norm='rms', fi=0.8, until=t('tomoon', 1.0), fo=1.0, tag='space drone')
P('01_OPEN_STRUCTURE_GROAN_V1', 112.3, -31, rate=0.8, lpf=700, fi=0.3, until=114.4, fo=0.8, space=True)

# ---------------------------------------------------------------- IX. THE MOON (114.6 to 137.4)
# Music leads (Mr. Blue Sky). The effects turn small and intimate: performance, not slapstick.
P('09_RACE_THERA_THRUST_V1', t('tomoon'), -27, norm='rms', fi=0.4, loop=True, lpf=2500, until=t('approach', 0.3), fo=0.5, pan=0.2)
P('13_MOON_THRUSTER_PUFFS_V1', 118.2, -24, trim=(1.9, 2.6), fo=0.15, pan=0.1)              # soft retro-thruster puffs
P('13_MOON_THRUSTER_PUFFS_V1', 118.9, -27, trim=(1.95, 2.5), fo=0.15, pan=-0.05)
P('14_HOME_LANDING_THRUST_V1', 119.55, -20, lpf=2000, until=122.4, fo=1.0)
P('13_MOON_TOUCHDOWN_V1', TOUCH, -14, align='onset', fo=0.3, hpf=50)                                  # the legs take the weight
P('05_PRE_VALVE_ACTUATE_V1', TOUCH + 0.25, -27, trim=(0.2, 1.4), lpf=2500, fo=0.4)          # a hydraulic sigh
P('01_OPEN_STRUCTURE_GROAN_V2', 121.1, -30, rate=1.4, lpf=2500, until=122.6, fo=0.5)        # a little settling creak
P('13_MOON_DUST_CRUNCH_V1', 123.88, -18, trim=(0.45, 0.95), align='onset', fo=0.15)           # the foot pad presses into fine dust
P('13_MOON_DUST_CRUNCH_V1', 124.74, -21, trim=(0.95, 1.48), align='onset', fo=0.15)
P('08_SPACE_SERVO_V1', 126.3, -18, fo=0.2)                                                    # the flag arm, precise
for at in (t('adrift', 0.3), t('footA', -0.9)):                                              # radio lines open with a Quindar tone
    P('x4_quindar', at - 0.25, -27, rate=1.0465, until=at - 0.04, fo=0.03)

# ---------------------------------------------------------------- X. HOME (137.4 to 166.1)
P('06_LAUNCH_IGNITION_CRACK_V2', t('liftoff', 0.15), -24, align='onset', lpf=3500)          # off the Moon: clean and warmer
P(sub_boom(2.0, 60, 32, 0.3, 0.6), t('liftoff', 0.22), -21, tag='moon liftoff sub')
P('09_RACE_THERA_THRUST_V1', t('liftoff', 0.15), -29, norm='rms', fi=0.2, loop=True, lpf=3000, until=t('homeward', 1.6), fo=1.0, width=1.4)
P('14_HOME_REENTRY_PLASMA_V1', t('reentry', -0.1), -19, until=t('descent', 0.1), fo=0.8, width=1.5)   # plasma and buffeting
P('06_LAUNCH_DEBRIS_RATTLE_V2', t('reentry', 0.5), -29, lpf=2500, until=t('descent'), fo=0.6)
# evening: a soft breeze, distant birds; the world is gentle now
P('14_HOME_EVENING_AMB_V1', t('descent', -0.2), -24, norm='rms', fi=1.2, loop=True, hpf=150, until=t('end', 0.3), fo=1.2, width=1.3)
P('06_LAUNCH_ROAR_DISTANT_V1', t('descent', 0.6), -24, lpf=900, fi=1.0, until=t('touchhome', 0.3), fo=0.8)
# touchdown at home: the engines throttle down and spin down, then cooling metal ticks
P('14_HOME_LANDING_THRUST_V1', t('touchhome', -0.1), -18, fo=0.6, env='lawn', send=-8)
P('14_HOME_ENGINE_SPINDOWN_V1', t('touchhome', 2.0), -22, fo=0.6, env='lawn', send=-10)
P('08_SPACE_METAL_TICKS_V1', t('touchhome', 2.9), -30, trim=(0.5, 2.2), fo=0.3, env='lawn', send=-12)
# the hatch: a latch, then a refined pneumatic hiss
P('05_HUSH_RELAY_CLICK_V1', HATCH - 0.03, -26, align='onset')
P('05_PRE_VALVE_ACTUATE_V2', HATCH, -23, trim=(0.05, 1.5), hpf=900, lpf=9000, fo=0.6, env='lawn', send=-10)
# the tray: the arm performs, with one tiny hesitation and a correction
P('14_HOME_ROBOT_ARM_V1', TRAY1 - 0.03, -25, trim=(0.0, 0.42), fo=0.08, pan=-0.15, env='lawn', send=-14)
P('14_HOME_GLASS_CLINK_V1', TRAY1 + 0.33, -26, rate=0.944, align='onset', env='lawn', send=-12)
P('14_HOME_SERVO_HESITATE_V2', TRAY2 - 0.05, -31, hpf=2500, fo=0.1, pan=-0.1, env='lawn', send=-14)
P('14_HOME_ROBOT_ARM_V2', TRAY3 - 0.03, -30, trim=(2.3, 2.75), fo=0.08, pan=-0.1)
P('14_HOME_GLASS_CLINK_V1', t('cups', 0.12), -23, rate=0.944, align='onset', env='lawn', send=-12)
P('14_HOME_GLASS_CLINK_V2', t('cups', 1.4), -28, rate=0.944, env='lawn', send=-12)
# the end card: the song fades; one sung crystal tone, on the song's own F, rings out into silence
P('15_END_CRYSTAL_TONE_V1', ENDTONE, -20, align='onset', width=1.4, env='vast:d', send=-4)
P(crystal(698.46, 6.0, seed=13), ENDTONE + 0.01, -29, width=1.5, env='vast:d', send=-6, tag='end glass F5')
P(crystal(1046.5, 4.0, seed=14), ENDTONE + 0.04, -36, width=1.5, env='vast:d', send=-6, tag='end glass C6')

# ---------------------------------------------------------------- XI. POST-CREDIT (166.1 to 169.5)
# Space silence. The screw tumbles closer. A tiny glass tink against the lens, and out.
P(space_drone(3.6, seed=16), t('screw', -0.1), -38, norm='rms', fi=0.6, until=TOTAL, fo=0.05, tag='space drone')
P('16_POST_SCREW_TINK_V1', TINK, -14, trim=(0.38, 0.75), align='onset')

def render(dst):
    y = M.render()
    pk = np.abs(y).max()
    sf.write(dst, y.astype(np.float32), SR, subtype='FLOAT')      # float: the mix sets the level
    with open(dst.rsplit('.', 1)[0] + '_cues.tsv', 'w') as f:
        for a, b, src, g, env in sorted(M.log):
            f.write(f"{a:8.3f}\t{b:8.3f}\t{src}\t{g}\t{env}\n")
    print(f"{dst}: {len(y) / SR:.2f}s, peak {20 * np.log10(pk):.1f} dBFS, {len(M.log)} cues")


if __name__ == '__main__':
    render(sys.argv[1] if len(sys.argv) > 1 else '../out/race9y_sfx.wav')
