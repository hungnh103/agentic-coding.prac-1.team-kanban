import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { requireBoardMember, ForbiddenError } from "@/lib/auth-guard"
import { createActivityEntry } from "@/lib/activity"
import { ActivityAction } from "@prisma/client"

type Params = { params: { boardId: string; cardId: string } }

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

  const card = await db.card.findUnique({
    where: { id: cardId, boardId },
    include: { column: { select: { id: true, name: true } } },
  })

  if (!card) {
    return NextResponse.json({ error: "Thẻ không tồn tại" }, { status: 404 })
  }

  const body = await req.json()
  const { columnId, order } = body

  if (!columnId || order === undefined) {
    return NextResponse.json(
      { error: "columnId và order là bắt buộc" },
      { status: 400 }
    )
  }

  // Verify target column exists and belongs to board
  const targetColumn = await db.column.findUnique({
    where: { id: columnId, boardId },
  })

  if (!targetColumn) {
    return NextResponse.json({ error: "Cột đích không tồn tại" }, { status: 404 })
  }

  const updated = await db.$transaction(async (tx) => {
    const updatedCard = await tx.card.update({
      where: { id: cardId },
      data: { columnId, order },
    })

    if (columnId !== card.columnId) {
      await createActivityEntry({
        boardId,
        actorId: userId,
        action: ActivityAction.CARD_MOVED,
        entityType: "card",
        entityId: cardId,
        metadata: {
          fromColumnId: card.columnId,
          fromColumnName: card.column.name,
          toColumnId: columnId,
          toColumnName: targetColumn.name,
          cardTitle: card.title,
        },
        tx,
      })
    }

    return updatedCard
  })

  return NextResponse.json(updated)
}
