# 영문 번역 품질 체크리스트

## 1. 번역 정확성

### 1.1 정보 누락 검증
- [ ] ko의 모든 highlight 정보가 en에 반영 (누락 없음)
- [ ] ko의 모든 detail 정보가 en에 반영
- [ ] description의 핵심 정보가 en에 포함 (예: "중소기업"이 en에서 빠지는 경우)
- [ ] 서비스명/브랜드명이 ko에만 등장하고 en에는 없는 경우 식별 (예: "바로필")

### 1.2 의미 동등성
- [ ] 직역보다 자연스러운 의역 사용 (이력서 맥락에 맞는 표현)
- [ ] "비대면 진료" → "Telemedicine" (적절한 의역)
- [ ] "누적 30만 다운로드" → "300K cumulative downloads" (수치 변환 정확)
- [ ] "장애 건수 0건" → "zero post-deployment incidents" (자연스러운 의역)

### 1.3 수치 표기 일관성
- [ ] 백분율: 동일하게 % 사용
- [ ] 금액: "$6.25→$1.1 per TB" 같은 형식 통일 (highlight와 detail에서 동일 형식)
- [ ] 다운로드 수: "300K+" 형식
- [ ] 투자금: "KRW 16B" 또는 "$XXM" 형식
- [ ] 배수: "6x" 형식

## 2. Action Verb 관례

### 2.1 highlights 동사
- [ ] 모든 highlights가 강한 과거형 동사로 시작
- [ ] 추천 동사: Reduced, Built, Developed, Designed, Migrated, Automated, Eliminated, Implemented, Optimized, Delivered
- [ ] 진행 중 프로젝트는 현재분사 허용: Building, Leading, Developing
- [ ] 약한 동사 지양: Made, Did, Worked on, Helped

### 2.2 details 동사
- [ ] details도 가능하면 과거형 동사로 시작 (ATS 최적화에 유리)
- [ ] 현재 "제목: 설명" 형식(명사구)이 ko/en 동일한지 확인
- [ ] 명사구 시작도 허용하되, 일관성 중요 (모두 명사구 or 모두 동사)

### 2.3 tense 일관성
- [ ] 이전 직장: 모든 항목 과거형 (Past tense)
- [ ] 현재 직장 진행 중: 현재형 또는 현재진행형
- [ ] 동일 experience 내에서 tense 혼재 없음

## 3. 이력서 영문 관례

### 3.1 한국 특유 용어 처리
- [ ] "SI" — 해외 HR에게 비친숙. "Software consulting firm", "Custom software development" 등 대안 고려
- [ ] "중소기업" — "SMB" 또는 생략. "company" 로만 번역 시 정보 손실
- [ ] "병역" — 해외 지원 시 불필요, 국내 영문 이력서에서는 선택적

### 3.2 금액/단위 표기
- [ ] 한국 원화: "KRW 16B" (B=billion) 형식 또는 "$XXM" 환산
- [ ] "160억" → "KRW 16B" (✅) 또는 "~$12M" (환율 변환 시)
- [ ] TB당 가격: "$6.25→$1.1 per TB" 형식 통일

### 3.3 기관/서비스명 번역
- [ ] "식약처" → "MFDS (Korea FDA)" — 설명 추가로 가독성 확보
- [ ] 한국 서비스명(비즈뿌리오 등) 로마자 표기 정확성
- [ ] 회사명 영문 표기 공식 명칭 사용

## 4. 표기 일관성

### 4.1 기술명 ko/en 동일
- [ ] techStack이 양쪽에서 동일 (기술명은 영문이므로 차이 없어야 함)
- [ ] 프레임워크명 대소문자 en에서도 일관

### 4.2 문장 부호
- [ ] 쉼표, 마침표 사용 일관성
- [ ] 괄호 안 부연 설명 형식 통일: "(3 weeks)", "(KRW 16B)"
- [ ] 하이픈 사용: "cross-domain" vs "crossdomain" — 하이픈 포함이 표준

### 4.3 문법 검증
- [ ] 관사(a/an/the) 사용 적절성 — 이력서에서는 생략 관행이 허용됨
- [ ] 단복수 일관성: "5 country-specific websites" (O)
- [ ] 전치사 정확성: "Reduced by 82%", "Migrated from X to Y"
