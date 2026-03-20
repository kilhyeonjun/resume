# 웹 이력서 리뷰 가이드

## 범위

- `src/pages/index.astro` (ko), `src/pages/en/index.astro` (en)
- `src/components/templates/ResumeTemplate.astro` — 메인 렌더링 로직
- `src/utils/resume-data.ts` — 웹 surface projection 기준
- `src/layouts/Layout.astro` — 전체 레이아웃 (nav, header, footer, dark mode)
- `src/styles/global.css` — Tailwind 테마, 공유 스타일, print 스타일
- `src/content/resume/{ko,en}.json` — 이력서 데이터

## 사용할 체크리스트

전체 11개: data-accuracy, hr-perspective, technical, writing-ko, writing-en, structure, code-quality, ui-ux, hr-deep, position-fit, ai-detection

## 웹 특화 검증 기준

### 1. 7.4초 첫인상

페이지 로드 시 스크롤 없이 보이는 영역(above-the-fold)에:
- 이름, 직함, 핵심 스킬이 즉시 보이는지
- Summary가 간결하게 핵심 전달하는지
- 시각적 계층 구조가 F-shape 스캔 패턴에 맞는지

### 2. 반응형 디자인

- 모바일(< 640px), 태블릿(640~1024px), 데스크탑(1024px+) 브레이크포인트
- Tailwind CSS 반응형 프리픽스(`sm:`, `md:`, `lg:`) 사용 확인
- 긴 techStack 목록이 모바일에서 오버플로우 없이 표시되는지
- 테이블/리스트가 모바일에서 읽기 편한 레이아웃으로 전환되는지
- 핵심 역량 그리드가 태블릿/데스크톱에서 orphan 카드 없이 균형 있게 보이는지

### 3. 다크모드

- `dark:` 프리픽스가 모든 컬러 관련 유틸리티에 적용
- 텍스트 대비비 WCAG AA 이상 (일반 텍스트 4.5:1, 큰 텍스트 3:1)
- 배경색/전경색 전환 시 가독성 유지
- `global.css`의 `@custom-variant dark` 설정 확인

### 4. 접근성

- 아이콘 전용 버튼/링크에 `aria-label` 존재
- 시맨틱 HTML 사용: `<article>`, `<section>`, `<header>`, `<nav>`, `<footer>`
- 외부 링크: `target="_blank"` + `rel="noopener noreferrer"`
- 터치 타겟 최소 44x44px (모바일)
- `<html lang="ko">` 또는 `lang="en"` 설정

### 5. 네비게이션

- 언어 전환 링크 작동 (ko <-> en)
- 경력 상세 페이지 링크 정상
- 포트폴리오 링크 정상
- base path (`/resume/`) 적용 확인 — `import.meta.env.BASE_URL` 사용

### 6. 외부 링크

- 회사 URL 링크 유효성
- GitHub/LinkedIn 등 소셜 링크 유효성
- `target="_blank"` + `rel="noopener noreferrer"` 일괄 적용

### 7. 핵심 역량 섹션 특화 검증

- `핵심 역량` 카테고리들이 카드/컬럼 단위로 즉시 구분되는지
- 마지막 행에 혼자 떨어지는 카테고리가 시각적으로 어색하지 않은지
- 각 bullet이 좁은 컬럼 안에서 2~3줄 이상 과도하게 꺾이지 않는지
- 수치/기술명/성과가 한 줄에 과밀하게 몰려 보이지 않는지
- `핵심 역량` 섹션이 바로 아래 `경력` 섹션과 충분히 다른 위계로 읽히는지

## 검증 방법

1. `npm run build` — 빌드 성공 확인 (exit code 0)
2. LSP diagnostics — 타입 에러 확인
3. `npm run dev` 실행
4. `agent-browser` 또는 `webapp-testing`으로 `/`, `/en/`을 desktop/mobile에서 실제 확인
5. desktop + mobile full-page screenshot 저장
6. 데이터 검증 — ko.json/en.json + `src/utils/resume-data.ts` 읽어 체크리스트 항목 순회

브라우저 확인은 선택이 아니라 필수다. above-the-fold, line length, 모바일 가독성, 상세 진입 링크 식별성, 핵심 역량의 그리드 균형/카테고리 구분/줄바꿈 밀도를 실제 화면 기준으로 기록한다.

## 출력

리뷰 결과를 `assets/review-output-template.md` 형식으로 작성.
웹 리뷰는 11개 체크리스트 전체를 사용하므로 카테고리별 점수 11개 + 종합 점수.
