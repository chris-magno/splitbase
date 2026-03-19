export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export interface Group {
  id: string
  name: string
  description?: string
  created_by: string
  created_at: string
  members?: GroupMember[]
  total_expenses?: number
  your_balance?: number
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
  user?: User
}

export interface Expense {
  id: string
  group_id: string
  paid_by: string
  amount: number
  description: string
  category: ExpenseCategory
  ai_parsed: boolean
  receipt_url?: string
  created_at: string
  splits?: Split[]
  payer?: User
}

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'entertainment'
  | 'utilities'
  | 'other'

export interface Split {
  id: string
  expense_id: string
  user_id: string
  amount: number
  reason?: string
  user?: User
}

export interface Balance {
  group_id: string
  debtor_id: string
  creditor_id: string
  amount: number
  debtor?: User
  creditor?: User
}

export interface Settlement {
  id: string
  group_id: string
  from_user: string
  to_user: string
  amount: number
  method?: string
  settled_at: string
}

// AI Response Types
export interface ParsedExpense {
  total: number
  currency: string
  category: ExpenseCategory
  payer: string
  confidence: number
  splits: ParsedSplit[]
}

export interface ParsedSplit {
  member: string
  amount: number
  reason: string
}

export interface ParsedReceipt {
  lineItems: LineItem[]
  subtotal: number
  tax: number
  tip: number
  total: number
  confidence: number
}

export interface LineItem {
  name: string
  price: number
  quantity?: number
}

export interface DraftReminder {
  message: string
  tone: 'gentle' | 'firm' | 'funny'
  subject: string
}

export interface InsightReport {
  narrative: string
  stats: {
    totalSpent: number
    biggestDebt: number
    fastestSettler: string
  }
  highlights: string[]
}

// Form Types
export interface CreateGroupForm {
  name: string
  description?: string
  inviteEmails: string[]
}

export interface CreateExpenseForm {
  group_id: string
  description: string
  amount: number
  paid_by: string
  category: ExpenseCategory
  splits: { user_id: string; amount: number; reason?: string }[]
}
