/**
 * 카카오 메시지 발송 API
 * GET /api/kakao/send
 * POST /api/kakao/send
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  getKakaoConfigStatus,
  sendAlimtalk,
  sendFriendTalk,
  sendContractSignRequest,
  sendChannelNotice,
  type AlimtalkMessage,
  type ContractSignMessage,
  type FriendTalkMessage,
} from '@/lib/kakao'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(getKakaoConfigStatus())
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as
    | { type: 'alimtalk'; payload: AlimtalkMessage }
    | { type: 'friendtalk'; payload: FriendTalkMessage }
    | { type: 'contract_sign'; payload: ContractSignMessage }
    | { type: 'channel_notice'; payload: Parameters<typeof sendChannelNotice>[0] }

  try {
    switch (body.type) {
      case 'alimtalk': {
        const result = await sendAlimtalk(body.payload)
        return NextResponse.json(result)
      }
      case 'friendtalk': {
        const result = await sendFriendTalk(body.payload)
        return NextResponse.json(result)
      }
      case 'contract_sign': {
        const result = await sendContractSignRequest(body.payload)
        return NextResponse.json(result)
      }
      case 'channel_notice': {
        const results = await sendChannelNotice(body.payload)
        return NextResponse.json({ results })
      }
      default:
        return NextResponse.json({ error: '알 수 없는 발송 타입' }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '알 수 없는 오류' },
      { status: 500 },
    )
  }
}
