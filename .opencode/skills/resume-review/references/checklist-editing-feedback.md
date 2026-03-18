# checklist-editing-feedback

문장 편집 피드백 루프에서 사용하는 7점 체크리스트.
목표는 "정확한 내용"을 "자연스럽고 신뢰되는 문장"으로 마감하는 것이다.

## 사용 방식

각 항목을 PASS/FAIL로 판정하고, FAIL이면 문장을 바로 고친 뒤 재검토한다.

---

## 1) 어순

**PASS 기준**
- KO: 한국어 자연어 순서(주어-목적어-서술어)에 맞아 어색한 직역 느낌이 없음
- EN: 자연스러운 SVO 순서와 수식어 배치

**FAIL 예시**
- KO: "정산 지연을 병렬 처리로 나는 해결"
- EN: "To reduce latency significantly we in backend redesigned"

**PASS 예시**
- KO: "정산 지연 문제를 병렬 처리 구조로 전환해 처리 시간 단축"
- EN: "Redesigned backend processing flow to reduce settlement latency"

---

## 2) 문체 일관성

**PASS 기준**
- KO: 명사형 종결 유지 (`달성`, `구축`, `정착`, `개선`)
- EN: 과거 시제 액션 동사 중심 (`Designed`, `Implemented`, `Reduced`)

**FAIL 예시**
- KO: "배포 파이프라인을 만들었습니다"
- EN: "We are improving deployment pipeline and reducing failures"

**PASS 예시**
- KO: "배포 파이프라인 표준화 및 장애 대응 시간 단축"
- EN: "Implemented deployment pipeline standardization and reduced incident response time"

---

## 3) AI 슬롭

**PASS 기준**
- 금지어 0건

**KO 금지어**
- 혁신적, 획기적, ~를 통해, 함으로써, 뿐만 아니라, 나아가

**EN 금지어**
- leveraging, comprehensive, robust, streamline, cutting-edge, utilize, foster, delve, seamless, groundbreaking, transformative

**FAIL 예시**
- "혁신적인 아키텍처를 통해 안정성을 획기적으로 확보"
- "Leveraging a robust framework to deliver comprehensive improvements"

**PASS 예시**
- "장애 원인을 분리 가능한 구조로 재설계해 복구 시간을 단축"
- "Redesigned service boundaries and reduced mean time to recovery"

---

## 4) 과장

**PASS 기준**
- work-data 근거 없는 표현 0건
- 숫자/비율/규모가 출처와 일치

**FAIL 예시**
- "업계 최고 성능 달성"
- "100% 장애 제거" (근거 없음)

**PASS 예시**
- "재시도 정책 도입 후 월말 수기 복구 건수 0건 유지"
- "배치 처리 시간 42% 단축"

---

## 5) HR 가독성

**PASS 기준**
- 7.4초 스캔 시 핵심 1개가 즉시 보임
- 한 문장에 메시지 1개, 과도한 다중절 없음

**FAIL 예시**
- 배경/맥락/기술/조직 효과를 한 문장에 모두 몰아 넣어 핵심이 사라진 문장

**PASS 예시**
- "정산 지연 문제를 병렬 처리 구조로 전환해 처리 시간 42% 단축"

---

## 6) 부정 인식

**PASS 기준**
- 약점처럼 읽히는 표현 없음
- 역할의 강점을 맥락화해서 전달

**FAIL 예시**
- "코드를 안 치고 조율만 담당"
- "직접 구현 경험은 거의 없음"

**PASS 예시**
- "설계·검증 자동화에 집중해 구현 품질과 릴리즈 안정성 강화"
- "복잡한 과제에서 의사결정과 품질 게이트를 주도"

---

## 7) ATS 호환

**PASS 기준**
- 핵심 기술 키워드 유지 (예: Backend, TypeScript, AWS, NestJS)
- 문장을 다듬어도 검색 가능한 기술명이 사라지지 않음

**FAIL 예시**
- "서버 기술"처럼 일반화해 `NestJS`, `TypeScript` 삭제
- "클라우드"로만 표기해 `AWS` 키워드 누락

**PASS 예시**
- "TypeScript/NestJS 기반 Backend 서비스 구조 재설계 및 AWS 운영 안정성 강화"
- "Implemented Backend APIs with TypeScript and NestJS on AWS"

---

## 판정 템플릿

| 항목 | 결과(PASS/FAIL) | 근거 | 수정 포인트 |
|---|---|---|---|
| 어순 |  |  |  |
| 문체 일관성 |  |  |  |
| AI 슬롭 |  |  |  |
| 과장 |  |  |  |
| HR 가독성 |  |  |  |
| 부정 인식 |  |  |  |
| ATS 호환 |  |  |  |

FAIL이 하나라도 있으면 수정 후 재검토한다. 최대 3라운드 내 PASS를 목표로 한다.
