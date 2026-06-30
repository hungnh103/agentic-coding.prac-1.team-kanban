import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createActivityEntry } from "@/lib/activity"
import { ActivityAction, BoardRole } from "@prisma/client"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 })
  }

  const userId = session.user.id

  const boards = await db.board.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      members: {
        where: { userId },
        select: { role: true },
      },
      _count: {
        select: { members: true, columns: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const result = boards.map((board) => ({
    ...board,
    myRole: board.members[0]?.role ?? BoardRole.MEMBER,
    members: undefined,
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 })
  }

  const userId = session.user.id

  const body = await req.json()
  const { name, description } = body

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Tên board là bắt buộc" },
      { status: 400 }
    )
  }

  if (name.trim().length > 100) {
    return NextResponse.json(
      { error: "Tên board không được vượt quá 100 ký tự" },
      { status: 400 }
    )
  }

  const board = await db.board.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: BoardRole.OWNER,
        },
      },
    },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      _count: {
        select: { members: true, columns: true },
      },
    },
  })

  await createActivityEntry({
    boardId: board.id,
    actorId: userId,
    action: ActivityAction.BOARD_CREATED,
    entityType: "board",
    entityId: board.id,
  })

  return NextResponse.json({ ...board, myRole: BoardRole.OWNER }, { status: 201 })
}
