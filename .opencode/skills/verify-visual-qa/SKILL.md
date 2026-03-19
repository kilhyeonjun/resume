---
name: verify-visual-qa
description: |
  웹/프린트/PDF 화면 품질을 점검해야 하면 이 스킬을 바로 실행한다.
  "시각 QA", "visual QA", "페이지 확인", "PDF 확인", "레이아웃 검증", "스크린샷", "반응형 확인", "PDF QA" 요청에서 우선 트리거한다.
  특히 PDF 생성 직후, 콘텐츠(ko/en/portfolio) 변경 직후, 템플릿/스타일 수정 직후에는 반드시 실행해 회귀를 차단한다.
  8개 렌더링 표면(웹 KO/EN, HR PDF KO/EN, ATS PDF KO/EN, 경력 상세, 포트폴리오 리스트/상세)을 한 번에 검증한다.
---

# 시각 QA 검증

## Purpose

1. **PDF 검증** — 페이지 수 제한, 텍스트 추출 가능성, 필수 섹션 존재 여부를 확인한다.
2. **웹 페이지 검증** — 가로 오버플로우, 반응형 레이아웃, 이미지/아이콘 로드를 점검한다.
3. **깨진 링크 탐지** — 모든 표면에서 내부/외부 링크를 수집해 유효성을 검증한다.
4. **ATS 호환성 검증** — 단일 컬럼 구조, 불필요한 그래픽 배제, 텍스트 파싱 가능성을 확인한다.

## When to Run

- PDF 생성 후 (`npm run pdf`, `npm run pdf:hr`, `npm run pdf:ats`)
- 콘텐츠 파일(`src/content/resume/ko.json`, `src/content/resume/en.json`, `src/data/portfolio.json`) 수정 후
- 템플릿/스타일 파일(`src/components/templates/*.astro`, `src/styles/global.css`) 수정 후
- PR 생성 전 최종 품질 게이트로 실행

## 검증 표면 (8)

| # | Surface | 대표 라우트/출력 |
|---|---------|------------------|
| 1 | Web Resume KO | `/`, `/resume` |
| 2 | Web Resume EN | `/en/` |
| 3 | HR PDF KO | `dist/pdf/resume-hr-ko.pdf` |
| 4 | HR PDF EN | `dist/pdf/resume-hr-en.pdf` |
| 5 | ATS PDF KO | `dist/pdf/resume-ats-ko.pdf` |
| 6 | ATS PDF EN | `dist/pdf/resume-ats-en.pdf` |
| 7 | Experience Detail | `/experience/[slug]`, `/en/experience/[slug]` |
| 8 | Portfolio List/Detail | `/portfolio`, `/portfolio/[slug]`, `/en/portfolio/*` |

## Workflow

### Step 1: PDF 페이지 수 검증

먼저 `dist/pdf/`에 PDF가 생성되어 있는지 확인한 뒤, 페이지 수 제한을 점검합니다.

```bash
node -e "
const fs = require('fs');
['resume-hr-ko.pdf','resume-hr-en.pdf','resume-ats-ko.pdf','resume-ats-en.pdf'].forEach(f => {
  const buf = fs.readFileSync('dist/pdf/' + f);
  const pages = (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)||[]).length;
  const ok = f.includes('hr') ? pages <= 2 : pages <= 3;
  console.log((ok?'PASS':'FAIL') + ': ' + f + ' ' + pages + 'p');
});
"
```

PASS: HR PDF `<= 2p`, ATS PDF `<= 3p`  
FAIL: 페이지 제한 초과

### Step 2: PDF 텍스트 추출 가능 확인

스캔 이미지 PDF가 아닌지 확인하기 위해 텍스트 시그니처를 검사합니다.

```bash
node -e "
const fs = require('fs');
['resume-hr-ko.pdf','resume-ats-ko.pdf','resume-hr-en.pdf','resume-ats-en.pdf'].forEach(f => {
  const text = fs.readFileSync('dist/pdf/' + f, 'latin1');
  const hasText = text.includes('AI Native Engineer') || text.includes('경력') || text.includes('Experience');
  console.log((hasText?'PASS':'FAIL') + ': ' + f + ' text extractable');
});
"
```

PASS: 모든 PDF에서 텍스트 시그니처 감지  
FAIL: 텍스트 시그니처 미검출 (이미지 기반 PDF 가능성)

### Step 3: PDF 필수 섹션 존재 확인

각 PDF에서 다음 최소 섹션을 확인합니다.

- 타이틀: `AI Native Engineer`
- 경력 섹션: `experience` 또는 `경력`
- 스킬 섹션: `skills` 또는 `기술`

검사 방법:
1. Step 2의 텍스트 추출 결과에서 키워드 포함 여부 점검
2. 누락 시 `scripts/generate-pdf.ts`의 라우트/스타일 설정 확인
3. `src/components/templates/ResumePrintTemplate.astro`, `src/components/templates/ResumeAtsTemplate.astro` 섹션 렌더링 조건 확인

PASS: 3개 키워드 그룹 모두 충족  
FAIL: 섹션 누락 또는 텍스트 누락

### Step 4: 웹 빌드 후 라우트 존재 확인

정적 빌드 결과물에서 필수 라우트가 생성됐는지 검증합니다.

```bash
ls dist/index.html dist/en/index.html dist/resume-print/index.html dist/en/resume-print/index.html dist/portfolio/index.html dist/en/portfolio/index.html 2>/dev/null | wc -l
```

PASS: `6` 이상 존재  
FAIL: 누락 라우트 있음 (템플릿 연결/페이지 파일 점검 필요)

권장 추가 확인:
- `dist/resume-ats/index.html`, `dist/en/resume-ats/index.html`
- `dist/experience/`, `dist/en/experience/`
- `dist/portfolio/*/index.html`, `dist/en/portfolio/*/index.html`

### Step 5: 반응형/오버플로우/링크/이미지 체크 (Puppeteer 가능 시)

Dev server(`npm run dev`)가 실행 중이면 375px 뷰포트 기준으로 주요 페이지를 순회합니다.

검사 항목:
1. `document.body.scrollWidth > document.body.clientWidth` 여부
2. `img`/`picture` 요소 로드 실패(`naturalWidth === 0`) 여부
3. 내부 링크(`href`가 `/resume` base 하위) 404 여부
4. 외부 링크(`http://`, `https://`) 응답 실패 여부

예시 스니펫:

```js
const hasOverflow = document.body.scrollWidth > document.body.clientWidth;
```

PASS: 오버플로우 없음, 이미지 로드 정상, 링크 유효  
FAIL: 하나라도 위반 시 이슈 등록

### Step 6: ATS PDF 특수 검증

ATS PDF는 읽기/파싱 안정성을 우선합니다.

검증 포인트:
1. `scripts/generate-pdf.ts`에서 ATS 설정의 `printBackground: false` 확인
2. ATS 템플릿(`src/components/templates/ResumeAtsTemplate.astro`)이 단일 컬럼 흐름을 유지하는지 확인
3. Step 2 텍스트 추출 검사 통과 여부 확인

PASS:
- ATS KO/EN 모두 `printBackground: false`
- 단일 컬럼 유지
- 텍스트 추출 가능

FAIL:
- 배경 그래픽/다중 컬럼 레이아웃/텍스트 추출 실패 발견

### Step 7: 종합 결과 테이블 작성

아래 형식으로 결과를 통합합니다.

```markdown
| # | 표면 | 검사 | 상태 | 상세 |
|---|------|------|------|------|
| 1 | HR PDF KO | 페이지 수 | PASS/FAIL | Np |
| 2 | HR PDF EN | 페이지 수 | PASS/FAIL | Np |
| 3 | ATS PDF KO | 텍스트 추출 | PASS/FAIL | signature hit/miss |
| 4 | ATS PDF EN | 텍스트 추출 | PASS/FAIL | signature hit/miss |
| 5 | Web KO | 375px 오버플로우 | PASS/FAIL | scrollWidth vs clientWidth |
| 6 | Web EN | 375px 오버플로우 | PASS/FAIL | scrollWidth vs clientWidth |
| 7 | Experience Detail | 링크/레이아웃 | PASS/FAIL | broken links N건 |
| 8 | Portfolio List/Detail | 링크/이미지 | PASS/FAIL | broken links N건 |
```

최종 판정:
- `PASS`: 모든 핵심 검사 통과
- `WARN`: 예외/스킵 존재 (예: dev server 미실행)
- `FAIL`: 한 개 이상 실패

## Related Files

| File | Purpose |
|------|---------|
| `dist/pdf/*.pdf` | HR/ATS PDF 산출물 검증 대상 |
| `scripts/generate-pdf.ts` | PDF 생성 옵션 및 ATS 설정 검증 |
| `src/components/templates/ResumeTemplate.astro` | 웹 이력서 렌더링 |
| `src/components/templates/ResumePrintTemplate.astro` | HR PDF 템플릿 |
| `src/components/templates/ResumeAtsTemplate.astro` | ATS PDF 템플릿 |
| `src/components/templates/ExperienceDetailTemplate.astro` | 경력 상세 렌더링 |
| `src/components/templates/PortfolioTemplate.astro` | 포트폴리오 목록 렌더링 |
| `src/components/templates/PortfolioDetailTemplate.astro` | 포트폴리오 상세 렌더링 |
| `src/pages/**/*.astro` | KO/EN 페이지 엔트리 및 라우트 |
| `src/styles/global.css` | 반응형/레이아웃/인쇄 스타일 |

## Exceptions

1. **PDF 미생성** (`dist/pdf/` 또는 대상 파일 없음)  
   → FAIL로 단정하지 않고 "PDF 생성 선행 필요" 안내 후 PDF 검사를 보류한다.

2. **Dev server 미실행** (`http://localhost:4321/resume` 접속 불가)  
   → Step 5 반응형/링크 실시간 검사는 `SKIP` 처리하고 정적 빌드 검사만 진행한다.

3. **ATS 무채색 출력** (`printBackground: false`)  
   → 색상/배경 부재는 의도된 동작이므로 시각 결함으로 분류하지 않는다.

## Output Format

```markdown
## Visual QA Report

| # | 표면 | 검사 | 상태 | 상세 |
|---|------|------|------|------|
| 1 | ... | ... | PASS/FAIL/SKIP | ... |

### Summary
- PASS: X건
- FAIL: Y건
- SKIP: Z건

### Action Items
1. [HIGH] ...
2. [MEDIUM] ...
```
