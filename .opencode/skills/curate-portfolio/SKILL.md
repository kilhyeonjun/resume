---
name: curate-portfolio
description: |
  포트폴리오 프로젝트를 추가/수정/삭제하거나, 기존 portfolio.json 품질을 끌어올려야 할 때 반드시 사용하는 큐레이션 스킬.
  "포트폴리오 추가", "포트폴리오 업데이트", "프로젝트 추가", "portfolio update", "add project to portfolio", "포트폴리오 수정" 요청이 나오면 즉시 실행한다.
  사용자가 Ledgerly, StartupPool, Concert Reservation처럼 특정 포트폴리오 프로젝트명을 직접 언급하면 강한 트리거로 간주하고 바로 적용한다.
  이 스킬은 내용 선별 + 문장 품질 검증 + 빌드 확인까지 한 번에 처리해, 포트폴리오를 채용 관점에서 읽히는 상태로 유지한다.
---

# curate-portfolio

포트폴리오는 프로젝트 목록이 아니라, "왜 이 프로젝트를 보여줘야 하는지"를 빠르게 증명하는 채용 문서다.
이 스킬은 `src/data/portfolio.json`을 안전하게 관리하면서, 각 프로젝트가 문제-역할-기술-결과를 명확히 전달하도록 품질 게이트를 강제한다.

## Purpose

`portfolio.json`의 프로젝트를 추가/수정/삭제하고, 각 프로젝트가 채용 담당자에게 효과적으로 어필하도록 품질을 보장한다.

## When to Run

- 새 프로젝트를 포트폴리오에 추가할 때
- 기존 프로젝트 내용을 업데이트할 때
- 포트폴리오 전체를 정리하거나 압축할 때
- 특정 프로젝트명(예: Ledgerly, Startuppool, medical-recruit)이 직접 언급될 때

## 읽을 파일

작업 시작 전에 아래 파일을 반드시 읽고 현재 상태를 파악한다.

| 파일 | 목적 |
|---|---|
| `src/data/portfolio.json` | 현재 포트폴리오 데이터 구조와 품질 상태 확인 |
| `.opencode/skills/resume-review/references/checklist-editing-feedback.md` | 문장 편집 피드백 루프 7항목 점검 |

## 4-Phase Workflow

### Phase 1: 현재 상태 확인

먼저 "무엇을 바꿀지"보다 "현재가 어떤 상태인지"를 정리한다.

1. `src/data/portfolio.json` 전체 읽기
2. 현재 프로젝트 수 확인
   - 권장 범위: 3~5개
   - 6개 이상이면 우선순위 재정렬 또는 아카이빙 후보를 식별
3. 프로젝트별 완성도 점검
   - 필수 필드: `name`, `summary`, `description`, `highlights`, `skills`, `period`, `type`
4. 결측/과다/중복 확인
   - 동일한 메시지 반복 여부
   - 과도한 기술 나열 여부
   - 정량 성과 누락 여부

진단 결과는 "추가/수정/삭제" 3분류로 정리한다.

### Phase 2: 초안 작성

각 프로젝트 문안은 아래 4파트 흐름을 기본 구조로 작성한다.

1. 문제/목적
2. 역할/기여
3. 기술 선택 이유
4. 결과/임팩트

작성 규칙:

- `summary`: 1문장으로 프로젝트 핵심을 즉시 전달
- `highlights`: 3~5개, 가능하면 정량 성과 포함
- `skills`: 실제 사용 기술만 기록 (과장 금지)
- `description`: 4파트가 모두 보이도록 구성
- ko/en 의미 동기화 유지

권장 패턴:

- KO는 밀도 높은 명사형/서술형 혼합으로 간결하게
- EN은 과거형 동사 중심으로 명확하게
- 링크(`live`, `github`)는 신뢰성 근거로 활용

### Phase 3: 피드백 루프

초안을 바로 반영하지 말고, 편집 품질 점검을 반드시 거친다.

참조 체크리스트:

- `.opencode/skills/resume-review/references/checklist-editing-feedback.md`

7항목 적용:

1. 어순
2. 문체 일관성
3. AI 슬롭
4. 과장
5. HR 가독성
6. 부정 인식
7. ATS 호환

운영 원칙:

- FAIL 항목이 1개라도 있으면 수정 후 재검토
- 최대 3라운드 반복
- 3라운드 내 PASS를 목표로 문장만 국소 수정

### Phase 4: 적용 + 검증

검증 통과 후에만 `portfolio.json`에 반영한다.

1. `src/data/portfolio.json` 수정 적용
2. 빌드 검증 실행

```bash
npm run build
```

3. 포트폴리오 페이지 렌더링 확인
   - 리스트: `/portfolio/`
   - 상세: `/portfolio/[slug]`
4. 깨진 링크/누락 필드/타입 불일치 최종 점검

빌드가 실패하면 적용 완료로 간주하지 않는다.

## 포트폴리오 품질 기준

- 튜토리얼 프로젝트 금지 (`todo`, `weather`, `calculator`)
- 각 프로젝트에 measurable outcome 최소 1개 이상
- `live URL` 또는 `GitHub URL` 최소 1개 이상
- `description`은 문제→역할→기술→결과 4파트를 포함
- `highlights`는 "기술 나열"이 아니라 "성과 중심"으로 작성
- 프로젝트 간 메시지 중복을 줄이고 차별점을 유지

## Related Files

- `src/data/portfolio.json`
- `src/components/templates/PortfolioTemplate.astro`
- `src/components/templates/PortfolioDetailTemplate.astro`

## Exceptions

1. 회사 프로젝트는 NDA로 live URL이 없을 수 있음
   - GitHub/URL이 없어도 예외 허용
2. 오픈소스 기여는 별도 포트폴리오 프로젝트로 추가 가능

## 결과 보고 형식

최종 응답은 아래 순서로 간단히 정리한다.

1. 현재 상태 요약 (프로젝트 수, 추가/수정/삭제 대상)
2. 초안 변경점 (summary/description/highlights/skills)
3. 피드백 루프 결과 (라운드 수, FAIL→PASS 전환)
4. 적용 파일 및 검증 결과 (`npm run build`, 렌더링 확인)

## 주의사항

- 근거 없는 수치/성과를 새로 만들지 않는다.
- 내부 URL, 티켓 키, 계정 ID, 실명 등 민감정보는 노출하지 않는다.
- 포트폴리오를 "많이" 채우는 것보다 "강한 프로젝트" 중심으로 유지한다.
- 삭제 시에는 대체 가치(중복 제거, 포지셔닝 개선)를 함께 설명한다.

## 빠른 트리거 예시

- "포트폴리오에 프로젝트 하나 추가해줘"
- "Ledgerly 설명 업데이트해줘"
- "portfolio update: remove old project and tighten highlights"
- "add project to portfolio with measurable impact"
- "포트폴리오 수정하고 빌드까지 확인해줘"
