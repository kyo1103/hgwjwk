import ERPShell from "@/components/ERPShell";
import { type ReactNode } from "react";

export const metadata = {
    title: "자동화 ERP | 세무·노무 통합 플랫폼",
    description: "홈택스, 4대보험, Gov24, 위택스 수집 작업과 문서 결과를 관리하는 자동화 ERP",
};

export default function ERPLayout({ children }: { children: ReactNode }) {
    return <ERPShell>{children}</ERPShell>;
}
