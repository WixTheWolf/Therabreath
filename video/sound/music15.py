# THE FLAVOR RACE V15: the music stem, built straight from the score files on their own clocks (film = file + S), so
# nothing is time-stretched. The V12 score (v12_flavor_score, ElevenLabs, 161.5 BPM, C) carries the film; its V12
# finale (v12_finale) takes over for the journey home. The baton and the silences are shaped in the mix
# (events15.py: MUSIC_AUTO and MUSIC_CUTS); this places the sections:
# A. the dark opening swells as the pad floods with light (score 3.0 on the first big lamp), drives under the rival,
#    the hero cap and Mission Control, and stops on the cut to the cap in the cold: the count, the spark and the
#    bloom play in silence;
# B. one unbroken run from the ignition: the lift-off swell (36.0 s) peaks on the cut to both rockets clearing the
#    pad, the race opens on its downbeat (51.0 s) on the chase, the drive falls away (72 s) as TheraBreath's warning
#    light comes on, its quiet glass section carries The Flavor Factory's search and the montage (cut on its beats),
#    its rise lands the return (103.4 s) as the engines relight, and its drive carries FOLLOW? OR LEAD? to the Moon;
#    the edge of space and the descent are carved out in the mix;
# C. the warm section rises on the flag wide (from 127.5 s, just past the drive's last accent) and carries the
#    Earthrise, the lift-off for home and the re-entry;
# D. down through the clouds the finale begins: its main theme opens on the campus, carries the landing at Church & Dwight
#    and the six samples, and fades under the tasting, so the hush before the card is silent;
# E. the score's final gesture (150.0 s) lands on THE FUTURE OF FRESHNESS and decays into the black.
# usage (from video/sound): python3 music15.py ../out/race15_music.wav
import os, subprocess, sys, tempfile
import numpy as np
import soundfile as sf
from timeline import Cut

SR = 48000
V = Cut('FlavorRaceV15')
T = V.t
AUDIO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'race', 'audio')


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


LAMP = T('lights', 0.71)                       # the pad floods with light (cc51b641 src 1.375)
S1 = LAMP - 3.0
S2 = T('erupt', 0.05) - 36.0                   # the lift-off swell on the cut to both rockets clearing the pad
S3 = T('flagwide') - 127.5                     # the warm section rises on the flag wide
S4 = T('campus') - 12.0                      # the finale's main theme opens on the campus
S5 = T('end', 0.35) - 150.0                    # the final gesture on the card
place(SCORE, S1, max(0.0, S1 + 1.6), T('cap', 0.3), 0.6, 0.3)                       # A
place(SCORE, S2, T('ignite', 0.2), T('descent', 1.4), 0.35, 1.2)                     # B
place(SCORE, S3, T('flagwide', -0.2), T('clouds', 0.6), 1.4, 2.2)                    # C
place(FINALE, S4, T('clouds', 0.3), T('tasting', 3.6), 0.8, 2.4, gain=0.95)         # D
place(SCORE, S5, T('end', 0.25), T('black1', 0.7), 0.08, 1.2)                         # E

if __name__ == '__main__':
    print(f"S1 {S1:.3f} S2 {S2:.3f} S3 {S3:.3f} S4 {S4:.3f} S5 {S5:.3f}")
    print('race downbeat 51.0 at', round(51.0 + S2, 3), '(chase', round(T('chase'), 3), ')')
    print('return 103.4 at', round(103.4 + S2, 3), '(relight', round(T('relight'), 3), ')')
    print('finale main (12 s) at', round(12.0 + S4, 3), '(campus', round(T('campus'), 3), ')')
    sf.write(sys.argv[1], out[:int(V.TOTAL * SR)].astype(np.float32), SR, subtype='FLOAT')
    print(sys.argv[1])
