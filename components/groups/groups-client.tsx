'use client'
import { useState, useEffect } from 'react'
import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GroupCard } from '@/components/groups/group-card'
import { CreateGroupDialog } from '@/components/groups/create-group-dialog'
import { Group } from '@/types'

interface Props {
  user: { id?: string; name?: string | null; email?: string | null; image?: string | null }
}

export function GroupsClient({ user }: Props) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  async function loadGroups() {
    setLoading(true)
    const res = await fetch('/api/groups')
    if (res.ok) setGroups(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadGroups() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-500 mt-1">All your expense groups in one place</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gradient-brand text-white border-0 gap-2">
          <Plus className="h-4 w-4" /> New Group
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <Users className="h-14 w-14 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No groups yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
            Create a group for your trip, household, or friend circle to start splitting expenses.
          </p>
          <Button onClick={() => setCreateOpen(true)} className="gradient-brand text-white border-0 gap-2">
            <Plus className="h-4 w-4" /> Create your first group
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}

      <CreateGroupDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => { loadGroups(); setCreateOpen(false) }}
      />
    </div>
  )
}
