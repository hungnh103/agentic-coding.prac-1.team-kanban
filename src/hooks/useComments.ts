import { useMutation, useQueryClient } from "@tanstack/react-query"

const boardKey = (boardId: string) => ["boards", boardId] as const
const cardKey = (cardId: string) => ["cards", cardId] as const

export function useCreateComment(boardId: string, cardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { content: string }) => {
      const res = await fetch(
        `/api/boards/${boardId}/cards/${cardId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Gửi comment thất bại")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardKey(cardId) })
      queryClient.invalidateQueries({ queryKey: boardKey(boardId) })
    },
  })
}

export function useDeleteComment(boardId: string, cardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(
        `/api/boards/${boardId}/cards/${cardId}/comments/${commentId}`,
        { method: "DELETE" }
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Xóa comment thất bại")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardKey(cardId) })
    },
  })
}
