#!/usr/bin/env python3
"""Public resume curation guard.

Checks that work-data curation did not leak internal evidence IDs or known
forbidden patterns into public resume/portfolio JSON.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_FILES = [
    ROOT / 'src/content/resume/ko.json',
    ROOT / 'src/content/resume/en.json',
    ROOT / 'src/data/portfolio.json',
]

FORBIDDEN_PAREN = re.compile(r'\([A-Z]{2,5}\s+\d+(배|x|%|％)\)')
WORKDATA_ID = re.compile(r'\b(?:sheet|mkt|kit|misc|hns|sp|docs|bill|mail)-\d{2,4}\b')
INTERNAL_KEYS = re.compile(r'\b(?:DTP|DEV)-\d{2,5}\b')
AI_SLOP_KO = re.compile(r'혁신적인|획기적인|효율적인|성공적으로')
TWELVE_LIVE_KO = re.compile(r'12개\s*라이브')
TWELVE_LIVE_EN = re.compile(r'12\s+live\s+games', re.IGNORECASE)


def load_json(path: Path) -> Any:
    with path.open(encoding='utf-8') as f:
        return json.load(f)


def public_copy_text(value: Any, key_path: tuple[str, ...] = ()) -> str:
    """Return public prose only; skip URLs and machine identifiers.

    Review URLs can legitimately contain Korean URL slugs such as '성공적으로',
    but those are not resume copy and should not fail the style gate.
    """
    if isinstance(value, dict):
        parts: list[str] = []
        for key, child in value.items():
            key_l = key.lower()
            if key_l.endswith('url') or key_l in {'github', 'live'}:
                continue
            parts.append(public_copy_text(child, key_path + (key,)))
        return '\n'.join(parts)
    if isinstance(value, list):
        return '\n'.join(public_copy_text(child, key_path) for child in value)
    if isinstance(value, str):
        if value.startswith(('http://', 'https://', 'mailto:')):
            return ''
        return value
    return ''


def scan(path: Path) -> list[str]:
    data = load_json(path)
    text = public_copy_text(data)
    failures: list[str] = []

    checks = [
        ('cryptic parenthetical', FORBIDDEN_PAREN),
        ('work-data ID leak', WORKDATA_ID),
        ('internal ticket key leak', INTERNAL_KEYS),
        ('Korean AI-slop wording', AI_SLOP_KO),
        ('12 live-games regression (KO)', TWELVE_LIVE_KO),
        ('12 live-games regression (EN)', TWELVE_LIVE_EN),
    ]
    for label, pattern in checks:
        hits = sorted(set(m.group(0) for m in pattern.finditer(text)))
        if hits:
            failures.append(f'{path.relative_to(ROOT)}: {label}: {hits[:10]}')

    return failures


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--forbidden-only', action='store_true', help='compatibility flag; currently all checks are forbidden/public-copy checks')
    parser.add_argument('files', nargs='*', type=Path)
    args = parser.parse_args()

    files = args.files or DEFAULT_FILES
    all_failures: list[str] = []
    for path in files:
        if not path.is_absolute():
            path = ROOT / path
        if not path.exists():
            all_failures.append(f'{path}: file not found')
            continue
        all_failures.extend(scan(path))

    if all_failures:
        print('CURATION GUARD FAIL')
        for failure in all_failures:
            print(f'- {failure}')
        return 1

    print('CURATION GUARD PASS')
    return 0


if __name__ == '__main__':
    sys.exit(main())
