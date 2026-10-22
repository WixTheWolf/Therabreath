"""Put the real Church & Dwight seal on the headquarters monument in v15/5b518a71.mp4 (the cdsign shot).

The generated monument carries a drawn copy of the seal (the red ring, CHURCH & DWIGHT / CO., INC., the arm and
hammer), close to the real mark but with the arm redrawn. The standing rule is real logos, unaltered: this builds a
patch with the real seal (public/img/cd-seal.png, Church & Dwight's own logo from Brandfetch) fitted to the
generated seal's outline in the reference frame and lit like it, so the per-frame transform from track_sign.py moves
it with the camera.

- Fit: an ellipse fitted to the generated red ring; the real seal's ring is mapped onto it (the stone face is seen
  at an angle, so the seal is a little narrower than tall), 1.5% larger so no generated red shows at the edge.
- Light: the real seal's white, red, navy and skin are mapped onto the generated seal's own (an affine colour map), and a
  smooth gain map taken from the generated seal (its whites and reds against their medians) carries the sunset's
  fall-off across it.
- Finish: softened and grained like the footage; the generated TM beside the seal is filled from the stone around
  it, and the real seal's own TM lands in its place.

usage: python3 scripts/make_cd_seal.py <ref_frame.png> <out.png>
The reference frame is the clip's frame 0, decoded as rgb24 with the BT.601 matrix (the clip is untagged).
"""
import sys
import cv2
import numpy as np
from PIL import Image

ref = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32)
H, W = ref.shape[:2]
hsv = cv2.cvtColor(ref.astype(np.uint8), cv2.COLOR_RGB2HSV)


def red_mask(h, s, v):
    return ((h < 8) | (h > 170)) & (s > 110) & (v > 70)


# the generated seal's outline, from its red ring (it sits in the monument's left third)
Y0, Y1, X0, X1 = 450, 1080, 0, 500
m = red_mask(hsv[Y0:Y1, X0:X1, 0], hsv[Y0:Y1, X0:X1, 1], hsv[Y0:Y1, X0:X1, 2]).astype(np.uint8) * 255
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
(gcx, gcy), (gw, gh), gang = cv2.fitEllipse(max(cnts, key=cv2.contourArea))
gcx += X0; gcy += Y0

# the real seal: its ring's outline in the logo image
logo = np.asarray(Image.open('public/img/cd-seal.png').convert('RGBA')).astype(np.float32)
lh = cv2.cvtColor(np.clip(logo[..., :3], 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV)
lm = (red_mask(lh[..., 0], lh[..., 1], lh[..., 2]) & (logo[..., 3] > 128)).astype(np.uint8) * 255
lc, _ = cv2.findContours(cv2.morphologyEx(lm, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
(lcx, lcy), (lw, lhh), _ = cv2.fitEllipse(max(lc, key=cv2.contourArea))
red_real = np.median(logo[..., :3][lm > 0], axis=0)

# map the logo onto the generated outline: scale each axis, rotate, place; 1.5% larger to cover the generated ring
grow = 1.015
sx, sy = gw / lw * grow, gh / lhh * grow
th = np.radians(gang)
R = np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
A = R @ np.diag([sx, sy])
M = np.hstack([A, (np.array([gcx, gcy]) - A @ np.array([lcx, lcy]))[:, None]])
# premultiply, shrink with area filtering close to the final size, then warp the rest of the way
pre = np.concatenate([logo[..., :3] * logo[..., 3:] / 255, logo[..., 3:]], -1)
k = max(sx, sy) * 1.25
small = cv2.resize(pre, (round(logo.shape[1] * k), round(logo.shape[0] * k)), interpolation=cv2.INTER_AREA)
Ms = M.copy(); Ms[:, :2] = M[:, :2] / k
warp = cv2.warpAffine(small, Ms, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
warp = cv2.GaussianBlur(warp, (0, 0), 0.75)                      # the footage's own softness
alpha = np.clip(warp[..., 3:] / 255, 0, 1)
rgb = np.where(alpha > 1e-3, warp[..., :3] / np.maximum(alpha, 1e-3), 0)

# the generated seal's white and red, as the sunset lights them
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
dx, dy = xx - gcx, yy - gcy
u = (dx * np.cos(th) + dy * np.sin(th)) / (gw / 2); v = (-dx * np.sin(th) + dy * np.cos(th)) / (gh / 2)
rr = np.hypot(u, v)
lum = ref.mean(-1); sat = ref.max(-1) - ref.min(-1)
inner = (rr < 0.55) & (sat < 60)
white_g = inner & (lum > np.percentile(lum[inner], 55))      # the seal's white field, not the hammer or the arm
red_g = (rr > 0.7) & (rr < 0.97) & red_mask(hsv[..., 0], hsv[..., 1], hsv[..., 2])
wmed = np.median(ref[white_g], axis=0)
# the real seal's white, red, navy and skin land on the generated seal's own (an affine colour map through the four),
# so the sunset's warmth and depth carry over to the real mark
hsv_l = cv2.cvtColor(np.clip(logo[..., :3], 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV)
solid = logo[..., 3] > 200
navy_l = solid & (hsv_l[..., 0] > 95) & (hsv_l[..., 0] < 130) & (hsv_l[..., 1] > 80)
skin_l = solid & (hsv_l[..., 0] >= 2) & (hsv_l[..., 0] <= 22) & (hsv_l[..., 1] > 40) & (hsv_l[..., 1] < 160) & (hsv_l[..., 2] > 120)
navy_g = (rr < 0.6) & (hsv[..., 0] > 95) & (hsv[..., 0] < 130) & (hsv[..., 1] > 80)
skin_g = (rr < 0.6) & (hsv[..., 0] >= 2) & (hsv[..., 0] <= 22) & (hsv[..., 1] > 40) & (hsv[..., 1] < 160) & (hsv[..., 2] > 90)
ring = (rr > 0.78) & (rr < 0.95) & red_mask(hsv[..., 0], hsv[..., 1], hsv[..., 2]) & (lum < 60)   # the ring's red, not its letters
rmed, nmed, smed = np.median(ref[ring], axis=0), np.median(ref[navy_g], axis=0), np.median(ref[skin_g], axis=0)
real = np.stack([np.full(3, 255.0), red_real, np.median(logo[..., :3][navy_l], axis=0), np.median(logo[..., :3][skin_l], axis=0)])
gen = np.stack([wmed, rmed, nmed, smed])
AFF = np.linalg.solve(np.hstack([real, np.ones((4, 1))]), gen)          # 4x3: [r g b 1] @ AFF
rgb = np.clip(np.concatenate([rgb, np.ones(rgb.shape[:2] + (1,))], -1) @ AFF, 0, 255)

# the light's fall-off across the seal: each generated white or red pixel against its class median, smoothed
ratio = np.zeros((H, W), np.float32); wt = np.zeros((H, W), np.float32)
ratio[white_g] = lum[white_g] / wmed.mean(); wt[white_g] = 1
ratio[red_g] = lum[red_g] / ref[red_g].mean(-1).mean(); wt[red_g] = 1
sig = 28
gmap = cv2.GaussianBlur(ratio, (0, 0), sig) / np.maximum(cv2.GaussianBlur(wt, (0, 0), sig), 1e-4)
gmap = np.clip(np.where(cv2.GaussianBlur(wt, (0, 0), sig) > 0.02, gmap, 1.0), 0.7, 1.3)
rgb = rgb * gmap[..., None]
rgb += np.random.default_rng(11).normal(0, 2.0, rgb.shape)        # the picture's own fine noise

# the generated TM to the seal's lower right: covered with the plain stone just to its right (same rows, same light)
tm = np.zeros((H, W), np.uint8)
tx, ty = int(gcx + 0.83 * gw / 2), int(gcy + 0.82 * gh / 2)
tm[ty - 14:ty + 18, tx - 18:tx + 26] = 255
tm[alpha[..., 0] > 0.5] = 0
fill = ref.copy()
fill[ty - 24:ty + 28, tx - 28:tx + 36] = ref[ty - 24:ty + 28, tx - 28 + 95:tx + 36 + 95]   # clear of the panel joint
ta = cv2.GaussianBlur(tm.astype(np.float32) / 255, (0, 0), 3.0)[..., None]

out = np.zeros((H, W, 4), np.float32)
base = fill * ta
out[..., :3] = rgb * alpha + base * (1 - alpha)
a_all = np.maximum(alpha, ta)
out[..., :3] = np.where(a_all > 1e-3, out[..., :3] / np.maximum(alpha + ta * (1 - alpha), 1e-3), 0)
out[..., 3:] = a_all * 255
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGBA').save(sys.argv[2])
print('seal at', round(gcx, 1), round(gcy, 1), 'axes', round(gw, 1), round(gh, 1), 'angle', round(gang, 1),
      '| white', wmed.round(0), 'red', rmed.round(0), 'navy', nmed.round(0), 'skin', smed.round(0), '| TM cover at', tx, ty)
