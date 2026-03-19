---
name: verify-astro-components
description: |
  Astro 컴포넌트와 페이지의 코드 규칙 준수를 검증하는 스킬.
  "컴포넌트 규칙", "페이지 검증", "Astro 구조 점검", "접근성 확인", "ko/en 페이지 미러링 확인" 요청이 나오면 우선 실행한다.
  컴포넌트 수정 후, 새 페이지 추가 후, 템플릿 변경 후, PR 전 빌드/규칙 점검이 필요할 때 사용한다.
---

# Astro 컴포넌트 규칙 검증

## Purpose

1. **Page → Template 위임 패턴** — 페이지가 thin wrapper인지, 템플릿에 위임하는지 검증
2. **Props 인터페이스 규칙** — Astro Props 패턴 준수 (interface Props + Astro.props 구조분해)
3. **import 순서** — Astro built-ins → layouts → components → data/content → types 순서
4. **접근성 규칙** — aria-label, rel="noopener noreferrer", lang 속성 등
5. **ko/en 페이지 미러링** — src/pages/ 와 src/pages/en/ 구조 대칭 확인
6. **HTML 유효성** — 닫히지 않은 태그, 중복 태그 등 기본 HTML 오류 탐지

## When to Run

- Astro 컴포넌트(*.astro) 수정 후
- 새 페이지 추가 후
- 템플릿 컴포넌트 변경 후
- PR 전 코드 규칙 확인

## Related Files

| File | Purpose |
|------|---------|
| `src/pages/index.astro` | KO 메인 페이지 (thin wrapper) |
| `src/pages/resume-print.astro` | KO HR PDF 페이지 |
| `src/pages/resume-ats.astro` | KO ATS PDF 페이지 |
| `src/pages/en/index.astro` | EN 메인 페이지 |
| `src/pages/en/resume-print.astro` | EN HR PDF 페이지 |
| `src/pages/en/resume-ats.astro` | EN ATS PDF 페이지 |
| `src/pages/experience/[slug].astro` | KO 경력 상세 |
| `src/pages/en/experience/[slug].astro` | EN 경력 상세 |
| `src/pages/portfolio/index.astro` | KO 포트폴리오 목록 |
| `src/pages/portfolio/[slug].astro` | KO 포트폴리오 상세 |
| `src/pages/en/portfolio/index.astro` | EN 포트폴리오 목록 |
| `src/pages/en/portfolio/[slug].astro` | EN 포트폴리오 상세 |
| `src/components/templates/ResumeTemplate.astro` | 메인 이력서 템플릿 |
| `src/components/templates/ResumePrintTemplate.astro` | HR PDF 템플릿 |
| `src/components/templates/ResumeAtsTemplate.astro` | ATS PDF 템플릿 |
| `src/components/templates/ExperienceDetailTemplate.astro` | 경력 상세 템플릿 |
| `src/components/templates/PortfolioTemplate.astro` | 포트폴리오 템플릿 |
| `src/components/templates/PortfolioDetailTemplate.astro` | 포트폴리오 상세 템플릿 |
| `src/layouts/Layout.astro` | 메인 레이아웃 |
| `src/components/resume/ResumeSkills.astro` | 스킬 섹션 컴포넌트 |
| `src/components/resume/ResumeHeader.astro` | 헤더 컴포넌트 |
| `src/components/resume/ResumeExperience.astro` | 경력 섹션 컴포넌트 |
| `src/styles/global.css` | 전역 스타일 (테마, 프린트) |
| `src/utils/paths.ts` | 경로 유틸리티 (BASE_URL 규칙 확인 시 참조 전용, 직접 검증 대상 아님) |

참고: `src/utils/*.ts` 유틸 파일은 이 스킬의 직접 검증 대상이 아니라, 페이지/레이아웃 링크 규칙 확인 시 참고 정보로만 사용한다.

## Workflow

### Step 1: Page thin wrapper 검증

**도구:** Read, Glob

`src/pages/` 디렉토리의 모든 `.astro` 페이지를 검사합니다. 각 페이지가 다음 패턴을 따르는지 확인:

- frontmatter에서 Template 컴포넌트 import
- 본문에서 `<TemplateComponent lang="ko" />` 또는 `<TemplateComponent lang="en" />` 호출
- 페이지 자체에 비즈니스 로직이 최소화

**PASS:** 모든 페이지가 Template에 위임
**FAIL:** 페이지에 직접 비즈니스 로직이나 HTML 마크업이 과도하게 존재

**수정 방법:** 비즈니스 로직을 Template 컴포넌트로 이동합니다.

### Step 2: ko/en 페이지 미러링 검증

**도구:** Glob

`src/pages/` (en/ 제외)와 `src/pages/en/`의 파일 구조를 비교합니다:

```bash
# KO 페이지 목록 (en/ 제외)
find src/pages -name "*.astro" -not -path "*/en/*" | sort

# EN 페이지 목록
find src/pages/en -name "*.astro" | sort
```

KO 페이지마다 대응하는 EN 페이지가 있는지 확인합니다.

**PASS:** 모든 KO 페이지에 대응하는 EN 페이지 존재
**FAIL:** EN에 누락된 페이지 발견

**수정 방법:** 누락된 EN 페이지를 KO 페이지를 복사하여 `lang="en"`으로 생성합니다.

### Step 3: Props 인터페이스 규칙 검증

**도구:** Grep

템플릿 컴포넌트에서 Props 인터페이스 패턴을 확인합니다:

```bash
grep -l "interface Props" src/components/templates/*.astro src/components/resume/*.astro
```

각 컴포넌트가:
1. `interface Props { ... }` 선언
2. `const { ... } = Astro.props;` 구조분해

를 갖고 있는지 확인합니다.

**PASS:** 모든 Template/Resume 컴포넌트가 Props 패턴 준수
**FAIL:** Props 인터페이스 누락

**수정 방법:** Props 인터페이스와 구조분해를 추가합니다.

### Step 4: 외부 링크 보안 속성 검증

**도구:** Grep

`target="_blank"`가 있는 모든 링크에 `rel="noopener noreferrer"`가 있는지 확인합니다:

```bash
grep -rn 'target="_blank"' src/components/ src/pages/ src/layouts/
```

**PASS:** 모든 `target="_blank"` 링크에 `rel="noopener noreferrer"` 존재
**FAIL:** rel 속성 누락

**수정 방법:** `rel="noopener noreferrer"`를 추가합니다.

### Step 5: BASE_URL 사용 검증

**도구:** Grep

내부 링크에서 하드코딩된 `/resume/` 경로 대신 `import.meta.env.BASE_URL` 또는 `getBasePath()` 사용 여부를 확인합니다:

```bash
grep -rn 'href="/resume' src/components/ src/pages/ src/layouts/
```

**PASS:** 하드코딩된 `/resume/` 경로 없음 (Layout.astro의 hreflang/og 메타 태그 제외)
**FAIL:** 하드코딩된 경로 발견

**수정 방법:** `import.meta.env.BASE_URL` 또는 `getBasePath(lang)`으로 교체합니다.

### Step 6: HTML 태그 균형 검증

**도구:** Read

Template 컴포넌트의 HTML 태그 균형을 검사합니다. 특히:
- 닫히지 않은 태그
- 중복 닫기 태그
- 자체 닫힘이 아닌 void 엘리먼트

```bash
grep -n '</p>' src/components/templates/ResumeAtsTemplate.astro | wc -l
grep -n '<p' src/components/templates/ResumeAtsTemplate.astro | wc -l
```

**PASS:** 열기/닫기 태그 수가 일치
**FAIL:** 태그 불균형 발견

**수정 방법:** 중복 태그를 제거하거나 누락된 태그를 추가합니다.

### Step 7: Astro 빌드 검증

**도구:** Bash

모든 규칙 확인 후 최종 빌드 테스트:

```bash
npm run build 2>&1 | tail -20
```

**PASS:** 빌드 exit code 0
**FAIL:** 빌드 에러 발생

**수정 방법:** 에러 메시지에 따라 해당 파일을 수정합니다.

## Output Format

```markdown
| # | 검사 | 상태 | 상세 |
|---|------|------|------|
| 1 | Page thin wrapper | PASS/FAIL | 위반 페이지 |
| 2 | ko/en 미러링 | PASS/FAIL | 누락 페이지 |
| 3 | Props 인터페이스 | PASS/FAIL | 위반 컴포넌트 |
| 4 | 외부 링크 보안 | PASS/FAIL | 위반 링크 |
| 5 | BASE_URL 사용 | PASS/FAIL | 하드코딩 경로 |
| 6 | HTML 태그 균형 | PASS/FAIL | 불균형 위치 |
| 7 | Astro 빌드 | PASS/FAIL | 빌드 결과 |
```

## Exceptions

1. **Print 템플릿의 standalone HTML** — `ResumePrintTemplate.astro`와 `ResumeAtsTemplate.astro`는 Layout.astro를 사용하지 않고 자체 `<html>` 구조를 가짐 — 이는 PDF 충실도를 위한 의도적 패턴
2. **Icon 컴포넌트의 Props 패턴** — `src/components/icons/*.astro`는 `class?: string` prop만 가지며 간소화된 Props 패턴 사용 가능
3. **Layout.astro의 하드코딩된 경로** — hreflang, og:image 메타 태그의 `${Astro.site}resume/` 패턴은 SEO 요구사항으로 허용
