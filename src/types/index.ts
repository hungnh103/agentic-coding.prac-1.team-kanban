import type { Board, BoardMember, Column, Card, Comment, ActivityLog, User, BoardRole, ActivityAction } from "@prisma/client"

// Re-export enums for convenience
export { BoardRole, ActivityAction }

export type BoardWithDetails = Board & {
  owner: Pick<User, "id" | "name" | "avatarUrl">
  members: (BoardMember & {
    user: Pick<User, "id" | "name" | "avatarUrl">
  })[]
  columns: (Column & {
    cards: (Card & {
      assignee: Pick<User, "id" | "name" | "avatarUrl"> | null
      _count: { comments: number }
    })[]
  })[]
}

export type CardWithDetails = Card & {
  column: Pick<Column, "id" | "name">
  assignee: Pick<User, "id" | "name" | "avatarUrl"> | null
  comments: CommentWithAuthor[]
  _count: { comments: number }
}

export type CommentWithAuthor = Comment & {
  author: Pick<User, "id" | "name" | "avatarUrl">
}

export type ActivityLogWithActor = ActivityLog & {
  actor: Pick<User, "id" | "name" | "avatarUrl">
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export type BoardSummary = Pick<Board, "id" | "name" | "description" | "createdAt"> & {
  owner: Pick<User, "id" | "name" | "avatarUrl">
  _count: { members: number; columns: number }
  myRole: BoardRole
}
