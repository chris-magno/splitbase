import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createSupabaseServerClient } from '@/supabase/client'

export async function POST(req: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { to_user, amount, method } = await req.json()
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('settlements')
      .insert({ group_id: params.groupId, from_user: session.user.id, to_user, amount, method: method || 'other' })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record settlement' }, { status: 500 })
  }
}
