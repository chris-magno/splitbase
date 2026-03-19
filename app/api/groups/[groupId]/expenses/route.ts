import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createSupabaseServerClient } from '@/supabase/client'

export async function GET(req: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('expenses')
      .select(`*, splits(id, user_id, amount, reason, users(id, name, email, image)), users!expenses_paid_by_fkey(id, name, email, image)`)
      .eq('group_id', params.groupId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { description, amount, paid_by, category, ai_parsed, ai_confidence, splits } = await req.json()
    const supabase = createSupabaseServerClient()
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({ group_id: params.groupId, description, amount, paid_by, category, ai_parsed: ai_parsed || false, ai_confidence })
      .select()
      .single()
    if (expenseError) throw expenseError
    if (splits?.length) {
      const { error: splitsError } = await supabase
        .from('splits')
        .insert(splits.map((s: any) => ({ expense_id: expense.id, user_id: s.user_id, amount: s.amount, reason: s.reason })))
      if (splitsError) throw splitsError
    }
    return NextResponse.json({ success: true, data: expense }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
