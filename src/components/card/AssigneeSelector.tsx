"use client"

import { useUpdateCard } from "@/hooks/useCards"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CardWithDetails, BoardWithDetails } from "@/types"

interface AssigneeSelectorProps {
  card: CardWithDetails
  members: BoardWithDetails["members"]
  boardId: string
}

export function AssigneeSelector({ card, members, boardId }: AssigneeSelectorProps) {
  const updateCard = useUpdateCard(boardId, card.id)

  async function handleChange(value: string) {
    const assigneeId = value === "none" ? null : value
    await updateCard.mutateAsync({ assigneeId })
  }

  return (
    <Select
      value={card.assigneeId ?? "none"}
      onValueChange={handleChange}
      disabled={updateCard.isPending}
    >
      <SelectTrigger className="w-full" aria-label="Người thực hiện">
        <SelectValue placeholder="Chưa có người thực hiện">
          {card.assignee ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={card.assignee.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {card.assignee.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{card.assignee.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Chưa có người thực hiện</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <span className="text-muted-foreground">Bỏ assign</span>
        </SelectItem>
        {members.map((member) => (
          <SelectItem key={member.userId} value={member.userId}>
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={member.user.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {member.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{member.user.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
