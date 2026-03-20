# ATS PDF 리뷰 가이드

## 범위

- `src/pages/resume-ats.astro` (ko), `src/pages/en/resume-ats.astro` (en)
- ATS(Applicant Tracking System) 파싱 최적화 전용 PDF
- `src/utils/resume-data.ts` — ATS surface projection 기준
- `scripts/generate-pdf.ts` — Puppeteer PDF 생성
- `src/content/resume/{ko,en}.json` — 이력서 데이터

## 사용할 체크리스트

8개: data-accuracy, hr-perspective, writing-ko, writing-en, structure, hr-deep, position-fit, ai-detection

## ATS 특화 검증 기준

### 1. 텍스트 추출 가능성

ATS의 핵심은 **텍스트 파싱**:
- [ ] 모든 텍스트가 복사/붙여넣기 가능 (이미지 텍스트 X)
- [ ] PDF에서 텍스트 선택 시 올바른 순서로 선택됨
- [ ] 특수 문자(→, ·, %) 가 ATS 파서에서 깨지지 않는지 고려
- [ ] 한글/영문 혼합 텍스트의 인코딩 문제 없음

### 2. 표준 섹션 제목

ATS는 표준 섹션명을 기대함:
- [ ] "Experience" / "경력" — 표준 제목 사용
- [ ] "Education" / "학력" — 표준 제목 사용
- [ ] "Skills" / "기술" — 표준 제목 사용
- [ ] labels 객체의 값이 ATS 친화적인 표준명인지 확인
- [ ] 커스텀 섹션명("What I Did" 등) 사용 자제

### 3. 단일 컬럼 레이아웃

- [ ] 2단 컬럼 레이아웃 사용 X — ATS가 좌우 순서를 혼동할 수 있음
- [ ] 사이드바 없음
- [ ] 텍스트 흐름이 위→아래로 단일 방향

### 4. 이미지/아이콘 제거

- [ ] SVG 아이콘 사용 X (ATS가 파싱 불가)
- [ ] 프로필 사진 X
- [ ] 장식용 구분선은 CSS border 사용 (이미지 X)

### 5. 표 최소화

- [ ] HTML `<table>` 사용 최소화 (ATS에 따라 파싱 실패 가능)
- [ ] 기술 스택은 쉼표 구분 텍스트 또는 단순 리스트로
- [ ] 날짜/기간은 표가 아닌 텍스트 형식

### 6. 키워드 밀도

- [ ] 타겟 포지션의 핵심 키워드가 자연스럽게 포함
- [ ] 기술 키워드: 프로그래밍 언어, 프레임워크, 클라우드, DB
- [ ] 방법론 키워드: Agile, TDD, CI/CD, Event-Driven
- [ ] 키워드 스터핑(과도한 반복) 없이 자연스러운 밀도

### 7. URL 처리

- [ ] 하이퍼링크 대신 URL 인라인 텍스트 표시
- [ ] GitHub: `github.com/username` 형식
- [ ] LinkedIn: `linkedin.com/in/username` 형식
- [ ] ATS가 하이퍼링크를 파싱하지 못하는 경우 대비

### 8. 분량

- [ ] **3페이지 이내** (ATS PDF는 Print PDF보다 길어질 수 있음)
- [ ] 경력이 10년 이상이 아니면 2페이지 권장
- [ ] 모든 경력을 포함하되, 오래된 경력은 간략히

## 검증 방법

1. `npm run dev` 실행
2. `npm run pdf:ats` — ATS PDF 생성
3. 생성된 PDF를 실제 확인하고 텍스트 추출/복사 결과를 검토
4. `dist/pdf/resume-ats-ko.pdf`, `dist/pdf/resume-ats-en.pdf`를 `Read`로 읽어 페이지 수와 파싱 결과 확인
5. ats 라우트(`/resume-ats`, `/en/resume-ats`)를 브라우저에서 열어 단일 컬럼/가독성 확인
6. 데이터 검증 — ko.json/en.json + `src/utils/resume-data.ts` 기반 체크리스트 순회

ATS 리뷰는 정적 데이터 검토만으로 끝내지 않는다. 실제 PDF 결과와 텍스트 파싱 가능성까지 반드시 확인한다.

## 출력

리뷰 결과를 `assets/review-output-template.md` 형식으로 작성.
ATS PDF 리뷰는 8개 체크리스트 + ATS 특화 기준.
