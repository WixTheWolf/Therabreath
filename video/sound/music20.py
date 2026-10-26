# THE FLAVOR RACE V20: the music stem, the V16 score placed on the V20 cut, straight from the cues on their own clocks
# (film = file + S), so nothing is time-stretched. Five cues (ElevenLabs Music v2.5, D major, 152.02 BPM, bar 1.5787 s;
# the beat grids and per-bar levels were measured with scratch/grid.py) are placed so their bar lines land on the
# picture:
# A. the opening cue: its first eleven seconds are cut; a quiet swell rides under the condensation macros and their
#    dissolves, and its bloom (file 20.79) lands on the first lamp; its hits fall as the rival fills the frame (file
#    27.11) and on the cap in the cold (file 33.42); it fades away under the count so the spark and the WHUMP play in
#    near silence;
# B1. the launch cue from its first downbeat (file 0.00) on the ignition, carrying the lift-off to the edge of space,
#    where the mix cuts it (events17.py) and the silence holds;
# B2. the same cue's racing ostinato re-entering as the two rockets ride at full thrust (bar 25, file 39.47, lands on
#    the chase), running on its own clock until its final bars thin out and sag exactly as the rival pulls away and
#    TheraBreath's warning light comes on; it is gone as the engines go quiet;
# C. the discovery cue: its bar 3 (file 6.31) tiptoes in under the dead engines, a beat before we see the room (a J
#    cut), the montage cut on its beats from bar 5 (file 9.47), the bass and percussion arriving at bar 11 (file 18.94)
#    as the pipette comes in (the FLAVOR TRANSFER READY shot is one bar, given back by the prism, the glove and the
#    transfer), its brass return at bar 19 (file 31.57) landing on the relight to the frame, and its bar 23 (file 37.88)
#    on the pass itself; it drives the last lap and is cut on the descent;
# D1. the finale cue's tender horn (file 0.80) from the footpad on the Moon;
# D2. its rise (file 13.43) from the flag wide, carrying the dissolve into the Earthrise;
# D3. its bar 29 (file 45.01) on the lift-off off the Moon, so the homecoming theme (bar 31, file 48.17) arrives as the
#    engines clear the Moon; the trip home is ten seconds shorter than V19's, so the cue loses four bars on a bar line
#    (it plays to file 59.21, the downbeat of bar 38, and goes on from file 65.53, the downbeat of bar 42: the same
#    harmony both sides, chroma 0.87 and 0.96 across the join, an 80 ms equal-power crossfade), and its last chord
#    (file 67.0) still lands 0.84 s after the touchdown on the lawn, ringing out under the hatch and the tray; the toast
#    plays on its tail, the clink in the room's quiet;
# D4. the long cue's own final cadence (file 192.6, its last chord and ring-out) under THE FUTURE OF FRESHNESS.
# usage (from video/sound): python3 music20.py ../out/race20_music.wav
import os, subprocess, sys, tempfile
import numpy as np
import soundfile as sf
from timeline import Cut

SR = 48000
V = Cut('FlavorRaceV20')
T = V.t
AUDIO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'race', 'audio')
BAR = 1.5787


def decode(name):
    tmp = os.path.join(tempfile.mkdtemp(), name + '.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(AUDIO, name + '.mp3'), '-ar', str(SR), '-ac', '2', tmp], check=True)
    x, sr = sf.read(tmp, always_2d=True, dtype='float64')
    return x


OPEN, LAUNCH, DISC, FIN, LONG = decode('v16_open'), decode('v16_launch'), decode('v16_discovery'), decode('v16_finale'), decode('v16_long')
JA, JB, JX = 59.21, 65.53, 0.08               # the four-bar cut in the finale: bar 38's downbeat into bar 42's


def splice(x, a, b, xf):
    # x up to file a, then x from file b, an equal-power crossfade of xf centred on the join
    h = int(xf * SR / 2)
    ia, ib = int(a * SR), int(b * SR)
    t = np.linspace(0, np.pi / 2, 2 * h)[:, None]
    mid = x[ia - h:ia + h] * np.cos(t) ** 2 + x[ib - h:ib + h] * np.sin(t) ** 2
    return np.concatenate([x[:ia - h], mid, x[ib + h:]])


FIN3 = splice(FIN, JA, JB, JX)
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
RL = T('relight', 0.67)                       # the engines relight (7e9b6135 src 16.17)
TOUCH = T('foot', 1.942)                      # the footpad meets the regolith (n14_dust src 3.9)
MOONLIFT = T('moonlaunch', 0.2)               # lift-off for home
ENDTONE = T('end', 0.35)                      # THE FUTURE OF FRESHNESS resolves

SA = LAMP - 20.79                              # A: the bloom on the lamp
SB1 = T('ignite', 0.02) - 0.005                # B1: the first downbeat on the ignition
SB2 = T('chase') - 39.47                       # B2: bar 25 on the chase; the file's own fade lands on the warning light
SC = RL - 31.57                                # C: bar 19 on the relight; bar 5 lands on the first montage cut
SD1 = TOUCH - 0.804                            # D1: the horn from the footpad
SD2 = T('flagwide') - 13.43                    # D2: the rise from the flag wide
SD3 = MOONLIFT - 45.01                         # D3 (on FIN3): bar 29 on the lift-off, the theme (bar 31) as the engines clear the Moon; the cadence (file 67.0, FIN3 60.68) lands on the lawn
SD4 = ENDTONE - 192.62                         # D4: the long cue's last chord on the card
CSTART = 6.31 + SC                             # C's bar 3, under the dead engines

place(OPEN, SA, 0.0, T('nozzle', 1.0), 0.0, 0.5)                                # A (the file ends by itself at 40 s)
place(LAUNCH, SB1, T('ignite', 0.02), T('pitch', 0.1), 0.0, 0.1)                 # B1 (the mix cuts it at the edge of space)
place(LAUNCH, SB2, T('both'), CSTART + 0.3, 0.3, 0.8, gain=0.92)                 # B2 (its own fade carries the sag; out as C tiptoes in)
place(DISC, SC, CSTART, T('descent', 0.1), 0.4, 0.1)                             # C (the mix cuts it on the descent)
place(FIN, SD1, TOUCH, T('flagwide', 0.02), 0.5, 0.25)                            # D1
place(FIN, SD2, T('flagwide', -0.02), MOONLIFT, 0.25, 0.12)                       # D2
place(FIN3, SD3, MOONLIFT, T('hush'), 0.02, 0.6, gain=0.95)                       # D3 (the file's own ring-out dies under the toast)
place(LONG, SD4, T('end', 0.2), T('stglate', 1.2), 0.12, 1.5, gain=0.75)          # D4 (its ring-out dies away under the stinger's quiet)

if __name__ == '__main__':
    print(f"SA {SA:.3f} SB1 {SB1:.3f} SB2 {SB2:.3f} SC {SC:.3f} SD1 {SD1:.3f} SD2 {SD2:.3f} SD3 {SD3:.3f} SD4 {SD4:.3f}")
    print('open hits at', [round(x + SA, 2) for x in (27.11, 33.42)], '(rival', round(T('rival'), 2), 'cap', round(T('cap'), 2), ')')
    print('launch sag (file 53.68) at', round(53.68 + SB2, 2), '(warnlight', round(T('warnlight'), 2), 'cutoff', round(T('cutoff'), 2), ')')
    print('discovery bar 3 at', round(CSTART, 3), '(cutoff', round(T('cutoff'), 3), 'mc2', round(T('mc2'), 3), ') bar 5 at', round(9.47 + SC, 3), '(ginger', round(T('ginger'), 3), ') bar 11 at', round(18.94 + SC, 2), '(pipette', round(T('pipette'), 2), ')')
    print('discovery bar 23 (file 37.88) at', round(37.88 + SC, 3), '(pass + 0.85', round(T('pass', 0.85), 3), ')')
    print('finale theme (file 48.17) at', round(48.17 + SD3, 2), '(homeward', round(T('homeward'), 2), ') join (file 59.21) at', round(JA + SD3, 2), '(hqland', round(T('hqland'), 2), ')')
    print('last chord (file 67.0, FIN3', round(67.0 - (JB - JA), 2), ') at', round(67.0 - (JB - JA) + SD3, 2), '(HQTOUCH + 0.84', round(T('hqland', 2.5717 + 0.84), 2), 'robot', round(T('robot'), 2), ') FIN3 ends at', round(len(FIN3) / SR + SD3, 2), '(toast', round(T('toast'), 2), 'clink', round(T('toast', 3.35), 2), ')')
    print('rise (file 13.43) on the flag wide', round(13.43 + SD2, 3), round(T('flagwide'), 3), '; D2 plays to file', round(MOONLIFT - SD2, 2))
    print('bar check: join file', JA, 'bar', round((JA - 0.80) / BAR, 3), '->', JB, 'bar', round((JB - 0.80) / BAR, 3))
    sf.write(sys.argv[1], out[:int(V.TOTAL * SR)].astype(np.float32), SR, subtype='FLOAT')
    print(sys.argv[1])
