# ATS PDF QA

Date: 2026-03-19

## Execution

- Dev server check on `:4321`: initially not running (`ERR_CONNECTION_REFUSED` on first `npm run pdf:ats`)
- Started dev server and re-ran `npm run pdf:ats`
- Generated files:
  - `dist/pdf/resume-ats-ko.pdf`
  - `dist/pdf/resume-ats-en.pdf`

## QA Checklist

| Check | KO PDF | EN PDF | Evidence |
|---|---|---|---|
| Title shows `AI Native Engineer` | PASS | PASS | Parsed page-1 text includes `AI Native Engineer` immediately under name |
| Plain-text oriented content (ATS-friendly) | PASS | PASS | Extracted text is linear section text/bullets with no table-like/graphic-dependent structure in content flow |
| All major sections present and readable | PASS | PASS | KO: `소개/핵심 역량/경력/기술 스택/학력/자격증/수상/기술 공유/오픈소스/학습 활동`; EN: `PROFESSIONAL SUMMARY/CORE COMPETENCIES/EXPERIENCE/TECHNICAL SKILLS/EDUCATION/CERTIFICATIONS/AWARDS/PRESENTATIONS & WRITING/OPEN SOURCE/PROFESSIONAL DEVELOPMENT` |

## Notes

- KO PDF: 4 pages parsed successfully.
- EN PDF: 5 pages parsed successfully.
- Readability is good for ATS parsing (clear headings, sentence-based content, stable keyword retention).
