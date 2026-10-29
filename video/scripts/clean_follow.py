# The climb (v15/58279c55) without its FOLLOW? OR LEAD? title, for V24: the original take everywhere except where the
# title was, where a text-free re-render of the take (Flux 3 Edit Video on ElevenLabs, 1248x704, generation
# goaUDHBwLOoIAh0oF8Tu) is laid in, upscaled, sharpened and feathered. The two line up to under a pixel. Mask: where
# they differ strongly in the upper frame (above y 430, where the title sits), per frame, held over +-2 frames,
# closed, dilated and feathered, so the bottles, the wordmark and the Earth are always the original's.
# usage: python3 scripts/clean_follow.py <flux_edit.mp4> public/race/clips/v24/58279c55_clean.mp4
import os, subprocess, numpy as np, cv2, sys
C = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'race', 'clips', 'v15', '58279c55.mp4'); K, OUT = sys.argv[1], sys.argv[2]
W,H=1916,1080
def frames(p, w, h):
    r=subprocess.run(['ffmpeg','-v','error','-i',p,'-f','rawvideo','-pix_fmt','bgr24','-'],capture_output=True,check=True).stdout
    return np.frombuffer(r,np.uint8).reshape(-1,h,w,3)
A=frames(C,W,H); B=frames(K,1248,704); n=len(A)
Bu=np.stack([cv2.resize(b,(W,H),interpolation=cv2.INTER_LANCZOS4) for b in B])
# sharpen the upscaled plate a little so its stars match the original's
Bu=np.stack([cv2.addWeighted(b,1.6,cv2.GaussianBlur(b,(0,0),1.2),-0.6,0) for b in Bu])
yy=np.arange(H)[:,None]; top=np.clip((470-yy)/50,0,1).astype(np.float32)   # the title lives above y ~ 430
raw=[]
for i in range(n):
    d=np.abs(cv2.GaussianBlur(A[i],(0,0),2.5).astype(np.int16)-cv2.GaussianBlur(Bu[i],(0,0),2.5).astype(np.int16)).max(2).astype(np.float32)
    m=((d>40)*(top>0)).astype(np.uint8)*255
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
    m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(25,25)))
    raw.append(m)
raw=np.stack(raw)
out=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{W}x{H}','-r','24','-i','-','-c:v','libx264','-preset','slow','-crf','12','-pix_fmt','yuv420p',OUT],stdin=subprocess.PIPE)
cov=[]
for i in range(n):
    m=raw[max(0,i-2):i+3].max(0)
    m=cv2.dilate(m,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(23,23)))
    m=cv2.GaussianBlur(m.astype(np.float32)/255,(0,0),7)*top
    m=np.clip(m*1.3,0,1)[:,:,None]
    cov.append(m.mean())
    f=(A[i]*(1-m)+Bu[i]*m).round().clip(0,255).astype(np.uint8)
    out.stdin.write(f.tobytes())
out.stdin.close(); out.wait()
print('mask coverage per 10 frames', [round(float(c),3) for c in cov[::10]])
