"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useCreateComment } from "@/hooks/useComments"

interface CommentFormProps {
  boardId: string
  cardId: string
}

export function CommentForm({ boardId, cardId }: CommentFormProps) {
  const [content, setContent] = useState("")
  const createComment = useCreateComment(boardId, cardId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    await createComment.mutateAsync({ content: content.trim() })
    setContent("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Viết comment..."
        className="min-h-[70px] resize-none text-sm"
        maxLength={2000}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleSubmit(e)
          }
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {content.length}/2000
        </span>
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || createComment.isPending}
        >
          {createComment.isPending ? "Đang gửi..." : "Gửi"}
        </Button>
      </div>
    </form>
  )
}
