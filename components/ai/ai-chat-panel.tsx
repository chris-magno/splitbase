'use client'
import { useChat } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Send, Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface AIChatPanelProps {
  userContext: { userName: string; groups: { name: string; balance: number }[]; totalBalance: number }
}

export function AIChatPanel({ userContext }: AIChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/chat',
    body: { userContext },
    initialMessages: [{
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${userContext.userName.split(' ')[0]}! 👋 I'm your SplitBase AI assistant. Ask me anything about your expenses — "Who owes me the most?", "What did we spend last month?", or "Summarize my groups".`,
    }],
  })

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  return (
    <Card className="h-full flex flex-col border-gray-100 shadow-sm">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />Ask SplitBase AI
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[500px]">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'gradient-brand text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {m.content}
                {m.role === 'assistant' && isLoading && messages[messages.length - 1].id === m.id && (
                  <span className="ai-cursor" />
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about your expenses..."
              className="text-sm"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input} className="gradient-brand text-white border-0 shrink-0">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
