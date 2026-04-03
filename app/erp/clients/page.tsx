"use client";

import { useMemo, useState } from "react";
import styles from "@/components/erp/wemembers.module.css";
import { clientLookupRows } from "@/lib/wemembers-data";

type CompanyRow = {
  id: string;
  name: string;
  bizNo: string;
  manager: string;
  category: string;
  taxType: string;
  note: string;
  payrollDue: string;
  headcount: number;
  activeHeadcount: number;
  pendingIssues: number;
  unreadDocs: number;
  lastSync: string;
  payrollStatus: "정상" | "확인필요" | "마감임박";
};

type EmployeeRow = {
  id: string;
  name: string;
  department: string;
  position: string;
  joinedAt: string;
  annualLeave: string;
  contractStatus: "완료" | "갱신필요" | "초안";
  payslipStatus: "발행완료" | "검토중" | "미발행";
  docSummary: string;
  salary: number;
  employmentType: "정규" | "계약" | "단시간";
};

const DEPARTMENTS = ["경영지원", "운영", "영업", "생산", "물류", "매장", "개발"];
const POSITIONS = ["사원", "주임", "대리", "과장", "팀장"];
const NAMES = [
  "김민지",
  "이도윤",
  "박서준",
  "최하은",
  "정유진",
  "한지호",
  "윤채원",
  "송태윤",
  "조서현",
  "임도현",
  "오지안",
  "강수민",
];
const FILE_TAGS = [
  "4대보험 취득",
  "보수총액 신고",
  "급여변동 사유서",
  "연차사용 계획",
  "퇴직연금 자료",
  "가족수당 증빙",
];

function addMonths(baseYear: number, baseMonth: number, offset: number) {
  const total = baseMonth - 1 + offset;
  const year = baseYear + Math.floor(total / 12);
  const month = (total % 12) + 1;
  return { year, month };
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function calcAnnualLeave(joinedAt: string) {
  const joined = new Date(`${joinedAt}T00:00:00`);
  const today = new Date("2026-04-03T00:00:00");
  const monthDiff =
    (today.getFullYear() - joined.getFullYear()) * 12 +
    (today.getMonth() - joined.getMonth());

  if (monthDiff < 12) {
    return `${Math.max(0, Math.min(monthDiff + 1, 11))}일 발생`;
  }

  const years = today.getFullYear() - joined.getFullYear();
  return `${Math.min(15 + Math.max(0, years - 1), 25)}일 기준`;
}

function buildCompanies(): CompanyRow[] {
  const suffixes = ["본사", "2공장", "R&D센터", "물류센터", "서울지점", "부산지점"];

  return Array.from({ length: 240 }, (_, index) => {
    const base = clientLookupRows[index % clientLookupRows.length];
    const variant = Math.floor(index / clientLookupRows.length);
    const activeHeadcount = 8 + (index % 19);
    const extra = suffixes[variant % suffixes.length];
    const payrollStatus: CompanyRow["payrollStatus"] =
      index % 9 === 0 ? "확인필요" : index % 5 === 0 ? "마감임박" : "정상";

    return {
      id: `${base.id}-${variant + 1}`,
      name: variant === 0 ? base.name : `${base.name} ${extra}`,
      bizNo: `${base.bizNo.slice(0, 8)}${String((variant + 10) % 90).padStart(2, "0")}`,
      manager: base.manager,
      category: base.category,
      taxType: base.taxType,
      note: base.note || (index % 4 === 0 ? "급여 확정 전 검토" : "정기 운영"),
      payrollDue: `${10 + (index % 18)}일`,
      headcount: activeHeadcount + (index % 4),
      activeHeadcount,
      pendingIssues: index % 6,
      unreadDocs: (index * 2) % 7,
      lastSync: `2026-04-${String((index % 3) + 1).padStart(2, "0")} 1${index % 10}:2${index % 6}`,
      payrollStatus,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

function buildEmployees(company: CompanyRow, companyIndex: number): EmployeeRow[] {
  const count = Math.max(6, Math.min(company.activeHeadcount, 16));

  return Array.from({ length: count }, (_, index) => {
    const monthOffset = companyIndex * 3 + index * 2;
    const { year, month } = addMonths(2019, 1, monthOffset % 70);
    const joinedAt = formatDate(year, month, ((index * 5 + companyIndex) % 24) + 1);
    const contractStatus: EmployeeRow["contractStatus"] =
      index % 8 === 0 ? "갱신필요" : index % 5 === 0 ? "초안" : "완료";
    const payslipStatus: EmployeeRow["payslipStatus"] =
      index % 7 === 0 ? "검토중" : index % 4 === 0 ? "미발행" : "발행완료";
    const employmentType: EmployeeRow["employmentType"] =
      index % 6 === 0 ? "계약" : index % 5 === 0 ? "단시간" : "정규";

    return {
      id: `${company.id}-emp-${index + 1}`,
      name: NAMES[(companyIndex + index) % NAMES.length],
      department: DEPARTMENTS[(companyIndex + index * 2) % DEPARTMENTS.length],
      position: POSITIONS[(companyIndex + index) % POSITIONS.length],
      joinedAt,
      annualLeave: calcAnnualLeave(joinedAt),
      contractStatus,
      payslipStatus,
      docSummary: `${FILE_TAGS[(companyIndex + index) % FILE_TAGS.length]} 외 ${index % 3}건`,
      salary: 2400000 + ((companyIndex + index) % 10) * 180000,
      employmentType,
    };
  }).sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
}

function statusTone(status: CompanyRow["payrollStatus"]) {
  if (status === "정상") return styles.statusGood;
  if (status === "마감임박") return styles.statusWarn;
  return styles.statusBad;
}

function docTone(status: EmployeeRow["contractStatus"] | EmployeeRow["payslipStatus"]) {
  if (status === "완료" || status === "발행완료") return styles.statusGood;
  if (status === "검토중" || status === "초안") return styles.statusWarn;
  return styles.statusBad;
}

export default function ClientsPage() {
  const companies = useMemo(() => buildCompanies(), []);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(companies[0]?.id ?? "");
  const [statusFilter, setStatusFilter] = useState<"전체" | CompanyRow["payrollStatus"]>("전체");

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();
    return companies.filter((company) => {
      const matchesQuery =
        !query ||
        company.name.toLowerCase().includes(query) ||
        company.bizNo.includes(query) ||
        company.manager.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "전체" || company.payrollStatus === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [companies, search, statusFilter]);

  const selectedCompany =
    filteredCompanies.find((company) => company.id === selectedId) ??
    companies.find((company) => company.id === selectedId) ??
    filteredCompanies[0] ??
    companies[0];

  const selectedIndex = companies.findIndex((company) => company.id === selectedCompany?.id);
  const employees = useMemo(
    () => (selectedCompany ? buildEmployees(selectedCompany, Math.max(selectedIndex, 0)) : []),
    [selectedCompany, selectedIndex],
  );

  const summary = useMemo(() => {
    const totalEmployees = companies.reduce((sum, company) => sum + company.activeHeadcount, 0);
    const warningCompanies = companies.filter((company) => company.payrollStatus !== "정상").length;
    const pendingDocs = companies.reduce((sum, company) => sum + company.unreadDocs, 0);
    return { totalEmployees, warningCompanies, pendingDocs };
  }, [companies]);

  return (
    <div className={styles.hrWorkspace}>
      <section className={styles.hrHero}>
        <div>
          <div className={styles.hrEyebrow}>HR Operations Board</div>
          <h1 className={styles.hrTitle}>인사노무 운영실</h1>
          <p className={styles.hrDescription}>
            업체를 스크롤로 찾고 바로 클릭하면, 근로자·계약·급여명세서·증빙자료를 한 화면에서 이어서 관리할 수 있도록 재구성했습니다.
          </p>
        </div>

        <div className={styles.hrHeroMetrics}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>관리 업체</span>
            <strong className={styles.metricValue}>{companies.length}</strong>
            <span className={styles.metricHint}>세로 목록 스크롤 최적화</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>재직 근로자</span>
            <strong className={styles.metricValue}>{summary.totalEmployees.toLocaleString()}</strong>
            <span className={styles.metricHint}>입사일 기준 자동 정렬</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>확인 필요 업체</span>
            <strong className={styles.metricValue}>{summary.warningCompanies}</strong>
            <span className={styles.metricHint}>마감·계약·급여 누락 감지</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>미확인 자료</span>
            <strong className={styles.metricValue}>{summary.pendingDocs}</strong>
            <span className={styles.metricHint}>자료함·명세서·증빙 합산</span>
          </div>
        </div>
      </section>

      <div className={styles.hrBoard}>
        <aside className={styles.companyRail}>
          <div className={styles.railHeader}>
            <div>
              <div className={styles.railTitle}>업체 목록</div>
              <div className={styles.railMeta}>스크롤로 빠르게 탐색하고 바로 선택</div>
            </div>
            <button className={styles.railAction}>업체 등록</button>
          </div>

          <div className={styles.railControls}>
            <div className={styles.railSearch}>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="업체명, 사업자번호, 담당자 검색"
              />
            </div>
            <div className={styles.filterChips}>
              {(["전체", "정상", "마감임박", "확인필요"] as const).map((status) => (
                <button
                  key={status}
                  className={
                    statusFilter === status
                      ? `${styles.filterChip} ${styles.filterChipActive}`
                      : styles.filterChip
                  }
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.companyList}>
            {filteredCompanies.map((company) => {
              const isActive = company.id === selectedCompany?.id;

              return (
                <button
                  key={company.id}
                  className={
                    isActive
                      ? `${styles.companyCard} ${styles.companyCardActive}`
                      : styles.companyCard
                  }
                  onClick={() => setSelectedId(company.id)}
                >
                  <div className={styles.companyCardTop}>
                    <div>
                      <div className={styles.companyName}>{company.name}</div>
                      <div className={styles.companyBizNo}>{company.bizNo}</div>
                    </div>
                    <span className={`${styles.inlineStatus} ${statusTone(company.payrollStatus)}`}>
                      {company.payrollStatus}
                    </span>
                  </div>

                  <div className={styles.companyTags}>
                    <span>{company.category}</span>
                    <span>{company.taxType}</span>
                    <span>급여 {company.payrollDue}</span>
                  </div>

                  <div className={styles.companyCardGrid}>
                    <div>
                      <span className={styles.cardKey}>담당</span>
                      <strong>{company.manager}</strong>
                    </div>
                    <div>
                      <span className={styles.cardKey}>재직</span>
                      <strong>{company.activeHeadcount}명</strong>
                    </div>
                    <div>
                      <span className={styles.cardKey}>이슈</span>
                      <strong>{company.pendingIssues}건</strong>
                    </div>
                    <div>
                      <span className={styles.cardKey}>자료</span>
                      <strong>{company.unreadDocs}건</strong>
                    </div>
                  </div>

                  <div className={styles.companyNote}>{company.note}</div>
                </button>
              );
            })}
          </div>
        </aside>

        {selectedCompany ? (
          <section className={styles.workerPanel}>
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.panelEyebrow}>Selected Company</div>
                <h2 className={styles.panelTitle}>{selectedCompany.name}</h2>
                <div className={styles.panelMetaRow}>
                  <span>{selectedCompany.bizNo}</span>
                  <span>담당 {selectedCompany.manager}</span>
                  <span>최근 동기화 {selectedCompany.lastSync}</span>
                </div>
              </div>

              <div className={styles.panelActions}>
                <button className={styles.softButton}>급여자료 요청</button>
                <button className={styles.softButton}>계약서 업로드</button>
                <button className={styles.primaryAction}>월 마감 시작</button>
              </div>
            </div>

            <div className={styles.companySummaryGrid}>
              <div className={styles.summaryPanel}>
                <span className={styles.summaryLabel}>근로자 현황</span>
                <strong className={styles.summaryValue}>{selectedCompany.activeHeadcount}명 재직</strong>
                <span className={styles.summaryNote}>총 인원 {selectedCompany.headcount}명 기준</span>
              </div>
              <div className={styles.summaryPanel}>
                <span className={styles.summaryLabel}>급여 캘린더</span>
                <strong className={styles.summaryValue}>매월 {selectedCompany.payrollDue}</strong>
                <span className={styles.summaryNote}>자료 회신 D-{(selectedCompany.activeHeadcount % 5) + 1}</span>
              </div>
              <div className={styles.summaryPanel}>
                <span className={styles.summaryLabel}>미확인 문서</span>
                <strong className={styles.summaryValue}>{selectedCompany.unreadDocs}건</strong>
                <span className={styles.summaryNote}>계약서, 급여명세서, 증빙 포함</span>
              </div>
              <div className={styles.summaryPanel}>
                <span className={styles.summaryLabel}>실무 메모</span>
                <strong className={styles.summaryValue}>{selectedCompany.note}</strong>
                <span className={styles.summaryNote}>노션형 메모와 ERP 상태를 결합</span>
              </div>
            </div>

            <div className={styles.workerTableCard}>
              <div className={styles.workerTableHeader}>
                <div>
                  <div className={styles.workerTableTitle}>근로자 운영 테이블</div>
                  <div className={styles.workerTableMeta}>입사일자 오름차순 정렬 · 클릭 없이 한 번에 검토</div>
                </div>
                <div className={styles.tableTools}>
                  <span className={styles.tableHint}>계약/명세서 상태 색상 표시</span>
                  <button className={styles.exportButton}>엑셀 내보내기</button>
                </div>
              </div>

              <div className={styles.workerTableScroll}>
                <table className={styles.workerTable}>
                  <thead>
                    <tr>
                      <th>근로자</th>
                      <th>부서/직책</th>
                      <th>근로계약서</th>
                      <th>입사일자</th>
                      <th>연차</th>
                      <th>급여명세서</th>
                      <th>각종 자료</th>
                      <th>급여기준</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id}>
                        <td>
                          <div className={styles.employeeCell}>
                            <strong>{employee.name}</strong>
                            <span>{employee.employmentType}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.employeeCell}>
                            <strong>{employee.department}</strong>
                            <span>{employee.position}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.docCell}>
                            <span className={`${styles.inlineStatus} ${docTone(employee.contractStatus)}`}>
                              {employee.contractStatus}
                            </span>
                            <button className={styles.textAction}>열기</button>
                          </div>
                        </td>
                        <td>{employee.joinedAt}</td>
                        <td>{employee.annualLeave}</td>
                        <td>
                          <div className={styles.docCell}>
                            <span className={`${styles.inlineStatus} ${docTone(employee.payslipStatus)}`}>
                              {employee.payslipStatus}
                            </span>
                            <button className={styles.textAction}>명세</button>
                          </div>
                        </td>
                        <td>{employee.docSummary}</td>
                        <td>{employee.salary.toLocaleString()}원</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
