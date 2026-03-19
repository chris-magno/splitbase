'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AIExpenseEntry } from '@/components/ai/ai-expense-entry'
import { ReceiptScanner } from '@/components/ai/receipt-scanner'
import { Plus, Sparkles, Camera } from 'lucide-react'
import { ParsedExpense, ParsedReceipt, ExpenseCategory } from '@/types'
import { useSession } from 'next-auth/react'

interface AddExpenseDialogProps {
  groupId: string
  members: { id: string; name: string; email: string }[]
  onAdded: () => void
  addExpense: (payload: any) => Promise<any>
}

export function AddExpenseDialog({ groupId, members, onAdded, addExpense }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()

  const handleAIConfirm = async (parsed: ParsedExpense, paidByUserId: string) => {
    const splits = parsed.splits.map((s) => {
      const member = members.find(m => m.name.toLowerCase() === s.member.toLowerCase())
      return { user_id: member?.id || session?.user?.id, amount: s.amount, reason: s.reason }
    }).filter(s => s.user_id)

    await addExpense({
      description: `AI: ${parsed.splits.map(s => s.member).join(', ')} — ${parsed.category}`,
      amount: parsed.total,
      paid_by: paidByUserId,
      category: parsed.category as ExpenseCategory,
      ai_parsed: true,
      ai_confidence: parsed.confidence,
      splits,
    })
    setOpen(false)
    onAdded()
  }

  const handleReceiptConfirm = async (receipt: ParsedReceipt, description: string) => {
    const splitAmount = receipt.total / members.length
    const splits = members.map(m => ({ user_id: m.id, amount: splitAmount, reason: 'Equal split from receipt' }))
    await addExpense({
      description,
      amount: receipt.total,
      paid_by: session?.user?.id,
      category: 'food' as ExpenseCategory,
      ai_parsed: true,
      ai_confidence: receipt.confidence,
      splits,
    })
    setOpen(false)
    onAdded()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 gradient-brand text-white border-0">
          <Plus className="h-4 w-4" />Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="ai">
          <TabsList className="w-full">
            <TabsTrigger value="ai" className="flex-1 gap-2">
              <Sparkles className="h-4 w-4" />AI Entry
            </TabsTrigger>
            <TabsTrigger value="receipt" className="flex-1 gap-2">
              <Camera className="h-4 w-4" />Receipt Scan
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ai" className="mt-4">
            <AIExpenseEntry members={members} onConfirm={handleAIConfirm} />
          </TabsContent>
          <TabsContent value="receipt" className="mt-4">
            <ReceiptScanner members={members} onConfirm={handleReceiptConfirm} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
