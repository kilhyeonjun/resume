# Test C Output (Actual Run)

실행 커맨드:
- `npm run build` (PASS)
- Python 기반 구조/포맷 검사 스크립트 실행 (Step 2~6)

| # | 검사 | 상태 | 상세 |
|---|---|---|---|
| 1 | Zod 빌드 검증 | PASS | `npm run build` 성공 (Astro build complete) |
| 2 | ko/en 구조 동기화 | PASS | top-level(main), experience/projects/highlights, skills, labels 구조 동기화 확인 |
| 3 | 날짜 형식 | FAIL | `period` 필드 64건이 `YYYY-MM`/`YYYY` 정규식 미준수 (예: `2025.01 ~ 2025.04`) |
| 4 | URL 프로토콜 | PASS | URL 필드가 모두 `http://` 또는 `https://`로 시작 |
| 5 | slug 고유성 | PASS | ko slug 중복 없음, ko/en slug 순서 및 값 일치 |
| 6 | labels 완전성 | PASS | `labelsSchema` 22개 키 모두 ko/en labels에 존재 |

최종 판정: **FAIL (1개 항목 실패: 날짜 형식)**
