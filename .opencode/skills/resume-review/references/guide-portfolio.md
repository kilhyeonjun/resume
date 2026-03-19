# 포트폴리오 리뷰 가이드

## 범위

- `src/pages/portfolio/index.astro` — 포트폴리오 목록
- `src/pages/portfolio/[slug].astro` — 포트폴리오 상세
- `src/pages/en/portfolio/index.astro` — 포트폴리오 목록 (en)
- `src/pages/en/portfolio/[slug].astro` — 포트폴리오 상세 (en)
- `src/components/templates/PortfolioTemplate.astro` — 목록 렌더링
- `src/components/templates/PortfolioDetailTemplate.astro` — 상세 렌더링
- `src/data/portfolio.json` — 포트폴리오 데이터
- `src/content/resume/{ko,en}.json` — 이력서 데이터 (교차 검증용)

## 사용할 체크리스트

7개: data-accuracy, technical, writing-ko, writing-en, structure, code-quality, ui-ux

(hr-perspective는 포트폴리오에 미적용 — 포트폴리오는 STAR/featured 개념과 무관)

## 포트폴리오 특화 검증 기준

### 1. portfolio.json <-> resume JSON 정합성

- [ ] 포트폴리오 프로젝트가 이력서 경력의 프로젝트와 대응되는지
- [ ] 기술 스택이 이력서 프로젝트 techStack과 일치
- [ ] 프로젝트 설명이 이력서 details/description과 모순 없음
- [ ] 날짜/기간이 이력서 데이터와 일치

### 2. 프로젝트 설명 품질

- [ ] 각 포트폴리오 항목에 충분한 설명이 있음
- [ ] 기술적 도전과 해결 방안이 포함됨
- [ ] 이력서보다 더 상세한 기술 설명 제공 (포트폴리오의 목적)
- [ ] 코드 예시나 아키텍처 설명 포함 여부

### 3. 이미지/스크린샷

- [ ] 프로젝트별 대표 이미지 존재 여부
- [ ] 이미지 해상도 및 크기 적절성
- [ ] alt 텍스트 포함 (접근성)
- [ ] 이미지 파일 경로가 유효

### 4. 외부 링크 유효성

- [ ] GitHub 저장소 링크 유효 (404 아님)
- [ ] 라이브 데모 링크 유효 (배포된 사이트)
- [ ] 관련 블로그 포스트 링크 유효
- [ ] `target="_blank"` + `rel="noopener noreferrer"` 적용

### 5. 카드 레이아웃 균형

목록 페이지에서:
- [ ] 카드 크기 일관성 (이미지 크기, 설명 길이)
- [ ] 홀수 카드 처리 (마지막 행에 1개일 때 레이아웃)
- [ ] 반응형: 모바일에서 1열, 태블릿 2열, 데스크탑 3열 등 브레이크포인트
- [ ] 카드 내 정보 계층: 프로젝트명 > 기술 > 설명

### 6. 네비게이션

- [ ] 목록 → 상세 → 목록 네비게이션 순환 가능
- [ ] 이력서 경력 상세 페이지와의 상호 링크
- [ ] 뒤로 가기 버튼/링크 존재
- [ ] base path (`/resume/`) 적용 확인

## 검증 방법

1. `src/data/portfolio.json` 읽기
2. `src/content/resume/{ko,en}.json`과 교차 검증
3. 템플릿 파일 확인 — 렌더링 로직이 데이터를 올바르게 표시하는지
4. 빌드 검증 — `npm run build` 성공 확인

## 출력

리뷰 결과를 `assets/review-output-template.md` 형식으로 작성.
포트폴리오 리뷰는 7개 체크리스트 + 포트폴리오 특화 기준.
