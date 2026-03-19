# Eval 1 - monthly-new-items-full-pipeline (iteration-3)

Prompt: `이번 달 새로 한 작업들 이력서에 추가해줘`

Mode: DRY RUN only (Phase 1-4). No `ko.json`/`en.json` modification.

## Phase 1 (Diff)

Executed:
- `git pull` in `/PRIVATE/PATH
- Monthly filter: `2026-03`
- Default filter: `status=done`, `size in (major, medium)`

| resumeProject | itemId | period | topic | size | status |
|---|---|---|---|---|---|
| marketing-asset | mkt-0113 | 2026-03 | 파일 교체 시 NAS 자동 동기화 및 이력 경로 정책 개선 (BE) | medium | NEW |
| marketing-asset | mkt-0114 | 2026-03 | NAS 동기화 상태/경로 정보 노출 및 교체 이력 UI 확장 (FE) | medium | NEW |

## Phase 2 (Evaluate)

| itemId | grade | reason | apply strategy | target |
|---|---|---|---|---|
| mkt-0113 | 반영 추천 | 기존 NAS 항목 대비 운영 안정성(outbox/state/version policy) 정보가 강화됨 | `replace` | `마케팅 통합 플랫폼` details[3] |
| mkt-0114 | 선택적 | 사용자 관측성 개선 성격. 핵심 메시지 보강에는 기여하나 우선순위는 낮음 | `append`(optional) | `마케팅 통합 플랫폼` details[last] |

## Phase 3 (Draft, KO/EN pair)

### replace 사전 읽기(필수) - mkt-0113

기존 KO 문장 확인:
- "NAS-S3 이중화 동기화: SQS 이벤트 기반 서버-워커 분리 아키텍처 ... 양방향 동기화/복원"

기존 EN 문장 확인:
- "NAS-S3 Dual Sync: Built an SQS event-based server-worker separation architecture ..."

보존해야 할 기존 정보:
- 키워드: `NAS-S3`, `SQS`, `server-worker separation`
- 성과 성격: `bidirectional sync/restore`

신규 병합 정보:
- `outbox auto emission`, `asset_nas_sync(PENDING/PROCESSING/COMPLETED/FAILED)`, `version-accumulating path policy`

KO final (mkt-0113):
- NAS-S3 이중화 동기화의 SQS 기반 서버-워커 분리 아키텍처에 파일 교체 시 outbox 이벤트 자동 발행, `asset_nas_sync` 상태 추적, 버전 누적 경로 정책을 결합해 양방향 동기화·복원 신뢰도 강화

EN final (mkt-0113):
- Enhanced the NAS-S3 dual-sync architecture by adding automatic outbox emission on file replacement, `asset_nas_sync` state tracking, and a version-accumulating path policy on top of the existing SQS-based server-worker separation model, improving bidirectional sync and restore reliability.

KO optional (mkt-0114):
- 교체 이력 화면에 NAS 상태 배지와 경로/재시도 진입점을 확장해 동기화 상태 추적성과 운영 대응 속도 개선

EN optional (mkt-0114):
- Extended replacement-history UI with NAS status badges, path visibility, and retry entry points to improve sync observability and operational response.

## Phase 4 (Feedback Loop, 7-point check)

Round 1:
- mkt-0113 KO 문장 길이 과다 -> 용어 유지한 채 압축

Final (PASS):
| 체크 | 결과 | 근거 |
|---|---|---|
| 어순 | PASS | KO/EN 모두 읽기 흐름 자연스러움 |
| 문체 | PASS | KO 명사형, EN 과거형 시작 |
| AI 슬롭 | PASS | 금지어 0건 |
| 과장 | PASS | 원문 없는 수치 추가 없음 |
| HR 가독성 | PASS | 핵심 개선점(outbox/state/path policy) 명확 |
| 부정 인식 | PASS | 문제 설명보다 해결 결과 중심 |
| ATS | PASS | NAS, SQS, outbox, state tracking 키워드 유지 |

적용 계획:
- `replace` -> `마케팅 통합 플랫폼` details[3] (mkt-0113)
- `append`(optional) -> `마케팅 통합 플랫폼` details[last] (mkt-0114)
