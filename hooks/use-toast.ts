'use client'
import { useState } from 'react'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

const listeners: Array<(toasts: Toast[]) => void> = []
let toastsStore: Toast[] = []
let count = 0

function notify(updated: Toast[]) {
  toastsStore = updated
  listeners.forEach(fn => fn(updated))
}

export function toast(props: Omit<Toast, 'id'>) {
  const id = String(count++)
  notify([...toastsStore, { ...props, id }])
  setTimeout(() => notify(toastsStore.filter(t => t.id !== id)), 4000)
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(toastsStore)
  if (!listeners.includes(setToasts)) listeners.push(setToasts)
  return { toasts, toast }
}
