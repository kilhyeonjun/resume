# HR 리크루터 시뮬레이션 체크리스트

리크루터가 7.4초간 이력서를 스캔할 때 핵심 정보가 전달되는지 자동 검증한다.

## H1. 상단 1/3 핵심 정보 (7.4초 스캔)

이름, 타이틀, 연락처가 ko.json personalInfo에 모두 존재하는지 확인.
summary가 3~4문장 이내인지 확인.

PASS: personalInfo 완전 + summary ≤ 4문장
WARN: 누락 필드 있거나 summary 과밀

## H2. 핵심 키워드 매칭

포지션 키워드(AI Native Engineer, TypeScript, AWS, NestJS 등)가 summary + coreCompetencies + skills에 존재하는지 확인.

검증:
```bash
node -e "
const ko = JSON.parse(require('fs').readFileSync('src/content/resume/ko.json','utf8')).main;
const text = ko.summary + JSON.stringify(ko.coreCompetencies) + JSON.stringify(ko.skills);
const keywords = ['AI Native','TypeScript','NestJS','AWS','Lambda','EDA','서버리스','BigQuery'];
const found = keywords.filter(k => text.includes(k));
console.log('키워드 매칭:', found.length + '/' + keywords.length);
console.log(found.length >= 6 ? 'PASS' : 'WARN: 키워드 부족');
"
```

PASS: 8개 중 6개 이상 매칭
WARN: 6개 미만

## H3. 정량 성과 가시성

experience[0] (최근 회사)의 highlights에서 수치 포함 비율 확인.
최근 회사의 성과가 가장 먼저 눈에 띄어야 한다.

PASS: 최근 회사 highlights 75% 이상 수치 포함
WARN: 75% 미만

## H4. 기술 스택 명시성

skills 섹션의 총 항목 수와 카테고리 수 확인.

PASS: 4개 카테고리, 15개 이상 기술 항목
WARN: 미달

## H5. 경력 연속성

experience의 날짜 간 공백 확인. 6개월 이상 공백이면 경고.

PASS: 공백 없거나 교육/활동으로 커버됨
WARN: 설명 없는 6개월+ 공백

## 종합 결과

| 체크 | 기준 | 결과 |
|------|------|------|
| H1 상단 정보 | 완전 + ≤4문장 | PASS/WARN |
| H2 키워드 | ≥6/8 | PASS/WARN |
| H3 정량 가시성 | ≥75% 수치 | PASS/WARN |
| H4 기술 스택 | ≥4cat, ≥15items | PASS/WARN |
| H5 경력 연속성 | 공백 없음 | PASS/WARN |
