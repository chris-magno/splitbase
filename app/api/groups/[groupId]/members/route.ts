import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createSupabaseServerClient } from '@/supabase/client'

export async function POST(req: NextRequest, { params }: { params: { groupId: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createSupabaseServerClient()
  const { groupId } = params
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const { data: targetUser } = await supabase.from('users').select('id, name, email').eq('email', email.toLowerCase().trim()).single()
  if (!targetUser) return NextResponse.json({ error: 'No user found with that email. They must sign up first.' }, { status: 404 })

  const { data: existing } = await supabase.from('members').select('id').eq('group_id', groupId).eq('user_id', targetUser.id).single()
  if (existing) return NextResponse.json({ error: 'User is already a member' }, { status: 409 })

  const { data, error } = await supabase.from('members').insert({ group_id: groupId, user_id: targetUser.id, role: 'member', status: 'active' }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...data, user: targetUser }, { status: 201 })
}
