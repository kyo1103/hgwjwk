/**
 * bridge-agent 설정 로더
 * bridge-agent/.env 파일을 자동으로 읽습니다.
 * 예시: bridge-agent/.env.example 참조
 */
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env 파일 파싱 (dotenv 없이)
function parseEnv(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) process.env[key] = val;
  }
}

parseEnv(path.join(__dirname, '.env'));

const bool = (key, def = true) => {
  const v = process.env[key];
  if (v === undefined) return def;
  return v.toLowerCase() !== 'false' && v !== '0';
};
const str = (key, def = '') => process.env[key] ?? def;

export const config = {
  // 브라우저 표시 여부 (false = 백그라운드, true = 화면 표시)
  headless: bool('HEADLESS'),
  // 오류 시 스크린샷 저장
  screenshotOnError: bool('SCREENSHOT_ON_ERROR'),
  // 브라우저 timeout (ms)
  pageTimeout: Number(str('PAGE_TIMEOUT', '60000')),

  hometax: {
    enabled: bool('HOMETAX_ENABLED'),
    // ID/PW 로그인
    userId: str('HOMETAX_USER_ID'),
    userPw: str('HOMETAX_USER_PW'),
    // 공동인증서 로그인 (파일 경로)
    certPath: str('HOMETAX_CERT_PATH'),
    certPw: str('HOMETAX_CERT_PW'),
  },

  fourinsure: {
    enabled: bool('FOURINSURE_ENABLED'),
    userId: str('FOURINSURE_USER_ID'),
    userPw: str('FOURINSURE_USER_PW'),
    certPath: str('FOURINSURE_CERT_PATH'),
    certPw: str('FOURINSURE_CERT_PW'),
  },

  // ─── 팝빌 (Popbill) ──────────────────────────────
  popbill: {
    enabled: bool('POPBILL_ENABLED', false),
    linkId: str('POPBILL_LINK_ID'),
    secretKey: str('POPBILL_SECRET_KEY'),
    isTest: bool('POPBILL_IS_TEST', true),
    // 세무사(수임자) 사업자번호
    agentCorpNum: str('POPBILL_AGENT_CORP_NUM'),
    // 폴링 최대 대기시간 (ms)
    pollTimeout: Number(str('POPBILL_POLL_TIMEOUT', '120000')),
    pollInterval: Number(str('POPBILL_POLL_INTERVAL', '3000')),
  },
};
