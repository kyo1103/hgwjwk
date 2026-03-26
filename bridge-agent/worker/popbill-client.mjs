/**
 * 팝빌 SDK ESM 래퍼
 * popbill 패키지는 CommonJS이므로 createRequire로 로드 후 Promise 래핑
 */
import { createRequire } from 'module';
import { config } from '../config.mjs';

const require = createRequire(import.meta.url);

let _popbill = null;

function getPopbill() {
  if (_popbill) return _popbill;
  _popbill = require('popbill');
  _popbill.config({
    LinkID: config.popbill.linkId,
    SecretKey: config.popbill.secretKey,
    IsTest: config.popbill.isTest,
    defaultErrorHandler: (err) => {
      // 기본 에러 핸들러 — 개별 콜백에서 처리하므로 무시
    },
  });
  return _popbill;
}

/** HTTaxinvoiceService (홈택스 전자세금계산서 수집) */
export function getHTTaxinvoiceService() {
  return getPopbill().HTTaxinvoiceService();
}

/** HTCashreceiptService (홈택스 현금영수증 수집) */
export function getHTCashreceiptService() {
  return getPopbill().HTCashreceiptService();
}

/** HTAccountService (홈택스 계좌 거래내역) — 선택 */
export function getHTAccountService() {
  return getPopbill().HTAccountService();
}

/**
 * 팝빌 콜백 스타일 → Promise 변환 헬퍼
 * fn(args..., successCb, errorCb) 패턴을 Promise<result>로 래핑
 */
export function pbCall(fn, ...args) {
  return new Promise((resolve, reject) => {
    fn(...args,
      (result) => resolve(result),
      (err) => reject(new PopbillError(err))
    );
  });
}

export class PopbillError extends Error {
  constructor(errObj) {
    super(errObj?.message || String(errObj));
    this.code = errObj?.code;
    this.name = 'PopbillError';
  }
}
