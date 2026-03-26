/**
 * 카카오 상담톡 웹훅 수신 엔드포인트
 * 카카오 비즈니스 채널 설정에서 이 URL을 웹훅으로 등록하세요:
 *   https://{your-domain}/api/kakao/webhook
 *
 * 카카오 → 이 서버로 메시지 수신 이벤트가 POST 됩니다.
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyKakaoWebhook } from '@/lib/kakao'

export const dynamic = 'force-dynamic'

// 인메모리 메시지 저장소 (실제 운영 시 DB 사용)
declare global {
  // eslint-disable-next-line no-var
  var __kakaoMessages: KakaoIncomingMessage[]
}

export interface KakaoIncomingMessage {
  id: string
  userKey: string
  plusFriendUserKey?: string
  phone?: string
  content: string
  type: 'text' | 'image' | 'file' | 'location'
  timestamp: string
  read: boolean
  replied: boolean
  replyContent?: string
  repliedAt?: string
}

function getMessageStore(): KakaoIncomingMessage[] {
  if (!global.__kakaoMessages) global.__kakaoMessages = []
  return global.__kakaoMessages
}

/** GET — 저장된 상담톡 메시지 목록 조회 (ERP 내부용) */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const unreadOnly = searchParams.get('unread') === 'true'

  let messages = getMessageStore()
  if (unreadOnly) messages = messages.filter((m) => !m.read)

  return NextResponse.json({
    messages: messages.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    ),
    total: messages.length,
    unread: messages.filter((m) => !m.read).length,
  })
}

/** POST — 카카오 웹훅 수신 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-kakao-signature')

  // 서명 검증
  if (!verifyKakaoWebhook(rawBody, signature)) {
    return NextResponse.json({ error: '서명 검증 실패' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: '잘못된 JSON' }, { status: 400 })
  }

  const event = payload.event as string

  // 메시지 수신 이벤트 처리
  if (event === 'message' || event === 'follow') {
    const userProfile = payload.userProfile as Record<string, string> | undefined
    const content = payload.content as Record<string, string> | undefined

    const message: KakaoIncomingMessage = {
      id: `kmsg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userKey: userProfile?.userKey ?? 'unknown',
      plusFriendUserKey: userProfile?.plusFriendUserKey,
      content: content?.text ?? (event === 'follow' ? '[채널 친구 추가]' : '[미디어 메시지]'),
      type: (content?.type as KakaoIncomingMessage['type']) ?? 'text',
      timestamp: new Date().toISOString(),
      read: false,
      replied: false,
    }

    getMessageStore().push(message)

    // 최대 500건 보관
    if (global.__kakaoMessages.length > 500) {
      global.__kakaoMessages = global.__kakaoMessages.slice(-500)
    }

    console.log(`[Kakao Webhook] 메시지 수신: ${message.content.slice(0, 50)}`)
  }

  // 카카오 서버에 200 응답 필수
  return NextResponse.json({ ok: true })
}

/** PATCH — 메시지 읽음/답장 상태 업데이트 */
export async function PATCH(req: NextRequest) {
  const { id, read, replied, replyContent } = (await req.json()) as {
    id: string
    read?: boolean
    replied?: boolean
    replyContent?: string
  }

  const store = getMessageStore()
  const msg = store.find((m) => m.id === id)
  if (!msg) return NextResponse.json({ error: '메시지 없음' }, { status: 404 })

  if (read !== undefined) msg.read = read
  if (replied !== undefined) msg.replied = replied
  if (replyContent) {
    msg.replyContent = replyContent
    msg.repliedAt = new Date().toISOString()
  }

  return NextResponse.json({ ok: true, message: msg })
}
