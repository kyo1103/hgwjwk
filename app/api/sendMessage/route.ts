/**
 * POST /api/sendMessage
 *
 * Solapi 기반 메시지 발송 라우트
 * type에 따라 ERP 전용 템플릿 함수 또는 커스텀 발송을 처리합니다.
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  sendMessage,
  sendContractSignLink,
  sendLeavePromotion,
  sendPayslipReady,
  sendStaffNotice,
  MESSAGE_TYPES,
} from '@/lib/solapi'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let body: {
    type: string
    phone?: string
    phones?: string[]
    text?: string
    params?: Record<string, unknown>
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: '잘못된 요청 형식' }, { status: 400 })
  }

  const { type } = body

  try {
    switch (type) {

      // ── 커스텀 단건 메시지 ──
      case MESSAGE_TYPES.CUSTOM: {
        if (!body.phone || !body.text) {
          return NextResponse.json({ success: false, error: 'phone과 text가 필요합니다' }, { status: 400 })
        }
        const result = await sendMessage({ to: body.phone, text: body.text })
        return NextResponse.json(result)
      }

      // ── 근로계약서 전자서명 링크 ──
      case MESSAGE_TYPES.CONTRACT_SIGN: {
        const p = body.params as {
          phone: string
          employeeName: string
          contractTitle: string
          signUrl: string
          expireDays?: number
        }
        const result = await sendContractSignLink(p)
        return NextResponse.json(result)
      }

      // ── 연차촉진 안내 ──
      case MESSAGE_TYPES.LEAVE_PROMOTION: {
        const p = body.params as {
          phone: string
          employeeName: string
          remainingDays: number
          deadline: string
          portalUrl?: string
        }
        const result = await sendLeavePromotion(p)
        return NextResponse.json(result)
      }

      // ── 급여명세서 발행 알림 ──
      case MESSAGE_TYPES.PAYSLIP_READY: {
        const p = body.params as {
          phone: string
          employeeName: string
          year: number
          month: number
          netPay: string
          portalUrl: string
        }
        const result = await sendPayslipReady(p)
        return NextResponse.json(result)
      }

      // ── 직원 공지 (다건) ──
      case MESSAGE_TYPES.STAFF_NOTICE: {
        const p = body.params as {
          phones: string[]
          title: string
          content: string
          portalUrl?: string
        }
        const results = await sendStaffNotice(p)
        const allOk = results.every((r) => r.success)
        return NextResponse.json({ success: allOk, results })
      }

      default:
        return NextResponse.json({ success: false, error: `알 수 없는 type: ${type}` }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : '서버 오류' },
      { status: 500 },
    )
  }
}
