import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/db", () => ({
  db: {
    column: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    card: {
      count: vi.fn(),
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
import { POST } from "@/app/api/boards/[boardId]/columns/route"
import { PATCH, DELETE } from "@/app/api/boards/[boardId]/columns/[columnId]/route"

const mockUser = { id: "user-1", name: "Test", email: "test@test.com" }
const mockMember = { boardId: "board-1", userId: "user-1", role: "OWNER" }

function mockSession() {
  vi.mocked(auth).mockResolvedValue({
    user: mockUser,
    expires: "2099-01-01",
  } as any)
}

function mockBoardMember() {
  vi.mocked(db.boardMember.findUnique).mockResolvedValue(mockMember as any)
}

describe("POST /api/boards/[boardId]/columns", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession()
    mockBoardMember()
  })

  it("tạo column mới thành công", async () => {
    const mockColumn = {
      id: "col-1",
      boardId: "board-1",
      name: "To Do",
      order: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    vi.mocked(db.column.findFirst).mockResolvedValue(null)
    vi.mocked(db.column.create).mockResolvedValue(mockColumn as any)
    vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

    const req = new Request("http://localhost/api/boards/board-1/columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "To Do" }),
    })

    const response = await POST(req as any, { params: { boardId: "board-1" } })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.name).toBe("To Do")
  })

  it("từ chối name trống", async () => {
    const req = new Request("http://localhost/api/boards/board-1/columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    })

    const response = await POST(req as any, { params: { boardId: "board-1" } })
    expect(response.status).toBe(400)
  })
})

describe("PATCH /api/boards/[boardId]/columns/[columnId]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession()
    mockBoardMember()
  })

  it("đổi tên column thành công", async () => {
    const mockColumn = {
      id: "col-1",
      boardId: "board-1",
      name: "In Progress",
      order: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    vi.mocked(db.column.findUnique).mockResolvedValue(mockColumn as any)
    vi.mocked(db.column.update).mockResolvedValue({
      ...mockColumn,
      name: "In Progress",
    } as any)
    vi.mocked(db.$transaction).mockImplementation(async (cb) => {
      return cb(db as any)
    })
    vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

    const req = new Request("http://localhost/api/boards/board-1/columns/col-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "In Progress" }),
    })

    const response = await PATCH(req as any, {
      params: { boardId: "board-1", columnId: "col-1" },
    })

    expect(response.status).toBe(200)
  })
})

describe("DELETE /api/boards/[boardId]/columns/[columnId]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession()
    mockBoardMember()
  })

  it("từ chối xóa column có cards nếu không có ?confirm=true", async () => {
    const mockColumn = {
      id: "col-1",
      boardId: "board-1",
      name: "To Do",
      order: 1000,
    }
    vi.mocked(db.column.findUnique).mockResolvedValue(mockColumn as any)
    vi.mocked(db.card.count).mockResolvedValue(3) // 3 cards

    const req = new Request(
      "http://localhost/api/boards/board-1/columns/col-1",
      { method: "DELETE" }
    )

    const response = await DELETE(req as any, {
      params: { boardId: "board-1", columnId: "col-1" },
    })

    expect(response.status).toBe(409)
  })

  it("xóa column rỗng thành công", async () => {
    const mockColumn = {
      id: "col-1",
      boardId: "board-1",
      name: "Empty",
      order: 1000,
    }
    vi.mocked(db.column.findUnique).mockResolvedValue(mockColumn as any)
    vi.mocked(db.card.count).mockResolvedValue(0) // no cards
    vi.mocked(db.$transaction).mockImplementation(async (cb) => {
      return cb(db as any)
    })
    vi.mocked(db.column.delete).mockResolvedValue(mockColumn as any)
    vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

    const req = new Request(
      "http://localhost/api/boards/board-1/columns/col-1",
      { method: "DELETE" }
    )

    const response = await DELETE(req as any, {
      params: { boardId: "board-1", columnId: "col-1" },
    })

    expect(response.status).toBe(200)
  })
})
