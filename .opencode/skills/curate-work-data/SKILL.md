---
name: curate-work-data
description: |
  월간 work-data(~/.work-data/) 변경사항을 이력서 콘텐츠(ko.json, en.json)에 반영하는 큐레이션 스킬.
  "work-data 반영", "이력서 업데이트", "최근 성과 반영", "큐레이션", "신규 항목 반영",
  "work-data 동기화", "이번 달 성과 반영", "이력서에 추가", "update resume from work-data",
  "sync work items"처럼 명시적 요청이 오면 바로 사용한다.
  work item ID를 직접 언급하는 요청(예: "misc-0183 반영해줘", "billing-0042 resume에 넣어줘")도
  이 스킬의 강한 트리거로 간주한다.
---

# curate-work-data

월 단위로 누적되는 work-data를 이력서 문장으로 바꾸는 작업은, 단순 복붙보다 선별/해석/문장 튜닝이 더 중요하다.
이 스킬은 **Diff → Evaluate → Draft → Feedback Loop → Apply**의 흐름으로, 반영 가치가 높은 항목만 선택하고
사람이 쓴 것처럼 자연스러운 결과를 만들기 위해 설계되었다.

## 언제 사용하나

- `~/.work-data` 기준으로 최근 성과를 이력서에 동기화할 때
- 월간 회고 후 이력서를 업데이트할 때
- 특정 work item ID를 이력서 항목으로 승격할 때
- 기존 highlights를 최신 성과로 교체하거나 보강할 때
- AI 냄새 없는 문장으로 ko/en 동시 업데이트가 필요할 때

## 읽을 파일

작업 전 아래 파일을 읽어 두면 판단 품질이 올라간다.

| 파일 | 목적 |
|------|------|
| `references/guide-curation.md` | 문장 규칙, STAR/덩어리형 구성, 금지 표현 |
| `references/guide-work-data-schema.md` | work-data 구조/필드/민감정보 규칙 |
| `.opencode/skills/resume-review/references/checklist-editing-feedback.md` | 편집 피드백 루프 7점 체크 |
| `src/content/resume/ko.json` | 현재 한국어 이력서 기준본 |
| `src/content/resume/en.json` | 영어 이력서 동기화 대상 |

## 6-Phase Workflow

### Phase 1: Diff

먼저 "새로 들어온 일"과 "이미 이력서에 들어간 일"을 분리한다. 이 단계의 정확도가 후속 단계 전체를 좌우한다.

1. work-data 최신화

```bash
cd ~/.work-data && git pull
```

2. 필터 조건 적용
   - `period >= last sync`
   - `size == major OR medium`
   - `status == done` 우선 (필요 시 `in_progress`는 선택적으로 검토)

3. 중복 반영 방지 비교
   - `src/content/resume/ko.json`의 `experience[].projects[].name`
   - `src/content/resume/ko.json`의 `experience[].highlights[]`
   - 필요하면 `en.json`도 함께 확인해 ko/en 괴리 여부 파악

4. 산출물 작성
   - 이력서 미반영 항목만 추출
   - `resumeProject` 기준으로 그룹화

출력 형식 예시:

| resumeProject | itemId | period | topic | size | outcome 요약 | 상태 |
|---|---|---|---|---|---|---|
| payments-core | billing-0042 | 2026-03 | 정산 배치 장애 재설계 | major | 수기 복구 0회 | NEW |
| ai-orchestration | misc-0183 | 2026-03 | 멀티에이전트 QA 자동화 | medium | 리뷰 리드타임 단축 | NEW |

### Phase 2: Evaluate

모든 NEW 항목을 다 넣으면 밀도가 떨어진다. "무엇을 버릴지"가 이력서 품질을 만든다.

각 항목을 아래 기준으로 평가한다:

1. 정량 결과 존재 여부
   - 수치/비율/시간/건수/비용 중 최소 1개 이상
2. STAR 구조 가능 여부
   - Situation/Task/Action/Result로 최소 1문장 재구성 가능한지
3. 기존 하이라이트 대비 우위
   - 더 최근/더 큰 영향/더 명확한 기술 키워드가 있는지

등급:

- **반영 추천**: 정량성과 임팩트가 높고 기존 대비 교체 가치가 큼
- **선택적**: 의미는 있으나 밀도/중복 관점에서 보류 가능
- **불필요**: 근거 약함, 중복, 또는 이력서 포지션과 거리 큼

사용자에게 승인 요청 시, 등급과 이유를 함께 제시한다.

### Phase 3: Draft

승인된 항목만 ko/en 동시 초안을 만든다. 번역은 마지막 단계가 아니라 **동시 설계**가 자연스럽다.

#### 작성 규칙

- 한국어: 명사형 종결 유지 (예: `구축`, `개선`, `정착`, `최적화`)
- 영어: 과거 시제 액션 동사 시작 (예: `Designed`, `Implemented`, `Reduced`, `Stabilized`)
- 프로젝트 하이라이트: `도메인 + 문제 + 해결 + 결과` 한 줄 공식
- 경험 하이라이트: `문제 → 해결 → 결과` 덩어리형

#### 작성 순서

1. work-data에서 팩트 추출 (문제/접근/구현/outcome)
2. KO 한 줄 생성
3. EN 동등 의미로 동시 생성
4. 키워드 보존 확인 (예: Backend, TypeScript, AWS, NestJS, PostgreSQL)

세부 문장 규칙은 `references/guide-curation.md`를 우선 참조한다.

### Phase 4: Feedback Loop (CRITICAL)

초안을 바로 적용하지 않는다. 자연스러움과 신뢰도를 위해 편집 루프를 강제한다.

1. 아래 체크리스트를 읽고 7개 항목 점검
   - `.opencode/skills/resume-review/references/checklist-editing-feedback.md`

2. 7-point 체크
   1) 어순: 한국어/영어가 자연스러운 어순인지
   2) 문체 일관성: KO 명사형, EN 과거형 동사 유지
   3) AI 슬롭: 금지어 0건
   4) 과장: work-data 근거 없는 주장 0건
   5) HR 가독성: 7.4초 스캔에서 핵심 파악 가능
   6) 부정 인식: 약점처럼 읽히는 표현 제거
   7) ATS 호환: 핵심 기술 키워드 유지

3. 실패 시 수정-재검증
   - 실패 항목 중심으로 문장만 국소 수정
   - 최대 3라운드 반복
   - 3라운드 후에도 실패 시, 원문 근거 부족으로 표시하고 사용자 확인 요청

4. 최종 승인안 제시
   - KO/EN 쌍으로 보여주고 "반영 전 최종안"으로 합의

이 루프를 넣는 이유는, 내용의 정확성만으로는 채용 문서 품질이 완성되지 않기 때문이다.

### Phase 5: Apply

승인된 문장을 실제 콘텐츠에 반영하고 정합성을 검증한다.

1. `src/content/resume/ko.json` 수정
2. `src/content/resume/en.json` 동기화 수정
3. `verify-content` 스킬 절차로 구조/스키마/형식 점검
4. 프로젝트 빌드 검증

```bash
npm run build
```

빌드가 실패하면 적용 완료로 간주하지 않는다.

### Phase 6: PDF QA (optional)

시각 가독성 확인이 필요하면 PDF까지 점검한다.

- dev server가 켜져 있으면 HR PDF 생성
- 긴 문장 줄바꿈/페이지 분할/섹션 밀도 확인
- 필요 시 문장 길이만 미세 조정 (의미 변경 금지)

예시 명령:

```bash
npm run pdf:hr
```

## 결과 보고 형식

최종 응답은 아래 순서로 간결히 정리한다.

1. Diff 결과(신규 항목 수, resumeProject별 요약)
2. Evaluate 결과(반영 추천/선택적/불필요)
3. Draft 결과(KO/EN 제안 문장)
4. Feedback Loop 결과(라운드 수, 수정 포인트, 최종 PASS)
5. Apply 결과(수정 파일, verify-content 체크, build 결과)
6. Optional PDF QA 결과(실행 시)

## 주의사항

- work-data 원문에 없는 수치/성과를 새로 만들지 않는다.
- 내부 URL, 티켓 키, 계정 ID, 실명 등 민감정보를 이력서 문장에 노출하지 않는다.
- `minor` 항목은 기본적으로 제외하고, 사용자가 명시 요청한 경우에만 검토한다.
- 하나의 project에 문장을 과도하게 몰아넣지 않는다. 핵심성과 2-4개를 유지한다.
- 포지션 메시지(현재: AI Native Engineer)를 흐리게 만드는 항목은 우선순위를 낮춘다.

## 빠른 트리거 예시

- "이번 달 work-data 반영해서 이력서 업데이트해줘"
- "misc-0183 반영해줘"
- "최근 성과 ko/en 동시에 큐레이션해줘"
- "sync work items into resume highlights"
- "신규 항목 반영하고 빌드까지 확인해줘"
