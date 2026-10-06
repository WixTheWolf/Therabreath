# Picture events measured to the frame off the locked cut (race9x_pic), and the music's share of the baton.
# Shared by the cue list (cues.py) and the mix (mix2.py).
from timeline import t, TOTAL

# picture events, measured to the frame
BANK1, BANK2, BANK3 = 11.10, 12.90, 14.00          # the light banks: left, right, all
READY = 31.93                                       # finger on READY
SNAP = 43.80                                        # umbilical lets go, on "one"
PRESS = 44.82                                       # the big red button
HUSH = t('hush')                                    # 46.6: black, silence
IGN = 47.70                                         # first frame of the ignition flash
WALL, INSIDE = 53.30, 53.90                         # the smoke wall arrives; the frame is all smoke
EDGE = t('burn')                                    # 66.7: the edge of space
GLOW = 73.85                                        # the relit nozzle starts to glow
DROP = 88.74                                        # the drop meets the dish
SEAL = 92.745                                       # the fuel cell locks; frost blooms
RELIGHT = 100.83                                    # the new engine's flash
BOOM = 110.23                                       # the rival goes up
TOUCH = 119.85                                      # Moon touchdown
HATCH = 150.95                                      # the hatch begins to lift
TRAY1, TRAY2, TRAY3 = 154.65, 155.75, 157.80        # the arm: out, the hesitation and correction, settle
ENDTONE = 161.95                                    # TASTE THE FUTURE comes into focus
TINK = 169.30                                       # the screw meets the lens

# ---------------------------------------------------------------- THE MUSIC'S SHARE OF THE BATON
# gain in dB over the score stem (race9w_music), linear between points; 0 dB is the score as rendered
MUSIC_AUTO = [
    (0.0, 0),
    (21.55, 0), (21.7, -12), (23.0, -12), (23.3, 0),              # the bolt: everything drops away
    (38.45, 0), (38.75, -8), (41.4, -8), (41.75, -6), (46.6, -6),  # the machine leads, the score low underneath
    (47.5, -7), (WALL, -7), (t('topdown'), 0),                     # ignition and liftoff own the screen; then music takes over
    (84.5, 0), (84.7, -9), (86.7, -9), (86.9, -7), (93.3, -7), (93.6, 0),   # the lab: the score steps back
    (101.9, 0), (102.15, -8), (103.75, -8), (104.0, -3), (110.0, -3),       # the bolt works loose; the failure builds in sound
    (155.25, 0), (155.45, -4), (158.6, -4), (158.9, 0),            # Norco's last line has to land
    (TOTAL, 0),
]
# hard cuts that take the score with them, each leaving a reverb throw so the cut reads as intent, not as an edit
MUSIC_CUTS = [(EDGE, 71.5, 2.8, -12), (110.06, 113.5, 2.2, -11)]    # (cut, reopen, tail seconds, tail level dB)
