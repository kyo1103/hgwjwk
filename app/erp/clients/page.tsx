"use client";

import { useMemo, useState } from "react";
import styles from "@/components/erp/wemembers.module.css";
import {
  certificateSections,
  clientLookupRows,
} from "@/lib/wemembers-data";

function CertificateModal({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>민원증명 발급</div>
          <div className={styles.modalHeaderTools}>
            <label>
              <input type="radio" name="ownerType" defaultChecked /> 인증서
            </label>
            <label>
              <input type="radio" name="ownerType" /> 부서사용자
            </label>
            <button className={styles.modalClose} onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          {certificateSections.map((section) => (
            <div key={section.title}>
              <div className={styles.modalSectionHeading}>
                <div className={styles.modalSectionTitle}>{section.title}</div>
                {section.title === "홈택스" ? (
                  <div className={styles.toolbar}>
                    <button className={styles.smallButton}>홈택스 업무설정</button>
                    <button className={styles.smallButton}>이력조회</button>
                  </div>
                ) : null}
              </div>

              <div className={styles.modalOptionList}>
                {section.options.map((option) => (
                  <div key={option} className={styles.modalOptionRow}>
                    <span>{option}</span>
                    <span className={styles.toggleOff}>OFF</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className={styles.modalFooter}>
            <button className={styles.modalPrimaryButton}>민원증명 신청</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("기본");
  const [showModal, setShowModal] = useState(true);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return clientLookupRows.filter((row) => {
      if (!query) return true;
      return (
        row.name.toLowerCase().includes(query) ||
        row.bizNo.includes(query) ||
        row.manager.toLowerCase().includes(query)
      );
    });
  }, [search]);

  return (
    <>
      <div className={styles.pageSurface}>
        <div className={styles.pageHeader}>
          <div>
            <div className={styles.pageTitle}>거래처 조회</div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <input
                className={styles.searchInput}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="검색"
              />
              <button className={styles.searchTrigger}>⌕</button>
            </div>
            <button className={`${styles.smallButton} ${styles.excelButton}`}>자료 다운로드</button>
            <button className={`${styles.smallButton} ${styles.primaryButton}`}>거래처 등록</button>
          </div>
        </div>

        <div className={styles.tabsRow}>
          {["기본", "홈택스", "기장대리", "신고대리"].map((tab) => (
            <button
              key={tab}
              className={
                activeTab === tab
                  ? `${styles.roundedTab} ${styles.roundedTabActive}`
                  : styles.roundedTab
              }
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={styles.checkboxRow}>
          <label className={styles.checkboxItem}>
            <input type="checkbox" />
            우측 탭 숨기기
          </label>
          <label className={styles.checkboxItem}>
            <input type="checkbox" />
            주민등록번호/비밀번호 전체표시
          </label>
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
                  <th>특이사항</th>
                  <th>주민등록번호</th>
                  <th>구분</th>
                  <th>과세유형</th>
                  <th>업무</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td className={styles.checkboxCell}>
                      <input type="checkbox" />
                    </td>
                    <td>{row.name}</td>
                    <td>{row.bizNo}</td>
                    <td className={styles.valueLink}>{row.manager}</td>
                    <td>{row.note || "-"}</td>
                    <td>{row.residentMasked}</td>
                    <td>{row.category}</td>
                    <td>{row.taxType}</td>
                    <td>
                      <div className={styles.actionRow}>
                        <button className={styles.actionChip} onClick={() => setShowModal(true)}>
                          민원증명
                        </button>
                        <button className={styles.actionChip}>카드추가</button>
                        <button className={styles.actionChip}>계좌추가</button>
                        <button className={`${styles.actionChip} ${styles.actionChipMuted}`}>발달매출</button>
                        <button className={styles.miniAction}>문</button>
                        <button className={styles.miniAction}>전</button>
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
            <div className={styles.noteText}>
              ※ 체크박스를 클릭 하시면 담당자, 그룹지정 및 홈택스 업데이트를 할 수 있습니다.
            </div>
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
              <button className={styles.pageArrow}>▷</button>
              <button className={styles.pageArrow}>▶</button>
            </div>
          </div>
        </div>
      </div>

      {showModal ? <CertificateModal onClose={() => setShowModal(false)} /> : null}
    </>
  );
}
