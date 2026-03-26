import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock payroll data - in production would use Prisma
const mockPayrolls = [
  {
    id: 'p1',
    clientId: 'c1',
    year: 2026,
    month: 3,
    status: 'draft',
    totalGross: 11_500_000,
    totalDeduction: 1_850_000,
    totalNet: 9_650_000,
    createdAt: new Date().toISOString(),
  },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const year = searchParams.get('year')
  const month = searchParams.get('month')

  let results = mockPayrolls
  if (clientId) results = results.filter(p => p.clientId === clientId)
  if (year) results = results.filter(p => p.year === Number(year))
  if (month) results = results.filter(p => p.month === Number(month))

  return NextResponse.json({ payrolls: results })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    clientId: string
    year: number
    month: number
  }

  const newPayroll = {
    id: `p-${Date.now()}`,
    ...body,
    status: 'draft',
    totalGross: 0,
    totalDeduction: 0,
    totalNet: 0,
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json({ payroll: newPayroll }, { status: 201 })
}
