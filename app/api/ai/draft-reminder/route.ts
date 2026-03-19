import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { draftDebtReminder } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { debtorName, creditorName, amount, context, tone } = await req.json()
    const draft = await draftDebtReminder(debtorName, creditorName, amount, context, tone)
    return NextResponse.json({ success: true, data: draft })
  } catch (error) {
    console.error('draft-reminder error:', error)
    return NextResponse.json({ error: 'Failed to draft reminder' }, { status: 500 })
  }
}
