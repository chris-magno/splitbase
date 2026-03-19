'use client'
import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Users } from 'lucide-react'

export default function JoinPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const code = params.code as string
  const [group, setGroup] = useState<any>(null)
  const [joining, setJoining] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/groups/invite/${code}`)
      .then(r => r.json())
      .then(d => { if (d.success) setGroup(d.data) })
      .finally(() => setLoading(false))
  }, [code])

  const handleJoin = async () => {
    if (!session) { signIn('google'); return }
    setJoining(true)
    try {
      await fetch(`/api/groups/${group.id}/join`, { method: 'POST' })
      router.push(`/groups/${group.id}`)
    } finally { setJoining(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  )

  if (!group) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center"><p className="text-xl font-bold text-gray-900">Invite link not found</p><p className="text-gray-500 mt-1">This link may have expired or is invalid.</p></div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <Card className="w-full max-w-sm border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
            {group.name[0].toUpperCase()}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Join "{group.name}"</h1>
          {group.description && <p className="text-gray-500 text-sm mb-4">{group.description}</p>}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
            <Users className="h-4 w-4" />{group.member_count || 0} member{group.member_count !== 1 ? 's' : ''}
          </div>
          {status === 'unauthenticated' ? (
            <Button onClick={() => signIn('google', { callbackUrl: `/join/${code}` })} className="w-full gradient-brand text-white border-0">
              Sign in with Google to join
            </Button>
          ) : (
            <Button onClick={handleJoin} disabled={joining} className="w-full gradient-brand text-white border-0">
              {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join Group'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
