/* ─────────────────────────── 관제탑 공유 데이터 ─────────────────────────── */

export type StepStatus = "done" | "in-progress" | "pending";

export interface ReportStep {
  label: string;
  status: StepStatus;
  hasButton: boolean;
  buttonLabel?: string;
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

function makeSteps(doneCount: number, inProgressIndex?: number): ReportStep[] {
  const template: { label: string; hasButton: boolean; buttonLabel?: string }[] = [
    { label: "API 자동수집", hasButton: true, buttonLabel: "수집" },
    { label: "수기자료 요청", hasButton: true, buttonLabel: "발송" },
    { label: "자료 수집 완료", hasButton: false },
    { label: "세무사랑 서식 변환", hasButton: true, buttonLabel: "변환" },
    { label: "세무사랑 장부작업", hasButton: false },
    { label: "홈택스 신고 완료", hasButton: false },
    { label: "납부서·보고서 전송", hasButton: true, buttonLabel: "전송" },
  ];
  return template.map((t, idx) => {
    let status: StepStatus = "pending";
    if (idx < doneCount) status = "done";
    else if (idx === (inProgressIndex ?? doneCount)) status = "in-progress";
    return { ...t, status };
  });
}

/* ─────────────────────────── 목업 데이터 (5업체 × 3개월) ─────────────────────────── */

export const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function generateMockMonths(isCorp: boolean): MonthData[] {
  const data: MonthData[] = [];
  for (let m = 1; m <= 12; m++) {
    // 공통: 매월 원천세 필수 포함
    const reports: TaxReport[] = [
      { taxType: "원천세", steps: makeSteps(m < 4 ? 7 : Math.floor(Math.random() * 4)) }
    ];

    if (m === 2) reports.push({ taxType: "연말정산", steps: makeSteps(0) });
    if (m === 5) reports.push({ taxType: "종합소득세", steps: makeSteps(0) });
    if (m === 6) reports.push({ taxType: "성실신고", steps: makeSteps(0) });

    // 분기별 부가세
    if ([1, 4, 7, 10].includes(m)) {
      reports.push({ taxType: "부가세", steps: makeSteps(m < 4 ? 7 : Math.floor(Math.random() * 4)) });
    }
    // 법인은 3월 법인세 추가
    if (isCorp && m === 3) {
      reports.push({ taxType: "법인세", steps: makeSteps(1) });
    }

    data.push({ month: m, reports });
  }
  return data;
}

export const MOCK_COMPANIES: Company[] = [
  {
    id: "c1", name: "유니온테크 주식회사", shortName: "유니온테크", bizNo: "123-45-12345", manager: "김노무", category: "제조업",
    months: generateMockMonths(true),
  },
  {
    id: "c2", name: "주식회사 데이터솔루션", shortName: "데이터솔루션", bizNo: "234-56-78901", manager: "이세무", category: "수출업",
    months: generateMockMonths(true),
  },
  {
    id: "c3", name: "코스모스 카페", shortName: "코스모스카페", bizNo: "345-67-89012", manager: "박대리", category: "병의원",
    months: generateMockMonths(false),
  },
  {
    id: "c4", name: "에이스 건설", shortName: "에이스건설", bizNo: "456-78-90123", manager: "최주임", category: "제조업",
    months: generateMockMonths(true),
  },
  {
    id: "c5", name: "스타트업 홀딩스", shortName: "스타트업홀딩스", bizNo: "567-89-01234", manager: "정과장", category: "수출업",
    months: generateMockMonths(true),
  },
];
