# The graphics and sound for the editable Premiere timeline of a Flavor Race cut.
# Graphics: FlavorRaceGraphics (src/FlavorRaceGraphics.tsx) is rendered once as PNG frames with transparency and cut
# into one QuickTime Animation file (alpha) per element; FlavorRaceFrame (the vignette and letterbox) becomes one long
# layer. Each element is placed where the cut's composition places it (PLACE mirrors FlavorRaceV12_2.tsx; the script
# stops if the composition no longer contains the same placement).
# Sound: the final mix's processed stems (mix2.py with STEMS=1), 24-bit, trimmed by a common TRIM_DB so they cannot clip
# when summed without the mix's limiter, plus the final mix itself as a reference.
# usage (from video/): python3 premiere/build_media.py FlavorRaceV12_2 premiere/V12.2 out/race122_final [--sound-only]
import glob, json, math, os, re, shutil, subprocess, sys
import numpy as np
import soundfile as sf

COMP, PKG, MIXBASE = sys.argv[1], sys.argv[2], sys.argv[3]
VIDEO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(VIDEO, 'sound'))
from timeline import Cut

FPS = 30
f = lambda s: math.floor(s * FPS + 0.5)
V = Cut(COMP); TOTAL = f(V.TOTAL)
MEDIA = os.path.join(PKG, 'media'); os.makedirs(MEDIA, exist_ok=True)
TMP = os.path.join(VIDEO, 'out', 'premiere_gfx')

# where the composition places each graphic: (segment, offset, label)
PLACE = {
    'title': ('standoff', 0.1, 'G title THE FLAVOR RACE'),
    'super_norco': ('mcwide', 0.2, 'G super NORCO, CALIFORNIA'),
    'card_partners': ('partners', 0.0, 'G card THERABREATH + THE FLAVOR FACTORY'),
    'super_lab': ('citrus', 0.1, 'G super FLAVOR LAB'),
    'super_ewing': ('touch', 0.3, 'G super EWING, NEW JERSEY'),
    'endcard': ('end', 0.0, 'G end card TASTE THE FUTURE'),
    'flash_lights': ('lights', 3.24, 'G flash every bank (35%)'),
    'flash_ignition': ('padign', 0.0, 'G flash ignition'),
    'flash_relight': ('life', 1.0, 'G flash relight (warm)'),
}
src = open(os.path.join(VIDEO, 'src', COMP + '.tsx')).read()
for k, (sid, off, _) in PLACE.items():
    if k == 'endcard':
        assert f'{{ id: "{sid}", ' in src and 'kind: "end"' in src, k
    elif k == 'flash_relight':
        assert re.search(r'LIFE12\w* = t\("life", 1\.0\)', src), k
    else:
        pat = f't("{sid}", {off})' if off else f't("{sid}")'
        assert pat in src, (k, pat)

gsrc = open(os.path.join(VIDEO, 'src', 'FlavorRaceGraphics.tsx')).read()
ELEMS = [(i, int(n)) for i, n in re.findall(r'\{ id: "(\w+)", frames: (\d+),', gsrc)]

def run(cmd, **kw):
    print('$', ' '.join(cmd[:6]), '...', flush=True); subprocess.run(cmd, check=True, cwd=VIDEO, **kw)

def render_graphics():
    shutil.rmtree(TMP, ignore_errors=True); os.makedirs(TMP)
    run(['npx', 'remotion', 'render', 'src/index.ts', 'FlavorRaceGraphics', os.path.join(TMP, 'seq'), '--sequence', '--image-format=png', '--concurrency=2'])
    run(['npx', 'remotion', 'still', 'src/index.ts', 'FlavorRaceFrame', os.path.join(TMP, 'frame.png'), '--image-format=png'])
    frames = sorted(glob.glob(os.path.join(TMP, 'seq', '*.png')))
    assert len(frames) == sum(n for _, n in ELEMS), (len(frames), sum(n for _, n in ELEMS))
    out, at = [], 0
    for gid, n in ELEMS:
        d = os.path.join(TMP, gid); os.makedirs(d)
        for j in range(n): os.link(frames[at + j], os.path.join(d, f'{j:05d}.png'))
        at += n
        name = f'G_{gid}.mov'
        run(['ffmpeg', '-v', 'error', '-y', '-framerate', str(FPS), '-i', os.path.join(d, '%05d.png'), '-c:v', 'qtrle', '-pix_fmt', 'argb', os.path.join(MEDIA, name)])
        sid, off, label = PLACE[gid]
        out.append({'id': gid, 'label': label, 'file': name, 'frames': n, 'start': f(V.t(sid, off))})
    run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-framerate', str(FPS), '-i', os.path.join(TMP, 'frame.png'), '-frames:v', str(TOTAL),
         '-c:v', 'qtrle', '-pix_fmt', 'argb', os.path.join(MEDIA, 'G_letterbox.mov')])
    out.append({'id': 'letterbox', 'label': 'G letterbox and vignette', 'file': 'G_letterbox.mov', 'frames': TOTAL, 'start': 0})
    json.dump({'elements': out}, open(os.path.join(PKG, 'graphics.json'), 'w'), indent=1)
    shutil.rmtree(TMP, ignore_errors=True)
    return out


SOUND_ONLY = '--sound-only' in sys.argv          # refresh only the stems (after a re-mix)
out = json.load(open(os.path.join(PKG, 'graphics.json')))['elements'] if SOUND_ONLY else render_graphics()

# sound
st = {k: sf.read(f'{MIXBASE}_{k}.wav', always_2d=True)[0] for k in ('vo', 'sfx', 'music', 'mix')}
n = min(len(v) for v in st.values())
peak = max(np.abs(st['vo'][:n] + st['sfx'][:n] + st['music'][:n]).max(), *(np.abs(st[k]).max() for k in ('vo', 'sfx', 'music')))
TRIM_DB = -math.ceil(max(0.0, 20 * math.log10(peak) + 1.0) * 2) / 2      # so the stems and their sum peak at -1 dBFS or lower
tracks = []
for k, label in (('vo', 'A VO stem'), ('sfx', 'A effects stem'), ('music', 'A music stem'), ('mix', 'A final mix (reference)')):
    y = st[k][:n] * (10 ** (TRIM_DB / 20) if k != 'mix' else 1.0)
    name = f'A_{k}.wav'
    sf.write(os.path.join(MEDIA, name), y, 48000, subtype='PCM_24')
    tracks.append({'id': k, 'label': label, 'file': name, 'frames': round(n / 48000 * FPS), 'depth': 24, 'enabled': k != 'mix',
                   'trim_db': TRIM_DB if k != 'mix' else 0.0})
json.dump({'tracks': tracks, 'trim_db': TRIM_DB}, open(os.path.join(PKG, 'sound.json'), 'w'), indent=1)
print('graphics', len(out), 'elements; sound trim', TRIM_DB, 'dB')
