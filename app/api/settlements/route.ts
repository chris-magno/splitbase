import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createSupabaseServerClient } from '@/supabase/client'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createSupabaseServerClient()
  const userId = session.user.id
  const { group_id, to_user, amount, method, notes } = await req.json()

  if (!group_id || !to_user || !amount) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const { data, error } = await supabase
    .from('settlements')
    .insert({ group_id, from_user: userId, to_user, amount, method: method || 'other', notes })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
