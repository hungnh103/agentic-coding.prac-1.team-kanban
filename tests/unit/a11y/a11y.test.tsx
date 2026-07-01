import { run } from "axe-core"
import { render } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BoardPageClient } from "@/app/boards/[boardId]/BoardPageClient"
import { describe, expect, it } from "vitest"

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

describe("Accessibility", () => {
  it("Board page should have no axe violations", async () => {
    const board = {
      id: "board-1",
      name: "Test Board",
      description: "Board test",
      owner: { id: "user-1", name: "Nguyễn", avatarUrl: null },
      members: [
        {
          userId: "user-1",
          role: "OWNER",
          user: { id: "user-1", name: "Nguyễn", avatarUrl: null },
        },
      ],
      columns: [],
    }

    const queryClient = createQueryClient()
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <BoardPageClient
          initialBoard={board as any}
          currentUser={{ id: "user-1", role: "OWNER" as any }}
        />
      </QueryClientProvider>
    )

    const results = await run(container)
    expect(results.violations).toHaveLength(0)
  })
})
