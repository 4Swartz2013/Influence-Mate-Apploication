'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase, Contact } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, X, Tag } from 'lucide-react'
import { toast } from 'sonner'

interface ContactTagManagerProps {
  contact: Contact
  onUpdate: () => void
}

export function ContactTagManager({ contact, onUpdate }: ContactTagManagerProps) {
  const [newTag, setNewTag] = useState('')
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const { user } = useAuth()

  const tags = contact.tags || []

  const addTag = async () => {
    if (!newTag.trim() || !user) return

    const tagToAdd = newTag.trim().toLowerCase()
    if (tags.includes(tagToAdd)) {
      toast.error('Tag already exists')
      return
    }

    try {
      setAdding(true)
      const updatedTags = [...tags, tagToAdd]

      const { error } = await supabase
        .from('contacts')
        .update({ tags: updatedTags })
        .eq('id', contact.id)
        .eq('user_id', user.id)

      if (error) throw error

      setNewTag('')
      onUpdate()
      toast.success('Tag added successfully')
    } catch (error) {
      console.error('Error adding tag:', error)
      toast.error('Failed to add tag')
    } finally {
      setAdding(false)
    }
  }

  const removeTag = async (tagToRemove: string) => {
    if (!user) return

    try {
      setRemoving(tagToRemove)
      const updatedTags = tags.filter(tag => tag !== tagToRemove)

      const { error } = await supabase
        .from('contacts')
        .update({ tags: updatedTags })
        .eq('id', contact.id)
        .eq('user_id', user.id)

      if (error) throw error

      onUpdate()
      toast.success('Tag removed successfully')
    } catch (error) {
      console.error('Error removing tag:', error)
      toast.error('Failed to remove tag')
    } finally {
      setRemoving(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Tag className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-900">Tags</span>
      </div>

      {/* Existing Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="flex items-center space-x-1 pr-1"
          >
            <span>{tag}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-red-100"
              onClick={() => removeTag(tag)}
              disabled={removing === tag}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}
        {tags.length === 0 && (
          <span className="text-sm text-slate-500">No tags added</span>
        )}
      </div>

      {/* Add New Tag */}
      <div className="flex items-center space-x-2 max-w-sm">
        <Input
          placeholder="Add a tag..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          className="text-sm"
        />
        <Button
          size="sm"
          onClick={addTag}
          disabled={!newTag.trim() || adding}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}