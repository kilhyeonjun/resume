# Resume Site 코드 리뷰 보고서

> 리뷰 일시: 2026-01-30
> 프로젝트: Astro + Tailwind CSS 기반 이력서 사이트

---

## 1. 프로젝트 개요

### 기술 스택
| 영역 | 기술 |
|------|------|
| Framework | Astro 5.17.1 |
| Styling | Tailwind CSS 4.1.18 |
| Type System | TypeScript (strict) |
| PDF Generation | Puppeteer 24.10.0 |
| Content | Astro Content Collections (JSON) |

### 프로젝트 구조
```
src/
├── components/         # 재사용 컴포넌트 (1개)
├── content/           # 이력서 데이터 (JSON)
├── layouts/           # 레이아웃 (1개)
├── pages/             # 페이지 (10개)
└── styles/            # 글로벌 스타일
scripts/
└── generate-pdf.ts    # PDF 생성 스크립트
```

---

## 2. 긍정적인 부분

### 2.1 잘 설계된 Content Schema
```typescript
// content.config.ts - Zod 기반 강력한 타입 검증
const experienceSchema = z.object({
  slug: z.string(),
  company: z.string(),
  companyUrl: z.string().url().optional(),
  // ...
});
```
- Zod를 활용한 런타임 타입 검증
- Optional 필드의 명확한 정의
- 재사용 가능한 스키마 구조

### 2.2 다양한 출력 포맷 지원
- 웹 버전 (한국어/영어)
- HR용 PDF (디자인 유지)
- ATS용 PDF (단순 텍스트)
- 동적 경험 상세 페이지

### 2.3 다크모드 구현
```typescript
// ThemeToggle.astro - 시스템 테마 감지 + LocalStorage 저장
function getTheme(): 'light' | 'dark' {
  if (localStorage.getItem('theme')) return localStorage.getItem('theme');
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}
```

### 2.4 PDF 생성 스크립트
- 유연한 CLI 옵션 (`--hr`, `--ats`, `--ko`, `--en`)
- 타입 안전한 구현
- 명확한 에러 핸들링

---

## 3. 개선이 필요한 부분

### 3.1 심각한 코드 중복 (Critical)

**현재 상태**: 한국어/영어 페이지가 99% 동일한 코드를 복제

| 파일 쌍 | 중복 라인 |
|---------|-----------|
| `resume.astro` ↔ `en/resume.astro` | ~427 lines |
| `resume-print.astro` ↔ `en/resume-print.astro` | ~534 lines |
| `resume-ats.astro` ↔ `en/resume-ats.astro` | ~316 lines |
| `[slug].astro` ↔ `en/[slug].astro` | ~216 lines |
| **총 중복** | **~1,500+ lines** |

**문제점**:
- 유지보수 시 양쪽 파일 모두 수정 필요
- 버그 수정 시 누락 가능성 높음
- 코드 일관성 유지 어려움

**해결 방안**:
```astro
// 권장: 공유 컴포넌트 + 동적 라우팅
// src/pages/[lang]/resume.astro
---
export function getStaticPaths() {
  return [{ params: { lang: 'ko' } }, { params: { lang: 'en' } }];
}
const { lang } = Astro.params;
const entry = await getEntry(`resume-${lang}`, 'main');
---
<ResumeTemplate data={entry.data} lang={lang} />
```

### 3.2 index.astro 버그 (Critical)

**현재 코드**:
```astro
const resumeData = await getCollection('resume');
const data = resumeData[0]?.data;
// ...
{data?.name ?? '환영합니다'}  // BUG: name은 personalInfo 안에 있음
{data?.title ?? '소프트웨어 엔지니어'}
{data?.summary && (...)}
```

**문제점**: 
- 스키마에 따르면 `data.personalInfo.name`이어야 함
- `getCollection('resume')`는 존재하지 않음 (resume-ko, resume-en만 존재)

**수정 필요**:
```astro
const entry = await getEntry('resume-ko', 'main');
const data = entry?.data;
// ...
{data?.personalInfo.name ?? '환영합니다'}
```

### 3.3 HTML lang 속성 불일치 (Medium)

**현재 코드** (`Layout.astro`):
```html
<html lang="ko">  <!-- 모든 페이지에서 ko 고정 -->
```

**문제점**: 영어 페이지도 `lang="ko"`로 설정됨 (접근성, SEO 문제)

**해결 방안**:
```astro
// Layout.astro
interface Props {
  title: string;
  lang?: 'ko' | 'en';
}
const { title, lang = 'ko' } = Astro.props;
// ...
<html lang={lang}>
```

### 3.4 Non-null Assertion 남용 (Medium)

**현재 패턴**:
```typescript
const entry = await getEntry('resume-ko', 'main');
const resumeData = entry!.data;  // 위험: entry가 undefined일 수 있음
```

**해결 방안**:
```typescript
const entry = await getEntry('resume-ko', 'main');
if (!entry) {
  throw new Error('Resume data not found');
}
const resumeData = entry.data;
```

### 3.5 사용되지 않는 코드 (Low)

| 파일/코드 | 상태 |
|-----------|------|
| `src/content/resume/data.yaml` | 미사용 (삭제 권장) |
| `.skill-badge` CSS 클래스 | 정의됨, 미사용 |
| `resume.astro`의 projects 섹션 | 데이터에 projects 없음 (조건부 렌더링으로 문제없지만 확인 필요) |

### 3.6 SVG 아이콘 중복 (Low)

동일한 SVG 아이콘이 여러 파일에 인라인으로 복제됨:
- Email 아이콘: 6회 반복
- GitHub 아이콘: 4회 반복  
- LinkedIn 아이콘: 4회 반복
- Check 아이콘: 8회 반복

**해결 방안**: 아이콘 컴포넌트 생성
```astro
// src/components/icons/EmailIcon.astro
<svg class={Astro.props.class} ...>
  <path ... />
</svg>
```

### 3.7 스타일 중복 (Low)

`.section-title` 스타일이 여러 파일에 반복 정의됨:
- `resume.astro` (351-373줄)
- `en/resume.astro` (351-373줄)
- `[slug].astro` (192-214줄)
- `en/[slug].astro` (192-214줄)

**해결 방안**: `global.css`로 통합

---

## 4. 아키텍처 개선 제안

### 4.1 컴포넌트 추출 권장

```
src/components/
├── icons/                    # SVG 아이콘
│   ├── EmailIcon.astro
│   ├── GitHubIcon.astro
│   └── ...
├── resume/                   # 이력서 관련 컴포넌트
│   ├── Header.astro          # 헤더 + 연락처
│   ├── ExperienceCard.astro  # 경력 카드
│   ├── SkillSection.astro    # 기술 스택
│   ├── EducationItem.astro   # 학력 항목
│   └── SectionTitle.astro    # 섹션 제목
├── LanguageSwitcher.astro    # 언어 전환
└── ThemeToggle.astro         # 다크모드 토글
```

### 4.2 i18n 시스템 도입

Astro 5.x의 i18n 기능 활용:
```javascript
// astro.config.mjs
export default defineConfig({
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

### 4.3 페이지 구조 단순화

```
src/pages/
├── index.astro
├── [...lang]/
│   ├── resume/
│   │   ├── index.astro       # 이력서 메인
│   │   ├── print.astro       # HR용 PDF
│   │   ├── ats.astro         # ATS용 PDF
│   │   └── experience/
│   │       └── [slug].astro  # 경력 상세
```

---

## 5. 타입스크립트 LSP 오류 (신규 발견)

LSP 진단을 통해 발견된 타입 오류들:

### 5.1 스키마에 누락된 필드 (content.config.ts)

**현재 `personalInfoSchema`**:
```typescript
const personalInfoSchema = z.object({
  name: z.string(),
  title: z.string(),
  email: z.string().email(),
  location: z.string().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  blog: z.string().url().optional(),
  // phone 없음!
  // website 없음!
});
```

**실제 JSON 데이터**: `phone`, `website` 필드 존재 가능

**수정 필요**:
```typescript
const personalInfoSchema = z.object({
  // ...기존 필드
  phone: z.string().optional(),
  website: z.string().url().optional(),
});
```

### 5.2 resumeSchema에 projects 누락

**현재 상태**: 페이지에서 `data.projects` 참조하지만 스키마에 정의 안 됨

**영향 받는 파일**:
- `resume.astro` (라인 222, 226, 248)
- `en/resume.astro` (라인 222, 226, 248)
- `resume-print.astro` (라인 511, 515, 521)
- `en/resume-print.astro` (라인 511, 515, 521)
- `resume-ats.astro` (라인 274, 277)

**수정 필요** (`content.config.ts`):
```typescript
const projectSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  description: z.string(),
  technologies: z.array(z.string()).optional(),
});

const resumeSchema = z.object({
  // ...기존 필드
  projects: z.array(projectSchema).optional(),  // 추가
});
```

### 5.3 Implicit Any 타입

```typescript
// resume.astro 라인 226
{data.projects.map((project) => (  // project: any
  // ...
  {project.technologies.map((tech) => (  // tech: any
```

**수정**: 스키마 수정 후 자동 해결됨

---

## 6. 잠재적 버그

### 6.1 경험 상세 페이지 jnpmedi 누락

**현재 상태**: 한국어 `ko.json`에서 `jnpmedi` 경험이 있지만:
- `/resume/experience/jnpmedi` 경로가 없음
- 영어 버전만 `/en/resume/experience/jnpmedi` 존재

**영향**: 한국어 이력서에서 제이앤피메디 "상세 보기" 링크가 404 발생 가능

### 6.2 Print 페이지 백링크

`resume-print.astro`와 `resume-ats.astro`의 백링크:
```astro
<a href={`${import.meta.env.BASE_URL}/resume`}>
```

영어 버전에서는 `/en/resume`으로 돌아가야 하지만 실제로는 정확히 구현되어 있음. 

---

## 7. 성능 고려사항

### 7.1 폰트 로딩

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700..." rel="stylesheet">
```

**개선**: `font-display: swap` 추가 또는 셀프 호스팅 고려

### 7.2 CSS 번들

Print 페이지들이 Tailwind 대신 인라인 CSS 사용 - 이는 PDF 생성을 위한 의도적 선택으로 보임. 

---

## 8. 보안 고려사항

### 8.1 외부 링크

모든 외부 링크에 `rel="noopener noreferrer"` 적용됨. 

### 8.2 XSS 방지

Astro의 기본 이스케이프 기능 활용. 

---

## 9. 우선순위별 액션 아이템

### Critical (즉시 수정)
- [ ] `index.astro` 데이터 접근 버그 수정
- [ ] HTML `lang` 속성 동적 설정
- [ ] `content.config.ts` 스키마에 `phone`, `website`, `projects` 필드 추가

### High (1주 내)
- [ ] 공유 컴포넌트 추출로 코드 중복 제거
- [ ] i18n 라우팅 시스템 도입

### Medium (2주 내)
- [ ] Non-null assertion 제거 및 에러 핸들링 추가
- [ ] SVG 아이콘 컴포넌트화
- [ ] 스타일 통합

### Low (개선 사항)
- [ ] 사용하지 않는 파일/코드 정리
- [ ] 테스트 코드 추가
- [ ] 접근성(a11y) 감사

---

## 10. 결론

### 강점
- 잘 구조화된 Content Collection 스키마
- 다양한 출력 포맷 지원 (웹, HR PDF, ATS PDF)
- 깔끔한 UI/UX 디자인
- 타입 안전한 PDF 생성 스크립트

### 개선 필요
- **코드 중복이 가장 큰 문제** (~1,500줄)
- i18n 시스템 부재로 인한 유지보수 어려움
- 일부 버그 및 타입 안전성 문제

### 전체 평가
현재 상태로도 잘 동작하는 프로젝트이나, **확장성과 유지보수성 측면에서 컴포넌트 추출 및 i18n 시스템 도입이 강력히 권장됨**.
