export type PayrollStage =
  | "급여자료요청"
  | "급여대장전송"
  | "전자신고"
  | "납부서발송"
  | "지급명세서제출"
  | "신고완료";

export type PayrollRow = {
  id: string;
  clientName: string;
  bizNo: string;
  manager: string;
  targets: Array<"근로" | "사업">;
  reported: boolean;
  payday: string;
  receiver: string;
  phone: string;
  stage: PayrollStage;
};

export type InsuranceRow = {
  id: string;
  company: string;
  bizNo: string;
  noticeYm: string;
  name: string;
  birth: string;
  pensionCalc: number;
  pensionSupport: number;
  pensionTotal: number;
  healthCalc: number;
  careCalc: number;
  healthTotal: number;
};

export type PensionDetailRow = {
  name: string;
  registrationNo: string;
  incomeBase: number;
  premium: number;
  employeeShare: number;
  employerShare: number;
};

export type HealthDetailRow = {
  name: string;
  registrationNo: string;
  salaryBase: number;
  healthPremium: number;
  carePremium: number;
  totalPremium: number;
};

export type ClientLookupRow = {
  id: string;
  name: string;
  bizNo: string;
  manager: string;
  note: string;
  residentMasked: string;
  category: string;
  taxType: string;
};

export const payrollFlow = [
  { key: "급여자료요청", label: "급여자료요청", count: 93 },
  { key: "급여대장전송", label: "급여대장 전송", count: 95 },
  { key: "전자신고", label: "전자신고", count: 95 },
  { key: "납부서발송", label: "납부서 발송", count: 96 },
  { key: "지급명세서제출", label: "지급명세서 제출", count: 106 },
] as const;

export const payrollStageMenu: PayrollStage[] = [
  "급여자료요청",
  "급여대장전송",
  "전자신고",
  "납부서발송",
  "지급명세서제출",
  "신고완료",
];

export const payrollRows: PayrollRow[] = [
  {
    id: "pay-1",
    clientName: "유니온테크 주식회사",
    bizNo: "198-86-01580",
    manager: "이자영",
    targets: ["근로", "사업"],
    reported: false,
    payday: "15일",
    receiver: "조준수",
    phone: "010-9515-9492",
    stage: "급여자료요청",
  },
  {
    id: "pay-2",
    clientName: "강여사",
    bizNo: "327-16-02485",
    manager: "김수연",
    targets: ["근로"],
    reported: false,
    payday: "10일",
    receiver: "김현섭",
    phone: "010-8556-4084",
    stage: "급여대장전송",
  },
  {
    id: "pay-3",
    clientName: "공간 더 채움",
    bizNo: "484-44-01180",
    manager: "허건우",
    targets: ["사업"],
    reported: true,
    payday: "25일",
    receiver: "최충식",
    phone: "010-9119-0482",
    stage: "전자신고",
  },
  {
    id: "pay-4",
    clientName: "김현섭 세무사무소",
    bizNo: "175-17-01392",
    manager: "허건우",
    targets: ["근로"],
    reported: false,
    payday: "12일",
    receiver: "전제현",
    phone: "010-8058-5520",
    stage: "급여자료요청",
  },
  {
    id: "pay-5",
    clientName: "다함물류",
    bizNo: "205-43-45934",
    manager: "허건우",
    targets: ["근로"],
    reported: false,
    payday: "20일",
    receiver: "김정원",
    phone: "010-5233-0866",
    stage: "납부서발송",
  },
  {
    id: "pay-6",
    clientName: "달오름by제주",
    bizNo: "618-49-01212",
    manager: "허건우",
    targets: ["근로"],
    reported: false,
    payday: "25일",
    receiver: "이태승",
    phone: "010-6613-5196",
    stage: "급여자료요청",
  },
  {
    id: "pay-7",
    clientName: "대박",
    bizNo: "704-73-00538",
    manager: "허건우",
    targets: ["사업"],
    reported: false,
    payday: "25일",
    receiver: "박태은",
    phone: "010-4547-2288",
    stage: "지급명세서제출",
  },
  {
    id: "pay-8",
    clientName: "대신프라자",
    bizNo: "618-05-69294",
    manager: "허건우",
    targets: ["근로"],
    reported: false,
    payday: "15일",
    receiver: "정희찬",
    phone: "010-3651-2103",
    stage: "급여대장전송",
  },
  {
    id: "pay-9",
    clientName: "덤벨태승",
    bizNo: "366-09-03346",
    manager: "허건우",
    targets: ["근로"],
    reported: false,
    payday: "15일",
    receiver: "박민찬",
    phone: "010-4645-7438",
    stage: "전자신고",
  },
  {
    id: "pay-10",
    clientName: "도담물류",
    bizNo: "753-03-03723",
    manager: "허건우",
    targets: ["근로"],
    reported: false,
    payday: "15일",
    receiver: "이상균",
    phone: "010-8809-8096",
    stage: "급여자료요청",
  },
];

export const insuranceRows: InsuranceRow[] = [
  {
    id: "ins-1",
    company: "유니온테크 주식회사",
    bizNo: "198-86-01580",
    noticeYm: "2026년 02월",
    name: "고성훈",
    birth: "810225",
    pensionCalc: 186430,
    pensionSupport: 0,
    pensionTotal: 186430,
    healthCalc: 141100,
    careCalc: 18540,
    healthTotal: 159640,
  },
  {
    id: "ins-2",
    company: "유니온테크 주식회사",
    bizNo: "198-86-01580",
    noticeYm: "2026년 02월",
    name: "김창오",
    birth: "660919",
    pensionCalc: 189380,
    pensionSupport: 0,
    pensionTotal: 189380,
    healthCalc: 143340,
    careCalc: 18830,
    healthTotal: 162170,
  },
  {
    id: "ins-3",
    company: "유니온테크 주식회사",
    bizNo: "198-86-01580",
    noticeYm: "2026년 02월",
    name: "김한철",
    birth: "811216",
    pensionCalc: 180500,
    pensionSupport: 0,
    pensionTotal: 180500,
    healthCalc: 136610,
    careCalc: 17950,
    healthTotal: 154560,
  },
  {
    id: "ins-4",
    company: "유니온테크 주식회사",
    bizNo: "198-86-01580",
    noticeYm: "2026년 02월",
    name: "김해익",
    birth: "720313",
    pensionCalc: 257870,
    pensionSupport: 0,
    pensionTotal: 257870,
    healthCalc: 179560,
    careCalc: 23590,
    healthTotal: 203150,
  },
  {
    id: "ins-5",
    company: "유니온테크 주식회사",
    bizNo: "198-86-01580",
    noticeYm: "2026년 02월",
    name: "남현덕",
    birth: "770110",
    pensionCalc: 208190,
    pensionSupport: 0,
    pensionTotal: 208190,
    healthCalc: 157580,
    careCalc: 20700,
    healthTotal: 178280,
  },
  {
    id: "ins-6",
    company: "유니온테크 주식회사",
    bizNo: "198-86-01580",
    noticeYm: "2026년 02월",
    name: "박상권",
    birth: "680610",
    pensionCalc: 213940,
    pensionSupport: 0,
    pensionTotal: 213940,
    healthCalc: 161920,
    careCalc: 21270,
    healthTotal: 183190,
  },
  {
    id: "ins-7",
    company: "유니온테크 주식회사",
    bizNo: "198-86-01580",
    noticeYm: "2026년 02월",
    name: "서성화",
    birth: "901126",
    pensionCalc: 160690,
    pensionSupport: 0,
    pensionTotal: 160690,
    healthCalc: 121630,
    careCalc: 15980,
    healthTotal: 137610,
  },
  {
    id: "ins-8",
    company: "유니온테크 주식회사",
    bizNo: "198-86-01580",
    noticeYm: "2026년 02월",
    name: "서용오",
    birth: "830215",
    pensionCalc: 176980,
    pensionSupport: 0,
    pensionTotal: 176980,
    healthCalc: 136210,
    careCalc: 17950,
    healthTotal: 154160,
  },
  {
    id: "ins-9",
    company: "유니온테크 주식회사",
    bizNo: "198-86-01580",
    noticeYm: "2026년 02월",
    name: "이도진",
    birth: "880114",
    pensionCalc: 166100,
    pensionSupport: 0,
    pensionTotal: 166100,
    healthCalc: 125720,
    careCalc: 16540,
    healthTotal: 142260,
  },
  {
    id: "ins-10",
    company: "유니온테크 주식회사",
    bizNo: "198-86-01580",
    noticeYm: "2026년 02월",
    name: "이재준",
    birth: "810724",
    pensionCalc: 216120,
    pensionSupport: 0,
    pensionTotal: 216120,
    healthCalc: 165430,
    careCalc: 21740,
    healthTotal: 187170,
  },
];

export const pensionDetailRows: PensionDetailRow[] = insuranceRows.map((row) => ({
  name: row.name,
  registrationNo: row.birth,
  incomeBase: row.pensionCalc * 21,
  premium: row.pensionCalc + row.pensionTotal,
  employeeShare: row.pensionCalc,
  employerShare: row.pensionTotal,
}));

export const healthDetailRows: HealthDetailRow[] = insuranceRows.map((row) => ({
  name: row.name,
  registrationNo: `${row.birth.slice(0, 6)}-1******`,
  salaryBase: row.healthCalc * 28,
  healthPremium: row.healthCalc,
  carePremium: row.careCalc,
  totalPremium: row.healthTotal,
}));

export const clientLookupRows: ClientLookupRow[] = [
  {
    id: "lookup-1",
    name: "장수치킨맥주 경성대점",
    bizNo: "549-01-03630",
    manager: "김수연",
    note: "",
    residentMasked: "950307-*******",
    category: "개인",
    taxType: "간이",
  },
  {
    id: "lookup-2",
    name: "유니온테크 주식회사",
    bizNo: "198-86-01580",
    manager: "이자영",
    note: "홈택스 자동수집",
    residentMasked: "860101-*******",
    category: "법인",
    taxType: "일반",
  },
  {
    id: "lookup-3",
    name: "공간 더 채움",
    bizNo: "484-44-01180",
    manager: "허건우",
    note: "기장대리",
    residentMasked: "900812-*******",
    category: "개인",
    taxType: "간이",
  },
  {
    id: "lookup-4",
    name: "달오름by제주",
    bizNo: "618-49-01212",
    manager: "허건우",
    note: "수임중",
    residentMasked: "871111-*******",
    category: "개인",
    taxType: "일반",
  },
];

export const certificateSections = [
  {
    title: "홈택스",
    options: [
      "납세증명서(국세완납증명)",
      "납부내역증명(납세사실증명)",
      "소득금액증명",
      "표준재무제표증명",
      "부가가치세 과세표준증명",
      "부가가치세 면세사업자 수입금액증명",
      "사업자등록증명",
      "폐업사실증명",
    ],
  },
  {
    title: "위택스",
    options: ["납세증명서(지방세)"],
  },
];
