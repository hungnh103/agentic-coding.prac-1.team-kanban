"use client"

import { Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/utils"
import { useDeleteComment } from "@/hooks/useComments"
import type { CommentWithAuthor } from "@/types"

interface CommentListProps {
  comments: CommentWithAuthor[]
  currentUserId: string
  boardId: string
  cardId: string
}

export function CommentList({ comments, currentUserId, boardId, cardId }: CommentListProps) {
  const deleteComment = useDeleteComment(boardId, cardId)

  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Chưa có comment nào
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3 group">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={comment.author.avatarUrl ?? undefined} />
            <AvatarFallback className="text-[10px]">
              {comment.author.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-medium">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm text-foreground break-words">{comment.content}</p>
          </div>
          {comment.authorId === currentUserId && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => deleteComment.mutate(comment.id)}
              disabled={deleteComment.isPending}
              title="Xóa comment"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
