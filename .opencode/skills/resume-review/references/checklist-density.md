# 밀도 검증 체크리스트

이력서 콘텐츠의 밀도가 각 렌더링 표면(웹/HR PDF/ATS PDF/경력상세/포트폴리오)의 목적에 맞는지 검증한다.

## 표면별 기준

| 표면 | 목적 | 밀도 | details 기준 | 총 기준 |
|------|------|------|-------------|--------|
| 웹 이력서 | 첫인상, 5초 훅 | Light | featured 프로젝트당 3~4개 | - |
| HR PDF | 인간 리뷰어, 7.4초 | Medium | 프로젝트당 3~5개 | 2페이지 이내 |
| ATS PDF | 기계 파싱 | Low | 키워드 중심, 밀도 무관 | 단일 컬럼 확인 |
| 경력상세 | 기술 딥다이브 | High | 제한 없음 | - |
| 포트폴리오 | 케이스 스터디 | Medium | 프로젝트당 3~5개 | 3~5개 프로젝트 |

## 검증 항목

### D1. 프로젝트당 details 수
- PASS: 모든 프로젝트의 details ≤ 6개
- WARN: 1개 이상 프로젝트의 details > 6개
- 검증 방법: ko.json의 experience[].projects[].details.length 확인

### D2. 총 bullet 수
- PASS: highlights + details ≤ 80개
- WARN: 80개 초과
- 검증 방법: experience[].highlights.length + experience[].projects[].details.length 합산

### D3. 개별 detail 길이
- PASS: 모든 details ≤ 100자
- WARN: 1개 이상 100자 초과
- 검증 방법: KO 기준 문자 수 확인

### D4. HR PDF 페이지 수
- PASS: 2페이지 이내
- WARN: 3페이지 이상
- 검증 방법: PDF 생성 후 페이지 수 확인

### D5. ATS 단일 컬럼
- PASS: 복잡한 레이아웃 요소 없음
- FAIL: table/multi-column/그래픽 사용
