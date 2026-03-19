# Work-data 최신화 및 이력서 반영 후보 점검 (DRY RUN)

## 1) 최신화 결과
- 실행: `git pull` in `~/.work-data`
- 결과: `Already up to date.`
- 기준 데이터: `~/.work-data/gameduo/{glider-kit,glider-marketing,glider-sheet,misc}.json` (`collectedAt: 2026-03-18`)

## 2) 점검 범위/기준
- 비교 대상 이력서: 
  - `/PRIVATE/PATH
  - `/PRIVATE/PATH
- 필터: 최근 구간(2026-02~2026-03) + `status=done` + `size in (major, medium)`
- 판정 기준:
  1. 현재 resume의 highlights/projects에 이미 핵심 성과가 반영되어 있는지
  2. 신규 항목이 "정량 성과/차별화된 문제 해결/아키텍처 개선"을 추가로 제공하는지
  3. 이력서 가독성을 해치지 않고 기존 bullet을 대체/강화할 수 있는지

## 3) 최근 major/medium 후보 요약

### A. 이미 반영됨(또는 핵심이 중복됨)
1. `kit-0041` (probability) — 이미 `확률 계산 및 감사 로그 분석 파이프라인` 프로젝트에 핵심 성과 반영됨
2. `mkt-0109` (marketing-asset, major) — resume의 `NAS-S3 이중화 동기화` bullet과 핵심 맥락이 중복
3. `sheet-0111` (cloud-data) — 기존 `Cloud Data 동기화 시스템`의 안정화 범주로 흡수 가능(신규 독립 bullet 필요성은 낮음)
4. `sheet-0110` (lmk-notification) — 기능 보강 성격(resume 상위 메시지 강화효과는 제한적)
5. `mkt-0107` (meta 다중 페이지), `misc-0181` — 업무 의미는 있으나 임팩트 대비 resume 우선순위 낮음

### B. 반영 가치 높음(권장)
1. `mkt-0113` (2026-03, marketing-asset, medium)
   - 신규성: 파일 교체 시 NAS 동기화 자동 발행(outbox), 상태 추적, 이력 경로 정책 개선(덮어쓰기 방지)
   - 가치: 운영 자동화 + 장애 복구/감사 추적성 강화 메시지를 명확히 전달 가능
   - 현재 resume 대비: 기존 `NAS-S3 이중화`는 있으나, "자동 동기화 트리거 + 상태 추적 모델 + 경로 정책"은 명시 없음

2. `kit-0050` (2026-02, server-kit, medium)
   - 신규성: `ts-jest isolatedModules` 전환으로 CI 대폭 단축
   - 정량성: CI 평균 `15m47s -> 6m06s` (61% 감소)
   - 가치: 팀 생산성/개발 체계 개선 성과를 수치로 강화 가능
   - 현재 resume 대비: CI 최적화 언급은 있으나, 최근 대규모 개선과 수치가 없음

## 4) 추가 검토(선택)
- `mkt-0108` (국가/OS 레벨 결제 지표 추가)
  - 기술적으로 의미 있음.
  - 다만 현재 resume의 마케팅 지표/리텐션/성능 스토리가 이미 길어, 우선순위는 B그룹보다 낮음.
  - 데이터 분석/그로스 역할을 강하게 타깃할 때만 추가 고려 권장.

## 5) 샘플 resume 문구 (KO/EN, DRY RUN)

### 후보 1: mkt-0113 반영 문구

#### KO (프로젝트 detail용)
- "소재 파일 교체 시 NAS 동기화 outbox 이벤트를 자동 발행하고 `asset_nas_sync` 상태 추적(PENDING/PROCESSING/COMPLETED/FAILED)을 도입해, 수동 동기화 의존을 제거하고 운영 추적성을 강화"
- "S3 `asset/` lifecycle 제약(30일 Glacier IR, 90일 만료)을 보완하기 위해 NAS 이력 경로를 버전 누적 정책으로 전환해 교체 이력의 장기 보관/복구 신뢰성을 개선"

#### EN
- "Automated NAS sync by publishing outbox events on file replacement and introduced `asset_nas_sync` state tracking (PENDING/PROCESSING/COMPLETED/FAILED), removing manual sync dependency and improving operational traceability."
- "Mitigated S3 `asset/` lifecycle constraints (30-day Glacier IR, 90-day expiration) by adopting a versioned NAS history-path policy, improving long-term retention and recovery reliability for replaced assets."

### 후보 2: kit-0050 반영 문구

#### KO
- "`ts-jest isolatedModules` 전환으로 테스트 컴파일 병목을 제거해 CI 평균 시간을 15분47초에서 6분06초로 61% 단축, 대규모 변경 배포 리드타임 개선"

#### EN
- "Reduced CI average runtime by 61% (15m47s -> 6m06s) by switching to `ts-jest isolatedModules`, removing test compile bottlenecks and improving release lead time for large changes."

## 6) 결론
- 즉시 반영 권장: `mkt-0113`, `kit-0050`
- 상황부 반영(타깃 JD 따라): `mkt-0108`
- 나머지 최근 항목은 기존 내용과 중복되거나 임팩트 대비 우선순위 낮음

## 7) 작업 방식 확인
- DRY RUN 준수: `ko.json`, `en.json` 미수정
- 본 문서는 제안서이며, 실제 반영은 별도 편집 단계에서 수행 필요
