export const companyBasics = [
  { label: "사업자등록번호", value: "198-86-01580", helper: "OCR 연동 전 기본값" },
  { label: "법인등록번호", value: "110111-1234567", helper: "대표·세무 측 수정 가능" },
  { label: "상호", value: "OOO의원", helper: "사업자등록증 기준" },
  { label: "대표자명", value: "박대표", helper: "민감정보 분리 대상" },
  { label: "개업연월일", value: "2021-06-17", helper: "변경이력 기록" },
  { label: "사업장 소재지", value: "서울 중구 세종대로 110", helper: "지점 추가 가능" },
  { label: "업태 / 종목", value: "보건업 / 의원", helper: "사업자등록증 업로드 시 자동 인식 예정" },
];

export const companyContacts = [
  { zone: "고객사 대표", name: "박대표", title: "대표이사", phone: "010-3333-3333", email: "owner@clinic.com" },
  { zone: "고객사 실무", name: "정인사", title: "인사담당", phone: "010-4444-4444", email: "hr@clinic.com" },
  { zone: "세무 담당", name: "이세무", title: "담당 세무사", phone: "010-1111-1111", email: "tax@firm.com" },
  { zone: "노무 담당", name: "김노무", title: "담당 노무사", phone: "010-2222-2222", email: "labor@firm.com" },
];

export const companySetupAssets = [
  { title: "사업용계좌", status: "업로드 완료", note: "농협 302-1234-5678-91" },
  { title: "사업용 신용카드", status: "검토 필요", note: "법인카드 2건 등록" },
  { title: "홈택스 ID", status: "보안 보관", note: "민감정보 탭 권한자만 열람" },
  { title: "공동인증서", status: "만료 32일 전", note: "갱신 알림 예약" },
];

export const billingContracts = [
  { item: "세무 기장대리 계약", amount: "월 330,000원", status: "진행중", note: "OK Sign 전자서명 사용" },
  { item: "노무 자문 계약", amount: "월 220,000원", status: "진행중", note: "급여·4대보험 범위 포함" },
  { item: "최초 수임료", amount: "1,100,000원", status: "완료", note: "2026-02-01 청구" },
  { item: "조정료", amount: "별도 협의", status: "대기", note: "연말정산 시즌 조건부" },
];

export const payrollCompanySettings = [
  { label: "급여 지급일", value: "매월 25일" },
  { label: "급여 마감 기준", value: "전월 21일 ~ 당월 20일" },
  { label: "두루누리 사업장", value: "적용 대상" },
  { label: "4대보험 신고 기준", value: "상용·일용 분리" },
];

export const payrollEmployees = [
  { name: "홍길동", type: "상용", pay: "3,200,000원", status: "재직", family: "배우자 1 / 자녀 1" },
  { name: "김민수", type: "상용", pay: "4,500,000원", status: "재직", family: "배우자 1" },
  { name: "이영희", type: "프리", pay: "2,100,000원", status: "재직", family: "-" },
];

export const payrollMonthlyChecklist = [
  { lane: "고객사 입력", item: "월별 변동자 입력", detail: "입·퇴사, 급여변동, 부양가족 변경" },
  { lane: "고객사 입력", item: "표준 엑셀 업로드", detail: "다수 인원 사업장은 엑셀 업로드 허용" },
  { lane: "노무 검토", item: "근로계약 연동 검토", detail: "신규 입사자 입력 후 계약서 자동 초안 생성" },
  { lane: "세무 작성", item: "급여대장 작성", detail: "급여명세서 발행 전 검수 단계 포함" },
  { lane: "포털 배포", item: "급여명세서 전달", detail: "고객사/직원별 알림 발송" },
];

export const payrollHistory = [
  { month: "2026-03", change: "김민수 보수월액 조정", owner: "이세무", visibility: "고객사 표시" },
  { month: "2026-03", change: "홍길동 부양가족 1인 추가", owner: "정인사", visibility: "고객사 표시" },
  { month: "2026-02", change: "이영희 지급유형 프리랜서로 정정", owner: "김노무", visibility: "고객사 표시" },
];

export const taxEvidenceBuckets = [
  { category: "자산", examples: "차량등록증, 비품 구매내역", status: "2건 업로드 / 1건 확인" },
  { category: "부채", examples: "부채증명원, 차입 약정서", status: "1건 업로드 / 확인 대기" },
  { category: "금융", examples: "통장 엑셀, 카드 매입집계", status: "자동 분류 준비중" },
  { category: "수기증빙", examples: "현금영수증, 간이영수증", status: "드래그 앤 드롭 지원" },
];

export const taxPayments = [
  { taxType: "원천세", dueDate: "매월 10일", status: "송부 전 검토", note: "송부 멘트 수정 가능" },
  { taxType: "부가세", dueDate: "분기 마감 후 25일", status: "납부서 업로드 완료", note: "납부 완료 API는 2차 연결" },
  { taxType: "종합소득세", dueDate: "매년 5월 31일", status: "일정 등록", note: "리마인드 알림 예정" },
  { taxType: "법인세", dueDate: "사업연도 종료 후 3개월", status: "대상 아님", note: "개인사업자 기준" },
];

export const taxNotices = [
  { title: "3월 원천세 신고 기한", date: "2026-04-10", state: "알림 예정" },
  { title: "1기 예정 부가세 준비", date: "2026-04-25", state: "공문 초안 작성" },
  { title: "보수총액신고 점검", date: "2026-03-31", state: "확인 필요" },
];

export const certificateCatalog = [
  { title: "사업자등록증명", source: "홈택스", mode: "즉시 발급", detail: "PDF 바로 저장" },
  { title: "납세증명서", source: "홈택스", mode: "즉시 발급", detail: "유효기간 표시" },
  { title: "부가가치세 과세표준증명", source: "홈택스", mode: "기간 선택", detail: "귀속기간 지정" },
  { title: "표준재무제표증명", source: "홈택스", mode: "연도 선택", detail: "제출용 PDF" },
  { title: "소득금액증명", source: "홈택스", mode: "연도 선택", detail: "대표자 기준" },
  { title: "지방세 납세증명서", source: "위택스", mode: "즉시 발급", detail: "기관 제출용" },
  { title: "4대보험 완납증명서", source: "4대보험", mode: "즉시 발급", detail: "기관 제출용" },
  { title: "4대보험 가입자 명부", source: "4대보험", mode: "즉시 발급", detail: "직원 목록 확인" },
];

export const insightPosts = [
  {
    category: "세무 칼럼",
    title: "접대비 처리에서 대표님이 자주 놓치는 구분 기준",
    summary: "실무에서 비용 인정이 갈리는 사례를 업종별로 정리합니다.",
    audience: "전체 공지",
  },
  {
    category: "노무 코멘트",
    title: "10인 이상 사업장 취업규칙 체크포인트",
    summary: "근로계약, 취업규칙, 전자서명 흐름을 함께 점검합니다.",
    audience: "전체 공지",
  },
  {
    category: "지원금 안내",
    title: "두루누리와 고용지원금 동시 점검 리마인드",
    summary: "지원금 적용 누락을 방지하는 실무 일정표를 공유합니다.",
    audience: "업종 맞춤",
  },
];

export const qnaThreads = [
  {
    question: "신규 입사자 정보를 넣으면 근로계약서도 자동으로 만들 수 있나요?",
    answerMode: "챗봇 초안 + 노무사 검수",
    status: "답변중",
  },
  {
    question: "원천세 납부서를 고객사 직원도 볼 수 있게 할지 조정 가능한가요?",
    answerMode: "권한 설정 가이드",
    status: "완료",
  },
  {
    question: "대표자 신분증은 인사담당자가 보지 못하게 고정할 수 있나요?",
    answerMode: "보안 정책",
    status: "완료",
  },
];

export const consultingProjects = [
  {
    name: "사내근로복지기금 설계",
    lead: "김노무",
    progress: 72,
    stage: "자료수집 완료 / 초안 검토중",
  },
  {
    name: "정관 컨설팅",
    lead: "이세무",
    progress: 48,
    stage: "기초자료 접수 / 리스크 진단",
  },
  {
    name: "업종 전환 세무 구조 조정",
    lead: "이세무",
    progress: 30,
    stage: "현황 인터뷰 / 영향 분석",
  },
];
