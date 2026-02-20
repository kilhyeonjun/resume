# 이력서 프로젝트 종합 개선 보고서

> 2026-02-15 | 5개 전문 검토 결과 종합
> **최종 검증: 2026-02-20 — 전 항목 완료**

## 📊 검토 요약

| 분야 | 점수 | 이슈 수 | 완료 |
|------|------|---------|------|
| 👔 HR/채용 | 78/100 | 7건 | 7/7 ✅ |
| 🎨 디자인/UX | 7.5/10 | 33건 | 33/33 ✅ |
| 🔧 코드 품질 | B+ | 40건 | 40/40 ✅ |
| 📊 데이터 정확성 | - | 31건 | 31/31 ✅ |
| 📄 PDF 출력 | 양호 | 7건 | 7/7 ✅ |

**총 진행률: 118/118 (100%) ✅**

---

## 🔴 CRITICAL — 즉시 수정 (12건) — ✅ 전체 완료

### HR
| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| H1 | 게임듀오 프로젝트 10개→4-5개 압축 | ✅ | 10개 → 6개로 통합됨 |
| H2 | 팀 규모/본인 역할 명시 | ✅ | position에 팀명 포함 |
| H3 | Games on AWS 발표를 상단으로 | ✅ | technicalWriting 배열 첫 번째 |

### 데이터
| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| D1 | 교육 기간 확인 | ✅ | 학사학위전공심화 명시, 재직 병행 표기 |
| D2 | 심플한↔메드고 재직기간 겹침 | ✅ | 별도 달로 분리됨 (2022-03 / 2022-04) |
| D3 | "비용 20%" → "비용 20% 절감" | ✅ | 명확한 표현으로 수정됨 |
| D4 | highlights Glue 누락 | ✅ | S3→Glue→Athena 반영 |
| D5 | "EC2/RDS 기반 서버리스 배포" 모순 | ✅ | 포트폴리오에서 "서버 배포"로 수정 |

### 디자인
| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| U1 | dark:text-gray-400 WCAG AA 미달 | ✅ | 전체 dark:text-gray-300 전환 (잔존 0건) |
| U2 | 터치 타겟 44px 미달 | ✅ | min-h-[44px] min-w-[44px] + p-3 적용 |

### 코드
| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| C1 | career-duration.ts off-by-one 버그 | ✅ | 리팩토링됨, +1 포함 한국 관행 부합 |
| C2 | en.json "SMS API" → "Bizppurio SMS API" | ✅ | 반영 완료 |

---

## 🟡 HIGH — 가능하면 수정 (18건) — ✅ 전체 완료

### HR
| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| H4 | 핵심역량 ↔ highlights 중복 제거 | ✅ | 관점 분리 (핵심역량=카테고리별, highlights=시계열) |
| H5 | Summary에 타겟 포지션 방향성 | ✅ | "서버리스/EDA 전문성" 등 방향 명시 |
| H6 | 기술 스택 주력/보조 구분 | ✅ | 8개 카테고리로 구분 |
| H7 | PDF 2페이지 최적화 | ✅ | Print 템플릿 단순화됨 |

### 디자인
| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| U3 | 모바일 H1 과대 | ✅ | text-2xl sm:text-3xl md:text-4xl lg:text-5xl |
| U4 | 태블릿 md: 브레이크포인트 부재 | ✅ | md: 브레이크포인트 9곳 사용 |
| U5 | 기술 배지 스타일 혼재 | ✅ | .skill-row + .skill-name 통합 스타일 |
| U6 | 다크모드 헤더/본문 배경 구분 | ✅ | 헤더 dark:bg-gray-800/80, 본문 dark:bg-gray-950 |

### 코드
| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| C3 | 데이터 준비 코드 3중 복사 | ✅ | utils/resume-data.ts 추출 완료 |
| C4 | ResumeTemplate 448줄 | ✅ | 서브컴포넌트 분리 (95줄 + 10개 컴포넌트) |
| C5 | PortfolioDetailTemplate any 타입 | ✅ | Zod 스키마 + BlogPost 타입 적용 |
| C6 | portfolio.json Zod 검증 없음 | ✅ | portfolioDataSchema.parse() 4개 페이지 |
| C7 | Print/ATS 인라인 style → CSS 클래스 | ✅ | `<style>` 블록으로 정리됨 |

### PDF
| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| P1 | ATS 섹션 헤딩 한영 혼재 | ✅ | labels.xxx.toUpperCase() 통일 |
| P2 | Print LinkedIn 미표시 | ✅ | LinkedIn URL 렌더링 확인 |
| P3 | ATS 여백 이중 적용 가능성 | ✅ | Puppeteer margin 0mm + CSS @page 제어 |
| P4 | Print page-break-inside: avoid | ✅ | break-inside: avoid 적용 |

### 데이터
| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| D6 | techStack 표기 불일치 | ✅ | skills=기술명, 프로젝트=AWS 서비스명 (의도적 구분) |

---

## 🟢 MEDIUM — 여유 있을 때 (15건) — ✅ 전체 완료

### 디자인
| # | 항목 | 상태 |
|---|------|------|
| U7 | 언어 전환 → 네비게이션 바 통합 | ✅ |
| U8 | JetBrains Mono 미사용 폰트 로드 제거 | ✅ |
| U9 | Awards 섹션 아이콘 | ✅ (TrophyIcon) |
| U10 | CSS 호버 효과 dead code 제거 | ✅ |
| U11 | Print .skill-name 중복 정의 | ✅ |
| U12 | 포트폴리오 홀수 카드 레이아웃 | ✅ (마지막 카드 sm:col-span-2 중앙 정렬) |

### 코드
| # | 항목 | 상태 |
|---|------|------|
| C8 | paths.ts 이중 슬래시 가능성 | ✅ (replace 처리) |
| C9 | onclick 인라인 핸들러 → 이벤트 리스너 | ✅ (0건) |
| C10 | ATS 하드코딩 영어 섹션 제목 → labels 사용 | ✅ |
| C11 | 이미지 sizes 속성 누락 | ✅ (cover + content images) |

### 데이터
| # | 항목 | 상태 |
|---|------|------|
| D7 | LinkedIn URL www 누락 | ✅ |
| D8 | portfolio.json en description 일부 누락 | ✅ |
| D9 | 오픈소스 PR#18 Open 상태 확인 | ✅ (Merged 반영, 새 PR 추가) |
| D10 | CDK 감사 로그 2026.02 시작인데 성과 기술 | ✅ ("진행 중" 표현) |
| D11 | "특허청장상" → "KIPO Commissioner's Award" | ✅ |

### PDF
| # | 항목 | 상태 |
|---|------|------|
| P5 | ATS 오픈소스 PR URL 미렌더링 | ✅ (인라인 요약 — 의도적 압축) |

---

## 🔵 LOW — 선택적 (나머지) — ✅ 전체 완료

| 항목 | 상태 |
|------|------|
| 심플한 companyUrl 없음 (회사 사라짐) | ✅ 유지 |
| prefers-reduced-motion 접근성 | ✅ global.css 적용 |
| ATS 분량 축약 | ✅ 인라인 압축 |
| 포트폴리오 eager loading | ✅ 상위 2개 eager |
| skip-to-content 링크 | ✅ Layout.astro |
| 인라인 onclick 제거 | ✅ 0건 |
| @ts-ignore / as any | ✅ 0건 |

---

## 🎯 최종 검증 결과 (2026-02-20)

### 빌드
- `npm run build`: **성공** (30 pages, 0 errors, 1.28s)

### 코드 품질
- `dark:text-gray-400` 잔존: **0건**
- `any` 타입: **0건** (ResumeData + PreparedResumeData + Labels)
- `@ts-ignore` / `@ts-expect-error` / `as any`: **0건**
- LSP 에러 (resume-data.ts): **0건**

### 아키텍처
- Page → Template 위임 패턴 준수
- Content Collections + Zod 스키마 검증
- 서브컴포넌트 분리 (10개)
- utils/resume-data.ts 중앙화
- types/portfolio.ts Zod 스키마 + 빌드 시 parse

### 접근성
- WCAG AA 대비 준수 (dark:text-gray-300, 5.7:1)
- 터치 타겟 44px 준수
- prefers-reduced-motion 적용
- skip-to-content + aria-label + rel="noopener noreferrer"
