# The editable Premiere timeline for a Flavor Race cut, as Final Cut Pro 7 XML (Premiere: File > Import).
# It builds one bin with the sequence, every shot (baked by bake_shots.py with handles, sorted into bins by act), the
# graphics and the sound stems with the final mix (build_media.py), and marks the shots that need care when re-cut.
# Every file sits flat in <package>/media, so if Premiere asks for one file, pointing it at that folder relinks the rest.
# usage (from video/): python3 premiere/make_xml.py premiere/V12.2 [--root C:/FlavorRace/V12.2]
#                      python3 premiere/make_xml.py premiere/V14 [--root C:/FlavorRace/V14]
import json, os, sys, wave
from xml.sax.saxutils import escape

PKG = sys.argv[1]
VERSION = os.path.basename(os.path.normpath(PKG))                 # e.g. V12.2
ROOT = (sys.argv[sys.argv.index('--root') + 1] if '--root' in sys.argv else f'C:/FlavorRace/{VERSION}').replace(':', '%3a', 1)
FPS = 30
cut = json.load(open(os.path.join(PKG, 'shots.json')))
gfx = json.load(open(os.path.join(PKG, 'graphics.json')))
snd = json.load(open(os.path.join(PKG, 'sound.json')))
NAME = f'THE FLAVOR RACE {VERSION} (editable)'
TOTAL = cut['frames']
seg = {s['id']: s for s in cut['segments']}

# per cut: the bins the shots are sorted into (the segment each act starts on) and the shots that need care when they
# are re-cut (sequence markers)
ACTS = {}; FLAGS = {}
ACTS['FlavorRaceV12_2'] = [('black0', '1 The surprise'), ('tbpush', '2 Show off'), ('padcold', '3 Launch'), ('side', '4 The race'),
                           ('sees', '5 Discovery'), ('life', '6 The comeback'), ('approach', '7 The Moon'), ('homeward', '8 Home')]
FLAGS['FlavorRaceV12_2'] = [
    ('label', 'Framing hides the gantry', 'Cropped hard to the right (zoom 1.35) so the gantry stays out of the macros. The tail handle tilts down to the fins and the smoke, which the opening never shows.'),
    ('gauge', 'Framing hides mirrored lettering', 'Zoomed 1.42 from the top so the dial lettering stays under the letterbox.'),
    ('button', 'Button label is garbled', 'Starts with the glove already on the button and cuts before the finger lifts (4.65 s into the source). Extending either end shows the garbled label or the lift.'),
    ('window', 'Generated shot: keep the head', 'Seedance clip. For the first 1.5 s of the source the rockets have glowing blobs on their noses, and the head handle shows them: do not extend the head.'),
    ('crowd', 'Composite: second tower', 'The second launch tower is composited from the same footage. Keep the crop: wider framing shows a face at the left edge.'),
    ('tbfire', 'Tail runs on into space', 'Past the out-point the source flies on past the camera into space (a morph, not a cut). Extend the tail only a few frames.'),
    ('edge', 'Keep the rival close', 'The rival edges ahead by about a length. In the tail handle it pulls far ahead, which the notes on V12.1 ruled out.'),
    ('mcerupt', 'Generated shot: wall sign', 'Seedance clip. Zoomed 1.13 from the bottom so the garbled wall sign stays under the letterbox.'),
    ('reel', 'Reversed footage', 'The rival pull-away played backwards, so the gap closes. Exhaust runs in reverse if held long.'),
    ('approach', 'Music is silent here', 'The score cuts on the descent and returns on the flag wide. The effects stem carries the landing.'),
    ('stand', 'New Moon landing shot', 'Seedance 7e918801, shifted down 80 px so the whole cap clears the letterbox.'),
    ('robot', 'Six samples, then silence', 'The score has faded by +3.6 s; the tray settles at +4.1 s in the quiet.'),
]
ACTS['FlavorRaceV14'] = [('black0', '1 The reveal'), ('padcold', '2 Launch'), ('side', '3 The race'), ('field', '4 The flavor field'),
                         ('droplets', '5 The Flavor Factory'), ('intake', '6 To the Moon'), ('approach', '7 The Moon'), ('sunlight', '8 Home')]
FLAGS['FlavorRaceV14'] = [
    ('standoff', 'Framing hides a generated logo', 'Zoomed 1.28 from the top and shifted down 118 px, so a truck lettered with a generated copy of The Flavor Factory logo (bottom left) sits under the letterbox. Keep the framing.'),
    ('padcold', 'Framing hides a generated logo', 'The same truck as on the face-off, kept under the letterbox the same way (zoom 1.28 from the top, down 118 px).'),
    ('tblabel', 'Framing hides a misspelled line', 'Zoomed 1.13 from the top and shifted down 118 px, so the generated line under the wordmark (it reads HEALTHY HOUTH) sits under the letterbox.'),
    ('droplets', 'Softened in place', 'The misspelled line under the wordmark is blurred in place (four soft regions, baked into the shot at fixed positions). In the handles the bottle drifts, so check the line stays covered if you extend it.'),
    ('lab', 'Softened in place', 'The beaker carries generated print (a logo, a nonsense word, wrong graduations); it is blurred in place.'),
    ('transmit', 'Framing hides a mangled name', 'Zoomed 1.07 from the top and shifted down 118 px, so a garbled TheraBreath name on the front of the box sits under the letterbox. The badge at the top right is blurred in place.'),
    ('receive', 'Softened in place', 'The misspelled line beside the wordmark is blurred in place.'),
    ('hatch', 'Ends before the flag opens', 'From 23.3 s into the source the flag shows a garbled wordmark and the camera pulls back; the shot ends at 23.25 s, so do not extend the tail. A sticker on the latch is blurred in place.'),
    ('moonwide', 'V12 Moon shots, graded to match', 'The flag wide, the lift-off and the late rival are the V12 shots, cooled and desaturated to match the new grey regolith. The flag wide plays at 0.26x.'),
    ('approach', 'Music is silent here', 'The score cuts on the cut to the Moon and returns on the flag wide. The effects stem carries the descent and the landing.'),
    ('porthole', 'Music is silent here', 'The edge of space: the score stops here and comes back on the downbeat of the race.'),
    ('sunlight', 'Softened in place; keep the tail', 'The misspelled line under the wordmark is blurred in place. About 0.2 s past the out-point the rival flies into frame beside TheraBreath, which the story rules out (it is still on the Moon): do not extend the tail.'),
    ('samples', 'Product bottle softened', 'The generated product bottle carries garbled print and a fake organic seal; both are blurred in place (the seal harder). The score has faded by +3.0 s; the sixth sample is set down at +4.05 s in the quiet.'),
    ('rack', 'Keep the tail', 'Shortly after the out-point the bottle comes into focus with its garbled print, and the source ends on a generated title card. Do not extend the tail.'),
]
ACTS, FLAGS = ACTS[cut['comp']], FLAGS[cut['comp']]


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


files = {}          # file id -> full definition (written once, where the sequence first uses it)
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
    if not g.get('alpha', True):       # an opaque card covers only the black under it (in the film its faint last frame
        under = next(s for s in cut['segments'] if s['start'] <= start < s['end'])     # can overlap the next shot)
        assert under['kind'] in ('black', 'end'), (g['id'], under['id'])
        end = min(end, under['end'])
    vitem(track, f"clipitem-{g['id']}", mid, fid, g['label'], g['frames'], start, end, 0, end - start, alpha='straight' if g.get('alpha', True) else 'none')
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


# files are defined in full the first time they appear (in the sequence), referenced by id afterwards
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
# the sequence comes first, so every file is fully described where the timeline first uses it; the bins reference them
sequence = with_files(sequence)
bins = bin_xml(())
xml = ('<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE xmeml>\n<xmeml version="4"><bin><name>' + escape(NAME) + '</name><children>'
       + '<bin><name>Sequences</name><children>' + sequence + '</children></bin>' + bins + '</children></bin></xmeml>\n')
dst = os.path.join(PKG, f'THE_FLAVOR_RACE_{VERSION}.xml')
open(dst, 'w').write(xml)
print(dst, len(xml), 'bytes;', len(files), 'files;', sum(len(v) for v in items.values()), 'clips on the timeline;', len(trans), 'dissolves;',
      markers.count('<marker>'), 'markers')
