import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CardWithDetails } from "@/types"

const boardKey = (boardId: string) => ["boards", boardId] as const
const cardKey = (cardId: string) => ["cards", cardId] as const

export function useCard(boardId: string, cardId: string) {
  return useInfiniteQuery({
    queryKey: cardKey(cardId),
    queryFn: async () => {
      const res = await fetch(`/api/boards/${boardId}/cards/${cardId}`)
      if (!res.ok) throw new Error("Lỗi tải thẻ")
      return res.json() as Promise<CardWithDetails>
    },
    initialPageParam: null,
    getNextPageParam: () => null,
    enabled: !!cardId,
  })
}

export function useCreateCard(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { title: string; columnId: string }) => {
      const res = await fetch(`/api/boards/${boardId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Tạo thẻ thất bại")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKey(boardId) })
    },
  })
}

export function useUpdateCard(boardId: string, cardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      title?: string
      description?: string
      assigneeId?: string | null
    }) => {
      const res = await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Cập nhật thẻ thất bại")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKey(boardId) })
      queryClient.invalidateQueries({ queryKey: cardKey(cardId) })
    },
  })
}

export function useDeleteCard(boardId: string, cardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Xóa thẻ thất bại")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKey(boardId) })
      queryClient.removeQueries({ queryKey: cardKey(cardId) })
    },
  })
}

export function useMoveCard(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      cardId,
      columnId,
      order,
    }: {
      cardId: string
      columnId: string
      order: number
    }) => {
      const res = await fetch(`/api/boards/${boardId}/cards/${cardId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId, order }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Di chuyển thẻ thất bại")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKey(boardId) })
    },
  })
}
