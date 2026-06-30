"use client"

import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AssigneeSelector } from "./AssigneeSelector"
import { CommentList } from "./CommentList"
import { CommentForm } from "./CommentForm"
import { useUpdateCard, useDeleteCard } from "@/hooks/useCards"
import type { CardWithDetails, BoardWithDetails } from "@/types"

interface CardDetailProps {
  card: CardWithDetails
  board: BoardWithDetails
  currentUserId: string
  open: boolean
  onClose: () => void
}

export function CardDetail({
  card,
  board,
  currentUserId,
  open,
  onClose,
}: CardDetailProps) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description ?? "")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const updateCard = useUpdateCard(board.id, card.id)
  const deleteCard = useDeleteCard(board.id, card.id)

  useEffect(() => {
    setTitle(card.title)
    setDescription(card.description ?? "")
  }, [card])

  async function handleTitleBlur() {
    if (title.trim() && title.trim() !== card.title) {
      await updateCard.mutateAsync({ title: title.trim() })
    }
  }

  async function handleDescriptionBlur() {
    const trimmed = description.trim()
    if (trimmed !== (card.description ?? "")) {
      await updateCard.mutateAsync({ description: trimmed || undefined })
    }
  }

  async function handleDelete() {
    await deleteCard.mutateAsync()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Chi tiết thẻ</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="card-title" className="sr-only">Tiêu đề</Label>
            <Input
              id="card-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="text-lg font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0"
              aria-label="Tiêu đề thẻ"
            />
          </div>

          <div className="text-xs text-muted-foreground">
            Trong cột: <strong>{card.column.name}</strong>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Người thực hiện
            </Label>
            <AssigneeSelector
              card={card}
              members={board.members}
              boardId={board.id}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="card-description" className="text-xs text-muted-foreground uppercase tracking-wide">
              Mô tả
            </Label>
            <Textarea
              id="card-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Thêm mô tả chi tiết..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Comments ({card.comments.length})
            </Label>
            <CommentForm boardId={board.id} cardId={card.id} />
            <CommentList
              comments={card.comments}
              currentUserId={currentUserId}
              boardId={board.id}
              cardId={card.id}
            />
          </div>

          {/* Delete */}
          <div className="pt-4 border-t">
            {!showDeleteConfirm ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa thẻ
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Xóa thẻ này?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteCard.isPending}
                >
                  Xác nhận
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Hủy
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
