# Seedance 2.5 image-to-video on the Higgsfield API, with a spend ledger.
# Credentials: HF_CREDENTIALS="key-id:key-secret" from the environment or video/.env.local (ignored). Never printed.
# The key in the cloud environment authenticates on platform.higgsfield.ai (api.higgsfield.ai answers 401 for it);
# set HF_BASE to use another host.
# usage (from video/):
#   python3 higgsfield/seedance.py upload <image>                       -> prints the public URL
#   python3 higgsfield/seedance.py submit <name> <spec.json>            -> queues one take, logs it
#   python3 higgsfield/seedance.py wait <name> [<name> ...]             -> polls, downloads public/race/clips/v13/<name>.mp4
#   python3 higgsfield/seedance.py ledger                               -> what was spent
# spec.json: {"image_url": ..., "prompt": ..., "duration": 4, "resolution": "1080p", "end_image_url": optional}
import json, os, subprocess, sys, time

VIDEO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
LEDGER = os.path.join(VIDEO, 'docs', 'session', 'hf-v13-jobs.json')
OUTDIR = os.path.join(VIDEO, 'public', 'race', 'clips', 'v13')
BASE = os.environ.get('HF_BASE', 'https://platform.higgsfield.ai')
MODEL = 'bytedance/seedance-2.5/image-to-video'
USD_PER_S = {'480p': 0.2056, '720p': 0.4622, '1080p': 1.1372}   # the estimate endpoint's published rates


def creds():
    c = os.environ.get('HF_CREDENTIALS')
    if not c:
        p = os.path.join(VIDEO, '.env.local')
        if os.path.exists(p):
            for line in open(p):
                if line.startswith('HF_CREDENTIALS='):
                    c = line.split('=', 1)[1].strip().strip('"')
    if not c or c.count(':') != 1:
        sys.exit('HF_CREDENTIALS is not set (key-id:key-secret).')
    return c


def api(method, path, body=None):
    # curl reads the header from stdin so the key never appears in the process list
    cmd = ['curl', '-sS', '-m', '120', '-X', method, '-H', '@-', '-H', 'Content-Type: application/json',
           '-w', '\n%{http_code}', BASE + path]
    if body is not None:
        cmd[1:1] = ['--data-binary', json.dumps(body)]
    r = subprocess.run(cmd, input=f'Authorization: Key {creds()}\n', capture_output=True, text=True)
    out, _, code = r.stdout.rpartition('\n')
    try:
        data = json.loads(out)
    except json.JSONDecodeError:
        data = {'raw': out[:500]}
    if not code.startswith('2'):
        sys.exit(f'{method} {path}: HTTP {code}: {data}')
    return data


def load():
    return json.load(open(LEDGER)) if os.path.exists(LEDGER) else {'model': MODEL, 'base': BASE, 'jobs': {}}


def save(d):
    json.dump(d, open(LEDGER, 'w'), indent=1)
    open(LEDGER, 'a').write('\n')


def upload(path):
    ext = os.path.splitext(path)[1].lower().lstrip('.')
    ctype = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp'}[ext]
    u = api('POST', '/files/generate-upload-url', {'content_type': ctype})
    hdr = []
    for k, v in (u.get('upload_headers') or {'Content-Type': ctype}).items():
        hdr += ['-H', f'{k}: {v}']
    subprocess.run(['curl', '-sS', '-f', '-m', '300', '-X', 'PUT', *hdr, '--upload-file', path, u['upload_url']], check=True)
    return u['public_url']


def submit(name, spec):
    d = load()
    if name in d['jobs'] and d['jobs'][name].get('status') not in ('failed', 'nsfw', 'canceled'):
        sys.exit(f'{name} already exists in the ledger')
    body = {'duration': 4, 'resolution': '1080p', 'generate_audio': False, **spec}
    r = api('POST', '/' + MODEL, body)
    d['jobs'][name] = {'request_id': r['request_id'], 'status': r.get('status', 'queued'), 'input': body,
                       'est_usd': round(body['duration'] * USD_PER_S[body['resolution']], 2),
                       'submitted': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
    save(d)
    print(name, r['request_id'], r.get('status'))


def wait(names, every=15, limit=1800):
    t0 = time.time()
    pending = list(names)
    while pending and time.time() - t0 < limit:
        d = load()
        for n in list(pending):
            j = d['jobs'][n]
            s = api('GET', f"/requests/{j['request_id']}/status")
            j['status'] = s['status']
            if s['status'] == 'completed':
                os.makedirs(OUTDIR, exist_ok=True)
                dst = os.path.join(OUTDIR, n + '.mp4')
                subprocess.run(['curl', '-sS', '-f', '-m', '600', '-o', dst, s['video']['url']], check=True)
                j['video_url'] = s['video']['url']; j['file'] = os.path.relpath(dst, VIDEO)
                j['completed'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
                pending.remove(n); print(n, 'completed ->', j['file'])
            elif s['status'] in ('failed', 'nsfw', 'canceled'):
                j['error'] = s.get('error'); pending.remove(n); print(n, s['status'], s.get('error', ''))
        save(d)
        if pending:
            time.sleep(every)
    if pending:
        print('still running:', ' '.join(pending))


def ledger():
    d = load()
    spent = 0.0
    for n, j in d['jobs'].items():
        billed = j['status'] == 'completed'
        spent += j['est_usd'] if billed else 0
        print(f"{n:24s} {j['status']:11s} {j['input']['duration']}s {j['input']['resolution']:6s} ${j['est_usd']:.2f}{'' if billed else ' (not billed)'}")
    print(f'billed so far: about ${spent:.2f}')


if __name__ == '__main__':
    cmd, args = sys.argv[1], sys.argv[2:]
    if cmd == 'upload':
        print(upload(args[0]))
    elif cmd == 'submit':
        submit(args[0], json.load(open(args[1])))
    elif cmd == 'wait':
        wait(args)
    elif cmd == 'ledger':
        ledger()
    else:
        sys.exit('usage: seedance.py upload <image> | submit <name> <spec.json> | wait <name>... | ledger')
