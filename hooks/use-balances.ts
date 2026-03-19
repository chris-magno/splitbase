'use client'
import { useState, useEffect } from 'react'
import { Balance } from '@/types'

export function useBalances(groupId: string) {
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!groupId) return
    fetch(`/api/groups/${groupId}/balances`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setBalances(d.data) })
      .finally(() => setLoading(false))
  }, [groupId])

  return { balances, loading }
}
