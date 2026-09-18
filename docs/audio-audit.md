# 로컬 음원 대조

Whisper는 `~/.venvs/audio-audit`에 설치되어 있다. 앱의 npm 의존성에는 포함되지 않는다.

```sh
~/.venvs/audio-audit/bin/python scripts/audit_audio.py
```

현재 홈에서 사용하는 `public/audio3` 음원을 영어 `small.en` 모델로 인식한다. 파일명에서 얻은 단어, `voca3200data.json`의 뜻, 인식 결과를 함께 저장한다. 모델은 최초 실행 시 다운로드되며 인식은 CPU에서 로컬로 실행된다.

결과는 Git에서 제외한 `audio-audit-results/`에 저장된다.

- `small.en.json`: 재실행 시 이어서 처리하기 위한 캐시
- `small.en-all.csv`: 전체 파일·단어·뜻·인식 결과
- `small.en-review.csv`: 인식 결과가 다르거나 실행 오류가 있는 후보

단어와 인식 결과를 비교할 때 대소문자·공백·구두점은 무시한다. 동음이의어, 단독 단어의 잘못된 음성 인식, 무음 인식 실패가 있을 수 있다. `review`는 수정 확정이 아니라 청취 재확인 대상이다. 사전의 한국어 번역 자체가 정확하다는 판정도 아니다.

음원 파일이나 뜻을 바꾸면 기존 캐시를 삭제하거나 새 `--output` 경로를 지정해서 다시 검사한다. 다른 모델로 재확인하려면 `--model medium.en`처럼 지정한다. 원본 음원과 데이터는 자동 수정하지 않는다.

## 2차 검사와 종합 보고서

```sh
~/.venvs/audio-audit/bin/python scripts/audit_audio.py --model medium.en --review-from audio-audit-results/small.en.json
~/.venvs/audio-audit/bin/python scripts/summarize_audio_audit.py
```

`small.en` 전체 검사를 마친 뒤 순서대로 실행한다. 종합 스크립트는 기본 `audio-audit-results` 경로의 두 캐시를 읽는다. 결과는 `combined.csv`와 원본 음원을 재생할 수 있는 `review.html`, 저장소 문서 `docs/audio-audit-findings.md`로 생성된다. [현재 검사 결과](audio-audit-findings.md)를 참고한다.

검사 환경 재설치:

```sh
/opt/homebrew/bin/python3.11 -m venv ~/.venvs/audio-audit
~/.venvs/audio-audit/bin/python -m pip install openai-whisper==20250625
```

별도로 ffmpeg가 PATH에 있어야 한다. 모델·결과는 저장소에 커밋하지 않는다.
