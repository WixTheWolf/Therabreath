"""Build a logo patch for a shot whose generated scenery carries a mangled copy of The Flavor Factory wordmark: a
panel in the surface's own finish with the real logo on it, feathered so it sits in the picture.

usage: python3 scripts/make_sign_patch.py <ref_frame.png> <out.png> <kind>
kind "sign":   the Mission Control wall sign in h/mc_ff.mp4 (warm cream letters with a soft glow)
kind "jacket": the print on the operator's jacket in the same shot (grey ink on black fabric, slightly soft)
The patch is drawn in source-frame coordinates (1916x1080) and written full-frame with alpha, so the per-frame
transform from track_sign.py applies to it directly.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

KINDS = {
    # region to cover (the generated wordmark), feather, logo width, logo centre, ink, glow, softness
    'sign': dict(box=(98, 30, 502, 205), feather=10, lw=392, centre=(300, 118), ink=(238, 228, 210), glow=0.35, soft=0.0),
    'jacket': dict(box=(236, 694, 676, 836), feather=18, lw=372, centre=(452, 775), ink=(126, 126, 128), glow=0.0, soft=1.3, inpaint=True),
}
ref = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32)
K = KINDS[sys.argv[3]]
H, W = ref.shape[:2]
X0, Y0, X1, Y1 = K['box']


def sample(x, y, r=6):
    return ref[y - r:y + r, x - r:x + r].reshape(-1, 3).mean(0)


# the surface's finish, from just inside the region's corners (bilinear between the four)
c00, c10 = sample(X0 + 4, Y0 + 4), sample(X1 - 4, Y0 + 4)
c01, c11 = sample(X0 + 4, Y1 - 4), sample(X1 - 4, Y1 - 4)
yy, xx = np.mgrid[0:Y1 - Y0, 0:X1 - X0].astype(np.float32)
u = (xx / (X1 - X0 - 1))[..., None]; v = (yy / (Y1 - Y0 - 1))[..., None]
panel = c00 * (1 - u) * (1 - v) + c10 * u * (1 - v) + c01 * (1 - u) * v + c11 * u * v
rng = np.random.default_rng(7)
panel += rng.normal(0, 2.2, panel.shape)          # the picture's own fine noise
rgba = np.zeros((H, W, 4), np.float32)
fe = K['feather']
if K.get('inpaint'):
    # fabric: inpaint only the generated lettering (bright pixels in the box), so the folds and light stay its own
    import cv2
    img8 = ref.astype(np.uint8)
    crop = img8[Y0:Y1, X0:X1]
    lum = crop.mean(-1); sat = crop.max(-1).astype(int) - crop.min(-1)
    m = ((lum > 52) | (sat > 60)).astype(np.uint8) * 255
    m = cv2.dilate(m, np.ones((5, 5), np.uint8), iterations=2)
    fill = cv2.inpaint(np.ascontiguousarray(crop[..., ::-1]), m, 9, cv2.INPAINT_TELEA)[..., ::-1].astype(np.float32)
    rgba[Y0:Y1, X0:X1, :3] = fill
    soft = cv2.GaussianBlur(cv2.dilate(m, np.ones((5, 5), np.uint8), iterations=2), (0, 0), fe / 2).astype(np.float32) / 255
    rgba[Y0:Y1, X0:X1, 3] = np.clip(soft * 1.6, 0, 1) * 255
else:
    rgba[Y0:Y1, X0:X1, :3] = panel
    # feathered alpha: full inside, a ramp at the edges
    ax = np.clip(np.minimum(xx, X1 - X0 - 1 - xx) / fe, 0, 1); ay = np.clip(np.minimum(yy, Y1 - Y0 - 1 - yy) / fe, 0, 1)
    rgba[Y0:Y1, X0:X1, 3] = np.minimum(ax, ay) * 255

# the real logo, its black ink turned to the surface's ink colour, the dots kept
logo = Image.open('public/img/tff-logo.png').convert('RGBA')
lw = K['lw']
logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
if K['soft']:
    logo = logo.filter(ImageFilter.GaussianBlur(K['soft']))
la = np.asarray(logo).astype(np.float32)
rgb, a = la[..., :3], la[..., 3:]
sat = rgb.max(-1, keepdims=True) - rgb.min(-1, keepdims=True)
ink = (sat < 40) & (rgb.mean(-1, keepdims=True) < 120)
rgb = np.where(ink, np.array(K['ink'], np.float32), rgb)
la = np.concatenate([rgb, a], -1)
lx = K['centre'][0] - lw // 2
ly = K['centre'][1] - la.shape[0] // 2
reg = rgba[ly:ly + la.shape[0], lx:lx + lw]
if K['glow']:
    # a soft warm glow behind the letters, like the generated sign's lighting
    glow = Image.fromarray(la.astype(np.uint8)).split()[3].filter(ImageFilter.GaussianBlur(9))
    g = np.asarray(glow).astype(np.float32)[..., None] / 255 * K['glow']
    reg[..., :3] = reg[..., :3] * (1 - g) + np.array([255, 190, 120]) * g
al = la[..., 3:] / 255
reg[..., :3] = reg[..., :3] * (1 - al) + la[..., :3] * al
reg[..., 3:] = np.maximum(reg[..., 3:], al * 255)
Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), 'RGBA').save(sys.argv[2])
print(sys.argv[3], 'patch', (X0, Y0, X1, Y1), 'logo at', lx, ly, lw, la.shape[0])
