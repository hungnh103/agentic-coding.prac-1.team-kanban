"use client"

import { MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { BoardWithDetails } from "@/types"

type CardData = BoardWithDetails["columns"][number]["cards"][number]

interface CardPreviewProps {
  card: CardData
  onClick?: () => void
}

export function CardPreview({ card, onClick }: CardPreviewProps) {
  return (
    <div
      className="bg-card border rounded-md p-3 cursor-pointer hover:shadow-sm hover:border-primary/50 transition-all group"
      onClick={onClick}
      data-testid="card"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.()
      }}
    >
      <p className="text-sm font-medium line-clamp-2 mb-2">{card.title}</p>
      {(card.assignee || card._count.comments > 0) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {card._count.comments > 0 && (
              <Badge variant="outline" className="h-5 text-xs gap-1">
                <MessageSquare className="h-2.5 w-2.5" />
                {card._count.comments}
              </Badge>
            )}
          </div>
          {card.assignee && (
            <Avatar className="h-5 w-5 ml-auto">
              <AvatarImage src={card.assignee.avatarUrl ?? undefined} />
              <AvatarFallback className="text-[9px]">
                {card.assignee.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}
    </div>
  )
}
