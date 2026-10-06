# Bake every shot of a Flavor Race cut into its own 1080p30 file, framed exactly as the film shows it (clip speed,
# push-in about its origin, vertical shift, camera shake, colour grade), with up to 1 s handles at both ends, for the
# editable Premiere timeline. A handle stops where the source clip cuts to another shot, so extending a shot in the
# timeline never flashes a frame of a different shot. The maths follows ClipLayer in src/FlavorRaceV12_2.tsx: the source is fitted to cover
# 1920x1080, then translate(dx, dy + ty) scale(z) about the origin. Zoom holds its first and last value in the handles.
# usage (from video/): python3 premiere/bake_shots.py FlavorRaceV12_2 premiere/V12.2 [id,id,...]   (ids: re-bake only those)
# writes <out>/media/S<nn>_<id>.mp4 and <out>/shots.json (the cut list the XML is built from)
import json, math, os, re, subprocess, sys
import numpy as np
import cv2

VIDEO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS, W, H = 30, 1920, 1080
HANDLE = 30                                    # frames of handle on each side, where the source has them
f = lambda s: math.floor(s * FPS + 0.5)        # Math.round, as in the composition


def segments(comp):
    src = open(os.path.join(VIDEO, 'src', comp + '.tsx')).read()
    body = src[src.index('const SEGS: Seg[] = ['):src.index('\n];', src.index('const SEGS: Seg[] = ['))]
    out = []
    for obj in re.findall(r'\{ id: .*?\}(?=,)', body):
        js = re.sub(r'(?<=[{,]) (\w+):', r' "\1":', obj)
        out.append(json.loads(js))
    return out


def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries',
                        'stream=width,height,r_frame_rate,nb_read_frames', '-of', 'json', path], capture_output=True, text=True, check=True)
    s = json.loads(r.stdout)['streams'][0]
    n, d = (int(v) for v in s['r_frame_rate'].split('/'))
    return s['width'], s['height'], n / d, int(s['nb_read_frames'])


def css_grade(img, grade):
    # CSS filter functions in order, on gamma-encoded sRGB values (as Chrome applies them)
    x = img.astype(np.float32) / 255
    for name, v in re.findall(r'(\w+)\(([\d.]+)\)', grade):
        v = float(v)
        if name == 'brightness': x = x * v
        elif name == 'contrast': x = (x - 0.5) * v + 0.5
        elif name == 'saturate':
            m = np.array([[0.213 + 0.787 * v, 0.715 - 0.715 * v, 0.072 - 0.072 * v],
                          [0.213 - 0.213 * v, 0.715 + 0.285 * v, 0.072 - 0.072 * v],
                          [0.213 - 0.213 * v, 0.715 - 0.715 * v, 0.072 + 0.928 * v]], np.float32)
            x = x @ m.T
        x = np.clip(x, 0, 1)
    return (x * 255 + 0.5).astype(np.uint8)


def cuts(path):
    # the frames where the picture cuts to another shot: ffmpeg's scene detector at its default threshold, plus any jump in
    # a 64x36 thumbnail of more than 30 levels on average (a cut between two dark shots can stay under the detector)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-vf', 'scdet=threshold=10:sc_pass=0,metadata=print:key=lavfi.scd.score:file=-',
                        '-an', '-f', 'null', '-'], capture_output=True, text=True, check=True)
    lines = r.stdout.splitlines()
    found = {int(re.match(r'frame:(\d+)', a).group(1)) for a, b in zip(lines, lines[1:])
             if a.startswith('frame:') and b.startswith('lavfi.scd.score=') and float(b.split('=')[1]) >= 10}
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', 'scale=64:36:flags=area', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                         capture_output=True, check=True).stdout
    th = np.frombuffer(raw, np.uint8).reshape(-1, 36, 64, 3).astype(np.float32)
    found |= {int(i) + 1 for i in np.nonzero(np.abs(np.diff(th, axis=0)).mean(axis=(1, 2, 3)) > 30)[0]}
    return sorted(found)


def bake(sg, start, end, at, dst, head=HANDLE, tail=HANDLE):
    path = os.path.join(VIDEO, 'public', 'race', 'clips', sg['clip'] + '.mp4')
    sw, sh, sfps, nfr = probe(path)
    rate, x = sg.get('rate', 1.0), sg.get('x', 0.0)
    z0, z1 = sg.get('zoom', [1.0, 1.035])
    ox, oy = ((float(v) / 100 for v in re.findall(r'([\d.]+)%', sg['origin'])) if 'origin' in sg else (0.5, 0.5))
    ty = sg.get('ty', 0.0)
    seq0 = f(at - x)                                   # the composition's Sequence starts here (local frame u = 0)
    D = f(sg['dur'] + x)
    sf0 = f(sg['from'] - x)                            # OffthreadVideo startFrom, in composition frames
    us, ue = start - seq0, end - seq0                  # the visible range in local frames
    umin = math.ceil(-sf0 / rate)
    umax = math.floor((FPS * (nfr - 1) / sfps - sf0) / rate)
    hb = max(0, min(head, us - umin))
    ha = max(0, min(tail, umax - ue + 1))
    us_, ue_ = us - hb, ue + ha
    tsrc = lambda u: (sf0 + u * rate) / FPS
    k_of = lambda u: min(nfr - 1, max(0, math.floor(tsrc(u) * sfps + 1e-6)))
    s = max(W / sw, H / sh); cx, cy = (W - s * sw) / 2, (H - s * sh) / 2
    O = np.array([ox * W, oy * H])
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-frames:v', str(k_of(ue_ - 1) + 1),
                            '-vf', 'scale=in_color_matrix=bt709,format=rgb24', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                           stdout=subprocess.PIPE)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium',
                            '-crf', '19', '-g', '15', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
                            '-movflags', '+faststart', dst], stdin=subprocess.PIPE)
    fb = sw * sh * 3; cur, frame = -1, None
    for u in range(us_, ue_):
        k = k_of(u)
        while cur < k:
            buf = dec.stdout.read(fb)
            if len(buf) < fb: break
            frame = np.frombuffer(buf, np.uint8).reshape(sh, sw, 3); cur += 1
        z = z0 + (z1 - z0) * min(max(u, 0), D) / D
        dx = dy = 0.0
        if 'shake' in sg:
            kk = u - f(sg['shake'] + x)
            amp = 0.0 if kk < 0 else 16 * math.exp(-kk / 26)
            dx, dy = math.sin(kk * 2.3) * amp, math.cos(kk * 3.1) * amp
        T = np.array([dx, dy + ty])
        # output pixel P -> cover-fitted point O + (P - T - O) / z -> source pixel (that - C) / s; pixel centres at +0.5
        a = 1 / (z * s)
        b = (O - (T + O) / z - np.array([cx, cy])) / s
        b = b + 0.5 * a - 0.5
        M = np.array([[a, 0, b[0]], [0, a, b[1]]], np.float64)
        img = cv2.warpAffine(frame, M, (W, H), flags=cv2.INTER_LANCZOS4 | cv2.WARP_INVERSE_MAP,
                             borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0))
        if 'grade' in sg: img = css_grade(img, sg['grade'])
        enc.stdin.write(img.tobytes())
    dec.stdout.close(); dec.wait(); enc.stdin.close(); enc.wait()
    return {'frames': ue_ - us_, 'in': hb, 'out': hb + (end - start)}


def main(comp, out, only=None):
    sg = segments(comp)
    old = {r['id']: r for r in json.load(open(os.path.join(out, 'shots.json')))['segments']} if only else {}
    at, acc = [], 0.0
    for s_ in sg: at.append(acc); acc += s_['dur']
    total = f(acc)
    os.makedirs(os.path.join(out, 'media'), exist_ok=True)
    shots, n = [], 0
    for i, s_ in enumerate(sg):
        start = f(at[i]); end = f(at[i + 1]) if i + 1 < len(sg) else total
        row = {'id': s_['id'], 'kind': s_['kind'], 'start': start, 'end': end}
        if s_['kind'] == 'clip':
            n += 1
            name = f"S{n:02d}_{s_['id']}.mp4"
            if only and s_['id'] not in only:          # keep the shot baked before, if the cut has not moved it
                assert old[s_['id']]['file'] == name and old[s_['id']]['start'] == start and old[s_['id']]['end'] == end, s_['id']
                shots.append(old[s_['id']]); continue
            dst = os.path.join(out, 'media', name)
            row.update(file=name, clip=s_['clip'], x=s_.get('x', 0.0))
            row.update(bake(s_, start, end, at[i], dst))
            c = [k for k in cuts(dst) if k <= row['in'] or k >= row['out']]
            if c:                                     # the source cuts to another shot inside a handle: stop the handle there
                head = row['in'] - max([k for k in c if k <= row['in']], default=0)
                tail = min([k for k in c if k >= row['out']], default=row['frames']) - row['out']
                row.update(bake(s_, start, end, at[i], dst, head, tail))
            print(f"{name:24s} {row['frames']:4d} frames, in {row['in']:3d}, out {row['out']:4d}  ({s_['clip']})" + (f'  handles stop at source cuts {c}' if c else ''), flush=True)
        shots.append(row)
    json.dump({'comp': comp, 'fps': FPS, 'frames': total, 'segments': shots}, open(os.path.join(out, 'shots.json'), 'w'), indent=1)
    print('total', total, 'frames;', n, 'shots')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3].split(',') if len(sys.argv) > 3 else None)
