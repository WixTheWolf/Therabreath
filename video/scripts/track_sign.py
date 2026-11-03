"""Track a flat sign through a shot and write a per-frame similarity transform for an overlay.

The Mission Control wall sign in h/mc_ff.mp4 carries a generated copy of The Flavor Factory wordmark with a mangled
R. The V15 cut covers it with the real logo (public/img/tff-logo-sign.png, built by make_sign_patch.py). This finds
ORB features around the sign in a reference frame, matches them into every frame of the shot and fits a partial
affine (translation, rotation, uniform scale) with RANSAC, so the patch moves with the camera.

usage: python3 scripts/track_sign.py <clip.mp4> <from_s> <to_s> <x0,y0,x1,y1 roi> <out.json>
Coordinates are source pixels; the JSON holds one [a, b, c, d, tx, ty] per 24 fps frame (CSS matrix order).
"""
import json, sys
import cv2
import numpy as np

clip, t0, t1, roi, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4], sys.argv[5]
x0, y0, x1, y1 = map(int, roi.split(','))
cap = cv2.VideoCapture(clip)
fps = cap.get(cv2.CAP_PROP_FPS)
start = int(round(t0 * fps)); end = int(round(t1 * fps))
cap.set(cv2.CAP_PROP_POS_FRAMES, start)
orb = cv2.ORB_create(nfeatures=3000, scaleFactor=1.15, nlevels=10, fastThreshold=8)
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)

ok, ref = cap.read()
assert ok
g = cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY)
mask = np.zeros_like(g); mask[y0:y1, x0:x1] = 255
kr, dr = orb.detectAndCompute(g, mask)
mats = [[1, 0, 0, 1, 0, 0]]
prev = np.array([[1, 0, 0], [0, 1, 0]], np.float64)
for i in range(start + 1, end + 1):
    ok, fr = cap.read()
    if not ok:
        mats.append(mats[-1]); continue
    gf = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
    # search near where the sign was last seen
    px0, py0 = prev @ np.array([x0, y0, 1]); px1, py1 = prev @ np.array([x1, y1, 1])
    m2 = np.zeros_like(gf)
    pad = 80
    m2[max(0, int(min(py0, py1)) - pad):int(max(py0, py1)) + pad, max(0, int(min(px0, px1)) - pad):int(max(px0, px1)) + pad] = 255
    kf, df = orb.detectAndCompute(gf, m2)
    good = []
    if df is not None and len(kf) > 10:
        for pair in bf.knnMatch(dr, df, k=2):
            if len(pair) == 2 and pair[0].distance < 0.78 * pair[1].distance:
                good.append(pair[0])
    if len(good) >= 12:
        src = np.float32([kr[m.queryIdx].pt for m in good]); dst = np.float32([kf[m.trainIdx].pt for m in good])
        M, inl = cv2.estimateAffinePartial2D(src, dst, method=cv2.RANSAC, ransacReprojThreshold=2.5, maxIters=4000, confidence=0.999)
        if M is not None and inl is not None and inl.sum() >= 10:
            prev = M
    a, c, tx = prev[0]; b, d, ty = prev[1]
    mats.append([float(a), float(b), float(c), float(d), float(tx), float(ty)])
    print(i, len(good), [round(v, 3) for v in mats[-1]], file=sys.stderr)

# light smoothing (3-frame) so the patch never jitters against the picture
arr = np.array(mats)
sm = arr.copy()
for k in range(1, len(arr) - 1):
    sm[k] = (arr[k - 1] + 2 * arr[k] + arr[k + 1]) / 4
json.dump({'fps': fps, 'from': t0, 'frames': sm.round(5).tolist()}, open(out, 'w'))
print('frames', len(mats))
