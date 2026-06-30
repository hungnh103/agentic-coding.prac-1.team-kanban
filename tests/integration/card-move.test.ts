import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/db", () => ({
  db: {
    card: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    column: {
      findUnique: vi.fn(),
    },
    boardMember: {
      findUnique: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { PATCH } from "@/app/api/boards/[boardId]/cards/[cardId]/move/route"

const mockUser = { id: "user-1", name: "Test", email: "test@test.com" }
const mockMember = { boardId: "board-1", userId: "user-1", role: "OWNER" }

function mockSession() {
  vi.mocked(auth).mockResolvedValue({ user: mockUser, expires: "2099-01-01" } as any)
}

describe("PATCH /api/boards/[boardId]/cards/[cardId]/move", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession()
    vi.mocked(db.boardMember.findUnique).mockResolvedValue(mockMember as any)
  })

  it("di chuyển card sang column khác thành công", async () => {
    const mockCard = {
      id: "card-1",
      columnId: "col-1",
      boardId: "board-1",
      title: "Test",
      order: 1000,
      column: { id: "col-1", name: "To Do" },
    }
    const targetColumn = { id: "col-2", boardId: "board-1", name: "In Progress" }

    vi.mocked(db.card.findUnique).mockResolvedValue(mockCard as any)
    vi.mocked(db.column.findUnique).mockResolvedValue(targetColumn as any)
    vi.mocked(db.$transaction).mockImplementation(async (cb) => cb(db as any))
    vi.mocked(db.card.update).mockResolvedValue({
      ...mockCard,
      columnId: "col-2",
      order: 1500,
    } as any)
    vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

    const req = new Request(
      "http://localhost/api/boards/board-1/cards/card-1/move",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId: "col-2", order: 1500 }),
      }
    )

    const response = await PATCH(req as any, {
      params: { boardId: "board-1", cardId: "card-1" },
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.columnId).toBe("col-2")
    expect(data.order).toBe(1500)
  })

  it("từ chối khi thiếu columnId hoặc order", async () => {
    const mockCard = {
      id: "card-1",
      columnId: "col-1",
      boardId: "board-1",
      title: "Test",
      column: { id: "col-1", name: "To Do" },
    }
    vi.mocked(db.card.findUnique).mockResolvedValue(mockCard as any)

    const req = new Request(
      "http://localhost/api/boards/board-1/cards/card-1/move",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId: "col-2" }), // missing order
      }
    )

    const response = await PATCH(req as any, {
      params: { boardId: "board-1", cardId: "card-1" },
    })

    expect(response.status).toBe(400)
  })
})
