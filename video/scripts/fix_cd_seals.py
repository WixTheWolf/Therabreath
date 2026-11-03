"""Bake the real Church & Dwight seal into every frame of v15/5b518a71.mp4 where a generated seal shows.

V22 laid the real seal over the monument with a patch (make_cd_seal.py) that faded out over the last five frames of
the cdsign shot, so the generated seal dissolved back in under it (the "morph"), and the whip's first frames and the
contrail shot showed the generated seals on the tower. This repairs the clip itself, so no patch has to fade:

- the monument seal and the tower seal in the wide (frames 0 to 65, the camera locked off): fitted on every frame;
- the tower seal under the contrail (frames 116 to 160, the camera tilting and tracking): an ellipse fitted on every
  frame where the whole ring is in frame, the size and the tilt smoothed over the take and extrapolated into the
  frames where the ring enters past the edge, whose centres come from matching the ring's visible part.

Each seal: the real seal (public/img/cd-seal.png, Church & Dwight's own logo from Brandfetch) mapped onto the
generated ring's ellipse (1.5% larger so no generated red shows at the edge), lit through an affine colour map on
four anchors (white, red, navy, skin) taken from the generated seal in a reference frame, a smooth gain map for the
light's fall-off across it, softened, motion-blurred along the camera's travel, and grained like the footage. The
generated TM beside the monument seal is covered with the plain stone to its right; the real seal's own TM lands there.

usage: python3 scripts/fix_cd_seals.py <out.mp4> [<preview_dir>]
"""
import os, subprocess, sys
import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
CLIP = os.path.join(HERE, '..', 'public', 'race', 'clips', 'v15', '5b518a71.mp4')
LOGO = os.path.join(HERE, '..', 'public', 'img', 'cd-seal.png')
W, H = 1912, 1080
OUT = sys.argv[1]
PREV = sys.argv[2] if len(sys.argv) > 2 else None


def red_mask(hsv):
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    return ((h < 8) | (h > 170)) & (s > 110) & (v > 70)


def frames():
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', CLIP, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(r, np.uint8).reshape(-1, H, W, 3)


def ring_points(img, roi):
    x0, y0, x1, y1 = roi
    m = red_mask(cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_RGB2HSV)).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    c, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    if not c: return None, None
    c = max(c, key=cv2.contourArea)
    p = c[:, 0, :] + [x0, y0]
    edge = (p[:, 0] <= 2) | (p[:, 0] >= W - 3) | (p[:, 1] <= 2) | (p[:, 1] >= H - 3)
    return p, edge


def fit(img, roi):
    p, edge = ring_points(img, roi)
    if p is None or (~edge).sum() < 20: return None, 1.0
    (cx, cy), (a, b), ang = cv2.fitEllipse(p[~edge].reshape(-1, 1, 2).astype(np.int32))
    return (cx, cy, a, b, ang), float(edge.mean())


def as_matrix(e):
    # the ellipse as the 2x2 map from the unit circle (A @ [cos, sin] * radius 1), angle-free so it can be averaged
    cx, cy, a, b, ang = e
    th = np.radians(ang)
    R = np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
    return np.array([cx, cy]), R @ np.diag([a / 2, b / 2])


def shape(A):
    # a canonical, sign-free form of the circle-to-ellipse map: its symmetric part A A^T (3 numbers)
    S = A @ A.T
    return np.array([S[0, 0], S[0, 1], S[1, 1]])


def from_shape(s):
    S = np.array([[s[0], s[1]], [s[1], s[2]]])
    w, V = np.linalg.eigh(S)
    return V @ np.diag(np.sqrt(np.maximum(w, 1e-6)))


# ---- the real seal, its ring and its four colours
logo = cv2.cvtColor(cv2.imread(LOGO, cv2.IMREAD_UNCHANGED), cv2.COLOR_BGRA2RGBA).astype(np.float32)
lhsv = cv2.cvtColor(np.clip(logo[..., :3], 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV)
lm = (red_mask(lhsv) & (logo[..., 3] > 128)).astype(np.uint8) * 255
lc, _ = cv2.findContours(cv2.morphologyEx(lm, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
(lcx, lcy), (lw, lh), _ = cv2.fitEllipse(max(lc, key=cv2.contourArea))
solid = logo[..., 3] > 200
navy_l = solid & (lhsv[..., 0] > 95) & (lhsv[..., 0] < 130) & (lhsv[..., 1] > 80)
skin_l = solid & (lhsv[..., 0] >= 2) & (lhsv[..., 0] <= 22) & (lhsv[..., 1] > 40) & (lhsv[..., 1] < 160) & (lhsv[..., 2] > 120)
REAL = np.stack([np.full(3, 255.0), np.median(logo[..., :3][lm > 0], axis=0), np.median(logo[..., :3][navy_l], axis=0), np.median(logo[..., :3][skin_l], axis=0)])
PRE = np.concatenate([logo[..., :3] * logo[..., 3:] / 255, logo[..., 3:]], -1)
GROW = 1.015


def polar(e):
    cx, cy, a, b, ang = e
    th = np.radians(ang)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    dx, dy = xx - cx, yy - cy
    u = (dx * np.cos(th) + dy * np.sin(th)) / (a / 2); v = (-dx * np.sin(th) + dy * np.cos(th)) / (b / 2)
    return np.hypot(u, v)


def colour_map(img, e):
    # the generated seal's white, ring red, navy and skin, as the scene lights them: an affine map from the real four
    ref = img.astype(np.float32); hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV); rr = polar(e)
    lum = ref.mean(-1); sat = ref.max(-1) - ref.min(-1)
    inner = (rr < 0.55) & (sat < 60)
    white = inner & (lum > np.percentile(lum[inner], 55))
    ring = (rr > 0.78) & (rr < 0.95) & red_mask(hsv) & (lum < np.percentile(lum[(rr > 0.78) & (rr < 0.95) & red_mask(hsv)], 60))
    navy = (rr < 0.6) & (hsv[..., 0] > 95) & (hsv[..., 0] < 130) & (hsv[..., 1] > 70)
    skin = (rr < 0.6) & (hsv[..., 0] >= 2) & (hsv[..., 0] <= 22) & (hsv[..., 1] > 40) & (hsv[..., 1] < 160) & (hsv[..., 2] > 90)
    gen = np.stack([np.median(ref[white], 0), np.median(ref[ring], 0),
                    np.median(ref[navy], 0) if navy.sum() > 20 else np.median(ref[ring], 0) * 0.35,
                    np.median(ref[skin], 0) if skin.sum() > 20 else np.median(ref[white], 0) * 0.85])
    g = lum - cv2.GaussianBlur(lum, (0, 0), 1.5)
    nz = 1.4826 * float(np.median(np.abs(g[cv2.erode(white.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0])))
    return np.linalg.lstsq(np.hstack([REAL, np.ones((4, 1))]), gen, rcond=None)[0], gen, nz


def gain_map(img, e, gen):
    ref = img.astype(np.float32); hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV); rr = polar(e)
    lum = ref.mean(-1); sat = ref.max(-1) - ref.min(-1)
    white = (rr < 0.55) & (sat < 60); white &= lum > np.percentile(lum[white], 55)
    red = (rr > 0.7) & (rr < 0.97) & red_mask(hsv)
    ratio = np.zeros((H, W), np.float32); wt = np.zeros((H, W), np.float32)
    ratio[white] = lum[white] / gen[0].mean(); wt[white] = 1
    ratio[red] = lum[red] / max(ref[red].mean(), 1); wt[red] = 1
    sig = max(6.0, e[2] / 10)
    bw = cv2.GaussianBlur(wt, (0, 0), sig)
    g = cv2.GaussianBlur(ratio, (0, 0), sig) / np.maximum(bw, 1e-4)
    return np.clip(np.where(bw > 0.02, g, 1.0), 0.75, 1.25)


def logo_map(e, phi):
    # real logo pixels -> frame: undo the logo ring's own ellipse, turn by phi, then the generated ring's pure stretch
    # (symmetric, no turn of its own: an upright seal seen at an angle stays upright), 1.5% larger
    cx, cy, a, b, ang = e
    th = np.radians(ang)
    R = np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
    Sg = R @ np.diag([a / 2, b / 2]) @ R.T
    p = np.radians(phi)
    Rp = np.array([[np.cos(p), -np.sin(p)], [np.sin(p), np.cos(p)]])
    A = Sg @ Rp @ np.diag([2 / lw, 2 / lh]) * GROW
    return np.hstack([A, (np.array([cx, cy]) - A @ np.array([lcx, lcy]))[:, None]]), A


LUM = (PRE[..., :3].mean(-1, keepdims=True) + (255 - PRE[..., 3:])).astype(np.float32)   # the logo's lightness on white


def best_phi(img, e, span=30):
    # the turn that best lines the real seal's layout (the lettering, the arm, the hammer) up with the generated one's
    cx, cy, a, b, _ = e
    r = int(max(a, b) / 2 * 1.05); x0, y0 = int(cx) - r, int(cy) - r
    g = img[max(0, y0):y0 + 2 * r, max(0, x0):x0 + 2 * r].astype(np.float32).mean(-1)
    gh = g - cv2.GaussianBlur(g, (0, 0), 4)
    rr = polar(e)[max(0, y0):y0 + 2 * r, max(0, x0):x0 + 2 * r]
    msk = ((rr > 0.6) & (rr < 0.93)).astype(np.float32)          # the lettering ring: the same layout on both
    def score(phi):
        M, A = logo_map(e, phi)
        k = np.abs(A).max() * 1.25
        small = cv2.resize(LUM, (round(LUM.shape[1] * k), round(LUM.shape[0] * k)), interpolation=cv2.INTER_AREA)
        Ms = M.copy(); Ms[:, :2] = M[:, :2] / k; Ms[0, 2] -= max(0, x0); Ms[1, 2] -= max(0, y0)
        w = cv2.warpAffine(small, Ms, (g.shape[1], g.shape[0]), flags=cv2.INTER_LINEAR, borderValue=255)
        wh = w - cv2.GaussianBlur(w, (0, 0), 4)
        A_, B_ = gh * msk, wh * msk
        return float((A_ * B_).sum() / np.sqrt((A_ ** 2).sum() * (B_ ** 2).sum() + 1e-9))
    best = max(range(-span, span + 1, 2), key=score)
    best = max(np.arange(best - 2, best + 2.01, 0.5), key=score)
    return float(best), score(best), score(0.0)


def upright(e):
    # the turn that keeps the logo's vertical vertical under the generated ring's stretch
    cx, cy, a, b, ang = e
    th = np.radians(ang)
    R = np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
    Sg = R @ np.diag([a / 2, b / 2]) @ R.T
    return float(np.degrees(np.arctan2(Sg[0, 1], Sg[0, 0])))


def render(e, A_col, gmap, blur_px=0.75, motion=(0.0, 0.0), seed=0, noise=2.0, phi=0.0):
    M, A = logo_map(e, phi)
    sx = sy = np.abs(A).max()
    k = max(sx, sy) * 1.25
    small = cv2.resize(PRE, (round(logo.shape[1] * k), round(logo.shape[0] * k)), interpolation=cv2.INTER_AREA)
    Ms = M.copy(); Ms[:, :2] = M[:, :2] / k
    warp = cv2.warpAffine(small, Ms, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    warp = cv2.GaussianBlur(warp, (0, 0), blur_px)
    L = np.hypot(*motion)
    if L > 1.0:                                           # the camera's travel during the exposure
        n = int(np.ceil(L)) | 1; ker = np.zeros((n, n), np.float32)
        d = np.array(motion) / L
        for t in np.linspace(-0.5, 0.5, 4 * n):
            ker[int(round((n - 1) / 2 + t * L * d[1])), int(round((n - 1) / 2 + t * L * d[0]))] = 1
        warp = cv2.filter2D(warp, -1, ker / ker.sum())
    alpha = np.clip(warp[..., 3:] / 255, 0, 1)
    rgb = np.where(alpha > 1e-3, warp[..., :3] / np.maximum(alpha, 1e-3), 0)
    rgb = np.clip(np.concatenate([rgb, np.ones(rgb.shape[:2] + (1,))], -1) @ A_col, 0, 255) * gmap[..., None]
    rgb += np.random.default_rng(seed).normal(0, noise, rgb.shape)
    return rgb, alpha


F = frames()
N = len(F)
out = F.copy()

# ---- the wide (locked off): the monument and the tower seals, one fit per frame, smoothed over the take
for name, roi, tm in [('monument', (0, 450, 560, 1080), True), ('tower', (1300, 200, 1700, 520), False)]:
    fits = [fit(F[i], roi)[0] for i in range(0, 66)]
    P = np.array(fits)
    sm = np.array([P[max(0, i - 3):i + 4].mean(0) for i in range(len(P))])      # the take is locked off: under a pixel of drift
    ref_i = 30
    A_col, gen, nz = colour_map(F[ref_i], tuple(sm[ref_i]))
    gmap = gain_map(F[ref_i], tuple(sm[ref_i]), gen)
    # the camera is level and the walls upright: the seal's vertical stays vertical (the stretch alone tilts it a little)
    phi = upright(tuple(sm[ref_i]))
    print(name, 'turn', round(phi, 2))
    for i in range(0, 66):
        e = tuple(sm[i])
        rgb, alpha = render(e, A_col, gmap, blur_px=0.75 if name == 'monument' else 0.6, seed=i * 7 + (name == 'tower'), noise=max(0.8, nz), phi=phi)
        img = out[i].astype(np.float32)
        if tm:
            # the generated TM to the seal's lower right: the plain stone 95 px to its right, same rows and light
            cx, cy, a, b, _ = e
            tx, ty = int(cx + 0.83 * a / 2), int(cy + 0.82 * b / 2)
            msk = np.zeros((H, W), np.float32); msk[ty - 14:ty + 18, tx - 18:tx + 26] = 1
            msk[alpha[..., 0] > 0.5] = 0
            ta = cv2.GaussianBlur(msk, (0, 0), 3.0)[..., None]
            fill = img.copy(); fill[ty - 24:ty + 28, tx - 28:tx + 36] = img[ty - 24:ty + 28, tx - 28 + 95:tx + 36 + 95]
            img = img * (1 - ta) + fill * ta
        out[i] = np.clip(rgb * alpha + img * (1 - alpha), 0, 255).astype(np.uint8)
    print(name, 'frames 0-65 at', np.round(sm[ref_i][:2], 1), 'axes', np.round(sm[ref_i][2:4], 1), 'angle', round(sm[ref_i][4], 1), 'noise', round(nz, 2))

# ---- the contrail: the tower seal tracked through the move
ROI = (900, 150, 1912, 1080)
rng = range(116, 161)
fits, frac = {}, {}
for i in rng:
    e, ef = fit(F[i], ROI)
    if e is not None: fits[i], frac[i] = e, ef
full = [i for i in fits if frac[i] == 0.0]
ts = np.array(full, float)
C = np.array([as_matrix(fits[i])[0] for i in full]); S = np.array([shape(as_matrix(fits[i])[1]) for i in full])
# size and tilt change smoothly with the move: a quadratic in time over the whole-ring frames, extrapolated
ps = [np.polyfit(ts, S[:, k], 2) for k in range(3)]
pc = [np.polyfit(ts, C[:, k], 3) for k in range(2)]
track = {}
for i in rng:
    s = np.array([np.polyval(p, i) for p in ps]); A = from_shape(s)
    c = np.array([np.polyval(p, i) for p in pc])
    if i not in full:
        # the ring is entering past the edge: find its centre by matching the visible red against the predicted ring
        x0, y0, x1, y1 = ROI
        m = red_mask(cv2.cvtColor(F[i][y0:y1, x0:x1], cv2.COLOR_RGB2HSV)).astype(np.float32)
        r = int(np.ceil(np.abs(A).sum(1).max())) + 4
        yy, xx = np.mgrid[-r:r + 1, -r:r + 1].astype(np.float32)
        q = np.linalg.solve(A, np.stack([xx.ravel(), yy.ravel()])).reshape(2, *xx.shape)
        rr = np.hypot(q[0], q[1]); tpl = ((rr > 0.80) & (rr < 1.0)).astype(np.float32)
        E = 300                                            # room for a centre beyond the frame's edge
        pad = cv2.copyMakeBorder(m, r + E, r + E, r + E, r + E, cv2.BORDER_CONSTANT, value=0)
        res = cv2.matchTemplate(pad, tpl, cv2.TM_CCORR)  # res[y, x] <-> a centre at (x - E, y - E) in the ROI
        # search only near the predicted centre
        px, py = int(round(c[0] - x0)) + E, int(round(c[1] - y0)) + E
        y_0, x_0 = max(0, py - 40), max(0, px - 40)
        win = res[y_0:py + 41, x_0:px + 41]
        dy, dx = np.unravel_index(np.argmax(win), win.shape)
        c = np.array([x_0 + dx - E + x0, y_0 + dy - E + y0], float)
    # back to (cx, cy, a, b, angle)
    u, sv, _ = np.linalg.svd(A)
    ang = np.degrees(np.arctan2(u[1, 0], u[0, 0]))
    track[i] = (c[0], c[1], 2 * sv[0], 2 * sv[1], ang)
# the centres of the entering frames, smoothed into the fitted path
ks = sorted(track)
cc = np.array([track[i][:2] for i in ks])
cc_s = np.array([cc[max(0, j - 1):j + 2].mean(0) if ks[j] not in full else cc[j] for j in range(len(ks))])
for j, i in enumerate(ks): track[i] = (cc_s[j][0], cc_s[j][1]) + track[i][2:]
ref_i = 136
A_col, gen, nz = colour_map(F[ref_i], track[ref_i])
# the camera rolls a little through the move, and the generated seal turns with the building: its lettering ring
# gives the turn on every whole-ring frame (a running median, held at the ends)
phis = np.array([best_phi(F[i], track[i])[0] for i in full])
med = np.array([np.median(phis[max(0, j - 3):j + 4]) for j in range(len(phis))])
def turn_at(i): return float(np.interp(i, ts, med))
print('contrail turn per frame', np.round(phis, 1).tolist(), '-> smoothed', np.round(med, 1).tolist())
for i in ks:
    e = track[i]
    gmap = gain_map(F[i], e, gen) if i in full else gain_map(F[ref_i], track[ref_i], gen)
    if i not in full:
        # shift the reference frame's gain map with the seal
        Mt = np.float32([[1, 0, e[0] - track[ref_i][0]], [0, 1, e[1] - track[ref_i][1]]])
        gmap = cv2.warpAffine(gmap, Mt, (W, H), borderValue=1.0)
    prv, nxt = track.get(i - 1, e), track.get(i + 1, e)
    vel = ((nxt[0] - prv[0]) / 2, (nxt[1] - prv[1]) / 2)
    rgb, alpha = render(e, A_col, gmap, blur_px=0.8, motion=(vel[0] * 0.5, vel[1] * 0.5), seed=1000 + i, noise=max(0.8, nz), phi=turn_at(i))
    out[i] = np.clip(rgb * alpha + out[i].astype(np.float32) * (1 - alpha), 0, 255).astype(np.uint8)
print('contrail tower: whole ring in', len(full), 'frames', min(full), '-', max(full), '; entering:', [i for i in ks if i not in full])

enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '24', '-i', '-',
                        '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-pix_fmt', 'yuv420p', OUT], stdin=subprocess.PIPE)
enc.stdin.write(out.tobytes()); enc.stdin.close(); enc.wait()
if PREV:
    os.makedirs(PREV, exist_ok=True)
    for i in (24, 40, 59, 63, 118, 120, 123, 126, 130, 136, 142, 146):
        cv2.imwrite(os.path.join(PREV, f'f{i}.jpg'), cv2.cvtColor(np.concatenate([F[i], out[i]], 1)[::2, ::2], cv2.COLOR_RGB2BGR))
print(OUT)
