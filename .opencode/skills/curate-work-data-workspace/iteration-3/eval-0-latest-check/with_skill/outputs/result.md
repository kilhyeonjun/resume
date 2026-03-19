# Eval 0 - latest-work-data-diff-and-evaluate (iteration-3)

Prompt: `work-data 최신화하고 이력서에 반영할 거 있는지 확인해줘`

Mode: DRY RUN only (Phase 1-4). No `ko.json`/`en.json` modification.

## Phase 1 (Diff)

Executed:
- `git pull` in `/PRIVATE/PATH (latest sync check)
- Filter: latest period(`2026-03`), `size in (major, medium)`, `status=done`
- Compared against existing `src/content/resume/ko.json`, `src/content/resume/en.json`

| resumeProject | itemId | period | topic | size | outcome summary | status |
|---|---|---|---|---|---|---|
| marketing-asset | mkt-0113 | 2026-03 | 파일 교체 시 NAS 자동 동기화 및 이력 경로 정책 개선 (BE) | medium | outbox 자동 발행, `asset_nas_sync` 상태 추적, 버전 누적 경로 정책 | NEW (overlap with existing NAS highlight) |
| marketing-asset | mkt-0114 | 2026-03 | NAS 동기화 상태/경로 정보 노출 및 교체 이력 UI 확장 (FE) | medium | 상태 배지, 경로 copy, 실패 재시도 진입점 | NEW |

## Phase 2 (Evaluate)

| itemId | grade | reason | apply strategy | target |
|---|---|---|---|---|
| mkt-0113 | 반영 추천 | 기존 NAS 항목과 문제 영역이 같지만, outbox 자동 발행/상태 추적/버전 정책이 더 구체적이고 운영 맥락이 강함 | `replace` | `마케팅 통합 플랫폼` details[3] |
| mkt-0114 | 선택적 | FE 가시화 개선은 유의미하나 핵심 포지션 메시지 대비 우선순위 낮음 | `append` (optional) | `마케팅 통합 플랫폼` details[last] |

## Phase 3 (Draft)

### replace 사전 읽기(필수) - mkt-0113

기존 문장(ko.json details[3]) 선행 확인:
- "NAS-S3 이중화 동기화: SQS 이벤트 기반 서버-워커 분리 아키텍처 ..."

보존 대상 추출:
- 기술 키워드: `NAS-S3`, `SQS`, `서버-워커 분리 아키텍처`
- 아키텍처 성과: `양방향 동기화/복원`

신규 항목 병합 키워드:
- `outbox 이벤트 자동 발행`, `asset_nas_sync 상태 추적`, `버전 누적 경로 정책`

KO 최종안:
- NAS-S3 이중화 동기화의 SQS 기반 서버-워커 분리 아키텍처 위에 파일 교체 시 outbox 이벤트 자동 발행과 `asset_nas_sync` 상태 추적, 버전 누적 경로 정책을 결합해 양방향 동기화·복원 신뢰도 강화

EN final:
- Extended the NAS-S3 dual-sync, SQS-based server-worker architecture by adding automatic outbox emission on file replacement, `asset_nas_sync` state tracking, and a version-accumulating path policy to improve bidirectional synchronization and restore reliability.

## Phase 4 (Feedback Loop, 7-point check)

| 체크 | 결과 | 근거 |
|---|---|---|
| 어순 | PASS | KO/EN 모두 핵심 흐름(문제-해결-결과) 유지 |
| 문체 | PASS | KO 명사형 종결, EN 과거형 동사 시작 |
| AI 슬롭 | PASS | 금지 표현 미사용 |
| 과장 | PASS | work-data 원문 키워드/성과만 사용 |
| HR 가독성 | PASS | NAS 동기화 개선 포인트 1문장 집중 |
| 부정 인식 | PASS | 실패/한계보다 해결 결과 중심 |
| ATS | PASS | NAS, SQS, outbox, state tracking 키워드 보존 |

적용 계획:
- `replace` -> `마케팅 통합 플랫폼` details[3]
- `append`(optional) -> `마케팅 통합 플랫폼` details[last] for mkt-0114
