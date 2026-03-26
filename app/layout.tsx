import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "세무·노무 통합 플랫폼",
  description: "운영 콘솔, 고객 포털, 자동화 ERP를 연결한 세무·노무 통합 플랫폼"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
