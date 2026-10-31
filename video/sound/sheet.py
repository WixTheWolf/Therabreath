# Spectrogram contact sheets: log-frequency (30 Hz to 20 kHz), 60 dB range, waveform envelope on top.
import sys, glob, os, numpy as np, soundfile as sf, matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
from scipy.signal import stft
files = sorted(glob.glob(sys.argv[1])); out = sys.argv[2]; cols = 4
rows = (len(files) + cols - 1) // cols
fig, axs = plt.subplots(rows, cols, figsize=(cols * 4.2, rows * 2.1), squeeze=False)
for ax in axs.flat: ax.axis('off')
for ax, p in zip(axs.flat, files):
    x, sr = sf.read(p, always_2d=True); m = x.mean(1)
    f, t, Z = stft(m, sr, nperseg=2048, noverlap=1536)
    S = 20 * np.log10(np.abs(Z) + 1e-9); S -= S.max()
    ax.axis('on'); ax.pcolormesh(t, f, S, vmin=-60, vmax=0, cmap='magma', shading='auto')
    ax.set_yscale('log'); ax.set_ylim(30, 20000); ax.set_yticks([50, 200, 1000, 5000]); ax.set_yticklabels(['50', '200', '1k', '5k'], fontsize=6)
    ax.tick_params(axis='x', labelsize=6)
    pk = 20 * np.log10(np.abs(x).max() + 1e-9)
    ax.set_title(f"{os.path.basename(p)[:-4]}  ({pk:.0f} dB)", fontsize=7)
plt.tight_layout(); plt.savefig(out, dpi=72); print(out, len(files))
