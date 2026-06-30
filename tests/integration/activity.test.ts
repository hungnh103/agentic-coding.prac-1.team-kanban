import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/db", () => ({
  db: {
    activityLog: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    boardMember: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { GET } from "@/app/api/boards/[boardId]/activity/route"

const mockUser = { id: "user-1", name: "Test", email: "test@test.com" }
const mockMember = { boardId: "board-1", userId: "user-1", role: "OWNER" }

function mockSession() {
  vi.mocked(auth).mockResolvedValue({ user: mockUser, expires: "2099-01-01" } as any)
}

describe("GET /api/boards/[boardId]/activity", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession()
    vi.mocked(db.boardMember.findUnique).mockResolvedValue(mockMember as any)
  })

  it("trả về paginated activity log", async () => {
    const mockActivities = [
      {
        id: "act-1",
        boardId: "board-1",
        actorId: "user-1",
        action: "CARD_CREATED",
        entityType: "card",
        entityId: "card-1",
        metadata: {},
        createdAt: new Date(),
        actor: mockUser,
      },
    ]

    vi.mocked(db.activityLog.findMany).mockResolvedValue(mockActivities as any)
    vi.mocked(db.activityLog.count).mockResolvedValue(1)

    const req = new Request("http://localhost/api/boards/board-1/activity")
    const response = await GET(req as any, { params: { boardId: "board-1" } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.items).toHaveLength(1)
    expect(data.total).toBe(1)
    expect(data.page).toBe(1)
    expect(data.pageSize).toBe(20)
    expect(data.hasMore).toBe(false)
  })

  it("hỗ trợ pagination đúng", async () => {
    vi.mocked(db.activityLog.findMany).mockResolvedValue([])
    vi.mocked(db.activityLog.count).mockResolvedValue(25)

    const req = new Request("http://localhost/api/boards/board-1/activity?page=2&pageSize=20")
    const response = await GET(req as any, { params: { boardId: "board-1" } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.page).toBe(2)
    expect(data.hasMore).toBe(true) // page 2, skip=20, total=25: 20+0 < 25 = true
  })

  it("trả về empty state khi không có activities", async () => {
    vi.mocked(db.activityLog.findMany).mockResolvedValue([])
    vi.mocked(db.activityLog.count).mockResolvedValue(0)

    const req = new Request("http://localhost/api/boards/board-1/activity")
    const response = await GET(req as any, { params: { boardId: "board-1" } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.items).toHaveLength(0)
    expect(data.total).toBe(0)
    expect(data.hasMore).toBe(false)
  })
})
