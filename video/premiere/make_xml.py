# The editable Premiere timeline for a Flavor Race cut, as Final Cut Pro 7 XML (Premiere: File > Import).
# It builds one bin with the sequence, every shot (baked by bake_shots.py with handles, sorted into bins by act), the
# graphics (build_graphics.sh), the sound stems and the final mix, and marks the shots that need care when re-cut.
# Every file sits flat in <package>/media, so if Premiere asks for one file, pointing it at that folder relinks the rest.
# usage (from video/): python3 premiere/make_xml.py premiere/V12.2 [--root C:/FlavorRace/V12.2]
import json, os, sys, wave
from xml.sax.saxutils import escape

PKG = sys.argv[1]
ROOT = (sys.argv[sys.argv.index('--root') + 1] if '--root' in sys.argv else 'C:/FlavorRace/V12.2').replace(':', '%3a', 1)
FPS = 30
cut = json.load(open(os.path.join(PKG, 'shots.json')))
gfx = json.load(open(os.path.join(PKG, 'graphics.json')))
snd = json.load(open(os.path.join(PKG, 'sound.json')))
VERSION = os.path.basename(os.path.normpath(PKG))                 # e.g. V12.2
NAME = f'THE FLAVOR RACE {VERSION} (editable)'
TOTAL = cut['frames']
seg = {s['id']: s for s in cut['segments']}

ACTS = [('black0', '1 The surprise'), ('tbpush', '2 Show off'), ('padcold', '3 Launch'), ('side', '4 The race'),
        ('sees', '5 Discovery'), ('life', '6 The comeback'), ('approach', '7 The Moon'), ('homeward', '8 Home')]
# shots that need care when they are re-cut (sequence markers)
FLAGS = [
    ('label', 'Framing hides the gantry', 'Cropped hard to the right (zoom 1.35) so the gantry stays out of the macros.'),
    ('gauge', 'Framing hides mirrored lettering', 'Zoomed 1.42 from the top so the dial lettering stays under the letterbox.'),
    ('button', 'Button label is garbled', 'Starts with the glove already on the button and cuts before the finger lifts (4.65 s into the source). Extending either end shows the garbled label or the lift.'),
    ('window', 'Generated shot: keep the head', 'Seedance clip. Before 1.6 s of the source the rockets have glowing blobs on their noses, so do not extend the head past the handle.'),
    ('crowd', 'Composite: second tower', 'The second launch tower is composited from the same footage. Keep the crop: wider framing shows a face at the left edge.'),
    ('mcerupt', 'Generated shot: wall sign', 'Seedance clip. Zoomed 1.13 from the bottom so the garbled wall sign stays under the letterbox.'),
    ('reel', 'Reversed footage', 'The rival pull-away played backwards, so the gap closes. Exhaust runs in reverse if held long.'),
    ('approach', 'Music is silent here', 'The score cuts on the descent and returns on the flag wide. The effects stem carries the landing.'),
    ('stand', 'New Moon landing shot', 'Seedance 7e918801, shifted down 80 px so the whole cap clears the letterbox.'),
    ('robot', 'Six samples, then silence', 'The score has faded by +3.6 s; the tray settles at +4.1 s in the quiet.'),
]


def rate():
    return f'<rate><timebase>{FPS}</timebase><ntsc>FALSE</ntsc></rate>'


def tc():
    return f'<timecode>{rate()}<string>00:00:00:00</string><frame>0</frame><displayformat>NDF</displayformat></timecode>'


def vfile(fid, name, frames, alpha=False):
    return (f'<file id="{fid}"><name>{escape(name)}</name><pathurl>file://localhost/{ROOT}/media/{escape(name)}</pathurl>'
            f'{rate()}<duration>{frames}</duration>{tc()}<media><video><samplecharacteristics>{rate()}'
            f'<width>1920</width><height>1080</height><anamorphic>FALSE</anamorphic><pixelaspectratio>square</pixelaspectratio>'
            f'<fielddominance>none</fielddominance></samplecharacteristics></video></media></file>')


def afile(fid, name, frames, depth):
    return (f'<file id="{fid}"><name>{escape(name)}</name><pathurl>file://localhost/{ROOT}/media/{escape(name)}</pathurl>'
            f'{rate()}<duration>{frames}</duration>{tc()}<media><audio><samplecharacteristics><depth>{depth}</depth>'
            f'<samplerate>48000</samplerate></samplecharacteristics><channelcount>2</channelcount></audio></media></file>')


files = {}          # file id -> full definition (written once, in the bins)
masters = []        # (bin path, clip xml)
items = {'V1': [], 'V2': [], 'V3': [], 'V4': [], 'A1': [], 'A2': [], 'A3': [], 'A4': []}


def master(mid, name, fid, frames, kind, bin_path):
    track = (f'<video><track><clipitem id="{mid}-item"><name>{escape(name)}</name><duration>{frames}</duration>{rate()}'
             f'<in>-1</in><out>-1</out><file id="{fid}"/></clipitem></track></video>') if kind == 'video' else \
            (f'<audio><track><clipitem id="{mid}-item" premiereChannelType="stereo"><name>{escape(name)}</name><duration>{frames}</duration>{rate()}'
             f'<in>-1</in><out>-1</out><file id="{fid}"/><sourcetrack><mediatype>audio</mediatype><trackindex>1</trackindex></sourcetrack>'
             f'</clipitem></track></audio>')
    masters.append((bin_path, f'<clip id="{mid}"><name>{escape(name)}</name><duration>{frames}</duration>{rate()}'
                              f'<media>{track}</media></clip>'))


def vitem(track, iid, mid, fid, name, frames, start, end, cin, cout, alpha='none', enabled=True):
    items[track].append((start, f'<clipitem id="{iid}"><masterclipid>{mid}</masterclipid><name>{escape(name)}</name>'
                                f'<enabled>{"TRUE" if enabled else "FALSE"}</enabled><duration>{frames}</duration>{rate()}'
                                f'<start>{start}</start><end>{end}</end><in>{cin}</in><out>{cout}</out>'
                                f'<alphatype>{alpha}</alphatype><pixelaspectratio>square</pixelaspectratio><anamorphic>FALSE</anamorphic>'
                                f'<file id="{fid}"/></clipitem>'))


def aitem(track, iid, mid, fid, name, frames, enabled=True):
    items[track].append((0, f'<clipitem id="{iid}" premiereChannelType="stereo"><masterclipid>{mid}</masterclipid>'
                            f'<name>{escape(name)}</name><enabled>{"TRUE" if enabled else "FALSE"}</enabled><duration>{frames}</duration>{rate()}'
                            f'<start>0</start><end>{min(frames, TOTAL)}</end><in>0</in><out>{min(frames, TOTAL)}</out><file id="{fid}"/>'
                            f'<sourcetrack><mediatype>audio</mediatype><trackindex>1</trackindex></sourcetrack></clipitem>'))


# the shots, V1, binned by act
act = ACTS[0][1]; acts = dict(ACTS)
for s in cut['segments']:
    act = acts.get(s['id'], act)
    if s['kind'] != 'clip': continue
    n = s['file'][1:3]; label = f"S{n} {s['id']}"
    fid, mid = f"file-S{n}", f"masterclip-S{n}"
    files[fid] = vfile(fid, s['file'], s['frames'])
    master(mid, label, fid, s['frames'], 'video', ('Shots', act))
    vitem('V1', f"clipitem-S{n}", mid, fid, label, s['frames'], s['start'], s['end'], s['in'], s['out'])
# the graphics: titles, supers and cards on V2, flashes on V3, the letterbox on V4
for g in gfx['elements']:
    fid, mid = f"file-{g['id']}", f"masterclip-{g['id']}"
    files[fid] = vfile(fid, g['file'], g['frames'])
    master(mid, g['label'], fid, g['frames'], 'video', ('Graphics',))
    track = 'V3' if g['id'].startswith('flash') else 'V4' if g['id'] == 'letterbox' else 'V2'
    start = g['start']; end = min(start + g['frames'], TOTAL)
    vitem(track, f"clipitem-{g['id']}", mid, fid, g['label'], g['frames'], start, end, 0, end - start, alpha='straight')
# the sound: the three stems (A1 VO, A2 effects, A3 music) and the final mix for reference (A4, disabled)
for k, (tr, a) in enumerate(zip(('A1', 'A2', 'A3', 'A4'), snd['tracks'])):
    fid, mid = f"file-{a['id']}", f"masterclip-{a['id']}"
    files[fid] = afile(fid, a['file'], a['frames'], a['depth'])
    master(mid, a['label'], fid, a['frames'], 'audio', ('Sound',))
    aitem(tr, f"clipitem-{a['id']}", mid, fid, a['label'], a['frames'], enabled=a.get('enabled', True))

# the dissolves (a segment with x fades in over the end of the one before it)
trans = []
for s in cut['segments']:
    if s.get('x'):
        d = round(s['x'] * FPS)
        trans.append((s['start'], f'<transitionitem>{rate()}<start>{s["start"] - d}</start><end>{s["start"]}</end><alignment>end</alignment>'
                                  f'<effect><name>Cross Dissolve</name><effectid>Cross Dissolve</effectid><effectcategory>Dissolve</effectcategory>'
                                  f'<effecttype>transition</effecttype><mediatype>video</mediatype><wipecode>0</wipecode><wipeaccuracy>100</wipeaccuracy>'
                                  f'<startratio>0</startratio><endratio>1</endratio><reverse>FALSE</reverse></effect></transitionitem>'))


def track_xml(name, extra=''):
    rows = sorted(items[name] + (trans if name == 'V1' else []), key=lambda r: (r[0], 'transitionitem' not in r[1]))
    return f'<track{extra}>' + ''.join(r[1] for r in rows) + '<enabled>TRUE</enabled><locked>FALSE</locked></track>'


# files are defined in full the first time they appear (in the bins), referenced by id afterwards
seen = set()
def with_files(x):
    out = x
    for fid, full in files.items():
        ref = f'<file id="{fid}"/>'
        if fid not in seen and ref in out:
            out = out.replace(ref, full, 1); seen.add(fid)
    return out


def bin_xml(path_prefix):
    # nested bins from the masters' bin paths
    kids = {}
    for path, clip in masters:
        if path[:len(path_prefix)] != path_prefix or len(path) <= len(path_prefix): continue
        kids.setdefault(path[len(path_prefix)], []).append((path, clip))
    out = ''
    for name in sorted(kids):
        here = path_prefix + (name,)
        clips = ''.join(with_files(c) for p, c in masters if p == here)
        out += f'<bin><name>{escape(name)}</name><children>{clips}{bin_xml(here)}</children></bin>'
    return out


bins = bin_xml(())
markers = ''.join(f'<marker><comment>{escape(c)}</comment><name>{escape(n)}</name><in>{seg[i]["start"]}</in><out>-1</out></marker>'
                  for i, n, c in FLAGS if i in seg)
vfmt = (f'<format><samplecharacteristics>{rate()}<width>1920</width><height>1080</height><anamorphic>FALSE</anamorphic>'
        f'<pixelaspectratio>square</pixelaspectratio><fielddominance>none</fielddominance><colordepth>24</colordepth></samplecharacteristics></format>')
stereo = ' premiereTrackType="Stereo"'
sequence = (f'<sequence id="sequence-1"><name>{escape(NAME)}</name><duration>{TOTAL}</duration>{rate()}{tc()}'
            f'<media><video>{vfmt}' + ''.join(track_xml(t) for t in ('V1', 'V2', 'V3', 'V4')) + '</video>'
            f'<audio><numOutputChannels>2</numOutputChannels><format><samplecharacteristics><depth>24</depth><samplerate>48000</samplerate>'
            f'</samplecharacteristics></format>' + ''.join(track_xml(t, stereo) for t in ('A1', 'A2', 'A3', 'A4')) + '</audio></media>'
            f'{markers}</sequence>')
xml = ('<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE xmeml>\n<xmeml version="4"><bin><name>' + escape(NAME) + '</name><children>'
       + bins + '<bin><name>Sequences</name><children>' + with_files(sequence) + '</children></bin></children></bin></xmeml>\n')
dst = os.path.join(PKG, f'THE_FLAVOR_RACE_{VERSION}.xml')
open(dst, 'w').write(xml)
print(dst, len(xml), 'bytes;', len(files), 'files;', sum(len(v) for v in items.values()), 'clips on the timeline;', len(trans), 'dissolves;',
      markers.count('<marker>'), 'markers')
