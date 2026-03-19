# Experience Detail AI Native Check

Date: 2026-03-19

## Reviewed Inputs

- Template: `src/components/templates/ExperienceDetailTemplate.astro`
- Data: `src/content/resume/ko.json` `experience[0]` (slug: `gameduo`)

## What the detail page renders

- Company header and `experience.description` (template line with `{experience.description}`)
- Experience-level `highlights`
- Project blocks (`name`, `period`, `description`, `details`, `techStack`)
- Activities and tech stack

## AI Native positioning check

### Current status

- Main positioning is already reflected in GameDuo `description`:
  - `2024년 말부터 AI 에이전트 기반 개발로 전환...`
- Detail template directly renders that description in the top header area, so detail pages inherit the AI Native message automatically.

### Gap assessment (beyond description)

- **No critical gap**: the AI Native message is visible without additional template/data changes.
- **Optional strengthening only** (not required): if stronger AI Native emphasis is needed in detail pages, one experience-level highlight could mention agent orchestration/verification workflow impact explicitly.

## Conclusion

- Additional AI Native repositioning updates for experience detail pages are **not required right now** beyond the already-updated GameDuo description.
- Keep current content as-is unless you want stronger AI-specific narrative density at highlight/project-detail level.
