# 코드 품질 체크리스트

## 1. Astro 컴포넌트 구조

### 1.1 페이지-템플릿 위임 패턴
- [ ] 모든 페이지가 thin wrapper 패턴 준수 (페이지에 비즈니스 로직 없음)
- [ ] 템플릿 컴포넌트가 `lang: 'ko' | 'en'` prop을 받아 데이터 fetch 수행
- [ ] `Astro.props` 디스트럭처링이 frontmatter에서 수행됨
- [ ] Props interface가 명시적으로 정의됨

### 1.2 컴포넌트 분리
- [ ] 단일 책임 원칙: 하나의 컴포넌트가 하나의 역할만 수행
- [ ] 반복되는 UI 패턴이 별도 컴포넌트로 추출됨
- [ ] 아이콘 컴포넌트가 `class?: string` prop 패턴 준수
- [ ] 템플릿 컴포넌트 간 중복 코드 최소화

### 1.3 Content Collection 사용
- [ ] `getEntry()` 호출이 올바른 collection ID 사용
- [ ] 데이터 접근 시 Zod 스키마 타입 활용
- [ ] 누락 데이터에 대한 `throw new Error()` 처리 (fail fast)

## 2. CSS 품질/중복

### 2.1 Tailwind 활용도
- [ ] 인라인 스타일 대신 Tailwind 유틸리티 클래스 사용 (print 템플릿 제외)
- [ ] 반복되는 유틸리티 조합이 `global.css`에 커스텀 클래스로 추출됨
- [ ] `@theme` 블록의 커스텀 색상이 일관되게 사용됨
- [ ] 사용되지 않는 커스텀 CSS 클래스 없음

### 2.2 다크모드 스타일
- [ ] 모든 색상 관련 클래스에 `dark:` variant 대응 존재
- [ ] 배경색, 텍스트색, 보더색 모두 다크모드 처리
- [ ] `global.css`의 `@custom-variant dark` 정의 활용

### 2.3 CSS 중복
- [ ] 동일 스타일 패턴이 여러 컴포넌트에서 반복되지 않음
- [ ] `global.css`의 `.section-title`, `.skill-badge` 등 공유 클래스 활용
- [ ] 컴포넌트 `<style>` 블록과 `global.css` 간 스타일 충돌 없음

## 3. 접근성 (WCAG AA)

### 3.1 시맨틱 HTML
- [ ] `<article>`, `<section>`, `<header>`, `<nav>`, `<footer>` 적절히 사용
- [ ] 헤딩 레벨(`h1`~`h6`)이 순서대로 사용됨 (건너뛰기 없음)
- [ ] `<main>` 랜드마크 존재
- [ ] 리스트 콘텐츠에 `<ul>`/`<ol>` 사용

### 3.2 ARIA 및 대체 텍스트
- [ ] 아이콘 전용 버튼/링크에 `aria-label` 존재
- [ ] 장식용 이미지에 `aria-hidden="true"` 또는 빈 `alt=""`
- [ ] 의미 있는 이미지에 설명적 `alt` 텍스트
- [ ] 외부 링크에 `rel="noopener noreferrer"` + `target="_blank"`

### 3.3 키보드/포커스
- [ ] 모든 인터랙티브 요소가 키보드로 접근 가능
- [ ] 포커스 순서가 시각적 순서와 일치
- [ ] 포커스 인디케이터가 시각적으로 명확
- [ ] 다크모드 토글 등 커스텀 버튼에 키보드 이벤트 처리

### 3.4 색상 대비
- [ ] 텍스트/배경 색상 대비 4.5:1 이상 (일반 텍스트)
- [ ] 대형 텍스트(18px+ bold 또는 24px+) 대비 3:1 이상
- [ ] 다크모드에서도 대비 기준 충족
- [ ] 색상만으로 정보를 전달하지 않음 (색맹 고려)

## 4. SEO 메타태그/OG/구조화 데이터

### 4.1 기본 메타태그
- [ ] `<title>` 태그 존재 및 페이지별 고유
- [ ] `<meta name="description">` 존재 및 적절한 길이 (120~160자)
- [ ] `<html lang="ko">` 또는 `<html lang="en">` 올바르게 설정
- [ ] `<meta charset="utf-8">` 존재
- [ ] `<meta name="viewport">` 반응형 설정

### 4.2 Open Graph
- [ ] `og:title`, `og:description`, `og:type` 존재
- [ ] `og:url`에 canonical URL 설정
- [ ] `og:image` 존재 (소셜 공유 시 미리보기)
- [ ] `og:locale` 언어별 설정 (`ko_KR`, `en_US`)

### 4.3 구조화 데이터
- [ ] JSON-LD `Person` 스키마 존재 (이력서 사이트)
- [ ] `name`, `jobTitle`, `url`, `sameAs` 필드 포함
- [ ] 구조화 데이터가 실제 콘텐츠와 일치
- [ ] Google Rich Results Test 통과 가능한 형식

### 4.4 Canonical/Alternate
- [ ] `<link rel="canonical">` 존재
- [ ] ko/en 페이지 간 `<link rel="alternate" hreflang="...">` 설정
- [ ] `sitemap.xml` 생성 여부

## 5. 성능 (이미지 최적화/번들/LCP)

### 5.1 이미지 최적화
- [ ] 이미지에 `width`/`height` 속성 명시 (CLS 방지)
- [ ] 적절한 이미지 포맷 사용 (WebP/AVIF 우선)
- [ ] `loading="lazy"` 적용 (above-the-fold 제외)
- [ ] Astro `<Image>` 컴포넌트 활용 여부

### 5.2 번들 최적화
- [ ] 불필요한 JavaScript 번들 없음 (SSG이므로 최소화)
- [ ] 인라인 스크립트가 `is:inline` 또는 적절한 로딩 전략 사용
- [ ] Google Fonts 로딩 최적화 (`display=swap`, `preconnect`)
- [ ] 사용하지 않는 CSS/JS 제거

### 5.3 LCP (Largest Contentful Paint)
- [ ] 메인 콘텐츠(Summary, 이름 등)가 서버 렌더링됨 (SSG)
- [ ] 폰트 로딩이 텍스트 렌더링을 차단하지 않음
- [ ] Critical CSS가 인라인 또는 빠르게 로드됨
- [ ] 다크모드 FOUC 방지 인라인 스크립트 존재

## 6. 타입 안전성

### 6.1 TypeScript strict 준수
- [ ] `as any`, `@ts-ignore`, `@ts-expect-error` 사용 없음
- [ ] Props interface가 모든 컴포넌트에 정의됨
- [ ] Zod 스키마에서 추론된 타입 활용 (`z.infer<typeof schema>`)
- [ ] optional 필드에 대한 null/undefined 처리

### 6.2 Content Collection 타입
- [ ] `content.config.ts`의 스키마가 실제 JSON 구조와 일치
- [ ] 타입 export가 필요한 곳에서 import되어 사용됨
- [ ] 런타임 타입 에러 가능성 없음

## 7. 에러 처리

### 7.1 빌드 타임 에러
- [ ] 필수 데이터 누락 시 `throw new Error()` (빌드 실패로 감지)
- [ ] Content Collection 로드 실패 시 명확한 에러 메시지
- [ ] 환경 변수 누락 시 적절한 fallback 또는 에러

### 7.2 런타임 안전성
- [ ] 다크모드 스크립트의 localStorage 접근 시 try/catch
- [ ] 외부 리소스(폰트, 이미지) 로드 실패 시 fallback
- [ ] PDF 생성 스크립트의 에러 처리 및 `process.exit(1)`

## 8. 코드 중복

### 8.1 템플릿 간 중복
- [ ] `ResumeTemplate`과 `ResumePrintTemplate` 간 공유 가능한 로직 식별
- [ ] ko/en 페이지 간 중복 코드 없음 (lang prop으로 분기)
- [ ] 경력 상세 페이지 간 공통 패턴 추출

### 8.2 유틸리티 함수
- [ ] 날짜 포맷팅, 경로 생성 등 반복 로직이 유틸리티로 추출됨
- [ ] `import.meta.env.BASE_URL` 사용이 유틸리티로 통합됨
- [ ] 동일 데이터 변환 로직이 여러 곳에서 반복되지 않음
