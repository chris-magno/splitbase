import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createSupabaseServerClient } from '@/supabase/client'

export async function GET(req: NextRequest, { params }: { params: { groupId: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('balances')
    .select('group_id, debtor_id, creditor_id, amount, debtor:debtor_id (id, name, email, image), creditor:creditor_id (id, name, email, image)')
    .eq('group_id', params.groupId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}
