"use client";

import { useState } from "react";
import ChannelBadge from "@/components/erp/ChannelBadge";
import type { ChannelKey, ERPDocument } from "@/lib/erp-types";
import { useERPState } from "@/lib/use-erp-state";

const channelKeys: ChannelKey[] = ["hometax", "fourInsure", "gov24", "wetax"];

export default function DocumentsPage() {
    const { data, isLoading, error } = useERPState();
    const erpDocuments = data?.documents ?? [];
    const [search, setSearch] = useState("");
    const [channelFilter, setChannelFilter] = useState<ChannelKey | "all">("all");
    const [sortBy, setSortBy] = useState<"date" | "name" | "type">("date");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    const filtered = erpDocuments
        .filter((d) => {
            const q = search.toLowerCase();
            const matchesSearch =
                d.fileName.toLowerCase().includes(q) ||
                d.clientName.toLowerCase().includes(q) ||
                d.documentType.toLowerCase().includes(q) ||
                d.baseYm.includes(q);
            const matchesChannel = channelFilter === "all" || d.channelKey === channelFilter;
            return matchesSearch && matchesChannel;
        })
        .sort((a, b) => {
            let cmp = 0;
            if (sortBy === "date") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            else if (sortBy === "name") cmp = a.clientName.localeCompare(b.clientName, "ko");
            else cmp = a.documentType.localeCompare(b.documentType, "ko");
            return sortDir === "asc" ? cmp : -cmp;
        });

    const toggleSort = (field: typeof sortBy) => {
        if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortBy(field); setSortDir("desc"); }
    };

    const SortIcon = ({ field }: { field: typeof sortBy }) =>
        sortBy === field ? (sortDir === "desc" ? " ↓" : " ↑") : " ↕";

    if (isLoading && !data) {
        return <div style={{ padding: "36px 40px", color: "#64748b" }}>문서 목록을 불러오는 중...</div>;
    }

    return (
        <div style={{ padding: "36px 40px" }}>
            {error && (
                <div style={{
                    marginBottom: 16, padding: "10px 14px", borderRadius: 10,
                    background: "#fff7ed", border: "1px solid #fdba74", color: "#9a3412",
                    fontSize: "0.82rem",
                }}>
                    상태 동기화 오류: {error}
                </div>
            )}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.04em" }}>문서 결과함</h1>
                <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: 4 }}>수집된 PDF 문서 목록 · 필터·정렬·검색 지원</p>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="파일명, 사업장명, 문서종류, 기준연월 검색..."
                    style={{
                        flex: 1, minWidth: 220, padding: "9px 14px", borderRadius: 10,
                        border: "1px solid #e2e8f0", fontSize: "0.88rem", outline: "none",
                        background: "#fff", color: "#0f172a",
                    }}
                />
                <select
                    value={channelFilter}
                    onChange={(e) => setChannelFilter(e.target.value as typeof channelFilter)}
                    style={{
                        padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0",
                        fontSize: "0.82rem", background: "#fff", color: "#374151", outline: "none",
                    }}>
                    <option value="all">전체 기관</option>
                    {channelKeys.map((ch) => (
                        <option key={ch} value={ch}>
                            {ch === "hometax" ? "홈택스" : ch === "fourInsure" ? "4대보험" : ch === "gov24" ? "정부24" : "위택스"}
                        </option>
                    ))}
                </select>
                <span style={{ fontSize: "0.82rem", color: "#94a3b8", marginLeft: "auto" }}>
                    총 {filtered.length}건
                </span>
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                        <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>
                                    <button onClick={() => toggleSort("name")} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, color: "#64748b", fontSize: "0.75rem" }}>
                                        사업장 <SortIcon field="name" />
                                    </button>
                                </th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>기관</th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>
                                    <button onClick={() => toggleSort("type")} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, color: "#64748b", fontSize: "0.75rem" }}>
                                        문서종류 <SortIcon field="type" />
                                    </button>
                                </th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>기준연월</th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>파일명</th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>저장경로</th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>
                                    <button onClick={() => toggleSort("date")} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, color: "#64748b", fontSize: "0.75rem" }}>
                                        생성일시 <SortIcon field="date" />
                                    </button>
                                </th>
                                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((doc: ERPDocument) => (
                                <tr key={doc.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "12px 16px", fontSize: "0.84rem", fontWeight: 600, color: "#0f172a" }}>{doc.clientName}</td>
                                    <td style={{ padding: "12px 16px" }}><ChannelBadge channel={doc.channelKey} size="sm" /></td>
                                    <td style={{ padding: "12px 16px", fontSize: "0.83rem", color: "#374151" }}>{doc.documentType}</td>
                                    <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#64748b" }}>{doc.baseYm}</td>
                                    <td style={{ padding: "12px 16px", fontSize: "0.72rem", color: "#374151", fontFamily: "monospace", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {doc.fileName}
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "0.68rem", color: "#94a3b8", fontFamily: "monospace" }}>{doc.filePath}</td>
                                    <td style={{ padding: "12px 16px", fontSize: "0.77rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                                        {new Date(doc.createdAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        {doc.downloadUrl ? (
                                            <a
                                                href={doc.downloadUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    padding: "5px 10px", borderRadius: 6, border: "1px solid #bfdbfe",
                                                    background: "#eff6ff", fontSize: "0.75rem", cursor: "pointer",
                                                    color: "#1d4ed8", fontWeight: 600, textDecoration: "none",
                                                    display: "inline-block",
                                                }}
                                            >
                                                ⬇ 다운로드
                                            </a>
                                        ) : (
                                            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
                                        {isLoading ? "불러오는 중..." : "검색 결과가 없습니다"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ marginTop: 16, padding: "12px 16px", background: "#f0f9ff", borderRadius: 10, border: "1px solid #bae6fd" }}>
                <p style={{ fontSize: "0.78rem", color: "#0369a1", fontFamily: "monospace" }}>
                    {"📌 파일명 규칙: {사업장명}_{기관}_{문서종류}_{기준연월}_{생성일시}.pdf   ·   폴더 규칙: /archive/{사업자번호}/{기관}/{YYYY}/{MM}/"}
                </p>
            </div>
        </div>
    );
}
