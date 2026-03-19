import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/supabase/client'

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('groups')
      .select('id, name, description')
      .eq('invite_code', params.code)
      .single()
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { count } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('group_id', data.id)
    return NextResponse.json({ success: true, data: { ...data, member_count: count || 0 } })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
