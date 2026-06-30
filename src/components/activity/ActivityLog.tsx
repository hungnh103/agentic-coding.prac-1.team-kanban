"use client"

import { Button } from "@/components/ui/button"
import { ActivityEntry } from "./ActivityEntry"
import { useActivityLog } from "@/hooks/useActivity"
import { History } from "lucide-react"

interface ActivityLogProps {
  boardId: string
}

export function ActivityLog({ boardId }: ActivityLogProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useActivityLog(boardId)

  const allEntries = data?.pages.flatMap((page) => page.items) ?? []

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex gap-3">
            <div className="h-7 w-7 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-2.5 bg-muted rounded animate-pulse w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (allEntries.length === 0) {
    return (
      <div className="text-center py-8">
        <History className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Chưa có hoạt động nào</p>
      </div>
    )
  }

  return (
    <div>
      <div className="divide-y">
        {allEntries.map((entry) => (
          <ActivityEntry key={entry.id} entry={entry} />
        ))}
      </div>
      {hasNextPage && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
        </Button>
      )}
    </div>
  )
}
