"use client"

import { signOut } from "next-auth/react"
import { LayoutDashboard, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BoardCard } from "@/components/board/BoardCard"
import { CreateBoardDialog } from "@/components/board/CreateBoardDialog"
import { useBoards } from "@/hooks/useBoards"

interface DashboardClientProps {
  user: {
    id?: string | null
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function DashboardClient({ user }: DashboardClientProps) {
  const { data: boards, isLoading, error } = useBoards()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <span className="font-semibold">Team Kanban</span>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {user.name?.slice(0, 2).toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Boards của tôi</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Quản lý và theo dõi công việc nhóm
            </p>
          </div>
          <CreateBoardDialog />
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-36 rounded-lg border bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-destructive text-sm">
            Lỗi tải danh sách boards: {error.message}
          </p>
        )}

        {boards && boards.length === 0 && (
          <div className="text-center py-16">
            <LayoutDashboard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2">Chưa có board nào</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Tạo board đầu tiên để bắt đầu quản lý công việc nhóm
            </p>
            <CreateBoardDialog />
          </div>
        )}

        {boards && boards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
