import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/db", () => ({
  db: {
    card: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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
import { POST } from "@/app/api/boards/[boardId]/cards/route"
import { GET, PATCH, DELETE } from "@/app/api/boards/[boardId]/cards/[cardId]/route"

const mockUser = { id: "user-1", name: "Test", email: "test@test.com" }
const mockMember = { boardId: "board-1", userId: "user-1", role: "OWNER" }

function mockSession() {
  vi.mocked(auth).mockResolvedValue({ user: mockUser, expires: "2099-01-01" } as any)
}

function mockBoardMember() {
  vi.mocked(db.boardMember.findUnique).mockResolvedValue(mockMember as any)
}

const mockCard = {
  id: "card-1",
  columnId: "col-1",
  boardId: "board-1",
  title: "Test Card",
  description: null,
  assigneeId: null,
  order: 1000,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe("POST /api/boards/[boardId]/cards", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession()
    mockBoardMember()
    vi.mocked(db.column.findUnique).mockResolvedValue({ id: "col-1", boardId: "board-1" } as any)
    vi.mocked(db.card.findFirst).mockResolvedValue(null)
  })

  it("tạo card mới thành công", async () => {
    vi.mocked(db.card.create).mockResolvedValue(mockCard as any)
    vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

    const req = new Request("http://localhost/api/boards/board-1/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test Card", columnId: "col-1" }),
    })

    const response = await POST(req as any, { params: { boardId: "board-1" } })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.title).toBe("Test Card")
  })

  it("từ chối title trống", async () => {
    const req = new Request("http://localhost/api/boards/board-1/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "", columnId: "col-1" }),
    })

    const response = await POST(req as any, { params: { boardId: "board-1" } })
    expect(response.status).toBe(400)
  })
})

describe("GET /api/boards/[boardId]/cards/[cardId]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession()
    mockBoardMember()
  })

  it("lấy chi tiết card thành công", async () => {
    const cardWithDetails = {
      ...mockCard,
      column: { id: "col-1", name: "To Do" },
      assignee: null,
      comments: [],
      _count: { comments: 0 },
    }
    vi.mocked(db.card.findUnique).mockResolvedValue(cardWithDetails as any)

    const req = new Request("http://localhost/api/boards/board-1/cards/card-1")
    const response = await GET(req as any, {
      params: { boardId: "board-1", cardId: "card-1" },
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.title).toBe("Test Card")
  })
})

describe("PATCH /api/boards/[boardId]/cards/[cardId]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession()
    mockBoardMember()
  })

  it("cập nhật title thành công", async () => {
    vi.mocked(db.card.findUnique).mockResolvedValue(mockCard as any)
    vi.mocked(db.$transaction).mockImplementation(async (cb) => cb(db as any))
    vi.mocked(db.card.update).mockResolvedValue({ ...mockCard, title: "Updated" } as any)
    vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

    const req = new Request("http://localhost/api/boards/board-1/cards/card-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    })

    const response = await PATCH(req as any, {
      params: { boardId: "board-1", cardId: "card-1" },
    })
    expect(response.status).toBe(200)
  })
})

describe("DELETE /api/boards/[boardId]/cards/[cardId]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession()
    mockBoardMember()
  })

  it("xóa card thành công", async () => {
    vi.mocked(db.card.findUnique).mockResolvedValue(mockCard as any)
    vi.mocked(db.$transaction).mockImplementation(async (cb) => cb(db as any))
    vi.mocked(db.card.delete).mockResolvedValue(mockCard as any)
    vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

    const req = new Request("http://localhost/api/boards/board-1/cards/card-1", {
      method: "DELETE",
    })

    const response = await DELETE(req as any, {
      params: { boardId: "board-1", cardId: "card-1" },
    })
    expect(response.status).toBe(200)
  })
})
