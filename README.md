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

- `ko.json`과 `en.json`은 프로젝트·상세 순서와 공개 범위를 함께 맞춥니다.
- 웹 이력서·HR·ATS에는 대표 프로젝트 이름만 표시합니다. 경력 상세 페이지와 경력기술서는 모든 프로젝트와 상세 근거를 표시하며, 강한 성과를 앞에 배치합니다. 프로젝트의 `featured: false`는 메인의 프로젝트 목록에서만 제외합니다.
- 웹 이력서의 Evidence Board는 각 `proofLabel` 성과의 `evidenceProject` slug로 같은 언어의 공개 포트폴리오 사례에 연결합니다. 국·영문에 동일한 연결을 유지하며, 누락·알 수 없는 slug·비공개 대상은 콘텐츠 검증에서 빌드를 실패시킵니다.
- 이력서의 웹 포트폴리오와 PDF 미리보기는 별도 진입점입니다. PDF 미리보기 페이지의 다운로드 버튼이 실제 PDF를 제공합니다.
- 공개 프로젝트 목록은 사례 상세·소스 저장소·데모를 구분합니다. Family Budget은 운영 미연결 합성 데이터 실행 데모이며, Launcher의 GitHub Demo는 실행 앱이 아닌 예제 저장소로 표시합니다.
- 포트폴리오의 `operationalLimits`는 대표/목록 분류와 관계없이 해당 상세 페이지에 표시합니다.
- PDF 생성기는 페이지를 자르지 않습니다. 전체 PDF를 파싱해 HR 2쪽·ATS 3쪽 제한과 인쇄 대상 텍스트의 보존을 검사한 뒤에만 파일을 저장합니다. 경력기술서·포트폴리오에는 임의 쪽수 제한을 두지 않습니다.
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

### Pinned font provenance

- Pretendard v1.3.9, upstream commit [`5c41199`](https://github.com/orioncactus/pretendard/tree/5c41199ea0024a9e0b2cb31735265056e5472d76). 원본을 변경하지 않고 재배포하며 [OFL·저작권 고지](public/fonts/OFL.txt)를 함께 제공합니다.
- Web: `public/fonts/PretendardVariable.woff2`, SHA-256 `9599f12fd42fc0bce1cd50b47a0c022e108d7aa64dd0d1bb0ed44f3282d900b4`.
- CI native: `scripts/fonts/PretendardVariable.ttf`, SHA-256 `3090ccde0442bb347aa7685d9ba8b17436a60682df6e8f92a9a670de14056e22`. WOFF2를 Fontconfig가 지원한다고 가정하지 않습니다. 두 파일의 해시는 CI에서 검증합니다.

### Dependency remediation

정적 호스팅에서도 개발 서버·빌드 입력의 취약점은 별도로 평가합니다. `npm audit`는 개발 의존성까지 포함해 실행합니다.

- Typography 0.5.20이 고정한 selector parser 6.0.10은 [CPU 고갈 취약점](https://github.com/advisories/GHSA-rj75-hqrm-r3gf)이 있어 해당 하위 트리만 7.1.6으로 override합니다.
- Mermaid CLI 11.16.0 하위 KaTeX는 [신뢰 제한 우회](https://github.com/advisories/GHSA-238p-pmpm-9mq7) 수정판 0.18.2로 override합니다. 업스트림 범위가 수정되면 override를 제거합니다.
- DOMPurify·source-map-js·Vite는 호환 범위 안에서 패치된 버전으로 lockfile을 갱신했습니다. 다이어그램 렌더링과 사이트 빌드를 함께 검증합니다.
- `npm audit`의 0건은 Mermaid 내부에 미리 번들된 코드까지 패치됐다는 뜻이 아닙니다. 현재 CLI가 로드하는 Mermaid 번들에는 DOMPurify 3.4.12·KaTeX 0.16.47이 남아 있습니다. 조사한 최신 Mermaid 12.2.0 배포 파일도 DOMPurify 3.4.12를 포함하므로 메이저 업그레이드만으로 해결되지 않습니다. 검토한 입력은 저장소의 신뢰된 다이어그램이며 관련 공격 전제는 확인되지 않았습니다. 이 렌더러는 공개 사이트에 배포하지 않으며, 임의 외부 다이어그램을 처리하는 용도로 확대하기 전에는 번들 수정판을 재평가해야 합니다.
