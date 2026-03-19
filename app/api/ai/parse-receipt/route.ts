import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { parseReceiptFromImage } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { image, mimeType, members } = await req.json()
    if (!image) return NextResponse.json({ error: 'Image required' }, { status: 400 })
    const parsed = await parseReceiptFromImage(image, mimeType || 'image/jpeg', members || [])
    return NextResponse.json({ success: true, data: parsed })
  } catch (error) {
    console.error('parse-receipt error:', error)
    return NextResponse.json({ error: 'Failed to parse receipt' }, { status: 500 })
  }
}
