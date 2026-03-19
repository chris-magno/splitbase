import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SplitBase AI — Split bills smarter with Gemini AI',
  description:
    'AI-powered expense splitting. Photograph receipts, describe splits in plain English, and let Gemini handle the math and reminders.',
  keywords: ['expense splitting', 'AI', 'Gemini', 'bill splitting', 'groups'],
  openGraph: {
    title: 'SplitBase AI',
    description: 'Split bills smarter. Let AI handle the math.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
