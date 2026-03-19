'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'
import { LogOut, LayoutDashboard, Users } from 'lucide-react'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="font-bold text-gray-900">SplitBase AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />Dashboard
            </Button>
          </Link>
        </nav>

        {session?.user && (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image || ''} />
              <AvatarFallback className="text-xs gradient-brand text-white">
                {getInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {session.user.name?.split(' ')[0]}
            </span>
            <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
