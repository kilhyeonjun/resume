---
name: verify-visual-qa
description: |
  웹/프린트/PDF 화면 품질을 점검해야 하면 이 스킬을 바로 실행한다.
  "시각 QA", "visual QA", "페이지 확인", "PDF 확인", "레이아웃 검증", "스크린샷", "반응형 확인", "PDF QA" 요청에서 우선 트리거한다.
  특히 PDF 생성 직후, 콘텐츠(ko/en/portfolio) 변경 직후, 템플릿/스타일 수정 직후에는 반드시 실행해 회귀를 차단한다.
  8개 렌더링 표면(웹 KO/EN, HR PDF KO/EN, ATS PDF KO/EN, 경력 상세, 포트폴리오 리스트/상세)을 한 번에 검증한다.
  `src/utils/resume-data.ts` projection으로 발생한 의도된 표면 차이와 실제 회귀를 구분한다.
  대표 페이지만 샘플링하지 않고, 로컬에서 띄운 실제 사이트의 모든 관련 페이지와 모든 생성 PDF를 확인하는 것을 기본값으로 한다.
---

# 시각 QA 검증

## Purpose

1. **실브라우저 가독성 검증** — 실제 렌더링된 페이지를 열어 정보 밀도, 줄길이, 시각적 계층, 반응형 레이아웃을 점검한다.
2. **증거 기반 시각 QA** — 스크린샷, 뷰포트별 관찰 결과, 라우트별 상태를 남긴다.
3. **PDF 검증** — 페이지 수 제한, 텍스트 추출 가능성, 필수 섹션 존재 여부를 확인한다.
4. **ATS 호환성 검증** — 단일 컬럼 구조, 불필요한 그래픽 배제, 텍스트 파싱 가능성을 확인한다.
5. **Projection 차이 검증** — 표면별로 의도한 노출/생략이 유지되는지 확인한다.

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

### Step 1: 브라우저 QA 환경 준비

브라우저 확인을 **선택 사항이 아니라 기본 경로**로 취급합니다.

준비 순서:
1. `npm run build`로 현재 상태가 실제 빌드되는지 먼저 확인한다.
2. `npm run dev`로 로컬 서버를 실행한다.
3. `agent-browser` 또는 `webapp-testing`을 사용해 실제 페이지를 연다.
4. **대표 라우트 샘플링이 아니라, 현재 사이트의 모든 관련 페이지를 확인 대상으로 수집한다.**
   - 웹 이력서: `/`, `/en/`
   - HR print 라우트: `/resume-print`, `/en/resume-print`
   - ATS 라우트: `/resume-ats`, `/en/resume-ats`
   - 경력 상세: `src/pages/experience/[slug].astro`, `src/pages/en/experience/[slug].astro`에서 생성되는 전체 slug
   - 포트폴리오 목록/상세: `/portfolio/`, `/en/portfolio/`, 각 portfolio slug 전체
5. 데스크톱과 모바일 뷰포트를 모두 확인한다.

권장 뷰포트:
- Desktop: `1440x900`
- Mobile: `375x812`

`agent-browser` 예시:

```bash
agent-browser open http://localhost:4321/resume && agent-browser wait --load networkidle
agent-browser set viewport 1440 900 && agent-browser screenshot --full
agent-browser set viewport 375 812 && agent-browser screenshot --full
```

PASS: 브라우저 세션에서 전체 대상 라우트 접근 가능  
FAIL: dev server 미기동, 일부 라우트 미접근, 브라우저 도구 미실행

### Step 2: 실브라우저 시각 가독성 검증

각 표면에서 다음을 직접 확인한다. **섹션 단위 메모를 남기고, 표면별 screenshot을 저장한다.**

검사 항목:
1. above-the-fold에서 이름/직함/핵심 정보가 즉시 읽히는지
2. 긴 문장이 비정상적으로 좁은 폭에서 세로로 찢기지 않는지
3. 모바일에서 가로 스크롤 없이 주요 섹션이 읽히는지
4. 링크, 버튼, 상세 이동 UI가 시각적으로 식별 가능한지
5. 포트폴리오/상세 카드와 경력 상세가 과밀하거나 끊겨 보이지 않는지

권장 증거:
- 각 라우트당 Desktop full-page screenshot 1장 이상
- 각 라우트당 Mobile full-page screenshot 1장 이상
- 문제 섹션별 메모 (`핵심 역량`, `경력`, `기술 스택`, `포트폴리오 카드`, `포트폴리오 상세 기능/회고` 등)
- 브라우저에서 확인한 오버플로우/링크/시선 흐름 메모

PASS: 모든 관련 페이지에서 표면별 가독성/레이아웃 문제 없음  
FAIL: 과밀, 줄바꿈 깨짐, 계층 불명확, 모바일 오버플로우, 시선 흐름 문제가 일부 페이지 또는 일부 섹션에서라도 발견됨

### Step 3: Projection 차이 검증

브라우저와 빌드 산출물에서 표면별 의도된 차이를 확인한다. 이 검사는 최소 1개 페이지가 아니라 해당 surface의 관련 페이지 전체를 기준으로 본다.

핵심 확인:
1. Web/HR PDF/ATS는 filtered project 집합을 소비하는지
2. Experience detail은 unfiltered `experience` surface를 유지하는지
3. non-featured 프로젝트가 웹/프린트/ATS에는 숨겨지고 상세에서는 남는지
4. `src/utils/resume-data.ts` 규칙과 실제 화면 차이가 일치하는지

PASS: 의도된 차이만 존재  
FAIL: 숨겨져야 할 항목 노출, 보여야 할 항목 누락, 상세 surface 정보 손실

### Step 4: PDF 페이지 수 검증

먼저 `dist/pdf/`에 PDF가 생성되어 있는지 확인한 뒤, **모든 생성 PDF를 실제 결과물 기준으로 확인**합니다.

검사 방법:
1. 필요 시 `npm run pdf` 또는 `npm run pdf:hr`, `npm run pdf:ats`를 실행해 최신 PDF를 생성한다.
2. `Read`로 `dist/pdf/resume-hr-ko.pdf`, `dist/pdf/resume-hr-en.pdf`, `dist/pdf/resume-ats-ko.pdf`, `dist/pdf/resume-ats-en.pdf`를 읽는다.
2. 반환된 `PARSED TEXT FOR PAGE: N / M` 메타데이터에서 총 페이지 수 `M`을 확인한다.
3. 기준과 비교한다:
   - HR PDF: `<= 2p`
   - ATS PDF: `<= 3p`

PASS: HR PDF `<= 2p`, ATS PDF `<= 3p`  
FAIL: 페이지 제한 초과

주의: raw PDF 바이너리에서 `/Type /Page` 패턴을 세는 방식은 object tree 때문에 overcount될 수 있으므로 단독 기준으로 쓰지 않는다.

### Step 5: PDF 텍스트 추출 가능 확인

스캔 이미지 PDF가 아닌지 확인하기 위해 **Read 도구의 파싱 결과에서 실제 텍스트가 추출되는지** 확인합니다.

검사 방법:
1. Step 1과 동일하게 `Read`로 각 PDF를 읽는다.
2. `PARSED TEXT FOR PAGE` 블록 안에 다음 키워드 중 하나 이상이 보이는지 확인한다.
   - `AI Native Engineer`
   - `경력`
   - `Experience`
   - `기술 스택`
   - `Technical Skills`

PASS: 모든 PDF에서 실제 텍스트 블록이 파싱됨  
FAIL: 텍스트 블록이 비어 있거나 핵심 키워드가 전혀 보이지 않음 (이미지 기반 PDF 가능성)

### Step 6: PDF 필수 섹션 존재 확인

각 PDF에서 다음 최소 섹션을 확인합니다.

- 타이틀: `AI Native Engineer`
- 경력 섹션: `experience` 또는 `경력`
- 스킬 섹션: `skills` 또는 `기술`

검사 방법:
1. Step 2의 Read 기반 텍스트 추출 결과에서 키워드 포함 여부 점검
2. 누락 시 `scripts/generate-pdf.ts`의 라우트/스타일 설정 확인
3. `src/components/templates/ResumePrintTemplate.astro`, `src/components/templates/ResumeAtsTemplate.astro` 섹션 렌더링 조건 확인

PASS: 3개 키워드 그룹 모두 충족  
FAIL: 섹션 누락 또는 텍스트 누락

### Step 7: 웹 빌드 후 라우트 존재 확인

정적 빌드 결과물에서 필수 라우트가 생성됐는지 검증합니다. **동적 상세 페이지도 전체 존재 여부를 확인한다.**

```bash
ls dist/index.html dist/en/index.html dist/resume-print/index.html dist/en/resume-print/index.html dist/portfolio/index.html dist/en/portfolio/index.html 2>/dev/null | wc -l
```

PASS: `6` 이상 존재  
FAIL: 누락 라우트 있음 (템플릿 연결/페이지 파일 점검 필요)

필수 추가 확인:
- `dist/resume-ats/index.html`, `dist/en/resume-ats/index.html`
- `dist/experience/*/index.html`, `dist/en/experience/*/index.html`
- `dist/portfolio/*/index.html`, `dist/en/portfolio/*/index.html`

### Step 8: 브라우저 링크/오버플로우/이미지 체크

Step 2의 실브라우저 순회 중 다음 기술적 체크를 함께 수행한다. **웹 이력서/경력 상세/포트폴리오 관련 전체 페이지를 다 돈다.**

검사 항목:
1. `document.body.scrollWidth > document.body.clientWidth` 여부
2. 주요 이미지/아이콘 로드 실패 여부
3. 내부 링크 이동 성공 여부 (`/experience/*`, `/portfolio/*`, `/en/*`, `/resume-print`, `/resume-ats`)
4. 외부 링크가 명백히 깨져 보이지 않는지

PASS: 오버플로우 없음, 링크 이동 정상, 이미지/아이콘 문제 없음  
FAIL: 하나라도 위반 시 이슈 등록

### Step 9: ATS PDF 특수 검증

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

### Step 10: 종합 결과 테이블 작성

아래 형식으로 결과를 통합합니다.

```markdown
| # | 표면 | 검사 | 상태 | 상세 |
|---|------|------|------|------|
| 1 | Web KO | desktop/mobile 가독성 | PASS/FAIL | all relevant screenshots + notes |
| 2 | Web EN | desktop/mobile 가독성 | PASS/FAIL | all relevant screenshots + notes |
| 3 | Experience Detail | projection/레이아웃 | PASS/FAIL | every slug reviewed |
| 4 | Portfolio List/Detail | layout/링크 | PASS/FAIL | every slug reviewed |
| 5 | HR PDF KO | 페이지 수 | PASS/FAIL | Np |
| 6 | HR PDF EN | 페이지 수 | PASS/FAIL | Np |
| 7 | ATS PDF KO | 텍스트 추출 | PASS/FAIL | parsed text hit/miss |
| 8 | ATS PDF EN | 텍스트 추출 | PASS/FAIL | parsed text hit/miss |
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
| `src/utils/resume-data.ts` | projection 규칙 검증 |
| `src/components/templates/ResumeTemplate.astro` | 웹 이력서 렌더링 |
| `src/components/templates/ResumePrintTemplate.astro` | HR PDF 템플릿 |
| `src/components/templates/ResumeAtsTemplate.astro` | ATS PDF 템플릿 |
| `src/components/templates/ExperienceDetailTemplate.astro` | 경력 상세 렌더링 |
| `src/components/templates/PortfolioTemplate.astro` | 포트폴리오 목록 렌더링 |
| `src/components/templates/PortfolioDetailTemplate.astro` | 포트폴리오 상세 렌더링 |
| `src/pages/**/*.astro` | KO/EN 페이지 엔트리 및 전체 라우트 |
| `src/styles/global.css` | 반응형/레이아웃/인쇄 스타일 |

## Exceptions

1. **PDF 미생성** (`dist/pdf/` 또는 대상 파일 없음)  
   → FAIL로 단정하지 않고 "PDF 생성 선행 필요" 안내 후 PDF 검사를 보류한다.

2. **Dev server 미실행** (`http://localhost:4321/resume` 접속 불가)  
   → exhaustive visual QA를 완료할 수 없으므로 `FAIL`로 분류한다. 정적 빌드/PDF 검사만으로는 완료 판정을 내리지 않는다.

3. **ATS 무채색 출력** (`printBackground: false`)  
   → 색상/배경 부재는 의도된 동작이므로 시각 결함으로 분류하지 않는다.

4. **외부 서비스 anti-bot/비표준 차단 응답** (LinkedIn `999`, Glassdoor `403` 등)  
   → 자동화 환경에서만 발생하는 차단 응답이므로 WARN으로 분류하고 FAIL로 승격하지 않는다. 단, 링크 자체가 정상인지는 브라우저에서 수동 확인을 권장한다.

5. **브라우저 도구 선택**  
   → `agent-browser` CLI 또는 `webapp-testing`(Playwright) 중 실제 실행 가능한 도구를 사용한다. 특정 스킬 이름이 환경에 없으면 대체 가능한 브라우저 도구로 즉시 전환하되, 브라우저 증거 수집 자체를 생략하지 않는다.

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
