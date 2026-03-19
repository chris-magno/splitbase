import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { parseExpenseFromText } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { description, members } = await req.json()
    if (!description) return NextResponse.json({ error: 'Description required' }, { status: 400 })
    const parsed = await parseExpenseFromText(description, members || [])
    return NextResponse.json({ success: true, data: parsed })
  } catch (error) {
    console.error('parse-expense error:', error)
    return NextResponse.json({ error: 'Failed to parse expense' }, { status: 500 })
  }
}
