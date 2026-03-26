export const membershipRoles = ["labor", "labor_staff", "tax", "tax_staff", "owner", "client_hr", "client_viewer"] as const;
export type MembershipRole = (typeof membershipRoles)[number];

export const requestStatuses = ["received", "in_progress", "waiting_client", "done"] as const;
export type RequestStatus = (typeof requestStatuses)[number];

export const taskStatuses = ["todo", "doing", "done"] as const;
export type TaskStatus = (typeof taskStatuses)[number];

export const contractStatuses = ["draft", "sent", "employee_signed", "fully_signed", "void"] as const;
export type ContractStatus = (typeof contractStatuses)[number];

export const documentCategories = [
  "general",
  "contracts",
  "leave",
  "tax_withholding",
  "tax_insurance",
  "tax_evidence",
  "payroll",
  "other"
] as const;
export type DocumentCategory = (typeof documentCategories)[number];

export const noticeTypes = [
  "leave_promotion_1",
  "leave_promotion_2",
  "signature_request",
  "file_request",
  "other"
] as const;
export type NoticeType = (typeof noticeTypes)[number];

export type EmploymentStatus = "active" | "terminated" | "leave";
export type RequestType = "hire" | "termination" | "pay_change" | "labor" | "tax" | "file_request";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  timezone?: string;
  fiscal_year_start_mmdd?: string;
  leave_year_basis?: "hire_date" | "fiscal_year";
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

export interface Membership {
  id: string;
  tenant_id: string;
  user_id: string;
  role: MembershipRole;
  status: "active" | "inactive";
  created_at: string;
}

export interface Employee {
  id: string;
  tenant_id: string;
  full_name: string;
  job_title?: string;
  department?: string;
  hire_date: string;
  termination_date?: string;
  employment_status: EmploymentStatus;
  email?: string;
  phone?: string;
  resident_id_last4?: string;
  is_risk?: boolean; // Indicates if the employee is under concentrated management for labor issues
  created_at: string;
}

export interface DocumentItem {
  id: string;
  tenant_id: string;
  employee_id?: string;
  category: DocumentCategory;
  title: string;
  storage_path: string;
  file_type: string;
  version: number;
  uploaded_by: string;
  uploaded_at: string;
  tags: string[];
}

export interface ServiceRequest {
  id: string;
  tenant_id: string;
  employee_id?: string;
  type: RequestType;
  title: string;
  description?: string;
  status: RequestStatus;
  requested_by: string;
  labor_owner?: string;
  tax_owner?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkTask {
  id: string;
  tenant_id: string;
  request_id?: string;
  employee_id?: string;
  domain: "노무" | "세무" | "공통";
  title: string;
  status: TaskStatus;
  assignee_id?: string;
  due_at?: string;
  checklist?: string[];
}

export interface Comment {
  id: string;
  tenant_id: string;
  entity_type: "request" | "employee" | "contract" | "report";
  entity_id: string;
  author_id: string;
  body: string;
  visibility: "public" | "internal";
  created_at: string;
}

export interface Contract {
  id: string;
  tenant_id: string;
  employee_id: string;
  title: string;
  status: ContractStatus;
  source_document_id?: string;
  signed_document_id?: string;
  version: number;
  created_by: string;
  created_at: string;
}

export interface ContractSigner {
  id: string;
  contract_id: string;
  role: "employee" | "company";
  name: string;
  email: string;
  signed_at?: string;
}

export interface ContractSignField {
  id: string;
  contract_id: string;
  signer_role: "employee" | "company";
  page: number;
  x_pct: number;
  y_pct: number;
  w_pct: number;
  h_pct: number;
}

export interface SigningToken {
  id: string;
  contract_id: string;
  signer_role: "employee" | "company";
  token_hash: string;
  expires_at: string;
  used_at?: string;
}

export interface LeaveBalance {
  id: string;
  tenant_id: string;
  employee_id: string;
  as_of_date: string;
  granted_days: number;
  used_days: number;
  remaining_days: number;
  expiry_date: string;
}

export interface LeavePromotion {
  id: string;
  tenant_id: string;
  employee_id: string;
  promotion_type: "leave_promotion_1" | "leave_promotion_2";
  target_days: number;
  sent_via: "email" | "outbox";
  sent_to: string;
  sent_at: string;
  designated_from?: string;
  designated_to?: string;
  message_snapshot: string;
}

export interface TaxTask {
  id: string;
  tenant_id: string;
  employee_id?: string;
  title: string;
  category: "withholding" | "insurance" | "evidence" | "month_end";
  status: TaskStatus;
  assignee_id?: string;
  due_date?: string;
  created_at: string;
}

export interface MonthlyReport {
  id: string;
  tenant_id: string;
  month: string;
  document_id?: string;
  summary?: string;
  prepared_by?: string;
  owner_confirmed: boolean;
  owner_confirmed_at?: string;
}

export interface Qna {
  id: string;
  tenant_id: string;
  question: string;
  asked_by: string;
  assignee_id?: string;
  status: "답변대기" | "확인중" | "완료";
  created_at: string;
}

export interface Notification {
  id: string;
  tenant_id: string;
  type: NoticeType;
  to: string;
  subject?: string;
  body: string;
  related_entity?: "contract" | "request" | "leave" | "file";
  related_id?: string;
  sent_at?: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  requestType: RequestType;
  defaultAssignee: "노무" | "세무" | "공통";
  taskCount: number;
  taskTemplates: {
    title: string;
    domain: "노무" | "세무" | "공통";
    dueInDays: number;
  }[];
}

export interface LaborIssue {
  id: string;
  tenant_id: string;
  employee_id: string;
  category: "absenteeism" | "harassment" | "discipline" | "performance" | "other";
  title: string;
  description: string;
  status: "open" | "investigating" | "resolved";
  reported_at: string;
  severity: "low" | "medium" | "high";
}
