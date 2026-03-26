/**
 * 카카오 알림톡 / 친구톡 — Solapi 연동 (bridge-agent ESM)
 * @신정노동법률사무소
 *
 * SOLAPI_API_KEY     = NCSCOZY7QOM3Z3GG
 * SOLAPI_API_SECRET  = 41SHEEX8EAMW01X2QMHLHDWOCSGTBC0S
 */

import crypto from 'node:crypto'

const SOLAPI_BASE = 'https://api.solapi.com'
const FIRM_NAME   = '신정노동법률사무소'

// ─── HMAC-SHA256 인증 헤더 ────────────────────────────────────────────────

function solapiAuthHeader() {
  const apiKey    = process.env.SOLAPI_API_KEY    ?? ''
  const apiSecret = process.env.SOLAPI_API_SECRET ?? ''
  if (!apiKey || !apiSecret) return null

  const date      = new Date().toISOString()
  const salt      = crypto.randomBytes(16).toString('hex')
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(date + salt)
    .digest('hex')

  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`
}

// ─── 공통 발송 ────────────────────────────────────────────────────────────

async function solapiSend(messages) {
  const auth = solapiAuthHeader()
  if (!auth) {
    console.warn('[Solapi] API 키 미설정 — 발송 스킵')
    return { success: false, error: 'API 키 미설정' }
  }

  try {
    const res = await fetch(`${SOLAPI_BASE}/messages/v4/send`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8', Authorization: auth },
      body:    JSON.stringify({ messages }),
    })

    const data = await res.json()
    if (!res.ok || data.errorCode) {
      console.error('[Solapi] 발송 실패:', data.errorMessage ?? `HTTP ${res.status}`)
      return { success: false, error: data.errorMessage ?? `HTTP ${res.status}` }
    }

    console.log('[Solapi] 발송 성공 groupId:', data.groupId)
    return { success: true, groupId: data.groupId }
  } catch (err) {
    console.error('[Solapi] 요청 오류:', err.message)
    return { success: false, error: err.message }
  }
}

// ─── 알림톡 발송 ─────────────────────────────────────────────────────────

export async function sendAlimtalk({ recipientPhone, templateCode, templateParams = {}, solapiTemplateId }) {
  const pfId   = process.env.SOLAPI_KAKAO_PF_ID  ?? ''
  const sender = process.env.SOLAPI_SENDER_NUMBER ?? ''
  const phone  = recipientPhone.replace(/[^0-9]/g, '')

  const content      = buildMessage(templateCode, templateParams)
  const kakaoOptions = solapiTemplateId
    ? {
        pfId,
        templateId: solapiTemplateId,
        variables:  Object.fromEntries(
          Object.entries(templateParams).map(([k, v]) => [`#{${k}}`, v]),
        ),
      }
    : { pfId, content }

  const payload = { to: phone, type: solapiTemplateId ? 'ATA' : 'FT', kakaoOptions }
  if (sender) payload.from = sender

  return solapiSend([payload])
}

// ─── 친구톡 발송 ─────────────────────────────────────────────────────────

export async function sendFriendTalk({ recipientPhone, content, buttons = [], isAd = true }) {
  const pfId   = process.env.SOLAPI_KAKAO_PF_ID  ?? ''
  const sender = process.env.SOLAPI_SENDER_NUMBER ?? ''
  const phone  = recipientPhone.replace(/[^0-9]/g, '')

  const kakaoOptions = { pfId, content }
  if (buttons.length) kakaoOptions.buttons = buttons

  const payload = { to: phone, type: isAd ? 'FTA' : 'FT', kakaoOptions }
  if (sender) payload.from = sender

  return solapiSend([payload])
}

// ─── 메시지 본문 빌더 ────────────────────────────────────────────────────

function buildMessage(templateCode, params) {
  const T   = FIRM_NAME
  const get = (k) => params[k] ?? ''

  const templates = {
    DOC_COLLECT_DONE: () =>
      `[${T}] 안녕하세요, ${get('clientName')}님.\n\n` +
      `${get('year')}년 ${get('month')}월 민원서류 수집이 완료되었습니다.\n\n` +
      `수집 문서: ${get('docCount')}건\n확인: ${get('portalUrl')}\n\n` +
      `문의: 카카오채널 @${T}`,

    PAYSLIP_READY: () =>
      `[${T}] ${get('employeeName')}님의\n` +
      `${get('year')}년 ${get('month')}월 급여명세서가 발행되었습니다.\n\n` +
      `실수령액: ${get('netPay')}원\n명세서 확인: ${get('portalUrl')}\n\n` +
      `문의: 카카오채널 @${T}`,

    FILING_DUE: () =>
      `[${T}] 신고 기한 안내\n\n` +
      `${get('clientName')}님, ${get('filingType')} 신고 기한이 ${get('dueDate')} 입니다.\n\n` +
      `준비 서류: ${get('required')}\n문의: 카카오채널 @${T}`,

    CONTRACT_SIGN: () =>
      `[${T}] 전자서명 요청\n\n` +
      `${get('recipientName')}님께 서명 요청 드립니다.\n\n` +
      `계약서: ${get('contractTitle')}\n서명 링크: ${get('signUrl')}\n유효기간: ${get('expireDate')}\n\n` +
      `문의: 카카오채널 @${T}`,

    CONSULT_CONFIRM: () =>
      `[${T}] 상담 예약이 확인되었습니다.\n\n` +
      `성함: ${get('clientName')}\n일시: ${get('datetime')}\n장소: ${get('location') || T}\n\n` +
      `변경/취소: 카카오채널 @${T}`,
  }

  return templates[templateCode]?.() ?? JSON.stringify(params)
}
