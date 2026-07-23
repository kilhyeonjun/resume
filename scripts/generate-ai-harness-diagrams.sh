#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MMDC="$ROOT/node_modules/.bin/mmdc"

[[ -x "$MMDC" ]] || { echo "run npm ci first" >&2; exit 1; }
[[ "$($MMDC --version)" == "11.16.0" ]] || { echo "@mermaid-js/mermaid-cli 11.16.0 is required" >&2; exit 1; }

for lang in ko en; do
  for diagram in boundary sequence; do
    "$MMDC" \
      --input "$ROOT/docs/diagrams/ai-harness/${diagram}-${lang}.mmd" \
      --output "$ROOT/public/images/portfolio/ai-coding-harness-${diagram}-${lang}.svg" \
      --configFile "$ROOT/scripts/mermaid-config.json" \
      --puppeteerConfigFile "$ROOT/scripts/mermaid-puppeteer-config.json" \
      --backgroundColor transparent \
      --quiet
  done
done

node "$ROOT/scripts/diagram-source-contract.mjs" stamp
