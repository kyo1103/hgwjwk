"use client";

import { useState } from "react";
import { MOCK_COMPANIES, INDUSTRY_META } from "@/lib/control-tower-data";

/* ─── 간이 컴포넌트들 ─── */

function Section({ title, id, children }: { title: string, id: string, children: React.ReactNode }) {
  return (
    <div id={id} style={{
      marginBottom: 32, padding: "24px 28px",
      border: "1px solid var(--border-color, #e2e8f0)", borderRadius: 14,
      background: "var(--card-bg, #fff)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    }}>
      <h2 style={{
        fontSize: "1.05rem", fontWeight: 800, color: "var(--foreground, #0f172a)",
        marginBottom: 20, display: "flex", alignItems: "center", gap: 10
      }}>
        <div style={{ width: 4, height: 16, background: "#2563eb", borderRadius: 2 }} />
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, value, type = "text", placeholder = "", readOnly = false }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>{label}</label>
      <input 
        type={type} 
        defaultValue={value} 
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          padding: "10px 14px", fontSize: "0.85rem",
          border: "1px solid #cbd5e1", borderRadius: 8,
          background: readOnly ? "#f8fafc" : "#fff",
          color: "#0f172a", outline: "none"
        }} 
      />
    </div>
  );
}

function UploadBox({ label, status }: { label: string, status?: string }) {
  return (
    <div style={{
      border: "1px dashed #cbd5e1", borderRadius: 10, padding: "20px",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
      background: "#f8fafc", cursor: "pointer", transition: "all 0.2s"
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 20, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
        📄
      </div>
      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>{label} 업로드</div>
      {status && (
        <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: 12, fontSize: "0.68rem", fontWeight: 600 }}>
          {status}
        </span>
      )}
    </div>
  );
}

/* ─── 페이지 메인 ─── */

export default function InfoPage() {
  const [selectedId, setSelectedId] = useState<string>(MOCK_COMPANIES[0].id);
  const selected = MOCK_COMPANIES.find(c => c.id === selectedId) ?? MOCK_COMPANIES[0];
  const meta = INDUSTRY_META[selected.category];
  const [bizType, setBizType] = useState("법인");
  const [maskSSN, setMaskSSN] = useState(true);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1800, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--foreground, #0f172a)", letterSpacing: "-0.03em", marginBottom: 4 }}>
          기본정보
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
          사업 관제탑에 등록된 업체의 기본정보 및 세무 기초 데이터를 통합 관리합니다.
        </p>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* ─── 업체 목록 (왼쪽 패널) ─── */}
        <div style={{
          width: 280, flexShrink: 0,
          border: "1px solid var(--border-color, #e2e8f0)", borderRadius: 14,
          background: "var(--card-bg, #fff)", overflow: "hidden"
        }}>
          <div style={{
            padding: "16px 20px", background: "var(--header-bg, #f8fafc)",
            borderBottom: "1px solid var(--border-color, #e2e8f0)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--foreground, #475569)" }}>업체 목록</span>
            <span style={{ background: "#e2e8f0", padding: "2px 8px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 700, color: "#64748b" }}>
              {MOCK_COMPANIES.length}
            </span>
          </div>
          <div style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
            {MOCK_COMPANIES.map(c => {
              const m = INDUSTRY_META[c.category];
              const isActive = c.id === selectedId;
              return (
                <div
                  key={c.id} onClick={() => setSelectedId(c.id)}
                  style={{
                    padding: "14px 20px", cursor: "pointer", borderBottom: "1px solid var(--border-color, #f1f5f9)",
                    background: isActive ? "#eff6ff" : "transparent",
                    borderLeft: isActive ? `3px solid ${m.color}` : "3px solid transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.2rem" }}>{m.icon}</span>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: isActive ? m.color : "#0f172a" }}>{c.shortName}</div>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>{c.category} · {c.manager}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 상세 정보 (오른쪽 패널) ─── */}
        <div style={{ flex: 1, maxHeight: "calc(100vh - 170px)", overflowY: "auto", paddingRight: 10 }}>
          
          {/* 업체 메인 헤더 */}
          <div style={{
            padding: "24px", background: "linear-gradient(to right, #1e293b, #0f172a)",
            borderRadius: 14, color: "#fff", marginBottom: 24,
            display: "flex", alignItems: "center", gap: 18, boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              width: 54, height: 54, borderRadius: 16, background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem",
            }}>{meta.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: "1.4rem", fontWeight: 800 }}>{selected.name}</span>
                <span style={{ background: meta.color, padding: "2px 8px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700 }}>{selected.category}</span>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}>
                사업자번호: {selected.bizNo} &nbsp;|&nbsp; 메인 담당자: {selected.manager}
              </div>
            </div>
            <button style={{
              background: "#3b82f6", color: "#fff", border: "none", padding: "10px 20px",
              borderRadius: 8, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer"
            }}>전체 저장</button>
          </div>

          {/* Section A: 사업자 기본정보 */}
          <Section id="sec-a" title="A. 사업자 기본정보">
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600 }}>
                <input type="radio" name="bizType" checked={bizType === "법인"} onChange={() => setBizType("법인")} /> 법인사업자
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600 }}>
                <input type="radio" name="bizType" checked={bizType === "개인"} onChange={() => setBizType("개인")} /> 개인사업자
              </label>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px 20px", marginBottom: 24 }}>
              <Field label="사업자등록번호" value={selected.bizNo} readOnly />
              {bizType === "법인" && <Field label="법인등록번호" value="110111-2345678" />}
              <Field label="법인명(상호)" value={selected.name} />
              <Field label="대표자 성명" value="홍길동" />
              <Field label="연락처" value="02-1234-5678" />
              <Field label="개업연월일" value="2018-05-12" type="date" />
              <Field label="사업장 소재지" value="서울시 강남구 테헤란로 123" />
              {bizType === "법인" && <Field label="본점 소재지" value="서울시 강남구 테헤란로 123" />}
              <Field label="업태 / 종목" value="정보통신업 / 소프트웨어 개발" />
              <Field label="사업자 유형" value="일반과세자" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, marginBottom: 20 }}>
              <UploadBox label="사업자등록증 원본" status="OCR 추출완료" />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>내부 메모 (고객사 비공개)</label>
                <textarea style={{
                  flex: 1, padding: "12px", borderRadius: 8, border: "1px solid #cbd5e1",
                  outline: "none", fontSize: "0.85rem", resize: "none"
                }} placeholder="특이사항을 입력하세요..." defaultValue="[2024-01] 대표자 변경으로 관련 서류 수취 완료." />
              </div>
            </div>
            
            <div style={{ fontSize: "0.75rem", color: "#64748b", background: "#f8fafc", padding: "10px 14px", borderRadius: 8 }}>
              🕒 최근 변경 이력: <strong>[2026-04-03 15:30] 김노무</strong> - 본점 소재지 정보 수정
            </div>
          </Section>

          {/* Section B: 담당자 정보 */}
          <Section id="sec-b" title="B. 담당자 정보">
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b", marginBottom: 12 }}>세무/노무법인 담당 조직</h3>
            <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
              <div style={{ padding: "12px 18px", background: "#eff6ff", borderRadius: 10, border: "1px solid #bfdbfe", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>대</div>
                <div><div style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700 }}>대표 파트너</div><div style={{ fontSize: "0.9rem", fontWeight: 700 }}>이대표 세무사</div></div>
              </div>
              <div style={{ padding: "12px 18px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: "#94a3b8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>실</div>
                <div><div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>실무 담당자</div><div style={{ fontSize: "0.9rem", fontWeight: 700 }}>{selected.manager} 주임</div></div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b" }}>고객사 담당자 (복수 구성)</h3>
              <button style={{ background: "#fff", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700 }}>+ 인원 추가</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "10px", textAlign: "left", color: "#475569" }}>이름</th>
                  <th style={{ padding: "10px", textAlign: "left", color: "#475569" }}>직급/직책</th>
                  <th style={{ padding: "10px", textAlign: "left", color: "#475569" }}>담당 업무</th>
                  <th style={{ padding: "10px", textAlign: "left", color: "#475569" }}>개인 연락처</th>
                  <th style={{ padding: "10px", textAlign: "left", color: "#475569" }}>이메일</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px", fontWeight: 600 }}>홍길동</td><td style={{ padding: "10px" }}>대표이사</td>
                  <td style={{ padding: "10px" }}><span style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: 4, fontSize: "0.75rem" }}>총괄결재</span></td>
                  <td style={{ padding: "10px" }}>010-1234-5678</td><td style={{ padding: "10px" }}>ceo@example.com</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px", fontWeight: 600 }}>이경리</td><td style={{ padding: "10px" }}>대리</td>
                  <td style={{ padding: "10px" }}><span style={{ background: "#dbeafe", color:"#1e40af", padding: "2px 6px", borderRadius: 4, fontSize: "0.75rem" }}>급여/4대보험</span><span style={{ marginLeft:4, background: "#fef3c7", color:"#92400e", padding: "2px 6px", borderRadius: 4, fontSize: "0.75rem" }}>비용정산</span></td>
                  <td style={{ padding: "10px" }}>010-9876-5432</td><td style={{ padding: "10px" }}>finance@example.com</td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Section C: 세무 기초 세팅 자료 */}
          <Section id="sec-c" title="C. 세무 기초 세팅 자료">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569", marginBottom: 10 }}>사업용 계좌 내역</h3>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 16px", background: "#f8fafc", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>국민은행</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>912345-01-678901</div>
                  </div>
                  <span style={{ fontSize: "0.75rem", background: "#e2e8f0", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>{selected.name}</span>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>사업용 신용카드</h3>
                  <button style={{ background: "#22c55e", color: "#fff", border: "none", padding: "4px 10px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>⚡ API 연동 자동등록</button>
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 16px", background: "#f8fafc", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>신한카드</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>****-****-****-1234</div>
                  </div>
                  <span style={{ fontSize: "0.75rem", background: "#e2e8f0", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>홍길동</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <Field label="홈택스 ID" value="hometax_user1" />
              <UploadBox label="공동인증서 파일" status="보관중" />
              <UploadBox label="임대차계약서 / 차량등록증" />
            </div>
          </Section>

          {/* Section D: 민감 개인정보 */}
          <Section id="sec-d" title="D. 민감 개인정보 (OCR 자동 추출)">
            <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: "0.8rem", color: "#9f1239", display: "flex", gap: 10 }}>
              <span>🔒</span>
              <div>
                <strong>접근 제어 구역:</strong> 권한이 부여된 최소 인력만 열람할 수 있습니다.<br/>
                주민등록번호 등 민감 정보는 마스킹 처리되어 있습니다.
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
              <UploadBox label="대표자 신분증 / 인감증명" status="분석완료" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="성명 (OCR 추출)" value="홍길동" readOnly />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>주민등록번호 (OCR 추출)</label>
                  <div style={{
                    display: "flex", alignItems: "center", background: "#f8fafc",
                    border: "1px solid #cbd5e1", borderRadius: 8, padding: "0 10px",
                  }}>
                    <input 
                      type={maskSSN ? "password" : "text"}
                      defaultValue="800101-1234567" 
                      readOnly
                      style={{ flex: 1, padding: "10px 4px", fontSize: "0.9rem", background: "transparent", border: "none", outline: "none", color: "#0f172a" }} 
                    />
                    <button onClick={() => setMaskSSN(!maskSSN)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>
                      {maskSSN ? "👁" : "🙈"}
                    </button>
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="자택 주소 (OCR 추출)" value="초본 상 주소지가 여기에 표시됩니다." readOnly />
                </div>
              </div>
            </div>
          </Section>

          {/* Section E: 청구 및 계약 관리 */}
          <Section id="sec-e" title="E. 청구 및 계약 관리">
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
              <div>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569", marginBottom: 12 }}>수임 계약서 원본</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "1.2rem" }}>📄</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>세무 기장대리 계약서 (2024년 갱신)</span>
                    </div>
                    <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 8px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 700 }}>✅ 전자서명 완료</span>
                  </div>
                  <div style={{ padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "1.2rem" }}>📄</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>프리미엄 노무자문수임 계약서</span>
                    </div>
                    <span style={{ background: "#f1f5f9", color: "#64748b", padding: "4px 8px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 700 }}>대기중</span>
                  </div>
                </div>
              </div>

              <div style={{ background: "#1e293b", color: "#fff", padding: "20px 24px", borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#94a3b8" }}>당월 기장료 청구</span>
                  <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 700 }}>관리자 전용</span>
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 8 }}>
                  250,000 <span style={{ fontSize: "1rem", fontWeight: 500, color: "#94a3b8" }}>원 (VAT 별도)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <span>매월 25일 자동결제</span>
                  <span style={{ color: "#34d399", fontWeight: 700 }}>납부 완료</span>
                </div>
              </div>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
