import type { WorkspaceSession } from "@/lib/workspace-users";

export type PortalViewerRole =
  | "client_owner"
  | "client_staff"
  | "tax_advisor"
  | "tax_staff"
  | "labor_advisor"
  | "labor_staff";

export type PortalTabKey =
  | "dashboard"
  | "company"
  | "payroll"
  | "tax"
  | "certificates"
  | "insights"
  | "qna"
  | "consulting";

export interface PortalTabDefinition {
  key: string;
  href: string;
  label: string;
  description: string;
  roles: PortalViewerRole[];
  badge?: string;
}

export interface PortalPolicy {
  key: string;
  label: string;
  description: string;
  roles: PortalViewerRole[];
}

export interface PortalAccessSummary {
  canViewBilling: boolean;
  canEditBilling: boolean;
  canViewSensitiveOwnerDocs: boolean;
  canManagePayroll: boolean;
  canViewTaxPayments: boolean;
  canIssueCertificates: boolean;
  canManageConsulting: boolean;
}

export const portalRoleLabels: Record<PortalViewerRole, string> = {
  client_owner: "고객사 대표",
  client_staff: "고객사 직원",
  tax_advisor: "세무사",
  tax_staff: "세무사무실 직원",
  labor_advisor: "노무사",
  labor_staff: "노무 실무자",
};

export const portalPrimaryTabs: PortalTabDefinition[] = [
  {
    key: "dashboard",
    href: "dashboard",
    label: "경영 대시보드",
    description: "이번 달 급여, 세금, 컨설팅, 민원서류의 핵심 상태를 한 화면에서 확인합니다.",
    roles: ["client_owner", "client_staff", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
  },
  {
    key: "company",
    href: "company",
    label: "업체정보·계약",
    description: "업체 기본정보, 담당자, 기초 세팅자료와 청구·계약 내역을 한 탭에서 관리합니다.",
    roles: ["client_owner", "client_staff", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
    badge: "핵심",
  },
  {
    key: "payroll",
    href: "payroll",
    label: "급여",
    description: "고객사·세무·노무가 함께 쓰는 급여 세팅, 사원등록, 월별 자료, 명세서 전달 공간입니다.",
    roles: ["client_owner", "client_staff", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
    badge: "3방향",
  },
  {
    key: "tax",
    href: "tax",
    label: "세금 자료·납부",
    description: "신고 대비 자료 업로드, 납부서 송부, 공문·기한 알림을 한 흐름으로 묶습니다.",
    roles: ["client_owner", "client_staff", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
    badge: "양방향",
  },
  {
    key: "certificates",
    href: "certificates",
    label: "민원증명서류",
    description: "홈택스·위택스·4대보험 증명서를 셀프 발급하는 만능 탭입니다.",
    roles: ["client_owner", "client_staff", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
  },
  {
    key: "insights",
    href: "insights",
    label: "세무·노무 코멘트",
    description: "시기별 리스크, 업종별 코멘트, 지원금 공지를 공지형으로 운영합니다.",
    roles: ["client_owner", "client_staff", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
  },
  {
    key: "qna",
    href: "qna",
    label: "Q&A",
    description: "챗봇 1차 응답과 전문가 인계가 함께 동작하는 질의응답 공간입니다.",
    roles: ["client_owner", "client_staff", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
  },
  {
    key: "consulting",
    href: "consulting",
    label: "특별 컨설팅",
    description: "별도 프로젝트의 진행도, 자료수집, 효과를 가시적으로 관리합니다.",
    roles: ["client_owner", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
  },
];

export const portalUtilityTabs: PortalTabDefinition[] = [
  {
    key: "people",
    href: "people",
    label: "직원명부",
    description: "사원 기준 상세 이력과 연결 문서를 빠르게 확인합니다.",
    roles: ["client_owner", "client_staff", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
  },
  {
    key: "requests",
    href: "requests",
    label: "요청·티켓",
    description: "실무 요청과 진행 상태를 티켓 단위로 추적합니다.",
    roles: ["client_owner", "client_staff", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
  },
  {
    key: "files",
    href: "files",
    label: "문서함",
    description: "업로드 완료된 계약서, 급여자료, 공문을 내려받습니다.",
    roles: ["client_owner", "client_staff", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
  },
  {
    key: "contracts",
    href: "contracts",
    label: "근로계약",
    description: "전자서명 진행 현황과 계약 버전을 확인합니다.",
    roles: ["client_owner", "client_staff", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
  },
];

export const portalHiddenLabels: Record<string, string> = {
  onboarding: "채용 온보딩",
  issues: "노무 이슈 관리",
  leave: "연차·휴가",
  reports: "리포트",
  settings: "사업장 설정",
};

export const portalPolicies: PortalPolicy[] = [
  {
    key: "company_core",
    label: "업체 기본정보",
    description: "사업자등록번호, 대표자, 사업장 주소, 업태/종목, 담당자 정보를 열람합니다.",
    roles: ["client_owner", "client_staff", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
  },
  {
    key: "billing_contracts",
    label: "청구·계약 관리",
    description: "초기 수임료, 조정료, 월 계약서, 전자서명 상태를 확인합니다.",
    roles: ["client_owner", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
  },
  {
    key: "sensitive_owner_docs",
    label: "대표자 민감정보",
    description: "대표자 신분증, 홈택스 ID, 공인인증서, 사업용계좌·카드 파일을 조회합니다.",
    roles: ["client_owner", "tax_advisor", "tax_staff", "labor_advisor"],
  },
  {
    key: "payroll_master",
    label: "급여 운영",
    description: "회사 세팅, 급여대장, 급여명세서 발행과 수정 히스토리를 관리합니다.",
    roles: ["client_owner", "client_staff", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
  },
  {
    key: "tax_filing",
    label: "세금 신고 대비 자료",
    description: "자산·부채·금융·수기증빙 업로드와 확인 상태를 관리합니다.",
    roles: ["client_owner", "client_staff", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
  },
  {
    key: "tax_payments",
    label: "납부서 송부",
    description: "원천세, 부가세, 종소세, 법인세 납부서를 검토 후 송부합니다.",
    roles: ["client_owner", "client_staff", "tax_advisor", "tax_staff"],
  },
  {
    key: "certificates",
    label: "민원증명 발급",
    description: "홈택스·위택스·4대보험 증명서를 즉시 발급합니다.",
    roles: ["client_owner", "client_staff", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
  },
  {
    key: "consulting",
    label: "특별 컨설팅 진행",
    description: "자료수집, 접수, 완료와 기대효과를 프로젝트별로 관리합니다.",
    roles: ["client_owner", "tax_advisor", "tax_staff", "labor_advisor", "labor_staff"],
  },
];

export function mapWorkspaceRoleToPortalRole(roleKey: WorkspaceSession["roleKey"]): PortalViewerRole {
  switch (roleKey) {
    case "tax_manager":
      return "tax_advisor";
    case "labor_manager":
      return "labor_advisor";
    case "client_owner":
      return "client_owner";
    case "client_hr":
      return "client_staff";
    default:
      return "client_staff";
  }
}

export function getVisiblePortalTabs(role: PortalViewerRole) {
  return portalPrimaryTabs.filter((tab) => tab.roles.includes(role));
}

export function getVisibleUtilityTabs(role: PortalViewerRole) {
  return portalUtilityTabs.filter((tab) => tab.roles.includes(role));
}

export function hasPortalPolicyAccess(role: PortalViewerRole, policyKey: string) {
  return portalPolicies.some((policy) => policy.key === policyKey && policy.roles.includes(role));
}

export function getPortalAccessSummary(role: PortalViewerRole): PortalAccessSummary {
  return {
    canViewBilling: hasPortalPolicyAccess(role, "billing_contracts"),
    canEditBilling: role !== "client_staff",
    canViewSensitiveOwnerDocs: hasPortalPolicyAccess(role, "sensitive_owner_docs"),
    canManagePayroll: hasPortalPolicyAccess(role, "payroll_master"),
    canViewTaxPayments: hasPortalPolicyAccess(role, "tax_payments"),
    canIssueCertificates: hasPortalPolicyAccess(role, "certificates"),
    canManageConsulting: hasPortalPolicyAccess(role, "consulting"),
  };
}
