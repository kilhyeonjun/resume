# Eval 2 - specific-item-kit-0045-curation (iteration-3)

Prompt: `work-data에 있는 kit-0045 작업을 이력서에 넣고 싶어`

Mode: DRY RUN only (Phase 1-4). No `ko.json`/`en.json` modification.

## Phase 1 (Diff)

Executed:
- Searched `~/.work-data/gameduo/glider-kit.json` for `kit-0045`
- Found item: `status=in_progress`, `size=medium`, `resumeProject=cloud-data`
- Specific-ID override applied (`in_progress` allowed with warning)

| resumeProject | itemId | period | topic | size | outcome summary | status |
|---|---|---|---|---|---|---|
| cloud-data | kit-0045 | 2026-02 | CloudData 마이그레이션 tableUuid 불일치 Duplicate 에러 | medium | UUID 충돌 감지/동기화, cursor 페이지네이션, 2-phase update, 54 tests, 리드타임 70~75% 단축 | NEW (`⚠ in_progress`) |

## Phase 2 (Evaluate)

| itemId | grade | reason | apply strategy | target |
|---|---|---|---|---|
| kit-0045 | 반영 추천(요청 기반) | 사용자 직접 지정 + 문제/해결/결과와 정량 근거(54 tests, 70~75%) 명확 | `append` | `Cloud Data 동기화 시스템` details[last] |

Note: this case uses `append`, not `replace`. Existing cloud-data 핵심 문장 보존 + 신규 성과 추가 전략.

## Phase 3 (Draft, KO/EN pair)

KO final:
- CloudData 마이그레이션의 tableUuid 불일치 Duplicate 오류를 UUID 충돌 감지·동기화 유스케이스와 cursor 페이지네이션 기반 2-phase update로 해결해 환경 간 데이터 정합성 확보와 마이그레이션 리드타임 70~75% 단축

EN final:
- Resolved tableUuid-mismatch Duplicate errors in CloudData migration by implementing UUID conflict detection/synchronization use cases with cursor-based pagination and a 2-phase update, improving cross-environment data consistency and reducing migration lead time by 70-75%.

## Phase 4 (Feedback Loop, 7-point check)

Round 1:
- KO 문장에서 수식어 과다 -> 리듬 정리

Final (PASS):
| 체크 | 결과 | 근거 |
|---|---|---|
| 어순 | PASS | KO/EN 모두 자연스러운 구조 |
| 문체 | PASS | KO 명사형, EN 과거형 시작 |
| AI 슬롭 | PASS | 금지 표현 없음 |
| 과장 | PASS | work-data 근거(54 tests, 70~75%)만 사용 |
| HR 가독성 | PASS | 문제-해결-결과가 한 줄에서 식별 가능 |
| 부정 인식 | PASS | 장애 맥락을 해결 성과로 전환 |
| ATS | PASS | CloudData, tableUuid, UUID, 2-phase 키워드 유지 |

적용 계획:
- `append` -> `Cloud Data 동기화 시스템` details[last]
