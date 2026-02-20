# 기술적 정확성 체크리스트

## 1. 클라우드 서비스명 검증

### 1.1 AWS 서비스
- [ ] 공식 명칭 사용: "AWS Lambda" (O), "lambda" (X)
- [ ] 서비스명 변경 반영: "Amazon Data Firehose" (2024~ 개명), 기존 "Kinesis Data Firehose"도 허용
- [ ] 약칭 사용 시 일관성: "SQS" 또는 "Amazon SQS" 중 하나로 통일
- [ ] 주요 검증 대상: Lambda, SQS, SNS, S3, RDS, EventBridge, CDK, Kinesis, Firehose, Athena, Glue, CloudWatch, ElastiCache

### 1.2 GCP 서비스
- [ ] 공식 명칭: "BigQuery" (O), "Bigquery" (X)
- [ ] "GCP" vs "Google Cloud" 표기 일관성
- [ ] 주요 검증 대상: BigQuery, Pub/Sub, Cloud Functions, Cloud Storage

### 1.3 기타 서비스
- [ ] 모니터링: Datadog (O) vs DataDog (X), Grafana 공식 표기
- [ ] DB: Aurora Serverless v2, RDS Proxy 공식 표기
- [ ] 서드파티 API: Naver Clova OCR, 식약처 API 등 공식 명칭 확인

## 2. 프레임워크/라이브러리 표기

### 2.1 대소문자 정확성
- [ ] NestJS (O) vs Nestjs/nestjs (X)
- [ ] TypeScript (O) vs Typescript (X)
- [ ] Express.js (O) vs express (X)
- [ ] TypeORM (O) vs Typeorm (X)
- [ ] Socket.io (O) — 공식 표기 확인
- [ ] React, Jotai, Jest 등 공식 표기

### 2.2 버전 표기 일관성
- [ ] 프레임워크 버전이 프로젝트 시점과 부합 (2021년에 NestJS 10은 불가)
- [ ] "Java 8/11" 같은 복수 버전 표기가 experience/project 레벨에서 통일

## 3. 패턴/아키텍처 명칭

- [ ] Event-Driven Architecture (O)
- [ ] Event Sourcing (O)
- [ ] Transactional Outbox Pattern / 트랜잭션 아웃박스 패턴 (O)
- [ ] **Ports and Adapters** (복수형, O) vs Port and Adapter (단수형, X)
- [ ] Hexagonal Architecture (O) — Ports and Adapters의 다른 이름
- [ ] CQRS (O)
- [ ] 3-Way Merge (O) — Git 용어 차용
- [ ] DynamicModule (O) — NestJS 고유 패턴

## 4. techStack 적절성

### 4.1 포함 기준
- [ ] 웹 표준 API(iframe, postMessage, Fetch API)가 techStack에 나열되지 않음 → details 설명에서만 언급
- [ ] 템플릿 엔진(Liquid, EJS)이 프레임워크(Jekyll, Express)와 중복 나열되지 않음 (선택적)
- [ ] 런타임(Node.js, JVM)은 프로젝트 레벨보다 회사 레벨에 적합

### 4.2 techStack-details 부합
- [ ] 프로젝트 techStack에 있는 기술이 details에서 최소 1회 언급 또는 암시
- [ ] details에서 언급된 기술이 techStack에 포함됨
- [ ] 모니터링 도구(Datadog, Grafana)가 techStack에 있으면 관련 프로젝트에도 매핑

### 4.3 techStack 크기
- 프로젝트별 적정 범위: 3~10개 (15개 이상이면 주의)
- 회사 전체: 10~20개 적정 (28개 이상이면 핵심 기술 희석 위험)

## 5. 아키텍처 설명 타당성

### 5.1 기술 조합 검증
- [ ] 나열된 기술들이 실제로 함께 사용되는 조합인지 확인
- [ ] 파이프라인 순서가 기술적으로 타당 (예: "Kinesis → Firehose → S3 → Glue → Athena")
- [ ] 크로스 클라우드 패턴의 타당성 (예: "Pub/Sub → Cloud Functions → API Gateway → Lambda")

### 5.2 성능 수치 합리성
- [ ] "82% 비용 절감" — BigQuery Storage Read API 전환으로 달성 가능한 범위
- [ ] "72% 시간 단축" — ORM 최적화로 달성 가능한 범위
- [ ] 극단적 수치(99%, 100%)에 대한 맥락 확인

### 5.3 비주류 기술 설명
- [ ] 비주류 프레임워크(예: Cyan)에 최소한의 설명이 있는지
- [ ] 사내 도구/자체 개발 기술에 대한 맥락 제공
