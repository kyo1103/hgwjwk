"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import styles from "./workspace.module.css";
import CopyPageButton from "@/components/CopyPageButton";
import { useERPState } from "@/lib/use-erp-state";
import type { ChannelKey, ERPClient, ERPDocument, ERPJob } from "@/lib/erp-types";
import type { WorkspaceSession } from "@/lib/workspace-users";
import {
  contracts,
  documents as laborDocuments,
  employees,
  laborIssues,
  leaveBalances,
  monthlyReports,
  noticeLabel,
  notifications,
  qnas,
  serviceRequests,
  taxTasks,
  tenants,
  workTasks,
} from "@/lib/data";
import {
  CONNECTOR_LABELS,
  KAKAO_TEMPLATES,
  STATUS_LABELS,
  channelSummary,
  defaultTemplateParams,
  formatFullDateTime,
  previewMessage,
  type KakaoConfigStatus,
  type KakaoTemplateCode,
} from "@/components/workspace/helpers";
import {
  DocumentsPanel,
  FlashBanner,
  JobsPanel,
  StatCard,
  statusTone,
  type FlashMessage,
} from "@/components/workspace/WorkspaceBits";
import ControlTowerPage from "@/app/erp/control-tower/page";
import ReportPage from "@/app/erp/report/page";
import CompanyInfoPage from "@/app/erp/company-info/page";

/* ─────────────────────────── 발급센터 (셀프발급기) ─────────────────────────── */
type IssuanceRole = "all" | "admin";
type IssuanceSource = "홈택스" | "위택스" | "4대보험포털" | "자체";

interface CertDoc {
  id: string;
  name: string;
  source: IssuanceSource;
  purpose: string;
  role: IssuanceRole;
}

interface FormDoc {
  id: string;
  name: string;
  category: string;
  role: IssuanceRole;
  fileType: string;
}

interface IssuanceLog {
  id: string;
  docName: string;
  user: string;
  date: string;
  type: "민원증명" | "서식";
}

const SOURCE_BADGE: Record<IssuanceSource, { bg: string; text: string; border: string }> = {
  "홈택스": { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  "위택스": { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
  "4대보험포털": { bg: "#fdf4ff", text: "#a855f7", border: "#e9d5ff" },
  "자체": { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" },
};

const CERT_DOCS: CertDoc[] = [
  { id: "c1",  name: "납세증명서 (국세완납증명)",        source: "홈택스",      purpose: "대출·입찰·관공서 제출",            role: "all" },
  { id: "c2",  name: "납세증명서 (지방세)",             source: "위택스",      purpose: "대출·입찰·관공서 제출",            role: "all" },
  { id: "c3",  name: "사업자등록증명",                  source: "홈택스",      purpose: "거래처 제출·계약 시",              role: "all" },
  { id: "c4",  name: "소득금액증명",                    source: "홈택스",      purpose: "대출·비자·임대차",                role: "all" },
  { id: "c5",  name: "4대보험 완납증명",                source: "4대보험포털", purpose: "입찰·관공서",                     role: "all" },
  { id: "c6",  name: "부가가치세 과세표준증명",          source: "홈택스",      purpose: "대출·매출 증빙",                  role: "all" },
  { id: "c7",  name: "표준재무제표증명",                source: "홈택스",      purpose: "결산 확인·여신 심사",              role: "admin" },
  { id: "c8",  name: "납부내역증명 (납세사실증명)",      source: "홈택스",      purpose: "특정 세목 납부 확인",              role: "admin" },
  { id: "c9",  name: "부가세 면세사업자 수입금액증명",   source: "홈택스",      purpose: "면세 매출 확인 (병의원·학원)",     role: "admin" },
  { id: "c10", name: "폐업사실증명",                    source: "홈택스",      purpose: "폐업 처리 확인",                  role: "admin" },
  { id: "c11", name: "과표증명원",                      source: "홈택스",      purpose: "세무조정·경정청구",                role: "admin" },
  { id: "c12", name: "원천징수이행상황신고서",           source: "홈택스",      purpose: "원천세 신고 확인",                role: "admin" },
  { id: "c13", name: "갑종근로소득 원천징수영수증",      source: "홈택스",      purpose: "연말정산 결과",                   role: "admin" },
];

const FORM_DOCS: FormDoc[] = [
  { id: "f1",  name: "표준근로계약서",         category: "계약서",   role: "all",   fileType: "HWP" },
  { id: "f2",  name: "일용근로계약서",         category: "계약서",   role: "all",   fileType: "HWP" },
  { id: "f3",  name: "연차사용촉진 통보서",    category: "근태",     role: "all",   fileType: "HWP" },
  { id: "f4",  name: "퇴직금 중간정산 신청서", category: "퇴직",     role: "all",   fileType: "HWP" },
  { id: "f5",  name: "사직서",                 category: "퇴직",     role: "all",   fileType: "HWP" },
  { id: "f6",  name: "급여명세서 서식",        category: "급여",     role: "all",   fileType: "XLSX" },
  { id: "f7",  name: "근태기록부",             category: "근태",     role: "all",   fileType: "XLSX" },
  { id: "f8",  name: "기장대리 계약서",        category: "계약서",   role: "admin", fileType: "HWP" },
  { id: "f9",  name: "세무조정 계약서",        category: "계약서",   role: "admin", fileType: "HWP" },
  { id: "f10", name: "수임자료 인수인계서",    category: "내부",     role: "admin", fileType: "HWP" },
];

const MOCK_LOGS: IssuanceLog[] = [
  { id: "l1", docName: "납세증명서 (국세완납증명)", user: "김대표", date: "2025-04-03 14:22", type: "민원증명" },
  { id: "l2", docName: "사업자등록증명",           user: "박경리",  date: "2025-04-02 09:45", type: "민원증명" },
  { id: "l3", docName: "표준근로계약서",           user: "이세무",  date: "2025-04-01 16:30", type: "서식" },
  { id: "l4", docName: "소득금액증명",             user: "김대표",  date: "2025-03-28 11:10", type: "민원증명" },
];

function IssuanceCenterPanel() {
  const [subTab, setSubTab] = useState<"cert" | "form">("cert");
  const [toast, setToast] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);
  const currentRole: IssuanceRole = "admin";

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const visibleCerts = CERT_DOCS.filter(d => d.role === "all" || currentRole === "admin");
  const visibleForms = FORM_DOCS.filter(d => d.role === "all" || currentRole === "admin");
  const formCategories = [...new Set(visibleForms.map(f => f.category))];

  const certCustomer = visibleCerts.filter(d => d.role === "all");
  const certAdmin = visibleCerts.filter(d => d.role === "admin");

  return (
    <div style={{ padding: "28px 36px", background: "#fff", minHeight: "70vh", position: "relative" }}>

      {/* 토스트 */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          background: "#0f172a", color: "#fff", padding: "12px 22px",
          borderRadius: 10, fontSize: "0.85rem", fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)", animation: "fadeInDown 0.3s ease"
        }}>{toast}</div>
      )}

      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>서류 발급센터</h2>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>필요한 서류를 즉시 발급하거나 서식을 다운로드할 수 있습니다.</p>
        </div>
        <button
          onClick={() => setShowLog(v => !v)}
          style={{
            background: showLog ? "#1e293b" : "#fff", color: showLog ? "#fff" : "#475569",
            border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 16px",
            fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
          }}
        >{showLog ? "목록 보기" : "📋 발급 이력"}</button>
      </div>

      {/* 발급 이력 모드 */}
      {showLog ? (
        <div>
          <div style={{
            border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 800, color: "#475569", borderBottom: "2px solid #e2e8f0" }}>서류명</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 800, color: "#475569", borderBottom: "2px solid #e2e8f0", width: 80 }}>구분</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 800, color: "#475569", borderBottom: "2px solid #e2e8f0", width: 100 }}>발급자</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 800, color: "#475569", borderBottom: "2px solid #e2e8f0", width: 160 }}>일시</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_LOGS.map(log => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>{log.docName}</td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <span style={{
                        fontSize: "0.7rem", fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                        background: log.type === "민원증명" ? "#eff6ff" : "#f0fdf4",
                        color: log.type === "민원증명" ? "#2563eb" : "#16a34a"
                      }}>{log.type}</span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center", color: "#475569", fontWeight: 600 }}>{log.user}</td>
                    <td style={{ padding: "12px 16px", textAlign: "center", color: "#94a3b8", fontFamily: "monospace", fontSize: "0.78rem" }}>{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* 서브탭 */}
          <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "2px solid #e2e8f0" }}>
            {([
              { key: "cert" as const, label: "민원증명 발급", count: visibleCerts.length },
              { key: "form" as const, label: "서식 자판기", count: visibleForms.length },
            ]).map(t => (
              <button key={t.key}
                onClick={() => setSubTab(t.key)}
                style={{
                  padding: "12px 24px", fontSize: "0.88rem", fontWeight: subTab === t.key ? 800 : 600,
                  color: subTab === t.key ? "#2563eb" : "#64748b",
                  borderBottom: subTab === t.key ? "3px solid #2563eb" : "3px solid transparent",
                  background: "transparent", border: "none", cursor: "pointer",
                  marginBottom: -2, transition: "all 0.2s"
                }}
              >
                {t.label}
                <span style={{
                  marginLeft: 6, fontSize: "0.7rem", fontWeight: 700, padding: "2px 7px",
                  borderRadius: 10, background: subTab === t.key ? "#eff6ff" : "#f1f5f9",
                  color: subTab === t.key ? "#2563eb" : "#94a3b8"
                }}>{t.count}</span>
              </button>
            ))}
          </div>

          {/* ───── 민원증명 발급 탭 ───── */}
          {subTab === "cert" && (
            <div>
              {/* 고객용 */}
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 4, height: 14, background: "#2563eb", borderRadius: 2 }} />
                  고객용 (고객사 화면에서도 노출)
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>({certCustomer.length})</span>
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  {certCustomer.map(doc => (
                    <CertCard key={doc.id} doc={doc} onRequest={() => showToast(`"${doc.name}" 발급 준비 중입니다.`)} />
                  ))}
                </div>
              </div>

              {/* 관리자용 */}
              {certAdmin.length > 0 && (
                <div>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 4, height: 14, background: "#f59e0b", borderRadius: 2 }} />
                    관리자 전용 (대표세무사만 노출)
                    <span style={{ fontSize: "0.65rem", padding: "2px 8px", background: "#fef3c7", color: "#b45309", borderRadius: 4, fontWeight: 700 }}>🔒 ADMIN</span>
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>({certAdmin.length})</span>
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                    {certAdmin.map(doc => (
                      <CertCard key={doc.id} doc={doc} onRequest={() => showToast(`"${doc.name}" 발급 준비 중입니다.`)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ───── 서식 자판기 탭 ───── */}
          {subTab === "form" && (
            <div>
              {/* 업로드 버튼 (관리자만) */}
              {currentRole === "admin" && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                  <button
                    onClick={() => showToast("커스텀 서식 업로드 기능은 준비 중입니다.")}
                    style={{
                      background: "#2563eb", color: "#fff", border: "none", padding: "8px 18px",
                      borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer"
                    }}
                  >+ 서식 업로드</button>
                </div>
              )}

              {formCategories.map(cat => {
                const items = visibleForms.filter(f => f.category === cat);
                return (
                  <div key={cat} style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 4, height: 14, background: "#2563eb", borderRadius: 2 }} />
                      {cat}
                      <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600 }}>({items.length})</span>
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                      {items.map(f => (
                        <button key={f.id}
                          onClick={() => showToast(`"${f.name}" 다운로드 준비 중입니다.`)}
                          style={{
                            display: "flex", alignItems: "center", gap: 14,
                            padding: "16px 18px", background: "#fff", border: "1px solid #e2e8f0",
                            borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
                            textAlign: "left", width: "100%"
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,99,235,0.08)"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                        >
                          <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>📑</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>
                              {f.name}
                              {f.role === "admin" && (
                                <span style={{ marginLeft: 6, fontSize: "0.6rem", fontWeight: 800, background: "#fef3c7", color: "#b45309", padding: "2px 5px", borderRadius: 3 }}>관리자</span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600 }}>
                              {f.fileType} · 클릭하여 다운로드
                            </div>
                          </div>
                          <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>⬇</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CertCard({ doc, onRequest }: { doc: CertDoc; onRequest: () => void }) {
  const badge = SOURCE_BADGE[doc.source];
  return (
    <button
      onClick={onRequest}
      style={{
        display: "flex", flexDirection: "column", gap: 10,
        padding: "18px", background: "#fff", border: "1px solid #e2e8f0",
        borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
        textAlign: "left", width: "100%",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = badge.text; e.currentTarget.style.boxShadow = `0 2px 10px ${badge.text}15`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.35, flex: 1 }}>
          {doc.name}
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 8 }}>
          {doc.role === "admin" && (
            <span style={{ fontSize: "0.58rem", fontWeight: 800, padding: "2px 5px", background: "#fef3c7", color: "#b45309", borderRadius: 3 }}>🔒</span>
          )}
          <span style={{
            fontSize: "0.65rem", fontWeight: 700, padding: "3px 8px", borderRadius: 4,
            background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`,
            whiteSpace: "nowrap"
          }}>{doc.source}</span>
        </div>
      </div>
      <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500, lineHeight: 1.3 }}>
        {doc.purpose}
      </div>
      <div style={{
        marginTop: "auto", background: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: 6, padding: "6px 0", textAlign: "center",
        fontSize: "0.78rem", fontWeight: 700, color: "#475569"
      }}>
        발급 요청
      </div>
    </button>
  );
}


export default function WorkspaceDashboard({ session }: { session: WorkspaceSession }) {
  const router = useRouter();
  const { data, isLoading, error, refresh } = useERPState();
  const [selectedClientId, setSelectedClientId] = useState(session.clientId ?? "");
  const [adminTab, setAdminTab] = useState<"info" | "labor" | "tax">("info");
  const [jobFlash, setJobFlash] = useState<FlashMessage>(null);
  const [jobActionKey, setJobActionKey] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [kakaoStatus, setKakaoStatus] = useState<KakaoConfigStatus | null>(null);
  const [kakaoStatusLoading, setKakaoStatusLoading] = useState(false);
  const [kakaoTemplate, setKakaoTemplate] = useState<KakaoTemplateCode>("DOC_COLLECT_DONE");
  const [kakaoParams, setKakaoParams] = useState<Record<string, string>>({});
  const [kakaoPhone, setKakaoPhone] = useState(session.phone);
  const [kakaoFlash, setKakaoFlash] = useState<FlashMessage>(null);
  const [sendingKakao, setSendingKakao] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const clients = data?.clients ?? [];

  useEffect(() => {
    if (!clients.length) return;

    if (session.scope === "client") {
      if (session.clientId && selectedClientId !== session.clientId) {
        setSelectedClientId(session.clientId);
      }
      return;
    }

    const exists = clients.some((client) => client.id === selectedClientId);
    if (!exists) {
      const nextClient = clients.find((client) => client.mandateStatus === "ACTIVE") ?? clients[0];
      setSelectedClientId(nextClient.id);
    }
  }, [clients, selectedClientId, session.clientId, session.scope]);

  const currentClient =
    clients.find((client) =>
      client.id === (session.scope === "client" ? session.clientId : selectedClientId),
    ) ?? clients[0];

  const documents = currentClient
    ? (data?.documents ?? []).filter((document) => document.clientId === currentClient.id).slice(0, 8)
    : [];
  const jobs = currentClient
    ? (data?.jobs ?? []).filter((job) => job.clientId === currentClient.id).slice(0, 6)
    : [];
  const runningJobs = jobs.filter((job) => job.status === "RUNNING");
  const currentTemplate = KAKAO_TEMPLATES.find((template) => template.code === kakaoTemplate) ?? KAKAO_TEMPLATES[0];
  const adminAlerts = [
    ...serviceRequests.map((request) => {
      const tenant = tenants.find((item) => item.id === request.tenant_id);
      return {
        id: `request-${request.id}`,
        tenantName: tenant?.name ?? "고객사",
        title: request.title,
        body: request.description ?? "고객사에서 새 요청을 보냈습니다.",
        status: request.status === "waiting_client" ? "회신 대기" : requestStatusLabel(request.status),
        createdAt: request.updated_at,
        tone: request.status === "received" ? "new" : request.status === "waiting_client" ? "warn" : "info",
      };
    }),
    ...qnas.map((item) => {
      const tenant = tenants.find((entry) => entry.id === item.tenant_id);
      return {
        id: `qna-${item.id}`,
        tenantName: tenant?.name ?? "고객사",
        title: "고객사 문의",
        body: item.question,
        status: item.status,
        createdAt: item.created_at,
        tone: item.status === "답변대기" ? "new" : "info",
      };
    }),
    ...notifications.map((item) => {
      const tenant = tenants.find((entry) => entry.id === item.tenant_id);
      return {
        id: `notice-${item.id}`,
        tenantName: tenant?.name ?? "고객사",
        title: item.subject ?? noticeLabel(item.type),
        body: item.body,
        status: "발송 이력",
        createdAt: item.sent_at ?? "",
        tone: "muted",
      };
    }),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 12);
  const unreadAlertCount = adminAlerts.filter((alert) => alert.tone === "new" || alert.tone === "warn").length;

  useEffect(() => {
    setKakaoPhone(session.phone);
  }, [session.phone]);

  useEffect(() => {
    setKakaoParams(defaultTemplateParams(kakaoTemplate, session, currentClient));
  }, [currentClient, kakaoTemplate, session]);

  useEffect(() => {
    if (!jobFlash) return;
    const timer = window.setTimeout(() => setJobFlash(null), 5000);
    return () => window.clearTimeout(timer);
  }, [jobFlash]);

  useEffect(() => {
    if (!kakaoFlash) return;
    const timer = window.setTimeout(() => setKakaoFlash(null), 5000);
    return () => window.clearTimeout(timer);
  }, [kakaoFlash]);

  async function loadKakaoStatus() {
    setKakaoStatusLoading(true);
    try {
      const response = await fetch("/api/kakao/send", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("카카오 설정을 확인하지 못했습니다.");
      }

      const nextStatus = (await response.json()) as KakaoConfigStatus;
      setKakaoStatus(nextStatus);
    } catch {
      setKakaoStatus(null);
    } finally {
      setKakaoStatusLoading(false);
    }
  }

  useEffect(() => {
    void loadKakaoStatus();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.refresh();
  }

  async function handleCollection(scope: ChannelKey[], label: string) {
    if (!currentClient) return;

    setJobActionKey(label);
    setJobFlash(null);

    try {
      const response = await fetch(`/api/clients/${currentClient.id}/jobs/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          requestedBy: session.userId,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "수집 작업을 시작하지 못했습니다.");
      }

      await refresh();
      setJobFlash({
        tone: "success",
        text: `${currentClient.name}의 ${label} 작업을 시작했습니다.`,
      });
    } catch (nextError) {
      setJobFlash({
        tone: "error",
        text: nextError instanceof Error ? nextError.message : "수집 작업 요청에 실패했습니다.",
      });
    } finally {
      setJobActionKey(null);
    }
  }

  async function handleKakaoSend() {
    if (!kakaoPhone.trim()) {
      setKakaoFlash({ tone: "error", text: "수신 번호를 입력해 주세요." });
      return;
    }

    setSendingKakao(true);
    setKakaoFlash(null);

    try {
      const response = await fetch("/api/kakao/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "alimtalk",
          payload: {
            recipientPhone: kakaoPhone,
            templateCode: kakaoTemplate,
            templateParams: kakaoParams,
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "카카오 전송에 실패했습니다.");
      }

      setKakaoFlash({ tone: "success", text: "카카오 메시지를 전송했습니다." });
      await loadKakaoStatus();
    } catch (nextError) {
      setKakaoFlash({
        tone: "error",
        text: nextError instanceof Error ? nextError.message : "카카오 전송에 실패했습니다.",
      });
    } finally {
      setSendingKakao(false);
    }
  }

  if (isLoading && !data) {
    return (
      <div className={styles.root}>
        <div className={styles.container}>
          <header className={styles.topbar}>
            <div>
              <span className={styles.sectionEyebrow}>Loading</span>
              <h1 className={styles.topbarTitle}>통합 워크스페이스를 불러오는 중입니다.</h1>
            </div>
          </header>
          <section className={styles.surfaceCard}>
            <p className={styles.emptyState}>ERP 상태를 읽어오는 중입니다.</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.container} data-copy-root>
        <header className={session.scope === "admin" ? styles.adminHeader : styles.topbar}>
          {session.scope === "admin" ? (
            <>
              <div className={styles.adminBrand}>
                <span className={styles.adminBrandEyebrow}>Unified Workspace</span>
                <strong className={styles.adminBrandName}>관리자 운영 워크스페이스</strong>
              </div>
              <nav className={styles.adminTabNav}>
                <button
                  type="button"
                  className={`${styles.adminTabBtn} ${adminTab === "info" ? styles.adminTabBtnActive : ""}`}
                  onClick={() => setAdminTab("info")}
                >
                  기본정보
                </button>
                <button
                  type="button"
                  className={`${styles.adminTabBtn} ${adminTab === "labor" ? styles.adminTabBtnActive : ""}`}
                  onClick={() => setAdminTab("labor")}
                >
                  인사노무
                </button>
                <button
                  type="button"
                  className={`${styles.adminTabBtn} ${adminTab === "tax" ? styles.adminTabBtnActive : ""}`}
                  onClick={() => setAdminTab("tax")}
                >
                  세무회계
                </button>
              </nav>
              <div className={styles.adminHeaderActions}>
                <div className={styles.alertWrap}>
                  <button
                    type="button"
                    className={styles.alertButton}
                    onClick={() => setAlertOpen((current) => !current)}
                  >
                    <Bell size={16} />
                    {unreadAlertCount ? <span className={styles.alertDot}>{unreadAlertCount}</span> : null}
                  </button>
                  {alertOpen ? (
                    <div className={styles.alertPanel}>
                      <div className={styles.alertPanelHeader}>
                        <strong>고객사 알림</strong>
                        <span>{adminAlerts.length}건</span>
                      </div>
                      <div className={styles.alertList}>
                        {adminAlerts.map((alert) => (
                          <div key={alert.id} className={styles.alertItem}>
                            <div className={styles.alertItemTop}>
                              <b>{alert.tenantName}</b>
                              <span className={`${styles.alertState} ${styles[`alertState${capitalizeTone(alert.tone)}`]}`}>
                                {alert.status}
                              </span>
                            </div>
                            <strong>{alert.title}</strong>
                            <p>{alert.body}</p>
                            <small>{formatFullDateTime(alert.createdAt)}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <CopyPageButton label={`관리자 ${adminTab === "labor" ? "인사노무" : "세무회계"}`} />
                <div className={styles.adminUserBadge}>
                  <span>{session.roleLabel}</span>
                  <strong>{session.name}</strong>
                </div>
                <button
                  type="button"
                  className={styles.adminLogoutButton}
                  disabled={loggingOut}
                  onClick={handleLogout}
                >
                  {loggingOut ? "로그아웃 중..." : "로그아웃"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h1 className={styles.topbarTitle}>고객사 전용 워크스페이스</h1>
              </div>
              <div className={styles.topbarActions}>
                <CopyPageButton label={`${session.companyName} 고객사 워크스페이스`} />
                <div className={styles.userBadge}>
                  <span>{session.roleLabel}</span>
                  <strong>{session.name}</strong>
                </div>
                {session.tenantSlug ? (
                  <Link href={`/portal/${session.tenantSlug}/dashboard`} className={styles.linkButton}>
                    고객 포털 상세
                  </Link>
                ) : null}
                <button
                  type="button"
                  className={styles.secondaryButton}
                  disabled={loggingOut}
                  onClick={handleLogout}
                >
                  {loggingOut ? "로그아웃 중..." : "로그아웃"}
                </button>
              </div>
            </>
          )}
        </header>

        {error ? <FlashBanner message={{ tone: "error", text: error }} /> : null}

        {session.scope === "admin" ? (
          <AdminView
            clients={clients}
            currentClientId={currentClient?.id}
            setCurrentClientId={setSelectedClientId}
            currentClientName={currentClient?.name ?? ""}
            jobActionKey={jobActionKey}
            jobFlash={jobFlash}
            jobs={jobs}
            documents={documents}
            dataBridgeConnected={Boolean(data?.bridgeAgent.connected)}
            dataBridgePort={data?.bridgeAgent.port}
            stats={data?.stats}
            runningJobsCount={runningJobs.length}
            onRun={handleCollection}
            adminTab={adminTab}
            setAdminTab={setAdminTab}
          />
        ) : (
          <ClientView
            companyName={session.companyName}
            currentClient={currentClient}
            jobActionKey={jobActionKey}
            jobFlash={jobFlash}
            jobs={jobs}
            documents={documents}
            onRun={handleCollection}
            tenantSlug={session.tenantSlug}
          />
        )}

        {session.scope === "client" ? (
          <section className={styles.kakaoSection}>
            <div className={styles.surfaceHeader}>
              <div>
                <span className={styles.sectionEyebrow}>Kakao</span>
                <h2 className={styles.surfaceTitle}>카카오 안내 즉시 받기</h2>
              </div>
              <Link href="/erp/kakao" className={styles.linkButton}>
                전체 메시지 센터
              </Link>
            </div>

            <div className={styles.kakaoGrid}>
              <section className={styles.surfaceCard}>
                <label className={styles.field}>
                  <span>수신 번호</span>
                  <input
                    type="tel"
                    value={kakaoPhone}
                    onChange={(event) => setKakaoPhone(event.target.value)}
                    placeholder="010-0000-0000"
                  />
                </label>

                <label className={styles.field}>
                  <span>전송 템플릿</span>
                  <select
                    value={kakaoTemplate}
                    onChange={(event) => setKakaoTemplate(event.target.value as KakaoTemplateCode)}
                  >
                    {KAKAO_TEMPLATES.map((template) => (
                      <option key={template.code} value={template.code}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className={styles.templateHint}>{currentTemplate.description}</div>

                <div className={styles.fieldGrid}>
                  {currentTemplate.fields.map((field) => (
                    <label key={field} className={styles.field}>
                      <span>{field}</span>
                      <input
                        type="text"
                        value={kakaoParams[field] ?? ""}
                        onChange={(event) =>
                          setKakaoParams((current) => ({
                            ...current,
                            [field]: event.target.value,
                          }))
                        }
                      />
                    </label>
                  ))}
                </div>

                {kakaoFlash ? <FlashBanner message={kakaoFlash} /> : null}

                <div className={styles.buttonRow}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    disabled={sendingKakao}
                    onClick={handleKakaoSend}
                  >
                    {sendingKakao ? "전송 중..." : "카카오 즉시 전송"}
                  </button>
                </div>
              </section>

              <section className={styles.surfaceCard}>
                <div className={styles.previewBox}>
                  <span className={styles.sectionEyebrow}>Preview</span>
                  <pre>{previewMessage(kakaoTemplate, kakaoParams)}</pre>
                </div>

                <div className={styles.configBox}>
                  <div className={styles.configHeader}>
                    <strong>설정 상태</strong>
                    <button type="button" className={styles.ghostButton} onClick={() => void loadKakaoStatus()}>
                      {kakaoStatusLoading ? "확인 중..." : "다시 확인"}
                    </button>
                  </div>

                  {kakaoStatus ? (
                    <>
                      <div className={`${styles.statusPill} ${kakaoStatus.configured ? styles.toneSuccess : styles.toneDanger}`}>
                        {kakaoStatus.configured ? "전송 가능" : "설정 필요"}
                      </div>
                      <p className={styles.configText}>
                        필수 누락: {kakaoStatus.missing.length ? kakaoStatus.missing.join(", ") : "없음"}
                      </p>
                      <p className={styles.configText}>
                        선택 누락: {kakaoStatus.optionalMissing.length ? kakaoStatus.optionalMissing.join(", ") : "없음"}
                      </p>
                    </>
                  ) : (
                    <p className={styles.configText}>카카오 설정 상태를 불러오지 못했습니다.</p>
                  )}
                </div>
              </section>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function AdminView(props: {
  clients: ERPClient[];
  currentClientId?: string;
  setCurrentClientId: (clientId: string) => void;
  currentClientName: string;
  jobActionKey: string | null;
  jobFlash: FlashMessage;
  jobs: ERPJob[];
  documents: ERPDocument[];
  dataBridgeConnected: boolean;
  dataBridgePort?: number;
  stats?: {
    totalClients: number;
    todaySuccess: number;
    todayFailed: number;
    todayRunning: number;
    needsAction: number;
  };
  runningJobsCount: number;
  onRun: (scope: ChannelKey[], label: string) => void;
  adminTab: "info" | "labor" | "tax";
  setAdminTab: (tab: "info" | "labor" | "tax") => void;
}) {
  const [taxTab, setTaxTab] = useState<"business" | "consulting" | "issuance">("business");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [companyQuery, setCompanyQuery] = useState("");
  const [employeeQuery, setEmployeeQuery] = useState("");
  const companyRecords = props.clients.map((client) => {
    const tenant = tenants.find((item) => item.name === client.name);
    const companyEmployees = tenant ? employees.filter((employee) => employee.tenant_id === tenant.id) : [];
    const companyIssues = tenant ? laborIssues.filter((issue) => issue.tenant_id === tenant.id) : [];
    const companyTasks = tenant
      ? workTasks.filter((task) => task.tenant_id === tenant.id && (task.domain === "노무" || task.domain === "공통"))
      : [];

    return {
      client,
      tenant,
      employeeCount: companyEmployees.length,
      issueCount: companyIssues.length,
      openTaskCount: companyTasks.filter((task) => task.status !== "done").length,
    };
  });
  const filteredCompanyRecords = companyRecords.filter(({ client }) => {
    const keyword = companyQuery.trim().toLowerCase();
    if (!keyword) return true;
    return client.name.toLowerCase().includes(keyword) || client.bizNo.includes(keyword);
  });
  const selectedCompanyRecord =
    filteredCompanyRecords.find(({ client }) => client.id === props.currentClientId) ??
    companyRecords.find(({ client }) => client.id === props.currentClientId) ??
    filteredCompanyRecords[0] ??
    companyRecords[0];
  const selectedClient = selectedCompanyRecord?.client;
  const tenant = selectedCompanyRecord?.tenant;
  const tenantEmployees = (tenant ? employees.filter((employee) => employee.tenant_id === tenant.id) : [])
    .filter((employee) => {
      const keyword = employeeQuery.trim().toLowerCase();
      if (!keyword) return true;
      return [
        employee.full_name,
        employee.department ?? "",
        employee.job_title ?? "",
        employee.phone ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    })
    .sort((a, b) => a.hire_date.localeCompare(b.hire_date));
  const tenantLaborTasks = tenant
    ? workTasks.filter(
        (task) => task.tenant_id === tenant.id && (task.domain === "노무" || task.domain === "공통"),
      )
    : [];
  const tenantTaxTasks = tenant ? taxTasks.filter((task) => task.tenant_id === tenant.id) : [];
  const tenantMonthlyReports = tenant ? monthlyReports.filter((report) => report.tenant_id === tenant.id) : [];

  useEffect(() => {
    if (!filteredCompanyRecords.length) {
      return;
    }

    const exists = filteredCompanyRecords.some(({ client }) => client.id === props.currentClientId);
    if (!exists) {
      props.setCurrentClientId(filteredCompanyRecords[0].client.id);
    }
  }, [filteredCompanyRecords, props, props.currentClientId]);

  return (
    <>
      <section className={styles.operationsSummaryBar}>
        <div>
          <span className={styles.sectionEyebrow}>Admin Workspace</span>
          <h2 className={styles.summaryBarTitle}>관리자 업무 현황</h2>
          <p className={styles.summaryBarText}>업체, 근로자, 진행 업무를 한 화면에서 관리합니다.</p>
        </div>
        <div className={styles.summaryBarMetrics}>
          <div className={styles.summaryBarMetric}>
            <span>관리 업체</span>
            <strong>{props.stats?.totalClients ?? props.clients.length}</strong>
          </div>
          <div className={styles.summaryBarMetric}>
            <span>확인 필요</span>
            <strong>{props.stats?.needsAction ?? 0}</strong>
          </div>
          <div className={styles.summaryBarMetric}>
            <span>진행 중 작업</span>
            <strong>{props.runningJobsCount}</strong>
          </div>
        </div>
      </section>

      {props.adminTab === "info" ? (
        <CompanyInfoPage />
      ) : props.adminTab === "labor" ? (
        <section className={styles.laborBoardShell}>
          <section className={styles.companyDatabaseSection}>
            <div className={styles.companyListBar}>
              <div>
                <h2 className={styles.surfaceTitle}>업체 / 근로자 시트</h2>
              </div>
              <div className={styles.companyListBarTools}>
                <label className={styles.inlineSearchField}>
                  <input
                    type="text"
                    value={companyQuery}
                    onChange={(event) => setCompanyQuery(event.target.value)}
                    placeholder="업체명 또는 사업자번호 검색"
                  />
                </label>
                <div className={styles.counterPill}>{filteredCompanyRecords.length}개 업체</div>
              </div>
            </div>

            <div className={styles.companyListSheet}>
              <div className={styles.companyListHead}>
                <span>업체명 / 사업자번호</span>
                <span>담당자</span>
                <span>근로자 수</span>
                <span>진행 업무</span>
                <span>오픈 이슈</span>
                <span>상태</span>
              </div>
              {filteredCompanyRecords.map(({ client, employeeCount, issueCount, openTaskCount, tenant: rowTenant }) => {
                const isActive = client.id === props.currentClientId;
                const rowEmployees = (rowTenant ? employees.filter((employee) => employee.tenant_id === rowTenant.id) : [])
                  .filter((employee) => {
                    const keyword = employeeQuery.trim().toLowerCase();
                    if (!keyword) return true;
                    return [
                      employee.full_name,
                      employee.department ?? "",
                      employee.job_title ?? "",
                      employee.phone ?? "",
                    ]
                      .join(" ")
                      .toLowerCase()
                      .includes(keyword);
                  })
                  .sort((a, b) => a.hire_date.localeCompare(b.hire_date));
                const rowRequests = rowTenant
                  ? serviceRequests.filter((request) => request.tenant_id === rowTenant.id)
                  : [];
                const hireRequests = rowRequests.filter((request) => request.type === "hire");
                const payChangeRequests = rowRequests.filter((request) => request.type === "pay_change");
                const pendingClientRequests = rowRequests.filter(
                  (request) => request.status === "waiting_client" || request.status === "received",
                );
                const rowContracts = rowTenant
                  ? contracts.filter((contract) => contract.tenant_id === rowTenant.id)
                  : [];
                const rowPayrollDocs = rowTenant
                  ? laborDocuments.filter(
                      (document) => document.tenant_id === rowTenant.id && document.category === "payroll",
                    )
                  : [];
                const socialInsuranceTasks = rowTenant
                  ? workTasks.filter(
                      (task) =>
                        task.tenant_id === rowTenant.id &&
                        (task.title.includes("4대보험") || task.title.includes("취득") || task.title.includes("상실")),
                    )
                  : [];
                const inactiveEmployees = rowTenant
                  ? employees.filter(
                      (employee) => employee.tenant_id === rowTenant.id && employee.employment_status !== "active",
                    )
                  : [];
                const automationCards = [
                  {
                    title: "신규 채용 접수",
                    metric: `${hireRequests.length}건`,
                    detail: hireRequests.length
                      ? "알림 또는 고객사 입력을 기준으로 자동 셋팅됩니다."
                      : "대기 중인 신규 채용이 없습니다.",
                    status: hireRequests.length ? "자동 작성 대기" : "안정",
                  },
                  {
                    title: "근로계약서 자동작성",
                    metric: `${rowContracts.length}건`,
                    detail: rowContracts.length
                      ? "미리 세팅한 템플릿으로 계약서 초안을 생성합니다."
                      : "신규 입사자 발생 시 자동 생성됩니다.",
                    status: rowContracts.some((contract) => contract.status !== "fully_signed") ? "확인 필요" : "전달 완료",
                  },
                  {
                    title: "4대보험 / 변동 반영",
                    metric: `${socialInsuranceTasks.length}건`,
                    detail: socialInsuranceTasks.length
                      ? "취득·상실·변동 신고 흐름을 같이 추적합니다."
                      : "현재 보험 변동 건이 없습니다.",
                    status: socialInsuranceTasks.some((task) => task.status !== "done") ? "신고 대기" : "안정",
                  },
                  {
                    title: "급여자료 수집",
                    metric: `${pendingClientRequests.length}건`,
                    detail: pendingClientRequests.length
                      ? "고객사 자료 회신을 기준으로 급여 정리를 시작합니다."
                      : "이번 달 자료 수집 이슈가 없습니다.",
                    status: pendingClientRequests.length ? "자료 대기" : "수집 완료",
                  },
                  {
                    title: "명세서 / 대장 생성",
                    metric: `${rowPayrollDocs.length}건`,
                    detail: rowPayrollDocs.length
                      ? "급여명세서와 급여대장을 묶어 고객사 전달 대기 중입니다."
                      : "급여일 전 자동 생성 파이프라인을 준비합니다.",
                    status: rowPayrollDocs.length ? "전송 준비" : "생성 예정",
                  },
                  {
                    title: "급여 변경 / 재계약",
                    metric: `${payChangeRequests.length}건`,
                    detail: payChangeRequests.length
                      ? "보수월액, 수당, 재계약 변경을 이어서 관리합니다."
                      : "이번 달 급여 변경 요청이 없습니다.",
                    status: payChangeRequests.length ? "검토 필요" : "안정",
                  },
                  {
                    title: "퇴사 / 상실 정리",
                    metric: `${inactiveEmployees.length}명`,
                    detail: inactiveEmployees.length
                      ? "퇴사자 서류, 상실, 정산, 보관 문서를 묶어 관리합니다."
                      : "현재 퇴사 정리 대상자가 없습니다.",
                    status: inactiveEmployees.length ? "정산 필요" : "안정",
                  },
                ];

                return (
                  <div key={client.id} className={styles.companyBlock}>
                    <button
                      type="button"
                      className={`${styles.companyListRow} ${isActive ? styles.companyListRowActive : ""}`}
                      onClick={() => props.setCurrentClientId(client.id)}
                    >
                      <div className={styles.companyListNameCell}>
                        <strong>{client.name}</strong>
                        <span>{client.bizNo}</span>
                      </div>
                      <div className={styles.companyListMetaCell}>
                        <span>담당 {client.manager}</span>
                      </div>
                      <div className={styles.companyListMetaCell}>
                        <span>근로자 {employeeCount}명</span>
                      </div>
                      <div className={styles.companyListMetaCell}>
                        <span>업무 {openTaskCount}건</span>
                      </div>
                      <div className={styles.companyListMetaCell}>
                        <span className={issueCount ? styles.textDanger : ""}>이슈 {issueCount}건</span>
                      </div>
                      <div className={styles.companyListStatusCell}>
                        <span className={`${styles.statusPill} ${statusTone(client.channels.hometax)}`}>
                          {channelSummary(client)}
                        </span>
                      </div>
                    </button>

                    {isActive ? (
                      <div className={styles.inlineEmployeePanel}>
                        <div className={styles.inlineEmployeeToolbar}>
                          <div className={styles.inlineEmployeeTitleGroup}>
                            <strong>{client.name} 근로자</strong>
                            <span>계약, 급여, 자료를 한 줄에서 확인합니다.</span>
                          </div>
                          <div className={styles.inlineEmployeeToolbarRight}>
                            <label className={styles.sheetSearch}>
                              <input
                                type="text"
                                value={employeeQuery}
                                onChange={(event) => setEmployeeQuery(event.target.value)}
                                placeholder="이름, 부서, 직책 검색"
                              />
                            </label>
                          </div>
                        </div>

                        <div className={styles.inlineEmployeeMeta}>
                          <span>총 {rowEmployees.length}명</span>
                          <span>담당자 {client.manager}</span>
                          <span>사업자번호 {client.bizNo}</span>
                          <span>인사노무 업무 {tenantLaborTasks.length}건</span>
                          <span>4대보험 {socialInsuranceTasks.length}건</span>
                          <span>급여변경 {payChangeRequests.length}건</span>
                        </div>

                        <div className={styles.automationBoard}>
                          {automationCards.map((card) => (
                            <div key={card.title} className={styles.automationCard}>
                              <div className={styles.automationCardTop}>
                                <strong>{card.title}</strong>
                                <span className={styles.automationBadge}>{card.status}</span>
                              </div>
                              <b>{card.metric}</b>
                              <p>{card.detail}</p>
                              <div className={styles.automationActions}>
                                <button type="button" className={styles.actionButton}>
                                  확인
                                </button>
                                <button type="button" className={styles.actionButtonPrimary}>
                                  전송
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {rowTenant ? (
                          <div className={styles.databaseTable}>
                            <div className={`${styles.databaseHead} ${styles.laborDatabaseHead}`}>
                              <span>근로자</span>
                              <span>입사 / 계약 자동화</span>
                              <span>계약기간</span>
                              <span>근로계약서</span>
                              <span>급여 정리</span>
                              <span>급여명세서</span>
                              <span>각종 자료</span>
                              <span>부서 / 직책</span>
                              <span>실무 상태</span>
                            </div>

                            {rowEmployees.map((employee) => {
                              const employeeLeave = leaveBalances.find(
                                (leave) => leave.tenant_id === rowTenant.id && leave.employee_id === employee.id,
                              );
                              const employeeContracts = contracts.filter(
                                (contract) => contract.tenant_id === rowTenant.id && contract.employee_id === employee.id,
                              );
                              const primaryContract = employeeContracts[0];
                              const employeeDocs = laborDocuments.filter(
                                (document) => document.tenant_id === rowTenant.id && document.employee_id === employee.id,
                              );
                              const employeePayrollDocs = employeeDocs.filter(
                                (document) => document.category === "payroll" || document.title.includes("급여"),
                              );
                              const employeeMiscDocs = employeeDocs.filter(
                                (document) => document.category !== "contracts" && document.category !== "payroll",
                              );
                              const employeeLaborTasks = workTasks.filter(
                                (task) =>
                                  task.tenant_id === rowTenant.id &&
                                  task.employee_id === employee.id &&
                                  (task.domain === "노무" || task.domain === "공통") &&
                                  task.status !== "done",
                              );
                              const employeeIssues = laborIssues.filter(
                                (issue) => issue.tenant_id === rowTenant.id && issue.employee_id === employee.id,
                              );
                              const employeeRequest = rowRequests.find(
                                (request) => request.employee_id === employee.id,
                              );
                              const payrollPrep = payrollPreparationLabel(
                                employeePayrollDocs.length > 0,
                                employeeRequest?.status === "waiting_client" || employeeRequest?.status === "received",
                                employee.hire_date,
                              );

                              return (
                                <div key={employee.id} className={styles.databaseRow}>
                                  <span className={styles.cellPrimary}>
                                    {employee.full_name}
                                    <small>{employee.employment_status === "active" ? "재직" : employee.employment_status}</small>
                                  </span>
                                  <span className={styles.cellStatus}>
                                    <b>{employeeRequest ? requestTypeLabel(employeeRequest.type) : "정기 운영"}</b>
                                    <small>
                                      {employeeRequest
                                        ? shortRequestSummary(employeeRequest.type, employeeRequest.status)
                                        : "정기 운영"}
                                    </small>
                                  </span>
                                  <span className={styles.cellStatus}>
                                    <b>{contractPeriodLabel(employee, primaryContract?.title)}</b>
                                    <small>{primaryContract ? "계약 기준" : "미등록"}</small>
                                  </span>
                                  <span className={styles.cellStatus}>
                                    <span className={styles.documentActionRow}>
                                      <button
                                        type="button"
                                        className={primaryContract ? `${styles.downloadChip} ${styles.downloadChipActive}` : styles.downloadChip}
                                      >
                                        다운
                                      </button>
                                      <button
                                        type="button"
                                        className={primaryContract ? styles.actionButton : styles.actionButtonMuted}
                                      >
                                        확인
                                      </button>
                                      <button
                                        type="button"
                                        className={primaryContract ? styles.actionButtonPrimary : styles.actionButtonMuted}
                                      >
                                        전송
                                      </button>
                                    </span>
                                    <small>
                                      {primaryContract
                                        ? `${contractStatusLabel(primaryContract.status)} · 계약서`
                                        : "자동작성 대기"}
                                    </small>
                                  </span>
                                  <span className={styles.cellStatus}>
                                    <b>{payrollPrep.title}</b>
                                    <small>{payrollPrep.title === "자료 대기" ? "자료 회신 후 생성" : payrollPrep.title === "정리 완료" ? "생성 완료" : "급여일 전 생성"}</small>
                                  </span>
                                  <span className={styles.cellStatus}>
                                    <span className={styles.documentActionRow}>
                                      <button
                                        type="button"
                                        className={employeePayrollDocs.length ? `${styles.downloadChip} ${styles.downloadChipActive}` : styles.downloadChip}
                                      >
                                        다운
                                      </button>
                                      <button
                                        type="button"
                                        className={employeePayrollDocs.length ? styles.actionButton : styles.actionButtonMuted}
                                      >
                                        확인
                                      </button>
                                      <button
                                        type="button"
                                        className={employeePayrollDocs.length ? styles.actionButtonPrimary : styles.actionButtonMuted}
                                      >
                                        전송
                                      </button>
                                    </span>
                                    <small>
                                      {employeePayrollDocs.length
                                        ? `${employeePayrollDocs.length}건 · 다운로드 가능`
                                        : "미발행 · 검토 후 전송"}
                                    </small>
                                  </span>
                                  <span className={styles.cellStatus}>
                                    <b>
                                      {employeeMiscDocs.length ? `${employeeMiscDocs.length}건` : employeeLeave ? `${employeeLeave.remaining_days}일` : "-"}
                                    </b>
                                    <small>
                                      {employeeMiscDocs[0]?.title ?? (employeeLeave ? `연차 잔여 ${employeeLeave.remaining_days}일` : "자료 없음")}
                                    </small>
                                  </span>
                                  <span className={styles.cellStack}>
                                    <b>{employee.department ?? "-"}</b>
                                    <small>{employee.job_title ?? "직책 미지정"}</small>
                                  </span>
                                  <span className={styles.cellStatus}>
                                    <b>{employeeLaborTasks.length ? `${employeeLaborTasks.length}건 진행` : "정상"}</b>
                                    <small className={employeeIssues.length ? styles.textDanger : ""}>
                                      {employeeIssues.length ? `이슈 ${employeeIssues.length}건` : "리스크 없음"}
                                    </small>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className={styles.emptyState}>등록된 근로자가 없습니다.</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        </section>
      ) : (
        <section style={{ background: "#f8fafc" }}>
          <nav style={{
            display: "flex", gap: "24px", padding: "0 32px", borderBottom: "1px solid #e2e8f0", background: "#fff"
          }}>
            <button
              style={{ padding: "16px 0", fontSize: "0.95rem", fontWeight: taxTab === "business" ? 800 : 600, color: taxTab === "business" ? "#2563eb" : "#64748b", borderBottom: taxTab === "business" ? "3px solid #2563eb" : "3px solid transparent", background: "transparent", border: "none", cursor: "pointer", transition: "all 0.2s" }}
              onClick={() => setTaxTab("business")}
            >
              사업
            </button>
            <button
              style={{ padding: "16px 0", fontSize: "0.95rem", fontWeight: taxTab === "consulting" ? 800 : 600, color: taxTab === "consulting" ? "#2563eb" : "#64748b", borderBottom: taxTab === "consulting" ? "3px solid #2563eb" : "3px solid transparent", background: "transparent", border: "none", cursor: "pointer", transition: "all 0.2s" }}
              onClick={() => setTaxTab("consulting")}
            >
              컨설팅
            </button>
            <button
              style={{ padding: "16px 0", fontSize: "0.95rem", fontWeight: taxTab === "issuance" ? 800 : 600, color: taxTab === "issuance" ? "#2563eb" : "#64748b", borderBottom: taxTab === "issuance" ? "3px solid #2563eb" : "3px solid transparent", background: "transparent", border: "none", cursor: "pointer", transition: "all 0.2s" }}
              onClick={() => setTaxTab("issuance")}
            >
              발급센터
            </button>
          </nav>
          <div>
            {taxTab === "business" && <ControlTowerPage />}
            {taxTab === "consulting" && <ReportPage />}
            {taxTab === "issuance" && <IssuanceCenterPanel />}
          </div>
        </section>
      )}
    </>
  );
}


function formatDate(value: string) {
  return value.replaceAll("-", ".");
}

function contractPeriodLabel(
  employee: { hire_date: string; employment_status: string },
  contractTitle?: string,
) {
  if (contractTitle?.includes("정규직")) {
    return "기간의 정함 없음";
  }

  const start = employee.hire_date;
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);
  endDate.setDate(endDate.getDate() - 1);

  if (employee.employment_status !== "active") {
    return `${formatDate(start)} ~ 종료`;
  }

  return `${formatDate(start)} ~ ${formatDate(endDate.toISOString().slice(0, 10))}`;
}

function contractStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "초안";
    case "sent":
      return "발송";
    case "employee_signed":
      return "직원 서명";
    case "fully_signed":
      return "완료";
    case "void":
      return "무효";
    default:
      return status;
  }
}

function requestStatusLabel(status: string) {
  switch (status) {
    case "received":
      return "접수";
    case "in_progress":
      return "진행 중";
    case "waiting_client":
      return "고객 확인";
    case "done":
      return "완료";
    default:
      return status;
  }
}

function requestTypeLabel(type: string) {
  switch (type) {
    case "hire":
      return "신규 채용";
    case "pay_change":
      return "급여 변경";
    case "file_request":
      return "자료 요청";
    default:
      return type;
  }
}

function payrollPreparationLabel(hasPayrollDoc: boolean, hasClientPendingRequest: boolean, hireDate: string) {
  if (hasPayrollDoc) {
    return { title: "정리 완료", detail: "급여명세서와 급여대장 생성 완료" };
  }
  if (hasClientPendingRequest) {
    return { title: "자료 대기", detail: "고객사 급여 자료 확인 후 생성" };
  }

  const joinedAt = new Date(`${hireDate}T00:00:00`);
  const recentJoin = Date.now() - joinedAt.getTime() < 1000 * 60 * 60 * 24 * 45;
  if (recentJoin) {
    return { title: "신규 반영", detail: "입사자 급여 기준 반영 예정" };
  }

  return { title: "생성 예정", detail: "급여일 전 최종 검토 후 발행" };
}

function payrollPacketLabel(hasPayrollDoc: boolean) {
  return hasPayrollDoc ? "고객사 다운로드 가능" : "검토 후 고객사 전송";
}

function capitalizeTone(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function shortRequestSummary(type: string, status: string) {
  const typeLabel = requestTypeLabel(type);
  const statusLabel = requestStatusLabel(status);
  return `${statusLabel} · ${typeLabel}`;
}

function ClientView(props: {
  companyName: string;
  currentClient?: ERPClient;
  jobActionKey: string | null;
  jobFlash: FlashMessage;
  jobs: ERPJob[];
  documents: ERPDocument[];
  onRun: (scope: ChannelKey[], label: string) => void;
  tenantSlug?: string;
}) {
  return (
    <>
      <section className={styles.heroStrip}>
        <div>
          <span className={styles.sectionEyebrow}>Client View</span>
          <h2 className={styles.heroStripTitle}>고객사 계정은 내 사업장 정보와 실행 버튼만 보입니다.</h2>
          <p className={styles.heroStripText}>
            관리자 메뉴, 타 고객사 목록, 내부 운영 정보는 숨기고 홈택스/4대보험 상태와 최신 서류,
            카카오 안내 발송만 남겼습니다.
          </p>
        </div>
        <div className={styles.heroStripMeta}>
          <div className={styles.heroMetric}>
            <span>고객사</span>
            <strong>{props.companyName}</strong>
          </div>
          <div className={styles.heroMetric}>
            <span>포털</span>
            <strong>{props.tenantSlug ? "연결됨" : "미연결"}</strong>
          </div>
        </div>
      </section>

      <section className={styles.statsGrid}>
        <StatCard label="내 문서" value={String(props.documents.length)} hint="최근 8건 기준" />
        <StatCard label="최근 작업" value={String(props.jobs.length)} hint="사업장 실행 이력" />
        <StatCard
          label="홈택스 상태"
          value={props.currentClient ? STATUS_LABELS[props.currentClient.channels.hometax] : "-"}
          hint="사업장 연결 상태"
        />
        <StatCard
          label="4대보험 상태"
          value={props.currentClient ? STATUS_LABELS[props.currentClient.channels.fourInsure] : "-"}
          hint="사업장 연결 상태"
        />
      </section>

      <div className={styles.clientGrid}>
        <section className={styles.surfaceCard}>
          <div className={styles.surfaceHeader}>
            <div>
              <span className={styles.sectionEyebrow}>My Company</span>
              <h2 className={styles.surfaceTitle}>{props.currentClient?.name ?? props.companyName}</h2>
            </div>
            {props.tenantSlug ? (
              <Link href={`/portal/${props.tenantSlug}/dashboard`} className={styles.linkButton}>
                고객 포털 상세
              </Link>
            ) : null}
          </div>
          <DetailView
            clientName={props.companyName}
            currentClient={props.currentClient}
            jobActionKey={props.jobActionKey}
            jobFlash={props.jobFlash}
            jobs={props.jobs}
            documents={props.documents}
            runningJobsCount={props.jobs.filter((job) => job.status === "RUNNING").length}
            onRun={props.onRun}
            clientMode
            showDocumentsPanel={false}
          />
        </section>

        <DocumentsPanel companyName={props.companyName} documents={props.documents} />
      </div>
    </>
  );
}

function DetailView(props: {
  clientName: string;
  currentClient?: ERPClient;
  jobActionKey: string | null;
  jobFlash: FlashMessage;
  jobs: ERPJob[];
  documents: ERPDocument[];
  runningJobsCount: number;
  onRun: (scope: ChannelKey[], label: string) => void;
  clientMode?: boolean;
  showDocumentsPanel?: boolean;
}) {
  const client = props.currentClient;

  if (!client) {
    return <p className={styles.emptyState}>ERP 데이터를 찾지 못했습니다.</p>;
  }

  const channels = props.clientMode ? (["hometax", "fourInsure"] as ChannelKey[]) : (Object.keys(CONNECTOR_LABELS) as ChannelKey[]);

  return (
    <>
      <div className={styles.detailHeadline}>
        <div>
          <div className={styles.companyMeta}>{client.bizNo}</div>
          <h3>{props.clientMode ? "연결 상태와 최신 수집" : `${client.name} 연결 센터`}</h3>
          <p>담당 {client.manager} · 마지막 수집 {formatFullDateTime(client.lastRunAt)}</p>
        </div>
        <span className={styles.mandateBadge}>{client.mandateStatus}</span>
      </div>

      <div className={styles.connectorGrid}>
        {channels.map((channel) => (
          <div key={channel} className={styles.connectorCard}>
            <span>{CONNECTOR_LABELS[channel]}</span>
            <strong>{STATUS_LABELS[client.channels[channel]]}</strong>
            <div className={`${styles.statusPill} ${statusTone(client.channels[channel])}`}>
              {client.channels[channel]}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.buttonRow}>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={props.jobActionKey === (props.clientMode ? "홈택스 최신 수집" : "홈택스 연결")}
          onClick={() => props.onRun(["hometax"], props.clientMode ? "홈택스 최신 수집" : "홈택스 연결")}
        >
          {props.jobActionKey === (props.clientMode ? "홈택스 최신 수집" : "홈택스 연결")
            ? "실행 중..."
            : props.clientMode
              ? "홈택스 최신 수집"
              : "홈택스 연결 실행"}
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={props.jobActionKey === (props.clientMode ? "4대보험 최신 수집" : "4대보험 연결")}
          onClick={() =>
            props.onRun(["fourInsure"], props.clientMode ? "4대보험 최신 수집" : "4대보험 연결")
          }
        >
          {props.jobActionKey === (props.clientMode ? "4대보험 최신 수집" : "4대보험 연결")
            ? "실행 중..."
            : props.clientMode
              ? "4대보험 최신 수집"
              : "4대보험 연결 실행"}
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={props.jobActionKey === (props.clientMode ? "전체 최신 수집" : "통합 재수집")}
          onClick={() =>
            props.onRun(["hometax", "fourInsure"], props.clientMode ? "전체 최신 수집" : "통합 재수집")
          }
        >
          {props.jobActionKey === (props.clientMode ? "전체 최신 수집" : "통합 재수집")
            ? "실행 중..."
            : props.clientMode
              ? "전체 최신 수집"
              : "통합 재수집"}
        </button>
      </div>

      {props.jobFlash ? <FlashBanner message={props.jobFlash} /> : null}

      {props.runningJobsCount > 0 ? (
        <div className={styles.inlineNotice}>
          현재 진행 중인 작업이 있습니다. 하단 최근 작업에서 상태를 확인할 수 있습니다.
        </div>
      ) : null}

      {props.showDocumentsPanel === false ? (
        <JobsPanel jobs={props.jobs} />
      ) : (
        <div className={styles.contentSplit}>
          <DocumentsPanel companyName={props.clientName} documents={props.documents} />
          <JobsPanel jobs={props.jobs} />
        </div>
      )}
    </>
  );
}
