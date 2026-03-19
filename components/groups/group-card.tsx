'use client'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Group } from '@/types'
import { Users, ArrowRight } from 'lucide-react'

interface GroupCardProps { group: Group }

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border-gray-100">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-lg">
              {group.name[0].toUpperCase()}
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 mt-1" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">{group.name}</h3>
          {group.description && (
            <p className="text-xs text-gray-400 mb-3 line-clamp-1">{group.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Users className="h-3.5 w-3.5" />
              <span>Group</span>
            </div>
            <Badge variant="secondary" className="text-xs">Active</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
