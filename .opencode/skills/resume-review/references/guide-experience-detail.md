# 경력 상세 페이지 리뷰 가이드

## 범위

- `src/pages/experience/[slug].astro` (ko)
- `src/pages/en/experience/[slug].astro` (en)
- `src/components/templates/ExperienceDetailTemplate.astro` — 렌더링 로직
- `src/utils/resume-data.ts` — experience surface projection 기준
- `src/content/resume/{ko,en}.json` → 대상 experience[N] 데이터

## 사용할 체크리스트

8개: data-accuracy, hr-perspective, technical, writing-ko, writing-en, structure, hr-deep, ai-detection

## 리뷰 절차

### 1. 대상 식별

유저가 회사명/slug을 언급하면 해당 experience 추출:
- ko.json의 `experience[]`에서 slug 매칭
- en.json의 동일 인덱스 experience 추출
- 두 데이터를 병렬로 분석

### 2. 데이터 수집 범위

**필수 수집:**
- 대상 experience의 전체 필드 (company, position, startDate, endDate, highlights, projects, techStack, description)
- 각 project의 전체 필드 (name, period, description, details, techStack, featured)
- ko/en 양쪽 모두

**선택 수집:**
- skills 섹션 (techStack 정합성 검증 시)
- 다른 experience (경력 간 비교 시)
- portfolio.json (교차 검증 시)

### 3. 체크리스트 순회 순서

data-accuracy → hr-perspective → technical → writing-ko → writing-en → structure

## 경력 상세 특화 검증 기준

### 1. 프로젝트별 STAR 분석

각 highlight에 대해:
- **S**(Situation): 문제/상황이 명시되어 있는가
- **T/A**(Task/Action): 구체적 기술/방법이 있는가
- **R**(Result): 수치적 결과가 있는가
- S/R이 누락된 highlight → "현재 / 제안" 형식으로 개선안 제시

### 2. techStack 포함관계

- 회사 레벨 techStack이 모든 프로젝트 techStack의 상위집합인지
- 프로젝트 techStack에만 있고 회사에 없는 기술 → 누락 이슈
- 회사 techStack에 있지만 어떤 프로젝트에도 없는 기술 → 불필요 이슈

### 3. description: 문제→해결 구조

각 프로젝트 description에 대해:
- **문제 명시**: "~문제를 해결하기 위한" 또는 "~상황에서" 형태
- **해결 방향**: "~시스템 구축" 또는 "~전환" 형태
- 단순 기능 설명만 있는 경우 → 문제 추가 권장

평가 기준:
| 패턴 | 평가 |
|------|------|
| 문제 + 해결 모두 명시 | 우수 |
| 해결만 명시 (문제 암시) | 양호 |
| 기능 설명만 | 개선 필요 |

### 4. 프로젝트 순서 분석

- 시간순 배치인 경우: 기간 겹침/의존관계가 자연스러운지
- 임팩트순 배치인 경우: featured 프로젝트가 상위에 위치하는지
- 일관된 정렬 기준을 따르는지
- 시간순일 때 성장 내러티브가 보이는지

### 5. details 개수 균형

경력 내 프로젝트 간:
- featured 프로젝트의 details가 가장 많거나 같아야 함
- 3주 프로젝트가 6개월 프로젝트보다 details가 많으면 주의
- 프로젝트 규모/기간 대비 details 수가 합리적

### 6. 중복/반복 표현 검출

경력 내에서:
- highlights와 project details 간 거의 동일한 문장
- 동일 아키텍처(SNS→SQS→Lambda)가 3곳 이상 등장
- 동일 수치가 highlights + details + description에서 3중 반복

허용 기준:
- highlights=요약, details=상세 → 동일 수치의 추상/구체 레벨 차이는 정상
- 완전 동일 문장 반복은 문제

## 출력

리뷰 결과를 `assets/review-output-template.md` 형식으로 작성.
경력 상세 리뷰의 카테고리별 점수 체계:
- 8개 체크리스트 기준 카테고리별 점수 + 종합 점수
- 10점 만점 방식 (기존 리뷰 파일과 동일)
- 이슈별 CRITICAL/HIGH/MEDIUM/LOW 분류
- 종합 점수 + 핵심 개선 권장사항
