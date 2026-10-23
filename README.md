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

Astro 5 · Tailwind CSS 4 · TypeScript (strict) · Puppeteer (PDF) · GitHub Pages

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
- 포트폴리오의 `operationalLimits`는 대표/목록 분류와 관계없이 해당 상세 페이지에 표시합니다.
- PDF 검증은 HR 2쪽·ATS 3쪽 이내인지 확인하고, HR은 `pageRanges` 없이 출력한 결과도 대조해 잘린 페이지가 없는지 확인합니다.

## Commands

| Command | Action |
|---------|--------|
| `npm install` | 의존성 설치 |
| `npm run dev` | 개발 서버 (localhost:4321) |
| `npm run build` | 프로덕션 빌드 |
| `npm run pdf` | PDF 생성 (HR + ATS) |
| `npm run pdf:hr` | HR용 PDF만 |
| `npm run pdf:ats` | ATS용 PDF만 |

## Deploy

GitHub Actions로 자동 배포 (main 브랜치 push 시)
