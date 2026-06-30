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
  const { name } = body

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Tên cột là bắt buộc" }, { status: 400 })
  }

  if (name.trim().length > 100) {
    return NextResponse.json(
      { error: "Tên cột không được vượt quá 100 ký tự" },
      { status: 400 }
    )
  }

  // Get the last column's order to append at the end
  const lastColumn = await db.column.findFirst({
    where: { boardId },
    orderBy: { order: "desc" },
    select: { order: true },
  })

  const order = generateOrder(lastColumn?.order)

  const column = await db.column.create({
    data: {
      boardId,
      name: name.trim(),
      order,
    },
  })

  await createActivityEntry({
    boardId,
    actorId: session.user.id,
    action: ActivityAction.COLUMN_CREATED,
    entityType: "column",
    entityId: column.id,
    metadata: { columnName: column.name },
  })

  return NextResponse.json(column, { status: 201 })
}
