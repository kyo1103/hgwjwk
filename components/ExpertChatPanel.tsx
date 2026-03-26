"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
    id: number;
    author: string;
    role: "사업주" | "노무사" | "세무사";
    text: string;
    time: string;
};

const DUMMY_MSGS: Message[] = [
    { id: 1, author: "고객사(원장)", role: "사업주", text: "이번에 간호조무사님을 정규직으로 채용했는데 피부양자 등록이 필요하시다고 하네요.", time: "10:30 AM" },
    { id: 2, author: "김노무사", role: "노무사", text: "네 원장님! 해당 부분 건강보험 취득신고서 쪽에 피부양자 서류 추가로 열어드렸습니다. 가족관계증명서만 받아시면 저희가 접수할게요.", time: "10:33 AM" }
];

export function ExpertChatPanel() {
    const [messages, setMessages] = useState<Message[]>(DUMMY_MSGS);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const newMsg: Message = {
            id: Date.now(),
            author: "고객사(원장)",
            role: "사업주",
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, newMsg]);
        setInput("");

        // Simulate auto reply if tagged
        if (input.includes("@노무사")) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    author: "김노무사", role: "노무사",
                    text: "알림 확인했습니다! 확인 후 빠르게 진행도와드리겠습니다.",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            }, 1500);
        }
        if (input.includes("@세무사")) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    author: "이세무사", role: "세무사",
                    text: "네 세무부분 인지했습니다. 원천징수 기간 안놓치게 처리할게요.",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            }, 2000);
        }
    };

    const insertTag = (tag: string) => {
        setInput(prev => prev + tag + " ");
    };

    return (
        <div style={{
            display: "flex", flexDirection: "column", height: "100%", width: "100%",
            background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)", overflow: "hidden"
        }}>
            {/* Header */}
            <div style={{
                padding: "20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0",
                display: "flex", alignItems: "center", gap: 12
            }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 3px #d1fae5" }} />
                <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", margin: "0 0 4px" }}>
                        전문가 실시간 질의응답
                    </h3>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                        태그(@)를 사용하여 질문하면 담당자가 즉시 확인합니다.
                    </p>
                </div>
            </div>

            {/* Message List */}
            <div ref={scrollRef} style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, background: "#fcfdff" }}>
                {messages.map(m => {
                    const isMe = m.role === "사업주";
                    return (
                        <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                {!isMe && <span style={{ padding: "2px 6px", background: m.role === "노무사" ? "#eef2ff" : "#fff1f2", color: m.role === "노무사" ? "#4f46e5" : "#e11d48", borderRadius: 4, fontSize: "0.65rem" }}>담당 {m.role}</span>}
                                {m.author}
                            </div>
                            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexDirection: isMe ? "row-reverse" : "row" }}>
                                <div style={{
                                    maxWidth: "260px",
                                    padding: "12px 16px",
                                    borderRadius: 14,
                                    borderTopRightRadius: isMe ? 4 : 14,
                                    borderTopLeftRadius: isMe ? 14 : 4,
                                    background: isMe ? "#4f46e5" : "#f1f5f9",
                                    color: isMe ? "#fff" : "#1e293b",
                                    fontSize: "0.9rem", lineHeight: 1.5,
                                    wordBreak: "break-word"
                                }}>
                                    {/* Highlight @tags */}
                                    {m.text.split(/(@노무사|@세무사)/g).map((part, i) => (
                                        part === "@노무사" || part === "@세무사"
                                            ? <span key={i} style={{ color: isMe ? "#a5b4fc" : "#4f46e5", fontWeight: 700 }}>{part}</span>
                                            : part
                                    ))}
                                </div>
                                <div style={{ fontSize: "0.7rem", color: "#94a3b8", flexShrink: 0 }}>{m.time}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div style={{ padding: "16px", background: "#fff", borderTop: "1px solid #e2e8f0" }}>
                {/* Quick tags */}
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <button onClick={() => insertTag("@노무사")} style={{ background: "#eef2ff", color: "#4f46e5", border: "none", padding: "4px 10px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                        @노무사 호출
                    </button>
                    <button onClick={() => insertTag("@세무사")} style={{ background: "#fff1f2", color: "#e11d48", border: "none", padding: "4px 10px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                        @세무사 호출
                    </button>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSend()}
                        placeholder="궁금한 점을 메신저처럼 남겨주세요."
                        style={{
                            flex: 1, padding: "12px 16px",
                            background: "#f8fafc", border: "1px solid #e2e8f0",
                            borderRadius: 10, fontSize: "0.9rem", color: "#334155",
                            outline: "none"
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        style={{
                            background: input.trim() ? "#4f46e5" : "#e2e8f0", color: "#fff",
                            border: "none", borderRadius: 10, padding: "0 20px",
                            fontWeight: 700, cursor: input.trim() ? "pointer" : "not-allowed",
                            transition: "all 0.2s"
                        }}
                    >
                        전송
                    </button>
                </div>
            </div>
        </div>
    );
}
