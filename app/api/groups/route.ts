import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createSupabaseServerClient } from '@/supabase/client'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('members')
      .select(`group_id, groups(id, name, description, created_by, created_at, invite_code)`)
      .eq('user_id', session.user.id)
      .eq('status', 'active')
    if (error) throw error
    const groups = data?.map((m: any) => m.groups).filter(Boolean) || []
    return NextResponse.json({ success: true, data: groups })
  } catch (error) {
    console.error('GET /api/groups error:', error)
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { name, description } = await req.json()
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const supabase = createSupabaseServerClient()
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({ name, description, created_by: session.user.id })
      .select()
      .single()
    if (groupError) throw groupError
    const { error: memberError } = await supabase
      .from('members')
      .insert({ group_id: group.id, user_id: session.user.id, role: 'admin', status: 'active' })
    if (memberError) throw memberError
    return NextResponse.json({ success: true, data: group }, { status: 201 })
  } catch (error) {
    console.error('POST /api/groups error:', error)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}
