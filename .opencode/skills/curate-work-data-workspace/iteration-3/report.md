# curate-work-data iteration-3 eval report

Skill under test:
- `/PRIVATE/PATH

Scope:
- Same 3 test prompts as iteration-1
- DRY RUN only (no `ko.json`/`en.json` changes)
- Graded with: iteration-1 assertions + new assertions
  - "replace 전략 시 기존 문장을 읽고 핵심 정보를 보존함"
  - "apply 계획이 명시적으로 제시됨"

## Output locations

- `.opencode/skills/curate-work-data-workspace/iteration-3/eval-0-latest-check/with_skill/outputs/result.md`
- `.opencode/skills/curate-work-data-workspace/iteration-3/eval-1-monthly-addition/with_skill/outputs/result.md`
- `.opencode/skills/curate-work-data-workspace/iteration-3/eval-2-specific-item-kit-0045/with_skill/outputs/result.md`

## What improved

1. replace 전 기존 문장 선행 읽기 명시
   - eval-0/eval-1에서 기존 하이라이트를 먼저 인용하고, 보존 키워드(NAS-S3, SQS, server-worker, 복원 맥락)를 추출한 뒤 신규 정보(outbox/state/path policy)와 병합했다.

2. apply 계획 누락 해소
   - 세 eval 모두에서 `append/replace + 대상 프로젝트/위치`가 최종안에 명시됐다.

3. 7-point 피드백 루프 일관성
   - 세 eval 모두 Round 수정 후 PASS 테이블을 출력했다.

## What did not regress

- major/medium 필터, specific-item override, KO/EN 동시 작성, 과장 금지 규칙은 iteration-1 대비 동일하게 유지됐다.

## Remaining caveat

- eval-2는 append 전략 케이스라 replace 보존 규칙을 직접 소모하지는 않는다.
  다만 append 선택 이유를 명시해 덮어쓰기 리스크를 회피했고 apply 계획도 명확히 제시했다.

## Key question answer

Q. "replace 시 기존 정보 보존 의무" rule이 정보 손실을 막는가?

A. 예. 이번 iteration-3 결과에서 replace가 실제로 발생한 eval-0/eval-1 모두
기존 문장 선행 읽기 -> 보존 키워드 추출 -> 신규 성과 병합 순서를 명시적으로 수행했고,
기존 핵심 성과/아키텍처 정보 누락 없이 최종 문장에 유지됐다.
