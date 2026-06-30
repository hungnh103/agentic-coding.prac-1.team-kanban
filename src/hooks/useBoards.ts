import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { BoardSummary, BoardWithDetails } from "@/types"

const BOARDS_KEY = ["boards"] as const
const boardKey = (boardId: string) => ["boards", boardId] as const

async function fetchBoards(): Promise<BoardSummary[]> {
  const res = await fetch("/api/boards")
  if (!res.ok) throw new Error("Lỗi tải danh sách boards")
  return res.json()
}

async function fetchBoard(boardId: string): Promise<BoardWithDetails> {
  const res = await fetch(`/api/boards/${boardId}`)
  if (!res.ok) throw new Error("Lỗi tải board")
  return res.json()
}

export function useBoards() {
  return useQuery({
    queryKey: BOARDS_KEY,
    queryFn: fetchBoards,
  })
}

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: boardKey(boardId),
    queryFn: () => fetchBoard(boardId),
    enabled: !!boardId,
  })
}

export function useCreateBoard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Tạo board thất bại")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARDS_KEY })
    },
  })
}

export function useUpdateBoard(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name?: string; description?: string }) => {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Cập nhật board thất bại")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKey(boardId) })
      queryClient.invalidateQueries({ queryKey: BOARDS_KEY })
    },
  })
}

export function useDeleteBoard(boardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/boards/${boardId}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Xóa board thất bại")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARDS_KEY })
      queryClient.removeQueries({ queryKey: boardKey(boardId) })
    },
  })
}
