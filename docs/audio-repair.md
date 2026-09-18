# 301~319번 음원 교정

교정일: 2026-09-18. 단어·뜻·번호·파일명을 유지하고 파일 안의 음원 내용을 교정했다.

- 301번 keep: 이전 `public/audio/393_keep.mp3`를 복사했다. 원본은 유지했다.
- 302~319번: 교정 전 301~318번 음원을 각각 올바른 다음 번호 파일에 배치했다.
- 320번 close와 현재 학습용 393번 steal은 변경하지 않았다.
- 교정 전 319번 파일(close 음원)은 저장소 외부 백업에 보관했다.
- 전체 MP3 750개, 고유 번호 750개, 뜻 키 누락 0개 확인.
- 변경된 19개를 medium.en으로 새로 인식해 19개 모두 파일명과 일치했다. small.en은 17개 일치, 2개 인식 차이(luck/Lock, lift/lived).
- 실제 스피커 청취와 배포된 사이트 검증은 아직 하지 않았다. 커밋·푸시·배포는 이번 교정에 포함하지 않았다.
- 아래 후속 교정에서 626~629번도 수정했다. 기타 후보는 수정하지 않았다.

## 백업

/Users/kimjungmin/.local/share/english-listening-app/audio-backups/20260918-104052

백업의 `mapping.json`에 원본 경로와 수정 후 SHA-256을 기록했다. 원본 바이트를 모두 읽어 보관한 뒤 배치해 덮어쓰기 중 원본 손실을 방지했다.

## 이동표

| 수정 파일 | 교정 전 음원 출처 |
|---|---|
| 301_keep.mp3 | public/audio/393_keep.mp3 |
| 302_luck.mp3 | public/audio3/301_keep.mp3 |
| 303_reach.mp3 | public/audio3/302_luck.mp3 |
| 304_memory.mp3 | public/audio3/303_reach.mp3 |
| 305_hedgehog.mp3 | public/audio3/304_memory.mp3 |
| 306_price.mp3 | public/audio3/305_hedgehog.mp3 |
| 307_lift.mp3 | public/audio3/306_price.mp3 |
| 308_require.mp3 | public/audio3/307_lift.mp3 |
| 309_humorous.mp3 | public/audio3/308_require.mp3 |
| 310_break.mp3 | public/audio3/309_humorous.mp3 |
| 311_cabbage.mp3 | public/audio3/310_break.mp3 |
| 312_among.mp3 | public/audio3/311_cabbage.mp3 |
| 313_mark.mp3 | public/audio3/312_among.mp3 |
| 314_indoor.mp3 | public/audio3/313_mark.mp3 |
| 315_middle.mp3 | public/audio3/314_indoor.mp3 |
| 316_alphabet.mp3 | public/audio3/315_middle.mp3 |
| 317_trophy.mp3 | public/audio3/316_alphabet.mp3 |
| 318_jewel.mp3 | public/audio3/317_trophy.mp3 |
| 319_daily.mp3 | public/audio3/318_jewel.mp3 |

[현재 대조 결과](audio-audit-findings.md)

기존 브라우저의 서비스 워커 캐시가 남아 있으면 예전 음원이 들릴 수 있다. 배포 시 PWA를 재빌드하고, 기존 캐시가 있는 브라우저와 새 브라우저에서 수정된 URL을 확인해야 한다.

## 626~629번 후속 교정

교정일: 2026-09-18. 기존 audio2의 048_stick.mp3를 medium.en으로 먼저 인식해 Stick을 확인했다.

| 수정 파일 | 교정 전 음원 출처 |
|---|---|
| 626_stick.mp3 | public/audio2/048_stick.mp3 |
| 627_joy.mp3 | public/audio3/626_stick.mp3 |
| 628_league.mp3 | public/audio3/627_joy.mp3 |
| 629_germ.mp3 | public/audio3/628_league.mp3 |

- 변경한 4개는 small.en과 medium.en 모두 파일명 단어와 일치했다.
- 602~630번 29개 전체를 새로 검사했다. small.en은 28개 일치, medium.en은 27개 일치. bare/bear 및 afterward/afterword는 동음이의어 철자 인식 차이다.
- 602~625번과 630번의 음원, 뜻 데이터, 이전 stick 원본은 변경하지 않았다. 전체 음원 수 750개와 번호·뜻 연결을 확인했다.
- 변경 후 바이트 해시를 이동표와 대조했고, Git 변경 음원이 정확히 4개인 것을 확인했다.
- 원본 백업: `/Users/kimjungmin/.local/share/english-listening-app/audio-backups/20260918-104413`
- 이번 후속 교정은 아직 커밋·푸시·배포하지 않았다.
