# guide-work-data-schema

이 문서는 `~/.work-data/` 구조를 빠르게 파악하고, 큐레이션 중 필드를 안정적으로 읽기 위한 레퍼런스다.

## 1) 저장 위치

- 루트: `~/.work-data/`
- 회사 단위 디렉토리: `~/.work-data/{company-slug}/`

예시:

- `~/.work-data/gameduo/`

## 2) 파일 구조

회사 디렉토리 내부 기본 구성:

- `_meta.json` — 회사/포지션/기간/도메인 메타 정보
- `{domain}.json` — 도메인별 업무 로그 (핵심 데이터)
- `_source-map.json` — 티켓 키 매핑 (private, 이력서 직접 반영 금지)

## 3) 도메인 파일 공통 스키마

`{domain}.json` 최상위 필드:

- `schemaVersion`
- `domain`
- `description`
- `collectedAt`
- `workItems[]`

## 4) workItems[] 필드

| field | 설명 |
|---|---|
| `id` | 항목 식별자 (`{domain}-{seq:4}`) |
| `status` | `done` \| `in_progress` \| `hold` |
| `topic` | 작업 제목 (주로 한국어) |
| `period` | 기간 (`YYYY-MM`) |
| `tags` | 기술/도메인 태그 배열 |
| `size` | `major` \| `medium` \| `minor` |
| `resumeProject` | 이력서 프로젝트 매핑 키 또는 `null` |
| `problem` | 해결한 문제 설명 |
| `rootCause` | 근본 원인 (선택) |
| `approach` | 해결 접근 |
| `implementation` | 구현 상세 배열 |
| `outcome` | 결과/성과 |

## 5) size 정의

- `major`: 이력서 반영 우선순위 높음, 대표 성과 후보
- `medium`: 반영 가능성 높음, 맥락 보강/교체 후보
- `minor`: 기본 제외, 사용자가 명시 요청할 때만 검토

## 6) 큐레이션 필터 권장값

월간 반영 기본 필터:

- `period >= last sync`
- `size in (major, medium)`
- `status == done`

필요 시 `in_progress`를 별도 후보군으로 분리해 "선택적"으로 보여줄 수 있다.

## 7) resumeProject 매핑 규칙

- `resumeProject` 값 존재 시 해당 프로젝트에 우선 귀속
- `resumeProject == null`이면 태그/문제/성과를 보고 후보 프로젝트 제안
- 매핑 불명확 시 임의 생성하지 말고 사용자 승인 후 반영

## 8) 민감정보 규칙

이력서 반영 시 아래 정보는 포함하지 않는다:

- 내부 URL
- 티켓 키
- 계정 ID
- 동료 실명
- 내부 코드 경로

도메인 수준 기술 설명은 허용되지만, 식별 가능한 내부 정보는 제거한다.

## 9) 실무 체크포인트

1. 동일 `id`를 중복 반영하지 않는다.
2. `outcome` 없는 항목은 과장 없이 보수적으로 처리한다.
3. ko/en 문장 변환 시 기술 키워드 손실이 없는지 확인한다.
4. 반영 전 `src/content/resume/ko.json`, `src/content/resume/en.json` 동시 검증한다.
