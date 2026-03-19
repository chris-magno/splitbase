import { google } from '@ai-sdk/google'
import { generateObject, streamText } from 'ai'
import { z } from 'zod'

// ── Schemas ───────────────────────────────────────────────────────────────────

const expenseSchema = z.object({
  total: z.number().describe('Total expense amount'),
  currency: z.string().default('USD'),
  category: z.enum(['food', 'transport', 'accommodation', 'entertainment', 'utilities', 'other']),
  payer: z.string().describe('Name of the person who paid'),
  confidence: z.number().min(0).max(1),
  splits: z.array(z.object({
    member: z.string(),
    amount: z.number(),
    reason: z.string(),
  })),
})

const receiptSchema = z.object({
  lineItems: z.array(z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number().optional().default(1),
  })),
  subtotal: z.number(),
  tax: z.number(),
  tip: z.number(),
  total: z.number(),
  confidence: z.number().min(0).max(1),
})

const reminderSchema = z.object({
  message: z.string(),
  tone: z.enum(['gentle', 'firm', 'funny']),
  subject: z.string(),
})

const insightSchema = z.object({
  narrative: z.string(),
  stats: z.object({
    totalSpent: z.number(),
    biggestDebt: z.number(),
    fastestSettler: z.string(),
  }),
  highlights: z.array(z.string()),
})

// ── Parse Expense from Natural Language ───────────────────────────────────────

export async function parseExpenseFromText(description: string, members: string[]) {
  const { object } = await generateObject({
    model: google('gemini-2.0-flash-exp'),
    schema: expenseSchema,
    prompt: `You are an expense parsing assistant for a bill-splitting app.
Parse this expense description into structured data.
Group members: ${members.join(', ')}
Expense: "${description}"
Rules:
- Identify total amount and who paid
- Split amounts must add up to total
- Equal split among all members if not specified
- Give reason for each person's amount
- Set confidence based on clarity (1.0 = perfectly clear)`,
  })
  return object
}

// ── Parse Receipt from Image ──────────────────────────────────────────────────

export async function parseReceiptFromImage(base64Image: string, mimeType: string, members: string[]) {
  const { object } = await generateObject({
    model: google('gemini-2.0-flash-exp'),
    schema: receiptSchema,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          image: base64Image,
          mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
        },
        {
          type: 'text',
          text: `Extract all receipt info: line items with prices, subtotal, tax, tip, and total.
Members splitting: ${members.join(', ')}
Set confidence to 0 if the receipt is unreadable.`,
        },
      ],
    }],
  })
  return object
}

// ── Draft AI Reminder ─────────────────────────────────────────────────────────

export async function draftDebtReminder(
  debtorName: string,
  creditorName: string,
  amount: number,
  expenseContext: string,
  tone: 'gentle' | 'firm' | 'funny' = 'gentle'
) {
  const toneMap = {
    gentle: 'warm and friendly, like texting a close friend',
    firm: 'professional and direct, polite but clear',
    funny: 'humorous with a money-related pun',
  }

  const { object } = await generateObject({
    model: google('gemini-2.0-flash-exp'),
    schema: reminderSchema,
    prompt: `Draft a debt reminder from ${creditorName} to ${debtorName}.
Amount: $${amount.toFixed(2)}
Context: ${expenseContext}
Tone: ${toneMap[tone]}
Keep under 3 sentences. Sound human, not automated. Reference the specific expense.`,
  })
  return object
}

// ── Generate Monthly Insights ─────────────────────────────────────────────────

export async function generateSpendingInsights(userName: string, data: {
  totalSpent: number
  expenseCount: number
  topCategory: string
  groups: { name: string; amount: number }[]
  biggestDebt: { person: string; amount: number }
  fastestSettler: string
}) {
  const { object } = await generateObject({
    model: google('gemini-2.0-flash-exp'),
    schema: insightSchema,
    prompt: `Generate a personalized monthly spending insight for ${userName}.
Data: total $${data.totalSpent}, ${data.expenseCount} expenses, top category: ${data.topCategory}
Groups: ${data.groups.map(g => `${g.name}($${g.amount})`).join(', ')}
Biggest debtor: ${data.biggestDebt.person} owes $${data.biggestDebt.amount}
Write 2-3 paragraphs narrative + 3 highlights. Feel personal, not robotic.`,
  })
  return object
}

// ── AI Chat Stream ────────────────────────────────────────────────────────────

export function createChatStream(
  messages: { role: 'user' | 'assistant'; content: string }[],
  userContext: { userName: string; groups: { name: string; balance: number }[]; totalBalance: number }
) {
  const systemPrompt = `You are SplitBase AI, expense assistant for ${userContext.userName}.
Net balance: $${userContext.totalBalance.toFixed(2)}
Groups: ${userContext.groups.map(g => `${g.name}(${g.balance >= 0 ? '+' : ''}$${g.balance.toFixed(2)})`).join(', ')}
Be concise, friendly, and specific. Never make up numbers outside provided context.`

  return streamText({
    model: google('gemini-2.0-flash-exp'),
    system: systemPrompt,
    messages,
  })
}
