---
name: resume-review
description: |
  이력서 사이트(Astro + Tailwind CSS)의 체계적 리뷰를 수행하는 스킬.
  웹 이력서, HR Print PDF, ATS PDF, 경력 상세 페이지, 포트폴리오 등 유형별 리뷰를 지원한다.
  AI 자동 탐지 모드와 HR 리크루터 시뮬레이션 모드를 포함해 자동/수동 혼합 리뷰를 지원한다.
  코드/데이터 검토만으로 끝내지 않고, 실제 브라우저 화면과 생성된 HR/ATS PDF 결과물까지 확인하는 full-spectrum 리뷰를 수행한다.
  11개 체크리스트(데이터 정확성, HR 관점, 기술적 정확성, 한국어 문장, 영문 번역, 구조,
  코드 품질, UI/UX, HR 심층, 포지션 적합성, AI 탐지)와
  5개 가이드(웹, Print PDF, ATS PDF, 경력 상세, 포트폴리오)를 조합하여 리뷰한다.
  surface별 projection 차이를 결함이 아닌 설계 의도로 구분해 리뷰한다.
  트리거: "이력서 리뷰", "resume review", "리뷰해줘", "검토해줘",
  "문장 검토", "표현 검토", "밀도 검토", "피드백 루프", "AI 탐지", "AI 체크",
  "HR 시뮬레이션", "리크루터 관점", "7.4초 테스트", "7.4초 스캔",
  "데이터 정확성 확인", "HR 관점 리뷰", "ATS 최적화 확인",
  "경력 상세 리뷰", "포트폴리오 리뷰", "ko/en 동기화 확인",
  "{회사명} 리뷰", "PDF 리뷰", "Print 리뷰"
---

# Resume Review

이력서 프로젝트의 체계적 리뷰를 수행한다. 리뷰는 **읽기 전용** — 코드/데이터 수정 없이 리뷰 문서만 작성.
단, 리뷰 근거는 반드시 코드/데이터 + 실제 브라우저 렌더링 + 생성된 PDF 산출물에서 함께 수집한다.

## Quick Reference

| 리뷰 유형 | 트리거 예시 | 가이드 | 체크리스트 |
|-----------|-----------|--------|-----------|
| 웹 이력서 전체 | "이력서 리뷰해줘" | [guide-web-review.md](references/guide-web-review.md) | data, hr, technical, writing-ko, writing-en, structure, code-quality, ui-ux, hr-deep, position-fit, ai-detection |
| HR Print PDF | "PDF 리뷰", "Print 리뷰" | [guide-print-pdf.md](references/guide-print-pdf.md) | data, hr, writing-ko, writing-en, structure, hr-deep, position-fit, ai-detection |
| ATS PDF | "ATS 확인", "ATS 리뷰" | [guide-ats-pdf.md](references/guide-ats-pdf.md) | data, hr, writing-ko, writing-en, structure, hr-deep, position-fit, ai-detection |
| 경력 상세 | "{회사명} 리뷰", "경력 상세 리뷰" | [guide-experience-detail.md](references/guide-experience-detail.md) | data, hr, technical, writing-ko, writing-en, structure, hr-deep, ai-detection |
| 포트폴리오 | "포트폴리오 리뷰" | [guide-portfolio.md](references/guide-portfolio.md) | data, technical, writing-ko, writing-en, structure, code-quality, ui-ux |
| 밀도 검증 | "밀도 검토", "details 많지 않나" | [checklist-density.md](references/checklist-density.md) | density |
| 편집 피드백 루프 | "문장 검토", "표현 검토" | [checklist-editing-feedback.md](references/checklist-editing-feedback.md) | editing-feedback |
| AI 자동 탐지 | "AI 탐지", "AI 체크", "AI detection" | [checklist-ai-auto-detect.md](references/checklist-ai-auto-detect.md) | ai-auto-detect |
| HR 시뮬레이션 | "HR 시뮬레이션", "리크루터 관점", "7.4초 테스트" | [checklist-hr-simulation.md](references/checklist-hr-simulation.md) | hr-simulation |

### 체크리스트 목록

| 체크리스트 | 파일 | 주요 검증 항목 |
|-----------|------|--------------|
| 데이터 정확성 | [checklist-data-accuracy.md](references/checklist-data-accuracy.md) | ko/en 동기화, 날짜 정합성, 수치 일관성 |
| HR/채용 관점 | [checklist-hr-perspective.md](references/checklist-hr-perspective.md) | STAR 형식, featured 선정, 7.4초 테스트 |
| 기술적 정확성 | [checklist-technical.md](references/checklist-technical.md) | 서비스명 검증, techStack 적절성 |
| 한국어 문장 | [checklist-writing-ko.md](references/checklist-writing-ko.md) | 문체 일관성, 조사/호응, AI 슬롭 |
| 영문 번역 | [checklist-writing-en.md](references/checklist-writing-en.md) | 번역 누락, Action Verb, 영문 관례 |
| 구조/레이아웃 | [checklist-structure.md](references/checklist-structure.md) | 역순 정렬, details 균형, 비중 분석 |
| 코드 품질 | [checklist-code-quality.md](references/checklist-code-quality.md) | Astro 컴포넌트 구조, CSS 품질/중복, 접근성(WCAG AA), SEO, 성능, 타입 안전성 |
| UI/UX | [checklist-ui-ux.md](references/checklist-ui-ux.md) | 반응형, 다크모드, 타이포그래피, 여백/정렬, F패턴/Z패턴, CTA 배치 |
| HR 심층 분석 | [checklist-hr-deep.md](references/checklist-hr-deep.md) | Summary 임팩트, 7.4초 스캔, STAR 정량화, 경력 스토리라인, 성장 궤적, 차별화 |
| 포지션 적합성 | [checklist-position-fit.md](references/checklist-position-fit.md) | 경력 커버리지, 도메인 균형, 하이라이트 다양성, 깊이 vs 넓이, 맞춤 PDF 용이성 |
| AI 탐지 | [checklist-ai-detection.md](references/checklist-ai-detection.md) | AI 슬롭 패턴, 과장 표현, AI 특유 어휘, 한국어 AI 패턴, 사람 vs AI 문체 판별 |
| 밀도 검증 | [checklist-density.md](references/checklist-density.md) | 표면별 밀도 기준, details 수, 총 bullet 수, detail 길이, HR PDF 페이지 수, ATS 단일 컬럼 |
| AI 자동 탐지 | [checklist-ai-auto-detect.md](references/checklist-ai-auto-detect.md) | 문장 길이 분산, 금지어 자동 스캔, 정량 성과 비율, 구조 반복 탐지 |
| HR 시뮬레이션 | [checklist-hr-simulation.md](references/checklist-hr-simulation.md) | 7.4초 스캔, 키워드 매칭, 정량 밀도, 도구 명시성 |

## Related Files

아래 `references/` 파일은 리뷰 시 직접 로드하는 기준 문서다(파일 존재 확인 완료).

| 파일 | 용도 |
|------|------|
| `references/guide-web-review.md` | 웹 이력서 전체 리뷰 가이드 |
| `references/guide-print-pdf.md` | HR Print PDF 리뷰 가이드 |
| `references/guide-ats-pdf.md` | ATS PDF 리뷰 가이드 |
| `references/guide-experience-detail.md` | 경력 상세 리뷰 가이드 |
| `references/guide-portfolio.md` | 포트폴리오 리뷰 가이드 |
| `references/checklist-data-accuracy.md` | 데이터 정확성 체크리스트 |
| `references/checklist-hr-perspective.md` | HR/채용 관점 체크리스트 |
| `references/checklist-technical.md` | 기술적 정확성 체크리스트 |
| `references/checklist-writing-ko.md` | 한국어 문장 체크리스트 |
| `references/checklist-writing-en.md` | 영문 번역 체크리스트 |
| `references/checklist-structure.md` | 구조/레이아웃 체크리스트 |
| `references/checklist-code-quality.md` | 코드 품질 체크리스트 |
| `references/checklist-ui-ux.md` | UI/UX 체크리스트 |
| `references/checklist-hr-deep.md` | HR 심층 분석 체크리스트 |
| `references/checklist-position-fit.md` | 포지션 적합성 체크리스트 |
| `references/checklist-ai-detection.md` | AI 탐지 체크리스트 |
| `references/checklist-density.md` | 밀도 검증 체크리스트 |
| `references/checklist-editing-feedback.md` | 편집 피드백 루프 체크리스트 |
| `references/checklist-ai-auto-detect.md` | AI 자동 탐지 체크리스트 |
| `references/checklist-hr-simulation.md` | HR 리크루터 시뮬레이션 체크리스트 |

## 워크플로우

### Step 1: 리뷰 유형 판별

유저 요청에서 리뷰 대상 식별:
- 특정 경력(회사명/slug) 언급 → **경력 상세 리뷰**
- "PDF", "Print" 언급 → **HR Print PDF 리뷰**
- "ATS" 언급 → **ATS PDF 리뷰**
- "포트폴리오" 언급 → **포트폴리오 리뷰**
- "밀도 검토", "details 많지 않나" 언급 → **밀도 검증**
- "문장 검토", "표현 검토", "피드백 루프" → **편집 피드백 루프**
- "AI 탐지", "AI 체크" → **AI 자동 탐지**
- "HR 시뮬레이션", "리크루터 관점", "7.4초 테스트" → **HR 리크루터 시뮬레이션**
- 일반 "이력서 리뷰" → **웹 이력서 전체 리뷰**
- 모호한 경우 유저에게 확인

### Step 2: 리뷰 기준 로드

Quick Reference 테이블에 따라 `references/`에서 해당 가이드 + 체크리스트를 읽는다.

### Step 3: 데이터 수집

리뷰 대상 파일 읽기:

| 파일 | 경로 | 용도 |
|------|------|------|
| 한국어 이력서 | `src/content/resume/ko.json` | 기본 리뷰 대상 |
| 영어 이력서 | `src/content/resume/en.json` | ko/en 비교 |
| 포트폴리오 | `src/data/portfolio.json` | 포트폴리오 리뷰 시 |
| projection 유틸 | `src/utils/resume-data.ts` | surface별 노출 차이 기준 확인 |
| 템플릿 | `src/components/templates/*.astro` | 렌더링 로직 확인 |
| 스타일 | `src/styles/global.css` | 디자인 리뷰 시 |
| 콘텐츠 스키마 | `src/content.config.ts` | 필드 구조 확인 |

경력 상세 리뷰 시: 대상 slug의 experience 데이터만 추출하여 집중 분석.

### Step 3.5: 실행 기반 증거 수집

정적 파일 읽기만으로 리뷰를 끝내지 않는다. 표면 리뷰가 포함되면 아래 실행 근거를 수집한다.

필수 순서:
1. `npm run build` — 현재 코드/데이터 상태가 실제 빌드되는지 확인
2. `npm run dev` — 로컬 리뷰 서버 실행
3. 필요 시 `npm run pdf:hr`, `npm run pdf:ats` 또는 `npm run pdf` 실행
4. `agent-browser` 또는 `webapp-testing`으로 실제 표면 확인

필수 증거:
- 웹/경력 상세/포트폴리오: **전체 관련 라우트**에 대한 desktop + mobile screenshot
- HR/ATS PDF: **생성된 모든 `dist/pdf/*.pdf`** 실제 파일 확인 결과
- projection 변경이 있는 경우: `src/utils/resume-data.ts` 규칙과 화면 차이 비교 메모
- 섹션 단위 메모: `핵심 역량`, `경력`, `기술 스택`, `포트폴리오 카드`, `포트폴리오 상세`, `경력 상세` 등

기본 증거 저장 위치:
- `resume-review-workspace/iteration-*/`
- 또는 세션에서 명시한 임시 evidence 디렉터리

### Step 4: 체크리스트 기반 리뷰 실행

각 체크리스트 항목을 순회하며 검증:

1. **데이터 정확성**: ko/en 필드 수/순서/값 동기화, 날짜/기간 정합성, 수치 교차 검증
2. **HR 관점**: STAR 형식 충족도, featured 적절성, 중복/반복 검출
3. **기술적 정확성**: 서비스명/패턴명 공식 표기, techStack 포함관계
4. **한국어 문장**: 문체 통일(서술형/명사형), 조사/호응, 과장 표현 검출
5. **영문 번역**: 누락 없음, Action Verb 과거형, 금액/단위 표기
6. **구조/레이아웃**: details 개수 균형, description 길이, 프로젝트 순서, surface별 projection 일관성
7. **코드 품질**: Astro 컴포넌트 구조, CSS 품질/중복, 접근성, SEO, 성능, 타입 안전성, 에러 처리
8. **UI/UX**: 반응형, 다크모드, 타이포그래피 계층, 여백/정렬, 인터랙션, 시각적 계층, F/Z패턴, CTA, dense grid/핵심 역량 스캔성
9. **HR 심층**: Summary 임팩트, 7.4초 스캔 시뮬레이션, STAR 정량화, 경력 스토리라인, 성장 궤적, 차별화
10. **포지션 적합성**: 경력 커버리지, 도메인 균형, 하이라이트 다양성, 기술 깊이 vs 넓이, 맞춤 PDF 용이성
11. **AI 탐지**: AI 슬롭 패턴, 과장/홍보 표현, AI 특유 어휘, 한국어 AI 패턴, 사람 vs AI 문체 판별
12. **밀도 검증**: 표면별 밀도 목표(웹/HR PDF/ATS/경력상세/포트폴리오), details 상한, 총 bullet, 문장 길이, HR PDF 페이지 수, ATS 단일 컬럼 확인
13. **AI 자동 탐지**: 문장 길이 분산, 금지어 자동 스캔, 정량 성과 비율, 구조 반복 탐지
14. **HR 시뮬레이션**: 7.4초 스캔, 키워드 매칭, 정량 밀도, 도구 명시성

### Step 5: 결과 작성

[review-output-template.md](assets/review-output-template.md) 형식을 따라 결과 작성:
- 카테고리별 점수 (10점 만점)
- 이슈 목록 (CRITICAL / HIGH / MEDIUM / LOW)
- 발견 사항별 "현재 / 제안" 형식
- 수정 불필요 판정도 명시적으로 포함
- 종합 점수 + 핵심 개선 권장사항 (우선순위순)
- 실제 실행 증거(스크린샷, PDF 파일, 브라우저 관찰 메모)를 함께 기록

## 주의사항

- **읽기 전용**: 코드/데이터 수정 없이 리뷰 문서만 작성
- **ko 기준 진행**: ko.json 기준으로 분석 후 en.json과 비교
- **교차 검증**: highlights <-> project details <-> portfolio 간 수치 교차 확인
- **Projection 인지**: surface별 생략/축약은 `src/utils/resume-data.ts` 규칙과 일치하는지 먼저 확인
- **실행 근거 필수**: 웹/상세/포트폴리오 리뷰는 브라우저 캡처 없이 완료로 간주하지 않음
- **전체 표면 필수**: exhaustive review 요청에서는 대표 페이지만 보지 않고, 관련 페이지 전체를 확인해야 완료로 본다
- **PDF 실물 확인 필수**: Print/ATS 리뷰는 생성된 `dist/pdf/*.pdf` 실제 결과 확인 없이 완료로 간주하지 않음
- **기존 리뷰 참조**: 프로젝트 루트의 `.{slug}-review.md` 파일이 있으면 기존 이슈 추적
- **점수 기준 일관성**: 10점 만점 기준 사용. 기존 리뷰의 다른 점수 체계(5점 등)와 비교 시 환산 필요
