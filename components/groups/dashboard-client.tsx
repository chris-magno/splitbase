'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, TrendingUp, TrendingDown, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CreateGroupDialog } from '@/components/groups/create-group-dialog'
import { formatCurrency } from '@/lib/utils'
import { Group } from '@/types'

interface Props { user: { id?: string; name?: string | null; email?: string | null; image?: string | null } }

export function DashboardClient({ user }: Props) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  async function loadGroups() {
    const res = await fetch('/api/groups')
    if (res.ok) setGroups(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadGroups() }, [])

  const totalOwed = groups.reduce((sum, g) => sum + Math.max(0, -(g.your_balance || 0)), 0)
  const totalOwedToMe = groups.reduce((sum, g) => sum + Math.max(0, g.your_balance || 0), 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hey {user.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 mt-1">Here's your expense overview</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gradient-brand text-white border-0 gap-2">
          <Plus className="h-4 w-4" /> New Group
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-green-100 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700">You're owed</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(totalOwedToMe)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-100 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-700">You owe</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(totalOwed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Active groups</p>
                <p className="text-2xl font-bold text-blue-700">{groups.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Groups</h2>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl shimmer" />)}</div>
        ) : groups.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No groups yet</h3>
              <p className="text-gray-500 text-sm mb-6">Create a group to start splitting expenses with friends</p>
              <Button onClick={() => setCreateOpen(true)} className="gradient-brand text-white border-0 gap-2">
                <Plus className="h-4 w-4" /> Create your first group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map(group => (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      {(group.your_balance || 0) > 0 && <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">+{formatCurrency(group.your_balance || 0)}</span>}
                      {(group.your_balance || 0) < 0 && <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-medium">{formatCurrency(group.your_balance || 0)}</span>}
                      {(group.your_balance || 0) === 0 && <span className="text-xs bg-gray-50 text-gray-500 border px-2 py-0.5 rounded-full">Settled</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    {group.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{group.description}</p>}
                    <div className="flex items-center gap-3 mt-4 text-xs text-gray-400">
                      <span>{(group as any).memberCount || 0} members</span>
                      <span>·</span>
                      <span>{formatCurrency(group.total_expenses || 0)} total</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateGroupDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={() => { loadGroups(); setCreateOpen(false) }} />
    </div>
  )
}
