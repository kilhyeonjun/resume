# HR Print PDF 리뷰 가이드

## 범위

- `src/pages/resume-print.astro` (ko), `src/pages/en/resume-print.astro` (en)
- `src/components/templates/ResumePrintTemplate.astro` — Print 전용 템플릿
- `src/utils/resume-data.ts` — HR print surface projection 기준
- `scripts/generate-pdf.ts` — Puppeteer PDF 생성 스크립트
- `src/content/resume/{ko,en}.json` — 이력서 데이터

**주의**: ResumePrintTemplate.astro는 `Layout.astro`를 사용하지 않는 독립 HTML. 자체 `<html>`, inline style 사용.

## 사용할 체크리스트

8개: data-accuracy, hr-perspective, writing-ko, writing-en, structure, hr-deep, position-fit, ai-detection

## Print PDF 특화 검증 기준

### 1. 페이지 수 제한

- **2페이지 이내** 권장 (HR용 이력서 표준)
- 3페이지 이상이면 경력 요약 수준 조정 필요
- 페이지 수 확인: `npm run pdf:hr` 실행 후 PDF 열어 확인

### 2. 인쇄 스타일

- ResumePrintTemplate은 **inline style** 사용 (Tailwind 미사용)
- `no-print` 클래스: nav, footer, 언어 전환 버튼 등 인쇄 시 숨김
- `@media print` 스타일이 의도대로 적용되는지
- 컬러 → 흑백 인쇄 시에도 가독성 유지

### 3. Page Break 처리

- `page-break-inside: avoid` — 경력/프로젝트 블록이 페이지 중간에서 잘리지 않음
- `page-break-before` / `page-break-after` 의도적 페이지 나눔 확인
- 긴 프로젝트(details 10개)가 페이지를 넘길 때 레이아웃 깨짐 없음

### 4. Puppeteer 설정

`scripts/generate-pdf.ts` 확인:
- PDF 용지 크기: A4 (210mm x 297mm)
- 여백(margin) 설정 적절성
- `printBackground: true` — 배경색 인쇄 포함 여부
- 대기 시간: 페이지 로드 완료 후 PDF 생성 (`waitForNavigation` 등)

### 5. 폰트/타이포그래피

- 인쇄 시 가독성 높은 폰트 크기 (본문 10~12pt)
- 줄 간격(line-height) 적절 (1.3~1.6)
- Google Fonts(Inter 등) 로드 완료 후 PDF 생성되는지
- 한글/영문 폰트 혼합 시 정렬 일관성

### 6. 링크/URL 렌더링

- LinkedIn, GitHub URL이 텍스트로 표시되는지 (하이퍼링크 대신)
- 회사 URL이 인쇄 시 보이는지 또는 숨겨지는지
- 이메일 주소 표시 형식

### 7. 여백/레이아웃

- CSS `@page` margin과 Puppeteer margin이 충돌하지 않음
- 좌우 여백 균형 (15~25mm 권장)
- 상하 여백에 헤더/푸터 공간 확보
- 컨텐츠가 여백 침범하지 않음

## 검증 방법

1. `npm run dev` 실행 (PDF 생성 전 필수)
2. `npm run pdf:hr` — HR PDF 생성
3. `dist/pdf/resume-hr-ko.pdf`, `dist/pdf/resume-hr-en.pdf` 실제 파일 확인 (`Read` 기반 페이지/텍스트 확인)
4. 필요 시 print 라우트(`/resume-print`, `/en/resume-print`)를 브라우저에서 열어 인쇄 전 렌더링과 PDF 결과 차이 비교
5. 페이지 수, 레이아웃, 폰트, 줄바꿈, 페이지 분할 기록
6. 데이터 검증 — ko.json/en.json + `src/utils/resume-data.ts` 기반 체크리스트 순회

PDF는 생성 명령만으로 검토 완료로 간주하지 않는다. 실제 생성된 결과물의 페이지 수와 텍스트 가독성을 확인해야 한다.

## 출력

리뷰 결과를 `assets/review-output-template.md` 형식으로 작성.
Print PDF 리뷰는 8개 체크리스트를 사용.
