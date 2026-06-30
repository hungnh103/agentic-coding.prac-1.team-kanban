import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { requireBoardMember, ForbiddenError } from "@/lib/auth-guard"
import { createActivityEntry } from "@/lib/activity"
import { ActivityAction } from "@prisma/client"

type Params = { params: { boardId: string; cardId: string; commentId: string } }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 })
  }

  const userId = session.user.id
  const { boardId, cardId, commentId } = params

  try {
    await requireBoardMember(boardId, userId)
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 })
    }
    throw err
  }

  const comment = await db.comment.findUnique({
    where: { id: commentId, cardId },
    include: { card: { select: { title: true } } },
  })

  if (!comment) {
    return NextResponse.json({ error: "Comment không tồn tại" }, { status: 404 })
  }

  // Only the author can delete their own comment
  if (comment.authorId !== userId) {
    return NextResponse.json(
      { error: "Bạn chỉ có thể xóa comment của mình" },
      { status: 403 }
    )
  }

  await db.$transaction(async (tx) => {
    await tx.comment.delete({ where: { id: commentId } })
    await createActivityEntry({
      boardId,
      actorId: userId,
      action: ActivityAction.COMMENT_DELETED,
      entityType: "comment",
      entityId: commentId,
      metadata: { cardTitle: comment.card.title },
      tx,
    })
  })

  return NextResponse.json({ success: true })
}
