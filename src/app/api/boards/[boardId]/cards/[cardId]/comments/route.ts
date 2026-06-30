import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { requireBoardMember, ForbiddenError } from "@/lib/auth-guard"
import { createActivityEntry } from "@/lib/activity"
import { ActivityAction } from "@prisma/client"

type Params = { params: { boardId: string; cardId: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 })
  }

  const userId = session.user.id
  const { boardId, cardId } = params

  try {
    await requireBoardMember(boardId, userId)
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 })
    }
    throw err
  }

  const card = await db.card.findUnique({ where: { id: cardId, boardId } })
  if (!card) {
    return NextResponse.json({ error: "Thẻ không tồn tại" }, { status: 404 })
  }

  const body = await req.json()
  const { content } = body

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Nội dung comment là bắt buộc" }, { status: 400 })
  }

  if (content.trim().length > 2000) {
    return NextResponse.json(
      { error: "Nội dung comment không được vượt quá 2000 ký tự" },
      { status: 400 }
    )
  }

  const comment = await db.$transaction(async (tx) => {
    const newComment = await tx.comment.create({
      data: {
        cardId,
        authorId: userId,
        content: content.trim(),
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    await createActivityEntry({
      boardId,
      actorId: userId,
      action: ActivityAction.COMMENT_ADDED,
      entityType: "comment",
      entityId: newComment.id,
      metadata: { cardTitle: card.title },
      tx,
    })

    return newComment
  })

  return NextResponse.json(comment, { status: 201 })
}
