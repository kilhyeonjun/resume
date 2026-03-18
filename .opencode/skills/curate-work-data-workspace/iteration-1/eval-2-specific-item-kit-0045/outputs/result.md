# Eval 2 - specific-item-kit-0045-curation

Prompt: `work-data에 있는 kit-0045 작업을 이력서에 넣고 싶어`

Scope note: DRY RUN. Simulated through Phase 4 only.

## Executed commands (dry run)
- Searched `~/.work-data/gameduo` for `kit-0045`
- Read item from `glider-kit.json` (status: `in_progress`, size: `medium`, resumeProject: `cloud-data`)
- Read `src/content/resume/ko.json`, `src/content/resume/en.json` for duplicate signal check

## Phase 1 (Diff)

Specific-item trigger honored despite `in_progress` status.

| resumeProject | itemId | period | topic | size | outcome summary | status |
|---|---|---|---|---|---|---|
| cloud-data | kit-0045 | 2026-02 | CloudData 마이그레이션 tableUuid 불일치 Duplicate 에러 | medium | UUID 충돌 감지/동기화 유스케이스, cursor 페이지네이션, 2-phase update, 54 tests, 70~75% 리드타임 단축 | NEW |

## Phase 2 (Evaluate)

| itemId | grade | reason |
|---|---|---|
| kit-0045 | 반영 추천(요청 기반) | 사용자가 명시적으로 지정했고, 문제/해결/결과(STAR)와 정량 근거(54 tests, 리드타임 단축)가 명확함 |

## Phase 3 (Draft) - KO/EN pair

- KO draft v1
  - Live-Sandbox CloudData 마이그레이션의 tableUuid 불일치로 발생하던 Duplicate 오류를 UUID 충돌 감지·동기화 유스케이스와 2-phase update 패턴으로 해결해 환경 간 데이터 정합성 확보
- EN draft v1
  - Resolved Duplicate errors in Live-Sandbox CloudData migration caused by tableUuid mismatch by implementing UUID conflict detection/synchronization use cases with a 2-phase update pattern, improving cross-environment data consistency.

## Phase 4 (Feedback Loop, 7-point check)

Round 1 issues:
- KO 문장 길이 과다로 HR 가독성 FAIL -> 메시지 분할 없이 밀도 유지하며 간결화

Final (PASS):
- KO final
  - CloudData 마이그레이션의 tableUuid 불일치 Duplicate 오류를 UUID 충돌 감지·동기화 유스케이스와 2-phase update로 해결해 환경 간 데이터 정합성 확보
- EN final
  - Resolved tableUuid-mismatch Duplicate errors in CloudData migration by implementing UUID conflict detection/synchronization use cases and a 2-phase update, improving cross-environment data consistency.

7-point checklist summary (final):
| 항목 | 결과 | 근거 |
|---|---|---|
| 어순 | PASS | KO/EN 어순 자연스러움 |
| 문체 일관성 | PASS | KO 명사형, EN 과거형 동사 시작 |
| AI 슬롭 | PASS | 금지어 없음 |
| 과장 | PASS | work-data의 수치/범위 내 표현 |
| HR 가독성 | PASS | 핵심 메시지 1개 집중 |
| 부정 인식 | PASS | 약점 인상 없음 |
| ATS 호환 | PASS | CloudData, UUID, migration, 2-phase 키워드 유지 |

## Clarity check on skill instructions
- Worked: "work item ID 직접 언급"을 강한 트리거로 둔 점이 실제 요청 처리에 유효함
- Unclear: 기본 필터(`done`)와 ID 직접 요청(`in_progress` 허용)의 우선순위 규칙이 본문에서 명시적으로 충돌 해결되어 있지 않음
- Needs improvement: "특정 항목 요청 시에도 Apply 전에 승인 절차를 어떻게 표시할지" 템플릿이 있으면 더 일관된 결과 가능
