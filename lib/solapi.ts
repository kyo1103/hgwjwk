/**
 * Solapi 메시지 발송 모듈
 * @신정노동법률사무소 ERP 전용
 *
 * 용도:
 *  1. 근로계약서 전자서명 링크 발송
 *  2. 연차촉진 안내 메시지
 *  3. 급여명세서 확인 링크
 *  4. 직원 공지 알림
 *
 * 환경변수 (.env.local):
 *  SOLAPI_API_KEY
 *  SOLAPI_API_SECRET
 *  SOLAPI_SENDER_NUMBER
 */

import crypto from 'node:crypto'

// ─── 설정 ─────────────────────────────────────────────────────────────────

const SOLAPI_BASE = 'https://api.solapi.com'

function getCredentials() {
  const apiKey = process.env.SOLAPI_API_KEY ?? ''
  const apiSecret = process.env.SOLAPI_API_SECRET ?? ''
  const sender = process.env.SOLAPI_SENDER_NUMBER ?? ''
  return { apiKey, apiSecret, sender }
}

function isConfigured(): boolean {
  const { apiKey, apiSecret, sender } = getCredentials()
  return Boolean(apiKey && apiSecret && sender)
}

/**
 * HMAC-SHA256 인증 헤더 생성
 * Solapi 공식 서명 방식
 */
function buildAuthHeader(apiKey: string, apiSecret: string): string {
  const date = new Date().toISOString()
  const salt = crypto.randomBytes(8).toString('hex')
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(date + salt)
    .digest('hex')
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

// ─── 타입 ──────────────────────────────────────────────────────────────────

export interface SolapiMessage {
  to: string        // 수신 전화번호
  text: string      // 본문 (SMS 90byte, LMS 2000byte 이내)
  type?: 'SMS' | 'LMS' | 'MMS'
  kakaoOptions?: {
    pfId: string      // 발신프로파일 ID (_HIxcZX)
    templateId: string
    variables?: Record<string, string>
  }
}

export interface SolapiResult {
  success: boolean
  messageId?: string
  groupId?: string
  error?: string
  sentAt: Date
}

// ─── 핵심 발송 함수 ────────────────────────────────────────────────────────

/**
 * 단건 메시지 발송 (SMS/LMS/알림톡)
 */
export async function sendMessage(msg: SolapiMessage): Promise<SolapiResult> {
  if (!isConfigured()) {
    console.warn('[Solapi] 환경변수 미설정 — 발송 스킵')
    return { success: false, error: 'SOLAPI 환경변수 미설정 (SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER_NUMBER 필요)', sentAt: new Date() }
  }

  const { apiKey, apiSecret, sender } = getCredentials()
  const phone = normalizePhone(msg.to)

  const payload = {
    message: {
      to: phone,
      from: sender,
      text: msg.text,
      type: msg.type ?? (msg.text.length > 90 ? 'LMS' : 'SMS'),
      ...(msg.kakaoOptions && { kakaoOptions: msg.kakaoOptions }),
    },
  }

  try {
    const res = await fetch(`${SOLAPI_BASE}/messages/v4/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: buildAuthHeader(apiKey, apiSecret),
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json() as { messageId?: string; groupId?: string; errorCode?: string; errorMessage?: string }

    if (!res.ok) {
      return {
        success: false,
        error: `[${data.errorCode}] ${data.errorMessage ?? res.statusText}`,
        sentAt: new Date(),
      }
    }

    return {
      success: true,
      messageId: data.messageId,
      groupId: data.groupId,
      sentAt: new Date(),
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      sentAt: new Date(),
    }
  }
}

/**
 * 다건 메시지 발송 (배치, 최대 1000건)
 */
export async function sendMessageBatch(messages: SolapiMessage[]): Promise<SolapiResult[]> {
  const { apiKey, apiSecret, sender } = getCredentials()

  if (!isConfigured()) {
    return messages.map(() => ({ success: false, error: '환경변수 미설정', sentAt: new Date() }))
  }

  const payload = {
    messages: messages.map((m) => ({
      to: normalizePhone(m.to),
      from: sender,
      text: m.text,
      type: m.type ?? (m.text.length > 90 ? 'LMS' : 'SMS'),
      ...(m.kakaoOptions && { kakaoOptions: m.kakaoOptions }),
    })),
  }

  try {
    const res = await fetch(`${SOLAPI_BASE}/messages/v4/send-many`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: buildAuthHeader(apiKey, apiSecret),
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json() as { groupId?: string; errorCode?: string; errorMessage?: string }

    if (!res.ok) {
      return messages.map(() => ({
        success: false,
        error: `[${data.errorCode}] ${data.errorMessage}`,
        sentAt: new Date(),
      }))
    }

    return messages.map((_, i) => ({
      success: true,
      groupId: data.groupId,
      messageId: `batch_${data.groupId}_${i}`,
      sentAt: new Date(),
    }))
  } catch (err) {
    return messages.map(() => ({
      success: false,
      error: err instanceof Error ? err.message : String(err),
      sentAt: new Date(),
    }))
  }
}

// ─── ERP 전용 템플릿 함수 ──────────────────────────────────────────────────

const FIRM = '신정노동법률사무소'

/**
 * 근로계약서 전자서명 링크 발송
 */
export async function sendContractSignLink(params: {
  phone: string
  employeeName: string
  contractTitle: string
  signUrl: string
  expireDays?: number
}): Promise<SolapiResult> {
  const expireDate = new Date()
  expireDate.setDate(expireDate.getDate() + (params.expireDays ?? 7))
  const expireDateStr = expireDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

  const text =
    `[${FIRM}] 전자서명 요청\n\n` +
    `${params.employeeName}님, 아래 링크를 통해 근로계약서에 서명해 주세요.\n\n` +
    `📋 ${params.contractTitle}\n` +
    `✍️ 서명 링크: ${params.signUrl}\n` +
    `⏰ 유효기간: ${expireDateStr}까지\n\n` +
    `문의: 카카오채널 @${FIRM}`

  return sendMessage({ to: params.phone, text, type: 'LMS' })
}

/**
 * 연차촉진 안내 메시지
 */
export async function sendLeavePromotion(params: {
  phone: string
  employeeName: string
  remainingDays: number
  deadline: string
  portalUrl?: string
}): Promise<SolapiResult> {
  const text =
    `[${FIRM}] 연차사용 촉진 안내\n\n` +
    `${params.employeeName}님의 미사용 연차가 ${params.remainingDays}일 남아있습니다.\n\n` +
    `📅 사용 권장 기한: ${params.deadline}까지\n` +
    (params.portalUrl ? `🔗 연차 신청: ${params.portalUrl}\n\n` : '\n') +
    `연차는 근로기준법에 따라 기한 내 사용하지 않으면 소멸될 수 있습니다.\n` +
    `문의: 카카오채널 @${FIRM}`

  return sendMessage({ to: params.phone, text, type: 'LMS' })
}

/**
 * 급여명세서 발행 알림
 */
export async function sendPayslipReady(params: {
  phone: string
  employeeName: string
  year: number
  month: number
  netPay: string
  portalUrl: string
}): Promise<SolapiResult> {
  const text =
    `[${FIRM}] 급여명세서 발행\n\n` +
    `${params.employeeName}님,\n` +
    `${params.year}년 ${params.month}월 급여명세서가 발행되었습니다.\n\n` +
    `💰 실수령액: ${params.netPay}원\n` +
    `🔗 명세서 확인: ${params.portalUrl}\n\n` +
    `문의: 카카오채널 @${FIRM}`

  return sendMessage({ to: params.phone, text, type: 'LMS' })
}

/**
 * 직원 공지 발송
 */
export async function sendStaffNotice(params: {
  phones: string[]
  title: string
  content: string
  portalUrl?: string
}): Promise<SolapiResult[]> {
  const text =
    `[${FIRM}] 공지사항\n\n` +
    `📌 ${params.title}\n\n` +
    `${params.content}\n` +
    (params.portalUrl ? `\n🔗 자세히 보기: ${params.portalUrl}\n` : '') +
    `\n문의: 카카오채널 @${FIRM}`

  return sendMessageBatch(params.phones.map((phone) => ({ to: phone, text, type: 'LMS' })))
}

// ─── 타입 내보내기 ────────────────────────────────────────────────────────

export const MESSAGE_TYPES = {
  CONTRACT_SIGN: 'contract_sign',
  LEAVE_PROMOTION: 'leave_promotion',
  PAYSLIP_READY: 'payslip_ready',
  STAFF_NOTICE: 'staff_notice',
  CUSTOM: 'custom',
} as const

export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES]
