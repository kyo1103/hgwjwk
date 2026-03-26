import Link from "next/link";

export default async function SignPage({ params }: { params: { token: string } }) {
  return (
    <div className="container">
      <div className="main-card">
        <h1>근로계약서 전자서명</h1>
        <p>문서명 / OOO의원</p>
        <p>안내: 링크 토큰 {params.token}</p>

        <div className="file-thumb" style={{ height: 220, marginBottom: 12 }}>
          계약서 PDF 미리보기
        </div>

        <label htmlFor="sign" style={{ fontWeight: 700 }}>
          서명
        </label>
        <textarea id="sign" rows={4} placeholder="여기에 서명을 직접 입력하거나 서명 이미지 첨부(데모)" />
        <div className="toolbar">
          <button className="btn">서명 제출</button>
          <button className="btn secondary">다시 작성</button>
        </div>
        <p className="muted" style={{ marginTop: 12 }}>
          제출 완료 후 자동 알림이 내부 담당자에게 전송되고 사본 다운로드 링크가 제공됩니다.
        </p>
        <Link href="/">홈으로</Link>
      </div>
    </div>
  );
}
