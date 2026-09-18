"""Local Whisper audit. Run with ~/.venvs/audio-audit/bin/python.
ASR differences are review candidates, never proof of incorrect audio.
"""
import argparse, csv, json, re, time
from pathlib import Path
import torch
import whisper

parser = argparse.ArgumentParser()
parser.add_argument('--model', default='small.en')
parser.add_argument('--output', default='audio-audit-results')
parser.add_argument('--limit', type=int)
parser.add_argument('--review-from', help='JSON cache whose nonmatching files should be rechecked')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
out = Path(args.output).resolve()
out.mkdir(parents=True, exist_ok=True)
words = json.loads((root / 'public/voca3200data.json').read_text())
files = sorted((root / 'public/audio3').glob('*.mp3'))
if args.review_from:
    previous = json.loads(Path(args.review_from).read_text())
    files = [f for f in files if f.name in previous and previous[f.name]['status'] != 'match']
if args.limit:
    files = files[:args.limit]
cache_path = out / f'{args.model}.json'
rows = json.loads(cache_path.read_text()) if cache_path.exists() else {}
def normalize(text):
    return re.sub(r'[^a-z0-9]', '', text.lower())
torch.set_num_threads(4)
print(f'Loading {args.model}; {len(files)} audio files', flush=True)
model = whisper.load_model(args.model, device='cpu')
started = time.time()
for i, file in enumerate(files, 1):
    if file.name not in rows:
        expected = re.sub(r'^\d+_', '', file.stem)
        try:
            result = model.transcribe(str(file), language='en', fp16=False,
                temperature=0, condition_on_previous_text=False, verbose=None)
            transcript = result['text'].strip()
            rows[file.name] = {'filename': file.name, 'word': expected,
                'meaning': words.get(expected.lower(), ''), 'transcript': transcript,
                'status': 'match' if normalize(expected) == normalize(transcript) else 'review',
                'avg_logprob': min((s['avg_logprob'] for s in result['segments']), default=None)}
        except Exception as exc:
            rows[file.name] = {'filename': file.name, 'word': expected,
                'meaning': words.get(expected.lower(), ''), 'transcript': '',
                'status': 'error', 'error': str(exc)}
        cache_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2))
    if i % 10 == 0 or i == len(files):
        print(f'{i}/{len(files)}, elapsed {time.time()-started:.0f}s, review {sum(r["status"] != "match" for r in rows.values())}', flush=True)
selected = [rows[f.name] for f in files]
for name, data in [('all', selected), ('review', [r for r in selected if r['status'] != 'match'])]:
    with (out / f'{args.model}-{name}.csv').open('w', newline='', encoding='utf-8-sig') as handle:
        writer = csv.DictWriter(handle, fieldnames=['filename','word','meaning','transcript','status','avg_logprob','error'])
        writer.writeheader()
        writer.writerows(data)
print(json.dumps({'checked':len(selected),'matches':sum(r['status']=='match' for r in selected),'review':sum(r['status']=='review' for r in selected),'errors':sum(r['status']=='error' for r in selected)}, ensure_ascii=False), flush=True)
