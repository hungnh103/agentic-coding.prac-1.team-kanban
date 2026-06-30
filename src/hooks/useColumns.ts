import { useMutation, useQueryClient } from "@tanstack/react-query"

const boardKey = (boardId: string) => ["boards", boardId] as const

export function useCreateColumn(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await fetch(`/api/boards/${boardId}/columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Tạo cột thất bại")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKey(boardId) })
    },
  })
}

export function useUpdateColumn(boardId: string, columnId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name?: string; order?: number }) => {
      const res = await fetch(
        `/api/boards/${boardId}/columns/${columnId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Cập nhật cột thất bại")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKey(boardId) })
    },
  })
}

export function useDeleteColumn(boardId: string, columnId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (confirm: boolean) => {
      const url = `/api/boards/${boardId}/columns/${columnId}${confirm ? "?confirm=true" : ""}`
      const res = await fetch(url, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        // Re-throw with cardCount info for conflict handling
        const error = new Error(err.error ?? "Xóa cột thất bại") as Error & { cardCount?: number; status?: number }
        error.cardCount = err.cardCount
        error.status = res.status
        throw error
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKey(boardId) })
    },
  })
}
