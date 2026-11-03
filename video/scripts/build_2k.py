"""Every clip a cut uses, at 2560 wide for the 2K render (race/clips2k/<clip>.mp4, the same length and frames as the
source, so the cut's `from` values hold). 1080p sources: Lanczos with a light unsharp. 720p sources: Lanczos for the
whole take, then the Topaz frames laid over the spans the cut uses (topaz.txt: clip, first frame, end frame, in the
order they were concatenated). The aspect is kept (1916 x 1080 becomes 2560 x 1444), so logo patches still land.

usage: python3 scripts/build_2k.py <Composition> [<topaz_out.mp4> <topaz.txt>]"""
import os, re, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(HERE, '..', 'public', 'race')
src = open(os.path.join(HERE, '..', 'src', sys.argv[1] + '.tsx')).read()
clips = sorted(set(re.findall(r'clip: "([^"]+)"', src[src.index('const SEGS'):])))
TOP = sys.argv[2] if len(sys.argv) > 2 else None
spans = [l.split() for l in open(sys.argv[3])] if len(sys.argv) > 3 else []


def probe(p):
    o = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout.strip()
    return tuple(int(v) for v in o.split(',')[:2])


ENC = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '13', '-g', '24', '-pix_fmt', 'yuv420p', '-an']
for c in clips:
    s = os.path.join(PUB, 'clips', c + '.mp4'); d = os.path.join(PUB, 'clips2k', c + '.mp4')
    os.makedirs(os.path.dirname(d), exist_ok=True)
    w, h = probe(s)
    H2 = int(round(h * 2560 / w / 2)) * 2
    tspans = [(i, int(a), int(b)) for i, (cc, a, b) in enumerate(spans) if cc == c]
    if os.path.exists(d) and not tspans: print('have', c); continue
    vf = f'scale=2560:{H2}:flags=lanczos+accurate_rnd+full_chroma_int,unsharp=5:5:0.45:5:5:0.0'
    if not tspans:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', s, '-vf', vf] + ENC + [d], check=True)
        print('lanczos', c, f'{w}x{h} -> 2560x{H2}'); continue
    # the Topaz frames for this clip's spans, from the concatenated upscale; streamed a frame at a time (a 30 s take
    # at 2560 wide is about 8 GB of raw frames)
    offs = np.cumsum([0] + [int(b) - int(a) for _, a, b in spans])
    fsz = 2560 * H2 * 3
    rd = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', s, '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    wr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'2560x{H2}', '-r', '24', '-i', '-'] + ENC + [d], stdin=subprocess.PIPE)
    k, tp, used = 0, None, 0
    while True:
        fr = rd.stdout.read(fsz)
        if len(fr) < fsz: break
        span = next(((i, a, b) for i, a, b in tspans if a <= k < b), None)
        if span and k == span[1]:
            o0 = int(offs[span[0]])
            tp = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', TOP, '-vf', f'trim=start_frame={o0}:end_frame={o0 + span[2] - span[1]},scale=2560:{H2}:flags=lanczos', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
        if span:
            t = tp.stdout.read(fsz)
            if len(t) == fsz: fr = t; used += 1
        wr.stdin.write(fr); k += 1
    wr.stdin.close(); wr.wait(); rd.wait()
    print('topaz', c, f'{used} of {k} frames from the upscale, spans', [(a, b) for _, a, b in tspans])
