# Skill Benchmark: curate-work-data (iteration-1)

**Date**: 2026-03-19
**Configurations**: with_skill vs without_skill (baseline)

## Summary

| Metric | with_skill | without_skill | Delta |
|--------|-----------|---------------|-------|
| **Pass Rate** | **95.2%** (19/20) | 60.0% (12/20) | **+35.2%** |

## Per-Eval Breakdown

| Eval | with_skill | without_skill | Delta |
|------|-----------|---------------|-------|
| eval-0 (latest-check) | 6/6 (100%) | 3/6 (50%) | +50% |
| eval-1 (monthly-addition) | 7/7 (100%) | 5/7 (71%) | +29% |
| eval-2 (specific-item) | 6/7 (86%) | 4/7 (57%) | +29% |

## Key Differences

### with_skill advantages
1. **구조화된 출력**: resumeProject별 그룹화 테이블 vs 자유 서술형
2. **3단계 등급 체계**: 반영추천/선택적/불필요 vs 모호한 A/B 분류
3. **7-point 피드백 루프**: 명시적 PASS/FAIL 테이블 vs 간이 체크리스트
4. **명사형 종결 일관성**: 스킬 가이드 준수 vs 서술형 혼재

### without_skill이 잘한 것
1. 기본 필터링(major/medium, done) 적절히 수행
2. work-data 수치를 정확히 인용 (과장 없음)
3. KO/EN 쌍 제시

### with_skill 개선 필요
1. eval-2에서 apply 계획(append/replace + 대상 프로젝트) 미제시 → iteration-2에서 확인 필요

## Conclusion
스킬이 baseline 대비 **+35.2% pass rate 우위**. 주로 "출력 구조화"와 "피드백 루프"에서 차이 발생. 스킬 없이도 기본 작업은 가능하나 일관된 품질 보장이 안 됨.
