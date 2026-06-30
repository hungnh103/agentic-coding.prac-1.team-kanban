import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { requireBoardMember, ForbiddenError } from "@/lib/auth-guard"
import { createActivityEntry } from "@/lib/activity"
import { generateOrder } from "@/lib/utils"
import { ActivityAction } from "@prisma/client"

type Params = { params: { boardId: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 })
  }

  const { boardId } = params

  try {
    await requireBoardMember(boardId, session.user.id)
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 })
    }
    throw err
  }

  const body = await req.json()
  const { title, columnId } = body

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Tiêu đề thẻ là bắt buộc" }, { status: 400 })
  }

  if (title.trim().length > 200) {
    return NextResponse.json(
      { error: "Tiêu đề không được vượt quá 200 ký tự" },
      { status: 400 }
    )
  }

  if (!columnId) {
    return NextResponse.json({ error: "columnId là bắt buộc" }, { status: 400 })
  }

  // Verify column belongs to board
  const column = await db.column.findUnique({ where: { id: columnId, boardId } })
  if (!column) {
    return NextResponse.json({ error: "Cột không tồn tại" }, { status: 404 })
  }

  // Get last card's order in the column
  const lastCard = await db.card.findFirst({
    where: { columnId },
    orderBy: { order: "desc" },
    select: { order: true },
  })

  const order = generateOrder(lastCard?.order)

  const card = await db.card.create({
    data: {
      title: title.trim(),
      columnId,
      boardId,
      order,
    },
  })

  await createActivityEntry({
    boardId,
    actorId: session.user.id,
    action: ActivityAction.CARD_CREATED,
    entityType: "card",
    entityId: card.id,
    metadata: { cardTitle: card.title, columnName: column.name },
  })

  return NextResponse.json(card, { status: 201 })
}
