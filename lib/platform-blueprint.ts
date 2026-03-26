export type BlueprintStat = {
  value: string;
  label: string;
  detail: string;
};

export type BlueprintSurface = {
  code: string;
  title: string;
  href: string;
  accent: string;
  description: string;
  bullets: string[];
};

export type BlueprintModule = {
  code: string;
  title: string;
  accent: string;
  summary: string;
  capabilities: string[];
};

export type ArchitectureLane = {
  title: string;
  detail: string;
  items: string[];
};

export type TrustControl = {
  title: string;
  summary: string;
};

export type DeliveryPhase = {
  phase: string;
  period: string;
  title: string;
  outcome: string;
};

export const blueprintStats: BlueprintStat[] = [
  {
    value: "3",
    label: "업무 표면",
    detail: "운영 콘솔, 고객 포털, 자동화 ERP를 명확히 분리합니다.",
  },
  {
    value: "4",
    label: "자동화 커넥터",
    detail: "홈택스, 4대보험, Gov24, 위택스를 하나의 큐 체계로 다룹니다.",
  },
  {
    value: "6",
    label: "전달 단계",
    detail: "온보딩부터 자문, 급여, 서류 발급, 감사 추적까지 이어집니다.",
  },
  {
    value: "1",
    label: "감사 기준선",
    detail: "모든 요청과 자동화 결과를 테넌트 기준으로 추적합니다.",
  },
];

export const blueprintSurfaces: BlueprintSurface[] = [
  {
    code: "OPS",
    title: "운영 콘솔",
    href: "/app",
    accent: "#0f766e",
    description: "노무·세무 담당자가 요청, 태스크, 보고, 템플릿, 고객사를 운영하는 내부 업무 허브입니다.",
    bullets: ["인박스와 요청 라우팅", "고객사·템플릿 관리", "월간 리포트와 감사 로그"],
  },
  {
    code: "PORTAL",
    title: "고객 포털",
    href: "/portal/login",
    accent: "#2563eb",
    description: "고객사는 인사 자료, 계약, 휴가, 파일, 문의 내역을 한 화면에서 확인합니다.",
    bullets: ["채용·입퇴사 체크리스트", "근로계약 및 서명", "문서함·질의응답·설정"],
  },
  {
    code: "ERP",
    title: "자동화 ERP",
    href: "/erp",
    accent: "#0f172a",
    description: "정부 포털 자동화, 증빙 수집, 작업 재시도, 결과 보관을 담당하는 수집 허브입니다.",
    bullets: ["BullMQ 작업 현황", "문서 결과함과 채널 상태", "실패 재시도와 인증서 상태"],
  },
];

export const blueprintModules: BlueprintModule[] = [
  {
    code: "TENANT",
    title: "멀티테넌트 코어",
    accent: "#1d4ed8",
    summary: "Firm, Tenant, Membership, 권한을 중심으로 모든 데이터를 소속 기준으로 격리합니다.",
    capabilities: ["firmId 스코프 강제", "역할별 접근 제어", "고객사별 운영 상태 관리"],
  },
  {
    code: "WORKFLOW",
    title: "업무 오케스트레이션",
    accent: "#0f766e",
    summary: "서비스 요청과 내부 태스크를 자동 생성하고, 담당자와 마감 일정을 흐름 중심으로 연결합니다.",
    capabilities: ["요청 유형별 템플릿", "노무·세무 담당 분리", "상태 공유와 코멘트 기록"],
  },
  {
    code: "AUTOMATION",
    title: "정부 포털 자동화",
    accent: "#0369a1",
    summary: "Playwright 워커가 홈택스·4대보험 포털에서 문서와 고지 데이터를 수집합니다.",
    capabilities: ["공동인증서 로그인", "PDF 발급 및 저장", "실패 시 자동 재시도"],
  },
  {
    code: "PAYROLL",
    title: "급여 요청·수집",
    accent: "#b45309",
    summary: "카카오 알림톡으로 급여자료를 요청하고, 회신 상태를 월 단위로 추적합니다.",
    capabilities: ["월별 요청 이력", "수신 여부 추적", "후속 처리와 산출물 연결"],
  },
  {
    code: "EVIDENCE",
    title: "문서·계약·증빙",
    accent: "#7c3aed",
    summary: "근로계약, 첨부 문서, 발급된 PDF, 보고서를 동일한 파일 체계와 감사 이력으로 묶습니다.",
    capabilities: ["파일 버전 관리", "전자서명 토큰", "증빙 결과 보관함"],
  },
  {
    code: "TRUST",
    title: "보안·감사 레일",
    accent: "#be123c",
    summary: "공동인증서 암호화, 2FA, IP 로깅, 감사 로그를 제품 기본값으로 설계합니다.",
    capabilities: ["AES-256-GCM 보관", "KMS 또는 환경변수 키 관리", "행위 로그와 추적성"],
  },
];

export const architectureLanes: ArchitectureLane[] = [
  {
    title: "경험 계층",
    detail: "사용자는 역할에 따라 각기 다른 화면에 진입하지만 하나의 데이터 모델을 공유합니다.",
    items: ["Next.js 운영 콘솔", "고객 포털", "전자서명 링크", "알림 링크"],
  },
  {
    title: "업무 API 계층",
    detail: "인증, 요청, 파일, 보고, 자동화 요청을 REST API와 상태 동기화 계층으로 정리합니다.",
    items: ["App Router API", "Express/Worker 분리 가능 구조", "권한·감사 미들웨어", "상태 폴링 또는 소켓"],
  },
  {
    title: "자동화 실행 계층",
    detail: "큐와 워커가 정부 포털 수집, 알림 발송, PDF 저장을 비동기로 처리합니다.",
    items: ["BullMQ + Redis", "Playwright 워커", "카카오 알림톡", "S3 또는 MinIO"],
  },
  {
    title: "데이터·보안 계층",
    detail: "테넌트 스코프 DB, 암호화 자격증명, 보관 정책이 운영 기준선이 됩니다.",
    items: ["PostgreSQL + Prisma", "암호화된 p12 저장", "감사 로그", "SSL/HTTPS 강제"],
  },
];

export const trustControls: TrustControl[] = [
  {
    title: "공동인증서 최소 노출",
    summary: "p12는 저장 시 즉시 암호화하고, 워커 실행 직전에만 복호화한 뒤 임시 경로를 바로 정리합니다.",
  },
  {
    title: "테넌트 강제 스코프",
    summary: "Firm 또는 Tenant 키를 모든 조회와 변경 경로에 주입해 다른 사무소 데이터 접근을 차단합니다.",
  },
  {
    title: "행위 기반 감사 로그",
    summary: "요청 생성, 문서 발급, 실패 재시도, 전송 이력을 같은 로그 모델에서 추적합니다.",
  },
  {
    title: "운영자 보안 기본값",
    summary: "2FA, IP 로깅, HTTPS, 비밀키 외부 관리가 제품 기본값이어야 합니다.",
  },
];

export const deliveryPhases: DeliveryPhase[] = [
  {
    phase: "Phase 1",
    period: "1~2개월",
    title: "테넌트·고객사·기본 UI",
    outcome: "고객사 CRUD, 역할 분리, 요청/태스크 뼈대를 먼저 안정화합니다.",
  },
  {
    phase: "Phase 2",
    period: "2~3개월",
    title: "홈택스 문서 자동화",
    outcome: "공동인증서 기반 로그인과 민원서류 PDF 발급 흐름을 고정합니다.",
  },
  {
    phase: "Phase 3",
    period: "3~4개월",
    title: "4대보험 고지 조회",
    outcome: "건강보험·국민연금 데이터를 월별로 적재하고 엑셀/리포트로 연결합니다.",
  },
  {
    phase: "Phase 4",
    period: "4~5개월",
    title: "카카오 급여 요청",
    outcome: "급여자료 요청, 고객 회신, 처리 상태를 월 단위 운영 흐름으로 완성합니다.",
  },
  {
    phase: "Phase 5",
    period: "5~6개월",
    title: "결제·온보딩 확대",
    outcome: "요금제, 운영지표, 베타 고객사 확장, 표준 운영 매뉴얼을 붙입니다.",
  },
];

export const workspaceCards = [
  {
    code: "INBOX",
    title: "업무 인박스",
    href: "/app/inbox",
    accent: "#0f766e",
    description: "서비스 요청, 후속 업무, 담당자 할당을 기준으로 자문 운영을 통합 관리합니다.",
  },
  {
    code: "ERP",
    title: "자동화 ERP",
    href: "/erp",
    accent: "#0f172a",
    description: "홈택스·4대보험·Gov24·위택스 수집 작업과 문서 결과를 별도 콘솔에서 관리합니다.",
  },
  {
    code: "TENANT",
    title: "고객사 관리",
    href: "/app/tenants",
    accent: "#1d4ed8",
    description: "고객사별 계약 상태, 소속 사용자, 서비스 범위, 문서 흐름을 관리합니다.",
  },
  {
    code: "AUDIT",
    title: "운영 로그",
    href: "/app/logs",
    accent: "#7c3aed",
    description: "요청 처리 이력과 시스템 로그를 함께 보고, 장애나 누락을 빠르게 추적합니다.",
  },
];

export const designPrinciples = [
  "업무 흐름이 화면 흐름보다 우선합니다.",
  "고객 공개 화면과 내부 운영 화면을 분리하되 상태 언어는 통일합니다.",
  "자동화 성공보다 실패 감지와 복구를 더 먼저 보여줍니다.",
  "문서, 계약, 알림, 리포트는 같은 감사 사슬 위에 둡니다.",
];
