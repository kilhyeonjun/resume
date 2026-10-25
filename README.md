# 이력서 (Resume)

개인 이력서 사이트 - Astro + Tailwind CSS

## Live

https://career.kilpenguin.com/

## Features

- 한국어/영어 이력서
- PDF 출력 최적화 (HR용/ATS용)
- 다크모드 지원
- 반응형 디자인
- 포트폴리오

## Tech Stack

Node.js ≥22.13.0 (CI: 24) · Astro 7 · Tailwind CSS 4 · TypeScript (strict) · Puppeteer / PDF.js · GitHub Pages

## Structure

```
src/
├── components/
│   ├── icons/              # SVG icon components
│   ├── resume/             # Resume section components
│   └── templates/          # Page template components
├── content/resume/
│   ├── ko.json             # 한국어 데이터 (source of truth)
│   └── en.json             # 영어 데이터
├── data/
│   └── portfolio.json      # 포트폴리오 데이터
├── layouts/
│   └── Layout.astro
├── pages/
│   ├── index.astro         # 한국어 이력서
│   ├── resume-print.astro  # HR용 PDF
│   ├── resume-ats.astro    # ATS용 PDF
│   ├── experience/         # 경력 상세
│   ├── portfolio/          # 포트폴리오
│   └── en/                 # 영어 버전
├── styles/global.css
└── utils/
    ├── resume-data.ts      # 표면별 데이터 projection
    ├── career-duration.ts  # 경력 기간 계산
    └── paths.ts
scripts/
└── generate-pdf.ts         # PDF 생성 (Puppeteer)
```

## Content curation

- `ko.json`과 `en.json`은 프로젝트·상세 순서와 공개 범위를 함께 맞춥니다. 공시 가격 차이는 실제 청구 절감으로, API 소비는 독자 서비스 설계로, 기간 없는 관찰은 무장애 보장으로 확대하지 않습니다. 정량 근거가 부족하면 확인된 조치·결과만 남기며 회사·직책·날짜·프로젝트 이력은 보존합니다.
- 웹 이력서의 첫 화면에는 원본 소개의 첫 문단과 동일한 경력 계산 기준의 연차를 표시합니다. 나머지 소개는 아래에 한 번만 표시합니다. 웹·HR·ATS 모두 경력을 역량보다 먼저 배치하며, 핵심 역량은 4개 범주로 압축하되 경력 성과는 보존합니다. HR 본문·보조 정보는 국·영문 모두 9pt 이상입니다.
- 포트폴리오 대표 사례의 성과는 이전 값·결과·측정 조건을 함께 표시합니다. 모바일에서도 두 성과와 수치의 적용 범위를 숨기지 않으며, SVG 표지는 자르지 않습니다. HR 이력서·경력기술서는 문제·해결보다 결과를 굵게 강조하되 본문 크기나 인쇄 내용을 줄이지 않습니다.
- 웹 이력서·HR·ATS에는 대표 프로젝트 이름만 표시합니다. 경력 상세 페이지와 경력기술서는 모든 프로젝트와 상세 근거를 표시하며, 강한 성과를 앞에 배치합니다. 프로젝트의 `featured: false`는 메인의 프로젝트 목록에서만 제외합니다.
- 웹 이력서의 Evidence Board는 각 `proofLabel` 성과의 `evidenceProject` slug로 같은 언어의 공개 포트폴리오 사례에 연결합니다. 국·영문에 동일한 연결을 유지하며, 누락·알 수 없는 slug·비공개 대상은 콘텐츠 검증에서 빌드를 실패시킵니다.
- 이력서 상단은 해당 언어 HR PDF 직접 다운로드와 대표 사례 두 진입점을 제공합니다. HR·ATS·경력기술서·포트폴리오 미리보기는 Evidence Board 아래 키보드로 여닫는 문서 목록에 모읍니다.
- 상세 목차는 모바일·태블릿·데스크톱의 실제 섹션 순서를 따릅니다. 큰 아키텍처·시퀀스 도식은 가로 탐색과 원본 열기를 지원합니다. 공개 코드 목록은 `printOrder`로 Launcher·대신물류·콘서트 예약·일정 도구·예산 데모 순서를 지정하며, 목록형 PDF에서도 요약을 생략하지 않습니다.
- 공개 프로젝트 목록은 사례 상세·소스 저장소·데모를 구분합니다. Family Budget은 운영 미연결 합성 데이터 실행 데모이며, Launcher의 GitHub Demo는 실행 앱이 아닌 예제 저장소로 표시합니다.
- 포트폴리오의 `operationalLimits`는 대표/목록 분류와 관계없이 해당 상세 페이지에 표시합니다.
- 대신물류의 [운영 검증 기록](public/evidence/daesin-production-verification.json)은 운영자가 기록한 단일 배포 관측입니다. 공개 소스·CI·합성 시나리오와 구분하며, 실제 배포·복구·변경 행 일치와 제한된 조회 표본만 담습니다. DB 변경 감지 시점부터의 시간을 원천 변경·commit 시점부터의 지연이나 SLA·처리 용량으로 표현하지 않습니다. 운영 주소·인증 정보·데이터·인프라 식별자는 공개하지 않습니다.
- PDF 생성기는 페이지를 자르지 않습니다. 전체 PDF를 파싱해 HR 2쪽·ATS 3쪽 제한과 인쇄 대상 텍스트의 보존을 검사한 뒤에만 파일을 저장합니다. 경력기술서는 원본 JSON의 직책·직책별 문제/해결/성과가 렌더링되었는지도 별도로 검사하므로, DOM 누락이 검증 기준을 축소하지 못합니다. 경력기술서·포트폴리오에는 임의 쪽수 제한을 두지 않습니다.
- 채팅 아키텍처는 웹에서 원본 너비를 유지하는 키보드 탐색 가능 영역으로, PDF에서는 사례 설명 뒤 독립 A4 가로 페이지로 표시합니다. 가로 그림은 문서가 아닌 페이지 중심에 맞춰 다른 페이지까지 자동 축소되지 않게 합니다. 혼합 방향 PDF 회귀 검사는 실제 글자 크기 7pt 이상과 가로 페이지 경계를 검증합니다. 경력기술서는 긴 프로젝트를 근거 항목 사이에서 나누되 제목·본문과 개별 근거는 함께 유지합니다. 회사명·직책·기간 header 내부와 ATS 기술 공유의 제목·기간·설명은 작은 묶음으로 보호합니다.
- 장애 시간과 대응 조치처럼 서로 비교할 수 없는 값은 전후 개선율이 아닌 단일 관측·조치로 표시합니다. 긴 기술 용어는 320px 경력 상세에서도 전체 문서 너비를 늘리지 않고 줄바꿈합니다. 공통 내비게이션은 운영체제별 글꼴 폭이 달라도 항목을 숨기거나 터치 영역을 줄이지 않고 다음 줄로 배치합니다.
- 인쇄·OG는 `PrintFonts.astro`로 자체 호스팅한 Pretendard를 로드합니다. 폰트 로드 실패·내용 누락·쪽수 초과는 배포 실패이며 시스템 폰트로 조용히 대체하지 않습니다. 최종 PDF의 그림·표·페이지 경계는 별도로 시각 검증합니다.

## Commands

| Command | Action |
|---------|--------|
| `npm ci` | 잠금 파일 기준 의존성 설치 |
| `npm run dev` | 개발 서버 (localhost:4321) |
| `npm run build` | 프로덕션 빌드 |
| `npm run pdf` | 국·영문 HR·ATS·경력기술서·포트폴리오 PDF + OG 생성 |
| `npm run pdf:hr` | HR 계열 PDF (HR·경력기술서·포트폴리오) |
| `npm run pdf:ats` | ATS용 PDF만 |

## Deploy

GitHub Actions로 자동 배포합니다(main push). 코드·PDF 검증을 통과한 산출물만 게시합니다. CI는 저장소의 TTF를 Fontconfig에 설치해 SVG의 한국어 글리프를 제공하며 `apt-get` 네트워크 설치를 하지 않습니다.

### Browser regression checks

색 대비 검사는 공개 화면 경로와 텍스트 표본을 줄이지 않고, 한 페이지 평가 안에서 같은 색상의 RGBA 변환 결과만 재사용합니다. 서로 다른 색상은 기존처럼 새 기본 Canvas context에서 변환합니다. Context 재사용이나 `willReadFrequently` 옵션은 광색역·반투명 색상의 반올림을 바꿀 수 있어 사용하지 않습니다. 합성 순서·WCAG 임계값·테마·대기 조건·실패 판정은 유지합니다.

목차 순회 검사는 전체 국·영문 상세 경로에서 section ID와 목차 href뿐 아니라 실제 화면의 H2 배치 순서까지 비교합니다. `DOMContentLoaded`와 `document.fonts.ready` 뒤에 390·780·1440px 너비를 검사하므로 CSS 재배치로 생긴 목차 불일치도 실패합니다. 별도의 네트워크 유휴 구간은 기다리지 않습니다. 다만 `document.fonts.ready`는 문서의 로드·레이아웃 준비와 연동되므로, 미완료 이미지 요청과 완전히 독립적인 대기는 아닙니다. 도식 가독성과 페이지 경계는 별도 시각 검증 대상이며, 목차·섹션을 비동기 렌더링으로 옮길 때는 준비 조건도 함께 변경해야 합니다.

태블릿 SVG 경계 검사도 `networkidle0` 대신 `DOMContentLoaded`와 `document.fonts.ready`를 기다립니다. 768×900px, 공개 상세 18개 국·영문 경로, HTTP 200, 보이는 모든 `svg path`의 좌우 ±1px 경계 판정은 유지합니다. 지연된 CSS·defer 스크립트로 만든 실제 이탈을 이전·변경 검사 모두 탐지했고, 지연 폰트 완료 뒤 측정도 확인했습니다. 같은 Node 24·브라우저에서 두 차례 비교한 검사 시간은 20.086→4.179초, 19.168→3.613초였습니다. 비동기 스타일·DOM·애니메이션으로 SVG 배치를 바꾸면 준비 조건을 다시 검증해야 합니다.

### Pinned font provenance

- Pretendard v1.3.9, upstream commit [`5c41199`](https://github.com/orioncactus/pretendard/tree/5c41199ea0024a9e0b2cb31735265056e5472d76). 원본을 변경하지 않고 재배포하며 [OFL·저작권 고지](public/fonts/OFL.txt)를 함께 제공합니다.
- Web: `public/fonts/PretendardVariable.woff2`, SHA-256 `9599f12fd42fc0bce1cd50b47a0c022e108d7aa64dd0d1bb0ed44f3282d900b4`.
- CI native: `scripts/fonts/PretendardVariable.ttf`, SHA-256 `3090ccde0442bb347aa7685d9ba8b17436a60682df6e8f92a9a670de14056e22`. WOFF2를 Fontconfig가 지원한다고 가정하지 않습니다. 두 파일의 해시는 CI에서 검증합니다.

### Dependency remediation

정적 호스팅에서도 개발 서버·빌드 입력의 취약점은 별도로 평가합니다. `npm audit`는 개발 의존성까지 포함해 실행합니다.

- Typography 0.5.20이 고정한 selector parser 6.0.10은 [CPU 고갈 취약점](https://github.com/advisories/GHSA-rj75-hqrm-r3gf)이 있어 해당 하위 트리만 7.1.6으로 override합니다.
- Mermaid CLI 11.16.0 하위 KaTeX는 [신뢰 제한 우회](https://github.com/advisories/GHSA-238p-pmpm-9mq7) 수정판 0.18.2로 override합니다. 업스트림 범위가 수정되면 override를 제거합니다.
- DOMPurify·source-map-js·Vite는 호환 범위 안에서 패치된 버전으로 lockfile을 갱신했습니다. 다이어그램 렌더링과 사이트 빌드를 함께 검증합니다.
- Puppeteer는 25.16.0과 해당 버전이 요구하는 browser/protocol 의존성을 함께 고정합니다. Chromium BiDi가 Zod 4를 지원하는 버전으로 전환한 뒤 Zod 4.6.7, Undici 8.12.3, fast-uri 3.1.9를 기존 선언 범위 안에서 해석했습니다. Zod 3 소비자에 Zod 4를 강제 override하지 않습니다. 개발 의존성 포함 `npm audit`는 0건입니다.
- 보안 패치 검증 런타임은 CI와 같은 Node 24입니다. Undici가 요구하는 Node ≥22.19.0은 패치 전부터 존재한 제약이며, 저장소의 포괄적인 ≥22.13.0 표기만으로 하위 의존성 전체의 호환성을 보장하지 않습니다. PDF·OG 생성기의 외부 URL 렌더링은 신뢰할 수 있는 릴리스 입력에 한정합니다.
- `npm audit`의 0건은 Mermaid 내부에 미리 번들된 코드까지 패치됐다는 뜻이 아닙니다. 현재 CLI가 로드하는 Mermaid 번들에는 DOMPurify 3.4.12·KaTeX 0.16.47이 남아 있습니다. 조사한 최신 Mermaid 12.2.0 배포 파일도 DOMPurify 3.4.12를 포함하므로 메이저 업그레이드만으로 해결되지 않습니다. 검토한 입력은 저장소의 신뢰된 다이어그램이며 관련 공격 전제는 확인되지 않았습니다. 이 렌더러는 공개 사이트에 배포하지 않으며, 임의 외부 다이어그램을 처리하는 용도로 확대하기 전에는 번들 수정판을 재평가해야 합니다.
