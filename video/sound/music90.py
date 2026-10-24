# THE FLAVOR RACE, the 90-second cut: the music stem, built from the same score files on their own clocks as V15
# (music15.py), with the sections re-placed for the shorter picture. Nothing is time-stretched; where the picture is
# shorter than the score, the score is cut on its own bar lines (161.5 BPM: a bar is 1.4861 s) inside a silence or
# under a quiet, sustained passage with an equal-power crossfade.
# A. the dark opening swells as the pad floods with light (score 3.0 on the first big lamp) and stops on the cut to
#    the cap in the cold: the count, the spark and the bloom play in silence;
# B1. from the ignition (score 33.2): the lift-off swell (36.0) peaks as TheraBreath clears the pad; the edge of
#     space is carved out in the mix from the pitch-over;
# B2. the race's downbeat (51.0) opens on the turn over Earth; the drive is cut in the mix as the engines go quiet;
# B3. the quiet glass section (score 75.0) from The Flavor Factory's search, with eight bars removed on a bar line so
#     that its rise lands the return (103.4) as the engines relight; the drive carries TheraBreath to the Moon; the
#     descent is carved out in the mix;
# C. the warm section rises on the flag wide (127.5) and carries the Earthrise, the lift-off for home, the re-entry;
# D. down through the clouds the finale begins; its main theme (12 s) opens on the Church & Dwight sign; it fades
#    under the tasting, so the hush before the card is silent;
# E. the score's final gesture (150.0) lands on THE FUTURE OF FRESHNESS and decays into the black.
# usage (from video/sound): python3 music90.py ../out/race90_music.wav
import os, subprocess, sys, tempfile
import numpy as np
import soundfile as sf
from timeline import Cut

SR = 48000
V = Cut('FlavorRace90')
T = V.t
AUDIO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'race', 'audio')
BAR = 60.0 / 161.5 * 4


def decode(name):
    tmp = os.path.join(tempfile.mkdtemp(), name + '.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(AUDIO, name + '.mp3'), '-ar', str(SR), '-ac', '2', tmp], check=True)
    x, sr = sf.read(tmp, always_2d=True, dtype='float64')
    return x


SCORE, FINALE = decode('v12_flavor_score'), decode('v12_finale')
out = np.zeros((int((V.TOTAL + 1) * SR), 2))


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


LAMP = T('lights', 0.71)                       # the pad floods with light
S1 = LAMP - 3.0
S2 = T('ignite', 0.2) - 33.2                   # B1: as V15, the score runs from 33.2 at the ignition (swell 36.0 on the lift-off)
S2b = T('turn') - 51.0                         # B2: the downbeat on the turn
S3a = T('search') - 75.0                       # B3: the glass section from the search ...
CUTBAR = 75.0 + 6 * BAR                        # ... cut on a bar line six bars in ...
SKIP = 8 * BAR                                 # ... eight bars removed ...
S3b = S3a - SKIP                               # ... so the return (103.4) lands on the relight (film = file + S: skipping file time pulls S back)
S4 = T('flagwide') - 127.5                     # C: the warm section rises on the flag wide
S5 = T('cdsign') - 12.0                        # D: the finale's main theme on the Church & Dwight sign
S6 = T('end', 0.35) - 150.0                    # E: the final gesture on the card
XF = 0.25
place(SCORE, S1, max(0.0, S1 + 1.6), T('cap', 0.3), 0.6, 0.3)                            # A
place(SCORE, S2, T('ignite', 0.2), T('pitch', 0.9), 0.35, 1.0)                           # B1 (cut in the mix at the pitch-over)
place(SCORE, S2b, T('turn', -0.3), T('search', 0.2), 0.08, 0.5)                          # B2 (cut in the mix as the engines go quiet)
place(SCORE, S3a, T('search', -0.1), CUTBAR + S3a + XF, 0.5, XF)                         # B3, first six bars of the glass section
place(SCORE, S3b, CUTBAR + S3a, T('descent', 1.4), XF, 1.2)                              # B3, the rest, eight bars later
place(SCORE, S4, T('flagwide', -0.2), T('clouds', 0.6), 1.4, 2.0)                        # C
place(FINALE, S5, T('clouds', 0.3), T('tasting', 3.2), 1.2, 2.2, gain=0.95)              # D
place(SCORE, S6, T('end', 0.25), T('black2', 0.45), 0.08, 1.0)                           # E

if __name__ == '__main__':
    print(f"S1 {S1:.3f} S2 {S2:.3f} S2b {S2b:.3f} S3a {S3a:.3f} S3b {S3b:.3f} S4 {S4:.3f} S5 {S5:.3f} S6 {S6:.3f}")
    print('swell 36.0 at', round(36.0 + S2, 3), '(liftoff', round(T('liftoff'), 3), ')')
    print('downbeat 51.0 at', round(51.0 + S2b, 3), '(turn', round(T('turn'), 3), ')')
    print('glass cut at film', round(CUTBAR + S3a, 3), 'score', round(CUTBAR, 3), '->', round(CUTBAR + SKIP, 3))
    print('return 103.4 at', round(103.4 + S3b, 3), '(relight', round(T('relight'), 3), ')')
    print('finale main (12 s) at', round(12.0 + S5, 3), '(cdsign', round(T('cdsign'), 3), ')')
    sf.write(sys.argv[1], out[:int(V.TOTAL * SR)].astype(np.float32), SR, subtype='FLOAT')
    print(sys.argv[1])
