# Monthly Resume Addition (Dry Run)

## Scope
- Request: "이번 달 새로 한 작업들 이력서에 추가"
- Mode: DRY RUN only (no edits to `ko.json` / `en.json`)
- Source: `~/.work-data/gameduo/*.json` (4 domain files)
- Current month 기준: `2026-03`

## 1) Latest work-data pull
- Command run: `git pull` in `~/.work-data/gameduo`
- Result: `Already up to date.`

## 2) Current month items (2026-03)

### Raw count
- Total: 13 items
- done: 8
- in_progress: 5

### Worthiness filter (resume-grade)
Selection rule used:
1. User impact / reliability / architecture change
2. Reusable pattern or cross-system effect
3. Resume narrative fit with existing GameDuo projects

| ID | Status | Decision | Reason |
|---|---|---|---|
| mkt-0113 | done | include | NAS sync 자동화 + outbox + 상태추적 + 경로 버저닝 (운영 신뢰성/아키텍처) |
| mkt-0114 | done | include | FE 가시성/재시도 UX 보강으로 운영 대응 시간 단축 가치 |
| sheet-0115 | in_progress | include (optional) | 서버 전용 static-data 차단(보안/치팅 리스크) + 22h 규모 |
| sheet-0117 | in_progress | include (optional) | refreshAllJson 블로킹/연쇄 장애 완화 + 메모리 피크 80-90% 감소 |
| kit-0053 | in_progress | include (optional) | 공통 스케줄 패키지 설계(boilerplate 제거, 재사용성) |
| sheet-0118 | in_progress | include (short) | health check retry/backoff로 cloud-data-sync 실패 방어 |
| sheet-0114 | done | include (short) | LMK 번역 설정 버전 단위화 (모델/인덱스/API 정합성) |
| sheet-0116 | done | include (short) | capabilities API로 FE/BE 기능 판별 단일화 + fallback |
| misc-0187 | done | include (short) | LMK 벌크 수정 커넥션 풀 이슈 대응 |
| sheet-0119 | done | exclude | 마이그레이션 선행 스키마(직접 임팩트 약함) |
| misc-0188 | done | exclude | 문의 대응 성격, 이력서 임팩트 낮음 |
| misc-0189 | done | exclude | 분석성 단건 대응, 임팩트/완결성 낮음 |
| misc-0190 | in_progress | exclude | 회의성 항목 |

## 3) Draft resume content (KO/EN)

아래는 기존 `GameDuo` 경험 내 프로젝트 `details`에 추가 가능한 초안이다.

---

### A. 마케팅 통합 플랫폼 / Marketing Integrated Platform

#### KO draft (add detail bullets)
- "NAS 동기화 운영 신뢰성 강화: 파일 교체 성공 시 NAS sync outbox 이벤트를 자동 발행(비동기, API 비차단)하고 `asset_nas_sync` 상태(PENDING/PROCESSING/COMPLETED/FAILED) 추적 + `nasAvailability` 리셋을 적용해 수동 동기화 의존도를 제거"
- "교체 이력 운영 UX 고도화: NAS 상태 배지(필요/진행/완료/실패), `latestNasPath`/`lastNasSyncedAt` 조건부 노출, 경로 copy, 실패 에러 메시지·재시도 진입점 제공으로 운영 가시성 개선"
- "NAS 경로 정책 개선: 버전 누적 방식으로 경로 overwrite를 방지해 자산 이력 보존성과 롤백 용이성 확보"

#### EN draft (paired translation)
- "Improved NAS sync reliability by auto-publishing NAS sync outbox events after file replacement (async, non-blocking API), tracking `asset_nas_sync` states (PENDING/PROCESSING/COMPLETED/FAILED), and resetting `nasAvailability` to remove manual sync dependency"
- "Expanded replacement-history operability with NAS status badges (required/in-progress/completed/failed), conditional `latestNasPath`/`lastNasSyncedAt` visibility, path copy action, and failure retry entry points"
- "Refined NAS path policy to append versioned paths and prevent overwrite, improving asset history retention and rollback readiness"

---

### B. Cloud Data 동기화 시스템 / Cloud Data Sync System

#### KO draft
- "Cloud Data Sync 헬스체크 안정화: `checkServerHealth`에 최대 3회 재시도 + exponential backoff(5s/10s) 적용으로 일시적 부하 시 동기화 실패를 방어하고 10분 Timeout Monitor 제약 내 운영 안정성 확보"

#### EN draft
- "Stabilized Cloud Data Sync health checks by adding up to 3 retries with exponential backoff (5s/10s) in `checkServerHealth`, reducing transient-load sync failures while staying within the 10-minute timeout monitor window"

---

### C. 사내 공통 라이브러리 체계 / Internal Common Library System

#### KO draft (optional, in-progress 반영)
- "`@gameduo/glider-nest-util-schedule` 패키지 설계: `@ConditionalCron` + Explorer(DiscoveryService/MetadataScanner) 기반으로 스케줄러 `onApplicationBootstrap` boilerplate(10~25줄) 제거, `forRoot/forRootAsync` DynamicModule과 per-decorator enabled override 제공"

#### EN draft
- "Designed `@gameduo/glider-nest-util-schedule` with `@ConditionalCron` + explorer (DiscoveryService/MetadataScanner) to remove repeated scheduler `onApplicationBootstrap` boilerplate (10-25 lines), with `forRoot/forRootAsync` DynamicModule and per-decorator enabled overrides"

---

### D. LMK 운영 안정화 (신규 세부항목 후보)

> 이력서에 LMK 관련 밀도를 높이고 싶다면 기존 프로젝트 내 하위 detail로 짧게 추가 권장.

#### KO draft
- "LMK AI 번역 설정 버전별 전환: 글로벌 설정을 per-version 모델로 재구성(`sheetVersionId` 추가, UNIQUE 인덱스 재정의, API version 파라미터 반영)하고 스케줄러가 활성 버전을 순회하도록 개선"
- "Feature Capability API 신설: `GET /admin/sheet/capabilities`로 서버별 기능 지원(`isServerOnly`, `lmkAiTranslation.enabled`)을 단일 호출로 제공, 구버전 서버 404 graceful fallback 적용"
- "LMK 벌크 수정 인시던트 대응: DB 커넥션 풀 고갈 및 스케줄러 bootstrap race condition 이슈를 완화해 운영 장애 재발 리스크 축소"

#### EN draft
- "Migrated LMK AI translation settings from global to per-version scope by adding `sheetVersionId`, rebuilding UNIQUE indexes, adding API version parameters, and scanning all active versions in the scheduler"
- "Introduced `GET /admin/sheet/capabilities` so FE can detect server feature support (`isServerOnly`, `lmkAiTranslation.enabled`) in one call, with graceful 404 fallback for legacy servers"
- "Reduced recurrence risk of LMK bulk-edit incidents by mitigating DB connection pool exhaustion and scheduler bootstrap race conditions"

## 4) Placement proposal in resume JSON (dry-run map)

- `gameduo.projects["마케팅 통합 플랫폼"].details`:
  - Add A bullets (recommended)
- `gameduo.projects["Cloud Data 동기화 시스템"].details`:
  - Add B bullet (recommended)
- `gameduo.projects["사내 공통 라이브러리 체계"].details`:
  - Add C bullet (optional, in-progress 성격)
- LMK 항목:
  - Option 1: 기존 관련 프로젝트 detail에 D 일부 추가
  - Option 2: 신규 소형 프로젝트 블록 생성 (현재 구조상은 Option 1이 더 자연스러움)

## 5) Draft quality check

### Checklist
- ko/en 페어링: PASS (각 KO 항목에 대응 EN 제공)
- 수치/근거: PASS (원본 work-data 수치만 사용: 3회 retry, 5s/10s backoff, 10-25 lines 등)
- 과장 표현 억제: PASS ("혁신", "최고" 등 미사용)
- 기존 톤 적합성: PASS (기존 details 스타일의 문제-접근-결과 서술 유지)
- 중복/잡음: PASS (문의/회의성 항목 제외)

### Risks
- `in_progress` 항목(C 일부, D 일부) 반영 시 "완료" 뉘앙스 과장 위험이 있어 문구를 "설계/적용 중"으로 유지 권장
- LMK 항목은 현재 이력서 내 대표 프로젝트 연결이 약하므로 과도한 비중 추가는 흐름 저해 가능

## 6) Final dry-run recommendation

우선 반영(안전):
1. A(마케팅 NAS 자동화/가시성)
2. B(Cloud Data 헬스체크 안정화)

선택 반영(맥락 맞을 때):
3. C(공통 스케줄 패키지)
4. D(LMK 운영 안정화 1~2줄)

---

No source resume files were modified in this run.
