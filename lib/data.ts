import {
  type Contract,
  type ContractSigner,
  type ContractSignField,
  type ContractStatus,
  type DocumentCategory,
  type DocumentItem,
  type Employee,
  type LeaveBalance,
  type LeavePromotion,
  type Membership,
  type MonthlyReport,
  type NoticeType,
  type Notification,
  type Qna,
  type RequestType,
  type ServiceRequest,
  type TaskStatus,
  type TaxTask,
  type Tenant,
  type User,
  type WorkTask,
  type Comment,
  type RequestStatus,
  type TemplateItem,
  type LaborIssue
} from "./types";

export const tenants: Tenant[] = [
  {
    id: "tenant-1",
    name: "OOO의원",
    slug: "ooo-clinic",
    timezone: "Asia/Seoul",
    fiscal_year_start_mmdd: "01-01",
    leave_year_basis: "hire_date",
    created_at: "2026-02-17T09:00:00.000Z"
  }
];

export const users: User[] = [
  { id: "u1", email: "tax@firm.com", name: "이세무", phone: "010-1111-1111" },
  { id: "u2", email: "labor@firm.com", name: "김노무", phone: "010-2222-2222" },
  { id: "u3", email: "owner@clinic.com", name: "박대표", phone: "010-3333-3333" },
  { id: "u4", email: "hr@clinic.com", name: "정인사", phone: "010-4444-4444" }
];

export const memberships: Membership[] = [
  { id: "m1", tenant_id: "tenant-1", user_id: "u3", role: "owner", status: "active", created_at: "2026-01-01T00:00:00.000Z" },
  { id: "m2", tenant_id: "tenant-1", user_id: "u4", role: "client_hr", status: "active", created_at: "2026-01-01T00:00:00.000Z" },
  { id: "m3", tenant_id: "tenant-1", user_id: "u1", role: "tax_staff", status: "active", created_at: "2026-01-01T00:00:00.000Z" },
  { id: "m4", tenant_id: "tenant-1", user_id: "u2", role: "labor_staff", status: "active", created_at: "2026-01-01T00:00:00.000Z" }
];

export const employees: Employee[] = [
  {
    id: "e1",
    tenant_id: "tenant-1",
    full_name: "홍길동",
    job_title: "간호사",
    department: "진료지원",
    hire_date: "2025-03-01",
    employment_status: "active",
    email: "hong@example.com",
    phone: "010-1000-1000",
    resident_id_last4: "1001",
    created_at: "2025-02-28T10:00:00.000Z"
  },
  {
    id: "e2",
    tenant_id: "tenant-1",
    full_name: "김민수",
    job_title: "원무팀장",
    department: "원무과",
    hire_date: "2024-06-10",
    employment_status: "active",
    email: "minsu@example.com",
    phone: "010-2000-2000",
    resident_id_last4: "2002",
    is_risk: true,
    created_at: "2024-06-09T08:00:00.000Z"
  },
  {
    id: "e3",
    tenant_id: "tenant-1",
    full_name: "이영희",
    job_title: "회계담당",
    department: "총무팀",
    hire_date: "2026-01-15",
    employment_status: "active",
    email: "younghee@example.com",
    phone: "010-3000-3000",
    resident_id_last4: "3003",
    created_at: "2026-01-15T04:00:00.000Z"
  }
];

export const documents: DocumentItem[] = [
  {
    id: "d1",
    tenant_id: "tenant-1",
    employee_id: "e1",
    category: "contracts",
    title: "근로계약서 v1",
    storage_path: "tenant-1/employees/e1/contracts/d1/v1-contract.pdf",
    file_type: "application/pdf",
    version: 1,
    uploaded_by: "u2",
    uploaded_at: "2026-02-01T09:00:00.000Z",
    tags: ["근로계약", "2026"]
  },
  {
    id: "d2",
    tenant_id: "tenant-1",
    employee_id: "e1",
    category: "leave",
    title: "연차승인서 초안",
    storage_path: "tenant-1/employees/e1/leave/d2/v1-approval.pdf",
    file_type: "application/pdf",
    version: 1,
    uploaded_by: "u4",
    uploaded_at: "2026-02-15T11:00:00.000Z",
    tags: ["연차", "휴가"]
  },
  {
    id: "d3",
    tenant_id: "tenant-1",
    category: "payroll",
    title: "월간 경영리포트 2026-02",
    storage_path: "tenant-1/docs/payroll/d3/v1-report.pdf",
    file_type: "application/pdf",
    version: 1,
    uploaded_by: "u1",
    uploaded_at: "2026-03-01T10:30:00.000Z",
    tags: ["리포트", "분기"]
  }
];

export const leaveBalances: LeaveBalance[] = [
  { id: "lb1", tenant_id: "tenant-1", employee_id: "e1", as_of_date: "2026-03-01", granted_days: 15, used_days: 3, remaining_days: 12, expiry_date: "2026-12-31" },
  { id: "lb2", tenant_id: "tenant-1", employee_id: "e2", as_of_date: "2026-03-01", granted_days: 15, used_days: 8, remaining_days: 7, expiry_date: "2026-12-31" },
  { id: "lb3", tenant_id: "tenant-1", employee_id: "e3", as_of_date: "2026-03-01", granted_days: 11, used_days: 1, remaining_days: 10, expiry_date: "2026-12-31" }
];

export const leavePromotions: LeavePromotion[] = [
  {
    id: "lp1",
    tenant_id: "tenant-1",
    employee_id: "e1",
    promotion_type: "leave_promotion_1",
    target_days: 12,
    sent_via: "email",
    sent_to: "hong@example.com",
    sent_at: "2026-02-26T08:30:00.000Z",
    message_snapshot: "1차 연차 안내 발송됨"
  }
];

export const serviceRequests: ServiceRequest[] = [
  {
    id: "r1",
    tenant_id: "tenant-1",
    employee_id: "e1",
    type: "hire",
    title: "홍길동 신규 입사 처리",
    description: "입사자 기본자료 등록 및 계약서 전자서명 요청",
    status: "in_progress",
    requested_by: "u4",
    labor_owner: "u2",
    tax_owner: "u1",
    due_date: "2026-03-05",
    created_at: "2026-02-20T07:00:00.000Z",
    updated_at: "2026-02-22T12:00:00.000Z"
  },
  {
    id: "r2",
    tenant_id: "tenant-1",
    employee_id: "e2",
    type: "file_request",
    title: "4대보험 증빙 파일 추가 제출",
    description: "통장사본 및 신분증 사본이 필요합니다.",
    status: "waiting_client",
    requested_by: "u2",
    labor_owner: "u2",
    tax_owner: "u1",
    due_date: "2026-03-10",
    created_at: "2026-02-18T10:00:00.000Z",
    updated_at: "2026-02-24T09:00:00.000Z"
  },
  {
    id: "r3",
    tenant_id: "tenant-1",
    employee_id: "e3",
    type: "pay_change",
    title: "이영희 급여 인상 처리",
    description: "기본급 100만원 인상 건",
    status: "received",
    requested_by: "u4",
    due_date: "2026-03-12",
    created_at: "2026-02-25T11:20:00.000Z",
    updated_at: "2026-02-25T11:20:00.000Z"
  }
];

export const workTasks: WorkTask[] = [
  { id: "t1", tenant_id: "tenant-1", request_id: "r1", employee_id: "e1", domain: "노무", title: "근로계약서 버전 생성", status: "doing", assignee_id: "u2", due_at: "2026-03-03T23:59:00.000Z", checklist: ["계약사항 확인", "템플릿 필드 반영"] },
  { id: "t2", tenant_id: "tenant-1", request_id: "r1", employee_id: "e1", domain: "노무", title: "근로계약서 서명 요청 발송", status: "todo", assignee_id: "u2", due_at: "2026-03-03T23:59:00.000Z" },
  { id: "t3", tenant_id: "tenant-1", request_id: "r1", employee_id: "e1", domain: "세무", title: "4대보험 취득 신고", status: "todo", assignee_id: "u1", due_at: "2026-03-05T23:59:00.000Z" },
  { id: "t4", tenant_id: "tenant-1", request_id: "r1", employee_id: "e1", domain: "세무", title: "원천세 반영", status: "todo", assignee_id: "u1", due_at: "2026-03-05T23:59:00.000Z" },
  { id: "t5", tenant_id: "tenant-1", request_id: "r2", employee_id: "e2", domain: "공통", title: "요청 파일 2건 추가 업로드 안내", status: "done", assignee_id: "u2", checklist: ["통장사본", "신분증 사본"] },
  { id: "t6", tenant_id: "tenant-1", request_id: "r3", employee_id: "e3", domain: "노무", title: "변경합의서 초안 전달", status: "todo", assignee_id: "u2", due_at: "2026-03-11T23:59:00.000Z" }
];

export const comments: Comment[] = [
  { id: "c1", tenant_id: "tenant-1", entity_type: "request", entity_id: "r1", author_id: "u2", body: "입사자 증빙 일부가 아직 미수령입니다. 안내문 발송했습니다.", visibility: "public", created_at: "2026-02-21T09:20:00.000Z" },
  { id: "c2", tenant_id: "tenant-1", entity_type: "request", entity_id: "r2", author_id: "u1", body: "고객측 업로드 완료 시까지 세무 마감표시는 보류 상태로 유지.", visibility: "internal", created_at: "2026-02-24T10:10:00.000Z" }
];

export const contracts: Contract[] = [
  {
    id: "ct1",
    tenant_id: "tenant-1",
    employee_id: "e1",
    title: "근로계약서(정규직)",
    status: "sent",
    source_document_id: "d1",
    version: 1,
    created_by: "u2",
    created_at: "2026-02-20T00:00:00.000Z"
  },
  {
    id: "ct2",
    tenant_id: "tenant-1",
    employee_id: "e2",
    title: "근로계약서(단시간)",
    status: "employee_signed",
    source_document_id: "d1",
    signed_document_id: "d4",
    version: 2,
    created_by: "u2",
    created_at: "2026-02-05T00:00:00.000Z"
  }
];

export const contractSigners: ContractSigner[] = [
  { id: "cs1", contract_id: "ct1", role: "employee", name: "홍길동", email: "hong@example.com", signed_at: "2026-02-24T09:10:00.000Z" },
  { id: "cs2", contract_id: "ct1", role: "company", name: "OOO의원", email: "owner@clinic.com" }
];

export const contractSignFields: ContractSignField[] = [
  { id: "cf1", contract_id: "ct1", signer_role: "employee", page: 0, x_pct: 0.7, y_pct: 0.82, w_pct: 0.22, h_pct: 0.05 },
  { id: "cf2", contract_id: "ct1", signer_role: "company", page: 0, x_pct: 0.7, y_pct: 0.88, w_pct: 0.22, h_pct: 0.05 }
];

export const monthlyReports: MonthlyReport[] = [
  { id: "mr1", tenant_id: "tenant-1", month: "2026-01", document_id: "d3", summary: "매출/비용/인건비 항목 정리 완료. 예외 지급 2건 반영 필요", prepared_by: "u1", owner_confirmed: false },
  { id: "mr2", tenant_id: "tenant-1", month: "2025-12", document_id: "d3", summary: "분기 보고 요약본 제출", prepared_by: "u1", owner_confirmed: true, owner_confirmed_at: "2026-01-03T09:30:00.000Z" }
];

export const taxTasks: TaxTask[] = [
  {
    id: "tt1",
    tenant_id: "tenant-1",
    employee_id: "e1",
    title: "원천세 반영",
    category: "withholding",
    status: "todo",
    assignee_id: "u1",
    due_date: "2026-03-07",
    created_at: "2026-03-01T08:00:00.000Z"
  },
  {
    id: "tt2",
    tenant_id: "tenant-1",
    employee_id: "e2",
    title: "4대보험 고지서 검토",
    category: "insurance",
    status: "doing",
    assignee_id: "u1",
    due_date: "2026-03-05",
    created_at: "2026-03-01T08:00:00.000Z"
  },
  {
    id: "tt3",
    tenant_id: "tenant-1",
    title: "월마감 증빙 확인",
    category: "month_end",
    status: "todo",
    assignee_id: "u1",
    due_date: "2026-03-10",
    created_at: "2026-03-01T08:00:00.000Z"
  }
];

export const qnas: Qna[] = [
  { id: "q1", tenant_id: "tenant-1", question: "퇴사자 4대보험 해지 시점 기준은 언제인가요?", asked_by: "u4", assignee_id: "u1", status: "답변대기", created_at: "2026-02-24T16:00:00.000Z" },
  { id: "q2", tenant_id: "tenant-1", question: "계약서 버전관리 기준", asked_by: "u4", status: "완료", created_at: "2026-02-20T09:00:00.000Z" }
];

export const notifications: Notification[] = [
  {
    id: "n1",
    tenant_id: "tenant-1",
    type: "signature_request",
    to: "hong@example.com",
    subject: "근로계약서 서명 요청",
    body: "홍길동님 계약서 서명을 요청드립니다.",
    related_entity: "contract",
    related_id: "ct1",
    sent_at: "2026-02-20T08:30:00.000Z"
  },
  {
    id: "n2",
    tenant_id: "tenant-1",
    type: "leave_promotion_1",
    to: "hong@example.com",
    subject: "연차촉진 1차 안내",
    body: "미사용 연차 사용 안내",
    related_entity: "leave",
    related_id: "lb1",
    sent_at: "2026-02-26T08:33:00.000Z"
  }
];

export const taskTemplates: TemplateItem[] = [
  {
    id: "tpl-hire",
    name: "입사 처리 기본",
    requestType: "hire",
    defaultAssignee: "공통",
    taskCount: 5,
    taskTemplates: [
      { title: "근로계약서 생성", domain: "노무", dueInDays: 2 },
      { title: "근로계약서 서명 요청 발송", domain: "노무", dueInDays: 2 },
      { title: "4대보험 취득 신고", domain: "세무", dueInDays: 3 },
      { title: "원천징수자료 반영", domain: "세무", dueInDays: 3 },
      { title: "증빙 자료 회수", domain: "공통", dueInDays: 5 }
    ]
  },
  {
    id: "tpl-termination",
    name: "퇴사 처리",
    requestType: "termination",
    defaultAssignee: "공통",
    taskCount: 4,
    taskTemplates: [
      { title: "퇴사 인수인계 체크리스트 발송", domain: "노무", dueInDays: 1 },
      { title: "연차·정산 확인", domain: "노무", dueInDays: 2 },
      { title: "4대보험 상실 신고", domain: "세무", dueInDays: 2 },
      { title: "원천세 정산 반영", domain: "세무", dueInDays: 3 }
    ]
  },
  {
    id: "tpl-pay-change",
    name: "급여 변경",
    requestType: "pay_change",
    defaultAssignee: "세무",
    taskCount: 3,
    taskTemplates: [
      { title: "변경근거(발령/결정) 확인", domain: "노무", dueInDays: 1 },
      { title: "급여/원천 변동 반영", domain: "세무", dueInDays: 2 },
      { title: "월마감 체크리스트 반영", domain: "세무", dueInDays: 3 }
    ]
  },
  {
    id: "tpl-file-request",
    name: "자료요청",
    requestType: "file_request",
    defaultAssignee: "공통",
    taskCount: 2,
    taskTemplates: [
      { title: "필요 자료 목록 안내", domain: "공통", dueInDays: 1 },
      { title: "고객 대기 상태 전환", domain: "공통", dueInDays: 2 }
    ]
  }
];

export const laborIssues: LaborIssue[] = [
  {
    id: "i1",
    tenant_id: "tenant-1",
    employee_id: "e2",
    category: "absenteeism",
    title: "사전 연락 없는 무단결근 3일째",
    description: "본인 연락 두절, 가족 통화 시도 중. 취업규칙 제50조(당연퇴직 사유) 검토 요망",
    status: "investigating",
    severity: "high",
    reported_at: "2026-03-02T09:00:00.000Z"
  },
  {
    id: "i2",
    tenant_id: "tenant-1",
    employee_id: "e2",
    category: "performance",
    title: "환자 응대 불량 민원 지속",
    description: "3월 내 환자 컴플레인 2건 발생. 구두 경고 1회 진행함.",
    status: "open",
    severity: "medium",
    reported_at: "2026-03-04T10:15:00.000Z"
  }
];

export const getTenantBySlug = (slug: string): Tenant | undefined =>
  tenants.find((t) => t.slug === slug);

export const getEmployee = (tenantId: string, employeeId: string): Employee | undefined =>
  employees.find((e) => e.tenant_id === tenantId && e.id === employeeId);

export const getEmployeeRequests = (tenantId: string, employeeId: string): ServiceRequest[] =>
  serviceRequests.filter((r) => r.tenant_id === tenantId && r.employee_id === employeeId);

export const getEmployeeDocuments = (tenantId: string, employeeId: string): DocumentItem[] =>
  documents.filter((doc) => doc.tenant_id === tenantId && doc.employee_id === employeeId);

export const getEmployeeTasks = (tenantId: string, employeeId: string): WorkTask[] =>
  workTasks.filter((task) => task.tenant_id === tenantId && task.employee_id === employeeId);

export const getEmployeeLeaveBalance = (tenantId: string, employeeId: string): LeaveBalance | undefined =>
  leaveBalances.find((lb) => lb.tenant_id === tenantId && lb.employee_id === employeeId);

export const getRequest = (tenantId: string, requestId: string): ServiceRequest | undefined =>
  serviceRequests.find((r) => r.tenant_id === tenantId && r.id === requestId);

export const getRequestTasks = (tenantId: string, requestId: string): WorkTask[] =>
  workTasks.filter((task) => task.tenant_id === tenantId && task.request_id === requestId);

export const getRequestComments = (tenantId: string, requestId: string): Comment[] =>
  comments.filter((comment) => comment.tenant_id === tenantId && comment.entity_type === "request" && comment.entity_id === requestId);

export const getEmployeeContracts = (tenantId: string, employeeId: string): Contract[] =>
  contracts.filter((c) => c.tenant_id === tenantId && c.employee_id === employeeId);

export const getContractSigners = (contractId: string): ContractSigner[] =>
  contractSigners.filter((s) => s.contract_id === contractId);

export const getContractFields = (contractId: string): ContractSignField[] =>
  contractSignFields.filter((f) => f.contract_id === contractId);

export const statusLabel = (status: RequestStatus | TaskStatus | ContractStatus): string => {
  const map: Record<string, string> = {
    received: "접수",
    in_progress: "처리중",
    waiting_client: "고객대기",
    done: "완료",
    todo: "할일",
    doing: "진행중",
    draft: "초안",
    sent: "발송",
    employee_signed: "직원서명완료",
    fully_signed: "완전서명완료",
    void: "무효"
  };
  return map[status] ?? status;
};

export const noticeLabel = (n: NoticeType): string => {
  const map: Record<string, string> = {
    leave_promotion_1: "연차촉진 1차",
    leave_promotion_2: "연차촉진 2차",
    signature_request: "서명요청",
    file_request: "자료요청",
    other: "기타"
  };
  return map[n] ?? n;
};

export const getLaborIssues = (tenantId: string): LaborIssue[] =>
  laborIssues.filter((i) => i.tenant_id === tenantId);
