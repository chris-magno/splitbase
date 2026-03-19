'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface CreateGroupDialogProps {
  onCreated: () => void
  createGroup: (name: string, description?: string) => Promise<any>
}

export function CreateGroupDialog({ onCreated, createGroup }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await createGroup(name.trim(), description.trim() || undefined)
      toast({ title: 'Group created!', description: `"${name}" is ready for expenses.` })
      setOpen(false)
      setName('')
      setDescription('')
      onCreated()
    } catch {
      toast({ title: 'Error', description: 'Failed to create group', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 gradient-brand text-white border-0">
          <Plus className="h-4 w-4" />New Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Create a new group</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="name">Group name *</Label>
            <Input id="name" placeholder="Bali Trip, House Expenses..." value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="desc">Description (optional)</Label>
            <Textarea id="desc" placeholder="What is this group for?" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" rows={2} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading || !name} className="flex-1 gradient-brand text-white border-0">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
