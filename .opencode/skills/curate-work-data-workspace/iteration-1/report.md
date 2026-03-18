# curate-work-data skill test report (iteration-1)

Skill under test: `/PRIVATE/PATH

Mode: DRY RUN (Phase 1-4 only, no `ko.json`/`en.json` modification)

## Per-test output locations
- Eval 0: `.opencode/skills/curate-work-data-workspace/iteration-1/eval-0-latest-check/outputs/result.md`
- Eval 1: `.opencode/skills/curate-work-data-workspace/iteration-1/eval-1-monthly-addition/outputs/result.md`
- Eval 2: `.opencode/skills/curate-work-data-workspace/iteration-1/eval-2-specific-item-kit-0045/outputs/result.md`

## What worked well
- Phase structure (Diff -> Evaluate -> Draft -> Feedback Loop) is operationally clear and executable as written
- Filtering guidance (`period`, `size`, `status`) is actionable and easy to automate
- Draft rules (KO 명사형 / EN 과거형 동사) reliably produce consistent sentence style
- Feedback loop 7-point checklist is concrete enough to run deterministic PASS/FAIL checks
- Specific item ID trigger (e.g., `kit-0045`) is practical and handled correctly

## Unclear or inconsistent instructions
- `last sync` source is undefined
  - No canonical field/file to derive cutoff period, so Diff results can vary by executor
- Reflection comparison criteria are ambiguous
  - String match vs semantic overlap is not explicitly defined; overlap-heavy domains (e.g., NAS sync) are hard to classify consistently
- `done` default filter vs user intent conflict
  - User asks "이번 달 새로 한 작업" or specific item; skill says `done` 우선 but does not define fallback policy for `in_progress`
- Apply strategy gap
  - Missing explicit rule for `append` vs `replace` in existing highlights and max bullet budget per project

## Recommended skill improvements
1. Define `last sync` determination order (e.g., explicit user input -> latest period in resume project -> default latest month)
2. Add duplicate-detection rubric with score thresholds (lexical overlap + semantic overlap + impact delta)
3. Add explicit exception rule for specific ID requests: allow `in_progress` with warning label
4. Add apply policy template: `replace when superior`, `append when non-overlapping`, `max 2-4 highlights/project`
5. Provide a compact approval template for Phase 4 output (`KO/EN final + PASS table + apply plan`)

## Overall assessment
- Skill is usable now for guided curation and draft generation
- Main risk is evaluator variance in Diff/Evaluate due to undefined cutoff and overlap policy
- With the five improvements above, reproducibility across operators should improve significantly
