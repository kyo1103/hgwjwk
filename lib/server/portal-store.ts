// lib/server/portal-store.ts
// 포털 전용 인메모리 스토어 (globalThis로 hot reload 생존)

export interface TaxFile {
  id: string;
  tenantSlug: string;
  category: "assets" | "liabilities" | "financial" | "manual";
  categoryLabel: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  uploadedBy: string;
  uploadedAt: string;
  reviewStatus: "pending" | "reviewing" | "done";
  reviewedBy?: string;
  reviewedAt?: string;
  note?: string;
}

export interface TaxPaymentRecord {
  id: string;
  tenantSlug: string;
  taxType: string;
  dueDate: string;
  status: "pending" | "notice_sent" | "paid" | "overdue";
  fileUrl?: string;
  sendMemo: string;
  sentAt?: string;
  sentBy?: string;
  uploadedFilePath?: string;
}

export interface PortalEmployee {
  id: string;
  tenantSlug: string;
  name: string;
  employmentType: "regular" | "part_time" | "freelance" | "daily";
  baseSalary: number;
  joinedAt: string;
  leftAt?: string;
  status: "active" | "inactive";
  position?: string;
  department?: string;
  dependents: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollRevision {
  id: string;
  tenantSlug: string;
  yearMonth: string;
  description: string;
  changedBy: string;
  changedByRole: string;
  visibility: "고객사 표시" | "내부 전용";
  createdAt: string;
}

export interface ConsultingProject {
  id: string;
  tenantSlug: string;
  name: string;
  category: string;
  lead: string;
  progress: number;
  stage: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: "collecting" | "reviewing" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface QnaItem {
  id: string;
  tenantSlug: string;
  question: string;
  askerName: string;
  askerRole: string;
  answer?: string;
  answeredBy?: string;
  answeredByRole?: string;
  answerMode: string;
  status: "답변대기" | "답변중" | "완료";
  createdAt: string;
  answeredAt?: string;
}

export interface InsightPost {
  id: string;
  category: "세무 칼럼" | "노무 코멘트" | "지원금 안내" | "개정사항";
  title: string;
  content: string;
  summary: string;
  audience: "전체 공지" | "업종 맞춤" | "특정 고객사";
  authorName: string;
  authorRole: string;
  targetIndustry?: string;
  isDraft: boolean;
  publishedAt?: string;
  createdAt: string;
}

export interface CertIssueRecord {
  id: string;
  tenantSlug: string;
  certType: string;
  certTitle: string;
  source: string;
  requestedBy: string;
  status: "pending" | "processing" | "done" | "failed";
  filePath?: string;
  requestedAt: string;
  completedAt?: string;
  errorMsg?: string;
}

export interface CompanyContact {
  zone: string;
  name: string;
  title: string;
  phone: string;
  email: string;
}

export interface CompanySetupAsset {
  title: string;
  status: string;
  note: string;
  isSensitive: boolean;
}

export interface CompanyEditInfo {
  businessNo: string;
  corpNo: string;
  name: string;
  ceoName: string;
  openedAt: string;
  address: string;
  businessType: string;
  businessItem: string;
  contacts: CompanyContact[];
  setupAssets: CompanySetupAsset[];
  updatedAt: string;
}

interface PortalStoreData {
  taxFiles: TaxFile[];
  taxPayments: TaxPaymentRecord[];
  employees: PortalEmployee[];
  payrollRevisions: PayrollRevision[];
  consultingProjects: ConsultingProject[];
  qnaItems: QnaItem[];
  insightPosts: InsightPost[];
  certHistory: CertIssueRecord[];
  companyInfo: Record<string, CompanyEditInfo>;
}

declare global {
  // eslint-disable-next-line no-var
  var __portalStore: PortalStoreData | undefined;
}

function defaultStore(): PortalStoreData {
  return {
    taxFiles: [],
    taxPayments: [
      {
        id: "tp1",
        tenantSlug: "ooo-clinic",
        taxType: "원천세",
        dueDate: "매월 10일",
        status: "pending",
        sendMemo: "안녕하세요, 이번 달 원천세 납부서를 보내드립니다. 납부기한 내 처리 부탁드립니다.",
      },
      {
        id: "tp2",
        tenantSlug: "ooo-clinic",
        taxType: "부가세",
        dueDate: "2026-04-25",
        status: "pending",
        sendMemo: "1기 예정 부가세 납부서를 송부합니다. 내용 확인 후 납부 부탁드립니다.",
      },
      {
        id: "tp3",
        tenantSlug: "ooo-clinic",
        taxType: "종합소득세",
        dueDate: "2026-05-31",
        status: "pending",
        sendMemo: "종합소득세 신고 및 납부 안내드립니다.",
      },
    ],
    employees: [
      {
        id: "pe1",
        tenantSlug: "ooo-clinic",
        name: "홍길동",
        employmentType: "regular",
        baseSalary: 3200000,
        joinedAt: "2025-03-01",
        status: "active",
        position: "간호사",
        department: "진료지원",
        dependents: "배우자 1 / 자녀 1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "pe2",
        tenantSlug: "ooo-clinic",
        name: "김민수",
        employmentType: "regular",
        baseSalary: 4500000,
        joinedAt: "2024-06-10",
        status: "active",
        position: "원무팀장",
        department: "원무과",
        dependents: "배우자 1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "pe3",
        tenantSlug: "ooo-clinic",
        name: "이영희",
        employmentType: "freelance",
        baseSalary: 2100000,
        joinedAt: "2026-01-15",
        status: "active",
        position: "회계담당",
        department: "총무팀",
        dependents: "-",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    payrollRevisions: [
      {
        id: "pr1",
        tenantSlug: "ooo-clinic",
        yearMonth: "2026-03",
        description: "김민수 보수월액 조정 (450만원)",
        changedBy: "이세무",
        changedByRole: "세무사",
        visibility: "고객사 표시",
        createdAt: new Date().toISOString(),
      },
      {
        id: "pr2",
        tenantSlug: "ooo-clinic",
        yearMonth: "2026-03",
        description: "홍길동 부양가족 1인 추가",
        changedBy: "정인사",
        changedByRole: "고객사 직원",
        visibility: "고객사 표시",
        createdAt: new Date().toISOString(),
      },
    ],
    consultingProjects: [
      {
        id: "cp1",
        tenantSlug: "ooo-clinic",
        name: "사내근로복지기금 설계",
        category: "노무 컨설팅",
        lead: "김노무",
        progress: 72,
        stage: "자료수집 완료 / 초안 검토중",
        description: "사내근로복지기금 설립을 통한 세무 절세와 복지 강화",
        startDate: "2026-01-10",
        status: "reviewing",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cp2",
        tenantSlug: "ooo-clinic",
        name: "정관 컨설팅",
        category: "세무 컨설팅",
        lead: "이세무",
        progress: 48,
        stage: "기초자료 접수 / 리스크 진단",
        description: "법인 정관 검토 및 개정을 통한 경영구조 최적화",
        startDate: "2026-02-01",
        status: "collecting",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    qnaItems: [
      {
        id: "qa1",
        tenantSlug: "ooo-clinic",
        question: "신규 입사자 정보를 넣으면 근로계약서도 자동으로 만들 수 있나요?",
        askerName: "정인사",
        askerRole: "고객사 직원",
        answerMode: "챗봇 초안 + 노무사 검수",
        status: "답변중",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "qa2",
        tenantSlug: "ooo-clinic",
        question: "원천세 납부서를 고객사 직원도 볼 수 있게 할지 조정 가능한가요?",
        askerName: "박대표",
        askerRole: "고객사 대표",
        answer: "네, 포털 권한 설정에서 납부서 열람 범위를 역할별로 조정하실 수 있습니다.",
        answeredBy: "이세무",
        answeredByRole: "세무사",
        answerMode: "권한 설정 가이드",
        status: "완료",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        answeredAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
    ],
    insightPosts: [
      {
        id: "ip1",
        category: "세무 칼럼",
        title: "접대비 처리에서 대표님이 자주 놓치는 구분 기준",
        content: "실무에서 비용 인정이 갈리는 사례를 업종별로 정리합니다.\n\n1. 접대비와 복리후생비의 경계\n2. 증빙 기준 (법인카드 필수 여부)\n3. 한도 계산 방법",
        summary: "실무에서 비용 인정이 갈리는 사례를 업종별로 정리합니다.",
        audience: "전체 공지",
        authorName: "이세무",
        authorRole: "세무사",
        isDraft: false,
        publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: "ip2",
        category: "노무 코멘트",
        title: "10인 이상 사업장 취업규칙 체크포인트",
        content: "근로계약, 취업규칙, 전자서명 흐름을 함께 점검합니다.",
        summary: "근로계약, 취업규칙, 전자서명 흐름을 함께 점검합니다.",
        audience: "전체 공지",
        authorName: "김노무",
        authorRole: "노무사",
        isDraft: false,
        publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
    ],
    certHistory: [],
    companyInfo: {
      "ooo-clinic": {
        businessNo: "198-86-01580",
        corpNo: "110111-1234567",
        name: "OOO의원",
        ceoName: "박대표",
        openedAt: "2021-06-17",
        address: "서울 중구 세종대로 110",
        businessType: "보건업",
        businessItem: "의원",
        contacts: [
          { zone: "고객사 대표", name: "박대표", title: "대표이사", phone: "010-3333-3333", email: "owner@clinic.com" },
          { zone: "고객사 실무", name: "정인사", title: "인사담당", phone: "010-4444-4444", email: "hr@clinic.com" },
          { zone: "세무 담당", name: "이세무", title: "담당 세무사", phone: "010-1111-1111", email: "tax@firm.com" },
          { zone: "노무 담당", name: "김노무", title: "담당 노무사", phone: "010-2222-2222", email: "labor@firm.com" },
        ],
        setupAssets: [
          { title: "사업용계좌", status: "업로드 완료", note: "농협 302-1234-5678-91", isSensitive: false },
          { title: "사업용 신용카드", status: "검토 필요", note: "법인카드 2건 등록", isSensitive: false },
          { title: "홈택스 ID", status: "보안 보관", note: "htax_ooo_clinic", isSensitive: true },
          { title: "공동인증서", status: "만료 32일 전", note: "갱신 알림 예약됨", isSensitive: true },
        ],
        updatedAt: new Date().toISOString(),
      },
    },
  };
}

function getStore(): PortalStoreData {
  if (!globalThis.__portalStore) {
    globalThis.__portalStore = defaultStore();
  }
  return globalThis.__portalStore;
}

// ─── Tax Files ───────────────────────────────────────────────────────────────
export const portalStore = {
  getTaxFiles: (tenantSlug: string) =>
    getStore().taxFiles.filter((f) => f.tenantSlug === tenantSlug),

  addTaxFile: (file: TaxFile) => {
    getStore().taxFiles.push(file);
    return file;
  },

  updateTaxFileReview: (id: string, status: TaxFile["reviewStatus"], reviewedBy: string) => {
    const store = getStore();
    const file = store.taxFiles.find((f) => f.id === id);
    if (file) {
      file.reviewStatus = status;
      file.reviewedBy = reviewedBy;
      file.reviewedAt = new Date().toISOString();
    }
    return file;
  },

  deleteTaxFile: (id: string) => {
    const store = getStore();
    const idx = store.taxFiles.findIndex((f) => f.id === id);
    if (idx >= 0) store.taxFiles.splice(idx, 1);
  },

  // ─── Tax Payments ─────────────────────────────────────────────────────────
  getTaxPayments: (tenantSlug: string) =>
    getStore().taxPayments.filter((p) => p.tenantSlug === tenantSlug),

  updateTaxPayment: (id: string, updates: Partial<TaxPaymentRecord>) => {
    const store = getStore();
    const rec = store.taxPayments.find((p) => p.id === id);
    if (rec) Object.assign(rec, updates);
    return rec;
  },

  addTaxPayment: (rec: TaxPaymentRecord) => {
    getStore().taxPayments.push(rec);
    return rec;
  },

  // ─── Employees ────────────────────────────────────────────────────────────
  getEmployees: (tenantSlug: string) =>
    getStore().employees.filter((e) => e.tenantSlug === tenantSlug),

  addEmployee: (emp: PortalEmployee) => {
    getStore().employees.push(emp);
    return emp;
  },

  updateEmployee: (id: string, updates: Partial<PortalEmployee>) => {
    const store = getStore();
    const emp = store.employees.find((e) => e.id === id);
    if (emp) Object.assign(emp, { ...updates, updatedAt: new Date().toISOString() });
    return emp;
  },

  deleteEmployee: (id: string) => {
    const store = getStore();
    const idx = store.employees.findIndex((e) => e.id === id);
    if (idx >= 0) store.employees.splice(idx, 1);
  },

  // ─── Payroll Revisions ────────────────────────────────────────────────────
  getPayrollRevisions: (tenantSlug: string) =>
    getStore().payrollRevisions.filter((r) => r.tenantSlug === tenantSlug),

  addPayrollRevision: (rev: PayrollRevision) => {
    getStore().payrollRevisions.unshift(rev);
    return rev;
  },

  // ─── Consulting ───────────────────────────────────────────────────────────
  getConsultingProjects: (tenantSlug: string) =>
    getStore().consultingProjects.filter((p) => p.tenantSlug === tenantSlug),

  addConsultingProject: (proj: ConsultingProject) => {
    getStore().consultingProjects.push(proj);
    return proj;
  },

  updateConsultingProject: (id: string, updates: Partial<ConsultingProject>) => {
    const store = getStore();
    const proj = store.consultingProjects.find((p) => p.id === id);
    if (proj) Object.assign(proj, { ...updates, updatedAt: new Date().toISOString() });
    return proj;
  },

  deleteConsultingProject: (id: string) => {
    const store = getStore();
    const idx = store.consultingProjects.findIndex((p) => p.id === id);
    if (idx >= 0) store.consultingProjects.splice(idx, 1);
  },

  // ─── Q&A ──────────────────────────────────────────────────────────────────
  getQnaItems: (tenantSlug: string) =>
    getStore().qnaItems.filter((q) => q.tenantSlug === tenantSlug),

  addQnaItem: (item: QnaItem) => {
    getStore().qnaItems.unshift(item);
    return item;
  },

  updateQnaItem: (id: string, updates: Partial<QnaItem>) => {
    const store = getStore();
    const item = store.qnaItems.find((q) => q.id === id);
    if (item) Object.assign(item, updates);
    return item;
  },

  // ─── Insights ─────────────────────────────────────────────────────────────
  getInsightPosts: () =>
    getStore().insightPosts.filter((p) => !p.isDraft),

  getAllInsightPosts: () => getStore().insightPosts,

  addInsightPost: (post: InsightPost) => {
    getStore().insightPosts.unshift(post);
    return post;
  },

  updateInsightPost: (id: string, updates: Partial<InsightPost>) => {
    const store = getStore();
    const post = store.insightPosts.find((p) => p.id === id);
    if (post) Object.assign(post, updates);
    return post;
  },

  deleteInsightPost: (id: string) => {
    const store = getStore();
    const idx = store.insightPosts.findIndex((p) => p.id === id);
    if (idx >= 0) store.insightPosts.splice(idx, 1);
  },

  // ─── Cert History ─────────────────────────────────────────────────────────
  getCertHistory: (tenantSlug: string) =>
    getStore().certHistory.filter((c) => c.tenantSlug === tenantSlug),

  addCertRecord: (rec: CertIssueRecord) => {
    getStore().certHistory.unshift(rec);
    return rec;
  },

  updateCertRecord: (id: string, updates: Partial<CertIssueRecord>) => {
    const store = getStore();
    const rec = store.certHistory.find((c) => c.id === id);
    if (rec) Object.assign(rec, updates);
    return rec;
  },

  // ─── Company Info ─────────────────────────────────────────────────────────
  getCompanyInfo: (tenantSlug: string): CompanyEditInfo | undefined =>
    getStore().companyInfo[tenantSlug],

  updateCompanyInfo: (tenantSlug: string, updates: Partial<CompanyEditInfo>) => {
    const store = getStore();
    if (store.companyInfo[tenantSlug]) {
      Object.assign(store.companyInfo[tenantSlug], { ...updates, updatedAt: new Date().toISOString() });
    } else {
      store.companyInfo[tenantSlug] = { ...updates, updatedAt: new Date().toISOString() } as CompanyEditInfo;
    }
    return store.companyInfo[tenantSlug];
  },
};
