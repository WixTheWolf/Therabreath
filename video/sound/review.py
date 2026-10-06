# Shot-by-shot loudness of the stems: who leads where. K-weighted short-term (3 s) and momentary (400 ms) levels.
import sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, lfilter
sys.path.insert(0, '.')
from timeline import AT, DUR, ORDER
SR = 48000
def kw(x):
    a = 10 ** (4 / 40); w = 2 * np.pi * 1681.97 / SR; al = np.sin(w) / (2 * 0.7071)
    b = np.array([1 + al * a, -2 * np.cos(w), 1 - al * a]); aa = np.array([1 + al / a, -2 * np.cos(w), 1 - al / a])
    y = lfilter(b / aa[0], aa / aa[0], x, axis=0)
    return sosfilt(butter(2, 38, 'hp', fs=SR, output='sos'), y, axis=0)
def mom(x, win=0.4, hop=0.1):
    k = kw(x); n = int(win * SR); h = int(hop * SR)
    p = np.array([(k[i:i + n] ** 2).mean(0).sum() for i in range(0, len(k) - n, h)])
    return -0.691 + 10 * np.log10(p + 1e-12)
if __name__ == '__main__':
    stems = {}
    for name in sys.argv[1:]:
        tag, path = name.split('=')
        x, sr = sf.read(path, always_2d=True); assert sr == SR
        stems[tag] = (mom(x), x)
    print(f"{'shot':10s} {'start':>6s} " + ' '.join(f"{k:>14s}" for k in stems) )
    print(f"{'':10s} {'':6s} " + ' '.join(f"{'momMax  peak':>14s}" for k in stems))
    for i in ORDER:
        a, b = AT[i], AT[i] + DUR[i]
        row = f"{i:10s} {a:6.1f} "
        for k, (m, x) in stems.items():
            seg = m[int(a * 10): max(int(a * 10) + 1, int(b * 10) - 3)]
            pk = np.abs(x[int(a * SR):int(b * SR)]).max()
            row += f"{seg.max():7.1f} {20*np.log10(pk+1e-9):6.1f} "
        print(row)
