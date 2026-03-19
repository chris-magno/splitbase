'use client'
import { Expense } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatRelativeTime, getCategoryEmoji, getInitials } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface ExpenseListProps {
  expenses: Expense[]
  loading: boolean
  currentUserId?: string
}

export function ExpenseList({ expenses, loading, currentUserId }: ExpenseListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-2">💸</p>
        <p className="font-medium">No expenses yet</p>
        <p className="text-sm">Add your first expense above</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => {
        const isMyExpense = expense.paid_by === currentUserId
        const myShare = expense.splits?.find(s => s.user_id === currentUserId)?.amount || 0

        return (
          <div key={expense.id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg shrink-0">
              {getCategoryEmoji(expense.category)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 text-sm truncate">{expense.description}</p>
                {expense.ai_parsed && (
                  <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" title="AI parsed" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={(expense.payer as any)?.image} />
                  <AvatarFallback className="text-[8px] gradient-brand text-white">
                    {getInitials((expense.payer as any)?.name)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs text-gray-400">
                  {isMyExpense ? 'You paid' : `${(expense.payer as any)?.name || 'Someone'} paid`}
                  {' · '}{formatRelativeTime(expense.created_at)}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
              {myShare > 0 && (
                <p className={`text-xs ${isMyExpense ? 'text-green-600' : 'text-red-500'}`}>
                  {isMyExpense ? `+${formatCurrency(expense.amount - myShare)}` : `-${formatCurrency(myShare)}`} your share
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
