import { useInfiniteQuery } from "@tanstack/react-query"
import type { PaginatedResponse, ActivityLogWithActor } from "@/types"

export function useActivityLog(boardId: string) {
  return useInfiniteQuery({
    queryKey: ["boards", boardId, "activity"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(
        `/api/boards/${boardId}/activity?page=${pageParam}&pageSize=20`
      )
      if (!res.ok) throw new Error("Lỗi tải lịch sử hoạt động")
      return res.json() as Promise<PaginatedResponse<ActivityLogWithActor>>
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined
      return lastPage.page + 1
    },
    enabled: !!boardId,
  })
}
