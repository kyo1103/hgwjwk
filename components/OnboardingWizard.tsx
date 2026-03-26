"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Answers = {
    firstHire: boolean | null;       // 첫 직원?
    employeeType: "regular" | "daily" | null; // 상용직/일용직
    dependentCoverage: boolean | null; // 피부양자 등록?
    over10: boolean | null;          // 10인 이상?
    businessRegistered: boolean | null; // 사업장 이미 등록?
};

type Step = {
    id: keyof Answers;
    question: string;
    sub?: string;
    choices: { label: string; value: unknown }[];
};

const STEPS: Step[] = [
    {
        id: "firstHire",
        question: "이 사업장에 처음으로 채용하시나요?",
        sub: "국민연금·건강보험·고용보험 사업장을 새로 개설해야 하는지 판단합니다.",
        choices: [
            { label: "예, 사업장에 처음 채용합니다", value: true },
            { label: "아니요, 기존 사업장에 추가 채용입니다", value: false },
        ],
    },
    {
        id: "employeeType",
        question: "채용 형태는 어떻게 되나요?",
        sub: "고용 형태에 따라 필요한 신고 서류가 달라집니다.",
        choices: [
            { label: "상용직 (정규직·계약직·파트타임 등)", value: "regular" },
            { label: "일용직 (단기·일당제 근로)", value: "daily" },
        ],
    },
    {
        id: "dependentCoverage",
        question: "직원이 건강보험 피부양자 등록을 요청했나요?",
        sub: "가족 중 직장가입자가 없어 피부양자로 등록이 필요한 경우에만 해당됩니다.",
        choices: [
            { label: "예, 피부양자 등록이 필요합니다", value: true },
            { label: "아니요, 해당 없습니다", value: false },
        ],
    },
    {
        id: "over10",
        question: "채용 후 상시근로자 수가 10인 이상이 되나요?",
        sub: "10인 이상 사업장은 취업규칙 작성·신고 의무가 있습니다.",
        choices: [
            { label: "예, 10인 이상입니다", value: true },
            { label: "아니요, 10인 미만입니다", value: false },
        ],
    },
    {
        id: "businessRegistered",
        question: "4대보험 사업장이 이미 등록되어 있나요?",
        sub: "처음 신고하는 경우와 신규 취득신고만 하는 경우의 서류가 다릅니다.",
        choices: [
            { label: "예, 이미 등록된 사업장입니다", value: true },
            { label: "아니요, 아직 미가입 / 모르겠습니다", value: false },
        ],
    },
];

type Props = { tenantSlug: string };

export function OnboardingWizard({ tenantSlug }: Props) {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Answers>({
        firstHire: null,
        employeeType: null,
        dependentCoverage: null,
        over10: null,
        businessRegistered: null,
    });

    const currentStep = STEPS[step];
    const progress = ((step) / STEPS.length) * 100;

    const handleChoice = useCallback((value: unknown) => {
        const key = currentStep.id;
        const updated = { ...answers, [key]: value };
        setAnswers(updated);

        if (step < STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            // All questions answered → pass answers as query params & navigate
            const params = new URLSearchParams();
            for (const [k, v] of Object.entries(updated)) {
                if (v !== null) params.set(k, String(v));
            }
            router.push(`/portal/${tenantSlug}/onboarding/checklist?${params.toString()}`);
        }
    }, [step, answers, currentStep, router, tenantSlug]);

    return (
        <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
            <div style={{ width: "100%", maxWidth: 640 }}>

                {/* Progress bar */}
                <div style={{ marginBottom: 40 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#6366f1" }}>채용 유형 진단</span>
                        <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{step + 1} / {STEPS.length}</span>
                    </div>
                    <div style={{ height: 6, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{
                            height: "100%", width: `${progress}%`,
                            background: "linear-gradient(90deg, #6366f1, #818cf8)",
                            borderRadius: 99, transition: "width 0.4s"
                        }} />
                    </div>
                </div>

                {/* Question card */}
                <div style={{
                    background: "#fff",
                    borderRadius: 20,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 40px rgba(99,102,241,0.07)",
                    padding: "48px 40px",
                }}>
                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", margin: "0 0 12px", lineHeight: 1.3, letterSpacing: "-0.04em" }}>
                            {currentStep.question}
                        </h2>
                        {currentStep.sub && (
                            <p style={{ fontSize: "0.95rem", color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                                {currentStep.sub}
                            </p>
                        )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {currentStep.choices.map((choice, i) => (
                            <button
                                key={i}
                                onClick={() => handleChoice(choice.value)}
                                style={{
                                    width: "100%",
                                    padding: "20px 24px",
                                    borderRadius: 14,
                                    border: "2px solid #e2e8f0",
                                    background: "#fff",
                                    textAlign: "left",
                                    fontSize: "1.05rem",
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    cursor: "pointer",
                                    transition: "all 0.18s",
                                    letterSpacing: "-0.01em",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 14,
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = "#6366f1";
                                    e.currentTarget.style.background = "#f5f3ff";
                                    e.currentTarget.style.color = "#3730a3";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = "#e2e8f0";
                                    e.currentTarget.style.background = "#fff";
                                    e.currentTarget.style.color = "#1e293b";
                                }}
                            >
                                <span style={{
                                    width: 32, height: 32, borderRadius: "50%",
                                    border: "2px solid #e2e8f0",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "0.85rem", fontWeight: 800, color: "#94a3b8",
                                    flexShrink: 0,
                                }}>
                                    {String.fromCharCode(65 + i)}
                                </span>
                                {choice.label}
                            </button>
                        ))}
                    </div>

                    {/* Back button */}
                    {step > 0 && (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            style={{
                                marginTop: 24, background: "none", border: "none",
                                color: "#94a3b8", fontSize: "0.9rem", fontWeight: 600,
                                cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                            }}
                        >
                            ← 이전 질문으로
                        </button>
                    )}
                </div>

                {/* Step indicators */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
                    {STEPS.map((_, i) => (
                        <div key={i} style={{
                            width: i === step ? 24 : 8, height: 8, borderRadius: 99,
                            background: i <= step ? "#6366f1" : "#e2e8f0",
                            transition: "all 0.3s"
                        }} />
                    ))}
                </div>
            </div>
        </div>
    );
}
