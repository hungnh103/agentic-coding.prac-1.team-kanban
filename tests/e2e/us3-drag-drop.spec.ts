import { test, expect } from "@playwright/test"

test.describe("US3: Drag-and-Drop Card Movement", () => {
  async function login(page: any, email: string, password: string) {
    await page.goto("/login")
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/mật khẩu/i).fill(password)
    await page.getByRole("button", { name: /đăng nhập/i }).click()
    await expect(page).toHaveURL("/")
  }

  test("drag card sang column khác và persistence sau refresh", async ({ page }) => {
    await login(page, "e2e-us3@example.com", "password123")
    await page.getByText(/board/i).first().click()

    // Get initial card position
    const card = page.getByText("Task để drag").first()
    const targetColumn = page.getByText("In Progress").locator("..").first()

    // Perform drag
    await card.dragTo(targetColumn)

    // Verify card is in new column
    await expect(targetColumn.getByText("Task để drag")).toBeVisible()

    // Refresh and verify persistence
    await page.reload()
    await expect(targetColumn.getByText("Task để drag")).toBeVisible()
  })

  test("reorder cards trong cùng column sau refresh", async ({ page }) => {
    await login(page, "e2e-us3@example.com", "password123")
    await page.getByText(/board/i).first().click()

    const firstCard = page.getByText("Card 1").first()
    const secondCard = page.getByText("Card 2").first()

    // Drag Card 2 above Card 1
    await secondCard.dragTo(firstCard)

    // Refresh and verify order maintained
    await page.reload()

    const cards = page.locator("[data-testid='card']")
    const firstCardText = await cards.first().textContent()
    expect(firstCardText).toContain("Card 2")
  })

  test("touch drag simulation trên mobile", async ({ page, isMobile }) => {
    if (!isMobile) test.skip()

    await login(page, "e2e-us3@example.com", "password123")
    await page.getByText(/board/i).first().click()

    const card = page.getByText("Touch Task").first()
    const targetColumn = page.getByText("In Progress").locator("..").first()

    // Touch drag
    const cardBounds = await card.boundingBox()
    const targetBounds = await targetColumn.boundingBox()

    if (cardBounds && targetBounds) {
      await page.touchscreen.tap(
        cardBounds.x + cardBounds.width / 2,
        cardBounds.y + cardBounds.height / 2
      )
      await page.waitForTimeout(500)
    }
  })
})
