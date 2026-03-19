'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Bell, Loader2, Sparkles, Copy, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface ReminderDialogProps {
  debtorName: string
  creditorName: string
  amount: number
  context: string
}

export function ReminderDialog({ debtorName, creditorName, amount, context }: ReminderDialogProps) {
  const [open, setOpen] = useState(false)
  const [tone, setTone] = useState<'gentle' | 'firm' | 'funny'>('gentle')
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState<{ message: string; subject: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleDraft = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/draft-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debtorName, creditorName, amount, context, tone }),
      })
      const data = await res.json()
      if (data.success) setDraft(data.data)
    } catch {
      toast({ title: 'Error', description: 'Failed to draft reminder', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!draft) return
    navigator.clipboard.writeText(draft.message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: 'Copied!', description: 'Message copied to clipboard' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
          <Bell className="h-3.5 w-3.5" />Remind
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />AI Reminder Draft
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 text-sm">
            <p className="text-gray-500">Reminding</p>
            <p className="font-semibold">{debtorName} → {formatCurrency(amount)}</p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Choose tone</p>
            <div className="flex gap-2">
              {(['gentle', 'firm', 'funny'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTone(t); setDraft(null) }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    tone === t ? 'gradient-brand text-white border-transparent' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t === 'gentle' ? '😊 Gentle' : t === 'firm' ? '💼 Firm' : '😄 Funny'}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleDraft} disabled={loading} className="w-full gradient-brand text-white border-0 gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Drafting...</> : <><Sparkles className="h-4 w-4" />Generate Draft</>}
          </Button>

          {draft && (
            <div className="space-y-2 animate-fade-in-up">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 text-xs">
                <span className="text-blue-600 font-medium">Subject: </span>{draft.subject}
              </div>
              <Textarea value={draft.message} readOnly rows={4} className="text-sm bg-gray-50 resize-none" />
              <Button onClick={handleCopy} variant="outline" size="sm" className="w-full gap-2">
                {copied ? <><Check className="h-4 w-4 text-green-600" />Copied!</> : <><Copy className="h-4 w-4" />Copy Message</>}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
