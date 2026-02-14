# 이력서 (Resume)

개인 이력서 사이트 - Astro + Tailwind CSS

## Live

https://kilhyeonjun.github.io/resume/

## Features

- 한국어/영어 이력서
- PDF 출력 최적화 (HR용/ATS용)
- 다크모드 지원
- 반응형 디자인
- 포트폴리오

## Structure

```
src/
├── components/
│   ├── icons/              # SVG icon components
│   └── templates/          # Page template components
├── content/
│   └── resume/
│       ├── ko.json         # 한국어 데이터
│       └── en.json         # 영어 데이터
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
├── styles/
│   └── global.css
├── types/
│   └── portfolio.ts
└── utils/
    └── paths.ts
scripts/
└── generate-pdf.ts         # PDF 생성 (Puppeteer)
```

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
