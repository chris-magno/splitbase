import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createSupabaseServerClient } from '@/supabase/client'

export async function POST(req: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const supabase = createSupabaseServerClient()
    const { error } = await supabase
      .from('members')
      .upsert({ group_id: params.groupId, user_id: session.user.id, role: 'member', status: 'active' })
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to join group' }, { status: 500 })
  }
}
