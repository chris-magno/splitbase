'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { BalanceGrid } from '@/components/groups/balance-grid'
import { ExpenseList } from '@/components/expenses/expense-list'
import { AddExpenseDialog } from '@/components/expenses/add-expense-dialog'
import { AIChatPanel } from '@/components/ai/ai-chat-panel'
import { formatCurrency, getInitials } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { Group, Balance } from '@/types'

interface Props {
  groupId: string
  user: { id?: string; name?: string | null; email?: string | null; image?: string | null }
}

export function GroupDetailClient({ groupId, user }: Props) {
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [balances, setBalances] = useState<Balance[]>([])
  const [loadingGroup, setLoadingGroup] = useState(true)
  const [loadingBalances, setLoadingBalances] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  const loadGroup = useCallback(async () => {
    const res = await fetch(`/api/groups/${groupId}`)
    if (res.status === 403) { router.push('/dashboard'); return }
    if (res.ok) setGroup(await res.json())
    setLoadingGroup(false)
  }, [groupId, router])

  const loadBalances = useCallback(async () => {
    setLoadingBalances(true)
    const res = await fetch(`/api/groups/${groupId}/balances`)
    if (res.ok) setBalances(await res.json())
    setLoadingBalances(false)
  }, [groupId])

  useEffect(() => {
    loadGroup()
    loadBalances()
  }, [loadGroup, loadBalances])

  async function addExpense(payload: any) {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, group_id: groupId }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to add expense')
    }
    await loadGroup()
    await loadBalances()
    return res.json()
  }

  async function handleSettle(toUser: string, amount: number) {
    const res = await fetch('/api/settlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_id: groupId, to_user: toUser, amount }),
    })
    if (!res.ok) {
      const err = await res.json()
      toast({ title: 'Error', description: err.error, variant: 'destructive' })
      return
    }
    toast({ title: '✅ Settled!', description: `${formatCurrency(amount)} marked as paid.` })
    await loadGroup()
    await loadBalances()
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Member added!', description: `${inviteEmail} has been added to the group.` })
      setInviteEmail('')
      setInviteOpen(false)
      loadGroup()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setInviting(false)
    }
  }

  const members = (group as any)?.members?.map((m: any) => ({
    id: m.user_id || m.id,
    name: m.name || m.users?.name || 'Unknown',
    email: m.email || m.users?.email || '',
    image: m.image || m.users?.image,
  })) || []

  const expenses = (group as any)?.expenses || []

  const userContext = {
    userName: user.name || 'User',
    groups: group ? [{ name: group.name, balance: group.your_balance || 0 }] : [],
    totalBalance: group?.your_balance || 0,
  }

  if (loadingGroup) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-100 rounded-lg w-48" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    )
  }

  if (!group) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
            {group.description && <p className="text-gray-500 mt-0.5">{group.description}</p>}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setInviteOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" /> Add Member
          </Button>
          <AddExpenseDialog
            groupId={groupId}
            members={members}
            onAdded={() => { loadGroup(); loadBalances() }}
            addExpense={addExpense}
          />
        </div>
      </div>

      {/* Members strip */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">{members.length} members:</span>
        {members.map((m: any) => (
          <div key={m.id} className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1">
            <Avatar className="h-5 w-5">
              <AvatarImage src={m.image} />
              <AvatarFallback className="text-[10px] gradient-brand text-white">{getInitials(m.name)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-700">{m.name?.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="expenses">
        <TabsList className="grid w-full grid-cols-3 max-w-sm">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Ask AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Expense History</CardTitle>
                <span className="text-sm text-gray-500">{expenses.length} expenses</span>
              </div>
            </CardHeader>
            <CardContent>
              <ExpenseList
                expenses={expenses}
                loading={loadingGroup}
                currentUserId={user.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Who owes whom</CardTitle>
            </CardHeader>
            <CardContent>
              <BalanceGrid
                balances={balances}
                loading={loadingBalances}
                groupName={group.name}
                groupId={groupId}
                onSettle={handleSettle}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <AIChatPanel userContext={userContext} />
        </TabsContent>
      </Tabs>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a member</DialogTitle>
            <DialogDescription>
              Enter their email address. They must already have a SplitBase account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4 mt-2">
            <Input
              type="email"
              placeholder="friend@example.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              required
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={inviting} className="gradient-brand text-white border-0">
                {inviting ? 'Adding...' : 'Add Member'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
