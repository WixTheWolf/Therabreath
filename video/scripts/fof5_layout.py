#!/usr/bin/env python3
"""Layout for The Future of Freshness V5 (src/FutureOfFreshnessV5.tsx): from one voice take to two films.

The take holds every line of public/fof5/script.json in order, both endings included. This script finds each script word
in the take (from a transcript with word times: ElevenLabs Scribe or faster-whisper, either shape works), trims each line
to where the voice starts and stops, then lays the lines out in film time for each ending, with each line's `gap` of air
before it. The picture, the mix and the captions all read what it writes, so a new take moves all three together.

Usage: python3 scripts/fof5_layout.py public/fof5/audio/vo.wav public/fof5/vo_words.json <ffmpeg>
Writes public/fof5/take_brief.json, take_site.json, captions_brief.vtt and captions_site.vtt.
"""
import json, re, subprocess, sys
import numpy as np

TAKE, WORDS_JSON = sys.argv[1], sys.argv[2]
FF = sys.argv[3] if len(sys.argv) > 3 else "ffmpeg"
OUT = "public/fof5/"
TAIL = 7.0  # the title and end card hold this long after the last word
NUM = {"65": "sixtyfive", "100": "hundred", "14": "fourteen", "86": "eightysix", "9th": "ninth", "9": "ninth", "10": "ten", "3": "three", "4": "four"}

key = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
def tkey(s):
    k = key(s)
    return NUM.get(k, k)

script = json.load(open(OUT + "script.json"))["lines"]
heard = [w for w in json.load(open(WORDS_JSON))["words"] if w.get("type", "word") == "word" and key(w["text"])]
T = [(tkey(w["text"]), float(w["start"]), float(w["end"])) for w in heard]

# ---- align script words to the transcript, in order ----
S = []  # (line index, display text, key)
for li, ln in enumerate(script):
    for tok in ln["text"].split():
        S.append([li, tok.replace("'", "’"), key(tok), None, None])
i = j = 0
while i < len(S) and j < len(T):
    k = S[i][2]
    if k == T[j][0]:
        S[i][3:] = T[j][1:]; i += 1; j += 1
    elif j + 1 < len(T) and k == T[j][0] + T[j + 1][0]:
        S[i][3:] = [T[j][1], T[j + 1][2]]; i += 1; j += 2
    elif i + 1 < len(S) and k + S[i + 1][2] == T[j][0]:
        a, b = T[j][1], T[j][2]; m = a + (b - a) * len(k) / max(1, len(k) + len(S[i + 1][2]))
        S[i][3:] = [a, m]; S[i + 1][3:] = [m, b]; i += 2; j += 1
    else:
        ahead = next((jj for jj in range(j + 1, min(j + 5, len(T))) if T[jj][0] == k), None)
        if ahead is not None: j = ahead
        else: i += 1  # not heard: interpolated below
missing = [s[1] for s in S if s[3] is None]
for n, s in enumerate(S):
    if s[3] is None:
        p = next((S[m][4] for m in range(n - 1, -1, -1) if S[m][4] is not None), 0.0)
        q = next((S[m][3] for m in range(n + 1, len(S)) if S[m][3] is not None), p + 0.4)
        s[3], s[4] = p + 0.02, max(p + 0.05, min(q - 0.02, p + 0.3))

# ---- trim each line to the voice, from the take's own level ----
raw = subprocess.run([FF, "-loglevel", "error", "-i", TAKE, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32)
hop = 160
rms = np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, mode="same"))[::hop] + 1e-9
db = 20 * np.log10(rms)
quiet = db < -42
def fr(t): return int(np.clip(t * 100, 0, len(db) - 1))
lines = []
for li, ln in enumerate(script):
    ws = [s for s in S if s[0] == li]
    a, b = ws[0][3], ws[-1][4]
    prev_end = lines[-1]["w1"] if lines else 0.0
    nxt = next((s[3] for s in S if s[0] == li + 1), len(x) / 16000)
    k = fr(a)
    while k > fr(max(prev_end, a - 0.4)) and not quiet[k]: k -= 1
    src0 = max(prev_end + 0.01, k / 100 - 0.03)
    k = fr(b)
    while k < fr(min(nxt - 0.02, b + 0.6)) and not all(quiet[k:k + 6]): k += 1
    src1 = min(nxt - 0.02, k / 100 + 0.08)
    lines.append({"id": ln["id"], "only": ln.get("only"), "gap": ln["gap"], "src0": round(src0, 3), "src1": round(src1, 3), "w0": a, "w1": b, "words": ws})

# ---- film time, per ending ----
def vtt_time(t):
    h, r = divmod(t, 3600); m, s = divmod(r, 60)
    return "%02d:%02d:%06.3f" % (h, m, s)
for ending in ("brief", "site"):
    at = 0.0; out_lines = []; out_words = []
    for ln in lines:
        if ln["only"] not in (None, ending): continue
        at += ln["gap"]
        off = at - ln["src0"]
        out_lines.append({"id": ln["id"], "src0": ln["src0"], "src1": ln["src1"], "at": round(at, 3), "end": round(at + ln["src1"] - ln["src0"], 3)})
        for s in ln["words"]:
            out_words.append({"k": s[2], "text": s[1], "t0": round(s[3] + off, 3), "t1": round(s[4] + off, 3), "line": ln["id"]})
        at += ln["src1"] - ln["src0"]
    dur = round(at + TAIL, 2)
    json.dump({"ending": ending, "duration": dur, "lines": out_lines, "words": out_words}, open(OUT + f"take_{ending}.json", "w"), indent=1)
    # captions: each line split at commas into cues of about two short lines
    cues = []
    for ln in out_lines:
        ws = [w for w in out_words if w["line"] == ln["id"]]
        cur = []
        for n, w in enumerate(ws):
            cur.append(w)
            text = " ".join(c["text"] for c in cur)
            rest = len(" ".join(c["text"] for c in ws[n + 1:]))
            last = n == len(ws) - 1
            if last or (rest > 16 and ((len(text) > 34 and w["text"].endswith(",")) or len(text) > 64)):
                cues.append([cur[0]["t0"], cur[-1]["t1"], text]); cur = []
    for n, c in enumerate(cues):
        c[1] = min(c[1] + 0.35, cues[n + 1][0] - 0.05) if n + 1 < len(cues) else c[1] + 1.2
    def two_lines(text):
        if len(text) <= 42: return text
        sp = [m for m in range(len(text)) if text[m] == " "]
        m = min(sp, key=lambda q: abs(q - len(text) / 2))
        return text[:m] + "\n" + text[m + 1:]
    with open(OUT + f"captions_{ending}.vtt", "w") as fh:
        fh.write("WEBVTT\n\n")
        for n, (a, b, text) in enumerate(cues):
            fh.write(f"{n + 1}\n{vtt_time(max(0, a - 0.05))} --> {vtt_time(b)}\n{two_lines(text)}\n\n")
    print(ending, "duration", dur, "lines", len(out_lines), "cues", len(cues))
print("not heard, interpolated:", missing)
