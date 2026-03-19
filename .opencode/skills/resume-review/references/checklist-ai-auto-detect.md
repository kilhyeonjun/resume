# AI 자동 탐지 체크리스트

이력서 콘텐츠가 AI가 작성한 것처럼 보이는지 자동으로 탐지한다.
기존 checklist-ai-detection.md가 수동 판단 기준이라면, 이 체크리스트는 자동 스크립트로 실행 가능한 정량 기준을 제공한다.

## A1. 문장 길이 분산 (Burstiness)

사람이 쓴 글은 문장 길이가 들쭉날쭉하다. AI가 쓴 글은 균일하다.

검증 방법:
```bash
node -e "
const ko = JSON.parse(require('fs').readFileSync('src/content/resume/ko.json','utf8')).main;
const bullets = ko.experience.flatMap(e => [...e.highlights, ...e.projects.flatMap(p => p.details)]);
const lengths = bullets.map(b => b.length);
const avg = lengths.reduce((a,b) => a+b, 0) / lengths.length;
const variance = lengths.reduce((s,l) => s + Math.pow(l-avg,2), 0) / lengths.length;
const stddev = Math.sqrt(variance);
const cv = stddev / avg;
console.log('avg:', Math.round(avg), 'stddev:', Math.round(stddev), 'CV:', cv.toFixed(2));
console.log(cv > 0.3 ? 'PASS: 문장 길이 다양함 (사람스러움)' : 'WARN: 문장 길이 균일함 (AI 의심)');
"
```

PASS: CV(변동계수) > 0.3
WARN: CV ≤ 0.3

## A2. AI 슬롭 자동 스캔 (확장판)

검증 방법:
```bash
node -e "
const fs = require('fs');
const ko = JSON.stringify(JSON.parse(fs.readFileSync('src/content/resume/ko.json','utf8')));
const en = JSON.stringify(JSON.parse(fs.readFileSync('src/content/resume/en.json','utf8')));
const koSlop = ['혁신적','획기적','를 통해','함으로써','뿐만 아니라','나아가','더불어','최첨단','선도적'];
const enSlop = ['leveraging','comprehensive','robust','streamline','cutting-edge','utilize','foster','delve','seamless','groundbreaking','transformative','synergy','innovative','proactive'];
// 'dynamic'은 제외 — 'dynamic game data' 같은 기술 맥락에서 정상 사용. 'dynamic team player' 같은 버즈워드와 구분 필요.
const found = [];
koSlop.forEach(w => { if (ko.includes(w)) found.push('KO: ' + w); });
enSlop.forEach(w => { if (en.toLowerCase().includes(w)) found.push('EN: ' + w); });
console.log(found.length === 0 ? 'PASS: AI 슬롭 0건' : found.join('\n'));
"
```

PASS: 0건
FAIL: 1건 이상 탐지

## A3. 정량 성과 비율

검증 방법:
```bash
node -e "
const ko = JSON.parse(require('fs').readFileSync('src/content/resume/ko.json','utf8')).main;
const hl = ko.experience.flatMap(e => e.highlights);
const withNum = hl.filter(h => /\d+%|\d+배|\d+x|\d+건|\d+개|\d+초|\d+시간|\d+분|\$|₩/.test(h));
const ratio = withNum.length / hl.length;
console.log('정량 성과 비율:', Math.round(ratio*100) + '% (' + withNum.length + '/' + hl.length + ')');
console.log(ratio >= 0.5 ? 'PASS: 50% 이상' : 'WARN: 50% 미만');
"
```

PASS: highlights 중 50% 이상에 수치 포함
WARN: 50% 미만

## A4. 문장 시작 패턴 다양성

같은 구조로 시작하는 문장이 반복되면 AI 느낌이 강해진다.

검증 방법: highlights + details의 첫 2어절을 추출하여 중복률 체크.
PASS: 중복 시작 패턴 20% 미만
WARN: 20% 이상

## 종합 판정

| 체크 | 기준 | 결과 |
|------|------|------|
| A1 문장 분산 | CV > 0.3 | PASS/WARN |
| A2 슬롭 | 0건 | PASS/FAIL |
| A3 정량 비율 | ≥ 50% | PASS/WARN |
| A4 시작 다양성 | 중복 < 20% | PASS/WARN |

WARN 2개 이상이면 "AI 작성 의심 - 문체 다양화 필요" 판정.
