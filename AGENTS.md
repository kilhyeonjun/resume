# AGENTS.md — Resume Site

> Astro 5 + Tailwind CSS 4 + TypeScript (strict) personal resume/portfolio site.
> Deployed to GitHub Pages at `https://kilhyeonjun.github.io/resume/`.

## Build & Run Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at localhost:4321
npm run build        # Production build → dist/
npm run preview      # Preview production build

# PDF generation (requires dev server running first)
npm run pdf          # Generate all PDFs (KO+EN, HR+ATS)
npm run pdf:hr       # HR versions only
npm run pdf:ats      # ATS versions only
```

There are **no tests or linting** configured. No ESLint, Prettier, or test runner.
Validate changes with `npm run build` (exit code 0 = success).

## Tech Stack

| Layer           | Technology                          |
|-----------------|-------------------------------------|
| Framework       | Astro 5.17 (SSG, `type: "module"`)  |
| Styling         | Tailwind CSS 4.1 via `@tailwindcss/vite` |
| Types           | TypeScript strict (`astro/tsconfigs/strict`) |
| Content         | Astro Content Collections (JSON + Zod schemas) |
| PDF             | Puppeteer (headless Chrome)         |
| Script runner   | tsx (for `scripts/generate-pdf.ts`) |
| Deploy          | GitHub Actions → GitHub Pages       |
| Node            | 20                                  |

## Project Structure

```
src/
├── components/
│   ├── icons/              # SVG icon components (*.astro)
│   └── templates/          # Page template components
│       ├── ResumeTemplate.astro
│       ├── ResumePrintTemplate.astro
│       ├── PortfolioTemplate.astro
│       ├── PortfolioDetailTemplate.astro
│       └── ExperienceDetailTemplate.astro
├── content/
│   └── resume/
│       ├── ko.json         # Korean resume data
│       └── en.json         # English resume data
├── content.config.ts       # Zod schemas + collection definitions
├── data/
│   └── portfolio.json      # Portfolio project data
├── layouts/
│   └── Layout.astro        # Main layout (nav, header, footer, dark mode)
├── pages/
│   ├── index.astro         # Home page
│   ├── resume.astro        # Korean resume (thin wrapper)
│   ├── resume-print.astro  # Korean HR PDF page
│   ├── resume-ats.astro    # Korean ATS PDF page
│   ├── resume/experience/  # Experience detail pages
│   ├── portfolio/          # Portfolio list + detail ([slug].astro)
│   └── en/                 # English versions (mirrors KO structure)
└── styles/
    └── global.css          # Tailwind config, theme, print styles
scripts/
└── generate-pdf.ts         # PDF generation via Puppeteer
```

## Architecture Patterns

### Page → Template Delegation
Pages are thin wrappers that delegate to template components with a `lang` prop:
```astro
---
import ResumeTemplate from '../components/templates/ResumeTemplate.astro';
---
<ResumeTemplate lang="ko" />
```
**Follow this pattern.** Pages should contain minimal logic.

### Content Collections
Resume data lives in `src/content/resume/{ko,en}.json`, validated by Zod schemas in `content.config.ts`.
Access via `getEntry('resume-ko', 'main')` or `getEntry('resume-en', 'main')`.
Portfolio data is a plain JSON import from `src/data/portfolio.json`.

### i18n
No i18n library. Bilingual support is achieved through:
- Separate content JSON files (ko.json / en.json)
- Mirrored page directories (`src/pages/` for KO, `src/pages/en/` for EN)
- A `labels` object in each JSON for UI strings
- `lang: 'ko' | 'en'` prop threaded through templates

### Dark Mode
Class-based dark mode (`document.documentElement.classList.add('dark')`).
Persisted in localStorage. Inline script in `Layout.astro` prevents FOUC.
Custom variant defined in `global.css`: `@custom-variant dark (&:where(.dark, .dark *));`

### Print / PDF
- `no-print` class hides elements during print (nav, footer, buttons)
- Dedicated print templates (`ResumePrintTemplate.astro`) with inline styles (no Tailwind)
- PDF generated via Puppeteer navigating to print pages on dev server

## Code Style

### TypeScript
- **Strict mode** (`astro/tsconfigs/strict`)
- Interfaces for component props using Astro's `Props` pattern:
  ```astro
  ---
  interface Props {
    lang: 'ko' | 'en';
  }
  const { lang } = Astro.props;
  ---
  ```
- Zod schemas for content validation (not manual type guards)
- Types exported from `content.config.ts` (e.g., `ResumeData`, `Experience`)

### Imports
- Astro built-ins: `import { getEntry } from 'astro:content'`
- Relative paths with `../` (no aliases configured)
- Order: Astro built-ins → layouts → components → data/content → types

### Component Conventions
- All components are `.astro` files (no React/Vue/Svelte)
- Icon components: accept `class?: string` prop, destructured as `class: className`
- Template components: accept `lang: 'ko' | 'en'` prop, fetch their own data
- Use `Astro.props` destructuring in frontmatter

### Styling
- **Tailwind CSS 4** (utility-first in markup)
- Custom theme colors defined in `global.css` under `@theme { ... }` (primary-50 through primary-950)
- Fonts: Inter (sans), JetBrains Mono (mono) via Google Fonts
- Custom CSS classes in `global.css` for shared styles (`.section-title`, `.skill-row`, etc.)
- Component-scoped `<style>` blocks for component-specific styles
- Dark mode: use `dark:` variant prefix throughout

### Naming
- Files: `PascalCase.astro` for components, `kebab-case.astro` for pages
- JSON fields: `camelCase`
- CSS classes: Tailwind utilities + BEM-ish custom classes (`.skill-badge`, `.section-title`)
- Dynamic routes: `[slug].astro`

### HTML / Accessibility
- Semantic HTML (`<article>`, `<section>`, `<header>`, `<nav>`, `<footer>`)
- `aria-label` on icon-only buttons/links
- `rel="noopener noreferrer"` on external links with `target="_blank"`
- `lang` attribute set on `<html>` element

### Error Handling
- `throw new Error(...)` for missing content data (fail fast on build)
- Puppeteer script: try/catch/finally with `process.exit(1)` on failure
- No error boundaries (SSG — errors surface at build time)

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/content.config.ts` | All Zod schemas + type exports — edit here when changing data shape |
| `src/styles/global.css` | Theme colors, print styles, shared CSS classes |
| `src/layouts/Layout.astro` | Shell: head, nav, footer, dark mode script |
| `src/components/templates/ResumeTemplate.astro` | Main resume rendering logic |
| `src/content/resume/ko.json` | Korean resume data (source of truth) |
| `scripts/generate-pdf.ts` | PDF generation config and Puppeteer orchestration |
| `.github/workflows/deploy.yml` | CI/CD: build + deploy to GitHub Pages |

## Skills

| Skill | Purpose |
|-------|---------|
| `verify-implementation` | 모든 verify 스킬 순차 실행 → 통합 검증 보고서 생성 |
| `manage-skills` | 세션 변경사항 분석 → verify 스킬 생성/업데이트/AGENTS.md 관리 |
| `resume-review` | 이력서 콘텐츠/구조 검증 |
| `verify-content` | 이력서 콘텐츠 데이터(ko/en JSON)와 Zod 스키마 정합성 검증 |
| `verify-astro-components` | Astro 컴포넌트/페이지 코드 규칙 준수 검증 |

## Gotchas

- **Base path**: Site is served under `/resume/` — use `import.meta.env.BASE_URL` for all internal links
- **No hot reload for JSON**: Content collection JSON changes may require dev server restart
- **PDF requires running dev server**: `npm run dev` must be running before `npm run pdf`
- **Print templates are standalone HTML**: `ResumePrintTemplate.astro` does NOT use `Layout.astro` — it has its own `<html>` with inline styles for PDF fidelity
- **Tailwind v4**: Uses new `@theme` and `@custom-variant` syntax, NOT `tailwind.config.js`
- **No linter/formatter**: Maintain consistency manually. Follow existing 2-space indent, single quotes, trailing commas in TS

## Work Data Archive

Resume content (`ko.json`/`en.json`) is curated from raw work data collected per company.

### Location
`~/.work-data/{company-slug}/` — NEVER inside this repo.

### File Structure
- `_meta.json` — Company metadata (name, position, period, domains)
- `{domain}.json` — Domain-level work journal
- `_source-map.json` — Ticket key mapping (private repo only)

### Schema (v1.1)
Each domain file has top-level fields: `schemaVersion`, `domain`, `description`, `collectedAt`, `workItems[]`.

`workItems[]` fields:

| Field | Required | Size | Description |
|-------|----------|------|-------------|
| `id` | ✅ all | all | `{domain}-{seq:4}` |
| `status` | ✅ all | all | `done\|in_progress\|hold` |
| `topic` | ✅ all | all | 작업 제목 (Korean) |
| `period` | ✅ all | all | `YYYY-MM` |
| `tags` | ✅ all | all | 기술/도메인 태그 |
| `size` | ✅ all | all | `major\|medium\|minor` |
| `resumeProject` | ✅ all | all | 이력서 프로젝트 매핑 or null |
| `problem` | major/medium | | 해결한 문제 |
| `rootCause` | optional | major | 근본 원인 |
| `approach` | major | | 접근 방식 |
| `implementation` | major | | 구현 상세 (string array) |
| `outcome` | ✅ all | all | 결과/성과 |

### Sensitive Info Rules
Work data MUST NOT contain: internal URLs, ticket keys, account IDs,
colleague real names, internal code paths. Domain-level technical
descriptions are OK.

### Resume Curation Flow
1. Read work data from `~/.work-data/{company}/`
2. Filter by `resumeProject` or relevant items
3. Synthesize into resume project narratives
4. Update `src/content/resume/{ko,en}.json`
