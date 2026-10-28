#!/usr/bin/env bash
# The Future of Freshness V5, both endings, from one voice take to the site's files.
#   bash scripts/fof5_build.sh <take.wav|mp3> <words.json> [--ship]
# words.json: the take's transcript with word times (ElevenLabs Scribe, or scripts/../words.py with faster-whisper).
# Without --ship the films stay in out/fof5; with it they are copied into ../final/public/media, with captions and a
# poster: opening.* is the site cut, opening.brief.* the pre-brief cut.
set -euo pipefail
cd "$(dirname "$0")/.."
TAKE="$1"; WORDS="$2"; SHIP="${3:-}"
mkdir -p out/fof5 public/fof5/audio
ffmpeg -loglevel error -y -i "$TAKE" -ar 48000 -ac 1 out/fof5/vo_in.wav && mv out/fof5/vo_in.wav public/fof5/audio/vo.wav
python3 scripts/fof5_layout.py public/fof5/audio/vo.wav "$WORDS"
for E in brief site; do
  ID=$([ "$E" = brief ] && echo FutureOfFreshnessV5Brief || echo FutureOfFreshnessV5Site)
  npx remotion render src/index5.ts "$ID" "out/fof5/pic_$E.mp4" --muted --public-dir=public_v5 --concurrency=4 --crf=16 --log=error
  python3 scripts/fof5_mix.py "$E" "out/fof5/mix_$E.wav"
  # loudness: two passes to -16.5 LUFS, true peak under -2 dBTP
  M=$(ffmpeg -hide_banner -i "out/fof5/mix_$E.wav" -af loudnorm=I=-16.5:TP=-2.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  g() { echo "$M" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
  ffmpeg -loglevel error -y -i "out/fof5/mix_$E.wav" -af "loudnorm=I=-16.5:TP=-2.0:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 48000 "out/fof5/master_$E.wav"
  ffmpeg -loglevel error -y -i "out/fof5/pic_$E.mp4" -i "out/fof5/master_$E.wav" -map 0:v -map 1:a -c:v libx264 -preset slow -crf 22 -profile:v high -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart -shortest "out/fof5/film_$E.mp4"
  ffmpeg -loglevel error -y -i "out/fof5/pic_$E.mp4" -i "out/fof5/master_$E.wav" -map 0:v -map 1:a -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -c:a libopus -b:a 128k -shortest "out/fof5/film_$E.webm"
  echo "$E: $(ffprobe -v error -show_entries format=duration -of csv=p=0 out/fof5/film_$E.mp4) s"
done
if [ "$SHIP" = "--ship" ]; then
  D=../final/public/media
  cp out/fof5/film_site.mp4 $D/opening.mp4; cp out/fof5/film_site.webm $D/opening.webm
  cp out/fof5/film_brief.mp4 $D/opening.brief.mp4; cp out/fof5/film_brief.webm $D/opening.brief.webm
  cp public/fof5/captions_site.vtt $D/opening.vtt; cp public/fof5/captions_brief.vtt $D/opening.brief.vtt
  # the poster: the title over the crown splash
  T=$(python3 -c "import json; d=json.load(open('public/fof5/take_site.json')); print([l for l in d['lines'] if l['id']=='see'][0]['end'] + 1.6)")
  ffmpeg -loglevel error -y -ss "$T" -i out/fof5/film_site.mp4 -frames:v 1 -q:v 3 $D/film-poster.jpg
  echo "shipped to $D"
fi
