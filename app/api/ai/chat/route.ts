import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { createChatStream } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return new Response('Unauthorized', { status: 401 })
  const { messages, userContext } = await req.json()
  const stream = createChatStream(messages, userContext || { userName: session.user.name || 'User', groups: [], totalBalance: 0 })
  return stream.toDataStreamResponse()
}
