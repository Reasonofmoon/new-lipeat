# LiPeat PRD v2 — LMS 내장 영어 쉐도잉 학습 모듈

- **작성일:** 2026-07-12 (v2 전면 개정 — v1은 독립 워크벤치 전제였음)
- **대상 저장소:** `new-lipeat` (Next.js 15 + React 19 + Tailwind + shadcn/ui, v0 생성)
- **상태:** 사용자 설계 승인 완료 (2026-07-12) — 구현 계획 수립 대기

---

## 1. 제품 정의

**LiPeat은 자체 LMS에 내장되는 영어 쉐도잉(shadowing) 학습 모듈이다.**
교사가 YouTube URL로 클립 과제를 만들고, 학생은 배정된 클립을 문장 카드 단위로
쉐도잉한다: 듣기 → 따라 말하기 → 녹음해서 원음과 비교. 참조 모델은 Cake(문장 카드
반복 학습)와 MediaDict(영상 기반 딕테이션/쉐도잉).

- 독립 서비스가 아니다. 인증·유저 관리·클래스 관리는 LMS의 몫이며, 이 모듈은
  `userId`/`role`을 주입받는 인터페이스로 설계한다.
- 공개 서비스의 일부로 운영된다 — API 방어선(검증·rate limit)은 필수.
- 이 저장소는 모듈의 개발장이다. 최종적으로 LMS 코드베이스에 이식되므로
  `modules/shadowing/` 경계 안에서 자기완결적으로 개발한다.

### 확정된 제품 결정 (2026-07-12 사용자 확인)

| 결정 | 내용 |
|------|------|
| LMS 통합 | 자체 LMS에 내장 모듈. 인증은 LMS가 공급 |
| 콘텐츠 모델 | **교사/운영자 큐레이션** (Cake 방식). 교사가 URL+구간을 골라 과제 배정, 학생은 배정된 클립으로 학습 |
| 발화 피드백 | **녹음 + 원음 교차 비교 청취** (MediaRecorder, 서버 비용 0). STT 자동 채점은 v2 후보 |
| DB | Supabase 사용 안 함. 서버 저장은 **Firebase(Firestore)** |
| 죽은 코드 | 삭제하되 SRS 퀴즈·문장 카드 UX 아이디어는 이식 |

---

## 2. 배경 — 현재 코드 진단 요약

전체 코드베이스(컴포넌트 13개, API 라우트 8개)를 3방향 전수 분석한 결과:

1. **간판 기능이 전부 가짜.** Gemini 라우트 4개는 키가 있어도 목(mock) 데이터만
   반환하고(실제 호출 코드·SDK 자체가 없음), YouTube 자막 가져오기도 항상 목을
   반환한다. 현행 자막 기법(Data API `captions.download`)은 채널 소유자 OAuth가
   필수라 타인 영상엔 원천적으로 불가능 — 기법 교체 필요.
2. **앱이 두 벌.** 실제 렌더되는 `language-learning-app.tsx` 트리와, 어디서도
   import되지 않는 `language-learning-workbench.tsx` 트리(~2,300줄)가 공존.
   크래시 버그 다수가 죽은 트리에 숨어 있다.
3. **품질 게이트 꺼짐.** `next.config.mjs`가 타입 에러·ESLint를 빌드에서 무시,
   테스트 0개. 실재 타입 에러 6~10개가 숨겨진 채 빌드 통과.

발견된 개선점 34건의 전체 목록은 [부록 A](#부록-a--개선점-전체-목록)에 file:line
단위로 보존한다. 본문 로드맵의 수정 항목은 부록 ID(CR-n/HI-n/ME-n/LO-n)를 참조한다.

---

## 3. 사용자와 핵심 스토리

### 학생 (주 사용자)
- S1. 배정받은 클립을 열면 문장 카드 화면이 뜨고, 현재 문장이 크게 보인다.
- S2. 한 문장을 반복(AB 루프) 재생하고, 속도를 0.5×~1×로 조절한다.
- S3. 자막을 표시/블러/숨김 3단계로 바꿔가며 듣기 난이도를 조절한다.
- S4. 카드에서 내 발음을 녹음하고, 원음 ↔ 내 녹음을 번갈아 들으며 비교한다.
- S5. 모르는 단어를 탭하면 정의·예문(Gemini)이 뜨고, 내 표현으로 저장한다.
- S6. 문장을 완료 체크하면 진도가 기록되고 LMS에 반영된다.
- S7. 저장한 표현을 SRS 간격반복 퀴즈로 복습한다.

### 교사 (콘텐츠 제작자)
- T1. YouTube URL을 붙여넣으면 영상과 자막(자동 로드 또는 SRT/VTT 업로드)이 준비된다.
- T2. 자막 에디터로 문장을 분할/병합하고 타이밍을 다듬는다.
- T3. 학습 구간(시작~끝)을 선택해 과제로 발행한다.
- T4. 학생별 진도(문장 완료율)를 확인한다. (상세 대시보드는 LMS 몫 — 모듈은 데이터만 공급)

---

## 4. 기능 요구사항

### 4.1 학생: 쉐도잉 플레이어 (제품의 심장)

| ID | 요구사항 | 비고 |
|----|----------|------|
| SP-1 | 문장 카드 UI: 현재 문장 크게, 앞뒤 문장 흐리게. 카드 스와이프/버튼/키보드로 이동 | Cake 스타일. 죽은 `learning-mode.tsx`의 UX 개념 이식 |
| SP-2 | 문장 단위 AB 루프 (해당 자막 구간 자동 반복) | `video-player.tsx`에 루프 로직 이미 존재 — 개조 |
| SP-3 | 재생 속도 0.5× / 0.75× / 1× | YouTube IFrame API `setPlaybackRate` |
| SP-4 | 자막 3단계: 표시 → 블러(탭하면 잠깐 보임) → 숨김 | |
| SP-5 | 녹음 + 비교: MediaRecorder로 문장별 녹음 → 원음/내 녹음 교차 재생. 녹음은 브라우저 메모리(Blob)만, v1은 서버 업로드 없음 | 마이크 권한 거부 시 녹음 버튼 비활성 + 안내 |
| SP-6 | 단어 탭 → Gemini 사전 팝오버(정의·발음·예문) → "내 표현에 저장" | 영어 대상이므로 공백 split로 충분. CJK 대응(ME-2)은 범위 외 |
| SP-7 | 문장 완료 체크, 클립 진도율 표시, 진도 이벤트 발행 | §5.3 LMS 계약 |
| SP-8 | SRS 복습 퀴즈: 저장 표현을 간격반복(오늘 복습할 카드 → 뜻 맞추기 → 간격 갱신) | 죽은 `vocabulary-manager.tsx`의 SRS 설계 이식, 크래시 버그(CR-5·6, HI-7) 없이 재구현 |

### 4.2 교사: 콘텐츠 스튜디오

| ID | 요구사항 | 비고 |
|----|----------|------|
| TS-1 | YouTube URL 입력 → videoId 파싱·검증(`^[\w-]{11}$`) → 영상 미리보기 | |
| TS-2 | 자막 확보 2경로: ① 자동 로딩(서버사이드 timedtext 계열, 실패 시 정직한 에러) ② SRT/VTT 업로드(1급 경로, 항상 동작 보장) | CR-2 기법 교체. VTT 첫 큐 드롭 버그(ME-10) 수정 |
| TS-3 | 자막 에디터: 문장 분할/병합, 타이밍 시프트/스트레치, 찾아 바꾸기 | 기존 `subtitle-editor.tsx` 재배치 + 버그 수정(HI-4·5·9, ME-3) |
| TS-4 | 학습 구간 선택 → 과제 발행(Firestore 저장) | |
| TS-5 | 과제 목록·수정·보관 | |

### 4.3 공통/서버

| ID | 요구사항 | 비고 |
|----|----------|------|
| CO-1 | Gemini 실연동: `lib/gemini.ts` 공유 클라이언트, 최신 `gemini-2.x` 모델, Zod 입출력 스키마, 단어 정의는 한국인 영어 학습자 맥락 프롬프트 | CR-1 해소. 목 폴백 전면 제거 |
| CO-2 | 모든 API: Zod 입력 검증(길이 상한·enum), 업스트림 타임아웃(AbortController), IP 기반 rate limit | HI-2·3 해소. 실패는 구조화된 4xx/5xx로 |
| CO-3 | 조용한 목 폴백 0개 원칙: 실패하면 실패로 보인다 | HI-2 |

---

## 5. 아키텍처

### 5.1 모듈 경계

```
modules/shadowing/
├── components/
│   ├── player/        # 학생: 문장 카드, 루프 컨트롤, 녹음 비교, 단어 팝오버
│   ├── studio/        # 교사: URL 입력, 자막 에디터, 과제 발행
│   └── review/        # SRS 복습 퀴즈
├── lib/
│   ├── gemini.ts      # Gemini 공유 클라이언트 (서버 전용)
│   ├── subtitles/     # SRT/VTT 파서, 타이밍 유틸 (순수 함수 — 테스트 대상 1순위)
│   ├── srs.ts         # 간격반복 알고리즘 (순수 함수)
│   └── storage/       # 저장소 인터페이스 + Firestore 어댑터
├── hooks/             # useYouTubePlayer, useRecorder, useSentenceLoop
└── types.ts           # Assignment, Sentence, VocabEntry, Progress (단일 정의)
```

- 이 저장소의 `app/`은 모듈을 감싸는 **개발용 셸**(교사/학생 화면 라우트 + API 라우트)로만 쓴다. LMS 이식 시 `modules/shadowing/`을 통째로 옮긴다.
- 현재 코드의 타입 중복(ME-9: `VocabularyItem` 2벌, `UserProfile` 3벌)은 `types.ts` 단일 정의로 청산.

### 5.2 데이터 (Firebase Firestore)

교사가 만든 과제를 학생이 받아야 하므로 서버 저장은 필수 — Firebase를 Phase 2 핵심에 포함한다.

```
assignments/{id}:   { videoId, title, range, sentences[{start,end,text}], createdBy, status }
progress/{uid}/clips/{assignmentId}:  { completedSentences[], completedAt?, updatedAt }
vocabulary/{uid}/entries/{id}:        { word, definition, example, sourceAssignmentId, createdAt }
srsReviews/{uid}/cards/{entryId}:     { interval, easeFactor, nextReviewAt, streak }
```

- 개발용 셸에서는 Firebase 익명 인증으로 `uid` 확보. LMS 이식 시 LMS 세션의 `userId`로 치환 (storage 인터페이스가 `uid`를 매개변수로 받아 결합 차단).
- 보안 규칙: `progress/vocabulary/srsReviews`는 본인 `uid`만 읽기/쓰기, `assignments`는 교사 role만 쓰기.
- 녹음 Blob은 v1에서 저장하지 않는다. 교사 제출용 업로드(Firebase Storage)는 v2 후보.

### 5.3 LMS 통합 계약

```ts
// Module input — what the LMS supplies
interface ShadowingModuleProps {
  userId: string
  role: "student" | "teacher"
  assignmentId?: string        // deep-link into a specific clip
  onEvent?: (e: ProgressEvent) => void
}
// Events the module emits toward the LMS
type ProgressEvent =
  | { type: "sentence_completed"; assignmentId: string; sentenceIndex: number }
  | { type: "clip_completed"; assignmentId: string }
  | { type: "vocab_saved"; word: string }
```

### 5.4 기존 코드 처분 맵

| 처분 | 대상 | 근거 |
|------|------|------|
| 유지·개조 | `video-player.tsx` | 루프·속도·자막 동기화 이미 구현. 블랙아웃 버그(CR-4)·리렌더 폭풍(ME-1) 수정 후 플레이어 코어로 |
| 유지·개조 | `subtitle-editor.tsx` | 교사 스튜디오로 재배치. HI-4·5·9, ME-3 수정 |
| 유지·개조 | `subtitle-uploader.tsx` | TS-2의 업로드 경로. ME-10 수정, 데모 자막 탭 제거 |
| 재작성 | `app/api/gemini/*` | 목 → 실연동 (CO-1). 4개 라우트를 word-info·explain 2개로 통합 |
| 재작성 | `app/api/youtube/captions`, `app/api/subtitles` | 중복 해소, timedtext 계열 기법으로 교체 |
| 아이디어 이식 | `vocabulary-manager.tsx`(SRS 설계), `learning-mode.tsx`(문장 카드 UX) | 코드는 삭제, 개념은 SP-1·SP-8로 |
| 삭제 | `language-learning-workbench.tsx`, `ai-assistant.tsx`, `media-uploader.tsx`, `keyboard-shortcuts-modal.tsx`, `learning-dashboard.tsx`, `vocabulary-list.tsx`, `styles/` | 죽은 트리 + LMS가 대체하는 대시보드 + 새 설계로 대체되는 단어장 UI |

---

## 6. 로드맵

### Phase 0 — 대청소와 모듈 스캐폴드 (약 1주) `chore/fix`
1. 처분 맵의 "삭제" 대상 제거 (삭제 전 `pre-cleanup` 태그) — CR-3·5·6, HI-1, ME-7 해소
2. `ignoreBuildErrors`/`ignoreDuringBuilds` 해제 → 드러나는 타입 에러 수정 (CR-7)
3. lockfile 단일화(pnpm), 미사용 의존성 제거(ME-5), 브랜딩(`lipeat`, `<html lang="ko">`) (HI-10, LO-1·2)
4. `.env.example` + 키 미설정 경고 로그 (LO-3), `app/error.tsx`·`loading.tsx`·`not-found.tsx` (ME-4)
5. `modules/shadowing/` 스캐폴드 + `types.ts` 단일 타입 정의 (ME-9)
6. Vitest 도입, 자막 파서·타이밍 유틸 테스트 시드 (ME-11)

**완료 기준:** `npx tsc --noEmit` 0 에러, 게이트 켠 채 `next build` 성공, 도달 불가 코드 0줄.

### Phase 1 — 학생 쉐도잉 플레이어 코어 (약 2~3주) `feat`
1. 문장 카드 UI + 카드 이동 (SP-1)
2. AB 루프·속도·자막 3단계 (SP-2·3·4) — 플레이어 버그 수정 포함 (CR-4, ME-1, `window.YT` 가드)
3. 녹음 + 원음 교차 비교 (SP-5, `useRecorder` 훅)
4. 자막 공급: 업로드 경로(SRT/VTT, ME-10 수정)와 데이터 파일로 — 이 단계에선 과제 배정 없이 개발 셸에서 클립 학습이 끝까지 동작
5. 진도 이벤트 발행 골격 (SP-7, 저장은 localStorage 어댑터)

**완료 기준:** 개발 셸에서 클립 하나를 문장 카드로 끝까지 쉐도잉(루프·속도·자막 토글·녹음 비교) 가능.

### Phase 2 — 교사 스튜디오 + Firebase + AI 실연동 (약 2~3주) `feat`
1. Firestore 도입: 스키마(§5.2), 보안 규칙, storage 어댑터 교체(localStorage → Firestore)
2. 교사 스튜디오: URL 입력 → 자막 확보(TS-1·2) → 에디터(TS-3, 버그 수정) → 과제 발행(TS-4·5)
3. YouTube 자막 자동 로딩 재구축 (CR-2 기법 교체) — 실패 시 "업로드하세요" 정직한 안내
4. Gemini 실연동 + 단어 팝오버·표현 저장 (CO-1, SP-6)
5. API 방어선 전면 적용 (CO-2·3, HI-2·3)

**완료 기준:** 교사가 URL로 과제를 만들고 학생 계정이 그 과제를 받아 학습·진도 기록. 목 응답 경로 0개.

### Phase 3 — SRS 복습 + LMS 통합 마감 (약 2주) `feat`
1. SRS 복습 퀴즈 (SP-8) — `lib/srs.ts` 순수 함수 + 테스트
2. LMS 통합 계약 확정·문서화 (§5.3) + 임베드 스모크 테스트
3. 접근성 1차: 카드·단어·컨트롤 키보드 조작 (LO-4)
4. README 전면 재작성 (LO-5), 진도 데이터 교사 노출(T4)

**완료 기준:** 표현 저장 → 다음날 복습 큐 등장 → 퀴즈 완료 → 간격 갱신 사이클 동작. LMS 이식 문서 완비.

---

## 7. 성공 지표
- **기술:** 타입 에러 0 유지, 자막 파서·타이밍·SRS 순수 함수 테스트 커버리지, 목 응답 0건, Gemini 단어 조회 P95 < 2s
- **학습 경험:** 클립 완주율(배정 대비), 문장당 평균 반복 횟수, 녹음 비교 사용률, 세션당 표현 저장 수, SRS 복습 복귀율(D+1)
- **운영:** 자막 자동 로딩 성공률 측정(기준선 수립), 키 미설정·업스트림 장애 로그 즉시 식별

## 8. 리스크

| 리스크 | 완화 |
|--------|------|
| YouTube 비공식 자막 엔드포인트 변경 | 업로드를 항상 동등한 1급 경로로 유지, 파손 감지 로깅, 교사에게 명확한 대체 안내 |
| YouTube 임베드 불가 영상(퍼가기 금지) | 과제 발행 시점에 임베드 가능 여부 검사 후 차단 |
| iOS Safari MediaRecorder 제약 | 녹음 포맷 감지(`isTypeSupported`), 미지원 시 녹음만 비활성·나머지 학습은 정상 |
| 공개 엔드포인트 Gemini 비용 남용 | rate limit + 입력 상한, Firebase 인증 uid 기반 쿼터 |
| LMS 이식 시 결합 발견 | `modules/shadowing/` 경계 밖 import 금지 규칙, props 주입 계약(§5.3) 준수 |

## 9. 비목표 (v1)
- STT 발음 자동 채점 (v2 후보 — Web Speech API/Whisper)
- 녹음 파일 서버 제출·교사 첨삭 (v2 후보)
- 학생의 자유 URL 입력 학습 (큐레이션 모델 확정에 따라 제외)
- 다국어 UI(i18n), CJK 단어 분할 — 영어 학습 모듈이므로 불필요
- LMS 본체 기능(클래스·인증·대시보드)

---

## 부록 A — 개선점 전체 목록

3방향 전수 분석(컴포넌트/API/아키텍처)에서 발견된 34건. 처분 맵(§5.4)에 따라
"삭제" 대상 파일의 버그는 삭제로 해소되고, 유지 대상의 버그는 로드맵 단계에 배정됨.

### Critical

| ID | 위치 | 문제 | 해소 |
|----|------|------|------|
| CR-1 | `app/api/gemini/{generate,translate,translate-batch,word-info}/route.ts:21-26` | Gemini 미호출 — 키가 있어도 목 반환. SDK 의존성조차 없음 | Phase 2 |
| CR-2 | `app/api/youtube/captions/route.ts:49-57,292-296` | 캡션을 찾아도 목 반환, 파서는 빈 함수. 기법 자체(OAuth 필수)가 타인 영상에 불가능 | Phase 2 (기법 교체) |
| CR-3 | `components/ai-assistant.tsx:46,74,127,155` | 존재하지 않는 `/api/lilys` 호출 — 전 기능 404 | Phase 0 (삭제) |
| CR-4 | `components/video-player.tsx:69-103` | `window.YT` 기로드 가드 없음 → 두 번째 영상부터 플레이어 영구 블랙아웃 | Phase 1 |
| CR-5 | `components/vocabulary-manager.tsx:60-84` | useState 선언 전 dep 배열 참조(TDZ) → 마운트 즉시 throw | Phase 0 (삭제) |
| CR-6 | `components/vocabulary-manager.tsx:187-270` | 퀴즈 중 배열 축소 + 인덱스 증가 → `undefined.word` 크래시 | Phase 0 (삭제, SRS 재구현 시 회피) |
| CR-7 | `next.config.mjs:4,7` | 타입·린트 빌드 게이트 꺼짐 — 에러 은폐 | Phase 0 |

### High

| ID | 위치 | 문제 | 해소 |
|----|------|------|------|
| HI-1 | `language-learning-workbench.tsx` + 전용 자식 5개 | ~2,300줄 도달 불가 코드, 숨은 타입 에러 다수(`ui/avatar` 부재 import 등) | Phase 0 (삭제) |
| HI-2 | `app/api/youtube/{search,video,captions}` catch | 모든 실패를 HTTP 200 + 목으로 은폐 | Phase 2 |
| HI-3 | `app/api/**` 전체 | 입력 검증·rate limit·타임아웃 전무 | Phase 2 |
| HI-4 | `subtitle-editor.tsx:522` | 괄호 제거 정규식이 `/$$.*?$$/g`(이스케이프 손상) — 무동작 | Phase 2 |
| HI-5 | `subtitle-editor.tsx:364` | raw 사용자 입력 `new RegExp()` — 정규식 인젝션 크래시 | Phase 2 |
| HI-6 | `vocabulary-list.tsx:42-48` | 품사 필터 로직 역전 — 필터 무효 | Phase 0 (삭제) |
| HI-7 | `vocabulary-manager.tsx:192-218` | 얕은 복사 후 상태 직접 변이 — SRS 계산 오염 | Phase 0 (삭제, 재구현 시 회피) |
| HI-8 | `language-learning-app.tsx:65-69` | `length > 0`일 때만 저장 — 마지막 단어 삭제가 부활 | Phase 1 (storage 어댑터로 대체) |
| HI-9 | `subtitle-editor.tsx:88-90` | dirty 체크 없이 편집 상태 리셋 — 작업 소실 | Phase 2 |
| HI-10 | 저장소 루트 | 이중 lockfile — 설치 비결정성(배포 사고 이력 있음) | Phase 0 |

### Medium

| ID | 위치 | 문제 | 해소 |
|----|------|------|------|
| ME-1 | `video-player.tsx:123-153,432-497` | 100ms 인터벌 리렌더 폭풍 + keydown 리스너 초당 10회 재부착 | Phase 1 |
| ME-2 | `video-player.tsx:417-429` | 공백 split 단어 분할 — CJK 무용 | 비목표 (영어 전용) |
| ME-3 | `subtitle-editor.tsx:872` | `querySelector("textarea")` — 엉뚱한 textarea 커서 사용 | Phase 2 |
| ME-4 | `app/` 전반 | error/loading/not-found·에러 바운더리 전무 | Phase 0 |
| ME-5 | `package.json` | 미사용 Radix 16개 + v0 잔재 의존성 다수 | Phase 0 |
| ME-6 | `layout.tsx` | ThemeProvider 미장착 — 다크모드 죽은 코드 | Phase 0 (토큰 정리) |
| ME-7 | `styles/globals.css` | `app/globals.css`와 완전 중복 | Phase 0 (삭제) |
| ME-8 | `app/api/**` | 목 유틸·보일러플레이트 라우트마다 복붙 | Phase 2 (라우트 재작성으로 해소) |
| ME-9 | 타입 전반 | `VocabularyItem` 2벌, `UserProfile` 3벌, `Player: any` | Phase 0 (`types.ts` 단일화) |
| ME-10 | `subtitle-uploader.tsx:190-245` | VTT 00:00 시작 큐 텍스트 드롭, NOTE 미지원 | Phase 1 |
| ME-11 | 저장소 전체 | 테스트 0개 | Phase 0 (Vitest 시드) |

### Low

| ID | 위치 | 문제 | 해소 |
|----|------|------|------|
| LO-1 | `package.json:2`, `layout.tsx:7-10` | `"my-v0-project"`, `"v0 App"` 브랜딩 미적용 | Phase 0 |
| LO-2 | `layout.tsx:19` | `lang="en"`인데 UI는 한국어 | Phase 0 |
| LO-3 | 저장소 루트 | `.env.example` 없음, 키 미설정 무경고 | Phase 0 |
| LO-4 | `video-player.tsx:419-427` 등 | 클릭 요소 키보드/스크린리더 불가 | Phase 3 |
| LO-5 | `README.md` | 없는 기능을 사실처럼 기술 | Phase 3 |
| LO-6 | `next.config.mjs:10` | `images.unoptimized: true` | Phase 0 |
