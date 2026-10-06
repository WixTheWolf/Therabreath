import numpy as np, glob, os, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FF='/home/user/therabreath/video/node_modules/@remotion/compositor-linux-x64-gnu'
# button quad in frame px: along the long axis from P0 (lower-left end) to P1; across from P0 to P3
P0=np.array([576,822.]); P1=np.array([802,704.]); P3=np.array([703,876.])
def q(s,t): return P0+(P1-P0)*s+(P3-P0)*t
W,H=900,300
txt=Image.new('L',(W,H),0); d=ImageDraw.Draw(txt)
F1=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',70)
F2=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',150)
for txt_,F,y in (('FLAVOR TRANSFER',F1,70),('READY',F2,200)):
    bb=d.textbbox((0,0),txt_,font=F); d.text(((W-(bb[2]-bb[0]))/2-bb[0],y-(bb[3]-bb[1])/2-bb[1]),txt_,font=F,fill=255)
txt=txt.filter(ImageFilter.GaussianBlur(3))
# label rectangle within the button (s along, t across)
s0,s1,t0,t1=0.04,0.64,0.16,0.88
dst=[q(s0,t0),q(s1,t0),q(s1,t1),q(s0,t1)]   # TL TR BR BL of the text
src=[(0,0),(W,0),(W,H),(0,H)]
def coeffs(pa,pb):
    A=[];B=[]
    for (x,y),(X,Y) in zip(pa,pb):
        A.append([X,Y,1,0,0,0,-x*X,-x*Y]);A.append([0,0,0,X,Y,1,-y*X,-y*Y]);B+= [x,y]
    return np.linalg.solve(np.array(A,float),np.array(B,float))
c=coeffs(src,dst)
fs=sorted(glob.glob('v12/rdf/*.png')); os.makedirs('v12/rdo',exist_ok=True)
for i,f in enumerate(fs):
    im=Image.open(f).convert('RGB'); w,h=im.size
    m=np.asarray(txt.transform((w,h),Image.PERSPECTIVE,c,Image.BICUBIC),float)/255
    a=np.asarray(im,float)
    glow=a[800:840,620:700].mean()>215
    r,g,b=a[...,0],a[...,1],a[...,2]
    finger=((r-b)>62)&(g<222) if glow else ((r-b)>150)
    finger=np.asarray(Image.fromarray((finger*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9)),float)/255
    m=m*(1-finger)
    ink=np.array([150,62,18.]) if glow else np.array([92,34,10.])
    k=0.80 if glow else 0.88
    out=a*(1-k*m[...,None])+ink*(k*m[...,None])
    Image.fromarray(out.clip(0,255).astype(np.uint8)).save(f'v12/rdo/{i+1:03d}.png')
subprocess.run([FF+'/ffmpeg','-v','error','-y','-framerate','24','-i','v12/rdo/%03d.png','-c:v','libx264','-crf','14','-pix_fmt','yuv420p','/home/user/therabreath/video/public/race/clips/v12/g4_ready_txt.mp4'],env={'LD_LIBRARY_PATH':FF})
print('ok',len(fs))
