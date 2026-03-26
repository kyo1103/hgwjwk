/**
 * 카카오 알림톡 / 친구톡 — Solapi 연동
 * @신정노동법률사무소
 *
 * 발송 경로: Next.js → Solapi API → 카카오 채널
 *
 * 환경변수 (.env.local):
 *   SOLAPI_API_KEY          NCSCOZY7QOM3Z3GG
 *   SOLAPI_API_SECRET       41SHEEX8EAMW01X2QMHLHDWOCSGTBC0S
 *   SOLAPI_SENDER_NUMBER    발신번호 (사전 등록 필요)
 *   SOLAPI_KAKAO_PF_ID      Solapi 콘솔 → 카카오 → 채널 목록의 pfId
 *   KAKAO_WEBHOOK_SECRET    웹훅 서명 검증 키 (선택)
 */

import crypto from 'node:crypto'

// ─── Solapi 설정 ──────────────────────────────────────────────────────────

const SOLAPI_BASE = 'https://api.solapi.com'

export const KAKAO_CONFIG = {
  channelId:       '_HIxcZX',
  channelPublicId: '_HIxcZX',
  channelUrl:      'http://pf.kakao.com/_HIxcZX',
  firmName:        '신정노동법률사무소',
} as const

function cfg() {
  return {
    apiKey:       process.env.SOLAPI_API_KEY       ?? '',
    apiSecret:    process.env.SOLAPI_API_SECRET    ?? '',
    senderNumber: process.env.SOLAPI_SENDER_NUMBER ?? '',
    pfId:         process.env.SOLAPI_KAKAO_PF_ID   ?? '',
  }
}

const REQUIRED_ENV_KEYS = [
  'SOLAPI_API_KEY',
  'SOLAPI_API_SECRET',
  'SOLAPI_KAKAO_PF_ID',
] as const

const OPTIONAL_ENV_KEYS = [
  'SOLAPI_SENDER_NUMBER',
  'KAKAO_WEBHOOK_SECRET',
] as const

export interface KakaoConfigStatus {
  provider: 'solapi'
  configured: boolean
  missing: string[]
  optionalMissing: string[]
}

export function getKakaoConfigStatus(): KakaoConfigStatus {
  const { apiKey, apiSecret, senderNumber, pfId } = cfg()
  const requiredValues = {
    SOLAPI_API_KEY: apiKey,
    SOLAPI_API_SECRET: apiSecret,
    SOLAPI_KAKAO_PF_ID: pfId,
  }
  const optionalValues = {
    SOLAPI_SENDER_NUMBER: senderNumber,
    KAKAO_WEBHOOK_SECRET: process.env.KAKAO_WEBHOOK_SECRET ?? '',
  }

  const missing = REQUIRED_ENV_KEYS.filter((key) => !requiredValues[key])
  const optionalMissing = OPTIONAL_ENV_KEYS.filter((key) => !optionalValues[key])

  return {
    provider: 'solapi',
    configured: missing.length === 0,
    missing: [...missing],
    optionalMissing: [...optionalMissing],
  }
}

function isConfigured(): boolean {
  return getKakaoConfigStatus().configured
}

// ─── Solapi HMAC-SHA256 인증 헤더 ────────────────────────────────────────

/**
 * Solapi 인증 헤더 생성
 * Authorization: HMAC-SHA256 apiKey={key}, date={date}, salt={salt}, signature={hmac}
 */
function solapiAuthHeader(): string {
  const { apiKey, apiSecret } = cfg()
  const date      = new Date().toISOString()
  const salt      = crypto.randomBytes(16).toString('hex')
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(date + salt)
    .digest('hex')
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`
}

function solapiHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json;charset=UTF-8',
    Authorization:  solapiAuthHeader(),
  }
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

// ─── 공통 Solapi 발송 ─────────────────────────────────────────────────────

async function solapiSend(messages: unknown[]): Promise<{
  success: boolean
  groupId?: string
  error?: string
}> {
  const configStatus = getKakaoConfigStatus()
  if (!configStatus.configured) {
    const error = `필수 설정 누락: ${configStatus.missing.join(', ')}`
    console.warn(`[Solapi] ${error} — 발송 스킵`)
    return { success: false, error }
  }

  try {
    const res = await fetch(`${SOLAPI_BASE}/messages/v4/send`, {
      method:  'POST',
      headers: solapiHeaders(),
      body:    JSON.stringify({ messages }),
    })

    const data = (await res.json()) as {
      groupId?: string
      errorCode?: string
      errorMessage?: string
    }

    if (!res.ok || data.errorCode) {
      const errMsg = data.errorMessage ?? `HTTP ${res.status}`
      console.error('[Solapi] 발송 실패:', errMsg)
      return { success: false, error: errMsg }
    }

    return { success: true, groupId: data.groupId }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Solapi] 요청 오류:', msg)
    return { success: false, error: msg }
  }
}

// ─── 알림톡 (AlimTalk) ────────────────────────────────────────────────────

export interface AlimtalkMessage {
  recipientPhone:  string
  templateCode:    string
  templateParams?: Record<string, string>
  /** Solapi에 등록된 templateId (예: KA01TP...) */
  solapiTemplateId?: string
  clientId?: string
}

export interface AlimtalkResult {
  success:     boolean
  groupId?:    string
  error?:      string
  requestedAt: Date
}

/**
 * 알림톡 단건 발송
 *
 * solapiTemplateId 미제공 시 → 친구톡(FT) 자유형 메시지로 폴백
 */
export async function sendAlimtalk(msg: AlimtalkMessage): Promise<AlimtalkResult> {
  const { pfId, senderNumber } = cfg()
  const phone   = normalizePhone(msg.recipientPhone)
  const content = buildAlimtalkMessage(msg.templateCode, msg.templateParams ?? {})

  // templateId 있으면 ATA(알림톡), 없으면 FT(친구톡 자유형) 폴백
  const kakaoOptions = msg.solapiTemplateId
    ? {
        pfId,
        templateId: msg.solapiTemplateId,
        variables:  Object.fromEntries(
          Object.entries(msg.templateParams ?? {}).map(([k, v]) => [`#{${k}}`, v]),
        ),
      }
    : {
        pfId,
        content,
      }

  const type = msg.solapiTemplateId ? 'ATA' : 'FT'

  const payload: Record<string, unknown> = {
    to:           phone,
    kakaoOptions,
    type,
  }
  if (senderNumber) payload.from = senderNumber

  const result = await solapiSend([payload])
  return { ...result, requestedAt: new Date() }
}

/**
 * 알림톡 대량 발송 (배치 100건)
 */
export async function sendAlimtalkBatch(messages: AlimtalkMessage[]): Promise<AlimtalkResult[]> {
  const BATCH   = 100
  const results: AlimtalkResult[] = []

  for (let i = 0; i < messages.length; i += BATCH) {
    const batch = messages.slice(i, i + BATCH)
    const batchResults = await Promise.allSettled(batch.map(sendAlimtalk))
    results.push(
      ...batchResults.map((r) =>
        r.status === 'fulfilled'
          ? r.value
          : { success: false, error: String(r.reason), requestedAt: new Date() },
      ),
    )
    if (i + BATCH < messages.length) await new Promise((r) => setTimeout(r, 200))
  }
  return results
}

// ─── 친구톡 (FriendTalk) ──────────────────────────────────────────────────

export interface FriendTalkButton {
  buttonType: 'WL' | 'AL' | 'BK' | 'MD'
  buttonName: string
  linkMo?:    string
  linkPc?:    string
}

export interface FriendTalkMessage {
  recipientPhone: string
  content:        string
  imageUrl?:      string
  buttons?:       FriendTalkButton[]
  isAd?:          boolean
}

export interface FriendTalkResult {
  success:     boolean
  groupId?:    string
  error?:      string
  requestedAt: Date
}

/**
 * 친구톡 발송 — 채널 구독자에게 마케팅/공지 메시지
 * 별도 템플릿 승인 불필요 (자유형)
 */
export async function sendFriendTalk(msg: FriendTalkMessage): Promise<FriendTalkResult> {
  const { pfId, senderNumber } = cfg()
  const phone = normalizePhone(msg.recipientPhone)

  const kakaoOptions: Record<string, unknown> = {
    pfId,
    content: msg.content,
  }
  if (msg.buttons?.length) kakaoOptions.buttons = msg.buttons
  if (msg.imageUrl)        kakaoOptions.imageUrl = msg.imageUrl

  const payload: Record<string, unknown> = {
    to:           phone,
    type:         msg.isAd !== false ? 'FTA' : 'FT',
    kakaoOptions,
  }
  if (senderNumber) payload.from = senderNumber

  const result = await solapiSend([payload])
  return { ...result, requestedAt: new Date() }
}

// ─── 전자계약서 서명 링크 발송 ────────────────────────────────────────────

export interface ContractSignMessage {
  recipientPhone:  string
  recipientName:   string
  contractTitle:   string
  signUrl:         string
  expireDays?:     number
  solapiTemplateId?: string
}

export async function sendContractSignRequest(msg: ContractSignMessage): Promise<AlimtalkResult> {
  const expireDate = new Date()
  expireDate.setDate(expireDate.getDate() + (msg.expireDays ?? 7))
  const expireDateStr = expireDate.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return sendAlimtalk({
    recipientPhone:    msg.recipientPhone,
    templateCode:      'CONTRACT_SIGN',
    solapiTemplateId:  msg.solapiTemplateId,
    templateParams: {
      recipientName:  msg.recipientName,
      contractTitle:  msg.contractTitle,
      signUrl:        msg.signUrl,
      expireDate:     expireDateStr,
    },
  })
}

// ─── 채널 공지 (친구톡 대량) ─────────────────────────────────────────────

export async function sendChannelNotice(opts: {
  phones:     string[]
  title:      string
  content:    string
  linkUrl?:   string
  linkLabel?: string
}): Promise<FriendTalkResult[]> {
  const buttons: FriendTalkButton[] = opts.linkUrl
    ? [{
        buttonType: 'WL',
        buttonName: opts.linkLabel ?? '자세히 보기',
        linkMo:     opts.linkUrl,
        linkPc:     opts.linkUrl,
      }]
    : []

  const fullContent =
    `[${KAKAO_CONFIG.firmName}]\n\n` +
    `📢 ${opts.title}\n\n` +
    opts.content +
    '\n\n' +
    `채널톡: http://pf.kakao.com/${KAKAO_CONFIG.channelId}`

  return Promise.all(
    opts.phones.map((phone) =>
      sendFriendTalk({ recipientPhone: phone, content: fullContent, buttons, isAd: true }),
    ),
  )
}

// ─── 알림톡 메시지 본문 빌더 ─────────────────────────────────────────────

export function buildAlimtalkMessage(
  templateCode: string,
  params: Record<string, string>,
): string {
  const T = KAKAO_CONFIG.firmName
  const get = (k: string) => params[k] ?? ''

  const templates: Record<string, () => string> = {
    DOC_COLLECT_DONE: () =>
      `[${T}] 안녕하세요, ${get('clientName')}님.\n\n` +
      `${get('year')}년 ${get('month')}월 민원서류 수집이 완료되었습니다.\n\n` +
      `수집 문서: ${get('docCount')}건\n` +
      `확인: ${get('portalUrl')}\n\n` +
      `문의: 카카오채널 @${T}`,

    PAYSLIP_READY: () =>
      `[${T}] ${get('employeeName')}님의\n` +
      `${get('year')}년 ${get('month')}월 급여명세서가 발행되었습니다.\n\n` +
      `실수령액: ${get('netPay')}원\n` +
      `명세서 확인: ${get('portalUrl')}\n\n` +
      `문의: 카카오채널 @${T}`,

    FILING_DUE: () =>
      `[${T}] 신고 기한 안내\n\n` +
      `${get('clientName')}님, ${get('filingType')} 신고 기한이\n` +
      `${get('dueDate')} 입니다.\n\n` +
      `준비 서류: ${get('required')}\n\n` +
      `문의: 카카오채널 @${T}`,

    CONTRACT_SIGN: () =>
      `[${T}] 전자서명 요청\n\n` +
      `${get('recipientName')}님께 서명 요청 드립니다.\n\n` +
      `계약서: ${get('contractTitle')}\n` +
      `서명 링크: ${get('signUrl')}\n` +
      `유효기간: ${get('expireDate')}\n\n` +
      `문의: 카카오채널 @${T}`,

    CONSULT_CONFIRM: () =>
      `[${T}] 상담 예약이 확인되었습니다.\n\n` +
      `성함: ${get('clientName')}\n` +
      `일시: ${get('datetime')}\n` +
      `장소: ${get('location') || '신정노동법률사무소'}\n\n` +
      `변경/취소: 카카오채널 @${T} 또는 전화 문의`,

    CASE_UPDATE: () =>
      `[${T}] 사건 진행 안내\n\n` +
      `${get('clientName')}님의 사건 상황을 안내드립니다.\n\n` +
      `사건명: ${get('caseName')}\n` +
      `내용: ${get('updateContent')}\n\n` +
      `문의: 카카오채널 @${T}`,

    LABOR_NOTICE: () =>
      `[${T}] 노무 안내\n\n` +
      `${get('clientName')}님께 안내 드립니다.\n\n` +
      `${get('title')}\n\n` +
      `${get('content')}\n\n` +
      `문의: 카카오채널 @${T}`,
  }

  return templates[templateCode]?.() ??
    Object.entries(params).reduce(
      (msg, [key, val]) => msg.replace(new RegExp(`#\\{${key}\\}`, 'g'), val),
      templateCode,
    )
}

// ─── 웹훅 서명 검증 ──────────────────────────────────────────────────────

export function verifyKakaoWebhook(body: string, signature: string | null): boolean {
  const secret = process.env.KAKAO_WEBHOOK_SECRET
  if (!secret) return true
  if (!signature) return false

  const expected = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))
  } catch {
    return false
  }
}

// ─── 상수 ────────────────────────────────────────────────────────────────

export const ALIMTALK_TEMPLATES = {
  DOC_COLLECT_DONE: 'DOC_COLLECT_DONE',
  PAYSLIP_READY:    'PAYSLIP_READY',
  FILING_DUE:       'FILING_DUE',
  CONTRACT_SIGN:    'CONTRACT_SIGN',
  CONSULT_CONFIRM:  'CONSULT_CONFIRM',
  CASE_UPDATE:      'CASE_UPDATE',
  LABOR_NOTICE:     'LABOR_NOTICE',
} as const

export type AlimtalkTemplateCode = (typeof ALIMTALK_TEMPLATES)[keyof typeof ALIMTALK_TEMPLATES]
