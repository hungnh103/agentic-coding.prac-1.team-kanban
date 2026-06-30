import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Prisma client
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn(),
  },
}))

import { db } from "@/lib/db"
import { POST } from "@/app/api/auth/register/route"

function createRequest(body: object) {
  return new Request("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("đăng ký thành công với dữ liệu hợp lệ", async () => {
    const mockUser = {
      id: "user-1",
      name: "Nguyễn Văn A",
      email: "test@example.com",
      createdAt: new Date(),
    }
    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    vi.mocked(db.user.create).mockResolvedValue(mockUser as any)

    const req = createRequest({
      name: "Nguyễn Văn A",
      email: "test@example.com",
      password: "password123",
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.email).toBe("test@example.com")
    expect(data).not.toHaveProperty("passwordHash")
  })

  it("từ chối email trùng lặp với 409", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "existing-user",
      email: "test@example.com",
    } as any)

    const req = createRequest({
      name: "Nguyễn Văn B",
      email: "test@example.com",
      password: "password123",
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toContain("đã được sử dụng")
  })

  it("từ chối email không hợp lệ với 400", async () => {
    const req = createRequest({
      name: "Nguyễn Văn C",
      email: "not-an-email",
      password: "password123",
    })

    const response = await POST(req as any)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain("email")
  })

  it("từ chối thiếu tên với 400", async () => {
    const req = createRequest({
      email: "test2@example.com",
      password: "password123",
    })

    const response = await POST(req as any)
    expect(response.status).toBe(400)
  })

  it("từ chối mật khẩu ngắn hơn 8 ký tự với 400", async () => {
    const req = createRequest({
      name: "Nguyễn Văn D",
      email: "test3@example.com",
      password: "short",
    })

    const response = await POST(req as any)
    expect(response.status).toBe(400)
  })
})
