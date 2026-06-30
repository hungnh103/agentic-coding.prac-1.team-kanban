"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCreateCard } from "@/hooks/useCards"

interface AddCardFormProps {
  boardId: string
  columnId: string
}

export function AddCardForm({ boardId, columnId }: AddCardFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const createCard = useCreateCard(boardId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    await createCard.mutateAsync({ title: title.trim(), columnId })
    setTitle("")
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground h-8 mt-1"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Thêm thẻ
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tiêu đề thẻ..."
        autoFocus
        className="h-8 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setIsOpen(false)
            setTitle("")
          }
        }}
      />
      <div className="flex gap-1">
        <Button
          type="submit"
          size="sm"
          className="h-7 text-xs"
          disabled={!title.trim() || createCard.isPending}
        >
          Thêm thẻ
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => {
            setIsOpen(false)
            setTitle("")
          }}
        >
          <Plus className="h-3 w-3 rotate-45" />
        </Button>
      </div>
    </form>
  )
}
