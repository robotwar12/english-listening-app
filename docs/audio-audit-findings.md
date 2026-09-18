# 음원 대조 결과

현재 사용하는 audio3 음원을 로컬 Whisper small.en으로 검사하고, 후보를 medium.en으로 재검사한 캐시를 종합했다. 한국어 뜻은 파일명의 단어 키로 조회했다. 음원 수정과 재검사 이력은 audio-repair.md를 참고한다.

## 요약

- 1차 일치 696개, 2차 모델에서 일치 21개.
- 다음 번호 단어로 인식되는 후보 0개, 기타 재확인 33개.
- 검사 스크립트는 음원을 수정하지 않는다. 301~319번 및 626~629번 음원은 별도 교정 후 재검사했다.
- 음성 인식 판정이며 실제 청취 확정이나 한국어 뜻 전체의 사전 검증은 아니다.

## 파일명이 한 칸 밀린 것으로 의심되는 구간

아래는 현재 캐시에서 다음 번호 단어로 인식된 파일이다. 301~319번 및 626~629번은 교정 후 재검사했다.

| 파일명 단어 | 화면 뜻 | 1차 인식 | 2차 인식 | 2차 단어에 해당하는 뜻 |
|---|---|---|---|---|

## 기타 재확인 후보

동음이의어와 철자 선택 오류가 포함되어 있으므로 아래 항목은 자동 수정하지 않는다. 예: hall/haul, pair/pear, weight/wait, male/mail.

| 파일 | 화면 뜻 | 1차 인식 | 2차 인식 |
|---|---|---|---|
| 011_hall.mp3 | 회관, 홀, 복도 | Haul | Haul |
| 022_knight.mp3 | (중세의) 기사 | Night | night. Thanks for watching! |
| 025_sore.mp3 | 아픈 | Soar. | Soar |
| 034_chilly.mp3 | 차가운, 쌀쌀한 | Chili | Chilli |
| 064_bury.mp3 | 묻다 | very | berry |
| 072_pair.mp3 | 한 쌍, 짝 | Pear | Pear. |
| 114_lap.mp3 | (다리 위 넙적한 부분) 무릎 | lab | Lab |
| 133_bend.mp3 | 구부리다 | Banned | Banned |
| 157_plate.mp3 | 접시 | played | Play it. |
| 191_greet.mp3 | 인사하다 | Great | Great! |
| 219_icy.mp3 | (얼음같이) 차가운 | I see. | I see. |
| 247_paste.mp3 | 붙이다 | Pazed. | P.A.C.E.D. |
| 268_since.mp3 | ~부터(이후); ~한 이후로, ~때문에 | sins | synths |
| 271_weight.mp3 | 체중, 무게 | Wait. | Wait. |
| 292_hare.mp3 | 산토끼 | Hair | hair. |
| 326_course.mp3 | 강의, 강좌 | Coors | Cores |
| 336_by.mp3 | [장소] ~ 옆에, [수단] ~로, [시간] ~까지 | Bye. | Bye! |
| 338_role.mp3 | 역할, 임무 | Roll | Roll. |
| 354_sew.mp3 | 바느질하다, 꿰매다 | So | So... |
| 358_gentleman.mp3 | 신사, 남자분 | gentlemen | Gentlemen! |
| 368_weigh.mp3 | 무게가 나가다 | Way | Way. |
| 379_aloud.mp3 | 소리 내어, 크게 | Allowed | Allowed. |
| 445_sigh.mp3 | 한숨을 쉬다 | PSY | PSI |
| 452_band.mp3 | (음악) 밴드 | Banned | Banned |
| 466_reed.mp3 | 갈대 | read | Read. |
| 498_mist.mp3 | 안개 | missed | Missed |
| 623_bare.mp3 | 벌거벗은 | There. | Bear. |
| 641_deaf.mp3 | 귀가 들리지 않는, 청각 장애의 | death | Death |
| 650_accept.mp3 | 받아들이다, 받다 | Except... | Except… |
| 694_ton.mp3 | [무게] 톤 | Tan | Done! |
| 695_medal.mp3 | 메달, 훈장 | metal | Metal |
| 715_main.mp3 | 주된, 중심이 되는 | Maine. | Maine |
| 720_male.mp3 | 남성의, 수컷의 | Mail | Mail. |

## 상세 파일

- `audio-audit-results/combined.csv`: 750개 전체 대조 결과
- `audio-audit-results/review.html`: 현재 후보를 원본 음원과 함께 재생하며 확인하는 페이지
- [검사 실행 방법](audio-audit.md)

일치 판정도 음원의 모든 품질 문제를 배제하지 않는다. 실제 앱에서만 다른 음원이 나오면 재생 상태와 서비스 워커 캐시를 추가 조사한다.
