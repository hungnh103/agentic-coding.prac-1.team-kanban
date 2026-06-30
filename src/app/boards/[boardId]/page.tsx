import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { BoardPageClient } from "./BoardPageClient"
import type { BoardWithDetails } from "@/types"

type Props = { params: { boardId: string } }

export default async function BoardPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { boardId } = params

  // Check membership server-side for security
  const member = await db.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId: session.user.id } },
  })

  if (!member) redirect("/")

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

  if (!board) redirect("/")

  return (
    <BoardPageClient
      initialBoard={board as unknown as BoardWithDetails}
      currentUser={{ id: session.user.id, role: member.role }}
    />
  )
}
