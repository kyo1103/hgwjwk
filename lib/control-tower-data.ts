/* ─────────────────────────── 관제탑 공유 데이터 ─────────────────────────── */
import { clientLookupRows } from "./wemembers-data";

export type StepStatus = "done" | "in-progress" | "pending";

export interface ReportStep {
  label: string;
  status: StepStatus;
  hasButton: boolean;
  buttonLabel?: string;
  isAutoSync?: boolean;
}

export interface TaxReport {
  taxType: string;
  steps: ReportStep[];
}

export interface MonthData {
  month: number;
  reports: TaxReport[];
}

export type IndustryCategory = "제조업" | "병의원" | "수출업";

export interface Company {
  id: string;
  name: string;
  shortName: string;
  bizNo: string;
  manager: string;
  category: IndustryCategory;
  months: MonthData[];
}

export const INDUSTRY_META: Record<IndustryCategory, { icon: string; color: string }> = {
  "제조업": { icon: "🏭", color: "#3b82f6" },
  "병의원": { icon: "🏥", color: "#ef4444" },
  "수출업": { icon: "🚢", color: "#8b5cf6" },
};

/* ─────────────────────────── 7단계 템플릿 ─────────────────────────── */

function makeSteps(taxType: string, doneCount: number, inProgressIndex?: number): ReportStep[] {
  let template: { label: string; hasButton: boolean; buttonLabel?: string; isAutoSync?: boolean }[] = [];

  if (taxType === "원천세") {
    template = [
      { label: "급여 핑", hasButton: true },
      { label: "납부서 톡", hasButton: true },
    ];
  } else if (taxType === "법인세") {
    template = [
      { label: "수집 요청", hasButton: true },
      { label: "고객사 자료요청", hasButton: true },
      { label: "신고서 전송", hasButton: true },
    ];
  } else if (taxType === "종합소득세") {
    template = [
      { label: "수집 요청", hasButton: true },
      { label: "고객사 자료요청", hasButton: true },
      { label: "신고서 전송", hasButton: true },
    ];
  } else if (taxType === "연말정산") {
    template = [
      { label: "안내 톡", hasButton: true },
      { label: "소득공제 수집", hasButton: true },
      { label: "영수증 전송", hasButton: true },
    ];
  } else {
    // 부가세 및 기타 기본 구조
    template = [
      { label: "자료 핑", hasButton: true },
      { label: "수기자료 요청", hasButton: true },
      { label: "납부서 톡", hasButton: true },
    ];
  }

  return template.map((t, idx) => {
    let status: StepStatus = "pending";
    if (idx < doneCount) status = "done";
    return { ...t, status };
  });
}

/* ─────────────────────────── 목업 데이터 (5업체 × 3개월) ─────────────────────────── */

export const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function generateMockMonths(isCorp: boolean): MonthData[] {
  const data: MonthData[] = [];
  for (let m = 1; m <= 12; m++) {
    // 공통: 매월 원천세 필수 포함 (미완료 상태를 잘 볼 수 있도록 초기 완료값을 0~임의로 낮춤)
    const reports: TaxReport[] = [
      { taxType: "원천세", steps: makeSteps("원천세", 0) }
    ];

    if (m === 2) reports.push({ taxType: "연말정산", steps: makeSteps("연말정산", 0) });
    if (m === 5) reports.push({ taxType: "종합소득세", steps: makeSteps("종합소득세", 0) });
    if (m === 6) reports.push({ taxType: "성실신고", steps: makeSteps("성실신고", 0) });

    // 분기별 부가세
    if ([1, 4, 7, 10].includes(m)) {
      reports.push({ taxType: "부가세", steps: makeSteps("부가세", m < 4 ? 7 : Math.floor(Math.random() * 4)) });
    }
    // 법인은 3월 법인세 추가
    if (isCorp && m === 3) {
      reports.push({ taxType: "법인세", steps: makeSteps("법인세", 1) });
    }

    data.push({ month: m, reports });
  }
  return data;
}

export const MOCK_COMPANIES: Company[] = clientLookupRows.map((row, i) => {
  const isCorp = row.category === "법인";
  return {
    id: row.id,
    name: row.name,
    shortName: row.name.replace("주식회사", "").trim(),
    bizNo: row.bizNo,
    manager: row.manager,
    category: isCorp ? "제조업" : "병의원",
    months: generateMockMonths(isCorp),
  };
});
