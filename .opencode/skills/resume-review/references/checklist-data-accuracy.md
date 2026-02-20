# 데이터 정확성 체크리스트

## 1. ko/en 구조 동기화

### 1.1 experience 레벨
- [ ] 모든 experience의 slug 일치
- [ ] company, position 의미 동등성
- [ ] startDate, endDate 일치
- [ ] current 플래그 일치
- [ ] highlights 개수 일치
- [ ] projects 개수 일치
- [ ] techStack 개수 및 순서 일치
- [ ] description 의미 동등성 (직역 아닌 의역 허용)

### 1.2 project 레벨
- [ ] 각 project의 name 의미 대응
- [ ] details 개수 일치 (ko = en)
- [ ] techStack 개수 및 목록 일치
- [ ] featured 플래그 일치
- [ ] period 표기 일치 ("현재" <-> "Present")

### 1.3 기타 섹션
- [ ] skills 섹션: 카테고리 수, 항목 수, 순서 일치
- [ ] education 섹션: 동일 구조
- [ ] awards 섹션: 동일 구조
- [ ] summary/introduction 의미 동등성

## 2. 날짜/기간 정합성

### 2.1 재직기간 검증
- [ ] 모든 프로젝트 기간이 해당 experience의 startDate~endDate 내에 속함
- [ ] experience 간 재직기간 겹침 없음 (의도적 겸직 제외)
- [ ] 경력 사이 공백 기간이 설명 가능

### 2.2 프로젝트 기간 검증
- [ ] 프로젝트 간 기간 겹침이 합리적 (병행 가능한 규모/성격)
- [ ] 빈 기간 분석: 재직기간 중 프로젝트 공백이 다른 프로젝트로 커버되는지
- [ ] "현재" 진행 중 프로젝트가 current: true인 experience에만 존재

### 2.3 날짜 형식 일관성
- [ ] JSON 내 날짜 형식: YYYY-MM (startDate/endDate)
- [ ] period 표기 형식 일관성: "YYYY.MM ~ YYYY.MM" 또는 "YYYY.MM ~ 현재/Present"
- [ ] ko의 "현재"와 en의 "Present" 대응

## 3. 숫자/지표 일관성

### 3.1 highlights <-> details 교차검증
- [ ] highlights에 등장하는 모든 수치가 해당 project details에서도 확인 가능
- [ ] 동일 지표의 수치가 위치마다 일치 (%, 배수, 시간, 비용)
- [ ] ko와 en의 수치 표현 일치 ("30만" = "300K", "160억" = "16B")

### 3.2 단위 표기 일관성
- [ ] 비율: % 표기 통일
- [ ] 금액: ko "원/억", en "$X.XX" 또는 "KRW XB" 형식
- [ ] 시간: "수 시간→수 분", "N초→N초" 등 before/after 형식 통일
- [ ] 배수: "N배" (ko), "Nx" (en) 형식

### 3.3 company description 지표
- [ ] description의 수치(투자금, 다운로드 수 등)가 ko/en 동등
- [ ] 외부 검증 가능한 수치는 합리적 범위

## 4. 기술 스택 동기화

### 4.1 포함관계 검증
- [ ] 회사 레벨 techStack >= 각 프로젝트 techStack의 합집합
- [ ] 프로젝트 techStack에만 있고 회사 techStack에 없는 기술 식별 → 누락인지 의도적인지 판단
- [ ] 회사 techStack에 있지만 어떤 프로젝트에도 없는 기술 식별

### 4.2 표기 통일
- [ ] 기술명 대소문자 일관성: NestJS(O) vs Nestjs(X), TypeScript(O) vs typescript(X)
- [ ] 버전 표기 일관성: experience 레벨과 project 레벨에서 동일 기술의 버전 표기 통일
- [ ] ko/en 간 techStack 목록이 동일 (기술명은 영문이므로 양쪽 동일해야 함)

### 4.3 skills 섹션 정합성
- [ ] skills 섹션의 기술이 experience techStack에 최소 1회 이상 등장
- [ ] experience에서 자주 사용된 핵심 기술이 skills 섹션에 포함됨
