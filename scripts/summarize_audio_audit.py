"""Combine cached ASR passes into a review report without changing source data."""
import csv, html, json, re
from pathlib import Path
root = Path(__file__).resolve().parents[1]
out = root / 'audio-audit-results'
small = json.loads((out / 'small.en.json').read_text())
medium = json.loads((out / 'medium.en.json').read_text())
words = json.loads((root / 'public/voca3200data.json').read_text())
def norm(s): return re.sub('[^a-z0-9]', '', s.lower())
by_number = {int(v['filename'].split('_')[0]): v for v in small.values()}
combined = []
for filename, first in sorted(small.items()):
    second = medium.get(filename)
    n = int(filename.split('_')[0])
    next_row = by_number.get(n+1)
    status = 'match' if first['status']=='match' else 'review'
    if status == 'review' and second and second['status']=='match': status = 'match_second_model'
    if second and next_row and norm(second['transcript'])==norm(next_row['word']) and status=='review':
        status='possible_shift'
    combined.append({'filename':filename,'word':first['word'],'meaning':first['meaning'],
        'small_transcript':first['transcript'], 'medium_transcript':second['transcript'] if second else '',
        'status':status,'candidate_meaning':words.get(next_row['word'],'') if status=='possible_shift' else ''})
with (out/'combined.csv').open('w',newline='',encoding='utf-8-sig') as f:
    w=csv.DictWriter(f,fieldnames=list(combined[0]));w.writeheader();w.writerows(combined)
review=[v for v in combined if v['status'] in ['possible_shift','review']]
content='''<!doctype html><html lang="ko"><meta charset="utf-8"><title>음원 대조 결과</title><style>body{font-family:system-ui;margin:24px}table{border-collapse:collapse}td,th{padding:12px;border:1px solid #ccc;text-align:left}audio{width:220px}.possible_shift{background:#fff1d5}</style><h1>음원 재확인 후보</h1><p>음성 인식 결과이며 직접 청취로 확정해야 합니다. 원본은 변경하지 않았습니다.</p><table><tr><th>파일 / 화면 단어</th><th>한국어 뜻</th><th>small.en</th><th>medium.en</th><th>분류</th><th>원본 재생</th></tr>'''
for r in review:
    src='../public/audio3/'+r['filename']
    content+='<tr class="'+r['status']+'">'+''.join('<td>'+html.escape(r[k])+'</td>' for k in ['filename','meaning','small_transcript','medium_transcript','status'])+'<td><audio controls preload="none" src="'+html.escape(src)+'"></audio></td></tr>'
content+='</table></html>'
(out/'review.html').write_text(content)
counts={s:sum(r['status']==s for r in combined) for s in sorted({r['status'] for r in combined})}
lines=['# 음원 대조 결과','', '현재 사용하는 audio3 음원을 로컬 Whisper small.en으로 검사하고, 후보를 medium.en으로 재검사한 캐시를 종합했다. 한국어 뜻은 파일명의 단어 키로 조회했다. 음원 수정과 재검사 이력은 audio-repair.md를 참고한다.','', '## 요약','',f'- 1차 일치 {counts.get("match",0)}개, 2차 모델에서 일치 {counts.get("match_second_model",0)}개.',f'- 다음 번호 단어로 인식되는 후보 {counts.get("possible_shift",0)}개, 기타 재확인 {counts.get("review",0)}개.','- 검사 스크립트는 음원을 수정하지 않는다. 301~319번 및 626~629번 음원은 별도 교정 후 재검사했다.','- 음성 인식 판정이며 실제 청취 확정이나 한국어 뜻 전체의 사전 검증은 아니다.','', '## 파일명이 한 칸 밀린 것으로 의심되는 구간','', '아래는 현재 캐시에서 다음 번호 단어로 인식된 파일이다. 301~319번 및 626~629번은 교정 후 재검사했다.','', '| 파일명 단어 | 화면 뜻 | 1차 인식 | 2차 인식 | 2차 단어에 해당하는 뜻 |','|---|---|---|---|---|']
for r in combined:
    if r['status']=='possible_shift': lines.append('| '+' | '.join(r[k].replace('|','/') for k in ['filename','meaning','small_transcript','medium_transcript','candidate_meaning'])+' |')
lines+=['','## 기타 재확인 후보','','동음이의어와 철자 선택 오류가 포함되어 있으므로 아래 항목은 자동 수정하지 않는다. 예: hall/haul, pair/pear, weight/wait, male/mail.','','| 파일 | 화면 뜻 | 1차 인식 | 2차 인식 |','|---|---|---|---|']
for r in combined:
    if r['status']=='review':lines.append('| '+' | '.join(r[k].replace('|','/') for k in ['filename','meaning','small_transcript','medium_transcript'])+' |')
lines+=['','## 상세 파일','','- `audio-audit-results/combined.csv`: 750개 전체 대조 결과','- `audio-audit-results/review.html`: 현재 후보를 원본 음원과 함께 재생하며 확인하는 페이지','- [검사 실행 방법](audio-audit.md)','','일치 판정도 음원의 모든 품질 문제를 배제하지 않는다. 실제 앱에서만 다른 음원이 나오면 재생 상태와 서비스 워커 캐시를 추가 조사한다.']
(root/'docs/audio-audit-findings.md').write_text('\n'.join(lines)+'\n')
print(counts)
print('Reports written: combined.csv, review.html, docs/audio-audit-findings.md')
