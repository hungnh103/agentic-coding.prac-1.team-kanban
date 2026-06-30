import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/db", () => ({
  db: {
    card: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    boardMember: {
      findUnique: vi.fn(),
    },
    comment: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
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
import { PATCH } from "@/app/api/boards/[boardId]/cards/[cardId]/route"
import { POST } from "@/app/api/boards/[boardId]/cards/[cardId]/comments/route"
import { DELETE } from "@/app/api/boards/[boardId]/cards/[cardId]/comments/[commentId]/route"

const mockUser = { id: "user-1", name: "Test", email: "test@test.com" }
const mockMember = { boardId: "board-1", userId: "user-1", role: "OWNER" }

function mockSession(userId = "user-1") {
  vi.mocked(auth).mockResolvedValue({
    user: { ...mockUser, id: userId },
    expires: "2099-01-01",
  } as any)
}

describe("Card Assignment (US4)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSession()
    vi.mocked(db.boardMember.findUnique).mockResolvedValue(mockMember as any)
  })

  it("assign card cho board member thành công", async () => {
    const mockCard = {
      id: "card-1",
      boardId: "board-1",
      title: "Test",
      assigneeId: null,
    }
    vi.mocked(db.card.findUnique).mockResolvedValue(mockCard as any)
    // Mock assignee check - second call for assigneeId validation
    vi.mocked(db.boardMember.findUnique)
      .mockResolvedValueOnce(mockMember as any) // first: auth check
      .mockResolvedValueOnce({ boardId: "board-1", userId: "user-2", role: "MEMBER" } as any) // second: assignee check

    vi.mocked(db.$transaction).mockImplementation(async (cb) => cb(db as any))
    vi.mocked(db.card.update).mockResolvedValue({ ...mockCard, assigneeId: "user-2" } as any)
    vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

    const req = new Request("http://localhost/api/boards/board-1/cards/card-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId: "user-2" }),
    })

    const response = await PATCH(req as any, {
      params: { boardId: "board-1", cardId: "card-1" },
    })

    expect(response.status).toBe(200)
  })

  it("từ chối assign người không phải board member với 400", async () => {
    const mockCard = { id: "card-1", boardId: "board-1", title: "Test", assigneeId: null }
    vi.mocked(db.card.findUnique).mockResolvedValue(mockCard as any)
    vi.mocked(db.boardMember.findUnique)
      .mockResolvedValueOnce(mockMember as any) // auth check
      .mockResolvedValueOnce(null) // assignee NOT a member

    const req = new Request("http://localhost/api/boards/board-1/cards/card-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId: "outsider-user" }),
    })

    const response = await PATCH(req as any, {
      params: { boardId: "board-1", cardId: "card-1" },
    })

    expect(response.status).toBe(400)
  })
})

describe("Comments (US4)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("POST comment thành công", async () => {
    mockSession("user-1")
    vi.mocked(db.boardMember.findUnique).mockResolvedValue(mockMember as any)
    vi.mocked(db.card.findUnique).mockResolvedValue({ id: "card-1", boardId: "board-1", title: "Test" } as any)
    vi.mocked(db.$transaction).mockImplementation(async (cb) => cb(db as any))
    vi.mocked(db.comment.create).mockResolvedValue({
      id: "comment-1",
      cardId: "card-1",
      authorId: "user-1",
      content: "Great work!",
      createdAt: new Date(),
      updatedAt: new Date(),
      author: mockUser,
    } as any)
    vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

    const req = new Request("http://localhost/api/boards/board-1/cards/card-1/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Great work!" }),
    })

    const response = await POST(req as any, {
      params: { boardId: "board-1", cardId: "card-1" },
    })

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.content).toBe("Great work!")
  })

  it("DELETE own comment thành công", async () => {
    mockSession("user-1")
    vi.mocked(db.boardMember.findUnique).mockResolvedValue(mockMember as any)
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "comment-1",
      cardId: "card-1",
      authorId: "user-1", // same as session user
      content: "My comment",
      card: { title: "Test" },
    } as any)
    vi.mocked(db.$transaction).mockImplementation(async (cb) => cb(db as any))
    vi.mocked(db.comment.delete).mockResolvedValue({} as any)
    vi.mocked(db.activityLog.create).mockResolvedValue({} as any)

    const req = new Request(
      "http://localhost/api/boards/board-1/cards/card-1/comments/comment-1",
      { method: "DELETE" }
    )

    const response = await DELETE(req as any, {
      params: { boardId: "board-1", cardId: "card-1", commentId: "comment-1" },
    })

    expect(response.status).toBe(200)
  })

  it("từ chối DELETE comment của người khác với 403", async () => {
    mockSession("user-2") // different user
    vi.mocked(db.boardMember.findUnique).mockResolvedValue({
      boardId: "board-1",
      userId: "user-2",
      role: "MEMBER",
    } as any)
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "comment-1",
      cardId: "card-1",
      authorId: "user-1", // owned by user-1
      content: "Original author's comment",
      card: { title: "Test" },
    } as any)

    const req = new Request(
      "http://localhost/api/boards/board-1/cards/card-1/comments/comment-1",
      { method: "DELETE" }
    )

    const response = await DELETE(req as any, {
      params: { boardId: "board-1", cardId: "card-1", commentId: "comment-1" },
    })

    expect(response.status).toBe(403)
  })
})
