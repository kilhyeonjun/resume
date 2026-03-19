# Test D Output (Actual Run)

실행 커맨드:
- Python 기반 규칙 검증 스크립트 실행 (Step 1~6)
- `npm run build` 실행 (Step 7)

| # | 검사 | 상태 | 상세 |
|---|---|---|---|
| 1 | Page thin wrapper | PASS | 페이지들이 Template 위임 패턴 준수 |
| 2 | ko/en 미러링 | PASS | KO 페이지 대응 EN 페이지 누락 없음 |
| 3 | Props 인터페이스 | PASS | Template/Resume 컴포넌트 `interface Props` + `Astro.props` 패턴 확인 |
| 4 | 외부 링크 보안 | PASS | `target="_blank"` 사용 링크에 `rel="noopener noreferrer"` 누락 없음 |
| 5 | BASE_URL 사용 | PASS | 하드코딩 `href="/resume..."` 위반 없음 |
| 6 | HTML 태그 균형 | PASS | Template 파일 기본 태그 밸런스 검사 통과 |
| 7 | Astro 빌드 | PASS | `npm run build` 성공 |

최종 판정: **PASS**
