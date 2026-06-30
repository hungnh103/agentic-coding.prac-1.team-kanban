import { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import type { ActivityAction } from "@prisma/client"

export interface CreateActivityParams {
  boardId: string
  actorId: string
  action: ActivityAction
  entityType: "board" | "column" | "card" | "comment"
  entityId: string
  metadata?: Record<string, unknown>
  tx?: Prisma.TransactionClient
}

/**
 * Ghi một ActivityLog entry.
 * Nếu truyền `tx`, sẽ ghi trong transaction đó.
 * Nếu không, sẽ dùng db client trực tiếp.
 */
export async function createActivityEntry({
  boardId,
  actorId,
  action,
  entityType,
  entityId,
  metadata,
  tx,
}: CreateActivityParams) {
  const client = tx ?? db

  return client.activityLog.create({
    data: {
      boardId,
      actorId,
      action,
      entityType,
      entityId,
      metadata: metadata as Prisma.InputJsonValue ?? Prisma.DbNull,
    },
  })
}
