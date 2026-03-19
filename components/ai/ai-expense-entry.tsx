'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Sparkles, Check, AlertCircle, Edit2 } from 'lucide-react'
import { ParsedExpense } from '@/types'
import { formatCurrency, getCategoryEmoji } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface AIExpenseEntryProps {
  members: { id: string; name: string }[]
  onConfirm: (parsed: ParsedExpense, paidByUserId: string) => Promise<void>
}

export function AIExpenseEntry({ members, onConfirm }: AIExpenseEntryProps) {
  const [description, setDescription] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parsed, setParsed] = useState<ParsedExpense | null>(null)
  const [confirming, setConfirming] = useState(false)

  const handleParse = async () => {
    if (!description.trim()) return
    setParsing(true)
    setParsed(null)
    try {
      const res = await fetch('/api/ai/parse-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, members: members.map((m) => m.name) }),
      })
      const data = await res.json()
      if (data.success) {
        setParsed(data.data)
      } else {
        toast({ title: 'Parse failed', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to parse. Try again.', variant: 'destructive' })
    } finally {
      setParsing(false)
    }
  }

  const handleConfirm = async () => {
    if (!parsed) return
    setConfirming(true)
    try {
      const payer = members.find((m) => m.name.toLowerCase() === parsed.payer.toLowerCase())
      await onConfirm(parsed, payer?.id || members[0]?.id)
      toast({ title: 'Expense saved!', description: `$${parsed.total} split across ${parsed.splits.length} people` })
      setDescription('')
      setParsed(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to save expense', variant: 'destructive' })
    } finally {
      setConfirming(false)
    }
  }

  const confidenceColor = parsed
    ? parsed.confidence >= 0.8 ? 'text-green-600 bg-green-50' : parsed.confidence >= 0.5 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'
    : ''

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ai-desc" className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          Describe the expense in plain English
        </Label>
        <Textarea
          id="ai-desc"
          placeholder='e.g. "Dinner at Nobu $200, split equally except Bob had wine so +$30 for him"'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="resize-none"
          onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleParse() }}
        />
        <p className="text-xs text-gray-400 mt-1">Tip: Be specific about who paid and any unequal splits</p>
      </div>

      <Button
        onClick={handleParse}
        disabled={parsing || !description.trim()}
        className="w-full gradient-brand text-white border-0 gap-2"
      >
        {parsing ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Gemini is parsing...</>
        ) : (
          <><Sparkles className="h-4 w-4" />Parse with AI</>
        )}
      </Button>

      {parsed && (
        <Card className="border-purple-100 bg-purple-50/50 animate-fade-in-up">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">AI Result</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${confidenceColor}`}>
                  {Math.round(parsed.confidence * 100)}% confidence
                </span>
                <span className="text-lg">{getCategoryEmoji(parsed.category)}</span>
              </div>
            </div>

            {parsed.confidence < 0.6 && (
              <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 rounded-lg p-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Low confidence — please review carefully before confirming
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Total</p>
                <p className="font-bold text-lg">{formatCurrency(parsed.total)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Paid by</p>
                <p className="font-semibold">{parsed.payer}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Split breakdown</p>
              <div className="space-y-1.5">
                {parsed.splits.map((split, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2">
                    <div>
                      <span className="font-medium">{split.member}</span>
                      {split.reason && <p className="text-xs text-gray-400">{split.reason}</p>}
                    </div>
                    <span className="font-semibold">{formatCurrency(split.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setParsed(null)} size="sm" className="flex-1 gap-1">
                <Edit2 className="h-3.5 w-3.5" />Edit
              </Button>
              <Button onClick={handleConfirm} disabled={confirming} size="sm" className="flex-1 gap-1 bg-green-600 hover:bg-green-700 text-white border-0">
                {confirming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Confirm & Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
