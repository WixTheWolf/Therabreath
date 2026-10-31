"""Bake a regolith grade into a Moon clip, so every lunar shot in V15 sits on the same grey ground.

The V15 Moon is cut from shots generated at different times: the descent, the dust, the footpad, the pole and the
Earthrise stand on a neutral grey regolith (chroma about 1 to 4 in CIELAB), while TheraBreath standing on the Moon
(v122/moon_stand), the flag wide (w/c7_flag) and the stinger's late rival (v12/g9_late) stand on a brown one
(chroma 9 to 22). This pulls only the warm, weakly coloured pixels (the ground, the dust, a warm cast on the white
hull) toward grey, by k at full strength; strong colour (the orange cap, the flag's stripe, the engine glow, Earth's
blue, the teal wordmark) is left as it is.

usage: python3 scripts/grade_moon.py <in.mp4> <from_s> <to_s> <out.mp4> <k> [c0 c1]
c0 and c1 set the chroma gate (full strength below c0, none above c1; 16 and 34 unless given). The flag wide's
ground is the most coloured (median chroma 17, 90th percentile 29) and its cap and flames sit above 42, so it takes
26 and 40.
The output is the span from_s to to_s (whole seconds, so the cut's from values move by whole seconds), at the
source's size and rate, decoded and re-encoded with the source's own colour matrix and tags.
"""
import json, subprocess, sys
import cv2
import numpy as np

src, t0, t1, out, k = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4], float(sys.argv[5])
C0, C1 = (float(sys.argv[6]), float(sys.argv[7])) if len(sys.argv) > 7 else (16.0, 34.0)
info = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                                  'stream=width,height,r_frame_rate,color_space,color_primaries,color_transfer',
                                  '-of', 'json', src], capture_output=True, text=True, check=True).stdout)['streams'][0]
W, H, rate = info['width'], info['height'], info['r_frame_rate']
cs = info.get('color_space', 'unknown')
mat = 'bt709' if cs == 'bt709' else 'bt601'      # what ffmpeg assumes for an untagged source
tags = [] if cs in ('unknown', None) else ['-colorspace', cs, '-color_primaries', info.get('color_primaries', cs),
                                            '-color_trc', info.get('color_transfer', cs)]

dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', str(t0), '-to', str(t1), '-i', src, '-vf',
                        f'scale=in_color_matrix={mat}:in_range=tv,format=rgb24', '-f', 'rawvideo', '-'],
                       stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', rate,
                        '-i', '-', '-vf', f'scale=out_color_matrix={mat}:out_range=tv,format=yuv420p', '-c:v', 'libx264',
                        '-preset', 'slow', '-crf', '12', '-an', *tags, '-movflags', '+faststart', out], stdin=subprocess.PIPE)


def smooth(x, e0, e1):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


n = 0
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    rgb = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    lab = cv2.cvtColor(rgb.astype(np.float32) / 255, cv2.COLOR_RGB2Lab)
    a, b = lab[..., 1], lab[..., 2]
    C = np.hypot(a, b)
    hue = np.degrees(np.arctan2(b, a))
    # warm hues (red-brown through yellow) at low chroma; full strength below C0, none above C1
    w = smooth(hue, 5, 30) * (1 - smooth(hue, 95, 120)) * (1 - smooth(C, C0, C1))
    s = 1 - k * w
    lab[..., 1] = a * s
    lab[..., 2] = b * s
    rgb2 = cv2.cvtColor(lab, cv2.COLOR_Lab2RGB)
    enc.stdin.write((np.clip(rgb2, 0, 1) * 255 + 0.5).astype(np.uint8).tobytes())
    n += 1
enc.stdin.close(); enc.wait(); dec.wait()
print(out, n, 'frames, k', k, 'matrix', mat)
