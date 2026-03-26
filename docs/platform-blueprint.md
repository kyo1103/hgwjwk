# 세무·노무 통합 플랫폼 청사진

## 목적

`세무노무_플랫폼_개발설계서.docx`의 요구사항과 현재 Next.js 워크스페이스를 함께 반영해, 실제 구현 우선순위와 화면 구조를 바로 판단할 수 있는 제품 청사진을 정리한다.

핵심 방향은 다음 네 가지다.

- 노무·세무 운영 콘솔, 고객 포털, 정부 포털 자동화 ERP를 별도 표면으로 분리한다.
- 멀티테넌트와 감사 추적을 제품 기본값으로 둔다.
- 홈택스·4대보험 자동화는 UI 안쪽이 아니라 큐와 워커 경계에서 처리한다.
- 문서, 계약, 급여자료 요청, 결과 리포트를 한 고객사 단위 기록으로 연결한다.

## 제품 표면

### 1. 운영 콘솔

- 대상: 노무사, 세무사, 실무 담당자
- 목적: 요청 접수, 태스크 생성, 고객사 운영, 보고, 로그 확인
- 현재 연결 경로:
  - [운영 허브](C:/Users/user/Desktop/노무세무ERP_허장/app/app/page.tsx)
  - [인박스](C:/Users/user/Desktop/노무세무ERP_허장/app/app/inbox/page.tsx)
  - [고객사 관리](C:/Users/user/Desktop/노무세무ERP_허장/app/app/tenants/page.tsx)
  - [로그](C:/Users/user/Desktop/노무세무ERP_허장/app/app/logs/page.tsx)

### 2. 고객 포털

- 대상: 고객사 HR, 대표, 열람 전용 사용자
- 목적: 요청 상태 확인, 파일 업로드, 계약 서명, 직원/휴가/이슈 조회
- 현재 연결 경로:
  - [포털 로그인](C:/Users/user/Desktop/노무세무ERP_허장/app/portal/login/page.tsx)
  - [포털 셸](C:/Users/user/Desktop/노무세무ERP_허장/components/PortalShell.tsx)

### 3. 자동화 ERP

- 대상: 자동화 운영 담당자, 관리 파트
- 목적: 홈택스·4대보험 수집 작업 실행, 실패 복구, 결과 문서 확인
- 현재 연결 경로:
  - [ERP 홈](C:/Users/user/Desktop/노무세무ERP_허장/app/erp/page.tsx)
  - [ERP 셸](C:/Users/user/Desktop/노무세무ERP_허장/components/ERPShell.tsx)
  - [잡 현황](C:/Users/user/Desktop/노무세무ERP_허장/app/erp/jobs/page.tsx)
  - [문서 결과함](C:/Users/user/Desktop/노무세무ERP_허장/app/erp/documents/page.tsx)

## 역할 설계

- `owner`: 사무소 대표 또는 운영 총괄. 요금제, 권한, 보안 정책 결정.
- `labor`, `labor_staff`: 노무 이슈, 근로계약, 휴가, 직원 이슈 중심 운영.
- `tax`, `tax_staff`: 세무 증빙, 급여자료 요청, 민원서류, 월간 보고 중심 운영.
- `client_hr`: 고객사 인사 담당. 자료 제출과 상태 확인 담당.
- `client_viewer`: 열람 전용 사용자. 보고서, 파일, 계약 결과 확인.

현재 역할 타입은 [lib/types.ts](C:/Users/user/Desktop/노무세무ERP_허장/lib/types.ts)에 이미 정의되어 있으므로, 추후 DB 스키마와 일치시키는 것이 우선이다.

## 도메인 경계

### 테넌트와 권한

- 기준 모델: `Firm`, `Tenant`, `Membership`, `User`
- 원칙: 모든 조회와 변경은 `firmId` 또는 `tenant_id`로 스코프를 강제한다.
- 구현 메모:
  - JWT에 소속 정보를 포함한다.
  - Prisma 또는 서버 저장소 계층에서 스코프 미들웨어를 건다.

### 자문 운영

- 기준 모델: `ServiceRequest`, `WorkTask`, `Comment`, `TemplateItem`, `MonthlyReport`
- 원칙: 요청 하나가 여러 태스크와 코멘트를 만들 수 있어야 한다.
- 현재 코드 근거:
  - [요청 타입과 태스크 타입](C:/Users/user/Desktop/노무세무ERP_허장/lib/types.ts)
  - [업무 자동 생성 로직](C:/Users/user/Desktop/노무세무ERP_허장/lib/workflow.ts)

### 인사와 계약

- 기준 모델: `Employee`, `Contract`, `ContractSigner`, `SigningToken`, `LeaveBalance`, `LaborIssue`
- 원칙: 고객 포털과 운영 콘솔이 같은 직원/계약 기록을 바라봐야 한다.

### 자동화 ERP

- 기준 모델: `Certificate`, `ERPClient`, `ERPJob`, `ERPDocument`, `InsuranceBill`, `AuditLog`
- 원칙: 자동화 요청, 실행, 결과 저장, 실패 사유가 모두 같은 추적선에 있어야 한다.
- 현재 코드 근거:
  - [ERP 타입](C:/Users/user/Desktop/노무세무ERP_허장/lib/erp-types.ts)
  - [목업 데이터](C:/Users/user/Desktop/노무세무ERP_허장/lib/erp-data.ts)
  - [서버 상태 저장소](C:/Users/user/Desktop/노무세무ERP_허장/lib/server/erp-store.ts)

## 목표 아키텍처

### 프런트엔드

- Next.js App Router 유지
- 표면별 라우트 분리:
  - `/` 제품 개요와 진입점
  - `/app/*` 내부 운영
  - `/portal/*` 고객 포털
  - `/erp/*` 자동화 운영
  - `/sign/*` 전자서명

### 애플리케이션 계층

- 현재는 App Router API와 로컬 저장소 기반으로 빠르게 움직인다.
- 목표는 다음 두 경계로 정리하는 것이다.
  - 동기 API: 인증, CRUD, 화면 조회
  - 비동기 워커: 홈택스, 4대보험, 카카오 알림톡, PDF 생성

### 실행 계층

- `BullMQ + Redis`를 자동화와 알림의 공용 큐로 사용
- `Playwright` 워커를 정부 포털 전용 실행 경계로 분리
- 파일 결과는 `S3/MinIO`에 저장하고 DB에는 메타데이터만 남긴다.

### 데이터 계층

- `PostgreSQL + Prisma`
- 멀티테넌트 스코프를 강제하는 저장소 계층 필요
- JSON 필드는 급여자료나 보험 상세처럼 구조가 자주 변하는 영역에 한정한다.

## 보안 기준

- 공동인증서 p12는 업로드 직후 `AES-256-GCM` 암호화
- 복호화는 워커 실행 직전에만 허용
- 마스터 키는 코드가 아닌 환경변수 또는 KMS에서만 관리
- 운영자 계정은 2FA, IP 로깅, HTTPS를 기본값으로 강제
- 모든 자동화 작업은 감사를 위해 요청자, 대상 고객사, 실행 시각, 결과를 남긴다.

## 화면 설계 원칙

- 운영 콘솔은 "오늘 처리해야 할 것"이 먼저 보여야 한다.
- 고객 포털은 "무엇을 제출하면 되는지"가 먼저 보여야 한다.
- 자동화 ERP는 "무엇이 실패했고 어떻게 복구할지"가 먼저 보여야 한다.
- 문서 결과함, 계약, 보고서는 모두 고객사 컨텍스트 안에서 이동 가능해야 한다.

## 현재 워크스페이스와의 정렬

현재 코드베이스는 이미 세 개의 표면을 가지고 있다.

- 운영 앱: `/app`
- 고객 포털: `/portal/[tenantSlug]`
- 자동화 ERP: `/erp`

이번 설계 반영에서는 이 구조를 유지하고, 랜딩과 허브 화면에서 다음을 명확하게 보여주는 쪽으로 정렬한다.

- 어떤 사용자가 어느 표면으로 들어가는지
- 어떤 데이터가 어떤 계층에서 처리되는지
- 어떤 기능이 운영 우선순위인지

## 구현 우선순위

1. 멀티테넌트 저장소와 권한 경계를 실제 DB 스키마로 고정
2. 고객사/요청/태스크 CRUD를 서버 기반 상태로 교체
3. ERP 자동화 잡과 문서 결과를 Redis + DB 기반으로 이동
4. 인증서 보안과 알림톡 발송을 비동기 워커로 분리
5. 고객 포털 파일 업로드, 계약 서명, 보고 확인 흐름 완성

## 열려 있는 결정

- 현재 `bridge-agent`를 장기적으로 독립 워커로 유지할지, API 앱 하위 실행체로 흡수할지
- ERP와 자문 운영 데이터를 단일 DB에서 관리할지, 자동화 로그만 별도 스키마로 분리할지
- 상태 갱신을 폴링으로 유지할지, WebSocket 또는 SSE를 붙일지
- 과금과 플랜 정책을 고객사 수 기준으로 할지, 자동화 사용량 기준으로 할지
