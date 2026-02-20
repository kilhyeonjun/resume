---
name: verify-content
description: 이력서 콘텐츠 데이터(ko.json, en.json)와 Zod 스키마(content.config.ts)의 정합성을 검증합니다. 콘텐츠 수정 후, 스키마 변경 후, PR 전 사용.
---

# 콘텐츠 데이터 검증

## Purpose

1. **ko/en JSON 동기화** — ko.json과 en.json의 구조적 동기화 검증 (필드 수, 배열 길이, 키 존재)
2. **Zod 스키마 정합성** — content.config.ts의 스키마와 JSON 데이터 간 불일치 탐지
3. **날짜 형식 검증** — YYYY-MM 형식 준수 여부 (dateString regex 기반)
4. **URL 유효성** — safeUrl 스키마에 따른 http/https 프로토콜 검증
5. **필수 필드 누락** — labels, personalInfo 등 필수 객체의 키 누락 탐지

## When to Run

- ko.json 또는 en.json 수정 후
- content.config.ts 스키마 변경 후
- 새로운 experience/project 항목 추가 후
- PR 전 콘텐츠 정합성 확인

## Related Files

| File | Purpose |
|------|---------|
| `src/content/resume/ko.json` | 한국어 이력서 데이터 (source of truth) |
| `src/content/resume/en.json` | 영어 이력서 데이터 |
| `src/content.config.ts` | Zod 스키마 정의 + 타입 export |
| `src/data/portfolio.json` | 포트폴리오 데이터 |
| `src/utils/resume-data.ts` | 이력서 데이터 준비 유틸리티 |
| `src/utils/career-duration.ts` | 경력 기간 계산 유틸리티 |

## Workflow

### Step 1: Zod 스키마 빌드 검증

**도구:** Bash

이력서 데이터가 Zod 스키마를 통과하는지 Astro 빌드로 검증합니다.

```bash
npm run build 2>&1 | head -50
```

**PASS:** 빌드 exit code 0
**FAIL:** Zod validation error 또는 빌드 실패

**수정 방법:** 에러 메시지에서 필드명과 기대 타입을 확인하고 JSON 데이터를 수정합니다.

### Step 2: ko/en 구조 동기화 검증

**도구:** Read

두 JSON 파일을 읽고 다음을 비교합니다:

1. 최상위 키 목록이 동일한지
2. `experience` 배열의 길이가 동일한지
3. 각 experience의 `projects` 배열 길이가 동일한지
4. 각 experience의 `highlights` 배열 길이가 동일한지
5. `skills` 배열의 카테고리 수와 각 카테고리의 items 수가 동일한지
6. `education`, `certifications`, `awards`, `continuousLearning`, `technicalWriting`, `openSource` 배열 길이가 동일한지
7. `labels` 객체의 키 목록이 동일한지

**PASS:** 모든 구조가 동일
**FAIL:** 구조 불일치 발견

**수정 방법:** 누락된 항목을 추가하거나 초과 항목을 제거합니다. ko.json이 source of truth.

### Step 3: 날짜 형식 검증

**도구:** Grep

ko.json과 en.json에서 날짜 필드를 추출하여 YYYY-MM 형식 검증:

```bash
grep -nE '"(startDate|endDate|date|period)":\s*"' src/content/resume/ko.json
```

날짜 값이 `YYYY-MM` 또는 `YYYY` 형식(awardSchema의 dateStringLoose)인지 확인합니다.

**PASS:** 모든 날짜가 YYYY-MM 또는 YYYY 형식
**FAIL:** 형식에 맞지 않는 날짜 값 발견

**수정 방법:** 해당 날짜 값을 올바른 형식으로 수정합니다.

### Step 4: URL 프로토콜 검증

**도구:** Grep

JSON 파일 내 모든 URL 필드가 http:// 또는 https://로 시작하는지 검증:

```bash
grep -nE '"(url|companyUrl|linkedin|github|blog|videoUrl|reviewUrl)":\s*"' src/content/resume/ko.json
```

**PASS:** 모든 URL이 http:// 또는 https://로 시작
**FAIL:** 프로토콜 없는 URL 발견

**수정 방법:** 누락된 프로토콜을 추가합니다 (일반적으로 https://).

### Step 5: experience slug 고유성 검증

**도구:** Read

ko.json의 experience 배열에서 slug 값들이 모두 고유한지 확인합니다. en.json의 slug도 ko.json과 동일한지 비교합니다.

**PASS:** 모든 slug가 고유하고 ko/en 간 동일
**FAIL:** 중복 slug 또는 ko/en slug 불일치

**수정 방법:** 중복된 slug를 고유한 값으로 변경합니다.

### Step 6: labels 키 완전성 검증

**도구:** Read

content.config.ts의 `labelsSchema`에 정의된 모든 키가 ko.json과 en.json의 labels 객체에 존재하는지 확인합니다.

**PASS:** 모든 labels 키가 양쪽에 존재
**FAIL:** 누락된 labels 키 발견

**수정 방법:** 누락된 키를 추가합니다.

## Output Format

```markdown
| # | 검사 | 상태 | 상세 |
|---|------|------|------|
| 1 | Zod 빌드 검증 | PASS/FAIL | 빌드 결과 |
| 2 | ko/en 구조 동기화 | PASS/FAIL | 불일치 항목 |
| 3 | 날짜 형식 | PASS/FAIL | 위반 필드 |
| 4 | URL 프로토콜 | PASS/FAIL | 위반 URL |
| 5 | slug 고유성 | PASS/FAIL | 중복 slug |
| 6 | labels 완전성 | PASS/FAIL | 누락 키 |
```

## Exceptions

1. **portfolio.json** — 별도 스키마로 관리되며 이 스킬의 검증 범위에 포함되지 않음 (Zod 스키마가 content collections 외부)
2. **ko/en 값 차이** — 번역으로 인한 텍스트 값 차이는 구조 동기화 위반이 아님. 구조(키, 배열 길이)만 검증
3. **optional 필드** — Zod 스키마에서 `.optional()`로 정의된 필드는 한쪽에만 존재해도 위반이 아님
4. **`current: true` experience** — endDate가 없는 것은 정상 (current가 true인 경우)
