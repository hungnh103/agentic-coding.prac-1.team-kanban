"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useUpdateColumn, useDeleteColumn } from "@/hooks/useColumns"
import { DroppableColumn } from "./DroppableColumn"
import { SortableCard } from "./SortableCard"
import { CardPreview } from "@/components/card/CardPreview"
import { CardDetail } from "@/components/card/CardDetail"
import { AddCardForm } from "@/components/card/AddCardForm"
import type { BoardWithDetails } from "@/types"

type ColumnData = BoardWithDetails["columns"][number]

interface ColumnProps {
  column: ColumnData
  board: BoardWithDetails
  currentUserId: string
}

export function Column({ column, board, currentUserId }: ColumnProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(column.name)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const updateColumn = useUpdateColumn(board.id, column.id)
  const deleteColumn = useDeleteColumn(board.id, column.id)

  const selectedCard = column.cards.find((c) => c.id === selectedCardId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedCardWithDetails = selectedCard
    ? { ...selectedCard, column: { id: column.id, name: column.name }, comments: [] }
    : null

  async function handleRename(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || newName.trim() === column.name) {
      setIsRenaming(false)
      setNewName(column.name)
      return
    }

    await updateColumn.mutateAsync({ name: newName.trim() })
    setIsRenaming(false)
  }

  async function handleDelete(confirm = false) {
    try {
      await deleteColumn.mutateAsync(confirm)
      setShowDeleteDialog(false)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 409) {
        setShowDeleteDialog(true)
      }
    }
  }

  return (
    <div className="flex flex-col w-72 shrink-0 bg-muted/50 rounded-lg p-3">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        {isRenaming ? (
          <form onSubmit={handleRename} className="flex-1">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => {
                setIsRenaming(false)
                setNewName(column.name)
              }}
              autoFocus
              className="h-7 text-sm font-medium"
            />
          </form>
        ) : (
          <button
            className="flex-1 text-left font-medium text-sm hover:text-primary transition-colors"
            onDoubleClick={() => setIsRenaming(true)}
            title="Double-click để đổi tên"
          >
            {column.name}
          </button>
        )}
        <div className="flex items-center gap-1 ml-2">
          <Badge variant="secondary" className="text-xs">
            {column.cards.length}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsRenaming(true)}
            title="Đổi tên cột"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={() => handleDelete(false)}
            title="Xóa cột"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Cards */}
      <DroppableColumn id={column.id} className="flex-1">
        <SortableContext
          items={column.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 min-h-[50px]">
            {column.cards.map((card) => (
              <SortableCard key={card.id} id={card.id}>
                <CardPreview
                  card={card}
                  onClick={() => setSelectedCardId(card.id)}
                />
              </SortableCard>
            ))}
          </div>
        </SortableContext>
      </DroppableColumn>

      <AddCardForm boardId={board.id} columnId={column.id} />

      {/* Card Detail Dialog */}
      {selectedCardWithDetails && (
        <CardDetail
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          card={selectedCardWithDetails as any}
          board={board}
          currentUserId={currentUserId}
          open={!!selectedCardId}
          onClose={() => setSelectedCardId(null)}
        />
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa cột có thẻ?</DialogTitle>
            <DialogDescription>
              Cột &quot;{column.name}&quot; có {column.cards.length} thẻ. Tất cả thẻ sẽ bị xóa vĩnh viễn. Bạn có chắc không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(true)}
              disabled={deleteColumn.isPending}
            >
              {deleteColumn.isPending ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
