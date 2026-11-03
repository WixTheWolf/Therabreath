#!/usr/bin/env python3
"""Word times for a voice take with faster-whisper (local, no credits), in the shape ElevenLabs Scribe writes:
{"words": [{"text", "start", "end"}]}. Checked against Scribe on the V4 take: median 0.1 s early, which the layout's
trim to the voice absorbs. Scribe is still the first choice when credits allow.
Usage (with faster-whisper installed): python3 scripts/fof5_words.py public/fof5/audio/vo.wav public/fof5/vo_words.json
"""
import json, sys
from faster_whisper import WhisperModel

src, out = sys.argv[1], sys.argv[2]
m = WhisperModel("small.en", device="cpu", compute_type="int8")
segs, _ = m.transcribe(src, word_timestamps=True, beam_size=5, initial_prompt="TheraBreath, Norco, Ross, Princeton, R&D, Darwin room, Playbook.")
words = [{"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)} for s in segs for w in s.words]
json.dump({"words": words}, open(out, "w"), indent=0)
print(len(words), "words")
