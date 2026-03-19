'use client'
import { Balance } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatCurrency, getInitials } from '@/lib/utils'
import { ReminderDialog } from '@/components/ai/reminder-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from 'next-auth/react'

interface BalanceGridProps {
  balances: Balance[]
  loading: boolean
  groupName: string
  groupId: string
  onSettle: (toUser: string, amount: number) => Promise<void>
}

export function BalanceGrid({ balances, loading, groupName, groupId, onSettle }: BalanceGridProps) {
  const { data: session } = useSession()

  if (loading) {
    return <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
  }

  if (balances.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-3xl mb-2">✅</p>
        <p className="font-medium text-gray-600">All settled up!</p>
        <p className="text-sm">No outstanding balances in this group</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {balances.map((balance, i) => {
        const isDebtor = balance.debtor_id === session?.user?.id
        const isCreditor = balance.creditor_id === session?.user?.id
        const debtor = balance.debtor as any
        const creditor = balance.creditor as any

        return (
          <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={debtor?.image} />
              <AvatarFallback className="text-xs bg-red-100 text-red-600">{getInitials(debtor?.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {isDebtor ? 'You' : debtor?.name || 'Someone'} owe{isDebtor ? '' : 's'}
                {' '}
                <span className="text-blue-600">{isCreditor ? 'you' : creditor?.name || 'someone'}</span>
              </p>
              <p className="text-xs text-gray-400">{groupName}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-bold text-red-500">{formatCurrency(balance.amount)}</span>
              {isCreditor && (
                <ReminderDialog
                  debtorName={debtor?.name || 'them'}
                  creditorName={session?.user?.name || 'You'}
                  amount={balance.amount}
                  context={`expense in ${groupName}`}
                />
              )}
              {isDebtor && (
                <button
                  onClick={() => onSettle(balance.creditor_id, balance.amount)}
                  className="text-xs px-2.5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Settle
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
