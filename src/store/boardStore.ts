import { create } from "zustand"
import type { BoardWithDetails } from "@/types"

type ColumnData = BoardWithDetails["columns"][number]

interface BoardState {
  columns: ColumnData[]
  setColumns: (columns: ColumnData[]) => void
  moveCard: (cardId: string, fromColumnId: string, toColumnId: string, newOrder: number) => void
  reorderCard: (columnId: string, cardId: string, newOrder: number) => void
  reorderColumn: (columnId: string, newOrder: number) => void
}

export const useBoardStore = create<BoardState>((set) => ({
  columns: [],

  setColumns: (columns) => set({ columns }),

  moveCard: (cardId, fromColumnId, toColumnId, newOrder) =>
    set((state) => {
      const newColumns = state.columns.map((col) => {
        if (col.id === fromColumnId) {
          return {
            ...col,
            cards: col.cards.filter((c) => c.id !== cardId),
          }
        }
        if (col.id === toColumnId) {
          const card = state.columns
            .find((c) => c.id === fromColumnId)
            ?.cards.find((c) => c.id === cardId)

          if (!card) return col

          const updatedCard = { ...card, columnId: toColumnId, order: newOrder }
          const newCards = [...col.cards, updatedCard].sort((a, b) => a.order - b.order)
          return { ...col, cards: newCards }
        }
        return col
      })
      return { columns: newColumns }
    }),

  reorderCard: (columnId, cardId, newOrder) =>
    set((state) => {
      const newColumns = state.columns.map((col) => {
        if (col.id !== columnId) return col
        const newCards = col.cards
          .map((c) => (c.id === cardId ? { ...c, order: newOrder } : c))
          .sort((a, b) => a.order - b.order)
        return { ...col, cards: newCards }
      })
      return { columns: newColumns }
    }),

  reorderColumn: (columnId, newOrder) =>
    set((state) => {
      const newColumns = state.columns
        .map((col) => (col.id === columnId ? { ...col, order: newOrder } : col))
        .sort((a, b) => a.order - b.order)
      return { columns: newColumns }
    }),
}))
