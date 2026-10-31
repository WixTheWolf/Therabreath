# Pull signed ElevenLabs content URLs out of this session's transcript and pair them with sessions.tsv names.
# usage: python3 urls.py > dlN.txt   (prints NAME URL for every session not yet in raw/)
import re, os, glob, html
P = '/root/.claude/projects/-home-user-wixted-family-tree/'
T = sorted(glob.glob(P + '*.jsonl') + glob.glob(P + '*/tool-results/*.txt'), key=os.path.getmtime)
pat = re.compile(r'https://storage\.googleapis\.com/xi-backend/database/workspace/[0-9a-f]+/content_generation/([A-Za-z0-9]+)/[A-Za-z0-9]+/content\.mp3\?[A-Za-z0-9%=&._-]+')
best = {}
for t in T:
    for m in pat.finditer(open(t, errors='ignore').read()):
        u = m.group(0).replace('\\u0026', '&')
        d = re.search(r'X-Goog-Date=(\d{8}T\d{6}Z)', u)
        if not d or 'X-Goog-Signature=' not in u: continue
        s = m.group(1)
        if s not in best or d.group(1) > best[s][0]: best[s] = (d.group(1), u)
for line in open('sessions.tsv'):
    n, v, s = line.rstrip('\n').split('\t')
    f = f'raw/{n}_{v}.mp3'
    if os.path.exists(f) and os.path.getsize(f) > 0: continue
    if s in best: print(f'{n}_{v} {best[s][1]}')
