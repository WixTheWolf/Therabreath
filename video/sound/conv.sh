# convert raw/*.mp3 to wav/*.wav at 48 kHz stereo 24-bit (skips ones already converted)
cd "$(dirname "$0")"
for m in raw/*.mp3; do b=$(basename "$m" .mp3); [ -s "wav/$b.wav" ] || echo "$b"; done | xargs -P 8 -I{} sh -c 'cd /home/user/therabreath/video && npx remotion ffmpeg -y -v error -i sound/raw/{}.mp3 -ar 48000 -ac 2 -c:a pcm_s24le sound/wav/{}.wav'
ls wav | wc -l
