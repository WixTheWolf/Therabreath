# The fans shot with two launch towers (THE FLAVOR RACE V12.2): k/n22_crowd shows one tower, so a second tower and its
# glow are composited from a mirrored, time-offset copy of the same footage, shifted to the right and kept behind the
# crowd by a luminance matte (the heads are dark, the haze is bright). No generation, no new pixels.
# usage (from video/): python3 scripts/fans_two_towers.py <crowd.mp4> <out.mp4 | out_dir for stills> <t0> <t1> [dx] [offset]
# V12.2: python3 scripts/fans_two_towers.py public/race/clips/k/n22_crowd.mp4 public/race/clips/v122/fans2.mp4 2.8 6.0 330 0.5
import subprocess, sys, os
import numpy as np
from PIL import Image
src, out, t0, t1 = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
dx = int(sys.argv[5]) if len(sys.argv) > 5 else 330
off = float(sys.argv[6]) if len(sys.argv) > 6 else 0.5
W, H, FPS, AXIS = 1920, 1080, 24, 964          # AXIS: the tower's centre line in the source
def frames(a, b):
    n = int(round((b - a) * FPS))
    p = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{a:.4f}', '-i', src, '-frames:v', str(n), '-vf', f'scale={W}:{H}',
                        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(p, np.uint8).reshape(-1, H, W, 3)
def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
cx, cy, rx, ry = AXIS + dx, 420.0, 170.0, 380.0
R = smooth(1.6 - (((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2), 0.0, 1.0) * (1 - smooth(yy, 655, 690))
mirror = (2 * AXIS + dx - np.arange(W)) % W   # C(x) = F(2*AXIS + dx - x): mirrored about the tower, then shifted
A_ = frames(t0, t1); B_ = frames(t0 + off, t1 + off)
n = min(len(A_), len(B_))
def comp(Fu, Cu):
    F = Fu.astype(np.float32) / 255; C = Cu.astype(np.float32)[:, mirror] / 255
    O = smooth(F @ np.array([0.299, 0.587, 0.114], np.float32), 0.18, 0.34)
    A = (R * O)[..., None] * 0.97
    return (np.clip(F * (1 - A) + C * A, 0, 1) * 255 + 0.5).astype(np.uint8)
if out.endswith('.mp4'):
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for i in range(n): enc.stdin.write(comp(A_[i], B_[i]).tobytes())
    enc.stdin.close(); enc.wait(); print(out, n, 'frames')
else:
    os.makedirs(out, exist_ok=True)
    for i in range(0, n, max(1, n // 4)):
        Image.fromarray(comp(A_[i], B_[i])).save(f'{out}/f{i:03d}.png')
    print(out)
