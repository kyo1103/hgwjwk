type Props = {
  status: string;
};

export function StatusBadge({ status }: Props) {
  const tone = status === "done" || status === "active" ? "ok" : status === "waiting_client" || status === "leave" ? "warn" : "err";
  const labels: Record<string, string> = {
    active: "재직",
    terminated: "퇴사",
    leave: "휴직",
    received: "접수",
    in_progress: "처리중",
    waiting_client: "고객대기",
    done: "완료",
    sent: "발송 완료",
    employee_signed: "직원 서명 완료"
  };
  return <span className={`chip ${tone}`}>{labels[status] ?? status}</span>;
}
