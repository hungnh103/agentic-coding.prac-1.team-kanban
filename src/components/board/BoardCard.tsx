import Link from "next/link"
import { Users } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { BoardSummary } from "@/types"

interface BoardCardProps {
  board: BoardSummary
}

export function BoardCard({ board }: BoardCardProps) {
  return (
    <Link href={`/boards/${board.id}`} className="block group">
      <Card className="h-full transition-shadow hover:shadow-md group-hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base line-clamp-2">{board.name}</CardTitle>
            {board.myRole === "OWNER" && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                Owner
              </Badge>
            )}
          </div>
          {board.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {board.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-xs text-muted-foreground">
            {board._count.columns} cột
          </p>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Avatar className="h-5 w-5">
              <AvatarImage src={board.owner.avatarUrl ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {board.owner.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[100px]">{board.owner.name}</span>
            <span className="ml-auto flex items-center gap-1">
              <Users className="h-3 w-3" />
              {board._count.members}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
