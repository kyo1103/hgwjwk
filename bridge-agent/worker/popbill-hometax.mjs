/**
 * 팝빌 홈택스 스크래핑 워커
 * - 전자세금계산서 수집 (HTTaxinvoiceService)
 * - 현금영수증 수집 (HTCashreceiptService)
 *
 * 작업 흐름:
 *   1. requestJob() → 팝빌에 수집 요청 → jobId 반환
 *   2. pollUntilDone() → 작업 완료까지 폴링 (state === 4)
 *   3. getList() → 수집된 문서 목록 조회
 */
import { config } from '../config.mjs';
import { getHTTaxinvoiceService, getHTCashreceiptService, pbCall, PopbillError } from './popbill-client.mjs';

const AGENT = config.popbill.agentCorpNum;
const POLL_TIMEOUT = config.popbill.pollTimeout;
const POLL_INTERVAL = config.popbill.pollInterval;

// ─── 폴링 헬퍼 ───────────────────────────────────────────────────
async function pollUntilDone(checkFn, { timeout = POLL_TIMEOUT, interval = POLL_INTERVAL } = {}) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const state = await checkFn();
    // 팝빌 수집 상태: 1=대기, 2=진행, 3=부분완료, 4=완료, 5=실패
    if (state === 4 || state === 3) return state;
    if (state === 5) throw new Error('팝빌 수집 작업 실패 (state=5)');
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error('팝빌 폴링 타임아웃');
}

// ─── 전자세금계산서 ───────────────────────────────────────────────
/**
 * 전자세금계산서 수집 요청
 * @param {string} corpNum - 고객사 사업자번호
 * @param {string} baseYm  - 수집 기준 연월 "YYYYMM"
 * @param {'S'|'B'|'T'|'N'} type - S=매출, B=매입, T=위수탁매출, N=위수탁매입
 */
export async function requestTaxinvoice(corpNum, baseYm, type = 'B') {
  const svc = getHTTaxinvoiceService();
  return await pbCall(svc.requestJob.bind(svc), AGENT, corpNum, type, baseYm);
}

export async function getTaxinvoiceJobState(corpNum, jobId) {
  const svc = getHTTaxinvoiceService();
  const result = await pbCall(svc.getJobState.bind(svc), AGENT, corpNum, jobId);
  return result?.jobState ?? result?.state ?? result;
}

/**
 * 전자세금계산서 목록 조회 (수집 완료 후)
 * @returns {Array} 세금계산서 항목 배열
 */
export async function getTaxinvoiceList(corpNum, jobId, { page = 1, perPage = 100 } = {}) {
  const svc = getHTTaxinvoiceService();
  return await pbCall(svc.getList.bind(svc), AGENT, corpNum, jobId, null, null, 0, page, perPage);
}

/**
 * 전자세금계산서 집계 요약
 */
export async function getTaxinvoiceSummary(corpNum, jobId) {
  const svc = getHTTaxinvoiceService();
  return await pbCall(svc.getSummary.bind(svc), AGENT, corpNum, jobId, null, null, 0);
}

// ─── 현금영수증 ───────────────────────────────────────────────────
/**
 * 현금영수증 수집 요청
 * @param {'B'|'S'} tradeType - B=매입(지출증빙), S=매출(판매)
 */
export async function requestCashreceipt(corpNum, baseYm, tradeType = 'B') {
  const svc = getHTCashreceiptService();
  return await pbCall(svc.requestJob.bind(svc), AGENT, corpNum, tradeType, baseYm);
}

export async function getCashreceiptJobState(corpNum, jobId) {
  const svc = getHTCashreceiptService();
  const result = await pbCall(svc.getJobState.bind(svc), AGENT, corpNum, jobId);
  return result?.jobState ?? result?.state ?? result;
}

export async function getCashreceiptList(corpNum, jobId, { page = 1, perPage = 100 } = {}) {
  const svc = getHTCashreceiptService();
  return await pbCall(svc.getList.bind(svc), AGENT, corpNum, jobId, null, null, 0, page, perPage);
}

// ─── 통합 수집 워커 ───────────────────────────────────────────────
/**
 * 고객사 사업자번호 + 기준월로 세금계산서·현금영수증 수집 후 결과 반환
 * @param {object} opts
 * @param {string} opts.corpNum  - 고객사 사업자번호 (하이픈 없이)
 * @param {string} opts.baseYm   - "YYYYMM" (기본: 당월)
 * @param {Function} opts.appendLog - 로그 콜백 (optional)
 * @returns {{ taxinvoices: object[], cashreceipts: object[], summary: object }}
 */
export async function collectHometaxData({ corpNum, baseYm, appendLog = () => {} }) {
  if (!config.popbill.enabled) {
    throw new Error('팝빌이 비활성화 상태입니다 (POPBILL_ENABLED=false)');
  }
  if (!AGENT) {
    throw new Error('POPBILL_AGENT_CORP_NUM이 설정되지 않았습니다');
  }

  const ym = baseYm || new Date().toISOString().slice(0, 7).replace('-', '');

  appendLog(`팝빌 홈택스 수집 시작 — 사업자: ${corpNum}, 기준월: ${ym}`);

  // ── 1. 세금계산서 매입 수집 ──────────────────────────
  appendLog('세금계산서(매입) 수집 요청');
  const taxJobId = await requestTaxinvoice(corpNum, ym, 'B');
  appendLog(`세금계산서 JobId: ${taxJobId} — 완료 대기 중`);

  await pollUntilDone(() => getTaxinvoiceJobState(corpNum, taxJobId));
  appendLog('세금계산서 수집 완료');

  const [taxList, taxSummary] = await Promise.all([
    getTaxinvoiceList(corpNum, taxJobId).catch(() => []),
    getTaxinvoiceSummary(corpNum, taxJobId).catch(() => null),
  ]);
  appendLog(`세금계산서 ${taxList.length}건 조회`);

  // ── 2. 현금영수증 수집 ────────────────────────────────
  appendLog('현금영수증(매입) 수집 요청');
  const cashJobId = await requestCashreceipt(corpNum, ym, 'B');
  appendLog(`현금영수증 JobId: ${cashJobId} — 완료 대기 중`);

  await pollUntilDone(() => getCashreceiptJobState(corpNum, cashJobId));
  appendLog('현금영수증 수집 완료');

  const cashList = await getCashreceiptList(corpNum, cashJobId).catch(() => []);
  appendLog(`현금영수증 ${cashList.length}건 조회`);

  return {
    taxinvoices: taxList,
    cashreceipts: cashList,
    summary: taxSummary,
    meta: { corpNum, baseYm: ym, collectedAt: new Date().toISOString() },
  };
}
