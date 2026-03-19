import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createSupabaseServerClient } from '@/supabase/client'

export async function GET(req: NextRequest, { params }: { params: { groupId: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createSupabaseServerClient()
  const { groupId } = params

  const { data: group, error } = await supabase
    .from('groups')
    .select(`*, members (id, user_id, role, status, joined_at, users (id, name, email, image)), expenses (id, amount, description, category, paid_by, ai_parsed, created_at, payer:paid_by (id, name, email, image), splits (id, user_id, amount, reason, users (id, name, email, image)))`)
    .eq('id', groupId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const isMember = group.members?.some((m: any) => m.user_id === session.user!.id && m.status === 'active')
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (group.expenses) group.expenses.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return NextResponse.json(group)
}
