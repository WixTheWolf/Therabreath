# Quick numeric audition of every wav: length, level, onset, peak, tail, tone, and a 24-step envelope sketch.
import sys, glob, os, numpy as np, soundfile as sf
from scipy.signal import stft
def info(p):
    x, sr = sf.read(p, always_2d=True); m = x.mean(1); n = len(m)
    blk = sr // 100; k = n // blk
    e = 20*np.log10(np.sqrt((m[:k*blk].reshape(k, blk)**2).mean(1)) + 1e-9)   # 10 ms RMS
    pk = e.max(); ip = e.argmax()
    on = np.argmax(e > pk - 20) / 100
    after = np.where(e[ip:] < pk - 20)[0]; tail = (after[0] / 100) if len(after) else (k - ip) / 100
    f, t, Z = stft(m, sr, nperseg=4096); P = (np.abs(Z)**2).mean(1)
    cen = (f*P).sum()/P.sum(); lo = P[f < 120].sum()/P.sum(); hi = P[f > 4000].sum()/P.sum()
    stx = np.std(e[e > pk - 30]) if (e > pk-30).sum() > 5 else 0
    steps = [s for s in np.array_split(e, min(24, len(e))) if len(s)]; bars = ' .:-=+*#%@'
    sk = ''.join(bars[int(np.clip((s.max() - (pk - 40)) / 40 * 9, 0, 9))] for s in steps)
    lr = np.corrcoef(x[:,0], x[:,1])[0,1] if x.shape[1] == 2 and x[:,0].std() > 0 and x[:,1].std() > 0 else 1
    return n/sr, 20*np.log10(np.abs(x).max()+1e-9), pk, on, ip/100, tail, cen, lo, hi, stx, lr, sk
pat = sys.argv[1] if len(sys.argv) > 1 else 'wav/*.wav'
print(f"{'name':34s} {'len':>5} {'peak':>6} {'rms':>6} {'on':>5} {'pkT':>5} {'tail':>5} {'cent':>6} {'<120':>5} {'>4k':>5} {'var':>4} {'LR':>5}  envelope")
for p in sorted(glob.glob(pat)):
    L, P, R, on, pt, tl, c, lo, hi, v, lr, sk = info(p)
    print(f"{os.path.basename(p)[:-4]:34s} {L:5.2f} {P:6.1f} {R:6.1f} {on:5.2f} {pt:5.2f} {tl:5.2f} {c:6.0f} {lo:5.2f} {hi:5.2f} {v:4.1f} {lr:5.2f}  {sk}")
