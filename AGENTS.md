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

## Gotchas

- **Base path**: Site is served under `/resume/` — use `import.meta.env.BASE_URL` for all internal links
- **No hot reload for JSON**: Content collection JSON changes may require dev server restart
- **PDF requires running dev server**: `npm run dev` must be running before `npm run pdf`
- **Print templates are standalone HTML**: `ResumePrintTemplate.astro` does NOT use `Layout.astro` — it has its own `<html>` with inline styles for PDF fidelity
- **Tailwind v4**: Uses new `@theme` and `@custom-variant` syntax, NOT `tailwind.config.js`
- **No linter/formatter**: Maintain consistency manually. Follow existing 2-space indent, single quotes, trailing commas in TS
