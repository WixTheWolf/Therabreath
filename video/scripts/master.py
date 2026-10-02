# Master: +3.5 dB, 6 ms look-ahead peak limiter at -1.2 dBFS, remux with the untouched picture.
# usage: python3 scripts/master.py out/race4.mp4 out/race4_final.mp4 (run from video/)
import numpy as np, wave, subprocess, sys
import tempfile; S=tempfile.mkdtemp()
src, dst = sys.argv[1], sys.argv[2]
ff=["npx","remotion","ffmpeg","-y","-v","error"]
subprocess.run(ff+["-i",src,"-vn","-ac","2","-ar","48000","-c:a","pcm_s16le",S+"/lin.wav"],check=True)
w=wave.open(S+"/lin.wav"); sr=w.getframerate()
x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).reshape(-1,2).astype(np.float64)/32768*1.5
ceil=10**(-1.2/20)
pk=np.abs(x).max(1)
la=int(0.006*sr)
# windowed max over lookahead
from numpy.lib.stride_tricks import sliding_window_view
padded=np.concatenate([pk,np.zeros(la)])
wmax=sliding_window_view(padded,la+1).max(1)[:len(pk)]
target=np.minimum(1.0,ceil/np.maximum(wmax,1e-9))
rel=np.exp(-1/(0.15*sr)); g=np.empty_like(target); cur=1.0
for i in range(len(target)):
    t=target[i]
    cur = t if t<cur else t+(cur-t)*rel
    g[i]=cur
y=x*g[:,None]
print("max gain reduction dB", round(20*np.log10(g.min()),2), "peak", round(20*np.log10(np.abs(y).max()),2))
o=wave.open(S+"/lout.wav","wb"); o.setnchannels(2); o.setsampwidth(2); o.setframerate(sr); o.writeframes((np.clip(y,-1,1)*32767).astype(np.int16).tobytes()); o.close()
subprocess.run(ff+["-i",src,"-i",S+"/lout.wav","-map","0:v","-map","1:a","-c:v","copy","-c:a","aac","-b:a","256k","-shortest",dst],check=True)
