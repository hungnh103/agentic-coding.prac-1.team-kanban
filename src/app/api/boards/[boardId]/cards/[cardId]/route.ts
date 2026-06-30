import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { requireBoardMember, ForbiddenError } from "@/lib/auth-guard"
import { createActivityEntry } from "@/lib/activity"
import { ActivityAction } from "@prisma/client"

type Params = { params: { boardId: string; cardId: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 })
  }

  const { boardId, cardId } = params

  try {
    await requireBoardMember(boardId, session.user.id)
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 })
    }
    throw err
  }

  const card = await db.card.findUnique({
    where: { id: cardId, boardId },
    include: {
      column: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { comments: true } },
    },
  })

  if (!card) {
    return NextResponse.json({ error: "Thẻ không tồn tại" }, { status: 404 })
  }

  return NextResponse.json(card)
}

export async function PATCH(req: NextRequest, { params }: Params) {
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
  const { title, description, assigneeId } = body

  if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
    return NextResponse.json({ error: "Tiêu đề không hợp lệ" }, { status: 400 })
  }

  // Validate assigneeId must be a board member
  if (assigneeId !== undefined && assigneeId !== null) {
    const assigneeMember = await db.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: assigneeId } },
    })
    if (!assigneeMember) {
      return NextResponse.json(
        { error: "Người được assign phải là thành viên của board" },
        { status: 400 }
      )
    }
  }

  const updated = await db.$transaction(async (tx) => {
    const updatedCard = await tx.card.update({
      where: { id: cardId },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(assigneeId !== undefined && { assigneeId }),
      },
    })

    let action: ActivityAction = ActivityAction.CARD_UPDATED
    let metadata: Record<string, unknown> = {}

    if (assigneeId !== undefined) {
      if (assigneeId === null) {
        action = ActivityAction.CARD_UNASSIGNED
        metadata = { cardTitle: card.title }
      } else if (assigneeId !== card.assigneeId) {
        action = ActivityAction.CARD_ASSIGNED
        metadata = { cardTitle: card.title, assigneeId }
      }
    }

    await createActivityEntry({
      boardId,
      actorId: userId,
      action,
      entityType: "card",
      entityId: cardId,
      metadata,
      tx,
    })

    return updatedCard
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
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

  await db.$transaction(async (tx) => {
    await tx.card.delete({ where: { id: cardId } })
    await createActivityEntry({
      boardId,
      actorId: userId,
      action: ActivityAction.CARD_DELETED,
      entityType: "card",
      entityId: cardId,
      metadata: { cardTitle: card.title },
      tx,
    })
  })

  return NextResponse.json({ success: true })
}
