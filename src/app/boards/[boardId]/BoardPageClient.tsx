"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Users, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ColumnList } from "@/components/board/ColumnList"
import { ActivityLog } from "@/components/activity/ActivityLog"
import { useBoard } from "@/hooks/useBoards"
import type { BoardWithDetails, BoardRole } from "@/types"

interface BoardPageClientProps {
  initialBoard: BoardWithDetails
  currentUser: { id: string; role: BoardRole }
}

export function BoardPageClient({ initialBoard, currentUser }: BoardPageClientProps) {
  const { data: board } = useBoard(initialBoard.id)
  const displayBoard = board ?? initialBoard
  const [showActivity, setShowActivity] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card shrink-0">
        <div className="max-w-full px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label="Quay lại">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-semibold truncate">{displayBoard.name}</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{displayBoard.members.length}</span>
            </div>
            <div className="flex -space-x-1">
              {displayBoard.members.slice(0, 4).map((m) => (
                <Avatar key={m.userId} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={m.user.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-[10px]">
                    {m.user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActivity(!showActivity)}
              className="gap-1.5"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Lịch sử</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Board content */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-hidden p-4 board-shell m-4">
          <ColumnList board={displayBoard} currentUserId={currentUser.id} />
        </main>

        {/* Activity sidebar */}
        {showActivity && (
          <aside className="w-80 border-l bg-card overflow-y-auto p-4 shrink-0">
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <History className="h-4 w-4" />
              Lịch sử hoạt động
            </h2>
            <ActivityLog boardId={displayBoard.id} />
          </aside>
        )}
      </div>
    </div>
  )
}
