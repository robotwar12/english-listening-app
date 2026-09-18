# 기능별 코드 지도

소스 확인 기준: 2026-09-16. 줄 번호 대신 아래 심볼을 검색한다.

## 수정 위치

| 작업 | 파일 | 검색할 심볼·내용 |
|---|---|---|
| 홈 화면 구성 | `src/app/page.tsx` | `Home`, 설치 버튼과 학습 앱 배치 |
| 초기 로딩·실패 표시 | `src/components/english-listening-app.tsx` | `loadAppData`, `isLoading` |
| 범위·무작위 목록 | 같은 파일 | `MAX_WORD_COUNT`, `generateRandomPlaylist`, `shuffleFiles` |
| 파일명·뜻 연결 | 같은 파일 | `AudioFile`, `extractWord`, `wordDatabase` |
| 재생·정지·다음 곡·선택 | 같은 파일 | `audioRef`, `stopAndReset`, `togglePlay`, `nextTrack`, `selectTrack`, `handleEnded`, `handleError` |
| 시험 모드·정답 숨김 | 같은 파일 | `isExamMode`, 시험 모드 체크박스; 현재 단어와 목록 모두 적용 |
| 초기화·뜻·목록 형태 | 같은 파일 | `resetApp`, `showMeanings`, `viewMode`, `playlist.map` |
| 현재 오디오 목록 API | `src/app/api/files/route.ts` | `GET`, `audio3`, `readdirSync` |
| 이전 중급 오디오 API | `src/app/api/intermediate-files/route.ts` | `GET`, `audio2`; 현재 홈에서 호출하지 않음 |
| PWA 설치 버튼 | `src/components/InstallPWAButton.tsx` | `beforeinstallprompt`, `handleInstallClick` |
| PWA 빌드·등록·타입 | `next.config.ts`, `src/types/next-pwa.d.ts` | `withPWAInit`, 개발 모드 비활성화, 로컬 타입 선언 |
| 앱 이름·아이콘·설치 정보 | `src/app/layout.tsx`, `public/manifest.json` | `metadata`, manifest; 기존 JSON 오류 있음 |
| 공통 스타일·글꼴 | `src/app/globals.css`, `src/app/layout.tsx`, `tailwind.config.ts` | CSS 변수, Inter/Poppins, Tailwind 테마 |
| 공통 UI | `src/components/ui/button.tsx`, `input.tsx`, `card.tsx` (같은 디렉터리) | `buttonVariants`, 각 컴포넌트 |
| 클래스 병합 | `src/lib/utils.ts` | `cn` |
| 로컬 음원 인식 대조 | `scripts/audit_audio.py`, `docs/audio-audit.md` | 파일명 단어·뜻·Whisper 결과 비교; 결과는 Git 제외 |
| 명령·의존성·검사 설정 | `package.json`, `eslint.config.mjs`, `tsconfig.json` | npm scripts, strict, `@/*` → `src/*` |

## 현재 데이터 흐름

1. `page.tsx`가 설치 버튼과 `EnglishListeningApp`을 렌더링한다.
2. 마운트 시 `/api/files`와 `/voca3200data.json`을 병렬 요청한다.
3. API는 `public/audio3`의 `.mp3` 파일명을 번호순으로 정렬해 문자열 배열로 반환한다. 실패 시 상태 500과 `{ error: string }`을 반환한다.
4. 범위 내 파일을 `AudioFile`로 변환하고 Fisher–Yates 방식으로 섞어 `playlist`에 저장한다.
5. 현재 항목의 `/audio3/<filename>`을 숨겨진 HTML `<audio>`에 연결한다.
6. 학습 상태는 React state에만 보관한다. 현재 소스에는 로그인, 외부 DB, 학습 기록 저장 기능이 없다.

## 데이터 계약과 사용 여부

301~319번 및 626~629번 음원 내용 교정과 재검사 결과는 [음원 교정 기록](audio-repair.md)을 참고한다. 단어·뜻·번호·파일명은 유지했다.

| 경로 | 확인한 내용 | 현재 홈 사용 |
|---|---|---|
| `public/audio3/` | MP3 750개 | 사용 |
| `public/voca3200data.json` | 단어 → 한국어 뜻의 `Record<string, string>`, 750개 | 사용 |
| `public/audio2/` | MP3 600개; 별도 중급 API가 제공 | 미사용 |
| `public/audio/` | MP3 600개 | 미사용 |
| `public/voaca1500data.json` | 뜻 600개; `voaca`가 실제 파일명 | 미사용 |
| `src/components/wordDatabase.ts` | `beginnerWords`, `intermediateWords`; 현재 import 없음 | 미사용 |

- 파일명 계약: `번호_단어.mp3`. 예: `001_adult.mp3`.
- 번호는 첫 `_` 앞 문자열을 정수로 파싱한다. `extractWord`는 `/^\d+_(.+)\.mp3$/`로 단어를 얻고 소문자 키로 뜻을 찾는다.
- 단어 부분의 추가 `_`나 접미사는 그대로 남는다. 파일명 변경 시 사전 키와 대조한다.
- 뜻이 없으면 `의미 데이터 없음`을 표시한다. 확인 당시 audio3의 뜻 누락은 0개였다.
- VOCA 3200이라는 자료 이름과 현재 음원 수 750개는 별개다. 상한은 `MAX_WORD_COUNT = 750`으로 고정되어 있다.
- 데이터 추가 시 MP3, 뜻 키, 상한을 함께 점검한다. API 응답 형태를 바꾸면 클라이언트도 수정해야 한다.
- API는 Node 파일시스템으로 public 디렉터리를 읽는다. 호스팅 변경 시 런타임에 해당 디렉터리가 포함되는지 확인한다.

## 재생 동작

- 목록 생성은 재생을 시작하지 않는다. 범위 양 끝을 포함하며 시작과 끝이 같아도 허용한다.
- 재생 버튼은 `audio.load()` 후 `play()`를 호출하므로 일시정지 후 눌러도 처음부터 재생한다.
- 다음 곡이나 다른 항목 선택은 정지·시간 초기화 후 곡만 변경한다. 자동 재생하지 않는다.
- 현재 항목을 다시 클릭하면 재생 상태를 토글한다.
- 곡이 끝나면 정지·시간 초기화하며 다음 곡으로 자동 이동하지 않는다.
- 초기화는 범위를 1~750으로 되돌리고 목록을 비운다. 뜻 표시와 grid/list 설정은 유지한다.
- `showMeanings`는 현재 단어와 전체 목록에 같이 적용된다.
- 시험 모드는 생성 전후 모두 전환 가능하다. 단어·뜻·원래 단어 번호·파일명·표시 경로를 숨기고 현재 순서의 문제 번호만 보여준다.
- 시험 모드에서도 재생·다음 곡·항목 선택·grid/list 전환은 유지된다. 뜻 토글은 비활성화된다.
- 모드를 끄면 기존 뜻 표시 설정대로 정답을 표시한다. 랜덤 재생성·초기화 시 시험 모드를 유지하며 새로고침하면 기본값(꺼짐)으로 돌아간다.
- 화면 가리기 기능이며 음원 URL이나 개발자 도구까지 차단하는 시험 보안 기능은 아니다.

## PWA 경계

- `next-pwa`는 개발 모드에서 비활성화되고 `public`에 서비스 워커를 생성한다.
- `public/sw.js`와 `public/workbox-4754cb34.js`는 확인 당시 Git 추적 중인 생성 파일이다. 일반 탐색에서 내부를 읽지 않는다.
- 설치 버튼은 브라우저가 `beforeinstallprompt` 이벤트를 제공한 경우에만 표시된다.
- 설정이 있다는 사실만으로 설치·오프라인 동작을 보장하지 않는다. 기존 문제와 검증은 [개발 안내](development.md)를 참고한다.
