# LiPeat 개선 PRD — v0 프로토타입에서 실제 제품으로

- **작성일:** 2026-07-12
- **대상 저장소:** `new-lipeat` (Next.js 15 + React 19 + Tailwind + shadcn/ui, v0 생성)
- **상태:** 초안 — 사용자 리뷰 대기

---

## 1. 배경과 진단 요약

LiPeat은 YouTube 영상 + 인터랙티브 자막 + AI 보조로 언어를 학습하는 워크벤치다.
전체 코드베이스(컴포넌트 13개, API 라우트 8개, 설정)를 3방향으로 전수 분석한 결과, 현재 상태는 **"동작하는 것처럼 보이는 v0 스캐폴드"**다. 핵심 진단 세 가지:

1. **간판 기능이 전부 가짜다.** Gemini 라우트 4개는 API 키가 있어도 목(mock) 데이터만 반환하고, YouTube 자막 가져오기도 항상 목 자막을 반환한다. 사용자는 진짜 AI 응답·자막이라고 믿게 되는 조용한 기만 구조.
2. **앱이 두 벌이다.** 실제 렌더되는 `language-learning-app.tsx` 트리와, 어디서도 import되지 않는 `language-learning-workbench.tsx` 트리(~2,300줄)가 공존한다. 죽은 트리 안에 크래시 버그와 타입 에러가 다수 숨어 있다.
3. **품질 게이트가 꺼져 있다.** `next.config.mjs`에서 타입 에러·ESLint를 빌드에서 무시하고, 테스트는 0개다. 실재하는 타입 에러 6~10개가 숨겨진 채 배포된다.

### 현재 아키텍처 (실제 렌더 기준)

```
app/page.tsx
└─ LanguageLearningApp          ← 모든 상태(useState 6개)가 여기 집중, prop drilling
   └─ Tabs (한국어 라벨 5개)
      ├─ LearningDashboard      ← 전부 하드코딩 목 데이터
      ├─ VideoSearch            → /api/youtube/search (실 호출, 실패 시 조용히 목으로 대체)
      ├─ VideoPlayer + SubtitleUploader  ← IFrame API, 자막 fetch는 항상 목
      ├─ SubtitleEditor         ← 가장 큰 파일(1,222줄), 타이밍 수학 다수
      └─ VocabularyList         ← 단어장 (유일하게 localStorage 저장됨)
```

영속성: `savedVocabulary` localStorage 하나뿐. 새로고침 시 선택 영상, 자막, 편집 내용, 재생 위치 전부 소실. DB 없음.

---

## 2. 개선점 전체 목록 (Improvement Inventory)

### 2.1 Critical — 제품의 핵심 약속이 거짓이거나 즉시 크래시

| ID | 위치 | 문제 |
|----|------|------|
| CR-1 | `app/api/gemini/{generate,translate,translate-batch,word-info}/route.ts:21-26` | Gemini를 **한 번도 호출하지 않음**. 키가 있어도 목 반환. 코드베이스 전체에 `generativelanguage.googleapis.com` fetch 없음, SDK 의존성도 없음 |
| CR-2 | `app/api/youtube/captions/route.ts:49-57, 292-296` | 캡션 트랙을 찾아도 목 자막 반환. 실제 fetch 코드는 주석 처리, `parseCaptionData`는 빈 함수. 게다가 선택한 기법(Data API `captions.download`)은 **채널 소유자 OAuth 필수라서 타인 영상엔 원천적으로 불가능** — 접근법 자체를 교체해야 함 |
| CR-3 | `components/ai-assistant.tsx:46,74,127,155` | 존재하지 않는 `/api/lilys` 엔드포인트 호출 — AI 어시스턴트 전 기능 404 |
| CR-4 | `components/video-player.tsx:69-103` | `onYouTubeIframeAPIReady`는 페이지당 1회만 발화하는데 `window.YT` 기로드 가드가 없음 → **두 번째 영상부터 플레이어가 영구 블랙아웃** |
| CR-5 | `components/vocabulary-manager.tsx:60-84` | `useState` 선언 전에 dep 배열에서 `vocabulary` 참조(TDZ) → 마운트 즉시 throw |
| CR-6 | `components/vocabulary-manager.tsx:187-270` | 퀴즈 중 `wordsForReview`가 실시간 재계산되어 배열이 줄어드는데 인덱스는 증가 → `undefined.word` 크래시 |
| CR-7 | `next.config.mjs:4,7` | `typescript.ignoreBuildErrors` + `eslint.ignoreDuringBuilds` 둘 다 true — 위 에러들이 빌드를 통과함 |

### 2.2 High — 기능이 조용히 오동작하거나 위험 노출

| ID | 위치 | 문제 |
|----|------|------|
| HI-1 | `components/language-learning-workbench.tsx` 및 전용 자식 5개 | ~2,300줄 도달 불가 죽은 코드. 타입 에러 다수(존재하지 않는 `ui/avatar` import, `LearningDashboard` prop 계약 불일치 등) |
| HI-2 | `app/api/youtube/{search,video,captions}/route.ts` catch 블록 | 모든 실패(쿼터 초과, 잘못된 키, 네트워크)를 **HTTP 200 + 목 데이터**로 은폐. 운영자가 장애를 인지할 방법이 없음 |
| HI-3 | `app/api/**` 전체 | 입력 검증 없음(Zod 미사용 — 의존성엔 있음), rate limiting 없음, 업스트림 fetch 타임아웃 없음. 실연동 시 열린 프록시가 되어 쿼터/비용 탈취 가능 |
| HI-4 | `components/subtitle-editor.tsx:522` | 괄호 제거 정규식이 `/$$.*?$$/g` (v0 이스케이프 손상) — "청각장애인용 텍스트 제거" 기능이 아무것도 안 함 |
| HI-5 | `components/subtitle-editor.tsx:364` | 사용자 입력을 raw로 `new RegExp()` — `(`, `[` 등 입력 시 전체 바꾸기 크래시(정규식 인젝션) |
| HI-6 | `components/vocabulary-list.tsx:42-48` | 품사 필터 로직 역전 — 명사/동사/형용사 필터가 실제로 아무것도 거르지 않음 |
| HI-7 | `components/vocabulary-manager.tsx:192-218` | 얕은 복사 후 객체 직접 변이 — React 변경 감지 파괴, SRS 숙련도 계산이 stale 값 사용 |
| HI-8 | `components/language-learning-app.tsx:65-69` | `length > 0`일 때만 localStorage 저장 → 마지막 단어 삭제가 영구 반영 안 됨(리로드 시 부활) |
| HI-9 | `components/subtitle-editor.tsx:88-90` | 부모 `subtitles` 변경 시 dirty 체크 없이 편집 상태 리셋 — 편집 중 작업 조용히 소실 |
| HI-10 | 저장소 루트 | `package-lock.json`과 `pnpm-lock.yaml` 동시 커밋 — 설치 비결정성 (git log에서 이미 배포 사고 이력 확인됨) |

### 2.3 Medium — 성능·UX·유지보수성

| ID | 위치 | 문제 |
|----|------|------|
| ME-1 | `components/video-player.tsx:123-153,432-497` | 100ms `setInterval`로 초당 10회 리렌더 + `currentTime`이 dep에 있어 전역 keydown 리스너가 초당 10회 재부착 |
| ME-2 | `components/video-player.tsx:417-429` | 공백 split 기반 단어 클릭 — 기본 학습 언어가 한국어인데 CJK는 공백이 없어 **핵심 기능(단어 조회)이 한중일에서 무용** |
| ME-3 | `components/subtitle-editor.tsx:872` | `document.querySelector("textarea")` — DOM 첫 textarea 기준 분할이라 엉뚱한 커서 위치 사용 가능 |
| ME-4 | `app` 라우터 전반 | `error.tsx`/`loading.tsx`/`not-found.tsx`/에러 바운더리 전무 — throw 하나로 전체 화이트스크린 |
| ME-5 | `package.json` | 미사용 Radix 패키지 16개 + `recharts`, `embla`, `react-day-picker`, `input-otp`, `vaul`, `cmdk` 등 v0 잔재 의존성 다수 |
| ME-6 | `app/layout.tsx`, `components/theme-provider.tsx` | `ThemeProvider` 미장착 — 다크모드 토큰·variant 전부 죽은 코드 |
| ME-7 | `styles/globals.css` | `app/globals.css`와 바이트 단위 동일한 중복 파일 |
| ME-8 | `app/api/**` | `getMockSubtitles`, `getLanguageName`, `getMockTranslation`, 키 체크 보일러플레이트가 라우트마다 복붙 — 공유 클라이언트/유틸 없음 |
| ME-9 | 타입 전반 | `VocabularyItem`이 서로 호환 안 되는 2벌, `UserProfile` 3벌 복붙, `types/youtube.d.ts`는 `Player: any` |
| ME-10 | `subtitle-uploader.tsx:190-245` | VTT 파서가 00:00:00.000 시작 큐의 텍스트를 버림, NOTE/식별자 미지원 |
| ME-11 | 테스트 | 테스트 0개, 러너 설정 없음 — 자막 타이밍 수학(shift/stretch/merge/split)이 무보호 |

### 2.4 Low — 정리·브랜딩·접근성

| ID | 위치 | 문제 |
|----|------|------|
| LO-1 | `package.json:2`, `app/layout.tsx:7-10` | 이름 `"my-v0-project"`, 탭 제목 `"v0 App"` — 브랜딩 미적용 |
| LO-2 | `app/layout.tsx:19` | `<html lang="en">`인데 UI 전체가 하드코딩 한국어 — i18n 구조 없음 |
| LO-3 | 저장소 루트 | `.env.example` 없음 — 필수 키 2개(`GEMINI_API_KEY`, `YOUTUBE_API_KEY`)의 존재를 알 방법이 없고, 미설정 시 경고 로그도 없음 |
| LO-4 | `video-player.tsx:419-427` 등 | 클릭 가능한 `<span>`/`<div>`에 role/tabIndex/keydown 없음 — 단어 조회·자막 탐색이 키보드/스크린리더 불가 |
| LO-5 | `README.md` | OAuth 자막, 배치 번역 등 실제로 없는 기능을 사실처럼 기술 |
| LO-6 | `next.config.mjs:10` | `images.unoptimized: true` — Vercel 호스팅 정황상 최적화 켜는 게 이득 |

---

## 3. 목표 / 비목표

### 목표 (v1)
1. **정직한 제품**: 모든 목 데이터·조용한 폴백 제거. 기능은 진짜로 동작하거나, 명시적으로 실패를 보여준다.
2. **AI 실연동**: Gemini API 실제 호출(단어 정의, 문장 설명, 번역) + 응답 스키마 검증.
3. **자막 파이프라인 신뢰성**: 파일 업로드(SRT/VTT)를 1급 경로로, YouTube 자막 자동 로딩은 실현 가능한 기법으로 재구축.
4. **크래시 제로**: Critical/High 버그 전량 수정, 품질 게이트(타입체크·린트·핵심 테스트) 복원.
5. **작업 보존**: 자막 편집·학습 진행 상태가 새로고침에도 유지.

### 비목표 (v1에서 제외)
- 다국어 UI(i18n 프레임워크 도입) — 한국어 단일 UI 유지, 구조만 훼손하지 않음
- 소셜/공유 기능, 모바일 네이티브 앱
- 죽은 워크벤치 트리의 기능 전체 복원 — 가치 있는 아이디어(SRS 퀴즈)만 이식
- 실시간 협업 편집

---

## 4. 접근 방식 비교와 권고

### 결정 1 — 죽은 코드 처리
- **A. 전량 삭제 후 필요 기능만 재구현 (권고)**: `workbench` 트리 ~2,300줄 삭제. SRS(간격 반복) 퀴즈 개념만 Phase 3에서 새로 구현. 숨은 타입 에러 대부분이 이 트리에 있어 삭제 즉시 품질 게이트 복원이 쉬워짐.
- B. 워크벤치를 살려 통합: 두 트리 병합 비용이 크고, 워크벤치 쪽은 마운트 즉시 크래시하는 수준이라 비추천.

### 결정 2 — 데이터 영속성
- **A. Phase 2에서 Supabase 도입 (권고)**: 주 스택과 일치. 익명 → 로그인 승격 패턴으로 진입 장벽 없이 시작. 단어장·자막 편집본·학습 기록을 서버 보존.
- B. localStorage 확장만: 빠르지만 기기 간 동기화 불가, SRS 데이터 유실 위험. Phase 1까지의 임시 조치로만 사용.

### 결정 3 — YouTube 자막 자동 로딩
- **A. 서버사이드 timedtext 계열 라이브러리 + 실패 시 정직한 안내 (권고)**: `youtube-captions-scraper` 류 기법. 단, YouTube 비공식 엔드포인트라 깨질 수 있음을 전제로, **파일 업로드를 항상 동등한 1급 경로로 유지**하고 실패 시 "자막을 가져올 수 없습니다 → 파일을 업로드하세요"로 안내.
- B. 현행 Data API `captions.download` 유지: 타인 영상 불가(OAuth+소유권) — 원천 불가능, 폐기.
- C. Whisper 등 STT 생성: 비용·지연 큼. v2 후보로 보류.

### 결정 4 — AI 어시스턴트 백엔드
- **A. Lilys 참조 제거, Gemini로 단일화 (권고)**: `/api/lilys`는 서버 구현이 없고 요약 API를 설명/번역에 쓰는 것도 부적합. Gemini 라우트 하나로 통합.

---

## 5. 로드맵

### Phase 0 — 정리와 안전망 (약 1주) `chore/fix`
1. 죽은 트리 삭제: `language-learning-workbench`, `learning-mode`, `ai-assistant`, `vocabulary-manager`, `media-uploader`, `keyboard-shortcuts-modal`, `styles/` (CR-3·5·6, HI-1, ME-7 해소)
2. `ignoreBuildErrors`/`ignoreDuringBuilds` 해제 → 드러나는 타입 에러 수정 (`Alert variant="warning"` 등) (CR-7)
3. lockfile 단일화(pnpm), 미사용 의존성 제거, `package.json`/metadata 브랜딩(`lipeat`), `<html lang="ko">` (HI-10, ME-5, LO-1·2)
4. `.env.example` 추가 + 키 미설정 시 서버 경고 로그 (LO-3)
5. `app/error.tsx`, `app/loading.tsx`, `not-found.tsx`, 주요 트리 에러 바운더리 (ME-4)
6. Vitest 도입 + 자막 파서·타이밍 유틸 회귀 테스트 시드 (ME-11)

**완료 기준:** `npx tsc --noEmit` 0 에러, `next build` 게이트 활성 상태로 성공, 죽은 코드 0줄.

### Phase 1 — 핵심 기능 실동작 (약 2~3주) `feat`
1. **Gemini 실연동** (CR-1): `@google/genai` SDK, 최신 `gemini-2.x` 모델, 공유 클라이언트를 `lib/gemini.ts`로. 라우트별 Zod 입력·출력 스키마, 프롬프트를 한국어 학습자 맥락으로 재작성, 스트리밍 응답(설명/생성 계열)
2. **YouTube 자막 재구축** (CR-2): 결정 3-A 채택. `/api/subtitles`와 `/api/youtube/captions` 중복 해소(하나로 통합)
3. **조용한 목 폴백 전면 제거** (HI-2): 실패는 구조화된 에러(4xx/5xx + 코드)로. 클라이언트는 토스트+재시도 UI
4. **API 방어선** (HI-3): Zod 입력 검증(길이 상한, 언어코드 enum, videoId 형식 `^[\w-]{11}$`), 업스트림 fetch `AbortController` 타임아웃, 간단한 IP 기반 rate limit
5. **플레이어 버그 수정** (CR-4, ME-1): `window.YT` 기로드 가드, 폴링 리팩터(리스너 재부착 제거)
6. 자막 에디터 버그 수정 (HI-4·5·9, ME-3·10): 정규식 이스케이프(`escapeRegExp`), dirty 체크, ref 기반 textarea, VTT 파서 수정
7. 단어장 버그 수정 (HI-6·8)

**완료 기준:** 키 설정 시 실제 Gemini 응답/실제 자막 수신, 키 미설정·실패 시 명시적 에러 UI. 목 데이터 반환 경로 0개.

### Phase 2 — 영속성과 계정 (약 2주) `feat`
1. Supabase 도입: 스키마 — `profiles`, `vocabulary`(SRS 필드 포함), `subtitle_documents`(편집본), `watch_progress`
2. 익명 세션 → 이메일 로그인 승격. RLS 적용
3. localStorage → Supabase 마이그레이션 경로(기존 단어장 자동 이관)
4. 자막 편집 자동 저장(디바운스), 마지막 시청 위치 복원

**완료 기준:** 새로고침·기기 변경에도 단어장/편집본/진행 상태 유지.

### Phase 3 — 학습 경험 고도화 (약 2~3주) `feat`
1. 대시보드 실데이터화: 학습 시간·단어 수·연속 학습일을 실제 이벤트 기반으로
2. SRS 복습 퀴즈 재구현 (삭제된 프로토타입의 개념 이식, 크래시 버그 없이)
3. CJK 대응 단어 분할 (ME-2): `Intl.Segmenter` 기반 토크나이즈
4. 접근성 1차 (LO-4): 클릭 요소 키보드 조작 가능화, 자막 리스트 role 부여
5. README 실상 반영 재작성 (LO-5)

**완료 기준:** 대시보드 수치가 실제 활동과 일치, 한국어/일본어 영상에서 단어 조회 동작.

---

## 6. 성공 지표
- **기술**: 타입 에러 0 유지, 핵심 파서·타이밍 유틸 테스트 커버리지 확보, 목 데이터 응답 0건, P95 API 응답 < 3s(Gemini 스트리밍 첫 토큰 < 1.5s)
- **제품**: 영상 로드 → 자막 표시 성공률 (업로드 경로 100%, 자동 로딩 경로 측정 후 기준선 수립), 세션당 단어 저장 수, 재방문 시 이어보기 사용률
- **운영**: 키 미설정·업스트림 장애가 로그로 즉시 식별 가능

## 7. 리스크
| 리스크 | 완화 |
|--------|------|
| YouTube 비공식 자막 엔드포인트 변경으로 자동 로딩 파손 | 파일 업로드를 항상 동등 경로로 유지, 실패 시 명확한 안내. 파손 감지 로깅 |
| Gemini 비용·쿼터 남용 (공개 엔드포인트) | rate limit + 입력 길이 상한, Phase 2 이후 인증 사용자 우선 정책 |
| 죽은 코드 삭제 시 회수 못한 아이디어 | 삭제 전 태그(`pre-cleanup`) 생성, SRS 설계는 PRD에 개념 기록됨 |

## 8. 미결 사항 (사용자 확인 필요)
1. **Supabase 도입 시점** — Phase 2로 제안했으나, 처음부터(Phase 1과 병행) 원하면 조정
2. **서비스 대상** — 본인용 도구인지 공개 서비스인지에 따라 rate limit/인증 강도 조정
3. **`docs/` 위치·커밋 정책** — 본 문서는 관례에 따라 저장소에 커밋함. `tasks/` 폴더 병행 기록 여부
4. Phase 3의 SRS 퀴즈 우선순위 — 대시보드보다 먼저 원하는지
