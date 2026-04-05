"use client";

import React, { useState } from "react";

/* ─────────────────────────── Mock Data ─────────────────────────── */

type TaxpayerType = "일반과세자" | "간이과세자" | "면세사업자" | "비영리법인" | "국가기관등";

type ClientManager = {
  id: string;
  name: string;
  position: string;
  role: string;
  contact: string;
  email: string;
};

type BankAccount = {
  id: string;
  bank: string;
  accountNo: string;
  owner: string;
};

type CreditCard = {
  id: string;
  company: string;
  cardNo: string;
  owner: string;
};

type ChangeLog = {
  id: string;
  date: string;
  field: string;
  before: string;
  after: string;
  modifier: string;
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
  bizItem: string;
  bizCategory: string;
  taxpayerType: TaxpayerType;
  mainBizCode: string;
  status: "정상" | "휴업" | "폐업";
  memo: string;
  taxAcct: string;
  laborAtty: string;
  taxStaff: string;
  clientManagers: ClientManager[];
  bankAccounts: BankAccount[];
  creditCards: CreditCard[];
  hometaxId: string;
  hometaxPw: string;
  logs: ChangeLog[];
  // D. 민감 개인정보
  ceoIdNo?: string;       // 주민등록번호
  ceoHomeAddr?: string;   // 주민등록초본 기준 주소
  // E. 청구 및 계약 관리
  bookkeepingFee?: number;
  bookkeepingFeeContract?: "서명완료" | "미서명";
  laborContract?: "서명완료" | "미서명";
  contractStart?: string;
  contractEnd?: string;
  payDay?: number;        // 결제일 (매월 n일)
  payStatus?: "정상" | "미납" | "연체";
  feeChangeLogs?: ChangeLog[];
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
    mainBizCode: "722000",
    status: "정상",
    memo: "대표이사 변경 이력 있음. 부가세 누락 주의. 1월 특이사항: 연구인력개발비 세액공제 이슈.",
    taxAcct: "허건우",
    laborAtty: "장원교",
    taxStaff: "김세무",
    clientManagers: [
      { id: "cm-1", name: "이자영", position: "재무이사", role: "총괄", contact: "010-1234-5678", email: "finance@union.com" },
      { id: "cm-2", name: "홍길동", position: "대리", role: "급여/4대보험", contact: "010-9876-5432", email: "hr@union.com" },
      { id: "cm-3", name: "김인사", position: "과장", role: "인사", contact: "010-1111-2222", email: "insa@union.com" }
    ],
    bankAccounts: [
      { id: "ba-1", bank: "국민은행", accountNo: "912345-01-678901", owner: "유니온테크" },
      { id: "ba-2", bank: "신한은행", accountNo: "110-345-6789", owner: "유니온테크(급여)" }
    ],
    creditCards: [
      { id: "cc-1", company: "신한카드", cardNo: "1234-5678-9012-3456", owner: "고성훈" },
      { id: "cc-2", company: "현대카드", cardNo: "5321-1122-3344-5566", owner: "유니온테크 공용" }
    ],
    hometaxId: "union_hometax12",
    hometaxPw: "Uniontech@2024!",
    ceoIdNo: "700512-1234567",
    ceoHomeAddr: "서울시 서초구 반포대로 58, 102동 1201호",
    bookkeepingFee: 550000,
    bookkeepingFeeContract: "서명완료",
    laborContract: "미서명",
    contractStart: "2024-01-01",
    contractEnd: "2024-12-31",
    payDay: 25,
    payStatus: "정상",
    feeChangeLogs: [
      { id: "fl-1", date: "2024-01-01 00:00", field: "기장료", before: "440,000원", after: "550,000원", modifier: "허건우" }
    ],
    logs: [
      { id: "l-1", date: "2024-03-01 14:22", field: "사업장 소재지", before: "서울시 강남구 논현동", after: "서울시 강남구 테헤란로 123", modifier: "김세무" },
      { id: "l-2", date: "2023-11-15 09:10", field: "담당 직원", before: "이세무", after: "김세무", modifier: "허건우" }
    ]
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
    mainBizCode: "742100",
    status: "정상",
    memo: "청년고용증대세액공제 대상 검토 요망.",
    taxAcct: "허건우",
    laborAtty: "장원교",
    taxStaff: "이세무",
    clientManagers: [
      { id: "cm-4", name: "이세훈", position: "대표이사", role: "총괄", contact: "010-1111-2222", email: "ceo@datasolution.com" }
    ],
    bankAccounts: [{ id: "ba-3", bank: "신한은행", accountNo: "110-234-567890", owner: "(주)데이터솔루션" }],
    creditCards: [],
    hometaxId: "datasol_tax",
    hometaxPw: "Data!sol789",
    ceoIdNo: "820301-2987654",
    ceoHomeAddr: "경기도 성남시 분당구 정자일로 200",
    bookkeepingFee: 330000,
    bookkeepingFeeContract: "서명완료",
    laborContract: "서명완료",
    contractStart: "2024-03-01",
    contractEnd: "2025-02-28",
    payDay: 10,
    payStatus: "미납",
    feeChangeLogs: [],
    logs: []
  },
  {
    id: "c-3",
    type: "개인",
    name: "코스모스 카페",
    bizNo: "345-67-89012",
    ceo: "박주인",
    openDate: "2022-07-20",
    address: "서울시 종로구 삼청로 10",
    bizItem: "음식점업",
    bizCategory: "커피전문점",
    taxpayerType: "간이과세자",
    mainBizCode: "552101",
    status: "정상",
    memo: "프랜차이즈 가맹점. 종소세 단순경비율 파악 필요.",
    taxAcct: "허건우",
    laborAtty: "장원교",
    taxStaff: "최대리",
    clientManagers: [
      { id: "cm-5", name: "박주인", position: "대표", role: "총괄", contact: "010-5555-6666", email: "owner@cosmos.com" }
    ],
    bankAccounts: [{ id: "ba-4", bank: "우리은행", accountNo: "1002-345-678901", owner: "박주인" }],
    creditCards: [{ id: "cc-3", company: "국민카드", cardNo: "9410-1111-2222-3333", owner: "박주인" }],
    hometaxId: "cosmos_cafe",
    hometaxPw: "Cosmos#0720",
    ceoIdNo: "900720-2111222",
    ceoHomeAddr: "서울시 종로구 율곡로 10-1",
    bookkeepingFee: 165000,
    bookkeepingFeeContract: "서명완료",
    laborContract: "미서명",
    contractStart: "2022-07-20",
    contractEnd: "2024-07-19",
    payDay: 15,
    payStatus: "연체",
    feeChangeLogs: [],
    logs: []
  },
  {
    id: "c-4",
    type: "개인",
    name: "장수치킨맥주 경성대점",
    bizNo: "549-01-03630",
    ceo: "김수연",
    openDate: "2015-08-15",
    address: "부산광역시 남구 용소로 14",
    bizItem: "음식점업",
    bizCategory: "한식",
    taxpayerType: "일반과세자",
    mainBizCode: "552101",
    status: "휴업",
    memo: "현재 휴업중이나 재개업 예정. 기한후신고 체크할 것.",
    taxAcct: "허건우",
    laborAtty: "장원교",
    taxStaff: "박세무",
    clientManagers: [],
    bankAccounts: [],
    creditCards: [],
    hometaxId: "jangsu_chicken",
    hometaxPw: "Jangsu1508!",
    ceoIdNo: "780815-1555666",
    ceoHomeAddr: "부산광역시 남구 수영로 101",
    bookkeepingFee: 110000,
    bookkeepingFeeContract: "미서명",
    laborContract: "미서명",
    contractStart: "2023-05-01",
    contractEnd: "2024-04-30",
    payDay: 20,
    payStatus: "정상",
    feeChangeLogs: [],
    logs: []
  }
];

/* ─────────────────────────── UI Components ─────────────────────────── */

function CopyButton({ text, onClick }: { text: string; onClick?: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    if(onClick) onClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      type="button"
      onClick={handleCopy}
      title="클립보드에 복사"
      style={{
        background: copied ? "#dcfce7" : "#f1f5f9",
        color: copied ? "#166534" : "#64748b",
        border: "none", borderRadius: 4, width: 24, height: 24, 
        cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0
      }}
    >
      {copied ? "✓" : "📋"}
    </button>
  );
}

function InputField({ label, value, readOnly=true, onCopy }: { label: string; value: string; readOnly?: boolean; onCopy?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>{label}</label>
      <div style={{ 
        display: "flex", alignItems: "center", background: readOnly ? "#f8fafc" : "#fff", 
        border: "1px solid #e2e8f0", borderRadius: 6, padding: "0 8px", minHeight: 36
      }}>
        <input 
          type="text" 
          value={value} 
          readOnly={readOnly}
          style={{
            flex: 1, fontSize: "0.85rem", background: "transparent", border: "none", 
            outline: "none", color: "#0f172a", padding: "8px 4px", minWidth: 0, fontWeight: 600,
            textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden"
          }}
        />
        {onCopy && <CopyButton text={value} />}
      </div>
    </div>
  );
}

function SelectField({ label, value, options }: { label: string; value: string; options: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>{label}</label>
      <div style={{ 
        display: "flex", alignItems: "center", background: "#fff", 
        border: "1px solid #e2e8f0", borderRadius: 6, padding: "0 8px", minHeight: 36
      }}>
        <select value={value} onChange={()=>{}} style={{
            flex: 1, fontSize: "0.85rem", background: "transparent", border: "none", 
            outline: "none", color: "#0f172a", padding: "8px 4px", minWidth: 0, fontWeight: 600,
            cursor: "pointer"
        }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
}

function MaskedCopyField({ label, value }: { label: string; value: string }) {
  const [unmasked, setUnmasked] = useState(false);
  const displayValue = unmasked ? value : value.replace(/(\w{4})-(\w{4})-(\w{4})-(\w{4})/, "$1-****-****-$4");
  const fallbackMask = unmasked ? value : value.replace(/./g, "*");
  const masked = value.includes("-") ? displayValue : fallbackMask;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>{label}</label>
      <div style={{ 
        display: "flex", alignItems: "center", background: "#f8fafc", 
        border: "1px solid #e2e8f0", borderRadius: 6, padding: "0 8px", minHeight: 36
      }}>
        <input 
          type="text" 
          value={masked} 
          readOnly
          style={{
            flex: 1, fontSize: "0.85rem", background: "transparent", border: "none", 
            outline: "none", color: "#0f172a", padding: "8px 4px", minWidth: 0,
            fontFamily: "monospace", fontWeight: 600
          }}
        />
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button 
            type="button" onClick={(e) => { e.stopPropagation(); setUnmasked(!unmasked); }}
            style={{ background: unmasked ? "#e2e8f0" : "transparent", border: "none", borderRadius: 4, width: 24, height: 24, cursor: "pointer", display: "flex", alignItems:"center", justifyContent: "center", fontSize: "0.85rem", transition: "all 0.2s", color: unmasked ? "#0f172a" : "#64748b" }}
            title="보기/숨기기"
          >
            {unmasked ? "👁️‍🗨️" : "👁️"}
          </button>
          <div style={{ width: 1, height: 16, background: "#cbd5e1" }} />
          <CopyButton text={value} />
        </div>
      </div>
    </div>
  );
}

function FileUploadZone({ label, desc }: { label: string, desc?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, height: "100%" }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", alignSelf: "flex-start" }}>{label}</label>
      <div style={{
        flex: 1, border: "1.5px dashed #cbd5e1", borderRadius: 8, background: "#f8fafc",
        padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 0.2s", minHeight: 120
      }}>
        <div style={{ fontSize: "1.6rem", marginBottom: 6 }}>📁</div>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>파일 업로드 (클릭 또는 드래그)</div>
        {desc && <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 4 }}>{desc}</div>}
      </div>
    </div>
  );
}

function Section({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div style={{
      marginBottom: 20, padding: "26px 30px", border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff",
      boxShadow: "0 1px 2px rgba(0,0,0,0.02)", overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 4, height: 16, background: "#2563eb", borderRadius: 2 }} />
          {title}
        </h2>
        {actions && <div>{actions}</div>}
      </div>
      {children}
    </div>
  );
}

function Badge({ children, role }: { children: React.ReactNode; role: string }) {
  const colors: Record<string, { bg: string, text: string }> = {
    "총괄": { bg: "#fee2e2", text: "#991b1b" },
    "안내문 발송": { bg: "#fef3c7", text: "#92400e" },
    "경리": { bg: "#e0e7ff", text: "#3730a3" },
    "인사": { bg: "#dcfce7", text: "#166534" },
    "급여/4대보험": { bg: "#dcfce7", text: "#166534" },
    "기타": { bg: "#f1f5f9", text: "#475569" }
  };
  const c = colors[role] || colors["기타"];
  return (
    <span style={{ background: c.bg, color: c.text, padding: "4px 10px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 800 }}>
      {children}
    </span>
  );
}

/* ─────────────────────────── Detail View Component ─────────────────────────── */

function CompanyDetailPanel({ company }: { company: CompanyInfo }) {
  const [showLogs, setShowLogs] = useState(false);

  return (
    <div style={{ background: "#f8fafc", padding: "30px 40px", borderBottom: "2px solid #cbd5e1", boxShadow: "inset 0 4px 6px -4px rgba(0,0,0,0.05)" }}>
      <div style={{ animation: "fadeIn 0.3s ease-in-out" }}>
        
        {/* Section A: 사업자 기본정보 */}
        <Section 
          title="A. 사업자 기본정보" 
          actions={
            <button 
              onClick={(e) => { e.stopPropagation(); setShowLogs(!showLogs); }}
              style={{ background: showLogs ? "#1e293b" : "#fff", border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 14px", fontSize: "0.75rem", fontWeight: 700, color: showLogs ? "#fff" : "#475569", cursor: "pointer", transition: "all 0.2s" }}
            >
              {showLogs ? "닫기" : "📜 변경이력 로그 조회"}
            </button>
          }
        >
          {showLogs && company.logs.length > 0 && (
            <div style={{ marginBottom: 20, padding: 16, background: "#f1f5f9", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155", marginBottom: 12 }}>최근 변경 이력</h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {company.logs.map(log => (
                  <li key={log.id} style={{ fontSize: "0.8rem", color: "#475569", background: "#fff", padding: "10px 14px", borderRadius: 6, border: "1px solid #cbd5e1", display: "flex", gap: 16, alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "#2563eb", width: 120 }}>{log.date}</span>
                    <span style={{ background: "#f8fafc", padding: "2px 8px", borderRadius: 4, fontWeight: 700, border: "1px solid #e2e8f0" }}>{log.field}</span>
                    <span style={{ flex: 1 }}>{log.before} <span style={{ color: "#94a3b8", margin: "0 6px" }}>→</span> <span style={{ fontWeight: 700, color: "#166534" }}>{log.after}</span></span>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>변경자: {log.modifier}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {showLogs && company.logs.length === 0 && (
            <div style={{ marginBottom: 20, padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "0.8rem", color: "#64748b", textAlign: "center" }}>변경 이력이 없습니다.</div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(200px, 1fr))", gap: "20px 24px" }}>
            <InputField label="사업장 상호(법인명)" value={company.name} onCopy />
            <InputField label="사업자등록번호" value={company.bizNo} onCopy />
            {company.type === "법인" ? <InputField label="법인등록번호" value={company.corpNo!} onCopy /> : <div />}
            <InputField label="대표자 성명" value={company.ceo} onCopy />
            <InputField label="개업연월일" value={company.openDate} />
            <SelectField label="사업자 유형" value={company.taxpayerType} options={["일반과세자", "간이과세자", "면세사업자", "비영리법인", "국가기관등"]} />
            <InputField label="업태" value={company.bizItem} />
            <InputField label="종목" value={company.bizCategory} />
            <div style={{ gridColumn: "1 / span 3" }}>
              <InputField label="사업장 소재지 (본점/지점)" value={company.address} onCopy />
            </div>
            <InputField label="주업종코드" value={company.mainBizCode} onCopy />
            
            {/* 내부 메모 & 사업자등록증 */}
            <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "3fr 2fr", gap: 24, marginTop: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, height: "100%" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#b91c1c", display: "flex", gap: 6, alignItems: "center" }}>
                  <span>🔒 내부 메모</span>
                  <span style={{ opacity: 0.7, fontSize: "0.65rem", fontWeight: 600 }}>[고객사 비공개 - 사무소 전용]</span>
                </label>
                <textarea 
                  value={company.memo} 
                  readOnly 
                  style={{
                    flex: 1, padding: 16, borderRadius: 8, border: "1.5px solid #fca5a5", background: "#fef2f2",
                    fontSize: "0.85rem", color: "#991b1b", outline: "none", resize: "none", lineHeight: 1.5, fontWeight: 600
                  }} 
                />
              </div>
              <div>
                <FileUploadZone label="사업자등록증 사본 업로드" desc="PDF, JPG, PNG 파일 지원" />
              </div>
            </div>
          </div>
        </Section>

        {/* Section B: 담당자 정보 */}
        <Section title="B. 담당자 정보">
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}>
            
            {/* 세무법인 측 */}
            <div>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155", marginBottom: 12 }}>세무/노무법인 담당 조직 체계</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, background: "#f8fafc", padding: 20, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>대표 세무사 (자동배정)</label>
                  <div style={{ padding: "0 14px", height: 38, background: "#fff", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1rem" }}>🤵</span> {company.taxAcct}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>담당 노무사 (자동배정)</label>
                  <div style={{ padding: "0 14px", height: 38, background: "#fff", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1rem" }}>⚖️</span> {company.laborAtty}
                  </div>
                </div>
                <SelectField label="실무 담당 세무직원" value={company.taxStaff} options={["김세무", "이세무", "박세무", "최대리"]} />
              </div>
            </div>

            {/* 고객사 측 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155", marginBottom: 4 }}>고객사 (수임처) 담당자 명단</h3>
                  <div style={{ fontSize: "0.7rem", color: "#64748b" }}>결재 또는 안내문 수신 목적에 맞게 복수 담당자를 등록할 수 있습니다.</div>
                </div>
                <button style={{ background: "#2563eb", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 4px rgba(37,99,235,0.2)", transition: "background 0.2s" }}>
                  + 담당자 추가 등록
                </button>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                  <thead style={{ background: "#f8fafc" }}>
                    <tr>
                      <th style={{ padding: "12px 16px", color: "#64748b", fontWeight: 800, borderBottom: "1px solid #e2e8f0", width: "15%" }}>이름</th>
                      <th style={{ padding: "12px 16px", color: "#64748b", fontWeight: 800, borderBottom: "1px solid #e2e8f0", width: "15%" }}>직급/직책</th>
                      <th style={{ padding: "12px 16px", color: "#64748b", fontWeight: 800, borderBottom: "1px solid #e2e8f0", width: "20%" }}>담당 업무 구분</th>
                      <th style={{ padding: "12px 16px", color: "#64748b", fontWeight: 800, borderBottom: "1px solid #e2e8f0", width: "25%" }}>직통 연락처</th>
                      <th style={{ padding: "12px 16px", color: "#64748b", fontWeight: 800, borderBottom: "1px solid #e2e8f0", width: "25%" }}>이메일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {company.clientManagers.map(m => (
                      <tr key={m.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 800, color: "#0f172a" }}>{m.name}</td>
                        <td style={{ padding: "12px 16px", color: "#475569", fontWeight: 600 }}>{m.position}</td>
                        <td style={{ padding: "12px 16px" }}><Badge role={m.role}>{m.role}</Badge></td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "monospace", fontSize: "0.9rem" }}>{m.contact} <CopyButton text={m.contact} /></span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#2563eb", fontWeight: 600 }}>
                           <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>{m.email} <CopyButton text={m.email} /></span>
                        </td>
                      </tr>
                    ))}
                    {company.clientManagers.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>등록된 고객사 담당자가 없습니다.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Section>

        {/* Section C: 세무 기초 세팅 정보 */}
        <Section title="C. 세무 기초 세팅 정보">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>

            {/* 좌측: API 연동 예정 안내 + 증빙자료 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

              {/* 사업용 계좌 — API 연동 예정 */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155" }}>사업용 계좌 내역</h3>
                  <span style={{ fontSize: "0.7rem", fontWeight: 800, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "4px 10px", borderRadius: 20 }}>🔗 홈택스 API 자동연동 예정</span>
                </div>
                <div style={{ background: "#f8fafc", border: "1.5px dashed #bfdbfe", borderRadius: 10, padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "#3b82f6" }}>
                  <div style={{ fontSize: "1.8rem" }}>🏦</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800 }}>홈택스 연동 후 자동 수집됩니다</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", textAlign: "center", lineHeight: 1.5 }}>하단 홈택스 로그인 정보 등록 시 API를 통해<br/>사업용 계좌 목록을 자동으로 불러옵니다.</div>
                </div>
              </div>

              {/* 사업용 신용카드 — API 연동 예정 */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155" }}>사업용 신용카드 (홈택스 등록분)</h3>
                  <span style={{ fontSize: "0.7rem", fontWeight: 800, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "4px 10px", borderRadius: 20 }}>🔗 홈택스 API 자동연동 예정</span>
                </div>
                <div style={{ background: "#f8fafc", border: "1.5px dashed #bfdbfe", borderRadius: 10, padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "#3b82f6" }}>
                  <div style={{ fontSize: "1.8rem" }}>💳</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800 }}>홈택스 연동 후 자동 수집됩니다</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", textAlign: "center", lineHeight: 1.5 }}>홈택스에 등록된 사업용 카드 목록을<br/>API를 통해 자동으로 불러옵니다.</div>
                </div>
              </div>

            </div>

            {/* 우측: 홈택스 로그인 + 증빙자료 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

              {/* 홈택스 로그인 */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155" }}>국세청(홈택스) 로그인 정보</h3>
                  <span style={{ fontSize: "0.7rem", fontWeight: 800, background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "4px 10px", borderRadius: 20 }}>🔒 보안 정보 — 사무소 내부 전용</span>
                </div>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
                  <InputField label="홈택스 로그인 ID" value={company.hometaxId} onCopy />
                  <MaskedCopyField label="홈택스 로그인 비밀번호" value={company.hometaxPw} />
                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "10px 14px", fontSize: "0.72rem", color: "#92400e", lineHeight: 1.6 }}>
                    ⚠️ 비밀번호는 암호화 저장됩니다. 외부에 공유하지 마세요.<br/>
                    홈택스 로그인 정보는 API 자동연동(계좌·카드 수집)에 함께 사용됩니다.
                  </div>
                </div>
              </div>

              {/* 증빙자료 업로드 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155", marginBottom: 12 }}>기초 세무 증빙자료</h3>
                </div>
                <FileUploadZone label="공동인증서 (NPKI 폴더 전체)" desc="드래그 앤 드롭 압축 업로드" />
                <FileUploadZone label="임대차 계약서" desc="PDF 복수 파일 업로드 지원" />
                <div style={{ gridColumn: "1 / -1" }}>
                  <FileUploadZone label="차량 등록증 및 리스·렌트 계약서" desc="법인차량 취득/리스건 복수 파일 업로드" />
                </div>
              </div>

            </div>

          </div>
        </Section>

        {/* Section D: 민감 개인정보 */}
        <SectionD company={company} />

        {/* Section E: 청구 및 계약 관리 */}
        <SectionE company={company} />

      </div>
    </div>
  );
}

/* ─────────────────────────── D. 민감 개인정보 ─────────────────────────── */

function SectionD({ company }: { company: CompanyInfo }) {
  const [unlocked, setUnlocked] = useState(false);
  return (
    <Section title="D. 민감 개인정보">
      {/* 권한 안내 & 잠금 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.2rem" }}>🔐</span>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#c2410c" }}>대표세무사 권한으로만 조회 가능합니다</div>
            <div style={{ fontSize: "0.7rem", color: "#9a3412" }}>이 섹션의 정보는 개인정보 보호법에 의거하여 열람이 제한됩니다.</div>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setUnlocked(prev => !prev); }}
          style={{
            background: unlocked ? "#dc2626" : "#c2410c", color: "#fff",
            border: "none", padding: "8px 18px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 800,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s"
          }}
        >
          {unlocked ? "🔓 민감정보 잠금" : "🔐 민감정보 열기"}
        </button>
      </div>

      {unlocked ? (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px 24px", marginBottom: 24 }}>
            <MaskedCopyField label="대표자 주민등록번호" value={company.ceoIdNo ?? ""} />
            <InputField label="대표자 주소 (주민등록초본 기준)" value={company.ceoHomeAddr ?? ""} onCopy />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <FileUploadZone label="신분증 사본 (대표자)" desc="주민등록증 또는 운전면허증·여권" />
            <FileUploadZone label="인감증명서" desc="발급일 3개월 이내 유효본 업로드" />
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🔐</div>
          <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>민감정보는 잠금 상태입니다.</div>
          <div style={{ fontSize: "0.75rem", marginTop: 4 }}>위 '민감정보 열기' 버튼을 눌러 주세요.</div>
        </div>
      )}
    </Section>
  );
}

/* ─────────────────────────── E. 청구/계약 관리 ─────────────────────────── */

function SectionE({ company }: { company: CompanyInfo }) {
  const [showFeeLog, setShowFeeLog] = useState(false);

  const formatMoney = (n?: number) =>
    n !== undefined ? n.toLocaleString("ko-KR") + "원" : "-";

  const payColors: Record<string, { bg: string; text: string }> = {
    "정상": { bg: "#dcfce7", text: "#166534" },
    "미납": { bg: "#fef3c7", text: "#92400e" },
    "연체": { bg: "#fee2e2", text: "#991b1b" }
  };
  const contractColor = (v?: string) =>
    v === "서명완료" ? { bg: "#dcfce7", text: "#166534" } : { bg: "#f1f5f9", text: "#64748b" };

  const pay = company.payStatus ?? "정상";
  const pc = payColors[pay];
  const bk = contractColor(company.bookkeepingFeeContract);
  const lb = contractColor(company.laborContract);

  return (
    <Section
      title="E. 청구 및 계약 관리"
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "0.7rem", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "4px 10px", borderRadius: 20, fontWeight: 800 }}>
            👤 대표세무사·노무사님만 조회 지정
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setShowFeeLog(prev => !prev); }}
            style={{ background: showFeeLog ? "#1e293b" : "#fff", border: "1px solid #cbd5e1", borderRadius: 6, padding: "6px 14px", fontSize: "0.75rem", fontWeight: 700, color: showFeeLog ? "#fff" : "#475569", cursor: "pointer", transition: "all 0.2s" }}
          >
            {showFeeLog ? "닫기" : "📜 요금 변경 이력"}
          </button>
        </div>
      }
    >
      {/* 요금 변경 이력 로그 */}
      {showFeeLog && (
        <div style={{ marginBottom: 20, padding: 16, background: "#f1f5f9", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155", marginBottom: 12 }}>기장료·조정료 변경 이력</h4>
          {(company.feeChangeLogs ?? []).length === 0 ? (
            <div style={{ fontSize: "0.8rem", color: "#94a3b8", textAlign: "center", padding: "12px" }}>변경 이력이 없습니다.</div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {(company.feeChangeLogs ?? []).map(log => (
                <li key={log.id} style={{ fontSize: "0.8rem", color: "#475569", background: "#fff", padding: "10px 14px", borderRadius: 6, border: "1px solid #cbd5e1", display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "#2563eb", minWidth: 140 }}>{log.date}</span>
                  <span style={{ background: "#f8fafc", padding: "2px 8px", borderRadius: 4, fontWeight: 700, border: "1px solid #e2e8f0" }}>{log.field}</span>
                  <span style={{ flex: 1 }}>
                    {log.before}
                    <span style={{ color: "#94a3b8", margin: "0 8px" }}>→</span>
                    <strong style={{ color: "#166534" }}>{log.after}</strong>
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{log.modifier}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 상단: 청구 요약 정보 (전체 폭) */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 28px", marginBottom: 28 }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155", marginBottom: 16 }}>월정 청구 정보</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" }}>
          {[
            { label: "월 기장료", value: formatMoney(company.bookkeepingFee), isLarge: true },
            { label: "납부 상태", value: pay, isBadge: true, bg: pc.bg, text: pc.text },
            { label: "계약 기간", value: `${company.contractStart} ~ ${company.contractEnd}` },
            { label: "결제일", value: `매월 ${company.payDay}일` },
          ].map((item, i) => (
            <div key={i} style={{ padding: "16px 20px", background: i % 2 === 0 ? "#fff" : "#f8fafc", borderRight: i < 3 ? "1px solid #e2e8f0" : "none" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", marginBottom: 8 }}>{item.label}</div>
              {item.isBadge ? (
                <span style={{ background: item.bg, color: item.text, padding: "5px 14px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 800 }}>{item.value}</span>
              ) : (
                <div style={{ fontSize: item.isLarge ? "1.35rem" : "0.9rem", fontWeight: 800, color: "#0f172a" }}>{item.value}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 하단: 계약서 2개 나란히 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155" }}>기장대리 계약서</h3>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, background: bk.bg, color: bk.text, padding: "4px 12px", borderRadius: 20 }}>
              {company.bookkeepingFeeContract ?? "미서명"}
            </span>
          </div>
          <FileUploadZone label="" desc="PDF 또는 전자서명 파일 업로드" />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155" }}>노무대리 계약서</h3>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, background: lb.bg, color: lb.text, padding: "4px 12px", borderRadius: 20 }}>
              {company.laborContract ?? "미서명"}
            </span>
          </div>
          <FileUploadZone label="" desc="PDF 또는 전자서명 파일 업로드" />
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────── Main Page Component ─────────────────────────── */

export default function CompanyInfoPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleRow = (id: string, e: React.MouseEvent) => {
    // 만약 row 안의 버튼을 클릭한거면 방지
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === "button") return;
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div style={{ padding: "32px 40px", width: "95%", margin: "0 auto", backgroundColor: "#fff", minHeight: "100vh" }}>
      
      {/* ─── 페이지 타이틀 ─── */}
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 6 }}>
            업체 기초자료 및 담당자 관리
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem", margin: 0 }}>
            세무 및 노무 자문을 수행하는 고객사의 기본 제원과 담당자, 계좌 등 필수 세팅 자료를 통합 관리합니다. 업체를 클릭해 확장하세요.
          </p>
        </div>
        <button style={{ background: "#2563eb", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 6px rgba(37,99,235,0.2)" }}>
          + 신규 업체 등록
        </button>
      </div>

      {/* ─── 상단: 업체 목록 테이블 ─── */}
      <div style={{
        background: "#fff", borderRadius: 14, border: `1px solid #cbd5e1`,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", padding: 4
      }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "0.85rem", tableLayout: "fixed" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={{ padding: "16px 20px", textAlign: "left", color: "#475569", fontWeight: 800, width: "18%", borderBottom: "2px solid #e2e8f0" }}>사업장 상호</th>
              <th style={{ padding: "16px 20px", textAlign: "left", color: "#475569", fontWeight: 800, width: "14%", borderBottom: "2px solid #e2e8f0" }}>사업자번호</th>
              <th style={{ padding: "16px 20px", textAlign: "center", color: "#475569", fontWeight: 800, width: "7%", borderBottom: "2px solid #e2e8f0" }}>구분</th>
              <th style={{ padding: "16px 20px", textAlign: "center", color: "#475569", fontWeight: 800, width: "9%", borderBottom: "2px solid #e2e8f0" }}>대표자</th>
              <th style={{ padding: "16px 20px", textAlign: "left", color: "#475569", fontWeight: 800, width: "20%", borderBottom: "2px solid #e2e8f0" }}>업태 / 종목</th>
              <th style={{ padding: "16px 20px", textAlign: "center", color: "#475569", fontWeight: 800, width: "18%", borderBottom: "2px solid #e2e8f0" }}>담당 조직(내부)</th>
              <th style={{ padding: "16px 20px", textAlign: "center", color: "#475569", fontWeight: 800, width: "9%", borderBottom: "2px solid #e2e8f0" }}>상태</th>
              <th style={{ padding: "16px 12px", textAlign: "center", color: "#475569", fontWeight: 800, width: "5%", borderBottom: "2px solid #e2e8f0" }}>펼침</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DATA.map((company, i) => {
              const isExpanded = expandedId === company.id;
              const isCorp = company.type === "법인";
              const statusColor = company.status === "정상" ? "#16a34a" : company.status === "휴업" ? "#eab308" : "#dc2626";
              
              return (
                <React.Fragment key={company.id}>
                  <tr 
                    onClick={(e) => toggleRow(company.id, e)}
                    style={{ 
                      cursor: "pointer",
                      background: isExpanded ? "#eff6ff" : (i % 2 === 0 ? "#fff" : "#fafbfc"),
                      transition: "background 0.2s"
                    }}
                  >
                    <td style={{ padding: "16px 20px", fontWeight: isExpanded ? 800 : 700, color: isExpanded ? "#2563eb" : "#0f172a", borderBottom: "1px solid #cbd5e1" }}>
                       {company.name}
                    </td>
                    <td style={{ padding: "16px 20px", color: "#475569", fontFamily: "monospace", fontSize: "0.95rem", borderBottom: "1px solid #cbd5e1" }}>
                      {company.bizNo}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #cbd5e1" }}>
                      <span style={{ 
                        background: isCorp ? "#e0e7ff" : "#fce7f3", 
                        color: isCorp ? "#4f46e5" : "#db2777", 
                        padding: "4px 8px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 800 
                      }}>
                        {company.type}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "center", fontWeight: 800, color: "#1e293b", borderBottom: "1px solid #cbd5e1" }}>{company.ceo}</td>
                    <td style={{ padding: "16px 20px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", borderBottom: "1px solid #cbd5e1" }}>
                      <span style={{ fontWeight: 700, color: "#475569" }}>{company.bizItem}</span> <span style={{ opacity: 0.5 }}>/</span> {company.bizCategory}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #cbd5e1" }}>
                      <span style={{ color: "#0f172a", fontWeight: 800 }}>{company.taxStaff}</span> 
                      <span style={{ fontSize: "0.7rem", color: "#94a3b8", marginLeft: 4, fontWeight: 700 }}>외 2명</span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #cbd5e1" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor }}></div>
                        <span style={{ fontSize: "0.8rem", fontWeight: 800, color: statusColor }}>{company.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "center", color: isExpanded ? "#2563eb" : "#94a3b8", borderBottom: "1px solid #cbd5e1", fontSize: "1.1rem", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>
                      ▼
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr>
                      <td colSpan={8} style={{ padding: 0, borderBottom: "1px solid #cbd5e1" }}>
                        <CompanyDetailPanel company={company} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
