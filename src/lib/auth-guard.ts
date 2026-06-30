import { db } from "@/lib/db"
import { BoardRole } from "@prisma/client"

export class ForbiddenError extends Error {
  status = 403
  constructor(message = "Không có quyền truy cập") {
    super(message)
    this.name = "ForbiddenError"
  }
}

export class NotFoundError extends Error {
  status = 404
  constructor(message = "Không tìm thấy") {
    super(message)
    this.name = "NotFoundError"
  }
}

/**
 * Kiểm tra user có phải là thành viên của board không.
 * Throw ForbiddenError nếu không phải thành viên.
 */
export async function requireBoardMember(boardId: string, userId: string) {
  const member = await db.boardMember.findUnique({
    where: {
      boardId_userId: { boardId, userId },
    },
  })

  if (!member) {
    throw new ForbiddenError("Bạn không phải thành viên của board này")
  }

  return member
}

/**
 * Kiểm tra user có phải là OWNER của board không.
 * Throw ForbiddenError nếu không phải OWNER.
 */
export async function requireBoardOwner(boardId: string, userId: string) {
  const member = await requireBoardMember(boardId, userId)

  if (member.role !== BoardRole.OWNER) {
    throw new ForbiddenError("Chỉ owner mới có quyền thực hiện hành động này")
  }

  return member
}
