"use client";

import { useMemo, useState } from "react";
import styles from "@/components/erp/wemembers.module.css";
import {
  payrollFlow,
  payrollRows,
  payrollStageMenu,
  type PayrollStage,
} from "@/lib/wemembers-data";

const allStageLabel = "전체";

export default function PayrollPage() {
  const [search, setSearch] = useState("");
  const [manager, setManager] = useState("전체");
  const [group, setGroup] = useState("전체");
  const [activeStage, setActiveStage] = useState<string>(allStageLabel);
  const [menuRowId, setMenuRowId] = useState<string | null>("pay-6");

  const filteredRows = useMemo(() => {
    return payrollRows.filter((row) => {
      const matchesStage = activeStage === allStageLabel || row.stage === activeStage;
      const matchesManager = manager === "전체" || row.manager === manager;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        row.clientName.toLowerCase().includes(query) ||
        row.bizNo.includes(query) ||
        row.receiver.toLowerCase().includes(query);

      return matchesStage && matchesManager && matchesSearch;
    });
  }, [activeStage, manager, search]);

  return (
    <div className={styles.pageSurface}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>2026년 03월 신고</div>
          <div className={styles.pageMeta}>
            급여자료를 요청해야할 업체를 알려드립니다.{" "}
            <span className={styles.helpLink}>[급여요청 알림설정]</span>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <input
              className={styles.searchInput}
              placeholder="검색어를 입력하세요"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button className={styles.searchTrigger}>⌕</button>
          </div>
          <button className={styles.smallButton}>목록</button>
          <button className={`${styles.smallButton} ${styles.excelButton}`}>엑셀</button>
        </div>
      </div>

      <div className={styles.stepRow}>
        <button
          className={
            activeStage === allStageLabel
              ? `${styles.stepAll} ${styles.stepAllActive}`
              : styles.stepAll
          }
          onClick={() => setActiveStage(allStageLabel)}
        >
          전체
        </button>
        <div className={styles.stepRail}>
          {payrollFlow.map((step) => (
            <button
              key={step.key}
              className={
                activeStage === step.key
                  ? `${styles.stepItem} ${styles.stepItemActive}`
                  : styles.stepItem
              }
              onClick={() => setActiveStage(step.key)}
            >
              {step.label}
              <span className={styles.stepCount}>{step.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.filtersRow}>
        <div className={styles.inlineFilters}>
          <div className={styles.inlineFilter}>
            <label>담당자</label>
            <select
              className={styles.inlineSelect}
              value={manager}
              onChange={(event) => setManager(event.target.value)}
            >
              <option>전체</option>
              <option>이자영</option>
              <option>김수연</option>
              <option>허건우</option>
            </select>
          </div>
          <div className={styles.inlineFilter}>
            <label>그룹</label>
            <select
              className={styles.inlineSelect}
              value={group}
              onChange={(event) => setGroup(event.target.value)}
            >
              <option>전체</option>
              <option>월납</option>
              <option>반기</option>
            </select>
          </div>
        </div>

        <div className={styles.toolbar}>
          <button className={styles.smallButton}>직원별 신고현황</button>
          <button className={`${styles.smallButton} ${styles.primaryButton}`}>
            급여 거래처 관리
          </button>
        </div>
      </div>

      <div className={styles.tableShell}>
        <div className={styles.tableScroll}>
          <table className={styles.denseTable}>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <input type="checkbox" />
                </th>
                <th>거래처명</th>
                <th>사업자번호</th>
                <th>담당자</th>
                <th>급여대상</th>
                <th>보수총액신고여부</th>
                <th>급여일</th>
                <th>수신자</th>
                <th>연락처</th>
                <th>상태</th>
                <th>바로가기</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td className={styles.checkboxCell}>
                    <input type="checkbox" />
                  </td>
                  <td>{row.clientName}</td>
                  <td>{row.bizNo}</td>
                  <td>{row.manager}</td>
                  <td>
                    <div className={styles.targetGroup}>
                      {row.targets.map((target) => (
                        <span
                          key={target}
                          className={
                            target === "근로"
                              ? `${styles.targetTag} ${styles.targetTagGreen}`
                              : `${styles.targetTag} ${styles.targetTagBlue}`
                          }
                        >
                          {target}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className={styles.booleanCell}>
                    <input type="checkbox" checked={row.reported} readOnly />
                  </td>
                  <td>{row.payday}</td>
                  <td>{row.receiver}</td>
                  <td>{row.phone}</td>
                  <td style={{ position: "relative" }}>
                    <button
                      className={styles.tableLinkButton}
                      onClick={() => setMenuRowId((current) => (current === row.id ? null : row.id))}
                    >
                      {row.stage}
                    </button>

                    {menuRowId === row.id ? (
                      <div className={styles.contextMenu}>
                        {payrollStageMenu.map((stage) => (
                          <button
                            key={stage}
                            onClick={() => {
                              setMenuRowId(null);
                              setActiveStage(stage);
                            }}
                          >
                            {stage}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </td>
                  <td>
                    <div className={styles.actionRow}>
                      <button className={styles.actionChip}>4대보험</button>
                      <button className={styles.miniAction}>문</button>
                      <button className={styles.miniAction}>공</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.footerBar}>
        <div className={styles.footerLeft}>
          <select className={styles.rowsSelect} defaultValue="50">
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <div className={styles.footerRight}>
          <div className={styles.pagination}>
            <button className={styles.pageArrow}>◀</button>
            <button className={styles.pageArrow}>◁</button>
            <span className={`${styles.pageNumber} ${styles.pageNumberActive}`}>1</span>
            <span className={styles.pageNumber}>2</span>
            <span className={styles.pageNumber}>3</span>
            <button className={styles.pageArrow}>▷</button>
            <button className={styles.pageArrow}>▶</button>
          </div>
          <div className={styles.noteText}>거래처 건수 : 118건</div>
        </div>
      </div>
    </div>
  );
}
