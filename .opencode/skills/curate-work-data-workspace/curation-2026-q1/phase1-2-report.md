# Curation Report (2026 Q1) — Phase 1 (Diff) + Phase 2 (Evaluate)

## Scope & Filter

- Work-data sync: `~/.work-data` 최신 `git pull` 완료 (Already up to date)
- Domain files: `glider-sheet.json`, `glider-marketing.json`, `glider-kit.json`, `misc.json` 전체 확인
- Resume baseline: `src/content/resume/ko.json` (GameDuo experience + project details 기준 비교)
- Filter: `status == done` AND `size in {major, medium}` AND `period >= 2026-01`
- Filtered items: **15개**

## Phase 1 — Diff (ALL Filtered Items)

| resumeProject | itemId | period | size | topic | outcome 요약 | 상태 |
|---|---|---|---|---|---|---|
| (null) | sheet-0104 | 2026-01 | medium | SheetClass String 길이 가변화 | VARCHAR(255) 고정 제약 제거, 대형 JSON 저장 지원 | NEW |
| cloud-data | sheet-0107 | 2026-01 | medium | excludeCloudData 옵션 미전달 버그 수정 | 의도치 않은 Cloud Data 전체 삭제 위험 제거 | PARTIAL_OVERLAP |
| cloud-data | sheet-0108 | 2026-01 | medium | 클라우드 데이터 복사 시 잔존 키 삭제 처리 | 복사 정합성 개선, placeholder 중복 이슈 완화 | PARTIAL_OVERLAP |
| probability | kit-0041 | 2026-02 | major | 확률 계산 + Kinesis 로깅 패키지 | 12개 브랜치 통합, Kinesis→Athena E2E 감사로그 구축 | ALREADY_REFLECTED |
| server-kit | kit-0042 | 2026-02 | medium | glider-sheet 업그레이드 GitHub Actions 자동화 | 7개 프로젝트 병렬 자동화, ~3시간→~15분 단축 | NEW |
| server-kit | kit-0049 | 2026-02 | medium | CI OOM 해결 및 테스트 인프라 최적화 | CI 27분→15분, Flaky/취약점 일부 해소 | PARTIAL_OVERLAP |
| server-kit | kit-0050 | 2026-02 | medium | ts-jest isolatedModules 전환 | CI 15분47초→6분6초(61%↓), 컴파일 15x 개선 | PARTIAL_OVERLAP |
| cloud-data | misc-0181 | 2026-02 | medium | HB cloud-data 동기화 실패 대응 | OOM 원인 대응 + DDL/PK 버그 수정 + 데이터 정리 | PARTIAL_OVERLAP |
| marketing-campaign | mkt-0107 | 2026-02 | medium | Meta 캠페인 다중 페이지 선택 기능 | pageId 선택 기능 추가, 다중 페이지 운영 지원 | PARTIAL_OVERLAP |
| marketing-metrics | mkt-0108 | 2026-02 | medium | 국가/OS 레벨 결제 지표 추가 | payingUser/iapCount/totalArpu 지표 확장 | NEW |
| marketing-asset | mkt-0109 | 2026-02 | major | 마케팅 NAS 동기화 | S3↔NAS 이중화 + SQS 동기화/복원 구축 | ALREADY_REFLECTED |
| lmk-notification | sheet-0110 | 2026-02 | medium | LMK v2 고도화 | 수식 저장/미완료 조회/번역 무효화/자동완료 구현 | NEW |
| cloud-data | sheet-0111 | 2026-02 | medium | CloudData 안정화(버그 4건) | 캐시/DDL/키삭제/excludeCloudData 이슈 일괄 해결 | PARTIAL_OVERLAP |
| marketing-asset | mkt-0113 | 2026-03 | medium | 파일 교체 시 NAS 자동 동기화(BE) | outbox 자동 발행, NAS 상태 추적, 경로 버전 정책 개선 | PARTIAL_OVERLAP |
| marketing-asset | mkt-0114 | 2026-03 | medium | NAS 동기화 상태/경로 UI 확장(FE) | 상태 배지/경로 노출/실패 재시도 진입점 제공 | NEW |

### Status 판단 근거 요약

- ALREADY_REFLECTED
  - `kit-0041`: 이미 `확률 계산 및 감사 로그 분석 파이프라인`의 상세(패키지화, CDK 파이프라인, 통합테스트)와 경험 하이라이트에 핵심이 반영됨
  - `mkt-0109`: 이미 `마케팅 통합 플랫폼` 상세의 `NAS-S3 이중화 동기화`로 핵심이 반영됨
- PARTIAL_OVERLAP
  - 기존 문장이 상위 개념/초기 버전은 담고 있으나, 최근 개선(자동화 수치/버그 묶음/상태 추적 정책 등)이 미반영
- NEW
  - 현재 GameDuo 프로젝트 상세/하이라이트에서 직접적으로 다루지 않은 신규 성과

## Phase 2 — Evaluate (NEW + PARTIAL_OVERLAP)

| itemId | 등급 | 이유 | 적용 전략 | 대상 프로젝트 |
|---|---|---|---|---|
| sheet-0104 | 선택적 | 기능 유연성 개선은 의미 있으나 정량 지표/임팩트가 약하고 포지셔닝(핵심 임팩트) 대비 우선순위 낮음 | append (보류 가능) | 사내 공통 라이브러리 체계 |
| sheet-0107 | 반영 추천 | 데이터 전체 삭제 리스크 차단은 운영 안정성 관점 임팩트가 큼. Cloud Data 안정화 스토리 강화 가능 | replace `details[4]` 또는 append | Cloud Data 동기화 시스템 |
| sheet-0108 | 선택적 | 정합성 개선 가치가 있으나 `sheet-0111`에 포함 가능한 하위 이슈라 단독 반영 시 중복 위험 | skip (또는 sheet-0111로 병합 반영) | Cloud Data 동기화 시스템 |
| kit-0042 | 반영 추천 | 수동 3시간→15분 자동화는 정량성과 재현성이 명확, 기존 CI 최적화 문장 대비 우위 | replace `details[5]` | 사내 공통 라이브러리 체계 |
| kit-0049 | 선택적 | 성과는 있으나 kit-0050(61% 단축) 대비 임팩트가 약해 문장 예산 관점에서 후순위 | skip (보조 근거로만 활용) | 사내 공통 라이브러리 체계 |
| kit-0050 | 반영 추천 | 테스트/CI 속도 61% 개선 + 978 tests 통과로 정량/신뢰도 모두 높음 | replace `details[5]` | 사내 공통 라이브러리 체계 |
| misc-0181 | 선택적 | 장애 대응/원인 분석은 신뢰도에 도움되나 범위가 국소적이고 수치 임팩트 제한적 | append (운영 안정화 관점) | Cloud Data 동기화 시스템 |
| mkt-0107 | 선택적 | 캠페인 기능 확장(다중 페이지)은 제품 완성도 측면 의미 있으나 정량 성과 부재 | append | 마케팅 통합 플랫폼 |
| mkt-0108 | 선택적 | 지표 스코프 확장 자체는 유의미하나 비용/성능 등 정량 임팩트가 상대적으로 약함 | replace `details[8]` (리텐션+결제 지표 통합으로 재구성) | 마케팅 통합 플랫폼 |
| sheet-0110 | 불필요 | LMK v2 기능 고도화는 현재 이력서의 핵심 프로젝트 축(AI Native/백엔드 임팩트)과 거리 있음 | skip | (신규 프로젝트 필요 시 별도 검토) |
| sheet-0111 | 반영 추천 | Cloud Data 안정화 이슈 4건을 묶어 운영 신뢰도 개선을 구체화 가능. 기존 추상 문장보다 설득력 높음 | replace `details[4]` | Cloud Data 동기화 시스템 |
| mkt-0113 | 반영 추천 | 기존 NAS 동기화의 후속 고도화(자동 outbox, 상태추적, 경로 정책)로 최근성/기술 깊이 모두 강화 | replace `details[3]` | 마케팅 통합 플랫폼 |
| mkt-0114 | 선택적 | FE 가시성 개선은 협업/운영 측면 장점이 있으나 백엔드 중심 포지셔닝과 직접 연관성은 상대적으로 낮음 | append (또는 skip) | 마케팅 통합 플랫폼 |

## Evaluate 집계

- 반영 추천: **5건** (`sheet-0107`, `kit-0042`, `kit-0050`, `sheet-0111`, `mkt-0113`)
- 선택적: **7건** (`sheet-0104`, `sheet-0108`, `kit-0049`, `misc-0181`, `mkt-0107`, `mkt-0108`, `mkt-0114`)
- 불필요: **1건** (`sheet-0110`)

## Notes

- 본 문서는 요청 범위에 따라 **Phase 1-2만 수행**했으며, 초안 작성(Phase 3) 및 JSON 수정(Phase 5)은 진행하지 않음.
- `replace details[N]`의 인덱스는 현재 `ko.json`의 GameDuo 프로젝트 `details` 기준(1-based)으로 표기함.
