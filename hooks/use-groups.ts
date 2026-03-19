'use client'
import { useState, useEffect } from 'react'
import { Group } from '@/types'

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/groups')
      const data = await res.json()
      if (data.success) setGroups(data.data)
      else setError(data.error)
    } catch (e) {
      setError('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGroups() }, [])

  const createGroup = async (name: string, description?: string) => {
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    })
    const data = await res.json()
    if (data.success) {
      await fetchGroups()
      return data.data
    }
    throw new Error(data.error)
  }

  return { groups, loading, error, refetch: fetchGroups, createGroup }
}
