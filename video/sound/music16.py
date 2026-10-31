# THE FLAVOR RACE V16: the music stem, built straight from the new score cues on their own clocks (film = file + S),
# so nothing is time-stretched. Five cues (ElevenLabs Music v2.5, D major, 152.02 BPM, bar 1.5787 s; the beat grids
# and per-bar levels were measured with scratch/grid.py) are placed so their bar lines land on the picture:
# A. the opening cue: its first eleven seconds are cut; a quiet swell rides under the condensation, drops to nothing
#    under EVERY CATEGORY HAS A RACE, and its bloom (file 20.79) lands on the first lamp; its hits fall as the Moon
#    clears the clouds behind the pad (file 27.11) and on the cap in the cold (file 33.42); it fades away under the
#    count so the spark and the WHUMP play in near silence;
# B1. the launch cue from its first downbeat (file 0.00) on the ignition, carrying the lift-off to the edge of space,
#    where the mix cuts it (events16.py) and the silence holds;
# B2. the same cue's racing ostinato re-entering as the two rockets ride side by side (its bar 25, file 39.47, on the
#    chase), running on its own clock until its final bars thin out and sag exactly as the rival pulls away and
#    TheraBreath's warning light comes on; it is gone as the engines go quiet;
# C. the discovery cue: a bar line (file 6.31) on SEARCHING, the montage cut on its beats from bar 5 (file 9.47),
#    the bass and percussion arriving at bar 11 (file 18.94) as the pipette comes in, and its brass return at bar 19
#    (file 31.57) landing on the relight to the frame; it drives the pass and the overtake and is cut on the descent;
# D1. the finale cue's tender horn (file 0.80) from the footpad on the Moon;
# D2. its rise (file 13.43) from the flag wide, carrying the Earthrise;
# D3. its homecoming theme (file 48.17) from the lift-off off the Moon, through re-entry and the clouds to the landing
#    at Church & Dwight, fading out on its own as the robot arm comes out, so the tasting is silent;
# D4. the long cue's own final cadence (file 192.6, its last chord and ring-out) under THE FUTURE OF FRESHNESS, so the
#    card gets a different chord from the one that landed on the lawn.
# usage (from video/sound): python3 music16.py ../out/race16_music.wav
import os, subprocess, sys, tempfile
import numpy as np
import soundfile as sf
from timeline import Cut

SR = 48000
V = Cut('FlavorRaceV16')
T = V.t
AUDIO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'race', 'audio')
BAR = 1.5787


def decode(name):
    tmp = os.path.join(tempfile.mkdtemp(), name + '.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(AUDIO, name + '.mp3'), '-ar', str(SR), '-ac', '2', tmp], check=True)
    x, sr = sf.read(tmp, always_2d=True, dtype='float64')
    return x


OPEN, LAUNCH, DISC, FIN, LONG = decode('v16_open'), decode('v16_launch'), decode('v16_discovery'), decode('v16_finale'), decode('v16_long')
out = np.zeros((int((V.TOTAL + 2) * SR), 2))


def place(src, S, a, b, fade_in, fade_out, gain=1.0):
    # play src from film time a to b, where film = file + S; equal-power fades at both ends
    i0, i1 = int(a * SR), int(b * SR)
    s0 = int((a - S) * SR)
    seg = src[max(0, s0):max(0, s0) + (i1 - i0)].copy()
    n = len(seg)
    if n <= 0: return
    fi, fo = int(fade_in * SR), int(fade_out * SR)
    env = np.ones(n)
    if fi: env[:fi] = np.sin(np.linspace(0, np.pi / 2, fi)) ** 2
    if fo: env[n - fo:] *= np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
    out[i0:i0 + n] += seg * env[:, None] * gain


LAMP = T('lights', 0.71)                      # the pad floods with light (cc51b641 src 1.375)
RL = T('relight', 0.27)                       # the engines relight (7e9b6135 src 16.17)
TOUCH = T('foot', 0.55)                       # the footpad meets the regolith
MOONLIFT = T('moonlaunch', 0.2)               # lift-off for home
ENDTONE = T('end', 0.35)                      # THE FUTURE OF FRESHNESS resolves

SA = LAMP - 20.79                              # A: the bloom on the lamp
SB1 = T('ignite', 0.02) - 0.005                # B1: the first downbeat on the ignition
SB2 = T('chase') - 39.47                       # B2: bar 25 on the chase; the file's own fade lands on the warning light
SC = RL - 31.57                                # C: bar 19 on the relight; bar 3 lands on SEARCHING, bar 5 on the first montage cut
SD1 = TOUCH - 0.804                            # D1: the horn from the footpad
SD2 = T('flagwide') - 13.43                    # D2: the rise from the flag wide
SD3 = MOONLIFT - 48.17                         # D3: the homecoming from the lift-off
SD4 = ENDTONE - 192.62                         # D4: the long cue's last chord on the card

place(OPEN, SA, 0.0, T('nozzle', 1.0), 0.0, 0.5)                                # A (the file ends by itself at 40 s)
place(LAUNCH, SB1, T('ignite', 0.02), T('pitch', 0.1), 0.0, 0.1)                 # B1 (the mix cuts it at the edge of space)
place(LAUNCH, SB2, T('side'), T('search', 0.4), 0.25, 0.6, gain=0.92)            # B2 (its own fade carries the sag)
place(DISC, SC, T('search', -0.02), T('descent', 0.1), 0.3, 0.1)                 # C (the mix cuts it on the descent)
place(FIN, SD1, TOUCH, T('flagwide', 0.02), 0.5, 0.25)                            # D1
place(FIN, SD2, T('flagwide', -0.02), MOONLIFT, 0.25, 0.12)                       # D2
place(FIN, SD3, MOONLIFT, T('tasting', 0.5), 0.02, 0.8, gain=0.95)                # D3 (the file fades out by itself by the robot)
place(LONG, SD4, T('end', 0.2), T('stgflag', 1.2), 0.12, 1.5, gain=0.9)             # D4 (its ring-out dies away under the stinger's quiet)

if __name__ == '__main__':
    print(f"SA {SA:.3f} SB1 {SB1:.3f} SB2 {SB2:.3f} SC {SC:.3f} SD1 {SD1:.3f} SD2 {SD2:.3f} SD3 {SD3:.3f} SD4 {SD4:.3f}")
    print('open hits at', [round(x + SA, 2) for x in (27.11, 33.42)], '(padmoon', round(T('padmoon'), 2), 'cap', round(T('cap'), 2), ')')
    print('launch sag (file 53.68) at', round(53.68 + SB2, 2), '(warnlight', round(T('warnlight'), 2), 'cutoff', round(T('cutoff'), 2), ')')
    print('discovery bar 3 at', round(6.31 + SC, 3), '(search', round(T('search'), 3), ') bar 5 at', round(9.47 + SC, 3), '(tea', round(T('tea'), 3), ') bar 11 at', round(18.94 + SC, 2), '(pipette', round(T('pipette'), 2), ')')
    print('finale theme ends (file 68.7) at', round(68.7 + SD3, 2), '(robot', round(T('robot'), 2), 'tasting', round(T('tasting'), 2), ')')
    sf.write(sys.argv[1], out[:int(V.TOTAL * SR)].astype(np.float32), SR, subtype='FLOAT')
    print(sys.argv[1])
