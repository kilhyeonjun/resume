# Skill Benchmark: curate-work-data (iteration-3 vs iteration-1)

Date: 2026-03-19
Mode: DRY RUN only
Assertion set: iteration-1 assertions + new assertions (replace-preservation, explicit apply plan)

## Summary

| Metric | iteration-1 (old) | iteration-3 (improved) | Delta |
|---|---:|---:|---:|
| Pass Rate | 76.9% (20/26) | 100.0% (26/26) | +23.1%p |

## Per-Eval Breakdown

| Eval | iteration-1 (old) | iteration-3 (improved) | Delta |
|---|---:|---:|---:|
| eval-0 (latest-check) | 6/8 (75.0%) | 8/8 (100.0%) | +25.0%p |
| eval-1 (monthly-addition) | 7/9 (77.8%) | 9/9 (100.0%) | +22.2%p |
| eval-2 (specific-item) | 7/9 (77.8%) | 9/9 (100.0%) | +22.2%p |

## Fix Verification Focus

- replace 발생 케이스(eval-0, eval-1): 기존 문장 선행 읽기 + 핵심 키워드 보존 + 신규 정보 병합을 명시적으로 수행
- apply 계획: 3개 eval 모두 `append/replace + 대상`이 최종안에 명시됨
- 정보 손실 방지: replace 시 기존 핵심(NAS-S3, SQS, server-worker, 복원 맥락) 누락 없이 유지됨

## Conclusion

"replace 시 기존 정보 보존 의무" 규칙은 이번 iteration-3 산출물 기준으로 유효하게 동작했으며,
iteration-1에서 발생하던 apply 계획 누락/보존 근거 부족 문제가 재현되지 않았다.
