import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { requireBoardMember, ForbiddenError } from "@/lib/auth-guard"

type Params = { params: { boardId: string } }

export async function GET(req: NextRequest, { params }: Params) {
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

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)))
  const skip = (page - 1) * pageSize

  const [items, total] = await Promise.all([
    db.activityLog.findMany({
      where: { boardId },
      include: {
        actor: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.activityLog.count({ where: { boardId } }),
  ])

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    hasMore: skip + items.length < total,
  })
}
