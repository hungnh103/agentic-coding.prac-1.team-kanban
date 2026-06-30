import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { requireBoardMember, requireBoardOwner, ForbiddenError } from "@/lib/auth-guard"

type Params = { params: { boardId: string } }

export async function GET(_req: NextRequest, { params }: Params) {
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

  const board = await db.board.findUnique({
    where: { id: boardId },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      columns: {
        orderBy: { order: "asc" },
        include: {
          cards: {
            orderBy: { order: "asc" },
            include: {
              assignee: { select: { id: true, name: true, avatarUrl: true } },
              _count: { select: { comments: true } },
            },
          },
        },
      },
    },
  })

  if (!board) {
    return NextResponse.json({ error: "Board không tồn tại" }, { status: 404 })
  }

  return NextResponse.json(board)
}

export async function PATCH(req: NextRequest, { params }: Params) {
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
  const { name, description } = body

  if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
    return NextResponse.json({ error: "Tên board không hợp lệ" }, { status: 400 })
  }

  const board = await db.board.update({
    where: { id: boardId },
    data: {
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
    },
  })

  return NextResponse.json(board)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 })
  }

  const { boardId } = params

  try {
    await requireBoardOwner(boardId, session.user.id)
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 })
    }
    throw err
  }

  await db.board.delete({ where: { id: boardId } })

  return NextResponse.json({ success: true })
}
