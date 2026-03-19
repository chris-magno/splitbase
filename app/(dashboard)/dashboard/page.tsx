'use client'
import { useSession } from 'next-auth/react'
import { useGroups } from '@/hooks/use-groups'
import { GroupCard } from '@/components/groups/group-card'
import { CreateGroupDialog } from '@/components/groups/create-group-dialog'
import { AIChatPanel } from '@/components/ai/ai-chat-panel'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function DashboardPage() {
  const { data: session } = useSession()
  const { groups, loading, refetch, createGroup } = useGroups()
  const [showChat, setShowChat] = useState(false)
  const firstName = session?.user?.name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hey, {firstName} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">Your expense groups and balances</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className="gap-2 hidden sm:flex"
          >
            <Sparkles className="h-4 w-4 text-purple-500" />
            Ask AI
          </Button>
          <CreateGroupDialog onCreated={refetch} createGroup={createGroup} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups */}
        <div className={showChat ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1">No groups yet</h3>
              <p className="text-gray-500 text-sm mb-4">Create your first group to start splitting expenses</p>
              <CreateGroupDialog onCreated={refetch} createGroup={createGroup} />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </div>

        {/* AI Chat Panel */}
        {showChat && (
          <div className="lg:col-span-1">
            <AIChatPanel
              userContext={{
                userName: session?.user?.name || 'User',
                groups: groups.map((g) => ({ name: g.name, balance: 0 })),
                totalBalance: 0,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
