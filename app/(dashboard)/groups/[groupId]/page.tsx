'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useExpenses } from '@/hooks/use-expenses'
import { useBalances } from '@/hooks/use-balances'
import { ExpenseList } from '@/components/expenses/expense-list'
import { BalanceGrid } from '@/components/groups/balance-grid'
import { AddExpenseDialog } from '@/components/expenses/add-expense-dialog'
import { AIChatPanel } from '@/components/ai/ai-chat-panel'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Users, Receipt, Scale, Sparkles, Copy } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface GroupData {
  id: string
  name: string
  description?: string
  invite_code: string
  members: { id: string; user_id: string; role: string; users: { id: string; name: string; email: string; image: string } }[]
}

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const groupId = params.groupId as string

  const [group, setGroup] = useState<GroupData | null>(null)
  const [groupLoading, setGroupLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)

  const { expenses, loading: expLoading, refetch: refetchExpenses, addExpense } = useExpenses(groupId)
  const { balances, loading: balLoading } = useBalances(groupId)

  useEffect(() => {
    fetch(`/api/groups/${groupId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setGroup(d.data) })
      .finally(() => setGroupLoading(false))
  }, [groupId])

  const handleSettle = async (toUser: string, amount: number) => {
    try {
      await fetch(`/api/groups/${groupId}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_user: toUser, amount }),
      })
      toast({ title: 'Settlement recorded!', description: 'Balance updated.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to record settlement', variant: 'destructive' })
    }
  }

  const members = group?.members?.map(m => ({ id: m.users.id, name: m.users.name, email: m.users.email })) || []

  const copyInviteLink = () => {
    const url = `${window.location.origin}/join/${group?.invite_code}`
    navigator.clipboard.writeText(url)
    toast({ title: 'Link copied!', description: 'Share it to invite members' })
  }

  if (groupLoading) {
    return <div className="space-y-4"><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-96 rounded-2xl" /></div>
  }

  if (!group) return <div className="text-center py-20 text-gray-400">Group not found</div>

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-1 shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              {group.description && <p className="text-gray-500 text-sm mt-0.5">{group.description}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setShowChat(!showChat)} className="gap-1.5 hidden sm:flex">
                <Sparkles className="h-4 w-4 text-purple-500" />Ask AI
              </Button>
              <AddExpenseDialog groupId={groupId} members={members} onAdded={refetchExpenses} addExpense={addExpense} />
            </div>
          </div>

          {/* Members avatars */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex -space-x-2">
              {group.members?.slice(0, 6).map(m => (
                <Avatar key={m.id} className="h-7 w-7 border-2 border-white">
                  <AvatarImage src={m.users.image} />
                  <AvatarFallback className="text-xs gradient-brand text-white">{getInitials(m.users.name)}</AvatarFallback>
                </Avatar>
              ))}
              {(group.members?.length || 0) > 6 && (
                <div className="h-7 w-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                  +{(group.members?.length || 0) - 6}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-500">{group.members?.length} member{group.members?.length !== 1 ? 's' : ''}</span>
            <button onClick={copyInviteLink} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 ml-auto">
              <Copy className="h-3.5 w-3.5" />Invite link
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={showChat ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <Tabs defaultValue="expenses">
            <TabsList className="w-full">
              <TabsTrigger value="expenses" className="flex-1 gap-2">
                <Receipt className="h-4 w-4" />Expenses ({expenses.length})
              </TabsTrigger>
              <TabsTrigger value="balances" className="flex-1 gap-2">
                <Scale className="h-4 w-4" />Balances ({balances.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="expenses" className="mt-4">
              <ExpenseList expenses={expenses} loading={expLoading} currentUserId={session?.user?.id} />
            </TabsContent>
            <TabsContent value="balances" className="mt-4">
              <BalanceGrid balances={balances} loading={balLoading} groupName={group.name} groupId={groupId} onSettle={handleSettle} />
            </TabsContent>
          </Tabs>
        </div>

        {showChat && (
          <div className="lg:col-span-1">
            <AIChatPanel userContext={{ userName: session?.user?.name || 'User', groups: [{ name: group.name, balance: 0 }], totalBalance: 0 }} />
          </div>
        )}
      </div>
    </div>
  )
}
