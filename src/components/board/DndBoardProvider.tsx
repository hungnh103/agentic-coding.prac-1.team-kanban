"use client"

import { useEffect, useState, useCallback } from "react"
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useBoardStore } from "@/store/boardStore"
import { useMoveCard } from "@/hooks/useCards"
import { generateOrder } from "@/lib/utils"
import { DragOverlay } from "./DragOverlay"
import type { BoardWithDetails } from "@/types"

interface DndBoardProviderProps {
  board: BoardWithDetails
  children: (columns: BoardWithDetails["columns"]) => React.ReactNode
}

export function DndBoardProvider({ board, children }: DndBoardProviderProps) {
  const { columns, setColumns, moveCard } = useBoardStore()
  const moveCardMutation = useMoveCard(board.id)
  const [activeCardId, setActiveCardId] = useState<string | null>(null)

  // Sync board data to store
  useEffect(() => {
    setColumns(board.columns)
  }, [board.columns, setColumns])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const findCardColumn = useCallback(
    (cardId: string) => {
      return columns.find((col) => col.cards.some((c) => c.id === cardId))
    },
    [columns]
  )

  function onDragStart({ active }: DragStartEvent) {
    setActiveCardId(active.id as string)
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return

    const activeColumnId = findCardColumn(active.id as string)?.id
    const overColumnId = over.id as string

    if (!activeColumnId || activeColumnId === overColumnId) return

    // Optimistic: move card to target column at end
    const targetColumn = columns.find((c) => c.id === overColumnId)
    if (!targetColumn) return

    const lastOrder = targetColumn.cards[targetColumn.cards.length - 1]?.order ?? 0
    const newOrder = generateOrder(lastOrder)

    moveCard(active.id as string, activeColumnId, overColumnId, newOrder)
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    setActiveCardId(null)
    if (!over) return

    const activeCol = findCardColumn(active.id as string)
    if (!activeCol) return

    const overColId = over.id as string
    const overCol = columns.find((c) => c.id === overColId)
    if (!overCol) return

    const cardIndex = overCol.cards.findIndex((c) => c.id === active.id)
    const prevCard = overCol.cards[cardIndex - 1]
    const nextCard = overCol.cards[cardIndex + 1]
    const newOrder = generateOrder(prevCard?.order, nextCard?.order)

    try {
      await moveCardMutation.mutateAsync({
        cardId: active.id as string,
        columnId: overColId,
        order: newOrder,
      })
    } catch {
      // Rollback on error — refetch from server
      setColumns(board.columns)
    }
  }

  const activeCard = activeCardId
    ? columns.flatMap((c) => c.cards).find((c) => c.id === activeCardId)
    : null

  const displayColumns = columns.length > 0 ? columns : board.columns

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      {children(displayColumns)}
      <DragOverlay>
        {activeCard ? (
          <div className="bg-card border rounded-md p-3 shadow-lg text-sm font-medium">
            {activeCard.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
