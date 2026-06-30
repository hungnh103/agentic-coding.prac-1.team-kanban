import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatRelativeTime } from "@/lib/utils"
import type { ActivityLogWithActor } from "@/types"
import { ActivityAction } from "@prisma/client"

interface ActivityEntryProps {
  entry: ActivityLogWithActor
}

function describeAction(action: ActivityAction, metadata: Record<string, unknown> = {}): string {
  switch (action) {
    case ActivityAction.BOARD_CREATED:
      return "đã tạo board này"
    case ActivityAction.COLUMN_CREATED:
      return `đã thêm cột "${metadata.columnName ?? ""}"`
    case ActivityAction.COLUMN_RENAMED:
      return `đã đổi tên cột từ "${metadata.oldName}" thành "${metadata.newName}"`
    case ActivityAction.COLUMN_DELETED:
      return `đã xóa cột "${metadata.columnName ?? ""}"`
    case ActivityAction.COLUMN_REORDERED:
      return "đã sắp xếp lại cột"
    case ActivityAction.CARD_CREATED:
      return `đã tạo thẻ "${metadata.cardTitle ?? ""}"`
    case ActivityAction.CARD_UPDATED:
      return `đã cập nhật thẻ`
    case ActivityAction.CARD_MOVED:
      return `đã di chuyển thẻ "${metadata.cardTitle ?? ""}" từ "${metadata.fromColumnName}" sang "${metadata.toColumnName}"`
    case ActivityAction.CARD_DELETED:
      return `đã xóa thẻ "${metadata.cardTitle ?? ""}"`
    case ActivityAction.CARD_ASSIGNED:
      return `đã assign thẻ "${metadata.cardTitle ?? ""}"`
    case ActivityAction.CARD_UNASSIGNED:
      return `đã bỏ assign thẻ "${metadata.cardTitle ?? ""}"`
    case ActivityAction.COMMENT_ADDED:
      return `đã comment vào thẻ "${metadata.cardTitle ?? ""}"`
    case ActivityAction.COMMENT_DELETED:
      return `đã xóa comment trong thẻ "${metadata.cardTitle ?? ""}"`
    case ActivityAction.MEMBER_ADDED:
      return `đã mời "${metadata.memberName ?? ""}" vào board`
    default:
      return "đã thực hiện một hành động"
  }
}

export function ActivityEntry({ entry }: ActivityEntryProps) {
  const metadata = (entry.metadata ?? {}) as Record<string, unknown>

  return (
    <div
      className="flex gap-3 py-2"
      data-testid="activity-entry"
    >
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        <AvatarImage src={entry.actor.avatarUrl ?? undefined} />
        <AvatarFallback className="text-[10px]">
          {entry.actor.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{entry.actor.name}</span>{" "}
          <span className="text-muted-foreground">{describeAction(entry.action, metadata)}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatRelativeTime(entry.createdAt)}
        </p>
      </div>
    </div>
  )
}
