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

echo "✅ All pre-commit checks passed"
