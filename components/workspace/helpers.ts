import type { ChannelKey, ConnectorStatus, ERPClient } from "@/lib/erp-types";
import type { WorkspaceSession } from "@/lib/workspace-users";

export interface KakaoConfigStatus {
  provider: "solapi";
  configured: boolean;
  missing: string[];
  optionalMissing: string[];
}

export type KakaoTemplateCode = "DOC_COLLECT_DONE" | "FILING_DUE" | "LABOR_NOTICE";

export const CONNECTOR_LABELS: Record<ChannelKey, string> = {
  hometax: "홈택스",
  fourInsure: "4대보험",
  gov24: "정부24",
  wetax: "위택스",
};

export const STATUS_LABELS: Record<ConnectorStatus, string> = {
  READY: "준비",
  RUNNING: "실행 중",
  SUCCESS: "연결 완료",
  FAILED: "오류",
  NEED_LOGIN: "로그인 필요",
  NEED_CONSENT: "동의 필요",
};

export const KAKAO_TEMPLATES: Array<{
  code: KakaoTemplateCode;
  label: string;
  description: string;
  fields: string[];
}> = [
  {
    code: "DOC_COLLECT_DONE",
    label: "서류 수집 완료",
    description: "홈택스/4대보험 수집 완료 안내를 즉시 발송합니다.",
    fields: ["clientName", "year", "month", "docCount", "portalUrl"],
  },
  {
    code: "FILING_DUE",
    label: "신고 기한 안내",
    description: "고객사에 마감 기한과 준비 서류를 바로 전송합니다.",
    fields: ["clientName", "filingType", "dueDate", "required"],
  },
  {
    code: "LABOR_NOTICE",
    label: "노무 공지",
    description: "단건 안내나 운영 공지를 카카오로 바로 보냅니다.",
    fields: ["clientName", "title", "content"],
  },
];

export function formatDateTime(value?: string | null) {
  if (!value) return "기록 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatFullDateTime(value?: string | null) {
  if (!value) return "기록 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function previewMessage(templateCode: KakaoTemplateCode, params: Record<string, string>) {
  const get = (key: string) => params[key] || `{${key}}`;

  if (templateCode === "DOC_COLLECT_DONE") {
    return `[신정 통합센터]\n${get("clientName")}님, ${get("year")}년 ${get("month")}월 서류 수집이 완료되었습니다.\n수집 문서 ${get("docCount")}건\n확인: ${get("portalUrl")}`;
  }

  if (templateCode === "FILING_DUE") {
    return `[신정 통합센터]\n${get("clientName")}님, ${get("filingType")} 신고 마감은 ${get("dueDate")}입니다.\n준비 서류: ${get("required")}`;
  }

  return `[신정 통합센터]\n${get("clientName")}님께 안내드립니다.\n${get("title")}\n${get("content")}`;
}

export function defaultTemplateParams(
  templateCode: KakaoTemplateCode,
  session: WorkspaceSession,
  client: ERPClient | undefined,
): Record<string, string> {
  const now = new Date();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const portalPath = session.tenantSlug
    ? `/portal/${session.tenantSlug}/dashboard`
    : client
      ? `/erp/clients/${client.id}`
      : "/";
  const portalUrl = `${origin}${portalPath}`;
  const clientName = client?.name || session.companyName;
  const month = String(now.getMonth() + 1).padStart(2, "0");

  if (templateCode === "DOC_COLLECT_DONE") {
    return {
      clientName,
      year: String(now.getFullYear()),
      month,
      docCount: client ? "3" : "1",
      portalUrl,
    };
  }

  if (templateCode === "FILING_DUE") {
    return {
      clientName,
      filingType: "원천세",
      dueDate: `${now.getFullYear()}-${month}-25`,
      required: "급여대장, 증빙 확인",
    };
  }

  return {
    clientName,
    title: "운영 안내",
    content: "확인 요청 사항이 있어 연락드립니다.",
  };
}

export function channelSummary(client: ERPClient) {
  const statuses = Object.values(client.channels);
  if (statuses.some((value) => value === "FAILED")) return "오류";
  if (statuses.some((value) => value === "NEED_LOGIN" || value === "NEED_CONSENT")) return "조치 필요";
  if (statuses.some((value) => value === "RUNNING")) return "수집 중";
  if (statuses.every((value) => value === "SUCCESS" || value === "READY")) return "정상";
  return "확인 필요";
}
