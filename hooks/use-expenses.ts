'use client'
import { useState, useEffect } from 'react'
import { Expense } from '@/types'

export function useExpenses(groupId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/groups/${groupId}/expenses`)
      const data = await res.json()
      if (data.success) setExpenses(data.data)
      else setError(data.error)
    } catch (e) {
      setError('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (groupId) fetchExpenses() }, [groupId])

  const addExpense = async (payload: any) => {
    const res = await fetch(`/api/groups/${groupId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (data.success) {
      await fetchExpenses()
      return data.data
    }
    throw new Error(data.error)
  }

  return { expenses, loading, error, refetch: fetchExpenses, addExpense }
}
