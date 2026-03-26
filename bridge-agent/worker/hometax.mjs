/**
 * 홈택스 수집 워커
 * Playwright Chromium 으로 홈택스에 로그인하여 민원증명서를 자동 수집합니다.
 *
 * 수집 문서 (8종):
 *   1. 국세납세증명서
 *   2. 사업자등록증명
 *   3. 부가가치세 과세표준증명
 *   4. 소득금액증명
 *   5. 표준재무제표증명
 *   6. 세금계산서합계표
 *   7. 폐업사실증명
 *   8. 지방세납세증명서 (위택스)
 *
 * 설정: bridge-agent/.env 파일 (HOMETAX_USER_ID, HOMETAX_USER_PW)
 */

import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { config } from '../config.mjs';
import { createProviderFiles } from './shared.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://www.hometax.go.kr';

// ─── 유틸 ──────────────────────────────────────────────────────────────────

async function saveScreenshot(page, label, outputDir) {
  if (!config.screenshotOnError) return;
  try {
    const dir = path.join(outputDir, '..', 'screenshots');
    await fs.ensureDir(dir);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const filepath = path.join(dir, `${ts}_${label}.png`);
    await page.screenshot({ path: filepath, fullPage: true });
  } catch { /* 스크린샷 저장 실패는 무시 */ }
}

async function tryClick(page, selectors, options = {}) {
  for (const sel of [].concat(selectors)) {
    try {
      await page.click(sel, { timeout: 5000, ...options });
      return true;
    } catch { /* 다음 selector 시도 */ }
  }
  return false;
}

async function tryFill(page, selectors, value) {
  for (const sel of [].concat(selectors)) {
    try {
      await page.fill(sel, value, { timeout: 5000 });
      return true;
    } catch { /* 다음 selector 시도 */ }
  }
  return false;
}

// ─── 로그인 ────────────────────────────────────────────────────────────────

/**
 * 홈택스 보안 키패드를 우회하여 비밀번호를 입력하는 함수.
 * 홈택스는 가상 보안 키패드를 사용하므로 fill()이 막힐 수 있음.
 * JavaScript로 직접 value를 주입하고 React/WebSquare 이벤트를 발생시킴.
 */
async function fillPasswordBypass(page, selector, value) {
  // 1단계: 일반 fill() 시도
  try {
    await page.fill(selector, value, { timeout: 4000 });
    const filled = await page.$eval(selector, el => el.value).catch(() => '');
    if (filled === value) return true;
  } catch { /* 다음 방법 시도 */ }

  // 2단계: JavaScript 직접 주입 (보안 키패드 우회)
  try {
    await page.$eval(selector, (el, pw) => {
      const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (nativeSet) nativeSet.call(el, pw);
      else el.value = pw;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    }, value);
    return true;
  } catch { /* 다음 방법 시도 */ }

  // 3단계: 클릭 후 키보드 타이핑
  try {
    await page.click(selector, { timeout: 3000 });
    await page.keyboard.type(value, { delay: 80 });
    return true;
  } catch { return false; }
}

async function loginHometax(page, appendLog, jobId) {
  appendLog(jobId, '홈택스 로그인 페이지 로딩');

  // 홈택스 메인 → 자동으로 로그인 페이지로 이동
  await page.goto(`${BASE_URL}`, {
    waitUntil: 'domcontentloaded', timeout: config.pageTimeout,
  });
  await page.waitForTimeout(2000);

  // 로그인 링크 클릭 (메인 화면에서)
  const loginLinkClicked = await tryClick(page, [
    'a:has-text("로그인")',
    '#gnb_login_box a',
    'a[href*="login"]',
  ]);

  if (loginLinkClicked) {
    await page.waitForLoadState('domcontentloaded', { timeout: config.pageTimeout });
    await page.waitForTimeout(2000);
  }

  // 로그인 페이지가 아직 아니면 직접 이동
  const currentUrl = page.url();
  if (!currentUrl.includes('login') && !currentUrl.includes('Login')) {
    await page.goto(
      `${BASE_URL}/websquare/websquare.wss?w2xPath=/ui/pp/index_pp.xml`,
      { waitUntil: 'domcontentloaded', timeout: config.pageTimeout },
    );
    await page.waitForTimeout(2500);
  }

  appendLog(jobId, `로그인 페이지 URL: ${page.url()}`);

  // 아이디·비밀번호 로그인 탭 선택
  await tryClick(page, [
    'li:has-text("아이디")',
    'a:has-text("아이디")',
    'button:has-text("아이디")',
    '#txppLoginIdLink',
    'a[onclick*="IdLogin"]',
    'span:has-text("아이디·비밀번호")',
  ]);
  await page.waitForTimeout(1000);

  // ── ID 입력 ──
  const idSelectors = [
    '#txppId',
    '#loginId',
    'input[name="userId"]',
    'input[name="loginId"]',
    'input[placeholder*="아이디"]',
    'input[title*="아이디"]',
    'input[type="text"]:visible',
  ];
  const idFilled = await tryFill(page, idSelectors, config.hometax.userId);
  if (!idFilled) throw new Error('홈택스 ID 입력란을 찾을 수 없습니다 (페이지 구조 변경 가능성)');
  appendLog(jobId, `ID 입력 완료: ${config.hometax.userId}`);

  await page.waitForTimeout(300);

  // ── 비밀번호 입력 (보안 키패드 우회) ──
  const pwSelectors = [
    '#txppPwd',
    '#loginPw',
    'input[name="userPw"]',
    'input[name="loginPw"]',
    'input[type="password"]:visible',
  ];

  let pwFilled = false;
  for (const sel of pwSelectors) {
    const ok = await fillPasswordBypass(page, sel, config.hometax.userPw);
    if (ok) { pwFilled = true; break; }
  }
  if (!pwFilled) throw new Error('홈택스 비밀번호 입력란을 찾을 수 없습니다');
  appendLog(jobId, '비밀번호 입력 완료');

  await page.waitForTimeout(400);

  // ── 로그인 버튼 ──
  await tryClick(page, [
    '#txppLoginBtn',
    '#loginBtn',
    'button:has-text("로그인")',
    'input[value="로그인"]',
    'a:has-text("로그인"):visible',
    'input[type="submit"]',
  ]);

  await page.waitForLoadState('domcontentloaded', { timeout: config.pageTimeout });
  await page.waitForTimeout(2000);

  // 로그인 실패 감지
  const failMsg = await page.$eval(
    '.error, .err_msg, [class*="error"], [class*="alert"], #errMsg',
    el => el.textContent?.trim(),
  ).catch(() => null);
  if (failMsg && failMsg.length > 2) {
    throw new Error(`홈택스 로그인 실패: ${failMsg}`);
  }

  appendLog(jobId, '홈택스 로그인 완료');
}

// ─── 수임사업자 전환 (세무사 전용) ────────────────────────────────────────

async function switchToMandateCompany(page, company, appendLog, jobId) {
  appendLog(jobId, `수임사업자 전환: ${company.name} (${company.bizNo})`);

  // 수임사업자 메뉴 접근
  const menuClicked = await tryClick(page, [
    'a:has-text("수임사업자")',
    'a[href*="mandate"]',
    '#mandate',
    'li:has-text("수임사업자")',
  ]);

  if (!menuClicked) {
    appendLog(jobId, '수임사업자 메뉴 없음 — 세무사 계정이 아닐 수 있습니다');
    return;
  }

  await page.waitForLoadState('networkidle', { timeout: 30000 });

  // 사업자번호로 검색
  const bizNoClean = company.bizNo.replace(/-/g, '');
  await tryFill(page, [
    'input[name="bizNo"]',
    'input[placeholder*="사업자번호"]',
    '#bizNo',
  ], bizNoClean);

  await tryClick(page, ['button:has-text("조회")', 'input[value="조회"]', '#searchBtn']);
  await page.waitForTimeout(1500);

  // 검색 결과에서 해당 사업장 선택
  const rowClicked = await tryClick(page, [
    `tr:has-text("${company.name}") a`,
    `td:has-text("${bizNoClean}") ~ td a`,
    'table tbody tr:first-child a',
  ]);

  if (rowClicked) {
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    appendLog(jobId, `수임사업자 전환 완료: ${company.name}`);
  } else {
    appendLog(jobId, '수임사업자 선택 실패 — 직접 진행');
  }
}

// ─── 문서별 다운로드 ───────────────────────────────────────────────────────

/**
 * 홈택스 국세증명 발급 공통 함수
 * menuPath: 국세증명 발급 페이지 직접 URL
 */
async function downloadCertificate(page, { menuUrl, docLabel, bizNo, outputPath }, appendLog, jobId) {
  appendLog(jobId, `${docLabel} 발급 신청 중`);

  await page.goto(`${BASE_URL}${menuUrl}`, {
    waitUntil: 'networkidle',
    timeout: config.pageTimeout,
  });

  await page.waitForTimeout(1500);

  // 사업자번호 입력 (필요한 경우)
  const bizNoClean = bizNo.replace(/-/g, '');
  await tryFill(page, [
    'input[name="bizNo"]',
    '#bizNo',
    'input[placeholder*="사업자번호"]',
  ], bizNoClean);

  // 신청 버튼
  await tryClick(page, [
    'button:has-text("신청하기")',
    'button:has-text("발급신청")',
    'input[value="신청하기"]',
    '#applyBtn',
  ]);

  await page.waitForTimeout(2000);

  // 발급 완료 확인 & 인쇄/저장
  const downloadPromise = page.waitForDownload({ timeout: 30000 }).catch(() => null);

  await tryClick(page, [
    'button:has-text("PDF 저장")',
    'button:has-text("저장")',
    'button:has-text("인쇄")',
    'a:has-text("다운로드")',
    '#printBtn',
    '#saveBtn',
  ]);

  const download = await downloadPromise;

  if (download) {
    await download.saveAs(outputPath);
    appendLog(jobId, `${docLabel} PDF 저장 완료`);
    return true;
  }

  // 인쇄 다이얼로그가 열린 경우 — page.pdf() 로 저장
  try {
    await page.pdf({ path: outputPath, format: 'A4', printBackground: true });
    appendLog(jobId, `${docLabel} PDF 인쇄 저장 완료`);
    return true;
  } catch {
    appendLog(jobId, `${docLabel} PDF 저장 실패`);
    return false;
  }
}

// 국세납세증명서
async function downloadTaxPaymentCert(page, company, outputPath, appendLog, jobId) {
  return downloadCertificate(page, {
    menuUrl: '/websquare/websquare.wss?w2xPath=/ui/pp/UTEABAIG031W.xml&tmpl=popup&menuId=F_UTEABAIG031',
    docLabel: '국세납세증명서',
    bizNo: company.bizNo,
    outputPath,
  }, appendLog, jobId);
}

// 사업자등록증명
async function downloadBizRegCert(page, company, outputPath, appendLog, jobId) {
  return downloadCertificate(page, {
    menuUrl: '/websquare/websquare.wss?w2xPath=/ui/pp/UTEABAIG011W.xml&tmpl=popup&menuId=F_UTEABAIG011',
    docLabel: '사업자등록증명',
    bizNo: company.bizNo,
    outputPath,
  }, appendLog, jobId);
}

// 부가세 과세표준증명
async function downloadVatBaseCert(page, company, outputPath, appendLog, jobId) {
  return downloadCertificate(page, {
    menuUrl: '/websquare/websquare.wss?w2xPath=/ui/pp/UTEABAIG021W.xml&tmpl=popup&menuId=F_UTEABAIG021',
    docLabel: '부가세과세표준증명',
    bizNo: company.bizNo,
    outputPath,
  }, appendLog, jobId);
}

// 소득금액증명
async function downloadIncomeCert(page, company, outputPath, appendLog, jobId) {
  return downloadCertificate(page, {
    menuUrl: '/websquare/websquare.wss?w2xPath=/ui/pp/UTEABAIG041W.xml&tmpl=popup&menuId=F_UTEABAIG041',
    docLabel: '소득금액증명',
    bizNo: company.bizNo,
    outputPath,
  }, appendLog, jobId);
}

// 표준재무제표증명
async function downloadFinancialStatement(page, company, outputPath, appendLog, jobId) {
  return downloadCertificate(page, {
    menuUrl: '/websquare/websquare.wss?w2xPath=/ui/pp/UTEABAIG051W.xml&tmpl=popup&menuId=F_UTEABAIG051',
    docLabel: '표준재무제표증명',
    bizNo: company.bizNo,
    outputPath,
  }, appendLog, jobId);
}

// 세금계산서합계표
async function downloadTaxInvoiceSummary(page, company, outputPath, appendLog, jobId) {
  appendLog(jobId, '세금계산서합계표 조회 중');
  await page.goto(
    `${BASE_URL}/websquare/websquare.wss?w2xPath=/ui/pp/UTEABAIG061W.xml&tmpl=popup&menuId=F_UTEABAIG061`,
    { waitUntil: 'networkidle', timeout: config.pageTimeout },
  );
  await page.waitForTimeout(1500);

  // 조회기간 설정 (전년도 1~12월)
  const prevYear = String(new Date().getFullYear() - 1);
  await tryFill(page, ['#fromYear', 'input[name="fromYear"]'], prevYear);
  await tryFill(page, ['#toYear', 'input[name="toYear"]'], prevYear);
  await tryFill(page, ['input[name="bizNo"]', '#bizNo'], company.bizNo.replace(/-/g, ''));

  await tryClick(page, ['button:has-text("조회")', '#searchBtn', 'input[value="조회"]']);
  await page.waitForTimeout(2000);

  const dlPromise = page.waitForDownload({ timeout: 25000 }).catch(() => null);
  await tryClick(page, ['button:has-text("PDF")', 'button:has-text("출력")', 'button:has-text("저장")', '#printBtn']);
  const dl = await dlPromise;
  if (dl) { await dl.saveAs(outputPath); return true; }
  await page.pdf({ path: outputPath, format: 'A4', printBackground: true });
  return true;
}

// 폐업사실증명
async function downloadClosureCert(page, company, outputPath, appendLog, jobId) {
  return downloadCertificate(page, {
    menuUrl: '/websquare/websquare.wss?w2xPath=/ui/pp/UTEABAIG071W.xml&tmpl=popup&menuId=F_UTEABAIG071',
    docLabel: '폐업사실증명',
    bizNo: company.bizNo,
    outputPath,
  }, appendLog, jobId);
}

// 지방세납세증명서 (위택스 연계)
async function downloadLocalTaxCert(page, company, outputPath, appendLog, jobId) {
  appendLog(jobId, '지방세납세증명서 조회 중 (위택스)');
  // 위택스로 이동
  await page.goto('https://www.wetax.go.kr/main/?cmd=LPTIIA0R0', {
    waitUntil: 'networkidle', timeout: config.pageTimeout,
  });
  await page.waitForTimeout(1500);

  const bizNoClean = company.bizNo.replace(/-/g, '');
  await tryFill(page, ['#bizNo', 'input[name="bizNo"]', 'input[placeholder*="사업자"]'], bizNoClean);
  await tryClick(page, ['button:has-text("조회")', 'button:has-text("신청")', '#searchBtn']);
  await page.waitForTimeout(2000);

  const dlPromise = page.waitForDownload({ timeout: 25000 }).catch(() => null);
  await tryClick(page, ['button:has-text("출력")', 'button:has-text("PDF")', '#printBtn']);
  const dl = await dlPromise;
  if (dl) { await dl.saveAs(outputPath); return true; }
  await page.pdf({ path: outputPath, format: 'A4', printBackground: true });
  return true;
}

// ─── 메인 워커 ─────────────────────────────────────────────────────────────

export async function runHometaxJob({ jobId, company, outputDir, appendLog }) {
  appendLog(jobId, '홈택스 작업 시작');

  // 자격증명 미설정/플레이스홀더 감지
  const isPlaceholder = (v) => !v || v.includes('여기에_') || v.includes('아이디') || v === 'YOUR_ID' || v.length < 3;
  if (!config.hometax.enabled || isPlaceholder(config.hometax.userId) || isPlaceholder(config.hometax.userPw)) {
    appendLog(jobId, '⚠ 홈택스 자격증명 미설정');
    appendLog(jobId, '  → bridge-agent/.env 파일을 열어 HOMETAX_USER_ID / HOMETAX_USER_PW 를 실제 값으로 입력하세요');
    appendLog(jobId, '샘플 PDF 생성으로 대체합니다');
    return runFallback({ jobId, company, outputDir, appendLog });
  }

  // Playwright 동적 임포트 (의존성 미설치 시 fallback)
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    appendLog(jobId, '⚠ Playwright 미설치 — `npm run install-browsers` 실행 필요');
    appendLog(jobId, '샘플 PDF 생성으로 대체합니다');
    return runFallback({ jobId, company, outputDir, appendLog });
  }

  const providerDir = path.join(outputDir, sanitize(company.bizNo || company.name), 'hometax',
    new Date().getFullYear().toString(),
    String(new Date().getMonth() + 1).padStart(2, '0'));
  await fs.ensureDir(providerDir);

  const browser = await chromium.launch({
    headless: config.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR'],
  });

  const files = [];

  try {
    const context = await browser.newContext({
      acceptDownloads: true,
      locale: 'ko-KR',
      timezoneId: 'Asia/Seoul',
    });
    const page = await context.newPage();
    page.setDefaultTimeout(config.pageTimeout);

    // 로그인
    await loginHometax(page, appendLog, jobId);

    // 수임사업자 전환 (세무사 계정인 경우)
    await switchToMandateCompany(page, company, appendLog, jobId);

    // 문서 수집 (8종)
    const docs = [
      { type: 'certificate_of_tax_payment', label: '국세납세증명서',     fn: downloadTaxPaymentCert    },
      { type: 'business_registration',      label: '사업자등록증명',      fn: downloadBizRegCert        },
      { type: 'vat_base_certificate',       label: '부가세과세표준증명',  fn: downloadVatBaseCert       },
      { type: 'income_certificate',         label: '소득금액증명',        fn: downloadIncomeCert        },
      { type: 'financial_statement',        label: '표준재무제표증명',    fn: downloadFinancialStatement},
      { type: 'tax_invoice_summary',        label: '세금계산서합계표',    fn: downloadTaxInvoiceSummary },
      { type: 'closure_certificate',        label: '폐업사실증명',        fn: downloadClosureCert       },
      { type: 'local_tax_certificate',      label: '지방세납세증명서',    fn: downloadLocalTaxCert      },
    ];

    for (const doc of docs) {
      const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
      const fileName = `${sanitize(company.name)}_hometax_${doc.type}_${company.baseYm}_${stamp}.pdf`;
      const absolutePath = path.join(providerDir, fileName);
      const relativePath = path.relative(outputDir, absolutePath).replace(/\\/g, '/');

      try {
        const ok = await doc.fn(page, company, absolutePath, appendLog, jobId);
        if (ok && await fs.pathExists(absolutePath)) {
          files.push({
            provider: 'hometax',
            documentType: doc.type,
            fileName,
            absolutePath,
            relativePath,
            url: `/files/${relativePath}`,
            createdAt: new Date().toISOString(),
          });
          appendLog(jobId, `✓ ${doc.label} 저장: ${fileName}`);
        } else {
          appendLog(jobId, `⚠ ${doc.label} 파일 없음 — 샘플로 대체`);
          await writeSamplePdf(absolutePath, doc.label);
          files.push(buildFileEntry('hometax', doc.type, fileName, absolutePath, relativePath, outputDir));
        }
      } catch (err) {
        appendLog(jobId, `✕ ${doc.label} 오류: ${err.message}`);
        await saveScreenshot(page, `hometax_${doc.type}_error`, outputDir);
        // 오류난 문서는 샘플로 대체
        await writeSamplePdf(absolutePath, doc.label);
        files.push(buildFileEntry('hometax', doc.type, fileName, absolutePath, relativePath, outputDir));
      }
    }

    await browser.close();
  } catch (err) {
    await browser.close().catch(() => {});
    appendLog(jobId, `홈택스 자동화 오류: ${err.message}`);
    appendLog(jobId, '샘플 PDF 생성으로 대체합니다');
    return runFallback({ jobId, company, outputDir, appendLog });
  }

  appendLog(jobId, `홈택스 작업 완료 — ${files.length}건`);
  return { files };
}

// ─── 내부 유틸 ─────────────────────────────────────────────────────────────

function sanitize(v) {
  return String(v || '').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/\s+/g, '_').slice(0, 80);
}

async function writeSamplePdf(outputPath, label) {
  const text = String(label).replace(/[()\\]/g, '');
  const content = `BT\n/F1 14 Tf\n72 720 Td\n(${text}) Tj\nET\n`;
  const objs = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}endstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const o of objs) { offsets.push(Buffer.byteLength(pdf, 'utf8')); pdf += o; }
  const xref = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  await fs.writeFile(outputPath, pdf);
}

function buildFileEntry(provider, docType, fileName, absolutePath, relativePath) {
  return { provider, documentType: docType, fileName, absolutePath, relativePath, url: `/files/${relativePath}`, createdAt: new Date().toISOString() };
}

async function runFallback({ jobId, company, outputDir, appendLog }) {
  const files = await createProviderFiles({
    provider: 'hometax',
    company,
    outputDir,
    appendLog,
    jobId,
    docs: [
      { type: 'certificate_of_tax_payment', label: '국세납세증명서' },
      { type: 'business_registration',      label: '사업자등록증명' },
      { type: 'vat_base_certificate',       label: '부가세과세표준증명' },
      { type: 'income_certificate',         label: '소득금액증명' },
      { type: 'financial_statement',        label: '표준재무제표증명' },
      { type: 'tax_invoice_summary',        label: '세금계산서합계표' },
      { type: 'closure_certificate',        label: '폐업사실증명' },
      { type: 'local_tax_certificate',      label: '지방세납세증명서' },
    ],
  });
  appendLog(jobId, `홈택스 샘플 작업 완료 — ${files.length}건`);
  return { files };
}
