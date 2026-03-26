export type TemplateTokenMap = Record<string, string>;

export interface TemplateMessage {
  id: string;
  title: string;
  body: string;
}

export const templateMessages: TemplateMessage[] = [
  {
    id: "leave_promotion_1",
    title: "연차촉진 1차 안내",
    body: `[제목] (연차촉진 1차) {EMP_NAME}님 미사용 연차 사용 안내 ({COMPANY_NAME})\n\n{EMP_NAME}님 안녕하세요. {COMPANY_NAME} 인사담당 {HR_NAME}입니다.\n\n현재 {EMP_NAME}님의 미사용 연차 유급휴가가 {LEAVE_REMAIN_DAYS}일 남아 있으며, 해당 연차는 {LEAVE_EXPIRY}에 소멸 예정입니다.\n\n원활한 휴식과 업무 운영을 위해, 본 메일 수신일로부터 {PROMO_REPLY_DEADLINE}까지\n사용을 희망하시는 휴가 일정을 회신해 주시기 바랍니다.\n\n- 잔여 연차: {LEAVE_REMAIN_DAYS}일\n- 소멸 예정일: {LEAVE_EXPIRY}\n- 회신 기한: {PROMO_REPLY_DEADLINE}\n\n회신 방법:\n1) 본 메일에 답장(희망 일정 기재)\n2) 또는 회사 포털(연차 탭)에서 신청\n\n문의: {CONTACT_PHONE}\n\n감사합니다.\n{COMPANY_NAME} / {HR_NAME} 드림`
  },
  {
    id: "leave_promotion_2",
    title: "연차촉진 2차 지정 통보",
    body: `[제목] (연차촉진 2차) {EMP_NAME}님 연차 사용시기 지정 통보 ({COMPANY_NAME})\n\n{EMP_NAME}님 안녕하세요. {COMPANY_NAME} 인사담당 {HR_NAME}입니다.\n\n앞서 안내드린 미사용 연차 사용과 관련하여, 회신이 확인되지 않아\n업무 운영을 고려하여 아래와 같이 연차 사용 시기를 지정하여 통보드립니다.\n\n- 지정 휴가 기간: {DESIGNATED_FROM} ~ {DESIGNATED_TO}\n- 대상 연차: {LEAVE_REMAIN_DAYS}일(잔여 기준)\n\n위 기간 중 업무상 불가피한 사유가 있는 경우, 본 메일 수신 후 즉시 회신해 주시기 바랍니다.\n(대체 일정 조율이 필요한 경우 관련 사유를 함께 기재해 주세요.)\n\n문의: {CONTACT_PHONE}\n\n감사합니다.\n{COMPANY_NAME} / {HR_NAME} 드림`
  },
  {
    id: "contract_signature_request",
    title: "근로계약서 전자서명 요청",
    body: `[제목] 근로계약서 서명 요청: {COMPANY_NAME} / {EMP_NAME}님\n\n{EMP_NAME}님 안녕하세요.\n{COMPANY_NAME}에서 근로계약서 전자서명을 요청드립니다.\n\n아래 링크를 클릭하여 문서를 확인한 뒤 서명해 주세요.\n- 서명 링크: {SIGN_LINK}\n- 링크 만료: {SIGN_EXPIRES_AT}\n\n서명 방법:\n1) 링크 접속 → 문서 내용 확인\n2) 서명란에 서명(마우스/터치)\n3) ‘서명 제출’ 클릭\n\n문의: {CONTACT_PHONE}\n\n감사합니다.\n{COMPANY_NAME} / {HR_NAME}`
  },
  {
    id: "document_request",
    title: "자료(증빙) 업로드 요청",
    body: `[제목] 자료 업로드 요청: {REQUEST_TITLE} / {COMPANY_NAME}\n\n{HR_NAME}님 안녕하세요.\n요청({REQUEST_NO}) 처리를 위해 아래 자료 업로드가 필요합니다.\n\n[필요 자료]\n- (예) 통장사본\n- (예) 신분증 사본\n- (예) 가족관계증명서(해당 시)\n- (예) 기타 증빙\n\n업로드 방법:\n1) 회사 포털 → 문서함 또는 요청 상세 화면 → ‘파일 업로드’\n2) 분류 선택 후 업로드(가능하면 PDF 권장)\n\n업로드 완료 후 본 메일에 ‘업로드 완료’라고 회신해 주시면 더 빠르게 처리하겠습니다.\n\n문의: {CONTACT_PHONE}`
  },
  {
    id: "entry_checklist",
    title: "입사 진행 안내",
    body: `[제목] (입사 진행 안내) {EMP_NAME}님 입사 처리 체크리스트 – {COMPANY_NAME}\n\n안녕하세요. {COMPANY_NAME} 담당자님.\n\n{EMP_NAME}님 입사 처리를 위해 아래 항목을 진행합니다.\n포털에서 ‘요청({REQUEST_NO})’ 상태를 확인하실 수 있습니다.\n\n[고객사 진행]\n1) 직원 기본정보 확인(입사일/급여/근무시간)\n2) 필수 자료 업로드(요청 화면에 표시)\n3) 근로계약서 서명 진행(직원에게 서명 링크 전달)\n\n[내부(노무/세무) 진행]\n- 노무: 계약서 작성/서명 완료본 저장\n- 세무: 4대보험/원천 반영 및 월마감 체크리스트 반영\n\n문의: {CONTACT_PHONE}`
  },
  {
    id: "leave_qa_template",
    title: "Q&A 간단 응대",
    body: "안녕하세요 {HR_NAME}님.\n문의 주신 내용({REQUEST_TITLE}) 관련하여 아래와 같이 안내드립니다.\n\n1) 결론:\n- (한 줄 결론)\n\n2) 확인이 필요한 정보:\n- (예: 근로형태, 근무시간, 지급 방식 등)\n\n3) 다음 액션:\n- (예: 포털에 자료 업로드 / 계약서 수정본 확인 / 일정 회신)\n\n추가 질문 있으시면 이 티켓에 댓글로 남겨주세요.\n감사합니다."
  }
];

export const resolveTemplate = (template: string, values: TemplateTokenMap): string => {
  let body = template;
  Object.entries(values).forEach(([k, v]) => {
    body = body.replaceAll(`{${k}}`, v ?? "");
  });
  return body;
};
