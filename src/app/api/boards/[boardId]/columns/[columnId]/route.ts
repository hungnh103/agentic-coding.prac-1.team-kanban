import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { requireBoardMember, ForbiddenError } from "@/lib/auth-guard"
import { createActivityEntry } from "@/lib/activity"
import { ActivityAction } from "@prisma/client"

type Params = { params: { boardId: string; columnId: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 })
  }

  const userId = session.user.id
  const { boardId, columnId } = params

  try {
    await requireBoardMember(boardId, userId)
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 })
    }
    throw err
  }

  const column = await db.column.findUnique({ where: { id: columnId, boardId } })
  if (!column) {
    return NextResponse.json({ error: "Cột không tồn tại" }, { status: 404 })
  }

  const body = await req.json()
  const { name, order } = body

  if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
    return NextResponse.json({ error: "Tên cột không hợp lệ" }, { status: 400 })
  }

  const oldName = column.name

  const updated = await db.$transaction(async (tx) => {
    const updatedColumn = await tx.column.update({
      where: { id: columnId },
      data: {
        ...(name && { name: name.trim() }),
        ...(order !== undefined && { order }),
      },
    })

    if (name && name.trim() !== oldName) {
      await createActivityEntry({
        boardId,
        actorId: userId,
        action: ActivityAction.COLUMN_RENAMED,
        entityType: "column",
        entityId: columnId,
        metadata: { oldName, newName: name.trim() },
        tx,
      })
    } else if (order !== undefined) {
      await createActivityEntry({
        boardId,
        actorId: userId,
        action: ActivityAction.COLUMN_REORDERED,
        entityType: "column",
        entityId: columnId,
        tx,
      })
    }

    return updatedColumn
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 })
  }

  const userId = session.user.id
  const { boardId, columnId } = params

  try {
    await requireBoardMember(boardId, userId)
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 })
    }
    throw err
  }

  const column = await db.column.findUnique({ where: { id: columnId, boardId } })
  if (!column) {
    return NextResponse.json({ error: "Cột không tồn tại" }, { status: 404 })
  }

  // Check if column has cards
  const cardCount = await db.card.count({ where: { columnId } })
  const { searchParams } = new URL(req.url)
  const confirmed = searchParams.get("confirm") === "true"

  if (cardCount > 0 && !confirmed) {
    return NextResponse.json(
      {
        error: "Cột này có cards. Thêm ?confirm=true để xác nhận xóa",
        cardCount,
      },
      { status: 409 }
    )
  }

  await db.$transaction(async (tx) => {
    await tx.column.delete({ where: { id: columnId } })
    await createActivityEntry({
      boardId,
      actorId: userId,
      action: ActivityAction.COLUMN_DELETED,
      entityType: "column",
      entityId: columnId,
      metadata: { columnName: column.name },
      tx,
    })
  })

  return NextResponse.json({ success: true })
}
