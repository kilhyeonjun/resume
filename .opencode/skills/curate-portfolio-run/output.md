## curate-portfolio DRY RUN (Phase 1)

범위: `Phase 1: 현재 상태 확인`만 수행.  
데이터 변경 없음 (`src/data/portfolio.json` 읽기 전용).

### 1) 현재 프로젝트 수 확인

- 총 프로젝트 수: **10개**
- 권장 범위(3~5개) 대비 **과다** 상태
- 6개 이상 조건에 따라 아카이빙/우선순위 재정렬 후보 식별 필요

### 2) 프로젝트별 완성도(필수 필드) 점검

필수 필드 기준: `name`, `summary`, `description`, `highlights`, `skills`, `period`, `type`

검증 결과:
- 10/10 프로젝트 모두 필수 필드 존재
- ko/en 이중 필드(`name`, `summary`, `description`, `highlights`) 누락 없음
- slug 중복 없음, 프로젝트명(ko) 중복 없음

| slug | 필수 필드 누락 | ko/en 누락 | skills 수 | highlights(ko) 수 | 정량 성과 포함(ko highlights 기준) |
|---|---|---|---:|---:|---|
| ledgerly | 없음 | 없음 | 14 | 5 | 예 |
| daesin-logistics-bot | 없음 | 없음 | 14 | 5 | 예 |
| innovalley-menu-bot | 없음 | 없음 | 9 | 5 | 예 |
| concert-reservation | 없음 | 없음 | 8 | 5 | 예 |
| medical-recruit | 없음 | 없음 | 12 | 4 | 예 |
| startuppool | 없음 | 없음 | 7 | 5 | 예 |
| slack-clone | 없음 | 없음 | 9 | 5 | 예 |
| react-nodebird | 없음 | 없음 | 18 | 5 | 예 |
| multichat | 없음 | 없음 | 4 | 4 | **아니오** |
| trollgg | 없음 | 없음 | 11 | 5 | 예 |

### 3) 결측/과다/중복 점검

**결측**
- 구조적 결측(필수 필드, ko/en 하위 필드) 없음

**과다**
- 전체 프로젝트 수 10개로 포트폴리오 표면 밀도 과다
- 기술 나열 과다 가능성 후보:
  - `react-nodebird` skills 18개
  - `ledgerly`/`daesin-logistics-bot` skills 14개

**중복**
- slug/이름 중복 없음
- 다만, 오래된 "클론/학습형" 프로젝트(`slack-clone`, `react-nodebird`, `multichat`, `trollgg`) 비중이 높아 메시지 차별화 관점에서 중복 인상 가능

**정량 성과 누락**
- `multichat`은 highlights(ko)에 수치/비율/건수 기반 성과 표현 미검출

### 4) Phase 1 진단 분류 (추가/수정/삭제)

- **추가(Add)**: 없음 (현재 10개로 이미 과다)
- **수정(Modify)**:
  - `multichat`: 정량 성과/임팩트 문장 보강 필요
  - `react-nodebird`: skills 압축(핵심 기술 중심) 필요
  - 구형 프로젝트군의 summary/highlights 차별화 강화 필요
- **삭제/아카이브(Delete/Archive 후보)**:
  - 우선 후보군: `multichat`, `slack-clone`, `react-nodebird`, `trollgg` 중 포지셔닝 중복 항목
  - 최신/고임팩트 프로젝트(`ledgerly`, `daesin-logistics-bot`, `innovalley-menu-bot`, `concert-reservation`, `medical-recruit`) 중심 5~6개 재구성 권장

### 근거 실행 로그

- `src/data/portfolio.json` 전체 읽기 완료
- 진단 스크립트 출력:
  - `projects: 10`
  - `duplicate slugs: none`
  - `duplicate names: none`
  - 프로젝트별 `missing=none`, `langMissing=none` 확인
  - `multichat ... measurable=false` 확인
