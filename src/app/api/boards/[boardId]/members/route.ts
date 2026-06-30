import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { requireBoardOwner, ForbiddenError } from "@/lib/auth-guard"
import { createActivityEntry } from "@/lib/activity"
import { ActivityAction, BoardRole } from "@prisma/client"

type Params = { params: { boardId: string } }

export async function POST(req: NextRequest, { params }: Params) {
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

  const body = await req.json()
  const { email } = body

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email là bắt buộc" }, { status: 400 })
  }

  // Check member limit (max 20)
  const memberCount = await db.boardMember.count({ where: { boardId } })
  if (memberCount >= 20) {
    return NextResponse.json(
      { error: "Board đã đạt tối đa 20 thành viên" },
      { status: 400 }
    )
  }

  // Find user by email
  const userToInvite = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, name: true, email: true, avatarUrl: true },
  })

  if (!userToInvite) {
    return NextResponse.json(
      { error: "Không tìm thấy người dùng với email này" },
      { status: 404 }
    )
  }

  // Check if already a member
  const existing = await db.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId: userToInvite.id } },
  })

  if (existing) {
    return NextResponse.json(
      { error: "Người dùng đã là thành viên của board này" },
      { status: 409 }
    )
  }

  const member = await db.boardMember.create({
    data: {
      boardId,
      userId: userToInvite.id,
      role: BoardRole.MEMBER,
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  })

  await createActivityEntry({
    boardId,
    actorId: session.user.id,
    action: ActivityAction.MEMBER_ADDED,
    entityType: "board",
    entityId: userToInvite.id,
    metadata: { memberName: userToInvite.name },
  })

  return NextResponse.json(member, { status: 201 })
}
