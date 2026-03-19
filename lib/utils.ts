import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ExpenseCategory } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return formatDate(d)
}

export function getCategoryEmoji(category: ExpenseCategory): string {
  const map: Record<ExpenseCategory, string> = {
    food: '🍽️',
    transport: '🚗',
    accommodation: '🏠',
    entertainment: '🎉',
    utilities: '⚡',
    other: '📦',
  }
  return map[category] || '📦'
}

export function getCategoryLabel(category: ExpenseCategory): string {
  const map: Record<ExpenseCategory, string> = {
    food: 'Food & Dining',
    transport: 'Transport',
    accommodation: 'Accommodation',
    entertainment: 'Entertainment',
    utilities: 'Utilities',
    other: 'Other',
  }
  return map[category] || 'Other'
}

export function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

// Convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function getBalanceColor(amount: number): string {
  if (amount > 0) return 'text-green-600'
  if (amount < 0) return 'text-red-600'
  return 'text-gray-500'
}

export function getBalanceLabel(amount: number, name: string): string {
  if (amount > 0) return `${name} owes you ${formatCurrency(Math.abs(amount))}`
  if (amount < 0) return `You owe ${name} ${formatCurrency(Math.abs(amount))}`
  return `All settled with ${name}`
}
