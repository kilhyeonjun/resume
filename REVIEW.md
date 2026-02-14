# Resume Site — 종합 코드 리뷰

> **리뷰 날짜**: 2025-02-14
> **범위**: 전체 소스 코드 (32 .astro 파일, 4 JSON 파일, 1 TS 스크립트, CI/CD, 설정)
> **리뷰어**: Prometheus (AI Code Reviewer)

---

## 요약 (Executive Summary)

전체적으로 **잘 구성된 프로젝트**입니다. Astro 5 + Tailwind CSS 4 + TypeScript strict 스택이 적절하게 활용되고 있으며, 페이지→템플릿 위임 패턴과 콘텐츠 컬렉션 기반 데이터 관리가 깔끔합니다. 다만 **타입 안전성**, **코드 중복**, **SEO/접근성 누락**에서 개선이 필요합니다.

| 우선순위 | 이슈 수 | 설명 |
|---------|--------|------|
| **P0 (심각)** | 7 | 타입 안전성 붕괴, SEO 핵심 누락, 존재하지 않는 속성 참조 |
| **P1 (중요)** | 12 | 코드 중복, 접근성 미흡, 보안 헤더 누락 |
| **P2 (개선)** | 15 | 성능 최적화, UX 개선, 코드 정리 |

---

## P0 — 심각 (즉시 수정 필요)

### P0-1. 존재하지 않는 속성 참조 (`data.languages`, `data.phone`, `data.website`, `data.projects`)

**파일**:
- `src/components/templates/ResumeTemplate.astro:36,77,115,230`
- `src/components/templates/ResumePrintTemplate.astro:23,404,511`
- `src/pages/resume-ats.astro:17,196,199,203,277`
- `src/pages/en/resume-ats.astro:17,196,199,203,277`

**설명**: `data` 객체가 `resumeData.personalInfo`를 spread한 후 추가 속성을 매핑하는 구조인데, 스키마(`content.config.ts`)에도 JSON 데이터에도 `phone`, `website`, `languages` 속성이 **존재하지 않습니다**. `data.projects`도 `resumeData`에 없는 top-level 속성입니다.

```typescript
// resume-ats.astro:10-18 — 문제 코드
const data = {
  ...resumeData.personalInfo,
  summary: resumeData.summary,
  skills: resumeData.skills,
  experience: resumeData.experience,
  education: resumeData.education,
  certifications: resumeData.certifications,
  languages: resumeData.languages,  // ❌ 스키마에 없음
};
```

**영향**: 빌드는 통과하지만 런타임에 `undefined` — 해당 조건부 렌더링이 항상 `false`로 평가되어 **phone, website, 독립 projects 섹션이 항상 숨겨짐**. 의도된 동작인지 불분명.

**수정 방향**:
1. 사용하지 않는 속성 참조 제거 (`languages`, `phone`, `website`, `projects` from data mapping)
2. 향후 필요하면 `personalInfoSchema`에 `phone`, `website` 추가 + JSON 데이터에 값 추가

---

### P0-2. 템플릿 Props에 `any` 타입 남용

**파일**:
- `src/components/templates/ExperienceDetailTemplate.astro:10-14`
- `src/components/templates/PortfolioDetailTemplate.astro:11-15`
- `src/components/templates/PortfolioTemplate.astro:8-9`

**설명**: TypeScript strict 모드임에도 핵심 Props가 모두 `any`:

```typescript
// ExperienceDetailTemplate.astro
interface Props {
  lang: 'ko' | 'en';
  experience: any;        // ❌
  index: number;
  total: number;
  allExperience: any[];   // ❌
  labels: any;            // ❌
}
```

**영향**: 타입 체크 무력화 — 존재하지 않는 속성 접근, 잘못된 메서드 호출 등이 컴파일 타임에 잡히지 않음. 실질적으로 TypeScript strict의 가치를 상실.

**수정 방향**:
1. `content.config.ts`에서 누락된 타입 export 추가:
   ```typescript
   export type Labels = z.infer<typeof labelsSchema>;
   export type PersonalInfo = z.infer<typeof personalInfoSchema>;
   export type Education = z.infer<typeof educationSchema>;
   // ... 모든 스키마 타입
   ```
2. 각 템플릿 Props에 정확한 타입 적용
3. Portfolio 데이터용 타입 정의 (현재 plain JSON import이므로 별도 타입 필요)

---

### P0-3. ATS 페이지 306줄 완전 중복

**파일**:
- `src/pages/resume-ats.astro` (306줄)
- `src/pages/en/resume-ats.astro` (306줄)

**설명**: 두 파일이 `lang`과 back-link URL만 다르고 **306줄 중 300줄 이상 동일**. 스타일 블록 (~170줄), HTML 구조 (~120줄) 모두 복사-붙여넣기.

**영향**: 버그 수정 시 양쪽 모두 수정 필요 — 한쪽만 수정하면 불일치 발생. 유지보수 비용 2배.

**수정 방향**: `src/components/templates/ResumeAtsTemplate.astro` 생성 → `lang` prop으로 분기:
```astro
<!-- src/pages/resume-ats.astro -->
---
import ResumeAtsTemplate from '../components/templates/ResumeAtsTemplate.astro';
---
<ResumeAtsTemplate lang="ko" />
```

---

### P0-4. Open Graph / Twitter Card 태그 완전 누락

**파일**: `src/layouts/Layout.astro`

**설명**: `<head>`에 `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card` 등 소셜 미디어 메타 태그가 **전혀 없음**.

**영향**: LinkedIn, Slack, Twitter 등에서 링크 공유 시 **제목/설명/썸네일 없이 URL만 표시**. 이력서/포트폴리오 사이트에서 치명적.

**수정 방향**:
```astro
<!-- Layout.astro <head> 내 추가 -->
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:type" content="website" />
<meta property="og:locale" content={lang === 'ko' ? 'ko_KR' : 'en_US'} />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
```

---

### P0-5. robots.txt / sitemap.xml 부재

**파일**: `public/` 디렉토리

**설명**: `robots.txt`와 `sitemap.xml`이 모두 없음. `astro.config.mjs`에 sitemap integration도 미설정.

**영향**: 검색엔진 크롤링 비효율 — Google이 페이지 구조를 이해하지 못하고, ATS/Print 페이지까지 인덱싱할 수 있음.

**수정 방향**:
1. `public/robots.txt` 생성:
   ```
   User-agent: *
   Allow: /resume/
   Disallow: /resume/resume-print
   Disallow: /resume/resume-ats
   Disallow: /resume/en/resume-print
   Disallow: /resume/en/resume-ats
   Sitemap: https://kilhyeonjun.github.io/resume/sitemap-index.xml
   ```
2. `@astrojs/sitemap` 설치 및 설정

---

### P0-6. hreflang 태그 누락 (다국어 SEO)

**파일**: `src/layouts/Layout.astro`

**설명**: 한국어/영어 두 버전이 있지만 `<link rel="alternate" hreflang="...">` 태그가 없음.

**영향**: Google이 한국어/영어 페이지의 관계를 인식하지 못해 **중복 콘텐츠로 판단**하거나, 잘못된 언어 버전을 검색결과에 표시.

**수정 방향**:
```astro
<!-- Layout.astro <head> 내 -->
<link rel="alternate" hreflang="ko" href={`${Astro.site}resume/`} />
<link rel="alternate" hreflang="en" href={`${Astro.site}resume/en/`} />
<link rel="alternate" hreflang="x-default" href={`${Astro.site}resume/`} />
```

---

### P0-7. CI에 타입 체크 단계 없음

**파일**: `.github/workflows/deploy.yml`

**설명**: `npm run build`만 실행하고 별도의 타입 체크(`astro check`) 단계가 없음. TypeScript strict 설정이 CI에서 검증되지 않음.

**영향**: `any` 타입이나 타입 에러가 빌드를 통과하면 프로덕션에 배포됨. P0-2의 `any` 남용이 CI에서 잡히지 않는 이유.

**수정 방향**:
```yaml
- name: Type Check
  run: npx astro check
```

---

## P1 — 중요 (다음 스프린트 수정 권장)

### P1-1. 다크모드 스크립트 로직 중복

**파일**:
- `src/layouts/Layout.astro:35-48` (FOUC 방지 인라인 스크립트)
- `src/components/ThemeToggle.astro:40-48` (`getTheme()` 함수)

**설명**: `getTheme()` 로직이 두 곳에 동일하게 존재. Layout의 인라인 스크립트는 `is:inline`이라 번들링 불가하지만, ThemeToggle과 동일한 로직을 별도로 유지하고 있음.

**수정 방향**: 로직 자체는 FOUC 방지를 위해 인라인이 필수이므로, ThemeToggle에서 `getTheme()` 호출 시 Layout의 초기화 결과를 재사용하도록 구조 변경.

---

### P1-2. Skip Link 없음 (접근성)

**파일**: `src/layouts/Layout.astro`

**설명**: 키보드 사용자를 위한 "본문으로 건너뛰기" 링크가 없음.

**영향**: 키보드 네비게이션 시 매 페이지마다 nav 링크를 모두 탭해야 본문에 도달.

**수정 방향**:
```astro
<body class="min-h-screen">
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white">
    {lang === 'ko' ? '본문으로 건너뛰기' : 'Skip to content'}
  </a>
  <!-- ... -->
  <main id="main-content" class="mx-auto max-w-4xl px-4 py-8">
```

---

### P1-3. 아이콘 컴포넌트에 `aria-hidden` 누락

**파일**: `src/components/icons/*.astro` (13개 파일 모두)

**설명**: 장식적 아이콘에 `aria-hidden="true"`가 없어 스크린리더가 불필요하게 SVG를 읽음.

**수정 방향**: 모든 아이콘 컴포넌트의 `<svg>`에 `aria-hidden="true"` 추가.

---

### P1-4. 네비게이션 Active 상태 표시 없음

**파일**: `src/layouts/Layout.astro:59-70`

**설명**: 이력서/포트폴리오 nav 링크에 현재 페이지 활성 표시가 없음.

**영향**: 사용자가 현재 어떤 페이지에 있는지 시각적으로 알 수 없음.

**수정 방향**:
```astro
const currentPath = Astro.url.pathname;
const isResume = currentPath === basePath || currentPath === `${basePath}/`;
const isPortfolio = currentPath.startsWith(`${basePath}/portfolio`);

<a href={basePath} class={isResume ? 'text-primary-600 font-semibold dark:text-primary-400' : 'text-gray-600 ...'}>
```

---

### P1-5. `content.config.ts` — 날짜 포맷 미검증

**파일**: `src/content.config.ts:31,44,51,58,65,71,78`

**설명**: 모든 날짜 필드가 `z.string()`으로만 검증 — `"YYYY-MM"` 포맷 강제 없음.

**영향**: `"2024-13-45"` 같은 잘못된 날짜가 빌드 타임에 잡히지 않음.

**수정 방향**:
```typescript
const dateSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Date must be YYYY-MM format');
```

---

### P1-6. 보안 헤더 미설정 (GitHub Pages)

**파일**: 없음 (`public/_headers` 파일 부재)

**설명**: CSP, X-Frame-Options, X-Content-Type-Options, HSTS 등 보안 헤더가 설정되지 않음.

> **참고**: GitHub Pages는 `_headers` 파일을 지원하지 않습니다. 보안 헤더 설정은 `<meta http-equiv>` 태그로 부분적 적용 가능하지만, CSP/HSTS 등은 서버 레벨 설정이 필요하므로 GitHub Pages에서는 제한적입니다.

**수정 방향** (가능한 범위):
```astro
<!-- Layout.astro <head> -->
<meta http-equiv="X-Content-Type-Options" content="nosniff" />
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:;" />
```

---

### P1-7. PDF 생성 — 폰트 로딩 보장 안 됨

**파일**: `scripts/generate-pdf.ts:82-86`

**설명**: `waitForPageLoad()`이 `document.readyState === 'complete'` + 1초 대기만 하고, Google Fonts 로딩 완료를 확인하지 않음.

**영향**: 네트워크 상태에 따라 PDF가 시스템 폰트로 렌더링될 수 있음.

**수정 방향**:
```typescript
async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForFunction(() => 
    document.readyState === 'complete' && document.fonts.ready
  );
  await new Promise((resolve) => setTimeout(resolve, 500));
}
```

---

### P1-8. PDF 생성 — 재시도 로직 없음

**파일**: `scripts/generate-pdf.ts:109-112`

**설명**: `page.goto()` 실패 시 즉시 에러 — 일시적 네트워크 문제에도 전체 실패.

**수정 방향**: 지수 백오프 재시도 추가 (최대 3회).

---

### P1-9. `PortfolioDetailTemplate` — 안전하지 않은 타입 캐스팅

**파일**: `src/components/templates/PortfolioDetailTemplate.astro:218`

**설명**: `href={url as string}` — `Object.entries()`의 결과에서 `url`이 `unknown`인데 검증 없이 `string`으로 캐스팅.

**수정 방향**:
```astro
{Object.entries(project.links).map(([key, url]) => (
  typeof url === 'string' && (
    <li>
      <a href={url} ...>
```

---

### P1-10. `ExperienceDetailTemplate` — 하드코딩된 "Highlights" 문자열

**파일**: `src/components/templates/ExperienceDetailTemplate.astro:76`

**설명**: `<h2 class="section-title mb-6">Highlights</h2>` — 다른 섹션 제목은 `labels` 객체 사용하지만, Highlights만 영어로 하드코딩. 한국어 페이지에서도 "Highlights"로 표시.

**수정 방향**: `labels`에 `highlights` 키 추가 후 `{labels.highlights}` 사용.

---

### P1-11. 모바일 내비게이션 메뉴 없음

**파일**: `src/layouts/Layout.astro:54-73`

**설명**: 수평 flex 레이아웃만 있고 모바일용 햄버거 메뉴가 없음. 현재 링크 2개+토글 1개라 큰 문제는 아니지만, 작은 화면에서 여유 없음.

**수정 방향**: 현재 nav 항목이 3개뿐이라 긴급하지는 않으나, 향후 확장 대비 반응형 메뉴 고려.

---

### P1-12. 페이지 타이틀 비구체적

**파일**: `src/components/templates/ResumeTemplate.astro:43`

**설명**: `<Layout title="Resume | Portfolio">` — 이름이나 직함 없이 일반적인 제목.

**영향**: 검색 결과에서 "Resume | Portfolio"로만 표시 — 구분 불가.

**수정 방향**:
```astro
<Layout title={`${data.name} — ${data.title}`} ...>
```

---

## P2 — 개선 (여유 시 수정)

### P2-1. 템플릿 내 데이터 직접 fetch

**파일**:
- `src/components/templates/ResumeTemplate.astro:23-27`
- `src/components/templates/ResumePrintTemplate.astro:10-14`

**설명**: 템플릿 컴포넌트가 직접 `getEntry()` 호출 — 페이지에서 데이터를 props로 전달하는 것이 관심사 분리에 적합.

**수정 방향**: 페이지에서 데이터 fetch → 템플릿은 `data` prop만 받도록 리팩토링. (AGENTS.md에 "Template components: accept `lang: 'ko' | 'en'` prop, fetch their own data"로 현재 패턴이 의도된 것으로 문서화되어 있으므로, 팀 내 논의 후 결정.)

---

### P2-2. `basePath` 계산 로직 중복

**파일**: Layout.astro:13, ResumeTemplate.astro:40, ExperienceDetailTemplate.astro:25, PortfolioTemplate.astro:13, PortfolioDetailTemplate.astro:23

**설명**: `const basePath = lang === 'en' ? ... : ...` 패턴이 5곳에서 반복.

**수정 방향**: `src/utils/paths.ts`로 추출:
```typescript
export function getBasePath(lang: 'ko' | 'en'): string {
  return lang === 'en' ? `${import.meta.env.BASE_URL}/en` : import.meta.env.BASE_URL;
}
```

---

### P2-3. 인라인 스타일 컴포넌트의 하드코딩 색상

**파일**: `src/components/templates/ResumeTemplate.astro:338-343`

**설명**: `<style>` 블록에서 `#eff6ff`, `#dbeafe`, `#1d4ed8` 등 하드코딩 — `global.css`의 CSS 변수와 불일치 가능.

**수정 방향**: CSS 변수 `var(--color-primary-*)` 사용.

---

### P2-4. 프린트 스타일 3곳 분산

**파일**:
- `src/styles/global.css:82-221`
- `src/components/templates/ResumeTemplate.astro:358-384`
- `src/components/templates/ResumePrintTemplate.astro:40-390` (인라인 전체)

**설명**: 프린트 관련 CSS가 3개 파일에 흩어져 있어 일관성 유지 어려움.

**수정 방향**: `ResumePrintTemplate`은 독립 HTML이라 인라인 유지 불가피. `global.css`과 `ResumeTemplate` 사이의 중복만 정리.

---

### P2-5. `optional()` 필드에 `default()` 미적용

**파일**: `src/content.config.ts` 전반

**설명**: `highlights`, `projects`, `techStack` 등이 `.optional()`만 사용 — 템플릿에서 매번 `exp.highlights && exp.highlights.length > 0` 방어 필요.

**수정 방향**:
```typescript
highlights: z.array(z.string()).default([]),
projects: z.array(projectSchema).default([]),
techStack: z.array(z.string()).default([]),
```

---

### P2-6. JSON-LD 구조화 데이터 없음

**파일**: `src/layouts/Layout.astro`

**설명**: Person/ProfilePage 스키마 없음 — Google 리치 결과 활용 불가.

**수정 방향**: ResumeTemplate에서 JSON-LD 추가:
```astro
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "mainEntity": {
    "@type": "Person",
    "name": data.name,
    "jobTitle": data.title,
    "email": data.email,
    "url": canonicalURL
  }
})} />
```

---

### P2-7. 이미지 최적화 미적용

**파일**: `src/components/templates/PortfolioTemplate.astro:38-43`, `PortfolioDetailTemplate.astro:86-91`

**설명**: `<img>` 태그에 `width`/`height` 속성 없음, `srcset` 미사용, Astro의 `<Image>` 컴포넌트 미활용. `loading="lazy"` 는 적용됨.

**영향**: CLS (Cumulative Layout Shift) 발생, 불필요한 대용량 이미지 로딩.

**수정 방향**: Astro Image 컴포넌트 사용 또는 최소한 `width`/`height` 속성 추가.

---

### P2-8. 이미지 로딩 실패 시 fallback 없음

**파일**: `src/components/templates/PortfolioTemplate.astro:38-43`

**설명**: 이미지 로딩 실패 시 깨진 이미지 아이콘 표시.

**수정 방향**: `onerror` 핸들러로 placeholder 표시 또는 숨김 처리.

---

### P2-9. Google Fonts에 `crossorigin` 속성 불일치

**파일**: `src/layouts/Layout.astro:28`

**설명**: `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />` — `crossorigin`에 값이 없음. 기능적으로 `crossorigin="anonymous"`와 동일하지만 명시적 표기 권장.

---

### P2-10. PDF 스크립트 — 뷰포트 A4 비율 불일치

**파일**: `scripts/generate-pdf.ts:102-106`

**설명**: 뷰포트 `1200×1600`이지만 A4 비율은 `210:297` (≈ `1200:1697`). 미세한 차이지만 리플로우 가능성.

**수정 방향**: `height: Math.round(1200 * 297 / 210)` (= 1697)

---

### P2-11. PDF 스크립트 — Base URL 유효성 검증 없음

**파일**: `scripts/generate-pdf.ts:150-151`

**설명**: CLI에서 받은 `--base-url` 값을 검증 없이 사용.

**수정 방향**:
```typescript
try { new URL(baseUrl); } catch { throw new Error(`Invalid base URL: ${baseUrl}`); }
```

---

### P2-12. `ResumeTemplate` — `skill-badge` CSS 클래스 미사용

**파일**: `src/components/templates/ResumeTemplate.astro:334-355`

**설명**: `<style>` 블록에 `.skill-badge` 스타일이 정의되어 있으나, 템플릿 HTML에서 해당 클래스를 사용하는 요소가 없음. `global.css`에도 동일 스타일 존재.

**수정 방향**: `ResumeTemplate.astro`의 `<style>` 블록에서 미사용 `.skill-badge` 관련 CSS 제거.

---

### P2-13. `content.config.ts` — URL 프로토콜 미검증

**파일**: `src/content.config.ts` (모든 `.url()` 호출)

**설명**: `z.string().url()`은 `javascript:alert(1)` 같은 위험한 프로토콜도 허용.

**수정 방향**:
```typescript
const safeUrl = z.string().url().refine(
  url => url.startsWith('http://') || url.startsWith('https://'),
  'URL must use http or https protocol'
);
```

---

### P2-14. `README.md` 파일 구조 설명과 실제 구조 불일치

**파일**: `README.md`

**설명**: README는 `src/data/resume.json`, `src/data/resume.en.json` 경로를 안내하지만, 실제로는 `src/content/resume/ko.json`, `src/content/resume/en.json`에 위치. 또한 `src/pages/resume.astro` 파일은 존재하지 않음 (실제는 `index.astro`).

**수정 방향**: README를 실제 프로젝트 구조에 맞게 업데이트.

---

### P2-15. `PortfolioTemplate` — GitHub 링크에 `aria-label` 대신 `title` 사용

**파일**: `src/components/templates/PortfolioTemplate.astro:93`

**설명**: `title={labels.github}` 사용 — 스크린리더가 반드시 읽는 것은 아님. `aria-label`이 더 적합.

**수정 방향**: `title` → `aria-label` 변경 (또는 둘 다 추가).

---

## 콘텐츠 일관성 (ko.json ↔ en.json)

| 항목 | 상태 | 비고 |
|------|------|------|
| 구조 일관성 (배열 길이) | ✅ 통과 | 모든 배열 항목 수 일치 |
| 번역 완전성 | ✅ 통과 | 누락 번역 없음 |
| 날짜 일치 | ✅ 통과 | 모든 날짜 동일 |
| URL 일치 | ✅ 통과 | 동일 URL |
| Labels 완전성 | ✅ 통과 | 17개 모두 존재 |
| `experience[3].companyUrl` | ⚠️ 미설정 | SimpleHAN — 양쪽 모두 `companyUrl` 없음 (의도적일 수 있음) |
| 스키마 준수 | ✅ 통과 | Zod 스키마 완전 준수 |
| Portfolio 데이터 | ✅ 통과 | 7개 프로젝트 양언어 완전 |

---

## 잘 된 점 (Strengths)

1. **페이지→템플릿 위임 패턴** — 페이지가 1-5줄로 깔끔, 로직은 템플릿에 집중
2. **Content Collections + Zod** — 타입 안전한 데이터 관리 (개선 여지는 있지만 기반이 탄탄)
3. **다크모드 구현** — FOUC 방지, localStorage 저장, 시스템 설정 감지 모두 구현
4. **시맨틱 HTML** — `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>` 적절 사용
5. **외부 링크 보안** — `rel="noopener noreferrer"` 일관 적용
6. **프린트 최적화** — 전용 프린트 템플릿, 페이지 브레이크 제어, 색상 보정
7. **i18n 구조** — 라이브러리 없이 깔끔한 이중 언어 지원
8. **CI/CD** — 적절한 권한, 동시성 제어, npm ci 사용
9. **PDF 생성** — Puppeteer 사용, CLI 옵션, 에러 핸들링, 브라우저 정리
10. **콘텐츠 데이터 품질** — ko/en 완벽 일치, 빈 문자열이나 placeholder 없음

---

## 수정 우선순위 요약

### 즉시 (P0) — 7건
| # | 이슈 | 파일 | 노력 |
|---|------|------|------|
| P0-1 | 존재하지 않는 속성 참조 | 4개 파일 | 소 |
| P0-2 | `any` 타입 남용 | 3개 템플릿 + config | 중 |
| P0-3 | ATS 페이지 306줄 중복 | 2개 파일 | 중 |
| P0-4 | OG/Twitter 태그 누락 | Layout.astro | 소 |
| P0-5 | robots.txt / sitemap 부재 | public/ + config | 소 |
| P0-6 | hreflang 태그 누락 | Layout.astro | 소 |
| P0-7 | CI 타입 체크 누락 | deploy.yml | 소 |

### 다음 스프린트 (P1) — 12건
| # | 이슈 | 노력 |
|---|------|------|
| P1-1 | 다크모드 로직 중복 | 소 |
| P1-2 | Skip Link 없음 | 소 |
| P1-3 | 아이콘 aria-hidden 누락 | 소 |
| P1-4 | Active 네비게이션 없음 | 소 |
| P1-5 | 날짜 포맷 미검증 | 소 |
| P1-6 | 보안 헤더 미설정 | 소 |
| P1-7 | PDF 폰트 로딩 미보장 | 소 |
| P1-8 | PDF 재시도 로직 없음 | 중 |
| P1-9 | 안전하지 않은 타입 캐스팅 | 소 |
| P1-10 | 하드코딩 "Highlights" | 소 |
| P1-11 | 모바일 메뉴 없음 | 중 |
| P1-12 | 페이지 타이틀 비구체적 | 소 |

### 여유 시 (P2) — 15건
대부분 소규모 개선 — 성능 최적화, 코드 정리, 접근성 미세 조정.

---

## 다음 단계

이 리뷰를 작업 계획으로 전환하려면:
1. P0 이슈를 기반으로 `/start-work` 실행 가능한 플랜 생성 요청
2. P1/P2는 별도 스프린트로 계획

> 전체 이슈 34건 중 **P0 7건을 수정하면 사이트 품질이 크게 향상**됩니다.
