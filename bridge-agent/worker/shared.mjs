import fs from "fs-extra";
import path from "path";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function sanitizeSegment(value) {
  return String(value || "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80);
}

function makeMinimalPdf(label) {
  const text = String(label || "Bridge Agent Output").replace(/[()\\]/g, "");
  const content = `BT
/F1 18 Tf
72 720 Td
(${text}) Tj
ET
`;
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}endstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += object;
  }

  const startXref = Buffer.byteLength(pdf, "utf8");
  pdf += `xref
0 ${objects.length + 1}
0000000000 65535 f 
`;

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n 
`;
  }

  pdf += `trailer
<< /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${startXref}
%%EOF
`;

  return pdf;
}

export async function createProviderFiles({
  provider,
  company,
  outputDir,
  appendLog,
  jobId,
  docs,
}) {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const bizNo = sanitizeSegment(company.bizNo || company.name || "unknown-biz");
  const companyName = sanitizeSegment(company.name || "company");
  const providerDir = path.join(outputDir, bizNo, provider, year, month);

  await fs.ensureDir(providerDir);
  appendLog(jobId, `${provider} 출력 폴더 준비: ${providerDir}`);

  const files = [];
  for (const doc of docs) {
    await wait(250);

    const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    const fileName = `${companyName}_${provider}_${sanitizeSegment(doc.type)}_${company.baseYm}_${stamp}.pdf`;
    const absolutePath = path.join(providerDir, fileName);
    const relativePath = path.relative(outputDir, absolutePath).replace(/\\/g, "/");

    await fs.writeFile(absolutePath, makeMinimalPdf(`${company.name} ${doc.label}`));
    appendLog(jobId, `${provider} 문서 생성: ${fileName}`);

    files.push({
      provider,
      documentType: doc.type,
      fileName,
      absolutePath,
      relativePath,
      url: `/files/${relativePath}`,
      createdAt: new Date().toISOString(),
    });
  }

  return files;
}
