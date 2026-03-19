import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createSupabaseServerClient } from '@/supabase/client'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createSupabaseServerClient()
  const userId = session.user.id
  const { group_id, description, amount, category, paid_by, splits, ai_parsed, ai_confidence } = await req.json()

  if (!group_id || !description || !amount || !splits?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify membership
  const { data: member } = await supabase.from('members').select('id').eq('group_id', group_id).eq('user_id', userId).eq('status', 'active').single()
  if (!member) return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })

  // Create expense
  const { data: expense, error: expError } = await supabase
    .from('expenses')
    .insert({ group_id, description, amount, category: category || 'other', paid_by: paid_by || userId, ai_parsed: ai_parsed || false, ai_confidence })
    .select()
    .single()

  if (expError) return NextResponse.json({ error: expError.message }, { status: 500 })

  // Create splits
  const splitRows = splits.map((s: any) => ({ expense_id: expense.id, user_id: s.user_id, amount: s.amount, reason: s.reason }))
  const { error: splitError } = await supabase.from('splits').insert(splitRows)
  if (splitError) return NextResponse.json({ error: splitError.message }, { status: 500 })

  return NextResponse.json(expense, { status: 201 })
}
