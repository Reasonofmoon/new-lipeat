# Phase 0: Cleanup & Module Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete the dead code tree, restore build quality gates, unify tooling, and scaffold the `modules/shadowing/` boundary with tested subtitle parsers — per PRD Phase 0 (`docs/superpowers/specs/2026-07-12-lipeat-improvement-prd.md`).

**Architecture:** The repo is a Next.js 15 App Router project. The only live tree is `app/page.tsx → components/language-learning-app.tsx` (Tabs: dashboard/search/player/editor/vocabulary). We delete the unreachable "workbench" tree plus the dashboard/vocabulary tabs (replaced later by LMS / new SRS design), turn build gates back on, and extract subtitle parsing into `modules/shadowing/lib/subtitles/` as pure functions with Vitest coverage.

**Tech Stack:** Next.js 15.2.4, React 19, TypeScript strict, Tailwind 3, shadcn/ui (Radix), pnpm, Vitest.

## Global Constraints

- TypeScript strict mode; `any` 금지 (user CLAUDE.md)
- ESM only; ESLint/타입 체크는 항상 통과 상태 유지
- Commit messages: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`)
- 한 번에 하나의 논리적 변경만 커밋; 매 태스크 끝에 `npx tsc --noEmit`
- Package manager: **pnpm only** (this plan deletes `package-lock.json`)
- Code comments in English; UI copy in Korean
- Working dir: `C:\Users\sound\Development\new-lipeat\new-lipeat` (모든 경로는 이 기준 상대 경로)
- All commands run in PowerShell-compatible form unless bash-only noted

---

### Task 1: Safety tag + delete the dead tree

The workbench tree (~2,300 lines) is unreachable from `app/page.tsx` and contains crash bugs (PRD CR-3·5·6, HI-1). The live app's dashboard/vocabulary tabs are also retired (LMS dashboard replaces one; Phase 3 SRS redesign replaces the other).

**Files:**
- Delete: `components/language-learning-workbench.tsx`, `components/learning-mode.tsx`, `components/ai-assistant.tsx`, `components/vocabulary-manager.tsx`, `components/media-uploader.tsx`, `components/keyboard-shortcuts-modal.tsx`, `components/learning-dashboard.tsx`, `components/vocabulary-list.tsx`, `components/theme-provider.tsx`, `styles/` (whole dir)
- Modify: `components/language-learning-app.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `components/language-learning-app.tsx` keeps exporting `VideoInfo`, `SubtitleItem`, `VocabularyItem` types and the default component — `video-player.tsx`, `subtitle-editor.tsx`, `subtitle-uploader.tsx`, `video-search.tsx` depend on these and must keep compiling.

- [ ] **Step 1: Create the safety tag**

```bash
git tag pre-cleanup
```

- [ ] **Step 2: Delete the dead files**

```bash
git rm components/language-learning-workbench.tsx components/learning-mode.tsx components/ai-assistant.tsx components/vocabulary-manager.tsx components/media-uploader.tsx components/keyboard-shortcuts-modal.tsx components/learning-dashboard.tsx components/vocabulary-list.tsx components/theme-provider.tsx
git rm -r styles
```

- [ ] **Step 3: Remove retired tabs from the live app**

In `components/language-learning-app.tsx`:

Remove these two imports (lines 9-10):

```tsx
import { LearningDashboard } from "@/components/learning-dashboard"
import { VocabularyList } from "@/components/vocabulary-list"
```

Change the TabsList (line 180) from `grid-cols-5` to `grid-cols-3` and delete the two triggers:

```tsx
<TabsList className="grid grid-cols-3 mb-4">
  <TabsTrigger value="search">영상 검색</TabsTrigger>
  <TabsTrigger value="player" disabled={!selectedVideo}>
    영상 플레이어
  </TabsTrigger>
  <TabsTrigger value="editor" disabled={!selectedVideo || subtitles.length === 0}>
    자막 편집기
  </TabsTrigger>
</TabsList>
```

Delete the two TabsContent blocks (lines 192-194 and 245-252):

```tsx
<TabsContent value="dashboard">
  <LearningDashboard savedVocabulary={savedVocabulary} onVideoSelect={handleVideoSelect} />
</TabsContent>
```

```tsx
<TabsContent value="vocabulary">
  <VocabularyList
    vocabulary={savedVocabulary}
    onVocabularyUpdate={setSavedVocabulary}
    learningLanguage={learningLanguage}
    nativeLanguage={nativeLanguage}
  />
</TabsContent>
```

Keep `savedVocabulary`, `handleSaveVocabulary`, and the localStorage effects — `VideoPlayer` still uses `onSaveVocabulary`.

- [ ] **Step 4: Verify nothing references the deleted files**

```bash
grep -rn "learning-dashboard\|vocabulary-list\|vocabulary-manager\|learning-mode\|ai-assistant\|media-uploader\|keyboard-shortcuts\|workbench\|theme-provider" app components hooks lib types
```

Expected: no output. (If `theme-provider` matches in `app/layout.tsx`, that grep hit must be investigated — as of writing, layout does NOT import it.)

- [ ] **Step 5: Install deps and typecheck**

```bash
pnpm install
npx tsc --noEmit
```

Expected: errors MAY appear (they were previously hidden by `ignoreBuildErrors`) but only in files we still own. Record them; the known one (`Alert variant="warning"`) is fixed in Task 2. If errors appear in just-deleted files, the deletion is incomplete.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: delete unreachable workbench tree and retired tabs"
```

---

### Task 2: Restore build gates and fix revealed type errors

**Files:**
- Modify: `next.config.mjs`
- Modify: `components/language-learning-app.tsx:204`

**Interfaces:**
- Consumes: Task 1's cleaned tree
- Produces: a repo where `next build` fails on type/lint errors — every later task relies on this gate.

- [ ] **Step 1: Turn the gates on**

Replace the whole `next.config.mjs` with:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {}

export default nextConfig
```

(This also removes `images.unoptimized: true` — PRD LO-6.)

- [ ] **Step 2: Fix the known type error**

`components/language-learning-app.tsx:204` — the shadcn Alert only defines `default | destructive` variants:

```tsx
// Before
<Alert variant="warning" className="mb-4">
// After
<Alert className="mb-4">
```

- [ ] **Step 3: Run the full typecheck and fix any remaining errors**

```bash
npx tsc --noEmit
```

Expected: PASS (0 errors). If other errors surface, fix them in the file they occur — do not re-suppress. Known-safe patterns: unused imports (delete them), implicit `any` in callbacks (add the parameter type from the surrounding context).

- [ ] **Step 4: Verify the production build passes with gates on**

```bash
pnpm build
```

Expected: `✓ Compiled successfully` with lint + type checking enabled.

- [ ] **Step 5: Commit**

```bash
git add next.config.mjs components/language-learning-app.tsx
git commit -m "fix: enable type and lint build gates, fix Alert variant error"
```

---

### Task 3: Unify lockfile, prune dependencies, apply branding

**Files:**
- Delete: `package-lock.json`
- Modify: `package.json`, `app/layout.tsx`

**Interfaces:**
- Consumes: Task 2's green build
- Produces: `package.json` name `"lipeat"`; pnpm as the only package manager. Later tasks run `pnpm` commands against this state.

- [ ] **Step 1: Delete the npm lockfile**

```bash
git rm package-lock.json
```

- [ ] **Step 2: Verify which Radix packages are actually imported**

```bash
grep -rhn "@radix-ui/react-" components app --include="*.tsx" | grep -o "@radix-ui/react-[a-z-]*" | sort -u
```

Expected output (exactly these 11):

```
@radix-ui/react-dialog
@radix-ui/react-label
@radix-ui/react-progress
@radix-ui/react-scroll-area
@radix-ui/react-select
@radix-ui/react-slider
@radix-ui/react-slot
@radix-ui/react-switch
@radix-ui/react-tabs
@radix-ui/react-toast
@radix-ui/react-tooltip
```

If the output differs, adjust Step 3's removal list so that every package in the output is KEPT.

- [ ] **Step 3: Remove unused dependencies**

```bash
pnpm remove @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-radio-group @radix-ui/react-separator @radix-ui/react-toggle @radix-ui/react-toggle-group embla-carousel-react react-day-picker input-otp vaul cmdk recharts react-resizable-panels react-hook-form @hookform/resolvers date-fns sonner next-themes
```

Keep `zod` (Phase 2 API validation) and `@vercel/analytics`, `geist`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`, `autoprefixer`.

- [ ] **Step 4: Rename the package**

In `package.json`:

```json
{
  "name": "lipeat",
  "version": "0.1.0",
```

- [ ] **Step 5: Apply branding + Korean lang to the layout**

In `app/layout.tsx`, replace the metadata block and the `html` tag:

```tsx
export const metadata: Metadata = {
  title: "LiPeat — 영어 쉐도잉 학습",
  description: "영상 기반 영어 쉐도잉 학습 모듈",
}
```

```tsx
<html lang="ko">
```

(Delete the `generator: 'v0.app'` line entirely.)

- [ ] **Step 6: Verify install and build**

```bash
pnpm install
npx tsc --noEmit
pnpm build
```

Expected: all PASS. If a removed package breaks the build, a `components/ui/*` wrapper imports it — restore only that package and note it.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: unify to pnpm, prune unused deps, apply lipeat branding"
```

---

### Task 4: `.env.example` and missing-key warning

**Files:**
- Create: `.env.example`
- Create: `lib/env.ts`
- Modify: `app/api/youtube/search/route.ts`, `app/api/youtube/video/route.ts`, `app/api/youtube/captions/route.ts` (key lookup line only)

**Interfaces:**
- Consumes: nothing new
- Produces: `getServerEnv(key: "GEMINI_API_KEY" | "YOUTUBE_API_KEY"): string | undefined` — Phase 2 route rewrites will reuse this.

- [ ] **Step 1: Create `.env.example`**

```bash
# .env.example — copy to .env.local and fill in
# YouTube Data API v3 key (search, video metadata, caption track listing)
YOUTUBE_API_KEY=

# Google Gemini API key (word definitions, sentence explanations) — wired in Phase 2
GEMINI_API_KEY=
```

- [ ] **Step 2: Create `lib/env.ts`**

```ts
type ServerEnvKey = "GEMINI_API_KEY" | "YOUTUBE_API_KEY"

const warned = new Set<ServerEnvKey>()

/** Read a server-side env var, warning once per process when it is missing. */
export function getServerEnv(key: ServerEnvKey): string | undefined {
  const value = process.env[key]
  if (!value && !warned.has(key)) {
    warned.add(key)
    console.warn(`[env] ${key} is not set — related features will not work. See .env.example`)
  }
  return value
}
```

- [ ] **Step 3: Wire it into the three YouTube routes**

In each of `app/api/youtube/{search,video,captions}/route.ts`, add the import and replace the key lookup:

```ts
import { getServerEnv } from "@/lib/env"
// Before:
const apiKey = process.env.YOUTUBE_API_KEY
// After:
const apiKey = getServerEnv("YOUTUBE_API_KEY")
```

(The Gemini mock routes are rewritten wholesale in Phase 2 — leave them.)

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .env.example lib/env.ts app/api/youtube
git commit -m "feat: add .env.example and warn-once env helper"
```

---

### Task 5: App Router error/loading/not-found pages

**Files:**
- Create: `app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: standard App Router convention files; no other task depends on their internals.

- [ ] **Step 1: Create `app/error.tsx`**

```tsx
"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-bold">문제가 발생했습니다</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>다시 시도</Button>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/loading.tsx`**

```tsx
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}
```

- [ ] **Step 3: Create `app/not-found.tsx`**

```tsx
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-bold">페이지를 찾을 수 없습니다</h2>
      <Link href="/" className="text-sm underline">
        홈으로 돌아가기
      </Link>
    </div>
  )
}
```

- [ ] **Step 4: Typecheck and commit**

```bash
npx tsc --noEmit
git add app/error.tsx app/loading.tsx app/not-found.tsx
git commit -m "feat: add App Router error, loading, and not-found pages"
```

---

### Task 6: Vitest setup + `modules/shadowing` scaffold + parser extraction (TDD)

Extract the SRT/VTT/TXT parsers out of `subtitle-uploader.tsx` into pure functions under the module boundary, driven by tests. Behavior is preserved verbatim in this phase — the known VTT first-cue bug (PRD ME-10) is documented as `test.todo` and fixed in Phase 1.

**Files:**
- Create: `modules/shadowing/types.ts`, `modules/shadowing/lib/subtitles/parse.ts`, `modules/shadowing/lib/subtitles/parse.test.ts`, `vitest.config.ts`
- Modify: `package.json` (test script), `components/language-learning-app.tsx` (re-export types), `components/subtitle-uploader.tsx` (use extracted parsers)

**Interfaces:**
- Consumes: `SubtitleItem` shape currently defined in `components/language-learning-app.tsx:22-30`
- Produces:
  - `modules/shadowing/types.ts`: `interface Subtitle { id: string; startTime: number; endTime: number; text: string; translation?: string; notes?: string; vocabularyItems?: VocabEntry[] }`, `interface VocabEntry { id: string; word: string; definition: string; translation: string; examples: string[]; partOfSpeech: string }`, `interface VideoInfo { videoId: string; title: string; thumbnailUrl: string; channelTitle: string }`
  - `modules/shadowing/lib/subtitles/parse.ts`: `parseSrt(content: string): Subtitle[]`, `parseVtt(content: string): Subtitle[]`, `parseTxt(content: string): Subtitle[]`, `srtTimeToSeconds(t: string): number`, `vttTimeToSeconds(t: string): number`
  - Phase 1+ tasks import from these paths.

- [ ] **Step 1: Install and configure Vitest**

```bash
pnpm add -D vitest
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    include: ["modules/**/*.test.ts", "lib/**/*.test.ts"],
  },
})
```

- [ ] **Step 2: Create the module types**

Create `modules/shadowing/types.ts`:

```ts
// Single source of truth for shadowing-module domain types.
// The LMS integration contract (userId/role props) is added in Phase 3.

export interface VideoInfo {
  videoId: string
  title: string
  thumbnailUrl: string
  channelTitle: string
}

export interface VocabEntry {
  id: string
  word: string
  definition: string
  translation: string
  examples: string[]
  partOfSpeech: string
}

export interface Subtitle {
  id: string
  startTime: number
  endTime: number
  text: string
  translation?: string
  notes?: string
  vocabularyItems?: VocabEntry[]
}
```

- [ ] **Step 3: Write the failing parser tests**

Create `modules/shadowing/lib/subtitles/parse.test.ts`:

```ts
import { describe, expect, it, test } from "vitest"
import { parseSrt, parseVtt, parseTxt, srtTimeToSeconds, vttTimeToSeconds } from "./parse"

describe("srtTimeToSeconds", () => {
  it("converts hh:mm:ss,mmm to seconds", () => {
    expect(srtTimeToSeconds("00:00:01,500")).toBe(1.5)
    expect(srtTimeToSeconds("01:02:03,250")).toBe(3723.25)
  })
})

describe("vttTimeToSeconds", () => {
  it("converts hh:mm:ss.mmm to seconds", () => {
    expect(vttTimeToSeconds("00:00:01.500")).toBe(1.5)
  })
})

describe("parseSrt", () => {
  it("parses a two-cue SRT file", () => {
    const srt = `1
00:00:01,000 --> 00:00:05,000
Hello world.

2
00:00:06,000 --> 00:00:10,000
Second line
continues here.`
    const result = parseSrt(srt)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ id: "1", startTime: 1, endTime: 5, text: "Hello world." })
    expect(result[1].text).toBe("Second line continues here.")
  })

  it("skips malformed blocks", () => {
    expect(parseSrt("garbage without timing")).toHaveLength(0)
  })
})

describe("parseVtt", () => {
  it("parses cues after the WEBVTT header", () => {
    const vtt = `WEBVTT

00:00:01.000 --> 00:00:04.000
First cue.

00:00:05.000 --> 00:00:08.000
Second cue.`
    const result = parseVtt(vtt)
    expect(result).toHaveLength(2)
    expect(result[0].startTime).toBe(1)
    expect(result[0].text).toBe("First cue.")
  })

  // Known bug ME-10 (PRD appendix): a cue starting exactly at 00:00:00.000
  // loses its text because the accumulator guards on currentStartTime > 0.
  // Behavior is preserved in Phase 0; the fix lands in Phase 1.
  test.todo("keeps the text of a cue starting at 00:00:00.000 (ME-10, Phase 1)")
})

describe("parseTxt", () => {
  it("assigns 3-second windows per non-empty line", () => {
    const result = parseTxt("line one\n\nline two")
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ startTime: 0, endTime: 3, text: "line one" })
    expect(result[1]).toMatchObject({ startTime: 6, endTime: 9, text: "line two" })
  })
})
```

- [ ] **Step 4: Run tests to verify they fail**

```bash
pnpm test
```

Expected: FAIL — `Cannot find module './parse'` (or equivalent resolve error).

- [ ] **Step 5: Create the parser module**

Create `modules/shadowing/lib/subtitles/parse.ts` — logic copied verbatim from `components/subtitle-uploader.tsx:157-286` (behavior-preserving extraction; only names and types change):

```ts
import type { Subtitle } from "../../types"

/** Convert SRT time format (00:00:00,000) to seconds. */
export function srtTimeToSeconds(timeString: string): number {
  const [time, milliseconds] = timeString.split(",")
  const [hours, minutes, seconds] = time.split(":").map(Number)
  return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000
}

/** Convert VTT time format (00:00:00.000) to seconds. */
export function vttTimeToSeconds(timeString: string): number {
  const [time, milliseconds] = timeString.split(".")
  const [hours, minutes, seconds] = time.split(":").map(Number)
  return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000
}

export function parseSrt(content: string): Subtitle[] {
  const subtitles: Subtitle[] = []
  const blocks = content.trim().split(/\r?\n\r?\n/)

  for (const block of blocks) {
    const lines = block.split(/\r?\n/)
    if (lines.length < 3) continue

    const id = lines[0].trim()
    const timeRange = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/)
    if (!timeRange) continue

    subtitles.push({
      id,
      startTime: srtTimeToSeconds(timeRange[1]),
      endTime: srtTimeToSeconds(timeRange[2]),
      text: lines.slice(2).join(" "),
    })
  }

  return subtitles
}

export function parseVtt(content: string): Subtitle[] {
  const subtitles: Subtitle[] = []
  const lines = content.trim().split(/\r?\n/)

  let currentId = ""
  let currentStartTime = 0
  let currentEndTime = 0
  let currentText = ""
  let index = 0

  // Skip everything before the first cue timing line (WEBVTT header etc.)
  let i = 0
  while (i < lines.length && !lines[i].includes("-->")) {
    i++
  }

  for (; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line === "") {
      if (currentText) {
        subtitles.push({
          id: currentId || String(index++),
          startTime: currentStartTime,
          endTime: currentEndTime,
          text: currentText.trim(),
        })
        currentText = ""
      }
    } else if (line.includes("-->")) {
      const timeRange = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/)
      if (timeRange) {
        currentStartTime = vttTimeToSeconds(timeRange[1])
        currentEndTime = vttTimeToSeconds(timeRange[2])
        currentId = String(index)
      }
    } else if (currentStartTime > 0) {
      // NOTE: drops text for cues starting at exactly 0 — known bug ME-10, fixed in Phase 1
      currentText += (currentText ? " " : "") + line
    }
  }

  if (currentText) {
    subtitles.push({
      id: currentId || String(index),
      startTime: currentStartTime,
      endTime: currentEndTime,
      text: currentText.trim(),
    })
  }

  return subtitles
}

/** Parse plain text: one subtitle per non-empty line, 3-second windows. */
export function parseTxt(content: string): Subtitle[] {
  const subtitles: Subtitle[] = []
  const lines = content.trim().split(/\r?\n/)
  const durationPerLine = 3

  lines.forEach((line, index) => {
    if (line.trim()) {
      const startTime = index * durationPerLine
      subtitles.push({
        id: String(index + 1),
        startTime,
        endTime: startTime + durationPerLine,
        text: line.trim(),
      })
    }
  })

  return subtitles
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
pnpm test
```

Expected: PASS (6 passed, 1 todo).

Note on `parseTxt` expectations: the source implementation computes `startTime = index * durationPerLine` from the ORIGINAL line index, so the blank line in the test fixture creates the 6-second start for "line two" — the test above encodes the real current behavior.

- [ ] **Step 7: Re-point the app types to the module**

In `components/language-learning-app.tsx`, replace the three inline interface declarations (lines 15-39) with re-exports so all existing importers (`video-player.tsx`, `subtitle-editor.tsx`, `subtitle-uploader.tsx`, `video-search.tsx`) keep working:

```tsx
import type { Subtitle, VideoInfo, VocabEntry } from "@/modules/shadowing/types"

export type { VideoInfo }
export type SubtitleItem = Subtitle
export type VocabularyItem = VocabEntry
```

(Keep the rest of the component unchanged; the shapes are identical so no other edits are needed.)

- [ ] **Step 8: Use the extracted parsers in the uploader**

In `components/subtitle-uploader.tsx`:

Add the import:

```tsx
import { parseSrt, parseVtt, parseTxt } from "@/modules/shadowing/lib/subtitles/parse"
```

In `handleFileUpload` (lines 49-55), swap the call sites:

```tsx
if (fileExtension === "srt") {
  parsedSubtitles = parseSrt(fileContent)
} else if (fileExtension === "vtt") {
  parsedSubtitles = parseVtt(fileContent)
} else if (fileExtension === "txt") {
  parsedSubtitles = parseTxt(fileContent)
}
```

Delete the now-dead inline functions `parseSrtSubtitles`, `parseVttSubtitles`, `parseTxtSubtitles`, `convertSrtTimeToSeconds`, `convertVttTimeToSeconds` (lines 156-286).

- [ ] **Step 9: Full gate check**

```bash
npx tsc --noEmit
pnpm test
pnpm build
```

Expected: all PASS.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "refactor: extract subtitle parsers into modules/shadowing with tests"
```

---

### Task 7: Phase 0 exit verification

**Files:** none (verification only)

**Interfaces:**
- Consumes: everything above
- Produces: the Phase 0 done-state the PRD requires: 0 type errors, gated build green, unreachable code 0 lines.

- [ ] **Step 1: Run the full gate suite**

```bash
npx tsc --noEmit
pnpm test
pnpm build
```

Expected: all PASS.

- [ ] **Step 2: Verify no unreachable component remains**

```bash
ls components
```

Expected remaining files: `language-learning-app.tsx`, `subtitle-editor.tsx`, `subtitle-uploader.tsx`, `video-player.tsx`, `video-search.tsx`, `ui/` — nothing else.

- [ ] **Step 3: Smoke-run the dev server**

Start `pnpm dev`, open `http://localhost:3000`, and confirm: 3 tabs render (영상 검색 / 영상 플레이어 / 자막 편집기), tab title reads "LiPeat — 영어 쉐도잉 학습", no console errors on load.

- [ ] **Step 4: Tag the milestone**

```bash
git tag phase0-complete
```
