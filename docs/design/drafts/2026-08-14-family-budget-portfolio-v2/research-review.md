# Family Budget portfolio v2 — hiring review and comparative audit

## Decision

The case study must read as **Family Budget, the product**, before it reads as a data-model or reconciliation design. The opening evidence is therefore implemented product UI with synthetic data; architecture and failure semantics remain technical depth, not the hero.

## Hiring lenses

### Recruiter / HR scan
A fast scan must answer, in order:
1. What is it? — a shared household budget for a couple.
2. Who used it and why? — quick daily entry for a non-developer household member, shared monthly review.
3. What did the candidate own? — product, backend, model, automation, responsive UX.
4. Is it real? — implemented UI screenshots and a live synthetic demo.
5. Is it safe to view? — synthetic data, no operational finance values.

### Engineering-manager scan
After the product is understood, the case must show:
1. Why plan, monthly occurrence, and actual ledger event are distinct facts.
2. Why existing-actual-first linking prevents duplicate financial events.
3. Why confirmation, read-back, partial-success reporting, and reopen are required.
4. Which evidence is operational/private and which evidence is public/synthetic.
5. What trade-offs were accepted rather than presenting a feature inventory.

## Portfolio comparison

Representative public cases already used recognizable evidence early:
- Daesin Logistics: a synthetic user journey before operational diagrams.
- Innovalley, Concert Reservation, Slack Clone, Nodebird: cover or content images identify the product immediately.
- AI Coding Harness and infrastructure-heavy cases can lead with diagrams because their product surface is the runtime itself.

Family Budget is a user-facing product, so a diagram-only opening was inconsistent with the rest of the portfolio and obscured the subject.

## Evidence order adopted

1. Product title and one-sentence household outcome.
2. Implemented dashboard hero with synthetic disclosure.
3. Product journey: dashboard decision, desktop quick entry, mobile quick entry, pre-posting recurring confirmation.
4. Core design register.
5. Architecture boundary and reconciliation flow.
6. Problem → decision → result, limits, and public evidence.

## Source-backed principles

- Nielsen Norman Group, “5 Steps to Creating a UX-Design Portfolio”: hiring managers need the real challenge, constraints, candidate solutions, and thought process rather than idealized output alone. https://www.nngroup.com/articles/ux-design-portfolios/
- Nielsen Norman Group, “How to Maintain a UX Portfolio Over Time”: outcomes should be stated only when evidence exists; preserve evidence instead of inventing impact. https://www.nngroup.com/articles/maintain-ux-portfolio/
- Google Technical Writing accessibility guidance: structured, descriptive headings let readers understand and navigate the document. https://developers.google.com/tech-writing/accessibility/self-study/editing-accessibility
- StaffEng, “What do Staff engineers actually do?” and “Manage technical quality”: technical leadership connects strategic value with design and balances quality against core product needs. https://staffeng.com/guides/what-do-staff-engineers-actually-do/ and https://staffeng.com/guides/manage-technical-quality/

## Public-safety decision

Production screenshots contain real-looking member names, household finance amounts, insurer/vendor labels, account labels, and dates. They are not published. Portfolio screenshots are captured from the public demo using the same canonical UI package and deterministic synthetic data. Captions explicitly distinguish implemented UI evidence from operational-backend evidence.

## Release gates

- Family Budget must have a product-identifying cover image and at least desktop + mobile product screens.
- The first image must not be an architecture diagram.
- Every product image must state synthetic/public evidence status.
- No real financial values, account names, family identifiers, URLs, credentials, or infrastructure identifiers.
- KO/EN title, summary, role, captions, product screens, diagrams, and print must preserve the same evidence boundary.
- Web and PDF must show product UI before technical diagrams.
- Test, Astro check, build, PDF text/page QA, responsive browser QA, privacy scan, independent review, remote CI, deployment, and live read-back must pass before completion.
