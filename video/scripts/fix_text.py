"""Repair generated text in a shot, frame by frame, and write the repaired range as a new clip.

Three shots in the V15 cut carry text the generator misspelt:
kind "life":     v12/g5_life, the close-up as TheraBreath comes alive. The small print under the wordmark reads
                 "FREBS HZEATH. HEALTHY HOUTHE / ORAL RINGE". The dark strokes are lifted off the label (inpainted
                 from the label around them, every frame, so the glow that rises through the bottle stays its own).
kind "monitors": k/n02_mctense, The Flavor Factory's monitors. Both screen headers read "THEABRRTH ONE". The strokes
                 are inpainted from the panel and "THERABREATH ONE" is set in their place, moved with the screens
                 (a per-frame track from track_sign.py) and softened to the screens' focus.
kind "button":   k/n02_mctense, the launch button. Its label reads "LHARNCT" before the glove covers it and after it
                 lifts. The label's white strokes are inpainted from the red around them, inside the band the label is
                 printed in; the glove's beige never counts, so the glove passing over is untouched (the camera holds
                 still, so no track is needed).

usage: python3 scripts/fix_text.py <kind> <src.mp4> <first_frame> <n_frames> <out.mp4> [track.json]
"""
import json, subprocess, sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

kind, src, first, n, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
track = json.load(open(sys.argv[6]))['frames'] if len(sys.argv) > 6 else None
W, H = map(int, subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height',
                                '-of', 'csv=p=0', src], capture_output=True, text=True, check=True).stdout.strip().split(','))
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'select=between(n\\,{first}\\,{first + n - 1})',
                        '-vsync', '0', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', '24',
                        '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-pix_fmt', 'yuv420p', out],
                       stdin=subprocess.PIPE)


def strokes(img, box, dark, k=11, thr=18):
    # thin strokes inside box: dark ones (black-hat) on a light surface, or light ones (top-hat) on a dark panel,
    # where only low-saturation strokes count, so the red counters beside the headers are never touched
    x0, y0, x1, y1 = box
    c = img[y0:y1, x0:x1]
    g = cv2.cvtColor(c, cv2.COLOR_BGR2GRAY)
    ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
    hat = cv2.morphologyEx(g, cv2.MORPH_BLACKHAT if dark else cv2.MORPH_TOPHAT, ker)
    hsv = cv2.cvtColor(c, cv2.COLOR_BGR2HSV)
    # (on the label the strokes take on the glow's yellow and orange as the bottle comes alive, so there any colour
    # counts: the band itself keeps clear of the stripe)
    m = ((hat > thr) & (dark | (hsv[..., 1] < 140))).astype(np.uint8) * 255
    return cv2.dilate(m, np.ones((3, 3), np.uint8), iterations=2)


def inpaint(img, box, m, r=7):
    x0, y0, x1, y1 = box
    img[y0:y1, x0:x1] = cv2.inpaint(np.ascontiguousarray(img[y0:y1, x0:x1]), m, r, cv2.INPAINT_TELEA)


# the label band under the stripe in g5_life (source pixels): the two lines of small print and nothing above them
LIFE_POLY = np.array([[640, 585], [700, 560], [800, 528], [960, 522], [1110, 540], [1210, 568], [1262, 600],
                      [1265, 660], [1090, 645], [770, 640], [640, 625]], np.int32)
# the launch button's top in n02_mctense (source pixels), and the band its label is printed in (with room for the
# button to travel as it is pressed)
BUTTON = (800, 460, 1290, 770)
LABEL_BAND = np.array([[828, 575], [1185, 495], [1224, 626], [910, 745]], np.int32)
# the two screen headers in n02_mctense at its reference frame (source pixels) and the line set in their place
HEADS = [(226, 178, 440, 214), (998, 178, 1210, 214)]
FONT = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Bold.otf', 40)


def header_text(w, h, ink):
    # "THERABREATH ONE" in a heavy sans, condensed to the header's width, with the screens' bloom
    t = 'THERABREATH ONE'
    l, tp, r, b = FONT.getbbox(t)
    im = Image.new('L', (r - l + 8, b - tp + 8), 0)
    ImageDraw.Draw(im).text((4 - l, 4 - tp), t, font=FONT, fill=255)
    a = np.asarray(im.resize((w, h), Image.LANCZOS)).astype(np.float32) / 255
    return a, np.array(ink, np.float32)


k = 0
fsz = W * H * 3
while True:
    buf = dec.stdout.read(fsz)
    if len(buf) < fsz: break
    img = np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy()
    if kind == 'life':
        # the band follows the label (track_sign.py), so it stays under the stripe as the camera pulls back
        a, b, c, d, tx, ty = track[min(k, len(track) - 1)]
        P = (LIFE_POLY @ np.array([[a, b], [c, d]]) + [tx, ty]).astype(np.int32)
        x0, y0 = P.min(0) - 12; x1, y1 = P.max(0) + 12
        m = strokes(img, (x0, y0, x1, y1), dark=True, thr=8)   # low: mid-glow the print is faint
        poly = np.zeros_like(m); cv2.fillPoly(poly, [P - [x0, y0]], 255)
        inpaint(img, (x0, y0, x1, y1), m & poly)
    elif kind == 'button':
        # the label's white letters, inside the band they are printed in; the glove's beige (hue 8 to 30) never counts,
        # nor does anything outside the band
        x0, y0, x1, y1 = BUTTON
        hsv = cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2HSV).astype(np.int32)
        h_, s_, v_ = hsv[..., 0], hsv[..., 1], hsv[..., 2]
        # red-tinted strokes (dimmer and blurred where the glove shades or sweeps past them; the button's own red is
        # fully saturated, so it never counts), and neutral white only beside red (a highlight on the glove is not)
        reddish = (h_ < 8) | (h_ > 165)
        red = (reddish & (s_ > 180) & (v_ > 60)).astype(np.float32)
        white = ((v_ > 105) & (s_ < 155) & reddish) | ((v_ > 165) & (s_ < 35) & (cv2.blur(red, (15, 15)) > 0.3))
        band = np.zeros(white.shape, np.uint8); cv2.fillPoly(band, [LABEL_BAND - [x0, y0]], 1)
        m = (white & (band > 0)).astype(np.uint8) * 255
        # the acrylic cover's edges are long straight light lines (the letters' strokes are short): keep them
        lines = cv2.HoughLinesP(m, 1, np.pi / 360, 120, minLineLength=170, maxLineGap=2)
        keep = np.zeros_like(m)
        for x_a, y_a, x_b, y_b in ([] if lines is None else lines.reshape(-1, 4)):
            cv2.line(keep, (int(x_a), int(y_a)), (int(x_b), int(y_b)), 255, 9)
        m = cv2.dilate(m & ~keep, np.ones((3, 3), np.uint8), iterations=3) & ~keep
        # fill from the red around the strokes only (a normalized blur of the button's red), so the bright acrylic
        # edge beside the letters never bleeds into the hole; Telea only where no red is near
        c = img[y0:y1, x0:x1].astype(np.float32)
        wgt = cv2.GaussianBlur(red * (m == 0), (0, 0), 9)
        fill = cv2.GaussianBlur(c * (red * (m == 0))[..., None], (0, 0), 9) / np.maximum(wgt, 1e-6)[..., None]
        tel = cv2.inpaint(np.ascontiguousarray(img[y0:y1, x0:x1]), m, 7, cv2.INPAINT_TELEA).astype(np.float32)
        ok = (wgt > 0.05)[..., None]
        hole = (cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), 1.2))[..., None]
        img[y0:y1, x0:x1] = np.clip(c * (1 - hole) + np.where(ok, fill, tel) * hole, 0, 255).astype(np.uint8)
    else:
        a, b, c, d, tx, ty = track[min(k, len(track) - 1)]
        M = np.array([[a, c, tx], [b, d, ty]])
        sc = (a * a + b * b) ** 0.5
        for (hx0, hy0, hx1, hy1) in HEADS:
            p0 = M @ [hx0, hy0, 1]; p1 = M @ [hx1, hy1, 1]
            bx = (int(p0[0]) - 6, int(p0[1]) - 4, int(p1[0]) + 6, int(p1[1]) + 4)
            m = strokes(img, bx, dark=False, k=9, thr=30)
            reg = img[bx[1]:bx[3], bx[0]:bx[2]]
            ink = np.percentile(reg.reshape(-1, 3)[m.reshape(-1) > 0], 92, axis=0) if m.any() else (235, 230, 200)
            inpaint(img, bx, m, r=5)
            # the new line: cap height of the old one, centred on it, a touch of bloom
            tw, th = int((hx1 - hx0 - 8) * sc), int((hy1 - hy0 - 8) * sc)
            al, col = header_text(tw, th, ink)
            al = cv2.GaussianBlur(al, (0, 0), 0.9)
            glow = cv2.GaussianBlur(al, (0, 0), 3.0) * 0.35
            ox, oy = int(p0[0] + 4 * sc), int(p0[1] + 4 * sc)
            roi = img[oy:oy + th, ox:ox + tw].astype(np.float32)
            aa = np.clip(al + glow, 0, 1)[..., None]
            img[oy:oy + th, ox:ox + tw] = np.clip(roi * (1 - aa) + col * aa, 0, 255).astype(np.uint8)
    enc.stdin.write(img.tobytes())
    k += 1
enc.stdin.close(); enc.wait(); dec.wait()
print(kind, 'frames', k, '->', out)
