import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock db và auth cho integration tests
vi.mock("@/lib/db", () => ({
  db: {
    board: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    boardMember: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
  },
}))

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { GET, POST } from "@/app/api/boards/route"

const mockUser = { id: "user-1", name: "Test User", email: "test@example.com" }

function mockSession() {
  vi.mocked(auth).mockResolvedValue({
    user: mockUser,
    expires: "2099-01-01",
  } as any)
}

describe("GET /api/boards", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession()
  })

  it("trả về danh sách boards của user", async () => {
    const mockBoards = [
      {
        id: "board-1",
        name: "Board 1",
        description: null,
        ownerId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: mockUser,
        members: [{ role: "OWNER", userId: "user-1", user: mockUser }],
        _count: { members: 1, columns: 0 },
        myRole: "OWNER",
      },
    ]
    vi.mocked(db.board.findMany).mockResolvedValue(mockBoards as any)

    const req = new Request("http://localhost:3000/api/boards")
    const response = await GET(req as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })

  it("trả về 401 nếu không xác thực", async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const req = new Request("http://localhost:3000/api/boards")
    const response = await GET(req as any)

    expect(response.status).toBe(401)
  })
})

describe("POST /api/boards", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession()
  })

  it("tạo board mới thành công", async () => {
    const mockBoard = {
      id: "board-2",
      name: "New Board",
      description: null,
      ownerId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    vi.mocked(db.board.create).mockResolvedValue(mockBoard as any)

    const req = new Request("http://localhost:3000/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Board" }),
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.name).toBe("New Board")
  })

  it("từ chối name trống với 400", async () => {
    const req = new Request("http://localhost:3000/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    })

    const response = await POST(req as any)
    expect(response.status).toBe(400)
  })
})
