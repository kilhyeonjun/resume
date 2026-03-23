#!/bin/sh
# Resume project pre-commit hook
# Validates build (Zod schema) and ko/en highlight sync before commit

set -e

echo "🔍 Pre-commit: Build check..."
npm run build --silent 2>&1 | tail -1 | grep -q "Complete!" || {
  echo "❌ Build failed — fix Zod schema errors before committing"
  exit 1
}
echo "✅ Build PASS"

echo "🔍 Pre-commit: ko/en sync check..."
node -e "
const ko = require('./src/content/resume/ko.json');
const en = require('./src/content/resume/en.json');
const koH = ko.main.experience.reduce((s,e) => s + e.highlights.length, 0);
const enH = en.main.experience.reduce((s,e) => s + e.highlights.length, 0);
if (koH !== enH) {
  console.log('❌ ko/en highlight count mismatch: ko=' + koH + ' en=' + enH);
  process.exit(1);
}
const koP = ko.main.experience.reduce((s,e) => s + e.projects.length, 0);
const enP = en.main.experience.reduce((s,e) => s + e.projects.length, 0);
if (koP !== enP) {
  console.log('❌ ko/en project count mismatch: ko=' + koP + ' en=' + enP);
  process.exit(1);
}
console.log('✅ ko/en sync OK (highlights: ' + koH + ', projects: ' + koP + ')');
"

# PDF staleness check (warning only — does not block commit)
PDF_AFFECTING=$(git diff --cached --name-only | grep -E '(content/resume/.*\.json|templates/.*\.astro|utils/resume-data\.ts)' || true)
if [ -n "$PDF_AFFECTING" ]; then
  PDF_EXISTS=true
  for pdf in dist/pdf/resume-hr-ko.pdf dist/pdf/resume-ats-ko.pdf dist/pdf/resume-hr-en.pdf dist/pdf/resume-ats-en.pdf; do
    if [ ! -f "$pdf" ]; then
      PDF_EXISTS=false
      break
    fi
  done
  if [ "$PDF_EXISTS" = false ]; then
    echo "⚠️  PDF files missing — run 'npm run dev & npm run pdf' before push"
  else
    # Check if any staged file is newer than the oldest PDF
    OLDEST_PDF=$(ls -t dist/pdf/*.pdf 2>/dev/null | tail -1)
    if [ -n "$OLDEST_PDF" ]; then
      for f in $PDF_AFFECTING; do
        if [ "$f" -nt "$OLDEST_PDF" ] 2>/dev/null; then
          echo "⚠️  PDF may be stale (content changed) — run 'npm run dev & npm run pdf' to regenerate"
          break
        fi
      done
    fi
  fi
fi

echo "✅ All pre-commit checks passed"
