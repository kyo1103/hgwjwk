"use client";

import { useState } from "react";
import type { CompanyEditInfo, CompanyContact, CompanySetupAsset } from "@/lib/server/portal-store";

interface Props {
  tenantSlug: string;
  initialInfo: CompanyEditInfo;
  canEditSensitive: boolean;
}

export function CompanyEditForm({ tenantSlug, initialInfo, canEditSensitive }: Props) {
  const [info, setInfo] = useState<CompanyEditInfo>(initialInfo);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<CompanyEditInfo>(initialInfo);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const startEdit = () => {
    setDraft({ ...info });
    setEditing(true);
    setSaved(false);
  };

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/${tenantSlug}/company`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        const data = await res.json() as { info: CompanyEditInfo };
        setInfo(data.info);
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateContact = (idx: number, field: keyof CompanyContact, value: string) => {
    const contacts = [...draft.contacts];
    contacts[idx] = { ...contacts[idx], [field]: value };
    setDraft((d) => ({ ...d, contacts }));
  };

  const current = editing ? draft : info;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* 사업장 기본정보 */}
      <section className="panel">
        <div className="panel-header">
          <h2>사업장 기본정보</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {saved && <span style={{ fontSize: "0.8rem", color: "var(--green)", fontWeight: 600 }}>저장됨 ✓</span>}
            {editing ? (
              <>
                <button className="btn" style={{ padding: "6px 14px", fontSize: "0.82rem" }} disabled={loading} onClick={save}>
                  {loading ? "저장 중..." : "저장"}
                </button>
                <button className="btn outline" style={{ padding: "6px 12px", fontSize: "0.82rem" }} onClick={() => setEditing(false)}>
                  취소
                </button>
              </>
            ) : (
              <button className="btn outline" style={{ padding: "6px 12px", fontSize: "0.82rem" }} onClick={startEdit}>
                수정
              </button>
            )}
          </div>
        </div>
        <div className="panel-body">
          <div className="grid grid-3" style={{ gap: 14 }}>
            {[
              { field: "businessNo" as const, label: "사업자등록번호" },
              { field: "corpNo" as const, label: "법인등록번호" },
              { field: "name" as const, label: "상호" },
              { field: "ceoName" as const, label: "대표자명" },
              { field: "openedAt" as const, label: "개업연월일" },
              { field: "address" as const, label: "사업장 소재지" },
              { field: "businessType" as const, label: "업태" },
              { field: "businessItem" as const, label: "종목" },
            ].map(({ field, label }) => (
              <label key={field} style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-3)", fontWeight: 600 }}>{label}</span>
                {editing ? (
                  <input
                    value={draft[field] ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
                  />
                ) : (
                  <strong style={{ fontSize: "0.95rem", color: "var(--text-1)" }}>{current[field] || "-"}</strong>
                )}
              </label>
            ))}
          </div>
          {!editing && (
            <p style={{ marginTop: 12, fontSize: "0.78rem", color: "var(--text-4)" }}>
              마지막 수정: {new Date(info.updatedAt).toLocaleDateString("ko-KR")}
            </p>
          )}
        </div>
      </section>

      {/* 담당자 정보 */}
      <section className="panel">
        <div className="panel-header">
          <h2>담당자 분리 등록</h2>
          <span className="badge ok">세무·노무·고객사 분리</span>
        </div>
        <div className="panel-body">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>구분</th>
                  <th>이름</th>
                  <th>직급</th>
                  <th>연락처</th>
                  <th>이메일</th>
                </tr>
              </thead>
              <tbody>
                {(editing ? draft.contacts : info.contacts).map((contact, idx) => (
                  <tr key={contact.zone}>
                    <td><strong>{contact.zone}</strong></td>
                    <td>
                      {editing ? (
                        <input
                          value={contact.name}
                          onChange={(e) => updateContact(idx, "name", e.target.value)}
                          style={{ fontSize: "0.85rem", padding: "5px 8px" }}
                        />
                      ) : contact.name}
                    </td>
                    <td>
                      {editing ? (
                        <input
                          value={contact.title}
                          onChange={(e) => updateContact(idx, "title", e.target.value)}
                          style={{ fontSize: "0.85rem", padding: "5px 8px" }}
                        />
                      ) : contact.title}
                    </td>
                    <td>
                      {editing ? (
                        <input
                          value={contact.phone}
                          onChange={(e) => updateContact(idx, "phone", e.target.value)}
                          style={{ fontSize: "0.85rem", padding: "5px 8px" }}
                        />
                      ) : contact.phone}
                    </td>
                    <td>
                      {editing ? (
                        <input
                          value={contact.email}
                          onChange={(e) => updateContact(idx, "email", e.target.value)}
                          style={{ fontSize: "0.85rem", padding: "5px 8px" }}
                        />
                      ) : contact.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 세무 기초 세팅 자료 */}
      <section className="panel">
        <div className="panel-header">
          <h2>세무 기초 세팅 자료</h2>
          <span className={`badge ${canEditSensitive ? "ok" : "warn"}`}>
            {canEditSensitive ? "민감정보 표시" : "민감정보 숨김"}
          </span>
        </div>
        <div className="panel-body" style={{ display: "grid", gap: 12 }}>
          {info.setupAssets.map((asset) => (
            <div key={asset.title} className="card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <strong style={{ display: "block", marginBottom: 6 }}>{asset.title}</strong>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>
                    {asset.isSensitive && !canEditSensitive
                      ? "권한자에게만 세부 정보가 표시됩니다."
                      : asset.note}
                  </p>
                </div>
                <span
                  className={`badge ${
                    asset.status.includes("완료") || asset.status.includes("보관")
                      ? "ok"
                      : asset.status.includes("만료")
                      ? "warn"
                      : "warn"
                  }`}
                >
                  {asset.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
