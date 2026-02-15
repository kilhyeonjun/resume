# Work-Data 재수집 리포트

> 작성일: 2026-02-14
> 대상: `~/.work-data/gameduo/`
> 목적: 이력서 동기화 전 work-data 정확도 검증

---

## 1. resumeProject 매핑 오류

### 1-1. `server-kit` 프로젝트 미분류

`glider-server-kit`은 `nest-util`과 별개 레포. glider-server에서 게임서버 로직과 시트 로직이 혼재되어 있었고, 게임서버 공통 로직을 패키지화하는 별도 레포(server-kit)를 만든 것.

**현재 문제:**
- `server-kit` resumeProject 값이 아예 존재하지 않음
- 관련 항목들이 `null`, `audit-log`, `nest-util` 등으로 잘못 매핑됨

**해당 항목:**

| ID | 현재 resumeProject | 올바른 값 | topic |
|----|-------------------|----------|-------|
| `sheet-0037` | `null` | `server-kit` | [GLIDER] sheet 모듈 패키지로 분리 |
| `sheet-0050` | `audit-log` | `server-kit` | [GLIDER] Sheet 모듈 추가분리 (56h 대규모 작업, 5개 게임 브랜치 적용) |

**요청:** 
- `server-kit` resumeProject 신규 추가
- 위 항목 + 관련 항목 재분류

---

### 1-2. `nest-util` vs `server-kit` 구분 기준

| 구분 | nest-util | server-kit |
|------|-----------|------------|
| 레포 | glider-nest-util | glider-server-kit |
| 성격 | 사내 공통 유틸 라이브러리 (범용) | 게임서버 공통 로직 패키지화 |
| 모듈 | Repository, Slack, Crypto, Lock, Cache, SMB | Sheet, 게임서버 로직 |
| 배경 | 프로젝트 간 공통 로직 중복 제거 | glider-server에서 게임/시트 로직 분리 |

---

### 1-3. `kit-0034` 매핑 재확인 필요

| ID | 현재 resumeProject | topic |
|----|-------------------|-------|
| `kit-0034` | `nest-util` | [glider-sheet] LMK 알림 Block Kit Bulk 전송 |

→ `[glider-sheet]` 접두사인데 `nest-util`로 매핑됨. LMK 관련이면 `lmk-notification` 또는 `server-kit` 중 어디에 속하는지 확인 필요.

---

## 2. description/outcome 부실 항목

아래 항목들은 `outcome`이 자동 생성된 템플릿 문구(`~작업을 done 상태로 수집했습니다`)로 되어있어 실질적 성과 내용이 없음:

| ID | size | topic |
|----|------|-------|
| `sheet-0037` | medium | sheet 모듈 패키지로 분리 |
| `sheet-0050` | major | Sheet 모듈 추가분리 (56h) |

→ 재수집 시 실제 outcome (성과/결과) 보강 필요

---

## 3. resumeProject 미지정 medium/major 항목 (재분류 필요)

아래 항목들은 `resumeProject: null`인데 medium/major 크기라 이력서 반영 가능성 있음. 재수집 시 적절한 resumeProject 매핑 필요:

| ID | size | period | topic | 제안 |
|----|------|--------|-------|------|
| `sheet-0004` | medium | 2025-01 | Sheet 미사용 API 및 코드 제거 | 기술부채 정리 (별도 or null 유지) |
| `sheet-0005` | major | 2025-01 | Sheet 이전 TypeORM Repository 제거 | `audit-log` (Audit 전제 작업) |
| `sheet-0014` | medium | 2025-02 | cloud data 제약조건 추가 | sheet-operations? |
| `sheet-0015` | medium | 2025-02 | google sheet 기능 확장 | sheet-operations? |
| `sheet-0017` | medium | 2025-03 | 언어 삭제 시 word row 삭제 안됨 | sheet-operations? |
| `sheet-0033` | medium | 2025-10 | LMK upsert API v2 | `lmk-notification` |
| `sheet-0038` | medium | 2025-11 | Sheet 클라우드 데이터 동기화 job 분리 | sheet-operations? |
| `sheet-0042` | medium | 2025-12 | Cloud Data 저장 속도 개선 | sheet-performance? |
| `sheet-0043` | medium | 2025-12 | Sheet 조회 성능 개선 | sheet-performance? |
| `sheet-0049` | medium | 2025-12 | cloud-data s3 동기화 스케줄링 변경 | sheet-operations? |

---

## 4. _meta.json 도메인 업데이트 제안

현재 도메인에 `server-kit` 관련 도메인이 없음. 필요 시:

```json
{ "id": "glider-server-kit", "description": "게임서버 공통 로직 패키지화 (Sheet 모듈 분리)" }
```

또는 기존 `glider-kit` 도메인에 포함시키되, resumeProject로 `nest-util` vs `server-kit` 구분.

---

## 5. 요약

| 항목 | 개수 |
|------|------|
| resumeProject 매핑 오류 | 2~3건 |
| outcome 부실 (major/medium) | 2건 |
| resumeProject 미지정 (medium+) | 10건 |
| 신규 resumeProject 필요 | `server-kit` |

**우선순위:**
1. `server-kit` resumeProject 신규 추가 + 관련 항목 재매핑
2. 미지정 medium/major 항목 resumeProject 분류
3. outcome 부실 항목 보강
