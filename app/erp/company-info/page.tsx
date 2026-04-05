"use client";

import { useState, useCallback } from "react";

/* ─────────────────────────── Mock Data ─────────────────────────── */

type ClientManager = {
  name: string;
  position: string;
  role: string;
  contact: string;
  email: string;
};

type BankAccount = {
  bank: string;
  accountNo: string;
};

type CompanyInfo = {
  id: string;
  type: "법인" | "개인";
  name: string;
  bizNo: string;
  corpNo?: string;
  ceo: string;
  openDate: string;
  address: string;
  bizItem: string; // 업태
  bizCategory: string; // 종목
  taxpayerType: string;
  status: "정상" | "휴업" | "폐업";
  internalManager: string;
  internalRole: string;
  clientManagers: ClientManager[];
  bankAccounts: BankAccount[];
  hometaxId: string;
};

const MOCK_DATA: CompanyInfo[] = [
  {
    id: "c-1",
    type: "법인",
    name: "유니온테크 주식회사",
    bizNo: "198-86-01580",
    corpNo: "110111-2345678",
    ceo: "고성훈",
    openDate: "2018-05-12",
    address: "서울시 강남구 테헤란로 123 유니온빌딩 5층",
    bizItem: "제조업",
    bizCategory: "소프트웨어 개발",
    taxpayerType: "일반과세자",
    status: "정상",
    internalManager: "김세무",
    internalRole: "파트너",
    clientManagers: [
      { name: "이자영", position: "재무이사", role: "총괄결재", contact: "010-1234-5678", email: "finance@union.com" },
      { name: "홍길동", position: "대리", role: "급여/4대보험", contact: "010-9876-5432", email: "hr@union.com" }
    ],
    bankAccounts: [{ bank: "국민은행", accountNo: "912345-01-678901" }],
    hometaxId: "union_hometax"
  },
  {
    id: "c-2",
    type: "법인",
    name: "(주)데이터솔루션",
    bizNo: "234-56-78901",
    corpNo: "130122-8765432",
    ceo: "이도진",
    openDate: "2020-03-01",
    address: "경기도 성남시 분당구 판교역로 100",
    bizItem: "정보통신업",
    bizCategory: "IT컨설팅",
    taxpayerType: "일반과세자",
    status: "정상",
    internalManager: "이세무",
    internalRole: "실무담당자",
    clientManagers: [
      { name: "이세훈", position: "대표이사", role: "총괄결재", contact: "010-1111-2222", email: "ceo@datasolution.com" }
    ],
    bankAccounts: [{ bank: "신한은행", accountNo: "110-234-567890" }],
    hometaxId: "datasol_tax"
  },
  {
    id: "c-3",
    type: "법인",
    name: "스타트업 홀딩스",
    bizNo: "567-89-01234",
    corpNo: "120333-1212121",
    ceo: "최지민",
    openDate: "2021-11-11",
    address: "서울시 마포구 양화로 45",
    bizItem: "서비스업",
    bizCategory: "경영컨설팅",
    taxpayerType: "일반과세자",
    status: "정상",
    internalManager: "김노무",
    internalRole: "파트너",
    clientManagers: [
      { name: "최지민", position: "대표이사", role: "총괄", contact: "010-3333-4444", email: "jimin@startup.com" }
    ],
    bankAccounts: [{ bank: "하나은행", accountNo: "123-456789-01205" }],
    hometaxId: "startupholdings"
  },
  {
    id: "c-4",
    type: "개인",
    name: "코스모스 카페",
    bizNo: "345-67-89012",
    ceo: "박주인",
    openDate: "2022-07-20",
    address: "서울시 종로구 삼청로 10",
    bizItem: "음식점업",
    bizCategory: "커피전문점",
    taxpayerType: "간이과세자",
    status: "정상",
    internalManager: "이세무",
    internalRole: "실무담당자",
    clientManagers: [
      { name: "박주인", position: "대표", role: "총괄", contact: "010-5555-6666", email: "owner@cosmos.com" }
    ],
    bankAccounts: [{ bank: "우리은행", accountNo: "1002-345-678901" }],
    hometaxId: "cosmos_cafe"
  },
  {
    id: "c-5",
    type: "개인",
    name: "장수치킨맥주 경성대점",
    bizNo: "549-01-03630",
    ceo: "김수연",
    openDate: "2015-08-15",
    address: "부산광역시 남구 용소로 14",
    bizItem: "음식점업",
    bizCategory: "한식",
    taxpayerType: "간이과세자",
    status: "휴업",
    internalManager: "정대리",
    internalRole: "실무보조",
    clientManagers: [
      { name: "김수연", position: "대표", role: "총괄", contact: "010-7777-8888", email: "jangsu@chicken.com" }
    ],
    bankAccounts: [{ bank: "기업은행", accountNo: "010-1234-5678" }],
    hometaxId: "jangsu_chicken"
  }
];

/* ─────────────────────────── UI Components ─────────────────────────── */

function CopyField({ label, value }: { label: string; value?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>{label}</label>
      <div style={{ 
        display: "flex", alignItems: "center", background: "#f8fafc", 
        border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden" 
      }}>
        <input 
          type="text" 
          value={value ?? ""} 
          readOnly 
          style={{
            flex: 1, padding: "10px 14px", fontSize: "0.85rem",
            background: "transparent", border: "none", outline: "none", color: "#0f172a"
          }}
        />
        <button 
          onClick={handleCopy}
          title="클립보드에 복사"
          style={{
            background: copied ? "#dcfce7" : "transparent",
            color: copied ? "#166534" : "#64748b",
            border: "none", borderLeft: "1px solid #cbd5e1",
            padding: "0 12px", height: "100%", cursor: "pointer",
            fontSize: "1rem", transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >
          {copied ? "✓" : "📋"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{
      marginBottom: "24px", padding: "24px 28px",
      border: "1px solid #e2e8f0", borderRadius: "14px",
      background: "#fff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    }}>
      <h2 style={{
        fontSize: "1.05rem", fontWeight: 800, color: "#0f172a",
        marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px"
      }}>
        <div style={{ width: "4px", height: "16px", background: "#2563eb", borderRadius: "2px" }} />
        {title}
      </h2>
      {children}
    </div>
  );
}

/* ─────────────────────────── Main Page ─────────────────────────── */

export default function CompanyInfoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId ? MOCK_DATA.find(c => c.id === selectedId) : null;

  return (
    <div style={{ padding: "32px 40px", maxWidth: "1600px", margin: "0 auto", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      
      {/* ─── 페이지 타이틀 ─── */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "6px" }}>
          업체 기본정보
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
          기장 대리 및 노무 자문을 수행하는 고객사의 기본 정보를 조회하고 복사할 수 있습니다.
        </p>
      </div>

      {/* ─── 상단: 업체 목록 그리드/테이블 ─── */}
      <div style={{
        background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0",
        overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        marginBottom: "36px"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ padding: "14px 20px", textAlign: "left", color: "#475569", fontWeight: 800 }}>상호</th>
              <th style={{ padding: "14px 20px", textAlign: "left", color: "#475569", fontWeight: 800 }}>사업자번호</th>
              <th style={{ padding: "14px 20px", textAlign: "center", color: "#475569", fontWeight: 800 }}>구분</th>
              <th style={{ padding: "14px 20px", textAlign: "center", color: "#475569", fontWeight: 800 }}>대표자명</th>
              <th style={{ padding: "14px 20px", textAlign: "left", color: "#475569", fontWeight: 800 }}>업태 / 종목</th>
              <th style={{ padding: "14px 20px", textAlign: "center", color: "#475569", fontWeight: 800 }}>담당자</th>
              <th style={{ padding: "14px 20px", textAlign: "center", color: "#475569", fontWeight: 800 }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DATA.map((company, i) => {
              const isSelected = selectedId === company.id;
              const isCorp = company.type === "법인";
              const statusColor = company.status === "정상" ? "#22c55e" : company.status === "휴업" ? "#eab308" : "#ef4444";
              
              return (
                <tr 
                  key={company.id} 
                  onClick={() => setSelectedId(company.id)}
                  style={{ 
                    borderBottom: "1px solid #f1f5f9", 
                    cursor: "pointer",
                    background: isSelected ? "#eff6ff" : (i % 2 === 0 ? "#fff" : "#fafbfc"),
                    transition: "background 0.2s"
                  }}
                >
                  <td style={{ padding: "14px 20px", fontWeight: isSelected ? 800 : 600, color: isSelected ? "#2563eb" : "#0f172a" }}>
                     {company.name}
                  </td>
                  <td style={{ padding: "14px 20px", color: "#475569", fontFamily: "monospace", fontSize: "0.9rem" }}>
                    {company.bizNo}
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "center" }}>
                    <span style={{ 
                      background: isCorp ? "#e0e7ff" : "#fce7f3", 
                      color: isCorp ? "#4f46e5" : "#db2777", 
                      padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 
                    }}>
                      {company.type}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "center", fontWeight: 600 }}>{company.ceo}</td>
                  <td style={{ padding: "14px 20px", color: "#64748b" }}>{company.bizItem} / {company.bizCategory}</td>
                  <td style={{ padding: "14px 20px", textAlign: "center" }}>
                    <span style={{ color: "#334155", fontWeight: 600 }}>{company.internalManager}</span> 
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8", marginLeft: "4px" }}>({company.internalRole})</span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: statusColor }}></div>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: statusColor }}>{company.status}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── 하단: 상세 정보 ─── */}
      {selected ? (
        <div style={{ 
          animation: "fadeIn 0.3s ease-in-out",
          display: "flex", flexDirection: "column", gap: "6px"
        }}>
          
          {/* Section A: 사업자 기본정보 */}
          <Section id="sec-a" title="A. 사업자 기본정보">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px 24px", marginBottom: "10px" }}>
              <CopyField label="사업자등록번호" value={selected.bizNo} />
              {selected.type === "법인" && <CopyField label="법인등록번호" value={selected.corpNo} />}
              <CopyField label="상호(법인명)" value={selected.name} />
              <CopyField label="대표자 성명" value={selected.ceo} />
              <CopyField label="개업연월일" value={selected.openDate} />
              <CopyField label="사업장 소재지" value={selected.address} />
              <CopyField label="업태" value={selected.bizItem} />
              <CopyField label="종목" value={selected.bizCategory} />
              <CopyField label="사업자 유형" value={selected.taxpayerType} />
            </div>
          </Section>

          {/* Section B: 담당자 정보 */}
          <Section id="sec-b" title="B. 담당자 정보">
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b", marginBottom: "12px" }}>세무/노무법인 담당 조직 (내부)</h3>
            <div style={{ display: "flex", gap: "16px", marginBottom: "28px" }}>
              <div style={{ padding: "12px 20px", background: "#eff6ff", borderRadius: "10px", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "19px", background: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem" }}>
                  직
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700, marginBottom: "2px" }}>{selected.internalRole}</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1e3a8a" }}>{selected.internalManager}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b" }}>고객사 측 담당자</h3>
              <span style={{ fontSize: "0.75rem", color: "#64748b", background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px", fontWeight: 600 }}>총 {selected.clientManagers.length}명</span>
            </div>
            
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "#475569" }}>이름</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "#475569" }}>직급/직책</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "#475569" }}>담당 업무</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "#475569" }}>개인 연락처</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "#475569" }}>이메일</th>
                </tr>
              </thead>
              <tbody>
                {selected.clientManagers.map((manager, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a" }}>{manager.name}</td>
                    <td style={{ padding: "12px 16px" }}>{manager.position}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: "#e2e8f0", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, color: "#475569" }}>
                        {manager.role}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: "0.9rem" }}>{manager.contact}</td>
                    <td style={{ padding: "12px 16px", color: "#3b82f6" }}>{manager.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Section C: 세무 세팅 */}
          <Section id="sec-c" title="C. 세무 세팅 정보">
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
               <div>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569", marginBottom: "12px" }}>사업용 계좌</h3>
                  {selected.bankAccounts.map((acc, idx) => (
                    <div key={idx} style={{ marginBottom: idx < selected.bankAccounts.length - 1 ? "12px" : "0" }}>
                      <CopyField label={acc.bank} value={acc.accountNo} />
                    </div>
                  ))}
               </div>
               <div>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569", marginBottom: "12px" }}>국세청(홈택스) 연동</h3>
                  <CopyField label="홈택스 ID" value={selected.hometaxId} />
               </div>
             </div>
          </Section>
        </div>
      ) : (
        <div style={{ 
          padding: "60px 0", textAlign: "center", background: "#fff", 
          border: "1px dashed #cbd5e1", borderRadius: "14px", color: "#94a3b8" 
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🏢</div>
          <div style={{ fontSize: "1rem", fontWeight: 700 }}>조회할 업체를 목록에서 선택해 주세요.</div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
