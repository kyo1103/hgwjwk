"use client";

import { useMemo, useState } from "react";
import styles from "@/components/erp/wemembers.module.css";
import {
  healthDetailRows,
  insuranceRows,
  pensionDetailRows,
} from "@/lib/wemembers-data";

type DetailModal = "health" | "pension" | "employment" | null;

function formatNumber(value: number) {
  return value.toLocaleString("ko-KR");
}

function DetailModalView({
  type,
  onClose,
}: {
  type: Exclude<DetailModal, null>;
  onClose: () => void;
}) {
  const titleMap = {
    health: "건강·요양보험 상세조회",
    pension: "국민연금 상세조회",
    employment: "고용보험 상세조회",
  } as const;

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.modalCard} ${styles.modalWide}`}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>{titleMap[type]}</div>
          <button className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.pageMeta}>유니온테크 주식회사, 2026년 02월</div>

          {type === "pension" ? (
            <>
              <div className={styles.subHeading}>· 가입자내역</div>
              <div className={styles.tableShell}>
                <div className={styles.tableScroll}>
                  <table className={styles.denseTable}>
                    <thead>
                      <tr>
                        <th>성명</th>
                        <th>주민(외국인)등록번호</th>
                        <th>기준소득월액</th>
                        <th>연금보험료</th>
                        <th>근로자기여금</th>
                        <th>사용자부담금</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pensionDetailRows.map((row) => (
                        <tr key={row.name}>
                          <td>{row.name}</td>
                          <td>{row.registrationNo}</td>
                          <td>{formatNumber(row.incomeBase)}</td>
                          <td>{formatNumber(row.premium)}</td>
                          <td className={styles.amountBlue}>{formatNumber(row.employeeShare)}</td>
                          <td>{formatNumber(row.employerShare)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}

          {type === "health" ? (
            <>
              <div className={styles.subHeading}>· 건강보험</div>
              <div className={styles.tableShell}>
                <div className={styles.tableScroll}>
                  <table className={styles.denseTable}>
                    <thead>
                      <tr>
                        <th>성명</th>
                        <th>주민등록번호</th>
                        <th>보수월액</th>
                        <th>건강보험료</th>
                        <th>요양보험료</th>
                        <th>총계(건강+요양)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {healthDetailRows.map((row) => (
                        <tr key={row.name}>
                          <td>{row.name}</td>
                          <td>{row.registrationNo}</td>
                          <td>{formatNumber(row.salaryBase)}</td>
                          <td className={styles.amountBlue}>{formatNumber(row.healthPremium)}</td>
                          <td className={styles.amountBlue}>{formatNumber(row.carePremium)}</td>
                          <td>{formatNumber(row.totalPremium)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}

          {type === "employment" ? (
            <>
              <div className={styles.subHeading}>· 고용보험</div>
              <div className={styles.tableShell} style={{ marginBottom: 18 }}>
                <div className={styles.tableScroll}>
                  <table className={styles.denseTable}>
                    <thead>
                      <tr>
                        <th>근로자구분</th>
                        <th>근로자명</th>
                        <th>생년월일</th>
                        <th>고용일</th>
                        <th>고용종료일</th>
                        <th>휴직자월평</th>
                        <th>구분</th>
                        <th>월평균보수</th>
                        <th>보험료합계</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={9} className={styles.emptyState}>
                          조회된 내역이 없습니다.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.subHeading}>· 고용지원금</div>
              <div className={styles.tableShell} style={{ marginBottom: 18 }}>
                <div className={styles.tableScroll}>
                  <table className={styles.denseTable}>
                    <thead>
                      <tr>
                        <th>근로자명</th>
                        <th>생년월일</th>
                        <th>보험년월</th>
                        <th>월평균 보수액</th>
                        <th>실업급여 보험료</th>
                        <th>고안직능 보험료</th>
                        <th>지원금구분</th>
                        <th>지원연월</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={8} className={styles.emptyState}>
                          조회된 내역이 없습니다.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.subHeading}>· 산재보험</div>
              <div className={styles.tableShell}>
                <div className={styles.tableScroll}>
                  <table className={styles.denseTable}>
                    <thead>
                      <tr>
                        <th>근로자구분</th>
                        <th>근로자명</th>
                        <th>생년월일</th>
                        <th>고용일</th>
                        <th>고용종료일</th>
                        <th>휴직자월평</th>
                        <th>월평균보수</th>
                        <th>보험료합계</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={8} className={styles.emptyState}>
                          조회된 내역이 없습니다.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ERPDashboard() {
  const [detailModal, setDetailModal] = useState<DetailModal>(null);
  const [activeMonth, setActiveMonth] = useState("02월");

  const totals = useMemo(() => {
    return insuranceRows.reduce(
      (acc, row) => {
        acc.pension += row.pensionCalc;
        acc.support += row.pensionSupport;
        acc.pensionTotal += row.pensionTotal;
        acc.health += row.healthCalc;
        acc.care += row.careCalc;
        acc.healthTotal += row.healthTotal;
        return acc;
      },
      {
        pension: 0,
        support: 0,
        pensionTotal: 0,
        health: 0,
        care: 0,
        healthTotal: 0,
      },
    );
  }, []);

  return (
    <>
      <div className={styles.pageSurface}>
        <div className={styles.pageHeader}>
          <div>
            <div className={styles.pageTitle}>유니온테크 주식회사</div>
            <div className={styles.pageMeta}>전체 거래처 (최대 1개월)</div>
          </div>

          <div className={styles.noticeStrip}>
            <div className={styles.toggleTiny}>OFF</div>
            <div className={styles.detailButtons}>
              <button className={styles.detailButton} onClick={() => setDetailModal("health")}>
                건강·요양보험 상세조회
              </button>
              <button className={styles.detailButton} onClick={() => setDetailModal("pension")}>
                국민연금 상세조회
              </button>
              <button className={styles.detailButton} onClick={() => setDetailModal("employment")}>
                고용보험 상세조회
              </button>
              <button className={`${styles.detailButton} ${styles.excelButton}`}>엑셀</button>
            </div>
          </div>
        </div>

        <div className={styles.checkboxRow}>
          <div className={styles.inlineFilter}>
            <label>고지월</label>
          </div>
          {["01월", "02월", "03월", "04월", "05월", "06월", "07월", "08월", "09월", "10월", "11월", "12월"].map(
            (month) => (
              <label key={month} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={activeMonth === month}
                  onChange={() => setActiveMonth(month)}
                />
                {month}
              </label>
            ),
          )}
        </div>

        <div className={styles.tableShell}>
          <div className={styles.tableScroll}>
            <table className={styles.denseTable}>
              <thead>
                <tr>
                  <th>상호</th>
                  <th>사업자번호</th>
                  <th>고지년월</th>
                  <th>성명</th>
                  <th>생년월일</th>
                  <th>연금산출분</th>
                  <th>연금소급분</th>
                  <th>연금지원분</th>
                  <th>국민연금합계</th>
                  <th>건강산출분</th>
                  <th>요양보험</th>
                  <th>총계(건강+요양)</th>
                </tr>
              </thead>
              <tbody>
                {insuranceRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.company}</td>
                    <td>{row.bizNo}</td>
                    <td>{row.noticeYm}</td>
                    <td>{row.name}</td>
                    <td>{row.birth}</td>
                    <td>{formatNumber(row.pensionCalc)}</td>
                    <td>0</td>
                    <td className={styles.amountRed}>{formatNumber(row.pensionSupport)}</td>
                    <td>{formatNumber(row.pensionTotal)}</td>
                    <td>{formatNumber(row.healthCalc)}</td>
                    <td>{formatNumber(row.careCalc)}</td>
                    <td>{formatNumber(row.healthTotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5}>합계</td>
                  <td>{formatNumber(totals.pension)}</td>
                  <td>157,360</td>
                  <td>0</td>
                  <td>{formatNumber(totals.pensionTotal + 157360)}</td>
                  <td>{formatNumber(totals.health)}</td>
                  <td>{formatNumber(totals.care)}</td>
                  <td>{formatNumber(totals.healthTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className={styles.footerBar}>
          <div className={styles.footerLeft}>
            <select className={styles.rowsSelect} defaultValue="전체">
              <option value="전체">전체</option>
              <option value="50">50</option>
            </select>
          </div>
          <div className={styles.footerRight}>
            <div className={styles.pagination}>
              <button className={styles.pageArrow}>◀</button>
              <button className={styles.pageArrow}>◁</button>
              <span className={`${styles.pageNumber} ${styles.pageNumberActive}`}>1</span>
              <button className={styles.pageArrow}>▷</button>
              <button className={styles.pageArrow}>▶</button>
            </div>
          </div>
        </div>
      </div>

      {detailModal ? <DetailModalView type={detailModal} onClose={() => setDetailModal(null)} /> : null}
    </>
  );
}
